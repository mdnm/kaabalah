/**
 * Kaabalah-related functions
 */

const hebrewLetterMapping = new Map([
  [
    "A",
    {
      letter: "A",
      hebrewName: "Aleph",
      hebrewCharacter: "א",
      numericValue: 1,
      majorArcana: 1
    }
  ],
  [
    "B",
    {
      letter: "B",
      hebrewName: "Beth",
      hebrewCharacter: "ב",
      numericValue: 2,
      majorArcana: 2
    }
  ],
  [
    "G",
    {
      letter: "G",
      hebrewName: "Gimel",
      hebrewCharacter: "ג",
      numericValue: 3,
      majorArcana: 3
    }
  ],
  [
    "D",
    {
      letter: "D",
      hebrewName: "Daleth",
      hebrewCharacter: "ד",
      numericValue: 4,
      majorArcana: 4
    }
  ],
  [
    "E",
    {
      letter: "E",
      hebrewName: "He",
      hebrewCharacter: "ה",
      numericValue: 5,
      majorArcana: 5
    }
  ],
  [
    "V",
    {
      letter: "V",
      hebrewName: "Vav",
      hebrewCharacter: "ו",
      numericValue: 6,
      majorArcana: 6
    }
  ],
  [
    "U",
    {
      letter: "U",
      hebrewName: "Vav",
      hebrewCharacter: "ו",
      numericValue: 6,
      majorArcana: 6
    }
  ],
  [
    "W",
    {
      letter: "W",
      hebrewName: "Vav",
      hebrewCharacter: "ו",
      numericValue: 6,
      majorArcana: 6
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
    }
  ],
  [
    "Z",
    {
      letter: "Z",
      hebrewName: "Zayin",
      hebrewCharacter: "ז",
      numericValue: 7,
      majorArcana: 7
    }
  ],
  [
    "H",
    {
      letter: "H",
      hebrewName: "Cheth",
      hebrewCharacter: "ח",
      numericValue: 8,
      majorArcana: 8
    }
  ],
  [
    "T",
    {
      letter: "T",
      hebrewName: "Teth",
      hebrewCharacter: "ט",
      numericValue: 9,
      majorArcana: 9
    }
  ],
  [
    "TH",
    {
      letter: "Th",
      hebrewName: "Tav",
      hebrewCharacter: "ת",
      numericValue: 400,
      majorArcana: 22
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
      majorArcana: 18
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
      majorArcana: 18
    }
  ],
  [
    "I",
    {
      letter: "I",
      hebrewName: "Yod",
      hebrewCharacter: "י",
      numericValue: 10,
      majorArcana: 10
    }
  ],
  [
    "J",
    {
      letter: "J",
      hebrewName: "Yod",
      hebrewCharacter: "י",
      numericValue: 10,
      majorArcana: 10
    }
  ],
  [
    "Y",
    {
      letter: "Y",
      hebrewName: "Yod",
      hebrewCharacter: "י",
      numericValue: 10,
      majorArcana: 10
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
      majorArcana: 11
    }
  ],
  [
    "L",
    {
      letter: "L",
      hebrewName: "Lamed",
      hebrewCharacter: "ל",
      numericValue: 30,
      majorArcana: 12
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
      majorArcana: 13
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
      majorArcana: 14
    }
  ],
  [
    "S",
    {
      letter: "S",
      hebrewName: "Samekh",
      hebrewCharacter: "ס",
      numericValue: 60,
      majorArcana: 15
    }
  ],
  [
    "\u00C7",
    {
      letter: "\u00C7",
      hebrewName: "Samekh",
      hebrewCharacter: "ס",
      numericValue: 60,
      majorArcana: 15
    }
  ],
  [
    "O",
    {
      letter: "O",
      hebrewName: "Ayin",
      hebrewCharacter: "ע",
      numericValue: 6,
      numericValueWhenStarting: 70,
      majorArcana: 16
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
      majorArcana: 17
    }
  ],
  [
    "PH",
    {
      letter: "Ph",
      hebrewName: "Pe",
      hebrewCharacter: "פ",
      numericValue: 80,
      majorArcana: 17
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
    }
  ],
  [
    "K",
    {
      letter: "K",
      hebrewName: "Qoph",
      hebrewCharacter: "ק",
      numericValue: 100,
      majorArcana: 19
    }
  ],
  [
    "KH",
    {
      letter: "Kh",
      hebrewName: "Qoph",
      hebrewCharacter: "ק",
      numericValue: 100,
      majorArcana: 19
    }
  ],
  [
    "Q",
    {
      letter: "Q",
      hebrewName: "Qoph",
      hebrewCharacter: "ק",
      numericValue: 100,
      majorArcana: 19
    }
  ],
  [
    "R",
    {
      letter: "R",
      hebrewName: "Resh",
      hebrewCharacter: "ר",
      numericValue: 200,
      majorArcana: 20
    }
  ],
  [
    "SH",
    {
      letter: "Sh",
      hebrewName: "Shin",
      hebrewCharacter: "ש",
      numericValue: 300,
      majorArcana: 21
    }
  ],
  [
    "CH",
    {
      letter: "Ch",
      hebrewName: "Shin",
      hebrewCharacter: "ש",
      numericValue: 300,
      majorArcana: 21
    }
  ],
  [
    "X",
    {
      letter: "X",
      hebrewName: "Shin",
      hebrewCharacter: "ש",
      numericValue: 300,
      majorArcana: 21
    }
  ]
])

// Add special mapping for O at start (Ayin)
hebrewLetterMapping.set('O_START', {
  letter: 'O',
  hebrewName: 'Ayin',
  hebrewCharacter: 'ע',
  numericValue: 70,
  majorArcana: 16
})

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
  return ["A", "E", "I", "O", "U", "Y", "W"].includes(letter)
}

export const calculateGematria = (word: string) => {
  const letters = word.toUpperCase().split("")
  let vowelsSum = 0
  let consonantsSum = 0

  for (let i = 0; i < letters.length; i++) {
    const letter = letters[i]
    const nextLetter = letters[i + 1] || ""

    // Digraphs
    if (["P", "T", "K", "S", "C"].includes(letter) && nextLetter) {
      const combinedLetter = (letter + nextLetter).toUpperCase()
      const isStarting = i === 0
      // -2 here since we're checking 2 letters
      const isEnding = i > 0 && i === letters.length - 2

      const mapping = hebrewLetterMapping.get(combinedLetter)
      if (mapping) {
        let value = mapping.numericValue
        if (isStarting && mapping.numericValueWhenStarting !== undefined) {
          value = mapping.numericValueWhenStarting
        } else if (isEnding && mapping.numericValueWhenEnding !== undefined) {
          value = mapping.numericValueWhenEnding
        }
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

    const isStarting = i === 0
    const isEnding = i > 0 && i === letters.length - 1

    if (mapping) {
      let value = mapping.numericValue
      if (isStarting && mapping.numericValueWhenStarting !== undefined) {
        value = mapping.numericValueWhenStarting
      } else if (isEnding && mapping.numericValueWhenEnding !== undefined) {
        value = mapping.numericValueWhenEnding
      }
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
    }
  }
}