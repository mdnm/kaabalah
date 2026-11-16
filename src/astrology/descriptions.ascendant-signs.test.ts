import { describe, expect, it } from "vitest";
import { getAngleSignDescriptionEntry } from "./descriptions";
import type { Sign } from "./dignity";

const entry = (sign: Sign) => getAngleSignDescriptionEntry("ascendant", sign)!;
const copy = (sign: Sign) => `${entry(sign).pt} ${entry(sign).en}`;

describe("standalone Ascendant source qualifications", () => {
  it("uses only adopted standalone primary sections with two lowercase direct-address sentences", () => {
    const ranges: Record<Sign, number[][]> = {
      Aries: [[53, 60], [64, 66]], Taurus: [[68, 79]], Gemini: [[82, 93], [97, 98]],
      Cancer: [[102, 108]], Leo: [[121, 136]], Virgo: [[138, 156]], Libra: [[158, 172]],
      Scorpio: [[174, 188]], Sagittarius: [[190, 195], [203, 205]],
      Capricorn: [[207, 214], [216, 217]], Aquarius: [[222, 225], [237, 238]],
      Pisces: [[241, 243], [249, 249], [254, 255]],
    };
    for (const sign of Object.keys(ranges) as Sign[]) {
      const e = entry(sign);
      expect(e.src).toEqual(ranges[sign].map(([from, to]) => ({ file: "modulo 4/aula 6 modulo 4/aula-6.md", from, to })));
      expect(e.pt).toMatch(/você|sua|seu/);
      expect(e.en).toMatch(/\byou\b|\byour\b/);
      for (const text of [e.pt, e.en]) {
        const sentences = text.match(/[^.!?]+[.!?]/gu)!;
        expect(sentences).toHaveLength(2);
        expect(sentences.join("")).toBe(text);
        for (const sentence of sentences) expect(sentence.trim()).toMatch(/^\p{Ll}/u);
        expect(text).not.toMatch(/—|casa 1|house 1|cúspide|cusp|Sun in|Sol em|o curso|the course|diagnos/);
      }
    }
  });

  it("separates Aries impatience from power ambition and conditions Taurus violence on irritation", () => {
    expect(entry("Aries").pt).toContain("impaciente com limites e restrições, além de mostrar ambição e sede de poder");
    expect(entry("Aries").en).toContain("impatient with limits and restrictions, as well as show ambition");
    expect(entry("Taurus").pt).toContain("quando irritado, tornar-se violento");
    expect(entry("Taurus").en).toContain("when irritated, become violent");
    expect(entry("Taurus").keywords.pt).toContain("violência quando irritado");
    expect(entry("Taurus").keywords.en).toContain("violence when irritated");
  });

  it("keeps Gemini intimacy tension, required routines and hurt-conditioned coldness distinct", () => {
    expect(entry("Gemini").pt).toMatch(/desejo de proximidade, mas também sentir-se ameaçado pela intimidade; pode ter dificuldade com rotinas obrigatórias, passar por mudanças bruscas e, quando magoado, tornar-se frio e indiferente/);
    expect(entry("Gemini").en).toMatch(/need for closeness, yet also feel threatened by intimacy; you may have difficulty with required routines, undergo abrupt changes, and, when hurt, become cold and indifferent/);
    expect(copy("Gemini")).not.toMatch(/dupla personalidade|split personality/);
  });

  it("retains Leo's slighted antecedent and many qualifier and Virgo's defensive criticism limits", () => {
    expect(entry("Leo").pt).toMatch(/quando se sente menosprezado ou relegado, pode tornar-se mordaz e sarcástico.*para muitos, o drama/);
    expect(entry("Leo").en).toMatch(/when you feel slighted or pushed aside, you may become cutting and sarcastic.*for many, drama/);
    expect(entry("Virgo").pt).toMatch(/quando inseguro, recorrer à crítica; essa crítica pode funcionar como defesa, embora você raramente seja mesquinho ou ofensivo/);
    expect(entry("Virgo").en).toMatch(/when insecure, turn to criticism; this criticism can function as a defense, though you are rarely petty or offensive/);
  });

  it("separates Libra appearance-for-outcomes from charm-in-tension without a companionship motive", () => {
    expect(entry("Libra").pt).toContain("adaptar-se e esconder seus desejos; pode usar a aparência para conseguir o que quer e, em situações tensas, recorrer à simpatia em vez da diplomacia");
    expect(entry("Libra").en).toContain("adapt yourself and hide your desires; you may use your appearance to get what you want and, in tense situations, turn to charm instead of diplomacy");
    expect(copy("Libra")).not.toMatch(/manter alguém|keep someone|charm and appearance|simpatia e aparência/);
  });

  it("attributes Capricorn shyness to elegance, pain to facade, and overload through line 214", () => {
    expect(entry("Capricorn").pt).toMatch(/elegância que oculta timidez e uma fachada protetora que esconde suas dores.*responsabilidades a ponto de se sobrecarregar/);
    expect(entry("Capricorn").en).toMatch(/elegance that conceals shyness and a protective facade that hides your pain.*responsibilities to the point of overburdening yourself/);
    expect(entry("Capricorn").src[0]).toMatchObject({ from: 207, to: 214 });
    expect(copy("Capricorn")).not.toMatch(/hiding shyness.*facade|insecurity behind|insegurança atrás/);
  });

  it("conditions Aquarius rebellion on conformity and keeps Pisces outside diagnosis", () => {
    expect(entry("Aquarius").pt).toMatch(/se tenta se amoldar para ser como os outros, pode se rebelar em momentos cruciais/);
    expect(entry("Aquarius").en).toMatch(/if you try to conform to be like others, you may rebel at crucial moments/);
    expect(entry("Pisces").pt).toMatch(/pode idealizar.*dificuldade com confrontos.*endeusar quem confirma seu ponto de vista.*distinguir situações criadas na mente da realidade dos fatos/);
    expect(entry("Pisces").en).toMatch(/may idealize.*struggle with confrontations.*idolize those who confirm your point of view.*distinguishing situations created in your mind from the reality of the facts/);
    expect(copy("Pisces")).not.toMatch(/maníaco|manic|bipolar|depress|disorder|transtorno|diagnos/);
    expect(entry("Pisces").reviewNotes.join(" ")).toContain("clinical label, which is unadopted");
  });
});
