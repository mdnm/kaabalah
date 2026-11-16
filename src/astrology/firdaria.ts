/**
 * Firdaria — traditional planetary period system.
 * Pure math, no WASM dependency.
 */

export type TimelineErrorCode =
  | "INVALID_RANGE"
  | "RANGE_TOO_LARGE"
  | "UNBOUNDED_INPUT"
  | "INVALID_INPUT"
  | "UNAVAILABLE_INPUT";

/** Typed error of the bounded timeline functions (profections, firdaria, return passes). */
export class TimelineError extends Error {
  readonly code: TimelineErrorCode;
  constructor(code: TimelineErrorCode, message: string) {
    super(message);
    this.name = "TimelineError";
    this.code = code;
  }
}

export type FirdariaPlanet =
  | "Sun"
  | "Moon"
  | "Mercury"
  | "Venus"
  | "Mars"
  | "Jupiter"
  | "Saturn"
  | "NorthNode"
  | "SouthNode";

export interface FirdariaSubPeriod {
  planet: FirdariaPlanet;
  startDate: Date;
  endDate: Date;
}

export interface FirdariaMajorPeriod {
  planet: FirdariaPlanet;
  years: number;
  startDate: Date;
  endDate: Date;
  subPeriods: FirdariaSubPeriod[];
}

export interface FirdariaResult {
  sect: "diurnal" | "nocturnal";
  currentMajor: FirdariaMajorPeriod;
  currentSub: FirdariaSubPeriod;
  allPeriods: FirdariaMajorPeriod[];
}

export interface FirdariaOptions {
  nodeSubPeriodStart?: "jupiter-saturn" | "sun-mars";
}

interface SequenceEntry {
  planet: FirdariaPlanet;
  years: number;
}

const DAY_SEQUENCE: SequenceEntry[] = [
  { planet: "Sun", years: 10 },
  { planet: "Venus", years: 8 },
  { planet: "Mercury", years: 13 },
  { planet: "Moon", years: 9 },
  { planet: "Saturn", years: 11 },
  { planet: "Jupiter", years: 12 },
  { planet: "Mars", years: 7 },
  { planet: "NorthNode", years: 3 },
  { planet: "SouthNode", years: 2 },
];

const NIGHT_SEQUENCE: SequenceEntry[] = [
  { planet: "Moon", years: 9 },
  { planet: "Saturn", years: 11 },
  { planet: "Jupiter", years: 12 },
  { planet: "Mars", years: 7 },
  { planet: "NorthNode", years: 3 },
  { planet: "SouthNode", years: 2 },
  { planet: "Sun", years: 10 },
  { planet: "Venus", years: 8 },
  { planet: "Mercury", years: 13 },
];

const CHALDEAN_ORDER: FirdariaPlanet[] = [
  "Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon",
];

function addYears(date: Date, years: number): Date {
  const ms = years * 365.25 * 24 * 60 * 60 * 1000;
  return new Date(date.getTime() + ms);
}

function getSubPeriodStart(
  planet: FirdariaPlanet,
  options?: FirdariaOptions
): number {
  const mode = options?.nodeSubPeriodStart ?? "jupiter-saturn";

  if (planet === "NorthNode") {
    if (mode === "sun-mars") {
      return CHALDEAN_ORDER.indexOf("Sun");
    }
    return CHALDEAN_ORDER.indexOf("Jupiter");
  }
  if (planet === "SouthNode") {
    if (mode === "sun-mars") {
      return CHALDEAN_ORDER.indexOf("Mars");
    }
    return CHALDEAN_ORDER.indexOf("Saturn");
  }

  // For regular planets, find position in Chaldean order
  return CHALDEAN_ORDER.indexOf(planet);
}

function buildSubPeriods(
  major: SequenceEntry,
  majorStart: Date,
  majorEnd: Date,
  options?: FirdariaOptions
): FirdariaSubPeriod[] {
  const startIdx = getSubPeriodStart(major.planet, options);
  const totalMs = majorEnd.getTime() - majorStart.getTime();
  const subMs = totalMs / 7;

  const subs: FirdariaSubPeriod[] = [];
  for (let i = 0; i < 7; i++) {
    const subPlanet = CHALDEAN_ORDER[(startIdx + i) % 7];
    const subStart = new Date(majorStart.getTime() + i * subMs);
    const subEnd = new Date(majorStart.getTime() + (i + 1) * subMs);
    subs.push({ planet: subPlanet, startDate: subStart, endDate: subEnd });
  }
  return subs;
}

export function getFirdaria(
  birthDate: Date,
  isDiurnal: boolean,
  targetDate?: Date,
  options?: FirdariaOptions
): FirdariaResult {
  const target = targetDate ?? new Date();
  const sequence = isDiurnal ? DAY_SEQUENCE : NIGHT_SEQUENCE;
  const sect = isDiurnal ? "diurnal" : "nocturnal";

  // Build periods, cycling the 75-year sequence
  const allPeriods: FirdariaMajorPeriod[] = [];
  let cursor = new Date(birthDate.getTime());
  let foundCurrent = false;

  // Generate enough cycles to cover target date (max 3 cycles = 225 years)
  for (let cycle = 0; cycle < 3 && !foundCurrent; cycle++) {
    for (const entry of sequence) {
      const start = new Date(cursor.getTime());
      const end = addYears(start, entry.years);
      const subPeriods = buildSubPeriods(entry, start, end, options);
      allPeriods.push({
        planet: entry.planet,
        years: entry.years,
        startDate: start,
        endDate: end,
        subPeriods,
      });
      cursor = end;

      if (target.getTime() >= start.getTime() && target.getTime() < end.getTime()) {
        foundCurrent = true;
      }
    }
  }

  // Find current major and sub
  const currentMajor = allPeriods.find(
    (p) => target.getTime() >= p.startDate.getTime() && target.getTime() < p.endDate.getTime()
  ) ?? allPeriods[0];

  const currentSub = currentMajor.subPeriods.find(
    (s) => target.getTime() >= s.startDate.getTime() && target.getTime() < s.endDate.getTime()
  ) ?? currentMajor.subPeriods[0];

  return { sect, currentMajor, currentSub, allPeriods };
}

// ── Bounded firdaria timeline (additive) ────────────────────────────────────

/** Hard caps: at most 3 repeats of the 75-year sequence, and a window of at most 225 years. */
export const MAX_FIRDARIA_CYCLES = 3;
export const MAX_FIRDARIA_WINDOW_YEARS = 225;
/** Years of one full firdaria sequence. */
export const FIRDARIA_CYCLE_YEARS = 75;

/** All major periods (with sub-periods) of `cycles` repeats of the 75-year sequence, from birth. */
export function getFirdariaPeriods(
  birthDate: Date,
  isDiurnal: boolean,
  cycles = 1,
  options?: FirdariaOptions
): FirdariaMajorPeriod[] {
  if (!Number.isInteger(cycles) || cycles < 1 || cycles > MAX_FIRDARIA_CYCLES) {
    throw new TimelineError("RANGE_TOO_LARGE", `cycles must be an integer in 1..${MAX_FIRDARIA_CYCLES}`);
  }
  if (!Number.isFinite(birthDate.getTime())) throw new TimelineError("INVALID_INPUT", "birthDate is not a valid date");
  const sequence = isDiurnal ? DAY_SEQUENCE : NIGHT_SEQUENCE;
  const periods: FirdariaMajorPeriod[] = [];
  let cursor = new Date(birthDate.getTime());
  for (let cycle = 0; cycle < cycles; cycle++) {
    for (const entry of sequence) {
      const start = new Date(cursor.getTime());
      const end = addYears(start, entry.years);
      periods.push({
        planet: entry.planet,
        years: entry.years,
        startDate: start,
        endDate: end,
        subPeriods: buildSubPeriods(entry, start, end, options),
      });
      cursor = end;
    }
  }
  return periods;
}

export interface FirdariaTimelineOptions extends FirdariaOptions {
  /** Window start (inclusive). Default: birth. */
  from?: Date;
  /** Window end (exclusive). Required: unbounded timelines are refused. */
  to: Date;
  /** Include the 7 sub-periods of each major (default true). */
  includeSubPeriods?: boolean;
}

export interface FirdariaTimelineSub {
  planet: FirdariaPlanet;
  /** Clipped start (inclusive). */
  start: Date;
  /** Clipped end (exclusive). */
  endExclusive: Date;
  nominalStart: Date;
  nominalEnd: Date;
  clippedStart: boolean;
  clippedEnd: boolean;
}

export interface FirdariaTimelineEntry {
  planet: FirdariaPlanet;
  years: number;
  /** 0-based repeat of the 75-year sequence. */
  cycle: number;
  start: Date;
  endExclusive: Date;
  nominalStart: Date;
  nominalEnd: Date;
  clippedStart: boolean;
  clippedEnd: boolean;
  subPeriods: FirdariaTimelineSub[];
}

export interface FirdariaTimelineResult {
  sect: "diurnal" | "nocturnal";
  window: { from: Date; toExclusive: Date };
  entries: FirdariaTimelineEntry[];
  method: {
    yearLengthDays: 365.25;
    intervals: "half-open [start, endExclusive); consecutive periods share the boundary instant";
    subPeriods: string;
    sequence: string;
  };
}

/**
 * Major and sub periods intersecting a bounded window, clipped to it (nominal ends are kept).
 * Reuses the firdaria sequence, year length (365.25 d) and sub-period rules of `getFirdaria`.
 */
export function getFirdariaTimeline(
  birthDate: Date,
  isDiurnal: boolean,
  options: FirdariaTimelineOptions
): FirdariaTimelineResult {
  const to = options?.to;
  if (!(to instanceof Date) || !Number.isFinite(to.getTime())) {
    throw new TimelineError("UNBOUNDED_INPUT", "a finite `to` date is required");
  }
  if (!Number.isFinite(birthDate.getTime())) throw new TimelineError("INVALID_INPUT", "birthDate is not a valid date");
  const from = options.from ?? birthDate;
  if (!Number.isFinite(from.getTime())) throw new TimelineError("UNBOUNDED_INPUT", "`from` is not a valid date");
  if (to.getTime() <= from.getTime()) throw new TimelineError("INVALID_RANGE", "`to` must be after `from`");
  const windowYears = (to.getTime() - from.getTime()) / (365.25 * 86_400_000);
  if (windowYears > MAX_FIRDARIA_WINDOW_YEARS) {
    throw new TimelineError("RANGE_TOO_LARGE", `window of ${windowYears.toFixed(1)} years exceeds ${MAX_FIRDARIA_WINDOW_YEARS}`);
  }
  const yearsFromBirth = (to.getTime() - birthDate.getTime()) / (365.25 * 86_400_000);
  const cycles = Math.max(1, Math.ceil(yearsFromBirth / FIRDARIA_CYCLE_YEARS));
  if (cycles > MAX_FIRDARIA_CYCLES) {
    throw new TimelineError("RANGE_TOO_LARGE", `window reaches beyond ${MAX_FIRDARIA_CYCLES} firdaria cycles from birth`);
  }
  const periods = getFirdariaPeriods(birthDate, isDiurnal, cycles, options);
  const w0 = Math.max(from.getTime(), birthDate.getTime());
  const w1 = to.getTime();
  const clip = (s: Date, e: Date) => {
    const st = Math.max(s.getTime(), w0);
    const en = Math.min(e.getTime(), w1);
    return { st, en, clippedStart: st > s.getTime(), clippedEnd: en < e.getTime() };
  };
  const entries: FirdariaTimelineEntry[] = [];
  periods.forEach((p, i) => {
    const c = clip(p.startDate, p.endDate);
    if (c.en <= c.st) return;
    const subs: FirdariaTimelineSub[] = [];
    if (options.includeSubPeriods !== false) {
      for (const s of p.subPeriods) {
        const sc = clip(s.startDate, s.endDate);
        if (sc.en <= sc.st) continue;
        subs.push({
          planet: s.planet,
          start: new Date(sc.st),
          endExclusive: new Date(sc.en),
          nominalStart: s.startDate,
          nominalEnd: s.endDate,
          clippedStart: sc.clippedStart,
          clippedEnd: sc.clippedEnd,
        });
      }
    }
    entries.push({
      planet: p.planet,
      years: p.years,
      cycle: Math.floor(i / 9),
      start: new Date(c.st),
      endExclusive: new Date(c.en),
      nominalStart: p.startDate,
      nominalEnd: p.endDate,
      clippedStart: c.clippedStart,
      clippedEnd: c.clippedEnd,
      subPeriods: subs,
    });
  });
  return {
    sect: isDiurnal ? "diurnal" : "nocturnal",
    window: { from: new Date(w0), toExclusive: new Date(w1) },
    entries,
    method: {
      yearLengthDays: 365.25,
      intervals: "half-open [start, endExclusive); consecutive periods share the boundary instant",
      subPeriods: "each major is split into 7 equal sub-periods in Chaldean order from the major lord (nodes per nodeSubPeriodStart)",
      sequence: isDiurnal ? "day sequence starting with the Sun" : "night sequence starting with the Moon",
    },
  };
}
