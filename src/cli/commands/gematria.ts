import { cliText } from "../runtime/language";
import { calculateGematria, reverseGematria } from "../../gematria";
import { getFlagBool, getFlagNumber, isJsonMode } from "../runtime/args";
import { exitWithError } from "../runtime/errors";
import { MAX_RESULTS_CAP, MAX_TEXT_LENGTH, capNumber, sanitizeInput } from "../runtime/input";
import { outputJson } from "../runtime/output";
import type { Flags, InputPayload } from "../runtime/types";

export async function cmdGematria(text: string, flags: Flags): Promise<void> {
  if (text.length > MAX_TEXT_LENGTH) {
    exitWithError("INVALID_ARGUMENT", cliText("Text exceeds maximum length of {0} characters.", [MAX_TEXT_LENGTH]), flags);
  }

  const sanitized = sanitizeInput(text);
  let result = calculateGematria(sanitized, {
    missing: getFlagBool(flags, "missing"),
    percentages: getFlagBool(flags, "percentages"),
  });

  if (getFlagBool(flags, "resolve-paths")) {
    const { getKaabalisticCorrespondenceTargets } = await import("../../semantic");
    result = {
      ...result,
      includedLetters: result.includedLetters.map((letter) => ({
        ...letter,
        treeTargets:
          getKaabalisticCorrespondenceTargets({
            kind: "hebrewLetter",
            hebrewLetterId: letter.hebrewLetterId,
          })?.targets ?? [],
      })),
    };
  }

  if (isJsonMode(flags)) {
    outputJson(result, flags);
    return;
  }

  console.log(cliText("\nGematria: \"{0}\"\n", [sanitized]));
  console.log(cliText("  Vowels:     {0} -> [{1}] = {2}", [result.vowels.originalSum, result.vowels.reductionSteps.join(", "), result.vowels.finalValue]));
  console.log(cliText("  Consonants: {0} -> [{1}] = {2}", [result.consonants.originalSum, result.consonants.reductionSteps.join(", "), result.consonants.finalValue]));
  console.log(cliText("  Synthesis:  {0} -> [{1}] = {2}", [result.synthesis.originalSum, result.synthesis.reductionSteps.join(", "), result.synthesis.finalValue]));

  if (result.includedLetters.length > 0) {
    console.log(cliText("\n  Letters:"));
    for (const letter of result.includedLetters) {
      const vowelTag = letter.isVowel ? cliText(" (vowel)") : "";
      console.log(cliText("    {0}  value={1}{2}", [letter.hebrewCharacter, letter.value, vowelTag]));
      if ("treeTargets" in letter && Array.isArray(letter.treeTargets)) {
        for (const target of letter.treeTargets) {
          console.log(`      -> ${target.targetId} (${target.targetName})`);
        }
      }
    }
  }

  if (result.missingGematriaValues && result.missingGematriaValues.length > 0) {
    console.log(cliText("\n  Missing values: {0}", [result.missingGematriaValues.map((value) => value.value).join(", ")]));
  }

  if (result.letterPercentages) {
    console.log(cliText("\n  Vowel %:     {0}%", [result.letterPercentages.percentageOfVowels.toFixed(1)]));
    console.log(cliText("  Consonant %: {0}%", [result.letterPercentages.percentageOfConsonants.toFixed(1)]));
  }
  console.log();
}

export function cmdReverseGematria(target: string, flags: Flags, inputPayload: InputPayload): void {
  const targetNum = inputPayload?.targetSynthesis != null
    ? Number(inputPayload.targetSynthesis)
    : Number.parseInt(target, 10);

  if (Number.isNaN(targetNum)) {
    exitWithError("INVALID_ARGUMENT", cliText("Invalid target number: \"{0}\"", [target]), flags);
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

  console.log(cliText("\nReverse Gematria: target synthesis = {0}\n", [targetNum]));
  console.log(cliText("  Found: {0} combinations{1}\n", [result.totalFound, result.hasMore ? ` (showing first ${maxResults})` : ""]));

  for (const item of result.results) {
    console.log(cliText("  {0} vowels={1} consonants={2} synthesis={3}", [item.letters.padEnd(12), item.vowelsSum, item.consonantsSum, item.synthesisSum]));
  }
  console.log();
}
