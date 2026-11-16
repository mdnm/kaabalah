import { describe, expect, it } from "vitest";
import { getAngleSignDescriptionEntry } from "./descriptions";
import type { Sign } from "./dignity";

const entry = (sign: Sign) => getAngleSignDescriptionEntry("ic", sign)!;
const copy = (sign: Sign) => `${entry(sign).pt} ${entry(sign).en}`;
const a9 = "modulo 4/aula 9 modulo 4/aula-9.md";
const a10 = "modulo 4/aula 10 modulo 4/aula-10.md";

describe("IC sign direct paragraphs and source qualifiers", () => {
  it("uses adopted IC paragraphs or explicit body bridges with concise direct-address copy", () => {
    const ranges: Record<Sign, number[][]> = {
      Aries: [[1124, 1129]], Taurus: [[732, 737]], Gemini: [[394, 400]],
      Cancer: [[71, 75], [93, 94]], Leo: [[1209, 1211], [1216, 1217]],
      Virgo: [[400, 403]], Libra: [[740, 743]],
      Scorpio: [[1841, 1845], [1852, 1857], [1888, 1889]],
      Sagittarius: [[1530, 1533]], Capricorn: [[163, 166]], Aquarius: [[656, 658]], Pisces: [[1216, 1218]],
    };
    for (const sign of Object.keys(ranges) as Sign[]) {
      const file = sign === "Leo" ? "modulo 4/aula 8 modulo 4/aula-8.md"
        : ["Scorpio", "Capricorn", "Aquarius", "Pisces"].includes(sign) ? a10 : a9;
      expect(entry(sign).src).toEqual(ranges[sign].map(([from, to]) => ({ file, from, to })));
      expect(entry(sign).pt).toMatch(/você|seu|sua/);
      expect(entry(sign).en).toMatch(/\byou\b|\byour\b/);
      for (const text of [entry(sign).pt, entry(sign).en]) {
        const sentences = text.match(/[^.!?]+[.!?]/gu)!;
        expect(sentences).toHaveLength(2);
        expect(sentences.join("")).toBe(text);
        for (const sentence of sentences) expect(sentence.trim()).toMatch(/^\p{Ll}/u);
        expect(text).not.toMatch(/—|cúspide|cusp|a fonte|the source|o curso|the course|diagnos/);
      }
    }
  });

  it("retains Aries exploration relationship and Taurus certainty before change", () => {
    expect(entry("Aries").pt).toMatch(/quanto mais explora seu interior, mais pode encontrar reservas de energia e criatividade/);
    expect(entry("Aries").en).toMatch(/the more you explore inwardly, the more you may find reserves of energy and creativity/);
    expect(entry("Taurus").pt).toMatch(/resistir a romper ou mudar situações até sentir uma certeza interna/);
    expect(entry("Taurus").en).toMatch(/resist breaking with or changing situations until you feel an inner certainty/);
  });

  it("keeps Gemini risk and positive persistence without editorial notices", () => {
    expect(entry("Gemini").pt).toMatch(/risco de se perder.*fragmentadas e contraditórias.*persistir em ordenar e compreender.*troca de ideias/);
    expect(entry("Gemini").en).toMatch(/risk losing yourself.*fragmented and contradictory.*persist in ordering and understanding.*exchange ideas/);
    expect(copy("Gemini")).not.toMatch(/positive branch|ramo positivo|source|fonte/);
  });

  it("ends Virgo before the cusp-only work-base and family-health material", () => {
    expect(entry("Virgo").pt).toMatch(/autocrítico.*aprimorar a si mesmo.*casa que funcione com eficiência/);
    expect(entry("Virgo").en).toMatch(/self-critical.*improve yourself.*house that functions efficiently/);
    expect(copy("Virgo")).not.toMatch(/base de trabalho|work base|health|saúde/);
    expect(entry("Virgo").reviewNotes.join(" ")).toMatch(/403.*404/);
  });

  it("preserves Leo sometimes-root-search and Cancer feelings not always shown", () => {
    expect(entry("Leo").pt).toContain("às vezes, isso prolonga a procura por um lugar para criar raízes");
    expect(entry("Leo").en).toContain("sometimes, this extends the search for a place to put down roots");
    expect(copy("Leo")).not.toMatch(/segunda metade|second half|idade madura|mature age/);
    expect(entry("Cancer").pt).toContain("mesmo sem demonstrar seus sentimentos com facilidade");
    expect(entry("Cancer").en).toContain("even if you do not easily show your feelings");
  });

  it("uses Scorpio closing IC identity and retains defense and vulnerability antecedents", () => {
    expect(entry("Scorpio").src).toContainEqual({ file: a10, from: 1888, to: 1889 });
    expect(entry("Scorpio").reviewNotes.join(" ")).toMatch(/1839.*incorrectly.*MC/);
    expect(entry("Scorpio").pt).toMatch(/como defesa contra emoções não resolvidas.*quando se sente mais vulnerável em casa, pode manipular e controlar/);
    expect(entry("Scorpio").en).toMatch(/as a defense against unresolved emotions.*when you feel more vulnerable at home, you may manipulate and control/);
    expect(copy("Scorpio")).not.toMatch(/infância|childhood|trauma|diagnos|regenera/);
  });

  it("retains Sagittarius standstill and Capricorn external-search uncertainty", () => {
    expect(entry("Sagittarius").pt).toMatch(/se sua vida chega a um ponto morto, você pode se renovar/);
    expect(entry("Sagittarius").en).toMatch(/if your life reaches a standstill, you may renew yourself/);
    expect(entry("Capricorn").pt).toContain("buscar essas bases fora de si pode ser incerto e decepcionante");
    expect(entry("Capricorn").en).toContain("seeking these foundations outside yourself may prove uncertain and disappointing");
  });

  it("preserves Aquarius possible participation and Pisces probably-best foundation", () => {
    expect(entry("Aquarius").pt).toContain("em algum momento da vida, você pode querer participar");
    expect(entry("Aquarius").en).toContain("at some point in life, you may want to take part");
    expect(entry("Pisces").pt).toContain("essa busca provavelmente é seu melhor alicerce para construir a vida");
    expect(entry("Pisces").en).toContain("this search is probably your best foundation for building your life");
    expect(copy("Pisces")).not.toMatch(/família|family|cura|healing|sacrif/);
  });
});
