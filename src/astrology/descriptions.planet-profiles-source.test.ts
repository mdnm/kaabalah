import { describe, expect, it } from "vitest";
import { getPlanetDescriptionEntry, type DescriptionPlanet } from "./descriptions";

const entry = (planet: DescriptionPlanet) => getPlanetDescriptionEntry(planet)!;
const copy = (planet: DescriptionPlanet) => `${entry(planet).pt} ${entry(planet).en}`;

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
    }
  });

  it("retains the Sun qualification against guaranteed success and honors", () => {
    expect(entry("sun").pt).toContain("sem garantir êxito ou honras");
    expect(entry("sun").en).toContain("without guaranteeing success or honors");
  });

  it("ties Moon imagination and receptivity to class and security to the named-Moon book body", () => {
    expect(entry("moon").pt).toMatch(/imaginação, assimilação, sensibilidade, autoimagem e receptividade.*proteção e segurança emocional/);
    expect(entry("moon").en).toMatch(/imagination, assimilation, sensitivity, self-image, and receptivity.*protection and emotional security/);
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
    expect(entry("venus").pt).toContain("seus afetos, sua busca por prazer e conforto e o que você valoriza");
    expect(entry("venus").keywords.pt).toContain("beleza");
    expect(entry("venus").keywords.en).toContain("beauty");
    expect(entry("mars").pt).toContain("matéria em desequilíbrio sobre o espírito");
    expect(entry("jupiter").pt).toContain("alma em equilíbrio com a matéria");
  });

  it("keeps Mars generic determination and narrow interleaved conflict citations without violence predictions", () => {
    expect(entry("mars").pt).toContain("dirige sua determinação e enfrenta competição e conflito");
    expect(entry("mars").en).toContain("direct your determination, and face competition and conflict");
    expect(copy("mars")).not.toMatch(/violên|violen|guerras|wars/);
    expect(copy("jupiter")).not.toMatch(/filosofia|philosophy|aventura|adventure|sorte|luck|prosper/);
  });

  it("keeps the four outer functions distinct with body-supported book ranges and local possibility", () => {
    expect(entry("saturn").pt).toMatch(/disciplina, responsabilidade, estrutura e ordem.*amadurecimento emocional e espiritual.*realidade e as limitações/);
    expect(entry("uranus").pt).toMatch(/inovação, criatividade e originalidade.*pode indicar uma tendência sua ao desapego emocional e à impessoalidade/);
    expect(entry("uranus").en).toContain("may also indicate a tendency in you toward emotional detachment");
    expect(entry("neptune").pt).toMatch(/busca por uma conexão espiritual mais profunda.*pode vivenciar desilusões e confusões/);
    expect(entry("neptune").en).toContain("may experience disillusionment and confusion");
    expect(entry("pluto").pt).toMatch(/transformações profundas.*aspectos sombrios.*poder, controle e dominação/);
    expect(entry("pluto").en).toContain("its function also involves themes of power, control and domination");
  });
});
