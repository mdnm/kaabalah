/**
 * Integration with the Swiss Ephemeris WebAssembly module
 */

// Note: In the production code, you'll need to include the compiled WASM files
// and update the import path. This is a placeholder that would work once the
// compilation is complete.

// Import from the actual WASM wrapper
import { CalcFlag, Houses, HouseSystem, Planet, PlanetPosition, SwissEph } from '../../wasm/src/swisseph';

// We'll use this singleton pattern to manage the Swiss Ephemeris instance
let swissEph: SwissEph | null = null;

/**
 * Get the Swiss Ephemeris instance, initializing it if needed
 */
export async function getSwissEph(ephePath?: string): Promise<void> {
  try {
    if (swissEph) {
      return;
    }

    swissEph = new SwissEph(ephePath || '');
    await swissEph.init();
  } catch (error) {
    console.error('Error initializing Swiss Ephemeris:', error);
    throw error;
  }
}

/**
 * Calculate planetary positions for a given date
 */
export async function calculatePlanetaryPositions(date: Date): Promise<Record<string, PlanetPosition>> {
  try {
    checkInitialization();

    const julday = swissEph!.getJulianDay(date);
    const planets = {
      sun: Planet.SUN,
      moon: Planet.MOON,
      mercury: Planet.MERCURY,
      venus: Planet.VENUS,
      mars: Planet.MARS,
      jupiter: Planet.JUPITER,
      saturn: Planet.SATURN
    };

    const positions: Record<string, PlanetPosition> = {};
    for (const [name, id] of Object.entries(planets)) {
      try {
        positions[name] = swissEph!.calculatePlanetPosition(julday, id);
      } catch (error) {
        throw new Error(`Failed to calculate position for ${name}: ${error}`);
      }
    }

    return positions;
  } catch (error) {
    console.error('Error calculating planetary positions:', error);
    throw error;
  }
}

/**
 * Calculate houses for a given date and location
 */
export async function calculateHouses(
  date: Date,
  latitude: number,
  longitude: number,
  houseSystem: HouseSystem
): Promise<Houses> {
  try {
    checkInitialization();

    const julday = swissEph!.getJulianDay(date);
    return swissEph!.calculateHouses(julday, latitude, longitude, houseSystem);
  } catch (error) {
    console.error('Error calculating houses:', error);
    throw error;
  }
}

/**
 * Clean up Swiss Ephemeris resources
 */
export function closeSwissEph(): void {
  if (swissEph) {
    try {
      swissEph.close();
      swissEph = null;
    } catch (error) {
      console.error('Error closing Swiss Ephemeris:', error);
      throw error;
    }
  }
}

function checkInitialization(): void {
  if (!swissEph) {
    throw new Error('Swiss Ephemeris not initialized. Call getSwissEph() first.');
  }
}

// Re-export types and enums for convenience
export { CalcFlag, HouseSystem, Planet };

