/**
 * Deterministic cache keys for chart-level calculations, plus a small bounded LRU memo.
 *
 * A key is the canonical JSON (sorted keys, normalised numbers) of EVERY input that can
 * change a result: the complete chart input, civil-time semantics, timezone and resolved
 * offset, coordinates, input quality, house system(s), point selection, orb policy,
 * method/frame, node convention, year length, GC constants, ephemeris identity, package
 * version and any extra configuration. A person's ID is never a key by itself; it is not
 * even an accepted component. A required component that is `undefined` throws a typed
 * `CacheKeyError`; `null` is an explicit "not applicable" (for example no GC constants in
 * a tropical calculation).
 *
 * Pure and browser-safe: no ephemeris access, no shared mutable state other than the memo
 * instance you create.
 */

import packageJson from "../../package.json";
import type { LocalDateTimeParts } from "./swisseph";

export const CACHE_KEY_VERSION = 1;

export type CacheKeyErrorCode =
  | "MISSING_COMPONENT"
  | "INVALID_COMPONENT"
  | "INVALID_CACHE_OPTION";

/** Typed error raised by the cache-key builder and memo. `code` is stable API. */
export class CacheKeyError extends Error {
  readonly code: CacheKeyErrorCode;
  readonly component: string | null;

  constructor(code: CacheKeyErrorCode, message: string, component: string | null = null) {
    super(message);
    this.name = "CacheKeyError";
    this.code = code;
    this.component = component;
  }
}

// ---------------------------------------------------------------------------
// Canonical JSON
// ---------------------------------------------------------------------------

/** Normalise a finite number: -0 becomes 0 and float noise beyond 15 significant digits is dropped. */
export function normalizeKeyNumber(value: number): number {
  if (!Number.isFinite(value)) {
    throw new CacheKeyError("INVALID_COMPONENT", `Non-finite number cannot be part of a cache key: ${value}`);
  }
  if (value === 0) return 0;
  return Number(value.toPrecision(15));
}

function canonicalize(value: unknown, path: string): unknown {
  if (value === null) return null;
  switch (typeof value) {
    case "string":
    case "boolean":
      return value;
    case "number":
      return normalizeKeyNumber(value);
    case "undefined":
      throw new CacheKeyError("MISSING_COMPONENT", `Cache key component "${path}" is undefined.`, path);
    case "object": {
      if (value instanceof Date) {
        const time = value.getTime();
        if (Number.isNaN(time)) {
          throw new CacheKeyError("INVALID_COMPONENT", `Invalid Date at "${path}".`, path);
        }
        return { $date: value.toISOString() };
      }
      if (Array.isArray(value)) {
        return value.map((item, index) => canonicalize(item, `${path}[${index}]`));
      }
      const out: Record<string, unknown> = {};
      for (const key of Object.keys(value as object).sort()) {
        out[key] = canonicalize((value as Record<string, unknown>)[key], `${path}.${key}`);
      }
      return out;
    }
    default:
      throw new CacheKeyError(
        "INVALID_COMPONENT",
        `Unsupported value of type ${typeof value} at "${path}".`,
        path
      );
  }
}

/** Stable JSON: object keys sorted recursively, numbers normalised, Dates tagged. No whitespace. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalize(value, "$"));
}

// ---------------------------------------------------------------------------
// Chart cache key
// ---------------------------------------------------------------------------

export type CacheInputQuality = "recorded" | "rectified" | "untimed" | "partial";

export type CivilTimeSemantics =
  | "utc-instant"
  | "civil-iana"
  | "civil-fixed-offset"
  | "local-mean-time";

export type CacheKeyChartDate =
  | { kind: "utc"; iso: string }
  | {
      kind: "local";
      year: number;
      month: number;
      day: number;
      hour: number;
      minute: number;
      second: number;
    };

export interface CacheEphemerisIdentity {
  /** "swiss" | "moshier" | "jpl" (as reported by Swiss Ephemeris) or "none" for ephemeris-free math. */
  kind: string;
  /** Swiss Ephemeris version when known, else null. */
  swissEphemerisVersion: string | null;
  /** Free-form data-set identity (for example the file set); null when not tracked. */
  dataSet: string | null;
}

export interface ChartCacheKeyComponents {
  /** Normalised date (see `normalizeChartDate`). */
  date: CacheKeyChartDate;
  timeSemantics: CivilTimeSemantics;
  /** IANA zone used, or null when an explicit offset / UTC was used. */
  timeZone: string | null;
  /** Offset in minutes (east positive) that was actually applied; null only for `utc-instant`. */
  resolvedUtcOffsetMinutes: number | null;
  latitude: number;
  longitude: number;
  quality: CacheInputQuality;
  /** House system codes ("P", "W", ...); treated as a set. Empty array = houses not computed. */
  houseSystems: readonly string[];
  /** Point selection (chart point keys); treated as a set. */
  points: readonly string[];
  /** Orb policy object or identifier; use `null` only for "no aspects computed". */
  orbPolicy: unknown;
  /** Zodiac / nakshatra frame: "tropical" | "lahiri" | "dhruva" | other identifier. */
  frame: string;
  nodeConvention: "mean" | "true" | null;
  yearLengthDays: number | null;
  /** Dhruva GC constants (or null when not applicable). */
  gcConstants: unknown;
  ephemeris: CacheEphemerisIdentity;
  /** Defaults to this package's version; override only to key by a different producer. */
  packageVersion?: string;
  /** Any other configuration that can change the result. */
  extra?: Record<string, unknown>;
}

const REQUIRED_COMPONENTS = [
  "date",
  "timeSemantics",
  "timeZone",
  "resolvedUtcOffsetMinutes",
  "latitude",
  "longitude",
  "quality",
  "houseSystems",
  "points",
  "orbPolicy",
  "frame",
  "nodeConvention",
  "yearLengthDays",
  "gcConstants",
  "ephemeris",
] as const satisfies readonly (keyof ChartCacheKeyComponents)[];

/** Names of the components `buildChartCacheKey` requires (explicit `null` is allowed where documented). */
export const CHART_CACHE_KEY_REQUIRED_COMPONENTS: readonly string[] = REQUIRED_COMPONENTS;

export const PACKAGE_VERSION: string = packageJson.version;

function normalizeSet(name: string, value: readonly string[]): string[] {
  if (!Array.isArray(value)) {
    throw new CacheKeyError("INVALID_COMPONENT", `"${name}" must be an array of strings.`, name);
  }
  for (const item of value) {
    if (typeof item !== "string") {
      throw new CacheKeyError("INVALID_COMPONENT", `"${name}" must contain only strings.`, name);
    }
  }
  return [...new Set(value)].sort();
}

/**
 * Normalise a `BirthChartOptions.date` to its canonical key form. A `Date` is read with local
 * getters (the same convention `getBirthChart` uses), so the key matches the calculation.
 */
export function normalizeChartDate(date: Date | LocalDateTimeParts): CacheKeyChartDate {
  if (date instanceof Date) {
    if (Number.isNaN(date.getTime())) {
      throw new CacheKeyError("INVALID_COMPONENT", "Invalid Date.", "date");
    }
    return {
      kind: "local",
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
    };
  }
  return {
    kind: "local",
    year: date.year,
    month: date.month,
    day: date.day,
    hour: date.hour ?? 0,
    minute: date.minute ?? 0,
    second: date.second ?? 0,
  };
}

/** Canonical form of an already-UTC instant. */
export function normalizeUtcInstant(instant: Date | string): CacheKeyChartDate {
  const date = instant instanceof Date ? instant : new Date(instant);
  if (Number.isNaN(date.getTime())) {
    throw new CacheKeyError("INVALID_COMPONENT", "Invalid UTC instant.", "date");
  }
  return { kind: "utc", iso: date.toISOString() };
}

/**
 * Offset (minutes, east positive) between local wall-clock parts and the UTC instant they
 * resolved to, for example `resolveUtcOffsetMinutes(localParts, chart.dateUtc)`.
 */
export function resolveUtcOffsetMinutes(
  local: LocalDateTimeParts,
  dateUtc: Date
): number {
  const asUtc = Date.UTC(
    local.year,
    local.month - 1,
    local.day,
    local.hour ?? 0,
    local.minute ?? 0,
    local.second ?? 0
  );
  return normalizeKeyNumber((asUtc - dateUtc.getTime()) / 60000);
}

/** Ephemeris identity read from the running engine (pass `getSwissEphInfo()`); `kind` falls back to "unknown". */
export function ephemerisIdentityFromInfo(info: {
  probe: { ephemeris: string | null } | null;
  swissEphemerisVersion: string | null;
  ephemerisFiles: { found: string[] };
}): CacheEphemerisIdentity {
  return {
    kind: info.probe?.ephemeris ?? "unknown",
    swissEphemerisVersion: info.swissEphemerisVersion,
    dataSet: info.ephemerisFiles.found.length ? [...info.ephemerisFiles.found].sort().join(",") : null,
  };
}

/**
 * Build the cache key for a chart-level result. Throws `CacheKeyError("MISSING_COMPONENT")`
 * when any required component is `undefined`.
 */
export function buildChartCacheKey(components: ChartCacheKeyComponents): string {
  if (components === null || typeof components !== "object") {
    throw new CacheKeyError("INVALID_COMPONENT", "Cache key components must be an object.");
  }
  const record = components as unknown as Record<string, unknown>;
  const missing = REQUIRED_COMPONENTS.filter((name) => record[name] === undefined);
  if (missing.length > 0) {
    throw new CacheKeyError(
      "MISSING_COMPONENT",
      `Missing required cache key component(s): ${missing.join(", ")}. Use null where a component does not apply.`,
      missing[0]
    );
  }
  const eph = components.ephemeris;
  if (eph === null || typeof eph !== "object" || eph.kind === undefined || eph.swissEphemerisVersion === undefined || eph.dataSet === undefined) {
    throw new CacheKeyError(
      "MISSING_COMPONENT",
      "ephemeris must provide kind, swissEphemerisVersion and dataSet (null when unknown).",
      "ephemeris"
    );
  }
  const body = {
    keyVersion: CACHE_KEY_VERSION,
    kind: "chart",
    packageVersion: components.packageVersion ?? PACKAGE_VERSION,
    date: components.date,
    timeSemantics: components.timeSemantics,
    timeZone: components.timeZone,
    resolvedUtcOffsetMinutes: components.resolvedUtcOffsetMinutes,
    latitude: components.latitude,
    longitude: components.longitude,
    quality: components.quality,
    houseSystems: normalizeSet("houseSystems", components.houseSystems),
    points: normalizeSet("points", components.points),
    orbPolicy: components.orbPolicy,
    frame: components.frame,
    nodeConvention: components.nodeConvention,
    yearLengthDays: components.yearLengthDays,
    gcConstants: components.gcConstants,
    ephemeris: components.ephemeris,
    extra: components.extra ?? {},
  };
  return `kaabalah:chart:v${CACHE_KEY_VERSION}:${canonicalJson(body)}`;
}

// ---------------------------------------------------------------------------
// Bounded LRU memo
// ---------------------------------------------------------------------------

export interface BoundedMemoOptions {
  /** Maximum number of entries (>= 1). Least recently used entries are evicted first. */
  maxEntries: number;
}

export interface BoundedMemoStats {
  size: number;
  maxEntries: number;
  hits: number;
  misses: number;
  evictions: number;
}

export interface BoundedMemo<T> {
  get(key: string): T | undefined;
  has(key: string): boolean;
  set(key: string, value: T): void;
  /** Return the cached value or compute, store and return it. Concurrent calls share one computation; failures are not cached. */
  getOrCompute(key: string, compute: () => T | Promise<T>): T | Promise<T>;
  delete(key: string): boolean;
  clear(): void;
  readonly size: number;
  stats(): BoundedMemoStats;
}

/**
 * Small LRU memo keyed by strings from `buildChartCacheKey`. Because keys embed the full
 * configuration, two incompatible configurations can never share an entry.
 */
export function createBoundedMemo<T>(options: BoundedMemoOptions): BoundedMemo<T> {
  const max = options?.maxEntries;
  if (!Number.isInteger(max) || max < 1) {
    throw new CacheKeyError("INVALID_CACHE_OPTION", "maxEntries must be an integer >= 1.");
  }
  const map = new Map<string, T>();
  let hits = 0;
  let misses = 0;
  let evictions = 0;

  const touch = (key: string, value: T) => {
    map.delete(key);
    map.set(key, value);
  };
  const store = (key: string, value: T) => {
    touch(key, value);
    while (map.size > max) {
      const oldest = map.keys().next().value as string;
      map.delete(oldest);
      evictions += 1;
    }
  };

  return {
    get(key) {
      if (!map.has(key)) return undefined;
      const value = map.get(key) as T;
      touch(key, value);
      return value;
    },
    has: (key) => map.has(key),
    set: store,
    getOrCompute(key, compute) {
      if (map.has(key)) {
        hits += 1;
        const value = map.get(key) as T;
        touch(key, value);
        return value;
      }
      misses += 1;
      const result = compute();
      if (result instanceof Promise) {
        // Store the in-flight promise so concurrent callers share it; drop it on failure.
        store(key, result as unknown as T);
        result.catch(() => {
          if (map.get(key) === (result as unknown as T)) map.delete(key);
        });
        return result;
      }
      store(key, result);
      return result;
    },
    delete: (key) => map.delete(key),
    clear() {
      map.clear();
    },
    get size() {
      return map.size;
    },
    stats: () => ({ size: map.size, maxEntries: max, hits, misses, evictions }),
  };
}
