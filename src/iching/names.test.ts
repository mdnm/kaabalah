import { describe, expect, it } from "vitest";
import { getHexagramName, HEXAGRAM_NAMES_PT, HEXAGRAMS } from "./data";

describe("hexagram display names", () => {
  it("provides all 64 Portuguese names alongside the existing English names", () => {
    expect(Object.keys(HEXAGRAM_NAMES_PT)).toHaveLength(64);
    for (const hexagram of HEXAGRAMS) {
      expect(hexagram.portuguese).toBeTruthy();
      expect(getHexagramName(hexagram.number, "pt-BR")).toBe(hexagram.portuguese);
      expect(getHexagramName(hexagram.number, "en")).toBe(hexagram.english);
    }
    expect(getHexagramName(52, "pt")).toBe("a montanha");
    expect(getHexagramName(30, "pt-BR")).toBe("o fogo");
    expect(getHexagramName(0, "pt-BR")).toBeUndefined();
    expect(getHexagramName(65)).toBeUndefined();
  });
});
