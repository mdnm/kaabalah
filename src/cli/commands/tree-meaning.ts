import {
  getSphereProfile,
  getSphereSections,
  getPathProfile,
  getTreeSection,
  listSphereProfiles,
  listPathProfiles,
  listTreeSections,
  SPHERE_PROFILE_ORDER,
  TREE_SECTION_IDS,
  type PathProfile,
  type SphereProfile,
  type TreeSection,
  type TreeSectionKind,
} from "../../core";
import { getFlagString, isJsonMode } from "../runtime/args";
import { exitWithError } from "../runtime/errors";
import { cliText, currentCliLanguage } from "../runtime/language";
import { outputJson } from "../runtime/output";
import type { Flags } from "../runtime/types";

const SECTION_KINDS: readonly TreeSectionKind[] = ["world", "pillar", "triad"];

function printLine(label: string, value: string | string[] | undefined): void {
  const text = Array.isArray(value) ? value.join(", ") : value;
  if (text) console.log(cliText(`  ${label}: {0}`, [text]));
}

function printSphere(profile: SphereProfile): void {
  console.log(`\n${profile.sphere} (${profile.number}): ${profile.nameMeaning}\n`);
  console.log(`  ${profile.essence}\n`);
  printLine("Keywords", profile.keywords);
  printLine("Magical image", profile.magicalImage);
  printLine("Instrument", profile.instrument);
  printLine("Work", profile.work);
  printLine("Virtues", profile.virtues);
  printLine("Vices", profile.vices);
  printLine("Body", profile.body);
  if (profile.expression) {
    console.log("");
    printLine("In balance", profile.expression.balanced);
    printLine("In excess", profile.expression.excess);
    printLine("In lack", profile.expression.lack);
  }
  console.log(cliText("\n  Use --json for every correspondence.\n"));
}

function printSection(section: TreeSection): void {
  console.log(`\n${section.name}: ${section.title}\n`);
  console.log(`  ${section.essence}\n`);
  printLine("Spheres", section.spheres);
  printLine("Keywords", section.keywords);
  console.log(`\n  ${section.description}\n`);
}

/** `tree:sphere [name]`: the profile of one sphere, or a summary of all of them. */
export function cmdTreeSphere(sphere: string | undefined, flags: Flags): void {
  const language = currentCliLanguage();

  if (!sphere) {
    const profiles = listSphereProfiles(language);
    if (isJsonMode(flags)) {
      outputJson({ language: profiles[0].language, spheres: profiles }, flags);
      return;
    }
    console.log("");
    for (const profile of profiles) console.log(`  ${profile.sphere.padEnd(10)} ${profile.essence}`);
    console.log("");
    return;
  }

  const profile = getSphereProfile(sphere, language);
  const sections = getSphereSections(sphere, language);
  if (!profile || !sections) {
    exitWithError(
      "INVALID_ARGUMENT",
      cliText('Unknown sphere "{0}". Valid spheres: {1}.', [sphere, SPHERE_PROFILE_ORDER.join(", ")]),
      flags
    );
  }

  if (isJsonMode(flags)) {
    outputJson(
      {
        ...profile,
        sections: {
          world: sections.world?.id ?? null,
          pillar: sections.pillar.id,
          triad: sections.triad?.id ?? null,
        },
      },
      flags
    );
    return;
  }
  printSphere(profile);
}

function printPath(profile: PathProfile): void {
  console.log(`\n${profile.number}. ${profile.tarotCard} (${profile.hebrewLetter}): ${profile.from} -> ${profile.to}\n`);
  console.log(`  ${profile.essence}\n`);
  printLine("Keywords", profile.keywords);
  printLine("Letter", `${profile.hebrewLetter}, ${profile.letterQuality}`);
  printLine("Key phrase", profile.keyPhrase);
  printLine("Affirmation", profile.affirmation);
  printLine("Misuse", profile.misuse);
  printLine("Mantras", profile.mantras);
  console.log(`\n  ${profile.psychology}`);
  console.log(cliText("\n  Use --json for every correspondence.\n"));
}

/** `tree:path [path]`: the profile of one path, or a summary of all 22. */
export function cmdTreePath(path: string | undefined, flags: Flags): void {
  const language = currentCliLanguage();

  if (!path) {
    const profiles = listPathProfiles(language);
    if (isJsonMode(flags)) {
      outputJson({ language: profiles[0].language, paths: profiles }, flags);
      return;
    }
    console.log("");
    for (const profile of profiles) console.log(`  ${String(profile.number).padStart(2)} ${profile.tarotCard.padEnd(22)} ${profile.essence}`);
    console.log("");
    return;
  }

  const profile = getPathProfile(path, language);
  if (!profile) {
    exitWithError(
      "INVALID_ARGUMENT",
      cliText('Unknown path "{0}". Use a path number from 1 to 22, a path ID (path:13), a card name or a Hebrew letter.', [path]),
      flags
    );
  }

  if (isJsonMode(flags)) {
    outputJson(profile, flags);
    return;
  }
  printPath(profile);
}

/** `tree:section [id]`: one world, pillar or triad, or all of them (optionally of one kind). */
export function cmdTreeSection(section: string | undefined, flags: Flags): void {
  const language = currentCliLanguage();

  if (!section) {
    const kind = getFlagString(flags, "kind");
    if (kind !== undefined && !SECTION_KINDS.includes(kind as TreeSectionKind)) {
      exitWithError(
        "INVALID_ARGUMENT",
        cliText('Unknown section kind "{0}". Valid kinds: {1}.', [kind, SECTION_KINDS.join(", ")]),
        flags
      );
    }
    const sections = listTreeSections({ kind: kind as TreeSectionKind | undefined, language });
    if (isJsonMode(flags)) {
      outputJson({ language: sections[0].language, sections }, flags);
      return;
    }
    console.log("");
    for (const item of sections) console.log(`  ${item.id.padEnd(16)} ${item.essence}`);
    console.log("");
    return;
  }

  const found = getTreeSection(section, language);
  if (!found) {
    exitWithError(
      "INVALID_ARGUMENT",
      cliText('Unknown tree section "{0}". Valid sections: {1}.', [section, TREE_SECTION_IDS.join(", ")]),
      flags
    );
  }

  if (isJsonMode(flags)) {
    outputJson(found, flags);
    return;
  }
  printSection(found);
}
