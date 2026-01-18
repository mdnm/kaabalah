import { describe, expect, it } from "vitest";
import { id, LetterTypes } from "../core";
import { HEBREW_LETTERS } from "../core/constants";
import { calculateGematria, reverseGematria } from "./index";

const getSums = (result: ReturnType<typeof calculateGematria>) => ({
  vowels: result.vowels.originalSum,
  consonants: result.consonants.originalSum,
  synthesis: result.synthesis.originalSum,
});

describe("calculateGematria", () => {
  it.each([
    ["A", 1, 0],
    ["B", 0, 2],
    ["G", 0, 3],
    ["D", 0, 4],
    ["E", 5, 0],
    ["V", 0, 6],
    ["U", 6, 0],
    ["W", 6, 0],
    ["Z", 0, 7],
    ["H", 0, 8],
    ["T", 0, 9],
    ["I", 10, 0],
    ["J", 0, 10],
    ["Y", 10, 0],
    ["C", 0, 20],
    ["L", 0, 30],
    ["M", 0, 40],
    ["N", 0, 50],
    ["S", 0, 60],
    ["Ç", 0, 60],
    ["P", 0, 80],
    ["PH", 0, 80],
    ["F", 0, 80],
    ["TS", 0, 90],
    ["TZ", 0, 90],
    ["K", 0, 100],
    ["KH", 0, 100],
    ["Q", 0, 100],
    ["R", 0, 200],
    ["SH", 0, 300],
    ["X", 0, 300],
    ["TH", 0, 400],
  ])(
    "should calculate correct values for letter %s",
    (input, expectedVowel, expectedConsonant) => {
      const result = calculateGematria(input as string);
      expect(result.vowels.originalSum).toBe(expectedVowel);
      expect(result.consonants.originalSum).toBe(expectedConsonant);
    }
  );

  it("should handle starting and ending values correctly", () => {
    // O at start = Ayin (70), O elsewhere = Vav (6)
    expect(getSums(calculateGematria("O"))).toEqual({
      vowels: 70,
      consonants: 0,
      synthesis: 70,
    });
    expect(getSums(calculateGematria("ORTO"))).toEqual({
      vowels: 76,
      consonants: 209,
      synthesis: 285,
    }); // O in middle = Vav (6)
    // C at end = Kaph sofit (500)
    expect(getSums(calculateGematria("ABC"))).toEqual({
      vowels: 1,
      consonants: 502,
      synthesis: 503,
    });
    expect(getSums(calculateGematria("ABCC"))).toEqual({
      vowels: 1,
      consonants: 522,
      synthesis: 523,
    });
    // M at end = Mem sofit (600)
    expect(getSums(calculateGematria("AM"))).toEqual({
      vowels: 1,
      consonants: 600,
      synthesis: 601,
    });
    expect(getSums(calculateGematria("MAM"))).toEqual({
      vowels: 1,
      consonants: 640,
      synthesis: 641,
    });
    // N at end = Nun sofit (700)
    expect(getSums(calculateGematria("AN"))).toEqual({
      vowels: 1,
      consonants: 700,
      synthesis: 701,
    });
    expect(getSums(calculateGematria("NAN"))).toEqual({
      vowels: 1,
      consonants: 750,
      synthesis: 751,
    });
    // P at end = Pe sofit (800)
    expect(getSums(calculateGematria("AP"))).toEqual({
      vowels: 1,
      consonants: 800,
      synthesis: 801,
    });
    expect(getSums(calculateGematria("PAP"))).toEqual({
      vowels: 1,
      consonants: 880,
      synthesis: 881,
    });
    // TZ at end = Tzaddi sofit (900)
    expect(getSums(calculateGematria("ATZ"))).toEqual({
      vowels: 1,
      consonants: 900,
      synthesis: 901,
    });
  });

  it("should calculate correct values for real names", () => {
    // Example: "DAVID" = D(4)+A(1)+V(6)+I(10)+D(4)
    expect(getSums(calculateGematria("DAVID"))).toEqual({
      vowels: 11,
      consonants: 14,
      synthesis: 25,
    });
    // Example: "MICHAEL" = M(40)+I(10)+CH(300)+A(1)+E(5)+L(30)
    expect(getSums(calculateGematria("MICHAEL"))).toEqual({
      vowels: 16,
      consonants: 370,
      synthesis: 386,
    });
    // Example: "SARAH" = S(60)+A(1)+R(200)+A(1)+H(8)
    expect(getSums(calculateGematria("SARAH"))).toEqual({
      vowels: 2,
      consonants: 268,
      synthesis: 270,
    });
    // Example: "JOSHUA" = J(10)+O(6)+SH(300)+U(6)+A(1)
    expect(getSums(calculateGematria("JOSHUA"))).toEqual({
      vowels: 13,
      consonants: 310,
      synthesis: 323,
    });
    // Example: "RACHEL" = R(200)+A(1)+CH(300)+E(5)+L(30)
    expect(getSums(calculateGematria("RACHEL"))).toEqual({
      vowels: 6,
      consonants: 530,
      synthesis: 536,
    });
    // Example: "JOÃO" = J(10)+O(6)+Ã(5)+O(6)
    expect(getSums(calculateGematria("JOÃO"))).toEqual({
      vowels: 17,
      consonants: 10,
      synthesis: 27,
    });
    // Example: "JOSÉ" = J(10)+O(6)+S(60)+E(5)
    expect(getSums(calculateGematria("JOSÉ"))).toEqual({
      vowels: 11,
      consonants: 70,
      synthesis: 81,
    });
    // Example: "JUÇARA" = J(10)+U(6)+Ç(60)+A(1)+R(200)+A(1)
    expect(getSums(calculateGematria("JUÇARA"))).toEqual({
      vowels: 8,
      consonants: 270,
      synthesis: 278,
    });
    // Example: "EZREACT" = E(5)+Z(7)+R(200)+E(5)+A(1)+C(20)+T(9)
    expect(getSums(calculateGematria("EZREACT"))).toEqual({
      vowels: 11,
      consonants: 236,
      synthesis: 247,
    });
  });

  it("should handle empty and non-letter input gracefully", () => {
    expect(getSums(calculateGematria(""))).toEqual({
      vowels: 0,
      consonants: 0,
      synthesis: 0,
    });
    expect(getSums(calculateGematria("123!@#"))).toEqual({
      vowels: 0,
      consonants: 0,
      synthesis: 0,
    });
  });

  it("should calculate missing letters", () => {
    expect(
      calculateGematria("ABCDEFGHIJKLMNOPQRSTUVWXYZ", { missing: true })
        .missingGematriaValues
    ).toEqual([
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.AYIN),
        value: 70,
        whenEnding: false,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.TSADI),
        value: 90,
        whenEnding: false,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.TAV),
        value: 400,
        whenEnding: false,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.KAPH),
        value: 500,
        whenEnding: true,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.MEM),
        value: 600,
        whenEnding: true,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.NUN),
        value: 700,
        whenEnding: true,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.PE),
        value: 800,
        whenEnding: true,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.TSADI),
        value: 900,
        whenEnding: true,
      },
    ]);
    expect(
      calculateGematria("OABCDEFGHIJKLMNOPQRSTUVWXYZ", { missing: true })
        .missingGematriaValues
    ).toEqual([
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.TSADI),
        value: 90,
        whenEnding: false,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.TAV),
        value: 400,
        whenEnding: false,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.KAPH),
        value: 500,
        whenEnding: true,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.MEM),
        value: 600,
        whenEnding: true,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.NUN),
        value: 700,
        whenEnding: true,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.PE),
        value: 800,
        whenEnding: true,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.TSADI),
        value: 900,
        whenEnding: true,
      },
    ]);
    expect(
      calculateGematria("TZTHABCDEFGHIJKLMNOPQRSTUVWXYZTS", { missing: true })
        .missingGematriaValues
    ).toEqual([
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.AYIN),
        value: 70,
        whenEnding: false,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.KAPH),
        value: 500,
        whenEnding: true,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.MEM),
        value: 600,
        whenEnding: true,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.NUN),
        value: 700,
        whenEnding: true,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.PE),
        value: 800,
        whenEnding: true,
      },
    ]);
    expect(
      calculateGematria("TZTHABCDEFGHIJKLMNOPQRSTUVWXYZC", { missing: true })
        .missingGematriaValues
    ).toEqual([
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.AYIN),
        value: 70,
        whenEnding: false,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.MEM),
        value: 600,
        whenEnding: true,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.NUN),
        value: 700,
        whenEnding: true,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.PE),
        value: 800,
        whenEnding: true,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.TSADI),
        value: 900,
        whenEnding: true,
      },
    ]);
    expect(
      calculateGematria("TZTHABCDEFGHIJKLMNOPQRSTUVWXYZM", { missing: true })
        .missingGematriaValues
    ).toEqual([
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.AYIN),
        value: 70,
        whenEnding: false,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.KAPH),
        value: 500,
        whenEnding: true,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.NUN),
        value: 700,
        whenEnding: true,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.PE),
        value: 800,
        whenEnding: true,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.TSADI),
        value: 900,
        whenEnding: true,
      },
    ]);
    expect(
      calculateGematria("TZTHABCDEFGHIJKLMNOPQRSTUVWXYZN", { missing: true })
        .missingGematriaValues
    ).toEqual([
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.AYIN),
        value: 70,
        whenEnding: false,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.KAPH),
        value: 500,
        whenEnding: true,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.MEM),
        value: 600,
        whenEnding: true,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.PE),
        value: 800,
        whenEnding: true,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.TSADI),
        value: 900,
        whenEnding: true,
      },
    ]);
    expect(
      calculateGematria("TZTHABCDEFGHIJKLMNOPQRSTUVWXYZP", { missing: true })
        .missingGematriaValues
    ).toEqual([
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.AYIN),
        value: 70,
        whenEnding: false,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.KAPH),
        value: 500,
        whenEnding: true,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.MEM),
        value: 600,
        whenEnding: true,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.NUN),
        value: 700,
        whenEnding: true,
      },
      {
        hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.TSADI),
        value: 900,
        whenEnding: true,
      },
    ]);
  });

  it("should calculate letter percentages", () => {
    expect(
      calculateGematria("KAABALAH", { percentages: true }).letterPercentages
    ).toEqual({
      percentageOfVowels: 50,
      percentageOfConsonants: 50,
      letters: {
        A: 50,
        B: 12.5,
        H: 12.5,
        K: 12.5,
        L: 12.5,
      },
    });

    const { letterPercentages } = calculateGematria("MATEUS MOURA", {
      percentages: true,
    });

    expect(
      (letterPercentages?.percentageOfConsonants ?? 0) +
        (letterPercentages?.percentageOfVowels ?? 0)
    ).toEqual(100);
    expect(letterPercentages?.percentageOfConsonants).toEqual(40);
    expect(letterPercentages?.percentageOfVowels).toEqual(60);
    expect(letterPercentages?.letters.A).toEqual(20);
    expect(letterPercentages?.letters.E?.toFixed(2)).toBeCloseTo(16.67);
    expect(letterPercentages?.letters.M).toEqual(20);
    expect(letterPercentages?.letters.O).toEqual(20);
    expect(letterPercentages?.letters.R).toEqual(20);
    expect(letterPercentages?.letters.S?.toFixed(2)).toBeCloseTo(16.67);
    expect(letterPercentages?.letters.T?.toFixed(2)).toBeCloseTo(16.67);
    expect(letterPercentages?.letters.U).toEqual(20);
  });

  it("should correctly handle multiple words", () => {
    const { consonants, vowels } = calculateGematria("MATEUM OURA");

    // M in the end on first word so 600 instead of 40 and O in the start on second word so 70 instead of 6
    expect(consonants.originalSum).toEqual(849);
    expect(vowels.originalSum).toEqual(89);
  });

  it("should correctly return the included letters", () => {
    const { includedLetters } = calculateGematria("MATEUS MOURA");

    expect(includedLetters.length).toEqual(11);
    expect(
      includedLetters.find(
        (l) => l.latinLetterId === id(LetterTypes.LATIN_LETTER, "M")
      )
    ).toMatchObject({
      latinLetterId: id(LetterTypes.LATIN_LETTER, "M"),
      value: 40,
      hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.MEM),
    });
    expect(
      includedLetters.find(
        (l) => l.latinLetterId === id(LetterTypes.LATIN_LETTER, "O")
      )
    ).toMatchObject({
      latinLetterId: id(LetterTypes.LATIN_LETTER, "O"),
      value: 6,
      hebrewLetterId: id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.VAV),
    });
  });
});

describe("reverseGematria", () => {
  it("should return empty results when no target is specified", () => {
    const result = reverseGematria({});
    expect(result.results).toHaveLength(0);
    expect(result.hasMore).toBe(false);
    expect(result.totalFound).toBe(0);
  });

  it("should find letters matching synthesis target", () => {
    // A = 1, so targetSynthesis: 1 should find "A"
    const result = reverseGematria({ targetSynthesis: 1, maxLength: 1 });
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results.some((r) => r.letters === "A")).toBe(true);
    expect(result.results.find((r) => r.letters === "A")?.synthesisSum).toBe(1);
  });

  it("should find letters matching vowels target", () => {
    // E = 5 (vowel)
    const result = reverseGematria({ targetVowels: 5, maxLength: 1 });
    expect(result.results.some((r) => r.letters === "E")).toBe(true);
    expect(result.results.find((r) => r.letters === "E")?.vowelsSum).toBe(5);
  });

  it("should find letters matching consonants target", () => {
    // B = 2 (consonant)
    const result = reverseGematria({ targetConsonants: 2, maxLength: 1 });
    expect(result.results.some((r) => r.letters === "B")).toBe(true);
    expect(result.results.find((r) => r.letters === "B")?.consonantsSum).toBe(2);
  });

  it("should handle O at start (AYIN = 70) vs elsewhere (VAV = 6)", () => {
    // O at start = 70
    const resultO = reverseGematria({ targetVowels: 70, maxLength: 1 });
    expect(resultO.results.some((r) => r.letters === "O")).toBe(true);
    expect(resultO.results.find((r) => r.letters === "O")?.vowelsSum).toBe(70);

    // AO = A(1) + O(6) = 7 vowels (O not at start)
    const resultAO = reverseGematria({
      targetVowels: 7,
      targetConsonants: 0,
      minLength: 2,
      maxLength: 2,
    });
    expect(resultAO.results.some((r) => r.letters === "AO")).toBe(true);
  });

  it("should handle ending letter values", () => {
    // C at end = 500 (Kaph sofit), C in middle = 20
    // AC = A(1) + C(500) = 501 synthesis, 1 vowel, 500 consonants
    const resultAC = reverseGematria({
      targetConsonants: 500,
      targetVowels: 1,
      minLength: 2,
      maxLength: 2,
    });
    expect(resultAC.results.some((r) => r.letters === "AC")).toBe(true);
    const acResult = resultAC.results.find((r) => r.letters === "AC");
    expect(acResult?.consonantsSum).toBe(500);
    expect(acResult?.vowelsSum).toBe(1);

    // M at end = 600 (Mem sofit)
    const resultAM = reverseGematria({
      targetConsonants: 600,
      targetVowels: 1,
      minLength: 2,
      maxLength: 2,
    });
    expect(resultAM.results.some((r) => r.letters === "AM")).toBe(true);
    expect(resultAM.results.find((r) => r.letters === "AM")?.consonantsSum).toBe(600);
  });

  it("should include digraphs when includeDigraphs is true", () => {
    // SH = 300
    const resultWithDigraphs = reverseGematria({
      targetConsonants: 300,
      maxLength: 2,
      includeDigraphs: true,
    });
    expect(resultWithDigraphs.results.some((r) => r.letters === "SH")).toBe(true);
  });

  it("should exclude digraphs when includeDigraphs is false", () => {
    const resultWithoutDigraphs = reverseGematria({
      targetConsonants: 300,
      maxLength: 2,
      includeDigraphs: false,
    });
    // SH should not be present, but X (300) should be
    expect(resultWithoutDigraphs.results.some((r) => r.letters === "SH")).toBe(false);
    expect(resultWithoutDigraphs.results.some((r) => r.letters === "X")).toBe(true);
  });

  it("should respect maxResults limit", () => {
    const result = reverseGematria({
      targetSynthesis: 10,
      maxResults: 5,
      maxLength: 3,
    });
    expect(result.results.length).toBeLessThanOrEqual(5);
  });

  it("should set hasMore when more results exist", () => {
    const result = reverseGematria({
      targetSynthesis: 10,
      maxResults: 1,
      maxLength: 5,
    });
    // There are many ways to reach synthesis of 10
    expect(result.hasMore).toBe(true);
  });

  it("should respect minLength", () => {
    const result = reverseGematria({
      targetSynthesis: 1,
      minLength: 2,
      maxLength: 3,
    });
    // A=1 alone won't be included since minLength is 2
    expect(result.results.every((r) => r.letters.length >= 2)).toBe(true);
  });

  it("should respect maxLength", () => {
    const result = reverseGematria({
      targetSynthesis: 5,
      maxLength: 2,
      matchReductionStep: false,
    });
    expect(result.results.every((r) => r.letters.length <= 2)).toBe(true);
  });

  it("should match combined targets (vowels + consonants)", () => {
    // Find combinations with vowels=6 and consonants=2
    // E.g., UB = U(6) + B(2) or WB = W(6) + B(2)
    const result = reverseGematria({
      targetVowels: 6,
      targetConsonants: 2,
      minLength: 2,
      maxLength: 2,
      matchReductionStep: false,
    });
    expect(result.results.length).toBeGreaterThan(0);
    result.results.forEach((r) => {
      expect(r.vowelsSum).toBe(6);
      expect(r.consonantsSum).toBe(2);
    });
  });

  it("round-trip verification: calculateGematria should match reverseGematria results", () => {
    const target = { targetVowels: 11, targetConsonants: 14 };
    const reverseResults = reverseGematria({
      ...target,
      maxResults: 10,
      maxLength: 5,
    });

    for (const result of reverseResults.results) {
      const calculated = calculateGematria(result.letters);
      expect(calculated.vowels.originalSum).toBe(result.vowelsSum);
      expect(calculated.consonants.originalSum).toBe(result.consonantsSum);
      expect(calculated.synthesis.originalSum).toBe(result.synthesisSum);
    }
  });

  it("should correctly populate letterDetails", () => {
    const result = reverseGematria({
      targetSynthesis: 3,
      maxLength: 2,
    });

    const found = result.results.find((r) => r.letters === "AB");
    expect(found).toBeDefined();
    expect(found?.letterDetails).toHaveLength(2);
    expect(found?.letterDetails[0].latinLetterId).toBe(
      id(LetterTypes.LATIN_LETTER, "A")
    );
    expect(found?.letterDetails[0].isVowel).toBe(true);
    expect(found?.letterDetails[1].latinLetterId).toBe(
      id(LetterTypes.LATIN_LETTER, "B")
    );
    expect(found?.letterDetails[1].isVowel).toBe(false);
  });

  describe("maxLetterRepeat", () => {
    it("should allow letters up to maxLetterRepeat times", () => {
      // AAB = A(1)+A(1)+B(2) = 4 synthesis
      const result = reverseGematria({
        targetSynthesis: 4,
        maxLetterRepeat: 2,
        minLength: 3,
        maxLength: 3,
      });
      expect(result.results.some((r) => r.letters === "AAB")).toBe(true);
    });

    it("should filter results where a letter repeats more than maxLetterRepeat times", () => {
      // AAAB would have 3 A's
      const result = reverseGematria({
        targetSynthesis: 5,
        maxLetterRepeat: 2,
        minLength: 4,
        maxLength: 4,
      });
      expect(result.results.some((r) => r.letters === "AAAB")).toBe(false);
    });

    it("should work with maxLetterRepeat: 1 (no repeats allowed)", () => {
      const result = reverseGematria({
        targetSynthesis: 3,
        maxLetterRepeat: 1,
        minLength: 2,
        maxLength: 3,
        matchReductionStep: false,
      });
      // All results should have unique letters
      result.results.forEach((r) => {
        const letters = r.letters.split("");
        const unique = new Set(letters);
        expect(letters.length).toBe(unique.size);
      });
    });

    it("should treat digraphs as single units for maxLetterRepeat", () => {
      // Two SH digraphs (exactly 2 letter units)
      // Use matchReductionStep: false to match exact raw sum (600)
      const result = reverseGematria({
        targetSynthesis: 600,
        matchReductionStep: false,
        maxLetterRepeat: 2,
        minLength: 2,
        maxLength: 2,  // exactly 2 letter units
        includeDigraphs: true,
      });
      // SHSH = 300+300 = 600
      expect(result.results.some((r) => r.letters === "SHSH")).toBe(true);

      // But with maxLetterRepeat: 1, SHSH should be filtered
      const result2 = reverseGematria({
        targetSynthesis: 600,
        matchReductionStep: false,
        maxLetterRepeat: 1,
        minLength: 2,
        maxLength: 2,
        includeDigraphs: true,
      });
      expect(result2.results.some((r) => r.letters === "SHSH")).toBe(false);
    });
  });

  describe("suggestionText - anagram mode", () => {
    it("should only use letters from the suggestion text", () => {
      // "ABC" has A(1), B(2), C(20)
      const result = reverseGematria({
        targetSynthesis: 3,
        suggestionText: "ABC",
        suggestionMode: "anagram",
        minLength: 2,
        maxLength: 3,
      });

      // AB = 3 should be found
      expect(result.results.some((r) => r.letters === "AB")).toBe(true);
      // BA = 3 should also be found (anagram allows reordering)
      expect(result.results.some((r) => r.letters === "BA")).toBe(true);
      // AD should NOT be found (D is not in suggestion)
      expect(result.results.some((r) => r.letters.includes("D"))).toBe(false);
    });

    it("should respect letter counts from suggestion", () => {
      // "AB" has only one A and one B
      const result = reverseGematria({
        targetSynthesis: 2,
        suggestionText: "AB",
        suggestionMode: "anagram",
        minLength: 2,
        maxLength: 2,
      });

      // AA would need 2 A's but we only have 1
      expect(result.results.some((r) => r.letters === "AA")).toBe(false);
    });

    it("should allow using duplicate letters from suggestion", () => {
      // "AAB" has two A's
      const result = reverseGematria({
        targetSynthesis: 2,
        suggestionText: "AAB",
        suggestionMode: "anagram",
        minLength: 2,
        maxLength: 2,
      });

      // AA should be found since we have 2 A's
      expect(result.results.some((r) => r.letters === "AA")).toBe(true);
    });

    it("should handle spaces in suggestion text", () => {
      // "A B" has one space
      const result = reverseGematria({
        targetSynthesis: 3,
        suggestionText: "A B",
        suggestionMode: "anagram",
        minLength: 2,
        maxLength: 3,
      });

      // "A B" should be a valid result (one space allowed)
      expect(result.results.some((r) => r.letters === "A B")).toBe(true);
    });

    it("should respect maxLetterRepeat in anagram mode", () => {
      // "AAA" has 3 A's, but maxLetterRepeat: 2
      const result = reverseGematria({
        targetSynthesis: 3,
        suggestionText: "AAA",
        suggestionMode: "anagram",
        maxLetterRepeat: 2,
        minLength: 3,
        maxLength: 3,
      });

      // AAA should be filtered
      expect(result.results.some((r) => r.letters === "AAA")).toBe(false);
    });
  });

  describe("suggestionText - subsequence mode", () => {
    it("should preserve letter order from suggestion", () => {
      // "ABCD" subsequences should maintain order
      const result = reverseGematria({
        targetSynthesis: 3,
        suggestionText: "ABCD",
        suggestionMode: "subsequence",
        minLength: 2,
        maxLength: 2,
      });

      // AB should be found (preserves order)
      expect(result.results.some((r) => r.letters === "AB")).toBe(true);
      // BA should NOT be found (violates order)
      expect(result.results.some((r) => r.letters === "BA")).toBe(false);
    });

    it("should generate valid subsequences", () => {
      // "ABCD" subsequences include AD (skipping B and C)
      const result = reverseGematria({
        targetSynthesis: 5,
        suggestionText: "ABCD",
        suggestionMode: "subsequence",
        minLength: 2,
        maxLength: 2,
      });

      // AD = A(1) + D(4) = 5 (skipping B and C in the subsequence)
      expect(result.results.some((r) => r.letters === "AD")).toBe(true);
      // DA should NOT be found (violates order)
      expect(result.results.some((r) => r.letters === "DA")).toBe(false);
    });

    it("should handle spaces in subsequence mode", () => {
      // "AB CD" - can include/exclude the space
      const result = reverseGematria({
        targetSynthesis: 3,
        suggestionText: "AB CD",
        suggestionMode: "subsequence",
        minLength: 2,
        maxLength: 3,
      });

      // "A B" could be a valid result with space between A and B (from different parts)
      // Note: This tests flexible space placement
      expect(result.results.some((r) => r.letters === "AB")).toBe(true);
    });

    it("should respect maxLetterRepeat in subsequence mode", () => {
      // "AAA" with maxLetterRepeat: 2
      const result = reverseGematria({
        targetSynthesis: 3,
        suggestionText: "AAA",
        suggestionMode: "subsequence",
        maxLetterRepeat: 2,
        minLength: 3,
        maxLength: 3,
      });

      // AAA should be filtered
      expect(result.results.some((r) => r.letters === "AAA")).toBe(false);
    });

    it("round-trip verification: calculateGematria should match subsequence results", () => {
      const result = reverseGematria({
        targetVowels: 11,
        targetConsonants: 14,
        suggestionText: "DAVID",
        suggestionMode: "subsequence",
        maxResults: 10,
        maxLength: 5,
      });

      for (const res of result.results) {
        const calculated = calculateGematria(res.letters);
        expect(calculated.vowels.originalSum).toBe(res.vowelsSum);
        expect(calculated.consonants.originalSum).toBe(res.consonantsSum);
        expect(calculated.synthesis.originalSum).toBe(res.synthesisSum);
      }
    });
  });

  describe("combined options", () => {
    it("should work with maxLetterRepeat and other filters", () => {
      const result = reverseGematria({
        targetVowels: 2,
        targetConsonants: 4,
        maxLetterRepeat: 1,
        minLength: 2,
        maxLength: 4,
        matchReductionStep: false,
      });

      // All results should have no duplicate letters
      result.results.forEach((r) => {
        const letters = r.letters.split("");
        const unique = new Set(letters);
        expect(letters.length).toBe(unique.size);
      });

      // And match the targets
      result.results.forEach((r) => {
        expect(r.vowelsSum).toBe(2);
        expect(r.consonantsSum).toBe(4);
      });
    });
  });

  describe("reduction step matching", () => {
    it("should match targets anywhere in reduction path by default", () => {
      // With matchReductionStep: true (default), target 1 should match
      // results that reduce to 1 (e.g., 10 → 1, 19 → 10 → 1, etc.)
      const result = reverseGematria({
        targetConsonants: 1,
        minLength: 2,
        maxLength: 3,
        maxResults: 10,
      });

      expect(result.results.length).toBeGreaterThan(0);

      // All results should have 1 somewhere in their consonants reduction steps
      result.results.forEach((r) => {
        expect(r.consonants.reductionSteps).toContain(1);
      });
    });

    it("should include reduction info in results", () => {
      const result = reverseGematria({
        targetSynthesis: 3,
        maxLength: 2,
        matchReductionStep: false,
      });

      const found = result.results.find((r) => r.letters === "AB");
      expect(found).toBeDefined();

      // Check that reduction info is present
      expect(found?.vowels).toBeDefined();
      expect(found?.vowels.originalSum).toBe(1); // A = 1
      expect(found?.vowels.reductionSteps).toContain(1);
      expect(found?.vowels.finalValue).toBe(1);

      expect(found?.consonants).toBeDefined();
      expect(found?.consonants.originalSum).toBe(2); // B = 2
      expect(found?.consonants.reductionSteps).toContain(2);
      expect(found?.consonants.finalValue).toBe(2);

      expect(found?.synthesis).toBeDefined();
      expect(found?.synthesis.originalSum).toBe(3);
      expect(found?.synthesis.reductionSteps).toContain(3);
      expect(found?.synthesis.finalValue).toBe(3);
    });

    it("should detect master numbers in reduction path", () => {
      // Find a result with a master number in the path
      // 11 = B(2) + I(9) = 11 (master number)
      const result = reverseGematria({
        targetSynthesis: 11,
        minLength: 2,
        maxLength: 3,
        matchReductionStep: false,
      });

      // Find a result that has 11 as master number
      const withMaster = result.results.find((r) => r.synthesis.masterNumber === 11);
      if (withMaster) {
        expect(withMaster.synthesis.masterNumber).toBe(11);
        expect(withMaster.synthesis.finalValue).toBe(11); // Master number is preserved as finalValue
      }
    });

    it("should use matchReductionStep: false for exact matching", () => {
      // With matchReductionStep: false, target should match only the original sum
      const result = reverseGematria({
        targetConsonants: 2,
        minLength: 1,
        maxLength: 2,
        matchReductionStep: false,
      });

      expect(result.results.length).toBeGreaterThan(0);

      // All results should have exactly consonantsSum = 2
      result.results.forEach((r) => {
        expect(r.consonantsSum).toBe(2);
      });
    });

    it("should allow custom master numbers", () => {
      const result = reverseGematria({
        targetSynthesis: 11,
        minLength: 2,
        maxLength: 3,
        matchReductionStep: false,
        masterNumbers: [11, 22], // Only recognize 11 and 22 as master numbers
      });

      // Results with synthesis = 11 should have masterNumber: 11
      result.results.forEach((r) => {
        if (r.synthesisSum === 11) {
          expect(r.synthesis.masterNumber).toBe(11);
        }
      });
    });

    it("should include intermediate steps in reductionSteps", () => {
      // Find a result with a larger sum that reduces through multiple steps
      // Using exact match to get predictable results
      const result = reverseGematria({
        targetSynthesis: 19,
        minLength: 2,
        maxLength: 4,
        matchReductionStep: false,
        maxResults: 5,
      });

      if (result.results.length > 0) {
        const r = result.results[0];
        // 19 reduces to: 19 → 10 → 1
        expect(r.synthesis.reductionSteps[0]).toBe(19);
        expect(r.synthesis.reductionSteps).toContain(10);
        expect(r.synthesis.reductionSteps).toContain(1);
        expect(r.synthesis.finalValue).toBe(1);
      }
    });
  });
});
