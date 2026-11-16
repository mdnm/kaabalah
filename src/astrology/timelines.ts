/**
 * Bounded return-pass timelines: thin wrappers over `./returns` that run several
 * return/opposition searches for one natal chart and merge every pass into one
 * chronologically sorted list, each pass carrying its solver metadata.
 *
 * Bounded by hard caps (window length, number of kinds, number of passes);
 * violations throw `TimelineError` (typed `code`). Annual profection and firdaria
 * timelines live next to their logic: `getAnnualProfectionTimeline`
 * (./profections) and `getFirdariaTimeline` (./firdaria).
 *
 * Synchronous; require an initialised Swiss Ephemeris.
 */

import { TimelineError } from "./firdaria";
import {
  findJupiterReturns,
  findNodalReturns,
  findSaturnReturns,
  findSolarReturns,
  findUranusOppositions,
  type NatalLongitudeSource,
  type PlanetaryReturnResult,
  type RootSolverMethodMetadata,
} from "./returns";
import type { RootDirection, RootSearchCoverage } from "./root-solver";

export const MAX_RETURN_TIMELINE_YEARS = 150;
export const MAX_RETURN_TIMELINE_PASSES = 2000;

export type ReturnPassKind =
  | "saturn-return"
  | "jupiter-return"
  | "uranus-opposition"
  | "mean-nodal-return"
  | "true-nodal-return"
  | "solar-return";

export const DEFAULT_RETURN_PASS_KINDS: ReturnPassKind[] = [
  "saturn-return",
  "jupiter-return",
  "uranus-opposition",
  "mean-nodal-return",
  "true-nodal-return",
];

export interface ReturnTimelineOptions {
  /** Natal chart (or any `{ planets: { [key]: { longitude } } }` source). */
  natalChart: NatalLongitudeSource;
  /** Window (inclusive), absolute UTC instants. */
  from: Date;
  to: Date;
  /** Kinds to search (default: Saturn, Jupiter, Uranus opposition, mean and true nodal returns). */
  kinds?: ReturnPassKind[];
  stepDays?: number;
  timeToleranceSeconds?: number;
  residualToleranceDegrees?: number;
  /**
   * The natal instant is itself a trivial zero-offset "pass" when the window includes it.
   * When the natal source has a `dateUtc` (a `BirthChart`), passes within 12 hours of it are
   * dropped and counted in `excludedNatalInstantPasses` unless this is set to false.
   */
  excludeNatalInstant?: boolean;
}

export interface ReturnPassEntry {
  kind: ReturnPassKind;
  body: string;
  eventKind: "return" | "opposition" | "offset-aspect";
  /** 1-based pass index within this kind and window, and the number of passes of that kind. */
  passIndex: number;
  passCount: number;
  instant: Date;
  jd: number;
  natalLongitude: number;
  targetLongitude: number;
  residualDegrees: number;
  direction: RootDirection;
  speedDegreesPerDay: number;
  tangent: boolean;
  solver: {
    bracketWidthSeconds: number;
    timeToleranceSeconds: number;
    iterations: number;
    method: RootSolverMethodMetadata;
  };
}

export interface ReturnTimelineResult {
  window: { from: Date; to: Date };
  /** Passes of all kinds, sorted by `jd` (ties by kind order). */
  entries: ReturnPassEntry[];
  /** Number of trivial passes at the natal instant that were dropped (see `excludeNatalInstant`). */
  excludedNatalInstantPasses: number;
  /** Per-kind search metadata (coverage, tolerances, unrecovered roots). */
  searches: Record<
    string,
    {
      coverage: RootSearchCoverage;
      residualToleranceDegrees: number;
      timeToleranceSeconds: number;
      rejectedCount: number;
    }
  >;
  method: { solver: RootSolverMethodMetadata; note: string };
}

function runKind(kind: ReturnPassKind, o: ReturnTimelineOptions): PlanetaryReturnResult {
  const common = {
    natalChart: o.natalChart,
    from: o.from,
    to: o.to,
    stepDays: o.stepDays,
    timeToleranceSeconds: o.timeToleranceSeconds,
    residualToleranceDegrees: o.residualToleranceDegrees,
  };
  switch (kind) {
    case "saturn-return":
      return findSaturnReturns(common);
    case "jupiter-return":
      return findJupiterReturns(common);
    case "uranus-opposition":
      return findUranusOppositions(common);
    case "mean-nodal-return":
      return findNodalReturns({ ...common, node: "mean" });
    case "true-nodal-return":
      return findNodalReturns({ ...common, node: "true" });
    case "solar-return":
      return findSolarReturns(common);
    default:
      throw new TimelineError("INVALID_INPUT", `unknown return kind "${String(kind)}"`);
  }
}

/** Every return/opposition pass of the requested kinds between two dates, merged and sorted. */
export function getReturnPassTimeline(options: ReturnTimelineOptions): ReturnTimelineResult {
  const { from, to } = options;
  if (!(from instanceof Date) || !(to instanceof Date) || !Number.isFinite(from.getTime()) || !Number.isFinite(to.getTime())) {
    throw new TimelineError("UNBOUNDED_INPUT", "finite `from` and `to` dates are required");
  }
  if (to.getTime() <= from.getTime()) throw new TimelineError("INVALID_RANGE", "`to` must be after `from`");
  const years = (to.getTime() - from.getTime()) / (365.25 * 86_400_000);
  if (years > MAX_RETURN_TIMELINE_YEARS) {
    throw new TimelineError("RANGE_TOO_LARGE", `window of ${years.toFixed(1)} years exceeds ${MAX_RETURN_TIMELINE_YEARS}`);
  }
  const kinds = [...new Set(options.kinds ?? DEFAULT_RETURN_PASS_KINDS)];
  if (kinds.length === 0) throw new TimelineError("INVALID_INPUT", "kinds must not be empty");

  const natalInstant = (options.natalChart as { dateUtc?: unknown }).dateUtc;
  const natalMs =
    options.excludeNatalInstant !== false && natalInstant instanceof Date ? natalInstant.getTime() : null;
  let excluded = 0;
  const entries: (ReturnPassEntry & { order: number })[] = [];
  const searches: ReturnTimelineResult["searches"] = {};
  let solverMethod: RootSolverMethodMetadata | undefined;
  kinds.forEach((kind, order) => {
    const r = runKind(kind, options);
    solverMethod = r.method;
    searches[kind] = {
      coverage: r.coverage,
      residualToleranceDegrees: r.residualToleranceDegrees,
      timeToleranceSeconds: r.timeToleranceSeconds,
      rejectedCount: r.rejected.length,
    };
    const kept = r.crossings.filter((c) => {
      const trivial = natalMs !== null && Math.abs(c.instant.getTime() - natalMs) <= 12 * 3_600_000;
      if (trivial) excluded++;
      return !trivial;
    });
    kept.forEach((c, i) => {
      entries.push({
        order,
        kind,
        body: r.bodyName,
        eventKind: r.eventKind,
        passIndex: i + 1,
        passCount: kept.length,
        instant: c.instant,
        jd: c.jd,
        natalLongitude: r.natalLongitude,
        targetLongitude: r.targetLongitude,
        residualDegrees: c.residualDegrees,
        direction: c.direction,
        speedDegreesPerDay: c.speedDegreesPerDay,
        tangent: c.tangent,
        solver: {
          bracketWidthSeconds: c.bracketWidthSeconds,
          timeToleranceSeconds: c.timeToleranceSeconds,
          iterations: c.iterations,
          method: r.method,
        },
      });
    });
    if (entries.length > MAX_RETURN_TIMELINE_PASSES) {
      throw new TimelineError("RANGE_TOO_LARGE", `more than ${MAX_RETURN_TIMELINE_PASSES} passes; narrow the window or kinds`);
    }
  });
  entries.sort((a, b) => a.jd - b.jd || a.order - b.order);
  return {
    window: { from, to },
    entries: entries.map(({ order: _order, ...e }) => e),
    excludedNatalInstantPasses: excluded,
    searches,
    method: {
      solver: solverMethod!,
      note: "all crossings found on a finite scan grid with station insertion; see each search's coverage",
    },
  };
}
