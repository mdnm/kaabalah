/**
 * Both-direction house overlays and aspect-point extraction for derived charts.
 *
 * Pure math (no ephemeris access).
 *
 * Overlay convention: the house of a longitude is `findHouseOf(longitude, cusps)`,
 * i.e. the house whose cusp interval [cusp_i, cusp_i+1) contains it; a point on
 * a cusp belongs to the house that starts there. A chart without a complete set
 * of 12 cusps (untimed/partial) cannot receive overlays: that direction is
 * reported with `available: false` and a reason, never guessed.
 */

import { findHouseOf, type BirthChart, type CompositeChart, type CompositeChartSummary } from "./index";
import type { HouseSystem } from "./swisseph";
import type { TransitAspectPoint } from "./aspects";

/** Structural view of a chart for overlays: bodies plus (optional) house cusps. */
export interface OverlayChartLike {
  planets: Record<string, { longitude: number }>;
  houses?: {
    ascendant?: { longitude: number };
    mc?: { longitude: number };
    dc?: { longitude: number };
    ic?: { longitude: number };
    houses?: { longitude: number }[];
  } | null;
  houseSystem?: HouseSystem;
}

export interface HouseOverlayPlacement {
  point: string;
  longitude: number;
  /** House (1-12) of the receiving chart. */
  house: number;
}

export interface HouseOverlayDirection {
  /** Chart whose points are placed. */
  from: "A" | "B";
  /** Chart whose houses receive them. */
  into: "A" | "B";
  available: boolean;
  /** Present when `available` is false. */
  reason?: string;
  /** Cusps of the receiving chart that were used. */
  cusps?: number[];
  houseSystem?: HouseSystem | null;
  houseSystemSource?: "chart" | "option" | "unknown";
  placements: HouseOverlayPlacement[];
}

export interface HouseOverlays {
  aInB: HouseOverlayDirection;
  bInA: HouseOverlayDirection;
  method: {
    rule: string;
    points: string;
    angles: boolean;
  };
}

export interface HouseOverlayOptions {
  /** Point keys to place (default: every key of `planets`, then angles if `includeAngles`). */
  points?: string[];
  /** Also place ascendant/mc/descendant/ic of the sending chart (default true). */
  includeAngles?: boolean;
  /** Used only when the chart does not record `houseSystem`. */
  houseSystemA?: HouseSystem;
  houseSystemB?: HouseSystem;
}

const ANGLE_KEYS: [string, "ascendant" | "mc" | "dc" | "ic"][] = [
  ["ascendant", "ascendant"],
  ["mc", "mc"],
  ["descendant", "dc"],
  ["ic", "ic"],
];

function sendingPoints(
  chart: OverlayChartLike,
  options: HouseOverlayOptions
): Record<string, number> {
  const all: Record<string, number> = {};
  for (const [k, p] of Object.entries(chart.planets)) all[k] = p.longitude;
  if (options.includeAngles !== false && chart.houses) {
    for (const [key, field] of ANGLE_KEYS) {
      const a = chart.houses[field];
      if (a) all[key] = a.longitude;
    }
  }
  if (!options.points) return all;
  const picked: Record<string, number> = {};
  for (const name of options.points) {
    const key = name.toLowerCase();
    if (key in all) picked[key] = all[key];
  }
  return picked;
}

function overlayDirection(
  from: "A" | "B",
  sender: OverlayChartLike,
  receiver: OverlayChartLike,
  receiverHouseSystemOption: HouseSystem | undefined,
  options: HouseOverlayOptions
): HouseOverlayDirection {
  const into = from === "A" ? "B" : "A";
  const cuspObjs = receiver.houses?.houses;
  const system = receiver.houseSystem ?? receiverHouseSystemOption ?? null;
  const source = receiver.houseSystem !== undefined ? "chart" : receiverHouseSystemOption !== undefined ? "option" : "unknown";
  if (!cuspObjs || cuspObjs.length !== 12 || cuspObjs.some((c) => !Number.isFinite(c.longitude))) {
    return {
      from,
      into,
      available: false,
      reason: `chart ${into} has no complete set of 12 house cusps (untimed or partial)`,
      houseSystem: system,
      houseSystemSource: source,
      placements: [],
    };
  }
  const cusps = cuspObjs.map((c) => c.longitude);
  const placements = Object.entries(sendingPoints(sender, options)).map(([point, longitude]) => ({
    point,
    longitude,
    house: findHouseOf(longitude, cusps),
  }));
  return { from, into, available: true, cusps, houseSystem: system, houseSystemSource: source, placements };
}

/**
 * House overlays in both directions: A's points in B's houses and B's points in A's houses.
 * The house system of each receiving chart is noted (`BirthChart.houseSystem`, else the option, else null).
 */
export function getHouseOverlays(
  chartA: OverlayChartLike,
  chartB: OverlayChartLike,
  options: HouseOverlayOptions = {}
): HouseOverlays {
  return {
    aInB: overlayDirection("A", chartA, chartB, options.houseSystemB, options),
    bInA: overlayDirection("B", chartB, chartA, options.houseSystemA, options),
    method: {
      rule: "house = findHouseOf(longitude, receiving cusps): [cusp_i, cusp_i+1) contains the point; a point on a cusp is in the house starting there",
      points: options.points ? `selected: ${options.points.join(", ")}` : "all bodies of the sending chart",
      angles: options.includeAngles !== false,
    },
  };
}

/**
 * Aspect-ready point record (`{ longitude, longitudeSpeed? }`) of any chart-like
 * source: a `BirthChart` (natal, Davison, progressed, solar return), a composite
 * result, or a bare `planets` record. Angles `ascendant` and `mc` (plus
 * `descendant`, `ic` with `includeAllAngles`) are included. The result is accepted by
 * `computeAspects`, `computeSynastryAspects` and `computeTransitAspects`.
 */
export function derivedChartAspectPoints(
  source: BirthChart | CompositeChart | CompositeChartSummary | { planets: Record<string, { longitude: number; longitudeSpeed?: number }> },
  options: { includeAngles?: boolean; includeAllAngles?: boolean } = {}
): Record<string, TransitAspectPoint> {
  const out: Record<string, TransitAspectPoint> = {};
  const includeAngles = options.includeAngles !== false;
  if ("compositePlanets" in source) {
    for (const [k, p] of Object.entries(source.compositePlanets)) out[k] = { longitude: p.longitude };
    if (includeAngles) {
      out.ascendant = { longitude: source.compositeAngles.ascendant.longitude };
      out.mc = { longitude: source.compositeAngles.mc.longitude };
      if (options.includeAllAngles) {
        out.descendant = { longitude: source.compositeAngles.descendant.longitude };
        out.ic = { longitude: source.compositeAngles.ic.longitude };
      }
    }
    return out;
  }
  for (const [k, p] of Object.entries(source.planets)) {
    out[k] = { longitude: p.longitude, longitudeSpeed: p.longitudeSpeed };
  }
  if (includeAngles && "houses" in source && source.houses) {
    out.ascendant = { longitude: source.houses.ascendant.longitude };
    out.mc = { longitude: source.houses.mc.longitude };
    if (options.includeAllAngles) {
      out.descendant = { longitude: source.houses.dc.longitude };
      out.ic = { longitude: source.houses.ic.longitude };
    }
  }
  return out;
}
