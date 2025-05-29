import { describe, expect, it } from 'vitest';

import { SPHERES } from '../constants';
import { TreeOfLife } from '../tree-of-life';
import { loadLurianicKabbalah, unloadLurianicKabbalah } from './lurianic-kabbalah';

describe('loadLurianicKabbalah', () => {
  it('should load the Lurianic Kabbalah system correctly', () => {
    const tree = new TreeOfLife();
    loadLurianicKabbalah(tree);

    expect(tree.related(SPHERES.KETHER, "path")).toHaveLength(3);
    expect(tree.related(SPHERES.CHOKMAH, "path")).toHaveLength(5);
    expect(tree.related(SPHERES.BINAH, "path")).toHaveLength(5);
    expect(tree.related(SPHERES.CHESED, "path")).toHaveLength(5);
    expect(tree.related(SPHERES.GEBURAH, "path")).toHaveLength(5);
    expect(tree.related(SPHERES.TIPHERETH, "path")).toHaveLength(8);
    expect(tree.related(SPHERES.NETZACH, "path")).toHaveLength(4);
    expect(tree.related(SPHERES.HOD, "path")).toHaveLength(4);
    expect(tree.related(SPHERES.YESOD, "path")).toHaveLength(4);
    expect(tree.related(SPHERES.MALKUTH, "path")).toHaveLength(1);
  });

  it('should correctly unload the Lurianic Kabbalah system', () => {
    const tree = new TreeOfLife();
    loadLurianicKabbalah(tree);

    unloadLurianicKabbalah(tree);

    expect(tree.related(SPHERES.KETHER)).toHaveLength(0);
    expect(tree.related(SPHERES.CHOKMAH)).toHaveLength(0);
    expect(tree.related(SPHERES.BINAH)).toHaveLength(0);
    expect(tree.related(SPHERES.TIPHERETH)).toHaveLength(0);
    expect(tree.related(SPHERES.NETZACH)).toHaveLength(0);
    expect(tree.related(SPHERES.HOD)).toHaveLength(0);
    expect(tree.related(SPHERES.YESOD)).toHaveLength(0);
    expect(tree.related(SPHERES.MALKUTH)).toHaveLength(0);
  });
});