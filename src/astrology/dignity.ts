/**
 * Essential Dignity Table — Traditional Hellenistic rulership data.
 * Pure math, no WASM dependency.
 */

import { SIGNS, type Sect } from "./index";
import { getDecan } from "./decans";
import { normalizeAngle } from "./swisseph";

export type Sign = (typeof SIGNS)[number];

export type TraditionalPlanet =
  | "Sun"
  | "Moon"
  | "Mercury"
  | "Venus"
  | "Mars"
  | "Jupiter"
  | "Saturn";

export interface EssentialDignityResult {
  domicile: boolean;
  exaltation: boolean;
  detriment: boolean;
  fall: boolean;
  domicileRuler: TraditionalPlanet;
  peregrine: boolean;
}

export const DOMICILE_RULERS: Record<Sign, TraditionalPlanet> = {
  Aries: "Mars",
  Taurus: "Venus",
  Gemini: "Mercury",
  Cancer: "Moon",
  Leo: "Sun",
  Virgo: "Mercury",
  Libra: "Venus",
  Scorpio: "Mars",
  Sagittarius: "Jupiter",
  Capricorn: "Saturn",
  Aquarius: "Saturn",
  Pisces: "Jupiter",
};

export const EXALTATIONS: Record<TraditionalPlanet, { sign: Sign; degree: number }> = {
  Sun: { sign: "Aries", degree: 19 },
  Moon: { sign: "Taurus", degree: 3 },
  Mercury: { sign: "Virgo", degree: 15 },
  Venus: { sign: "Pisces", degree: 27 },
  Mars: { sign: "Capricorn", degree: 28 },
  Jupiter: { sign: "Cancer", degree: 15 },
  Saturn: { sign: "Libra", degree: 21 },
};

export function getDomicileRuler(sign: Sign): TraditionalPlanet {
  return DOMICILE_RULERS[sign];
}

export function getExaltation(planet: TraditionalPlanet): { sign: Sign; degree: number } {
  return EXALTATIONS[planet];
}

export function getOppositeSign(sign: Sign): Sign {
  const idx = SIGNS.indexOf(sign);
  return SIGNS[(idx + 6) % 12];
}

/** Signs where the planet is in detriment (opposite of its domicile signs). */
export function getDetriment(planet: TraditionalPlanet): Sign[] {
  const signs: Sign[] = [];
  for (const [sign, ruler] of Object.entries(DOMICILE_RULERS)) {
    if (ruler === planet) {
      signs.push(getOppositeSign(sign as Sign));
    }
  }
  return signs;
}

/** Sign where the planet is in fall (opposite of its exaltation sign). */
export function getFall(planet: TraditionalPlanet): Sign {
  return getOppositeSign(EXALTATIONS[planet].sign);
}

export function getEssentialDignity(planet: TraditionalPlanet, sign: Sign): EssentialDignityResult {
  const domicile = DOMICILE_RULERS[sign] === planet;
  const exaltation = EXALTATIONS[planet].sign === sign;
  const detrimentSigns = getDetriment(planet);
  const detriment = detrimentSigns.includes(sign);
  const fallSign = getFall(planet);
  const fall = fallSign === sign;
  const domicileRuler = DOMICILE_RULERS[sign];
  const peregrine = !domicile && !exaltation && !detriment && !fall;

  return { domicile, exaltation, detriment, fall, domicileRuler, peregrine };
}

// ── Degree- and sect-aware essential dignities ─────────────────────────

/** Tradition names used by the extended dignity tables. */
export const DIGNITY_TRADITION = {
  rulership: "traditional (Ptolemaic) domicile, exaltation, detriment and fall",
  triplicity: "Dorothean (day / night / participating rulers by element)",
  bounds: "Egyptian (Ptolemaic Tetrabiblos I.21 'Egyptian' terms)",
  face: "Chaldean decans (order Mars, Sun, Venus, Mercury, Moon, Saturn, Jupiter from 0 Aries)",
  intervalConvention: "half-open [start, end) in degrees of ecliptic longitude",
} as const;

export type TriplicityElement = "fire" | "earth" | "air" | "water";
export type TriplicityRole = "day" | "night" | "participating";

export const SIGN_ELEMENTS: Record<Sign, TriplicityElement> = {
  Aries: "fire", Taurus: "earth", Gemini: "air", Cancer: "water",
  Leo: "fire", Virgo: "earth", Libra: "air", Scorpio: "water",
  Sagittarius: "fire", Capricorn: "earth", Aquarius: "air", Pisces: "water",
};

/** Dorothean triplicity rulers by element. */
export const DOROTHEAN_TRIPLICITY_RULERS: Record<
  TriplicityElement,
  Record<TriplicityRole, TraditionalPlanet>
> = {
  fire: { day: "Sun", night: "Jupiter", participating: "Saturn" },
  earth: { day: "Venus", night: "Moon", participating: "Mars" },
  air: { day: "Saturn", night: "Mercury", participating: "Jupiter" },
  water: { day: "Venus", night: "Mars", participating: "Moon" },
};

export interface BoundSegment {
  ruler: TraditionalPlanet;
  /** Start degree within the sign, inclusive. */
  start: number;
  /** End degree within the sign, exclusive. */
  end: number;
}

/** Upper (exclusive) limits per bound, in degrees within the sign. */
const EGYPTIAN_UPPER: Record<Sign, [TraditionalPlanet, number][]> = {
  Aries: [["Jupiter", 6], ["Venus", 12], ["Mercury", 20], ["Mars", 25], ["Saturn", 30]],
  Taurus: [["Venus", 8], ["Mercury", 14], ["Jupiter", 22], ["Saturn", 27], ["Mars", 30]],
  Gemini: [["Mercury", 6], ["Jupiter", 12], ["Venus", 17], ["Mars", 24], ["Saturn", 30]],
  Cancer: [["Mars", 7], ["Venus", 13], ["Mercury", 19], ["Jupiter", 26], ["Saturn", 30]],
  Leo: [["Jupiter", 6], ["Venus", 11], ["Saturn", 18], ["Mercury", 24], ["Mars", 30]],
  Virgo: [["Mercury", 7], ["Venus", 17], ["Jupiter", 21], ["Mars", 28], ["Saturn", 30]],
  Libra: [["Saturn", 6], ["Mercury", 14], ["Jupiter", 21], ["Venus", 28], ["Mars", 30]],
  Scorpio: [["Mars", 7], ["Venus", 11], ["Mercury", 19], ["Jupiter", 24], ["Saturn", 30]],
  Sagittarius: [["Jupiter", 12], ["Venus", 17], ["Mercury", 21], ["Saturn", 26], ["Mars", 30]],
  Capricorn: [["Mercury", 7], ["Jupiter", 14], ["Venus", 22], ["Saturn", 26], ["Mars", 30]],
  Aquarius: [["Mercury", 7], ["Venus", 13], ["Jupiter", 20], ["Mars", 25], ["Saturn", 30]],
  Pisces: [["Venus", 12], ["Jupiter", 16], ["Mercury", 19], ["Mars", 28], ["Saturn", 30]],
};

/** Egyptian bounds (terms) with half-open `[start, end)` degree intervals within each sign. */
export const EGYPTIAN_BOUNDS: Record<Sign, BoundSegment[]> = Object.fromEntries(
  (Object.entries(EGYPTIAN_UPPER) as [Sign, [TraditionalPlanet, number][]][]).map(([sign, rows]) => {
    let start = 0;
    return [
      sign,
      rows.map(([ruler, end]) => {
        const seg = { ruler, start, end };
        start = end;
        return seg;
      }),
    ];
  })
) as Record<Sign, BoundSegment[]>;

function locate(longitude: number): { sign: Sign; signIndex: number; degreeInSign: number } {
  const L = normalizeAngle(longitude);
  const signIndex = Math.min(Math.floor(L / 30), 11);
  return { sign: SIGNS[signIndex], signIndex, degreeInSign: L - signIndex * 30 };
}

/** Egyptian bound ruler at an ecliptic longitude (half-open intervals). */
export function getEgyptianBound(longitude: number): BoundSegment & { sign: Sign } {
  const { sign, degreeInSign } = locate(longitude);
  const seg = EGYPTIAN_BOUNDS[sign].find((b) => degreeInSign >= b.start && degreeInSign < b.end)
    ?? EGYPTIAN_BOUNDS[sign][EGYPTIAN_BOUNDS[sign].length - 1];
  return { ...seg, sign };
}

/** Dorothean triplicity rulers for a sign. */
export function getDorotheanTriplicity(sign: Sign): Record<TriplicityRole, TraditionalPlanet> & { element: TriplicityElement } {
  const element = SIGN_ELEMENTS[sign];
  return { element, ...DOROTHEAN_TRIPLICITY_RULERS[element] };
}

/** Chaldean face (decan) ruler at an ecliptic longitude. */
export function getFaceRuler(longitude: number): TraditionalPlanet {
  return getDecan(longitude).ruler;
}

export type PositiveDignity = "domicile" | "exaltation" | "triplicity" | "participatingTriplicity" | "bound" | "face";

export interface EssentialDignitiesDetail {
  planet: TraditionalPlanet;
  longitude: number;
  sign: Sign;
  degreeInSign: number;
  /** Sect used to select the triplicity ruler; null when not supplied. */
  sect: Sect | null;
  domicile: boolean;
  exaltation: boolean;
  /** Planet is the Dorothean ruler matching `sect` (false when sect is null). */
  triplicity: boolean;
  /** Planet is the participating (third) Dorothean ruler. */
  participatingTriplicity: boolean;
  /** Planet's role among the three triplicity rulers of this element, if any (day/night/participating). */
  triplicityRole: TriplicityRole | null;
  bound: boolean;
  face: boolean;
  detriment: boolean;
  fall: boolean;
  /**
   * True only when none of the positive dignities applies: domicile,
   * exaltation, triplicity (any of day / night / participating ruler of the
   * element, so the result does not depend on sect knowledge), bound or face.
   * Detriment and fall do not affect it.
   */
  peregrine: boolean;
  positiveDignities: PositiveDignity[];
  rulers: {
    domicile: TraditionalPlanet;
    exaltation: TraditionalPlanet | null;
    triplicity: Record<TriplicityRole, TraditionalPlanet> & { element: TriplicityElement; sectRuler: TraditionalPlanet | null };
    bound: TraditionalPlanet;
    face: TraditionalPlanet;
  };
  tradition: typeof DIGNITY_TRADITION;
}

/**
 * Degree- and sect-aware essential dignities for a traditional planet at an
 * ecliptic longitude. Extends (does not replace) `getEssentialDignity`, whose
 * `peregrine` ignores triplicity, bounds and faces.
 */
export function getEssentialDignities(
  planet: TraditionalPlanet,
  longitude: number,
  sect: Sect | null = null
): EssentialDignitiesDetail {
  const { sign, degreeInSign } = locate(longitude);
  const base = getEssentialDignity(planet, sign);
  const trip = getDorotheanTriplicity(sign);
  const sectRuler = sect === null ? null : sect === "diurnal" ? trip.day : trip.night;
  const bound = getEgyptianBound(longitude).ruler;
  const face = getFaceRuler(longitude);
  const triplicityRole: TriplicityRole | null =
    trip.day === planet ? "day" : trip.night === planet ? "night" : trip.participating === planet ? "participating" : null;
  const exaltationRuler = (Object.keys(EXALTATIONS) as TraditionalPlanet[]).find((p) => EXALTATIONS[p].sign === sign) ?? null;

  const flags = {
    domicile: base.domicile,
    exaltation: base.exaltation,
    triplicity: sectRuler === planet,
    participatingTriplicity: trip.participating === planet,
    bound: bound === planet,
    face: face === planet,
  };
  const positiveDignities = (Object.keys(flags) as PositiveDignity[]).filter((k) => flags[k]);
  const peregrine = !flags.domicile && !flags.exaltation && triplicityRole === null && !flags.bound && !flags.face;

  return {
    planet,
    longitude: normalizeAngle(longitude),
    sign,
    degreeInSign,
    sect,
    ...flags,
    triplicityRole,
    detriment: base.detriment,
    fall: base.fall,
    peregrine,
    positiveDignities,
    rulers: {
      domicile: base.domicileRuler,
      exaltation: exaltationRuler,
      triplicity: { ...trip, sectRuler },
      bound,
      face,
    },
    tradition: DIGNITY_TRADITION,
  };
}
