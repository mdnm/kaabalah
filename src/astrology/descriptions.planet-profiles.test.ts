import { describe, expect, expectTypeOf, it } from "vitest";
import {
  ASTROLOGY_DESCRIPTIONS, getPlanetDescription, getPlanetDescriptionEntry,
  type DescriptionPlanet, type PlanetDescriptionEntry,
} from "./descriptions";

const planets: readonly DescriptionPlanet[] = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];
const sourceEnds = new Map([
  ["modulo 4/aula 1 modulo 4/aula-1.md", 747],
  ["modulo 4/aula 3 modulo 4/aula-3.md", 782],
  ["modulo 4/aula 4 modulo 4/aula-4.md", 603],
  ["modulo 4/aula 8 modulo 4/aula-8.md", 1521],
  ["modulo 4/aula 13 modulo 4/aula-13.md", 1609],
  ["books/astrologia-hermetica/astrologia-hermetica.md", 123692],
]);

function assertFrozen(value: unknown): void {
  if (value !== null && typeof value === "object") {
    expect(Object.isFrozen(value)).toBe(true);
    for (const child of Object.values(value)) assertFrozen(child);
  }
}

describe("basic planet profile API", () => {
  it("exposes ten canonical typed profiles and deeply immutable metadata", () => {
    expectTypeOf(getPlanetDescriptionEntry).returns.toEqualTypeOf<PlanetDescriptionEntry | undefined>();
    expectTypeOf(getPlanetDescription).returns.toEqualTypeOf<string | undefined>();
    expect(Object.keys(ASTROLOGY_DESCRIPTIONS.planets!).sort()).toEqual([...planets].sort());
    assertFrozen(ASTROLOGY_DESCRIPTIONS.planets);
    for (const planet of planets) {
      const entry = getPlanetDescriptionEntry(planet)!;
      expect(entry).toBe(ASTROLOGY_DESCRIPTIONS.planets![planet]);
      expect(entry.pt.trim()).not.toBe("");
      expect(entry.en.trim()).not.toBe("");
      expect(entry.pt).not.toBe(entry.en);
      expect(entry.keywords.pt.length).toBeGreaterThan(0);
      expect(entry.keywords.en).toHaveLength(entry.keywords.pt.length);
      expect(Reflect.set(entry, "pt", "changed")).toBe(false);
      expect(Reflect.set(entry.src[0], "from", 0)).toBe(false);
      expect(entry.src.length).toBeGreaterThan(0);
      expect(JSON.stringify(entry)).not.toContain("\u2014");
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

  it("uses English by default and Portuguese only for the exact pt prefix", () => {
    for (const planet of planets) {
      const entry = getPlanetDescriptionEntry(planet)!;
      for (const language of [undefined, "", "en", "es", "PT-BR"]) expect(getPlanetDescription(planet, language)).toBe(entry.en);
      for (const language of ["pt", "pt-BR", "pt-PT"]) expect(getPlanetDescription(planet, language)).toBe(entry.pt);
    }
  });

  it("keeps unsupported, noncanonical and inherited keys as explicit gaps", () => {
    for (const invalid of ["earth", "vulcan", "north node", "chiron", "Sun", "SUN", "unknown", "constructor", "__proto__"]) {
      expect(getPlanetDescriptionEntry(invalid as DescriptionPlanet)).toBeUndefined();
      expect(getPlanetDescription(invalid as DescriptionPlanet, "pt-BR")).toBeUndefined();
    }
  });
});
