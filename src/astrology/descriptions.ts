import raw from "./descriptions.json";
import type { AspectName } from "./aspects";
import type { Sign, TriplicityElement } from "./dignity";
import type { MODALITIES } from "../core/constants";

/** Lowercase chart planet keys; authored coverage varies by factor kind. */
export type DescriptionPlanet =
  | "sun" | "moon" | "mercury" | "venus" | "mars"
  | "jupiter" | "saturn" | "uranus" | "neptune" | "pluto";

export interface PlanetSignDescriptionEntry {
  readonly pt: string;
  readonly en: string;
  readonly keywords: {
    readonly pt: readonly string[];
    readonly en: readonly string[];
  };
  readonly src: readonly {
    readonly file: string;
    readonly from: number;
    readonly to: number;
  }[];
  readonly reviewNotes: readonly string[];
}

export type DescriptionHouseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type PlanetHouseDescriptionEntry = PlanetSignDescriptionEntry;
export type HouseDescriptionEntry = PlanetSignDescriptionEntry;
export type DescriptionAngle = "ascendant" | "mc" | "dc" | "ic";
export type AngleSignDescriptionEntry = PlanetSignDescriptionEntry;
export type AngleDescriptionEntry = PlanetSignDescriptionEntry;
export type DescriptionAspect = AspectName;
export type AspectDescriptionEntry = PlanetSignDescriptionEntry;
export type PlanetDescriptionEntry = PlanetSignDescriptionEntry;
export type SignDescriptionEntry = PlanetSignDescriptionEntry;
export type DescriptionElement = TriplicityElement;
export type ElementDescriptionEntry = PlanetSignDescriptionEntry;
export type DescriptionModality = (typeof MODALITIES)[keyof typeof MODALITIES];
export type ModalityDescriptionEntry = PlanetSignDescriptionEntry;
export type DescriptionPolarity = "positive" | "negative";
export type PolarityDescriptionEntry = PlanetSignDescriptionEntry;

export interface AstrologyDescriptions {
  readonly planetSigns: Readonly<
    Partial<Record<DescriptionPlanet, Readonly<Partial<Record<Sign, PlanetSignDescriptionEntry>>>>>
  >;
  readonly planetHouses: Readonly<
    Partial<Record<DescriptionPlanet, Readonly<Partial<Record<DescriptionHouseNumber, PlanetHouseDescriptionEntry>>>>>
  >;
  readonly houses?: Readonly<Partial<Record<DescriptionHouseNumber, HouseDescriptionEntry>>>;
  readonly angleSigns?: Readonly<
    Partial<Record<DescriptionAngle, Readonly<Partial<Record<Sign, AngleSignDescriptionEntry>>>>>
  >;
  readonly planets?: Readonly<Partial<Record<DescriptionPlanet, PlanetDescriptionEntry>>>;
  readonly signs?: Readonly<Partial<Record<Sign, SignDescriptionEntry>>>;
  readonly elements?: Readonly<Partial<Record<DescriptionElement, ElementDescriptionEntry>>>;
  readonly modalities?: Readonly<Partial<Record<DescriptionModality, ModalityDescriptionEntry>>>;
  readonly polarities?: Readonly<Partial<Record<DescriptionPolarity, PolarityDescriptionEntry>>>;
  readonly angles?: Readonly<Partial<Record<DescriptionAngle, AngleDescriptionEntry>>>;
  readonly aspects?: Readonly<Partial<Record<DescriptionAspect, AspectDescriptionEntry>>>;
}

/** Imported JSON is shared process-wide, including all nested metadata. */
function freeze<T>(value: T): T {
  if (value !== null && typeof value === "object") {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

export const ASTROLOGY_DESCRIPTIONS: AstrologyDescriptions = freeze(raw);

/** Return the immutable authored entry; inherited keys are never descriptions. */
export function getPlanetSignDescriptionEntry(
  planet: DescriptionPlanet,
  sign: Sign,
): PlanetSignDescriptionEntry | undefined {
  const planets = ASTROLOGY_DESCRIPTIONS.planetSigns;
  if (!Object.prototype.hasOwnProperty.call(planets, planet)) return undefined;
  const signs = planets[planet];
  if (!signs) return undefined;
  if (!Object.prototype.hasOwnProperty.call(signs, sign)) return undefined;
  return signs[sign];
}

/** English by default; Portuguese for locale strings starting with `pt`. */
export function getPlanetSignDescription(
  planet: DescriptionPlanet,
  sign: Sign,
  language?: string,
): string | undefined {
  const entry = getPlanetSignDescriptionEntry(planet, sign);
  return language?.startsWith("pt") ? entry?.pt : entry?.en;
}

/** Chart house numbers are one-based; missing placements have no profile fallback. */
export function getPlanetHouseDescriptionEntry(
  planet: DescriptionPlanet,
  house: number,
): PlanetHouseDescriptionEntry | undefined {
  if (!Number.isInteger(house) || house < 1 || house > 12) return undefined;
  const planets = ASTROLOGY_DESCRIPTIONS.planetHouses;
  if (!Object.prototype.hasOwnProperty.call(planets, planet)) return undefined;
  const houses = planets[planet];
  if (!houses || !Object.prototype.hasOwnProperty.call(houses, house)) return undefined;
  return houses[house as DescriptionHouseNumber];
}

/** English by default; Portuguese for locale strings starting with `pt`. */
export function getPlanetHouseDescription(
  planet: DescriptionPlanet,
  house: number,
  language?: string,
): string | undefined {
  const entry = getPlanetHouseDescriptionEntry(planet, house);
  return language?.startsWith("pt") ? entry?.pt : entry?.en;
}

/** Numbered house themes, independent of planet placements and angle identities. */
export function getHouseDescriptionEntry(house: number): HouseDescriptionEntry | undefined {
  if (!Number.isInteger(house) || house < 1 || house > 12) return undefined;
  const houses = ASTROLOGY_DESCRIPTIONS.houses;
  if (!houses || !Object.prototype.hasOwnProperty.call(houses, house)) return undefined;
  return houses[house as DescriptionHouseNumber];
}

/** English by default; Portuguese for locale strings starting with `pt`. */
export function getHouseDescription(house: number, language?: string): string | undefined {
  const entry = getHouseDescriptionEntry(house);
  return language?.startsWith("pt") ? entry?.pt : entry?.en;
}

/** Chart angle keys are independent of numbered house cusps; missing rows stay absent. */
export function getAngleSignDescriptionEntry(
  angle: DescriptionAngle,
  sign: Sign,
): AngleSignDescriptionEntry | undefined {
  const angles = ASTROLOGY_DESCRIPTIONS.angleSigns;
  if (!angles || !Object.prototype.hasOwnProperty.call(angles, angle)) return undefined;
  const signs = angles[angle];
  if (!signs || !Object.prototype.hasOwnProperty.call(signs, sign)) return undefined;
  return signs[sign];
}

/** English by default; Portuguese for locale strings starting with `pt`. */
export function getAngleSignDescription(
  angle: DescriptionAngle,
  sign: Sign,
  language?: string,
): string | undefined {
  const entry = getAngleSignDescriptionEntry(angle, sign);
  return language?.startsWith("pt") ? entry?.pt : entry?.en;
}

/** General planetary functions; no placement-specific or inherited-key fallback. */
export function getPlanetDescriptionEntry(planet: DescriptionPlanet): PlanetDescriptionEntry | undefined {
  const planets = ASTROLOGY_DESCRIPTIONS.planets;
  if (!planets || !Object.prototype.hasOwnProperty.call(planets, planet)) return undefined;
  return planets[planet];
}

/** English by default; Portuguese for locale strings starting with `pt`. */
export function getPlanetDescription(planet: DescriptionPlanet, language?: string): string | undefined {
  const entry = getPlanetDescriptionEntry(planet);
  return language?.startsWith("pt") ? entry?.pt : entry?.en;
}

/** Zodiacal qualities, independently of a Sun, planet or angle placement. */
export function getSignDescriptionEntry(sign: Sign): SignDescriptionEntry | undefined {
  const signs = ASTROLOGY_DESCRIPTIONS.signs;
  if (!signs || !Object.prototype.hasOwnProperty.call(signs, sign)) return undefined;
  return signs[sign];
}

/** English by default; Portuguese for locale strings starting with `pt`. */
export function getSignDescription(sign: Sign, language?: string): string | undefined {
  const entry = getSignDescriptionEntry(sign);
  return language?.startsWith("pt") ? entry?.pt : entry?.en;
}

/** Four classical astrology elements, using the existing lowercase chart classification. */
export function getElementDescriptionEntry(element: DescriptionElement): ElementDescriptionEntry | undefined {
  const elements = ASTROLOGY_DESCRIPTIONS.elements;
  if (!elements || !Object.prototype.hasOwnProperty.call(elements, element)) return undefined;
  return elements[element];
}

/** English by default; Portuguese for locale strings starting with `pt`. */
export function getElementDescription(element: DescriptionElement, language?: string): string | undefined {
  const entry = getElementDescriptionEntry(element);
  return language?.startsWith("pt") ? entry?.pt : entry?.en;
}

/** Canonical modality names follow MODALITIES; unrecognized aliases remain gaps. */
export function getModalityDescriptionEntry(modality: DescriptionModality): ModalityDescriptionEntry | undefined {
  const modalities = ASTROLOGY_DESCRIPTIONS.modalities;
  if (!modalities || !Object.prototype.hasOwnProperty.call(modalities, modality)) return undefined;
  return modalities[modality];
}

/** English by default; Portuguese for locale strings starting with `pt`. */
export function getModalityDescription(modality: DescriptionModality, language?: string): string | undefined {
  const entry = getModalityDescriptionEntry(modality);
  return language?.startsWith("pt") ? entry?.pt : entry?.en;
}

/** Generic symbolic polarity definitions; no sign classification or inherited-key fallback. */
export function getPolarityDescriptionEntry(polarity: DescriptionPolarity): PolarityDescriptionEntry | undefined {
  const polarities = ASTROLOGY_DESCRIPTIONS.polarities;
  if (!polarities || !Object.prototype.hasOwnProperty.call(polarities, polarity)) return undefined;
  return polarities[polarity];
}

/** English by default; Portuguese for locale strings starting with `pt`. */
export function getPolarityDescription(polarity: DescriptionPolarity, language?: string): string | undefined {
  const entry = getPolarityDescriptionEntry(polarity);
  return language?.startsWith("pt") ? entry?.pt : entry?.en;
}

/** General angle concepts, independent of numbered cusps or angle-sign placements. */
export function getAngleDescriptionEntry(angle: DescriptionAngle): AngleDescriptionEntry | undefined {
  const angles = ASTROLOGY_DESCRIPTIONS.angles;
  if (!angles || !Object.prototype.hasOwnProperty.call(angles, angle)) return undefined;
  return angles[angle];
}

/** English by default; Portuguese for locale strings starting with `pt`. */
export function getAngleDescription(angle: DescriptionAngle, language?: string): string | undefined {
  const entry = getAngleDescriptionEntry(angle);
  return language?.startsWith("pt") ? entry?.pt : entry?.en;
}

/** General natal aspect types; no aspect-pair interpretation or inherited-key fallback. */
export function getAspectDescriptionEntry(aspect: DescriptionAspect): AspectDescriptionEntry | undefined {
  const aspects = ASTROLOGY_DESCRIPTIONS.aspects;
  if (!aspects || !Object.prototype.hasOwnProperty.call(aspects, aspect)) return undefined;
  return aspects[aspect];
}

/** English by default; Portuguese for locale strings starting with `pt`. */
export function getAspectDescription(aspect: DescriptionAspect, language?: string): string | undefined {
  const entry = getAspectDescriptionEntry(aspect);
  return language?.startsWith("pt") ? entry?.pt : entry?.en;
}
