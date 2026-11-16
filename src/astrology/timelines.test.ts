import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { TimelineError } from "./firdaria";
import { getBirthChart, HouseSystem, type BirthChart } from "./index";
import {
  DEFAULT_RETURN_PASS_KINDS,
  getReturnPassTimeline,
  MAX_RETURN_TIMELINE_YEARS,
  type ReturnPassKind,
} from "./timelines";
import { sampleBodyAtJd } from "./returns";
import { closeSwissEph, getSwissEph, Planet } from "./swisseph";

const YEAR_MS = 365.25 * 86_400_000;
const angDiff = (a: number, b: number) => {
  const d = Math.abs((((a - b) % 360) + 360) % 360);
  return d > 180 ? 360 - d : d;
};

describe("return pass timeline", () => {
  const birth = new Date(Date.UTC(1990, 5, 15, 12));
  let natal: BirthChart;
  beforeAll(async () => {
    await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
    natal = await getBirthChart({
      date: birth,
      latitude: 40,
      longitude: -74,
      houseSystem: HouseSystem.WHOLE_SIGN,
      timeZoneSettings: { treatAsUTC: true },
    });
  });
  afterAll(() => closeSwissEph());

  const window = () => ({ from: birth, to: new Date(birth.getTime() + 55 * YEAR_MS) });

  it("returns every pass of all default kinds, sorted, each verified and carrying solver metadata", () => {
    const t = getReturnPassTimeline({ natalChart: natal, ...window() });
    expect(t.entries.length).toBeGreaterThan(5);
    for (let i = 0; i < t.entries.length - 1; i++) expect(t.entries[i].jd).toBeLessThanOrEqual(t.entries[i + 1].jd);
    const bodies: Record<ReturnPassKind, Planet> = {
      "saturn-return": Planet.SATURN,
      "jupiter-return": Planet.JUPITER,
      "uranus-opposition": Planet.URANUS,
      "mean-nodal-return": Planet.MEAN_NODE,
      "true-nodal-return": Planet.TRUE_NODE,
      "solar-return": Planet.SUN,
    };
    for (const e of t.entries) {
      expect(e.residualDegrees).toBeLessThanOrEqual(1e-6);
      // independent check: the body really is at the target longitude at the reported JD
      const lon = sampleBodyAtJd(bodies[e.kind], e.jd).longitude;
      expect(angDiff(lon, e.targetLongitude)).toBeLessThan(1e-5);
      expect(e.instant.getTime()).toBeGreaterThanOrEqual(birth.getTime());
      expect(e.solver.method.solver).toMatch(/bisection/);
      expect(e.solver.timeToleranceSeconds).toBeGreaterThan(0);
    }
    expect(Object.keys(t.searches).sort()).toEqual([...DEFAULT_RETURN_PASS_KINDS].sort());
    expect(t.method.solver.timeScale).toBe("UT Julian Day");
  });

  it("finds Saturn returns near age 29-30, Jupiter near 12/24/36/48, Uranus opposition near 40-46, nodal near 18.6", () => {
    const t = getReturnPassTimeline({ natalChart: natal, ...window() });
    const age = (e: { instant: Date }) => (e.instant.getTime() - birth.getTime()) / YEAR_MS;
    const sat = t.entries.filter((e) => e.kind === "saturn-return");
    // Saturn is retrograde at this synthetic birth, so it crosses the natal longitude again a few months
    // later (genuine pass at age ~0.5); the later passes are the Saturn return proper.
    expect(sat[0].passIndex).toBe(1);
    expect(age(sat[0])).toBeLessThan(1);
    const returnProper = sat.filter((e) => age(e) > 1);
    expect(returnProper.length).toBeGreaterThanOrEqual(1);
    expect(returnProper.length).toBeLessThanOrEqual(3);
    for (const e of returnProper) {
      expect(age(e)).toBeGreaterThan(28);
      expect(age(e)).toBeLessThan(31);
      expect(e.eventKind).toBe("return");
      expect(e.passCount).toBe(sat.length);
    }
    expect(sat.map((e) => e.passIndex)).toEqual(sat.map((_, i) => i + 1));
    const jup = t.entries.filter((e) => e.kind === "jupiter-return");
    expect(new Set(jup.map((e) => Math.round(age(e) / 11.86))).size).toBeGreaterThanOrEqual(4);
    const ura = t.entries.filter((e) => e.kind === "uranus-opposition");
    expect(ura.length).toBeGreaterThanOrEqual(1);
    for (const e of ura) {
      expect(e.eventKind).toBe("opposition");
      expect(age(e)).toBeGreaterThan(40);
      expect(age(e)).toBeLessThan(46); // half of an 84y cycle, eccentric orbit
      expect(angDiff(e.targetLongitude, e.natalLongitude)).toBeCloseTo(180, 9);
    }
    const mean = t.entries.filter((e) => e.kind === "mean-nodal-return");
    expect(mean.map((e) => Math.round(age(e)))).toEqual([19, 37]);
  });

  it("drops the trivial pass at the natal instant (and can keep it)", () => {
    const kept = getReturnPassTimeline({ natalChart: natal, ...window(), kinds: ["saturn-return"], excludeNatalInstant: false });
    const dropped = getReturnPassTimeline({ natalChart: natal, ...window(), kinds: ["saturn-return"] });
    expect(kept.entries.length).toBe(dropped.entries.length + 1);
    expect(Math.abs(kept.entries[0].instant.getTime() - birth.getTime())).toBeLessThan(5000);
    expect(dropped.excludedNatalInstantPasses).toBe(1);
    expect(kept.excludedNatalInstantPasses).toBe(0);
  });

  it("matches the underlying returns module and can be restricted to chosen kinds", async () => {
    const { findSaturnReturns } = await import("./returns");
    const direct = findSaturnReturns({ natalChart: natal, ...window() });
    const t = getReturnPassTimeline({ natalChart: natal, ...window(), kinds: ["saturn-return"] });
    expect(t.entries.map((e) => e.jd)).toEqual(direct.crossings.map((c) => c.jd).filter((jd) => jd - direct.crossings[0].jd > 1));
    expect(Object.keys(t.searches)).toEqual(["saturn-return"]);
  });

  it("is bounded: typed errors for unbounded, inverted and oversized windows", () => {
    const code = (fn: () => unknown) => {
      try {
        fn();
      } catch (e) {
        expect(e).toBeInstanceOf(TimelineError);
        return (e as TimelineError).code;
      }
      return null;
    };
    expect(code(() => getReturnPassTimeline({ natalChart: natal, from: birth, to: new Date(NaN) }))).toBe("UNBOUNDED_INPUT");
    expect(code(() => getReturnPassTimeline({ natalChart: natal, from: birth, to: birth }))).toBe("INVALID_RANGE");
    expect(
      code(() =>
        getReturnPassTimeline({
          natalChart: natal,
          from: birth,
          to: new Date(birth.getTime() + (MAX_RETURN_TIMELINE_YEARS + 1) * YEAR_MS),
        })
      )
    ).toBe("RANGE_TOO_LARGE");
    expect(code(() => getReturnPassTimeline({ natalChart: natal, ...window(), kinds: [] }))).toBe("INVALID_INPUT");
    expect(code(() => getReturnPassTimeline({ natalChart: natal, ...window(), kinds: ["bogus" as never] }))).toBe("INVALID_INPUT");
  });
});
