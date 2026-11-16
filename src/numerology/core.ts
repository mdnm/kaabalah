/**
 * Low-level numerology primitives (digit reduction, life paths). Split from
 * `index.ts` so the schedule facade can use them without import cycles.
 */

import type * as NumerologyModuleTypes from "./data";

export function parseDate(date: Date): { day: string; month: string; year: string } {
  if (!date) {
    throw new Error("Date is required");
  }

  if (!(date instanceof Date)) {
    throw new Error("Date must be a Date object");
  }

  if (Number.isNaN(date.getTime())) {
    throw new Error("Date must be a valid Date object");
  }

  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: String(date.getMonth() + 1).padStart(2, "0"),
    year: String(date.getFullYear()).padStart(4, "0"),
  };
}

export function mapDatePartsToBlocksOfTwo({
  day,
  month,
  year,
}: {
  day: string;
  month: string;
  year: string;
}): { day: string; month: string; year1: string; year2: string } {
  return {
    day: day.padStart(2, "0"),
    month: month.padStart(2, "0"),
    year1: year.slice(0, 2),
    year2: year.slice(2),
  };
}

function digitSum(n: number): number {
  let s = 0;

  for (const ch of String(Math.abs(n))) {
    s += ch.charCodeAt(0) - 48;
  }

  return s;
}

export const MASTER_NUMBERS = [11, 22, 33, 44];

export function isMasterNumber(n: number): boolean {
  return MASTER_NUMBERS.includes(n);
}

export function reduceToSingle(
  n: number,
  options: { preserveMasters?: boolean } = { preserveMasters: false }
): number {
  // standard digital root with 0 allowed; never preserve masters here
  if (n === 0) {
    return 0;
  }

  let reduced = n;
  while (reduced > 9) {
    if (options?.preserveMasters && isMasterNumber(reduced)) {
      break;
    }

    reduced = digitSum(reduced);
  }

  // optional tweak for exact "00" cases will be applied by caller, not here
  return reduced;
}

export function reduceToSingleWithSteps(
  n: number,
  options: { preserveMasters?: boolean } = { preserveMasters: false }
): NumerologyModuleTypes.ReducedValueWithSteps {
  const steps = [n];

  if (n === 0) {
    return {
      reducedValue: 0,
      reductionSteps: steps,
    };
  }

  let reduced = n;

  while (reduced > 9) {
    if (options?.preserveMasters && isMasterNumber(reduced)) {
      break;
    }

    reduced = digitSum(reduced);
    steps.push(reduced);
  }

  return {
    reducedValue: reduced,
    reductionSteps: steps,
  };
}

function reduceBlock(block: string): number {
  const n = [...block].reduce(
    (acc, curr) => acc + (curr.charCodeAt(0) - 48),
    0
  );

  if (n === 0) {
    return 0;
  }

  return reduceToSingle(n);
}

/**
 * Calculate the Kaabalistic life path number based on a birth date.
 * Note: This method produces more master numbers and never produces life path 2s (or any life path that ends with 0 like 10, 20, 30, etc.)
 */
export function calculateKaabalisticLifePath(
  birthDate: Date
): NumerologyModuleTypes.KaabalisticLifePathResult {
  const { day, month, year1, year2 } = mapDatePartsToBlocksOfTwo(
    parseDate(birthDate)
  );

  const reducedDay = reduceBlock(day);
  const reducedMonth = reduceBlock(month);
  const reducedYear1 = reduceBlock(year1);
  const reducedYear2 = reduceBlock(year2);

  const dayMonthSynthesis = parseInt(`${reducedDay}${reducedMonth}`, 10);
  const yearSynthesis = parseInt(`${reducedYear1}${reducedYear2}`, 10);

  const reducedDayMonthSynthesis = reduceToSingle(dayMonthSynthesis);
  const reducedYearSynthesis = reduceToSingle(yearSynthesis);

  const finalSynthesis = parseInt(
    `${reducedDayMonthSynthesis}${reducedYearSynthesis}`,
    10
  );

  const lifePath = reduceToSingleWithSteps(finalSynthesis, { preserveMasters: true });
  const isMasterLifePath = isMasterNumber(lifePath.reducedValue);

  const personalMythologyNumbers = [
    parseInt(`${dayMonthSynthesis}${yearSynthesis}`, 10),
    finalSynthesis,
  ];

  if (finalSynthesis !== lifePath.reducedValue) {
    personalMythologyNumbers.push(lifePath.reducedValue);
  }

  const reducedLifePath = reduceToSingle(lifePath.reducedValue);
  if (isMasterLifePath) {
    personalMythologyNumbers.push(reducedLifePath);
  }

  return {
    parts: { day, month, year1, year2 },
    reducedParts: { reducedDay, reducedMonth, reducedYear1, reducedYear2 },
    syntheses: {
      dayMonthSynthesis,
      yearSynthesis,
      reducedDayMonthSynthesis,
      reducedYearSynthesis,
      finalSynthesis,
    },
    lifePath,
    personalMythologyNumbers,
  };
}

/**
 * Calculate the traditional straight across reduction life path number based on a birth date.
 */
export function calculateStraightAcrossReductionLifePath(
  birthDate: Date
): NumerologyModuleTypes.StraightAcrossReductionLifePathResult {
  const { day, month, year } = parseDate(birthDate);

  const result = reduceToSingleWithSteps(
    parseInt(`${day}${month}${year}`, 10),
    { preserveMasters: true }
  );

  return {
    dayEnergy: reduceToSingleWithSteps(parseInt(day, 10), { preserveMasters: true }),
    monthEnergy: reduceToSingleWithSteps(parseInt(month, 10), { preserveMasters: true }),
    yearEnergy: reduceToSingleWithSteps(parseInt(year, 10), { preserveMasters: true }),
    lifePath: result,
  };
}
