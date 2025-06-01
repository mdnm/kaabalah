export type NodeId = string;

export type NodeType = "sphere" | "path" | "world" | "number" | "planet" | "zodiacSign" | "element" | "color" | "majorArcana" | "minorArcana" | "daatRoyalship" | "musicalNote" | "hebrewLetter" | "latinLetter" | "sanskritLetter" | "archeometerLetter" | "chakra" | "subtleBody" | "uncategorized";

export type NodeData<NodeType> = NodeType extends "sphere" ? SphereData : NodeType extends "path" ? PathData : NodeType extends "world" ? WorldData : NodeType extends "hebrewLetter" ? HebrewLetterData : NodeType extends "color" ? ColorData : NodeType extends "musicalNote" ? MusicalNoteData : never;

export interface Node<NodeType> {
  id: NodeId;
  type: NodeType;
  data?: NodeData<NodeType>;
}

interface HermeticQabalahSphereData {
  /**
   * In Atziluth
  */
  divineName: string;
  /**
   * In Briah
  */
  archangelicName: string;
  /**
   * In Yetzirah
  */
  angelicName: string;
  /**
   * In Assiah
  */
  mundaneName: string;
}

export type SphereData = {
  hebrewName: string;
  englishName: string;
  number: number;
} & Partial<HermeticQabalahSphereData>;

export type PathData = {
  // [counting only paths, counting paths and spheres]
  numbers: [number, number];
}

export type WorldData = {
  element: "fire" | "air" | "water" | "earth";
  hebrewName: string;
  englishName: string;
}

export type HebrewLetterData = {
  type: "mother" | "double" | "simple";
}

export type ColorData = {
  colorDescription: string;
  colorNames: string[];
  colorHexCodes: string[];
}

export type MusicalNoteData = {
  note: string;
  noteDescription: string;
}

export const FOUR_WORLDS = {
  ATZILUTH: "Atziluth",
  BRIAH: "Briah",
  YETZIRAH: "Yetzirah",
  ASSIAH: "Assiah",
} as const;

export const SPHERES = {
  KETHER: "Kether",
  CHOKMAH: "Chokmah",
  BINAH: "Binah",
  DAATH: "Daath",
  CHESED: "Chesed",
  GEBURAH: "Geburah",
  TIPHERETH: "Tiphereth",
  NETZACH: "Netzach",
  HOD: "Hod",
  YESOD: "Yesod",
  MALKUTH: "Malkuth",
} as const;

export const SPHERE_DATA: Record<keyof typeof SPHERES, NodeData<"sphere">> = {
  KETHER: { hebrewName: "כתר", englishName: "Crown", number: 1 },
  CHOKMAH: { hebrewName: "חכמה", englishName: "Wisdom", number: 2 },
  BINAH: { hebrewName: "בינה", englishName: "Understanding", number: 3 },
  CHESED: { hebrewName: "חסד", englishName: "Mercy", number: 4 },
  GEBURAH: { hebrewName: "גבורה", englishName: "Severity", number: 5 },
  TIPHERETH: { hebrewName: "תפארת", englishName: "Beauty", number: 6 },
  NETZACH: { hebrewName: "נצח", englishName: "Victory", number: 7 },
  HOD: { hebrewName: "הוד", englishName: "Splendor", number: 8 },
  YESOD: { hebrewName: "יסוד", englishName: "Foundation", number: 9 },
  MALKUTH: { hebrewName: "מלכות", englishName: "Kingdom", number: 10 },
  DAATH: { hebrewName: "דעת", englishName: "Knowledge", number: 11 },
};

export const PLANETS = {
  EARTH: "Earth",
  MOON: "Moon",
  SUN: "Sun",
  MERCURY: "Mercury",
  VENUS: "Venus",
  MARS: "Mars",
  JUPITER: "Jupiter",
  SATURN: "Saturn",
  URANUS: "Uranus",
  NEPTUNE: "Neptune",
  PLUTO: "Pluto",
} as const;

export const MELKITZEDEKI_PATHS = {
  KETHER_CHOKMAH: 1,
  KETHER_BINAH: 2,
  KETHER_TIPHERETH: 3,
  CHOKMAH_BINAH: 4,
  CHOKMAH_TIPHERETH: 5,
  CHOKMAH_CHESED: 6,
  BINAH_TIPHERETH: 7,
  BINAH_GEBURAH: 8,
  CHESED_GEBURAH: 9,
  CHESED_TIPHERETH: 10,
  CHESED_NETZACH: 11,
  GEBURAH_TIPHERETH: 12,
  GEBURAH_HOD: 13,
  TIPHERETH_NETZACH: 14,
  TIPHERETH_YESOD: 15,
  TIPHERETH_HOD: 16,
  NETZACH_HOD: 17,
  NETZACH_YESOD: 18,
  NETZACH_MALKUTH: 19,
  HOD_YESOD: 20,
  HOD_MALKUTH: 21,
  YESOD_MALKUTH: 22,
} as const;

export const LURIANIC_PATHS = {
  KETHER_CHOKMAH: 1,
  KETHER_BINAH: 2,
  KETHER_TIPHERETH: 3,
  CHOKMAH_BINAH: 4,
  CHOKMAH_GEBURAH: 5,
  CHOKMAH_TIPHERETH: 6,
  CHOKMAH_CHESED: 7,
  BINAH_CHESED: 8,
  BINAH_TIPHERETH: 9,
  BINAH_GEBURAH: 10,
  CHESED_GEBURAH: 11,
  CHESED_TIPHERETH: 12,
  CHESED_NETZACH: 13,
  GEBURAH_TIPHERETH: 14,
  GEBURAH_HOD: 15,
  TIPHERETH_NETZACH: 16,
  TIPHERETH_YESOD: 17,
  TIPHERETH_HOD: 18,
  NETZACH_HOD: 19,
  NETZACH_YESOD: 20,
  HOD_YESOD: 21,
  YESOD_MALKUTH: 22,
} as const;

export const LATIN_LETTERS = {
  A: "A",
  B: "B",
  C: "C",
  D: "D",
  E: "E",
  F: "F",
  G: "G",
  H: "H",
  I: "I",
  J: "J",
  K: "K",
  L: "L",
  M: "M",
  N: "N",
  O: "O",
  P: "P",
  Q: "Q",
  R: "R",
  S: "S",
  T: "T",
  U: "U",
  V: "V",
  W: "W",
  X: "X",
  Y: "Y",
  Z: "Z",
  TS: "Ts",
  TH: "Th",
  CH: "Ch",
} as const;

export const HEBREW_LETTERS = {
  ALEPH: "א",
  BETH: "ב",
  GIMEL: "ג",
  DALET: "ד",
  HE: "ה",
  VAV: "ו",
  ZAYIN: "ז",
  HET: "ח",
  TET: "ט",
  YOD: "י",
  KAF: "כ",
  LAMED: "ל",
  MEM: "מ",
  NUN: "נ",
  SAMEKH: "ס",
  AIN: "ע",
  PE: "פ",
  TSADI: "צ",
  QOF: "ק",
  RESH: "ר",
  SHIN: "ש",
  TAV: "ת",
} as const;