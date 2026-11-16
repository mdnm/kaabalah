import { cliText } from "../runtime/language";
import { exitWithError } from "../runtime/errors";
import { ORB_PROFILE_NAMES, POINT_ID_NAMES } from "../runtime/astro-names";
import { booleanOption, enumList, enumValue, listOption, payloadValue, stringOption } from "../runtime/options";
import type { Flags, InputPayload } from "../runtime/types";
import type { AstrologyModule } from "./astrology";

/** Options shared by every command that can run an orb policy: generation-time profile, point selection, axis grouping. */
export interface AnalysisOptions {
  orbProfile?: string;
  orbPolicy?: Record<string, unknown>;
  points?: string[];
  groupAxes: boolean;
}

export function parseAnalysisOptions(flags: Flags, payload: InputPayload): AnalysisOptions {
  const orbProfile = enumValue(stringOption(flags, payload, "orb-profile", "orbProfile"), ORB_PROFILE_NAMES, "orb-profile", flags);
  const rawPolicy = payloadValue(payload, "orbPolicy");
  if (rawPolicy != null && (typeof rawPolicy !== "object" || Array.isArray(rawPolicy))) {
    exitWithError("INVALID_ARGUMENT", cliText("\"orbPolicy\" must be an object in --input-json."), flags);
  }
  if (orbProfile && rawPolicy) {
    exitWithError("INVALID_ARGUMENT", cliText("Use either --orb-profile or an \"orbPolicy\" object, not both."), flags);
  }
  const points = enumList(listOption(flags, payload, "points", "points"), POINT_ID_NAMES, "points", flags);
  return {
    orbProfile,
    orbPolicy: (rawPolicy as Record<string, unknown> | undefined) ?? undefined,
    points,
    groupAxes: booleanOption(flags, payload, "group-axes", "groupAxes"),
  };
}

export function hasPolicy(options: AnalysisOptions): boolean {
  return options.orbProfile !== undefined || options.orbPolicy !== undefined;
}

type OrbPolicy = import("../../astrology").OrbPolicy;

export function resolveOrbPolicy(
  astro: AstrologyModule,
  options: AnalysisOptions,
  aspectFilter: string[] | undefined,
  flags: Flags
): OrbPolicy {
  const base = (options.orbPolicy ?? astro.ORB_POLICY_PROFILES[options.orbProfile as string]) as OrbPolicy;
  if (!aspectFilter || !Array.isArray(base.aspects)) return base;
  const aspects = base.aspects.filter((spec) => aspectFilter.includes(spec.name));
  if (aspects.length === 0) {
    exitWithError(
      "INVALID_ARGUMENT",
      cliText("None of the requested aspects belong to orb policy \"{0}\" (it generates: {1}).", [base.id, base.aspects.map((spec) => spec.name).join(", ")]),
      flags
    );
  }
  return { ...base, aspects };
}

/** Shape a policy result for output: edges + counts + policy metadata; axis groups only when asked. */
export function shapePolicyResult(
  result: import("../../astrology").PolicyAspectResult,
  options: AnalysisOptions,
  maxOrb: number | undefined
) {
  return {
    profile: result.policy.policyId,
    generation: "orb limits are resolved per pair while contacts are generated (unlike --max-orb, which only filters afterwards)",
    maxOrbPostFilter: maxOrb ?? null,
    pointSelection: options.points ?? "all",
    counts: result.counts,
    edges: result.edges,
    ...(options.groupAxes ? { axisGroups: result.axisGroups } : {}),
    policy: result.policy,
  };
}

