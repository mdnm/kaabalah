import { describe, expect, it } from "vitest";
import { getPolarityDescriptionEntry } from "./descriptions";

const a2 = "modulo 4/aula 2 modulo 4/aula-2.md";
const a11 = "modulo 4/aula 11 modulo 4/aula-11.md";
const positive = getPolarityDescriptionEntry("positive")!;
const negative = getPolarityDescriptionEntry("negative")!;

describe("polarity source context and classification boundaries", () => {
  it("uses split generic clauses and labels excluding adjacent sign membership lists", () => {
    expect(positive.src).toEqual([{ file: a2, from: 98, to: 98 }, { file: a2, from: 100, to: 101 }, { file: a11, from: 195, to: 196 }]);
    expect(negative.src).toEqual([{ file: a2, from: 104, to: 104 }, { file: a2, from: 107, to: 109 }, { file: a11, from: 191, to: 192 }]);
    expect(positive.pt).toMatch(/ação, à atividade e à vida exterior.*responde aos estímulos e acontecimentos externos/);
    expect(positive.en).toMatch(/action, activity, and outer life.*responding to external stimuli and events/);
    expect(negative.pt).toMatch(/energia receptiva.*vida interior.*acumula impressões e ganha experiências/);
    expect(negative.en).toMatch(/receptive energy.*inner life.*accumulating impressions, and gaining experience/);
  });

  it("labels traditional names symbolically without human-gender, moral or individual sign assignments", () => {
    expect(positive.pt).toContain("masculina, ativa, diurna, ímpar e yang");
    expect(negative.pt).toContain("feminina, passiva, noturna, par e yin");
    for (const entry of [positive, negative]) {
      expect(entry.pt).toContain("na nomenclatura simbólica");
      expect(entry.pt).toContain("esses rótulos não definem gênero nem valor moral");
      expect(entry.en).toContain("in symbolic terminology");
      expect(entry.en).toContain("these labels define neither gender nor moral value");
      expect(`${entry.pt} ${entry.en}`).not.toMatch(/Capricórnio|Capricorn|Áries|Aries|Terra|Earth|Fogo|Fire|homens|mulheres|\bmen\b|\bwomen\b|sect|destino|destiny/);
      expect(entry.reviewNotes.join(" ")).toContain("unresolved");
      expect(entry.reviewNotes.join(" ")).toContain("no sign assignment");
    }
  });

  it("retains two lowercase chart-owner sentences without advice, source notices or promised outcomes", () => {
    for (const entry of [positive, negative]) {
      expect(entry.pt).toMatch(/^no seu mapa/);
      expect(entry.en).toMatch(/^in your chart/);
      for (const text of [entry.pt, entry.en]) {
        const sentences = text.match(/[^.!?]+[.!?]/gu)!;
        expect(sentences).toHaveLength(2);
        expect(sentences.join("")).toBe(text);
        for (const sentence of sentences) expect(sentence.trim()).toMatch(/^\p{Ll}/u);
        expect(text).not.toMatch(/—|o curso|the course|o livro|the book|diagnos|garant|guarantee|pratique|practice/);
      }
    }
  });
});
