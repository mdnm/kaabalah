/**
 * Conventional Lahiri (Chitrapaksha) sidereal comparison chart.
 *
 * Separate from the Dhruva equatorial method: here nakshatras and padas come
 * from the ECLIPTIC sidereal longitude, `longitude_sidereal / (40/3)`.
 *
 * Frames and houses:
 *  - Planets are computed by Swiss in sidereal mode 1 (Lahiri) with
 *    `SEFLG_SIDEREAL`, apparent, nutation included.
 *  - The ayanamsa is read back from the same engine as
 *    `tropical longitude - sidereal longitude` of the Sun at the same instant and
 *    flags, i.e. the true (nutation-included) ayanamsa Swiss itself subtracts. The
 *    sidereal ascendant is `tropical ASC - that ayanamsa`. This is exactly what
 *    Swiss `swe_houses_ex(SEFLG_SIDEREAL)` does (it subtracts the same ayanamsa
 *    from the tropical ASC computed from the true obliquity), so planets and
 *    ascendant are in the same nutated frame. It is NOT the mean ayanamsa
 *    (without nutation) subtracted from a nutated ASC, which would shift the
 *    ascendant relative to the planets by up to ~0.005 deg.
 *  - The Swiss sidereal mode is global mutable state; it is set, used and reset
 *    synchronously inside `withSiderealMode`, so tropical calculations are never
 *    affected.
 */

import {
  CalcFlag,
  SWISS_SIDM_LAHIRI,
  withSiderealMode,
} from "../swisseph";
import {
  EphemerisTracker,
  type EphemerisCheckOptions,
  type EphemerisUsage,
  JYOTISH_BODY_IDS,
  JyotishBodyId,
  JyotishEphemeris,
  NodeConvention,
  assertFiniteGeo,
  ephemerisFlags,
  julianDayOf,
  planetIdFor,
  tropicalAscendant,
} from "./bodies";
import { normalizeDegrees, signedAngleBetween } from "./frames";
import { NakshatraPlacement, SignPlacement, nakshatraFromPosition, signPlacement } from "./nakshatra";
import { Planet } from "../swisseph";

export interface LahiriPoint extends NakshatraPlacement {
  /** Sidereal (Lahiri) ecliptic longitude, [0, 360). */
  longitude: number;
  /** Ecliptic latitude (0 for ascendant and nodes). */
  latitude: number;
  /** Tropical longitude of the same point. */
  tropicalLongitude: number;
  /** Sidereal rasi. */
  sidereal: SignPlacement;
  /** Whole-sign house 1..12 counted from the sidereal ascendant's sign (absent when untimed). */
  wholeSignHouse?: number;
  longitudeSpeed?: number;
  retrograde?: boolean;
  derivedFrom?: string;
}

export type LahiriPointId = JyotishBodyId | "rahu" | "ketu" | "lagna";

export interface LahiriChart {
  /** Swiss sidereal mode id used (SE_SIDM_LAHIRI = 1). */
  siderealMode: number;
  /** True (nutation-included) ayanamsa in degrees at the instant. */
  ayanamsa: number;
  ayanamsaKind: "true-nutated, tropical minus sidereal of the same body and flags";
  nodeConvention: NodeConvention;
  timed: boolean;
  ephemeris: JyotishEphemeris;
  /** Ephemeris that actually produced the numbers (detects a silent Moshier substitution). */
  ephemerisUsage: EphemerisUsage;
  /** Sidereal ascendant (undefined if untimed). */
  ascendant?: LahiriPoint;
  points: Partial<Record<LahiriPointId, LahiriPoint>>;
  nodeVariants: Record<NodeConvention, { rahu: LahiriPoint; ketu: LahiriPoint }>;
  /** Whole-sign houses: house number -> sidereal sign index of its sign (empty if untimed). */
  wholeSignHouses: Array<{ house: number; signIndex: number; sign: string }>;
}

export interface LahiriChartInput extends EphemerisCheckOptions {
  date: Date;
  julianDayUt?: number;
  latitude: number;
  longitude: number;
  node?: NodeConvention;
  timed?: boolean;
  ephemeris?: JyotishEphemeris;
}

export function wholeSignHouseOf(longitude: number, ascendantLongitude: number): number {
  const sign = Math.floor(normalizeDegrees(longitude) / 30);
  const ascSign = Math.floor(normalizeDegrees(ascendantLongitude) / 30);
  return ((sign - ascSign + 12) % 12) + 1;
}

interface RawSidereal {
  longitude: number;
  latitude: number;
  speed?: number;
}

/**
 * Sidereal ecliptic positions for several Swiss bodies, computed with the
 * Lahiri mode selected only for the duration of the (synchronous) call.
 */
export function calculateSiderealPositions(
  julianDayUt: number,
  bodies: readonly number[],
  ephemeris: JyotishEphemeris = "swiss",
  tracker: EphemerisTracker = new EphemerisTracker(ephemeris)
): RawSidereal[] {
  const flags = ephemerisFlags(ephemeris) | CalcFlag.SIDEREAL;
  return withSiderealMode(SWISS_SIDM_LAHIRI, () =>
    bodies.map((b) => {
      const p = tracker.calc(julianDayUt, b, flags);
      return { longitude: normalizeDegrees(p.longitude), latitude: p.latitude, speed: p.longitudeSpeed };
    })
  );
}

/** True ayanamsa (degrees) in the same flag frame as sidereal planets. */
export function calculateLahiriAyanamsa(
  julianDayUt: number,
  ephemeris: JyotishEphemeris = "swiss",
  tracker: EphemerisTracker = new EphemerisTracker(ephemeris)
): number {
  const [sid] = calculateSiderealPositions(julianDayUt, [Planet.SUN], ephemeris, tracker);
  const trop = tracker.calc(julianDayUt, Planet.SUN, ephemerisFlags(ephemeris));
  return signedAngleBetween(trop.longitude, sid.longitude);
}

function lahiriPoint(
  siderealLongitude: number,
  latitude: number,
  ayanamsa: number,
  ascendant: number | undefined,
  extra: Partial<Pick<LahiriPoint, "longitudeSpeed" | "retrograde" | "derivedFrom">> = {}
): LahiriPoint {
  const longitude = normalizeDegrees(siderealLongitude);
  return {
    ...nakshatraFromPosition(longitude),
    longitude,
    latitude,
    tropicalLongitude: normalizeDegrees(longitude + ayanamsa),
    sidereal: signPlacement(longitude),
    ...(ascendant === undefined ? {} : { wholeSignHouse: wholeSignHouseOf(longitude, ascendant) }),
    ...extra,
  };
}

export function calculateLahiriChart(input: LahiriChartInput): LahiriChart {
  const jd = input.julianDayUt ?? julianDayOf(input.date);
  assertFiniteGeo(jd, input.latitude, input.longitude);
  const timed = input.timed !== false;
  const ephemeris = input.ephemeris ?? "swiss";
  const node = input.node ?? "mean";

  const ids = [...JYOTISH_BODY_IDS];
  const swissIds = [...ids.map(planetIdFor), Planet.MEAN_NODE, Planet.TRUE_NODE];
  const tracker = new EphemerisTracker(ephemeris, input.strictEphemeris);
  const raw = calculateSiderealPositions(jd, swissIds, ephemeris, tracker);
  const ayanamsa = calculateLahiriAyanamsa(jd, ephemeris, tracker);

  const ascendantSidereal = timed
    ? normalizeDegrees(tropicalAscendant(jd, input.latitude, input.longitude) - ayanamsa)
    : undefined;

  const points: LahiriChart["points"] = {};
  ids.forEach((id, i) => {
    if (!timed && id === "moon") return;
    const r = raw[i];
    points[id] = lahiriPoint(r.longitude, r.latitude, ayanamsa, ascendantSidereal, {
      longitudeSpeed: r.speed,
      retrograde: r.speed === undefined ? undefined : r.speed < 0,
    });
  });
  const meanRaw = raw[ids.length];
  const trueRaw = raw[ids.length + 1];
  const mk = (r: RawSidereal, convention: NodeConvention) => {
    const rahu = lahiriPoint(r.longitude, r.latitude, ayanamsa, ascendantSidereal);
    const ketu = lahiriPoint(r.longitude + 180, -r.latitude, ayanamsa, ascendantSidereal, {
      derivedFrom: `${convention}_node antipode`,
    });
    return { rahu, ketu };
  };
  const nodeVariants = { mean: mk(meanRaw, "mean"), true: mk(trueRaw, "true") };
  points.rahu = nodeVariants[node].rahu;
  points.ketu = nodeVariants[node].ketu;

  let ascendant: LahiriPoint | undefined;
  const wholeSignHouses: LahiriChart["wholeSignHouses"] = [];
  if (timed && ascendantSidereal !== undefined) {
    ascendant = lahiriPoint(ascendantSidereal, 0, ayanamsa, ascendantSidereal);
    const ascSign = Math.floor(ascendantSidereal / 30);
    for (let h = 1; h <= 12; h++) {
      const signIndex = (ascSign + h - 1) % 12;
      wholeSignHouses.push({ house: h, signIndex, sign: signPlacement(signIndex * 30).sign });
    }
  }

  return {
    siderealMode: SWISS_SIDM_LAHIRI,
    ayanamsa,
    ayanamsaKind: "true-nutated, tropical minus sidereal of the same body and flags",
    nodeConvention: node,
    timed,
    ephemeris,
    ephemerisUsage: tracker.usage(),
    ascendant,
    points,
    nodeVariants,
    wholeSignHouses,
  };
}
