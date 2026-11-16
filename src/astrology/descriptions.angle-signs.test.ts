import { expect, expectTypeOf, it, describe } from "vitest";
import {
  ASTROLOGY_DESCRIPTIONS,
  getAngleSignDescription,
  getAngleSignDescriptionEntry,
  type DescriptionAngle,
  type AngleSignDescriptionEntry,
} from "./descriptions";
import type { Sign } from "./dignity";

const angles: readonly DescriptionAngle[] = ["ascendant", "mc", "dc", "ic"];
const signs: readonly Sign[] = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const authored = angles.filter(angle => Object.prototype.hasOwnProperty.call(ASTROLOGY_DESCRIPTIONS.angleSigns ?? {}, angle));
const sourceEnds = new Map([
  ["modulo 4/aula 6 modulo 4/aula-6.md", 602],
  ["modulo 4/aula 8 modulo 4/aula-8.md", 1521],
  ["modulo 4/aula 9 modulo 4/aula-9.md", 1833],
  ["modulo 4/aula 10 modulo 4/aula-10.md", 2999],
  ["books/astrologia-hermetica/astrologia-hermetica.md", 123692],
]);

it("exposes typed chart-angle entries with the authored Ascendant set and explicit Descendant gap", () => {
  expectTypeOf(getAngleSignDescriptionEntry).returns.toEqualTypeOf<AngleSignDescriptionEntry | undefined>();
  expectTypeOf(getAngleSignDescription).returns.toEqualTypeOf<string | undefined>();
  expect(authored).toContain("ascendant");
  expect(Object.keys(ASTROLOGY_DESCRIPTIONS.angleSigns!)).toEqual(expect.arrayContaining(authored));
  expect(Object.keys(ASTROLOGY_DESCRIPTIONS.angleSigns!).sort()).toEqual([...authored].sort());
  // Supplemental-only Descendant coverage needs a separate scope decision.
  expect(ASTROLOGY_DESCRIPTIONS.angleSigns?.dc).toBeUndefined();
});

describe.each(authored)("%s sign descriptions API", angle => {
  it("covers twelve canonical signs with bilingual content and immutable provenance", () => {
    expect(Object.keys(ASTROLOGY_DESCRIPTIONS.angleSigns![angle]!).sort()).toEqual([...signs].sort());
    function frozen(value: unknown): void {
      if (value !== null && typeof value === "object") {
        expect(Object.isFrozen(value)).toBe(true);
        for (const child of Object.values(value)) frozen(child);
      }
    }
    frozen(ASTROLOGY_DESCRIPTIONS.angleSigns);
    for (const sign of signs) {
      const entry = getAngleSignDescriptionEntry(angle, sign)!;
      expect(entry).toBe(ASTROLOGY_DESCRIPTIONS.angleSigns![angle]![sign]);
      expect(entry.pt.trim()).not.toBe("");
      expect(entry.en.trim()).not.toBe("");
      expect(entry.pt).not.toBe(entry.en);
      expect(entry.keywords.pt.length).toBeGreaterThan(0);
      expect(entry.keywords.en).toHaveLength(entry.keywords.pt.length);
      expect(Array.isArray(entry.reviewNotes)).toBe(true);
      expect(JSON.stringify(entry)).not.toContain("\u2014");
      expect(Reflect.set(entry, "pt", "changed")).toBe(false);
      expect(Reflect.set(entry.src[0], "from", 0)).toBe(false);
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

  it("uses exact language-prefix selection", () => {
    for (const sign of signs) {
      const entry = getAngleSignDescriptionEntry(angle, sign)!;
      for (const language of [undefined, "", "en", "es", "PT-BR"]) expect(getAngleSignDescription(angle, sign, language)).toBe(entry.en);
      for (const language of ["pt", "pt-BR", "pt-PT"]) expect(getAngleSignDescription(angle, sign, language)).toBe(entry.pt);
    }
  });

  it("returns gaps for absent angles, noncanonical signs and inherited keys without house/sign fallback", () => {
    for (const absent of angles.filter(key => !authored.includes(key))) expect(getAngleSignDescriptionEntry(absent, "Aries")).toBeUndefined();
    for (const invalid of ["unknown", "Ascendant", "midheaven", "constructor", "__proto__"]) expect(getAngleSignDescriptionEntry(invalid as DescriptionAngle, "Aries")).toBeUndefined();
    for (const invalid of ["aries", "unknown", "constructor", "__proto__"]) {
      expect(getAngleSignDescriptionEntry(angle, invalid as Sign)).toBeUndefined();
      expect(getAngleSignDescription(angle, invalid as Sign, "pt-BR")).toBeUndefined();
    }
  });
});
