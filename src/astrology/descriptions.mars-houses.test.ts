import { describe, expect, it } from "vitest";
import { getPlanetHouseDescriptionEntry, type DescriptionHouseNumber } from "./descriptions";

const entry = (house: DescriptionHouseNumber) => getPlanetHouseDescriptionEntry("mars", house)!;
const houses = Array.from({ length: 12 }, (_, i) => i + 1) as DescriptionHouseNumber[];

describe("Mars house source distinctions", () => {
  it("uses only the adopted inclusive primary ranges", () => {
    const ranges: Record<DescriptionHouseNumber, readonly (readonly [number, number])[]> = {
      1: [[997, 1000], [1005, 1009]], 2: [[1031, 1034], [1036, 1046]],
      3: [[1055, 1058], [1065, 1069]], 4: [[1092, 1098], [1104, 1114]],
      5: [[1132, 1138]], 6: [[1174, 1178], [1188, 1190], [1160, 1164], [1171, 1173]],
      7: [[1202, 1206]], 8: [[1218, 1219], [1224, 1227], [1240, 1244], [1248, 1252]],
      9: [[1261, 1271], [1275, 1276]], 10: [[1289, 1292], [1309, 1310]],
      11: [[1319, 1325], [1333, 1336]],
      12: [[1356, 1359], [1366, 1367], [1369, 1373], [1376, 1379]],
    };
    for (const house of houses) {
      expect(entry(house).src).toEqual(ranges[house].map(([from, to]) => ({
        file: "modulo 4/aula 9 modulo 4/aula-9.md", from, to,
      })));
    }
  });

  it("keeps paired direct-address copy and array metadata without source notices or angle aliases", () => {
    for (const house of houses) {
      const r = entry(house);
      expect(r.pt).toMatch(/você|seu|sua/);
      expect(r.en).toMatch(/\byou\b|\byour\b/);
      for (const text of [r.pt, r.en]) {
        const sentences = text.match(/[^.!?]+[.!?]/gu)!;
        expect(sentences).toHaveLength(2);
        expect(sentences.join("")).toBe(text);
        for (const sentence of sentences) expect(sentence.trim()).toMatch(/^\p{Ll}/u);
        expect(text).not.toMatch(/—|o curso|the course|a fonte|the source|o livro|the book|omitid|omitted|Áries|Aries|Ares|cúspide|cusp|Meio.do.Céu|Fundo.do.Céu|\bMC\b|\bIC\b/);
      }
      expect(r.keywords.pt.length).toBeGreaterThan(0);
      expect(r.keywords.pt).toHaveLength(r.keywords.en.length);
      expect(Array.isArray(r.reviewNotes)).toBe(true);
      for (const note of r.reviewNotes) expect(typeof note).toBe("string");
    }
  });

  it("retains worst-case anger, counterproductive haste and hidden domestic aggression", () => {
    expect(entry(1).pt).toMatch(/na pior das hipóteses.*obstáculos mínimos/);
    expect(entry(1).en).toMatch(/at worst.*minimal obstacles/);
    expect(entry(2).pt).toContain("pode ser contraproducente");
    expect(entry(2).en).toContain("may be counterproductive");
    expect(entry(3).pt).toMatch(/cortante.*arma.*impulsionar/);
    expect(entry(3).en).toMatch(/cutting.*weapon.*spur/);
    expect(entry(4).pt).toMatch(/ocultas.*irrompam.*deslocar sua raiva/);
    expect(entry(4).en).toMatch(/hidden.*erupt.*displace your latent anger/);
  });

  it("preserves the separate house 6 aspect conditions and initial qualifier without mythology", () => {
    expect(entry(5).pt).toContain("espírito muito competitivo");
    expect(entry(5).en).toContain("strong competitive spirit");
    expect(entry(6).pt).toMatch(/quando Marte está bem aspectado\. com aspectos difíceis.*especialmente Plutão.*ao menos no começo/);
    expect(entry(6).en).toMatch(/when Mars is well aspected\. with difficult aspects.*particularly Pluto.*at least initially/);
    expect(entry(6).en).toContain("haste, anger, and impatience with coworkers");
  });

  it("keeps house 7 alternatives and house 8 aspect-dependent conflicts and transformation", () => {
    expect(entry(7).pt).toContain("ou, em alguns casos");
    expect(entry(7).en).toContain("or, in some cases");
    expect(entry(7).pt).toContain("retomar o poder que antes cedeu");
    expect(entry(7).en).toContain("reclaim the power you had previously handed over");
    expect(entry(7).reviewNotes.join(" ")).toContain("Na casa 5");
    expect(entry(8).pt).toMatch(/aspectos difíceis de Marte podem trazer conflitos.*transmutação construtiva depende em grande parte dos aspectos/);
    expect(entry(8).en).toMatch(/difficult aspects to Mars may bring conflicts.*constructive transformation depends largely on Mars’s aspects/);
  });

  it("keeps house 9 zeal unconditional on aspects and records the book emphasis difference", () => {
    expect(entry(9).pt).toMatch(/com zelo.*verdade como a única/);
    expect(entry(9).en).toMatch(/with zeal.*truth as the only one/);
    expect(`${entry(9).pt} ${entry(9).en}`).not.toMatch(/aspect/);
    expect(entry(9).reviewNotes.join(" ")).toMatch(/44085–44091.*abertura.*1261–1271.*primária/);
  });

  it("keeps ambition and authority conflict without reversing the house 10 source idiom", () => {
    expect(entry(10).pt).toMatch(/forte ambição.*poderoso.*conflito com superiores e autoridades/);
    expect(entry(10).en).toMatch(/strong ambition.*powerful.*clash with superiors and authorities/);
    expect(entry(10).reviewNotes.join(" ")).toContain("os meios justificam os fins");
    expect(`${entry(10).pt} ${entry(10).en}`).not.toMatch(/justific|justify|means|fins/);
  });

  it("retains group compromise and shifted responsibility without unconditional reception or goals", () => {
    expect(entry(11).pt).toMatch(/mobilizar.*dificuldade em conciliar.*transferir a ele sua responsabilidade/);
    expect(entry(11).en).toMatch(/mobilize.*struggle to reconcile.*shift your responsibility/);
    expect(entry(11).reviewNotes.join(" ")).toMatch(/1317–1318.*recepção.*1344–1348/);
  });

  it("retains hidden dissatisfaction, escapism and adverse abdication alongside service", () => {
    expect(entry(12).pt).toMatch(/insatisfação vaga.*queixas sem ação.*escapismos.*causa maior.*abrir mão da responsabilidade/);
    expect(entry(12).en).toMatch(/vague dissatisfaction.*complaints without action.*escapism.*greater cause.*relinquishing responsibility/);
    expect(`${entry(12).pt} ${entry(12).en}`).not.toMatch(/Eichmann|Sanders|suic|sonhos|dreams|saúde|health|maníac|manic/);
  });
});
