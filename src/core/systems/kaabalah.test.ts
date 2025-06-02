import { describe, expect, it } from 'vitest';

import { MELKITZEDEKI_PATHS, SPHERES, WESTERN_ELEMENTS } from '../constants';
import { TreeOfLife } from '../tree-of-life';
import { loadColors, loadKaabalah, loadMusicalNotes, loadTarot, loadWesternAstrology, unloadColors, unloadKaabalah, unloadMusicalNotes, unloadTarot, unloadWesternAstrology } from './kaabalah';

describe('loadKaabalah', () => {
  it('should load the Kaabalah system correctly', () => {
    const tree = new TreeOfLife();
    loadKaabalah(tree);

    expect(tree.related(SPHERES.KETHER, "path")).toHaveLength(3);
    expect(tree.related(SPHERES.CHOKHMAH, "path")).toHaveLength(4);
    expect(tree.related(SPHERES.BINAH, "path")).toHaveLength(4);
    expect(tree.related(SPHERES.CHESED, "path")).toHaveLength(4);
    expect(tree.related(SPHERES.GEBURAH, "path")).toHaveLength(4);
    expect(tree.related(SPHERES.TIPHARETH, "path")).toHaveLength(8);
    expect(tree.related(SPHERES.NETZACH, "path")).toHaveLength(5);
    expect(tree.related(SPHERES.HOD, "path")).toHaveLength(5);
    expect(tree.related(SPHERES.YESOD, "path")).toHaveLength(4);
    expect(tree.related(SPHERES.MALKUTH, "path")).toHaveLength(3);
  });

  it('should correctly unload the Kaabalah system', () => {
    const tree = new TreeOfLife();
    loadKaabalah(tree);

    unloadKaabalah(tree);

    expect(tree.related(SPHERES.KETHER)).toHaveLength(0);
    expect(tree.related(SPHERES.CHOKHMAH)).toHaveLength(0);
    expect(tree.related(SPHERES.BINAH)).toHaveLength(0);
    expect(tree.related(SPHERES.CHESED)).toHaveLength(0);
    expect(tree.related(SPHERES.GEBURAH)).toHaveLength(0);
    expect(tree.related(SPHERES.TIPHARETH)).toHaveLength(0);
    expect(tree.related(SPHERES.NETZACH)).toHaveLength(0);
    expect(tree.related(SPHERES.HOD)).toHaveLength(0);
    expect(tree.related(SPHERES.YESOD)).toHaveLength(0);
    expect(tree.related(SPHERES.MALKUTH)).toHaveLength(0);
  });

  it('should correctly load the colors', () => {
    const tree = new TreeOfLife();
    loadKaabalah(tree);
    loadColors(tree);

    expect(tree.related(SPHERES.MALKUTH, "color")).toHaveLength(1);
  });

  it('should correctly unload the colors', () => {
    const tree = new TreeOfLife();
    loadKaabalah(tree);
    loadColors(tree);

    unloadColors(tree);

    expect(tree.related(SPHERES.MALKUTH, "color")).toHaveLength(0);
  });

  it('should correctly load the musical notes', () => {
    const tree = new TreeOfLife();
    loadKaabalah(tree);
    loadMusicalNotes(tree);

    expect(tree.related(SPHERES.MALKUTH, "musicalNote")).toHaveLength(1);
  });

  it('should correctly unload the musical notes', () => {
    const tree = new TreeOfLife();
    loadKaabalah(tree);
    loadMusicalNotes(tree);

    unloadMusicalNotes(tree);

    expect(tree.related(SPHERES.MALKUTH, "musicalNote")).toHaveLength(0);
  });

  it('should correctly load the western astrology', () => {
    const tree = new TreeOfLife();
    loadKaabalah(tree);
    loadWesternAstrology(tree);

    expect(tree.related(SPHERES.MALKUTH, "planet")).toHaveLength(1);

    const path11 = `path:${MELKITZEDEKI_PATHS.KETHER_CHOKHMAH}`;
    const path12 = `path:${MELKITZEDEKI_PATHS.KETHER_BINAH }`;
    const path15 = `path:${MELKITZEDEKI_PATHS.CHOKHMAH_TIPHARETH}`;
    expect(tree.related(path11, "westernElement")).toHaveLength(1);
    expect(tree.related(path12, "planet")).toHaveLength(1);
    expect(tree.related(path15, "westernZodiacSign")).toHaveLength(1);
  });

  it('should correctly unload the western astrology', () => {
    const tree = new TreeOfLife();
    loadKaabalah(tree);
    loadWesternAstrology(tree);

    unloadWesternAstrology(tree);

    expect(tree.related(SPHERES.MALKUTH, "planet")).toHaveLength(0);

    const path11 = `path:${MELKITZEDEKI_PATHS.KETHER_CHOKHMAH}`;
    const path12 = `path:${MELKITZEDEKI_PATHS.KETHER_BINAH }`;
    const path15 = `path:${MELKITZEDEKI_PATHS.CHOKHMAH_TIPHARETH}`;

    expect(tree.related(path11, "westernElement")).toHaveLength(0);
    expect(tree.related(path12, "planet")).toHaveLength(0);
    expect(tree.related(path15, "westernZodiacSign")).toHaveLength(0);
  });

  it('should correctly load the tarot', () => {
    const tree = new TreeOfLife();
    loadKaabalah(tree);
    loadTarot(tree);

    expect(tree.related(SPHERES.MALKUTH, "tarotArkAnnu")).toHaveLength(4);

    const path11 = `path:${MELKITZEDEKI_PATHS.KETHER_CHOKHMAH}`;
    const path12 = `path:${MELKITZEDEKI_PATHS.KETHER_BINAH }`;
    const path15 = `path:${MELKITZEDEKI_PATHS.CHOKHMAH_TIPHARETH}`;

    expect(tree.related(path11, "tarotArkAnnu")).toHaveLength(1);
    expect(tree.related(path12, "tarotArkAnnu")).toHaveLength(1);
    expect(tree.related(path15, "tarotArkAnnu")).toHaveLength(1);

    expect(tree.related(`westernElement:${WESTERN_ELEMENTS.FIRE}`, "tarotSuit")).toHaveLength(1);
  });

  it('should correctly unload the tarot', () => {
    const tree = new TreeOfLife();
    loadKaabalah(tree);
    loadTarot(tree);

    unloadTarot(tree);

    expect(tree.related(SPHERES.MALKUTH, "tarotArkAnnu")).toHaveLength(0);

    const path11 = `path:${MELKITZEDEKI_PATHS.KETHER_CHOKHMAH}`;
    const path12 = `path:${MELKITZEDEKI_PATHS.KETHER_BINAH }`;
    const path15 = `path:${MELKITZEDEKI_PATHS.CHOKHMAH_TIPHARETH}`;

    expect(tree.related(path11, "tarotArkAnnu")).toHaveLength(0);
    expect(tree.related(path12, "tarotArkAnnu")).toHaveLength(0);
    expect(tree.related(path15, "tarotArkAnnu")).toHaveLength(0);

    expect(tree.related(`westernElement:${WESTERN_ELEMENTS.FIRE}`, "tarotSuit")).toHaveLength(0);
  });
});