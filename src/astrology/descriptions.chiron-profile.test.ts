import { describe, expect, expectTypeOf, it } from "vitest";
import { ASTROLOGY_DESCRIPTIONS, getPointDescription, getPointDescriptionEntry, getPointSignDescriptionEntry, getPointHouseDescriptionEntry, type DescriptionPoint, type PointDescriptionEntry, type PlanetSignDescriptionEntry } from "./descriptions";

describe("general Chiron description API", () => {
  it("uses a narrow canonical point union and the shared readonly contract", () => {
    expectTypeOf<DescriptionPoint>().toEqualTypeOf<"parsFortunae" | "chiron">();
    expectTypeOf<PointDescriptionEntry>().toEqualTypeOf<PlanetSignDescriptionEntry>();
    expectTypeOf(getPointDescriptionEntry).returns.toEqualTypeOf<PointDescriptionEntry | undefined>();
    expectTypeOf(getPointDescription).returns.toEqualTypeOf<string | undefined>();
    expect(Object.keys(ASTROLOGY_DESCRIPTIONS.points!)).toEqual(["parsFortunae", "chiron"]);
    expect(getPointDescriptionEntry("chiron")).toBe(ASTROLOGY_DESCRIPTIONS.points!.chiron);
    expect(ASTROLOGY_DESCRIPTIONS.planets).not.toHaveProperty("chiron");
  });

  it("selects only case-sensitive pt prefixes and keeps aliases as gaps", () => {
    const entry = getPointDescriptionEntry("chiron")!;
    for (const language of [undefined, "", "en", "es", "PT-BR"]) expect(getPointDescription("chiron", language)).toBe(entry.en);
    for (const language of ["pt", "pt-BR", "pt-PT"]) expect(getPointDescription("chiron", language)).toBe(entry.pt);
    for (const point of ["Chiron", "Quíron", "Kíriom", "Quíriom", "CHIRON", "sun", "constructor", "__proto__", "toString", "", null, 15]) {
      expect(getPointDescriptionEntry(point as DescriptionPoint)).toBeUndefined();
      expect(getPointDescription(point as DescriptionPoint, "pt")).toBeUndefined();
    }
  });

  it("keeps the general concept separate from shared placement accounts", () => {
    const concept = getPointDescriptionEntry("chiron");
    const placement = getPointSignDescriptionEntry("chiron", "Aries");
    expect(concept).toBe(ASTROLOGY_DESCRIPTIONS.points!.chiron);
    expect(placement).toBeDefined();
    expect(placement).not.toBe(concept);
    expect(getPointHouseDescriptionEntry("chiron", 1)).toBe(placement);
  });

  it("deeply freezes the authored five-field bilingual record", () => {
    const entry = getPointDescriptionEntry("chiron")!;
    function frozen(value: unknown): void {
      if (value && typeof value === "object") {
        expect(Object.isFrozen(value)).toBe(true);
        for (const child of Object.values(value)) frozen(child);
      }
    }
    frozen(entry);
    expect(Object.keys(entry)).toEqual(["pt", "en", "keywords", "src", "reviewNotes"]);
    expect(entry.keywords.en).toHaveLength(entry.keywords.pt.length);
    expect(entry.reviewNotes.length).toBeGreaterThan(0);
    expect(Reflect.set(entry, "pt", "changed")).toBe(false);
    expect(Reflect.set(entry.keywords.en, "0", "changed")).toBe(false);
    expect(Reflect.set(entry.src[0], "from", 0)).toBe(false);
  });
});
