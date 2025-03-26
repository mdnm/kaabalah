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
  Planet
} from './swisseph';

export { CalcFlag, closeSwissEph, getSwissEph, HouseSystem, Planet };

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

/**
 * Convert decimal degrees to degrees and minutes format
 * 
 * @param decimalDegrees Decimal degrees (e.g., 9.8)
 * @returns Formatted string (e.g., "9°48'")
 */
export function formatDegreeMinutes(decimalDegrees: number): string {
  const degrees = Math.floor(decimalDegrees);
  const minutes = Math.round((decimalDegrees - degrees) * 60);
  return `${degrees}°${minutes.toString().padStart(2, '0')}'`;
}

/**
 * Convert decimal degrees to zodiac position (sign and degrees)
 * 
 * @param longitude Longitude in decimal degrees (0-360)
 * @returns Formatted zodiac position with both decimal and traditional format
 */
export function getZodiacPosition(longitude: number): { 
  sign: string;
  decimalDegrees: number;
  traditionalFormat: string;
  decimal: string;
} {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer',
    'Leo', 'Virgo', 'Libra', 'Scorpio',
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  
  const signIndex = Math.floor(longitude / 30) % 12;
  const degrees = longitude % 30;
  
  return {
    sign: signs[signIndex],
    decimalDegrees: degrees,
    traditionalFormat: formatDegreeMinutes(degrees),
    decimal: degrees.toFixed(2) + '°'
  };
} 