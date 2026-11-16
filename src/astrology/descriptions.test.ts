import { describe, expect, it } from "vitest";
import type { Sign } from "./dignity";
import {
  ASTROLOGY_DESCRIPTIONS,
  getPlanetSignDescription,
  getPlanetSignDescriptionEntry,
  type DescriptionPlanet,
} from "./descriptions";

const signs = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const satisfies readonly Sign[];

// Audited 2026-11-16 source snapshot from astrology-inventory-sources.json.
// One-based inclusive teaching ends; the next line starts private NOTAS.
// Keep the fixture here so regular tests require neither AKASH nor research files.
const teachingEnds = [
  441, 747, 161, 782, 603, 934, 602, 1561, 1521, 1833, 2999, 1557,
  1769, 1609, 1599, 798, 5271, 468, 1065, 6948, 290, 882, 29,
];
const sourceBounds = new Map<string, number>(teachingEnds.map((end, n) => [
  `modulo 4/aula ${n} modulo 4/aula-${n}.md`, end,
]));
sourceBounds.set("books/astrologia-hermetica/astrologia-hermetica.md", 123692);

function expectDeepFrozen(value: unknown): void {
  if (value !== null && typeof value === "object") {
    expect(Object.isFrozen(value)).toBe(true);
    for (const child of Object.values(value)) expectDeepFrozen(child);
  }
}

describe.each(["sun", "moon", "mercury"] as const)("%s in signs descriptions", (planet) => {
  it("contains all twelve canonical signs", () => {
    expect(Object.keys(ASTROLOGY_DESCRIPTIONS.planetSigns[planet]!).sort()).toEqual([...signs].sort());
    for (const sign of signs) {
      const entry = getPlanetSignDescriptionEntry(planet, sign)!;
      expect(entry).toBe(ASTROLOGY_DESCRIPTIONS.planetSigns[planet]![sign]);
      expect(entry.en.trim().length).toBeGreaterThan(0);
      expect(entry.pt.trim().length).toBeGreaterThan(0);
      expect(entry.en).not.toBe(entry.pt);
    }
  });

  it("defaults to English and selects Portuguese only by the pt prefix", () => {
    for (const sign of signs) {
      const entry = getPlanetSignDescriptionEntry(planet, sign)!;
      for (const language of [undefined, "en", "en-US", "es", "", "PT-BR"]) {
        expect(getPlanetSignDescription(planet, sign, language)).toBe(entry.en);
      }
      for (const language of ["pt", "pt-BR", "pt-PT"]) {
        expect(getPlanetSignDescription(planet, sign, language)).toBe(entry.pt);
      }
    }
  });

  it("returns undefined for unsupported, misspelled, and inherited keys without fallback", () => {
    const ordinaryPlanets: readonly DescriptionPlanet[] = [
      "sun", "moon", "mercury", "venus", "mars",
      "jupiter", "saturn", "uranus", "neptune", "pluto",
    ];
    const absentPlanet = ordinaryPlanets.find(key =>
      !Object.prototype.hasOwnProperty.call(ASTROLOGY_DESCRIPTIONS.planetSigns, key),
    );
    // Once every set is authored, only the invalid-key checks below apply.
    if (absentPlanet !== undefined) {
      for (const sign of signs) {
        expect(getPlanetSignDescriptionEntry(absentPlanet, sign)).toBeUndefined();
        expect(getPlanetSignDescription(absentPlanet, sign)).toBeUndefined();
        expect(getPlanetSignDescription(absentPlanet, sign, "pt")).toBeUndefined();
      }
    }
    const invalidKeys = ["Sun", "Moon", "aries", "Unknown", "", "__proto__", "constructor", "toString", "hasOwnProperty", "valueOf"];
    for (const key of invalidKeys) {
      // Runtime callers can supply strings outside the TypeScript contract.
      const invalidPlanet = key as DescriptionPlanet;
      const sign = key as Sign;
      expect(getPlanetSignDescriptionEntry(invalidPlanet, "Aries")).toBeUndefined();
      expect(getPlanetSignDescriptionEntry(planet, sign)).toBeUndefined();
      for (const language of [undefined, "en", "pt-BR"]) {
        expect(getPlanetSignDescription(invalidPlanet, "Aries", language)).toBeUndefined();
        expect(getPlanetSignDescription(planet, sign, language)).toBeUndefined();
      }
    }
  });

  it("deeply freezes shared entries, keyword arrays, review notes, and source records", () => {
    expectDeepFrozen(ASTROLOGY_DESCRIPTIONS);
    const entry = getPlanetSignDescriptionEntry(planet, "Aries")!;
    const original = entry.en;
    expect(Reflect.set(ASTROLOGY_DESCRIPTIONS, "planetSigns", {})).toBe(false);
    expect(Reflect.set(ASTROLOGY_DESCRIPTIONS.planetSigns, planet, {})).toBe(false);
    expect(Reflect.set(ASTROLOGY_DESCRIPTIONS.planetSigns[planet]!, "Aries", {})).toBe(false);
    expect(Reflect.set(entry, "en", "changed")).toBe(false);
    expect(Reflect.set(entry.keywords, "pt", [])).toBe(false);
    expect(Reflect.set(entry.keywords.pt, "0", "changed")).toBe(false);
    expect(Reflect.set(entry.keywords.en, "0", "changed")).toBe(false);
    expect(Reflect.set(entry.reviewNotes, "0", "changed")).toBe(false);
    expect(Reflect.set(entry.src, "0", {})).toBe(false);
    expect(Reflect.set(entry.src[0], "from", 0)).toBe(false);
    expect(getPlanetSignDescription(planet, "Aries")).toBe(original);
  });

  it("provides nonempty paired bilingual keywords and string review notes", () => {
    for (const sign of signs) {
      const entry = getPlanetSignDescriptionEntry(planet, sign)!;
      expect(entry.keywords.pt.length).toBeGreaterThan(0);
      expect(entry.keywords.en).toHaveLength(entry.keywords.pt.length);
      for (const keyword of [...entry.keywords.pt, ...entry.keywords.en]) {
        expect(typeof keyword).toBe("string");
        expect(keyword.trim().length).toBeGreaterThan(0);
      }
      expect(Array.isArray(entry.reviewNotes)).toBe(true);
      for (const note of entry.reviewNotes) {
        expect(typeof note).toBe("string");
        expect(note.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("cites integer inclusive bounds in audited course-relative sources before NOTAS", () => {
    for (const sign of signs) {
      const entry = getPlanetSignDescriptionEntry(planet, sign)!;
      expect(entry.src.length).toBeGreaterThan(0);
      for (const source of entry.src) {
        expect(typeof source.file).toBe("string");
        expect(source.file.startsWith("/")).toBe(false);
        expect(source.file).not.toMatch(/\\|(^|\/)\.\.?($|\/)|NOTAS/i);
        const end = sourceBounds.get(source.file);
        expect(end, `Unaudited source: ${source.file}`).toBeDefined();
        expect(Number.isSafeInteger(source.from)).toBe(true);
        expect(Number.isSafeInteger(source.to)).toBe(true);
        expect(source.from).toBeGreaterThanOrEqual(1);
        expect(source.to).toBeGreaterThanOrEqual(source.from);
        expect(source.to).toBeLessThanOrEqual(end!);
      }
    }
  });
});

describe("Sun content regressions", () => {
  it("preserves Virgo's heightened self-assertion and increased egocentrism", () => {
    const entry = getPlanetSignDescriptionEntry("sun", "Virgo")!;
    expect(entry.pt).toContain("necessidade acentuada de se afirmar");
    expect(entry.pt).toContain("essa afirmação pode aumentar o egocentrismo");
    expect(entry.en).toContain("heightened need to assert yourself");
    expect(entry.en).toContain("that self-assertion can increase self-centeredness");
  });

  it("preserves Aquarius's heightened self-concern with the Sun in detriment", () => {
    const entry = getPlanetSignDescriptionEntry("sun", "Aquarius")!;
    expect(entry.pt).toContain("Sol em exílio acentua a preocupação consigo");
    expect(entry.en).toContain("Sun in detriment heightens self-concern");
  });

  it("preserves Pisces's reflection before impulse and discipline", () => {
    const entry = getPlanetSignDescriptionEntry("sun", "Pisces")!;
    expect(entry.pt).toContain("refletir antes de seguir o primeiro impulso");
    expect(entry.pt).toContain("trazendo disciplina e equilíbrio à sensibilidade");
    expect(entry.en).toContain("reflect before following the first impulse");
    expect(entry.en).toContain("bringing discipline and balance to sensitivity");
  });

  it("uses no em dash in Sun descriptions or metadata", () => {
    expect(JSON.stringify(ASTROLOGY_DESCRIPTIONS.planetSigns.sun)).not.toContain("\u2014");
  });

});

describe("Moon content regressions", () => {
  it.each([
    ["Aries", ["entusiasmo sincero", "inteligência aguda, que pode ser instável", "temperamento pode ser inconstante", "aceitar conselhos ou disciplina"], ["sincere enthusiasm", "sharp mind that can be unsteady", "temperament may be changeable", "accepting advice or discipline"]],
    ["Taurus", ["contrabalança a impulsividade", "pode conviver com possessividade"], ["counterbalances impulsiveness", "can coexist with possessiveness"]],
    ["Gemini", ["fazer várias coisas e trocar ideias", "se faltar estabilidade nas outras áreas do mapa"], ["doing several things and exchanging ideas", "if other areas of the chart lack stability"]],
    ["Cancer", ["cuidar e proteger", "você pode superestimar a autoridade"], ["care and protect", "you may overestimate authority"]],
    ["Leo", ["afeição generosa e lealdade", "virar autoritarismo", "quando a Lua recebe aspectos difíceis"], ["generous affection and loyalty", "turn into authoritarianism", "when the Moon receives difficult aspects"]],
    ["Virgo", ["inteligência prática e analítica", "preocupação acentuada", "falta de autoconfiança"], ["practical, analytical intelligence", "pronounced worry", "lack of confidence"]],
    ["Libra", ["dividir a responsabilidade pelas decisões", "a determinação pode faltar", "quando a Lua recebe aspectos difíceis"], ["share responsibility for decisions", "determination may be lacking", "when the Moon receives difficult aspects"]],
    ["Scorpio", ["introversão às vezes encobre", "quando a Lua recebe aspectos difíceis", "ressentimento, possessividade"], ["introversion sometimes conceals", "when the Moon receives difficult aspects", "resentment, possessiveness"]],
    ["Sagittarius", ["otimismo", "senso de urgência", "às vezes, imprudência"], ["optimism", "sense of urgency", "at times, recklessness"]],
    ["Capricorn", ["dedicação persistente", "reserva e cautela podem chegar ao excesso", "às vezes também apareça ostentação"], ["persistent dedication", "reserve and caution can become excessive", "ostentation can sometimes appear"]],
    ["Aquarius", ["afabilidade, bondade e espírito inventivo", "imprevisibilidade e distanciamento emocional"], ["friendliness, kindness and an inventive spirit", "unpredictability and emotional distance"]],
    ["Pisces", ["possível talento artístico", "possa faltar expressão coerente", "quando a Lua recebe aspectos difíceis"], ["possible artistic talent", "coherent expression may be lacking", "when the Moon receives difficult aspects"]],
  ] as const)("preserves %s strengths, tensions and qualifications in both languages", (sign, pt, en) => {
    const entry = getPlanetSignDescriptionEntry("moon", sign)!;
    for (const phrase of pt) expect(entry.pt).toContain(phrase);
    for (const phrase of en) expect(entry.en).toContain(phrase);
  });

  it("keeps direct lowercase bilingual copy, paired keywords and no em dash", () => {
    for (const sign of signs) {
      const entry = getPlanetSignDescriptionEntry("moon", sign)!;
      expect(entry.pt).toMatch(/^você /);
      expect(entry.en).toMatch(/^you /);
      for (const text of [entry.pt, entry.en]) {
        const sentences = text.match(/[^.!?]+[.!?]/g)!;
        expect(sentences).toHaveLength(2);
        expect(sentences.join("")).toBe(text);
        for (const sentence of sentences) expect(sentence.trim()).toMatch(/^[a-zà-ú]/u);
      }
      expect(JSON.stringify(entry)).not.toContain("\u2014");
    }
  });

  it("uses only inspected Moon passages and retains per-sign review notes", () => {
    for (const sign of signs) {
      const entry = getPlanetSignDescriptionEntry("moon", sign)!;
      expect(entry.reviewNotes.length).toBeGreaterThan(0);
      expect(entry.src.some(source => source.file === "modulo 4/aula 18 modulo 4/aula-18.md")).toBe(true);
      for (const source of entry.src) {
        if (source.file === "modulo 4/aula 18 modulo 4/aula-18.md") {
          expect(source.from).toBeGreaterThanOrEqual(4);
          expect(source.to).toBeLessThanOrEqual(108);
        } else {
          expect(sign).toBe("Gemini");
          expect(source).toEqual({
            file: "books/astrologia-hermetica/astrologia-hermetica.md",
            from: 28528,
            to: 28537,
          });
        }
      }
    }
  });
});


describe("Mercury source distinctions", () => {
  it("keeps slow experiential thought in Taurus without uncited book embellishments", () => {
    const e = getPlanetSignDescriptionEntry("mercury", "Taurus")!;
    expect(e.pt).toContain("pensar devagar");
    expect(e.pt).toContain("experiência do que na inteligência");
    expect(e.en).toContain("experience than on intelligence");
    expect(e.src).toEqual([{ file: "modulo 4/aula 12 modulo 4/aula-12.md", from: 9, to: 9 }]);
    expect(e.keywords.pt).not.toContain("método");
  });

  it("retains course tensions for Libra, Sagittarius and Aquarius in both languages", () => {
    for (const [sign, pt, en] of [
      ["Libra", "falta tato", "tact is lacking"],
      ["Sagittarius", "falta de ideias próprias", "lack of ideas of your own"],
      ["Aquarius", "tendência à desonestidade", "tendency toward dishonesty"],
    ] as const) {
      const e = getPlanetSignDescriptionEntry("mercury", sign)!;
      expect(e.pt).toContain(pt);
      expect(e.en).toContain(en);
      expect(e.reviewNotes.length).toBeGreaterThan(0);
    }
  });

  it("keeps Pisces confused thought, possible brilliant ideas and lying without diagnostic prose", () => {
    const e = getPlanetSignDescriptionEntry("mercury", "Pisces")!;
    expect(e.pt).toContain("uma mente confusa, que pode chegar a ideias geniais");
    expect(e.en).toContain("a confused mind that can produce brilliant ideas");
    expect(e.pt).toContain("tendência à mentira");
    expect(e.en).toContain("tendency toward lying");
    expect(e.pt + e.en).not.toMatch(/loucura|madness|insanity/);
  });

  it("cites only the audited narrow Mercury course passages and uses direct bilingual copy", () => {
    for (const sign of signs) {
      const e = getPlanetSignDescriptionEntry("mercury", sign)!;
      expect(e.pt).toMatch(/^você |^seu /);
      expect(e.en).toMatch(/^you |^your /);
      expect(JSON.stringify(e)).not.toContain("\u2014");
      for (const source of e.src) {
        expect(source.file).toBe("modulo 4/aula 12 modulo 4/aula-12.md");
        expect(source.from).toBeGreaterThanOrEqual(7);
        expect(source.to).toBeLessThanOrEqual(29);
      }
    }
  });
});
