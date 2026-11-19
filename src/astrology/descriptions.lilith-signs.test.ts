import { describe, expect, it } from "vitest";
import { ASTROLOGY_DESCRIPTIONS, getPointDescriptionEntry, getPointSignDescription, getPointSignDescriptionEntry, getPointHouseDescriptionEntry, type DescriptionPoint } from "./descriptions";
import type { Sign } from "./dignity";
const signs: Sign[] = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const modes = ["lilith mean", "lilith true"] as const;
describe("Lilith sign interpretation aliases", () => {
  it("stores twelve canonical entries with twenty-four same-sign mode aliases", () => {
    expect(Object.keys(ASTROLOGY_DESCRIPTIONS.pointSigns!)).toEqual(["parsFortunae", "lilith mean"]);
    expect(Object.keys(ASTROLOGY_DESCRIPTIONS.pointSigns!["lilith mean"]!)).toEqual(signs);
    expect(ASTROLOGY_DESCRIPTIONS.pointSigns).not.toHaveProperty("lilith true");
    expect(ASTROLOGY_DESCRIPTIONS.pointSigns).not.toHaveProperty("lilith");
    for (const sign of signs) {
      const entry = getPointSignDescriptionEntry("lilith mean", sign)!;
      expect(entry).toBe(ASTROLOGY_DESCRIPTIONS.pointSigns!["lilith mean"]![sign]);
      expect(getPointSignDescriptionEntry("lilith true", sign)).toBe(entry);
      expect(entry).not.toBe(getPointDescriptionEntry("lilith mean"));
    }
    expect(new Set(signs.map(sign => getPointSignDescriptionEntry("lilith mean", sign))).size).toBe(12);
    expect(getPointSignDescriptionEntry("lilith true", "Taurus")).not.toBe(getPointSignDescriptionEntry("lilith mean", "Aries"));
    expect(getPointSignDescriptionEntry("lilith true", "Taurus")).toBe(ASTROLOGY_DESCRIPTIONS.pointSigns!["lilith mean"]!.Taurus);
  });
  it("preserves locales across both aliases", () => {
    for (const mode of modes) for (const sign of signs) {
      const entry = getPointSignDescriptionEntry(mode, sign)!;
      for (const language of [undefined, "", "en", "es", "PT-BR", "pt", "pt-BR", "pt-PT"]) expect(getPointSignDescription(mode, sign, language)).toBe(language?.startsWith("pt") ? entry.pt : entry.en);
    }
  });
  it("rejects unsupported points/signs and rejects invalid houses", () => {
    for (const point of ["lilith", "Lilith Mean", "Lilith True", "lilithMean", "lilithTrue", "lilith true ", "priapus", "constructor", "__proto__", "toString", "", null]) expect(getPointSignDescriptionEntry(point as DescriptionPoint, "Aries")).toBeUndefined();
    for (const mode of modes) {
      for (const sign of ["aries", "ARIES", "Áries", "unknown", "constructor", "__proto__", "toString", "", null]) {
        expect(getPointSignDescriptionEntry(mode, sign as Sign)).toBeUndefined();
        expect(getPointSignDescription(mode, sign as Sign, "pt")).toBeUndefined();
      }
      for (const house of [0, 13, 1.5, NaN, Infinity, "1", null]) expect(getPointHouseDescriptionEntry(mode, house as number)).toBeUndefined();
    }
  });
  it("preserves Chiron shared accounts and Fortune independent manners/fields", () => {
    expect(getPointSignDescriptionEntry("chiron", "Aries")).toBe(getPointHouseDescriptionEntry("chiron", 1));
    expect(getPointSignDescriptionEntry("parsFortunae", "Aries")).toBe(ASTROLOGY_DESCRIPTIONS.pointSigns!.parsFortunae!.Aries);
    expect(getPointSignDescriptionEntry("parsFortunae", "Aries")).not.toBe(getPointHouseDescriptionEntry("parsFortunae", 1));
  });
  it("deeply freezes exact five-field entries and paired metadata", () => {
    function frozen(value: unknown): void {
      if (value && typeof value === "object") {
        expect(Object.isFrozen(value)).toBe(true);
        for (const child of Object.values(value)) frozen(child);
      }
    }
    frozen(ASTROLOGY_DESCRIPTIONS.pointSigns!["lilith mean"]);
    for (const sign of signs) {
      const entry = getPointSignDescriptionEntry("lilith mean", sign)!;
      expect(entry.keywords.pt.length).toBeGreaterThan(0);
      expect(entry.keywords.en).toHaveLength(entry.keywords.pt.length);
      expect(Reflect.set(entry, "pt", "changed")).toBe(false);
      expect(Reflect.set(entry.keywords.en, "0", "changed")).toBe(false);
    }
  });
});
