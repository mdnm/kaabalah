import { FOUR_WORLDS, HEBREW_LETTERS, HEBREW_LETTERS_DATA, LATIN_LETTERS, LURIANIC_PATHS, SPHERES, SPHERE_DATA } from '../constants';
import { TreeOfLife } from '../tree-of-life';
import { Bridge, Loader, Unloader } from './registry';

export const SYSTEM = 'lurianic-kabbalah' as const;

/**
 * Loads the Lurianic Kabbalah system into the tree of life
 */
export function loadLurianicKabbalah(tree: TreeOfLife) {
  const kether = tree.addSphere(SPHERES.KETHER, SPHERE_DATA.KETHER, 1);
  const chokmah = tree.addSphere(SPHERES.CHOKMAH, SPHERE_DATA.CHOKMAH, 2);
  const binah = tree.addSphere(SPHERES.BINAH, SPHERE_DATA.BINAH, 3);
  const chesed = tree.addSphere(SPHERES.CHESED, SPHERE_DATA.CHESED, 4);
  const geburah = tree.addSphere(SPHERES.GEBURAH, SPHERE_DATA.GEBURAH, 5);
  const tiphereth = tree.addSphere(SPHERES.TIPHERETH, SPHERE_DATA.TIPHERETH, 6);
  const netzach = tree.addSphere(SPHERES.NETZACH, SPHERE_DATA.NETZACH, 7);
  const hod = tree.addSphere(SPHERES.HOD, SPHERE_DATA.HOD, 8);
  const yesod = tree.addSphere(SPHERES.YESOD, SPHERE_DATA.YESOD, 9);
  const malkuth = tree.addSphere(SPHERES.MALKUTH, SPHERE_DATA.MALKUTH, 10);

  const worlds = Object.entries(FOUR_WORLDS);
  const worldData = {
    ATZILUTH: {
      element: "fire",
      hebrewName: "Atzilith",
      englishName: "World of Emanation",
    },
    BRIAH: {
      element: "water",
      hebrewName: "Briah",
      englishName: "World of Creation",
    },
    YETZIRAH: {
      element: "air",
      hebrewName: "Yetzirah",
      englishName: "World of Formation",
    },
    ASSIAH: {
      element: "earth",
      hebrewName: "Assiah",
      englishName: "World of Action",
    },
  } as const;
  for (const [key] of worlds) {
    tree.addWorld(
      FOUR_WORLDS[key as keyof typeof FOUR_WORLDS],
      worldData[key as keyof typeof worldData]
    );
  }

  const path11 = tree.addPath(kether, chokmah, LURIANIC_PATHS.KETHER_CHOKMAH);
  const path12 = tree.addPath(kether, binah, LURIANIC_PATHS.KETHER_BINAH);
  const path13 = tree.addPath(kether, tiphereth, LURIANIC_PATHS.KETHER_TIPHERETH);
  const path14 = tree.addPath(chokmah, binah, LURIANIC_PATHS.CHOKMAH_BINAH);
  const path15 = tree.addPath(chokmah, geburah, LURIANIC_PATHS.CHOKMAH_GEBURAH);
  const path16 = tree.addPath(chokmah, tiphereth, LURIANIC_PATHS.CHOKMAH_TIPHERETH);
  const path17 = tree.addPath(chokmah, chesed, LURIANIC_PATHS.CHOKMAH_CHESED);
  const path18 = tree.addPath(binah, chesed, LURIANIC_PATHS.BINAH_CHESED);
  const path19 = tree.addPath(binah, tiphereth, LURIANIC_PATHS.BINAH_TIPHERETH);
  const path20 = tree.addPath(binah, geburah, LURIANIC_PATHS.BINAH_GEBURAH);
  const path21 = tree.addPath(chesed, geburah, LURIANIC_PATHS.CHESED_GEBURAH);
  const path22 = tree.addPath(chesed, tiphereth, LURIANIC_PATHS.CHESED_TIPHERETH);
  const path23 = tree.addPath(chesed, netzach, LURIANIC_PATHS.CHESED_NETZACH);
  const path24 = tree.addPath(geburah, tiphereth, LURIANIC_PATHS.GEBURAH_TIPHERETH);
  const path25 = tree.addPath(geburah, hod, LURIANIC_PATHS.GEBURAH_HOD);
  const path26 = tree.addPath(tiphereth, netzach, LURIANIC_PATHS.TIPHERETH_NETZACH);
  const path27 = tree.addPath(tiphereth, yesod, LURIANIC_PATHS.TIPHERETH_YESOD);
  const path28 = tree.addPath(tiphereth, hod, LURIANIC_PATHS.TIPHERETH_HOD);
  const path29 = tree.addPath(netzach, hod, LURIANIC_PATHS.NETZACH_HOD);
  const path30 = tree.addPath(netzach, yesod, LURIANIC_PATHS.NETZACH_YESOD);
  const path31 = tree.addPath(hod, yesod, LURIANIC_PATHS.HOD_YESOD);
  const path32 = tree.addPath(yesod, malkuth, LURIANIC_PATHS.YESOD_MALKUTH);

  tree.addLetters(path11, [
    { letter: LATIN_LETTERS.E, type: "latinLetter" },
    { letter: HEBREW_LETTERS.HE, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.HE }
  ]);

  tree.addLetters(path12, [
    { letter: LATIN_LETTERS.V, type: "latinLetter" },
    { letter: LATIN_LETTERS.U, type: "latinLetter" },
    { letter: LATIN_LETTERS.W, type: "latinLetter" },
    { letter: LATIN_LETTERS.O, type: "latinLetter" },
    { letter: HEBREW_LETTERS.VAV, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.VAV }
  ]);

  tree.addLetters(path13, [
    { letter: LATIN_LETTERS.D, type: "latinLetter" },
    { letter: HEBREW_LETTERS.DALET, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.DALET }
  ]);

  tree.addLetters(path14, [
    { letter: LATIN_LETTERS.CH, type: "latinLetter" },
    { letter: LATIN_LETTERS.SH, type: "latinLetter" },
    { letter: LATIN_LETTERS.X, type: "latinLetter" },
    { letter: HEBREW_LETTERS.SHIN, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.SHIN }
  ]);

  tree.addLetters(path15, [
    { letter: LATIN_LETTERS.Z, type: "latinLetter" },
    { letter: HEBREW_LETTERS.ZAYIN, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.ZAYIN }
  ]);

  tree.addLetters(path16, [
    { letter: LATIN_LETTERS.T, type: "latinLetter" },
    { letter: HEBREW_LETTERS.TET, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.TET }
  ]);

  tree.addLetters(path17, [
    { letter: LATIN_LETTERS.B, type: "latinLetter" },
    { letter: HEBREW_LETTERS.BETH, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.BETH }
  ]);

  tree.addLetters(path18, [
    { letter: LATIN_LETTERS.H, type: "latinLetter" },
    { letter: HEBREW_LETTERS.HET, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.HET }
  ]);

  tree.addLetters(path19, [
    { letter: LATIN_LETTERS.I, type: "latinLetter" },
    { letter: LATIN_LETTERS.J, type: "latinLetter" },
    { letter: LATIN_LETTERS.Y, type: "latinLetter" },
    { letter: HEBREW_LETTERS.YOD, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.YOD }
  ]);

  tree.addLetters(path20, [
    { letter: LATIN_LETTERS.G, type: "latinLetter" },
    { letter: HEBREW_LETTERS.GIMEL, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.GIMEL }
  ]);

  tree.addLetters(path21, [
    { letter: LATIN_LETTERS.A, type: "latinLetter" },
    { letter: HEBREW_LETTERS.ALEPH, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.ALEPH }
  ]);

  tree.addLetters(path22, [
    { letter: LATIN_LETTERS.L, type: "latinLetter" },
    { letter: HEBREW_LETTERS.LAMED, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.LAMED }
  ]);

  tree.addLetters(path23, [
    { letter: LATIN_LETTERS.C, type: "latinLetter" },
    { letter: HEBREW_LETTERS.KAF, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.KAF }
  ]);

  tree.addLetters(path24, [
    { letter: LATIN_LETTERS.N, type: "latinLetter" },
    { letter: HEBREW_LETTERS.NUN, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.NUN }
  ]);

  tree.addLetters(path25, [
    { letter: LATIN_LETTERS.P, type: "latinLetter" },
    { letter: LATIN_LETTERS.F, type: "latinLetter" },
    { letter: LATIN_LETTERS.PH, type: "latinLetter" },
    { letter: HEBREW_LETTERS.PE, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.PE }
  ]);

  tree.addLetters(path26, [
    { letter: LATIN_LETTERS.S, type: "latinLetter" },
    { letter: LATIN_LETTERS.Ç, type: "latinLetter" },
    { letter: HEBREW_LETTERS.SAMEKH, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.SAMEKH }
  ]);

  tree.addLetters(path27, [
    { letter: LATIN_LETTERS.R, type: "latinLetter" },
    { letter: HEBREW_LETTERS.RESH, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.RESH }
  ]);

  tree.addLetters(path28, [
    { letter: LATIN_LETTERS.O, type: "latinLetter" },
    { letter: HEBREW_LETTERS.AIN, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.AIN }
  ]);

  tree.addLetters(path29, [
    { letter: LATIN_LETTERS.M, type: "latinLetter" },
    { letter: HEBREW_LETTERS.MEM, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.MEM }
  ]);

  tree.addLetters(path30, [
    { letter: LATIN_LETTERS.TS, type: "latinLetter" },
    { letter: LATIN_LETTERS.TZ, type: "latinLetter" },
    { letter: HEBREW_LETTERS.TSADI, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.TSADI }
  ]);

  tree.addLetters(path31, [
    { letter: LATIN_LETTERS.K, type: "latinLetter" },
    { letter: LATIN_LETTERS.Q, type: "latinLetter" },
    { letter: LATIN_LETTERS.KH, type: "latinLetter" },
    { letter: HEBREW_LETTERS.QOF, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.QOF }
  ]);

  tree.addLetters(path32, [
    { letter: LATIN_LETTERS.TH, type: "latinLetter" },
    { letter: HEBREW_LETTERS.TAV, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.TAV }
  ]);

  return tree;
} 

export function unloadLurianicKabbalah(tree: TreeOfLife) {
  const spheres = Object.values(SPHERES);
  for (let i = 0; i < spheres.length; i++) {
    tree.removeNode(spheres[i]);
  }

  const paths = Object.values(LURIANIC_PATHS);
  for (let i = 0; i < paths.length; i++) {
    tree.removeNode(`path:${paths[i]}`);
  }
}

export const LOADERS = {
  base: loadLurianicKabbalah,
} satisfies Record<string, Loader>

export const UNLOADERS = {
  base: unloadLurianicKabbalah,
} satisfies Record<keyof typeof LOADERS, Unloader>

export const BRIDGES: Bridge[] = []