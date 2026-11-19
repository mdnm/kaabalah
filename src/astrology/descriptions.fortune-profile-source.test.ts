import { describe, expect, it } from "vitest";
import { getPointDescriptionEntry } from "./descriptions";

const entry = getPointDescriptionEntry("parsFortunae")!;
describe("general Fortune primary meanings and boundaries", () => {

  it("retains potential, luck versus effort and both placement/planetary qualifications", () => {
    expect(entry.pt).toMatch(/ponto virtual.*relação matemática entre Sol, Lua e Ascendente/);
    expect(entry.en).toMatch(/virtual point.*mathematical relationship between the Sun, Moon, and Ascendant/);
    expect(entry.pt).toMatch(/pode vir mais pela sorte que pelo esforço.*bens, prestígio e reputação.*posição e as relações planetárias do ponto e de seu regente/);
    expect(entry.en).toMatch(/may come more through good fortune than effort.*possessions, prestige, and reputation.*placement and planetary relations of the point and its ruler/);
  });

  it("uses two lowercase chart-owner sentences without inferred vitality or timing claims", () => {
    expect(entry.pt).toMatch(/^no seu mapa/);
    expect(entry.en).toMatch(/^in your chart/);
    for (const text of [entry.pt, entry.en]) {
      const sentences = text.match(/[^.!?]+[.!?]/gu)!;
      expect(sentences).toHaveLength(2);
      expect(sentences.join("")).toBe(text);
      for (const sentence of sentences) expect(sentence.trim()).toMatch(/^\p{Ll}/u);
      expect(text).not.toMatch(/—|vital|saúde|health|profe[cç]|fórmula|formula|diurn|nocturn|garant|guarantee|Ark Annu|roda|wheel|deve|should|pratique|practice/iu);
    }
    expect(entry.keywords.pt).toEqual(["ponto virtual", "sol", "lua", "ascendente", "sorte", "esforço", "bens", "prestígio", "reputação", "regente"]);
    expect(entry.keywords.en).toEqual(["virtual point", "sun", "moon", "ascendant", "good fortune", "effort", "possessions", "prestige", "reputation", "ruler"]);
  });
});
