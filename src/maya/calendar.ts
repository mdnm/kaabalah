import { civilDayOrdinal, formatCivilDate, isValidCivilDate, parseCivilDate, type CivilDate } from "../civil-date";

const SIGNS = [
  ["imix", "Imix", "Imox"],
  ["ik", "Ik", "Iq’"],
  ["akbal", "Akbal", "Aq’ab’al"],
  ["kan", "Kan", "K’at"],
  ["chicchan", "Chicchan", "Kan"],
  ["cimi", "Cimi", "Kame"],
  ["manik", "Manik", "Kej"],
  ["lamat", "Lamat", "Q’anil"],
  ["muluc", "Muluc", "Toj"],
  ["oc", "Oc", "Tz’i’"],
  ["chuen", "Chuen", "B’atz’"],
  ["eb", "Eb", "E"],
  ["ben", "Ben", "Aj"],
  ["ix", "Ix", "I’x"],
  ["men", "Men", "Tz’ikin"],
  ["cib", "Cib", "Ajmaq"],
  ["caban", "Caban", "No’j"],
  ["etznab", "Etznab", "Tijax"],
  ["cauac", "Cauac", "Kawoq"],
  ["ahau", "Ahau", "Ajpu"],
] as const;

const DIRECTIONS = ["north", "south", "east", "west"] as const;
const HAAB_MONTHS = [
  "Pop", "Uo", "Zip", "Zutz", "Tzec", "Xul", "Yaxkin", "Mol", "Chen", "Yax",
  "Zac", "Ceh", "Mac", "Kankin", "Muan", "Pax", "Kayab", "Cumku", "Uayeb",
] as const;
const HAAB_YEAR_DAYS = 365;
const HAAB_MONTH_DAYS = 20;
const CLASSIC_HAAB_ORIGIN = 17 * HAAB_MONTH_DAYS + 8; // 8 Cumku at the Long Count epoch.
export const TZOLKIN_CYCLE_DAYS = 260;
export const MAYA_GMT_CORRELATION = 584283;
const UNIX_EPOCH_JDN = 2440588;
const MOMOSTENANGO_YEAR_START = civilDayOrdinal({ year: 2010, month: 2, day: 22 });

export type MayaSignId = typeof SIGNS[number][0];
export type MayaDirection = typeof DIRECTIONS[number];
export type MayaDateInput = string | CivilDate;
export type MayaTone = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
export type MayaHaabCount = "momostenango" | "classic-gmt";
export type MayaHaabMonth = typeof HAAB_MONTHS[number];

export interface MayaHaabDate {
  readonly count: MayaHaabCount;
  readonly month: MayaHaabMonth;
  /** Zero-based day within the month. Day 0 is the seating of the month. */
  readonly day: number;
  /** Zero-based day from 0 Pop. */
  readonly dayOfYear: number;
  readonly daysInMonth: 5 | 20;
}

export interface TzolkinDay {
  readonly sign: MayaSignId;
  readonly yucatec: string;
  readonly kiche: string;
  readonly tone: MayaTone;
  readonly direction: MayaDirection;
  /** Day 1 is 8 Chuen in Johnson's Calendar Board. */
  readonly position: number;
}

export const MAYA_JOHNSON_METHOD = Object.freeze({
  tradition: "johnson-2011",
  source: Object.freeze({
    author: "Kenneth Johnson",
    title: "Mayan Calendar Astrology: Mapping Your Inner Cosmos",
    year: 2011,
  } as const),
  correlation: MAYA_GMT_CORRELATION,
  dayBoundary: "civil-midnight",
  directionScheme: "johnson-kiche",
  yearLord: "momostenango-365-day",
  roadOfLife: "26-year-rows",
} as const);

export function wrap(value: number, period: number): number {
  const remainder = value % period;
  return remainder === 0 ? 0 : remainder < 0 ? remainder + period : remainder;
}

export class MayaCalculationError extends RangeError {
  readonly name = "MayaCalculationError";

  constructor(readonly code: "INVALID_DATE" | "INVALID_ARGUMENT", message: string) {
    super(message);
  }
}

export function requireMayaDate(input: MayaDateInput): CivilDate {
  const date = typeof input === "string" ? parseCivilDate(input) : input;
  if (!isValidCivilDate(date)) throw new MayaCalculationError("INVALID_DATE", "Invalid Maya civil date");
  return date;
}

function signAtIndex(index: number) {
  const [sign, yucatec, kiche] = SIGNS[index];
  return { sign, yucatec, kiche, direction: DIRECTIONS[index % DIRECTIONS.length] };
}

export function getMayaSignMetadata(sign: MayaSignId) {
  const index = SIGNS.findIndex(row => row[0] === sign);
  if (index < 0) throw new MayaCalculationError("INVALID_ARGUMENT", "Unknown Maya day sign.");
  return signAtIndex(index);
}

export function dayAtPosition(position: number): TzolkinDay {
  const offset = wrap(position - 1, TZOLKIN_CYCLE_DAYS);
  return {
    ...signAtIndex((10 + offset) % SIGNS.length),
    tone: (1 + (7 + offset) % 13) as MayaTone,
    position: offset + 1,
  };
}

function longCountDayAtOrdinal(ordinal: number): number {
  return ordinal + UNIX_EPOCH_JDN - MAYA_GMT_CORRELATION;
}

export function dayAtOrdinal(ordinal: number): TzolkinDay {
  // The Long Count anchor is 4 Ahau, nine days after 8 Chuen.
  return dayAtPosition(longCountDayAtOrdinal(ordinal) + 10);
}

export function getTzolkinDay(date: MayaDateInput): TzolkinDay {
  return dayAtOrdinal(civilDayOrdinal(requireMayaDate(date)));
}

/** One complete Calendar Board in chronological order, from 8 Chuen. */
export function getTzolkinCycle(): TzolkinDay[] {
  return Array.from({ length: TZOLKIN_CYCLE_DAYS }, (_, index) => dayAtPosition(index + 1));
}

export function getTzolkinTrecena(day: TzolkinDay): TzolkinDay {
  return dayAtPosition(day.position - day.tone + 1);
}

function momostenangoDayOfYear(ordinal: number): number {
  return wrap(ordinal - MOMOSTENANGO_YEAR_START, HAAB_YEAR_DAYS);
}

export function haabMonthLength(month: MayaHaabMonth): 5 | 20 {
  return month === "Uayeb" ? 5 : HAAB_MONTH_DAYS;
}

export function haabAtOrdinal(ordinal: number, count: MayaHaabCount = "momostenango"): MayaHaabDate {
  const dayOfYear = count === "momostenango" ? momostenangoDayOfYear(ordinal)
    : wrap(longCountDayAtOrdinal(ordinal) + CLASSIC_HAAB_ORIGIN, HAAB_YEAR_DAYS);
  const month = HAAB_MONTHS[Math.floor(dayOfYear / HAAB_MONTH_DAYS)];
  return { count, month, day: dayOfYear % HAAB_MONTH_DAYS, dayOfYear, daysInMonth: haabMonthLength(month) };
}

/** Read the Haab in Johnson’s local count or from the Classic Long Count anchor. */
export function getMayaHaabDate(input: MayaDateInput, count: MayaHaabCount = "momostenango"): MayaHaabDate {
  if (count !== "momostenango" && count !== "classic-gmt") {
    throw new MayaCalculationError("INVALID_ARGUMENT", "Unknown Maya Haab count. Use momostenango or classic-gmt.");
  }
  return haabAtOrdinal(civilDayOrdinal(requireMayaDate(input)), count);
}

export function yearLordAtOrdinal(ordinal: number) {
  const daysSinceStart = momostenangoDayOfYear(ordinal);
  return { day: dayAtOrdinal(ordinal - daysSinceStart), daysSinceStart };
}

/** Read a civil date using Johnson’s day-count and Year Lord conventions. */
export function getMayaCalendarDay(input: MayaDateInput) {
  const date = requireMayaDate(input);
  const ordinal = civilDayOrdinal(date);
  const day = dayAtOrdinal(ordinal);
  return {
    method: MAYA_JOHNSON_METHOD,
    date: formatCivilDate(date),
    day,
    haab: haabAtOrdinal(ordinal),
    trecena: getTzolkinTrecena(day),
    yearLord: yearLordAtOrdinal(ordinal),
  };
}

/** Johnson’s Calendar Board, read down each column, starting with 8 Chuen. */
export function getMayaCalendarBoard(input?: MayaDateInput) {
  const active = input === undefined ? null : getMayaCalendarDay(input);
  const columns = TZOLKIN_CYCLE_DAYS / SIGNS.length;
  const rows = Array.from({ length: SIGNS.length }, (_, row) =>
    Array.from({ length: columns }, (_, column) => dayAtPosition(column * SIGNS.length + row + 1)),
  );
  return {
    method: MAYA_JOHNSON_METHOD,
    active: active && { date: active.date, day: active.day },
    rows,
  };
}
