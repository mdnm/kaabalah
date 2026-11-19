import { describe, expect, expectTypeOf, it } from "vitest";
import { ASTROLOGY_DESCRIPTIONS, getModalityDescription, getModalityDescriptionEntry, type DescriptionModality, type ModalityDescriptionEntry } from "./descriptions";
import { MODALITIES } from "../core/constants";

const modalities: readonly DescriptionModality[] = Object.values(MODALITIES);
function assertFrozen(value: unknown): void {
  if (value !== null && typeof value === "object") {
    expect(Object.isFrozen(value)).toBe(true);
    for (const child of Object.values(value)) assertFrozen(child);
  }
}
describe("three modality profiles API", () => {
  it("uses the canonical MODALITIES value names and immutable bilingual provenance", () => {
    expectTypeOf(getModalityDescriptionEntry).returns.toEqualTypeOf<ModalityDescriptionEntry | undefined>();
    expectTypeOf(getModalityDescription).returns.toEqualTypeOf<string | undefined>();
    expect(Object.keys(ASTROLOGY_DESCRIPTIONS.modalities!).sort()).toEqual([...modalities].sort());
    assertFrozen(ASTROLOGY_DESCRIPTIONS.modalities);
    for (const modality of modalities) {
      const entry = getModalityDescriptionEntry(modality)!;
      expect(entry).toBe(ASTROLOGY_DESCRIPTIONS.modalities![modality]);
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
    for (const modality of modalities) {
      const entry = getModalityDescriptionEntry(modality)!;
      for (const language of [undefined, "", "en", "es", "PT-BR"]) expect(getModalityDescription(modality, language)).toBe(entry.en);
      for (const language of ["pt", "pt-BR", "pt-PT"]) expect(getModalityDescription(modality, language)).toBe(entry.pt);
    }
  });
  it("leaves unrecognized aliases and inherited names unsupported", () => {
    for (const invalid of ["cardinal", "Common", "Comum", "Fixo", "unknown", "constructor", "__proto__"]) {
      expect(getModalityDescriptionEntry(invalid as DescriptionModality)).toBeUndefined();
      expect(getModalityDescription(invalid as DescriptionModality, "pt-BR")).toBeUndefined();
    }
  });
});
