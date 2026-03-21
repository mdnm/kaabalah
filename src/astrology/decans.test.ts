import { describe, expect, it } from "vitest";
import { getDecan } from "./decans";

describe("Decans", () => {
  it("Aries 0 degrees = decan 1, Mars, Two of Wands", () => {
    const result = getDecan(0);
    expect(result.sign).toBe("Aries");
    expect(result.decanNumber).toBe(1);
    expect(result.ruler).toBe("Mars");
    expect(result.tarotCard).toBe("Two of Wands");
    expect(result.startDegree).toBe(0);
    expect(result.endDegree).toBe(10);
  });

  it("Aries 15 degrees = decan 2, Sun, Three of Wands", () => {
    const result = getDecan(15);
    expect(result.sign).toBe("Aries");
    expect(result.decanNumber).toBe(2);
    expect(result.ruler).toBe("Sun");
    expect(result.tarotCard).toBe("Three of Wands");
  });

  it("Taurus 0 degrees = decan 1, Mercury, Five of Pentacles", () => {
    const result = getDecan(30);
    expect(result.sign).toBe("Taurus");
    expect(result.decanNumber).toBe(1);
    expect(result.ruler).toBe("Mercury");
    expect(result.tarotCard).toBe("Five of Pentacles");
  });

  it("Pisces 25 degrees = decan 3, Mars, Ten of Cups", () => {
    const result = getDecan(355);
    expect(result.sign).toBe("Pisces");
    expect(result.decanNumber).toBe(3);
    expect(result.ruler).toBe("Mars");
    expect(result.tarotCard).toBe("Ten of Cups");
  });

  it("360 degrees wraps to 0 (Aries decan 1)", () => {
    const result = getDecan(360);
    expect(result.sign).toBe("Aries");
    expect(result.decanNumber).toBe(1);
    expect(result.ruler).toBe("Mars");
    expect(result.tarotCard).toBe("Two of Wands");
  });

  it("boundary: exactly 10.0 degrees = decan 2", () => {
    const result = getDecan(10);
    expect(result.decanNumber).toBe(2);
    expect(result.ruler).toBe("Sun");
  });

  it("boundary: exactly 20.0 degrees = decan 3", () => {
    const result = getDecan(20);
    expect(result.decanNumber).toBe(3);
    expect(result.ruler).toBe("Venus");
  });

  it("all 36 decans follow the Chaldean ruler cycle", () => {
    const chaldean = ["Mars", "Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter"];
    for (let i = 0; i < 36; i++) {
      const longitude = i * 10 + 5; // middle of each decan
      const result = getDecan(longitude);
      expect(result.ruler).toBe(chaldean[i % 7]);
    }
  });

  it("Gemini decan 3 (index 8) = Ten of Swords", () => {
    const result = getDecan(85); // Gemini 25 deg
    expect(result.sign).toBe("Gemini");
    expect(result.decanNumber).toBe(3);
    expect(result.tarotCard).toBe("Ten of Swords");
  });

  it("Cancer decan 1 (index 9) = Two of Cups", () => {
    const result = getDecan(90);
    expect(result.sign).toBe("Cancer");
    expect(result.decanNumber).toBe(1);
    expect(result.tarotCard).toBe("Two of Cups");
  });

  it("Leo decan 1 (index 12) = Five of Wands", () => {
    const result = getDecan(120);
    expect(result.sign).toBe("Leo");
    expect(result.decanNumber).toBe(1);
    expect(result.tarotCard).toBe("Five of Wands");
  });

  it("Capricorn decan 1 (index 27) = Two of Pentacles", () => {
    const result = getDecan(270);
    expect(result.sign).toBe("Capricorn");
    expect(result.decanNumber).toBe(1);
    expect(result.tarotCard).toBe("Two of Pentacles");
  });
});
