import { describe, expect, expectTypeOf, it } from "vitest";
import { calculateGematria } from "../gematria";
import {
  calculateCycles,
  calculateFibonacciCycle,
  calculatePersonalCycles,
  calculatePersonalMonths,
  calculatePersonalPeriods,
  calculatePersonalYear,
  type NumerologyModuleTypes,
} from "./index";

/** Local-noon Date that is also safe for years 1-99. */
const at = (iso: string, hour = 12, minute = 0) => {
  const [y, m, d] = iso.split("-").map(Number);
  const result = new Date(2000, 0, 1, hour, minute);
  result.setFullYear(y, m - 1, d);
  return result;
};
const iso = (d: Date) =>
  `${String(d.getFullYear()).padStart(4, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

describe("calculateCycles/calculateFibonacciCycle use completed (birthday) age", () => {
  const birth = at("2001-10-05");

  it("before the birthday: age 24, year 4 of the heptad, active year starts last birthday", () => {
    const res = calculateCycles(birth, at("2026-08-30"));
    expect(res.currentYearlyCycle).toBe(4);
    expect(res.currentAgeCycle).toBe(4); // floor(24 / 7) = 3 -> label 4
    const active = res.yearlyCycles.find((c) => c.isActive);
    expect(active?.number).toBe(4);
    expect(iso(active!.cycleStart!)).toBe("2025-10-05");
    expect(calculateFibonacciCycle(birth, at("2026-08-30")).currentAge).toBe(24);
  });

  it("day before, on, and after the birthday", () => {
    expect(calculateFibonacciCycle(birth, at("2026-10-04")).currentAge).toBe(24);
    expect(calculateFibonacciCycle(birth, at("2026-10-05")).currentAge).toBe(25);
    expect(calculateFibonacciCycle(birth, at("2026-10-06")).currentAge).toBe(25);
    expect(calculateCycles(birth, at("2026-10-04")).currentYearlyCycle).toBe(4);
    expect(calculateCycles(birth, at("2026-10-05")).currentYearlyCycle).toBe(5);
  });

  it("age 6->7 and 48->49 transitions happen on the birthday, not on 1 January", () => {
    const b = at("1990-06-15");
    expect(calculateCycles(b, at("1997-06-14")).currentAgeCycle).toBe(1);
    expect(calculateCycles(b, at("1997-06-15")).currentAgeCycle).toBe(2);
    expect(calculateCycles(b, at("2039-06-14")).currentAgeCycle).toBe(7);
    expect(calculateCycles(b, at("2039-06-15")).currentAgeCycle).toBe(1);
  });
});

describe("repeating seven-year labels point at the real current block", () => {
  it("age 77: label 5, block 11, start 2026-06-18 (not 1977)", () => {
    const res = calculateCycles(at("1949-06-18"), at("2026-08-30"));
    expect(res.currentAgeCycle).toBe(5);
    expect(res.currentAgeBlockIndex).toBe(11);
    const active = res.ageCycles.find((c) => c.isActive)!;
    expect(active.number).toBe(5);
    expect(active.absoluteIndex).toBe(11);
    expect(iso(active.cycleStart!)).toBe("2026-06-18");
    const yearStart = res.yearlyCycles.find((c) => c.isActive)!.cycleStart!;
    expect(iso(yearStart)).toBe("2026-06-18");
    expect(res.yearlyCycles.map((c) => iso(c.cycleStart!))[0]).toBe("2026-06-18");
  });

  it("age 97/98 wraps label 7 -> 1 on the 98th birthday", () => {
    const b = at("1920-03-05");
    const before = calculateCycles(b, at("2018-03-04"));
    const on = calculateCycles(b, at("2018-03-05"));
    expect(before.currentAgeCycle).toBe(7);
    expect(before.currentAgeBlockIndex).toBe(13);
    expect(iso(before.ageCycles.find((c) => c.isActive)!.cycleStart!)).toBe("2011-03-05");
    expect(on.currentAgeCycle).toBe(1);
    expect(on.currentAgeBlockIndex).toBe(14);
    expect(iso(on.ageCycles.find((c) => c.isActive)!.cycleStart!)).toBe("2018-03-05");
  });

  it("the seven entries are consecutive 7-year blocks of the active 49-year window", () => {
    const res = calculateCycles(at("1949-06-18"), at("2026-08-30"));
    const starts = res.ageCycles.map((c) => c.cycleStart!.getFullYear());
    expect(starts).toEqual([1949, 1956, 1963, 1970, 1977, 1984, 1991].map((y) => y + 49));
    expect(res.ageCycles.map((c) => c.absoluteIndex)).toEqual([7, 8, 9, 10, 11, 12, 13]);
  });
});

describe("day ordinals are civil-date based", () => {
  it("same civil day gives the same heptad day regardless of time of day", () => {
    const birth = at("2001-10-05");
    const a = calculateCycles(birth, at("2018-11-05", 0, 30));
    const b = calculateCycles(birth, at("2018-11-05", 1, 30));
    const c = calculateCycles(birth, at("2018-11-05", 23, 59));
    expect(a.daysInMonthlyCycle).toBe(32);
    expect(b.daysInMonthlyCycle).toBe(32);
    expect(c.daysInMonthlyCycle).toBe(32);
    expect(a.totalDays).toBe(32);
    expect(b.totalDays).toBe(32);
    expect(a.currentMonthlyCycle).toBe(1);
  });
});

describe("personal months contract", () => {
  it("returns exactly twelve personal months, typed as such", () => {
    const res = calculatePersonalCycles(at("2000-09-28"), at("2025-10-01"), "John");
    expect(res.personalMonths).toHaveLength(12);
    expectTypeOf(res.personalMonths).toHaveProperty("length").toEqualTypeOf<12>();
    expectTypeOf<NumerologyModuleTypes.PersonalCycles["personalMonths"]>().toEqualTypeOf<
      readonly [
        NumerologyModuleTypes.PersonalMonth, NumerologyModuleTypes.PersonalMonth, NumerologyModuleTypes.PersonalMonth,
        NumerologyModuleTypes.PersonalMonth, NumerologyModuleTypes.PersonalMonth, NumerologyModuleTypes.PersonalMonth,
        NumerologyModuleTypes.PersonalMonth, NumerologyModuleTypes.PersonalMonth, NumerologyModuleTypes.PersonalMonth,
        NumerologyModuleTypes.PersonalMonth, NumerologyModuleTypes.PersonalMonth, NumerologyModuleTypes.PersonalMonth
      ]
    >();
  });
});

describe("years 0001-0099 are not reinterpreted as 19xx", () => {
  it("personal year, cycles and personal cycles use the real year", () => {
    const birth = at("0010-05-05");
    const today = at("0090-06-01");
    expect(birth.getFullYear()).toBe(10);
    const pc = calculatePersonalCycles(birth, today, "Ana");
    expect(pc.yearUsedOnCalculations).toBe(90);
    expect(pc.currentAge).toBe(80);
    expect(calculatePersonalYear(birth, today).reductionSteps[0]).toBe(5 + 5 + 90);
    expect(calculateFibonacciCycle(birth, today).currentAge).toBe(80);
    const cycles = calculateCycles(birth, today);
    expect(cycles.currentAgeBlockIndex).toBe(11);
    expect(cycles.yearlyCycles.find((c) => c.isActive)!.cycleStart!.getFullYear()).toBe(90);
    // before the birthday in year 90
    expect(calculatePersonalCycles(birth, at("0090-05-04"), "Ana").yearUsedOnCalculations).toBe(89);
  });
});

describe("short-month personal-month boundary (legacy convention: next-month-first)", () => {
  const index = (birth: string, asOf: string) =>
    calculatePersonalMonths(at(birth), calculatePersonalYear(at(birth), at(asOf)), at(asOf))
      .currentPersonalMonthIndex;

  it.each([
    // birth, as-of, expected index. Day 31: nominal February phase (index 1) never has a 31st.
    ["2025-01-31", "2025-02-28", 0],
    ["2025-01-31", "2025-03-01", 1],
    ["2025-01-31", "2025-03-30", 1],
    ["2025-01-31", "2025-03-31", 2],
    ["2025-01-31", "2025-04-30", 2],
    ["2025-01-31", "2025-05-01", 3],
    // Day 30
    ["2025-01-30", "2025-02-28", 0],
    ["2025-01-30", "2025-03-01", 1],
    ["2025-01-30", "2025-03-29", 1],
    ["2025-01-30", "2025-03-30", 2],
    // Day 29, non-leap February
    ["2025-01-29", "2025-02-28", 0],
    ["2025-01-29", "2025-03-01", 1],
    ["2025-01-29", "2025-03-28", 1],
    ["2025-01-29", "2025-03-29", 2],
    // Leap year: 29 exists, 30/31 do not
    ["2024-01-29", "2024-02-28", 0],
    ["2024-01-29", "2024-02-29", 1],
    ["2024-01-30", "2024-02-29", 0],
    ["2024-01-30", "2024-03-01", 1],
    ["2024-01-31", "2024-02-29", 0],
    ["2024-01-31", "2024-03-01", 1],
    // Feb 29 birth, non-leap birthday year (birthday rolls to 1 March): month phases stay in step
    ["2024-02-29", "2025-03-01", 0],
    ["2024-02-29", "2025-03-28", 0],
    ["2024-02-29", "2025-03-29", 1],
    ["2024-02-29", "2026-02-28", 11],
    // Feb 29 birth, leap birthday year
    ["2024-02-29", "2024-03-28", 0],
    ["2024-02-29", "2024-03-29", 1],
  ])("birth %s as of %s -> index %i", (birth, asOf, expected) => {
    expect(index(birth, asOf)).toBe(expected);
  });

  it("keeps the nominal month label/value for the phase that starts in another month", () => {
    const birth = at("2025-01-31");
    const asOf = at("2025-03-01");
    const py = calculatePersonalYear(birth, asOf);
    const { personalMonths, currentPersonalMonthIndex } = calculatePersonalMonths(birth, py, asOf);
    expect(currentPersonalMonthIndex).toBe(1);
    expect(personalMonths[1].month).toBe(2); // labelled February although active from 1 March
  });
});

describe("legacy personal cycles: missing names are explicitly unavailable (never soul 0)", () => {
  const birth = at("1990-11-18");
  const today = at("2026-08-30");

  it.each([undefined, null, "", "   ", "\t"])("name %j: periods 1 and 2 stay computed, soul number and period 3 are unavailable", (name) => {
    const res = calculatePersonalCycles(birth, today, name as string | null | undefined);
    const withName = calculatePersonalCycles(birth, today, "Ana");
    expect(res.personalPeriods[0]).toStrictEqual(withName.personalPeriods[0]);
    expect(res.personalPeriods[1]).toStrictEqual(withName.personalPeriods[1]);
    expect(res.personalPeriods[2]).toMatchObject({ startMonth: withName.personalPeriods[2].startMonth, endMonth: withName.personalPeriods[2].endMonth });
    expect(res.personalPeriods[2].value).toMatchObject({ available: false, reason: "first-name-missing" });
    expect(res.soulNumber).toMatchObject({ available: false, reason: "first-name-missing" });
    expect(JSON.stringify(res.personalPeriods[2].value)).not.toMatch(/reducedValue|reductionSteps/);
    expect(JSON.stringify(res.soulNumber)).not.toMatch(/reducedValue|reductionSteps/);
  });

  it("a name without recognised vowels is unavailable, not soul 0", () => {
    const res = calculatePersonalCycles(birth, today, "Ng");
    expect(calculateGematria("Ng").vowels.originalSum).toBe(0);
    expect(res.soulNumber).toMatchObject({ available: false, reason: "first-name-has-no-vowels" });
    expect(res.personalPeriods[2].value).toMatchObject({ available: false });
  });

  it("calculatePersonalPeriods accepts an unavailable soul number and keeps periods 1 and 2", () => {
    const soul = { available: false as const, reason: "first-name-missing" as const, detail: "x" };
    const [p1, p2, p3] = calculatePersonalPeriods(birth, 2025, 3, soul, 34);
    const [q1, q2, q3] = calculatePersonalPeriods(birth, 2025, 3, 5, 34);
    expect(p1).toStrictEqual(q1);
    expect(p2).toStrictEqual(q2);
    expect(p3.value).toBe(soul);
    expect("reducedValue" in q3.value).toBe(true);
  });

  it("output for any name with vowels keeps the exact legacy shape", () => {
    for (const name of ["Ana", "Ana Beth", "João", "John"]) {
      const res = calculatePersonalCycles(birth, today, name);
      const vowels = calculateGematria(name).vowels;
      expect(vowels.finalValue).toBeGreaterThan(0);
      expect(res.soulNumber).toStrictEqual({ reducedValue: vowels.finalValue, reductionSteps: vowels.reductionSteps });
      expect(Object.keys(res.soulNumber!)).toEqual(["reducedValue", "reductionSteps"]);
      const y = res.yearUsedOnCalculations;
      // independent period-3 arithmetic: master-preserving digit-sum reduction of (birthday year + soul)
      let v = y + vowels.finalValue;
      const steps = [v];
      while (v > 9 && ![11, 22, 33, 44].includes(v)) {
        v = String(v).split("").reduce((a, c) => a + Number(c), 0);
        steps.push(v);
      }
      expect(res.personalPeriods[2].value).toStrictEqual({ reducedValue: v, reductionSteps: steps });
    }
  });
});
