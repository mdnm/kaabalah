import { describe, expect, it } from "vitest";
import {
  DOMICILE_RULERS,
  EXALTATIONS,
  getDomicileRuler,
  getExaltation,
  getOppositeSign,
  getDetriment,
  getFall,
  getEssentialDignity,
  type Sign,
} from "./dignity";

describe("Essential Dignity Table", () => {
  describe("getDomicileRuler", () => {
    const expected: [Sign, string][] = [
      ["Aries", "Mars"],
      ["Taurus", "Venus"],
      ["Gemini", "Mercury"],
      ["Cancer", "Moon"],
      ["Leo", "Sun"],
      ["Virgo", "Mercury"],
      ["Libra", "Venus"],
      ["Scorpio", "Mars"],
      ["Sagittarius", "Jupiter"],
      ["Capricorn", "Saturn"],
      ["Aquarius", "Saturn"],
      ["Pisces", "Jupiter"],
    ];

    it.each(expected)("%s is ruled by %s", (sign, ruler) => {
      expect(getDomicileRuler(sign)).toBe(ruler);
    });
  });

  describe("getExaltation", () => {
    it.each([
      ["Sun", "Aries", 19],
      ["Moon", "Taurus", 3],
      ["Mercury", "Virgo", 15],
      ["Venus", "Pisces", 27],
      ["Mars", "Capricorn", 28],
      ["Jupiter", "Cancer", 15],
      ["Saturn", "Libra", 21],
    ] as const)("%s is exalted in %s at %d degrees", (planet, sign, degree) => {
      const result = getExaltation(planet);
      expect(result.sign).toBe(sign);
      expect(result.degree).toBe(degree);
    });
  });

  describe("getOppositeSign", () => {
    const pairs: [Sign, Sign][] = [
      ["Aries", "Libra"],
      ["Taurus", "Scorpio"],
      ["Gemini", "Sagittarius"],
      ["Cancer", "Capricorn"],
      ["Leo", "Aquarius"],
      ["Virgo", "Pisces"],
      ["Libra", "Aries"],
      ["Scorpio", "Taurus"],
      ["Sagittarius", "Gemini"],
      ["Capricorn", "Cancer"],
      ["Aquarius", "Leo"],
      ["Pisces", "Virgo"],
    ];

    it.each(pairs)("opposite of %s is %s", (sign, opposite) => {
      expect(getOppositeSign(sign)).toBe(opposite);
    });
  });

  describe("getDetriment", () => {
    it("Sun is in detriment in Aquarius", () => {
      expect(getDetriment("Sun")).toEqual(["Aquarius"]);
    });

    it("Mars is in detriment in Libra and Taurus", () => {
      expect(getDetriment("Mars").sort()).toEqual(["Libra", "Taurus"].sort());
    });

    it("Venus is in detriment in Aries and Scorpio", () => {
      expect(getDetriment("Venus").sort()).toEqual(["Aries", "Scorpio"].sort());
    });
  });

  describe("getFall", () => {
    it("Sun falls in Libra", () => {
      expect(getFall("Sun")).toBe("Libra");
    });

    it("Moon falls in Scorpio", () => {
      expect(getFall("Moon")).toBe("Scorpio");
    });

    it("Saturn falls in Aries", () => {
      expect(getFall("Saturn")).toBe("Aries");
    });
  });

  describe("getEssentialDignity", () => {
    it("Sun in Leo = domicile", () => {
      const result = getEssentialDignity("Sun", "Leo");
      expect(result.domicile).toBe(true);
      expect(result.exaltation).toBe(false);
      expect(result.detriment).toBe(false);
      expect(result.fall).toBe(false);
      expect(result.peregrine).toBe(false);
      expect(result.domicileRuler).toBe("Sun");
    });

    it("Sun in Aries = exaltation", () => {
      const result = getEssentialDignity("Sun", "Aries");
      expect(result.exaltation).toBe(true);
      expect(result.domicile).toBe(false);
      expect(result.peregrine).toBe(false);
    });

    it("Sun in Aquarius = detriment", () => {
      const result = getEssentialDignity("Sun", "Aquarius");
      expect(result.detriment).toBe(true);
      expect(result.domicile).toBe(false);
      expect(result.peregrine).toBe(false);
    });

    it("Sun in Libra = fall", () => {
      const result = getEssentialDignity("Sun", "Libra");
      expect(result.fall).toBe(true);
      expect(result.domicile).toBe(false);
      expect(result.peregrine).toBe(false);
    });

    it("Sun in Taurus = peregrine", () => {
      const result = getEssentialDignity("Sun", "Taurus");
      expect(result.peregrine).toBe(true);
      expect(result.domicile).toBe(false);
      expect(result.exaltation).toBe(false);
      expect(result.detriment).toBe(false);
      expect(result.fall).toBe(false);
      expect(result.domicileRuler).toBe("Venus");
    });

    it("Mercury in Virgo = domicile + exaltation", () => {
      const result = getEssentialDignity("Mercury", "Virgo");
      expect(result.domicile).toBe(true);
      expect(result.exaltation).toBe(true);
      expect(result.peregrine).toBe(false);
    });
  });
});
