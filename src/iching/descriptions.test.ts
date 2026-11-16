import { describe, expect, it } from "vitest";
import { HEXAGRAMS } from "./data";
import { getHexagramDescription, HEXAGRAM_DESCRIPTIONS } from "./descriptions";

describe("hexagram descriptions", () => {
  it("has plain words in both languages for every hexagram", () => {
    expect(Object.keys(HEXAGRAM_DESCRIPTIONS.hexagrams)).toHaveLength(64);
    for (const hexagram of HEXAGRAMS) {
      const row = HEXAGRAM_DESCRIPTIONS.hexagrams[String(hexagram.number)];
      expect(row.en.trim().length).toBeGreaterThan(0);
      expect(row.pt.trim().length).toBeGreaterThan(0);
      expect(getHexagramDescription(hexagram.number)).toBe(row.en);
      expect(getHexagramDescription(hexagram.number, "en")).toBe(row.en);
      expect(getHexagramDescription(hexagram.number, "pt")).toBe(row.pt);
      expect(getHexagramDescription(hexagram.number, "pt-BR")).toBe(row.pt);
    }
    expect(getHexagramDescription(0)).toBeUndefined();
    expect(getHexagramDescription(65, "pt")).toBeUndefined();
  });

  it("keeps the descriptions frozen", () => {
    const original = HEXAGRAM_DESCRIPTIONS.hexagrams[1].en;
    expect(Reflect.set(HEXAGRAM_DESCRIPTIONS.hexagrams[1], "en", "changed")).toBe(false);
    expect(Reflect.set(HEXAGRAM_DESCRIPTIONS.hexagrams, "1", {})).toBe(false);
    expect(HEXAGRAM_DESCRIPTIONS.hexagrams[1].en).toBe(original);
  });
});
