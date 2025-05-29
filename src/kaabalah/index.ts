// Core exports
export { SPHERE_DATA, SPHERES } from './constants';
export { TreeOfLife } from './tree-of-life';

export { createTree, type TreeOptions } from '../core/factory';

export { loadKaabalah } from './loaders/kaabalah';

const hebrewLetterMapping = new Map([
  [
    "A",
    {
      letter: "A",
      hebrewName: "Aleph",
      hebrewCharacter: "א",
      numericValue: 1,
      majorArcana: 1,
      astrologicalEnergy: "Air",
      letterType: "mother"
    }
  ],
  [
    "\u00C3",
    {
      letter: "Ã",
      hebrewName: "Aleph",
      hebrewCharacter: "א",
      numericValue: 5,
      majorArcana: 1,
      astrologicalEnergy: "Air",
      letterType: "mother"
    }
  ],
  [
    "B",
    {
      letter: "B",
      hebrewName: "Beth",
      hebrewCharacter: "ב",
      numericValue: 2,
      majorArcana: 2,
      astrologicalEnergy: "Moon",
      letterType: "double"
    }
  ],
  [
    "G",
    {
      letter: "G",
      hebrewName: "Gimel",
      hebrewCharacter: "ג",
      numericValue: 3,
      majorArcana: 3,
      astrologicalEnergy: "Venus",
      letterType: "double"
    }
  ],
  [
    "D",
    {
      letter: "D",
      hebrewName: "Daleth",
      hebrewCharacter: "ד",
      numericValue: 4,
      majorArcana: 4,
      astrologicalEnergy: "Jupiter",
      letterType: "double"
    }
  ],
  [
    "E",
    {
      letter: "E",
      hebrewName: "He",
      hebrewCharacter: "ה",
      numericValue: 5,
      majorArcana: 5,
      astrologicalEnergy: "Aries",
      letterType: "simple"
    }
  ],
  [
    "V",
    {
      letter: "V",
      hebrewName: "Vav",
      hebrewCharacter: "ו",
      numericValue: 6,
      majorArcana: 6,
      astrologicalEnergy: "Taurus",
      letterType: "simple"
    }
  ],
  [
    "U",
    {
      letter: "U",
      hebrewName: "Vav",
      hebrewCharacter: "ו",
      numericValue: 6,
      majorArcana: 6,
      astrologicalEnergy: "Taurus",
      letterType: "simple"
    }
  ],
  [
    "W",
    {
      letter: "W",
      hebrewName: "Vav",
      hebrewCharacter: "ו",
      numericValue: 6,
      majorArcana: 6,
      astrologicalEnergy: "Taurus",
      letterType: "simple"
    }
  ],
  [
    "O",
    {
      letter: "O",
      hebrewName: "Vav",
      hebrewCharacter: "ו",
      numericValue: 6,
      majorArcana: 6,
      astrologicalEnergy: "Taurus",
      letterType: "simple"
    }
  ],
  [
    "Z",
    {
      letter: "Z",
      hebrewName: "Zayin",
      hebrewCharacter: "ז",
      numericValue: 7,
      majorArcana: 7,
      astrologicalEnergy: "Gemini",
      letterType: "simple"
    }
  ],
  [
    "H",
    {
      letter: "H",
      hebrewName: "Cheth",
      hebrewCharacter: "ח",
      numericValue: 8,
      majorArcana: 8,
      astrologicalEnergy: "Cancer",
      letterType: "simple"
    }
  ],
  [
    "T",
    {
      letter: "T",
      hebrewName: "Teth",
      hebrewCharacter: "ט",
      numericValue: 9,
      majorArcana: 9,
      astrologicalEnergy: "Leo",
      letterType: "simple"
    }
  ],
  [
    "TH",
    {
      letter: "Th",
      hebrewName: "Tav",
      hebrewCharacter: "ת",
      numericValue: 400,
      majorArcana: 22,
      astrologicalEnergy: "Sun",
      letterType: "double"
    }
  ],
  [
    "TS",
    {
      letter: "Ts",
      hebrewName: "Tzaddi",
      hebrewCharacter: "צ",
      numericValue: 90,
      numericValueWhenEnding: 900,
      majorArcana: 18,
      astrologicalEnergy: "Aquarius",
      letterType: "simple"
    }
  ],
  [
    "TZ",
    {
      letter: "Tz",
      hebrewName: "Tzaddi",
      hebrewCharacter: "צ",
      numericValue: 90,
      numericValueWhenEnding: 900,
      majorArcana: 18,
      astrologicalEnergy: "Aquarius",
      letterType: "simple"
    }
  ],
  [
    "I",
    {
      letter: "I",
      hebrewName: "Yod",
      hebrewCharacter: "י",
      numericValue: 10,
      majorArcana: 10,
      astrologicalEnergy: "Virgo",
      letterType: "simple"
    }
  ],
  [
    "J",
    {
      letter: "J",
      hebrewName: "Yod",
      hebrewCharacter: "י",
      numericValue: 10,
      majorArcana: 10,
      astrologicalEnergy: "Virgo",
      letterType: "simple"
    }
  ],
  [
    "Y",
    {
      letter: "Y",
      hebrewName: "Yod",
      hebrewCharacter: "י",
      numericValue: 10,
      majorArcana: 10,
      astrologicalEnergy: "Virgo",
      letterType: "simple"
    }
  ],
  [
    "C",
    {
      letter: "C",
      hebrewName: "Kaph",
      hebrewCharacter: "כ",
      numericValue: 20,
      numericValueWhenEnding: 500,
      majorArcana: 11,
      astrologicalEnergy: "Mars",
      letterType: "double"
    }
  ],
  [
    "L",
    {
      letter: "L",
      hebrewName: "Lamed",
      hebrewCharacter: "ל",
      numericValue: 30,
      majorArcana: 12,
      astrologicalEnergy: "Libra",
      letterType: "simple"
    }
  ],
  [
    "M",
    {
      letter: "M",
      hebrewName: "Mem",
      hebrewCharacter: "מ",
      numericValue: 40,
      numericValueWhenEnding: 600,
      majorArcana: 13,
      astrologicalEnergy: "Water",
      letterType: "mother"
    }
  ],
  [
    "N",
    {
      letter: "N",
      hebrewName: "Nun",
      hebrewCharacter: "נ",
      numericValue: 50,
      numericValueWhenEnding: 700,
      majorArcana: 14,
      astrologicalEnergy: "Scorpio",
      letterType: "simple"
    }
  ],
  [
    "S",
    {
      letter: "S",
      hebrewName: "Samekh",
      hebrewCharacter: "ס",
      numericValue: 60,
      majorArcana: 15,
      astrologicalEnergy: "Sagittarius",
      letterType: "simple"
    }
  ],
  [
    "\u00C7",
    {
      letter: "Ç",
      hebrewName: "Samekh",
      hebrewCharacter: "ס",
      numericValue: 60,
      majorArcana: 15,
      astrologicalEnergy: "Sagittarius",
      letterType: "simple"
    }
  ],
  [
    "P",
    {
      letter: "P",
      hebrewName: "Pe",
      hebrewCharacter: "פ",
      numericValue: 80,
      numericValueWhenEnding: 800,
      majorArcana: 17,
      astrologicalEnergy: "Mercury",
      letterType: "double"
    }
  ],
  [
    "PH",
    {
      letter: "Ph",
      hebrewName: "Pe",
      hebrewCharacter: "פ",
      numericValue: 80,
      numericValueWhenEnding: 800,
      majorArcana: 17,
      astrologicalEnergy: "Mercury",
      letterType: "double"
    }
  ],
  [
    "F",
    {
      letter: "F",
      hebrewName: "Pe",
      hebrewCharacter: "פ",
      numericValue: 80,
      numericValueWhenEnding: 800,
      majorArcana: 17,
      astrologicalEnergy: "Mercury",
      letterType: "double"
    }
  ],
  [
    "K",
    {
      letter: "K",
      hebrewName: "Qoph",
      hebrewCharacter: "ק",
      numericValue: 100,
      majorArcana: 19,
      astrologicalEnergy: "Pisces",
      letterType: "simple"
    }
  ],
  [
    "KH",
    {
      letter: "Kh",
      hebrewName: "Qoph",
      hebrewCharacter: "ק",
      numericValue: 100,
      majorArcana: 19,
      astrologicalEnergy: "Pisces",
      letterType: "simple"
    }
  ],
  [
    "Q",
    {
      letter: "Q",
      hebrewName: "Qoph",
      hebrewCharacter: "ק",
      numericValue: 100,
      majorArcana: 19,
      astrologicalEnergy: "Pisces",
      letterType: "simple"
    }
  ],
  [
    "R",
    {
      letter: "R",
      hebrewName: "Resh",
      hebrewCharacter: "ר",
      numericValue: 200,
      majorArcana: 20,
      astrologicalEnergy: "Saturn",
      letterType: "double"
    }
  ],
  [
    "SH",
    {
      letter: "Sh",
      hebrewName: "Shin",
      hebrewCharacter: "ש",
      numericValue: 300,
      majorArcana: 21,
      astrologicalEnergy: "Fire",
      letterType: "mother"
    }
  ],
  [
    "CH",
    {
      letter: "Ch",
      hebrewName: "Shin",
      hebrewCharacter: "ש",
      numericValue: 300,
      majorArcana: 21,
      astrologicalEnergy: "Fire",
      letterType: "mother"
    }
  ],
  [
    "X",
    {
      letter: "X",
      hebrewName: "Shin",
      hebrewCharacter: "ש",
      numericValue: 300,
      majorArcana: 21,
      astrologicalEnergy: "Fire",
      letterType: "mother"
    }
  ]
])

// Add special mapping for O at start (Ayin)
hebrewLetterMapping.set('O_START', {
  letter: 'O',
  hebrewName: 'Ayin',
  hebrewCharacter: 'ע',
  numericValue: 70,
  majorArcana: 16,
  astrologicalEnergy: "Capricorn",
  letterType: "simple"
})

const allGematriaNumbers = new Map<number, Set<string>>([
  [1, new Set(["A"])],
  [2, new Set(["B"])],
  [3, new Set(["G"])],
  [4, new Set(["D"])],
  [5, new Set(["E", "Ã"])],
  [6, new Set(["V", "U", "W", "O"])],
  [7, new Set(["Z"])],
  [8, new Set(["H"])],
  [9, new Set(["T"])],
  [10, new Set(["I", "J", "Y"])],
  [20, new Set(["C"])],
  [30, new Set(["L"])],
  [40, new Set(["M"])],
  [50, new Set(["N"])],
  [60, new Set(["S"])],
  [70, new Set(["O"])],
  [80, new Set(["P", "F", "Ph"])],
  [90, new Set(["Ts", "Tz"])],
  [100, new Set(["K", "Kh", "Q"])],
  [200, new Set(["R"])],
  [300, new Set(["Sh", "Ch", "X", "Ç"])],
  [400, new Set(["Th"])],
  [500, new Set(["C"])],
  [600, new Set(["M"])],
  [700, new Set(["N"])],
  [800, new Set(["P", "F", "Ph"])],
  [900, new Set(["Ts", "Tz"])],
])

const reduceToSingleDigitWithSteps = (num: number) => {
  const steps = [num]
  let currentNum = num

  while (currentNum > 9) {
    currentNum = String(currentNum)
      .split("")
      .reduce((acc, digit) => acc + parseInt(digit), 0)
    steps.push(currentNum)
  }

  return {
    steps,
    finalValue: currentNum
  }
}

const isVowel = (letter: string) => {
  return ["A", "Ã", "E", "I", "O", "U", "Y", "W"].includes(letter)
}

export const calculateGematria = (word: string) => {
  const letters = word.toUpperCase().split("")
  let vowelsSum = 0
  let consonantsSum = 0

  const presentGematriaNumbers = new Set<number>()

  for (let i = 0; i < letters.length; i++) {
    const letter = letters[i]
    const nextLetter = letters[i + 1] || ""

    // Digraphs
    if (["P", "T", "K", "S", "C"].includes(letter) && nextLetter) {
      const combinedLetter = (letter + nextLetter).toUpperCase()
      // -2 here since we're checking 2 letters
      const isEnding = i > 0 && i === letters.length - 2

      const mapping = hebrewLetterMapping.get(combinedLetter)
      if (mapping) {
        let value = mapping.numericValue
        if (isEnding && mapping.numericValueWhenEnding !== undefined) {
          value = mapping.numericValueWhenEnding
        }
        presentGematriaNumbers.add(value)
        consonantsSum += value
        i++
        continue
      }
    }

    // Special case: O at start (Ayin)
    let mapping
    if (letter === 'O' && i === 0 && hebrewLetterMapping.has('O_START')) {
      mapping = hebrewLetterMapping.get('O_START')
    } else {
      mapping = hebrewLetterMapping.get(letter)
    }

    const isEnding = i > 0 && i === letters.length - 1
    if (mapping) {
      let value = mapping.numericValue
      if (isEnding && mapping.numericValueWhenEnding !== undefined) {
        value = mapping.numericValueWhenEnding
      }

      presentGematriaNumbers.add(value)

      if (isVowel(letter)) {
        vowelsSum += value
      } else {
        consonantsSum += value
      }
    }
  }

  const vowelsReduction = reduceToSingleDigitWithSteps(vowelsSum)
  const consonantsReduction = reduceToSingleDigitWithSteps(consonantsSum)
  const synthesisReduction = reduceToSingleDigitWithSteps(
    vowelsSum + consonantsSum
  )

  const missingGematriaNumbers: { number: number, letters: string[] }[] = []
  for (const [num, lettersSet] of allGematriaNumbers.entries()) {
    if (!presentGematriaNumbers.has(num)) {
      missingGematriaNumbers.push({
        number: num,
        letters: Array.from(lettersSet)
      })
    }
  }
  missingGematriaNumbers.sort((a, b) => a.number - b.number)

  return {
    vowels: {
      originalSum: vowelsSum,
      reductionSteps: vowelsReduction.steps,
      finalValue: vowelsReduction.finalValue
    },
    consonants: {
      originalSum: consonantsSum,
      reductionSteps: consonantsReduction.steps,
      finalValue: consonantsReduction.finalValue
    },
    synthesis: {
      originalSum: vowelsSum + consonantsSum,
      reductionSteps: synthesisReduction.steps,
      finalValue: synthesisReduction.finalValue
    },
    missingGematriaNumbers
  }
}