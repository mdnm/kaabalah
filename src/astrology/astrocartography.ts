/**
 * Astro*Carto*Graphy (ACG) — locational astrology.
 *
 * Computes where each planet falls on the four angles (MC, IC, AC, DC)
 * across the globe, and queries a specific location for nearby lines
 * and paran crossings.
 *
 * MC/IC lines are pure math (GMST − RA). AC/DC lines require a latitude
 * sweep solving cos(H) = −tan(φ)·tan(δ).
 */

import {
  calculateEquatorialPosition,
  type EquatorialPosition,
  getJulianDay,
  normalizeAngle,
  Planet,
  PLANET_AND_NODE_NAMES,
} from "./swisseph";

// ─── Types ──────────────────────────────────────────────────────────────

export type AngleType = "MC" | "IC" | "AC" | "DC";

export interface AstrocartographyLineProximity {
  planet: string;
  angle: AngleType;
  /** Degrees of longitude separation (always positive, 0-180). */
  distance: number;
  /** True when distance ≤ orb. */
  active: boolean;
  /** The line's geographic longitude at the query latitude (-180..180). */
  longitude: number;
}

export interface AstrocartographyParan {
  latitude: number;
  planetA: string;
  angleA: AngleType;
  longitudeA: number;
  planetB: string;
  angleB: AngleType;
  longitudeB: number;
}

export interface AstrocartographyQueryResult {
  queryLatitude: number;
  queryLongitude: number;
  orb: number;
  lines: AstrocartographyLineProximity[];
  activeLines: AstrocartographyLineProximity[];
  parans: AstrocartographyParan[];
}

export interface AstrocartographyMeridianLine {
  planet: string;
  angle: "MC" | "IC";
  /** Geographic longitude (-180..180). */
  longitude: number;
}

export interface AstrocartographyHorizonPoint {
  latitude: number;
  longitude: number;
}

export interface AstrocartographyHorizonLine {
  planet: string;
  angle: "AC" | "DC";
  points: AstrocartographyHorizonPoint[];
}

export interface AstrocartographyMap {
  meridianLines: AstrocartographyMeridianLine[];
  horizonLines: AstrocartographyHorizonLine[];
}

export interface AstrocartographyMapOptions {
  /** Degrees between latitude sample points (default 1). */
  latitudeStep?: number;
  /** Maximum latitude to sweep (default 66.5). */
  latitudeRange?: number;
  /** Planets to include (default: ASTROCARTOGRAPHY_DEFAULT_PLANETS). */
  planets?: Planet[];
}

export interface AstrocartographyQueryOptions {
  latitude: number;
  longitude: number;
  /** Orb in degrees (default 2). */
  orb?: number;
  /** Planets to include (default: ASTROCARTOGRAPHY_DEFAULT_PLANETS). */
  planets?: Planet[];
  /** Paran orb in degrees (default 1). */
  paranOrb?: number;
}

// ─── Constants ──────────────────────────────────────────────────────────

/** Default planet set for ACG (traditional + modern, no Lilith). */
export const ASTROCARTOGRAPHY_DEFAULT_PLANETS: Planet[] = [
  Planet.SUN,
  Planet.MOON,
  Planet.MERCURY,
  Planet.VENUS,
  Planet.MARS,
  Planet.JUPITER,
  Planet.SATURN,
  Planet.URANUS,
  Planet.NEPTUNE,
  Planet.PLUTO,
  Planet.CHIRON,
  Planet.TRUE_NODE,
];

const DEG = Math.PI / 180;

// ─── Pure math ──────────────────────────────────────────────────────────

/**
 * Greenwich Mean Sidereal Time from Julian Day (degrees, 0-360).
 */
export function computeGMST(julianDay: number): number {
  return normalizeAngle(
    280.46061837 + 360.98564736629 * (julianDay - 2451545.0)
  );
}

/**
 * Geographic longitude where a planet's MC line falls.
 * Returns value in -180..180.
 */
export function computeMCLongitude(gmst: number, ra: number): number {
  return toGeoLon(normalizeAngle(gmst - ra));
}

/**
 * Geographic longitude where a planet's IC line falls (opposite MC).
 */
export function computeICLongitude(gmst: number, ra: number): number {
  return toGeoLon(normalizeAngle(gmst - ra + 180));
}

/**
 * Geographic longitude where a planet rises (AC) or sets (DC)
 * at a given geographic latitude.
 *
 * Returns null if the planet is circumpolar or never rises at this latitude.
 */
export function computeHorizonLongitude(
  gmst: number,
  ra: number,
  dec: number,
  latitude: number,
  angle: "AC" | "DC"
): number | null {
  const tanPhi = Math.tan(latitude * DEG);
  const tanDelta = Math.tan(dec * DEG);
  const cosH = -(tanPhi * tanDelta);

  // Circumpolar or never visible
  if (Math.abs(cosH) > 1) return null;

  const H = Math.acos(cosH) / DEG; // hour angle in degrees

  // AC (rising) = east of meridian = negative hour angle
  // DC (setting) = west of meridian = positive hour angle
  const lon =
    angle === "AC"
      ? normalizeAngle(gmst - ra - H)
      : normalizeAngle(gmst - ra + H);

  return toGeoLon(lon);
}

/**
 * Shortest angular distance between two geographic longitudes.
 * Returns 0..180.
 */
export function geographicAngularDifference(a: number, b: number): number {
  const d = normalizeAngle(a - b);
  return d > 180 ? 360 - d : d;
}

/**
 * Convert 0..360 ecliptic-style longitude to -180..180 geographic longitude.
 * 0-180 → 0 to 180 (east), 180-360 → -180 to 0 (west).
 */
function toGeoLon(deg360: number): number {
  const n = normalizeAngle(deg360);
  return n > 180 ? n - 360 : n;
}

// ─── Equatorial position helpers ────────────────────────────────────────

export interface PlanetEquatorial {
  ra: number;
  dec: number;
  planetId: Planet;
}

/**
 * Compute equatorial positions (RA/Dec) for a set of planets at a UTC date.
 */
export function computeEquatorialPositions(
  date: Date,
  planets: Planet[] = ASTROCARTOGRAPHY_DEFAULT_PLANETS
): Record<string, PlanetEquatorial> {
  const result: Record<string, PlanetEquatorial> = {};
  for (const p of planets) {
    const name = PLANET_AND_NODE_NAMES[p];
    const eq = calculateEquatorialPosition(date, p);
    result[name] = {
      ra: eq.rightAscension,
      dec: eq.declination,
      planetId: p,
    };
  }
  return result;
}

// ─── Paran detection ────────────────────────────────────────────────────

/**
 * Find paran crossings at a given latitude.
 *
 * A paran exists when two different planet's angle-lines
 * pass through the same latitude within `paranOrb` degrees of longitude.
 */
export function findParansAtLatitude(
  equatorialPositions: Record<string, PlanetEquatorial>,
  gmst: number,
  latitude: number,
  paranOrb = 1
): AstrocartographyParan[] {
  const ANGLES: AngleType[] = ["MC", "IC", "AC", "DC"];

  // Build all lines at this latitude
  interface LineAt {
    planet: string;
    angle: AngleType;
    longitude: number;
  }
  const lines: LineAt[] = [];

  for (const [name, eq] of Object.entries(equatorialPositions)) {
    for (const angle of ANGLES) {
      let lon: number | null;
      if (angle === "MC") lon = computeMCLongitude(gmst, eq.ra);
      else if (angle === "IC") lon = computeICLongitude(gmst, eq.ra);
      else lon = computeHorizonLongitude(gmst, eq.ra, eq.dec, latitude, angle);

      if (lon !== null) {
        lines.push({ planet: name, angle, longitude: lon });
      }
    }
  }

  // Compare all pairs from different planets
  const parans: AstrocartographyParan[] = [];
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      const a = lines[i];
      const b = lines[j];
      if (a.planet === b.planet) continue; // same planet, skip
      if (a.angle === b.angle) continue; // same angle type, skip (not a crossing)

      const dist = geographicAngularDifference(a.longitude, b.longitude);
      if (dist <= paranOrb) {
        parans.push({
          latitude,
          planetA: a.planet,
          angleA: a.angle,
          longitudeA: a.longitude,
          planetB: b.planet,
          angleB: b.angle,
          longitudeB: b.longitude,
        });
      }
    }
  }
  return parans;
}

// ─── Query function (primary API) ───────────────────────────────────────

/**
 * Query a specific location against a birth chart's ACG lines.
 *
 * Returns how close each planet's angle line is to the query location,
 * which lines are "active" (within orb), and paran crossings at the
 * query latitude.
 */
export function queryAstrocartographyLocation(
  date: Date,
  options: AstrocartographyQueryOptions
): AstrocartographyQueryResult {
  const {
    latitude,
    longitude,
    orb = 2,
    planets = ASTROCARTOGRAPHY_DEFAULT_PLANETS,
    paranOrb = 1,
  } = options;

  const jd = getJulianDay(date);
  const gmst = computeGMST(jd);
  const positions = computeEquatorialPositions(date, planets);

  const lines: AstrocartographyLineProximity[] = [];
  const ANGLES: AngleType[] = ["MC", "IC", "AC", "DC"];

  for (const [name, eq] of Object.entries(positions)) {
    for (const angle of ANGLES) {
      let lineLon: number | null;
      if (angle === "MC") lineLon = computeMCLongitude(gmst, eq.ra);
      else if (angle === "IC") lineLon = computeICLongitude(gmst, eq.ra);
      else
        lineLon = computeHorizonLongitude(
          gmst,
          eq.ra,
          eq.dec,
          latitude,
          angle
        );

      if (lineLon === null) continue; // circumpolar, no line at this latitude

      const dist = geographicAngularDifference(longitude, lineLon);
      lines.push({
        planet: name,
        angle,
        distance: Math.round(dist * 1000) / 1000,
        active: dist <= orb,
        longitude: Math.round(lineLon * 1000) / 1000,
      });
    }
  }

  // Sort by distance ascending
  lines.sort((a, b) => a.distance - b.distance);

  const activeLines = lines.filter((l) => l.active);
  const parans = findParansAtLatitude(positions, gmst, latitude, paranOrb);

  return { queryLatitude: latitude, queryLongitude: longitude, orb, lines, activeLines, parans };
}

// ─── Full map generation ────────────────────────────────────────────────

/**
 * Generate the full ACG map: MC/IC lines (constant longitudes) and
 * AC/DC lines (arrays of lat/lon points from a latitude sweep).
 */
export function computeAstrocartographyMap(
  date: Date,
  options: AstrocartographyMapOptions = {}
): AstrocartographyMap {
  const {
    latitudeStep = 1,
    latitudeRange = 66.5,
    planets = ASTROCARTOGRAPHY_DEFAULT_PLANETS,
  } = options;

  const jd = getJulianDay(date);
  const gmst = computeGMST(jd);
  const positions = computeEquatorialPositions(date, planets);

  const meridianLines: AstrocartographyMeridianLine[] = [];
  const horizonLines: AstrocartographyHorizonLine[] = [];

  for (const [name, eq] of Object.entries(positions)) {
    // MC / IC — constant longitude lines
    meridianLines.push({
      planet: name,
      angle: "MC",
      longitude: Math.round(computeMCLongitude(gmst, eq.ra) * 1000) / 1000,
    });
    meridianLines.push({
      planet: name,
      angle: "IC",
      longitude: Math.round(computeICLongitude(gmst, eq.ra) * 1000) / 1000,
    });

    // AC / DC — sweep latitudes
    for (const angle of ["AC", "DC"] as const) {
      const points: AstrocartographyHorizonPoint[] = [];
      for (
        let lat = -latitudeRange;
        lat <= latitudeRange;
        lat += latitudeStep
      ) {
        const lon = computeHorizonLongitude(gmst, eq.ra, eq.dec, lat, angle);
        if (lon !== null) {
          points.push({
            latitude: Math.round(lat * 1000) / 1000,
            longitude: Math.round(lon * 1000) / 1000,
          });
        }
      }
      horizonLines.push({ planet: name, angle, points });
    }
  }

  return { meridianLines, horizonLines };
}
