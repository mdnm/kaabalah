/**
 * Integration with the Swiss Ephemeris WebAssembly module
 */
import wasmPathNode from "../../wasm/build/swisseph.node.wasm?url";
import wasmPathWeb from "../../wasm/build/swisseph.web.wasm?url";
import type { SwissEphModuleFactory } from "../../wasm/src/types";

// Note: In the production code, you'll need to include the compiled WASM files
// and update the import path. This is a placeholder that would work once the
// compilation is complete.

// Import from the actual WASM wrapper
import {
  CalcFlag,
  Houses,
  HouseSystem,
  normalizeAngle,
  parsFortunae,
  Planet,
  PLANET_AND_NODE_NAMES,
  PlanetPosition,
  SwissEph,
  VirtualNodes,
} from "../../wasm/src/swisseph";

// We'll use this singleton pattern to manage the Swiss Ephemeris instance
let swissEph: SwissEph | null = null;

const DEFAULT_FLAGS = CalcFlag.SWISS_EPH | CalcFlag.SPEED;

/**
 * Initializes and returns the Swiss Ephemeris instance.
 * In a browser environment, assets are loaded relative to the script.
 * In Node.js, assets are loaded from the package's 'dist' directory.
 * @param options - Optional overrides for asset paths.
 * @param options.ephePath - Path to the directory containing ephemeris data files.
 * @param options.wasmPath - Path to the `swisseph.wasm` file.
 */
export async function getSwissEph(
  options: { ephePath?: string; wasmPath?: string } = {}
): Promise<void> {
  if (swissEph) {
    return;
  }

  try {
    const isBrowser = typeof window !== "undefined";
    // Select proper build per environment
    const wasmUrl = isBrowser ? wasmPathWeb : wasmPathNode;
    const finalWasmPath =
      options.wasmPath ||
      (isBrowser ? wasmUrl : require("path").resolve(__dirname, wasmUrl));

    const moduleFactory: SwissEphModuleFactory = isBrowser
      ? (await import("../../wasm/build/swisseph.web.js")).default as unknown as SwissEphModuleFactory
      : (await import("../../wasm/build/swisseph.node.js")).default as unknown as SwissEphModuleFactory;

    const module = await moduleFactory({
      locateFile: () => finalWasmPath,
    });

    const instance = new SwissEph(module);

    // Default ephemeris path
    const defaultEphePath = isBrowser
      ? "../ephe"
      : require("path").resolve(__dirname, "../ephe");
    const finalEphePath = options.ephePath || defaultEphePath;

    if (isBrowser) {
      // In the browser, synchronously fetch and write ephemeris files into MEMFS
      const epheFsPath = "/ephe";
      try {
        (module as any).FS?.mkdir?.(epheFsPath);
      } catch {
        // ignore if exists
      }
      const files = ["seas_18.se1", "semo_18.se1", "sepl_18.se1"];
      await Promise.all(
        files.map(async (name) => {
          const url = `${finalEphePath}/${name}`;
          const res = await fetch(url);
          if (!res.ok) {
            throw new Error(`Failed to fetch ephemeris file: ${url}`);
          }
          const buf = await res.arrayBuffer();
          (module as any).FS?.writeFile?.(
            `${epheFsPath}/${name}`,
            new Uint8Array(buf)
          );
        })
      );
      console.info(`Setting ephemeris path to: ${epheFsPath}`);
      instance.setEphemerisPath(epheFsPath);
    } else {
      // In Node, prefer NODERAWFS host path; attempt NODEFS mount if available
      // Debug info
      console.info(
        "Emscripten FS availability:",
        Boolean((module as any).FS),
        "mount:",
        Boolean((module as any).FS?.mount),
        "NODEFS:",
        Boolean((module as any).FS?.filesystems?.NODEFS)
      );
      if (
        (module as any).FS?.mount &&
        (module as any).FS?.filesystems?.NODEFS
      ) {
        const mountPoint = "/ephefs";
        try {
          try {
            (module as any).FS.mkdir(mountPoint);
          } catch {
            // ignore exists
          }
          (module as any).FS.mount(
            (module as any).FS.filesystems.NODEFS,
            { root: finalEphePath },
            mountPoint
          );
          console.info(
            `Setting ephemeris path to: ${mountPoint} (mounted from ${finalEphePath})`
          );
          instance.setEphemerisPath(mountPoint);
        } catch (mountErr) {
          console.warn(
            `Failed to mount ephemeris directory, falling back to host path: ${finalEphePath}`,
            mountErr
          );
          console.info(`Setting ephemeris path to: ${finalEphePath}`);
          instance.setEphemerisPath(finalEphePath);
        }
      } else {
        console.info(`Setting ephemeris path to: ${finalEphePath}`);
        instance.setEphemerisPath(finalEphePath);
      }
    }

    swissEph = instance;
  } catch (error) {
    console.error("Error initializing Swiss Ephemeris:", error);
    throw error;
  }
}

/**
 * Calculate planetary positions for a given date
 */
export async function calculatePlanetaryPositions(
  date: Date
): Promise<Record<Planet, PlanetPosition>> {
  try {
    checkInitialization();

    const julday = swissEph!.getJulianDay(date);
    const flags = DEFAULT_FLAGS;
    const planets: Record<string, Planet> = {
      sun: Planet.SUN,
      moon: Planet.MOON,
      mercury: Planet.MERCURY,
      venus: Planet.VENUS,
      mars: Planet.MARS,
      jupiter: Planet.JUPITER,
      saturn: Planet.SATURN,
      uranus: Planet.URANUS,
      neptune: Planet.NEPTUNE,
      pluto: Planet.PLUTO,
      meanNode: Planet.MEAN_NODE,
      trueNode: Planet.TRUE_NODE,
      chiron: Planet.CHIRON,
      lilithMean: Planet.LILITH_MEAN,
      lilithTrue: Planet.LILITH_TRUE,
    };

    const positions: Record<Planet, PlanetPosition> = {} as Record<
      Planet,
      PlanetPosition
    >;
    for (const id of Object.values(planets)) {
      try {
        positions[id] = swissEph!.calculatePlanetPosition(julday, id, flags);
      } catch (error) {
        throw new Error(
          `Failed to calculate position for ${PLANET_AND_NODE_NAMES[id]}: ${error}`
        );
      }
    }

    return positions;
  } catch (error) {
    console.error("Error calculating planetary positions:", error);
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
    console.error("Error calculating houses:", error);
    throw error;
  }
}
/**
 * Calculate an asteroid by MPC number
 */
export async function calculateAsteroidPosition(
  date: Date,
  mpcNumber: number
): Promise<PlanetPosition> {
  try {
    checkInitialization();

    const julday = swissEph!.getJulianDay(date);
    return swissEph!.calculateAsteroidPosition(
      julday,
      mpcNumber,
      DEFAULT_FLAGS
    );
  } catch (error) {
    console.error("Error calculating asteroid:", error);
    throw error;
  }
}

/**
 * Fortune part utility (requires Asc, Sun, Moon and diurnal/nocturnal)
 * diurnal: Asc + Moon - Sun ; nocturnal: Asc + Sun - Moon
 */
export function calcParsFortunae(
  asc: number,
  sunLon: number,
  moonLon: number,
  isDiurnal: boolean
): number {
  return parsFortunae(asc, sunLon, moonLon, isDiurnal);
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
      console.error("Error closing Swiss Ephemeris:", error);
      throw error;
    }
  }
}

function checkInitialization(): void {
  if (!swissEph) {
    throw new Error(
      "Swiss Ephemeris not initialized. Call getSwissEph() first."
    );
  }
}

// Re-export types and enums for convenience
export {
  CalcFlag,
  HouseSystem,
  normalizeAngle,
  Planet,
  PLANET_AND_NODE_NAMES,
  PlanetPosition,
  VirtualNodes
};

