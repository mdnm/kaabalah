/**
 * Astrological calculations using Swiss Ephemeris
 */

import {
  CalcFlag,
  calcParsFortunae,
  calculateHouses,
  calculatePlanetaryPositions,
  closeSwissEph,
  getSwissEph,
  HouseSystem,
  normalizeAngle,
  Planet,
  PLANET_AND_NODE_NAMES,
  PlanetPosition,
  VirtualNodes,
} from "./swisseph";

export {
  CalcFlag,
  closeSwissEph,
  getSwissEph,
  HouseSystem,
  normalizeAngle,
  Planet,
  PLANET_AND_NODE_NAMES,
  VirtualNodes
};

export interface BirthChartOptions {
  date: Date;
  latitude: number;
  longitude: number;
  timezone: number;
  houseSystem?: HouseSystem;
}

export type ZodiacPosition = {
  sign: string;
  decimalDegrees: number; // degrees within the sign (0–30)
  traditionalFormat: string; // "D°MM'"
  decimal: string; // "D.dd°"
  longitude: number;
  house: number;
};
export type HydratedNode = ZodiacPosition & { id: VirtualNodes; name: string };
export type HydratedPlanet = PlanetPosition & {
  id: Planet;
  name: string;
  zodiacPosition: ZodiacPosition;
};

export interface BirthChart {
  dateUtc: Date;
  planets: Record<string, HydratedPlanet>;
  nodes: Record<string, HydratedNode>;
  houses: {
    ascendant: ZodiacPosition;
    mc: ZodiacPosition;
    dc: ZodiacPosition;
    ic: ZodiacPosition;
    houses: ZodiacPosition[];
    ascmc?: {
      armc?: ZodiacPosition;
      vertex?: ZodiacPosition;
      equasc?: ZodiacPosition;
      coasc1?: ZodiacPosition;
      coasc2?: ZodiacPosition;
      polasc?: ZodiacPosition;
    };
  };
}

function validateInputs(options: BirthChartOptions): void {
  if (!(options.date instanceof Date) || isNaN(options.date.getTime())) {
    throw new Error("Invalid date provided");
  }

  if (
    typeof options.latitude !== "number" ||
    options.latitude < -90 ||
    options.latitude > 90
  ) {
    throw new Error("Invalid latitude: must be between -90 and 90 degrees");
  }

  if (
    typeof options.longitude !== "number" ||
    options.longitude < -180 ||
    options.longitude > 180
  ) {
    throw new Error("Invalid longitude: must be between -180 and 180 degrees");
  }

  if (
    typeof options.timezone !== "number" ||
    options.timezone < -12 ||
    options.timezone > 14
  ) {
    throw new Error("Invalid timezone: must be between -12 and +14");
  }
}

function hydratePlanet(
  id: Planet,
  position: PlanetPosition,
  houseCusps: number[]
): HydratedPlanet {
  return {
    ...position,
    id,
    name: PLANET_AND_NODE_NAMES[id],
    zodiacPosition: getZodiacPosition(position.longitude, houseCusps),
  };
}

/**
 * Calculate a birth chart using Swiss Ephemeris
 *
 * @param options Chart calculation options
 * @returns Birth chart data
 */
export async function getBirthChart(
  options: BirthChartOptions
): Promise<BirthChart> {
  try {
    // Validate inputs
    validateInputs(options);

    // Convert local time to UTC
    const localDate = new Date(options.date);
    const utcDate = new Date(
      localDate.getTime() - options.timezone * 60 * 60 * 1000
    );

    // Calculate planetary positions
    const planetPositions = await calculatePlanetaryPositions(utcDate);
    if (!planetPositions) {
      throw new Error("Failed to calculate planetary positions");
    }

    // Calculate houses
    const housesPositions = await calculateHouses(
      utcDate,
      options.latitude,
      options.longitude,
      options.houseSystem || HouseSystem.PLACIDUS
    );
    if (!housesPositions) {
      throw new Error("Failed to calculate houses");
    }

    // skipping the first house since swisseph uses it as dummy 0deg aries
    const houseCusps = housesPositions.houses.slice(1, 13).map(normalizeAngle);

    const planets: Record<string, HydratedPlanet> = {};
    for (const [planetId, position] of Object.entries(planetPositions)) {
      const id = planetId as unknown as Planet;
      const hydratedPlanet = hydratePlanet(id, position, houseCusps);
      planets[hydratedPlanet.name.toLocaleLowerCase()] = hydratedPlanet;
    }

    const houseCuspsPositions = houseCusps.map((lon) =>
      getZodiacPosition(lon, houseCusps)
    );

    const descendant = normalizeAngle(housesPositions.ascendant + 180);
    const imumCoeli = normalizeAngle(housesPositions.mc + 180);

    const ascendantSign = getZodiacPosition(
      housesPositions.ascendant,
      houseCusps
    );
    const midheavenSign = getZodiacPosition(housesPositions.mc, houseCusps);
    const descendantSign = getZodiacPosition(descendant, houseCusps);
    const imumCoeliSign = getZodiacPosition(imumCoeli, houseCusps);

    const houses: BirthChart["houses"] = {
      ascendant: ascendantSign,
      mc: midheavenSign,
      dc: descendantSign,
      ic: imumCoeliSign,
      houses: houseCuspsPositions,
      ascmc: {
        armc: housesPositions.ascmc
          ? getZodiacPosition(housesPositions.ascmc.armc, houseCusps)
          : undefined,
        vertex: housesPositions.ascmc
          ? getZodiacPosition(housesPositions.ascmc.vertex, houseCusps)
          : undefined,
        equasc: housesPositions.ascmc
          ? getZodiacPosition(housesPositions.ascmc.equasc, houseCusps)
          : undefined,
        coasc1: housesPositions.ascmc
          ? getZodiacPosition(housesPositions.ascmc.coasc1, houseCusps)
          : undefined,
        coasc2: housesPositions.ascmc
          ? getZodiacPosition(housesPositions.ascmc.coasc2, houseCusps)
          : undefined,
        polasc: housesPositions.ascmc
          ? getZodiacPosition(housesPositions.ascmc.polasc, houseCusps)
          : undefined,
      },
    };

    const isDiurnal =
      planets.sun.zodiacPosition.house >= 7 &&
      planets.sun.zodiacPosition.house <= 12;
    const wheelOfFortuneLongitude = calcParsFortunae(
      houses.ascendant.longitude,
      planets.sun.longitude,
      planets.moon.longitude,
      isDiurnal
    );

    const wheelOfFortune = getZodiacPosition(
      wheelOfFortuneLongitude,
      houseCusps
    );

    const nodes: Record<string, HydratedNode> = {
      [VirtualNodes.PARS_FORTUNAE]: {
        ...wheelOfFortune,
        id: VirtualNodes.PARS_FORTUNAE,
        name: PLANET_AND_NODE_NAMES[VirtualNodes.PARS_FORTUNAE],
      },
    };

    return {
      dateUtc: utcDate,
      planets,
      houses,
      nodes,
    };
  } catch (error) {
    console.error("Error calculating birth chart:", error);
    throw error;
  }
}

export const SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
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
  if (min === 60) {
    min = 0;
    deg += 1;
  } // carry
  return `${deg}°${String(min).padStart(2, "0")}'`;
}

/**
 * Convert decimal degrees to zodiac position (sign and degrees)
 *
 * @param longitude Longitude in decimal degrees (0-360)
 * @returns Formatted zodiac position with both decimal and traditional format
 */
export function getZodiacPosition(
  longitude: number,
  houseCusps: number[]
): ZodiacPosition {
  const L = normalizeAngle(longitude);
  const signIndex = Math.floor(L / 30) % 12;
  const within = L - signIndex * 30; // 0–<30
  const house = findHouseOf(L, houseCusps);

  return {
    sign: SIGNS[signIndex],
    decimalDegrees: within,
    traditionalFormat: formatDegreeMinutes(within),
    decimal: within.toFixed(2) + "°",
    longitude: L,
    house,
  };
}

// Find the house of a longitude (0–360) given the array of cusps (0–360)
export function findHouseOf(
  longitude: number,
  housePositions: number[]
): number {
  const L = normalizeAngle(longitude);

  if (!housePositions || housePositions.length === 0) {
    throw new Error("House positions are required");
  }
  
  const H = housePositions
    .map((c, i) => ({ i: i + 1, L: normalizeAngle(c) }))
    .sort((a, b) => a.L - b.L);
  for (let k = 0; k < H.length; k++) {
    const cur = H[k],
      nxt = H[(k + 1) % H.length];
    if (nxt.L < cur.L) {
      // wrap 360->0
      if (L >= cur.L || L < nxt.L) return cur.i;
    } else {
      if (L >= cur.L && L < nxt.L) return cur.i;
    }
  }
  return 1;
}
