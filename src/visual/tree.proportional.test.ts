import { describe, expect, it } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import { generateTreeSvg, getTreeRenderModel, TREE_PATH_IDS, TREE_SPHERE_IDS, type TreeTargetActivationInput } from "./tree";

/** Every target lit, each with its own number of hits: strength is hits over the most hit. */
function weighted(ids: readonly string[], targetType: "sphere" | "path"): TreeTargetActivationInput[] {
  const counts = ids.map((_, index) => 1 + ((index * 5) % 7));
  const max = Math.max(...counts);
  return ids.map((targetId, index) => ({
    targetId: targetId as TreeTargetActivationInput["targetId"],
    targetType,
    count: counts[index],
    total: max,
    strength: counts[index] / max,
  }));
}

describe("proportional highlights", () => {
  const activations = [...weighted(TREE_SPHERE_IDS, "sphere"), ...weighted(TREE_PATH_IDS, "path")];

  it("draws a chosen strength as given, so more hits are more highlight", () => {
    const model = getTreeRenderModel({ activations });
    for (const target of [...model.spheres, ...model.paths]) {
      expect(target.activation?.emphasis).toBe(target.activation?.strength);
    }
    const emphases = new Set(model.spheres.map((sphere) => sphere.activation?.emphasis));
    expect(emphases.size).toBeGreaterThan(4);
  });

  it("keeps the visible floor when the strength is only derived from count and total", () => {
    const [first] = TREE_SPHERE_IDS;
    const model = getTreeRenderModel({ activations: [{ targetId: first, targetType: "sphere", count: 1, total: 10 }] });
    expect(model.sphereById[first].activation).toMatchObject({ strength: 0.1, emphasis: 0.56 });
  });

  it("a lit path keeps its sphere-to-sphere colours, and a recoloured one does not", () => {
    const [first] = TREE_PATH_IDS;
    const number = first.split(":")[1];
    const lit = generateTreeSvg({ activations: [{ targetId: first, targetType: "path", count: 1, total: 1, strength: 0.5 }] });
    expect(lit).toContain(`<linearGradient id="path-grad-${number}"`);
    expect(lit).toContain(`stroke="url(#path-grad-${number})" stroke-opacity=`);
    const recoloured = generateTreeSvg({
      activations: [{ targetId: first, targetType: "path", count: 1, total: 1, strength: 0.5, color: "#ff00aa" }],
    });
    expect(recoloured).not.toContain(`stroke="url(#path-grad-${number})"`);
  });

  // Set TREE_PREVIEW_DIR to write the drawing out for a look.
  it.skipIf(!process.env.TREE_PREVIEW_DIR)("writes a preview", () => {
    const dir = process.env.TREE_PREVIEW_DIR!;
    mkdirSync(dir, { recursive: true });
    writeFileSync(`${dir}/proportional.svg`, generateTreeSvg({ background: "#080f1a", activations }));
  });
});
