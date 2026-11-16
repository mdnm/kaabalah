/**
 * LAYER 1: unit and invariant tests (synthetic inputs, independent expectations).
 * See reference.test.ts for layer 2 (numerical reference) and the module's
 * JYOTISH_METHODS for layer 3 (private fixtures, never committed).
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  CalcFlag,
  closeSwissEph,
  calculatePlanetaryPositions,
  calculateBodyAtJulianDay,
  getSwissEph,
  withSiderealMode,
  Planet,
  calculateHouses,
} from "../swisseph";
import {
  DASHA_YEAR_LENGTH_REFERENCES,
  DHRUVA_CONSTANTS,
  NAKSHATRA_IDS,
  NAKSHATRA_WIDTH_DEGREES,
  VIMSHOTTARI_YEARS,
  calculateCharaKarakas,
  calculateDhruvaChart,
  calculateLahiriChart,
  dhruvaKetuFromRahu,
  dhruvaLagnaFromAscendant,
  dhruvaPlacementFromRightAscension,
  ecliptic0ToDeclination,
  ecliptic0ToRightAscension,
  findActiveDasha,
  generateDashaSchedule,
  generateVimshottariDasha,
  generateYoginiDasha,
  getDhruvaOrigin,
  getJyotishChart,
  icrsToFk5OfDate,
  nakshatraFromPosition,
  precessionMatrixJ2000ToDate,
  signedAngleBetween,
  taiMinusUtcSeconds,
  utcJdToTtJd,
  type DhruvaOrigin,
  type DhruvaPoint,
  type KarakaInput,
} from "./index";

const W = NAKSHATRA_WIDTH_DEGREES;

describe("frames", () => {
  it("TT - UTC is 64.184 s at 2000-01-01 12:00 and 69.184 s from 2017; 0 + 32.184 before 1960", () => {
    expect(taiMinusUtcSeconds(2451545.0)).toBe(32);
    expect((utcJdToTtJd(2451545.0) - 2451545.0) * 86400).toBeCloseTo(64.184, 4);
    expect(taiMinusUtcSeconds(2460000.5)).toBe(37);
    expect(taiMinusUtcSeconds(2415020.5)).toBe(0); // 1900
    expect(taiMinusUtcSeconds(2441317.5)).toBe(10); // 1972-01-01
    expect(taiMinusUtcSeconds(2441317.4)).toBeCloseTo(4.21317 + (41316.9 - 39126) * 0.002592, 4); // last rubber-second value
  });

  it("precession matrix is a proper rotation and is the identity at J2000", () => {
    const m = precessionMatrixJ2000ToDate(2470000.5);
    const dot = (i: number, j: number) => m[i * 3] * m[j * 3] + m[i * 3 + 1] * m[j * 3 + 1] + m[i * 3 + 2] * m[j * 3 + 2];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) expect(dot(i, j)).toBeCloseTo(i === j ? 1 : 0, 12);
    const det =
      m[0] * (m[4] * m[8] - m[5] * m[7]) - m[1] * (m[3] * m[8] - m[5] * m[6]) + m[2] * (m[3] * m[7] - m[4] * m[6]);
    expect(det).toBeCloseTo(1, 12);
    const id = precessionMatrixJ2000ToDate(2451545.0);
    [1, 0, 0, 0, 1, 0, 0, 0, 1].forEach((v, i) => expect(id[i]).toBeCloseTo(v, 12));
  });

  it("GC right ascension advances by the textbook general precession (~1.59 deg per century)", () => {
    // m + n sin(RA) tan(Dec) with m = 46.1"/yr, n = 20.04"/yr for RA 266.4, Dec -28.9.
    const a = icrsToFk5OfDate(266.40499, -28.93617, 2451545.0).rightAscension;
    const b = icrsToFk5OfDate(266.40499, -28.93617, 2451545.0 + 36525).rightAscension;
    expect(signedAngleBetween(b, a)).toBeGreaterThan(1.57);
    expect(signedAngleBetween(b, a)).toBeLessThan(1.61);
  });

  it("at J2000 the ICRS->FK5 shift is only the ~tens of mas frame bias", () => {
    const g = icrsToFk5OfDate(266.40499, -28.93617, 2451545.0);
    expect(Math.abs(signedAngleBetween(g.rightAscension, 266.40499))).toBeLessThan(1e-4);
    expect(Math.abs(g.declination + 28.93617)).toBeLessThan(1e-4);
  });

  it("ecliptic beta=0 point to equator: cardinal points and quadrants", () => {
    const eps = 23.4;
    expect(ecliptic0ToRightAscension(0, eps)).toBeCloseTo(0, 12);
    expect(ecliptic0ToRightAscension(90, eps)).toBeCloseTo(90, 12);
    expect(ecliptic0ToRightAscension(180, eps)).toBeCloseTo(180, 12);
    expect(ecliptic0ToRightAscension(270, eps)).toBeCloseTo(270, 12);
    expect(ecliptic0ToDeclination(90, eps)).toBeCloseTo(eps, 12);
    // tan(RA) = tan(lon) cos(eps) in quadrant 3
    const ra = ecliptic0ToRightAscension(225, eps);
    expect(Math.tan((ra * Math.PI) / 180)).toBeCloseTo(Math.cos((eps * Math.PI) / 180), 12);
    expect(ra).toBeGreaterThan(180);
    expect(ra).toBeLessThan(270);
  });
});

describe("nakshatra sectors and padas", () => {
  it("27 sectors of 40/3 degrees tile 360 degrees; lords cycle through the nine Vimshottari lords", () => {
    expect(W * 27).toBeCloseTo(360, 12);
    for (let i = 0; i < 27; i++) {
      const p = nakshatraFromPosition(i * W + 1e-6);
      expect(p.nakshatraIndex).toBe(i);
      expect(p.nakshatraId).toBe(NAKSHATRA_IDS[i]);
    }
    expect(VIMSHOTTARI_YEARS.reduce((a, b) => a + b, 0)).toBe(120);
    expect(nakshatraFromPosition(0).lord).toBe("ketu");
    expect(nakshatraFromPosition(9 * W + 1e-6).lord).toBe("ketu");
    expect(nakshatraFromPosition(26 * W + 1e-6).lord).toBe("mercury");
  });

  it("sector and pada boundaries are half-open", () => {
    expect(nakshatraFromPosition(0)).toMatchObject({ nakshatraIndex: 0, pada: 1, elapsedFraction: 0 });
    expect(nakshatraFromPosition(W - 1e-9)).toMatchObject({ nakshatraIndex: 0, pada: 4 });
    expect(nakshatraFromPosition(W + 1e-9)).toMatchObject({ nakshatraIndex: 1, pada: 1 });
    for (let k = 1; k < 4; k++) {
      expect(nakshatraFromPosition((k * W) / 4 - 1e-9).pada).toBe(k);
      expect(nakshatraFromPosition((k * W) / 4 + 1e-9).pada).toBe(k + 1);
    }
    expect(nakshatraFromPosition(360 - 1e-9)).toMatchObject({ nakshatraIndex: 26, pada: 4 });
  });

  it("wraps at 360 and keeps fractional progress", () => {
    expect(nakshatraFromPosition(360).nakshatraIndex).toBe(0);
    expect(nakshatraFromPosition(-1e-9).nakshatraIndex).toBe(26);
    expect(nakshatraFromPosition(W * 5.25).elapsedFraction).toBeCloseTo(0.25, 12);
  });

  it("RA wrap at 0/360 around the zero point", () => {
    const origin = { zeroRightAscension: 350 };
    expect(dhruvaPlacementFromRightAscension(5, origin)).toMatchObject({ nakshatraIndex: 1 }); // nakPos 15
    expect(dhruvaPlacementFromRightAscension(349.9, origin).nakshatraIndex).toBe(26); // nakPos 359.9
    expect(dhruvaPlacementFromRightAscension(350, origin).nakshatraIndex).toBe(0);
    expect(dhruvaPlacementFromRightAscension(-10, origin).nakPos).toBeCloseTo(0, 9);
    expect(dhruvaPlacementFromRightAscension(375, origin).rightAscension).toBeCloseTo(15, 9);
  });

  it("zero-latitude projection is a different point from the actual RA (synthetic latitude shift)", () => {
    // A body at ecliptic lon 100, lat +4.5, obliquity 23.44: the actual RA (independent spherical formula)
    // differs from the beta=0 RA by ~0.38 deg, which flips pada/nakshatra labels near a boundary
    // (see the Mercury fixtures in reference.test.ts for real instants).
    const eps = (23.44 * Math.PI) / 180, lon = (100 * Math.PI) / 180, lat = (4.5 * Math.PI) / 180;
    const ra = Math.atan2(Math.sin(lon) * Math.cos(eps) - Math.tan(lat) * Math.sin(eps), Math.cos(lon)) * (180 / Math.PI);
    const ra0 = ecliptic0ToRightAscension(100, 23.44);
    expect(Math.abs(signedAngleBetween(ra, ra0))).toBeGreaterThan(0.3);
    expect(Math.abs(signedAngleBetween(ra, ra0))).toBeLessThan(0.5);
  });
});

describe("Dhruva helpers", () => {
  const origin = { zeroRightAscension: 100 } as DhruvaOrigin;
  const rahu = {
    ...dhruvaPlacementFromRightAscension(200, origin), declination: 10, longitude: 205, latitude: 0,
    tropical: { signIndex: 6, sign: "Libra", degreeInSign: 25 },
  } as DhruvaPoint;

  it("Ketu is the exact antipode of Rahu in RA, declination and nakPos", () => {
    const ketu = dhruvaKetuFromRahu(rahu, origin, "mean");
    expect(ketu.rightAscension).toBeCloseTo(20, 12);
    expect(ketu.declination).toBe(-10);
    expect(ketu.nakPos).toBeCloseTo((rahu.nakPos + 180) % 360, 12);
    expect(ketu.longitude).toBeCloseTo(25, 12);
    expect(ketu.derivedFrom).toBe("mean_node antipode");
  });

  it("lagna is the RA of the ecliptic ASC point (beta 0) with true obliquity, never ASC minus an ayanamsa", () => {
    const l = dhruvaLagnaFromAscendant(30, 23.44, { zeroRightAscension: 0 } as DhruvaOrigin);
    expect(l.rightAscension).toBeCloseTo(ecliptic0ToRightAscension(30, 23.44), 12);
    expect(l.latitude).toBe(0);
    expect(Math.abs(signedAngleBetween(l.rightAscension, 30))).toBeGreaterThan(0.5);
  });

  it("constants are explicit and as supplied", () => {
    expect(DHRUVA_CONSTANTS).toMatchObject({
      gcIcrsRightAscension: 266.40499, gcIcrsDeclination: -28.93617, anchorOffsetDegrees: 246 + 2 / 3, yearLengthDays: 365.2422,
    });
    expect(DHRUVA_CONSTANTS.sectorWidthDegrees).toBe(40 / 3);
    const o = getDhruvaOrigin(2451545.0);
    expect(o.zeroRightAscension).toBeCloseTo((o.gcRightAscensionOfDate - (246 + 2 / 3) + 360) % 360, 12);
  });
});

describe("chara karakas", () => {
  const base: KarakaInput[] = [
    { body: "sun", degreeInSign: 12.5 },
    { body: "moon", degreeInSign: 3.25 },
    { body: "mars", degreeInSign: 28.1 },
    { body: "mercury", degreeInSign: 19.9 },
    { body: "jupiter", degreeInSign: 0.5 },
    { body: "venus", degreeInSign: 7.75 },
    { body: "saturn", degreeInSign: 22.0 },
    { body: "rahu", degreeInSign: 4.0 },
  ];

  it("7-karaka: descending degree in sign, Rahu excluded, standard names", () => {
    const r = calculateCharaKarakas(base, { scheme: 7, degreeFrame: "tropical" });
    expect(r.entries.map((e) => e.body)).toEqual(["mars", "saturn", "mercury", "sun", "venus", "moon", "jupiter"]);
    expect(r.entries.map((e) => e.karaka)).toEqual([
      "Atmakaraka", "Amatyakaraka", "Bhratrukaraka", "Matrukaraka", "Putrakaraka", "Gnatikaraka", "Darakaraka",
    ]);
    expect(r.entries[0]).toMatchObject({ rankingValue: 28.1, abbreviation: "AK" });
    expect(r.degreeFrame).toBe("tropical");
    expect(r.rahuConvention).toBeUndefined();
  });

  it("8-karaka: Rahu ranks by 30 - degree and Pitrukaraka appears", () => {
    const r = calculateCharaKarakas(base, { scheme: 8, degreeFrame: "sidereal", node: "true" });
    const rahu = r.entries.find((e) => e.body === "rahu")!;
    expect(rahu.rankingValue).toBe(26);
    expect(r.entries.map((e) => e.body)).toEqual(["mars", "rahu", "saturn", "mercury", "sun", "venus", "moon", "jupiter"]);
    expect(r.entries[4].karaka).toBe("Pitrukaraka");
    expect(r.entries[7].karaka).toBe("Darakaraka");
    expect(r.rahuConvention).toEqual({ node: "true", rankingValue: "30 - degreeInSign" });
  });

  it("ties are flagged, grouped, and ordered canonically", () => {
    const tied = base.map((b) => (b.body === "moon" ? { ...b, degreeInSign: 12.5 } : b));
    const r = calculateCharaKarakas(tied, { scheme: 7, degreeFrame: "tropical" });
    const iSun = r.entries.findIndex((e) => e.body === "sun");
    expect(r.entries[iSun].body).toBe("sun");
    expect(r.entries[iSun + 1].body).toBe("moon");
    expect(r.entries[iSun].tied && r.entries[iSun + 1].tied).toBe(true);
    expect(r.tieGroups).toEqual([["sun", "moon"]]);
    expect(r.entries.filter((e) => e.tied)).toHaveLength(2);
  });

  it("rejects incomplete or out-of-range input", () => {
    expect(() => calculateCharaKarakas(base.slice(0, 5), { scheme: 7, degreeFrame: "tropical" })).toThrow();
    expect(() => calculateCharaKarakas(base.map((b) => ({ ...b, degreeInSign: 31 })), { scheme: 7, degreeFrame: "tropical" })).toThrow();
  });
});

describe("dashas", () => {
  const birth = new Date("2000-01-01T12:00:00Z");
  const Y = 365.2422;
  const MS = 86400000;
  const common = { birth, yearLengthDays: Y };

  it("Vimshottari: nine mahas sum to exactly 120 years; contiguous; antars sum to the maha", () => {
    const s = generateVimshottariDasha({ ...common, moonNakshatraIndex: 3, moonElapsedFraction: 0.4, includePreBirthAntars: true, through: new Date("2200-01-01T00:00:00Z") });
    const nine = s.mahas.slice(0, 9);
    expect(nine[8].endJd - nine[0].startJd).toBeCloseTo(120 * Y, 6);
    expect(nine.map((m) => m.lord)).toEqual(["moon", "mars", "rahu", "jupiter", "saturn", "mercury", "ketu", "venus", "sun"]);
    for (let i = 0; i < nine.length; i++) {
      const m = nine[i];
      expect(m.endJd - m.startJd).toBeCloseTo(m.years * Y, 8);
      if (i > 0) expect(m.startJd).toBe(nine[i - 1].endJd);
      expect(m.antars).toHaveLength(9);
      expect(m.antars![0].lord).toBe(m.lord);
      expect(m.antars!.reduce((a, x) => a + (x.endJd - x.startJd), 0)).toBeCloseTo(m.endJd - m.startJd, 8);
      expect(m.antars![0].startJd).toBe(m.startJd);
      expect(m.antars![8].endJd).toBeCloseTo(m.endJd, 8);
      m.antars!.forEach((a, k) => k > 0 && expect(a.startJd).toBe(m.antars![k - 1].endJd));
    }
  });

  it("Yogini: eight mahas sum to 36 years; start index follows (number + 3) mod 8", () => {
    const s = generateYoginiDasha({ ...common, moonNakshatraIndex: 5 /* Ardra, number 6 -> Mangala */, moonElapsedFraction: 0, through: new Date("2100-01-01T00:00:00Z") });
    expect(s.mahas[0].lord).toBe("mangala");
    expect(s.mahas.slice(0, 8).reduce((a, m) => a + m.years, 0)).toBe(36);
    expect(s.mahas[7].endJd - s.mahas[0].startJd).toBeCloseTo(36 * Y, 6);
    expect(generateYoginiDasha({ ...common, moonNakshatraIndex: 0, moonElapsedFraction: 0 }).mahas[0].lord).toBe("bhramari"); // Ashwini
    expect(generateYoginiDasha({ ...common, moonNakshatraIndex: 4, moonElapsedFraction: 0 }).mahas[0].lord).toBe("sankata"); // Mrigashira, 5+3=8
  });

  it("first maha keeps its pre-birth start and the birth balance matches the elapsed fraction", () => {
    const s = generateVimshottariDasha({ ...common, moonNakshatraIndex: 1 /* venus, 20 y */, moonElapsedFraction: 0.25 });
    const first = s.mahas[0];
    expect(first.lord).toBe("venus");
    expect(first.startsBeforeBirth).toBe(true);
    expect(s.birthJd - first.startJd).toBeCloseTo(0.25 * 20 * Y, 8);
    expect(first.endJd - s.birthJd).toBeCloseTo(0.75 * 20 * Y, 8);
    expect(s.balance).toMatchObject({ lord: "venus", mahaYears: 20, elapsedFraction: 0.25, remainingFraction: 0.75 });
    expect(s.balance.remainingYears).toBeCloseTo(15, 12);
    expect(s.balance.remainingDays).toBeCloseTo(15 * Y, 8);
    expect(s.mahas[1].startsBeforeBirth).toBe(false);
    // antars that ended before birth are dropped; the first kept one may start before birth
    expect(first.antars![0].endJd).toBeGreaterThan(s.birthJd);
    expect(first.antars!.some((a) => a.startsBeforeBirth)).toBe(true);
    const all = generateVimshottariDasha({ ...common, moonNakshatraIndex: 1, moonElapsedFraction: 0.25, includePreBirthAntars: true });
    expect(all.mahas[0].antars).toHaveLength(9);
  });

  it("zero elapsed fraction starts the first maha exactly at birth", () => {
    const s = generateVimshottariDasha({ ...common, moonNakshatraIndex: 0, moonElapsedFraction: 0 });
    expect(s.mahas[0].startJd).toBe(s.birthJd);
    expect(s.mahas[0].startsBeforeBirth).toBe(false);
  });

  it("intervals are half-open: a boundary belongs to the period that starts there", () => {
    const s = generateVimshottariDasha({ ...common, moonNakshatraIndex: 0, moonElapsedFraction: 0 });
    const [m0, m1] = s.mahas;
    expect(findActiveDasha(s, m0.startJd)!.maha.lord).toBe("ketu");
    expect(findActiveDasha(s, m0.endJd - 1e-6)!.maha.lord).toBe("ketu");
    expect(findActiveDasha(s, m0.endJd)!.maha.lord).toBe("venus");
    expect(findActiveDasha(s, m0.endJd)!.maha).toBe(m1);
    const a = m0.antars!;
    expect(findActiveDasha(s, a[0].endJd)!.antar).toBe(a[1]);
    expect(findActiveDasha(s, a[0].endJd - 1e-6)!.antar).toBe(a[0]);
    // outside the generated range
    expect(findActiveDasha(s, s.mahas[s.mahas.length - 1].endJd)).toBeUndefined();
    expect(findActiveDasha(s, new Date(birth.getTime() - MS))).toBeUndefined();
    // Date input agrees with JD input
    expect(findActiveDasha(s, new Date(birth.getTime() + 46 * 365 * MS))!.maha.lord).toBe("mars");
  });

  it("generation is bounded and inputs are validated", () => {
    const capped = generateVimshottariDasha({ ...common, moonNakshatraIndex: 0, moonElapsedFraction: 0, through: new Date("2900-01-01T00:00:00Z"), maxMahaPeriods: 5 });
    expect(capped.mahas).toHaveLength(5);
    expect(capped.truncated).toBe(true);
    expect(generateVimshottariDasha({ ...common, moonNakshatraIndex: 0, moonElapsedFraction: 0 }).truncated).toBe(false);
    expect(() => generateVimshottariDasha({ ...common, yearLengthDays: 0, moonNakshatraIndex: 0, moonElapsedFraction: 0 })).toThrow();
    expect(() => generateVimshottariDasha({ ...common, moonNakshatraIndex: 27, moonElapsedFraction: 0 })).toThrow();
    expect(() => generateVimshottariDasha({ ...common, moonNakshatraIndex: 0, moonElapsedFraction: 1 })).toThrow();
    expect(() => generateDashaSchedule({ ...common, system: "x" as never, moonNakshatraIndex: 0, moonElapsedFraction: 0 })).toThrow();
  });

  it("year length is explicit and named references are exposed", () => {
    expect(DASHA_YEAR_LENGTH_REFERENCES).toEqual({ dhruva: 365.2422, lahiriReference: 365.25 });
    const a = generateVimshottariDasha({ birth, moonNakshatraIndex: 0, moonElapsedFraction: 0, yearLengthDays: 365.2422 });
    const b = generateVimshottariDasha({ birth, moonNakshatraIndex: 0, moonElapsedFraction: 0, yearLengthDays: 365.25 });
    expect(b.mahas[0].endJd - a.mahas[0].endJd).toBeCloseTo(7 * (365.25 - 365.2422), 9);
  });
});

describe("ephemeris-backed Jyotish", () => {
  const date = new Date("1987-06-15T10:20:30Z");
  const lat = 52.3, lon = 4.9;

  beforeAll(async () => {
    await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
  });
  afterAll(() => closeSwissEph());

  it("tropical results are bit-identical before and after interleaved sidereal calls", async () => {
    const before = await calculatePlanetaryPositions(date);
    const beforeSun = calculateBodyAtJulianDay(2446961.9, Planet.SUN, CalcFlag.SWISS_EPH | CalcFlag.SPEED);
    const results = await Promise.all([
      calculatePlanetaryPositions(date),
      Promise.resolve().then(() => calculateLahiriChart({ date, latitude: lat, longitude: lon })),
      calculatePlanetaryPositions(date),
      Promise.resolve().then(() => calculateLahiriChart({ date, latitude: lat, longitude: lon, node: "true" })),
      calculatePlanetaryPositions(date),
    ]);
    const after = await calculatePlanetaryPositions(date);
    expect(results[0]).toEqual(before);
    expect(results[2]).toEqual(before);
    expect(results[4]).toEqual(before);
    expect(after).toEqual(before);
    expect(calculateBodyAtJulianDay(2446961.9, Planet.SUN, CalcFlag.SWISS_EPH | CalcFlag.SPEED)).toEqual(beforeSun);
    // and the sidereal chart itself is unaffected by tropical calls in between
    const l1 = calculateLahiriChart({ date, latitude: lat, longitude: lon });
    await calculatePlanetaryPositions(date);
    const l2 = calculateLahiriChart({ date, latitude: lat, longitude: lon });
    expect(l2).toEqual(l1);
  });

  it("withSiderealMode restores state even when the callback throws or another mode was used", () => {
    const before = calculateLahiriChart({ date, latitude: lat, longitude: lon });
    expect(() => withSiderealMode(3, () => { throw new Error("boom"); })).toThrow("boom");
    withSiderealMode(3, () => calculateBodyAtJulianDay(2446961.9, Planet.SUN, CalcFlag.SWISS_EPH | CalcFlag.SIDEREAL));
    expect(calculateLahiriChart({ date, latitude: lat, longitude: lon })).toEqual(before);
    // an async callback is refused
    expect(() => withSiderealMode(1, (() => Promise.resolve(1)) as never)).toThrow(/synchronous/);
  });

  it("Dhruva: tropical rasis equal the library's tropical longitudes and do not depend on the nakshatra frame", async () => {
    const trop = await calculatePlanetaryPositions(date);
    const chart = calculateDhruvaChart({ date, latitude: lat, longitude: lon });
    expect(chart.points.sun!.longitude).toBeCloseTo(trop[Planet.SUN].longitude, 9);
    expect(chart.points.moon!.tropical.signIndex).toBe(Math.floor(trop[Planet.MOON].longitude / 30));
    const d = getJyotishChart({ date, latitude: lat, longitude: lon, nakshatraFrame: "dhruva" });
    const l = getJyotishChart({ date, latitude: lat, longitude: lon, nakshatraFrame: "lahiri" });
    expect(l.dhruva.points).toEqual(d.dhruva.points);
    for (const id of ["sun", "moon", "mars"] as const) {
      expect(l.dhruva.points[id]!.tropical).toEqual(d.dhruva.points[id]!.tropical);
    }
    // tropical houses are untouched by either chart
    const h1 = await calculateHouses(date, lat, lon, "P" as never, { treatAsUTC: true });
    getJyotishChart({ date, latitude: lat, longitude: lon });
    expect(await calculateHouses(date, lat, lon, "P" as never, { treatAsUTC: true })).toEqual(h1);
    // Dhruva nakshatra is not tropical longitude minus Lahiri
    const lahiriMoon = l.lahiri.points.moon!;
    expect(`${d.dhruva.points.moon!.nakshatraId}-${d.dhruva.points.moon!.pada}`).toBeDefined();
    expect(Math.abs(signedAngleBetween(d.dhruva.points.moon!.nakPos, lahiriMoon.longitude))).toBeGreaterThan(0.01);
  });

  it("Dhruva nodes: latitude-0 points, Ketu antipodes, mean primary with a true-node variant", () => {
    const c = calculateDhruvaChart({ date, latitude: lat, longitude: lon });
    expect(c.nodeConvention).toBe("mean");
    expect(c.points.rahu).toEqual(c.nodeVariants.mean.rahu);
    expect(c.nodeVariants.mean.rahu.latitude).toBeCloseTo(0, 9);
    for (const v of ["mean", "true"] as const) {
      const { rahu, ketu } = c.nodeVariants[v];
      expect(signedAngleBetween(ketu.rightAscension, rahu.rightAscension + 180)).toBeCloseTo(0, 9);
      expect(signedAngleBetween(ketu.nakPos, rahu.nakPos + 180)).toBeCloseTo(0, 9);
      expect(ketu.declination).toBeCloseTo(-rahu.declination, 9);
    }
    expect(c.nodeVariants.true.rahu.rightAscension).not.toBe(c.nodeVariants.mean.rahu.rightAscension);
    expect(calculateDhruvaChart({ date, latitude: lat, longitude: lon, node: "true" }).points.rahu).toEqual(c.nodeVariants.true.rahu);
  });

  it("Dhruva lagna is consistent: converting (RA, Dec) back to the ecliptic gives the tropical ASC at beta 0", async () => {
    const c = calculateDhruvaChart({ date, latitude: lat, longitude: lon });
    const lagna = c.points.lagna!;
    const eps = (c.trueObliquity! * Math.PI) / 180;
    const ra = (lagna.rightAscension * Math.PI) / 180, dec = (lagna.declination * Math.PI) / 180;
    const lamBack = (Math.atan2(Math.sin(ra) * Math.cos(eps) + Math.tan(dec) * Math.sin(eps), Math.cos(ra)) * 180) / Math.PI;
    const asc = (await calculateHouses(date, lat, lon, "P" as never, { treatAsUTC: true })).ascendant;
    expect(Math.abs(signedAngleBetween(lamBack, asc))).toBeLessThan(1e-9);
    expect(c.trueObliquity!).toBeGreaterThan(23.3);
    expect(c.trueObliquity!).toBeLessThan(23.6);
  });

  it("Lahiri: sidereal = tropical - ayanamsa for planets and ascendant; whole-sign houses", async () => {
    const trop = await calculatePlanetaryPositions(date);
    const asc = (await calculateHouses(date, lat, lon, "P" as never, { treatAsUTC: true })).ascendant;
    const c = calculateLahiriChart({ date, latitude: lat, longitude: lon });
    expect(c.ayanamsa).toBeGreaterThan(23.5);
    expect(c.ayanamsa).toBeLessThan(23.9); // Lahiri ~23.7 deg in 1987
    expect(Math.abs(signedAngleBetween(trop[Planet.MOON].longitude - c.ayanamsa, c.points.moon!.longitude))).toBeLessThan(1e-8);
    expect(Math.abs(signedAngleBetween(asc - c.ayanamsa, c.ascendant!.longitude))).toBeLessThan(1e-8);
    expect(c.ascendant!.wholeSignHouse).toBe(1);
    expect(c.wholeSignHouses).toHaveLength(12);
    expect(c.wholeSignHouses[0].signIndex).toBe(Math.floor(c.ascendant!.longitude / 30));
    for (const p of Object.values(c.points)) {
      expect(p!.wholeSignHouse).toBe(((Math.floor(p!.longitude / 30) - c.wholeSignHouses[0].signIndex + 12) % 12) + 1);
      expect(p!.nakPos).toBeCloseTo(p!.longitude, 9); // ecliptic sidereal nakshatras
    }
    expect(c.points.ketu!.longitude).toBeCloseTo((c.points.rahu!.longitude + 180) % 360, 9);
  });

  it("untimed charts exclude Moon, lagna, karakas and dashas", () => {
    const j = getJyotishChart({ date, latitude: lat, longitude: lon, timed: false });
    expect(j.dhruva.points.moon).toBeUndefined();
    expect(j.dhruva.points.lagna).toBeUndefined();
    expect(j.lahiri.points.moon).toBeUndefined();
    expect(j.lahiri.ascendant).toBeUndefined();
    expect(j.karakas).toBeUndefined();
    expect(j.vimshottari).toBeUndefined();
    expect(j.yogini).toBeUndefined();
  });

  it("getJyotishChart: frame-specific dasha seeds, default year lengths and metadata", () => {
    const d = getJyotishChart({ date, latitude: lat, longitude: lon });
    const l = getJyotishChart({ date, latitude: lat, longitude: lon, nakshatraFrame: "lahiri", karakaScheme: 8, node: "true" });
    expect(d.yearLengthDays).toBe(365.2422);
    expect(l.yearLengthDays).toBe(365.25);
    expect(d.vimshottari!.moonNakshatra.index).toBe(d.dhruva.points.moon!.nakshatraIndex);
    expect(d.vimshottari!.moonNakshatra.elapsedFraction).toBe(d.dhruva.points.moon!.elapsedFraction);
    expect(l.vimshottari!.moonNakshatra.index).toBe(l.lahiri.points.moon!.nakshatraIndex);
    expect(d.vimshottari!.balance.lord).toBe(d.dhruva.points.moon!.lord);
    expect(d.karakas!.scheme).toBe(7);
    expect(d.karakas!.degreeFrame).toBe("tropical");
    expect(l.karakas!.scheme).toBe(8);
    expect(l.karakas!.degreeFrame).toBe("sidereal");
    expect(l.karakas!.rahuConvention!.node).toBe("true");
    expect(d.method.dhruva.notEquivalentTo).toContain("Swiss sidereal mode 36");
    expect(getJyotishChart({ date, latitude: lat, longitude: lon, yearLengthDays: 360 }).yogini!.yearLengthDays).toBe(360);
    expect(findActiveDasha(d.vimshottari!, date)!.maha.lord).toBe(d.dhruva.points.moon!.lord);
  });

  it("rejects invalid coordinates", () => {
    expect(() => calculateDhruvaChart({ date, latitude: 91, longitude: 0 })).toThrow();
    expect(() => calculateLahiriChart({ date, latitude: 0, longitude: 181 })).toThrow();
  });
});
