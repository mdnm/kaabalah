import { describe, expect, it } from "vitest";
import { getPlanetHouseDescriptionEntry, type DescriptionHouseNumber } from "./descriptions";

const entry = (house: DescriptionHouseNumber) => getPlanetHouseDescriptionEntry("uranus", house)!;
const houses = Array.from({ length: 12 }, (_, i) => i + 1) as DescriptionHouseNumber[];

describe("Uranus house source distinctions", () => {

  it("keeps paired direct-address copy, two lowercase sentences and array notes without fate or cusp aliases", () => {
    for (const house of houses) {
      const r = entry(house);
      expect(r.pt).toMatch(/você|seu|sua/);
      expect(r.en).toMatch(/\byou\b|\byour\b/);
      for (const text of [r.pt, r.en]) {
        const sentences = text.match(/[^.!?]+[.!?]/gu)!;
        expect(sentences).toHaveLength(2);
        expect(sentences.join("")).toBe(text);
        for (const sentence of sentences) expect(sentence.trim()).toMatch(/^\p{Ll}/u);
        expect(text).not.toMatch(/—|o curso|the course|a fonte|the source|o livro|the book|omitid|omitted|Aquário|Aquarius|cúspide|cusp|Meio.do.Céu|Fundo.do.Céu|\bMC\b|\bIC\b|inevit|divórcio|divorce|diagnos|neurose|neurosis/);
      }
      expect(r.keywords.pt.length).toBeGreaterThan(0);
      expect(r.keywords.pt).toHaveLength(r.keywords.en.length);
      expect(Array.isArray(r.reviewNotes)).toBe(true);
    }
  });

  it("conditions house 1 stubbornness on difficult aspects", () => {
    expect(entry(1).pt).toMatch(/com aspectos difíceis.*obstinado e discordar apenas para ser diferente/);
    expect(entry(1).en).toMatch(/with difficult aspects.*stubborn and disagree just to be different/);
    expect(entry(1).pt).toContain("outras pessoas podem achar");
    expect(entry(1).en).toContain("other people may find");
  });

  it("retains unconventional values, nonlinear thought and reluctance to put down roots", () => {
    expect(entry(2).pt).toContain("liberdade que o dinheiro oferece");
    expect(entry(2).en).toContain("freedom money offers");
    expect(entry(3).pt).toContain("não linear");
    expect(entry(3).en).toContain("nonlinear");
    expect(entry(4).pt).toMatch(/temendo perder alternativas.*relutar em criar raízes.*em alguns casos/);
    expect(entry(4).en).toMatch(/fearing the loss of alternatives.*hesitate to put down roots.*in some cases/);
  });

  it("retains house 5 later-life timing for unusual hobbies and romances", () => {
    expect(entry(5).pt).toMatch(/insatisfeito.*mais tarde na vida.*hobbies.*romances/);
    expect(entry(5).en).toMatch(/dissatisfied.*later in life.*hobbies.*romances/);
    expect(entry(5).keywords.pt).toContain("mais tarde na vida");
    expect(entry(5).keywords.en).toContain("later in life");
    expect(entry(6).pt).toContain("pode provocar mudanças");
    expect(entry(6).en).toContain("may bring about changes");
  });

  it("separates house 7 non-manifestation from non-recognition rather than applying unawareness to both", () => {
    expect(entry(7).pt).toMatch(/se não é você quem manifesta a inquietação, pode atrair alguém que o faça; se não reconhece sua necessidade de uma estrutura menos convencional, pode pressionar/);
    expect(entry(7).en).toMatch(/if you are not the one expressing the restlessness, you may attract someone who does; if you do not recognize your need for a less conventional structure, you may pressure/);
  });

  it("limits house 8 extreme alternation to some cases", () => {
    expect(entry(8).pt).toMatch(/em alguns casos.*paixão excessiva e frieza desumana/);
    expect(entry(8).en).toMatch(/^in some cases.*excessive passion and inhuman coldness/);
    expect(entry(8).pt).toContain("leis mais sutis da natureza");
    expect(entry(8).en).toContain("nature’s subtler laws");
  });

  it("keeps independent belief revision and public innovation as personal tendencies", () => {
    expect(entry(9).pt).toMatch(/independente.*desfazendo os sistemas/);
    expect(entry(9).en).toMatch(/independently.*dismantling the systems/);
    expect(entry(10).pt).toMatch(/quer contribuir.*ser visto.*pode sentir vontade de deixar/);
    expect(entry(10).en).toMatch(/want to contribute.*be seen.*may feel like leaving/);
  });

  it("conditions house 11 harsh revolutionary ideas on difficult aspects and retains freedom concerns", () => {
    expect(entry(11).pt).toMatch(/individualidade e liberdade ameaçadas.*se Urano estiver mal aspectado.*duras demais ou drásticas/);
    expect(entry(11).en).toMatch(/individuality and freedom are threatened.*if Uranus is poorly aspected.*excessively harsh or drastic/);
  });

  it("keeps house 12 independence-intimacy tension without therapeutic promises", () => {
    expect(entry(12).pt).toMatch(/inventiva, original e intuitiva.*relutância.*independência.*mesmo desejando intimidade e segurança.*impedindo/);
    expect(entry(12).en).toMatch(/inventive, original and intuitive.*reluctance.*independence.*even while wanting intimacy and security.*preventing/);
    expect(`${entry(12).pt} ${entry(12).en}`).not.toMatch(/terapia|therapy|cura|healing|medita|drogas|drugs/);
  });
});
