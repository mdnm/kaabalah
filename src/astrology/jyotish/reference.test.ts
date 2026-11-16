/**
 * LAYER 2: independent numerical reference.
 *
 * Expected values in `fixtures/reference-synthetic.json` were produced by the
 * reference Python implementation (Astropy 8.0.2 / pyerfa 2.0.1.5 / pyswisseph
 * 2.10.3.2) for INVENTED instants and locations (see the fixture's provenance).
 * No private data is involved.
 *
 * Three separately-reported comparisons:
 *  (a) frame mathematics (GC RA of date, zero RA): pure TypeScript vs Astropy;
 *  (b) Swiss-file ephemeris: same Swiss files in both, so a binding/
 *      implementation cross-check, NOT independent ephemeris validation;
 *  (c) Moshier ephemeris (the reference-fixture setting): separately recorded.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import fixture from "./fixtures/reference-synthetic.json";
import { closeSwissEph, getSwissEph } from "../swisseph";
import { calculateDhruvaChart, getDhruvaOrigin } from "./dhruva";
import { calculateLahiriChart } from "./lahiri";
import { signedAngleBetween } from "./frames";

type Eph = "swiss" | "moshier";

interface RefPoint {
  ra: number; nakPos: number; nakshatra: string; pada: number; fraction: number; lon: number; lat: number; dec: number;
}
interface RefRecord {
  kind: string; utc: string; julianDayUt: number; latitude: number; longitude: number;
  origin: { gcRaOfDate: number; gcDecOfDate: number; zeroRa: number };
  mercuryZeroLatitudeProjection?: { nakshatra: string; pada: number; nak_pos: number };
  swiss: RefEph; moshier: RefEph;
}
interface RefEph {
  trueObliquity: number;
  points: Record<string, RefPoint>;
  lahiri: { ayanamsa: number; ascendant: number; bodies: Record<string, number> };
}
const records = fixture.records as unknown as RefRecord[];

const FRAME_TOLERANCE_DEG = 1e-6;
const EPHEMERIS_TOLERANCE_DEG = { swiss: 1e-6, moshier: 1e-6 } as const;
/**
 * Moshier TRUE node: the WASM build and pyswisseph 2.10.3.2 differ by up to
 * ~1.2e-5 deg (0.04 arcsec) in the analytic true-node value; every other Moshier
 * body, and every Swiss-file value, agrees to < 1e-6 deg. Recorded, not hidden.
 */
const MOSHIER_TRUE_NODE_TOLERANCE_DEG = 2e-5;
const isTrueNode = (name: string) => name === "true_node" || name === "ketu_true";

const absDiff = (a: number, b: number) => Math.abs(signedAngleBetween(a, b));

describe("jyotish reference fixtures: (a) frame mathematics vs Astropy", () => {
  it("matches the FK5-of-date GC right ascension, declination and zero RA", () => {
    let maxRa = 0, maxDec = 0, maxZero = 0;
    for (const r of records) {
      const o = getDhruvaOrigin(r.julianDayUt);
      maxRa = Math.max(maxRa, absDiff(o.gcRightAscensionOfDate, r.origin.gcRaOfDate));
      maxDec = Math.max(maxDec, Math.abs(o.gcDeclinationOfDate - r.origin.gcDecOfDate));
      maxZero = Math.max(maxZero, absDiff(o.zeroRightAscension, r.origin.zeroRa));
    }
    // eslint-disable-next-line no-console
    console.info("[jyotish frame residuals deg]", { records: records.length, maxRa, maxDec, maxZero });
    expect(maxRa).toBeLessThan(FRAME_TOLERANCE_DEG);
    expect(maxDec).toBeLessThan(FRAME_TOLERANCE_DEG);
    expect(maxZero).toBeLessThan(FRAME_TOLERANCE_DEG);
  });
});

for (const eph of ["swiss", "moshier"] as Eph[]) {
  describe(`jyotish reference fixtures: (${eph === "swiss" ? "b" : "c"}) ${eph} ephemeris`, () => {
    beforeAll(async () => {
      await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
    });
    afterAll(() => closeSwissEph());

    it("Dhruva placements match the reference", () => {
      let maxRa = 0, maxNak = 0, maxObl = 0, labels = 0, labelMismatches = 0;
      const bad: string[] = [];
      const worst: Record<string, number> = {};
      let maxTrueNode = 0;
      for (const r of records) {
        const ref = r[eph];
        const chart = calculateDhruvaChart({
          date: new Date(r.utc), julianDayUt: r.julianDayUt, latitude: r.latitude, longitude: r.longitude, ephemeris: eph,
        });
        maxObl = Math.max(maxObl, Math.abs((chart.trueObliquity ?? NaN) - ref.trueObliquity));
        const mine: Record<string, typeof chart.points.sun> = {
          ...chart.points,
          mean_node: chart.nodeVariants.mean.rahu,
          true_node: chart.nodeVariants.true.rahu,
          ketu_mean: chart.nodeVariants.mean.ketu,
          ketu_true: chart.nodeVariants.true.ketu,
        };
        for (const [name, rp] of Object.entries(ref.points)) {
          const p = mine[name];
          if (!p) continue;
          if (absDiff(p.rightAscension, rp.ra) > 1e-7) worst[name] = Math.max(worst[name] ?? 0, absDiff(p.rightAscension, rp.ra));
          if (isTrueNode(name)) {
            maxTrueNode = Math.max(maxTrueNode, absDiff(p.rightAscension, rp.ra));
            
          } else {
            maxRa = Math.max(maxRa, absDiff(p.rightAscension, rp.ra));
            maxNak = Math.max(maxNak, absDiff(p.nakPos, rp.nakPos));
          }
          labels++;
          const same = p.nakshatraId === rp.nakshatra && p.pada === rp.pada;
          if (!same) {
            labelMismatches++;
            bad.push(`${r.kind}/${name}: ${p.nakshatraId}-${p.pada} vs ${rp.nakshatra}-${rp.pada} dNak=${absDiff(p.nakPos, rp.nakPos)}`);
          }
        }
      }
      // eslint-disable-next-line no-console
      console.info(`[jyotish ${eph} dhruva residuals]`, { labels, labelMismatches, maxRaDeg: maxRa, maxNakPosDeg: maxNak, maxObliquityDeg: maxObl, maxTrueNodeRaDeg: maxTrueNode, worstOver1e7: worst });
      expect(maxRa).toBeLessThan(EPHEMERIS_TOLERANCE_DEG[eph]);
      expect(maxNak).toBeLessThan(EPHEMERIS_TOLERANCE_DEG[eph]);
      expect(maxObl).toBeLessThan(1e-6);
      expect(maxTrueNode).toBeLessThan(eph === "moshier" ? MOSHIER_TRUE_NODE_TOLERANCE_DEG : EPHEMERIS_TOLERANCE_DEG[eph]);
      expect(bad).toEqual([]);
    });

    it("Lahiri ayanamsa, sidereal longitudes and sidereal ascendant match pyswisseph", () => {
      let maxAya = 0, maxLon = 0, maxAsc = 0, maxTrueNode = 0;
      for (const r of records) {
        const ref = r[eph].lahiri;
        const chart = calculateLahiriChart({
          date: new Date(r.utc), julianDayUt: r.julianDayUt, latitude: r.latitude, longitude: r.longitude, ephemeris: eph,
        });
        maxAya = Math.max(maxAya, Math.abs(chart.ayanamsa - ref.ayanamsa));
        maxAsc = Math.max(maxAsc, absDiff(chart.ascendant!.longitude, ref.ascendant));
        const mine: Record<string, number> = {
          ...Object.fromEntries(Object.entries(chart.points).map(([k, v]) => [k, v!.longitude])),
          mean_node: chart.nodeVariants.mean.rahu.longitude,
          true_node: chart.nodeVariants.true.rahu.longitude,
        };
        for (const k of ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "mean_node", "true_node"]) {
          if (k === "true_node") maxTrueNode = Math.max(maxTrueNode, absDiff(mine[k], ref.bodies[k]));
          else maxLon = Math.max(maxLon, absDiff(mine[k], ref.bodies[k]));
        }
      }
      // eslint-disable-next-line no-console
      console.info(`[jyotish ${eph} lahiri residuals]`, { maxAyanamsaDeg: maxAya, maxSiderealLongitudeDeg: maxLon, maxSiderealTrueNodeDeg: maxTrueNode, maxSiderealAscendantDeg: maxAsc });
      expect(maxAya).toBeLessThan(1e-6);
      expect(maxLon).toBeLessThan(1e-6);
      expect(maxAsc).toBeLessThan(1e-6);
      expect(maxTrueNode).toBeLessThan(eph === "moshier" ? MOSHIER_TRUE_NODE_TOLERANCE_DEG : 1e-6);
    });
  });
}

describe("jyotish reference fixtures: latitude retention (Mercury)", () => {
  beforeAll(async () => {
    await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
  });
  afterAll(() => closeSwissEph());

  const cases = records.filter((r) => r.kind === "mercury-latitude-discriminator");
  it("has discriminating instants", () => expect(cases.length).toBeGreaterThan(0));
  for (const r of cases) {
    it(`actual-latitude RA differs from a zero-latitude projection at ${r.utc}`, () => {
      const chart = calculateDhruvaChart({
        date: new Date(r.utc), julianDayUt: r.julianDayUt, latitude: r.latitude, longitude: r.longitude,
      });
      const m = chart.points.mercury!;
      const zero = r.mercuryZeroLatitudeProjection!;
      expect({ n: m.nakshatraId, p: m.pada }).toEqual({ n: r.swiss.points.mercury.nakshatra, p: r.swiss.points.mercury.pada });
      expect(Math.abs(m.latitude)).toBeGreaterThan(1.5);
      expect(`${m.nakshatraId}-${m.pada}`).not.toBe(`${zero.nakshatra}-${zero.pada}`);
    });
  }
});
