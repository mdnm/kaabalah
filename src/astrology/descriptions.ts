import raw from "./descriptions.json";
import type { Sign } from "./dignity";

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

export interface AstrologyDescriptions {
  readonly planetSigns: Readonly<
    Partial<Record<DescriptionPlanet, Readonly<Partial<Record<Sign, PlanetSignDescriptionEntry>>>>>
  >;
  readonly planetHouses: Readonly<
    Partial<Record<DescriptionPlanet, Readonly<Partial<Record<DescriptionHouseNumber, PlanetHouseDescriptionEntry>>>>>
  >;
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
