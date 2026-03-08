import { normalizeAngle } from "./swisseph";

export type AspectName =
  | "conjunction"
  | "duodecile"
  | "octile"
  | "sextile"
  | "square"
  | "trine"
  | "trioctile"
  | "quincunx"
  | "opposition";

export interface AspectSpec {
  name: AspectName;
  angle: number;
  orb: number;
}

export const DEFAULT_ASPECT_SPECS: AspectSpec[] = [
  { name: "conjunction", angle: 0, orb: 8 },
  { name: "duodecile", angle: 30, orb: 2 },
  { name: "octile", angle: 45, orb: 3 },
  { name: "sextile", angle: 60, orb: 5 },
  { name: "square", angle: 90, orb: 6 },
  { name: "trine", angle: 120, orb: 7 },
  { name: "trioctile", angle: 135, orb: 3 },
  { name: "quincunx", angle: 150, orb: 3 },
  { name: "opposition", angle: 180, orb: 8 },
];

export interface AspectEdge {
  planetA: string;
  planetB: string;
  longitudeA: number;
  longitudeB: number;
  aspect: AspectName;
  aspectAngle: number;
  delta: number;
  orb: number;
}

export function getAspectMatch(
  lonA: number,
  lonB: number,
  specs: AspectSpec[] = DEFAULT_ASPECT_SPECS
): { spec: AspectSpec; orb: number; delta: number } | null {
  const a = normalizeAngle(lonA);
  const b = normalizeAngle(lonB);
  const delta = Math.min(
    normalizeAngle(b - a),
    normalizeAngle(a - b)
  );
  for (const spec of specs) {
    const orb = Math.abs(delta - spec.angle);
    if (orb <= spec.orb) {
      return { spec, orb, delta };
    }
  }
  return null;
}

export function computeAspects(
  planets: Record<string, { longitude: number }>,
  specs: AspectSpec[] = DEFAULT_ASPECT_SPECS
): AspectEdge[] {
  const keys = Object.keys(planets);
  const edges: AspectEdge[] = [];
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const a = planets[keys[i]];
      const b = planets[keys[j]];
      const match = getAspectMatch(a.longitude, b.longitude, specs);
      if (match) {
        edges.push({
          planetA: keys[i],
          planetB: keys[j],
          longitudeA: a.longitude,
          longitudeB: b.longitude,
          aspect: match.spec.name,
          aspectAngle: match.spec.angle,
          delta: match.delta,
          orb: match.orb,
        });
      }
    }
  }
  return edges;
}

export function computeSynastryAspects(
  planetsA: Record<string, { longitude: number }>,
  planetsB: Record<string, { longitude: number }>,
  specs: AspectSpec[] = DEFAULT_ASPECT_SPECS
): AspectEdge[] {
  const keysA = Object.keys(planetsA);
  const keysB = Object.keys(planetsB);
  const edges: AspectEdge[] = [];
  for (const kA of keysA) {
    for (const kB of keysB) {
      const a = planetsA[kA];
      const b = planetsB[kB];
      const match = getAspectMatch(a.longitude, b.longitude, specs);
      if (match) {
        edges.push({
          planetA: kA,
          planetB: kB,
          longitudeA: a.longitude,
          longitudeB: b.longitude,
          aspect: match.spec.name,
          aspectAngle: match.spec.angle,
          delta: match.delta,
          orb: match.orb,
        });
      }
    }
  }
  return edges;
}

/** Shorter-arc midpoint of two ecliptic longitudes. */
export function shorterArcMidpoint(a: number, b: number): number {
  let diff = b - a;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return normalizeAngle(a + diff / 2);
}

export function computeMidpoints(
  planetsA: Record<string, { longitude: number }>,
  planetsB: Record<string, { longitude: number }>
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const key of Object.keys(planetsA)) {
    if (!(key in planetsB)) continue;
    result[key] = shorterArcMidpoint(planetsA[key].longitude, planetsB[key].longitude);
  }
  return result;
}
