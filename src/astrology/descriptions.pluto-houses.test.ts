import { describe, expect, it } from "vitest";
import { getPlanetHouseDescriptionEntry, type DescriptionHouseNumber } from "./descriptions";

const entry = (house: DescriptionHouseNumber) => getPlanetHouseDescriptionEntry("pluto", house)!;
const houses = Array.from({ length: 12 }, (_, i) => i + 1) as DescriptionHouseNumber[];

describe("Pluto house source distinctions", () => {

  it("keeps paired direct-address copy, two lowercase sentences and array notes without source notices or cusp aliases", () => {
    for (const house of houses) {
      const r = entry(house);
      expect(r.pt).toMatch(/você|seu|sua/);
      expect(r.en).toMatch(/\byou\b|\byour\b/);
      for (const text of [r.pt, r.en]) {
        const sentences = text.match(/[^.!?]+[.!?]/gu)!;
        expect(sentences).toHaveLength(2);
        expect(sentences.join("")).toBe(text);
        for (const sentence of sentences) expect(sentence.trim()).toMatch(/^\p{Ll}/u);
        expect(text).not.toMatch(/—|o curso|the course|a fonte|the source|o livro|the book|omitid|omitted|Escorpião|Scorpio|cúspide|cusp|Meio.do.Céu|Fundo.do.Céu|\bMC\b|\bIC\b|inevit|diagnos|cura garantida|guaranteed healing/);
      }
      expect(r.keywords.pt.length).toBeGreaterThan(0);
      expect(r.keywords.pt).toHaveLength(r.keywords.en.length);
      expect(Array.isArray(r.reviewNotes)).toBe(true);
    }
  });

  it("keeps the full house 1 blocked-progress and indirect-action antecedents", () => {
    expect(entry(1).pt).toMatch(/^quando sente seu progresso bloqueado.*se não reconhece essa frustração e evita agir construtivamente sobre ela.*outras pessoas.*rompimento/);
    expect(entry(1).en).toMatch(/^when you feel your progress is blocked.*if you do not acknowledge this frustration and avoid acting constructively on it.*other people.*break/);
    expect(entry(2).pt).toMatch(/se ficar excessivamente identificado.*inconscientemente provocar/);
    expect(entry(2).en).toMatch(/if you become overly identified.*unconsciously bring about/);
  });

  it("separates house 3 fear of speech from concealment through fear of exposure", () => {
    expect(entry(3).pt).toMatch(/pensamentos obsessivos ou destrutivos podem fazer você temer o que dirá, enquanto o receio de se expor pode levá-lo a esconder/);
    expect(entry(3).en).toMatch(/obsessive or destructive thoughts may make you fear what you will say, while fear of exposing yourself may lead you to hide/);
  });

  it("keeps house 4 vulnerability and post-collapse resources separate despite the erroneous MC heading", () => {
    expect(entry(4).pt).toMatch(/ao se sentir vulnerável em casa.*controlar.*; depois de um colapso, pode encontrar recursos/);
    expect(entry(4).en).toMatch(/when you feel vulnerable at home.*control.*; after a collapse, you may find unexpected resources/);
    expect(`${entry(4).pt} ${entry(4).en}`).not.toMatch(/causar.*colapso|cause.*collapse|colapso familiar|family collapse/);
  });

  it("omits house 5 creative-trauma claims rather than losing their later-life timing", () => {
    expect(entry(5).pt).toMatch(/orgulho inflado.*dúvida.*nos romances.*inibi-los ou buscar força/);
    expect(entry(5).en).toMatch(/inflated pride.*doubt.*in romance.*inhibit them or seek strength/);
    expect([entry(5).pt, entry(5).en, ...entry(5).keywords.pt, ...entry(5).keywords.en].join(" ")).not.toMatch(/trauma|criativ|creativ/);
    expect(entry(6).pt).toContain("busca compulsiva por mudar métodos de trabalho");
    expect(entry(6).en).toContain("compulsive drive to change work methods");
  });

  it("keeps house 7 projection, unequal power and reasons for difficulty leaving without outcome guarantees", () => {
    expect(entry(7).pt).toMatch(/projetar no parceiro.*teme ruptura.*poder pode ficar desequilibrado.*por lealdade ou porque sua identidade/);
    expect(entry(7).en).toMatch(/project.*onto a partner.*fearing a rupture.*power may become unequal.*through loyalty or because your identity/);
    expect(`${entry(7).pt} ${entry(7).en}`).not.toMatch(/sobreviv|surviv|relacionamento acaba|relationship ends/);
  });

  it("limits house 8 accomplishments to sexual energy and attaches bad aspects only to financial complications", () => {
    expect(entry(8).pt).toMatch(/algumas pessoas conseguem dirigir a energia sexual para realizações/);
    expect(entry(8).en).toMatch(/some people can direct sexual energy into accomplishments/);
    expect(entry(8).pt).toMatch(/nos vínculos íntimos podem surgir disputas de poder; nas finanças compartilhadas.*especialmente se Plutão estiver mal aspectado/);
    expect(entry(8).en).toMatch(/power struggles may arise in intimate bonds; shared-finance complications.*especially if Pluto is badly aspected/);
  });

  it("preserves house 9 belief-threat motivation and house 10 denied-ambition scope", () => {
    expect(entry(9).pt).toMatch(/por medo.*questionar suas crenças.*controlar/);
    expect(entry(9).en).toMatch(/for fear.*question your beliefs.*control/);
    expect(entry(10).pt).toMatch(/mesmo dizendo que não tem ambição.*frustrado/);
    expect(entry(10).en).toMatch(/even while saying you have no ambition.*frustrated/);
  });

  it("conditions house 11 compulsive causes on a difficult aspect without declaring the group actually destructive", () => {
    expect(entry(11).pt).toMatch(/perceber o grupo como se.*se Plutão tiver um aspecto difícil.*compulsivamente uma causa após outra/);
    expect(entry(11).en).toMatch(/perceive the group as though.*if Pluto has a difficult aspect.*compulsively embrace one cause after another/);
    expect(entry(12).pt).toMatch(/controle rígido.*reprime impulsos positivos.*desejar crescer.*temer mudanças/);
    expect(entry(12).en).toMatch(/rigid control.*suppresses positive impulses.*want to grow.*fearing change/);
  });
});
