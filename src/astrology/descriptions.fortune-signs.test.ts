import { describe, expect, expectTypeOf, it } from "vitest";
import { ASTROLOGY_DESCRIPTIONS, getPointSignDescription, getPointSignDescriptionEntry, type DescriptionPoint, type PointSignDescriptionEntry, type PlanetSignDescriptionEntry } from "./descriptions";
import type { Sign } from "./dignity";

const signs: Sign[] = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
describe("Fortune sign descriptions API", () => {
  it("exposes only canonical point/sign keys and the readonly common entry", () => {
    expectTypeOf<PointSignDescriptionEntry>().toEqualTypeOf<PlanetSignDescriptionEntry>();
    expectTypeOf(getPointSignDescriptionEntry).parameters.toEqualTypeOf<[DescriptionPoint, Sign]>();
    expectTypeOf(getPointSignDescriptionEntry).returns.toEqualTypeOf<PointSignDescriptionEntry | undefined>();
    expectTypeOf(getPointSignDescription).returns.toEqualTypeOf<string | undefined>();
    expect(ASTROLOGY_DESCRIPTIONS.pointSigns).toHaveProperty("parsFortunae");
    expect(Object.keys(ASTROLOGY_DESCRIPTIONS.pointSigns!.parsFortunae!)).toEqual(signs);
  });

  it("selects Portuguese only for case-sensitive pt prefixes", () => {
    for (const sign of signs) {
      const entry = getPointSignDescriptionEntry("parsFortunae", sign)!;
      expect(entry).toBe(ASTROLOGY_DESCRIPTIONS.pointSigns!.parsFortunae![sign]);
      for (const language of [undefined, "", "en", "es", "PT-BR"]) expect(getPointSignDescription("parsFortunae", sign, language)).toBe(entry.en);
      for (const language of ["pt", "pt-BR", "pt-PT"]) expect(getPointSignDescription("parsFortunae", sign, language)).toBe(entry.pt);
    }
  });

  it("returns gaps without general point or sign fallbacks", () => {
    for (const point of ["fortune", "Wheel of Fortune", "parsfortunae", "sun", "parsSpiritus", "constructor", "__proto__", "toString", "", null, 1]) {
      expect(getPointSignDescriptionEntry(point as DescriptionPoint, "Aries")).toBeUndefined();
      expect(getPointSignDescription(point as DescriptionPoint, "Aries", "pt")).toBeUndefined();
    }
    for (const sign of ["aries", "Áries", "ARIES", "unknown", "constructor", "__proto__", "toString", "", null, 1]) {
      expect(getPointSignDescriptionEntry("parsFortunae", sign as Sign)).toBeUndefined();
      expect(getPointSignDescription("parsFortunae", sign as Sign)).toBeUndefined();
    }
  });

  it("deeply freezes all copy and provenance, with exactly five entry fields", () => {
    function frozen(value: unknown): void {
      if (value && typeof value === "object") {
        expect(Object.isFrozen(value)).toBe(true);
        for (const child of Object.values(value)) frozen(child);
      }
    }
    frozen(ASTROLOGY_DESCRIPTIONS.pointSigns);
    for (const sign of signs) {
      const entry = getPointSignDescriptionEntry("parsFortunae", sign)!;
      expect(Object.keys(entry)).toEqual(["pt", "en", "keywords", "src", "reviewNotes"]);
      expect(entry.keywords.pt.length).toBeGreaterThan(0);
      expect(entry.keywords.en).toHaveLength(entry.keywords.pt.length);
      expect(entry.reviewNotes.length).toBeGreaterThan(0);
      expect(Reflect.set(entry, "pt", "changed")).toBe(false);
      expect(Reflect.set(entry.keywords.en, "0", "changed")).toBe(false);
      expect(Reflect.set(entry.src[0], "from", 0)).toBe(false);
    }
  });
});
