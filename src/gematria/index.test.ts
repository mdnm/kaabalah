import { describe, expect, it } from 'vitest'
import { HEBREW_LETTERS } from '../core'
import { calculateGematria } from './index'

const getSums = (result: ReturnType<typeof calculateGematria>) => ({
  vowels: result.vowels.originalSum,
  consonants: result.consonants.originalSum,
  synthesis: result.synthesis.originalSum,
})

describe('calculateGematria', () => {
  it('should calculate correct values for each single letter', () => {
    const cases = [
      // Letter, expected vowel, expected consonant
      ['A', 1, 0],
      ['B', 0, 2],
      ['G', 0, 3],
      ['D', 0, 4],
      ['E', 5, 0],
      ['V', 0, 6],
      ['U', 6, 0], 
      ['W', 6, 0], 
      ['Z', 0, 7],
      ['H', 0, 8],
      ['T', 0, 9],
      ['I', 10, 0],
      ['J', 0, 10],
      ['Y', 10, 0],
      ['C', 0, 20],
      ['L', 0, 30],
      ['M', 0, 40],
      ['N', 0, 50],
      ['S', 0, 60],
      ['Ç', 0, 60],
      ['P', 0, 80],
      ['PH', 0, 80],
      ['F', 0, 80],
      ['TS', 0, 90],
      ['TZ', 0, 90],
      ['K', 0, 100],
      ['KH', 0, 100],
      ['Q', 0, 100],
      ['R', 0, 200],
      ['SH', 0, 300],
      ['X', 0, 300],
      ['TH', 0, 400],
    ]
    cases.forEach(([input, expectedVowel, expectedConsonant]) => {
      const result = calculateGematria(input as string)
      expect(result.vowels.originalSum).toBe(expectedVowel)
      expect(result.consonants.originalSum).toBe(expectedConsonant)
    })
  })

  it('should handle starting and ending values correctly', () => {
    // O at start = Ayin (70), O elsewhere = Vav (6)
    expect(getSums(calculateGematria('O'))).toEqual({ vowels: 70, consonants: 0, synthesis: 70 })
    expect(getSums(calculateGematria('ORTO'))).toEqual({ vowels: 76, consonants: 209, synthesis: 285 }) // O in middle = Vav (6)
    // C at end = Kaph sofit (500)
    expect(getSums(calculateGematria('ABC'))).toEqual({ vowels: 1, consonants: 502, synthesis: 503 })
    expect(getSums(calculateGematria('ABCC'))).toEqual({ vowels: 1, consonants: 522, synthesis: 523 })
    // M at end = Mem sofit (600)
    expect(getSums(calculateGematria('AM'))).toEqual({ vowels: 1, consonants: 600, synthesis: 601 })
    expect(getSums(calculateGematria('MAM'))).toEqual({ vowels: 1, consonants: 640, synthesis: 641 })
    // N at end = Nun sofit (700)
    expect(getSums(calculateGematria('AN'))).toEqual({ vowels: 1, consonants: 700, synthesis: 701 })
    expect(getSums(calculateGematria('NAN'))).toEqual({ vowels: 1, consonants: 750, synthesis: 751 })
    // P at end = Pe sofit (800)
    expect(getSums(calculateGematria('AP'))).toEqual({ vowels: 1, consonants: 800, synthesis: 801 })
    expect(getSums(calculateGematria('PAP'))).toEqual({ vowels: 1, consonants: 880, synthesis: 881 })
    // TZ at end = Tzaddi sofit (900)
    expect(getSums(calculateGematria('ATZ'))).toEqual({ vowels: 1, consonants: 900, synthesis: 901 })
  })

  it('should calculate correct values for real names', () => {
    // Example: "DAVID" = D(4)+A(1)+V(6)+I(10)+D(4)
    expect(getSums(calculateGematria('DAVID'))).toEqual({ vowels: 11, consonants: 14, synthesis: 25 })
    // Example: "MICHAEL" = M(40)+I(10)+CH(300)+A(1)+E(5)+L(30)
    expect(getSums(calculateGematria('MICHAEL'))).toEqual({ vowels: 16, consonants: 370, synthesis: 386 })
    // Example: "SARAH" = S(60)+A(1)+R(200)+A(1)+H(8)
    expect(getSums(calculateGematria('SARAH'))).toEqual({ vowels: 2, consonants: 268, synthesis: 270 })
    // Example: "JOSHUA" = J(10)+O(6)+SH(300)+U(6)+A(1)
    expect(getSums(calculateGematria('JOSHUA'))).toEqual({ vowels: 13, consonants: 310, synthesis: 323 })
    // Example: "RACHEL" = R(200)+A(1)+CH(300)+E(5)+L(30)
    expect(getSums(calculateGematria('RACHEL'))).toEqual({ vowels: 6, consonants: 530, synthesis: 536 })
    // Example: "JOÃO" = J(10)+O(6)+Ã(5)+O(6)
    expect(getSums(calculateGematria('JOÃO'))).toEqual({ vowels: 17, consonants: 10, synthesis: 27 })
  })

  it('should handle empty and non-letter input gracefully', () => {
    expect(getSums(calculateGematria(''))).toEqual({ vowels: 0, consonants: 0, synthesis: 0 })
    expect(getSums(calculateGematria('123!@#'))).toEqual({ vowels: 0, consonants: 0, synthesis: 0 })
  })

  it('should calculate missing letters', () => {
    expect(calculateGematria('ABCDEFGHIJKLMNOPQRSTUVWXYZ', { calculateMissingGematriaNumbers: true }).missingGematriaNumbers).toEqual([
      {"letter": HEBREW_LETTERS.AIN, "number": 70},
      {"letter": HEBREW_LETTERS.TSADI, "number": 90},
      {"letter": HEBREW_LETTERS.TAV, "number": 400},
      {"letter": `${HEBREW_LETTERS.KAF} (on ending)`, "number": 500},
      {"letter": `${HEBREW_LETTERS.MEM} (on ending)`, "number": 600},
      {"letter": `${HEBREW_LETTERS.NUN} (on ending)`, "number": 700},
      {"letter": `${HEBREW_LETTERS.PE} (on ending)`, "number": 800},
      {"letter": `${HEBREW_LETTERS.TSADI} (on ending)`, "number": 900},
    ])
    expect(calculateGematria('OABCDEFGHIJKLMNOPQRSTUVWXYZ', { calculateMissingGematriaNumbers: true }).missingGematriaNumbers).toEqual([
      {"letter": HEBREW_LETTERS.TSADI, "number": 90},
      {"letter": HEBREW_LETTERS.TAV, "number": 400},
      {"letter": `${HEBREW_LETTERS.KAF} (on ending)`, "number": 500},
      {"letter": `${HEBREW_LETTERS.MEM} (on ending)`, "number": 600},
      {"letter": `${HEBREW_LETTERS.NUN} (on ending)`, "number": 700},
      {"letter": `${HEBREW_LETTERS.PE} (on ending)`, "number": 800},
      {"letter": `${HEBREW_LETTERS.TSADI} (on ending)`, "number": 900},
    ])
    expect(calculateGematria('TZTHABCDEFGHIJKLMNOPQRSTUVWXYZTS', { calculateMissingGematriaNumbers: true }).missingGematriaNumbers).toEqual([
      {"letter": HEBREW_LETTERS.AIN, "number": 70},
      {"letter": `${HEBREW_LETTERS.KAF} (on ending)`, "number": 500},
      {"letter": `${HEBREW_LETTERS.MEM} (on ending)`, "number": 600},
      {"letter": `${HEBREW_LETTERS.NUN} (on ending)`, "number": 700},
      {"letter": `${HEBREW_LETTERS.PE} (on ending)`, "number": 800},
    ])
    expect(calculateGematria('TZTHABCDEFGHIJKLMNOPQRSTUVWXYZC', { calculateMissingGematriaNumbers: true }).missingGematriaNumbers).toEqual([
      {"letter": HEBREW_LETTERS.AIN, "number": 70},
      {"letter": `${HEBREW_LETTERS.MEM} (on ending)`, "number": 600},
      {"letter": `${HEBREW_LETTERS.NUN} (on ending)`, "number": 700},
      {"letter": `${HEBREW_LETTERS.PE} (on ending)`, "number": 800},
      {"letter": `${HEBREW_LETTERS.TSADI} (on ending)`, "number": 900},
    ])
    expect(calculateGematria('TZTHABCDEFGHIJKLMNOPQRSTUVWXYZM', { calculateMissingGematriaNumbers: true }).missingGematriaNumbers).toEqual([
      {"letter": HEBREW_LETTERS.AIN, "number": 70},
      {"letter": `${HEBREW_LETTERS.KAF} (on ending)`, "number": 500},
      {"letter": `${HEBREW_LETTERS.NUN} (on ending)`, "number": 700},
      {"letter": `${HEBREW_LETTERS.PE} (on ending)`, "number": 800},
      {"letter": `${HEBREW_LETTERS.TSADI} (on ending)`, "number": 900},
    ])
    expect(calculateGematria('TZTHABCDEFGHIJKLMNOPQRSTUVWXYZN', { calculateMissingGematriaNumbers: true }).missingGematriaNumbers).toEqual([
      {"letter": HEBREW_LETTERS.AIN, "number": 70},
      {"letter": `${HEBREW_LETTERS.KAF} (on ending)`, "number": 500},
      {"letter": `${HEBREW_LETTERS.MEM} (on ending)`, "number": 600},
      {"letter": `${HEBREW_LETTERS.PE} (on ending)`, "number": 800},
      {"letter": `${HEBREW_LETTERS.TSADI} (on ending)`, "number": 900},
    ])
    expect(calculateGematria('TZTHABCDEFGHIJKLMNOPQRSTUVWXYZP', { calculateMissingGematriaNumbers: true }).missingGematriaNumbers).toEqual([
      {"letter": HEBREW_LETTERS.AIN, "number": 70},
      {"letter": `${HEBREW_LETTERS.KAF} (on ending)`, "number": 500},
      {"letter": `${HEBREW_LETTERS.MEM} (on ending)`, "number": 600},
      {"letter": `${HEBREW_LETTERS.NUN} (on ending)`, "number": 700},
      {"letter": `${HEBREW_LETTERS.TSADI} (on ending)`, "number": 900},
    ])
  })

  it('should calculate letter percentages', () => {
    expect(calculateGematria('KAABALAH', { calculateLetterPercentage: true }).letterPercentages).toEqual({
      percentageOfVowels: 50,
      percentageOfConsonants: 50,
      letters: {
        "A": 50,
        "B": 12.5,
        "H": 12.5,
        "K": 12.5,
        "L": 12.5,
      }
    })

    const { letterPercentages } = calculateGematria('MATEUS MOURA', { calculateLetterPercentage: true })

    expect((letterPercentages?.percentageOfConsonants ?? 0) + (letterPercentages?.percentageOfVowels ?? 0)).toEqual(100)
    expect(letterPercentages?.percentageOfConsonants).toEqual(40)
    expect(letterPercentages?.percentageOfVowels).toEqual(60)
    expect(letterPercentages?.letters.A).toEqual(20)
    expect(letterPercentages?.letters.E?.toFixed(2)).toBeCloseTo(16.67)
    expect(letterPercentages?.letters.M).toEqual(20)
    expect(letterPercentages?.letters.O).toEqual(20)
    expect(letterPercentages?.letters.R).toEqual(20)
    expect(letterPercentages?.letters.S?.toFixed(2)).toBeCloseTo(16.67)
    expect(letterPercentages?.letters.T?.toFixed(2)).toBeCloseTo(16.67)
    expect(letterPercentages?.letters.U).toEqual(20)
  })

  it('should correctly handle multiple words', () => {
    const { consonants, vowels } = calculateGematria('MATEUM OURA')

    // M in the end on first word so 600 instead of 40 and O in the start on second word so 70 instead of 6
    expect(consonants.originalSum).toEqual(849)
    expect(vowels.originalSum).toEqual(89)
  })

  it('should correctly return the included letters', () => {
    const { includedLetters } = calculateGematria('MATEUS MOURA')

    // it's a map so letters only appear once
    expect(includedLetters.size).toEqual(8)
    expect(includedLetters.get('letter:M')).toMatchObject({ letter: 'M', value: 40, hebrewLetter: { id: 'letter:מ', data: { gematriaValue: 40 } }, isVowel: false })
    expect(includedLetters.get('letter:O')).toMatchObject({ letter: 'O', value: 6, hebrewLetter: { id: 'letter:ו', data: { gematriaValue: 6 } }, isVowel: true })
  })
}) 