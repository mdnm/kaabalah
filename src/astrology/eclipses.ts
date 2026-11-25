import { TimelineError } from "./firdaria";
import { SIGNS } from "./index";
import { dateToJd, jdToDate } from "./root-solver";
import { calculateBodyAtJulianDay, CalcFlag, nextGlobalEclipse, normalizeAngle, Planet, SwissEphError } from "./swisseph";

export type EclipseKind = "solar" | "lunar";
export type EclipseType = "total" | "annular" | "hybrid" | "partial" | "penumbral";

export interface Eclipse {
  kind: EclipseKind;
  type: EclipseType;
  /** The instant of global maximum, expressed in UT Julian days. */
  jd: number;
  /** The instant of global maximum, rounded to the nearest millisecond. */
  instant: Date;
  sunLongitude: number;
  moonLongitude: number;
  /** Geocentric apparent tropical longitude of the eclipsed body (Sun or Moon). */
  longitude: number;
  sign: (typeof SIGNS)[number];
  signDegree: number;
}

export interface FindEclipsesOptions {
  /** Inclusive start of the window, by the rounded instant of maximum. */
  start: Date;
  /** Exclusive end of the window, by the rounded instant of maximum. */
  end: Date;
}

export const MAX_ECLIPSE_WINDOW_YEARS = 150;
export const ECLIPSES_METHOD = Object.freeze({
  search: "Swiss Ephemeris swe_sol_eclipse_when_glob and swe_lun_eclipse_when",
  time: "global maximum in UT; Date rounded to the nearest millisecond",
  position: "geocentric apparent tropical longitude of the eclipsed body at maximum",
});

export interface EclipsesResult {
  start: Date;
  end: Date;
  eclipses: Eclipse[];
  method: typeof ECLIPSES_METHOD;
}

// Eclipse type bits from swephexp.h. Central/noncentral bits are independent.
const ECLIPSE_TYPES = [
  [32, "hybrid"], [4, "total"], [8, "annular"], [16, "partial"], [64, "penumbral"],
] as const;

/** Find solar and lunar eclipses worldwide in [start, end), in time order. Requires an initialized ephemeris. */
export function findEclipses({ start, end }: FindEclipsesOptions): EclipsesResult {
  if (!(start instanceof Date) || !(end instanceof Date) ||
      !Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
    throw new TimelineError("UNBOUNDED_INPUT", "finite `start` and `end` dates are required");
  }
  const duration = end.getTime() - start.getTime();
  if (duration < 0) throw new TimelineError("INVALID_RANGE", "`end` must not be before `start`");
  if (duration > MAX_ECLIPSE_WINDOW_YEARS * 365.25 * 86_400_000) {
    throw new TimelineError("RANGE_TOO_LARGE", `window exceeds ${MAX_ECLIPSE_WINDOW_YEARS} years`);
  }

  const eclipses: Eclipse[] = [];
  const result = { start, end, eclipses, method: ECLIPSES_METHOD };
  if (duration === 0) return result;

  for (const kind of ["solar", "lunar"] as const) {
    // Swiss skips maxima within 0.0001 days of its start. Start a minute early
    // so a maximum at the inclusive boundary is still found.
    let cursor = dateToJd(start) - 1 / 1440;
    while (true) {
      const { jd, flags } = nextGlobalEclipse(kind, cursor);
      const instant = jdToDate(jd);
      if (instant >= end) break;
      // Two eclipses of the same kind are always more than a day apart.
      cursor = jd + 1;
      if (instant < start) continue;

      const type = ECLIPSE_TYPES.find(([bit]) => flags & bit)?.[1];
      if (!type) {
        throw new SwissEphError("SWISSEPH_CALCULATION_FAILED", "Swiss Ephemeris returned an unknown eclipse type.", { kind, jd, flags });
      }
      const sunLongitude = normalizeAngle(calculateBodyAtJulianDay(jd, Planet.SUN, CalcFlag.SWISS_EPH).longitude);
      const moonLongitude = normalizeAngle(calculateBodyAtJulianDay(jd, Planet.MOON, CalcFlag.SWISS_EPH).longitude);
      const longitude = kind === "solar" ? sunLongitude : moonLongitude;
      const signIndex = Math.floor(longitude / 30);
      eclipses.push({
        kind, type, jd, instant, sunLongitude, moonLongitude, longitude,
        sign: SIGNS[signIndex],
        signDegree: longitude - signIndex * 30,
      });
    }
  }
  eclipses.sort((a, b) => a.jd - b.jd);
  return result;
}
