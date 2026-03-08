import { calculateGematria, reverseGematria } from "../../gematria";
import { getFlagBool, getFlagNumber, isJsonMode } from "../runtime/args";
import { exitWithError } from "../runtime/errors";
import { MAX_RESULTS_CAP, MAX_TEXT_LENGTH, capNumber, sanitizeInput } from "../runtime/input";
import { outputJson } from "../runtime/output";
import type { Flags, InputPayload } from "../runtime/types";

export function cmdGematria(text: string, flags: Flags): void {
  if (text.length > MAX_TEXT_LENGTH) {
    exitWithError("INVALID_ARGUMENT", `Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters.`, flags);
  }

  const sanitized = sanitizeInput(text);
  const result = calculateGematria(sanitized, {
    missing: getFlagBool(flags, "missing"),
    percentages: getFlagBool(flags, "percentages"),
  });

  if (isJsonMode(flags)) {
    outputJson(result, flags);
    return;
  }

  console.log(`\nGematria: "${sanitized}"\n`);
  console.log(`  Vowels:     ${result.vowels.originalSum} -> [${result.vowels.reductionSteps.join(", ")}] = ${result.vowels.finalValue}`);
  console.log(`  Consonants: ${result.consonants.originalSum} -> [${result.consonants.reductionSteps.join(", ")}] = ${result.consonants.finalValue}`);
  console.log(`  Synthesis:  ${result.synthesis.originalSum} -> [${result.synthesis.reductionSteps.join(", ")}] = ${result.synthesis.finalValue}`);

  if (result.includedLetters.length > 0) {
    console.log(`\n  Letters:`);
    for (const letter of result.includedLetters) {
      const vowelTag = letter.isVowel ? " (vowel)" : "";
      console.log(`    ${letter.hebrewCharacter}  value=${letter.value}${vowelTag}`);
    }
  }

  if (result.missingGematriaValues && result.missingGematriaValues.length > 0) {
    console.log(`\n  Missing values: ${result.missingGematriaValues.map((value) => value.value).join(", ")}`);
  }

  if (result.letterPercentages) {
    console.log(`\n  Vowel %:     ${result.letterPercentages.percentageOfVowels.toFixed(1)}%`);
    console.log(`  Consonant %: ${result.letterPercentages.percentageOfConsonants.toFixed(1)}%`);
  }
  console.log();
}

export function cmdReverseGematria(target: string, flags: Flags, inputPayload: InputPayload): void {
  const targetNum = inputPayload?.targetSynthesis != null
    ? Number(inputPayload.targetSynthesis)
    : Number.parseInt(target, 10);

  if (Number.isNaN(targetNum)) {
    exitWithError("INVALID_ARGUMENT", `Invalid target number: "${target}"`, flags);
  }

  let maxResults = inputPayload?.maxResults != null
    ? Number(inputPayload.maxResults)
    : (getFlagNumber(flags, "max-results") ?? 20);
  maxResults = capNumber(maxResults, MAX_RESULTS_CAP);

  const minLength = inputPayload?.minLength != null
    ? Number(inputPayload.minLength)
    : (getFlagNumber(flags, "min-length") ?? 2);

  const maxLength = inputPayload?.maxLength != null
    ? Number(inputPayload.maxLength)
    : (getFlagNumber(flags, "max-length") ?? 6);

  const includeDigraphs = inputPayload?.includeDigraphs != null
    ? Boolean(inputPayload.includeDigraphs)
    : getFlagBool(flags, "include-digraphs");

  const result = reverseGematria({
    targetSynthesis: targetNum,
    maxResults,
    minLength,
    maxLength,
    includeDigraphs,
  });

  if (isJsonMode(flags)) {
    outputJson(result, flags);
    return;
  }

  console.log(`\nReverse Gematria: target synthesis = ${targetNum}\n`);
  console.log(`  Found: ${result.totalFound} combinations${result.hasMore ? ` (showing first ${maxResults})` : ""}\n`);

  for (const item of result.results) {
    console.log(`  ${item.letters.padEnd(12)} vowels=${item.vowelsSum} consonants=${item.consonantsSum} synthesis=${item.synthesisSum}`);
  }
  console.log();
}
