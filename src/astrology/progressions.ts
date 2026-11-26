/**
 * Secondary progressions, solar-arc directions and a chart-at-Julian-Day builder.
 *
 * Synchronous; require an initialised Swiss Ephemeris. All instants are UTC; the
 * time coordinate is the UT Julian Day, passed to the ephemeris WITHOUT
 * millisecond loss (unlike `getJulianDay(date)`).
 *
 * Conventions (every one is echoed in the result `method`):
 *
 * - Secondary progression ("a day for a year"): progressed JD = natal JD + age,
 *   age = (target JD - natal JD) / year length, in "years". The year length is
 *   explicit: `"julian"` 365.25 d (default, the family reference),
 *   `"tropical"` 365.2422 d, a number of days, or `"solar-return"` (actual
 *   years: completed solar returns + the fraction through the current
 *   return-to-return interval).
 * - Progressed angles are NOT a single convention. All of these are returned:
 *   `quotidian` (houses/angles computed at the progressed JD for the natal
 *   place; the family reference convention; the progressed chart's `houses`),
 *   `solar-arc` (natal angles + the true solar arc) and `naibod` (natal RAMC +
 *   0.985647 deg per year of age; MC/ASC derived with the natal-date true
 *   obliquity and the natal latitude, angles only, no cusps).
 * - Solar arc (true): arc = progressed Sun - natal Sun, forward-normalised to
 *   [0, 360), added to every target. Targets are explicit (`targetSet`). A
 *   Naibod mean arc (0.985647 deg/yr x age) is an option.
 *
 * Passing derived charts to aspect functions: `result.points` (and
 * `derivedChartAspectPoints` for any chart) is a `Record<string, {longitude,
 * longitudeSpeed?}>`, accepted directly by `computeAspects`,
 * `computeSynastryAspects(natalPoints, progressed.points)` and
 * `computeTransitAspects`.
 */

import { julianDayToDate } from "./jyotish/dasha";
import { calculateLahiriAyanamsa } from "./jyotish/lahiri";
import {
  calcParsFortunae,
  calculateBodyAtJulianDay,
  calculateHousesAtJulianDay,
  CalcFlag,
  HouseSystem,
  normalizeAngle,
  Planet,
  PLANET_AND_NODE_NAMES,
  SWISS_ECL_NUT,
  VirtualNodes,
} from "./swisseph";
import type { PlanetPosition } from "./swisseph";
import {
  getZodiacPosition,
  planHouseSystemFallback,
  type HouseSystemFallback,
  type HouseSystemSubstitution,
  type BirthChart,
  type ComputedBirthChart,
  type ComputedBirthChartWithLahiri,
  type HydratedNode,
  type HydratedPlanet,
  type ZodiacPosition,
} from "./index";
import { computeAspects, DEFAULT_ASPECT_SPECS, type AspectName, type TransitAspectPoint } from "./aspects";
import { computeLots } from "./lots";
import { computeMoonPhase } from "./moon-phase";
import { computeSect } from "./sect";
import { dateToJd } from "./root-solver";
import { findSolarReturns, ROOT_SOLVER_METHOD, type RootSolverMethodMetadata } from "./returns";
import { findTransitPerfections } from "./transit-events";

const MS_PER_DAY = 86_400_000;
const UNIX_EPOCH_JD = 2440587.5;
const EPH_FLAGS = CalcFlag.SWISS_EPH | CalcFlag.SPEED;

export const JULIAN_YEAR_DAYS = 365.25;
export const TROPICAL_YEAR_DAYS = 365.2422;
/** Naibod rate: 59'08.33" of arc per year (mean solar motion), in degrees. */
export const NAIBOD_RATE_DEGREES_PER_YEAR = 59 / 60 + 8.33 / 3600;
/** Hard cap on the age (years) accepted by the progression functions. */
export const MAX_PROGRESSION_AGE_YEARS = 200;

export type DerivedChartErrorCode =
  | "INVALID_INPUT"
  | "TARGET_BEFORE_BIRTH"
  | "AGE_LIMIT_EXCEEDED"
  | "SOLAR_RETURN_NOT_FOUND"
  | "ANGLE_UNAVAILABLE";

/** Typed error of the derived-chart functions (Davison, progressions). */
export class DerivedChartError extends Error {
  readonly code: DerivedChartErrorCode;
  constructor(code: DerivedChartErrorCode, message: string) {
    super(message);
    this.name = "DerivedChartError";
    this.code = code;
  }
}


// ── Chart at an explicit Julian Day ────────────────────────────────────────

export interface ChartAtJulianDayOptions {
  /** UT Julian Day (full sub-second precision is kept). */
  julianDayUt: number;
  latitude: number;
  longitude: number;
  houseSystem?: HouseSystem;
  /** Opt-in recorded substitute when the house system is unavailable at this latitude (see `BirthChartOptions`). */
  houseSystemFallback?: HouseSystemFallback;
}

const CHART_BODY_IDS: Planet[] = [
  Planet.SUN,
  Planet.MOON,
  Planet.MERCURY,
  Planet.VENUS,
  Planet.MARS,
  Planet.JUPITER,
  Planet.SATURN,
  Planet.URANUS,
  Planet.NEPTUNE,
  Planet.PLUTO,
  Planet.MEAN_NODE,
  Planet.TRUE_NODE,
  Planet.LILITH_MEAN,
  Planet.LILITH_TRUE,
  Planet.CHIRON,
];

/**
 * Full chart (same shape and fields as `getBirthChart`) cast for an exact UT Julian
 * Day and place, with no time-zone handling and no millisecond truncation. At a
 * whole-second instant it equals `getBirthChart({ date, timeZoneSettings: { treatAsUTC: true } })`.
 * `dateUtc` is the Julian Day rounded to the millisecond.
 */
export function getChartAtJulianDay(options: ChartAtJulianDayOptions): ComputedBirthChartWithLahiri {
  const { julianDayUt: jd, latitude, longitude } = options;
  if (![jd, latitude, longitude].every(Number.isFinite)) {
    throw new DerivedChartError("INVALID_INPUT", "julianDayUt, latitude and longitude must be finite numbers");
  }
  const requestedHouseSystem = options.houseSystem || HouseSystem.PLACIDUS;
  let houseSystem = requestedHouseSystem;
  let houseSystemSubstitution: HouseSystemSubstitution | undefined;
  const dateUtc = julianDayToDate(jd);

  let housesPositions;
  try {
    housesPositions = calculateHousesAtJulianDay(jd, latitude, longitude, requestedHouseSystem);
  } catch (error) {
    houseSystemSubstitution = planHouseSystemFallback(requestedHouseSystem, options.houseSystemFallback, latitude, error);
    if (!houseSystemSubstitution) throw error;
    houseSystem = houseSystemSubstitution.used;
    housesPositions = calculateHousesAtJulianDay(jd, latitude, longitude, houseSystem);
  }
  const houseCusps = housesPositions.houses.slice(1, 13).map(normalizeAngle);

  const planets: Record<string, HydratedPlanet> = {};
  for (const id of [...CHART_BODY_IDS].sort((a, b) => a - b)) {
    const position: PlanetPosition = calculateBodyAtJulianDay(jd, id, EPH_FLAGS);
    const hydrated: HydratedPlanet = {
      ...position,
      id,
      name: PLANET_AND_NODE_NAMES[id],
      zodiacPosition: getZodiacPosition(position.longitude, houseCusps),
    };
    planets[hydrated.name.toLocaleLowerCase()] = hydrated;
  }

  const houseCuspsPositions = houseCusps.map((lon) => getZodiacPosition(lon, houseCusps));
  const descendant = normalizeAngle(housesPositions.ascendant + 180);
  const imumCoeli = normalizeAngle(housesPositions.mc + 180);
  const asc = getZodiacPosition(housesPositions.ascendant, houseCusps);
  const mc = getZodiacPosition(housesPositions.mc, houseCusps);
  const ascmc = housesPositions.ascmc;
  const houses: BirthChart["houses"] = {
    ascendant: asc,
    mc,
    dc: getZodiacPosition(descendant, houseCusps),
    ic: getZodiacPosition(imumCoeli, houseCusps),
    houses: houseCuspsPositions,
    ascmc: {
      armc: ascmc ? getZodiacPosition(ascmc.armc, houseCusps) : undefined,
      vertex: ascmc ? getZodiacPosition(ascmc.vertex, houseCusps) : undefined,
      equasc: ascmc ? getZodiacPosition(ascmc.equasc, houseCusps) : undefined,
      coasc1: ascmc ? getZodiacPosition(ascmc.coasc1, houseCusps) : undefined,
      coasc2: ascmc ? getZodiacPosition(ascmc.coasc2, houseCusps) : undefined,
      polasc: ascmc ? getZodiacPosition(ascmc.polasc, houseCusps) : undefined,
    },
  };

  const sectDetails = computeSect(dateUtc, latitude, longitude, planets.sun);
  const sect = sectDetails.sect;
  const lotsResult = computeLots(asc.longitude, planets.sun.longitude, planets.moon.longitude, sect);
  const lots = {
    ...lotsResult,
    fortunePosition: getZodiacPosition(lotsResult.fortune, houseCusps),
    spiritPosition: getZodiacPosition(lotsResult.spirit, houseCusps),
  };
  const moonPhase = computeMoonPhase(planets.sun.longitude, planets.moon.longitude);
  const wheelOfFortune = getZodiacPosition(
    calcParsFortunae(asc.longitude, planets.sun.longitude, planets.moon.longitude, sect === "diurnal"),
    houseCusps
  );
  const nodes: Record<string, HydratedNode> = {
    [VirtualNodes.PARS_FORTUNAE]: {
      ...wheelOfFortune,
      id: VirtualNodes.PARS_FORTUNAE,
      name: PLANET_AND_NODE_NAMES[VirtualNodes.PARS_FORTUNAE],
    },
  };
  const aspects = computeAspects({
    ...planets,
    ascendant: { longitude: asc.longitude },
    mc: { longitude: mc.longitude },
  });

  return {
    dateUtc,
    houseSystem,
    ...(houseSystemSubstitution ? { houseSystemSubstitution } : {}),
    planets,
    houses,
    nodes,
    aspects,
    sect,
    sectDetails,
    lahiriAyanamsa: calculateLahiriAyanamsa(jd),
    lots,
    moonPhase,
  };
}

// ── Time key ───────────────────────────────────────────────────────────────

export type YearLengthSpec = number | "julian" | "tropical" | "solar-return";

export interface ProgressionTimeKey {
  /** What the progressed JD is: natal JD + `ageYears` (one ephemeris day per year of life). */
  rule: "progressed JD = natal JD + age in years (a day for a year)";
  yearLength: { spec: string; days: number | null };
  natalJd: number;
  targetJd: number;
  ageYears: number;
  progressedJd: number;
}

/** Natal instant (return 0) and every solar return through `throughJd` + 400 days, as UT Julian Days in time order. */
function solarReturnInstants(natalJd: number, throughJd: number, natalSunLongitude: number): number[] {
  const from = julianDayToDate(natalJd + 10);
  const to = julianDayToDate(throughJd + 400);
  const found = findSolarReturns({ natalLongitude: natalSunLongitude, from, to });
  return [natalJd, ...found.crossings.map((c) => c.jd)].sort((a, b) => a - b);
}

function resolveTimeKey(
  natalJd: number,
  targetJd: number,
  yearLength: YearLengthSpec | undefined,
  natalSunLongitude: number
): ProgressionTimeKey {
  if (!Number.isFinite(natalJd) || !Number.isFinite(targetJd)) {
    throw new DerivedChartError("INVALID_INPUT", "natal and target instants must be valid dates");
  }
  if (targetJd < natalJd) {
    throw new DerivedChartError("TARGET_BEFORE_BIRTH", "target is before the natal instant");
  }
  const spec = yearLength ?? "julian";
  let ageYears: number;
  let days: number | null;
  let specLabel: string;
  if (spec === "solar-return") {
    specLabel = "solar-return (actual years: completed solar returns + fraction of the current interval)";
    days = null;
    const instants = solarReturnInstants(natalJd, targetJd, natalSunLongitude);
    let k = -1;
    for (let i = 0; i + 1 < instants.length; i++) {
      if (targetJd >= instants[i] && targetJd < instants[i + 1]) {
        k = i;
        break;
      }
    }
    if (k < 0) {
      throw new DerivedChartError(
        "SOLAR_RETURN_NOT_FOUND",
        "could not bracket the target between two solar returns"
      );
    }
    ageYears = k + (targetJd - instants[k]) / (instants[k + 1] - instants[k]);
  } else {
    if (spec === "julian") {
      days = JULIAN_YEAR_DAYS;
      specLabel = "julian (365.25 days)";
    } else if (spec === "tropical") {
      days = TROPICAL_YEAR_DAYS;
      specLabel = "tropical (365.2422 days)";
    } else if (typeof spec === "number" && Number.isFinite(spec) && spec > 0) {
      days = spec;
      specLabel = `custom (${spec} days)`;
    } else {
      throw new DerivedChartError("INVALID_INPUT", "yearLength must be a positive number, 'julian', 'tropical' or 'solar-return'");
    }
    ageYears = (targetJd - natalJd) / days;
  }
  if (ageYears > MAX_PROGRESSION_AGE_YEARS) {
    throw new DerivedChartError("AGE_LIMIT_EXCEEDED", `age ${ageYears.toFixed(1)} exceeds ${MAX_PROGRESSION_AGE_YEARS} years`);
  }
  return {
    rule: "progressed JD = natal JD + age in years (a day for a year)",
    yearLength: { spec: specLabel, days },
    natalJd,
    targetJd,
    ageYears,
    progressedJd: natalJd + ageYears,
  };
}

// ── Shared inputs ──────────────────────────────────────────────────────────

export interface ProgressionOptions {
  /** Natal chart (from `getBirthChart`); only its planets, angles, house system and `dateUtc` are used. */
  natalChart: BirthChart;
  /** Natal place: a `BirthChart` does not store it, and quotidian/Naibod angles need it. */
  natalLatitude: number;
  natalLongitude: number;
  /** Absolute UTC instant the progression is computed for. */
  target: Date;
  /** Year-length convention of the time key (default "julian" = 365.25 days, the reference). */
  yearLength?: YearLengthSpec;
  /** House system of the quotidian progressed chart (default: the natal chart's recorded system, else Placidus). */
  houseSystem?: HouseSystem;
}

function pointsOf(
  planets: Record<string, { longitude: number; longitudeSpeed?: number }>,
  angles: { ascendant: number; mc: number; descendant: number; ic: number }
): Record<string, TransitAspectPoint> {
  const out: Record<string, TransitAspectPoint> = {};
  for (const [k, p] of Object.entries(planets)) out[k] = { longitude: p.longitude, longitudeSpeed: p.longitudeSpeed };
  out.ascendant = { longitude: angles.ascendant };
  out.mc = { longitude: angles.mc };
  out.descendant = { longitude: angles.descendant };
  out.ic = { longitude: angles.ic };
  return out;
}

export interface ProgressedAngles {
  convention: ProgressedAngleConvention;
  ascendant: number;
  mc: number;
  descendant: number;
  ic: number;
  /** 12 cusps when the convention provides them (quotidian, solar-arc); undefined for naibod. */
  cusps?: number[];
}

export type ProgressedAngleConvention = "quotidian" | "solar-arc" | "naibod";

export const PROGRESSED_ANGLE_CONVENTIONS: ProgressedAngleConvention[] = ["quotidian", "solar-arc", "naibod"];

function trueObliquity(jd: number): number {
  return calculateBodyAtJulianDay(jd, SWISS_ECL_NUT, EPH_FLAGS).longitude;
}

const RAD = Math.PI / 180;

/** Ecliptic MC and ASC from the right ascension of the MC (ARMC), obliquity and latitude (degrees). */
export function anglesFromArmc(
  armc: number,
  obliquity: number,
  latitude: number
): { mc: number; ascendant: number } {
  const th = armc * RAD;
  const eps = obliquity * RAD;
  const mc = normalizeAngle(Math.atan2(Math.sin(th), Math.cos(th) * Math.cos(eps)) / RAD);
  const ascendant = normalizeAngle(
    Math.atan2(Math.cos(th), -(Math.sin(th) * Math.cos(eps) + Math.tan(latitude * RAD) * Math.sin(eps))) / RAD
  );
  return { mc, ascendant };
}

export interface ProgressionMethodBase {
  timeKey: ProgressionTimeKey;
  ephemeris: "Swiss Ephemeris (SWISS_EPH, SPEED), UT Julian Day without millisecond truncation";
}

// ── Secondary progressions ─────────────────────────────────────────────────

export interface SecondaryProgressionOptions extends ProgressionOptions {
  /** Which progressed-angle conventions to compute (default: all three). */
  angleConventions?: ProgressedAngleConvention[];
}

export interface SecondaryProgressionMethod extends ProgressionMethodBase {
  technique: "secondary progression";
  /** The convention behind `chart.houses` (always quotidian). */
  chartHousesConvention: "quotidian";
  angleConventions: ProgressedAngleConvention[];
  angleConventionNotes: Record<ProgressedAngleConvention, string>;
  /** Progressed longitude speeds are degrees per EPHEMERIS day (i.e. per progressed year of life). */
  speedUnits: "degrees per ephemeris day";
  targetSet: "all bodies of the progressed chart + angles";
}

export interface SecondaryProgressionResult {
  /** Progressed planets at `progressedJd`; houses/angles follow the quotidian convention. */
  chart: ComputedBirthChart;
  /** Progressed bodies + angles (quotidian) ready for the aspect functions. */
  points: Record<string, TransitAspectPoint>;
  /** Angles under each requested convention. */
  angles: Partial<Record<ProgressedAngleConvention, ProgressedAngles>>;
  /** Progressed Sun minus natal Sun, forward-normalised to [0, 360). */
  solarArcDegrees: number;
  natalSunLongitude: number;
  progressedJd: number;
  ageYears: number;
  method: SecondaryProgressionMethod;
}

const ANGLE_NOTES: Record<ProgressedAngleConvention, string> = {
  quotidian: "houses and angles computed at the progressed JD for the natal place (reference convention)",
  "solar-arc": "natal angles and cusps advanced by the true solar arc (progressed Sun - natal Sun)",
  naibod:
    "natal ARMC advanced by 0.985647 degrees per year of age; MC/ASC from the natal-date true obliquity and natal latitude; angles only",
};

function natalAnglesOf(chart: BirthChart): { ascendant: number; mc: number } {
  return { ascendant: chart.houses.ascendant.longitude, mc: chart.houses.mc.longitude };
}

/** Secondary progressions ("a day for a year") with a declared time key and angle conventions. */
export function getSecondaryProgressions(
  options: SecondaryProgressionOptions,
): SecondaryProgressionResult & { chart: ComputedBirthChartWithLahiri } {
  const { natalChart } = options;
  const natalJd = dateToJd(natalChart.dateUtc);
  const targetJd = dateToJd(options.target);
  const natalSun = natalChart.planets.sun?.longitude;
  if (natalSun === undefined) throw new DerivedChartError("INVALID_INPUT", "natal chart has no Sun");
  const timeKey = resolveTimeKey(natalJd, targetJd, options.yearLength, natalSun);
  const houseSystem = options.houseSystem ?? natalChart.houseSystem ?? HouseSystem.PLACIDUS;

  const chart = getChartAtJulianDay({
    julianDayUt: timeKey.progressedJd,
    latitude: options.natalLatitude,
    longitude: options.natalLongitude,
    houseSystem,
  });
  const solarArc = normalizeAngle(chart.planets.sun.longitude - natalSun);
  const conventions = options.angleConventions ?? PROGRESSED_ANGLE_CONVENTIONS;
  const natalAngles = natalAnglesOf(natalChart);
  const natalCusps = natalChart.houses.houses.map((h) => h.longitude);

  const angles: Partial<Record<ProgressedAngleConvention, ProgressedAngles>> = {};
  for (const conv of conventions) {
    if (conv === "quotidian") {
      const asc = chart.houses.ascendant.longitude;
      const mc = chart.houses.mc.longitude;
      angles.quotidian = {
        convention: conv,
        ascendant: asc,
        mc,
        descendant: normalizeAngle(asc + 180),
        ic: normalizeAngle(mc + 180),
        cusps: chart.houses.houses.map((h) => h.longitude),
      };
    } else if (conv === "solar-arc") {
      const asc = normalizeAngle(natalAngles.ascendant + solarArc);
      const mc = normalizeAngle(natalAngles.mc + solarArc);
      angles["solar-arc"] = {
        convention: conv,
        ascendant: asc,
        mc,
        descendant: normalizeAngle(asc + 180),
        ic: normalizeAngle(mc + 180),
        cusps: natalCusps.map((c) => normalizeAngle(c + solarArc)),
      };
    } else if (conv === "naibod") {
      const armc = natalChart.houses.ascmc?.armc?.longitude;
      if (armc === undefined) {
        throw new DerivedChartError("ANGLE_UNAVAILABLE", "naibod angles need the natal ARMC (houses.ascmc.armc)");
      }
      const progressedArmc = normalizeAngle(armc + NAIBOD_RATE_DEGREES_PER_YEAR * timeKey.ageYears);
      const { mc, ascendant } = anglesFromArmc(progressedArmc, trueObliquity(natalJd), options.natalLatitude);
      angles.naibod = {
        convention: conv,
        ascendant,
        mc,
        descendant: normalizeAngle(ascendant + 180),
        ic: normalizeAngle(mc + 180),
      };
    }
  }

  const q = angles.quotidian ?? {
    ascendant: chart.houses.ascendant.longitude,
    mc: chart.houses.mc.longitude,
    descendant: chart.houses.dc.longitude,
    ic: chart.houses.ic.longitude,
  };
  return {
    chart,
    points: pointsOf(chart.planets, q),
    angles,
    solarArcDegrees: solarArc,
    natalSunLongitude: natalSun,
    progressedJd: timeKey.progressedJd,
    ageYears: timeKey.ageYears,
    method: {
      technique: "secondary progression",
      timeKey,
      ephemeris: "Swiss Ephemeris (SWISS_EPH, SPEED), UT Julian Day without millisecond truncation",
      chartHousesConvention: "quotidian",
      angleConventions: conventions,
      angleConventionNotes: ANGLE_NOTES,
      speedUnits: "degrees per ephemeris day",
      targetSet: "all bodies of the progressed chart + angles",
    },
  };
}

// ── Solar-arc directions ───────────────────────────────────────────────────

export interface SolarArcOptions extends ProgressionOptions {
  /** "true" = progressed Sun - natal Sun (default); "naibod" = 0.985647 deg x age. */
  arcKind?: "true" | "naibod";
  /**
   * Natal points to direct, by key: planet keys as in `chart.planets` plus
   * `ascendant`, `mc`, `descendant`, `ic`. Default: every planet/body plus the four angles.
   */
  targets?: string[];
}

export interface DirectedPoint {
  name: string;
  natalLongitude: number;
  longitude: number;
  zodiacPosition: ZodiacPosition;
}

export interface SolarArcMethod extends ProgressionMethodBase {
  technique: "solar arc directions";
  arcKind: "true" | "naibod";
  arcRule: string;
  /** The exact target keys that were directed. */
  targetSet: string[];
  houses: "natal cusps advanced by the same arc";
}

export interface SolarArcResult {
  arcDegrees: number;
  directed: Record<string, DirectedPoint>;
  directedCusps: number[];
  /** Directed points ready for the aspect functions. */
  points: Record<string, TransitAspectPoint>;
  progressedSunLongitude: number | null;
  method: SolarArcMethod;
}

const ANGLE_KEYS = ["ascendant", "mc", "descendant", "ic"] as const;

/** Solar-arc directions: one arc added uniformly to an explicit set of natal points. */
export function getSolarArcDirections(options: SolarArcOptions): SolarArcResult {
  const { natalChart } = options;
  const natalJd = dateToJd(natalChart.dateUtc);
  const targetJd = dateToJd(options.target);
  const natalSun = natalChart.planets.sun?.longitude;
  if (natalSun === undefined) throw new DerivedChartError("INVALID_INPUT", "natal chart has no Sun");
  const timeKey = resolveTimeKey(natalJd, targetJd, options.yearLength, natalSun);
  const arcKind = options.arcKind ?? "true";

  let arc: number;
  let progressedSun: number | null = null;
  if (arcKind === "naibod") {
    arc = normalizeAngle(NAIBOD_RATE_DEGREES_PER_YEAR * timeKey.ageYears);
  } else {
    progressedSun = calculateBodyAtJulianDay(timeKey.progressedJd, Planet.SUN, EPH_FLAGS).longitude;
    arc = normalizeAngle(progressedSun - natalSun);
  }

  const natalPoints: Record<string, number> = {};
  for (const [k, p] of Object.entries(natalChart.planets)) natalPoints[k] = p.longitude;
  natalPoints.ascendant = natalChart.houses.ascendant.longitude;
  natalPoints.mc = natalChart.houses.mc.longitude;
  natalPoints.descendant = natalChart.houses.dc.longitude;
  natalPoints.ic = natalChart.houses.ic.longitude;

  const targetSet = options.targets
    ? options.targets.map((t) => t.toLowerCase())
    : [...Object.keys(natalChart.planets), ...ANGLE_KEYS];
  for (const t of targetSet) {
    if (!(t in natalPoints)) throw new DerivedChartError("INVALID_INPUT", `unknown target point "${t}"`);
  }

  const directedCusps = natalChart.houses.houses.map((h) => normalizeAngle(h.longitude + arc));
  const directed: Record<string, DirectedPoint> = {};
  const points: Record<string, TransitAspectPoint> = {};
  for (const t of targetSet) {
    const lon = normalizeAngle(natalPoints[t] + arc);
    directed[t] = {
      name: t,
      natalLongitude: natalPoints[t],
      longitude: lon,
      zodiacPosition: getZodiacPosition(lon, directedCusps),
    };
    points[t] = { longitude: lon };
  }

  return {
    arcDegrees: arc,
    directed,
    directedCusps,
    points,
    progressedSunLongitude: progressedSun,
    method: {
      technique: "solar arc directions",
      timeKey,
      ephemeris: "Swiss Ephemeris (SWISS_EPH, SPEED), UT Julian Day without millisecond truncation",
      arcKind,
      arcRule:
        arcKind === "true"
          ? "arc = progressed Sun - natal Sun (forward-normalised to [0,360)), added to every target; directed speeds are undefined"
          : "arc = 0.985647 deg per year x age, added to every target; directed speeds are undefined",
      targetSet,
      houses: "natal cusps advanced by the same arc",
    },
  };
}

// ── Progressed perfections ─────────────────────────────────────────────────

/** Progressed bodies searched by default (lowercase keys as in `chart.planets`). */
export const DEFAULT_PROGRESSED_PERFECTION_BODIES: readonly string[] = Object.freeze([
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
]);

/** Natal points searched by default: the ten planets, the mean node, Chiron, the Ascendant and the MC. */
export const DEFAULT_PROGRESSED_PERFECTION_NATAL_POINTS: readonly string[] = Object.freeze([
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
  "mean node",
  "chiron",
  "ascendant",
  "mc",
]);

/** Aspects searched by default: the five major ones. */
export const DEFAULT_PROGRESSED_PERFECTION_ASPECTS: readonly AspectName[] = Object.freeze([
  "conjunction",
  "sextile",
  "square",
  "trine",
  "opposition",
] as const);

/** Largest scan step of the progressed bodies, in ephemeris days (about three months of life). */
export const MAX_PROGRESSED_SCAN_STEP_DAYS = 0.25;

/** Scan steps the progressed window is divided into when it is shorter than that. */
const PROGRESSED_SCAN_STEPS_PER_WINDOW = 8;

export interface FindProgressedPerfectionsOptions {
  /** Natal chart (from `getBirthChart`); only its planets, Ascendant, MC and `dateUtc` are used. */
  natalChart: BirthChart;
  /** Window of real-life dates (inclusive). Absolute UTC instants. */
  from: Date;
  to: Date;
  /** Year-length convention of the time key (default "julian" = 365.25 days), as in `getSecondaryProgressions`. */
  yearLength?: YearLengthSpec;
  /** Progressed bodies to move, lowercase keys as in `chart.planets` (default: sun, moon, mercury, venus, mars). */
  progressedBodies?: string[];
  /** Fixed natal points, keys as in `chart.planets` plus `ascendant` and `mc` (default: `DEFAULT_PROGRESSED_PERFECTION_NATAL_POINTS`). */
  natalPoints?: string[];
  /** Aspects to search (default: conjunction, sextile, square, trine, opposition). */
  aspects?: AspectName[];
  /** Final bracket width in seconds of ephemeris time (default 0.001, under half a second of life). */
  timeToleranceSeconds?: number;
  /** Max accepted residual in degrees (default 1e-6). */
  residualToleranceDegrees?: number;
}

export interface ProgressedPerfection {
  progressedBody: string;
  natalPoint: string;
  aspect: AspectName;
  /** Real-life instant (UTC) at which the progressed body is exactly in aspect. */
  exactDate: Date;
  /** Ephemeris instant of the exact aspect: the progressed Julian Day (UT). */
  progressedJd: number;
  /** The progressed body moving backwards at that instant. */
  retrograde: boolean;
}

export interface ProgressedPerfectionsMethod {
  technique: "secondary progression";
  /** The same time key as `getSecondaryProgressions`, run forward for the window and backward for each exact instant. */
  timeKey: {
    rule: ProgressionTimeKey["rule"];
    inverse: "real instant = natal JD + (progressed JD - natal JD) x year length; with solar-return years, the same fraction of the return to return interval";
    yearLength: ProgressionTimeKey["yearLength"];
    natalJd: number;
    fromProgressedJd: number;
    toProgressedJd: number;
  };
  targets: "fixed natal longitudes";
  angles: "progressed angles are not searched";
  /** Scan step of the progressed bodies, in ephemeris days. */
  scanStepDays: number;
  ephemeris: ProgressionMethodBase["ephemeris"];
  solver: RootSolverMethodMetadata;
}

export interface ProgressedPerfectionsResult {
  from: Date;
  to: Date;
  progressedBodies: string[];
  natalPoints: string[];
  aspects: AspectName[];
  /** Every exact aspect inside the window, by `exactDate`. */
  perfections: ProgressedPerfection[];
  method: ProgressedPerfectionsMethod;
}

function lowercaseList(values: readonly string[], name: string): string[] {
  if (!Array.isArray(values) || values.some((v) => typeof v !== "string")) {
    throw new DerivedChartError("INVALID_INPUT", `\`${name}\` must be an array of strings`);
  }
  return [...new Set(values.map((v) => v.toLowerCase()))];
}

/**
 * The real-life instants at which a secondary-progressed body is exactly in aspect
 * to a fixed natal point, inside [from, to].
 *
 * The window is mapped to progressed Julian Days with the time key of
 * `getSecondaryProgressions`, the aspects are solved there by
 * `findTransitPerfections` (natal longitudes as fixed targets), and each exact
 * progressed Julian Day is mapped back to a real instant. Bodies only: the
 * progressed angles are not searched.
 */
export function findProgressedPerfections(options: FindProgressedPerfectionsOptions): ProgressedPerfectionsResult {
  const { natalChart, from, to } = options;
  for (const [name, value] of [["from", from], ["to", to]] as const) {
    if (!(value instanceof Date) || !Number.isFinite(value.getTime())) {
      throw new DerivedChartError("INVALID_INPUT", `a valid \`${name}\` date is required`);
    }
  }
  if (to.getTime() < from.getTime()) throw new DerivedChartError("INVALID_INPUT", "`to` must not be before `from`");
  const natalSun = natalChart.planets.sun?.longitude;
  if (natalSun === undefined) throw new DerivedChartError("INVALID_INPUT", "natal chart has no Sun");

  const progressedBodies = lowercaseList(options.progressedBodies ?? DEFAULT_PROGRESSED_PERFECTION_BODIES, "progressedBodies");
  const knownBodies = new Set(
    Object.entries(PLANET_AND_NODE_NAMES)
      .filter(([id]) => !Number.isNaN(Number(id)))
      .map(([, name]) => name.toLowerCase())
  );
  for (const body of progressedBodies) {
    if (!knownBodies.has(body)) throw new DerivedChartError("INVALID_INPUT", `unknown progressed body "${body}"`);
  }

  const natalLongitudes: Record<string, number> = {};
  for (const [key, planet] of Object.entries(natalChart.planets)) natalLongitudes[key] = planet.longitude;
  natalLongitudes.ascendant = natalChart.houses.ascendant.longitude;
  natalLongitudes.mc = natalChart.houses.mc.longitude;
  const natalPointKeys = lowercaseList(options.natalPoints ?? DEFAULT_PROGRESSED_PERFECTION_NATAL_POINTS, "natalPoints");
  const natalPoints: Record<string, { longitude: number }> = {};
  for (const key of natalPointKeys) {
    if (!(key in natalLongitudes)) throw new DerivedChartError("INVALID_INPUT", `unknown natal point "${key}"`);
    natalPoints[key] = { longitude: natalLongitudes[key] };
  }

  const aspects = [...new Set(options.aspects ?? DEFAULT_PROGRESSED_PERFECTION_ASPECTS)];
  const aspectSpecs = aspects.map((name) => {
    const spec = DEFAULT_ASPECT_SPECS.find((s) => s.name === name);
    if (!spec) throw new DerivedChartError("INVALID_INPUT", `unknown aspect "${String(name)}"`);
    return spec;
  });

  const natalJd = dateToJd(natalChart.dateUtc);
  const fromKey = resolveTimeKey(natalJd, dateToJd(from), options.yearLength, natalSun);
  const toKey = resolveTimeKey(natalJd, dateToJd(to), options.yearLength, natalSun);
  const days = toKey.yearLength.days;
  // Solar-return years: the same return instants the forward key brackets `to` with.
  const returns = days === null ? solarReturnInstants(natalJd, toKey.targetJd, natalSun) : null;
  const realJdOf = (progressedJd: number): number => {
    const age = progressedJd - natalJd;
    if (!returns) return natalJd + age * (days as number);
    const k = Math.max(0, Math.min(Math.floor(age), returns.length - 2));
    return returns[k] + (age - k) * (returns[k + 1] - returns[k]);
  };

  // `findTransitPerfections` takes whole-millisecond dates: the progressed window is
  // widened to the enclosing milliseconds and the results cut back to [from, to] below.
  const fromUtc = new Date(Math.floor((fromKey.progressedJd - UNIX_EPOCH_JD) * MS_PER_DAY));
  const toUtc = new Date(Math.ceil((toKey.progressedJd - UNIX_EPOCH_JD) * MS_PER_DAY));
  // A window of real dates is 365 times shorter in ephemeris time, so the grid is scaled to it.
  const scanStepDays = Math.min(
    MAX_PROGRESSED_SCAN_STEP_DAYS,
    Math.max((toUtc.getTime() - fromUtc.getTime()) / MS_PER_DAY / PROGRESSED_SCAN_STEPS_PER_WINDOW, 1 / MS_PER_DAY)
  );

  const perfections: ProgressedPerfection[] = [];
  if (progressedBodies.length > 0 && natalPointKeys.length > 0 && aspectSpecs.length > 0) {
    const found = findTransitPerfections({
      natalPoints,
      transitPlanets: progressedBodies,
      fromUtc,
      toUtc,
      stepDays: scanStepDays,
      aspectSpecs,
      timeToleranceSeconds: options.timeToleranceSeconds,
      residualToleranceDegrees: options.residualToleranceDegrees,
    });
    for (const event of found.perfections) {
      const exactDate = new Date(Math.round((realJdOf(event.exactJd) - UNIX_EPOCH_JD) * MS_PER_DAY));
      if (exactDate.getTime() < from.getTime() || exactDate.getTime() > to.getTime()) continue;
      perfections.push({
        progressedBody: event.transitPlanet,
        natalPoint: event.natalPlanet,
        aspect: event.aspect,
        exactDate,
        progressedJd: event.exactJd,
        retrograde: event.retrograde,
      });
    }
    perfections.sort((a, b) => a.exactDate.getTime() - b.exactDate.getTime() || a.progressedJd - b.progressedJd);
  }

  return {
    from,
    to,
    progressedBodies,
    natalPoints: natalPointKeys,
    aspects,
    perfections,
    method: {
      technique: "secondary progression",
      timeKey: {
        rule: toKey.rule,
        inverse:
          "real instant = natal JD + (progressed JD - natal JD) x year length; with solar-return years, the same fraction of the return to return interval",
        yearLength: toKey.yearLength,
        natalJd,
        fromProgressedJd: fromKey.progressedJd,
        toProgressedJd: toKey.progressedJd,
      },
      targets: "fixed natal longitudes",
      angles: "progressed angles are not searched",
      scanStepDays,
      ephemeris: "Swiss Ephemeris (SWISS_EPH, SPEED), UT Julian Day without millisecond truncation",
      solver: ROOT_SOLVER_METHOD,
    },
  };
}
