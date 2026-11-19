import { describe, expect, it } from "vitest";
import { getPlanetHouseDescriptionEntry, type DescriptionHouseNumber } from "./descriptions";

const entry = (house: DescriptionHouseNumber) => getPlanetHouseDescriptionEntry("saturn", house)!;
const houses = Array.from({ length: 12 }, (_, i) => i + 1) as DescriptionHouseNumber[];

describe("Saturn house source distinctions", () => {

  it("keeps paired direct-address copy, two lowercase sentences and array notes", () => {
    for (const house of houses) {
      const r = entry(house);
      expect(r.pt).toMatch(/você|seu|sua/);
      expect(r.en).toMatch(/\byou\b|\byour\b/);
      for (const text of [r.pt, r.en]) {
        const sentences = text.match(/[^.!?]+[.!?]/gu)!;
        expect(sentences).toHaveLength(2);
        expect(sentences.join("")).toBe(text);
        for (const sentence of sentences) expect(sentence.trim()).toMatch(/^\p{Ll}/u);
        expect(text).not.toMatch(/—|o curso|the course|a fonte|the source|o livro|the book|omitid|omitted|Capricórnio|Capricorn|cúspide|cusp|Meio.do.Céu|Fundo.do.Céu|\bMC\b|\bIC\b/);
      }
      expect(r.keywords.pt.length).toBeGreaterThan(0);
      expect(r.keywords.pt).toHaveLength(r.keywords.en.length);
      expect(Array.isArray(r.reviewNotes)).toBe(true);
    }
  });

  it("attributes perceived coldness to others and keeps material insecurity despite possessions", () => {
    expect(entry(1).pt).toMatch(/outras pessoas podem interpretar sua insegurança ou reserva como frieza/);
    expect(entry(1).en).toMatch(/others may interpret your insecurity or reserve as coldness/);
    expect(entry(2).pt).toContain("ansiedade sobre segurança possa persistir mesmo com muitas posses");
    expect(entry(2).en).toContain("anxiety about security may persist even with many possessions");
  });

  it("keeps difficulty with small talk rather than deliberate avoidance", () => {
    expect(entry(3).pt).toContain("ter dificuldade com conversas triviais ou falar sem parar");
    expect(entry(3).en).toContain("struggle with small talk or talk nonstop");
    expect(entry(4).pt).toMatch(/desconfiar dos outros.*permanente e estável/);
    expect(entry(4).en).toMatch(/distrust others.*permanent and stable/);
  });

  it("keeps guarded romance and the tension between order and oppressive routine", () => {
    expect(entry(5).pt).toMatch(/medo de rejeição.*resguardar.*romance/);
    expect(entry(5).en).toMatch(/fear of rejection.*guard.*romance/);
    expect(entry(6).pt).toMatch(/necessidade compulsiva.*desconfiança.*frustrado e preso/);
    expect(entry(6).en).toMatch(/compulsive need.*distrust.*frustrated and trapped/);
  });

  it("does not narrow house 7 absent partners to emotional absence and retains house 8 conflicting desires", () => {
    expect(`${entry(7).pt} ${entry(7).en}`).not.toMatch(/emocionalmente ausentes|emotionally absent/);
    expect(entry(7).pt).toMatch(/ausentes em certos aspectos/);
    expect(entry(7).en).toMatch(/absent in certain respects/);
    expect(entry(8).pt).toMatch(/desejar intensamente intimidade.*afastar-se por medo/);
    expect(entry(8).en).toMatch(/intensely desire intimacy.*withdrawing for fear/);
  });

  it("preserves alternative religious rigidity and skepticism without an invented aspect condition", () => {
    expect(entry(9).pt).toMatch(/respostas definitivas.*observância religiosa.*ou você.*ceticismo e cinismo/);
    expect(entry(9).en).toMatch(/definitive answers.*religious observance.*or you.*skepticism and cynicism/);
    expect(`${entry(9).pt} ${entry(9).en}`).not.toMatch(/aspect/);
  });

  it("conditions house 10 anger on self-limitation and obstacles on difficult aspects", () => {
    expect(entry(10).pt).toMatch(/quando sente que precisa limitar suas ambições aos padrões sociais.*raiva e inveja.*se Saturno estiver mal aspectado.*atrasos e obstáculos/);
    expect(entry(10).en).toMatch(/when you feel you must limit your ambitions to social standards.*anger and envy.*if Saturn is poorly aspected.*delays and obstacles/);
  });

  it("keeps belonging alongside withdrawal and friendship fears without guaranteed loyalty", () => {
    expect(entry(11).pt).toMatch(/fazer parte.*sem jeito ou retraído.*temer rejeição ou crítica/);
    expect(entry(11).en).toMatch(/belong.*awkward or withdrawn.*fear rejection or criticism/);
    expect(`${entry(11).pt} ${entry(11).en}`).not.toMatch(/leais|duradouras|loyal|lasting/);
  });

  it("retains house 12 control and some-cases intimacy fears without prescribing isolation", () => {
    expect(entry(12).pt).toMatch(/se afrouxar o controle.*em alguns casos.*terror diante da intimidade.*acreditar.*autonomia afastando-se/);
    expect(entry(12).en).toMatch(/if you loosen your control.*in some cases.*terror at intimacy.*believe.*autonomy only by distancing/);
    expect(`${entry(12).pt} ${entry(12).en}`).not.toMatch(/cura|healing|hospital|terapia|therapy|deve|should/);
  });
});
