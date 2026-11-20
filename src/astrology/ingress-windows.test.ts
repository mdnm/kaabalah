import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TimelineError } from './firdaria';
import {
  DEFAULT_INGRESS_BODIES,
  findIngressWindows,
  getIngressLeadTime,
  INGRESS_LEAD_TIMES,
  INGRESS_WINDOWS_METHOD,
  MAX_INGRESS_WINDOW_YEARS,
  type IngressWindow,
} from './ingress-windows';
import { sampleBodyAtJd } from './returns';
import { closeSwissEph, getSwissEph, Planet } from './swisseph';

const utc = (iso: string) => new Date(iso);
const MS_PER_DAY = 86_400_000;
const leadMs = (w: IngressWindow) => w.instant.getTime() - (w.windowStart as Date).getTime();
const label = (w: IngressWindow) => `${w.id} ${w.fromSign}>${w.toSign} ${w.direction}`;

describe('INGRESS_LEAD_TIMES', () => {
  it('holds the figures of the source and their length in days', () => {
    expect(INGRESS_LEAD_TIMES).toEqual({
      sun: { amount: 5, unit: 'days', days: 5 },
      moon: { amount: 3, unit: 'ghatis', days: 72 / 1440 },
      mars: { amount: 8, unit: 'days', days: 8 },
      mercury: { amount: 7, unit: 'days', days: 7 },
      jupiter: { amount: 2, unit: 'months', days: 60 },
      venus: { amount: 7, unit: 'days', days: 7 },
      saturn: { amount: 6, unit: 'months', days: 180 },
      rahu: { amount: 3, unit: 'months', days: 90 },
    });
  });

  it('maps ephemeris bodies to their lead time, both nodes to Rahu and unlisted bodies to null', () => {
    expect(getIngressLeadTime(Planet.SUN)).toBe(INGRESS_LEAD_TIMES.sun);
    expect(getIngressLeadTime(Planet.MEAN_NODE)).toBe(INGRESS_LEAD_TIMES.rahu);
    expect(getIngressLeadTime(Planet.TRUE_NODE)).toBe(INGRESS_LEAD_TIMES.rahu);
    for (const body of [Planet.URANUS, Planet.NEPTUNE, Planet.PLUTO, Planet.CHIRON, Planet.LILITH_MEAN]) {
      expect(getIngressLeadTime(body)).toBeNull();
    }
  });
});

describe('findIngressWindows', () => {
  beforeAll(async () => {
    await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
  });
  afterAll(() => closeSwissEph());

  it('opens each window its lead time before the exact ingress, for every listed body', () => {
    const expectedDays: Array<[Planet, number]> = [
      [Planet.SUN, 5],
      [Planet.MOON, 0.05],
      [Planet.MERCURY, 7],
      [Planet.VENUS, 7],
      [Planet.MARS, 8],
      [Planet.JUPITER, 60],
      [Planet.SATURN, 180],
      [Planet.MEAN_NODE, 90],
      [Planet.TRUE_NODE, 90],
    ];
    const result = findIngressWindows({
      bodies: expectedDays.map(([body]) => body),
      start: utc('2025-01-01T00:00:00Z'),
      end: utc('2027-01-01T00:00:00Z'),
    });
    for (const [body, days] of expectedDays) {
      const own = result.windows.filter((w) => w.body === body);
      expect(own.length, Planet[body]).toBeGreaterThan(0);
      for (const w of own) {
        // Both instants are rounded to the millisecond independently.
        expect(Math.abs(leadMs(w) - days * MS_PER_DAY), label(w)).toBeLessThanOrEqual(2);
        expect(w.windowStartJd).toBeCloseTo(w.jd - days, 9);
        expect(w.leadTime?.days).toBe(days);
      }
    }
    // The Moon's window is 72 minutes.
    const moon = result.windows.find((w) => w.id === 'moon') as IngressWindow;
    expect(Math.round(leadMs(moon) / 60000)).toBe(72);
  });

  it('returns exact crossings of the sign boundary', () => {
    const { windows } = findIngressWindows({
      bodies: [Planet.SUN, Planet.MARS, Planet.JUPITER],
      start: utc('2026-01-01T00:00:00Z'),
      end: utc('2027-01-01T00:00:00Z'),
    });
    expect(windows.filter((w) => w.id === 'sun' && w.ingressInRange)).toHaveLength(12);
    for (const w of windows) {
      expect(w.residualDegrees).toBeLessThanOrEqual(1e-6);
      const longitude = sampleBodyAtJd(w.body, w.jd).longitude;
      const off = Math.abs(((longitude - w.boundaryLongitude + 540) % 360) - 180);
      expect(off).toBeLessThanOrEqual(1e-6);
    }
    // The Sun enters Sagittarius on 2026-11-22; its five days begin on the 17th.
    const sagittarius = windows.find((w) => w.id === 'sun' && w.toSign === 'Sagittarius') as IngressWindow;
    expect(sagittarius.fromSign).toBe('Scorpio');
    expect(sagittarius.instant.toISOString().slice(0, 10)).toBe('2026-11-22');
    expect(sagittarius.windowStart?.toISOString().slice(0, 10)).toBe('2026-11-17');
  });

  it('returns a Saturn ingress after `end` whose window is open inside the range', () => {
    // Saturn enters Taurus on 2028-04-13; its six months (180 days) begin on 2027-10-16.
    const open = findIngressWindows({
      bodies: [Planet.SATURN],
      start: utc('2027-11-01T00:00:00Z'),
      end: utc('2027-12-01T00:00:00Z'),
    });
    expect(open.windows).toHaveLength(1);
    const w = open.windows[0];
    expect(label(w)).toBe('saturn Aries>Taurus direct');
    expect(w.instant.toISOString().slice(0, 10)).toBe('2028-04-13');
    expect(w.windowStart?.toISOString().slice(0, 10)).toBe('2027-10-16');
    expect(w.instant.getTime()).toBeGreaterThan(open.end.getTime());
    expect(w.ingressInRange).toBe(false);
    expect(w.windowOpenAtStart).toBe(true);
    expect(open.bodies[0].searchedUntil.getTime()).toBe(open.end.getTime() + 180 * MS_PER_DAY);

    // The window opens during the range: returned, but not yet open at `start`.
    const opening = findIngressWindows({
      bodies: [Planet.SATURN],
      start: utc('2027-10-01T00:00:00Z'),
      end: utc('2027-11-01T00:00:00Z'),
    });
    expect(opening.windows.map(label)).toEqual(['saturn Aries>Taurus direct']);
    expect(opening.windows[0].windowOpenAtStart).toBe(false);
    expect(opening.windows[0].ingressInRange).toBe(false);

    // The range ends before the window opens: nothing.
    const before = findIngressWindows({
      bodies: [Planet.SATURN],
      start: utc('2027-09-01T00:00:00Z'),
      end: utc('2027-10-01T00:00:00Z'),
    });
    expect(before.windows).toEqual([]);
  });

  it('drops an ingress that is already past at `start`', () => {
    const { windows } = findIngressWindows({
      bodies: [Planet.SATURN],
      start: utc('2028-04-14T00:00:00Z'),
      end: utc('2028-05-01T00:00:00Z'),
    });
    expect(windows).toEqual([]);
  });

  it('returns every crossing of a Mercury retrograde re-entry with its direction', () => {
    // Mercury enters Aries, turns retrograde on 2025-03-15, falls back into Pisces and enters Aries again.
    const { windows } = findIngressWindows({
      bodies: [Planet.MERCURY],
      start: utc('2025-03-01T00:00:00Z'),
      end: utc('2025-04-30T00:00:00Z'),
    });
    const aries = windows.filter((w) => w.boundaryLongitude === 0);
    expect(aries.map(label)).toEqual([
      'mercury Pisces>Aries direct',
      'mercury Aries>Pisces retrograde',
      'mercury Pisces>Aries direct',
    ]);
    expect(aries.map((w) => w.instant.toISOString().slice(0, 10))).toEqual(['2025-03-03', '2025-03-30', '2025-04-16']);
    // The lead time is applied to the retrograde crossing in the same way.
    for (const w of aries) expect(Math.abs(leadMs(w) - 7 * MS_PER_DAY)).toBeLessThanOrEqual(2);
  });

  it('returns bodies without a lead time with the exact ingress and a null window', () => {
    // Uranus enters Gemini on 2025-07-07.
    const range = { start: utc('2025-07-01T00:00:00Z'), end: utc('2025-07-31T00:00:00Z') };
    const { windows, bodies } = findIngressWindows({ bodies: [Planet.URANUS, Planet.NEPTUNE, Planet.PLUTO], ...range });
    expect(windows.map(label)).toEqual(['uranus Taurus>Gemini direct']);
    const w = windows[0];
    expect(w.instant.toISOString().slice(0, 10)).toBe('2025-07-07');
    expect(w.leadTime).toBeNull();
    expect(w.windowStart).toBeNull();
    expect(w.windowStartJd).toBeNull();
    expect(w.windowOpenAtStart).toBe(false);
    expect(w.ingressInRange).toBe(true);
    expect(bodies.every((b) => b.leadTime === null && b.searchedUntil.getTime() === range.end.getTime())).toBe(true);
    // Without a lead time nothing reaches back from after `end`.
    expect(
      findIngressWindows({ bodies: [Planet.URANUS], start: utc('2025-06-01T00:00:00Z'), end: utc('2025-07-01T00:00:00Z') }).windows
    ).toEqual([]);
  });

  it('mirrors Ketu from Rahu, on the mean node by default', () => {
    expect(DEFAULT_INGRESS_BODIES).toContain(Planet.MEAN_NODE);
    expect(DEFAULT_INGRESS_BODIES).not.toContain(Planet.TRUE_NODE);
    const range = { start: utc('2026-06-01T00:00:00Z'), end: utc('2026-09-01T00:00:00Z') };
    const { windows } = findIngressWindows({ bodies: [Planet.MEAN_NODE], ...range });
    expect(windows.map(label)).toEqual([
      'mean-node Pisces>Aquarius retrograde',
      'south-node-mean Virgo>Leo retrograde',
    ]);
    const [rahu, ketu] = windows;
    expect(ketu.body).toBe(Planet.MEAN_NODE);
    expect(ketu.jd).toBe(rahu.jd);
    expect(ketu.windowStartJd).toBe(rahu.windowStartJd);
    expect(ketu.boundaryLongitude).toBe((rahu.boundaryLongitude + 180) % 360);
    expect(rahu.windowOpenAtStart).toBe(true); // three months before 2026-08-18
    expect(findIngressWindows({ bodies: [Planet.MEAN_NODE], southNode: false, ...range }).windows.map((w) => w.id)).toEqual([
      'mean-node',
    ]);
    expect(findIngressWindows({ bodies: [Planet.TRUE_NODE], ...range }).windows.map((w) => w.id)).toEqual([
      'true-node',
      'south-node-true',
    ]);
  });

  it('orders by exact ingress instant across bodies and echoes the method', () => {
    const result = findIngressWindows({ start: utc('2026-01-01T00:00:00Z'), end: utc('2027-01-01T00:00:00Z') });
    expect(result.windows.length).toBeGreaterThan(150); // the Moon alone changes sign about 160 times a year
    for (let i = 1; i < result.windows.length; i++) {
      expect(result.windows[i].jd).toBeGreaterThanOrEqual(result.windows[i - 1].jd);
    }
    expect(result.bodies.map((b) => b.body)).toEqual([...DEFAULT_INGRESS_BODIES]);
    expect(new Set(result.windows.map((w) => w.id))).toContain('south-node-mean');
    expect(result.method).toBe(INGRESS_WINDOWS_METHOD);
    expect(result.method.zodiac).toBe('tropical');
    expect(result.method.months).toBe('30 days per month');
  });

  it('accepts a single instant as the range', () => {
    const at = utc('2026-11-20T00:00:00Z');
    const { windows } = findIngressWindows({ start: at, end: at });
    expect(windows.map(label)).toEqual(['sun Scorpio>Sagittarius direct', 'mars Leo>Virgo direct']);
    expect(windows.every((w) => w.windowOpenAtStart && !w.ingressInRange)).toBe(true);
  });

  it('rejects bad input with a typed error', () => {
    const start = utc('2026-01-01T00:00:00Z');
    const end = utc('2026-02-01T00:00:00Z');
    const code = (fn: () => unknown) => {
      try {
        fn();
      } catch (error) {
        expect(error).toBeInstanceOf(TimelineError);
        return (error as TimelineError).code;
      }
      return 'no error';
    };
    expect(code(() => findIngressWindows({ start: end, end: start }))).toBe('INVALID_RANGE');
    expect(code(() => findIngressWindows({ start: new Date(NaN), end }))).toBe('UNBOUNDED_INPUT');
    expect(code(() => findIngressWindows({ start, end, bodies: [] }))).toBe('INVALID_INPUT');
    expect(code(() => findIngressWindows({ start, end, bodies: [99 as Planet] }))).toBe('INVALID_INPUT');
    expect(
      code(() => findIngressWindows({ start: utc('1800-01-01T00:00:00Z'), end: utc(`${1801 + MAX_INGRESS_WINDOW_YEARS}-01-01T00:00:00Z`) }))
    ).toBe('RANGE_TOO_LARGE');
  });
});
