export const TATTWA_ORDER = Object.freeze(["akash", "vayu", "tejas", "prithvi", "apas"] as const);
export type TattwaId = typeof TATTWA_ORDER[number];

const PERIOD_MS = 24 * 60_000;
const MAX_SOLAR_DAY_MS = 36 * 60 * 60_000;
export const TATTWA_METHOD = Object.freeze({
  name: "Tatwameter",
  source: Object.freeze({ title: "O Tatwametro", author: "Arnold Krumm-Heller" }),
  anchor: "local-sunrise",
  periodMinutes: 24,
  cycleMinutes: 120,
  interval: "start-inclusive-end-exclusive",
  sunriseDefinition: "upper-limb-with-refraction",
} as const);

export class TattwaError extends RangeError {
  readonly name = "TattwaError";
  readonly code = "INVALID_ARGUMENT";
}

export interface TattwaPeriod {
  readonly tattwa: TattwaId;
  readonly start: Date;
  readonly end: Date;
}

export interface TattwaScheduleOptions {
  readonly date: Date;
  readonly latitude: number;
  readonly longitude: number;
}

function instantOf(date: Date): number {
  return date instanceof Date ? date.getTime() : NaN;
}

/** Build the fixed sequence for an almanac sunrise and the next day's sunrise. */
export function calculateTattwaSchedule(sunrise: Date, nextSunrise: Date, date: Date = sunrise) {
  const start = instantOf(sunrise);
  const end = instantOf(nextSunrise);
  const instant = instantOf(date);
  if (!(start <= instant && instant < end && end - start <= MAX_SOLAR_DAY_MS)) {
    throw new TattwaError("Tattwa schedule requires an instant between consecutive sunrises, at most 36 hours apart.");
  }

  const periods: TattwaPeriod[] = Array.from({ length: Math.ceil((end - start) / PERIOD_MS) }, (_, index) => ({
    tattwa: TATTWA_ORDER[index % TATTWA_ORDER.length],
    start: new Date(start + index * PERIOD_MS),
    end: new Date(Math.min(end, start + (index + 1) * PERIOD_MS)),
  }));
  return {
    available: true as const,
    method: TATTWA_METHOD,
    date: new Date(instant),
    sunrise: new Date(start),
    nextSunrise: new Date(end),
    periods,
    current: periods[Math.floor((instant - start) / PERIOD_MS)],
  };
}

/** Schedule at a location. Initialise Swiss Ephemeris before calling. */
export async function getTattwaSchedule({ date, latitude, longitude }: TattwaScheduleOptions) {
  const instant = instantOf(date);
  if (!Number.isFinite(instant) || !Number.isFinite(latitude) || Math.abs(latitude) > 90
    || !Number.isFinite(longitude) || Math.abs(longitude) > 180) {
    throw new TattwaError("Tattwa schedule requires a valid instant and geographic coordinates.");
  }
  const at = new Date(instant);
  const { getSunriseWindow } = await import("../astrology/solar-events");
  const { sunrise, nextSunrise } = getSunriseWindow(at, latitude, longitude);
  if (!sunrise || !nextSunrise || nextSunrise.getTime() - sunrise.getTime() > MAX_SOLAR_DAY_MS) {
    return { available: false as const, method: TATTWA_METHOD, date: at, latitude, longitude, reason: "no-consecutive-sunrises" as const };
  }
  return { ...calculateTattwaSchedule(sunrise, nextSunrise, at), latitude, longitude };
}
