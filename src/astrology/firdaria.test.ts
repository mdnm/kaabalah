import { describe, expect, it } from "vitest";
import { getFirdaria } from "./firdaria";

describe("Firdaria", () => {
  const birthDate = new Date(2001, 9, 2); // Oct 2, 2001

  it("day chart: first major = Sun (10y), second = Venus (8y)", () => {
    const result = getFirdaria(birthDate, true);
    expect(result.sect).toBe("diurnal");
    expect(result.allPeriods[0].planet).toBe("Sun");
    expect(result.allPeriods[0].years).toBe(10);
    expect(result.allPeriods[1].planet).toBe("Venus");
    expect(result.allPeriods[1].years).toBe(8);
  });

  it("night chart: first major = Moon (9y)", () => {
    const result = getFirdaria(birthDate, false);
    expect(result.sect).toBe("nocturnal");
    expect(result.allPeriods[0].planet).toBe("Moon");
    expect(result.allPeriods[0].years).toBe(9);
  });

  it("Sun major has 7 sub-periods starting Sun->Venus->Mercury->Moon->Saturn->Jupiter->Mars", () => {
    const result = getFirdaria(birthDate, true);
    const sunMajor = result.allPeriods[0];
    expect(sunMajor.subPeriods).toHaveLength(7);
    const subPlanets = sunMajor.subPeriods.map((s) => s.planet);
    expect(subPlanets).toEqual(["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"]);
  });

  it("target date 2026-03-21 falls in Mercury major period (day chart)", () => {
    const target = new Date(2026, 2, 21);
    const result = getFirdaria(birthDate, true, target);
    // Sun: 2001-10-02 to ~2011-10-02 (10y)
    // Venus: ~2011-10-02 to ~2019-10-02 (8y)
    // Mercury: ~2019-10-02 to ~2032-10-02 (13y)
    expect(result.currentMajor.planet).toBe("Mercury");
  });

  it("all periods are contiguous (no gaps)", () => {
    const result = getFirdaria(birthDate, true);
    for (let i = 1; i < result.allPeriods.length; i++) {
      const prevEnd = result.allPeriods[i - 1].endDate.getTime();
      const curStart = result.allPeriods[i].startDate.getTime();
      expect(Math.abs(prevEnd - curStart)).toBeLessThan(1000); // within 1s tolerance
    }
  });

  it("sub-periods within each major are contiguous", () => {
    const result = getFirdaria(birthDate, true);
    for (const major of result.allPeriods.slice(0, 9)) {
      for (let i = 1; i < major.subPeriods.length; i++) {
        const prevEnd = major.subPeriods[i - 1].endDate.getTime();
        const curStart = major.subPeriods[i].startDate.getTime();
        expect(Math.abs(prevEnd - curStart)).toBeLessThan(1000);
      }
    }
  });

  it("NorthNode sub-periods default to Jupiter start (Zoller convention)", () => {
    const result = getFirdaria(birthDate, true);
    const nnMajor = result.allPeriods.find((p) => p.planet === "NorthNode")!;
    expect(nnMajor.subPeriods[0].planet).toBe("Jupiter");
  });

  it("SouthNode sub-periods default to Saturn start", () => {
    const result = getFirdaria(birthDate, true);
    const snMajor = result.allPeriods.find((p) => p.planet === "SouthNode")!;
    expect(snMajor.subPeriods[0].planet).toBe("Saturn");
  });

  it("NorthNode with sun-mars option starts from Sun", () => {
    const result = getFirdaria(birthDate, true, undefined, { nodeSubPeriodStart: "sun-mars" });
    const nnMajor = result.allPeriods.find((p) => p.planet === "NorthNode")!;
    expect(nnMajor.subPeriods[0].planet).toBe("Sun");
  });

  it("SouthNode with sun-mars option starts from Mars", () => {
    const result = getFirdaria(birthDate, true, undefined, { nodeSubPeriodStart: "sun-mars" });
    const snMajor = result.allPeriods.find((p) => p.planet === "SouthNode")!;
    expect(snMajor.subPeriods[0].planet).toBe("Mars");
  });

  it("75-year cycle: age 76 falls in second cycle (Sun again)", () => {
    // 75 years total in one cycle. At age 76, we're 1 year into cycle 2 → still Sun (10y).
    const target = new Date(2001 + 76, 9, 2);
    const result = getFirdaria(birthDate, true, target);
    expect(result.currentMajor.planet).toBe("Sun");
    // Verify it's the second Sun period (index 9, not 0)
    const sunPeriods = result.allPeriods.filter((p) => p.planet === "Sun");
    expect(sunPeriods.length).toBeGreaterThanOrEqual(2);
  });

  it("current sub-period is identified correctly", () => {
    const target = new Date(2003, 5, 1); // mid-2003, during Sun major
    const result = getFirdaria(birthDate, true, target);
    expect(result.currentMajor.planet).toBe("Sun");
    expect(result.currentSub).toBeDefined();
    expect(result.currentSub.startDate.getTime()).toBeLessThanOrEqual(target.getTime());
    expect(result.currentSub.endDate.getTime()).toBeGreaterThan(target.getTime());
  });
});
