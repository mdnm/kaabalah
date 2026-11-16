/**
 * Capability discovery: a versioned, JSON-serialisable description of what this build of
 * kaabalah can compute, with the limits it enforces. Lets callers (and agents) check support
 * instead of inspecting bundles or catching failures.
 *
 * `getCapabilities()` never throws and never initialises the engine; ephemeris coverage is
 * taken from `getSwissEphInfo()` when the engine is initialised and otherwise reported as the
 * static shipped range, flagged `source: "static"`.
 *
 * `assertEphemerisReady()` turns a missing runtime or missing data into an actionable
 * `SwissEphError` (existing codes; no competing error hierarchy).
 */

import { DEFAULT_ASPECT_SPECS } from "./aspects";
import { COLLECTION_HARD_LIMITS, COLLECTION_METHOD_VERSION } from "./collection";
import { CACHE_KEY_VERSION, PACKAGE_VERSION } from "./cache-key";
import { DHRUVA_CONSTANTS, JYOTISH_METHODS } from "./jyotish";
import {
  HouseSystem,
  PLANET_AND_NODE_NAMES,
  Planet,
  REQUIRED_EPHE_FILES,
  SwissEphError,
  getSwissEphInfo,
} from "./swisseph";
import {
  MAX_CANDIDATE_DATES,
  MAX_SCHEDULE_YEAR,
  MAX_TIMELINE_INTERVALS_HARD_CAP,
  MAX_TIMELINE_RANGE_DAYS,
  SCHEDULE_METHOD_VERSION,
  type LifePathMethod,
  type MasterPolicy,
  type ShortMonthPolicy,
} from "../numerology/schedule-types";
import { TIMELINE_LAYERS } from "../numerology/schedule";

export const CAPABILITIES_SCHEMA_VERSION = 1;

export const KAABALAH_MODULES = [
  "core",
  "numerology",
  "astrology",
  "gematria",
  "tarot",
  "iching",
  "ifa",
  "semantic",
  "visual",
] as const;

export const INPUT_QUALITY_KINDS = [
  {
    id: "recorded",
    timed: true,
    description: "Birth time recorded by a source; angles, houses and Moon degree are used.",
  },
  {
    id: "rectified",
    timed: true,
    description: "Birth time derived by rectification; angles are marked and may be excluded by analysis selectors.",
  },
  {
    id: "untimed",
    timed: false,
    description: "Birth time unknown; noon positions are placeholders; Moon degree, angles, houses and lots are withheld.",
  },
  {
    id: "partial",
    timed: false,
    description: "Date or time only partly known; treated like untimed for time-dependent points.",
  },
] as const;

export interface CapabilityPoint {
  /** Key used in `BirthChart.planets` (lower-cased display name). */
  key: string;
  name: string;
  swissId: number | null;
}

export interface Capabilities {
  schemaVersion: number;
  kind: "kaabalah-capabilities";
  packageVersion: string;
  modules: string[];
  astrology: {
    houseSystems: { id: string; name: string }[];
    /** Points available from the ephemeris (chart planets/nodes/asteroids) plus derived chart angles. */
    points: CapabilityPoint[];
    derivedPoints: string[];
    virtualPoints: string[];
    aspects: { name: string; angle: number; defaultOrb: number }[];
    zodiacFrames: { id: "tropical" | "lahiri" | "dhruva"; kind: "zodiac" | "nakshatra"; description: string }[];
    nodeConventions: ("mean" | "true")[];
    defaults: {
      houseSystem: string;
      nodeConvention: "mean" | "true";
      nakshatraFrame: "dhruva" | "lahiri";
      yearLengthDays: { dhruva: number; lahiri: number };
    };
    gcConstants: { dhruva: Record<string, number> };
    methods: { jyotish: string; collection: string; cacheKey: number };
    inputQualities: { id: string; timed: boolean; description: string }[];
    ephemeris: {
      initialized: boolean;
      /** "runtime" when read from the initialised engine, "static" when only the shipped range is known. */
      coverageSource: "runtime" | "static";
      coverage: { fromYear: number; toYearExclusive: number; note: string };
      requiredFiles: string[];
      missingFiles: string[];
      swissEphemerisVersion: string | null;
      strictEphemeris: boolean;
      substitutionNote: string;
    };
  };
  numerology: {
    methodVersion: string;
    layers: string[];
    lifePathMethods: LifePathMethod[];
    masterPolicies: MasterPolicy[];
    shortMonthPolicies: ShortMonthPolicy[];
  };
  limits: {
    collection: { maxPeople: number; maxEvents: number; maxPairs: number; maxConcurrency: number };
    numerology: {
      maxScheduleYear: number;
      maxTimelineRangeDays: number;
      maxTimelineIntervals: number;
      maxCandidateDates: number;
    };
  };
  errors: { swissEph: string[]; collection: string[]; cacheKey: string[] };
}

const LIFE_PATH_METHODS: LifePathMethod[] = ["kaabalistic", "straight-across"];
const MASTER_POLICIES: MasterPolicy[] = ["preserve", "reduce"];
const SHORT_MONTH_POLICIES: ShortMonthPolicy[] = ["next-month-first", "clamp", "overflow"];

const SWISS_ERROR_CODES = [
  "SWISSEPH_NOT_INITIALIZED",
  "SWISSEPH_ASSET_NOT_FOUND",
  "SWISSEPH_NODE_BUILTINS_UNAVAILABLE",
  "SWISSEPH_EPHEMERIS_FILES_UNAVAILABLE",
  "SWISSEPH_EPHEMERIS_FILE_UNAVAILABLE",
  "SWISSEPH_DATE_OUT_OF_RANGE",
  "SWISSEPH_EPHEMERIS_MISMATCH",
  "SWISSEPH_CALCULATION_FAILED",
  "SWISSEPH_STATE_MISUSE",
] as const;

const COLLECTION_ERROR_CODES = [
  "INVALID_MANIFEST",
  "DUPLICATE_ID",
  "UNKNOWN_PAIR_ID",
  "SELF_PAIR",
  "MANIFEST_TOO_LARGE",
  "INVALID_OPTION",
  "ABORTED",
] as const;

const CACHE_KEY_ERROR_CODES = ["MISSING_COMPONENT", "INVALID_COMPONENT", "INVALID_CACHE_OPTION"] as const;

function listPoints(): CapabilityPoint[] {
  const points: CapabilityPoint[] = [];
  for (const [id, name] of Object.entries(PLANET_AND_NODE_NAMES)) {
    const numeric = Number(id);
    const swissId = Number.isInteger(numeric) && Planet[numeric] !== undefined ? numeric : null;
    if (swissId === null) continue; // virtual points are listed separately
    points.push({ key: name.toLowerCase(), name, swissId });
  }
  return points;
}

/** Describe what this build supports. Pure and cheap; the result is a fresh JSON-serialisable object. */
export function getCapabilities(): Capabilities {
  const info = getSwissEphInfo();
  const virtualPoints = Object.entries(PLANET_AND_NODE_NAMES)
    .filter(([id]) => !Number.isInteger(Number(id)))
    .map(([, name]) => name.toLowerCase());

  return {
    schemaVersion: CAPABILITIES_SCHEMA_VERSION,
    kind: "kaabalah-capabilities",
    packageVersion: PACKAGE_VERSION,
    modules: [...KAABALAH_MODULES],
    astrology: {
      houseSystems: (Object.entries(HouseSystem) as [string, string][]).map(([name, id]) => ({ id, name })),
      points: listPoints(),
      derivedPoints: ["ascendant", "mc", "descendant", "ic"],
      virtualPoints,
      aspects: DEFAULT_ASPECT_SPECS.map((s) => ({ name: s.name, angle: s.angle, defaultOrb: s.orb })),
      zodiacFrames: [
        { id: "tropical", kind: "zodiac", description: "Tropical ecliptic longitude of date (default for charts)." },
        { id: "lahiri", kind: "nakshatra", description: JYOTISH_METHODS.lahiri.name },
        { id: "dhruva", kind: "nakshatra", description: JYOTISH_METHODS.dhruva.name },
      ],
      nodeConventions: ["mean", "true"],
      defaults: {
        houseSystem: HouseSystem.PLACIDUS,
        nodeConvention: "mean",
        nakshatraFrame: "dhruva",
        yearLengthDays: {
          dhruva: DHRUVA_CONSTANTS.yearLengthDays,
          lahiri: JYOTISH_METHODS.lahiri.referenceYearLengthDays,
        },
      },
      gcConstants: { dhruva: { ...DHRUVA_CONSTANTS } },
      methods: {
        jyotish: JYOTISH_METHODS.version,
        collection: COLLECTION_METHOD_VERSION,
        cacheKey: CACHE_KEY_VERSION,
      },
      inputQualities: INPUT_QUALITY_KINDS.map((q) => ({ ...q })),
      ephemeris: {
        initialized: info.initialized,
        coverageSource: info.initialized ? "runtime" : "static",
        coverage: { ...info.shippedCoverage },
        requiredFiles: [...REQUIRED_EPHE_FILES],
        missingFiles: info.initialized ? [...info.ephemerisFiles.missing] : [...REQUIRED_EPHE_FILES],
        swissEphemerisVersion: info.swissEphemerisVersion,
        strictEphemeris: info.strictEphemeris,
        substitutionNote: info.shippedCoverage.note,
      },
    },
    numerology: {
      methodVersion: SCHEDULE_METHOD_VERSION,
      layers: [...TIMELINE_LAYERS],
      lifePathMethods: [...LIFE_PATH_METHODS],
      masterPolicies: [...MASTER_POLICIES],
      shortMonthPolicies: [...SHORT_MONTH_POLICIES],
    },
    limits: {
      collection: { ...COLLECTION_HARD_LIMITS },
      numerology: {
        maxScheduleYear: MAX_SCHEDULE_YEAR,
        maxTimelineRangeDays: MAX_TIMELINE_RANGE_DAYS,
        maxTimelineIntervals: MAX_TIMELINE_INTERVALS_HARD_CAP,
        maxCandidateDates: MAX_CANDIDATE_DATES,
      },
    },
    errors: {
      swissEph: [...SWISS_ERROR_CODES],
      collection: [...COLLECTION_ERROR_CODES],
      cacheKey: [...CACHE_KEY_ERROR_CODES],
    },
  };
}

export interface EphemerisReadinessOptions {
  /** Require coverage of this civil year (Swiss files cover [fromYear, toYearExclusive)). */
  year?: number;
}

/**
 * Throw an actionable `SwissEphError` unless the engine is initialised, the required
 * ephemeris files are visible and (optionally) the requested year is covered.
 */
export function assertEphemerisReady(options: EphemerisReadinessOptions = {}): void {
  const info = getSwissEphInfo();
  if (!info.initialized) {
    throw new SwissEphError(
      "SWISSEPH_NOT_INITIALIZED",
      "Swiss Ephemeris is not initialised. Call `await getSwissEph({ wasmPath, ephePath })` once before computing charts " +
        "(set WASM_PATH / EPHE_PATH, or use the packaged wasm/ and ephe/ directories).",
      { required: [...REQUIRED_EPHE_FILES] }
    );
  }
  if (info.ephemerisFiles.missing.length > 0) {
    throw new SwissEphError(
      "SWISSEPH_EPHEMERIS_FILES_UNAVAILABLE",
      `Swiss Ephemeris data files are missing: ${info.ephemerisFiles.missing.join(", ")}. ` +
        `Place them in the ephemeris path (${info.ephePath ?? "unset"}); without them calculations fall back to Moshier or fail in strict mode.`,
      { missing: [...info.ephemerisFiles.missing], ephePath: info.ephePath }
    );
  }
  if (options.year !== undefined) {
    const { fromYear, toYearExclusive } = info.shippedCoverage;
    if (!Number.isFinite(options.year) || options.year < fromYear || options.year >= toYearExclusive) {
      throw new SwissEphError(
        "SWISSEPH_DATE_OUT_OF_RANGE",
        `Year ${options.year} is outside the shipped ephemeris coverage ${fromYear}-${toYearExclusive - 1}. ` +
          "Provide ephemeris files that cover it, or accept Moshier fallback outside strict mode.",
        { year: options.year, fromYear, toYearExclusive }
      );
    }
  }
}
