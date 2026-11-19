import { describe, expect, expectTypeOf, it } from "vitest";
import { ASTROLOGY_DESCRIPTIONS, getSignDescription, getSignDescriptionEntry, type SignDescriptionEntry } from "./descriptions";
import type { Sign } from "./dignity";

const signs: readonly Sign[] = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

function assertFrozen(value: unknown): void {
  if (value !== null && typeof value === "object") {
    expect(Object.isFrozen(value)).toBe(true);
    for (const child of Object.values(value)) assertFrozen(child);
  }
}

describe("basic sign profile API", () => {
  it("returns twelve canonical typed entries with immutable bilingual provenance", () => {
    expectTypeOf(getSignDescriptionEntry).returns.toEqualTypeOf<SignDescriptionEntry | undefined>();
    expectTypeOf(getSignDescription).returns.toEqualTypeOf<string | undefined>();
    expect(Object.keys(ASTROLOGY_DESCRIPTIONS.signs!).sort()).toEqual([...signs].sort());
    assertFrozen(ASTROLOGY_DESCRIPTIONS.signs);
    for (const sign of signs) {
      const entry = getSignDescriptionEntry(sign)!;
      expect(entry).toBe(ASTROLOGY_DESCRIPTIONS.signs![sign]);
      expect(entry.pt.trim()).not.toBe("");
      expect(entry.en.trim()).not.toBe("");
      expect(entry.pt).not.toBe(entry.en);
      expect(entry.keywords.pt.length).toBeGreaterThan(0);
      expect(entry.keywords.en).toHaveLength(entry.keywords.pt.length);
      expect(Reflect.set(entry, "pt", "changed")).toBe(false);
      expect(JSON.stringify(entry)).not.toContain("\u2014");
    }
  });

  it("selects Portuguese by exact pt prefix and English otherwise", () => {
    for (const sign of signs) {
      const entry = getSignDescriptionEntry(sign)!;
      for (const language of [undefined, "", "en", "es", "PT-BR"]) expect(getSignDescription(sign, language)).toBe(entry.en);
      for (const language of ["pt", "pt-BR", "pt-PT"]) expect(getSignDescription(sign, language)).toBe(entry.pt);
    }
  });

  it("leaves localized, noncanonical and inherited names unsupported", () => {
    for (const invalid of ["aries", "Áries", "sun", "unknown", "constructor", "__proto__"]) {
      expect(getSignDescriptionEntry(invalid as Sign)).toBeUndefined();
      expect(getSignDescription(invalid as Sign, "pt-BR")).toBeUndefined();
    }
  });
});
