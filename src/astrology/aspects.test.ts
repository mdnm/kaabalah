import { describe, expect, it } from "vitest";
import {
  computeAspects,
  computeMidpoints,
  computeSynastryAspects,
  DEFAULT_ASPECT_SPECS,
  getAspectMatch,
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
