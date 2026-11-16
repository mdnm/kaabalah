import { describe, expect, it } from "vitest";
import { getAngleSignDescriptionEntry } from "./descriptions";
import type { Sign } from "./dignity";

const entry = (sign: Sign) => getAngleSignDescriptionEntry("mc", sign)!;
const copy = (sign: Sign) => `${entry(sign).pt} ${entry(sign).en}`;
const a9 = "modulo 4/aula 9 modulo 4/aula-9.md";
const a10 = "modulo 4/aula 10 modulo 4/aula-10.md";
const book = "books/astrologia-hermetica/astrologia-hermetica.md";

describe("MC sign source bridges and qualifications", () => {
  it("keeps two lowercase direct-address sentences without cusp aliases or source notices", () => {
    const signs: Sign[] = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    for (const sign of signs) {
      expect(entry(sign).pt).toMatch(/você|seu|sua/);
      expect(entry(sign).en).toMatch(/\byou\b|\byour\b/);
      for (const text of [entry(sign).pt, entry(sign).en]) {
        const sentences = text.match(/[^.!?]+[.!?]/gu)!;
        expect(sentences).toHaveLength(2);
        expect(sentences.join("")).toBe(text);
        for (const sentence of sentences) expect(sentence.trim()).toMatch(/^\p{Ll}/u);
        expect(text).not.toMatch(/—|cúspide|cusp|o curso|the course|a fonte|the source|diagnos/);
      }
    }
  });

  it("retains Aries Mars-house qualifier and Taurus determination only after starting a career", () => {
    expect(entry("Aries").pt).toContain("a casa de Marte detalha outras qualidades que você mostra ao público");
    expect(entry("Aries").en).toContain("the house occupied by Mars details other qualities you show publicly");
    expect(entry("Aries").src).toContainEqual({ file: a9, from: 1311, to: 1312 });
    expect(copy("Aries")).not.toMatch(/iniciativa|initiative|autonomia|autonomy|leadership|liderança/);
    expect(entry("Taurus").pt).toContain("depois de começar uma carreira");
    expect(entry("Taurus").en).toContain("after beginning a career");
  });

  it("uses Gemini standalone book MC body through 66845 without the class cusp-only career count", () => {
    expect(entry("Gemini").src).toEqual([{ file: book, from: 66825, to: 66845 }]);
    expect(entry("Gemini").pt).toMatch(/ambiente dinâmico.*variedade.*comunicação, troca de ideias e versatilidade/);
    expect(entry("Gemini").en).toMatch(/dynamic environment.*variety.*communication, exchange of ideas, and versatility/);
    expect(entry("Gemini").reviewNotes.join(" ")).toContain("66837");
    expect(copy("Gemini")).not.toMatch(/mais de uma carreira|more than one career|multiple careers/);
  });

  it("keeps Virgo precision separate from omitted maternal and Mercury-aspect statements", () => {
    expect(entry("Virgo").src).toContainEqual({ file: a9, from: 540, to: 540 });
    expect(entry("Virgo").src).toContainEqual({ file: book, from: 66874, to: 66878 });
    expect(entry("Virgo").pt).toMatch(/precisão e exatidão.*metódica.*serviço e eficiência/);
    expect(copy("Virgo")).not.toMatch(/mãe|mother|Mercúrio|Mercury|aspect/);
  });

  it("retains Libra cooperation and possible future help without promising support", () => {
    expect(entry("Libra").pt).toMatch(/trabalhar melhor em parceria ou somando esforços.*possa exigir.*poderão ajudar/);
    expect(entry("Libra").en).toMatch(/work better in partnership or by joining efforts.*may demand.*could help/);
    expect(entry("Libra").keywords.en.join(" ")).not.toContain("service contribution");
    expect(entry("Libra").reviewNotes.join(" ")).toContain("not adopted in prose or keywords");
    expect(entry("Libra").src).toEqual([{ file: a9, from: 909, to: 915 }]);
  });

  it("keeps Scorpio independent career passage and some-case limits outside negative projection", () => {
    expect(entry("Scorpio").src).toEqual([{ file: a10, from: 2283, to: 2289 }, { file: a10, from: 2302, to: 2302 }]);
    expect(entry("Scorpio").pt).toMatch(/em alguns casos.*perda ou abandono.*algumas pessoas podem/);
    expect(entry("Scorpio").en).toMatch(/in some cases.*lost or abandoned.*some people may/);
    expect(copy("Scorpio")).not.toMatch(/mãe|mother|projeção|projection|perigoso|dangerous/);
    expect(entry("Scorpio").reviewNotes.join(" ")).toMatch(/2256-2267.*2268/);
  });

  it("keeps Sagittarius working-better scope and Capricorn judgment without aspect-conditioned success", () => {
    expect(entry("Sagittarius").pt).toContain("podendo trabalhar melhor com autoridade e espaço para agir");
    expect(entry("Sagittarius").en).toContain("may work better with authority and room to act");
    expect(copy("Sagittarius")).not.toMatch(/prefer/);
    expect(entry("Sagittarius").keywords.pt).toContain("trabalhar melhor com autoridade e espaço para agir");
    expect(entry("Sagittarius").keywords.en).toContain("working better with authority and room to act");
    expect(entry("Sagittarius").keywords.en.join(" ")).not.toContain("autonomy");
    expect(entry("Sagittarius").src).toContainEqual({ file: a9, from: 1760, to: 1761 });
    expect(entry("Capricorn").pt).toContain("julgar quem vive fora de valores sociais estritos");
    expect(entry("Capricorn").en).toContain("judge those who live outside strict social values");
    expect(entry("Capricorn").src).toContainEqual({ file: a10, from: 407, to: 409 });
    expect(copy("Capricorn")).not.toMatch(/sucesso|success|atrasos|delays|aspect/);
  });

  it("uses Aquarius standalone work-many paragraph and discloses Pisces header-only bridge", () => {
    expect(entry("Aquarius").src).toEqual([{ file: a10, from: 896, to: 898 }]);
    expect(entry("Aquarius").pt).toMatch(/beneficie o maior número possível de pessoas.*inventividade e idealismo/);
    expect(entry("Aquarius").en).toMatch(/benefits as many people as possible.*inventiveness and idealism/);
    expect(entry("Pisces").src).toEqual([{ file: a10, from: 1527, to: 1527 }, { file: a10, from: 1545, to: 1546 }]);
    expect(entry("Pisces").pt).toMatch(/pode sentir incerteza.*pode ficar insatisfeito.*não seja inteiramente envolvente e inspirador/);
    expect(entry("Pisces").en).toMatch(/may feel uncertain.*may also feel dissatisfied.*not fully absorbing and inspiring/);
    expect(entry("Pisces").reviewNotes.join(" ")).toContain("header-only source bridge");
    expect(copy("Pisces")).not.toMatch(/redenção|redemption|sacrif|salva|cura|healing|mother|mãe/);
  });
});
