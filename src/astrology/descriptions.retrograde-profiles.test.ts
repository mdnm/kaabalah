import { describe, expect, expectTypeOf, it } from "vitest";
import { ASTROLOGY_DESCRIPTIONS, getPlanetDescriptionEntry, getRetrogradePlanetDescription, getRetrogradePlanetDescriptionEntry, type DescriptionRetrogradePlanet, type RetrogradePlanetDescriptionEntry, type PlanetSignDescriptionEntry } from "./descriptions";
const planets: DescriptionRetrogradePlanet[] = ["mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];
describe("finite-negative-speed natal retrograde profiles", () => {
  it("exposes exactly eight typed planets and common readonly entries", () => {
    expectTypeOf<DescriptionRetrogradePlanet>().toEqualTypeOf<"mercury" | "venus" | "mars" | "jupiter" | "saturn" | "uranus" | "neptune" | "pluto">();
    expectTypeOf<RetrogradePlanetDescriptionEntry>().toEqualTypeOf<PlanetSignDescriptionEntry>();
    expectTypeOf(getRetrogradePlanetDescriptionEntry).parameters.toEqualTypeOf<[DescriptionRetrogradePlanet, number?]>();
    expectTypeOf(getRetrogradePlanetDescription).parameters.toEqualTypeOf<[DescriptionRetrogradePlanet, number?, string?]>();
    expectTypeOf(getRetrogradePlanetDescriptionEntry).returns.toEqualTypeOf<RetrogradePlanetDescriptionEntry | undefined>();
    expectTypeOf(getRetrogradePlanetDescription).returns.toEqualTypeOf<string | undefined>();
    expect(Object.keys(ASTROLOGY_DESCRIPTIONS.retrogradePlanets!)).toEqual(planets);
  });
  it("accepts every finite negative magnitude without epsilon or station threshold", () => {
    for (const planet of planets) for (const speed of [-1, -0.001, -Number.MIN_VALUE, -Number.MAX_VALUE]) {
      expect(getRetrogradePlanetDescriptionEntry(planet, speed)).toBe(ASTROLOGY_DESCRIPTIONS.retrogradePlanets![planet]);
      expect(getRetrogradePlanetDescriptionEntry(planet, speed)).not.toBe(getPlanetDescriptionEntry(planet));
    }
  });
  it("rejects missing, nonnumeric, nonfinite and nonnegative speed without coercion or boolean convention", () => {
    for (const planet of planets) {
      expect(getRetrogradePlanetDescriptionEntry(planet)).toBeUndefined();
      expect(getRetrogradePlanetDescription(planet)).toBeUndefined();
      for (const speed of [undefined, null, true, false, "-1", "0", {}, { retrograde: true }, { longitudeSpeed: -1 }, new Number(-1), [-1], NaN, Infinity, -Infinity, 0, -0, 0.001, Number.MIN_VALUE]) {
        expect(getRetrogradePlanetDescriptionEntry(planet, speed as number)).toBeUndefined();
        expect(getRetrogradePlanetDescription(planet, speed as number, "pt")).toBeUndefined();
      }
    }
  });
  it("keeps unsupported planets, points, aliases and prototypes as explicit gaps", () => {
    for (const planet of ["sun", "moon", "chiron", "lilith mean", "lilith true", "parsFortunae", "Mercury", "retrograde", "constructor", "__proto__", "toString", "unknown", "", null, 2]) {
      expect(getRetrogradePlanetDescriptionEntry(planet as DescriptionRetrogradePlanet, -1)).toBeUndefined();
      expect(getRetrogradePlanetDescription(planet as DescriptionRetrogradePlanet, -1, "pt")).toBeUndefined();
    }
  });
  it("selects English by default and Portuguese only for case-sensitive pt prefixes", () => {
    for (const planet of planets) {
      const entry = getRetrogradePlanetDescriptionEntry(planet, -1)!;
      for (const language of [undefined, "", "en", "es", "PT-BR", "pt", "pt-BR", "pt-PT"]) expect(getRetrogradePlanetDescription(planet, -1, language)).toBe(language?.startsWith("pt") ? entry.pt : entry.en);
    }
  });
  it("recursively freezes exact five-field records and paired metadata", () => {
    function frozen(value: unknown): void {
      if (value && typeof value === "object") {
        expect(Object.isFrozen(value)).toBe(true);
        for (const child of Object.values(value)) frozen(child);
      }
    }
    frozen(ASTROLOGY_DESCRIPTIONS.retrogradePlanets);
    for (const planet of planets) {
      const entry = getRetrogradePlanetDescriptionEntry(planet, -1)!;
      expect(Object.keys(entry)).toEqual(["pt", "en", "keywords", "src", "reviewNotes"]);
      expect(entry.keywords.pt.length).toBeGreaterThan(0);
      expect(entry.keywords.en).toHaveLength(entry.keywords.pt.length);
      expect(entry.reviewNotes.length).toBeGreaterThan(0);
      expect(Reflect.set(entry, "pt", "changed")).toBe(false);
      expect(Reflect.set(entry.keywords.en, "0", "changed")).toBe(false);
      expect(Reflect.set(entry.src[0], "from", 0)).toBe(false);
    }
  });
});
