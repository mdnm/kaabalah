/**
 * Numerology calculations
 */

import {
  addCivilDays,
  anniversaryInYear,
  civilDateFromLocalDate,
  civilDateToLocalNoon,
  compareCivilDates,
  completedYears,
  diffCivilDays,
  type CivilDate,
} from "../civil-date";
import { calculateGematria } from "../gematria";
import type * as NumerologyModuleTypes from "./data";
import * as NumerologyData from "./data";
import {
  MASTER_NUMBERS,
  calculateKaabalisticLifePath,
  calculateStraightAcrossReductionLifePath,
  doubleDigitValue,
  isMasterNumber,
  mapDatePartsToBlocksOfTwo,
  parseDate,
  reduceToSingle,
  reduceToSingleWithSteps,
} from "./core";
import { unavailable } from "./schedule-types";

export * from "./timing-descriptions";

export {
  MASTER_NUMBERS,
  calculateKaabalisticLifePath,
  calculateStraightAcrossReductionLifePath,
  isMasterNumber,
  reduceToSingle,
  reduceToSingleWithSteps,
};

/**
 * Dates are read with local calendar getters; construct them at local noon
 * (e.g. `new Date(1990, 0, 15, 12)`) to avoid day-shift at timezone extremes.
 */
export function getDateEnergies(birthDate: Date): NumerologyModuleTypes.DateEnergies {
  const { day, month, year1, year2 } = mapDatePartsToBlocksOfTwo(
    parseDate(birthDate)
  );

  const dayEnergy = reduceToSingleWithSteps(parseInt(day, 10), {
    preserveMasters: true,
  });
  const monthEnergy = reduceToSingleWithSteps(parseInt(month, 10), {
    preserveMasters: true,
  });
  const yearEnergy = reduceToSingleWithSteps(parseInt(year1 + year2, 10), {
    preserveMasters: true,
  });

  return {
    dayEnergy,
    monthEnergy,
    yearEnergy,
  };
}

/**
 * Dates are read with local calendar getters; construct them at local noon
 * (e.g. `new Date(1990, 0, 15, 12)`) to avoid day-shift at timezone extremes.
 */
export function calculateChallenges(birthDate: Date): NumerologyModuleTypes.Challenges {
  const { day, month, year } = parseDate(birthDate);

  const reducedDay = reduceToSingle(parseInt(day, 10));
  const reducedMonth = reduceToSingle(parseInt(month, 10));
  const reducedYear = reduceToSingle(parseInt(year, 10));

  const subChallenge1 = Math.abs(reducedMonth - reducedDay);
  const subChallenge2 = Math.abs(reducedDay - reducedYear);
  const mainChallenge = Math.abs(subChallenge1 - subChallenge2);

  return {
    day: reducedDay,
    month: reducedMonth,
    year: reducedYear,
    mainChallenge,
    subChallenge1,
    subChallenge2,
  };
}

/** Civil (timezone-free) day of a legacy Date, read with local calendar getters. */
function toCivil(date: Date): CivilDate {
  parseDate(date); // validates
  return civilDateFromLocalDate(date);
}

/** Legacy `cycleStart` values are local-midnight Dates; safe for years 1-99. */
function civilToLocalMidnight(date: CivilDate): Date {
  const result = civilDateToLocalNoon(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/** Most recent anniversary of `birth` on or before `today`. */
function lastBirthdayCivil(birth: CivilDate, today: CivilDate): CivilDate {
  const thisYear = anniversaryInYear(birth, today.year);
  return compareCivilDates(thisYear, today) <= 0
    ? thisYear
    : anniversaryInYear(birth, today.year - 1);
}

function numberToHeptadCycle(number: number): NumerologyModuleTypes.HeptadCycles {
  if (number < 1 || number > 7) {
    throw new Error("Number must be between 1 and 7");
  }

  return number as NumerologyModuleTypes.HeptadCycles;
}

/**
 * Calculate cycles (annual and monthly).
 *
 * - Ages are completed (birthday) ages.
 * - `ageCycles` lists the seven blocks of the 49-year window that contains the
 *   active block, labelled 1-7 with their real absolute indices; the active
 *   entry carries the real start of the current block.
 * - Day counters are civil-day based (independent of DST and time of day).
 * - The seventh 52-day segment runs to the actual next birthday (53/54 days).
 *
 * Dates are read with local calendar getters; construct them at local noon
 * (e.g. `new Date(1990, 0, 15, 12)`) to avoid day-shift at timezone extremes.
 */
export function calculateCycles(startDate: Date, today: Date): NumerologyModuleTypes.CycleInfo {
  const birth = toCivil(startDate);
  const now = toCivil(today);
  const mostRecentStart = lastBirthdayCivil(birth, now);
  const cycleLength = 52; // Fixed cycle length for monthly cycles

  // Skip annual cycle calculation if start date is in the future
  const isFutureDate = compareCivilDates(birth, now) > 0;
  let currentYearlyCycle: number | null = null;
  let currentAgeCycle: number | null = null;
  let currentAgeBlockIndex: number | null = null;
  const ageCycles: NumerologyModuleTypes.CycleInfo["ageCycles"] = [];
  const yearlyCycles: NumerologyModuleTypes.CycleInfo["yearlyCycles"] = [];
  if (!isFutureDate) {
    const completedAge = completedYears(birth, now);
    const block = Math.floor(completedAge / 7);
    currentAgeBlockIndex = block;
    currentAgeCycle = (block % 7) + 1;
    currentYearlyCycle = (completedAge % 7) + 1;
    const windowFirstBlock = Math.floor(block / 7) * 7;

    for (let i = 0; i < 7; i++) {
      const absoluteIndex = windowFirstBlock + i;
      const cycle = i + 1;
      ageCycles.push({
        number: cycle,
        description: NumerologyData.CYCLE_MEANINGS[numberToHeptadCycle(cycle)],
        isActive: cycle === currentAgeCycle,
        cycleStart: civilToLocalMidnight(
          anniversaryInYear(birth, birth.year + absoluteIndex * 7)
        ),
        absoluteIndex,
      });
    }

    for (let j = 0; j < 7; j++) {
      const yearlyCycle = j + 1;
      yearlyCycles.push({
        number: yearlyCycle,
        description: NumerologyData.CYCLE_MEANINGS[numberToHeptadCycle(yearlyCycle)],
        isActive: yearlyCycle === currentYearlyCycle,
        cycleStart: civilToLocalMidnight(
          anniversaryInYear(birth, birth.year + block * 7 + j)
        ),
      });
    }
  }

  // Monthly (52-day) cycles relative to the most recent anniversary
  const monthlyCycles: NumerologyModuleTypes.CycleInfo["monthlyCycles"] = [];
  for (let i = 0; i < 7; i++) {
    monthlyCycles.push({
      number: i + 1,
      description: NumerologyData.CYCLE_MEANINGS[numberToHeptadCycle(i + 1)],
      isActive: false,
      cycleStart: civilToLocalMidnight(addCivilDays(mostRecentStart, i * cycleLength)),
    });
  }

  const nextAnniversary = anniversaryInYear(birth, mostRecentStart.year + 1);
  const daysSinceStart = diffCivilDays(mostRecentStart, now);
  let currentMonthlyCycle: NumerologyModuleTypes.CycleInfo["currentMonthlyCycle"] = null;
  let daysInMonthlyCycle = 0;
  for (let i = 0; i < 7; i++) {
    const startOffset = i * cycleLength;
    const endOffset =
      i < 6 ? (i + 1) * cycleLength : diffCivilDays(mostRecentStart, nextAnniversary);
    if (daysSinceStart >= startOffset && daysSinceStart < endOffset) {
      currentMonthlyCycle = i + 1;
      daysInMonthlyCycle = daysSinceStart - startOffset + 1;
      monthlyCycles[i].isActive = true;
      break;
    }
  }

  return {
    yearlyCycles,
    ageCycles,
    monthlyCycles,
    currentYearlyCycle,
    currentAgeCycle,
    currentMonthlyCycle,
    daysInMonthlyCycle,
    totalDays: daysSinceStart + 1,
    currentAgeBlockIndex,
  };
}

/** Completed (birthday) age; a 29 February birthday completes on 1 March in common years. */
function calculateAge(birthDate: Date, today: Date = new Date()): number {
  return completedYears(toCivil(birthDate), toCivil(today));
}

/**
 * Fibonacci cycles from the completed (birthday) age.
 * Dates are read with local calendar getters; construct them at local noon
 * (e.g. `new Date(1990, 0, 15, 12)`) to avoid day-shift at timezone extremes.
 */
export function calculateFibonacciCycle(
  birthDate: Date,
  today: Date
): NumerologyModuleTypes.FibonacciCycle {
  return fibonacciFromAge(calculateAge(birthDate, today));
}

/** Fibonacci recurrence on an explicit age (single-digit reductions; masters are not preserved). */
export function fibonacciFromAge(currentAge: number): NumerologyModuleTypes.FibonacciCycle {
  const cycle1 = reduceToSingleWithSteps(currentAge);
  const cycle2 = reduceToSingleWithSteps(cycle1.reducedValue + 2);
  const cycle3 = reduceToSingleWithSteps(
    cycle1.reducedValue + cycle2.reductionSteps[0]
  );
  const cycle4 = reduceToSingleWithSteps(
    cycle2.reductionSteps[0] + cycle3.reductionSteps[0]
  );
  const cycle5 = reduceToSingleWithSteps(
    cycle3.reductionSteps[0] + cycle4.reductionSteps[0]
  );
  const cycle6 = reduceToSingleWithSteps(
    cycle4.reductionSteps[0] + cycle5.reductionSteps[0]
  );
  const cycle7 = reduceToSingleWithSteps(
    cycle5.reductionSteps[0] + cycle6.reductionSteps[0]
  );

  return {
    currentAge,
    cycle1,
    cycle2,
    cycle3,
    cycle4,
    cycle5,
    cycle6,
    cycle7,
  };
}

/**
 * Soul number from the vowels of the supplied name. A missing, blank or
 * vowel-less name is explicitly unavailable (never a manufactured 0).
 */
function calculateSoulNumber(
  firstName: string | null | undefined
): NumerologyModuleTypes.ReducedValueWithSteps | NumerologyModuleTypes.UnavailableValue {
  if (typeof firstName !== "string" || firstName.trim() === "") {
    return unavailable("first-name-missing", "No first name supplied; the soul number (personal period 3) is not computed.");
  }
  const vowels = calculateGematria(firstName).vowels;
  if (vowels.originalSum === 0 || vowels.finalValue === 0) {
    return unavailable("first-name-has-no-vowels", "The supplied name has no vowels recognised by the gematria mapping; soul number not computed.");
  }

  return {
    reducedValue: vowels.finalValue,
    reductionSteps: vowels.reductionSteps,
  };
}

/**
 * This function wraps the month number to a 1-12 range.
 */
function wrapMonth(month: number): number {
  const wrappedMonth = (((month - 1) % 12) + 12) % 12;

  return wrappedMonth + 1;
}

/**
 * Dates are read with local calendar getters; construct them at local noon
 * (e.g. `new Date(1990, 0, 15, 12)` ) to avoid day-shift at timezone extremes.
 */
export function calculatePersonalYear(
  birthDate: Date,
  today: Date = new Date()
): NumerologyModuleTypes.ReducedValueWithSteps {
  const { day, month } = parseDate(birthDate);
  const yearToUse = lastBirthdayCivil(toCivil(birthDate), toCivil(today)).year;

  return reduceToSingleWithSteps(
    parseInt(day, 10) + parseInt(month, 10) + yearToUse,
    { preserveMasters: true }
  );
}

export function calculatePersonalPeriods(
  birthDate: Date,
  yearToUse: number,
  lifePath: number,
  soulNumber: number | NumerologyModuleTypes.UnavailableValue,
  currentAge: number
): [NumerologyModuleTypes.PersonalPeriod, NumerologyModuleTypes.PersonalPeriod, NumerologyModuleTypes.PersonalPeriod] {
  const { month } = parseDate(birthDate);
  const birthMonth = parseInt(month, 10);

  const periods: [NumerologyModuleTypes.PersonalPeriod, NumerologyModuleTypes.PersonalPeriod, NumerologyModuleTypes.PersonalPeriod] = [
    {
      startMonth: wrapMonth(birthMonth + 0),
      endMonth: wrapMonth(birthMonth + 3),
      value: reduceToSingleWithSteps(yearToUse + currentAge, {
        preserveMasters: true,
      }),
    },
    {
      startMonth: wrapMonth(birthMonth + 4),
      endMonth: wrapMonth(birthMonth + 7),
      value: reduceToSingleWithSteps(yearToUse + lifePath, {
        preserveMasters: true,
      }),
    },
    {
      startMonth: wrapMonth(birthMonth + 8),
      endMonth: wrapMonth(birthMonth + 11),
      value:
        typeof soulNumber === "number"
          ? reduceToSingleWithSteps(yearToUse + soulNumber, { preserveMasters: true })
          : soulNumber,
    },
  ];

  return periods;
}

/**
 * Index (0-11) of the active personal month.
 *
 * Convention ("next-month-first"): phase k starts on the birth day of the
 * k-th calendar month after the birth month. When that month has no such day
 * (birth day 29/30/31 in a short month) the phase starts on the 1st of the
 * following month while keeping its nominal month label/value. The nominal
 * month (not the rolled-forward 1 March of a 29 February birthday) is the
 * anchor, so 29 February births stay in step with their birthday year.
 */
function diffInPersonalMonths(birthDate: Date, today: Date): number {
  const birth = toCivil(birthDate);
  const now = toCivil(today);
  const lastYear = lastBirthdayCivil(birth, now).year;

  let k = (now.year - lastYear) * 12 + (now.month - birth.month);

  // Only advance to the next personal month on the birth *day* each month
  if (now.day < birth.day) {
    k -= 1;
  }

  if (k < 0) k = 0;
  if (k > 12) k = 12;

  return k;
}

export function calculatePersonalMonths(
  birthDate: Date,
  personalYear: NumerologyModuleTypes.ReducedValueWithSteps,
  today: Date
): {
  personalMonths: NumerologyModuleTypes.PersonalCycles["personalMonths"];
  currentPersonalMonthIndex: number;
} {
  const { month } = parseDate(birthDate);
  const firstPersonalMonth = parseInt(month, 10);

  // The month is added to the double-digit personal year (14, not 14/5's 5), then reduced.
  const yearToAdd = doubleDigitValue(personalYear.reductionSteps);
  const personalMonths: NumerologyModuleTypes.PersonalMonth[] = [];
  for (let i = 0; i < 12; i++) {
    const m = wrapMonth(firstPersonalMonth + i);
    const value = reduceToSingleWithSteps(yearToAdd + m, {
      preserveMasters: true,
    });
    personalMonths.push({ month: m, value });
  }

  const currentPersonalMonthIndex = diffInPersonalMonths(birthDate, today);

  return {
    personalMonths: personalMonths as unknown as NumerologyModuleTypes.PersonalCycles["personalMonths"],
    currentPersonalMonthIndex,
  };
}

export function calculatePersonalCycles(
  birthDate: Date,
  today: Date = new Date(),
  firstName?: string | null
): NumerologyModuleTypes.PersonalCycles {
  const birth = toCivil(birthDate);
  const yearToUse = lastBirthdayCivil(birth, toCivil(today)).year;

  const personalYear = calculatePersonalYear(birthDate, today);

  // Completed age at the last birthday (already birthday-correct; do not
  // subtract again).
  const currentAge = yearToUse - birth.year;
  const { lifePath } = calculateKaabalisticLifePath(birthDate);
  const soulNumber = calculateSoulNumber(firstName);

  const personalPeriods = calculatePersonalPeriods(
    birthDate,
    yearToUse,
    lifePath.reducedValue,
    soulNumber.reducedValue === undefined ? soulNumber : soulNumber.reducedValue,
    currentAge
  );

  const { personalMonths, currentPersonalMonthIndex: currentPersonalMonth } =
    calculatePersonalMonths(birthDate, personalYear, today);

  // Derive the period from the month index (0–12). Clamp 12 to last period.
  const currentPersonalPeriod = Math.floor(
    Math.min(currentPersonalMonth, 11) / 4
  );

  return {
    currentAge,
    lifePath,
    soulNumber,
    personalYear,
    personalPeriods,
    personalMonths,
    currentPersonalPeriod,
    currentPersonalMonth,
    yearUsedOnCalculations: yearToUse,
  };
}

export { NumerologyData };
export type { NumerologyModuleTypes };

export * from "./texts";

export * from "./schedule";
export * from "./partial-date";
export * from "./life-stages";
