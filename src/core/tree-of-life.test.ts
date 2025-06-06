import { describe, expect, it } from "vitest";
import { HEBREW_LETTERS_DATA, SPHERES, SPHERES_DATA } from "./constants";
import { TreeOfLife } from "./tree-of-life";
import {
  BaseNode,
  id,
  KaabalahTypes,
  LetterTypes,
  NumerologyTypes,
  TarotTypes,
  WesternAstrologyTypes,
} from "./types";

describe("TreeOfLife", () => {
  it("should add nodes and links, retrieving relations correctly", () => {
    const treeOfLife = new TreeOfLife();

    const kether = treeOfLife.addSphere({
      sphere: SPHERES.KETHER,
      data: SPHERES_DATA.KETHER,
      relatedNumber: 1,
    });
    const chokhmah = treeOfLife.addSphere({
      sphere: SPHERES.CHOKHMAH,
      data: SPHERES_DATA.CHOKHMAH,
      relatedNumber: 2,
    });

    const path11 = treeOfLife.addPath({
      leftSphere: kether,
      rightSphere: chokhmah,
      relatedNumber: 1,
    });

    expect(treeOfLife.related(kether)).toMatchObject([
      { id: id(NumerologyTypes.NUMBER, 1), type: NumerologyTypes.NUMBER },
      { id: path11, type: KaabalahTypes.PATH },
    ]);
    expect(treeOfLife.related(chokhmah)).toMatchObject([
      { id: id(NumerologyTypes.NUMBER, 2), type: NumerologyTypes.NUMBER },
      { id: path11, type: KaabalahTypes.PATH },
    ]);
    expect(treeOfLife.related(path11)).toMatchObject([
      { id: kether, type: KaabalahTypes.SPHERE, data: SPHERES_DATA.KETHER },
      { id: chokhmah, type: KaabalahTypes.SPHERE, data: SPHERES_DATA.CHOKHMAH },
      { id: id(NumerologyTypes.NUMBER, 1), type: NumerologyTypes.NUMBER },
      { id: id(NumerologyTypes.NUMBER, 11), type: NumerologyTypes.NUMBER },
    ]);
  });

  it("should throw an error when trying to link unknown nodes", () => {
    const treeOfLife = new TreeOfLife();

    expect(() =>
      treeOfLife.link(
        id(KaabalahTypes.SPHERE, "Kether"),
        id(KaabalahTypes.SPHERE, "Unknown")
      )
    ).toThrow();
  });

  it("should correctly link nodes", () => {
    const treeOfLife = new TreeOfLife();

    const chokhmah = treeOfLife.addSphere({
      sphere: SPHERES.CHOKHMAH,
      data: SPHERES_DATA.CHOKHMAH,
      relatedNumber: 2,
    });
    const binah = treeOfLife.addSphere({
      sphere: SPHERES.BINAH,
      data: SPHERES_DATA.BINAH,
      relatedNumber: 3,
    });

    const path14 = treeOfLife.addPath({
      leftSphere: chokhmah,
      rightSphere: binah,
      relatedNumber: 4,
    });

    treeOfLife.addLetters({
      path: path14,
      letters: [
        {
          letter: "Aleph",
          type: LetterTypes.HEBREW_LETTER,
          data: HEBREW_LETTERS_DATA.ALEPH,
        },
        { letter: "A", type: LetterTypes.LATIN_LETTER },
      ],
    });

    const air = treeOfLife.upsertNode(
      new BaseNode({ id: "Air", type: WesternAstrologyTypes.WESTERN_ELEMENT })
    );
    treeOfLife.link(path14, air);

    const jupiter = treeOfLife.upsertNode(
      new BaseNode({ id: "Jupiter", type: WesternAstrologyTypes.PLANET })
    );
    treeOfLife.link(path14, jupiter);

    const theEmperor = treeOfLife.addTarotArkAnnu({
      node: path14,
      tarotArkAnnu: "The Emperor",
      data: { type: "major" },
      relatedNumber: 14,
    });

    expect(treeOfLife.related(path14)).toMatchObject([
      { id: chokhmah, type: KaabalahTypes.SPHERE, data: SPHERES_DATA.CHOKHMAH },
      { id: binah, type: KaabalahTypes.SPHERE, data: SPHERES_DATA.BINAH },
      { id: id(NumerologyTypes.NUMBER, 4), type: NumerologyTypes.NUMBER },
      { id: id(NumerologyTypes.NUMBER, 14), type: NumerologyTypes.NUMBER },
      {
        id: id(LetterTypes.HEBREW_LETTER, "Aleph"),
        type: LetterTypes.HEBREW_LETTER,
      },
      { id: id(LetterTypes.LATIN_LETTER, "A"), type: LetterTypes.LATIN_LETTER },
      { id: air, type: WesternAstrologyTypes.WESTERN_ELEMENT },
      { id: jupiter, type: WesternAstrologyTypes.PLANET },
      { id: theEmperor, type: TarotTypes.TAROT_ARK_ANNU },
    ]);

    expect(treeOfLife.relatedTypes(theEmperor)).toHaveLength(2);
    expect(
      treeOfLife.walk(theEmperor, 2, WesternAstrologyTypes.WESTERN_ELEMENT)
    ).toMatchObject([{ id: air, type: WesternAstrologyTypes.WESTERN_ELEMENT }]);
  });

  it("should correctly remove nodes", () => {
    const treeOfLife = new TreeOfLife();

    const chokhmah = treeOfLife.addSphere({
      sphere: SPHERES.CHOKHMAH,
      data: SPHERES_DATA.CHOKHMAH,
      relatedNumber: 2,
    });
    const binah = treeOfLife.addSphere({
      sphere: SPHERES.BINAH,
      data: SPHERES_DATA.BINAH,
      relatedNumber: 3,
    });

    const path14 = treeOfLife.addPath({
      leftSphere: chokhmah,
      rightSphere: binah,
      relatedNumber: 4,
    });

    treeOfLife.removeNode(chokhmah);

    expect(treeOfLife.related(chokhmah)).toEqual([]);
    expect(treeOfLife.related(binah)).toMatchObject([
      { id: id(NumerologyTypes.NUMBER, 3), type: NumerologyTypes.NUMBER },
      { id: path14, type: KaabalahTypes.PATH },
    ]);
    expect(treeOfLife.related(path14)).toMatchObject([
      { id: binah, type: KaabalahTypes.SPHERE, data: SPHERES_DATA.BINAH },
      { id: id(NumerologyTypes.NUMBER, 4), type: NumerologyTypes.NUMBER },
      { id: id(NumerologyTypes.NUMBER, 14), type: NumerologyTypes.NUMBER },
    ]);
  });
});
