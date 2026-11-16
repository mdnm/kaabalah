import { describe, expect, expectTypeOf, it } from "vitest";
import { ASTROLOGY_DESCRIPTIONS, getPolarityDescription, getPolarityDescriptionEntry, type DescriptionPolarity, type PolarityDescriptionEntry } from "./descriptions";

const polarities: DescriptionPolarity[] = ["positive", "negative"];

describe("generic polarity descriptions API", () => {
  it("exposes an exact new namespace and readonly common entry types", () => {
    expectTypeOf<DescriptionPolarity>().toEqualTypeOf<"positive" | "negative">();
    expectTypeOf(getPolarityDescriptionEntry).returns.toEqualTypeOf<PolarityDescriptionEntry | undefined>();
    expectTypeOf(getPolarityDescription).returns.toEqualTypeOf<string | undefined>();
    expect(Object.keys(ASTROLOGY_DESCRIPTIONS.polarities!)).toEqual(polarities);
    for (const polarity of polarities) {
      expect(getPolarityDescriptionEntry(polarity)).toBe(ASTROLOGY_DESCRIPTIONS.polarities![polarity]);
    }
  });

  it("selects Portuguese by case-sensitive pt prefix and English otherwise", () => {
    for (const polarity of polarities) {
      const entry = getPolarityDescriptionEntry(polarity)!;
      for (const language of [undefined, "", "en", "es", "PT-BR"]) expect(getPolarityDescription(polarity, language)).toBe(entry.en);
      for (const language of ["pt", "pt-BR", "pt-PT"]) expect(getPolarityDescription(polarity, language)).toBe(entry.pt);
    }
  });

  it("returns explicit gaps for aliases, case variants and prototype names", () => {
    for (const invalid of ["Positive", "NEGATIVE", "masculine", "feminine", "yin", "yang", "diurnal", "nocturnal", "constructor", "__proto__", "toString", "unknown", "", null, 1]) {
      expect(getPolarityDescriptionEntry(invalid as DescriptionPolarity)).toBeUndefined();
      expect(getPolarityDescription(invalid as DescriptionPolarity, "pt-BR")).toBeUndefined();
    }
  });

  it("deeply freezes bilingual copy and metadata within eligible source boundaries", () => {
    function frozen(value: unknown): void {
      if (value && typeof value === "object") {
        expect(Object.isFrozen(value)).toBe(true);
        for (const child of Object.values(value)) frozen(child);
      }
    }
    frozen(ASTROLOGY_DESCRIPTIONS.polarities);
    const ends: Record<string, number> = { "modulo 4/aula 2 modulo 4/aula-2.md": 161, "modulo 4/aula 11 modulo 4/aula-11.md": 1557 };
    for (const polarity of polarities) {
      const entry = getPolarityDescriptionEntry(polarity)!;
      expect(entry.pt).not.toBe(entry.en);
      expect(entry.keywords.pt.length).toBeGreaterThan(0);
      expect(entry.keywords.en).toHaveLength(entry.keywords.pt.length);
      expect(entry.reviewNotes.every(note => typeof note === "string")).toBe(true);
      expect(Reflect.set(entry, "pt", "changed")).toBe(false);
      expect(Reflect.set(entry.keywords.en, "0", "changed")).toBe(false);
      expect(Reflect.set(entry.src[0], "from", 0)).toBe(false);
      for (const source of entry.src) {
        expect(ends[source.file]).toBeDefined();
        expect(Number.isSafeInteger(source.from)).toBe(true);
        expect(Number.isSafeInteger(source.to)).toBe(true);
        expect(source.from).toBeGreaterThan(0);
        expect(source.to).toBeGreaterThanOrEqual(source.from);
        expect(source.to).toBeLessThanOrEqual(ends[source.file]);
      }
    }
  });
});
