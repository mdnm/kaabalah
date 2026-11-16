import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getBirthChart, getSolarReturnChart, HouseSystem, type BirthChartOptions } from './index';
import { closeSwissEph, getSwissEph, SwissEphError } from './swisseph';

const polar = (extra: Partial<BirthChartOptions> = {}): BirthChartOptions => ({
  date: { year: 2000, month: 6, day: 21, hour: 12 },
  latitude: 70,
  longitude: 25,
  timeZoneSettings: { utcOffsetMinutes: 120 },
  ...extra,
});

describe('house systems beyond the polar circle', () => {
  beforeAll(async () => {
    await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
  });
  afterAll(() => closeSwissEph());

  it.each([HouseSystem.PLACIDUS, HouseSystem.KOCH])('%s throws a typed, actionable SwissEphError by default', async (houseSystem) => {
    const err = await getBirthChart(polar({ houseSystem })).catch((e) => e);
    expect(err).toBeInstanceOf(SwissEphError);
    expect(err.code).toBe('SWISSEPH_HOUSES_UNAVAILABLE');
    expect(err.message).toContain(`"${houseSystem}"`);
    expect(err.message).toContain('70');
    expect(err.message).toMatch(/whole-sign/);
    expect(err.message).toMatch(/Porphyry/i);
    expect(err.details).toMatchObject({ houseSystem, latitude: 70 });
  });

  it('does not substitute silently: no option, no substitution', async () => {
    await expect(getBirthChart(polar({ houseSystem: HouseSystem.WHOLE_SIGN }))).resolves.toMatchObject({ houseSystem: 'W' });
  });

  it.each([
    ['whole-sign', HouseSystem.WHOLE_SIGN],
    ['equal', HouseSystem.EQUAL],
    ['porphyry', HouseSystem.PORPHYRIUS],
  ] as const)('opt-in houseSystemFallback "%s" records the substitution', async (fallback, used) => {
    const chart = await getBirthChart(polar({ houseSystem: HouseSystem.PLACIDUS, houseSystemFallback: fallback }));
    expect(chart.houseSystem).toBe(used);
    expect(chart.houseSystemSubstitution).toMatchObject({ requested: HouseSystem.PLACIDUS, used, latitude: 70 });
    expect(chart.houseSystemSubstitution!.notice).toContain('substituted');
    expect(chart.houses.houses).toHaveLength(12);
    // identical to explicitly requesting the substitute
    const direct = await getBirthChart(polar({ houseSystem: used }));
    expect(chart.houses.ascendant.longitude).toBeCloseTo(direct.houses.ascendant.longitude, 9);
  });

  it('the fallback is not recorded when the requested system works', async () => {
    const chart = await getBirthChart({ ...polar({ houseSystemFallback: 'equal' }), latitude: 45 });
    expect(chart.houseSystem).toBe(HouseSystem.PLACIDUS);
    expect(chart.houseSystemSubstitution).toBeUndefined();
  });

  it('a fallback for a non-house error is not applied', async () => {
    await expect(getBirthChart(polar({ houseSystemFallback: 'equal', latitude: 91 }))).rejects.toThrow(/Invalid latitude/);
  });

  it('solar return chart carries the typed error / recorded fallback', async () => {
    const natal = polar({ houseSystem: HouseSystem.PLACIDUS, houseSystemFallback: 'whole-sign' });
    const sr = await getSolarReturnChart({ natal, year: 2010 });
    expect(sr.solarReturnChart.houseSystem).toBe(HouseSystem.WHOLE_SIGN);
    expect(sr.solarReturnChart.houseSystemSubstitution).toBeDefined();
    await expect(
      getSolarReturnChart({ natal: polar({ houseSystem: HouseSystem.WHOLE_SIGN }), year: 2010, solarReturnHouseSystem: HouseSystem.PLACIDUS })
    ).rejects.toMatchObject({ code: 'SWISSEPH_HOUSES_UNAVAILABLE' });
  });
});
