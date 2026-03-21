/**
 * Annual & Monthly Profections — traditional Hellenistic time-lord technique.
 * Pure math. Requires a whole-sign BirthChart for house sign lookup.
 */

import type { BirthChart } from "./index";
import { getDomicileRuler, type Sign, type TraditionalPlanet } from "./dignity";
import { SIGNS } from "./index";

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
