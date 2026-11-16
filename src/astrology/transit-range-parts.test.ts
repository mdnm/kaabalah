import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getTransitRange, HouseSystem, type BirthChartOptions } from './index';
import { closeSwissEph, getSwissEph } from './swisseph';

describe('getTransitRange with LocalDateTimeParts windows', () => {
  beforeAll(async () => {
    await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
  });
  afterAll(() => closeSwissEph());

  const natal: BirthChartOptions = {
    date: { year: 1990, month: 6, day: 15, hour: 14, minute: 30 },
    latitude: 48.856,
    longitude: 2.352,
    houseSystem: HouseSystem.PLACIDUS,
    timeZoneSettings: { utcOffsetMinutes: 120 },
  };

  it('resolves parts in the transit location zone, host-timezone independent, equal to the treatAsUTC Date path', async () => {
    const parts = await getTransitRange({
      natal,
      from: { year: 2026, month: 3, day: 1 },
      to: { year: 2026, month: 3, day: 15, hour: 6 },
      transitTimeZoneSettings: { utcOffsetMinutes: 120 },
      stepDays: 1,
      transitPlanets: ['sun', 'mercury', 'venus'],
    });
    // Local 2026-03-01 00:00 at UTC+2 is 2026-02-28T22:00Z
    expect(parts.fromUtc!.toISOString()).toBe('2026-02-28T22:00:00.000Z');
    expect(parts.toUtc!.toISOString()).toBe('2026-03-15T04:00:00.000Z');
    // result.from/to stay Dates (the resolved instants for parts input)
    expect(parts.from.toISOString()).toBe('2026-02-28T22:00:00.000Z');
    expect(parts.to.toISOString()).toBe('2026-03-15T04:00:00.000Z');

    const dates = await getTransitRange({
      natal,
      from: new Date('2026-02-28T22:00:00Z'),
      to: new Date('2026-03-15T04:00:00Z'),
      transitTimeZoneSettings: { treatAsUTC: true },
      stepDays: 1,
      transitPlanets: ['sun', 'mercury', 'venus'],
    });
    expect(parts.perfections.map((p) => p.exactDate.getTime())).toEqual(dates.perfections.map((p) => p.exactDate.getTime()));
    expect(parts.perfections.length).toBeGreaterThan(0);
  });

  it('keeps the legacy Date behaviour (echoed unchanged)', async () => {
    const from = new Date(2026, 2, 1);
    const to = new Date(2026, 2, 5);
    const r = await getTransitRange({ natal, from, to, transitTimeZoneSettings: { utcOffsetMinutes: 0 }, transitPlanets: ['sun'] });
    expect(r.from).toBe(from);
    expect(r.to).toBe(to);
  });
});
