import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { AspectName } from './aspects';
import { getBirthChart, type ComputedBirthChart } from './index';
import {
  DEFAULT_PROGRESSED_PERFECTION_ASPECTS,
  DEFAULT_PROGRESSED_PERFECTION_BODIES,
  DEFAULT_PROGRESSED_PERFECTION_NATAL_POINTS,
  DerivedChartError,
  findProgressedPerfections,
  getSecondaryProgressions,
  MAX_PROGRESSED_SCAN_STEP_DAYS,
  type ProgressedPerfection,
  type YearLengthSpec,
} from './progressions';
import { ROOT_SOLVER_METHOD } from './returns';
import { closeSwissEph, getSwissEph } from './swisseph';

const utc = (iso: string) => new Date(iso);
const LAT = 40.4168;
const LON = -3.7038;
const ANGLE: Partial<Record<AspectName, number>> = { conjunction: 0, sextile: 60, square: 90, trine: 120, opposition: 180 };
const DECADE = { from: utc('2020-01-01T00:00:00Z'), to: utc('2030-01-01T00:00:00Z') };

describe('progressed perfections', () => {
  let chart: ComputedBirthChart;

  beforeAll(async () => {
    await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
    chart = await getBirthChart({
      date: utc('1990-06-15T14:30:00Z'),
      latitude: LAT,
      longitude: LON,
      timeZoneSettings: { treatAsUTC: true },
    });
  });
  afterAll(() => closeSwissEph());

  const natalLongitude = (key: string) =>
    key === 'ascendant' ? chart.houses.ascendant.longitude : key === 'mc' ? chart.houses.mc.longitude : chart.planets[key].longitude;

  /** |separation of the progressed body from the natal point - aspect angle| at `exactDate`, from getSecondaryProgressions. */
  const offExact = (p: ProgressedPerfection, yearLength?: YearLengthSpec) => {
    const sp = getSecondaryProgressions({
      natalChart: chart,
      natalLatitude: LAT,
      natalLongitude: LON,
      target: p.exactDate,
      yearLength,
      angleConventions: ['quotidian'],
    });
    expect(sp.progressedJd).toBeCloseTo(p.progressedJd, 7);
    let separation = Math.abs(sp.chart.planets[p.progressedBody].longitude - natalLongitude(p.natalPoint)) % 360;
    if (separation > 180) separation = 360 - separation;
    return { off: Math.abs(separation - ANGLE[p.aspect]!), speed: sp.chart.planets[p.progressedBody].longitudeSpeed ?? 0 };
  };

  it('agrees with getSecondaryProgressions at every exact date, for each year length', () => {
    for (const yearLength of [undefined, 'tropical', 365.2, 'solar-return'] as const) {
      const { perfections } = findProgressedPerfections({ natalChart: chart, ...DECADE, yearLength });
      expect(perfections.length, String(yearLength)).toBeGreaterThan(40);
      for (const p of perfections) {
        const { off, speed } = offExact(p, yearLength);
        expect(off, `${yearLength} ${p.progressedBody} ${p.aspect} ${p.natalPoint}`).toBeLessThan(1e-4);
        expect(p.retrograde).toBe(speed < 0);
      }
    }
  });

  it('returns the perfections by exact date, inside the window, with the defaults', () => {
    const result = findProgressedPerfections({ natalChart: chart, ...DECADE });
    expect(result.progressedBodies).toEqual([...DEFAULT_PROGRESSED_PERFECTION_BODIES]);
    expect(result.progressedBodies).toEqual(['sun', 'moon', 'mercury', 'venus', 'mars']);
    expect(result.natalPoints).toEqual([...DEFAULT_PROGRESSED_PERFECTION_NATAL_POINTS]);
    expect(result.natalPoints).toHaveLength(14);
    expect(result.aspects).toEqual([...DEFAULT_PROGRESSED_PERFECTION_ASPECTS]);
    expect(new Set(result.aspects)).toEqual(new Set(['conjunction', 'sextile', 'square', 'trine', 'opposition']));
    for (let i = 0; i < result.perfections.length; i++) {
      const p = result.perfections[i];
      expect(p.exactDate.getTime()).toBeGreaterThanOrEqual(DECADE.from.getTime());
      expect(p.exactDate.getTime()).toBeLessThanOrEqual(DECADE.to.getTime());
      if (i > 0) expect(p.exactDate.getTime()).toBeGreaterThanOrEqual(result.perfections[i - 1].exactDate.getTime());
      expect(result.progressedBodies).toContain(p.progressedBody);
      expect(result.natalPoints).toContain(p.natalPoint);
      expect(result.aspects).toContain(p.aspect);
    }
    // Known events of this chart, to the day.
    const day = (body: string, aspect: string, point: string) =>
      result.perfections
        .find((p) => p.progressedBody === body && p.aspect === aspect && p.natalPoint === point)
        ?.exactDate.toISOString()
        .slice(0, 10);
    expect(day('sun', 'conjunction', 'mc')).toBe('2023-03-06');
    expect(day('venus', 'conjunction', 'sun')).toBe('2020-03-13');
    expect(day('moon', 'conjunction', 'mc')).toBe('2026-09-19');
  });

  it('finds about four progressed Moon aspects a year over the fourteen natal points', () => {
    // The progressed Moon circles the chart in about 27.3 years and meets each natal point
    // in 8 major aspects on the way: 14 x 8 / 27.3 is about 4.1 a year, one every 3 months.
    const { perfections } = findProgressedPerfections({ natalChart: chart, ...DECADE, progressedBodies: ['moon'] });
    expect(perfections).toHaveLength(40);
    expect(perfections.every((p) => p.progressedBody === 'moon' && !p.retrograde)).toBe(true);
    const generation = findProgressedPerfections({
      natalChart: chart,
      from: utc('1995-01-01T00:00:00Z'),
      to: utc('2050-01-01T00:00:00Z'),
      progressedBodies: ['moon'],
    }).perfections;
    expect(generation.length).toBeGreaterThan(55 * 3.6);
    expect(generation.length).toBeLessThan(55 * 4.6);
    // Each point is met between 2 and 5 times a decade, never zero times in 55 years.
    for (const point of DEFAULT_PROGRESSED_PERFECTION_NATAL_POINTS) {
      const hits = generation.filter((p) => p.natalPoint === point).length;
      expect(hits, point).toBeGreaterThanOrEqual(14);
      expect(hits, point).toBeLessThanOrEqual(18);
    }
  });

  it('scales the scan step to a short window and keeps both window ends', () => {
    const moonMc = findProgressedPerfections({ natalChart: chart, ...DECADE }).perfections.find(
      (p) => p.progressedBody === 'moon' && p.natalPoint === 'mc' && p.aspect === 'conjunction'
    )!;
    const t = moonMc.exactDate.getTime();
    const DAY = 86_400_000;

    const window = findProgressedPerfections({ natalChart: chart, from: new Date(t - 20 * DAY), to: new Date(t + 25 * DAY) });
    // 45 days of life are about 3 hours of ephemeris time.
    expect(window.method.timeKey.toProgressedJd - window.method.timeKey.fromProgressedJd).toBeCloseTo(45 / 365.25, 9);
    expect(window.method.scanStepDays).toBeLessThan(0.02);
    expect(window.method.scanStepDays).toBeLessThan(MAX_PROGRESSED_SCAN_STEP_DAYS);
    expect(window.perfections).toHaveLength(1);
    // The same event from a different grid: equal within the solver's time tolerance
    // (0.001 s of ephemeris time, under half a second of life).
    expect({ ...window.perfections[0], exactDate: 0, progressedJd: 0 }).toEqual({ ...moonMc, exactDate: 0, progressedJd: 0 });
    expect(Math.abs(window.perfections[0].exactDate.getTime() - t)).toBeLessThan(1000);

    // Nothing is exact in the 45 days from 2026-11-01 for this chart.
    expect(
      findProgressedPerfections({ natalChart: chart, from: utc('2026-11-01T00:00:00Z'), to: utc('2026-12-16T00:00:00Z') }).perfections
    ).toEqual([]);
    // A window of four seconds around the event keeps it; two seconds outside either end drops it.
    const only = (from: number, to: number) =>
      findProgressedPerfections({ natalChart: chart, from: new Date(from), to: new Date(to) }).perfections.length;
    expect(only(t - 2000, t + DAY)).toBe(1);
    expect(only(t - DAY, t + 2000)).toBe(1);
    expect(only(t - 2000, t + 2000)).toBe(1);
    expect(only(t + 2000, t + DAY)).toBe(0);
    expect(only(t - DAY, t - 2000)).toBe(0);
    expect(only(t + 2000, t + 2000)).toBe(0);
  });

  it('filters by progressed body, natal point and aspect', () => {
    const all = findProgressedPerfections({ natalChart: chart, ...DECADE }).perfections;
    const same = (a: ProgressedPerfection[], b: ProgressedPerfection[]) => {
      expect(a).toHaveLength(b.length);
      a.forEach((p, i) => {
        expect([p.progressedBody, p.natalPoint, p.aspect, p.retrograde]).toEqual([
          b[i].progressedBody,
          b[i].natalPoint,
          b[i].aspect,
          b[i].retrograde,
        ]);
        expect(Math.abs(p.exactDate.getTime() - b[i].exactDate.getTime())).toBeLessThan(2000);
      });
    };

    const bodies = findProgressedPerfections({ natalChart: chart, ...DECADE, progressedBodies: ['Sun', 'mercury'] });
    expect(bodies.progressedBodies).toEqual(['sun', 'mercury']);
    same(bodies.perfections, all.filter((p) => p.progressedBody === 'sun' || p.progressedBody === 'mercury'));
    expect(bodies.perfections.length).toBeGreaterThan(0);

    const points = findProgressedPerfections({ natalChart: chart, ...DECADE, natalPoints: ['ascendant', 'mc', 'mean node'] });
    same(points.perfections, all.filter((p) => ['ascendant', 'mc', 'mean node'].includes(p.natalPoint)));
    expect(points.perfections.length).toBeGreaterThan(0);

    const aspects = findProgressedPerfections({ natalChart: chart, ...DECADE, aspects: ['conjunction', 'opposition'] });
    same(aspects.perfections, all.filter((p) => p.aspect === 'conjunction' || p.aspect === 'opposition'));
    expect(aspects.perfections.length).toBeGreaterThan(0);

    // A body outside the defaults and a minor aspect can be asked for.
    const jupiter = findProgressedPerfections({
      natalChart: chart,
      from: utc('1991-01-01T00:00:00Z'),
      to: utc('2060-01-01T00:00:00Z'),
      progressedBodies: ['jupiter'],
      aspects: ['conjunction', 'quincunx'],
    });
    for (const p of jupiter.perfections) expect(p.progressedBody).toBe('jupiter');

    expect(findProgressedPerfections({ natalChart: chart, ...DECADE, progressedBodies: [] }).perfections).toEqual([]);
    expect(findProgressedPerfections({ natalChart: chart, ...DECADE, natalPoints: [] }).perfections).toEqual([]);
    expect(findProgressedPerfections({ natalChart: chart, ...DECADE, aspects: [] }).perfections).toEqual([]);
  });

  it('echoes the technique, the time key and the solver', () => {
    const { method } = findProgressedPerfections({ natalChart: chart, ...DECADE });
    const key = getSecondaryProgressions({ natalChart: chart, natalLatitude: LAT, natalLongitude: LON, target: DECADE.to }).method.timeKey;
    expect(method.technique).toBe('secondary progression');
    expect(method.timeKey.rule).toBe(key.rule);
    expect(method.timeKey.yearLength).toEqual(key.yearLength);
    expect(method.timeKey.yearLength.days).toBe(365.25);
    expect(method.timeKey.natalJd).toBe(key.natalJd);
    expect(method.timeKey.toProgressedJd).toBe(key.progressedJd);
    expect(method.scanStepDays).toBe(MAX_PROGRESSED_SCAN_STEP_DAYS);
    expect(method.solver).toBe(ROOT_SOLVER_METHOD);
    expect(method.angles).toBe('progressed angles are not searched');
    expect(findProgressedPerfections({ natalChart: chart, ...DECADE, yearLength: 'tropical' }).method.timeKey.yearLength.days).toBe(365.2422);
  });

  it('rejects bad input with a typed error', () => {
    const code = (fn: () => unknown) => {
      try {
        fn();
      } catch (error) {
        expect(error).toBeInstanceOf(DerivedChartError);
        return (error as DerivedChartError).code;
      }
      return 'no error';
    };
    expect(code(() => findProgressedPerfections({ natalChart: chart, from: DECADE.to, to: DECADE.from }))).toBe('INVALID_INPUT');
    expect(code(() => findProgressedPerfections({ natalChart: chart, from: new Date(NaN), to: DECADE.to }))).toBe('INVALID_INPUT');
    expect(code(() => findProgressedPerfections({ natalChart: chart, from: utc('1980-01-01T00:00:00Z'), to: DECADE.to }))).toBe(
      'TARGET_BEFORE_BIRTH'
    );
    expect(code(() => findProgressedPerfections({ natalChart: chart, from: DECADE.from, to: utc('2200-01-01T00:00:00Z') }))).toBe(
      'AGE_LIMIT_EXCEEDED'
    );
    expect(code(() => findProgressedPerfections({ natalChart: chart, ...DECADE, progressedBodies: ['vulcan'] }))).toBe('INVALID_INPUT');
    expect(code(() => findProgressedPerfections({ natalChart: chart, ...DECADE, natalPoints: ['descendant'] }))).toBe('INVALID_INPUT');
    expect(code(() => findProgressedPerfections({ natalChart: chart, ...DECADE, aspects: ['septile' as AspectName] }))).toBe('INVALID_INPUT');
    expect(code(() => findProgressedPerfections({ natalChart: chart, ...DECADE, yearLength: -1 }))).toBe('INVALID_INPUT');
  });
});
