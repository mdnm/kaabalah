import { jdToDate } from "./root-solver";
import { calculateRiseTransit, Planet, RiseTransitFlag } from "./swisseph";

const HOUR_MS = 3_600_000;
const MINUTE_MS = 60_000;
const SUNRISE_LOOKBACK_HOURS = [30, 24, 18, 12, 6, 1];

/** Next local solar station. Swiss Ephemeris reports no rise or set for circumpolar dates. */
export function nextSunEvent(from: Date, latitude: number, longitude: number, event: RiseTransitFlag, extraFlags = 0): Date | null {
  try {
    return jdToDate(calculateRiseTransit(from, Planet.SUN, latitude, longitude, (event | extraFlags) as RiseTransitFlag));
  } catch (error) {
    if (error instanceof Error && error.name === "Error" && /rise or set not found/i.test(error.message)) return null;
    throw error;
  }
}

/** The last and next sunrise around an instant, with a bounded lookback near polar dates. */
export function getSunriseWindow(date: Date, latitude: number, longitude: number, extraFlags = 0) {
  const instant = date.getTime();
  const rise = (from: Date) => nextSunEvent(from, latitude, longitude, RiseTransitFlag.RISE, extraFlags);
  let sunrise: Date | null = null;
  let nextSunrise: Date | null = null;
  for (const hoursBack of SUNRISE_LOOKBACK_HOURS) {
    const found = rise(new Date(instant - hoursBack * HOUR_MS));
    if (!found) continue;
    if (found.getTime() <= instant) sunrise = found;
    break;
  }
  while (sunrise) {
    nextSunrise = rise(new Date(sunrise.getTime() + MINUTE_MS));
    if (!nextSunrise || nextSunrise.getTime() > instant) break;
    sunrise = nextSunrise;
  }
  return { sunrise, nextSunrise };
}

export async function resolveSolarTimeZone(latitude: number, longitude: number, timeZone?: string): Promise<string> {
  if (timeZone !== undefined) return timeZone;
  const mod = await import("tz-lookup");
  return (mod.default ?? mod)(latitude, longitude);
}
