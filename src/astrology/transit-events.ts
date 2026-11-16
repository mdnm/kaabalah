/**
 * Exact transit-to-natal aspect events built on the shared root solver.
 *
 * Natal targets are fixed points (zero velocity). Only verified crossings are
 * reported as exact; local minima that never reach the aspect are optional,
 * separate "closest approach" records.
 */

import { DEFAULT_ASPECT_SPECS, SLOW_PLANETS, type AspectName, type AspectSpec } from "./aspects";
import {
  createBodyLongitudeFunctions,
  MAX_BODY_SCAN_STEP_DAYS,
  ROOT_SOLVER_METHOD,
  type BodyLongitudeFunctions,
  type RootSolverMethodMetadata,
} from "./returns";
import { dateToJd, findAngularRoots, type RootDirection, type RootSearchCoverage } from "./root-solver";
import { Planet, PLANET_AND_NODE_NAMES } from "./swisseph";

/** Solver metadata attached to every exact transit perfection. */
export interface PerfectionSolverMetadata {
  /** Angular root residual in degrees (separate from the display orb). */
  residualDegrees: number;
  /** Final bracket width in seconds. */
  bracketWidthSeconds: number;
  /** Requested time tolerance in seconds. */
  timeToleranceSeconds: number;
  iterations: number;
  direction: RootDirection;
  tangent: boolean;
  /** Scan step actually used for the transiting body (days). */
  scanStepDays: number;
  /** Signed target longitude solved (natal longitude +/- aspect angle). */
  targetLongitude: number;
  coverage: RootSearchCoverage;
  method: RootSolverMethodMetadata;
}

export interface TransitPerfectionEvent {
  kind: "exact";
  transitPlanet: string;
  natalPlanet: string;
  aspect: AspectName;
  /** Verified root instant (UTC). */
  exactDate: Date;
  exactJd: number;
  /** Equals the angular root residual (~0); not the display orb. */
  exactOrb: number;
  retrograde: boolean;
  category: "slow" | "fast";
  solver: PerfectionSolverMetadata;
}

export interface TransitClosestApproach {
  kind: "closest-approach";
  transitPlanet: string;
  natalPlanet: string;
  aspect: AspectName;
  /** Instant of minimum separation (UTC) - NOT an exact aspect. */
  date: Date;
  jd: number;
  /** Minimum angular separation from the exact aspect in degrees (> 0). */
  separationDegrees: number;
  /** Display orb of the aspect spec the separation was compared with. */
  displayOrb: number;
  category: "slow" | "fast";
}

export interface FindTransitPerfectionsOptions {
  /** Fixed natal targets (longitude in degrees). */
  natalPoints: Record<string, { longitude: number }>;
  /** Lowercase transit body names to search; undefined = all bodies. */
  transitPlanets?: string[];
  fromUtc: Date;
  toUtc: Date;
  stepDays: number;
  aspectSpecs?: AspectSpec[];
  timeToleranceSeconds?: number;
  residualToleranceDegrees?: number;
  includeClosestApproaches?: boolean;
}

export interface FindTransitPerfectionsResult {
  perfections: TransitPerfectionEvent[];
  closestApproaches: TransitClosestApproach[];
}

const FAST_PLANET_MAX_STEP_DAYS = 0.25;

function transitBodies(filter?: string[]): { key: string; planet: Planet }[] {
  const allowed = filter && filter.length > 0 ? new Set(filter.map((n) => n.toLowerCase())) : null;
  const out: { key: string; planet: Planet }[] = [];
  for (const [id, name] of Object.entries(PLANET_AND_NODE_NAMES)) {
    const numeric = Number(id);
    if (Number.isNaN(numeric)) continue; // virtual points (e.g. Wheel of Fortune)
    const key = name.toLowerCase();
    if (allowed && !allowed.has(key)) continue;
    out.push({ key, planet: numeric as Planet });
  }
  return out;
}

export function findTransitPerfections(options: FindTransitPerfectionsOptions): FindTransitPerfectionsResult {
  const specs = options.aspectSpecs ?? DEFAULT_ASPECT_SPECS;
  const timeToleranceSeconds = options.timeToleranceSeconds ?? 0.001;
  const startJd = dateToJd(options.fromUtc);
  const endJd = dateToJd(options.toUtc);
  const perfections: TransitPerfectionEvent[] = [];
  const closestApproaches: TransitClosestApproach[] = [];

  for (const { key: tKey, planet } of transitBodies(options.transitPlanets)) {
    const category: "slow" | "fast" = SLOW_PLANETS.has(tKey) ? "slow" : "fast";
    // One shared, cached sampler per transiting body for every natal point/aspect.
    const fns: BodyLongitudeFunctions = createBodyLongitudeFunctions(planet);
    const bodyStep = Math.min(
      options.stepDays,
      MAX_BODY_SCAN_STEP_DAYS,
      category === "fast" ? FAST_PLANET_MAX_STEP_DAYS : Infinity
    );

    for (const [nKey, nPoint] of Object.entries(options.natalPoints)) {
      for (const spec of specs) {
        const offsets = spec.angle === 0 || spec.angle === 180 ? [spec.angle] : [spec.angle, -spec.angle];
        for (const offset of offsets) {
          const target = (((nPoint.longitude + offset) % 360) + 360) % 360;
          const result = findAngularRoots({
            longitude: fns.longitude,
            speed: fns.speed,
            target,
            start: startJd,
            end: endJd,
            stepDays: bodyStep,
            timeToleranceSeconds,
            residualToleranceDegrees: options.residualToleranceDegrees,
            includeClosestApproaches: options.includeClosestApproaches,
            maxClosestSeparationDegrees: spec.orb,
          });
          for (const r of result.roots) {
            perfections.push({
              kind: "exact",
              transitPlanet: tKey,
              natalPlanet: nKey,
              aspect: spec.name,
              exactDate: r.instant,
              exactJd: r.jd,
              exactOrb: r.residualDegrees,
              retrograde: r.direction === "retrograde" || (r.direction === "stationary" && r.speedDegreesPerDay < 0),
              category,
              solver: {
                residualDegrees: r.residualDegrees,
                bracketWidthSeconds: r.bracketWidthSeconds,
                timeToleranceSeconds: r.timeToleranceSeconds,
                iterations: r.iterations,
                direction: r.direction,
                tangent: r.tangent,
                scanStepDays: bodyStep,
                targetLongitude: result.target,
                coverage: result.coverage,
                method: ROOT_SOLVER_METHOD,
              },
            });
          }
          for (const c of result.closestApproaches) {
            closestApproaches.push({
              kind: "closest-approach",
              transitPlanet: tKey,
              natalPlanet: nKey,
              aspect: spec.name,
              date: c.instant,
              jd: c.jd,
              separationDegrees: c.separationDegrees,
              displayOrb: spec.orb,
              category,
            });
          }
        }
      }
    }
  }

  perfections.sort((a, b) => a.exactJd - b.exactJd);
  closestApproaches.sort((a, b) => a.jd - b.jd);
  return { perfections, closestApproaches };
}
