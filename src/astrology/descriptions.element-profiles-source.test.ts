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
      fire: [/simbolicamente, o fogo é quente e seco/, /symbolically, fire is hot and dry/],
      earth: [/simbolicamente, a terra é fria e seca/, /symbolically, earth is cold and dry/],
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
      fire: [[a2, 134, 137], [a3, 70, 72], [a8, 811, 811], [a8, 813, 813]],
      earth: [[a2, 140, 143], [a3, 70, 73], [a8, 803, 804]],
      air: [[a2, 148, 149], [a3, 74, 74], [a8, 808, 809]],
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

  it("adopts only Mat's resolved A8 labels and retains historical alternatives without their dependent traits", () => {
    const labels = {
      fire: ["sanguíneo", "sanguine"],
      earth: ["colérico", "choleric"],
      air: ["fleumático", "phlegmatic"],
      water: ["melancólico", "melancholic"],
    };
    const historical = {
      fire: /A2:137 calls fire bilious and A3:65 irritable/,
      earth: /A2:144 and A3:66 call earth nervous/,
      air: /A2:150 and A3:67 call air sanguine/,
      water: /A2:156 calls water phlegmatic and A3:68 lymphatic/,
    };
    for (const element of elements) {
      const e = entry(element);
      const [pt, en] = labels[element];
      expect(e.pt).toContain(`temperamento ${pt}`);
      expect(e.en).toContain(`${en} temperament`);
      expect(e.keywords.pt.at(-1)).toBe(pt);
      expect(e.keywords.en.at(-1)).toBe(en);
      const authored = [copy(element), ...e.keywords.pt, ...e.keywords.en].join(" ");
      expect(authored).not.toMatch(/bilios|bílis|bile|nervoso|nervous|linf|lymph|muco|mucus|blood|sangue|humor|humour|body temperature|temperatura corporal|diagnos/iu);
      expect(authored).not.toMatch(/espiritualidade|spirituality|entusiasmo|enthusiasm|honras|honors|tenacidade|tenacity|laborios|industrious|campestres|country tastes|amizade|friendship|concórdia|concord|equidade|equity|inconstância|inconstancy|dissimulação|dissimulation|pleasure-seeking/iu);
      const notes = e.reviewNotes.join(" ");
      expect(notes).toMatch(historical[element]);
      expect(notes).toContain("Mat selected A8 labels on2026-11-16");
      expect(notes).not.toMatch(/pending|aguarda/);
      expect(notes).toMatch(/not transferred/);
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
