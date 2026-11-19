import { describe, expect, it } from "vitest";
import { getAngleDescriptionEntry, type DescriptionAngle } from "./descriptions";

const entry = (angle: DescriptionAngle) => getAngleDescriptionEntry(angle)!;
const angles: DescriptionAngle[] = ["ascendant", "mc", "dc", "ic"];
const copy = (angle: DescriptionAngle) => `${entry(angle).pt} ${entry(angle).en}`;

describe("general angle primary meanings and boundaries", () => {

  it("separates presented face from the other's relational role", () => {
    expect(entry("ascendant").pt).toMatch(/face que você apresenta ao mundo.*características que mostra.*primeiro contato.*vê neles/);
    expect(entry("ascendant").en).toMatch(/face you present to the world.*qualities you show.*first contact.*see in them/);
    expect(entry("dc").pt).toMatch(/outro em relação ao eu.*busca nas outras pessoas.*parcerias de trabalho, conjugalidade e amizade/);
    expect(entry("dc").en).toMatch(/other in relation to the self.*seek in other people.*business partnerships, marriage, and friendship/);
  });

  it("keeps MC public aims distinct from IC roots and inward subjects", () => {
    expect(entry("mc").pt).toMatch(/vocações, aspirações e ambições.*rumo.*vida social, reputação, profissão, posição social e imagem pública/);
    expect(entry("mc").en).toMatch(/vocations, aspirations, and ambitions.*direction.*social life, reputation, profession, social standing, and public image/);
    expect(entry("ic").pt).toMatch(/origens, raízes e sua vida interior.*lar e à infância/);
    expect(entry("ic").en).toMatch(/origins, roots, and inner self.*home and childhood/);
    for (const angle of angles) {
      expect(copy(angle)).not.toMatch(/zênite|zenith|cúspide|cusp|Casa \d|house \d|pai|mãe|father|mother|morte|death|resting place|garant|guarantee/);
    }
  });

  it("keeps two lowercase chart-owner sentences without source notices or imported correspondences", () => {
    for (const angle of angles) {
      expect(entry(angle).pt).toMatch(/^no seu mapa/);
      expect(entry(angle).en).toMatch(/^in your chart/);
      for (const text of [entry(angle).pt, entry(angle).en]) {
        const sentences = text.match(/[^.!?]+[.!?]/gu)!;
        expect(sentences).toHaveLength(2);
        expect(sentences.join("")).toBe(text);
        for (const sentence of sentences) expect(sentence.trim()).toMatch(/^\p{Ll}/u);
        expect(text).not.toMatch(/—|o curso|the course|o livro|the book|Áries|Aries|Capricórnio|Capricorn|diagnos|espada|sword/);
      }
    }
  });
});
