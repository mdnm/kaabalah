import { COLORS, COLORS_DATA, FOUR_WORLDS, FOUR_WORLDS_DATA, HEBREW_LETTERS, HEBREW_LETTERS_DATA, LATIN_LETTERS, MELKITZEDEKI_PATHS, MUSICAL_NOTES, MUSICAL_NOTES_DATA, PLANETS, SPHERES, SPHERES_DATA, WESTERN_ELEMENTS } from '../constants';
import { TreeOfLife } from '../tree-of-life';
import { BaseNode, id, KaabalahTypes, LetterTypes, MiscTypes, NodeData, NodeId, WesternAstrologyTypes } from '../types';
import { Bridge, Loader, Unloader } from './registry';

export const SYSTEM = 'hermetic-qabalah' as const;

/**
 * Loads the Hermetic Qabalah system into the tree of life
 */
export function loadHermeticQabalah(tree: TreeOfLife) {
  const spheres = [
    { sphere: SPHERES.KETHER, data: {
      ...SPHERES_DATA.KETHER,
      divineName: "Eheieh",
      archangelicName: "Metraton",
      angelicName: "Chayouth Ha-Qadesh",
      mundaneName: "Rashith Ha-Gilgalim"
    }, relatedNumber: 1 },
    { sphere: SPHERES.CHOKHMAH, data: {
      ...SPHERES_DATA.CHOKHMAH,
      divineName: "Yahve El Yah",
      archangelicName: "Raziel",
      angelicName: "Auphanim",
      mundaneName: "Mazloth"
    }, relatedNumber: 2 },
    { sphere: SPHERES.BINAH, data: {
      ...SPHERES_DATA.BINAH,
      divineName: "Yahve Elohim",
      archangelicName: "Tzaphqiel",
      angelicName: "Aralim",
      mundaneName: "Shabbathai"
    }, relatedNumber: 3 },
    { sphere: SPHERES.DAATH, data: SPHERES_DATA.DAATH, relatedNumber: 11 },
    { sphere: SPHERES.CHESED, data: {
      ...SPHERES_DATA.CHESED,
      divineName: "El",
      archangelicName: "Tzadqiel",
      angelicName: "Chasmalim",
      mundaneName: "Tzedeq"
    }, relatedNumber: 4 },
    { sphere: SPHERES.GEBURAH, data: {
      ...SPHERES_DATA.GEBURAH,
      divineName: "Elohim Gibor",
      archangelicName: "Kamael",
      angelicName: "Seraphim",
      mundaneName: "Madim"
    }, relatedNumber: 5 },
    { sphere: SPHERES.TIPHARETH, data: {
      ...SPHERES_DATA.TIPHARETH,
      divineName: "Yahve Eloah Ve-Daath",
      archangelicName: "Raphael",
      angelicName: "Melekim",
      mundaneName: "Shemesh"
    }, relatedNumber: 6 },
    { sphere: SPHERES.NETZACH, data: {
      ...SPHERES_DATA.NETZACH,
      divineName: "Yahve Tzabaoth",
      archangelicName: "Haniel",
      angelicName: "Elohim",
      mundaneName: "Nogah"
    }, relatedNumber: 7 },
    { sphere: SPHERES.HOD, data: {
      ...SPHERES_DATA.HOD,
      divineName: "Elohim Tzabaoth",
      archangelicName: "Mikael",
      angelicName: "Beni Elohim",
      mundaneName: "Kokab"
    }, relatedNumber: 8 },
    { sphere: SPHERES.YESOD, data: {
      ...SPHERES_DATA.YESOD,
      divineName: "Shadai El Chai",
      archangelicName: "Gabriel",
      angelicName: "Kerubim",
      mundaneName: "Levanah"
    }, relatedNumber: 9 },
    { sphere: SPHERES.MALKUTH, data: {
      ...SPHERES_DATA.MALKUTH,
      divineName: "Adonai Malek",
      archangelicName: "Sandalphon",
      angelicName: "Ashim",
      mundaneName: "Olam Yesodot"
    }, relatedNumber: 10 },
  ]

  const sphereIds: Record<string, NodeId<KaabalahTypes.SPHERE>> = {};
  for (const sphere of spheres) {
    sphereIds[sphere.sphere] = tree.addSphere(sphere);
  }

  const worldsWithElements: { id: string, data: NodeData<KaabalahTypes.WORLD>, element: string }[] = [
    { id: FOUR_WORLDS.ATZILUTH, data: FOUR_WORLDS_DATA.ATZILUTH, element: WESTERN_ELEMENTS.FIRE },
    { id: FOUR_WORLDS.BRIAH, data: FOUR_WORLDS_DATA.BRIAH, element: WESTERN_ELEMENTS.WATER },
    { id: FOUR_WORLDS.YETZIRAH, data: FOUR_WORLDS_DATA.YETZIRAH, element: WESTERN_ELEMENTS.AIR },
    { id: FOUR_WORLDS.ASSIAH, data: FOUR_WORLDS_DATA.ASSIAH, element: WESTERN_ELEMENTS.EARTH },
  ]
  for (const world of worldsWithElements) {
    const worldId = tree.upsertNode(new BaseNode({
      id: world.id,
      type: KaabalahTypes.WORLD,
      data: world.data,
    }));

    const elementId = tree.upsertNode(new BaseNode({
      id: world.element,
      type: WesternAstrologyTypes.WESTERN_ELEMENT,
    }));

    tree.link(worldId, elementId);
  }

  const paths = [
    {
      leftSphere: sphereIds[SPHERES.KETHER],
      rightSphere: sphereIds[SPHERES.CHOKHMAH],
      relatedNumber: MELKITZEDEKI_PATHS.KETHER_CHOKHMAH,
      letters: [
        { letter: LATIN_LETTERS.E, type: LetterTypes.LATIN_LETTER },
        { letter: HEBREW_LETTERS.HE, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.HE }
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.KETHER],
      rightSphere: sphereIds[SPHERES.BINAH],
      relatedNumber: MELKITZEDEKI_PATHS.KETHER_BINAH,
      letters: [
        { letter: LATIN_LETTERS.B, type: LetterTypes.LATIN_LETTER },
        { letter: HEBREW_LETTERS.BETH, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.BETH }
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.KETHER],
      rightSphere: sphereIds[SPHERES.TIPHARETH],
      relatedNumber: MELKITZEDEKI_PATHS.KETHER_TIPHARETH,
      letters: [
        { letter: LATIN_LETTERS.G, type: LetterTypes.LATIN_LETTER },
        { letter: HEBREW_LETTERS.GIMEL, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.GIMEL }
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.CHOKHMAH],
      rightSphere: sphereIds[SPHERES.BINAH],
      relatedNumber: MELKITZEDEKI_PATHS.CHOKHMAH_BINAH,
      letters: [
        { letter: LATIN_LETTERS.D, type: LetterTypes.LATIN_LETTER },
        { letter: HEBREW_LETTERS.DALET, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.DALET }
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.CHOKHMAH],
      rightSphere: sphereIds[SPHERES.TIPHARETH],
      relatedNumber: MELKITZEDEKI_PATHS.CHOKHMAH_TIPHARETH,
      letters: [
        { letter: LATIN_LETTERS.E, type: LetterTypes.LATIN_LETTER },
        { letter: LATIN_LETTERS.Ã, type: LetterTypes.LATIN_LETTER },
        { letter: HEBREW_LETTERS.HE, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.HE }
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.CHOKHMAH],
      rightSphere: sphereIds[SPHERES.CHESED],
      relatedNumber: MELKITZEDEKI_PATHS.CHOKHMAH_CHESED,
      letters: [
        { letter: LATIN_LETTERS.V, type: LetterTypes.LATIN_LETTER },
        { letter: LATIN_LETTERS.U, type: LetterTypes.LATIN_LETTER },
        { letter: LATIN_LETTERS.W, type: LetterTypes.LATIN_LETTER },
        { letter: LATIN_LETTERS.O, type: LetterTypes.LATIN_LETTER },
        { letter: HEBREW_LETTERS.VAV, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.VAV }
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.BINAH],
      rightSphere: sphereIds[SPHERES.TIPHARETH],
      relatedNumber: MELKITZEDEKI_PATHS.BINAH_TIPHARETH,
      letters: [
        { letter: LATIN_LETTERS.Z, type: LetterTypes.LATIN_LETTER },
        { letter: HEBREW_LETTERS.ZAYIN, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.ZAYIN }
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.BINAH],
      rightSphere: sphereIds[SPHERES.GEBURAH],
      relatedNumber: MELKITZEDEKI_PATHS.BINAH_GEBURAH,
      letters: [
        { letter: LATIN_LETTERS.H, type: LetterTypes.LATIN_LETTER },
        { letter: HEBREW_LETTERS.HET, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.HET }
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.CHESED],
      rightSphere: sphereIds[SPHERES.GEBURAH],
      relatedNumber: MELKITZEDEKI_PATHS.CHESED_GEBURAH,
      letters: [
        { letter: LATIN_LETTERS.T, type: LetterTypes.LATIN_LETTER },
        { letter: HEBREW_LETTERS.TET, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.TET }
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.CHESED],
      rightSphere: sphereIds[SPHERES.TIPHARETH],
      relatedNumber: MELKITZEDEKI_PATHS.CHESED_TIPHARETH,
      letters: [
        { letter: LATIN_LETTERS.I, type: LetterTypes.LATIN_LETTER },
        { letter: LATIN_LETTERS.Y, type: LetterTypes.LATIN_LETTER },
        { letter: LATIN_LETTERS.J, type: LetterTypes.LATIN_LETTER },
        { letter: HEBREW_LETTERS.YOD, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.YOD }
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.CHESED],
      rightSphere: sphereIds[SPHERES.NETZACH],
      relatedNumber: MELKITZEDEKI_PATHS.CHESED_NETZACH,
      letters: [
        { letter: LATIN_LETTERS.C, type: LetterTypes.LATIN_LETTER },
        { letter: HEBREW_LETTERS.KAPH, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.KAPH }
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.GEBURAH],
      rightSphere: sphereIds[SPHERES.TIPHARETH],
      relatedNumber: MELKITZEDEKI_PATHS.GEBURAH_TIPHARETH,
      letters: [
        { letter: LATIN_LETTERS.L, type: LetterTypes.LATIN_LETTER },
        { letter: HEBREW_LETTERS.LAMED, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.LAMED }
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.GEBURAH],
      rightSphere: sphereIds[SPHERES.HOD],
      relatedNumber: MELKITZEDEKI_PATHS.GEBURAH_HOD,
      letters: [
        { letter: LATIN_LETTERS.M, type: LetterTypes.LATIN_LETTER },
        { letter: HEBREW_LETTERS.MEM, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.MEM }
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.TIPHARETH],
      rightSphere: sphereIds[SPHERES.NETZACH],
      relatedNumber: MELKITZEDEKI_PATHS.TIPHARETH_NETZACH,
      letters: [
        { letter: LATIN_LETTERS.N, type: LetterTypes.LATIN_LETTER },
        { letter: HEBREW_LETTERS.NUN, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.NUN }
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.TIPHARETH],
      rightSphere: sphereIds[SPHERES.YESOD],
      relatedNumber: MELKITZEDEKI_PATHS.TIPHARETH_YESOD,
      letters: [
        { letter: LATIN_LETTERS.S, type: LetterTypes.LATIN_LETTER },
        { letter: LATIN_LETTERS.Ç, type: LetterTypes.LATIN_LETTER },
        { letter: HEBREW_LETTERS.SAMEKH, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.SAMEKH }
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.TIPHARETH],
      rightSphere: sphereIds[SPHERES.HOD],
      relatedNumber: MELKITZEDEKI_PATHS.TIPHARETH_HOD,
      letters: [
        { letter: LATIN_LETTERS.O, type: LetterTypes.LATIN_LETTER },
        { letter: HEBREW_LETTERS.AYIN, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.AYIN }
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.NETZACH],
      rightSphere: sphereIds[SPHERES.HOD],
      relatedNumber: MELKITZEDEKI_PATHS.NETZACH_HOD,
      letters: [
        { letter: LATIN_LETTERS.P, type: LetterTypes.LATIN_LETTER },
        { letter: LATIN_LETTERS.F, type: LetterTypes.LATIN_LETTER },
        { letter: LATIN_LETTERS.PH, type: LetterTypes.LATIN_LETTER },
        { letter: HEBREW_LETTERS.PE, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.PE }
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.NETZACH],
      rightSphere: sphereIds[SPHERES.YESOD],
      relatedNumber: MELKITZEDEKI_PATHS.NETZACH_YESOD,
      letters: [
        { letter: LATIN_LETTERS.TS, type: LetterTypes.LATIN_LETTER },
        { letter: LATIN_LETTERS.TZ, type: LetterTypes.LATIN_LETTER },
        { letter: HEBREW_LETTERS.TSADI, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.TSADI }
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.NETZACH],
      rightSphere: sphereIds[SPHERES.MALKUTH],
      relatedNumber: MELKITZEDEKI_PATHS.NETZACH_MALKUTH,
      letters: [
        { letter: LATIN_LETTERS.K, type: LetterTypes.LATIN_LETTER },
        { letter: LATIN_LETTERS.Q, type: LetterTypes.LATIN_LETTER },
        { letter: LATIN_LETTERS.KH, type: LetterTypes.LATIN_LETTER },
        { letter: HEBREW_LETTERS.QOPH, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.QOPH }
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.HOD],
      rightSphere: sphereIds[SPHERES.YESOD],
      relatedNumber: MELKITZEDEKI_PATHS.HOD_YESOD,
      letters: [
        { letter: LATIN_LETTERS.R, type: LetterTypes.LATIN_LETTER },
        { letter: HEBREW_LETTERS.RESH, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.RESH }
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.HOD],
      rightSphere: sphereIds[SPHERES.MALKUTH],
      relatedNumber: MELKITZEDEKI_PATHS.HOD_MALKUTH,
      letters: [
        { letter: LATIN_LETTERS.CH, type: LetterTypes.LATIN_LETTER },
        { letter: LATIN_LETTERS.SH, type: LetterTypes.LATIN_LETTER },
        { letter: LATIN_LETTERS.X, type: LetterTypes.LATIN_LETTER },
        { letter: HEBREW_LETTERS.SHIN, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.SHIN }
      ],
    },
    {
      leftSphere: sphereIds[SPHERES.YESOD],
      rightSphere: sphereIds[SPHERES.MALKUTH],
      relatedNumber: MELKITZEDEKI_PATHS.YESOD_MALKUTH,
      letters: [
        { letter: LATIN_LETTERS.TH, type: LetterTypes.LATIN_LETTER },
        { letter: HEBREW_LETTERS.TAV, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.TAV }
      ],
    },
  ]

  for (const path of paths) {
    const pathId = tree.addPath({
      leftSphere: path.leftSphere,
      rightSphere: path.rightSphere,
      relatedNumber: path.relatedNumber,
    });

    tree.addLetters({
      path: pathId,
      letters: path.letters,
    });
  }

  return tree;
}

export function unloadHermeticQabalah(tree: TreeOfLife) {
  const spheres = Object.values(SPHERES);
  for (let i = 0; i < spheres.length; i++) {
    tree.removeNode(id(KaabalahTypes.SPHERE, spheres[i]));
  }

  const paths = Object.values(MELKITZEDEKI_PATHS);
  for (let i = 0; i < paths.length; i++) {
    tree.removeNode(id(KaabalahTypes.PATH, paths[i]));
  }
}

export function loadColors(tree: TreeOfLife) {
  const sphereColors: { sphere: string, worldColors: { world: string, color: { id: string, data: NodeData<MiscTypes.COLOR> } }[] }[] = [
    { sphere: SPHERES.KETHER, worldColors: [
      { world: FOUR_WORLDS.ATZILUTH, color: { id: "splendor", data: { 
        colorDescription: "Splendor",
        colorNames: ["transparent"],
        colorHexCodes: ["#ffffff"]
      } } },
      { world: FOUR_WORLDS.BRIAH, color: { id: "white-splendor", data: { 
        colorDescription: "White splendor, pure",
        colorNames: ["white"],
        colorHexCodes: ["#ffffff"]
      } } },
      { world: FOUR_WORLDS.YETZIRAH, color: { id: "white-splendor", data: { 
        colorDescription: "White splendor, pure",
        colorNames: ["white"],
        colorHexCodes: ["#ffffff"]
      } } },
      { world: FOUR_WORLDS.ASSIAH, color: { id: "white-speckled-gold", data: { 
        colorDescription: "White speckled with gold",
        colorNames: ["white", "gold"],
        colorHexCodes: ["#ffffff", "#FFD700"]
      } } }
    ] },
    { sphere: SPHERES.CHOKHMAH, worldColors: [
      { world: FOUR_WORLDS.ATZILUTH, color: { id: "blue", data: { 
        colorDescription: "Smooth blue, pure",
        colorNames: COLORS_DATA.BLUE.colorNames,
        colorHexCodes: COLORS_DATA.BLUE.colorHexCodes
      } } },
      { world: FOUR_WORLDS.BRIAH, color: { id: "grey", data: { 
        colorDescription: "Grey",
        colorNames: ["grey"],
        colorHexCodes: ["#808080"]
      } } },
      { world: FOUR_WORLDS.YETZIRAH, color: { id: "grey-iridescent", data: { 
        colorDescription: "Pearl grey iridescent",
        colorNames: ["grey", "iridescent"],
        colorHexCodes: ["#808080", "#EDBBE7"]
      } } },
      { world: FOUR_WORLDS.ASSIAH, color: { id: "white-speckled-red-blue-yellow", data: { 
        colorDescription: "White speckled with red, blue and yellow",
        colorNames: ["white", ...COLORS_DATA.RED.colorNames, ...COLORS_DATA.BLUE.colorNames, ...COLORS_DATA.YELLOW.colorNames],
        colorHexCodes: ["#FFFFFF", ...COLORS_DATA.RED.colorHexCodes, ...COLORS_DATA.BLUE.colorHexCodes, ...COLORS_DATA.YELLOW.colorHexCodes]
      } } }
    ] },
    { sphere: SPHERES.BINAH, worldColors: [
      { world: FOUR_WORLDS.ATZILUTH, color: { id: "crimson", data: { 
        colorDescription: "Crimson",
        colorNames: ["crimson"],
        colorHexCodes: ["#DC143C"]
      } } },
      { world: FOUR_WORLDS.BRIAH, color: { id: "black", data: { 
        colorDescription: "Black",
        colorNames: ["black"],
        colorHexCodes: ["#000000"]
      } } },
      { world: FOUR_WORLDS.YETZIRAH, color: { id: "dark-brown", data: { 
        colorDescription: "Dark brown",
        colorNames: ["dark-brown"],
        colorHexCodes: ["#422E29"]
      } } },
      { world: FOUR_WORLDS.ASSIAH, color: { id: "grey-speckled-pink", data: { 
        colorDescription: "Grey speckled with pink",
        colorNames: ["grey", "pink"],
        colorHexCodes: ["#808080", "#FFC0CB"]
      } } }
    ] },
    { sphere: SPHERES.DAATH, worldColors: [
      { world: FOUR_WORLDS.ATZILUTH, color: { id: "lavender", data: { 
        colorDescription: "Lavender",
        colorNames: ["lavender"],
        colorHexCodes: ["#E6E6FA"]
      } } },
      { world: FOUR_WORLDS.BRIAH, color: { id: "dark-grey", data: { 
        colorDescription: "Dark grey",
        colorNames: ["dark-grey"],
        colorHexCodes: ["#808080"]
      } } },
      { world: FOUR_WORLDS.YETZIRAH, color: { id: "pure-violet", data: { 
        colorDescription: "Pure violet",
        colorNames: ["violet"],
        colorHexCodes: ["#8F00FF"]
      } } },
      { world: FOUR_WORLDS.ASSIAH, color: { id: "grey-speckled-gold", data: { 
        colorDescription: "Grey speckled with gold",
        colorNames: ["grey", "gold"],
        colorHexCodes: ["#808080", "#FFD700"]
      } } }
    ] },
    { sphere: SPHERES.CHESED, worldColors: [
      { world: FOUR_WORLDS.ATZILUTH, color: { id: "intense-violet", data: { 
        colorDescription: "Intense violet",
        colorNames: ["intense-violet"],
        colorHexCodes: ["#9400D3"]
      } } },
      { world: FOUR_WORLDS.BRIAH, color: { id: "blue", data: { 
        colorDescription: "Blue",
        colorNames: ["blue"],
        colorHexCodes: ["#0000FF"]
      } } },
      { world: FOUR_WORLDS.YETZIRAH, color: { id: "intense-purple", data: { 
        colorDescription: "Intense purple",
        colorNames: ["intense-purple"],
        colorHexCodes: ["#800080"]
      } } },
      { world: FOUR_WORLDS.ASSIAH, color: { id: "intense-blue-speckled-yellow", data: { 
        colorDescription: "Intense blue speckled with yellow",
        colorNames: ["intense-blue", ...COLORS_DATA.YELLOW.colorNames],
        colorHexCodes: ["#0000FF", ...COLORS_DATA.YELLOW.colorHexCodes]
      } } }
    ] },
    { sphere: SPHERES.GEBURAH, worldColors: [
      { world: FOUR_WORLDS.ATZILUTH, color: { id:  COLORS.ORANGE, data: COLORS_DATA.ORANGE } },
      { world: FOUR_WORLDS.BRIAH, color: { id: "scarlet-red", data: { 
        colorDescription: "Scarlet red",
        colorNames: ["scarlet-red"],
        colorHexCodes: ["#FF2400"]
      } } },
      { world: FOUR_WORLDS.YETZIRAH, color: { id: "bright-scarlet", data: { 
        colorDescription: "Bright scarlet",
        colorNames: ["bright-scarlet"],
        colorHexCodes: ["#FF2400"]
      } } },
      { world: FOUR_WORLDS.ASSIAH, color: { id: "red-speckled-black", data: { 
        colorDescription: "Red speckled with black",
        colorNames: [...COLORS_DATA.RED.colorNames, "black"],
        colorHexCodes: [...COLORS_DATA.RED.colorHexCodes, "#000000"]
      } } }
    ] },
    { sphere: SPHERES.TIPHARETH, worldColors: [
      { world: FOUR_WORLDS.ATZILUTH, color: { id: "gold-yellow", data: { 
        colorDescription: "Gold yellow",
        colorNames: ["gold-yellow"],
        colorHexCodes: ["#FFD700"]
      } } },
      { world: FOUR_WORLDS.BRIAH, color: { id: "rose-pink", data: { 
        colorDescription: "Rose pink",
        colorNames: ["rose-pink"],
        colorHexCodes: ["#FFC0CB"]
      } } },
      { world: FOUR_WORLDS.YETZIRAH, color: { id: "salmon-pink-reddish-carmine-amber-brown-mixed", data: { 
        colorDescription: "Salmon pink, reddish carmine, amber, brown, mixed",
        colorNames: ["salmon-pink", "reddish-carmine", "amber", "brown", "mixed"],
        colorHexCodes: ["#FF9999", "#960018", "#996515"]
      } } },
      { world: FOUR_WORLDS.ASSIAH, color: { id: "gold-speckled-green", data: { 
        colorDescription: "Gold speckled with green",
        colorNames: ["gold", "green"],
        colorHexCodes: ["#FFD700", "#BDB76B"],
      } } }
    ] },
    { sphere: SPHERES.NETZACH, worldColors: [
      { world: FOUR_WORLDS.ATZILUTH, color: { id: "amber", data: { 
        colorDescription: "Amber",
        colorNames: ["amber"],
        colorHexCodes: ["#FFBF00"]
      } } },
      { world: FOUR_WORLDS.BRIAH, color: { id: "emerald-green", data: { 
        colorDescription: "Emerald green",
        colorNames: ["emerald-green"],
        colorHexCodes: ["#50C878"]
      } } },
      { world: FOUR_WORLDS.YETZIRAH, color: { id: "bright-yellowish-green", data: { 
        colorDescription: "Bright yellowish green",
        colorNames: ["bright-yellowish-green"],
        colorHexCodes: ["#98FB98"]
      } } },
      { world: FOUR_WORLDS.ASSIAH, color: { id: "olive-green-speckled-gold", data: { 
        colorDescription: "Olive green speckled with gold",
        colorNames: ["olive-green", "gold"],
        colorHexCodes: ["#BAB86C", "#FFD700"]
      } } }
    ] },
    { sphere: SPHERES.HOD, worldColors: [
      { world: FOUR_WORLDS.ATZILUTH, color: { id: "violet-purple", data: { 
        colorDescription: "Violet-purple",
        colorNames: ["violet-purple"],
        colorHexCodes: ["#9B30FF"]
      } } },
      { world: FOUR_WORLDS.BRIAH, color: { id: "orange", data: { 
        colorDescription: "Orange",
        colorNames: ["orange"],
        colorHexCodes: ["#FFA500"]
      } } },
      { world: FOUR_WORLDS.YETZIRAH, color: { id: "red-purple", data: { 
        colorDescription: "Red-purple",
        colorNames: ["red-purple"],
        colorHexCodes: ["#C71585"]
      } } },
      { world: FOUR_WORLDS.ASSIAH, color: { id: "yellowish-black-speckled-with-white", data: { 
        colorDescription: "Yellowish black speckled with white",
        colorNames: ["yellowish-black-speckled-with-white"],
        colorHexCodes: ["#2B2B1B", "#FFFFFF"]
      } } }
    ] },
    { sphere: SPHERES.YESOD, worldColors: [
      { world: FOUR_WORLDS.ATZILUTH, color: { id: "indigo", data: { 
        colorDescription: "Indigo",
        colorNames: ["indigo"],
        colorHexCodes: ["#4B0082"]
      } } },
      { world: FOUR_WORLDS.BRIAH, color: { id: COLORS.VIOLET, data: COLORS_DATA.VIOLET } },
      { world: FOUR_WORLDS.YETZIRAH, color: { id: "purple", data: { 
        colorDescription: "Purple",
        colorNames: ["purple"],
        colorHexCodes: ["#800080"]
      } } },
      { world: FOUR_WORLDS.ASSIAH, color: { id: "citrine-speckled-blue", data: { 
        colorDescription: "Citrine speckled with blue",
        colorNames: ["citrine-speckled-blue"],
        colorHexCodes: ["#E4D00A", "#1E90FF"]
      } } }
    ] },
    { sphere: SPHERES.MALKUTH, worldColors: [
      { world: FOUR_WORLDS.ATZILUTH, color: { id: COLORS.YELLOW, data: COLORS_DATA.YELLOW } },
      { world: FOUR_WORLDS.BRIAH, color: { id: "brown", data: { 
        colorDescription: "Made up of the colors of earth, which is created from the 4 elements. Brown can be used to represent it, but, usually it is represented in a pizza-like pattern, starting with Olive on top, and going clockwise with Yellow, Black and Red, all with slightly less saturation.",
        colorNames: ["brown", "olive", "yellow", "black", "red"],
        colorHexCodes: ["#422E29", "#BAB86C", "#FFF659", "#000000", "#FF5454"],
      } } },
      { world: FOUR_WORLDS.YETZIRAH, color: { id: "olive-green", data: { 
        colorDescription: "Olive green",
        colorNames: ["olive-green"],
        colorHexCodes: ["#BAB86C"]
      } } },
      { world: FOUR_WORLDS.ASSIAH, color: { id: "black", data: { 
        colorDescription: "Black",
        colorNames: ["black"],
        colorHexCodes: ["#000000"]
      } } }
    ] }
  ]

  for (const sphereColor of sphereColors) {
    const sphereId = id(KaabalahTypes.SPHERE, sphereColor.sphere);
    for (const worldColor of sphereColor.worldColors) {
      const colorId = tree.upsertNode(new BaseNode({
        id: id(MiscTypes.COLOR, worldColor.color.id),
        type: MiscTypes.COLOR,
        data: worldColor.color.data,
      }));

      tree.link(sphereId, colorId);
      tree.link(colorId, id(KaabalahTypes.WORLD, worldColor.world));
    }
  }

  return tree;
}

export function unloadColors(tree: TreeOfLife) {
  const sphereColors = Object.values(SPHERES).flatMap((sphere) => tree.related(id(KaabalahTypes.SPHERE, sphere), MiscTypes.COLOR).map((color) => color.id));
  for (let i = 0; i < sphereColors.length; i++) {
    tree.removeNode(sphereColors[i]);
  }
}

export function loadMusicalNotes(tree: TreeOfLife) {
  const musicalNotes: { sphere: string, note: string, noteData: NodeData<MiscTypes.MUSICAL_NOTE> }[] = [
    { sphere: SPHERES.KETHER, note: "The Sound of the Spheres", noteData: {
      note: "The Sound of the Spheres",
      noteDescription: "The sound of the spheres"
    } },
    { sphere: SPHERES.CHOKHMAH, note: "Mantras", noteData: {
      note: "Mantra",
      noteDescription: "All sounds considered devotional mantras"
    } },
    { sphere: SPHERES.BINAH, note: MUSICAL_NOTES.SI, noteData: MUSICAL_NOTES_DATA.SI },
    { sphere: SPHERES.CHESED, note: MUSICAL_NOTES.LA, noteData: MUSICAL_NOTES_DATA.LA },
    { sphere: SPHERES.GEBURAH, note: "Do-treble", noteData: {
      note: "Do",
      noteDescription: "C (Do), in the treble clef"
    } },
    { sphere: SPHERES.TIPHARETH, note: "Sol-treble", noteData: {
      note: "Sol",
      noteDescription: "G (Sol), in the treble clef"
    } },
    { sphere: SPHERES.NETZACH, note: MUSICAL_NOTES.DO, noteData: MUSICAL_NOTES_DATA.DO },
    { sphere: SPHERES.HOD, note: MUSICAL_NOTES.MI, noteData: MUSICAL_NOTES_DATA.MI },
    { sphere: SPHERES.YESOD, note: MUSICAL_NOTES.MI, noteData: MUSICAL_NOTES_DATA.MI },
    { sphere: SPHERES.MALKUTH, note: MUSICAL_NOTES.FA, noteData: MUSICAL_NOTES_DATA.FA },
  ]

  for (const musicalNote of musicalNotes) {
    const sphereId = id(KaabalahTypes.SPHERE, musicalNote.sphere);
    const noteId = tree.upsertNode(new BaseNode({
      id: id(MiscTypes.MUSICAL_NOTE, musicalNote.note),
      type: MiscTypes.MUSICAL_NOTE,
      data: musicalNote.noteData,
    }));

    tree.link(sphereId, noteId);
  }

  return tree;
}

export function unloadMusicalNotes(tree: TreeOfLife) {
  const sphereNotes = Object.values(SPHERES).flatMap((sphere) => tree.related(id(KaabalahTypes.SPHERE, sphere), MiscTypes.MUSICAL_NOTE).map((color) => color.id));
  for (let i = 0; i < sphereNotes.length; i++) {
    tree.removeNode(sphereNotes[i]);
  }
}

const linkColorsAndSounds = (t: TreeOfLife) => {
  // TODO: implement
  return t;
}

export const loadWesternAstrology: Loader = (tree: TreeOfLife) => {
  const planets: { sphere: string, planet: string }[] = [
    { sphere: SPHERES.KETHER, planet: PLANETS.NEPTUNE },
    { sphere: SPHERES.CHOKHMAH, planet: PLANETS.URANUS },
    { sphere: SPHERES.BINAH, planet: PLANETS.SATURN },
    { sphere: SPHERES.DAATH, planet: PLANETS.PLUTO },
    { sphere: SPHERES.CHESED, planet: PLANETS.JUPITER },
    { sphere: SPHERES.GEBURAH, planet: PLANETS.MARS },
    { sphere: SPHERES.TIPHARETH, planet: PLANETS.SUN },
    { sphere: SPHERES.NETZACH, planet: PLANETS.VENUS },
    { sphere: SPHERES.HOD, planet: PLANETS.MERCURY },
    { sphere: SPHERES.YESOD, planet: PLANETS.MOON },
    { sphere: SPHERES.MALKUTH, planet: PLANETS.EARTH },
  ]

  for (const planet of planets) {
    const sphereId = id(KaabalahTypes.SPHERE, planet.sphere);
    const planetId = tree.upsertNode(new BaseNode({
      id: id(WesternAstrologyTypes.PLANET, planet.planet),
      type: WesternAstrologyTypes.PLANET,
    }));

    tree.link(sphereId, planetId);
  }

  return tree;
}

export const unloadWesternAstrology: Unloader = (tree: TreeOfLife) => {
  const planets = Object.values(SPHERES).flatMap((sphere) => tree.related(id(KaabalahTypes.SPHERE, sphere), WesternAstrologyTypes.PLANET).map((planet) => planet.id));
  for (let i = 0; i < planets.length; i++) {
    tree.removeNode(planets[i]);
  }
}

export const LOADERS = {
  base: loadHermeticQabalah,
  colors: loadColors,
  music: loadMusicalNotes,
  westernAstrology: loadWesternAstrology,
} satisfies Record<string, Loader>

export const UNLOADERS = {
  base: unloadHermeticQabalah,
  colors: unloadColors,
  music: unloadMusicalNotes,
  westernAstrology: unloadWesternAstrology,
} satisfies Record<keyof typeof LOADERS, Unloader>


export const BRIDGES: Bridge[] = [
  {
    id: 'hermetic-qabalah-color-music',
    needs: ['colors', 'music'],
    run: t => linkColorsAndSounds(t) 
  },
]