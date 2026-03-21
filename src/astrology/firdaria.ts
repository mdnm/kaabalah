/**
 * Firdaria — traditional planetary period system.
 * Pure math, no WASM dependency.
 */

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
