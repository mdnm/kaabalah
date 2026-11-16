/**
 * Thin ephemeris access for the Jyotish module: geocentric body positions
 * (ecliptic + equatorial), true obliquity and the tropical ascendant at an
 * explicit UT Julian day. Everything here is tropical; sidereal conversion is
 * in `lahiri.ts`.
 */

import {
  CalcFlag,
  HouseSystem,
  Planet,
  SWISS_ECL_NUT,
  calculateBodyAtJulianDay,
  calculateBodyAtJulianDayDetailed,
  calculateHousesAtJulianDay,
  getJulianDay,
  type PlanetPosition,
  type SwissEphemerisKind,
} from "../swisseph";
import { normalizeDegrees } from "./frames";

export type JyotishEphemeris = "swiss" | "moshier";

/** Bodies that carry nakshatras and dashas in both frames (nodes handled separately). */
export const JYOTISH_BODY_IDS = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"] as const;
export type JyotishBodyId = (typeof JYOTISH_BODY_IDS)[number];

const PLANET_BY_ID: Record<JyotishBodyId, Planet> = {
  sun: Planet.SUN,
  moon: Planet.MOON,
  mercury: Planet.MERCURY,
  venus: Planet.VENUS,
  mars: Planet.MARS,
  jupiter: Planet.JUPITER,
  saturn: Planet.SATURN,
};

export type NodeConvention = "mean" | "true";

/** Swiss flags: ephemeris source + speed. Always geocentric, tropical, apparent, of date. */
export function ephemerisFlags(ephemeris: JyotishEphemeris): number {
  return (ephemeris === "moshier" ? CalcFlag.MOSHIER : CalcFlag.SWISS_EPH) | CalcFlag.SPEED;
}

/**
 * Which Swiss ephemeris actually produced the numbers. Swiss Ephemeris silently falls back to
 * Moshier when the .se1 files are missing or the date is outside their range; this records it.
 */
export interface EphemerisUsage {
  requested: JyotishEphemeris;
  /** Distinct ephemerides actually used across every body evaluation of the chart. */
  used: SwissEphemerisKind[];
  /** True when any evaluation used a different ephemeris than requested. */
  substituted: boolean;
  /** Distinct non-fatal Swiss notices (for example the Moshier fallback text). */
  warnings: string[];
}

/** Options shared by the Jyotish calculators. */
export interface EphemerisCheckOptions {
  /** Throw `SwissEphEphemerisMismatchError` instead of returning substituted (e.g. Moshier) output. */
  strictEphemeris?: boolean;
}

/** Collects provenance across body evaluations; threaded through the calculators. */
export class EphemerisTracker {
  private readonly kinds = new Set<SwissEphemerisKind>();
  private readonly notes = new Set<string>();
  private anySubstituted = false;
  constructor(readonly requested: JyotishEphemeris, readonly strictEphemeris?: boolean) {}

  /** Evaluate a body (ecliptic, equatorial or sidereal flags) and record its provenance. */
  calc(julianDayUt: number, planet: number, flags: number): PlanetPosition {
    if (planet === SWISS_ECL_NUT) return calculateBodyAtJulianDay(julianDayUt, planet, flags);
    const d = calculateBodyAtJulianDayDetailed(julianDayUt, planet, flags, {
      strictEphemeris: this.strictEphemeris,
    });
    if (d.ephemeris) this.kinds.add(d.ephemeris);
    if (d.substituted) this.anySubstituted = true;
    if (d.warning) this.notes.add(d.warning.trim());
    return d.position;
  }

  usage(): EphemerisUsage {
    return {
      requested: this.requested,
      used: [...this.kinds].sort(),
      substituted: this.anySubstituted,
      warnings: [...this.notes],
    };
  }
}

/** Combine several usages (e.g. Dhruva + Lahiri) into one chart-level record. */
export function mergeEphemerisUsage(...usages: EphemerisUsage[]): EphemerisUsage {
  return {
    requested: usages[0].requested,
    used: [...new Set(usages.flatMap((u) => u.used))].sort(),
    substituted: usages.some((u) => u.substituted),
    warnings: [...new Set(usages.flatMap((u) => u.warnings))],
  };
}

export interface GeocentricBody {
  /** Apparent tropical ecliptic longitude of date (degrees). */
  longitude: number;
  /** Ecliptic latitude (degrees); retained for the equatorial transformation. */
  latitude: number;
  /** Apparent right ascension, true equator and equinox of date (Swiss `SEFLG_EQUATORIAL`). */
  rightAscension: number;
  declination: number;
}

function body(julianDayUt: number, planet: number, flags: number, tracker: EphemerisTracker): GeocentricBody {
  const ecl = tracker.calc(julianDayUt, planet, flags);
  const equ = tracker.calc(julianDayUt, planet, flags | CalcFlag.EQUATORIAL);
  return {
    longitude: normalizeDegrees(ecl.longitude),
    latitude: ecl.latitude,
    rightAscension: normalizeDegrees(equ.longitude),
    declination: equ.latitude,
  };
}

export interface GeocentricBodies {
  planets: Record<JyotishBodyId, GeocentricBody>;
  meanNode: GeocentricBody;
  trueNode: GeocentricBody;
}

/** Fetch Sun..Saturn and both nodes at a UT Julian day. */
export function calculateGeocentricBodies(
  julianDayUt: number,
  ephemeris: JyotishEphemeris,
  tracker: EphemerisTracker = new EphemerisTracker(ephemeris)
): GeocentricBodies {
  const flags = ephemerisFlags(ephemeris);
  const planets = {} as Record<JyotishBodyId, GeocentricBody>;
  for (const id of JYOTISH_BODY_IDS) planets[id] = body(julianDayUt, PLANET_BY_ID[id], flags, tracker);
  return {
    planets,
    meanNode: body(julianDayUt, Planet.MEAN_NODE, flags, tracker),
    trueNode: body(julianDayUt, Planet.TRUE_NODE, flags, tracker),
  };
}

/** Planet by id, used by the Lahiri module (which needs sidereal flags). */
export function planetIdFor(id: JyotishBodyId): Planet {
  return PLANET_BY_ID[id];
}

/** True obliquity of date in degrees (`SE_ECL_NUT`, first value). */
export function trueObliquity(
  julianDayUt: number,
  ephemeris: JyotishEphemeris,
  tracker: EphemerisTracker = new EphemerisTracker(ephemeris)
): number {
  return tracker.calc(julianDayUt, SWISS_ECL_NUT, ephemerisFlags(ephemeris)).longitude;
}

/** Tropical ascendant (degrees) at a UT Julian day (computed with Equal houses, which never fail at polar latitudes; the ASC is house-system independent). */
export function tropicalAscendant(julianDayUt: number, latitude: number, longitude: number): number {
  return normalizeDegrees(
    calculateHousesAtJulianDay(julianDayUt, latitude, longitude, HouseSystem.EQUAL).ascendant
  );
}

/** UT Julian day of a Date (Swiss `swe_julday`, whole seconds). */
export function julianDayOf(date: Date): number {
  return getJulianDay(date);
}

export function assertFiniteGeo(julianDayUt: number, latitude: number, longitude: number): void {
  if (![julianDayUt, latitude, longitude].every(Number.isFinite)) {
    throw new Error("Finite instant, latitude and longitude are required");
  }
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new Error("Invalid geographic coordinates");
  }
}
