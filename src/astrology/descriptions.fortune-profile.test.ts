import { describe, expect, expectTypeOf, it } from "vitest";
import { ASTROLOGY_DESCRIPTIONS, getPointDescription, getPointDescriptionEntry, type DescriptionPoint, type PointDescriptionEntry, type PlanetSignDescriptionEntry } from "./descriptions";

describe("general Fortune description API", () => {
  it("uses the canonical point key and common readonly entry contract", () => {
    expectTypeOf<DescriptionPoint>().toEqualTypeOf<"parsFortunae">();
    expectTypeOf<PointDescriptionEntry>().toEqualTypeOf<PlanetSignDescriptionEntry>();
    expectTypeOf(getPointDescriptionEntry).returns.toEqualTypeOf<PointDescriptionEntry | undefined>();
    expectTypeOf(getPointDescription).returns.toEqualTypeOf<string | undefined>();
    expect(Object.keys(ASTROLOGY_DESCRIPTIONS.points!)).toEqual(["parsFortunae"]);
    expect(getPointDescriptionEntry("parsFortunae")).toBe(ASTROLOGY_DESCRIPTIONS.points!.parsFortunae);
    expect(ASTROLOGY_DESCRIPTIONS.planets).not.toHaveProperty("parsFortunae");
  });

  it("selects only case-sensitive pt prefixes, defaulting to English", () => {
    const entry = getPointDescriptionEntry("parsFortunae")!;
    for (const language of [undefined, "", "en", "es", "PT-BR"]) expect(getPointDescription("parsFortunae", language)).toBe(entry.en);
    for (const language of ["pt", "pt-BR", "pt-PT"]) expect(getPointDescription("parsFortunae", language)).toBe(entry.pt);
  });

  it("keeps aliases, other points and inherited names as explicit gaps", () => {
    for (const key of ["fortune", "Wheel of Fortune", "PARS_FORTUNAE", "parsfortunae", "sun", "parsSpiritus", "constructor", "__proto__", "toString", "", null, 1]) {
      expect(getPointDescriptionEntry(key as DescriptionPoint)).toBeUndefined();
      expect(getPointDescription(key as DescriptionPoint, "pt-BR")).toBeUndefined();
    }
  });

  it("deeply freezes the point bank and its bilingual metadata", () => {
    function frozen(value: unknown): void {
      if (value && typeof value === "object") {
        expect(Object.isFrozen(value)).toBe(true);
        for (const child of Object.values(value)) frozen(child);
      }
    }
    frozen(ASTROLOGY_DESCRIPTIONS.points);
    const entry = getPointDescriptionEntry("parsFortunae")!;
    expect(Object.keys(entry)).toEqual(["pt", "en", "keywords", "src", "reviewNotes"]);
    expect(entry.keywords.en).toHaveLength(entry.keywords.pt.length);
    expect(entry.keywords.pt.length).toBeGreaterThan(0);
    expect(entry.reviewNotes.length).toBeGreaterThan(0);
    expect(Reflect.set(entry, "pt", "changed")).toBe(false);
    expect(Reflect.set(entry.keywords.en, "0", "changed")).toBe(false);
    expect(Reflect.set(entry.src[0], "from", 0)).toBe(false);
  });
});
