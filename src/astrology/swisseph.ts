/**
 * Integration with the Swiss Ephemeris WebAssembly module
 */
import wasmPathNode from "../../wasm/build/swisseph.node.wasm?url";
import wasmPathWeb from "../../wasm/build/swisseph.web.wasm?url";
import type { SwissEphModule, SwissEphModuleFactory } from "../../wasm/src/types";

// Note: In the production code, you'll need to include the compiled WASM files
// and update the import path. This is a placeholder that would work once the
// compilation is complete.

// Import from the actual WASM wrapper
import {
  type AzaltResult,
  CalcFlag,
  Houses,
  HouseSystem,
  normalizeAngle,
  parsFortunae,
  Planet,
  PLANET_AND_NODE_NAMES,
  PlanetPosition,
  RiseTransitFlag,
  SwissEph,
  VirtualNodes,
} from "../../wasm/src/swisseph";

// We'll use this singleton pattern to manage the Swiss Ephemeris instance
let swissEph: SwissEph | null = null;

const DEFAULT_FLAGS = CalcFlag.SWISS_EPH | CalcFlag.SPEED;
export const REQUIRED_EPHE_FILES = ["seas_18.se1", "semo_18.se1", "sepl_18.se1"] as const;

const NODE_EPHE_MOUNT_POINT = "/ephefs";
const NODE_EPHE_MEMFS_PATH = "/ephemem";

type EmscriptenFs = NonNullable<SwissEphModule["FS"]>;

type NodeEphemerisStrategy = "nodefs-mount" | "host-path" | "memfs-copy";

interface VirtualEphemerisCheck {
  rootExists: boolean | null;
  visibleEntries: string[];
  missingFiles: string[];
}

interface ResolvedNodeEphemerisPath {
  path: string;
  strategy: NodeEphemerisStrategy;
}

interface NodeFsLike {
  readFileSync(path: string): Uint8Array;
}

interface PathModuleLike {
  join(...paths: string[]): string;
}

interface ResolveNodeEphemerisPathOptions {
  nodeFs?: NodeFsLike;
  pathModule?: PathModuleLike;
  mountPoint?: string;
  memfsPath?: string;
  requiredFiles?: readonly string[];
}

function normalizeVirtualPath(path: string): string {
  if (path === "/") {
    return path;
  }

  return path.replace(/\/+$/, "") || "/";
}

function joinVirtualPath(rootPath: string, leaf: string): string {
  const normalizedRoot = normalizeVirtualPath(rootPath);
  return normalizedRoot === "/" ? `/${leaf}` : `${normalizedRoot}/${leaf}`;
}

function ensureVirtualDir(fs: EmscriptenFs, path: string): void {
  try {
    fs.mkdir(path);
  } catch {
    // Ignore existing directories and readonly mount roots.
  }
}

function safeAnalyzePath(fs: EmscriptenFs, path: string): boolean | null {
  if (!fs.analyzePath) {
    return null;
  }

  try {
    return fs.analyzePath(path).exists === true;
  } catch {
    return false;
  }
}

function safeReaddir(fs: EmscriptenFs, path: string): string[] {
  if (!fs.readdir) {
    return [];
  }

  try {
    return fs.readdir(path).filter((entry) => entry !== "." && entry !== "..");
  } catch {
    return [];
  }
}

export function inspectVirtualEphemerisPath(
  fs: EmscriptenFs | undefined,
  rootPath: string,
  requiredFiles: readonly string[] = REQUIRED_EPHE_FILES
): VirtualEphemerisCheck {
  if (!fs) {
    return {
      rootExists: null,
      visibleEntries: [],
      missingFiles: [...requiredFiles],
    };
  }

  const rootExists = safeAnalyzePath(fs, rootPath);
  const visibleEntries = safeReaddir(fs, rootPath);
  const missingFiles = requiredFiles.filter((file) => {
    const filePath = joinVirtualPath(rootPath, file);
    return !visibleEntries.includes(file) && safeAnalyzePath(fs, filePath) !== true;
  });

  return {
    rootExists,
    visibleEntries,
    missingFiles,
  };
}

function formatVirtualPathCheck(label: string, path: string, check: VirtualEphemerisCheck | null): string {
  if (!check) {
    return `${label} "${path}" could not be inspected.`;
  }

  const exists = check.rootExists == null ? "unknown" : check.rootExists ? "yes" : "no";
  const visibleEntries = check.visibleEntries.length > 0 ? check.visibleEntries.join(", ") : "(none)";
  const missingFiles = check.missingFiles.length > 0 ? check.missingFiles.join(", ") : "(none)";

  return `${label} "${path}" exists: ${exists}; visible entries: ${visibleEntries}; missing required files: ${missingFiles}.`;
}

function normalizeHostFileData(data: Uint8Array): Uint8Array {
  return data instanceof Uint8Array ? data : new Uint8Array(data);
}

function loadHostEphemerisFiles(
  ephePath: string,
  requiredFiles: readonly string[],
  nodeFs: NodeFsLike,
  pathModule: PathModuleLike
): Map<string, Uint8Array> {
  const files = new Map<string, Uint8Array>();

  for (const file of requiredFiles) {
    files.set(file, normalizeHostFileData(nodeFs.readFileSync(pathModule.join(ephePath, file))));
  }

  return files;
}

function writeEphemerisFilesToMemfs(
  fs: EmscriptenFs,
  targetPath: string,
  files: Map<string, Uint8Array>
): void {
  ensureVirtualDir(fs, targetPath);

  for (const [fileName, fileData] of files.entries()) {
    fs.writeFile(joinVirtualPath(targetPath, fileName), fileData);
  }
}

function toError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err));
}

function buildEphemerisResolutionError(
  finalEphePath: string,
  requiredFiles: readonly string[],
  details: {
    mountAttempted: boolean;
    mountPoint: string;
    mountCheck: VirtualEphemerisCheck | null;
    mountError: Error | null;
    hostCheck: VirtualEphemerisCheck | null;
    memfsPath: string;
    memfsCheck: VirtualEphemerisCheck | null;
    hostReadError: Error | null;
  }
): string {
  const parts = [
    `Unable to resolve Swiss Ephemeris data files. Expected ${requiredFiles.join(", ")} under "${finalEphePath}".`,
  ];

  if (details.mountAttempted) {
    parts.push(
      `${formatVirtualPathCheck("Mounted ephemeris path", details.mountPoint, details.mountCheck)} The NODEFS mount may have failed silently.`
    );
  }

  if (details.mountError) {
    parts.push(`Mounting the ephemeris directory failed: ${details.mountError.message}.`);
  }

  parts.push(formatVirtualPathCheck("Direct host ephemeris path", finalEphePath, details.hostCheck));

  if (details.memfsCheck) {
    parts.push(formatVirtualPathCheck("MEMFS ephemeris copy", details.memfsPath, details.memfsCheck));
  }

  if (details.hostReadError) {
    parts.push(`Reading host ephemeris files failed: ${details.hostReadError.message}.`);
  }

  parts.push(
    `Pass an explicit ephePath that contains ${requiredFiles.join(", ")} or ensure the packaged ephemeris directory is readable.`
  );

  return parts.join(" ");
}

export function resolveNodeEphemerisPath(
  module: SwissEphModule,
  finalEphePath: string,
  options: ResolveNodeEphemerisPathOptions = {}
): ResolvedNodeEphemerisPath {
  const fs = module.FS;
  const requiredFiles = options.requiredFiles ?? REQUIRED_EPHE_FILES;
  const mountPoint = options.mountPoint ?? NODE_EPHE_MOUNT_POINT;
  const memfsPath = options.memfsPath ?? NODE_EPHE_MEMFS_PATH;
  const nodeFs = options.nodeFs ?? (require("fs") as NodeFsLike);
  const pathModule = options.pathModule ?? (require("path") as PathModuleLike);

  let mountAttempted = false;
  let mountCheck: VirtualEphemerisCheck | null = null;
  let mountError: Error | null = null;
  let hostCheck: VirtualEphemerisCheck | null = null;
  let memfsCheck: VirtualEphemerisCheck | null = null;
  let hostReadError: Error | null = null;

  if (fs?.mount && fs.filesystems?.NODEFS) {
    mountAttempted = true;
    ensureVirtualDir(fs, mountPoint);

    try {
      fs.mount(fs.filesystems.NODEFS, { root: finalEphePath }, mountPoint);
      mountCheck = inspectVirtualEphemerisPath(fs, mountPoint, requiredFiles);

      if (mountCheck.missingFiles.length === 0) {
        return { path: mountPoint, strategy: "nodefs-mount" };
      }
    } catch (mountErr) {
      mountError = toError(mountErr);
    }
  }

  hostCheck = inspectVirtualEphemerisPath(fs, finalEphePath, requiredFiles);
  if (fs && hostCheck.missingFiles.length === 0) {
    return { path: finalEphePath, strategy: "host-path" };
  }

  let hostFiles: Map<string, Uint8Array> | null = null;
  try {
    hostFiles = loadHostEphemerisFiles(finalEphePath, requiredFiles, nodeFs, pathModule);
  } catch (err) {
    hostReadError = toError(err);
  }

  if (hostFiles && fs?.writeFile) {
    writeEphemerisFilesToMemfs(fs, memfsPath, hostFiles);
    memfsCheck = inspectVirtualEphemerisPath(fs, memfsPath, requiredFiles);

    if (memfsCheck.missingFiles.length === 0) {
      return { path: memfsPath, strategy: "memfs-copy" };
    }
  }

  if (hostFiles) {
    return { path: finalEphePath, strategy: "host-path" };
  }

  throw new Error(
    buildEphemerisResolutionError(finalEphePath, requiredFiles, {
      mountAttempted,
      mountPoint,
      mountCheck,
      mountError,
      hostCheck,
      memfsPath,
      memfsCheck,
      hostReadError,
    })
  );
}

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
        module.FS?.mkdir?.(epheFsPath);
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
          module.FS?.writeFile?.(
            `${epheFsPath}/${name}`,
            new Uint8Array(buf)
          );
        })
      );
      const browserCheck = inspectVirtualEphemerisPath(module.FS, epheFsPath, REQUIRED_EPHE_FILES);
      if (browserCheck.missingFiles.length > 0) {
        throw new Error(
          `Failed to materialize browser ephemeris files at "${epheFsPath}". Missing: ${browserCheck.missingFiles.join(", ")}.`
        );
      }
      console.info(`Setting ephemeris path to: ${epheFsPath}`);
      instance.setEphemerisPath(epheFsPath);
    } else {
      const resolution = resolveNodeEphemerisPath(module, finalEphePath);
      if (resolution.strategy === "nodefs-mount") {
        console.info(`Setting ephemeris path to: ${resolution.path} (mounted from ${finalEphePath})`);
      } else if (resolution.strategy === "memfs-copy") {
        console.info(`Setting ephemeris path to: ${resolution.path} (copied from ${finalEphePath})`);
      } else {
        console.info(`Setting ephemeris path to: ${resolution.path}`);
      }
      instance.setEphemerisPath(resolution.path);
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
/**
 * Calculate the position of a single planet by its enum ID.
 * Much cheaper than calculatePlanetaryPositions when only one body is needed.
 */
export function calculateSinglePlanetPosition(
  date: Date,
  planet: Planet
): PlanetPosition {
  checkInitialization();
  const julday = swissEph!.getJulianDay(date);
  return swissEph!.calculatePlanetPosition(julday, planet, DEFAULT_FLAGS);
}

/**
 * Calculate equatorial coordinates (Right Ascension / Declination) for a planet.
 * Uses the existing EQUATORIAL flag — RA is returned in the longitude field,
 * Dec in the latitude field by Swiss Ephemeris convention.
 */
export interface EquatorialPosition {
  rightAscension: number;
  declination: number;
  distance: number;
}

export function calculateEquatorialPosition(
  date: Date,
  planet: Planet
): EquatorialPosition {
  checkInitialization();
  const julday = swissEph!.getJulianDay(date);
  const pos = swissEph!.calculatePlanetPosition(
    julday,
    planet,
    CalcFlag.SWISS_EPH | CalcFlag.EQUATORIAL
  );
  return {
    rightAscension: pos.longitude,
    declination: pos.latitude,
    distance: pos.distance,
  };
}

/**
 * Get the Julian day for a Date (UTC).
 */
export function getJulianDay(date: Date): number {
  checkInitialization();
  return swissEph!.getJulianDay(date);
}

/**
 * Find the next rise, set, or meridian transit of a planet at a location.
 * Returns the Julian day of the event.
 */
export function calculateRiseTransit(
  date: Date,
  planet: Planet,
  latitude: number,
  longitude: number,
  event: RiseTransitFlag
): number {
  checkInitialization();
  const julday = swissEph!.getJulianDay(date);
  return swissEph!.riseTransit(julday, planet, event, longitude, latitude);
}

/**
 * Convert ecliptic coordinates to horizon coordinates (azimuth/altitude).
 */
export function calculateAzalt(
  date: Date,
  latitude: number,
  longitude: number,
  eclLon: number,
  eclLat: number,
  dist: number
): AzaltResult {
  checkInitialization();
  const julday = swissEph!.getJulianDay(date);
  return swissEph!.azalt(julday, longitude, latitude, 0, eclLon, eclLat, dist);
}

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
  date: Date | LocalDateTimeParts,
  latitude: number,
  longitude: number,
  houseSystem: HouseSystem,
  options: TimeZoneOptions = {}
): Promise<Houses> {
  try {
    checkInitialization();

    // Interpret the provided date as local civil time by default.
    // For backward compatibility, allow callers to treat the date as UT.
    const dateForUt =
      options.treatAsUTC === true
        ? (date instanceof Date ? date : createUtcDateFromParts(buildLocalParts(date)))
        : await localToUtcDate(date, latitude, longitude, options);

    const julday = swissEph!.getJulianDay(dateForUt);
    return swissEph!.calculateHouses(
      julday,
      latitude,
      longitude,
      houseSystem
    );
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
  type AzaltResult,
  CalcFlag,
  HouseSystem,
  normalizeAngle,
  Planet,
  PLANET_AND_NODE_NAMES,
  PlanetPosition,
  RiseTransitFlag,
  VirtualNodes
};

/**
 * Local civil time handling (DST-aware)
 * Convert a local date-time (given via IANA time zone, explicit UTC offset, or auto from lat/lon)
 * into a UTC Date for Swiss Ephemeris (which expects UT).
 */
type LocalDateTimeParts = {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour?: number; // 0-23
  minute?: number; // 0-59
  second?: number; // 0-59
};

export type TimeZoneOptions = {
  /**
   * IANA time zone
   * If provided, DST is handled automatically via Intl API.
   */
  timeZone?: string;
  /**
   * Explicit UTC offset in minutes for the local civil time.
   * Positive for east of Greenwich, negative for west (e.g., -180 for UTC-3).
   * If provided, overrides timeZone.
   */
  utcOffsetMinutes?: number;
  /**
   * Optional resolver to derive an IANA time zone from coordinates and date.
   * Use an external library (e.g., tz-lookup) and pass it here.
   */
  resolveTimeZone?: (latitude: number, longitude: number, local: LocalDateTimeParts) => string | undefined;
  /**
   * When true (default), try to auto-resolve the IANA time zone from lat/lon using tz-lookup
   * if no explicit offset/timeZone is provided.
   */
  autoTimeZone?: boolean;
  /**
   * When true, the date is treated as UTC instead of local civil time.
   */
  treatAsUTC?: boolean;
};

function buildLocalParts(date: Date | LocalDateTimeParts): LocalDateTimeParts {
  if (date instanceof Date) {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
    };
  }
  return date;
}

function createUtcDateFromParts(parts: LocalDateTimeParts): Date {
  const { year, month, day, hour = 0, minute = 0, second = 0 } = parts;
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
}

/**
 * Compute the time zone offset (in ms) for a given instant and IANA time zone.
 * Based on the approach used by date-fns-tz.
 */
function getTimeZoneOffsetMs(instant: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = dtf.formatToParts(instant);
  const map: Record<string, string> = {};
  for (const p of parts) {
    map[p.type] = p.value;
  }
  const asUTC = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second)
  );
  return asUTC - instant.getTime();
}

/**
 * Convert a local civil date-time to a UTC Date using either an explicit offset,
 * an IANA time zone (DST-aware), a custom resolver, or auto lat/lon resolution.
 * If no time zone information can be derived, throws.
 */
async function localToUtcDate(
  local: Date | LocalDateTimeParts,
  latitude?: number,
  longitude?: number,
  opts: TimeZoneOptions = {}
): Promise<Date> {
  // Treat the date as already UTC — no conversion needed
  if (opts.treatAsUTC === true) {
    return local instanceof Date ? local : createUtcDateFromParts(buildLocalParts(local));
  }

  const parts = buildLocalParts(local);
  const auto = opts.autoTimeZone !== false;

  // 1) Explicit offset takes precedence
  if (typeof opts.utcOffsetMinutes === "number" && Number.isFinite(opts.utcOffsetMinutes)) {
    const utcMs = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour ?? 0,
      parts.minute ?? 0,
      parts.second ?? 0
    );
    return new Date(utcMs - opts.utcOffsetMinutes * 60_000);
  }

  // 2) IANA time zone provided
  if (opts.timeZone) {
    const naiveUtc = createUtcDateFromParts(parts);
    const offsetMs = getTimeZoneOffsetMs(naiveUtc, opts.timeZone);
    return new Date(naiveUtc.getTime() - offsetMs);
  }

  // 3) Custom resolver
  if (
    opts.resolveTimeZone &&
    typeof latitude === "number" &&
    typeof longitude === "number"
  ) {
    const tz = opts.resolveTimeZone(latitude, longitude, parts);
    if (tz) {
      const naiveUtc = createUtcDateFromParts(parts);
      const offsetMs = getTimeZoneOffsetMs(naiveUtc, tz);
      return new Date(naiveUtc.getTime() - offsetMs);
    }
  }

  // 4) Auto resolve with tz-lookup if allowed and coords available
  if (
    auto &&
    typeof latitude === "number" &&
    typeof longitude === "number"
  ) {

    const mod = await import("tz-lookup");
    const lookup = mod.default ?? mod;
    const tz = lookup(latitude, longitude);
    if (tz) {
      const naiveUtc = createUtcDateFromParts(parts);
      const offsetMs = getTimeZoneOffsetMs(naiveUtc, tz);
      return new Date(naiveUtc.getTime() - offsetMs);
    }
  }

  throw new Error(
    "Time zone information is required. Provide 'utcOffsetMinutes', 'timeZone', 'resolveTimeZone', or enable autoTimeZone with latitude/longitude."
  );
}

/**
 * Public helper to convert a local civil date-time to a UTC Date using the same
 * logic as house calculations.
 */
export async function toUtcDate(
  local: Date | LocalDateTimeParts,
  latitude?: number,
  longitude?: number,
  options: TimeZoneOptions = {}
): Promise<Date> {
  return localToUtcDate(local, latitude, longitude, options);
}
