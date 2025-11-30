import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { HouseSystem, Planet } from '../../wasm/src/swisseph';
import { calcParsFortunae, calculateHouses, calculatePlanetaryPositions, closeSwissEph, getSwissEph } from './swisseph';

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
      
      const houses = await calculateHouses(date, latitude, longitude, HouseSystem.PLACIDUS);

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
        const houses = await calculateHouses(date, lat, lon, HouseSystem.PLACIDUS);
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
}); 