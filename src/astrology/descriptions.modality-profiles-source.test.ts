import { describe, expect, it } from "vitest";
import { getModalityDescriptionEntry } from "./descriptions";
import { MODALITIES } from "../core/constants";

const entry = (modality: typeof MODALITIES[keyof typeof MODALITIES]) => getModalityDescriptionEntry(modality)!;
const modalities = [MODALITIES.CARDINAL, MODALITIES.FIXED, MODALITIES.MUTABLE];

describe("ordinary modality source meanings", () => {
  it("locates the three rhythms at the beginning, middle and end of a season", () => {
    expect(entry("Cardinal").pt).toContain("início de uma estação");
    expect(entry("Cardinal").en).toContain("beginning of a season");
    expect(entry("Fixed").pt).toContain("meio de uma estação");
    expect(entry("Fixed").en).toContain("middle of a season");
    expect(entry("Mutable").pt).toContain("fim de uma estação e à passagem para a seguinte");
    expect(entry("Mutable").en).toContain("end of a season and the transition to the next");
  });

  it("keeps Cardinal initiative and aversion to limitations without sign-specific grades", () => {
    expect(entry("Cardinal").pt).toMatch(/atividade, à energia e à iniciativa.*pode envolver ambição e aversão a limitações/);
    expect(entry("Cardinal").en).toMatch(/activity, energy, and initiative.*may also involve ambition and aversion to limitations/);
    expect(entry("Cardinal").pt).not.toMatch(/Áries|Capricórnio|Câncer|Libra|escala/);
  });

  it("retains Fixed stability and strong will alongside possible resistance to change", () => {
    expect(entry("Fixed").pt).toMatch(/estabilidade.*vontade firme, perseverança e fidelidade.*pode envolver resistência a mudanças/);
    expect(entry("Fixed").en).toMatch(/stability.*strong will, perseverance, and fidelity.*may involve resistance to change/);
    expect(entry("Fixed").pt).not.toContain("Aquário");
  });

  it("links common signs to Mutable and preserves instability as well as adaptability", () => {
    expect(entry("Mutable").pt).toContain("instabilidade, dualidade e indecisão, junto de adaptabilidade e flexibilidade");
    expect(entry("Mutable").en).toContain("instability, duality and indecision, alongside adaptability and flexibility");
    expect(entry("Mutable").keywords.pt).toContain("mutabilidade");
    expect(entry("Mutable").keywords.en).toContain("changeability");
  });

  it("keeps ordinary chart dynamics separate from esoteric mastery, sacred status and time mapping", () => {
    for (const modality of modalities) {
      const e = entry(modality);
      expect(e.pt).toMatch(/^no seu mapa/);
      expect(e.en).toMatch(/^in your chart/);
      for (const text of [e.pt, e.en]) {
        const sentences = text.match(/[^.!?]+[.!?]/gu)!;
        expect(sentences).toHaveLength(2);
        expect(sentences.join("")).toBe(text);
        for (const sentence of sentences) expect(sentence.trim()).toMatch(/^\p{Ll}/u);
        expect(text).not.toMatch(/—|sagrad|sacred|domínio.*element|mastery|transcend|nível|level|passado|presente|futuro|past|present|future|Ascendente|Ascendant|o curso|the course/);
      }
    }
  });
});
