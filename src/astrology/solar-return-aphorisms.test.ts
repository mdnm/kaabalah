import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Eclipse } from "./eclipses";
import { getBirthChart, getSolarReturnChart, HouseSystem, type BirthChart } from "./index";
import { closeSwissEph, getSwissEph } from "./swisseph";
import {
  GENERAL_SOLAR_RETURN_APHORISMS,
  SOLAR_RETURN_APHORISM_TRIGGERS,
  SolarReturnAphorismFacts,
  ageAtSolarReturn,
  matchSolarReturnAphorisms,
  type SolarReturnYearRuler,
} from "./solar-return-aphorisms";
import { ASTROLOGY_TIMING_DESCRIPTIONS, type SolarReturnAphorismId } from "./timing-descriptions";

/** Pure checks on hand-built charts: equal houses from the Ascendant, planets where a test puts them. */

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];
const norm = (value: number) => ((value % 360) + 360) % 360;
const position = (longitude: number) => ({ longitude: norm(longitude), sign: SIGNS[Math.floor(norm(longitude) / 30)] });

/** Planets spread out of each other's way unless a test places them. */
const SPREAD: Record<string, number> = {
  sun: 5, moon: 47, mercury: 101, venus: 143, mars: 199, jupiter: 241, saturn: 283, "mean node": 325,
};
const BIRTH = new Date("1990-01-01T00:00:00Z");
const atAge = (age: number) => new Date(BIRTH.getTime() + age * 365.2422 * 86_400_000);

function chart(ascendant: number, planets: Record<string, number> = {}, options: { age?: number; fortune?: number } = {}): BirthChart {
  const all = { ...SPREAD, ...planets };
  return {
    dateUtc: atAge(options.age ?? 0),
    planets: Object.fromEntries(Object.entries(all).map(([key, longitude]) => [key, position(longitude)])),
    houses: {
      ascendant: position(ascendant),
      mc: position(ascendant + 270),
      dc: position(ascendant + 180),
      ic: position(ascendant + 90),
      houses: Array.from({ length: 12 }, (_, i) => position(ascendant + 30 * i)),
    },
    ...(options.fortune === undefined ? {} : { lots: { fortunePosition: position(options.fortune) } }),
  } as unknown as BirthChart;
}

const eclipse = (kind: "solar" | "lunar", longitude: number, instant: Date): Eclipse =>
  ({ kind, type: "partial", jd: 0, instant, sunLongitude: 0, moonLongitude: 0, longitude, sign: SIGNS[Math.floor(norm(longitude) / 30)], signDegree: norm(longitude) % 30 }) as Eclipse;

function fires(
  id: SolarReturnAphorismId,
  natal: BirthChart,
  solarReturn: BirthChart,
  yearRuler: SolarReturnYearRuler = "profection",
  eclipses: Eclipse[] = [],
) {
  return SOLAR_RETURN_APHORISM_TRIGGERS[id](new SolarReturnAphorismFacts(natal, solarReturn, yearRuler, eclipses));
}

describe("solar return aphorism matching", () => {
  it("has a check for every aphorism in the bank", () => {
    expect(Object.keys(SOLAR_RETURN_APHORISM_TRIGGERS).sort()).toEqual(
      Object.keys(ASTROLOGY_TIMING_DESCRIPTIONS.solarReturnAphorisms).sort()
    );
  });

  it("takes the profection lord as ruler of the year, and the return Ascendant's ruler as first-house ruler", () => {
    // Natal Aries rising; at 1 completed year the profection is Taurus, ruled by Venus.
    const natal = chart(0);
    const solarReturn = chart(120, {}, { age: 1 });
    expect(ageAtSolarReturn(natal, solarReturn)).toBe(1);
    const facts = new SolarReturnAphorismFacts(natal, solarReturn);
    expect(facts.Y).toBe("venus");
    expect(facts.F).toBe("sun"); // Leo rising in the return
    expect(new SolarReturnAphorismFacts(natal, solarReturn, "return-ascendant").Y).toBe("sun");
    // At 12 the profection is back to Aries.
    expect(new SolarReturnAphorismFacts(natal, chart(120, {}, { age: 12 })).Y).toBe("mars");
  });

  it("reads 'ruler of the year' and 'ruler of the first house' as different planets", () => {
    // Venus rules the year (age 1); return Leo rising: the Sun rules the first house.
    const natal = chart(0);
    expect(fires("venus-year-ruler-in-via-combusta", natal, chart(120, { venus: 80 }, { age: 1 }))).toBe(true);
    expect(fires("venus-year-ruler-in-via-combusta", natal, chart(120, { venus: 100 }, { age: 1 }))).toBe(false);
    // The Sun at 335 is in the return's eighth house (330 to 360).
    expect(fires("return-first-ruler-in-eighth-life-danger", natal, chart(120, { sun: 335 }, { age: 1 }))).toBe(true);
    expect(fires("return-first-ruler-in-eighth-life-danger", natal, chart(120, { sun: 5 }, { age: 1 }))).toBe(false);
  });

  it("places the return Ascendant in the natal house of a planet", () => {
    // Natal Aries rising: Jupiter at 95 is in house 4 (90 to 120).
    const natal = chart(0, { jupiter: 95 });
    expect(fires("ascendant-in-natal-jupiter-house", natal, chart(100))).toBe(true);
    expect(fires("ascendant-in-natal-jupiter-house", natal, chart(130))).toBe(false);
    // The house-groups rule reads the same placement, with the ruler of the year's house in the return.
    // Return Ascendant in natal house 4 (good); age 1, Venus rules the year, at 80 in return house 12 (bad).
    expect(fires("ascendant-year-ruler-house-groups", chart(0), chart(100, { venus: 80 }, { age: 1 }))).toBe(true);
    // Venus at 110 is in return house 1 (good): both good, no alternation.
    expect(fires("ascendant-year-ruler-house-groups", chart(0), chart(100, { venus: 110 }, { age: 1 }))).toBe(false);
  });

  it("finds a natal malefic's sign anywhere inside the return's first house", () => {
    // Natal Saturn in Gemini. Return Ascendant at 75 (Gemini 15) through 105: Gemini and Cancer.
    const natal = chart(0, { saturn: 70 });
    expect(fires("return-first-sign-linked-to-natal-malefic", natal, chart(75))).toBe(true);
    // Ascendant at 95 (Cancer 5) through 125: Cancer and Leo, not Gemini.
    expect(fires("return-first-sign-linked-to-natal-malefic", natal, chart(95))).toBe(false);
  });

  it("needs the same house in both charts when the rule says natal and return", () => {
    const saturnInTwelfth = (ascendant: number) => chart(ascendant, { saturn: ascendant + 345 });
    expect(fires("saturn-twelfth-natal-and-return-misfortune-wound", saturnInTwelfth(0), saturnInTwelfth(90))).toBe(true);
    expect(fires("saturn-twelfth-natal-and-return-misfortune-wound", saturnInTwelfth(0), chart(90, { saturn: 100 }))).toBe(false);
  });

  it("matches exactly one house of the natal tenth-sign and Fortune-sign series", () => {
    // Natal Aries rising: the tenth cusp is in Capricorn; return Libra rising puts Capricorn on its fourth.
    const natal = chart(0, {}, { fortune: 200 });
    const { specific } = matchSolarReturnAphorisms(natal, chart(180), { eclipses: [] });
    expect(specific.filter((id) => id.startsWith("natal-tenth-sign-in-return-house-"))).toEqual(["natal-tenth-sign-in-return-house-4"]);
    // Fortune at 200 is in Libra, the return's first house.
    expect(specific.filter((id) => id.startsWith("natal-fortune-sign-in-return-house-"))).toEqual(["natal-fortune-sign-in-return-house-1"]);
  });

  it("counts planets back on their natal positions within 3 degrees", () => {
    const natal = chart(0);
    // Every other planet 20 degrees away from its natal place.
    const away = { venus: 163, mars: 219, jupiter: 261, saturn: 303 };
    expect(fires("three-or-more-planets-return-to-natal-positions", natal, chart(90, { ...away, moon: 48, mercury: 102.5, venus: 141 }))).toBe(true);
    expect(fires("three-or-more-planets-return-to-natal-positions", natal, chart(90, { ...away, moon: 48, mercury: 102.5 }))).toBe(false);
  });

  it("reads the year's eclipses for the eclipse rules", () => {
    // Return Aries rising: house 1 is Aries, ruled by Mars. An eclipse at 10 Aries with Mars in Aries.
    const solarReturn = chart(0, { mars: 20 });
    const inFirst = [eclipse("lunar", 10, atAge(0.5))];
    expect(fires("return-eclipse-first-tenth-enemy-triumph", chart(0), solarReturn, "profection", inFirst)).toBe(true);
    expect(fires("return-eclipse-first-tenth-enemy-triumph", chart(0), chart(0, { mars: 60 }), "profection", inFirst)).toBe(false);
    expect(fires("return-eclipse-first-tenth-enemy-triumph", chart(0), solarReturn, "profection", [])).toBe(false);
    // Same rising sign, the Sun eclipsed at the return and square Saturn; the Moon waxing.
    const natal = chart(0);
    const atReturn = chart(0, { sun: 5, moon: 50, saturn: 95 });
    const solar = [eclipse("solar", 5, new Date(atReturn.dateUtc.getTime() + 3_600_000))];
    expect(fires("repeated-first-house-eclipse-or-waning-moon-saturn", natal, atReturn, "profection", solar)).toBe(true);
    expect(fires("repeated-first-house-eclipse-or-waning-moon-saturn", natal, atReturn, "profection", [])).toBe(false);
  });

  it("reads Volguine's one planet whose condition turns, and the malefic in the return's first house", () => {
    // Age 0: Mars (Aries) rules the year. Fortunate at birth (exalted in Capricorn, house 10, no
    // hard aspect to Saturn); in the return in house 12, with the Moon square Saturn.
    const natal = chart(0, { mars: 290, saturn: 240 });
    const solarReturn = chart(0, { mars: 340, moon: 10, saturn: 100 });
    expect(fires("year-ruler-benefic-natally-malefic-in-return", natal, solarReturn)).toBe(true);
    // Still fortunate in the return: no turn.
    expect(fires("year-ruler-benefic-natally-malefic-in-return", natal, chart(0, { mars: 290, moon: 10, saturn: 100 }))).toBe(false);
    // The return Ascendant in the natal house of Saturn (house 10 here), and Mars in the return's first.
    const withSaturnInTenth = chart(0, { saturn: 280 });
    expect(fires("reciprocal-ascendant-malefic-overlays", withSaturnInTenth, chart(275, { mars: 285, saturn: 10 }))).toBe(true);
    expect(fires("reciprocal-ascendant-malefic-overlays", withSaturnInTenth, chart(275, { mars: 330, saturn: 10 }))).toBe(false);
  });

  it("keeps the rules every year meets apart and reports the rulers it read", () => {
    const result = matchSolarReturnAphorisms(chart(0), chart(90, {}, { age: 3 }), { eclipses: [] });
    expect(result.general.every((id) => GENERAL_SOLAR_RETURN_APHORISMS.has(id))).toBe(true);
    expect(result.specific.some((id) => GENERAL_SOLAR_RETURN_APHORISMS.has(id))).toBe(false);
    // Age 3 from Aries: Cancer, the Moon. Return Cancer rising: the Moon too.
    expect(result).toMatchObject({ yearRuler: "moon", firstHouseRuler: "moon", age: 3, method: { yearRuler: "profection" } });
  });
});

describe("solar return aphorism matching on real charts", () => {
  beforeAll(async () => {
    await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
  });
  afterAll(() => {
    closeSwissEph();
  });

  it("searches the year's eclipses itself and reads the profection age", async () => {
    // An invented birth: Paris, 15 June 1990, 14:30.
    const natal = { date: { year: 1990, month: 6, day: 15, hour: 14, minute: 30, second: 0 }, latitude: 48.856, longitude: 2.352, houseSystem: HouseSystem.PLACIDUS, timeZoneSettings: { timeZone: "Europe/Paris" } };
    const natalChart = await getBirthChart(natal);
    const { solarReturnChart } = await getSolarReturnChart({ natal, year: 2026 });
    const result = matchSolarReturnAphorisms(natalChart, solarReturnChart);
    expect(result.age).toBe(36);
    // 36 signs from the natal Ascendant is the natal Ascendant's own sign again.
    expect(result.yearRuler).toBe(new SolarReturnAphorismFacts(natalChart, solarReturnChart).YN);
    expect(result.specific.length).toBeGreaterThan(0);
    expect(result.specific.length).toBeLessThan(40);
  });
});
