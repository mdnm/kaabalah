import {
  calculateChallenges,
  calculateCycles,
  calculateFibonacciCycle,
  calculateKaabalisticLifePath,
  calculatePersonalCycles,
  calculatePersonalYear,
  calculateStraightAcrossReductionLifePath,
  getDateEnergies,
} from "../../numerology";
import { isJsonMode } from "../runtime/args";
import { outputJson } from "../runtime/output";
import { parseDate } from "../runtime/validation";
import type { Flags } from "../runtime/types";

export function cmdNumerology(dateStr: string, flags: Flags): void {
  const date = parseDate(dateStr, flags);

  const kaabalistic = calculateKaabalisticLifePath(date);
  const straight = calculateStraightAcrossReductionLifePath(date);
  const challenges = calculateChallenges(date);
  const energies = getDateEnergies(date);
  const personalYear = calculatePersonalYear(date);
  const fibonacci = calculateFibonacciCycle(date, new Date());

  if (isJsonMode(flags)) {
    outputJson({ kaabalistic, straight, challenges, energies, personalYear, fibonacci }, flags);
    return;
  }

  console.log(`\nNumerology Profile: ${dateStr}\n`);
  console.log(`  Kaabalistic Life Path: ${kaabalistic.lifePath.reducedValue}`);
  console.log(`    Steps: [${kaabalistic.lifePath.reductionSteps.join(", ")}]`);
  console.log(`    Personal Mythology: [${kaabalistic.personalMythologyNumbers.join(", ")}]`);
  console.log(`\n  Straight Across Life Path: ${straight.lifePath.reducedValue}`);
  console.log(`    Day energy:   ${straight.dayEnergy.reducedValue}`);
  console.log(`    Month energy: ${straight.monthEnergy.reducedValue}`);
  console.log(`    Year energy:  ${straight.yearEnergy.reducedValue}`);
  console.log(`\n  Challenges:`);
  console.log(`    Main:  ${challenges.mainChallenge}`);
  console.log(`    Sub 1: ${challenges.subChallenge1}`);
  console.log(`    Sub 2: ${challenges.subChallenge2}`);
  console.log(`\n  Date Energies:`);
  console.log(`    Day:   ${energies.dayEnergy.reducedValue}`);
  console.log(`    Month: ${energies.monthEnergy.reducedValue}`);
  console.log(`    Year:  ${energies.yearEnergy.reducedValue}`);
  console.log(`\n  Personal Year: ${personalYear.reducedValue}`);
  console.log(`\n  Fibonacci Cycle (age ${fibonacci.currentAge}):`);
  for (let i = 1; i <= 7; i++) {
    const cycle = fibonacci[`cycle${i}` as keyof typeof fibonacci] as { reducedValue: number };
    console.log(`    Cycle ${i}: ${cycle.reducedValue}`);
  }
  console.log();
}

export function cmdLifePath(dateStr: string, flags: Flags): void {
  const result = calculateKaabalisticLifePath(parseDate(dateStr, flags));

  if (isJsonMode(flags)) {
    outputJson(result, flags);
    return;
  }

  console.log(`\nKaabalistic Life Path: ${dateStr}\n`);
  console.log(`  Life Path: ${result.lifePath.reducedValue}`);
  console.log(`  Steps: [${result.lifePath.reductionSteps.join(", ")}]`);
  console.log(`  Personal Mythology: [${result.personalMythologyNumbers.join(", ")}]`);
  console.log(`  Parts: day=${result.reducedParts.reducedDay} month=${result.reducedParts.reducedMonth} year1=${result.reducedParts.reducedYear1} year2=${result.reducedParts.reducedYear2}`);
  console.log();
}

export function cmdCycles(dateStr: string, firstName: string | undefined, flags: Flags): void {
  const date = parseDate(dateStr, flags);
  const today = new Date();

  if (firstName) {
    const result = calculatePersonalCycles(date, today, firstName);

    if (isJsonMode(flags)) {
      outputJson(result, flags);
      return;
    }

    console.log(`\nPersonal Cycles: ${dateStr} (${firstName})\n`);
    console.log(`  Age: ${result.currentAge}`);
    console.log(`  Life Path: ${result.lifePath.reducedValue}`);
    console.log(`  Soul Number: ${result.soulNumber?.reducedValue}`);
    console.log(`  Personal Year: ${result.personalYear.reducedValue}`);
    console.log(`  Current Period: ${result.currentPersonalPeriod + 1}/3`);
    console.log(`  Current Month: ${result.currentPersonalMonth + 1}/12`);
    console.log(`\n  Periods:`);
    for (let i = 0; i < result.personalPeriods.length; i++) {
      const period = result.personalPeriods[i];
      const active = i === result.currentPersonalPeriod ? " <--" : "";
      console.log(`    Period ${i + 1} (months ${period.startMonth}-${period.endMonth}): ${period.value.reducedValue}${active}`);
    }
    console.log(`\n  Monthly energies:`);
    for (let i = 0; i < result.personalMonths.length; i++) {
      const month = result.personalMonths[i];
      const active = i === result.currentPersonalMonth ? " <--" : "";
      console.log(`    Month ${month.month}: ${month.value.reducedValue}${active}`);
    }
    console.log();
    return;
  }

  const result = calculateCycles(date, today);

  if (isJsonMode(flags)) {
    outputJson(result, flags);
    return;
  }

  console.log(`\nHeptad Cycles: ${dateStr}\n`);
  console.log(`  Total days since last birthday: ${result.totalDays}`);

  if (result.currentAgeCycle) {
    console.log(`\n  Age Cycles (current: ${result.currentAgeCycle}):`);
    for (const cycle of result.ageCycles) {
      const active = cycle.isActive ? " <--" : "";
      console.log(`    Cycle ${cycle.number}: ${cycle.description}${active}`);
    }
  }

  if (result.currentYearlyCycle) {
    console.log(`\n  Yearly Cycles (current: ${result.currentYearlyCycle}):`);
    for (const cycle of result.yearlyCycles) {
      const active = cycle.isActive ? " <--" : "";
      console.log(`    Cycle ${cycle.number}: ${cycle.description}${active}`);
    }
  }

  console.log(`\n  Monthly Cycles (current: ${result.currentMonthlyCycle}, day ${result.daysInMonthlyCycle}):`);
  for (const cycle of result.monthlyCycles) {
    const active = cycle.isActive ? " <--" : "";
    console.log(`    Cycle ${cycle.number}: ${cycle.description}${active}`);
  }
  console.log();
}

export function cmdChallenges(dateStr: string, flags: Flags): void {
  const result = calculateChallenges(parseDate(dateStr, flags));

  if (isJsonMode(flags)) {
    outputJson(result, flags);
    return;
  }

  console.log(`\nChallenges: ${dateStr}\n`);
  console.log(`  Day:    ${result.day}`);
  console.log(`  Month:  ${result.month}`);
  console.log(`  Year:   ${result.year}`);
  console.log(`  Main:   ${result.mainChallenge}`);
  console.log(`  Sub 1:  ${result.subChallenge1}`);
  console.log(`  Sub 2:  ${result.subChallenge2}`);
  console.log();
}

export function cmdFibonacci(dateStr: string, flags: Flags): void {
  const result = calculateFibonacciCycle(parseDate(dateStr, flags), new Date());

  if (isJsonMode(flags)) {
    outputJson(result, flags);
    return;
  }

  console.log(`\nFibonacci Cycle: ${dateStr} (age ${result.currentAge})\n`);
  for (let i = 1; i <= 7; i++) {
    const cycle = result[`cycle${i}` as keyof typeof result] as { reducedValue: number; reductionSteps: number[] };
    console.log(`  Cycle ${i}: ${cycle.reducedValue}  [${cycle.reductionSteps.join(", ")}]`);
  }
  console.log();
}
