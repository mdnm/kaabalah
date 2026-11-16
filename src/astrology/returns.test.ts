import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  findBodyLongitudeCrossings,
  findJupiterReturns,
  findLunarReturns,
  findNodalReturns,
  findPlanetaryReturns,
  findSaturnReturns,
  findSolarReturns,
  findUranusOppositions,
  sampleBodyAtJd,
} from './returns';
import { dateToJd, jdToDate, signedAngleDifference } from './root-solver';
import { getSolarReturnChart, HouseSystem, type BirthChartOptions } from './index';
import { calculateSinglePlanetPosition, closeSwissEph, getSwissEph, Planet } from './swisseph';

const day = (iso: string) => new Date(iso);

/** Independent extremum search on raw longitude (golden section), not using the solver. */
function extremum(body: Planet, aroundIso: string, kind: 'max' | 'min', halfWidthDays = 3) {
  const c = dateToJd(day(aroundIso));
  let a = c - halfWidthDays;
  let b = c + halfWidthDays;
  const g = (t: number) => (kind === 'max' ? 1 : -1) * signedAngleDifference(sampleBodyAtJd(body, t).longitude - sampleBodyAtJd(body, c).longitude);
  const phi = (Math.sqrt(5) - 1) / 2;
  for (let i = 0; i < 80; i++) {
    const x1 = b - phi * (b - a);
    const x2 = a + phi * (b - a);
    if (g(x1) > g(x2)) b = x2;
    else a = x1;
  }
  const t = (a + b) / 2;
  return { jd: t, longitude: sampleBodyAtJd(body, t).longitude };
}

/** Residual of the root instant evaluated through whole-second ephemeris calls + speed correction. */
function independentResidual(body: Planet, jd: number, target: number) {
  const ms = (jd - 2440587.5) * 86400000;
  const floorMs = Math.floor(ms / 1000) * 1000;
  const p = calculateSinglePlanetPosition(new Date(floorMs), body);
  const lon = p.longitude + (p.longitudeSpeed ?? 0) * ((ms - floorMs) / 86400000);
  return Math.abs(signedAngleDifference(lon - target));
}

describe('ephemeris-backed exact crossings', () => {
  beforeAll(async () => {
    await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
  });
  afterAll(() => closeSwissEph());

  describe('Saturn station (2026-07-26, direct -> retrograde, longitude maximum)', () => {
    const peak = () => extremum(Planet.SATURN, '2026-07-26T19:56:31Z', 'max');
    const window = { from: day('2026-07-25T12:00:00Z'), to: day('2026-07-27T12:00:00Z') }; // ~2 days
    const run = (target: number, extra = {}) =>
      findBodyLongitudeCrossings({ body: Planet.SATURN, targetLongitude: target, ...window, stepDays: 2, ...extra });

    it('finds both passes 1e-4 degrees inside the extremum with a coarse step', () => {
      const L = peak().longitude;
      const r = run(L - 1e-4);
      expect(r.crossings).toHaveLength(2);
      expect(r.crossings[0].direction).toBe('direct');
      expect(r.crossings[1].direction).toBe('retrograde');
      expect(r.crossings.map((c) => c.passIndex)).toEqual([1, 2]);
      expect(r.crossings[0].passCount).toBe(2);
      for (const c of r.crossings) {
        expect(c.residualDegrees).toBeLessThanOrEqual(1e-6);
        expect(independentResidual(Planet.SATURN, c.jd, r.targetLongitude)).toBeLessThanOrEqual(1e-6);
      }
      // Both lie within a couple of days, symmetric around the station.
      expect(r.crossings[1].jd - r.crossings[0].jd).toBeLessThan(2);
      expect(r.crossings[1].jd - r.crossings[0].jd).toBeGreaterThan(0.01);
      const mid = (r.crossings[0].jd + r.crossings[1].jd) / 2;
      expect(Math.abs(mid - peak().jd)).toBeLessThan(0.01);
    });

    it('finds no root just outside the extremum but reports a closest approach on request', () => {
      const L = peak().longitude;
      const r = run(L + 1e-4, { includeClosestApproaches: true });
      expect(r.crossings).toEqual([]);
      expect(r.closestApproaches).toHaveLength(1);
      expect(r.closestApproaches[0].separationDegrees).toBeGreaterThan(0.99e-4);
      expect(r.closestApproaches[0].separationDegrees).toBeLessThan(1.01e-4);
    });

    it('treats a 5e-7 degree near miss as no root (closest approach only)', () => {
      const L = peak().longitude;
      const r = run(L + 5e-7, { includeClosestApproaches: true });
      expect(r.crossings).toEqual([]);
      expect(r.closestApproaches).toHaveLength(1);
      expect(r.closestApproaches[0].separationDegrees).toBeLessThan(1e-6);
      expect(r.closestApproaches[0].kind).toBe('closest-approach');
    });

    it('deduplicates an exact tangent at the station into one root', () => {
      const L = peak().longitude;
      const r = run(L);
      expect(r.crossings).toHaveLength(1);
      expect(r.crossings[0].tangent).toBe(true);
      expect(r.crossings[0].direction).toBe('stationary');
      expect(Math.abs(r.crossings[0].jd - peak().jd)).toBeLessThan(0.01);
    });
  });

  describe('Jupiter station (2026-03-11, retrograde -> direct, longitude minimum)', () => {
    it('finds two passes just above the minimum and none just below', () => {
      const m = extremum(Planet.JUPITER, '2026-03-11T03:29:52Z', 'min');
      const common = { body: Planet.JUPITER, from: day('2026-03-10T00:00:00Z'), to: day('2026-03-12T12:00:00Z'), stepDays: 2 };
      const inside = findBodyLongitudeCrossings({ ...common, targetLongitude: m.longitude + 1e-4 });
      expect(inside.crossings.map((c) => c.direction)).toEqual(['retrograde', 'direct']);
      for (const c of inside.crossings) expect(c.residualDegrees).toBeLessThanOrEqual(1e-6);
      const outside = findBodyLongitudeCrossings({ ...common, targetLongitude: m.longitude - 1e-4 });
      expect(outside.crossings).toEqual([]);
    });
  });

  describe('wrap discontinuities', () => {
    it('finds a Sun crossing of 0/360 once', () => {
      const r = findBodyLongitudeCrossings({
        body: Planet.SUN,
        targetLongitude: 0,
        from: day('2026-03-18T00:00:00Z'),
        to: day('2026-03-23T00:00:00Z'),
        stepDays: 1,
      });
      expect(r.crossings).toHaveLength(1);
      expect(r.crossings[0].residualDegrees).toBeLessThanOrEqual(1e-6);
      expect(r.crossings[0].instant.toISOString().slice(0, 10)).toBe('2026-03-20');
      const r2 = findBodyLongitudeCrossings({ ...{ body: Planet.SUN, from: day('2026-03-18T00:00:00Z'), to: day('2026-03-23T00:00:00Z') }, targetLongitude: 359.9, stepDays: 1 });
      expect(r2.crossings).toHaveLength(1);
    });

    it('rejects the 180-degree antipode jump (Sun at 180 vs target 0)', () => {
      const r = findBodyLongitudeCrossings({
        body: Planet.SUN,
        targetLongitude: 0,
        from: day('2026-09-20T00:00:00Z'),
        to: day('2026-09-26T00:00:00Z'),
        stepDays: 1,
      });
      expect(r.crossings).toEqual([]);
      expect(r.rejected).toEqual([]);
    });
  });

  describe('boundary passes', () => {
    it('retains a pass that lies exactly at the window start or end', () => {
      const probe = findBodyLongitudeCrossings({
        body: Planet.SUN,
        targetLongitude: 120,
        from: day('2026-07-20T00:00:00Z'),
        to: day('2026-07-26T00:00:00Z'),
      });
      expect(probe.crossings).toHaveLength(1);
      const t = probe.crossings[0].instant;
      const atStart = findBodyLongitudeCrossings({ body: Planet.SUN, targetLongitude: 120, from: t, to: day('2026-07-28T00:00:00Z') });
      expect(atStart.crossings).toHaveLength(1);
      expect(atStart.crossings[0].boundary).toBe(true);
      const atEnd = findBodyLongitudeCrossings({ body: Planet.SUN, targetLongitude: 120, from: day('2026-07-20T00:00:00Z'), to: t });
      expect(atEnd.crossings).toHaveLength(1);
      expect(atEnd.crossings[0].boundary).toBe(true);
      expect(atEnd.crossings[0].residualDegrees).toBeLessThanOrEqual(1e-6);
    });
  });

  describe('returns', () => {
    it('finds all three passes of a Saturn return inside a retrograde loop with alternating motion', () => {
      // Saturn loop 2026: stations at ~14.75 deg (Jul) and ~7.93 deg (Dec). A natal Saturn at 11 deg is crossed 3 times.
      const r = findSaturnReturns({
        natalLongitude: 11,
        from: day('2026-01-01T00:00:00Z'),
        to: day('2027-06-30T00:00:00Z'),
      });
      expect(r.eventKind).toBe('return');
      expect(r.crossings).toHaveLength(3);
      expect(r.crossings.map((c) => c.direction)).toEqual(['direct', 'retrograde', 'direct']);
      for (let i = 1; i < r.crossings.length; i++) {
        expect(Math.sign(r.crossings[i].speedDegreesPerDay)).toBe(-Math.sign(r.crossings[i - 1].speedDegreesPerDay));
        expect(r.crossings[i].jd).toBeGreaterThan(r.crossings[i - 1].jd);
      }
      for (const c of r.crossings) {
        expect(independentResidual(Planet.SATURN, c.jd, 11)).toBeLessThanOrEqual(1e-6);
        expect(c.passCount).toBe(3);
      }
    });

    it('finds a single Saturn pass for a longitude outside the loop', () => {
      const r = findSaturnReturns({ natalLongitude: 20, from: day('2026-01-01T00:00:00Z'), to: day('2027-06-30T00:00:00Z') });
      expect(r.crossings.length).toBe(1);
      expect(r.crossings[0].direction).toBe('direct');
    });

    it('finds all Jupiter passes in a 2026 retrograde loop', () => {
      // Jupiter loop: min 105.087 (Mar) ... max 147.02 (Dec) is a different loop; use 2026-12 station region.
      const hi = extremum(Planet.JUPITER, '2026-12-13T00:56:41Z', 'max', 5).longitude;
      const r = findJupiterReturns({
        natalLongitude: hi - 3,
        from: day('2026-09-01T00:00:00Z'),
        to: day('2027-07-30T00:00:00Z'),
      });
      expect(r.crossings.length === 3 || r.crossings.length === 1).toBe(true);
      expect(r.crossings[0].direction).toBe('direct');
      for (const c of r.crossings) expect(c.residualDegrees).toBeLessThanOrEqual(1e-6);
    });

    it('finds the three Uranus oppositions of a retrograde loop (generic natal-chart lookup)', () => {
      // Take the Uranus loop from raw sampling: retrograde interval and its longitude extremes.
      let first: number | undefined;
      let last: number | undefined;
      let lo = Infinity;
      let hi = -Infinity;
      const base = dateToJd(day('2026-01-01T00:00:00Z'));
      for (let d = 0; d < 700; d++) {
        const s = sampleBodyAtJd(Planet.URANUS, base + d);
        if (s.speed < 0) {
          first ??= d;
          last = d;
          lo = Math.min(lo, s.longitude);
          hi = Math.max(hi, s.longitude);
        }
      }
      expect(first).toBeDefined();
      const mid = (lo + hi) / 2;
      const natalChart = { planets: { uranus: { longitude: (mid + 180) % 360 } } };
      const r = findUranusOppositions({
        natalChart,
        from: jdToDate(base + first! - 200),
        to: jdToDate(base + last! + 200),
      });
      expect(r.eventKind).toBe('opposition');
      expect(r.offsetDegrees).toBe(180);
      expect(r.targetLongitude).toBeCloseTo(mid, 9);
      expect(r.crossings).toHaveLength(3);
      expect(r.crossings.map((c) => c.direction)).toEqual(['direct', 'retrograde', 'direct']);
      for (const c of r.crossings) expect(independentResidual(Planet.URANUS, c.jd, r.targetLongitude)).toBeLessThanOrEqual(1e-6);
    });

    it('finds nodal and lunar returns with verified residuals', () => {
      const node = findNodalReturns({ natalLongitude: 100, from: day('2026-01-01T00:00:00Z'), to: day('2045-01-01T00:00:00Z'), stepDays: 2 });
      expect(node.crossings.length).toBeGreaterThanOrEqual(1);
      for (const c of node.crossings) expect(c.residualDegrees).toBeLessThanOrEqual(1e-6);
      const trueNode = findNodalReturns({ node: 'true', natalLongitude: 100, from: day('2026-01-01T00:00:00Z'), to: day('2045-01-01T00:00:00Z'), stepDays: 2 });
      expect(trueNode.body).toBe(Planet.TRUE_NODE);
      expect(trueNode.crossings.length).toBeGreaterThanOrEqual(1);
      const moon = findLunarReturns({ natalLongitude: 33, from: day('2026-01-01T00:00:00Z'), to: day('2026-03-01T00:00:00Z') });
      expect(moon.crossings.length === 2 || moon.crossings.length === 3).toBe(true);
      for (const c of moon.crossings) {
        expect(c.residualDegrees).toBeLessThanOrEqual(1e-6);
        expect(independentResidual(Planet.MOON, c.jd, 33)).toBeLessThanOrEqual(1e-6);
      }
    });

    it('supports generic body/target/window and natal-chart lookup, and rejects missing natal data', () => {
      const chart = { planets: { sun: { longitude: 77.5 }, 'true node': { longitude: 10 } } };
      const r = findPlanetaryReturns({ body: Planet.SUN, natalChart: chart, from: day('2026-06-01T00:00:00Z'), to: day('2026-06-30T00:00:00Z') });
      expect(r.natalLongitude).toBe(77.5);
      expect(r.crossings).toHaveLength(1);
      expect(() => findPlanetaryReturns({ body: Planet.SUN, from: day('2026-06-01T00:00:00Z'), to: day('2026-06-30T00:00:00Z') })).toThrow();
      expect(() => findPlanetaryReturns({ body: Planet.MARS, natalChart: chart, from: day('2026-06-01T00:00:00Z'), to: day('2026-06-30T00:00:00Z') })).toThrow();
    });

    it('verifies every emitted solar-return root and reports solver metadata', () => {
      const r = findSolarReturns({ natalLongitude: 295.5, from: day('2026-01-15T00:00:00Z'), to: day('2029-01-15T00:00:00Z') });
      expect(r.crossings).toHaveLength(3);
      for (const c of r.crossings) {
        expect(c.residualDegrees).toBeLessThanOrEqual(1e-6);
        expect(independentResidual(Planet.SUN, c.jd, 295.5)).toBeLessThanOrEqual(1e-6);
        expect(c.bracketWidthSeconds).toBeLessThanOrEqual(0.001 + 1e-6);
      }
      expect(r.method.timeScale).toBe('UT Julian Day');
      expect(r.coverage.scope).toBe('finite-grid');
    });
  });

  describe('getSolarReturnChart', () => {
    const natal: BirthChartOptions = {
      date: { year: 1990, month: 1, day: 15, hour: 14, minute: 30, second: 0 },
      latitude: 40.7128,
      longitude: -74.006,
      houseSystem: HouseSystem.PLACIDUS,
      timeZoneSettings: { timeZone: 'America/New_York' },
    };

    it('returns a verified root with residual <= 1e-6 and a configurable bracket', async () => {
      const r = await getSolarReturnChart({ natal, year: 2026 });
      expect(r.residualDegrees!).toBeLessThanOrEqual(1e-6);
      expect(r.solver!.bracketWidthSeconds).toBeLessThanOrEqual(0.001 + 1e-6);
      expect(r.solver!.timeToleranceSeconds).toBe(0.001);
      expect(independentResidual(Planet.SUN, r.exactReturnJd!, r.natalSunLongitude)).toBeLessThanOrEqual(1e-6);
      expect(r.exactReturnDate.getTime()).toBe(jdToDate(r.exactReturnJd!).getTime());

      const loose = await getSolarReturnChart({ natal, year: 2026, returnPrecisionSeconds: 30 });
      expect(loose.solver!.timeToleranceSeconds).toBe(30);
      expect(loose.residualDegrees!).toBeLessThanOrEqual(1e-6);
    });

    it('keeps the UTC instant semantics of the former < 60 s bisection', async () => {
      const r = await getSolarReturnChart({ natal, year: 2026 });
      // Independent reimplementation of the old Date-based bisection (whole-second Sun positions).
      const sun = (ms: number) => calculateSinglePlanetPosition(new Date(ms), Planet.SUN).longitude;
      const target = r.natalSunLongitude;
      const approx = Date.UTC(2026, 0, 15, 12);
      let lo = approx - 2 * 86400000;
      let hi = approx + 2 * 86400000;
      for (let i = 0; i < 30 && hi - lo >= 60000; i++) {
        const mid = Math.floor((lo + hi) / 2);
        if (signedAngleDifference(sun(mid) - target) < 0) lo = mid;
        else hi = mid;
      }
      const legacy = Math.floor((lo + hi) / 2);
      expect(Math.abs(r.exactReturnDate.getTime() - legacy)).toBeLessThan(61_000);
      expect(r.solarReturnChart.dateUtc.getTime()).toBe(r.exactReturnDate.getTime());
    });

    it('preserves the location override behaviour (UTC cast)', async () => {
      const a = await getSolarReturnChart({ natal, year: 2026 });
      const b = await getSolarReturnChart({ natal, year: 2026, solarReturnLatitude: 34.0522, solarReturnLongitude: -118.2437 });
      expect(b.exactReturnDate.getTime()).toBe(a.exactReturnDate.getTime());
      expect(b.solarReturnChart.houses.ascendant.longitude).not.toBeCloseTo(a.solarReturnChart.houses.ascendant.longitude, 0);
    });
  });
});
