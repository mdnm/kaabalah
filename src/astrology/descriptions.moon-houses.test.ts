import { describe, expect, it } from "vitest";
import { getPlanetHouseDescriptionEntry, type DescriptionHouseNumber } from "./descriptions";

const entry = (house: DescriptionHouseNumber) => getPlanetHouseDescriptionEntry("moon", house)!;
const houses = Array.from({ length: 12 }, (_, i) => i + 1) as DescriptionHouseNumber[];

describe("Moon house source distinctions", () => {
  it("uses exactly the adopted primary ranges, including physical lines 57 and 181–183", () => {
    const ranges: Record<DescriptionHouseNumber, readonly (readonly [number, number])[]> = {
      1: [[4, 8], [15, 22]], 2: [[29, 35], [36, 40]],
      3: [[43, 51], [52, 57]], 4: [[69, 76]], 5: [[97, 102]],
      6: [[117, 119], [134, 138]], 7: [[144, 145], [156, 158]],
      8: [[166, 170], [181, 183]], 9: [[188, 192], [193, 197]],
      10: [[211, 215], [230, 231]], 11: [[235, 238], [253, 254]],
      12: [[260, 264], [280, 283]],
    };
    for (const house of houses) {
      expect(entry(house).src).toEqual(ranges[house].map(([from, to]) => ({
        file: "modulo 4/aula 9 modulo 4/aula-9.md", from, to,
      })));
    }
  });

  it("keeps lowercase sentences without source notices or angle/cusp inferences", () => {
    for (const house of houses) {
      const r = entry(house);
      expect(r.pt).toMatch(/^você /);
      expect(r.en).toMatch(/^you /);
      for (const text of [r.pt, r.en]) {
        const sentences = text.match(/[^.!?]+[.!?]/gu)!;
        expect(sentences).toHaveLength(2);
        expect(sentences.join("")).toBe(text);
        for (const sentence of sentences) expect(sentence.trim()).toMatch(/^\p{Ll}/u);
        expect(text).not.toMatch(/o curso|the course|a fonte|the source|o livro|the book|omitid|omitted|Câncer|Cancer|cúspide|cusp|Meio.do.Céu|Fundo.do.Céu|\bMC\b|\bIC\b/);
      }
    }
  });

  it("retains house 1 aspect caveat and subjective perception instead of visible-emotion claims", () => {
    expect(entry(1).pt).toMatch(/respostas emocionais, instintivas e sentimentais.*sem modificações fortes de outros aspectos.*sensibilidade e receptividade/);
    expect(entry(1).en).toMatch(/emotional, instinctive, and sentimental responses.*unless strongly modified by other aspects.*sensitivity and receptivity/);
    expect(entry(1).pt).toContain("leitura subjetiva");
    expect(entry(1).en).toContain("reading subjective");
    expect(JSON.stringify({pt: entry(1).pt, en: entry(1).en, keywords: entry(1).keywords})).not.toMatch(/visível|visible/);
  });

  it("keeps house 3 mood-filtered thought and changing interests, and house 4 pressure qualification", () => {
    expect(entry(3).pt).toMatch(/humor e à sensibilidade.*separar seus próprios pensamentos.*imaginação e a memória.*foco mental.*mudar/);
    expect(entry(3).en).toMatch(/mood and sensitivity.*separate your own thoughts.*imagination and memory.*mental focus.*shift/);
    expect(entry(4).pt).toMatch(/lar.*refúgio.*sob pressão, você pode voltar a padrões de comportamento da primeira infância/);
    expect(entry(4).en).toMatch(/home.*refuge.*under pressure, you may return to behavioral patterns from early childhood/);
    expect(`${entry(4).pt} ${entry(4).en}`).not.toMatch(/cuidado|care|pai|father|mãe|mother/);
  });

  it("preserves creative aspect-dependence and excessive relational adaptation", () => {
    expect(entry(5).pt).toMatch(/aspectos da Lua indiquem com que facilidade/);
    expect(entry(5).en).toMatch(/Moon's aspects indicate how easily/);
    expect(entry(6).pt).toMatch(/vínculo emocional com o trabalho.*necessidades práticas e emocionais/);
    expect(entry(6).en).toMatch(/emotional connection to your work.*practical and emotional needs/);
    expect(entry(7).pt).toMatch(/adaptar em excesso.*derivar demais.*ideia de quem você é/);
    expect(entry(7).en).toMatch(/adapt excessively.*derive too much.*sense of identity/);
    expect(entry(7).pt).toContain("mudanças de humor");
    expect(entry(7).en).toContain("shifts in mood");
  });

  it("limits house 8 anxiety to endings/separations under difficult Moon aspects", () => {
    expect(entry(8).pt).toMatch(/complexos inconscientes opressivos.*se a Lua recebe aspectos difíceis, encerramentos ou separações podem trazer ansiedade maior/);
    expect(entry(8).en).toMatch(/oppressive unconscious complexes.*if the Moon receives difficult aspects, endings or separations may bring greater anxiety/);
    expect(entry(8).pt).toMatch(/possa haver recursos e forças/);
    expect(entry(8).en).toMatch(/may also reveal resources and strength/);
    expect(`${entry(8).pt} ${entry(8).en}`).not.toMatch(/herança|inheritance|infância|childhood/);
  });

  it("adapts philosophy to changing conditions without making inherited faith a prerequisite", () => {
    expect(entry(9).pt).toMatch(/adaptar sua filosofia a influências e condições cambiantes.*escape dos aborrecimentos cotidianos/);
    expect(entry(9).en).toMatch(/adapt your philosophy to changing influences and conditions.*escape from everyday frustrations/);
    expect(entry(9).keywords.pt).toContain("adaptação da filosofia a condições cambiantes");
    expect(entry(9).keywords.en).toContain("adaptation of philosophy to changing conditions");
    expect(`${entry(9).pt} ${entry(9).en}`).not.toMatch(/se você confia|if you.*faith|inherited faith|fé herdada/);
  });

  it("retains house 10 approval/public moods, house 11 impressionability, and house 12 vivid dreams", () => {
    expect(entry(10).pt).toMatch(/busca de aprovação e sensibilidade aos humores do público/);
    expect(entry(10).en).toMatch(/search for approval and sensitivity to public moods/);
    expect(`${entry(10).pt} ${entry(10).en}`).not.toMatch(/se a Lua|if the Moon|quadratura|square|oposiç|opposition/);
    expect(entry(11).pt).toMatch(/suscetibilidade.*metas e ambições podem oscilar com o humor.*opiniões de outras pessoas/);
    expect(entry(11).en).toMatch(/susceptibility.*goals and ambitions may fluctuate.*other people’s opinions/);
    expect(entry(12).pt).toMatch(/confundindo sentimentos alheios com os próprios.*sentimentos e sonhos podem ser vívidos/);
    expect(entry(12).en).toMatch(/mistaking others’ feelings for your own.*feelings and dreams may be vivid/);
    expect(`${entry(12).pt} ${entry(12).en}`).not.toMatch(/mediun|medium|vidas passadas|past lives|mãe|mother/);
  });
});
