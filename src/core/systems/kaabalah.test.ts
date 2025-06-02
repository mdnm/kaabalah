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

  it('should correctly load the bridge between colors and musical notes (colors first)', () => {
    const tree = new TreeOfLife();
    tree.loadSystem('kaabalah');
    tree.loadPart('colors');
    tree.loadPart('music');

    const malkuthColors = tree.related(SPHERES.MALKUTH, "color")

    expect(malkuthColors).toHaveLength(1);

    const malkuthMusicalNote = tree.related(SPHERES.MALKUTH, "musicalNote")

    expect(malkuthMusicalNote).toHaveLength(1);
    expect(tree.related(malkuthMusicalNote[0]?.id, "color")).toHaveLength(1);
  });

  it('should correctly load the bridge between colors and musical notes (music first)', () => {
    const tree = new TreeOfLife();
    tree.loadSystem('kaabalah');
    tree.loadPart('music');
    tree.loadPart('colors');

    const malkuthColors = tree.related(SPHERES.MALKUTH, "color")

    expect(malkuthColors).toHaveLength(1);

    const malkuthMusicalNote = tree.related(SPHERES.MALKUTH, "musicalNote")

    expect(malkuthMusicalNote).toHaveLength(1);
    expect(tree.related(malkuthMusicalNote[0]?.id, "color")).toHaveLength(1);
  });

  it('should correctly load the bridge between colors and western astrology (colors first)', () => {
    const tree = new TreeOfLife();
    tree.loadSystem('kaabalah');
    tree.loadPart('colors');
    tree.loadPart('westernAstrology');

    const hodColors = tree.related(SPHERES.HOD, "color");

    expect(hodColors).toHaveLength(1);

    const zodiacSign = tree.related(hodColors[0].id, "westernZodiacSign");

    expect(zodiacSign).toHaveLength(1);
  });

  it('should correctly load the bridge between colors and western astrology (astrology first)', () => {
    const tree = new TreeOfLife();
    tree.loadSystem('kaabalah');
    tree.loadPart('westernAstrology');
    tree.loadPart('colors');

    const hodColors = tree.related(SPHERES.HOD, "color");

    expect(hodColors).toHaveLength(1);

    const zodiacSign = tree.related(hodColors[0].id, "westernZodiacSign");

    expect(zodiacSign).toHaveLength(1);
  });

  it('should correctly load the bridge between music and western astrology (music first)', () => {
    const tree = new TreeOfLife();
    tree.loadSystem('kaabalah');
    tree.loadPart('music');
    tree.loadPart('westernAstrology');

    const path15ZodiacSign = tree.related(`path:${MELKITZEDEKI_PATHS.CHOKHMAH_TIPHARETH}`, "westernZodiacSign");

    expect(path15ZodiacSign).toHaveLength(1);

    const musicalNote = tree.related(path15ZodiacSign[0]?.id, "musicalNote");

    expect(musicalNote).toHaveLength(1);
  });

  it('should correctly load the bridge between music and western astrology (astrology first)', () => {
    const tree = new TreeOfLife();
    tree.loadSystem('kaabalah');
    tree.loadPart('westernAstrology');
    tree.loadPart('music');

    const path15ZodiacSign = tree.related(`path:${MELKITZEDEKI_PATHS.CHOKHMAH_TIPHARETH}`, "westernZodiacSign");

    expect(path15ZodiacSign).toHaveLength(1);

    const musicalNote = tree.related(path15ZodiacSign[0]?.id, "musicalNote");

    expect(musicalNote).toHaveLength(1);
  });
});