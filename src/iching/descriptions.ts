import raw from "./descriptions.json";

export interface HexagramDescription {
  readonly en: string;
  readonly pt: string;
}

/** These JSON-only trees are process-wide references, never caller-owned state. */
function freeze<T>(value: T): T {
  if (value !== null && typeof value === "object") {
    for (const child of Object.values(value as Record<string, unknown>)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

/**
 * Plain words for each hexagram's judgment and image, and for the picture its two trigrams make.
 * The classical Chinese and literal English stay on the hexagram.
 */
export const HEXAGRAM_DESCRIPTIONS: {
  readonly source: string;
  readonly hexagrams: Readonly<Record<string, HexagramDescription>>;
} = freeze(raw);

/** Plain-language account of a hexagram. Portuguese includes pt-BR. An unknown number returns undefined. */
export function getHexagramDescription(number: number, language?: string): string | undefined {
  const row = HEXAGRAM_DESCRIPTIONS.hexagrams[String(number)];
  if (!row) return undefined;
  return language?.startsWith("pt") ? row.pt : row.en;
}
