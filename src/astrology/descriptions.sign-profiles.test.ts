import { describe, expect, expectTypeOf, it } from "vitest";
import { ASTROLOGY_DESCRIPTIONS, getSignDescription, getSignDescriptionEntry, type SignDescriptionEntry } from "./descriptions";
import type { Sign } from "./dignity";

const signs: readonly Sign[] = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const sourceEnds = new Map([
  ["modulo 4/aula 0 modulo 4/aula-0.md", 441],
  ["modulo 4/aula 4 modulo 4/aula-4.md", 603],
  ["modulo 4/aula 5 modulo 4/aula-5.md", 934],
  ["books/astrologia-hermetica/astrologia-hermetica.md", 123692],
]);

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
      expect(Reflect.set(entry.src[0], "from", 0)).toBe(false);
      expect(JSON.stringify(entry)).not.toContain("\u2014");
      expect(entry.src.length).toBeGreaterThan(0);
      for (const source of entry.src) {
        expect(Number.isSafeInteger(source.from)).toBe(true);
        expect(Number.isSafeInteger(source.to)).toBe(true);
        expect(source.from).toBeGreaterThanOrEqual(1);
        expect(source.to).toBeGreaterThanOrEqual(source.from);
        expect(sourceEnds.get(source.file), `Unaudited source ${source.file}`).toBeDefined();
        expect(source.to).toBeLessThanOrEqual(sourceEnds.get(source.file)!);
      }
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
