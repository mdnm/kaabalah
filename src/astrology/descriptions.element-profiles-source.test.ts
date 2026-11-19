import { describe, expect, it } from "vitest";
import { getElementDescriptionEntry } from "./descriptions";
import type { TriplicityElement } from "./dignity";

const elements: TriplicityElement[] = ["fire", "earth", "air", "water"];
const entry = (element: TriplicityElement) => getElementDescriptionEntry(element)!;
const copy = (element: TriplicityElement) => `${entry(element).pt} ${entry(element).en}`;

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

  it("adopts only the resolved temperament labels, without the traits that depend on the historical alternatives", () => {
    const labels = {
      fire: ["sanguíneo", "sanguine"],
      earth: ["colérico", "choleric"],
      air: ["fleumático", "phlegmatic"],
      water: ["melancólico", "melancholic"],
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
