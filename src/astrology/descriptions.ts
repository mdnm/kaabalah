import raw from "./descriptions.json";
import type { Sect } from "./index";
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

export type DescriptionPoint = "parsFortunae" | "chiron" | "lilith mean" | "lilith true";
export type PointDescriptionEntry = PlanetSignDescriptionEntry;
export type PointSignDescriptionEntry = PlanetSignDescriptionEntry;
export type PointHouseDescriptionEntry = PlanetSignDescriptionEntry;

export type DescriptionRetrogradePlanet = Exclude<DescriptionPlanet, "sun" | "moon">;
export type RetrogradePlanetDescriptionEntry = PlanetSignDescriptionEntry;

export type SectDescriptionEntry = PlanetSignDescriptionEntry;

export type DescriptionLunarNode = "north" | "south";
export type LunarNodeDescriptionEntry = PlanetSignDescriptionEntry;
export type LunarNodeSignDescriptionEntry = PlanetSignDescriptionEntry;
export type LunarNodeHouseDescriptionEntry = PlanetSignDescriptionEntry;

export interface AstrologyDescriptions {
  readonly lunarNodeHouseAxes?: Readonly<Partial<Record<DescriptionHouseNumber, LunarNodeHouseDescriptionEntry>>>;
  readonly lunarNodeSigns?: Readonly<
    Partial<Record<DescriptionLunarNode, Readonly<Partial<Record<Sign, LunarNodeSignDescriptionEntry>>>>>
  >;
  readonly lunarNodes?: Readonly<Partial<Record<DescriptionLunarNode, LunarNodeDescriptionEntry>>>;
  readonly sects?: Readonly<Partial<Record<Sect, SectDescriptionEntry>>>;
  readonly retrogradePlanets?: Readonly<Partial<Record<DescriptionRetrogradePlanet, RetrogradePlanetDescriptionEntry>>>;
  readonly chironPlacements?: Readonly<Partial<Record<Sign, PointSignDescriptionEntry>>>;
  readonly pointHouses?: Readonly<
    Partial<Record<DescriptionPoint, Readonly<Partial<Record<DescriptionHouseNumber, PointHouseDescriptionEntry>>>>>
  >;
  readonly pointSigns?: Readonly<
    Partial<Record<DescriptionPoint, Readonly<Partial<Record<Sign, PointSignDescriptionEntry>>>>>
  >;
  readonly points?: Readonly<Partial<Record<DescriptionPoint, PointDescriptionEntry>>>;
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

/** Additional natal factor concepts; Lilith modes share one interpretation. */
export function getPointDescriptionEntry(point: DescriptionPoint): PointDescriptionEntry | undefined {
  const key = point === "lilith true" ? "lilith mean" : point;
  const points = ASTROLOGY_DESCRIPTIONS.points;
  if (!points || !Object.prototype.hasOwnProperty.call(points, key)) return undefined;
  return points[key];
}

/** English by default; Portuguese for locale strings starting with `pt`. */
export function getPointDescription(point: DescriptionPoint, language?: string): string | undefined {
  const entry = getPointDescriptionEntry(point);
  return language?.startsWith("pt") ? entry?.pt : entry?.en;
}

/** Aliases only for the course's twelve combined Chiron sign-or-house accounts. */
const CHIRON_PLACEMENT_SIGN_BY_HOUSE = Object.freeze({
  1: "Aries", 2: "Taurus", 3: "Gemini", 4: "Cancer",
  5: "Leo", 6: "Virgo", 7: "Libra", 8: "Scorpio",
  9: "Sagittarius", 10: "Capricorn", 11: "Aquarius", 12: "Pisces",
} satisfies Readonly<Record<DescriptionHouseNumber, Sign>>);

/** Fortune sign manners, shared Lilith modes and combined Chiron accounts. */
export function getPointSignDescriptionEntry(
  point: DescriptionPoint,
  sign: Sign,
): PointSignDescriptionEntry | undefined {
  if (point === "chiron") {
    const placements = ASTROLOGY_DESCRIPTIONS.chironPlacements;
    if (!placements || !Object.prototype.hasOwnProperty.call(placements, sign)) return undefined;
    return placements[sign];
  }
  const key = point === "lilith true" ? "lilith mean" : point;
  const points = ASTROLOGY_DESCRIPTIONS.pointSigns;
  if (!points || !Object.prototype.hasOwnProperty.call(points, key)) return undefined;
  const signs = points[key];
  if (!signs || !Object.prototype.hasOwnProperty.call(signs, sign)) return undefined;
  return signs[sign];
}

/** English by default; Portuguese for locale strings starting with `pt`. */
export function getPointSignDescription(
  point: DescriptionPoint,
  sign: Sign,
  language?: string,
): string | undefined {
  const entry = getPointSignDescriptionEntry(point, sign);
  return language?.startsWith("pt") ? entry?.pt : entry?.en;
}

/** Fortune house fields and source-specific shared Chiron accounts. */
export function getPointHouseDescriptionEntry(
  point: DescriptionPoint,
  house: number,
): PointHouseDescriptionEntry | undefined {
  if (!Number.isInteger(house) || house < 1 || house > 12) return undefined;
  if (point === "chiron") {
    if (!Object.prototype.hasOwnProperty.call(CHIRON_PLACEMENT_SIGN_BY_HOUSE, house)) return undefined;
    return getPointSignDescriptionEntry("chiron", CHIRON_PLACEMENT_SIGN_BY_HOUSE[house as DescriptionHouseNumber]);
  }
  const points = ASTROLOGY_DESCRIPTIONS.pointHouses;
  if (!points || !Object.prototype.hasOwnProperty.call(points, point)) return undefined;
  const houses = points[point];
  if (!houses || !Object.prototype.hasOwnProperty.call(houses, house)) return undefined;
  return houses[house as DescriptionHouseNumber];
}

/** English by default; Portuguese for locale strings starting with `pt`. */
export function getPointHouseDescription(
  point: DescriptionPoint,
  house: number,
  language?: string,
): string | undefined {
  const entry = getPointHouseDescriptionEntry(point, house);
  return language?.startsWith("pt") ? entry?.pt : entry?.en;
}

/** Natal retrograde profiles require an available finite negative longitude speed. */
export function getRetrogradePlanetDescriptionEntry(
  planet: DescriptionRetrogradePlanet,
  longitudeSpeed?: number,
): RetrogradePlanetDescriptionEntry | undefined {
  if (typeof longitudeSpeed !== "number" || !Number.isFinite(longitudeSpeed) || longitudeSpeed >= 0) return undefined;
  const planets = ASTROLOGY_DESCRIPTIONS.retrogradePlanets;
  if (!planets || !Object.prototype.hasOwnProperty.call(planets, planet)) return undefined;
  return planets[planet];
}

/** English by default; Portuguese for locale strings starting with `pt`. */
export function getRetrogradePlanetDescription(
  planet: DescriptionRetrogradePlanet,
  longitudeSpeed?: number,
  language?: string,
): string | undefined {
  const entry = getRetrogradePlanetDescriptionEntry(planet, longitudeSpeed);
  return language?.startsWith("pt") ? entry?.pt : entry?.en;
}

/** Pure lookup for an already determined chart sect; no altitude or house inference. */
export function getSectDescriptionEntry(sect: Sect): SectDescriptionEntry | undefined {
  const sects = ASTROLOGY_DESCRIPTIONS.sects;
  if (!sects || !Object.prototype.hasOwnProperty.call(sects, sect)) return undefined;
  return sects[sect];
}

/** English by default; Portuguese for locale strings starting with `pt`. */
export function getSectDescription(sect: Sect, language?: string): string | undefined {
  const entry = getSectDescriptionEntry(sect);
  return language?.startsWith("pt") ? entry?.pt : entry?.en;
}

/** Conceptual astronomical roles, independent of mean/true chart storage modes. */
export function getLunarNodeDescriptionEntry(node: DescriptionLunarNode): LunarNodeDescriptionEntry | undefined {
  const nodes = ASTROLOGY_DESCRIPTIONS.lunarNodes;
  if (!nodes || !Object.prototype.hasOwnProperty.call(nodes, node)) return undefined;
  return nodes[node];
}

/** English by default; Portuguese for locale strings starting with `pt`. */
export function getLunarNodeDescription(node: DescriptionLunarNode, language?: string): string | undefined {
  const entry = getLunarNodeDescriptionEntry(node);
  return language?.startsWith("pt") ? entry?.pt : entry?.en;
}

/** Independent node-role/sign records; no opposite-node or chart-mode inference. */
export function getLunarNodeSignDescriptionEntry(
  node: DescriptionLunarNode,
  sign: Sign,
): LunarNodeSignDescriptionEntry | undefined {
  const nodes = ASTROLOGY_DESCRIPTIONS.lunarNodeSigns;
  if (!nodes || !Object.prototype.hasOwnProperty.call(nodes, node)) return undefined;
  const signs = nodes[node];
  if (!signs || !Object.prototype.hasOwnProperty.call(signs, sign)) return undefined;
  return signs[sign];
}

/** English by default; Portuguese for locale strings starting with `pt`. */
export function getLunarNodeSignDescription(
  node: DescriptionLunarNode,
  sign: Sign,
  language?: string,
): string | undefined {
  const entry = getLunarNodeSignDescriptionEntry(node, sign);
  return language?.startsWith("pt") ? entry?.pt : entry?.en;
}

/** Source aliases for directed joint axes, not a calculation of node positions. */
const LUNAR_NODE_NORTH_HOUSE_BY_SOUTH_HOUSE = Object.freeze({
  1: 7, 2: 8, 3: 9, 4: 10, 5: 11, 6: 12,
  7: 1, 8: 2, 9: 3, 10: 4, 11: 5, 12: 6,
} satisfies Readonly<Record<DescriptionHouseNumber, DescriptionHouseNumber>>);

/** Each source-declared north/south pair shares one directed axis account. */
export function getLunarNodeHouseDescriptionEntry(
  node: DescriptionLunarNode,
  house: number,
): LunarNodeHouseDescriptionEntry | undefined {
  if (node !== "north" && node !== "south") return undefined;
  if (!Number.isInteger(house) || house < 1 || house > 12) return undefined;
  const axes = ASTROLOGY_DESCRIPTIONS.lunarNodeHouseAxes;
  if (!axes) return undefined;
  const northHouse = node === "north"
    ? house as DescriptionHouseNumber
    : LUNAR_NODE_NORTH_HOUSE_BY_SOUTH_HOUSE[house as DescriptionHouseNumber];
  if (!Object.prototype.hasOwnProperty.call(axes, northHouse)) return undefined;
  return axes[northHouse];
}

/** English by default; Portuguese for locale strings starting with `pt`. */
export function getLunarNodeHouseDescription(
  node: DescriptionLunarNode,
  house: number,
  language?: string,
): string | undefined {
  const entry = getLunarNodeHouseDescriptionEntry(node, house);
  return language?.startsWith("pt") ? entry?.pt : entry?.en;
}
