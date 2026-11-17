/**
 * Vimshottari (120-year) and Yogini (36-year) maha + antar dashas.
 *
 * Pure arithmetic, no ephemeris. Conventions (all explicit, none fitted):
 *
 *  - Birth balance: the Moon's nakshatra lord's maha began
 *    `elapsedFraction * mahaYears * yearLengthDays` days BEFORE birth. That
 *    pre-birth start is kept as the first maha's `start` (`startsBeforeBirth`).
 *  - `yearLengthDays` is mandatory per call. Documented reference
 *    configurations: {@link DASHA_YEAR_LENGTH_REFERENCES} (Dhruva timelines used
 *    365.2422; the saved Lahiri comparison used 365.25, a reference
 *    configuration and not a claim about every Lahiri practitioner).
 *  - Antar lengths are proportional: `mahaLength * antarLordYears / totalYears`,
 *    starting from the maha lord and continuing in sequence order.
 *  - Intervals are half-open `[start, end)`; a boundary instant belongs to the
 *    period that STARTS there.
 *  - By default antars that ended on or before birth are omitted from the first
 *    maha (`includePreBirthAntars` keeps them); the surviving first antar may
 *    start before birth.
 *  - Yogini: lords Mangala(1) .. Sankata(8), start index
 *    `(nakshatraNumber + 3 - 1) mod 8`, i.e. the common "(number + 3) mod 8"
 *    rule. This convention is chosen and implemented; it was NOT matched to a
 *    Kala Yogini export.
 *  - Generation is bounded by `through` (default: one full cycle after birth)
 *    and `maxMahaPeriods`.
 */

import { NAKSHATRA_IDS, VIMSHOTTARI_LORDS, VIMSHOTTARI_YEARS } from "./nakshatra";

export type DashaSystem = "vimshottari" | "yogini";

export const YOGINI_LORDS = ["mangala", "pingala", "dhanya", "bhramari", "bhadrika", "ulka", "siddha", "sankata"] as const;
export const YOGINI_YEARS: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8];

/** Named year-length reference configurations. */
export const DASHA_YEAR_LENGTH_REFERENCES = Object.freeze({
  /** Dhruva timeline year lengths. */
  dhruva: 365.2422,
  /** The saved Lahiri comparison. A reference configuration, not a universal claim. */
  lahiriReference: 365.25,
});

const MS_PER_DAY = 86400000;
const UNIX_EPOCH_JD = 2440587.5;

export function dateToJulianDay(date: Date): number {
  return date.getTime() / MS_PER_DAY + UNIX_EPOCH_JD;
}
export function julianDayToDate(jd: number): Date {
  return new Date(Math.round((jd - UNIX_EPOCH_JD) * MS_PER_DAY));
}

interface SystemDefinition {
  lords: readonly string[];
  years: readonly number[];
  totalYears: number;
  startIndex(nakshatraIndex: number): number;
}

const SYSTEMS: Record<DashaSystem, SystemDefinition> = {
  vimshottari: {
    lords: VIMSHOTTARI_LORDS,
    years: VIMSHOTTARI_YEARS,
    totalYears: 120,
    startIndex: (n) => n % 9,
  },
  yogini: {
    lords: YOGINI_LORDS,
    years: YOGINI_YEARS,
    totalYears: 36,
    startIndex: (n) => (n + 1 + 3 - 1) % 8,
  },
};

export interface DashaPeriod {
  level: "maha" | "antar";
  lord: string;
  /** Julian day (UT) of the inclusive start. */
  startJd: number;
  /** Julian day (UT) of the exclusive end. */
  endJd: number;
  start: Date;
  end: Date;
  /** True when the period began before the birth instant. */
  startsBeforeBirth: boolean;
  /** Nominal length in the schedule's years. */
  years: number;
  /** Antars (maha only). */
  antars?: DashaPeriod[];
}

export interface DashaBalance {
  /** Lord of the birth maha. */
  lord: string;
  mahaYears: number;
  /** Fraction of the birth maha already elapsed at birth (the Moon's elapsed fraction). */
  elapsedFraction: number;
  remainingFraction: number;
  elapsedDays: number;
  remainingDays: number;
  /** Remaining time expressed in `yearLengthDays` years. */
  remainingYears: number;
}

export interface DashaScheduleInput {
  system: DashaSystem;
  /** Birth instant. */
  birth: Date;
  /** Overrides `birth` with an explicit UT Julian day (sub-millisecond precision). */
  birthJulianDayUt?: number;
  /** 0-based nakshatra index of the Moon in the SELECTED frame (Dhruva or Lahiri). */
  moonNakshatraIndex: number;
  /** Moon's elapsed fraction in that nakshatra, [0, 1). */
  moonElapsedFraction: number;
  /** Mandatory length of a dasha year in days. */
  yearLengthDays: number;
  /** Exclusive end of generation. Default: birth + one full cycle (120 / 36 years). */
  through?: Date;
  /** Keep antars of the first maha that ended on/before birth. Default false. */
  includePreBirthAntars?: boolean;
  /** Hard cap on generated mahas. Default 200. */
  maxMahaPeriods?: number;
}

export interface DashaSchedule {
  system: DashaSystem;
  yearLengthDays: number;
  totalYears: number;
  birthJd: number;
  moonNakshatra: { index: number; id: string; elapsedFraction: number };
  balance: DashaBalance;
  mahas: DashaPeriod[];
  /** Exclusive generation horizon (JD UT). */
  throughJd: number;
  /** True if `maxMahaPeriods` stopped generation before the horizon. */
  truncated: boolean;
  intervalConvention: "half-open [start, end)";
}

function makePeriod(
  level: "maha" | "antar",
  lord: string,
  startJd: number,
  endJd: number,
  birthJd: number,
  years: number
): DashaPeriod {
  return {
    level,
    lord,
    startJd,
    endJd,
    start: julianDayToDate(startJd),
    end: julianDayToDate(endJd),
    startsBeforeBirth: startJd < birthJd,
    years,
  };
}

export function generateDashaSchedule(input: DashaScheduleInput): DashaSchedule {
  const def = SYSTEMS[input.system];
  if (!def) throw new Error(`Unknown dasha system: ${String(input.system)}`);
  const { yearLengthDays } = input;
  if (!Number.isFinite(yearLengthDays) || yearLengthDays <= 0) throw new Error("yearLengthDays must be a positive number");
  if (!Number.isInteger(input.moonNakshatraIndex) || input.moonNakshatraIndex < 0 || input.moonNakshatraIndex > 26) {
    throw new Error("moonNakshatraIndex must be an integer 0..26");
  }
  if (!(input.moonElapsedFraction >= 0 && input.moonElapsedFraction < 1)) {
    throw new Error("moonElapsedFraction must be in [0, 1)");
  }
  const birthJd = input.birthJulianDayUt ?? dateToJulianDay(input.birth);
  if (!Number.isFinite(birthJd)) throw new Error("Invalid birth instant");
  const throughJd = input.through ? dateToJulianDay(input.through) : birthJd + def.totalYears * yearLengthDays;
  const maxMahas = input.maxMahaPeriods ?? 200;

  let idx = def.startIndex(input.moonNakshatraIndex);
  const firstYears = def.years[idx];
  const elapsedDays = input.moonElapsedFraction * firstYears * yearLengthDays;
  let cursor = birthJd - elapsedDays;

  const balance: DashaBalance = {
    lord: def.lords[idx],
    mahaYears: firstYears,
    elapsedFraction: input.moonElapsedFraction,
    remainingFraction: 1 - input.moonElapsedFraction,
    elapsedDays,
    remainingDays: (1 - input.moonElapsedFraction) * firstYears * yearLengthDays,
    remainingYears: (1 - input.moonElapsedFraction) * firstYears,
  };

  const mahas: DashaPeriod[] = [];
  let truncated = false;
  let first = true;
  while (cursor < throughJd) {
    if (mahas.length >= maxMahas) {
      truncated = true;
      break;
    }
    const mahaYears = def.years[idx];
    const length = mahaYears * yearLengthDays;
    const stop = cursor + length;
    const maha = makePeriod("maha", def.lords[idx], cursor, stop, birthJd, mahaYears);
    const antars: DashaPeriod[] = [];
    let sub = cursor;
    for (let q = 0; q < def.lords.length; q++) {
      const ai = (idx + q) % def.lords.length;
      const subEnd = sub + (length * def.years[ai]) / def.totalYears;
      if (!first || input.includePreBirthAntars || subEnd > birthJd) {
        antars.push(makePeriod("antar", def.lords[ai], sub, subEnd, birthJd, (mahaYears * def.years[ai]) / def.totalYears));
      }
      sub = subEnd;
    }
    maha.antars = antars;
    mahas.push(maha);
    cursor = stop;
    idx = (idx + 1) % def.lords.length;
    first = false;
  }

  return {
    system: input.system,
    yearLengthDays,
    totalYears: def.totalYears,
    birthJd,
    moonNakshatra: {
      index: input.moonNakshatraIndex,
      id: NAKSHATRA_IDS[input.moonNakshatraIndex],
      elapsedFraction: input.moonElapsedFraction,
    },
    balance,
    mahas,
    throughJd,
    truncated,
    intervalConvention: "half-open [start, end)",
  };
}

/** Convenience wrappers. */
export function generateVimshottariDasha(input: Omit<DashaScheduleInput, "system">): DashaSchedule {
  return generateDashaSchedule({ ...input, system: "vimshottari" });
}
export function generateYoginiDasha(input: Omit<DashaScheduleInput, "system">): DashaSchedule {
  return generateDashaSchedule({ ...input, system: "yogini" });
}

export interface ActiveDasha {
  maha: DashaPeriod;
  antar?: DashaPeriod;
}

/**
 * Active maha and antar at `asOf`, half-open `[start, end)`. Returns
 * `undefined` outside the generated range. Instants before birth that fall in
 * the first maha's pre-birth portion are returned as-is (inspect
 * `startsBeforeBirth`); callers wanting "life only" should check `asOf >= birth`.
 */
export function findActiveDasha(schedule: DashaSchedule, asOf: Date | number): ActiveDasha | undefined {
  const jd = typeof asOf === "number" ? asOf : dateToJulianDay(asOf);
  const maha = schedule.mahas.find((m) => jd >= m.startJd && jd < m.endJd);
  if (!maha) return undefined;
  const antar = maha.antars?.find((a) => jd >= a.startJd && jd < a.endJd);
  return { maha, antar };
}
