import descriptions from "./timing-descriptions.json";
import type { NumerologyValues } from "./data";
import { freezeTextData } from "../localization";

/** Year-of-life technique prose: each reduced Fibonacci value identifies its heptad’s ruling Ark Annu. */
export interface FibonacciYearDescriptionEntry {
  readonly pt: string;
  readonly en: string;
  readonly keywords: {
    readonly pt: readonly string[];
    readonly en: readonly string[];
  };
  readonly src: readonly {
    readonly file: string;
    readonly from: number;
    readonly to: number;
  }[];
  readonly reviewNotes: readonly string[];
}

/** Introductory prose for the birthday-to-birthday sequence seeded by completed age. */
export const FIBONACCI_YEAR_DESCRIPTION: FibonacciYearDescriptionEntry = Object.freeze({
  pt: descriptions.fibonacciYear.pt,
  en: descriptions.fibonacciYear.en,
  keywords: Object.freeze({
    pt: Object.freeze([...descriptions.fibonacciYear.keywords.pt]),
    en: Object.freeze([...descriptions.fibonacciYear.keywords.en]),
  }),
  src: Object.freeze([]),
  reviewNotes: Object.freeze([] as string[]),
});

/** Returns the immutable technique introduction, without calculating any cycle. */
export function getFibonacciYearDescriptionEntry(): FibonacciYearDescriptionEntry {
  return FIBONACCI_YEAR_DESCRIPTION;
}

/** Portuguese locales start with `pt`; omitted and other string locales use English. */
export function getFibonacciYearDescription(language?: string): string | undefined {
  if (language !== undefined && typeof language !== "string") return undefined;
  return language?.startsWith("pt") ? FIBONACCI_YEAR_DESCRIPTION.pt : FIBONACCI_YEAR_DESCRIPTION.en;
}

/** Two-sentence themes for a calculated personal-month value. */
export type PersonalMonthDescriptionEntry = FibonacciYearDescriptionEntry;

/** Themes for 1–9, 11, 22, 33 and 44; values are never reduced by the lookup. */
export const PERSONAL_MONTH_DESCRIPTIONS: Readonly<Record<NumerologyValues, PersonalMonthDescriptionEntry>> =
  freezeTextData(Object.fromEntries(
    Object.entries(descriptions.personalMonths satisfies Record<NumerologyValues,
      Pick<PersonalMonthDescriptionEntry, "pt" | "en" | "keywords">>).map(([value, entry]) => [value, {
      ...entry,
      src: [],
      reviewNotes: [],
    }]),
  ) as unknown as Record<NumerologyValues, PersonalMonthDescriptionEntry>);

/** Accepts the numerical value, not the month's position in the birthday year. */
export function getPersonalMonthDescriptionEntry(value: NumerologyValues): PersonalMonthDescriptionEntry | undefined {
  if (typeof value !== "number" || !Object.prototype.hasOwnProperty.call(PERSONAL_MONTH_DESCRIPTIONS, value)) {
    return undefined;
  }
  return PERSONAL_MONTH_DESCRIPTIONS[value];
}

/** Portuguese locales start with `pt`; omitted and other string locales use English. */
export function getPersonalMonthDescription(value: NumerologyValues, language?: string): string | undefined {
  if (language !== undefined && typeof language !== "string") return undefined;
  const entry = getPersonalMonthDescriptionEntry(value);
  return language?.startsWith("pt") ? entry?.pt : entry?.en;
}

/** Themes for a calculated pinnacle value, independently of its position or dates. */
export type PinnacleDescriptionEntry = FibonacciYearDescriptionEntry;

/** Covers 1–9, 11, 22, 33 and 44 without reducing the supplied value. */
export const PINNACLE_DESCRIPTIONS: Readonly<Partial<Record<NumerologyValues, PinnacleDescriptionEntry>>> =
  freezeTextData(Object.fromEntries(
    Object.entries(descriptions.pinnacles satisfies Partial<Record<NumerologyValues,
      Pick<PinnacleDescriptionEntry, "pt" | "en" | "keywords">>>).map(([value, entry]) => [value, {
      ...entry,
      src: [],
      reviewNotes: [],
    }]),
  ) as unknown as Partial<Record<NumerologyValues, PinnacleDescriptionEntry>>);

/** Takes the pinnacle's numerical value, not its ordinal position. Does not reduce numbers. */
export function getPinnacleDescriptionEntry(value: NumerologyValues): PinnacleDescriptionEntry | undefined {
  if (typeof value !== "number" || !Object.prototype.hasOwnProperty.call(PINNACLE_DESCRIPTIONS, value)) {
    return undefined;
  }
  return PINNACLE_DESCRIPTIONS[value];
}

export function getPinnacleDescription(value: NumerologyValues, language?: string): string | undefined {
  if (language !== undefined && typeof language !== "string") return undefined;
  const entry = getPinnacleDescriptionEntry(value);
  return language?.startsWith("pt") ? entry?.pt : entry?.en;
}
