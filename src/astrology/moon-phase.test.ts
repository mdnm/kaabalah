import { describe, expect, it } from "vitest";
import { computeMoonPhase } from "./moon-phase";

describe("computeMoonPhase", () => {
  it("elongation is Moon - Sun mod 360", () => {
    expect(computeMoonPhase(350, 20).elongation).toBeCloseTo(30, 12);
    expect(computeMoonPhase(20, 350).elongation).toBeCloseTo(330, 12);
  });
  it("phase names at principal angles and boundaries (lower inclusive)", () => {
    const at = (e: number) => computeMoonPhase(0, e).phase;
    expect(at(0)).toBe("new");
    expect(at(22.4999)).toBe("new");
    expect(at(22.5)).toBe("waxing_crescent");
    expect(at(45)).toBe("waxing_crescent");
    expect(at(67.5)).toBe("first_quarter");
    expect(at(90)).toBe("first_quarter");
    expect(at(112.5)).toBe("waxing_gibbous");
    expect(at(157.5)).toBe("full");
    expect(at(180)).toBe("full");
    expect(at(202.5)).toBe("waning_gibbous");
    expect(at(247.5)).toBe("last_quarter");
    expect(at(270)).toBe("last_quarter");
    expect(at(292.5)).toBe("waning_crescent");
    expect(at(337.4999)).toBe("waning_crescent");
    expect(at(337.5)).toBe("new");
    expect(at(359.9)).toBe("new");
  });
  it("waxing for elongation in [0,180), waning in [180,360)", () => {
    expect(computeMoonPhase(0, 0).waxing).toBe(true);
    expect(computeMoonPhase(0, 179.99).waxing).toBe(true);
    expect(computeMoonPhase(0, 180).waxing).toBe(false);
    expect(computeMoonPhase(0, 359).waxing).toBe(false);
  });
  it("illuminated fraction is labelled approximate and matches (1 - cos)/2", () => {
    const f = (e: number) => computeMoonPhase(10, 10 + e).illuminatedFraction;
    expect(f(0)).toBeCloseTo(0, 12);
    expect(f(90)).toBeCloseTo(0.5, 12);
    expect(f(180)).toBeCloseTo(1, 12);
    expect(f(270)).toBeCloseTo(0.5, 12);
    expect(f(60)).toBeCloseTo(0.25, 12);
    const r = computeMoonPhase(0, 90);
    expect(r.illumination.method).toBe("approximate");
    expect(r.illumination.method).not.toBe("exact");
  });
});
