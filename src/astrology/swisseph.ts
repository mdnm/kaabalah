/**
 * Integration with the Swiss Ephemeris WebAssembly module
 */
import moduleFactory from '../../wasm/build/swisseph.js';
import wasmPath from '../../wasm/build/swisseph.wasm?url';
import type { SwissEphModuleFactory } from '../../wasm/src/types';

// Note: In the production code, you'll need to include the compiled WASM files
// and update the import path. This is a placeholder that would work once the
// compilation is complete.

// Import from the actual WASM wrapper
import { CalcFlag, Houses, HouseSystem, Planet, PlanetPosition, SwissEph } from '../../wasm/src/swisseph';

// We'll use this singleton pattern to manage the Swiss Ephemeris instance
let swissEph: SwissEph | null = null;

/**
 * Initializes and returns the Swiss Ephemeris instance.
 * In a browser environment, assets are loaded relative to the script.
 * In Node.js, assets are loaded from the package's 'dist' directory.
 * @param options - Optional overrides for asset paths.
 * @param options.ephePath - Path to the directory containing ephemeris data files.
 * @param options.wasmPath - Path to the `swisseph.wasm` file.
 */
export async function getSwissEph(options: { ephePath?: string; wasmPath?: string } = {}): Promise<void> {
  if (swissEph) {
    return;
  }

  try {
    const isBrowser = typeof window !== 'undefined';
    const finalWasmPath = options.wasmPath || (isBrowser ? wasmPath : require('path').resolve(__dirname, wasmPath));

    const module = await (moduleFactory as SwissEphModuleFactory)({
      locateFile: () => finalWasmPath,
    });

    const instance = new SwissEph(module);

    // Default path for ephemeris files is relative to the bundled JS file.
    // In `dist`, `astrology/index.js` needs to go up one level to find `ephe/`.
    const defaultEphePath = isBrowser ? '../ephe' : require('path').resolve(__dirname, '../ephe');
    const finalEphePath = options.ephePath || defaultEphePath;
    instance.setEphemerisPath(finalEphePath);

    swissEph = instance;
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

