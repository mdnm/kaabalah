import { describe, expect, it } from "vitest";
import { getAstrologyLabel, ASTROLOGY_LABELS, getDecan, getFirdaria, SIGNS, DEFAULT_ASPECT_SPECS } from "./index";
import { DOMICILE_RULERS } from "./dignity";

describe("Portuguese astrology display labels", () => {
  it("covers every decan, dignity ruler, aspect and firdaria identifier", () => {
    for (let longitude = 0; longitude < 360; longitude += 10) {
      const result = getDecan(longitude);
      expect(ASTROLOGY_LABELS[result.sign]).toBeDefined();
      expect(ASTROLOGY_LABELS[result.ruler]).toBeDefined();
      expect(getAstrologyLabel(result.tarotCard, "pt-BR")).not.toBe(result.tarotCard);
    }
    for (const sign of SIGNS) {
      expect(ASTROLOGY_LABELS[sign]).toBeDefined();
      expect(ASTROLOGY_LABELS[DOMICILE_RULERS[sign]]).toBeDefined();
    }
    for (const aspect of DEFAULT_ASPECT_SPECS) expect(ASTROLOGY_LABELS[aspect.name]).toBeDefined();
    for (const diurnal of [true, false]) {
      const result = getFirdaria(new Date(1990, 0, 1, 12), diurnal, new Date(2026, 0, 1, 12));
      expect(ASTROLOGY_LABELS[result.sect]).toBeDefined();
      for (const period of result.allPeriods) expect(ASTROLOGY_LABELS[period.planet]).toBeDefined();
    }
    for (const key of ["domicile", "exaltation", "detriment", "fall", "peregrine"]) expect(ASTROLOGY_LABELS[key]).toBeDefined();
  });
  it("has no empty rows and keeps English as the default", () => {
    for (const [key, row] of Object.entries(ASTROLOGY_LABELS)) {
      expect(row.pt.trim()).toBeTruthy();
      expect(row.pt).not.toContain("\u2014");
      expect(getAstrologyLabel(key)).toBe(key);
      expect(getAstrologyLabel(key, "fr")).toBe(key);
      expect(getAstrologyLabel(key, "pt")).toBe(row.pt);
    }
  });
});
