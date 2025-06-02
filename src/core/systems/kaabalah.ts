import { FOUR_WORLDS, HEBREW_LETTERS, HEBREW_LETTERS_DATA, LATIN_LETTERS, MELKITZEDEKI_PATHS, PLANETS, SPHERES, SPHERE_DATA, TAROT_ARKANNUS, TAROT_ARKANNUS_DATA, TAROT_SUITS, WESTERN_ELEMENTS, WESTERN_ZODIAC_SIGNS, WESTERN_ZODIAC_SIGNS_DATA } from '../constants';
import { TreeOfLife } from '../tree-of-life';
import { Bridge, Loader, Unloader } from './registry';

export const SYSTEM = 'kaabalah' as const;

/**
 * Loads the Melkitzedki Order Kaabalah system into the tree of life
 */
export const loadKaabalah: Loader = (tree: TreeOfLife) => {
  const kether = tree.addSphere(SPHERES.KETHER, SPHERE_DATA.KETHER, 1);
  const chokmah = tree.addSphere(SPHERES.CHOKMAH, SPHERE_DATA.CHOKMAH, 2);
  const binah = tree.addSphere(SPHERES.BINAH, SPHERE_DATA.BINAH, 3);
  tree.addSphere(SPHERES.DAATH, SPHERE_DATA.DAATH, 11);
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

  const path11 = tree.addPath(kether, chokmah, MELKITZEDEKI_PATHS.KETHER_CHOKMAH, {
    meaning: "Crown's wisdom"
  });
  const path12 = tree.addPath(kether, binah, MELKITZEDEKI_PATHS.KETHER_BINAH, {
    meaning: "Transparency's intelligence"
  });
  const path13 = tree.addPath(kether, tiphereth, MELKITZEDEKI_PATHS.KETHER_TIPHERETH, {
    meaning: "Great Ark Tekton (architect)"
  });
  const path14 = tree.addPath(chokmah, binah, MELKITZEDEKI_PATHS.CHOKMAH_BINAH, {
    meaning: "Light's wisdom that becomes sound"
  });
  const path15 = tree.addPath(chokmah, tiphereth, MELKITZEDEKI_PATHS.CHOKMAH_TIPHERETH, {
    meaning: "Light reaching equilibrium"
  });
  const path16 = tree.addPath(chokmah, chesed, MELKITZEDEKI_PATHS.CHOKMAH_CHESED, {
    meaning: "Expansive light"
  });
  const path17 = tree.addPath(binah, tiphereth, MELKITZEDEKI_PATHS.BINAH_TIPHERETH, {
    meaning: "Vibration that balances"
  });
  const path18 = tree.addPath(binah, geburah, MELKITZEDEKI_PATHS.BINAH_GEBURAH, {
    meaning: "Vibration that becomes dual"
  });
  const path19 = tree.addPath(chesed, geburah, MELKITZEDEKI_PATHS.CHESED_GEBURAH, {
    meaning: "Expansion towards duality"
  });
  const path20 = tree.addPath(chesed, tiphereth, MELKITZEDEKI_PATHS.CHESED_TIPHERETH, {
    meaning: "Expansion of equilibrium"
  });
  const path21 = tree.addPath(chesed, netzach, MELKITZEDEKI_PATHS.CHESED_NETZACH, {
    meaning: "Expansion of victory"
  });
  const path22 = tree.addPath(geburah, tiphereth, MELKITZEDEKI_PATHS.GEBURAH_TIPHERETH, {
    meaning: "Harmonizing duality"
  });
  const path23 = tree.addPath(geburah, hod, MELKITZEDEKI_PATHS.GEBURAH_HOD, {
    meaning: "Duality from above with duality from below"
  });
  const path24 = tree.addPath(tiphereth, netzach, MELKITZEDEKI_PATHS.TIPHERETH_NETZACH, {
    meaning: "Illumination of victory"
  });
  const path25 = tree.addPath(tiphereth, yesod, MELKITZEDEKI_PATHS.TIPHERETH_YESOD, {
    meaning: "Illumination of foundations (secrets)"
  });
  const path26 = tree.addPath(tiphereth, hod, MELKITZEDEKI_PATHS.TIPHERETH_HOD, {
    meaning: "Illumination of reasons"
  });
  const path27 = tree.addPath(netzach, hod, MELKITZEDEKI_PATHS.NETZACH_HOD, {
    meaning: "Reason of emotions"
  });
  const path28 = tree.addPath(netzach, yesod, MELKITZEDEKI_PATHS.NETZACH_YESOD, {
    meaning: "Victory of inner emptiness"
  });
  const path29 = tree.addPath(netzach, malkuth, MELKITZEDEKI_PATHS.NETZACH_MALKUTH, {
    meaning: "Victory over matter"
  });
  const path30 = tree.addPath(hod, yesod, MELKITZEDEKI_PATHS.HOD_YESOD, {
    meaning: "Reason of foundations"
  });
  const path31 = tree.addPath(hod, malkuth, MELKITZEDEKI_PATHS.HOD_MALKUTH, {
    meaning: "Reason conquering the world"
  });
  const path32 = tree.addPath(yesod, malkuth, MELKITZEDEKI_PATHS.YESOD_MALKUTH, {
    meaning: "Filling the inner emptiness of the world"
  });

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
    { letter: LATIN_LETTERS.Ã, type: "latinLetter" },
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
    { letter: LATIN_LETTERS.Y, type: "latinLetter" },
    { letter: LATIN_LETTERS.J, type: "latinLetter" },
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

  tree.addSphereColor(SPHERES.MALKUTH, "malkuth", { 
    colorDescription: "Made up of the colors of earth, which is created from the 4 elements. Brown can be used to represent it, but, usually it is represented in a pizza-like pattern, starting with Yellow on top, and going clockwise with Green, Brown and Red, all with slightly less saturation.",
    colorNames: ["unsaturated yellow", "unsaturated green", "unsaturated brown", "unsaturated red"],
    colorHexCodes: ["#FFF659", "#70FF6E", "#422E29", "#FF5454"],
  });

  const path11 = `path:${MELKITZEDEKI_PATHS.KETHER_CHOKMAH}`;
  const path12 = `path:${MELKITZEDEKI_PATHS.KETHER_BINAH}`;
  const path13 = `path:${MELKITZEDEKI_PATHS.KETHER_TIPHERETH}`;
  const path14 = `path:${MELKITZEDEKI_PATHS.CHOKMAH_BINAH}`;
  const path15 = `path:${MELKITZEDEKI_PATHS.CHOKMAH_TIPHERETH}`;
  const path16 = `path:${MELKITZEDEKI_PATHS.CHOKMAH_CHESED}`;
  const path17 = `path:${MELKITZEDEKI_PATHS.BINAH_TIPHERETH}`;
  const path18 = `path:${MELKITZEDEKI_PATHS.BINAH_GEBURAH}`;
  const path19 = `path:${MELKITZEDEKI_PATHS.CHESED_GEBURAH}`;
  const path20 = `path:${MELKITZEDEKI_PATHS.CHESED_TIPHERETH}`;
  const path21 = `path:${MELKITZEDEKI_PATHS.CHESED_NETZACH}`;
  const path22 = `path:${MELKITZEDEKI_PATHS.GEBURAH_TIPHERETH}`;
  const path23 = `path:${MELKITZEDEKI_PATHS.GEBURAH_HOD}`;
  const path24 = `path:${MELKITZEDEKI_PATHS.TIPHERETH_NETZACH}`;
  const path25 = `path:${MELKITZEDEKI_PATHS.TIPHERETH_YESOD}`;
  const path26 = `path:${MELKITZEDEKI_PATHS.TIPHERETH_HOD}`;
  const path27 = `path:${MELKITZEDEKI_PATHS.NETZACH_HOD}`;
  const path28 = `path:${MELKITZEDEKI_PATHS.NETZACH_YESOD}`;
  const path29 = `path:${MELKITZEDEKI_PATHS.NETZACH_MALKUTH}`;
  const path30 = `path:${MELKITZEDEKI_PATHS.HOD_YESOD}`;
  const path31 = `path:${MELKITZEDEKI_PATHS.HOD_MALKUTH}`;
  const path32 = `path:${MELKITZEDEKI_PATHS.YESOD_MALKUTH}`;

  tree.addPathColor(path11, "gold", {
    colorDescription: "Gold",
    colorNames: ["gold"],
    colorHexCodes: ["#FFD700"]
  });

  tree.addPathColor(path12, "yellow", {
    colorDescription: "Yellow",
    colorNames: ["yellow"],
    colorHexCodes: ["#FFF50F"]
  });

  tree.addPathColor(path13, "grey", {
    colorDescription: "Grey",
    colorNames: ["grey"],
    colorHexCodes: ["#808080"]
  });

  tree.addPathColor(path14, "greenish-blue", {
    colorDescription: "Greenish blue",
    colorNames: ["greenish blue"],
    colorHexCodes: ["#5F9EA0"]
  });

  tree.addPathColor(path15, "red", {
    colorDescription: "Red",
    colorNames: ["red"],
    colorHexCodes: ["#FF0000"]
  });

  tree.addPathColor(path16, "Orange-red", {
    colorDescription: "Orange-red",
    colorNames: ["Orange-red"],
    colorHexCodes: ["#FF4500"]
  });

  tree.addPathColor(path17, "orange", {
    colorDescription: "Orange",
    colorNames: ["orange"],
    colorHexCodes: ["#FFA800"]
  });

  tree.addPathColor(path18, "amber", {
    colorDescription: "Amber",
    colorNames: ["amber"],
    colorHexCodes: ["#FF7F00"]
  });

  tree.addPathColor(path19, "greenish-yellow", {
    colorDescription: "Greenish yellow",
    colorNames: ["greenish yellow"],
    colorHexCodes: ["#D4FB19"]
  });

  tree.addPathColor(path20, "white", {
    colorDescription: "White",
    colorNames: ["white"],
    colorHexCodes: ["#FFFFFF"]
  });

  tree.addPathColor(path21, "blue", {
    colorDescription: "Blue",
    colorNames: ["blue"],
    colorHexCodes: ["#0000FF"]
  });

  tree.addPathColor(path22, "emerald-green", {
    colorDescription: "Emerald green",
    colorNames: ["emerald green"],
    colorHexCodes: ["#50C878"]
  });

  tree.addPathColor(path23, "light-blue", {
    colorDescription: "Light blue",
    colorNames: ["light blue"],
    colorHexCodes: ["#ADD8E6"]
  });

  tree.addPathColor(path24, "blueish-green", {
    colorDescription: "Greenish blue",
    colorNames: ["greenish blue"],
    colorHexCodes: ["#00ECA3"]
  });

  tree.addPathColor(path25, "blue", {
    colorDescription: "Blue",
    colorNames: ["blue"],
    colorHexCodes: ["#0000FF"]
  });

  tree.addPathColor(path26, "indigo", {
    colorDescription: "Indigo",
    colorNames: ["indigo"],
    colorHexCodes: ["#4B0082"]
  });

  tree.addPathColor(path27, "red", {
    colorDescription: "Red",
    colorNames: ["red"],
    colorHexCodes: ["#FF0000"]
  });

  tree.addPathColor(path28, "violet", {
    colorDescription: "Violet",
    colorNames: ["violet"],
    colorHexCodes: ["#8A2BE2"]
  });

  tree.addPathColor(path29, "crimson", {
    colorDescription: "Crimson",
    colorNames: ["crimson"],
    colorHexCodes: ["#DC143C"]
  });

  tree.addPathColor(path30, "orange", {
    colorDescription: "Orange",
    colorNames: ["orange"],
    colorHexCodes: ["#FFA800"]
  });

  tree.addPathColor(path31, "red", {
    colorDescription: "Red",
    colorNames: ["red"],
    colorHexCodes: ["#FF0000"]
  });

  tree.addPathColor(path32, "dark-grey", {
    colorDescription: "Dark grey",
    colorNames: ["dark grey"],
    colorHexCodes: ["#A9A9A9"]
  });

  return tree;
}

export const unloadColors: Unloader = (tree: TreeOfLife) => {
  const colors = Object.values(SPHERES).flatMap((sphere) => tree.related(sphere, "color").map((color) => color.id));
  for (let i = 0; i < colors.length; i++) {
    tree.removeNode(colors[i]);
  }

  const letters = Object.values(HEBREW_LETTERS).flatMap((letter) => tree.related(letter, "color").map((color) => color.id));
  for (let i = 0; i < letters.length; i++) {
    tree.removeNode(letters[i]);
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

  const path11 = `path:${MELKITZEDEKI_PATHS.KETHER_CHOKMAH}`;
  const path12 = `path:${MELKITZEDEKI_PATHS.KETHER_BINAH}`;
  const path13 = `path:${MELKITZEDEKI_PATHS.KETHER_TIPHERETH}`;
  const path14 = `path:${MELKITZEDEKI_PATHS.CHOKMAH_BINAH}`;
  const path15 = `path:${MELKITZEDEKI_PATHS.CHOKMAH_TIPHERETH}`;
  const path16 = `path:${MELKITZEDEKI_PATHS.CHOKMAH_CHESED}`;
  const path17 = `path:${MELKITZEDEKI_PATHS.BINAH_TIPHERETH}`;
  const path18 = `path:${MELKITZEDEKI_PATHS.BINAH_GEBURAH}`;
  const path19 = `path:${MELKITZEDEKI_PATHS.CHESED_GEBURAH}`;
  const path20 = `path:${MELKITZEDEKI_PATHS.CHESED_TIPHERETH}`;
  const path21 = `path:${MELKITZEDEKI_PATHS.CHESED_NETZACH}`;
  const path22 = `path:${MELKITZEDEKI_PATHS.GEBURAH_TIPHERETH}`;
  const path23 = `path:${MELKITZEDEKI_PATHS.GEBURAH_HOD}`;
  const path24 = `path:${MELKITZEDEKI_PATHS.TIPHERETH_NETZACH}`;
  const path25 = `path:${MELKITZEDEKI_PATHS.TIPHERETH_YESOD}`;
  const path26 = `path:${MELKITZEDEKI_PATHS.TIPHERETH_HOD}`;
  const path27 = `path:${MELKITZEDEKI_PATHS.NETZACH_HOD}`;
  const path28 = `path:${MELKITZEDEKI_PATHS.NETZACH_YESOD}`;
  const path29 = `path:${MELKITZEDEKI_PATHS.NETZACH_MALKUTH}`;
  const path30 = `path:${MELKITZEDEKI_PATHS.HOD_YESOD}`;
  const path31 = `path:${MELKITZEDEKI_PATHS.HOD_MALKUTH}`;
  const path32 = `path:${MELKITZEDEKI_PATHS.YESOD_MALKUTH}`;

  tree.addWesternElement(path11, WESTERN_ELEMENTS.AIR);
  tree.addWesternAstrologyPlanet(path12, PLANETS.MOON);
  tree.addWesternAstrologyPlanet(path13, PLANETS.VENUS);
  tree.addWesternAstrologyPlanet(path14, PLANETS.JUPITER);
  tree.addWesternAstrologySign(path15, WESTERN_ZODIAC_SIGNS.ARIES, WESTERN_ZODIAC_SIGNS_DATA.ARIES, 1);
  tree.addWesternAstrologySign(path16, WESTERN_ZODIAC_SIGNS.TAURUS, WESTERN_ZODIAC_SIGNS_DATA.TAURUS, 2);
  tree.addWesternAstrologySign(path17, WESTERN_ZODIAC_SIGNS.GEMINI, WESTERN_ZODIAC_SIGNS_DATA.GEMINI, 3);
  tree.addWesternAstrologySign(path18, WESTERN_ZODIAC_SIGNS.CANCER, WESTERN_ZODIAC_SIGNS_DATA.CANCER, 4);
  tree.addWesternAstrologySign(path19, WESTERN_ZODIAC_SIGNS.LEO, WESTERN_ZODIAC_SIGNS_DATA.LEO, 5);
  tree.addWesternAstrologySign(path20, WESTERN_ZODIAC_SIGNS.VIRGO, WESTERN_ZODIAC_SIGNS_DATA.VIRGO, 6);
  tree.addWesternAstrologyPlanet(path21, PLANETS.MARS);
  tree.addWesternAstrologySign(path22, WESTERN_ZODIAC_SIGNS.LIBRA, WESTERN_ZODIAC_SIGNS_DATA.LIBRA, 7);
  tree.addWesternElement(path23, WESTERN_ELEMENTS.WATER);
  tree.addWesternAstrologySign(path24, WESTERN_ZODIAC_SIGNS.SCORPIO, WESTERN_ZODIAC_SIGNS_DATA.SCORPIO, 8);
  tree.addWesternAstrologySign(path25, WESTERN_ZODIAC_SIGNS.SAGITTARIUS, WESTERN_ZODIAC_SIGNS_DATA.SAGITTARIUS, 9);
  tree.addWesternAstrologySign(path26, WESTERN_ZODIAC_SIGNS.CAPRICORN, WESTERN_ZODIAC_SIGNS_DATA.CAPRICORN, 10);
  tree.addWesternAstrologyPlanet(path27, PLANETS.MERCURY);
  tree.addWesternAstrologySign(path28, WESTERN_ZODIAC_SIGNS.AQUARIUS, WESTERN_ZODIAC_SIGNS_DATA.AQUARIUS, 11);
  tree.addWesternAstrologySign(path29, WESTERN_ZODIAC_SIGNS.PISCES, WESTERN_ZODIAC_SIGNS_DATA.PISCES, 12);
  tree.addWesternAstrologyPlanet(path30, PLANETS.SATURN);
  tree.addWesternElement(path31, WESTERN_ELEMENTS.FIRE);
  tree.addWesternAstrologyPlanet(path32, PLANETS.SUN);

  return tree;
}

export const unloadWesternAstrology: Unloader = (tree: TreeOfLife) => {
  const planets = Object.values(SPHERES).flatMap((planet) => tree.related(planet, "planet").map((planet) => planet.id));
  for (let i = 0; i < planets.length; i++) {
    tree.removeNode(planets[i]);
  }

  const elements = Object.values(MELKITZEDEKI_PATHS).flatMap((path) => tree.related(`path:${path}`, "westernElement").map((element) => element.id));
  for (let i = 0; i < elements.length; i++) {
    tree.removeNode(elements[i]);
  }

  const zodiacSigns = Object.values(MELKITZEDEKI_PATHS).flatMap((path) => tree.related(`path:${path}`, "westernZodiacSign").map((sign) => sign.id));
  for (let i = 0; i < zodiacSigns.length; i++) {
    tree.removeNode(zodiacSigns[i]);
  }
}

export const loadTarot: Loader = (tree: TreeOfLife) => {
  const path11 = `path:${MELKITZEDEKI_PATHS.KETHER_CHOKMAH}`;
  const path12 = `path:${MELKITZEDEKI_PATHS.KETHER_BINAH}`;
  const path13 = `path:${MELKITZEDEKI_PATHS.KETHER_TIPHERETH}`;
  const path14 = `path:${MELKITZEDEKI_PATHS.CHOKMAH_BINAH}`;
  const path15 = `path:${MELKITZEDEKI_PATHS.CHOKMAH_TIPHERETH}`;
  const path16 = `path:${MELKITZEDEKI_PATHS.CHOKMAH_CHESED}`;
  const path17 = `path:${MELKITZEDEKI_PATHS.BINAH_TIPHERETH}`;
  const path18 = `path:${MELKITZEDEKI_PATHS.BINAH_GEBURAH}`;
  const path19 = `path:${MELKITZEDEKI_PATHS.CHESED_GEBURAH}`;
  const path20 = `path:${MELKITZEDEKI_PATHS.CHESED_TIPHERETH}`;
  const path21 = `path:${MELKITZEDEKI_PATHS.CHESED_NETZACH}`;
  const path22 = `path:${MELKITZEDEKI_PATHS.GEBURAH_TIPHERETH}`;
  const path23 = `path:${MELKITZEDEKI_PATHS.GEBURAH_HOD}`;
  const path24 = `path:${MELKITZEDEKI_PATHS.TIPHERETH_NETZACH}`;
  const path25 = `path:${MELKITZEDEKI_PATHS.TIPHERETH_YESOD}`;
  const path26 = `path:${MELKITZEDEKI_PATHS.TIPHERETH_HOD}`;
  const path27 = `path:${MELKITZEDEKI_PATHS.NETZACH_HOD}`;
  const path28 = `path:${MELKITZEDEKI_PATHS.NETZACH_YESOD}`;
  const path29 = `path:${MELKITZEDEKI_PATHS.NETZACH_MALKUTH}`;
  const path30 = `path:${MELKITZEDEKI_PATHS.HOD_YESOD}`;
  const path31 = `path:${MELKITZEDEKI_PATHS.HOD_MALKUTH}`;
  const path32 = `path:${MELKITZEDEKI_PATHS.YESOD_MALKUTH}`;

  tree.addTarotArkAnnu(path11, TAROT_ARKANNUS.THE_MAGICIAN, TAROT_ARKANNUS_DATA.THE_MAGICIAN, 1);
  tree.addTarotArkAnnu(path12, TAROT_ARKANNUS.THE_HIGH_PRIESTESS, TAROT_ARKANNUS_DATA.THE_HIGH_PRIESTESS, 2);
  tree.addTarotArkAnnu(path13, TAROT_ARKANNUS.THE_EMPRESS, TAROT_ARKANNUS_DATA.THE_EMPRESS, 3);
  tree.addTarotArkAnnu(path14, TAROT_ARKANNUS.THE_EMPEROR, TAROT_ARKANNUS_DATA.THE_EMPEROR, 4);
  tree.addTarotArkAnnu(path15, TAROT_ARKANNUS.THE_HIEROPHANT, TAROT_ARKANNUS_DATA.THE_HIEROPHANT, 5);
  tree.addTarotArkAnnu(path16, TAROT_ARKANNUS.THE_LOVER, TAROT_ARKANNUS_DATA.THE_LOVER, 6);
  tree.addTarotArkAnnu(path17, TAROT_ARKANNUS.THE_CHARIOT, TAROT_ARKANNUS_DATA.THE_CHARIOT, 7);
  tree.addTarotArkAnnu(path18, TAROT_ARKANNUS.JUSTICE, TAROT_ARKANNUS_DATA.JUSTICE, 8);
  tree.addTarotArkAnnu(path19, TAROT_ARKANNUS.THE_HERMIT, TAROT_ARKANNUS_DATA.THE_HERMIT, 9);
  tree.addTarotArkAnnu(path20, TAROT_ARKANNUS.THE_WHEEL_OF_FORTUNE, TAROT_ARKANNUS_DATA.THE_WHEEL_OF_FORTUNE, 10);
  tree.addTarotArkAnnu(path21, TAROT_ARKANNUS.STRENGTH, TAROT_ARKANNUS_DATA.STRENGTH, 11);
  tree.addTarotArkAnnu(path22, TAROT_ARKANNUS.THE_HANGED_MAN, TAROT_ARKANNUS_DATA.THE_HANGED_MAN, 12);
  tree.addTarotArkAnnu(path23, TAROT_ARKANNUS.DEATH, TAROT_ARKANNUS_DATA.DEATH, 13);
  tree.addTarotArkAnnu(path24, TAROT_ARKANNUS.TEMPERANCE, TAROT_ARKANNUS_DATA.TEMPERANCE, 14);
  tree.addTarotArkAnnu(path25, TAROT_ARKANNUS.THE_DEVIL, TAROT_ARKANNUS_DATA.THE_DEVIL, 15);
  tree.addTarotArkAnnu(path26, TAROT_ARKANNUS.THE_TOWER, TAROT_ARKANNUS_DATA.THE_TOWER, 16);
  tree.addTarotArkAnnu(path27, TAROT_ARKANNUS.THE_STAR, TAROT_ARKANNUS_DATA.THE_STAR, 17);
  tree.addTarotArkAnnu(path28, TAROT_ARKANNUS.THE_MOON, TAROT_ARKANNUS_DATA.THE_MOON, 18);
  tree.addTarotArkAnnu(path29, TAROT_ARKANNUS.THE_SUN, TAROT_ARKANNUS_DATA.THE_SUN, 19);
  tree.addTarotArkAnnu(path30, TAROT_ARKANNUS.JUDGMENT, TAROT_ARKANNUS_DATA.JUDGMENT, 20);
  tree.addTarotArkAnnu(path31, TAROT_ARKANNUS.THE_FOOL, TAROT_ARKANNUS_DATA.THE_FOOL, 21);
  tree.addTarotArkAnnu(path32, TAROT_ARKANNUS.THE_WORLD, TAROT_ARKANNUS_DATA.THE_WORLD, 22);

  tree.addTarotSuit(TAROT_SUITS.WANDS, WESTERN_ELEMENTS.FIRE);
  tree.addTarotSuit(TAROT_SUITS.CUPS, WESTERN_ELEMENTS.WATER);
  tree.addTarotSuit(TAROT_SUITS.SWORDS, WESTERN_ELEMENTS.AIR);
  tree.addTarotSuit(TAROT_SUITS.PENTACLES, WESTERN_ELEMENTS.EARTH);

  tree.addTarotArkAnnu(SPHERES.DAATH, TAROT_ARKANNUS.KING_OF_WANDS, TAROT_ARKANNUS_DATA.KING_OF_WANDS, 23, TAROT_SUITS.WANDS);
  tree.addTarotArkAnnu(SPHERES.DAATH, TAROT_ARKANNUS.QUEEN_OF_WANDS, TAROT_ARKANNUS_DATA.QUEEN_OF_WANDS, 24, TAROT_SUITS.WANDS);
  tree.addTarotArkAnnu(SPHERES.DAATH, TAROT_ARKANNUS.KNIGHT_OF_WANDS, TAROT_ARKANNUS_DATA.KNIGHT_OF_WANDS, 25, TAROT_SUITS.WANDS);
  tree.addTarotArkAnnu(SPHERES.DAATH, TAROT_ARKANNUS.PAGE_OF_WANDS, TAROT_ARKANNUS_DATA.PAGE_OF_WANDS, 26, TAROT_SUITS.WANDS);
  tree.addTarotArkAnnu(SPHERES.KETHER, TAROT_ARKANNUS.ACE_OF_WANDS, TAROT_ARKANNUS_DATA.ACE_OF_WANDS, 27, TAROT_SUITS.WANDS);
  tree.addTarotArkAnnu(SPHERES.CHOKMAH, TAROT_ARKANNUS.TWO_OF_WANDS, TAROT_ARKANNUS_DATA.TWO_OF_WANDS, 28, TAROT_SUITS.WANDS);
  tree.addTarotArkAnnu(SPHERES.BINAH, TAROT_ARKANNUS.THREE_OF_WANDS, TAROT_ARKANNUS_DATA.THREE_OF_WANDS, 29, TAROT_SUITS.WANDS);
  tree.addTarotArkAnnu(SPHERES.CHESED, TAROT_ARKANNUS.FOUR_OF_WANDS, TAROT_ARKANNUS_DATA.FOUR_OF_WANDS, 30, TAROT_SUITS.WANDS);
  tree.addTarotArkAnnu(SPHERES.GEBURAH, TAROT_ARKANNUS.FIVE_OF_WANDS, TAROT_ARKANNUS_DATA.FIVE_OF_WANDS, 31, TAROT_SUITS.WANDS);
  tree.addTarotArkAnnu(SPHERES.TIPHERETH, TAROT_ARKANNUS.SIX_OF_WANDS, TAROT_ARKANNUS_DATA.SIX_OF_WANDS, 32, TAROT_SUITS.WANDS);
  tree.addTarotArkAnnu(SPHERES.NETZACH, TAROT_ARKANNUS.SEVEN_OF_WANDS, TAROT_ARKANNUS_DATA.SEVEN_OF_WANDS, 33, TAROT_SUITS.WANDS);
  tree.addTarotArkAnnu(SPHERES.HOD, TAROT_ARKANNUS.EIGHT_OF_WANDS, TAROT_ARKANNUS_DATA.EIGHT_OF_WANDS, 34, TAROT_SUITS.WANDS);
  tree.addTarotArkAnnu(SPHERES.YESOD, TAROT_ARKANNUS.NINE_OF_WANDS, TAROT_ARKANNUS_DATA.NINE_OF_WANDS, 35, TAROT_SUITS.WANDS);
  tree.addTarotArkAnnu(SPHERES.MALKUTH, TAROT_ARKANNUS.TEN_OF_WANDS, TAROT_ARKANNUS_DATA.TEN_OF_WANDS, 36, TAROT_SUITS.WANDS);

  tree.addTarotArkAnnu(SPHERES.DAATH, TAROT_ARKANNUS.KING_OF_CUPS, TAROT_ARKANNUS_DATA.KING_OF_CUPS, 37, TAROT_SUITS.CUPS);
  tree.addTarotArkAnnu(SPHERES.DAATH, TAROT_ARKANNUS.QUEEN_OF_CUPS, TAROT_ARKANNUS_DATA.QUEEN_OF_CUPS, 38, TAROT_SUITS.CUPS);
  tree.addTarotArkAnnu(SPHERES.DAATH, TAROT_ARKANNUS.KNIGHT_OF_CUPS, TAROT_ARKANNUS_DATA.KNIGHT_OF_CUPS, 39, TAROT_SUITS.CUPS);
  tree.addTarotArkAnnu(SPHERES.DAATH, TAROT_ARKANNUS.PAGE_OF_CUPS, TAROT_ARKANNUS_DATA.PAGE_OF_CUPS, 40, TAROT_SUITS.CUPS);
  tree.addTarotArkAnnu(SPHERES.KETHER, TAROT_ARKANNUS.ACE_OF_CUPS, TAROT_ARKANNUS_DATA.ACE_OF_CUPS, 41, TAROT_SUITS.CUPS);
  tree.addTarotArkAnnu(SPHERES.CHOKMAH, TAROT_ARKANNUS.TWO_OF_CUPS, TAROT_ARKANNUS_DATA.TWO_OF_CUPS, 42, TAROT_SUITS.CUPS);
  tree.addTarotArkAnnu(SPHERES.BINAH, TAROT_ARKANNUS.THREE_OF_CUPS, TAROT_ARKANNUS_DATA.THREE_OF_CUPS, 43, TAROT_SUITS.CUPS);
  tree.addTarotArkAnnu(SPHERES.CHESED, TAROT_ARKANNUS.FOUR_OF_CUPS, TAROT_ARKANNUS_DATA.FOUR_OF_CUPS, 44, TAROT_SUITS.CUPS);
  tree.addTarotArkAnnu(SPHERES.GEBURAH, TAROT_ARKANNUS.FIVE_OF_CUPS, TAROT_ARKANNUS_DATA.FIVE_OF_CUPS, 45, TAROT_SUITS.CUPS);
  tree.addTarotArkAnnu(SPHERES.TIPHERETH, TAROT_ARKANNUS.SIX_OF_CUPS, TAROT_ARKANNUS_DATA.SIX_OF_CUPS, 46, TAROT_SUITS.CUPS);
  tree.addTarotArkAnnu(SPHERES.NETZACH, TAROT_ARKANNUS.SEVEN_OF_CUPS, TAROT_ARKANNUS_DATA.SEVEN_OF_CUPS, 47, TAROT_SUITS.CUPS);
  tree.addTarotArkAnnu(SPHERES.HOD, TAROT_ARKANNUS.EIGHT_OF_CUPS, TAROT_ARKANNUS_DATA.EIGHT_OF_CUPS, 48, TAROT_SUITS.CUPS);
  tree.addTarotArkAnnu(SPHERES.YESOD, TAROT_ARKANNUS.NINE_OF_CUPS, TAROT_ARKANNUS_DATA.NINE_OF_CUPS, 49, TAROT_SUITS.CUPS);
  tree.addTarotArkAnnu(SPHERES.MALKUTH, TAROT_ARKANNUS.TEN_OF_CUPS, TAROT_ARKANNUS_DATA.TEN_OF_CUPS, 50, TAROT_SUITS.CUPS);

  tree.addTarotArkAnnu(SPHERES.DAATH, TAROT_ARKANNUS.KING_OF_SWORDS, TAROT_ARKANNUS_DATA.KING_OF_SWORDS, 51, TAROT_SUITS.SWORDS);
  tree.addTarotArkAnnu(SPHERES.DAATH, TAROT_ARKANNUS.QUEEN_OF_SWORDS, TAROT_ARKANNUS_DATA.QUEEN_OF_SWORDS, 52, TAROT_SUITS.SWORDS);
  tree.addTarotArkAnnu(SPHERES.DAATH, TAROT_ARKANNUS.KNIGHT_OF_SWORDS, TAROT_ARKANNUS_DATA.KNIGHT_OF_SWORDS, 53, TAROT_SUITS.SWORDS);
  tree.addTarotArkAnnu(SPHERES.DAATH, TAROT_ARKANNUS.PAGE_OF_SWORDS, TAROT_ARKANNUS_DATA.PAGE_OF_SWORDS, 54, TAROT_SUITS.SWORDS);
  tree.addTarotArkAnnu(SPHERES.KETHER, TAROT_ARKANNUS.ACE_OF_SWORDS, TAROT_ARKANNUS_DATA.ACE_OF_SWORDS, 55, TAROT_SUITS.SWORDS);
  tree.addTarotArkAnnu(SPHERES.CHOKMAH, TAROT_ARKANNUS.TWO_OF_SWORDS, TAROT_ARKANNUS_DATA.TWO_OF_SWORDS, 56, TAROT_SUITS.SWORDS);
  tree.addTarotArkAnnu(SPHERES.BINAH, TAROT_ARKANNUS.THREE_OF_SWORDS, TAROT_ARKANNUS_DATA.THREE_OF_SWORDS, 57, TAROT_SUITS.SWORDS);
  tree.addTarotArkAnnu(SPHERES.CHESED, TAROT_ARKANNUS.FOUR_OF_SWORDS, TAROT_ARKANNUS_DATA.FOUR_OF_SWORDS, 58, TAROT_SUITS.SWORDS);
  tree.addTarotArkAnnu(SPHERES.GEBURAH, TAROT_ARKANNUS.FIVE_OF_SWORDS, TAROT_ARKANNUS_DATA.FIVE_OF_SWORDS, 59, TAROT_SUITS.SWORDS);
  tree.addTarotArkAnnu(SPHERES.TIPHERETH, TAROT_ARKANNUS.SIX_OF_SWORDS, TAROT_ARKANNUS_DATA.SIX_OF_SWORDS, 60, TAROT_SUITS.SWORDS);
  tree.addTarotArkAnnu(SPHERES.NETZACH, TAROT_ARKANNUS.SEVEN_OF_SWORDS, TAROT_ARKANNUS_DATA.SEVEN_OF_SWORDS, 61, TAROT_SUITS.SWORDS);
  tree.addTarotArkAnnu(SPHERES.HOD, TAROT_ARKANNUS.EIGHT_OF_SWORDS, TAROT_ARKANNUS_DATA.EIGHT_OF_SWORDS, 62, TAROT_SUITS.SWORDS);
  tree.addTarotArkAnnu(SPHERES.YESOD, TAROT_ARKANNUS.NINE_OF_SWORDS, TAROT_ARKANNUS_DATA.NINE_OF_SWORDS, 63, TAROT_SUITS.SWORDS);
  tree.addTarotArkAnnu(SPHERES.MALKUTH, TAROT_ARKANNUS.TEN_OF_SWORDS, TAROT_ARKANNUS_DATA.TEN_OF_SWORDS, 64, TAROT_SUITS.SWORDS);

  tree.addTarotArkAnnu(SPHERES.DAATH, TAROT_ARKANNUS.KING_OF_PENTACLES, TAROT_ARKANNUS_DATA.KING_OF_PENTACLES, 65, TAROT_SUITS.PENTACLES);
  tree.addTarotArkAnnu(SPHERES.DAATH, TAROT_ARKANNUS.QUEEN_OF_PENTACLES, TAROT_ARKANNUS_DATA.QUEEN_OF_PENTACLES, 66, TAROT_SUITS.PENTACLES);
  tree.addTarotArkAnnu(SPHERES.DAATH, TAROT_ARKANNUS.KNIGHT_OF_PENTACLES, TAROT_ARKANNUS_DATA.KNIGHT_OF_PENTACLES, 67, TAROT_SUITS.PENTACLES);
  tree.addTarotArkAnnu(SPHERES.DAATH, TAROT_ARKANNUS.PAGE_OF_PENTACLES, TAROT_ARKANNUS_DATA.PAGE_OF_PENTACLES, 68, TAROT_SUITS.PENTACLES);
  tree.addTarotArkAnnu(SPHERES.KETHER, TAROT_ARKANNUS.ACE_OF_PENTACLES, TAROT_ARKANNUS_DATA.ACE_OF_PENTACLES, 69, TAROT_SUITS.PENTACLES);
  tree.addTarotArkAnnu(SPHERES.CHOKMAH, TAROT_ARKANNUS.TWO_OF_PENTACLES, TAROT_ARKANNUS_DATA.TWO_OF_PENTACLES, 70, TAROT_SUITS.PENTACLES);
  tree.addTarotArkAnnu(SPHERES.BINAH, TAROT_ARKANNUS.THREE_OF_PENTACLES, TAROT_ARKANNUS_DATA.THREE_OF_PENTACLES, 71, TAROT_SUITS.PENTACLES);
  tree.addTarotArkAnnu(SPHERES.CHESED, TAROT_ARKANNUS.FOUR_OF_PENTACLES, TAROT_ARKANNUS_DATA.FOUR_OF_PENTACLES, 72, TAROT_SUITS.PENTACLES);
  tree.addTarotArkAnnu(SPHERES.GEBURAH, TAROT_ARKANNUS.FIVE_OF_PENTACLES, TAROT_ARKANNUS_DATA.FIVE_OF_PENTACLES, 73, TAROT_SUITS.PENTACLES);
  tree.addTarotArkAnnu(SPHERES.TIPHERETH, TAROT_ARKANNUS.SIX_OF_PENTACLES, TAROT_ARKANNUS_DATA.SIX_OF_PENTACLES, 74, TAROT_SUITS.PENTACLES);
  tree.addTarotArkAnnu(SPHERES.NETZACH, TAROT_ARKANNUS.SEVEN_OF_PENTACLES, TAROT_ARKANNUS_DATA.SEVEN_OF_PENTACLES, 75, TAROT_SUITS.PENTACLES);
  tree.addTarotArkAnnu(SPHERES.HOD, TAROT_ARKANNUS.EIGHT_OF_PENTACLES, TAROT_ARKANNUS_DATA.EIGHT_OF_PENTACLES, 76, TAROT_SUITS.PENTACLES);
  tree.addTarotArkAnnu(SPHERES.YESOD, TAROT_ARKANNUS.NINE_OF_PENTACLES, TAROT_ARKANNUS_DATA.NINE_OF_PENTACLES, 77, TAROT_SUITS.PENTACLES);
  tree.addTarotArkAnnu(SPHERES.MALKUTH, TAROT_ARKANNUS.TEN_OF_PENTACLES, TAROT_ARKANNUS_DATA.TEN_OF_PENTACLES, 78, TAROT_SUITS.PENTACLES);

  return tree;
}

export const unloadTarot: Unloader = (tree: TreeOfLife) => {
  const suits = Object.values(WESTERN_ELEMENTS).flatMap((element) => tree.related(`westernElement:${element}`, "tarotSuit").map((suit) => suit.id));
  for (let i = 0; i < suits.length; i++) {
    tree.removeNode(suits[i]);
  }

  const majorArkAnnus = Object.values(MELKITZEDEKI_PATHS).flatMap((path) => tree.related(`path:${path}`, "tarotArkAnnu").map((arkannus) => arkannus.id));
  for (let i = 0; i < majorArkAnnus.length; i++) {
    tree.removeNode(majorArkAnnus[i]);
  }

  const minorArkAnnus = Object.values(SPHERES).flatMap((sphere) => tree.related(sphere, "tarotArkAnnu").map((arkannus) => arkannus.id));
  for (let i = 0; i < minorArkAnnus.length; i++) {
    tree.removeNode(minorArkAnnus[i]);
  }

  return tree;
}

export const LOADERS = {
  base: loadKaabalah,
  colors: loadColors,
  music: loadMusicalNotes,
  westernAstrology: loadWesternAstrology,
  tarot: loadTarot,
} satisfies Record<string, Loader>

export const UNLOADERS = {
  base: unloadKaabalah,
  colors: unloadColors,
  music: unloadMusicalNotes,
  westernAstrology: unloadWesternAstrology,
  tarot: unloadTarot,
} satisfies Record<keyof typeof LOADERS, Unloader>


export const BRIDGES: Bridge[] = [
  {
    id: 'kaabalah-color-music',
    needs: ['colors', 'music'],
    run: t => linkColorsAndSigns(t) 
  },
]