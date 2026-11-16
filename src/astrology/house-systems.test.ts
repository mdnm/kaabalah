import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getHousesForSystems } from "./house-systems";
import { getBirthChart } from "./index";
import { closeSwissEph, getSwissEph, HouseSystem } from "./swisseph";

const input = {
  date: { year: 2000, month: 1, day: 15, hour: 9, minute: 20 },
  latitude: -23.55,
  longitude: -46.63,
  timeZoneSettings: { timeZone: "America/Sao_Paulo" },
};
const systems = [HouseSystem.PLACIDUS, HouseSystem.WHOLE_SIGN, HouseSystem.EQUAL, HouseSystem.KOCH];
const circ = (a: number, b: number) => Math.abs((((a - b) % 360) + 540) % 360 - 180);

describe("getHousesForSystems", () => {
  beforeAll(async () => {
    await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
  });
  afterAll(() => closeSwissEph());

  it("returns every requested system from one set of positions, sect and lots", async () => {
    const r = await getHousesForSystems(input, systems);
    expect(Object.keys(r.systems).sort()).toEqual([...systems].sort());
    expect(r.failures).toEqual([]);
    // Ascendant identical in all systems; lots computed once from it
    const ascs = Object.values(r.systems).map((s) => s!.ascendant);
    for (const a of ascs) expect(circ(a, ascs[0])).toBeLessThan(1e-9);
    // Invariant of the lots: Fortune + Spirit = 2*ASC (mod 360)
    expect(circ(r.lots.fortune + r.lots.spirit, 2 * ascs[0])).toBeLessThan(1e-9);
  });

  it("whole-sign cusps are sign boundaries starting at the Ascendant's sign; equal cusps are ASC + 30k", async () => {
    const r = await getHousesForSystems(input, systems);
    const whole = r.systems[HouseSystem.WHOLE_SIGN]!;
    const firstSign = Math.floor(whole.ascendant / 30);
    whole.cusps.forEach((c, i) => expect(circ(c, ((firstSign + i) % 12) * 30)).toBeLessThan(1e-9));
    const equal = r.systems[HouseSystem.EQUAL]!;
    equal.cusps.forEach((c, i) => expect(circ(c, equal.ascendant + 30 * i)).toBeLessThan(1e-9));
  });

  it("placements match getBirthChart for each system; sect and lots do not change with the system", async () => {
    const r = await getHousesForSystems(input, systems);
    for (const system of [HouseSystem.PLACIDUS, HouseSystem.WHOLE_SIGN]) {
      const chart = await getBirthChart({ ...input, houseSystem: system });
      const placements = r.systems[system]!.placements;
      expect(placements.sun).toBe(chart.planets.sun.zodiacPosition.house);
      expect(placements.moon).toBe(chart.planets.moon.zodiacPosition.house);
      expect(placements.saturn).toBe(chart.planets.saturn.zodiacPosition.house);
      expect(placements["lot-fortune"]).toBe(chart.lots.fortunePosition.house);
      expect(r.sect.sect).toBe(chart.sect);
      expect(circ(r.lots.fortune, chart.lots.fortune)).toBeLessThan(1e-9);
      expect(circ(r.lots.spirit, chart.lots.spirit)).toBeLessThan(1e-9);
    }
    // Whole-sign and Placidus place at least one planet differently in this chart or all equal;
    // either way every placement is a valid house number.
    for (const s of Object.values(r.systems)) {
      for (const h of Object.values(s!.placements)) expect(h).toBeGreaterThanOrEqual(1), expect(h).toBeLessThanOrEqual(12);
    }
  });

  it("accepts a Julian day and deduplicates systems; rejects an empty list", async () => {
    const a = await getHousesForSystems(input, [HouseSystem.PLACIDUS, HouseSystem.PLACIDUS]);
    expect(Object.keys(a.systems)).toEqual([HouseSystem.PLACIDUS]);
    const b = await getHousesForSystems(
      { julianDayUt: a.julianDayUt, latitude: input.latitude, longitude: input.longitude },
      [HouseSystem.PLACIDUS]
    );
    expect(b.systems[HouseSystem.PLACIDUS]!.cusps).toEqual(a.systems[HouseSystem.PLACIDUS]!.cusps);
    await expect(getHousesForSystems(input, [])).rejects.toThrow();
  });
});
