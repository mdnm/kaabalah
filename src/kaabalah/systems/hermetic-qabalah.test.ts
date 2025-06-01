import { describe, expect, it } from 'vitest';

import { SPHERES } from '../constants';
import { TreeOfLife } from '../tree-of-life';
import { loadColors, loadHermeticQabalah, loadMusicalNotes, unloadColors, unloadHermeticQabalah, unloadMusicalNotes } from './hermetic-qabalah';

describe('loadHermeticQabalah', () => {
  it('should load the Kaabalah system correctly', () => {
    const tree = new TreeOfLife();
    loadHermeticQabalah(tree);

    expect(tree.related(SPHERES.KETHER, "path")).toHaveLength(3);
    expect(tree.related(SPHERES.CHOKMAH, "path")).toHaveLength(4);
    expect(tree.related(SPHERES.BINAH, "path")).toHaveLength(4);
    expect(tree.related(SPHERES.CHESED, "path")).toHaveLength(4);
    expect(tree.related(SPHERES.GEBURAH, "path")).toHaveLength(4);
    expect(tree.related(SPHERES.TIPHERETH, "path")).toHaveLength(8);
    expect(tree.related(SPHERES.NETZACH, "path")).toHaveLength(5);
    expect(tree.related(SPHERES.HOD, "path")).toHaveLength(5);
    expect(tree.related(SPHERES.YESOD, "path")).toHaveLength(4);
    expect(tree.related(SPHERES.MALKUTH, "path")).toHaveLength(3);
  });

  it('should correctly unload the Kaabalah system', () => {
    const tree = new TreeOfLife();
    loadHermeticQabalah(tree);

    unloadHermeticQabalah(tree);

    expect(tree.related(SPHERES.KETHER)).toHaveLength(0);
    expect(tree.related(SPHERES.CHOKMAH)).toHaveLength(0);
    expect(tree.related(SPHERES.BINAH)).toHaveLength(0);
    expect(tree.related(SPHERES.CHESED)).toHaveLength(0);
    expect(tree.related(SPHERES.GEBURAH)).toHaveLength(0);
    expect(tree.related(SPHERES.TIPHERETH)).toHaveLength(0);
    expect(tree.related(SPHERES.NETZACH)).toHaveLength(0);
    expect(tree.related(SPHERES.HOD)).toHaveLength(0);
    expect(tree.related(SPHERES.YESOD)).toHaveLength(0);
    expect(tree.related(SPHERES.MALKUTH)).toHaveLength(0);
  });

  it('should correctly load the colors', () => {
    const tree = new TreeOfLife();
    loadHermeticQabalah(tree);
    loadColors(tree);

    expect(tree.related(SPHERES.MALKUTH, "color")).toHaveLength(4);
  });

  it('should correctly unload the colors', () => {
    const tree = new TreeOfLife();
    loadHermeticQabalah(tree);
    loadColors(tree);

    unloadColors(tree);

    expect(tree.related(SPHERES.MALKUTH, "color")).toHaveLength(0);
  });

  it('should correctly load the musical notes', () => {
    const tree = new TreeOfLife();
    loadHermeticQabalah(tree);
    loadMusicalNotes(tree);

    expect(tree.related(SPHERES.MALKUTH, "musicalNote")).toHaveLength(1);
  });

  it('should correctly unload the musical notes', () => {
    const tree = new TreeOfLife();
    loadHermeticQabalah(tree);
    loadMusicalNotes(tree);

    unloadMusicalNotes(tree);

    expect(tree.related(SPHERES.MALKUTH, "musicalNote")).toHaveLength(0);
  });
});