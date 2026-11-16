/**
 * Moon phase from ecliptic longitudes. Pure arithmetic, no WASM dependency.
 *
 * Phase names use the 8-phase convention with 45 degree sectors centred on the
 * principal phases, i.e. boundaries at 22.5, 67.5, ... degrees of elongation
 * (lower boundary inclusive, upper exclusive):
 *   [337.5, 22.5) new, [22.5, 67.5) waxing crescent, [67.5, 112.5) first quarter,
 *   [112.5, 157.5) waxing gibbous, [157.5, 202.5) full, [202.5, 247.5) waning gibbous,
 *   [247.5, 292.5) last quarter, [292.5, 337.5) waning crescent.
 * Waxing: elongation in [0, 180); waning: [180, 360). Exactly 0 is "new"/waxing,
 * exactly 180 is "full"/waning.
 */

import { normalizeAngle } from "./swisseph";

export type MoonPhaseName =
  | "new"
  | "waxing_crescent"
  | "first_quarter"
  | "waxing_gibbous"
  | "full"
  | "waning_gibbous"
  | "last_quarter"
  | "waning_crescent";

export const MOON_PHASE_NAMES: readonly MoonPhaseName[] = [
  "new",
  "waxing_crescent",
  "first_quarter",
  "waxing_gibbous",
  "full",
  "waning_gibbous",
  "last_quarter",
  "waning_crescent",
];

export interface MoonPhaseResult {
  /** (Moon - Sun) ecliptic longitude, 0 <= x < 360. */
  elongation: number;
  phase: MoonPhaseName;
  /** Index 0..7 into the 8-phase cycle. */
  phaseIndex: number;
  waxing: boolean;
  /** Illuminated fraction of the lunar disc, 0..1. */
  illuminatedFraction: number;
  illumination: {
    method: "approximate" | "exact";
    description: string;
  };
}

export function computeMoonPhase(sunLongitude: number, moonLongitude: number): MoonPhaseResult {
  const elongation = normalizeAngle(moonLongitude - sunLongitude);
  const phaseIndex = Math.floor(normalizeAngle(elongation + 22.5) / 45) % 8;
  return {
    elongation,
    phase: MOON_PHASE_NAMES[phaseIndex],
    phaseIndex,
    waxing: elongation < 180,
    illuminatedFraction: (1 - Math.cos((elongation * Math.PI) / 180)) / 2,
    illumination: {
      method: "approximate",
      description:
        "(1 - cos(elongation)) / 2 using the ecliptic-longitude difference; ignores Moon ecliptic latitude and the Sun/Moon distance ratio, so it differs from the true phase-angle illumination by well under one percent of the disc",
    },
  };
}
