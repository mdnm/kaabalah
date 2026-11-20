import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TimelineError } from './firdaria';
import {
  CHALDEAN_ORDER,
  WEEKDAY_RULERS,
  getPlanetaryHours,
  type PlanetaryHours,
  type PlanetaryHoursOptions,
} from './planetary-hours';
import { closeSwissEph, getSwissEph } from './swisseph';

const MINUTE = 60_000;
const GREENWICH = { latitude: 51.4779, longitude: -0.0015 };
const TROMSO = { latitude: 69.6492, longitude: 18.9553 };
/** Kiritimati keeps UTC+14 at 157 degrees west: civil time is a calendar day ahead of local mean time. */
const KIRITIMATI = { latitude: 1.87, longitude: -157.4 };

function available(options: PlanetaryHoursOptions): PlanetaryHours {
  const result = getPlanetaryHours(options);
  if (!result.available) throw new Error(`expected planetary hours, got ${result.reason}`);
  return result;
}

describe('getPlanetaryHours', () => {
  beforeAll(async () => {
    await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
  });
  afterAll(() => {
    closeSwissEph();
  });

  // Wednesday 20 March 2024 (equinox) at Greenwich, noon UT.
  const noon = new Date('2024-03-20T12:00:00Z');

  it('matches the published sunrise and sunset for London on 20 March 2024', () => {
    const r = available({ date: noon, ...GREENWICH });
    // Almanac times for London that day: sunrise 06:02, sunset 18:14 (GMT).
    expect(Math.abs(r.sunrise.getTime() - Date.parse('2024-03-20T06:02:00Z'))).toBeLessThan(2 * MINUTE);
    expect(Math.abs(r.sunset.getTime() - Date.parse('2024-03-20T18:14:00Z'))).toBeLessThan(2 * MINUTE);
    expect(Math.abs(r.nextSunrise.getTime() - Date.parse('2024-03-21T06:00:00Z'))).toBeLessThan(2 * MINUTE);
  });

  it('rules a whole Wednesday in Chaldean order from Mercury', () => {
    const r = available({ date: noon, ...GREENWICH });
    expect(r.weekday).toBe(3);
    expect(r.dayRuler).toBe('Mercury');
    expect(r.hours.map((h) => h.ruler)).toEqual([
      'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun',
      'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars',
      'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter',
      'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn',
    ]);
    // The hour after the 24th is the first hour of Thursday.
    const next = available({ date: new Date(r.nextSunrise.getTime()), ...GREENWICH });
    expect(next.sunrise.getTime()).toBe(r.nextSunrise.getTime());
    expect(next.dayRuler).toBe('Jupiter');
    expect(next.hours[0].ruler).toBe(CHALDEAN_ORDER[(CHALDEAN_ORDER.indexOf(r.hours[23].ruler) + 1) % 7]);
  });

  it('gives each weekday its ruler over a full week', () => {
    for (let d = 0; d < 7; d++) {
      const date = new Date(noon.getTime() + d * 24 * 60 * MINUTE);
      const r = available({ date, ...GREENWICH });
      expect(r.weekday).toBe(date.getUTCDay());
      expect(r.dayRuler).toBe(WEEKDAY_RULERS[date.getUTCDay()]);
      expect(r.hours[0].ruler).toBe(r.dayRuler);
    }
  });

  it('keeps an instant before sunrise in the previous planetary day', () => {
    const r = available({ date: new Date('2024-03-20T03:00:00Z'), ...GREENWICH });
    expect(r.sunrise.toISOString().slice(0, 10)).toBe('2024-03-19');
    expect(r.nextSunrise.toISOString().slice(0, 10)).toBe('2024-03-20');
    expect(r.weekday).toBe(2);
    expect(r.dayRuler).toBe('Mars');
    expect(r.current.isDay).toBe(false);
    expect(r.current.index).toBeGreaterThanOrEqual(12);
  });

  it('returns 24 contiguous hours from sunrise to the next sunrise', () => {
    const r = available({ date: noon, ...GREENWICH });
    expect(r.hours).toHaveLength(24);
    expect(r.hours[0].start.getTime()).toBe(r.sunrise.getTime());
    expect(r.hours[11].end.getTime()).toBe(r.sunset.getTime());
    expect(r.hours[12].start.getTime()).toBe(r.sunset.getTime());
    expect(r.hours[23].end.getTime()).toBe(r.nextSunrise.getTime());
    r.hours.forEach((h, i) => {
      expect(h.index).toBe(i);
      expect(h.number).toBe((i % 12) + 1);
      expect(h.isDay).toBe(i < 12);
      expect(h.end.getTime()).toBeGreaterThan(h.start.getTime());
      if (i > 0) expect(h.start.getTime()).toBe(r.hours[i - 1].end.getTime());
      const length = (h.end.getTime() - h.start.getTime()) / MINUTE;
      expect(length).toBeCloseTo(i < 12 ? r.dayHourMinutes : r.nightHourMinutes, 3);
    });
    expect(r.dayHourMinutes * 12 + r.nightHourMinutes * 12).toBeCloseTo(
      (r.nextSunrise.getTime() - r.sunrise.getTime()) / MINUTE,
      6
    );
  });

  it('finds the hour containing the instant, with inclusive start and exclusive end', () => {
    const r = available({ date: noon, ...GREENWICH });
    expect(r.hours).toContain(r.current);
    expect(r.current.start.getTime()).toBeLessThanOrEqual(noon.getTime());
    expect(r.current.end.getTime()).toBeGreaterThan(noon.getTime());
    // Just before solar noon is the 6th day hour.
    expect(r.current.index).toBe(5);
    expect(r.current.ruler).toBe('Sun');

    const atBoundary = available({ date: new Date(r.hours[7].start.getTime()), ...GREENWICH });
    expect(atBoundary.current.index).toBe(7);
    const beforeBoundary = available({ date: new Date(r.hours[7].start.getTime() - 1), ...GREENWICH });
    expect(beforeBoundary.current.index).toBe(6);
    const atSunset = available({ date: new Date(r.sunset.getTime()), ...GREENWICH });
    expect(atSunset.current.index).toBe(12);
    const lastMoment = available({ date: new Date(r.nextSunrise.getTime() - 1), ...GREENWICH });
    expect(lastMoment.sunrise.getTime()).toBe(r.sunrise.getTime());
    expect(lastMoment.current.index).toBe(23);
  });

  it('has longer day hours in summer and longer night hours in winter', () => {
    const summer = available({ date: new Date('2024-06-20T12:00:00Z'), ...GREENWICH });
    const winter = available({ date: new Date('2024-12-21T12:00:00Z'), ...GREENWICH });
    expect(summer.dayHourMinutes).toBeGreaterThan(80);
    expect(summer.nightHourMinutes).toBeLessThan(40);
    expect(winter.dayHourMinutes).toBeLessThan(40);
    expect(winter.nightHourMinutes).toBeGreaterThan(80);
  });

  it('reads the weekday in local mean time by default and states it', () => {
    const r = available({ date: noon, ...GREENWICH });
    expect(r.method.weekdayBasis).toBe('local-mean-time');
    expect(r.method.timeZone).toBeNull();
    expect(r.method.utcOffsetMinutes).toBeCloseTo(-0.006, 6);
    expect(r.method.description).toContain('local mean time');
  });

  it('reads the weekday in an IANA zone or an explicit offset when given', () => {
    // Sunrise at Kiritimati is about 16:30 UT on the 19th: Wednesday 06:30 in UTC+14,
    // but still Tuesday in the local mean time of 157 degrees west.
    const date = new Date('2024-03-19T22:00:00Z');
    const lmt = available({ date, ...KIRITIMATI });
    expect(lmt.sunrise.toISOString().slice(0, 10)).toBe('2024-03-19');
    expect(lmt.weekday).toBe(2);
    expect(lmt.dayRuler).toBe('Mars');

    const zoned = available({ date, ...KIRITIMATI, timeZoneSettings: { timeZone: 'Pacific/Kiritimati' } });
    expect(zoned.sunrise.getTime()).toBe(lmt.sunrise.getTime());
    expect(zoned.weekday).toBe(3);
    expect(zoned.dayRuler).toBe('Mercury');
    expect(zoned.method.weekdayBasis).toBe('time-zone');
    expect(zoned.method.timeZone).toBe('Pacific/Kiritimati');
    expect(zoned.method.utcOffsetMinutes).toBe(840);

    const offset = available({
      date,
      ...KIRITIMATI,
      timeZoneSettings: { utcOffsetMinutes: 840, timeZone: 'Europe/London' },
    });
    expect(offset.dayRuler).toBe('Mercury');
    expect(offset.method.weekdayBasis).toBe('utc-offset');
    expect(offset.method.timeZone).toBeNull();
  });

  it('reports polar day and polar night as unavailable instead of throwing', () => {
    const midsummer = getPlanetaryHours({ date: new Date('2024-06-21T12:00:00Z'), ...TROMSO });
    expect(midsummer.available).toBe(false);
    if (!midsummer.available) {
      expect(midsummer.reason).toBe('polar-day');
      expect(midsummer.sunApparentAltitude).toBeGreaterThan(0);
      expect(midsummer.message).toContain('does not set');
    }
    // Midnight sun: still above the horizon at local midnight.
    const midnightSun = getPlanetaryHours({ date: new Date('2024-06-21T22:45:00Z'), ...TROMSO });
    expect(midnightSun).toMatchObject({ available: false, reason: 'polar-day' });

    const midwinter = getPlanetaryHours({ date: new Date('2024-12-21T11:00:00Z'), ...TROMSO });
    expect(midwinter.available).toBe(false);
    if (!midwinter.available) {
      expect(midwinter.reason).toBe('polar-night');
      expect(midwinter.sunApparentAltitude).toBeLessThan(0);
      expect(midwinter.message).toContain('does not rise');
    }
    expect(getPlanetaryHours({ date: new Date('2024-06-21T12:00:00Z'), latitude: 90, longitude: 0 })).toMatchObject({
      available: false,
      reason: 'polar-day',
    });
  });

  it('is available again at Tromso once the Sun rises and sets', () => {
    const r = available({ date: new Date('2024-09-22T10:00:00Z'), ...TROMSO });
    expect(r.hours).toHaveLength(24);
    expect(r.current.isDay).toBe(true);
  });

  it('rejects invalid input with a typed error', () => {
    const bad: PlanetaryHoursOptions[] = [
      { date: new Date(NaN), ...GREENWICH },
      { date: noon, latitude: 91, longitude: 0 },
      { date: noon, latitude: 0, longitude: 181 },
      { date: noon, latitude: Number.NaN, longitude: 0 },
      { date: noon, ...GREENWICH, timeZoneSettings: { utcOffsetMinutes: Number.NaN } },
      { date: noon, ...GREENWICH, timeZoneSettings: { timeZone: 'Not/AZone' } },
    ];
    for (const options of bad) {
      let error: unknown;
      try {
        getPlanetaryHours(options);
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(TimelineError);
      expect((error as TimelineError).code).toBe('INVALID_INPUT');
    }
  });
});
