import { describe, expect, it } from "vitest";
import { NumerologyScheduleError, describePartialBirthDate, summarizeBirthDateCandidates } from "./index";

const reduceKeep = (n: number): number => {
  let v = n;
  while (v > 9 && ![11, 22, 33, 44].includes(v)) v = String(v).split("").reduce((a, c) => a + Number(c), 0);
  return v;
};

describe("describePartialBirthDate", () => {
  it("lists computable fields and structured reasons per kind", () => {
    expect(describePartialBirthDate("2001-10-20").unavailable).toEqual([]);
    const md = describePartialBirthDate({ kind: "month-day", month: 10, day: 20 });
    expect(md.computable).toContain("personalYear");
    expect(md.unavailable.map((u) => u.field)).toContain("fibonacci");
    expect(md.unavailable.every((u) => u.reason === "birth-year-unknown")).toBe(true);
    const ym = describePartialBirthDate({ kind: "year-month", year: 2001, month: 1 });
    expect(ym.computable).toContain("candidateSummary");
    expect(ym.unavailable.every((u) => u.reason === "birth-day-or-month-unknown")).toBe(true);
    const approx = describePartialBirthDate({ kind: "year", year: 1950, approximate: true });
    expect(approx.unavailable[0].reason).toBe("birth-year-approximate");
    expect(approx.computable).not.toContain("candidateSummary");
    expect(describePartialBirthDate({ kind: "unknown" }).unavailable[0].reason).toBe("birth-date-unknown");
  });

  it("rejects impossible partial values", () => {
    expect(() => describePartialBirthDate({ kind: "month-day", month: 4, day: 31 })).toThrow(NumerologyScheduleError);
    expect(() => describePartialBirthDate({ kind: "year-month", year: 2001, month: 13 })).toThrow(NumerologyScheduleError);
    expect(() => describePartialBirthDate({ kind: "year", year: 0 })).toThrow(NumerologyScheduleError);
    expect(() => describePartialBirthDate("2001-02-30")).toThrow(NumerologyScheduleError);
  });
});

describe("summarizeBirthDateCandidates (January 2001 style case)", () => {
  const summary = summarizeBirthDateCandidates({ birth: { kind: "year-month", year: 2001, month: 1 }, asOf: "2026-11-15", firstName: "Ana" });

  it("reports invariants, possible values and boundary ranges without choosing a date", () => {
    expect(summary.candidateCount).toBe(31);
    expect(summary.candidatesBornAfterAsOf).toBe(0);
    expect(summary.selectedDate).toBeNull();
    expect(summary.fields.completedAge).toMatchObject({ invariant: true, value: 25 });
    expect(summary.fields.lastBirthdayYear).toMatchObject({ invariant: true, value: 2026 });
    expect(summary.fields.fibonacciCycle1).toMatchObject({ invariant: true, value: 7 }); // age 25 -> 7
    const expectedPY = [...new Set(Array.from({ length: 31 }, (_, i) => reduceKeep(i + 1 + 1 + 2026)))].sort((a, b) => a - b);
    expect(summary.fields.personalYear.invariant).toBe(false);
    expect(summary.fields.personalYear.possibleValues).toEqual(expectedPY);
    expect(summary.fields.personalMonthPhase.possibleValues).toEqual([10, 11]); // day <= 15 gives phase 11
    expect(summary.intervalBoundaryRanges.birthdayYear).toEqual({
      start: { min: "2026-01-01", max: "2026-01-31", invariant: false },
      endExclusive: { min: "2027-01-01", max: "2027-01-31", invariant: false },
    });
    expect(summary.fields.firstNameSoulNumber.invariant).toBe(true);
  });

  it("never emits candidate dates", () => {
    const json = JSON.stringify(summary);
    expect(json).not.toMatch(/candidates"/);
    expect(json).not.toMatch(/2001-01-\d\d/);
    expect(Object.keys(summary)).not.toContain("dates");
  });

  it("missing name -> soul number summary is the unavailable marker, not 0", () => {
    const s = summarizeBirthDateCandidates({ birth: { kind: "year-month", year: 2001, month: 1 }, asOf: "2026-11-15" });
    expect(s.fields.firstNameSoulNumber.possibleValues).toEqual([null]);
    expect(s.fields.personalPeriodValue.possibleValues).not.toContain(0);
  });

  it("year-only knowledge enumerates the whole year (leap and common) and excludes later births", () => {
    expect(summarizeBirthDateCandidates({ birth: { kind: "year", year: 2000 }, asOf: "2026-11-15" }).candidateCount).toBe(366);
    const s = summarizeBirthDateCandidates({ birth: { kind: "year", year: 2026 }, asOf: "2026-03-15" });
    expect(s.candidateCount).toBe(365);
    expect(s.candidatesBornAfterAsOf).toBe(365 - 74);
    expect(s.fields.completedAge).toMatchObject({ invariant: true, value: 0 });
  });

  it("refuses kinds that cannot be enumerated", () => {
    for (const birth of [{ kind: "year", year: 1950, approximate: true }, { kind: "month-day", month: 1, day: 1 }, { kind: "unknown" }] as const) {
      expect(() => summarizeBirthDateCandidates({ birth: birth as never, asOf: "2026-01-01" })).toThrow(NumerologyScheduleError);
    }
  });
});
