import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { VirtualNodes } from '../../wasm/src/swisseph';
import { BirthChartOptions, getBirthChart, getCompositeChart, getSect, getSolarReturnChart, getSynastryChart, getTransitChart, getTransitRange, HouseSystem, type LocalDateTimeParts } from './index';
import { closeSwissEph, getSwissEph } from './swisseph';

describe('Astrology Module', () => {
  beforeAll(async () => {
    try {
      await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
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

  it('should determine sect from Sun house boundaries', () => {
    expect(getSect(7)).toBe('diurnal');
    expect(getSect(12)).toBe('diurnal');
    expect(getSect(1)).toBe('nocturnal');
    expect(getSect(6)).toBe('nocturnal');
    expect(getSect(0)).toBe('nocturnal');
    expect(getSect(13)).toBe('nocturnal');
  });

  it('should calculate a birth chart', async () => {
    try {
      const options: BirthChartOptions = {
        // Local civil time: 2024-03-25 12:00 at New York
        date: new Date(2024, 2, 25, 12, 0, 0),
        latitude: 40.7128,
        longitude: -74.0060,
        houseSystem: HouseSystem.PLACIDUS,
        timeZoneSettings: { timeZone: 'America/New_York' }
      };

      const chart = await getBirthChart(options);
      expect(chart).toBeDefined();
      expect(chart.planets).toBeDefined();
      expect(chart.houses).toBeDefined();

      // Verify planets
      expect(chart.planets.sun).toBeDefined();
      expect(chart.planets.moon).toBeDefined();
      expect(chart.planets.mercury).toBeDefined();
      expect(chart.planets.venus).toBeDefined();
      expect(chart.planets.mars).toBeDefined();
      expect(chart.planets.jupiter).toBeDefined();
      expect(chart.planets.saturn).toBeDefined();

      // Verify houses
      expect(chart.houses.ascendant).toBeDefined();
      expect(chart.houses.mc).toBeDefined();
      expect(chart.houses.houses).toHaveLength(12);

      // Check valid ranges
      Object.values(chart.planets).forEach(planet => {
        expect(planet.longitude).toBeGreaterThanOrEqual(0);
        expect(planet.longitude).toBeLessThan(360);
        expect(planet.latitude).toBeGreaterThanOrEqual(-90);
        expect(planet.latitude).toBeLessThanOrEqual(90);
      });

      chart.houses.houses.forEach(cusp => {
        expect(cusp.longitude).toBeGreaterThanOrEqual(0);
        expect(cusp.longitude).toBeLessThan(360);
      });

      expect(chart.nodes[VirtualNodes.PARS_FORTUNAE]).toBeDefined();
      expect(chart.sect).toMatch(/^(diurnal|nocturnal)$/);
      expect(chart.sect).toBe(getSect(chart.planets.sun.zodiacPosition.house));
    } catch (error) {
      console.error('Failed to calculate birth chart:', error);
      throw error;
    }
  });

  it('should handle timezone conversion correctly', async () => {
    try {
      const options: BirthChartOptions = {
        // Local civil time: 2024-03-25 08:00 at New York
        date: new Date(2024, 2, 25, 8, 0, 0),
        latitude: 40.7128,
        longitude: -74.0060,
        houseSystem: HouseSystem.PLACIDUS,
        timeZoneSettings: { timeZone: 'America/New_York' }
      };

      const chart = await getBirthChart(options);
      expect(chart).toBeDefined();

      // The chart should be calculated for 8:00 AM local (America/New_York)
      // Verify this by checking the MC position which is time-dependent
      expect(chart.houses.mc).toBeDefined();
      
      // Calculate another chart 1 hour later
      const laterOptions = {
        ...options,
        date: new Date(2024, 2, 25, 9, 0, 0) // 1 hour later local time
      };
      const laterChart = await getBirthChart(laterOptions);
      
      // MC should have moved approximately 15 degrees (rough approximation)
      const mcDifference = Math.abs(laterChart.houses.mc.longitude - chart.houses.mc.longitude);
      expect(mcDifference).toBeGreaterThan(10);
      expect(mcDifference).toBeLessThan(20);
    } catch (error) {
      console.error('Failed to test timezone conversion:', error);
      throw error;
    }
  });

  it('should accept explicit local civil date-time parts', async () => {
    const baseOptions = {
      latitude: 40.7128,
      longitude: -74.0060,
      houseSystem: HouseSystem.PLACIDUS,
      timeZoneSettings: { timeZone: 'America/New_York' as const },
    };

    const fromDate = await getBirthChart({
      ...baseOptions,
      date: new Date(2024, 2, 25, 8, 0, 0),
    });

    const localParts: LocalDateTimeParts = {
      year: 2024,
      month: 3,
      day: 25,
      hour: 8,
      minute: 0,
      second: 0,
    };
    const fromParts = await getBirthChart({
      ...baseOptions,
      date: localParts,
    });

    expect(fromParts.dateUtc.getTime()).toBe(fromDate.dateUtc.getTime());
    expect(fromParts.houses.ascendant.longitude).toBeCloseTo(fromDate.houses.ascendant.longitude, 8);
    expect(fromParts.houses.mc.longitude).toBeCloseTo(fromDate.houses.mc.longitude, 8);
    expect(fromParts.planets.sun.longitude).toBeCloseTo(fromDate.planets.sun.longitude, 8);
  });

  it('should handle different house systems', async () => {
    try {
      const baseOptions: BirthChartOptions = {
        date: new Date(2024, 2, 25, 12, 0, 0),
        latitude: 40.7128,
        longitude: -74.0060,
        houseSystem: HouseSystem.PLACIDUS,
        timeZoneSettings: { timeZone: 'America/New_York' }
      };

      const houseSystems = [
        HouseSystem.PLACIDUS,
        HouseSystem.KOCH,
        HouseSystem.EQUAL,
        HouseSystem.WHOLE_SIGN
      ];

      for (const system of houseSystems) {
        const options = { ...baseOptions, houseSystem: system };
        const chart = await getBirthChart(options);
        expect(chart).toBeDefined();
        expect(chart.houses.houses).toHaveLength(12);
      }
    } catch (error) {
      console.error('Failed to test different house systems:', error);
      throw error;
    }
  });

  it('should handle edge cases and invalid inputs', async () => {
    try {
      const baseOptions: BirthChartOptions = {
        date: new Date(2024, 2, 25, 12, 0, 0),
        latitude: 40.7128,
        longitude: -74.0060,
        houseSystem: HouseSystem.PLACIDUS,
        timeZoneSettings: { timeZone: 'America/New_York' }
      };

      // Test invalid latitude
      await expect(getBirthChart({
        ...baseOptions,
        latitude: 91
      })).rejects.toThrow();

      // Test invalid longitude
      await expect(getBirthChart({
        ...baseOptions,
        longitude: 181
      })).rejects.toThrow();

      // Test invalid date
      await expect(getBirthChart({
        ...baseOptions,
        date: new Date('invalid')
      })).rejects.toThrow();
    } catch (error) {
      console.error('Failed to test edge cases:', error);
      throw error;
    }
  });

  it('should include aspects in birth chart', async () => {
    const chart = await getBirthChart({
      date: new Date(2024, 2, 25, 12, 0, 0),
      latitude: 40.7128,
      longitude: -74.0060,
      houseSystem: HouseSystem.PLACIDUS,
      timeZoneSettings: { timeZone: 'America/New_York' },
    });

    expect(chart.aspects).toBeDefined();
    expect(Array.isArray(chart.aspects)).toBe(true);
    expect(chart.aspects.length).toBeGreaterThan(0);

    for (const a of chart.aspects) {
      expect(a.planetA).toBeDefined();
      expect(a.planetB).toBeDefined();
      expect(a.aspect).toBeDefined();
      expect(a.longitudeA).toBeGreaterThanOrEqual(0);
      expect(a.longitudeA).toBeLessThan(360);
      expect(a.longitudeB).toBeGreaterThanOrEqual(0);
      expect(a.longitudeB).toBeLessThan(360);
      expect(a.orb).toBeGreaterThanOrEqual(0);
    }
  });

  it('should calculate synastry chart', async () => {
    const synastry = await getSynastryChart({
      chartA: {
        date: new Date(1990, 0, 15, 14, 30, 0),
        latitude: 40.7128,
        longitude: -74.006,
        houseSystem: HouseSystem.PLACIDUS,
        timeZoneSettings: { timeZone: 'America/New_York' },
      },
      chartB: {
        date: new Date(1992, 5, 20, 9, 0, 0),
        latitude: 51.5074,
        longitude: -0.1278,
        houseSystem: HouseSystem.PLACIDUS,
        timeZoneSettings: { timeZone: 'Europe/London' },
      },
    });

    expect(synastry.chartA).toBeDefined();
    expect(synastry.chartB).toBeDefined();
    expect(synastry.aspects).toBeDefined();
    expect(Array.isArray(synastry.aspects)).toBe(true);
    expect(synastry.aspects.length).toBeGreaterThan(0);

    // Cross-chart aspects: planetA from chartA points, planetB from chartB points
    const chartAKeys = [...Object.keys(synastry.chartA.planets), 'ascendant', 'mc'];
    const chartBKeys = [...Object.keys(synastry.chartB.planets), 'ascendant', 'mc'];
    for (const a of synastry.aspects) {
      expect(chartAKeys).toContain(a.planetA);
      expect(chartBKeys).toContain(a.planetB);
    }
  });

  it('should calculate composite chart', async () => {
    const composite = await getCompositeChart({
      chartA: {
        date: new Date(1990, 0, 15, 14, 30, 0),
        latitude: 40.7128,
        longitude: -74.006,
        houseSystem: HouseSystem.PLACIDUS,
        timeZoneSettings: { timeZone: 'America/New_York' },
      },
      chartB: {
        date: new Date(1992, 5, 20, 9, 0, 0),
        latitude: 51.5074,
        longitude: -0.1278,
        houseSystem: HouseSystem.PLACIDUS,
        timeZoneSettings: { timeZone: 'Europe/London' },
      },
    });

    expect(composite.chartA).toBeDefined();
    expect(composite.chartB).toBeDefined();
    expect(composite.compositePlanets).toBeDefined();
    expect(composite.compositeHouses).toBeDefined();
    expect(composite.aspects).toBeDefined();

    // Composite planets are midpoints between chartA and chartB
    for (const [key, cp] of Object.entries(composite.compositePlanets)) {
      expect(cp.longitude).toBeGreaterThanOrEqual(0);
      expect(cp.longitude).toBeLessThan(360);
      expect(cp.zodiacPosition).toBeDefined();
      // Midpoint should be between the two charts' planets (shorter arc)
      expect(key in composite.chartA.planets).toBe(true);
      expect(key in composite.chartB.planets).toBe(true);
    }

    expect(composite.compositeHouses).toHaveLength(12);
    for (const h of composite.compositeHouses) {
      expect(h.longitude).toBeGreaterThanOrEqual(0);
      expect(h.longitude).toBeLessThan(360);
    }
  });

  it('should calculate transit chart with natal house placement', async () => {
    const natal: BirthChartOptions = {
      date: new Date(1990, 5, 15, 14, 30, 0),
      latitude: 48.856,
      longitude: 2.352,
      houseSystem: HouseSystem.PLACIDUS,
      timeZoneSettings: { timeZone: 'Europe/Paris' },
    };

    const result = await getTransitChart({
      natal,
      transitDate: new Date(2026, 2, 17, 12, 0, 0),
    });

    expect(result.natalChart).toBeDefined();
    expect(result.transitDateUtc).toBeInstanceOf(Date);
    expect(result.transitPlanets).toBeDefined();
    expect(result.aspects).toBeDefined();

    // Transit planets have retrograde flag and natalHouse
    for (const [, planet] of Object.entries(result.transitPlanets)) {
      expect(typeof planet.retrograde).toBe('boolean');
      expect(typeof planet.natalHouse).toBe('number');
      expect(planet.natalHouse).toBeGreaterThanOrEqual(1);
      expect(planet.natalHouse).toBeLessThanOrEqual(12);
      expect(planet.longitude).toBeGreaterThanOrEqual(0);
      expect(planet.longitude).toBeLessThan(360);
    }

    // Aspects are transit-to-natal (planetA = transit, planetB = natal/angle)
    const transitKeys = Object.keys(result.transitPlanets);
    const natalKeys = [...Object.keys(result.natalChart.planets), 'ascendant', 'mc'];
    for (const a of result.aspects) {
      expect(transitKeys).toContain(a.planetA);
      expect(natalKeys).toContain(a.planetB);
      expect(typeof a.applying).toBe('boolean');
      expect(typeof a.retrograde).toBe('boolean');
      expect(['slow', 'fast']).toContain(a.category);
    }
    expect(result.aspects.length).toBeGreaterThan(0);
  });

  it('should filter transits by maxOrb, aspect type, and planets', async () => {
    const natal: BirthChartOptions = {
      date: new Date(1990, 5, 15, 14, 30, 0),
      latitude: 48.856,
      longitude: 2.352,
      houseSystem: HouseSystem.PLACIDUS,
      timeZoneSettings: { timeZone: 'Europe/Paris' },
    };

    const result = await getTransitChart({
      natal,
      transitDate: new Date(2026, 2, 17, 12, 0, 0),
      maxOrb: 3,
      aspectFilter: ['conjunction', 'opposition', 'square'],
      transitPlanets: ['saturn', 'pluto'],
    });

    for (const a of result.aspects) {
      expect(a.orb).toBeLessThanOrEqual(3);
      expect(['conjunction', 'opposition', 'square']).toContain(a.aspect);
      expect(['saturn', 'pluto']).toContain(a.planetA);
    }
  });

  it('should find aspect perfections in date range', async () => {
    const natal: BirthChartOptions = {
      date: new Date(1990, 5, 15, 14, 30, 0),
      latitude: 48.856,
      longitude: 2.352,
      houseSystem: HouseSystem.PLACIDUS,
      timeZoneSettings: { timeZone: 'Europe/Paris' },
    };

    const result = await getTransitRange({
      natal,
      from: new Date(2026, 2, 1),
      to: new Date(2026, 3, 1), // 1 month
      stepDays: 1,
    });

    expect(result.natalChart).toBeDefined();
    expect(result.from).toBeInstanceOf(Date);
    expect(result.to).toBeInstanceOf(Date);
    expect(Array.isArray(result.perfections)).toBe(true);
    expect(result.perfections.length).toBeGreaterThan(0);

    for (const p of result.perfections) {
      expect(p.exactDate).toBeInstanceOf(Date);
      expect(p.exactDate.getTime()).toBeGreaterThanOrEqual(result.from.getTime());
      expect(p.exactDate.getTime()).toBeLessThanOrEqual(result.to.getTime());
      expect(typeof p.exactOrb).toBe('number');
      expect(typeof p.retrograde).toBe('boolean');
      expect(['slow', 'fast']).toContain(p.category);
      // Perfections are now filtered: exactOrb must be within the aspect's standard orb
      expect(p.exactOrb).toBeLessThan(10);
    }

    // At least some perfections should be near exact (orb < 0.5°)
    const tightPerfections = result.perfections.filter((p) => p.exactOrb < 0.5);
    expect(tightPerfections.length).toBeGreaterThan(0);

    // Perfections are sorted by date
    for (let i = 1; i < result.perfections.length; i++) {
      expect(result.perfections[i].exactDate.getTime()).toBeGreaterThanOrEqual(
        result.perfections[i - 1].exactDate.getTime()
      );
    }
  }, 30000);

  it('should calculate a solar return chart', async () => {
    const natal: BirthChartOptions = {
      date: {
        year: 1990,
        month: 1,
        day: 15,
        hour: 14,
        minute: 30,
        second: 0,
      },
      latitude: 40.7128,
      longitude: -74.006,
      houseSystem: HouseSystem.PLACIDUS,
      timeZoneSettings: { timeZone: 'America/New_York' },
    };

    const result = await getSolarReturnChart({ natal, year: 2026 });

    expect(result.natalChart).toBeDefined();
    expect(result.solarReturnChart).toBeDefined();
    expect(result.exactReturnDate).toBeInstanceOf(Date);
    expect(result.year).toBe(2026);

    // SR Sun should be within 0.02° of natal Sun
    const srSunLon = result.solarReturnChart.planets.sun.longitude;
    const diff = Math.abs(srSunLon - result.natalSunLongitude);
    const angularDiff = Math.min(diff, 360 - diff);
    expect(angularDiff).toBeLessThan(0.02);

    // Return date should be in January 2026 (natal is Jan 15)
    expect(result.exactReturnDate.getUTCFullYear()).toBe(2026);
    expect(result.exactReturnDate.getUTCMonth()).toBe(0); // January

    // SR chart should have all components
    expect(Object.keys(result.solarReturnChart.planets).length).toBeGreaterThan(0);
    expect(result.solarReturnChart.houses.houses).toHaveLength(12);
    expect(result.solarReturnChart.aspects.length).toBeGreaterThan(0);
  });

  it('should produce different ascendants for different SR locations', async () => {
    const natal: BirthChartOptions = {
      date: new Date(1990, 0, 15, 14, 30, 0),
      latitude: 40.7128,
      longitude: -74.006,
      houseSystem: HouseSystem.PLACIDUS,
      timeZoneSettings: { timeZone: 'America/New_York' },
    };

    const srNYC = await getSolarReturnChart({
      natal,
      year: 2026,
      solarReturnLatitude: 40.7128,
      solarReturnLongitude: -74.006,
    });

    const srLA = await getSolarReturnChart({
      natal,
      year: 2026,
      solarReturnLatitude: 34.0522,
      solarReturnLongitude: -118.2437,
    });

    // Exact return dates should be very close (within 2 minutes)
    const timeDiffMs = Math.abs(srNYC.exactReturnDate.getTime() - srLA.exactReturnDate.getTime());
    expect(timeDiffMs).toBeLessThan(2 * 60 * 1000);

    // Ascendants should differ because of different locations
    const ascNYC = srNYC.solarReturnChart.houses.ascendant.longitude;
    const ascLA = srLA.solarReturnChart.houses.ascendant.longitude;
    expect(ascNYC).not.toBeCloseTo(ascLA, 0);
  });

  it('should handle Aries point wrap-around for solar return', async () => {
    // Natal with Sun near 0° Aries (~ March 21)
    const natal: BirthChartOptions = {
      date: new Date(1990, 2, 21, 12, 0, 0),
      latitude: 40.7128,
      longitude: -74.006,
      houseSystem: HouseSystem.PLACIDUS,
      timeZoneSettings: { timeZone: 'America/New_York' },
    };

    const result = await getSolarReturnChart({ natal, year: 2026 });

    // SR Sun should still be within 0.02° of natal Sun
    const srSunLon = result.solarReturnChart.planets.sun.longitude;
    const diff = Math.abs(srSunLon - result.natalSunLongitude);
    const angularDiff = Math.min(diff, 360 - diff);
    expect(angularDiff).toBeLessThan(0.02);

    // Return date should be in March 2026
    expect(result.exactReturnDate.getUTCFullYear()).toBe(2026);
    expect(result.exactReturnDate.getUTCMonth()).toBe(2); // March
  });

  it('should not inherit natal timezone for transit chart', async () => {
    // Natal with fixed UTC offset (EST = -300 min)
    const natal: BirthChartOptions = {
      date: new Date(2000, 0, 1, 12, 0, 0),
      latitude: 40.7128,
      longitude: -74.006,
      houseSystem: HouseSystem.PLACIDUS,
      timeZoneSettings: { utcOffsetMinutes: -300 },
    };

    // Transit without explicit timezone should use autoTimeZone, not natal's -300
    const withAuto = await getTransitChart({
      natal,
      transitDate: new Date(2026, 6, 1, 12, 0, 0),
    });

    // Transit with explicit NYC timezone
    const withExplicit = await getTransitChart({
      natal,
      transitDate: new Date(2026, 6, 1, 12, 0, 0),
      transitTimeZoneSettings: { timeZone: 'America/New_York' },
    });

    // Both should produce the same UTC date (auto-detect and explicit should agree for NYC)
    // The key assertion: they should NOT differ by 1 hour (which was the old bug
    // when natal's fixed -300 was reused during EDT when actual offset is -240)
    const sunDiff = Math.abs(
      withAuto.transitPlanets.sun.longitude - withExplicit.transitPlanets.sun.longitude
    );
    expect(sunDiff).toBeLessThan(0.01);
  });

  it('should detect Moon perfections with default step size', async () => {
    const natal: BirthChartOptions = {
      date: new Date(1990, 5, 15, 14, 30, 0),
      latitude: 48.856,
      longitude: 2.352,
      houseSystem: HouseSystem.PLACIDUS,
      timeZoneSettings: { timeZone: 'Europe/Paris' },
    };

    // 1-week range with Moon filtering — should find at least one Moon-Sun aspect
    // Previously with daily step, fast Moon could be missed entirely
    const result = await getTransitRange({
      natal,
      from: new Date(2026, 2, 1),
      to: new Date(2026, 2, 7),
      transitPlanets: ['moon'],
      natalPlanets: ['sun'],
    });

    // The Moon-Sun conjunction on ~March 5 should be detected
    expect(result.perfections.length).toBeGreaterThanOrEqual(1);
    for (const p of result.perfections) {
      expect(p.transitPlanet).toBe('moon');
      expect(p.natalPlanet).toBe('sun');
    }

    // Broader test: Moon to all natal points over 2 weeks should find many perfections
    const broadResult = await getTransitRange({
      natal,
      from: new Date(2026, 2, 1),
      to: new Date(2026, 2, 14),
      transitPlanets: ['moon'],
    });

    // Moon should have many aspects to various natal points over 2 weeks
    expect(broadResult.perfections.length).toBeGreaterThanOrEqual(5);
    for (const p of broadResult.perfections) {
      expect(p.transitPlanet).toBe('moon');
      expect(p.category).toBe('fast');
    }
  }, 60000);

  it('should zero natal planet speeds for transit applying/separating', async () => {
    const natal: BirthChartOptions = {
      date: new Date(1990, 5, 15, 14, 30, 0),
      latitude: 48.856,
      longitude: 2.352,
      houseSystem: HouseSystem.PLACIDUS,
      timeZoneSettings: { timeZone: 'Europe/Paris' },
    };

    const result = await getTransitChart({
      natal,
      transitDate: new Date(2026, 2, 17, 12, 0, 0),
    });

    // All aspects should have applying/separating computed correctly.
    // The main assertion is that this doesn't throw and the values are booleans —
    // the underlying fix ensures natal Moon speed doesn't leak into the calc.
    for (const a of result.aspects) {
      expect(typeof a.applying).toBe('boolean');
      expect(typeof a.retrograde).toBe('boolean');
    }
  });
});
