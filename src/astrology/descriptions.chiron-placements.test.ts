import { describe, expect, expectTypeOf, it } from "vitest";
import { ASTROLOGY_DESCRIPTIONS, getPointDescriptionEntry, getPointSignDescription, getPointSignDescriptionEntry, getPointHouseDescription, getPointHouseDescriptionEntry, type DescriptionPoint, type PointSignDescriptionEntry, type PointHouseDescriptionEntry } from "./descriptions";
import type { Sign } from "./dignity";

const signs: Sign[] = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
describe("Chiron combined placement aliases", () => {
  it("stores exactly twelve canonical entries with twenty-four identical-reference aliases", () => {
    expectTypeOf<Extract<DescriptionPoint, "chiron">>().toEqualTypeOf<"chiron">();
    expectTypeOf<Extract<string, DescriptionPoint>>().toEqualTypeOf<never>();
    expectTypeOf<PointSignDescriptionEntry>().toEqualTypeOf<PointHouseDescriptionEntry>();
    expect(Object.keys(ASTROLOGY_DESCRIPTIONS.chironPlacements!)).toEqual(signs);
    expect(ASTROLOGY_DESCRIPTIONS.pointSigns).not.toHaveProperty("chiron");
    expect(ASTROLOGY_DESCRIPTIONS.pointHouses).not.toHaveProperty("chiron");
    for (const [index, sign] of signs.entries()) {
      const entry = getPointSignDescriptionEntry("chiron", sign)!;
      expect(entry).toBe(ASTROLOGY_DESCRIPTIONS.chironPlacements![sign]);
      expect(getPointHouseDescriptionEntry("chiron", index + 1)).toBe(entry);
      expect(entry).not.toBe(getPointDescriptionEntry("chiron"));
    }
    expect(new Set(signs.map(sign => getPointSignDescriptionEntry("chiron", sign))).size).toBe(12);
  });

  it("does not impose the source aliases on independent Fortune manners and fields", () => {
    const sign = getPointSignDescriptionEntry("parsFortunae", "Aries");
    const house = getPointHouseDescriptionEntry("parsFortunae", 1);
    expect(sign).toBe(ASTROLOGY_DESCRIPTIONS.pointSigns!.parsFortunae!.Aries);
    expect(house).toBe(ASTROLOGY_DESCRIPTIONS.pointHouses!.parsFortunae![1]);
    expect(sign).toBeDefined();
    expect(house).toBeDefined();
    expect(sign).not.toBe(house);
    expect(sign!.pt).not.toBe(house!.pt);
  });

  it("selects language identically through both aliases", () => {
    for (const [index, sign] of signs.entries()) {
      const entry = getPointSignDescriptionEntry("chiron", sign)!;
      for (const language of [undefined, "", "en", "es", "PT-BR", "pt", "pt-BR", "pt-PT"]) {
        const text = language?.startsWith("pt") ? entry.pt : entry.en;
        expect(getPointSignDescription("chiron", sign, language)).toBe(text);
        expect(getPointHouseDescription("chiron", index + 1, language)).toBe(text);
      }
    }
  });

  it("rejects aliases, prototypes and unsupported combinations without fallback", () => {
    for (const point of ["Chiron", "Quíron", "CHIRON", "sun", "unknown", "constructor", "__proto__", "toString", "", null, 15]) {
      expect(getPointSignDescriptionEntry(point as DescriptionPoint, "Aries")).toBeUndefined();
      expect(getPointHouseDescriptionEntry(point as DescriptionPoint, 1)).toBeUndefined();
    }
    for (const sign of ["aries", "ARIES", "Áries", "1", "constructor", "__proto__", "toString", "unknown", "", null]) {
      expect(getPointSignDescriptionEntry("chiron", sign as Sign)).toBeUndefined();
      expect(getPointSignDescription("chiron", sign as Sign, "pt")).toBeUndefined();
    }
    for (const house of [0, -1, 13, 1.5, NaN, Infinity, -Infinity, "1", "01", "12", null, undefined, true, {}, [], "constructor", "__proto__"]) {
      expect(getPointHouseDescriptionEntry("chiron", house as number)).toBeUndefined();
      expect(getPointHouseDescription("chiron", house as number, "pt")).toBeUndefined();
    }
  });

  it("recursively freezes the single bank and exact five-field metadata", () => {
    function frozen(value: unknown): void {
      if (value && typeof value === "object") {
        expect(Object.isFrozen(value)).toBe(true);
        for (const child of Object.values(value)) frozen(child);
      }
    }
    frozen(ASTROLOGY_DESCRIPTIONS.chironPlacements);
    for (const sign of signs) {
      const entry = getPointSignDescriptionEntry("chiron", sign)!;
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
