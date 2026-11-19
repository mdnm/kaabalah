import { describe, expect, expectTypeOf, it } from "vitest";
import { ASTROLOGY_DESCRIPTIONS, getAngleDescription, getAngleDescriptionEntry, type DescriptionAngle, type AngleDescriptionEntry } from "./descriptions";

const angles: DescriptionAngle[] = ["ascendant", "mc", "dc", "ic"];

describe("generic angle descriptions API", () => {
  it("exposes an exact new namespace and readonly common entry types", () => {
    expectTypeOf<DescriptionAngle>().toEqualTypeOf<"ascendant" | "mc" | "dc" | "ic">();
    expectTypeOf(getAngleDescriptionEntry).returns.toEqualTypeOf<AngleDescriptionEntry | undefined>();
    expectTypeOf(getAngleDescription).returns.toEqualTypeOf<string | undefined>();
    expect(Object.keys(ASTROLOGY_DESCRIPTIONS.angles!)).toEqual(angles);
    for (const angle of angles) {
      expect(getAngleDescriptionEntry(angle)).toBe(ASTROLOGY_DESCRIPTIONS.angles![angle]);
    }
  });

  it("selects Portuguese by case-sensitive pt prefix and English otherwise", () => {
    for (const angle of angles) {
      const entry = getAngleDescriptionEntry(angle)!;
      for (const language of [undefined, "", "en", "es", "PT-BR"]) expect(getAngleDescription(angle, language)).toBe(entry.en);
      for (const language of ["pt", "pt-BR", "pt-PT"]) expect(getAngleDescription(angle, language)).toBe(entry.pt);
    }
  });

  it("returns explicit gaps for aliases, case variants and prototype names", () => {
    for (const invalid of ["Ascendant", "MC", "DC", "IC", "midheaven", "descendant", "house1", "house10", "sun", "constructor", "__proto__", "toString", "unknown", "", null, 1]) {
      expect(getAngleDescriptionEntry(invalid as DescriptionAngle)).toBeUndefined();
      expect(getAngleDescription(invalid as DescriptionAngle, "pt-BR")).toBeUndefined();
    }
  });

  it("deeply freezes bilingual copy and metadata within eligible source boundaries", () => {
    function frozen(value: unknown): void {
      if (value && typeof value === "object") {
        expect(Object.isFrozen(value)).toBe(true);
        for (const child of Object.values(value)) frozen(child);
      }
    }
    frozen(ASTROLOGY_DESCRIPTIONS.angles);
    for (const angle of angles) {
      const entry = getAngleDescriptionEntry(angle)!;
      expect(entry.pt).not.toBe(entry.en);
      expect(entry.keywords.pt.length).toBeGreaterThan(0);
      expect(entry.keywords.en).toHaveLength(entry.keywords.pt.length);
      expect(entry.reviewNotes.every(note => typeof note === "string")).toBe(true);
      expect(Reflect.set(entry, "pt", "changed")).toBe(false);
      expect(Reflect.set(entry.keywords.en, "0", "changed")).toBe(false);
    }
  });
});
