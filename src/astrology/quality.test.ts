import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  getQualifiedChart,
  InputQualityError,
  ZODIAC_SIGN_KEYS,
  type QualifiedChartInput,
} from "./quality";
import { calculateSinglePlanetPosition, closeSwissEph, getSwissEph, Planet } from "./swisseph";

const UTC = { timeZone: "UTC" };
const signOf = (lon: number) => ZODIAC_SIGN_KEYS[Math.floor((((lon % 360) + 360) % 360) / 30) % 12];
const moonLon = (iso: string) => calculateSinglePlanetPosition(new Date(iso), Planet.MOON).longitude;

const untimed = (year: number, month: number, day: number): QualifiedChartInput => ({
  quality: "untimed",
  date: { year, month, day },
  latitude: 0,
  longitude: 0,
  timeZoneSettings: UTC,
});

describe("getQualifiedChart", () => {
  beforeAll(async () => {
    await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
  });
  afterAll(() => closeSwissEph());

  describe("untimed", () => {
    it("omits Moon degree, angles, houses, lots, sect and time-dependent techniques with reasons", async () => {
      const r = await getQualifiedChart(untimed(2001, 5, 10));
      expect(r.status).toBe("limited");
      expect(r.chart).toBeNull();
      const ids = r.analysisPoints.map((p) => p.id);
      for (const banned of ["moon", "asc", "mc", "dsc", "ic", "vertex", "lot-fortune", "lot-spirit"]) {
        expect(ids).not.toContain(banned);
      }
      expect(ids).toContain("sun");
      expect(ids).toContain("saturn");
      expect(r.points.every((p) => p.flags.placeholder === true)).toBe(true);
      expect(r.analysisPoints.every((p) => p.flags.placeholder === true)).toBe(true);
      const items = r.unavailable.map((u) => u.item);
      expect(items).toEqual(
        expect.arrayContaining(["moon-degree", "angles", "houses", "lots", "sect", "time-dependent-techniques"])
      );
      expect(r.unavailable.every((u) => u.reason === "birth-time-unknown")).toBe(true);
      expect(r.unavailable.find((u) => u.item === "time-dependent-techniques")!.techniques).toContain("profections");
      expect(r.provenance.referenceInstantUtc!.toISOString()).toBe("2001-05-10T12:00:00.000Z");
    });

    it("Moon sign range: one sign on a day without ingress, two with ingress time on a day with one", async () => {
      // Independent classification from UTC-midnight endpoints for six consecutive days.
      let sawChange = false;
      let sawSame = false;
      for (let day = 1; day <= 6; day++) {
        const d = String(day).padStart(2, "0");
        const start = `2001-07-${d}T00:00:00Z`;
        const end = new Date(Date.parse(start) + 86400000).toISOString();
        const s0 = signOf(moonLon(start));
        const s1 = signOf(moonLon(end));
        const r = await getQualifiedChart(untimed(2001, 7, day));
        const range = r.moonDayRange!;
        expect(range.degreesExcluded).toBe(true);
        if (s0 === s1) {
          sawSame = true;
          expect(range.signs).toEqual([s0]);
          expect(range.changesSign).toBe(false);
          expect(range.ingress).toBeUndefined();
        } else {
          sawChange = true;
          expect(range.signs).toEqual([s0, s1]);
          expect(range.changesSign).toBe(true);
          const at = range.ingress!.atUtc;
          expect(at.getTime()).toBeGreaterThan(Date.parse(start));
          expect(at.getTime()).toBeLessThan(Date.parse(end));
          // Independent check: at the reported instant the Moon sits on the sign boundary.
          const lon = moonLon(at.toISOString());
          const off = Math.min(lon % 30, 30 - (lon % 30));
          expect(off).toBeLessThan(0.01);
        }
      }
      expect(sawChange).toBe(true);
      expect(sawSame).toBe(true);
    });

    it("flags other bodies that change sign that day (Sun at the March 2000 equinox) and not on a quiet day", async () => {
      const equinox = await getQualifiedChart(untimed(2000, 3, 20));
      const sun = equinox.signChanges!.find((c) => c.id === "sun")!;
      expect(sun.signs).toEqual(["pisces", "aries"]);
      expect(sun.ingresses[0].atUtc.toISOString().slice(0, 13)).toBe("2000-03-20T07"); // 07:35 UT
      const quiet = await getQualifiedChart(untimed(2000, 3, 25));
      expect(quiet.signChanges!.find((c) => c.id === "sun")).toBeUndefined();
    });

    it("works for an unknown place (read as UTC, labelled) and honours local-day bounds of the zone", async () => {
      const r = await getQualifiedChart({ quality: "untimed", date: { year: 2001, month: 5, day: 10 } });
      expect(r.provenance.basis).toBe("unknown-place");
      expect(r.provenance.placeKnown).toBe(false);
      expect(r.provenance.utcOffsetMinutes).toBeNull();
      const tokyo = await getQualifiedChart({
        quality: "untimed",
        date: { year: 2001, month: 5, day: 10 },
        latitude: 35.7,
        longitude: 139.7,
        timeZoneSettings: { timeZone: "Asia/Tokyo" },
      });
      expect(tokyo.moonDayRange!.startUtc.toISOString()).toBe("2001-05-09T15:00:00.000Z");
      expect(tokyo.moonDayRange!.endUtc.toISOString()).toBe("2001-05-10T15:00:00.000Z");
      expect(tokyo.provenance.ianaZone).toBe("Asia/Tokyo");
      expect(tokyo.provenance.utcOffsetMinutes).toBe(540);
    });
  });

  describe("recorded and rectified", () => {
    const base = {
      date: { year: 2000, month: 1, day: 15, hour: 9, minute: 20 },
      latitude: -23.55,
      longitude: -46.63,
      timeZoneSettings: { timeZone: "America/Sao_Paulo" },
    };

    it("recorded: full chart, no rectified/placeholder flags, DST resolved in provenance", async () => {
      const r = await getQualifiedChart({ quality: "recorded", ...base });
      expect(r.status).toBe("complete");
      expect(r.chart).not.toBeNull();
      expect(r.points.some((p) => p.flags.rectified || p.flags.placeholder)).toBe(false);
      expect(r.analysisPoints.map((p) => p.id)).toEqual(expect.arrayContaining(["asc", "moon", "lot-fortune"]));
      // January 2000 São Paulo is on summer time (UTC-2); mid-year is not (UTC-3)
      expect(r.provenance).toMatchObject({ basis: "iana-zone", ianaZone: "America/Sao_Paulo", utcOffsetMinutes: -120, dst: true });
      expect(r.chart!.dateUtc.toISOString()).toBe("2000-01-15T11:20:00.000Z");
      const winter = await getQualifiedChart({ quality: "recorded", ...base, date: { ...base.date, month: 6 } });
      expect(winter.provenance).toMatchObject({ utcOffsetMinutes: -180, dst: false });
    });

    it("rectified: time-dependent points flagged; selector removes rectified angles only", async () => {
      const r = await getQualifiedChart({ quality: "rectified", ...base });
      const flagged = r.points.filter((p) => p.flags.rectified).map((p) => p.id).sort();
      expect(flagged).toEqual(["asc", "dsc", "ic", "lot-fortune", "lot-spirit", "mc", "moon", "vertex"]);
      expect(r.points.find((p) => p.id === "sun")!.flags.rectified).toBeUndefined();
      expect(r.analysisPoints.map((p) => p.id)).toContain("asc");

      const sel = await getQualifiedChart({ quality: "rectified", ...base, analysis: { excludeRectifiedAngles: true } });
      const ids = sel.analysisPoints.map((p) => p.id);
      for (const a of ["asc", "mc", "dsc", "ic", "vertex"]) expect(ids).not.toContain(a);
      expect(ids).toEqual(expect.arrayContaining(["moon", "sun", "lot-fortune"]));
      expect(sel.unavailable.map((u) => u.item)).toContain("rectified-angles");
      // the full point list still carries the angles, flagged
      expect(sel.points.find((p) => p.id === "asc")!.flags.rectified).toBe(true);
    });

    it("uses an injected chart function", async () => {
      let calls = 0;
      const real = await getQualifiedChart({ quality: "recorded", ...base });
      const r = await getQualifiedChart({
        quality: "recorded",
        ...base,
        computeChart: async () => {
          calls++;
          return real.chart!;
        },
      });
      expect(calls).toBe(1);
      expect(r.chart).toBe(real.chart);
    });

    it("provenance: already-UTC instants and historical local mean time", async () => {
      const utc = await getQualifiedChart({
        quality: "recorded",
        date: new Date("2000-01-15T11:20:00Z"),
        latitude: -23.55,
        longitude: -46.63,
        timeZoneSettings: { treatAsUTC: true },
      });
      expect(utc.provenance).toMatchObject({ basis: "utc-instant", alreadyUtc: true, utcOffsetMinutes: 0 });
      const lmt = await getQualifiedChart({
        quality: "recorded",
        ...base,
        date: { year: 1850, month: 3, day: 1, hour: 12 },
        localMeanTime: true,
        placeRole: "birthplace",
      });
      expect(lmt.provenance.basis).toBe("local-mean-time");
      expect(lmt.provenance.localMeanTime).toBe(true);
      expect(lmt.provenance.utcOffsetMinutes).toBeCloseTo(-46.63 * 4, 9);
      // local noon at 46.63W is 186.52 minutes after 12:00 UT
      expect(lmt.provenance.referenceInstantUtc!.getTime() - Date.UTC(1850, 2, 1, 12)).toBeCloseTo(186.52 * 60000, -1);
      expect(lmt.provenance.placeRole).toBe("birthplace");
    });
  });

  describe("partial and input errors", () => {
    it("partial: no invented chart, structured unavailability only", async () => {
      const r = await getQualifiedChart({ quality: "partial", date: { year: 1975, month: 4 } });
      expect(r.status).toBe("unavailable");
      expect(r.chart).toBeNull();
      expect(r.points).toEqual([]);
      expect(r.analysisPoints).toEqual([]);
      expect(r.unavailable[0]).toMatchObject({ item: "chart", reason: "date-incomplete" });
      expect(r.unavailable[0].message).toContain("year");
      expect(r.provenance.referenceInstantUtc).toBeNull();
    });

    it("throws typed errors", async () => {
      const code = async (input: QualifiedChartInput) => {
        try {
          await getQualifiedChart(input);
        } catch (e) {
          expect(e).toBeInstanceOf(InputQualityError);
          return (e as InputQualityError).code;
        }
        return "no-throw";
      };
      expect(await code({ quality: "untimed", date: { year: 2000, month: 5 } })).toBe("INCOMPLETE_DATE");
      expect(await code({ quality: "untimed", date: { year: 2001, month: 2, day: 30 } })).toBe("INVALID_DATE");
      expect(await code({ quality: "recorded", date: { year: 2000, month: 5, day: 1 }, latitude: 0, longitude: 0 })).toBe("MISSING_TIME");
      expect(await code({ quality: "recorded", date: { year: 2000, month: 5, day: 1, hour: 3 }, timeZoneSettings: UTC })).toBe("MISSING_LOCATION");
      expect(await code({ quality: "bogus" as any, date: { year: 2000, month: 5, day: 1 } })).toBe("INVALID_QUALITY");
    });
  });
});
