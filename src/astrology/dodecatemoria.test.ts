import { describe, expect, it } from "vitest";
import { getDodecatemoria } from "./dodecatemoria";

describe("Dodecatemoria (12th parts)", () => {
  it("0 degrees Aries (0.0) = index 0 = Aries", () => {
    const result = getDodecatemoria(0);
    expect(result.originalSign).toBe("Aries");
    expect(result.dodecatemoriaIndex).toBe(0);
    expect(result.dodecatemoriaSign).toBe("Aries");
  });

  it("5 degrees Aries (5.0) = index 2 = Gemini", () => {
    const result = getDodecatemoria(5);
    expect(result.originalSign).toBe("Aries");
    expect(result.originalDegree).toBeCloseTo(5);
    expect(result.dodecatemoriaIndex).toBe(2);
    expect(result.dodecatemoriaSign).toBe("Gemini");
  });

  it("27.5 degrees Aries = index 11 = Pisces", () => {
    const result = getDodecatemoria(27.5);
    expect(result.originalSign).toBe("Aries");
    expect(result.dodecatemoriaIndex).toBe(11);
    expect(result.dodecatemoriaSign).toBe("Pisces");
  });

  it("0 degrees Taurus (30.0) = index 0 = Taurus", () => {
    const result = getDodecatemoria(30);
    expect(result.originalSign).toBe("Taurus");
    expect(result.dodecatemoriaIndex).toBe(0);
    expect(result.dodecatemoriaSign).toBe("Taurus");
  });

  it("full cycle: 12 chunks of 2.5 degrees map to successive signs", () => {
    // Starting from Aries
    for (let i = 0; i < 12; i++) {
      const longitude = i * 2.5;
      const result = getDodecatemoria(longitude);
      expect(result.originalSign).toBe("Aries");
      expect(result.dodecatemoriaIndex).toBe(i);
      // Aries index 0 + i, mod 12
      const expectedSigns = [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
      ];
      expect(result.dodecatemoriaSign).toBe(expectedSigns[i]);
    }
  });

  it("Scorpio at 17.5 degrees = index 7 = Gemini", () => {
    // Scorpio = sign index 7, degreeWithinSign = 17.5, index = floor(17.5/2.5) = 7
    // dodecatemoriaSignIndex = (7 + 7) % 12 = 2 = Gemini
    const result = getDodecatemoria(7 * 30 + 17.5);
    expect(result.originalSign).toBe("Scorpio");
    expect(result.dodecatemoriaIndex).toBe(7);
    expect(result.dodecatemoriaSign).toBe("Gemini");
  });

  it("wraps at 360 degrees", () => {
    const result = getDodecatemoria(360);
    expect(result.originalSign).toBe("Aries");
    expect(result.dodecatemoriaSign).toBe("Aries");
  });
});
