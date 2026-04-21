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
export * from "./decans";
export * from "./dodecatemoria";
export * from "./profections";
export * from "./firdaria";
import {
  computeAspects,
  computeSynastryAspects,
  computeTransitAspects,
  computeMidpoints,
  shorterArcMidpoint,
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
  timeZoneSettings?: TimeZoneOptions;
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

export interface BirthChart {
  dateUtc: Date;
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
  sect: "diurnal" | "nocturnal";
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

function getCivilMonthDay(date: Date | LocalDateTimeParts): { monthIndex: number; day: number } {
  if (date instanceof Date) {
    return {
      monthIndex: date.getMonth(),
      day: date.getDate(),
    };
  }

  return {
    monthIndex: date.month - 1,
    day: date.day,
  };
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
): Promise<BirthChart> {
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

    // Calculate houses
    const housesPositions = await calculateHouses(
      utcDate,
      options.latitude,
      options.longitude,
      options.houseSystem || HouseSystem.PLACIDUS,
      { treatAsUTC: true }
    );
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

    const isDiurnal =
      planets.sun.zodiacPosition.house >= 7 &&
      planets.sun.zodiacPosition.house <= 12;
    const wheelOfFortuneLongitude = calcParsFortunae(
      houses.ascendant.longitude,
      planets.sun.longitude,
      planets.moon.longitude,
      isDiurnal
    );

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
      planets,
      houses,
      nodes,
      aspects,
      sect: isDiurnal ? "diurnal" as const : "nocturnal" as const,
    };
  } catch (error) {
    console.error("Error calculating birth chart:", error);
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
}
export type SynastryChartOptions = TwoChartOptions;
export type CompositeChartOptions = TwoChartOptions;

export interface SynastryChart {
  chartA: BirthChart;
  chartB: BirthChart;
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
  aspects: AspectEdge[];
}

export async function getSynastryChart(
  options: SynastryChartOptions
): Promise<SynastryChart> {
  const [chartA, chartB] = await Promise.all([
    getBirthChart(options.chartA),
    getBirthChart(options.chartB),
  ]);
  const aspects = computeSynastryAspects(
    getAspectPoints(chartA.planets, chartA.houses.ascendant.longitude, chartA.houses.mc.longitude),
    getAspectPoints(chartB.planets, chartB.houses.ascendant.longitude, chartB.houses.mc.longitude),
    options.aspectSpecs
  );
  return { chartA, chartB, aspects };
}

export async function getCompositeChart(
  options: CompositeChartOptions
): Promise<CompositeChart> {
  const [chartA, chartB] = await Promise.all([
    getBirthChart(options.chartA),
    getBirthChart(options.chartB),
  ]);

  // Midpoint planets
  const midpointLongitudes = computeMidpoints(chartA.planets, chartB.planets);

  // Midpoint house cusps (shorter-arc midpoint of corresponding cusps)
  const cuspsA = chartA.houses.houses.map((h) => h.longitude);
  const cuspsB = chartB.houses.houses.map((h) => h.longitude);
  const compositeCusps = cuspsA.map((a, i) =>
    i < cuspsB.length ? shorterArcMidpoint(a, cuspsB[i]) : a
  );

  // Hydrate composite planets with zodiac positions using midpoint cusps
  const compositePlanets: CompositeChart["compositePlanets"] = {};
  for (const [key, lon] of Object.entries(midpointLongitudes)) {
    compositePlanets[key] = {
      name: key,
      longitude: lon,
      zodiacPosition: getZodiacPosition(lon, compositeCusps),
    };
  }

  const compositeHouses = compositeCusps.map((lon) =>
    getZodiacPosition(lon, compositeCusps)
  );

  const aspects = computeAspects(compositePlanets, options.aspectSpecs);

  return {
    chartA,
    chartB,
    compositePlanets,
    compositeHouses,
    aspects,
  };
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
  from: Date;
  to: Date;
  stepDays?: number;
}

export interface AspectPerfection {
  transitPlanet: string;
  natalPlanet: string;
  aspect: AspectName;
  exactDate: Date;
  exactOrb: number;
  retrograde: boolean;
  category: "slow" | "fast";
}

export interface TransitRangeResult {
  natalChart: BirthChart;
  from: Date;
  to: Date;
  perfections: AspectPerfection[];
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

export async function getTransitChart(
  options: TransitChartOptions
): Promise<TransitChart> {
  const natalChart = await getBirthChart(options.natal);

  const transitChart = await getBirthChart({
    date: options.transitDate,
    latitude: options.transitLatitude ?? options.natal.latitude,
    longitude: options.transitLongitude ?? options.natal.longitude,
    houseSystem: options.natal.houseSystem,
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
  const natalCusps = natalChart.houses.houses.map((h) => h.longitude);

  const nPoints = filterByNames(
    getNatalAspectPoints(
      natalChart.planets,
      natalChart.houses.ascendant.longitude,
      natalChart.houses.mc.longitude
    ),
    options.natalPlanets
  );
  const natalKeys = Object.keys(nPoints);

  const rawStep = options.stepDays ?? 1;
  if (rawStep <= 0) throw new Error("stepDays must be greater than 0");
  const fromMs = options.from.getTime();
  const toMs = options.to.getTime();
  const specs = options.aspectSpecs;

  // Collect positions at each step
  type StepData = {
    time: number;
    positions: Record<string, TransitAspectPoint>;
  };
  const steps: StepData[] = [];

  const transitLat = options.transitLatitude ?? options.natal.latitude;
  const transitLon = options.transitLongitude ?? options.natal.longitude;
  const transitTz = options.transitTimeZoneSettings ?? { autoTimeZone: true };

  // Auto-reduce step for fast planets (Moon moves ~13°/day, can enter and exit
  // an aspect between daily samples). Cap at 0.25 days (~6h) when fast planets
  // are in the transit set so we don't miss perfections.
  const FAST_PLANET_MAX_STEP = 0.25; // days
  let effectiveStepDays = rawStep;
  // Check if any requested transit planet is fast (not in SLOW_PLANETS)
  const requestedTransitPlanets = options.transitPlanets?.map((n) => n.toLowerCase());
  const hasFastPlanets = requestedTransitPlanets
    ? requestedTransitPlanets.some((n) => !SLOW_PLANETS.has(n))
    : true; // if no filter, assume fast planets present
  if (hasFastPlanets && effectiveStepDays > FAST_PLANET_MAX_STEP) {
    effectiveStepDays = FAST_PLANET_MAX_STEP;
  }
  const stepMs = effectiveStepDays * 86400000;

  // Scan one extra step beyond toMs so perfections near the boundary can be detected
  // (binary search needs two consecutive steps to spot the orb increase after a minimum).
  // Perfections are still filtered to [from, to] at the end.
  const scanEndMs = toMs + stepMs;
  for (let ms = fromMs; ms <= scanEndMs; ms += stepMs) {
    const date = new Date(ms);
    const utcDate = await toUtcDate(date, transitLat, transitLon, transitTz ?? { autoTimeZone: true });
    const positions = await calculatePlanetaryPositions(utcDate);
    if (!positions) continue;

    const points: Record<string, TransitAspectPoint> = {};
    for (const [planetId, pos] of Object.entries(positions)) {
      const id = planetId as unknown as Planet;
      const name = PLANET_AND_NODE_NAMES[id].toLowerCase();
      points[name] = { longitude: pos.longitude, longitudeSpeed: pos.longitudeSpeed };
    }
    steps.push({ time: ms, positions: filterByNames(points, options.transitPlanets) });
  }

  // Track orbs across steps and find perfections via binary search
  const perfections: AspectPerfection[] = [];
  const transitKeys = steps.length > 0 ? Object.keys(steps[0].positions) : [];

  for (const tKey of transitKeys) {
    for (const nKey of natalKeys) {
      let prevOrb: number | null = null;
      let prevDecreasing = false;
      let prevStep: StepData | null = null;

      for (const step of steps) {
        const tPos = step.positions[tKey];
        const nPos = nPoints[nKey];
        if (!tPos || !nPos) continue;

        // Check all aspect specs for the closest match
        const match = specs
          ? findClosestAspectOrb(tPos.longitude, nPos.longitude, specs)
          : findClosestAspectOrb(tPos.longitude, nPos.longitude);

        if (!match) {
          prevOrb = null;
          prevStep = step;
          continue;
        }

        const currentOrb = match.orb;
        if (prevOrb != null && prevStep) {
          const wasDecreasing = prevOrb > currentOrb;
          // Perfection: orb was decreasing and is now increasing
          if (prevDecreasing && !wasDecreasing && currentOrb <= (match.spec.orb)) {
            const exactResult = await binarySearchPerfection(
              tKey, nKey, match.spec,
              prevStep.time, step.time,
              nPos, transitLat, transitLon, transitTz
            );
            if (exactResult) perfections.push(exactResult);
          }
          prevDecreasing = wasDecreasing;
        } else {
          prevDecreasing = false;
        }
        prevOrb = currentOrb;
        prevStep = step;
      }
    }
  }

  // Filter perfections to the requested [from, to] range (scan extends beyond for detection)
  let filtered = perfections.filter((p) => {
    const t = p.exactDate.getTime();
    return t >= fromMs && t <= toMs;
  });
  if (options.maxOrb != null) {
    filtered = filtered.filter((p) => p.exactOrb <= options.maxOrb!);
  }
  if (options.aspectFilter && options.aspectFilter.length > 0) {
    const allowed = new Set(options.aspectFilter);
    filtered = filtered.filter((p) => allowed.has(p.aspect));
  }

  // Sort by date
  filtered.sort((a, b) => a.exactDate.getTime() - b.exactDate.getTime());

  return {
    natalChart,
    from: options.from,
    to: options.to,
    perfections: filtered,
  };
}

function findClosestAspectOrb(
  lonA: number,
  lonB: number,
  specs: AspectSpec[] = DEFAULT_ASPECT_SPECS
): { spec: AspectSpec; orb: number; delta: number } | null {
  const a = normalizeAngle(lonA);
  const b = normalizeAngle(lonB);
  const delta = Math.min(normalizeAngle(b - a), normalizeAngle(a - b));

  let best: { spec: AspectSpec; orb: number; delta: number } | null = null;
  for (const spec of specs) {
    const orb = Math.abs(delta - spec.angle);
    // Use a generous search orb (spec.orb + 2) to catch approaching aspects
    if (orb <= spec.orb + 2) {
      if (!best || orb < best.orb) {
        best = { spec, orb, delta };
      }
    }
  }
  return best;
}

function computeOrbForAspect(
  transitLon: number,
  natalLon: number,
  aspectAngle: number
): number {
  const delta = Math.min(
    normalizeAngle(transitLon - natalLon),
    normalizeAngle(natalLon - transitLon)
  );
  return Math.abs(delta - aspectAngle);
}

// Reverse map: lowercase name → Planet enum, built once
const NAME_TO_PLANET: Record<string, Planet> = {};
for (const [id, name] of Object.entries(PLANET_AND_NODE_NAMES)) {
  const numId = Number(id);
  if (!isNaN(numId)) NAME_TO_PLANET[name.toLowerCase()] = numId as Planet;
}

async function getTransitLongitudeAt(
  ms: number,
  transitKey: string,
  transitLat: number,
  transitLon: number,
  transitTz: TimeZoneOptions
): Promise<PlanetPosition | null> {
  const date = new Date(ms);
  const utc = await toUtcDate(date, transitLat, transitLon, transitTz);

  // Use single-planet calculation when possible (much cheaper than full ephemeris)
  const planetId = NAME_TO_PLANET[transitKey];
  if (planetId != null) {
    try {
      return calculateSinglePlanetPosition(utc, planetId);
    } catch {
      return null;
    }
  }

  // Fallback for non-standard names (shouldn't happen in practice)
  const positions = await calculatePlanetaryPositions(utc);
  if (!positions) return null;
  return findPlanetByName(positions, transitKey) ?? null;
}

async function binarySearchPerfection(
  transitKey: string,
  natalKey: string,
  spec: AspectSpec,
  startMs: number,
  endMs: number,
  natalPoint: TransitAspectPoint,
  transitLat: number,
  transitLon: number,
  transitTz?: TimeZoneOptions
): Promise<AspectPerfection | null> {
  const tz = transitTz ?? { autoTimeZone: true };
  const maxIterations = 30;

  // Ternary search: find the time that minimizes the orb (unimodal function)
  let lo = startMs;
  let hi = endMs;

  for (let i = 0; i < maxIterations; i++) {
    if (hi - lo < 60000) break; // < 1 minute precision

    const m1 = lo + Math.floor((hi - lo) / 3);
    const m2 = hi - Math.floor((hi - lo) / 3);

    const pos1 = await getTransitLongitudeAt(m1, transitKey, transitLat, transitLon, tz);
    const pos2 = await getTransitLongitudeAt(m2, transitKey, transitLat, transitLon, tz);
    if (!pos1 || !pos2) break;

    const orb1 = computeOrbForAspect(pos1.longitude, natalPoint.longitude, spec.angle);
    const orb2 = computeOrbForAspect(pos2.longitude, natalPoint.longitude, spec.angle);

    if (orb1 < orb2) {
      hi = m2;
    } else {
      lo = m1;
    }
  }

  // Final evaluation at converged point
  const finalMs = Math.floor((lo + hi) / 2);
  const finalPos = await getTransitLongitudeAt(finalMs, transitKey, transitLat, transitLon, tz);
  if (!finalPos) return null;

  const finalOrb = computeOrbForAspect(finalPos.longitude, natalPoint.longitude, spec.angle);

  // Reject near-miss local minima that never got close to exact
  if (finalOrb > spec.orb) return null;

  return {
    transitPlanet: transitKey,
    natalPlanet: natalKey,
    aspect: spec.name,
    exactDate: new Date(finalMs),
    exactOrb: finalOrb,
    retrograde: (finalPos.longitudeSpeed ?? 0) < 0,
    category: SLOW_PLANETS.has(transitKey) ? "slow" : "fast",
  };
}

function findPlanetByName(
  positions: Record<string, PlanetPosition>,
  name: string
): PlanetPosition | undefined {
  for (const [planetId, pos] of Object.entries(positions)) {
    const id = planetId as unknown as Planet;
    if (PLANET_AND_NODE_NAMES[id].toLowerCase() === name) return pos;
  }
  return undefined;
}

// ── Solar Return ─────────────────────────────────────────────────────────

export interface SolarReturnOptions {
  natal: BirthChartOptions;
  year: number;
  solarReturnLatitude?: number;
  solarReturnLongitude?: number;
  solarReturnHouseSystem?: HouseSystem;
}

export interface SolarReturnChart {
  natalChart: BirthChart;
  solarReturnChart: BirthChart;
  exactReturnDate: Date;
  natalSunLongitude: number;
  year: number;
}

/**
 * Get the Sun's ecliptic longitude at a given UTC millisecond timestamp.
 */
async function getSunLongitudeAtMs(ms: number): Promise<number> {
  const positions = await calculatePlanetaryPositions(new Date(ms));
  const sun = findPlanetByName(positions, "sun");
  if (!sun) throw new Error("Failed to compute Sun position");
  return sun.longitude;
}

/**
 * Signed angular delta in (-180, 180].
 * Positive means `current` is ahead of `target` (Sun has passed the return point).
 */
function signedAngularDelta(current: number, target: number): number {
  let d = normalizeAngle(current - target);
  if (d > 180) d -= 360;
  return d;
}

/**
 * Calculate a Solar Return chart — the moment the transiting Sun returns
 * to its natal longitude in the given year.
 */
export async function getSolarReturnChart(
  options: SolarReturnOptions
): Promise<SolarReturnChart> {
  // 1. Compute natal chart to get natal Sun longitude
  const natalChart = await getBirthChart(options.natal);
  const natalSunLongitude = natalChart.planets.sun.longitude;

  // 2. Build search window: natal birthday in target year ± 2 days
  const natalDate = getCivilMonthDay(options.natal.date);
  const approxReturn = new Date(Date.UTC(
    options.year,
    natalDate.monthIndex,
    natalDate.day,
    12, 0, 0
  ));
  let lo = approxReturn.getTime() - 2 * 86400000;
  let hi = approxReturn.getTime() + 2 * 86400000;

  // 3. Binary search (max 30 iterations, converge to < 60s)
  for (let i = 0; i < 30; i++) {
    if (hi - lo < 60000) break;

    const mid = Math.floor((lo + hi) / 2);
    const sunLon = await getSunLongitudeAtMs(mid);
    const delta = signedAngularDelta(sunLon, natalSunLongitude);

    if (delta < 0) {
      // Sun hasn't arrived yet → search forward
      lo = mid;
    } else {
      // Sun has passed → search backward
      hi = mid;
    }
  }

  const exactMs = Math.floor((lo + hi) / 2);
  const exactReturnDate = new Date(exactMs);

  // 4. Cast full BirthChart at converged timestamp using SR location
  const solarReturnChart = await getBirthChart({
    date: exactReturnDate,
    latitude: options.solarReturnLatitude ?? options.natal.latitude,
    longitude: options.solarReturnLongitude ?? options.natal.longitude,
    houseSystem: options.solarReturnHouseSystem ?? options.natal.houseSystem,
    // Always treatAsUTC: the binary search converged on a UTC millisecond timestamp.
    // Passing a caller timezone here would re-interpret the already-UTC instant as local,
    // shifting planetary positions by hours.
    timeZoneSettings: { treatAsUTC: true },
  });

  return {
    natalChart,
    solarReturnChart,
    exactReturnDate,
    natalSunLongitude,
    year: options.year,
  };
}
