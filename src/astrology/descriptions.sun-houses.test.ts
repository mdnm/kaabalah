import { describe, expect, it } from "vitest";
import { getPlanetHouseDescriptionEntry, type DescriptionHouseNumber } from "./descriptions";

const entry = (house: DescriptionHouseNumber) => getPlanetHouseDescriptionEntry("sun", house)!;

describe("Sun house source distinctions", () => {

  it("preserves the negative-expression limits and source-supported recognition keyword", () => {
    expect(entry(1).pt).toMatch(/em expressão negativa.*arrogância, egocentrismo e orgulho excessivo/);
    expect(entry(1).en).toMatch(/in its negative expression.*arrogance, egocentrism and excessive pride/);
    expect(entry(1).keywords.pt).toContain("reconhecimento");
    expect(entry(1).keywords.en).toContain("recognition");
    expect(entry(2).pt).toMatch(/expressão negativa.*status.*extravagância.*compensar insegurança/);
    expect(entry(2).en).toMatch(/negative expression.*status-seeking.*extravagance.*compensate for insecurity/);
  });

  it("keeps house 3 comparative vitality neutral and schooling conditional specifically on Sun aspects", () => {
    expect(entry(3).pt).toMatch(/mais vitalidade.*aspectos difíceis ao Sol podem indicar desafios no início da vida escolar/);
    expect(entry(3).en).toMatch(/more alive.*difficult aspects to the Sun may indicate challenges early in schooling/);
    expect(JSON.stringify(entry(3).keywords)).not.toMatch(/ouvida|ouvido/);
    expect(entry(3).en).not.toContain("most alive");
  });

  it("keeps house 4 second-half-of-life potential effectiveness without a health promise", () => {
    expect(entry(4).pt).toMatch(/identidade própria sem negar.*raízes familiares/);
    expect(entry(4).en).toMatch(/identity of your own without denying.*family ties and roots/);
    expect(entry(4).pt).toMatch(/na segunda metade da vida.*potencial criativo e sua autoexpressão podem tornar-se mais eficazes/);
    expect(entry(4).en).toMatch(/in the second half of life.*creative potential and self-expression may become more effective/);
    for (const text of [entry(4).pt, entry(4).en]) expect(text).not.toMatch(/saúde|health|vitalidade|vitality|mais importante|more important/i);
  });

  it("retains quality/satisfaction rather than output and routine with the obsessive-improvement risk", () => {
    expect(entry(5).pt).toMatch(/qualidade desse envolvimento e da satisfação.*poderia fazer melhor/);
    expect(entry(5).en).toMatch(/quality of that involvement and the satisfaction.*could do better/);
    expect(entry(6).pt).toMatch(/rotina diária.*autoaperfeiçoamento.*excessivo ou obsessivo/);
    expect(entry(6).en).toMatch(/daily routine and self-improvement.*excessive or obsessive/);
    expect(entry(6).pt).toMatch(/serviço aos outros.*eficiência (?:em|nas) tarefas práticas/);
    expect(entry(6).en).toMatch(/service to others.*efficiency in practical tasks/);
    for (const text of [entry(6).pt, entry(6).en]) expect(text).not.toMatch(/ritual|você deve|you should|you must/i);
  });

  it("keeps relational identity as a resource alongside conditional hiding and direct intimacy avoidance", () => {
    expect(entry(7).pt).toMatch(/poder, propósito e individualidade.*relacionamentos.*atividades conjuntas podem ajudar/);
    expect(entry(7).en).toMatch(/power, purpose and individuality.*relationships.*shared activities may help/);
    expect(entry(7).pt).toMatch(/em alguns casos você pode tentar se esconder.*alguém forte ou influente/);
    expect(entry(7).en).toMatch(/in some cases, you may try to hide.*someone strong or influential/);
    expect(entry(8).pt).toMatch(/em alguns casos você pode tentar evitar a verdadeira intimidade.*troca emocional/);
    expect(entry(8).en).toMatch(/in some cases you may try to avoid true intimacy.*emotional exchange/);
    expect(entry(8).keywords.pt).toEqual(expect.arrayContaining(["transcendência", "mistério", "tabu", "evitação da intimidade"]));
    expect(entry(8).keywords.en).toEqual(expect.arrayContaining(["transcendence", "mystery", "taboo", "avoidance of intimacy"]));
    for (const keywords of [entry(8).keywords.pt, entry(8).keywords.en]) expect(new Set(keywords).size).toBe(keywords.length);
  });

  it("preserves abstraction/status/group shadows and house 12 identity-unconscious tension", () => {
    expect(entry(9).pt).toMatch(/abstrações e ao futuro.*perde contato com o cotidiano/);
    expect(entry(9).en).toMatch(/abstractions and the future.*loses touch with everyday life/);
    expect(entry(10).pt).toMatch(/ligar demais seu valor pessoal aos títulos/);
    expect(entry(10).en).toMatch(/self-worth too closely to titles/);
    expect(entry(11).pt).toMatch(/diluir a diferença entre suas próprias convicções.*grupo espera/);
    expect(entry(11).en).toMatch(/blur the distinction between your own convictions.*group expects/);
    expect(entry(12).pt).toMatch(/tensão entre afirmar uma identidade própria.*inconsciente pessoal e coletivo.*imagens míticas ou arquetípicas/);
    expect(entry(12).en).toMatch(/tension between asserting an identity of your own.*personal and collective unconscious.*mythical or archetypal images/);
    for (const house of [4, 7, 10, 12] as const) {
      expect(`${entry(house).pt} ${entry(house).en}`).not.toMatch(/Leão|Leo|Meio-do-Céu|Fundo-do-Céu|cúspide|cusp|past lives|vidas anteriores/);
    }
  });
});
