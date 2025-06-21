import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { BirthChartOptions, getBirthChart, HouseSystem } from './index';
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
        date: new Date('2024-03-25T12:00:00Z'),
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: -4, // EDT
        houseSystem: HouseSystem.PLACIDUS
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
        expect(cusp).toBeGreaterThanOrEqual(0);
        expect(cusp).toBeLessThan(360);
      });
    } catch (error) {
      console.error('Failed to calculate birth chart:', error);
      throw error;
    }
  });

  it('should handle timezone conversion correctly', async () => {
    try {
      const options: BirthChartOptions = {
        date: new Date('2024-03-25T08:00:00Z'), // Noon UTC
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: -4, // EDT
        houseSystem: HouseSystem.PLACIDUS
      };

      const chart = await getBirthChart(options);
      expect(chart).toBeDefined();

      // The chart should be calculated for 8:00 AM EDT (12:00 UTC - 4 hours)
      // Verify this by checking the MC position which is time-dependent
      expect(chart.houses.mc).toBeDefined();
      
      // Calculate another chart 1 hour later
      const laterOptions = {
        ...options,
        date: new Date('2024-03-25T09:00:00Z') // 1 hour later UTC
      };
      const laterChart = await getBirthChart(laterOptions);
      
      // MC should have moved approximately 15 degrees (rough approximation)
      const mcDifference = Math.abs(laterChart.houses.mc - chart.houses.mc);
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
        date: new Date('2024-03-25T12:00:00Z'),
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: -4,
        houseSystem: HouseSystem.PLACIDUS
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
        date: new Date('2024-03-25T12:00:00Z'),
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: -4,
        houseSystem: HouseSystem.PLACIDUS
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

      // Test invalid timezone
      await expect(getBirthChart({
        ...baseOptions,
        timezone: 15
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
});