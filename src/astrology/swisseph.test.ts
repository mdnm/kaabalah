import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { HouseSystem, Planet } from '../../wasm/src/swisseph';
import {
  calcParsFortunae,
  calculateHouses,
  calculatePlanetaryPositions,
  calculatePlanetPositionDetailed,
  CalcFlag,
  closeSwissEph,
  getSwissEph,
  getSwissEphInfo,
  setSwissEphStrictEphemeris,
  SwissEphEphemerisMismatchError,
  SwissEphError,
  withSwissEphState,
} from './swisseph';

describe('Swiss Ephemeris Integration', () => {
  beforeAll(async () => {
    try {
      await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
      
      // Add a small delay to ensure WASM is fully initialized
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Failed to initialize Swiss Ephemeris:', error);
      throw error;
    }
  });

  afterAll(() => {
    try {
      closeSwissEph();
    } catch (error) {
      console.error('Failed to close Swiss Ephemeris:', error);
    }
  });

  it('should calculate planetary positions', async () => {
    try {
      const date = new Date('2024-03-25T12:00:00Z');
      const positions = await calculatePlanetaryPositions(date);

      // Check if we got results for all planets
      expect(positions).toBeDefined();
      expect(positions[Planet.SUN]).toBeDefined();
      expect(positions[Planet.MOON]).toBeDefined();
      expect(positions[Planet.MERCURY]).toBeDefined();
      expect(positions[Planet.VENUS]).toBeDefined();
      expect(positions[Planet.MARS]).toBeDefined();
      expect(positions[Planet.JUPITER]).toBeDefined();
      expect(positions[Planet.SATURN]).toBeDefined();
      expect(positions[Planet.URANUS]).toBeDefined();
      expect(positions[Planet.NEPTUNE]).toBeDefined();
      expect(positions[Planet.PLUTO]).toBeDefined();
      expect(positions[Planet.MEAN_NODE]).toBeDefined();
      expect(positions[Planet.TRUE_NODE]).toBeDefined();
      expect(positions[Planet.LILITH_MEAN]).toBeDefined();
      expect(positions[Planet.LILITH_TRUE]).toBeDefined();
      expect(positions[Planet.CHIRON]).toBeDefined();

      // Check if positions are within valid ranges (0-360 degrees)
      Object.values(positions).forEach(position => {
        expect(position.longitude).toBeGreaterThanOrEqual(0);
        expect(position.longitude).toBeLessThan(360);
        expect(position.latitude).toBeGreaterThanOrEqual(-90);
        expect(position.latitude).toBeLessThanOrEqual(90);
        expect(position.distance).toBeGreaterThan(0);
      });
    } catch (error) {
      console.error('Failed to calculate planetary positions:', error);
      throw error;
    }
  });

  it('should calculate houses', async () => {
    try {
      const date = new Date('2024-03-25T12:00:00Z');
      const latitude = 40.7128; // New York
      const longitude = -74.0060;
      
      const houses = await calculateHouses(date, latitude, longitude, HouseSystem.PLACIDUS, { treatAsUTC: true });

      // Check house calculation results
      expect(houses).toBeDefined();
      expect(houses.ascendant).toBeDefined();
      expect(houses.mc).toBeDefined();
      expect(houses.houses[0]).toBe(0);
      expect(houses.houses).toHaveLength(13);
      expect(houses.ascmc).toBeDefined();
      expect(houses.ascmc?.armc).toBeDefined();
      expect(houses.ascmc?.vertex).toBeDefined();
      expect(houses.ascmc?.equasc).toBeDefined();
      expect(houses.ascmc?.coasc1).toBeDefined();
      expect(houses.ascmc?.coasc2).toBeDefined();
      expect(houses.ascmc?.polasc).toBeDefined();

      // Check if house cusps are within valid range (0-360 degrees)
      houses.houses.forEach(cusp => {
        expect(cusp).toBeGreaterThanOrEqual(0);
        expect(cusp).toBeLessThan(360);
      });

      // Check if ascendant and MC are within valid range
      expect(houses.ascendant).toBeGreaterThanOrEqual(0);
      expect(houses.ascendant).toBeLessThan(360);
      expect(houses.mc).toBeGreaterThanOrEqual(0);
      expect(houses.mc).toBeLessThan(360);
    } catch (error) {
      console.error('Failed to calculate houses:', error);
      throw error;
    }
  });

  it('should handle different house systems', async () => {
    try {
      const date = new Date('2024-03-25T12:00:00Z');
      const latitude = 40.7128;
      const longitude = -74.0060;
      
      const houseSystems = [
        HouseSystem.PLACIDUS,
        HouseSystem.KOCH,
        HouseSystem.EQUAL,
        HouseSystem.WHOLE_SIGN
      ];

      for (const system of houseSystems) {
        const houses = await calculateHouses(date, latitude, longitude, system);
        expect(houses).toBeDefined();
        expect(houses.houses).toHaveLength(13);
      }
    } catch (error) {
      console.error('Failed to calculate houses for different systems:', error);
      throw error;
    }
  });

  it('should handle extreme latitudes', async () => {
    try {
      const date = new Date('2024-03-25T12:00:00Z');
      const extremeLatitudes = [
        { lat: 60, lon: 0 },    // High North
        { lat: -60, lon: 0 },   // High South
        { lat: 0, lon: 179 },   // Near International Date Line
        { lat: 0, lon: -179 }   // Near International Date Line
      ];

      for (const { lat, lon } of extremeLatitudes) {
        const houses = await calculateHouses(date, lat, lon, HouseSystem.PLACIDUS, { treatAsUTC: true });
        expect(houses).toBeDefined();
        expect(houses.houses).toHaveLength(13);
      }
    } catch (error) {
      console.error('Failed to calculate houses for extreme latitudes:', error);
      throw error;
    }
  });

  it('should calculate fortune part (diurnal)', async () => {
    try {
      const asc = 100;
      const sunLon = 100;
      const moonLon = 100;
      const fortunePart = calcParsFortunae(asc, sunLon, moonLon, true);
      expect(fortunePart).toBeDefined();
      expect(fortunePart).toBeGreaterThanOrEqual(0);
      expect(fortunePart).toBeLessThan(360);
    }
    catch (error) {
      console.error('Failed to calculate fortune part:', error);
      throw error;
    }
  });

  it('should calculate fortune part (nocturnal)', async () => {
    try {
      const asc = 100;
      const sunLon = 100;
      const moonLon = 100;
      const fortunePart = calcParsFortunae(asc, sunLon, moonLon, false);
      expect(fortunePart).toBeDefined();
      expect(fortunePart).toBeGreaterThanOrEqual(0);
      expect(fortunePart).toBeLessThan(360);
    }
    catch (error) {
      console.error('Failed to calculate fortune part:', error);
      throw error;
    }
  });

  it('should calculate houses for a local time with DST via IANA zone', async () => {
    // 2000-10-27 17:44 local in Formosa, GO, Brazil
    const parts = { year: 2000, month: 10, day: 27, hour: 17, minute: 44 };
    const lat = -15.54064;
    const lon = -47.33571;
    const houses = await calculateHouses(parts, lat, lon, HouseSystem.PLACIDUS, {
      timeZone: 'America/Sao_Paulo'
    });

    expect(houses).toBeDefined();
    expect(houses.houses).toHaveLength(13);

    // Expect cusp 12 ≈ 15° Pisces (~345°)
    const cusp12 = houses.houses[12];
    expect(cusp12).toBeGreaterThan(340);
    expect(cusp12).toBeLessThan(350);

    // Expect cusp 6 ≈ 15° Virgo (~165°)
    const cusp6 = houses.houses[6];
    expect(cusp6).toBeGreaterThan(160);
    expect(cusp6).toBeLessThan(170);
  });

  it('should auto-resolve time zone from lat/lon and match explicit zone', async () => {
    const parts = { year: 2000, month: 10, day: 27, hour: 17, minute: 44 };
    const lat = -15.54064;
    const lon = -47.33571;

    const explicit = await calculateHouses(parts, lat, lon, HouseSystem.PLACIDUS, {
      timeZone: 'America/Sao_Paulo'
    });
    const auto = await calculateHouses(parts, lat, lon, HouseSystem.PLACIDUS, {
      autoTimeZone: true
    });

    // Compare a couple of cusps within a small tolerance
    const diff = (a: number, b: number) => {
      const d = Math.abs(a - b) % 360;
      return d > 180 ? 360 - d : d;
    };
    expect(diff(explicit.houses[12], auto.houses[12])).toBeLessThan(0.5);
    expect(diff(explicit.houses[6], auto.houses[6])).toBeLessThan(0.5);
  });

  it('utcOffsetMinutes should override timeZone when both provided', async () => {
    const parts = { year: 2000, month: 10, day: 27, hour: 17, minute: 44 };
    const lat = -15.54064;
    const lon = -47.33571;

    // Using explicit offset UTC-2
    const byOffset = await calculateHouses(parts, lat, lon, HouseSystem.PLACIDUS, {
      utcOffsetMinutes: -120
    });

    // Providing both should match the offset result
    const both = await calculateHouses(parts, lat, lon, HouseSystem.PLACIDUS, {
      timeZone: 'America/Sao_Paulo',
      utcOffsetMinutes: -120
    });

    const diff = (a: number, b: number) => {
      const d = Math.abs(a - b) % 360;
      return d > 180 ? 360 - d : d;
    };
    expect(diff(byOffset.houses[12], both.houses[12])).toBeLessThan(1e-6);
    expect(diff(byOffset.houses[6], both.houses[6])).toBeLessThan(1e-6);
  });
}); 

describe('Swiss Ephemeris provenance, strict mode and lifecycle', () => {
  const inRange = new Date('2000-01-01T12:00:00Z');

  beforeAll(async () => {
    closeSwissEph();
    await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH, onRuntimeNotice: () => undefined });
  });

  afterAll(() => {
    setSwissEphStrictEphemeris(false);
    closeSwissEph();
  });

  it('reports requested/returned flags and a "swiss" label for in-range dates', () => {
    const detailed = calculatePlanetPositionDetailed(inRange, Planet.SUN);
    expect(detailed.ephemeris).toBe('swiss');
    expect(detailed.requestedEphemeris).toBe('swiss');
    expect(detailed.substituted).toBe(false);
    expect(detailed.warning).toBeNull();
    expect(detailed.requestedFlags & CalcFlag.SWISS_EPH).toBeTruthy();
    expect(detailed.returnedFlags & CalcFlag.SWISS_EPH).toBeTruthy();
    expect(detailed.returnedFlags & CalcFlag.MOSHIER).toBe(0);
    // independent: apparent Sun at J2000 is ~280.369 deg
    expect(detailed.position.longitude).toBeCloseTo(280.3689, 3);
  });

  it.each([
    ['year 3000', new Date(Date.UTC(3000, 0, 1, 12))],
    ['year 1700', new Date(Date.UTC(1700, 0, 1, 12))],
  ])('labels %s as moshier (never swiss) in non-strict mode and keeps the Swiss warning', (_label, date) => {
    const detailed = calculatePlanetPositionDetailed(date, Planet.SUN);
    expect(detailed.ephemeris).toBe('moshier');
    expect(detailed.substituted).toBe(true);
    expect(detailed.returnedFlags & CalcFlag.MOSHIER).toBeTruthy();
    expect(detailed.returnedFlags & CalcFlag.SWISS_EPH).toBe(0);
    expect(detailed.warning).toMatch(/not found/i);
    expect(detailed.warning).toMatch(/Moshier/i);
  });

  it('labels year -3000 as moshier', () => {
    const date = new Date(Date.UTC(2000, 0, 1, 12));
    date.setUTCFullYear(-3000);
    const detailed = calculatePlanetPositionDetailed(date, Planet.SUN);
    expect(detailed.ephemeris).toBe('moshier');
    expect(detailed.substituted).toBe(true);
  });

  it('strictEphemeris option throws a typed mismatch error for out-of-range dates', () => {
    const date = new Date(Date.UTC(3000, 0, 1, 12));
    let caught: unknown;
    try {
      calculatePlanetPositionDetailed(date, Planet.SUN, { strictEphemeris: true });
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(SwissEphEphemerisMismatchError);
    const mismatch = caught as SwissEphEphemerisMismatchError;
    expect(mismatch).toBeInstanceOf(SwissEphError);
    expect(mismatch.code).toBe('SWISSEPH_EPHEMERIS_MISMATCH');
    expect(mismatch.requestedEphemeris).toBe('swiss');
    expect(mismatch.returnedEphemeris).toBe('moshier');
    expect(mismatch.reason).toBe('date_outside_installed_ephemeris_files');
    expect(mismatch.details.missingFile).toBe('sepl_30.se1');
  });

  it('global strict mode makes high-level calculations throw instead of mislabelling Moshier output', async () => {
    setSwissEphStrictEphemeris(true);
    try {
      expect(getSwissEphInfo().strictEphemeris).toBe(true);
      await expect(calculatePlanetaryPositions(new Date(Date.UTC(3000, 0, 1, 12)))).rejects.toBeInstanceOf(
        SwissEphEphemerisMismatchError
      );
      // in-range dates still work in strict mode
      await expect(calculatePlanetaryPositions(inRange)).resolves.toBeDefined();
    } finally {
      setSwissEphStrictEphemeris(false);
    }
  });

  it('does not treat an explicit Moshier request as a substitution', () => {
    const detailed = calculatePlanetPositionDetailed(new Date(Date.UTC(3000, 0, 1, 12)), Planet.SUN, {
      flags: CalcFlag.MOSHIER | CalcFlag.SPEED,
      strictEphemeris: true,
    });
    expect(detailed.ephemeris).toBe('moshier');
    expect(detailed.substituted).toBe(false);
  });

  it('getSwissEphInfo reports resolved assets, mount mode and the files found', () => {
    const info = getSwissEphInfo();
    expect(info.initialized).toBe(true);
    expect(info.runtime).toBe('node');
    expect(info.wasmPath).toBe(WASM_PATH);
    expect(info.wasmPathSource).toBe('explicit');
    expect(info.ephePath).toBe(EPHE_PATH);
    expect(info.ephePathSource).toBe('explicit');
    expect(['nodefs-mount', 'host-path', 'memfs-copy']).toContain(info.mountMode);
    expect(info.ephemerisFiles.missing).toEqual([]);
    expect(info.ephemerisFiles.found).toEqual(['seas_18.se1', 'semo_18.se1', 'sepl_18.se1']);
    expect(info.probe?.ephemeris).toBe('swiss');
    expect(info.shippedCoverage.fromYear).toBe(1800);
    // the shipped wasm does not export swe_version
    expect(info.swissEphemerisVersion).toBeNull();
  });

  it('getSwissEphInfo reports initialized:false when closed', () => {
    closeSwissEph();
    expect(getSwissEphInfo().initialized).toBe(false);
    expect(() => calculatePlanetPositionDetailed(inRange, Planet.SUN)).toThrow(/not initialized/i);
    try {
      calculatePlanetPositionDetailed(inRange, Planet.SUN);
    } catch (error) {
      expect((error as SwissEphError).code).toBe('SWISSEPH_NOT_INITIALIZED');
    }
  });

  it('concurrent first getSwissEph calls share one initialization', async () => {
    closeSwissEph();
    const notices: string[] = [];
    const options = {
      ephePath: EPHE_PATH,
      wasmPath: WASM_PATH,
      onRuntimeNotice: (message: string) => notices.push(message),
    };
    await Promise.all([getSwissEph(options), getSwissEph(options), getSwissEph(options)]);
    expect(notices.filter((message) => message.startsWith('Setting ephemeris path'))).toHaveLength(1);
    expect(getSwissEphInfo().initialized).toBe(true);
  });

  it('getSwissEph accepts strictEphemeris when already initialized', async () => {
    await getSwissEph({ strictEphemeris: true });
    expect(getSwissEphInfo().strictEphemeris).toBe(true);
    await getSwissEph({ strictEphemeris: false });
    expect(getSwissEphInfo().strictEphemeris).toBe(false);
  });

  describe('mutable Swiss state', () => {
    const flags = CalcFlag.SWISS_EPH | CalcFlag.SPEED;
    const sidereal = (): number =>
      calculatePlanetPositionDetailed(inRange, Planet.SUN, { flags: flags | CalcFlag.SIDEREAL }).position.longitude;
    const tropical = (): number => calculatePlanetPositionDetailed(inRange, Planet.SUN, { flags }).position.longitude;

    it('sets sidereal mode only inside the callback and restores the default afterwards', () => {
      const trop = tropical();
      const before = trop - sidereal(); // default Fagan/Bradley ayanamsa ~24.74 at J2000
      const inside = withSwissEphState({ sidereal: { mode: 1 } }, () => trop - sidereal()); // Lahiri ~23.86
      const after = trop - sidereal();

      expect(inside).toBeCloseTo(23.857, 1);
      expect(before).toBeCloseTo(24.74, 1);
      expect(after).toBeCloseTo(before, 9);
      expect(tropical()).toBe(trop);
    });

    it('restores state when the callback throws', () => {
      const before = sidereal();
      expect(() =>
        withSwissEphState({ sidereal: { mode: 1 } }, () => {
          throw new Error('boom');
        })
      ).toThrow('boom');
      expect(sidereal()).toBe(before);
    });

    it('rejects async callbacks and nesting with SWISSEPH_STATE_MISUSE', () => {
      let code: string | undefined;
      try {
        withSwissEphState({ sidereal: { mode: 1 } }, () => Promise.resolve(1) as unknown as number);
      } catch (error) {
        code = (error as SwissEphError).code;
      }
      expect(code).toBe('SWISSEPH_STATE_MISUSE');

      code = undefined;
      try {
        withSwissEphState({}, () => withSwissEphState({}, () => 1));
      } catch (error) {
        code = (error as SwissEphError).code;
      }
      expect(code).toBe('SWISSEPH_STATE_MISUSE');
      // depth counter was released
      expect(withSwissEphState({}, () => 7)).toBe(7);
    });
  });
});
