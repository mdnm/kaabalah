import { describe, expect, it } from "vitest";
import { getPlanetHouseDescriptionEntry, type DescriptionHouseNumber } from "./descriptions";

const entry = (house: DescriptionHouseNumber) => getPlanetHouseDescriptionEntry("jupiter", house)!;
const houses = Array.from({ length: 12 }, (_, i) => i + 1) as DescriptionHouseNumber[];

describe("Jupiter house source distinctions", () => {
  it("uses precisely the adopted inclusive primary ranges without supplemental provenance", () => {
    const ranges: Record<DescriptionHouseNumber, readonly (readonly [number, number])[]> = {
      1: [[1394, 1398], [1416, 1423]], 2: [[1432, 1437], [1447, 1452]],
      3: [[1459, 1469], [1476, 1479]], 4: [[1505, 1510], [1526, 1527]],
      5: [[1540, 1543], [1547, 1554], [1560, 1562]],
      6: [[1576, 1580], [1581, 1588]], 7: [[1632, 1637], [1638, 1640]],
      8: [[1668, 1673], [1683, 1686]], 9: [[1715, 1718], [1706, 1709]],
      10: [[1735, 1739], [1743, 1745]], 11: [[1770, 1773], [1784, 1786]],
      12: [[1803, 1804], [1810, 1811], [1819, 1822]],
    };
    for (const house of houses) {
      expect(entry(house).src).toEqual(ranges[house].map(([from, to]) => ({
        file: "modulo 4/aula 9 modulo 4/aula-9.md", from, to,
      })));
    }
  });

  it("keeps two lowercase-start sentences, direct address and paired metadata", () => {
    for (const house of houses) {
      const r = entry(house);
      expect(r.pt).toMatch(/você|seu|sua/);
      expect(r.en).toMatch(/\byou\b|\byour\b/);
      for (const text of [r.pt, r.en]) {
        const sentences = text.match(/[^.!?]+[.!?]/gu)!;
        expect(sentences).toHaveLength(2);
        expect(sentences.join("")).toBe(text);
        for (const sentence of sentences) expect(sentence.trim()).toMatch(/^\p{Ll}/u);
        expect(text).not.toMatch(/—|o curso|the course|a fonte|the source|o livro|the book|omitid|omitted|Sagitário|Sagittarius|cúspide|cusp|Meio.do.Céu|Fundo.do.Céu|\bMC\b|\bIC\b/);
      }
      expect(r.keywords.pt.length).toBeGreaterThan(0);
      expect(r.keywords.pt).toHaveLength(r.keywords.en.length);
      expect(Array.isArray(r.reviewNotes)).toBe(true);
      for (const note of r.reviewNotes) expect(typeof note).toBe("string");
    }
  });

  it("retains some-cases inflation and the alternative sources of house 2 security", () => {
    expect(entry(1).pt).toMatch(/em alguns casos.*autoimagem inflada.*disciplina/);
    expect(entry(1).en).toMatch(/in some cases.*inflated self-image.*discipline/);
    expect(entry(2).pt).toContain("abundância material ou ao conhecimento e a crenças");
    expect(entry(2).en).toContain("material abundance or to knowledge and beliefs");
  });

  it("preserves explicit best and worst cases in house 3", () => {
    expect(entry(3).pt).toMatch(/^no melhor dos casos.*inspiram.*perspectiva ampla\. no pior dos casos.*quantidade.*qualidade/);
    expect(entry(3).en).toMatch(/^at best.*inspire.*broad perspective\. at worst.*quantity.*quality/);
    expect(entry(3).pt).toContain("necessidade quase insaciável de aprender");
    expect(entry(3).en).toContain("almost insatiable need to learn");
  });

  it("qualifies house 4 optimism by favorable aspects and maturity", () => {
    expect(entry(4).pt).toMatch(/se Júpiter estiver bem aspectado.*otimismo e fé.*à medida que você amadurece/);
    expect(entry(4).en).toMatch(/if Jupiter is well aspected.*optimism and faith.*as you mature/);
  });

  it("keeps house 5 persistence and difficult-aspect conditions with a concrete experience reference", () => {
    expect(entry(5).pt).toMatch(/desde que.*conduz.*se você permanecer.*tempo suficiente.*com aspectos difíceis.*sua perspectiva sobre essas experiências/);
    expect(entry(5).en).toMatch(/as long as.*leading.*if you stay.*long enough.*with difficult aspects.*your perspective on these experiences/);
    expect(`${entry(5).pt} ${entry(5).en}`).not.toMatch(/assuntos da casa|house’s concerns/);
  });

  it("uses the actual Jupiter house 6 body despite the Venus heading and retains alternative task styles", () => {
    expect(entry(6).src[0].from).toBe(1576);
    expect(entry(6).reviewNotes.join(" ")).toMatch(/1574.*VÊNUS NA CASA 6.*Júpiter.*1576/);
    expect(entry(6).pt).toMatch(/trabalho e no serviço.*algumas pessoas.*enquanto outras.*diligência e concentração/);
    expect(entry(6).en).toMatch(/work and service.*some people.*while others.*diligence and concentration/);
    expect(`${entry(6).pt} ${entry(6).en}`).not.toMatch(/Vênus|Venus|câncer|cancer|saúde|health|dieta|diet/);
  });

  it("keeps house 7 independence and disappointment and house 8 exchange without promised outcomes", () => {
    expect(entry(7).pt).toMatch(/independência.*segurança.*desapontado/);
    expect(entry(7).en).toMatch(/independence.*security.*disappointed/);
    expect(entry(8).pt).toMatch(/compartilhar e trocar.*oculto.*tabus e mistérios/);
    expect(entry(8).en).toMatch(/sharing and exchanging.*hidden.*taboos.*mysteries/);
  });

  it("retains house 9 extreme-case scope without adding an aspect condition or repairing the suspect sentence", () => {
    expect(entry(9).pt).toMatch(/leis e verdades básicas.*em casos extremos.*sabe tudo.*aprovação divina/);
    expect(entry(9).en).toMatch(/basic laws and truths.*in extreme cases.*know everything.*divine approval/);
    expect(`${entry(9).pt} ${entry(9).en}`).not.toMatch(/aspect|integrado|integrated/);
    expect(entry(9).reviewNotes.join(" ")).toMatch(/1705–1706.*sem acrescentar um “não”/);
  });

  it("keeps house 10 recognition as a desire and house 11 protection as an expectation", () => {
    expect(entry(10).pt).toMatch(/quer ser visto.*buscando significado/);
    expect(entry(10).en).toMatch(/want to be seen.*seeking meaning/);
    expect(entry(11).pt).toMatch(/esperar que ele lhe ofereça proteção.*envolvimento excessivo.*dissipar/);
    expect(entry(11).en).toMatch(/expect it to offer you protection.*excessive involvement.*dissipate/);
    expect(entry(11).reviewNotes.join(" ")).toMatch(/1776–1780.*aspectos difíceis.*omitido/);
  });

  it("keeps house 12 faith and inward truth alongside possible external pursuit and imprudence", () => {
    expect(entry(12).pt).toMatch(/fé profunda.*verdade dentro de si.*menos em si.*temerário ou imprudente/);
    expect(entry(12).en).toMatch(/deep faith.*truth within yourself.*except within yourself.*recklessly or imprudently/);
    expect(`${entry(12).pt} ${entry(12).en}`).not.toMatch(/\bcura\b|healing|hospital|medita|resgat|rescue|\banjo\b|\bangel\b/);
  });
});
