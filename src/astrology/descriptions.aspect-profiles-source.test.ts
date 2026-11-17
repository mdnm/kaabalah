import { describe, expect, it } from "vitest";
import { getAspectDescriptionEntry, type DescriptionAspect } from "./descriptions";

const entry = (aspect: DescriptionAspect) => getAspectDescriptionEntry(aspect)!;
const a11 = "modulo 4/aula 11 modulo 4/aula-11.md";
const a13 = "modulo 4/aula 13 modulo 4/aula-13.md";
const aspects: DescriptionAspect[] = ["conjunction", "duodecile", "octile", "sextile", "square", "trine", "trioctile", "quincunx", "opposition"];

describe("general natal aspect source qualifications", () => {
  it("uses the source display terms while keeping canonical query keys", () => {
    const names = [["duodecile", "o", "semissextil", "semisextile"], ["octile", "a", "semiquadratura", "semisquare"], ["trioctile", "a", "sesquiquadratura", "sesquisquare"]] as const;
    for (const [key, article, pt, en] of names) {
      expect(entry(key).pt).toContain(`${article} ${pt} `);
      expect(entry(key).en).toContain(`the ${en} `);
      expect(getAspectDescriptionEntry(en as DescriptionAspect)).toBeUndefined();
      expect(getAspectDescriptionEntry(pt as DescriptionAspect)).toBeUndefined();
    }
  });

  it("keeps compatibility, orb, release and planet-dependent qualifications attached", () => {
    expect(entry("conjunction").pt).toMatch(/depende da compatibilidade.*aproximação estreita uma pode se sobrepor/);
    expect(entry("conjunction").en).toMatch(/depends on their compatibility.*close orb one may overshadow/);
    expect(entry("sextile").pt).toContain("pode trazer tensão se a energia envolvida não for liberada");
    expect(entry("sextile").en).toContain("bring tension if the energy involved is not released");
    expect(entry("square").pt).toContain("dependendo dos planetas envolvidos");
    expect(entry("square").en).toContain("depending on the planets involved");
    expect(entry("square").src).toEqual([{ file: a11, from: 200, to: 206 }, { file: a11, from: 209, to: 210 }]);
    expect(entry("sextile").src).toEqual([{ file: a11, from: 161, to: 164 }, { file: a13, from: 928, to: 930 }, { file: a13, from: 938, to: 939 }, { file: a13, from: 942, to: 943 }]);
  });

  it("retains trine ease/effort limit and Mat's resolved opposition tension instead of harmony", () => {
    expect(entry("trine").pt).toMatch(/menos empenho.*conforme o tema, menor valorização/);
    expect(entry("trine").en).toMatch(/less exertion.*depending on the subject, less appreciation/);
    expect(entry("opposition").pt).toContain("tensão entre dois polos");
    expect(entry("opposition").en).toContain("tension between two poles");
    expect(entry("opposition").pt).not.toContain("harmonia");
    expect(entry("opposition").en).not.toContain("harmony");
    expect(entry("opposition").reviewNotes.join(" ")).toContain("Mat's clarification");
    expect(entry("opposition").src).toContainEqual({ file: a13, from: 1566, to: 1566 });
  });

  it("keeps duodecile desire/convergence and octile action within limits without predicted opportunities", () => {
    expect(entry("duodecile").pt).toContain("desejo de recomeçar e de concentrar novas possibilidades");
    expect(entry("duodecile").en).toContain("desire to start again and to bring new possibilities together");
    expect(entry("duodecile").en).not.toMatch(/opportunity|guaranteed growth/);
    expect(entry("duodecile").src).toContainEqual({ file: a13, from: 625, to: 631 });
    expect(entry("octile").pt).toMatch(/ação diante de resistência.*dinâmica ativa dentro de limites/);
    expect(entry("octile").en).toMatch(/action in the face of resistance.*active dynamics within limits/);
  });

  it("keeps trioctile natal mental effort and quincunx tentative philosophical bridge", () => {
    expect(entry("trioctile").en).toContain("effort to work through difficulties mentally");
    expect(entry("trioctile").src).toEqual([{ file: a13, from: 1376, to: 1376 }, { file: a13, from: 1394, to: 1396 }]);
    expect(entry("trioctile").reviewNotes.join(" ")).toContain("more prominent in progressions than natal");
    expect(entry("quincunx").pt).toContain("simbolicamente, ele pode representar uma força mediadora entre opostos");
    expect(entry("quincunx").en).toContain("symbolically, it may represent a mediating force between opposites");
    expect(entry("quincunx").src).toContainEqual({ file: a13, from: 1452, to: 1454 });
    expect(entry("quincunx").reviewNotes.join(" ")).toContain("tentatively");
  });

  it("records naming/math conflicts without transferring erroneous fractional claims into prose", () => {
    expect(entry("duodecile").reviewNotes.join(" ")).toMatch(/1549.*1550.*discrepancy/);
    expect(entry("trioctile").reviewNotes.join(" ")).toMatch(/1377-1388.*fractional-arithmetic errors/);
    for (const aspect of ["duodecile", "octile", "trioctile", "quincunx"] as const) {
      expect(`${entry(aspect).pt} ${entry(aspect).en}`).not.toMatch(/\d|degree|graus|fração|fraction/);
    }
  });

  it("keeps two lowercase chart-owner sentences without clinical, timing or specialist-grid claims", () => {
    for (const aspect of aspects) {
      expect(entry(aspect).pt).toMatch(/^no seu mapa/);
      expect(entry(aspect).en).toMatch(/^in your chart/);
      for (const text of [entry(aspect).pt, entry(aspect).en]) {
        const sentences = text.match(/[^.!?]+[.!?]/gu)!;
        expect(sentences).toHaveLength(2);
        expect(sentences.join("")).toBe(text);
        for (const sentence of sentences) expect(sentence.trim()).toMatch(/^\p{Ll}/u);
        expect(text).not.toMatch(/—|o curso|the course|o livro|the book|diagnos|doença|disease|cura|healing|future event|evento futuro|synastry|sinastria/);
      }
    }
  });
});
