/**
 * Annual & Monthly Profections — traditional Hellenistic time-lord technique.
 * Pure math. Requires a whole-sign BirthChart for house sign lookup.
 */

import type { BirthChart } from "./index";
import { getDomicileRuler, type Sign, type TraditionalPlanet } from "./dignity";
import { SIGNS } from "./index";
import { TimelineError } from "./firdaria";
import {
  anniversaryInYear,
  civilDateFromLocalDate,
  compareCivilDates,
  completedYears,
  isValidCivilDate,
  type CivilDate,
} from "../civil-date";

export interface AnnualProfection {
  age: number;
  house: number;
  sign: string;
  ruler: TraditionalPlanet;
  targetYear: number;
}

export interface MonthlyProfection {
  month: number;
  startDate: Date;
  sign: string;
  ruler: TraditionalPlanet;
}

export interface MonthlyProfectionsResult {
  annualProfection: AnnualProfection;
  months: MonthlyProfection[];
}

export function getAnnualProfection(
  natalChart: BirthChart,
  birthDate: Date,
  targetYear?: number
): AnnualProfection {
  const year = targetYear ?? new Date().getFullYear();
  const birthYear = birthDate.getFullYear();
  const age = year - birthYear;
  if (age < 0) {
    throw new Error(`Target year (${year}) is before birth year (${birthYear}).`);
  }
  const house = (age % 12) + 1;
  const sign = natalChart.houses.houses[house - 1].sign as Sign;
  const ruler = getDomicileRuler(sign);

  return { age, house, sign, ruler, targetYear: year };
}

export function getMonthlyProfections(
  natalChart: BirthChart,
  birthDate: Date,
  targetYear?: number
): MonthlyProfectionsResult {
  const annualProfection = getAnnualProfection(natalChart, birthDate, targetYear);
  const annualSignIndex = SIGNS.indexOf(annualProfection.sign as Sign);

  const bdMonth = birthDate.getMonth();
  const bdDay = birthDate.getDate();
  const year = annualProfection.targetYear;

  const months: MonthlyProfection[] = [];
  for (let i = 0; i < 12; i++) {
    const monthDate = new Date(year, bdMonth + i, bdDay);
    // Handle day overflow (e.g. Feb 29 → Mar 1)
    if (monthDate.getDate() !== bdDay) {
      monthDate.setDate(0); // last day of previous month
    }
    const signIndex = (annualSignIndex + i) % 12;
    const sign = SIGNS[signIndex] as Sign;

    months.push({
      month: i + 1,
      startDate: monthDate,
      sign,
      ruler: getDomicileRuler(sign),
    });
  }

  return { annualProfection, months };
}

// ── Bounded annual profection timeline (additive) ───────────────────────────

/** Hard cap on profection years per timeline call. */
export const MAX_PROFECTION_TIMELINE_YEARS = 150;

export interface ProfectionForAge {
  age: number;
  house: number;
  sign: string;
  ruler: TraditionalPlanet;
}

/**
 * Whole-sign annual profection for an age: house = age mod 12 + 1 and the profected
 * sign counted from the natal ASCENDANT sign (whole-sign houses by definition, so it
 * is correct for any recorded house system). Agrees with `getAnnualProfection` for
 * whole-sign charts.
 */
export function getProfectionForAge(natalChart: BirthChart, age: number): ProfectionForAge {
  if (!Number.isInteger(age) || age < 0) {
    throw new TimelineError("INVALID_INPUT", `age must be a non-negative integer (got ${age})`);
  }
  const ascSign = natalChart.houses.ascendant.sign;
  const ascIndex = SIGNS.indexOf(ascSign as (typeof SIGNS)[number]);
  if (ascIndex < 0) throw new TimelineError("UNAVAILABLE_INPUT", "natal chart has no ascendant sign (untimed chart?)");
  const sign = SIGNS[(ascIndex + age) % 12] as Sign;
  return { age, house: (age % 12) + 1, sign, ruler: getDomicileRuler(sign) };
}

export interface ProfectionTimelineEntry extends ProfectionForAge {
  /** Birthday that starts this profection year (civil date; 29 Feb births use 1 Mar in non-leap years). */
  start: CivilDate;
  /** Next birthday: the half-open end of the year [start, endExclusive). */
  endExclusive: CivilDate;
}

export type ProfectionTimelineRange =
  | { fromAge: number; toAge: number }
  | { from: CivilDate | Date; to: CivilDate | Date };

export interface ProfectionTimelineResult {
  entries: ProfectionTimelineEntry[];
  birth: CivilDate;
  method: {
    houses: "whole-sign from the natal ascendant sign";
    yearBoundary: "birthday to next birthday, half-open [start, endExclusive); 29 Feb births roll to 1 Mar in non-leap years";
    selection: string;
  };
}

function asCivil(d: CivilDate | Date): CivilDate {
  return d instanceof Date ? civilDateFromLocalDate(d) : d;
}

/**
 * One entry per annual profection year for a bounded age range or civil-date range
 * (a year is included when [start, endExclusive) overlaps [from, to] of the date
 * range). Dates are civil dates; `Date` inputs are read with local calendar getters.
 */
export function getAnnualProfectionTimeline(
  natalChart: BirthChart,
  birth: CivilDate | Date,
  range: ProfectionTimelineRange
): ProfectionTimelineResult {
  const b = asCivil(birth);
  if (!isValidCivilDate(b)) throw new TimelineError("INVALID_INPUT", "birth must be a valid civil date");
  let firstAge: number;
  let lastAge: number;
  let selection: string;
  if ("fromAge" in range) {
    if (!Number.isFinite(range.fromAge) || !Number.isFinite(range.toAge)) {
      throw new TimelineError("UNBOUNDED_INPUT", "fromAge and toAge must be finite");
    }
    firstAge = Math.max(0, Math.floor(range.fromAge));
    lastAge = Math.floor(range.toAge);
    selection = `ages ${firstAge}..${lastAge} inclusive`;
  } else {
    const from = asCivil(range.from);
    const to = asCivil(range.to);
    if (!isValidCivilDate(from) || !isValidCivilDate(to)) {
      throw new TimelineError("UNBOUNDED_INPUT", "from and to must be valid civil dates");
    }
    if (compareCivilDates(to, from) < 0) throw new TimelineError("INVALID_RANGE", "to is before from");
    // Age whose year contains `from` (clamped at 0) and age whose year contains `to`.
    firstAge = Math.max(0, completedYears(b, from));
    lastAge = completedYears(b, to);
    selection = "years whose [birthday, next birthday) overlaps the date range";
  }
  if (lastAge < firstAge) throw new TimelineError("INVALID_RANGE", "range selects no profection year");
  if (lastAge - firstAge + 1 > MAX_PROFECTION_TIMELINE_YEARS) {
    throw new TimelineError(
      "RANGE_TOO_LARGE",
      `range spans ${lastAge - firstAge + 1} profection years; the cap is ${MAX_PROFECTION_TIMELINE_YEARS}`
    );
  }
  const entries: ProfectionTimelineEntry[] = [];
  for (let age = firstAge; age <= lastAge; age++) {
    entries.push({
      ...getProfectionForAge(natalChart, age),
      start: anniversaryInYear(b, b.year + age),
      endExclusive: anniversaryInYear(b, b.year + age + 1),
    });
  }
  return {
    entries,
    birth: b,
    method: {
      houses: "whole-sign from the natal ascendant sign",
      yearBoundary:
        "birthday to next birthday, half-open [start, endExclusive); 29 Feb births roll to 1 Mar in non-leap years",
      selection,
    },
  };
}
