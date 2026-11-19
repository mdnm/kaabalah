/**
 * Dated numerology schedule facade.
 *
 * Pure, civil-date based (no timezone, no `Date`, no local-noon trick for
 * callers). Provides:
 * - `getNumerologySnapshot`: everything active on one civil day;
 * - `generateNumerologyTimeline`: bounded, half-open intervals for chosen layers;
 * - `getNumerologyMethodMetadata`: the explicit method identity.
 *
 * Layers: birthday frame (`personal-year`, `personal-month`, `personal-period`,
 * `heptad`, `age-cycle`, `fibonacci`), life stages (`pinnacle`, `challenge`,
 * `life-period`) and the distinct calendar frame (`calendar-year`,
 * `calendar-month`, `calendar-day`).
 *
 * Every interval is `[start, endExclusive)` in "YYYY-MM-DD". When limits
 * (birth, death, horizon) cut an interval, `nominalStart/nominalEndExclusive`
 * keep the unclipped bounds and `clipped` is true. A missing death date means
 * nothing about survival: no end is inferred.
 */

import {
  type CivilDate,
  MAX_CIVIL_YEAR,
  addCivilDays,
  anniversaryInYear,
  civilDateToLocalNoon,
  compareCivilDates,
  completedYears,
  daysInMonth,
  diffCivilDays,
} from "../civil-date";
import { calculateGematria } from "../gematria";
import {
  calculateKaabalisticLifePath,
  calculateStraightAcrossReductionLifePath,
  MASTER_NUMBERS,
  doubleDigitValue,
  reduceToSingleWithSteps,
} from "./core";
import { computeLifeStages, LIFE_STAGE_METHOD_ID, type LifeStageSpan, type LifeStages } from "./life-stages";
import {
  DEFAULT_MAX_TIMELINE_INTERVALS,
  MAX_TIMELINE_INTERVALS_HARD_CAP,
  MAX_TIMELINE_RANGE_DAYS,
  SCHEDULE_METHOD_VERSION,
  NumerologyScheduleError,
  fmt,
  normalizeBirth,
  resolveCivilDate,
  unavailable,
  type CivilDateInput,
  type LifePathMethod,
  type MasterPolicy,
  type MethodDescriptor,
  type NameInputKind,
  type NormalizedBirth,
  type NumerologyMethodMetadata,
  type ReducedNumber,
  type ScheduleInput,
  type ShortMonthPolicy,
  type Unavailable,
} from "./schedule-types";

export * from "./schedule-types";

// ---------------------------------------------------------------------------
// Public result types
// ---------------------------------------------------------------------------

export interface ScheduleIntervalBase {
  /** Inclusive start, "YYYY-MM-DD" (possibly clipped to the birth date). */
  start: string;
  /** Exclusive end, "YYYY-MM-DD" (possibly clipped by death/horizon). `null` only for open-ended life stages with no horizon. */
  endExclusive: string | null;
  nominalStart: string;
  /** `null` for open-ended spans and when the real end is past year 9999 (then `nominalEndBeyondCalendar` is true). */
  nominalEndExclusive: string | null;
  /** True only when the nominal end falls after the last supported calendar year (9999) and so cannot be dated. */
  nominalEndBeyondCalendar?: true;
  startClipped: boolean;
  endClipped: boolean;
  /** True when the start or the end was clipped by birth/death/horizon limits. */
  clipped: boolean;
  lengthDays: number | null;
  nominalLengthDays: number | null;
}

export interface AgeCycleRef {
  /** Repeating 1-7 label of the seven-year block. */
  label: number;
  /** Absolute 0-based seven-year block index from birth (`floor(completedAge / 7)`). */
  absoluteIndex: number;
  /** Year within the block, 1-7 (`completedAge % 7 + 1`). */
  yearPosition: number;
}

export interface PersonalYearInterval extends ScheduleIntervalBase {
  layer: "personal-year";
  birthdayYear: number;
  completedAge: number | null;
  personalYear: ReducedNumber;
  ageCycle: AgeCycleRef | null;
}

export interface PersonalMonthInterval extends ScheduleIntervalBase {
  layer: "personal-month";
  birthdayYear: number;
  /** Phase number 1-12 (position in the birthday year). */
  phase: number;
  /** Nominal calendar-month label 1-12 used in the value (kept even when the phase starts in another month). */
  calendarMonth: number;
  intendedBirthDay: number;
  /** Reduced value, kept separate from `phase`. */
  value: ReducedNumber;
  /** True when the phase start differs from the nominal `YYYY-MM-<birthDay>` date. */
  startAdjusted: boolean;
  /** Nominal start as text; may be an impossible date such as "2025-02-31". */
  nominalStartText: string;
  shortMonthPolicy: ShortMonthPolicy;
}

export type PersonalPeriodValue =
  | (ReducedNumber & {
      available: true;
      addend: number;
      addendSource: "completed-age" | "life-path" | "first-name-soul-number";
    })
  | Unavailable;

export interface PersonalPeriodInterval extends ScheduleIntervalBase {
  layer: "personal-period";
  birthdayYear: number;
  /** Phase number 1-3 (four months each). */
  phase: number;
  /** First/last personal-month phase covered, 1-12. */
  monthPhases: [number, number];
  startCalendarMonth: number;
  endCalendarMonth: number;
  value: PersonalPeriodValue;
}

export interface HeptadInterval extends ScheduleIntervalBase {
  layer: "heptad";
  birthdayYear: number;
  /** Phase number 1-7. */
  phase: number;
  /** True for the seventh segment, which spans the actual remainder to the next birthday (53/54 days). */
  isRemainder: boolean;
}

export interface AgeCycleInterval extends ScheduleIntervalBase {
  layer: "age-cycle";
  label: number;
  absoluteIndex: number;
  startAge: number;
  endAgeExclusive: number;
}

export interface FibonacciInterval extends ScheduleIntervalBase {
  layer: "fibonacci";
  birthdayYear: number;
  completedAge: number;
  /** Seven cycles; single-digit reductions (masters NOT preserved). */
  cycles: { phase: number; value: number; reductionSteps: number[] }[];
}

export interface CalendarYearInterval extends ScheduleIntervalBase {
  layer: "calendar-year";
  year: number;
  personalYear: ReducedNumber;
}
export interface CalendarMonthInterval extends ScheduleIntervalBase {
  layer: "calendar-month";
  year: number;
  month: number;
  personalYear: ReducedNumber;
  personalMonth: ReducedNumber;
}
export interface CalendarDayInterval extends ScheduleIntervalBase {
  layer: "calendar-day";
  date: string;
  personalYear: ReducedNumber;
  personalMonth: ReducedNumber;
  personalDay: ReducedNumber;
}

export interface PinnacleInterval extends ScheduleIntervalBase {
  layer: "pinnacle";
  index: number;
  startAge: number;
  endAgeExclusive: number | null;
  value: ReducedNumber;
}
export interface ChallengeInterval extends ScheduleIntervalBase {
  layer: "challenge";
  index: number;
  isMain: boolean;
  startAge: number;
  endAgeExclusive: number | null;
  value: number;
}
export interface LifePeriodInterval extends ScheduleIntervalBase {
  layer: "life-period";
  index: number;
  basis: "month" | "day" | "year";
  startAge: number;
  endAgeExclusive: number | null;
  value: ReducedNumber;
}

export type ScheduleInterval =
  | PersonalYearInterval
  | PersonalMonthInterval
  | PersonalPeriodInterval
  | HeptadInterval
  | AgeCycleInterval
  | FibonacciInterval
  | CalendarYearInterval
  | CalendarMonthInterval
  | CalendarDayInterval
  | PinnacleInterval
  | ChallengeInterval
  | LifePeriodInterval;

export type TimelineLayer = ScheduleInterval["layer"];

export const TIMELINE_LAYERS: readonly TimelineLayer[] = [
  "personal-year",
  "personal-month",
  "personal-period",
  "heptad",
  "age-cycle",
  "fibonacci",
  "calendar-year",
  "calendar-month",
  "calendar-day",
  "pinnacle",
  "challenge",
  "life-period",
];

export type SnapshotStatus = "ok" | "partial" | "before-birth" | "after-death" | "after-horizon";

export interface NumerologySnapshot {
  asOf: string;
  status: SnapshotStatus;
  birth: { kind: NormalizedBirth["kind"]; date?: string; month?: number; day?: number; year?: number; approximate?: boolean };
  meta: NumerologyMethodMetadata;
  /** Completed (birthday) age; `null` unless the full birth date is known. */
  completedAge: number | null;
  /** Possible completed ages when only a year (or year and month) is known. */
  completedAgeRange: { min: number; max: number } | null;
  lastBirthdayYear: number | null;
  /** 1-based day within the birthday year. */
  dayInBirthdayYear: number | null;
  fixedNumbers: {
    lifePath: (ReducedNumber & { available: true; method: LifePathMethod }) | Unavailable;
    firstNameSoulNumber: (ReducedNumber & { available: true }) | Unavailable;
  };
  birthdayYear: PersonalYearInterval | null;
  personalMonth: PersonalMonthInterval | null;
  personalPeriod: PersonalPeriodInterval | null;
  heptad: (HeptadInterval & { dayInHeptad: number }) | null;
  ageCycle: (AgeCycleInterval & { yearPosition: number }) | null;
  fibonacci: FibonacciInterval | null;
  calendar: {
    personalYear: ReducedNumber;
    personalMonth: ReducedNumber;
    personalDay: ReducedNumber;
  } | null;
  lifeStages: {
    pinnacle: PinnacleInterval | null;
    challenge: ChallengeInterval | null;
    lifePeriod: LifePeriodInterval | null;
    mainChallenge: number;
    transition: { rule: string; lifePathForTransition: number; firstPinnacleEndAge: number };
  } | null;
  unavailable: { field: string; reason: Unavailable["reason"]; detail: string }[];
}

export interface NumerologyTimeline {
  from: string;
  toExclusive: string;
  layers: TimelineLayer[];
  meta: NumerologyMethodMetadata;
  /** Intervals overlapping `[from, toExclusive)`, with their real (not window-clipped) bounds, sorted by start then layer. */
  intervals: ScheduleInterval[];
  caps: { maxIntervals: number; maxRangeDays: number };
  unavailable: { field: string; reason: Unavailable["reason"]; detail: string }[];
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface Anchor {
  month: number;
  day: number;
  year: number | null;
}

interface Ctx {
  input: ScheduleInput;
  birth: NormalizedBirth;
  full: CivilDate | null;
  anchor: Anchor | null;
  masters: MasterPolicy;
  lifePathMethod: LifePathMethod;
  nameKind: NameInputKind;
  policy: ShortMonthPolicy;
  soul: (ReducedNumber & { available: true }) | Unavailable;
  lifePath: (ReducedNumber & { available: true; method: LifePathMethod }) | Unavailable;
  death: CivilDate | null;
  horizon: CivilDate | null;
  coverageStart: CivilDate | null;
  coverageEnd: CivilDate | null;
  meta: NumerologyMethodMetadata;
  stages: LifeStages | null;
}

const MASTER_SET = new Set(MASTER_NUMBERS);

function red(ctx: { masters: MasterPolicy }, n: number): ReducedNumber {
  const r = reduceToSingleWithSteps(n, { preserveMasters: ctx.masters === "preserve" });
  return { value: r.reducedValue, reductionSteps: r.reductionSteps, isMaster: MASTER_SET.has(r.reducedValue) };
}

function wrapMonth(month: number): number {
  return ((((month - 1) % 12) + 12) % 12) + 1;
}

function nameToken(raw: string, kind: NameInputKind): string {
  const trimmed = raw.trim().replace(/\s+/g, " ");
  return kind === "first-token" ? trimmed.split(" ")[0] ?? "" : trimmed;
}

function resolveSoul(
  firstName: string | null | undefined,
  kind: NameInputKind
): (ReducedNumber & { available: true }) | Unavailable {
  if (firstName === undefined || firstName === null || typeof firstName !== "string" || firstName.trim() === "") {
    return unavailable("first-name-missing", "No first name supplied; the soul number (personal period 3) is not computed.");
  }
  const used = nameToken(firstName, kind);
  const vowels = calculateGematria(used).vowels;
  if (vowels.originalSum === 0 || vowels.finalValue === 0) {
    return unavailable("first-name-has-no-vowels", "The supplied name has no vowels recognised by the gematria mapping; soul number not computed.");
  }
  return {
    available: true,
    value: vowels.finalValue,
    reductionSteps: vowels.reductionSteps,
    isMaster: false,
  };
}

function resolveLifePath(
  full: CivilDate | null,
  method: LifePathMethod,
  masters: MasterPolicy,
  birthKind: NormalizedBirth["kind"]
): (ReducedNumber & { available: true; method: LifePathMethod }) | Unavailable {
  if (!full) {
    return unavailable(
      birthKind === "unknown"
        ? "birth-date-unknown"
        : birthKind === "month-day"
          ? "birth-year-unknown"
          : "birth-day-or-month-unknown",
      "The life path needs the full birth date (day, month and year)."
    );
  }
  const noon = civilDateToLocalNoon(full);
  const base =
    method === "kaabalistic"
      ? calculateKaabalisticLifePath(noon).lifePath
      : calculateStraightAcrossReductionLifePath(noon).lifePath;
  const r = masters === "preserve" ? base : reduceToSingleWithSteps(base.reducedValue);
  return {
    available: true,
    method,
    value: r.reducedValue,
    reductionSteps: [...r.reductionSteps],
    isMaster: MASTER_SET.has(r.reducedValue),
  };
}

function buildMetadata(
  input: ScheduleInput,
  masters: MasterPolicy,
  lifePathMethod: LifePathMethod,
  nameKind: NameInputKind,
  policy: ShortMonthPolicy,
  death: CivilDate | null,
  horizon: CivilDate | null,
  stages: LifeStages | null
): NumerologyMethodMetadata {
  const methods: Record<string, MethodDescriptor> = {
    "personal-year": {
      id: "birthday-personal-year/v1",
      formula: "reduce(birthDay + birthMonth + birthdayYear); birthdayYear = year of the most recent birthday; masters per policy",
    },
    "personal-month": {
      id: "birthday-personal-month/v2",
      formula: "reduce(doubleDigitPersonalYear + calendarMonthLabel), where doubleDigitPersonalYear is the personal year before its final reduction (14 for 14/5; a master year is used as is); label = wrap(birthMonth + phase - 1); phase k starts on the birth day of month label k (see shortMonthPolicy)",
    },
    "personal-period": {
      id: "birthday-personal-period/v1",
      formula:
        "four months each; 1: reduce(birthdayYear + completedAge); 2: reduce(birthdayYear + lifePath); 3: reduce(birthdayYear + firstNameVowelSoulNumber); masters per policy",
    },
    heptad: {
      id: "fixed-52-day-heptad/v1",
      formula: "six 52-day segments from the birthday; segment 7 runs to the next birthday (53/54 days); civil day counts",
    },
    "age-cycle": {
      id: "seven-year-age-cycle/v1",
      formula: "block = floor(completedAge / 7); label = block % 7 + 1; yearPosition = completedAge % 7 + 1; blocks start on the birthday",
    },
    fibonacci: {
      id: "fibonacci-completed-age/v1",
      formula:
        "c1 = reduce(age); c2 = reduce(c1 + 2); c3 = reduce(c1 + c2.rawSum); c(n) = reduce(c(n-2).rawSum + c(n-1).rawSum); single-digit, masters not preserved; age = completed age",
    },
    "calendar-year": {
      id: "calendar-personal-year-month-day/v2",
      formula: "calendarPY = reduce(birthDay + birthMonth + calendarYear)",
    },
    "calendar-month": {
      id: "calendar-personal-year-month-day/v2",
      formula: "calendarPM = reduce(doubleDigit(calendarPY) + calendarMonth), where doubleDigit(calendarPY) is the calendar personal year before its final reduction (14 for 14/5; a master year is used as is)",
    },
    "calendar-day": {
      id: "calendar-personal-year-month-day/v2",
      formula:
        "calendarPD = reduce(calendarPM.value + calendarDay). Chosen convention (the library has no personal-day calculator); distinct from the birthday frame",
    },
  };
  for (const layer of ["pinnacle", "challenge", "life-period"]) {
    methods[layer] = {
      id: LIFE_STAGE_METHOD_ID,
      formula: stages
        ? `first span ends at age ${stages.firstPinnacleEndAge} (${stages.transitionRule}); see life-stages.ts for the full convention`
        : "36 - single-digit life path for the first pinnacle end; requires the full birth date",
    };
  }
  const deathText = death ? fmt(death) : null;
  return {
    methodVersion: SCHEDULE_METHOD_VERSION,
    dateModel: "civil proleptic-Gregorian dates, no timezone; intervals are half-open [start, endExclusive); 29 February birthdays fall on 1 March in common years",
    lifePathMethod,
    lifePathMethodDescription:
      lifePathMethod === "kaabalistic"
        ? "kaabalistic concatenation of reduced two-digit blocks (calculateKaabalisticLifePath)"
        : "straight digit-sum of DDMMYYYY (calculateStraightAcrossReductionLifePath)",
    masterPolicy: masters,
    masterNumbers: [...MASTER_NUMBERS],
    fibonacciReduction: "single digit, master numbers never preserved (unchanged legacy behaviour)",
    nameInput: {
      kind: nameKind,
      provided: typeof input.firstName === "string" && input.firstName.trim() !== "",
      rule:
        nameKind === "first-token"
          ? "first whitespace-delimited token of the supplied name"
          : nameKind === "given-name"
            ? "the supplied string is the given name (all words used)"
            : "the supplied string is the full name (all words used)",
    },
    gematria: "kaabalah gematria vowel sum (calculateGematria(...).vowels); diacritic mappings (e.g. Ã, Ç) unchanged",
    shortMonthPolicy: policy,
    limits: {
      death: deathText,
      horizonEndExclusive: horizon ? fmt(horizon) : null,
      deathNote: death
        ? "Coverage ends after the supplied death date (inclusive)."
        : "No death date supplied. This is NOT evidence of survival; nothing is inferred and no end is imposed.",
    },
    methods,
    notes: [
      "Phase numbers (month/period/heptad positions) are separate from reduced values.",
      "Pinnacle, challenge and life-period conventions are named choices, not universal rules.",
    ],
  };
}

function buildCtx(input: ScheduleInput): Ctx {
  if (typeof input !== "object" || input === null) {
    throw new NumerologyScheduleError("INVALID_ARGUMENT", "A schedule input object is required");
  }
  const birth = normalizeBirth(input.birth);
  const masters = input.masters ?? "preserve";
  const lifePathMethod = input.lifePathMethod ?? "kaabalistic";
  const nameKind = input.nameKind ?? "first-token";
  const policy = input.shortMonthPolicy ?? "next-month-first";
  if (masters !== "preserve" && masters !== "reduce") {
    throw new NumerologyScheduleError("INVALID_ARGUMENT", `Unknown masters policy: ${String(masters)}`);
  }
  if (lifePathMethod !== "kaabalistic" && lifePathMethod !== "straight-across") {
    throw new NumerologyScheduleError("INVALID_ARGUMENT", `Unknown lifePathMethod: ${String(lifePathMethod)}`);
  }
  if (nameKind !== "first-token" && nameKind !== "given-name" && nameKind !== "full-name") {
    throw new NumerologyScheduleError("INVALID_ARGUMENT", `Unknown nameKind: ${String(nameKind)}`);
  }
  if (policy !== "next-month-first" && policy !== "clamp" && policy !== "overflow") {
    throw new NumerologyScheduleError("INVALID_ARGUMENT", `Unknown shortMonthPolicy: ${String(policy)}`);
  }

  const full = birth.kind === "full" ? birth.date : null;
  const anchor: Anchor | null =
    birth.kind === "full"
      ? { month: birth.date.month, day: birth.date.day, year: birth.date.year }
      : birth.kind === "month-day"
        ? { month: birth.month, day: birth.day, year: null }
        : null;

  const death = input.limits?.death ? resolveCivilDate(input.limits.death, "death date") : null;
  const horizon = input.limits?.horizonEndExclusive ? resolveCivilDate(input.limits.horizonEndExclusive, "horizonEndExclusive") : null;
  if (full && death && compareCivilDates(death, full) < 0) {
    throw new NumerologyScheduleError("INVALID_RANGE", "Death date is before the birth date");
  }
  let coverageEnd: CivilDate | null = null;
  if (death) coverageEnd = addCivilDays(death, 1);
  if (horizon && (!coverageEnd || compareCivilDates(horizon, coverageEnd) < 0)) coverageEnd = horizon;

  const stages = full ? computeLifeStages(full, masters, input.lifeStages) : null;
  return {
    input,
    birth,
    full,
    anchor,
    masters,
    lifePathMethod,
    nameKind,
    policy,
    soul: resolveSoul(input.firstName, nameKind),
    lifePath: resolveLifePath(full, lifePathMethod, masters, birth.kind),
    death,
    horizon,
    coverageStart: full,
    coverageEnd,
    meta: buildMetadata(input, masters, lifePathMethod, nameKind, policy, death, horizon, stages),
    stages,
  };
}

/** Method identity for a set of options, without computing anything dated. */
export function getNumerologyMethodMetadata(options: Omit<ScheduleInput, "birth"> & { birth?: ScheduleInput["birth"] } = {}): NumerologyMethodMetadata {
  return buildCtx({ ...options, birth: options.birth ?? { kind: "unknown" } }).meta;
}

// ---------------------------------------------------------------------------
// Interval helpers
// ---------------------------------------------------------------------------

function mkInterval(ctx: Ctx, nominalStart: CivilDate, nominalEndInput: CivilDate | null, endBeyondCalendar = false): ScheduleIntervalBase | null {
  // Dates past year 9999 cannot be formatted: a start there means no interval,
  // an end there becomes an explicit null flagged `nominalEndBeyondCalendar`.
  if (nominalStart.year > MAX_CIVIL_YEAR) return null;
  let nominalEnd = nominalEndInput;
  let beyond = endBeyondCalendar;
  if (nominalEnd && nominalEnd.year > MAX_CIVIL_YEAR) {
    nominalEnd = null;
    beyond = true;
  }
  let start = nominalStart;
  let startClipped = false;
  if (ctx.coverageStart && compareCivilDates(start, ctx.coverageStart) < 0) {
    start = ctx.coverageStart;
    startClipped = true;
  }
  let end = nominalEnd;
  let endClipped = false;
  if (ctx.coverageEnd && (end === null || compareCivilDates(end, ctx.coverageEnd) > 0)) {
    end = ctx.coverageEnd;
    endClipped = true;
  }
  if (end !== null && compareCivilDates(start, end) >= 0) return null;
  return {
    start: fmt(start),
    endExclusive: end ? fmt(end) : null,
    nominalStart: fmt(nominalStart),
    nominalEndExclusive: nominalEnd ? fmt(nominalEnd) : null,
    ...(beyond ? { nominalEndBeyondCalendar: true as const } : {}),
    startClipped,
    endClipped,
    clipped: startClipped || endClipped,
    lengthDays: end ? diffCivilDays(start, end) : null,
    nominalLengthDays: nominalEnd ? diffCivilDays(nominalStart, nominalEnd) : null,
  };
}

function contains(iv: ScheduleIntervalBase, iso: string): boolean {
  return iv.start <= iso && (iv.endExclusive === null || iso < iv.endExclusive);
}

function overlaps(iv: ScheduleIntervalBase, from: string, toExclusive: string): boolean {
  return iv.start < toExclusive && (iv.endExclusive === null || iv.endExclusive > from);
}

/** Start of personal-month phase `j` (0-12) of the birthday year `y`. */
function monthBoundary(
  anchor: Anchor,
  y: number,
  j: number,
  policy: ShortMonthPolicy
): { date: CivilDate; adjusted: boolean; nominalText: string } {
  const absolute = y * 12 + (anchor.month - 1) + j;
  const yy = Math.floor(absolute / 12);
  const mm = (absolute % 12) + 1;
  const dim = daysInMonth(yy, mm);
  const nominalText = `${String(yy).padStart(4, "0")}-${String(mm).padStart(2, "0")}-${String(anchor.day).padStart(2, "0")}`;
  if (anchor.day <= dim) return { date: { year: yy, month: mm, day: anchor.day }, adjusted: false, nominalText };
  switch (policy) {
    case "clamp":
      return { date: { year: yy, month: mm, day: dim }, adjusted: true, nominalText };
    case "overflow":
      return { date: addCivilDays({ year: yy, month: mm, day: 1 }, anchor.day - 1), adjusted: true, nominalText };
    default:
      return { date: addCivilDays({ year: yy, month: mm, day: dim }, 1), adjusted: true, nominalText };
  }
}

// ---------------------------------------------------------------------------
// Birthday-year row
// ---------------------------------------------------------------------------

interface YearRow {
  year: number;
  personalYear: PersonalYearInterval;
  months: PersonalMonthInterval[];
  periods: PersonalPeriodInterval[];
  heptads: HeptadInterval[];
  fibonacci: FibonacciInterval | null;
}

function ageCycleRef(completedAge: number | null): AgeCycleRef | null {
  if (completedAge === null || completedAge < 0) return null;
  const block = Math.floor(completedAge / 7);
  return { label: (block % 7) + 1, absoluteIndex: block, yearPosition: (completedAge % 7) + 1 };
}

function fibonacciValues(age: number): FibonacciInterval["cycles"] {
  const s1 = reduceToSingleWithSteps(age);
  const s2 = reduceToSingleWithSteps(s1.reducedValue + 2);
  const s3 = reduceToSingleWithSteps(s1.reducedValue + s2.reductionSteps[0]);
  const s4 = reduceToSingleWithSteps(s2.reductionSteps[0] + s3.reductionSteps[0]);
  const s5 = reduceToSingleWithSteps(s3.reductionSteps[0] + s4.reductionSteps[0]);
  const s6 = reduceToSingleWithSteps(s4.reductionSteps[0] + s5.reductionSteps[0]);
  const s7 = reduceToSingleWithSteps(s5.reductionSteps[0] + s6.reductionSteps[0]);
  return [s1, s2, s3, s4, s5, s6, s7].map((s, i) => ({
    phase: i + 1,
    value: s.reducedValue,
    reductionSteps: s.reductionSteps,
  }));
}

function buildYearRow(ctx: Ctx, y: number): YearRow | null {
  const anchor = ctx.anchor;
  if (!anchor) return null;
  const start = anniversaryInYear({ year: 0, month: anchor.month, day: anchor.day }, y);
  const nominalEnd = anniversaryInYear({ year: 0, month: anchor.month, day: anchor.day }, y + 1);
  const yearBase = mkInterval(ctx, start, nominalEnd);
  if (!yearBase) return null;

  const completedAge = ctx.full ? y - ctx.full.year : null;
  const personalYearValue = red(ctx, anchor.day + anchor.month + y);
  const personalYear: PersonalYearInterval = {
    layer: "personal-year",
    ...yearBase,
    birthdayYear: y,
    completedAge,
    personalYear: personalYearValue,
    ageCycle: ageCycleRef(completedAge),
  };

  const bounds: CivilDate[] = [];
  const adjusted: boolean[] = [];
  const nominalTexts: string[] = [];
  for (let j = 0; j <= 12; j++) {
    if (j === 0) {
      bounds.push(start);
      adjusted.push(false);
      nominalTexts.push(fmt(start));
    } else if (j === 12) {
      bounds.push(nominalEnd);
      adjusted.push(false);
      nominalTexts.push(fmt(nominalEnd));
    } else {
      const b = monthBoundary(anchor, y, j, ctx.policy);
      bounds.push(b.date);
      adjusted.push(b.adjusted);
      nominalTexts.push(b.nominalText);
    }
  }

  const months: PersonalMonthInterval[] = [];
  for (let k = 0; k < 12; k++) {
    const iv = mkInterval(ctx, bounds[k], bounds[k + 1]);
    if (!iv) continue;
    const label = wrapMonth(anchor.month + k);
    months.push({
      layer: "personal-month",
      ...iv,
      birthdayYear: y,
      phase: k + 1,
      calendarMonth: label,
      intendedBirthDay: anchor.day,
      value: red(ctx, doubleDigitValue(personalYearValue.reductionSteps) + label),
      startAdjusted: adjusted[k],
      nominalStartText: nominalTexts[k],
      shortMonthPolicy: ctx.policy,
    });
  }

  const periods: PersonalPeriodInterval[] = [];
  for (let p = 0; p < 3; p++) {
    const iv = mkInterval(ctx, bounds[p * 4], bounds[p * 4 + 4]);
    if (!iv) continue;
    let value: PersonalPeriodValue;
    if (p === 0) {
      value =
        completedAge === null
          ? unavailable("birth-year-unknown", "Period 1 needs the completed age, which needs the full birth date.")
          : { available: true, ...red(ctx, y + completedAge), addend: completedAge, addendSource: "completed-age" };
    } else if (p === 1) {
      value = ctx.lifePath.available
        ? { available: true, ...red(ctx, y + ctx.lifePath.value), addend: ctx.lifePath.value, addendSource: "life-path" }
        : unavailable(ctx.lifePath.reason, "Period 2 needs the life path, which needs the full birth date.");
    } else {
      value = ctx.soul.available
        ? { available: true, ...red(ctx, y + ctx.soul.value), addend: ctx.soul.value, addendSource: "first-name-soul-number" }
        : ctx.soul;
    }
    periods.push({
      layer: "personal-period",
      ...iv,
      birthdayYear: y,
      phase: p + 1,
      monthPhases: [p * 4 + 1, p * 4 + 4],
      startCalendarMonth: wrapMonth(anchor.month + p * 4),
      endCalendarMonth: wrapMonth(anchor.month + p * 4 + 3),
      value,
    });
  }

  const heptads: HeptadInterval[] = [];
  for (let h = 0; h < 7; h++) {
    const hs = addCivilDays(start, h * 52);
    const he = h < 6 ? addCivilDays(start, (h + 1) * 52) : nominalEnd;
    const iv = mkInterval(ctx, hs, he);
    if (!iv) continue;
    heptads.push({ layer: "heptad", ...iv, birthdayYear: y, phase: h + 1, isRemainder: h === 6 });
  }

  const fibonacci: FibonacciInterval | null =
    completedAge !== null && completedAge >= 0
      ? { layer: "fibonacci", ...yearBase, birthdayYear: y, completedAge, cycles: fibonacciValues(completedAge) }
      : null;
  return { year: y, personalYear, months, periods, heptads, fibonacci };
}

/** Year of the most recent birthday on or before `date`, or null before the birth. */
function birthdayYearOf(ctx: Ctx, date: CivilDate): number | null {
  const a = ctx.anchor;
  if (!a) return null;
  const anniv = anniversaryInYear({ year: 0, month: a.month, day: a.day }, date.year);
  const y = compareCivilDates(anniv, date) <= 0 ? date.year : date.year - 1;
  if (ctx.full && y < ctx.full.year) return null;
  if (y < 1) return null;
  return y;
}

// ---------------------------------------------------------------------------
// Calendar frame
// ---------------------------------------------------------------------------

function calendarYearValue(ctx: Ctx, year: number): ReducedNumber {
  return red(ctx, ctx.anchor!.day + ctx.anchor!.month + year);
}

function calendarYearInterval(ctx: Ctx, year: number): CalendarYearInterval | null {
  const iv = mkInterval(ctx, { year, month: 1, day: 1 }, { year: year + 1, month: 1, day: 1 });
  return iv ? { layer: "calendar-year", ...iv, year, personalYear: calendarYearValue(ctx, year) } : null;
}

function calendarMonthInterval(ctx: Ctx, year: number, month: number): CalendarMonthInterval | null {
  const next = month === 12 ? { year: year + 1, month: 1, day: 1 } : { year, month: month + 1, day: 1 };
  const iv = mkInterval(ctx, { year, month, day: 1 }, next);
  if (!iv) return null;
  const py = calendarYearValue(ctx, year);
  return { layer: "calendar-month", ...iv, year, month, personalYear: py, personalMonth: red(ctx, doubleDigitValue(py.reductionSteps) + month) };
}

function calendarDayInterval(ctx: Ctx, date: CivilDate): CalendarDayInterval | null {
  const iv = mkInterval(ctx, date, addCivilDays(date, 1));
  if (!iv) return null;
  const py = calendarYearValue(ctx, date.year);
  const pm = red(ctx, doubleDigitValue(py.reductionSteps) + date.month);
  return { layer: "calendar-day", ...iv, date: fmt(date), personalYear: py, personalMonth: pm, personalDay: red(ctx, pm.value + date.day) };
}

// ---------------------------------------------------------------------------
// Age cycles and life stages
// ---------------------------------------------------------------------------

function ageCycleInterval(ctx: Ctx, block: number): AgeCycleInterval | null {
  const birth = ctx.full!;
  const iv = mkInterval(ctx, anniversaryInYear(birth, birth.year + block * 7), anniversaryInYear(birth, birth.year + block * 7 + 7));
  return iv
    ? { layer: "age-cycle", ...iv, label: (block % 7) + 1, absoluteIndex: block, startAge: block * 7, endAgeExclusive: block * 7 + 7 }
    : null;
}

function stageIntervals(ctx: Ctx): {
  pinnacles: PinnacleInterval[];
  challenges: ChallengeInterval[];
  lifePeriods: LifePeriodInterval[];
  /** Spans whose start is past year 9999 (not datable), as `layer.index` entries. */
  skipped: UnavailableEntry[];
} {
  const s = ctx.stages!;
  const pinnacles: PinnacleInterval[] = [];
  const challenges: ChallengeInterval[] = [];
  const lifePeriods: LifePeriodInterval[] = [];
  const skipped: UnavailableEntry[] = [];
  const make = (layer: string, p: LifeStageSpan): ScheduleIntervalBase | null => {
    if (p.start === null) {
      skipped.push({
        field: `${layer}.${p.index}`,
        reason: "beyond-supported-calendar",
        detail: `Starts at age ${p.startAge}, after the last supported calendar year (${MAX_CIVIL_YEAR}).`,
      });
      return null;
    }
    return mkInterval(ctx, p.start, p.nominalEndExclusive, p.nominalEndBeyondCalendar === true);
  };
  for (const p of s.pinnacles) {
    const iv = make("pinnacle", p);
    if (iv) pinnacles.push({ layer: "pinnacle", ...iv, index: p.index, startAge: p.startAge, endAgeExclusive: p.endAgeExclusive, value: p.value });
  }
  for (const c of s.challenges) {
    const iv = make("challenge", c);
    if (iv) challenges.push({ layer: "challenge", ...iv, index: c.index, isMain: c.isMain, startAge: c.startAge, endAgeExclusive: c.endAgeExclusive, value: c.value });
  }
  for (const l of s.lifePeriods) {
    const iv = make("life-period", l);
    if (iv) lifePeriods.push({ layer: "life-period", ...iv, index: l.index, basis: l.basis, startAge: l.startAge, endAgeExclusive: l.endAgeExclusive, value: l.value });
  }
  return { pinnacles, challenges, lifePeriods, skipped };
}

// ---------------------------------------------------------------------------
// Snapshot
// ---------------------------------------------------------------------------

type UnavailableEntry = NumerologySnapshot["unavailable"][number];

function birthSummary(birth: NormalizedBirth): NumerologySnapshot["birth"] {
  switch (birth.kind) {
    case "full":
      return { kind: "full", date: fmt(birth.date) };
    case "month-day":
      return { kind: "month-day", month: birth.month, day: birth.day };
    case "year-month":
      return { kind: "year-month", year: birth.year, month: birth.month };
    case "year":
      return { kind: "year", year: birth.year, approximate: birth.approximate };
    default:
      return { kind: "unknown" };
  }
}

function describeUnavailableBirth(ctx: Ctx): UnavailableEntry[] {
  const kind = ctx.birth.kind;
  const reason: Unavailable["reason"] =
    kind === "unknown" ? "birth-date-unknown" : kind === "year" && ctx.birth.approximate ? "birth-year-approximate" : "birth-day-or-month-unknown";
  const detail =
    kind === "year-month"
      ? "Birth day unknown: birthday-based personal cycles, heptads and the calendar frame need the birth day and month."
      : kind === "year"
        ? "Only the birth year is known: birthday-based cycles need the birth day and month."
        : "No birth date information: birthday-based cycles need at least the birth day and month.";
  return [
    "personalYear",
    "personalMonth",
    "personalPeriod",
    "heptad",
    "ageCycle",
    "fibonacci",
    "calendar",
    "lifeStages",
  ].map((field) => ({ field, reason, detail }));
}

function completedAgeRange(birth: NormalizedBirth, asOf: CivilDate): { min: number; max: number } | null {
  if (birth.kind === "year" && !birth.approximate) {
    const diff = asOf.year - birth.year;
    return { min: Math.max(diff - 1, 0), max: Math.max(diff, 0) };
  }
  if (birth.kind === "year-month") {
    const diff = asOf.year - birth.year;
    if (asOf.month > birth.month) return { min: diff, max: diff };
    if (asOf.month < birth.month) return { min: Math.max(diff - 1, 0), max: Math.max(diff - 1, 0) };
    return { min: Math.max(diff - 1, 0), max: diff };
  }
  return null;
}

function emptySnapshot(ctx: Ctx, asOf: CivilDate, status: SnapshotStatus, unavailableEntries: UnavailableEntry[]): NumerologySnapshot {
  return {
    asOf: fmt(asOf),
    status,
    birth: birthSummary(ctx.birth),
    meta: ctx.meta,
    completedAge: null,
    completedAgeRange: completedAgeRange(ctx.birth, asOf),
    lastBirthdayYear: null,
    dayInBirthdayYear: null,
    fixedNumbers: { lifePath: ctx.lifePath, firstNameSoulNumber: ctx.soul },
    birthdayYear: null,
    personalMonth: null,
    personalPeriod: null,
    heptad: null,
    ageCycle: null,
    fibonacci: null,
    calendar: null,
    lifeStages: null,
    unavailable: unavailableEntries,
  };
}

/**
 * Everything active on one civil day.
 *
 * `input.birth` may be a full date (`"YYYY-MM-DD"` / `CivilDate`) or a
 * `PartialBirthDate`. Partial dates return `status: "partial"`: month/day
 * knowledge still yields the birthday-year frame, personal months, heptads and
 * calendar frame (age-dependent values are marked unavailable); year-only or
 * year/month knowledge yields `completedAgeRange` and structured reasons, and
 * never a guessed date.
 */
export function getNumerologySnapshot(input: ScheduleInput & { asOf: CivilDateInput }): NumerologySnapshot {
  const ctx = buildCtx(input);
  const asOf = resolveCivilDate(input.asOf, "asOf");
  const asOfIso = fmt(asOf);

  if (!ctx.anchor) {
    return emptySnapshot(ctx, asOf, "partial", describeUnavailableBirth(ctx));
  }
  if (ctx.full && compareCivilDates(asOf, ctx.full) < 0) {
    return emptySnapshot(ctx, asOf, "before-birth", [
      { field: "all", reason: "before-birth", detail: "The as-of date is before the birth date." },
    ]);
  }
  if (ctx.death && compareCivilDates(asOf, ctx.death) > 0) {
    return emptySnapshot(ctx, asOf, "after-death", [
      { field: "all", reason: "after-death", detail: "The as-of date is after the supplied death date." },
    ]);
  }
  if (ctx.horizon && compareCivilDates(asOf, ctx.horizon) >= 0) {
    return emptySnapshot(ctx, asOf, "after-horizon", [
      { field: "all", reason: "after-horizon", detail: "The as-of date is at or after the horizon end." },
    ]);
  }

  const y = birthdayYearOf(ctx, asOf);
  const row = y === null ? null : buildYearRow(ctx, y);
  if (y === null || row === null) {
    return emptySnapshot(ctx, asOf, "partial", [
      { field: "all", reason: "birth-year-unknown", detail: "No birthday year exists on or before the as-of date within the supported range." },
    ]);
  }
  const by = row.personalYear;
  const heptad = row.heptads.find((h) => contains(h, asOfIso)) ?? null;
  const unavailableEntries: UnavailableEntry[] = [];

  const period = row.periods.find((p) => contains(p, asOfIso)) ?? null;
  if (period && !period.value.available) {
    unavailableEntries.push({ field: `personalPeriod.${period.phase}`, reason: period.value.reason, detail: period.value.detail });
  }
  if (!ctx.full) {
    for (const field of ["completedAge", "ageCycle", "fibonacci", "lifeStages", "fixedNumbers.lifePath"]) {
      unavailableEntries.push({
        field,
        reason: "birth-year-unknown",
        detail: "Needs the full birth date (the birth year is not known).",
      });
    }
  }

  let ageCycle: NumerologySnapshot["ageCycle"] = null;
  let lifeStages: NumerologySnapshot["lifeStages"] = null;
  if (ctx.full && by.completedAge !== null) {
    const ref = by.ageCycle!;
    const block = ageCycleInterval(ctx, ref.absoluteIndex);
    if (block) ageCycle = { ...block, yearPosition: ref.yearPosition };
    const st = stageIntervals(ctx);
    unavailableEntries.push(...st.skipped);
    lifeStages = {
      pinnacle: st.pinnacles.find((p) => contains(p, asOfIso)) ?? null,
      challenge: st.challenges.find((p) => contains(p, asOfIso)) ?? null,
      lifePeriod: st.lifePeriods.find((p) => contains(p, asOfIso)) ?? null,
      mainChallenge: ctx.stages!.challenges[2].value,
      transition: {
        rule: ctx.stages!.transitionRule,
        lifePathForTransition: ctx.stages!.lifePathForTransition,
        firstPinnacleEndAge: ctx.stages!.firstPinnacleEndAge,
      },
    };
  }

  const cy = calendarYearValue(ctx, asOf.year);
  const cm = red(ctx, cy.value + asOf.month);
  const cd = red(ctx, cm.value + asOf.day);

  return {
    asOf: asOfIso,
    status: ctx.full ? "ok" : "partial",
    birth: birthSummary(ctx.birth),
    meta: ctx.meta,
    completedAge: by.completedAge,
    completedAgeRange: null,
    lastBirthdayYear: y,
    dayInBirthdayYear: diffCivilDays(parseIso(by.nominalStart), asOf) + 1,
    fixedNumbers: { lifePath: ctx.lifePath, firstNameSoulNumber: ctx.soul },
    birthdayYear: by,
    personalMonth: row.months.find((m) => contains(m, asOfIso)) ?? null,
    personalPeriod: period,
    heptad: heptad ? { ...heptad, dayInHeptad: diffCivilDays(parseIso(heptad.nominalStart), asOf) + 1 } : null,
    ageCycle,
    fibonacci: row.fibonacci,
    calendar: { personalYear: cy, personalMonth: cm, personalDay: cd },
    lifeStages,
    unavailable: unavailableEntries,
  };
}

function parseIso(iso: string): CivilDate {
  return { year: Number(iso.slice(0, 4)), month: Number(iso.slice(5, 7)), day: Number(iso.slice(8, 10)) };
}

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------

export interface TimelineInput extends ScheduleInput {
  /** Inclusive start of the requested window. */
  from: CivilDateInput;
  /** Exclusive end of the requested window. */
  toExclusive: CivilDateInput;
  /** Layers to generate. Default `["personal-year"]`. */
  layers?: TimelineLayer[];
  /** Interval budget (default 2000, at most 10000). Exceeding it throws `TOO_MANY_INTERVALS`; nothing is silently truncated. */
  maxIntervals?: number;
}

const LAYER_ORDER = new Map(TIMELINE_LAYERS.map((l, i) => [l, i] as const));
const BIRTHDAY_ROW_LAYERS = new Set<TimelineLayer>(["personal-year", "personal-month", "personal-period", "heptad", "fibonacci"]);
const CALENDAR_LAYERS = new Set<TimelineLayer>(["calendar-year", "calendar-month", "calendar-day"]);

/**
 * Bounded, sorted, half-open intervals overlapping `[from, toExclusive)`.
 * Intervals keep their real bounds (they are not cut at the window edges).
 */
export function generateNumerologyTimeline(input: TimelineInput): NumerologyTimeline {
  const ctx = buildCtx(input);
  const from = resolveCivilDate(input.from, "from");
  const to = resolveCivilDate(input.toExclusive, "toExclusive");
  const fromIso = fmt(from);
  const toIso = fmt(to);
  if (compareCivilDates(from, to) >= 0) {
    throw new NumerologyScheduleError("INVALID_RANGE", "toExclusive must be after from");
  }
  if (diffCivilDays(from, to) > MAX_TIMELINE_RANGE_DAYS) {
    throw new NumerologyScheduleError("RANGE_TOO_LARGE", `Timeline range is limited to ${MAX_TIMELINE_RANGE_DAYS} days`);
  }
  const maxIntervals = input.maxIntervals ?? DEFAULT_MAX_TIMELINE_INTERVALS;
  if (!Number.isInteger(maxIntervals) || maxIntervals < 1 || maxIntervals > MAX_TIMELINE_INTERVALS_HARD_CAP) {
    throw new NumerologyScheduleError("INVALID_ARGUMENT", `maxIntervals must be an integer 1-${MAX_TIMELINE_INTERVALS_HARD_CAP}`);
  }
  const layers = input.layers ?? ["personal-year"];
  if (!Array.isArray(layers) || layers.length === 0) {
    throw new NumerologyScheduleError("INVALID_ARGUMENT", "layers must be a non-empty array");
  }
  for (const layer of layers) {
    if (!LAYER_ORDER.has(layer)) {
      throw new NumerologyScheduleError("INVALID_ARGUMENT", `Unknown timeline layer: ${String(layer)}`);
    }
  }
  const wanted = [...new Set(layers)];
  const intervals: ScheduleInterval[] = [];
  const unavailableEntries: UnavailableEntry[] = [];
  const push = (iv: ScheduleInterval | null | undefined) => {
    if (!iv || !overlaps(iv, fromIso, toIso)) return;
    intervals.push(iv);
    if (intervals.length > maxIntervals) {
      throw new NumerologyScheduleError("TOO_MANY_INTERVALS", `Timeline would exceed ${maxIntervals} intervals; narrow the range or layers`);
    }
  };

  const needsAnchor = wanted.filter((l) => BIRTHDAY_ROW_LAYERS.has(l) || CALENDAR_LAYERS.has(l));
  const needsFull = wanted.filter((l) => l === "age-cycle" || l === "pinnacle" || l === "challenge" || l === "life-period");
  const anchorReason = describeUnavailableBirth(ctx)[0];
  const fullReason: Pick<UnavailableEntry, "reason" | "detail"> =
    ctx.birth.kind === "unknown"
      ? { reason: "birth-date-unknown", detail: "No birth date information." }
      : { reason: "full-birth-date-required", detail: "This layer needs the full birth date." };

  if (!ctx.anchor) {
    for (const l of needsAnchor) unavailableEntries.push({ field: l, reason: anchorReason.reason, detail: anchorReason.detail });
  }
  if (!ctx.full) {
    for (const l of needsFull) unavailableEntries.push({ field: l, ...fullReason });
    if (ctx.anchor && wanted.includes("fibonacci")) {
      unavailableEntries.push({ field: "fibonacci", reason: "birth-year-unknown", detail: "Needs the completed age (full birth date)." });
    }
  }

  const rowLayers = wanted.filter((l) => BIRTHDAY_ROW_LAYERS.has(l));
  if (ctx.anchor && rowLayers.length > 0) {
    const first = birthdayYearOf(ctx, from) ?? (ctx.full ? ctx.full.year : from.year - 1);
    for (let y = first; ; y++) {
      const start = anniversaryInYear({ year: 0, month: ctx.anchor.month, day: ctx.anchor.day }, y);
      if (compareCivilDates(start, to) >= 0 || (ctx.coverageEnd && compareCivilDates(start, ctx.coverageEnd) >= 0)) break;
      const row = buildYearRow(ctx, y);
      if (!row) continue;
      if (rowLayers.includes("personal-year")) push(row.personalYear);
      if (rowLayers.includes("personal-month")) row.months.forEach(push);
      if (rowLayers.includes("personal-period")) row.periods.forEach(push);
      if (rowLayers.includes("heptad")) row.heptads.forEach(push);
      if (rowLayers.includes("fibonacci")) push(row.fibonacci);
    }
  }

  if (ctx.anchor) {
    if (wanted.includes("calendar-year")) {
      for (let y = from.year; y <= to.year; y++) push(calendarYearInterval(ctx, y));
    }
    if (wanted.includes("calendar-month")) {
      for (let y = from.year; y <= to.year; y++) for (let m = 1; m <= 12; m++) push(calendarMonthInterval(ctx, y, m));
    }
    if (wanted.includes("calendar-day")) {
      let cursor = from;
      if (ctx.coverageStart && compareCivilDates(cursor, ctx.coverageStart) < 0) cursor = ctx.coverageStart;
      for (; compareCivilDates(cursor, to) < 0; cursor = addCivilDays(cursor, 1)) {
        if (ctx.coverageEnd && compareCivilDates(cursor, ctx.coverageEnd) >= 0) break;
        push(calendarDayInterval(ctx, cursor));
      }
    }
  }

  if (ctx.full) {
    if (wanted.includes("age-cycle")) {
      const ageAtFrom = Math.max(completedYears(ctx.full, from), 0);
      for (let b = Math.floor(ageAtFrom / 7); ; b++) {
        const start = anniversaryInYear(ctx.full, ctx.full.year + b * 7);
        if (compareCivilDates(start, to) >= 0 || (ctx.coverageEnd && compareCivilDates(start, ctx.coverageEnd) >= 0)) break;
        push(ageCycleInterval(ctx, b));
      }
    }
    if (wanted.some((l) => l === "pinnacle" || l === "challenge" || l === "life-period")) {
      const st = stageIntervals(ctx);
      if (wanted.includes("pinnacle")) st.pinnacles.forEach(push);
      if (wanted.includes("challenge")) st.challenges.forEach(push);
      if (wanted.includes("life-period")) st.lifePeriods.forEach(push);
      for (const u of st.skipped) if (wanted.includes(u.field.split(".")[0] as TimelineLayer)) unavailableEntries.push(u);
    }
  }

  intervals.sort(
    (a, b) =>
      a.start.localeCompare(b.start) ||
      (LAYER_ORDER.get(a.layer) ?? 0) - (LAYER_ORDER.get(b.layer) ?? 0) ||
      indexOf(a) - indexOf(b)
  );

  return {
    from: fromIso,
    toExclusive: toIso,
    layers: wanted,
    meta: ctx.meta,
    intervals,
    caps: { maxIntervals, maxRangeDays: MAX_TIMELINE_RANGE_DAYS },
    unavailable: unavailableEntries,
  };
}

function indexOf(iv: ScheduleInterval): number {
  switch (iv.layer) {
    case "personal-month":
    case "personal-period":
    case "heptad":
      return iv.phase;
    case "pinnacle":
    case "challenge":
    case "life-period":
      return iv.index;
    default:
      return 0;
  }
}

