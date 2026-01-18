import { HEBREW_LETTERS } from "../core/constants";
import { createTree } from "../core/factory";
import { SYSTEM as KAABALAH_SYSTEM } from "../core/systems/kaabalah";
import { TreeOfLife } from "../core/tree-of-life";
import { id, LetterTypes, Node, NodeId, parseId } from "../core/types";
import type * as GematriaTypes from "./data";
import * as GematriaData from "./data";

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
): { result?: GematriaTypes.LetterResult; skipNext: boolean } {
  const letter = normalizeLetter(letters[i]).toLocaleUpperCase();
  const nextLetter = letters[i + 1]
    ? normalizeLetter(letters[i + 1]).toLocaleLowerCase()
    : "";
  const combinedLetter = letter + nextLetter;

  if (GematriaData.DIGRAPHS.has(combinedLetter)) {
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

function processWord(word: string, tree: TreeOfLife): GematriaTypes.WordResult {
  const letters = word.split("");
  let i = 0;

  let wordState: GematriaTypes.WordResult = {
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
  prev: GematriaTypes.LetterPercentages
): GematriaTypes.LetterPercentages {
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

/**
 * Internal type for letter info used in reverse gematria
 */
type LetterInfo = {
  letter: string;
  normalValue: number;
  endingValue?: number;
  isVowel: boolean;
  isDigraph: boolean;
  hebrewLetterId: NodeId<LetterTypes.HEBREW_LETTER>;
  hebrewCharacter: string;
  hebrewCharacterWhenEnding?: string;
};

/**
 * Build letter info from the tree for a given latin letter
 */
function buildLetterInfo(
  tree: TreeOfLife,
  letter: string,
  isStarting: boolean
): LetterInfo | undefined {
  const latinLetterId = id(LetterTypes.LATIN_LETTER, letter);
  const latinLetterNode = tree.getNode(latinLetterId);

  if (!latinLetterNode?.data) return undefined;

  const mapping = getLetterMapping({ tree, letterId: latinLetterId, isStarting });
  if (!mapping?.data) return undefined;

  return {
    letter,
    normalValue: mapping.data.gematriaValue,
    endingValue: mapping.data.gematriaValueWhenEnding,
    isVowel: latinLetterNode.data.isVowel,
    isDigraph: GematriaData.DIGRAPHS.has(letter),
    hebrewLetterId: mapping.id,
    hebrewCharacter: mapping.data.character,
    hebrewCharacterWhenEnding: mapping.data.characterWhenEnding,
  };
}

/**
 * Get all available letters for reverse gematria from the tree
 */
function getAvailableLetters(tree: TreeOfLife, includeDigraphs: boolean): string[] {
  const singleLetters = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
    "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
  ];

  // Digraphs use mixed case in LATIN_LETTERS (e.g., "Sh", "Ph", "Th")
  const digraphs = includeDigraphs
    ? Array.from(GematriaData.DIGRAPHS)
    : [];

  return [...singleLetters, ...digraphs];
}

/**
 * Reverse gematria - find letter combinations that match target values
 */
export const reverseGematria = (
  options: GematriaTypes.ReverseGematriaOptions,
  tree?: TreeOfLife
): GematriaTypes.ReverseGematriaOutput => {
  const {
    targetVowels,
    targetConsonants,
    targetSynthesis,
    minLength = 1,
    maxLength = 8,
    maxResults = 100,
    includeDigraphs = true,
  } = options;

  // Validate that at least one target is specified
  if (targetVowels === undefined && targetConsonants === undefined && targetSynthesis === undefined) {
    return { results: [], hasMore: false, totalFound: 0 };
  }

  if (!tree) {
    tree = createTree({ system: KAABALAH_SYSTEM, parts: [] });
  }

  const results: GematriaTypes.ReverseGematriaResult[] = [];
  let totalFound = 0;
  let hasMore = false;

  const availableLetters = getAvailableLetters(tree, includeDigraphs);

  // Cache letter info for performance (but still using tree as source of truth)
  const letterInfoCache = new Map<string, LetterInfo | undefined>();

  const getLetterInfoCached = (letter: string, isStarting: boolean): LetterInfo | undefined => {
    const cacheKey = `${letter}-${isStarting}`;

    if (!letterInfoCache.has(cacheKey)) {
      letterInfoCache.set(cacheKey, buildLetterInfo(tree!, letter, isStarting));
    }

    return letterInfoCache.get(cacheKey);
  };

  // Backtracking search
  // We track running sums using "middle" values (non-ending)
  // When checking a complete combination, we calculate the actual sums with ending values
  const backtrack = (
    currentLetters: string[],
    currentInfos: LetterInfo[],
    runningVowelsSum: number,  // Sum using non-ending values
    runningConsonantsSum: number
  ) => {
    // Early termination if we have enough results
    if (results.length >= maxResults) {
      hasMore = true;
      return;
    }

    const currentLength = currentLetters.length;

    // Check if current combination is valid (considering ending values)
    if (currentLength >= minLength && currentLength <= maxLength) {
      // Calculate actual sums with ending value for last letter
      let actualVowelsSum = runningVowelsSum;
      let actualConsonantsSum = runningConsonantsSum;

      // Adjust for ending value if the last letter has one and there's more than one letter
      if (currentLength > 1) {
        const lastInfo = currentInfos[currentLength - 1];
        if (lastInfo.endingValue !== undefined) {
          const diff = lastInfo.endingValue - lastInfo.normalValue;
          if (lastInfo.isVowel) {
            actualVowelsSum += diff;
          } else {
            actualConsonantsSum += diff;
          }
        }
      }

      const actualSynthesisSum = actualVowelsSum + actualConsonantsSum;

      const matchesVowels = targetVowels === undefined || actualVowelsSum === targetVowels;
      const matchesConsonants = targetConsonants === undefined || actualConsonantsSum === targetConsonants;
      const matchesSynthesis = targetSynthesis === undefined || actualSynthesisSum === targetSynthesis;

      if (matchesVowels && matchesConsonants && matchesSynthesis) {
        totalFound++;
        if (results.length < maxResults) {
          // Build letter details with correct ending values
          const letterDetails: GematriaTypes.LetterResult[] = currentInfos.map((info, idx) => {
            const isEnding = idx === currentLength - 1 && currentLength > 1;
            const useEndingValue = isEnding && info.endingValue !== undefined;

            return {
              latinLetterId: id(LetterTypes.LATIN_LETTER, info.letter),
              value: useEndingValue ? info.endingValue! : info.normalValue,
              hebrewLetterId: info.hebrewLetterId,
              hebrewCharacter: useEndingValue && info.hebrewCharacterWhenEnding
                ? info.hebrewCharacterWhenEnding
                : info.hebrewCharacter,
              isVowel: info.isVowel,
            };
          });

          results.push({
            letters: currentLetters.join("").toUpperCase(),
            letterDetails,
            vowelsSum: actualVowelsSum,
            consonantsSum: actualConsonantsSum,
            synthesisSum: actualSynthesisSum,
          });
        } else {
          hasMore = true;
        }
      }
    }

    // Stop if we've reached max length
    if (currentLength >= maxLength) {
      return;
    }

    // Pruning: if running sums already exceed targets, no point continuing
    // Note: we use running sums (non-ending) for pruning since ending values are >= normal values
    if (targetVowels !== undefined && runningVowelsSum > targetVowels) {
      return;
    }
    if (targetConsonants !== undefined && runningConsonantsSum > targetConsonants) {
      return;
    }
    if (targetSynthesis !== undefined && runningVowelsSum + runningConsonantsSum > targetSynthesis) {
      return;
    }

    // Try adding each letter
    for (const letter of availableLetters) {
      const isStarting = currentLength === 0;

      const letterInfo = getLetterInfoCached(letter, isStarting);
      if (!letterInfo) continue;

      const value = letterInfo.normalValue;
      const newVowelsSum = runningVowelsSum + (letterInfo.isVowel ? value : 0);
      const newConsonantsSum = runningConsonantsSum + (letterInfo.isVowel ? 0 : value);

      // Pruning
      if (targetVowels !== undefined && newVowelsSum > targetVowels) {
        continue;
      }
      if (targetConsonants !== undefined && newConsonantsSum > targetConsonants) {
        continue;
      }
      if (targetSynthesis !== undefined && newVowelsSum + newConsonantsSum > targetSynthesis) {
        continue;
      }

      currentLetters.push(letter);
      currentInfos.push(letterInfo);

      backtrack(currentLetters, currentInfos, newVowelsSum, newConsonantsSum);

      currentLetters.pop();
      currentInfos.pop();

      if (results.length >= maxResults) {
        // We found maxResults and there may be more - set hasMore
        hasMore = true;
        return;
      }
    }
  };

  backtrack([], [], 0, 0);

  return {
    results,
    hasMore,
    totalFound,
  };
};

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

  const initialState: GematriaTypes.GematriaState = {
    includedLetters: [],
    vowelsSum: 0,
    consonantsSum: 0,
    includedGematriaValues: new Set(),
  };

  const finalState = words.reduce<GematriaTypes.GematriaState>((state, word) => {
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

  let letterPercentages: GematriaTypes.LetterPercentages = {
    percentageOfVowels: 0,
    percentageOfConsonants: 0,
    letters: {},
  };

  if (options?.percentages) {
    letterPercentages = words.reduce<GematriaTypes.LetterPercentages>((acc, word) => {
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

export { GematriaData };
