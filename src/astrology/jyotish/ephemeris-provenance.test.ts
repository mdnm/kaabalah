import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { closeSwissEph, getSwissEph, SwissEphEphemerisMismatchError } from "../swisseph";
import { calculateDhruvaChart, calculateLahiriChart, getJyotishChart } from "./index";

const inRange = new Date(Date.UTC(2000, 0, 1, 12));
const outOfRange = new Date(Date.UTC(1500, 0, 1, 12)); // before the installed 1800-2400 Swiss files

describe("jyotish ephemeris provenance", () => {
  beforeAll(async () => {
    await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
  });
  afterAll(() => closeSwissEph());

  it("reports swiss for an in-range instant", () => {
    const c = getJyotishChart({ date: inRange, latitude: 10, longitude: 10 });
    for (const u of [c.ephemerisUsage, c.dhruva.ephemerisUsage, c.lahiri.ephemerisUsage]) {
      expect(u).toMatchObject({ requested: "swiss", used: ["swiss"], substituted: false });
      expect(u.warnings).toEqual([]);
    }
  });

  it("detects the silent Moshier substitution outside the installed range", () => {
    const c = getJyotishChart({ date: outOfRange, latitude: 10, longitude: 10 });
    expect(c.ephemerisUsage.requested).toBe("swiss");
    expect(c.ephemerisUsage.used).toContain("moshier");
    expect(c.ephemerisUsage.substituted).toBe(true);
    expect(c.dhruva.ephemerisUsage.substituted).toBe(true);
    expect(c.lahiri.ephemerisUsage.substituted).toBe(true);
    expect(c.ephemerisUsage.warnings.length).toBeGreaterThan(0);
  });

  it("an explicit moshier request is not a substitution", () => {
    const c = calculateDhruvaChart({ date: outOfRange, latitude: 10, longitude: 10, ephemeris: "moshier" });
    expect(c.ephemerisUsage).toMatchObject({ requested: "moshier", used: ["moshier"], substituted: false });
  });

  it("strictEphemeris throws SwissEphEphemerisMismatchError when substituted", () => {
    expect(() => getJyotishChart({ date: outOfRange, latitude: 10, longitude: 10, strictEphemeris: true })).toThrow(
      SwissEphEphemerisMismatchError
    );
    expect(() => calculateDhruvaChart({ date: outOfRange, latitude: 10, longitude: 10, strictEphemeris: true })).toThrow(
      SwissEphEphemerisMismatchError
    );
    expect(() => calculateLahiriChart({ date: outOfRange, latitude: 10, longitude: 10, strictEphemeris: true })).toThrow(
      SwissEphEphemerisMismatchError
    );
    expect(() => getJyotishChart({ date: inRange, latitude: 10, longitude: 10, strictEphemeris: true })).not.toThrow();
  });

  it("strictEphemeris does not leak into later non-strict calls", () => {
    expect(() => getJyotishChart({ date: outOfRange, latitude: 10, longitude: 10, strictEphemeris: true })).toThrow();
    expect(() => getJyotishChart({ date: outOfRange, latitude: 10, longitude: 10 })).not.toThrow();
  });
});
