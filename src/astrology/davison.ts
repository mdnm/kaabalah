/**
 * Davison relationship chart: a REAL chart cast for the midpoint in TIME and
 * the midpoint in PLACE of two births.
 *
 * Davison and the midpoint composite (`getCompositeChart`) are DIFFERENT
 * methods: the composite averages the two charts' longitudes point by point and
 * has no time or place of its own; the Davison chart is an actual sky at an
 * actual instant, so planets stay physically consistent (e.g. Mercury within
 * 28 degrees of the Sun) and the two can differ by many degrees.
 *
 * Conventions (echoed in `method`):
 * - Time: arithmetic mean of the two UTC Julian Days (= the exact UTC instant
 *   midpoint). The chart is cast at that JD without millisecond truncation.
 * - Place, default `"arithmetic-shorter-arc"` (the family reference): latitude =
 *   arithmetic mean of the two latitudes; longitude = midpoint along the SHORTER
 *   longitude arc (a + shortestDelta(b - a) / 2). Result normalised to (-180, 180].
 *   Antimeridian: 179 E and 179 W give 180, not 0. Longitudes exactly 180 degrees
 *   apart have two equally short arcs: the result is then symmetric in A/B (the
 *   arithmetic mean of the two longitudes normalised to [-180, 180)) and a notice
 *   is added.
 * - Place, `"great-circle"`: the normalised mean of the two unit vectors on the
 *   sphere (true surface midpoint). Antipodal places have no unique midpoint: the
 *   arithmetic convention is used instead and a notice is added.
 */

import { HouseSystem, toUtcDate } from "./swisseph";
import type { BirthChartOptions, ComputedBirthChart } from "./index";
import { dateToJd } from "./root-solver";
import { DerivedChartError, getChartAtJulianDay } from "./progressions";
import { julianDayToDate } from "./jyotish/dasha";

export type GeographicMidpointConvention = "arithmetic-shorter-arc" | "great-circle";

export interface DavisonPersonInput {
  /** Absolute UTC instant of the birth. */
  dateUtc: Date;
  latitude: number;
  longitude: number;
}

export interface DavisonOptions {
  a: DavisonPersonInput;
  b: DavisonPersonInput;
  houseSystem?: HouseSystem;
  /** Default "arithmetic-shorter-arc". */
  geographicMidpoint?: GeographicMidpointConvention;
}

export type DavisonNotice =
  | { type: "antipodal_longitudes"; reason: string }
  | { type: "antipodal_places"; reason: string };

export interface DavisonMethod {
  name: "davison";
  time: "arithmetic mean of the two UTC Julian Days (exact UTC instant midpoint)";
  geographicMidpoint: GeographicMidpointConvention;
  geographicMidpointRule: string;
  antimeridian: string;
  longitudeRange: "(-180, 180]";
  houseSystem: HouseSystem;
  distinctFromComposite: string;
  referenceConvention: string;
}

export interface DavisonResult {
  chart: ComputedBirthChart;
  midpointJd: number;
  /** Midpoint instant rounded to the millisecond (`midpointJd` is exact). */
  midpointDateUtc: Date;
  location: { latitude: number; longitude: number };
  inputs: { a: DavisonPersonInput; b: DavisonPersonInput };
  notices: DavisonNotice[];
  method: DavisonMethod;
}

function normalizeLongitudeHalfOpen(lon: number): number {
  return ((((lon + 180) % 360) + 360) % 360) - 180; // [-180, 180)
}

/** Shortest signed delta of two longitudes, in [-180, 180). */
function shortestDelta(delta: number): number {
  return normalizeLongitudeHalfOpen(delta);
}

export interface GeographicMidpoint {
  latitude: number;
  longitude: number;
  notices: DavisonNotice[];
}

/** Geographic midpoint of two places under the named convention (see module doc). */
export function geographicMidpoint(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
  convention: GeographicMidpointConvention = "arithmetic-shorter-arc"
): GeographicMidpoint {
  for (const v of [a.latitude, a.longitude, b.latitude, b.longitude]) {
    if (!Number.isFinite(v)) throw new DerivedChartError("INVALID_INPUT", "coordinates must be finite");
  }
  if (Math.abs(a.latitude) > 90 || Math.abs(b.latitude) > 90) {
    throw new DerivedChartError("INVALID_INPUT", "latitude must be within [-90, 90]");
  }
  const notices: DavisonNotice[] = [];

  const arithmetic = (): { latitude: number; longitude: number } => {
    const latitude = (a.latitude + b.latitude) / 2;
    const rawDelta = b.longitude - a.longitude;
    const delta = shortestDelta(rawDelta);
    let lon: number;
    if (Math.abs(Math.abs(delta) - 180) < 1e-9) {
      // Two equally short arcs: make the choice symmetric in (a, b).
      notices.push({
        type: "antipodal_longitudes",
        reason: "longitudes are 180 degrees apart; the arithmetic mean of the normalised longitudes was used",
      });
      lon = (normalizeLongitudeHalfOpen(a.longitude) + normalizeLongitudeHalfOpen(b.longitude)) / 2;
    } else {
      lon = a.longitude + delta / 2;
    }
    lon = normalizeLongitudeHalfOpen(lon);
    if (lon === -180) lon = 180; // report on (-180, 180]
    return { latitude, longitude: lon };
  };

  if (convention === "great-circle") {
    const toVec = (p: { latitude: number; longitude: number }) => {
      const la = (p.latitude * Math.PI) / 180;
      const lo = (p.longitude * Math.PI) / 180;
      return [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)];
    };
    const va = toVec(a);
    const vb = toVec(b);
    const m = [va[0] + vb[0], va[1] + vb[1], va[2] + vb[2]];
    const norm = Math.hypot(m[0], m[1], m[2]);
    if (norm < 1e-9) {
      notices.push({
        type: "antipodal_places",
        reason: "places are antipodal: no unique great-circle midpoint; the arithmetic convention was used",
      });
      return { ...arithmetic(), notices };
    }
    const latitude = (Math.asin(m[2] / norm) * 180) / Math.PI;
    let longitude = (Math.atan2(m[1], m[0]) * 180) / Math.PI;
    longitude = normalizeLongitudeHalfOpen(longitude);
    if (longitude === -180) longitude = 180;
    return { latitude, longitude, notices };
  }
  return { ...arithmetic(), notices };
}

/** Davison chart from two UTC instants and places. */
export function getDavisonChart(options: DavisonOptions): DavisonResult {
  const { a, b } = options;
  const jdA = dateToJd(a.dateUtc);
  const jdB = dateToJd(b.dateUtc);
  if (!Number.isFinite(jdA) || !Number.isFinite(jdB)) {
    throw new DerivedChartError("INVALID_INPUT", "birth instants must be valid dates");
  }
  const convention = options.geographicMidpoint ?? "arithmetic-shorter-arc";
  const houseSystem = options.houseSystem ?? HouseSystem.PLACIDUS;
  const place = geographicMidpoint(a, b, convention);
  const midpointJd = (jdA + jdB) / 2;
  const chart = getChartAtJulianDay({
    julianDayUt: midpointJd,
    latitude: place.latitude,
    longitude: place.longitude,
    houseSystem,
  });
  return {
    chart,
    midpointJd,
    midpointDateUtc: julianDayToDate(midpointJd),
    location: { latitude: place.latitude, longitude: place.longitude },
    inputs: { a, b },
    notices: place.notices,
    method: {
      name: "davison",
      time: "arithmetic mean of the two UTC Julian Days (exact UTC instant midpoint)",
      geographicMidpoint: convention,
      geographicMidpointRule:
        convention === "arithmetic-shorter-arc"
          ? "latitude = mean of latitudes; longitude = midpoint along the shorter longitude arc (family reference convention)"
          : "normalised mean of the two unit vectors (great-circle surface midpoint)",
      antimeridian:
        "the shorter arc is taken across the antimeridian (179 E and 179 W give 180); exactly antipodal longitudes use the arithmetic mean of the normalised longitudes and add a notice",
      longitudeRange: "(-180, 180]",
      houseSystem,
      distinctFromComposite:
        "A Davison chart is a real chart cast for the midpoint time and place; the midpoint composite averages the two charts' longitudes point by point. They are different methods and can differ substantially.",
      referenceConvention: "UTC Julian-date midpoint; arithmetic latitude and shortest-arc longitude midpoint (uncorrected Davison)",
    },
  };
}

/** Davison chart from the same options as `getBirthChart` (local date-times are resolved to UTC first). */
export async function getDavisonChartFromOptions(
  a: BirthChartOptions,
  b: BirthChartOptions,
  options: { houseSystem?: HouseSystem; geographicMidpoint?: GeographicMidpointConvention } = {}
): Promise<DavisonResult> {
  const resolve = async (o: BirthChartOptions): Promise<DavisonPersonInput> => ({
    dateUtc: await toUtcDate(o.date, o.latitude, o.longitude, o.timeZoneSettings ?? { autoTimeZone: true }),
    latitude: o.latitude,
    longitude: o.longitude,
  });
  const [pa, pb] = await Promise.all([resolve(a), resolve(b)]);
  return getDavisonChart({
    a: pa,
    b: pb,
    houseSystem: options.houseSystem ?? a.houseSystem,
    geographicMidpoint: options.geographicMidpoint,
  });
}
