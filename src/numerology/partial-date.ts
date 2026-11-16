/**
 * Partial birth dates.
 *
 * `describePartialBirthDate` reports what is computable for each kind of
 * knowledge and why the rest is unavailable. `summarizeBirthDateCandidates`
 * enumerates the valid days of a known year/month (or year) INTERNALLY and
 * reports only aggregates (invariants, possible value sets, interval boundary
 * ranges). It never returns, selects or guesses a birth date.
 */

import { daysInMonth, isLeapYear } from "../civil-date";
import {
  getNumerologySnapshot,
  type NumerologySnapshot,
  type PersonalPeriodInterval,
} from "./schedule";
import {
  MAX_CANDIDATE_DATES,
  NumerologyScheduleError,
  fmt,
  normalizeBirth,
  resolveCivilDate,
  type CivilDateInput,
  type NormalizedBirth,
  type PartialBirthDate,
  type ScheduleOptions,
  type Unavailable,
} from "./schedule-types";

export interface PartialDateCapability {
  kind: NormalizedBirth["kind"];
  /** Fields that can be computed from this much knowledge. */
  computable: string[];
  /** Fields that cannot, each with a structured reason. */
  unavailable: { field: string; reason: Unavailable["reason"]; detail: string }[];
}

export function describePartialBirthDate(birth: PartialBirthDate | CivilDateInput): PartialDateCapability {
  const n = normalizeBirth(birth);
  switch (n.kind) {
    case "full":
      return {
        kind: "full",
        computable: [
          "personalYear", "personalMonths", "personalPeriods(1,2)", "personalPeriods(3: needs first name)", "heptads", "ageCycles",
          "fibonacci", "lifePath", "calendarFrame", "pinnacles", "challenges", "lifePeriods",
        ],
        unavailable: [],
      };
    case "month-day":
      return {
        kind: "month-day",
        computable: ["personalYear", "personalMonths", "personalPeriods(3: needs first name)", "heptads", "calendarFrame"],
        unavailable: [
          "completedAge", "personalPeriods(1)", "personalPeriods(2)", "ageCycles", "fibonacci", "lifePath", "pinnacles", "challenges", "lifePeriods",
        ].map((field) => ({
          field,
          reason: "birth-year-unknown" as const,
          detail: "The birth year is not known; nothing is guessed.",
        })),
      };
    case "year-month":
    case "year": {
      const reason: Unavailable["reason"] = n.kind === "year" && n.approximate ? "birth-year-approximate" : "birth-day-or-month-unknown";
      const detail =
        n.kind === "year-month"
          ? "Birth day unknown: use summarizeBirthDateCandidates for invariants and possible values."
          : n.approximate
            ? "Approximate year only: no day/month and no exact age."
            : "Only the birth year is known: use summarizeBirthDateCandidates for invariants and possible values.";
      return {
        kind: n.kind,
        computable: n.kind === "year" && n.approximate ? ["firstNameSoulNumber"] : ["firstNameSoulNumber", "completedAgeRange", "candidateSummary"],
        unavailable: [
          "personalYear", "personalMonths", "personalPeriods", "heptads", "ageCycles", "fibonacci", "lifePath", "calendarFrame", "pinnacles", "challenges", "lifePeriods",
        ].map((field) => ({ field, reason, detail })),
      };
    }
    default:
      return {
        kind: "unknown",
        computable: ["firstNameSoulNumber"],
        unavailable: [
          "personalYear", "personalMonths", "personalPeriods", "heptads", "ageCycles", "fibonacci", "lifePath", "calendarFrame", "pinnacles", "challenges", "lifePeriods",
        ].map((field) => ({ field, reason: "birth-date-unknown" as const, detail: "No birth date information." })),
      };
  }
}

export interface FieldSummary {
  /** True when every candidate gives the same value (including all `null`). */
  invariant: boolean;
  /** The shared value when invariant, else `null`. */
  value: number | null;
  /** Sorted distinct values across candidates; `null` means "unavailable for some candidate". */
  possibleValues: (number | null)[];
}

export interface BoundaryRange {
  start: { min: string; max: string; invariant: boolean };
  endExclusive: { min: string; max: string; invariant: boolean };
}

export interface BirthDateCandidateSummary {
  asOf: string;
  birth: { kind: "year-month" | "year"; year: number; month?: number };
  /** Number of valid calendar days enumerated internally (they are never returned). */
  candidateCount: number;
  /** Candidates born after `asOf`, excluded from the aggregates. */
  candidatesBornAfterAsOf: number;
  /** Always false: no birth date is selected or emitted. */
  selectedDate: null;
  fields: Record<string, FieldSummary>;
  intervalBoundaryRanges: Record<string, BoundaryRange>;
  note: string;
}

export interface CandidateSummaryInput extends ScheduleOptions {
  birth: { kind: "year-month"; year: number; month: number } | { kind: "year"; year: number; approximate?: boolean };
  asOf: CivilDateInput;
}

function periodValue(p: PersonalPeriodInterval | null): number | null {
  return p && p.value.available ? p.value.value : null;
}

function fieldsOf(s: NumerologySnapshot): Record<string, number | null> {
  const f: Record<string, number | null> = {
    completedAge: s.completedAge,
    lastBirthdayYear: s.lastBirthdayYear,
    personalYear: s.birthdayYear?.personalYear.value ?? null,
    kaabalisticLifePath: s.fixedNumbers.lifePath.available ? s.fixedNumbers.lifePath.value : null,
    firstNameSoulNumber: s.fixedNumbers.firstNameSoulNumber.available ? s.fixedNumbers.firstNameSoulNumber.value : null,
    personalMonthPhase: s.personalMonth?.phase ?? null,
    personalMonthValue: s.personalMonth?.value.value ?? null,
    personalPeriodPhase: s.personalPeriod?.phase ?? null,
    personalPeriodValue: periodValue(s.personalPeriod),
    heptadPhase: s.heptad?.phase ?? null,
    dayInHeptad: s.heptad?.dayInHeptad ?? null,
    ageCycleLabel: s.ageCycle?.label ?? null,
    ageCycleBlockIndex: s.ageCycle?.absoluteIndex ?? null,
    yearInSevenYearBlock: s.ageCycle?.yearPosition ?? null,
    calendarPersonalYear: s.calendar?.personalYear.value ?? null,
    calendarPersonalMonth: s.calendar?.personalMonth.value ?? null,
    calendarPersonalDay: s.calendar?.personalDay.value ?? null,
    mainChallenge: s.lifeStages?.mainChallenge ?? null,
    pinnacle: s.lifeStages?.pinnacle?.value.value ?? null,
  };
  for (const c of s.fibonacci?.cycles ?? []) f[`fibonacciCycle${c.phase}`] = c.value;
  return f;
}

/**
 * Aggregates over every valid day of the known year/month (or year).
 * The person's actual birth day stays unknown; only invariants, possible value
 * sets and boundary ranges are reported.
 */
export function summarizeBirthDateCandidates(input: CandidateSummaryInput): BirthDateCandidateSummary {
  const birth = normalizeBirth(input.birth);
  if (birth.kind !== "year-month" && !(birth.kind === "year" && !birth.approximate)) {
    throw new NumerologyScheduleError(
      "INVALID_ARGUMENT",
      "Candidate summaries need a year-month or an exact (non-approximate) year"
    );
  }
  const asOf = resolveCivilDate(input.asOf, "asOf");
  const dates: { year: number; month: number; day: number }[] = [];
  const months = birth.kind === "year-month" ? [birth.month] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  for (const month of months) {
    for (let day = 1; day <= daysInMonth(birth.year, month); day++) dates.push({ year: birth.year, month, day });
  }
  if (dates.length > MAX_CANDIDATE_DATES || (birth.kind === "year" && dates.length !== (isLeapYear(birth.year) ? 366 : 365))) {
    throw new NumerologyScheduleError("RANGE_TOO_LARGE", "Too many candidate dates");
  }

  const { birth: _ignored, asOf: _asOf, ...options } = input;
  void _ignored;
  void _asOf;
  const collected: Record<string, (number | null)[]> = {};
  const boundaries: Record<string, { starts: string[]; ends: string[] }> = {};
  let after = 0;
  const add = (name: string, value: number | null) => (collected[name] ??= []).push(value);
  const addBoundary = (name: string, iv: { start: string; endExclusive: string | null } | null) => {
    if (!iv || iv.endExclusive === null) return;
    const b = (boundaries[name] ??= { starts: [], ends: [] });
    b.starts.push(iv.start);
    b.ends.push(iv.endExclusive);
  };

  for (const date of dates) {
    const snap = getNumerologySnapshot({ ...options, birth: { kind: "full", date }, asOf });
    if (snap.status === "before-birth") {
      after++;
      continue;
    }
    if (snap.status !== "ok") continue;
    for (const [k, v] of Object.entries(fieldsOf(snap))) add(k, v);
    addBoundary("birthdayYear", snap.birthdayYear);
    addBoundary("personalMonth", snap.personalMonth);
    addBoundary("personalPeriod", snap.personalPeriod);
    addBoundary("heptad", snap.heptad);
    addBoundary("ageCycle", snap.ageCycle);
  }

  const fields: Record<string, FieldSummary> = {};
  for (const [name, values] of Object.entries(collected)) {
    const distinct = [...new Set(values)].sort((a, b) => (a === null ? 1 : b === null ? -1 : a - b));
    fields[name] = { invariant: distinct.length === 1, value: distinct.length === 1 ? distinct[0] : null, possibleValues: distinct };
  }
  const ranges: Record<string, BoundaryRange> = {};
  for (const [name, b] of Object.entries(boundaries)) {
    const s = [...b.starts].sort();
    const e = [...b.ends].sort();
    ranges[name] = {
      start: { min: s[0], max: s[s.length - 1], invariant: s[0] === s[s.length - 1] },
      endExclusive: { min: e[0], max: e[e.length - 1], invariant: e[0] === e[e.length - 1] },
    };
  }
  return {
    asOf: fmt(asOf),
    birth: birth.kind === "year-month" ? { kind: "year-month", year: birth.year, month: birth.month } : { kind: "year", year: birth.year },
    candidateCount: dates.length,
    candidatesBornAfterAsOf: after,
    selectedDate: null,
    fields,
    intervalBoundaryRanges: ranges,
    note: "Aggregates over every valid day of the known period. No birth date is selected or implied; the actual day is unknown.",
  };
}
