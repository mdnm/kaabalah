import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { computeSynastryAspects } from "./aspects";
import { getBirthChart, HouseSystem, type ComputedBirthChart } from "./index";
import { derivedChartAspectPoints } from "./overlays";
import {
  anglesFromArmc,
  DerivedChartError,
  getChartAtJulianDay,
  getSecondaryProgressions,
  getSolarArcDirections,
  JULIAN_YEAR_DAYS,
  NAIBOD_RATE_DEGREES_PER_YEAR,
  TROPICAL_YEAR_DAYS,
} from "./progressions";
import { findSolarReturns } from "./returns";
import { dateToJd } from "./root-solver";
import {
  calculateBodyAtJulianDay,
  calculateHousesAtJulianDay,
  CalcFlag,
  closeSwissEph,
  getSwissEph,
  Planet,
  SWISS_ECL_NUT,
} from "./swisseph";

const FLAGS = CalcFlag.SWISS_EPH | CalcFlag.SPEED;
const DAY = 86_400_000;
const norm = (x: number) => ((x % 360) + 360) % 360;
const sdiff = (a: number, b: number) => {
  const d = norm(a - b);
  return d > 180 ? d - 360 : d;
};

/** Deep equality with numeric tolerance. */
function expectClose(actual: unknown, expected: unknown, tol: number, path = "$"): void {
  if (typeof expected === "number") {
    expect(typeof actual, path).toBe("number");
    expect(Math.abs((actual as number) - expected), path).toBeLessThanOrEqual(tol);
  } else if (expected instanceof Date) {
    expect((actual as Date).getTime(), path).toBe(expected.getTime());
  } else if (Array.isArray(expected)) {
    expect((actual as unknown[]).length, path).toBe(expected.length);
    expected.forEach((e, i) => expectClose((actual as unknown[])[i], e, tol, `${path}[${i}]`));
  } else if (expected && typeof expected === "object") {
    expect(Object.keys(actual as object).sort(), path).toEqual(Object.keys(expected).sort());
    for (const k of Object.keys(expected)) expectClose((actual as never)[k], (expected as never)[k], tol, `${path}.${k}`);
  } else {
    expect(actual, path).toEqual(expected);
  }
}

describe("progressions", () => {
  const LAT = 40.7;
  const LON = -74;
  const natalDate = new Date(Date.UTC(1990, 5, 15, 12, 30, 0));
  let natal: ComputedBirthChart;
  let natalJd: number;

  beforeAll(async () => {
    await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
    natal = await getBirthChart({
      date: natalDate,
      latitude: LAT,
      longitude: LON,
      houseSystem: HouseSystem.PLACIDUS,
      timeZoneSettings: { treatAsUTC: true },
    });
    natalJd = dateToJd(natal.dateUtc);
  });
  afterAll(() => closeSwissEph());

  const base = () => ({ natalChart: natal, natalLatitude: LAT, natalLongitude: LON });
  const at = (years: number, yearDays = JULIAN_YEAR_DAYS) => new Date(natalDate.getTime() + years * yearDays * DAY);

  describe("getChartAtJulianDay", () => {
    it("equals getBirthChart at a whole-second UTC instant (numeric tolerance)", () => {
      const chart = getChartAtJulianDay({
        julianDayUt: dateToJd(natalDate),
        latitude: LAT,
        longitude: LON,
        houseSystem: HouseSystem.PLACIDUS,
      });
      // getBirthChart stores `id` as the stringified enum key at runtime (typed as Planet); compare numerically.
      const normalizeIds = (c: ComputedBirthChart) => ({
        ...c,
        planets: Object.fromEntries(Object.entries(c.planets).map(([k, p]) => [k, { ...p, id: Number(p.id) }])),
      });
      expectClose(normalizeIds(chart), normalizeIds(natal), 1e-7);
    });

    it("rejects non-finite input with a typed error", () => {
      expect(() => getChartAtJulianDay({ julianDayUt: NaN, latitude: 0, longitude: 0 })).toThrow(DerivedChartError);
    });
  });

  describe("secondary progressions", () => {
    it("uses progressed JD = natal JD + age and equals a direct ephemeris call at that JD", () => {
      const r = getSecondaryProgressions({ ...base(), target: at(30) });
      expect(r.ageYears).toBeCloseTo(30, 9);
      expect(r.progressedJd).toBeCloseTo(natalJd + 30, 7);
      expect(r.method.timeKey.yearLength.days).toBe(365.25);
      for (const [key, id] of [["sun", Planet.SUN], ["moon", Planet.MOON], ["mars", Planet.MARS], ["saturn", Planet.SATURN]] as const) {
        const direct = calculateBodyAtJulianDay(r.progressedJd, id, FLAGS);
        expect(r.chart.planets[key].longitude).toBeCloseTo(direct.longitude, 9);
      }
      expect(r.chart.dateUtc.getTime()).toBe(Math.round((r.progressedJd - 2440587.5) * DAY));
    });

    it("progressed Sun moves about one degree per year of age", () => {
      for (const years of [1, 10, 40]) {
        const r = getSecondaryProgressions({ ...base(), target: at(years) });
        const moved = norm(r.chart.planets.sun.longitude - natal.planets.sun.longitude);
        expect(moved / years).toBeGreaterThan(0.95);
        expect(moved / years).toBeLessThan(1.03);
        expect(r.solarArcDegrees).toBeCloseTo(moved, 12);
      }
    });

    it("year-length convention changes the time key as declared", () => {
      const target = at(40);
      const julian = getSecondaryProgressions({ ...base(), target });
      const tropical = getSecondaryProgressions({ ...base(), target, yearLength: "tropical" });
      const custom = getSecondaryProgressions({ ...base(), target, yearLength: 365 });
      const days = (target.getTime() - natal.dateUtc.getTime()) / DAY;
      expect(tropical.ageYears).toBeCloseTo(days / TROPICAL_YEAR_DAYS, 9);
      expect(custom.ageYears).toBeCloseTo(days / 365, 9);
      expect(tropical.ageYears).toBeGreaterThan(julian.ageYears);
      expect(tropical.method.timeKey.yearLength.spec).toMatch(/tropical/);
    });

    it("solar-return year length: age is an integer at an exact solar return", () => {
      const sr = findSolarReturns({
        natalLongitude: natal.planets.sun.longitude,
        from: new Date(Date.UTC(2015, 5, 10)),
        to: new Date(Date.UTC(2015, 5, 20)),
      });
      expect(sr.crossings).toHaveLength(1);
      const r = getSecondaryProgressions({ ...base(), target: sr.crossings[0].instant, yearLength: "solar-return" });
      expect(r.ageYears).toBeCloseTo(25, 5);
      expect(r.method.timeKey.yearLength.days).toBeNull();
      // halfway between two returns the fractional age is about .5
      const mid = new Date((sr.crossings[0].instant.getTime() + 182.6 * DAY));
      const half = getSecondaryProgressions({ ...base(), target: mid, yearLength: "solar-return" });
      expect(half.ageYears).toBeGreaterThan(25.49);
      expect(half.ageYears).toBeLessThan(25.51);
    });

    it("at age 0 every angle convention reproduces the natal angles", () => {
      const r = getSecondaryProgressions({ ...base(), target: natal.dateUtc });
      for (const conv of ["quotidian", "solar-arc", "naibod"] as const) {
        const a = r.angles[conv]!;
        expect(Math.abs(sdiff(a.ascendant, natal.houses.ascendant.longitude)), conv).toBeLessThan(1e-5);
        expect(Math.abs(sdiff(a.mc, natal.houses.mc.longitude)), conv).toBeLessThan(1e-5);
        expect(norm(a.descendant - a.ascendant)).toBeCloseTo(180, 9);
      }
    });

    it("quotidian angles equal houses at the progressed JD; solar-arc angles are natal + arc; conventions differ", () => {
      const r = getSecondaryProgressions({ ...base(), target: at(33.3) });
      const direct = calculateHousesAtJulianDay(r.progressedJd, LAT, LON, HouseSystem.PLACIDUS);
      expect(r.angles.quotidian!.ascendant).toBeCloseTo(norm(direct.ascendant), 9);
      expect(r.angles.quotidian!.mc).toBeCloseTo(norm(direct.mc), 9);
      expect(r.angles["solar-arc"]!.mc).toBeCloseTo(norm(natal.houses.mc.longitude + r.solarArcDegrees), 9);
      expect(r.angles["solar-arc"]!.cusps).toHaveLength(12);
      expect(r.angles.naibod!.cusps).toBeUndefined();
      // Naibod: ARMC advanced by 0.985647 deg/yr, so the MC differs from the quotidian one (which sweeps ~361 deg/day)
      expect(Math.abs(sdiff(r.angles.naibod!.mc, r.angles.quotidian!.mc))).toBeGreaterThan(0.5);
      expect(r.method.angleConventions).toEqual(["quotidian", "solar-arc", "naibod"]);
      expect(Object.keys(r.method.angleConventionNotes)).toEqual(["quotidian", "solar-arc", "naibod"]);
    });

    it("naibod ARMC maths reproduces the natal ASC/MC from the natal ARMC", () => {
      const eps = calculateBodyAtJulianDay(natalJd, SWISS_ECL_NUT, FLAGS).longitude;
      const { mc, ascendant } = anglesFromArmc(natal.houses.ascmc!.armc!.longitude, eps, LAT);
      expect(Math.abs(sdiff(mc, natal.houses.mc.longitude))).toBeLessThan(1e-5);
      expect(Math.abs(sdiff(ascendant, natal.houses.ascendant.longitude))).toBeLessThan(1e-5);
      const r = getSecondaryProgressions({ ...base(), target: at(10), angleConventions: ["naibod"] });
      const armc = norm(natal.houses.ascmc!.armc!.longitude + NAIBOD_RATE_DEGREES_PER_YEAR * r.ageYears);
      expect(r.angles.naibod!.mc).toBeCloseTo(anglesFromArmc(armc, eps, LAT).mc, 9);
      expect(r.angles.quotidian).toBeUndefined();
    });

    it("exposes aspect-ready points usable against a natal chart", () => {
      const r = getSecondaryProgressions({ ...base(), target: natal.dateUtc });
      const edges = computeSynastryAspects(derivedChartAspectPoints(natal), r.points);
      const sunSun = edges.find((e) => e.planetA === "sun" && e.planetB === "sun");
      expect(sunSun?.aspect).toBe("conjunction");
      expect(sunSun!.orb).toBeLessThan(1e-5);
      expect(r.points.ascendant).toBeDefined();
      expect(r.points.sun.longitudeSpeed).toBeGreaterThan(0.9); // degrees per ephemeris day
    });

    it("typed errors for target before birth and absurd ages", () => {
      const before = () => getSecondaryProgressions({ ...base(), target: new Date(natalDate.getTime() - 1000) });
      expect(before).toThrow(DerivedChartError);
      try {
        before();
      } catch (e) {
        expect((e as DerivedChartError).code).toBe("TARGET_BEFORE_BIRTH");
      }
      expect(() => getSecondaryProgressions({ ...base(), target: at(250) })).toThrow(/exceeds/);
      expect(() => getSecondaryProgressions({ ...base(), target: at(1), yearLength: -3 })).toThrow(DerivedChartError);
    });
  });

  describe("solar-arc directions", () => {
    it("adds one arc (progressed Sun - natal Sun) uniformly to every default target", () => {
      const target = at(35);
      const sa = getSolarArcDirections({ ...base(), target });
      const prog = getSecondaryProgressions({ ...base(), target });
      expect(sa.arcDegrees).toBeCloseTo(prog.solarArcDegrees, 9);
      expect(sa.method.arcKind).toBe("true");
      const keys = Object.keys(sa.directed);
      expect(keys).toEqual(expect.arrayContaining(["sun", "moon", "saturn", "ascendant", "mc", "descendant", "ic"]));
      for (const k of keys) {
        expect(sdiff(sa.directed[k].longitude, sa.directed[k].natalLongitude)).toBeCloseTo(sa.arcDegrees, 9);
        expect(sa.points[k].longitude).toBe(sa.directed[k].longitude);
      }
      expect(sa.directed.sun.longitude).toBeCloseTo(norm(natal.planets.sun.longitude + sa.arcDegrees), 9);
      expect(sa.progressedSunLongitude).toBeCloseTo(prog.chart.planets.sun.longitude, 9);
      expect(sa.method.targetSet).toEqual(keys);
      expect(sa.directedCusps).toHaveLength(12);
    });

    it("honours an explicit target set and rejects unknown targets", () => {
      const sa = getSolarArcDirections({ ...base(), target: at(20), targets: ["Sun", "mc"] });
      expect(Object.keys(sa.directed)).toEqual(["sun", "mc"]);
      expect(sa.method.targetSet).toEqual(["sun", "mc"]);
      expect(() => getSolarArcDirections({ ...base(), target: at(20), targets: ["vulcan"] })).toThrow(/unknown target/);
    });

    it("naibod arc option is 0.985647 deg per year of age", () => {
      const sa = getSolarArcDirections({ ...base(), target: at(50), arcKind: "naibod" });
      expect(sa.arcDegrees).toBeCloseTo(NAIBOD_RATE_DEGREES_PER_YEAR * 50, 9);
      expect(sa.progressedSunLongitude).toBeNull();
      const trueArc = getSolarArcDirections({ ...base(), target: at(50) }).arcDegrees;
      expect(Math.abs(sa.arcDegrees - trueArc)).toBeLessThan(2); // same order, not identical
    });

    it("directed points feed the aspect functions (directed Sun trines natal Sun at arc ~120)", () => {
      const sa = getSolarArcDirections({ ...base(), target: at(35), targets: ["sun"] });
      const edges = computeSynastryAspects(sa.points, { sun: { longitude: natal.planets.sun.longitude } });
      expect(edges.length).toBe(0); // ~35 degrees of arc: no major aspect, sanity of the pipeline
      const edges2 = computeSynastryAspects(sa.points, { sun: { longitude: sa.directed.sun.longitude + 120 } });
      expect(edges2[0].aspect).toBe("trine");
    });
  });
});
