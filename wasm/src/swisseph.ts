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
  SweSetSidMode,
  SweSetTopo,
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
  LILITH_MEAN = 12,
  LILITH_TRUE = 13,
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
  JPL_EPH = 1,
  SWISS_EPH = 2,
  MOSHIER = 4,
  HELIOCENTRIC = 8,
  TRUE_POS = 16,
  J2000 = 32,
  NONUT = 64,
  SPEED3 = 128,
  SPEED = 256,
  EQUATORIAL = 2048,
  TOPOCTR = 32768,
  SIDEREAL = 65536,
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
  // extras of ASCMC (useful for Vertex etc.)
  ascmc?: {
    armc: number;
    vertex: number;
    equasc: number;
    coasc1: number;
    coasc2: number;
    polasc: number;
  };
}

// Offset for asteroids (MPC)
export const SE_AST_OFFSET = 10000;

export const BODY = {
  MEAN_APOGEE: 12,    // Lilith mean
  OSC_APOGEE: 13,     // Lilith true
  PHOLUS: 16,
  CERES: 17,
  PALLAS: 18,
  JUNO: 19,
  VESTA: 20,
} as const;

export const normalizeAngle = (deg: number) => ((deg % 360) + 360) % 360;

// Swiss Ephemeris class
export class SwissEph {
  private module: SwissEphModule;
  private swe_julday: SweJulDay | null = null;
  private swe_calc_ut: SweCalcUt | null = null;
  private swe_houses: SweHouses | null = null;
  private swe_house_pos: SweHousePos | null = null;
  private swe_set_ephe_path: SweSetEphePath | null = null;
  private swe_close: SweClose | null = null;
  private swe_set_topo: SweSetTopo | null = null;
  private swe_set_sid_mode: SweSetSidMode | null = null;
  
  /**
   * Constructor that accepts a pre-initialized Swiss Ephemeris module
   */
  constructor(module: SwissEphModule) {
    this.module = module;

    // Create wrapped functions with specific types
    this.swe_julday = this.module.cwrap<SweJulDay>('swe_julday', 'number', ['number', 'number', 'number', 'number', 'number']);
    this.swe_calc_ut = this.module.cwrap<SweCalcUt>('swe_calc_ut', 'number', ['number', 'number', 'number', 'number']);
    this.swe_houses = this.module.cwrap<SweHouses>('swe_houses', 'number', ['number', 'number', 'number', 'number', 'number', 'number']);
    this.swe_house_pos = this.module.cwrap<SweHousePos>('swe_house_pos', 'number', ['number', 'number', 'number', 'string', 'number', 'number']);
    this.swe_set_ephe_path = this.module.cwrap<SweSetEphePath>('swe_set_ephe_path', null, ['number']);
    this.swe_close = this.module.cwrap<SweClose>('swe_close', null, []);
    this.swe_set_topo = this.module.cwrap<SweSetTopo>('swe_set_topo', null, ['number', 'number', 'number']);
    this.swe_set_sid_mode = this.module.cwrap<SweSetSidMode>('swe_set_sid_mode', null, ['number', 'number', 'number']);
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
  calculatePlanetPosition(julday: number, planet: Planet | number, flags = CalcFlag.SWISS_EPH): PlanetPosition {
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
    
    // Swiss Ephemeris: cusps[0..12] (0 not used), ascmc[0..9]
    const HOUSES_DOUBLES = 13;
    const ASCMC_DOUBLES  = 10;
    const BYTES_PER_F64  = 8;
    
    // Create a single contiguous memory block for both houses and ascmc
    const totalBytes = (HOUSES_DOUBLES + ASCMC_DOUBLES) * BYTES_PER_F64;
    const memoryPtr  = this.module._malloc(totalBytes);

    if (!memoryPtr) throw new Error('Memory allocation failed');
  
    const housesPtr = memoryPtr;                                  // 13 * f64
    const ascmcPtr  = memoryPtr + (HOUSES_DOUBLES * BYTES_PER_F64); // 10 * f64
    
    try {
      // Calculate houses
      // passar código do caractere (ex.: 'P' -> 80)
      const hsysCode = hsys.charCodeAt(0);
      const ret = this.swe_houses(julday, latitude, longitude, hsysCode, housesPtr, ascmcPtr);
      
      if (ret < 0) {
        throw new Error(`Houses calculation failed with error code ${ret}`);
      }
      
      // Extract all data before any memory operations
      const houses: number[] = new Array(HOUSES_DOUBLES);
      for (let i = 0; i < HOUSES_DOUBLES; i++) {
        houses[i] = this.module.getValue(housesPtr + i * BYTES_PER_F64, 'double');
      }
      
      const ascendant = this.module.getValue(ascmcPtr + 0 * BYTES_PER_F64, 'double'); // 0
      const mc        = this.module.getValue(ascmcPtr + 1 * BYTES_PER_F64, 'double'); // 1
      const armc      = this.module.getValue(ascmcPtr + 2 * BYTES_PER_F64, 'double'); // 2
      const vertex    = this.module.getValue(ascmcPtr + 3 * BYTES_PER_F64, 'double'); // 3
      const equasc    = this.module.getValue(ascmcPtr + 4 * BYTES_PER_F64, 'double'); // 4
      const coasc1    = this.module.getValue(ascmcPtr + 5 * BYTES_PER_F64, 'double'); // 5
      const coasc2    = this.module.getValue(ascmcPtr + 6 * BYTES_PER_F64, 'double'); // 6
      const polasc    = this.module.getValue(ascmcPtr + 7 * BYTES_PER_F64, 'double'); // 7
      
      return { 
        ascendant,
        mc,
        houses,
        ascmc: {
          armc,
          vertex,
          equasc,
          coasc1,
          coasc2,
          polasc
        }
      };
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

  /**
   * Set topocentric observer
   */
  setTopocentric(longitude: number, latitude: number, altitudeMeters = 0): void {
    this.checkInitialized();

    if (!this.swe_set_topo) {
      throw new Error('Topocentric calculation function not available');
    }

    this.swe_set_topo(longitude, latitude, altitudeMeters);
  }

  /**
   * Set sidereal mode 
   * Ex.: mode=1 (Lahiri). See Swiss Ephemeris mode table.
   */
  setSiderealMode(mode: number, t0 = 0, ayan_t0 = 0): void {
    this.checkInitialized();
    this.swe_set_sid_mode?.(mode, t0, ayan_t0);
  }

  /**
   * Asteroid by MPC number
   */
  calculateAsteroidPosition(julday: number, mpcNumber: number, flags = CalcFlag.SWISS_EPH): PlanetPosition {
    return this.calculatePlanetPosition(julday, SE_AST_OFFSET + mpcNumber, flags);
  }

  /**
   * Lilith mean (12) and true (13)
   */
  calculateLilith(julday: number, kind: 'mean' | 'true' = 'mean', flags = CalcFlag.SWISS_EPH): PlanetPosition {
    const id = kind === 'mean' ? BODY.MEAN_APOGEE : BODY.OSC_APOGEE;
    return this.calculatePlanetPosition(julday, id, flags);
  }
} 

/**
 * Fortune part (in ecliptic longitude)
*/
export function parsFortunae(asc: number, sunLon: number, moonLon: number, diurnal: boolean): number {
  const val = diurnal ? (asc + moonLon - sunLon) : (asc + sunLon - moonLon);
  return normalizeAngle(val);
}