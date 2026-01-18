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

/**
 * Reduce a number to a single digit, preserving master numbers.
 * Tracks all reduction steps and detects master numbers in the path.
 *
 * @param num - The number to reduce
 * @param masterNumbers - Master numbers to preserve (default: EXTENDED_MASTER_NUMBERS)
 * @returns ReductionInfo with originalSum, reductionSteps, finalValue, and optional masterNumber
 */
const reduceWithMasterNumbers = (
  num: number,
  masterNumbers: readonly number[] | number[] = GematriaData.EXTENDED_MASTER_NUMBERS
): GematriaTypes.ReductionInfo => {
  const steps = [num];
  let current = num;
  let masterNumber: number | undefined;

  while (current > 9) {
    // Check if current is a master number
    if (masterNumbers.includes(current)) {
      masterNumber = current;
      break;
    }
    // Reduce by summing digits
    current = String(current)
      .split("")
      .reduce((acc, digit) => acc + parseInt(digit), 0);
    steps.push(current);
  }

  // Continue reducing past master number to get finalValue (1-9)
  let finalValue = current;
  if (masterNumber && finalValue > 9) {
    while (finalValue > 9) {
      finalValue = String(finalValue)
        .split("")
        .reduce((acc, d) => acc + parseInt(d), 0);
      steps.push(finalValue);
    }
  }

  return {
    originalSum: num,
    reductionSteps: steps,
    finalValue: masterNumber ?? steps[steps.length - 1],
    masterNumber,
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
 * Parse a suggestion text into letter units (handling digraphs)
 */
function parseSuggestionToLetterUnits(text: string): string[] {
  const upper = text.toUpperCase();
  const units: string[] = [];
  let i = 0;

  while (i < upper.length) {
    const char = upper[i];

    // Check for digraphs (two-character combinations)
    if (i + 1 < upper.length) {
      const twoChar = char + upper[i + 1].toLowerCase();
      if (GematriaData.DIGRAPHS.has(twoChar)) {
        units.push(twoChar);
        i += 2;
        continue;
      }
    }

    // Single character (including spaces)
    units.push(char);
    i += 1;
  }

  return units;
}

/**
 * Count occurrences of each letter unit in an array
 */
function countLetterUnits(units: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const unit of units) {
    counts.set(unit, (counts.get(unit) || 0) + 1);
  }
  return counts;
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
    maxLetterRepeat,
    suggestionText,
    suggestionMode = "subsequence",
    matchReductionStep = true,
    masterNumbers = GematriaData.EXTENDED_MASTER_NUMBERS as unknown as number[],
  } = options;

  // Validate that at least one target is specified
  if (targetVowels === undefined && targetConsonants === undefined && targetSynthesis === undefined) {
    return { results: [], hasMore: false, totalFound: 0 };
  }

  if (!tree) {
    tree = createTree({ system: KAABALAH_SYSTEM, parts: [] });
  }

  // If suggestionText is provided, use the appropriate mode
  if (suggestionText !== undefined) {
    if (suggestionMode === "subsequence") {
      return reverseGematriaFromSubsequence(options, tree);
    } else {
      return reverseGematriaAnagram(options, tree);
    }
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
    runningConsonantsSum: number,
    letterCounts: Map<string, number>  // Track letter repetition counts
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

      // Calculate reduction info for matching
      const vowelsReduction = reduceWithMasterNumbers(actualVowelsSum, masterNumbers);
      const consonantsReduction = reduceWithMasterNumbers(actualConsonantsSum, masterNumbers);
      const synthesisReduction = reduceWithMasterNumbers(actualSynthesisSum, masterNumbers);

      // Match against reduction steps if enabled, otherwise exact match
      const matchesVowels = targetVowels === undefined ||
        (matchReductionStep
          ? vowelsReduction.reductionSteps.includes(targetVowels)
          : actualVowelsSum === targetVowels);
      const matchesConsonants = targetConsonants === undefined ||
        (matchReductionStep
          ? consonantsReduction.reductionSteps.includes(targetConsonants)
          : actualConsonantsSum === targetConsonants);
      const matchesSynthesis = targetSynthesis === undefined ||
        (matchReductionStep
          ? synthesisReduction.reductionSteps.includes(targetSynthesis)
          : actualSynthesisSum === targetSynthesis);

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
            vowels: vowelsReduction,
            consonants: consonantsReduction,
            synthesis: synthesisReduction,
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
    // Note: only prune when not using reduction step matching
    if (!matchReductionStep) {
      if (targetVowels !== undefined && runningVowelsSum > targetVowels) {
        return;
      }
      if (targetConsonants !== undefined && runningConsonantsSum > targetConsonants) {
        return;
      }
      if (targetSynthesis !== undefined && runningVowelsSum + runningConsonantsSum > targetSynthesis) {
        return;
      }
    }

    // Try adding each letter
    for (const letter of availableLetters) {
      const isStarting = currentLength === 0;

      const letterInfo = getLetterInfoCached(letter, isStarting);
      if (!letterInfo) continue;

      // Check maxLetterRepeat constraint
      if (maxLetterRepeat !== undefined) {
        const currentCount = letterCounts.get(letter) || 0;
        if (currentCount >= maxLetterRepeat) {
          continue;
        }
      }

      const value = letterInfo.normalValue;
      const newVowelsSum = runningVowelsSum + (letterInfo.isVowel ? value : 0);
      const newConsonantsSum = runningConsonantsSum + (letterInfo.isVowel ? 0 : value);

      // Pruning - only prune when not using reduction step matching
      if (!matchReductionStep) {
        if (targetVowels !== undefined && newVowelsSum > targetVowels) {
          continue;
        }
        if (targetConsonants !== undefined && newConsonantsSum > targetConsonants) {
          continue;
        }
        if (targetSynthesis !== undefined && newVowelsSum + newConsonantsSum > targetSynthesis) {
          continue;
        }
      }

      currentLetters.push(letter);
      currentInfos.push(letterInfo);
      letterCounts.set(letter, (letterCounts.get(letter) || 0) + 1);

      backtrack(currentLetters, currentInfos, newVowelsSum, newConsonantsSum, letterCounts);

      currentLetters.pop();
      currentInfos.pop();
      letterCounts.set(letter, letterCounts.get(letter)! - 1);

      if (results.length >= maxResults) {
        // We found maxResults and there may be more - set hasMore
        hasMore = true;
        return;
      }
    }
  };

  backtrack([], [], 0, 0, new Map());

  return {
    results,
    hasMore,
    totalFound,
  };
};

/**
 * Reverse gematria from anagram mode - use letters from suggestion as a pool
 */
function reverseGematriaAnagram(
  options: GematriaTypes.ReverseGematriaOptions,
  tree: TreeOfLife
): GematriaTypes.ReverseGematriaOutput {
  const {
    targetVowels,
    targetConsonants,
    targetSynthesis,
    minLength = 1,
    maxLength = 8,
    maxResults = 100,
    maxLetterRepeat,
    suggestionText = "",
    matchReductionStep = true,
    masterNumbers = GematriaData.EXTENDED_MASTER_NUMBERS as unknown as number[],
  } = options;

  const results: GematriaTypes.ReverseGematriaResult[] = [];
  let totalFound = 0;
  let hasMore = false;

  // Parse suggestion into letter units
  const suggestionUnits = parseSuggestionToLetterUnits(suggestionText);

  // Separate spaces from letters
  const letterUnits = suggestionUnits.filter((u) => u !== " ");
  const maxSpaces = suggestionUnits.filter((u) => u === " ").length;

  // Build available letter pool with counts
  const availablePool = countLetterUnits(letterUnits);

  // Get unique letters from the pool
  const availableLetters = Array.from(availablePool.keys());

  // Cache letter info
  const letterInfoCache = new Map<string, LetterInfo | undefined>();

  const getLetterInfoCached = (letter: string, isStarting: boolean): LetterInfo | undefined => {
    const cacheKey = `${letter}-${isStarting}`;
    if (!letterInfoCache.has(cacheKey)) {
      letterInfoCache.set(cacheKey, buildLetterInfo(tree, letter, isStarting));
    }
    return letterInfoCache.get(cacheKey);
  };

  // Track which results we've already seen (to avoid duplicates from space insertion)
  const seenResults = new Set<string>();

  const backtrack = (
    currentLetters: string[],
    currentInfos: LetterInfo[],
    runningVowelsSum: number,
    runningConsonantsSum: number,
    letterCounts: Map<string, number>,
    usedFromPool: Map<string, number>,
    spacesUsed: number
  ) => {
    if (results.length >= maxResults) {
      hasMore = true;
      return;
    }

    const letterOnlyLength = currentLetters.filter((l) => l !== " ").length;

    // Check if current combination is valid
    if (letterOnlyLength >= minLength && letterOnlyLength <= maxLength) {
      let actualVowelsSum = runningVowelsSum;
      let actualConsonantsSum = runningConsonantsSum;

      // Adjust for ending value
      if (currentInfos.length > 1) {
        const lastInfo = currentInfos[currentInfos.length - 1];
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

      // Calculate reduction info for matching
      const vowelsReduction = reduceWithMasterNumbers(actualVowelsSum, masterNumbers);
      const consonantsReduction = reduceWithMasterNumbers(actualConsonantsSum, masterNumbers);
      const synthesisReduction = reduceWithMasterNumbers(actualSynthesisSum, masterNumbers);

      // Match against reduction steps if enabled, otherwise exact match
      const matchesVowels = targetVowels === undefined ||
        (matchReductionStep
          ? vowelsReduction.reductionSteps.includes(targetVowels)
          : actualVowelsSum === targetVowels);
      const matchesConsonants = targetConsonants === undefined ||
        (matchReductionStep
          ? consonantsReduction.reductionSteps.includes(targetConsonants)
          : actualConsonantsSum === targetConsonants);
      const matchesSynthesis = targetSynthesis === undefined ||
        (matchReductionStep
          ? synthesisReduction.reductionSteps.includes(targetSynthesis)
          : actualSynthesisSum === targetSynthesis);

      if (matchesVowels && matchesConsonants && matchesSynthesis) {
        const lettersStr = currentLetters.join("").toUpperCase();

        if (!seenResults.has(lettersStr)) {
          seenResults.add(lettersStr);
          totalFound++;

          if (results.length < maxResults) {
            const letterDetails: GematriaTypes.LetterResult[] = currentInfos.map((info, idx) => {
              const isEnding = idx === currentInfos.length - 1 && currentInfos.length > 1;
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
              letters: lettersStr,
              letterDetails,
              vowelsSum: actualVowelsSum,
              consonantsSum: actualConsonantsSum,
              synthesisSum: actualSynthesisSum,
              vowels: vowelsReduction,
              consonants: consonantsReduction,
              synthesis: synthesisReduction,
            });
          } else {
            hasMore = true;
          }
        }
      }
    }

    // Stop if we've reached max letter length
    if (letterOnlyLength >= maxLength) {
      return;
    }

    // Pruning - only prune if not using reduction step matching
    // (with reduction matching, we can't prune based on sum since we need all reduction steps)
    if (!matchReductionStep) {
      if (targetVowels !== undefined && runningVowelsSum > targetVowels) {
        return;
      }
      if (targetConsonants !== undefined && runningConsonantsSum > targetConsonants) {
        return;
      }
      if (targetSynthesis !== undefined && runningVowelsSum + runningConsonantsSum > targetSynthesis) {
        return;
      }
    }

    // Try adding a space (if we have spaces available and have at least one letter)
    if (spacesUsed < maxSpaces && currentLetters.length > 0 && currentLetters[currentLetters.length - 1] !== " ") {
      currentLetters.push(" ");
      backtrack(
        currentLetters,
        currentInfos,
        runningVowelsSum,
        runningConsonantsSum,
        letterCounts,
        usedFromPool,
        spacesUsed + 1
      );
      currentLetters.pop();

      if (results.length >= maxResults) {
        hasMore = true;
        return;
      }
    }

    // Try adding each available letter
    for (const letter of availableLetters) {
      const poolLimit = availablePool.get(letter) || 0;
      const usedCount = usedFromPool.get(letter) || 0;

      // Check pool limit
      if (usedCount >= poolLimit) {
        continue;
      }

      // Check maxLetterRepeat constraint
      if (maxLetterRepeat !== undefined) {
        const currentCount = letterCounts.get(letter) || 0;
        if (currentCount >= maxLetterRepeat) {
          continue;
        }
      }

      const isStarting = currentInfos.length === 0;
      const letterInfo = getLetterInfoCached(letter, isStarting);
      if (!letterInfo) continue;

      const value = letterInfo.normalValue;
      const newVowelsSum = runningVowelsSum + (letterInfo.isVowel ? value : 0);
      const newConsonantsSum = runningConsonantsSum + (letterInfo.isVowel ? 0 : value);

      // Pruning - only prune when not using reduction step matching
      if (!matchReductionStep) {
        if (targetVowels !== undefined && newVowelsSum > targetVowels) {
          continue;
        }
        if (targetConsonants !== undefined && newConsonantsSum > targetConsonants) {
          continue;
        }
        if (targetSynthesis !== undefined && newVowelsSum + newConsonantsSum > targetSynthesis) {
          continue;
        }
      }

      currentLetters.push(letter);
      currentInfos.push(letterInfo);
      letterCounts.set(letter, (letterCounts.get(letter) || 0) + 1);
      usedFromPool.set(letter, usedCount + 1);

      backtrack(
        currentLetters,
        currentInfos,
        newVowelsSum,
        newConsonantsSum,
        letterCounts,
        usedFromPool,
        spacesUsed
      );

      currentLetters.pop();
      currentInfos.pop();
      letterCounts.set(letter, letterCounts.get(letter)! - 1);
      usedFromPool.set(letter, usedCount);

      if (results.length >= maxResults) {
        hasMore = true;
        return;
      }
    }
  };

  backtrack([], [], 0, 0, new Map(), new Map(), 0);

  return {
    results,
    hasMore,
    totalFound,
  };
}

/**
 * Reverse gematria from subsequence mode - preserve letter order from suggestion
 */
function reverseGematriaFromSubsequence(
  options: GematriaTypes.ReverseGematriaOptions,
  tree: TreeOfLife
): GematriaTypes.ReverseGematriaOutput {
  const {
    targetVowels,
    targetConsonants,
    targetSynthesis,
    minLength = 1,
    maxLength = 8,
    maxResults = 100,
    maxLetterRepeat,
    suggestionText = "",
    matchReductionStep = true,
    masterNumbers = GematriaData.EXTENDED_MASTER_NUMBERS as unknown as number[],
  } = options;

  const results: GematriaTypes.ReverseGematriaResult[] = [];
  let totalFound = 0;
  let hasMore = false;

  // Parse suggestion into letter units
  const suggestionUnits = parseSuggestionToLetterUnits(suggestionText);

  // Separate spaces from letters but track original positions
  const letterUnitsWithPositions: { unit: string; isSpace: boolean; originalIndex: number }[] = [];
  for (let i = 0; i < suggestionUnits.length; i++) {
    letterUnitsWithPositions.push({
      unit: suggestionUnits[i],
      isSpace: suggestionUnits[i] === " ",
      originalIndex: i,
    });
  }

  const letterOnlyUnits = letterUnitsWithPositions.filter((u) => !u.isSpace);
  const maxSpaces = letterUnitsWithPositions.filter((u) => u.isSpace).length;

  // Cache letter info
  const letterInfoCache = new Map<string, LetterInfo | undefined>();

  const getLetterInfoCached = (letter: string, isStarting: boolean): LetterInfo | undefined => {
    const cacheKey = `${letter}-${isStarting}`;
    if (!letterInfoCache.has(cacheKey)) {
      letterInfoCache.set(cacheKey, buildLetterInfo(tree, letter, isStarting));
    }
    return letterInfoCache.get(cacheKey);
  };

  // Track seen results to avoid duplicates
  const seenResults = new Set<string>();

  // Generate subsequences by choosing which letters to include (preserving order)
  // Also handle flexible space placement
  const generateSubsequences = (
    index: number,
    currentLetters: string[],
    currentInfos: LetterInfo[],
    runningVowelsSum: number,
    runningConsonantsSum: number,
    letterCounts: Map<string, number>,
    spacesUsed: number
  ) => {
    if (results.length >= maxResults) {
      hasMore = true;
      return;
    }

    const letterOnlyLength = currentLetters.filter((l) => l !== " ").length;

    // Check if current combination is valid
    if (letterOnlyLength >= minLength && letterOnlyLength <= maxLength) {
      let actualVowelsSum = runningVowelsSum;
      let actualConsonantsSum = runningConsonantsSum;

      // Adjust for ending value
      if (currentInfos.length > 1) {
        const lastInfo = currentInfos[currentInfos.length - 1];
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

      // Calculate reduction info for matching
      const vowelsReduction = reduceWithMasterNumbers(actualVowelsSum, masterNumbers);
      const consonantsReduction = reduceWithMasterNumbers(actualConsonantsSum, masterNumbers);
      const synthesisReduction = reduceWithMasterNumbers(actualSynthesisSum, masterNumbers);

      // Match against reduction steps if enabled, otherwise exact match
      const matchesVowels = targetVowels === undefined ||
        (matchReductionStep
          ? vowelsReduction.reductionSteps.includes(targetVowels)
          : actualVowelsSum === targetVowels);
      const matchesConsonants = targetConsonants === undefined ||
        (matchReductionStep
          ? consonantsReduction.reductionSteps.includes(targetConsonants)
          : actualConsonantsSum === targetConsonants);
      const matchesSynthesis = targetSynthesis === undefined ||
        (matchReductionStep
          ? synthesisReduction.reductionSteps.includes(targetSynthesis)
          : actualSynthesisSum === targetSynthesis);

      if (matchesVowels && matchesConsonants && matchesSynthesis) {
        const lettersStr = currentLetters.join("").toUpperCase();

        if (!seenResults.has(lettersStr)) {
          seenResults.add(lettersStr);
          totalFound++;

          if (results.length < maxResults) {
            const letterDetails: GematriaTypes.LetterResult[] = currentInfos.map((info, idx) => {
              const isEnding = idx === currentInfos.length - 1 && currentInfos.length > 1;
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
              letters: lettersStr,
              letterDetails,
              vowelsSum: actualVowelsSum,
              consonantsSum: actualConsonantsSum,
              synthesisSum: actualSynthesisSum,
              vowels: vowelsReduction,
              consonants: consonantsReduction,
              synthesis: synthesisReduction,
            });
          } else {
            hasMore = true;
          }
        }
      }
    }

    // Stop if we've processed all letters or reached max length
    if (index >= letterOnlyUnits.length || letterOnlyLength >= maxLength) {
      return;
    }

    // Pruning - only prune if not using reduction step matching
    if (!matchReductionStep) {
      if (targetVowels !== undefined && runningVowelsSum > targetVowels) {
        return;
      }
      if (targetConsonants !== undefined && runningConsonantsSum > targetConsonants) {
        return;
      }
      if (targetSynthesis !== undefined && runningVowelsSum + runningConsonantsSum > targetSynthesis) {
        return;
      }
    }

    // Option 1: Skip the current letter
    generateSubsequences(
      index + 1,
      currentLetters,
      currentInfos,
      runningVowelsSum,
      runningConsonantsSum,
      letterCounts,
      spacesUsed
    );

    if (results.length >= maxResults) {
      hasMore = true;
      return;
    }

    // Option 2: Include the current letter (optionally with a space before it)
    const letter = letterOnlyUnits[index].unit;

    // Check maxLetterRepeat constraint
    if (maxLetterRepeat !== undefined) {
      const currentCount = letterCounts.get(letter) || 0;
      if (currentCount >= maxLetterRepeat) {
        return;
      }
    }

    const isStarting = currentInfos.length === 0;
    const letterInfo = getLetterInfoCached(letter, isStarting);
    if (!letterInfo) return;

    const value = letterInfo.normalValue;
    const newVowelsSum = runningVowelsSum + (letterInfo.isVowel ? value : 0);
    const newConsonantsSum = runningConsonantsSum + (letterInfo.isVowel ? 0 : value);

    // Pruning - only prune when not using reduction step matching
    if (!matchReductionStep) {
      if (targetVowels !== undefined && newVowelsSum > targetVowels) {
        return;
      }
      if (targetConsonants !== undefined && newConsonantsSum > targetConsonants) {
        return;
      }
      if (targetSynthesis !== undefined && newVowelsSum + newConsonantsSum > targetSynthesis) {
        return;
      }
    }

    // Include without space
    currentLetters.push(letter);
    currentInfos.push(letterInfo);
    letterCounts.set(letter, (letterCounts.get(letter) || 0) + 1);

    generateSubsequences(
      index + 1,
      currentLetters,
      currentInfos,
      newVowelsSum,
      newConsonantsSum,
      letterCounts,
      spacesUsed
    );

    currentLetters.pop();
    currentInfos.pop();
    letterCounts.set(letter, letterCounts.get(letter)! - 1);

    if (results.length >= maxResults) {
      hasMore = true;
      return;
    }

    // Include with space before (if we have spaces available and it's not the first letter)
    if (spacesUsed < maxSpaces && currentLetters.length > 0 && currentLetters[currentLetters.length - 1] !== " ") {
      currentLetters.push(" ");
      currentLetters.push(letter);
      currentInfos.push(letterInfo);
      letterCounts.set(letter, (letterCounts.get(letter) || 0) + 1);

      generateSubsequences(
        index + 1,
        currentLetters,
        currentInfos,
        newVowelsSum,
        newConsonantsSum,
        letterCounts,
        spacesUsed + 1
      );

      currentLetters.pop();
      currentLetters.pop();
      currentInfos.pop();
      letterCounts.set(letter, letterCounts.get(letter)! - 1);
    }
  };

  generateSubsequences(0, [], [], 0, 0, new Map(), 0);

  return {
    results,
    hasMore,
    totalFound,
  };
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
