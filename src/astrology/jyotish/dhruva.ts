/**
 * Ernst Wilhelm / Kala "Dhruva" equatorial nakshatras.
 *
 * Ports the user-supplied, confirmed reference implementation. The method:
 *
 *  - Anchor: Galactic Center (Sgr A*) ICRS RA 266.40499 deg, Dec -28.93617 deg,
 *    taken to the FK5 mean equator/equinox of date (Astropy-equivalent, see
 *    `frames.ts`).
 *  - `zeroRA = (GC_RA_of_date - (246 + 2/3)) mod 360`.
 *  - `nakPos = (actual RA of date - zeroRA) mod 360`; 27 equal sectors of
 *    40/3 deg, 4 padas of 10/3 deg each.
 *  - Bodies use their actual geocentric apparent right ascension from Swiss
 *    (`SEFLG_EQUATORIAL`: true equator and equinox of date, i.e. nutation,
 *    aberration and light-time included) with their actual ecliptic latitude.
 *    The GC anchor is the mean FK5 of date (no nutation); this mixture is what the
 *    reference does and is reproduced as-is (difference <= ~0.005 deg).
 *  - Lagna: RA of the tropical ASC at ecliptic latitude 0 with true obliquity.
 *  - Rahu is the latitude-0 node point (mean primary, true as a variant); Ketu is
 *    the antipode of the corresponding Rahu.
 *
 * It is NOT ecliptic longitude minus Lahiri and NOT Swiss ayanamsa mode 36.
 * Tropical rasis and tropical houses are reported separately and unchanged.
 */

import {
  EphemerisTracker,
  type EphemerisCheckOptions,
  type EphemerisUsage,
  GeocentricBody,
  JyotishBodyId,
  JyotishEphemeris,
  NodeConvention,
  assertFiniteGeo,
  calculateGeocentricBodies,
  julianDayOf,
  trueObliquity,
  tropicalAscendant,
  JYOTISH_BODY_IDS,
} from "./bodies";
import {
  ecliptic0ToDeclination,
  ecliptic0ToRightAscension,
  icrsToFk5OfDate,
  normalizeDegrees,
} from "./frames";
import {
  NAKSHATRA_WIDTH_DEGREES,
  NakshatraPlacement,
  SignPlacement,
  nakshatraFromPosition,
  signPlacement,
} from "./nakshatra";

/** Explicit, named method constants. Never fitted to any fixture. */
export interface DhruvaConstants {
  /** Sgr A* ICRS right ascension, degrees. */
  gcIcrsRightAscension: number;
  /** Sgr A* ICRS declination, degrees. */
  gcIcrsDeclination: number;
  /** Degrees subtracted from the GC RA of date to get the RA origin (246 + 2/3). */
  anchorOffsetDegrees: number;
  /** Nakshatra width (40/3 deg). */
  sectorWidthDegrees: number;
  /** Default dasha year length for this method, days. */
  yearLengthDays: number;
}

export const DHRUVA_CONSTANTS: Readonly<DhruvaConstants> = Object.freeze({
  gcIcrsRightAscension: 266.40499,
  gcIcrsDeclination: -28.93617,
  anchorOffsetDegrees: 246 + 2 / 3,
  sectorWidthDegrees: NAKSHATRA_WIDTH_DEGREES,
  yearLengthDays: 365.2422,
});

export interface DhruvaOrigin {
  /** UT Julian day read on the UTC scale (as the reference does). */
  julianDayUt: number;
  /** GC right ascension, FK5 mean equator/equinox of date, degrees. */
  gcRightAscensionOfDate: number;
  gcDeclinationOfDate: number;
  /** `(gcRightAscensionOfDate - anchorOffsetDegrees) mod 360`. */
  zeroRightAscension: number;
  constants: DhruvaConstants;
}

/** Date-specific GC anchor and RA origin. */
export function getDhruvaOrigin(julianDayUt: number, constants: DhruvaConstants = DHRUVA_CONSTANTS): DhruvaOrigin {
  if (!Number.isFinite(julianDayUt)) throw new Error("Finite Julian day required");
  const gc = icrsToFk5OfDate(constants.gcIcrsRightAscension, constants.gcIcrsDeclination, julianDayUt);
  return {
    julianDayUt,
    gcRightAscensionOfDate: gc.rightAscension,
    gcDeclinationOfDate: gc.declination,
    zeroRightAscension: normalizeDegrees(gc.rightAscension - constants.anchorOffsetDegrees),
    constants,
  };
}

export interface DhruvaPoint extends NakshatraPlacement {
  /** Actual right ascension used (degrees, [0, 360)). */
  rightAscension: number;
  declination: number;
  /** Tropical ecliptic longitude of date (unchanged by the nakshatra frame). */
  longitude: number;
  /** Ecliptic latitude (0 for lagna and nodes). */
  latitude: number;
  /** Tropical rasi (sign of the tropical longitude); independent of nakshatra frame. */
  tropical: SignPlacement;
  /** Set for derived points (Ketu). */
  derivedFrom?: string;
}

/** Nakshatra placement for an actual RA against an origin. Mirrors the reference `nakshatra_position`. */
export function dhruvaPlacementFromRightAscension(
  rightAscension: number,
  origin: Pick<DhruvaOrigin, "zeroRightAscension">
): NakshatraPlacement & { rightAscension: number } {
  const ra = normalizeDegrees(rightAscension);
  return { rightAscension: ra, ...nakshatraFromPosition(ra - origin.zeroRightAscension) };
}

function point(
  rightAscension: number,
  declination: number,
  longitude: number,
  latitude: number,
  origin: DhruvaOrigin,
  derivedFrom?: string
): DhruvaPoint {
  const lon = normalizeDegrees(longitude);
  return {
    ...dhruvaPlacementFromRightAscension(rightAscension, origin),
    declination,
    longitude: lon,
    latitude,
    tropical: signPlacement(lon),
    ...(derivedFrom ? { derivedFrom } : {}),
  };
}

/** Build a Dhruva point from an already-computed geocentric body (actual latitude retained in its RA). */
export function dhruvaPointFromBody(body: GeocentricBody, origin: DhruvaOrigin): DhruvaPoint {
  return point(body.rightAscension, body.declination, body.longitude, body.latitude, origin);
}

/** Ketu as the antipode of a Rahu point: RA + 180, declination negated, longitude + 180. */
export function dhruvaKetuFromRahu(rahu: DhruvaPoint, origin: DhruvaOrigin, convention: NodeConvention): DhruvaPoint {
  return point(
    rahu.rightAscension + 180,
    -rahu.declination,
    rahu.longitude + 180,
    -rahu.latitude,
    origin,
    `${convention}_node antipode`
  );
}

/** Lagna point from a tropical ASC longitude and the true obliquity (ecliptic latitude 0). */
export function dhruvaLagnaFromAscendant(
  ascendantLongitude: number,
  trueObliquityDegrees: number,
  origin: DhruvaOrigin
): DhruvaPoint {
  return point(
    ecliptic0ToRightAscension(ascendantLongitude, trueObliquityDegrees),
    ecliptic0ToDeclination(ascendantLongitude, trueObliquityDegrees),
    ascendantLongitude,
    0,
    origin
  );
}

export type DhruvaPointId = JyotishBodyId | "rahu" | "ketu" | "lagna";

export interface DhruvaChart {
  origin: DhruvaOrigin;
  nodeConvention: NodeConvention;
  /** Sun..Saturn, Rahu/Ketu (selected node convention) and, when timed, Moon and lagna. */
  points: Partial<Record<DhruvaPointId, DhruvaPoint>>;
  /** Both node conventions side by side. */
  nodeVariants: Record<NodeConvention, { rahu: DhruvaPoint; ketu: DhruvaPoint }>;
  trueObliquity?: number;
  timed: boolean;
  ephemeris: JyotishEphemeris;
  /** Ephemeris that actually produced the numbers (detects a silent Moshier substitution). */
  ephemerisUsage: EphemerisUsage;
}

export interface DhruvaChartInput extends EphemerisCheckOptions {
  /** UT instant. */
  date: Date;
  /** Overrides `date` with an explicit UT Julian day (sub-second precision). */
  julianDayUt?: number;
  latitude: number;
  longitude: number;
  /** Mean node is primary (default); true node is exposed as a variant either way. */
  node?: NodeConvention;
  /** `false` excludes Moon and lagna (untimed births). Default `true`. */
  timed?: boolean;
  /** Swiss files (default) or Moshier. Moshier exists to reproduce the reference fixtures. */
  ephemeris?: JyotishEphemeris;
  constants?: DhruvaConstants;
}

/** Compute the Dhruva chart through the Swiss ephemeris. */
export function calculateDhruvaChart(input: DhruvaChartInput): DhruvaChart {
  const jd = input.julianDayUt ?? julianDayOf(input.date);
  assertFiniteGeo(jd, input.latitude, input.longitude);
  const timed = input.timed !== false;
  const ephemeris = input.ephemeris ?? "swiss";
  const node = input.node ?? "mean";
  const origin = getDhruvaOrigin(jd, input.constants ?? DHRUVA_CONSTANTS);
  const tracker = new EphemerisTracker(ephemeris, input.strictEphemeris);
  const bodies = calculateGeocentricBodies(jd, ephemeris, tracker);

  const points: DhruvaChart["points"] = {};
  for (const id of JYOTISH_BODY_IDS) {
    if (!timed && id === "moon") continue;
    points[id] = dhruvaPointFromBody(bodies.planets[id], origin);
  }

  const meanRahu = dhruvaPointFromBody(bodies.meanNode, origin);
  const trueRahu = dhruvaPointFromBody(bodies.trueNode, origin);
  const nodeVariants = {
    mean: { rahu: meanRahu, ketu: dhruvaKetuFromRahu(meanRahu, origin, "mean") },
    true: { rahu: trueRahu, ketu: dhruvaKetuFromRahu(trueRahu, origin, "true") },
  };
  points.rahu = nodeVariants[node].rahu;
  points.ketu = nodeVariants[node].ketu;

  let obliquity: number | undefined;
  if (timed) {
    obliquity = trueObliquity(jd, ephemeris, tracker);
    points.lagna = dhruvaLagnaFromAscendant(tropicalAscendant(jd, input.latitude, input.longitude), obliquity, origin);
  }
  return { origin, nodeConvention: node, points, nodeVariants, trueObliquity: obliquity, timed, ephemeris, ephemerisUsage: tracker.usage() };
}
