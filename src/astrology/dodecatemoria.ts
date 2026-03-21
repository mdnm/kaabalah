/**
 * Dodecatemoria (12th parts) — traditional Hellenistic technique.
 * Pure math, no WASM dependency.
 */

import { normalizeAngle } from "./swisseph";
import { SIGNS } from "./index";

export interface DodecatemoriaResult {
  originalSign: string;
  originalDegree: number;
  dodecatemoriaSign: string;
  dodecatemoriaIndex: number;
}

export function getDodecatemoria(longitude: number): DodecatemoriaResult {
  const L = normalizeAngle(longitude);
  const signIndex = Math.floor(L / 30) % 12;
  const degreeWithinSign = L - signIndex * 30;
  const index = Math.min(Math.floor(degreeWithinSign / 2.5), 11);
  const dodecatemoriaSignIndex = (signIndex + index) % 12;

  return {
    originalSign: SIGNS[signIndex],
    originalDegree: degreeWithinSign,
    dodecatemoriaSign: SIGNS[dodecatemoriaSignIndex],
    dodecatemoriaIndex: index,
  };
}
