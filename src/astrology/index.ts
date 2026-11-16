/**
 * Astrological calculations using Swiss Ephemeris
 */

import {
  type AzaltResult,
  CalcFlag,
  calcParsFortunae,
  calculateHouses,
  calculatePlanetaryPositions,
  calculateSinglePlanetPosition,
  closeSwissEph,
  getSwissEph,
  resolveSwissEphRuntimeAssets,
  HouseSystem,
  normalizeAngle,
  Planet,
  PLANET_AND_NODE_NAMES,
  PlanetPosition,
  type LocalDateTimeParts,
  type ResolveSwissEphRuntimeAssetsOptions,
  RiseTransitFlag,
  SwissEphError,
  type SwissEphRuntimeAssetPaths,
  TimeZoneOptions,
  toUtcDate,
  VirtualNodes,
} from "./swisseph";

export {
  type AzaltResult,
  type LocalDateTimeParts,
  CalcFlag,
  closeSwissEph,
  getSwissEph,
  type ResolveSwissEphRuntimeAssetsOptions,
  type SwissEphRuntimeAssetPaths,
  resolveSwissEphRuntimeAssets,
  HouseSystem,
  normalizeAngle,
  Planet,
  PLANET_AND_NODE_NAMES,
  RiseTransitFlag,
  VirtualNodes
};

export * from "./astrocartography";
export * from "./aspects";
export * from "./dignity";
export * from "./descriptions";
export * from "./decans";
export * from "./dodecatemoria";
export * from "./profections";
export * from "./firdaria";
export * from "./root-solver";
export * from "./returns";
export * from "./transit-events";
export * from "./sect";
export * from "./lots";
export * from "./moon-phase";
export * from "./composite";
export * from "./jyotish";
export * from "./points";
export * from "./orb-policy";
export * from "./quality";
export * from "./house-systems";
export * from "./overlays";
export * from "./davison";
export * from "./progressions";
export * from "./timelines";
export * from "./collection";
export * from "./cache-key";
export * from "./capabilities";
export {
  getSwissEphInfo,
  setSwissEphStrictEphemeris,
  calculatePlanetPositionDetailed,
  withSwissEphState,
  SwissEphError,
  SwissEphEphemerisMismatchError,
  ephemerisFromFlags,
  resolveSwissEphRuntimeAssetsAsync,
  type SwissEphInfo,
  type PlanetPositionDetailed,
  type SwissEphemerisKind,
  type SwissEphErrorCode,
  type GetSwissEphOptions,
} from "./swisseph";
import {
  computeCompositeAngles,
  computeCompositeCusps,
  compositeMidpoint,
  ANTIPODAL_POLICY_TEXT,
  DEFAULT_ANTIPODAL_EPSILON,
  type CompositeAngles,
  type CompositeMethod,
  type CompositeNotice,
} from "./composite";
import { computeLots, type LotsResult } from "./lots";
import { computeMoonPhase, type MoonPhaseResult } from "./moon-phase";
import { computeSect, type SectResult } from "./sect";
import { findTransitPerfections, type PerfectionSolverMetadata, type TransitClosestApproach } from "./transit-events";
import { getChartAtJulianDay } from "./progressions";
import { findPlanetaryReturns, type RootSolverMethodMetadata } from "./returns";
import { dateToJd, type RootDirection, type RootSearchCoverage } from "./root-solver";
import {
  computeAspects,
  computeSynastryAspects,
  computeTransitAspects,
  DEFAULT_ASPECT_SPECS,
  SLOW_PLANETS,
  type AspectEdge,
  type AspectName,
  type AspectSpec,
  type TransitAspectEdge,
  type TransitAspectPoint,
} from "./aspects";

export interface BirthChartOptions {
  /**
   * Local civil date-time for the chart moment.
   * Prefer `LocalDateTimeParts` when the source data comes from separate
   * date/time inputs so callers do not have to encode wall-clock parts into a
   * browser-local `Date`.
   */
  date: Date | LocalDateTimeParts;
  latitude: number;
  longitude: number;
  houseSystem?: HouseSystem;
  /**
   * OPT-IN substitute used only when the requested house system cannot be computed at this
   * latitude (Placidus and Koch are undefined beyond the polar circle, |latitude| >= ~66.56).
   * Default: off, and `getBirthChart` then throws a `SwissEphError` with code
   * `SWISSEPH_HOUSES_UNAVAILABLE`. When a substitution happens it is never silent:
   * `BirthChart.houseSystem` is the system actually used and
   * `BirthChart.houseSystemSubstitution` records the request, the reason and a notice.
   */
  houseSystemFallback?: HouseSystemFallback;
  timeZoneSettings?: TimeZoneOptions;
}

/** Latitude-independent house systems accepted as an explicit fallback. */
export type HouseSystemFallback = "whole-sign" | "equal" | "porphyry";

const HOUSE_FALLBACK_SYSTEMS: Record<HouseSystemFallback, HouseSystem> = {
  "whole-sign": HouseSystem.WHOLE_SIGN,
  equal: HouseSystem.EQUAL,
  porphyry: HouseSystem.PORPHYRIUS,
};

/** Recorded on a chart when `houseSystemFallback` replaced the requested house system. */
export interface HouseSystemSubstitution {
  requested: HouseSystem;
  used: HouseSystem;
  latitude: number;
  reason: string;
  notice: string;
}

/**
 * Decide the fallback for a failed house computation. Returns undefined when no fallback is
 * configured or the error is not a "house system unavailable" error (the caller rethrows).
 */
export function planHouseSystemFallback(
  requested: HouseSystem,
  fallback: HouseSystemFallback | undefined,
  latitude: number,
  error: unknown
): HouseSystemSubstitution | undefined {
  if (!fallback || !(error instanceof SwissEphError) || error.code !== "SWISSEPH_HOUSES_UNAVAILABLE") {
    return undefined;
  }
  const used = HOUSE_FALLBACK_SYSTEMS[fallback];
  if (!used || used === requested) return undefined;
  const reason = error.message;
  return {
    requested,
    used,
    latitude,
    reason,
    notice:
      `House system "${requested}" is unavailable at latitude ${latitude}; ` +
      `substituted "${used}" because houseSystemFallback="${fallback}" was requested.`,
  };
}

export type ZodiacPosition = {
  sign: string;
  decimalDegrees: number; // degrees within the sign (0–30)
  traditionalFormat: string; // "D°MM'"
  decimal: string; // "D.dd°"
  longitude: number;
  house: number;
};
export type HydratedNode = ZodiacPosition & { id: VirtualNodes; name: string };
export type HydratedPlanet = PlanetPosition & {
  id: Planet;
  name: string;
  zodiacPosition: ZodiacPosition;
};
export type Sect = "diurnal" | "nocturnal";

export interface BirthChart {
  dateUtc: Date;
  /** House system the cusps were computed with (set by `getBirthChart`; optional for hand-built fixtures). */
  houseSystem?: HouseSystem;
  /** Present only when `houseSystemFallback` replaced the requested system (never a silent substitution). */
  houseSystemSubstitution?: HouseSystemSubstitution;
  planets: Record<string, HydratedPlanet>;
  nodes: Record<string, HydratedNode>;
  houses: {
    ascendant: ZodiacPosition;
    mc: ZodiacPosition;
    dc: ZodiacPosition;
    ic: ZodiacPosition;
    houses: ZodiacPosition[];
    ascmc?: {
      armc?: ZodiacPosition;
      vertex?: ZodiacPosition;
      equasc?: ZodiacPosition;
      coasc1?: ZodiacPosition;
      coasc2?: ZodiacPosition;
      polasc?: ZodiacPosition;
    };
  };
  aspects: AspectEdge[];
  /** Diurnal/nocturnal from the Sun's geometric altitude (independent of house system). */
  sect: Sect;
  /** Sun altitudes and the exact-horizon convention behind `sect` (always set by `getBirthChart`; optional so hand-built fixtures still type-check). */
  sectDetails?: SectResult;
  /** Lots of Fortune and Spirit (sect-reversed counterparts) with formulas used. */
  lots?: LotsResult & { fortunePosition: ZodiacPosition; spiritPosition: ZodiacPosition };
  /** Sun-Moon elongation, phase name and illumination (labelled approximate). */
  moonPhase?: MoonPhaseResult;
}

/** Chart as returned by `getBirthChart`: the additive fields are always present. */
export type ComputedBirthChart = BirthChart &
  Required<Pick<BirthChart, "sectDetails" | "lots" | "moonPhase">>;

/**
 * Determines chart sect from the Sun's house position.
 * Houses 7-12 place the Sun above the horizon.
 *
 * @deprecated House-based approximation: it is only right when the house
 * cusps follow the horizon (Placidus-like systems) and is wrong for
 * whole-sign and equal houses near sunrise/sunset. `getBirthChart` no longer
 * uses it; use `computeSect` / `getSectFromAltitude` (physical horizon).
 */
export function getSect(sunHouse: number): Sect {
  return sunHouse >= 7 && sunHouse <= 12 ? "diurnal" : "nocturnal";
}

function isValidLocalDateTimeParts(date: LocalDateTimeParts): boolean {
  const hour = date.hour ?? 0;
  const minute = date.minute ?? 0;
  const second = date.second ?? 0;

  if (
    !Number.isInteger(date.year) ||
    !Number.isInteger(date.month) ||
    !Number.isInteger(date.day) ||
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    !Number.isInteger(second)
  ) {
    return false;
  }

  if (
    date.month < 1 || date.month > 12 ||
    date.day < 1 || date.day > 31 ||
    hour < 0 || hour > 23 ||
    minute < 0 || minute > 59 ||
    second < 0 || second > 59
  ) {
    return false;
  }

  const utcDate = new Date(Date.UTC(date.year, date.month - 1, date.day, hour, minute, second));
  return (
    !Number.isNaN(utcDate.getTime()) &&
    utcDate.getUTCFullYear() === date.year &&
    utcDate.getUTCMonth() === date.month - 1 &&
    utcDate.getUTCDate() === date.day &&
    utcDate.getUTCHours() === hour &&
    utcDate.getUTCMinutes() === minute &&
    utcDate.getUTCSeconds() === second
  );
}

function validateInputs(options: BirthChartOptions): void {
  const { date } = options;

  if (date instanceof Date) {
    if (Number.isNaN(date.getTime())) {
      throw new Error("Invalid date provided");
    }
  } else if (!isValidLocalDateTimeParts(date)) {
    throw new Error("Invalid date provided");
  }

  if (
    typeof options.latitude !== "number" ||
    options.latitude < -90 ||
    options.latitude > 90
  ) {
    throw new Error("Invalid latitude: must be between -90 and 90 degrees");
  }

  if (
    typeof options.longitude !== "number" ||
    options.longitude < -180 ||
    options.longitude > 180
  ) {
    throw new Error("Invalid longitude: must be between -180 and 180 degrees");
  }
}

function hydratePlanet(
  id: Planet,
  position: PlanetPosition,
  houseCusps: number[]
): HydratedPlanet {
  return {
    ...position,
    id,
    name: PLANET_AND_NODE_NAMES[id],
    zodiacPosition: getZodiacPosition(position.longitude, houseCusps),
  };
}

/**
 * Calculate a birth chart using Swiss Ephemeris
 *
 * @param options Chart calculation options
 * @returns Birth chart data
 */
export async function getBirthChart(
  options: BirthChartOptions
): Promise<ComputedBirthChart> {
  try {
    // Validate inputs
    validateInputs(options);

    // Determine time zone strategy: default to auto from lat/lon
    const tzOptions: TimeZoneOptions = options.timeZoneSettings ?? { autoTimeZone: true };
    const utcDate = await toUtcDate(options.date, options.latitude, options.longitude, tzOptions);

    // Calculate planetary positions
    const planetPositions = await calculatePlanetaryPositions(utcDate);
    if (!planetPositions) {
      throw new Error("Failed to calculate planetary positions");
    }

    // Calculate houses (explicit, recorded fallback only when the caller opted in)
    const requestedHouseSystem = options.houseSystem || HouseSystem.PLACIDUS;
    let usedHouseSystem = requestedHouseSystem;
    let houseSystemSubstitution: HouseSystemSubstitution | undefined;
    let housesPositions;
    try {
      housesPositions = await calculateHouses(
        utcDate,
        options.latitude,
        options.longitude,
        requestedHouseSystem,
        { treatAsUTC: true }
      );
    } catch (error) {
      houseSystemSubstitution = planHouseSystemFallback(
        requestedHouseSystem,
        options.houseSystemFallback,
        options.latitude,
        error
      );
      if (!houseSystemSubstitution) throw error;
      usedHouseSystem = houseSystemSubstitution.used;
      housesPositions = await calculateHouses(
        utcDate,
        options.latitude,
        options.longitude,
        usedHouseSystem,
        { treatAsUTC: true }
      );
    }
    if (!housesPositions) {
      throw new Error("Failed to calculate houses");
    }

    // skipping the first house since swisseph uses it as dummy 0deg aries
    const houseCusps = housesPositions.houses.slice(1, 13).map(normalizeAngle);

    const planets: Record<string, HydratedPlanet> = {};
    for (const [planetId, position] of Object.entries(planetPositions)) {
      const id = planetId as unknown as Planet;
      const hydratedPlanet = hydratePlanet(id, position, houseCusps);
      planets[hydratedPlanet.name.toLocaleLowerCase()] = hydratedPlanet;
    }

    const houseCuspsPositions = houseCusps.map((lon) =>
      getZodiacPosition(lon, houseCusps)
    );

    const descendant = normalizeAngle(housesPositions.ascendant + 180);
    const imumCoeli = normalizeAngle(housesPositions.mc + 180);

    const ascendantSign = getZodiacPosition(
      housesPositions.ascendant,
      houseCusps
    );
    const midheavenSign = getZodiacPosition(housesPositions.mc, houseCusps);
    const descendantSign = getZodiacPosition(descendant, houseCusps);
    const imumCoeliSign = getZodiacPosition(imumCoeli, houseCusps);

    const houses: BirthChart["houses"] = {
      ascendant: ascendantSign,
      mc: midheavenSign,
      dc: descendantSign,
      ic: imumCoeliSign,
      houses: houseCuspsPositions,
      ascmc: {
        armc: housesPositions.ascmc
          ? getZodiacPosition(housesPositions.ascmc.armc, houseCusps)
          : undefined,
        vertex: housesPositions.ascmc
          ? getZodiacPosition(housesPositions.ascmc.vertex, houseCusps)
          : undefined,
        equasc: housesPositions.ascmc
          ? getZodiacPosition(housesPositions.ascmc.equasc, houseCusps)
          : undefined,
        coasc1: housesPositions.ascmc
          ? getZodiacPosition(housesPositions.ascmc.coasc1, houseCusps)
          : undefined,
        coasc2: housesPositions.ascmc
          ? getZodiacPosition(housesPositions.ascmc.coasc2, houseCusps)
          : undefined,
        polasc: housesPositions.ascmc
          ? getZodiacPosition(housesPositions.ascmc.polasc, houseCusps)
          : undefined,
      },
    };

    // Sect from the physical horizon (Sun's geometric altitude), never from houses.
    const sectDetails = computeSect(
      utcDate,
      options.latitude,
      options.longitude,
      planets.sun
    );
    const sect = sectDetails.sect;
    const isDiurnal = sect === "diurnal";
    const wheelOfFortuneLongitude = calcParsFortunae(
      houses.ascendant.longitude,
      planets.sun.longitude,
      planets.moon.longitude,
      isDiurnal
    );
    const lotsResult = computeLots(
      houses.ascendant.longitude,
      planets.sun.longitude,
      planets.moon.longitude,
      sect
    );
    const lots = {
      ...lotsResult,
      fortunePosition: getZodiacPosition(lotsResult.fortune, houseCusps),
      spiritPosition: getZodiacPosition(lotsResult.spirit, houseCusps),
    };
    const moonPhase = computeMoonPhase(planets.sun.longitude, planets.moon.longitude);

    const wheelOfFortune = getZodiacPosition(
      wheelOfFortuneLongitude,
      houseCusps
    );

    const nodes: Record<string, HydratedNode> = {
      [VirtualNodes.PARS_FORTUNAE]: {
        ...wheelOfFortune,
        id: VirtualNodes.PARS_FORTUNAE,
        name: PLANET_AND_NODE_NAMES[VirtualNodes.PARS_FORTUNAE],
      },
    };

    const aspects = computeAspects(getAspectPoints(planets, houses.ascendant.longitude, houses.mc.longitude));

    return {
      dateUtc: utcDate,
      houseSystem: usedHouseSystem,
      ...(houseSystemSubstitution ? { houseSystemSubstitution } : {}),
      planets,
      houses,
      nodes,
      aspects,
      sect,
      sectDetails,
      lots,
      moonPhase,
    };
  } catch (error) {
    throw error;
  }
}

export const SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

/**
 * Convert decimal degrees to degrees and minutes format
 *
 * @param decimalDegrees Decimal degrees (e.g., 9.8)
 * @returns Formatted string (e.g., "9°48'")
 */
export function formatDegreeMinutes(decimalDegrees: number): string {
  let deg = Math.floor(decimalDegrees);
  let min = Math.round((decimalDegrees - deg) * 60);
  if (min === 60) {
    min = 0;
    deg += 1;
  } // carry
  return `${deg}°${String(min).padStart(2, "0")}'`;
}

/**
 * Convert decimal degrees to zodiac position (sign and degrees)
 *
 * @param longitude Longitude in decimal degrees (0-360)
 * @returns Formatted zodiac position with both decimal and traditional format
 */
export function getZodiacPosition(
  longitude: number,
  houseCusps: number[]
): ZodiacPosition {
  const L = normalizeAngle(longitude);
  const signIndex = Math.floor(L / 30) % 12;
  const within = L - signIndex * 30; // 0–<30
  const house = findHouseOf(L, houseCusps);

  return {
    sign: SIGNS[signIndex],
    decimalDegrees: within,
    traditionalFormat: formatDegreeMinutes(within),
    decimal: within.toFixed(2) + "°",
    longitude: L,
    house,
  };
}

// Find the house of a longitude (0–360) given the array of cusps (0–360)
export function findHouseOf(
  longitude: number,
  housePositions: number[]
): number {
  const L = normalizeAngle(longitude);

  if (!housePositions || housePositions.length === 0) {
    throw new Error("House positions are required");
  }

  const H = housePositions
    .map((c, i) => ({ i: i + 1, L: normalizeAngle(c) }))
    .sort((a, b) => a.L - b.L);
  for (let k = 0; k < H.length; k++) {
    const cur = H[k],
      nxt = H[(k + 1) % H.length];
    if (nxt.L < cur.L) {
      // wrap 360->0
      if (L >= cur.L || L < nxt.L) return cur.i;
    } else {
      if (L >= cur.L && L < nxt.L) return cur.i;
    }
  }
  return 1;
}

function getAspectPoints(
  planets: Record<string, { longitude: number }>,
  ascLon: number,
  mcLon: number
): Record<string, { longitude: number }> {
  return { ...planets, ascendant: { longitude: ascLon }, mc: { longitude: mcLon } };
}

// ── Two-chart (synastry / composite) ──────────────────────────────────

export interface TwoChartOptions {
  chartA: BirthChartOptions;
  chartB: BirthChartOptions;
  aspectSpecs?: AspectSpec[];
  /** Omit the embedded full charts from the result (see `SynastryChartSummary`). Default false. */
  omitCharts?: boolean;
}
export type SynastryChartOptions = TwoChartOptions;
export type CompositeChartOptions = TwoChartOptions;

/** Options for the already-computed-chart variants (`getSynastryFromCharts`, `getCompositeFromCharts`). */
export interface TwoChartFromChartsOptions {
  aspectSpecs?: AspectSpec[];
  /** Omit the embedded full charts from the result; the result then carries `charts` references only. */
  omitCharts?: boolean;
  /** Caller ids echoed into the lightweight `charts` references. */
  ids?: { a?: string; b?: string };
  /**
   * House system of chart A / B. Only used when the chart does not record its own
   * (`BirthChart.houseSystem`); the chart's recorded value always wins.
   */
  houseSystemA?: HouseSystem;
  houseSystemB?: HouseSystem;
}

/** Metadata-only reference to a chart used in a two-chart result. */
export interface ChartReference {
  id?: string;
  dateUtc: Date;
  houseSystem?: HouseSystem;
}

export interface SynastryChart {
  chartA: BirthChart;
  chartB: BirthChart;
  aspects: AspectEdge[];
}

/** Synastry result without the embedded charts (`omitCharts: true`). */
export interface SynastryChartSummary {
  charts: { a: ChartReference; b: ChartReference };
  aspects: AspectEdge[];
}

export interface CompositeChart {
  chartA: BirthChart;
  chartB: BirthChart;
  compositePlanets: Record<
    string,
    { name: string; longitude: number; zodiacPosition: ZodiacPosition }
  >;
  compositeHouses: ZodiacPosition[];
  /** Composite ASC / MC / DSC / IC midpoint angles (see `./composite` conventions). */
  compositeAngles: Record<keyof CompositeAngles, ZodiacPosition>;
  /** Conventions used for midpoints, houses and the antipodal policy. */
  compositeMethod: CompositeMethod;
  /** Antipodal pairs, MC/cusp corrections and fallbacks encountered. */
  notices: CompositeNotice[];
  /** Aspects among `compositePlanets` only (the final point set). */
  aspects: AspectEdge[];
  /** House system of each input chart and where it came from. */
  houseSystems: {
    a: { system: HouseSystem; source: "chart" | "option" | "assumed-default" };
    b: { system: HouseSystem; source: "chart" | "option" | "assumed-default" };
  };
}

/** Composite result without the embedded charts (`omitCharts: true`). */
export type CompositeChartSummary = Omit<CompositeChart, "chartA" | "chartB"> & {
  charts: { a: ChartReference; b: ChartReference };
};

function chartReference(chart: BirthChart, id?: string): ChartReference {
  const ref: ChartReference = { dateUtc: chart.dateUtc, houseSystem: chart.houseSystem };
  if (id !== undefined) ref.id = id;
  return ref;
}

export function getSynastryFromCharts(
  chartA: BirthChart,
  chartB: BirthChart,
  options: TwoChartFromChartsOptions & { omitCharts: true }
): SynastryChartSummary;
export function getSynastryFromCharts(
  chartA: BirthChart,
  chartB: BirthChart,
  options?: TwoChartFromChartsOptions & { omitCharts?: false }
): SynastryChart;
export function getSynastryFromCharts(
  chartA: BirthChart,
  chartB: BirthChart,
  options?: TwoChartFromChartsOptions
): SynastryChart | SynastryChartSummary;
/**
 * Synastry between two already-computed charts: no ephemeris recomputation, so N
 * people need N `getBirthChart` calls rather than N(N-1)/2.
 * `getSynastryChart` delegates here.
 */
export function getSynastryFromCharts(
  chartA: BirthChart,
  chartB: BirthChart,
  options: TwoChartFromChartsOptions = {}
): SynastryChart | SynastryChartSummary {
  const aspects = computeSynastryAspects(
    getAspectPoints(chartA.planets, chartA.houses.ascendant.longitude, chartA.houses.mc.longitude),
    getAspectPoints(chartB.planets, chartB.houses.ascendant.longitude, chartB.houses.mc.longitude),
    options.aspectSpecs
  );
  if (options.omitCharts) {
    return {
      charts: { a: chartReference(chartA, options.ids?.a), b: chartReference(chartB, options.ids?.b) },
      aspects,
    };
  }
  return { chartA, chartB, aspects };
}

export async function getSynastryChart(
  options: SynastryChartOptions & { omitCharts: true }
): Promise<SynastryChartSummary>;
export async function getSynastryChart(
  options: SynastryChartOptions & { omitCharts?: false }
): Promise<SynastryChart>;
export async function getSynastryChart(
  options: SynastryChartOptions
): Promise<SynastryChart | SynastryChartSummary>;
export async function getSynastryChart(
  options: SynastryChartOptions
): Promise<SynastryChart | SynastryChartSummary> {
  const [chartA, chartB] = await Promise.all([
    getBirthChart(options.chartA),
    getBirthChart(options.chartB),
  ]);
  return getSynastryFromCharts(chartA, chartB, {
    aspectSpecs: options.aspectSpecs,
    omitCharts: options.omitCharts,
  });
}

function resolveChartHouseSystem(
  chart: BirthChart,
  fallback: HouseSystem | undefined
): { system: HouseSystem; source: "chart" | "option" | "assumed-default" } {
  if (chart.houseSystem !== undefined) return { system: chart.houseSystem, source: "chart" };
  if (fallback !== undefined) return { system: fallback, source: "option" };
  return { system: HouseSystem.PLACIDUS, source: "assumed-default" };
}

export function getCompositeFromCharts(
  chartA: BirthChart,
  chartB: BirthChart,
  options: TwoChartFromChartsOptions & { omitCharts: true }
): CompositeChartSummary;
export function getCompositeFromCharts(
  chartA: BirthChart,
  chartB: BirthChart,
  options?: TwoChartFromChartsOptions & { omitCharts?: false }
): CompositeChart;
export function getCompositeFromCharts(
  chartA: BirthChart,
  chartB: BirthChart,
  options?: TwoChartFromChartsOptions
): CompositeChart | CompositeChartSummary;
/**
 * Midpoint composite of two already-computed charts. Each chart's house system is
 * taken from `BirthChart.houseSystem`; for hand-built charts without it, from
 * `options.houseSystemA/B`, else non-whole-sign (Placidus-like) is assumed and
 * reported in `houseSystems[..].source === "assumed-default"`.
 * `getCompositeChart` delegates here.
 */
export function getCompositeFromCharts(
  chartA: BirthChart,
  chartB: BirthChart,
  options: TwoChartFromChartsOptions = {}
): CompositeChart | CompositeChartSummary {
  const epsilon = DEFAULT_ANTIPODAL_EPSILON;
  const notices: CompositeNotice[] = [];

  // Angles: midpoints with ASC/MC consistency
  const angleResult = computeCompositeAngles(
    { ascendant: chartA.houses.ascendant.longitude, mc: chartA.houses.mc.longitude },
    { ascendant: chartB.houses.ascendant.longitude, mc: chartB.houses.mc.longitude },
    epsilon
  );
  notices.push(...angleResult.notices);

  // Houses: whole-sign composites start at the composite ASC sign; otherwise
  // midpoints of corresponding cusps validated for zodiacal order.
  const hsA = resolveChartHouseSystem(chartA, options.houseSystemA);
  const hsB = resolveChartHouseSystem(chartB, options.houseSystemB);
  const wholeA = hsA.system === HouseSystem.WHOLE_SIGN;
  const wholeB = hsB.system === HouseSystem.WHOLE_SIGN;
  if (wholeA !== wholeB) {
    notices.push({
      type: "mixed_house_systems",
      reason: "only one chart uses whole-sign houses; corresponding cusps were midpointed",
    });
  }
  const cuspResult = computeCompositeCusps({
    cuspsA: chartA.houses.houses.map((h) => h.longitude),
    cuspsB: chartB.houses.houses.map((h) => h.longitude),
    ascA: chartA.houses.ascendant.longitude,
    ascB: chartB.houses.ascendant.longitude,
    wholeSign: wholeA && wholeB,
    compositeAsc: angleResult.angles.ascendant,
    epsilon,
  });
  notices.push(...cuspResult.notices);
  const compositeCusps = cuspResult.cusps;

  // Midpoint planets (only points present in both charts)
  const compositePlanets: CompositeChart["compositePlanets"] = {};
  for (const key of Object.keys(chartA.planets)) {
    if (!(key in chartB.planets)) continue;
    const mid = compositeMidpoint(chartA.planets[key].longitude, chartB.planets[key].longitude, epsilon);
    if (mid.antipodal) {
      notices.push({
        type: "antipodal",
        point: key,
        longitudeA: chartA.planets[key].longitude,
        longitudeB: chartB.planets[key].longitude,
      });
    }
    compositePlanets[key] = {
      name: key,
      longitude: mid.longitude,
      zodiacPosition: getZodiacPosition(mid.longitude, compositeCusps),
    };
  }

  const compositeHouses = compositeCusps.map((lon) =>
    getZodiacPosition(lon, compositeCusps)
  );

  const compositeAngles = {
    ascendant: getZodiacPosition(angleResult.angles.ascendant, compositeCusps),
    mc: getZodiacPosition(angleResult.angles.mc, compositeCusps),
    descendant: getZodiacPosition(angleResult.angles.descendant, compositeCusps),
    ic: getZodiacPosition(angleResult.angles.ic, compositeCusps),
  };

  // Aspects are computed from the final point set only.
  const aspects = computeAspects(compositePlanets, options.aspectSpecs);

  const compositeMethod: CompositeMethod = {
    midpoint: "shorter arc",
    antipodalPolicy: ANTIPODAL_POLICY_TEXT,
    antipodalEpsilon: epsilon,
    ...cuspResult.method,
  };

  const body = {
    compositePlanets,
    compositeHouses,
    compositeAngles,
    compositeMethod,
    notices,
    aspects,
    houseSystems: { a: hsA, b: hsB },
  };
  if (options.omitCharts) {
    return {
      charts: { a: chartReference(chartA, options.ids?.a), b: chartReference(chartB, options.ids?.b) },
      ...body,
    };
  }
  return { chartA, chartB, ...body };
}

export async function getCompositeChart(
  options: CompositeChartOptions & { omitCharts: true }
): Promise<CompositeChartSummary>;
export async function getCompositeChart(
  options: CompositeChartOptions & { omitCharts?: false }
): Promise<CompositeChart>;
export async function getCompositeChart(
  options: CompositeChartOptions
): Promise<CompositeChart | CompositeChartSummary>;
export async function getCompositeChart(
  options: CompositeChartOptions
): Promise<CompositeChart | CompositeChartSummary> {
  const [chartA, chartB] = await Promise.all([
    getBirthChart(options.chartA),
    getBirthChart(options.chartB),
  ]);
  return getCompositeFromCharts(chartA, chartB, {
    aspectSpecs: options.aspectSpecs,
    omitCharts: options.omitCharts,
    houseSystemA: options.chartA.houseSystem,
    houseSystemB: options.chartB.houseSystem,
  });
}

// ── Transits ────────────────────────────────────────────────────────────

export interface TransitChartOptions {
  natal: BirthChartOptions;
  transitDate: Date;
  transitLatitude?: number;
  transitLongitude?: number;
  transitTimeZoneSettings?: TimeZoneOptions;
  aspectSpecs?: AspectSpec[];
  maxOrb?: number;
  transitPlanets?: string[];
  natalPlanets?: string[];
  aspectFilter?: AspectName[];
}

export interface TransitPlanet extends HydratedPlanet {
  retrograde: boolean;
  natalHouse: number;
}

export interface TransitChart {
  natalChart: BirthChart;
  transitDateUtc: Date;
  transitPlanets: Record<string, TransitPlanet>;
  aspects: TransitAspectEdge[];
}

export interface TransitRangeOptions extends Omit<TransitChartOptions, "transitDate"> {
  /**
   * Window start. Two forms, both resolved to an absolute UTC instant (`TransitRangeResult.fromUtc`)
   * through `transitTimeZoneSettings` at the transit location (default: auto time zone from lat/lon):
   *
   * - `LocalDateTimeParts` (recommended): the wall-clock date/time at the transit location.
   *   Independent of the host machine's time zone.
   * - `Date` (legacy, behaviour unchanged): read with the HOST-local getters
   *   (`getFullYear()`, `getHours()`, ...) and reinterpreted as wall-clock time in the transit
   *   location's zone, so the result depends on the host time zone. Pass
   *   `transitTimeZoneSettings: { treatAsUTC: true }` to use the Date's own UTC instant instead.
   */
  from: Date | LocalDateTimeParts;
  /** Window end (inclusive); same two forms and semantics as `from`. */
  to: Date | LocalDateTimeParts;
  stepDays?: number;
  /** Final bracket width for each exact event, in seconds (default 0.001). */
  timeToleranceSeconds?: number;
  /** Max accepted angular residual of an exact event, in degrees (default 1e-6). */
  residualToleranceDegrees?: number;
  /** Also report stationary near-misses that never reach exactness (default false). */
  includeClosestApproaches?: boolean;
}

/**
 * A verified exact crossing of a transit aspect. `exactDate` is the UTC instant
 * of the root; `exactOrb` equals the angular residual (~0), not the display orb.
 */
export interface AspectPerfection {
  transitPlanet: string;
  natalPlanet: string;
  aspect: AspectName;
  exactDate: Date;
  exactOrb: number;
  retrograde: boolean;
  category: "slow" | "fast";
  kind?: "exact";
  exactJd?: number;
  solver?: PerfectionSolverMetadata;
}

export interface TransitRangeResult {
  natalChart: BirthChart;
  /** The `from` Date as passed; for `LocalDateTimeParts` input it is the resolved UTC instant (= `fromUtc`). */
  from: Date;
  /** The `to` Date as passed; for `LocalDateTimeParts` input it is the resolved UTC instant (= `toUtc`). */
  to: Date;
  /** `from`/`to` resolved to absolute UTC instants (via the transit location's time zone settings). */
  fromUtc?: Date;
  toUtc?: Date;
  perfections: AspectPerfection[];
  /** Present only when `includeClosestApproaches` was requested. Never exact. */
  closestApproaches?: TransitClosestApproach[];
}

function getTransitAspectPoints(
  planets: Record<string, HydratedPlanet>
): Record<string, TransitAspectPoint> {
  const points: Record<string, TransitAspectPoint> = {};
  for (const [key, p] of Object.entries(planets)) {
    points[key] = { longitude: p.longitude, longitudeSpeed: p.longitudeSpeed };
  }
  return points;
}

function getNatalAspectPoints(
  planets: Record<string, HydratedPlanet>,
  ascLon: number,
  mcLon: number
): Record<string, TransitAspectPoint> {
  // Natal positions are fixed targets — zero out speeds so applying/separating
  // is computed solely from transit planet motion.
  const points: Record<string, TransitAspectPoint> = {};
  for (const [key, p] of Object.entries(planets)) {
    points[key] = { longitude: p.longitude, longitudeSpeed: 0 };
  }
  points.ascendant = { longitude: ascLon, longitudeSpeed: 0 };
  points.mc = { longitude: mcLon, longitudeSpeed: 0 };
  return points;
}

function filterByNames(
  points: Record<string, TransitAspectPoint>,
  names?: string[]
): Record<string, TransitAspectPoint> {
  if (!names || names.length === 0) return points;
  const allowed = new Set(names.map((n) => n.toLowerCase()));
  const result: Record<string, TransitAspectPoint> = {};
  for (const [key, val] of Object.entries(points)) {
    if (allowed.has(key)) result[key] = val;
  }
  return result;
}

/**
 * Options for transits to an already-computed natal chart. A `BirthChart` does not
 * store its geographic location, so the transit location is explicit.
 */
export interface TransitFromChartOptions
  extends Omit<TransitChartOptions, "natal" | "transitLatitude" | "transitLongitude"> {
  transitLatitude: number;
  transitLongitude: number;
  /** House system for the transit chart; defaults to the natal chart's recorded system. */
  houseSystem?: HouseSystem;
}

export async function getTransitChart(
  options: TransitChartOptions
): Promise<TransitChart> {
  const natalChart = await getBirthChart(options.natal);
  return getTransitChartFromChart(natalChart, {
    ...options,
    transitLatitude: options.transitLatitude ?? options.natal.latitude,
    transitLongitude: options.transitLongitude ?? options.natal.longitude,
    houseSystem: options.natal.houseSystem,
  });
}

/**
 * Transits over an already-computed natal chart (no natal recomputation). The
 * natal chart can be a natal `BirthChart` or any derived chart exposing the same
 * `planets` / `houses` shape. `getTransitChart` delegates here.
 */
export async function getTransitChartFromChart(
  natalChart: BirthChart,
  options: TransitFromChartOptions
): Promise<TransitChart> {
  const transitChart = await getBirthChart({
    date: options.transitDate,
    latitude: options.transitLatitude,
    longitude: options.transitLongitude,
    houseSystem: options.houseSystem ?? natalChart.houseSystem,
    timeZoneSettings: options.transitTimeZoneSettings ?? { autoTimeZone: true },
  });

  const natalCusps = natalChart.houses.houses.map((h) => h.longitude);

  // Place transit planets in natal houses
  const transitPlanets: Record<string, TransitPlanet> = {};
  for (const [key, planet] of Object.entries(transitChart.planets)) {
    const natalZodiac = getZodiacPosition(planet.longitude, natalCusps);
    transitPlanets[key] = {
      ...planet,
      retrograde: (planet.longitudeSpeed ?? 0) < 0,
      natalHouse: natalZodiac.house,
      zodiacPosition: {
        ...planet.zodiacPosition,
        house: natalZodiac.house,
      },
    };
  }

  // Build aspect points with filters
  let tPoints = getTransitAspectPoints(transitChart.planets);
  let nPoints = getNatalAspectPoints(
    natalChart.planets,
    natalChart.houses.ascendant.longitude,
    natalChart.houses.mc.longitude
  );
  tPoints = filterByNames(tPoints, options.transitPlanets);
  nPoints = filterByNames(nPoints, options.natalPlanets);

  let aspects = computeTransitAspects(tPoints, nPoints, options.aspectSpecs);

  if (options.maxOrb != null) {
    aspects = aspects.filter((a) => a.orb <= options.maxOrb!);
  }
  if (options.aspectFilter && options.aspectFilter.length > 0) {
    const allowed = new Set(options.aspectFilter);
    aspects = aspects.filter((a) => allowed.has(a.aspect));
  }

  return {
    natalChart,
    transitDateUtc: transitChart.dateUtc,
    transitPlanets,
    aspects,
  };
}

export async function getTransitRange(
  options: TransitRangeOptions
): Promise<TransitRangeResult> {
  const natalChart = await getBirthChart(options.natal);

  const nPoints = filterByNames(
    getNatalAspectPoints(
      natalChart.planets,
      natalChart.houses.ascendant.longitude,
      natalChart.houses.mc.longitude
    ),
    options.natalPlanets
  );

  const rawStep = options.stepDays ?? 1;
  if (rawStep <= 0) throw new Error("stepDays must be greater than 0");

  const transitLat = options.transitLatitude ?? options.natal.latitude;
  const transitLon = options.transitLongitude ?? options.natal.longitude;
  const transitTz = options.transitTimeZoneSettings ?? { autoTimeZone: true };
  const fromUtc = await toUtcDate(options.from, transitLat, transitLon, transitTz);
  const toUtc = await toUtcDate(options.to, transitLat, transitLon, transitTz);

  const found = findTransitPerfections({
    natalPoints: nPoints,
    transitPlanets: options.transitPlanets,
    fromUtc,
    toUtc,
    stepDays: rawStep,
    aspectSpecs: options.aspectSpecs,
    timeToleranceSeconds: options.timeToleranceSeconds,
    residualToleranceDegrees: options.residualToleranceDegrees,
    includeClosestApproaches: options.includeClosestApproaches,
  });

  const allowedAspects =
    options.aspectFilter && options.aspectFilter.length > 0 ? new Set(options.aspectFilter) : null;
  let perfections: AspectPerfection[] = found.perfections;
  if (options.maxOrb != null) {
    perfections = perfections.filter((p) => p.exactOrb <= options.maxOrb!);
  }
  if (allowedAspects) {
    perfections = perfections.filter((p) => allowedAspects.has(p.aspect));
  }

  const result: TransitRangeResult = {
    natalChart,
    from: options.from instanceof Date ? options.from : fromUtc,
    to: options.to instanceof Date ? options.to : toUtc,
    fromUtc,
    toUtc,
    perfections,
  };
  if (options.includeClosestApproaches) {
    result.closestApproaches = found.closestApproaches.filter(
      (c) =>
        (!allowedAspects || allowedAspects.has(c.aspect)) &&
        (options.maxOrb == null || c.separationDegrees <= options.maxOrb)
    );
  }
  return result;
}

// ── Solar Return ─────────────────────────────────────────────────────────

export interface SolarReturnOptions {
  natal: BirthChartOptions;
  /**
   * Which return: the calendar year of the natal LOCAL civil birthday. The solved return is the one
   * whose instant is nearest the UTC instant of that anniversary (the natal local civil date and
   * clock time moved to `year`, expressed with the natal zone's UTC offset). Consequently the
   * returned UTC instant can fall on Dec 31 of `year - 1` or Jan 1 of `year + 1` for births near
   * a year boundary or in extreme UTC offsets, but it is never the return of a neighbouring year.
   * For Feb 29 births in non-leap years the anniversary is Mar 1.
   */
  year: number;
  solarReturnLatitude?: number;
  solarReturnLongitude?: number;
  solarReturnHouseSystem?: HouseSystem;
  /** Opt-in recorded house-system substitute for the return chart (defaults to `natal.houseSystemFallback`). */
  solarReturnHouseSystemFallback?: HouseSystemFallback;
  /** Final bracket width of the solved return instant, in seconds (default 0.001). */
  returnPrecisionSeconds?: number;
  /** Max accepted angular residual of the return, in degrees (default 1e-6). */
  residualToleranceDegrees?: number;
}

export interface SolarReturnChart {
  natalChart: BirthChart;
  /** Cast at the solved root's exact Julian Day (no sub-second truncation), so its Sun equals the natal Sun to ~1e-9 degrees. */
  solarReturnChart: BirthChart;
  /** Verified UTC instant at which the Sun reaches its natal longitude. */
  exactReturnDate: Date;
  natalSunLongitude: number;
  year: number;
  /** Julian Day (UT) of the solved return. */
  exactReturnJd?: number;
  /** Angular residual (degrees) of the Sun against the natal longitude at `exactReturnDate`'s solved root. */
  residualDegrees?: number;
  /** Final bracket width and tolerance, iterations, direction and coverage of the root search. */
  solver?: {
    bracketWidthSeconds: number;
    timeToleranceSeconds: number;
    iterations: number;
    direction: RootDirection;
    coverage: RootSearchCoverage;
    method: RootSolverMethodMetadata;
  };
}

/** Half-widths (days) tried in turn around the anniversary until a crossing is bracketed. */
const SOLAR_RETURN_WINDOW_HALF_WIDTHS_DAYS = [2, 4, 8];

/**
 * Calculate a Solar Return chart: the moment the transiting Sun returns to its natal longitude
 * in the given `year` (see {@link SolarReturnOptions.year} for the exact convention).
 *
 * The search is centred on the natal birth instant moved to `year` (anchored on the natal UTC
 * instant, not on a UTC-noon calendar date), widened and retried if no crossing is bracketed.
 */
export async function getSolarReturnChart(
  options: SolarReturnOptions
): Promise<SolarReturnChart> {
  // 1. Compute natal chart to get natal Sun longitude and the natal UTC instant
  const natalChart = await getBirthChart(options.natal);
  const natalSunLongitude = natalChart.planets.sun.longitude;

  // 2. Anniversary of the natal local civil moment in the target year, as a UTC instant.
  //    offset = natal UTC instant - natal local wall clock read as UTC (the natal zone's offset).
  const localParts = options.natal.date instanceof Date
    ? {
        year: options.natal.date.getFullYear(),
        month: options.natal.date.getMonth() + 1,
        day: options.natal.date.getDate(),
        hour: options.natal.date.getHours(),
        minute: options.natal.date.getMinutes(),
        second: options.natal.date.getSeconds(),
      }
    : options.natal.date;
  const naiveNatalMs = Date.UTC(
    localParts.year, localParts.month - 1, localParts.day,
    localParts.hour ?? 0, localParts.minute ?? 0, localParts.second ?? 0
  );
  const natalOffsetMs = natalChart.dateUtc.getTime() - naiveNatalMs;
  const anniversary = new Date(
    Date.UTC(
      options.year, localParts.month - 1, localParts.day,
      localParts.hour ?? 0, localParts.minute ?? 0, localParts.second ?? 0
    ) + natalOffsetMs
  );
  const approxJd = dateToJd(anniversary);

  // 3. Signed-angle root search (verified residual, configurable precision), widening if needed
  let search: ReturnType<typeof findPlanetaryReturns> | undefined;
  for (const halfWidth of SOLAR_RETURN_WINDOW_HALF_WIDTHS_DAYS) {
    search = findPlanetaryReturns({
      body: Planet.SUN,
      natalLongitude: natalSunLongitude,
      from: new Date(anniversary.getTime() - halfWidth * 86400000),
      to: new Date(anniversary.getTime() + halfWidth * 86400000),
      stepDays: 0.5,
      timeToleranceSeconds: options.returnPrecisionSeconds,
      residualToleranceDegrees: options.residualToleranceDegrees,
    });
    if (search.crossings.length > 0) break;
  }
  if (!search || search.crossings.length === 0) {
    throw new Error("Failed to locate the solar return within the search window");
  }
  const root = search.crossings.reduce((best, c) =>
    Math.abs(c.jd - approxJd) < Math.abs(best.jd - approxJd) ? c : best
  );
  const exactReturnDate = root.instant;

  // 4. Cast the full chart at the solved root's exact Julian Day (UT, no time-zone handling and
  //    no millisecond truncation), using the SR location.
  const srLatitude = options.solarReturnLatitude ?? options.natal.latitude;
  const srLongitude = options.solarReturnLongitude ?? options.natal.longitude;
  validateInputs({ date: exactReturnDate, latitude: srLatitude, longitude: srLongitude });
  const solarReturnChart = getChartAtJulianDay({
    julianDayUt: root.jd,
    latitude: srLatitude,
    longitude: srLongitude,
    houseSystem: options.solarReturnHouseSystem ?? options.natal.houseSystem,
    houseSystemFallback: options.solarReturnHouseSystemFallback ?? options.natal.houseSystemFallback,
  });

  return {
    natalChart,
    solarReturnChart,
    exactReturnDate,
    natalSunLongitude,
    year: options.year,
    exactReturnJd: root.jd,
    residualDegrees: root.residualDegrees,
    solver: {
      bracketWidthSeconds: root.bracketWidthSeconds,
      timeToleranceSeconds: root.timeToleranceSeconds,
      iterations: root.iterations,
      direction: root.direction,
      coverage: search.coverage,
      method: search.method,
    },
  };
}

export * from "./labels";
