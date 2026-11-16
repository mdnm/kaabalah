import { describe, expect, it } from "vitest";
import { getPlanetHouseDescriptionEntry, type DescriptionHouseNumber } from "./descriptions";

const entry = (house: DescriptionHouseNumber) => getPlanetHouseDescriptionEntry("venus", house)!;
const houses = Array.from({ length: 12 }, (_, i) => i + 1) as DescriptionHouseNumber[];

describe("Venus house source distinctions", () => {
  it("uses exactly the adopted physical primary ranges without book provenance", () => {
    const ranges: Record<DescriptionHouseNumber, readonly (readonly [number, number])[]> = {
      1: [[656, 659], [663, 665]], 2: [[678, 684]], 3: [[697, 700]],
      4: [[718, 722]], 5: [[746, 747], [758, 761]],
      6: [[782, 788], [792, 794]], 7: [[805, 810], [813, 815]],
      8: [[832, 833], [842, 843]], 9: [[854, 860], [864, 866]],
      10: [[888, 888], [894, 896]], 11: [[919, 922], [926, 927], [932, 935]],
      12: [[953, 960], [967, 967]],
    };
    for (const house of houses) {
      expect(entry(house).src).toEqual(ranges[house].map(([from, to]) => ({
        file: "modulo 4/aula 9 modulo 4/aula-9.md", from, to,
      })));
    }
  });

  it("keeps paired bilingual copy with two lowercase sentences and no source notices or cusp aliases", () => {
    for (const house of houses) {
      const r = entry(house);
      expect(r.pt).toMatch(/você|seu|sua/);
      expect(r.en).toMatch(/\byou\b|\byour\b/);
      for (const text of [r.pt, r.en]) {
        const sentences = text.match(/[^.!?]+[.!?]/gu)!;
        expect(sentences).toHaveLength(2);
        expect(sentences.join("")).toBe(text);
        for (const sentence of sentences) expect(sentence.trim()).toMatch(/^\p{Ll}/u);
        expect(text).not.toMatch(/o curso|the course|a fonte|the source|o livro|the book|omitid|omitted|Touro|Taurus|Libra|cúspide|cusp|Meio.do.Céu|Fundo.do.Céu|\bMC\b|\bIC\b/);
      }
      expect(r.keywords.pt.length).toBeGreaterThan(0);
      expect(r.keywords.pt).toHaveLength(r.keywords.en.length);
    }
  });

  it("retains house 1 people-pleasing risk and conditional pursuit of praise without gendered self-acceptance", () => {
    expect(entry(1).pt).toMatch(/agradar a todos e se perder.*se não consegue primeiro se aceitar.*elogios e atenção ou manipular/);
    expect(entry(1).en).toMatch(/please everyone and lose yourself.*if you cannot first accept yourself.*praise and attention or manipulate/);
    expect(entry(1).pt).not.toMatch(/aceito|aceita(?=[,. ])/);
  });

  it("qualifies house 2 broader appreciation by development and house 3 fluency by aspects", () => {
    expect(entry(2).pt).toMatch(/seus recursos podem incluir senso de justiça e tato diplomático; numa expressão mais desenvolvida dessa posição, você pode apreciar a beleza, a razão e o propósito/);
    expect(entry(2).en).toMatch(/your resources may include a sense of justice and diplomatic tact; in a more developed expression of this placement, you may appreciate beauty, reason and purpose/);
    expect(entry(2).keywords.pt.join(" ")).toContain("condicionada");
    expect(entry(2).keywords.en.join(" ")).toContain("conditioned");
    expect(entry(3).pt).toMatch(/^quando Vênus não está embaraçada por aspectos difíceis.*comunicar com facilidade e fluência/);
    expect(entry(3).en).toMatch(/^when Venus is not hindered by difficult aspects.*communicate with ease and fluency/);
    expect(entry(3).pt).toContain("algumas pessoas");
    expect(entry(3).en).toContain("some people");
  });

  it("keeps domestic avoidance, romance priority and some-cases detail obsessiveness", () => {
    expect(entry(4).pt).toContain("reconciliar as diferenças ou simplesmente ignorá-los");
    expect(entry(4).en).toContain("reconcile differences or simply ignore them");
    expect(entry(5).pt).toContain("romances podem ocupar lugar prioritário");
    expect(entry(5).en).toContain("romance may rank among your priorities");
    expect(entry(6).pt).toMatch(/você pode gostar de tarefas cotidianas e, em alguns casos, tornar-se obsessivo com pequenos detalhes/);
    expect(entry(6).en).toMatch(/you may enjoy everyday tasks and, in some cases, become obsessive about small details/);
  });

  it("retains house 7 dependency and disappointment without promised happiness or misplaced hard-work advice", () => {
    expect(entry(7).pt).toMatch(/depender do olhar de outra pessoa.*só se sentir completo quando está em uma relação.*desapontamento e crítica/);
    expect(entry(7).en).toMatch(/depend on another person’s view.*feel complete only when you are in a relationship.*disappointment and criticism/);
    expect(`${entry(7).pt} ${entry(7).en}`).not.toMatch(/Saturno|Saturn|Plutão|Pluto|trabalho duro|hard work|mais feliz|happier/);
    expect(entry(7).reviewNotes.join(" ")).toMatch(/Saturno\/Plutão.*816–817/);
  });

  it("keeps separate conditions for divine expectations, desired work harmony and reciprocal group influence", () => {
    expect(entry(9).pt).toMatch(/correspondência a esse ideal depende dos aspectos de Vênus e de outros posicionamentos na casa 9/);
    expect(entry(9).en).toMatch(/whether that ideal is met depends on Venus’s aspects and other placements in the ninth house/);
    expect(entry(10).pt).toMatch(/querer ser notado.*aspectos de Vênus possam dificultar a realização desses desejos/);
    expect(entry(10).en).toMatch(/want to be noticed.*Venus’s aspects may make fulfilling these wishes more difficult/);
    expect(entry(11).pt).toMatch(/influência positiva recíproca, embora aspectos de Vênus possam indicar impedimentos.*em alguns casos.*aceitação social.*decepção/);
    expect(entry(11).en).toMatch(/mutual positive influence, although Venus’s aspects may indicate obstacles.*in some cases.*social acceptance.*disappointment/);
    expect(`${entry(11).pt} ${entry(11).en}`).not.toMatch(/Júpiter|Jupiter|Netuno|Neptune|energia demais|excess.*energy/);
  });

  it("keeps house 12 limitless love and excessive demands as direct association rather than invented cause", () => {
    expect(entry(12).pt).toMatch(/amor e beleza sem limites.*sutil, oculto e intangível\. você também pode exigir muito dos outros e sentir que a adoração de uma só pessoa não basta/);
    expect(entry(12).en).toMatch(/limitless love and beauty.*subtle, hidden and intangible\. you may also ask a great deal of others and feel that one person’s adoration is not enough/);
    expect(`${entry(12).pt} ${entry(12).en}`).not.toMatch(/essa busca pode levar|this search may lead|sofrimento|suffering|terapia|therapy|cura|healing/);
  });
});
