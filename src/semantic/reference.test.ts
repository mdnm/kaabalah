import { describe, expect, it } from "vitest";
import { getReadingReference } from "./reference";

describe("plain reading reference vocabulary", () => {
  it("prevents one consumer from changing the vocabulary seen by another", () => {
    const vocabulary = getReadingReference("en");
    expect(Reflect.set(vocabulary, "gloss", { Hod: "changed" })).toBe(false);
    expect(Reflect.set(vocabulary.gloss, "Hod", "changed")).toBe(false);
    expect(Reflect.set(vocabulary.rung, "1", "changed")).toBe(false);
    expect(getReadingReference("en").gloss.Hod).toBe("the agreement");
    expect(getReadingReference("en").rung[1]).toBe("the idea still without form");
  });

  it("covers eleven spheres and exactly ten descent steps in both languages", () => {
    for (const language of ["en", "pt-BR"]) {
      const reference = getReadingReference(language);
      expect(Object.keys(reference.gloss)).toEqual([
        "Kether", "Chokhmah", "Binah", "Daath", "Chesed", "Geburah",
        "Tiphareth", "Netzach", "Hod", "Yesod", "Malkuth",
      ]);
      expect(Object.keys(reference.rung)).toEqual(Array.from({ length: 10 }, (_, index) => String(index + 1)));
      expect(Object.values(reference.gloss).every(Boolean)).toBe(true);
      expect(Object.values(reference.rung).every(Boolean)).toBe(true);
    }
    expect(getReadingReference().gloss.Hod).toBe("the agreement");
    expect(getReadingReference("pt-BR").gloss.Malkuth).toBe("o pote de ouro");
    expect(getReadingReference("pt").rung[8]).toBe("hora do acordo, do contrato");
  });
});
