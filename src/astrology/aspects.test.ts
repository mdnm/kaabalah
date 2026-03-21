import { describe, expect, it } from "vitest";
import {
  computeAspects,
  computeMidpoints,
  computeSynastryAspects,
  computeTransitAspects,
  DEFAULT_ASPECT_SPECS,
  getAspectMatch,
  SLOW_PLANETS,
} from "./aspects";

describe("getAspectMatch", () => {
  it("detects exact conjunction", () => {
    const m = getAspectMatch(10, 10);
    expect(m).not.toBeNull();
    expect(m!.spec.name).toBe("conjunction");
    expect(m!.orb).toBe(0);
  });

  it("detects conjunction within orb", () => {
    const m = getAspectMatch(10, 15);
    expect(m).not.toBeNull();
    expect(m!.spec.name).toBe("conjunction");
    expect(m!.orb).toBe(5);
  });

  it("returns null when out of orb", () => {
    // 10 vs 25 = 15 degrees, no aspect matches (duodecile orb=2 at 30°, conjunction orb=8 at 0°)
    const m = getAspectMatch(10, 25);
    expect(m).toBeNull();
  });

  it("detects exact opposition", () => {
    const m = getAspectMatch(0, 180);
    expect(m).not.toBeNull();
    expect(m!.spec.name).toBe("opposition");
    expect(m!.delta).toBe(180);
    expect(m!.orb).toBe(0);
  });

  it("detects trine within orb", () => {
    const m = getAspectMatch(0, 125);
    expect(m).not.toBeNull();
    expect(m!.spec.name).toBe("trine");
    expect(m!.orb).toBe(5);
  });

  it("handles wrap-around (355 vs 1 = conjunction)", () => {
    const m = getAspectMatch(355, 1);
    expect(m).not.toBeNull();
    expect(m!.spec.name).toBe("conjunction");
    expect(m!.delta).toBe(6);
    expect(m!.orb).toBe(6);
  });

  it("handles wrap-around opposition (5 vs 182)", () => {
    const m = getAspectMatch(5, 182);
    expect(m).not.toBeNull();
    expect(m!.spec.name).toBe("opposition");
    expect(m!.orb).toBe(3);
  });

  it("detects square", () => {
    const m = getAspectMatch(0, 93);
    expect(m).not.toBeNull();
    expect(m!.spec.name).toBe("square");
    expect(m!.orb).toBe(3);
  });

  it("detects sextile", () => {
    const m = getAspectMatch(100, 160);
    expect(m).not.toBeNull();
    expect(m!.spec.name).toBe("sextile");
  });

  it("uses custom specs", () => {
    const specs = [{ name: "conjunction" as const, angle: 0, orb: 1 }];
    expect(getAspectMatch(0, 5, specs)).toBeNull();
    expect(getAspectMatch(0, 0.5, specs)).not.toBeNull();
  });
});

describe("computeAspects", () => {
  it("finds aspects between synthetic planets", () => {
    const planets = {
      sun: { longitude: 0 },
      moon: { longitude: 120 },
      mars: { longitude: 180 },
    };
    const edges = computeAspects(planets);
    expect(edges.length).toBeGreaterThan(0);

    const sunMoon = edges.find(
      (e) => e.planetA === "sun" && e.planetB === "moon"
    );
    expect(sunMoon).toBeDefined();
    expect(sunMoon!.aspect).toBe("trine");

    const sunMars = edges.find(
      (e) => e.planetA === "sun" && e.planetB === "mars"
    );
    expect(sunMars).toBeDefined();
    expect(sunMars!.aspect).toBe("opposition");

    const moonMars = edges.find(
      (e) => e.planetA === "moon" && e.planetB === "mars"
    );
    expect(moonMars).toBeDefined();
    expect(moonMars!.aspect).toBe("sextile");
  });

  it("produces no duplicate pairs", () => {
    const planets = {
      sun: { longitude: 0 },
      moon: { longitude: 120 },
    };
    const edges = computeAspects(planets);
    const pairs = edges.map((e) => `${e.planetA}-${e.planetB}`);
    expect(new Set(pairs).size).toBe(pairs.length);
  });

  it("respects custom specs", () => {
    const planets = {
      sun: { longitude: 0 },
      moon: { longitude: 60 },
    };
    const tight = [{ name: "sextile" as const, angle: 60, orb: 0.5 }];
    const edges = computeAspects(planets, tight);
    expect(edges).toHaveLength(1);
    expect(edges[0].aspect).toBe("sextile");
    expect(edges[0].orb).toBe(0);
  });

  it("returns empty for no aspects", () => {
    const planets = {
      sun: { longitude: 0 },
      moon: { longitude: 20 },
    };
    // 20° separation: only duodecile at 30° with orb 2 might match — it doesn't (|20-30|=10)
    const edges = computeAspects(planets);
    expect(edges).toHaveLength(0);
  });
});

describe("computeSynastryAspects", () => {
  it("produces only cross-chart aspects", () => {
    const planetsA = {
      sun: { longitude: 0 },
      moon: { longitude: 120 },
    };
    const planetsB = {
      sun: { longitude: 60 },
      moon: { longitude: 180 },
    };
    const edges = computeSynastryAspects(planetsA, planetsB);

    // Should never have planetA and planetB both from the same chart
    for (const e of edges) {
      expect(Object.keys(planetsA)).toContain(e.planetA);
      expect(Object.keys(planetsB)).toContain(e.planetB);
    }

    // A.sun (0) vs B.sun (60) = sextile
    const sunSun = edges.find(
      (e) => e.planetA === "sun" && e.planetB === "sun"
    );
    expect(sunSun).toBeDefined();
    expect(sunSun!.aspect).toBe("sextile");

    // A.sun (0) vs B.moon (180) = opposition
    const sunMoon = edges.find(
      (e) => e.planetA === "sun" && e.planetB === "moon"
    );
    expect(sunMoon).toBeDefined();
    expect(sunMoon!.aspect).toBe("opposition");
  });

  it("does not include intra-chart aspects", () => {
    const planetsA = {
      sun: { longitude: 0 },
      moon: { longitude: 120 }, // trine to sun
    };
    const planetsB = {
      mars: { longitude: 200 },
    };
    const edges = computeSynastryAspects(planetsA, planetsB);
    // No sun-moon pair because that's intra-chart
    const intra = edges.find(
      (e) => e.planetA === "sun" && e.planetB === "moon"
    );
    expect(intra).toBeUndefined();
  });
});

describe("computeMidpoints", () => {
  it("basic midpoint (0+60 = 30)", () => {
    const a = { sun: { longitude: 0 } };
    const b = { sun: { longitude: 60 } };
    const mid = computeMidpoints(a, b);
    expect(mid.sun).toBeCloseTo(30, 5);
  });

  it("wrap-around (350+10 = 0)", () => {
    const a = { sun: { longitude: 350 } };
    const b = { sun: { longitude: 10 } };
    const mid = computeMidpoints(a, b);
    expect(mid.sun).toBeCloseTo(0, 5);
  });

  it("opposition midpoint (0+180 = 90)", () => {
    const a = { sun: { longitude: 0 } };
    const b = { sun: { longitude: 180 } };
    const mid = computeMidpoints(a, b);
    expect(mid.sun).toBeCloseTo(90, 5);
  });

  it("only includes common planets", () => {
    const a = { sun: { longitude: 0 }, moon: { longitude: 120 } };
    const b = { sun: { longitude: 60 }, mars: { longitude: 200 } };
    const mid = computeMidpoints(a, b);
    expect("sun" in mid).toBe(true);
    expect("moon" in mid).toBe(false);
    expect("mars" in mid).toBe(false);
  });

  it("symmetric planets (same position = same midpoint)", () => {
    const a = { sun: { longitude: 45 } };
    const b = { sun: { longitude: 45 } };
    const mid = computeMidpoints(a, b);
    expect(mid.sun).toBeCloseTo(45, 5);
  });
});

describe("computeTransitAspects", () => {
  it("detects applying aspect (transit moving toward exact)", () => {
    // Transit Saturn at 88° moving at +0.05°/day toward natal Sun at 0° (square = 90°)
    // Current orb: |88 - 0| = 88, aspect angle 90, orb = |88 - 90| = 2° — applying
    const transit = { saturn: { longitude: 88, longitudeSpeed: 0.05 } };
    const natal = { sun: { longitude: 0, longitudeSpeed: 0 } };
    const specs = [{ name: "square" as const, angle: 90, orb: 6 }];
    const edges = computeTransitAspects(transit, natal, specs);

    expect(edges).toHaveLength(1);
    expect(edges[0].aspect).toBe("square");
    expect(edges[0].applying).toBe(true);
    expect(edges[0].orb).toBeCloseTo(2, 1);
  });

  it("detects separating aspect (transit moving away from exact)", () => {
    // Transit Saturn at 92° moving at +0.05°/day, natal Sun at 0° (square = 90°)
    // orb = |92 - 90| = 2° and increasing
    const transit = { saturn: { longitude: 92, longitudeSpeed: 0.05 } };
    const natal = { sun: { longitude: 0, longitudeSpeed: 0 } };
    const specs = [{ name: "square" as const, angle: 90, orb: 6 }];
    const edges = computeTransitAspects(transit, natal, specs);

    expect(edges).toHaveLength(1);
    expect(edges[0].applying).toBe(false);
  });

  it("handles retrograde transit (negative speed, applying)", () => {
    // Transit Saturn at 92° retrograding at -0.05°/day toward exact 90° square with natal Sun at 0°
    const transit = { saturn: { longitude: 92, longitudeSpeed: -0.05 } };
    const natal = { sun: { longitude: 0, longitudeSpeed: 0 } };
    const specs = [{ name: "square" as const, angle: 90, orb: 6 }];
    const edges = computeTransitAspects(transit, natal, specs);

    expect(edges).toHaveLength(1);
    expect(edges[0].retrograde).toBe(true);
    expect(edges[0].applying).toBe(true);
  });

  it("classifies slow planets correctly", () => {
    const transit = {
      saturn: { longitude: 88, longitudeSpeed: 0.05 },
      pluto: { longitude: 178, longitudeSpeed: 0.01 },
    };
    const natal = { sun: { longitude: 0, longitudeSpeed: 0 } };
    const edges = computeTransitAspects(transit, natal);

    const saturnEdge = edges.find((e) => e.planetA === "saturn");
    const plutoEdge = edges.find((e) => e.planetA === "pluto");
    expect(saturnEdge?.category).toBe("slow");
    expect(plutoEdge?.category).toBe("slow");
  });

  it("classifies fast planets correctly", () => {
    const transit = {
      sun: { longitude: 88, longitudeSpeed: 1.0 },
      mars: { longitude: 178, longitudeSpeed: 0.6 },
    };
    const natal = { moon: { longitude: 0, longitudeSpeed: 0 } };
    const edges = computeTransitAspects(transit, natal);

    const sunEdge = edges.find((e) => e.planetA === "sun");
    const marsEdge = edges.find((e) => e.planetA === "mars");
    expect(sunEdge?.category).toBe("fast");
    expect(marsEdge?.category).toBe("fast");
  });

  it("handles wrap-around conjunction (358° transit, 2° natal)", () => {
    // Transit at 358° moving +1°/day, natal at 2° — conjunction with delta = 4°, applying
    const transit = { sun: { longitude: 358, longitudeSpeed: 1.0 } };
    const natal = { moon: { longitude: 2, longitudeSpeed: 0 } };
    const specs = [{ name: "conjunction" as const, angle: 0, orb: 8 }];
    const edges = computeTransitAspects(transit, natal, specs);

    expect(edges).toHaveLength(1);
    expect(edges[0].aspect).toBe("conjunction");
    expect(edges[0].applying).toBe(true);
    expect(edges[0].delta).toBe(4);
  });

  it("labels planetA as transit, planetB as natal", () => {
    const transit = { jupiter: { longitude: 120, longitudeSpeed: 0.1 } };
    const natal = { mars: { longitude: 0, longitudeSpeed: 0 } };
    const edges = computeTransitAspects(transit, natal);
    expect(edges).toHaveLength(1);
    expect(edges[0].planetA).toBe("jupiter");
    expect(edges[0].planetB).toBe("mars");
  });

  it("returns empty when no aspects match", () => {
    const transit = { sun: { longitude: 20, longitudeSpeed: 1.0 } };
    const natal = { moon: { longitude: 0, longitudeSpeed: 0 } };
    const edges = computeTransitAspects(transit, natal);
    expect(edges).toHaveLength(0);
  });

  it("handles exact aspect (orb = 0)", () => {
    const transit = { saturn: { longitude: 90, longitudeSpeed: 0.05 } };
    const natal = { sun: { longitude: 0, longitudeSpeed: 0 } };
    const specs = [{ name: "square" as const, angle: 90, orb: 6 }];
    const edges = computeTransitAspects(transit, natal, specs);

    expect(edges).toHaveLength(1);
    expect(edges[0].orb).toBe(0);
    // Moving direct past exact = separating
    expect(edges[0].applying).toBe(false);
  });

  it("applying/separating ignores natal speed when natal speed is zero", () => {
    // Transit Sun at 88° moving +1°/day toward square with natal Moon at 0°
    // Natal Moon speed = 0 (fixed target) → should be applying
    const transit = { sun: { longitude: 88, longitudeSpeed: 1.0 } };
    const natal = { moon: { longitude: 0, longitudeSpeed: 0 } };
    const specs = [{ name: "square" as const, angle: 90, orb: 6 }];
    const edges = computeTransitAspects(transit, natal, specs);

    expect(edges).toHaveLength(1);
    expect(edges[0].applying).toBe(true);
  });

  it("applying/separating result changes when natal has non-zero speed", () => {
    // Same transit, but natal Moon moves at 13°/day — flips the result
    // This tests the raw function behavior; in practice natal speeds should
    // be zeroed by the caller (getNatalAspectPoints) for transit work.
    const transit = { sun: { longitude: 88, longitudeSpeed: 1.0 } };
    const natalMoving = { moon: { longitude: 0, longitudeSpeed: 13 } };
    const specs = [{ name: "square" as const, angle: 90, orb: 6 }];
    const edges = computeTransitAspects(transit, natalMoving, specs);

    expect(edges).toHaveLength(1);
    // With natal Moon racing ahead at 13°/day, the orb widens → separating
    expect(edges[0].applying).toBe(false);
  });
});
