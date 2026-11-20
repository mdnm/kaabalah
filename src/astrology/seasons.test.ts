import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TimelineError } from './firdaria';
import {
  findSeasonalPoints,
  getSeasonalPosition,
  MAX_SEASONAL_WINDOW_YEARS,
  SEASONAL_POINTS,
  SEASONAL_POINTS_METHOD,
} from './seasons';
import { closeSwissEph, getSwissEph } from './swisseph';

const utc = (iso: string) => new Date(iso);
const year = (y: number) => ({ start: utc(`${y}-01-01T00:00:00Z`), end: utc(`${y + 1}-01-01T00:00:00Z`) });
const minutesApart = (a: Date, b: Date) => Math.abs(a.getTime() - b.getTime()) / 60000;

describe('seasonal points', () => {
  beforeAll(async () => {
    await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
  });
  afterAll(() => closeSwissEph());

  it('defines the eight points at multiples of 45 degrees', () => {
    expect(SEASONAL_POINTS.map((p) => p.targetLongitude)).toEqual([0, 45, 90, 135, 180, 225, 270, 315]);
    expect(SEASONAL_POINTS.map((p) => p.id)).toEqual([
      'march-equinox',
      'taurus-midpoint',
      'june-solstice',
      'leo-midpoint',
      'september-equinox',
      'scorpio-midpoint',
      'december-solstice',
      'aquarius-midpoint',
    ]);
  });

  it('matches the published 2025 equinoxes and solstices within two minutes', () => {
    // Published UTC times (USNO / timeanddate): Mar 20 09:01, Jun 21 02:42, Sep 22 18:19, Dec 21 15:03.
    const published: Record<string, string> = {
      'march-equinox': '2025-03-20T09:01:00Z',
      'june-solstice': '2025-06-21T02:42:00Z',
      'september-equinox': '2025-09-22T18:19:00Z',
      'december-solstice': '2025-12-21T15:03:00Z',
    };
    const { points } = findSeasonalPoints(year(2025));
    for (const [id, iso] of Object.entries(published)) {
      const point = points.find((p) => p.id === id);
      expect(point, id).toBeDefined();
      expect(minutesApart(point!.instant, utc(iso)), id).toBeLessThan(2);
    }
  });

  it('returns eight points per year, in time order, starting with the Aquarius midpoint', () => {
    for (const y of [1999, 2025, 2026, 2040]) {
      const { points, method } = findSeasonalPoints(year(y));
      expect(points).toHaveLength(8);
      expect(points.map((p) => p.id)).toEqual([
        'aquarius-midpoint',
        'march-equinox',
        'taurus-midpoint',
        'june-solstice',
        'leo-midpoint',
        'september-equinox',
        'scorpio-midpoint',
        'december-solstice',
      ]);
      for (let i = 1; i < points.length; i++) expect(points[i].jd).toBeGreaterThan(points[i - 1].jd);
      expect(method).toBe(SEASONAL_POINTS_METHOD);
    }
  });

  it('places the cross-quarter points at exactly 15 degrees of the fixed signs', () => {
    const { points } = findSeasonalPoints(year(2025));
    const cross = points.filter((p) => p.kind === 'cross-quarter');
    expect(cross.map((p) => p.sign).sort()).toEqual(['Aquarius', 'Leo', 'Scorpio', 'Taurus']);
    for (const p of cross) {
      expect(p.signDegree).toBe(15);
      expect(p.id).toBe(`${p.sign.toLowerCase()}-midpoint`);
      expect(Math.abs(p.longitude - p.targetLongitude)).toBeLessThan(1e-6);
      expect(p.residualDegrees).toBeLessThan(1e-6);
    }
  });

  it('gives sign, degree and kind for the equinoxes and solstices', () => {
    const { points } = findSeasonalPoints(year(2025));
    const byId = Object.fromEntries(points.map((p) => [p.id, p]));
    expect([byId['march-equinox'].sign, byId['march-equinox'].kind]).toEqual(['Aries', 'equinox']);
    expect([byId['june-solstice'].sign, byId['june-solstice'].kind]).toEqual(['Cancer', 'solstice']);
    expect([byId['september-equinox'].sign, byId['september-equinox'].kind]).toEqual(['Libra', 'equinox']);
    expect([byId['december-solstice'].sign, byId['december-solstice'].kind]).toEqual(['Capricorn', 'solstice']);
    for (const p of points.filter((x) => x.kind !== 'cross-quarter')) expect(p.signDegree).toBe(0);
    // The March equinox wraps 360: the emitted longitude is within the residual of 0 or 360.
    const march = byId['march-equinox'].longitude;
    expect(Math.min(march, 360 - march)).toBeLessThan(1e-6);
  });

  it('has no season label without a hemisphere and opposite labels for north and south', () => {
    const plain = findSeasonalPoints(year(2025));
    expect(plain.hemisphere).toBeUndefined();
    expect(plain.points.every((p) => p.season === undefined)).toBe(true);

    const season = (hemisphere: 'north' | 'south') =>
      Object.fromEntries(
        findSeasonalPoints({ ...year(2025), hemisphere }).points.map((p) => [p.id, `${p.season!.name} ${p.season!.phase}`])
      );
    expect(season('north')).toEqual({
      'march-equinox': 'spring start',
      'taurus-midpoint': 'spring midpoint',
      'june-solstice': 'summer start',
      'leo-midpoint': 'summer midpoint',
      'september-equinox': 'autumn start',
      'scorpio-midpoint': 'autumn midpoint',
      'december-solstice': 'winter start',
      'aquarius-midpoint': 'winter midpoint',
    });
    expect(season('south')).toEqual({
      'march-equinox': 'autumn start',
      'taurus-midpoint': 'autumn midpoint',
      'june-solstice': 'winter start',
      'leo-midpoint': 'winter midpoint',
      'september-equinox': 'spring start',
      'scorpio-midpoint': 'spring midpoint',
      'december-solstice': 'summer start',
      'aquarius-midpoint': 'summer midpoint',
    });
  });

  it('returns nothing for a window that holds no point and rejects bad input', () => {
    expect(findSeasonalPoints({ start: utc('2025-04-01T00:00:00Z'), end: utc('2025-04-20T00:00:00Z') }).points).toEqual([]);
    expect(() => findSeasonalPoints({ start: utc('2025-02-01T00:00:00Z'), end: utc('2025-01-01T00:00:00Z') })).toThrow(TimelineError);
    expect(() => findSeasonalPoints({ start: new Date(NaN), end: utc('2025-01-01T00:00:00Z') })).toThrow(TimelineError);
    expect(() =>
      findSeasonalPoints({ start: utc('1800-01-01T00:00:00Z'), end: utc(`${1801 + MAX_SEASONAL_WINDOW_YEARS}-01-01T00:00:00Z`) })
    ).toThrow(/exceeds/);
    expect(() => findSeasonalPoints({ ...year(2025), hemisphere: 'east' as never })).toThrow(TimelineError);
    expect(() => getSeasonalPosition({ date: new Date(NaN) })).toThrow(TimelineError);
  });

  describe('getSeasonalPosition', () => {
    it('brackets an instant between the previous and the next point', () => {
      const position = getSeasonalPosition({ date: utc('2026-11-20T12:00:00Z') });
      expect(position.previous.id).toBe('scorpio-midpoint');
      expect(position.next.id).toBe('december-solstice');
      expect(position.previous.instant.getTime()).toBeLessThan(position.date.getTime());
      expect(position.next.instant.getTime()).toBeGreaterThan(position.date.getTime());
      expect(position.fraction).toBeCloseTo(position.elapsedDays / position.spanDays, 12);
      expect(position.fraction).toBeGreaterThan(0.2);
      expect(position.fraction).toBeLessThan(0.4);
      expect(position.spanDays).toBeGreaterThan(43);
      expect(position.spanDays).toBeLessThan(48);
    });

    it('is 0 at a point, just under 1 right before the next, and grows in between', () => {
      const { points } = findSeasonalPoints(year(2025));
      const [a, b] = [points[3], points[4]]; // June solstice, Leo midpoint
      const at = getSeasonalPosition({ date: a.instant });
      expect(at.previous.id).toBe(a.id);
      expect(at.next.id).toBe(b.id);
      expect(at.fraction).toBeLessThan(1e-9);

      const before = getSeasonalPosition({ date: new Date(b.instant.getTime() - 1000) });
      expect(before.previous.id).toBe(a.id);
      expect(before.fraction).toBeGreaterThan(0.999999);
      expect(before.fraction).toBeLessThan(1);

      const half = getSeasonalPosition({ date: new Date((a.instant.getTime() + b.instant.getTime()) / 2) });
      expect(half.fraction).toBeCloseTo(0.5, 6);
    });

    it('wraps the year end and carries the season label', () => {
      const position = getSeasonalPosition({ date: utc('2025-12-31T00:00:00Z'), hemisphere: 'south' });
      expect(position.previous.id).toBe('december-solstice');
      expect(position.next.id).toBe('aquarius-midpoint');
      expect(position.previous.season).toEqual({ hemisphere: 'south', name: 'summer', phase: 'start' });
      expect(position.next.instant.getUTCFullYear()).toBe(2026);
    });
  });
});
