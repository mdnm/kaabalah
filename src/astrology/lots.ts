/**
 * Hellenistic lots of Fortune and Spirit (sect-reversed counterparts).
 * Pure arithmetic, no WASM dependency.
 *
 *   Fortune: day  ASC + Moon - Sun   night ASC + Sun - Moon
 *   Spirit : day  ASC + Sun - Moon   night ASC + Moon - Sun
 *
 * Hence Fortune + Spirit = 2 * ASC (mod 360) in either sect.
 */

import { normalizeAngle } from "./swisseph";

export interface LotsResult {
  fortune: number;
  spirit: number;
  method: {
    sectUsed: "diurnal" | "nocturnal";
    fortune: string;
    spirit: string;
  };
}

export function calcLotOfFortune(asc: number, sun: number, moon: number, diurnal: boolean): number {
  return normalizeAngle(diurnal ? asc + moon - sun : asc + sun - moon);
}

export function calcLotOfSpirit(asc: number, sun: number, moon: number, diurnal: boolean): number {
  return normalizeAngle(diurnal ? asc + sun - moon : asc + moon - sun);
}

export function computeLots(
  asc: number,
  sun: number,
  moon: number,
  sect: "diurnal" | "nocturnal"
): LotsResult {
  const diurnal = sect === "diurnal";
  return {
    fortune: calcLotOfFortune(asc, sun, moon, diurnal),
    spirit: calcLotOfSpirit(asc, sun, moon, diurnal),
    method: {
      sectUsed: sect,
      fortune: diurnal ? "ASC + Moon - Sun" : "ASC + Sun - Moon",
      spirit: diurnal ? "ASC + Sun - Moon" : "ASC + Moon - Sun",
    },
  };
}
