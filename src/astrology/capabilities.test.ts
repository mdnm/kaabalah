import { afterAll, describe, expect, it } from "vitest";
import packageJson from "../../package.json";
import { assertEphemerisReady, getCapabilities } from "./capabilities";
import { closeSwissEph, getSwissEph, SwissEphError } from "./swisseph";

describe("getCapabilities", () => {
  it("is JSON-serialisable and versioned", () => {
    const caps = getCapabilities();
    expect(JSON.parse(JSON.stringify(caps))).toEqual(caps);
    expect(caps.schemaVersion).toBe(1);
    expect(caps.packageVersion).toBe(packageJson.version);
    expect(caps.modules).toEqual(expect.arrayContaining(["core", "astrology", "numerology", "semantic"]));
  });

  it("describes houses, points, aspects, frames and nodes", () => {
    const a = getCapabilities().astrology;
    expect(a.houseSystems).toEqual(expect.arrayContaining([{ id: "P", name: "PLACIDUS" }, { id: "W", name: "WHOLE_SIGN" }]));
    const keys = a.points.map((p) => p.key);
    expect(keys).toEqual(expect.arrayContaining(["sun", "moon", "pluto", "chiron", "mean node", "true node"]));
    expect(a.points.every((p) => p.swissId !== null)).toBe(true);
    expect(a.virtualPoints).toContain("wheel of fortune");
    expect(a.aspects.map((x) => x.name)).toEqual(expect.arrayContaining(["conjunction", "opposition", "quincunx"]));
    expect(a.zodiacFrames.map((f) => f.id)).toEqual(["tropical", "lahiri", "dhruva"]);
    expect(a.nodeConventions).toEqual(["mean", "true"]);
    expect(a.defaults.yearLengthDays.dhruva).toBe(365.2422);
    expect(a.gcConstants.dhruva.gcIcrsRightAscension).toBe(266.40499);
    expect(a.inputQualities.map((q) => q.id)).toEqual(["recorded", "rectified", "untimed", "partial"]);
  });

  it("describes numerology layers, method version and limits", () => {
    const caps = getCapabilities();
    expect(caps.numerology.methodVersion).toMatch(/^kaabalah-numerology-schedule\//);
    expect(caps.numerology.layers).toContain("personal-year");
    expect(caps.limits.collection.maxPeople).toBeGreaterThan(0);
    expect(caps.limits.numerology.maxTimelineRangeDays).toBeGreaterThan(0);
    expect(caps.errors.swissEph).toContain("SWISSEPH_NOT_INITIALIZED");
  });

  describe("ephemeris coverage", () => {
    afterAll(() => closeSwissEph());

    it("reports the static shipped range before initialisation, then runtime data after", async () => {
      closeSwissEph();
      const before = getCapabilities().astrology.ephemeris;
      expect(before).toMatchObject({ initialized: false, coverageSource: "static", missingFiles: expect.any(Array) });
      expect(before.coverage).toMatchObject({ fromYear: 1800, toYearExclusive: 2400 });

      await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
      const after = getCapabilities().astrology.ephemeris;
      expect(after).toMatchObject({ initialized: true, coverageSource: "runtime", missingFiles: [] });
      expect(after.coverage.fromYear).toBe(1800);
    });
  });
});

describe("assertEphemerisReady", () => {
  afterAll(() => closeSwissEph());

  it("throws an actionable SwissEphError when not initialised", () => {
    closeSwissEph();
    try {
      assertEphemerisReady();
      throw new Error("expected throw");
    } catch (error) {
      expect(error).toBeInstanceOf(SwissEphError);
      expect((error as SwissEphError).code).toBe("SWISSEPH_NOT_INITIALIZED");
      expect((error as SwissEphError).message).toContain("getSwissEph");
    }
  });

  it("passes when ready and flags years outside the shipped range", async () => {
    await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
    expect(() => assertEphemerisReady({ year: 2000 })).not.toThrow();
    expect(() => assertEphemerisReady({ year: 1700 })).toThrow(expect.objectContaining({ code: "SWISSEPH_DATE_OUT_OF_RANGE" }));
    expect(() => assertEphemerisReady({ year: 2400 })).toThrow(expect.objectContaining({ code: "SWISSEPH_DATE_OUT_OF_RANGE" }));
  });
});
