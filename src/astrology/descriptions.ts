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
  /** Editorial provenance is not published: always an empty array. Kept so callers compile. */
  readonly src: readonly {
    readonly file: string;
    readonly from: number;
    readonly to: number;
  }[];
  /** Editorial review notes. Same rule as `src`: always an empty array. */
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

export type DescriptionPoint =
  | "parsFortunae" | "chiron" | "lilith mean" | "lilith true" | "vertex" | "antivertex";
export type PointDescriptionEntry = PlanetSignDescriptionEntry;
export type PointSignDescriptionEntry = PlanetSignDescriptionEntry;
export type PointHouseDescriptionEntry = PlanetSignDescriptionEntry;

export type DescriptionRetrogradePlanet = Exclude<DescriptionPlanet, "sun" | "moon">;
export type RetrogradePlanetDescriptionEntry = PlanetSignDescriptionEntry;

export type RetrogradePlanetSignDescriptionEntry = PlanetSignDescriptionEntry;
export type RetrogradePlanetHouseDescriptionEntry = PlanetSignDescriptionEntry;

export type HouseCuspSignDescriptionEntry = PlanetSignDescriptionEntry;
export type VertexContactDescriptionEntry = PlanetSignDescriptionEntry;

/** Unordered planet pair key, always written in Sun-through-Pluto order. */
export type DescriptionPlanetPair = `${DescriptionPlanet}/${DescriptionPlanet}`;
export type AspectPairDescriptionEntry = PlanetSignDescriptionEntry;

export type SunAscendantDescriptionEntry = PlanetSignDescriptionEntry;
export type SymbolicDegreeDescriptionEntry = PlanetSignDescriptionEntry;
export type DescriptionDignityStatus = "domicile" | "exaltation" | "detriment" | "fall" | "peregrine";
export type DignityStatusDescriptionEntry = PlanetSignDescriptionEntry;
export type DescriptionDecanNumber = 1 | 2 | 3;
export type DecanDescriptionEntry = PlanetSignDescriptionEntry;

export type SectDescriptionEntry = PlanetSignDescriptionEntry;

export type DescriptionLunarNode = "north" | "south";
export type LunarNodeDescriptionEntry = PlanetSignDescriptionEntry;
export type LunarNodeSignDescriptionEntry = PlanetSignDescriptionEntry;
export type LunarNodeHouseDescriptionEntry = PlanetSignDescriptionEntry;

export interface AstrologyDescriptions {
  readonly decans?: Readonly<
    Partial<Record<Sign, Readonly<Partial<Record<DescriptionDecanNumber, DecanDescriptionEntry>>>>>
  >;
  readonly decanConcept?: DecanDescriptionEntry;
  readonly dignityStatuses?: Readonly<Partial<Record<DescriptionDignityStatus, DignityStatusDescriptionEntry>>>;
  readonly symbolicDegrees?: Readonly<
    Partial<Record<Sign, Readonly<Partial<Record<number, SymbolicDegreeDescriptionEntry>>>>>
  >;
  readonly sunAscendantSigns?: Readonly<
    Partial<Record<Sign, Readonly<Partial<Record<Sign, SunAscendantDescriptionEntry>>>>>
  >;
  readonly aspectPairs?: Readonly<
    Partial<Record<DescriptionAspect, Readonly<Partial<Record<DescriptionPlanetPair, AspectPairDescriptionEntry>>>>>
  >;
  readonly vertexPlanetContacts?: Readonly<Partial<Record<DescriptionPlanet, VertexContactDescriptionEntry>>>;
  readonly retrogradePlanetHouses?: Readonly<
    Partial<Record<
      DescriptionRetrogradePlanet,
      Readonly<Partial<Record<DescriptionHouseNumber, RetrogradePlanetHouseDescriptionEntry>>>
    >>
  >;
  readonly retrogradePlanetSigns?: Readonly<
    Partial<Record<DescriptionRetrogradePlanet, Readonly<Partial<Record<Sign, RetrogradePlanetSignDescriptionEntry>>>>>
  >;
  readonly houseCuspSigns?: Readonly<
    Partial<Record<DescriptionHouseNumber, Readonly<Partial<Record<Sign, HouseCuspSignDescriptionEntry>>>>>
  >;
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
    const row = value as { pt?: unknown; en?: unknown; keywords?: unknown; src?: unknown; reviewNotes?: unknown };
    // The JSON carries no editorial provenance; fill the empty fields so the entry shape stays stable.
    if (typeof row.pt === "string" && typeof row.en === "string" && row.keywords && typeof row.keywords === "object") {
      row.src ??= [];
      row.reviewNotes ??= [];
    }
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

// The JSON rows carry no `src`/`reviewNotes`; `freeze` adds the empty arrays the entry types promise.
export const ASTROLOGY_DESCRIPTIONS: AstrologyDescriptions = freeze(raw as unknown as AstrologyDescriptions);

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

/** The Vertex by sign reuses its house account through the natural house of the sign (Leo = house 5). */
const NATURAL_HOUSE_BY_SIGN = Object.freeze({
  Aries: 1, Taurus: 2, Gemini: 3, Cancer: 4, Leo: 5, Virgo: 6,
  Libra: 7, Scorpio: 8, Sagittarius: 9, Capricorn: 10, Aquarius: 11, Pisces: 12,
} satisfies Readonly<Record<Sign, DescriptionHouseNumber>>);

/** Fortune sign manners, shared Lilith modes, combined Chiron accounts and Vertex house aliases. */
export function getPointSignDescriptionEntry(
  point: DescriptionPoint,
  sign: Sign,
): PointSignDescriptionEntry | undefined {
  if (point === "vertex") {
    if (!Object.prototype.hasOwnProperty.call(NATURAL_HOUSE_BY_SIGN, sign)) return undefined;
    return own(own(ASTROLOGY_DESCRIPTIONS.pointHouses, "vertex"), NATURAL_HOUSE_BY_SIGN[sign]);
  }
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
  if (point === "lilith mean" || point === "lilith true") {
    // Inferred from the sign accounts through the natural sign of the house (house 5 = Leo).
    return getPointSignDescriptionEntry(point, CHIRON_PLACEMENT_SIGN_BY_HOUSE[house as DescriptionHouseNumber]);
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

function own<T extends object, K extends PropertyKey>(table: T | undefined, key: K): T[K & keyof T] | undefined {
  if (!table || !Object.prototype.hasOwnProperty.call(table, key)) return undefined;
  return table[key as K & keyof T];
}

function isRetrogradeSpeed(longitudeSpeed?: number): boolean {
  return typeof longitudeSpeed === "number" && Number.isFinite(longitudeSpeed) && longitudeSpeed < 0;
}

/** Sign on a numbered house cusp; not an angle lookup, and source gaps stay absent. */
export function getHouseCuspSignDescriptionEntry(
  house: number,
  sign: Sign,
): HouseCuspSignDescriptionEntry | undefined {
  if (!Number.isInteger(house) || house < 1 || house > 12) return undefined;
  return own(own(ASTROLOGY_DESCRIPTIONS.houseCuspSigns, house as DescriptionHouseNumber), sign);
}

/** English by default; Portuguese for locale strings starting with `pt`. */
export function getHouseCuspSignDescription(house: number, sign: Sign, language?: string): string | undefined {
  const entry = getHouseCuspSignDescriptionEntry(house, sign);
  return language?.startsWith("pt") ? entry?.pt : entry?.en;
}

/** Natal retrograde sign accounts; requires a finite negative longitude speed. Outer-planet coverage is partial. */
export function getRetrogradePlanetSignDescriptionEntry(
  planet: DescriptionRetrogradePlanet,
  sign: Sign,
  longitudeSpeed?: number,
): RetrogradePlanetSignDescriptionEntry | undefined {
  if (!isRetrogradeSpeed(longitudeSpeed)) return undefined;
  return own(own(ASTROLOGY_DESCRIPTIONS.retrogradePlanetSigns, planet), sign);
}

/** English by default; Portuguese for locale strings starting with `pt`. */
export function getRetrogradePlanetSignDescription(
  planet: DescriptionRetrogradePlanet,
  sign: Sign,
  longitudeSpeed?: number,
  language?: string,
): string | undefined {
  const entry = getRetrogradePlanetSignDescriptionEntry(planet, sign, longitudeSpeed);
  return language?.startsWith("pt") ? entry?.pt : entry?.en;
}

/** Natal retrograde house accounts; requires a finite negative longitude speed. */
export function getRetrogradePlanetHouseDescriptionEntry(
  planet: DescriptionRetrogradePlanet,
  house: number,
  longitudeSpeed?: number,
): RetrogradePlanetHouseDescriptionEntry | undefined {
  if (!isRetrogradeSpeed(longitudeSpeed)) return undefined;
  if (!Number.isInteger(house) || house < 1 || house > 12) return undefined;
  return own(own(ASTROLOGY_DESCRIPTIONS.retrogradePlanetHouses, planet), house as DescriptionHouseNumber);
}

/** English by default; Portuguese for locale strings starting with `pt`. */
export function getRetrogradePlanetHouseDescription(
  planet: DescriptionRetrogradePlanet,
  house: number,
  longitudeSpeed?: number,
  language?: string,
): string | undefined {
  const entry = getRetrogradePlanetHouseDescriptionEntry(planet, house, longitudeSpeed);
  return language?.startsWith("pt") ? entry?.pt : entry?.en;
}

/** Planet in contact with the Vertex; the caller decides what counts as a contact. */
export function getVertexContactDescriptionEntry(
  planet: DescriptionPlanet,
): VertexContactDescriptionEntry | undefined {
  return own(ASTROLOGY_DESCRIPTIONS.vertexPlanetContacts, planet);
}

/** English by default; Portuguese for locale strings starting with `pt`. */
export function getVertexContactDescription(planet: DescriptionPlanet, language?: string): string | undefined {
  const entry = getVertexContactDescriptionEntry(planet);
  return language?.startsWith("pt") ? entry?.pt : entry?.en;
}

const DESCRIPTION_PLANET_ORDER: readonly DescriptionPlanet[] = Object.freeze([
  "sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto",
]);

/**
 * Natal aspect between two planets, in either argument order. Only source-located
 * aspect/pair combinations exist; there is no fallback to the general aspect concept.
 */
export function getAspectPairDescriptionEntry(
  aspect: DescriptionAspect,
  planetA: DescriptionPlanet,
  planetB: DescriptionPlanet,
): AspectPairDescriptionEntry | undefined {
  const a = DESCRIPTION_PLANET_ORDER.indexOf(planetA);
  const b = DESCRIPTION_PLANET_ORDER.indexOf(planetB);
  if (a < 0 || b < 0 || a === b) return undefined;
  const pair = (a < b ? `${planetA}/${planetB}` : `${planetB}/${planetA}`) as DescriptionPlanetPair;
  return own(own(ASTROLOGY_DESCRIPTIONS.aspectPairs, aspect), pair);
}

/** English by default; Portuguese for locale strings starting with `pt`. */
export function getAspectPairDescription(
  aspect: DescriptionAspect,
  planetA: DescriptionPlanet,
  planetB: DescriptionPlanet,
  language?: string,
): string | undefined {
  const entry = getAspectPairDescriptionEntry(aspect, planetA, planetB);
  return language?.startsWith("pt") ? entry?.pt : entry?.en;
}

/** Sun sign combined with the Ascendant sign; distinct from the standalone Ascendant profiles. */
export function getSunAscendantDescriptionEntry(
  sunSign: Sign,
  ascendantSign: Sign,
): SunAscendantDescriptionEntry | undefined {
  return own(own(ASTROLOGY_DESCRIPTIONS.sunAscendantSigns, sunSign), ascendantSign);
}

/** English by default; Portuguese for locale strings starting with `pt`. */
export function getSunAscendantDescription(sunSign: Sign, ascendantSign: Sign, language?: string): string | undefined {
  const entry = getSunAscendantDescriptionEntry(sunSign, ascendantSign);
  return language?.startsWith("pt") ? entry?.pt : entry?.en;
}

const DESCRIPTION_SIGN_ORDER: readonly Sign[] = Object.freeze([
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]);

/**
 * Ordinal symbolic degree of an ecliptic longitude, by the course rule: 18°00′ is the
 * 18th degree, anything from 18°00′01″ up to 19°00′ is the 19th. An exact sign boundary
 * therefore belongs to the 30th degree of the previous sign.
 */
export function getSymbolicDegreeNumber(longitude: number): { sign: Sign; degree: number } | undefined {
  if (typeof longitude !== "number" || !Number.isFinite(longitude)) return undefined;
  const normalized = ((longitude % 360) + 360) % 360;
  const ordinal = Math.ceil(normalized);
  if (ordinal === 0) return { sign: "Pisces", degree: 30 };
  return { sign: DESCRIPTION_SIGN_ORDER[Math.floor((ordinal - 1) / 30)], degree: ((ordinal - 1) % 30) + 1 };
}

/** Symbolic degree image (monomer) for an ordinal degree 1 to 30 of a sign. */
export function getSymbolicDegreeDescriptionEntry(
  sign: Sign,
  degree: number,
): SymbolicDegreeDescriptionEntry | undefined {
  if (!Number.isInteger(degree) || degree < 1 || degree > 30) return undefined;
  return own(own(ASTROLOGY_DESCRIPTIONS.symbolicDegrees, sign), degree);
}

/** English by default; Portuguese for locale strings starting with `pt`. */
export function getSymbolicDegreeDescription(sign: Sign, degree: number, language?: string): string | undefined {
  const entry = getSymbolicDegreeDescriptionEntry(sign, degree);
  return language?.startsWith("pt") ? entry?.pt : entry?.en;
}

/** Essential-dignity status concepts; which planet holds which status is computed elsewhere. */
export function getDignityStatusDescriptionEntry(
  status: DescriptionDignityStatus,
): DignityStatusDescriptionEntry | undefined {
  return own(ASTROLOGY_DESCRIPTIONS.dignityStatuses, status);
}

/** English by default; Portuguese for locale strings starting with `pt`. */
export function getDignityStatusDescription(status: DescriptionDignityStatus, language?: string): string | undefined {
  const entry = getDignityStatusDescriptionEntry(status);
  return language?.startsWith("pt") ? entry?.pt : entry?.en;
}

/** Decan profile by sign and decan number 1 to 3 (ten degrees each); omit both for the method concept. */
export function getDecanDescriptionEntry(sign?: Sign, decan?: number): DecanDescriptionEntry | undefined {
  if (sign === undefined && decan === undefined) return ASTROLOGY_DESCRIPTIONS.decanConcept;
  if (sign === undefined || decan === undefined || !Number.isInteger(decan) || decan < 1 || decan > 3) return undefined;
  return own(own(ASTROLOGY_DESCRIPTIONS.decans, sign), decan as DescriptionDecanNumber);
}

/** English by default; Portuguese for locale strings starting with `pt`. */
export function getDecanDescription(sign?: Sign, decan?: number, language?: string): string | undefined {
  const entry = getDecanDescriptionEntry(sign, decan);
  return language?.startsWith("pt") ? entry?.pt : entry?.en;
}
