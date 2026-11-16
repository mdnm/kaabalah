import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getBirthChart } from "./index";
import { computeAspects } from "./aspects";
import { computeAspectsWithPolicy, PTOLEMAIC_PLUS_QUINCUNX } from "./orb-policy";
import {
  getChartPoints,
  isPointId,
  legacyKeyFromPointId,
  POINT_DEFINITIONS,
  POINT_IDS,
  pointIdFromLegacyKey,
  toLegacyPointRecord,
} from "./points";
import { closeSwissEph, getSwissEph, HouseSystem } from "./swisseph";

describe("typed chart points over a real chart", () => {
  let chart: Awaited<ReturnType<typeof getBirthChart>>;
  beforeAll(async () => {
    await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
    chart = await getBirthChart({
      date: { year: 1990, month: 6, day: 15, hour: 14, minute: 30 },
      latitude: 51.5,
      longitude: -0.12,
      houseSystem: HouseSystem.PLACIDUS,
      timeZoneSettings: { timeZone: "Europe/London" },
    });
  });
  afterAll(() => closeSwissEph());

  it("every stable ID is produced and round-trips id <-> legacy key", () => {
    const pts = getChartPoints(chart);
    expect(pts.map((p) => p.id).sort()).toEqual([...POINT_IDS].sort());
    for (const id of POINT_IDS) {
      expect(isPointId(id)).toBe(true);
      expect(pointIdFromLegacyKey(legacyKeyFromPointId(id))).toBe(id);
    }
    expect(pointIdFromLegacyKey("Mean_Node")).toBe("mean-node");
    expect(pointIdFromLegacyKey("not a point")).toBeNull();
  });

  it("longitudes equal the legacy dictionaries; legacy dictionaries are not mutated", () => {
    const before = JSON.stringify(chart);
    const pts = getChartPoints(chart);
    const byId = Object.fromEntries(pts.map((p) => [p.id, p]));
    for (const [key, planet] of Object.entries(chart.planets)) {
      const id = pointIdFromLegacyKey(key)!;
      expect(id, key).not.toBeNull();
      expect(byId[id].longitude).toBeCloseTo(planet.longitude, 10);
      expect(byId[id].speed).toBe(planet.longitudeSpeed ?? null);
    }
    expect(byId.asc.longitude).toBeCloseTo(chart.houses.ascendant.longitude, 10);
    expect(byId.mc.longitude).toBeCloseTo(chart.houses.mc.longitude, 10);
    expect(byId.dsc.longitude).toBeCloseTo(chart.houses.dc.longitude, 10);
    expect(byId.ic.longitude).toBeCloseTo(chart.houses.ic.longitude, 10);
    expect(byId.vertex.longitude).toBeCloseTo(chart.houses.ascmc!.vertex!.longitude, 10);
    expect(byId["lot-fortune"].longitude).toBeCloseTo(chart.lots.fortune, 10);
    expect(byId["lot-spirit"].longitude).toBeCloseTo(chart.lots.spirit, 10);
    expect(JSON.stringify(chart)).toBe(before);
  });

  it("speed is null for angles and lots; south nodes mirror the north node", () => {
    const byId = Object.fromEntries(getChartPoints(chart).map((p) => [p.id, p]));
    for (const id of ["asc", "mc", "dsc", "ic", "vertex", "lot-fortune", "lot-spirit"] as const) {
      expect(byId[id].speed).toBeNull();
    }
    expect(typeof byId.sun.speed).toBe("number");
    const diff = (((byId["south-node-true"].longitude - byId["true-node"].longitude) % 360) + 360) % 360;
    expect(diff).toBeCloseTo(180, 10);
    expect(byId["south-node-mean"].speed).toBe(byId["mean-node"].speed);
    expect(byId["south-node-mean"].flags.derived).toBe(true);
  });

  it("kinds follow the definition table and selection options work", () => {
    expect(POINT_DEFINITIONS.sun.kind).toBe("luminary");
    expect(POINT_DEFINITIONS.chiron.kind).toBe("point");
    expect(getChartPoints(chart, { classes: ["luminary"] }).map((p) => p.id).sort()).toEqual(["moon", "sun"]);
    expect(getChartPoints(chart, { include: ["sun", "moon", "mars"], exclude: ["moon"] }).map((p) => p.id)).toEqual([
      "sun",
      "mars",
    ]);
  });

  it("policy aspects over real points are within their limits, and legacy aspects are untouched", () => {
    const r = computeAspectsWithPolicy(getChartPoints(chart), PTOLEMAIC_PLUS_QUINCUNX);
    expect(r.edges.length).toBeGreaterThan(0);
    for (const e of r.edges) expect(e.orb).toBeLessThanOrEqual(e.orbLimit + 1e-9);
    expect(r.counts.grouped).toBeLessThanOrEqual(r.counts.raw);
    // adapter output feeds the legacy function unchanged
    const legacy = computeAspects(toLegacyPointRecord(getChartPoints(chart, { classes: ["luminary", "planet"] })));
    expect(legacy.length).toBeGreaterThan(0);
  });
});
