/**
 * Essential Dignity Table — Traditional Hellenistic rulership data.
 * Pure math, no WASM dependency.
 */

import { SIGNS } from "./index";

export type Sign = (typeof SIGNS)[number];

export type TraditionalPlanet =
  | "Sun"
  | "Moon"
  | "Mercury"
  | "Venus"
  | "Mars"
  | "Jupiter"
  | "Saturn";

export interface EssentialDignityResult {
  domicile: boolean;
  exaltation: boolean;
  detriment: boolean;
  fall: boolean;
  domicileRuler: TraditionalPlanet;
  peregrine: boolean;
}

export const DOMICILE_RULERS: Record<Sign, TraditionalPlanet> = {
  Aries: "Mars",
  Taurus: "Venus",
  Gemini: "Mercury",
  Cancer: "Moon",
  Leo: "Sun",
  Virgo: "Mercury",
  Libra: "Venus",
  Scorpio: "Mars",
  Sagittarius: "Jupiter",
  Capricorn: "Saturn",
  Aquarius: "Saturn",
  Pisces: "Jupiter",
};

export const EXALTATIONS: Record<TraditionalPlanet, { sign: Sign; degree: number }> = {
  Sun: { sign: "Aries", degree: 19 },
  Moon: { sign: "Taurus", degree: 3 },
  Mercury: { sign: "Virgo", degree: 15 },
  Venus: { sign: "Pisces", degree: 27 },
  Mars: { sign: "Capricorn", degree: 28 },
  Jupiter: { sign: "Cancer", degree: 15 },
  Saturn: { sign: "Libra", degree: 21 },
};

export function getDomicileRuler(sign: Sign): TraditionalPlanet {
  return DOMICILE_RULERS[sign];
}

export function getExaltation(planet: TraditionalPlanet): { sign: Sign; degree: number } {
  return EXALTATIONS[planet];
}

export function getOppositeSign(sign: Sign): Sign {
  const idx = SIGNS.indexOf(sign);
  return SIGNS[(idx + 6) % 12];
}

/** Signs where the planet is in detriment (opposite of its domicile signs). */
export function getDetriment(planet: TraditionalPlanet): Sign[] {
  const signs: Sign[] = [];
  for (const [sign, ruler] of Object.entries(DOMICILE_RULERS)) {
    if (ruler === planet) {
      signs.push(getOppositeSign(sign as Sign));
    }
  }
  return signs;
}

/** Sign where the planet is in fall (opposite of its exaltation sign). */
export function getFall(planet: TraditionalPlanet): Sign {
  return getOppositeSign(EXALTATIONS[planet].sign);
}

export function getEssentialDignity(planet: TraditionalPlanet, sign: Sign): EssentialDignityResult {
  const domicile = DOMICILE_RULERS[sign] === planet;
  const exaltation = EXALTATIONS[planet].sign === sign;
  const detrimentSigns = getDetriment(planet);
  const detriment = detrimentSigns.includes(sign);
  const fallSign = getFall(planet);
  const fall = fallSign === sign;
  const domicileRuler = DOMICILE_RULERS[sign];
  const peregrine = !domicile && !exaltation && !detriment && !fall;

  return { domicile, exaltation, detriment, fall, domicileRuler, peregrine };
}
