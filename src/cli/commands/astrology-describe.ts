import { cliText, currentCliLanguage } from "../runtime/language";
import { isJsonMode } from "../runtime/args";
import { exitWithError } from "../runtime/errors";
import { outputJson } from "../runtime/output";
import type { Flags, InputPayload } from "../runtime/types";

type Entry = {
  pt: string;
  en: string;
  keywords: { pt: readonly string[]; en: readonly string[] };
  src: readonly unknown[];
  reviewNotes: readonly string[];
};
type Descriptions = typeof import("../../astrology/descriptions");
type KeyKind = "planet" | "sign" | "house" | "point" | "angle" | "aspect" | "node" | "text" | "number";
type Lookup = (d: Descriptions, keys: readonly (string | number)[]) => Entry | undefined;

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;
const POINT_ALIASES: Readonly<Record<string, string>> = {
  fortune: "parsFortunae", parsfortunae: "parsFortunae", chiron: "chiron",
  lilith: "lilith mean", "lilith mean": "lilith mean", "lilith true": "lilith true",
  vertex: "vertex", antivertex: "antivertex",
};
const ANGLE_ALIASES: Readonly<Record<string, string>> = {
  ascendant: "ascendant", asc: "ascendant", mc: "mc", midheaven: "mc",
  dc: "dc", descendant: "dc", ic: "ic",
};
const MODALITIES: Readonly<Record<string, string>> = { cardinal: "Cardinal", fixed: "Fixed", mutable: "Mutable" };
/** The retrograde getters need a negative speed; the CLI lookup is an explicit request for the retrograde text. */
const RETROGRADE = -1;

/* eslint-disable @typescript-eslint/no-explicit-any */
const KINDS: Readonly<Record<string, { keys: readonly KeyKind[]; optional?: number; lookup: Lookup }>> = {
  planet: { keys: ["planet"], lookup: (d, k) => d.getPlanetDescriptionEntry(k[0] as any) },
  sign: { keys: ["sign"], lookup: (d, k) => d.getSignDescriptionEntry(k[0] as any) },
  house: { keys: ["house"], lookup: (d, k) => d.getHouseDescriptionEntry(k[0] as number) },
  element: { keys: ["text"], lookup: (d, k) => d.getElementDescriptionEntry(k[0] as any) },
  modality: { keys: ["text"], lookup: (d, k) => d.getModalityDescriptionEntry((MODALITIES[k[0] as string] ?? k[0]) as any) },
  polarity: { keys: ["text"], lookup: (d, k) => d.getPolarityDescriptionEntry(k[0] as any) },
  angle: { keys: ["angle"], lookup: (d, k) => d.getAngleDescriptionEntry(k[0] as any) },
  aspect: { keys: ["aspect"], lookup: (d, k) => d.getAspectDescriptionEntry(k[0] as any) },
  point: { keys: ["point"], lookup: (d, k) => d.getPointDescriptionEntry(k[0] as any) },
  sect: { keys: ["text"], lookup: (d, k) => d.getSectDescriptionEntry(k[0] as any) },
  node: { keys: ["node"], lookup: (d, k) => d.getLunarNodeDescriptionEntry(k[0] as any) },
  dignity: { keys: ["text"], lookup: (d, k) => d.getDignityStatusDescriptionEntry(k[0] as any) },
  retrograde: { keys: ["planet"], lookup: (d, k) => d.getRetrogradePlanetDescriptionEntry(k[0] as any, RETROGRADE) },
  "vertex-contact": { keys: ["planet"], lookup: (d, k) => d.getVertexContactDescriptionEntry(k[0] as any) },
  "planet-sign": { keys: ["planet", "sign"], lookup: (d, k) => d.getPlanetSignDescriptionEntry(k[0] as any, k[1] as any) },
  "planet-house": { keys: ["planet", "house"], lookup: (d, k) => d.getPlanetHouseDescriptionEntry(k[0] as any, k[1] as number) },
  "angle-sign": { keys: ["angle", "sign"], lookup: (d, k) => d.getAngleSignDescriptionEntry(k[0] as any, k[1] as any) },
  "cusp-sign": { keys: ["house", "sign"], lookup: (d, k) => d.getHouseCuspSignDescriptionEntry(k[0] as number, k[1] as any) },
  "point-sign": { keys: ["point", "sign"], lookup: (d, k) => d.getPointSignDescriptionEntry(k[0] as any, k[1] as any) },
  "point-house": { keys: ["point", "house"], lookup: (d, k) => d.getPointHouseDescriptionEntry(k[0] as any, k[1] as number) },
  "node-sign": { keys: ["node", "sign"], lookup: (d, k) => d.getLunarNodeSignDescriptionEntry(k[0] as any, k[1] as any) },
  "node-house": { keys: ["node", "house"], lookup: (d, k) => d.getLunarNodeHouseDescriptionEntry(k[0] as any, k[1] as number) },
  "retrograde-sign": {
    keys: ["planet", "sign"],
    lookup: (d, k) => d.getRetrogradePlanetSignDescriptionEntry(k[0] as any, k[1] as any, RETROGRADE),
  },
  "retrograde-house": {
    keys: ["planet", "house"],
    lookup: (d, k) => d.getRetrogradePlanetHouseDescriptionEntry(k[0] as any, k[1] as number, RETROGRADE),
  },
  "sun-ascendant": { keys: ["sign", "sign"], lookup: (d, k) => d.getSunAscendantDescriptionEntry(k[0] as any, k[1] as any) },
  "aspect-pair": {
    keys: ["aspect", "planet", "planet"],
    lookup: (d, k) => d.getAspectPairDescriptionEntry(k[0] as any, k[1] as any, k[2] as any),
  },
  decan: {
    keys: ["sign", "number"],
    optional: 2,
    lookup: (d, k) => (k.length === 0 ? d.getDecanDescriptionEntry() : d.getDecanDescriptionEntry(k[0] as any, k[1] as number)),
  },
  degree: { keys: ["sign", "number"], lookup: (d, k) => d.getSymbolicDegreeDescriptionEntry(k[0] as any, k[1] as number) },
  "degree-at": {
    keys: ["number"],
    lookup: (d, k) => {
      const at = d.getSymbolicDegreeNumber(k[0] as number);
      return at ? d.getSymbolicDegreeDescriptionEntry(at.sign, at.degree) : undefined;
    },
  },
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export const DESCRIBE_KINDS: readonly string[] = Object.freeze(Object.keys(KINDS));

function normalizeKey(kind: KeyKind, raw: string): string | number | undefined {
  const text = raw.trim();
  const lower = text.toLowerCase();
  switch (kind) {
    case "sign":
      return SIGNS.find(sign => sign.toLowerCase() === lower);
    case "house":
    case "number": {
      const value = Number(text);
      return text !== "" && Number.isFinite(value) ? value : undefined;
    }
    case "point":
      return POINT_ALIASES[lower];
    case "angle":
      return ANGLE_ALIASES[lower];
    case "node":
      return lower === "north" || lower === "south" ? lower : undefined;
    default:
      return lower === "" ? undefined : lower;
  }
}

export function cmdAstrologyDescribe(args: string[], flags: Flags, inputPayload: InputPayload): void {
  const payloadKeys = Array.isArray(inputPayload?.keys) ? (inputPayload.keys as unknown[]).map(String) : undefined;
  const kindName = String((inputPayload?.kind as string | undefined) ?? args[0] ?? "").toLowerCase();
  const rawKeys = payloadKeys ?? args.slice(1);
  if (!kindName) {
    exitWithError(
      "MISSING_ARGUMENT",
      cliText("Usage: kaabalah astrology:describe <kind> [keys...]. Kinds: {0}", [DESCRIBE_KINDS.join(", ")]),
      flags,
    );
  }
  if (!Object.prototype.hasOwnProperty.call(KINDS, kindName)) {
    exitWithError(
      "INVALID_ARGUMENT",
      cliText("Unknown description kind: \"{0}\". Kinds: {1}", [kindName, DESCRIBE_KINDS.join(", ")]),
      flags,
    );
  }
  const kind = KINDS[kindName];
  const allowEmpty = kind.optional === kind.keys.length && rawKeys.length === 0;
  if (!allowEmpty && rawKeys.length !== kind.keys.length) {
    exitWithError(
      rawKeys.length < kind.keys.length ? "MISSING_ARGUMENT" : "INVALID_ARGUMENT",
      cliText("Description kind \"{0}\" takes: {1}", [kindName, kind.keys.join(" ")]),
      flags,
    );
  }
  const keys: (string | number)[] = [];
  rawKeys.forEach((raw, index) => {
    const key = normalizeKey(kind.keys[index], raw);
    if (key === undefined) {
      exitWithError(
        "INVALID_ARGUMENT",
        cliText("Invalid {0} for description kind \"{1}\": \"{2}\"", [kind.keys[index], kindName, raw]),
        flags,
      );
    }
    keys.push(key);
  });

  // Lazy-import to keep the module tree-shakable at the CLI level
  const descriptions: Descriptions = require("../../astrology/descriptions");
  const entry = kind.lookup(descriptions, keys);
  const portuguese = currentCliLanguage()?.startsWith("pt") ?? false;
  const language = portuguese ? "pt-BR" : "en";

  if (isJsonMode(flags)) {
    outputJson(
      entry
        ? {
            kind: kindName, keys, found: true, language,
            text: portuguese ? entry.pt : entry.en,
            keywords: portuguese ? entry.keywords.pt : entry.keywords.en,
            pt: entry.pt, en: entry.en, src: entry.src, reviewNotes: entry.reviewNotes,
          }
        : { kind: kindName, keys, found: false, language, text: null },
      flags,
    );
    return;
  }
  if (!entry) {
    console.log(cliText("No description is authored for {0} {1}.", [kindName, keys.join(" ")]));
    return;
  }
  console.log();
  console.log(portuguese ? entry.pt : entry.en);
  console.log();
  console.log(cliText("Keywords: {0}", [(portuguese ? entry.keywords.pt : entry.keywords.en).join(", ")]));
  console.log();
}
