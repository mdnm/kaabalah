import { cliValue } from "../runtime/content";
import { cliText } from "../runtime/language";
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
import { civilDateFromLocalDate, civilDateToLocalNoon, formatCivilDate } from "../../civil-date";
import { civilOption, stringOption } from "../runtime/options";
import type { Flags, InputPayload } from "../runtime/types";

/**
 * Evaluation date of the legacy time-sensitive commands. `--as-of` / `asOf` replaces the
 * implicit `new Date()` only when given (as local noon, so the calendar day is stable);
 * the default stays "now". The evaluated calendar day is echoed as `asOf` in the output.
 */
function resolveEvaluation(flags: Flags, payload: InputPayload): { today: Date; asOf: string; source: string } {
  const civil = civilOption(stringOption(flags, payload, "as-of", "asOf"), flags);
  if (civil) return { today: civilDateToLocalNoon(civil), asOf: formatCivilDate(civil), source: "--as-of" };
  const now = new Date();
  return { today: now, asOf: formatCivilDate(civilDateFromLocalDate(now)), source: "today" };
}

export function cmdNumerology(dateStr: string, flags: Flags, payload: InputPayload = null): void {
  const date = parseDate(dateStr, flags);
  const evaluation = resolveEvaluation(flags, payload);

  const kaabalistic = calculateKaabalisticLifePath(date);
  const straight = calculateStraightAcrossReductionLifePath(date);
  const challenges = calculateChallenges(date);
  const energies = getDateEnergies(date);
  const personalYear = calculatePersonalYear(date);
  const fibonacci = calculateFibonacciCycle(date, evaluation.today);

  if (isJsonMode(flags)) {
    outputJson({ kaabalistic, straight, challenges, energies, personalYear, fibonacci, asOf: evaluation.asOf }, flags);
    return;
  }

  console.log(cliText("\nNumerology Profile: {0}\n", [dateStr]));
  console.log(cliText("  Kaabalistic Life Path: {0}", [kaabalistic.lifePath.reducedValue]));
  console.log(cliText("    Steps: [{0}]", [kaabalistic.lifePath.reductionSteps.join(", ")]));
  console.log(cliText("    Personal Mythology: [{0}]", [kaabalistic.personalMythologyNumbers.join(", ")]));
  console.log(cliText("\n  Straight Across Life Path: {0}", [straight.lifePath.reducedValue]));
  console.log(cliText("    Day energy:   {0}", [straight.dayEnergy.reducedValue]));
  console.log(cliText("    Month energy: {0}", [straight.monthEnergy.reducedValue]));
  console.log(cliText("    Year energy:  {0}", [straight.yearEnergy.reducedValue]));
  console.log(cliText("\n  Challenges:"));
  console.log(cliText("    Main:  {0}", [challenges.mainChallenge]));
  console.log(cliText("    Sub 1: {0}", [challenges.subChallenge1]));
  console.log(cliText("    Sub 2: {0}", [challenges.subChallenge2]));
  console.log(cliText("\n  Date Energies:"));
  console.log(cliText("    Day:   {0}", [energies.dayEnergy.reducedValue]));
  console.log(cliText("    Month: {0}", [energies.monthEnergy.reducedValue]));
  console.log(cliText("    Year:  {0}", [energies.yearEnergy.reducedValue]));
  console.log(cliText("\n  Personal Year: {0}", [personalYear.reducedValue]));
  console.log(cliText("\n  Fibonacci Cycle (age {0}, as of {1}):", [fibonacci.currentAge, evaluation.asOf]));
  for (let i = 1; i <= 7; i++) {
    const cycle = fibonacci[`cycle${i}` as keyof typeof fibonacci] as { reducedValue: number };
    console.log(cliText("    Cycle {0}: {1}", [i, cycle.reducedValue]));
  }
  console.log();
}

export function cmdLifePath(dateStr: string, flags: Flags): void {
  const result = calculateKaabalisticLifePath(parseDate(dateStr, flags));

  if (isJsonMode(flags)) {
    outputJson(result, flags);
    return;
  }

  console.log(cliText("\nKaabalistic Life Path: {0}\n", [dateStr]));
  console.log(cliText("  Life Path: {0}", [result.lifePath.reducedValue]));
  console.log(cliText("  Steps: [{0}]", [result.lifePath.reductionSteps.join(", ")]));
  console.log(cliText("  Personal Mythology: [{0}]", [result.personalMythologyNumbers.join(", ")]));
  console.log(cliText("  Parts: day={0} month={1} year1={2} year2={3}", [result.reducedParts.reducedDay, result.reducedParts.reducedMonth, result.reducedParts.reducedYear1, result.reducedParts.reducedYear2]));
  console.log();
}

/** Reduced value, or the localized word "unavailable" for the structured `{ available: false }` values. */
function reducedOrUnavailable(value: unknown): unknown {
  const reduced = (value as { reducedValue?: unknown } | null | undefined)?.reducedValue;
  return reduced === undefined ? cliText("unavailable") : reduced;
}

export function cmdCycles(dateStr: string, firstName: string | undefined, flags: Flags, payload: InputPayload = null): void {
  const date = parseDate(dateStr, flags);
  const evaluation = resolveEvaluation(flags, payload);
  const today = evaluation.today;

  if (firstName) {
    const result = calculatePersonalCycles(date, today, firstName);

    if (isJsonMode(flags)) {
      outputJson({ ...result, asOf: evaluation.asOf }, flags);
      return;
    }

    console.log(cliText("\nPersonal Cycles: {0} ({1}), as of {2}\n", [dateStr, firstName, evaluation.asOf]));
    console.log(cliText("  Age: {0}", [result.currentAge]));
    console.log(cliText("  Life Path: {0}", [result.lifePath.reducedValue]));
    console.log(cliText("  Soul Number: {0}", [reducedOrUnavailable(result.soulNumber)]));
    console.log(cliText("  Personal Year: {0}", [result.personalYear.reducedValue]));
    console.log(cliText("  Current Period: {0}/3", [result.currentPersonalPeriod + 1]));
    console.log(cliText("  Current Month: {0}/12", [result.currentPersonalMonth + 1]));
    console.log(cliText("\n  Periods:"));
    for (let i = 0; i < result.personalPeriods.length; i++) {
      const period = result.personalPeriods[i];
      const active = i === result.currentPersonalPeriod ? " <--" : "";
      console.log(cliText("    Period {0} (months {1}-{2}): {3}{4}", [i + 1, period.startMonth, period.endMonth, reducedOrUnavailable(period.value), active]));
    }
    console.log(cliText("\n  Monthly energies:"));
    for (let i = 0; i < result.personalMonths.length; i++) {
      const month = result.personalMonths[i];
      const active = i === result.currentPersonalMonth ? " <--" : "";
      console.log(cliText("    Month {0}: {1}{2}", [month.month, month.value.reducedValue, active]));
    }
    console.log();
    return;
  }

  const result = calculateCycles(date, today);

  if (isJsonMode(flags)) {
    outputJson({ ...result, asOf: evaluation.asOf }, flags);
    return;
  }

  console.log(cliText("\nHeptad Cycles: {0}, as of {1}\n", [dateStr, evaluation.asOf]));
  console.log(cliText("  Total days since last birthday: {0}", [result.totalDays]));

  if (result.currentAgeCycle) {
    console.log(cliText("\n  Age Cycles (current: {0}):", [result.currentAgeCycle]));
    for (const cycle of result.ageCycles) {
      const active = cycle.isActive ? " <--" : "";
      console.log(cliText("    Cycle {0}: {1}{2}", [cycle.number, cliValue(cycle.description), active]));
    }
  }

  if (result.currentYearlyCycle) {
    console.log(cliText("\n  Yearly Cycles (current: {0}):", [result.currentYearlyCycle]));
    for (const cycle of result.yearlyCycles) {
      const active = cycle.isActive ? " <--" : "";
      console.log(cliText("    Cycle {0}: {1}{2}", [cycle.number, cliValue(cycle.description), active]));
    }
  }

  console.log(cliText("\n  Monthly Cycles (current: {0}, day {1}):", [result.currentMonthlyCycle, result.daysInMonthlyCycle]));
  for (const cycle of result.monthlyCycles) {
    const active = cycle.isActive ? " <--" : "";
    console.log(cliText("    Cycle {0}: {1}{2}", [cycle.number, cliValue(cycle.description), active]));
  }
  console.log();
}

export function cmdChallenges(dateStr: string, flags: Flags): void {
  const result = calculateChallenges(parseDate(dateStr, flags));

  if (isJsonMode(flags)) {
    outputJson(result, flags);
    return;
  }

  console.log(cliText("\nChallenges: {0}\n", [dateStr]));
  console.log(cliText("  Day:    {0}", [result.day]));
  console.log(cliText("  Month:  {0}", [result.month]));
  console.log(cliText("  Year:   {0}", [result.year]));
  console.log(cliText("  Main:   {0}", [result.mainChallenge]));
  console.log(cliText("  Sub 1:  {0}", [result.subChallenge1]));
  console.log(cliText("  Sub 2:  {0}", [result.subChallenge2]));
  console.log();
}

export function cmdFibonacci(dateStr: string, flags: Flags, payload: InputPayload = null): void {
  const evaluation = resolveEvaluation(flags, payload);
  const result = calculateFibonacciCycle(parseDate(dateStr, flags), evaluation.today);

  if (isJsonMode(flags)) {
    outputJson({ ...result, asOf: evaluation.asOf }, flags);
    return;
  }

  console.log(cliText("\nFibonacci Cycle: {0} (age {1}, as of {2})\n", [dateStr, result.currentAge, evaluation.asOf]));
  for (let i = 1; i <= 7; i++) {
    const cycle = result[`cycle${i}` as keyof typeof result] as { reducedValue: number; reductionSteps: number[] };
    console.log(cliText("  Cycle {0}: {1}  [{2}]", [i, cycle.reducedValue, cycle.reductionSteps.join(", ")]));
  }
  console.log();
}
