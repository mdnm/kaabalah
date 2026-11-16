import { describe, expect, it } from "vitest";
import { getHouseDescriptionEntry, type DescriptionHouseNumber } from "./descriptions";

const entry = (house: DescriptionHouseNumber) => getHouseDescriptionEntry(house)!;
const houses = Array.from({ length: 12 }, (_, i) => i + 1) as DescriptionHouseNumber[];
const a6 = "modulo 4/aula 6 modulo 4/aula-6.md";
const a8 = "modulo 4/aula 8 modulo 4/aula-8.md";
const copy = (house: DescriptionHouseNumber) => `${entry(house).pt} ${entry(house).en}`;

describe("numbered house source domains and qualifications", () => {
  it("keeps every domain tied to its own A6 list rather than a planet placement or book label", () => {
    const ranges = [[6, 8], [9, 11], [12, 15], [17, 19], [20, 22], [23, 25],
      [26, 28], [29, 33], [34, 36], [38, 40], [41, 42], [44, 49]];
    for (const house of houses) {
      const [from, to] = ranges[house - 1];
      expect(entry(house).src).toContainEqual({ file: a6, from, to });
      expect(entry(house).src.every(source => source.file === a6 || source.file === a8)).toBe(true);
      expect(copy(house)).not.toMatch(/Ascendente|Ascendant|Meio do Céu|Fundo do Céu|\bMC\b|\bIC\b|Sun|Sol|Saturno|Saturn|Áries|Aries/);
    }
  });

  it("retains both ruler qualifications wherever the A8 negative branch is adopted", () => {
    const negative = [
      [/autoafirmação/, /self-assertion/], [/obstinação e cobiça/, /stubbornness and greed/],
      [/inconstância e superficialidade/, /inconsistency and superficiality/],
      [/volubilidade e inconsciência/, /fickleness and lack of awareness/],
    ];
    for (const house of [2, 3] as const) {
      expect(entry(house).pt).toMatch(/sob aflição e má aspectação dos planetas regentes, essa área pode expressar/);
      expect(entry(house).en).toMatch(/under affliction and poor aspects to the ruling planets, this area may express/);
      expect(entry(house).pt).toMatch(negative[house - 1][0]);
      expect(entry(house).en).toMatch(negative[house - 1][1]);
      expect(entry(house).src.some(source => source.file === a8 && source.from <= 832 && source.to >= 833)).toBe(true);
      expect(entry(house).keywords.pt.at(-1)).toContain("sob aflição dos regentes");
      expect(entry(house).keywords.en.at(-1)).toContain("under affliction to rulers");
    }
    expect(entry(1).pt).toMatch(/autoimagem e da imagem que os outros têm de você/);
    expect(entry(1).en).toMatch(/self-image and the image others have of you/);
    for (const house of [1, 4] as const) {
      expect(copy(house)).not.toMatch(/autoafirmação|self-assertion|volubilidade|fickleness|excessiv|excess/);
    }
  });

  it("leaves parental gender unresolved while preserving distinct family and career domains", () => {
    expect(entry(4).pt).toMatch(/lar, da família, dos clãs e da segurança.*raízes ancestrais/);
    expect(entry(4).en).toMatch(/home, family, clans and security.*ancestral/);
    expect(entry(10).pt).toMatch(/profissão.*carreira.*contribuição à sociedade/);
    expect(entry(10).en).toMatch(/profession.*career.*contribution to society/);
    for (const house of [4, 10] as const) {
      expect(copy(house)).not.toMatch(/progenitor|mesmo sexo|sexo oposto|\bmãe\b|\bpai\b|mother|father|same-sex|opposite-sex/);
      expect(entry(house).reviewNotes.join(" ")).toMatch(/pendente|pending/);
    }
  });

  it("keeps unusual genetic and exaltation labels out of authored thematic meanings", () => {
    expect(entry(2).keywords.pt.join(" ")).toContain("segurança financeira");
    expect(entry(11).keywords.pt.join(" ")).toContain("amizades");
    for (const house of [2, 11] as const) {
      const r = entry(house);
      expect([copy(house), ...r.keywords.pt, ...r.keywords.en].join(" ")).not.toMatch(/genétic|genetic|exaltaç|exaltation|dignidad|dignit/);
    }
    expect(entry(2).reviewNotes.join(" ")).toMatch(/Herança Genética/);
    expect(entry(11).reviewNotes.join(" ")).toMatch(/Exaltações.*ambiguous.*unadopted/);
  });

  it("distinguishes neutral health, relationship and mortality topics from omitted adverse expressions", () => {
    expect(entry(5).pt).toContain("temas dos hobbies, dos prazeres e do lazer");
    expect(entry(6).pt).toContain("temas da saúde e da dieta, da rotina e do trabalho");
    expect(entry(7).pt).toContain("parcerias");
    expect(entry(8).pt).toContain("temas da sexualidade, das iniciações");
    expect(entry(8).pt).toContain("nascimento, morte e renascimento");
    expect(entry(8).en).toContain("themes of sexuality, initiations");
    expect(entry(8).en).toContain("birth, death and rebirth");
    for (const house of [5, 6, 7, 8] as const) {
      expect(entry(house).pt).toMatch(/^no seu mapa/);
      expect(entry(house).en).toMatch(/^in your chart/);
      expect(copy(house)).not.toMatch(/servilismo|servility|sadismo|sadism|leviandade|levity|questões legais|legal issues|diagnos|garantid|guaranteed/);
    }
  });

  it("separates long journeys and philosophy, collective hopes, and inner-life domains", () => {
    expect(entry(9).pt).toMatch(/viagens longas.*estudos aprofundados.*filosofia, religião, ideais/);
    expect(entry(9).en).toMatch(/long journeys.*advanced studies.*philosophy, religion, ideals/);
    expect(entry(11).pt).toMatch(/amizades.*grupos.*projetos, esperanças/);
    expect(entry(12).pt).toMatch(/vidas passadas, da memória ancestral e da vida interior.*instituições como hospitais, prisões e abrigos/);
    expect(entry(12).en).toMatch(/past lives, ancestral memory and inner life.*institutions such as hospitals, prisons and shelters/);
    expect(copy(12)).not.toMatch(/neurose|neurosis|subconsciente|subconscious|autoabandono|self-abandonment|ilusão|illusion/);
    expect(entry(12).reviewNotes.join(" ")).toMatch(/not literal personal history/);
    for (const house of [9, 10, 11, 12] as const) {
      expect(copy(house)).not.toMatch(/irresponsabil|irresponsib|promisc|vazio existencial|existential emptiness|ambição desmesurada|excessive ambition|rebeldia|rebellion/);
    }
  });
});
