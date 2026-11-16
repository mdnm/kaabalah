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

const ordinaryPlanets: readonly DescriptionPlanet[] = [
  "sun", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto",
];
const authoredPlanets = ordinaryPlanets.filter(key =>
  Object.prototype.hasOwnProperty.call(ASTROLOGY_DESCRIPTIONS.planetSigns, key),
);

it("allows only canonical planet keys in the authored data", () => {
  expect(Object.keys(ASTROLOGY_DESCRIPTIONS.planetSigns).sort()).toEqual([...authoredPlanets].sort());
  expect(authoredPlanets.length).toBeGreaterThan(0);
});

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

describe.each(authoredPlanets)("%s in signs descriptions", (planet) => {
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

  it("contains no em dash in authored descriptions or metadata", () => {
    expect(JSON.stringify(ASTROLOGY_DESCRIPTIONS.planetSigns[planet])).not.toContain("\u2014");
  });

  it("keeps source and editorial notices out of product prose", () => {
    for (const sign of signs) {
      const entry = getPlanetSignDescriptionEntry(planet, sign)!;
      for (const text of [entry.pt, entry.en]) {
        expect(text).not.toMatch(/o curso|the course|o livro|the book|foi omitido|was omitted|não entram na descrição|not included in the description/i);
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

describe("Pluto source distinctions", () => {
  const entry = (sign: Sign) => getPlanetSignDescriptionEntry("pluto", sign)!;
  const product = (sign: Sign) => {
    const r = entry(sign);
    return JSON.stringify({ pt: r.pt, en: r.en, keywords: r.keywords });
  };
  const bounds: Record<Sign, readonly [number, number]> = {
    Aries: [190, 191], Taurus: [192, 193], Gemini: [194, 195], Cancer: [196, 198],
    Leo: [199, 201], Virgo: [202, 204], Libra: [205, 207], Scorpio: [208, 209],
    Sagittarius: [210, 212], Capricorn: [213, 215], Aquarius: [216, 218], Pisces: [220, 222],
  };

  it("completes all ten authored sets and 120 canonical entries", () => {
    expect(authoredPlanets).toEqual(ordinaryPlanets);
    expect(authoredPlanets.flatMap(planet => Object.keys(ASTROLOGY_DESCRIPTIONS.planetSigns[planet]!))).toHaveLength(120);
  });

  it("adopts exactly the primary inclusive ranges with no book claims", () => {
    for (const sign of signs) {
      const [from, to] = bounds[sign];
      expect(entry(sign).src).toEqual([{ file: "modulo 4/aula 12 modulo 4/aula-12.md", from, to }]);
    }
  });

  it("keeps paired direct address and exactly two lowercase-start sentences", () => {
    for (const sign of signs) {
      const r = entry(sign);
      expect(r.pt).toMatch(/^você /);
      expect(r.en).toMatch(/^you /);
      for (const text of [r.pt, r.en]) {
        const sentences = text.match(/[^.!?]+[.!?]/gu)!;
        expect(sentences).toHaveLength(2);
        expect(sentences.join("")).toBe(text);
        for (const sentence of sentences) expect(sentence.trim()).toMatch(/^\p{Ll}/u);
      }
    }
  });

  it("lists Aries human forces independently and Taurus sexuality/economy symbolically", () => {
    expect(entry("Aries").pt).toMatch(/instintos poderosos e criatividade\. em outro tema simbólico coletivo.*forças destrutivas do ser humano/);
    expect(entry("Aries").en).toMatch(/powerful instincts and creativity\. in a separate collective symbolic theme.*destructive human forces/);
    expect(entry("Aries").keywords.pt).toContain("liberação das forças destrutivas do ser humano");
    expect(entry("Aries").reviewNotes.join(" ")).toContain("no causal link");
    expect(entry("Taurus").pt).toMatch(/simbolismo coletivo de destruição do já criado e sexualidade atormentada.*mesmo plano simbólico.*período de estabilidade comercial e prosperidade econômica/);
    expect(entry("Taurus").en).toMatch(/collective symbolism of destruction.*troubled sexuality.*same symbolic level.*period of commercial stability and economic prosperity/);
    expect(entry("Taurus").reviewNotes.join(" ")).toContain("not inferred actual sexual experience");
  });

  it("preserves collective culture, family changes, demographic shifts and a critical generation", () => {
    expect(entry("Gemini").pt).toMatch(/chave simbólica coletiva.*difusão cultural.*poderosos meios de transporte.*propagação dos vícios/);
    expect(entry("Gemini").en).toMatch(/collective symbolic level.*cultural diffusion.*powerful new means of transport.*spread of vices/);
    expect(entry("Cancer").pt).toMatch(/chave simbólica coletiva.*mudanças radicais na estrutura familiar/);
    expect(entry("Cancer").en).toMatch(/collective symbolic level.*radical changes in family structures/);
    expect(entry("Leo").pt).toMatch(/simbolismo geracional.*sofrimento intenso.*hábitos sexuais.*curvas demográficas/);
    expect(entry("Leo").en).toMatch(/generational symbolism.*intense suffering.*sexual habits.*demographic curves/);
    expect(entry("Leo").reviewNotes.join(" ")).toMatch(/Audáciosidade.*audácia.*clear linguistic paraphrase/);
    expect(entry("Virgo").pt).toMatch(/autocrítica implacável.*dificuldades criativas.*cansaço mental.*nova geração.*espírito crítico agudo/);
    expect(entry("Virgo").en).toMatch(/relentless self-criticism.*creative difficulties.*mental fatigue.*new generation.*sharp critical spirit/);
  });

  it("retains diplomatic resolution and health/population themes only as collective symbols", () => {
    expect(entry("Libra").pt).toMatch(/simbolismo coletivo.*crises internacionais resolvidas por meios diplomáticos/);
    expect(entry("Libra").en).toMatch(/collective symbolism.*international crises resolved through diplomacy/);
    expect(entry("Scorpio").pt).toMatch(/simbolismo coletivo de fecundidade.*vitalidade.*progressos científicos.*grandes epidemias difíceis de combater/);
    expect(entry("Scorpio").en).toMatch(/collective symbolism of fertility.*vitality.*scientific advances.*major epidemics that are difficult to combat/);
    expect(entry("Scorpio").reviewNotes.join(" ")).toContain("No fertility assurance, diagnosis or forecast");
  });

  it("preserves clear C themes without reconstructing uncertain OCR", () => {
    expect(entry("Sagittarius").pt).toMatch(/simbolismo coletivo.*sublimação sexual e impasse.*histórico simbólico.*estabilidade política e grandes viagens/);
    expect(entry("Sagittarius").en).toMatch(/collective symbolism.*sexual sublimation and impasse.*symbolic historical level.*political stability and major journeys/);
    expect(entry("Capricorn").pt).toMatch(/simbolismo coletivo.*criatividade lenta.*rancor.*centralização do poder.*estabilidade internacional/);
    expect(entry("Capricorn").en).toMatch(/collective symbolism.*slow creativity.*resentment.*centralization of power.*international political and economic stability/);
    expect(product("Sagittarius")).not.toMatch(/estorço|gelo|esforço coletivo|collective effort|progresso da humanidade|progress of humanity/);
    expect(product("Capricorn")).not.toMatch(/vingara|vingança|revenge/);
    expect(entry("Sagittarius").reviewNotes.join(" ")).toMatch(/OCR incerto.*estorço coletivo gelo/);
    expect(entry("Capricorn").reviewNotes.join(" ")).toMatch(/OCR incerto.*vingara/);
    expect(entry("Aquarius").pt).toMatch(/simbolismo coletivo.*brutalidade e crueldade.*descobertas científicas importantes.*fraternidade/);
    expect(entry("Aquarius").en).toMatch(/collective symbolism.*brutality and cruelty.*important scientific discoveries.*fellowship/);
  });

  it("keeps Pisces first-sentence themes collective and catastrophes outside product fields", () => {
    expect(entry("Pisces").pt).toMatch(/^você compartilha o simbolismo coletivo de um instinto criativo obscuro, tendência a fundir-se no desconhecido, caos e turbulência sexual\./);
    expect(entry("Pisces").en).toMatch(/^you share the collective symbolism of an obscure creative instinct, a tendency to merge into the unknown, chaos and sexual turbulence\./);
    expect(entry("Pisces").pt).toMatch(/plano histórico simbólico.*novas religiões ou movimentos místicos/);
    expect(entry("Pisces").en).toMatch(/symbolic historical level.*new religions or mystical movements/);
    expect(product("Pisces")).not.toMatch(/faculdades psíquicas|psychic faculties|catástrofe|catastrophe|regenera/i);
    expect(product("Cancer")).not.toMatch(/catástrofe|catastrophe/i);
    expect(entry("Pisces").reviewNotes.join(" ")).toContain("no actual reader behavior or clinical/sexual identity");
    expect(entry("Cancer").reviewNotes.join(" ")).toMatch(/catastrophes.*omitted/);
    expect(entry("Pisces").reviewNotes.join(" ")).toMatch(/catástrofes.*omitido/);
    expect(entry("Pisces").keywords.pt).toContain("turbulência sexual");
    expect(entry("Pisces").keywords.en).toContain("sexual turbulence");
  });
});

describe("Neptune source distinctions", () => {
  const course = "modulo 4/aula 12 modulo 4/aula-12.md";
  const book = "books/astrologia-hermetica/astrologia-hermetica.md";
  const adopted: Record<Sign, readonly (readonly [string, number, number])[]> = {
    Aries: [[course, 166, 166], [book, 57058, 57061]],
    Taurus: [[course, 167, 167], [book, 57221, 57226]],
    Gemini: [[course, 168, 169]],
    Cancer: [[course, 170, 171]],
    Leo: [[course, 172, 173]],
    Virgo: [[course, 174, 175]],
    Libra: [[course, 176, 177]],
    Scorpio: [[course, 178, 179]],
    Sagittarius: [[course, 180, 181]],
    Capricorn: [[course, 182, 183]],
    Aquarius: [[course, 184, 185], [book, 59662, 59668]],
    Pisces: [[course, 186, 187]],
  };
  const entry = (sign: Sign) => getPlanetSignDescriptionEntry("neptune", sign)!;

  it("matches every adopted source range, including all three book additions", () => {
    for (const sign of signs) {
      expect(entry(sign).src).toEqual(adopted[sign].map(([file, from, to]) => ({ file, from, to })));
    }
  });

  it("keeps two lowercase-start sentences and direct bilingual address", () => {
    for (const sign of signs) {
      const record = entry(sign);
      expect(record.pt).toMatch(/^você /);
      expect(record.en).toMatch(/^you\b/);
      for (const text of [record.pt, record.en]) {
        const sentences = text.match(/[^.!?]+[.!?]/gu)!;
        expect(sentences).toHaveLength(2);
        expect(sentences.join("")).toBe(text);
        for (const sentence of sentences) {
          expect(sentence.trim()).toMatch(/^\p{Ll}/u);
        }
      }
    }
  });

  it("retains Aries belief idealism and both sides of Taurus material spirituality", () => {
    expect(entry("Aries").pt).toMatch(/forte idealismo e paixão por crenças e visões/);
    expect(entry("Aries").en).toMatch(/strong idealism and passion for beliefs and visions/);
    expect(entry("Taurus").pt).toMatch(/natureza e aos prazeres sensoriais/);
    expect(entry("Taurus").pt).toMatch(/confusão ou desilusão.*posse e ao materialismo/);
    expect(entry("Taurus").en).toMatch(/nature and sensory pleasures/);
    expect(entry("Taurus").en).toMatch(/confusion or disillusionment.*possession and materialism/);
    expect(entry("Gemini").pt).toMatch(/mas.*impertinência.*mexericos ao redor e falta de visão/);
    expect(entry("Gemini").en).toMatch(/but.*impertinence.*gossip around you and a lack of vision/);
  });

  it("keeps cultural, critical and drug themes explicitly collective", () => {
    expect(entry("Leo").pt).toMatch(/teatro e cinema.*nesse mesmo período.*corrupção ou degeneração.*tendência social simbólica/);
    expect(entry("Leo").en).toMatch(/theater and cinema.*in that same period.*corruption or degeneration.*symbolic social trend/);
    expect(entry("Virgo").pt).toMatch(/simbolismo geracional.*freados pela crítica.*teorias críticas/);
    expect(entry("Virgo").en).toMatch(/generational symbolism.*restrained by criticism.*critical theories/);
    expect(entry("Libra").pt).toMatch(/simbolismo geracional.*drogas como tema social/);
    expect(entry("Libra").en).toMatch(/generational symbolism.*drugs as a social theme/);
    expect(entry("Sagittarius").pt).toMatch(/horizonte simbólico.*plano coletivo.*auge dos esportes/);
    expect(entry("Sagittarius").en).toMatch(/symbolic horizon.*collective level.*flourishing of sports/);
  });

  it("preserves domination, previous-generation ownership and community disillusionment", () => {
    expect(entry("Scorpio").pt).toMatch(/simbolismo coletivo.*trapaças e crueldade.*justiça social.*domínio das massas/);
    expect(entry("Scorpio").en).toMatch(/collective symbolism.*deception and cruelty.*social justice.*mass domination/);
    expect(entry("Scorpio").en).not.toMatch(/influence/);
    expect(entry("Capricorn").pt).toMatch(/movimento geracional.*ideias desenvolvidas pela geração anterior/);
    expect(entry("Capricorn").en).toMatch(/generational movement.*ideas developed by the previous generation/);
    expect(entry("Aquarius").pt).toMatch(/movimentos coletivos de fraternidade universal.*plano social.*podem encontrar desilusão/);
    expect(entry("Aquarius").en).toMatch(/collective movements for universal fellowship.*social level.*may meet with disillusionment/);
  });

  it("retains Pisces difficult themes as historical symbolism with diagnostic boundaries in metadata", () => {
    expect(entry("Pisces").pt).toMatch(/plano histórico e coletivo.*temas simbólicos de neuroses de massa e difusão das drogas/);
    expect(entry("Pisces").en).toMatch(/historical and collective level.*symbolic themes of mass neurosis and the spread of drugs/);
    expect(entry("Pisces").reviewNotes.join(" ")).toMatch(/no clinical diagnosis of reader or cohort and no prediction of substance use/);
    expect(entry("Scorpio").reviewNotes.join(" ")).toMatch(/Neuroses sexuais e tendências necrófilas foram omitidas/);
    for (const sign of signs) {
      const record = entry(sign);
      expect(`${record.pt} ${record.en}`).not.toMatch(/problemas com a pele|skin problems|desastres no ar|air disasters|lucros|profits|neuroses sexuais|sexual neuroses|necrófil|necrophil/i);
    }
  });
});

describe("Uranus source distinctions", () => {
  const course = "modulo 4/aula 12 modulo 4/aula-12.md";
  const book = "books/astrologia-hermetica/astrologia-hermetica.md";
  const courseBounds = [[139, 140], [141, 142], [143, 144], [145, 146], [147, 148], [149, 150], [151, 152], [153, 155], [156, 157], [158, 159], [160, 161], [162, 163]] as const;
  const bookBounds: Partial<Record<(typeof signs)[number], readonly (readonly [number, number])[]>> = {
    Aries: [[52918, 52929]],
    Taurus: [[53133, 53139]],
    Gemini: [[53431, 53440]],
    Cancer: [[53756, 53759]],
    Sagittarius: [[54845, 54864], [54875, 54896]],
    Capricorn: [[55150, 55171]],
    Aquarius: [[55420, 55430]],
    Pisces: [[55619, 55623]],
  };

  it("uses canonical signs and exact audited course and adopted-book ranges", () => {
    const authored = ASTROLOGY_DESCRIPTIONS.planetSigns.uranus!;
    expect(Object.keys(authored)).toEqual([...signs]);
    signs.forEach((sign, index) => {
      const expected: { file: string; from: number; to: number }[] = [
        { file: course, from: courseBounds[index][0], to: courseBounds[index][1] },
      ];
      for (const [from, to] of bookBounds[sign] ?? []) expected.push({ file: book, from, to });
      expect(getPlanetSignDescriptionEntry("uranus", sign)!.src).toEqual(expected);
    });
  });

  it("keeps harsh source distinctions and excludes event, health, and identity assertions", () => {
    const aries = getPlanetSignDescriptionEntry("uranus", "Aries")!;
    expect(aries.pt).toContain("iniciativa");
    expect(aries.en).toContain("independence in expression and action");
    expect(aries.pt + aries.en).not.toMatch(/reviravolta|upheaval|perigo|danger|weapons|transporte/);
    const cancer = getPlanetSignDescriptionEntry("uranus", "Cancer")!;
    expect(cancer.pt).toContain("aptidão para arquitetura");
    expect(cancer.pt).toContain("assuntos familiares e domésticos");
    expect(cancer.pt + cancer.en).not.toMatch(/revoluções familiares|sair de casa|extremismo|nationalist|leave home/);
    const leo = getPlanetSignDescriptionEntry("uranus", "Leo")!;
    expect(leo.pt).toContain("especialmente no cinema");
    expect(leo.pt + leo.en).not.toMatch(/filhos excêntricos|eccentric children/);
    const virgo = getPlanetSignDescriptionEntry("uranus", "Virgo")!;
    expect(virgo.pt).toContain("extravagâncias no trabalho");
    expect(virgo.en).toContain("extravagant at work");
    expect(virgo.pt + virgo.en).not.toMatch(/hipocondria|hypochondria/);
    const libra = getPlanetSignDescriptionEntry("uranus", "Libra")!;
    expect(libra.pt).toContain("facilidade nas relações afetivas");
    expect(libra.pt).toContain("originalidade artística");
    expect(libra.pt + libra.en).not.toMatch(/casamento liberal|liberal romantic|separação|divórcio|divorce/);
    const scorpio = getPlanetSignDescriptionEntry("uranus", "Scorpio")!;
    expect(scorpio.pt).toContain("hábitos sexuais pouco convencionais");
    expect(scorpio.pt).toContain("espírito vingativo");
    expect(scorpio.pt + scorpio.en).not.toMatch(/homossexual|homosexual|orientation|orientação|determinação|determination/);
  });

  it("preserves Uranus qualifiers and marks slow-planet themes separately", () => {
    const taurus = getPlanetSignDescriptionEntry("uranus", "Taurus")!;
    expect(taurus.pt).toContain("no plano coletivo");
    expect(taurus.pt).toContain("simboliza mudanças econômicas repentinas");
    expect(taurus.en).toContain("on a collective level");
    const gemini = getPlanetSignDescriptionEntry("uranus", "Gemini")!;
    expect(gemini.pt).toContain("interesse em novas formas de comunicação");
    const sagittarius = getPlanetSignDescriptionEntry("uranus", "Sagittarius")!;
    expect(sagittarius.pt).toContain("espírito aventureiro e rebelde");
    expect(sagittarius.pt).toContain("vivenciar grandes viagens, reais ou imaginárias");
    expect(sagittarius.en).toContain("experience great journeys, real or imagined");
    expect(sagittarius.pt + sagittarius.en).not.toMatch(/estrangeiro|foreigner/);
    const capricorn = getPlanetSignDescriptionEntry("uranus", "Capricorn")!;
    expect(capricorn.pt).toContain("aptidão para liderar");
    expect(capricorn.pt).toContain("em termos coletivos");
    expect(capricorn.pt + capricorn.en).not.toMatch(/mudanças bruscas.*profissionais|socio-professional changes|mãe original|mother/);
    const aquarius = getPlanetSignDescriptionEntry("uranus", "Aquarius")!;
    expect(aquarius.pt).toContain("suas amizades podem incluir pessoas originais");
    const pisces = getPlanetSignDescriptionEntry("uranus", "Pisces")!;
    for (const phrase of ["ideias grandiosas", "utópicas", "astrologia", "parapsicologia", "psicologia", "psiquiatria"]) expect(pisces.pt).toContain(phrase);
    expect(pisces.pt).toContain("simboliza mudanças coletivas nas artes e na espiritualidade");
    expect(pisces.pt + pisces.en).not.toMatch(/revelações místicas|mystical revelations|experiências psíquicas únicas|unique psychic experiences/);
  });

  it("uses two lowercase-started sentences without editorial prose or em dashes", () => {
    for (const sign of signs) {
      const entry = getPlanetSignDescriptionEntry("uranus", sign)!;
      expect(entry.reviewNotes.length).toBeGreaterThan(0);
      for (const text of [entry.pt, entry.en]) {
        expect(text).toMatch(/^(você |you )/);
        const sentences = text.match(/[^.!?]+[.!?]/g)!;
        expect(sentences).toHaveLength(2);
        expect(sentences.join("")).toBe(text);
        for (const sentence of sentences) expect(sentence.trim()).toMatch(/^[a-zà-ú]/u);
        expect(text).not.toMatch(/o curso|the course|o livro|the book|foi omitido|was omitted|OCR|fonte|source/i);
      }
      expect(JSON.stringify(entry)).not.toContain("\u2014");
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


describe("Venus source distinctions", () => {
  it("keeps distinct unconventional-sexuality and fulfillment clauses without behavior instructions", () => {
    const e = getPlanetSignDescriptionEntry("venus", "Aries")!;
    expect(e.pt).toContain("sexualidade pode ser pouco convencional");
    expect(e.pt).toContain("necessidade constante de satisfação");
    expect(e.en).toContain("sexuality may be unconventional");
    expect(e.en).toContain("constant need for fulfillment");
  });

  it("retains criticism, difficult love and emotional blockage instead of a romantic book fallback", () => {
    for (const [sign, pt, en] of [
      ["Virgo", "senso crítico pode abafar", "critical sense can stifle"],
      ["Scorpio", "grande dificuldade para amar", "very difficult to love"],
      ["Capricorn", "abafada pela racionalidade", "stifled by rationality"],
    ] as const) {
      const e = getPlanetSignDescriptionEntry("venus", sign)!;
      expect(e.pt).toContain(pt);
      expect(e.en).toContain(en);
      expect(e.reviewNotes.length).toBeGreaterThan(0);
    }
  });

  it("retains possible maternal tone and ambiguous betrayals for Pisces", () => {
    const e = getPlanetSignDescriptionEntry("venus", "Pisces")!;
    expect(e.pt).toContain("atitude em relação à pessoa amada pode ter um tom maternal");
    expect(e.en).toContain("attitude toward the person you love can have a maternal tone");
    expect(e.pt).toContain("pode haver traições");
    expect(e.en).toContain("betrayals are also possible");
  });

  it("keeps editorial decisions in metadata and only narrow primary claims in prose", () => {
    for (const sign of signs) {
      const e = getPlanetSignDescriptionEntry("venus", sign)!;
      expect(e.pt).toMatch(/^você /);
      expect(e.en).toMatch(/^you /);
      expect(e.pt + e.en).not.toMatch(/o curso|the course|foi omitid|was omitted|impotência|impotence|frigidez|frigidity/);
      expect(JSON.stringify(e)).not.toContain("\u2014");
      expect(e.pt.match(/[.!?]/g)).toHaveLength(2);
      expect(e.en.match(/[.!?]/g)).toHaveLength(2);
      for (const source of e.src) {
        expect(source.file).toBe("modulo 4/aula 12 modulo 4/aula-12.md");
        expect(source.from).toBeGreaterThanOrEqual(32);
        expect(source.to).toBeLessThanOrEqual(56);
      }
    }
  });
});


describe("Mars source distinctions", () => {
  it("retains Sagittarius's explicit male-emphasis qualifier in both languages and keywords", () => {
    const entry = getPlanetSignDescriptionEntry("mars", "Sagittarius")!;
    expect(entry.pt).toMatch(/energia sexual.*principalmente em pessoas do sexo masculino/);
    expect(entry.en).toMatch(/sexual energy.*especially in people of the male sex/);
    expect(entry.keywords.pt.some(keyword => /energia sexual.*principalmente.*sexo masculino/.test(keyword))).toBe(true);
    expect(entry.keywords.en.some(keyword => /sexual energy.*especially.*male sex/.test(keyword))).toBe(true);
    expect(entry.src).toEqual([{ file: "modulo 4/aula 12 modulo 4/aula-12.md", from: 75, to: 77 }]);
  });

  it("keeps rational control distinct from Capricorn's authority, power and anger", () => {
    const entry = getPlanetSignDescriptionEntry("mars", "Capricorn")!;
    expect(entry.pt).toMatch(/força física pela razão/);
    expect(entry.en).toMatch(/physical strength through reason/);
    expect(entry.pt.split(". ")[1]).toMatch(/^também.*autoridade, poder e cólera/);
    expect(entry.en.split(". ")[1]).toMatch(/^authority, power and anger/);
    expect(entry.pt + entry.en).not.toMatch(/sucesso|success|that strength|essa força/);
  });

  it("retains Leo's rational restraint and Libra's sexual extremes and direct intuition", () => {
    const leo = getPlanetSignDescriptionEntry("mars", "Leo")!;
    expect(leo.pt).toMatch(/coragem sob controle da razão/);
    expect(leo.en).toMatch(/courage guided by reason/);
    const libra = getPlanetSignDescriptionEntry("mars", "Libra")!;
    expect(libra.pt).toMatch(/entre ausência e exagero/);
    expect(libra.en).toMatch(/from absence to excess/);
    expect(libra.en).toContain("intuition is also present");
    expect(libra.en).not.toContain("is also noted");
  });

  it("retains course tensions without book counterweights or external outcome claims", () => {
    const aquarius = getPlanetSignDescriptionEntry("mars", "Aquarius")!;
    expect(aquarius.pt).toContain("aversão a vínculos");
    expect(aquarius.en).toContain("aversion to bonds");
    const pisces = getPlanetSignDescriptionEntry("mars", "Pisces")!;
    expect(pisces.pt).toContain("força de vontade bloqueada");
    expect(pisces.en).toContain("willpower blocked");
    expect(pisces.pt).toContain("abnegação");
    expect(pisces.en).toContain("self-denial");
    expect(pisces.pt + pisces.en).not.toMatch(/inimigos ocultos|hidden enemies|provocações continuas|continuous provocations|compaixão|compassion/);
    expect(pisces.reviewNotes.join(" ")).toContain("hidden enemies");
  });

  it("keeps unresolved OCR omissions and sequence-based Virgo recovery in metadata", () => {
    const aries = getPlanetSignDescriptionEntry("mars", "Aries")!;
    expect(aries.reviewNotes.join(" ")).toMatch(/afiar/);
    expect(aries.reviewNotes.join(" ")).toMatch(/perante/);
    const virgo = getPlanetSignDescriptionEntry("mars", "Virgo")!;
    expect(virgo.reviewNotes.join(" ")).toMatch(/VIAGEM/);
    expect(virgo.reviewNotes.join(" ")).toMatch(/sequência/);
    expect(virgo.reviewNotes.join(" ")).toMatch(/incerta/);
    const scorpio = getPlanetSignDescriptionEntry("mars", "Scorpio")!;
    expect(scorpio.reviewNotes.join(" ")).toMatch(/pede até ser destrutiva/);
    for (const entry of [aries, virgo, scorpio]) {
      expect(entry.pt + entry.en).not.toMatch(/afiar|perante|VIAGEM|pede|destrutiv|destructiv|OCR/);
    }
  });

  it("cites precise per-sign course bounds and only the adopted narrow Aries book passage", () => {
    const bounds = [
      [59, 60], [61, 62], [63, 64], [65, 66], [67, 68], [69, 70],
      [71, 72], [73, 74], [75, 77], [78, 79], [80, 81], [82, 83],
    ];
    signs.forEach((sign, index) => {
      const entry = getPlanetSignDescriptionEntry("mars", sign)!;
      const expected = [{ file: "modulo 4/aula 12 modulo 4/aula-12.md", from: bounds[index][0], to: bounds[index][1] }];
      if (sign === "Aries") expected.push({ file: "books/astrologia-hermetica/astrologia-hermetica.md", from: 40349, to: 40364 });
      expect(entry.src).toEqual(expected);
      expect(entry.reviewNotes.length).toBeGreaterThan(0);
      for (const text of [entry.pt, entry.en]) {
        expect(text).toMatch(/^(você |sua |you |your )/);
        expect(text.match(/[.!?]/g)).toHaveLength(2);
        for (const sentence of text.split(". ")) expect(sentence).toMatch(/^[a-zà-ú]/u);
        expect(text).not.toMatch(/o curso|the course|OCR|source|fonte/);
      }
    });
  });
});


describe("Saturn source distinctions", () => {
  const course = "modulo 4/aula 12 modulo 4/aula-12.md";
  const bounds = [[113, 114], [115, 116], [117, 118], [119, 120], [121, 122], [123, 124], [125, 126], [127, 128], [129, 130], [131, 132], [133, 134], [135, 136]] as const;

  it("uses all twelve canonical Title Case signs and exact Saturn course bounds", () => {
    const authored = ASTROLOGY_DESCRIPTIONS.planetSigns.saturn!;
    expect(Object.keys(authored)).toEqual([...signs]);
    signs.forEach((sign, index) => {
      const expected: { file: string; from: number; to: number }[] = [
        { file: course, from: bounds[index][0], to: bounds[index][1] },
      ];
      if (sign === "Leo") {
        expected.push({ file: "books/astrologia-hermetica/astrologia-hermetica.md", from: 49751, to: 49757 });
      }
      expect(getPlanetSignDescriptionEntry("saturn", sign)!.src).toEqual(expected);
    });
  });

  it("preserves the unusual primary claims and source-specific exclusions", () => {
    const taurus = getPlanetSignDescriptionEntry("saturn", "Taurus")!;
    expect(taurus.pt).toContain("tolerância");
    expect(taurus.pt).toContain("sensualidade própria do signo pode diminuir");
    const gemini = getPlanetSignDescriptionEntry("saturn", "Gemini")!;
    expect(gemini.pt).toContain("amadurecer cedo");
    expect(gemini.pt).toContain("autocontrole na fala");
    expect(gemini.pt + gemini.en).not.toMatch(/depressão|depression/);
    expect(gemini.reviewNotes.join(" ")).toMatch(/depressão|depression/);
    const aries = getPlanetSignDescriptionEntry("saturn", "Aries")!;
    expect(aries.pt).toContain("bom controle dos instintos");
    expect(aries.pt).toContain("crueldade");
    expect(aries.pt).toContain("irracionalidade frequente");
    const libra = getPlanetSignDescriptionEntry("saturn", "Libra")!;
    expect(libra.pt).toContain("falta de senso prático");
    const capricorn = getPlanetSignDescriptionEntry("saturn", "Capricorn")!;
    expect(capricorn.pt).toContain("desprendimento dos bens materiais e dos prazeres");
    const pisces = getPlanetSignDescriptionEntry("saturn", "Pisces")!;
    expect(pisces.pt).toContain("falta de coragem");
    expect(pisces.en).toContain("lack of courage");
  });

  it("keeps Saturn copy concise, lowercase-started, and course-prioritized", () => {
    for (const sign of signs) {
      const entry = getPlanetSignDescriptionEntry("saturn", sign)!;
      expect(entry.reviewNotes.length).toBeGreaterThan(0);
      expect(entry.src).toHaveLength(sign === "Leo" ? 2 : 1);
      for (const text of [entry.pt, entry.en]) {
        expect(text).toMatch(/^(você |you )/);
        const sentences = text.match(/[^.!?]+[.!?]/g)!;
        expect(sentences).toHaveLength(2);
        expect(sentences.join("")).toBe(text);
        for (const sentence of sentences) expect(sentence.trim()).toMatch(/^[a-zà-ú]/u);
        expect(text).not.toMatch(/o curso|the course|o livro|the book|source|fonte|OCR/i);
      }
    }
    const sagittarius = getPlanetSignDescriptionEntry("saturn", "Sagittarius")!;
    expect(sagittarius.pt).toMatch(/dedicar.*estudos.*moralidade.*capacidade intelectual/i);
    const aquarius = getPlanetSignDescriptionEntry("saturn", "Aquarius")!;
    expect(aquarius.pt).toContain("tenacidade");
    expect(aquarius.pt).toContain("suas amizades podem incluir pessoas sábias");
    expect(aquarius.en).toContain("your friendships may include wise people");
    const leo = getPlanetSignDescriptionEntry("saturn", "Leo")!;
    expect(leo.pt).toContain("dificuldades para expressar a criatividade");
    expect(leo.src).toContainEqual({
      file: "books/astrologia-hermetica/astrologia-hermetica.md",
      from: 49751,
      to: 49757,
    });
    for (const sign of ["Sagittarius", "Capricorn", "Aquarius", "Pisces"] as const) {
      expect(getPlanetSignDescriptionEntry("saturn", sign)!.src).toEqual([
        { file: course, from: bounds[signs.indexOf(sign)][0], to: bounds[signs.indexOf(sign)][1] },
      ]);
    }
    expect(JSON.stringify(ASTROLOGY_DESCRIPTIONS.planetSigns.saturn)).not.toContain("\u2014");
  });
});

describe("Jupiter source distinctions", () => {
  it("retains excessive generosity and optimism in Aries prose and paired keywords", () => {
    const entry = getPlanetSignDescriptionEntry("jupiter", "Aries")!;
    expect(entry.pt).toMatch(/generosidade e otimismo exagerados/);
    expect(entry.en).toMatch(/excessive generosity and optimism/);
    expect(entry.keywords.pt).toEqual(expect.arrayContaining(["generosidade exagerada", "otimismo exagerado"]));
    expect(entry.keywords.en).toEqual(expect.arrayContaining(["excessive generosity", "excessive optimism"]));
  });

  it("keeps Virgo's critical outlook distinct from its lack of practical sense", () => {
    const entry = getPlanetSignDescriptionEntry("jupiter", "Virgo")!;
    expect(entry.pt).toMatch(/visão crítica.*faltar senso prático/);
    expect(entry.en).toMatch(/critical view.*practical sense may be lacking/);
    expect(entry.keywords.pt).toContain("falta de senso prático");
    expect(entry.keywords.en).toContain("lack of practical sense");
    expect(entry.reviewNotes.join(" ")).toMatch(/cetismo/);
    expect(entry.reviewNotes.join(" ")).toMatch(/sem reconstrução/);
    expect(entry.pt + entry.en + JSON.stringify(entry.keywords)).not.toMatch(/cetismo|ceticismo|skepticism|scepticism/);
  });

  it("keeps Cancer health and life-stage claims exclusively in exclusion metadata", () => {
    const entry = getPlanetSignDescriptionEntry("jupiter", "Cancer")!;
    expect(entry.pt).toMatch(/conservadorismo e à indulgência/);
    expect(entry.en).toMatch(/conservatism and indulgence/);
    expect(entry.pt + entry.en + JSON.stringify(entry.keywords)).not.toMatch(/digest|aparelho|sucesso|success|segunda metade|second half|life.stage/i);
    expect(entry.reviewNotes.join(" ")).toMatch(/digestive/);
    expect(entry.reviewNotes.join(" ")).toMatch(/life-stage success/);
  });

  it("preserves Gemini's travel possibility and consistent success omission", () => {
    const entry = getPlanetSignDescriptionEntry("jupiter", "Gemini")!;
    expect(entry.pt).toContain("possibilidade de muitas viagens");
    expect(entry.en).toContain("possibility of many trips");
    expect(entry.pt + entry.en).not.toMatch(/sucesso|success|commercial|comercial/);
    expect(entry.reviewNotes.join(" ")).toContain("success in intellectual or commercial activity is omitted");
    expect(entry.reviewNotes.join(" ")).toContain("not converted into an invented aptitude");
  });

  it("retains Sagittarius's loss of critical view and omits unresolved jogador", () => {
    const entry = getPlanetSignDescriptionEntry("jupiter", "Sagittarius")!;
    expect(entry.pt).toMatch(/perder a visão crítica.*exagero em qualquer área/);
    expect(entry.en).toMatch(/lose your critical outlook.*exaggeration in any area/);
    expect(entry.pt).toContain("boa capacidade intelectual");
    expect(entry.en).toContain("good intellectual ability");
    expect(entry.pt + entry.en + JSON.stringify(entry.keywords)).not.toMatch(/jogador|jogo|games|gambl|player|sorte|luck/i);
    expect(entry.reviewNotes.join(" ")).toMatch(/jogador.*unresolved/);
  });

  it("retains remaining tensions without invented advancement or support aptitudes", () => {
    const capricorn = getPlanetSignDescriptionEntry("jupiter", "Capricorn")!;
    expect(capricorn.pt).toContain("severidade, austeridade e intolerância");
    expect(capricorn.en).toContain("severity, austerity and intolerance");
    expect(capricorn.pt + capricorn.en).not.toMatch(/ascensão|advancement|liderança|leadership|manager/);
    const aquarius = getPlanetSignDescriptionEntry("jupiter", "Aquarius")!;
    expect(aquarius.pt).toContain("grosseria");
    expect(aquarius.en).toContain("rudeness");
    expect(aquarius.pt + aquarius.en).not.toMatch(/proteção|protection|network/);
    const pisces = getPlanetSignDescriptionEntry("jupiter", "Pisces")!;
    expect(pisces.pt).toMatch(/tender à autoindulgência excessiva/);
    expect(pisces.en).toMatch(/tend toward excessive self-indulgence/);
    expect(pisces.pt).toContain("identificação com o sofrimento");
    expect(pisces.en).toContain("identification with suffering");
  });

  it("cites only narrow per-sign primary passages and retains bilingual structure", () => {
    const bounds = [[86, 87], [88, 89], [90, 91], [92, 94], [95, 96], [97, 98],
      [99, 100], [101, 102], [103, 104], [105, 106], [107, 108], [109, 110]];
    signs.forEach((sign, index) => {
      const entry = getPlanetSignDescriptionEntry("jupiter", sign)!;
      expect(entry.src).toEqual([{ file: "modulo 4/aula 12 modulo 4/aula-12.md", from: bounds[index][0], to: bounds[index][1] }]);
      expect(entry.reviewNotes.length).toBeGreaterThan(0);
      expect(entry.pt).toMatch(/^você /);
      expect(entry.en).toMatch(/^you /);
      for (const text of [entry.pt, entry.en]) {
        expect(text.match(/[.!?]/g)).toHaveLength(2);
        for (const sentence of text.split(". ")) expect(sentence).toMatch(/^[a-zà-ú]/u);
      }
    });
  });
});
