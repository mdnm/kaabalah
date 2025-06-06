import { PartKey, SystemKey } from "./systems/registry";
import { TreeOfLife } from "./tree-of-life";

export interface TreeOptions {
  system: SystemKey;
  parts?: Exclude<PartKey, "base">[];
}

/**
 * Creates a new Tree of Life instance with optional system loaders
 * @param opts Configuration options for which systems to load
 * @returns A new TreeOfLife instance with the requested systems loaded
 */
export function createTree(
  opts: TreeOptions = {
    system: "kaabalah",
    parts: [],
  }
) {
  const tree = new TreeOfLife();

  tree.loadSystem(opts.system);

  for (const part of opts.parts || []) {
    tree.loadPart(part);
  }

  return tree;
}
