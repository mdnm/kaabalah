/**
 * TypeScript wrapper for Swiss Ephemeris WebAssembly module
 */

import type {
  SweCalcUt,
  SweClose,
  SweHousePos,
  SweHouses,
  SweJulDay,
  SweSetEphePath,
  SwissEphModule
} from './types';

// Exported planet constants
export enum Planet {
  SUN = 0,
  MOON = 1,
  MERCURY = 2,
  VENUS = 3,
  MARS = 4,
  JUPITER = 5,
  SATURN = 6,
  URANUS = 7,
  NEPTUNE = 8,
  PLUTO = 9,
  MEAN_NODE = 10,
  TRUE_NODE = 11,
  CHIRON = 15
}

// House systems
export enum HouseSystem {
  PLACIDUS = 'P',
  KOCH = 'K',
  PORPHYRIUS = 'O',
  REGIOMONTANUS = 'R',
  CAMPANUS = 'C',
  EQUAL = 'E',
  WHOLE_SIGN = 'W',
  MERIDIAN = 'X',
  MORINUS = 'M',
  KRUSINSKI = 'U',
  ALCABITIUS = 'B'
}

// Calculation flag constants
export enum CalcFlag {
  SWISS_EPH = 2,
  MOSHIER = 4,
  HELIOCENTRIC = 8,
  TRUE_POS = 16,
  SPEED = 32
}

// Planet position result
export interface PlanetPosition {
  longitude: number;
  latitude: number;
  distance: number;
  longitudeSpeed?: number;
  latitudeSpeed?: number;
  distanceSpeed?: number;
}

// Houses calculation result
export interface Houses {
  ascendant: number;
  mc: number;
  houses: number[];
}

// Swiss Ephemeris class
export class SwissEph {
  private module: SwissEphModule;
  private swe_julday: SweJulDay | null = null;
  private swe_calc_ut: SweCalcUt | null = null;
  private swe_houses: SweHouses | null = null;
  private swe_house_pos: SweHousePos | null = null;
  private swe_set_ephe_path: SweSetEphePath | null = null;
  private swe_close: SweClose | null = null;
  
  /**
   * Constructor that accepts a pre-initialized Swiss Ephemeris module
   */
  constructor(module: SwissEphModule) {
    this.module = module;

    // Create wrapped functions with specific types
    this.swe_julday = this.module.cwrap<SweJulDay>('swe_julday', 'number', ['number', 'number', 'number', 'number', 'number']);
    this.swe_calc_ut = this.module.cwrap<SweCalcUt>('swe_calc_ut', 'number', ['number', 'number', 'number', 'number']);
    this.swe_houses = this.module.cwrap<SweHouses>('swe_houses', 'number', ['number', 'number', 'number', 'string', 'number', 'number']);
    this.swe_house_pos = this.module.cwrap<SweHousePos>('swe_house_pos', 'number', ['number', 'number', 'number', 'string', 'number', 'number']);
    this.swe_set_ephe_path = this.module.cwrap<SweSetEphePath>('swe_set_ephe_path', null, ['number']);
    this.swe_close = this.module.cwrap<SweClose>('swe_close', null, []);
  }
  
  private checkInitialized(): void {
    if (!this.module) {
      throw new Error('Swiss Ephemeris module not available.');
    }
  }

  /**
   * Sets the path to the ephemeris data files.
   * @param path - The path to the directory containing ephemeris files.
   */
  setEphemerisPath(path: string): void {
    this.checkInitialized();
    if (path && this.swe_set_ephe_path) {
      const pathPtr = this.module._malloc(path.length + 1);
      if (!pathPtr) {
        throw new Error('Failed to allocate memory for ephemeris path');
      }
      this.module.stringToUTF8(path, pathPtr, path.length + 1);
      this.swe_set_ephe_path(pathPtr);
      this.module._free(pathPtr);
    }
  }
  
  /**
   * Calculate Julian day number for a given date and time
   */
  getJulianDay(date: Date): number {
    this.checkInitialized();
    if (!this.swe_julday) {
      throw new Error('Julian day calculation function not available');
    }
    
    // Get UTC components
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1; // JavaScript months are 0-based
    const day = date.getUTCDate();
    const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
    
    // Use Gregorian calendar (flag = 1)
    return this.swe_julday(year, month, day, hour, 1);
  }
  
  /**
   * Calculate planet position at a given Julian day
   */
  calculatePlanetPosition(julday: number, planet: Planet, flags = CalcFlag.SWISS_EPH): PlanetPosition {
    this.checkInitialized();
    if (!this.swe_calc_ut || !this.module) {
      throw new Error('Planet calculation function not available');
    }
    
    const resultPtr = this.module._malloc(6 * 8);
    if (!resultPtr) {
      throw new Error('Failed to allocate memory for planet position');
    }
    
    try {
      const ret = this.swe_calc_ut(julday, planet, flags, resultPtr);
      
      if (ret < 0) {
        throw new Error(`Swiss Ephemeris calculation failed with error code ${ret}`);
      }
      
      const position: PlanetPosition = {
        longitude: this.module.getValue(resultPtr, 'double'),
        latitude: this.module.getValue(resultPtr + 8, 'double'),
        distance: this.module.getValue(resultPtr + 16, 'double')
      };
      
      if (flags & CalcFlag.SPEED) {
        position.longitudeSpeed = this.module.getValue(resultPtr + 24, 'double');
        position.latitudeSpeed = this.module.getValue(resultPtr + 32, 'double');
        position.distanceSpeed = this.module.getValue(resultPtr + 40, 'double');
      }
      
      return position;
    } finally {
      this.module._free(resultPtr);
    }
  }
  
  /**
   * Calculate houses for a given date, location, and house system
   */
  calculateHouses(julday: number, latitude: number, longitude: number, hsys: HouseSystem = HouseSystem.PLACIDUS): Houses {
    this.checkInitialized();
    if (!this.swe_houses || !this.module) {
      throw new Error('Houses calculation function not available');
    }
    
    // Validate input parameters
    if (latitude < -90 || latitude > 90) {
      throw new Error('Latitude must be between -90 and 90 degrees');
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error('Longitude must be between -180 and 180 degrees');
    }
    
    // Create a single contiguous memory block for both houses and ascmc
    const totalBytes = (12 + 10) * 8; // 12 houses + 10 ascmc values, each 8 bytes (double)
    const memoryPtr = this.module._malloc(totalBytes);
    
    if (!memoryPtr) {
      throw new Error('Memory allocation failed');
    }
    
    // Calculate offsets
    const housesPtr = memoryPtr;
    const ascmcPtr = memoryPtr + (12 * 8);
    
    try {
      // Calculate houses
      const ret = this.swe_houses(julday, latitude, longitude, hsys.toString(), housesPtr, ascmcPtr);
      
      if (ret < 0) {
        throw new Error(`Houses calculation failed with error code ${ret}`);
      }
      
      // Extract all data before any memory operations
      const houses: number[] = [];
      for (let i = 0; i < 12; i++) {
        const value = this.module.getValue(housesPtr + i * 8, 'double');
        houses.push(value);
      }
      
      const ascendant = this.module.getValue(ascmcPtr, 'double');
      const mc = this.module.getValue(ascmcPtr + 8, 'double');
      
      return { ascendant, mc, houses };
    } finally {
      // Always free memory
      this.module._free(memoryPtr);
    }
  }
  
  /**
   * Clean up and close the Swiss Ephemeris
   */
  close(): void {
    this.checkInitialized();
    if (this.swe_close) {
      this.swe_close();
    }
  }
} 