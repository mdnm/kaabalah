import { describe, expect, it } from "vitest";
import {
  calculateMayaNatal,
  calculateMayaRelationship,
  calculateMayaTiming,
  getMayaCalendarBoard,
  getMayaCalendarDay,
  getMayaHaabDate,
  getTzolkinCycle,
  getTzolkinDay,
  getTzolkinTrecena,
  type TzolkinDay,
} from "./index";

const signAndTone = ({ sign, tone }: TzolkinDay) => [sign, tone] as const;

describe("Maya Haab dates", () => {
  it.each([
    ["1977-03-02", "Pop", 0, 0],
    ["1977-11-17", "Kankin", 0, 260],
    ["2011-02-16", "Cumku", 19, 359],
    ["2011-02-17", "Uayeb", 0, 360],
    ["2011-02-21", "Uayeb", 4, 364],
    ["2011-02-22", "Pop", 0, 0],
  ] as const)("places %s in the Momostenango Haab", (date, month, day, dayOfYear) => {
    const haab = getMayaHaabDate(date);
    expect(haab).toEqual({ count: "momostenango", month, day, dayOfYear, daysInMonth: month === "Uayeb" ? 5 : 20 });
    const calendar = getMayaCalendarDay(date);
    expect(calendar.haab).toEqual(haab);
    expect(calendar.yearLord.daysSinceStart).toBe(dayOfYear);
  });

  it("preserves the different Momostenango and Classic GMT anchors", () => {
    expect(getMayaHaabDate("2012-12-21")).toMatchObject({ month: "Pax", day: 3 });
    expect(getMayaHaabDate("2012-12-21", "classic-gmt")).toMatchObject({ month: "Kankin", day: 3 });
    expect(getMayaHaabDate("2000-01-01", "classic-gmt")).toMatchObject({ month: "Kankin", day: 10 });
    expect(getMayaHaabDate("1963-09-10", "classic-gmt")).toMatchObject({ month: "Mol", day: 8 });
  });
});

describe("Johnson's Tzolk'in Calendar Board", () => {
  it.each([
    ["1961-08-09", "etznab", 1],
    ["1961-08-18", "manik", 10],
    ["1961-08-22", "chuen", 1],
    ["2012-12-20", "cauac", 3],
    ["2012-12-21", "ahau", 4],
    ["2012-12-22", "imix", 5],
  ] as const)("calculates the day sign and tone of %s", (date, sign, tone) => {
    expect(signAndTone(getTzolkinDay(date))).toEqual([sign, tone]);
  });

  it("advances both counters through all 260 unique pairs in chronological order", () => {
    const board = getTzolkinCycle();
    expect(board).toHaveLength(260);
    expect(board[0]).toMatchObject({ sign: "chuen", tone: 8, position: 1 });
    expect(board[259]).toMatchObject({ sign: "oc", tone: 7, position: 260 });
    expect(new Set(board.map(({ sign, tone }) => `${sign}:${tone}`)).size).toBe(260);

    const signs = [
      "chuen", "eb", "ben", "ix", "men", "cib", "caban", "etznab", "cauac", "ahau",
      "imix", "ik", "akbal", "kan", "chicchan", "cimi", "manik", "lamat", "muluc", "oc",
    ];
    const directions = ["east", "west", "north", "south"];
    board.forEach((day, index) => {
      expect(day).toMatchObject({
        sign: signs[index % 20],
        direction: directions[index % 4],
        tone: (index + 7) % 13 + 1,
        position: index + 1,
      });
      const opener = board[(index - day.tone + 1 + 260) % 260];
      expect(getTzolkinTrecena(day)).toEqual(opener);
      expect(opener.tone).toBe(1);
    });
  });

  it("reconstructs the Johnson board as twenty sign rows by thirteen columns", () => {
    const board = getMayaCalendarBoard("1961-08-18");
    const cycle = getTzolkinCycle();
    expect(board.rows).toHaveLength(20);
    board.rows.forEach((row, rowIndex) => {
      expect(row).toHaveLength(13);
      row.forEach((day, columnIndex) => expect(day).toEqual(cycle[columnIndex * 20 + rowIndex]));
    });
    expect(board.active).toEqual({ date: "1961-08-18", day: board.rows[16][11] });
    expect(getMayaCalendarBoard().active).toBeNull();
  });

  it("decodes a standalone day with its trecena and Year Lord", () => {
    const result = getMayaCalendarDay("2010-02-22");
    expect(signAndTone(result.day)).toEqual(["manik", 11]);
    expect(signAndTone(result.trecena)).toEqual(["caban", 1]);
    expect(result.yearLord).toEqual({ day: result.day, daysSinceStart: 0 });
  });

  it("accepts civil dates and advances on Gregorian leap day", () => {
    expect(signAndTone(getTzolkinDay("2000-02-28"))).toEqual(["ahau", 4]);
    expect(signAndTone(getTzolkinDay({ year: 2000, month: 2, day: 29 }))).toEqual(["imix", 5]);
    expect(signAndTone(getTzolkinDay("2000-03-01"))).toEqual(["ik", 6]);
  });

  it("handles both ends of the supported civil date range", () => {
    expect(signAndTone(getTzolkinDay("0001-01-01"))).toEqual(["akbal", 11]);
    expect(signAndTone(getTzolkinDay("9999-12-31"))).toEqual(["imix", 5]);
  });

  it.each(["0000-01-01", "10000-01-01", "1900-02-29", "2026-02-30", "2012-12-21T23:00:00Z"])(
    "rejects %s as a civil date",
    date => expect(() => getTzolkinDay(date)).toThrow(RangeError),
  );
});

describe("Johnson's natal chart", () => {
  it("places the nine signs in the printed 1926 chart and follows the chronological serpent", () => {
    const { tree, featheredSerpent } = calculateMayaNatal("1926-06-01");
    expect(Object.values(tree).map(row => Object.values(row).map(point => signAndTone(point.day)))).toEqual([
      [["chuen", 4], ["caban", 10], ["akbal", 3]],
      [["cauac", 12], ["chicchan", 5], ["chuen", 11]],
      [["manik", 7], ["ben", 13], ["cauac", 6]],
    ]);
    expect(featheredSerpent.map(point => [point.position, point.offsetDays])).toEqual([
      ["youth.right", -14], ["youth.center", -8], ["adult.right", -6], ["youth.left", -2],
      ["adult.center", 0], ["mature.right", 2], ["adult.left", 6], ["mature.center", 8], ["mature.left", 14],
    ]);
  });

  it("changes Momostenango's Year Lord on the first day of the next 365-day year", () => {
    expect(calculateMayaNatal("2010-02-22").yearLord).toMatchObject({
      day: { sign: "manik", tone: 11 }, daysSinceStart: 0,
    });
    expect(calculateMayaNatal("2011-02-21").yearLord).toMatchObject({
      day: { sign: "manik", tone: 11 }, daysSinceStart: 364,
    });
    expect(calculateMayaNatal("2011-02-22").yearLord).toMatchObject({
      day: { sign: "eb", tone: 12 }, daysSinceStart: 0,
    });
    expect(calculateMayaNatal("2029-02-17").yearLord).toMatchObject({
      day: { sign: "ik", tone: 4 }, daysSinceStart: 0,
    });
  });
});

describe("Johnson's relationship cross", () => {
  it.each([
    ["1914-11-25", [["ix", 3], ["cimi", 8], ["lamat", 10], ["ahau", 9], ["ik", 11]]],
    ["1915-11-17", [["chuen", 9], ["akbal", 1], ["chicchan", 3], ["caban", 2], ["cauac", 4]]],
  ] as const)("reproduces the printed relationship cross with %s", (second, expected) => {
    const { cross } = calculateMayaRelationship("1926-06-01", second);
    const { core, conception, rightHand, leftHand, destiny } = cross;
    expect([core, conception, rightHand, leftHand, destiny].map(signAndTone)).toEqual(expected);
    expect(calculateMayaRelationship(second, "1926-06-01").cross).toEqual(cross);
  });

  it("tracks Year Lord families independently from direction", () => {
    // Chicchan and Ahau share family V. Chicchan and Imix are both North.
    expect(calculateMayaRelationship("1926-06-01", "2012-12-21")).toMatchObject({
      sameDirection: false, sameYearLordFamily: true,
    });
    expect(calculateMayaRelationship("1926-06-01", "1952-04-21")).toMatchObject({
      sameDirection: true, sameYearLordFamily: false,
    });
  });

  it("matches the four signs in the published natal comparison, with positions for each person", () => {
    const first = "1926-06-01";
    const second = "1915-11-17";
    const { natalOverlap } = calculateMayaRelationship(first, second);
    expect(natalOverlap).toEqual({
      first: [
        { sign: "chuen", compositeRole: "core", natalRole: "leftHand" },
        { sign: "chicchan", compositeRole: "rightHand", natalRole: "core" },
        { sign: "caban", compositeRole: "leftHand", natalRole: "conception" },
        { sign: "cauac", compositeRole: "destiny", natalRole: "rightHand" },
      ],
      second: [],
    });
    expect(calculateMayaRelationship(second, first).natalOverlap).toEqual({
      first: natalOverlap.second,
      second: natalOverlap.first,
    });
  });
});

describe("Johnson's timing", () => {
  it("calculates the nine printed personal lunar month visits and the complete 29-day window", () => {
    const { dates } = calculateMayaTiming("1952-04-21", { from: "2010-08-20", days: 31 });
    expect(dates[0].personalLunarMonth).toBeNull();
    expect(dates[30].personalLunarMonth).toBeNull();
    expect(dates.slice(1, 30).map(date => date.personalLunarMonth?.dayNumber))
      .toEqual(Array.from({ length: 29 }, (_, i) => i + 1));
    expect(dates[1].personalLunarMonth).toMatchObject({ lengthDays: 29 });
    expect(dates[2].personalLunarMonth).toMatchObject({ dayNumber: 2, point: null });

    const visits = dates.filter(date => date.personalLunarMonth?.point);
    expect(visits.map(({ date, day, personalLunarMonth }) => [date, ...signAndTone(day), personalLunarMonth?.point]))
      .toEqual([
        ["2010-08-21", "manik", 9, "youth.right"],
        ["2010-08-27", "ben", 2, "youth.center"],
        ["2010-08-29", "men", 4, "adult.right"],
        ["2010-09-02", "cauac", 8, "youth.left"],
        ["2010-09-04", "imix", 10, "adult.center"],
        ["2010-09-06", "akbal", 12, "mature.right"],
        ["2010-09-10", "manik", 3, "adult.left"],
        ["2010-09-12", "muluc", 5, "mature.center"],
        ["2010-09-18", "men", 11, "mature.left"],
      ]);
    expect(visits[0].matches.treeSigns).toEqual(["youth.right", "adult.left"]);
    expect(visits[4].matches).toMatchObject({ natalTone: true, treeDay: "adult.center" });
  });

  it("returns all 260 consecutive days and starts the next personal lunar month after one cycle", () => {
    const birth = "1952-04-21";
    const { dates } = calculateMayaTiming(birth, { from: "2010-08-21", days: 260 });
    expect(dates).toHaveLength(260);
    expect(new Set(dates.map(({ day }) => day.position)).size).toBe(260);
    expect(dates.filter(date => date.personalLunarMonth)).toHaveLength(29);
    expect(dates[259]).toMatchObject({ date: "2011-05-07", personalLunarMonth: null });
    const [next] = calculateMayaTiming(birth, { from: "2011-05-08" }).dates;
    expect(next.day).toEqual(dates[0].day);
    expect(next.personalLunarMonth).toEqual(dates[0].personalLunarMonth);
  });

  it("keeps counting the personal lunar month across the Calendar Board boundary", () => {
    const { dates } = calculateMayaTiming("2012-12-21", { from: "2013-08-28", days: 2 });
    expect(dates.map(({ day, personalLunarMonth }) => [day.position, personalLunarMonth?.dayNumber]))
      .toEqual([[260, 5], [1, 6]]);
  });

  it.each([
    ["1952-05-31", 25, "youth", 1, 0, 26],
    ["1952-06-01", 26, "adult", 1, 26, 52],
    ["1978-05-31", 51, "adult", 1, 26, 52],
    ["1978-06-01", 52, "mature", 1, 52, 78],
    ["2004-05-31", 77, "mature", 1, 52, 78],
    ["2004-06-01", 78, "youth", 2, 78, 104],
  ] as const)("selects the Road of Life row on %s", (date, age, stage, cycle, fromAge, toAgeExclusive) => {
    const [day] = calculateMayaTiming("1926-06-01", { from: date }).dates;
    expect(day.roadOfLife).toMatchObject({ age, stage, cycle, fromAge, toAgeExclusive });
    expect(day.roadOfLife.row.center.position).toBe(`${stage}.center`);
  });

  it("moves a leap-day birth into a new age row on March 1 in a common year", () => {
    const { dates } = calculateMayaTiming("2000-02-29", { from: "2026-02-28", days: 2 });
    expect(dates.map(day => [day.roadOfLife.age, day.roadOfLife.stage])).toEqual([[25, "youth"], [26, "adult"]]);
  });

  it("rejects dates before birth, ranges past year 9999 and invalid lengths", () => {
    expect(() => calculateMayaTiming("1926-06-01", { from: "1926-05-31" })).toThrow(RangeError);
    expect(calculateMayaTiming("9999-12-31", { from: "9999-12-31" }).dates).toHaveLength(1);
    expect(() => calculateMayaTiming("9999-12-31", { from: "9999-12-31", days: 2 })).toThrow(RangeError);
    for (const days of [0, 1.5, 261]) {
      expect(() => calculateMayaTiming("1926-06-01", { from: "1926-06-01", days })).toThrow(RangeError);
    }
  });
});
