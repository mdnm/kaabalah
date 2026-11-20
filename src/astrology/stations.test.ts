import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TimelineError } from './firdaria';
import { findBodyLongitudeCrossings, sampleBodyAtJd } from './returns';
import {
  DEFAULT_STATION_OUTSIDE_SEARCH_DAYS,
  findDeclinationStations,
  findEquatorCrossings,
  findRetrogradePeriods,
  findStations,
  STATION_BODIES,
  type Station,
} from './stations';
import { calculateEquatorialPosition, closeSwissEph, getSwissEph, Planet } from './swisseph';

const utc = (iso: string) => new Date(iso);
const DAY_MS = 86_400_000;
const daysApart = (a: Date, iso: string) => Math.abs(a.getTime() - utc(iso).getTime()) / DAY_MS;
const year2025 = { start: utc('2025-01-01T00:00:00Z'), end: utc('2026-01-01T00:00:00Z') };

function expectOrderedAndAlternating(stations: Station[]) {
  for (let i = 1; i < stations.length; i++) {
    expect(stations[i].jd).toBeGreaterThan(stations[i - 1].jd);
    expect(stations[i].kind).not.toBe(stations[i - 1].kind);
  }
}

describe('stations and retrograde periods (real ephemeris)', () => {
  beforeAll(async () => {
    await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
  });
  afterAll(() => closeSwissEph());

  describe('Mercury in 2025 against the published retrograde periods', () => {
    // Published: 15 March to 7 April, 18 July to 11 August, 9 November to 29 November.
    const published = [
      ['2025-03-15T12:00:00Z', '2025-04-07T12:00:00Z'],
      ['2025-07-18T12:00:00Z', '2025-08-11T12:00:00Z'],
      ['2025-11-09T12:00:00Z', '2025-11-29T12:00:00Z'],
    ];

    it('finds the six stations within a day, in order, with alternating kinds', () => {
      const r = findStations({ body: Planet.MERCURY, ...year2025 });
      expect(r.stations).toHaveLength(6);
      expect(r.stations.map((s) => s.kind)).toEqual(['retrograde', 'direct', 'retrograde', 'direct', 'retrograde', 'direct']);
      expectOrderedAndAlternating(r.stations);
      published.flat().forEach((iso, i) => expect(daysApart(r.stations[i].instant, iso)).toBeLessThanOrEqual(1));
      expect(r.retrogradeAtStart).toBe(false);
      expect(r.retrogradeAtEnd).toBe(false);
      expect(r.notices).toEqual([]);
      expect(r.coverage.scope).toBe('finite-grid');
      expect(r.coverage.stationsFound).toBe(6);
      expect(r.method.solver).toBe('speed-sign-bracketing+bisection');
    });

    it('refines each station to the time tolerance, with the speed changing sign across it', () => {
      const r = findStations({ body: Planet.MERCURY, ...year2025 });
      for (const s of r.stations) {
        expect(s.bracketWidthSeconds).toBeLessThanOrEqual(r.timeToleranceSeconds);
        expect(Math.abs(s.speedDegreesPerDay)).toBeLessThan(1e-4);
        const before = sampleBodyAtJd(Planet.MERCURY, s.jd - 0.01).speed;
        const after = sampleBodyAtJd(Planet.MERCURY, s.jd + 0.01).speed;
        expect(after < 0).toBe(s.kind === 'retrograde');
        expect(before < 0).toBe(s.kind === 'direct');
        expect(s.inWindow).toBe(true);
      }
    });

    it('reports longitude and sign at the station', () => {
      const [first] = findStations({ body: Planet.MERCURY, ...year2025 }).stations;
      // Mercury stationed retrograde at about 9.6 Aries in March 2025.
      expect(first.sign).toBe('Aries');
      expect(first.signDegree).toBeGreaterThan(9);
      expect(first.signDegree).toBeLessThan(10);
      expect(first.longitude).toBeCloseTo(first.signDegree, 9);
    });

    it('a coarser step finds the same stations', () => {
      const fine = findStations({ body: Planet.MERCURY, ...year2025, stepDays: 0.25 });
      const coarse = findStations({ body: Planet.MERCURY, ...year2025, stepDays: 10 }); // capped at 2
      expect(coarse.coverage.stepDays).toBe(2);
      expect(coarse.stations).toHaveLength(fine.stations.length);
      coarse.stations.forEach((s, i) => expect(Math.abs(s.jd - fine.stations[i].jd) * 86_400).toBeLessThan(2));
    });

    it('pairs the stations into three periods', () => {
      const r = findRetrogradePeriods({ body: Planet.MERCURY, ...year2025 });
      expect(r.periods).toHaveLength(3);
      r.periods.forEach((p, i) => {
        expect(daysApart(p.stationRetrograde!.instant, published[i][0])).toBeLessThanOrEqual(1);
        expect(daysApart(p.stationDirect!.instant, published[i][1])).toBeLessThanOrEqual(1);
        expect(p.startsBeforeWindow).toBe(false);
        expect(p.endsAfterWindow).toBe(false);
        expect(p.durationDays).toBeGreaterThan(19);
        expect(p.durationDays).toBeLessThan(25);
      });
      expect(r.notices).toEqual([]);
    });
  });

  describe('periods that cross the window edges', () => {
    const marchPeriod = () => findRetrogradePeriods({ body: Planet.MERCURY, ...year2025 }).periods[0];

    it('a window that starts in the middle of a retrograde returns the true opening station', () => {
      const march = marchPeriod();
      const r = findRetrogradePeriods({
        body: Planet.MERCURY,
        start: utc('2025-03-25T00:00:00Z'),
        end: utc('2025-05-01T00:00:00Z'),
      });
      expect(r.periods).toHaveLength(1);
      const [p] = r.periods;
      expect(p.startsBeforeWindow).toBe(true);
      expect(p.endsAfterWindow).toBe(false);
      expect(p.stationRetrograde!.inWindow).toBe(false);
      expect(p.stationRetrograde!.kind).toBe('retrograde');
      expect(Math.abs(p.stationRetrograde!.jd - march.stationRetrograde!.jd) * 86_400).toBeLessThan(2);
      expect(p.stationDirect!.inWindow).toBe(true);
      expect(Math.abs(p.stationDirect!.jd - march.stationDirect!.jd) * 86_400).toBeLessThan(2);
      expect(r.bodies[0].retrogradeAtStart).toBe(true);
      expect(r.bodies[0].stations).toHaveLength(1);
    });

    it('a window that ends in the middle of a retrograde returns the true closing station', () => {
      const march = marchPeriod();
      const r = findRetrogradePeriods({
        body: Planet.MERCURY,
        start: utc('2025-03-01T00:00:00Z'),
        end: utc('2025-03-25T00:00:00Z'),
      });
      expect(r.periods).toHaveLength(1);
      expect(r.periods[0].endsAfterWindow).toBe(true);
      expect(r.periods[0].stationDirect!.inWindow).toBe(false);
      expect(Math.abs(r.periods[0].stationDirect!.jd - march.stationDirect!.jd) * 86_400).toBeLessThan(2);
    });

    it('a single day inside a retrograde returns the whole period, and a direct day returns none', () => {
      const march = marchPeriod();
      const inside = findRetrogradePeriods({
        body: Planet.MERCURY,
        start: utc('2025-03-25T00:00:00Z'),
        end: utc('2025-03-26T00:00:00Z'),
      });
      expect(inside.periods).toHaveLength(1);
      expect(inside.periods[0].startsBeforeWindow).toBe(true);
      expect(inside.periods[0].endsAfterWindow).toBe(true);
      expect(inside.periods[0].durationDays).toBeCloseTo(march.durationDays!, 3);

      const instant = utc('2025-05-10T00:00:00Z');
      const direct = findRetrogradePeriods({ body: Planet.MERCURY, start: instant, end: instant });
      expect(direct.periods).toEqual([]);
      expect(direct.bodies[0].retrogradeAtStart).toBe(false);
    });

    it('leaves a missing end null and says so when the bound is too short', () => {
      const r = findRetrogradePeriods({
        body: Planet.MERCURY,
        start: utc('2025-03-25T00:00:00Z'),
        end: utc('2025-03-26T00:00:00Z'),
        outsideSearchDays: 2,
      });
      expect(r.outsideSearchDays).toBe(2);
      expect(r.periods).toHaveLength(1);
      expect(r.periods[0].stationRetrograde).toBeNull();
      expect(r.periods[0].stationDirect).toBeNull();
      expect(r.periods[0].durationDays).toBeNull();
      expect(r.notices.map((n) => n.type)).toEqual(['opening-station-not-found', 'closing-station-not-found']);
    });
  });

  describe('slow planets over a year', () => {
    it.each([
      ['Saturn', Planet.SATURN, '2025-07-13T12:00:00Z', '2025-11-28T12:00:00Z'],
      ['Pluto', Planet.PLUTO, '2025-05-04T12:00:00Z', '2025-10-14T12:00:00Z'],
    ])('%s gives one retrograde and one direct station in 2025', (_name, body, retro, direct) => {
      const r = findStations({ body, ...year2025 });
      expect(r.stations.map((s) => s.kind)).toEqual(['retrograde', 'direct']);
      expectOrderedAndAlternating(r.stations);
      expect(daysApart(r.stations[0].instant, retro)).toBeLessThanOrEqual(1);
      expect(daysApart(r.stations[1].instant, direct)).toBeLessThanOrEqual(1);
    });
  });

  describe('several bodies in one call', () => {
    it('defaults to Mercury through Pluto and orders the periods by opening', () => {
      const r = findRetrogradePeriods(year2025);
      expect(r.outsideSearchDays).toBe(DEFAULT_STATION_OUTSIDE_SEARCH_DAYS);
      expect(r.bodies.map((b) => b.body)).toEqual([...STATION_BODIES]);
      for (const b of r.bodies) expectOrderedAndAlternating(b.stations);
      // Every body is retrograde at some point of any calendar year except, at times, Venus and Mars.
      for (const body of [Planet.MERCURY, Planet.JUPITER, Planet.SATURN, Planet.URANUS, Planet.NEPTUNE, Planet.PLUTO]) {
        expect(r.periods.some((p) => p.body === body)).toBe(true);
      }
      expect(r.periods.filter((p) => p.body === Planet.MERCURY)).toHaveLength(3);
      // Mars was already retrograde on 1 January 2025 (station 6 December 2024).
      const mars = r.periods.find((p) => p.body === Planet.MARS)!;
      expect(mars.startsBeforeWindow).toBe(true);
      expect(daysApart(mars.stationRetrograde!.instant, '2024-12-06T23:00:00Z')).toBeLessThanOrEqual(1);
      expect(daysApart(mars.stationDirect!.instant, '2025-02-24T02:00:00Z')).toBeLessThanOrEqual(1);
      // No period is left with a missing end at the default bound.
      expect(r.notices).toEqual([]);
      for (const p of r.periods) {
        expect(p.stationRetrograde).not.toBeNull();
        expect(p.stationDirect).not.toBeNull();
        expect(p.stationDirect!.jd).toBeGreaterThan(p.stationRetrograde!.jd);
      }
      const openings = r.periods.map((p) => p.stationRetrograde!.jd);
      expect(openings).toEqual([...openings].sort((a, b) => a - b));
    });

    it('merges `body` and `bodies` without duplicates', () => {
      const r = findRetrogradePeriods({ body: Planet.SATURN, bodies: [Planet.SATURN, Planet.MERCURY], ...year2025 });
      expect(r.bodies.map((b) => b.body)).toEqual([Planet.SATURN, Planet.MERCURY]);
      expect(r.periods).toHaveLength(4);
    });
  });

  describe('bodies that do not apply', () => {
    it.each([
      ['Sun', Planet.SUN],
      ['Moon', Planet.MOON],
    ])('%s gives an empty result with a notice', (name, body) => {
      const r = findStations({ body, ...year2025 });
      expect(r.stations).toEqual([]);
      expect(r.retrogradeAtStart).toBe(false);
      expect(r.notices).toHaveLength(1);
      expect(r.notices[0]).toMatchObject({ type: 'never-stations', body, bodyName: name });
    });

    it('the Sun and Moon are skipped with a notice next to real bodies', () => {
      const r = findRetrogradePeriods({ bodies: [Planet.SUN, Planet.MOON, Planet.MERCURY], ...year2025 });
      expect(r.periods).toHaveLength(3);
      expect(r.periods.every((p) => p.body === Planet.MERCURY)).toBe(true);
      expect(r.notices.map((n) => n.type)).toEqual(['never-stations', 'never-stations']);
      expect(r.bodies).toHaveLength(3);
    });

    it.each([
      ['mean node', Planet.MEAN_NODE],
      ['true node', Planet.TRUE_NODE],
      ['Chiron', Planet.CHIRON],
    ])('the %s is rejected with a typed error', (_name, body) => {
      expect(() => findStations({ body, ...year2025 })).toThrow(TimelineError);
      try {
        findRetrogradePeriods({ bodies: [Planet.MERCURY, body], ...year2025 });
        expect.unreachable();
      } catch (error) {
        expect((error as TimelineError).code).toBe('INVALID_INPUT');
      }
    });
  });

  describe('window limits', () => {
    const code = (fn: () => unknown) => {
      try {
        fn();
      } catch (error) {
        return (error as TimelineError).code;
      }
      return undefined;
    };

    it('rejects invalid, reversed and oversized windows and bad options', () => {
      const start = utc('2025-01-01T00:00:00Z');
      expect(code(() => findStations({ body: Planet.MERCURY, start, end: new Date(NaN) }))).toBe('UNBOUNDED_INPUT');
      expect(code(() => findStations({ body: Planet.MERCURY, start, end: utc('2024-12-31T00:00:00Z') }))).toBe('INVALID_RANGE');
      expect(code(() => findStations({ body: Planet.MERCURY, start, end: utc('2180-01-01T00:00:00Z') }))).toBe('RANGE_TOO_LARGE');
      expect(code(() => findStations({ body: Planet.MERCURY, ...year2025, stepDays: 0 }))).toBe('INVALID_INPUT');
      expect(code(() => findRetrogradePeriods({ ...year2025, outsideSearchDays: 401 }))).toBe('INVALID_INPUT');
    });
  });

  describe('declination stations and equator crossings', () => {
    const sunLongitude = (target: number) =>
      findBodyLongitudeCrossings({ body: Planet.SUN, targetLongitude: target, from: year2025.start, to: year2025.end })
        .crossings[0].instant;
    const secondsApart = (a: Date, b: Date) => Math.abs(a.getTime() - b.getTime()) / 1000;

    it("the Sun's declination stations are the solstices", () => {
      const r = findDeclinationStations({ body: Planet.SUN, ...year2025 });
      expect(r.stations.map((s) => s.kind)).toEqual(['turns-south', 'turns-north']);
      expect(r.stations.map((s) => s.extremum)).toEqual(['maximum', 'minimum']);
      // The extremum of declination and the 90/270 degree longitude crossing are different
      // definitions of a solstice: the Sun's small ecliptic latitude and the nutation in
      // obliquity move the extremum by two to three minutes (161 s and 154 s in 2025).
      expect(secondsApart(r.stations[0].instant, sunLongitude(90))).toBeLessThan(300);
      expect(secondsApart(r.stations[1].instant, sunLongitude(270))).toBeLessThan(300);
      // So the longitude there is within a few thousandths of a degree of 90 and 270, on either
      // side: in December 2025 the extremum falls at 29.998 Sagittarius, not 0 Capricorn.
      expect(Math.abs(r.stations[0].longitude - 90)).toBeLessThan(0.01);
      expect(Math.abs(r.stations[1].longitude - 270)).toBeLessThan(0.01);
      for (const s of r.stations) {
        expect(Math.abs(Math.abs(s.declination) - s.obliquity)).toBeLessThan(1e-3);
        expect(s.obliquity).toBeGreaterThan(23.43);
        expect(s.obliquity).toBeLessThan(23.45);
        expect(s.outOfBounds).toBe(false);
        expect(s.bracketWidthSeconds).toBeLessThanOrEqual(r.timeToleranceSeconds);
      }
      expect(r.method.solver).toBe('speed-sign-bracketing+bisection');
      expect(r.coverage.scope).toBe('finite-grid');
    });

    it("the Sun's equator crossings are the equinoxes, to the minute", () => {
      const r = findEquatorCrossings({ body: Planet.SUN, ...year2025 });
      expect(r.crossings.map((c) => c.direction)).toEqual(['northward', 'southward']);
      expect(secondsApart(r.crossings[0].instant, sunLongitude(0))).toBeLessThan(60);
      expect(secondsApart(r.crossings[1].instant, sunLongitude(180))).toBeLessThan(60);
      for (const c of r.crossings) {
        expect(Math.abs(c.declination)).toBeLessThan(1e-4);
        expect(c.declinationSpeedDegreesPerDay > 0).toBe(c.direction === 'northward');
      }
      expect(r.method.solver).toBe('declination-sign-bracketing+bisection');
    });

    it('Mercury has more declination stations in a year than longitude stations', () => {
      const declination = findDeclinationStations({ body: Planet.MERCURY, ...year2025 }).stations;
      const longitude = findStations({ body: Planet.MERCURY, ...year2025 }).stations;
      expect(longitude).toHaveLength(6);
      expect(declination).toHaveLength(8);
      for (let i = 1; i < declination.length; i++) {
        expect(declination[i].jd).toBeGreaterThan(declination[i - 1].jd);
        expect(declination[i].kind).not.toBe(declination[i - 1].kind);
      }
    });

    it('a declination station is a real extremum of the independently computed declination', () => {
      for (const s of findDeclinationStations({ body: Planet.MERCURY, ...year2025 }).stations) {
        const at = (offsetMs: number) =>
          calculateEquatorialPosition(new Date(s.instant.getTime() + offsetMs), Planet.MERCURY).declination;
        expect(at(0)).toBeCloseTo(s.declination, 5);
        const sign = s.kind === 'turns-south' ? 1 : -1;
        expect(sign * (s.declination - at(-DAY_MS))).toBeGreaterThan(0);
        expect(sign * (s.declination - at(DAY_MS))).toBeGreaterThan(0);
        expect(Math.abs(s.declinationSpeedDegreesPerDay)).toBeLessThan(1e-4);
        expect(s.outOfBounds).toBe(Math.abs(s.declination) > s.obliquity);
      }
    });

    it('flags Mercury out of bounds at its extreme stations only', () => {
      const stations = findDeclinationStations({ body: Planet.MERCURY, ...year2025 }).stations;
      // 2025: about -23.8 in January, +25.3 in June and -24.0 in November exceed the obliquity.
      expect(stations.filter((s) => s.outOfBounds)).toHaveLength(3);
      expect(stations.filter((s) => !s.outOfBounds).every((s) => Math.abs(s.declination) < 23.4)).toBe(true);
    });

    it('the Moon over a month gives two stations and two crossings on a finer default grid', () => {
      const month = { body: Planet.MOON, start: utc('2025-01-01T00:00:00Z'), end: utc('2025-01-31T00:00:00Z') };
      const stations = findDeclinationStations(month);
      const crossings = findEquatorCrossings(month);
      expect(stations.coverage.stepDays).toBe(0.25);
      expect(stations.stations.map((s) => s.kind)).toEqual(['turns-south', 'turns-north']);
      expect(crossings.crossings.map((c) => c.direction)).toEqual(['northward', 'southward']);
      // Near the 2025 major lunar standstill the Moon goes past 28 degrees: out of bounds.
      expect(stations.stations.every((s) => s.outOfBounds && Math.abs(s.declination) > 28)).toBe(true);
    });

    it('rejects the nodes and bad windows with the typed error', () => {
      expect(() => findDeclinationStations({ body: Planet.TRUE_NODE, ...year2025 })).toThrow(TimelineError);
      expect(() => findEquatorCrossings({ body: Planet.MEAN_NODE, ...year2025 })).toThrow(TimelineError);
      expect(() =>
        findEquatorCrossings({ body: Planet.SUN, start: year2025.end, end: year2025.start })
      ).toThrow(TimelineError);
    });
  });
});
