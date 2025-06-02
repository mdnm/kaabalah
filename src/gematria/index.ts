import { HEBREW_LETTERS, Node, NodeData, NodeId } from "../core/constants"
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
  calculateMissingGematriaNumbers?: boolean;
  calculateLetterPercentage?: boolean;
} = {}, tree?: TreeOfLife) => {
  if (tree && tree.activeSystem !== KAABALAH_SYSTEM) {
    throw new Error(`Gematria calculations require the ${KAABALAH_SYSTEM} system to be loaded`);
  }

  if (!tree) {
    tree = createTree({ system: KAABALAH_SYSTEM, parts: [] })
  }

  const includedLetters = new Map<NodeId, { letter: string, value: number, hebrewLetter: { id: NodeId, data: NodeData<"hebrewLetter"> }, isVowel: boolean }>()
  const words = word.toUpperCase().trim().split(" ")
  let vowelsSum = 0
  let consonantsSum = 0

  const presentGematriaNumbers = new Set<number>()

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
          let value = mapping.data.gematriaValue
          if (isEnding && mapping.data.gematriaValueWhenEnding !== undefined) {
            value = mapping.data.gematriaValueWhenEnding
          }

          presentGematriaNumbers.add(value)
          includedLetters.set(latinLetterId, { letter: combinedLetter, value, hebrewLetter: { id: mapping.id, data: mapping.data }, isVowel: isVowel(letter) })
          consonantsSum += value
          i++
          continue
        }
      }

      // only case we can have multiple connections is with O (Vav and Ayin, but considered Ayin only when starting the word)
      let mapping: Node<"hebrewLetter"> | undefined;
      let latinLetterId = `letter:${letter}`;
      const isStarting = i === 0
      if (isStarting && letter === 'O') {
        latinLetterId = `letter:${HEBREW_LETTERS.AIN}`;
        mapping = tree.getNode(latinLetterId) as Node<"hebrewLetter">;
      } else {
        mapping = (tree.walk(latinLetterId, 2, "hebrewLetter") as Node<"hebrewLetter">[]).at(0)
      }

      const isEnding = i > 0 && i === letters.length - 1
      if (mapping?.data) {
        let value = mapping.data.gematriaValue
        if (isEnding && mapping.data.gematriaValueWhenEnding !== undefined) {
          value = mapping.data.gematriaValueWhenEnding
        }

        presentGematriaNumbers.add(value)
        includedLetters.set(latinLetterId, { letter, value, hebrewLetter: { id: mapping.id, data: mapping.data }, isVowel: isVowel(letter) })

        if (isVowel(letter)) {
          vowelsSum += value
        } else {
          consonantsSum += value
        }
      }
    }

    if (options?.calculateLetterPercentage) {
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

  const missingGematriaNumbers: { number: number, letter: string }[] = []
  if (options?.calculateMissingGematriaNumbers) {
    for (const hebrewLetter of Object.values(HEBREW_LETTERS)) {
      const hebrewLetterNode = tree.getNode(`letter:${hebrewLetter}`) as Node<"hebrewLetter">
      if (!hebrewLetterNode?.data) {
        continue
      }

      if (!presentGematriaNumbers.has(hebrewLetterNode.data.gematriaValue)) {
        missingGematriaNumbers.push({
          number: hebrewLetterNode.data.gematriaValue,
          letter: hebrewLetter
        })
      }

      if (hebrewLetterNode.data.gematriaValueWhenEnding && !presentGematriaNumbers.has(hebrewLetterNode.data.gematriaValueWhenEnding)) {
        missingGematriaNumbers.push({
          number: hebrewLetterNode.data.gematriaValueWhenEnding,
          letter: `${hebrewLetter} (on ending)`
        })
      }
    }
    missingGematriaNumbers.sort((a, b) => a.number - b.number)
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
    includedLetters: includedLetters,
    missingGematriaNumbers: options?.calculateMissingGematriaNumbers ? missingGematriaNumbers : undefined,
    letterPercentages: options?.calculateLetterPercentage ? letterPercentages : undefined,
  }
}