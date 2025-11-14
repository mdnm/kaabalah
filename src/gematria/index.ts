import { HEBREW_LETTERS, LATIN_LETTERS } from "../core/constants";
import { createTree } from "../core/factory";
import { SYSTEM as KAABALAH_SYSTEM } from "../core/systems/kaabalah";
import { TreeOfLife } from "../core/tree-of-life";
import { id, LetterTypes, Node, NodeId, parseId } from "../core/types";

const DIGRAPHS = new Set<string>([
  LATIN_LETTERS.PH,
  LATIN_LETTERS.TS,
  LATIN_LETTERS.TZ,
  LATIN_LETTERS.SH,
  LATIN_LETTERS.CH,
  LATIN_LETTERS.TH,
  LATIN_LETTERS.KH,
]);

const reduceToSingleDigitWithSteps = (num: number) => {
  const steps = [num];
  let currentNum = num;

  while (currentNum > 9) {
    currentNum = String(currentNum)
      .split("")
      .reduce((acc, digit) => acc + parseInt(digit), 0);
    steps.push(currentNum);
  }

  return {
    steps,
    finalValue: currentNum,
  };
};

const getLastArkAnnuStep = (steps: number[]) => {
  if (steps.length === 0) return 0;

  // reverse sort to get the last step
  const step = steps.sort((a, b) => b - a).find((step) => step <= 22);

  return step ?? steps.at(-1) ?? 0;
}

interface LetterResult {
  latinLetterId: NodeId<LetterTypes.LATIN_LETTER>;
  value: number;
  hebrewLetterId: NodeId<LetterTypes.HEBREW_LETTER>;
  hebrewCharacter: string;
  isVowel: boolean;
}

interface WordResult {
  letters: LetterResult[];
  vowelsSum: number;
  consonantsSum: number;
  includedGematriaValues: Set<number>;
}

interface GematriaState {
  includedLetters: LetterResult[];
  vowelsSum: number;
  consonantsSum: number;
  includedGematriaValues: Set<number>;
}

interface LetterPercentages {
  percentageOfVowels: number;
  percentageOfConsonants: number;
  letters: Record<string, number>;
}

function normalizeLetter(letter: string): string {
  if (letter.toUpperCase() === "Ã") return "Ã";
  if (letter.toUpperCase() === "Ç") return "Ç";

  return letter.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getLetterMapping({
  tree,
  letterId,
  isStarting,
}: {
  tree: TreeOfLife;
  letterId: NodeId<LetterTypes.LATIN_LETTER>;
  isStarting: boolean;
}): Node<LetterTypes.HEBREW_LETTER> | undefined {
  if (isStarting && parseId(letterId) === "O") {
    return tree.getNode(id(LetterTypes.HEBREW_LETTER, HEBREW_LETTERS.AYIN));
  }

  return tree.walk(letterId, 2, LetterTypes.HEBREW_LETTER).at(0);
}

function processLetter(
  tree: TreeOfLife,
  letters: string[],
  i: number
): { result?: LetterResult; skipNext: boolean } {
  const letter = normalizeLetter(letters[i]).toLocaleUpperCase();
  const nextLetter = letters[i + 1]
    ? normalizeLetter(letters[i + 1]).toLocaleLowerCase()
    : "";
  const combinedLetter = letter + nextLetter;

  if (DIGRAPHS.has(combinedLetter)) {
    const isEnding = i > 0 && i === letters.length - 2;
    const latinLetterId = id(LetterTypes.LATIN_LETTER, combinedLetter);
    const mapping = getLetterMapping({
      tree,
      letterId: latinLetterId,
      isStarting: false,
    });

    if (!mapping?.data) {
      return { skipNext: false };
    }

    const useWhenEndingValue =
      isEnding &&
      mapping.data.gematriaValueWhenEnding !== undefined &&
      mapping.data.characterWhenEnding !== undefined;

    return {
      result: {
        latinLetterId,
        value: useWhenEndingValue
          ? mapping.data.gematriaValueWhenEnding!
          : mapping.data.gematriaValue,
        hebrewCharacter: useWhenEndingValue
          ? mapping.data.characterWhenEnding!
          : mapping.data.character,
        hebrewLetterId: mapping.id,
        isVowel: false,
      },
      skipNext: true,
    };
  }

  const isStarting = i === 0;
  const latinLetterId = id(LetterTypes.LATIN_LETTER, letter);
  const mapping = getLetterMapping({
    tree,
    letterId: latinLetterId,
    isStarting,
  });

  if (!mapping?.data) {
    return { skipNext: false };
  }

  const isEnding = i > 0 && i === letters.length - 1;
  const latinLetter = tree.getNode(latinLetterId);
  const useWhenEndingValue =
    isEnding &&
    mapping.data.gematriaValueWhenEnding !== undefined &&
    mapping.data.characterWhenEnding !== undefined;

  return {
    result: {
      latinLetterId,
      value: useWhenEndingValue
        ? mapping.data.gematriaValueWhenEnding!
        : mapping.data.gematriaValue,
      hebrewCharacter: useWhenEndingValue
        ? mapping.data.characterWhenEnding!
        : mapping.data.character,
      hebrewLetterId: mapping.id,
      isVowel: latinLetter?.data?.isVowel ?? false,
    },
    skipNext: false,
  };
}

function processWord(word: string, tree: TreeOfLife): WordResult {
  const letters = word.split("");
  let i = 0;

  let wordState: WordResult = {
    letters: [],
    vowelsSum: 0,
    consonantsSum: 0,
    includedGematriaValues: new Set(),
  };

  while (i < letters.length) {
    const { result, skipNext } = processLetter(tree, letters, i);

    if (result) {
      wordState = {
        letters: [...wordState.letters, result],
        vowelsSum: wordState.vowelsSum + (result.isVowel ? result.value : 0),
        consonantsSum:
          wordState.consonantsSum + (result.isVowel ? 0 : result.value),
        includedGematriaValues: new Set([
          ...wordState.includedGematriaValues,
          result.value,
        ]),
      };
    }

    i += skipNext ? 2 : 1;
  }

  return wordState;
}

function calculateLetterPercentages(
  word: string,
  tree: TreeOfLife,
  prev: LetterPercentages
): LetterPercentages {
  const letters = word.split("");
  const letterCount = letters.length;

  let vowelsCount = 0;
  let consonantsCount = 0;

  const newLetters = { ...prev.letters };

  for (const letter of new Set(letters)) {
    const occurrences = letters.filter((l) => l === letter).length;
    const latinLetter = tree.getNode(id(LetterTypes.LATIN_LETTER, letter));
    newLetters[letter] = (occurrences / letterCount) * 100;

    if (latinLetter?.data?.isVowel) {
      vowelsCount += occurrences;
    } else {
      consonantsCount += occurrences;
    }
  }
  return {
    percentageOfVowels: (vowelsCount / letterCount) * 100,
    percentageOfConsonants: (consonantsCount / letterCount) * 100,
    letters: newLetters,
  };
}

function getMissingGematriaValues(
  tree: TreeOfLife,
  includedGematriaValues: Set<number>
) {
  const missingGematriaValues: {
    value: number;
    hebrewLetterId: NodeId<LetterTypes.HEBREW_LETTER>;
    whenEnding: boolean;
  }[] = [];

  for (const hebrewLetter of Object.values(HEBREW_LETTERS)) {
    const hebrewLetterId = id(LetterTypes.HEBREW_LETTER, hebrewLetter);
    const hebrewLetterNode = tree.getNode(hebrewLetterId);

    if (!hebrewLetterNode?.data) continue;

    if (!includedGematriaValues.has(hebrewLetterNode.data.gematriaValue)) {
      missingGematriaValues.push({
        value: hebrewLetterNode.data.gematriaValue,
        hebrewLetterId,
        whenEnding: false,
      });
    }

    if (
      hebrewLetterNode.data.gematriaValueWhenEnding &&
      !includedGematriaValues.has(hebrewLetterNode.data.gematriaValueWhenEnding)
    ) {
      missingGematriaValues.push({
        value: hebrewLetterNode.data.gematriaValueWhenEnding,
        hebrewLetterId,
        whenEnding: true,
      });
    }
  }

  missingGematriaValues.sort((a, b) => a.value - b.value);

  return missingGematriaValues;
}

export const calculateGematria = (
  phrase: string,
  options: {
    missing?: boolean;
    percentages?: boolean;
  } = {
    missing: false,
    percentages: false,
  },
  tree?: TreeOfLife
) => {
  if (!tree) {
    // todo: study the possibility of pre-calculating the mappings
    tree = createTree({ system: KAABALAH_SYSTEM, parts: [] });
  }
  const words = phrase.toUpperCase().trim().split(" ");

  const initialState: GematriaState = {
    includedLetters: [],
    vowelsSum: 0,
    consonantsSum: 0,
    includedGematriaValues: new Set(),
  };

  const finalState = words.reduce<GematriaState>((state, word) => {
    const wordResult = processWord(word, tree);

    return {
      includedLetters: [...state.includedLetters, ...wordResult.letters],
      vowelsSum: state.vowelsSum + wordResult.vowelsSum,
      consonantsSum: state.consonantsSum + wordResult.consonantsSum,
      includedGematriaValues: new Set([
        ...Array.from(state.includedGematriaValues),
        ...Array.from(wordResult.includedGematriaValues),
      ]),
    };
  }, initialState);

  let letterPercentages: LetterPercentages = {
    percentageOfVowels: 0,
    percentageOfConsonants: 0,
    letters: {},
  };

  if (options?.percentages) {
    letterPercentages = words.reduce<LetterPercentages>((acc, word) => {
      return calculateLetterPercentages(word, tree, acc);
    }, letterPercentages);
  }

  const vowelsReduction = reduceToSingleDigitWithSteps(finalState.vowelsSum);
  const consonantsReduction = reduceToSingleDigitWithSteps(
    finalState.consonantsSum
  );
  const synthesisReduction = reduceToSingleDigitWithSteps(
    getLastArkAnnuStep(vowelsReduction.steps) + getLastArkAnnuStep(consonantsReduction.steps)
  );

  const missingGematriaValues = options?.missing
    ? getMissingGematriaValues(tree, finalState.includedGematriaValues)
    : undefined;

  return {
    vowels: {
      originalSum: finalState.vowelsSum,
      reductionSteps: vowelsReduction.steps,
      finalValue: vowelsReduction.finalValue,
    },
    consonants: {
      originalSum: finalState.consonantsSum,
      reductionSteps: consonantsReduction.steps,
      finalValue: consonantsReduction.finalValue,
    },
    synthesis: {
      originalSum: finalState.vowelsSum + finalState.consonantsSum,
      reductionSteps: synthesisReduction.steps,
      finalValue: synthesisReduction.finalValue,
    },
    includedLetters: finalState.includedLetters,
    missingGematriaValues,
    letterPercentages: options?.percentages ? letterPercentages : undefined,
  };
};
