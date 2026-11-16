import { describe, expect, it } from "vitest";
import { derivedChartAspectPoints, getHouseOverlays, type OverlayChartLike } from "./overlays";
import { HouseSystem } from "./swisseph";

const lon = (longitude: number) => ({ longitude });

/** Chart with the given 12 cusps (house 1 first), ASC = cusp 1, MC = cusp 10. */
function chart(
  planets: Record<string, number>,
  cusps: number[] | null,
  houseSystem?: HouseSystem
): OverlayChartLike {
  return {
    planets: Object.fromEntries(Object.entries(planets).map(([k, v]) => [k, lon(v)])),
    houses: cusps
      ? {
          ascendant: lon(cusps[0]),
          mc: lon(cusps[9]),
          dc: lon((cusps[0] + 180) % 360),
          ic: lon((cusps[9] + 180) % 360),
          houses: cusps.map(lon),
        }
      : null,
    houseSystem,
  };
}

const wholeSignFromAries = Array.from({ length: 12 }, (_, i) => i * 30);
// Uneven cusps starting at 10 degrees (house i spans [cusps[i-1], cusps[i])).
const unevenCusps = [10, 35, 62, 95, 120, 148, 190, 215, 242, 275, 300, 328];

describe("getHouseOverlays", () => {
  it("places A's points in B's houses and B's points in A's houses (hand-checked)", () => {
    const a = chart({ sun: 15, moon: 100 }, wholeSignFromAries, HouseSystem.WHOLE_SIGN);
    const b = chart({ venus: 36, mars: 330 }, unevenCusps, HouseSystem.PLACIDUS);
    const o = getHouseOverlays(a, b, { includeAngles: false });
    const aInB = Object.fromEntries(o.aInB.placements.map((p) => [p.point, p.house]));
    // 15 is in [10,35) -> 1; 100 is in [95,120) -> 4
    expect(aInB).toEqual({ sun: 1, moon: 4 });
    const bInA = Object.fromEntries(o.bInA.placements.map((p) => [p.point, p.house]));
    // 36 in [30,60) -> house 2; 330 in [330,360) -> house 12
    expect(bInA).toEqual({ venus: 2, mars: 12 });
    expect(o.aInB.from).toBe("A");
    expect(o.aInB.into).toBe("B");
    expect(o.aInB.available && o.bInA.available).toBe(true);
    expect(o.aInB.houseSystem).toBe(HouseSystem.PLACIDUS);
    expect(o.bInA.houseSystem).toBe(HouseSystem.WHOLE_SIGN);
    expect(o.aInB.houseSystemSource).toBe("chart");
  });

  it("handles the 360/0 wrap and exact cusps (a point on a cusp belongs to the house starting there)", () => {
    const a = chart({ p0: 9.999999, p1: 10, p2: 327.9, p3: 328, p4: 359.99 }, wholeSignFromAries);
    const b = chart({}, unevenCusps);
    const o = getHouseOverlays(a, b, { includeAngles: false });
    const h = Object.fromEntries(o.aInB.placements.map((p) => [p.point, p.house]));
    // house 12 spans [328, 10) across the wrap
    expect(h).toEqual({ p0: 12, p1: 1, p2: 11, p3: 12, p4: 12 });
  });

  it("includes the sending chart's angles by default and can select points", () => {
    const a = chart({ sun: 15 }, wholeSignFromAries);
    const b = chart({}, unevenCusps);
    const all = getHouseOverlays(a, b);
    expect(all.aInB.placements.map((p) => p.point)).toEqual(["sun", "ascendant", "mc", "descendant", "ic"]);
    // ASC 0 -> house 12 ([328,10)); MC 270 -> house 9 ([242,275)); DSC 180 -> 6 ([148,190)); IC 90 -> 3 ([62,95))
    const m = Object.fromEntries(all.aInB.placements.map((p) => [p.point, p.house]));
    expect(m).toMatchObject({ ascendant: 12, mc: 9, descendant: 6, ic: 3 });
    const only = getHouseOverlays(a, b, { points: ["Sun", "mc", "nope"] });
    expect(only.aInB.placements.map((p) => p.point)).toEqual(["sun", "mc"]);
  });

  it("reports unavailable direction when the receiving chart has no houses, without throwing", () => {
    const timed = chart({ sun: 15 }, wholeSignFromAries);
    const untimed = chart({ sun: 200 }, null);
    const o = getHouseOverlays(timed, untimed);
    expect(o.aInB.available).toBe(false);
    expect(o.aInB.reason).toMatch(/no complete set of 12 house cusps/);
    expect(o.aInB.placements).toEqual([]);
    // untimed B's points can still be placed into A's houses (planets only: no angles exist)
    expect(o.bInA.available).toBe(true);
    expect(o.bInA.placements.map((p) => p.point)).toEqual(["sun"]);
    expect(o.bInA.placements[0].house).toBe(7); // 200 in [180,210)
    // a partial cusp list is also unavailable
    const partial = { ...timed, houses: { houses: [lon(0), lon(30)] } };
    expect(getHouseOverlays(untimed, partial).aInB.available).toBe(false);
  });

  it("notes the house system from the option when the chart does not record it", () => {
    const a = chart({ sun: 1 }, wholeSignFromAries);
    const b = chart({ sun: 1 }, wholeSignFromAries);
    const o = getHouseOverlays(a, b, { houseSystemB: HouseSystem.KOCH });
    expect(o.aInB.houseSystem).toBe(HouseSystem.KOCH);
    expect(o.aInB.houseSystemSource).toBe("option");
    expect(o.bInA.houseSystem).toBeNull();
    expect(o.bInA.houseSystemSource).toBe("unknown");
  });
});

describe("derivedChartAspectPoints", () => {
  it("extracts bodies and angles from a chart-like and from a composite-like source", () => {
    const natal = {
      planets: { sun: { longitude: 10, longitudeSpeed: 1 } },
      houses: { ascendant: { longitude: 20 }, mc: { longitude: 110 }, dc: { longitude: 200 }, ic: { longitude: 290 } },
    } as never;
    expect(derivedChartAspectPoints(natal)).toEqual({
      sun: { longitude: 10, longitudeSpeed: 1 },
      ascendant: { longitude: 20 },
      mc: { longitude: 110 },
    });
    expect(Object.keys(derivedChartAspectPoints(natal, { includeAllAngles: true }))).toContain("ic");
    expect(Object.keys(derivedChartAspectPoints(natal, { includeAngles: false }))).toEqual(["sun"]);
    const comp = {
      compositePlanets: { sun: { name: "sun", longitude: 5, zodiacPosition: {} } },
      compositeAngles: { ascendant: { longitude: 1 }, mc: { longitude: 2 }, descendant: { longitude: 3 }, ic: { longitude: 4 } },
    } as never;
    expect(derivedChartAspectPoints(comp, { includeAllAngles: true })).toEqual({
      sun: { longitude: 5 },
      ascendant: { longitude: 1 },
      mc: { longitude: 2 },
      descendant: { longitude: 3 },
      ic: { longitude: 4 },
    });
  });
});
