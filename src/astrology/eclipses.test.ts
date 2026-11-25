import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { findEclipses, getSwissEph } from "./index";
import { closeSwissEph } from "./swisseph";

describe("findEclipses", () => {
  beforeAll(async () => {
    await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
  });
  afterAll(() => closeSwissEph());

  it("matches NASA's 2026 eclipse dates, types and maxima", () => {
    // https://eclipse.gsfc.nasa.gov/OH/OH2026.html (UT to the nearest minute)
    const { eclipses } = findEclipses({ start: new Date("2026-01-01"), end: new Date("2027-01-01") });
    expect(eclipses.map(({ kind, type, sign }) => [kind, type, sign])).toEqual([
      ["solar", "annular", "Aquarius"],
      ["lunar", "total", "Virgo"],
      ["solar", "total", "Leo"],
      ["lunar", "partial", "Pisces"],
    ]);
    const maxima = ["2026-02-17T12:12Z", "2026-03-03T11:34Z", "2026-08-12T17:46Z", "2026-08-28T04:13Z"];
    eclipses.forEach((event, index) => {
      expect(Math.abs(event.instant.getTime() - Date.parse(maxima[index]))).toBeLessThan(60_000);
      expect(event.longitude).toBe(event.kind === "solar" ? event.sunLongitude : event.moonLongitude);
      expect(event.signDegree).toBeGreaterThanOrEqual(0);
      expect(event.signDegree).toBeLessThan(30);
    });
  });

  it("includes hybrid and penumbral eclipses", () => {
    const { eclipses } = findEclipses({ start: new Date("2023-04-01"), end: new Date("2023-06-01") });
    expect(eclipses.map(({ instant, kind, type }) => [instant.toISOString().slice(0, 10), kind, type])).toEqual([
      ["2023-04-20", "solar", "hybrid"],
      ["2023-05-05", "lunar", "penumbral"],
    ]);
  });

  it("partitions adjoining windows at an eclipse maximum", () => {
    const start = new Date("2024-04-01");
    const end = new Date("2024-05-01");
    const { eclipses } = findEclipses({ start, end });
    expect(eclipses).toHaveLength(1);
    const maximum = eclipses[0].instant;
    expect(findEclipses({ start, end: maximum }).eclipses).toEqual([]);
    expect(findEclipses({ start: maximum, end }).eclipses).toEqual(eclipses);
    expect(findEclipses({ start: maximum, end: maximum }).eclipses).toEqual([]);
    expect(findEclipses({ start: new Date(maximum.getTime() + 1), end }).eclipses).toEqual([]);
  });

  it("rejects invalid and excessive windows", () => {
    const start = new Date("2026-01-01");
    expect(() => findEclipses({ start, end: new Date(NaN) })).toThrow(expect.objectContaining({ code: "UNBOUNDED_INPUT" }));
    expect(() => findEclipses({ start, end: new Date("2025-01-01") })).toThrow(expect.objectContaining({ code: "INVALID_RANGE" }));
    expect(() => findEclipses({ start, end: new Date("2200-01-01") })).toThrow(expect.objectContaining({ code: "RANGE_TOO_LARGE" }));
  });
});
