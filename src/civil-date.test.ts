import { describe, expect, it } from "vitest";
import {
  addCivilDays,
  anniversaryInYear,
  civilDate,
  civilDateFromLocalDate,
  civilDateFromOrdinal,
  civilDateToLocalNoon,
  civilDayOrdinal,
  compareCivilDates,
  completedYears,
  daysInMonth,
  diffCivilDays,
  formatCivilDate,
  isLeapYear,
  isValidCivilDate,
  parseCivilDate,
} from "./civil-date";

/** Independent day count via UTC epoch (valid for the whole 1-9999 range). */
const utcOrdinal = (y: number, m: number, d: number) => {
  const t = new Date(Date.UTC(2000, 0, 1));
  t.setUTCFullYear(y, m - 1, d);
  return Math.round(t.getTime() / 86400000);
};

describe("leap rules", () => {
  it.each([[1600, true], [1700, false], [1800, false], [1900, false], [2000, true], [2023, false], [2024, true], [2100, false], [4, true], [100, false], [400, true], [1, false], [9999, false]])(
    "isLeapYear(%i) = %s",
    (year, expected) => {
      expect(isLeapYear(year)).toBe(expected);
      expect(daysInMonth(year, 2)).toBe(expected ? 29 : 28);
    }
  );

  it("month lengths", () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => daysInMonth(2023, m))).toEqual([31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]);
  });
});

describe("validation and parsing", () => {
  it.each(["2001-02-30", "2026-04-31", "2025-02-29", "1900-02-29", "2001-00-10", "2001-13-01", "2001-01-00", "2001-01-32", "0000-01-01", "10000-01-01", "2001-1-1", "2001/01/01", " 2001-01-01", "2001-01-01T00:00", ""])(
    "rejects %j",
    (text) => {
      expect(parseCivilDate(text)).toBeNull();
    }
  );

  it.each(["2000-02-29", "2024-02-29", "0001-01-01", "9999-12-31", "0099-12-31", "1999-12-31"])("accepts %s and round-trips", (text) => {
    const parsed = parseCivilDate(text)!;
    expect(parsed).not.toBeNull();
    expect(formatCivilDate(parsed)).toBe(text);
  });

  it("isValidCivilDate rejects non-integers, out-of-range years and non-objects", () => {
    expect(isValidCivilDate({ year: 2001, month: 2, day: 30 })).toBe(false);
    expect(isValidCivilDate({ year: 2001.5, month: 2, day: 3 })).toBe(false);
    expect(isValidCivilDate({ year: 0, month: 1, day: 1 })).toBe(false);
    expect(isValidCivilDate({ year: 10000, month: 1, day: 1 })).toBe(false);
    expect(isValidCivilDate(null)).toBe(false);
    expect(isValidCivilDate("2001-01-01")).toBe(false);
    expect(isValidCivilDate({ year: 2001, month: 2 })).toBe(false);
  });

  it("civilDate throws RangeError on impossible dates", () => {
    expect(() => civilDate(2001, 2, 30)).toThrow(RangeError);
    expect(civilDate(2000, 2, 29)).toEqual({ year: 2000, month: 2, day: 29 });
  });
});

describe("ordinals", () => {
  it("anchors: 1970-01-01 is 0, 2000-03-01 follows the leap day", () => {
    expect(civilDayOrdinal({ year: 1970, month: 1, day: 1 })).toBe(0);
    expect(civilDayOrdinal({ year: 1969, month: 12, day: 31 })).toBe(-1);
    expect(civilDayOrdinal({ year: 2000, month: 3, day: 1 }) - civilDayOrdinal({ year: 2000, month: 2, day: 29 })).toBe(1);
    expect(civilDayOrdinal({ year: 1900, month: 3, day: 1 }) - civilDayOrdinal({ year: 1900, month: 2, day: 28 })).toBe(1);
  });

  it("matches an independent UTC calculation across the whole range and round-trips", () => {
    // every day for several spans plus year 1 and 9999 boundaries
    const spans: [number, number][] = [[1, 3], [97, 105], [399, 403], [1580, 1604], [1895, 1905], [1999, 2005], [2095, 2105], [9995, 9999]];
    let checked = 0;
    for (const [from, to] of spans) {
      for (let y = from; y <= to; y++) {
        for (let m = 1; m <= 12; m++) {
          for (let d = 1; d <= daysInMonth(y, m); d++) {
            const date = { year: y, month: m, day: d };
            const ord = civilDayOrdinal(date);
            expect(ord).toBe(utcOrdinal(y, m, d));
            expect(civilDateFromOrdinal(ord)).toEqual(date);
            checked++;
          }
        }
      }
    }
    expect(checked).toBeGreaterThan(5000);
    // strided sweep over every year
    for (let y = 1; y <= 9999; y += 7) {
      const date = { year: y, month: (y % 12) + 1, day: 1 };
      expect(civilDateFromOrdinal(civilDayOrdinal(date))).toEqual(date);
    }
  });

  it("consecutive ordinals are consecutive calendar days", () => {
    let prev = civilDayOrdinal({ year: 1999, month: 1, day: 1 });
    for (let ord = prev + 1; ord < prev + 4000; ord++) {
      const a = civilDateFromOrdinal(ord - 1);
      const b = civilDateFromOrdinal(ord);
      expect(compareCivilDates(a, b)).toBe(-1);
      expect(diffCivilDays(a, b)).toBe(1);
    }
  });

  it("addCivilDays/diffCivilDays across month, year and leap boundaries", () => {
    expect(addCivilDays({ year: 2023, month: 12, day: 31 }, 1)).toEqual({ year: 2024, month: 1, day: 1 });
    expect(addCivilDays({ year: 2024, month: 2, day: 28 }, 1)).toEqual({ year: 2024, month: 2, day: 29 });
    expect(addCivilDays({ year: 2023, month: 2, day: 28 }, 1)).toEqual({ year: 2023, month: 3, day: 1 });
    expect(addCivilDays({ year: 2024, month: 3, day: 1 }, -1)).toEqual({ year: 2024, month: 2, day: 29 });
    expect(diffCivilDays({ year: 2024, month: 1, day: 1 }, { year: 2025, month: 1, day: 1 })).toBe(366);
    expect(diffCivilDays({ year: 2023, month: 1, day: 1 }, { year: 2024, month: 1, day: 1 })).toBe(365);
    expect(addCivilDays({ year: 1, month: 1, day: 1 }, 365)).toEqual({ year: 2, month: 1, day: 1 });
    expect(addCivilDays({ year: 9999, month: 12, day: 30 }, 1)).toEqual({ year: 9999, month: 12, day: 31 });
  });
});

describe("legacy Date bridge", () => {
  it("reads local calendar parts and builds local-noon dates for years 1-99", () => {
    const d = civilDateToLocalNoon({ year: 50, month: 6, day: 15 });
    expect(d.getFullYear()).toBe(50);
    expect(d.getMonth()).toBe(5);
    expect(d.getDate()).toBe(15);
    expect(d.getHours()).toBe(12);
    expect(civilDateFromLocalDate(d)).toEqual({ year: 50, month: 6, day: 15 });
    const one = civilDateToLocalNoon({ year: 1, month: 1, day: 1 });
    expect(civilDateFromLocalDate(one)).toEqual({ year: 1, month: 1, day: 1 });
    const late = civilDateToLocalNoon({ year: 9999, month: 12, day: 31 });
    expect(civilDateFromLocalDate(late)).toEqual({ year: 9999, month: 12, day: 31 });
  });
});

describe("completed years and anniversaries", () => {
  const birth = { year: 2001, month: 10, day: 5 };
  it("day before, on and after a birthday", () => {
    expect(completedYears(birth, { year: 2026, month: 10, day: 1 })).toBe(24);
    expect(completedYears(birth, { year: 2026, month: 10, day: 5 })).toBe(25);
    expect(completedYears(birth, { year: 2026, month: 10, day: 6 })).toBe(25);
    expect(completedYears(birth, { year: 2026, month: 9, day: 30 })).toBe(24);
    expect(completedYears(birth, { year: 2027, month: 1, day: 1 })).toBe(25);
  });

  it("29 February: completes on 1 March in common years, on the day in leap years", () => {
    const leap = { year: 2000, month: 2, day: 29 };
    expect(completedYears(leap, { year: 2001, month: 2, day: 28 })).toBe(0);
    expect(completedYears(leap, { year: 2001, month: 3, day: 1 })).toBe(1);
    expect(completedYears(leap, { year: 2004, month: 2, day: 28 })).toBe(3);
    expect(completedYears(leap, { year: 2004, month: 2, day: 29 })).toBe(4);
    expect(anniversaryInYear(leap, 2001)).toEqual({ year: 2001, month: 3, day: 1 });
    expect(anniversaryInYear(leap, 2004)).toEqual({ year: 2004, month: 2, day: 29 });
    expect(anniversaryInYear(leap, 2100)).toEqual({ year: 2100, month: 3, day: 1 });
    expect(anniversaryInYear(leap, 2400)).toEqual({ year: 2400, month: 2, day: 29 });
    expect(anniversaryInYear(birth, 2030)).toEqual({ year: 2030, month: 10, day: 5 });
  });

  it("anniversary is consistent with completed years for every day of a leap-day birth", () => {
    const leap = { year: 1996, month: 2, day: 29 };
    for (let year = 1997; year < 2010; year++) {
      const anniv = anniversaryInYear(leap, year);
      expect(completedYears(leap, anniv)).toBe(year - 1996);
      expect(completedYears(leap, addCivilDays(anniv, -1))).toBe(year - 1996 - 1);
    }
  });
});
