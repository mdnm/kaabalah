/**
 * Orb policies resolved at aspect GENERATION time.
 *
 * Legacy `computeAspects` uses one orb per aspect (`AspectSpec.orb`) and a CLI `--max-orb`
 * can only filter edges that were already generated, so it can never recover a contact the
 * generation orb omitted (e.g. a 5.5 degree sextile with the default 5 degree sextile orb).
 * An `OrbPolicy` is consulted for every pair BEFORE an edge exists, with per-body-class
 * rules, so wider (or narrower) windows are honoured exactly.
 *
 * Pair resolution (documented and echoed in every result's `policy` metadata). The orb
 * limit for aspect A between points P and Q is the first rule that applies:
 *   1. `pointPairOrbs["idP|idQ"]` (IDs sorted alphabetically);
 *   2. `classPairOrbs["classP|classQ"]` (classes sorted alphabetically);
 *   3. the `classOrbs` entry of the FIRST class in `classPrecedence` that is the class of P
 *      or Q and has an entry (so a pair of different classes resolves to the higher-priority
 *      class, not to an average or maximum);
 *   4. the aspect's own base orb (`aspects[i].orb`).
 * With `combine: "min"` the result of 1-3 is additionally capped by the aspect's base orb.
 * This reproduces the reference rule "points/angles 3, else luminaries 8, else planets 6":
 * `PTOLEMAIC_PLUS_QUINCUNX.classPrecedence` lists angle/node/point/lot before luminary
 * before planet, so Sun-Mercury is 8, Mercury-Mars is 6 and anything involving an
 * angle/node/point/lot is 3 (a luminary paired with a point is therefore 3, not 8).
 *
 * Pure arithmetic, no WASM dependency.
 */

import { type AspectName, type AspectSpec } from "./aspects";
import {
  type ChartPointLike,
  isPointId,
  POINT_CLASSES,
  POINT_DEFINITIONS,
  type PointClass,
  type PointId,
} from "./points";
import { normalizeAngle } from "./swisseph";

// ── Typed errors ────────────────────────────────────────────────────────

export type AspectConfigErrorCode =
  | "UNKNOWN_ASPECT_NAME"
  | "INVALID_ASPECT_ANGLE"
  | "ASPECT_ANGLE_MISMATCH"
  | "DUPLICATE_ASPECT"
  | "EMPTY_ASPECT_LIST"
  | "INVALID_ORB"
  | "UNKNOWN_POINT_CLASS"
  | "UNKNOWN_POINT_ID"
  | "INVALID_POINT"
  | "DUPLICATE_POINT_ID"
  | "INVALID_OPTION";

export class AspectConfigError extends Error {
  readonly code: AspectConfigErrorCode;
  readonly details?: Record<string, unknown>;
  constructor(code: AspectConfigErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "AspectConfigError";
    this.code = code;
    this.details = details;
  }
}

// ── Aspect spec validation ──────────────────────────────────────────────

export const ASPECT_CANONICAL_ANGLES: Readonly<Record<AspectName, number>> = Object.freeze({
  conjunction: 0,
  duodecile: 30,
  octile: 45,
  sextile: 60,
  square: 90,
  trine: 120,
  trioctile: 135,
  quincunx: 150,
  opposition: 180,
});

export const KNOWN_ASPECT_NAMES: readonly AspectName[] = Object.keys(ASPECT_CANONICAL_ANGLES) as AspectName[];

/**
 * Throws `AspectConfigError` for unknown names, angles outside [0,180], an angle that
 * disagrees with the name's canonical angle, orbs that are not finite numbers in [0,180],
 * duplicates or an empty list. Does not mutate or normalise.
 */
export function validateAspectSpecs(specs: readonly AspectSpec[]): void {
  if (!Array.isArray(specs) || specs.length === 0) {
    throw new AspectConfigError("EMPTY_ASPECT_LIST", "At least one aspect spec is required");
  }
  const seen = new Set<string>();
  for (const spec of specs as readonly AspectSpec[]) {
    if (!spec || !Object.prototype.hasOwnProperty.call(ASPECT_CANONICAL_ANGLES, spec.name)) {
      throw new AspectConfigError(
        "UNKNOWN_ASPECT_NAME",
        `Unknown aspect name "${String(spec?.name)}"; expected one of ${KNOWN_ASPECT_NAMES.join(", ")}`,
        { name: spec?.name }
      );
    }
    if (typeof spec.angle !== "number" || !Number.isFinite(spec.angle) || spec.angle < 0 || spec.angle > 180) {
      throw new AspectConfigError(
        "INVALID_ASPECT_ANGLE",
        `Aspect "${spec.name}" angle must be a finite number in [0, 180], got ${String(spec.angle)}`,
        { name: spec.name, angle: spec.angle }
      );
    }
    const canonical = ASPECT_CANONICAL_ANGLES[spec.name as AspectName];
    if (spec.angle !== canonical) {
      throw new AspectConfigError(
        "ASPECT_ANGLE_MISMATCH",
        `Aspect "${spec.name}" has angle ${spec.angle} but its canonical angle is ${canonical}`,
        { name: spec.name, angle: spec.angle }
      );
    }
    if (typeof spec.orb !== "number" || !Number.isFinite(spec.orb) || spec.orb < 0 || spec.orb > 180) {
      throw new AspectConfigError(
        "INVALID_ORB",
        `Aspect "${spec.name}" orb must be a finite number in [0, 180], got ${String(spec.orb)}`,
        { name: spec.name, orb: spec.orb }
      );
    }
    if (seen.has(spec.name)) {
      throw new AspectConfigError("DUPLICATE_ASPECT", `Aspect "${spec.name}" listed more than once`, {
        name: spec.name,
      });
    }
    seen.add(spec.name);
  }
}

// ── Policy ──────────────────────────────────────────────────────────────

export interface OrbPolicy {
  /** Stable identifier echoed in results. */
  id: string;
  /** Aspects to generate with their base orbs (the fallback when no class rule applies). */
  aspects: readonly AspectSpec[];
  /** Orb limit (degrees) per body class. */
  classOrbs?: Partial<Record<PointClass, number>>;
  /** Highest priority first. Default: angle, node, point, lot, luminary, planet. */
  classPrecedence?: readonly PointClass[];
  /** Overrides for a class pair, keyed `"classA|classB"` with classes sorted alphabetically. */
  classPairOrbs?: Record<string, number>;
  /** Overrides for a point pair, keyed `"idA|idB"` with IDs sorted alphabetically. */
  pointPairOrbs?: Record<string, number>;
  /**
   * `"class-replaces-aspect"` (default): a matching class/pair rule REPLACES the aspect base
   * orb. `"min"`: the class/pair limit is capped by the aspect base orb.
   */
  combine?: "class-replaces-aspect" | "min";
}

export const DEFAULT_CLASS_PRECEDENCE: readonly PointClass[] = Object.freeze([
  "angle",
  "node",
  "point",
  "lot",
  "luminary",
  "planet",
] as PointClass[]);

export type OrbRuleSource = "point-pair" | "class-pair" | "class" | "aspect";

export interface ResolvedOrb {
  limit: number;
  rule: OrbRuleSource;
  /** The class whose rule decided the limit (`rule: "class"`). */
  decidingClass?: PointClass;
}

function checkOrbValue(value: unknown, where: string): void {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 180) {
    throw new AspectConfigError("INVALID_ORB", `${where} must be a finite number in [0, 180], got ${String(value)}`, {
      where,
      value,
    });
  }
}

function checkClass(value: string, where: string): asserts value is PointClass {
  if (!(POINT_CLASSES as readonly string[]).includes(value)) {
    throw new AspectConfigError("UNKNOWN_POINT_CLASS", `${where}: unknown point class "${value}"`, { where, value });
  }
}

/** Validate a policy (aspect specs, orbs, class names, point IDs). Throws `AspectConfigError`. */
export function validateOrbPolicy(policy: OrbPolicy): void {
  validateAspectSpecs(policy.aspects);
  for (const [cls, orb] of Object.entries(policy.classOrbs ?? {})) {
    checkClass(cls, "classOrbs");
    checkOrbValue(orb, `classOrbs.${cls}`);
  }
  for (const cls of policy.classPrecedence ?? []) checkClass(cls, "classPrecedence");
  for (const [key, orb] of Object.entries(policy.classPairOrbs ?? {})) {
    const parts = key.split("|");
    if (parts.length !== 2) {
      throw new AspectConfigError("INVALID_OPTION", `classPairOrbs key "${key}" must be "classA|classB"`);
    }
    parts.forEach((c) => checkClass(c, "classPairOrbs"));
    checkOrbValue(orb, `classPairOrbs.${key}`);
  }
  for (const [key, orb] of Object.entries(policy.pointPairOrbs ?? {})) {
    const parts = key.split("|");
    if (parts.length !== 2) {
      throw new AspectConfigError("INVALID_OPTION", `pointPairOrbs key "${key}" must be "idA|idB"`);
    }
    for (const p of parts) {
      if (!isPointId(p)) {
        throw new AspectConfigError("UNKNOWN_POINT_ID", `pointPairOrbs: unknown point id "${p}"`, { id: p });
      }
    }
    checkOrbValue(orb, `pointPairOrbs.${key}`);
  }
  if (policy.combine !== undefined && policy.combine !== "class-replaces-aspect" && policy.combine !== "min") {
    throw new AspectConfigError("INVALID_OPTION", `Unknown combine mode "${String(policy.combine)}"`);
  }
}

/** Build and validate a policy, filling defaults (`classPrecedence`, `combine`). */
export function defineOrbPolicy(policy: OrbPolicy): OrbPolicy {
  validateOrbPolicy(policy);
  return {
    ...policy,
    aspects: policy.aspects.map((a) => ({ ...a })),
    classPrecedence: [...(policy.classPrecedence ?? DEFAULT_CLASS_PRECEDENCE)],
    combine: policy.combine ?? "class-replaces-aspect",
  };
}

const sortedKey = (a: string, b: string) => (a <= b ? `${a}|${b}` : `${b}|${a}`);

/**
 * Resolve the orb limit for `spec` between two points under `policy`
 * (precedence in the module header).
 */
export function resolveOrbLimit(
  policy: OrbPolicy,
  a: Pick<ChartPointLike, "id" | "kind">,
  b: Pick<ChartPointLike, "id" | "kind">,
  spec: AspectSpec
): ResolvedOrb {
  const combine = policy.combine ?? "class-replaces-aspect";
  const finish = (limit: number, rule: OrbRuleSource, decidingClass?: PointClass): ResolvedOrb => {
    const capped = combine === "min" && rule !== "aspect" ? Math.min(limit, spec.orb) : limit;
    return decidingClass ? { limit: capped, rule, decidingClass } : { limit: capped, rule };
  };

  const pointKey = sortedKey(a.id, b.id);
  if (policy.pointPairOrbs && pointKey in policy.pointPairOrbs) {
    return finish(policy.pointPairOrbs[pointKey], "point-pair");
  }
  const classKey = sortedKey(a.kind, b.kind);
  if (policy.classPairOrbs && classKey in policy.classPairOrbs) {
    return finish(policy.classPairOrbs[classKey], "class-pair");
  }
  if (policy.classOrbs) {
    const precedence = policy.classPrecedence ?? DEFAULT_CLASS_PRECEDENCE;
    for (const cls of precedence) {
      if ((a.kind === cls || b.kind === cls) && policy.classOrbs[cls] !== undefined) {
        return finish(policy.classOrbs[cls] as number, "class", cls);
      }
    }
  }
  return { limit: spec.orb, rule: "aspect" };
}

/**
 * Named, OPT-IN profile (not a default): Ptolemaic aspects plus quincunx; luminaries 8,
 * planets 6, and 3 whenever either participant is an angle, node, point (Lilith, Chiron) or
 * lot. Mirrors the reference rule (points/angles 3 > luminaries 8 > planets 6).
 */
export const PTOLEMAIC_PLUS_QUINCUNX: Readonly<OrbPolicy> = Object.freeze(
  defineOrbPolicy({
    id: "ptolemaic-plus-quincunx",
    aspects: [
      { name: "conjunction", angle: 0, orb: 6 },
      { name: "sextile", angle: 60, orb: 6 },
      { name: "square", angle: 90, orb: 6 },
      { name: "trine", angle: 120, orb: 6 },
      { name: "quincunx", angle: 150, orb: 6 },
      { name: "opposition", angle: 180, orb: 6 },
    ],
    classOrbs: { luminary: 8, planet: 6, angle: 3, node: 3, point: 3, lot: 3 },
    classPrecedence: ["angle", "node", "point", "lot", "luminary", "planet"],
    combine: "class-replaces-aspect",
  })
);

export const ORB_POLICY_PROFILES: Readonly<Record<string, Readonly<OrbPolicy>>> = Object.freeze({
  [PTOLEMAIC_PLUS_QUINCUNX.id]: PTOLEMAIC_PLUS_QUINCUNX,
});

// ── Motion ──────────────────────────────────────────────────────────────

export type AspectMotion = "applying" | "separating" | "exact" | null;

export type MotionUnavailableReason = "speed-unknown" | "zero-relative-speed";

export interface AspectMotionResult {
  motion: AspectMotion;
  /** d(orb)/dt in degrees per day (positive = widening); `null` when unavailable. */
  orbRate: number | null;
  reason?: MotionUnavailableReason;
}

/** Orb at or below this (degrees) is reported as `"exact"`. */
export const DEFAULT_EXACT_TOLERANCE_DEGREES = 1e-6;

/**
 * Instantaneous applying/separating convention (analytic derivative, not a projected
 * future orb): with d = signed longitude difference B - A wrapped to (-180, 180],
 * separation s = |d|, orb = |s - angle|:
 *   d(orb)/dt = sign(s - angle) * sign(d) * (speedB - speedA).
 * Negative -> `"applying"`, positive -> `"separating"`. `"exact"` when orb <= tolerance.
 * `null` when either speed is unknown (`null`/`undefined`/non-finite), or when the relative
 * speed is exactly zero away from exactness (`reason` says which). Speeds are degrees/day
 * (retrograde negative); wrap across 0 degrees is handled by the signed difference.
 */
export function getAspectMotion(
  lonA: number,
  speedA: number | null | undefined,
  lonB: number,
  speedB: number | null | undefined,
  aspectAngle: number,
  exactToleranceDegrees = DEFAULT_EXACT_TOLERANCE_DEGREES
): AspectMotionResult {
  let d = normalizeAngle(lonB - lonA);
  if (d > 180) d -= 360;
  const s = Math.abs(d);
  const signedOrb = s - aspectAngle;
  if (Math.abs(signedOrb) <= exactToleranceDegrees) {
    return { motion: "exact", orbRate: null };
  }
  if (!isFiniteNumber(speedA) || !isFiniteNumber(speedB)) {
    return { motion: null, orbRate: null, reason: "speed-unknown" };
  }
  const dsdt = (d >= 0 ? 1 : -1) * (speedB - speedA);
  const orbRate = (signedOrb >= 0 ? 1 : -1) * dsdt;
  if (orbRate === 0) return { motion: null, orbRate: 0, reason: "zero-relative-speed" };
  return { motion: orbRate < 0 ? "applying" : "separating", orbRate };
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

// ── Aspect generation ───────────────────────────────────────────────────

export interface PolicyAspectEdge {
  /** Stable IDs; for two-set calls `a` belongs to the first set, `b` to the second. */
  a: PointId;
  b: PointId;
  aKind: PointClass;
  bKind: PointClass;
  longitudeA: number;
  longitudeB: number;
  aspect: AspectName;
  aspectAngle: number;
  /** Exact angular separation in [0, 180]. */
  separation: number;
  /** |separation - aspectAngle|. */
  orb: number;
  /** The generation-time orb limit that admitted this contact. */
  orbLimit: number;
  orbRule: OrbRuleSource;
  decidingClass?: PointClass;
  motion: AspectMotion;
  /** d(orb)/dt, degrees/day; `null` when unavailable. */
  orbRate: number | null;
  motionUnavailableReason?: MotionUnavailableReason;
  /** Equivalence key: opposite ends of one axis (ASC/DSC, MC/IC, node/south node) share it. */
  axisKey: string;
}

export interface ComputePolicyAspectsOptions {
  include?: readonly PointId[];
  exclude?: readonly PointId[];
  /**
   * Additional POST-filter (like the CLI `--max-orb`): can only narrow the policy's limits.
   */
  maxOrb?: number;
  exactToleranceDegrees?: number;
  /** Same-set pairs on one axis (ASC-DSC, node-south node) are trivial; skipped unless true. */
  includeSameAxisPairs?: boolean;
  /**
   * Two-set calls only: ignore the second set's speeds (treat them as 0). Use for
   * transit-to-natal so natal targets stay fixed, and motion is then available even for
   * natal angles.
   */
  fixedTargets?: boolean;
}

export interface AspectCounts {
  /** Edges as generated; ASC and DSC (etc.) count separately. */
  raw: number;
  /** One per axis-equivalence group. */
  grouped: number;
  byAspect: Partial<Record<AspectName, { raw: number; grouped: number }>>;
}

export interface AxisAspectGroup {
  key: string;
  /** Tightest-orb member. */
  representative: PolicyAspectEdge;
  members: PolicyAspectEdge[];
}

export interface OrbPolicyMetadata {
  policyId: string;
  aspects: Array<{ name: AspectName; angle: number; baseOrb: number }>;
  classOrbs: Partial<Record<PointClass, number>>;
  classPrecedence: PointClass[];
  combine: "class-replaces-aspect" | "min";
  pairResolution: string;
  generation: "orb limits resolved per pair before an edge is created";
  motionConvention: string;
  axisEquivalence: string;
}

export interface PolicyAspectResult {
  edges: PolicyAspectEdge[];
  counts: AspectCounts;
  axisGroups: AxisAspectGroup[];
  policy: OrbPolicyMetadata;
}

const MOTION_CONVENTION =
  "instantaneous d(orb)/dt = sign(separation-angle)*sign(signedDiff(B-A))*(speedB-speedA), deg/day; " +
  "negative=applying, positive=separating, orb<=tolerance=exact; null when either speed is unknown " +
  "(angles, lots) or relative speed is zero; fixedTargets treats set B speeds as 0";

const AXIS_EQUIVALENCE =
  "an aspect at angle t to one end of an axis (ASC/DSC, MC/IC, mean/true node vs south node) equals " +
  "angle 180-t to the other end; edges whose canonical (axis-collapsed, flip-corrected) form coincide are one group";

const PAIR_RESOLUTION =
  "limit = pointPairOrbs[idA|idB] (sorted) > classPairOrbs[classA|classB] (sorted) > classOrbs of the first class in " +
  "classPrecedence held by either participant > aspect base orb; combine 'min' additionally caps by the aspect base orb";

export function describeOrbPolicy(policy: OrbPolicy): OrbPolicyMetadata {
  return {
    policyId: policy.id,
    aspects: policy.aspects.map((a) => ({ name: a.name, angle: a.angle, baseOrb: a.orb })),
    classOrbs: { ...(policy.classOrbs ?? {}) },
    classPrecedence: [...(policy.classPrecedence ?? DEFAULT_CLASS_PRECEDENCE)],
    combine: policy.combine ?? "class-replaces-aspect",
    pairResolution: PAIR_RESOLUTION,
    generation: "orb limits resolved per pair before an edge is created",
    motionConvention: MOTION_CONVENTION,
    axisEquivalence: AXIS_EQUIVALENCE,
  };
}

function validatePoints(points: readonly ChartPointLike[], label: string): void {
  const seen = new Set<string>();
  for (const p of points) {
    if (!p || !isPointId(p.id)) {
      throw new AspectConfigError("UNKNOWN_POINT_ID", `${label}: unknown point id "${String((p as any)?.id)}"`, {
        id: (p as any)?.id,
      });
    }
    if (!(POINT_CLASSES as readonly string[]).includes(p.kind)) {
      throw new AspectConfigError("UNKNOWN_POINT_CLASS", `${label}: point "${p.id}" has unknown class "${p.kind}"`, {
        id: p.id,
        kind: p.kind,
      });
    }
    if (!isFiniteNumber(p.longitude)) {
      throw new AspectConfigError("INVALID_POINT", `${label}: point "${p.id}" needs a finite longitude`, { id: p.id });
    }
    if (p.speed !== undefined && p.speed !== null && !isFiniteNumber(p.speed)) {
      throw new AspectConfigError("INVALID_POINT", `${label}: point "${p.id}" speed must be a finite number or null`, {
        id: p.id,
      });
    }
    if (seen.has(p.id)) {
      throw new AspectConfigError("DUPLICATE_POINT_ID", `${label}: duplicate point id "${p.id}"`, { id: p.id });
    }
    seen.add(p.id);
  }
}

function validateOptions(options: ComputePolicyAspectsOptions): void {
  if (options.maxOrb !== undefined && (!isFiniteNumber(options.maxOrb) || options.maxOrb < 0)) {
    throw new AspectConfigError("INVALID_OPTION", `maxOrb must be a finite number >= 0, got ${String(options.maxOrb)}`);
  }
  if (
    options.exactToleranceDegrees !== undefined &&
    (!isFiniteNumber(options.exactToleranceDegrees) || options.exactToleranceDegrees < 0)
  ) {
    throw new AspectConfigError("INVALID_OPTION", "exactToleranceDegrees must be a finite number >= 0");
  }
  for (const list of [options.include, options.exclude]) {
    for (const id of list ?? []) {
      if (!isPointId(id)) throw new AspectConfigError("UNKNOWN_POINT_ID", `Unknown point id "${String(id)}"`, { id });
    }
  }
}

function select<T extends ChartPointLike>(points: readonly T[], options: ComputePolicyAspectsOptions): T[] {
  const include = options.include ? new Set<string>(options.include) : null;
  const exclude = options.exclude ? new Set<string>(options.exclude) : null;
  return points.filter((p) => (!include || include.has(p.id)) && (!exclude || !exclude.has(p.id)));
}

/** Axis-equivalence key; see `AXIS_EQUIVALENCE`. `sideA`/`sideB` separate the two sets of a two-set call. */
function axisKeyOf(a: PointId, sideA: string, b: PointId, sideB: string, angle: number): string {
  const tok = (id: PointId, side: string) => {
    const ax = POINT_DEFINITIONS[id].axis;
    return { token: `${side}${ax ? ax.id : id}`, flip: ax ? ax.end : 0 };
  };
  const ta = tok(a, sideA);
  const tb = tok(b, sideB);
  const flips = ta.flip + tb.flip;
  const canonical = flips % 2 === 1 ? 180 - angle : angle;
  const [t1, t2] = ta.token <= tb.token ? [ta.token, tb.token] : [tb.token, ta.token];
  return `${t1}~${t2}@${canonical}`;
}

function sameAxis(a: PointId, b: PointId): boolean {
  const x = POINT_DEFINITIONS[a].axis;
  const y = POINT_DEFINITIONS[b].axis;
  return !!x && !!y && x.id === y.id;
}

function edgesForPair(
  pa: ChartPointLike,
  pb: ChartPointLike,
  policy: OrbPolicy,
  options: ComputePolicyAspectsOptions,
  sideA: string,
  sideB: string,
  speedBOverride: number | null | undefined
): PolicyAspectEdge[] {
  const out: PolicyAspectEdge[] = [];
  const a = normalizeAngle(pa.longitude);
  const b = normalizeAngle(pb.longitude);
  const separation = Math.min(normalizeAngle(b - a), normalizeAngle(a - b));
  const tolerance = options.exactToleranceDegrees ?? DEFAULT_EXACT_TOLERANCE_DEGREES;
  for (const spec of policy.aspects) {
    const resolved = resolveOrbLimit(policy, pa, pb, spec);
    const orb = Math.abs(separation - spec.angle);
    if (orb > resolved.limit + 1e-10) continue;
    if (options.maxOrb !== undefined && orb > options.maxOrb + 1e-10) continue;
    const speedB = speedBOverride !== undefined ? speedBOverride : pb.speed;
    const m = getAspectMotion(a, pa.speed, b, speedB, spec.angle, tolerance);
    const edge: PolicyAspectEdge = {
      a: pa.id,
      b: pb.id,
      aKind: pa.kind,
      bKind: pb.kind,
      longitudeA: a,
      longitudeB: b,
      aspect: spec.name,
      aspectAngle: spec.angle,
      separation,
      orb,
      orbLimit: resolved.limit,
      orbRule: resolved.rule,
      motion: m.motion,
      orbRate: m.orbRate,
      axisKey: axisKeyOf(pa.id, sideA, pb.id, sideB, spec.angle),
    };
    if (resolved.decidingClass) edge.decidingClass = resolved.decidingClass;
    if (m.reason) edge.motionUnavailableReason = m.reason;
    out.push(edge);
  }
  return out;
}

/** Tight-first ordering: orb, then IDs, then aspect angle (deterministic). */
export function sortTightContacts(
  edges: readonly PolicyAspectEdge[],
  options: { maxOrb?: number; limit?: number } = {}
): PolicyAspectEdge[] {
  let list = [...edges];
  if (options.maxOrb !== undefined) list = list.filter((e) => e.orb <= options.maxOrb! + 1e-10);
  list.sort(
    (x, y) =>
      x.orb - y.orb ||
      (x.a < y.a ? -1 : x.a > y.a ? 1 : 0) ||
      (x.b < y.b ? -1 : x.b > y.b ? 1 : 0) ||
      x.aspectAngle - y.aspectAngle
  );
  return options.limit !== undefined ? list.slice(0, options.limit) : list;
}

/** Group edges that are the same observation seen from opposite ends of an axis. */
export function groupAspectsByAxis(edges: readonly PolicyAspectEdge[]): AxisAspectGroup[] {
  const groups = new Map<string, AxisAspectGroup>();
  for (const e of edges) {
    const g = groups.get(e.axisKey);
    if (!g) {
      groups.set(e.axisKey, { key: e.axisKey, representative: e, members: [e] });
    } else {
      g.members.push(e);
      if (e.orb < g.representative.orb) g.representative = e;
    }
  }
  return [...groups.values()];
}

/** Raw and axis-grouped counts, overall and per aspect (grouped uses each group's representative). */
export function countAspects(edges: readonly PolicyAspectEdge[]): AspectCounts {
  const groups = groupAspectsByAxis(edges);
  const byAspect: AspectCounts["byAspect"] = {};
  for (const e of edges) {
    const slot = (byAspect[e.aspect] ??= { raw: 0, grouped: 0 });
    slot.raw++;
  }
  for (const g of groups) {
    const slot = (byAspect[g.representative.aspect] ??= { raw: 0, grouped: 0 });
    slot.grouped++;
  }
  return { raw: edges.length, grouped: groups.length, byAspect };
}

function finish(edges: PolicyAspectEdge[], policy: OrbPolicy): PolicyAspectResult {
  const sorted = sortTightContacts(edges);
  return {
    edges: sorted,
    counts: countAspects(sorted),
    axisGroups: groupAspectsByAxis(sorted),
    policy: describeOrbPolicy(policy),
  };
}

/**
 * Aspects among one set of points under an orb policy (orb limits resolved at generation).
 * Throws `AspectConfigError` for invalid policies, options or points. Edges are sorted tight-first.
 */
export function computeAspectsWithPolicy(
  points: readonly ChartPointLike[],
  policy: OrbPolicy,
  options: ComputePolicyAspectsOptions = {}
): PolicyAspectResult {
  validateOrbPolicy(policy);
  validateOptions(options);
  validatePoints(points, "points");
  const pts = select(points, options);
  const edges: PolicyAspectEdge[] = [];
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      if (!options.includeSameAxisPairs && sameAxis(pts[i].id, pts[j].id)) continue;
      edges.push(...edgesForPair(pts[i], pts[j], policy, options, "", "", undefined));
    }
  }
  return finish(edges, policy);
}

/**
 * Two-set (synastry / transit-to-natal) variant: `a` ids come from `setA`, `b` ids from `setB`.
 * With `fixedTargets: true` set B is treated as stationary (natal targets), so motion is
 * available even for set-B angles.
 */
export function computeAspectsBetweenSetsWithPolicy(
  setA: readonly ChartPointLike[],
  setB: readonly ChartPointLike[],
  policy: OrbPolicy,
  options: ComputePolicyAspectsOptions = {}
): PolicyAspectResult {
  validateOrbPolicy(policy);
  validateOptions(options);
  validatePoints(setA, "setA");
  validatePoints(setB, "setB");
  const A = select(setA, options);
  const B = select(setB, options);
  const edges: PolicyAspectEdge[] = [];
  for (const pa of A) {
    for (const pb of B) {
      edges.push(...edgesForPair(pa, pb, policy, options, "A:", "B:", options.fixedTargets ? 0 : undefined));
    }
  }
  return finish(edges, policy);
}

/** Transit-to-natal: `computeAspectsBetweenSetsWithPolicy` with `fixedTargets` defaulting to true. */
export function computeTransitAspectsWithPolicy(
  transitPoints: readonly ChartPointLike[],
  natalPoints: readonly ChartPointLike[],
  policy: OrbPolicy,
  options: ComputePolicyAspectsOptions = {}
): PolicyAspectResult {
  return computeAspectsBetweenSetsWithPolicy(transitPoints, natalPoints, policy, {
    ...options,
    fixedTargets: options.fixedTargets ?? true,
  });
}
