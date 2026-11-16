import { describe, expect, it } from "vitest";
import { calcLotOfFortune, calcLotOfSpirit, computeLots } from "./lots";

describe("lots of Fortune and Spirit", () => {
  // asc 100, sun 280, moon 30
  it("day: Fortune = ASC + Moon - Sun = 210, Spirit = ASC + Sun - Moon = 350", () => {
    expect(calcLotOfFortune(100, 280, 30, true)).toBeCloseTo(210, 12);
    expect(calcLotOfSpirit(100, 280, 30, true)).toBeCloseTo(350, 12);
  });
  it("night: Fortune = ASC + Sun - Moon = 350, Spirit = ASC + Moon - Sun = 210", () => {
    expect(calcLotOfFortune(100, 280, 30, false)).toBeCloseTo(350, 12);
    expect(calcLotOfSpirit(100, 280, 30, false)).toBeCloseTo(210, 12);
  });
  it("wraps modulo 360", () => {
    // asc 350, sun 10, moon 20: day Fortune 350+20-10 = 360 -> 0 ; Spirit 350+10-20 = 340
    expect(calcLotOfFortune(350, 10, 20, true)).toBeCloseTo(0, 12);
    expect(calcLotOfSpirit(350, 10, 20, true)).toBeCloseTo(340, 12);
    // asc 5, sun 300, moon 10 night Fortune: 5+300-10 = 295 ; Spirit: 5+10-300 = -285 -> 75
    expect(calcLotOfFortune(5, 300, 10, false)).toBeCloseTo(295, 12);
    expect(calcLotOfSpirit(5, 300, 10, false)).toBeCloseTo(75, 12);
  });
  it("computeLots reports the formulas and Fortune + Spirit = 2 ASC", () => {
    for (const sect of ["diurnal", "nocturnal"] as const) {
      const r = computeLots(123.4, 45.6, 301.2, sect);
      expect(((r.fortune + r.spirit - 2 * 123.4) % 360 + 360) % 360).toBeCloseTo(0, 9);
      expect(r.method.sectUsed).toBe(sect);
    }
    expect(computeLots(100, 280, 30, "diurnal").method.fortune).toBe("ASC + Moon - Sun");
    expect(computeLots(100, 280, 30, "nocturnal").method.spirit).toBe("ASC + Moon - Sun");
  });
});
