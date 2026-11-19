import { describe, expect, it } from "vitest";
import { getSectDescriptionEntry } from "./descriptions";
const diurnal = getSectDescriptionEntry("diurnal")!;
const nocturnal = getSectDescriptionEntry("nocturnal")!;
describe("sect horizon definitions and contextual luminaries", () => {
  it("defines both sects by Sun horizon position and keeps luminaries in profection context", () => {
    expect(diurnal.pt).toMatch(/diurno quando o Sol está acima do horizonte\. nas profecções, o Sol é o luminar/);
    expect(diurnal.en).toMatch(/diurnal when the Sun is above the horizon\. in profections, the Sun is the sect light/);
    expect(nocturnal.pt).toMatch(/noturno quando o Sol está abaixo do horizonte\. nas profecções, a Lua é o luminar/);
    expect(nocturnal.en).toMatch(/nocturnal when the Sun is below the horizon\. in profections, the Moon is the sect light/);
    expect(diurnal.keywords.en).toEqual(["Sun above the horizon", "diurnal sect light"]);
    expect(nocturnal.keywords.en).toEqual(["Sun below the horizon", "nocturnal sect light"]);
  });
  it("keeps two lowercase chart-owner sentences without personality, house rules or timing commands", () => {
    for (const entry of [diurnal, nocturnal]) {
      expect(entry.pt).toMatch(/^no seu mapa/);
      expect(entry.en).toMatch(/^in your chart/);
      for (const text of [entry.pt, entry.en]) {
        const sentences = text.match(/[^.!?]+[.!?]/gu)!;
        expect(sentences).toHaveLength(2);
        expect(sentences.join("")).toBe(text);
        for (const sentence of sentences) expect(sentence.trim()).toMatch(/^\p{Ll}/u);
        expect(text).not.toMatch(/—|\d|house|casa|personality|personalidade|dignity|dignidade|você deve|you should|pratique|practice|ritual|projet|project|exact|exat|garant|guarantee/iu);
      }
    }
  });
});
