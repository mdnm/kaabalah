import { describe, expect, it } from "vitest";
import { getPointHouseDescriptionEntry } from "./descriptions";

const entry = (house: number) => getPointHouseDescriptionEntry("parsFortunae", house)!;

describe("Fortune house source functions and boundaries", () => {

  it("keeps two lowercase direct-address sentences without imperative or guaranteed biography", () => {
    for (let house = 1; house <= 12; house++) {
      const row = entry(house);
      expect(row.pt).toMatch(/você|sua|seu/);
      expect(row.en).toMatch(/you|your/);
      for (const text of [row.pt, row.en]) {
        const sentences = text.match(/[^.!?]+[.!?]/gu)!;
        expect(sentences).toHaveLength(2);
        expect(sentences.join("")).toBe(text);
        for (const sentence of sentences) expect(sentence.trim()).toMatch(/^\p{Ll}/u);
        expect(text).not.toMatch(/—|garant|guarantee|sempre|always|você deve|you should|pratique|practice|ritual|ilimitad|unlimited|\bwill\b|\bage\b|\banos\b/iu);
      }
    }
  });

  it("keeps house 9 field and learning distinct under Mat's explicit decision", () => {
    const row = entry(9);
    expect(row.pt).toMatch(/realização se associa.*viagens, filosofia e religião\. viver e trabalhar no cotidiano.*sem esperar recompensas.*temas de aprendizado/);
    expect(row.en).toMatch(/fulfillment is associated.*travel, philosophy, and religion\. everyday life and work.*without expecting rewards.*learning themes/);
    expect(`${row.pt} ${row.en}`).not.toMatch(/balanc|equilíbr|unremunerated|unpaid|sem remuneração|sem salário/iu);
  });

  it("retains corrected qualifications rather than sign manners or source-advice traits", () => {
    expect(entry(1).pt).toMatch(/temas de aprendizado/);
    expect(entry(3).en).toMatch(/rather than material things.*learning theme/);
    expect(entry(4).pt).toMatch(/princípios sólidos.*possível frustração/);
    expect(`${entry(4).pt} ${entry(4).en}`).not.toMatch(/objetivos sólidos|firm objectives/);
    expect(entry(5).en).toMatch(/children, where relevant/);
    expect(`${entry(5).pt} ${entry(5).en}`).not.toMatch(/doação|giving of oneself|come true/);
    expect(entry(6).en).toMatch(/work, health.*daily actions.*moving farther from it may appear as a tension/);
    expect(entry(6).en).not.toMatch(/feeling farther|healthy|cure/);
    expect(`${entry(7).pt} ${entry(7).en}`).not.toMatch(/aceitação|acceptance|harmonia|harmony/iu);
    expect(`${entry(8).pt} ${entry(8).en}`).not.toMatch(/morte|death/iu);
    expect(entry(10).en).toMatch(/may seek acceptance.*professional direction/);
    expect(entry(11).en).toMatch(/may feel restless.*may occupy/);
    expect(`${entry(11).pt} ${entry(11).en}`).not.toMatch(/restriç|restriction|unlimited/iu);
    expect(entry(12).en).toMatch(/^periods of solitude may.*dreams and images.*may also help.*people who depend on you/);
    expect(entry(12).en).not.toMatch(/retreat|intuition|faith/iu);
    expect(entry(12).keywords.en).toContain("solitude");
    // House 10's split OCR citations exclude the Capricorn manner lines.
  });
});
