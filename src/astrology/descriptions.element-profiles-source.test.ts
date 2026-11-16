import { describe, expect, it } from "vitest";
import { getElementDescriptionEntry } from "./descriptions";
import type { TriplicityElement } from "./dignity";

const elements: TriplicityElement[] = ["fire", "earth", "air", "water"];
const entry = (element: TriplicityElement) => getElementDescriptionEntry(element)!;
const copy = (element: TriplicityElement) => `${entry(element).pt} ${entry(element).en}`;
const a2 = "modulo 4/aula 2 modulo 4/aula-2.md";
const a3 = "modulo 4/aula 3 modulo 4/aula-3.md";
const a8 = "modulo 4/aula 8 modulo 4/aula-8.md";

describe("generic element independent-source distinctions", () => {
  it("states symbolic hot/cold and dry/moist qualities for all four elements", () => {
    const qualities = {
      fire: [/simbolicamente, o fogo é quente e seco/, /symbolic qualities are hot and dry/],
      earth: [/simbolicamente, a terra é fria e seca/, /symbolic qualities are cold and dry/],
      air: [/em termos simbólicos, o ar é quente e úmido/, /symbolically, air is hot and moist/],
      water: [/em termos simbólicos, a água é fria e úmida/, /symbolically, water is cold and moist/],
    };
    for (const element of elements) {
      expect(entry(element).pt).toMatch(qualities[element][0]);
      expect(entry(element).en).toMatch(qualities[element][1]);
    }
  });

  it("keeps adopted independent clauses within the narrowed physical source ranges", () => {
    const ranges = {
      fire: [[a2, 134, 137], [a3, 70, 72], [a8, 811, 811]],
      earth: [[a2, 140, 143], [a3, 70, 73], [a8, 803, 804]],
      air: [[a2, 148, 149], [a3, 74, 74], [a8, 808, 808]],
      water: [[a2, 154, 155], [a3, 75, 75], [a8, 805, 807]],
    };
    for (const element of elements) {
      expect(entry(element).src).toEqual(ranges[element].map(([file, from, to]) => ({ file, from, to })));
    }
  });

  it("retains distinct independent roles and symbolic matter/energy without physiological claims", () => {
    expect(entry("fire").pt).toMatch(/iniciativa, à ambição.*vivas, demonstrativas e combativas.*impulso para começar/);
    expect(entry("earth").pt).toMatch(/reações lentas e duradouras, prudência, método e ordem.*concreto e ao material.*estabilidade/);
    expect(entry("air").pt).toMatch(/inteligência e às faculdades mentais.*rapidez de reação.*flexibilidade e à adaptação/);
    expect(entry("air").keywords.en).toContain("communication");
    expect(entry("water").pt).toMatch(/disposição impressionável.*reações lentas.*natureza imaginativa.*energia fluídica.*controle das emoções/);
    expect(entry("water").en).toContain("fluid energy and an emphasis on emotional control");
    for (const element of elements) {
      expect(copy(element)).not.toMatch(/sangue|blood|termômetro|thermometer|temperatura corporal|body temperature|cura|healing|diagnos/);
    }
  });

  it("leaves disputed humors and their dependent traits pending instead of silently reassigning them", () => {
    for (const element of elements) {
      const e = entry(element);
      const authored = [copy(element), ...e.keywords.pt, ...e.keywords.en].join(" ");
      expect(authored).not.toMatch(/bilios|bílis|bile|coléric|choleric|nervoso|nervous|sanguín|sanguine|fleum|phlegm|linf|lymph|melanc|melanch|temperamento|temperament/);
      expect(authored).not.toMatch(/espiritualidade|spirituality|honras|honors|tenacidade|tenacity|laborios|industrious|campestres|country tastes|amizade|friendship|concórdia|concord|equidade|equity|inconstância|inconstancy|dissimulação|dissimulation/);
      expect(e.reviewNotes.join(" ")).toMatch(/pending|aguarda/);
    }
  });

  it("keeps two lowercase chart-owner sentences without Ascendant fortune or Han-phase profiles", () => {
    for (const element of elements) {
      expect(entry(element).pt).toMatch(/^no seu mapa/);
      expect(entry(element).en).toMatch(/^in your chart/);
      for (const text of [entry(element).pt, entry(element).en]) {
        const sentences = text.match(/[^.!?]+[.!?]/gu)!;
        expect(sentences).toHaveLength(2);
        expect(sentences.join("")).toBe(text);
        for (const sentence of sentences) expect(sentence.trim()).toMatch(/^\p{Ll}/u);
        expect(text).not.toMatch(/—|Ascendente|Ascendant|fortuna|fortune|luck|sorte|Han|Chinese|chinês|madeira|wood|metal|o curso|the course/);
      }
    }
  });
});
