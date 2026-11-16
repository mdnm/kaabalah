/**
 * Pinnacles, challenges and life periods as NAMED, DOCUMENTED CONVENTIONS.
 *
 * These conventions are not universal: sources differ on the age at which the
 * first pinnacle ends, on whether master numbers survive in components, and on
 * what "three life periods" means. Every choice below is exposed through
 * `LifeStageOptions` / returned metadata. They are distinct from the three
 * four-month personal periods of the birthday year.
 *
 * Convention `kaabalah-life-stages/1`:
 * - components: month, day and year (digit sum of the full year) reduced to a
 *   single digit, masters not preserved (the same components as
 *   `calculateChallenges`).
 * - pinnacle 1 = month + day; 2 = day + year; 3 = P1 + P2 (reduced values);
 *   4 = month + year. Results reduced with the master policy.
 * - challenges: 1 = |month - day|; 2 = |day - year|; 3 (main) = |C1 - C2|;
 *   4 = |month - year| (single digits, 0-8).
 * - age transition: the first pinnacle/challenge ends at completed age
 *   `36 - L`, L = life path reduced to a single digit (11 -> 2, 22 -> 4,
 *   33 -> 6, 44 -> 8); each following one lasts 9 years; the fourth is open.
 *   `firstPinnacleEndAge` overrides this.
 * - life periods: three periods valued by month, day and year reductions
 *   (master policy applied). `pinnacle-aligned-27`: [0, 36-L), 27 years, rest.
 *   `fixed-28-56`: [0, 28), [28, 56), [56, open).
 */

import {
  type CivilDate,
  MAX_CIVIL_YEAR,
  anniversaryInYear,
  civilDateToLocalNoon,
} from "../civil-date";
import {
  calculateKaabalisticLifePath,
  calculateStraightAcrossReductionLifePath,
  reduceToSingle,
  reduceToSingleWithSteps,
  isMasterNumber,
} from "./core";
import {
  type LifeStageOptions,
  type LifePathMethod,
  type MasterPolicy,
  type ReducedNumber,
  NumerologyScheduleError,
} from "./schedule-types";

export const LIFE_STAGE_METHOD_ID = "kaabalah-life-stages/1";

export interface LifeStageSpan {
  /** 1-based position within its family. */
  index: number;
  startAge: number;
  /** `null` for the open-ended last span. */
  endAgeExclusive: number | null;
  /** `null` when the start anniversary falls after the last supported year (9999); see `startBeyondCalendar`. */
  start: CivilDate | null;
  /** `null` for the open-ended last span, or when the end falls after year 9999 (then `nominalEndBeyondCalendar` is true). */
  nominalEndExclusive: CivilDate | null;
  /** True only when the span's start is past the supported calendar (the span cannot be dated). */
  startBeyondCalendar?: true;
  /** True only when the span has an age end but its date is past the supported calendar (year > 9999). */
  nominalEndBeyondCalendar?: true;
}

export interface Pinnacle extends LifeStageSpan {
  value: ReducedNumber;
}

export interface Challenge extends LifeStageSpan {
  value: number;
  /** True for the third (main) challenge. */
  isMain: boolean;
}

export interface LifePeriod extends LifeStageSpan {
  /** Which date part this period is valued by. */
  basis: "month" | "day" | "year";
  value: ReducedNumber;
}

export interface LifeStages {
  convention: string;
  lifePathMethod: LifePathMethod;
  lifePathForTransition: number;
  transitionRule: "36-minus-life-path" | "fixed-first-end-age";
  firstPinnacleEndAge: number;
  lifePeriodRule: "pinnacle-aligned-27" | "fixed-28-56";
  masterPolicy: MasterPolicy;
  components: { month: number; day: number; year: number };
  pinnacles: Pinnacle[];
  challenges: Challenge[];
  lifePeriods: LifePeriod[];
}

function reduced(n: number, masters: MasterPolicy): ReducedNumber {
  const r = reduceToSingleWithSteps(n, { preserveMasters: masters === "preserve" });
  return { value: r.reducedValue, reductionSteps: r.reductionSteps, isMaster: isMasterNumber(r.reducedValue) };
}

export function computeLifeStages(
  birth: CivilDate,
  masters: MasterPolicy,
  options: LifeStageOptions = {}
): LifeStages {
  const lifePathMethod = options.lifePathMethod ?? "straight-across";
  const lifePathRule = options.firstPinnacleEndAge === undefined ? "36-minus-life-path" : "fixed-first-end-age";
  const lifePeriodRule = options.lifePeriodRule ?? "pinnacle-aligned-27";
  if (lifePeriodRule !== "pinnacle-aligned-27" && lifePeriodRule !== "fixed-28-56") {
    throw new NumerologyScheduleError("INVALID_ARGUMENT", `Unknown lifePeriodRule: ${String(lifePeriodRule)}`);
  }
  if (lifePathMethod !== "kaabalistic" && lifePathMethod !== "straight-across") {
    throw new NumerologyScheduleError("INVALID_ARGUMENT", `Unknown lifePathMethod: ${String(lifePathMethod)}`);
  }
  if (
    options.firstPinnacleEndAge !== undefined &&
    (!Number.isInteger(options.firstPinnacleEndAge) || options.firstPinnacleEndAge < 1 || options.firstPinnacleEndAge > 60)
  ) {
    throw new NumerologyScheduleError("INVALID_ARGUMENT", "firstPinnacleEndAge must be an integer 1-60");
  }

  const noon = civilDateToLocalNoon(birth);
  const lifePathValue =
    lifePathMethod === "kaabalistic"
      ? calculateKaabalisticLifePath(noon).lifePath.reducedValue
      : calculateStraightAcrossReductionLifePath(noon).lifePath.reducedValue;
  const lifePathForTransition = reduceToSingle(lifePathValue);
  const firstEnd = options.firstPinnacleEndAge ?? 36 - lifePathForTransition;

  const m = reduceToSingle(birth.month);
  const d = reduceToSingle(birth.day);
  const y = reduceToSingle(birth.year);

  // Anniversaries past year 9999 are not representable: report them explicitly instead of throwing.
  const dated = (age: number): CivilDate | null =>
    birth.year + age > MAX_CIVIL_YEAR ? null : anniversaryInYear(birth, birth.year + age);
  const span = (index: number, startAge: number, endAge: number | null): LifeStageSpan => {
    const start = dated(startAge);
    const end = endAge === null ? null : dated(endAge);
    return {
      index,
      startAge,
      endAgeExclusive: endAge,
      start,
      nominalEndExclusive: end,
      ...(start === null ? { startBeyondCalendar: true as const } : {}),
      ...(endAge !== null && end === null ? { nominalEndBeyondCalendar: true as const } : {}),
    };
  };

  const edges = [0, firstEnd, firstEnd + 9, firstEnd + 18];
  const spans = edges.map((age, i) => span(i + 1, age, i < 3 ? edges[i + 1] : null));

  const p1 = reduced(m + d, masters);
  const p2 = reduced(d + y, masters);
  const pinnacleValues = [p1, p2, reduced(p1.value + p2.value, masters), reduced(m + y, masters)];
  const pinnacles = spans.map((s, i) => ({ ...s, value: pinnacleValues[i] }));

  const c1 = Math.abs(m - d);
  const c2 = Math.abs(d - y);
  const challengeValues = [c1, c2, Math.abs(c1 - c2), Math.abs(m - y)];
  const challenges = spans.map((s, i) => ({ ...s, value: challengeValues[i], isMain: i === 2 }));

  const periodEdges = lifePeriodRule === "fixed-28-56" ? [0, 28, 56] : [0, firstEnd, firstEnd + 27];
  const bases = ["month", "day", "year"] as const;
  const baseValues = [birth.month, birth.day, birth.year];
  const lifePeriods = periodEdges.map((age, i) => ({
    ...span(i + 1, age, i < 2 ? periodEdges[i + 1] : null),
    basis: bases[i],
    value: reduced(baseValues[i], masters),
  }));

  return {
    convention: LIFE_STAGE_METHOD_ID,
    lifePathMethod,
    lifePathForTransition,
    transitionRule: lifePathRule,
    firstPinnacleEndAge: firstEnd,
    lifePeriodRule,
    masterPolicy: masters,
    components: { month: m, day: d, year: y },
    pinnacles,
    challenges,
    lifePeriods,
  };
}
