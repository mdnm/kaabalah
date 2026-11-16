/**
 * Ephemeris-agnostic, station-aware search for exact angular crossings.
 *
 * The solver finds every time `t` in a window at which an angular function
 * `longitude(t)` equals a target angle, using the SIGNED angular difference
 * normalised to (-180, 180]. It never minimises an orb: a "closest approach"
 * is a different result kind and is never labelled exact.
 *
 * Three concepts are kept separate throughout:
 *  - display orb: a caller concern (not used by the solver),
 *  - root angular residual: `|signedAngle(longitude(t) - target)|` at the emitted instant,
 *  - time tolerance: width of the final bracket (seconds).
 *
 * Time values are Julian Days (UT) when the solver is used with an ephemeris,
 * but any monotone day-valued coordinate works for pure/analytic functions.
 *
 * Coverage qualification: roots are found on a finite grid refined with
 * velocity-zero stations (sign changes of the longitude speed between grid
 * points). Two stations hidden entirely inside one grid step are not formally
 * excluded; this is a station-aware numerical search, not a symbolic proof of
 * completeness.
 */

const MS_PER_DAY = 86_400_000;
const UNIX_EPOCH_JD = 2440587.5;

export function jdToDate(jd: number): Date {
  return new Date(Math.round((jd - UNIX_EPOCH_JD) * MS_PER_DAY));
}

export function dateToJd(date: Date): number {
  return date.getTime() / MS_PER_DAY + UNIX_EPOCH_JD;
}

/** Signed angular difference normalised to (-180, 180]. */
export function signedAngleDifference(value: number): number {
  let d = ((value % 360) + 360) % 360; // [0, 360)
  if (d > 180) d -= 360;
  return d;
}

export type RootDirection = "direct" | "retrograde" | "stationary";

export interface AngularRootSearchOptions {
  /** Longitude in degrees (any real value; wrapped internally) at time `t`. */
  longitude: (t: number) => number;
  /** Optional longitude speed in degrees/day. Defaults to a central difference of `longitude`. */
  speed?: (t: number) => number;
  /** Target angle in degrees. */
  target: number;
  /** Window start/end (Julian Days or any day-valued coordinate); both ends are inclusive. */
  start: number;
  end: number;
  /** Coarse grid step in days. Default 1. */
  stepDays?: number;
  /** Final bracket width in seconds. Default 0.001. */
  timeToleranceSeconds?: number;
  /** Maximum accepted |residual| in degrees for an emitted root. Default 1e-6. */
  residualToleranceDegrees?: number;
  /** Also return stationary closest approaches that do not reach the target. Default false. */
  includeClosestApproaches?: boolean;
  /** Only keep closest approaches with separation <= this (degrees). Default: unlimited. */
  maxClosestSeparationDegrees?: number;
}

export interface AngularRoot {
  kind: "exact";
  /** Root instant as Julian Day (the solver's time coordinate). */
  jd: number;
  /** Root instant as a UTC Date (millisecond rounded; assumes `t` is a UT Julian Day). */
  instant: Date;
  /** |signed angular difference| at `jd`, degrees. */
  residualDegrees: number;
  /** Signed difference longitude - target at `jd`, degrees in (-180, 180]. */
  signedResidualDegrees: number;
  /** Width of the final bracket in seconds (0 when the root is a sampled/analytic point). */
  bracketWidthSeconds: number;
  /** Requested time tolerance in seconds. */
  timeToleranceSeconds: number;
  /** Function evaluations spent refining this root's bracket. */
  iterations: number;
  /** Motion at the root. `stationary` for tangencies at a velocity-zero station. */
  direction: RootDirection;
  /** Longitude speed at the root (deg/day). */
  speedDegreesPerDay: number;
  /** True when the root coincides with a velocity-zero station (tangent touch). */
  tangent: boolean;
  /** How the root was found. */
  method: "bracket-bisection" | "sample" | "station-tangent";
  /** True when the root is exactly at the window start or end. */
  boundary: boolean;
}

export interface AngularClosestApproach {
  kind: "closest-approach";
  jd: number;
  instant: Date;
  /** Minimum |signed difference| in degrees; > 0 and never an exact crossing. */
  separationDegrees: number;
  signedSeparationDegrees: number;
  direction: "stationary";
}

export interface RootSearchCoverage {
  scope: "finite-grid";
  stepDays: number;
  gridPoints: number;
  stationsFound: number;
  /** Fixed wording: no symbolic all-pass completeness is claimed. */
  note: string;
}

export interface AngularRootSearchResult {
  target: number;
  start: number;
  end: number;
  roots: AngularRoot[];
  closestApproaches: AngularClosestApproach[];
  /** Bracketed crossings dropped because the residual check failed (should be empty). */
  rejected: { jd: number; residualDegrees: number }[];
  coverage: RootSearchCoverage;
  residualToleranceDegrees: number;
}

export const ROOT_SEARCH_COVERAGE_NOTE =
  "Finite-grid, station-aware numerical search: stations are located from speed sign changes on the scan grid. " +
  "A pair of velocity-zero crossings hidden inside one grid step is not formally excluded; " +
  "this is not a symbolic proof that all passes were found.";

/** Floor on the representable bracket (relative to magnitude of t) to stop bisection at float limits. */
function canSplit(l: number, r: number): boolean {
  const m = (l + r) / 2;
  return m > l && m < r;
}

interface Bisected {
  t: number;
  width: number;
  iterations: number;
}

/**
 * Bisect a sign-change bracket of `g` until the width is <= `tol` and `accept(t)` holds
 * (or the bracket can no longer be split in floating point).
 */
function bisect(
  g: (t: number) => number,
  left: number,
  right: number,
  tol: number,
  accept: (t: number) => boolean = () => true
): Bisected {
  let gl = g(left);
  let iterations = 0;
  for (let i = 0; i < 200; i++) {
    if (!canSplit(left, right)) break;
    if (right - left <= tol) {
      const mid = (left + right) / 2;
      if (accept(mid)) {
        return { t: mid, width: right - left, iterations };
      }
    }
    const mid = (left + right) / 2;
    const gm = g(mid);
    iterations++;
    if (gm === 0) return { t: mid, width: 0, iterations };
    if ((gl < 0 && gm > 0) || (gl > 0 && gm < 0)) {
      right = mid;
    } else {
      left = mid;
      gl = gm;
    }
  }
  return { t: (left + right) / 2, width: right - left, iterations };
}

/**
 * Find all exact crossings of `target` by `longitude(t)` inside [start, end].
 * Pure: depends only on the supplied functions.
 */
export function findAngularRoots(options: AngularRootSearchOptions): AngularRootSearchResult {
  const {
    longitude,
    target,
    start,
    end,
    stepDays = 1,
    timeToleranceSeconds = 0.001,
    residualToleranceDegrees = 1e-6,
    includeClosestApproaches = false,
    maxClosestSeparationDegrees = Infinity,
  } = options;

  for (const [name, value] of Object.entries({
    target,
    start,
    end,
    stepDays,
    timeToleranceSeconds,
    residualToleranceDegrees,
  })) {
    if (!Number.isFinite(value)) throw new Error(`${name} must be finite`);
  }
  if (stepDays <= 0) throw new Error("stepDays must be greater than 0");
  if (timeToleranceSeconds <= 0) throw new Error("timeToleranceSeconds must be greater than 0");
  if (residualToleranceDegrees <= 0) throw new Error("residualToleranceDegrees must be greater than 0");

  const targetAngle = ((target % 360) + 360) % 360;
  const timeTol = timeToleranceSeconds / 86400;
  const dedupeTolEarly = Math.max(2 * timeTol, 1e-7);

  const emptyCoverage = (gridPoints: number, stationsFound: number): RootSearchCoverage => ({
    scope: "finite-grid",
    stepDays,
    gridPoints,
    stationsFound,
    note: ROOT_SEARCH_COVERAGE_NOTE,
  });

  if (end < start) {
    return {
      target: targetAngle,
      start,
      end,
      roots: [],
      closestApproaches: [],
      rejected: [],
      coverage: emptyCoverage(0, 0),
      residualToleranceDegrees,
    };
  }

  const lonCache = new Map<number, number>();
  const lon = (t: number): number => {
    let v = lonCache.get(t);
    if (v === undefined) {
      v = longitude(t);
      lonCache.set(t, v);
    }
    return v;
  };
  const residual = (t: number): number => signedAngleDifference(lon(t) - targetAngle);

  const speedCache = new Map<number, number>();
  const derivStep = 1e-4;
  const speed = (t: number): number => {
    let v = speedCache.get(t);
    if (v === undefined) {
      v = options.speed
        ? options.speed(t)
        : signedAngleDifference(longitude(t + derivStep) - longitude(t - derivStep)) / (2 * derivStep);
      speedCache.set(t, v);
    }
    return v;
  };

  // ── Grid ────────────────────────────────────────────────────────────────
  const n = Math.max(1, Math.ceil((end - start) / stepDays));
  const gridSet: number[] = [];
  for (let k = 0; k <= n; k++) gridSet.push(Math.min(start + k * stepDays, end));
  const grid = uniqueSorted(gridSet, 0);

  // ── Stations (velocity zeros) ───────────────────────────────────────────
  const stations: number[] = [];
  for (let i = 0; i < grid.length; i++) {
    const v = speed(grid[i]);
    if (v === 0) stations.push(grid[i]);
    if (i + 1 < grid.length) {
      const vr = speed(grid[i + 1]);
      if ((v < 0 && vr > 0) || (v > 0 && vr < 0)) {
        stations.push(bisect(speed, grid[i], grid[i + 1], timeTol).t);
      }
    }
  }
  const stationList = uniqueSorted(stations, timeTol);
  const anchors = uniqueSorted([...grid, ...stationList], 0);

  // Equality at a stationary point needs a much stricter check than the final
  // residual bound, otherwise a nearby minimum could be mislabelled as exact.
  // It also canonicalises flat-extremum jitter into a single tangent root.
  const tangentEquality = Math.min(residualToleranceDegrees, 1e-10);
  const exactStations = new Set(stationList.filter((s) => Math.abs(residual(s)) <= tangentEquality));

  type Candidate = {
    jd: number;
    method: AngularRoot["method"];
    iterations: number;
    width: number;
    tangent: boolean;
  };
  const candidates: Candidate[] = [];
  const rejected: { jd: number; residualDegrees: number }[] = [];

  for (const s of exactStations) {
    candidates.push({ jd: s, method: "station-tangent", iterations: 0, width: 0, tangent: true });
  }

  // Exactly-zero samples (including window boundaries) are roots.
  for (const a of anchors) {
    if (!exactStations.has(a) && residual(a) === 0) {
      candidates.push({ jd: a, method: "sample", iterations: 0, width: 0, tangent: false });
    }
  }
  if (anchors.length === 1 && Math.abs(residual(anchors[0])) <= residualToleranceDegrees) {
    candidates.push({ jd: anchors[0], method: "sample", iterations: 0, width: 0, tangent: false });
  }

  for (let i = 0; i < anchors.length; i++) {
    const left = anchors[i];
    const fl = exactStations.has(left) ? 0 : residual(left);
    if (i + 1 >= anchors.length) continue;
    const right = anchors[i + 1];
    const fr = exactStations.has(right) ? 0 : residual(right);
    if (fl * fr < 0) {
      // A sign flip with a ~180 degree jump is the wrap discontinuity at the
      // antipode, not a crossing.
      if (Math.abs(fr - fl) >= 180) continue;
      const refined = bisect(residual, left, right, timeTol, (t) => Math.abs(residual(t)) <= residualToleranceDegrees);
      const r = Math.abs(residual(refined.t));
      if (r <= residualToleranceDegrees) {
        candidates.push({
          jd: refined.t,
          method: "bracket-bisection",
          iterations: refined.iterations,
          width: refined.width,
          tangent: false,
        });
      } else {
        rejected.push({ jd: refined.t, residualDegrees: r });
      }
    }
  }

  // Window boundaries within the residual tolerance of the target are retained
  // (a root exactly at the window start/end), unless a bracketed root already
  // accounts for it.
  for (const edge of uniqueSorted([start, end], 0)) {
    if (Math.abs(residual(edge)) > residualToleranceDegrees) continue;
    const v = Math.abs(speed(edge));
    const reach = Math.min(stepDays, v > 0 ? residualToleranceDegrees / v : stepDays);
    if (candidates.some((c) => Math.abs(c.jd - edge) <= Math.max(reach, dedupeTolEarly))) continue;
    candidates.push({ jd: edge, method: "sample", iterations: 0, width: 0, tangent: false });
  }

  // ── Dedupe and verify ───────────────────────────────────────────────────
  const dedupeTol = dedupeTolEarly;
  candidates.sort((a, b) => a.jd - b.jd);
  const merged: Candidate[] = [];
  for (const c of candidates) {
    const last = merged[merged.length - 1];
    if (last && c.jd - last.jd <= dedupeTol) {
      if (Math.abs(residual(c.jd)) < Math.abs(residual(last.jd)) || (c.tangent && !last.tangent)) {
        merged[merged.length - 1] = c;
      }
    } else {
      merged.push(c);
    }
  }

  const roots: AngularRoot[] = [];
  for (const c of merged) {
    const signed = residual(c.jd);
    if (Math.abs(signed) > residualToleranceDegrees) {
      rejected.push({ jd: c.jd, residualDegrees: Math.abs(signed) });
      continue;
    }
    const v = speed(c.jd);
    const stationaryHere = c.tangent || stationList.some((s) => Math.abs(s - c.jd) <= dedupeTol);
    roots.push({
      kind: "exact",
      jd: c.jd,
      instant: jdToDate(c.jd),
      residualDegrees: Math.abs(signed),
      signedResidualDegrees: signed,
      bracketWidthSeconds: c.width * 86400,
      timeToleranceSeconds,
      iterations: c.iterations,
      direction: stationaryHere ? "stationary" : v > 0 ? "direct" : v < 0 ? "retrograde" : "stationary",
      speedDegreesPerDay: v,
      tangent: c.tangent,
      method: c.method,
      boundary: Math.abs(c.jd - start) <= dedupeTol || Math.abs(c.jd - end) <= dedupeTol,
    });
  }

  // ── Optional closest approaches (stationary |f| local minima, no crossing) ─
  const closestApproaches: AngularClosestApproach[] = [];
  if (includeClosestApproaches) {
    for (const s of stationList) {
      if (roots.some((r) => Math.abs(r.jd - s) <= dedupeTol)) continue;
      const idx = anchors.indexOf(s);
      if (idx <= 0 || idx >= anchors.length - 1) continue;
      const fp = residual(anchors[idx - 1]);
      const fs = residual(s);
      const fn = residual(anchors[idx + 1]);
      if (Math.abs(fp - fs) >= 180 || Math.abs(fn - fs) >= 180) continue;
      const sameSign = Math.sign(fp) === Math.sign(fs) && Math.sign(fn) === Math.sign(fs);
      if (!sameSign || fs === 0) continue;
      if (!(Math.abs(fs) < Math.abs(fp) && Math.abs(fs) < Math.abs(fn))) continue;
      if (Math.abs(fs) > maxClosestSeparationDegrees) continue;
      closestApproaches.push({
        kind: "closest-approach",
        jd: s,
        instant: jdToDate(s),
        separationDegrees: Math.abs(fs),
        signedSeparationDegrees: fs,
        direction: "stationary",
      });
    }
  }

  return {
    target: targetAngle,
    start,
    end,
    roots,
    closestApproaches,
    rejected,
    coverage: emptyCoverage(grid.length, stationList.length),
    residualToleranceDegrees,
  };
}

function uniqueSorted(values: number[], tolerance: number): number[] {
  const sorted = [...values].sort((a, b) => a - b);
  const out: number[] = [];
  for (const v of sorted) {
    if (out.length === 0 || v - out[out.length - 1] > tolerance) out.push(v);
  }
  return out;
}
