/**
 * Composite-chart geometry: midpoints, angles and house cusps.
 * Pure math, no WASM dependency.
 *
 * Conventions (all reported back in `CompositeMethod`):
 *
 * - Midpoint: shorter-arc midpoint of two ecliptic longitudes.
 * - Antipodal policy: two points exactly (within `antipodalEpsilon`, default
 *   0.001 degree) opposite each other have two equally valid midpoints. The
 *   rule is deterministic and symmetric in its arguments: the ARITHMETIC mean
 *   of the two normalised longitudes in [0, 360) is used (i.e. the midpoint of
 *   the arc that does not cross 0 Aries). Such a pair is flagged in
 *   `notices` (`type: "antipodal"`).
 * - Angles: composite ASC = midpoint(ASC_A, ASC_B). The composite MC is the
 *   midpoint(MC_A, MC_B) or its opposite, whichever puts the MC 0-180 degrees
 *   behind the composite ASC (as in every real chart), so ASC/MC stay
 *   consistent with each other. DSC = ASC + 180, IC = MC + 180.
 * - Whole-sign houses: house 1 starts at 0 degrees of the composite ASC's sign
 *   and each following house is 30 degrees further on.
 * - Quadrant / other systems: cusp i = midpoint of cusp i of both charts. Cusp
 *   1 is anchored to the composite ASC when both charts' cusp 1 equals their
 *   ASC. Cusps are then walked in order; for each, if the shorter-arc midpoint
 *   falls on the opposite side (forward gap from the previous cusp not within
 *   (0, 180)), the opposite point is used and the house is listed in
 *   `correctedCusps`. If the result still is not strictly increasing mod 360
 *   (should not happen below polar latitudes) equal houses from the composite
 *   ASC are used and `fallback` is set to "equal".
 */

import { normalizeAngle } from "./swisseph";

export const DEFAULT_ANTIPODAL_EPSILON = 1e-3;

export interface CompositeMidpoint {
  longitude: number;
  /** True when the two inputs are within epsilon of exact opposition. */
  antipodal: boolean;
}

/** Midpoint of two longitudes, symmetric, with the antipodal policy above. */
export function compositeMidpoint(
  a: number,
  b: number,
  epsilon = DEFAULT_ANTIPODAL_EPSILON
): CompositeMidpoint {
  const na = normalizeAngle(a);
  const nb = normalizeAngle(b);
  const sep = Math.abs(na - nb);
  const arc = sep > 180 ? 360 - sep : sep;
  if (Math.abs(arc - 180) <= epsilon) {
    return { longitude: normalizeAngle((na + nb) / 2), antipodal: true };
  }
  let diff = nb - na;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return { longitude: normalizeAngle(na + diff / 2), antipodal: false };
}

/** Forward (zodiacal-order) gap from `from` to `to`, in [0, 360). */
function forwardGap(from: number, to: number): number {
  return normalizeAngle(to - from);
}

/** True when the cusps run strictly forward through exactly one full turn. */
export function cuspsStrictlyIncreasing(cusps: number[]): boolean {
  if (cusps.length < 2) return true;
  let total = 0;
  for (let i = 0; i < cusps.length; i++) {
    const gap = forwardGap(cusps[i], cusps[(i + 1) % cusps.length]);
    if (gap <= 0) return false;
    total += gap;
  }
  return Math.abs(total - 360) < 1e-9;
}

export type CompositeNotice =
  | { type: "antipodal"; point: string; longitudeA: number; longitudeB: number }
  | { type: "mc_flipped"; reason: string }
  | { type: "cusp_corrected"; house: number }
  | { type: "equal_house_fallback"; reason: string }
  | { type: "mixed_house_systems"; reason: string };

export interface CompositeMethod {
  midpoint: "shorter arc";
  antipodalPolicy: string;
  antipodalEpsilon: number;
  houses: "whole-sign" | "midpoint-of-corresponding-cusps";
  fallback: "equal" | null;
  correctedCusps: number[];
}

export interface CompositeAngles {
  ascendant: number;
  mc: number;
  descendant: number;
  ic: number;
}

export function computeCompositeAngles(
  a: { ascendant: number; mc: number },
  b: { ascendant: number; mc: number },
  epsilon = DEFAULT_ANTIPODAL_EPSILON
): { angles: CompositeAngles; notices: CompositeNotice[] } {
  const notices: CompositeNotice[] = [];
  const asc = compositeMidpoint(a.ascendant, b.ascendant, epsilon);
  if (asc.antipodal) {
    notices.push({ type: "antipodal", point: "ascendant", longitudeA: a.ascendant, longitudeB: b.ascendant });
  }
  const mcMid = compositeMidpoint(a.mc, b.mc, epsilon);
  if (mcMid.antipodal) {
    notices.push({ type: "antipodal", point: "mc", longitudeA: a.mc, longitudeB: b.mc });
  }
  let mc = mcMid.longitude;
  // A real MC lies 0-180 degrees behind the ASC: ASC - MC in (0, 180).
  const lead = forwardGap(mc, asc.longitude);
  if (!(lead > 0 && lead < 180)) {
    const flipped = normalizeAngle(mc + 180);
    const flippedLead = forwardGap(flipped, asc.longitude);
    if (flippedLead > 0 && flippedLead < 180) {
      mc = flipped;
      notices.push({
        type: "mc_flipped",
        reason: "midpoint MC was on the wrong side of the composite ASC; the opposite midpoint was used",
      });
    }
  }
  return {
    angles: {
      ascendant: asc.longitude,
      mc,
      descendant: normalizeAngle(asc.longitude + 180),
      ic: normalizeAngle(mc + 180),
    },
    notices,
  };
}

export interface CompositeCuspInput {
  cuspsA: number[];
  cuspsB: number[];
  ascA: number;
  ascB: number;
  /** Use whole-sign houses from the composite ASC (both charts whole-sign). */
  wholeSign: boolean;
  compositeAsc: number;
  epsilon?: number;
}

export function computeCompositeCusps(input: CompositeCuspInput): {
  cusps: number[];
  method: Pick<CompositeMethod, "houses" | "fallback" | "correctedCusps">;
  notices: CompositeNotice[];
} {
  const { cuspsA, cuspsB, compositeAsc } = input;
  const epsilon = input.epsilon ?? DEFAULT_ANTIPODAL_EPSILON;
  const notices: CompositeNotice[] = [];

  const equalFrom = (start: number) => Array.from({ length: 12 }, (_, i) => normalizeAngle(start + i * 30));

  if (input.wholeSign) {
    const signStart = Math.floor(normalizeAngle(compositeAsc) / 30) * 30;
    return {
      cusps: equalFrom(signStart),
      method: { houses: "whole-sign", fallback: null, correctedCusps: [] },
      notices,
    };
  }

  const n = Math.min(cuspsA.length, cuspsB.length);
  const cusps: number[] = [];
  const corrected: number[] = [];
  const anchored =
    Math.abs(compositeAngleDiff(cuspsA[0], input.ascA)) < 1e-6 &&
    Math.abs(compositeAngleDiff(cuspsB[0], input.ascB)) < 1e-6;
  for (let i = 0; i < n; i++) {
    const mid = compositeMidpoint(cuspsA[i], cuspsB[i], epsilon);
    if (mid.antipodal) {
      notices.push({ type: "antipodal", point: `house${i + 1}`, longitudeA: cuspsA[i], longitudeB: cuspsB[i] });
    }
    if (i === 0) {
      cusps.push(anchored ? normalizeAngle(compositeAsc) : mid.longitude);
      continue;
    }
    const prev = cusps[i - 1];
    const gap = forwardGap(prev, mid.longitude);
    if (gap > 0 && gap < 180) {
      cusps.push(mid.longitude);
    } else {
      const flipped = normalizeAngle(mid.longitude + 180);
      const flippedGap = forwardGap(prev, flipped);
      if (flippedGap > 0 && flippedGap < 180) {
        cusps.push(flipped);
        corrected.push(i + 1);
        notices.push({ type: "cusp_corrected", house: i + 1 });
      } else {
        cusps.push(mid.longitude);
      }
    }
  }

  if (n === 12 && !cuspsStrictlyIncreasing(cusps)) {
    notices.push({
      type: "equal_house_fallback",
      reason: "midpoint cusps could not be ordered strictly increasing; equal houses from the composite ASC",
    });
    return {
      cusps: equalFrom(compositeAsc),
      method: { houses: "midpoint-of-corresponding-cusps", fallback: "equal", correctedCusps: corrected },
      notices,
    };
  }
  return {
    cusps,
    method: { houses: "midpoint-of-corresponding-cusps", fallback: null, correctedCusps: corrected },
    notices,
  };
}

function compositeAngleDiff(a: number, b: number): number {
  let d = normalizeAngle(a) - normalizeAngle(b);
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

export const ANTIPODAL_POLICY_TEXT =
  "points within epsilon of exact opposition use the arithmetic mean of the normalised longitudes (arc not crossing 0 Aries); flagged in notices";
