/**
 * The eight points of the solar year: the instants at which the Sun's geocentric
 * apparent tropical longitude crosses 0, 45, 90, 135, 180, 225, 270 and 315 degrees.
 * These are the two equinoxes, the two solstices and the four cross-quarter
 * midpoints at 15 degrees of the fixed signs (Taurus, Leo, Scorpio, Aquarius).
 *
 * Ids name the calendar month or the sign, never a season or a festival, because
 * the same instant opens spring in one hemisphere and autumn in the other. A
 * season label is added only when the caller names a `hemisphere`.
 *
 * Built on the shared longitude crossing solver (./returns, ./root-solver).
 * Synchronous; requires an initialised Swiss Ephemeris (`await getSwissEph(...)`).
 * Instants are UTC; the time coordinate is the UT Julian Day.
 */

import { TimelineError } from "./firdaria";
import { SIGNS } from "./index";
import {
  createBodyLongitudeFunctions,
  findBodyLongitudeCrossingsWith,
  ROOT_SOLVER_METHOD,
  type RootSolverMethodMetadata,
} from "./returns";
import { dateToJd, jdToDate } from "./root-solver";
import { Planet } from "./swisseph";

export type SeasonalPointKind = "equinox" | "solstice" | "cross-quarter";

export type SeasonalPointId =
  | "march-equinox"
  | "taurus-midpoint"
  | "june-solstice"
  | "leo-midpoint"
  | "september-equinox"
  | "scorpio-midpoint"
  | "december-solstice"
  | "aquarius-midpoint";

export type Hemisphere = "north" | "south";
export type SeasonName = "spring" | "summer" | "autumn" | "winter";

export interface SeasonalPointDefinition {
  /** 0 (March equinox) to 7 (Aquarius midpoint), in zodiacal order. */
  index: number;
  id: SeasonalPointId;
  kind: SeasonalPointKind;
  /** Tropical longitude of the Sun at the point: index * 45. */
  targetLongitude: number;
}

/** The eight points in zodiacal order, starting at 0 degrees Aries. */
export const SEASONAL_POINTS: readonly SeasonalPointDefinition[] = Object.freeze(
  (
    [
      ["march-equinox", "equinox"],
      ["taurus-midpoint", "cross-quarter"],
      ["june-solstice", "solstice"],
      ["leo-midpoint", "cross-quarter"],
      ["september-equinox", "equinox"],
      ["scorpio-midpoint", "cross-quarter"],
      ["december-solstice", "solstice"],
      ["aquarius-midpoint", "cross-quarter"],
    ] as const
  ).map(([id, kind], index) => Object.freeze({ index, id, kind, targetLongitude: index * 45 }))
);

/** Longest window accepted by `findSeasonalPoints` (years). */
export const MAX_SEASONAL_WINDOW_YEARS = 150;

/** Astronomical season of a point in one hemisphere. */
export interface SeasonalPointSeason {
  hemisphere: Hemisphere;
  name: SeasonName;
  /** "start": an equinox or solstice opens the season. "midpoint": a cross-quarter point sits in its middle. */
  phase: "start" | "midpoint";
}

export interface SeasonalPoint extends SeasonalPointDefinition {
  /** Instant of the crossing as UT Julian Day. */
  jd: number;
  /** Instant of the crossing (UTC, millisecond rounded). */
  instant: Date;
  /** Sun's tropical longitude at the emitted instant, degrees in [0, 360); equals `targetLongitude` within `residualDegrees`. */
  longitude: number;
  sign: (typeof SIGNS)[number];
  /** Degrees into the sign: 0 for equinoxes and solstices, 15 for the cross-quarter points. */
  signDegree: number;
  /** |longitude - targetLongitude| at the emitted instant, degrees. */
  residualDegrees: number;
  /** Present only when a `hemisphere` was given. */
  season?: SeasonalPointSeason;
}

export interface SeasonalPointsMethodMetadata {
  quantity: "geocentric apparent tropical ecliptic longitude of the Sun (of date)";
  targets: "0, 45, 90, 135, 180, 225, 270, 315 degrees";
  crossQuarter: "15 degrees of the fixed signs (solar longitude), not the midpoint in time between an equinox and a solstice";
  ids: "calendar month of the equinox or solstice, sign of the cross-quarter point; hemisphere neutral";
  season: "astronomical seasons opening at the equinoxes and solstices; the southern hemisphere is six months opposite the northern";
  fraction: "elapsed time over the time between the previous and the next point";
  solver: RootSolverMethodMetadata;
}

export const SEASONAL_POINTS_METHOD: SeasonalPointsMethodMetadata = {
  quantity: "geocentric apparent tropical ecliptic longitude of the Sun (of date)",
  targets: "0, 45, 90, 135, 180, 225, 270, 315 degrees",
  crossQuarter: "15 degrees of the fixed signs (solar longitude), not the midpoint in time between an equinox and a solstice",
  ids: "calendar month of the equinox or solstice, sign of the cross-quarter point; hemisphere neutral",
  season: "astronomical seasons opening at the equinoxes and solstices; the southern hemisphere is six months opposite the northern",
  fraction: "elapsed time over the time between the previous and the next point",
  solver: ROOT_SOLVER_METHOD,
};

export interface FindSeasonalPointsOptions {
  /** Window (inclusive). Dates are absolute UTC instants. */
  start: Date;
  end: Date;
  /** Adds a `season` label to every point, correct for that hemisphere. Omit for no label. */
  hemisphere?: Hemisphere;
  /** Final bracket width in seconds (default 0.001). */
  timeToleranceSeconds?: number;
}

export interface SeasonalPointsResult {
  start: Date;
  end: Date;
  hemisphere?: Hemisphere;
  /** Every point inside the window, in time order. */
  points: SeasonalPoint[];
  method: SeasonalPointsMethodMetadata;
}

export interface GetSeasonalPositionOptions {
  /** Absolute UTC instant. */
  date: Date;
  hemisphere?: Hemisphere;
  timeToleranceSeconds?: number;
}

export interface SeasonalPosition {
  date: Date;
  hemisphere?: Hemisphere;
  /** The last point at or before `date`. */
  previous: SeasonalPoint;
  /** The first point after `date`. */
  next: SeasonalPoint;
  /** Elapsed time between `previous` and `next`, in [0, 1). 0 when `date` is exactly `previous`. */
  fraction: number;
  /** Days from `previous` to `date`. */
  elapsedDays: number;
  /** Days from `previous` to `next`. */
  spanDays: number;
  method: SeasonalPointsMethodMetadata;
}

const MS_PER_DAY = 86_400_000;
const NORTHERN_SEASONS: readonly SeasonName[] = ["spring", "summer", "autumn", "winter"];
/** The Sun needs at most about 47.3 days for 45 degrees, so this reaches the neighbouring point on each side. */
const NEIGHBOUR_SEARCH_DAYS = 50;

function assertHemisphere(hemisphere: Hemisphere | undefined): void {
  if (hemisphere !== undefined && hemisphere !== "north" && hemisphere !== "south") {
    throw new TimelineError("INVALID_INPUT", '`hemisphere` must be "north" or "south"');
  }
}

function assertDate(value: unknown, name: string): asserts value is Date {
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) {
    throw new TimelineError("UNBOUNDED_INPUT", `a finite \`${name}\` date is required`);
  }
}

function seasonOf(index: number, hemisphere: Hemisphere): SeasonalPointSeason {
  const northern = Math.floor(index / 2);
  return {
    hemisphere,
    name: NORTHERN_SEASONS[(northern + (hemisphere === "south" ? 2 : 0)) % 4],
    phase: index % 2 === 0 ? "start" : "midpoint",
  };
}

function scan(startJd: number, endJd: number, hemisphere?: Hemisphere, timeToleranceSeconds?: number): SeasonalPoint[] {
  const fns = createBodyLongitudeFunctions(Planet.SUN);
  const from = jdToDate(startJd);
  const to = jdToDate(endJd);
  const points: SeasonalPoint[] = [];
  for (const definition of SEASONAL_POINTS) {
    const result = findBodyLongitudeCrossingsWith(fns, {
      body: Planet.SUN,
      targetLongitude: definition.targetLongitude,
      from,
      to,
      timeToleranceSeconds,
    });
    for (const crossing of result.crossings) {
      const signIndex = (definition.targetLongitude / 30) | 0;
      points.push({
        ...definition,
        jd: crossing.jd,
        instant: crossing.instant,
        longitude: fns.longitude(crossing.jd),
        sign: SIGNS[signIndex],
        signDegree: definition.targetLongitude - signIndex * 30,
        residualDegrees: crossing.residualDegrees,
        ...(hemisphere ? { season: seasonOf(definition.index, hemisphere) } : {}),
      });
    }
  }
  return points.sort((a, b) => a.jd - b.jd);
}

/** The equinoxes, solstices and cross-quarter points inside [start, end], in time order. */
export function findSeasonalPoints(options: FindSeasonalPointsOptions): SeasonalPointsResult {
  const { start, end, hemisphere } = options;
  assertDate(start, "start");
  assertDate(end, "end");
  assertHemisphere(hemisphere);
  if (end.getTime() < start.getTime()) throw new TimelineError("INVALID_RANGE", "`end` must not be before `start`");
  const years = (end.getTime() - start.getTime()) / (365.25 * MS_PER_DAY);
  if (years > MAX_SEASONAL_WINDOW_YEARS) {
    throw new TimelineError("RANGE_TOO_LARGE", `window of ${years.toFixed(1)} years exceeds ${MAX_SEASONAL_WINDOW_YEARS}`);
  }
  return {
    start,
    end,
    ...(hemisphere ? { hemisphere } : {}),
    points: scan(dateToJd(start), dateToJd(end), hemisphere, options.timeToleranceSeconds),
    method: SEASONAL_POINTS_METHOD,
  };
}

/** The points on either side of an instant and the fraction of the time between them that has elapsed. */
export function getSeasonalPosition(options: GetSeasonalPositionOptions): SeasonalPosition {
  const { date, hemisphere } = options;
  assertDate(date, "date");
  assertHemisphere(hemisphere);
  const jd = dateToJd(date);
  const points = scan(jd - NEIGHBOUR_SEARCH_DAYS, jd + NEIGHBOUR_SEARCH_DAYS, hemisphere, options.timeToleranceSeconds);
  let previous: SeasonalPoint | undefined;
  let next: SeasonalPoint | undefined;
  for (const point of points) {
    // Compared on the millisecond instant, so a `date` taken from a returned point is that point.
    if (point.instant.getTime() <= date.getTime()) previous = point;
    else if (!next) next = point;
  }
  if (!previous || !next) {
    throw new TimelineError("UNAVAILABLE_INPUT", "the neighbouring seasonal points were not found around `date`");
  }
  const spanDays = next.jd - previous.jd;
  const elapsedDays = Math.max(0, jd - previous.jd);
  return {
    date,
    ...(hemisphere ? { hemisphere } : {}),
    previous,
    next,
    fraction: Math.min(elapsedDays / spanDays, 1 - Number.EPSILON),
    elapsedDays,
    spanDays,
    method: SEASONAL_POINTS_METHOD,
  };
}
