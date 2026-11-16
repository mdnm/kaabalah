import raw from "./descriptions.json";
import { freezeTextData } from "../localization";
import type { Node, NodeType } from "./types";

/** Descriptions across all three tree systems, including shared sphere, letter and music data. */
export const TREE_DESCRIPTIONS: Readonly<Record<string, Readonly<{ en: string; pt: string }>>> = freezeTextData(raw);

/** Localize a known tree description. Unknown text returns undefined; English is the default. */
export function getTreeDescription(english: string, language?: string): string | undefined {
  const row = TREE_DESCRIPTIONS[english];
  return language?.startsWith("pt") ? row?.pt : row?.en;
}

const FIELDS = {
  meaning: "meaning",
  colorDescription: "colorDescription",
  noteDescription: "noteDescription",
  englishName: "nameMeaning",
  yvritMeaning: "letterMeaning",
  symbol: "symbol",
  hieroglyph: "hieroglyph",
} as const;

export type TreeNodeDescriptions = Partial<Record<(typeof FIELDS)[keyof typeof FIELDS], string>>;

/**
 * Localized description fields beside the unchanged node. Sphere names and branded IDs stay stable.
 * pt and pt-BR select Portuguese. Custom text without a catalog entry is returned unchanged.
 */
export function getTreeNodeDescriptions<T extends NodeType>(node: Node<T>, language?: string): TreeNodeDescriptions {
  const result: TreeNodeDescriptions = {};
  const data = node.data as Record<string, unknown> | undefined;
  for (const [field, output] of Object.entries(FIELDS)) {
    const value = data?.[field];
    if (typeof value === "string") result[output] = getTreeDescription(value, language) ?? value;
  }
  return result;
}
