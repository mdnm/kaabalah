import { describe, expect, it } from "vitest";
import type { Sign } from "./dignity";
import {
  ASTROLOGY_DESCRIPTIONS,
  getPlanetSignDescription,
  getPlanetSignDescriptionEntry,
  type DescriptionPlanet,
} from "./descriptions";

const signs = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const satisfies readonly Sign[];

// Audited 2026-11-16 source snapshot from astrology-inventory-sources.json.
// One-based inclusive teaching ends; the next line starts private NOTAS.
// Keep the fixture here so regular tests require neither AKASH nor research files.
const teachingEnds = [
  441, 747, 161, 782, 603, 934, 602, 1561, 1521, 1833, 2999, 1557,
  1769, 1609, 1599, 798, 5271, 468, 1065, 6948, 290, 882, 29,
];
const sourceBounds = new Map<string, number>(teachingEnds.map((end, n) => [
  `modulo 4/aula ${n} modulo 4/aula-${n}.md`, end,
]));
sourceBounds.set("books/astrologia-hermetica/astrologia-hermetica.md", 123692);

function expectDeepFrozen(value: unknown): void {
  if (value !== null && typeof value === "object") {
    expect(Object.isFrozen(value)).toBe(true);
    for (const child of Object.values(value)) expectDeepFrozen(child);
  }
}

describe("Sun in signs descriptions", () => {
  it("contains all twelve canonical Sun signs", () => {
    expect(Object.keys(ASTROLOGY_DESCRIPTIONS.planetSigns.sun!).sort()).toEqual([...signs].sort());
    for (const sign of signs) {
      const entry = getPlanetSignDescriptionEntry("sun", sign)!;
      expect(entry).toBe(ASTROLOGY_DESCRIPTIONS.planetSigns.sun![sign]);
      expect(entry.en.trim().length).toBeGreaterThan(0);
      expect(entry.pt.trim().length).toBeGreaterThan(0);
      expect(entry.en).not.toBe(entry.pt);
    }
  });

  it("defaults to English and selects Portuguese only by the pt prefix", () => {
    for (const sign of signs) {
      const entry = getPlanetSignDescriptionEntry("sun", sign)!;
      for (const language of [undefined, "en", "en-US", "es", "", "PT-BR"]) {
        expect(getPlanetSignDescription("sun", sign, language)).toBe(entry.en);
      }
      for (const language of ["pt", "pt-BR", "pt-PT"]) {
        expect(getPlanetSignDescription("sun", sign, language)).toBe(entry.pt);
      }
    }
  });

  it("returns undefined for unsupported, misspelled, and inherited keys without fallback", () => {
    // Pluto is currently unimplemented; update this fixture when its set is authored.
    for (const sign of signs) {
      expect(getPlanetSignDescriptionEntry("pluto", sign)).toBeUndefined();
      expect(getPlanetSignDescription("pluto", sign)).toBeUndefined();
      expect(getPlanetSignDescription("pluto", sign, "pt")).toBeUndefined();
    }
    const invalidKeys = ["Sun", "aries", "Unknown", "", "__proto__", "constructor", "toString", "hasOwnProperty", "valueOf"];
    for (const key of invalidKeys) {
      // Runtime callers can supply strings outside the TypeScript contract.
      const planet = key as DescriptionPlanet;
      const sign = key as Sign;
      expect(getPlanetSignDescriptionEntry(planet, "Aries")).toBeUndefined();
      expect(getPlanetSignDescriptionEntry("sun", sign)).toBeUndefined();
      for (const language of [undefined, "en", "pt-BR"]) {
        expect(getPlanetSignDescription(planet, "Aries", language)).toBeUndefined();
        expect(getPlanetSignDescription("sun", sign, language)).toBeUndefined();
      }
    }
  });

  it("preserves Virgo's heightened self-assertion and increased egocentrism", () => {
    const entry = getPlanetSignDescriptionEntry("sun", "Virgo")!;
    expect(entry.pt).toContain("necessidade acentuada de se afirmar");
    expect(entry.pt).toContain("essa afirmação pode aumentar o egocentrismo");
    expect(entry.en).toContain("heightened need to assert yourself");
    expect(entry.en).toContain("that self-assertion can increase self-centeredness");
  });

  it("preserves Aquarius's heightened self-concern with the Sun in detriment", () => {
    const entry = getPlanetSignDescriptionEntry("sun", "Aquarius")!;
    expect(entry.pt).toContain("Sol em exílio acentua a preocupação consigo");
    expect(entry.en).toContain("Sun in detriment heightens self-concern");
  });

  it("preserves Pisces's reflection before impulse and discipline", () => {
    const entry = getPlanetSignDescriptionEntry("sun", "Pisces")!;
    expect(entry.pt).toContain("refletir antes de seguir o primeiro impulso");
    expect(entry.pt).toContain("trazendo disciplina e equilíbrio à sensibilidade");
    expect(entry.en).toContain("reflect before following the first impulse");
    expect(entry.en).toContain("bringing discipline and balance to sensitivity");
  });

  it("uses no em dash in Sun descriptions or metadata", () => {
    expect(JSON.stringify(ASTROLOGY_DESCRIPTIONS.planetSigns.sun)).not.toContain("\u2014");
  });

  it("deeply freezes shared entries, keyword arrays, review notes, and source records", () => {
    expectDeepFrozen(ASTROLOGY_DESCRIPTIONS);
    const entry = getPlanetSignDescriptionEntry("sun", "Aries")!;
    const original = entry.en;
    expect(Reflect.set(ASTROLOGY_DESCRIPTIONS, "planetSigns", {})).toBe(false);
    expect(Reflect.set(ASTROLOGY_DESCRIPTIONS.planetSigns, "sun", {})).toBe(false);
    expect(Reflect.set(ASTROLOGY_DESCRIPTIONS.planetSigns.sun!, "Aries", {})).toBe(false);
    expect(Reflect.set(entry, "en", "changed")).toBe(false);
    expect(Reflect.set(entry.keywords, "pt", [])).toBe(false);
    expect(Reflect.set(entry.keywords.pt, "0", "changed")).toBe(false);
    expect(Reflect.set(entry.keywords.en, "0", "changed")).toBe(false);
    expect(Reflect.set(entry.reviewNotes, "0", "changed")).toBe(false);
    expect(Reflect.set(entry.src, "0", {})).toBe(false);
    expect(Reflect.set(entry.src[0], "from", 0)).toBe(false);
    expect(getPlanetSignDescription("sun", "Aries")).toBe(original);
  });

  it("provides nonempty paired bilingual keywords and string review notes", () => {
    for (const sign of signs) {
      const entry = getPlanetSignDescriptionEntry("sun", sign)!;
      expect(entry.keywords.pt.length).toBeGreaterThan(0);
      expect(entry.keywords.en).toHaveLength(entry.keywords.pt.length);
      for (const keyword of [...entry.keywords.pt, ...entry.keywords.en]) {
        expect(typeof keyword).toBe("string");
        expect(keyword.trim().length).toBeGreaterThan(0);
      }
      expect(Array.isArray(entry.reviewNotes)).toBe(true);
      for (const note of entry.reviewNotes) {
        expect(typeof note).toBe("string");
        expect(note.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("cites integer inclusive bounds in audited course-relative sources before NOTAS", () => {
    for (const sign of signs) {
      const entry = getPlanetSignDescriptionEntry("sun", sign)!;
      expect(entry.src.length).toBeGreaterThan(0);
      for (const source of entry.src) {
        expect(typeof source.file).toBe("string");
        expect(source.file.startsWith("/")).toBe(false);
        expect(source.file).not.toMatch(/\\|(^|\/)\.\.?($|\/)|NOTAS/i);
        const end = sourceBounds.get(source.file);
        expect(end, `Unaudited source: ${source.file}`).toBeDefined();
        expect(Number.isSafeInteger(source.from)).toBe(true);
        expect(Number.isSafeInteger(source.to)).toBe(true);
        expect(source.from).toBeGreaterThanOrEqual(1);
        expect(source.to).toBeGreaterThanOrEqual(source.from);
        expect(source.to).toBeLessThanOrEqual(end!);
      }
    }
  });
});
