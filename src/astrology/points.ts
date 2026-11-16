/**
 * Stable, language-independent point identifiers and an adapter over the legacy
 * spaced-key chart dictionaries (`chart.planets`, `chart.nodes`, `chart.houses`,
 * `chart.lots`). The legacy dictionaries are read, never modified.
 *
 * Pure data: no Swiss Ephemeris dependency (types only).
 */

import type { BirthChart } from "./index";
import { normalizeAngle, Planet, type PlanetPosition } from "./swisseph";

export type PointClass = "luminary" | "planet" | "node" | "angle" | "lot" | "point";

export type PointId =
  | "sun"
  | "moon"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto"
  | "mean-node"
  | "true-node"
  | "south-node-mean"
  | "south-node-true"
  | "mean-lilith"
  | "true-lilith"
  | "chiron"
  | "asc"
  | "mc"
  | "dsc"
  | "ic"
  | "vertex"
  | "lot-fortune"
  | "lot-spirit";

/** Where the legacy value lives on a `BirthChart`. */
export type LegacySource = "planets" | "houses" | "lots" | "derived";

export interface PointDefinition {
  id: PointId;
  kind: PointClass;
  /** Key in the legacy aspect/planet dictionaries (`"mean node"`, `"ascendant"`, ...). */
  legacyKey: string;
  legacySource: LegacySource;
  /** Longitude depends on the exact birth time (Moon degree, angles, vertex, lots). */
  timeDependent: boolean;
  /** Axis membership: the two ends of an axis are geometrically complementary. */
  axis?: { id: string; end: 0 | 1 };
}

const DEFS: PointDefinition[] = [
  { id: "sun", kind: "luminary", legacyKey: "sun", legacySource: "planets", timeDependent: false },
  { id: "moon", kind: "luminary", legacyKey: "moon", legacySource: "planets", timeDependent: true },
  { id: "mercury", kind: "planet", legacyKey: "mercury", legacySource: "planets", timeDependent: false },
  { id: "venus", kind: "planet", legacyKey: "venus", legacySource: "planets", timeDependent: false },
  { id: "mars", kind: "planet", legacyKey: "mars", legacySource: "planets", timeDependent: false },
  { id: "jupiter", kind: "planet", legacyKey: "jupiter", legacySource: "planets", timeDependent: false },
  { id: "saturn", kind: "planet", legacyKey: "saturn", legacySource: "planets", timeDependent: false },
  { id: "uranus", kind: "planet", legacyKey: "uranus", legacySource: "planets", timeDependent: false },
  { id: "neptune", kind: "planet", legacyKey: "neptune", legacySource: "planets", timeDependent: false },
  { id: "pluto", kind: "planet", legacyKey: "pluto", legacySource: "planets", timeDependent: false },
  {
    id: "mean-node", kind: "node", legacyKey: "mean node", legacySource: "planets", timeDependent: false,
    axis: { id: "axis:mean-node", end: 0 },
  },
  {
    id: "true-node", kind: "node", legacyKey: "true node", legacySource: "planets", timeDependent: false,
    axis: { id: "axis:true-node", end: 0 },
  },
  {
    id: "south-node-mean", kind: "node", legacyKey: "south node mean", legacySource: "derived", timeDependent: false,
    axis: { id: "axis:mean-node", end: 1 },
  },
  {
    id: "south-node-true", kind: "node", legacyKey: "south node true", legacySource: "derived", timeDependent: false,
    axis: { id: "axis:true-node", end: 1 },
  },
  { id: "mean-lilith", kind: "point", legacyKey: "lilith mean", legacySource: "planets", timeDependent: false },
  { id: "true-lilith", kind: "point", legacyKey: "lilith true", legacySource: "planets", timeDependent: false },
  { id: "chiron", kind: "point", legacyKey: "chiron", legacySource: "planets", timeDependent: false },
  {
    id: "asc", kind: "angle", legacyKey: "ascendant", legacySource: "houses", timeDependent: true,
    axis: { id: "axis:asc-dsc", end: 0 },
  },
  {
    id: "mc", kind: "angle", legacyKey: "mc", legacySource: "houses", timeDependent: true,
    axis: { id: "axis:mc-ic", end: 0 },
  },
  {
    id: "dsc", kind: "angle", legacyKey: "dc", legacySource: "houses", timeDependent: true,
    axis: { id: "axis:asc-dsc", end: 1 },
  },
  {
    id: "ic", kind: "angle", legacyKey: "ic", legacySource: "houses", timeDependent: true,
    axis: { id: "axis:mc-ic", end: 1 },
  },
  { id: "vertex", kind: "angle", legacyKey: "vertex", legacySource: "houses", timeDependent: true },
  { id: "lot-fortune", kind: "lot", legacyKey: "fortune", legacySource: "lots", timeDependent: true },
  { id: "lot-spirit", kind: "lot", legacyKey: "spirit", legacySource: "lots", timeDependent: true },
];

export const POINT_DEFINITIONS: Readonly<Record<PointId, PointDefinition>> = Object.freeze(
  Object.fromEntries(DEFS.map((d) => [d.id, d])) as Record<PointId, PointDefinition>
);

export const POINT_IDS: readonly PointId[] = DEFS.map((d) => d.id);

export const POINT_CLASSES: readonly PointClass[] = ["luminary", "planet", "node", "angle", "lot", "point"];

export function isPointId(value: unknown): value is PointId {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(POINT_DEFINITIONS, value);
}

/** Per-point provenance flags. `placeholder` and `rectified` are set by `quality.ts`. */
export interface ChartPointFlags {
  /** Computed from other points (south nodes, DSC, IC, lots) rather than read from the ephemeris. */
  derived: boolean;
  /** Longitude depends on the exact birth time. */
  timeDependent: boolean;
  /** Position computed at a placeholder instant (untimed chart, local noon). */
  placeholder?: boolean;
  /** Time-dependent value that comes from a rectified (estimated) birth time. */
  rectified?: boolean;
}

export interface ChartPoint {
  id: PointId;
  kind: PointClass;
  longitude: number;
  latitude?: number;
  /** Degrees per day; `null` = explicitly unavailable (angles, lots, hand-built points). */
  speed: number | null;
  legacyKey: string;
  legacySource: LegacySource;
  flags: ChartPointFlags;
}

/** Minimum shape the policy-based aspect functions need. `ChartPoint` satisfies it. */
export interface ChartPointLike {
  id: PointId;
  kind: PointClass;
  longitude: number;
  speed?: number | null;
}

export interface ChartPointsOptions {
  /** Keep only these IDs (applied before `exclude`). */
  include?: readonly PointId[];
  exclude?: readonly PointId[];
  classes?: readonly PointClass[];
}

export function getPointDefinition(id: PointId): PointDefinition {
  return POINT_DEFINITIONS[id];
}

function normKey(key: string): string {
  return key.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

const LEGACY_ALIASES: Record<string, PointId> = {
  "ascendant": "asc",
  "asc": "asc",
  "descendant": "dsc",
  "dc": "dsc",
  "dsc": "dsc",
  "midheaven": "mc",
  "mc": "mc",
  "ic": "ic",
  "imum coeli": "ic",
  "vertex": "vertex",
  "fortune": "lot-fortune",
  "lot fortune": "lot-fortune",
  "spirit": "lot-spirit",
  "lot spirit": "lot-spirit",
  "mean lilith": "mean-lilith",
  "true lilith": "true-lilith",
  "south node": "south-node-mean",
  "south node mean": "south-node-mean",
  "south node true": "south-node-true",
};

/** Reverse lookup: legacy spaced key (case/underscore tolerant) -> stable ID, or `null`. */
export function pointIdFromLegacyKey(key: string): PointId | null {
  const k = normKey(key);
  if (LEGACY_ALIASES[k]) return LEGACY_ALIASES[k];
  for (const def of DEFS) {
    if (def.legacyKey === k) return def.id;
  }
  if (isPointId(k.replace(/ /g, "-"))) return k.replace(/ /g, "-") as PointId;
  return null;
}

/** Forward lookup: stable ID -> legacy key. */
export function legacyKeyFromPointId(id: PointId): string {
  return POINT_DEFINITIONS[id].legacyKey;
}

function make(
  id: PointId,
  longitude: number,
  extra: { latitude?: number; speed?: number | null; derived?: boolean }
): ChartPoint {
  const def = POINT_DEFINITIONS[id];
  const point: ChartPoint = {
    id,
    kind: def.kind,
    longitude: normalizeAngle(longitude),
    speed: extra.speed ?? null,
    legacyKey: def.legacyKey,
    legacySource: def.legacySource,
    flags: { derived: extra.derived ?? false, timeDependent: def.timeDependent },
  };
  if (extra.latitude !== undefined) point.latitude = extra.latitude;
  return point;
}

const PLANET_ENUM_TO_ID: Record<number, PointId> = {
  [Planet.SUN]: "sun",
  [Planet.MOON]: "moon",
  [Planet.MERCURY]: "mercury",
  [Planet.VENUS]: "venus",
  [Planet.MARS]: "mars",
  [Planet.JUPITER]: "jupiter",
  [Planet.SATURN]: "saturn",
  [Planet.URANUS]: "uranus",
  [Planet.NEPTUNE]: "neptune",
  [Planet.PLUTO]: "pluto",
  [Planet.MEAN_NODE]: "mean-node",
  [Planet.TRUE_NODE]: "true-node",
  [Planet.LILITH_MEAN]: "mean-lilith",
  [Planet.LILITH_TRUE]: "true-lilith",
  [Planet.CHIRON]: "chiron",
};

function applySelection(points: ChartPoint[], options?: ChartPointsOptions): ChartPoint[] {
  if (!options) return points;
  const include = options.include ? new Set<PointId>(options.include) : null;
  const exclude = options.exclude ? new Set<PointId>(options.exclude) : null;
  const classes = options.classes ? new Set<PointClass>(options.classes) : null;
  return points.filter(
    (p) =>
      (!include || include.has(p.id)) &&
      (!exclude || !exclude.has(p.id)) &&
      (!classes || classes.has(p.kind))
  );
}

/** Add the derived south nodes for any north node present. */
function withSouthNodes(points: ChartPoint[]): ChartPoint[] {
  const out = [...points];
  const pairs: Array<[PointId, PointId]> = [
    ["mean-node", "south-node-mean"],
    ["true-node", "south-node-true"],
  ];
  for (const [north, south] of pairs) {
    const n = points.find((p) => p.id === north);
    if (!n) continue;
    out.push(
      make(south, n.longitude + 180, {
        latitude: n.latitude !== undefined ? -n.latitude : undefined,
        speed: n.speed,
        derived: true,
      })
    );
  }
  return out;
}

/**
 * Points from raw Swiss positions keyed by `Planet` enum (no chart needed; used for
 * untimed charts and one-ephemeris-call multi-house-system computations). Includes the
 * derived south nodes. Speeds come from `longitudeSpeed` (`null` when absent).
 */
export function chartPointsFromPlanetPositions(
  positions: Partial<Record<number, PlanetPosition>>,
  options?: ChartPointsOptions
): ChartPoint[] {
  const pts: ChartPoint[] = [];
  for (const [key, id] of Object.entries(PLANET_ENUM_TO_ID)) {
    const pos = positions[Number(key)];
    if (!pos) continue;
    pts.push(make(id, pos.longitude, { latitude: pos.latitude, speed: pos.longitudeSpeed ?? null }));
  }
  return applySelection(withSouthNodes(pts), options);
}

/**
 * Map a legacy `BirthChart` to typed points. `chart.planets`, `chart.nodes`, `chart.houses`
 * and `chart.lots` are only read. South nodes are derived (longitude + 180, same speed);
 * DSC/IC come from `chart.houses.dc/ic`. Angles and lots have `speed: null`.
 */
export function getChartPoints(chart: BirthChart, options?: ChartPointsOptions): ChartPoint[] {
  const pts: ChartPoint[] = [];
  for (const def of DEFS) {
    if (def.legacySource !== "planets") continue;
    const p = chart.planets?.[def.legacyKey];
    if (!p) continue;
    pts.push(make(def.id, p.longitude, { latitude: p.latitude, speed: p.longitudeSpeed ?? null }));
  }
  const withSouth = withSouthNodes(pts);

  const h = chart.houses;
  if (h) {
    const angles: Array<[PointId, number | undefined]> = [
      ["asc", h.ascendant?.longitude],
      ["mc", h.mc?.longitude],
      ["dsc", h.dc?.longitude],
      ["ic", h.ic?.longitude],
      ["vertex", h.ascmc?.vertex?.longitude],
    ];
    for (const [id, lon] of angles) {
      if (typeof lon === "number") withSouth.push(make(id, lon, { derived: id === "dsc" || id === "ic" }));
    }
  }
  if (chart.lots) {
    withSouth.push(make("lot-fortune", chart.lots.fortune, { derived: true }));
    withSouth.push(make("lot-spirit", chart.lots.spirit, { derived: true }));
  }
  return applySelection(withSouth, options);
}

/**
 * Re-key points to the legacy dictionary shape accepted by `computeAspects` and friends
 * (`{ [legacyKey]: { longitude, longitudeSpeed? } }`).
 */
export function toLegacyPointRecord(
  points: readonly ChartPoint[]
): Record<string, { longitude: number; longitudeSpeed?: number }> {
  const out: Record<string, { longitude: number; longitudeSpeed?: number }> = {};
  for (const p of points) {
    out[p.legacyKey] =
      p.speed === null ? { longitude: p.longitude } : { longitude: p.longitude, longitudeSpeed: p.speed };
  }
  return out;
}
