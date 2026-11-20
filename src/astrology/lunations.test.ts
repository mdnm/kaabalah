import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TimelineError } from './firdaria';
import { SIGNS } from './index';
import {
  findLunations,
  LUNATION_PHASES,
  LUNATION_SCAN_STEP_DAYS,
  LUNATIONS_METHOD,
  MAX_LUNATION_WINDOW_YEARS,
  type LunationPhase,
} from './lunations';
import { calculateBodyAtJulianDay, CalcFlag, closeSwissEph, getSwissEph, Planet } from './swisseph';

const utc = (iso: string) => new Date(iso);
const minutesApart = (a: Date, b: Date) => Math.abs(a.getTime() - b.getTime()) / 60000;
const norm = (x: number) => ((x % 360) + 360) % 360;
const FLAGS = CalcFlag.SWISS_EPH | CalcFlag.SPEED;
const ORDER: LunationPhase[] = ['new', 'first_quarter', 'full', 'last_quarter'];

describe('lunations', () => {
  beforeAll(async () => {
    await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
  });
  afterAll(() => closeSwissEph());

  it('defines the four phases at multiples of 90 degrees', () => {
    expect(LUNATION_PHASES.map((p) => p.phase)).toEqual(ORDER);
    expect(LUNATION_PHASES.map((p) => p.elongation)).toEqual([0, 90, 180, 270]);
    expect(LUNATION_SCAN_STEP_DAYS).toBeLessThanOrEqual(0.5);
    expect(Object.isFrozen(LUNATIONS_METHOD)).toBe(true);
  });

  it('matches the published phases of early 2024 within two minutes', () => {
    // Published UTC times (USNO / timeanddate), to the minute. 2024-04-08 is the total solar eclipse.
    const published: [LunationPhase, string][] = [
      ['new', '2024-01-11T11:57:00Z'],
      ['full', '2024-01-25T17:54:00Z'],
      ['new', '2024-02-09T22:59:00Z'],
      ['full', '2024-02-24T12:30:00Z'],
      ['new', '2024-03-10T09:00:00Z'],
      ['full', '2024-03-25T07:00:00Z'],
      ['last_quarter', '2024-04-02T03:15:00Z'],
      ['new', '2024-04-08T18:21:00Z'],
      ['first_quarter', '2024-04-15T19:13:00Z'],
      ['full', '2024-04-23T23:49:00Z'],
    ];
    const { lunations } = findLunations({ start: utc('2024-01-01T00:00:00Z'), end: utc('2024-05-01T00:00:00Z') });
    expect(lunations).toHaveLength(16);
    for (const [phase, iso] of published) {
      const nearest = lunations
        .filter((l) => l.phase === phase)
        .sort((a, b) => minutesApart(a.instant, utc(iso)) - minutesApart(b.instant, utc(iso)))[0];
      expect(minutesApart(nearest.instant, utc(iso)), `${phase} ${iso}`).toBeLessThan(2);
    }
  });

  it('gives the longitudes, the sign of the Moon and a residual at each instant', () => {
    const { lunations, method } = findLunations({ start: utc('2024-01-01T00:00:00Z'), end: utc('2025-01-01T00:00:00Z') });
    expect(method).toBe(LUNATIONS_METHOD);
    for (const l of lunations) {
      const sun = calculateBodyAtJulianDay(l.jd, Planet.SUN, FLAGS).longitude;
      const moon = calculateBodyAtJulianDay(l.jd, Planet.MOON, FLAGS).longitude;
      expect(l.sunLongitude).toBeCloseTo(norm(sun), 9);
      expect(l.moonLongitude).toBeCloseTo(norm(moon), 9);
      const target = ORDER.indexOf(l.phase) * 90;
      const off = norm(l.moonLongitude - l.sunLongitude - target + 180) - 180;
      expect(Math.abs(off)).toBeLessThanOrEqual(1e-6);
      expect(l.residualDegrees).toBeLessThanOrEqual(1e-6);
      expect(l.sign).toBe(SIGNS[Math.floor(l.moonLongitude / 30)]);
      expect(l.signDegree).toBeCloseTo(l.moonLongitude % 30, 9);
      expect(l.signDegree).toBeGreaterThanOrEqual(0);
      expect(l.signDegree).toBeLessThan(30);
      expect(Math.abs(l.instant.getTime() - (l.jd - 2440587.5) * 86_400_000)).toBeLessThanOrEqual(0.5);
    }
    // The eclipse new moon of 2024-04-08 is at 19 degrees 24 minutes of Aries, the Sun with it.
    const eclipse = lunations.find((l) => l.phase === 'new' && l.instant.toISOString().startsWith('2024-04-08'))!;
    expect(eclipse.sign).toBe('Aries');
    expect(eclipse.signDegree).toBeCloseTo(19.4, 1);
    expect(eclipse.sunLongitude).toBeCloseTo(eclipse.moonLongitude, 5);
    // A full moon has the Sun in the opposite sign.
    const full = lunations.find((l) => l.phase === 'full' && l.instant.toISOString().startsWith('2024-03-25'))!;
    expect(full.sign).toBe('Libra');
    expect(norm(full.moonLongitude - full.sunLongitude)).toBeCloseTo(180, 5);
  });

  it('returns the phases in time order, alternating new, first quarter, full, last quarter', () => {
    const { lunations } = findLunations({ start: utc('2000-01-01T00:00:00Z'), end: utc('2030-01-01T00:00:00Z') });
    expect(lunations.length).toBeGreaterThan(1480);
    expect(lunations.length).toBeLessThan(1490);
    for (let i = 1; i < lunations.length; i++) {
      expect(lunations[i].jd).toBeGreaterThan(lunations[i - 1].jd);
      expect(ORDER.indexOf(lunations[i].phase)).toBe((ORDER.indexOf(lunations[i - 1].phase) + 1) % 4);
      const gap = lunations[i].jd - lunations[i - 1].jd;
      expect(gap).toBeGreaterThan(6.5);
      expect(gap).toBeLessThan(8.3);
    }
  });

  it('spaces consecutive new moons 29.2 to 29.9 days apart', () => {
    const { lunations } = findLunations({
      start: utc('2000-01-01T00:00:00Z'),
      end: utc('2030-01-01T00:00:00Z'),
      phases: ['new'],
    });
    expect(lunations.length).toBeGreaterThan(365);
    for (let i = 1; i < lunations.length; i++) {
      const gap = lunations[i].jd - lunations[i - 1].jd;
      expect(gap).toBeGreaterThan(29.2);
      expect(gap).toBeLessThan(29.9);
    }
  });

  it('treats the window as inclusive at both ends and returns nothing between phases', () => {
    const april = findLunations({ start: utc('2024-04-01T00:00:00Z'), end: utc('2024-04-30T00:00:00Z') }).lunations;
    expect(april.map((l) => l.phase)).toEqual(['last_quarter', 'new', 'first_quarter', 'full']);
    const eclipse = april[1];
    const justBefore = new Date(eclipse.instant.getTime() - 60_000);
    const justAfter = new Date(eclipse.instant.getTime() + 60_000);

    expect(findLunations({ start: april[0].instant, end: justBefore }).lunations.map((l) => l.phase)).toEqual(['last_quarter']);
    expect(findLunations({ start: justBefore, end: justAfter }).lunations.map((l) => l.phase)).toEqual(['new']);
    expect(findLunations({ start: justAfter, end: new Date(justAfter.getTime() + 86_400_000) }).lunations).toEqual([]);
    // A phase exactly at the start or the end of the window is kept.
    const exact = new Date(Math.round((eclipse.jd - 2440587.5) * 86_400_000));
    const atEnd = findLunations({ start: justBefore, end: new Date(exact.getTime() + 1) }).lunations;
    const atStart = findLunations({ start: new Date(exact.getTime() - 1), end: justAfter }).lunations;
    expect(atEnd).toHaveLength(1);
    expect(atStart).toHaveLength(1);
    expect(atEnd[0].jd).toBeCloseTo(eclipse.jd, 7);
    expect(atStart[0].jd).toBeCloseTo(eclipse.jd, 7);
    // A zero-length window with no phase in it is empty.
    expect(findLunations({ start: justAfter, end: justAfter }).lunations).toEqual([]);
  });

  it('filters by phase and echoes the phases searched in order', () => {
    const window = { start: utc('2024-01-01T00:00:00Z'), end: utc('2025-01-01T00:00:00Z') };
    const all = findLunations(window);
    expect(all.phases).toEqual(ORDER);
    const pair = findLunations({ ...window, phases: ['full', 'new'] });
    expect(pair.phases).toEqual(['new', 'full']);
    expect(new Set(pair.lunations.map((l) => l.phase))).toEqual(new Set(['new', 'full']));
    expect(pair.lunations).toEqual(all.lunations.filter((l) => l.phase === 'new' || l.phase === 'full'));
    // 2024 has 13 new moons (Jan 11 to Dec 30) and 12 full moons.
    expect(pair.lunations.filter((l) => l.phase === 'new')).toHaveLength(13);
    expect(pair.lunations.filter((l) => l.phase === 'full')).toHaveLength(12);
    expect(findLunations({ ...window, phases: [] }).lunations).toEqual([]);
  });

  it('rejects bad input with a typed error', () => {
    const start = utc('2024-01-01T00:00:00Z');
    const code = (fn: () => unknown) => {
      try {
        fn();
      } catch (error) {
        expect(error).toBeInstanceOf(TimelineError);
        return (error as TimelineError).code;
      }
      return 'no error';
    };
    expect(code(() => findLunations({ start, end: new Date(NaN) }))).toBe('UNBOUNDED_INPUT');
    expect(code(() => findLunations({ start: undefined as unknown as Date, end: start }))).toBe('UNBOUNDED_INPUT');
    expect(code(() => findLunations({ start, end: utc('2023-12-31T00:00:00Z') }))).toBe('INVALID_RANGE');
    expect(code(() => findLunations({ start, end: utc('2024-02-01T00:00:00Z'), phases: ['waxing_crescent' as LunationPhase] }))).toBe(
      'INVALID_INPUT'
    );
    expect(
      code(() => findLunations({ start, end: new Date(Date.UTC(2024 + MAX_LUNATION_WINDOW_YEARS + 1, 0, 1)) }))
    ).toBe('RANGE_TOO_LARGE');
  });
});
