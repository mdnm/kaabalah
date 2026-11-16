import { describe, expect, it } from "vitest";
import { generateNumerologyTimeline, getNumerologySnapshot } from "./index";

/**
 * Inputs are limited to years <= 9998, but several nominal ends (age-cycle
 * blocks, pinnacles, life periods) are anniversaries many years later and can
 * fall past the last supported calendar year (9999). They must be reported
 * explicitly (`endExclusive: null` + `nominalEndBeyondCalendar: true`), not throw.
 */
describe("births near the end of the supported calendar", () => {
  it("snapshot for a late birth works and marks stage ends past 9999 explicitly", () => {
    const s = getNumerologySnapshot({ birth: "9990-06-15", asOf: "9995-01-01", firstName: "Ana" });
    expect(s.status).toBe("ok");
    expect(s.completedAge).toBe(4);
    expect(s.lastBirthdayYear).toBe(9994);
    expect(s.birthdayYear?.start).toBe("9994-06-15");
    expect(s.birthdayYear?.endExclusive).toBe("9995-06-15");
    // block 0 = ages 0-6 ends on the 7th birthday (9997), still inside the calendar
    expect(s.ageCycle).toMatchObject({ start: "9990-06-15", endExclusive: "9997-06-15" });
    expect(s.ageCycle?.nominalEndBeyondCalendar).toBeUndefined();
    // the first pinnacle ends at age 36 - life path (>= 27): year >= 10017
    expect(s.lifeStages?.pinnacle).toMatchObject({ index: 1, start: "9990-06-15", endExclusive: null, nominalEndExclusive: null, nominalEndBeyondCalendar: true });
    expect(s.lifeStages?.pinnacle?.lengthDays).toBeNull();
    // pinnacles 2-4 start beyond the calendar: absent from intervals, listed as unavailable
    const reasons = s.unavailable.filter((u) => u.reason === "beyond-supported-calendar").map((u) => u.field);
    expect(reasons).toEqual(expect.arrayContaining(["pinnacle.2", "pinnacle.3", "pinnacle.4", "challenge.2", "life-period.2"]));
  });

  it("an age-cycle block ending past 9999 has a null end and the flag", () => {
    const s = getNumerologySnapshot({ birth: "9990-06-15", asOf: "9997-06-15" });
    expect(s.ageCycle).toMatchObject({ absoluteIndex: 1, start: "9997-06-15", endExclusive: null, nominalEndExclusive: null, nominalEndBeyondCalendar: true, lengthDays: null });
  });

  it("timeline across the boundary keeps earlier intervals and ends the last with null", () => {
    const tl = generateNumerologyTimeline({ birth: "9990-06-15", from: "9996-01-01", toExclusive: "9998-01-01", layers: ["personal-year", "age-cycle"] });
    expect(tl.intervals.filter((i) => i.layer === "age-cycle").map((i) => [i.start, i.endExclusive])).toEqual([
      ["9990-06-15", "9997-06-15"], ["9997-06-15", null],
    ]);
    expect(tl.intervals.filter((i) => i.layer === "personal-year").map((i) => [i.start, i.endExclusive])).toEqual([
      ["9995-06-15", "9996-06-15"], ["9996-06-15", "9997-06-15"], ["9997-06-15", "9998-06-15"],
    ]);
  });

  it("a timeline of life stages for a late birth lists the unavailable spans instead of throwing", () => {
    const tl = generateNumerologyTimeline({ birth: "9990-06-15", from: "9990-06-15", toExclusive: "9998-01-01", layers: ["pinnacle", "life-period"] });
    expect(tl.intervals.map((i) => [i.layer, i.start, i.endExclusive])).toEqual([
      ["pinnacle", "9990-06-15", null], ["life-period", "9990-06-15", null],
    ]);
    expect(tl.unavailable.some((u) => u.field === "pinnacle.2" && u.reason === "beyond-supported-calendar")).toBe(true);
  });
});
