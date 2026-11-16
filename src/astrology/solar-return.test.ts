import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getSolarReturnChart, type BirthChartOptions } from './index';
import { calculateBodyAtJulianDay, calculateSinglePlanetPosition, CalcFlag, closeSwissEph, getJulianDay, getJulianDayExact, getSwissEph, Planet } from './swisseph';
import { sampleBodyAtJd } from './returns';
import { signedAngleDifference } from './root-solver';

const FLAGS = CalcFlag.SWISS_EPH | CalcFlag.SPEED;
const sunAt = (jd: number) => calculateBodyAtJulianDay(jd, Planet.SUN, FLAGS).longitude;

describe('getSolarReturnChart window and exactness', () => {
  beforeAll(async () => {
    await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
  });
  afterAll(() => closeSwissEph());

  it('finds the return for a birth just after local midnight in UTC+14 (formerly threw)', async () => {
    const natal: BirthChartOptions = {
      date: { year: 1980, month: 1, day: 1, hour: 0, minute: 0, second: 0 },
      latitude: 10,
      longitude: 10,
      timeZoneSettings: { utcOffsetMinutes: 840 },
    };
    const r = await getSolarReturnChart({ natal, year: 2005 });
    expect(r.residualDegrees!).toBeLessThanOrEqual(1e-6);
    // Return nearest the local-civil anniversary (Jan 1 2005 00:00 at +14 = 2004-12-31T10:00Z)
    const anniversary = Date.UTC(2005, 0, 1, 0, 0, 0) - 840 * 60_000;
    expect(Math.abs(r.exactReturnDate.getTime() - anniversary)).toBeLessThan(2 * 86_400_000);
  });

  it('sweeps offsets x births x years: always succeeds with residual <= 1e-6 and a JD-exact chart Sun', async () => {
    const offsets = [-720, 0, 720, 840];
    const births = [
      { year: 1980, month: 1, day: 1 },
      { year: 1980, month: 2, day: 29 },
      { year: 1980, month: 6, day: 30 },
      { year: 1979, month: 12, day: 31 },
    ];
    const clocks = [
      { hour: 0, minute: 0 },
      { hour: 12, minute: 0 },
      { hour: 23, minute: 59 },
    ];
    const years = [2001, 2002, 2003, 2004, 2005];
    for (const utcOffsetMinutes of offsets) {
      for (const b of births) {
        for (const c of clocks) {
          const natal: BirthChartOptions = {
            date: { ...b, ...c, second: 0 },
            latitude: 10,
            longitude: 10,
            timeZoneSettings: { utcOffsetMinutes },
          };
          for (const year of years) {
            const r = await getSolarReturnChart({ natal, year });
            expect(r.residualDegrees!).toBeLessThanOrEqual(1e-6);
            // independent check of the solved root
            expect(Math.abs(signedAngleDifference(sunAt(r.exactReturnJd!) - r.natalSunLongitude))).toBeLessThanOrEqual(1e-6);
            // the returned chart's Sun is the natal Sun to far better than the whole-second truncation (1.2e-5 deg)
            expect(Math.abs(signedAngleDifference(r.solarReturnChart.planets.sun.longitude - r.natalSunLongitude))).toBeLessThan(1e-7);
          }
        }
      }
    }
  }, 300_000);

  it('getJulianDayExact keeps milliseconds and equals getJulianDay at whole seconds', () => {
    const whole = new Date(Date.UTC(2020, 5, 15, 13, 14, 15));
    expect(Math.abs(getJulianDayExact(whole) - getJulianDay(whole))).toBeLessThan(1e-9);
    const withMs = new Date(whole.getTime() + 999);
    expect(getJulianDayExact(withMs) - getJulianDayExact(whole)).toBeCloseTo(0.999 / 86400, 9);
    // legacy helper still truncates sub-second input
    expect(getJulianDay(withMs)).toBe(getJulianDay(whole));
  });

  it('exact-JD sampling matches the former whole-second-floor extrapolation (1e-9 deg; Moon extrapolation error itself reaches ~2e-7 deg)', () => {
    const bodies = [Planet.SUN, Planet.MOON, Planet.MERCURY, Planet.SATURN];
    for (const body of bodies) {
      for (const frac of [0.001, 0.25, 0.5, 0.999]) {
        const ms = Date.UTC(2010, 2, 3, 4, 5, 6) + frac * 1000;
        const floorMs = Math.floor(ms / 1000) * 1000;
        const base = calculateSinglePlanetPosition(new Date(floorMs), body);
        const extrapolated = base.longitude + (base.longitudeSpeed ?? 0) * ((ms - floorMs) / 86_400_000);
        const exact = sampleBodyAtJd(body, getJulianDayExact(new Date(ms))).longitude;
        expect(Math.abs(signedAngleDifference(exact - extrapolated))).toBeLessThan(body === Planet.MOON ? 5e-7 : 1e-9);
      }
    }
  });
});
