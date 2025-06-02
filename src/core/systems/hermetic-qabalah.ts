import { FOUR_WORLDS, HEBREW_LETTERS, HEBREW_LETTERS_DATA, LATIN_LETTERS, MELKITZEDEKI_PATHS, PLANETS, SPHERES, SPHERE_DATA } from '../constants';
import { TreeOfLife } from '../tree-of-life';
import { Bridge, Loader, Unloader } from './registry';

export const SYSTEM = 'hermetic-qabalah' as const;

/**
 * Loads the Hermetic Qabalah system into the tree of life
 */
export function loadHermeticQabalah(tree: TreeOfLife) {
  const kether = tree.addSphere(SPHERES.KETHER, {
    ...SPHERE_DATA.KETHER,
    divineName: "Eheieh",
    archangelicName: "Metraton",
    angelicName: "Chayouth Ha-Qadesh",
    mundaneName: "Rashith Ha-Gilgalim"
  }, 1);
  const chokmah = tree.addSphere(SPHERES.CHOKMAH, {
    ...SPHERE_DATA.CHOKMAH,
    divineName: "Yahve El Yah",
    archangelicName: "Raziel",
    angelicName: "Auphanim",
    mundaneName: "Mazloth"
  }, 2);
  const binah = tree.addSphere(SPHERES.BINAH, {
    ...SPHERE_DATA.BINAH,
    divineName: "Yahve Elohim",
    archangelicName: "Tzaphqiel",
    angelicName: "Aralim",
    mundaneName: "Shabbathai"
  }, 3);
  tree.addSphere(SPHERES.DAATH, SPHERE_DATA.DAATH, 11);
  const chesed = tree.addSphere(SPHERES.CHESED, {
    ...SPHERE_DATA.CHESED,
    divineName: "El",
    archangelicName: "Tzadqiel",
    angelicName: "Chasmalim",
    mundaneName: "Tzedeq"
  }, 4);
  const geburah = tree.addSphere(SPHERES.GEBURAH, {
    ...SPHERE_DATA.GEBURAH,
    divineName: "Elohim Gibor",
    archangelicName: "Kamael",
    angelicName: "Seraphim",
    mundaneName: "Madim"
  }, 5);
  const tiphereth = tree.addSphere(SPHERES.TIPHERETH, {
    ...SPHERE_DATA.TIPHERETH,
    divineName: "Yahve Eloah Ve-Daath",
    archangelicName: "Raphael",
    angelicName: "Melekim",
    mundaneName: "Shemesh"
  }, 6);
  const netzach = tree.addSphere(SPHERES.NETZACH, {
    ...SPHERE_DATA.NETZACH,
    divineName: "Yahve Tzabaoth",
    archangelicName: "Haniel",
    angelicName: "Elohim",
    mundaneName: "Nogah"
  }, 7);
  const hod = tree.addSphere(SPHERES.HOD, {
    ...SPHERE_DATA.HOD,
    divineName: "Elohim Tzabaoth",
    archangelicName: "Mikael",
    angelicName: "Beni Elohim",
    mundaneName: "Kokab"
  }, 8);
  const yesod = tree.addSphere(SPHERES.YESOD, {
    ...SPHERE_DATA.YESOD,
    divineName: "Shadai El Chai",
    archangelicName: "Gabriel",
    angelicName: "Kerubim",
    mundaneName: "Levanah"
  }, 9);
  const malkuth = tree.addSphere(SPHERES.MALKUTH, {
    ...SPHERE_DATA.MALKUTH,
    divineName: "Adonai Malek",
    archangelicName: "Sandalphon",
    angelicName: "Ashim",
    mundaneName: "Olam Yesodot"
  }, 10);

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

  const path11 = tree.addPath(kether, chokmah, MELKITZEDEKI_PATHS.KETHER_CHOKMAH);
  const path12 = tree.addPath(kether, binah, MELKITZEDEKI_PATHS.KETHER_BINAH);
  const path13 = tree.addPath(kether, tiphereth, MELKITZEDEKI_PATHS.KETHER_TIPHERETH);
  const path14 = tree.addPath(chokmah, binah, MELKITZEDEKI_PATHS.CHOKMAH_BINAH);
  const path15 = tree.addPath(chokmah, tiphereth, MELKITZEDEKI_PATHS.CHOKMAH_TIPHERETH);
  const path16 = tree.addPath(chokmah, chesed, MELKITZEDEKI_PATHS.CHOKMAH_CHESED);
  const path17 = tree.addPath(binah, tiphereth, MELKITZEDEKI_PATHS.BINAH_TIPHERETH);
  const path18 = tree.addPath(binah, geburah, MELKITZEDEKI_PATHS.BINAH_GEBURAH);
  const path19 = tree.addPath(chesed, geburah, MELKITZEDEKI_PATHS.CHESED_GEBURAH);
  const path20 = tree.addPath(chesed, tiphereth, MELKITZEDEKI_PATHS.CHESED_TIPHERETH);
  const path21 = tree.addPath(chesed, netzach, MELKITZEDEKI_PATHS.CHESED_NETZACH);
  const path22 = tree.addPath(geburah, tiphereth, MELKITZEDEKI_PATHS.GEBURAH_TIPHERETH);
  const path23 = tree.addPath(geburah, hod, MELKITZEDEKI_PATHS.GEBURAH_HOD);
  const path24 = tree.addPath(tiphereth, netzach, MELKITZEDEKI_PATHS.TIPHERETH_NETZACH);
  const path25 = tree.addPath(tiphereth, yesod, MELKITZEDEKI_PATHS.TIPHERETH_YESOD);
  const path26 = tree.addPath(tiphereth, hod, MELKITZEDEKI_PATHS.TIPHERETH_HOD);
  const path27 = tree.addPath(netzach, hod, MELKITZEDEKI_PATHS.NETZACH_HOD);
  const path28 = tree.addPath(netzach, yesod, MELKITZEDEKI_PATHS.NETZACH_YESOD);
  const path29 = tree.addPath(netzach, malkuth, MELKITZEDEKI_PATHS.NETZACH_MALKUTH);
  const path30 = tree.addPath(hod, yesod, MELKITZEDEKI_PATHS.HOD_YESOD);
  const path31 = tree.addPath(hod, malkuth, MELKITZEDEKI_PATHS.HOD_MALKUTH);
  const path32 = tree.addPath(yesod, malkuth, MELKITZEDEKI_PATHS.YESOD_MALKUTH);

  tree.addLetters(path11, [
    { letter: LATIN_LETTERS.A, type: "latinLetter" },
    { letter: HEBREW_LETTERS.ALEPH, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.ALEPH }
  ]);

  tree.addLetters(path12, [
    { letter: LATIN_LETTERS.B, type: "latinLetter" },
    { letter: HEBREW_LETTERS.BETH, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.BETH }
  ]);

  tree.addLetters(path13, [
    { letter: LATIN_LETTERS.G, type: "latinLetter" },
    { letter: HEBREW_LETTERS.GIMEL, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.GIMEL }
  ]);

  tree.addLetters(path14, [
    { letter: LATIN_LETTERS.D, type: "latinLetter" },
    { letter: HEBREW_LETTERS.DALET, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.DALET }
  ]);

  tree.addLetters(path15, [
    { letter: LATIN_LETTERS.E, type: "latinLetter" },
    { letter: HEBREW_LETTERS.HE, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.HE }
  ]);

  tree.addLetters(path16, [
    { letter: LATIN_LETTERS.V, type: "latinLetter" },
    { letter: LATIN_LETTERS.U, type: "latinLetter" },
    { letter: LATIN_LETTERS.W, type: "latinLetter" },
    { letter: LATIN_LETTERS.O, type: "latinLetter" },
    { letter: HEBREW_LETTERS.VAV, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.VAV }
  ]);

  tree.addLetters(path17, [
    { letter: LATIN_LETTERS.Z, type: "latinLetter" },
    { letter: HEBREW_LETTERS.ZAYIN, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.ZAYIN }
  ]);

  tree.addLetters(path18, [
    { letter: LATIN_LETTERS.H, type: "latinLetter" },
    { letter: HEBREW_LETTERS.HET, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.HET }
  ]);

  tree.addLetters(path19, [
    { letter: LATIN_LETTERS.T, type: "latinLetter" },
    { letter: HEBREW_LETTERS.TET, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.TET }
  ]);

  tree.addLetters(path20, [
    { letter: LATIN_LETTERS.I, type: "latinLetter" },
    { letter: LATIN_LETTERS.J, type: "latinLetter" },
    { letter: LATIN_LETTERS.Y, type: "latinLetter" },
    { letter: HEBREW_LETTERS.YOD, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.YOD }
  ]);

  tree.addLetters(path21, [
    { letter: LATIN_LETTERS.C, type: "latinLetter" },
    { letter: HEBREW_LETTERS.KAF, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.KAF }
  ]);

  tree.addLetters(path22, [
    { letter: LATIN_LETTERS.L, type: "latinLetter" },
    { letter: HEBREW_LETTERS.LAMED, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.LAMED }
  ]);

  tree.addLetters(path23, [
    { letter: LATIN_LETTERS.M, type: "latinLetter" },
    { letter: HEBREW_LETTERS.MEM, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.MEM }
  ]);

  tree.addLetters(path24, [
    { letter: LATIN_LETTERS.N, type: "latinLetter" },
    { letter: HEBREW_LETTERS.NUN, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.NUN }
  ]);

  tree.addLetters(path25, [
    { letter: LATIN_LETTERS.S, type: "latinLetter" },
    { letter: LATIN_LETTERS.Ç, type: "latinLetter" },
    { letter: HEBREW_LETTERS.SAMEKH, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.SAMEKH }
  ]);

  tree.addLetters(path26, [
    { letter: LATIN_LETTERS.O, type: "latinLetter" },
    { letter: HEBREW_LETTERS.AIN, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.AIN }
  ]);

  tree.addLetters(path27, [
    { letter: LATIN_LETTERS.P, type: "latinLetter" },
    { letter: LATIN_LETTERS.F, type: "latinLetter" },
    { letter: LATIN_LETTERS.PH, type: "latinLetter" },
    { letter: HEBREW_LETTERS.PE, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.PE }
  ]);

  tree.addLetters(path28, [
    { letter: LATIN_LETTERS.TS, type: "latinLetter" },
    { letter: LATIN_LETTERS.TZ, type: "latinLetter" },
    { letter: HEBREW_LETTERS.TSADI, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.TSADI }
  ]);

  tree.addLetters(path29, [
    { letter: LATIN_LETTERS.K, type: "latinLetter" },
    { letter: LATIN_LETTERS.Q, type: "latinLetter" },
    { letter: LATIN_LETTERS.KH, type: "latinLetter" },
    { letter: HEBREW_LETTERS.QOF, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.QOF }
  ]);

  tree.addLetters(path30, [
    { letter: LATIN_LETTERS.R, type: "latinLetter" },
    { letter: HEBREW_LETTERS.RESH, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.RESH }
  ]);

  tree.addLetters(path31, [
    { letter: LATIN_LETTERS.CH, type: "latinLetter" },
    { letter: LATIN_LETTERS.SH, type: "latinLetter" },
    { letter: LATIN_LETTERS.X, type: "latinLetter" },
    { letter: HEBREW_LETTERS.SHIN, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.SHIN }
  ]);

  tree.addLetters(path32, [
    { letter: LATIN_LETTERS.TH, type: "latinLetter" },
    { letter: HEBREW_LETTERS.TAV, type: "hebrewLetter", data: HEBREW_LETTERS_DATA.TAV }
  ]);

  return tree;
}

export function unloadHermeticQabalah(tree: TreeOfLife) {
  const spheres = Object.values(SPHERES);
  for (let i = 0; i < spheres.length; i++) {
    tree.removeNode(spheres[i]);
  }

  const paths = Object.values(MELKITZEDEKI_PATHS);
  for (let i = 0; i < paths.length; i++) {
    tree.removeNode(`path:${paths[i]}`);
  }
}

export function loadColors(tree: TreeOfLife) {
  tree.addSphereColor(SPHERES.KETHER, "splendor", { 
    colorDescription: "Splendor",
    colorNames: ["transparent"],
    colorHexCodes: ["#ffffff"]
  }, FOUR_WORLDS.ATZILUTH);
  tree.addSphereColor(SPHERES.KETHER, "white-splendor", { 
    colorDescription: "White splendor, pure",
    colorNames: ["white"],
    colorHexCodes: ["#ffffff"]
  }, FOUR_WORLDS.BRIAH);
  tree.addSphereColor(SPHERES.KETHER, "white-splendor", { 
    colorDescription: "White splendor, pure",
    colorNames: ["white"],
    colorHexCodes: ["#ffffff"]
  }, FOUR_WORLDS.YETZIRAH);
  tree.addSphereColor(SPHERES.KETHER, "white-speckled-gold", { 
    colorDescription: "White speckled with gold",
    colorNames: ["white", "gold"],
    colorHexCodes: ["#ffffff", "#FFD700"]
  }, FOUR_WORLDS.ASSIAH);

  tree.addSphereColor(SPHERES.CHOKMAH, "blue", { 
    colorDescription: "Smooth blue, pure",
    colorNames: ["blue"],
    colorHexCodes: ["#0000FF"]
  }, FOUR_WORLDS.ATZILUTH);
  tree.addSphereColor(SPHERES.CHOKMAH, "grey", { 
    colorDescription: "Grey",
    colorNames: ["grey"],
    colorHexCodes: ["#808080"]
  }, FOUR_WORLDS.BRIAH);
  tree.addSphereColor(SPHERES.CHOKMAH, "grey-iridescent", { 
    colorDescription: "Pearl grey iridescent",
    colorNames: ["grey", "iridescent"],
    colorHexCodes: ["#808080", "#EDBBE7"]
  }, FOUR_WORLDS.YETZIRAH);
  tree.addSphereColor(SPHERES.CHOKMAH, "white-speckled-red-blue-yellow", { 
    colorDescription: "White speckled with red, blue and yellow",
    colorNames: ["white", "red", "blue", "yellow"],
    colorHexCodes: ["#FFFFFF", "#FF0000", "#0000FF", "#FFF50F"]
  }, FOUR_WORLDS.ASSIAH);

  tree.addSphereColor(SPHERES.BINAH, "crimson", { 
    colorDescription: "Crimson",
    colorNames: ["crimson"],
    colorHexCodes: ["#DC143C"]
  }, FOUR_WORLDS.ATZILUTH);
  tree.addSphereColor(SPHERES.BINAH, "black", { 
    colorDescription: "Black",
    colorNames: ["black"],
    colorHexCodes: ["#000000"]
  }, FOUR_WORLDS.BRIAH);
  tree.addSphereColor(SPHERES.BINAH, "dark-brown", { 
    colorDescription: "Dark brown",
    colorNames: ["dark-brown"],
    colorHexCodes: ["#422E29"]
  }, FOUR_WORLDS.YETZIRAH);
  tree.addSphereColor(SPHERES.BINAH, "grey-speckled-pink", { 
    colorDescription: "Grey speckled with pink",
    colorNames: ["grey", "pink"],
    colorHexCodes: ["#808080", "#FFC0CB"]
  }, FOUR_WORLDS.ASSIAH);

  tree.addSphereColor(SPHERES.DAATH, "lavender", { 
    colorDescription: "Lavender",
    colorNames: ["lavender"],
    colorHexCodes: ["#E6E6FA"]
  }, FOUR_WORLDS.ATZILUTH);
  tree.addSphereColor(SPHERES.DAATH, "dark-grey", { 
    colorDescription: "Dark grey",
    colorNames: ["dark-grey"],
    colorHexCodes: ["#808080"]
  }, FOUR_WORLDS.BRIAH);
  tree.addSphereColor(SPHERES.DAATH, "pure-violet", { 
    colorDescription: "Pure violet",
    colorNames: ["violet"],
    colorHexCodes: ["#8F00FF"]
  }, FOUR_WORLDS.YETZIRAH);
  tree.addSphereColor(SPHERES.DAATH, "grey-speckled-gold", { 
    colorDescription: "Grey speckled with gold",
    colorNames: ["grey", "gold"],
    colorHexCodes: ["#808080", "#FFD700"]
  }, FOUR_WORLDS.ASSIAH);

  tree.addSphereColor(SPHERES.CHESED, "intense-violet", { 
    colorDescription: "Intense violet",
    colorNames: ["intense-violet"],
    colorHexCodes: ["#9400D3"]
  }, FOUR_WORLDS.ATZILUTH);
  tree.addSphereColor(SPHERES.CHESED, "blue", { 
    colorDescription: "Blue",
    colorNames: ["blue"],
    colorHexCodes: ["#0000FF"]
  }, FOUR_WORLDS.BRIAH);
  tree.addSphereColor(SPHERES.CHESED, "intense-purple", { 
    colorDescription: "Intense purple",
    colorNames: ["intense-purple"],
    colorHexCodes: ["#800080"]
  }, FOUR_WORLDS.YETZIRAH);
  tree.addSphereColor(SPHERES.CHESED, "intense-blue-speckled-yellow", { 
    colorDescription: "Intense blue speckled with yellow",
    colorNames: ["intense-blue", "yellow"],
    colorHexCodes: ["#0000FF", "#FFF50F"]
  }, FOUR_WORLDS.ASSIAH);

  tree.addSphereColor(SPHERES.GEBURAH, "orange", { 
    colorDescription: "Orange",
    colorNames: ["orange"],
    colorHexCodes: ["#FFA800"]
  }, FOUR_WORLDS.ATZILUTH);
  tree.addSphereColor(SPHERES.GEBURAH, "scarlet-red", { 
    colorDescription: "Scarlet red",
    colorNames: ["scarlet-red"],
    colorHexCodes: ["#FF2400"]
  }, FOUR_WORLDS.BRIAH);
  tree.addSphereColor(SPHERES.GEBURAH, "bright-scarlet", { 
    colorDescription: "Bright scarlet",
    colorNames: ["bright-scarlet"],
    colorHexCodes: ["#FF2400"]
  }, FOUR_WORLDS.YETZIRAH);
  tree.addSphereColor(SPHERES.GEBURAH, "red-speckled-black", { 
    colorDescription: "Red speckled with black",
    colorNames: ["red", "black"],
    colorHexCodes: ["#FF0000", "#000000"]
  }, FOUR_WORLDS.ASSIAH);

  tree.addSphereColor(SPHERES.TIPHERETH, "gold-yellow", { 
    colorDescription: "gold yellow",
    colorNames: ["gold-yellow"],
    colorHexCodes: ["#FFD700"]
  }, FOUR_WORLDS.ATZILUTH);
  tree.addSphereColor(SPHERES.TIPHERETH, "rose-pink", { 
    colorDescription: "Rose pink",
    colorNames: ["rose-pink"],
    colorHexCodes: ["#FFC0CB"]
  }, FOUR_WORLDS.BRIAH);
  tree.addSphereColor(SPHERES.TIPHERETH, "salmon-pink-reddish-carmine-amber-brown-mixed", { 
    colorDescription: "Salmon pink, reddish carmine, amber, brown, mixed",
    colorNames: ["salmon-pink", "reddish-carmine", "amber", "brown", "mixed"],
    colorHexCodes: ["#FF9999", "#960018", "#996515"]
  }, FOUR_WORLDS.YETZIRAH);
  tree.addSphereColor(SPHERES.TIPHERETH, "gold-speckled-green", { 
    colorDescription: "Gold speckled with green",
    colorNames: ["gold", "green"],
    colorHexCodes: ["#FFD700", "#BDB76B"]
  }, FOUR_WORLDS.ASSIAH);

  tree.addSphereColor(SPHERES.NETZACH, "amber", { 
    colorDescription: "Amber",
    colorNames: ["amber"],
    colorHexCodes: ["#FFBF00"]
  }, FOUR_WORLDS.ATZILUTH);
  tree.addSphereColor(SPHERES.NETZACH, "emerald-green", { 
    colorDescription: "Emerald green",
    colorNames: ["emerald-green"],
    colorHexCodes: ["#50C878"]
  }, FOUR_WORLDS.BRIAH);
  tree.addSphereColor(SPHERES.NETZACH, "bright-yellowish-green", { 
    colorDescription: "Bright yellowish green",
    colorNames: ["bright-yellowish-green"],
    colorHexCodes: ["#98FB98"]
  }, FOUR_WORLDS.YETZIRAH);
  tree.addSphereColor(SPHERES.NETZACH, "olive-green-speckled-gold", { 
    colorDescription: "Olive green speckled with gold",
    colorNames: ["olive-green", "gold"],
    colorHexCodes: ["#BAB86C", "#FFD700"]
  }, FOUR_WORLDS.ASSIAH);

  tree.addSphereColor(SPHERES.HOD, "violet-purple", { 
    colorDescription: "Violet-purple",
    colorNames: ["violet-purple"],
    colorHexCodes: ["#9B30FF"]
  }, FOUR_WORLDS.ATZILUTH);
  tree.addSphereColor(SPHERES.HOD, "orange", { 
    colorDescription: "Orange",
    colorNames: ["orange"],
    colorHexCodes: ["#FFA800"]
  }, FOUR_WORLDS.BRIAH);
  tree.addSphereColor(SPHERES.HOD, "red-purple", { 
    colorDescription: "Red-purple",
    colorNames: ["red-purple"],
    colorHexCodes: ["#C71585"]
  }, FOUR_WORLDS.YETZIRAH);
  tree.addSphereColor(SPHERES.HOD, "yellowish-black-speckled-with-white", { 
    colorDescription: "Yellowish black speckled with white",
    colorNames: ["yellowish-black-speckled-with-white"],
    colorHexCodes: ["#2B2B1B", "#FFFFFF"]
  }, FOUR_WORLDS.ASSIAH);

  tree.addSphereColor(SPHERES.YESOD, "indigo", { 
    colorDescription: "Indigo",
    colorNames: ["indigo"],
    colorHexCodes: ["#4B0082"]
  }, FOUR_WORLDS.YETZIRAH);
  tree.addSphereColor(SPHERES.YESOD, "violet", { 
    colorDescription: "Violet",
    colorNames: ["violet"],
    colorHexCodes: ["#8F00FF"]
  }, FOUR_WORLDS.BRIAH);
  tree.addSphereColor(SPHERES.YESOD, "purple", { 
    colorDescription: "Purple",
    colorNames: ["purple"],
    colorHexCodes: ["#800080"]
  }, FOUR_WORLDS.YETZIRAH);
  tree.addSphereColor(SPHERES.YESOD, "citrine-speckled-blue", { 
    colorDescription: "Citrine speckled with blue",
    colorNames: ["citrine-speckled-blue"],
    colorHexCodes: ["#E4D00A", "#1E90FF"]
  }, FOUR_WORLDS.ASSIAH);

  tree.addSphereColor(SPHERES.MALKUTH, "yellow", { 
    colorDescription: "Yellow",
    colorNames: ["yellow"],
    colorHexCodes: ["#FFF50F"]
  }, FOUR_WORLDS.ATZILUTH);
  tree.addSphereColor(SPHERES.MALKUTH, "brown", { 
    colorDescription: "Made up of the colors of earth, which is created from the 4 elements. Brown can be used to represent it, but, usually it is represented in a pizza-like pattern, starting with Olive on top, and going clockwise with Yellow, Black and Red, all with slightly less saturation.",
    colorNames: ["brown", "olive", "yellow", "black", "red"],
    colorHexCodes: ["#422E29", "#BAB86C", "#FFF659", "#000000", "#FF5454"],
  }, FOUR_WORLDS.BRIAH);
  tree.addSphereColor(SPHERES.MALKUTH, "olive-green", { 
    colorDescription: "Olive green",
    colorNames: ["olive-green"],
    colorHexCodes: ["#BAB86C"]
  }, FOUR_WORLDS.YETZIRAH);
  tree.addSphereColor(SPHERES.MALKUTH, "black", { 
    colorDescription: "All the colors mixed, on their lowest vibration.",
    colorNames: ["black"],
    colorHexCodes: ["#000000"]
  }, FOUR_WORLDS.ASSIAH);

  return tree;
}

export function unloadColors(tree: TreeOfLife) {
  const colors = Object.values(SPHERES).flatMap((sphere) => tree.related(sphere, "color").map((color) => color.id));
  for (let i = 0; i < colors.length; i++) {
    tree.removeNode(colors[i]);
  }
}

export function loadMusicalNotes(tree: TreeOfLife) {
  tree.addMusicalNote(SPHERES.KETHER, "The Sound of the Spheres", {
    note: "The Sound of the Sphere",
    noteDescription: "The sound of the sphere"
  });
  tree.addMusicalNote(SPHERES.CHOKMAH, "Mantras", {
    note: "Mantra",
    noteDescription: "All sounds considered devotional mantras"
  });
  tree.addMusicalNote(SPHERES.BINAH, "Si", {
    note: "Si",
    noteDescription: "B (Si)"
  });
  tree.addMusicalNote(SPHERES.CHESED, "La", {
    note: "La",
    noteDescription: "A (La)"
  });
  tree.addMusicalNote(SPHERES.GEBURAH, "Do-treble", {
    note: "Do",
    noteDescription: "C (Do), in the treble clef"
  });
  tree.addMusicalNote(SPHERES.TIPHERETH, "Sol-treble", {
    note: "Sol",
    noteDescription: "G (Sol), in the treble clef"
  });
  tree.addMusicalNote(SPHERES.NETZACH, "Do", {
    note: "Do",
    noteDescription: "C (Do)"
  });
  tree.addMusicalNote(SPHERES.HOD, "Mi", {
    note: "Mi",
    noteDescription: "E (Mi)"
  });
  tree.addMusicalNote(SPHERES.YESOD, "Mi", {
    note: "Mi",
    noteDescription: "E (Mi)"
  });
  tree.addMusicalNote(SPHERES.MALKUTH, "Fa", {
    note: "Fa",
    noteDescription: "F (Fa)"
  });

  return tree;
}

export function unloadMusicalNotes(tree: TreeOfLife) {
  const notes = Object.values(SPHERES).flatMap((sphere) => tree.related(sphere, "musicalNote").map((note) => note.id));
  for (let i = 0; i < notes.length; i++) {
    tree.removeNode(notes[i]);
  }
}

const linkColorsAndSigns = (t: TreeOfLife) => {
  // TODO: implement
  return t;
}

export const loadWesternAstrology: Loader = (tree: TreeOfLife) => {
  tree.addWesternAstrologyPlanet(SPHERES.KETHER, PLANETS.NEPTUNE);
  tree.addWesternAstrologyPlanet(SPHERES.CHOKMAH, PLANETS.URANUS);
  tree.addWesternAstrologyPlanet(SPHERES.BINAH, PLANETS.SATURN);
  tree.addWesternAstrologyPlanet(SPHERES.DAATH, PLANETS.PLUTO);
  tree.addWesternAstrologyPlanet(SPHERES.CHESED, PLANETS.JUPITER);
  tree.addWesternAstrologyPlanet(SPHERES.GEBURAH, PLANETS.MARS);
  tree.addWesternAstrologyPlanet(SPHERES.TIPHERETH, PLANETS.SUN);
  tree.addWesternAstrologyPlanet(SPHERES.NETZACH, PLANETS.VENUS);
  tree.addWesternAstrologyPlanet(SPHERES.HOD, PLANETS.MERCURY);
  tree.addWesternAstrologyPlanet(SPHERES.YESOD, PLANETS.MOON);
  tree.addWesternAstrologyPlanet(SPHERES.MALKUTH, PLANETS.EARTH);

  return tree;
}

export const unloadWesternAstrology: Unloader = (tree: TreeOfLife) => {
  const planets = Object.values(SPHERES).flatMap((sphere) => tree.related(sphere, "planet").map((planet) => planet.id));
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
    run: t => linkColorsAndSigns(t) 
  },
]