import { PartKey, SystemKey } from '../kaabalah/systems/registry';
import { TreeOfLife } from '../kaabalah/tree-of-life';

export interface TreeOptions {
  system: SystemKey;
  parts?: PartKey[];
  // tarot?: TarotLoaderOptions;
  // astrology?: boolean;
}

/**
 * Creates a new Tree of Life instance with optional system loaders
 * @param opts Configuration options for which systems to load
 * @returns A new TreeOfLife instance with the requested systems loaded
 */
export function createTree(opts: TreeOptions = {
  system: "kaabalah",
  parts: [],
}) {
  const tree = new TreeOfLife();

  tree.loadSystem(opts.system);

  if (opts.parts) {
    for (const part of opts.parts) {
      tree.loadPart(part);
    }
  }
  
  // TODO: implement
  // if (opts.tarot) {
  //   loadTarot(tree, {
  //     includeMajorArcana: opts.tarot.includeMajorArcana,
  //     includeCourtCards: opts.tarot.includeCourtCards,
  //   });
  // }
  // if (opts.astrology) loadAstrology(tree);
  
  return tree;
}