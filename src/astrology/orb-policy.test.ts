import { describe, expect, it } from "vitest";
import { computeAspects } from "./aspects";
import {
  AspectConfigError,
  computeAspectsBetweenSetsWithPolicy,
  computeAspectsWithPolicy,
  computeTransitAspectsWithPolicy,
  defineOrbPolicy,
  getAspectMotion,
  groupAspectsByAxis,
  PTOLEMAIC_PLUS_QUINCUNX,
  resolveOrbLimit,
  sortTightContacts,
  validateAspectSpecs,
} from "./orb-policy";
import { type ChartPointLike, type PointClass, type PointId } from "./points";

const pt = (id: PointId, kind: PointClass, longitude: number, speed: number | null = null): ChartPointLike => ({
  id,
  kind,
  longitude,
  speed,
});
const sextile = { name: "sextile" as const, angle: 60, orb: 5 };

describe("orb precedence", () => {
  const P = PTOLEMAIC_PLUS_QUINCUNX;
  const cases: Array<[string, PointId, PointClass, PointId, PointClass, number, string]> = [
    ["planet-planet", "mercury", "planet", "mars", "planet", 6, "class"],
    ["luminary-planet -> luminary beats planet", "sun", "luminary", "mercury", "planet", 8, "class"],
    ["luminary-luminary", "sun", "luminary", "moon", "luminary", 8, "class"],
    ["planet-angle -> angle override", "venus", "planet", "asc", "angle", 3, "class"],
    ["luminary-angle -> angle beats luminary", "sun", "luminary", "mc", "angle", 3, "class"],
    ["luminary-node", "moon", "luminary", "true-node", "node", 3, "class"],
    ["planet-point (Chiron)", "saturn", "planet", "chiron", "point", 3, "class"],
    ["luminary-lot", "sun", "luminary", "lot-fortune", "lot", 3, "class"],
  ];
  it.each(cases)("%s", (_n, ida, ka, idb, kb, limit, rule) => {
    const r = resolveOrbLimit(P, { id: ida, kind: ka }, { id: idb, kind: kb }, P.aspects[1]);
    expect(r.limit).toBe(limit);
    expect(r.rule).toBe(rule);
  });

  it("is symmetric in the participants", () => {
    const a = resolveOrbLimit(P, { id: "sun", kind: "luminary" }, { id: "asc", kind: "angle" }, P.aspects[0]);
    const b = resolveOrbLimit(P, { id: "asc", kind: "angle" }, { id: "sun", kind: "luminary" }, P.aspects[0]);
    expect(a).toEqual(b);
  });

  it("point-pair override beats class-pair override beats class rule; min caps by aspect orb", () => {
    const policy = defineOrbPolicy({
      id: "t",
      aspects: [sextile],
      classOrbs: { planet: 6 },
      classPairOrbs: { "planet|planet": 4 },
      pointPairOrbs: { "mars|venus": 1 },
    });
    const spec = policy.aspects[0];
    const lim = (a: PointId, b: PointId) =>
      resolveOrbLimit(policy, { id: a, kind: "planet" }, { id: b, kind: "planet" }, spec);
    expect(lim("venus", "mars")).toMatchObject({ limit: 1, rule: "point-pair" });
    expect(lim("mercury", "mars")).toMatchObject({ limit: 4, rule: "class-pair" });
    const minPolicy = defineOrbPolicy({ id: "m", aspects: [sextile], classOrbs: { planet: 9 }, combine: "min" });
    expect(resolveOrbLimit(minPolicy, { id: "mars", kind: "planet" }, { id: "venus", kind: "planet" }, sextile).limit).toBe(5);
  });

  it("falls back to the aspect base orb when no class rule applies", () => {
    const policy = defineOrbPolicy({ id: "f", aspects: [sextile], classOrbs: { angle: 3 } });
    expect(
      resolveOrbLimit(policy, { id: "mars", kind: "planet" }, { id: "venus", kind: "planet" }, sextile)
    ).toEqual({ limit: 5, rule: "aspect" });
  });
});

describe("generation-time policy vs post-filtering", () => {
  const pts = [pt("mercury", "planet", 0, 1), pt("venus", "planet", 65.5, 1)];

  it("default 5 degree sextile omits a 5.5 degree contact that the profile includes", () => {
    expect(computeAspects({ mercury: { longitude: 0 }, venus: { longitude: 65.5 } })).toHaveLength(0);
    const r = computeAspectsWithPolicy(pts, PTOLEMAIC_PLUS_QUINCUNX);
    expect(r.edges).toHaveLength(1);
    expect(r.edges[0]).toMatchObject({ aspect: "sextile", orb: 5.5, orbLimit: 6, orbRule: "class" });
  });

  it("maxOrb is a narrowing post-filter only and cannot widen", () => {
    expect(computeAspectsWithPolicy(pts, PTOLEMAIC_PLUS_QUINCUNX, { maxOrb: 5 }).edges).toHaveLength(0);
    expect(computeAspectsWithPolicy(pts, PTOLEMAIC_PLUS_QUINCUNX, { maxOrb: 20 }).edges).toHaveLength(1);
  });

  it("applies 3 degree orbs to angles, 8 to luminaries, includes quincunx, excludes minor aspects", () => {
    const r = computeAspectsWithPolicy(
      [
        pt("sun", "luminary", 0, 1),
        pt("moon", "luminary", 156.5, 13), // quincunx orb 6.5, within the luminary-pair limit of 8
        pt("asc", "angle", 33, null), // 33 from sun: duodecile not in profile
        pt("mc", "angle", 123.5, null), // trine to sun orb 3.5 > 3 -> omitted
      ],
      PTOLEMAIC_PLUS_QUINCUNX
    );
    const names = r.edges.map((e) => `${e.a}-${e.b}-${e.aspect}`);
    expect(names).toContain("sun-moon-quincunx");
    expect(names.some((n) => n.includes("duodecile"))).toBe(false);
    expect(names).not.toContain("sun-mc-trine");
  });

  it("profile is not the default: default specs are untouched", () => {
    expect(PTOLEMAIC_PLUS_QUINCUNX.aspects.map((a) => a.name)).toEqual([
      "conjunction", "sextile", "square", "trine", "quincunx", "opposition",
    ]);
  });
});

describe("applying / separating motion", () => {
  it("hand-computed: A forward toward B past the target separates; retrograde A applies", () => {
    // A=10, B=66 (sextile target 60, separation 56). A moving +1/day shrinks separation -> away from 60.
    expect(getAspectMotion(10, 1, 66, 0, 60).motion).toBe("separating");
    expect(getAspectMotion(10, -1, 66, 0, 60).motion).toBe("applying");
    expect(getAspectMotion(10, 1, 66, 0, 60).orbRate).toBe(1);
  });

  it("retrograde body closing on a direct body", () => {
    // Mars 100 retro -0.5, Venus 98 direct +1: they close from both sides -> applying conjunction.
    const m = getAspectMotion(100, -0.5, 98, 1, 0);
    expect(m.motion).toBe("applying");
    expect(m.orbRate).toBeCloseTo(-1.5, 12);
  });

  it("wraps across 0 degrees (conjunction and opposition)", () => {
    expect(getAspectMotion(359, 1, 1, 0, 0).motion).toBe("applying"); // A reaches 360=0 toward B at 1
    expect(getAspectMotion(1, 1, 359, 0, 0).motion).toBe("separating"); // A passed B? A=1,B=359: A moves away
    // Opposition: A=350 forward, B=165 fixed; separation 175 shrinking away from 180.
    expect(getAspectMotion(350, 1, 165, 0, 180).motion).toBe("separating");
    expect(getAspectMotion(350, -1, 165, 0, 180).motion).toBe("applying");
  });

  it("exact within tolerance; null for unknown speed or zero relative speed", () => {
    expect(getAspectMotion(10, 1, 10, 0, 0).motion).toBe("exact");
    expect(getAspectMotion(10, 1, 70, 0, 60).motion).toBe("exact");
    expect(getAspectMotion(10, null, 66, 0, 60)).toMatchObject({ motion: null, reason: "speed-unknown" });
    expect(getAspectMotion(10, 1, 66, undefined, 60)).toMatchObject({ motion: null, reason: "speed-unknown" });
    expect(getAspectMotion(10, 0.5, 66, 0.5, 60)).toMatchObject({ motion: null, reason: "zero-relative-speed" });
  });

  it("edges carry null motion for angles and numeric motion for bodies with speeds", () => {
    const r = computeAspectsWithPolicy(
      [pt("sun", "luminary", 10, 1), pt("mars", "planet", 66, 0.5), pt("asc", "angle", 12, null)],
      PTOLEMAIC_PLUS_QUINCUNX
    );
    const get = (a: string, b: string) => r.edges.find((e) => e.a === a && e.b === b)!;
    expect(get("sun", "asc").motion).toBeNull();
    expect(get("sun", "asc").motionUnavailableReason).toBe("speed-unknown");
    expect(get("sun", "mars").motion)
  });

  it("fixedTargets keeps natal targets still and makes motion available for natal angles", () => {
    const transit = [pt("mars", "planet", 88, 0.7)];
    const natal = [pt("asc", "angle", 0, null), pt("sun", "luminary", 0, 1)];
    const moving = computeAspectsBetweenSetsWithPolicy(transit, natal, PTOLEMAIC_PLUS_QUINCUNX);
    expect(moving.edges.find((e) => e.b === "asc")!.motion).toBeNull();
    const fixed = computeTransitAspectsWithPolicy(transit, natal, PTOLEMAIC_PLUS_QUINCUNX);
    const toAsc = fixed.edges.find((e) => e.b === "asc")!;
    expect(toAsc.motion).toBe("applying"); // 88 -> 90 square, natal fixed
    // natal Sun's own speed (1) must be ignored: moving it ahead would make this separating
    const toSun = fixed.edges.find((e) => e.b === "sun")!;
    expect(toSun.motion).toBe("applying");
    const notFixed = computeAspectsBetweenSetsWithPolicy(transit, natal, PTOLEMAIC_PLUS_QUINCUNX);
    expect(notFixed.edges.find((e) => e.b === "sun")!.motion).toBe("separating");
  });
});

describe("axis-equivalence grouping", () => {
  it("ASC conjunction and DSC opposition to one planet are one grouped observation", () => {
    const r = computeAspectsWithPolicy(
      [pt("asc", "angle", 100), pt("dsc", "angle", 280), pt("mars", "planet", 102)],
      PTOLEMAIC_PLUS_QUINCUNX
    );
    expect(r.edges.map((e) => `${e.a}-${e.b}-${e.aspect}`).sort()).toEqual([
      "asc-mars-conjunction",
      "dsc-mars-opposition",
    ]);
    expect(r.counts.raw).toBe(2);
    expect(r.counts.grouped).toBe(1);
    expect(r.axisGroups[0].members).toHaveLength(2);
  });

  it("MC/IC and node/south node collapse too; square to both ends of an axis is one group", () => {
    const r = computeAspectsWithPolicy(
      [
        pt("mc", "angle", 0),
        pt("ic", "angle", 180),
        pt("mean-node", "node", 90, -0.05),
        pt("south-node-mean", "node", 270, -0.05),
        pt("venus", "planet", 1),
      ],
      PTOLEMAIC_PLUS_QUINCUNX
    );
    // venus: conj mc, opp ic (1 group); square mean-node, square south-node (1 group)... plus mc-node squares etc.
    const venusEdges = r.edges.filter((e) => e.a === "venus" || e.b === "venus");
    const g = groupAspectsByAxis(venusEdges);
    expect(venusEdges.length).toBe(4);
    expect(g.length).toBe(2);
    // Whole-chart: raw is always >= grouped
    expect(r.counts.raw).toBeGreaterThan(r.counts.grouped);
  });

  it("same-axis pairs are skipped unless requested; in two-set calls the sets stay separate", () => {
    const pts = [pt("asc", "angle", 0), pt("dsc", "angle", 180)];
    expect(computeAspectsWithPolicy(pts, PTOLEMAIC_PLUS_QUINCUNX).edges).toHaveLength(0);
    expect(computeAspectsWithPolicy(pts, PTOLEMAIC_PLUS_QUINCUNX, { includeSameAxisPairs: true }).edges).toHaveLength(1);
    const cross = computeAspectsBetweenSetsWithPolicy(
      [pt("asc", "angle", 0), pt("dsc", "angle", 180)],
      [pt("sun", "luminary", 1), pt("moon", "luminary", 181)],
      PTOLEMAIC_PLUS_QUINCUNX
    );
    // ASC(A)-sun(B) conj, ASC-moon opp, DSC-sun opp, DSC-moon conj: groups by (axis A, point) -> 2
    expect(cross.counts.raw).toBe(4);
    expect(cross.counts.grouped).toBe(2);
  });

  it("sortTightContacts orders by orb with a deterministic tie-break", () => {
    const r = computeAspectsWithPolicy(
      [pt("sun", "luminary", 0), pt("mars", "planet", 3), pt("venus", "planet", 1), pt("saturn", "planet", 90.5)],
      PTOLEMAIC_PLUS_QUINCUNX
    );
    const sorted = sortTightContacts(r.edges, { maxOrb: 2 });
    expect(sorted.map((e) => e.orb)).toEqual([...sorted.map((e) => e.orb)].sort((a, b) => a - b));
    expect(sorted.every((e) => e.orb <= 2)).toBe(true);
  });
});

describe("validation uses typed errors", () => {
  const code = (fn: () => unknown) => {
    try {
      fn();
    } catch (e) {
      expect(e).toBeInstanceOf(AspectConfigError);
      return (e as AspectConfigError).code;
    }
    return "no-throw";
  };

  it("rejects bad aspect specs", () => {
    expect(code(() => validateAspectSpecs([{ name: "bogus" as any, angle: 10, orb: 1 }]))).toBe("UNKNOWN_ASPECT_NAME");
    expect(code(() => validateAspectSpecs([{ name: "sextile", angle: 61, orb: 1 }]))).toBe("ASPECT_ANGLE_MISMATCH");
    expect(code(() => validateAspectSpecs([{ name: "sextile", angle: 200, orb: 1 }]))).toBe("INVALID_ASPECT_ANGLE");
    expect(code(() => validateAspectSpecs([{ name: "sextile", angle: 60, orb: -1 }]))).toBe("INVALID_ORB");
    expect(code(() => validateAspectSpecs([{ name: "sextile", angle: 60, orb: NaN }]))).toBe("INVALID_ORB");
    expect(code(() => validateAspectSpecs([sextile, sextile]))).toBe("DUPLICATE_ASPECT");
    expect(code(() => validateAspectSpecs([]))).toBe("EMPTY_ASPECT_LIST");
  });

  it("rejects bad policies, options and points instead of returning empty results", () => {
    expect(code(() => defineOrbPolicy({ id: "x", aspects: [sextile], classOrbs: { wizard: 3 } as any }))).toBe("UNKNOWN_POINT_CLASS");
    expect(code(() => defineOrbPolicy({ id: "x", aspects: [sextile], pointPairOrbs: { "sun|nope": 3 } }))).toBe("UNKNOWN_POINT_ID");
    expect(code(() => computeAspectsWithPolicy([], PTOLEMAIC_PLUS_QUINCUNX, { maxOrb: -1 }))).toBe("INVALID_OPTION");
    expect(code(() => computeAspectsWithPolicy([pt("sun", "luminary", 1), pt("sun", "luminary", 2)], PTOLEMAIC_PLUS_QUINCUNX))).toBe("DUPLICATE_POINT_ID");
    expect(code(() => computeAspectsWithPolicy([{ id: "zzz" as any, kind: "planet", longitude: 1 }], PTOLEMAIC_PLUS_QUINCUNX))).toBe("UNKNOWN_POINT_ID");
    expect(code(() => computeAspectsWithPolicy([pt("sun", "luminary", NaN)], PTOLEMAIC_PLUS_QUINCUNX))).toBe("INVALID_POINT");
    expect(code(() => computeAspectsWithPolicy([], { id: "bad", aspects: [{ name: "x" as any, angle: 0, orb: 1 }] }))).toBe("UNKNOWN_ASPECT_NAME");
  });

  it("result metadata states the pair-resolution rule", () => {
    const r = computeAspectsWithPolicy([], PTOLEMAIC_PLUS_QUINCUNX);
    expect(r.policy.policyId).toBe("ptolemaic-plus-quincunx");
    expect(r.policy.classPrecedence[0]).toBe("angle");
    expect(r.policy.pairResolution).toMatch(/classPrecedence/);
    expect(r.policy.motionConvention).toMatch(/applying/);
  });
});
