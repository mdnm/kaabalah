/**
 * Decan (face) lookup — Chaldean rulers + Golden Dawn tarot correspondence.
 * Pure math, no WASM dependency.
 */

import { normalizeAngle } from "./swisseph";
import { SIGNS } from "./index";
import type { TraditionalPlanet } from "./dignity";

export interface DecanResult {
  sign: string;
  decanNumber: 1 | 2 | 3;
  ruler: TraditionalPlanet;
  tarotCard: string;
  startDegree: number;
  endDegree: number;
  degreeWithinSign: number;
}

/** Chaldean descent starting from Mars (Aries decan 1). */
const CHALDEAN_RULERS: TraditionalPlanet[] = [
  "Mars", "Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter",
];

/** Element-to-suit mapping (Golden Dawn). */
const SIGN_SUITS: Record<string, string> = {
  Aries: "Wands",
  Taurus: "Pentacles",
  Gemini: "Swords",
  Cancer: "Cups",
  Leo: "Wands",
  Virgo: "Pentacles",
  Libra: "Swords",
  Scorpio: "Cups",
  Sagittarius: "Wands",
  Capricorn: "Pentacles",
  Aquarius: "Swords",
  Pisces: "Cups",
};

const RANK_NAMES = ["Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

export function getDecan(longitude: number): DecanResult {
  const L = normalizeAngle(longitude);
  const signIndex = Math.floor(L / 30) % 12;
  const degreeWithinSign = L - signIndex * 30;
  const decanIndex = Math.min(Math.floor(degreeWithinSign / 10), 2);
  const globalDecanIndex = signIndex * 3 + decanIndex;

  const sign = SIGNS[signIndex];
  const ruler = CHALDEAN_RULERS[globalDecanIndex % 7];
  const suit = SIGN_SUITS[sign];
  const rank = RANK_NAMES[globalDecanIndex % 9];
  const tarotCard = `${rank} of ${suit}`;

  return {
    sign,
    decanNumber: (decanIndex + 1) as 1 | 2 | 3,
    ruler,
    tarotCard,
    startDegree: signIndex * 30 + decanIndex * 10,
    endDegree: signIndex * 30 + (decanIndex + 1) * 10,
    degreeWithinSign,
  };
}
