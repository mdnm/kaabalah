import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  compositeMidpoint,
  computeCompositeAngles,
  computeCompositeCusps,
  cuspsStrictlyIncreasing,
} from "./composite";
import { getCompositeChart, HouseSystem } from "./index";
import { closeSwissEph, getSwissEph } from "./swisseph";

const norm = (x: number) => ((x % 360) + 360) % 360;

/** Synthetic quadrant chart: ASC `a`, MC = a - d, cusps 2,3 / 5,6 / 8,9 / 11,12 evenly spaced. */
function syntheticChart(a: number, d: number) {
  const mc = norm(a - d);
  const ic = norm(mc + 180);
  const dsc = norm(a + 180);
  const q1 = norm(ic - a); // 180 - d
  const q2 = norm(dsc - ic); // d
  const cusps = [
    a, norm(a + q1 / 3), norm(a + (2 * q1) / 3),
    ic, norm(ic + q2 / 3), norm(ic + (2 * q2) / 3),
    dsc, norm(dsc + q1 / 3), norm(dsc + (2 * q1) / 3),
    mc, norm(mc + q2 / 3), norm(mc + (2 * q2) / 3),
  ];
  return { asc: a, mc, cusps };
}

describe("compositeMidpoint and the antipodal policy", () => {
  it("is the shorter-arc midpoint and symmetric", () => {
    expect(compositeMidpoint(10, 50).longitude).toBeCloseTo(30, 12);
    expect(compositeMidpoint(350, 10).longitude).toBeCloseTo(0, 12);
    expect(compositeMidpoint(10, 350).longitude).toBeCloseTo(0, 12);
    expect(compositeMidpoint(100, 100).longitude).toBeCloseTo(100, 12);
    expect(compositeMidpoint(100, 100).antipodal).toBe(false);
  });
  it("exact opposition: deterministic, order independent, flagged", () => {
    const r1 = compositeMidpoint(0, 180);
    const r2 = compositeMidpoint(180, 0);
    expect(r1).toEqual({ longitude: 90, antipodal: true });
    expect(r2).toEqual(r1);
    // arc not crossing 0 Aries
    expect(compositeMidpoint(350, 170).longitude).toBeCloseTo(260, 12);
    expect(compositeMidpoint(170, 350).longitude).toBeCloseTo(260, 12);
  });
  it("flags only pairs within epsilon of opposition", () => {
    expect(compositeMidpoint(10, 190.0005).antipodal).toBe(true);
    const far = compositeMidpoint(10, 190.01);
    expect(far.antipodal).toBe(false);
    // 190.01 - 10 = 180.01 -> shorter arc goes the other way: 10 - 89.995
    expect(far.longitude).toBeCloseTo(280.005, 9);
    expect(compositeMidpoint(10, 190.0005, 1e-6).antipodal).toBe(false);
  });
});

describe("composite angles", () => {
  it("midpoint ASC/MC, DSC and IC opposite", () => {
    const { angles, notices } = computeCompositeAngles(
      { ascendant: 100, mc: 10 },
      { ascendant: 140, mc: 50 }
    );
    expect(angles.ascendant).toBeCloseTo(120, 12);
    expect(angles.mc).toBeCloseTo(30, 12);
    expect(angles.descendant).toBeCloseTo(300, 12);
    expect(angles.ic).toBeCloseTo(210, 12);
    expect(notices).toEqual([]);
  });
  it("keeps MC consistent with ASC when the MC midpoint lands on the far side", () => {
    // ASCs 0 and 180 (antipodal -> 90). MCs 270 and 90 (antipodal -> arithmetic 180).
    // ASC - MC = 90 - 180 = -90 -> not in (0,180): opposite (0) is used: ASC - MC = 90.
    const { angles, notices } = computeCompositeAngles(
      { ascendant: 0, mc: 270 },
      { ascendant: 180, mc: 90 }
    );
    expect(angles.ascendant).toBeCloseTo(90, 12);
    expect(angles.mc).toBeCloseTo(0, 12);
    expect(norm(angles.ascendant - angles.mc)).toBeGreaterThan(0);
    expect(norm(angles.ascendant - angles.mc)).toBeLessThan(180);
    expect(notices.some((n) => n.type === "antipodal")).toBe(true);
    expect(notices.some((n) => n.type === "mc_flipped")).toBe(true);
  });
});

describe("composite cusps", () => {
  it("whole-sign boundaries: house 1 starts at 0 degrees of the composite ASC sign", () => {
    const run = (asc: number) =>
      computeCompositeCusps({ cuspsA: [], cuspsB: [], ascA: 0, ascB: 0, wholeSign: true, compositeAsc: asc }).cusps;
    expect(run(29.999)[0]).toBe(0);
    expect(run(30)[0]).toBe(30);
    expect(run(30.001)[0]).toBe(30);
    expect(run(0.001)[0]).toBe(0);
    expect(run(359.999).slice(0, 2)).toEqual([330, 0]);
    const c = run(75.5);
    expect(c).toEqual([60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 0, 30]);
  });

  it("midpoint cusps are strictly increasing mod 360 over a grid of synthetic chart pairs", () => {
    const charts = [];
    for (let a = 0; a < 360; a += 37) for (const d of [25, 90, 160]) charts.push(syntheticChart(a + 0.3, d));
    let pairs = 0;
    for (const A of charts) {
      expect(cuspsStrictlyIncreasing(A.cusps)).toBe(true);
      for (const B of charts) {
        const ang = computeCompositeAngles(
          { ascendant: A.asc, mc: A.mc },
          { ascendant: B.asc, mc: B.mc }
        ).angles;
        const r = computeCompositeCusps({
          cuspsA: A.cusps,
          cuspsB: B.cusps,
          ascA: A.asc,
          ascB: B.asc,
          wholeSign: false,
          compositeAsc: ang.ascendant,
        });
        expect(r.cusps).toHaveLength(12);
        expect(cuspsStrictlyIncreasing(r.cusps)).toBe(true);
        expect(r.cusps[0]).toBeCloseTo(ang.ascendant, 9);
        // angles consistent with each other and with cusp 10 / cusp 4 / cusp 7
        const lead = norm(ang.ascendant - ang.mc);
        expect(lead).toBeGreaterThan(0);
        expect(lead).toBeLessThan(180);
        expect(Math.abs(norm(r.cusps[9] - ang.mc + 180) - 180)).toBeLessThan(1e-6);
        expect(Math.abs(norm(r.cusps[3] - ang.ic + 180) - 180)).toBeLessThan(1e-6);
        expect(Math.abs(norm(r.cusps[6] - ang.descendant + 180) - 180)).toBeLessThan(1e-6);
        pairs++;
      }
    }
    expect(pairs).toBe(charts.length * charts.length);
  });

  it("corrects a cusp whose shorter-arc midpoint falls on the opposite side", () => {
    const A = syntheticChart(0, 90);
    // B identical except cusp 5 is moved so that the midpoint with A's cusp 5 is antipodal-flipped
    const B = syntheticChart(0, 90);
    const cuspsB = [...B.cusps];
    cuspsB[4] = norm(A.cusps[4] + 200); // diff 200 -> shorter-arc midpoint is on the far side of the zodiac
    const r = computeCompositeCusps({
      cuspsA: A.cusps,
      cuspsB,
      ascA: A.asc,
      ascB: B.asc,
      wholeSign: false,
      compositeAsc: A.asc,
    });
    expect(cuspsStrictlyIncreasing(r.cusps)).toBe(true);
    expect(r.method.correctedCusps.length + (r.method.fallback ? 1 : 0)).toBeGreaterThan(0);
  });
});

describe("getCompositeChart (chart level)", () => {
  beforeAll(async () => {
    await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
  });
  afterAll(() => closeSwissEph());

  const opt = (iso: string, houseSystem: HouseSystem) => ({
    date: new Date(iso),
    latitude: 20,
    longitude: 0,
    houseSystem,
    timeZoneSettings: { treatAsUTC: true },
  });

  it("whole-sign composite houses start at 0 degrees of the composite ASC sign (repro 12Z + 14Z)", async () => {
    const c = await getCompositeChart({
      chartA: opt("2000-01-01T12:00:00Z", HouseSystem.WHOLE_SIGN),
      chartB: opt("2000-01-01T14:00:00Z", HouseSystem.WHOLE_SIGN),
    });
    const a = c.chartA.houses.ascendant.longitude;
    const b = c.chartB.houses.ascendant.longitude;
    const expectedAsc = norm(a + ((((b - a + 540) % 360) - 180) / 2));
    expect(c.compositeAngles.ascendant.longitude).toBeCloseTo(expectedAsc, 9);
    const start = Math.floor(expectedAsc / 30) * 30;
    const cusps = c.compositeHouses.map((h) => h.longitude);
    for (let i = 0; i < 12; i++) expect(cusps[i]).toBeCloseTo(norm(start + 30 * i), 9);
    // the old behaviour produced 15, 45, ... (midpoints of whole-sign cusps)
    expect(cusps[0] % 30).toBeCloseTo(0, 9);
    expect(c.compositeMethod.houses).toBe("whole-sign");
    expect(c.compositeAngles.mc.longitude).toBeGreaterThanOrEqual(0);
    expect(c.compositeAngles.descendant.longitude).toBeCloseTo(norm(expectedAsc + 180), 9);
  });

  it("Placidus composite: cusps ordered, cusp 1 = ASC, aspects only reference existing points", async () => {
    const c = await getCompositeChart({
      chartA: { ...opt("2000-01-01T12:00:00Z", HouseSystem.PLACIDUS), latitude: 35 },
      chartB: { ...opt("1987-06-20T03:30:00Z", HouseSystem.PLACIDUS), latitude: 35 },
    });
    const cusps = c.compositeHouses.map((h) => h.longitude);
    expect(cuspsStrictlyIncreasing(cusps)).toBe(true);
    expect(cusps[0]).toBeCloseTo(c.compositeAngles.ascendant.longitude, 9);
    expect(cusps[9]).toBeCloseTo(c.compositeAngles.mc.longitude, 6);
    expect(c.compositeMethod.houses).toBe("midpoint-of-corresponding-cusps");
    const keys = new Set(Object.keys(c.compositePlanets));
    for (const e of c.aspects) {
      expect(keys.has(e.planetA)).toBe(true);
      expect(keys.has(e.planetB)).toBe(true);
      expect(e.longitudeA).toBeCloseTo(c.compositePlanets[e.planetA].longitude, 12);
    }
  });
});
