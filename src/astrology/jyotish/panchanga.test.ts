import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { closeSwissEph, getSwissEph } from "../swisseph";
import { findLunations } from "../lunations";
import {
  dayPartOfPlanet,
  jovianSamvatsaraBrihatSamhita,
  jovianSamvatsaraSuryaSiddhanta,
  samvatsaraOfShakaYear,
  getPanchanga,
  karanaFromElongation,
  nityaYogaFromSum,
  tithiFromElongation,
  type LimbSpan,
  type Panchanga,
  type PanchangaOptions,
} from "./panchanga";

const MINUTE = 60_000;
const UJJAIN = { latitude: 23.1765, longitude: 75.7885, timeZoneSettings: { timeZone: "Asia/Kolkata" } };

// Indices used below (0-based): nakshatra Rohini 3, Mrigashira 4; masa Ashvina 6, Kartika 7,
// Margashirsha 8, Pausha 9, Magha 10, Phalguna 11, Chaitra 0, Jyeshtha 2, Shravana 4; planets as
// weekdays, Sun 0 ... Saturn 6.

function available(options: PanchangaOptions): Panchanga {
  const result = getPanchanga(options);
  if (!result.available) throw new Error(`expected a panchanga, got ${result.reason}`);
  return result;
}

/** "2026-11-25 16:50" in IST as an instant. */
const ist = (local: string) => new Date(`${local.replace(" ", "T")}:00+05:30`);

/** Published times are truncated to the minute: ours must fall inside that minute (1 s slack). */
function expectWithinPrintedMinute(actual: Date, printedIst: string) {
  const printed = ist(printedIst).getTime();
  expect(actual.getTime()).toBeGreaterThanOrEqual(printed - 1000);
  expect(actual.getTime()).toBeLessThan(printed + MINUTE + 1000);
}

/**
 * Times derived from the sunrise depend on the city's exact coordinates (not printed) and on
 * rounding, so they get one minute either side of the printed minute.
 */
function expectNearPrintedMinute(actual: Date, printedIst: string) {
  const printed = ist(printedIst).getTime();
  expect(Math.abs(actual.getTime() - (printed + MINUTE / 2))).toBeLessThan(1.5 * MINUTE);
}

/** Each span's limb number (1-based) and its printed start and end. */
function expectSpans<T extends { index: number }>(spans: LimbSpan<T>[], expected: [number, string, string][]) {
  expect(spans.map((s) => s.value.index + 1)).toEqual(expected.map(([n]) => n));
  spans.forEach((span, i) => {
    expectWithinPrintedMinute(span.start, expected[i][1]);
    expectWithinPrintedMinute(span.end, expected[i][2]);
  });
}

describe("panchanga classification (pure)", () => {
  it("numbers tithis 1..30 and splits the pakshas at the full moon", () => {
    expect(tithiFromElongation(0)).toMatchObject({ number: 1, paksha: "shukla", pakshaNumber: 1 });
    expect(tithiFromElongation(12).number).toBe(2);
    expect(tithiFromElongation(179.9)).toMatchObject({ number: 15, paksha: "shukla", pakshaNumber: 15 });
    expect(tithiFromElongation(180)).toMatchObject({ number: 16, paksha: "krishna", pakshaNumber: 1 });
    expect(tithiFromElongation(359.99)).toMatchObject({ number: 30, pakshaNumber: 15 });
    expect(tithiFromElongation(-6).number).toBe(30);
    expect(tithiFromElongation(6).elapsedFraction).toBeCloseTo(0.5, 12);
  });

  it("gives four fixed karanas and a movable cycle of seven repeated eight times", () => {
    const karanas = Array.from({ length: 60 }, (_, i) => karanaFromElongation(i * 6 + 3));
    expect(karanas.map((k) => k.index)).toEqual(Array.from({ length: 60 }, (_, i) => i));
    expect(karanas.filter((k) => k.kind === "fixed").map((k) => k.index)).toEqual([0, 57, 58, 59]);
    for (let i = 1; i + 7 <= 56; i++) expect(karanas[i + 7].name).toBe(karanas[i].name);
    expect(new Set(karanas.slice(1, 8).map((k) => k.name)).size).toBe(7);
  });

  it("counts the nitya yogas from 0 degrees of (Sun + Moon), wrapping at 360", () => {
    expect(nityaYogaFromSum(0).index).toBe(0);
    expect(nityaYogaFromSum(40 / 3).index).toBe(1);
    expect(nityaYogaFromSum(359.999).index).toBe(26);
    expect(nityaYogaFromSum(720 + 1).index).toBe(0);
  });

  it("gives Gulika and Yamaganda in the published eighths of the day for every weekday", () => {
    // Almanac tables: Gulika Sun 7 ... Sat 1; Yamaganda Sun 5, Mon 4, Tue 3, Wed 2, Thu 1, Fri 7, Sat 6.
    expect([0, 1, 2, 3, 4, 5, 6].map((w) => dayPartOfPlanet(w, 6))).toEqual([7, 6, 5, 4, 3, 2, 1]);
    expect([0, 1, 2, 3, 4, 5, 6].map((w) => dayPartOfPlanet(w, 4))).toEqual([5, 4, 3, 2, 1, 7, 6]);
  });
});

describe("getPanchanga", () => {
  beforeAll(async () => {
    await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
  });
  afterAll(() => {
    closeSwissEph();
  });

  // Reference: Prokerala day panchang, Ujjain, Wednesday 25 November 2026 (Lahiri ayanamsa),
  // https://www.prokerala.com/astrology/panchang/2026-november-25.html, times IST truncated to the minute.
  describe("Ujjain, 25 November 2026", () => {
    const p = () => available({ date: ist("2026-11-25 12:00"), ...UJJAIN });

    it("is a Wednesday from the printed sunrise to the next", () => {
      const r = p();
      expect(r.vara.weekday).toBe(3);
      expectNearPrintedMinute(r.vara.sunrise, "2026-11-25 06:51");
      expectNearPrintedMinute(r.vara.nextSunrise, "2026-11-26 06:52");
    });

    it("matches the published tithi, nakshatra, yoga and karana boundaries", () => {
      const r = p();
      expectSpans(r.tithi.spans, [
        [16, "2026-11-24 20:23", "2026-11-25 16:50"],
        [17, "2026-11-25 16:50", "2026-11-26 13:15"],
      ]);
      expectSpans(r.nakshatra.spans, [
        [4, "2026-11-24 23:25", "2026-11-25 20:36"],
        [5, "2026-11-25 20:36", "2026-11-26 17:47"],
      ]);
      expectSpans(r.yoga.spans, [
        [20, "2026-11-24 16:05", "2026-11-25 11:59"],
        [21, "2026-11-25 11:59", "2026-11-26 07:49"],
      ]);
      // Karana indices 31-33: Kaulava, Taitila, Gara of the fifth movable cycle.
      expectSpans(r.karana.spans, [
        [32, "2026-11-25 06:38", "2026-11-25 16:50"],
        [33, "2026-11-25 16:50", "2026-11-26 03:02"],
        [34, "2026-11-26 03:02", "2026-11-26 13:15"],
      ]);
    });

    it("names the day by the limbs at sunrise and reads the limbs at the date", () => {
      const r = p();
      expect(r.tithi.atSunrise.number).toBe(16);
      expect(r.tithi.atSunrise.elapsedFraction).toBeGreaterThan(0);
      expect(r.yoga.atSunrise.index).toBe(19);
      expect(r.yoga.atDate.index).toBe(20);
      const evening = available({ date: ist("2026-11-25 18:00"), ...UJJAIN });
      expect(evening.tithi.atDate.number).toBe(17);
      expect(evening.tithi.atSunrise.number).toBe(16);
    });

    it("matches the published Sarvartha Siddhi windows (Wednesday with Rohini, then Mrigashira)", () => {
      const s = p().specialYogas.sarvarthaSiddhi;
      expect(s.atSunrise).toBe(true);
      expect(s.windows.map((w) => w.nakshatra.index)).toEqual([3, 4]);
      expectNearPrintedMinute(s.windows[0].start, "2026-11-25 06:51");
      expectWithinPrintedMinute(s.windows[0].end, "2026-11-25 20:36");
      expectWithinPrintedMinute(s.windows[1].start, "2026-11-25 20:36");
      expectNearPrintedMinute(s.windows[1].end, "2026-11-26 06:52");
    });

    it("moves only the sunrise, not the limb boundaries, with the almanac sunrise", () => {
      const hindu = p();
      const almanac = available({ date: ist("2026-11-25 12:00"), ...UJJAIN, sunriseDefinition: "upper-limb-with-refraction" });
      const earlier = hindu.vara.sunrise.getTime() - almanac.vara.sunrise.getTime();
      expect(earlier).toBeGreaterThan(3 * MINUTE);
      expect(earlier).toBeLessThan(5 * MINUTE);
      expect(almanac.tithi.spans).toHaveLength(hindu.tithi.spans.length);
      almanac.tithi.spans.forEach((span, i) => {
        // Same root, bisected from a different grid: equal to the solver tolerance.
        expect(Math.abs(span.end.getTime() - hindu.tithi.spans[i].end.getTime())).toBeLessThanOrEqual(2);
      });
    });

    it("matches the published masa, ritu and years", () => {
      const r = p();
      expect(r.masa.amanta).toMatchObject({ index: 7, adhika: false, kshaya: false, sankrantis: 1 });
      expect(r.masa.purnimanta.index).toBe(8);
      expect(r.masa.ritu.index).toBe(3);
      expect(r.year).toMatchObject({ shaka: 1948, vikram: 2083, samvatsara: { number: 40 }, jovianSamvatsara: { number: 53 } });
    });

    it("matches the published Rahu Kala, Yamaganda and Gulika", () => {
      const { rahuKala, yamaganda, gulika } = p().dayPeriods;
      expect([rahuKala.part, yamaganda.part, gulika.part]).toEqual([5, 2, 4]);
      expectNearPrintedMinute(rahuKala.start, "2026-11-25 12:13");
      expectNearPrintedMinute(rahuKala.end, "2026-11-25 13:34");
      expectNearPrintedMinute(yamaganda.start, "2026-11-25 08:11");
      expectNearPrintedMinute(yamaganda.end, "2026-11-25 09:32");
      expectNearPrintedMinute(gulika.start, "2026-11-25 10:53");
      expectNearPrintedMinute(gulika.end, "2026-11-25 12:13");
    });

    it("matches the published Dur Muhurta (Wednesday: day muhurta 8) and makes Brahma muhurta proportional", () => {
      const { durMuhurtas, abhijit, brahma } = p().muhurtas;
      expect(durMuhurtas.map((m) => [m.isDay, m.number])).toEqual([[true, 8]]);
      expect(abhijit).toBe(durMuhurtas[0]);
      expectNearPrintedMinute(durMuhurtas[0].start, "2026-11-25 11:52");
      expectNearPrintedMinute(durMuhurtas[0].end, "2026-11-25 12:35");
      // 14th fifteenth of the night before: it ends one night muhurta before sunrise.
      const nightMuhurta = brahma!.end.getTime() - brahma!.start.getTime();
      expect(nightMuhurta).toBeGreaterThan(50 * MINUTE);
      expect(Math.abs(p().vara.sunrise.getTime() - brahma!.end.getTime() - nightMuhurta)).toBeLessThan(1000);
    });

    it("matches the published Varjyam and Amrit Kaal", () => {
      const r = p();
      expect(r.varjyam.map((w) => [w.nakshatra.index, w.startGhati])).toEqual([[3, 40], [4, 14]]);
      expectWithinPrintedMinute(r.varjyam[0].start, "2026-11-25 13:32");
      expectWithinPrintedMinute(r.varjyam[0].end, "2026-11-25 14:57");
      expectWithinPrintedMinute(r.varjyam[1].start, "2026-11-26 01:32");
      expectWithinPrintedMinute(r.varjyam[1].end, "2026-11-26 02:57");
      const rohini = r.amritKaal.find((w) => w.nakshatra.index === 3)!;
      expect(rohini.startGhati).toBe(52);
      expectWithinPrintedMinute(rohini.start, "2026-11-25 17:46");
      // Printed 19:10; the window ends at 19:11:0x, so allow the rounding minute.
      expectNearPrintedMinute(rohini.end, "2026-11-25 19:10");
    });

    it("matches the published choghadiya: Wednesday's first slot, Thursday's full day and night", () => {
      const { day } = p().choghadiya;
      expect(day[0].planet).toBe(3);
      expectNearPrintedMinute(day[0].start, "2026-11-25 06:51");
      expectNearPrintedMinute(day[0].end, "2026-11-25 08:11");
      // Thursday as printed: day Shubh Rog Udveg Char Labh Amrit Kaal Shubh, night Amrit Char Rog
      // Kaal Labh Udveg Shubh Amrit, as planets.
      const thursday = available({ date: ist("2026-11-26 12:00"), ...UJJAIN }).choghadiya;
      expect(thursday.day.map((s) => s.planet)).toEqual([4, 2, 0, 5, 3, 1, 6, 4]);
      expect(thursday.night.map((s) => s.planet)).toEqual([1, 5, 2, 6, 3, 0, 4, 1]);
    });
  });

  it("finds the adhika months of 2023 (Shravana) and 2026 (Jyeshtha)", () => {
    const shravana = available({ date: ist("2023-07-25 12:00"), ...UJJAIN });
    expect(shravana.masa.amanta).toMatchObject({ index: 4, adhika: true });
    expect(shravana.masa.purnimanta).toMatchObject({ index: 4, adhika: true });
    const jyeshtha = available({ date: ist("2026-06-10 12:00"), ...UJJAIN });
    expect(jyeshtha.masa.amanta).toMatchObject({ index: 2, adhika: true });
    expect(jyeshtha.masa.purnimanta).toMatchObject({ index: 2, adhika: true });
    const nija = available({ date: ist("2026-06-25 12:00"), ...UJJAIN });
    expect(nija.masa.amanta).toMatchObject({ index: 2, adhika: false });
  });

  it("finds the kshaya months of 1963 and 1983 with their adhika months", () => {
    // 1982-83: Adhika Ashvina, Kshaya Pausha (Makara and Kumbha sankrantis, 14 Jan - 13 Feb 1983), Adhika Phalguna.
    const ashvina = available({ date: ist("1982-10-01 12:00"), ...UJJAIN });
    expect(ashvina.masa.amanta).toMatchObject({ index: 6, sankrantis: 0 });
    const pausha = available({ date: ist("1983-01-25 12:00"), ...UJJAIN });
    expect(pausha.masa.amanta).toMatchObject({ index: 9, kshaya: true, sankrantis: 2 });
    expect(pausha.masa.amanta.start.toISOString().slice(0, 10)).toBe("1983-01-14");
    const phalguna = available({ date: ist("1983-02-25 12:00"), ...UJJAIN });
    expect(phalguna.masa.amanta).toMatchObject({ index: 11, sankrantis: 0 });
    // 1963-64: the month of the Vrishchika and Dhanu sankrantis (16 Nov - 16 Dec 1963).
    const kartika = available({ date: ist("1963-11-25 12:00"), ...UJJAIN });
    expect(kartika.masa.amanta).toMatchObject({ index: 7, sankrantis: 2 });
  });

  it("matches Prokerala's Shaka and Vikram samvatsara numbers for 1980-2026", () => {
    // Prokerala daily panchang, 15 June of each year: in 1980 (Shaka 1902) the Shaka year is cycle
    // number 54 and the Vikram year number 7; both advance by one each year to 2026, with no skip.
    for (let i = 0; i <= 46; i++) {
      const shaka = 1902 + i;
      expect(samvatsaraOfShakaYear(shaka).number, `Shaka ${shaka}`).toBe(((53 + i) % 60) + 1);
      expect(jovianSamvatsaraSuryaSiddhanta(shaka).number, `Vikram ${shaka + 135}`).toBe(((6 + i) % 60) + 1);
    }
  });

  it("skips Jovian years where Sewell and Dikshit's Surya Siddhanta count does", () => {
    // Their own example: Shaka 1436 is number 15.
    expect(jovianSamvatsaraSuryaSiddhanta(1436).number).toBe(15);
    // Number 29 is skipped in 1942 and number 55 in 2027.
    expect(jovianSamvatsaraSuryaSiddhanta(1864).number).toBe(28);
    expect(jovianSamvatsaraSuryaSiddhanta(1865).number).toBe(30);
    expect(jovianSamvatsaraSuryaSiddhanta(1949).number).toBe(54);
    expect(jovianSamvatsaraSuryaSiddhanta(1950).number).toBe(56);
    // The Brihat Samhita rule is one ahead in 2026 (number 54, as Patrika prints Vikram 2083).
    expect(jovianSamvatsaraBrihatSamhita(1948).number).toBe(54);
  });

  it("starts the Shaka year with Chaitra (Ugadi 19 March 2026)", () => {
    const before = available({ date: ist("2026-03-18 12:00"), ...UJJAIN });
    const after = available({ date: ist("2026-03-20 12:00"), ...UJJAIN });
    expect(before.masa.amanta.index).toBe(11);
    expect(before.year).toMatchObject({ shaka: 1947, samvatsara: { number: 39 } });
    expect(after.masa.amanta.index).toBe(0);
    expect(after.year).toMatchObject({ shaka: 1948, samvatsara: { number: 40 } });
  });

  it("gives contiguous spans that cover the whole vara", () => {
    const r = available({ date: new Date("2024-03-20T12:00:00Z"), latitude: 51.4779, longitude: -0.0015 });
    for (const day of [r.tithi, r.nakshatra, r.yoga, r.karana]) {
      expect(day.spans[0].start.getTime()).toBeLessThanOrEqual(r.vara.sunrise.getTime());
      expect(day.spans[day.spans.length - 1].end.getTime()).toBeGreaterThanOrEqual(r.vara.nextSunrise.getTime());
      for (let i = 1; i < day.spans.length; i++) {
        expect(day.spans[i].start.getTime()).toBe(day.spans[i - 1].end.getTime());
        expect(day.spans[i].value.index).not.toBe(day.spans[i - 1].value.index);
      }
    }
  });

  it("starts tithi 1 and ends tithi 30 at the new moon", () => {
    const [newMoon] = findLunations({
      start: new Date("2026-12-01T00:00:00Z"),
      end: new Date("2027-01-01T00:00:00Z"),
      phases: ["new"],
    }).lunations;
    const spans = available({ date: newMoon.instant, ...UJJAIN }).tithi.spans;
    const i = spans.findIndex((s) => s.value.number === 1);
    expect(i).toBeGreaterThan(0);
    expect(spans[i - 1].value.number).toBe(30);
    expect(Math.abs(spans[i].start.getTime() - newMoon.instant.getTime())).toBeLessThan(1000);
  });

  it("belongs to the previous vara before sunrise", () => {
    const r = available({ date: ist("2026-11-25 05:00"), ...UJJAIN });
    expect(r.vara.weekday).toBe(2);
    expect(r.vara.nextSunrise.getTime()).toBeLessThan(ist("2026-11-25 07:00").getTime());
  });

  it("is unavailable when the Sun does not rise", () => {
    const r = getPanchanga({ date: new Date("2026-12-21T12:00:00Z"), latitude: 78.22, longitude: 15.65 });
    expect(r.available).toBe(false);
    if (!r.available) expect(r.reason).toBe("polar-night");
  });
});
