import lunarObservances from "./lunar-observances.json";
import natalProfiles from "./natal-descriptions.json";
import profiles from "./profiles.json";
import relationshipProfiles from "./relationship-descriptions.json";
import yearLords from "./year-lord-descriptions.json";
import yearLordNumbers from "./year-lord-numbers.json";
import type { calculateMayaBirthCycles } from "./birth-cycles";
import type { MayaSignId, MayaTone, TzolkinDay } from "./calendar";
import type { calculateMayaNatal, calculateMayaRelationship, MayaCrossRole, MayaStage, MayaTreePosition } from "./johnson";

export { calculateMayaBirthCycles } from "./birth-cycles";
export { getMayaSunsetWelcome, type MayaSunsetLocation } from "./sunset-welcome";
export type { MayaBirthCyclesOptions, MayaLunarPhase, MayaSolarQuarter } from "./birth-cycles";
export {
  getMayaDaySignReference, getMayaHaabMonthReference, listMayaDaySignReferences, listMayaHaabMonthReferences, MAYA_GLYPH_BASE_URL,
} from "./day-sign-reference";

export {
  getMayaCalendarBoard, getMayaCalendarDay, getMayaHaabDate, getTzolkinCycle, getTzolkinDay, getTzolkinTrecena,
  MayaCalculationError, MAYA_GMT_CORRELATION, MAYA_JOHNSON_METHOD, TZOLKIN_CYCLE_DAYS,
} from "./calendar";
export type { MayaDateInput, MayaDirection, MayaHaabCount, MayaHaabDate, MayaHaabMonth, MayaSignId, MayaTone, TzolkinDay } from "./calendar";
export { calculateMayaNatal, calculateMayaRelationship, calculateMayaTiming } from "./johnson";
export type {
  MayaColumn, MayaCrossRole, MayaRelationshipSignMatch, MayaStage, MayaTimingOptions, MayaTreePoint, MayaTreePosition,
} from "./johnson";

export interface MayaDescription {
  readonly en: string;
  readonly pt: string;
}

function copyDescription<Key extends string | number>(
  descriptions: Record<Key, MayaDescription>,
  key: Key,
): MayaDescription {
  if (!Object.prototype.hasOwnProperty.call(descriptions, key)) {
    throw new RangeError("Unknown Maya description key");
  }
  return { ...descriptions[key] };
}

export function getMayaSignDescription(sign: MayaSignId): MayaDescription {
  return copyDescription(profiles.signs, sign);
}

export function getMayaToneDescription(tone: MayaTone): MayaDescription {
  return copyDescription(profiles.tones, tone);
}

/** Ceremonial guidance for a day's number within its current trecena. */
export function getMayaTrecenaGuidance(tone: MayaTone): MayaDescription {
  const profile = tone === 2 || tone === 3 || tone === 4 || tone === 5 ? "building" : tone;
  return copyDescription(profiles.trecena, profile);
}

export function getMayaRoleDescription(role: MayaCrossRole): MayaDescription {
  return copyDescription(profiles.roles, role);
}

export function getMayaStageDescription(stage: MayaStage): MayaDescription {
  return copyDescription(profiles.stages, stage);
}

export function getMayaYearLordDescription(sign: MayaSignId): MayaDescription | null {
  if (!Object.prototype.hasOwnProperty.call(yearLords, sign)) return null;
  return copyDescription(yearLords, sign as keyof typeof yearLords);
}

/** The number modifies the natal Year Lord as it modifies the birth sign. */
export function getMayaYearLordReading(day: Pick<TzolkinDay, "sign" | "tone">) {
  const description = getMayaYearLordDescription(day.sign);
  return description && {
    description,
    numberModifier: copyDescription(yearLordNumbers, day.tone),
    modifierBasis: "synthesis" as const,
  };
}

const natalCrossRoles: Partial<Record<MayaTreePosition, MayaCrossRole>> = {
  "youth.center": "conception",
  "adult.right": "rightHand",
  "adult.center": "core",
  "adult.left": "leftHand",
  "mature.center": "destiny",
};

/** Read the nine natal positions and the directed links along the Feathered Serpent. */
export function getMayaNatalReading(natal: ReturnType<typeof calculateMayaNatal>) {
  const positions = Object.fromEntries(natal.featheredSerpent.map(({ position, day }) => {
    const role = natalCrossRoles[position];
    return [position, {
      role: role ? getMayaRoleDescription(role)
        : copyDescription(natalProfiles.guardians, position as keyof typeof natalProfiles.guardians),
      sign: getMayaSignDescription(day.sign),
      tone: getMayaToneDescription(day.tone),
    }];
  })) as Record<MayaTreePosition, { role: MayaDescription; sign: MayaDescription; tone: MayaDescription }>;

  const connections = natal.featheredSerpent.slice(1).map((point, index) => {
    const from = natal.featheredSerpent[index].position;
    return {
      from,
      to: point.position,
      description: copyDescription(natalProfiles.links, from as keyof typeof natalProfiles.links),
    };
  });
  return { positions, connections, basis: "synthesis" as const };
}

/** Interpret the available solar quarter and lunar phase in Johnson’s birth-time method. */
export function getMayaBirthCycleReading(cycles: Awaited<ReturnType<typeof calculateMayaBirthCycles>>) {
  return {
    solar: cycles.solar?.available ? copyDescription(profiles.solarQuarters, cycles.solar.quarter) : null,
    lunar: copyDescription(profiles.lunarPhases, cycles.lunar.phase),
  };
}

/** Interpret a calculated composite and its two natal comparisons. */
export function getMayaRelationshipReading(relationship: ReturnType<typeof calculateMayaRelationship>) {
  const { cross, sameDirection, sameYearLordFamily, natalOverlap } = relationship;
  const roles = Object.keys(cross) as MayaCrossRole[];
  const positions = Object.fromEntries(roles.map(role => [role, {
    role: copyDescription(relationshipProfiles.roles, role),
    sign: copyDescription(relationshipProfiles.signs, cross[role].sign),
    tone: copyDescription(relationshipProfiles.tones, cross[role].tone),
  }])) as Record<MayaCrossRole, { role: MayaDescription; sign: MayaDescription; tone: MayaDescription }>;

  return {
    positions,
    tone: { ...positions.core.tone },
    affinities: {
      sameDirection: copyDescription(relationshipProfiles.affinities.sameDirection, sameDirection ? "shared" : "different"),
      sameYearLordFamily: copyDescription(relationshipProfiles.affinities.sameYearLordFamily, sameYearLordFamily ? "shared" : "different"),
    },
    natalOverlap: {
      first: copyDescription(relationshipProfiles.recurrence, natalOverlap.first.length ? "shared" : "none"),
      second: copyDescription(relationshipProfiles.recurrence, natalOverlap.second.length ? "shared" : "none"),
    },
    basis: { positions: "synthesis", tone: "synthesis", natalOverlap: "synthesis" } as const,
  };
}

export interface MayaPersonalLunarMonthGuidance {
  readonly basis: "published-example" | "day-sign-practice";
  readonly description: MayaDescription;
}

const lunarExamples: Partial<Record<`${MayaSignId}:${MayaTone}`, MayaDescription>> = lunarObservances.examples;

/** Guidance for an observance whose date is already identified by the personal lunar month calculation. */
export function getMayaPersonalLunarMonthGuidance(
  day: Pick<TzolkinDay, "sign" | "tone">,
): MayaPersonalLunarMonthGuidance {
  const example = lunarExamples[`${day.sign}:${day.tone}`];
  return example
    ? { basis: "published-example", description: { ...example } }
    : { basis: "day-sign-practice", description: copyDescription(lunarObservances.daySigns, day.sign) };
}
