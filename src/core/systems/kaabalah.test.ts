import { describe, expect, it } from "vitest";

import { MELKITZEDEKI_PATHS, SPHERES, WESTERN_ELEMENTS } from "../constants";
import { TreeOfLife } from "../tree-of-life";
import {
  id,
  KaabalahTypes,
  MiscTypes,
  TarotTypes,
  WesternAstrologyTypes,
} from "../types";
import {
  loadColors,
  loadKaabalah,
  loadMusicalNotes,
  loadTarot,
  loadWesternAstrology,
  unloadColors,
  unloadKaabalah,
  unloadMusicalNotes,
  unloadTarot,
  unloadWesternAstrology,
} from "./kaabalah";

describe("loadKaabalah", () => {
  it("should load the Kaabalah system correctly", () => {
    const tree = new TreeOfLife();
    loadKaabalah(tree);

    expect(
      tree.related(id(KaabalahTypes.SPHERE, SPHERES.KETHER), KaabalahTypes.PATH)
    ).toHaveLength(3);
    expect(
      tree.related(
        id(KaabalahTypes.SPHERE, SPHERES.CHOKHMAH),
        KaabalahTypes.PATH
      )
    ).toHaveLength(4);
    expect(
      tree.related(id(KaabalahTypes.SPHERE, SPHERES.BINAH), KaabalahTypes.PATH)
    ).toHaveLength(4);
    expect(
      tree.related(id(KaabalahTypes.SPHERE, SPHERES.CHESED), KaabalahTypes.PATH)
    ).toHaveLength(4);
    expect(
      tree.related(
        id(KaabalahTypes.SPHERE, SPHERES.GEBURAH),
        KaabalahTypes.PATH
      )
    ).toHaveLength(4);
    expect(
      tree.related(
        id(KaabalahTypes.SPHERE, SPHERES.TIPHARETH),
        KaabalahTypes.PATH
      )
    ).toHaveLength(8);
    expect(
      tree.related(
        id(KaabalahTypes.SPHERE, SPHERES.NETZACH),
        KaabalahTypes.PATH
      )
    ).toHaveLength(5);
    expect(
      tree.related(id(KaabalahTypes.SPHERE, SPHERES.HOD), KaabalahTypes.PATH)
    ).toHaveLength(5);
    expect(
      tree.related(id(KaabalahTypes.SPHERE, SPHERES.YESOD), KaabalahTypes.PATH)
    ).toHaveLength(4);
    expect(
      tree.related(
        id(KaabalahTypes.SPHERE, SPHERES.MALKUTH),
        KaabalahTypes.PATH
      )
    ).toHaveLength(3);
  });

  it("should correctly unload the Kaabalah system", () => {
    const tree = new TreeOfLife();
    loadKaabalah(tree);

    unloadKaabalah(tree);

    expect(
      tree.related(id(KaabalahTypes.SPHERE, SPHERES.KETHER), KaabalahTypes.PATH)
    ).toHaveLength(0);
    expect(
      tree.related(
        id(KaabalahTypes.SPHERE, SPHERES.CHOKHMAH),
        KaabalahTypes.PATH
      )
    ).toHaveLength(0);
    expect(
      tree.related(id(KaabalahTypes.SPHERE, SPHERES.BINAH), KaabalahTypes.PATH)
    ).toHaveLength(0);
    expect(
      tree.related(id(KaabalahTypes.SPHERE, SPHERES.CHESED), KaabalahTypes.PATH)
    ).toHaveLength(0);
    expect(
      tree.related(
        id(KaabalahTypes.SPHERE, SPHERES.GEBURAH),
        KaabalahTypes.PATH
      )
    ).toHaveLength(0);
    expect(
      tree.related(
        id(KaabalahTypes.SPHERE, SPHERES.TIPHARETH),
        KaabalahTypes.PATH
      )
    ).toHaveLength(0);
    expect(
      tree.related(
        id(KaabalahTypes.SPHERE, SPHERES.NETZACH),
        KaabalahTypes.PATH
      )
    ).toHaveLength(0);
    expect(
      tree.related(id(KaabalahTypes.SPHERE, SPHERES.HOD), KaabalahTypes.PATH)
    ).toHaveLength(0);
    expect(
      tree.related(id(KaabalahTypes.SPHERE, SPHERES.YESOD), KaabalahTypes.PATH)
    ).toHaveLength(0);
    expect(
      tree.related(
        id(KaabalahTypes.SPHERE, SPHERES.MALKUTH),
        KaabalahTypes.PATH
      )
    ).toHaveLength(0);
  });

  it("should correctly load the colors", () => {
    const tree = new TreeOfLife();
    loadKaabalah(tree);
    loadColors(tree);

    expect(
      tree.related(id(KaabalahTypes.SPHERE, SPHERES.MALKUTH), MiscTypes.COLOR)
    ).toHaveLength(1);
  });

  it("should correctly unload the colors", () => {
    const tree = new TreeOfLife();
    loadKaabalah(tree);
    loadColors(tree);

    unloadColors(tree);

    expect(
      tree.related(id(KaabalahTypes.SPHERE, SPHERES.MALKUTH), MiscTypes.COLOR)
    ).toHaveLength(0);
  });

  it("should correctly load the musical notes", () => {
    const tree = new TreeOfLife();
    loadKaabalah(tree);
    loadMusicalNotes(tree);

    expect(
      tree.related(
        id(KaabalahTypes.SPHERE, SPHERES.MALKUTH),
        MiscTypes.MUSICAL_NOTE
      )
    ).toHaveLength(1);
  });

  it("should correctly unload the musical notes", () => {
    const tree = new TreeOfLife();
    loadKaabalah(tree);
    loadMusicalNotes(tree);

    unloadMusicalNotes(tree);

    expect(
      tree.related(
        id(KaabalahTypes.SPHERE, SPHERES.MALKUTH),
        MiscTypes.MUSICAL_NOTE
      )
    ).toHaveLength(0);
  });

  it("should correctly load the western astrology", () => {
    const tree = new TreeOfLife();
    loadKaabalah(tree);
    loadWesternAstrology(tree);

    expect(
      tree.related(
        id(KaabalahTypes.SPHERE, SPHERES.MALKUTH),
        WesternAstrologyTypes.PLANET
      )
    ).toHaveLength(1);

    const path11 = id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.KETHER_CHOKHMAH);
    const path12 = id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.KETHER_BINAH);
    const path15 = id(
      KaabalahTypes.PATH,
      MELKITZEDEKI_PATHS.CHOKHMAH_TIPHARETH
    );
    expect(
      tree.related(path11, WesternAstrologyTypes.WESTERN_ELEMENT)
    ).toHaveLength(1);
    expect(tree.related(path12, WesternAstrologyTypes.PLANET)).toHaveLength(1);
    expect(
      tree.related(path15, WesternAstrologyTypes.WESTERN_ZODIAC_SIGN)
    ).toHaveLength(1);
  });

  it("should correctly unload the western astrology", () => {
    const tree = new TreeOfLife();
    loadKaabalah(tree);
    loadWesternAstrology(tree);

    unloadWesternAstrology(tree);

    expect(
      tree.related(
        id(KaabalahTypes.SPHERE, SPHERES.MALKUTH),
        WesternAstrologyTypes.PLANET
      )
    ).toHaveLength(0);

    const path11 = id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.KETHER_CHOKHMAH);
    const path12 = id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.KETHER_BINAH);
    const path15 = id(
      KaabalahTypes.PATH,
      MELKITZEDEKI_PATHS.CHOKHMAH_TIPHARETH
    );

    expect(
      tree.related(path11, WesternAstrologyTypes.WESTERN_ELEMENT)
    ).toHaveLength(0);
    expect(tree.related(path12, WesternAstrologyTypes.PLANET)).toHaveLength(0);
    expect(
      tree.related(path15, WesternAstrologyTypes.WESTERN_ZODIAC_SIGN)
    ).toHaveLength(0);
  });

  it("should correctly load the tarot", () => {
    const tree = new TreeOfLife();
    loadKaabalah(tree);
    loadTarot(tree);

    expect(
      tree.related(
        id(KaabalahTypes.SPHERE, SPHERES.MALKUTH),
        TarotTypes.TAROT_ARK_ANNU
      )
    ).toHaveLength(4);

    const path11 = id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.KETHER_CHOKHMAH);
    const path12 = id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.KETHER_BINAH);
    const path15 = id(
      KaabalahTypes.PATH,
      MELKITZEDEKI_PATHS.CHOKHMAH_TIPHARETH
    );

    expect(tree.related(path11, TarotTypes.TAROT_ARK_ANNU)).toHaveLength(1);
    expect(tree.related(path12, TarotTypes.TAROT_ARK_ANNU)).toHaveLength(1);
    expect(tree.related(path15, TarotTypes.TAROT_ARK_ANNU)).toHaveLength(1);

    expect(
      tree.related(
        id(WesternAstrologyTypes.WESTERN_ELEMENT, WESTERN_ELEMENTS.FIRE),
        TarotTypes.TAROT_SUIT
      )
    ).toHaveLength(1);
  });

  it("should correctly unload the tarot", () => {
    const tree = new TreeOfLife();
    loadKaabalah(tree);
    loadTarot(tree);

    unloadTarot(tree);

    expect(
      tree.related(
        id(KaabalahTypes.SPHERE, SPHERES.MALKUTH),
        TarotTypes.TAROT_ARK_ANNU
      )
    ).toHaveLength(0);

    const path11 = id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.KETHER_CHOKHMAH);
    const path12 = id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.KETHER_BINAH);
    const path15 = id(
      KaabalahTypes.PATH,
      MELKITZEDEKI_PATHS.CHOKHMAH_TIPHARETH
    );

    expect(tree.related(path11, TarotTypes.TAROT_ARK_ANNU)).toHaveLength(0);
    expect(tree.related(path12, TarotTypes.TAROT_ARK_ANNU)).toHaveLength(0);
    expect(tree.related(path15, TarotTypes.TAROT_ARK_ANNU)).toHaveLength(0);

    expect(
      tree.related(
        id(WesternAstrologyTypes.WESTERN_ELEMENT, WESTERN_ELEMENTS.FIRE),
        TarotTypes.TAROT_SUIT
      )
    ).toHaveLength(0);
  });

  it("should correctly load the bridge between colors and musical notes (colors first)", () => {
    const tree = new TreeOfLife();
    tree.loadSystem("kaabalah");
    tree.loadPart("colors");
    tree.loadPart("music");

    const malkuthColors = tree.related(
      id(KaabalahTypes.SPHERE, SPHERES.MALKUTH),
      MiscTypes.COLOR
    );

    expect(malkuthColors).toHaveLength(1);

    const malkuthMusicalNote = tree.related(
      id(KaabalahTypes.SPHERE, SPHERES.MALKUTH),
      MiscTypes.MUSICAL_NOTE
    );

    expect(malkuthMusicalNote).toHaveLength(1);
    expect(
      tree.related(malkuthMusicalNote[0]?.id, MiscTypes.COLOR)
    ).toHaveLength(1);
  });

  it("should correctly load the bridge between colors and musical notes (music first)", () => {
    const tree = new TreeOfLife();
    tree.loadSystem("kaabalah");
    tree.loadPart("music");
    tree.loadPart("colors");

    const malkuthColors = tree.related(
      id(KaabalahTypes.SPHERE, SPHERES.MALKUTH),
      MiscTypes.COLOR
    );

    expect(malkuthColors).toHaveLength(1);

    const malkuthMusicalNote = tree.related(
      id(KaabalahTypes.SPHERE, SPHERES.MALKUTH),
      MiscTypes.MUSICAL_NOTE
    );

    expect(malkuthMusicalNote).toHaveLength(1);
    expect(
      tree.related(malkuthMusicalNote[0]?.id, MiscTypes.COLOR)
    ).toHaveLength(1);
  });

  it("should correctly load the bridge between colors and western astrology (colors first)", () => {
    const tree = new TreeOfLife();
    tree.loadSystem("kaabalah");
    tree.loadPart("colors");
    tree.loadPart("westernAstrology");

    const hodColors = tree.related(
      id(KaabalahTypes.SPHERE, SPHERES.HOD),
      MiscTypes.COLOR
    );

    expect(hodColors).toHaveLength(1);

    const zodiacSign = tree.related(
      hodColors[0].id,
      WesternAstrologyTypes.WESTERN_ZODIAC_SIGN
    );

    expect(zodiacSign).toHaveLength(1);
  });

  it("should correctly load the bridge between colors and western astrology (astrology first)", () => {
    const tree = new TreeOfLife();
    tree.loadSystem("kaabalah");
    tree.loadPart("westernAstrology");
    tree.loadPart("colors");

    const hodColors = tree.related(
      id(KaabalahTypes.SPHERE, SPHERES.HOD),
      MiscTypes.COLOR
    );

    expect(hodColors).toHaveLength(1);

    const zodiacSign = tree.related(
      hodColors[0].id,
      WesternAstrologyTypes.WESTERN_ZODIAC_SIGN
    );

    expect(zodiacSign).toHaveLength(1);
  });

  it("should correctly load the bridge between music and western astrology (music first)", () => {
    const tree = new TreeOfLife();
    tree.loadSystem("kaabalah");
    tree.loadPart("music");
    tree.loadPart("westernAstrology");

    const path15ZodiacSign = tree.related(
      id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.CHOKHMAH_TIPHARETH),
      WesternAstrologyTypes.WESTERN_ZODIAC_SIGN
    );

    expect(path15ZodiacSign).toHaveLength(1);

    const musicalNote = tree.related(
      path15ZodiacSign[0]?.id,
      MiscTypes.MUSICAL_NOTE
    );

    expect(musicalNote).toHaveLength(1);
  });

  it("should correctly load the bridge between music and western astrology (astrology first)", () => {
    const tree = new TreeOfLife();
    tree.loadSystem("kaabalah");
    tree.loadPart("westernAstrology");
    tree.loadPart("music");

    const path15ZodiacSign = tree.related(
      id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.CHOKHMAH_TIPHARETH),
      WesternAstrologyTypes.WESTERN_ZODIAC_SIGN
    );

    expect(path15ZodiacSign).toHaveLength(1);

    const musicalNote = tree.related(
      path15ZodiacSign[0]?.id,
      MiscTypes.MUSICAL_NOTE
    );

    expect(musicalNote).toHaveLength(1);
  });
});
