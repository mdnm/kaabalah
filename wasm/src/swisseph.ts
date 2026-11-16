/**
 * TypeScript wrapper for Swiss Ephemeris WebAssembly module
 */

import type {
  SweAzalt,
  SweCalcUt,
  SweClose,
  SweHousePos,
  SweHouses,
  SweJulDay,
  SweRiseTrans,
  SweSetEphePath,
  SweSetSidMode,
  SweSetTopo,
  SwissEphModule,
} from "./types";

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
  CHIRON = 15,
}

export enum VirtualNodes {
  PARS_FORTUNAE = "parsFortunae",
}

export const PLANET_AND_NODE_NAMES: Record<string, string> = {
  [Planet.SUN]: "Sun",
  [Planet.MOON]: "Moon",
  [Planet.MERCURY]: "Mercury",
  [Planet.VENUS]: "Venus",
  [Planet.MARS]: "Mars",
  [Planet.JUPITER]: "Jupiter",
  [Planet.SATURN]: "Saturn",
  [Planet.URANUS]: "Uranus",
  [Planet.NEPTUNE]: "Neptune",
  [Planet.PLUTO]: "Pluto",
  [Planet.MEAN_NODE]: "Mean Node",
  [Planet.TRUE_NODE]: "True Node",
  [Planet.LILITH_MEAN]: "Lilith Mean",
  [Planet.LILITH_TRUE]: "Lilith True",
  [Planet.CHIRON]: "Chiron",
  [VirtualNodes.PARS_FORTUNAE]: "Wheel of Fortune",
} as const;

// House systems
export enum HouseSystem {
  PLACIDUS = "P",
  KOCH = "K",
  PORPHYRIUS = "O",
  REGIOMONTANUS = "R",
  CAMPANUS = "C",
  EQUAL = "E",
  WHOLE_SIGN = "W",
  MERIDIAN = "X",
  MORINUS = "M",
  KRUSINSKI = "U",
  ALCABITIUS = "B",
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

// Rise/set/meridian transit flags for swe_rise_trans
export enum RiseTransitFlag {
  RISE = 1,
  SET = 2,
  UPPER_MERIDIAN = 4,
  LOWER_MERIDIAN = 8,
  DISC_CENTER = 256,
  NO_REFRACTION = 512,
}

// Azimuth/altitude result from swe_azalt
export interface AzaltResult {
  azimuth: number;
  trueAltitude: number;
  apparentAltitude: number;
}

// SE_ECL2HOR / SE_EQU2HOR constants for swe_azalt
export const SE_ECL2HOR = 0;
export const SE_EQU2HOR = 1;

// Planet position result
export interface PlanetPosition {
  longitude: number;
  latitude: number;
  distance: number;
  longitudeSpeed?: number;
  latitudeSpeed?: number;
  distanceSpeed?: number;
}

/**
 * Which ephemeris backend Swiss Ephemeris reports having used for a calculation.
 * Derived from the flag bits returned by `swe_calc_ut`:
 * SEFLG_JPLEPH = 1, SEFLG_SWIEPH = 2, SEFLG_MOSEPH = 4.
 */
export type SwissEphemerisKind = "swiss" | "moshier" | "jpl";

export const EPHEMERIS_FLAG_MASK =
  CalcFlag.JPL_EPH | CalcFlag.SWISS_EPH | CalcFlag.MOSHIER;

/** Derive the ephemeris label from a flags word; null when no ephemeris bit is set. */
export function ephemerisFromFlags(flags: number): SwissEphemerisKind | null {
  if (flags & CalcFlag.JPL_EPH) return "jpl";
  if (flags & CalcFlag.SWISS_EPH) return "swiss";
  if (flags & CalcFlag.MOSHIER) return "moshier";
  return null;
}

/** The ephemeris Swiss Ephemeris itself would pick for requested flags (default: Swiss files). */
export function requestedEphemerisFromFlags(flags: number): SwissEphemerisKind {
  return ephemerisFromFlags(flags) ?? "swiss";
}

export type SwissEphErrorCode =
  | "SWISSEPH_NOT_INITIALIZED"
  | "SWISSEPH_ASSET_NOT_FOUND"
  | "SWISSEPH_NODE_BUILTINS_UNAVAILABLE"
  | "SWISSEPH_EPHEMERIS_FILES_UNAVAILABLE"
  | "SWISSEPH_EPHEMERIS_FILE_UNAVAILABLE"
  | "SWISSEPH_DATE_OUT_OF_RANGE"
  | "SWISSEPH_EPHEMERIS_MISMATCH"
  | "SWISSEPH_CALCULATION_FAILED"
  | "SWISSEPH_HOUSES_UNAVAILABLE"
  | "SWISSEPH_STATE_MISUSE";

/** Typed error for every Swiss Ephemeris runtime failure; `code` is stable API. */
export class SwissEphError extends Error {
  readonly code: SwissEphErrorCode;
  readonly details: Record<string, unknown>;

  constructor(code: SwissEphErrorCode, message: string, details: Record<string, unknown> = {}) {
    super(message);
    this.name = "SwissEphError";
    this.code = code;
    this.details = details;
  }
}

/** Thrown in strict mode when the returned ephemeris differs from the requested one. */
export class SwissEphEphemerisMismatchError extends SwissEphError {
  readonly requestedEphemeris: SwissEphemerisKind;
  readonly returnedEphemeris: SwissEphemerisKind | null;
  readonly requestedFlags: number;
  readonly returnedFlags: number;
  readonly reason: "date_outside_installed_ephemeris_files" | "ephemeris_files_unavailable" | "unknown";
  readonly warning: string | null;

  constructor(info: {
    requestedEphemeris: SwissEphemerisKind;
    returnedEphemeris: SwissEphemerisKind | null;
    requestedFlags: number;
    returnedFlags: number;
    reason: "date_outside_installed_ephemeris_files" | "ephemeris_files_unavailable" | "unknown";
    warning: string | null;
    julianDay: number;
    missingFile: string | null;
  }) {
    super(
      "SWISSEPH_EPHEMERIS_MISMATCH",
      `Swiss Ephemeris returned "${info.returnedEphemeris ?? "unknown"}" output but "${info.requestedEphemeris}" was requested (strictEphemeris)` +
        `${info.missingFile ? `; missing file ${info.missingFile}` : ""}` +
        `${info.reason === "date_outside_installed_ephemeris_files" ? "; the date is outside the installed ephemeris file range" : ""}.` +
        `${info.warning ? ` Swiss Ephemeris said: ${info.warning.trim()}` : ""}`,
      {
        julianDay: info.julianDay,
        missingFile: info.missingFile,
        reason: info.reason,
      }
    );
    this.name = "SwissEphEphemerisMismatchError";
    this.requestedEphemeris = info.requestedEphemeris;
    this.returnedEphemeris = info.returnedEphemeris;
    this.requestedFlags = info.requestedFlags;
    this.returnedFlags = info.returnedFlags;
    this.reason = info.reason;
    this.warning = info.warning;
  }
}

/** A position plus the provenance Swiss Ephemeris reported for it. */
export interface PlanetPositionDetailed {
  position: PlanetPosition;
  requestedFlags: number;
  /** Raw flag word returned by swe_calc_ut (ret value). */
  returnedFlags: number;
  requestedEphemeris: SwissEphemerisKind;
  ephemeris: SwissEphemerisKind | null;
  /** True when the returned ephemeris differs from the requested one. */
  substituted: boolean;
  /** Non-fatal serr text from Swiss Ephemeris (for example a Moshier fallback notice), else null. */
  warning: string | null;
}

export interface CalculatePositionOptions {
  /** Throw SwissEphEphemerisMismatchError instead of returning substituted output. */
  strictEphemeris?: boolean;
}

const SWISS_FILE_NOT_FOUND = /SwissEph file '([^']+)' not found/;

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

/** The shipped ephemeris files (1800-2400 CE). Anything else Swiss asks for means the date is outside them. */
const REQUIRED_EPHEMERIS_FILE_NAMES: readonly string[] = ["seas_18.se1", "semo_18.se1", "sepl_18.se1"];

// Offset for asteroids (MPC)
export const SE_AST_OFFSET = 10000;

export const BODY = {
  MEAN_APOGEE: 12, // Lilith mean
  OSC_APOGEE: 13, // Lilith true
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
  private swe_azalt_fn: SweAzalt | null = null;
  private swe_rise_trans_fn: SweRiseTrans | null = null;

  /**
   * Constructor that accepts a pre-initialized Swiss Ephemeris module
   */
  constructor(module: SwissEphModule) {
    this.module = module;

    // Create wrapped functions with specific types
    this.swe_julday = this.module.cwrap<SweJulDay>("swe_julday", "number", [
      "number",
      "number",
      "number",
      "number",
      "number",
    ]);
    this.swe_calc_ut = this.module.cwrap<SweCalcUt>("swe_calc_ut", "number", [
      "number",
      "number",
      "number",
      "number",
      "number",
    ]);
    this.swe_houses = this.module.cwrap<SweHouses>("swe_houses", "number", [
      "number",
      "number",
      "number",
      "number",
      "number",
      "number",
    ]);
    this.swe_house_pos = this.module.cwrap<SweHousePos>(
      "swe_house_pos",
      "number",
      ["number", "number", "number", "string", "number", "number"]
    );
    this.swe_set_ephe_path = this.module.cwrap<SweSetEphePath>(
      "swe_set_ephe_path",
      null,
      ["number"]
    );
    this.swe_close = this.module.cwrap<SweClose>("swe_close", null, []);
    this.swe_set_topo = this.module.cwrap<SweSetTopo>("swe_set_topo", null, [
      "number",
      "number",
      "number",
    ]);
    this.swe_set_sid_mode = this.module.cwrap<SweSetSidMode>(
      "swe_set_sid_mode",
      null,
      ["number", "number", "number"]
    );
    this.swe_azalt_fn = this.module.cwrap<SweAzalt>(
      "swe_azalt",
      null,
      ["number", "number", "number", "number", "number", "number", "number"]
    );
    this.swe_rise_trans_fn = this.module.cwrap<SweRiseTrans>(
      "swe_rise_trans",
      "number",
      ["number", "number", "number", "number", "number", "number", "number", "number", "number", "number"]
    );
  }

  private checkInitialized(): void {
    if (!this.module) {
      throw new Error("Swiss Ephemeris module not available.");
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
        throw new Error("Failed to allocate memory for ephemeris path");
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
      throw new Error("Julian day calculation function not available");
    }

    // Get UTC components
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1; // JavaScript months are 0-based
    const day = date.getUTCDate();
    const hour =
      date.getUTCHours() +
      date.getUTCMinutes() / 60 +
      date.getUTCSeconds() / 3600;

    // Use Gregorian calendar (flag = 1)
    return this.swe_julday(year, month, day, hour, 1);
  }

  /**
   * When true, every calculation throws SwissEphEphemerisMismatchError if Swiss
   * Ephemeris silently substituted another ephemeris (for example Moshier).
   */
  strictEphemeris = false;

  /**
   * Calculate planet position at a given Julian day (bare position, backwards compatible).
   */
  calculatePlanetPosition(
    julday: number,
    planet: Planet | number,
    flags = CalcFlag.SWISS_EPH
  ): PlanetPosition {
    return this.calculatePlanetPositionDetailed(julday, planet, flags).position;
  }

  /**
   * Calculate a planet position and report which ephemeris Swiss Ephemeris actually used.
   * The returned flag word of swe_calc_ut is decoded, never discarded.
   */
  calculatePlanetPositionDetailed(
    julday: number,
    planet: Planet | number,
    flags = CalcFlag.SWISS_EPH,
    options: CalculatePositionOptions = {}
  ): PlanetPositionDetailed {
    this.checkInitialized();
    if (!this.swe_calc_ut || !this.module) {
      throw new Error("Planet calculation function not available");
    }

    const resultPtr = this.module._malloc(6 * 8);
    if (!resultPtr) {
      throw new Error("Failed to allocate memory for planet position");
    }

    // allocate an error buffer for swe_calc_ut to write into
    const ERR_BYTES = 512;
    const errPtr = this.module._malloc(ERR_BYTES);
    if (!errPtr) {
      this.module._free(resultPtr);
      throw new Error("Failed to allocate memory for error buffer");
    }
    // zero the buffer to ensure a clean C string
    this.module.HEAP8.fill(0, errPtr, errPtr + ERR_BYTES);

    try {
      const ret = this.swe_calc_ut(julday, planet, flags, resultPtr, errPtr);
      const serr = this.module.UTF8ToString(errPtr);

      if (ret < 0) {
        const missing = SWISS_FILE_NOT_FOUND.exec(serr);
        if (missing) {
          throw new SwissEphError(
            "SWISSEPH_EPHEMERIS_FILE_UNAVAILABLE",
            serr.trim(),
            { julianDay: julday, missingFile: missing[1], planet, swissMessage: serr }
          );
        }
        throw new SwissEphError(
          "SWISSEPH_CALCULATION_FAILED",
          serr && serr.length ? serr : `Swiss Ephemeris calculation failed with error code ${ret}`,
          { julianDay: julday, planet, returnCode: ret, swissMessage: serr }
        );
      }

      const position: PlanetPosition = {
        longitude: this.module.getValue(resultPtr, "double"),
        latitude: this.module.getValue(resultPtr + 8, "double"),
        distance: this.module.getValue(resultPtr + 16, "double"),
      };

      if (flags & CalcFlag.SPEED) {
        position.longitudeSpeed = this.module.getValue(resultPtr + 24, "double");
        position.latitudeSpeed = this.module.getValue(resultPtr + 32, "double");
        position.distanceSpeed = this.module.getValue(resultPtr + 40, "double");
      }

      const requestedEphemeris = requestedEphemerisFromFlags(flags);
      const ephemeris = ephemerisFromFlags(ret);
      const substituted = ephemeris !== requestedEphemeris;
      const warning = serr && serr.length ? serr : null;

      if (substituted && (options.strictEphemeris ?? this.strictEphemeris)) {
        const missing = warning ? SWISS_FILE_NOT_FOUND.exec(warning) : null;
        const missingFile = missing ? missing[1] : null;
        throw new SwissEphEphemerisMismatchError({
          requestedEphemeris,
          returnedEphemeris: ephemeris,
          requestedFlags: flags,
          returnedFlags: ret,
          warning,
          julianDay: julday,
          missingFile,
          reason: !missingFile
            ? "unknown"
            : REQUIRED_EPHEMERIS_FILE_NAMES.includes(missingFile)
              ? "ephemeris_files_unavailable"
              : "date_outside_installed_ephemeris_files",
        });
      }

      return {
        position,
        requestedFlags: flags,
        returnedFlags: ret,
        requestedEphemeris,
        ephemeris,
        substituted,
        warning,
      };
    } finally {
      this.module._free(errPtr);
      this.module._free(resultPtr);
    }
  }

  /**
   * Calculate houses for a given date, location, and house system
   */
  calculateHouses(
    julday: number,
    latitude: number,
    longitude: number,
    hsys: HouseSystem = HouseSystem.PLACIDUS
  ): Houses {
    this.checkInitialized();
    if (!this.swe_houses || !this.module) {
      throw new Error("Houses calculation function not available");
    }

    // Validate input parameters
    if (latitude < -90 || latitude > 90) {
      throw new Error("Latitude must be between -90 and 90 degrees");
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error("Longitude must be between -180 and 180 degrees");
    }

    // Swiss Ephemeris: cusps[0..12] (0 not used), ascmc[0..9]
    const HOUSES_DOUBLES = 13;
    const ASCMC_DOUBLES = 10;
    const BYTES_PER_F64 = 8;

    // Create a single contiguous memory block for both houses and ascmc
    const totalBytes = (HOUSES_DOUBLES + ASCMC_DOUBLES) * BYTES_PER_F64;
    const memoryPtr = this.module._malloc(totalBytes);

    if (!memoryPtr) throw new Error("Memory allocation failed");

    const housesPtr = memoryPtr; // 13 * f64
    const ascmcPtr = memoryPtr + HOUSES_DOUBLES * BYTES_PER_F64; // 10 * f64

    try {
      // Calculate houses
      // passar código do caractere (ex.: 'P' -> 80)
      const hsysCode = hsys.charCodeAt(0);
      const ret = this.swe_houses(
        julday,
        latitude,
        longitude,
        hsysCode,
        housesPtr,
        ascmcPtr
      );

      if (ret < 0) {
        // Swiss returns ERR for Placidus/Koch (and other time-based systems) beyond the polar circle.
        const polar = Math.abs(latitude) >= 90 - 23.4366;
        throw new SwissEphError(
          "SWISSEPH_HOUSES_UNAVAILABLE",
          `Houses calculation failed with error code ${ret}: house system "${hsys}" is not available at latitude ${latitude}` +
            (polar
              ? " (beyond the polar circle, |latitude| >= ~66.56, Placidus and Koch are undefined)"
              : "") +
            `. Use a system that works at any latitude (whole-sign "W", equal "E" or Porphyry "O"), ` +
            `or pass houseSystemFallback to substitute one explicitly.`,
          { houseSystem: hsys, latitude, longitude, julianDay: julday, errorCode: ret }
        );
      }

      // Extract all data before any memory operations
      const houses: number[] = new Array(HOUSES_DOUBLES);
      for (let i = 0; i < HOUSES_DOUBLES; i++) {
        houses[i] = this.module.getValue(
          housesPtr + i * BYTES_PER_F64,
          "double"
        );
      }

      const ascendant = this.module.getValue(
        ascmcPtr + 0 * BYTES_PER_F64,
        "double"
      ); // 0
      const mc = this.module.getValue(ascmcPtr + 1 * BYTES_PER_F64, "double"); // 1
      const armc = this.module.getValue(ascmcPtr + 2 * BYTES_PER_F64, "double"); // 2
      const vertex = this.module.getValue(
        ascmcPtr + 3 * BYTES_PER_F64,
        "double"
      ); // 3
      const equasc = this.module.getValue(
        ascmcPtr + 4 * BYTES_PER_F64,
        "double"
      ); // 4
      const coasc1 = this.module.getValue(
        ascmcPtr + 5 * BYTES_PER_F64,
        "double"
      ); // 5
      const coasc2 = this.module.getValue(
        ascmcPtr + 6 * BYTES_PER_F64,
        "double"
      ); // 6
      const polasc = this.module.getValue(
        ascmcPtr + 7 * BYTES_PER_F64,
        "double"
      ); // 7

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
          polasc,
        },
      };
    } finally {
      // Always free memory
      this.module._free(memoryPtr);
    }
  }

  /**
   * Swiss Ephemeris version string, or null when the wasm build does not export swe_version.
   */
  getVersion(): string | null {
    this.checkInitialized();
    const fn = this.module._swe_version;
    if (typeof fn !== "function") {
      return null;
    }
    const ptr = this.module._malloc(256);
    if (!ptr) {
      return null;
    }
    try {
      fn.call(this.module, ptr);
      return this.module.UTF8ToString(ptr) || null;
    } finally {
      this.module._free(ptr);
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
   * Set topocentric observer.
   * MUTABLE GLOBAL STATE inside the Swiss library (see withSwissEphState in
   * src/astrology/swisseph.ts for the synchronous set-and-restore helper).
   */
  setTopocentric(
    longitude: number,
    latitude: number,
    altitudeMeters = 0
  ): void {
    this.checkInitialized();

    if (!this.swe_set_topo) {
      throw new Error("Topocentric calculation function not available");
    }

    this.swe_set_topo(longitude, latitude, altitudeMeters);
  }

  /**
   * Set sidereal mode.
   * MUTABLE GLOBAL STATE inside the Swiss library (shared by every caller of this
   * module instance); prefer withSwissEphState which restores the previous mode.
   * Ex.: mode=1 (Lahiri). See Swiss Ephemeris mode table.
   */
  setSiderealMode(mode: number, t0 = 0, ayan_t0 = 0): void {
    this.checkInitialized();
    this.swe_set_sid_mode?.(mode, t0, ayan_t0);
  }

  /**
   * Asteroid by MPC number
   */
  calculateAsteroidPosition(
    julday: number,
    mpcNumber: number,
    flags = CalcFlag.SWISS_EPH
  ): PlanetPosition {
    return this.calculatePlanetPosition(
      julday,
      SE_AST_OFFSET + mpcNumber,
      flags
    );
  }

  /**
   * Lilith mean (12) and true (13)
   */
  calculateLilith(
    julday: number,
    kind: "mean" | "true" = "mean",
    flags = CalcFlag.SWISS_EPH
  ): PlanetPosition {
    const id = kind === "mean" ? BODY.MEAN_APOGEE : BODY.OSC_APOGEE;
    return this.calculatePlanetPosition(julday, id, flags);
  }
  /**
   * Convert ecliptic (or equatorial) coordinates to horizon coordinates.
   * Returns azimuth (0=south, 90=west, 180=north, 270=east) and altitude.
   */
  azalt(
    julday: number,
    longitude: number,
    latitude: number,
    altitude: number,
    xinLon: number,
    xinLat: number,
    xinDist: number,
    fromEquatorial = false
  ): AzaltResult {
    this.checkInitialized();
    if (!this.swe_azalt_fn) {
      throw new Error("swe_azalt function not available");
    }

    const BYTES = 8;
    const geoPtr = this.module._malloc(3 * BYTES);
    const xinPtr = this.module._malloc(3 * BYTES);
    const xazPtr = this.module._malloc(3 * BYTES);

    if (!geoPtr || !xinPtr || !xazPtr) {
      if (geoPtr) this.module._free(geoPtr);
      if (xinPtr) this.module._free(xinPtr);
      if (xazPtr) this.module._free(xazPtr);
      throw new Error("Memory allocation failed for azalt");
    }

    try {
      this.module.setValue(geoPtr, longitude, "double");
      this.module.setValue(geoPtr + BYTES, latitude, "double");
      this.module.setValue(geoPtr + 2 * BYTES, altitude, "double");

      this.module.setValue(xinPtr, xinLon, "double");
      this.module.setValue(xinPtr + BYTES, xinLat, "double");
      this.module.setValue(xinPtr + 2 * BYTES, xinDist, "double");

      this.swe_azalt_fn(
        julday,
        fromEquatorial ? SE_EQU2HOR : SE_ECL2HOR,
        geoPtr,
        0, // atpress (0 = default 1013.25 mbar)
        0, // attemp (0 = default 15°C)
        xinPtr,
        xazPtr
      );

      return {
        azimuth: this.module.getValue(xazPtr, "double"),
        trueAltitude: this.module.getValue(xazPtr + BYTES, "double"),
        apparentAltitude: this.module.getValue(xazPtr + 2 * BYTES, "double"),
      };
    } finally {
      this.module._free(geoPtr);
      this.module._free(xinPtr);
      this.module._free(xazPtr);
    }
  }

  /**
   * Find the next rise, set, or meridian transit of a planet.
   * Returns the Julian day of the event.
   */
  riseTransit(
    julday: number,
    planet: Planet | number,
    rsmi: RiseTransitFlag,
    longitude: number,
    latitude: number,
    altitude = 0,
    flags = CalcFlag.SWISS_EPH
  ): number {
    this.checkInitialized();
    if (!this.swe_rise_trans_fn) {
      throw new Error("swe_rise_trans function not available");
    }

    const BYTES = 8;
    const geoPtr = this.module._malloc(3 * BYTES);
    const tretPtr = this.module._malloc(BYTES);
    const ERR_BYTES = 512;
    const errPtr = this.module._malloc(ERR_BYTES);

    if (!geoPtr || !tretPtr || !errPtr) {
      if (geoPtr) this.module._free(geoPtr);
      if (tretPtr) this.module._free(tretPtr);
      if (errPtr) this.module._free(errPtr);
      throw new Error("Memory allocation failed for riseTransit");
    }

    this.module.HEAP8.fill(0, errPtr, errPtr + ERR_BYTES);

    try {
      this.module.setValue(geoPtr, longitude, "double");
      this.module.setValue(geoPtr + BYTES, latitude, "double");
      this.module.setValue(geoPtr + 2 * BYTES, altitude, "double");

      const ret = this.swe_rise_trans_fn(
        julday,
        planet,
        0,       // starname pointer (0 = planet, not fixed star)
        flags,
        rsmi,
        geoPtr,
        0,       // atpress
        0,       // attemp
        tretPtr,
        errPtr
      );

      if (ret < 0) {
        const msg = this.module.UTF8ToString(errPtr);
        throw new Error(msg || `swe_rise_trans failed with code ${ret}`);
      }

      return this.module.getValue(tretPtr, "double");
    } finally {
      this.module._free(geoPtr);
      this.module._free(tretPtr);
      this.module._free(errPtr);
    }
  }
}

/**
 * Fortune part (in ecliptic longitude)
 */
export function parsFortunae(
  asc: number,
  sunLon: number,
  moonLon: number,
  diurnal: boolean
): number {
  const val = diurnal ? asc + moonLon - sunLon : asc + sunLon - moonLon;
  return normalizeAngle(val);
}
