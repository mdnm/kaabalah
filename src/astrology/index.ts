/**
 * Astrological calculations using Swiss Ephemeris
 */

import {
  CalcFlag,
  calculateHouses,
  calculatePlanetaryPositions,
  closeSwissEph,
  getSwissEph,
  HouseSystem,
  normalizeAngle,
  Planet
} from './swisseph';

export { CalcFlag, closeSwissEph, getSwissEph, HouseSystem, normalizeAngle, Planet };

export interface BirthChartOptions {
  date: Date;
  latitude: number;
  longitude: number;
  timezone: number;
  houseSystem?: HouseSystem;
}

export interface BirthChart {
  dateUtc: Date;
  planets: Record<string, { longitude: number; latitude: number; distance: number }>;
  houses: {
    houses: number[];
    ascendant: number;
    mc: number;
  };
}

function validateInputs(options: BirthChartOptions): void {
  if (!(options.date instanceof Date) || isNaN(options.date.getTime())) {
    throw new Error('Invalid date provided');
  }

  if (typeof options.latitude !== 'number' || options.latitude < -90 || options.latitude > 90) {
    throw new Error('Invalid latitude: must be between -90 and 90 degrees');
  }

  if (typeof options.longitude !== 'number' || options.longitude < -180 || options.longitude > 180) {
    throw new Error('Invalid longitude: must be between -180 and 180 degrees');
  }

  if (typeof options.timezone !== 'number' || options.timezone < -12 || options.timezone > 14) {
    throw new Error('Invalid timezone: must be between -12 and +14');
  }
}

/**
 * Calculate a birth chart using Swiss Ephemeris
 * 
 * @param options Chart calculation options
 * @returns Birth chart data
 */
export async function getBirthChart(options: BirthChartOptions): Promise<BirthChart> {
  try {
    // Validate inputs
    validateInputs(options);

    // Convert local time to UTC
    const localDate = new Date(options.date);
    const utcDate = new Date(localDate.getTime() - (options.timezone * 60 * 60 * 1000));

    // Calculate planetary positions
    const planets = await calculatePlanetaryPositions(utcDate);
    if (!planets) {
      throw new Error('Failed to calculate planetary positions');
    }

    // Calculate houses
    const houses = await calculateHouses(
      utcDate,
      options.latitude,
      options.longitude,
      options.houseSystem || HouseSystem.PLACIDUS
    );
    if (!houses) {
      throw new Error('Failed to calculate houses');
    }

    return {
      dateUtc: utcDate,
      planets,
      houses
    };
  } catch (error) {
    console.error('Error calculating birth chart:', error);
    throw error;
  }
}

export const SIGNS = [
  'Aries','Taurus','Gemini','Cancer',
  'Leo','Virgo','Libra','Scorpio',
  'Sagittarius','Capricorn','Aquarius','Pisces'
] as const;

/**
 * Convert decimal degrees to degrees and minutes format
 * 
 * @param decimalDegrees Decimal degrees (e.g., 9.8)
 * @returns Formatted string (e.g., "9°48'")
 */
export function formatDegreeMinutes(decimalDegrees: number): string {
  let deg = Math.floor(decimalDegrees);
  let min = Math.round((decimalDegrees - deg) * 60);
  if (min === 60) { min = 0; deg += 1; } // carry
  return `${deg}°${String(min).padStart(2,'0')}'`;
}

/**
 * Convert decimal degrees to zodiac position (sign and degrees)
 * 
 * @param longitude Longitude in decimal degrees (0-360)
 * @returns Formatted zodiac position with both decimal and traditional format
 */
export function getZodiacPosition(longitude: number): {
  sign: string;
  decimalDegrees: number;        // degrees within the sign (0–30)
  traditionalFormat: string;     // "D°MM'"
  decimal: string;               // "D.dd°"
} {
  const L = normalizeAngle(longitude);
  const signIndex = Math.floor(L / 30) % 12;
  const within = L - signIndex * 30;          // 0–<30
  return {
    sign: SIGNS[signIndex],
    decimalDegrees: within,
    traditionalFormat: formatDegreeMinutes(within),
    decimal: within.toFixed(2) + '°'
  };
}

// Format the 12 cusps (0–360) in sign + degrees within the sign
export function formatHouseCusps(houses360: number[]) {
  return houses360.map((lon, i) => {
    const z = getZodiacPosition(lon);
    return {
      house: i + 1,
      sign: z.sign,
      degree: z.traditionalFormat,
      longitude: normalizeAngle(lon),
    };
  });
}

// Find the house of a longitude (0–360) given the array of cusps (0–360)
export function findHouseOf(longitude: number, cusps360: number[]): number {
  const L = normalizeAngle(longitude);
  const H = cusps360.map((c, i) => ({ i: i + 1, L: normalizeAngle(c) }))
                    .sort((a, b) => a.L - b.L);
  for (let k = 0; k < H.length; k++) {
    const cur = H[k], nxt = H[(k + 1) % H.length];
    if (nxt.L < cur.L) { // wrap 360->0
      if (L >= cur.L || L < nxt.L) return cur.i;
    } else {
      if (L >= cur.L && L < nxt.L) return cur.i;
    }
  }
  return 1;
}
