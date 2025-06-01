import { FOUR_WORLDS, HEBREW_LETTERS, LATIN_LETTERS, MELKITZEDEKI_PATHS, PLANETS, SPHERES, SPHERE_DATA } from '../constants';
import { Bridge, Loader, TreeOfLife, Unloader } from '../tree-of-life';

export const SYSTEM = 'kaabalah' as const;

/**
 * Loads the Melkitzedki Order Kaabalah system into the tree of life
 */
export const loadKaabalah: Loader = (tree: TreeOfLife) => {
  const kether = tree.addSphere(SPHERES.KETHER, SPHERE_DATA.KETHER);
  const chokmah = tree.addSphere(SPHERES.CHOKMAH, SPHERE_DATA.CHOKMAH);
  const binah = tree.addSphere(SPHERES.BINAH, SPHERE_DATA.BINAH);
  const daath = tree.addSphere(SPHERES.DAATH, SPHERE_DATA.DAATH);
  const chesed = tree.addSphere(SPHERES.CHESED, SPHERE_DATA.CHESED);
  const geburah = tree.addSphere(SPHERES.GEBURAH, SPHERE_DATA.GEBURAH);
  const tiphereth = tree.addSphere(SPHERES.TIPHERETH, SPHERE_DATA.TIPHERETH);
  const netzach = tree.addSphere(SPHERES.NETZACH, SPHERE_DATA.NETZACH);
  const hod = tree.addSphere(SPHERES.HOD, SPHERE_DATA.HOD);
  const yesod = tree.addSphere(SPHERES.YESOD, SPHERE_DATA.YESOD);
  const malkuth = tree.addSphere(SPHERES.MALKUTH, SPHERE_DATA.MALKUTH);

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
    { letter: HEBREW_LETTERS.ALEPH, type: "hebrewLetter", data: { type: "mother" } }
  ]);

  tree.addLetters(path12, [
    { letter: LATIN_LETTERS.B, type: "latinLetter" },
    { letter: HEBREW_LETTERS.BETH, type: "hebrewLetter", data: { type: "double" } }
  ]);

  tree.addLetters(path13, [
    { letter: LATIN_LETTERS.G, type: "latinLetter" },
    { letter: HEBREW_LETTERS.GIMEL, type: "hebrewLetter", data: { type: "double" } }
  ]);

  tree.addLetters(path14, [
    { letter: LATIN_LETTERS.D, type: "latinLetter" },
    { letter: HEBREW_LETTERS.DALET, type: "hebrewLetter", data: { type: "double" } }
  ]);

  tree.addLetters(path15, [
    { letter: LATIN_LETTERS.E, type: "latinLetter" },
    { letter: HEBREW_LETTERS.HE, type: "hebrewLetter", data: { type: "simple" } }
  ]);

  tree.addLetters(path16, [
    { letter: LATIN_LETTERS.V, type: "latinLetter" },
    { letter: HEBREW_LETTERS.VAV, type: "hebrewLetter", data: { type: "simple" } }
  ]);

  tree.addLetters(path17, [
    { letter: LATIN_LETTERS.Z, type: "latinLetter" },
    { letter: HEBREW_LETTERS.ZAYIN, type: "hebrewLetter", data: { type: "simple" } }
  ]);

  tree.addLetters(path18, [
    { letter: LATIN_LETTERS.H, type: "latinLetter" },
    { letter: HEBREW_LETTERS.HET, type: "hebrewLetter", data: { type: "simple" } }
  ]);

  tree.addLetters(path19, [
    { letter: LATIN_LETTERS.T, type: "latinLetter" },
    { letter: HEBREW_LETTERS.TET, type: "hebrewLetter", data: { type: "simple" } }
  ]);

  tree.addLetters(path20, [
    { letter: LATIN_LETTERS.I, type: "latinLetter" },
    { letter: LATIN_LETTERS.Y, type: "latinLetter" },
    { letter: HEBREW_LETTERS.YOD, type: "hebrewLetter", data: { type: "simple" } }
  ]);

  tree.addLetters(path21, [
    { letter: LATIN_LETTERS.C, type: "latinLetter" },
    { letter: HEBREW_LETTERS.KAF, type: "hebrewLetter", data: { type: "double" } }
  ]);

  tree.addLetters(path22, [
    { letter: LATIN_LETTERS.L, type: "latinLetter" },
    { letter: HEBREW_LETTERS.LAMED, type: "hebrewLetter", data: { type: "simple" } }
  ]);

  tree.addLetters(path23, [
    { letter: LATIN_LETTERS.M, type: "latinLetter" },
    { letter: HEBREW_LETTERS.MEM, type: "hebrewLetter", data: { type: "mother" } }
  ]);

  tree.addLetters(path24, [
    { letter: LATIN_LETTERS.N, type: "latinLetter" },
    { letter: HEBREW_LETTERS.NUN, type: "hebrewLetter", data: { type: "simple" } }
  ]);

  tree.addLetters(path25, [
    { letter: LATIN_LETTERS.S, type: "latinLetter" },
    { letter: HEBREW_LETTERS.SAMEKH, type: "hebrewLetter", data: { type: "simple" } }
  ]);

  tree.addLetters(path26, [
    { letter: LATIN_LETTERS.O, type: "latinLetter" },
    { letter: HEBREW_LETTERS.AIN, type: "hebrewLetter", data: { type: "simple" } }
  ]);

  tree.addLetters(path27, [
    { letter: LATIN_LETTERS.P, type: "latinLetter" },
    { letter: LATIN_LETTERS.F, type: "latinLetter" },
    { letter: HEBREW_LETTERS.PE, type: "hebrewLetter", data: { type: "double" } }
  ]);

  tree.addLetters(path28, [
    { letter: LATIN_LETTERS.TS, type: "latinLetter" },
    { letter: HEBREW_LETTERS.TSADI, type: "hebrewLetter", data: { type: "simple" } }
  ]);

  tree.addLetters(path29, [
    { letter: LATIN_LETTERS.K, type: "latinLetter" },
    { letter: LATIN_LETTERS.Q, type: "latinLetter" },
    { letter: HEBREW_LETTERS.QOF, type: "hebrewLetter", data: { type: "simple" } }
  ]);

  tree.addLetters(path30, [
    { letter: LATIN_LETTERS.R, type: "latinLetter" },
    { letter: HEBREW_LETTERS.RESH, type: "hebrewLetter", data: { type: "double" } }
  ]);

  tree.addLetters(path31, [
    { letter: LATIN_LETTERS.CH, type: "latinLetter" },
    { letter: HEBREW_LETTERS.SHIN, type: "hebrewLetter", data: { type: "mother" } }
  ]);

  tree.addLetters(path32, [
    { letter: LATIN_LETTERS.TH, type: "latinLetter" },
    { letter: HEBREW_LETTERS.TAV, type: "hebrewLetter", data: { type: "double" } }
  ]);

  return tree;
}

export const unloadKaabalah: Unloader = (tree: TreeOfLife) => {
  const spheres = Object.values(SPHERES);
  for (let i = 0; i < spheres.length; i++) {
    tree.removeNode(spheres[i]);
  }

  const paths = Object.values(MELKITZEDEKI_PATHS);
  for (let i = 0; i < paths.length; i++) {
    tree.removeNode(`path:${paths[i]}`);
  }
}

export const loadColors: Loader = (tree: TreeOfLife) => {
  tree.addSphereColor(SPHERES.KETHER, "crystal", { 
    colorDescription: "Transparent, clear, crystal-like. All the colors mixed, on their purest, most saint form",
    colorNames: ["transparent"],
    colorHexCodes: ["#cccccc"]
  });

  tree.addSphereColor(SPHERES.CHOKMAH, "iridescent", { 
    colorDescription: "All the colors, in a iridescent manner. Can also be represented by all the other sphere colors in a pizza-like pattern, starting with Tiphereth on top, and going clockwise following the spheres on the right and left columns.",
    colorNames: ["iridescent", "yellow", "blue", "green", "purple", "orange", "red"],
    colorHexCodes: ["#EDBBE7", "#FFF50F", "#0000FF", "#14FF00", "#8F00FF", "#FFA800", "#FF0000"],
  });

  tree.addSphereColor(SPHERES.BINAH, "black", { 
    colorDescription: "All the colors mixed, on their lowest vibration.",
    colorNames: ["black"],
    colorHexCodes: ["#000000"]
  });

  tree.addSphereColor(SPHERES.DAATH, "white", { 
    colorDescription: "All the colors mixed, on their highest vibration. Can also be represented by an yin-yang pattern.",
    colorNames: ["white"],
    colorHexCodes: ["#FFFFFF"]
  });

  tree.addSphereColor(SPHERES.CHESED, "blue", { 
    colorDescription: "Blue",
    colorNames: ["blue"],
    colorHexCodes: ["#0000FF"]
  });

  tree.addSphereColor(SPHERES.GEBURAH, "red", { 
    colorDescription: "Red",
    colorNames: ["red"],
    colorHexCodes: ["#FF0000"]
  });

  tree.addSphereColor(SPHERES.TIPHERETH, "yellow", { 
    colorDescription: "Yellow",
    colorNames: ["yellow"],
    colorHexCodes: ["#FFF50F"]
  });

  tree.addSphereColor(SPHERES.NETZACH, "green", { 
    colorDescription: "Green",
    colorNames: ["green"],
    colorHexCodes: ["#14FF00"]
  });

  tree.addSphereColor(SPHERES.HOD, "orange", { 
    colorDescription: "Orange",
    colorNames: ["orange"],
    colorHexCodes: ["#FFA800"]
  });

  tree.addSphereColor(SPHERES.YESOD, "purple", { 
    colorDescription: "Purple",
    colorNames: ["purple"],
    colorHexCodes: ["#8F00FF"]
  });

  tree.addSphereColor(SPHERES.MALKUTH, "brown", { 
    colorDescription: "Made up of the colors of earth, which is created from the 4 elements. Brown can be used to represent it, but, usually it is represented in a pizza-like pattern, starting with Yellow on top, and going clockwise with Green, Brown and Red, all with slightly less saturation.",
    colorNames: ["yellow", "green", "brown", "red"],
    colorHexCodes: ["#FFF659", "#70FF6E", "#422E29", "#FF5454"],
  });

  return tree;
}

export const unloadColors: Unloader = (tree: TreeOfLife) => {
  const colors = Object.values(SPHERES).flatMap((sphere) => tree.related(sphere, "color").map((color) => color.id));
  for (let i = 0; i < colors.length; i++) {
    tree.removeNode(colors[i]);
  }
}

export const loadMusicalNotes: Loader = (tree: TreeOfLife) => {
  tree.addMusicalNote(SPHERES.KETHER, "Do", {
    note: "Do",
    noteDescription: "C (Do)"
  });
  tree.addMusicalNote(SPHERES.CHOKMAH, "Re", {
    note: "Re",
    noteDescription: "D (Re)"
  });
  tree.addMusicalNote(SPHERES.BINAH, "Mi", {
    note: "Mi",
    noteDescription: "E (Mi)"
  });
  tree.addMusicalNote(SPHERES.DAATH, "1st interval", {
    note: "Interval",
    noteDescription: "An interval"
  });
  tree.addMusicalNote(SPHERES.CHESED, "Fa", {
    note: "Fa",
    noteDescription: "F (Fa)"
  });
  tree.addMusicalNote(SPHERES.GEBURAH, "Sol", {
    note: "Sol",
    noteDescription: "G (Sol)"
  });
  tree.addMusicalNote(SPHERES.TIPHERETH, "The Thing-in-itself", {
    note: "The Thing-in-itself",
    noteDescription: "The central point of equilibrium; another interval"
  });
  tree.addMusicalNote(SPHERES.NETZACH, "La", {
    note: "La",
    noteDescription: "A (La)"
  });
  tree.addMusicalNote(SPHERES.HOD, "Si", {
    note: "Si",
    noteDescription: "B (Si)"
  });
  tree.addMusicalNote(SPHERES.YESOD, "2nd interval", {
    note: "Interval",
    noteDescription: "An interval"
  });
  tree.addMusicalNote(SPHERES.MALKUTH, "Do", {
    note: "Do",
    noteDescription: "C (Do)"
  });

  return tree;
}

export const unloadMusicalNotes: Unloader = (tree: TreeOfLife) => {
  const notes = Object.values(SPHERES).flatMap((sphere) => tree.related(sphere, "musicalNote").map((note) => note.id));
  for (let i = 0; i < notes.length; i++) {
    tree.removeNode(notes[i]);
  }
}

const linkColorsAndSigns = (t: TreeOfLife) => {
  // TODO: implement
  return t;
}

export const loadAstrology: Loader = (tree: TreeOfLife) => {
  tree.correspond(SPHERES.KETHER, PLANETS.NEPTUNE, "planet");
  tree.correspond(SPHERES.CHOKMAH, PLANETS.URANUS, "planet");
  tree.correspond(SPHERES.BINAH, PLANETS.SATURN, "planet");
  tree.correspond(SPHERES.DAATH, PLANETS.PLUTO, "planet");
  tree.correspond(SPHERES.CHESED, PLANETS.JUPITER, "planet");
  tree.correspond(SPHERES.GEBURAH, PLANETS.MARS, "planet");
  tree.correspond(SPHERES.TIPHERETH, PLANETS.SUN, "planet");
  tree.correspond(SPHERES.NETZACH, PLANETS.VENUS, "planet");
  tree.correspond(SPHERES.HOD, PLANETS.MERCURY, "planet");
  tree.correspond(SPHERES.YESOD, PLANETS.MOON, "planet");
  tree.correspond(SPHERES.MALKUTH, PLANETS.EARTH, "planet");

  return tree;
}

export const unloadAstrology: Unloader = (tree: TreeOfLife) => {
  const planets = Object.values(PLANETS).flatMap((planet) => tree.related(planet, "planet").map((planet) => planet.id));
  for (let i = 0; i < planets.length; i++) {
    tree.removeNode(planets[i]);
  }
}

export const LOADERS = {
  base: loadKaabalah,
  colors: loadColors,
  music: loadMusicalNotes,
  astrology: loadAstrology,
} satisfies Record<string, Loader>

export const UNLOADERS = {
  base: unloadKaabalah,
  colors: unloadColors,
  music: unloadMusicalNotes,
  astrology: unloadAstrology,
} satisfies Record<keyof typeof LOADERS, Unloader>


export const BRIDGES: Bridge[] = [
  {
    id: 'kaabalah-color-music',
    needs: ['colors', 'music'],
    run: t => linkColorsAndSigns(t) 
  },
]