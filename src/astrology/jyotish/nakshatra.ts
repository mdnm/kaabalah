/**
 * Nakshatra sector arithmetic shared by the Dhruva (equatorial) and Lahiri
 * (ecliptic sidereal) frames. Pure functions, no ephemeris.
 */

import { normalizeDegrees } from "./frames";

/** Width of one nakshatra: 360 / 27 degrees. */
export const NAKSHATRA_WIDTH_DEGREES = 40 / 3;
/** Width of one pada: a quarter nakshatra. */
export const PADA_WIDTH_DEGREES = 10 / 3;

/** Stable ids as used by the reference implementation (underscored). */
export const NAKSHATRA_IDS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva_Phalguni", "Uttara_Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva_Ashadha", "Uttara_Ashadha", "Shravana", "Dhanishtha", "Shatabhisha",
  "Purva_Bhadrapada", "Uttara_Bhadrapada", "Revati",
] as const;

export type NakshatraId = (typeof NAKSHATRA_IDS)[number];

/** Vimshottari lord sequence; nakshatra index i is ruled by `VIMSHOTTARI_LORDS[i % 9]`. */
export const VIMSHOTTARI_LORDS = [
  "ketu", "venus", "sun", "moon", "mars", "rahu", "jupiter", "saturn", "mercury",
] as const;
export type VimshottariLord = (typeof VIMSHOTTARI_LORDS)[number];

/** Vimshottari years per lord, aligned with {@link VIMSHOTTARI_LORDS} (sum 120). */
export const VIMSHOTTARI_YEARS: readonly number[] = [7, 20, 6, 10, 7, 18, 16, 19, 17];

export const TROPICAL_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;
export type SignName = (typeof TROPICAL_SIGNS)[number];

export interface SignPlacement {
  /** 0 = Aries ... 11 = Pisces (of the frame the longitude is in). */
  signIndex: number;
  sign: SignName;
  /** Degrees within the sign, [0, 30). */
  degreeInSign: number;
}

export function signPlacement(longitude: number): SignPlacement {
  const lon = normalizeDegrees(longitude);
  const signIndex = Math.min(11, Math.floor(lon / 30));
  return { signIndex, sign: TROPICAL_SIGNS[signIndex], degreeInSign: lon - signIndex * 30 };
}

export interface NakshatraPlacement {
  /** Position measured from the frame's zero point, [0, 360). */
  nakPos: number;
  /** 0-based nakshatra index, 0..26. */
  nakshatraIndex: number;
  /** 1-based nakshatra number, 1..27. */
  nakshatraNumber: number;
  /** Underscored id, e.g. `Purva_Phalguni`. */
  nakshatraId: NakshatraId;
  /** Display name, e.g. `Purva Phalguni`. */
  nakshatra: string;
  /** Pada 1..4. */
  pada: number;
  /** Fraction of the nakshatra already elapsed, [0, 1). */
  elapsedFraction: number;
  /** Vimshottari lord of the nakshatra. */
  lord: VimshottariLord;
}

/**
 * Classify a position that is already measured from the zero point. Mirrors the
 * reference: `index = min(26, floor(pos / (40/3)))`, `pada = min(4, floor(4 *
 * fraction) + 1)` with `fraction = pos/(40/3) - index`.
 */
export function nakshatraFromPosition(nakPosition: number): NakshatraPlacement {
  const nakPos = normalizeDegrees(nakPosition);
  const quotient = nakPos / NAKSHATRA_WIDTH_DEGREES;
  const nakshatraIndex = Math.min(26, Math.floor(quotient));
  const elapsedFraction = quotient - nakshatraIndex;
  const nakshatraId = NAKSHATRA_IDS[nakshatraIndex];
  return {
    nakPos,
    nakshatraIndex,
    nakshatraNumber: nakshatraIndex + 1,
    nakshatraId,
    nakshatra: nakshatraId.replace(/_/g, " "),
    pada: Math.min(4, Math.floor(elapsedFraction * 4) + 1),
    elapsedFraction,
    lord: VIMSHOTTARI_LORDS[nakshatraIndex % 9],
  };
}
