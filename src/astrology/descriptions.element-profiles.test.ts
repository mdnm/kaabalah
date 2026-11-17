import { describe, expect, expectTypeOf, it } from "vitest";
import { ASTROLOGY_DESCRIPTIONS, getElementDescription, getElementDescriptionEntry, type DescriptionElement, type ElementDescriptionEntry } from "./descriptions";
import { SIGN_ELEMENTS, type TriplicityElement } from "./dignity";

const elements: readonly DescriptionElement[] = ["fire", "earth", "air", "water"];
const sourceEnds = new Map([
  ["modulo 4/aula 2 modulo 4/aula-2.md", 161],
  ["modulo 4/aula 3 modulo 4/aula-3.md", 782],
  ["modulo 4/aula 8 modulo 4/aula-8.md", 1521],
  ["books/astrologia-hermetica/astrologia-hermetica.md", 123692],
]);
function assertFrozen(value: unknown): void {
  if (value !== null && typeof value === "object") {
    expect(Object.isFrozen(value)).toBe(true);
    for (const child of Object.values(value)) assertFrozen(child);
  }
}

describe("four classical element profiles API", () => {
  it("uses the existing classification type and four canonical lowercase keys", () => {
    expectTypeOf<DescriptionElement>().toEqualTypeOf<TriplicityElement>();
    expectTypeOf(getElementDescriptionEntry).returns.toEqualTypeOf<ElementDescriptionEntry | undefined>();
    expectTypeOf(getElementDescription).returns.toEqualTypeOf<string | undefined>();
    expect([...new Set(Object.values(SIGN_ELEMENTS))].sort()).toEqual([...elements].sort());
    expect(Object.keys(ASTROLOGY_DESCRIPTIONS.elements!).sort()).toEqual([...elements].sort());
    assertFrozen(ASTROLOGY_DESCRIPTIONS.elements);
    for (const element of elements) {
      const entry = getElementDescriptionEntry(element)!;
      expect(entry).toBe(ASTROLOGY_DESCRIPTIONS.elements![element]);
      expect(Object.keys(entry)).toEqual(["pt", "en", "keywords", "src", "reviewNotes"]);
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

  it("selects Portuguese only by exact pt prefix", () => {
    for (const element of elements) {
      const entry = getElementDescriptionEntry(element)!;
      for (const language of [undefined, "", "en", "es", "PT-BR"]) expect(getElementDescription(element, language)).toBe(entry.en);
      for (const language of ["pt", "pt-BR", "pt-PT"]) expect(getElementDescription(element, language)).toBe(entry.pt);
    }
  });

  it("keeps other element systems, localized keys and inherited names unsupported", () => {
    for (const invalid of ["wood", "metal", "ether", "Fire", "fogo", "unknown", "constructor", "__proto__"]) {
      expect(getElementDescriptionEntry(invalid as DescriptionElement)).toBeUndefined();
      expect(getElementDescription(invalid as DescriptionElement, "pt-BR")).toBeUndefined();
    }
  });
});
