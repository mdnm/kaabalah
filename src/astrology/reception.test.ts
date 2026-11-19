import { describe, expect, it } from "vitest";
import {
  MEAN_DAILY_MOTION,
  MODERN_RULERS,
  PLANETARY_JOYS,
  TRADITIONAL_RULERS,
  getDispositors,
  getMutualReceptions,
  getPlanetSectStatus,
  getPlanetaryCondition,
  getStationStatus,
  isInJoy,
  type Placements,
} from "./reception";
import { DOMICILE_RULERS } from "./dignity";
import type { BirthChart } from "./index";

describe("rulership schemes", () => {
  it("traditional is the domicile table", () => {
    expect(TRADITIONAL_RULERS).toEqual(DOMICILE_RULERS);
  });

  it("modern differs only in Scorpio, Aquarius and Pisces", () => {
    const changed = Object.keys(MODERN_RULERS).filter(
      (s) => MODERN_RULERS[s as keyof typeof MODERN_RULERS] !== TRADITIONAL_RULERS[s as keyof typeof TRADITIONAL_RULERS]
    );
    expect(changed.sort()).toEqual(["Aquarius", "Pisces", "Scorpio"]);
    expect(MODERN_RULERS.Scorpio).toBe("Pluto");
    expect(MODERN_RULERS.Aquarius).toBe("Uranus");
    expect(MODERN_RULERS.Pisces).toBe("Neptune");
  });
});

describe("getDispositors", () => {
  it("finds a single final dispositor", () => {
    const placements: Placements = {
      Sun: "Leo",
      Moon: "Leo",
      Mercury: "Cancer",
      Venus: "Leo",
      "Mean Node": "Pisces",
    };
    const r = getDispositors(placements);
    expect(r.rulers).toBe("traditional");
    expect(r.finalDispositors).toEqual(["Sun"]);
    expect(r.loops).toEqual([]);
    expect(r.bodies.Sun).toMatchObject({ dispositor: "Sun", chain: [], end: "own-sign", finalDispositor: "Sun" });
    expect(r.bodies.Mercury.chain).toEqual(["Moon", "Sun"]);
    // The node rules nothing but still gets a chain: Pisces -> Jupiter, which is not placed.
    expect(r.bodies["Mean Node"]).toMatchObject({ dispositor: "Jupiter", chain: ["Jupiter"], end: "unplaced" });
    expect(r.singleFinalDispositor).toBeNull();
    const { "Mean Node": _node, ...withoutNode } = placements;
    expect(getDispositors(withoutNode).singleFinalDispositor).toBe("Sun");
  });

  it("ends every chain in the Mercury and Venus loop", () => {
    const placements: Placements = {
      Sun: "Libra",
      Moon: "Aries",
      Mercury: "Libra",
      Venus: "Virgo",
      Mars: "Capricorn",
      Jupiter: "Cancer",
      Saturn: "Gemini",
    };
    const r = getDispositors(placements);
    expect(r.finalDispositors).toEqual([]);
    expect(r.singleFinalDispositor).toBeNull();
    expect(r.loops).toEqual([["Mercury", "Venus"]]);
    for (const body of Object.keys(placements)) {
      expect(r.bodies[body].end).toBe("loop");
      expect(r.bodies[body].loop).toEqual(["Mercury", "Venus"]);
    }
    expect(r.bodies.Sun.chain).toEqual(["Venus", "Mercury", "Venus"]);
    expect(r.bodies.Mercury.chain).toEqual(["Venus", "Mercury"]);
    expect(r.bodies.Moon.chain).toEqual(["Mars", "Saturn", "Mercury", "Venus", "Mercury"]);
    expect(r.bodies.Jupiter.chain).toEqual(["Moon", "Mars", "Saturn", "Mercury", "Venus", "Mercury"]);
  });

  it("lists each loop once", () => {
    const r = getDispositors({ Sun: "Cancer", Moon: "Leo", Mars: "Libra", Venus: "Aries" });
    expect(r.loops).toEqual([
      ["Sun", "Moon"],
      ["Mars", "Venus"],
    ]);
  });

  it("changes a chain under the modern scheme", () => {
    const placements: Placements = { Sun: "Scorpio", Mars: "Aries", Pluto: "Leo" };
    const traditional = getDispositors(placements);
    expect(traditional.bodies.Sun.chain).toEqual(["Mars"]);
    expect(traditional.bodies.Pluto.chain).toEqual(["Sun", "Mars"]);
    expect(traditional.finalDispositors).toEqual(["Mars"]);

    const modern = getDispositors(placements, { rulers: "modern" });
    expect(modern.rulers).toBe("modern");
    expect(modern.bodies.Sun.chain).toEqual(["Pluto", "Sun"]);
    expect(modern.bodies.Sun.end).toBe("loop");
    expect(modern.loops).toEqual([["Sun", "Pluto"]]);
    // Mars in Aries still rules itself.
    expect(modern.bodies.Mars.end).toBe("own-sign");
  });

  it("accepts a computed chart", () => {
    const chart = fakeChart();
    const r = getDispositors(chart);
    expect(r.bodies.Venus.sign).toBe("Virgo");
    expect(r.bodies["Mean Node"].dispositor).toBe("Mercury");
  });
});

describe("getMutualReceptions", () => {
  it("finds Venus in Virgo and Mercury in Libra by domicile", () => {
    const r = getMutualReceptions({ Venus: "Virgo", Mercury: "Libra", Sun: "Leo" });
    expect(r).toEqual([
      { bodies: ["Venus", "Mercury"], by: "domicile", signs: ["Virgo", "Libra"], receivedBy: ["domicile", "domicile"] },
    ]);
  });

  it("finds a reception by exaltation", () => {
    // Moon in Aries (Sun exalted there), Sun in Taurus (Moon exalted there).
    const r = getMutualReceptions({ Moon: "Aries", Sun: "Taurus" });
    expect(r).toHaveLength(1);
    expect(r[0].by).toBe("exaltation");
  });

  it("reports a mixed reception separately", () => {
    // Mars in Cancer (Moon's domicile), Moon in Capricorn (Mars exalted there).
    const r = getMutualReceptions({ Mars: "Cancer", Moon: "Capricorn" });
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ by: "mixed", receivedBy: ["domicile", "exaltation"] });
  });

  it("can filter by kind and ignores one-way or self receptions", () => {
    const placements: Placements = { Venus: "Virgo", Mercury: "Libra", Moon: "Aries", Sun: "Taurus" };
    expect(getMutualReceptions(placements)).toHaveLength(2);
    expect(getMutualReceptions(placements, { by: "exaltation" }).map((x) => x.by)).toEqual(["exaltation"]);
    expect(getMutualReceptions({ Venus: "Virgo", Mercury: "Virgo" })).toEqual([]);
    expect(getMutualReceptions({ Sun: "Leo" })).toEqual([]);
  });

  it("uses the modern scheme for domicile only", () => {
    // Pluto in Aries (Mars rules it), Mars in Scorpio (Pluto rules it in the modern scheme).
    const placements: Placements = { Pluto: "Aries", Mars: "Scorpio" };
    expect(getMutualReceptions(placements)).toEqual([]);
    expect(getMutualReceptions(placements, { rulers: "modern" })).toEqual([
      { bodies: ["Pluto", "Mars"], by: "domicile", signs: ["Aries", "Scorpio"], receivedBy: ["domicile", "domicile"] },
    ]);
  });
});

describe("getPlanetSectStatus", () => {
  it("day chart", () => {
    for (const p of ["Sun", "Jupiter", "Saturn"]) expect(getPlanetSectStatus(p, "diurnal")).toBe(true);
    for (const p of ["Moon", "Venus", "Mars"]) expect(getPlanetSectStatus(p, "diurnal")).toBe(false);
  });

  it("night chart", () => {
    for (const p of ["Moon", "Venus", "Mars"]) expect(getPlanetSectStatus(p, "nocturnal")).toBe(true);
    for (const p of ["Sun", "Jupiter", "Saturn"]) expect(getPlanetSectStatus(p, "nocturnal")).toBe(false);
  });

  it("Mercury rising before the Sun is of the day sect", () => {
    const ctx = { longitude: 100, sunLongitude: 110 };
    expect(getPlanetSectStatus("Mercury", "diurnal", ctx)).toBe(true);
    expect(getPlanetSectStatus("Mercury", "nocturnal", ctx)).toBe(false);
  });

  it("Mercury after the Sun is of the night sect, across the 0 Aries wrap", () => {
    const ctx = { longitude: 120, sunLongitude: 110 };
    expect(getPlanetSectStatus("Mercury", "diurnal", ctx)).toBe(false);
    expect(getPlanetSectStatus("Mercury", "nocturnal", ctx)).toBe(true);
    const wrap = { longitude: 355, sunLongitude: 5 };
    expect(getPlanetSectStatus("Mercury", "diurnal", wrap)).toBe(true);
    expect(getPlanetSectStatus("Mercury", "nocturnal", { longitude: 5, sunLongitude: 355 })).toBe(true);
  });

  it("Mercury without longitudes, outer planets and points are undefined", () => {
    expect(getPlanetSectStatus("Mercury", "diurnal")).toBeUndefined();
    for (const p of ["Uranus", "Neptune", "Pluto", "Mean Node", "Chiron"]) {
      expect(getPlanetSectStatus(p, "diurnal")).toBeUndefined();
    }
  });
});

describe("planetary joys", () => {
  it("has the seven joys", () => {
    expect(PLANETARY_JOYS).toEqual({ Mercury: 1, Moon: 3, Venus: 5, Mars: 6, Sun: 9, Jupiter: 11, Saturn: 12 });
  });

  it("isInJoy", () => {
    expect(isInJoy("Mercury", 1)).toBe(true);
    expect(isInJoy("Saturn", 12)).toBe(true);
    expect(isInJoy("Saturn", 11)).toBe(false);
    expect(isInJoy("Pluto", 1)).toBe(false);
  });
});

describe("getStationStatus", () => {
  it("Mercury at -0.136 deg/day (27 hours after its 2001-10-02 station) is retrograde and near station", () => {
    const s = getStationStatus("Mercury", -0.136)!;
    expect(s.retrograde).toBe(true);
    expect(s.nearStation).toBe(true);
    expect(s.stationary).toBe(false);
    expect(s.speedRatio).toBeCloseTo(0.136 / MEAN_DAILY_MOTION.Mercury, 6);
  });

  it("applies the 0.15 and 0.03 thresholds", () => {
    const m = MEAN_DAILY_MOTION.Mars;
    expect(getStationStatus("Mars", m * 0.1499)).toMatchObject({ nearStation: true, stationary: false });
    expect(getStationStatus("Mars", m * 0.16)).toMatchObject({ nearStation: false, stationary: false });
    expect(getStationStatus("Mars", m * 0.0299)).toMatchObject({ nearStation: true, stationary: true });
    expect(getStationStatus("Mars", -m * 0.02)).toMatchObject({ retrograde: true, stationary: true });
    expect(getStationStatus("Mars", m)).toMatchObject({ retrograde: false, nearStation: false });
  });

  it("Sun and Moon never station", () => {
    expect(getStationStatus("Sun", 0)).toMatchObject({ retrograde: false, stationary: false, nearStation: false });
    expect(getStationStatus("Moon", -1)).toMatchObject({ retrograde: false, nearStation: false });
  });

  it("returns undefined for bodies without a mean motion", () => {
    expect(getStationStatus("Mean Node", -0.05)).toBeUndefined();
    expect(getStationStatus("Mercury", Number.NaN)).toBeUndefined();
  });
});

describe("getPlanetaryCondition", () => {
  it("returns one flat record per body", () => {
    const c = getPlanetaryCondition(fakeChart());
    expect(c.sect).toBe("diurnal");
    expect(Object.keys(c.bodies)).toEqual(["Sun", "Mercury", "Venus", "Mean Node"]);

    const venus = c.bodies.Venus;
    expect(venus).toMatchObject({
      sign: "Virgo",
      house: 5,
      dispositor: "Mercury",
      inSect: false,
      inJoy: true,
    });
    expect(venus.dignities?.fall).toBe(true);
    expect(venus.station).toMatchObject({ retrograde: false });
    expect(venus.receptions).toHaveLength(1);

    const mercury = c.bodies.Mercury;
    expect(mercury.inSect).toBe(false); // 190 is ahead of the Sun at 170: evening star, night sect
    expect(mercury.inJoy).toBe(false);
    expect(mercury.station).toMatchObject({ retrograde: true, nearStation: true });

    const node = c.bodies["Mean Node"];
    expect(node.dignities).toBeNull();
    expect(node.inSect).toBeNull();
    expect(node.inJoy).toBeNull();
    expect(node.station).toBeNull();

    expect(c.mutualReceptions).toHaveLength(1);
    expect(c.loops).toEqual([["Mercury", "Venus"]]);
  });
});

/** Hand-built chart: Sun Virgo 170, Mercury Libra 190 (retrograde), Venus Virgo 160, node Virgo 160. */
function fakeChart(): BirthChart {
  const pos = (name: string, longitude: number, sign: string, house: number, speed: number) => ({
    id: name as never,
    name,
    longitude,
    latitude: 0,
    distance: 1,
    longitudeSpeed: speed,
    zodiacPosition: { sign, decimalDegrees: longitude % 30, traditionalFormat: "", decimal: "", longitude, house },
  });
  return {
    dateUtc: new Date(0),
    planets: {
      sun: pos("Sun", 170, "Virgo", 9, 0.96),
      mercury: pos("Mercury", 190, "Libra", 4, -0.136),
      venus: pos("Venus", 160, "Virgo", 5, 1.1),
      "mean node": pos("Mean Node", 160, "Virgo", 5, -0.05),
    },
    nodes: {},
    houses: {} as BirthChart["houses"],
    aspects: [],
    sect: "diurnal",
  } as unknown as BirthChart;
}
