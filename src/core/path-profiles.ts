import raw from "./path-profiles.json";
import { getTreeDescription } from "./descriptions";
import { freezeTextData, pickTextLanguage } from "../localization";
import type { SphereName } from "./sphere-profiles";
import { id, KaabalahTypes, type Node, type NodeType } from "./types";
import { getCanonicalTree } from "./workspace";

/**
 * What a path means, in one language. A path is one Hebrew letter and one major ark annu, so
 * the profile is also the profile of that card as a path between two spheres.
 *
 * `number`, `from`, `to`, `meaning`, `hebrewLetter`, `tarotCard` and `correspondence` are read
 * from the Tree. The rest is the teaching on the ark annu, and an optional field is absent
 * where the teaching does not give it.
 */
export interface PathProfile {
  /** Path number, 1 to 22, which is also the number of its ark annu. */
  number: number;
  language: "en" | "pt";
  from: SphereName;
  to: SphereName;
  /** What the path carries between its two spheres, such as "Crown's wisdom". */
  meaning: string;
  hebrewLetter: string;
  /** English card name, as in `kaabalah/tarot`. */
  tarotCard: string;
  /** The element, planet or sign of the path. */
  correspondence: string;
  essence: string;
  keywords: string[];
  /** What the Hebrew letter of the path stands for, such as silence for Aleph. */
  letterQuality: string;
  /** The key word or phrase of the ark annu. */
  keyPhrase: string;
  /** The phrase to hold in mind (palavra para mentalização). */
  affirmation: string;
  /** The ark annu at the psychological level. */
  psychology: string;
  /** What the misuse of this force looks like. */
  misuse?: string[];
  /** Mantras, written as they are sounded. The same in every language. */
  mantras?: string[];
  mantraNote?: string;
  incense: string[];
  candles?: string;
  /** The instruments of the magician's table. */
  instruments?: string[];
  dailyUse?: string;
  body?: string;
  /** The amino acid of the path's letter in the book of life; the first and last letters are pauses. */
  aminoAcid: string;
}

/** The bilingual path profiles, by path number. Text fields hold `{ en, pt }`. */
export const PATH_PROFILES = freezeTextData(raw);

const PATH_COUNT = 22;
const CORRESPONDENCE_TYPES: readonly string[] = ["westernElement", "planet", "westernZodiacSign"];

interface PathFacts {
  number: number;
  from: SphereName;
  to: SphereName;
  meaning: string;
  hebrewLetter: string;
  tarotCard: string;
  aliases: readonly string[];
  correspondence: string;
}

let facts: PathFacts[] | undefined;

function getPathFacts(): PathFacts[] {
  if (facts) return facts;
  const tree = getCanonicalTree({ system: "kaabalah", parts: ["westernAstrology", "tarot"] });
  const sphereName = (nodeId: string) => nodeId.slice(nodeId.indexOf(":") + 1) as SphereName;
  facts = Array.from({ length: PATH_COUNT }, (_, index) => {
    const number = index + 1;
    const pathId = id(KaabalahTypes.PATH, number);
    const path = tree.getNode(pathId)!;
    const related = tree
      .getEdges(pathId)
      .map(edge => tree.getNode(edge.left === pathId ? edge.right : edge.left))
      .filter((node): node is Node<NodeType> => Boolean(node));
    const named = (type: string) => related.find(node => node.type === type);
    // Some nodes, the elements among them, have no name: their ID carries it.
    const nameOf = (node?: Node<NodeType>) => (node ? node.name ?? node.id.slice(node.id.indexOf(":") + 1) : "");
    const card = named("tarotArkAnnu");
    return {
      number,
      from: sphereName(path.data!.from),
      to: sphereName(path.data!.to),
      meaning: path.data!.meaning ?? "",
      hebrewLetter: nameOf(named("hebrewLetter")),
      tarotCard: nameOf(card),
      aliases: (card?.data as { aliases?: readonly string[] } | undefined)?.aliases ?? [],
      correspondence: nameOf(related.find(node => CORRESPONDENCE_TYPES.includes(node.type))),
    };
  });
  return facts;
}

function resolvePathNumber(path: string | number): number | undefined {
  const text = String(path).trim().toLowerCase();
  const bare = text.startsWith("path:") ? text.slice("path:".length) : text;
  if (/^\d+$/.test(bare)) {
    const number = Number(bare);
    return number >= 1 && number <= PATH_COUNT ? number : undefined;
  }
  if (!bare) return undefined;
  const afterColon = bare.slice(bare.indexOf(":") + 1);
  return getPathFacts().find(fact =>
    [fact.tarotCard, fact.hebrewLetter, ...fact.aliases].some(name => {
      const candidate = name.toLowerCase();
      return candidate === bare || candidate === afterColon;
    })
  )?.number;
}

/**
 * The profile of a path: its two spheres, letter and card, what it means in plain words, and
 * what is taught about its ark annu (psychological level, misuse,
 * mantras, incense, candles, instruments, daily use).
 *
 * Takes a path number (13, "13"), a path node ID ("path:13"), the name of its card ("Death",
 * "A Morte", "tarotArkAnnu:Death") or of its Hebrew letter ("Mem"), in any case. `pt` and
 * `pt-BR` select Portuguese; any other language, or none, selects English. An unknown path
 * returns undefined.
 */
export function getPathProfile(path: string | number, language?: string): PathProfile | undefined {
  const number = resolvePathNumber(path);
  if (!number) return undefined;
  const lang = language?.startsWith("pt") ? "pt" : "en";
  const { aliases: _aliases, meaning, ...fact } = getPathFacts()[number - 1];
  const source = PATH_PROFILES[String(number) as keyof typeof PATH_PROFILES];
  return {
    ...fact,
    language: lang,
    meaning: getTreeDescription(meaning, lang) ?? meaning,
    ...(pickTextLanguage(source, lang) as object),
  } as PathProfile;
}

/** Every path profile, from path 1 to path 22. */
export function listPathProfiles(language?: string): PathProfile[] {
  return Array.from({ length: PATH_COUNT }, (_, index) => getPathProfile(index + 1, language)!);
}

/** The profiles of the paths that touch a sphere, in path order. Takes a sphere name or node ID. */
export function getSpherePathProfiles(sphere: string, language?: string): PathProfile[] {
  const name = sphere.slice(sphere.indexOf(":") + 1).trim().toLowerCase();
  return listPathProfiles(language).filter(
    profile => profile.from.toLowerCase() === name || profile.to.toLowerCase() === name
  );
}
