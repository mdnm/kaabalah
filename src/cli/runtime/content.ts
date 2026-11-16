import { RAW_ARKANNUS } from "../../tarot/data";
import { IFA_TEXTS } from "../../ifa/texts";
import { NUMEROLOGY_TEXT_DATA } from "../../numerology/texts";
import { GEMATRIA_TEXT_DATA } from "../../gematria/texts";
import { TAROT_CONTENT } from "../../core/tarot-content";
import tree from "../../core/descriptions.json";
import spreads from "../../tarot/spreads.text.json";
import astrology from "../../astrology/labels.json";
import { cliText, currentCliLanguage } from "./language";

const content = new Map<string, string>();
function add(en: unknown, pt: unknown): void {
  if (typeof en === "string" && typeof pt === "string") content.set(en, pt);
  else if (Array.isArray(en) && Array.isArray(pt)) {
    content.set(en.join(", "), pt.join(", "));
    en.forEach((item, i) => add(item, pt[i]));
  } else if (en && pt && typeof en === "object" && typeof pt === "object") {
    for (const key of Object.keys(en)) add((en as Record<string, unknown>)[key], (pt as Record<string, unknown>)[key]);
  }
}
add(NUMEROLOGY_TEXT_DATA.en, NUMEROLOGY_TEXT_DATA.pt);
add(GEMATRIA_TEXT_DATA.en, GEMATRIA_TEXT_DATA.pt);
for (const card of RAW_ARKANNUS) content.set(card.tarotCard, TAROT_CONTENT[card.tarotCardFilename].pt.PAPUS_KAABALISTIC.name);
for (const row of Object.values(IFA_TEXTS)) add(row.en, row.pt);
for (const row of Object.values(TAROT_CONTENT)) {
  add(row.en, row.pt);
  if (row.legacyMeaning) content.set(row.legacyMeaning, row.pt.PAPUS_KAABALISTIC.meaning);
}
for (const row of [...Object.values(tree), ...Object.values(spreads), ...Object.values(astrology)]) add(row.en, row.pt);

/** Translate known library display content only, without interpreting arbitrary user text. */
export function cliValue(value: unknown, language = currentCliLanguage()): unknown {
  if (!language?.startsWith("pt") || typeof value !== "string") return value;
  const direct = content.get(value) ?? cliText(value, [], language);
  if (direct !== value) return direct;
  const trimmed = value.trim();
  const translated = content.get(trimmed) ?? cliText(trimmed, [], language);
  if (translated === trimmed) return value;
  const leading = value.slice(0, value.length - value.trimStart().length);
  return (leading + translated).padEnd(value.length);

}

const fields = new Set([
  "meaning", "papusMeaning", "egyptianCardName", "tarotMeaning", "tarotCard", "tarotCardName",
  "description", "shortDescription", "personalDescription", "businessDescription", "title", "goal",
  "positiveTraits", "negativeTraits", "keywords", "label", "shortLabel", "displayLabel", "note",
  "colorDescription", "noteDescription", "yvritMeaning", "hieroglyph", "message",
]);

/** Preserve JSON keys, IDs, original English fields and user inputs; localize display fields. */
export function localizeCliJson(value: unknown, language?: string, field = "", deckDescription = false): unknown {
  if (!language?.startsWith("pt")) return value;
  if (typeof value === "string") return fields.has(field) || (deckDescription && field === "name") ? cliValue(value, language) : value;
  if (Array.isArray(value)) return value.map(item => localizeCliJson(item, language, field, deckDescription));
  if (!value || typeof value !== "object" || value instanceof Date) return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [
    key, localizeCliJson(item, language, key, deckDescription || key === "descriptionsByDeck" || key === "description"),
  ]));
}
