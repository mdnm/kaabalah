import { afterEach, describe, expect, it, vi } from "vitest";

import { buildBirthDate, parseChartInput, parseDate, parseUtcNoonDate, validateDateString } from "./validation";
import type { Flags } from "./types";

const flags: Flags = { json: true, compact: true };

afterEach(() => {
  vi.restoreAllMocks();
});

describe("date validation", () => {
  it("parses date-only CLI input at local noon", () => {
    const date = parseDate("1990-01-15", flags);

    expect(date.getFullYear()).toBe(1990);
    expect(date.getMonth()).toBe(0);
    expect(date.getDate()).toBe(15);
    expect(date.getHours()).toBe(12);
  });

  it("keeps UTC-noon parsing available for ISO-date consumers", () => {
    expect(parseUtcNoonDate("1990-01-15", flags).toISOString()).toBe("1990-01-15T12:00:00.000Z");
  });

  it("exits with an invalid-date error for malformed dates", () => {
    const stdout = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    const exit = vi.spyOn(process, "exit").mockImplementation((() => {
      throw new Error("process.exit");
    }) as typeof process.exit);

    expect(() => validateDateString("1990-1-15", flags)).toThrow("process.exit");

    expect(exit).toHaveBeenCalledWith(1);
    expect(stdout).toHaveBeenCalledWith(expect.stringContaining('"code":"INVALID_DATE"'));
  });

  function expectInvalidDate(run: () => unknown, pattern?: string) {
    const stdout = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    const exit = vi.spyOn(process, "exit").mockImplementation((() => {
      throw new Error("process.exit");
    }) as typeof process.exit);
    expect(run).toThrow("process.exit");
    expect(exit).toHaveBeenCalledWith(1);
    expect(stdout).toHaveBeenCalledWith(expect.stringContaining('"code":"INVALID_DATE"'));
    if (pattern) expect(stdout).toHaveBeenCalledWith(expect.stringContaining(pattern));
    vi.restoreAllMocks();
  }

  it.each(["2001-02-30", "2026-04-31", "2026-02-29", "2026-02-31", "1900-02-29", "2026-13-01", "2026-00-10", "2026-01-00", "2026-01-32"])(
    "rejects the impossible calendar date %s in every date entry point",
    (value) => {
      expectInvalidDate(() => validateDateString(value, flags));
      expectInvalidDate(() => parseDate(value, flags));
      expectInvalidDate(() => parseUtcNoonDate(value, flags));
      expectInvalidDate(() => parseChartInput({ date: value, lat: 0, lon: 0 }, "natal", flags));
    }
  );

  it("says the date does not exist in the calendar", () => {
    expectInvalidDate(() => parseDate("2026-02-30", flags), "does not exist in the calendar");
  });

  it("accepts leap days only in leap years", () => {
    expect(parseDate("2000-02-29", flags).getDate()).toBe(29);
    expect(parseDate("2024-02-29", flags).getMonth()).toBe(1);
    expectInvalidDate(() => parseDate("1900-02-29", flags));
  });

  it.each([
    ["0001-01-01", 1, 0, 1],
    ["0050-06-15", 50, 5, 15],
    ["0099-12-31", 99, 11, 31],
    ["9999-12-31", 9999, 11, 31],
  ])("keeps the full year for %s at local noon", (value, year, month, day) => {
    const date = parseDate(value, flags);
    expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([year, month, day, 12]);
    expect(parseUtcNoonDate(value, flags).toISOString().slice(0, 10)).toBe(value);
  });

  it("builds birth dates with the full year for years 0001-0099", () => {
    const date = buildBirthDate("0050-03-04", 7, 30);
    expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()]).toEqual([50, 2, 4, 7, 30]);
    const chart = parseChartInput({ date: "0099-12-31", time: "23:59", lat: 0, lon: 0 }, "natal", flags);
    expect(chart.birthDate.getFullYear()).toBe(99);
  });
});
