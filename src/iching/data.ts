import raw from "./hexagrams.json";
import portugueseNames from "./names.pt.json";
import { TRIGRAMS } from "./tables";
import type { Hexagram, HexagramText } from "./types";

/** Portuguese hexagram display names, keyed by King Wen number. */
export const HEXAGRAM_NAMES_PT: Readonly<Record<string, string>> = Object.freeze(portugueseNames);

function freezeText(text: HexagramText): HexagramText {
  return Object.freeze({
    judgment: Object.freeze(text.judgment),
    image: Object.freeze(text.image),
    lines: Object.freeze(text.lines.map((line) => Object.freeze(line))),
    ...(text.useNine ? { useNine: Object.freeze(text.useNine) } : {}),
    ...(text.useSix ? { useSix: Object.freeze(text.useSix) } : {}),
  });
}
export const HEXAGRAMS: readonly Hexagram[] = Object.freeze(
  raw.map((row) => {
    const lower = TRIGRAMS.find((t) => t.binary === row.binary.slice(0, 3));
    const upper = TRIGRAMS.find((t) => t.binary === row.binary.slice(3));
    if (!lower || !upper || row.text.lines.length !== 6)
      throw new Error(`Incomplete hexagram ${row.number}`);
    return Object.freeze({
      ...row,
      portuguese: HEXAGRAM_NAMES_PT[String(row.number)],
      ...(row.pinyinVariants
        ? { pinyinVariants: Object.freeze(row.pinyinVariants) }
        : {}),
      symbol: String.fromCodePoint(0x4dc0 + row.number - 1),
      lower,
      upper,
      text: freezeText(row.text),
    });
  }),
);

/** King Wen number is the stable identity; romanizations are display metadata only. */
export const HEXAGRAMS_BY_NUMBER: Readonly<Record<number, Hexagram>> =
  Object.freeze(Object.fromEntries(HEXAGRAMS.map((h) => [h.number, h])));

/** Localized display name; the King Wen number remains the stable identity. */
export function getHexagramName(number: number, language?: string): string | undefined {
  const hexagram = HEXAGRAMS_BY_NUMBER[number];
  return language?.startsWith("pt") ? hexagram?.portuguese : hexagram?.english;
}
