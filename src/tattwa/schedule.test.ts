import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { closeSwissEph, getSwissEph } from "../astrology/swisseph";
import { calculateTattwaSchedule, getTattwaSchedule } from "./schedule";

const utc = (value: string) => new Date(value);

describe("Tatwameter fixed periods", () => {
  it("reproduces the Barcelona sequence and rolls from Apas to Akash after two hours", () => {
    const sunrise = utc("2024-02-24T06:34:00Z");
    const result = calculateTattwaSchedule(sunrise, utc("2024-02-25T06:34:00Z"), utc("2024-02-24T07:22:00Z"));
    expect(result.periods).toHaveLength(60);
    expect(result.periods.slice(0, 6).map(({ tattwa, start }) => [tattwa, start.toISOString().slice(11, 16)])).toEqual([
      ["akash", "06:34"], ["vayu", "06:58"], ["tejas", "07:22"], ["prithvi", "07:46"], ["apas", "08:10"], ["akash", "08:34"],
    ]);
    expect(result.current.tattwa).toBe("tejas");
  });

  it("clips the last period to the next sunrise and assigns the boundary to the next schedule", () => {
    const sunrise = utc("2024-02-24T06:34:00Z");
    const nextSunrise = utc("2024-02-25T06:32:00Z");
    const result = calculateTattwaSchedule(sunrise, nextSunrise, utc("2024-02-25T06:31:59Z"));
    expect(result.current).toEqual({ tattwa: "apas", start: utc("2024-02-25T06:10:00Z"), end: nextSunrise });
    expect(() => calculateTattwaSchedule(sunrise, nextSunrise, nextSunrise)).toThrow(RangeError);
    expect(calculateTattwaSchedule(nextSunrise, utc("2024-02-26T06:30:00Z")).current.tattwa).toBe("akash");
  });
});

describe("Tatwameter at a location", () => {
  beforeAll(() => getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH }));
  afterAll(() => closeSwissEph());

  it("uses the previous sunrise before dawn and reports unavailable polar dates", async () => {
    const date = utc("2024-04-08T09:00:00Z");
    const normal = await getTattwaSchedule({ date, latitude: 32.78, longitude: -96.8 });
    expect(normal.available).toBe(true);
    if (!normal.available) throw new Error("Expected consecutive sunrises");
    expect(normal.sunrise.toISOString().slice(0, 10)).toBe("2024-04-07");
    expect(normal.nextSunrise.toISOString().slice(0, 10)).toBe("2024-04-08");
    expect(normal.current.start.getTime()).toBeLessThanOrEqual(date.getTime());
    expect(normal.current.end.getTime()).toBeGreaterThan(date.getTime());
    expect(await getTattwaSchedule({ date: utc("2024-06-21T12:00:00Z"), latitude: 90, longitude: 0 })).toMatchObject({
      available: false, reason: "no-consecutive-sunrises",
    });
  });
});
