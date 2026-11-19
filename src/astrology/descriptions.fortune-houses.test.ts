import { describe, expect, expectTypeOf, it } from "vitest";
import { ASTROLOGY_DESCRIPTIONS, getPointHouseDescription, getPointHouseDescriptionEntry, type DescriptionPoint, type DescriptionHouseNumber, type PointHouseDescriptionEntry, type PlanetSignDescriptionEntry } from "./descriptions";

const houses = Array.from({ length: 12 }, (_, index) => index + 1);
describe("Fortune house descriptions API", () => {
  it("exposes only canonical point/house keys and the readonly common entry", () => {
    expectTypeOf<PointHouseDescriptionEntry>().toEqualTypeOf<PlanetSignDescriptionEntry>();
    expectTypeOf(getPointHouseDescriptionEntry).parameters.toEqualTypeOf<[DescriptionPoint, number]>();
    expectTypeOf(getPointHouseDescriptionEntry).returns.toEqualTypeOf<PointHouseDescriptionEntry | undefined>();
    expectTypeOf(getPointHouseDescription).returns.toEqualTypeOf<string | undefined>();
    expect(Object.keys(ASTROLOGY_DESCRIPTIONS.pointHouses!)).toEqual(["parsFortunae", "vertex"]);
    expect(Object.keys(ASTROLOGY_DESCRIPTIONS.pointHouses!.parsFortunae!)).toEqual(houses.map(String));
  });

  it("selects Portuguese only for case-sensitive pt prefixes", () => {
    for (const house of houses) {
      const entry = getPointHouseDescriptionEntry("parsFortunae", house)!;
      expect(entry).toBe(ASTROLOGY_DESCRIPTIONS.pointHouses!.parsFortunae![house as DescriptionHouseNumber]);
      for (const language of [undefined, "", "en", "es", "PT-BR"]) expect(getPointHouseDescription("parsFortunae", house, language)).toBe(entry.en);
      for (const language of ["pt", "pt-BR", "pt-PT"]) expect(getPointHouseDescription("parsFortunae", house, language)).toBe(entry.pt);
    }
  });

  it("returns gaps without general point or house fallbacks", () => {
    for (const point of ["fortune", "Wheel of Fortune", "parsfortunae", "sun", "parsSpiritus", "constructor", "__proto__", "toString", "", null, 1]) {
      expect(getPointHouseDescriptionEntry(point as DescriptionPoint, 1)).toBeUndefined();
      expect(getPointHouseDescription(point as DescriptionPoint, 1, "pt")).toBeUndefined();
    }
    for (const house of [0, -1, 13, 1.5, NaN, Infinity, -Infinity, "1", "01", "12", "unknown", "constructor", "__proto__", "toString", "", null, undefined, true, {}, []]) {
      expect(getPointHouseDescriptionEntry("parsFortunae", house as number)).toBeUndefined();
      expect(getPointHouseDescription("parsFortunae", house as number, "pt")).toBeUndefined();
    }
  });

  it("deeply freezes all copy and provenance, with exactly five entry fields", () => {
    function frozen(value: unknown): void {
      if (value && typeof value === "object") {
        expect(Object.isFrozen(value)).toBe(true);
        for (const child of Object.values(value)) frozen(child);
      }
    }
    frozen(ASTROLOGY_DESCRIPTIONS.pointHouses);
    for (const house of houses) {
      const entry = getPointHouseDescriptionEntry("parsFortunae", house)!;
      expect(entry.keywords.pt.length).toBeGreaterThan(0);
      expect(entry.keywords.en).toHaveLength(entry.keywords.pt.length);
      expect(Reflect.set(entry, "pt", "changed")).toBe(false);
      expect(Reflect.set(entry.keywords.en, "0", "changed")).toBe(false);
    }
  });
});
