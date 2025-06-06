import { describe, expect, it } from "vitest";

import { SPHERES } from "../constants";
import { TreeOfLife } from "../tree-of-life";
import { id, KaabalahTypes, MiscTypes, WesternAstrologyTypes } from "../types";
import {
  loadColors,
  loadHermeticQabalah,
  loadMusicalNotes,
  loadWesternAstrology,
  unloadColors,
  unloadHermeticQabalah,
  unloadMusicalNotes,
  unloadWesternAstrology,
} from "./hermetic-qabalah";

describe("loadHermeticQabalah", () => {
  it("should load the Kaabalah system correctly", () => {
    const tree = new TreeOfLife();
    loadHermeticQabalah(tree);

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
    loadHermeticQabalah(tree);

    unloadHermeticQabalah(tree);

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
    loadHermeticQabalah(tree);
    loadColors(tree);

    expect(
      tree.related(id(KaabalahTypes.SPHERE, SPHERES.MALKUTH), MiscTypes.COLOR)
    ).toHaveLength(4);
  });

  it("should correctly unload the colors", () => {
    const tree = new TreeOfLife();
    loadHermeticQabalah(tree);
    loadColors(tree);

    unloadColors(tree);

    expect(
      tree.related(id(KaabalahTypes.SPHERE, SPHERES.MALKUTH), MiscTypes.COLOR)
    ).toHaveLength(0);
  });

  it("should correctly load the musical notes", () => {
    const tree = new TreeOfLife();
    loadHermeticQabalah(tree);
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
    loadHermeticQabalah(tree);
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
    loadHermeticQabalah(tree);
    loadWesternAstrology(tree);

    expect(
      tree.related(
        id(KaabalahTypes.SPHERE, SPHERES.MALKUTH),
        WesternAstrologyTypes.PLANET
      )
    ).toHaveLength(1);
  });

  it("should correctly unload the western astrology", () => {
    const tree = new TreeOfLife();
    loadHermeticQabalah(tree);
    loadWesternAstrology(tree);

    unloadWesternAstrology(tree);

    expect(
      tree.related(
        id(KaabalahTypes.SPHERE, SPHERES.MALKUTH),
        WesternAstrologyTypes.PLANET
      )
    ).toHaveLength(0);
  });
});
