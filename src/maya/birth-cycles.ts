import { MayaCalculationError, MAYA_JOHNSON_METHOD } from "./calendar";

export interface MayaBirthCyclesOptions {
  readonly instant: Date;
  readonly location?: { readonly latitude: number; readonly longitude: number };
}

const SOLAR_QUARTERS = ["midnight-to-dawn", "dawn-to-noon", "noon-to-sunset", "sunset-to-midnight"] as const;
export type MayaSolarQuarter = typeof SOLAR_QUARTERS[number];
export type MayaLunarPhase = "new" | "waxing" | "full" | "waning";

type SolarCycle = {
  readonly available: true;
  readonly quarter: MayaSolarQuarter;
  readonly midnight: Date;
  readonly dawn: Date;
  readonly noon: Date;
  readonly sunset: Date;
  readonly nextMidnight: Date;
} | { readonly available: false; readonly reason: "incomplete-solar-day" };

const BIRTH_CYCLES_METHOD = Object.freeze({
  tradition: MAYA_JOHNSON_METHOD.tradition,
  source: MAYA_JOHNSON_METHOD.source,
  solarStations: "local-meridian-transits-and-refracted-upper-limb-rise-set",
  solarIntervals: "start-inclusive-end-exclusive",
  lunarElongation: "geocentric-apparent-ecliptic-longitude",
  lunarNewWindow: "[337.5,360) and [0,22.5)",
  lunarFullWindow: "[157.5,202.5)",
} as const);

async function solarCycle(date: Date, location: NonNullable<MayaBirthCyclesOptions["location"]>): Promise<SolarCycle> {
  const { calculateRiseTransit, Planet, RiseTransitFlag } = await import("../astrology/swisseph");
  const { jdToDate } = await import("../astrology/root-solver");
  const { latitude, longitude } = location;
  const instant = date.getTime();
  const search = (from: Date, flag: typeof RiseTransitFlag[keyof typeof RiseTransitFlag]) =>
    jdToDate(calculateRiseTransit(from, Planet.SUN, latitude, longitude, flag));
  const after = (event: Date) => new Date(event.getTime() + 60_000);
  const lower = RiseTransitFlag.LOWER_MERIDIAN;
  let midnight = search(new Date(date.getTime() - 25 * 3_600_000), lower);
  let nextMidnight = search(after(midnight), lower);
  if (nextMidnight.getTime() <= instant) {
    midnight = nextMidnight;
    nextMidnight = search(after(midnight), lower);
  }

  const unavailable = { available: false, reason: "incomplete-solar-day" } as const;
  try {
    const dawn = search(midnight, RiseTransitFlag.RISE);
    const noon = search(midnight, RiseTransitFlag.UPPER_MERIDIAN);
    const sunset = search(midnight, RiseTransitFlag.SET);
    if (!(midnight.getTime() <= instant && instant < nextMidnight.getTime()
      && midnight < dawn && dawn < noon && noon < sunset && sunset < nextMidnight)) {
      return unavailable;
    }
    const quarter = instant < dawn.getTime() ? SOLAR_QUARTERS[0]
      : instant < noon.getTime() ? SOLAR_QUARTERS[1]
      : instant < sunset.getTime() ? SOLAR_QUARTERS[2]
      : SOLAR_QUARTERS[3];
    return { available: true, quarter, midnight, dawn, noon, sunset, nextMidnight };
  } catch (error) {
    if (error instanceof Error && error.name === "Error" && /rise or set not found/i.test(error.message)) {
      return unavailable;
    }
    throw error;
  }
}

/** Johnson’s birth-time cycles. Initialise Swiss Ephemeris before calling. */
export async function calculateMayaBirthCycles(options: MayaBirthCyclesOptions) {
  const { instant, location } = options;
  if (!(instant instanceof Date) || !Number.isFinite(instant.getTime())) {
    throw new MayaCalculationError("INVALID_DATE", "Maya birth cycles require a valid birth instant.");
  }
  if (location && (!Number.isFinite(location.latitude) || Math.abs(location.latitude) > 90
    || !Number.isFinite(location.longitude) || Math.abs(location.longitude) > 180)) {
    throw new MayaCalculationError("INVALID_ARGUMENT", "Maya birth cycles require latitude from -90 to 90 and longitude from -180 to 180.");
  }
  const date = new Date(instant);
  const { calculateBodyAtJulianDay, CalcFlag, getJulianDayExact, Planet } = await import("../astrology/swisseph");
  const { computeMoonPhase } = await import("../astrology/moon-phase");
  const jd = getJulianDayExact(date);
  const sun = calculateBodyAtJulianDay(jd, Planet.SUN, CalcFlag.SWISS_EPH);
  const moon = calculateBodyAtJulianDay(jd, Planet.MOON, CalcFlag.SWISS_EPH);
  const { phase, waxing, elongation } = computeMoonPhase(sun.longitude, moon.longitude);
  const lunarPhase: MayaLunarPhase = phase === "new" || phase === "full" ? phase : waxing ? "waxing" : "waning";
  return {
    method: BIRTH_CYCLES_METHOD,
    instant: date,
    solar: location ? await solarCycle(date, location) : null,
    lunar: { phase: lunarPhase, elongation },
  };
}
