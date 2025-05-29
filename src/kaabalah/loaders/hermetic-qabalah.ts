import { FOUR_WORLDS, HEBREW_LETTERS, LATIN_LETTERS, MELKITZEDEKI_PATHS, SPHERES, SPHERE_DATA } from '../constants';
import { NodeData, TreeOfLife } from '../tree-of-life';

/**
 * Loads the Hermetic Qabalah system into the tree of life
 */
export function loadHermeticQabalah(tree: TreeOfLife) {
  const spheres = Object.entries(SPHERE_DATA);
  const sphereData: Record<keyof typeof SPHERES, Partial<NodeData<"sphere">>> = {
    KETHER: {
      divineName: "Eheieh",
      archangelicName: "Metraton",
      angelicName: "Chayouth Ha-Qadesh",
      mundaneName: "Rashith Ha-Gilgalim"
    },
    CHOKMAH: {
      divineName: "Yahve El Yah",
      archangelicName: "Raziel",
      angelicName: "Auphanim",
      mundaneName: "Mazloth"
    },
    BINAH: {
      divineName: "Yahve Elohim",
      archangelicName: "Tzaphqiel",
      angelicName: "Aralim",
      mundaneName: "Shabbathai"
    },
    DAATH: {},
    CHESED: {
      divineName: "El",
      archangelicName: "Tzadqiel",
      angelicName: "Chasmalim",
      mundaneName: "Tzedeq"
    },
    GEBURAH: {
      divineName: "Elohim Gibor",
      archangelicName: "Kamael",
      angelicName: "Seraphim",
      mundaneName: "Madim"
    },
    TIPHERETH: {
      divineName: "Yahve Eloah Ve-Daath",
      archangelicName: "Raphael",
      angelicName: "Melekim",
      mundaneName: "Shemesh"
    },
    NETZACH: {
      divineName: "Yahve Tzabaoth",
      archangelicName: "Haniel",
      angelicName: "Elohim",
      mundaneName: "Nogah"
    },
    HOD: {
      divineName: "Elohim Tzabaoth",
      archangelicName: "Mikael",
      angelicName: "Beni Elohim",
      mundaneName: "Kokab"
    },
    YESOD: {
      divineName: "Shadai El Chai",
      archangelicName: "Gabriel",
      angelicName: "Kerubim",
      mundaneName: "Levanah"
    },
    MALKUTH: {
      divineName: "Adonai Malek",
      archangelicName: "Sandalphon",
      angelicName: "Ashim",
      mundaneName: "Olam Yesodot"
    },
  }
  for (const [key, data] of spheres) {
    tree.addSphere(SPHERES[key as keyof typeof SPHERES], {
      ...data,
      ...sphereData[key as keyof typeof sphereData]
    });
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

  const path11 = tree.addPath(SPHERES.KETHER, SPHERES.CHOKMAH, MELKITZEDEKI_PATHS.KETHER_CHOKMAH);
  const path12 = tree.addPath(SPHERES.KETHER, SPHERES.BINAH, MELKITZEDEKI_PATHS.KETHER_BINAH);
  const path13 = tree.addPath(SPHERES.KETHER, SPHERES.TIPHERETH, MELKITZEDEKI_PATHS.KETHER_TIPHERETH);
  const path14 = tree.addPath(SPHERES.CHOKMAH, SPHERES.BINAH, MELKITZEDEKI_PATHS.CHOKMAH_BINAH);
  const path15 = tree.addPath(SPHERES.CHOKMAH, SPHERES.TIPHERETH, MELKITZEDEKI_PATHS.CHOKMAH_TIPHERETH);
  const path16 = tree.addPath(SPHERES.CHOKMAH, SPHERES.CHESED, MELKITZEDEKI_PATHS.CHOKMAH_CHESED);
  const path17 = tree.addPath(SPHERES.BINAH, SPHERES.TIPHERETH, MELKITZEDEKI_PATHS.BINAH_TIPHERETH);
  const path18 = tree.addPath(SPHERES.BINAH, SPHERES.GEBURAH, MELKITZEDEKI_PATHS.BINAH_GEBURAH);
  const path19 = tree.addPath(SPHERES.CHESED, SPHERES.GEBURAH, MELKITZEDEKI_PATHS.CHESED_GEBURAH);
  const path20 = tree.addPath(SPHERES.CHESED, SPHERES.TIPHERETH, MELKITZEDEKI_PATHS.CHESED_TIPHERETH);
  const path21 = tree.addPath(SPHERES.CHESED, SPHERES.NETZACH, MELKITZEDEKI_PATHS.CHESED_NETZACH);
  const path22 = tree.addPath(SPHERES.GEBURAH, SPHERES.TIPHERETH, MELKITZEDEKI_PATHS.GEBURAH_TIPHERETH);
  const path23 = tree.addPath(SPHERES.GEBURAH, SPHERES.HOD, MELKITZEDEKI_PATHS.GEBURAH_HOD);
  const path24 = tree.addPath(SPHERES.TIPHERETH, SPHERES.NETZACH, MELKITZEDEKI_PATHS.TIPHERETH_NETZACH);
  const path25 = tree.addPath(SPHERES.TIPHERETH, SPHERES.YESOD, MELKITZEDEKI_PATHS.TIPHERETH_YESOD);
  const path26 = tree.addPath(SPHERES.TIPHERETH, SPHERES.HOD, MELKITZEDEKI_PATHS.TIPHERETH_HOD);
  const path27 = tree.addPath(SPHERES.NETZACH, SPHERES.HOD, MELKITZEDEKI_PATHS.NETZACH_HOD);
  const path28 = tree.addPath(SPHERES.NETZACH, SPHERES.YESOD, MELKITZEDEKI_PATHS.NETZACH_YESOD);
  const path29 = tree.addPath(SPHERES.NETZACH, SPHERES.MALKUTH, MELKITZEDEKI_PATHS.NETZACH_MALKUTH);
  const path30 = tree.addPath(SPHERES.HOD, SPHERES.YESOD, MELKITZEDEKI_PATHS.HOD_YESOD);
  const path31 = tree.addPath(SPHERES.HOD, SPHERES.MALKUTH, MELKITZEDEKI_PATHS.HOD_MALKUTH);
  const path32 = tree.addPath(SPHERES.YESOD, SPHERES.MALKUTH, MELKITZEDEKI_PATHS.YESOD_MALKUTH);

  tree.correspond(path11, LATIN_LETTERS.A, "latinLetter");
  tree.correspond(path11, HEBREW_LETTERS.ALEPH, "hebrewLetter", { type: "mother" });

  tree.correspond(path12, LATIN_LETTERS.B, "latinLetter");
  tree.correspond(path12, HEBREW_LETTERS.BETH, "hebrewLetter", { type: "double" });

  tree.correspond(path13, LATIN_LETTERS.G, "latinLetter");
  tree.correspond(path13, HEBREW_LETTERS.GIMEL, "hebrewLetter", { type: "double" });

  tree.correspond(path14, LATIN_LETTERS.D, "latinLetter");
  tree.correspond(path14, HEBREW_LETTERS.DALET, "hebrewLetter", { type: "double" });

  tree.correspond(path15, LATIN_LETTERS.E, "latinLetter");
  tree.correspond(path15, HEBREW_LETTERS.HE, "hebrewLetter", { type: "simple" });

  tree.correspond(path16, LATIN_LETTERS.V, "latinLetter");
  tree.correspond(path16, HEBREW_LETTERS.VAV, "hebrewLetter", { type: "simple" });

  tree.correspond(path17, LATIN_LETTERS.Z, "latinLetter");
  tree.correspond(path17, HEBREW_LETTERS.ZAYIN, "hebrewLetter", { type: "simple" });

  tree.correspond(path18, LATIN_LETTERS.H, "latinLetter");
  tree.correspond(path18, HEBREW_LETTERS.HET, "hebrewLetter", { type: "simple" });

  tree.correspond(path19, LATIN_LETTERS.T, "latinLetter");
  tree.correspond(path19, HEBREW_LETTERS.TET, "hebrewLetter", { type: "simple" });

  tree.correspond(path20, LATIN_LETTERS.I, "latinLetter");
  tree.correspond(path20, LATIN_LETTERS.Y, "latinLetter");
  tree.correspond(path20, HEBREW_LETTERS.YOD, "hebrewLetter", { type: "simple" });

  tree.correspond(path21, LATIN_LETTERS.C, "latinLetter");
  tree.correspond(path21, HEBREW_LETTERS.KAF, "hebrewLetter", { type: "double" });

  tree.correspond(path22, LATIN_LETTERS.L, "latinLetter");
  tree.correspond(path22, HEBREW_LETTERS.LAMED, "hebrewLetter", { type: "simple" });

  tree.correspond(path23, LATIN_LETTERS.M, "latinLetter");
  tree.correspond(path23, HEBREW_LETTERS.MEM, "hebrewLetter", { type: "mother" });

  tree.correspond(path24, LATIN_LETTERS.N, "latinLetter");
  tree.correspond(path24, HEBREW_LETTERS.NUN, "hebrewLetter", { type: "simple" });

  tree.correspond(path25, LATIN_LETTERS.S, "latinLetter");
  tree.correspond(path25, HEBREW_LETTERS.SAMEKH, "hebrewLetter", { type: "simple" });

  tree.correspond(path26, LATIN_LETTERS.O, "latinLetter");
  tree.correspond(path26, HEBREW_LETTERS.AIN, "hebrewLetter", { type: "simple" });

  tree.correspond(path27, LATIN_LETTERS.P, "latinLetter");
  tree.correspond(path27, LATIN_LETTERS.F, "latinLetter");
  tree.correspond(path27, HEBREW_LETTERS.PE, "hebrewLetter", { type: "double" });

  tree.correspond(path28, LATIN_LETTERS.TS, "latinLetter");
  tree.correspond(path28, HEBREW_LETTERS.TSADI, "hebrewLetter", { type: "simple" });

  tree.correspond(path29, LATIN_LETTERS.K, "latinLetter");
  tree.correspond(path29, LATIN_LETTERS.Q, "latinLetter");
  tree.correspond(path29, HEBREW_LETTERS.QOF, "hebrewLetter", { type: "simple" });

  tree.correspond(path30, LATIN_LETTERS.R, "latinLetter");
  tree.correspond(path30, HEBREW_LETTERS.RESH, "hebrewLetter", { type: "double" });

  tree.correspond(path31, LATIN_LETTERS.CH, "latinLetter");
  tree.correspond(path31, HEBREW_LETTERS.SHIN, "hebrewLetter", { type: "mother" });

  tree.correspond(path32, LATIN_LETTERS.TH, "latinLetter");
  tree.correspond(path32, HEBREW_LETTERS.TAV, "hebrewLetter", { type: "double" });

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
}

export function unloadColors(tree: TreeOfLife) {
  const colors = Object.values(SPHERES).flatMap((sphere) => tree.related(sphere, "color").map((color) => color.id));
  for (let i = 0; i < colors.length; i++) {
    tree.removeNode(colors[i]);
  }
}