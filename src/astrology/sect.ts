/**
 * Sect (diurnal / nocturnal) from the physical horizon.
 *
 * Sect is a property of the sky, not of the house system: a chart is diurnal
 * when the Sun is above the horizon at the birth place and nocturnal otherwise.
 * The legacy `getSect(sunHouse)` approximation (in `./index`) only matches this
 * when the quadrant house cusps coincide with the horizon (Placidus-like
 * systems); in whole-sign houses it can be wrong by up to a whole sign.
 */

import type { Sect } from "./index";
import { calculateAzalt } from "./swisseph";

/** Which Sun altitude decides the sect. */
export type SectAltitudeBasis =
  /** True (unrefracted) altitude of the Sun's centre of disc. Default. */
  | "geometric"
  /** Altitude including standard atmospheric refraction (1013.25 mbar, 15 C). */
  | "apparent";

export interface SectOptions {
  /** Altitude basis; default `"geometric"`. */
  basis?: SectAltitudeBasis;
  /**
   * Sun altitude threshold in degrees (default 0, the mathematical horizon).
   * Sect is diurnal when altitude is strictly greater than the threshold.
   */
  horizonAltitude?: number;
}

export interface SectResult {
  sect: Sect;
  /** True (geometric) altitude of the Sun's centre, degrees. */
  sunGeometricAltitude: number;
  /** Refraction-corrected altitude, degrees. */
  sunApparentAltitude: number;
  /** Altitude actually compared against the threshold. */
  altitudeUsed: number;
  method: {
    basis: SectAltitudeBasis;
    horizonAltitude: number;
    /** Exact-horizon convention. */
    exactHorizon: "nocturnal";
    description: string;
  };
}

/**
 * Exact-horizon convention: sect is `"diurnal"` only when the altitude is
 * strictly greater than the threshold; an altitude exactly equal to the
 * threshold (0 by default) is `"nocturnal"`. Callers wanting the opposite
 * convention can use `sunGeometricAltitude` from the result.
 */
export function getSectFromAltitude(altitude: number, horizonAltitude = 0): Sect {
  if (!Number.isFinite(altitude)) {
    throw new Error("Sun altitude must be a finite number");
  }
  return altitude > horizonAltitude ? "diurnal" : "nocturnal";
}

/**
 * Compute sect from the Sun's position at the birth place. Requires an
 * initialised Swiss Ephemeris (it calls swe_azalt with default pressure and
 * temperature for the apparent altitude).
 *
 * @param dateUtc instant of birth (UTC)
 * @param sun ecliptic longitude/latitude of the Sun (degrees)
 */
export function computeSect(
  dateUtc: Date,
  latitude: number,
  longitude: number,
  sun: { longitude: number; latitude?: number; distance?: number },
  options: SectOptions = {}
): SectResult {
  const basis = options.basis ?? "geometric";
  const horizonAltitude = options.horizonAltitude ?? 0;
  const az = calculateAzalt(
    dateUtc,
    latitude,
    longitude,
    sun.longitude,
    sun.latitude ?? 0,
    sun.distance ?? 1
  );
  const altitudeUsed = basis === "geometric" ? az.trueAltitude : az.apparentAltitude;
  return {
    sect: getSectFromAltitude(altitudeUsed, horizonAltitude),
    sunGeometricAltitude: az.trueAltitude,
    sunApparentAltitude: az.apparentAltitude,
    altitudeUsed,
    method: {
      basis,
      horizonAltitude,
      exactHorizon: "nocturnal",
      description:
        "diurnal when the Sun's " +
        (basis === "geometric" ? "geometric (unrefracted) centre-of-disc" : "apparent (refracted)") +
        ` altitude is strictly above ${horizonAltitude} degrees; exactly on the threshold counts as nocturnal; independent of house system`,
    },
  };
}
