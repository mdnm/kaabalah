import raw from "./texts.json";
import { HEXAGRAMS_BY_NUMBER } from "./data";
import type { ClassicalText, HexagramText, TextSelection } from "./types";

/** Classical text with a selected display value beside the unchanged Chinese and English. */
export interface ClassicalTextContent extends ClassicalText {
  readonly content: string;
}
export interface HexagramTextContent {
  readonly judgment: ClassicalTextContent;
  readonly image: ClassicalTextContent;
  readonly lines: readonly ClassicalTextContent[];
  readonly useNine?: ClassicalTextContent;
  readonly useSix?: ClassicalTextContent;
}

/** Draft Portuguese translations; per-row review status is in docs/localization/iching-review.json. */
export const HEXAGRAM_TEXTS: Readonly<Record<string, Readonly<{ en: string; pt: string }>>> = Object.freeze(
  Object.fromEntries(Object.entries(raw).map(([key, row]) => [key, Object.freeze(row)])),
);

function content(number: number, key: string, original: ClassicalText, language?: string): ClassicalTextContent {
  const row = HEXAGRAM_TEXTS[`${number}.${key}`];
  if (!row) throw new Error(`Missing classical text ${number}.${key}`);
  return Object.freeze({ ...original, content: language?.startsWith("pt") ? row.pt : row.en });
}

/** Localized classical text. Unknown numbers return undefined. Chinese and English stay available. */
export function getHexagramText(number: number, language?: string): HexagramTextContent | undefined {
  const h = HEXAGRAMS_BY_NUMBER[number];
  if (!h) return undefined;
  const text: HexagramText = h.text;
  return Object.freeze({
    judgment: content(number, "judgment", text.judgment, language),
    image: content(number, "image", text.image, language),
    lines: Object.freeze(text.lines.map((line, index) => content(number, `lines.${index + 1}`, line, language))),
    ...(text.useNine ? { useNine: content(number, "useNine", text.useNine, language) } : {}),
    ...(text.useSix ? { useSix: content(number, "useSix", text.useSix, language) } : {}),
  });
}

/** Apply language selection to a text already chosen by the unchanged Zhu Xi rules. */
export function getOracleTextContent(selection: TextSelection, language?: string): ClassicalTextContent {
  const key = selection.kind === "line" ? `lines.${selection.line}` : selection.kind;
  return content(selection.hexagramNumber, key, selection.text, language);
}
