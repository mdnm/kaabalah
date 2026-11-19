import { describe, expect, it } from "vitest";
import { getPointDescriptionEntry } from "./descriptions";

const entry = getPointDescriptionEntry("chiron")!;
describe("Chiron general concept source qualifications", () => {

  it("preserves symbolic own vulnerability, possible understanding and inevitable human imperfection", () => {
    expect(entry.pt).toMatch(/imagem simbólica do curador ferido.*própria vulnerabilidade pode ajudar a compreender a dor alheia/);
    expect(entry.en).toMatch(/symbolic image of the wounded healer.*your own vulnerability may help you understand others' pain/);
    expect(entry.pt).toMatch(/imperfeição inevitável da condição humana.*temas de aceitação, perdão e compaixão/);
    expect(entry.en).toMatch(/inevitable imperfection of the human condition.*themes of acceptance, forgiveness, and compassion/);
    expect(entry.keywords.pt).toEqual(["curador ferido", "vulnerabilidade", "dor alheia", "imperfeição humana", "aceitação", "perdão", "compaixão"]);
    expect(entry.keywords.en).toEqual(["wounded healer", "vulnerability", "others' pain", "human imperfection", "acceptance", "forgiveness", "compassion"]);
  });

  it("keeps two lowercase chart-owner sentences without clinical promises, myth biography or timing", () => {
    expect(entry.pt).toMatch(/^no seu mapa/);
    expect(entry.en).toMatch(/^in your chart/);
    for (const text of [entry.pt, entry.en]) {
      const sentences = text.match(/[^.!?]+[.!?]/gu)!;
      expect(sentences).toHaveLength(2);
      expect(sentences.join("")).toBe(text);
      for (const sentence of sentences) expect(sentence.trim()).toMatch(/^\p{Ll}/u);
      expect(text).not.toMatch(/—|\d|H[eé]rcules|rejeiç|reject|mother|mãe|diagnos|illness|doença|saúde|health|cure|cura garantida|healing guarantee|você deve|you should|pratique|practice|trânsit|transit|ciclo|cycle|Plut|Sun|Sol|evolution/iu);
    }
  });

});
