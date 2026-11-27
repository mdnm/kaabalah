import { civilDayOrdinal, formatCivilDate } from "../civil-date";
import { MayaCalculationError, dayAtOrdinal, requireMayaDate, type MayaDateInput } from "./calendar";

export interface MayaSunsetLocation {
  readonly latitude: number;
  readonly longitude: number;
  readonly timeZone?: string;
}

const DAY_MS = 86_400_000;

/** The incoming Tzolk’in sign and, when a location is supplied, the civil date’s local sunset. */
export async function getMayaSunsetWelcome(input: MayaDateInput, location?: MayaSunsetLocation) {
  const date = requireMayaDate(input);
  const ordinal = civilDayOrdinal(date);
  const incomingDay = dayAtOrdinal(ordinal + 1);
  const welcome = { incomingDay, opensTrecena: incomingDay.tone === 1 };
  if (!location) return { ...welcome, status: "no-location" as const, sunset: null, timeZone: null };

  const { latitude, longitude } = location;
  if (!Number.isFinite(latitude) || Math.abs(latitude) > 90 || !Number.isFinite(longitude) || Math.abs(longitude) > 180) {
    throw new MayaCalculationError("INVALID_ARGUMENT", "Maya sunset requires valid geographic coordinates.");
  }
  const { nextSunEvent, resolveSolarTimeZone } = await import("../astrology/solar-events");
  const { RiseTransitFlag } = await import("../astrology/swisseph");
  const timeZone = await resolveSolarTimeZone(latitude, longitude, location.timeZone);
  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone, calendar: "gregory", year: "numeric", month: "2-digit", day: "2-digit", era: "short",
    });
  } catch {
    throw new MayaCalculationError("INVALID_ARGUMENT", `Unknown IANA time zone "${timeZone}".`);
  }

  // Search the UTC days on either side, then match the event to the requested local date.
  const utcStart = ordinal * DAY_MS;
  let from = new Date(utcStart - DAY_MS);
  const target = formatCivilDate(date);
  while (from.getTime() < utcStart + 2 * DAY_MS) {
    const sunset = nextSunEvent(from, latitude, longitude, RiseTransitFlag.SET);
    if (!sunset || sunset.getTime() >= utcStart + 2 * DAY_MS) break;
    const parts = formatter.formatToParts(sunset);
    const value = (type: string) => parts.find(part => part.type === type)?.value;
    const localDate = [value("year")?.padStart(4, "0"), value("month"), value("day")].join("-");
    if (value("era") === "AD" && localDate === target) {
      return { ...welcome, status: "calculated" as const, sunset, timeZone };
    }
    from = new Date(sunset.getTime() + 60_000);
  }
  return { ...welcome, status: "unavailable" as const, sunset: null, timeZone };
}
