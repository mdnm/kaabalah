import sky from "./timing-sky-descriptions.json";
import skyRetrogradeSigns from "./timing-sky-retrograde-sign-descriptions.json";
import cycles from "./timing-cycle-descriptions.json";
import techniques from "./timing-technique-descriptions.json";
import firdaria from "./timing-firdaria-descriptions.json";
import firdariaPairs from "./timing-firdaria-pair-descriptions.json";
import jyotish from "./timing-jyotish-descriptions.json";
import nakshatraPadas from "./timing-nakshatra-pada-descriptions.json";
import transitAspects from "./timing-transit-aspect-descriptions.json";
import profectionHouses from "./timing-profection-house-descriptions.json";
import progressedHouses from "./timing-progressed-house-descriptions.json";
import solarReturnAscendantHouses from "./timing-solar-return-ascendant-house-descriptions.json";
import solarReturnMcHouses from "./timing-solar-return-mc-house-descriptions.json";
import solarReturnPlanetHouses from "./timing-solar-return-planet-house-descriptions.json";
import solarReturnAspects from "./timing-solar-return-aspect-descriptions.json";
import solarReturnNatalAspects from "./timing-solar-return-natal-aspect-descriptions.json";
import solarReturnNatalSigns from "./timing-solar-return-natal-sign-descriptions.json";
import solarReturnAphorisms from "./timing-solar-return-aphorism-descriptions.json";
import type { AspectName } from "./aspects";
import type { DescriptionHouseNumber, DescriptionPlanet, DescriptionRetrogradePlanet, PlanetSignDescriptionEntry } from "./descriptions";
import type { Sign } from "./dignity";
import type { MoonPhaseName } from "./moon-phase";
import type { PlanetaryHourRuler } from "./planetary-hours";
import type { Hemisphere, SeasonalPointId } from "./seasons";
import type { FirdariaPlanet } from "./firdaria";
import type { NakshatraId, VimshottariLord } from "./jyotish/nakshatra";

/** Timing and traditional reference prose, separate from natal placement profiles. */
export type TimingDescriptionEntry = PlanetSignDescriptionEntry;
export type TransitPlanetDescriptionEntry = TimingDescriptionEntry;
export type SkyRetrogradePlanetDescriptionEntry = TimingDescriptionEntry;
export type SkyRetrogradeSignDescriptionEntry = TimingDescriptionEntry;
/** Retrograde transiting planet / its current zodiac sign. */
export type SkyRetrogradeSignDescriptionKey = `${DescriptionRetrogradePlanet}/${Sign}`;
export type MoonPhaseDescriptionEntry = TimingDescriptionEntry;
export type DailyMoonSignDescriptionEntry = TimingDescriptionEntry;
export type SignIngressDescriptionEntry = TimingDescriptionEntry;
export type LunationSignDescriptionEntry = TimingDescriptionEntry;
export type SeasonalFestivalDescriptionEntry = TimingDescriptionEntry;
export type DayRulerDescriptionEntry = TimingDescriptionEntry;
export type PlanetaryHourRulerDescriptionEntry = TimingDescriptionEntry;
export type TimingTechniqueDescriptionEntry = TimingDescriptionEntry;
export type ProfectionHouseDescriptionEntry = TimingDescriptionEntry;
export type SolarReturnAscendantHouseDescriptionEntry = TimingDescriptionEntry;
export type SolarReturnMcHouseDescriptionEntry = TimingDescriptionEntry;
export type SolarReturnPlanetHouseDescriptionEntry = TimingDescriptionEntry;
export type SolarReturnAspectDescriptionEntry = TimingDescriptionEntry;
export type SolarReturnNatalAspectDescriptionEntry = TimingDescriptionEntry;
export type SolarReturnNatalSignDescriptionEntry = TimingDescriptionEntry;
export type SolarReturnAphorismDescriptionEntry = TimingDescriptionEntry;
/** Conditional descriptions; selecting an ID does not evaluate its chart conditions. */
export type SolarReturnAphorismId = keyof typeof solarReturnAphorisms.solarReturnAphorisms;
/** Directed annual planet / natal planet whose zodiac sign it occupies, without an orb. */
export type SolarReturnNatalSignDescriptionKey = `${DescriptionPlanet}/${DescriptionPlanet}`;
export type SolarReturnDescriptionPoint = DescriptionPlanet | "ascendant" | "mc";
/** Point identifiers for directed solar-return-to-natal contacts. */
export type SolarReturnNatalDescriptionPoint = SolarReturnDescriptionPoint | "mean node" | "chiron";
/** Directed return point / aspect / natal point; no argument-order normalization. */
export type SolarReturnNatalAspectDescriptionKey = `${SolarReturnNatalDescriptionPoint}/${AspectName}/${SolarReturnNatalDescriptionPoint}`;
/** Unordered within-return pair, stored in Sun-through-Pluto order. */
export type SolarReturnAspectDescriptionKey = `${DescriptionPlanet}/${AspectName}/${DescriptionPlanet}`;
/** Return planet / house in the return chart itself, distinct from natal-house overlays. */
export type SolarReturnPlanetHouseDescriptionKey = `${DescriptionPlanet}/${DescriptionHouseNumber}`;
export type ProgressedHouseDescriptionEntry = TimingDescriptionEntry;
/** Ordered progressed body / natal-house number. Unsupported bodies remain absent. */
export type ProgressedHouseDescriptionKey = `${DescriptionPlanet}/${DescriptionHouseNumber}`;
export type FirdariaPeriodDescriptionEntry = TimingDescriptionEntry;
export type FirdariaPairDescriptionEntry = TimingDescriptionEntry;
type FirdariaPairPlanet = Exclude<FirdariaPlanet, "NorthNode" | "SouthNode">;
/** Ordered major-period lord / sub-period lord. Node combinations are not supported. */
export type FirdariaPairDescriptionKey = `${FirdariaPairPlanet}/${FirdariaPairPlanet}`;
export type NakshatraDescriptionEntry = TimingDescriptionEntry;
export type NakshatraPadaDescriptionEntry = TimingDescriptionEntry;
export type NakshatraPada = 1 | 2 | 3 | 4;
export type NakshatraPadaDescriptionKey = `${NakshatraId}/${NakshatraPada}`;
export type VimshottariDashaDescriptionEntry = TimingDescriptionEntry;
export type TransitAspectDescriptionEntry = TimingDescriptionEntry;
export type TransitAspectDescriptionBody = DescriptionPlanet | "mean node" | "chiron";
export type TransitAspectDescriptionNatalPoint = TransitAspectDescriptionBody | "ascendant" | "mc";
/** Ordered transiting body / aspect / natal point. */
export type TransitAspectDescriptionKey = `${TransitAspectDescriptionBody}/${AspectName}/${TransitAspectDescriptionNatalPoint}`;
export type TimingTechnique =
  | "annual-profection" | "monthly-profection"
  | "solar-return" | "lunar-return" | "jupiter-return" | "saturn-return" | "nodal-return"
  | "firdaria";
export type SeasonalFestivalId = "samhain" | "yule" | "imbolc" | "ostara" | "beltane" | "litha" | "lammas" | "mabon";

type DescriptionBank<Key extends string> = Readonly<Partial<Record<Key, TimingDescriptionEntry>>>;

export interface AstrologyTimingDescriptions {
  readonly solarReturnAphorisms: DescriptionBank<SolarReturnAphorismId>;
  readonly solarReturnNatalSigns: DescriptionBank<SolarReturnNatalSignDescriptionKey>;
  readonly solarReturnAspects: DescriptionBank<SolarReturnAspectDescriptionKey>;
  readonly solarReturnNatalAspects: DescriptionBank<SolarReturnNatalAspectDescriptionKey>;
  readonly solarReturnPlanetHouses: DescriptionBank<SolarReturnPlanetHouseDescriptionKey>;
  readonly solarReturnMcHouses: Readonly<Partial<Record<DescriptionHouseNumber, SolarReturnMcHouseDescriptionEntry>>>;
  readonly solarReturnAscendantHouses: Readonly<Partial<Record<DescriptionHouseNumber, SolarReturnAscendantHouseDescriptionEntry>>>;
  readonly progressedHouses: DescriptionBank<ProgressedHouseDescriptionKey>;
  readonly profectionHouses: Readonly<Partial<Record<DescriptionHouseNumber, ProfectionHouseDescriptionEntry>>>;
  readonly transitAspects: DescriptionBank<TransitAspectDescriptionKey>;
  readonly nakshatras: DescriptionBank<NakshatraId>;
  readonly nakshatraPadas: DescriptionBank<NakshatraPadaDescriptionKey>;
  readonly vimshottariLords: DescriptionBank<VimshottariLord>;
  readonly signIngresses: DescriptionBank<Sign>;
  readonly newMoonSigns: DescriptionBank<Sign>;
  readonly fullMoonSigns: DescriptionBank<Sign>;
  readonly transitPlanets: DescriptionBank<DescriptionPlanet>;
  readonly skyRetrogradePlanets: DescriptionBank<DescriptionRetrogradePlanet>;
  readonly skyRetrogradeSigns: DescriptionBank<SkyRetrogradeSignDescriptionKey>;
  readonly moonPhases: DescriptionBank<MoonPhaseName>;
  readonly dailyMoonSigns: DescriptionBank<Sign>;
  readonly seasonalFestivals: DescriptionBank<SeasonalFestivalId>;
  readonly dayRulers: DescriptionBank<PlanetaryHourRuler>;
  readonly planetaryHourRulers: DescriptionBank<PlanetaryHourRuler>;
  readonly timingTechniques: DescriptionBank<TimingTechnique>;
  readonly firdariaMajorPeriods: DescriptionBank<FirdariaPlanet>;
  readonly firdariaSubPeriods: DescriptionBank<FirdariaPlanet>;
  readonly firdariaRelationships: DescriptionBank<"majorSubPeriod">;
  readonly firdariaPairs: DescriptionBank<FirdariaPairDescriptionKey>;
}

function freeze<T>(value: T): T {
  if (value !== null && typeof value === "object") {
    const entry = value as { pt?: unknown; en?: unknown; keywords?: unknown; src?: unknown; reviewNotes?: unknown };
    if (typeof entry.pt === "string" && typeof entry.en === "string" && entry.keywords && typeof entry.keywords === "object") {
      entry.src = [];
      entry.reviewNotes = [];
    }
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

const { firdariaTechnique, firdariaRelationship, ...firdariaPeriods } = firdaria;

/** Supported combinations only; all entries are immutable. */
export const ASTROLOGY_TIMING_DESCRIPTIONS: AstrologyTimingDescriptions = freeze({
  ...sky,
  ...skyRetrogradeSigns,
  ...cycles,
  ...techniques,
  ...jyotish,
  ...nakshatraPadas,
  ...transitAspects,
  ...profectionHouses,
  ...progressedHouses,
  ...solarReturnAscendantHouses,
  ...solarReturnMcHouses,
  ...solarReturnPlanetHouses,
  ...solarReturnAspects,
  ...solarReturnNatalAspects,
  ...solarReturnNatalSigns,
  ...solarReturnAphorisms,
  ...firdariaPeriods,
  ...firdariaPairs,
  firdariaRelationships: { majorSubPeriod: firdariaRelationship },
  timingTechniques: {
    ...techniques.timingTechniques,
    firdaria: firdariaTechnique,
  },
} as unknown as AstrologyTimingDescriptions);

function own(object: object, key: unknown): key is string {
  return typeof key === "string" && Object.prototype.hasOwnProperty.call(object, key);
}

function lookup(bank: keyof AstrologyTimingDescriptions, key: unknown): TimingDescriptionEntry | undefined {
  if (!own(ASTROLOGY_TIMING_DESCRIPTIONS, bank)) return undefined;
  const entries = ASTROLOGY_TIMING_DESCRIPTIONS[bank];
  return own(entries, key) ? (entries as Readonly<Record<string, TimingDescriptionEntry>>)[key] : undefined;
}

function localized(entry: TimingDescriptionEntry | undefined, language?: string): string | undefined {
  if (language !== undefined && typeof language !== "string") return undefined;
  return language?.startsWith("pt") ? entry?.pt : entry?.en;
}

/** Directional transit themes. Missing triples never fall back to reversed or natal aspects. */
export function getTransitAspectDescriptionEntry(
  transitingBody: TransitAspectDescriptionBody,
  aspect: AspectName,
  natalPoint: TransitAspectDescriptionNatalPoint,
): TransitAspectDescriptionEntry | undefined {
  if (typeof transitingBody !== "string" || typeof aspect !== "string" || typeof natalPoint !== "string") {
    return undefined;
  }
  return lookup("transitAspects", `${transitingBody}/${aspect}/${natalPoint}`);
}

export function getTransitAspectDescription(
  transitingBody: TransitAspectDescriptionBody,
  aspect: AspectName,
  natalPoint: TransitAspectDescriptionNatalPoint,
  language?: string,
): string | undefined {
  return localized(getTransitAspectDescriptionEntry(transitingBody, aspect, natalPoint), language);
}

/** Traditional deity associations and electional nature, without natal or pada-specific claims. */
export function getNakshatraDescriptionEntry(nakshatra: NakshatraId): NakshatraDescriptionEntry | undefined {
  return lookup("nakshatras", nakshatra);
}

export function getNakshatraDescription(nakshatra: NakshatraId, language?: string): string | undefined {
  return localized(getNakshatraDescriptionEntry(nakshatra), language);
}

/** Traditional natal reference themes, not daily events or a navamsha calculation. */
export function getNakshatraPadaDescriptionEntry(
  nakshatra: NakshatraId,
  pada: number,
): NakshatraPadaDescriptionEntry | undefined {
  if (typeof nakshatra !== "string" || !Number.isInteger(pada) || pada < 1 || pada > 4) {
    return undefined;
  }
  return lookup("nakshatraPadas", `${nakshatra}/${pada}`);
}

export function getNakshatraPadaDescription(
  nakshatra: NakshatraId,
  pada: number,
  language?: string,
): string | undefined {
  return localized(getNakshatraPadaDescriptionEntry(nakshatra, pada), language);
}

/** General Vimshottari major-period lord themes; does not interpret a major/sub-lord pair. */
export function getVimshottariDashaDescriptionEntry(lord: VimshottariLord): VimshottariDashaDescriptionEntry | undefined {
  return lookup("vimshottariLords", lord);
}

export function getVimshottariDashaDescription(lord: VimshottariLord, language?: string): string | undefined {
  return localized(getVimshottariDashaDescriptionEntry(lord), language);
}

/** General meaning of a transiting planet; does not infer an aspect or natal target. */
export function getTransitPlanetDescriptionEntry(planet: DescriptionPlanet): TransitPlanetDescriptionEntry | undefined {
  return lookup("transitPlanets", planet);
}

export function getTransitPlanetDescription(planet: DescriptionPlanet, language?: string): string | undefined {
  return localized(getTransitPlanetDescriptionEntry(planet), language);
}

const SOLAR_RETURN_DESCRIPTION_PLANETS: readonly DescriptionPlanet[] = Object.freeze([
  "sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto",
]);
const SOLAR_RETURN_NATAL_DESCRIPTION_POINTS: readonly SolarReturnNatalDescriptionPoint[] = Object.freeze([
  ...SOLAR_RETURN_DESCRIPTION_PLANETS,
  "mean node", "chiron", "ascendant", "mc",
]);

/** Within one return chart, in either planet order; no natal or transit fallback. */
export function getSolarReturnAspectDescriptionEntry(
  aspect: AspectName,
  planetA: DescriptionPlanet,
  planetB: DescriptionPlanet,
): SolarReturnAspectDescriptionEntry | undefined {
  if (typeof aspect !== "string" || typeof planetA !== "string" || typeof planetB !== "string") {
    return undefined;
  }
  const a = SOLAR_RETURN_DESCRIPTION_PLANETS.indexOf(planetA);
  const b = SOLAR_RETURN_DESCRIPTION_PLANETS.indexOf(planetB);
  if (a < 0 || b < 0 || a === b) return undefined;
  const key = a < b ? `${planetA}/${aspect}/${planetB}` : `${planetB}/${aspect}/${planetA}`;
  return lookup("solarReturnAspects", key);
}

export function getSolarReturnAspectDescription(
  aspect: AspectName,
  planetA: DescriptionPlanet,
  planetB: DescriptionPlanet,
  language?: string,
): string | undefined {
  return localized(getSolarReturnAspectDescriptionEntry(aspect, planetA, planetB), language);
}

/** A computed return point contacting a natal point; the two chart roles are directed. */
export function getSolarReturnNatalAspectDescriptionEntry(
  returnPoint: SolarReturnNatalDescriptionPoint,
  aspect: AspectName,
  natalPoint: SolarReturnNatalDescriptionPoint,
): SolarReturnNatalAspectDescriptionEntry | undefined {
  if (typeof returnPoint !== "string" || typeof aspect !== "string" || typeof natalPoint !== "string") {
    return undefined;
  }
  if (
    !SOLAR_RETURN_NATAL_DESCRIPTION_POINTS.includes(returnPoint) ||
    !SOLAR_RETURN_NATAL_DESCRIPTION_POINTS.includes(natalPoint)
  ) {
    return undefined;
  }
  return lookup("solarReturnNatalAspects", `${returnPoint}/${aspect}/${natalPoint}`);
}

export function getSolarReturnNatalAspectDescription(
  returnPoint: SolarReturnNatalDescriptionPoint,
  aspect: AspectName,
  natalPoint: SolarReturnNatalDescriptionPoint,
  language?: string,
): string | undefined {
  return localized(getSolarReturnNatalAspectDescriptionEntry(returnPoint, aspect, natalPoint), language);
}

/** Annual planet in the natal planet's sign; directed, distinct from an exact conjunction. */
export function getSolarReturnNatalSignDescriptionEntry(
  returnPlanet: DescriptionPlanet,
  natalPlanet: DescriptionPlanet,
): SolarReturnNatalSignDescriptionEntry | undefined {
  if (typeof returnPlanet !== "string" || typeof natalPlanet !== "string") return undefined;
  if (!SOLAR_RETURN_DESCRIPTION_PLANETS.includes(returnPlanet) || !SOLAR_RETURN_DESCRIPTION_PLANETS.includes(natalPlanet)) {
    return undefined;
  }
  return lookup("solarReturnNatalSigns", `${returnPlanet}/${natalPlanet}`);
}

export function getSolarReturnNatalSignDescription(
  returnPlanet: DescriptionPlanet,
  natalPlanet: DescriptionPlanet,
  language?: string,
): string | undefined {
  return localized(getSolarReturnNatalSignDescriptionEntry(returnPlanet, natalPlanet), language);
}

/** A conditional description; this lookup does not match or validate the conditions. */
export function getSolarReturnAphorismDescriptionEntry(
  aphorism: SolarReturnAphorismId,
): SolarReturnAphorismDescriptionEntry | undefined {
  return lookup("solarReturnAphorisms", aphorism);
}

export function getSolarReturnAphorismDescription(
  aphorism: SolarReturnAphorismId,
  language?: string,
): string | undefined {
  return localized(getSolarReturnAphorismDescriptionEntry(aphorism), language);
}

/** Placement themes in the solar-return chart's own houses; unsupported combinations stay absent. */
export function getSolarReturnPlanetHouseDescriptionEntry(
  planet: DescriptionPlanet,
  annualHouse: number,
): SolarReturnPlanetHouseDescriptionEntry | undefined {
  if (typeof planet !== "string" || !Number.isInteger(annualHouse) || annualHouse < 1 || annualHouse > 12) {
    return undefined;
  }
  return lookup("solarReturnPlanetHouses", `${planet}/${annualHouse}`);
}

export function getSolarReturnPlanetHouseDescription(
  planet: DescriptionPlanet,
  annualHouse: number,
  language?: string,
): string | undefined {
  return localized(getSolarReturnPlanetHouseDescriptionEntry(planet, annualHouse), language);
}

/** Annual situation themes for the return MC in a computed natal house; unsupported houses stay absent. */
export function getSolarReturnMcHouseDescriptionEntry(natalHouse: number): SolarReturnMcHouseDescriptionEntry | undefined {
  if (!Number.isInteger(natalHouse) || natalHouse < 1 || natalHouse > 12) return undefined;
  return lookup("solarReturnMcHouses", String(natalHouse));
}

export function getSolarReturnMcHouseDescription(natalHouse: number, language?: string): string | undefined {
  return localized(getSolarReturnMcHouseDescriptionEntry(natalHouse), language);
}

/** Annual focus for the solar-return Ascendant in an already computed natal house. */
export function getSolarReturnAscendantHouseDescriptionEntry(
  natalHouse: number,
): SolarReturnAscendantHouseDescriptionEntry | undefined {
  if (!Number.isInteger(natalHouse) || natalHouse < 1 || natalHouse > 12) return undefined;
  return lookup("solarReturnAscendantHouses", String(natalHouse));
}

export function getSolarReturnAscendantHouseDescription(natalHouse: number, language?: string): string | undefined {
  return localized(getSolarReturnAscendantHouseDescriptionEntry(natalHouse), language);
}

/** Secondary-progression themes for a body in an already computed natal house. */
export function getProgressedHouseDescriptionEntry(
  progressedPlanet: DescriptionPlanet,
  natalHouse: number,
): ProgressedHouseDescriptionEntry | undefined {
  if (typeof progressedPlanet !== "string" || !Number.isInteger(natalHouse) || natalHouse < 1 || natalHouse > 12) {
    return undefined;
  }
  return lookup("progressedHouses", `${progressedPlanet}/${natalHouse}`);
}

export function getProgressedHouseDescription(
  progressedPlanet: DescriptionPlanet,
  natalHouse: number,
  language?: string,
): string | undefined {
  return localized(getProgressedHouseDescriptionEntry(progressedPlanet, natalHouse), language);
}

/** Reflective themes for an already computed profected house, without a sign or lord reading. */
export function getProfectionHouseDescriptionEntry(house: number): ProfectionHouseDescriptionEntry | undefined {
  if (!Number.isInteger(house) || house < 1 || house > 12) return undefined;
  return lookup("profectionHouses", String(house));
}

export function getProfectionHouseDescription(house: number, language?: string): string | undefined {
  return localized(getProfectionHouseDescriptionEntry(house), language);
}

/** Technique introductions; these do not interpret a particular chart or period lord. */
export function getTimingTechniqueDescriptionEntry(technique: TimingTechnique): TimingTechniqueDescriptionEntry | undefined {
  return lookup("timingTechniques", technique);
}

export function getTimingTechniqueDescription(technique: TimingTechnique, language?: string): string | undefined {
  return localized(getTimingTechniqueDescriptionEntry(technique), language);
}

/** Major-period lord meanings, keyed by the calculator's planet names. */
export function getFirdariaMajorPeriodDescriptionEntry(planet: FirdariaPlanet): FirdariaPeriodDescriptionEntry | undefined {
  return lookup("firdariaMajorPeriods", planet);
}

export function getFirdariaMajorPeriodDescription(planet: FirdariaPlanet, language?: string): string | undefined {
  return localized(getFirdariaMajorPeriodDescriptionEntry(planet), language);
}

/** Node subperiods have no entry and are not replaced with major-period prose. */
export function getFirdariaSubPeriodDescriptionEntry(planet: FirdariaPlanet): FirdariaPeriodDescriptionEntry | undefined {
  return lookup("firdariaSubPeriods", planet);
}

export function getFirdariaSubPeriodDescription(planet: FirdariaPlanet, language?: string): string | undefined {
  return localized(getFirdariaSubPeriodDescriptionEntry(planet), language);
}

/** Modern directed pair themes; no reversed, role-profile or node fallback. */
export function getFirdariaPairDescriptionEntry(
  majorLord: FirdariaPlanet,
  subLord: FirdariaPlanet,
): FirdariaPairDescriptionEntry | undefined {
  if (typeof majorLord !== "string" || typeof subLord !== "string") return undefined;
  return lookup("firdariaPairs", `${majorLord}/${subLord}`);
}

export function getFirdariaPairDescription(
  majorLord: FirdariaPlanet,
  subLord: FirdariaPlanet,
  language?: string,
): string | undefined {
  return localized(getFirdariaPairDescriptionEntry(majorLord, subLord), language);
}

/** General relation between major and subperiods; this does not compose a lord-pair reading. */
export function getFirdariaRelationshipDescriptionEntry(): TimingDescriptionEntry | undefined {
  return lookup("firdariaRelationships", "majorSubPeriod");
}

export function getFirdariaRelationshipDescription(language?: string): string | undefined {
  return localized(getFirdariaRelationshipDescriptionEntry(), language);
}

/** A sky retrograde description requires an available finite negative longitude speed. */
export function getSkyRetrogradePlanetDescriptionEntry(
  planet: DescriptionRetrogradePlanet,
  longitudeSpeed?: number,
): SkyRetrogradePlanetDescriptionEntry | undefined {
  if (typeof longitudeSpeed !== "number" || !Number.isFinite(longitudeSpeed) || longitudeSpeed >= 0) return undefined;
  return lookup("skyRetrogradePlanets", planet);
}

export function getSkyRetrogradePlanetDescription(
  planet: DescriptionRetrogradePlanet,
  longitudeSpeed?: number,
  language?: string,
): string | undefined {
  return localized(getSkyRetrogradePlanetDescriptionEntry(planet, longitudeSpeed), language);
}

/** The sign belongs to the retrograde planet in the sky; the caller supplies its computed placement. */
export function getSkyRetrogradeSignDescriptionEntry(
  planet: DescriptionRetrogradePlanet,
  sign: Sign,
  longitudeSpeed?: number,
): SkyRetrogradeSignDescriptionEntry | undefined {
  if (typeof planet !== "string" || typeof sign !== "string") return undefined;
  if (typeof longitudeSpeed !== "number" || !Number.isFinite(longitudeSpeed) || longitudeSpeed >= 0) return undefined;
  return lookup("skyRetrogradeSigns", `${planet}/${sign}`);
}

export function getSkyRetrogradeSignDescription(
  planet: DescriptionRetrogradePlanet,
  sign: Sign,
  longitudeSpeed?: number,
  language?: string,
): string | undefined {
  return localized(getSkyRetrogradeSignDescriptionEntry(planet, sign, longitudeSpeed), language);
}

/** Only the supported phases are available; neighboring phases are not substitutes. */
export function getMoonPhaseDescriptionEntry(phase: MoonPhaseName): MoonPhaseDescriptionEntry | undefined {
  return lookup("moonPhases", phase);
}

export function getMoonPhaseDescription(phase: MoonPhaseName, language?: string): string | undefined {
  return localized(getMoonPhaseDescriptionEntry(phase), language);
}

/** Description of today's Moon sign, with no natal-placement fallback. */
export function getDailyMoonSignDescriptionEntry(sign: Sign): DailyMoonSignDescriptionEntry | undefined {
  return lookup("dailyMoonSigns", sign);
}

export function getDailyMoonSignDescription(sign: Sign, language?: string): string | undefined {
  return localized(getDailyMoonSignDescriptionEntry(sign), language);
}

/** Destination-sign themes for an ingress, independent of the entering planet. */
export function getSignIngressDescriptionEntry(sign: Sign): SignIngressDescriptionEntry | undefined {
  return lookup("signIngresses", sign);
}

export function getSignIngressDescription(sign: Sign, language?: string): string | undefined {
  return localized(getSignIngressDescriptionEntry(sign), language);
}

/** The sign is the Moon's sign; at a full Moon the Sun is in the opposite sign. */
export function getLunationSignDescriptionEntry(phase: MoonPhaseName, sign: Sign): LunationSignDescriptionEntry | undefined {
  if (phase === "new") return lookup("newMoonSigns", sign);
  if (phase === "full") return lookup("fullMoonSigns", sign);
  return undefined;
}

export function getLunationSignDescription(phase: MoonPhaseName, sign: Sign, language?: string): string | undefined {
  return localized(getLunationSignDescriptionEntry(phase, sign), language);
}

export function getSeasonalFestivalDescriptionEntry(festival: SeasonalFestivalId): SeasonalFestivalDescriptionEntry | undefined {
  return lookup("seasonalFestivals", festival);
}

export function getSeasonalFestivalDescription(festival: SeasonalFestivalId, language?: string): string | undefined {
  return localized(getSeasonalFestivalDescriptionEntry(festival), language);
}

export function getDayRulerDescriptionEntry(ruler: PlanetaryHourRuler): DayRulerDescriptionEntry | undefined {
  return lookup("dayRulers", ruler);
}

export function getDayRulerDescription(ruler: PlanetaryHourRuler, language?: string): string | undefined {
  return localized(getDayRulerDescriptionEntry(ruler), language);
}

export function getPlanetaryHourRulerDescriptionEntry(ruler: PlanetaryHourRuler): PlanetaryHourRulerDescriptionEntry | undefined {
  return lookup("planetaryHourRulers", ruler);
}

export function getPlanetaryHourRulerDescription(ruler: PlanetaryHourRuler, language?: string): string | undefined {
  return localized(getPlanetaryHourRulerDescriptionEntry(ruler), language);
}

const festivalsByHemisphere: Readonly<Record<Hemisphere, Readonly<Record<SeasonalPointId, SeasonalFestivalId>>>> = freeze({
  north: {
    "march-equinox": "ostara",
    "taurus-midpoint": "beltane",
    "june-solstice": "litha",
    "leo-midpoint": "lammas",
    "september-equinox": "mabon",
    "scorpio-midpoint": "samhain",
    "december-solstice": "yule",
    "aquarius-midpoint": "imbolc",
  },
  south: {
    "march-equinox": "mabon",
    "taurus-midpoint": "samhain",
    "june-solstice": "yule",
    "leo-midpoint": "imbolc",
    "september-equinox": "ostara",
    "scorpio-midpoint": "beltane",
    "december-solstice": "litha",
    "aquarius-midpoint": "lammas",
  },
});

/** Map an already computed solar point to its festival; the hemisphere is required. */
export function getSeasonalPointDescriptionEntry(
  point: SeasonalPointId,
  hemisphere: Hemisphere,
): SeasonalFestivalDescriptionEntry | undefined {
  if (!own(festivalsByHemisphere, hemisphere)) return undefined;
  const festivals = festivalsByHemisphere[hemisphere];
  if (!own(festivals, point)) return undefined;
  return getSeasonalFestivalDescriptionEntry(festivals[point]);
}

export function getSeasonalPointDescription(
  point: SeasonalPointId,
  hemisphere: Hemisphere,
  language?: string,
): string | undefined {
  return localized(getSeasonalPointDescriptionEntry(point, hemisphere), language);
}
