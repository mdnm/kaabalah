import { describe, expect, it } from "vitest";
import { ASTROLOGY_DESCRIPTIONS, getPointSignDescriptionEntry } from "./descriptions";
import type { Sign } from "./dignity";

const entry = (sign: Sign) => getPointSignDescriptionEntry("parsFortunae", sign)!;
const ranges: Record<Sign, number[][]> = {
  Aries: [[2777, 2778], [2838, 2841]],
  Taurus: [[2780, 2781], [2847, 2847], [2851, 2854]],
  Gemini: [[2783, 2784], [2857, 2857], [2860, 2864]],
  Cancer: [[2786, 2787]],
  Leo: [[2789, 2791], [2888, 2892]],
  Virgo: [[2793, 2795], [2902, 2907]],
  Libra: [[2797, 2799], [2919, 2923]],
  Scorpio: [[2801, 2804], [2933, 2937]],
  Sagittarius: [[2806, 2809], [2948, 2951]],
  Capricorn: [[2811, 2814], [2962, 2962], [2965, 2965], [2967, 2967]],
  Aquarius: [[2816, 2818], [2977, 2982]],
  Pisces: [[2820, 2821], [2994, 2998]],
};

describe("Fortune sign source boundaries and qualifications", () => {
  it("uses only reviewed prose and unambiguous sign-manner clauses inside teaching bounds", () => {
    expect(Object.keys(ASTROLOGY_DESCRIPTIONS.pointSigns!.parsFortunae!)).toEqual(Object.keys(ranges));
    for (const sign of Object.keys(ranges) as Sign[]) {
      expect(entry(sign).src).toEqual(ranges[sign].map(([from, to]) => ({ file: "modulo 4/aula 10 modulo 4/aula-10.md", from, to })));
      for (const source of entry(sign).src) {
        expect(Number.isSafeInteger(source.from)).toBe(true);
        expect(Number.isSafeInteger(source.to)).toBe(true);
        expect(source.from).toBeGreaterThanOrEqual(2775);
        expect(source.to).toBeGreaterThanOrEqual(source.from);
        expect(source.to).toBeLessThanOrEqual(2999);
      }
    }
    expect(entry("Capricorn").reviewNotes.join(" ")).toContain("2962, 2965, and 2967");
    expect(entry("Capricorn").reviewNotes.join(" ")).not.toContain("2960");
  });

  it("keeps two lowercase direct-address sentences and avoids outcomes or instructions", () => {
    for (const sign of Object.keys(ranges) as Sign[]) {
      const row = entry(sign);
      expect(row.pt).toMatch(/você|sua/);
      expect(row.en).toMatch(/you|your/);
      for (const text of [row.pt, row.en]) {
        const sentences = text.match(/[^.!?]+[.!?]/gu)!;
        expect(sentences).toHaveLength(2);
        expect(sentences.join("")).toBe(text);
        for (const sentence of sentences) expect(sentence.trim()).toMatch(/^\p{Ll}/u);
        expect(text).not.toMatch(/—|garant|guarantee|sempre|always|saúde|health|doença|disease|você deve|you should|pratique|practice|nível evolutivo|evolutionary level/iu);
      }
    }
  });

  it("retains the reviewed modes and cautions rather than transferring house fields", () => {
    expect(entry("Taurus").pt).toMatch(/sólidas e duradouras.*renovação e crescimento/);
    expect(entry("Virgo").pt).toMatch(/pode procurar manter-se conscientemente ocupado/);
    expect(entry("Virgo").en).toMatch(/may seek to stay consciously engaged/);
    expect(`${entry("Virgo").pt} ${entry("Virgo").en}`).not.toMatch(/emprego|employment|steadiness/iu);
    expect(entry("Libra").pt).toMatch(/aceitação social pode afastar.*decisões próprias.*necessidade/);
    expect(entry("Sagittarius").en).toMatch(/may flow more easily.*informal and straightforward/);
    expect(entry("Capricorn").pt).toMatch(/você pode.*podem marcar/);
    expect(`${entry("Capricorn").pt} ${entry("Capricorn").en}`).not.toMatch(/juventude|youth|carreira|career/iu);
    expect(entry("Aquarius").en).toMatch(/can renew/);
    expect(`${entry("Aquarius").pt} ${entry("Aquarius").en}`).not.toMatch(/resolver|resolve|friends|amigos/iu);
    const pisces = entry("Pisces");
    expect(pisces.en).toMatch(/may find joy.*can guide/);
    expect(`${pisces.pt} ${pisces.en} ${JSON.stringify(pisces.keywords)}`).not.toMatch(/sonho|dream|image|imagem|isolamento|isolation/iu);
    expect(pisces.keywords.en).toEqual(["commitment", "consciousness", "intuition", "faith", "inner vision"]);
    expect(entry("Scorpio").pt).toMatch(/pode encontrar satisfação/);
    expect(`${entry("Scorpio").pt} ${entry("Scorpio").en}`).not.toMatch(/morte|death/iu);
  });
});
