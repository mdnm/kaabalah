import { FOUR_WORLDS, HEBREW_LETTERS, LATIN_LETTERS, LURIANIC_PATHS, SPHERES, SPHERE_DATA } from '../constants';
import { TreeOfLife } from '../tree-of-life';

/**
 * Loads the Lurianic Kabbalah system into the tree of life
 */
export function loadLurianicKabbalah(tree: TreeOfLife) {
  const spheres = Object.entries(SPHERE_DATA);
  for (const [key, data] of spheres) {
    if (key === SPHERES.DAATH) {
      continue;
    }

    tree.addSphere(SPHERES[key as keyof typeof SPHERES], data);
  }

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

  const path11 = tree.addPath(SPHERES.KETHER, SPHERES.CHOKMAH, LURIANIC_PATHS.KETHER_CHOKMAH);
  const path12 = tree.addPath(SPHERES.KETHER, SPHERES.BINAH, LURIANIC_PATHS.KETHER_BINAH);
  const path13 = tree.addPath(SPHERES.KETHER, SPHERES.TIPHERETH, LURIANIC_PATHS.KETHER_TIPHERETH);
  const path14 = tree.addPath(SPHERES.CHOKMAH, SPHERES.BINAH, LURIANIC_PATHS.CHOKMAH_BINAH);
  const path15 = tree.addPath(SPHERES.CHOKMAH, SPHERES.GEBURAH, LURIANIC_PATHS.CHOKMAH_GEBURAH);
  const path16 = tree.addPath(SPHERES.CHOKMAH, SPHERES.TIPHERETH, LURIANIC_PATHS.CHOKMAH_TIPHERETH);
  const path17 = tree.addPath(SPHERES.CHOKMAH, SPHERES.CHESED, LURIANIC_PATHS.CHOKMAH_CHESED);
  const path18 = tree.addPath(SPHERES.BINAH, SPHERES.CHESED, LURIANIC_PATHS.BINAH_CHESED);
  const path19 = tree.addPath(SPHERES.BINAH, SPHERES.TIPHERETH, LURIANIC_PATHS.BINAH_TIPHERETH);
  const path20 = tree.addPath(SPHERES.BINAH, SPHERES.GEBURAH, LURIANIC_PATHS.BINAH_GEBURAH);
  const path21 = tree.addPath(SPHERES.CHESED, SPHERES.GEBURAH, LURIANIC_PATHS.CHESED_GEBURAH);
  const path22 = tree.addPath(SPHERES.CHESED, SPHERES.TIPHERETH, LURIANIC_PATHS.CHESED_TIPHERETH);
  const path23 = tree.addPath(SPHERES.CHESED, SPHERES.NETZACH, LURIANIC_PATHS.CHESED_NETZACH);
  const path24 = tree.addPath(SPHERES.GEBURAH, SPHERES.TIPHERETH, LURIANIC_PATHS.GEBURAH_TIPHERETH);
  const path25 = tree.addPath(SPHERES.GEBURAH, SPHERES.HOD, LURIANIC_PATHS.GEBURAH_HOD);
  const path26 = tree.addPath(SPHERES.TIPHERETH, SPHERES.NETZACH, LURIANIC_PATHS.TIPHERETH_NETZACH);
  const path27 = tree.addPath(SPHERES.TIPHERETH, SPHERES.YESOD, LURIANIC_PATHS.TIPHERETH_YESOD);
  const path28 = tree.addPath(SPHERES.TIPHERETH, SPHERES.HOD, LURIANIC_PATHS.TIPHERETH_HOD);
  const path29 = tree.addPath(SPHERES.NETZACH, SPHERES.HOD, LURIANIC_PATHS.NETZACH_HOD);
  const path30 = tree.addPath(SPHERES.NETZACH, SPHERES.YESOD, LURIANIC_PATHS.NETZACH_YESOD);
  const path31 = tree.addPath(SPHERES.HOD, SPHERES.YESOD, LURIANIC_PATHS.HOD_YESOD);
  const path32 = tree.addPath(SPHERES.YESOD, SPHERES.MALKUTH, LURIANIC_PATHS.YESOD_MALKUTH);

  tree.correspond(path11, LATIN_LETTERS.E, "latinLetter");
  tree.correspond(path11, HEBREW_LETTERS.HE, "hebrewLetter", { type: "simple" });

  tree.correspond(path12, LATIN_LETTERS.V, "latinLetter");
  tree.correspond(path12, HEBREW_LETTERS.VAV, "hebrewLetter", { type: "simple" });

  tree.correspond(path13, LATIN_LETTERS.D, "latinLetter");
  tree.correspond(path13, HEBREW_LETTERS.DALET, "hebrewLetter", { type: "double" });

  tree.correspond(path14, LATIN_LETTERS.CH, "latinLetter");
  tree.correspond(path14, HEBREW_LETTERS.SHIN, "hebrewLetter", { type: "mother" });

  tree.correspond(path15, LATIN_LETTERS.Z, "latinLetter");
  tree.correspond(path15, HEBREW_LETTERS.ZAYIN, "hebrewLetter", { type: "simple" });

  tree.correspond(path16, LATIN_LETTERS.T, "latinLetter");
  tree.correspond(path16, HEBREW_LETTERS.TET, "hebrewLetter", { type: "simple" });

  tree.correspond(path17, LATIN_LETTERS.B, "latinLetter");
  tree.correspond(path17, HEBREW_LETTERS.BETH, "hebrewLetter", { type: "double" });

  tree.correspond(path18, LATIN_LETTERS.H, "latinLetter");
  tree.correspond(path18, HEBREW_LETTERS.HET, "hebrewLetter", { type: "simple" });

  tree.correspond(path19, LATIN_LETTERS.I, "latinLetter");
  tree.correspond(path19, LATIN_LETTERS.Y, "latinLetter");
  tree.correspond(path19, HEBREW_LETTERS.YOD, "hebrewLetter", { type: "simple" });

  tree.correspond(path20, LATIN_LETTERS.G, "latinLetter");
  tree.correspond(path20, HEBREW_LETTERS.GIMEL, "hebrewLetter", { type: "double" });

  tree.correspond(path21, LATIN_LETTERS.A, "latinLetter");
  tree.correspond(path21, HEBREW_LETTERS.ALEPH, "hebrewLetter", { type: "mother" });

  tree.correspond(path22, LATIN_LETTERS.L, "latinLetter");
  tree.correspond(path22, HEBREW_LETTERS.LAMED, "hebrewLetter", { type: "simple" });

  tree.correspond(path23, LATIN_LETTERS.C, "latinLetter");
  tree.correspond(path23, HEBREW_LETTERS.KAF, "hebrewLetter", { type: "double" });

  tree.correspond(path24, LATIN_LETTERS.N, "latinLetter");
  tree.correspond(path24, HEBREW_LETTERS.NUN, "hebrewLetter", { type: "simple" });

  tree.correspond(path25, LATIN_LETTERS.P, "latinLetter");
  tree.correspond(path25, LATIN_LETTERS.F, "latinLetter");
  tree.correspond(path25, HEBREW_LETTERS.PE, "hebrewLetter", { type: "double" });

  tree.correspond(path26, LATIN_LETTERS.S, "latinLetter");
  tree.correspond(path26, HEBREW_LETTERS.SAMEKH, "hebrewLetter", { type: "simple" });

  tree.correspond(path27, LATIN_LETTERS.R, "latinLetter");
  tree.correspond(path27, HEBREW_LETTERS.RESH, "hebrewLetter", { type: "double" });

  tree.correspond(path28, LATIN_LETTERS.O, "latinLetter");
  tree.correspond(path28, HEBREW_LETTERS.AIN, "hebrewLetter", { type: "simple" });

  tree.correspond(path29, LATIN_LETTERS.M, "latinLetter");
  tree.correspond(path29, HEBREW_LETTERS.MEM, "hebrewLetter", { type: "mother" });

  tree.correspond(path30, LATIN_LETTERS.TS, "latinLetter");
  tree.correspond(path30, HEBREW_LETTERS.TSADI, "hebrewLetter", { type: "simple" });

  tree.correspond(path31, LATIN_LETTERS.K, "latinLetter");
  tree.correspond(path31, LATIN_LETTERS.Q, "latinLetter");
  tree.correspond(path31, HEBREW_LETTERS.QOF, "hebrewLetter", { type: "simple" });

  tree.correspond(path32, LATIN_LETTERS.TH, "latinLetter");
  tree.correspond(path32, HEBREW_LETTERS.TAV, "hebrewLetter", { type: "double" });

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