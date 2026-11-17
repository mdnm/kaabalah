import { describe, expect, expectTypeOf, it, vi } from "vitest";
import type { Sect } from "./index";
// A type-only Sect dependency must not load runtime chart/calculation modules.
vi.mock("./index", () => { throw new Error("runtime index import is forbidden for descriptions"); });
vi.mock("./swisseph", () => { throw new Error("runtime ephemeris import is forbidden for descriptions"); });
import { ASTROLOGY_DESCRIPTIONS, getSectDescription, getSectDescriptionEntry, type SectDescriptionEntry, type PlanetSignDescriptionEntry } from "./descriptions";
const sects: Sect[] = ["diurnal", "nocturnal"];
describe("pure sect descriptions", () => {
  it("reuses the exact existing Sect type and common readonly entry", () => {
    expectTypeOf<Sect>().toEqualTypeOf<"diurnal" | "nocturnal">();
    expectTypeOf<SectDescriptionEntry>().toEqualTypeOf<PlanetSignDescriptionEntry>();
    expectTypeOf(getSectDescriptionEntry).parameters.toEqualTypeOf<[Sect]>();
    expectTypeOf(getSectDescription).parameters.toEqualTypeOf<[Sect, string?]>();
    expectTypeOf(getSectDescriptionEntry).returns.toEqualTypeOf<SectDescriptionEntry | undefined>();
    expectTypeOf(getSectDescription).returns.toEqualTypeOf<string | undefined>();
    expect(Object.keys(ASTROLOGY_DESCRIPTIONS.sects!)).toEqual(sects);
    for (const sect of sects) expect(getSectDescriptionEntry(sect)).toBe(ASTROLOGY_DESCRIPTIONS.sects![sect]);
  });
  it("selects Portuguese only for case-sensitive pt prefixes", () => {
    for (const sect of sects) {
      const entry = getSectDescriptionEntry(sect)!;
      for (const language of [undefined, "", "en", "es", "PT-BR", "pt", "pt-BR", "pt-PT"]) expect(getSectDescription(sect, language)).toBe(language?.startsWith("pt") ? entry.pt : entry.en);
    }
  });
  it("does not infer sect from aliases, houses, booleans, altitude or inherited keys", () => {
    for (const sect of ["day", "night", "Diurnal", "Nocturnal", "diurnal ", "sun", "moon", "ascendant", "constructor", "__proto__", "toString", "unknown", "", null, undefined, true, false, 0, 1, 7, 12, { altitude: 1 }]) {
      expect(getSectDescriptionEntry(sect as Sect)).toBeUndefined();
      expect(getSectDescription(sect as Sect, "pt")).toBeUndefined();
    }
  });
  it("deeply freezes the two exact five-field records and bilingual metadata", () => {
    function frozen(value: unknown): void {
      if (value && typeof value === "object") {
        expect(Object.isFrozen(value)).toBe(true);
        for (const child of Object.values(value)) frozen(child);
      }
    }
    frozen(ASTROLOGY_DESCRIPTIONS.sects);
    for (const sect of sects) {
      const entry = getSectDescriptionEntry(sect)!;
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
