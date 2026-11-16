import { describe, expect, it } from "vitest";
import { getPlanetHouseDescriptionEntry, type DescriptionHouseNumber } from "./descriptions";

const entry = (house: DescriptionHouseNumber) => getPlanetHouseDescriptionEntry("mercury", house)!;
const houses = Array.from({ length: 12 }, (_, i) => i + 1) as DescriptionHouseNumber[];

describe("Mercury house source distinctions", () => {
  it("uses the exact adopted primary physical ranges without supplemental book claims", () => {
    const ranges: Record<DescriptionHouseNumber, readonly (readonly [number, number])[]> = {
      1: [[304, 309], [317, 318]], 2: [[329, 334], [335, 338]],
      3: [[359, 362]], 4: [[381, 382], [390, 393]],
      5: [[407, 412]], 6: [[436, 438], [457, 460]],
      7: [[467, 472], [475, 478]], 8: [[493, 502], [512, 513]],
      9: [[521, 527], [529, 530]], 10: [[545, 548]],
      11: [[564, 569], [580, 581]], 12: [[596, 598], [619, 621], [624, 625]],
    };
    for (const house of houses) {
      expect(entry(house).src).toEqual(ranges[house].map(([from, to]) => ({
        file: "modulo 4/aula 9 modulo 4/aula-9.md", from, to,
      })));
    }
  });

  it("keeps two lowercase sentences and paired direct bilingual content without source notices or cusp aliases", () => {
    for (const house of houses) {
      const r = entry(house);
      expect(r.pt).toMatch(/você|seu/);
      expect(r.en).toMatch(/\byou\b|\byour\b/);
      for (const text of [r.pt, r.en]) {
        const sentences = text.match(/[^.!?]+[.!?]/gu)!;
        expect(sentences).toHaveLength(2);
        expect(sentences.join("")).toBe(text);
        for (const sentence of sentences) expect(sentence.trim()).toMatch(/^\p{Ll}/u);
        expect(text).not.toMatch(/a fonte|the source|o curso|the course|o livro|the book|a posição.*associa|the placement.*connects|omitid|omitted|Gêmeos|Gémeos|Gemini|Virgem|Virgo|cúspide|cusp|Meio.do.Céu|Fundo.do.Céu|\bMC\b|\bIC\b/);
      }
      expect(r.keywords.pt.length).toBeGreaterThan(0);
      expect(r.keywords.pt).toHaveLength(r.keywords.en.length);
    }
  });

  it("conditions house 2 financial skill on good aspects and excludes ambiguous Fire/Earth and betting", () => {
    expect(entry(2).pt).toMatch(/^se Mercúrio estiver bem aspectado, você pode mostrar habilidade com dinheiro e finanças/);
    expect(entry(2).en).toMatch(/^if Mercury is well aspected, you may show skill with money and finances/);
    expect(entry(2).pt).toContain("conhecer o funcionamento do mundo físico pode trazer segurança");
    expect(entry(2).en).toContain("understanding how the physical world works may bring security");
    const product = JSON.stringify({pt: entry(2).pt, en: entry(2).en, keywords: entry(2).keywords});
    expect(product).not.toMatch(/Fogo|Terra|Fire|Earth|aposta|betting|gambling/);
  });

  it("preserves house 3 not-badly-aspected intellect and selective argument facts", () => {
    expect(entry(3).pt).toMatch(/^quando Mercúrio não está mal aspectado.*intelecto vivo, espirituoso e observador/);
    expect(entry(3).en).toMatch(/^when Mercury is not badly aspected.*lively, witty, and observant intellect/);
    expect(entry(3).pt).toContain("selecionar fatos que apoiem o argumento");
    expect(entry(3).en).toContain("select facts that support the case");
    expect(entry(3).reviewNotes.join(" ")).toMatch(/nonconventional minds.*distinct from learning difficulties/);
    expect(`${entry(3).pt} ${entry(3).en}`).not.toMatch(/dificuldades de aprendizado|learning difficulties|Uranus|Neptune|Pluto/);
  });

  it("keeps house 4 emotional cost and more changes under difficult aspects, with learning at home separate", () => {
    expect(entry(4).pt).toMatch(/^seu ambiente familiar pode valorizar o intelecto e a racionalidade.*às custas dos sentimentos.*se Mercúrio recebe aspectos difíceis.*mais mudanças, brigas e amarguras.*atividades mentais e educativas/);
    expect(entry(4).en).toMatch(/^your family environment may value intellect and rationality.*expense of feelings.*if Mercury receives difficult aspects.*more changes, quarrels, and bitterness.*mental and educational activities/);
  });

  it("keeps daily/body learning, wasted busyness, mentally engaging work and shared-source research", () => {
    expect(entry(6).pt).toMatch(/conhecimento.*cotidiano e o corpo.*necessidade excessiva.*não levam a lugar algum.*mentalmente cativante/);
    expect(entry(6).en).toMatch(/knowledge through daily life and the body.*excessive need.*lead nowhere.*mentally engaging/);
    expect(entry(8).pt).toMatch(/manter seus próprios pensamentos e motivações em segredo.*investigações e trabalhos de pesquisa/);
    expect(entry(8).en).toMatch(/keep your own thoughts and motives secret.*investigation and research/);
    expect(entry(8).reviewNotes.join(" ")).toMatch(/Mercúrio ou Virgem.*explicitly includes Mercury alone/);
    expect(`${entry(7).pt} ${entry(7).en}`).not.toMatch(/subjug|secondary gain|ganho secundário/);
  });

  it("conditions house 9 fanaticism on bad aspects and keeps house 10 appearance/remembrance as desire", () => {
    expect(entry(9).pt).toMatch(/se Mercúrio estiver mal aspectado, pode haver adesão fanática/);
    expect(entry(9).en).toMatch(/if Mercury is poorly aspected, there may be fanatical adherence/);
    expect(entry(10).pt).toMatch(/também pode querer parecer brilhante, inteligente e capaz e ser lembrado por essas qualidades/);
    expect(entry(10).en).toMatch(/may also want to appear bright, intelligent and capable and be remembered for those qualities/);
    expect(entry(10).keywords.pt).toContain("desejo de parecer brilhante, inteligente e capaz e ser lembrado por essas qualidades");
    expect(entry(10).keywords.en).toContain("desire to appear bright, intelligent and capable and be remembered for those qualities");
  });

  it("keeps house 11 delegated thought conditional on projection and house 12 exact imagination condition", () => {
    expect(entry(11).pt).toMatch(/se você projetar Mercúrio nos amigos, pode procurar alguém que pense e tome decisões por você/);
    expect(entry(11).en).toMatch(/if you project Mercury onto friends, you may seek someone to think and make decisions for you/);
    expect(entry(12).pt).toMatch(/dificuldade para distinguir seus pensamentos.*se Mercúrio não estiver muito mal aspectado, pode haver uma imaginação viva/);
    expect(entry(12).en).toMatch(/difficulty distinguishing your thoughts.*if Mercury is not very poorly aspected, there may be a vivid imagination/);
    expect(`${entry(12).pt} ${entry(12).en}`).not.toMatch(/bem aspectado|well aspected|psychic abilities|habilidades psíquicas|paranoi|colapso|collapse/);
  });
});
