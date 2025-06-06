import { FOUR_WORLDS, FOUR_WORLDS_DATA, HEBREW_LETTERS, HEBREW_LETTERS_DATA, LATIN_LETTERS, LATIN_LETTERS_DATA, LURIANIC_PATHS, SPHERES, SPHERES_DATA, WESTERN_ELEMENTS } from '../constants';
import { TreeOfLife } from '../tree-of-life';
import { BaseNode, KaabalahTypes, LetterTypes, NodeData, NodeId, WesternAstrologyTypes, id } from '../types';
import { Bridge, Loader, Unloader } from './registry';

export const SYSTEM = 'lurianic-kabbalah' as const;

/**
 * Loads the Lurianic Kabbalah system into the tree of life
 */
export function loadLurianicKabbalah(tree: TreeOfLife) {
  const spheres = [
    { sphere: SPHERES.KETHER, data: SPHERES_DATA.KETHER, relatedNumber: 1 },
    { sphere: SPHERES.CHOKHMAH, data: SPHERES_DATA.CHOKHMAH, relatedNumber: 2 },
    { sphere: SPHERES.BINAH, data: SPHERES_DATA.BINAH, relatedNumber: 3 },
    { sphere: SPHERES.CHESED, data: SPHERES_DATA.CHESED, relatedNumber: 4 },
    { sphere: SPHERES.GEBURAH, data: SPHERES_DATA.GEBURAH, relatedNumber: 5 },
    { sphere: SPHERES.TIPHARETH, data: SPHERES_DATA.TIPHARETH, relatedNumber: 6 },
    { sphere: SPHERES.NETZACH, data: SPHERES_DATA.NETZACH, relatedNumber: 7 },
    { sphere: SPHERES.HOD, data: SPHERES_DATA.HOD, relatedNumber: 8 },
    { sphere: SPHERES.YESOD, data: SPHERES_DATA.YESOD, relatedNumber: 9 },
    { sphere: SPHERES.MALKUTH, data: SPHERES_DATA.MALKUTH, relatedNumber: 10 },
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
      relatedNumber: LURIANIC_PATHS.KETHER_CHOKHMAH,
      letters: [
        { letter: LATIN_LETTERS.E, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.E },
        { letter: HEBREW_LETTERS.HE, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.HE }
      ]
    },
    { 
      leftSphere: sphereIds[SPHERES.KETHER],
      rightSphere: sphereIds[SPHERES.BINAH],
      relatedNumber: LURIANIC_PATHS.KETHER_BINAH,
      letters: [
        { letter: LATIN_LETTERS.V, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.V },
        { letter: LATIN_LETTERS.U, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.U },
        { letter: LATIN_LETTERS.W, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.W },
        { letter: LATIN_LETTERS.O, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.O },
        { letter: HEBREW_LETTERS.VAV, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.VAV }
      ]
    },
    { 
      leftSphere: sphereIds[SPHERES.KETHER],
      rightSphere: sphereIds[SPHERES.TIPHARETH],
      relatedNumber: LURIANIC_PATHS.KETHER_TIPHARETH,
      letters: [
        { letter: LATIN_LETTERS.D, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.D },
        { letter: HEBREW_LETTERS.DALET, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.DALET }
      ]
    },
    { 
      leftSphere: sphereIds[SPHERES.CHOKHMAH],
      rightSphere: sphereIds[SPHERES.BINAH],
      relatedNumber: LURIANIC_PATHS.CHOKHMAH_BINAH,
      letters: [
        { letter: LATIN_LETTERS.CH, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.CH },
        { letter: LATIN_LETTERS.SH, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.SH },
        { letter: LATIN_LETTERS.X, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.X },
        { letter: HEBREW_LETTERS.SHIN, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.SHIN }
      ]
    },
    { 
      leftSphere: sphereIds[SPHERES.CHOKHMAH],
      rightSphere: sphereIds[SPHERES.CHESED],
      relatedNumber: LURIANIC_PATHS.CHOKHMAH_CHESED,
      letters: [
        { letter: LATIN_LETTERS.Z, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.Z },
        { letter: HEBREW_LETTERS.ZAYIN, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.ZAYIN }
      ]
    },
    { 
      leftSphere: sphereIds[SPHERES.CHOKHMAH],
      rightSphere: sphereIds[SPHERES.GEBURAH],
      relatedNumber: LURIANIC_PATHS.CHOKHMAH_GEBURAH,
      letters: [
        { letter: LATIN_LETTERS.T, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.T },
        { letter: HEBREW_LETTERS.TET, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.TET }
      ]
    },
    { 
      leftSphere: sphereIds[SPHERES.CHOKHMAH],
      rightSphere: sphereIds[SPHERES.TIPHARETH],
      relatedNumber: LURIANIC_PATHS.CHOKHMAH_TIPHARETH,
      letters: [
        { letter: LATIN_LETTERS.B, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.B },
        { letter: HEBREW_LETTERS.BETH, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.BETH }
      ]
    },
    { 
      leftSphere: sphereIds[SPHERES.BINAH],
      rightSphere: sphereIds[SPHERES.CHESED],
      relatedNumber: LURIANIC_PATHS.BINAH_CHESED,
      letters: [
        { letter: LATIN_LETTERS.H, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.H },
        { letter: HEBREW_LETTERS.HET, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.HET }
      ]
    },
    { 
      leftSphere: sphereIds[SPHERES.BINAH],
      rightSphere: sphereIds[SPHERES.TIPHARETH],
      relatedNumber: LURIANIC_PATHS.BINAH_TIPHARETH,
      letters: [
        { letter: LATIN_LETTERS.I, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.I },
        { letter: LATIN_LETTERS.J, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.J },
        { letter: LATIN_LETTERS.Y, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.Y },
        { letter: HEBREW_LETTERS.YOD, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.YOD }
      ]
    },
    { 
      leftSphere: sphereIds[SPHERES.BINAH],
      rightSphere: sphereIds[SPHERES.GEBURAH],
      relatedNumber: LURIANIC_PATHS.BINAH_GEBURAH,
      letters: [
        { letter: LATIN_LETTERS.G, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.G },
        { letter: HEBREW_LETTERS.GIMEL, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.GIMEL }
      ]
    },
    { 
      leftSphere: sphereIds[SPHERES.CHESED],
      rightSphere: sphereIds[SPHERES.GEBURAH],
      relatedNumber: LURIANIC_PATHS.CHESED_GEBURAH,
      letters: [
        { letter: LATIN_LETTERS.A, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.A },
        { letter: HEBREW_LETTERS.ALEPH, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.ALEPH }
      ]
    },
    { 
      leftSphere: sphereIds[SPHERES.CHESED],
      rightSphere: sphereIds[SPHERES.TIPHARETH],
      relatedNumber: LURIANIC_PATHS.CHESED_TIPHARETH,
      letters: [
        { letter: LATIN_LETTERS.L, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.L },
        { letter: HEBREW_LETTERS.LAMED, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.LAMED }
      ]
    },
    { 
      leftSphere: sphereIds[SPHERES.CHESED],
      rightSphere: sphereIds[SPHERES.NETZACH],
      relatedNumber: LURIANIC_PATHS.CHESED_NETZACH,
      letters: [
        { letter: LATIN_LETTERS.C, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.C },
        { letter: HEBREW_LETTERS.KAPH, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.KAPH }
      ]
    },
    { 
      leftSphere: sphereIds[SPHERES.GEBURAH],
      rightSphere: sphereIds[SPHERES.TIPHARETH],
      relatedNumber: LURIANIC_PATHS.GEBURAH_TIPHARETH,
      letters: [
        { letter: LATIN_LETTERS.N, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.N },
        { letter: HEBREW_LETTERS.NUN, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.NUN }
      ]
    },
    { 
      leftSphere: sphereIds[SPHERES.GEBURAH],
      rightSphere: sphereIds[SPHERES.HOD],
      relatedNumber: LURIANIC_PATHS.GEBURAH_HOD,
      letters: [
        { letter: LATIN_LETTERS.P, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.P },
        { letter: LATIN_LETTERS.F, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.F },
        { letter: LATIN_LETTERS.PH, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.PH },
        { letter: HEBREW_LETTERS.PE, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.PE }
      ]
    },
    { 
      leftSphere: sphereIds[SPHERES.TIPHARETH],
      rightSphere: sphereIds[SPHERES.NETZACH],
      relatedNumber: LURIANIC_PATHS.TIPHARETH_NETZACH,
      letters: [
        { letter: LATIN_LETTERS.S, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.S },
        { letter: LATIN_LETTERS.Ç, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.Ç },
        { letter: HEBREW_LETTERS.SAMEKH, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.SAMEKH }
      ]
    },
    { 
      leftSphere: sphereIds[SPHERES.TIPHARETH],
      rightSphere: sphereIds[SPHERES.YESOD],
      relatedNumber: LURIANIC_PATHS.TIPHARETH_YESOD,
      letters: [
        { letter: LATIN_LETTERS.R, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.R },
        { letter: HEBREW_LETTERS.RESH, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.RESH }
      ]
    },
    { 
      leftSphere: sphereIds[SPHERES.TIPHARETH],
      rightSphere: sphereIds[SPHERES.HOD],
      relatedNumber: LURIANIC_PATHS.TIPHARETH_HOD,
      letters: [
        { letter: LATIN_LETTERS.O, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.O },
        { letter: HEBREW_LETTERS.AYIN, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.AYIN }
      ]
    },
    { 
      leftSphere: sphereIds[SPHERES.NETZACH],
      rightSphere: sphereIds[SPHERES.HOD],
      relatedNumber: LURIANIC_PATHS.NETZACH_HOD,
      letters: [
        { letter: LATIN_LETTERS.M, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.M },
        { letter: HEBREW_LETTERS.MEM, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.MEM }
      ]
    },
    { 
      leftSphere: sphereIds[SPHERES.NETZACH],
      rightSphere: sphereIds[SPHERES.YESOD],
      relatedNumber: LURIANIC_PATHS.NETZACH_YESOD,
      letters: [
        { letter: LATIN_LETTERS.TS, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.TS },
        { letter: LATIN_LETTERS.TZ, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.TZ },
        { letter: HEBREW_LETTERS.TSADI, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.TSADI }
      ]
    },
    { 
      leftSphere: sphereIds[SPHERES.HOD],
      rightSphere: sphereIds[SPHERES.YESOD],
      relatedNumber: LURIANIC_PATHS.HOD_YESOD,
      letters: [
        { letter: LATIN_LETTERS.K, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.K },
        { letter: LATIN_LETTERS.Q, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.Q },
        { letter: LATIN_LETTERS.KH, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.KH },
        { letter: HEBREW_LETTERS.QOPH, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.QOPH }
      ]
    },
    { 
      leftSphere: sphereIds[SPHERES.YESOD],
      rightSphere: sphereIds[SPHERES.MALKUTH],
      relatedNumber: LURIANIC_PATHS.YESOD_MALKUTH,
      letters: [
        { letter: LATIN_LETTERS.TH, type: LetterTypes.LATIN_LETTER, data: LATIN_LETTERS_DATA.TH },
        { letter: HEBREW_LETTERS.TAV, type: LetterTypes.HEBREW_LETTER, data: HEBREW_LETTERS_DATA.TAV }
      ]
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

export function unloadLurianicKabbalah(tree: TreeOfLife) {
  const spheres = Object.values(SPHERES);
  for (let i = 0; i < spheres.length; i++) {
    tree.removeNode(id(KaabalahTypes.SPHERE, spheres[i]));
  }

  const paths = Object.values(LURIANIC_PATHS);
  for (let i = 0; i < paths.length; i++) {
    tree.removeNode(id(KaabalahTypes.PATH, paths[i]));
  }
}

export const LOADERS = {
  base: loadLurianicKabbalah,
} satisfies Record<string, Loader>

export const UNLOADERS = {
  base: unloadLurianicKabbalah,
} satisfies Record<keyof typeof LOADERS, Unloader>

export const BRIDGES: Bridge[] = []