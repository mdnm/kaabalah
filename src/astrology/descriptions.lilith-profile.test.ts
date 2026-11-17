import { describe, expect, expectTypeOf, it } from "vitest";
import { ASTROLOGY_DESCRIPTIONS, getPointDescription, getPointDescriptionEntry, getPointSignDescriptionEntry, getPointHouseDescriptionEntry, type DescriptionPoint, type PointDescriptionEntry } from "./descriptions";

const modes = ["lilith mean", "lilith true"] as const;
describe("shared Lilith general concept API", () => {
  it("accepts exact chart keys with one canonical record and shared identity", () => {
    expectTypeOf<DescriptionPoint>().toEqualTypeOf<"parsFortunae" | "chiron" | "lilith mean" | "lilith true" | "vertex" | "antivertex">();
    expectTypeOf(getPointDescriptionEntry).returns.toEqualTypeOf<PointDescriptionEntry | undefined>();
    expect(Object.keys(ASTROLOGY_DESCRIPTIONS.points!)).toEqual(["parsFortunae", "chiron", "lilith mean", "vertex", "antivertex"]);
    expect(ASTROLOGY_DESCRIPTIONS.points).not.toHaveProperty("lilith true");
    expect(ASTROLOGY_DESCRIPTIONS.points).not.toHaveProperty("lilith");
    expect(getPointDescriptionEntry("lilith mean")).toBe(ASTROLOGY_DESCRIPTIONS.points!["lilith mean"]);
    expect(getPointDescriptionEntry("lilith true")).toBe(getPointDescriptionEntry("lilith mean"));
  });

  it("selects English by default and Portuguese only for case-sensitive pt prefixes", () => {
    const entry = getPointDescriptionEntry("lilith mean")!;
    for (const mode of modes) {
      for (const language of [undefined, "", "en", "es", "PT-BR"]) expect(getPointDescription(mode, language)).toBe(entry.en);
      for (const language of ["pt", "pt-BR", "pt-PT"]) expect(getPointDescription(mode, language)).toBe(entry.pt);
    }
  });

  it("rejects defaults, internal names, variants and inherited keys", () => {
    for (const key of ["lilith", "Lilith", "Lilith Mean", "Lilith True", "lilithMean", "lilithTrue", "lilith  mean", "lilith true ", "priapus", "constructor", "__proto__", "toString", "unknown", "", null, 12]) {
      expect(getPointDescriptionEntry(key as DescriptionPoint)).toBeUndefined();
      expect(getPointDescription(key as DescriptionPoint, "pt")).toBeUndefined();
    }
  });

  it("keeps the general concept separate from signs and leaves houses unauthored", () => {
    for (const mode of modes) {
      for (const sign of ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"] as const) {
        const placement = getPointSignDescriptionEntry(mode, sign);
        expect(placement).toBeDefined();
        expect(placement).not.toBe(getPointDescriptionEntry(mode));
      }
      for (let house = 1; house <= 12; house++) expect(getPointHouseDescriptionEntry(mode, house)).toBeUndefined();
    }
  });

  it("recursively freezes the five-field authored entry and metadata", () => {
    const entry = getPointDescriptionEntry("lilith mean")!;
    function frozen(value: unknown): void {
      if (value && typeof value === "object") {
        expect(Object.isFrozen(value)).toBe(true);
        for (const child of Object.values(value)) frozen(child);
      }
    }
    frozen(entry);
    expect(Object.keys(entry)).toEqual(["pt", "en", "keywords", "src", "reviewNotes"]);
    expect(entry.keywords.en).toHaveLength(entry.keywords.pt.length);
    expect(entry.keywords.pt.length).toBeGreaterThan(0);
    expect(entry.reviewNotes.length).toBeGreaterThan(0);
    expect(Reflect.set(entry, "pt", "changed")).toBe(false);
    expect(Reflect.set(entry.keywords.en, "0", "changed")).toBe(false);
    expect(Reflect.set(entry.src[0], "from", 0)).toBe(false);
  });
});
