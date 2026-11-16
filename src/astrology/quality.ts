/**
 * Quality-aware chart input: recorded / rectified / untimed / partial.
 *
 *  - recorded : full chart from a documented birth time.
 *  - rectified: full chart, but every time-dependent value (Moon degree, angles, vertex,
 *               lots) is flagged `rectified: true`; analysis selectors can drop rectified angles.
 *  - untimed  : positions at LOCAL NOON, every point flagged `placeholder: true`. The
 *               normalized analysis set omits the Moon degree, angles, houses, lots, sect and
 *               time-dependent techniques, each with a structured `unavailable` reason. The
 *               whole-day Moon sign range (local 00:00 to the next local 00:00) and any other
 *               body changing sign that day are reported instead.
 *  - partial  : no full date; no chart is invented, only structured unavailability.
 *
 * Time and place assumptions are returned as `TimeProvenance`. Wall-clock input reuses
 * `LocalDateTimeParts` / `TimeZoneOptions` from `./swisseph` (no second representation).
 *
 * `getBirthChart` lives in `./index`, which re-exports this module, so it is loaded lazily
 * (or injected through `computeChart`) to avoid an import cycle at evaluation time.
 */

import { addCivilDays } from "../civil-date";
import type { BirthChartOptions, ComputedBirthChart } from "./index";
import {
  type ChartPoint,
  chartPointsFromPlanetPositions,
  getChartPoints,
  type PointClass,
  type PointId,
} from "./points";
import {
  calculatePlanetaryPositions,
  calculateSinglePlanetPosition,
  type HouseSystem,
  type LocalDateTimeParts,
  normalizeAngle,
  Planet,
  type TimeZoneOptions,
  toUtcDate,
} from "./swisseph";

export type InputQuality = "recorded" | "rectified" | "untimed" | "partial";
export type PlaceRole = "birthplace" | "residence" | "event" | "unknown";

export interface PartialDateParts {
  year?: number;
  month?: number;
  day?: number;
}

export const ZODIAC_SIGN_KEYS = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
] as const;
export type ZodiacSignKey = (typeof ZODIAC_SIGN_KEYS)[number];

export type InputQualityErrorCode =
  | "INVALID_QUALITY"
  | "INCOMPLETE_DATE"
  | "MISSING_TIME"
  | "MISSING_LOCATION"
  | "INVALID_DATE";

export class InputQualityError extends Error {
  readonly code: InputQualityErrorCode;
  constructor(code: InputQualityErrorCode, message: string) {
    super(message);
    this.name = "InputQualityError";
    this.code = code;
  }
}

export type ChartUnavailableReason = "birth-time-unknown" | "date-incomplete" | "excluded-by-selector";

export interface UnavailableItem {
  item:
    | "chart"
    | "moon-degree"
    | "angles"
    | "houses"
    | "lots"
    | "sect"
    | "time-dependent-techniques"
    | "rectified-angles";
  reason: ChartUnavailableReason;
  message: string;
  pointIds?: PointId[];
  /** For `time-dependent-techniques`: the techniques that cannot be run. */
  techniques?: string[];
}

export interface SignIngress {
  fromSign: ZodiacSignKey;
  toSign: ZodiacSignKey;
  atUtc: Date;
}

export interface MoonDayRange {
  /** One sign, or two in order when the Moon changes sign during the day. */
  signs: ZodiacSignKey[];
  changesSign: boolean;
  /** First ingress during the interval, when the sign changes. */
  ingress?: SignIngress;
  startUtc: Date;
  endUtc: Date;
  /** Interval is local 00:00 of the date to local 00:00 of the next date (zone rules applied). */
  interval: "local-midnight-to-local-midnight";
  degreesExcluded: true;
}

export interface BodySignChange {
  id: PointId;
  signs: ZodiacSignKey[];
  ingresses: SignIngress[];
}

export type TimeBasis =
  | "iana-zone"
  | "utc-offset"
  | "auto-from-coordinates"
  | "utc-instant"
  | "local-mean-time"
  | "unknown-place";

export interface TimeProvenance {
  basis: TimeBasis;
  /** IANA zone when known (explicit, resolver, or tz-lookup); undefined for offsets, UTC, LMT. */
  ianaZone?: string;
  /** Resolved offset of the reference instant, minutes east of UTC (fractional for LMT); null if unknown. */
  utcOffsetMinutes: number | null;
  /** DST in effect at the reference instant; null when it cannot be determined. */
  dst: boolean | null;
  /** The input was already a UTC instant (`treatAsUTC`). */
  alreadyUtc: boolean;
  /** Longitude-based local mean time was chosen instead of a zone's civil time. */
  localMeanTime: boolean;
  /** Reference instant: the given time (timed) or local noon (untimed). `null` for partial dates. */
  referenceInstantUtc: Date | null;
  placeRole: PlaceRole;
  /** Latitude/longitude were supplied. */
  placeKnown: boolean;
  notes: string[];
}

export interface AnalysisSelection {
  include?: readonly PointId[];
  exclude?: readonly PointId[];
  classes?: readonly PointClass[];
  /** Drop angles (ASC/MC/DSC/IC/Vertex) that came from a rectified time. */
  excludeRectifiedAngles?: boolean;
}

export interface QualifiedChartInput {
  quality: InputQuality;
  date: Date | LocalDateTimeParts | PartialDateParts;
  latitude?: number;
  longitude?: number;
  houseSystem?: HouseSystem;
  timeZoneSettings?: TimeZoneOptions;
  /**
   * Read the wall-clock parts as local mean time of `longitude` (4 minutes per degree east
   * of Greenwich), for pre-standard-time records. Overrides `timeZoneSettings`.
   */
  localMeanTime?: boolean;
  placeRole?: PlaceRole;
  analysis?: AnalysisSelection;
  /** Injected chart function (defaults to `getBirthChart` from `./index`, loaded lazily). */
  computeChart?: (options: BirthChartOptions) => Promise<ComputedBirthChart>;
}

export interface QualifiedChart {
  quality: InputQuality;
  /** `complete`: everything computed; `limited`: untimed; `unavailable`: partial. */
  status: "complete" | "limited" | "unavailable";
  /** Full chart for recorded/rectified; always `null` for untimed and partial. */
  chart: ComputedBirthChart | null;
  /** Every computed point with provenance flags (placeholder / rectified). */
  points: ChartPoint[];
  /** Normalized point set to feed analysis (untimed: no Moon, angles, lots; selectors applied). */
  analysisPoints: ChartPoint[];
  unavailable: UnavailableItem[];
  /** Untimed only. */
  moonDayRange?: MoonDayRange;
  /** Untimed only: other bodies that change sign during the local day. */
  signChanges?: BodySignChange[];
  provenance: TimeProvenance;
}

// ── Helpers ─────────────────────────────────────────────────────────────

const MS_PER_MIN = 60_000;
const ANGLE_IDS: PointId[] = ["asc", "mc", "dsc", "ic", "vertex"];

function hasFullDate(d: unknown): d is Date | LocalDateTimeParts {
  if (d instanceof Date) return !Number.isNaN(d.getTime());
  const p = d as PartialDateParts;
  return !!p && Number.isInteger(p.year) && Number.isInteger(p.month) && Number.isInteger(p.day);
}

function partsOf(date: Date | LocalDateTimeParts): LocalDateTimeParts {
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

function utcFromParts(p: LocalDateTimeParts): number {
  const d = new Date(0);
  d.setUTCFullYear(p.year, p.month - 1, p.day);
  d.setUTCHours(p.hour ?? 0, p.minute ?? 0, p.second ?? 0, 0);
  return d.getTime();
}

function hasPlace(input: QualifiedChartInput): boolean {
  return typeof input.latitude === "number" && typeof input.longitude === "number";
}

function hasExplicitZone(tz: TimeZoneOptions): boolean {
  return (
    tz.treatAsUTC === true ||
    (typeof tz.utcOffsetMinutes === "number" && Number.isFinite(tz.utcOffsetMinutes)) ||
    !!tz.timeZone
  );
}

interface ResolvedInstant {
  instant: Date;
  basis: TimeBasis;
}

/** Resolve wall-clock parts to a UTC instant following the same rules as `getBirthChart`. */
async function resolveInstant(parts: LocalDateTimeParts, input: QualifiedChartInput): Promise<ResolvedInstant> {
  const tz = input.timeZoneSettings ?? { autoTimeZone: true };
  if (input.localMeanTime) {
    if (typeof input.longitude !== "number") {
      throw new InputQualityError("MISSING_LOCATION", "localMeanTime requires a longitude");
    }
    return {
      instant: new Date(utcFromParts(parts) - input.longitude * 4 * MS_PER_MIN),
      basis: "local-mean-time",
    };
  }
  if (tz.treatAsUTC === true) {
    return { instant: new Date(utcFromParts(parts)), basis: "utc-instant" };
  }
  if (!hasPlace(input) && !hasExplicitZone(tz)) {
    // Unknown place and no zone: the only defensible approximation is UTC.
    return { instant: new Date(utcFromParts(parts)), basis: "unknown-place" };
  }
  const instant = await toUtcDate(parts, input.latitude, input.longitude, tz);
  const basis: TimeBasis =
    typeof tz.utcOffsetMinutes === "number" && Number.isFinite(tz.utcOffsetMinutes)
      ? "utc-offset"
      : tz.timeZone
        ? "iana-zone"
        : "auto-from-coordinates";
  return { instant, basis };
}

async function lookupZone(input: QualifiedChartInput, parts: LocalDateTimeParts): Promise<string | undefined> {
  const tz = input.timeZoneSettings ?? { autoTimeZone: true };
  if (tz.timeZone) return tz.timeZone;
  if (!hasPlace(input)) return undefined;
  const lat = input.latitude as number;
  const lon = input.longitude as number;
  const fromResolver = tz.resolveTimeZone?.(lat, lon, parts);
  if (fromResolver) return fromResolver;
  if (tz.autoTimeZone === false) return undefined;
  try {
    const mod: any = await import("tz-lookup");
    const lookup = mod.default ?? mod;
    return lookup(lat, lon) || undefined;
  } catch {
    return undefined;
  }
}

async function offsetMinutesAt(parts: LocalDateTimeParts, zone: string): Promise<number> {
  const instant = await toUtcDate(parts, undefined, undefined, { timeZone: zone });
  return Math.round((utcFromParts(parts) - instant.getTime()) / MS_PER_MIN);
}

/**
 * Describe how the reference instant was obtained: IANA zone and resolved DST offset,
 * already-UTC input, historical local-mean-time choice, birthplace vs residence, unknown place.
 * `reference` is the full local date-time to resolve (use noon for untimed charts).
 */
export async function resolveTimeProvenance(
  input: QualifiedChartInput,
  reference: LocalDateTimeParts | null
): Promise<TimeProvenance> {
  const placeRole = input.placeRole ?? "unknown";
  const placeKnown = hasPlace(input);
  const notes: string[] = [];
  if (placeRole === "residence") {
    notes.push("place is a residence: returns computed here differ from birthplace returns");
  } else if (placeRole === "birthplace") {
    notes.push("place is the birthplace");
  }
  if (!placeKnown) notes.push("no coordinates supplied: houses, angles and zone lookup unavailable");

  if (!reference) {
    return {
      basis: hasExplicitZone(input.timeZoneSettings ?? {}) ? "iana-zone" : "unknown-place",
      utcOffsetMinutes: null,
      dst: null,
      alreadyUtc: false,
      localMeanTime: false,
      referenceInstantUtc: null,
      placeRole,
      placeKnown,
      notes: [...notes, "date incomplete: no reference instant"],
    };
  }

  const { instant, basis } = await resolveInstant(reference, input);
  const offsetMinutes =
    basis === "utc-instant"
      ? 0
      : basis === "unknown-place"
        ? 0
        : (utcFromParts(reference) - instant.getTime()) / MS_PER_MIN;

  let ianaZone: string | undefined;
  let dst: boolean | null = null;
  if (basis === "iana-zone" || basis === "auto-from-coordinates") {
    ianaZone = await lookupZone(input, reference);
    if (ianaZone) {
      const year = reference.year;
      const jan = await offsetMinutesAt({ year, month: 1, day: 1, hour: 12 }, ianaZone);
      const jul = await offsetMinutesAt({ year, month: 7, day: 1, hour: 12 }, ianaZone);
      dst = jan === jul ? false : offsetMinutes > Math.min(jan, jul);
    }
  }
  if (basis === "utc-offset") notes.push("explicit UTC offset: DST state not determinable");
  if (basis === "unknown-place") notes.push("unknown place: wall-clock read as UTC");
  if (basis === "local-mean-time") notes.push("local mean time = longitude / 15 hours from UT (no standard-time zone)");
  if (basis === "utc-instant") notes.push("input already a UTC instant: no zone conversion");

  return {
    basis,
    ...(ianaZone ? { ianaZone } : {}),
    utcOffsetMinutes: basis === "unknown-place" ? null : offsetMinutes,
    dst,
    alreadyUtc: basis === "utc-instant",
    localMeanTime: basis === "local-mean-time",
    referenceInstantUtc: instant,
    placeRole,
    placeKnown,
    notes,
  };
}

// ── Sign scanning ───────────────────────────────────────────────────────

const signIndex = (lon: number) => Math.floor(normalizeAngle(lon) / 30) % 12;

function scanSignPath(planet: Planet, startMs: number, endMs: number) {
  const steps = 24;
  const lon = (ms: number) => calculateSinglePlanetPosition(new Date(ms), planet).longitude;
  const path: number[] = [signIndex(lon(startMs))];
  const ingresses: Array<{ from: number; to: number; atMs: number }> = [];
  let prevMs = startMs;
  let prevSign = path[0];
  for (let i = 1; i <= steps; i++) {
    const ms = startMs + ((endMs - startMs) * i) / steps;
    const sign = signIndex(lon(ms));
    if (sign !== prevSign) {
      let lo = prevMs;
      let hi = ms;
      for (let k = 0; k < 40; k++) {
        const mid = (lo + hi) / 2;
        if (signIndex(lon(mid)) === prevSign) lo = mid;
        else hi = mid;
      }
      ingresses.push({ from: prevSign, to: sign, atMs: hi });
      path.push(sign);
    }
    prevMs = ms;
    prevSign = sign;
  }
  return { path, ingresses };
}

const toIngress = (i: { from: number; to: number; atMs: number }): SignIngress => ({
  fromSign: ZODIAC_SIGN_KEYS[i.from],
  toSign: ZODIAC_SIGN_KEYS[i.to],
  atUtc: new Date(i.atMs),
});

/** Moon sign(s) between two instants plus the first ingress (Moon never stations, so at most one per day). */
export function getMoonSignRange(startUtc: Date, endUtc: Date): MoonDayRange {
  const { path, ingresses } = scanSignPath(Planet.MOON, startUtc.getTime(), endUtc.getTime());
  return {
    signs: [...new Set(path)].map((s) => ZODIAC_SIGN_KEYS[s]),
    changesSign: ingresses.length > 0,
    ...(ingresses.length ? { ingress: toIngress(ingresses[0]) } : {}),
    startUtc,
    endUtc,
    interval: "local-midnight-to-local-midnight",
    degreesExcluded: true,
  };
}

const SIGN_SCAN_BODIES: Array<[PointId, Planet]> = [
  ["sun", Planet.SUN],
  ["mercury", Planet.MERCURY],
  ["venus", Planet.VENUS],
  ["mars", Planet.MARS],
  ["jupiter", Planet.JUPITER],
  ["saturn", Planet.SATURN],
  ["uranus", Planet.URANUS],
  ["neptune", Planet.NEPTUNE],
  ["pluto", Planet.PLUTO],
  ["mean-node", Planet.MEAN_NODE],
  ["true-node", Planet.TRUE_NODE],
  ["mean-lilith", Planet.LILITH_MEAN],
  ["true-lilith", Planet.LILITH_TRUE],
  ["chiron", Planet.CHIRON],
];

/** Bodies other than the Moon that change sign between two instants (south nodes mirror their north node). */
export function getSignChangesBetween(startUtc: Date, endUtc: Date): BodySignChange[] {
  const out: BodySignChange[] = [];
  for (const [id, planet] of SIGN_SCAN_BODIES) {
    const { path, ingresses } = scanSignPath(planet, startUtc.getTime(), endUtc.getTime());
    if (ingresses.length === 0) continue;
    out.push({
      id,
      signs: [...new Set(path)].map((s) => ZODIAC_SIGN_KEYS[s]),
      ingresses: ingresses.map(toIngress),
    });
    const south: PointId | null = id === "mean-node" ? "south-node-mean" : id === "true-node" ? "south-node-true" : null;
    if (south) {
      const shift = (s: number) => (s + 6) % 12;
      out.push({
        id: south,
        signs: [...new Set(path)].map((s) => ZODIAC_SIGN_KEYS[shift(s)]),
        ingresses: ingresses.map((i) => toIngress({ from: shift(i.from), to: shift(i.to), atMs: i.atMs })),
      });
    }
  }
  return out;
}

// ── Analysis selection ──────────────────────────────────────────────────

/** Apply include/exclude/classes and the rectified-angle selector to a point list. */
export function selectAnalysisPoints(points: readonly ChartPoint[], selection: AnalysisSelection = {}): ChartPoint[] {
  const include = selection.include ? new Set<PointId>(selection.include) : null;
  const exclude = selection.exclude ? new Set<PointId>(selection.exclude) : null;
  const classes = selection.classes ? new Set<PointClass>(selection.classes) : null;
  return points.filter(
    (p) =>
      (!include || include.has(p.id)) &&
      (!exclude || !exclude.has(p.id)) &&
      (!classes || classes.has(p.kind)) &&
      !(selection.excludeRectifiedAngles && p.kind === "angle" && p.flags.rectified)
  );
}

// ── Main entry ──────────────────────────────────────────────────────────

const UNTIMED_TECHNIQUES = [
  "profections",
  "sect-based-firdaria",
  "exact-returns",
  "progressed-angles",
  "house-overlays",
  "dashas-from-moon",
];

/**
 * Quality-aware chart. Opt-in; does not change `getBirthChart`.
 * Throws `InputQualityError` for an unknown quality, an incomplete date where a full date is
 * required, a missing time (recorded/rectified given `LocalDateTimeParts` without `hour`) or
 * missing coordinates (recorded/rectified).
 */
export async function getQualifiedChart(input: QualifiedChartInput): Promise<QualifiedChart> {
  const { quality } = input;
  if (!["recorded", "rectified", "untimed", "partial"].includes(quality)) {
    throw new InputQualityError("INVALID_QUALITY", `Unknown input quality "${String(quality)}"`);
  }

  if (quality === "partial") {
    const provenance = await resolveTimeProvenance(input, null);
    const known = Object.entries((input.date ?? {}) as PartialDateParts)
      .filter(([, v]) => v !== undefined)
      .map(([k]) => k);
    return {
      quality,
      status: "unavailable",
      chart: null,
      points: [],
      analysisPoints: [],
      unavailable: [
        {
          item: "chart",
          reason: "date-incomplete",
          message: `partial date (known: ${known.join(", ") || "none"}): no chart is invented`,
        },
      ],
      provenance,
    };
  }

  if (!hasFullDate(input.date)) {
    throw new InputQualityError("INCOMPLETE_DATE", `quality "${quality}" requires a full year, month and day`);
  }
  const full = partsOf(input.date);
  if (
    full.month < 1 ||
    full.month > 12 ||
    full.day < 1 ||
    full.day > 31 ||
    new Date(utcFromParts({ ...full, hour: 12 })).getUTCDate() !== full.day
  ) {
    throw new InputQualityError("INVALID_DATE", "Invalid calendar date");
  }

  if (quality === "untimed") return untimedChart(input, full);

  // recorded / rectified
  if (!(input.date instanceof Date) && (input.date as LocalDateTimeParts).hour === undefined) {
    throw new InputQualityError("MISSING_TIME", `quality "${quality}" requires an explicit hour`);
  }
  if (!hasPlace(input)) {
    throw new InputQualityError("MISSING_LOCATION", `quality "${quality}" requires latitude and longitude`);
  }
  const provenance = await resolveTimeProvenance(input, full);
  const computeChart =
    input.computeChart ?? (async (options: BirthChartOptions) => (await import("./index")).getBirthChart(options));
  const chart = await computeChart({
    date: provenance.referenceInstantUtc as Date,
    latitude: input.latitude as number,
    longitude: input.longitude as number,
    houseSystem: input.houseSystem,
    timeZoneSettings: { treatAsUTC: true },
  });
  const rectified = quality === "rectified";
  const points = getChartPoints(chart).map((p) => {
    if (rectified && p.flags.timeDependent) p.flags.rectified = true;
    return p;
  });
  const analysisPoints = selectAnalysisPoints(points, input.analysis);
  const unavailable: UnavailableItem[] = [];
  if (rectified && input.analysis?.excludeRectifiedAngles) {
    unavailable.push({
      item: "rectified-angles",
      reason: "excluded-by-selector",
      message: "angles come from a rectified birth time and were excluded from the analysis set",
      pointIds: ANGLE_IDS,
    });
  }
  return { quality, status: "complete", chart, points, analysisPoints, unavailable, provenance };
}

async function untimedChart(input: QualifiedChartInput, full: LocalDateTimeParts): Promise<QualifiedChart> {
  const day = { year: full.year, month: full.month, day: full.day };
  const next = addCivilDays(day, 1);
  const noonParts = { ...day, hour: 12 };
  const provenance = await resolveTimeProvenance(input, noonParts);
  const noon = provenance.referenceInstantUtc as Date;
  const start = (await resolveInstant({ ...day, hour: 0 }, input)).instant;
  const end = (await resolveInstant({ ...next, hour: 0 }, input)).instant;

  const positions = await calculatePlanetaryPositions(noon);
  const points = chartPointsFromPlanetPositions(positions as unknown as Record<number, any>).map((p) => {
    p.flags.placeholder = true;
    return p;
  });
  const analysisPoints = selectAnalysisPoints(
    points.filter((p) => !p.flags.timeDependent),
    input.analysis
  );

  const reason: ChartUnavailableReason = "birth-time-unknown";
  const unavailable: UnavailableItem[] = [
    {
      item: "moon-degree",
      reason,
      message: "Moon moves about 13 degrees per day; only the whole-day sign range is given",
      pointIds: ["moon"],
    },
    { item: "angles", reason, message: "angles need the birth time", pointIds: ANGLE_IDS },
    { item: "houses", reason, message: "house cusps need the birth time" },
    { item: "lots", reason, message: "lots use the Ascendant and Moon", pointIds: ["lot-fortune", "lot-spirit"] },
    { item: "sect", reason, message: "sect needs the Sun's altitude at the birth time" },
    {
      item: "time-dependent-techniques",
      reason,
      message: "techniques that read angles, houses, Moon degree or sect are not run",
      techniques: UNTIMED_TECHNIQUES,
    },
  ];

  return {
    quality: "untimed",
    status: "limited",
    chart: null,
    points,
    analysisPoints,
    unavailable,
    moonDayRange: getMoonSignRange(start, end),
    signChanges: getSignChangesBetween(start, end),
    provenance,
  };
}
