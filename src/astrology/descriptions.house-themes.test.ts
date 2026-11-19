import { describe, expect, expectTypeOf, it } from "vitest";
import {
  ASTROLOGY_DESCRIPTIONS,
  getHouseDescription,
  getHouseDescriptionEntry,
  type DescriptionHouseNumber,
  type HouseDescriptionEntry,
} from "./descriptions";

const houses = Array.from({ length: 12 }, (_, i) => i + 1) as DescriptionHouseNumber[];

describe("numbered house themes API", () => {
  it("exposes typed optional entries and exactly twelve authored numbered houses", () => {
    expectTypeOf(getHouseDescriptionEntry).returns.toEqualTypeOf<HouseDescriptionEntry | undefined>();
    expectTypeOf(getHouseDescription).returns.toEqualTypeOf<string | undefined>();
    expect(ASTROLOGY_DESCRIPTIONS.houses).toBeDefined();
    expect(Object.keys(ASTROLOGY_DESCRIPTIONS.houses!)).toEqual(houses.map(String));
  });

  it("selects the shared immutable entry and exact language-prefix convention for every house", () => {
    for (const house of houses) {
      const entry = getHouseDescriptionEntry(house)!;
      expect(entry).toBe(ASTROLOGY_DESCRIPTIONS.houses![house]);
      expect(entry.pt).not.toBe(entry.en);
      for (const language of [undefined, "", "en", "es", "PT-BR"]) {
        expect(getHouseDescription(house, language)).toBe(entry.en);
      }
      for (const language of ["pt", "pt-BR", "pt-PT"]) {
        expect(getHouseDescription(house, language)).toBe(entry.pt);
      }
    }
  });

  it("leaves invalid, fractional, nonnumeric and inherited keys as explicit gaps", () => {
    for (const value of [0, -1, 13, 1.5, NaN, Infinity, -Infinity, "1", "constructor", "__proto__", null]) {
      expect(getHouseDescriptionEntry(value as number)).toBeUndefined();
      expect(getHouseDescription(value as number, "pt-BR")).toBeUndefined();
    }
  });

  it("keeps paired bilingual content and eligible inclusive provenance for every entry", () => {
    for (const house of houses) {
      const entry = getHouseDescriptionEntry(house)!;
      for (const text of [entry.pt, entry.en]) {
        expect(text.trim()).not.toBe("");
        expect(text).not.toMatch(/o curso|the course|a fonte|the source|o livro|the book|omitid|omitted/i);
      }
      expect(entry.keywords.pt.length).toBeGreaterThan(0);
      expect(entry.keywords.en).toHaveLength(entry.keywords.pt.length);
      for (const keyword of [...entry.keywords.pt, ...entry.keywords.en]) expect(keyword.trim()).not.toBe("");
      expect(Array.isArray(entry.reviewNotes)).toBe(true);
      expect(entry.reviewNotes.every(note => typeof note === "string")).toBe(true);
      expect(JSON.stringify(entry)).not.toContain("\u2014");
    }
  });

  it("deeply freezes all house entries, keyword arrays and provenance metadata", () => {
    function frozen(value: unknown): void {
      if (value !== null && typeof value === "object") {
        expect(Object.isFrozen(value)).toBe(true);
        for (const child of Object.values(value)) frozen(child);
      }
    }
    frozen(ASTROLOGY_DESCRIPTIONS.houses);
    for (const house of houses) {
      const entry = getHouseDescriptionEntry(house)!;
      expect(Reflect.set(entry, "pt", "changed")).toBe(false);
      expect(Reflect.set(entry.keywords.en, "0", "changed")).toBe(false);
    }
  });
});
