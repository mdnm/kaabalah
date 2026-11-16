import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { VirtualNodes } from "../../wasm/src/swisseph";
import { getBirthChart, HouseSystem } from "./index";
import { computeSect, getSectFromAltitude } from "./sect";
import { closeSwissEph, getSwissEph } from "./swisseph";

const utc = (iso: string, houseSystem: HouseSystem) => ({
  date: new Date(iso),
  latitude: 20,
  longitude: 0,
  houseSystem,
  timeZoneSettings: { treatAsUTC: true },
});

const norm = (x: number) => ((x % 360) + 360) % 360;

/** Independent low-precision Sun altitude (Meeus-style), degrees. */
function lowPrecisionSunAltitude(iso: string, lat: number, lon: number, eclLon: number): number {
  const rad = Math.PI / 180;
  const jd = new Date(iso).getTime() / 86400000 + 2440587.5;
  const eps = 23.4393 * rad;
  const lam = eclLon * rad;
  const ra = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam));
  const dec = Math.asin(Math.sin(eps) * Math.sin(lam));
  const gmst = norm(280.46061837 + 360.98564736629 * (jd - 2451545.0));
  const H = (gmst + lon) * rad - ra;
  return (
    Math.asin(Math.sin(lat * rad) * Math.sin(dec) + Math.cos(lat * rad) * Math.cos(dec) * Math.cos(H)) / rad
  );
}

describe("sect from the physical horizon", () => {
  beforeAll(async () => {
    await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
  });
  afterAll(() => closeSwissEph());

  it("repro 2000-01-01T07:00Z lat 20 lon 0: same sect and Fortune in Placidus and whole-sign", async () => {
    const placidus = await getBirthChart(utc("2000-01-01T07:00:00Z", HouseSystem.PLACIDUS));
    const whole = await getBirthChart(utc("2000-01-01T07:00:00Z", HouseSystem.WHOLE_SIGN));

    expect(placidus.sect).toBe("diurnal");
    expect(whole.sect).toBe("diurnal");
    // physically correct (Sun ~0.9 degrees above the horizon): day Fortune
    expect(placidus.nodes[VirtualNodes.PARS_FORTUNAE].longitude).toBeCloseTo(225.912416, 5);
    expect(whole.nodes[VirtualNodes.PARS_FORTUNAE].longitude).toBeCloseTo(225.912416, 5);
    expect(whole.lots.fortune).toBeCloseTo(225.912416, 5);
    // the legacy whole-sign wrong value (night formula) must not appear
    expect(Math.abs(whole.nodes[VirtualNodes.PARS_FORTUNAE].longitude - 344.593489)).toBeGreaterThan(1);
  });

  it("matches an independent low-precision solar altitude", async () => {
    const chart = await getBirthChart(utc("2000-01-01T07:00:00Z", HouseSystem.PLACIDUS));
    const alt = lowPrecisionSunAltitude("2000-01-01T07:00:00Z", 20, 0, chart.planets.sun.longitude);
    expect(chart.sectDetails.sunGeometricAltitude).toBeGreaterThan(0);
    expect(chart.sectDetails.sunGeometricAltitude).toBeCloseTo(alt, 0);
    expect(Math.abs(chart.sectDetails.sunGeometricAltitude - alt)).toBeLessThan(0.15);
    expect(chart.sectDetails.method.exactHorizon).toBe("nocturnal");
    expect(chart.sectDetails.method.basis).toBe("geometric");
  });

  it("night chart: night formulas for both lots, same in both house systems", async () => {
    const iso = "2000-01-01T19:00:00Z";
    for (const hs of [HouseSystem.PLACIDUS, HouseSystem.WHOLE_SIGN]) {
      const c = await getBirthChart(utc(iso, hs));
      expect(c.sect).toBe("nocturnal");
      const asc = c.houses.ascendant.longitude;
      const sun = c.planets.sun.longitude;
      const moon = c.planets.moon.longitude;
      expect(c.lots.fortune).toBeCloseTo(norm(asc + sun - moon), 9);
      expect(c.lots.spirit).toBeCloseTo(norm(asc + moon - sun), 9);
      expect(c.nodes[VirtualNodes.PARS_FORTUNAE].longitude).toBeCloseTo(c.lots.fortune, 9);
    }
  });

  it("day chart: day formulas for both lots", async () => {
    const c = await getBirthChart(utc("2000-01-01T12:00:00Z", HouseSystem.WHOLE_SIGN));
    expect(c.sect).toBe("diurnal");
    const asc = c.houses.ascendant.longitude;
    const sun = c.planets.sun.longitude;
    const moon = c.planets.moon.longitude;
    expect(c.lots.fortune).toBeCloseTo(norm(asc + moon - sun), 9);
    expect(c.lots.spirit).toBeCloseTo(norm(asc + sun - moon), 9);
    expect(c.lots.method.sectUsed).toBe("diurnal");
  });

  it("apparent basis differs from geometric just below the horizon", () => {
    const sun = { longitude: 280.0, latitude: 0, distance: 0.983 };
    let found = false;
    for (let m = 0; m < 120 && !found; m++) {
      const d = new Date(Date.UTC(2000, 0, 1, 6, 0, 0) + m * 60000);
      const geo = computeSect(d, 20, 0, sun);
      if (geo.sunGeometricAltitude > -0.4 && geo.sunGeometricAltitude < -0.05) {
        const app = computeSect(d, 20, 0, sun, { basis: "apparent" });
        expect(geo.sect).toBe("nocturnal");
        expect(app.sunApparentAltitude).toBeGreaterThan(geo.sunGeometricAltitude);
        expect(app.altitudeUsed).toBe(app.sunApparentAltitude);
        expect(app.sect).toBe("diurnal");
        expect(app.method.basis).toBe("apparent");
        found = true;
      }
    }
    expect(found).toBe(true);
  });
});

describe("getSectFromAltitude (pure)", () => {
  it("uses a strict horizon: exactly 0 is nocturnal", () => {
    expect(getSectFromAltitude(0.0001)).toBe("diurnal");
    expect(getSectFromAltitude(0)).toBe("nocturnal");
    expect(getSectFromAltitude(-0.0001)).toBe("nocturnal");
    expect(getSectFromAltitude(90)).toBe("diurnal");
    expect(getSectFromAltitude(-90)).toBe("nocturnal");
  });
  it("supports a custom threshold and rejects non-finite input", () => {
    expect(getSectFromAltitude(-0.5, -0.833)).toBe("diurnal");
    expect(getSectFromAltitude(-0.833, -0.833)).toBe("nocturnal");
    expect(() => getSectFromAltitude(Number.NaN)).toThrow();
  });
});
