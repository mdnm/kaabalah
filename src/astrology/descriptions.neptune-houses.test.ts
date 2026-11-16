import { describe, expect, it } from "vitest";
import { getPlanetHouseDescriptionEntry, type DescriptionHouseNumber } from "./descriptions";

const entry = (house: DescriptionHouseNumber) => getPlanetHouseDescriptionEntry("neptune", house)!;
const houses = Array.from({ length: 12 }, (_, i) => i + 1) as DescriptionHouseNumber[];

describe("Neptune house source distinctions", () => {
  it("uses only adopted inclusive A10 ranges, keeping A8 applicability in context metadata", () => {
    const ranges: Record<DescriptionHouseNumber, readonly (readonly [number, number])[]> = {
      1: [[1001, 1010], [1038, 1043]], 2: [[1063, 1076], [1077, 1082]],
      3: [[1105, 1117]], 4: [[1148, 1165], [1181, 1185]],
      5: [[1221, 1227], [1237, 1243], [1250, 1254], [1258, 1262]],
      6: [[1274, 1283], [1316, 1323], [1324, 1334]],
      7: [[1346, 1356], [1358, 1364], [1371, 1376], [1378, 1388]],
      8: [[1414, 1428], [1441, 1453], [1454, 1465]],
      9: [[1477, 1480], [1492, 1494]], 10: [[1545, 1546], [1550, 1550]],
      11: [[1574, 1579], [1582, 1584], [1601, 1602]],
      12: [[1624, 1625], [1645, 1647]],
    };
    for (const house of houses) {
      expect(entry(house).src).toEqual(ranges[house].map(([from, to]) => ({
        file: "modulo 4/aula 10 modulo 4/aula-10.md", from, to,
      })));
    }
    expect(entry(8).reviewNotes.join(" ")).toMatch(/aula-8.md.*877-885.*VIII.*884-885/);
  });

  it("keeps paired direct-address copy, two lowercase sentences and string-array notes", () => {
    for (const house of houses) {
      const r = entry(house);
      expect(r.pt).toMatch(/você|seu|sua/);
      expect(r.en).toMatch(/\byou\b|\byour\b/);
      for (const text of [r.pt, r.en]) {
        const sentences = text.match(/[^.!?]+[.!?]/gu)!;
        expect(sentences).toHaveLength(2);
        expect(sentences.join("")).toBe(text);
        for (const sentence of sentences) expect(sentence.trim()).toMatch(/^\p{Ll}/u);
        expect(text).not.toMatch(/—|o curso|the course|a fonte|the source|o livro|the book|omitid|omitted|Peixes|Pisces|cúspide|cusp|Meio.do.Céu|Fundo.do.Céu|\bMC\b|\bIC\b|cura garantida|guaranteed healing|inevit|diagnos|vidas passadas|past lives/);
      }
      expect(r.keywords.pt.length).toBeGreaterThan(0);
      expect(r.keywords.pt).toHaveLength(r.keywords.en.length);
      expect(Array.isArray(r.reviewNotes)).toBe(true);
      for (const note of r.reviewNotes) expect(typeof note).toBe("string");
    }
  });

  it("keeps house 1 martyr-role resentment distinct from adaptation", () => {
    expect(entry(1).pt).toMatch(/em alguns casos.*assumir o papel de mártir e se ressentir quando os outros se aproveitam disso/);
    expect(entry(1).en).toMatch(/in some cases.*take on the role of a martyr and resent it when others take advantage of that/);
    expect(`${entry(1).pt} ${entry(1).en}`).not.toMatch(/adapt/);
    expect(entry(2).pt).toContain("lidar com finanças e investimentos com confusão e nebulosidade");
    expect(entry(2).en).toContain("handle finances and investments with confusion and lack of clarity");
  });

  it("keeps the two house 3 causal paths separate", () => {
    expect(entry(3).pt).toMatch(/desejo de ver o belo e o divino pode levar você a ignorar.*enquanto a abertura às opiniões alheias pode fazê-las parecer pensamentos próprios/);
    expect(entry(3).en).toMatch(/desire to see the beautiful and divine may lead you to overlook.*while openness to other people’s opinions may make them seem like your own thoughts/);
    expect(entry(4).pt).toMatch(/com aspectos difíceis.*se separaram ou se dissolveram/);
    expect(entry(4).en).toMatch(/with difficult aspects.*separated or dissolved/);
  });

  it("keeps elusive pleasure and subjective parenthood martyrdom under difficult aspects", () => {
    expect(entry(5).pt).toContain("nem sempre encontra espaço para buscar o prazer que deseja");
    expect(entry(5).en).toContain("not always find room to pursue the pleasure you want");
    expect(entry(5).pt).toContain("se houver aspectos difíceis, pode se sentir martirizado ao ser pai ou mãe");
    expect(entry(5).en).toContain("with difficult aspects, you may feel martyred by parenthood");
    expect(`${entry(5).pt} ${entry(5).en}`).not.toMatch(/mais tarde|later|adiado|deferred/);
  });

  it("retains work tension and the uncertain altruism boundary without promising rescue", () => {
    expect(entry(6).pt).toMatch(/tensão.*ordem.*fluir sem limites.*bode expiatório/);
    expect(entry(6).en).toMatch(/tension.*order.*flow without limits.*scapegoat/);
    expect(entry(7).pt).toMatch(/idealizar.*depender.*fronteira entre altruísmo.*capacho/);
    expect(entry(7).en).toMatch(/idealize.*depend.*boundary between altruism.*doormat/);
  });

  it("conditions constructive or destructive house 8 experience on aspects rather than sensitivity", () => {
    expect(entry(8).pt).toMatch(/forma construtiva ou destrutiva de vivenciar o intangível depende dos aspectos de Netuno/);
    expect(entry(8).en).toMatch(/whether intangible experiences are constructive or destructive depends on Neptune’s aspects/);
    expect(`${entry(8).pt} ${entry(8).en}`).not.toMatch(/confusão|confusion|clariv|clairvoy|psíquic|psychic/);
    expect(entry(8).reviewNotes.join(" ")).toContain("no cusp-sign-element prerequisite");
  });

  it("conditions house 9 disappointment on seeking one answer and frames house 10 salvation as belief", () => {
    expect(entry(9).pt).toMatch(/se procura uma única resposta para tudo.*pode se desapontar/);
    expect(entry(9).en).toMatch(/if you seek a single answer to everything.*may be disappointed/);
    expect(entry(10).pt).toMatch(/pode acreditar que sua salvação depende/);
    expect(entry(10).en).toMatch(/may believe your salvation depends/);
  });

  it("retains house 11 solidarity and the difficult-aspects condition on friendship disappointment", () => {
    expect(entry(11).pt).toMatch(/ajudar os outros por solidariedade.*se Netuno tiver aspectos difíceis.*decepções com amigos/);
    expect(entry(11).en).toMatch(/helping others out of solidarity.*if Neptune has difficult aspects.*disappointment through friends/);
    expect(`${entry(11).pt} ${entry(11).en}`).not.toMatch(/culpa|guilt|carinhosos|caring/);
  });

  it("keeps house 12 emotional overwhelm and escapism without medical or supernatural claims", () => {
    expect(entry(12).pt).toMatch(/inundado e sufocado.*sonhos acordados e fantasias.*pequenos mundos/);
    expect(entry(12).en).toMatch(/flooded and overwhelmed.*daydreams and fantasies.*little worlds/);
    expect(`${entry(12).pt} ${entry(12).en}`).not.toMatch(/depress|drogas|drugs|terapia|therapy|energias|energies|cura|healing/);
  });
});
