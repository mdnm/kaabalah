import { loadKaabalah } from '../kaabalah/loaders/kaabalah';
import { loadLurianicKabbalah } from '../kaabalah/loaders/lurianic-kabbalah';
import { TreeOfLife } from '../kaabalah/tree-of-life';
import { loadIntoTreeOfLife as loadTarot, type TarotLoaderOptions } from '../tarot';

export interface TreeOptions {
  kaabalah?: "melkitzedki" | "lurianic";
  tarot?: TarotLoaderOptions;
  astrology?: boolean;
}

/**
 * Creates a new Tree of Life instance with optional system loaders
 * @param opts Configuration options for which systems to load
 * @returns A new TreeOfLife instance with the requested systems loaded
 */
export function createTree(opts: TreeOptions = {
  kaabalah: "melkitzedki",
  tarot: {
    includeMajorArcana: true,
    includeCourtCards: true,
  }
}) {
  const tree = new TreeOfLife();
  
  if (opts.kaabalah) {
    switch (opts.kaabalah) {
      case "melkitzedki":
        loadKaabalah(tree);
        break;
      case "lurianic":
        loadLurianicKabbalah(tree);
        break;
    }
  }
  
  if (opts.tarot) {
    loadTarot(tree, {
      includeMajorArcana: opts.tarot.includeMajorArcana,
      includeCourtCards: opts.tarot.includeCourtCards,
    });
  }
  
  // TODO: implement
  // if (opts.astrology) loadAstrology(tree);
  
  return tree;
}