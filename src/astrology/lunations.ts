/**
 * Lunations: the exact instants of the Moon's four principal phases, where the
 * Moon's geocentric apparent tropical longitude minus the Sun's equals 0 (new),
 * 90 (first quarter), 180 (full) and 270 degrees (last quarter).
 *
 * Built on the shared signed-angle root solver (./root-solver) with the cached
 * samplers of ./returns: the function solved is the elongation Moon minus Sun,
 * the target is the phase angle. The elongation grows by 11 to 15 degrees a day
 * and never turns back, so a half day grid brackets every crossing.
 *
 * Synchronous; requires an initialised Swiss Ephemeris (`await getSwissEph(...)`).
 * Instants are UTC; the time coordinate is the UT Julian Day. Eclipses are not
 * computed here.
 */

import { TimelineError } from "./firdaria";
import { SIGNS } from "./index";
import type { MoonPhaseName } from "./moon-phase";
import { createBodyLongitudeFunctions, ROOT_SOLVER_METHOD, type RootSolverMethodMetadata } from "./returns";
import { dateToJd, findAngularRoots } from "./root-solver";
import { Planet } from "./swisseph";

/** The four principal phases, spelled as in `MoonPhaseName`. */
export type LunationPhase = Extract<MoonPhaseName, "new" | "first_quarter" | "full" | "last_quarter">;

export interface LunationPhaseDefinition {
  /** 0 (new) to 3 (last quarter), in the order they happen. */
  index: number;
  phase: LunationPhase;
  /** Moon minus Sun longitude at the phase: index * 90. */
  elongation: number;
}

/** The four principal phases in the order they happen, starting at the new moon. */
export const LUNATION_PHASES: readonly LunationPhaseDefinition[] = Object.freeze(
  (["new", "first_quarter", "full", "last_quarter"] as const).map((phase, index) =>
    Object.freeze({ index, phase, elongation: index * 90 })
  )
);

/** Longest window accepted by `findLunations` (years). */
export const MAX_LUNATION_WINDOW_YEARS = 150;

/** Scan step of the elongation (days). The Moon gains about 12 degrees a day on the Sun. */
export const LUNATION_SCAN_STEP_DAYS = 0.5;

export interface Lunation {
  phase: LunationPhase;
  /** Instant of the phase as UT Julian Day. */
  jd: number;
  /** Instant of the phase (UTC, millisecond rounded). */
  instant: Date;
  /** Sun's tropical longitude at the instant, degrees in [0, 360). */
  sunLongitude: number;
  /** Moon's tropical longitude at the instant, degrees in [0, 360). */
  moonLongitude: number;
  /** The Moon's sign at the instant. */
  sign: (typeof SIGNS)[number];
  /** The Moon's degrees into that sign, in [0, 30). */
  signDegree: number;
  /** |Moon - Sun - phase angle| at the emitted instant, degrees. */
  residualDegrees: number;
}

export interface LunationsMethodMetadata {
  quantity: "geocentric apparent tropical ecliptic longitude of the Moon minus that of the Sun (of date)";
  targets: "0 (new), 90 (first quarter), 180 (full), 270 (last quarter) degrees";
  sign: "the Moon's tropical sign at the instant; at a new moon the Sun is in the same degree, at a full moon in the opposite one";
  scanStepDays: number;
  eclipses: "not computed";
  solver: RootSolverMethodMetadata;
}

export const LUNATIONS_METHOD: LunationsMethodMetadata = Object.freeze({
  quantity: "geocentric apparent tropical ecliptic longitude of the Moon minus that of the Sun (of date)",
  targets: "0 (new), 90 (first quarter), 180 (full), 270 (last quarter) degrees",
  sign: "the Moon's tropical sign at the instant; at a new moon the Sun is in the same degree, at a full moon in the opposite one",
  scanStepDays: LUNATION_SCAN_STEP_DAYS,
  eclipses: "not computed",
  solver: ROOT_SOLVER_METHOD,
});

export interface FindLunationsOptions {
  /** Window (inclusive). Dates are absolute UTC instants. */
  start: Date;
  end: Date;
  /** Phases to return (default: all four). */
  phases?: LunationPhase[];
  /** Final bracket width in seconds (default 0.001). */
  timeToleranceSeconds?: number;
  /** Max accepted residual in degrees (default 1e-6). */
  residualToleranceDegrees?: number;
}

export interface LunationsResult {
  start: Date;
  end: Date;
  /** The phases searched, in the order they happen. */
  phases: LunationPhase[];
  /** Every phase instant inside the window, in time order. */
  lunations: Lunation[];
  method: LunationsMethodMetadata;
}

const MS_PER_DAY = 86_400_000;
const norm360 = (value: number): number => ((value % 360) + 360) % 360;

function assertDate(value: unknown, name: string): asserts value is Date {
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) {
    throw new TimelineError("UNBOUNDED_INPUT", `a finite \`${name}\` date is required`);
  }
}

function resolvePhases(phases: LunationPhase[] | undefined): LunationPhaseDefinition[] {
  if (phases === undefined) return [...LUNATION_PHASES];
  if (!Array.isArray(phases)) throw new TimelineError("INVALID_INPUT", "`phases` must be an array of phase names");
  for (const phase of phases) {
    if (!LUNATION_PHASES.some((definition) => definition.phase === phase)) {
      throw new TimelineError(
        "INVALID_INPUT",
        `unknown phase "${String(phase)}"; use ${LUNATION_PHASES.map((definition) => definition.phase).join(", ")}`
      );
    }
  }
  return LUNATION_PHASES.filter((definition) => phases.includes(definition.phase));
}

/** The new moons, first quarters, full moons and last quarters inside [start, end], in time order. */
export function findLunations(options: FindLunationsOptions): LunationsResult {
  const { start, end } = options;
  assertDate(start, "start");
  assertDate(end, "end");
  const definitions = resolvePhases(options.phases);
  if (end.getTime() < start.getTime()) throw new TimelineError("INVALID_RANGE", "`end` must not be before `start`");
  const years = (end.getTime() - start.getTime()) / (365.25 * MS_PER_DAY);
  if (years > MAX_LUNATION_WINDOW_YEARS) {
    throw new TimelineError("RANGE_TOO_LARGE", `window of ${years.toFixed(1)} years exceeds ${MAX_LUNATION_WINDOW_YEARS}`);
  }

  // One cached sampler per body, shared by the four phase searches (same grid).
  const sun = createBodyLongitudeFunctions(Planet.SUN);
  const moon = createBodyLongitudeFunctions(Planet.MOON);
  const elongation = (jd: number): number => norm360(moon.longitude(jd) - sun.longitude(jd));
  const elongationSpeed = (jd: number): number => moon.speed(jd) - sun.speed(jd);
  const startJd = dateToJd(start);
  const endJd = dateToJd(end);

  const lunations: Lunation[] = [];
  for (const definition of definitions) {
    const result = findAngularRoots({
      longitude: elongation,
      speed: elongationSpeed,
      target: definition.elongation,
      start: startJd,
      end: endJd,
      stepDays: LUNATION_SCAN_STEP_DAYS,
      timeToleranceSeconds: options.timeToleranceSeconds,
      residualToleranceDegrees: options.residualToleranceDegrees,
    });
    for (const root of result.roots) {
      const moonLongitude = moon.longitude(root.jd);
      const signIndex = Math.min(11, Math.floor(moonLongitude / 30));
      lunations.push({
        phase: definition.phase,
        jd: root.jd,
        instant: root.instant,
        sunLongitude: sun.longitude(root.jd),
        moonLongitude,
        sign: SIGNS[signIndex],
        signDegree: moonLongitude - signIndex * 30,
        residualDegrees: root.residualDegrees,
      });
    }
  }
  lunations.sort((a, b) => a.jd - b.jd);

  return {
    start,
    end,
    phases: definitions.map((definition) => definition.phase),
    lunations,
    method: LUNATIONS_METHOD,
  };
}
