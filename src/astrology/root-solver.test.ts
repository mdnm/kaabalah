import { describe, expect, it } from 'vitest';
import { findAngularRoots, jdToDate, dateToJd, signedAngleDifference } from './root-solver';

// Pure, ephemeris-independent tests with analytic functions.
const TWO_PI = 2 * Math.PI;

describe('signedAngleDifference', () => {
  it('normalises to (-180, 180]', () => {
    expect(signedAngleDifference(190)).toBeCloseTo(-170, 12);
    expect(signedAngleDifference(-190)).toBeCloseTo(170, 12);
    expect(signedAngleDifference(180)).toBe(180);
    expect(signedAngleDifference(-180)).toBe(180);
    expect(signedAngleDifference(720)).toBe(0);
  });
  it('round-trips JD and Date', () => {
    const d = new Date('2026-07-26T19:56:31.123Z');
    expect(jdToDate(dateToJd(d)).getTime()).toBe(d.getTime());
    expect(dateToJd(new Date('2000-01-01T12:00:00Z'))).toBeCloseTo(2451545, 9);
  });
});

describe('findAngularRoots (analytic functions)', () => {
  const sinusoid = (t: number) => 10 * Math.sin((TWO_PI * t) / 10);
  const sinusoidSpeed = (t: number) => ((10 * TWO_PI) / 10) * Math.cos((TWO_PI * t) / 10);
  const expected = [
    (10 / TWO_PI) * Math.asin(0.5),
    (10 / TWO_PI) * (Math.PI - Math.asin(0.5)),
    10 + (10 / TWO_PI) * Math.asin(0.5),
    10 + (10 / TWO_PI) * (Math.PI - Math.asin(0.5)),
  ];

  for (const withSpeed of [true, false]) {
    it(`finds every root of a sinusoid (${withSpeed ? 'analytic' : 'numeric'} speed)`, () => {
      const r = findAngularRoots({
        longitude: sinusoid,
        speed: withSpeed ? sinusoidSpeed : undefined,
        target: 5,
        start: 0,
        end: 20,
        stepDays: 1,
      });
      expect(r.roots).toHaveLength(4);
      r.roots.forEach((root, i) => {
        expect(root.jd).toBeCloseTo(expected[i], 6);
        expect(root.residualDegrees).toBeLessThanOrEqual(1e-6);
        expect(root.kind).toBe('exact');
        expect(root.direction).toBe(i % 2 === 0 ? 'direct' : 'retrograde');
        expect(root.bracketWidthSeconds).toBeLessThanOrEqual(0.001 + 1e-9);
        expect(root.timeToleranceSeconds).toBe(0.001);
        expect(root.iterations).toBeGreaterThan(0);
      });
      expect(r.coverage.scope).toBe('finite-grid');
      expect(r.coverage.note).toMatch(/not a symbolic proof/);
      expect(r.rejected).toEqual([]);
    });
  }

  it('is monotonic-safe and handles longitude wrap (target 0 crossed from 350 upward)', () => {
    const r = findAngularRoots({ longitude: (t) => 350 + 5 * t, target: 0, start: 0, end: 5, stepDays: 1 });
    expect(r.roots).toHaveLength(1);
    expect(r.roots[0].jd).toBeCloseTo(2, 6);
    expect(r.roots[0].direction).toBe('direct');
  });

  it('rejects the wrap discontinuity at the antipode', () => {
    // Longitude passes 180 degrees from the target: signed difference jumps +180 -> -180.
    const r = findAngularRoots({ longitude: (t) => 170 + 2 * t, target: 0, start: 0, end: 10, stepDays: 1 });
    expect(r.roots).toEqual([]);
    expect(r.rejected).toEqual([]);
  });

  describe('close double pass inside one coarse step', () => {
    const peak = (t: number) => 10 - 0.1 * (t - 5) * (t - 5);
    const peakSpeed = (t: number) => -0.2 * (t - 5);

    for (const withSpeed of [true, false]) {
      it(`recovers both roots 1e-4 degrees inside the extremum (${withSpeed ? 'analytic' : 'numeric'} speed)`, () => {
        const r = findAngularRoots({
          longitude: peak,
          speed: withSpeed ? peakSpeed : undefined,
          target: 10 - 1e-4,
          start: 0,
          end: 10,
          stepDays: 2,
        });
        const half = Math.sqrt(1e-4 / 0.1);
        expect(r.roots).toHaveLength(2);
        expect(r.roots[0].jd).toBeCloseTo(5 - half, 6);
        expect(r.roots[1].jd).toBeCloseTo(5 + half, 6);
        expect(r.roots[0].direction).toBe('direct');
        expect(r.roots[1].direction).toBe('retrograde');
        expect(r.coverage.stationsFound).toBe(1);
      });
    }

    it('misses it without the station only because the grid is coarse (control)', () => {
      // A single-sign scan of endpoints cannot see the pair; station insertion is what finds it.
      const sampled = [0, 2, 4, 6, 8, 10].map((t) => peak(t) - (10 - 1e-4));
      expect(sampled.every((v) => v < 0)).toBe(true);
    });

    it('reports a 5e-7 degree near miss as closest approach only, never exact', () => {
      const r = findAngularRoots({
        longitude: peak,
        speed: peakSpeed,
        target: 10 + 5e-7,
        start: 0,
        end: 10,
        stepDays: 2,
        includeClosestApproaches: true,
      });
      expect(r.roots).toEqual([]);
      expect(r.closestApproaches).toHaveLength(1);
      expect(r.closestApproaches[0].kind).toBe('closest-approach');
      expect(r.closestApproaches[0].separationDegrees).toBeCloseTo(5e-7, 10);
      expect(r.closestApproaches[0].jd).toBeCloseTo(5, 5);
    });

    it('omits closest approaches unless requested', () => {
      const r = findAngularRoots({ longitude: peak, speed: peakSpeed, target: 10.5, start: 0, end: 10, stepDays: 2 });
      expect(r.roots).toEqual([]);
      expect(r.closestApproaches).toEqual([]);
    });

    it('honours maxClosestSeparationDegrees (display orb) for near misses', () => {
      const r = findAngularRoots({
        longitude: peak,
        speed: peakSpeed,
        target: 10.5,
        start: 0,
        end: 10,
        stepDays: 2,
        includeClosestApproaches: true,
        maxClosestSeparationDegrees: 0.1,
      });
      expect(r.closestApproaches).toEqual([]);
    });

    it('reports an exact tangent at the extremum as a single root', () => {
      const r = findAngularRoots({ longitude: peak, speed: peakSpeed, target: 10, start: 0, end: 10, stepDays: 2 });
      expect(r.roots).toHaveLength(1);
      expect(r.roots[0].tangent).toBe(true);
      expect(r.roots[0].direction).toBe('stationary');
      expect(r.roots[0].jd).toBeCloseTo(5, 5);
      expect(r.closestApproaches).toEqual([]);
    });
  });

  describe('boundaries', () => {
    const line = (t: number) => 10 * t;
    it('retains a root exactly at the window end', () => {
      const r = findAngularRoots({ longitude: line, target: 20, start: 0, end: 2, stepDays: 1 });
      expect(r.roots).toHaveLength(1);
      expect(r.roots[0].jd).toBe(2);
      expect(r.roots[0].boundary).toBe(true);
    });
    it('retains a root exactly at the window start', () => {
      const r = findAngularRoots({ longitude: line, target: 20, start: 2, end: 4, stepDays: 1 });
      expect(r.roots).toHaveLength(1);
      expect(r.roots[0].jd).toBe(2);
      expect(r.roots[0].boundary).toBe(true);
    });
    it('retains a boundary root that is within the residual tolerance but not exactly zero', () => {
      const r = findAngularRoots({ longitude: line, target: 20 + 1e-8, start: 2, end: 4, stepDays: 1 });
      expect(r.roots).toHaveLength(1);
      expect(r.roots[0].residualDegrees).toBeLessThanOrEqual(1e-6);
    });
    it('does not duplicate a root just inside the boundary', () => {
      const r = findAngularRoots({ longitude: line, target: 20 + 1e-8, start: 2 - 1e-12, end: 4, stepDays: 1 });
      expect(r.roots).toHaveLength(1);
    });
    it('returns nothing for an empty or reversed window', () => {
      expect(findAngularRoots({ longitude: line, target: 20, start: 3, end: 2 }).roots).toEqual([]);
    });
    it('handles a degenerate single-point window', () => {
      expect(findAngularRoots({ longitude: line, target: 20, start: 2, end: 2 }).roots).toHaveLength(1);
      expect(findAngularRoots({ longitude: line, target: 21, start: 2, end: 2 }).roots).toEqual([]);
    });
  });

  it('validates inputs', () => {
    const base = { longitude: (t: number) => t, target: 1, start: 0, end: 2 };
    expect(() => findAngularRoots({ ...base, stepDays: 0 })).toThrow();
    expect(() => findAngularRoots({ ...base, start: NaN })).toThrow();
    expect(() => findAngularRoots({ ...base, timeToleranceSeconds: 0 })).toThrow();
    expect(() => findAngularRoots({ ...base, residualToleranceDegrees: -1 })).toThrow();
  });

  it('keeps the three concepts separate: residual vs time tolerance', () => {
    const r = findAngularRoots({
      longitude: (t) => 10 * t,
      target: 15,
      start: 0,
      end: 3,
      stepDays: 1,
      timeToleranceSeconds: 5,
    });
    expect(r.roots[0].timeToleranceSeconds).toBe(5);
    expect(r.roots[0].residualDegrees).toBeLessThanOrEqual(1e-6);
    // Residual is verified independently of the requested time tolerance.
    expect(r.roots[0].bracketWidthSeconds).toBeLessThanOrEqual(r.roots[0].method === 'bracket-bisection' ? 5 : Infinity);
  });
});
