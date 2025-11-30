import { describe, expect, it } from "vitest";
import {
  calculateChallenges,
  calculateCycles,
  calculateFibonacciCycle,
  calculateKaabalisticLifePath,
  calculatePersonalCycles,
  calculateStraightAcrossReductionLifePath,
  getDateEnergies,
  isMasterNumber,
} from "./index";

// Helper: force UTC so toISOString() is stable
const dUTC = (y: number, m: number, d: number) =>
  new Date(Date.UTC(y, m - 1, d));

describe("Heptad cycles", () => {
  it("should calculate the cycles correctly", () => {
    const res = calculateCycles(dUTC(2000, 1, 1), dUTC(2025, 4, 16));
    expect(res.ageCycles).toHaveLength(7);
    expect(res.yearlyCycles).toHaveLength(7);
    expect(res.monthlyCycles).toHaveLength(7);
    expect(res.currentAgeCycle).toBe(4);
    expect(res.currentYearlyCycle).toBe(5);
    expect(res.currentMonthlyCycle).toBe(3);
  });
});

describe("Kaabalistic life path", () => {
  it.each([
    // lifePath, y, m, d, finalSynthesis (non-masters)
    [1, 1900, 1, 8, 91],
    [11, 1901, 1, 8, 92],
    [3, 1900, 1, 1, 21],
    [4, 1900, 1, 2, 31],
    [5, 1900, 1, 3, 41],
    [6, 1900, 1, 4, 51],
    [7, 1900, 1, 5, 61],
    [8, 1900, 1, 6, 71],
    [9, 1900, 1, 7, 81],
  ])(
    "produces life path %d for %d-%02d-%02d",
    (lifePath, y, m, d, finalSyn) => {
      const res = calculateKaabalisticLifePath(dUTC(y, m, d));
      expect(res.lifePath).toBe(lifePath);
      expect(res.syntheses.finalSynthesis).toBe(finalSyn);
    }
  );

  it.each([
    // finalMaster, y, m, d, root
    [11, 1900, 1, 9, 11],
    [22, 1901, 1, 1, 22],
    [33, 1902, 1, 2, 33],
    [44, 1903, 1, 3, 44],
  ])("produces master %d for %d-%02d-%02d", (finalMaster, y, m, d, root) => {
    const res = calculateKaabalisticLifePath(dUTC(y, m, d));
    expect(res.lifePath).toBe(root); // 11→2, 22→4, 33→6, 44→8
    expect(res.syntheses.finalSynthesis).toBe(finalMaster);
  });

  it("handles years ending with 00 (including leap-day in 2000)", () => {
    const a = calculateKaabalisticLifePath(dUTC(1900, 1, 1)); // Y2='00'
    expect(a.syntheses.finalSynthesis).toBe(21);

    const b = calculateKaabalisticLifePath(dUTC(2000, 2, 29)); // leap day in a 00 year
    expect(b.syntheses.finalSynthesis).toBe(42);
    expect(b.lifePath).toBe(6);

    const c = calculateKaabalisticLifePath(dUTC(2000, 1, 1)); // common 00-year master
    expect(c.syntheses.finalSynthesis).toBe(22);
    expect(c.lifePath).toBe(22);
  });

  it.each([
    // y, m, d, finalDouble, root
    [2012, 2, 12, 55, 1],
    [2013, 12, 12, 66, 3],
    [2014, 3, 13, 77, 5],
    [1979, 12, 23, 88, 7],
    [1998, 9, 27, 99, 9],
  ])(
    "supports higher doubles %d-%02d-%02d → %d",
    (y, m, d, finalDouble, root) => {
      const r = calculateKaabalisticLifePath(dUTC(y, m, d));
      expect(r.syntheses.finalSynthesis).toBe(finalDouble);
      expect(r.lifePath).toBe(root);
    }
  );

  it("ignores time-of-day (uses only the ISO date)", () => {
    const a = calculateKaabalisticLifePath(
      new Date(Date.UTC(2012, 1, 12, 0, 0, 0))
    );
    const b = calculateKaabalisticLifePath(new Date("2012-02-12T23:59:59Z"));
    expect(a.syntheses.finalSynthesis).toBe(55);
    expect(b.syntheses.finalSynthesis).toBe(55);
  });

  it.each([
    // y, m, d, personalMythologyNumbers
    [1993, 5, 11, [2513, 74, 11, 2]],
  ])(
    "produces personal mythology numbers %d-%02d-%02d → %o",
    (y, m, d, personalMythologyNumbers) => {
      const res = calculateKaabalisticLifePath(dUTC(y, m, d));
      expect(res.personalMythologyNumbers).toEqual(personalMythologyNumbers);
    }
  );

  it("should filter same numbers in personal mythology numbers", () => {
    const res = calculateKaabalisticLifePath(dUTC(1902, 1, 2));
    expect(res.personalMythologyNumbers).toEqual([2112, 33, 6]);
  });
});

describe("Straight across reduction life path", () => {
  it.each([
    // lifePath, y, m, d
    [1, 1900, 1, 8],
    [2, 1900, 1, 9],
    [3, 1900, 1, 1],
    [4, 1900, 1, 2],
    [5, 1900, 1, 3],
    [6, 1900, 1, 4],
    [7, 1900, 1, 5],
    [8, 1900, 1, 6],
    [9, 1900, 1, 7],
  ])("produces life path %d for %d-%02d-%02d", (lifePath, y, m, d) => {
    const res = calculateStraightAcrossReductionLifePath(dUTC(y, m, d));
    expect(res.lifePath).toBe(lifePath);
    expect(isMasterNumber(res.lifePath)).toBe(false);
  });

  it.each([
    // finalMaster, y, m, d
    [11, 1990, 1, 18],
    [22, 1950, 3, 22],
    [33, 1980, 6, 9],
  ])("produces master %d for %d-%02d-%02d", (finalMaster, y, m, d) => {
    const res = calculateStraightAcrossReductionLifePath(dUTC(y, m, d));
    expect(res.lifePath).toBe(finalMaster);
    expect(isMasterNumber(res.lifePath)).toBe(true);
  });

  it("handles years ending with 00 (including leap-day in 2000)", () => {
    const a = calculateStraightAcrossReductionLifePath(dUTC(1900, 1, 1)); // Y2='00'
    expect(a.lifePath).toBe(3);

    const b = calculateStraightAcrossReductionLifePath(dUTC(2000, 2, 29)); // leap day in a 00 year
    expect(b.lifePath).toBe(6);

    const c = calculateStraightAcrossReductionLifePath(dUTC(2000, 1, 1)); // common 00-year master
    expect(c.lifePath).toBe(4);
  });

  it.each([
    // y, m, d, finalDouble, root
    [2012, 2, 12, 1],
    [2013, 12, 12, 3],
    [2014, 3, 13, 5],
    [1979, 12, 23, 7],
    [1998, 9, 27, 9],
  ])("supports higher doubles %d-%02d-%02d → %d", (y, m, d, finalDouble) => {
    const r = calculateStraightAcrossReductionLifePath(dUTC(y, m, d));
    expect(r.lifePath).toBe(finalDouble);
  });

  it("ignores time-of-day (uses only the ISO date)", () => {
    const a = calculateStraightAcrossReductionLifePath(
      new Date(Date.UTC(2012, 1, 12, 0, 0, 0))
    );
    const b = calculateStraightAcrossReductionLifePath(
      new Date("2012-02-12T23:59:59Z")
    );
    expect(a.lifePath).toBe(1);
    expect(b.lifePath).toBe(1);
  });
});

describe("Date energies", () => {
  it.each([
    // y, m, d, dayEnergy, monthEnergy, yearEnergy
    [1990, 11, 18, 9, 11, 1],
  ])(
    "produces date energies %d-%02d-%02d → %o",
    (y, m, d, dayEnergy, monthEnergy, yearEnergy) => {
      const res = getDateEnergies(dUTC(y, m, d));
      expect(res.dayEnergy.reducedValue).toBe(dayEnergy);
      expect(res.monthEnergy.reducedValue).toBe(monthEnergy);
      expect(res.yearEnergy.reducedValue).toBe(yearEnergy);
      expect(res.dayEnergy.reductionSteps).toHaveLength(2);
      expect(res.monthEnergy.reductionSteps).toHaveLength(1);
      expect(res.yearEnergy.reductionSteps).toHaveLength(4);
    }
  );
});

describe("Challenges", () => {
  it.each([
    // y, m, d, day, month, year, mainChallenge, subChallenge1, subChallenge2
    [1990, 11, 18, 9, 2, 1, 1, 7, 8],
  ])(
    "produces challenges %d-%02d-%02d → %o",
    (y, m, d, day, month, year, mainChallenge, subChallenge1, subChallenge2) => {
      const res = calculateChallenges(dUTC(y, m, d));
      expect(res.day).toBe(day);
      expect(res.month).toBe(month);
      expect(res.year).toBe(year);
      expect(res.mainChallenge).toBe(mainChallenge);
      expect(res.subChallenge1).toBe(subChallenge1);
      expect(res.subChallenge2).toBe(subChallenge2);
    }
  );
});

describe("Fibonacci cycle", () => {
  it.each([
    // y, m, d, today, currentAge, cycle1, cycle2, cycle3, cycle4, cycle5, cycle6, cycle7
    [2001, 1, 3, "2025-01-02", 24, 6, 8, 5, 4, 9, 4, 4],
  ])(
    "produces fibonacci cycle %d-%d-%d → %o",
    (y, m, d, today, currentAge, cycle1, cycle2, cycle3, cycle4, cycle5, cycle6, cycle7) => {
      const res = calculateFibonacciCycle(dUTC(y, m, d), new Date(today));
      expect(res.currentAge).toBe(currentAge);
      expect(res.cycle1.reducedValue).toBe(cycle1);
      expect(res.cycle2.reducedValue).toBe(cycle2);
      expect(res.cycle3.reducedValue).toBe(cycle3);
      expect(res.cycle4.reducedValue).toBe(cycle4);
      expect(res.cycle5.reducedValue).toBe(cycle5);
      expect(res.cycle6.reducedValue).toBe(cycle6);
      expect(res.cycle7.reducedValue).toBe(cycle7);
    }
  )
});

describe("Personal cycles", () => {
  it.each([
    // y, m, d, today, name, currentAge, personalYear, personalPeriods, personalMonths, currentPersonalPeriod, currentPersonalMonth, soulNumber
    [2000, 9, 28, "2025-10-01", "John", 25, 1, [7, 3, 6], [1, 11, 3, 4, 2, 3, 4, 5, 6, 7, 8, 9], 0, 0, 6],
    [2000, 12, 28, "2025-11-01", "John", 24, 3, [5, 5, 5], [6, 4, 5, 6, 7, 8, 9, 1, 11, 3, 4, 5], 2, 10, 6],
    [1999, 11, 29, "2025-11-25", "Abigail", 25, 3, [6, 4, 3], [5, 6, 4, 5, 6, 7, 8, 9, 1, 11, 3, 4], 2, 11, 4],
  ])(
    "produces personal cycles %d-%d-%d → %o",
    (y, m, d, today, name, currentAge, personalYear, personalPeriods, personalMonths, currentPersonalPeriod, currentPersonalMonth, soulNumber) => {
      const res = calculatePersonalCycles(dUTC(y, m, d), new Date(today), name);
      expect(res.currentAge).toBe(currentAge);
      expect(res.personalYear.reducedValue).toBe(personalYear);
      expect(res.personalPeriods.map((p) => p.value.reducedValue)).toEqual(personalPeriods);
      expect(res.personalMonths.map((m) => m.value.reducedValue)).toEqual(personalMonths);
      expect(res.currentPersonalPeriod).toBe(currentPersonalPeriod);
      expect(res.currentPersonalMonth).toBe(currentPersonalMonth);
      expect(res.soulNumber?.reducedValue).toBe(soulNumber);
    }
  );
});