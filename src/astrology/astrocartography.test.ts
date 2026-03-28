import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  computeGMST,
  computeHorizonLongitude,
  computeICLongitude,
  computeMCLongitude,
  geographicAngularDifference,
  computeEquatorialPositions,
  queryAstrocartographyLocation,
  computeAstrocartographyMap,
  findParansAtLatitude,
  ASTROCARTOGRAPHY_DEFAULT_PLANETS,
  type PlanetEquatorial,
} from "./astrocartography";
import { closeSwissEph, getSwissEph, Planet } from "./swisseph";

// ─── Pure math tests (no WASM) ─────────────────────────────────────────

describe("Astrocartography Pure Math", () => {
  describe("computeGMST", () => {
    it("returns ~280.46 at J2000.0 epoch", () => {
      const gmst = computeGMST(2451545.0);
      expect(gmst).toBeCloseTo(280.46, 0);
    });

    it("normalizes to 0-360 range", () => {
      const gmst = computeGMST(2451545.0 + 365.25 * 100);
      expect(gmst).toBeGreaterThanOrEqual(0);
      expect(gmst).toBeLessThan(360);
    });
  });

  describe("computeMCLongitude", () => {
    it("GMST=0, RA=90 → MC at -90", () => {
      const mc = computeMCLongitude(0, 90);
      expect(mc).toBeCloseTo(-90);
    });

    it("GMST=0, RA=0 → MC at 0", () => {
      const mc = computeMCLongitude(0, 0);
      expect(mc).toBeCloseTo(0);
    });

    it("wraps correctly across 180 boundary", () => {
      const mc = computeMCLongitude(10, 200);
      // 10 - 200 = -190 → normalize to 170 → toGeoLon → 170
      expect(mc).toBeCloseTo(170);
    });
  });

  describe("computeICLongitude", () => {
    it("is always 180° from MC", () => {
      const mc = computeMCLongitude(100, 50);
      const ic = computeICLongitude(100, 50);
      const diff = geographicAngularDifference(mc, ic);
      expect(diff).toBeCloseTo(180);
    });
  });

  describe("computeHorizonLongitude", () => {
    it("returns a valid longitude at mid-latitudes", () => {
      // Sun near equinox (dec ≈ 0): should rise/set everywhere
      const ac = computeHorizonLongitude(0, 0, 0, 40, "AC");
      expect(ac).not.toBeNull();
      expect(ac!).toBeGreaterThanOrEqual(-180);
      expect(ac!).toBeLessThanOrEqual(180);
    });

    it("returns null for circumpolar condition", () => {
      // Very high declination (+80°) at high latitude (70°N)
      // tan(70) * tan(80) ≈ 2.75 * 5.67 ≈ 15.6 >> 1
      const ac = computeHorizonLongitude(0, 0, 80, 70, "AC");
      expect(ac).toBeNull();
    });

    it("AC and DC are symmetric around the MC longitude", () => {
      const gmst = 100;
      const ra = 50;
      const dec = 10;
      const lat = 40;

      const ac = computeHorizonLongitude(gmst, ra, dec, lat, "AC")!;
      const dc = computeHorizonLongitude(gmst, ra, dec, lat, "DC")!;
      const mc = computeMCLongitude(gmst, ra);

      // AC and DC should be equidistant from MC
      const acDist = geographicAngularDifference(ac, mc);
      const dcDist = geographicAngularDifference(dc, mc);
      expect(acDist).toBeCloseTo(dcDist, 1);
    });

    it("dec=0 at equator gives H=90 (rises exactly east)", () => {
      // cos(H) = -tan(0) * tan(0) = 0, so H = 90°
      const ac = computeHorizonLongitude(0, 0, 0, 0, "AC");
      // GMST(0) - RA(0) - H(90) = -90 → -90
      expect(ac).toBeCloseTo(-90);
    });
  });

  describe("geographicAngularDifference", () => {
    it("returns 0 for identical angles", () => {
      expect(geographicAngularDifference(50, 50)).toBe(0);
    });

    it("handles wrap-around", () => {
      expect(geographicAngularDifference(170, -170)).toBeCloseTo(20);
    });

    it("returns shortest arc (always ≤ 180)", () => {
      expect(geographicAngularDifference(0, -179)).toBeCloseTo(179);
      expect(geographicAngularDifference(0, 179)).toBeCloseTo(179);
    });
  });

  describe("findParansAtLatitude", () => {
    it("detects paran when AC of one planet equals MC of another", () => {
      // Planet A RA=0, Planet B RA=90, both dec=0 at equator:
      // A MC = GMST, A AC = GMST-90
      // B MC = GMST-90  → A AC = B MC → paran!
      const positions: Record<string, PlanetEquatorial> = {
        Sun: { ra: 0, dec: 0, planetId: Planet.SUN },
        Moon: { ra: 90, dec: 0, planetId: Planet.MOON },
      };
      const parans = findParansAtLatitude(positions, 100, 0, 1);
      expect(parans.length).toBeGreaterThan(0);
      // There should be a paran where Sun AC meets Moon MC
      const match = parans.find(
        (p) =>
          (p.planetA === "Sun" && p.angleA === "AC" && p.planetB === "Moon" && p.angleB === "MC") ||
          (p.planetA === "Moon" && p.angleA === "MC" && p.planetB === "Sun" && p.angleB === "AC")
      );
      expect(match).toBeDefined();
    });

    it("returns empty when no parans exist", () => {
      // Two planets with RA 90° apart and different dec,
      // at mid-latitude — no angle lines converge within 0.5°
      const positions: Record<string, PlanetEquatorial> = {
        Sun: { ra: 0, dec: 23, planetId: Planet.SUN },
        Moon: { ra: 90, dec: -23, planetId: Planet.MOON },
      };
      const parans = findParansAtLatitude(positions, 100, 40, 0.5);
      expect(parans.length).toBe(0);
    });
  });
});

// ─── Integration tests (WASM) ──────────────────────────────────────────

describe("Astrocartography Integration", () => {
  beforeAll(async () => {
    await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  afterAll(() => {
    closeSwissEph();
  });

  // Sample birth data: 1990-06-15 14:30 UTC (approx) at Paris
  const birthDate = new Date("1990-06-15T12:30:00Z");

  describe("computeEquatorialPositions", () => {
    it("returns RA and Dec for all default planets", () => {
      const positions = computeEquatorialPositions(birthDate);
      expect(Object.keys(positions).length).toBe(ASTROCARTOGRAPHY_DEFAULT_PLANETS.length);

      for (const [, eq] of Object.entries(positions)) {
        expect(eq.ra).toBeGreaterThanOrEqual(0);
        expect(eq.ra).toBeLessThan(360);
        expect(eq.dec).toBeGreaterThanOrEqual(-90);
        expect(eq.dec).toBeLessThanOrEqual(90);
      }
    });

    it("respects planet filter", () => {
      const positions = computeEquatorialPositions(birthDate, [
        Planet.SUN,
        Planet.MOON,
      ]);
      expect(Object.keys(positions).length).toBe(2);
      expect(positions["Sun"]).toBeDefined();
      expect(positions["Moon"]).toBeDefined();
    });
  });

  describe("queryAstrocartographyLocation", () => {
    it("returns sorted lines for a location", () => {
      const result = queryAstrocartographyLocation(birthDate, {
        latitude: 51.5,
        longitude: -0.12,
      });

      expect(result.queryLatitude).toBe(51.5);
      expect(result.queryLongitude).toBe(-0.12);
      expect(result.orb).toBe(2);
      expect(result.lines.length).toBeGreaterThan(0);

      // Verify sorted by distance ascending
      for (let i = 1; i < result.lines.length; i++) {
        expect(result.lines[i].distance).toBeGreaterThanOrEqual(
          result.lines[i - 1].distance
        );
      }
    });

    it("activeLines are subset of lines within orb", () => {
      const result = queryAstrocartographyLocation(birthDate, {
        latitude: 40,
        longitude: -74,
        orb: 5,
      });

      for (const line of result.activeLines) {
        expect(line.active).toBe(true);
        expect(line.distance).toBeLessThanOrEqual(5);
      }
    });

    it("custom orb narrows active results", () => {
      const wide = queryAstrocartographyLocation(birthDate, {
        latitude: 40,
        longitude: -74,
        orb: 10,
      });
      const narrow = queryAstrocartographyLocation(birthDate, {
        latitude: 40,
        longitude: -74,
        orb: 1,
      });
      expect(narrow.activeLines.length).toBeLessThanOrEqual(
        wide.activeLines.length
      );
    });

    it("handles circumpolar regions gracefully", () => {
      // At 80°N, some planets may not have AC/DC lines
      const result = queryAstrocartographyLocation(birthDate, {
        latitude: 80,
        longitude: 0,
      });
      // Should still return MC/IC lines even if AC/DC are missing
      expect(result.lines.length).toBeGreaterThan(0);
      const mcIcLines = result.lines.filter(
        (l) => l.angle === "MC" || l.angle === "IC"
      );
      expect(mcIcLines.length).toBeGreaterThan(0);
    });
  });

  describe("computeAstrocartographyMap", () => {
    it("generates MC/IC lines for all planets", () => {
      const map = computeAstrocartographyMap(birthDate, {
        planets: [Planet.SUN, Planet.MOON],
      });

      // 2 planets × 2 meridian angles = 4 lines
      expect(map.meridianLines.length).toBe(4);
      for (const line of map.meridianLines) {
        expect(line.longitude).toBeGreaterThanOrEqual(-180);
        expect(line.longitude).toBeLessThanOrEqual(180);
      }
    });

    it("MC and IC are 180° apart", () => {
      const map = computeAstrocartographyMap(birthDate, { planets: [Planet.SUN] });
      const sunMC = map.meridianLines.find(
        (l) => l.planet === "Sun" && l.angle === "MC"
      )!;
      const sunIC = map.meridianLines.find(
        (l) => l.planet === "Sun" && l.angle === "IC"
      )!;
      const diff = geographicAngularDifference(sunMC.longitude, sunIC.longitude);
      expect(diff).toBeCloseTo(180, 0);
    });

    it("generates AC/DC horizon lines with points", () => {
      const map = computeAstrocartographyMap(birthDate, {
        planets: [Planet.SUN],
        latitudeStep: 5,
      });

      // 1 planet × 2 horizon angles = 2 lines
      expect(map.horizonLines.length).toBe(2);
      for (const line of map.horizonLines) {
        expect(line.points.length).toBeGreaterThan(0);
        for (const pt of line.points) {
          expect(pt.latitude).toBeGreaterThanOrEqual(-66.5);
          expect(pt.latitude).toBeLessThanOrEqual(66.5);
          expect(pt.longitude).toBeGreaterThanOrEqual(-180);
          expect(pt.longitude).toBeLessThanOrEqual(180);
        }
      }
    });

    it("respects latitude step", () => {
      const coarse = computeAstrocartographyMap(birthDate, {
        planets: [Planet.SUN],
        latitudeStep: 10,
      });
      const fine = computeAstrocartographyMap(birthDate, {
        planets: [Planet.SUN],
        latitudeStep: 1,
      });
      // Fine should have more points
      expect(fine.horizonLines[0].points.length).toBeGreaterThan(
        coarse.horizonLines[0].points.length
      );
    });
  });
});
