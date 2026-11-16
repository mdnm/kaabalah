import { describe, expect, it } from "vitest";
import { getPlanetDescriptionEntry, type DescriptionPlanet } from "./descriptions";

const entry = (planet: DescriptionPlanet) => getPlanetDescriptionEntry(planet)!;
const copy = (planet: DescriptionPlanet) => `${entry(planet).pt} ${entry(planet).en}`;
const book = "books/astrologia-hermetica/astrologia-hermetica.md";
const a1 = "modulo 4/aula 1 modulo 4/aula-1.md";

describe("basic planet function source distinctions", () => {
  it("keeps direct chart functions in two lowercase sentences without source notices or sign blends", () => {
    const planets: DescriptionPlanet[] = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];
    for (const planet of planets) {
      expect(entry(planet).pt).toMatch(/^no seu mapa/);
      expect(entry(planet).en).toMatch(/^in your chart/);
      for (const text of [entry(planet).pt, entry(planet).en]) {
        const sentences = text.match(/[^.!?]+[.!?]/gu)!;
        expect(sentences).toHaveLength(2);
        expect(sentences.join("")).toBe(text);
        for (const sentence of sentences) expect(sentence.trim()).toMatch(/^\p{Ll}/u);
        expect(text).not.toMatch(/—|no livro|the book|o curso|the course|Sagitário|Sagittarius|Áries|Aries|Escorpião|Scorpio|diagnos/);
      }
      expect(entry(planet).src.some(source => source.file.includes("aula 13"))).toBe(false);
    }
  });

  it("retains the Sun qualification against guaranteed success and honors", () => {
    expect(entry("sun").pt).toContain("sem garantir êxito ou honras");
    expect(entry("sun").en).toContain("without guaranteeing success or honors");
    expect(entry("sun").src).toContainEqual({ file: "modulo 4/aula 3 modulo 4/aula-3.md", from: 272, to: 285 });
  });

  it("ties Moon imagination and receptivity to class and security to the named-Moon book body", () => {
    expect(entry("moon").pt).toMatch(/imaginação, assimilação, sensibilidade, autoimagem e receptividade.*proteção e segurança emocional/);
    expect(entry("moon").en).toMatch(/imagination, assimilation, sensitivity, self-image, and receptivity.*protection and emotional security/);
    expect(entry("moon").src).toEqual([
      { file: "modulo 4/aula 8 modulo 4/aula-8.md", from: 789, to: 795 },
      { file: book, from: 17294, to: 17298 },
    ]);
  });

  it("keeps Mercury mind as instrument of Sun-Moon polarity rather than experience processing", () => {
    expect(entry("mercury").pt).toMatch(/mente como instrumento.*polaridade entre Sol e Lua.*raciocina, analisa informações e expressa ideias/);
    expect(entry("mercury").en).toMatch(/mind as an instrument.*polarity between the Sun and Moon.*reason, analyze information, and express ideas/);
    expect(copy("mercury")).not.toMatch(/process.*experi|experi.*process/);
  });

  it("labels Venus, Mars and Jupiter glyph metaphysics explicitly as symbols, separate from functions", () => {
    for (const planet of ["venus", "mars", "jupiter"] as const) {
      expect(entry(planet).pt.split(". ")[1]).toMatch(/^seu símbolo expressa/);
      expect(entry(planet).en.split(". ")[1]).toMatch(/^its symbol expresses/);
    }
    expect(entry("venus").src).toContainEqual({ file: a1, from: 182, to: 183 });
    expect(entry("mars").src).toContainEqual({ file: a1, from: 187, to: 188 });
    expect(entry("jupiter").src).toContainEqual({ file: a1, from: 189, to: 190 });
    expect(entry("venus").pt).toContain("seus afetos, sua busca por prazer e conforto e o que você valoriza");
    expect(entry("venus").keywords.pt).toContain("beleza");
    expect(entry("venus").keywords.en).toContain("beauty");
    expect(entry("mars").pt).toContain("matéria em desequilíbrio sobre o espírito");
    expect(entry("jupiter").pt).toContain("alma em equilíbrio com a matéria");
  });

  it("keeps Mars generic determination and narrow interleaved conflict citations without violence predictions", () => {
    expect(entry("mars").pt).toContain("dirige sua determinação e enfrenta competição e conflito");
    expect(entry("mars").en).toContain("direct your determination, and face competition and conflict");
    expect(entry("mars").src.filter(source => source.file === book)).toEqual([
      { file: book, from: 18257, to: 18274 },
      { file: book, from: 18308, to: 18316 },
      { file: book, from: 18327, to: 18334 },
    ]);
    expect(copy("mars")).not.toMatch(/violên|violen|guerras|wars/);
    expect(entry("jupiter").src.filter(source => source.file === book)).toEqual([
      { file: book, from: 18568, to: 18593 }, { file: book, from: 18629, to: 18648 },
    ]);
    expect(copy("jupiter")).not.toMatch(/filosofia|philosophy|aventura|adventure|sorte|luck|prosper/);
  });

  it("keeps the four outer functions distinct with body-supported book ranges and local possibility", () => {
    expect(entry("saturn").pt).toMatch(/disciplina, responsabilidade, estrutura e ordem.*amadurecimento emocional e espiritual.*realidade e as limitações/);
    expect(entry("saturn").src).toEqual([{ file: book, from: 18963, to: 18980 }]);
    expect(entry("uranus").pt).toMatch(/inovação, criatividade e originalidade.*pode indicar uma tendência sua ao desapego emocional e à impessoalidade/);
    expect(entry("uranus").en).toContain("may also indicate a tendency in you toward emotional detachment");
    expect(entry("uranus").src).toEqual([{ file: book, from: 19370, to: 19385 }]);
    expect(entry("neptune").pt).toMatch(/busca por uma conexão espiritual mais profunda.*pode vivenciar desilusões e confusões/);
    expect(entry("neptune").en).toContain("may experience disillusionment and confusion");
    expect(entry("neptune").src).toEqual([{ file: book, from: 19733, to: 19744 }]);
    expect(entry("pluto").pt).toMatch(/transformações profundas.*aspectos sombrios.*poder, controle e dominação/);
    expect(entry("pluto").en).toContain("its function also involves themes of power, control and domination");
    expect(entry("pluto").src).toEqual([{ file: book, from: 20029, to: 20034 }, { file: book, from: 20042, to: 20049 }]);
    for (const planet of ["saturn", "uranus", "neptune", "pluto"] as const) {
      expect(entry(planet).src.every(source => source.file === book)).toBe(true);
      expect(entry(planet).reviewNotes.join(" ")).toContain("kundalini");
    }
  });
});
