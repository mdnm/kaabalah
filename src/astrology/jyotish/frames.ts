/**
 * Celestial-frame mathematics for the Dhruva (equatorial) nakshatra method.
 *
 * Pure, browser-safe, no ephemeris dependency. Ports exactly what Astropy
 * (checked against 8.0.2 / pyerfa 2.0.1.5) does for
 *
 *   SkyCoord(ra, dec, frame=ICRS()).transform_to(FK5(equinox=Time(jd, format="jd", scale="utc")))
 *
 * which is NOT the IAU 1976 precession and includes no nutation, aberration
 * or proper motion:
 *
 *   1. ICRS -> FK5 J2000: the three-rotation frame-bias matrix of USNO
 *      Circular 179 (eta0 = -19.9 mas, xi0 = 9.1 mas, da0 = -22.9 mas),
 *      `Rx(-eta0) Ry(xi0) Rz(da0)`.
 *   2. FK5 J2000 -> FK5 of date: the bias-free IAU 2006 (Capitaine et al.)
 *      precession matrix, `erfa.bp06(...)[1]` = Fukushima-Williams matrix of
 *      date times the transpose of the Fukushima-Williams matrix at J2000.
 *      Result is the MEAN equator and equinox of date.
 *   3. The epoch of date is the supplied Julian date read on the UTC scale and
 *      converted UTC -> TAI -> TT (leap seconds, then +32.184 s).
 *
 * All angles are degrees unless a name says radians.
 */

const DEG = Math.PI / 180;
const ARCSEC = DEG / 3600;
const MAS = ARCSEC / 1000;

export const JD_J2000 = 2451545.0;
export const JULIAN_CENTURY_DAYS = 36525;
export const TT_MINUS_TAI_SECONDS = 32.184;

export function normalizeDegrees(value: number): number {
  const v = value % 360;
  return v < 0 ? v + 360 : v;
}

/** Signed smallest difference a - b in (-180, 180]. */
export function signedAngleBetween(a: number, b: number): number {
  const d = normalizeDegrees(a - b);
  return d > 180 ? d - 360 : d;
}

// ---------------------------------------------------------------------------
// UTC -> TT
// ---------------------------------------------------------------------------

// [year, month, TAI-UTC seconds] from 1972 (integer leap seconds). Matches the
// ERFA `eraDat` table up to the 2017 step; later dates hold 37 s, as ERFA does.
const LEAP_SECONDS: ReadonlyArray<readonly [number, number, number]> = [
  [1972, 1, 10], [1972, 7, 11], [1973, 1, 12], [1974, 1, 13], [1975, 1, 14],
  [1976, 1, 15], [1977, 1, 16], [1978, 1, 17], [1979, 1, 18], [1980, 1, 19],
  [1981, 7, 20], [1982, 7, 21], [1983, 7, 22], [1985, 7, 23], [1988, 1, 24],
  [1990, 1, 25], [1991, 1, 26], [1992, 7, 27], [1993, 7, 28], [1994, 7, 29],
  [1996, 1, 30], [1997, 7, 31], [1999, 1, 32], [2006, 1, 33], [2009, 1, 34],
  [2012, 7, 35], [2015, 7, 36], [2017, 1, 37],
];

// Pre-1972 rubber-second UTC: [year, month, base seconds, reference MJD, rate s/day].
const PRE_1972: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [1960, 1, 1.417818, 37300, 0.001296],
  [1961, 1, 1.422818, 37300, 0.001296],
  [1961, 8, 1.372818, 37300, 0.001296],
  [1962, 1, 1.845858, 37665, 0.0011232],
  [1963, 11, 1.945858, 37665, 0.0011232],
  [1964, 1, 3.24013, 38761, 0.001296],
  [1964, 4, 3.34013, 38761, 0.001296],
  [1964, 9, 3.44013, 38761, 0.001296],
  [1965, 1, 3.54013, 38761, 0.001296],
  [1965, 3, 3.64013, 38761, 0.001296],
  [1965, 7, 3.74013, 38761, 0.001296],
  [1965, 9, 3.84013, 38761, 0.001296],
  [1966, 1, 4.31317, 39126, 0.002592],
  [1968, 2, 4.21317, 39126, 0.002592],
];

/** Gregorian calendar (year, month) of a Julian date (Fliegel-Van Flandern style, valid for the Gregorian era). */
function yearMonthOfJd(jd: number): [number, number] {
  let l = Math.floor(jd + 0.5) + 68569;
  const n = Math.floor((4 * l) / 146097);
  l = l - Math.floor((146097 * n + 3) / 4);
  const i = Math.floor((4000 * (l + 1)) / 1461001);
  l = l - Math.floor((1461 * i) / 4) + 31;
  const j = Math.floor((80 * l) / 2447);
  const month = j + 2 - 12 * Math.floor(j / 11);
  const year = 100 * (n - 49) + i + Math.floor(j / 11);
  return [year, month];
}

/**
 * TAI - UTC in seconds for a UTC Julian date, reproducing ERFA `eraDat`:
 * 0 before 1960 (ERFA flags this as "dubious year" but returns 0), drifting
 * rubber-second offsets 1960-1971, integer leap seconds after, held at the last
 * tabulated value for later dates.
 */
export function taiMinusUtcSeconds(jdUtc: number): number {
  const [year, month] = yearMonthOfJd(jdUtc);
  const key = year * 12 + (month - 1);
  if (key < 1960 * 12) return 0;
  if (key >= 1972 * 12) {
    let value = LEAP_SECONDS[0][2];
    for (const [y, m, s] of LEAP_SECONDS) {
      if (key >= y * 12 + (m - 1)) value = s;
      else break;
    }
    return value;
  }
  let row = PRE_1972[0];
  for (const r of PRE_1972) {
    if (key >= r[0] * 12 + (r[1] - 1)) row = r;
    else break;
  }
  const mjd = jdUtc - 2400000.5;
  return row[2] + (mjd - row[3]) * row[4];
}

/** Julian date on the TT scale for a Julian date read on the UTC scale (Astropy `Time(jd, format="jd", scale="utc")`). */
export function utcJdToTtJd(jdUtc: number): number {
  return jdUtc + (taiMinusUtcSeconds(jdUtc) + TT_MINUS_TAI_SECONDS) / 86400;
}

// ---------------------------------------------------------------------------
// IAU 2006 precession (Fukushima-Williams)
// ---------------------------------------------------------------------------

type Matrix3 = [number, number, number, number, number, number, number, number, number];

function mul(a: Matrix3, b: Matrix3): Matrix3 {
  const r = new Array(9) as Matrix3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      r[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j];
    }
  }
  return r;
}

function transpose(a: Matrix3): Matrix3 {
  return [a[0], a[3], a[6], a[1], a[4], a[7], a[2], a[5], a[8]];
}

// ERFA-style rotation matrices (rotation of the coordinate frame by `phi`).
function rotX(phi: number): Matrix3 {
  const s = Math.sin(phi);
  const c = Math.cos(phi);
  return [1, 0, 0, 0, c, s, 0, -s, c];
}
function rotY(phi: number): Matrix3 {
  const s = Math.sin(phi);
  const c = Math.cos(phi);
  return [c, 0, -s, 0, 1, 0, s, 0, c];
}
function rotZ(phi: number): Matrix3 {
  const s = Math.sin(phi);
  const c = Math.cos(phi);
  return [c, s, 0, -s, c, 0, 0, 0, 1];
}

function poly(t: number, c: readonly number[]): number {
  let v = 0;
  for (let i = c.length - 1; i >= 0; i--) v = v * t + c[i];
  return v;
}

/** `eraPfw06` angles at TT Julian date: gamma_bar, phi_bar, psi_bar, eps_A (radians). */
function fukushimaWilliamsAngles(jdTt: number): [number, number, number, number] {
  const t = (jdTt - JD_J2000) / JULIAN_CENTURY_DAYS;
  const gamb = poly(t, [-0.052928, 10.556378, 0.4932044, -0.00031238, -0.000002788, 0.000000026]) * ARCSEC;
  const phib = poly(t, [84381.412819, -46.811016, 0.0511268, 0.00053289, -0.00000044, -0.0000000176]) * ARCSEC;
  const psib = poly(t, [-0.041775, 5038.481484, 1.5584175, -0.00018522, -0.000026452, -0.0000000148]) * ARCSEC;
  const epsa = poly(t, [84381.406, -46.836769, -0.0001831, 0.0020034, -0.000000576, -0.0000000434]) * ARCSEC;
  return [gamb, phib, psib, epsa];
}

/** `eraFw2m`: R = Rx(-eps) Rz(-psi) Rx(phi) Rz(gamma). */
function fw2m(gamb: number, phib: number, psib: number, epsa: number): Matrix3 {
  return mul(rotX(-epsa), mul(rotZ(-psib), mul(rotX(phib), rotZ(gamb))));
}

/**
 * Bias-free IAU 2006 precession matrix J2000 -> mean equator/equinox of date
 * (`erfa.bp06(jd1, jd2)[1]`), for a TT Julian date.
 */
export function precessionMatrixJ2000ToDate(jdTt: number): Matrix3 {
  const [g0, p0, s0, e0] = fukushimaWilliamsAngles(JD_J2000);
  const bias = fw2m(g0, p0, s0, e0);
  const [g, p, s, e] = fukushimaWilliamsAngles(jdTt);
  return mul(fw2m(g, p, s, e), transpose(bias));
}

/** USNO Circular 179 ICRS -> FK5 J2000 frame-bias matrix, as in Astropy `_icrs_to_fk5_matrix`. */
export function icrsToFk5J2000Matrix(): Matrix3 {
  const eta0 = -19.9 * MAS;
  const xi0 = 9.1 * MAS;
  const da0 = -22.9 * MAS;
  // Astropy `rotation_matrix(angle, axis)` uses the same frame-rotation convention as ERFA Rx/Ry/Rz.
  return mul(rotX(-eta0), mul(rotY(xi0), rotZ(da0)));
}

export interface EquatorialCoordinate {
  /** Right ascension, degrees in [0, 360). */
  rightAscension: number;
  /** Declination, degrees. */
  declination: number;
}

function toUnit(ra: number, dec: number): [number, number, number] {
  const a = ra * DEG;
  const d = dec * DEG;
  return [Math.cos(d) * Math.cos(a), Math.cos(d) * Math.sin(a), Math.sin(d)];
}

function fromUnit(v: readonly [number, number, number]): EquatorialCoordinate {
  const [x, y, z] = v;
  return {
    rightAscension: normalizeDegrees(Math.atan2(y, x) / DEG),
    declination: Math.atan2(z, Math.hypot(x, y)) / DEG,
  };
}

function apply(m: Matrix3, v: readonly [number, number, number]): [number, number, number] {
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
  ];
}

/**
 * ICRS -> FK5 mean equator and equinox of date. `jdUtc` is the Julian date read
 * on the UTC scale (the reference passes the UT Julian day; UT1-UTC < 0.9 s is
 * ignored exactly as the reference ignores it).
 */
export function icrsToFk5OfDate(
  rightAscensionIcrs: number,
  declinationIcrs: number,
  jdUtc: number
): EquatorialCoordinate {
  const bias = icrsToFk5J2000Matrix();
  const prec = precessionMatrixJ2000ToDate(utcJdToTtJd(jdUtc));
  return fromUnit(apply(mul(prec, bias), toUnit(rightAscensionIcrs, declinationIcrs)));
}

/** Right ascension (degrees) of an ecliptic point on the ecliptic (beta = 0) of obliquity `obliquityDegrees`. */
export function ecliptic0ToRightAscension(longitude: number, obliquityDegrees: number): number {
  const l = longitude * DEG;
  const e = obliquityDegrees * DEG;
  return normalizeDegrees(Math.atan2(Math.sin(l) * Math.cos(e), Math.cos(l)) / DEG);
}

/** Declination (degrees) of an ecliptic point at beta = 0. */
export function ecliptic0ToDeclination(longitude: number, obliquityDegrees: number): number {
  const l = longitude * DEG;
  const e = obliquityDegrees * DEG;
  return Math.asin(Math.sin(l) * Math.sin(e)) / DEG;
}
