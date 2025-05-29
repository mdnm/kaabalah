import { SPHERES } from '../kaabalah/constants';
import type { TreeOfLife } from '../kaabalah/tree-of-life';
import { ARKANNUS } from './index';

export interface TarotLoaderOptions {
  includeMajorArcana?: boolean;
  includeCourtCards?: boolean;
}

/**
 * Loads the Tarot system into the Tree of Life, creating correspondences between:
 * - Major Arcana and the 22 paths
 * - Court cards and the spheres (optional)
 * 
 * @param tree The Tree of Life instance to load into
 * @param options Configuration options for the loader
 * @returns The tree instance for chaining
 */
export function loadIntoTreeOfLife(tree: TreeOfLife, options: TarotLoaderOptions = {}) {
  // TODO: just a mock up for now
  
  const {
    includeMajorArcana = true,
    includeCourtCards = false
  } = options;

  if (includeMajorArcana) {
    for (const card of ARKANNUS) {
      if (card.type !== 'major') {
        continue;
      }

      const pathNumber = card.number;

      tree.correspond(
        `path:${pathNumber}`, 
        `major_arcana:${card.tarotCardFilename}`,
        'majorArcana'
      );
    };
  }

  if (includeCourtCards) {
    // TODO
    tree.correspond(SPHERES.CHOKMAH, 'court:king', 'minorArcana');
    tree.correspond(SPHERES.BINAH, 'court:queen', 'minorArcana');
    tree.correspond(SPHERES.TIPHERETH, 'court:knight', 'minorArcana');
    tree.correspond(SPHERES.MALKUTH, 'court:page', 'minorArcana');
  }

  return tree;
} 