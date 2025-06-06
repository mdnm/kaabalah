import { describe, expect, it } from 'vitest';

import { SPHERES } from '../constants';
import { TreeOfLife } from '../tree-of-life';
import { id, KaabalahTypes } from '../types';
import { loadLurianicKabbalah, unloadLurianicKabbalah } from './lurianic-kabbalah';

describe('loadLurianicKabbalah', () => {
  it('should load the Lurianic Kabbalah system correctly', () => {
    const tree = new TreeOfLife();
    loadLurianicKabbalah(tree);

    expect(tree.related(id(KaabalahTypes.SPHERE, SPHERES.KETHER), KaabalahTypes.PATH)).toHaveLength(3);
    expect(tree.related(id(KaabalahTypes.SPHERE, SPHERES.CHOKHMAH), KaabalahTypes.PATH)).toHaveLength(5);
    expect(tree.related(id(KaabalahTypes.SPHERE, SPHERES.BINAH), KaabalahTypes.PATH)).toHaveLength(5);
    expect(tree.related(id(KaabalahTypes.SPHERE, SPHERES.CHESED), KaabalahTypes.PATH)).toHaveLength(5);
    expect(tree.related(id(KaabalahTypes.SPHERE, SPHERES.GEBURAH), KaabalahTypes.PATH)).toHaveLength(5);
    expect(tree.related(id(KaabalahTypes.SPHERE, SPHERES.TIPHARETH), KaabalahTypes.PATH)).toHaveLength(8);
    expect(tree.related(id(KaabalahTypes.SPHERE, SPHERES.NETZACH), KaabalahTypes.PATH)).toHaveLength(4);
    expect(tree.related(id(KaabalahTypes.SPHERE, SPHERES.HOD), KaabalahTypes.PATH)).toHaveLength(4);
    expect(tree.related(id(KaabalahTypes.SPHERE, SPHERES.YESOD), KaabalahTypes.PATH)).toHaveLength(4);
    expect(tree.related(id(KaabalahTypes.SPHERE, SPHERES.MALKUTH), KaabalahTypes.PATH)).toHaveLength(1);
  });

  it('should correctly unload the Lurianic Kabbalah system', () => {
    const tree = new TreeOfLife();
    loadLurianicKabbalah(tree);

    unloadLurianicKabbalah(tree);

    expect(tree.related(id(KaabalahTypes.SPHERE, SPHERES.KETHER), KaabalahTypes.PATH)).toHaveLength(0);
    expect(tree.related(id(KaabalahTypes.SPHERE, SPHERES.CHOKHMAH), KaabalahTypes.PATH)).toHaveLength(0);
    expect(tree.related(id(KaabalahTypes.SPHERE, SPHERES.BINAH), KaabalahTypes.PATH)).toHaveLength(0);
    expect(tree.related(id(KaabalahTypes.SPHERE, SPHERES.TIPHARETH), KaabalahTypes.PATH)).toHaveLength(0);
    expect(tree.related(id(KaabalahTypes.SPHERE, SPHERES.NETZACH), KaabalahTypes.PATH)).toHaveLength(0);
    expect(tree.related(id(KaabalahTypes.SPHERE, SPHERES.HOD), KaabalahTypes.PATH)).toHaveLength(0);
    expect(tree.related(id(KaabalahTypes.SPHERE, SPHERES.YESOD), KaabalahTypes.PATH)).toHaveLength(0);
    expect(tree.related(id(KaabalahTypes.SPHERE, SPHERES.MALKUTH), KaabalahTypes.PATH)).toHaveLength(0);
  });
});