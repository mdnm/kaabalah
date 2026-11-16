import { id, KaabalahTypes } from '../core';
import type { IChingReading } from '../iching';
import { getDomicileRuler, type Sign } from '../astrology/dignity';
import { getTarotCorrespondenceProfile } from '../tarot';

/**
 * Combine tarot, I Ching and chart connections on one Tree.
 * Every address a card or a trigram touches counts once; the chart adds only the planet
 * of the subconscious card's sphere. Sign, element and planet matches with the chart and
 * with today's sky become threads, never Tree weight.
 */

export const TREE_ORDER = [
  id(KaabalahTypes.SPHERE, 'Kether'),
  id(KaabalahTypes.SPHERE, 'Chokhmah'),
  id(KaabalahTypes.SPHERE, 'Binah'),
  id(KaabalahTypes.SPHERE, 'Daath'),
  id(KaabalahTypes.SPHERE, 'Chesed'),
  id(KaabalahTypes.SPHERE, 'Geburah'),
  id(KaabalahTypes.SPHERE, 'Tiphareth'),
  id(KaabalahTypes.SPHERE, 'Netzach'),
  id(KaabalahTypes.SPHERE, 'Hod'),
  id(KaabalahTypes.SPHERE, 'Yesod'),
  id(KaabalahTypes.SPHERE, 'Malkuth'),
] as const;

const DAATH = id(KaabalahTypes.SPHERE, 'Daath');
/** A pip's rank is its sphere's place on the way down (no pip sits at Daath). */
const RUNGS = TREE_ORDER.filter((id) => id !== DAATH);
const SUIT_ELEMENT: Record<string, string> = { wands: 'Fire', cups: 'Water', swords: 'Air', pentacles: 'Earth' };
const SIGN_ELEMENT: Record<string, string> = {
  Aries: 'Fire',
  Leo: 'Fire',
  Sagittarius: 'Fire',
  Taurus: 'Earth',
  Virgo: 'Earth',
  Capricorn: 'Earth',
  Gemini: 'Air',
  Libra: 'Air',
  Aquarius: 'Air',
  Cancer: 'Water',
  Scorpio: 'Water',
  Pisces: 'Water',
};
export const PLANET_KEYS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'] as const;

export type CardSlot = 'conscious' | 'unconscious' | 'subconscious';

export type ReadingCard = {
  slot: CardSlot | null;
  number: number;
  name: string;
  kind: 'major' | 'court' | 'minor';
  /** Major: its path. */
  path?: { number: number; letter: string; from: string; to: string };
  /** Major: what its path carries, the first of sign, element, planet. */
  tag?: { type: 'sign' | 'element' | 'planet'; value: string };
  /** Pip: its sphere, that sphere's planet, its step from 1 to 10. */
  sphere?: string;
  planet?: string;
  rank?: number;
  /** Court: its sign (a page has none). */
  sign?: string;
  /** Pip and court: the suit and its element; a court's rank. */
  suit?: string;
  courtRank?: string;
  element?: string;
};

const TAG_TYPE = { westernZodiacSign: 'sign', westernElement: 'element', planet: 'planet' } as const;

type Node = { id: string; label: string };
/** The union kaabalah returns per card kind, read loosely: each kind fills its own fields. */
type LooseCorrespondences = {
  astrology?: { type: string; label: string }[];
  path?: { pathNumber: number; hebrewLetter: Node; fromSphere: Node; toSphere: Node };
  sphere?: Node;
  planets?: Node[];
  sign?: Node;
};

export function resolveCard(cardNumber: number, slot: string | null): ReadingCard | null {
  const profile = getTarotCorrespondenceProfile({ tarotCardNumber: cardNumber });
  if (!profile) return null;
  const correspondences = profile.correspondences as LooseCorrespondences;
  const base = {
    slot: slot === 'conscious' || slot === 'unconscious' || slot === 'subconscious' ? (slot as CardSlot) : null,
    number: cardNumber,
    name: profile.tarotCardName,
  };
  if (profile.kind === 'major') {
    const path = correspondences.path;
    const carried = (['westernZodiacSign', 'westernElement', 'planet'] as const)
      .map((type) => correspondences.astrology?.find((entry) => entry.type === type))
      .find(Boolean);
    return {
      ...base,
      kind: 'major',
      path: path
        ? { number: path.pathNumber, letter: path.hebrewLetter.label, from: path.fromSphere.id, to: path.toSphere.id }
        : undefined,
      tag: carried ? { type: TAG_TYPE[carried.type as keyof typeof TAG_TYPE], value: carried.label } : undefined,
    };
  }
  const suit = 'suit' in profile ? (profile.suit as string | undefined) : undefined;
  const element = suit ? SUIT_ELEMENT[suit] : undefined;
  if (profile.kind === 'minor') {
    const sphere = correspondences.sphere?.id;
    const rank = sphere ? RUNGS.indexOf(sphere as (typeof RUNGS)[number]) + 1 : 0;
    return {
      ...base,
      kind: 'minor',
      suit,
      sphere,
      planet: correspondences.planets?.[0]?.label,
      rank: rank > 0 ? rank : undefined,
      element,
    };
  }
  const courtRank = 'courtRank' in profile ? (profile.courtRank as string | undefined) : undefined;
  return { ...base, kind: 'court', suit, courtRank, sign: correspondences.sign?.label, element };
}

export type ChartAspect = { a: string; b: string; aspect: string };

/**
 * A chart as a reading uses it: signs by planet key (sun to pluto), the major aspects
 * between those planets and, where the chart has a place and an hour, the ascendant and
 * each planet's house. A reading stands on three of them:
 * - the birth chart, read whole (signs, houses, ascendant, aspects);
 * - the horary chart, cast for the moment the question was asked: signs and aspects
 *   always, houses and ascendant only when the person set where they were;
 * - the day chart, for the day the reading is about (tomorrow, when casting tonight for
 *   tomorrow): signs and aspects only, since the rising turns through the whole day.
 */
export type Natal = {
  planets: Record<string, string>;
  ascendant: string | null;
  houses?: Record<string, number>;
  /** Signs on the numbered chart cusps; absent when place or hour is unknown. */
  houseSigns?: Record<number, string>;
  aspects?: ChartAspect[];
};
export type Sky = Natal;

const MAJOR_ASPECTS = new Set(['conjunction', 'opposition', 'square', 'trine', 'sextile']);

/** A kaabalah chart reduced to what a reading uses. `houses` is false for a chart with no place or hour. */
export function projectChart(
  chart: {
    planets: Record<string, { zodiacPosition?: { sign?: string; house?: number } } | undefined>;
    houses?: { ascendant?: { sign?: string }; houses?: { sign?: string }[] };
    aspects?: { planetA: string; planetB: string; aspect: string }[];
  },
  options: { houses: boolean },
): Natal {
  const known = new Set<string>(PLANET_KEYS);
  const planets: Record<string, string> = {};
  const houses: Record<string, number> = {};
  for (const [name, planet] of Object.entries(chart.planets)) {
    const key = name.toLowerCase();
    const position = planet?.zodiacPosition;
    if (!known.has(key) || !position?.sign) continue;
    planets[key] = position.sign;
    if (options.houses && typeof position.house === 'number') houses[key] = position.house;
  }
  const houseSigns: Record<number, string> = {};
  if (options.houses) {
    for (const [index, cusp] of (chart.houses?.houses ?? []).slice(0, 12).entries()) {
      if (cusp.sign) houseSigns[index + 1] = cusp.sign;
    }
  }
  const aspects = (chart.aspects ?? [])
    .map((edge) => ({ a: edge.planetA.toLowerCase(), b: edge.planetB.toLowerCase(), aspect: edge.aspect }))
    .filter((edge) => MAJOR_ASPECTS.has(edge.aspect) && known.has(edge.a) && known.has(edge.b));
  return {
    planets,
    ascendant: options.houses ? (chart.houses?.ascendant?.sign ?? null) : null,
    ...(options.houses ? { houses } : {}),
    ...(Object.keys(houseSigns).length > 0 ? { houseSigns } : {}),
    aspects,
  };
}

export type HitSystem = 'cards' | 'iching' | 'chart' | 'sky' | 'day' | 'you';

export type Hit = {
  system: HitSystem;
  key:
    | 'majorFrom'
    | 'majorTo'
    | 'pipHome'
    | 'trigramFrom'
    | 'trigramTo'
    | 'pipPlanet'
    | 'majorSign'
    | 'signHouse'
    | 'signRuler'
    | 'rulerCard'
    | 'rulerPlacement'
    | 'majorElement'
    | 'majorPlanet'
    | 'pipAlsoPlanet'
    | 'natalInSign'
    | 'natalInElement'
    | 'skyInElement'
    | 'dayInElement'
    | 'natalPlanet'
    | 'courtSign'
    | 'natalHas'
    | 'natalNone'
    | 'skyIn'
    | 'skyPlanet'
    | 'pipIsPlanet'
    | 'dayIn'
    | 'dayPlanet'
    | 'aspects'
    | 'sovereign'
    | 'birthday';
  card?: ReadingCard;
  trigram?: string;
  letter?: string;
  path?: number;
  sphere?: string;
  planet?: string;
  sign?: string;
  /** The major's sign when `sign` holds the ruler's actual chart placement. */
  viaSign?: string;
  /** Explicit authority for ruler context, distinct from Kaabalah correspondences. */
  rulership?: 'traditional';
  element?: string;
  /** Planet keys, in chart order. */
  planets?: string[];
  placements?: { planet: string; sign: string }[];
  ascendant?: boolean;
  /** The planet's house, in a chart that has houses. */
  house?: number;
  /** What the planet touches in its chart: the other planet and the aspect. */
  aspects?: { other: string; aspect: string }[];
  /** The pip's planet shares its sign with one of the person's lights. */
  same?: 'sun' | 'moon' | 'ascendant' | null;
  hexagram?: number;
  window?: { start: { month: number; day: number }; end: { month: number; day: number } };
};

export type ReadingWeights = {
  spheres: Map<string, { count: number; hits: Hit[] }>;
  paths: Map<string, number>;
  top: string | null;
};

export type ReadingInput = {
  cards: ReadingCard[];
  iching: IChingReading | null;
  natal: Natal | null;
  /** Houses explicitly selected for the question by the caller; never inferred from prose. */
  selectedHouses?: readonly number[];
};

const planetKey = (label: string) => label.toLowerCase();

export function buildReadingWeights({ cards, iching, natal }: ReadingInput): ReadingWeights {
  const spheres = new Map<string, { count: number; hits: Hit[] }>();
  const paths = new Map<string, number>();
  const hit = (sphere: string, entry: Hit) => {
    // Every court lives at Daath, so Daath says nothing about this reading.
    if (sphere === DAATH) return;
    const current = spheres.get(sphere) ?? { count: 0, hits: [] };
    current.count += 1;
    current.hits.push(entry);
    spheres.set(sphere, current);
  };
  const walk = (path: number) => paths.set(id(KaabalahTypes.PATH, path), (paths.get(id(KaabalahTypes.PATH, path)) ?? 0) + 1);

  for (const card of cards) {
    if (card.kind === 'major' && card.path) {
      walk(card.path.number);
      hit(card.path.from, { system: 'cards', key: 'majorFrom', card, path: card.path.number });
      hit(card.path.to, { system: 'cards', key: 'majorTo', card, path: card.path.number });
    } else if (card.kind === 'minor' && card.sphere) {
      hit(card.sphere, { system: 'cards', key: 'pipHome', card, sphere: card.sphere, element: card.element });
    }
  }

  if (iching) {
    const states = [iching.cast, iching.transformed].filter((state): state is NonNullable<typeof state> => state !== null);
    for (const state of states) {
      for (const gate of [state.kaabalah.gate.upper, state.kaabalah.gate.lower]) {
        const shared = { system: 'iching' as const, trigram: gate.trigram.id, letter: gate.letter.name, path: gate.path.number };
        walk(gate.path.number);
        hit(gate.path.from.id, { ...shared, key: 'trigramFrom' });
        hit(gate.path.to.id, { ...shared, key: 'trigramTo' });
      }
    }
  }

  const subconscious = cards.find((card) => card.slot === 'subconscious');
  if (natal && subconscious?.kind === 'minor' && subconscious.sphere && subconscious.planet) {
    const key = planetKey(subconscious.planet);
    const sign = natal.planets[key];
    if (sign) {
      const same =
        key !== 'sun' && sign === natal.planets.sun
          ? 'sun'
          : key !== 'moon' && sign === natal.planets.moon
            ? 'moon'
            : sign === natal.ascendant
              ? 'ascendant'
              : null;
      hit(subconscious.sphere, { system: 'chart', key: 'pipPlanet', planet: key, sign, same, house: natal.houses?.[key] });
    }
  }

  // The most-hit sphere; on a tie, the one higher on the Tree.
  let top: string | null = null;
  let max = 0;
  for (const id of TREE_ORDER) {
    const count = spheres.get(id)?.count ?? 0;
    if (count > max) {
      max = count;
      top = id;
    }
  }
  return { spheres, paths, top };
}

/** Spheres by weight, heaviest first; ties keep the Tree's order. */
export function rankedSpheres(weights: ReadingWeights) {
  return TREE_ORDER.filter((id) => weights.spheres.has(id))
    .map((id) => ({ id, ...weights.spheres.get(id)! }))
    .sort((left, right) => right.count - left.count);
}

/** Contextual priority is separate from the number of oracle addresses on the Tree. */
export type ReadingRelevance = {
  weight: 1 | 2;
  selectedForQuestion: boolean;
  requiresHumanReview: true;
};

/** `detail` rows (aspects and review context) belong to the detailed view only. */
export type CountedHit = { hit: Hit; count: number; detail?: boolean; relevance?: ReadingRelevance };

const hitId = (hit: Hit) =>
  [hit.system, hit.key, hit.card?.number, hit.trigram, hit.path, hit.sphere, hit.planet, hit.sign, hit.house, hit.viaSign, hit.rulership].join('|');

/** The same sentence said twice is said once, with how many times. */
export function collapseHits(hits: Hit[]): CountedHit[] {
  const seen = new Map<string, CountedHit>();
  for (const hit of hits) {
    const id = hitId(hit);
    const entry = seen.get(id);
    if (entry) entry.count += 1;
    else seen.set(id, { hit, count: 1 });
  }
  return [...seen.values()];
}

export type ThreadTitle =
  | { kind: 'top'; sphere: string }
  | { kind: 'sign' | 'element' | 'planet'; value: string }
  | { kind: 'window'; window: NonNullable<Hit['window']> };

export type Thread = { id: string; title: ThreadTitle; rows: CountedHit[] };

const one = (hit: Hit): CountedHit => ({ hit, count: 1 });

function inWindow(month: number, day: number, window: NonNullable<Hit['window']>) {
  const value = month * 100 + day;
  const start = window.start.month * 100 + window.start.day;
  const end = window.end.month * 100 + window.end.day;
  return start <= end ? value >= start && value <= end : value >= start || value <= end;
}

/**
 * Why the pieces talk: the top sphere first, then each card against the three charts that
 * belong to the reading. The birth chart says what the person carries; the sky of the
 * moment they asked (the horary side) says what the question was asked under. The
 * conscious card speaks by what its path carries, the unconscious by its sign, the
 * subconscious by its sphere's planet. Last, a sovereign hexagram whose month holds the
 * person's birthday.
 */
export function buildThreads(
  input: ReadingInput & { sky: Sky | null; day?: Sky | null; birthday: { month: number; day: number } | null },
  weights: ReadingWeights,
): Thread[] {
  const { cards, iching, natal, sky, birthday } = input;
  // A date has no single rising or house frame, even if a caller supplies one.
  const day = input.day ? { planets: input.day.planets, aspects: input.day.aspects, ascendant: null } : null;
  const threads: Thread[] = [];

  if (weights.top) {
    threads.push({
      id: 'top',
      title: { kind: 'top', sphere: weights.top },
      rows: collapseHits(weights.spheres.get(weights.top)?.hits ?? []),
    });
  }

  const natalPlanets = natal ? PLANET_KEYS.filter((key) => natal.planets[key]) : [];
  const conscious = cards.find((card) => card.slot === 'conscious');
  const unconscious = cards.find((card) => card.slot === 'unconscious');
  const subconscious = cards.find((card) => card.slot === 'subconscious');

  const inSign = (chart: Sky | null, system: 'sky' | 'day', key: 'skyIn' | 'dayIn', sign: string): Hit | null => {
    if (!chart) return null;
    const planets = PLANET_KEYS.filter((planet) => chart.planets[planet] === sign);
    const ascendant = chart.ascendant === sign;
    return planets.length > 0 || ascendant ? { system, key, sign, planets, ascendant } : null;
  };
  /** What stood in a sign when the question was asked, and on the day it is about when that differs. */
  const skyIn = (sign: string): CountedHit[] => {
    const asked = inSign(sky, 'sky', 'skyIn', sign);
    const onDay = inSign(day, 'day', 'dayIn', sign);
    const same = asked && onDay && asked.planets?.join() === onDay.planets?.join();
    return [asked, same ? null : onDay].flatMap((hit) => (hit ? [one(hit)] : []));
  };
  /** What a planet touches in one chart: detail, for the detailed view. */
  const aspectsOf = (chart: Sky | null, system: 'chart' | 'sky' | 'day', planet: string): CountedHit[] => {
    const aspects = (chart?.aspects ?? [])
      .filter((edge) => edge.a === planet || edge.b === planet)
      .map((edge) => ({ other: edge.a === planet ? edge.b : edge.a, aspect: edge.aspect }));
    return aspects.length > 0 ? [{ hit: { system, key: 'aspects', planet, aspects }, count: 1, detail: true }] : [];
  };
  const sameAspects = (left: CountedHit[], right: CountedHit[]) =>
    JSON.stringify(left[0]?.hit.aspects ?? null) === JSON.stringify(right[0]?.hit.aspects ?? null);
  /** A planet in the birth chart: its sign and house, and what it touches there. */
  const natalPlanet = (key: string): CountedHit[] =>
    natal?.planets[key]
      ? [
          one({ system: 'chart', key: 'natalPlanet', planet: key, sign: natal.planets[key], house: natal.houses?.[key] }),
          ...aspectsOf(natal, 'chart', key),
        ]
      : [];
  /** A planet when the question was asked, and on the day it is about when that differs. */
  const skyPlanet = (key: string): CountedHit[] => {
    const askedAspects = aspectsOf(sky, 'sky', key);
    const dayAspects = aspectsOf(day, 'day', key);
    return [
      ...(sky?.planets[key]
        ? [one({ system: 'sky', key: 'skyPlanet', planet: key, sign: sky.planets[key], house: sky.houses?.[key] })]
        : []),
      ...askedAspects,
      ...(day?.planets[key] && day.planets[key] !== sky?.planets[key]
        ? [one({ system: 'day', key: 'dayPlanet', planet: key, sign: day.planets[key] })]
        : []),
      ...(sameAspects(askedAspects, dayAspects) ? [] : dayAspects),
    ];
  };

  let consciousPlanet: string | null = null;
  if (conscious?.kind === 'major' && conscious.tag && conscious.path) {
    const { type, value } = conscious.tag;
    const shared = { system: 'cards' as const, card: conscious, path: conscious.path.number, letter: conscious.path.letter };
    let title: ThreadTitle | null = null;
    const rows: CountedHit[] = [];
    if (type === 'sign') {
      title = { kind: 'sign', value };
      rows.push(one({ ...shared, key: 'majorSign', sign: value }));
      const planets = natal ? natalPlanets.filter((key) => natal.planets[key] === value) : [];
      if (planets.length > 0) rows.push(one({ system: 'chart', key: 'natalInSign', sign: value, planets }));
      rows.push(...skyIn(value));

      // Match actual cusps, never the natural-zodiac house associated with a sign.
      // The caller chooses question houses; priority is context, never extra Tree hits.
      const selected = new Set((input.selectedHouses ?? []).filter((house) => Number.isInteger(house) && house >= 1 && house <= 12));
      const context = (hit: Hit, selectedForQuestion = false): CountedHit => ({
        hit, count: 1, detail: true,
        relevance: { weight: selectedForQuestion ? 2 : 1, selectedForQuestion, requiresHumanReview: true },
      });
      const ruler = getDomicileRuler(value as Sign)?.toLowerCase();
      const houses: CountedHit[] = [];
      for (const [chart, system] of [[natal, 'chart'], [sky, 'sky']] as const) {
        for (const [number, sign] of Object.entries(chart?.houseSigns ?? {})) {
          const house = Number(number);
          if (sign !== value || !Number.isInteger(house) || house < 1 || house > 12) continue;
          houses.push(context({ system, key: 'signHouse', sign: value, house, planet: ruler, rulership: ruler ? 'traditional' : undefined }, selected.has(house)));
        }
      }
      houses.sort((left, right) => right.relevance!.weight - left.relevance!.weight);
      rows.push(...houses);

      // Rulership is a factual route to inspect, not a claim that it answers the question.
      // Use the library's explicit traditional domicile table, not general graph links.
      if (ruler) {
        rows.push(context({ ...shared, key: 'signRuler', sign: value, planet: ruler, rulership: 'traditional' }));
        for (const card of cards) {
          const carriesRuler = card.kind === 'minor' ? card.planet?.toLowerCase() === ruler
            : card.kind === 'major' && card.tag?.type === 'planet' && card.tag.value.toLowerCase() === ruler;
          if (carriesRuler) rows.push(context({ system: 'cards', key: 'rulerCard', card, sphere: card.sphere, sign: value, planet: ruler, rulership: 'traditional' }));
        }
        for (const [chart, system] of [[natal, 'chart'], [sky, 'sky'], [day, 'day']] as const) {
          const sign = chart?.planets[ruler];
          if (!sign) continue;
          rows.push(context({ system, key: 'rulerPlacement', planet: ruler, sign, viaSign: value,
            house: chart && 'houses' in chart ? chart.houses?.[ruler] : undefined, rulership: 'traditional',
            aspects: (chart?.aspects ?? []).filter((edge) => edge.a === ruler || edge.b === ruler)
              .map((edge) => ({ other: edge.a === ruler ? edge.b : edge.a, aspect: edge.aspect })),
          }));
        }
      }
    } else if (type === 'element') {
      title = { kind: 'element', value };
      rows.push(one({ ...shared, key: 'majorElement', element: value }));
      const placements = natal
        ? natalPlanets.filter((key) => SIGN_ELEMENT[natal.planets[key]] === value).map((key) => ({ planet: key, sign: natal.planets[key] }))
        : [];
      if (placements.length > 0) rows.push(one({ system: 'chart', key: 'natalInElement', element: value, placements }));
      const inElement = (chart: Sky | null) => chart
        ? PLANET_KEYS.filter((key) => SIGN_ELEMENT[chart.planets[key]] === value)
          .map((key) => ({ planet: key, sign: chart.planets[key] }))
        : [];
      const asked = inElement(sky);
      const onDay = inElement(day);
      if (asked.length > 0) rows.push(one({ system: 'sky', key: 'skyInElement', element: value, placements: asked }));
      if (onDay.length > 0 && JSON.stringify(asked) !== JSON.stringify(onDay)) {
        rows.push(one({ system: 'day', key: 'dayInElement', element: value, placements: onDay }));
      }
    } else {
      const key = planetKey(value);
      consciousPlanet = key;
      title = { kind: 'planet', value: key };
      rows.push(one({ ...shared, key: 'majorPlanet', planet: key }));
      if (subconscious?.kind === 'minor' && subconscious.planet && planetKey(subconscious.planet) === key) {
        rows.push(one({ system: 'cards', key: 'pipAlsoPlanet', card: subconscious, sphere: subconscious.sphere, planet: key }));
      }
      rows.push(...natalPlanet(key), ...skyPlanet(key));
    }
    // Review context remains available even when no chart placement answers the major.
    if (title && rows.some((row) => row.hit.system !== 'cards' || row.relevance?.requiresHumanReview)) threads.push({ id: 'conscious', title, rows });
  }

  if (unconscious?.kind === 'court' && unconscious.sign && (natal || sky || day)) {
    const sign = unconscious.sign;
    const rows = [one({ system: 'cards', key: 'courtSign', card: unconscious, sign, element: unconscious.element })];
    if (natal) {
      const planets = natalPlanets.filter((key) => natal.planets[key] === sign);
      const ascendant = natal.ascendant === sign;
      rows.push(
        one(
          planets.length > 0 || ascendant
            ? { system: 'chart', key: 'natalHas', sign, planets, ascendant }
            : { system: 'chart', key: 'natalNone', sign },
        ),
      );
    }
    rows.push(...skyIn(sign));
    if (rows.length > 1) threads.push({ id: 'unconscious', title: { kind: 'sign', value: sign }, rows });
  }

  // The subconscious card points at its sphere's planet: where that planet stood when the
  // person asked. (Its natal place already sits in the sphere's own hits, as weight.)
  if (subconscious?.kind === 'minor' && subconscious.planet && subconscious.sphere) {
    const key = planetKey(subconscious.planet);
    const moment = key === consciousPlanet ? [] : [...aspectsOf(natal, 'chart', key), ...skyPlanet(key)];
    if (moment.length > 0) {
      threads.push({
        id: 'subconscious',
        title: { kind: 'planet', value: key },
        rows: [one({ system: 'cards', key: 'pipIsPlanet', card: subconscious, sphere: subconscious.sphere, planet: key }), ...moment],
      });
    }
  }

  if (iching && birthday) {
    const states = [iching.cast, iching.transformed].filter((state): state is NonNullable<typeof state> => state !== null);
    for (const state of states) {
      const window = state.sovereign?.approximateSolarWindow;
      if (!window || !inWindow(birthday.month, birthday.day, window)) continue;
      threads.push({
        id: `sovereign-${state.hexagram.number}`,
        title: { kind: 'window', window },
        rows: [
          one({ system: 'iching', key: 'sovereign', hexagram: state.hexagram.number, window }),
          one({ system: 'you', key: 'birthday' }),
        ],
      });
    }
  }

  return threads;
}
