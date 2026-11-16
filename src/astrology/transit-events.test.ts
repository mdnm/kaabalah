import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getTransitRange, HouseSystem, type BirthChartOptions } from './index';
import { closeSwissEph, getSwissEph } from './swisseph';

describe('getTransitRange exact events', () => {
  beforeAll(async () => {
    await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
  });
  afterAll(() => closeSwissEph());

  const natal: BirthChartOptions = {
    date: new Date('2000-04-05T00:00:00Z'),
    latitude: 20,
    longitude: 0,
    houseSystem: HouseSystem.PLACIDUS,
    timeZoneSettings: { treatAsUTC: true },
  };
  const utc = { treatAsUTC: true } as const;

  it('does not report a Saturn closest approach (~0.76 deg) as an exact conjunction', async () => {
    const result = await getTransitRange({
      natal,
      from: new Date('2026-07-20T00:00:00Z'),
      to: new Date('2026-08-02T00:00:00Z'),
      stepDays: 1,
      transitTimeZoneSettings: utc,
      aspectSpecs: [{ name: 'conjunction', angle: 0, orb: 1 }],
      transitPlanets: ['saturn'],
      natalPlanets: ['sun'],
    });
    // Previously: exactDate ~2026-07-27 with exactOrb ~0.761792.
    expect(result.perfections).toEqual([]);
    expect(result.closestApproaches).toBeUndefined();
  });

  it('exposes the near miss separately when requested, never as exact', async () => {
    const result = await getTransitRange({
      natal,
      from: new Date('2026-07-20T00:00:00Z'),
      to: new Date('2026-08-02T00:00:00Z'),
      stepDays: 1,
      transitTimeZoneSettings: utc,
      aspectSpecs: [{ name: 'conjunction', angle: 0, orb: 1 }],
      transitPlanets: ['saturn'],
      natalPlanets: ['sun'],
      includeClosestApproaches: true,
    });
    expect(result.perfections).toEqual([]);
    expect(result.closestApproaches).toHaveLength(1);
    const c = result.closestApproaches![0];
    expect(c.kind).toBe('closest-approach');
    expect(c.separationDegrees).toBeGreaterThan(0.7);
    expect(c.separationDegrees).toBeLessThan(0.8);
    expect(c.separationDegrees).toBeLessThanOrEqual(c.displayOrb);
    // Saturn stations at ~2026-07-26 19:56 UTC.
    expect(Math.abs(c.date.getTime() - Date.parse('2026-07-26T19:56:31Z'))).toBeLessThan(60_000);
  });

  it('keeps display orb, residual and time tolerance separate on real events', async () => {
    const result = await getTransitRange({
      natal,
      from: new Date('2026-01-01T00:00:00Z'),
      to: new Date('2026-04-01T00:00:00Z'),
      stepDays: 1,
      transitTimeZoneSettings: utc,
      transitPlanets: ['sun', 'mars', 'jupiter', 'saturn'],
    });
    expect(result.perfections.length).toBeGreaterThan(5);
    const from = result.fromUtc!.getTime();
    const to = result.toUtc!.getTime();
    for (const p of result.perfections) {
      expect(p.kind).toBe('exact');
      expect(p.solver!.residualDegrees).toBeLessThanOrEqual(1e-6);
      expect(p.exactOrb).toBe(p.solver!.residualDegrees);
      expect(p.solver!.timeToleranceSeconds).toBe(0.001);
      expect(p.solver!.coverage.scope).toBe('finite-grid');
      expect(p.exactDate.getTime()).toBeGreaterThanOrEqual(from);
      expect(p.exactDate.getTime()).toBeLessThanOrEqual(to);
      expect(p.retrograde).toBe(p.solver!.direction === 'retrograde');
    }
  }, 60000);
});
