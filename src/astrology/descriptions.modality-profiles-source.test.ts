import { describe, expect, it } from "vitest";
import { getModalityDescriptionEntry } from "./descriptions";
import { MODALITIES } from "../core/constants";

const entry = (modality: typeof MODALITIES[keyof typeof MODALITIES]) => getModalityDescriptionEntry(modality)!;
const modalities = [MODALITIES.CARDINAL, MODALITIES.FIXED, MODALITIES.MUTABLE];
const a1 = "modulo 4/aula 1 modulo 4/aula-1.md";
const a2 = "modulo 4/aula 2 modulo 4/aula-2.md";

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
    expect(entry("Cardinal").src).toEqual([
      { file: a1, from: 160, to: 160 }, { file: a1, from: 165, to: 165 },
      { file: a2, from: 116, to: 119 },
    ]);
    expect(entry("Cardinal").pt).not.toMatch(/Áries|Capricórnio|Câncer|Libra|escala/);
  });

  it("retains Fixed stability and strong will alongside possible resistance to change", () => {
    expect(entry("Fixed").pt).toMatch(/estabilidade.*vontade firme, perseverança e fidelidade.*pode envolver resistência a mudanças/);
    expect(entry("Fixed").en).toMatch(/stability.*strong will, perseverance, and fidelity.*may involve resistance to change/);
    expect(entry("Fixed").src).toEqual([
      { file: a1, from: 161, to: 161 }, { file: a1, from: 166, to: 166 },
      { file: a2, from: 122, to: 126 },
    ]);
    expect(entry("Fixed").pt).not.toContain("Aquário");
  });

  it("links common signs to Mutable and preserves instability as well as adaptability", () => {
    expect(entry("Mutable").src).toEqual([
      { file: a1, from: 162, to: 163 }, { file: a1, from: 167, to: 167 },
      { file: a2, from: 127, to: 131 },
    ]);
    expect(entry("Mutable").pt).toContain("instabilidade, dualidade e indecisão, junto de adaptabilidade e flexibilidade");
    expect(entry("Mutable").en).toContain("instability, duality and indecision, alongside adaptability and flexibility");
    expect(entry("Mutable").keywords.pt).toContain("mutabilidade");
    expect(entry("Mutable").keywords.en).toContain("changeability");
    expect(entry("Mutable").reviewNotes.join(" ")).toContain("common-sign");
  });

  it("keeps ordinary chart dynamics separate from esoteric mastery, sacred status and time mapping", () => {
    for (const modality of modalities) {
      const e = entry(modality);
      expect(e.pt).toMatch(/^no seu mapa/);
      expect(e.en).toMatch(/^in your chart/);
      expect(e.src.every(source => source.file === a1 || source.file === a2)).toBe(true);
      for (const text of [e.pt, e.en]) {
        const sentences = text.match(/[^.!?]+[.!?]/gu)!;
        expect(sentences).toHaveLength(2);
        expect(sentences.join("")).toBe(text);
        for (const sentence of sentences) expect(sentence.trim()).toMatch(/^\p{Ll}/u);
        expect(text).not.toMatch(/—|sagrad|sacred|domínio.*element|mastery|transcend|nível|level|passado|presente|futuro|past|present|future|Ascendente|Ascendant|o curso|the course/);
      }
      expect(e.reviewNotes.join(" ")).toContain("not adopted");
    }
  });
});
