/**
 * Planetary hours: the planet ruling each of the 24 unequal hours of a planetary day.
 *
 * A planetary day runs from one sunrise to the next at the observer's place. Daylight
 * (sunrise to sunset) is cut into 12 equal parts and the night (sunset to next sunrise)
 * into 12 equal parts, so a day hour and a night hour only have the same length at the
 * equinoxes. Rulers follow the Chaldean order (Saturn, Jupiter, Mars, Sun, Venus, Mercury,
 * Moon); the first hour belongs to the ruler of the weekday, which makes the 25th hour
 * the ruler of the next weekday.
 *
 * Sunrise and sunset come from Swiss Ephemeris `swe_rise_trans` with its defaults: the
 * Sun's upper limb on the sea-level horizon with standard atmospheric refraction, which
 * is the convention of published almanac times.
 *
 * Synchronous; requires the Swiss Ephemeris to be initialised (`await getSwissEph(...)`),
 * otherwise the `SwissEphError` of the wrapper is thrown unchanged. Invalid input throws a
 * `TimelineError` (`INVALID_INPUT`). A place and date where the Sun does not rise or set
 * (polar day or night) is not an error: the result is `{ available: false, reason }`.
 */

import { TimelineError } from "./firdaria";
import { jdToDate } from "./root-solver";
import {
  Planet,
  RiseTransitFlag,
  calculateAzalt,
  calculateRiseTransit,
  calculateSinglePlanetPosition,
  type TimeZoneOptions,
} from "./swisseph";

export type PlanetaryHourRuler = "Saturn" | "Jupiter" | "Mars" | "Sun" | "Venus" | "Mercury" | "Moon";

/** Chaldean order: the seven classical planets from slowest to fastest. */
export const CHALDEAN_ORDER: readonly PlanetaryHourRuler[] = [
  "Saturn",
  "Jupiter",
  "Mars",
  "Sun",
  "Venus",
  "Mercury",
  "Moon",
];

/** Ruler of each weekday, indexed like `Date#getDay()` (0 = Sunday). */
export const WEEKDAY_RULERS: readonly PlanetaryHourRuler[] = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
];

export interface PlanetaryHoursOptions {
  /** The instant asked about (an absolute instant; its own time zone is irrelevant). */
  date: Date;
  /** Geographic latitude in degrees, north positive. */
  latitude: number;
  /** Geographic longitude in degrees, east positive. */
  longitude: number;
  /**
   * How to read the weekday of the sunrise. `utcOffsetMinutes` (east positive) wins over
   * `timeZone` (IANA, DST-aware), as everywhere else in this module. With neither, the
   * weekday is taken in the local mean time of `longitude` (4 minutes per degree).
   * The function is synchronous, so the lat/lon zone lookup (`autoTimeZone`,
   * `resolveTimeZone`) is not used here.
   */
  timeZoneSettings?: Pick<TimeZoneOptions, "timeZone" | "utcOffsetMinutes">;
}

export interface PlanetaryHour {
  /** 0..23 from sunrise; 0..11 are the day hours, 12..23 the night hours. */
  index: number;
  /** 1..12 within the day or within the night. */
  number: number;
  isDay: boolean;
  ruler: PlanetaryHourRuler;
  /** Inclusive start. */
  start: Date;
  /** Exclusive end; equal to the next hour's `start`. */
  end: Date;
}

export type PlanetaryWeekdayBasis = "utc-offset" | "time-zone" | "local-mean-time";

export interface PlanetaryHoursMethod {
  /** Where the weekday of the sunrise was read. */
  weekdayBasis: PlanetaryWeekdayBasis;
  /** IANA zone when `weekdayBasis` is `"time-zone"`, otherwise null. */
  timeZone: string | null;
  /** Offset applied to the sunrise instant, minutes east of UTC (fractional for local mean time). */
  utcOffsetMinutes: number;
  hourSystem: "unequal";
  rulerOrder: "chaldean";
  sunriseDefinition: "upper-limb-with-refraction";
  description: string;
}

export interface PlanetaryHours {
  available: true;
  date: Date;
  latitude: number;
  longitude: number;
  /** The sunrise that starts the planetary day containing `date` (at or before `date`). */
  sunrise: Date;
  sunset: Date;
  /** The sunrise that ends the planetary day (after `date`). */
  nextSunrise: Date;
  /** Local weekday of `sunrise`, 0 = Sunday. Before sunrise this is still the previous civil day. */
  weekday: number;
  dayRuler: PlanetaryHourRuler;
  /** Length of one day hour and one night hour, in minutes. */
  dayHourMinutes: number;
  nightHourMinutes: number;
  /** The 24 hours, contiguous from `sunrise` to `nextSunrise`. */
  hours: PlanetaryHour[];
  /** The hour containing `date` (the same object as in `hours`). */
  current: PlanetaryHour;
  method: PlanetaryHoursMethod;
}

/**
 * `polar-day`: the Sun does not set, `polar-night`: the Sun does not rise, in the window
 * around `date` that a planetary day needs.
 */
export type PlanetaryHoursUnavailableReason = "polar-day" | "polar-night";

export interface PlanetaryHoursUnavailable {
  available: false;
  reason: PlanetaryHoursUnavailableReason;
  message: string;
  date: Date;
  latitude: number;
  longitude: number;
  /** Refracted altitude of the Sun's centre at `date`, degrees. */
  sunApparentAltitude: number;
}

export type PlanetaryHoursResult = PlanetaryHours | PlanetaryHoursUnavailable;

const HOUR_MS = 3_600_000;
const MINUTE_MS = 60_000;
/** How far back the sunrise that starts the planetary day is looked for, latest start last. */
const SUNRISE_LOOKBACK_HOURS = [30, 24, 18, 12, 6, 1];
/** Apparent altitude of the Sun's centre when its upper limb touches the horizon (semi-diameter 16'). */
const UPPER_LIMB_ALTITUDE = -16 / 60;

/** Next sunrise or sunset after `from`, or null when the Sun has none in the ephemeris' search window. */
function nextSunEvent(from: Date, latitude: number, longitude: number, event: RiseTransitFlag): Date | null {
  try {
    return jdToDate(calculateRiseTransit(from, Planet.SUN, latitude, longitude, event));
  } catch (error) {
    // swe_rise_trans answers -2 for a circumpolar body; the wrapper turns it into this plain Error.
    if (error instanceof Error && error.name === "Error" && /rise or set not found/i.test(error.message)) {
      return null;
    }
    throw error;
  }
}

function invalid(message: string): TimelineError {
  return new TimelineError("INVALID_INPUT", message);
}

interface WeekdayResolution {
  weekday: number;
  basis: PlanetaryWeekdayBasis;
  timeZone: string | null;
  utcOffsetMinutes: number;
}

function weekdayAt(
  instant: Date,
  longitude: number,
  tz: PlanetaryHoursOptions["timeZoneSettings"]
): WeekdayResolution {
  if (tz?.utcOffsetMinutes !== undefined) {
    return {
      weekday: new Date(instant.getTime() + tz.utcOffsetMinutes * MINUTE_MS).getUTCDay(),
      basis: "utc-offset",
      timeZone: null,
      utcOffsetMinutes: tz.utcOffsetMinutes,
    };
  }
  if (tz?.timeZone) {
    let parts: Intl.DateTimeFormatPart[];
    try {
      parts = new Intl.DateTimeFormat("en-US", {
        timeZone: tz.timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
      }).formatToParts(instant);
    } catch {
      throw invalid(`Unknown IANA time zone "${tz.timeZone}".`);
    }
    const n = (type: string) => Number(parts.find((p) => p.type === type)?.value);
    const asUtc = Date.UTC(n("year"), n("month") - 1, n("day"), n("hour"), n("minute"), n("second"));
    const wholeSecond = Math.floor(instant.getTime() / 1000) * 1000;
    return {
      weekday: new Date(asUtc).getUTCDay(),
      basis: "time-zone",
      timeZone: tz.timeZone,
      utcOffsetMinutes: (asUtc - wholeSecond) / MINUTE_MS,
    };
  }
  const utcOffsetMinutes = longitude * 4;
  return {
    weekday: new Date(instant.getTime() + utcOffsetMinutes * MINUTE_MS).getUTCDay(),
    basis: "local-mean-time",
    timeZone: null,
    utcOffsetMinutes,
  };
}

const WEEKDAY_BASIS_TEXT: Record<PlanetaryWeekdayBasis, string> = {
  "utc-offset": "the given UTC offset",
  "time-zone": "the given IANA time zone",
  "local-mean-time": "the local mean time of the longitude (4 minutes per degree east of Greenwich)",
};

/**
 * Planetary hours of the planetary day containing `date` at a place.
 *
 * ```ts
 * const r = getPlanetaryHours({ date: new Date(), latitude: 51.48, longitude: 0 });
 * if (r.available) r.current.ruler; // planet of the hour
 * ```
 */
export function getPlanetaryHours(options: PlanetaryHoursOptions): PlanetaryHoursResult {
  const { date, latitude, longitude } = options;
  const tz = options.timeZoneSettings;
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw invalid("date must be a valid Date instant.");
  }
  if (typeof latitude !== "number" || !Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw invalid("latitude must be a number between -90 and 90.");
  }
  if (typeof longitude !== "number" || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw invalid("longitude must be a number between -180 and 180.");
  }
  if (
    tz?.utcOffsetMinutes !== undefined &&
    (typeof tz.utcOffsetMinutes !== "number" ||
      !Number.isFinite(tz.utcOffsetMinutes) ||
      Math.abs(tz.utcOffsetMinutes) > 18 * 60)
  ) {
    throw invalid("timeZoneSettings.utcOffsetMinutes must be a number of minutes between -1080 and 1080.");
  }

  const t = date.getTime();
  const rise = (from: Date) => nextSunEvent(from, latitude, longitude, RiseTransitFlag.RISE);

  // The sunrise at or before `date`: first one found from a start in the past, then walked forward.
  let sunrise: Date | null = null;
  let nextSunrise: Date | null = null;
  for (const hoursBack of SUNRISE_LOOKBACK_HOURS) {
    const found = rise(new Date(t - hoursBack * HOUR_MS));
    if (!found) continue;
    if (found.getTime() <= t) sunrise = found;
    break;
  }
  while (sunrise) {
    nextSunrise = rise(new Date(sunrise.getTime() + MINUTE_MS));
    if (!nextSunrise || nextSunrise.getTime() > t) break;
    sunrise = nextSunrise;
  }
  const sunset = sunrise ? nextSunEvent(sunrise, latitude, longitude, RiseTransitFlag.SET) : null;

  if (!sunrise || !sunset || !nextSunrise || sunset.getTime() >= nextSunrise.getTime()) {
    const sun = calculateSinglePlanetPosition(date, Planet.SUN);
    const sunApparentAltitude = calculateAzalt(
      date,
      latitude,
      longitude,
      sun.longitude,
      sun.latitude,
      sun.distance
    ).apparentAltitude;
    let reason: PlanetaryHoursUnavailableReason;
    if (sunrise && !sunset) reason = "polar-day";
    else if (sunrise && sunset && !nextSunrise) reason = "polar-night";
    else reason = sunApparentAltitude > UPPER_LIMB_ALTITUDE ? "polar-day" : "polar-night";
    return {
      available: false,
      reason,
      message:
        reason === "polar-day"
          ? "The Sun does not set at this place around this date, so the day cannot be divided into planetary hours."
          : "The Sun does not rise at this place around this date, so the day cannot be divided into planetary hours.",
      date,
      latitude,
      longitude,
      sunApparentAltitude,
    };
  }

  const resolved = weekdayAt(sunrise, longitude, tz);
  const dayRuler = WEEKDAY_RULERS[resolved.weekday];
  const first = CHALDEAN_ORDER.indexOf(dayRuler);

  const sunriseMs = sunrise.getTime();
  const sunsetMs = sunset.getTime();
  const nextSunriseMs = nextSunrise.getTime();
  const dayHourMs = (sunsetMs - sunriseMs) / 12;
  const nightHourMs = (nextSunriseMs - sunsetMs) / 12;
  const boundary = (i: number): number =>
    i === 24
      ? nextSunriseMs
      : i >= 12
        ? Math.round(sunsetMs + (i - 12) * nightHourMs)
        : Math.round(sunriseMs + i * dayHourMs);

  const hours: PlanetaryHour[] = [];
  for (let i = 0; i < 24; i++) {
    hours.push({
      index: i,
      number: (i % 12) + 1,
      isDay: i < 12,
      ruler: CHALDEAN_ORDER[(first + i) % 7],
      start: new Date(boundary(i)),
      end: new Date(boundary(i + 1)),
    });
  }
  const current = hours.find((h) => t >= h.start.getTime() && t < h.end.getTime()) ?? hours[23];

  return {
    available: true,
    date,
    latitude,
    longitude,
    sunrise,
    sunset,
    nextSunrise,
    weekday: resolved.weekday,
    dayRuler,
    dayHourMinutes: dayHourMs / MINUTE_MS,
    nightHourMinutes: nightHourMs / MINUTE_MS,
    hours,
    current,
    method: {
      weekdayBasis: resolved.basis,
      timeZone: resolved.timeZone,
      utcOffsetMinutes: resolved.utcOffsetMinutes,
      hourSystem: "unequal",
      rulerOrder: "chaldean",
      sunriseDefinition: "upper-limb-with-refraction",
      description:
        "planetary day from sunrise to next sunrise; 12 equal day hours (sunrise to sunset) and 12 equal night hours " +
        "(sunset to next sunrise); rulers in Chaldean order starting from the ruler of the weekday of the sunrise, " +
        `read in ${WEEKDAY_BASIS_TEXT[resolved.basis]}; sunrise and sunset are Swiss Ephemeris rise/set of the Sun's ` +
        "upper limb with standard refraction at sea level",
    },
  };
}
