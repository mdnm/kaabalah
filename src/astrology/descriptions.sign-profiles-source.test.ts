import { describe, expect, it } from "vitest";
import { getSignDescriptionEntry } from "./descriptions";
import type { Sign } from "./dignity";

const entry = (sign: Sign) => getSignDescriptionEntry(sign)!;
const copy = (sign: Sign) => `${entry(sign).pt} ${entry(sign).en}`;
const signs: Sign[] = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

describe("basic sign-energy source functions and possible vices", () => {
  it("adopts only pre-level general blocks and addresses chart energy without automatic identities", () => {
    const ranges = [[8, 14], [30, 34], [50, 55], [72, 76], [90, 94], [109, 114],
      [135, 139], [161, 165], [182, 186], [206, 210], [240, 245], [268, 272]];
    for (const [i, sign] of signs.entries()) {
      const [from, to] = ranges[i];
      expect(entry(sign).pt).toContain("no seu mapa");
      expect(entry(sign).en).toMatch(/^in your chart/);
      for (const text of [entry(sign).pt, entry(sign).en]) {
        const sentences = text.match(/[^.!?]+[.!?]/gu)!;
        expect(sentences).toHaveLength(2);
        expect(sentences.join("")).toBe(text);
        for (const sentence of sentences) expect(sentence.trim()).toMatch(/^\p{Ll}/u);
        expect(text).not.toMatch(/—|Ascendente|Ascendant|\bSun\b|\bSol\b|casa \d|house \d|nível|level|divine gift|dom divino|o curso|the course|diagnos/);
      }
    }
  });

  it("qualifies vice expressions without invented stress or positive-to-negative causality", () => {
    for (const sign of signs) {
      const pt = entry(sign).pt.split(". ")[1];
      const en = entry(sign).en.split(". ")[1];
      expect(pt).toMatch(/^ela (também )?pode/);
      expect(en).toMatch(/^it may/);
      expect(copy(sign)).not.toMatch(/sob tensão|under strain|under stress|quando estress|when stressed|essas qualidades podem|these qualities may/);
    }
  });

  it("uses approved compact Aries, Taurus and Gemini functions with distinct possible vices", () => {
    expect(entry("Aries").pt).toMatch(/iniciativa e necessidade de agir.*vigiar, conduzir e proteger.*precipitação, agressividade ou impetuosidade/);
    expect(entry("Aries").en).toContain("watching, leading and protecting");
    expect(entry("Taurus").pt).toMatch(/trabalhar, adquirir, acumular e conservar de modo duradouro.*obstinação, teimosia ou gula/);
    expect(entry("Taurus").en).toContain("working, acquiring, accumulating and preserving over time");
    expect(entry("Gemini").pt).toMatch(/observar, discernir, compreender e explicar.*indecisão, frivolidade ou duplicidade/);
    expect(entry("Gemini").en).toContain("observing, discerning, understanding and explaining");
  });

  it("keeps Cancer impressionability and source functions without clinical or moodiness substitution", () => {
    expect(entry("Cancer").pt).toContain("impressionabilidade, família, lar e recordações, com funções de sentir, comover e imaginar");
    expect(entry("Cancer").en).toContain("impressionability, family, home and memories, with functions of feeling, moving others and imagining");
    const authored = [copy("Cancer"), ...entry("Cancer").keywords.pt, ...entry("Cancer").keywords.en].join(" ");
    expect(authored).not.toMatch(/lunat|moodiness|mood swings|sensitivity to changes|sensibilidade a mudanças/);
  });

  it("preserves middle-sign functions, uncomfortable vices and Scorpio constructive aim", () => {
    expect(entry("Leo").pt).toMatch(/dirigir e aperfeiçoar.*orgulho, ao despotismo e ao exclusivismo/);
    expect(entry("Virgo").pt).toMatch(/análise crítica.*método, ordem e aplicação prática.*detalhismo, ao pedantismo ou à mesquinhez/);
    expect(entry("Libra").pt).toMatch(/cooperação e conciliação, harmonizando e unindo.*conformismo, à vaidade ou à apatia/);
    expect(entry("Scorpio").pt).toMatch(/força destrutiva para um objetivo construtivo.*crueldade, à vingança ou à agressividade/);
    expect(entry("Scorpio").en).toContain("directing destructive force toward a constructive aim");
  });

  it("keeps final-sign general functions distinct from unassigned levels and clinical Pisces labels", () => {
    expect(entry("Sagittarius").pt).toMatch(/compreender, educar e orientar.*fanfarronice, licenciosidade ou cupidez/);
    expect(entry("Capricorn").pt).toMatch(/pensar, deduzir e concretizar.*avareza, exploração das falhas alheias, ironia ou pessimismo/);
    expect(entry("Aquarius").pt).toMatch(/instruir, inventar e renovar.*rebelião, anarquia, inadaptação ou extravagância/);
    expect(entry("Pisces").pt).toMatch(/confiar e servir com sacrifício e abnegação.*impressionabilidade, hesitação, fantasia ou intriga/);
    expect(copy("Pisces")).not.toMatch(/obsess|alucina|hallucina|Eterno|Eternal|garant|guarantee/);
  });
});
