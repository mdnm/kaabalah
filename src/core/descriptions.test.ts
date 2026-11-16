import { describe, expect, it } from "vitest";
import { createTree, SYSTEMS, getTreeDescription, getTreeNodeDescriptions, TREE_DESCRIPTIONS } from "./index";
import type { PartKey } from "./index";
import review from "../../docs/localization/tree-review.json";

describe("Portuguese tree descriptions", () => {
  it("covers live nodes in every system and every shared catalog entry", () => {
    for (const system of SYSTEMS) {
      const parts = Object.keys(system.LOADERS).filter(key => key !== "base") as Exclude<PartKey, "base">[];
      const tree = createTree({ system: system.SYSTEM, parts });
      for (const node of tree.getNodes()) {
        const en = getTreeNodeDescriptions(node), pt = getTreeNodeDescriptions(node, "pt-BR");
        expect(Object.keys(pt)).toEqual(Object.keys(en));
        for (const key of Object.keys(en) as (keyof typeof en)[]) {
          expect(TREE_DESCRIPTIONS[en[key]!], `${system.SYSTEM}.${node.id}.${key}`).toBeDefined();
          expect(pt[key]?.trim()).toBeTruthy();
          expect(pt[key]).toBe(getTreeDescription(en[key]!, "pt-BR"));
        }
      }
    }
    expect(Object.keys(TREE_DESCRIPTIONS)).toHaveLength(184);
    for (const [english, row] of Object.entries(TREE_DESCRIPTIONS)) {
      expect(row.en).toBe(english);
      expect(row.pt.trim()).toBeTruthy();
      expect(row.pt).not.toContain("\u2014");
      expect(review.some(item => item.english === english)).toBe(true);
      expect(getTreeDescription(english, "pt")).toBe(row.pt);
      expect(getTreeDescription(english, "fr")).toBe(english);
    }
    expect(getTreeDescription("unknown", "pt-BR")).toBeUndefined();
  });
});
