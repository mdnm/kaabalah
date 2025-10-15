import {
  COLORS,
  COLORS_DATA,
  FOUR_WORLDS,
  FOUR_WORLDS_DATA,
  HEBREW_LETTERS,
  HEBREW_LETTERS_DATA,
  LATIN_LETTERS,
  LATIN_LETTERS_DATA,
  MELKITZEDEKI_PATHS,
  MUSICAL_NOTES,
  MUSICAL_NOTES_DATA,
  PLANETS,
  SPHERES,
  SPHERES_DATA,
  TAROT_ARKANNUS,
  TAROT_ARKANNUS_DATA,
  TAROT_SUITS,
  TarotArkAnnuData,
  WESTERN_ELEMENTS,
  WESTERN_ZODIAC_SIGNS,
  WESTERN_ZODIAC_SIGNS_DATA,
} from "../constants";
import { TreeOfLife } from "../tree-of-life";
import {
  BaseNode,
  id,
  KaabalahTypes,
  LetterTypes,
  MiscTypes,
  NodeData,
  NodeId,
  NodeType,
  TarotTypes,
  WesternAstrologyTypes,
} from "../types";
import { Bridge, Loader, Unloader } from "./registry";

export const SYSTEM = "kaabalah" as const;

/**
 * Loads the Melkitzedki Order Kaabalah system into the tree of life
 */
export const loadKaabalah: Loader = (tree: TreeOfLife) => {
  const spheres = [
    { sphere: SPHERES.KETHER, data: SPHERES_DATA.KETHER, relatedNumber: 1 },
    { sphere: SPHERES.CHOKHMAH, data: SPHERES_DATA.CHOKHMAH, relatedNumber: 2 },
    { sphere: SPHERES.BINAH, data: SPHERES_DATA.BINAH, relatedNumber: 3 },
    { sphere: SPHERES.DAATH, data: SPHERES_DATA.DAATH, relatedNumber: 11 },
    { sphere: SPHERES.CHESED, data: SPHERES_DATA.CHESED, relatedNumber: 4 },
    { sphere: SPHERES.GEBURAH, data: SPHERES_DATA.GEBURAH, relatedNumber: 5 },
    {
      sphere: SPHERES.TIPHARETH,
      data: SPHERES_DATA.TIPHARETH,
      relatedNumber: 6,
    },
    { sphere: SPHERES.NETZACH, data: SPHERES_DATA.NETZACH, relatedNumber: 7 },
    { sphere: SPHERES.HOD, data: SPHERES_DATA.HOD, relatedNumber: 8 },
    { sphere: SPHERES.YESOD, data: SPHERES_DATA.YESOD, relatedNumber: 9 },
    { sphere: SPHERES.MALKUTH, data: SPHERES_DATA.MALKUTH, relatedNumber: 10 },
  ];

  const sphereIds: Record<string, NodeId<KaabalahTypes.SPHERE>> = {};
  for (const sphere of spheres) {
    sphereIds[sphere.sphere] = tree.addSphere(sphere);
  }

  const worldsWithElements: {
    id: string;
    data: NodeData<KaabalahTypes.WORLD>;
    element: string;
  }[] = [
    {
      id: FOUR_WORLDS.ATZILUTH,
      data: FOUR_WORLDS_DATA.ATZILUTH,
      element: WESTERN_ELEMENTS.FIRE,
    },
    {
      id: FOUR_WORLDS.BRIAH,
      data: FOUR_WORLDS_DATA.BRIAH,
      element: WESTERN_ELEMENTS.WATER,
    },
    {
      id: FOUR_WORLDS.YETZIRAH,
      data: FOUR_WORLDS_DATA.YETZIRAH,
      element: WESTERN_ELEMENTS.AIR,
    },
    {
      id: FOUR_WORLDS.ASSIAH,
      data: FOUR_WORLDS_DATA.ASSIAH,
      element: WESTERN_ELEMENTS.EARTH,
    },
  ];
  for (const world of worldsWithElements) {
    const worldId = tree.upsertNode(
      new BaseNode({
        id: world.id,
        type: KaabalahTypes.WORLD,
        data: world.data,
      })
    );

    const elementId = tree.upsertNode(
      new BaseNode({
        id: world.element,
        type: WesternAstrologyTypes.WESTERN_ELEMENT,
      })
    );

    tree.link(worldId, elementId);
  }

  const paths = [
    {
      leftSphere: sphereIds[SPHERES.KETHER],
      rightSphere: sphereIds[SPHERES.CHOKHMAH],
      relatedNumber: MELKITZEDEKI_PATHS.KETHER_CHOKHMAH,
      data: {
        meaning: "Crown's wisdom",
      },
      letters: [
        {
          letter: LATIN_LETTERS.A,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.A,
        },
        {
          letter: HEBREW_LETTERS.ALEPH,
          type: LetterTypes.HEBREW_LETTER,
          data: HEBREW_LETTERS_DATA.ALEPH,
        },
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.KETHER],
      rightSphere: sphereIds[SPHERES.BINAH],
      relatedNumber: MELKITZEDEKI_PATHS.KETHER_BINAH,
      data: {
        meaning: "Transparency's intelligence",
      },
      letters: [
        {
          letter: LATIN_LETTERS.B,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.B,
        },
        {
          letter: HEBREW_LETTERS.BETH,
          type: LetterTypes.HEBREW_LETTER,
          data: HEBREW_LETTERS_DATA.BETH,
        },
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.KETHER],
      rightSphere: sphereIds[SPHERES.TIPHARETH],
      relatedNumber: MELKITZEDEKI_PATHS.KETHER_TIPHARETH,
      data: {
        meaning: "Great Ark Tekton (architect)",
      },
      letters: [
        {
          letter: LATIN_LETTERS.G,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.G,
        },
        {
          letter: HEBREW_LETTERS.GIMEL,
          type: LetterTypes.HEBREW_LETTER,
          data: HEBREW_LETTERS_DATA.GIMEL,
        },
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.CHOKHMAH],
      rightSphere: sphereIds[SPHERES.BINAH],
      relatedNumber: MELKITZEDEKI_PATHS.CHOKHMAH_BINAH,
      data: {
        meaning: "Light's wisdom that becomes sound",
      },
      letters: [
        {
          letter: LATIN_LETTERS.D,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.D,
        },
        {
          letter: HEBREW_LETTERS.DALET,
          type: LetterTypes.HEBREW_LETTER,
          data: HEBREW_LETTERS_DATA.DALET,
        },
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.CHOKHMAH],
      rightSphere: sphereIds[SPHERES.TIPHARETH],
      relatedNumber: MELKITZEDEKI_PATHS.CHOKHMAH_TIPHARETH,
      data: {
        meaning: "Light reaching equilibrium",
      },
      letters: [
        {
          letter: LATIN_LETTERS.E,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.E,
        },
        {
          letter: LATIN_LETTERS.Ã,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.Ã,
        },
        {
          letter: HEBREW_LETTERS.HE,
          type: LetterTypes.HEBREW_LETTER,
          data: HEBREW_LETTERS_DATA.HE,
        },
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.CHOKHMAH],
      rightSphere: sphereIds[SPHERES.CHESED],
      relatedNumber: MELKITZEDEKI_PATHS.CHOKHMAH_CHESED,
      data: {
        meaning: "Expansive light",
      },
      letters: [
        {
          letter: LATIN_LETTERS.V,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.V,
        },
        {
          letter: LATIN_LETTERS.U,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.U,
        },
        {
          letter: LATIN_LETTERS.W,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.W,
        },
        {
          letter: LATIN_LETTERS.O,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.O,
        },
        {
          letter: HEBREW_LETTERS.VAV,
          type: LetterTypes.HEBREW_LETTER,
          data: HEBREW_LETTERS_DATA.VAV,
        },
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.BINAH],
      rightSphere: sphereIds[SPHERES.TIPHARETH],
      relatedNumber: MELKITZEDEKI_PATHS.BINAH_TIPHARETH,
      data: {
        meaning: "Vibration that balances",
      },
      letters: [
        {
          letter: LATIN_LETTERS.Z,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.Z,
        },
        {
          letter: HEBREW_LETTERS.ZAYIN,
          type: LetterTypes.HEBREW_LETTER,
          data: HEBREW_LETTERS_DATA.ZAYIN,
        },
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.BINAH],
      rightSphere: sphereIds[SPHERES.GEBURAH],
      relatedNumber: MELKITZEDEKI_PATHS.BINAH_GEBURAH,
      data: {
        meaning: "Vibration that becomes dual",
      },
      letters: [
        {
          letter: LATIN_LETTERS.H,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.H,
        },
        {
          letter: HEBREW_LETTERS.HET,
          type: LetterTypes.HEBREW_LETTER,
          data: HEBREW_LETTERS_DATA.HET,
        },
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.CHESED],
      rightSphere: sphereIds[SPHERES.GEBURAH],
      relatedNumber: MELKITZEDEKI_PATHS.CHESED_GEBURAH,
      data: {
        meaning: "Expansion towards duality",
      },
      letters: [
        {
          letter: LATIN_LETTERS.T,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.T,
        },
        {
          letter: HEBREW_LETTERS.TET,
          type: LetterTypes.HEBREW_LETTER,
          data: HEBREW_LETTERS_DATA.TET,
        },
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.CHESED],
      rightSphere: sphereIds[SPHERES.TIPHARETH],
      relatedNumber: MELKITZEDEKI_PATHS.CHESED_TIPHARETH,
      data: {
        meaning: "Expansion of equilibrium",
      },
      letters: [
        {
          letter: LATIN_LETTERS.I,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.I,
        },
        {
          letter: LATIN_LETTERS.Y,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.Y,
        },
        {
          letter: LATIN_LETTERS.J,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.J,
        },
        {
          letter: HEBREW_LETTERS.YOD,
          type: LetterTypes.HEBREW_LETTER,
          data: HEBREW_LETTERS_DATA.YOD,
        },
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.CHESED],
      rightSphere: sphereIds[SPHERES.NETZACH],
      relatedNumber: MELKITZEDEKI_PATHS.CHESED_NETZACH,
      data: {
        meaning: "Expansion of victory",
      },
      letters: [
        {
          letter: LATIN_LETTERS.C,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.C,
        },
        {
          letter: HEBREW_LETTERS.KAPH,
          type: LetterTypes.HEBREW_LETTER,
          data: HEBREW_LETTERS_DATA.KAPH,
        },
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.GEBURAH],
      rightSphere: sphereIds[SPHERES.TIPHARETH],
      relatedNumber: MELKITZEDEKI_PATHS.GEBURAH_TIPHARETH,
      data: {
        meaning: "Harmonizing duality",
      },
      letters: [
        {
          letter: LATIN_LETTERS.L,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.L,
        },
        {
          letter: HEBREW_LETTERS.LAMED,
          type: LetterTypes.HEBREW_LETTER,
          data: HEBREW_LETTERS_DATA.LAMED,
        },
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.GEBURAH],
      rightSphere: sphereIds[SPHERES.HOD],
      relatedNumber: MELKITZEDEKI_PATHS.GEBURAH_HOD,
      data: {
        meaning: "Duality from above with duality from below",
      },
      letters: [
        {
          letter: LATIN_LETTERS.M,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.M,
        },
        {
          letter: HEBREW_LETTERS.MEM,
          type: LetterTypes.HEBREW_LETTER,
          data: HEBREW_LETTERS_DATA.MEM,
        },
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.TIPHARETH],
      rightSphere: sphereIds[SPHERES.NETZACH],
      relatedNumber: MELKITZEDEKI_PATHS.TIPHARETH_NETZACH,
      data: {
        meaning: "Illumination of victory",
      },
      letters: [
        {
          letter: LATIN_LETTERS.N,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.N,
        },
        {
          letter: HEBREW_LETTERS.NUN,
          type: LetterTypes.HEBREW_LETTER,
          data: HEBREW_LETTERS_DATA.NUN,
        },
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.TIPHARETH],
      rightSphere: sphereIds[SPHERES.YESOD],
      relatedNumber: MELKITZEDEKI_PATHS.TIPHARETH_YESOD,
      data: {
        meaning: "Illumination of foundations (secrets)",
      },
      letters: [
        {
          letter: LATIN_LETTERS.S,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.S,
        },
        {
          letter: LATIN_LETTERS.Ç,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.Ç,
        },
        {
          letter: HEBREW_LETTERS.SAMEKH,
          type: LetterTypes.HEBREW_LETTER,
          data: HEBREW_LETTERS_DATA.SAMEKH,
        },
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.TIPHARETH],
      rightSphere: sphereIds[SPHERES.HOD],
      relatedNumber: MELKITZEDEKI_PATHS.TIPHARETH_HOD,
      data: {
        meaning: "Illumination of reasons",
      },
      letters: [
        {
          letter: LATIN_LETTERS.O,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.O,
        },
        {
          letter: HEBREW_LETTERS.AYIN,
          type: LetterTypes.HEBREW_LETTER,
          data: HEBREW_LETTERS_DATA.AYIN,
        },
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.NETZACH],
      rightSphere: sphereIds[SPHERES.HOD],
      relatedNumber: MELKITZEDEKI_PATHS.NETZACH_HOD,
      data: {
        meaning: "Reason of emotions",
      },
      letters: [
        {
          letter: LATIN_LETTERS.P,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.P,
        },
        {
          letter: LATIN_LETTERS.F,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.F,
        },
        {
          letter: LATIN_LETTERS.PH,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.PH,
        },
        {
          letter: HEBREW_LETTERS.PE,
          type: LetterTypes.HEBREW_LETTER,
          data: HEBREW_LETTERS_DATA.PE,
        },
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.NETZACH],
      rightSphere: sphereIds[SPHERES.YESOD],
      relatedNumber: MELKITZEDEKI_PATHS.NETZACH_YESOD,
      data: {
        meaning: "Victory of inner emptiness",
      },
      letters: [
        {
          letter: LATIN_LETTERS.TS,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.TS,
        },
        {
          letter: LATIN_LETTERS.TZ,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.TZ,
        },
        {
          letter: HEBREW_LETTERS.TSADI,
          type: LetterTypes.HEBREW_LETTER,
          data: HEBREW_LETTERS_DATA.TSADI,
        },
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.NETZACH],
      rightSphere: sphereIds[SPHERES.MALKUTH],
      relatedNumber: MELKITZEDEKI_PATHS.NETZACH_MALKUTH,
      data: {
        meaning: "Victory over matter",
      },
      letters: [
        {
          letter: LATIN_LETTERS.K,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.K,
        },
        {
          letter: LATIN_LETTERS.Q,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.Q,
        },
        {
          letter: LATIN_LETTERS.KH,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.KH,
        },
        {
          letter: HEBREW_LETTERS.QOPH,
          type: LetterTypes.HEBREW_LETTER,
          data: HEBREW_LETTERS_DATA.QOPH,
        },
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.HOD],
      rightSphere: sphereIds[SPHERES.YESOD],
      relatedNumber: MELKITZEDEKI_PATHS.HOD_YESOD,
      data: {
        meaning: "Reason of foundations",
      },
      letters: [
        {
          letter: LATIN_LETTERS.R,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.R,
        },
        {
          letter: HEBREW_LETTERS.RESH,
          type: LetterTypes.HEBREW_LETTER,
          data: HEBREW_LETTERS_DATA.RESH,
        },
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.HOD],
      rightSphere: sphereIds[SPHERES.MALKUTH],
      relatedNumber: MELKITZEDEKI_PATHS.HOD_MALKUTH,
      data: {
        meaning: "Reason conquering the world",
      },
      letters: [
        {
          letter: LATIN_LETTERS.CH,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.CH,
        },
        {
          letter: LATIN_LETTERS.SH,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.SH,
        },
        {
          letter: LATIN_LETTERS.X,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.X,
        },
        {
          letter: HEBREW_LETTERS.SHIN,
          type: LetterTypes.HEBREW_LETTER,
          data: HEBREW_LETTERS_DATA.SHIN,
        },
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.YESOD],
      rightSphere: sphereIds[SPHERES.MALKUTH],
      relatedNumber: MELKITZEDEKI_PATHS.YESOD_MALKUTH,
      data: {
        meaning: "Filling the inner emptiness of the world",
      },
      letters: [
        {
          letter: LATIN_LETTERS.TH,
          type: LetterTypes.LATIN_LETTER,
          data: LATIN_LETTERS_DATA.TH,
        },
        {
          letter: HEBREW_LETTERS.TAV,
          type: LetterTypes.HEBREW_LETTER,
          data: HEBREW_LETTERS_DATA.TAV,
        },
      ],
    },
  ];

  for (const path of paths) {
    const pathId = tree.addPath({
      leftSphere: path.leftSphere,
      rightSphere: path.rightSphere,
      relatedNumber: path.relatedNumber,
      data: path.data,
    });

    tree.addLetters({
      path: pathId,
      letters: path.letters,
    });
  }

  return tree;
};

export const unloadKaabalah: Unloader = (tree: TreeOfLife) => {
  const spheres = Object.values(SPHERES);
  for (let i = 0; i < spheres.length; i++) {
    tree.removeNode(id(KaabalahTypes.SPHERE, spheres[i]));
  }

  const paths = Object.values(MELKITZEDEKI_PATHS);
  for (let i = 0; i < paths.length; i++) {
    tree.removeNode(id(KaabalahTypes.PATH, paths[i]));
  }
};

export const loadColors: Loader = (tree: TreeOfLife) => {
  const colors = Object.values(COLORS);
  for (let i = 0; i < colors.length; i++) {
    tree.upsertNode(
      new BaseNode({
        id: colors[i],
        type: MiscTypes.COLOR,
        data: COLORS_DATA[colors[i]],
      })
    );
  }

  const spheresWithColors = [
    {
      sphere: id(KaabalahTypes.SPHERE, SPHERES.KETHER),
      color: "crystal",
      colorData: {
        colorDescription:
          "Transparent, clear, crystal-like. All the colors mixed, on their purest, most saint form",
        colorNames: ["transparent"],
        colorHexCodes: ["#cccccc"],
      },
    },
    {
      sphere: id(KaabalahTypes.SPHERE, SPHERES.CHOKHMAH),
      color: "iridescent",
      colorData: {
        colorDescription:
          "All the colors, in a iridescent manner. Can also be represented by all the other sphere colors in a pizza-like pattern, starting with Tiphereth on top, and going clockwise following the spheres on the right and left columns.",
        colorNames: [
          "iridescent",
          "yellow",
          "blue",
          "green",
          "purple",
          "orange",
          "red",
        ],
        colorHexCodes: [
          "#EDBBE7",
          "#FFF50F",
          "#0000FF",
          "#14FF00",
          "#8F00FF",
          "#FFA800",
          "#FF0000",
        ],
      },
    },
    {
      sphere: id(KaabalahTypes.SPHERE, SPHERES.BINAH),
      color: "black",
      colorData: {
        colorDescription: "All the colors mixed, on their lowest vibration.",
        colorNames: ["black"],
        colorHexCodes: ["#000000"],
      },
    },
    {
      sphere: id(KaabalahTypes.SPHERE, SPHERES.DAATH),
      color: "white",
      colorData: {
        colorDescription:
          "All the colors mixed, on their highest vibration. Can also be represented by an yin-yang pattern.",
        colorNames: ["white"],
        colorHexCodes: ["#FFFFFF"],
      },
    },
    {
      sphere: id(KaabalahTypes.SPHERE, SPHERES.CHESED),
      color: COLORS.BLUE,
      colorData: COLORS_DATA.BLUE,
    },
    {
      sphere: id(KaabalahTypes.SPHERE, SPHERES.GEBURAH),
      color: COLORS.RED,
      colorData: COLORS_DATA.RED,
    },
    {
      sphere: id(KaabalahTypes.SPHERE, SPHERES.TIPHARETH),
      color: COLORS.YELLOW,
      colorData: COLORS_DATA.YELLOW,
    },
    {
      sphere: id(KaabalahTypes.SPHERE, SPHERES.NETZACH),
      color: COLORS.GREEN,
      colorData: COLORS_DATA.GREEN,
    },
    {
      sphere: id(KaabalahTypes.SPHERE, SPHERES.HOD),
      color: COLORS.ORANGE,
      colorData: COLORS_DATA.ORANGE,
    },
    {
      sphere: id(KaabalahTypes.SPHERE, SPHERES.YESOD),
      color: "purple",
      colorData: {
        colorDescription: "Purple",
        colorNames: ["purple"],
        colorHexCodes: ["#8F00FF"],
      },
    },
    {
      sphere: id(KaabalahTypes.SPHERE, SPHERES.MALKUTH),
      color: "malkuth",
      colorData: {
        colorDescription:
          "Made up of the colors of earth, which is created from the 4 elements. Brown can be used to represent it, but, usually it is represented in a pizza-like pattern, starting with Yellow on top, and going clockwise with Green, Brown and Red, all with slightly less saturation.",
        colorNames: [
          "unsaturated yellow",
          "unsaturated green",
          "unsaturated brown",
          "unsaturated red",
        ],
        colorHexCodes: ["#FFF659", "#70FF6E", "#422E29", "#FF5454"],
      },
    },
  ];

  for (const sphereWithColor of spheresWithColors) {
    const colorId = tree.upsertNode(
      new BaseNode({
        id: sphereWithColor.color,
        type: MiscTypes.COLOR,
        data: sphereWithColor.colorData,
      })
    );

    tree.link(sphereWithColor.sphere, colorId);
  }

  const pathsWithColors = [
    {
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.KETHER_CHOKHMAH),
      color: "gold",
      colorData: {
        colorDescription: "Gold",
        colorNames: ["gold"],
        colorHexCodes: ["#D4AF37"],
      },
    },
    {
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.KETHER_BINAH),
      color: COLORS.YELLOW,
      colorData: {
        colorDescription: "Yellow",
        colorNames: ["Yellow"],
        colorHexCodes: ["#FFD700"],
      },
    },
    {
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.KETHER_TIPHARETH),
      color: "grey",
      colorData: {
        colorDescription: "Grey",
        colorNames: ["grey"],
        colorHexCodes: ["#808080"],
      },
    },
    {
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.CHOKHMAH_BINAH),
      color: "greenish-blue",
      colorData: {
        colorDescription: "Greenish blue",
        colorNames: ["greenish blue"],
        colorHexCodes: ["#5F9EA0"],
      },
    },
    {
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.CHOKHMAH_TIPHARETH),
      color: COLORS.RED,
      colorData: {
        colorDescription: "Red",
        colorNames: ["Red"],
        colorHexCodes: ["#FF4927"],
      },
    },
    {
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.CHOKHMAH_CHESED),
      color: "orange-red",
      colorData: {
        colorDescription: "Orange-red",
        colorNames: ["Orange-red"],
        colorHexCodes: ["#FF4500"],
      },
    },
    {
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.BINAH_TIPHARETH),
      color: COLORS.ORANGE,
      colorData: {
        colorDescription: "Orange",
        colorNames: ["Orange"],
        colorHexCodes: ["#FFA500"],
      },
    },
    {
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.BINAH_GEBURAH),
      color: "amber",
      colorData: {
        colorDescription: "Amber",
        colorNames: ["amber"],
        colorHexCodes: ["#FF7F00"],
      },
    },
    {
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.CHESED_GEBURAH),
      color: "greenish-yellow",
      colorData: {
        colorDescription: "Greenish yellow",
        colorNames: ["greenish yellow"],
        colorHexCodes: ["#D4FB19"],
      },
    },
    {
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.CHESED_TIPHARETH),
      color: "white",
      colorData: {
        colorDescription: "White",
        colorNames: ["white"],
        colorHexCodes: ["#FFFFFF"],
      },
    },
    {
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.CHESED_NETZACH),
      color: COLORS.BLUE,
      colorData: COLORS_DATA.BLUE,
    },
    {
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.GEBURAH_TIPHARETH),
      color: "emerald-green",
      colorData: {
        colorDescription: "Emerald green",
        colorNames: ["emerald green"],
        colorHexCodes: ["#50C878"],
      },
    },
    {
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.GEBURAH_HOD),
      color: "light-blue",
      colorData: {
        colorDescription: "Light blue",
        colorNames: ["light blue"],
        colorHexCodes: ["#ADD8E6"],
      },
    },
    {
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.TIPHARETH_NETZACH),
      color: "blueish-green",
      colorData: {
        colorDescription: "Greenish blue",
        colorNames: ["greenish blue"],
        colorHexCodes: ["#00ECA3"],
      },
    },
    {
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.TIPHARETH_YESOD),
      color: COLORS.BLUE,
      colorData: COLORS_DATA.BLUE,
    },
    {
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.TIPHARETH_HOD),
      color: "indigo",
      colorData: {
        colorDescription: "Indigo",
        colorNames: ["indigo"],
        colorHexCodes: ["#4B0082"],
      },
    },
    {
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.NETZACH_HOD),
      color: "rose",
      colorData: {
        colorDescription: "Rose",
        colorNames: ["Rose"],
        colorHexCodes: ["#E22283"],
      },
    },
    {
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.NETZACH_YESOD),
      color: "violet",
      colorData: {
        colorDescription: "Violet",
        colorNames: ["violet"],
        colorHexCodes: ["#8A2BE2"],
      },
    },
    {
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.NETZACH_MALKUTH),
      color: "crimson",
      colorData: {
        colorDescription: "Crimson",
        colorNames: ["crimson"],
        colorHexCodes: ["#DC3823"],
      },
    },
    {
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.HOD_YESOD),
      color: COLORS.ORANGE,
      colorData: {
        colorDescription: "Orange",
        colorNames: ["Orange"],
        colorHexCodes: ["#FFBD0F"],
      },
    },
    {
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.HOD_MALKUTH),
      color: COLORS.RED,
      colorData: {
        colorDescription: "Red",
        colorNames: ["Red"],
        colorHexCodes: ["#FF6832"],
      },
    },
    {
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.YESOD_MALKUTH),
      color: "dark-grey",
      colorData: {
        colorDescription: "Dark grey",
        colorNames: ["dark grey"],
        colorHexCodes: ["#2F4F4F"],
      },
    },
  ];

  for (const pathWithColor of pathsWithColors) {
    const colorId = tree.upsertNode(
      new BaseNode({
        id: pathWithColor.color,
        type: MiscTypes.COLOR,
        data: pathWithColor.colorData,
      })
    );

    tree.link(pathWithColor.path, colorId);
  }

  return tree;
};

export const unloadColors: Unloader = (tree: TreeOfLife) => {
  const colors = Object.values(COLORS);
  for (let i = 0; i < colors.length; i++) {
    tree.removeNode(id(MiscTypes.COLOR, colors[i]));
  }

  const sphereColors = Object.values(SPHERES).flatMap((sphere) =>
    tree
      .related(id(KaabalahTypes.SPHERE, sphere), MiscTypes.COLOR)
      .map((color) => color.id)
  );
  for (let i = 0; i < sphereColors.length; i++) {
    tree.removeNode(sphereColors[i]);
  }

  const pathColors = Object.values(MELKITZEDEKI_PATHS).flatMap((path) =>
    tree
      .related(id(KaabalahTypes.PATH, path), MiscTypes.COLOR)
      .map((color) => color.id)
  );
  for (let i = 0; i < pathColors.length; i++) {
    tree.removeNode(pathColors[i]);
  }
};

export const loadMusicalNotes: Loader = (tree: TreeOfLife) => {
  const musicalNotes = Object.values(MUSICAL_NOTES);

  const musicalNotesIds: Record<string, NodeId<MiscTypes.MUSICAL_NOTE>> = {};
  for (let i = 0; i < musicalNotes.length; i++) {
    const musicalNoteId = tree.upsertNode(
      new BaseNode({
        id: musicalNotes[i],
        type: MiscTypes.MUSICAL_NOTE,
        data: MUSICAL_NOTES_DATA[musicalNotes[i]],
      })
    );
    musicalNotesIds[musicalNotes[i]] = musicalNoteId;
  }

  const firstIntervalId = tree.upsertNode(
    new BaseNode({
      id: "1st interval",
      type: MiscTypes.MUSICAL_NOTE,
      data: {
        note: "Interval",
        noteDescription: "An interval",
      },
    })
  );
  const theThingCreatedId = tree.upsertNode(
    new BaseNode({
      id: "The thing created",
      type: MiscTypes.MUSICAL_NOTE,
      data: {
        note: "The thing created",
        noteDescription: "The thing created",
      },
    })
  );
  const secondIntervalId = tree.upsertNode(
    new BaseNode({
      id: "2nd interval",
      type: MiscTypes.MUSICAL_NOTE,
      data: {
        note: "Interval",
        noteDescription: "An interval",
      },
    })
  );

  tree.link(
    id(KaabalahTypes.SPHERE, SPHERES.KETHER),
    musicalNotesIds[MUSICAL_NOTES.DO]
  );
  tree.link(
    id(KaabalahTypes.SPHERE, SPHERES.CHOKHMAH),
    musicalNotesIds[MUSICAL_NOTES.RE]
  );
  tree.link(
    id(KaabalahTypes.SPHERE, SPHERES.BINAH),
    musicalNotesIds[MUSICAL_NOTES.MI]
  );
  tree.link(id(KaabalahTypes.SPHERE, SPHERES.DAATH), firstIntervalId);
  tree.link(
    id(KaabalahTypes.SPHERE, SPHERES.CHESED),
    musicalNotesIds[MUSICAL_NOTES.FA]
  );
  tree.link(
    id(KaabalahTypes.SPHERE, SPHERES.GEBURAH),
    musicalNotesIds[MUSICAL_NOTES.SOL]
  );
  tree.link(id(KaabalahTypes.SPHERE, SPHERES.TIPHARETH), theThingCreatedId);
  tree.link(
    id(KaabalahTypes.SPHERE, SPHERES.NETZACH),
    musicalNotesIds[MUSICAL_NOTES.SI]
  );
  tree.link(id(KaabalahTypes.SPHERE, SPHERES.YESOD), secondIntervalId);
  tree.link(
    id(KaabalahTypes.SPHERE, SPHERES.MALKUTH),
    musicalNotesIds[MUSICAL_NOTES.DO]
  );

  return tree;
};

export const unloadMusicalNotes: Unloader = (tree: TreeOfLife) => {
  const notes = Object.values(SPHERES).flatMap((sphere) =>
    tree
      .related(id(KaabalahTypes.SPHERE, sphere), MiscTypes.MUSICAL_NOTE)
      .map((note) => note.id)
  );
  for (let i = 0; i < notes.length; i++) {
    tree.removeNode(notes[i]);
  }
};

const linkColorsAndSounds = (tree: TreeOfLife) => {
  if (
    !tree.loadedParts.includes("colors") ||
    !tree.loadedParts.includes("music")
  ) {
    throw new Error("Both parts must be loaded for a bridge to happen");
  }

  const noteColors: {
    note: NodeId<MiscTypes.MUSICAL_NOTE>;
    color: NodeId<MiscTypes.COLOR>;
  }[] = [
    {
      note: id(MiscTypes.MUSICAL_NOTE, MUSICAL_NOTES.DO),
      color: id(MiscTypes.COLOR, COLORS.GREEN),
    },
    {
      note: id(MiscTypes.MUSICAL_NOTE, MUSICAL_NOTES.DO_SHARP),
      color: id(MiscTypes.COLOR, COLORS.SPRING_GREEN),
    },
    {
      note: id(MiscTypes.MUSICAL_NOTE, MUSICAL_NOTES.RE),
      color: id(MiscTypes.COLOR, COLORS.CYAN),
    },
    {
      note: id(MiscTypes.MUSICAL_NOTE, MUSICAL_NOTES.RE_SHARP),
      color: id(MiscTypes.COLOR, COLORS.AZURE),
    },
    {
      note: id(MiscTypes.MUSICAL_NOTE, MUSICAL_NOTES.MI),
      color: id(MiscTypes.COLOR, COLORS.BLUE),
    },
    {
      note: id(MiscTypes.MUSICAL_NOTE, MUSICAL_NOTES.FA),
      color: id(MiscTypes.COLOR, COLORS.VIOLET),
    },
    {
      note: id(MiscTypes.MUSICAL_NOTE, MUSICAL_NOTES.FA_SHARP),
      color: id(MiscTypes.COLOR, COLORS.MAGENTA),
    },
    {
      note: id(MiscTypes.MUSICAL_NOTE, MUSICAL_NOTES.SOL),
      color: id(MiscTypes.COLOR, COLORS.ROSE),
    },
    {
      note: id(MiscTypes.MUSICAL_NOTE, MUSICAL_NOTES.SOL_SHARP),
      color: id(MiscTypes.COLOR, COLORS.RED),
    },
    {
      note: id(MiscTypes.MUSICAL_NOTE, MUSICAL_NOTES.LA),
      color: id(MiscTypes.COLOR, COLORS.ORANGE),
    },
    {
      note: id(MiscTypes.MUSICAL_NOTE, MUSICAL_NOTES.LA_SHARP),
      color: id(MiscTypes.COLOR, COLORS.YELLOW),
    },
    {
      note: id(MiscTypes.MUSICAL_NOTE, MUSICAL_NOTES.SI),
      color: id(MiscTypes.COLOR, COLORS.CHARTREUSE_GREEN),
    },
  ];

  for (const { note, color } of noteColors) {
    tree.link(note, color);
  }

  return tree;
};

const linkSoundsAndWesternAstrology = (tree: TreeOfLife) => {
  if (
    !tree.loadedParts.includes("westernAstrology") ||
    !tree.loadedParts.includes("music")
  ) {
    throw new Error(
      "At least one of the parts must be loaded for a bridge to happen"
    );
  }

  const astrologySignsSounds: {
    sign: NodeId<WesternAstrologyTypes.WESTERN_ZODIAC_SIGN>;
    sound: NodeId<MiscTypes.MUSICAL_NOTE>;
  }[] = [
    {
      sign: id(
        WesternAstrologyTypes.WESTERN_ZODIAC_SIGN,
        WESTERN_ZODIAC_SIGNS.VIRGO
      ),
      sound: id(MiscTypes.MUSICAL_NOTE, MUSICAL_NOTES.DO),
    },
    {
      sign: id(
        WesternAstrologyTypes.WESTERN_ZODIAC_SIGN,
        WESTERN_ZODIAC_SIGNS.LIBRA
      ),
      sound: id(MiscTypes.MUSICAL_NOTE, MUSICAL_NOTES.DO_SHARP),
    },
    {
      sign: id(
        WesternAstrologyTypes.WESTERN_ZODIAC_SIGN,
        WESTERN_ZODIAC_SIGNS.SCORPIO
      ),
      sound: id(MiscTypes.MUSICAL_NOTE, MUSICAL_NOTES.RE),
    },
    {
      sign: id(
        WesternAstrologyTypes.WESTERN_ZODIAC_SIGN,
        WESTERN_ZODIAC_SIGNS.SAGITTARIUS
      ),
      sound: id(MiscTypes.MUSICAL_NOTE, MUSICAL_NOTES.RE_SHARP),
    },
    {
      sign: id(
        WesternAstrologyTypes.WESTERN_ZODIAC_SIGN,
        WESTERN_ZODIAC_SIGNS.CAPRICORN
      ),
      sound: id(MiscTypes.MUSICAL_NOTE, MUSICAL_NOTES.MI),
    },
    {
      sign: id(
        WesternAstrologyTypes.WESTERN_ZODIAC_SIGN,
        WESTERN_ZODIAC_SIGNS.AQUARIUS
      ),
      sound: id(MiscTypes.MUSICAL_NOTE, MUSICAL_NOTES.FA),
    },
    {
      sign: id(
        WesternAstrologyTypes.WESTERN_ZODIAC_SIGN,
        WESTERN_ZODIAC_SIGNS.PISCES
      ),
      sound: id(MiscTypes.MUSICAL_NOTE, MUSICAL_NOTES.FA_SHARP),
    },
    {
      sign: id(
        WesternAstrologyTypes.WESTERN_ZODIAC_SIGN,
        WESTERN_ZODIAC_SIGNS.ARIES
      ),
      sound: id(MiscTypes.MUSICAL_NOTE, MUSICAL_NOTES.SOL),
    },
    {
      sign: id(
        WesternAstrologyTypes.WESTERN_ZODIAC_SIGN,
        WESTERN_ZODIAC_SIGNS.TAURUS
      ),
      sound: id(MiscTypes.MUSICAL_NOTE, MUSICAL_NOTES.SOL_SHARP),
    },
    {
      sign: id(
        WesternAstrologyTypes.WESTERN_ZODIAC_SIGN,
        WESTERN_ZODIAC_SIGNS.GEMINI
      ),
      sound: id(MiscTypes.MUSICAL_NOTE, MUSICAL_NOTES.LA),
    },
    {
      sign: id(
        WesternAstrologyTypes.WESTERN_ZODIAC_SIGN,
        WESTERN_ZODIAC_SIGNS.CANCER
      ),
      sound: id(MiscTypes.MUSICAL_NOTE, MUSICAL_NOTES.LA_SHARP),
    },
    {
      sign: id(
        WesternAstrologyTypes.WESTERN_ZODIAC_SIGN,
        WESTERN_ZODIAC_SIGNS.LEO
      ),
      sound: id(MiscTypes.MUSICAL_NOTE, MUSICAL_NOTES.SI),
    },
  ];

  for (const { sign, sound } of astrologySignsSounds) {
    tree.link(sign, sound);
  }

  return tree;
};

const linkColorsAndWesternAstrology = (tree: TreeOfLife) => {
  if (
    !tree.loadedParts.includes("colors") ||
    !tree.loadedParts.includes("westernAstrology")
  ) {
    throw new Error("Both parts must be loaded for a bridge to happen");
  }

  const astrologySignsColors: {
    color: NodeId<MiscTypes.COLOR>;
    sign: NodeId<WesternAstrologyTypes.WESTERN_ZODIAC_SIGN>;
  }[] = [
    {
      color: id(MiscTypes.COLOR, COLORS.RED),
      sign: id(
        WesternAstrologyTypes.WESTERN_ZODIAC_SIGN,
        WESTERN_ZODIAC_SIGNS.TAURUS
      ),
    },
    {
      color: id(MiscTypes.COLOR, COLORS.ORANGE),
      sign: id(
        WesternAstrologyTypes.WESTERN_ZODIAC_SIGN,
        WESTERN_ZODIAC_SIGNS.GEMINI
      ),
    },
    {
      color: id(MiscTypes.COLOR, COLORS.YELLOW),
      sign: id(
        WesternAstrologyTypes.WESTERN_ZODIAC_SIGN,
        WESTERN_ZODIAC_SIGNS.CANCER
      ),
    },
    {
      color: id(MiscTypes.COLOR, COLORS.CHARTREUSE_GREEN),
      sign: id(
        WesternAstrologyTypes.WESTERN_ZODIAC_SIGN,
        WESTERN_ZODIAC_SIGNS.LEO
      ),
    },
    {
      color: id(MiscTypes.COLOR, COLORS.GREEN),
      sign: id(
        WesternAstrologyTypes.WESTERN_ZODIAC_SIGN,
        WESTERN_ZODIAC_SIGNS.VIRGO
      ),
    },
    {
      color: id(MiscTypes.COLOR, COLORS.SPRING_GREEN),
      sign: id(
        WesternAstrologyTypes.WESTERN_ZODIAC_SIGN,
        WESTERN_ZODIAC_SIGNS.LIBRA
      ),
    },
    {
      color: id(MiscTypes.COLOR, COLORS.CYAN),
      sign: id(
        WesternAstrologyTypes.WESTERN_ZODIAC_SIGN,
        WESTERN_ZODIAC_SIGNS.SCORPIO
      ),
    },
    {
      color: id(MiscTypes.COLOR, COLORS.AZURE),
      sign: id(
        WesternAstrologyTypes.WESTERN_ZODIAC_SIGN,
        WESTERN_ZODIAC_SIGNS.SAGITTARIUS
      ),
    },
    {
      color: id(MiscTypes.COLOR, COLORS.BLUE),
      sign: id(
        WesternAstrologyTypes.WESTERN_ZODIAC_SIGN,
        WESTERN_ZODIAC_SIGNS.CAPRICORN
      ),
    },
    {
      color: id(MiscTypes.COLOR, COLORS.VIOLET),
      sign: id(
        WesternAstrologyTypes.WESTERN_ZODIAC_SIGN,
        WESTERN_ZODIAC_SIGNS.AQUARIUS
      ),
    },
    {
      color: id(MiscTypes.COLOR, COLORS.MAGENTA),
      sign: id(
        WesternAstrologyTypes.WESTERN_ZODIAC_SIGN,
        WESTERN_ZODIAC_SIGNS.PISCES
      ),
    },
    {
      color: id(MiscTypes.COLOR, COLORS.ROSE),
      sign: id(
        WesternAstrologyTypes.WESTERN_ZODIAC_SIGN,
        WESTERN_ZODIAC_SIGNS.ARIES
      ),
    },
  ];

  for (const { color, sign } of astrologySignsColors) {
    tree.link(color, sign);
  }

  return tree;
};

export const loadWesternAstrology: Loader = (tree: TreeOfLife) => {
  const planets = Object.values(PLANETS);
  const planetsIds: Record<string, NodeId<WesternAstrologyTypes.PLANET>> = {};
  for (const planet of planets) {
    const planetId = tree.upsertNode(
      new BaseNode({
        id: planet,
        type: WesternAstrologyTypes.PLANET,
      })
    );
    planetsIds[planet] = planetId;
  }

  tree.link(
    id(KaabalahTypes.SPHERE, SPHERES.KETHER),
    planetsIds[PLANETS.NEPTUNE]
  );
  tree.link(
    id(KaabalahTypes.SPHERE, SPHERES.CHOKHMAH),
    planetsIds[PLANETS.URANUS]
  );
  tree.link(
    id(KaabalahTypes.SPHERE, SPHERES.BINAH),
    planetsIds[PLANETS.SATURN]
  );
  tree.link(id(KaabalahTypes.SPHERE, SPHERES.DAATH), planetsIds[PLANETS.PLUTO]);
  tree.link(
    id(KaabalahTypes.SPHERE, SPHERES.CHESED),
    planetsIds[PLANETS.JUPITER]
  );
  tree.link(
    id(KaabalahTypes.SPHERE, SPHERES.GEBURAH),
    planetsIds[PLANETS.MARS]
  );
  tree.link(
    id(KaabalahTypes.SPHERE, SPHERES.TIPHARETH),
    planetsIds[PLANETS.SUN]
  );
  tree.link(
    id(KaabalahTypes.SPHERE, SPHERES.NETZACH),
    planetsIds[PLANETS.VENUS]
  );
  tree.link(id(KaabalahTypes.SPHERE, SPHERES.HOD), planetsIds[PLANETS.MERCURY]);
  tree.link(id(KaabalahTypes.SPHERE, SPHERES.YESOD), planetsIds[PLANETS.MOON]);
  tree.link(
    id(KaabalahTypes.SPHERE, SPHERES.MALKUTH),
    planetsIds[PLANETS.EARTH]
  );

  const air = tree.upsertNode(
    new BaseNode({
      id: WESTERN_ELEMENTS.AIR,
      type: WesternAstrologyTypes.WESTERN_ELEMENT,
    })
  );

  tree.link(id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.KETHER_CHOKHMAH), air);
  tree.link(
    id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.KETHER_BINAH),
    planetsIds[PLANETS.MOON]
  );
  tree.link(
    id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.KETHER_TIPHARETH),
    planetsIds[PLANETS.VENUS]
  );
  tree.link(
    id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.CHOKHMAH_BINAH),
    planetsIds[PLANETS.JUPITER]
  );
  tree.addWesternAstrologySign({
    path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.CHOKHMAH_TIPHARETH),
    sign: WESTERN_ZODIAC_SIGNS.ARIES,
    data: WESTERN_ZODIAC_SIGNS_DATA.ARIES,
    relatedNumber: 1,
  });
  tree.addWesternAstrologySign({
    path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.CHOKHMAH_CHESED),
    sign: WESTERN_ZODIAC_SIGNS.TAURUS,
    data: WESTERN_ZODIAC_SIGNS_DATA.TAURUS,
    relatedNumber: 2,
  });
  tree.addWesternAstrologySign({
    path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.BINAH_TIPHARETH),
    sign: WESTERN_ZODIAC_SIGNS.GEMINI,
    data: WESTERN_ZODIAC_SIGNS_DATA.GEMINI,
    relatedNumber: 3,
  });
  tree.addWesternAstrologySign({
    path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.BINAH_GEBURAH),
    sign: WESTERN_ZODIAC_SIGNS.CANCER,
    data: WESTERN_ZODIAC_SIGNS_DATA.CANCER,
    relatedNumber: 4,
  });
  tree.addWesternAstrologySign({
    path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.CHESED_GEBURAH),
    sign: WESTERN_ZODIAC_SIGNS.LEO,
    data: WESTERN_ZODIAC_SIGNS_DATA.LEO,
    relatedNumber: 5,
  });
  tree.addWesternAstrologySign({
    path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.CHESED_TIPHARETH),
    sign: WESTERN_ZODIAC_SIGNS.VIRGO,
    data: WESTERN_ZODIAC_SIGNS_DATA.VIRGO,
    relatedNumber: 6,
  });
  tree.link(
    id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.CHESED_NETZACH),
    planetsIds[PLANETS.MARS]
  );
  tree.addWesternAstrologySign({
    path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.GEBURAH_TIPHARETH),
    sign: WESTERN_ZODIAC_SIGNS.LIBRA,
    data: WESTERN_ZODIAC_SIGNS_DATA.LIBRA,
    relatedNumber: 7,
  });

  const water = tree.upsertNode(
    new BaseNode({
      id: WESTERN_ELEMENTS.WATER,
      type: WesternAstrologyTypes.WESTERN_ELEMENT,
    })
  );
  tree.link(id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.GEBURAH_HOD), water);

  tree.addWesternAstrologySign({
    path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.TIPHARETH_NETZACH),
    sign: WESTERN_ZODIAC_SIGNS.SCORPIO,
    data: WESTERN_ZODIAC_SIGNS_DATA.SCORPIO,
    relatedNumber: 8,
  });
  tree.addWesternAstrologySign({
    path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.TIPHARETH_YESOD),
    sign: WESTERN_ZODIAC_SIGNS.SAGITTARIUS,
    data: WESTERN_ZODIAC_SIGNS_DATA.SAGITTARIUS,
    relatedNumber: 9,
  });
  tree.addWesternAstrologySign({
    path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.TIPHARETH_HOD),
    sign: WESTERN_ZODIAC_SIGNS.CAPRICORN,
    data: WESTERN_ZODIAC_SIGNS_DATA.CAPRICORN,
    relatedNumber: 10,
  });
  tree.link(
    id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.NETZACH_HOD),
    planetsIds[PLANETS.MERCURY]
  );
  tree.addWesternAstrologySign({
    path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.NETZACH_YESOD),
    sign: WESTERN_ZODIAC_SIGNS.AQUARIUS,
    data: WESTERN_ZODIAC_SIGNS_DATA.AQUARIUS,
    relatedNumber: 11,
  });
  tree.addWesternAstrologySign({
    path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.NETZACH_MALKUTH),
    sign: WESTERN_ZODIAC_SIGNS.PISCES,
    data: WESTERN_ZODIAC_SIGNS_DATA.PISCES,
    relatedNumber: 12,
  });
  tree.link(
    id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.HOD_YESOD),
    planetsIds[PLANETS.SATURN]
  );
  const fire = tree.upsertNode(
    new BaseNode({
      id: WESTERN_ELEMENTS.FIRE,
      type: WesternAstrologyTypes.WESTERN_ELEMENT,
    })
  );
  tree.link(id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.HOD_MALKUTH), fire);
  tree.link(
    id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.YESOD_MALKUTH),
    planetsIds[PLANETS.SUN]
  );

  return tree;
};

export const unloadWesternAstrology: Unloader = (tree: TreeOfLife) => {
  const planets = Object.values(SPHERES).flatMap((planet) =>
    tree
      .related(id(KaabalahTypes.SPHERE, planet), WesternAstrologyTypes.PLANET)
      .map((planet) => planet.id)
  );
  for (let i = 0; i < planets.length; i++) {
    tree.removeNode(planets[i]);
  }

  const elements: NodeId<NodeType>[] = [];
  const zodiacSigns: NodeId<NodeType>[] = [];

  for (const path of Object.values(MELKITZEDEKI_PATHS)) {
    elements.push(
      ...tree
        .related(
          id(KaabalahTypes.PATH, path),
          WesternAstrologyTypes.WESTERN_ELEMENT
        )
        .map((element) => element.id)
    );
    zodiacSigns.push(
      ...tree
        .related(
          id(KaabalahTypes.PATH, path),
          WesternAstrologyTypes.WESTERN_ZODIAC_SIGN
        )
        .map((sign) => sign.id)
    );
  }

  for (let i = 0; i < elements.length; i++) {
    tree.removeNode(elements[i]);
  }

  for (let i = 0; i < zodiacSigns.length; i++) {
    tree.removeNode(zodiacSigns[i]);
  }
};

export const loadTarot: Loader = (tree: TreeOfLife) => {
  const majorArkAnnus: {
    id: string;
    data: TarotArkAnnuData;
    relatedNumber: number;
    path: NodeId<KaabalahTypes.PATH>;
  }[] = [
    {
      id: TAROT_ARKANNUS.THE_MAGICIAN,
      data: TAROT_ARKANNUS_DATA.THE_MAGICIAN,
      relatedNumber: 1,
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.KETHER_CHOKHMAH),
    },
    {
      id: TAROT_ARKANNUS.THE_HIGH_PRIESTESS,
      data: TAROT_ARKANNUS_DATA.THE_HIGH_PRIESTESS,
      relatedNumber: 2,
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.KETHER_BINAH),
    },
    {
      id: TAROT_ARKANNUS.THE_EMPRESS,
      data: TAROT_ARKANNUS_DATA.THE_EMPRESS,
      relatedNumber: 3,
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.KETHER_TIPHARETH),
    },
    {
      id: TAROT_ARKANNUS.THE_EMPEROR,
      data: TAROT_ARKANNUS_DATA.THE_EMPEROR,
      relatedNumber: 4,
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.CHOKHMAH_BINAH),
    },
    {
      id: TAROT_ARKANNUS.THE_HIEROPHANT,
      data: TAROT_ARKANNUS_DATA.THE_HIEROPHANT,
      relatedNumber: 5,
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.CHOKHMAH_TIPHARETH),
    },
    {
      id: TAROT_ARKANNUS.THE_LOVER,
      data: TAROT_ARKANNUS_DATA.THE_LOVER,
      relatedNumber: 6,
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.CHOKHMAH_CHESED),
    },
    {
      id: TAROT_ARKANNUS.THE_CHARIOT,
      data: TAROT_ARKANNUS_DATA.THE_CHARIOT,
      relatedNumber: 7,
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.BINAH_TIPHARETH),
    },
    {
      id: TAROT_ARKANNUS.JUSTICE,
      data: TAROT_ARKANNUS_DATA.JUSTICE,
      relatedNumber: 8,
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.BINAH_GEBURAH),
    },
    {
      id: TAROT_ARKANNUS.THE_HERMIT,
      data: TAROT_ARKANNUS_DATA.THE_HERMIT,
      relatedNumber: 9,
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.CHESED_GEBURAH),
    },
    {
      id: TAROT_ARKANNUS.THE_WHEEL_OF_FORTUNE,
      data: TAROT_ARKANNUS_DATA.THE_WHEEL_OF_FORTUNE,
      relatedNumber: 10,
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.CHESED_TIPHARETH),
    },
    {
      id: TAROT_ARKANNUS.STRENGTH,
      data: TAROT_ARKANNUS_DATA.STRENGTH,
      relatedNumber: 11,
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.CHESED_NETZACH),
    },
    {
      id: TAROT_ARKANNUS.THE_HANGED_MAN,
      data: TAROT_ARKANNUS_DATA.THE_HANGED_MAN,
      relatedNumber: 12,
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.GEBURAH_TIPHARETH),
    },
    {
      id: TAROT_ARKANNUS.DEATH,
      data: TAROT_ARKANNUS_DATA.DEATH,
      relatedNumber: 13,
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.GEBURAH_HOD),
    },
    {
      id: TAROT_ARKANNUS.TEMPERANCE,
      data: TAROT_ARKANNUS_DATA.TEMPERANCE,
      relatedNumber: 14,
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.TIPHARETH_NETZACH),
    },
    {
      id: TAROT_ARKANNUS.THE_DEVIL,
      data: TAROT_ARKANNUS_DATA.THE_DEVIL,
      relatedNumber: 15,
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.TIPHARETH_YESOD),
    },
    {
      id: TAROT_ARKANNUS.THE_TOWER,
      data: TAROT_ARKANNUS_DATA.THE_TOWER,
      relatedNumber: 16,
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.TIPHARETH_HOD),
    },
    {
      id: TAROT_ARKANNUS.THE_STAR,
      data: TAROT_ARKANNUS_DATA.THE_STAR,
      relatedNumber: 17,
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.NETZACH_HOD),
    },
    {
      id: TAROT_ARKANNUS.THE_MOON,
      data: TAROT_ARKANNUS_DATA.THE_MOON,
      relatedNumber: 18,
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.NETZACH_YESOD),
    },
    {
      id: TAROT_ARKANNUS.THE_SUN,
      data: TAROT_ARKANNUS_DATA.THE_SUN,
      relatedNumber: 19,
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.NETZACH_MALKUTH),
    },
    {
      id: TAROT_ARKANNUS.JUDGMENT,
      data: TAROT_ARKANNUS_DATA.JUDGMENT,
      relatedNumber: 20,
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.HOD_YESOD),
    },
    {
      id: TAROT_ARKANNUS.THE_FOOL,
      data: TAROT_ARKANNUS_DATA.THE_FOOL,
      relatedNumber: 21,
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.HOD_MALKUTH),
    },
    {
      id: TAROT_ARKANNUS.THE_WORLD,
      data: TAROT_ARKANNUS_DATA.THE_WORLD,
      relatedNumber: 22,
      path: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.YESOD_MALKUTH),
    },
  ];
  const majorArkAnnusIds: Record<
    string,
    NodeId<TarotTypes.TAROT_ARK_ANNU>
  > = {};
  for (let i = 0; i < majorArkAnnus.length; i++) {
    const arkAnnu = majorArkAnnus[i];
    majorArkAnnusIds[arkAnnu.id] = tree.addTarotArkAnnu({
      node: arkAnnu.path,
      tarotArkAnnu: arkAnnu.id,
      data: arkAnnu.data,
      relatedNumber: arkAnnu.relatedNumber,
    });
  }

  const westernElements: {
    id: string;
    arkAnnu: NodeId<TarotTypes.TAROT_ARK_ANNU>;
  }[] = [
    {
      id: WESTERN_ELEMENTS.EARTH,
      arkAnnu: majorArkAnnusIds[TAROT_ARKANNUS.THE_MAGICIAN],
    },
    {
      id: WESTERN_ELEMENTS.AIR,
      arkAnnu: majorArkAnnusIds[TAROT_ARKANNUS.THE_HIGH_PRIESTESS],
    },
    {
      id: WESTERN_ELEMENTS.WATER,
      arkAnnu: majorArkAnnusIds[TAROT_ARKANNUS.THE_EMPRESS],
    },
    {
      id: WESTERN_ELEMENTS.FIRE,
      arkAnnu: majorArkAnnusIds[TAROT_ARKANNUS.THE_EMPEROR],
    },
    {
      id: WESTERN_ELEMENTS.ETHER,
      arkAnnu: majorArkAnnusIds[TAROT_ARKANNUS.THE_HIEROPHANT],
    },
  ];
  const westernElementsIds: Record<
    string,
    NodeId<WesternAstrologyTypes.WESTERN_ELEMENT>
  > = {};
  for (const element of westernElements) {
    const elementId = tree.upsertNode(
      new BaseNode({
        id: element.id,
        type: WesternAstrologyTypes.WESTERN_ELEMENT,
      })
    );

    westernElementsIds[element.id] = elementId;
  }

  const suits: {
    id: string;
    element: NodeId<WesternAstrologyTypes.WESTERN_ELEMENT>;
  }[] = [
    {
      id: TAROT_SUITS.WANDS,
      element: westernElementsIds[WESTERN_ELEMENTS.FIRE],
    },
    {
      id: TAROT_SUITS.CUPS,
      element: westernElementsIds[WESTERN_ELEMENTS.WATER],
    },
    {
      id: TAROT_SUITS.SWORDS,
      element: westernElementsIds[WESTERN_ELEMENTS.AIR],
    },
    {
      id: TAROT_SUITS.PENTACLES,
      element: westernElementsIds[WESTERN_ELEMENTS.EARTH],
    },
  ];
  const suitsIds: Record<string, NodeId<TarotTypes.TAROT_SUIT>> = {};
  for (const suit of suits) {
    const suitId = tree.upsertNode(
      new BaseNode({
        id: suit.id,
        type: TarotTypes.TAROT_SUIT,
      })
    );

    suitsIds[suit.id] = suitId;

    tree.link(suitId, suit.element);
  }

  const courtArkAnnus: {
    id: string;
    data: TarotArkAnnuData;
    relatedNumber: number;
    suit: NodeId<TarotTypes.TAROT_SUIT>;
  }[] = [
    {
      id: TAROT_ARKANNUS.KING_OF_WANDS,
      data: TAROT_ARKANNUS_DATA.KING_OF_WANDS,
      relatedNumber: 23,
      suit: suitsIds[TAROT_SUITS.WANDS],
    },
    {
      id: TAROT_ARKANNUS.QUEEN_OF_WANDS,
      data: TAROT_ARKANNUS_DATA.QUEEN_OF_WANDS,
      relatedNumber: 24,
      suit: suitsIds[TAROT_SUITS.WANDS],
    },
    {
      id: TAROT_ARKANNUS.KNIGHT_OF_WANDS,
      data: TAROT_ARKANNUS_DATA.KNIGHT_OF_WANDS,
      relatedNumber: 25,
      suit: suitsIds[TAROT_SUITS.WANDS],
    },
    {
      id: TAROT_ARKANNUS.PAGE_OF_WANDS,
      data: TAROT_ARKANNUS_DATA.PAGE_OF_WANDS,
      relatedNumber: 26,
      suit: suitsIds[TAROT_SUITS.WANDS],
    },
    {
      id: TAROT_ARKANNUS.KING_OF_CUPS,
      data: TAROT_ARKANNUS_DATA.KING_OF_CUPS,
      relatedNumber: 37,
      suit: suitsIds[TAROT_SUITS.CUPS],
    },
    {
      id: TAROT_ARKANNUS.QUEEN_OF_CUPS,
      data: TAROT_ARKANNUS_DATA.QUEEN_OF_CUPS,
      relatedNumber: 38,
      suit: suitsIds[TAROT_SUITS.CUPS],
    },
    {
      id: TAROT_ARKANNUS.KNIGHT_OF_CUPS,
      data: TAROT_ARKANNUS_DATA.KNIGHT_OF_CUPS,
      relatedNumber: 39,
      suit: suitsIds[TAROT_SUITS.CUPS],
    },
    {
      id: TAROT_ARKANNUS.PAGE_OF_CUPS,
      data: TAROT_ARKANNUS_DATA.PAGE_OF_CUPS,
      relatedNumber: 40,
      suit: suitsIds[TAROT_SUITS.CUPS],
    },
    {
      id: TAROT_ARKANNUS.KING_OF_SWORDS,
      data: TAROT_ARKANNUS_DATA.KING_OF_SWORDS,
      relatedNumber: 51,
      suit: suitsIds[TAROT_SUITS.SWORDS],
    },
    {
      id: TAROT_ARKANNUS.QUEEN_OF_SWORDS,
      data: TAROT_ARKANNUS_DATA.QUEEN_OF_SWORDS,
      relatedNumber: 52,
      suit: suitsIds[TAROT_SUITS.SWORDS],
    },
    {
      id: TAROT_ARKANNUS.KNIGHT_OF_SWORDS,
      data: TAROT_ARKANNUS_DATA.KNIGHT_OF_SWORDS,
      relatedNumber: 53,
      suit: suitsIds[TAROT_SUITS.SWORDS],
    },
    {
      id: TAROT_ARKANNUS.PAGE_OF_SWORDS,
      data: TAROT_ARKANNUS_DATA.PAGE_OF_SWORDS,
      relatedNumber: 54,
      suit: suitsIds[TAROT_SUITS.SWORDS],
    },
    {
      id: TAROT_ARKANNUS.KING_OF_PENTACLES,
      data: TAROT_ARKANNUS_DATA.KING_OF_PENTACLES,
      relatedNumber: 65,
      suit: suitsIds[TAROT_SUITS.PENTACLES],
    },
    {
      id: TAROT_ARKANNUS.QUEEN_OF_PENTACLES,
      data: TAROT_ARKANNUS_DATA.QUEEN_OF_PENTACLES,
      relatedNumber: 66,
      suit: suitsIds[TAROT_SUITS.PENTACLES],
    },
    {
      id: TAROT_ARKANNUS.KNIGHT_OF_PENTACLES,
      data: TAROT_ARKANNUS_DATA.KNIGHT_OF_PENTACLES,
      relatedNumber: 67,
      suit: suitsIds[TAROT_SUITS.PENTACLES],
    },
    {
      id: TAROT_ARKANNUS.PAGE_OF_PENTACLES,
      data: TAROT_ARKANNUS_DATA.PAGE_OF_PENTACLES,
      relatedNumber: 68,
      suit: suitsIds[TAROT_SUITS.PENTACLES],
    },
  ];
  for (const courtArkAnnu of courtArkAnnus) {
    tree.addTarotArkAnnu({
      node: id(KaabalahTypes.SPHERE, SPHERES.DAATH),
      tarotArkAnnu: courtArkAnnu.id,
      data: courtArkAnnu.data,
      relatedNumber: courtArkAnnu.relatedNumber,
      suit: courtArkAnnu.suit,
    });
  }

  const minorArkAnnus: {
    id: string;
    data: TarotArkAnnuData;
    relatedNumber: number;
    sphere: NodeId<KaabalahTypes.SPHERE>;
    suit: NodeId<TarotTypes.TAROT_SUIT>;
  }[] = [
    {
      id: TAROT_ARKANNUS.TEN_OF_WANDS,
      data: TAROT_ARKANNUS_DATA.TEN_OF_WANDS,
      relatedNumber: 27,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.MALKUTH),
      suit: suitsIds[TAROT_SUITS.WANDS],
    },
    {
      id: TAROT_ARKANNUS.NINE_OF_WANDS,
      data: TAROT_ARKANNUS_DATA.NINE_OF_WANDS,
      relatedNumber: 28,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.YESOD),
      suit: suitsIds[TAROT_SUITS.WANDS],
    },
    {
      id: TAROT_ARKANNUS.EIGHT_OF_WANDS,
      data: TAROT_ARKANNUS_DATA.EIGHT_OF_WANDS,
      relatedNumber: 29,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.HOD),
      suit: suitsIds[TAROT_SUITS.WANDS],
    },
    {
      id: TAROT_ARKANNUS.SEVEN_OF_WANDS,
      data: TAROT_ARKANNUS_DATA.SEVEN_OF_WANDS,
      relatedNumber: 30,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.NETZACH),
      suit: suitsIds[TAROT_SUITS.WANDS],
    },
    {
      id: TAROT_ARKANNUS.SIX_OF_WANDS,
      data: TAROT_ARKANNUS_DATA.SIX_OF_WANDS,
      relatedNumber: 31,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.TIPHARETH),
      suit: suitsIds[TAROT_SUITS.WANDS],
    },
    {
      id: TAROT_ARKANNUS.FIVE_OF_WANDS,
      data: TAROT_ARKANNUS_DATA.FIVE_OF_WANDS,
      relatedNumber: 32,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.GEBURAH),
      suit: suitsIds[TAROT_SUITS.WANDS],
    },
    {
      id: TAROT_ARKANNUS.FOUR_OF_WANDS,
      data: TAROT_ARKANNUS_DATA.FOUR_OF_WANDS,
      relatedNumber: 33,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.CHESED),
      suit: suitsIds[TAROT_SUITS.WANDS],
    },
    {
      id: TAROT_ARKANNUS.THREE_OF_WANDS,
      data: TAROT_ARKANNUS_DATA.THREE_OF_WANDS,
      relatedNumber: 34,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.BINAH),
      suit: suitsIds[TAROT_SUITS.WANDS],
    },
    {
      id: TAROT_ARKANNUS.TWO_OF_WANDS,
      data: TAROT_ARKANNUS_DATA.TWO_OF_WANDS,
      relatedNumber: 35,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.CHOKHMAH),
      suit: suitsIds[TAROT_SUITS.WANDS],
    },
    {
      id: TAROT_ARKANNUS.ACE_OF_WANDS,
      data: TAROT_ARKANNUS_DATA.ACE_OF_WANDS,
      relatedNumber: 36,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.KETHER),
      suit: suitsIds[TAROT_SUITS.WANDS],
    },
    {
      id: TAROT_ARKANNUS.TEN_OF_CUPS,
      data: TAROT_ARKANNUS_DATA.TEN_OF_CUPS,
      relatedNumber: 41,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.MALKUTH),
      suit: suitsIds[TAROT_SUITS.CUPS],
    },
    {
      id: TAROT_ARKANNUS.NINE_OF_CUPS,
      data: TAROT_ARKANNUS_DATA.NINE_OF_CUPS,
      relatedNumber: 42,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.YESOD),
      suit: suitsIds[TAROT_SUITS.CUPS],
    },
    {
      id: TAROT_ARKANNUS.EIGHT_OF_CUPS,
      data: TAROT_ARKANNUS_DATA.EIGHT_OF_CUPS,
      relatedNumber: 43,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.HOD),
      suit: suitsIds[TAROT_SUITS.CUPS],
    },
    {
      id: TAROT_ARKANNUS.SEVEN_OF_CUPS,
      data: TAROT_ARKANNUS_DATA.SEVEN_OF_CUPS,
      relatedNumber: 44,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.NETZACH),
      suit: suitsIds[TAROT_SUITS.CUPS],
    },
    {
      id: TAROT_ARKANNUS.SIX_OF_CUPS,
      data: TAROT_ARKANNUS_DATA.SIX_OF_CUPS,
      relatedNumber: 45,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.TIPHARETH),
      suit: suitsIds[TAROT_SUITS.CUPS],
    },
    {
      id: TAROT_ARKANNUS.FIVE_OF_CUPS,
      data: TAROT_ARKANNUS_DATA.FIVE_OF_CUPS,
      relatedNumber: 46,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.GEBURAH),
      suit: suitsIds[TAROT_SUITS.CUPS],
    },
    {
      id: TAROT_ARKANNUS.FOUR_OF_CUPS,
      data: TAROT_ARKANNUS_DATA.FOUR_OF_CUPS,
      relatedNumber: 47,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.CHESED),
      suit: suitsIds[TAROT_SUITS.CUPS],
    },
    {
      id: TAROT_ARKANNUS.THREE_OF_CUPS,
      data: TAROT_ARKANNUS_DATA.THREE_OF_CUPS,
      relatedNumber: 48,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.BINAH),
      suit: suitsIds[TAROT_SUITS.CUPS],
    },
    {
      id: TAROT_ARKANNUS.TWO_OF_CUPS,
      data: TAROT_ARKANNUS_DATA.TWO_OF_CUPS,
      relatedNumber: 49,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.CHOKHMAH),
      suit: suitsIds[TAROT_SUITS.CUPS],
    },
    {
      id: TAROT_ARKANNUS.ACE_OF_CUPS,
      data: TAROT_ARKANNUS_DATA.ACE_OF_CUPS,
      relatedNumber: 50,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.KETHER),
      suit: suitsIds[TAROT_SUITS.CUPS],
    },
    {
      id: TAROT_ARKANNUS.TEN_OF_SWORDS,
      data: TAROT_ARKANNUS_DATA.TEN_OF_SWORDS,
      relatedNumber: 55,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.MALKUTH),
      suit: suitsIds[TAROT_SUITS.SWORDS],
    },
    {
      id: TAROT_ARKANNUS.NINE_OF_SWORDS,
      data: TAROT_ARKANNUS_DATA.NINE_OF_SWORDS,
      relatedNumber: 56,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.YESOD),
      suit: suitsIds[TAROT_SUITS.SWORDS],
    },
    {
      id: TAROT_ARKANNUS.EIGHT_OF_SWORDS,
      data: TAROT_ARKANNUS_DATA.EIGHT_OF_SWORDS,
      relatedNumber: 57,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.HOD),
      suit: suitsIds[TAROT_SUITS.SWORDS],
    },
    {
      id: TAROT_ARKANNUS.SEVEN_OF_SWORDS,
      data: TAROT_ARKANNUS_DATA.SEVEN_OF_SWORDS,
      relatedNumber: 58,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.NETZACH),
      suit: suitsIds[TAROT_SUITS.SWORDS],
    },
    {
      id: TAROT_ARKANNUS.SIX_OF_SWORDS,
      data: TAROT_ARKANNUS_DATA.SIX_OF_SWORDS,
      relatedNumber: 59,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.TIPHARETH),
      suit: suitsIds[TAROT_SUITS.SWORDS],
    },
    {
      id: TAROT_ARKANNUS.FIVE_OF_SWORDS,
      data: TAROT_ARKANNUS_DATA.FIVE_OF_SWORDS,
      relatedNumber: 60,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.GEBURAH),
      suit: suitsIds[TAROT_SUITS.SWORDS],
    },
    {
      id: TAROT_ARKANNUS.FOUR_OF_SWORDS,
      data: TAROT_ARKANNUS_DATA.FOUR_OF_SWORDS,
      relatedNumber: 61,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.CHESED),
      suit: suitsIds[TAROT_SUITS.SWORDS],
    },
    {
      id: TAROT_ARKANNUS.THREE_OF_SWORDS,
      data: TAROT_ARKANNUS_DATA.THREE_OF_SWORDS,
      relatedNumber: 62,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.BINAH),
      suit: suitsIds[TAROT_SUITS.SWORDS],
    },
    {
      id: TAROT_ARKANNUS.TWO_OF_SWORDS,
      data: TAROT_ARKANNUS_DATA.TWO_OF_SWORDS,
      relatedNumber: 63,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.CHOKHMAH),
      suit: suitsIds[TAROT_SUITS.SWORDS],
    },
    {
      id: TAROT_ARKANNUS.ACE_OF_SWORDS,
      data: TAROT_ARKANNUS_DATA.ACE_OF_SWORDS,
      relatedNumber: 64,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.KETHER),
      suit: suitsIds[TAROT_SUITS.SWORDS],
    },
    {
      id: TAROT_ARKANNUS.TEN_OF_PENTACLES,
      data: TAROT_ARKANNUS_DATA.TEN_OF_PENTACLES,
      relatedNumber: 69,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.MALKUTH),
      suit: suitsIds[TAROT_SUITS.PENTACLES],
    },
    {
      id: TAROT_ARKANNUS.NINE_OF_PENTACLES,
      data: TAROT_ARKANNUS_DATA.NINE_OF_PENTACLES,
      relatedNumber: 70,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.YESOD),
      suit: suitsIds[TAROT_SUITS.PENTACLES],
    },
    {
      id: TAROT_ARKANNUS.EIGHT_OF_PENTACLES,
      data: TAROT_ARKANNUS_DATA.EIGHT_OF_PENTACLES,
      relatedNumber: 71,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.HOD),
      suit: suitsIds[TAROT_SUITS.PENTACLES],
    },
    {
      id: TAROT_ARKANNUS.SEVEN_OF_PENTACLES,
      data: TAROT_ARKANNUS_DATA.SEVEN_OF_PENTACLES,
      relatedNumber: 72,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.NETZACH),
      suit: suitsIds[TAROT_SUITS.PENTACLES],
    },
    {
      id: TAROT_ARKANNUS.SIX_OF_PENTACLES,
      data: TAROT_ARKANNUS_DATA.SIX_OF_PENTACLES,
      relatedNumber: 73,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.TIPHARETH),
      suit: suitsIds[TAROT_SUITS.PENTACLES],
    },
    {
      id: TAROT_ARKANNUS.FIVE_OF_PENTACLES,
      data: TAROT_ARKANNUS_DATA.FIVE_OF_PENTACLES,
      relatedNumber: 74,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.GEBURAH),
      suit: suitsIds[TAROT_SUITS.PENTACLES],
    },
    {
      id: TAROT_ARKANNUS.FOUR_OF_PENTACLES,
      data: TAROT_ARKANNUS_DATA.FOUR_OF_PENTACLES,
      relatedNumber: 75,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.CHESED),
      suit: suitsIds[TAROT_SUITS.PENTACLES],
    },
    {
      id: TAROT_ARKANNUS.THREE_OF_PENTACLES,
      data: TAROT_ARKANNUS_DATA.THREE_OF_PENTACLES,
      relatedNumber: 76,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.BINAH),
      suit: suitsIds[TAROT_SUITS.PENTACLES],
    },
    {
      id: TAROT_ARKANNUS.TWO_OF_PENTACLES,
      data: TAROT_ARKANNUS_DATA.TWO_OF_PENTACLES,
      relatedNumber: 77,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.CHOKHMAH),
      suit: suitsIds[TAROT_SUITS.PENTACLES],
    },
    {
      id: TAROT_ARKANNUS.ACE_OF_PENTACLES,
      data: TAROT_ARKANNUS_DATA.ACE_OF_PENTACLES,
      relatedNumber: 78,
      sphere: id(KaabalahTypes.SPHERE, SPHERES.KETHER),
      suit: suitsIds[TAROT_SUITS.PENTACLES],
    },
  ];
  for (const minorArkAnnu of minorArkAnnus) {
    tree.addTarotArkAnnu({
      node: minorArkAnnu.sphere,
      tarotArkAnnu: minorArkAnnu.id,
      data: minorArkAnnu.data,
      relatedNumber: minorArkAnnu.relatedNumber,
      suit: minorArkAnnu.suit,
    });
  }

  return tree;
};

export const unloadTarot: Unloader = (tree: TreeOfLife) => {
  const suits = Object.values(WESTERN_ELEMENTS).flatMap((element) =>
    tree
      .related(
        id(WesternAstrologyTypes.WESTERN_ELEMENT, element),
        TarotTypes.TAROT_SUIT
      )
      .map((suit) => suit.id)
  );
  for (let i = 0; i < suits.length; i++) {
    tree.removeNode(suits[i]);
  }

  const majorArkAnnus = Object.values(MELKITZEDEKI_PATHS).flatMap((path) =>
    tree
      .related(id(KaabalahTypes.PATH, path), TarotTypes.TAROT_ARK_ANNU)
      .map((arkannus) => arkannus.id)
  );
  for (let i = 0; i < majorArkAnnus.length; i++) {
    tree.removeNode(majorArkAnnus[i]);
  }

  const minorArkAnnus = Object.values(SPHERES).flatMap((sphere) =>
    tree
      .related(id(KaabalahTypes.SPHERE, sphere), TarotTypes.TAROT_ARK_ANNU)
      .map((arkannus) => arkannus.id)
  );
  for (let i = 0; i < minorArkAnnus.length; i++) {
    tree.removeNode(minorArkAnnus[i]);
  }

  return tree;
};

export const LOADERS = {
  base: loadKaabalah,
  colors: loadColors,
  music: loadMusicalNotes,
  westernAstrology: loadWesternAstrology,
  tarot: loadTarot,
} satisfies Record<string, Loader>;

export const UNLOADERS = {
  base: unloadKaabalah,
  colors: unloadColors,
  music: unloadMusicalNotes,
  westernAstrology: unloadWesternAstrology,
  tarot: unloadTarot,
} satisfies Record<keyof typeof LOADERS, Unloader>;

export const BRIDGES: Bridge[] = [
  {
    id: "kaabalah-color-music",
    needs: ["colors", "music"],
    run: (t) => linkColorsAndSounds(t),
  },
  {
    id: "kaabalah-color-westernAstrology",
    needs: ["colors", "westernAstrology"],
    run: (t) => linkColorsAndWesternAstrology(t),
  },
  {
    id: "kaabalah-music-westernAstrology",
    needs: ["music", "westernAstrology"],
    run: (t) => linkSoundsAndWesternAstrology(t),
  },
];
