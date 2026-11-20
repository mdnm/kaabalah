/**
 * Parashari divisional charts (vargas), rules of Brihat Parashara Hora Shastra.
 *
 * Pure arithmetic on an ecliptic longitude in whatever frame the caller chose
 * (tropical by default in the helpers that take a chart; this module never
 * converts frames and calls no ephemeris). Sign indices: 0 = Aries ... 11 = Pisces.
 * "Odd" sign means Aries, Gemini, ... (even index); "even" sign means Taurus, Cancer, ...
 */

import { normalizeDegrees } from "./frames";
import { TROPICAL_SIGNS, type SignName } from "./nakshatra";

export const SUPPORTED_VARGAS = [1, 2, 3, 4, 7, 9, 10, 12, 16, 20, 24, 27, 30, 40, 45, 60] as const;
export type VargaDivision = (typeof SUPPORTED_VARGAS)[number];

export const VARGA_NAMES: Readonly<Record<VargaDivision, string>> = {
  1: "Rasi",
  2: "Hora",
  3: "Drekkana",
  4: "Chaturthamsa",
  7: "Saptamsa",
  9: "Navamsa",
  10: "Dasamsa",
  12: "Dwadasamsa",
  16: "Shodasamsa",
  20: "Vimsamsa",
  24: "Chaturvimsamsa",
  27: "Bhamsa",
  30: "Trimsamsa",
  40: "Khavedamsa",
  45: "Akshavedamsa",
  60: "Shashtiamsa",
};

export interface VargaPlacement {
  division: VargaDivision;
  sign: SignName;
  /** 0 = Aries ... 11 = Pisces. */
  signIndex: number;
  /** Position inside the varga sign, scaled back to [0, 30). */
  degree: number;
}

export interface VargaHousePlacement extends VargaPlacement {
  /** Whole-sign house 1..12 counted from the varga lagna; only when a lagna was given. */
  house?: number;
  /** D9 only: the point holds the same sign in the D1 and the D9 (see `isVargottama`). */
  vargottama?: boolean;
}

const EPS = 1e-9;
const mod12 = (n: number) => ((n % 12) + 12) % 12;
const isOddSign = (s: number) => s % 2 === 0;
/** 0 movable (Aries, Cancer, Libra, Capricorn), 1 fixed, 2 dual. */
const modality = (s: number) => s % 3;
/** 0 fire, 1 earth, 2 air, 3 water. */
const element = (s: number) => s % 4;

// Start sign (index) of the count, per rule. Aries 0, Cancer 3, Leo 4, Libra 6, Scorpio 7, Sagittarius 8, Capricorn 9.
/** D9: fire signs start from Aries, earth from Capricorn, air from Libra, water from Cancer. */
const NAVAMSA_START_BY_ELEMENT = [0, 9, 6, 3] as const;
/** D27: fire from Aries, earth from Cancer, air from Libra, water from Capricorn. */
const BHAMSA_START_BY_ELEMENT = [0, 3, 6, 9] as const;
/** D16: movable from Aries, fixed from Leo, dual from Sagittarius. */
const SHODASAMSA_START_BY_MODALITY = [0, 4, 8] as const;
/** D20: movable from Aries, fixed from Sagittarius, dual from Leo. */
const VIMSAMSA_START_BY_MODALITY = [0, 8, 4] as const;
/** D45: movable from Aries, fixed from Leo, dual from Sagittarius. */
const AKSHAVEDAMSA_START_BY_MODALITY = [0, 4, 8] as const;

/**
 * D30 Trimsamsa (unequal): [upper bound in degrees, sign index]. Odd signs: Mars (Aries) 5,
 * Saturn (Aquarius) 5, Jupiter (Sagittarius) 8, Mercury (Gemini) 7, Venus (Libra) 5.
 * Even signs, reversed: Venus (Taurus) 5, Mercury (Virgo) 7, Jupiter (Pisces) 8, Saturn (Capricorn) 5, Mars (Scorpio) 5.
 */
const TRIMSAMSA_ODD: ReadonlyArray<readonly [number, number]> = [[5, 0], [10, 10], [18, 8], [25, 2], [30, 6]];
const TRIMSAMSA_EVEN: ReadonlyArray<readonly [number, number]> = [[5, 1], [12, 5], [20, 11], [25, 9], [30, 7]];

/** Resulting sign index for equal-division varga `n` at part `k` (0-based) of sign `s`. */
function equalVargaSign(division: VargaDivision, s: number, k: number): number {
  switch (division) {
    case 1:
      return s; // D1: the sign itself.
    case 2:
      // D2 Hora (Parashari): odd sign 1st half Sun's hora (Leo), 2nd Moon's (Cancer); even sign reversed.
      return (k === 0) === isOddSign(s) ? 4 : 3;
    case 3:
      return s + 4 * k; // D3: the sign itself, its 5th and its 9th.
    case 4:
      return s + 3 * k; // D4: the sign itself, then its 4th, 7th, 10th.
    case 7:
      return (isOddSign(s) ? s : s + 6) + k; // D7: odd signs from the sign itself, even from its 7th.
    case 9:
      return NAVAMSA_START_BY_ELEMENT[element(s)] + k; // D9: see NAVAMSA_START_BY_ELEMENT.
    case 10:
      return (isOddSign(s) ? s : s + 8) + k; // D10: odd signs from the sign itself, even from its 9th.
    case 12:
      return s + k; // D12: from the sign itself.
    case 16:
      return SHODASAMSA_START_BY_MODALITY[modality(s)] + k;
    case 20:
      return VIMSAMSA_START_BY_MODALITY[modality(s)] + k;
    case 24:
      return (isOddSign(s) ? 4 : 3) + k; // D24: odd signs from Leo, even from Cancer.
    case 27:
      return BHAMSA_START_BY_ELEMENT[element(s)] + k;
    case 40:
      return (isOddSign(s) ? 0 : 6) + k; // D40: odd signs from Aries, even from Libra.
    case 45:
      return AKSHAVEDAMSA_START_BY_MODALITY[modality(s)] + k;
    case 60:
      return s + k; // D60: from the sign itself, 0.5 degree each, same count for odd and even signs.
    default:
      throw new Error(`Unreachable division ${division}`);
  }
}

export function isSupportedVarga(division: number): division is VargaDivision {
  return (SUPPORTED_VARGAS as readonly number[]).includes(division);
}

/** Varga placement of an ecliptic longitude (degrees, any frame, any real number). */
export function getVarga(longitude: number, division: number): VargaPlacement {
  if (!Number.isFinite(longitude)) throw new Error("longitude must be finite");
  if (!isSupportedVarga(division)) throw new Error(`Unsupported varga D${division}`);
  const lon = normalizeDegrees(longitude);
  const s = Math.min(11, Math.floor(lon / 30));
  const d = Math.min(lon - s * 30, 30 - 1e-12);

  let signIndex: number;
  let degree: number;
  if (division === 30) {
    const table = isOddSign(s) ? TRIMSAMSA_ODD : TRIMSAMSA_EVEN;
    let lower = 0;
    let row = table[table.length - 1];
    for (const r of table) {
      if (d < r[0] - EPS) {
        row = r;
        break;
      }
      lower = r[0];
    }
    signIndex = row[1];
    degree = ((d - lower) / (row[0] - lower)) * 30; // scaled across the unequal part
  } else {
    const width = 30 / (division === 2 ? 2 : division);
    const parts = division === 2 ? 2 : division;
    const k = Math.min(parts - 1, Math.floor(d / width + EPS));
    signIndex = mod12(equalVargaSign(division, s, k));
    degree = ((d - k * width) / width) * 30;
  }
  degree = Math.min(Math.max(degree, 0), 30 - 1e-12);
  return { division, sign: TROPICAL_SIGNS[signIndex], signIndex, degree };
}

/**
 * Vargottama: the longitude falls in the same sign in the D1 (rasi) and in the varga, the
 * navamsa (D9) unless another `division` is given. In the D9 this is the first navamsa
 * (0 to 3 deg 20) of a movable sign, the fifth (13 deg 20 to 16 deg 40) of a fixed sign and
 * the ninth (26 deg 40 to 30) of a dual sign.
 *
 * Both signs are read from the one longitude passed in, so the D1 sign is the sign of that
 * longitude in the caller's frame (tropical throughout this library unless the caller
 * converts first); a sidereal longitude gives the sidereal answer.
 */
export function isVargottama(longitude: number, division: number = 9): boolean {
  return getVarga(longitude, 1).signIndex === getVarga(longitude, division).signIndex;
}

export interface VargaChart<K extends string = string> {
  division: VargaDivision;
  /** Key of the lagna point used for houses, if one was present. */
  lagnaKey?: string;
  placements: Record<K, VargaHousePlacement>;
}

export interface VargaChartOptions {
  /** Key of the lagna in `points`. Default "lagna". */
  lagnaKey?: string;
}

/**
 * Varga placements of a record of longitudes (planets, nodes, lagna). When the lagna key is
 * present, every placement carries its whole-sign house counted from the varga lagna's sign.
 * D9 placements also carry `vargottama`.
 */
export function getVargaChart<K extends string>(
  points: Record<K, number>,
  division: number,
  options: VargaChartOptions = {}
): VargaChart<K> {
  const lagnaKey = options.lagnaKey ?? "lagna";
  const hasLagna = Object.prototype.hasOwnProperty.call(points, lagnaKey);
  const lagnaSign = hasLagna ? getVarga(points[lagnaKey as K], division).signIndex : undefined;
  const placements = {} as Record<K, VargaHousePlacement>;
  for (const key of Object.keys(points) as K[]) {
    const v = getVarga(points[key], division);
    placements[key] = {
      ...v,
      ...(lagnaSign === undefined ? {} : { house: mod12(v.signIndex - lagnaSign) + 1 }),
      ...(v.division === 9 ? { vargottama: isVargottama(points[key]) } : {}),
    };
  }
  return { division: getVarga(0, division).division, ...(hasLagna ? { lagnaKey } : {}), placements };
}
