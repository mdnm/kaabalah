import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { closeSwissEph, getSwissEph } from "../astrology/swisseph";
import { calculateMayaBirthCycles } from "./birth-cycles";

describe("Maya birth-time cycles", () => {
  beforeAll(() => getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH }));
  afterAll(() => closeSwissEph());

  it.each([
    ["2024-04-02T03:15:00Z", "waning"],
    ["2024-04-08T18:21:00Z", "new"],
    ["2024-04-15T19:13:00Z", "waxing"],
    ["2024-04-23T23:49:00Z", "full"],
  ])("classifies the published lunation instant %s as %s", async (iso, phase) => {
    const { lunar, solar } = await calculateMayaBirthCycles({ instant: new Date(iso) });
    expect(lunar.phase).toBe(phase);
    expect(solar).toBeNull();
  });

  it("classifies both sides of each station in a solar day that crosses UTC midnight", async () => {
    const location = { latitude: 32.78, longitude: -96.80 };
    const calculate = (instant: Date) => calculateMayaBirthCycles({ instant, location });
    const { solar } = await calculate(new Date("2024-04-08T18:21:00Z"));
    if (!solar?.available) throw new Error("Expected all solar stations");
    expect(solar.sunset.toISOString().slice(0, 10)).toBe("2024-04-09");
    for (const [boundary, before, after] of [
      [solar.midnight, "sunset-to-midnight", "midnight-to-dawn"],
      [solar.dawn, "midnight-to-dawn", "dawn-to-noon"],
      [solar.noon, "dawn-to-noon", "noon-to-sunset"],
      [solar.sunset, "noon-to-sunset", "sunset-to-midnight"],
      [solar.nextMidnight, "sunset-to-midnight", "midnight-to-dawn"],
    ] as const) {
      expect((await calculate(new Date(boundary.getTime() - 1_000))).solar).toMatchObject({ quarter: before });
      expect((await calculate(new Date(boundary.getTime() + 1_000))).solar).toMatchObject({ quarter: after });
    }
  });

  it("retains the lunar calculation when polar conditions omit a solar station", async () => {
    const { solar, lunar } = await calculateMayaBirthCycles({
      instant: new Date("2024-06-21T12:00:00Z"), location: { latitude: 90, longitude: 0 },
    });
    expect(solar).toEqual({ available: false, reason: "incomplete-solar-day" });
    expect(lunar.phase).toBe("full");
  });
});
