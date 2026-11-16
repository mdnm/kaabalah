/**
 * Exact longitude crossings and planetary returns built on the shared
 * station-aware root solver (see ./root-solver).
 *
 * All functions are synchronous and require the Swiss Ephemeris to be
 * initialised (`await getSwissEph(...)`). Solved instants are UTC.
 *
 * Time coordinate: UT Julian Day, passed to the ephemeris exactly (the Julian Day is
 * never rebuilt from a whole-second Date, so no sub-second information is lost).
 */

import {
  calculateBodyAtJulianDay,
  CalcFlag,
  Planet,
  PLANET_AND_NODE_NAMES,
} from "./swisseph";
import {
  dateToJd,
  findAngularRoots,
  type AngularClosestApproach,
  type AngularRoot,
  type RootSearchCoverage,
} from "./root-solver";

const EPH_FLAGS = CalcFlag.SWISS_EPH | CalcFlag.SPEED;

/** Largest scan step allowed for ephemeris-backed searches (days). */
export const MAX_BODY_SCAN_STEP_DAYS = 2;

export interface BodyLongitudeSample {
  longitude: number;
  speed: number;
}

/** Longitude (deg, [0,360)) and speed (deg/day) of `body` at an exact UT Julian Day. */
export function sampleBodyAtJd(body: Planet, jd: number): BodyLongitudeSample {
  const p = calculateBodyAtJulianDay(jd, body, EPH_FLAGS);
  return { longitude: (((p.longitude % 360) + 360) % 360), speed: p.longitudeSpeed ?? 0 };
}

export interface BodyLongitudeFunctions {
  longitude: (jd: number) => number;
  speed: (jd: number) => number;
}

/** Cached longitude/speed functions for one body (shared by every search over that body). */
export function createBodyLongitudeFunctions(body: Planet): BodyLongitudeFunctions {
  const cache = new Map<number, BodyLongitudeSample>();
  const get = (jd: number): BodyLongitudeSample => {
    let s = cache.get(jd);
    if (!s) {
      s = sampleBodyAtJd(body, jd);
      cache.set(jd, s);
    }
    return s;
  };
  return { longitude: (jd) => get(jd).longitude, speed: (jd) => get(jd).speed };
}

export interface RootSolverMethodMetadata {
  solver: "signed-angle-bracketing+station-insertion+bisection";
  timeScale: "UT Julian Day";
  ephemeris: "Swiss Ephemeris (SWISS_EPH, SPEED)";
  subSecondEvaluation: "exact Julian Day evaluation (no sub-second truncation or extrapolation)";
}

export const ROOT_SOLVER_METHOD: RootSolverMethodMetadata = {
  solver: "signed-angle-bracketing+station-insertion+bisection",
  timeScale: "UT Julian Day",
  ephemeris: "Swiss Ephemeris (SWISS_EPH, SPEED)",
  subSecondEvaluation: "exact Julian Day evaluation (no sub-second truncation or extrapolation)",
};

export interface BodyCrossingOptions {
  body: Planet;
  /** Tropical target longitude in degrees. */
  targetLongitude: number;
  /** Window (inclusive). Dates are absolute UTC instants. */
  from: Date;
  to: Date;
  /** Scan step in days (default 1, capped at 2). */
  stepDays?: number;
  /** Final bracket width in seconds (default 0.001). */
  timeToleranceSeconds?: number;
  /** Max accepted residual in degrees (default 1e-6). */
  residualToleranceDegrees?: number;
  includeClosestApproaches?: boolean;
  maxClosestSeparationDegrees?: number;
}

export interface BodyCrossing extends AngularRoot {
  /** 1-based index among the passes in the window. */
  passIndex: number;
  /** Total passes found in the window. */
  passCount: number;
}

export interface BodyCrossingResult {
  body: Planet;
  bodyName: string;
  targetLongitude: number;
  from: Date;
  to: Date;
  crossings: BodyCrossing[];
  closestApproaches: AngularClosestApproach[];
  rejected: { jd: number; residualDegrees: number }[];
  coverage: RootSearchCoverage;
  residualToleranceDegrees: number;
  timeToleranceSeconds: number;
  method: RootSolverMethodMetadata;
}

/** All exact passes of `body` over a tropical longitude in [from, to]. */
export function findBodyLongitudeCrossings(options: BodyCrossingOptions): BodyCrossingResult {
  const fns = createBodyLongitudeFunctions(options.body);
  return findBodyLongitudeCrossingsWith(fns, options);
}

/** Same as {@link findBodyLongitudeCrossings} with caller-supplied (cacheable) sampling functions. */
export function findBodyLongitudeCrossingsWith(
  fns: BodyLongitudeFunctions,
  options: BodyCrossingOptions
): BodyCrossingResult {
  const stepDays = Math.min(options.stepDays ?? 1, MAX_BODY_SCAN_STEP_DAYS);
  const timeToleranceSeconds = options.timeToleranceSeconds ?? 0.001;
  const result = findAngularRoots({
    longitude: fns.longitude,
    speed: fns.speed,
    target: options.targetLongitude,
    start: dateToJd(options.from),
    end: dateToJd(options.to),
    stepDays,
    timeToleranceSeconds,
    residualToleranceDegrees: options.residualToleranceDegrees,
    includeClosestApproaches: options.includeClosestApproaches,
    maxClosestSeparationDegrees: options.maxClosestSeparationDegrees,
  });
  const crossings: BodyCrossing[] = result.roots.map((r, i) => ({
    ...r,
    passIndex: i + 1,
    passCount: result.roots.length,
  }));
  return {
    body: options.body,
    bodyName: PLANET_AND_NODE_NAMES[options.body],
    targetLongitude: result.target,
    from: options.from,
    to: options.to,
    crossings,
    closestApproaches: result.closestApproaches,
    rejected: result.rejected,
    coverage: result.coverage,
    residualToleranceDegrees: result.residualToleranceDegrees,
    timeToleranceSeconds,
    method: ROOT_SOLVER_METHOD,
  };
}

// ── Returns ───────────────────────────────────────────────────────────────

/** Minimal structural view of a natal chart (compatible with `BirthChart`). */
export interface NatalLongitudeSource {
  planets: Record<string, { longitude: number }>;
}

export interface PlanetaryReturnOptions {
  /** Body whose crossing is searched (natal position of the same body unless `natalBody` is set). */
  body: Planet;
  /** Natal longitude to return to. Takes precedence over `natalChart`. */
  natalLongitude?: number;
  /** Natal chart used to look up the natal longitude of `natalBody ?? body`. */
  natalChart?: NatalLongitudeSource;
  natalBody?: Planet;
  /** Angular offset from the natal longitude (0 = return, 180 = opposition). */
  offsetDegrees?: number;
  from: Date;
  to: Date;
  stepDays?: number;
  timeToleranceSeconds?: number;
  residualToleranceDegrees?: number;
  includeClosestApproaches?: boolean;
  maxClosestSeparationDegrees?: number;
}

export interface PlanetaryReturnResult extends BodyCrossingResult {
  natalLongitude: number;
  offsetDegrees: number;
  /** "return" for offset 0, "opposition" for 180, otherwise "offset-aspect". */
  eventKind: "return" | "opposition" | "offset-aspect";
}

function resolveNatalLongitude(options: PlanetaryReturnOptions): number {
  if (options.natalLongitude !== undefined) {
    if (!Number.isFinite(options.natalLongitude)) throw new Error("natalLongitude must be finite");
    return options.natalLongitude;
  }
  if (!options.natalChart) throw new Error("Provide natalLongitude or natalChart");
  const key = PLANET_AND_NODE_NAMES[options.natalBody ?? options.body].toLowerCase();
  const found = options.natalChart.planets[key];
  if (!found) throw new Error(`Natal chart has no body "${key}"`);
  return found.longitude;
}

/** All passes of `body` over its (offset) natal longitude in the window. */
export function findPlanetaryReturns(options: PlanetaryReturnOptions): PlanetaryReturnResult {
  const natalLongitude = resolveNatalLongitude(options);
  const offsetDegrees = options.offsetDegrees ?? 0;
  const target = (((natalLongitude + offsetDegrees) % 360) + 360) % 360;
  const result = findBodyLongitudeCrossings({
    body: options.body,
    targetLongitude: target,
    from: options.from,
    to: options.to,
    stepDays: options.stepDays,
    timeToleranceSeconds: options.timeToleranceSeconds,
    residualToleranceDegrees: options.residualToleranceDegrees,
    includeClosestApproaches: options.includeClosestApproaches,
    maxClosestSeparationDegrees: options.maxClosestSeparationDegrees,
  });
  const norm = ((offsetDegrees % 360) + 360) % 360;
  return {
    ...result,
    natalLongitude,
    offsetDegrees,
    eventKind: norm === 0 ? "return" : norm === 180 ? "opposition" : "offset-aspect",
  };
}

type ReturnWrapperOptions = Omit<PlanetaryReturnOptions, "body" | "offsetDegrees" | "natalBody">;

/** Solar returns (Sun to natal Sun). Usually one pass per year. */
export function findSolarReturns(options: ReturnWrapperOptions): PlanetaryReturnResult {
  return findPlanetaryReturns({ ...options, body: Planet.SUN });
}

/** Lunar returns (Moon to natal Moon); default step 0.5 day. */
export function findLunarReturns(options: ReturnWrapperOptions): PlanetaryReturnResult {
  return findPlanetaryReturns({ stepDays: 0.5, ...options, body: Planet.MOON });
}

/** Jupiter returns; returns ALL passes (up to three, due to retrograde). */
export function findJupiterReturns(options: ReturnWrapperOptions): PlanetaryReturnResult {
  return findPlanetaryReturns({ ...options, body: Planet.JUPITER });
}

/** Saturn returns; returns ALL passes (up to three, due to retrograde). */
export function findSaturnReturns(options: ReturnWrapperOptions): PlanetaryReturnResult {
  return findPlanetaryReturns({ ...options, body: Planet.SATURN });
}

/** Nodal returns (mean node by default; pass `node: "true"` for the true node). */
export function findNodalReturns(
  options: ReturnWrapperOptions & { node?: "mean" | "true" }
): PlanetaryReturnResult {
  const { node, ...rest } = options;
  return findPlanetaryReturns({ ...rest, body: node === "true" ? Planet.TRUE_NODE : Planet.MEAN_NODE });
}

/** Uranus opposition to its natal longitude (half-cycle); returns all passes. */
export function findUranusOppositions(options: ReturnWrapperOptions): PlanetaryReturnResult {
  return findPlanetaryReturns({ ...options, body: Planet.URANUS, offsetDegrees: 180 });
}
