/**
 * Civil (proleptic Gregorian, timezone-free) date helpers.
 *
 * A CivilDate is a calendar day, not an instant. All arithmetic here is pure
 * integer arithmetic on day ordinals, so it cannot drift across DST changes
 * or depend on the host timezone. Legacy `Date` APIs are bridged with
 * `civilDateFromLocalDate` / `civilDateToLocalNoon` (local-noon convention).
 */

export interface CivilDate {
  /** Full Gregorian year, 1–9999. */
  year: number;
  /** Month 1–12. */
  month: number;
  /** Day of month 1–31, valid for the month. */
  day: number;
}

export const MIN_CIVIL_YEAR = 1;
export const MAX_CIVIL_YEAR = 9999;

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return month === 4 || month === 6 || month === 9 || month === 11 ? 30 : 31;
}

export function isValidCivilDate(value: unknown): value is CivilDate {
  if (value === null || typeof value !== "object") return false;
  const { year, month, day } = value as Partial<CivilDate>;
  return (
    Number.isInteger(year) &&
    Number.isInteger(month) &&
    Number.isInteger(day) &&
    (year as number) >= MIN_CIVIL_YEAR &&
    (year as number) <= MAX_CIVIL_YEAR &&
    (month as number) >= 1 &&
    (month as number) <= 12 &&
    (day as number) >= 1 &&
    (day as number) <= daysInMonth(year as number, month as number)
  );
}

export function civilDate(year: number, month: number, day: number): CivilDate {
  const value = { year, month, day };
  if (!isValidCivilDate(value)) {
    throw new RangeError(`Invalid civil date: ${year}-${month}-${day}`);
  }
  return value;
}

/** Strict `YYYY-MM-DD` parser. Returns null for malformed or impossible dates. */
export function parseCivilDate(text: string): CivilDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!match) return null;
  const value = {
    year: Number.parseInt(match[1], 10),
    month: Number.parseInt(match[2], 10),
    day: Number.parseInt(match[3], 10)
  };
  return isValidCivilDate(value) ? value : null;
}

export function formatCivilDate(date: CivilDate): string {
  const pad = (n: number, width: number) => String(n).padStart(width, "0");
  return `${pad(date.year, 4)}-${pad(date.month, 2)}-${pad(date.day, 2)}`;
}

/**
 * Days since 1970-01-01 in the proleptic Gregorian calendar (pure integer
 * arithmetic; independent of timezone, DST and time of day).
 */
export function civilDayOrdinal(date: CivilDate): number {
  const y = date.month <= 2 ? date.year - 1 : date.year;
  const era = Math.floor(y / 400);
  const yoe = y - era * 400;
  const mp = (date.month + 9) % 12;
  const doy = Math.floor((153 * mp + 2) / 5) + date.day - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

export function civilDateFromOrdinal(ordinal: number): CivilDate {
  const z = ordinal + 719468;
  const era = Math.floor(z / 146097);
  const doe = z - era * 146097;
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const day = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const month = mp < 10 ? mp + 3 : mp - 9;
  const year = yoe + era * 400 + (month <= 2 ? 1 : 0);
  return { year, month, day };
}

export function addCivilDays(date: CivilDate, days: number): CivilDate {
  return civilDateFromOrdinal(civilDayOrdinal(date) + days);
}

/** `b - a` in whole civil days. */
export function diffCivilDays(a: CivilDate, b: CivilDate): number {
  return civilDayOrdinal(b) - civilDayOrdinal(a);
}

export function compareCivilDates(a: CivilDate, b: CivilDate): number {
  return civilDayOrdinal(a) - civilDayOrdinal(b);
}

/** Reads the host-local calendar day of a legacy `Date`. */
export function civilDateFromLocalDate(date: Date): CivilDate {
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
}

/**
 * Local-noon `Date` for a civil day. Safe for years 0001–0099, which numeric
 * `Date` constructors would otherwise reinterpret as 1900–1999.
 */
export function civilDateToLocalNoon(date: CivilDate): Date {
  const result = new Date(2000, 0, 1, 12, 0, 0, 0);
  result.setFullYear(date.year, date.month - 1, date.day);
  return result;
}

/**
 * Completed years between two civil days (birthday age). A 29 February
 * birthday completes its year on 1 March in non-leap years.
 */
export function completedYears(from: CivilDate, to: CivilDate): number {
  let years = to.year - from.year;
  if (to.month < from.month || (to.month === from.month && to.day < from.day)) {
    years -= 1;
  }
  return years;
}

/**
 * Anniversary of `birth` in `year`. A 29 February birth resolves to 1 March
 * in non-leap years (roll-forward), matching `completedYears`.
 */
export function anniversaryInYear(birth: CivilDate, year: number): CivilDate {
  if (birth.month === 2 && birth.day === 29 && !isLeapYear(year)) {
    return { year, month: 3, day: 1 };
  }
  return { year, month: birth.month, day: birth.day };
}
