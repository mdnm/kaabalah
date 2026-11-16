import { describe, expect, it } from "vitest";
import { getFirdaria } from "./firdaria";

describe("Firdaria", () => {
  const birthDate = new Date(1990, 5, 15); // Jun 15, 1990

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

  it("target date 2026-03-21 falls in Moon major period (day chart)", () => {
    const target = new Date(2026, 2, 21);
    const result = getFirdaria(birthDate, true, target);
    // Sun: 1990-06-15 to ~2000-06-15 (10y)
    // Venus: ~2000-06-15 to ~2008-06-15 (8y)
    // Mercury: ~2008-06-15 to ~2021-06-15 (13y)
    // Moon: ~2021-06-15 to ~2030-06-15 (9y)
    expect(result.currentMajor.planet).toBe("Moon");
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
    const target = new Date(1990 + 76, 5, 15);
    const result = getFirdaria(birthDate, true, target);
    expect(result.currentMajor.planet).toBe("Sun");
    // Verify it's the second Sun period (index 9, not 0)
    const sunPeriods = result.allPeriods.filter((p) => p.planet === "Sun");
    expect(sunPeriods.length).toBeGreaterThanOrEqual(2);
  });

  it("current sub-period is identified correctly", () => {
    const target = new Date(1995, 5, 1); // mid-1995, during Sun major (1990-2000)
    const result = getFirdaria(birthDate, true, target);
    expect(result.currentMajor.planet).toBe("Sun");
    expect(result.currentSub).toBeDefined();
    expect(result.currentSub.startDate.getTime()).toBeLessThanOrEqual(target.getTime());
    expect(result.currentSub.endDate.getTime()).toBeGreaterThan(target.getTime());
  });
});

import {
  FIRDARIA_CYCLE_YEARS,
  getFirdariaPeriods,
  getFirdariaTimeline,
  MAX_FIRDARIA_WINDOW_YEARS,
  TimelineError,
} from "./firdaria";

describe("Firdaria timeline", () => {
  const birth = new Date(Date.UTC(1990, 5, 15, 12));
  const YEAR_MS = 365.25 * 86_400_000;

  it("major durations sum to 75 years for day and night; sequences start Sun / Moon", () => {
    for (const diurnal of [true, false]) {
      const periods = getFirdariaPeriods(birth, diurnal);
      expect(periods).toHaveLength(9);
      expect(periods.reduce((s, p) => s + p.years, 0)).toBe(FIRDARIA_CYCLE_YEARS);
      expect(periods[0].planet).toBe(diurnal ? "Sun" : "Moon");
      expect(periods[8].endDate.getTime() - birth.getTime()).toBeCloseTo(75 * YEAR_MS, -1);
    }
    const day = getFirdariaTimeline(birth, true, { to: new Date(birth.getTime() + 80 * YEAR_MS) });
    const night = getFirdariaTimeline(birth, false, { to: new Date(birth.getTime() + 80 * YEAR_MS) });
    expect(day.entries[0].planet).toBe("Sun");
    expect(night.entries[0].planet).toBe("Moon");
    expect(day.entries.slice(0, 9).map((e) => e.years)).toEqual([10, 8, 13, 9, 11, 12, 7, 3, 2]);
    expect(night.entries.slice(0, 9).map((e) => e.years)).toEqual([9, 11, 12, 7, 3, 2, 10, 8, 13]);
    expect(day.method.sequence).toMatch(/Sun/);
  });

  it("half-open intervals are contiguous at every level and the cycle repeats after 75 years", () => {
    const t = getFirdariaTimeline(birth, true, { to: new Date(birth.getTime() + 160 * YEAR_MS) });
    expect(t.entries).toHaveLength(19); // 160 years = two full cycles (18 majors) + the third cycle's 10-year Sun
    for (let i = 0; i < t.entries.length - 1; i++) {
      expect(t.entries[i].endExclusive.getTime()).toBe(t.entries[i + 1].start.getTime());
    }
    for (const e of t.entries) {
      expect(e.subPeriods).toHaveLength(7);
      expect(e.subPeriods[0].start.getTime()).toBe(e.start.getTime());
      expect(e.subPeriods[6].endExclusive.getTime()).toBe(e.endExclusive.getTime());
      for (let i = 0; i < 6; i++) {
        expect(e.subPeriods[i].endExclusive.getTime()).toBe(e.subPeriods[i + 1].start.getTime());
      }
    }
    expect(t.entries[9].planet).toBe("Sun");
    expect(t.entries[9].cycle).toBe(1);
  });

  it("matches getFirdaria's periods and clips to the window with nominal ends kept", () => {
    const legacy = getFirdaria(birth, true, new Date(birth.getTime() + 20 * YEAR_MS));
    const from = new Date(birth.getTime() + 5 * YEAR_MS);
    const to = new Date(birth.getTime() + 20 * YEAR_MS);
    const t = getFirdariaTimeline(birth, true, { from, to });
    expect(t.window).toEqual({ from, toExclusive: to });
    expect(t.entries.map((e) => e.planet)).toEqual(["Sun", "Venus", "Mercury"]);
    const first = t.entries[0];
    expect(first.start).toEqual(from);
    expect(first.clippedStart).toBe(true);
    expect(first.clippedEnd).toBe(false);
    expect(first.nominalStart).toEqual(legacy.allPeriods[0].startDate);
    expect(first.nominalEnd).toEqual(legacy.allPeriods[0].endDate);
    const last = t.entries[2];
    expect(last.endExclusive).toEqual(to);
    expect(last.clippedEnd).toBe(true);
    // sub-periods are clipped too: the Sun major's 7 subs of ~1.43y, window starts at 5y -> first sub kept is the 4th
    expect(first.subPeriods[0].clippedStart).toBe(true);
    expect(first.subPeriods.map((s) => s.planet)).toEqual(["Moon", "Saturn", "Jupiter", "Mars"]);
    expect(t.entries[1].subPeriods.map((s) => s.planet)).toEqual(
      legacy.allPeriods[1].subPeriods.map((s) => s.planet)
    );
    // an exact boundary instant belongs to the later period
    const boundary = legacy.allPeriods[0].endDate;
    const around = getFirdariaTimeline(birth, true, { from: boundary, to: new Date(boundary.getTime() + 1000) });
    expect(around.entries.map((e) => e.planet)).toEqual(["Venus"]);
    // can omit sub periods
    expect(getFirdariaTimeline(birth, true, { from, to, includeSubPeriods: false }).entries[0].subPeriods).toEqual([]);
  });

  it("node sub-period convention is passed through", () => {
    const t = getFirdariaTimeline(birth, true, {
      from: new Date(birth.getTime() + 70.5 * YEAR_MS),
      to: new Date(birth.getTime() + 72.5 * YEAR_MS),
      nodeSubPeriodStart: "sun-mars",
    });
    expect(t.entries[0].planet).toBe("NorthNode");
    // window starts 0.5y into the 3y node period: the 2nd of 7 subs (~0.43y each); Sun-first order is Sun, Venus, ...
    expect(t.entries[0].subPeriods[0].planet).toBe("Venus");
    const dflt = getFirdariaTimeline(birth, true, {
      from: new Date(birth.getTime() + 70.5 * YEAR_MS),
      to: new Date(birth.getTime() + 72.5 * YEAR_MS),
    });
    expect(dflt.entries[0].subPeriods[0].planet).toBe("Mars"); // Jupiter-first order: Jupiter, Mars, ...
  });

  it("is bounded with typed errors", () => {
    const code = (fn: () => unknown) => {
      try {
        fn();
      } catch (e) {
        expect(e).toBeInstanceOf(TimelineError);
        return (e as TimelineError).code;
      }
      return null;
    };
    expect(code(() => getFirdariaTimeline(birth, true, {} as never))).toBe("UNBOUNDED_INPUT");
    expect(code(() => getFirdariaTimeline(birth, true, { to: new Date(NaN) }))).toBe("UNBOUNDED_INPUT");
    expect(code(() => getFirdariaTimeline(birth, true, { from: birth, to: birth }))).toBe("INVALID_RANGE");
    expect(
      code(() => getFirdariaTimeline(birth, true, { to: new Date(birth.getTime() + (MAX_FIRDARIA_WINDOW_YEARS + 1) * YEAR_MS) }))
    ).toBe("RANGE_TOO_LARGE");
    // window length ok but reaching past three cycles from birth
    expect(
      code(() =>
        getFirdariaTimeline(birth, true, {
          from: new Date(birth.getTime() + 200 * YEAR_MS),
          to: new Date(birth.getTime() + 230 * YEAR_MS),
        })
      )
    ).toBe("RANGE_TOO_LARGE");
    expect(code(() => getFirdariaPeriods(birth, true, 4))).toBe("RANGE_TOO_LARGE");
    expect(code(() => getFirdariaPeriods(new Date(NaN), true))).toBe("INVALID_INPUT");
  });
});
