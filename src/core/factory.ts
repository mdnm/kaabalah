import { loadHermeticQabalah, loadColors as loadHermeticQabalahColors } from '../kaabalah/loaders/hermetic-qabalah';
import { loadKaabalah, loadColors as loadKaabalahColors } from '../kaabalah/loaders/kaabalah';
import { loadLurianicKabbalah } from '../kaabalah/loaders/lurianic-kabbalah';
import { TreeOfLife } from '../kaabalah/tree-of-life';

export interface TreeOptions {
  kaabalah?: "melkitzedki" | "lurianic" | "hermetic-qabalah";
  colors?: boolean;
  // tarot?: TarotLoaderOptions;
  // astrology?: boolean;
}

/**
 * Creates a new Tree of Life instance with optional system loaders
 * @param opts Configuration options for which systems to load
 * @returns A new TreeOfLife instance with the requested systems loaded
 */
export function createTree(opts: TreeOptions = {
  kaabalah: "melkitzedki",
  colors: true,
}) {
  const tree = new TreeOfLife();
  
  if (opts.kaabalah) {
    switch (opts.kaabalah) {
      case "melkitzedki":
        loadKaabalah(tree);
        if (opts.colors) {
          loadKaabalahColors(tree);
        }
        break;
      case "lurianic":
        loadLurianicKabbalah(tree);
        break;
      case "hermetic-qabalah":
        loadHermeticQabalah(tree);
        if (opts.colors) {
          loadHermeticQabalahColors(tree);
        }
        break;
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