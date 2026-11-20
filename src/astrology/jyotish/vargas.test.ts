import { describe, expect, it } from "vitest";
import { SUPPORTED_VARGAS, getVarga, getVargaChart, isVargottama } from "./vargas";

// [division, Aries first, Aries last, Taurus first, Taurus last] as sign indices (0 = Aries).
// Aries is an odd sign, Taurus an even sign. Expectations are counted by hand from the BPHS rules.
const BOUNDARIES: Array<[number, number, number, number, number]> = [
  [1, 0, 0, 1, 1],
  [2, 4, 3, 3, 4], // Hora: odd sign Sun then Moon; even sign Moon then Sun
  [3, 0, 8, 1, 9], // sign, 5th, 9th
  [4, 0, 9, 1, 10], // sign, 4th, 7th, 10th
  [7, 0, 6, 7, 1], // odd from itself, even from its 7th
  [9, 0, 8, 9, 5], // fire from Aries, earth from Capricorn
  [10, 0, 9, 9, 6], // odd from itself, even from its 9th
  [12, 0, 11, 1, 0],
  [16, 0, 3, 4, 7], // movable Aries, fixed Leo
  [20, 0, 7, 8, 3], // movable Aries, fixed Sagittarius
  [24, 4, 3, 3, 2], // odd from Leo, even from Cancer
  [27, 0, 2, 3, 5], // fire Aries, earth Cancer
  [30, 0, 6, 1, 7], // odd: Mars..Venus (Aries..Libra); even: Venus..Mars (Taurus..Scorpio)
  [40, 0, 3, 6, 9], // odd from Aries, even from Libra
  [45, 0, 8, 4, 0], // movable Aries, fixed Leo
  [60, 0, 11, 1, 0],
];

describe("getVarga: known chart values", () => {
  it("29.61 Libra is Gemini in D9", () => {
    const v = getVarga(209.61, 9);
    expect(v.sign).toBe("Gemini");
    expect(v.signIndex).toBe(2);
    expect(v.division).toBe(9);
    // 29.61 in the 9th ninth (26.67-30): (29.61 - 26.6667) / 3.3333 * 30
    expect(v.degree).toBeCloseTo(((29.61 - (80 / 3)) / (10 / 3)) * 30, 6);
  });
  it("14.52 Virgo is Taurus in D9", () => {
    expect(getVarga(164.52, 9).sign).toBe("Taurus");
  });
  it("an ascendant at 2.56 Taurus is Capricorn in D9", () => {
    expect(getVarga(32.56, 9).sign).toBe("Capricorn");
  });
});

describe("getVarga: boundaries", () => {
  it("covers every supported division", () => {
    expect(BOUNDARIES.map((b) => b[0])).toEqual([...SUPPORTED_VARGAS]);
  });
  for (const [division, ariesFirst, ariesLast, taurusFirst, taurusLast] of BOUNDARIES) {
    it(`D${division}: first and last division of Aries and Taurus`, () => {
      expect(getVarga(0, division).signIndex).toBe(ariesFirst);
      expect(getVarga(29.9999, division).signIndex).toBe(ariesLast);
      expect(getVarga(30, division).signIndex).toBe(taurusFirst);
      expect(getVarga(59.9999, division).signIndex).toBe(taurusLast);
      expect(getVarga(0, division).degree).toBeCloseTo(0, 6);
      expect(getVarga(29.9999, division).degree).toBeGreaterThan(29.9);
      expect(getVarga(29.9999, division).degree).toBeLessThan(30);
    });
  }
  it("exact division edges start the next part", () => {
    expect(getVarga(10, 3).signIndex).toBe(4); // D3 second drekkana of Aries is Leo
    expect(getVarga(15, 2).signIndex).toBe(3);
    expect(getVarga(30 / 9, 9).signIndex).toBe(1);
  });
});

describe("getVarga: D30 unequal parts", () => {
  it("odd sign: Mars 5, Saturn 5, Jupiter 8, Mercury 7, Venus 5", () => {
    const signs = [2, 7, 12, 20, 27].map((d) => getVarga(d, 30).sign);
    expect(signs).toEqual(["Aries", "Aquarius", "Sagittarius", "Gemini", "Libra"]);
    expect([4.99, 5, 9.99, 10, 17.99, 18, 24.99, 25].map((d) => getVarga(d, 30).signIndex)).toEqual([
      0, 10, 10, 8, 8, 2, 2, 6,
    ]);
  });
  it("even sign: Venus 5, Mercury 7, Jupiter 8, Saturn 5, Mars 5", () => {
    const signs = [2, 8, 15, 22, 28].map((d) => getVarga(30 + d, 30).sign);
    expect(signs).toEqual(["Taurus", "Virgo", "Pisces", "Capricorn", "Scorpio"]);
  });
  it("scales the degree across the unequal part", () => {
    expect(getVarga(7.5, 30).degree).toBeCloseTo(15, 6); // middle of Saturn's 5-10
    expect(getVarga(14, 30).degree).toBeCloseTo(15, 6); // middle of Jupiter's 10-18
  });
});

describe("getVarga: input handling", () => {
  it("normalizes longitudes outside 0..360", () => {
    expect(getVarga(-150.39, 9).signIndex).toBe(getVarga(209.61, 9).signIndex);
    expect(getVarga(360 + 32.56, 9).sign).toBe("Capricorn");
  });
  it("rejects unsupported divisions and non-finite longitudes", () => {
    expect(() => getVarga(10, 5)).toThrow();
    expect(() => getVarga(Number.NaN, 9)).toThrow();
  });
});

describe("getVargaChart", () => {
  const points = { lagna: 32.56, sun: 209.61, moon: 164.52 };
  it("maps points and counts whole-sign houses from the varga lagna", () => {
    const chart = getVargaChart(points, 9);
    expect(chart.lagnaKey).toBe("lagna");
    expect(chart.placements.lagna.sign).toBe("Capricorn");
    expect(chart.placements.lagna.house).toBe(1);
    expect(chart.placements.sun.sign).toBe("Gemini");
    expect(chart.placements.sun.house).toBe(6); // Capricorn -> Gemini: 6th
    expect(chart.placements.moon.sign).toBe("Taurus");
    expect(chart.placements.moon.house).toBe(5);
  });
  it("omits houses without a lagna", () => {
    const chart = getVargaChart({ sun: 209.61 }, 9);
    expect(chart.placements.sun.house).toBeUndefined();
    expect(chart.lagnaKey).toBeUndefined();
  });
  it("accepts a custom lagna key", () => {
    const chart = getVargaChart({ asc: 32.56, sun: 209.61 }, 9, { lagnaKey: "asc" });
    expect(chart.placements.sun.house).toBe(6);
  });
});

describe("isVargottama", () => {
  const SIGN_NAMES = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  const NAVAMSA = 30 / 9; // 3 deg 20
  // Movable signs: first navamsa. Fixed: fifth. Dual: ninth.
  const SPAN_BY_MODALITY: Array<[number, number]> = [
    [0, NAVAMSA],
    [4 * NAVAMSA, 5 * NAVAMSA],
    [8 * NAVAMSA, 30],
  ];
  const STEP = 0.001;

  for (let s = 0; s < 12; s++) {
    const [from, to] = SPAN_BY_MODALITY[s % 3];
    it(`${SIGN_NAMES[s]}: vargottama from ${from.toFixed(2)} to ${to.toFixed(2)} degrees only`, () => {
      const at = (degree: number) => s * 30 + degree;
      // Just inside each end of the span.
      expect(isVargottama(at(from))).toBe(true);
      expect(isVargottama(at(from + STEP))).toBe(true);
      expect(isVargottama(at((from + to) / 2))).toBe(true);
      expect(isVargottama(at(to - STEP))).toBe(true);
      // Just outside each end, inside the same sign. (A movable sign's span starts at 0 and a
      // dual sign's ends at 30, so on that side the neighbour is another sign: checked below.)
      if (from > 0) expect(isVargottama(at(from - STEP))).toBe(false);
      if (to < 30) expect(isVargottama(at(to))).toBe(false);
      if (to < 30) expect(isVargottama(at(to + STEP))).toBe(false);
      // Every navamsa of the sign: exactly one is vargottama.
      const flags = Array.from({ length: 9 }, (_, k) => isVargottama(at((k + 0.5) * NAVAMSA)));
      expect(flags.filter(Boolean)).toHaveLength(1);
      expect(flags.indexOf(true)).toBe([0, 4, 8][s % 3]);
      expect(getVarga(at((from + to) / 2), 9).signIndex).toBe(s);
    });
  }

  it("the end of a dual sign and the start of the movable sign after it are both vargottama, in their own signs", () => {
    for (const boundary of [90, 180, 270, 360]) {
      expect(isVargottama(boundary - STEP)).toBe(true);
      expect(isVargottama(boundary + STEP)).toBe(true);
      expect(getVarga(boundary - STEP, 9).signIndex).toBe(boundary / 30 - 1);
      expect(getVarga(boundary + STEP, 9).signIndex).toBe((boundary / 30) % 12);
    }
  });

  it("matches the definition for other divisions and normalizes the longitude", () => {
    expect(isVargottama(123.4, 1)).toBe(true);
    expect(isVargottama(5, 3)).toBe(true); // first drekkana is the sign itself
    expect(isVargottama(15, 3)).toBe(false);
    expect(isVargottama(-359)).toBe(isVargottama(1));
    expect(isVargottama(361)).toBe(true);
    expect(() => isVargottama(Number.NaN)).toThrow();
    expect(() => isVargottama(10, 5)).toThrow();
  });

  it("known chart values: none of 29.61 Libra, 14.52 Virgo, 2.56 Taurus is vargottama; 15 Leo is", () => {
    expect([209.61, 164.52, 32.56].map((l) => isVargottama(l))).toEqual([false, false, false]);
    expect(isVargottama(135)).toBe(true);
  });
});

describe("getVargaChart: vargottama flag", () => {
  const points = { lagna: 32.56, sun: 209.61, moon: 164.52, mars: 1.5, venus: 135, jupiter: 268, saturn: 100 };
  it("agrees with isVargottama on every D9 placement, with or without a lagna", () => {
    const chart = getVargaChart(points, 9);
    for (const key of Object.keys(points) as Array<keyof typeof points>) {
      expect(chart.placements[key].vargottama).toBe(isVargottama(points[key]));
    }
    expect(chart.placements.mars.vargottama).toBe(true); // 1.5 Aries
    expect(chart.placements.venus.vargottama).toBe(true); // 15 Leo
    expect(chart.placements.jupiter.vargottama).toBe(true); // 28 Sagittarius
    expect(chart.placements.sun.vargottama).toBe(false);
    expect(chart.placements.mars.house).toBeDefined();
    expect(getVargaChart({ mars: 1.5, sun: 209.61 }, 9).placements).toMatchObject({
      mars: { vargottama: true },
      sun: { vargottama: false },
    });
  });
  it("is absent from the other divisions", () => {
    for (const division of SUPPORTED_VARGAS.filter((d) => d !== 9)) {
      expect(getVargaChart(points, division).placements.mars).not.toHaveProperty("vargottama");
    }
  });
});
