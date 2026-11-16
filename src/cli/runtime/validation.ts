import { cliText } from "./language";
import { TimeZoneOptions } from "../../astrology/swisseph";
import { exitWithError } from "./errors";
import type { Flags } from "./types";
import { civilDateToLocalNoon, parseCivilDate, type CivilDate } from "../../civil-date";

const UTC_NOON_SUFFIX = "T12:00:00" + "Z";

export const HOUSE_SYSTEM_MAP: Record<string, string> = {
  placidus: "P",
  koch: "K",
  porphyrius: "O",
  regiomontanus: "R",
  campanus: "C",
  equal: "E",
  "whole-sign": "W",
  meridian: "X",
  morinus: "M",
  krusinski: "U",
  alcabitius: "B",
};

interface TimeMessages {
  invalidFormat: (value: string) => string;
  invalidValue: (value: string) => string;
}

interface CoordinateMessages {
  missing: string;
  invalidLatitude: (value: number) => string;
  invalidLongitude: (value: number) => string;
}

export interface ParsedTime {
  timeStr: string;
  hour: number;
  minute: number;
}

export interface ParsedCoordinates {
  latitude: number;
  longitude: number;
}

export interface ParsedHouseSystem {
  houseSystem: string;
  houseSystemCode: string;
}

export interface ParsedChartInput {
  birthDate: Date;
  latitude: number;
  longitude: number;
  houseSystem: string;
  houseSystemCode: string;
  timeZoneSettings: TimeZoneOptions;
  dateStr: string;
  timeStr: string;
}

interface ChartInputDefaults {
  houseSystem?: string;
  timezone?: string;
}

export function validateDateRange(dateStr: string, flags: Flags): void {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    exitWithError("INVALID_DATE", cliText("Invalid date: \"{0}\". Use YYYY-MM-DD format.", [dateStr]), flags);
  }

  const year = Number.parseInt(match[1], 10);
  if (year < 1 || year > 9999) {
    exitWithError("INVALID_DATE", cliText("Year must be between 0001 and 9999, got {0}.", [year]), flags);
  }
}

/**
 * Strictly validate a YYYY-MM-DD civil date (real Gregorian calendar day, year
 * 0001-9999) before any `Date` is constructed, so JS date normalisation can
 * never turn 2026-02-30 into 2026-03-02.
 */
export function parseCivilDateInput(dateStr: string, flags: Flags): CivilDate {
  validateDateRange(dateStr, flags);
  const civil = parseCivilDate(dateStr);
  if (!civil) {
    exitWithError("INVALID_DATE", cliText("Invalid date: \"{0}\". The date does not exist in the calendar.", [dateStr]), flags);
  }
  return civil;
}

export function validateDateString(dateStr: string, flags: Flags): void {
  parseCivilDateInput(dateStr, flags);
}

/** Local-noon `Date` for a CLI date string (safe for years 0001-0099). */
export function parseDate(dateStr: string, flags: Flags): Date {
  return civilDateToLocalNoon(parseCivilDateInput(dateStr, flags));
}

export function parseUtcNoonDate(dateStr: string, flags: Flags): Date {
  validateDateString(dateStr, flags);
  return new Date(`${dateStr}${UTC_NOON_SUFFIX}`);
}

export function parseTimeValue(timeStr: string, flags: Flags, messages: TimeMessages): ParsedTime {
  const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!timeMatch) {
    exitWithError("INVALID_ARGUMENT", messages.invalidFormat(timeStr), flags);
  }

  const hour = Number.parseInt(timeMatch[1], 10);
  const minute = Number.parseInt(timeMatch[2], 10);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    exitWithError("INVALID_ARGUMENT", messages.invalidValue(timeStr), flags);
  }

  return { timeStr, hour, minute };
}

export function parseCoordinates(
  latitude: number | undefined,
  longitude: number | undefined,
  flags: Flags,
  messages: CoordinateMessages
): ParsedCoordinates {
  if (latitude == null || longitude == null) {
    exitWithError("MISSING_ARGUMENT", messages.missing, flags);
  }

  if (latitude < -90 || latitude > 90) {
    exitWithError("INVALID_ARGUMENT", messages.invalidLatitude(latitude), flags);
  }

  if (longitude < -180 || longitude > 180) {
    exitWithError("INVALID_ARGUMENT", messages.invalidLongitude(longitude), flags);
  }

  return { latitude, longitude };
}

export function parseHouseSystem(
  houseSystem: string,
  flags: Flags,
  invalidMessage: (value: string, valid: string[]) => string
): ParsedHouseSystem {
  const normalized = houseSystem.toLowerCase();
  const houseSystemCode = HOUSE_SYSTEM_MAP[normalized];
  if (!houseSystemCode) {
    exitWithError("INVALID_ARGUMENT", invalidMessage(houseSystem, Object.keys(HOUSE_SYSTEM_MAP)), flags);
  }

  return { houseSystem, houseSystemCode };
}

/** Local birth instant for an already validated YYYY-MM-DD string (full year, including 0001-0099). */
export function buildBirthDate(dateStr: string, hour: number, minute: number): Date {
  const civil = parseCivilDate(dateStr);
  if (!civil) throw new RangeError(`Invalid civil date: ${dateStr}`);
  const date = civilDateToLocalNoon(civil);
  date.setHours(hour, minute, 0, 0);
  return date;
}

export function parseChartInput(
  input: Record<string, unknown>,
  label: string,
  flags: Flags,
  defaults: ChartInputDefaults = {}
): ParsedChartInput {
  const dateStr = input.date as string | undefined;
  if (!dateStr) {
    exitWithError("MISSING_ARGUMENT", cliText("{0}: \"date\" is required (YYYY-MM-DD).", [label]), flags);
  }
  validateDateString(dateStr, flags);

  const { timeStr, hour, minute } = parseTimeValue((input.time as string) ?? "12:00", flags, {
    invalidFormat: (value) => cliText("{0}: Invalid time format \"{1}\". Use HH:MM.", [label, value]),
    invalidValue: (value) => cliText("{0}: Invalid time \"{1}\". Hours 0-23, minutes 0-59.", [label, value]),
  });

  const { latitude, longitude } = parseCoordinates(
    input.lat != null ? Number(input.lat) : undefined,
    input.lon != null ? Number(input.lon) : undefined,
    flags,
    {
      missing: cliText("{0}: \"lat\" and \"lon\" are required.", [label]),
      invalidLatitude: (value) => cliText("{0}: Latitude must be between -90 and 90, got {1}.", [label, value]),
      invalidLongitude: (value) => cliText("{0}: Longitude must be between -180 and 180, got {1}.", [label, value]),
    }
  );

  const { houseSystem, houseSystemCode } = parseHouseSystem(
    (input.houseSystem as string) ?? defaults.houseSystem ?? "placidus",
    flags,
    (value, valid) => cliText("{0}: Unknown house system \"{1}\". Valid: {2}", [label, value, valid.join(", ")])
  );

  const timezoneStr = (input.timezone as string | undefined) ?? defaults.timezone;
  const timeZoneSettings = timezoneStr ? { timeZone: timezoneStr } : { autoTimeZone: true };

  return {
    birthDate: buildBirthDate(dateStr, hour, minute),
    latitude,
    longitude,
    houseSystem,
    houseSystemCode,
    timeZoneSettings,
    dateStr,
    timeStr,
  };
}
