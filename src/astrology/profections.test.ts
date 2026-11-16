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
  const birthDate = new Date(2001, 9, 12); // Oct 12, 2001

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
  const birthDate = new Date(2001, 9, 12); // Oct 12, 2001

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

import {
  getAnnualProfectionTimeline,
  getProfectionForAge,
  MAX_PROFECTION_TIMELINE_YEARS,
} from "./profections";
import { TimelineError } from "./firdaria";

describe("Annual profection timeline", () => {
  const chart = mockChart("Aries");
  const birth = { year: 2001, month: 10, day: 12 };
  const ymd = (d: { year: number; month: number; day: number }) => `${d.year}-${d.month}-${d.day}`;

  it("one entry per profection year with contiguous half-open birthday boundaries", () => {
    const { entries } = getAnnualProfectionTimeline(chart, birth, { fromAge: 0, toAge: 24 });
    expect(entries).toHaveLength(25);
    expect(ymd(entries[0].start)).toBe("2001-10-12");
    expect(ymd(entries[1].start)).toBe("2002-10-12");
    for (let i = 0; i < entries.length - 1; i++) {
      expect(entries[i].endExclusive).toEqual(entries[i + 1].start);
    }
    expect(entries.map((e) => e.house).slice(0, 13)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1]);
    expect(entries[12].sign).toBe("Aries"); // wraps after 12 years
    expect(entries[13]).toMatchObject({ age: 13, house: 2, sign: "Taurus", ruler: "Venus" });
    expect(entries[24].house).toBe(1);
  });

  it("agrees with getAnnualProfection for a whole-sign chart and counts from the ascendant sign", () => {
    const c = mockChart("Libra");
    for (const age of [0, 5, 11, 12, 30, 49]) {
      const t = getProfectionForAge(c, age);
      const legacy = getAnnualProfection(c, new Date(2001, 9, 12), 2001 + age);
      expect({ house: t.house, sign: t.sign, ruler: t.ruler }).toEqual({
        house: legacy.house,
        sign: legacy.sign,
        ruler: legacy.ruler,
      });
    }
  });

  it("date range selects the years overlapping it (just before / on / after a birthday)", () => {
    const day = (y: number, m: number, d: number) => ({ year: y, month: m, day: d });
    const before = getAnnualProfectionTimeline(chart, birth, { from: day(2020, 10, 11), to: day(2020, 10, 11) });
    expect(before.entries.map((e) => e.age)).toEqual([18]);
    const on = getAnnualProfectionTimeline(chart, birth, { from: day(2020, 10, 12), to: day(2020, 10, 12) });
    expect(on.entries.map((e) => e.age)).toEqual([19]);
    const span = getAnnualProfectionTimeline(chart, birth, { from: day(2020, 10, 11), to: day(2020, 10, 13) });
    expect(span.entries.map((e) => e.age)).toEqual([18, 19]);
    // Date inputs use local calendar getters (local noon convention)
    const viaDate = getAnnualProfectionTimeline(chart, new Date(2001, 9, 12, 12), {
      from: new Date(2020, 9, 12, 12),
      to: new Date(2020, 9, 12, 12),
    });
    expect(viaDate.entries.map((e) => e.age)).toEqual([19]);
    // a range before birth is clamped to age 0
    const early = getAnnualProfectionTimeline(chart, birth, { from: day(1990, 1, 1), to: day(2001, 10, 12) });
    expect(early.entries.map((e) => e.age)).toEqual([0]);
  });

  it("29 February births roll to 1 March in non-leap years", () => {
    const leap = { year: 2000, month: 2, day: 29 };
    const { entries } = getAnnualProfectionTimeline(chart, leap, { fromAge: 0, toAge: 4 });
    expect(entries.map((e) => ymd(e.start))).toEqual([
      "2000-2-29",
      "2001-3-1",
      "2002-3-1",
      "2003-3-1",
      "2004-2-29",
    ]);
    expect(ymd(entries[3].endExclusive)).toBe("2004-2-29");
    const r = getAnnualProfectionTimeline(chart, leap, {
      from: { year: 2001, month: 2, day: 28 },
      to: { year: 2001, month: 3, day: 1 },
    });
    expect(r.entries.map((e) => e.age)).toEqual([0, 1]);
  });

  it("is bounded: caps and typed errors", () => {
    const code = (fn: () => unknown) => {
      try {
        fn();
      } catch (e) {
        expect(e).toBeInstanceOf(TimelineError);
        return (e as TimelineError).code;
      }
      return null;
    };
    expect(code(() => getAnnualProfectionTimeline(chart, birth, { fromAge: 0, toAge: MAX_PROFECTION_TIMELINE_YEARS }))).toBe(
      "RANGE_TOO_LARGE"
    );
    expect(getAnnualProfectionTimeline(chart, birth, { fromAge: 0, toAge: MAX_PROFECTION_TIMELINE_YEARS - 1 }).entries).toHaveLength(
      MAX_PROFECTION_TIMELINE_YEARS
    );
    expect(code(() => getAnnualProfectionTimeline(chart, birth, { fromAge: 0, toAge: Infinity }))).toBe("UNBOUNDED_INPUT");
    expect(code(() => getAnnualProfectionTimeline(chart, birth, { fromAge: 5, toAge: 2 }))).toBe("INVALID_RANGE");
    expect(
      code(() => getAnnualProfectionTimeline(chart, birth, { from: { year: 2020, month: 1, day: 2 }, to: { year: 2020, month: 1, day: 1 } }))
    ).toBe("INVALID_RANGE");
    expect(code(() => getAnnualProfectionTimeline(chart, { year: 2001, month: 2, day: 30 }, { fromAge: 0, toAge: 1 }))).toBe("INVALID_INPUT");
    expect(code(() => getProfectionForAge(chart, -1))).toBe("INVALID_INPUT");
    const untimed = { ...chart, houses: { ...chart.houses, ascendant: { ...chart.houses.ascendant, sign: "" } } } as BirthChart;
    expect(code(() => getProfectionForAge(untimed, 3))).toBe("UNAVAILABLE_INPUT");
  });
});
