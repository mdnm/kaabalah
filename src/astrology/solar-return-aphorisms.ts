import { DOMICILE_RULERS, EXALTATIONS, getDetriment, getFall } from './dignity';
import { findEclipses, type Eclipse } from './eclipses';
import { findHouseOf, type BirthChart } from './index';
import { ASTROLOGY_TIMING_DESCRIPTIONS, type SolarReturnAphorismId } from './timing-descriptions';

/**
 * Which of the 141 solar return aphorisms (`getSolarReturnAphorismDescription`) apply to a
 * person's year.
 *
 * Each aphorism's conditions are written in its text. This module turns each one's "if" clause
 * into a check on the natal chart (N) and the return chart (R). Qualifiers that only shade the
 * outcome ("especially if…", the person's circumstances) are not required: the text carries them.
 *
 * Synchronous. The two eclipse rules read the year's eclipses: pass them as `eclipses`, or they
 * are searched with `findEclipses`, which needs an initialised Swiss Ephemeris.
 *
 * Conventions:
 * - The ruler of the year (`Y`) is by default the annual profection lord: the traditional ruler of
 *   the sign as many signs past the natal Ascendant's as completed years at the return. These
 *   rules come mostly from Junctinus through Volguine, and Junctinus read solar returns with
 *   profections; the text also names "the annual first-house ruler" apart from "Saturn, ruler of
 *   the year", so they are two planets. `{ yearRuler: 'return-ascendant' }` takes the return
 *   Ascendant's ruler instead.
 * - The return's first-house ruler (`F`) is the traditional ruler of the return Ascendant's sign;
 *   the rules that say "the ruler of the first house" or "its ruler" read it.
 * - Aspects within a chart are the five Ptolemaic ones, with kaabalah's default orbs.
 * - A return point on a natal point is within 3 degrees.
 * - Houses are the charts' own (Placidus).
 * - The via combusta is the stretch this bank uses: the 18th degree of Gemini through the 2nd of
 *   Cancer, and the 24th degree of Sagittarius through the 2nd of Capricorn.
 * - The year's eclipses are those from this return up to the next one (a year of 365.2422 days).
 */

export type SolarReturnAphorismPlanet = 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn';
type ClassicalPlanet = SolarReturnAphorismPlanet;
type Point = ClassicalPlanet | 'asc' | 'mc' | 'node' | 'southNode';
type AspectKind = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
type Chart = BirthChart;
/** A check: true or false, or null when the chart cannot settle it (that aphorism is never shown). */
type Trigger = (facts: SolarReturnAphorismFacts) => boolean | null;

const CLASSICAL: readonly ClassicalPlanet[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
const MALEFICS: readonly ClassicalPlanet[] = ['saturn', 'mars'];
const BENEFICS: readonly ClassicalPlanet[] = ['jupiter', 'venus'];
const MOON_TO_SATURN: readonly ClassicalPlanet[] = ['moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;
const ANGULAR = [1, 4, 7, 10];
const SUCCEDENT = [2, 5, 8, 11];
const CADENT = [3, 6, 9, 12];
const ASPECTS: Record<AspectKind, { angle: number; orb: number }> = {
  conjunction: { angle: 0, orb: 8 },
  sextile: { angle: 60, orb: 5 },
  square: { angle: 90, orb: 6 },
  trine: { angle: 120, orb: 7 },
  opposition: { angle: 180, orb: 8 },
};
const PTOLEMAIC = Object.keys(ASPECTS) as AspectKind[];
const HARD: AspectKind[] = ['conjunction', 'square', 'opposition'];
const SQUARE_OPPOSITION: AspectKind[] = ['square', 'opposition'];
const SOFT: AspectKind[] = ['sextile', 'trine'];
const CROSS_ORB = 3;

const norm = (value: number) => ((value % 360) + 360) % 360;
const distance = (a: number, b: number) => {
  const d = norm(a - b);
  return d > 180 ? 360 - d : d;
};
const signOf = (longitude: number) => SIGNS[Math.floor(norm(longitude) / 30)];
const capitalized = (planet: ClassicalPlanet) => (planet.charAt(0).toUpperCase() + planet.slice(1)) as keyof typeof EXALTATIONS;
const lower = (planet: string) => planet.toLowerCase() as ClassicalPlanet;
const other = (malefic: ClassicalPlanet): ClassicalPlanet => (malefic === 'saturn' ? 'mars' : 'saturn');
const inViaCombusta = (longitude: number) => {
  const l = norm(longitude);
  return (l >= 77 && l < 92) || (l >= 263 && l < 272);
};
const isMasculine = (sign: string) => ['Aries', 'Gemini', 'Leo', 'Libra', 'Sagittarius', 'Aquarius'].includes(sign);

/** Which planet rules the year: the annual profection lord (default) or the return Ascendant's ruler. */
export type SolarReturnYearRuler = 'profection' | 'return-ascendant';

const YEAR_DAYS = 365.2422;

/** Completed years at the return: the return falls on the birthday, so the year count rounds. */
export function ageAtSolarReturn(natal: Chart, solarReturn: Chart): number {
  return Math.round((solarReturn.dateUtc.getTime() - natal.dateUtc.getTime()) / (YEAR_DAYS * 86_400_000));
}

/** Everything the checks read, from one natal chart and its solar return. */
export class SolarReturnAphorismFacts {
  /** The ruler of the year. */
  readonly Y: ClassicalPlanet;
  /** The return's first-house ruler. */
  readonly F: ClassicalPlanet;
  /** The natal first-house ruler. */
  readonly YN: ClassicalPlanet;

  constructor(
    readonly N: Chart,
    readonly R: Chart,
    yearRuler: SolarReturnYearRuler = 'profection',
    /** The eclipses from this return to the next. */
    readonly eclipses: readonly Eclipse[] = [],
  ) {
    this.F = this.rulerOf(R, 1);
    this.YN = this.rulerOf(N, 1);
    if (yearRuler === 'profection') {
      const natalSign = SIGNS.indexOf(this.cuspSign(N, 1) as (typeof SIGNS)[number]);
      const profected = SIGNS[(natalSign + ageAtSolarReturn(N, R)) % 12];
      this.Y = lower(DOMICILE_RULERS[profected]);
    } else {
      this.Y = this.F;
    }
  }

  /** The signs inside a house of R, from its cusp up to the next cusp. */
  signsInReturnHouse(house: number): string[] {
    const start = this.R.houses.houses[house - 1].longitude;
    const end = this.R.houses.houses[house % 12].longitude;
    const span = norm(end - start);
    const signs: string[] = [signOf(start)];
    for (let boundary = (Math.floor(norm(start) / 30) + 1) * 30; norm(boundary - start) < span; boundary += 30) {
      signs.push(signOf(boundary));
    }
    return signs;
  }

  lon(X: Chart, point: Point): number {
    switch (point) {
      case 'asc':
        return X.houses.ascendant.longitude;
      case 'mc':
        return X.houses.mc.longitude;
      case 'node':
        return X.planets['mean node'].longitude;
      case 'southNode':
        return norm(X.planets['mean node'].longitude + 180);
      default:
        return X.planets[point].longitude;
    }
  }
  sign(X: Chart, point: Point): string {
    return signOf(this.lon(X, point));
  }
  cusps(X: Chart): number[] {
    return X.houses.houses.map((cusp) => cusp.longitude);
  }
  cuspSign(X: Chart, house: number): string {
    return X.houses.houses[house - 1].sign;
  }
  /** House of a point in its own chart. */
  h(X: Chart, point: Point): number {
    return findHouseOf(this.lon(X, point), this.cusps(X));
  }
  /** House of a return point in the natal chart. */
  nh(point: Point | number): number {
    const longitude = typeof point === 'number' ? point : this.lon(this.R, point);
    return findHouseOf(longitude, this.cusps(this.N));
  }
  rulerOf(X: Chart, house: number): ClassicalPlanet {
    return lower(DOMICILE_RULERS[this.cuspSign(X, house) as keyof typeof DOMICILE_RULERS]);
  }
  /** The houses of R whose cusp is in `sign`; for an intercepted sign, the house holding its middle. */
  signHouses(sign: string): number[] {
    const houses = this.R.houses.houses.flatMap((cusp, index) => (cusp.sign === sign ? [index + 1] : []));
    if (houses.length > 0) return houses;
    const middle = SIGNS.indexOf(sign as (typeof SIGNS)[number]) * 30 + 15;
    return [findHouseOf(middle, this.cusps(this.R))];
  }

  asp(X: Chart, a: Point, b: Point, kinds: readonly AspectKind[] = PTOLEMAIC): boolean {
    if (a === b) return false;
    const d = distance(this.lon(X, a), this.lon(X, b));
    return kinds.some((kind) => Math.abs(d - ASPECTS[kind].angle) <= ASPECTS[kind].orb);
  }
  hard(X: Chart, a: Point, b: Point) {
    return this.asp(X, a, b, HARD);
  }
  isMalefic(point: Point) {
    return (MALEFICS as readonly string[]).includes(point);
  }
  isBenefic(point: Point) {
    return (BENEFICS as readonly string[]).includes(point);
  }
  adverse(X: Chart, a: Point, b: Point) {
    return (
      this.asp(X, a, b, SQUARE_OPPOSITION) ||
      ((this.isMalefic(a) || this.isMalefic(b)) && this.asp(X, a, b, ['conjunction']))
    );
  }
  favorable(X: Chart, a: Point, b: Point) {
    return (
      this.asp(X, a, b, SOFT) || ((this.isBenefic(a) || this.isBenefic(b)) && this.asp(X, a, b, ['conjunction']))
    );
  }
  noAspect(X: Chart, a: Point, b: Point) {
    return !this.asp(X, a, b);
  }
  /** Conjunction, square or opposition to a malefic other than itself. */
  afflicted(X: Chart, point: Point) {
    return MALEFICS.some((m) => m !== point && this.hard(X, point, m));
  }
  debilitated(X: Chart, planet: ClassicalPlanet) {
    const sign = this.sign(X, planet);
    const name = capitalized(planet);
    return (getDetriment(name) as string[]).includes(sign) || getFall(name) === sign;
  }
  dignified(X: Chart, planet: ClassicalPlanet) {
    const sign = this.sign(X, planet);
    return lower(DOMICILE_RULERS[sign as keyof typeof DOMICILE_RULERS]) === planet || EXALTATIONS[capitalized(planet)].sign === sign;
  }
  sunDistance(X: Chart, planet: ClassicalPlanet) {
    return distance(this.lon(X, planet), this.lon(X, 'sun'));
  }
  underRays(X: Chart, planet: ClassicalPlanet) {
    return planet !== 'sun' && this.sunDistance(X, planet) <= 15;
  }
  unfortunate(X: Chart, planet: ClassicalPlanet) {
    return (
      this.afflicted(X, planet) ||
      this.debilitated(X, planet) ||
      (planet !== 'sun' && this.sunDistance(X, planet) <= 8.5) ||
      [6, 8, 12].includes(this.h(X, planet))
    );
  }
  wellAspected(X: Chart, planet: ClassicalPlanet) {
    return !this.afflicted(X, planet) && CLASSICAL.some((q) => q !== planet && this.favorable(X, planet, q));
  }
  /** Rises after the Sun: east of it by less than 180 degrees. */
  occidental(X: Chart, planet: ClassicalPlanet) {
    const d = norm(this.lon(X, planet) - this.lon(X, 'sun'));
    return planet !== 'sun' && d > 0 && d < 180;
  }
  waningMoon(X: Chart) {
    return norm(this.lon(X, 'moon') - this.lon(X, 'sun')) > 180;
  }
  houseAfflicted(X: Chart, house: number) {
    const cusp = X.houses.houses[house - 1].longitude;
    return MALEFICS.some((m) => {
      if (this.h(X, m) === house) return true;
      const d = distance(this.lon(X, m), cusp);
      return HARD.some((kind) => Math.abs(d - ASPECTS[kind].angle) <= ASPECTS[kind].orb);
    });
  }
  /** A return point in aspect to a natal point within `orb`. */
  crossAsp(a: Point, b: Point, kinds: readonly AspectKind[], orb = CROSS_ORB) {
    const d = distance(this.lon(this.R, a), this.lon(this.N, b));
    return kinds.some((kind) => Math.abs(d - ASPECTS[kind].angle) <= orb);
  }
  crossConj(a: Point, b: Point, orb = CROSS_ORB) {
    return this.crossAsp(a, b, ['conjunction'], orb);
  }
  bothHouse(planet: Point, house: number) {
    return this.h(this.N, planet) === house && this.h(this.R, planet) === house;
  }
}

const ascendantInNatalHouseOf = (planet: ClassicalPlanet): Trigger => (f) => f.nh('asc') === f.h(f.N, planet);
const tenthSignIn = (house: number): Trigger => (f) => f.signHouses(f.cuspSign(f.N, 10)).includes(house);
const fortuneSignIn = (house: number): Trigger => (f) => {
  const fortune = f.N.lots?.fortunePosition;
  return fortune ? f.signHouses(fortune.sign).includes(house) : null;
};
const returnRulerInFirst = (house: number): Trigger => (f) => f.h(f.R, f.rulerOf(f.R, house)) === 1;
/** The return's first house (its Ascendant), that house's ruler and the Moon each hard to a malefic. */
const ascendantRulerMoonAfflicted: Trigger = (f) =>
  (['asc', f.F, 'moon'] as Point[]).every((x) => MALEFICS.some((m) => m !== x && f.hard(f.R, x, m)));

export const SOLAR_RETURN_APHORISM_TRIGGERS: Record<SolarReturnAphorismId, Trigger> = {
  // The return Ascendant through the natal houses.
  'ascendant-in-natal-malefic-house': (f) => MALEFICS.some((m) => f.nh('asc') === f.h(f.N, m)),
  'ascendant-in-natal-jupiter-house': ascendantInNatalHouseOf('jupiter'),
  'ascendant-in-natal-sun-house': ascendantInNatalHouseOf('sun'),
  'ascendant-in-natal-venus-house': ascendantInNatalHouseOf('venus'),
  'ascendant-in-natal-mercury-house': ascendantInNatalHouseOf('mercury'),
  'ascendant-in-natal-moon-house': ascendantInNatalHouseOf('moon'),
  'ascendant-mars-fire-iron-captivity': (f) => f.nh('asc') === f.h(f.N, 'mars') && f.hard(f.R, 'mars', 'asc'),
  // Volguine: "one or the other of these malefic planets moves to occupy the First House", the
  // return's first, as the same sentence uses it.
  'reciprocal-ascendant-malefic-overlays': (f) =>
    MALEFICS.some((m) => f.nh('asc') === f.h(f.N, m)) && MALEFICS.some((m) => f.h(f.R, m) === 1),
  'ascendant-second-eighth-venus-saturn-captivity': (f) =>
    f.nh('asc') === 2 && f.Y === 'venus' && f.h(f.R, 'saturn') === 4 && f.nh(f.R.houses.houses[6].longitude) === 8,
  // The text stresses Pisces, Jupiter's domicile in this rule.
  'ascendant-jupiter-twelfth-saturn-mars-danger': (f) =>
    f.cuspSign(f.R, 1) === 'Pisces' && f.cuspSign(f.N, 12) === 'Pisces' && f.sign(f.R, 'saturn') === 'Pisces' && f.h(f.R, 'mars') === 4,
  // Volguine glosses this wording as the return Ascendant passing through a natal house, as the
  // ascendant-in-natal-* rules read it; the ruler of the year's house is counted in the return.
  'ascendant-year-ruler-house-groups': (f) => {
    const good = [1, 2, 4, 5, 7, 9, 10, 11];
    const bad = [3, 6, 8, 12];
    const ascendant = f.nh('asc');
    const yearRuler = f.h(f.R, f.Y);
    return (good.includes(ascendant) && bad.includes(yearRuler)) || (bad.includes(ascendant) && good.includes(yearRuler));
  },

  // Friends, enemies, status and the ruler of the year.
  'mars-or-moon-eleventh-both-charts': (f) => f.bothHouse('mars', 11) || f.bothHouse('moon', 11),
  'natal-eleventh-ruler-in-return-twelfth-betrayal': (f) => f.h(f.R, f.rulerOf(f.N, 11)) === 12,
  'saturn-rules-eleventh-or-twelfth-friends': (f) => f.rulerOf(f.R, 11) === 'saturn' || f.rulerOf(f.R, 12) === 'saturn',
  'natal-tenth-ruler-jupiter-afflicts-return-sun': (f) =>
    f.rulerOf(f.N, 10) === 'jupiter' && f.asp(f.R, 'jupiter', 'sun', SQUARE_OPPOSITION),
  'unfortunate-return-year-ruler': (f) => f.unfortunate(f.R, f.Y),
  'unfortunate-year-ruler-both-charts': (f) => f.unfortunate(f.N, f.Y) && f.unfortunate(f.R, f.Y),
  'natal-tenth-ruler-in-return-seventh-eighth-twelfth': (f) => [7, 8, 12].includes(f.h(f.R, f.rulerOf(f.N, 10))),
  'saturn-year-ruler-cadent-to-sixth-eighth': (f) =>
    f.Y === 'saturn' && CADENT.includes(f.h(f.N, 'saturn')) && [6, 8].includes(f.h(f.R, 'saturn')),
  'tenth-malefic-without-year-rulership-or-sextile-trine': (f) =>
    MALEFICS.some(
      (m) => f.h(f.R, m) === 10 && m !== f.Y && !CLASSICAL.some((q) => q !== m && f.asp(f.R, m, q, SOFT)),
    ),
  'natal-first-ruler-malefic-in-return-second': (f) => f.isMalefic(f.YN) && f.h(f.R, f.YN) === 2,
  'angular-year-ruler-repeats-natal-malefic-contact': (f) =>
    ANGULAR.includes(f.h(f.R, f.Y)) &&
    MALEFICS.some((m) => m !== f.Y && f.asp(f.R, f.Y, m, SQUARE_OPPOSITION) && f.asp(f.N, f.Y, m, ['conjunction'])),
  'occidental-or-seventh-twelfth-year-ruler-property': (f) =>
    (f.occidental(f.R, f.Y) || [7, 12].includes(f.h(f.R, f.Y))) &&
    MALEFICS.some((m) => m !== f.Y && f.adverse(f.R, f.Y, m)) &&
    !f.favorable(f.R, 'jupiter', 'moon') &&
    (f.Y === 'jupiter' || !f.favorable(f.R, 'jupiter', f.Y)),
  'afflicted-year-ruler-ascendant-moon-wealth': (f) =>
    (['asc', f.Y, 'moon'] as Point[]).every((x) =>
      CLASSICAL.some((p) => p !== x && (f.isMalefic(p) || f.afflicted(f.R, p)) && f.hard(f.R, x, p)),
    ),
  'afflicted-ascendant-ruler-moon-saturn-mars': ascendantRulerMoonAfflicted,
  'jupiter-sixth-or-twelfth-enemies': (f) =>
    [6, 12].includes(f.h(f.N, 'jupiter')) && [6, 12].includes(f.h(f.R, 'jupiter')),
  // "Opposite the seventh house" is the first. Volguine's next rule names "Nativity or Return",
  // so either chart counts.
  'mercury-opposite-seventh-enemies-paralyzed': (f) => f.h(f.R, 'mercury') === 1 || f.h(f.N, 'mercury') === 1,
  'mercury-twelfth-natal-and-return-enemy-snares': (f) => f.bothHouse('mercury', 12),
  'mars-first-enemies-strength-and-jupiter-house': (f) =>
    f.h(f.R, 'mars') === 1 &&
    ((f.adverse(f.R, 'mars', 'moon') && (f.Y === 'mars' || f.adverse(f.R, 'mars', f.Y))) ||
      ['Sagittarius', 'Pisces'].includes(f.sign(f.R, 'mars'))),
  'natal-twelfth-ruler-return-first-eighth-eleventh': (f) => [1, 8, 11].includes(f.h(f.R, f.rulerOf(f.N, 12))),
  'natal-first-ruler-return-twelfth-enemy-outcome': (f) => f.h(f.R, f.YN) === 12,
  'return-first-ruler-moon-malefic-enemy-power': ascendantRulerMoonAfflicted,
  // Needs the eclipses of the year, which kaabalah does not compute.
  // An eclipse of the return's year in its first or tenth house, with that house's ruler in the
  // eclipse's sign ("united with the eclipse's sign").
  'return-eclipse-first-tenth-enemy-triumph': (f) =>
    f.eclipses.some((eclipse) => {
      const house = findHouseOf(eclipse.longitude, f.cusps(f.R));
      return (house === 1 || house === 10) && f.sign(f.R, f.rulerOf(f.R, house)) === eclipse.sign;
    }),
  'capricorn-aquarius-secret-enemies': (f) =>
    (f.cuspSign(f.R, 12) === 'Capricorn' && f.cuspSign(f.R, 1) === 'Aquarius') ||
    (['Capricorn', 'Aquarius'].includes(f.cuspSign(f.R, 12)) && f.h(f.R, 'saturn') === 7),
  'saturn-first-sixth-seventh-eighth-implacable-enemies': (f) => [1, 6, 7, 8].includes(f.h(f.R, 'saturn')),
  'return-jupiter-natal-saturn-sign-alliances': (f) => f.sign(f.R, 'jupiter') === f.sign(f.N, 'saturn'),
  'return-mars-first-seventh-enemies-lawsuits': (f) => [1, 7].includes(f.h(f.R, 'mars')),
  'sun-seventh-support-twelfth-secret-enemies': (f) =>
    f.bothHouse('sun', 7) || (f.h(f.R, 'sun') === 12 && f.afflicted(f.R, 'sun')),
  'favorable-planet-return-twelfth-enemy-superiority': (f) => BENEFICS.some((b) => f.h(f.R, b) === 12),
  'mercury-seventh-natal-and-return-treacherous-enemies': (f) => f.bothHouse('mercury', 7),
  'return-moon-masculine-malefic-house-ruler-enemies': (f) =>
    isMasculine(f.sign(f.R, 'moon')) &&
    MALEFICS.every((m) => f.asp(f.R, 'moon', m, SQUARE_OPPOSITION)) &&
    f.isMalefic(f.rulerOf(f.R, f.h(f.R, 'moon'))),
  'occidental-year-ruler-seventh-twelfth-enemy-loss': (f) =>
    [7, 12].includes(f.h(f.R, f.Y)) &&
    f.occidental(f.R, f.Y) &&
    MALEFICS.some((m) => m !== f.Y && f.adverse(f.R, f.Y, m)) &&
    f.noAspect(f.R, 'jupiter', 'moon') &&
    (f.Y === 'jupiter' || f.noAspect(f.R, 'jupiter', f.Y)),
  'year-ruler-under-sun-rays-enemy-activity': (f) => f.underRays(f.R, f.Y),
  // "The ruler of the first house has no aspect to its own house": the return's first-house ruler
  // in aversion, its sign the 2nd, 6th, 8th or 12th from the Ascendant's.
  'benefic-year-ruler-mars-opposition-luminary-square-enemies': (f) => {
    if (!f.isBenefic(f.Y)) return false;
    const fromAscendant = (SIGNS.indexOf(f.sign(f.R, f.F) as (typeof SIGNS)[number]) - SIGNS.indexOf(f.cuspSign(f.R, 1) as (typeof SIGNS)[number]) + 12) % 12;
    return (
      f.asp(f.R, f.Y, 'mars', ['opposition']) &&
      (f.asp(f.R, f.Y, 'moon', ['square']) || f.asp(f.R, f.Y, 'sun', ['square'])) &&
      [1, 5, 7, 11].includes(fromAscendant)
    );
  },
  'natal-eleventh-ruler-return-twelfth-changing-connections': (f) => f.h(f.R, f.rulerOf(f.N, 11)) === 12,
  'first-ruler-return-twelfth-enemies-captivity': (f) => f.h(f.R, f.F) === 12,
  'south-node-return-first-enemy-capture-flight': (f) => f.h(f.R, 'southNode') === 1,
  'natal-sixth-twelfth-sign-return-first-friends-enemies': (f) =>
    [...f.signHouses(f.cuspSign(f.N, 6)), ...f.signHouses(f.cuspSign(f.N, 12))].includes(1),
  'return-fourth-seventh-houses-rulers-afflicted-enemy-harm': (f) =>
    f.houseAfflicted(f.R, 4) &&
    f.houseAfflicted(f.R, 7) &&
    f.afflicted(f.R, f.rulerOf(f.R, 4)) &&
    f.afflicted(f.R, f.rulerOf(f.R, 7)),
  'return-jupiter-venus-conjunct-moon-year-ruler-deliverance': (f) =>
    BENEFICS.every((b) => (['moon', f.Y] as Point[]).some((x) => x !== b && f.asp(f.R, b, x, ['conjunction']))),
  'jupiter-third-natal-and-return-peace': (f) => f.bothHouse('jupiter', 3),
  'north-node-fifth-natal-and-return-mortal-protection': (f) => f.bothHouse('node', 5),
  'year-ruler-good-aspects-natal-and-return-protection': (f) => f.wellAspected(f.N, f.Y) && f.wellAspected(f.R, f.Y),

  // Captivity, danger, Mars and Saturn.
  'return-saturn-first-captivity-wound-death': (f) => f.h(f.R, 'saturn') === 1,
  // Two planets: Saturn as ruler of the year, and "the annual first-house ruler" in the seventh.
  'saturn-year-ruler-below-horizon-mars-captivity': (f) =>
    ((f.Y === 'saturn' && f.h(f.R, 'saturn') <= 6 && f.asp(f.R, 'saturn', 'mars', ['conjunction'])) ||
      f.sign(f.R, 'mars') === f.sign(f.N, 'saturn')) &&
    f.h(f.R, f.F) === 7 &&
    BENEFICS.every((b) => CADENT.includes(f.h(f.R, b))),
  'saturn-twelfth-natal-and-return-misfortune-wound': (f) => f.bothHouse('saturn', 12),
  'return-saturn-first-ruler-twelfth-no-sun-aspect-captivity': (f) =>
    f.F === 'saturn' && f.h(f.R, 'saturn') === 12 && f.noAspect(f.R, 'saturn', 'sun'),
  'saturn-sixth-natal-and-return-danger-captivity': (f) => f.bothHouse('saturn', 6),
  'return-jupiter-capricorn-saturn-sun-mars-misfortune': (f) =>
    f.sign(f.R, 'jupiter') === 'Capricorn' && f.hard(f.R, 'jupiter', 'saturn') && f.hard(f.R, 'sun', 'mars'),
  'jupiter-year-ruler-under-sun-rays-humiliation': (f) => f.Y === 'jupiter' && f.underRays(f.R, 'jupiter'),
  // "Above Venus": closer to the Midheaven.
  'mars-year-ruler-saturn-natal-sign-angular-succedent-captivity': (f) =>
    f.Y === 'mars' &&
    f.sign(f.R, 'saturn') === f.sign(f.N, 'mars') &&
    [...ANGULAR, ...SUCCEDENT].includes(f.h(f.R, 'mars')) &&
    distance(f.lon(f.R, 'mars'), f.lon(f.R, 'mc')) < distance(f.lon(f.R, 'venus'), f.lon(f.R, 'mc')) &&
    BENEFICS.every((b) => CADENT.includes(f.h(f.R, b))),
  'mars-year-ruler-undignified-in-first': (f) => f.Y === 'mars' && f.h(f.R, 'mars') === 1 && !f.dignified(f.R, 'mars'),
  'mars-in-natal-and-return-fourth': (f) => f.bothHouse('mars', 4),
  'mars-in-return-twelfth-with-natal-house-branches': (f) => f.h(f.R, 'mars') === 12,
  'mars-in-natal-sun-sign-violent-death-or-illness': (f) => f.sign(f.R, 'mars') === f.sign(f.N, 'sun'),
  'mars-in-return-tenth-fall-or-animal-wound': (f) => f.h(f.R, 'mars') === 10,
  'mars-in-natal-saturn-sign-unforeseen-dangers': (f) => f.sign(f.R, 'mars') === f.sign(f.N, 'saturn'),
  'return-sun-square-or-opposite-mars-fall': (f) => f.asp(f.R, 'sun', 'mars', SQUARE_OPPOSITION),
  'sun-in-natal-and-return-twelfth-captivity': (f) => f.bothHouse('sun', 12),
  'venus-year-ruler-in-via-combusta': (f) => f.Y === 'venus' && inViaCombusta(f.lon(f.R, 'venus')),
  'mercury-year-ruler-in-via-combusta': (f) => f.Y === 'mercury' && inViaCombusta(f.lon(f.R, 'mercury')),
  'return-cancer-moon-aries-sun-malefic-affliction': (f) =>
    f.sign(f.R, 'moon') === 'Cancer' &&
    f.sign(f.R, 'sun') === 'Aries' &&
    MALEFICS.some((m) => f.adverse(f.R, 'moon', m)) &&
    MALEFICS.some((m) => f.adverse(f.R, 'sun', m)),
  'return-moon-in-natal-mars-sign-diurnal-dangers': (f) => f.sign(f.R, 'moon') === f.sign(f.N, 'mars'),
  'masculine-return-moon-afflicted-and-malefic-ruled': (f) => {
    const sign = f.sign(f.R, 'moon');
    return (
      isMasculine(sign) &&
      MALEFICS.every((m) => f.adverse(f.R, 'moon', m)) &&
      f.isMalefic(lower(DOMICILE_RULERS[sign as keyof typeof DOMICILE_RULERS]))
    );
  },
  'moon-in-natal-and-return-seventh': (f) => f.bothHouse('moon', 7),
  // One planet whose condition turns (Volguine §540, after Morin): fortunate at birth, unfortunate in the return.
  'year-ruler-benefic-natally-malefic-in-return': (f) =>
    !f.unfortunate(f.N, f.Y) && f.unfortunate(f.R, f.Y) && f.afflicted(f.R, 'moon'),
  'afflicted-year-ruler-in-natal-and-return-sixth': (f) => f.bothHouse(f.Y, 6) && f.afflicted(f.R, f.Y),
  'year-ruler-angular-and-hard-aspected-in-both-charts': (f) =>
    [f.N, f.R].every(
      (X) => ANGULAR.includes(f.h(X, f.Y)) && MALEFICS.some((m) => m !== f.Y && f.asp(X, f.Y, m, SQUARE_OPPOSITION)),
    ),
  'afflicted-year-ruler-in-second-sixth-eighth-twelfth': (f) => f.afflicted(f.R, f.Y) && [2, 6, 8, 12].includes(f.h(f.R, f.Y)),
  'afflicted-year-ruler-in-seventh-fall-expatriation': (f) => f.h(f.R, f.Y) === 7 && f.afflicted(f.R, f.Y),
  'year-ruler-afflicted-by-angular-or-cadent-hostile-planet': (f) =>
    CLASSICAL.some(
      (p) => p !== f.Y && f.asp(f.R, f.Y, p, SQUARE_OPPOSITION) && [...ANGULAR, ...CADENT].includes(f.h(f.R, p)),
    ),
  'undignified-year-ruler-natal-first-ruler-via-combusta': (f) =>
    !f.dignified(f.R, f.Y) && inViaCombusta(f.lon(f.R, f.YN)) && f.afflicted(f.R, 'sun') && f.afflicted(f.R, 'moon'),
  'year-ruler-aspects-to-first-house': (f) => f.asp(f.R, f.Y, 'asc', [...SQUARE_OPPOSITION, ...SOFT]),
  'malefic-year-ruler-natal-seventh-return-moon-first': (f) =>
    f.isMalefic(f.Y) &&
    f.h(f.N, f.Y) === 7 &&
    f.adverse(f.R, f.Y, 'moon') &&
    (f.h(f.R, f.Y) === 1 || f.h(f.R, other(f.Y)) === 1),
  'benefic-year-ruler-malefics-first-seventh': (f) =>
    f.isBenefic(f.Y) &&
    MALEFICS.some((m) => f.h(f.R, m) === 1 && f.h(f.R, other(m)) === 7) &&
    MALEFICS.some((m) => f.adverse(f.R, m, 'moon')),
  'year-ruler-natal-cadent-near-sun-return-saturn': (f) =>
    CADENT.includes(f.h(f.N, f.Y)) &&
    f.underRays(f.N, f.Y) &&
    [6, 8, 12].includes(f.h(f.R, f.Y)) &&
    f.underRays(f.R, f.Y) &&
    f.asp(f.R, f.Y, 'saturn', ['conjunction']),
  'benefic-year-ruler-unfortunate-house-angular-malefics': (f) =>
    f.isBenefic(f.Y) && [6, 8, 12].includes(f.h(f.R, f.Y)) && MALEFICS.some((m) => [1, 10].includes(f.h(f.R, m))),
  'malefic-year-ruler-via-combusta-unfortunate-house': (f) =>
    f.isMalefic(f.Y) && [6, 12].includes(f.h(f.R, f.Y)) && MALEFICS.some((m) => f.adverse(f.R, 'moon', m)),
  'benefic-year-ruler-afflicted-in-both-charts': (f) => f.isBenefic(f.Y) && f.afflicted(f.N, f.Y) && f.afflicted(f.R, f.Y),
  'afflicted-return-first-ruler-in-fourth-seventh-tenth': (f) => [4, 7, 10].includes(f.h(f.R, f.F)) && f.afflicted(f.R, f.F),
  'return-first-ruler-in-eighth-life-danger': (f) => f.h(f.R, f.F) === 8,
  'return-first-ruler-conjunct-south-node-poisoning': (f) => f.asp(f.R, f.F, 'southNode', ['conjunction']),
  'saturn-or-mars-in-return-first-adverse-year': (f) => MALEFICS.some((m) => f.h(f.R, m) === 1),
  'different-malefics-in-natal-and-return-first': (f) =>
    (f.h(f.R, 'saturn') === 1 && f.h(f.N, 'mars') === 1) || (f.h(f.R, 'mars') === 1 && f.h(f.N, 'saturn') === 1),
  'return-first-malefic-with-other-natal-affliction': (f) =>
    MALEFICS.some((m) => {
      if (f.h(f.R, m) !== 1) return false;
      const o = other(m);
      const angles = [f.N.houses.ascendant, f.N.houses.mc, f.N.houses.dc, f.N.houses.ic].map((a) => a.longitude);
      const hardToAngle = angles.some((a) => {
        const d = distance(f.lon(f.N, o), a);
        return HARD.some((kind) => Math.abs(d - ASPECTS[kind].angle) <= ASPECTS[kind].orb);
      });
      return f.adverse(f.N, o, 'moon') || hardToAngle;
    }),
  'malefic-square-first-mitigated-by-ruler-benefic-aspects': (f) =>
    MALEFICS.some((m) => f.asp(f.R, m, 'asc', ['square'])) &&
    BENEFICS.some((b) => b !== f.F && f.favorable(f.R, f.F, b)) &&
    f.asp(f.R, f.F, 'asc', SOFT),
  'natal-malefic-benefic-aspect-return-hard-contact': (f) =>
    MALEFICS.some((m) => BENEFICS.some((b) => f.asp(f.N, m, b) && f.hard(f.R, m, b))),
  'malefic-in-return-fourth-obstacles': (f) => MALEFICS.some((m) => f.h(f.R, m) === 4),
  // "Linked to a malefic at birth" (§563): occupancy, since rulership never changes between
  // charts; "contains" is any sign inside the return's first house, not only the Ascendant's.
  'return-first-sign-linked-to-natal-malefic': (f) => {
    const inside = f.signsInReturnHouse(1);
    return MALEFICS.some((m) => inside.includes(f.sign(f.N, m)));
  },
  // "The Sun eclipsed" in the return: a solar eclipse's maximum within a day of the return.
  'repeated-first-house-eclipse-or-waning-moon-saturn': (f) => {
    if (f.cuspSign(f.R, 1) !== f.cuspSign(f.N, 1)) return false;
    const returnAt = f.R.dateUtc.getTime();
    const sunEclipsed = f.eclipses.some(
      (eclipse) => eclipse.kind === 'solar' && Math.abs(eclipse.instant.getTime() - returnAt) <= 86_400_000,
    );
    return (sunEclipsed && f.adverse(f.R, 'sun', 'saturn')) || (f.waningMoon(f.R) && f.adverse(f.R, 'moon', 'saturn'));
  },
  'malefic-with-year-ruler-in-first-afflicts-moon': (f) =>
    f.h(f.R, f.Y) === 1 && MALEFICS.some((m) => m !== f.Y && f.h(f.R, m) === 1 && f.adverse(f.R, m, 'moon')),

  // The natal tenth-house sign in each return house.
  'natal-tenth-sign-in-return-house-1': tenthSignIn(1),
  'natal-tenth-sign-in-return-house-2': tenthSignIn(2),
  'natal-tenth-sign-in-return-house-3': tenthSignIn(3),
  'natal-tenth-sign-in-return-house-4': tenthSignIn(4),
  'natal-tenth-sign-in-return-house-5': tenthSignIn(5),
  'natal-tenth-sign-in-return-house-6': tenthSignIn(6),
  'natal-tenth-sign-in-return-house-7': tenthSignIn(7),
  'natal-tenth-sign-in-return-house-8': tenthSignIn(8),
  'natal-tenth-sign-in-return-house-9': tenthSignIn(9),
  'natal-tenth-sign-in-return-house-10': tenthSignIn(10),
  'natal-tenth-sign-in-return-house-11': tenthSignIn(11),
  'natal-tenth-sign-in-return-house-12': tenthSignIn(12),
  // The natal Part of Fortune's sign in each return house.
  'natal-fortune-sign-in-return-house-1': fortuneSignIn(1),
  'natal-fortune-sign-in-return-house-2': fortuneSignIn(2),
  'natal-fortune-sign-in-return-house-3': fortuneSignIn(3),
  'natal-fortune-sign-in-return-house-4': fortuneSignIn(4),
  'natal-fortune-sign-in-return-house-5': fortuneSignIn(5),
  'natal-fortune-sign-in-return-house-6': fortuneSignIn(6),
  'natal-fortune-sign-in-return-house-7': fortuneSignIn(7),
  'natal-fortune-sign-in-return-house-8': fortuneSignIn(8),
  'natal-fortune-sign-in-return-house-9': fortuneSignIn(9),
  'natal-fortune-sign-in-return-house-10': fortuneSignIn(10),
  'natal-fortune-sign-in-return-house-11': fortuneSignIn(11),
  'natal-fortune-sign-in-return-house-12': fortuneSignIn(12),

  // Annual rulers and return-to-natal contacts.
  'return-first-ruler-moon-malefic-affliction-catastrophe': ascendantRulerMoonAfflicted,
  'return-third-ruler-in-tenth-sibling-death': (f) => f.h(f.R, f.rulerOf(f.R, 3)) === 10,
  'return-second-ruler-in-first-financial-situation': returnRulerInFirst(2),
  'return-fifth-ruler-in-first-passion-or-younger-person': returnRulerInFirst(5),
  'return-sixth-ruler-in-first-health-and-work': returnRulerInFirst(6),
  'return-eighth-ruler-in-first-death-subject': returnRulerInFirst(8),
  'return-dignified-planet-opposite-its-weak-natal-position': (f) =>
    MOON_TO_SATURN.some((p) => {
      if (!f.debilitated(f.N, p)) return false;
      const natal = SIGNS.indexOf(f.sign(f.N, p) as (typeof SIGNS)[number]);
      return f.sign(f.R, p) === SIGNS[(natal + 6) % 12];
    }),
  'ibn-ezra-annual-planet-at-another-natal-planets-position': (f) => {
    const set = [...MALEFICS, ...BENEFICS];
    return set.some((p) => set.some((q) => p !== q && f.crossConj(p, q)));
  },
  'return-ascendant-adverse-aspect-to-natal-midheaven': (f) => f.crossAsp('asc', 'mc', SQUARE_OPPOSITION),
  'return-to-natal-planetary-aspects-and-reception': (f) =>
    CLASSICAL.some((p) =>
      CLASSICAL.some(
        (q) =>
          p !== q &&
          ((f.asp(f.N, p, q, SQUARE_OPPOSITION) && f.crossAsp(p, q, PTOLEMAIC)) ||
            (f.asp(f.N, p, q, SOFT) && f.crossAsp(p, q, SQUARE_OPPOSITION))),
      ),
    ),
  'return-planet-regains-its-natal-position': (f) => MOON_TO_SATURN.some((p) => f.crossConj(p, p)),
  'annual-and-natal-rulers-conjunct-same-house': (f) =>
    Array.from({ length: 12 }, (_, i) => i + 1).some((n) => {
      const a = f.rulerOf(f.N, n);
      const b = f.rulerOf(f.R, n);
      return a !== b && f.asp(f.R, a, b, ['conjunction']);
    }),
  'three-or-more-planets-return-to-natal-positions': (f) => MOON_TO_SATURN.filter((p) => f.crossConj(p, p)).length >= 3,
  'afflicted-annual-saturn-over-natal-planet': (f) =>
    (f.hard(f.R, 'saturn', 'mars') || f.debilitated(f.R, 'saturn')) && CLASSICAL.some((q) => f.crossConj('saturn', q)),
  'return-planet-strong-natal-contact': (f) =>
    CLASSICAL.some((p) => ([...CLASSICAL, 'asc', 'mc'] as Point[]).some((q) => f.crossAsp(p, q, HARD, 2))),
  'return-and-natal-contacts-origin-of-events': (f) => CLASSICAL.some((p) => CLASSICAL.some((q) => f.crossConj(p, q))),
} satisfies Record<SolarReturnAphorismId, Trigger>;

/** Rules about return-to-natal contacts that nearly every year meets: shown last, apart. */
export const GENERAL_SOLAR_RETURN_APHORISMS: ReadonlySet<SolarReturnAphorismId> = new Set([
  'return-to-natal-planetary-aspects-and-reception',
  'return-planet-strong-natal-contact',
  'return-and-natal-contacts-origin-of-events',
] as SolarReturnAphorismId[]);

/** The aphorisms whose chart conditions hold, in the bank's order, split into specific and general. */
export interface MatchSolarReturnAphorismsOptions {
  /** Default `'profection'`. */
  yearRuler?: SolarReturnYearRuler;
  /**
   * The eclipses from this return to the next. Omitted, they are searched with `findEclipses`
   * (Swiss Ephemeris must be initialised); `[]` skips the two eclipse rules.
   */
  eclipses?: readonly Eclipse[];
}

export interface SolarReturnAphorismMatch {
  /** The aphorisms whose chart conditions hold, in the bank's order. */
  specific: SolarReturnAphorismId[];
  /** The rules about return-to-natal contacts that nearly every year meets. */
  general: SolarReturnAphorismId[];
  /** The planet read as ruler of the year, and as the return's first-house ruler. */
  yearRuler: SolarReturnAphorismPlanet;
  firstHouseRuler: SolarReturnAphorismPlanet;
  /** Completed years at the return (the profection count). */
  age: number;
  method: typeof SOLAR_RETURN_APHORISM_METHOD & { yearRuler: SolarReturnYearRuler };
}

export const SOLAR_RETURN_APHORISM_METHOD = Object.freeze({
  conditions:
    "each aphorism's 'if' clause checked on the natal and return charts; qualifiers that only shade the outcome stay in the text",
  firstHouseRuler: 'traditional ruler of the return Ascendant sign',
  profection: 'yearRuler profection: traditional ruler of the sign (completed years) past the natal Ascendant sign',
  aspects: 'Ptolemaic aspects within one chart with DEFAULT_ASPECT_SPECS orbs (8/5/6/7/8); return to natal points within 3 degrees',
  afflicted: 'conjunction, square or opposition to Saturn or Mars',
  unfortunate: 'afflicted, in detriment or fall, within 8.5 degrees of the Sun, or in house 6, 8 or 12',
  viaCombusta: '18th degree of Gemini to the 2nd of Cancer, 24th degree of Sagittarius to the 2nd of Capricorn (this bank\'s own)',
  eclipses: 'from this return to the next (365.2422 days); the Sun eclipsed at the return = a solar maximum within a day of it',
});

const RETURN_YEAR_MS = YEAR_DAYS * 86_400_000;

/**
 * The solar return aphorisms whose chart conditions hold for a natal chart and one of its solar
 * return charts (`getSolarReturnChart(...).solarReturnChart`). Show each with
 * `getSolarReturnAphorismDescription(id, language)`.
 */
export function matchSolarReturnAphorisms(
  natal: BirthChart,
  solarReturn: BirthChart,
  options: MatchSolarReturnAphorismsOptions = {},
): SolarReturnAphorismMatch {
  const yearRuler = options.yearRuler ?? 'profection';
  const eclipses =
    options.eclipses ??
    findEclipses({ start: solarReturn.dateUtc, end: new Date(solarReturn.dateUtc.getTime() + RETURN_YEAR_MS) }).eclipses;
  const facts = new SolarReturnAphorismFacts(natal, solarReturn, yearRuler, eclipses);
  const ids = Object.keys(ASTROLOGY_TIMING_DESCRIPTIONS.solarReturnAphorisms) as SolarReturnAphorismId[];
  const matched = ids.filter((id) => {
    try {
      return SOLAR_RETURN_APHORISM_TRIGGERS[id]?.(facts) === true;
    } catch {
      // A chart without a point a rule reads (for instance no mean node) simply does not match it.
      return false;
    }
  });
  return {
    specific: matched.filter((id) => !GENERAL_SOLAR_RETURN_APHORISMS.has(id)),
    general: matched.filter((id) => GENERAL_SOLAR_RETURN_APHORISMS.has(id)),
    yearRuler: facts.Y,
    firstHouseRuler: facts.F,
    age: ageAtSolarReturn(natal, solarReturn),
    method: { ...SOLAR_RETURN_APHORISM_METHOD, yearRuler },
  };
}
