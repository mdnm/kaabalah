/**
 * Types, errors and input normalisation shared by the dated numerology
 * schedule facade (`schedule.ts`, `partial-date.ts`, `life-stages.ts`).
 *
 * All dates are civil Gregorian days (`CivilDate` or "YYYY-MM-DD"); nothing in
 * this facade reads the host timezone and intervals are half-open
 * `[start, endExclusive)`.
 */

import {
  type CivilDate,
  MAX_CIVIL_YEAR,
  MIN_CIVIL_YEAR,
  daysInMonth,
  formatCivilDate,
  isValidCivilDate,
  parseCivilDate,
} from "../civil-date";

export const SCHEDULE_METHOD_VERSION = "kaabalah-numerology-schedule/1";

/** Largest year accepted as input so that "next birthday" arithmetic stays within 1-9999. */
export const MAX_SCHEDULE_YEAR = MAX_CIVIL_YEAR - 1;
/** Hard cap on the span of a timeline request, in days (about 100 years). */
export const MAX_TIMELINE_RANGE_DAYS = 36525;
/** Hard cap on the number of intervals a timeline may contain. */
export const MAX_TIMELINE_INTERVALS_HARD_CAP = 10000;
export const DEFAULT_MAX_TIMELINE_INTERVALS = 2000;
/** Hard cap on candidate dates enumerated for partial birth dates (a whole year). */
export const MAX_CANDIDATE_DATES = 366;

export type NumerologyErrorCode =
  | "INVALID_DATE"
  | "INVALID_ARGUMENT"
  | "INVALID_RANGE"
  | "RANGE_TOO_LARGE"
  | "TOO_MANY_INTERVALS"
  | "MISSING_BIRTH_DATE";

/** Typed `RangeError` raised by the schedule facade. `code` is stable and machine-readable. */
export class NumerologyScheduleError extends RangeError {
  readonly code: NumerologyErrorCode;

  constructor(code: NumerologyErrorCode, message: string) {
    super(message);
    this.name = "NumerologyScheduleError";
    this.code = code;
  }
}

export type CivilDateInput = CivilDate | string;

/** Discriminated birth-date knowledge. */
export type PartialBirthDate =
  | { kind: "full"; date: CivilDateInput }
  | { kind: "month-day"; month: number; day: number }
  | { kind: "year-month"; year: number; month: number }
  | { kind: "year"; year: number; approximate?: boolean }
  | { kind: "unknown" };

/** A full date (`CivilDate` or "YYYY-MM-DD") or an explicit partial-date description. */
export type BirthInput = CivilDateInput | PartialBirthDate;

export type ShortMonthPolicy = "next-month-first" | "clamp" | "overflow";
export type LifePathMethod = "kaabalistic" | "straight-across";
export type MasterPolicy = "preserve" | "reduce";
export type NameInputKind = "first-token" | "given-name" | "full-name";

export type PinnacleTransitionRule = "36-minus-life-path" | "fixed-first-end-age";
export type LifePeriodRule = "pinnacle-aligned-27" | "fixed-28-56";

export interface LifeStageOptions {
  /** Life path used for the age-transition rule. Default `"straight-across"` (the traditional pinnacle convention). */
  lifePathMethod?: LifePathMethod;
  /** Overrides the "36 minus single-digit life path" first-pinnacle end age (integer 1-60). */
  firstPinnacleEndAge?: number;
  /** Boundaries of the three life periods. Default `"pinnacle-aligned-27"`. */
  lifePeriodRule?: LifePeriodRule;
}

export interface ScheduleLimits {
  /** Death date (inclusive last day of coverage). A missing death date is NOT evidence of survival and ends nothing. */
  death?: CivilDateInput | null;
  /** Exclusive end of coverage. */
  horizonEndExclusive?: CivilDateInput | null;
}

export interface ScheduleOptions {
  /** Name used for the soul number (period 3). Missing/blank -> period 3 unavailable. */
  firstName?: string | null;
  /** How `firstName` is read. Default `"first-token"` (first whitespace-delimited token). */
  nameKind?: NameInputKind;
  /** Life path used for personal period 2. Default `"kaabalistic"`. */
  lifePathMethod?: LifePathMethod;
  /** Master-number policy for personal year/month/period, calendar frame, life path and pinnacles. Default `"preserve"`. Fibonacci never preserves masters. */
  masters?: MasterPolicy;
  /** Personal-month boundary policy when the birth day is absent from a month. Default `"next-month-first"` (legacy). */
  shortMonthPolicy?: ShortMonthPolicy;
  limits?: ScheduleLimits;
  lifeStages?: LifeStageOptions;
}

export interface ScheduleInput extends ScheduleOptions {
  birth: BirthInput;
}

export interface ReducedNumber {
  value: number;
  reductionSteps: number[];
  isMaster: boolean;
}

export type UnavailableReason =
  | "birth-date-unknown"
  | "birth-day-or-month-unknown"
  | "birth-year-unknown"
  | "birth-year-approximate"
  | "first-name-missing"
  | "first-name-has-no-vowels"
  | "before-birth"
  | "after-death"
  | "after-horizon"
  | "full-birth-date-required"
  | "beyond-supported-calendar";

export interface Unavailable {
  available: false;
  reason: UnavailableReason;
  detail: string;
}

export function unavailable(reason: UnavailableReason, detail: string): Unavailable {
  return { available: false, reason, detail };
}

export interface MethodDescriptor {
  id: string;
  formula: string;
}

export interface NumerologyMethodMetadata {
  methodVersion: string;
  dateModel: string;
  lifePathMethod: LifePathMethod;
  lifePathMethodDescription: string;
  masterPolicy: MasterPolicy;
  masterNumbers: number[];
  fibonacciReduction: string;
  nameInput: { kind: NameInputKind; provided: boolean; rule: string };
  gematria: string;
  shortMonthPolicy: ShortMonthPolicy;
  limits: {
    death: string | null;
    horizonEndExclusive: string | null;
    deathNote: string;
  };
  methods: Record<string, MethodDescriptor>;
  notes: string[];
}

export function fmt(date: CivilDate): string {
  if (date.year < MIN_CIVIL_YEAR || date.year > MAX_CIVIL_YEAR) {
    throw new NumerologyScheduleError("INVALID_DATE", `Date out of supported range: year ${date.year}`);
  }
  return formatCivilDate(date);
}

/** Parses a date input, throwing a typed error for malformed/impossible/out-of-range values. */
export function resolveCivilDate(input: CivilDateInput, label = "date"): CivilDate {
  let result: CivilDate | null;
  if (typeof input === "string") {
    result = parseCivilDate(input);
    if (!result) {
      throw new NumerologyScheduleError(
        "INVALID_DATE",
        `${label} must be a real calendar date formatted YYYY-MM-DD (got ${JSON.stringify(input)})`
      );
    }
  } else if (isValidCivilDate(input)) {
    result = { year: input.year, month: input.month, day: input.day };
  } else {
    throw new NumerologyScheduleError("INVALID_DATE", `${label} is not a valid civil date`);
  }
  if (result.year > MAX_SCHEDULE_YEAR) {
    throw new NumerologyScheduleError("INVALID_DATE", `${label}: years above ${MAX_SCHEDULE_YEAR} are not supported`);
  }
  return result;
}

export type NormalizedBirth =
  | { kind: "full"; date: CivilDate }
  | { kind: "month-day"; month: number; day: number }
  | { kind: "year-month"; year: number; month: number }
  | { kind: "year"; year: number; approximate: boolean }
  | { kind: "unknown" };

function isPartial(input: BirthInput): input is PartialBirthDate {
  return typeof input === "object" && input !== null && "kind" in input;
}

export function normalizeBirth(input: BirthInput | undefined): NormalizedBirth {
  if (input === undefined || input === null) {
    throw new NumerologyScheduleError("INVALID_ARGUMENT", "birth is required (use { kind: \"unknown\" } for no information)");
  }
  if (!isPartial(input)) {
    return { kind: "full", date: resolveCivilDate(input, "birth date") };
  }
  switch (input.kind) {
    case "full":
      return { kind: "full", date: resolveCivilDate(input.date, "birth date") };
    case "month-day": {
      const { month, day } = input;
      // 29 February is a valid month/day (leap years exist).
      if (!Number.isInteger(month) || !Number.isInteger(day) || month < 1 || month > 12 || day < 1 || day > daysInMonth(2000, month)) {
        throw new NumerologyScheduleError("INVALID_DATE", `Invalid month/day: ${month}/${day}`);
      }
      return { kind: "month-day", month, day };
    }
    case "year-month": {
      const { year, month } = input;
      assertYear(year);
      if (!Number.isInteger(month) || month < 1 || month > 12) {
        throw new NumerologyScheduleError("INVALID_DATE", `Invalid month: ${month}`);
      }
      return { kind: "year-month", year, month };
    }
    case "year":
      assertYear(input.year);
      return { kind: "year", year: input.year, approximate: input.approximate === true };
    case "unknown":
      return { kind: "unknown" };
    default:
      throw new NumerologyScheduleError("INVALID_ARGUMENT", `Unknown birth kind: ${String((input as { kind: unknown }).kind)}`);
  }
}

function assertYear(year: number): void {
  if (!Number.isInteger(year) || year < MIN_CIVIL_YEAR || year > MAX_SCHEDULE_YEAR) {
    throw new NumerologyScheduleError("INVALID_DATE", `Year must be an integer ${MIN_CIVIL_YEAR}-${MAX_SCHEDULE_YEAR} (got ${year})`);
  }
}
