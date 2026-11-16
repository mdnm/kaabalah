import { describe, expect, it } from "vitest";
import {
  ASTROLOGY_DESCRIPTIONS,
  getPlanetHouseDescription,
  getPlanetHouseDescriptionEntry,
  type DescriptionHouseNumber,
  type DescriptionPlanet,
} from "./descriptions";

const houses = Array.from({ length: 12 }, (_, i) => i + 1) as DescriptionHouseNumber[];
const planets: readonly DescriptionPlanet[] = [
  "sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto",
];
const authored = planets.filter(planet => Object.prototype.hasOwnProperty.call(ASTROLOGY_DESCRIPTIONS.planetHouses, planet));
// Independent audited teaching bounds, from the committed 2026-11-16 source manifest.
// CI uses the snapshot metadata and does not require the mounted private course.
const sourceEnds = new Map([
  ["modulo 4/aula 8 modulo 4/aula-8.md", 1521],
  ["modulo 4/aula 9 modulo 4/aula-9.md", 1833],
  ["modulo 4/aula 10 modulo 4/aula-10.md", 2999],
  ["books/astrologia-hermetica/astrologia-hermetica.md", 123692],
]);

it("has the audited Sun-house set and only canonical authored planet keys", () => {
  expect(authored).toContain("sun");
  expect(Object.keys(ASTROLOGY_DESCRIPTIONS.planetHouses).sort()).toEqual([...authored].sort());
});

describe.each(authored)("%s in houses descriptions", planet => {
  it("covers precisely twelve one-based house numbers with bilingual metadata", () => {
    expect(Object.keys(ASTROLOGY_DESCRIPTIONS.planetHouses[planet]!)).toEqual(houses.map(String));
    for (const house of houses) {
      const entry = getPlanetHouseDescriptionEntry(planet, house)!;
      expect(entry).toBe(ASTROLOGY_DESCRIPTIONS.planetHouses[planet]![house]);
      for (const text of [entry.pt, entry.en]) {
        expect(text.trim().length).toBeGreaterThan(0);
        expect(text).not.toMatch(/o curso|the course|o livro|the book|foi omitido|was omitted|não entram na descrição|not included in the description/i);
      }
      expect(entry.pt).not.toBe(entry.en);
      expect(entry.keywords.pt.length).toBeGreaterThan(0);
      expect(entry.keywords.en).toHaveLength(entry.keywords.pt.length);
      for (const keyword of [...entry.keywords.pt, ...entry.keywords.en]) expect(keyword.trim()).not.toBe("");
      expect(Array.isArray(entry.reviewNotes)).toBe(true);
      expect(JSON.stringify(entry)).not.toContain("\u2014");
    }
  });

  it("uses English by default and the exact Portuguese locale-prefix convention", () => {
    for (const house of houses) {
      const entry = getPlanetHouseDescriptionEntry(planet, house)!;
      for (const language of [undefined, "", "en", "es", "PT-BR"]) {
        expect(getPlanetHouseDescription(planet, house, language)).toBe(entry.en);
      }
      for (const language of ["pt", "pt-BR", "pt-PT"]) {
        expect(getPlanetHouseDescription(planet, house, language)).toBe(entry.pt);
      }
    }
  });

  it("rejects unsupported houses and inherited/runtime keys without clamping or fallback", () => {
    for (const value of [0, -1, 13, 1.5, NaN, Infinity, -Infinity, "1", "constructor", "__proto__", null]) {
      const house = value as number;
      expect(getPlanetHouseDescriptionEntry(planet, house)).toBeUndefined();
      expect(getPlanetHouseDescription(planet, house, "pt-BR")).toBeUndefined();
    }
    for (const value of ["unknown", "Sun", "constructor", "__proto__", "toString", "hasOwnProperty"]) {
      expect(getPlanetHouseDescriptionEntry(value as DescriptionPlanet, 1)).toBeUndefined();
    }
    for (const absent of planets.filter(key => !authored.includes(key))) {
      expect(getPlanetHouseDescriptionEntry(absent, 1)).toBeUndefined();
      expect(getPlanetHouseDescription(absent, 1)).toBeUndefined();
    }
  });

  it("keeps every nested entry and source record immutable", () => {
    const entry = getPlanetHouseDescriptionEntry(planet, 1)!;
    function frozen(value: unknown): void {
      if (value !== null && typeof value === "object") {
        expect(Object.isFrozen(value)).toBe(true);
        for (const child of Object.values(value)) frozen(child);
      }
    }
    frozen(ASTROLOGY_DESCRIPTIONS.planetHouses[planet]);
    expect(Object.isFrozen(ASTROLOGY_DESCRIPTIONS.planetHouses)).toBe(true);
    expect(Reflect.set(entry, "en", "changed")).toBe(false);
    expect(Reflect.set(entry.keywords.pt, "0", "changed")).toBe(false);
    expect(Reflect.set(entry.src[0], "from", 0)).toBe(false);
    expect(Reflect.set(entry.reviewNotes, "0", "changed")).toBe(false);
  });

  it("cites eligible course-relative integer inclusive ranges before private NOTAS", () => {
    for (const house of houses) {
      const entry = getPlanetHouseDescriptionEntry(planet, house)!;
      expect(entry.src.length).toBeGreaterThan(0);
      for (const source of entry.src) {
        expect(source.file).not.toMatch(/^\/|\\|(^|\/)\.\.?($|\/)|NOTAS/i);
        const end = sourceEnds.get(source.file);
        expect(end, `Unaudited source ${source.file}`).toBeDefined();
        expect(Number.isSafeInteger(source.from)).toBe(true);
        expect(Number.isSafeInteger(source.to)).toBe(true);
        expect(source.from).toBeGreaterThanOrEqual(1);
        expect(source.to).toBeGreaterThanOrEqual(source.from);
        expect(source.to).toBeLessThanOrEqual(end!);
      }
    }
  });
});
