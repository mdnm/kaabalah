import type { AspectName } from "./aspects";
import { describe, expect, expectTypeOf, it } from "vitest";
import { ASTROLOGY_DESCRIPTIONS, getAspectDescription, getAspectDescriptionEntry, type DescriptionAspect, type AspectDescriptionEntry } from "./descriptions";

const aspects: DescriptionAspect[] = ["conjunction", "duodecile", "octile", "sextile", "square", "trine", "trioctile", "quincunx", "opposition"];

describe("generic aspect descriptions API", () => {
  it("exposes an exact new namespace and readonly common entry types", () => {
    expectTypeOf<DescriptionAspect>().toEqualTypeOf<AspectName>();
    expectTypeOf(getAspectDescriptionEntry).returns.toEqualTypeOf<AspectDescriptionEntry | undefined>();
    expectTypeOf(getAspectDescription).returns.toEqualTypeOf<string | undefined>();
    expect(Object.keys(ASTROLOGY_DESCRIPTIONS.aspects!)).toEqual(aspects);
    for (const aspect of aspects) {
      expect(getAspectDescriptionEntry(aspect)).toBe(ASTROLOGY_DESCRIPTIONS.aspects![aspect]);
    }
  });

  it("selects Portuguese by case-sensitive pt prefix and English otherwise", () => {
    for (const aspect of aspects) {
      const entry = getAspectDescriptionEntry(aspect)!;
      for (const language of [undefined, "", "en", "es", "PT-BR"]) expect(getAspectDescription(aspect, language)).toBe(entry.en);
      for (const language of ["pt", "pt-BR", "pt-PT"]) expect(getAspectDescription(aspect, language)).toBe(entry.pt);
    }
  });

  it("returns explicit gaps for aliases, case variants and prototype names", () => {
    for (const invalid of ["Conjunction", "semisextile", "semisquare", "sesquiquadrate", "150", "sun-moon", "constructor", "__proto__", "toString", "unknown", "", null, 1]) {
      expect(getAspectDescriptionEntry(invalid as DescriptionAspect)).toBeUndefined();
      expect(getAspectDescription(invalid as DescriptionAspect, "pt-BR")).toBeUndefined();
    }
  });

  it("deeply freezes bilingual copy and metadata within eligible source boundaries", () => {
    function frozen(value: unknown): void {
      if (value && typeof value === "object") {
        expect(Object.isFrozen(value)).toBe(true);
        for (const child of Object.values(value)) frozen(child);
      }
    }
    frozen(ASTROLOGY_DESCRIPTIONS.aspects);
    for (const aspect of aspects) {
      const entry = getAspectDescriptionEntry(aspect)!;
      expect(entry.pt).not.toBe(entry.en);
      expect(entry.keywords.pt.length).toBeGreaterThan(0);
      expect(entry.keywords.en).toHaveLength(entry.keywords.pt.length);
      expect(entry.reviewNotes.every(note => typeof note === "string")).toBe(true);
      expect(Reflect.set(entry, "pt", "changed")).toBe(false);
      expect(Reflect.set(entry.keywords.en, "0", "changed")).toBe(false);
    }
  });
});
