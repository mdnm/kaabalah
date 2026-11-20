/**
 * Planetary stations and retrograde periods.
 *
 * A station is the instant at which a body's geocentric ecliptic longitude speed
 * changes sign: "retrograde" when the body turns retrograde (speed goes negative),
 * "direct" when it turns direct again. Stations are bracketed on a finite scan
 * grid and refined by bisection of the speed sign, the same velocity-zero search
 * the shared root solver (./root-solver) runs internally for its station anchors.
 *
 * Supported bodies are Mercury through Pluto (`STATION_BODIES`). The Sun and Moon
 * never station: they give an empty result with a `never-stations` notice, as
 * `getStationStatus` reports them as never retrograde. The lunar nodes are left
 * out: the mean node is always retrograde and has no station, and the true node's
 * short direct episodes come from the wobble of the osculating orbit, can be
 * shorter than a scan step and are not retrograde periods in the planetary sense.
 * Any other body throws a typed `TimelineError`.
 *
 * Declination has its own pair of searches, kept apart so that no declination event is
 * ever labelled retrograde or direct: `findDeclinationStations` (the local maxima and
 * minima of geocentric declination, with an out-of-bounds flag against the true obliquity
 * of date) and `findEquatorCrossings` (declination 0). Those accept the Sun and Moon too.
 *
 * Synchronous; requires an initialised Swiss Ephemeris (`await getSwissEph(...)`).
 * Instants are UTC; the time coordinate is the UT Julian Day.
 *
 * Coverage qualification: finite-grid search. Two stations of one body hidden
 * inside a single scan step are not formally excluded (for Mercury through Pluto
 * the shortest gap between stations is about three weeks, against a step of at
 * most two days).
 */

import { TimelineError } from "./firdaria";
import { SIGNS } from "./index";
import { createBodyLongitudeFunctions, MAX_BODY_SCAN_STEP_DAYS, type BodyLongitudeFunctions } from "./returns";
import { dateToJd, jdToDate, ROOT_SEARCH_COVERAGE_NOTE, type RootSearchCoverage } from "./root-solver";
import {
  calculateBodyAtJulianDay,
  CalcFlag,
  Planet,
  PLANET_AND_NODE_NAMES,
  SWISS_ECL_NUT,
  SwissEphError,
} from "./swisseph";

/** Bodies that station: Mercury through Pluto. */
export const STATION_BODIES = [
  Planet.MERCURY,
  Planet.VENUS,
  Planet.MARS,
  Planet.JUPITER,
  Planet.SATURN,
  Planet.URANUS,
  Planet.NEPTUNE,
  Planet.PLUTO,
] as const;

/** Longest window accepted by the station searches (years). */
export const MAX_STATION_WINDOW_YEARS = 150;
/** Default distance searched outside the window for the missing end of a retrograde period (days). */
export const DEFAULT_STATION_OUTSIDE_SEARCH_DAYS = 200;
/** Largest accepted `outsideSearchDays`. */
export const MAX_STATION_OUTSIDE_SEARCH_DAYS = 400;

/** The motion that begins at the station. */
export type StationKind = "retrograde" | "direct";

export interface Station {
  body: Planet;
  bodyName: string;
  /** "retrograde": the body turns retrograde here. "direct": it turns direct here. */
  kind: StationKind;
  /** Station instant as UT Julian Day. */
  jd: number;
  /** Station instant (UTC, millisecond rounded). */
  instant: Date;
  /** Tropical ecliptic longitude at the station, degrees in [0, 360). */
  longitude: number;
  sign: (typeof SIGNS)[number];
  /** Degrees into the sign, [0, 30). */
  signDegree: number;
  /** Longitude speed at the emitted instant (deg/day); the residual of the search, about 0. */
  speedDegreesPerDay: number;
  /** Width of the final bracket in seconds. */
  bracketWidthSeconds: number;
  /** False for a station found outside the requested window (the far end of a period that overlaps it). */
  inWindow: boolean;
}

export interface StationNotice {
  type: "never-stations" | "opening-station-not-found" | "closing-station-not-found";
  body: Planet;
  bodyName: string;
  message: string;
}

export interface StationSolverMethodMetadata {
  solver: "speed-sign-bracketing+bisection";
  quantity: "geocentric tropical ecliptic longitude speed of date";
  timeScale: "UT Julian Day";
  ephemeris: "Swiss Ephemeris (SWISS_EPH, SPEED)";
}

export const STATION_SOLVER_METHOD: StationSolverMethodMetadata = {
  solver: "speed-sign-bracketing+bisection",
  quantity: "geocentric tropical ecliptic longitude speed of date",
  timeScale: "UT Julian Day",
  ephemeris: "Swiss Ephemeris (SWISS_EPH, SPEED)",
};

export interface FindStationsOptions {
  body: Planet;
  /** Window (inclusive). Dates are absolute UTC instants; `end` may equal `start`. */
  start: Date;
  end: Date;
  /** Scan step in days (default 1, capped at `MAX_BODY_SCAN_STEP_DAYS`). */
  stepDays?: number;
  /** Final bracket width in seconds (default 1). */
  timeToleranceSeconds?: number;
}

export interface StationSearchResult {
  body: Planet;
  bodyName: string;
  start: Date;
  end: Date;
  /** Stations inside the window, in time order; kinds alternate. */
  stations: Station[];
  /** Longitude speed below zero at `start` / `end`. Always false for the Sun and Moon. */
  retrogradeAtStart: boolean;
  retrogradeAtEnd: boolean;
  notices: StationNotice[];
  coverage: RootSearchCoverage;
  timeToleranceSeconds: number;
  method: StationSolverMethodMetadata;
}

export interface FindRetrogradePeriodsOptions {
  /** One body. Merged with `bodies`; with neither, every body of `STATION_BODIES` is searched. */
  body?: Planet;
  bodies?: readonly Planet[];
  start: Date;
  end: Date;
  stepDays?: number;
  timeToleranceSeconds?: number;
  /**
   * How far outside the window to look for the opening station of a period under way at
   * `start`, or the closing station of one still open at `end` (days). Default 200, at most 400.
   */
  outsideSearchDays?: number;
}

export interface RetrogradePeriod {
  body: Planet;
  bodyName: string;
  /** Station that opened the period, or null when it was not found within `outsideSearchDays` before `start`. */
  stationRetrograde: Station | null;
  /** Station that closes the period, or null when it was not found within `outsideSearchDays` after `end`. */
  stationDirect: Station | null;
  /** The period was already under way at the window start. */
  startsBeforeWindow: boolean;
  /** The period is still open at the window end. */
  endsAfterWindow: boolean;
  /** Days between the two stations; null when either is missing. */
  durationDays: number | null;
}

export interface RetrogradePeriodsBodySummary {
  body: Planet;
  bodyName: string;
  /** Stations inside the window, in time order. */
  stations: Station[];
  retrogradeAtStart: boolean;
  retrogradeAtEnd: boolean;
  coverage: RootSearchCoverage;
}

export interface RetrogradePeriodsResult {
  start: Date;
  end: Date;
  /** Every retrograde period that overlaps the window, ordered by its opening (bodies mixed). */
  periods: RetrogradePeriod[];
  /** One entry per requested body, in request order. */
  bodies: RetrogradePeriodsBodySummary[];
  /** Bodies that never station, and period ends that were not found within `outsideSearchDays`. */
  notices: StationNotice[];
  outsideSearchDays: number;
  timeToleranceSeconds: number;
  method: StationSolverMethodMetadata;
}

const SECONDS_PER_DAY = 86_400;
const NEVER_STATIONS = new Set<number>([Planet.SUN, Planet.MOON]);
const SUPPORTED = new Set<number>(STATION_BODIES);

interface Settings {
  startJd: number;
  endJd: number;
  stepDays: number;
  timeToleranceSeconds: number;
}

function bodyName(body: Planet): string {
  return PLANET_AND_NODE_NAMES[body] ?? String(body);
}

function assertBody(body: Planet): void {
  if (SUPPORTED.has(body) || NEVER_STATIONS.has(body)) return;
  throw new TimelineError(
    "INVALID_INPUT",
    `stations are computed for Mercury through Pluto; body "${bodyName(body)}" is not supported (the lunar nodes are left out)`
  );
}

function resolveSettings(
  options: { start: Date; end: Date; stepDays?: number; timeToleranceSeconds?: number },
  defaultStepDays = 1
): Settings {
  const { start, end } = options;
  if (!(start instanceof Date) || !(end instanceof Date) || !Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
    throw new TimelineError("UNBOUNDED_INPUT", "finite `start` and `end` dates are required");
  }
  if (end.getTime() < start.getTime()) throw new TimelineError("INVALID_RANGE", "`end` must not be before `start`");
  const years = (end.getTime() - start.getTime()) / (365.25 * SECONDS_PER_DAY * 1000);
  if (years > MAX_STATION_WINDOW_YEARS) {
    throw new TimelineError("RANGE_TOO_LARGE", `window of ${years.toFixed(1)} years exceeds ${MAX_STATION_WINDOW_YEARS}`);
  }
  const step = options.stepDays ?? defaultStepDays;
  if (!Number.isFinite(step) || step <= 0) throw new TimelineError("INVALID_INPUT", "stepDays must be greater than 0");
  const timeToleranceSeconds = options.timeToleranceSeconds ?? 1;
  if (!Number.isFinite(timeToleranceSeconds) || timeToleranceSeconds <= 0) {
    throw new TimelineError("INVALID_INPUT", "timeToleranceSeconds must be greater than 0");
  }
  return {
    startJd: dateToJd(start),
    endJd: dateToJd(end),
    stepDays: Math.min(step, MAX_BODY_SCAN_STEP_DAYS),
    timeToleranceSeconds,
  };
}

interface SignChange {
  jd: number;
  bracketWidthSeconds: number;
  /** Sign of the scanned quantity after the change. */
  negativeAfter: boolean;
}

/** Bisect a bracket (`left` < `right`) whose ends disagree on `negative` down to the time tolerance. */
function refineSignChange(
  negative: (jd: number) => boolean,
  left: number,
  right: number,
  timeToleranceSeconds: number
): SignChange {
  const negativeAfter = negative(right);
  const tol = timeToleranceSeconds / SECONDS_PER_DAY;
  for (let i = 0; i < 200 && right - left > tol; i++) {
    const mid = (left + right) / 2;
    if (!(mid > left && mid < right)) break;
    if (negative(mid) === negativeAfter) right = mid;
    else left = mid;
  }
  return { jd: (left + right) / 2, bracketWidthSeconds: (right - left) * SECONDS_PER_DAY, negativeAfter };
}

/** Every sign change of a quantity on the scan grid of the window, refined, in time order. */
function scanSignChanges(
  negative: (jd: number) => boolean,
  settings: Settings
): { changes: SignChange[]; coverage: RootSearchCoverage } {
  const { startJd, endJd, stepDays, timeToleranceSeconds } = settings;
  const changes: SignChange[] = [];
  const steps = Math.max(1, Math.ceil((endJd - startJd) / stepDays));
  let gridPoints = 1;
  let left = startJd;
  for (let k = 1; k <= steps; k++) {
    const right = Math.min(startJd + k * stepDays, endJd);
    if (right <= left) break;
    gridPoints++;
    if (negative(left) !== negative(right)) changes.push(refineSignChange(negative, left, right, timeToleranceSeconds));
    left = right;
  }
  return {
    changes,
    coverage: { scope: "finite-grid", stepDays, gridPoints, stationsFound: changes.length, note: ROOT_SEARCH_COVERAGE_NOTE },
  };
}

function signOf(longitude: number): { sign: (typeof SIGNS)[number]; signDegree: number } {
  const signIndex = Math.floor(longitude / 30) % 12;
  return { sign: SIGNS[signIndex], signDegree: longitude - signIndex * 30 };
}

function toStation(body: Planet, fns: BodyLongitudeFunctions, change: SignChange, inWindow: boolean): Station {
  const longitude = fns.longitude(change.jd);
  return {
    body,
    bodyName: bodyName(body),
    kind: change.negativeAfter ? "retrograde" : "direct",
    jd: change.jd,
    instant: jdToDate(change.jd),
    longitude,
    ...signOf(longitude),
    speedDegreesPerDay: fns.speed(change.jd),
    bracketWidthSeconds: change.bracketWidthSeconds,
    inWindow,
  };
}

function scanWindow(
  body: Planet,
  fns: BodyLongitudeFunctions,
  settings: Settings
): { stations: Station[]; coverage: RootSearchCoverage } {
  const { changes, coverage } = scanSignChanges((jd) => fns.speed(jd) < 0, settings);
  return { stations: changes.map((c) => toStation(body, fns, c, true)), coverage };
}

/**
 * Nearest station outside the window, walking from `fromJd` in `direction` for at most `maxDays`.
 * Null when none is found, or when the ephemeris cannot be evaluated that far.
 */
function nearestStationOutside(
  body: Planet,
  fns: BodyLongitudeFunctions,
  fromJd: number,
  direction: 1 | -1,
  maxDays: number,
  settings: Settings
): Station | null {
  try {
    const steps = Math.ceil(maxDays / settings.stepDays);
    let near = fromJd;
    for (let k = 1; k <= steps; k++) {
      const far = fromJd + direction * Math.min(k * settings.stepDays, maxDays);
      if (fns.speed(near) < 0 !== fns.speed(far) < 0) {
        const negative = (jd: number) => fns.speed(jd) < 0;
        const change = refineSignChange(negative, Math.min(near, far), Math.max(near, far), settings.timeToleranceSeconds);
        return toStation(body, fns, change, false);
      }
      near = far;
    }
    return null;
  } catch (error) {
    if (error instanceof SwissEphError) return null;
    throw error;
  }
}

function neverStationsNotice(body: Planet): StationNotice {
  return {
    type: "never-stations",
    body,
    bodyName: bodyName(body),
    message: `${bodyName(body)} never stations or turns retrograde; no stations are returned.`,
  };
}

function emptyCoverage(stepDays: number): RootSearchCoverage {
  return { scope: "finite-grid", stepDays, gridPoints: 0, stationsFound: 0, note: ROOT_SEARCH_COVERAGE_NOTE };
}

/** Every station of `body` in [start, end], in time order. */
export function findStations(options: FindStationsOptions): StationSearchResult {
  assertBody(options.body);
  const settings = resolveSettings(options);
  const base = {
    body: options.body,
    bodyName: bodyName(options.body),
    start: options.start,
    end: options.end,
    timeToleranceSeconds: settings.timeToleranceSeconds,
    method: STATION_SOLVER_METHOD,
  };
  if (NEVER_STATIONS.has(options.body)) {
    return {
      ...base,
      stations: [],
      retrogradeAtStart: false,
      retrogradeAtEnd: false,
      notices: [neverStationsNotice(options.body)],
      coverage: emptyCoverage(settings.stepDays),
    };
  }
  const fns = createBodyLongitudeFunctions(options.body);
  const { stations, coverage } = scanWindow(options.body, fns, settings);
  return {
    ...base,
    stations,
    retrogradeAtStart: fns.speed(settings.startJd) < 0,
    retrogradeAtEnd: fns.speed(settings.endJd) < 0,
    notices: [],
    coverage,
  };
}

/**
 * Retrograde periods of one or several bodies that overlap [start, end]. A period under way
 * at `start`, or still open at `end`, keeps its true opening or closing station, searched
 * outside the window within `outsideSearchDays`; a station not found there is null and named
 * in `notices`.
 */
export function findRetrogradePeriods(options: FindRetrogradePeriodsOptions): RetrogradePeriodsResult {
  const requested = [...(options.body === undefined ? [] : [options.body]), ...(options.bodies ?? [])];
  const bodies = [...new Set(requested.length > 0 ? requested : STATION_BODIES)];
  bodies.forEach(assertBody);
  const settings = resolveSettings(options);
  const outsideSearchDays = options.outsideSearchDays ?? DEFAULT_STATION_OUTSIDE_SEARCH_DAYS;
  if (!Number.isFinite(outsideSearchDays) || outsideSearchDays < 0 || outsideSearchDays > MAX_STATION_OUTSIDE_SEARCH_DAYS) {
    throw new TimelineError(
      "INVALID_INPUT",
      `outsideSearchDays must be between 0 and ${MAX_STATION_OUTSIDE_SEARCH_DAYS}`
    );
  }

  const periods: RetrogradePeriod[] = [];
  const summaries: RetrogradePeriodsBodySummary[] = [];
  const notices: StationNotice[] = [];

  for (const body of bodies) {
    const name = bodyName(body);
    if (NEVER_STATIONS.has(body)) {
      notices.push(neverStationsNotice(body));
      summaries.push({
        body,
        bodyName: name,
        stations: [],
        retrogradeAtStart: false,
        retrogradeAtEnd: false,
        coverage: emptyCoverage(settings.stepDays),
      });
      continue;
    }

    const fns = createBodyLongitudeFunctions(body);
    const { stations, coverage } = scanWindow(body, fns, settings);
    const retrogradeAtStart = fns.speed(settings.startJd) < 0;
    const retrogradeAtEnd = fns.speed(settings.endJd) < 0;
    summaries.push({ body, bodyName: name, stations, retrogradeAtStart, retrogradeAtEnd, coverage });

    const push = (stationRetrograde: Station | null, stationDirect: Station | null, before: boolean, after: boolean) =>
      periods.push({
        body,
        bodyName: name,
        stationRetrograde,
        stationDirect,
        startsBeforeWindow: before,
        endsAfterWindow: after,
        durationDays: stationRetrograde && stationDirect ? stationDirect.jd - stationRetrograde.jd : null,
      });

    const opening = (): Station | null => {
      const found = nearestStationOutside(body, fns, settings.startJd, -1, outsideSearchDays, settings);
      if (!found) {
        notices.push({
          type: "opening-station-not-found",
          body,
          bodyName: name,
          message: `${name} is retrograde at the window start; the station that opened the period was not found within ${outsideSearchDays} days before it.`,
        });
      }
      return found;
    };
    const closing = (): Station | null => {
      const found = nearestStationOutside(body, fns, settings.endJd, 1, outsideSearchDays, settings);
      if (!found) {
        notices.push({
          type: "closing-station-not-found",
          body,
          bodyName: name,
          message: `${name} is retrograde at the window end; the station that closes the period was not found within ${outsideSearchDays} days after it.`,
        });
      }
      return found;
    };

    // Stations alternate, so a retrograde start means the first in-window station (if any) is direct.
    let open: Station | null = null;
    let openBefore = false;
    let isOpen = retrogradeAtStart;
    if (retrogradeAtStart) {
      open = opening();
      openBefore = true;
    }
    for (const station of stations) {
      if (station.kind === "retrograde") {
        open = station;
        openBefore = false;
        isOpen = true;
      } else if (isOpen) {
        push(open, station, openBefore, false);
        open = null;
        isOpen = false;
      }
    }
    if (isOpen) push(open, closing(), openBefore, true);
  }

  const order = (p: RetrogradePeriod) => p.stationRetrograde?.jd ?? settings.startJd - MAX_STATION_OUTSIDE_SEARCH_DAYS;
  periods.sort((a, b) => order(a) - order(b) || a.body - b.body);

  return {
    start: options.start,
    end: options.end,
    periods,
    bodies: summaries,
    notices,
    outsideSearchDays,
    timeToleranceSeconds: settings.timeToleranceSeconds,
    method: STATION_SOLVER_METHOD,
  };
}

// ── Declination: turning points and equator crossings ───────────────────────

/** Bodies of the declination searches: the Sun through Pluto. */
export const DECLINATION_BODIES = [Planet.SUN, Planet.MOON, ...STATION_BODIES] as const;

/** Default scan step of the declination searches for the Moon (days); other bodies use 1. */
export const MOON_DECLINATION_STEP_DAYS = 0.25;

/**
 * The motion in declination that begins at the turning point: "turns-south" is a local
 * maximum of declination (it stops increasing), "turns-north" a local minimum.
 */
export type DeclinationStationKind = "turns-south" | "turns-north";

export interface DeclinationStation {
  body: Planet;
  bodyName: string;
  kind: DeclinationStationKind;
  /** "maximum" for `turns-south`, "minimum" for `turns-north`. */
  extremum: "maximum" | "minimum";
  jd: number;
  instant: Date;
  /** Geocentric declination at the turning point, degrees (north positive). */
  declination: number;
  /** Tropical ecliptic longitude at that instant, degrees in [0, 360). */
  longitude: number;
  sign: (typeof SIGNS)[number];
  signDegree: number;
  /** True obliquity of the ecliptic at that instant, degrees. */
  obliquity: number;
  /** |declination| greater than the true obliquity of date. Always false for the Sun, which defines the bound. */
  outOfBounds: boolean;
  /** Declination speed at the emitted instant (deg/day); the residual of the search, about 0. */
  declinationSpeedDegreesPerDay: number;
  bracketWidthSeconds: number;
}

export interface EquatorCrossing {
  body: Planet;
  bodyName: string;
  /** "northward": declination goes from south to north. */
  direction: "northward" | "southward";
  jd: number;
  instant: Date;
  /** Declination at the emitted instant, degrees; the residual of the search, about 0. */
  declination: number;
  longitude: number;
  sign: (typeof SIGNS)[number];
  signDegree: number;
  declinationSpeedDegreesPerDay: number;
  bracketWidthSeconds: number;
}

export interface DeclinationSolverMethodMetadata {
  solver: "speed-sign-bracketing+bisection" | "declination-sign-bracketing+bisection";
  quantity: "geocentric apparent declination, true equator of date";
  declinationSpeed: "Swiss Ephemeris speed flag (EQUATORIAL | SPEED), not a finite difference";
  obliquity: "true obliquity of date (Swiss Ephemeris SE_ECL_NUT)";
  timeScale: "UT Julian Day";
  ephemeris: "Swiss Ephemeris (SWISS_EPH, SPEED)";
}

const DECLINATION_METHOD_BASE = {
  quantity: "geocentric apparent declination, true equator of date",
  declinationSpeed: "Swiss Ephemeris speed flag (EQUATORIAL | SPEED), not a finite difference",
  obliquity: "true obliquity of date (Swiss Ephemeris SE_ECL_NUT)",
  timeScale: "UT Julian Day",
  ephemeris: "Swiss Ephemeris (SWISS_EPH, SPEED)",
} as const;

export const DECLINATION_STATION_METHOD: DeclinationSolverMethodMetadata = {
  solver: "speed-sign-bracketing+bisection",
  ...DECLINATION_METHOD_BASE,
};

export const EQUATOR_CROSSING_METHOD: DeclinationSolverMethodMetadata = {
  solver: "declination-sign-bracketing+bisection",
  ...DECLINATION_METHOD_BASE,
};

export interface DeclinationSearchOptions {
  /** The Sun through Pluto (`DECLINATION_BODIES`). */
  body: Planet;
  /** Window (inclusive). Dates are absolute UTC instants. */
  start: Date;
  end: Date;
  /** Scan step in days (default 1, 0.25 for the Moon; capped at `MAX_BODY_SCAN_STEP_DAYS`). */
  stepDays?: number;
  /** Final bracket width in seconds (default 1). */
  timeToleranceSeconds?: number;
}

interface DeclinationSearchResultBase {
  body: Planet;
  bodyName: string;
  start: Date;
  end: Date;
  coverage: RootSearchCoverage;
  timeToleranceSeconds: number;
  method: DeclinationSolverMethodMetadata;
}

export interface DeclinationStationSearchResult extends DeclinationSearchResultBase {
  /** Turning points of declination inside the window, in time order; kinds alternate. */
  stations: DeclinationStation[];
}

export interface EquatorCrossingSearchResult extends DeclinationSearchResultBase {
  /** Crossings of declination 0 inside the window, in time order; directions alternate. */
  crossings: EquatorCrossing[];
}

const EQUATORIAL_FLAGS = CalcFlag.SWISS_EPH | CalcFlag.SPEED | CalcFlag.EQUATORIAL;
const DECLINATION_SUPPORTED = new Set<number>(DECLINATION_BODIES);

interface DeclinationSample {
  declination: number;
  speed: number;
}

/** Cached declination (deg) and declination speed (deg/day) of one body at a UT Julian Day. */
function createDeclinationSampler(body: Planet): (jd: number) => DeclinationSample {
  const cache = new Map<number, DeclinationSample>();
  return (jd) => {
    let sample = cache.get(jd);
    if (!sample) {
      const p = calculateBodyAtJulianDay(jd, body, EQUATORIAL_FLAGS);
      sample = { declination: p.latitude, speed: p.latitudeSpeed ?? 0 };
      cache.set(jd, sample);
    }
    return sample;
  };
}

function declinationSetup(options: DeclinationSearchOptions) {
  if (!DECLINATION_SUPPORTED.has(options.body)) {
    throw new TimelineError(
      "INVALID_INPUT",
      `declination events are computed for the Sun through Pluto; body "${bodyName(options.body)}" is not supported`
    );
  }
  const settings = resolveSettings(options, options.body === Planet.MOON ? MOON_DECLINATION_STEP_DAYS : 1);
  return {
    settings,
    sample: createDeclinationSampler(options.body),
    ecliptic: createBodyLongitudeFunctions(options.body),
    base: {
      body: options.body,
      bodyName: bodyName(options.body),
      start: options.start,
      end: options.end,
      timeToleranceSeconds: settings.timeToleranceSeconds,
    },
  };
}

/**
 * Turning points of the geocentric declination of `body` in [start, end]: the instants its
 * declination speed changes sign. For the Sun these are the solstices.
 */
export function findDeclinationStations(options: DeclinationSearchOptions): DeclinationStationSearchResult {
  const { settings, sample, ecliptic, base } = declinationSetup(options);
  const { changes, coverage } = scanSignChanges((jd) => sample(jd).speed < 0, settings);
  const stations = changes.map((change): DeclinationStation => {
    const { declination, speed } = sample(change.jd);
    const longitude = ecliptic.longitude(change.jd);
    const obliquity = calculateBodyAtJulianDay(change.jd, SWISS_ECL_NUT, CalcFlag.SWISS_EPH).longitude;
    return {
      body: base.body,
      bodyName: base.bodyName,
      kind: change.negativeAfter ? "turns-south" : "turns-north",
      extremum: change.negativeAfter ? "maximum" : "minimum",
      jd: change.jd,
      instant: jdToDate(change.jd),
      declination,
      longitude,
      ...signOf(longitude),
      obliquity,
      outOfBounds: base.body !== Planet.SUN && Math.abs(declination) > obliquity,
      declinationSpeedDegreesPerDay: speed,
      bracketWidthSeconds: change.bracketWidthSeconds,
    };
  });
  return { ...base, stations, coverage, method: DECLINATION_STATION_METHOD };
}

/**
 * Crossings of the celestial equator (declination 0) by `body` in [start, end]. For the Sun
 * these are the equinoxes.
 */
export function findEquatorCrossings(options: DeclinationSearchOptions): EquatorCrossingSearchResult {
  const { settings, sample, ecliptic, base } = declinationSetup(options);
  const { changes, coverage } = scanSignChanges((jd) => sample(jd).declination < 0, settings);
  const crossings = changes.map((change): EquatorCrossing => {
    const { declination, speed } = sample(change.jd);
    const longitude = ecliptic.longitude(change.jd);
    return {
      body: base.body,
      bodyName: base.bodyName,
      direction: change.negativeAfter ? "southward" : "northward",
      jd: change.jd,
      instant: jdToDate(change.jd),
      declination,
      longitude,
      ...signOf(longitude),
      declinationSpeedDegreesPerDay: speed,
      bracketWidthSeconds: change.bracketWidthSeconds,
    };
  });
  return { ...base, crossings, coverage, method: EQUATOR_CROSSING_METHOD };
}
