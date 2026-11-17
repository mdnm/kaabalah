import { describe, expect, it } from "vitest";
import { getPointDescriptionEntry } from "./descriptions";

const entry = getPointDescriptionEntry("lilith mean")!;
describe("Lilith general concept source qualifications", () => {
  it("uses precise adopted concept clauses within teaching bounds", () => {
    expect(entry.src).toEqual([[135, 136], [152, 155], [159, 160]].map(([from, to]) => ({ file: "modulo 4/aula 18 modulo 4/aula-18.md", from, to })));
    for (const source of entry.src) {
      expect(Number.isSafeInteger(source.from)).toBe(true);
      expect(Number.isSafeInteger(source.to)).toBe(true);
      expect(source.from).toBeGreaterThanOrEqual(131);
      expect(source.to).toBeGreaterThanOrEqual(source.from);
      expect(source.to).toBeLessThanOrEqual(1065);
    }
  });

  it("preserves symbolic obscurity and real variable-intensity/latent qualifications", () => {
    expect(entry.pt).toMatch(/simbolicamente.*consciência obscura e pouco acessível.*ausência de luz/);
    expect(entry.en).toMatch(/symbolically.*obscure, difficult-to-access area of consciousness.*absence of light/);
    expect(entry.pt).toMatch(/depende do conjunto do mapa e do grau.*latentes que podem aparecer em intensidades diferentes.*sem necessariamente chegar ao extremo/);
    expect(entry.en).toMatch(/depends on the overall chart and degree.*latent characteristics that may appear at different intensities without necessarily reaching an extreme/);
    expect(`${entry.pt} ${entry.en}`).not.toMatch(/dormant|dormência|never manifest|nunca se manifest/iu);
    expect(entry.keywords.pt).toEqual(["área obscura da consciência", "pouco acessível", "ausência de luz", "latência", "grau"]);
    expect(entry.keywords.en).toEqual(["obscure area of consciousness", "difficult to access", "absence of light", "latency", "degree"]);
  });

  it("keeps two lowercase chart-owner sentences without physical, moral or clinical assignments", () => {
    expect(entry.pt).toMatch(/^no seu mapa/);
    expect(entry.en).toMatch(/^in your chart/);
    for (const text of [entry.pt, entry.en]) {
      const sentences = text.match(/[^.!?]+[.!?]/gu)!;
      expect(sentences).toHaveLength(2);
      expect(sentences.join("")).toBe(text);
      for (const sentence of sentences) expect(sentence.trim()).toMatch(/^\p{Ll}/u);
      expect(text).not.toMatch(/—|\d|vácuo|vacuum|gender|gênero|corrupt|evil|ilegal|illegal|diagnos|health|saúde|healing|instint|instinct|desejo|desire|prática|practice|marcia|martial|você deve|you should|Priap|Príap|evolu[cç]|evolution/iu);
    }
  });

  it("discloses a textual mode alias without equating positions or merging Priapus", () => {
    const notes = entry.reviewNotes.join(" ");
    expect(notes).toContain("not invariably opposite Lilith");
    expect(notes).toContain("sole canonical record is lilith mean");
    expect(notes).toContain("explicit lilith true interpretation lookup alias");
    expect(notes).toContain("does not equate their calculated positions");
    expect(notes).toContain("does not define a bare lilith default");
  });
});
