import { HEBREW_LETTERS, Node } from "../core/constants"
import { createTree } from "../core/factory"
import { SYSTEM as KAABALAH_SYSTEM } from "../core/systems/kaabalah"
import { TreeOfLife } from "../core/tree-of-life"

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

export const calculateGematria = (word: string, options: {
  calculateMissingGematriaValues?: boolean;
  calculateLetterPercentages?: boolean;
} = {}, tree?: TreeOfLife) => {
  if (tree && tree.activeSystem !== KAABALAH_SYSTEM) {
    throw new Error(`Gematria calculations require the ${KAABALAH_SYSTEM} system to be loaded`);
  }

  if (!tree) {
    tree = createTree({ system: KAABALAH_SYSTEM, parts: [] })
  }

  const includedLetters: { latinLetterId: string, value: number, hebrewLetterId: string, hebrewCharacter: string, isVowel: boolean }[] = []
  const words = word.toUpperCase().trim().split(" ")
  let vowelsSum = 0
  let consonantsSum = 0

  const includedGematriaValues = new Set<number>()

  const letterPercentages: { percentageOfVowels: number, percentageOfConsonants: number, letters: Record<string, number> } = {
    percentageOfVowels: 0,
    percentageOfConsonants: 0,
    letters: {},
  }

  for (const word of words) {
    const letters = word.split("")

    for (let i = 0; i < letters.length; i++) {
      const letter = letters[i].toLocaleUpperCase()
      const nextLetter = letters[i + 1]?.toLocaleLowerCase() || ""

      // Digraphs
      if (["P", "T", "K", "S", "C"].includes(letter) && nextLetter) {
        const combinedLetter = letter + nextLetter
        // -2 here since we're checking 2 letters
        const isEnding = i > 0 && i === letters.length - 2

        // should only have a single connection
        const latinLetterId = `letter:${combinedLetter}`;
        const [mapping] = tree.walk(latinLetterId, 2, "hebrewLetter") as Node<"hebrewLetter">[]
        if (mapping?.data) {
          let hebrewCharacter = mapping.data.character
          let value = mapping.data.gematriaValue
          if (isEnding && mapping.data.gematriaValueWhenEnding !== undefined && mapping.data.characterWhenEnding !== undefined) {
            hebrewCharacter = mapping.data.characterWhenEnding
            value = mapping.data.gematriaValueWhenEnding
          }

          includedGematriaValues.add(value)
          includedLetters.push({ latinLetterId, value, hebrewLetterId: mapping.id, hebrewCharacter, isVowel: isVowel(letter) })
          consonantsSum += value
          i++
          continue
        }
      }

      // only case we can have multiple connections is with O (Vav and Ayin, but considered Ayin only when starting the word)
      let mapping: Node<"hebrewLetter"> | undefined;
      const latinLetterId = `letter:${letter}`;
      const isStarting = i === 0
      if (isStarting && letter === 'O') {
        mapping = tree.getNode(`letter:${HEBREW_LETTERS.AYIN}`) as Node<"hebrewLetter">;
      } else {
        mapping = (tree.walk(latinLetterId, 2, "hebrewLetter") as Node<"hebrewLetter">[]).at(0)
      }

      const isEnding = i > 0 && i === letters.length - 1
      if (mapping?.data) {
        let value = mapping.data.gematriaValue
        let hebrewCharacter = mapping.data.character
        if (isEnding && mapping.data.gematriaValueWhenEnding !== undefined && mapping.data.characterWhenEnding !== undefined) {
          value = mapping.data.gematriaValueWhenEnding
          hebrewCharacter = mapping.data.characterWhenEnding
        }

        includedGematriaValues.add(value)
        includedLetters.push({ latinLetterId, value, hebrewLetterId: mapping.id, hebrewCharacter, isVowel: isVowel(letter) })

        if (isVowel(letter)) {
          vowelsSum += value
        } else {
          consonantsSum += value
        }
      }
    }

    if (options?.calculateLetterPercentages) {
      const letterCount = letters.length;
      let vowelsCount = 0
      let consonantsCount = 0
  
      for (const letter of new Set(letters)) {
        const occurrences = letters.filter(l => l === letter).length
  
        letterPercentages.letters[letter] = (occurrences / letterCount) * 100
  
        if (isVowel(letter)) {
          vowelsCount += occurrences
        } else {
          consonantsCount += occurrences
        }
      }
  
      letterPercentages.percentageOfVowels = (vowelsCount / letterCount) * 100
      letterPercentages.percentageOfConsonants = (consonantsCount / letterCount) * 100
    }
  }

  const vowelsReduction = reduceToSingleDigitWithSteps(vowelsSum)
  const consonantsReduction = reduceToSingleDigitWithSteps(consonantsSum)
  const synthesisReduction = reduceToSingleDigitWithSteps(
    vowelsSum + consonantsSum
  )

  const missingGematriaValues: { value: number, hebrewLetterId: string, whenEnding: boolean }[] = []
  if (options?.calculateMissingGematriaValues) {
    for (const hebrewLetter of Object.values(HEBREW_LETTERS)) {
      const hebrewLetterId = `letter:${hebrewLetter}`;
      const hebrewLetterNode = tree.getNode(hebrewLetterId) as Node<"hebrewLetter">
      if (!hebrewLetterNode?.data) {
        continue
      }

      if (!includedGematriaValues.has(hebrewLetterNode.data.gematriaValue)) {
        missingGematriaValues.push({
          value: hebrewLetterNode.data.gematriaValue,
          hebrewLetterId,
          whenEnding: false
        })
      }

      if (hebrewLetterNode.data.gematriaValueWhenEnding && !includedGematriaValues.has(hebrewLetterNode.data.gematriaValueWhenEnding)) {
        missingGematriaValues.push({
          value: hebrewLetterNode.data.gematriaValueWhenEnding,
          hebrewLetterId,
          whenEnding: true
        })
      }
    }

    missingGematriaValues.sort((a, b) => a.value - b.value)
  }

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
    includedLetters,
    missingGematriaValues: options?.calculateMissingGematriaValues ? missingGematriaValues : undefined,
    letterPercentages: options?.calculateLetterPercentages ? letterPercentages : undefined,
  }
}