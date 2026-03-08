import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { VirtualNodes } from '../../wasm/src/swisseph';
import { BirthChartOptions, getBirthChart, getCompositeChart, getSynastryChart, HouseSystem } from './index';
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
});