import { describe, expect, it } from "vitest";
import {
  DESCENT_MOVEMENT,
  DESCENT_ORDER,
  DESCENT_STEPS,
  getDescentMovement,
  getDescentStep,
  getReadingReference,
} from "./reference";
import { TREE_ORDER } from "./reading";

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
    for (const language of ["en", "pt-BR"]) {
      const reference = getReadingReference(language);
      expect(Object.keys(reference.step)).toEqual([...DESCENT_ORDER]);
      expect(Object.keys(reference.descent)).toEqual([...DESCENT_ORDER]);
      expect(Object.values(reference.step).every(Boolean)).toBe(true);
      expect(Object.values(reference.descent).every(Boolean)).toBe(true);
    }
    expect(getReadingReference("pt-BR").step.Daath).toBe("você a expressa, com lápis e papel, por exemplo");
    expect(getReadingReference("pt-BR").gloss.Malkuth).toBe("o pote de ouro");
    expect(getReadingReference("pt").rung[8]).toBe("defina os últimos pontos que faltam, escreva um contrato");
  });

  it("counts Daath as the fourth of eleven steps, in the Tree's own order", () => {
    expect(DESCENT_STEPS).toBe(11);
    expect(TREE_ORDER.map((sphereId) => getDescentStep(sphereId))).toEqual(
      Array.from({ length: 11 }, (_, index) => index + 1),
    );
    expect(getDescentStep("Daath")).toBe(4);
    expect(getDescentStep("sphere:Chesed")).toBe(5);
    expect(getDescentStep("Malkuth")).toBe(11);
    expect(getDescentStep("Atlantis")).toBeNull();
  });

  it("gives each column its movement: right expands, left contracts, middle balances", () => {
    const byMovement = (movement: string) => DESCENT_ORDER.filter((sphere) => DESCENT_MOVEMENT[sphere] === movement);
    expect(byMovement("expansion")).toEqual(["Chokhmah", "Chesed", "Netzach"]);
    expect(byMovement("contraction")).toEqual(["Binah", "Geburah", "Hod"]);
    expect(byMovement("balance")).toEqual(["Kether", "Daath", "Tiphareth", "Yesod", "Malkuth"]);
    expect(getDescentMovement("sphere:Geburah")).toBe("contraction");
    expect(getDescentMovement("Atlantis")).toBeNull();
    expect(getReadingReference("pt-BR").movement).toEqual({
      expansion: "expansão",
      contraction: "contração",
      balance: "equilíbrio",
    });
    expect(getReadingReference().movement.balance).toBe("balance");
  });

  it("tells the core descent: idea, light, sound, expression, down to manifestation", () => {
    const en = getReadingReference("en").descent;
    const pt = getReadingReference("pt-BR").descent;
    expect(pt.Chokhmah).toContain("A ideia vira luz");
    expect(pt.Binah).toContain("A luz vira som");
    expect(pt.Daath).toContain("O som é expressado");
    expect(en.Geburah).not.toContain("Kether");
    expect(pt.Malkuth).toBe("Está manifestado.");
    for (const text of [...Object.values(en), ...Object.values(pt)]) {
      expect(text).not.toMatch(/matchstick|palito/i);
    }
  });
});
