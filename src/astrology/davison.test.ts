import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { geographicMidpoint, getDavisonChart, getDavisonChartFromOptions } from "./davison";
import { getBirthChart, getCompositeFromCharts, HouseSystem } from "./index";
import { calculateBodyAtJulianDay, CalcFlag, closeSwissEph, getSwissEph, Planet } from "./swisseph";

const angDiff = (a: number, b: number) => {
  const d = Math.abs((((a - b) % 360) + 360) % 360);
  return d > 180 ? 360 - d : d;
};

describe("geographicMidpoint (pure)", () => {
  it("arithmetic latitude and shorter-arc longitude", () => {
    expect(geographicMidpoint({ latitude: 10, longitude: 20 }, { latitude: 30, longitude: 60 })).toMatchObject({
      latitude: 20,
      longitude: 40,
    });
  });

  it("crosses the antimeridian along the shorter arc, symmetric in A/B", () => {
    const ab = geographicMidpoint({ latitude: 10, longitude: 179 }, { latitude: -30, longitude: -179 });
    const ba = geographicMidpoint({ latitude: -30, longitude: -179 }, { latitude: 10, longitude: 179 });
    expect(ab.longitude).toBe(180);
    expect(ba.longitude).toBe(180);
    expect(ab.latitude).toBe(-10);
    const c = geographicMidpoint({ latitude: 0, longitude: 170 }, { latitude: 0, longitude: -160 });
    expect(c.longitude).toBeCloseTo(-175, 12); // arc 170 -> 200 (= -160), midpoint 185 = -175
    expect(c.notices).toEqual([]);
  });

  it("exactly antipodal longitudes: symmetric result plus a notice", () => {
    const ab = geographicMidpoint({ latitude: 0, longitude: 0 }, { latitude: 20, longitude: 180 });
    const ba = geographicMidpoint({ latitude: 20, longitude: 180 }, { latitude: 0, longitude: 0 });
    expect(ab.longitude).toBe(ba.longitude);
    expect(ab.notices[0].type).toBe("antipodal_longitudes");
    expect(Math.abs(ab.longitude)).toBe(90); // arithmetic mean of 0 and -180 -> -90
  });

  it("great-circle option: independent hand value and antipodal fallback", () => {
    const g = geographicMidpoint({ latitude: 60, longitude: 0 }, { latitude: 60, longitude: 90 }, "great-circle");
    // unit vectors (.5,0,.866) and (0,.5,.866): sum (.5,.5,1.732), norm 1.8708 -> lat asin(.92582)=67.79
    expect(g.longitude).toBeCloseTo(45, 9);
    expect(g.latitude).toBeCloseTo(67.7923, 3);
    const arithmetic = geographicMidpoint({ latitude: 60, longitude: 0 }, { latitude: 60, longitude: 90 });
    expect(arithmetic.latitude).toBe(60);
    const anti = geographicMidpoint({ latitude: 30, longitude: 10 }, { latitude: -30, longitude: -170 }, "great-circle");
    expect(anti.notices[0].type).toBe("antipodal_places");
  });

  it("rejects invalid coordinates", () => {
    expect(() => geographicMidpoint({ latitude: 91, longitude: 0 }, { latitude: 0, longitude: 0 })).toThrow(/latitude/);
    expect(() => geographicMidpoint({ latitude: NaN, longitude: 0 }, { latitude: 0, longitude: 0 })).toThrow();
  });
});

describe("Davison chart", () => {
  beforeAll(async () => {
    await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
  });
  afterAll(() => closeSwissEph());

  const a = { dateUtc: new Date(Date.UTC(1980, 0, 1, 0, 0, 0)), latitude: 40, longitude: -74 };
  const b = { dateUtc: new Date(Date.UTC(1980, 7, 1, 12, 0, 0)), latitude: -20, longitude: 30 };

  it("is cast at the exact UTC midpoint instant and the geographic midpoint", () => {
    const d = getDavisonChart({ a, b });
    expect(d.midpointDateUtc.getTime()).toBe((a.dateUtc.getTime() + b.dateUtc.getTime()) / 2);
    expect(d.chart.dateUtc.getTime()).toBe(d.midpointDateUtc.getTime());
    expect(d.location).toEqual({ latitude: 10, longitude: -22 });
    // sun position equals a direct ephemeris call at the exact midpoint JD
    const sun = calculateBodyAtJulianDay(d.midpointJd, Planet.SUN, CalcFlag.SWISS_EPH | CalcFlag.SPEED);
    expect(d.chart.planets.sun.longitude).toBeCloseTo(sun.longitude, 9);
    expect(d.chart.houseSystem).toBe(HouseSystem.PLACIDUS);
    expect(d.method.name).toBe("davison");
    expect(d.method.geographicMidpoint).toBe("arithmetic-shorter-arc");
    expect(d.method.distinctFromComposite).toMatch(/different methods/);
  });

  it("keeps sub-second precision (odd millisecond difference)", () => {
    const x = { ...a, dateUtc: new Date(Date.UTC(2001, 4, 5, 6, 7, 8, 1)) };
    const y = { ...a, dateUtc: new Date(Date.UTC(2001, 4, 5, 6, 7, 8, 500)) };
    const d = getDavisonChart({ a: x, b: y });
    const jdX = x.dateUtc.getTime() / 86400000 + 2440587.5;
    const jdY = y.dateUtc.getTime() / 86400000 + 2440587.5;
    expect(d.midpointJd).toBe((jdX + jdY) / 2);
  });

  it("differs from the midpoint composite for a synthetic pair (distinct methods)", async () => {
    const opts = (p: typeof a) => ({
      date: p.dateUtc,
      latitude: p.latitude,
      longitude: p.longitude,
      houseSystem: HouseSystem.PLACIDUS,
      timeZoneSettings: { treatAsUTC: true },
    });
    const [ca, cb] = await Promise.all([getBirthChart(opts(a)), getBirthChart(opts(b))]);
    const composite = getCompositeFromCharts(ca, cb);
    const d = getDavisonChart({ a, b });
    // Sun 1 Jan ~280 deg and 1 Aug ~129 deg: composite midpoint ~205, Davison (1 Mar-ish) ~ 341
    expect(angDiff(d.chart.planets.sun.longitude, composite.compositePlanets.sun.longitude)).toBeGreaterThan(5);
  });

  it("great-circle option moves the place but not the instant", () => {
    const d1 = getDavisonChart({ a, b });
    const d2 = getDavisonChart({ a, b, geographicMidpoint: "great-circle" });
    expect(d2.midpointJd).toBe(d1.midpointJd);
    expect(d2.method.geographicMidpoint).toBe("great-circle");
    expect(d2.location.latitude).not.toBeCloseTo(d1.location.latitude, 3);
  });

  it("antimeridian pair casts the chart at 180", () => {
    const d = getDavisonChart({
      a: { dateUtc: a.dateUtc, latitude: 0, longitude: 179 },
      b: { dateUtc: b.dateUtc, latitude: 0, longitude: -179 },
    });
    expect(d.location.longitude).toBe(180);
  });

  it("local date-times resolve to UTC first (options variant)", async () => {
    const d = await getDavisonChartFromOptions(
      { date: new Date(Date.UTC(2000, 0, 1, 0)), latitude: 10, longitude: 10, timeZoneSettings: { treatAsUTC: true } },
      { date: new Date(Date.UTC(2000, 0, 3, 0)), latitude: 20, longitude: 30, timeZoneSettings: { treatAsUTC: true } }
    );
    expect(d.midpointDateUtc.toISOString()).toBe("2000-01-02T00:00:00.000Z");
    expect(d.location).toEqual({ latitude: 15, longitude: 20 });
  });
});
