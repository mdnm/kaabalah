import { describe, expect, it } from "vitest";
import { getAnnualProfection, getMonthlyProfections } from "./profections";
import type { BirthChart } from "./index";

// Mock whole-sign chart with Aries rising
function mockChart(ascSign: string = "Aries"): BirthChart {
  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
  ];
  const startIdx = signs.indexOf(ascSign);
  const houses = Array.from({ length: 12 }, (_, i) => ({
    sign: signs[(startIdx + i) % 12],
    decimalDegrees: 0,
    traditionalFormat: "0°00'",
    decimal: "0.00°",
    longitude: ((startIdx + i) % 12) * 30,
    house: i + 1,
  }));

  return {
    dateUtc: new Date(),
    planets: {} as any,
    nodes: {} as any,
    houses: {
      ascendant: houses[0],
      mc: houses[9],
      dc: houses[6],
      ic: houses[3],
      houses,
    },
    aspects: [],
    sect: "diurnal",
  } as BirthChart;
}

describe("Annual Profections", () => {
  const chart = mockChart("Aries");
  const birthDate = new Date(2001, 9, 2); // Oct 2, 2001

  it("age 0 = house 1 (Aries)", () => {
    const result = getAnnualProfection(chart, birthDate, 2001);
    expect(result.age).toBe(0);
    expect(result.house).toBe(1);
    expect(result.sign).toBe("Aries");
    expect(result.ruler).toBe("Mars");
  });

  it("age 1 = house 2 (Taurus)", () => {
    const result = getAnnualProfection(chart, birthDate, 2002);
    expect(result.house).toBe(2);
    expect(result.sign).toBe("Taurus");
    expect(result.ruler).toBe("Venus");
  });

  it("age 12 = house 1 again (cycle repeats)", () => {
    const result = getAnnualProfection(chart, birthDate, 2013);
    expect(result.age).toBe(12);
    expect(result.house).toBe(1);
    expect(result.sign).toBe("Aries");
  });

  it("age 24 = house 1 (Aries) for target year 2025", () => {
    const result = getAnnualProfection(chart, birthDate, 2025);
    expect(result.age).toBe(24);
    expect(result.house).toBe(1);
    expect(result.sign).toBe("Aries");
  });

  it("age 5 = house 6 (Virgo) with Mercury ruler", () => {
    const result = getAnnualProfection(chart, birthDate, 2006);
    expect(result.house).toBe(6);
    expect(result.sign).toBe("Virgo");
    expect(result.ruler).toBe("Mercury");
  });

  it("works with non-Aries rising (Leo)", () => {
    const leoChart = mockChart("Leo");
    const result = getAnnualProfection(leoChart, birthDate, 2001);
    expect(result.house).toBe(1);
    expect(result.sign).toBe("Leo");
    expect(result.ruler).toBe("Sun");
  });
});

describe("Monthly Profections", () => {
  const chart = mockChart("Aries");
  const birthDate = new Date(2001, 9, 2); // Oct 2, 2001

  it("returns 12 months", () => {
    const result = getMonthlyProfections(chart, birthDate, 2025);
    expect(result.months).toHaveLength(12);
  });

  it("month 1 matches the annual profection sign", () => {
    const result = getMonthlyProfections(chart, birthDate, 2025);
    expect(result.months[0].month).toBe(1);
    expect(result.months[0].sign).toBe(result.annualProfection.sign);
  });

  it("signs advance correctly each month", () => {
    const result = getMonthlyProfections(chart, birthDate, 2025);
    const signs = [
      "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
      "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
    ];
    const startIdx = signs.indexOf(result.annualProfection.sign);
    for (let i = 0; i < 12; i++) {
      expect(result.months[i].sign).toBe(signs[(startIdx + i) % 12]);
    }
  });

  it("each month has a ruler", () => {
    const result = getMonthlyProfections(chart, birthDate, 2025);
    for (const m of result.months) {
      expect(m.ruler).toBeDefined();
      expect(typeof m.ruler).toBe("string");
    }
  });

  it("handles Feb 29 birthday edge case", () => {
    const leapBirth = new Date(2000, 1, 29); // Feb 29
    const leapChart = mockChart("Aries");
    const result = getMonthlyProfections(leapChart, leapBirth, 2025);
    expect(result.months).toHaveLength(12);
    // Each month should have a valid date
    for (const m of result.months) {
      expect(m.startDate).toBeInstanceOf(Date);
      expect(isNaN(m.startDate.getTime())).toBe(false);
    }
  });

  it("throws for target year before birth year", () => {
    const birth = new Date(2000, 0, 1);
    const chart = mockChart("Aries");
    expect(() => getAnnualProfection(chart, birth, 1999)).toThrow(
      /before birth year/
    );
  });

  it("throws for monthly profections with pre-birth year", () => {
    const birth = new Date(2000, 0, 1);
    const chart = mockChart("Aries");
    expect(() => getMonthlyProfections(chart, birth, 1995)).toThrow(
      /before birth year/
    );
  });
});
