import raw from "./chartPaths.json";
import { freezeTextData } from "../localization";
import { SPHERES } from "../core";
import type { AstrologyTreeChartInput } from "./kaabalistic";
import type { BirthChart } from "../astrology";

const DATA = freezeTextData(raw);

type Localized = Readonly<{ en: string; pt: string }>;
type PathTemplate = Readonly<{ function: Localized; en: string; pt: string }>;

export type ChartPathsInput = BirthChart | AstrologyTreeChartInput;
export type ChartPathSphere = (typeof SPHERES)[keyof typeof SPHERES];

/** Sign adjectives (feminine in pt, agreeing with "busca"), keyed by English sign name. */
export const SIGN_ADJECTIVES: Readonly<Record<string, Localized>> = DATA.signAdjectives;
/** House themes, keyed by house number 1 to 12. */
export const HOUSE_THEMES: Readonly<Record<number, Localized>> = DATA.houseThemes;
/** Sign keywords used by the Lightning Path and the Serpent's Path. */
export const SIGN_KEYWORDS: Readonly<Record<string, Localized>> = DATA.signKeywords;

/** The body that carries each sphere's placement. "Ascendant" is the chart's ascendant angle. */
export const SPHERE_CARRIERS: Readonly<Record<ChartPathSphere, string>> = Object.freeze({
  [SPHERES.KETHER]: "Neptune",
  [SPHERES.CHOKHMAH]: "Uranus",
  [SPHERES.BINAH]: "Saturn",
  [SPHERES.DAATH]: "Pluto",
  [SPHERES.CHESED]: "Jupiter",
  [SPHERES.GEBURAH]: "Mars",
  [SPHERES.TIPHARETH]: "Sun",
  [SPHERES.NETZACH]: "Venus",
  [SPHERES.HOD]: "Mercury",
  [SPHERES.YESOD]: "Moon",
  [SPHERES.MALKUTH]: "Ascendant",
});

/**
 * The sphere(s) each house lights, through the sign that naturally rules the house
 * (house 1 Aries/Mars, house 7 Libra/Sun and Venus, ...). Keyed by house number 1 to 12.
 */
export const HOUSE_SPHERES: Readonly<Record<number, readonly ChartPathSphere[]>> = Object.freeze({
  1: [SPHERES.GEBURAH],
  2: [SPHERES.NETZACH],
  3: [SPHERES.HOD],
  4: [SPHERES.YESOD],
  5: [SPHERES.TIPHARETH],
  6: [SPHERES.MALKUTH],
  7: [SPHERES.TIPHARETH, SPHERES.NETZACH],
  8: [SPHERES.DAATH],
  9: [SPHERES.CHESED],
  10: [SPHERES.BINAH],
  11: [SPHERES.CHOKHMAH],
  12: [SPHERES.KETHER],
});

/** Kether down to Malkuth. */
export const LIGHTNING_PATH_ORDER: readonly ChartPathSphere[] = Object.freeze([
  SPHERES.KETHER, SPHERES.CHOKHMAH, SPHERES.BINAH, SPHERES.DAATH, SPHERES.CHESED, SPHERES.GEBURAH,
  SPHERES.TIPHARETH, SPHERES.NETZACH, SPHERES.HOD, SPHERES.YESOD, SPHERES.MALKUTH,
]);
/** Malkuth up to Kether. */
export const SERPENT_PATH_ORDER: readonly ChartPathSphere[] = Object.freeze([...LIGHTNING_PATH_ORDER].reverse());

export interface HouseQuest {
  house: number;
  sign: string;
  adjective: string;
  theme: string;
  text: string;
}

export interface ChartPathStep {
  /** 1-based position along the path. */
  step: number;
  /** The library's sphere name (SPHERES value, e.g. "Chokhmah"). */
  sphere: ChartPathSphere;
  carrier: string;
  sign: string;
  function: string;
  keywords: string;
  text: string;
}

const isPt = (language?: string) => !!language?.startsWith("pt");
const pick = (row: Localized, language?: string) => (isPt(language) ? row.pt : row.en);

function carrierSign(chart: ChartPathsInput, carrier: string): string | undefined {
  if (carrier === "Ascendant") return chart.houses?.ascendant?.sign || undefined;
  const planets = Array.isArray(chart.planets) ? chart.planets : Object.values(chart.planets ?? {});
  const wanted = carrier.toLowerCase();
  const found = planets.find(p => p.name?.toLowerCase() === wanted);
  return (found?.zodiacPosition?.sign ?? undefined) || undefined;
}

export function buildHouseQuests(chart: ChartPathsInput, language?: string): HouseQuest[] {
  const quests: HouseQuest[] = [];
  const cusps = chart.houses?.houses ?? [];
  for (let house = 1; house <= 12; house++) {
    const sign = cusps[house - 1]?.sign;
    const adjectiveRow = sign ? SIGN_ADJECTIVES[sign] : undefined;
    if (!sign || !adjectiveRow) continue;
    const adjective = pick(adjectiveRow, language);
    const theme = pick(HOUSE_THEMES[house], language);
    const text = pick(DATA.houseQuestTemplate, language).replace("{adjective}", adjective).replace("{theme}", theme);
    quests.push({ house, sign, adjective, theme, text: isPt(language) ? text : text.charAt(0).toUpperCase() + text.slice(1) });
  }
  return quests;
}

function buildPath(
  chart: ChartPathsInput,
  order: readonly ChartPathSphere[],
  templates: Readonly<Record<string, PathTemplate>>,
  language?: string,
): ChartPathStep[] {
  const steps: ChartPathStep[] = [];
  for (const sphere of order) {
    const carrier = SPHERE_CARRIERS[sphere];
    const sign = carrierSign(chart, carrier);
    const keywordRow = sign ? SIGN_KEYWORDS[sign] : undefined;
    if (!sign || !keywordRow) continue;
    const template = templates[sphere];
    const keywords = pick(keywordRow, language);
    steps.push({
      step: steps.length + 1,
      sphere,
      carrier,
      sign,
      function: pick(template.function, language),
      keywords,
      text: (isPt(language) ? template.pt : template.en).replace("{k}", keywords),
    });
  }
  return steps;
}

/** Kether down to Malkuth. Steps whose carrier is missing from the chart are omitted (steps renumber). */
export function buildLightningPath(chart: ChartPathsInput, language?: string): ChartPathStep[] {
  return buildPath(chart, LIGHTNING_PATH_ORDER, DATA.lightningTemplates, language);
}

/** Malkuth up to Kether. Steps whose carrier is missing from the chart are omitted (steps renumber). */
export function buildSerpentPath(chart: ChartPathsInput, language?: string): ChartPathStep[] {
  return buildPath(chart, SERPENT_PATH_ORDER, DATA.serpentTemplates, language);
}
