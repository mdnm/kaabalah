/**
 * Several house systems from ONE ephemeris calculation.
 *
 * Planetary positions, sect and the Lots of Fortune/Spirit do not depend on the house
 * system (sect comes from the Sun's altitude at the place; Fortune/Spirit use the Ascendant,
 * which Swiss returns identically for every system), so they are computed once. Only the
 * cusps, the descendant/IC and each point's house placement are produced per system.
 */

import { computeLots, type LotsResult } from "./lots";
import { findHouseOf } from "./index";
import {
  type ChartPoint,
  chartPointsFromPlanetPositions,
  type PointId,
  POINT_DEFINITIONS,
} from "./points";
import { computeSect, type SectResult } from "./sect";
import {
  calculateBodyAtJulianDay,
  calculateHousesAtJulianDay,
  CalcFlag,
  type HouseSystem,
  type LocalDateTimeParts,
  normalizeAngle,
  Planet,
  type PlanetPosition,
  type TimeZoneOptions,
  toUtcDate,
} from "./swisseph";

export interface HousesForSystemsDateInput {
  /** Local civil time (interpreted via `timeZoneSettings`) or a UTC instant with `treatAsUTC`. */
  date: Date | LocalDateTimeParts;
  latitude: number;
  longitude: number;
  timeZoneSettings?: TimeZoneOptions;
}

export interface HousesForSystemsJulianInput {
  julianDayUt: number;
  latitude: number;
  longitude: number;
}

export type HousesForSystemsInput = HousesForSystemsDateInput | HousesForSystemsJulianInput;

export interface SystemHouses {
  system: HouseSystem;
  /** 12 cusp longitudes, house 1 first, normalised to [0, 360). */
  cusps: number[];
  ascendant: number;
  mc: number;
  descendant: number;
  ic: number;
  vertex?: number;
  /** House number (1-12) of each point under THIS system (planets, nodes, Lilith, Chiron, lots). */
  placements: Partial<Record<PointId, number>>;
}

export interface HouseSystemFailure {
  system: HouseSystem;
  message: string;
}

export interface HousesForSystemsResult {
  julianDayUt: number;
  dateUtc: Date;
  latitude: number;
  longitude: number;
  /** Positions computed once (shared by every system). */
  points: ChartPoint[];
  /** House-system independent. */
  sect: SectResult;
  lots: LotsResult;
  systems: Partial<Record<HouseSystem, SystemHouses>>;
  /** Systems Swiss could not compute (for example Placidus/Koch at polar latitudes). */
  failures: HouseSystemFailure[];
  method: {
    ephemerisCalculations: "planets and sect computed once; houses computed once per system";
    flags: number;
  };
}

const JD_UNIX_EPOCH = 2440587.5;
const MS_PER_DAY = 86_400_000;
const FLAGS = CalcFlag.SWISS_EPH | CalcFlag.SPEED;

const PLANET_ENUMS: Planet[] = [
  Planet.SUN,
  Planet.MOON,
  Planet.MERCURY,
  Planet.VENUS,
  Planet.MARS,
  Planet.JUPITER,
  Planet.SATURN,
  Planet.URANUS,
  Planet.NEPTUNE,
  Planet.PLUTO,
  Planet.MEAN_NODE,
  Planet.TRUE_NODE,
  Planet.LILITH_MEAN,
  Planet.LILITH_TRUE,
  Planet.CHIRON,
];

function isJulianInput(input: HousesForSystemsInput): input is HousesForSystemsJulianInput {
  return typeof (input as HousesForSystemsJulianInput).julianDayUt === "number";
}

/**
 * Compute `systems` (deduplicated, order preserved) for one moment and place.
 * Throws if `systems` is empty. A system Swiss cannot compute is reported in `failures`
 * instead of aborting the others.
 */
export async function getHousesForSystems(
  input: HousesForSystemsInput,
  systems: readonly HouseSystem[]
): Promise<HousesForSystemsResult> {
  if (!Array.isArray(systems) || systems.length === 0) {
    throw new Error("getHousesForSystems requires at least one house system");
  }
  const { latitude, longitude } = input;

  let julianDayUt: number;
  let dateUtc: Date;
  if (isJulianInput(input)) {
    julianDayUt = input.julianDayUt;
    dateUtc = new Date((julianDayUt - JD_UNIX_EPOCH) * MS_PER_DAY);
  } else {
    dateUtc = await toUtcDate(input.date, latitude, longitude, input.timeZoneSettings ?? { autoTimeZone: true });
    julianDayUt = dateUtc.getTime() / MS_PER_DAY + JD_UNIX_EPOCH;
  }

  const positions: Partial<Record<number, PlanetPosition>> = {};
  for (const p of PLANET_ENUMS) positions[p] = calculateBodyAtJulianDay(julianDayUt, p, FLAGS);
  const planetPoints = chartPointsFromPlanetPositions(positions);
  const sun = positions[Planet.SUN] as PlanetPosition;
  const moon = positions[Planet.MOON] as PlanetPosition;
  const sect = computeSect(dateUtc, latitude, longitude, sun);

  const uniqueSystems = [...new Set(systems)];
  const raw: Array<{ system: HouseSystem; houses: ReturnType<typeof calculateHousesAtJulianDay> }> = [];
  const failures: HouseSystemFailure[] = [];
  for (const system of uniqueSystems) {
    try {
      raw.push({ system, houses: calculateHousesAtJulianDay(julianDayUt, latitude, longitude, system) });
    } catch (error) {
      failures.push({ system, message: error instanceof Error ? error.message : String(error) });
    }
  }
  if (raw.length === 0) {
    throw new Error(`No house system could be computed: ${failures.map((f) => `${f.system}: ${f.message}`).join("; ")}`);
  }

  // The Ascendant is the same for every house system; take it from the first one that worked.
  const asc = normalizeAngle(raw[0].houses.ascendant);
  const lots = computeLots(asc, sun.longitude, moon.longitude, sect.sect);
  const lotPoints: ChartPoint[] = (["lot-fortune", "lot-spirit"] as const).map((id) => {
    const def = POINT_DEFINITIONS[id];
    return {
      id,
      kind: def.kind,
      longitude: id === "lot-fortune" ? lots.fortune : lots.spirit,
      speed: null,
      legacyKey: def.legacyKey,
      legacySource: def.legacySource,
      flags: { derived: true, timeDependent: true },
    };
  });
  const points = [...planetPoints, ...lotPoints];

  const bySystem: Partial<Record<HouseSystem, SystemHouses>> = {};
  for (const { system, houses } of raw) {
    const cusps = houses.houses.slice(1, 13).map(normalizeAngle);
    const placements: Partial<Record<PointId, number>> = {};
    for (const p of points) placements[p.id] = findHouseOf(p.longitude, cusps);
    bySystem[system] = {
      system,
      cusps,
      ascendant: normalizeAngle(houses.ascendant),
      mc: normalizeAngle(houses.mc),
      descendant: normalizeAngle(houses.ascendant + 180),
      ic: normalizeAngle(houses.mc + 180),
      vertex: houses.ascmc ? normalizeAngle(houses.ascmc.vertex) : undefined,
      placements,
    };
  }

  return {
    julianDayUt,
    dateUtc,
    latitude,
    longitude,
    points,
    sect,
    lots,
    systems: bySystem,
    failures,
    method: {
      ephemerisCalculations: "planets and sect computed once; houses computed once per system",
      flags: FLAGS,
    },
  };
}
