import { KaabalahTypes, LetterTypes, NodeData, NodeId, TarotTypes, WesternAstrologyTypes } from "./types";


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
  hebrewSpelling: string;
  englishName: string;
  // TODO: add magical images
  magicalImage?: string;
} & Partial<HermeticQabalahSphereData>;

export type PathData = {
  meaning?: string;
  from: NodeId<KaabalahTypes.SPHERE>;
  to: NodeId<KaabalahTypes.SPHERE>;
};

export type WorldData = {
  englishName: string;
};

export type HebrewLetterData = {
  type: "mother" | "double" | "simple";
  gematriaValue: number;
  gematriaValueWhenEnding?: number;
  symbol: string;
  hieroglyph: string;
  yvritMeaning: string;
  character: string;
  characterWhenEnding?: string;
};

export type LatinLetterData = {
  isVowel: boolean;
};

export type ColorData = {
  colorDescription: string;
  colorNames: string[];
  colorHexCodes: string[];
};

export type MusicalNoteData = {
  note: string;
  noteDescription: string;
  // 9 octaves
  frequencies?: [string, string, string, string, string, string, string, string, string];
};

export type WesternZodiacSignData = {
  element: Exclude<
    (typeof WESTERN_ELEMENTS)[keyof typeof WESTERN_ELEMENTS],
    "Ether"
  >;
  type: "cardinal" | "fixed" | "mutable";
  rulingPlanets: Array<
    Exclude<(typeof PLANETS)[keyof typeof PLANETS], "Earth">
  >;
};

export type TarotArkAnnuData = {
  type: "major" | "minor" | "court";
  suit?: (typeof TAROT_SUITS)[keyof typeof TAROT_SUITS];
  descriptiveData?: Partial<Record<keyof typeof TAROT_DECKS, {
    name?: string;
    meaning?: string;
    reversedMeaning?: string;
    keywords?: string[];
  }>>;
};

export const FOUR_WORLDS = {
  ATZILUTH: "Atziluth",
  BRIAH: "Briah",
  YETZIRAH: "Yetzirah",
  ASSIAH: "Assiah",
} as const;

export const FOUR_WORLDS_DATA: Record<keyof typeof FOUR_WORLDS, NodeData<KaabalahTypes.WORLD>> = {
  ATZILUTH: { englishName: "World of Emanation" },
  BRIAH: { englishName: "World of Creation" },
  YETZIRAH: { englishName: "World of Formation" },
  ASSIAH: { englishName: "World of Action" },
} as const;

export const SPHERES = {
  KETHER: "Kether",
  CHOKHMAH: "Chokhmah",
  BINAH: "Binah",
  DAATH: "Daath",
  CHESED: "Chesed",
  GEBURAH: "Geburah",
  TIPHARETH: "Tiphareth",
  NETZACH: "Netzach",
  HOD: "Hod",
  YESOD: "Yesod",
  MALKUTH: "Malkuth",
} as const;

export const SPHERES_DATA: Record<keyof typeof SPHERES, NodeData<KaabalahTypes.SPHERE>> = {
  KETHER: { hebrewSpelling: "כתר", englishName: "Crown" },
  CHOKHMAH: { hebrewSpelling: "חכמה", englishName: "Wisdom" },
  BINAH: { hebrewSpelling: "בינה", englishName: "Understanding" },
  CHESED: { hebrewSpelling: "חסד", englishName: "Mercy" },
  GEBURAH: { hebrewSpelling: "גבורה", englishName: "Severity" },
  TIPHARETH: { hebrewSpelling: "תפארת", englishName: "Beauty" },
  NETZACH: { hebrewSpelling: "נצח", englishName: "Victory" },
  HOD: { hebrewSpelling: "הוד", englishName: "Splendor" },
  YESOD: { hebrewSpelling: "יסוד", englishName: "Foundation" },
  MALKUTH: { hebrewSpelling: "מלכות", englishName: "Kingdom" },
  DAATH: { hebrewSpelling: "דעת", englishName: "Knowledge" },
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

export const WESTERN_ZODIAC_SIGNS = {
  ARIES: "Aries",
  TAURUS: "Taurus",
  GEMINI: "Gemini",
  CANCER: "Cancer",
  LEO: "Leo",
  VIRGO: "Virgo",
  LIBRA: "Libra",
  SCORPIO: "Scorpio",
  SAGITTARIUS: "Sagittarius",
  CAPRICORN: "Capricorn",
  AQUARIUS: "Aquarius",
  PISCES: "Pisces",
} as const;

export const WESTERN_ELEMENTS = {
  FIRE: "Fire",
  AIR: "Air",
  WATER: "Water",
  EARTH: "Earth",
  ETHER: "Ether",
} as const;

export const WESTERN_ZODIAC_SIGNS_DATA: Record<
  keyof typeof WESTERN_ZODIAC_SIGNS,
  NodeData<WesternAstrologyTypes.WESTERN_ZODIAC_SIGN>
> = {
  ARIES: {
    element: WESTERN_ELEMENTS.FIRE,
    type: "cardinal",
    rulingPlanets: [PLANETS.MARS],
  },
  TAURUS: {
    element: WESTERN_ELEMENTS.EARTH,
    type: "fixed",
    rulingPlanets: [PLANETS.VENUS],
  },
  GEMINI: {
    element: WESTERN_ELEMENTS.AIR,
    type: "mutable",
    rulingPlanets: [PLANETS.MERCURY],
  },
  CANCER: {
    element: WESTERN_ELEMENTS.WATER,
    type: "cardinal",
    rulingPlanets: [PLANETS.MOON],
  },
  LEO: {
    element: WESTERN_ELEMENTS.FIRE,
    type: "fixed",
    rulingPlanets: [PLANETS.SUN],
  },
  VIRGO: {
    element: WESTERN_ELEMENTS.EARTH,
    type: "mutable",
    rulingPlanets: [PLANETS.MERCURY],
  },
  LIBRA: {
    element: WESTERN_ELEMENTS.AIR,
    type: "cardinal",
    rulingPlanets: [PLANETS.VENUS],
  },
  SCORPIO: {
    element: WESTERN_ELEMENTS.WATER,
    type: "fixed",
    rulingPlanets: [PLANETS.MARS, PLANETS.PLUTO],
  },
  SAGITTARIUS: {
    element: WESTERN_ELEMENTS.FIRE,
    type: "mutable",
    rulingPlanets: [PLANETS.JUPITER],
  },
  CAPRICORN: {
    element: WESTERN_ELEMENTS.EARTH,
    type: "cardinal",
    rulingPlanets: [PLANETS.SATURN],
  },
  AQUARIUS: {
    element: WESTERN_ELEMENTS.AIR,
    type: "fixed",
    rulingPlanets: [PLANETS.SATURN, PLANETS.URANUS],
  },
  PISCES: {
    element: WESTERN_ELEMENTS.WATER,
    type: "mutable",
    rulingPlanets: [PLANETS.JUPITER, PLANETS.NEPTUNE],
  },
} as const;

export const MELKITZEDEKI_PATHS = {
  KETHER_CHOKHMAH: 1,
  KETHER_BINAH: 2,
  KETHER_TIPHARETH: 3,
  CHOKHMAH_BINAH: 4,
  CHOKHMAH_TIPHARETH: 5,
  CHOKHMAH_CHESED: 6,
  BINAH_TIPHARETH: 7,
  BINAH_GEBURAH: 8,
  CHESED_GEBURAH: 9,
  CHESED_TIPHARETH: 10,
  CHESED_NETZACH: 11,
  GEBURAH_TIPHARETH: 12,
  GEBURAH_HOD: 13,
  TIPHARETH_NETZACH: 14,
  TIPHARETH_YESOD: 15,
  TIPHARETH_HOD: 16,
  NETZACH_HOD: 17,
  NETZACH_YESOD: 18,
  NETZACH_MALKUTH: 19,
  HOD_YESOD: 20,
  HOD_MALKUTH: 21,
  YESOD_MALKUTH: 22,
} as const;

export const LURIANIC_PATHS = {
  KETHER_CHOKHMAH: 1,
  KETHER_BINAH: 2,
  KETHER_TIPHARETH: 3,
  CHOKHMAH_BINAH: 4,
  CHOKHMAH_GEBURAH: 5,
  CHOKHMAH_TIPHARETH: 6,
  CHOKHMAH_CHESED: 7,
  BINAH_CHESED: 8,
  BINAH_TIPHARETH: 9,
  BINAH_GEBURAH: 10,
  CHESED_GEBURAH: 11,
  CHESED_TIPHARETH: 12,
  CHESED_NETZACH: 13,
  GEBURAH_TIPHARETH: 14,
  GEBURAH_HOD: 15,
  TIPHARETH_NETZACH: 16,
  TIPHARETH_YESOD: 17,
  TIPHARETH_HOD: 18,
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
  PH: "Ph",
  TS: "Ts",
  TZ: "Tz",
  TH: "Th",
  CH: "Ch",
  SH: "Sh",
  KH: "Kh",
  Ç: "Ç",
  Ã: "Ã",
} as const;

export const LATIN_LETTERS_DATA: Record<
  keyof typeof LATIN_LETTERS,
  NodeData<LetterTypes.LATIN_LETTER>
> = {
  A: { isVowel: true },
  B: { isVowel: false },
  C: { isVowel: false },
  D: { isVowel: false },
  E: { isVowel: true },
  F: { isVowel: false },
  G: { isVowel: false },
  H: { isVowel: false },
  I: { isVowel: true },
  J: { isVowel: false },
  K: { isVowel: false },
  L: { isVowel: false },
  M: { isVowel: false },
  N: { isVowel: false },
  O: { isVowel: true },
  P: { isVowel: false },
  Q: { isVowel: false },
  R: { isVowel: false },
  S: { isVowel: false },
  T: { isVowel: false },
  U: { isVowel: true },
  V: { isVowel: false },
  W: { isVowel: true },
  X: { isVowel: false },
  Y: { isVowel: true },
  Z: { isVowel: false },
  PH: { isVowel: false },
  TS: { isVowel: false },
  TZ: { isVowel: false },
  TH: { isVowel: false },
  CH: { isVowel: false },
  SH: { isVowel: false },
  KH: { isVowel: false },
  Ç: { isVowel: false },
  Ã: { isVowel: true },
};

export const HEBREW_LETTERS = {
  ALEPH: "Aleph",
  BETH: "Beth",
  GIMEL: "Gimel",
  DALET: "Dalet",
  HE: "He",
  VAV: "Vav",
  ZAYIN: "Zayin",
  HET: "Het",
  TET: "Tet",
  YOD: "Yod",
  KAPH: "Kaph",
  LAMED: "Lamed",
  MEM: "Mem",
  NUN: "Nun",
  SAMEKH: "Samekh",
  AYIN: "Ayin",
  PE: "Pe",
  TSADI: "Tsadi",
  QOPH: "Qoph",
  RESH: "Resh",
  SHIN: "Shin",
  TAV: "Tav",
} as const;

export const HEBREW_LETTERS_DATA: Record<
  keyof typeof HEBREW_LETTERS,
  NodeData<LetterTypes.HEBREW_LETTER>
> = {
  ALEPH: {
    gematriaValue: 1,
    type: "mother",
    symbol: "Man",
    hieroglyph: "Unity, central point, abstract principle",
    yvritMeaning: "Universal man and the human gender",
    character: "א",
  },
  BETH: {
    gematriaValue: 2,
    type: "double",
    symbol: "Mouth",
    hieroglyph: "Woman's duality",
    yvritMeaning: "Man's mouth, habitation, interior",
    character: "ב",
  },
  GIMEL: {
    gematriaValue: 3,
    type: "double",
    symbol: "Grasping hand",
    hieroglyph: "Expansion and growth",
    yvritMeaning: "Man's throat, channel",
    character: "ג",
  },
  DALET: {
    gematriaValue: 4,
    type: "double",
    symbol: "Breast",
    hieroglyph: "Universal quaternary, source of physical existence",
    yvritMeaning: "Abundance and nourishment",
    character: "ד",
  },
  HE: {
    gematriaValue: 5,
    type: "simple",
    symbol: "Breath",
    hieroglyph:
      "Universal life, men's breath, the breath, everything that animates and vivifies",
    yvritMeaning: "Window",
    character: "ה",
  },
  VAV: {
    gematriaValue: 6,
    type: "simple",
    symbol: "Eye, ear",
    hieroglyph: "A point connection that separates being and non-being",
    yvritMeaning: "Construction nail",
    character: "ו",
  },
  ZAYIN: {
    gematriaValue: 7,
    type: "simple",
    symbol: "Arrow",
    hieroglyph: "Goal, objective to achieve",
    yvritMeaning: "Dart, sword",
    character: "ז",
  },
  HET: {
    gematriaValue: 8,
    type: "simple",
    symbol: "Field",
    hieroglyph: "Elemental existence",
    yvritMeaning: "Fence",
    character: "ח",
  },
  TET: {
    gematriaValue: 9,
    type: "simple",
    symbol: "A house covering",
    hieroglyph: "Men's shelter, roof, shield, protection, resistance",
    yvritMeaning: "Serpent",
    character: "ט",
  },
  YOD: {
    gematriaValue: 10,
    type: "simple",
    symbol: "Index finger",
    hieroglyph: "Potential manifestation, eternal worship",
    yvritMeaning: "Hand, index finger",
    character: "י",
  },
  KAPH: {
    gematriaValue: 20,
    type: "double",
    gematriaValueWhenEnding: 500,
    symbol: "Closing hand",
    hieroglyph: "Reflective and fleeting life",
    yvritMeaning: "Palm closing in the act of grasping something",
    character: "כ",
    characterWhenEnding: "ך",
  },
  LAMED: {
    gematriaValue: 30,
    type: "simple",
    symbol: "Extending arm",
    hieroglyph: "Extension, elevation",
    yvritMeaning: "Sting rod, human arm representing extension, elevation",
    character: "ל",
  },
  MEM: {
    gematriaValue: 40,
    type: "mother",
    gematriaValueWhenEnding: 600,
    symbol: "Woman",
    hieroglyph:
      "External passive action, all formative and plastic principle when starting a word, collectiveness when ending one",
    yvritMeaning: "Waters, woman, mother, man's companion",
    character: "מ",
    characterWhenEnding: "ם",
  },
  NUN: {
    gematriaValue: 50,
    type: "simple",
    gematriaValueWhenEnding: 700,
    symbol: "Fruit",
    hieroglyph: "Novelty, youth, grace, beauty",
    yvritMeaning: "Fish",
    character: "נ",
    characterWhenEnding: "ן",
  },
  SAMEKH: {
    gematriaValue: 60,
    type: "simple",
    symbol: "Serpent",
    hieroglyph: "Cyclical circular movement",
    yvritMeaning: "Support, brace, crutch",
    character: "ס",
  },
  AYIN: {
    gematriaValue: 70,
    type: "simple",
    symbol: "Binding",
    hieroglyph: "Material side of things, emptiness, nothingness, all evil",
    yvritMeaning: "Eye",
    character: "ע",
  },
  PE: {
    gematriaValue: 80,
    type: "double",
    gematriaValueWhenEnding: 800,
    symbol: "Mouth, tongue",
    hieroglyph: "Power of the verb, spoken word",
    yvritMeaning: "Mouth releasing",
    character: "פ",
    characterWhenEnding: "ף",
  },
  TSADI: {
    gematriaValue: 90,
    type: "simple",
    gematriaValueWhenEnding: 900,
    symbol: "Roof",
    hieroglyph: "Fixed thought upon a purpose",
    yvritMeaning: "Fishhook",
    character: "צ",
    characterWhenEnding: "ץ",
  },
  QOPH: {
    gematriaValue: 100,
    type: "simple",
    symbol: "Axe",
    hieroglyph: "Repressive pressure",
    yvritMeaning: "Back of the head",
    character: "ק",
  },
  RESH: {
    gematriaValue: 200,
    type: "double",
    symbol: "Head",
    hieroglyph:
      "Feeling, wanting, thinking, movement, reflection, origin, repetition",
    yvritMeaning: "Illuminated head",
    character: "ר",
  },
  SHIN: {
    gematriaValue: 300,
    type: "mother",
    symbol: "Crown",
    hieroglyph: "Relative duration, existence",
    yvritMeaning: "Part of the bow from which the arrow is released",
    character: "ש",
  },
  TAV: {
    gematriaValue: 400,
    type: "double",
    symbol: "Thorax",
    hieroglyph:
      "Universal soul, reciprocity, protection, perfection, abundance",
    yvritMeaning: "Ankh Cross",
    character: "ת",
  },
};

export const TAROT_SUITS = {
  WANDS: "Wands",
  CUPS: "Cups",
  SWORDS: "Swords",
  PENTACLES: "Pentacles",
} as const;

export const TAROT_ARKANNUS = {
  THE_MAGICIAN: "The Magician",
  THE_HIGH_PRIESTESS: "The High Priestess",
  THE_EMPRESS: "The Empress",
  THE_EMPEROR: "The Emperor",
  THE_HIEROPHANT: "The Hierophant",
  THE_LOVER: "The Lover",
  THE_CHARIOT: "The Chariot",
  JUSTICE: "Justice",
  THE_HERMIT: "The Hermit",
  THE_WHEEL_OF_FORTUNE: "The Wheel of Fortune",
  STRENGTH: "Strength",
  THE_HANGED_MAN: "The Hanged Man",
  DEATH: "Death",
  TEMPERANCE: "Temperance",
  THE_DEVIL: "The Devil",
  THE_TOWER: "The Tower",
  THE_STAR: "The Star",
  THE_MOON: "The Moon",
  THE_SUN: "The Sun",
  JUDGMENT: "Judgment",
  THE_FOOL: "The Fool",
  THE_WORLD: "The World",
  KING_OF_WANDS: "King of Wands",
  QUEEN_OF_WANDS: "Queen of Wands",
  KNIGHT_OF_WANDS: "Knight of Wands",
  PAGE_OF_WANDS: "Page of Wands",
  TEN_OF_WANDS: "Ten of Wands",
  NINE_OF_WANDS: "Nine of Wands",
  EIGHT_OF_WANDS: "Eight of Wands",
  SEVEN_OF_WANDS: "Seven of Wands",
  SIX_OF_WANDS: "Six of Wands",
  FIVE_OF_WANDS: "Five of Wands",
  FOUR_OF_WANDS: "Four of Wands",
  THREE_OF_WANDS: "Three of Wands",
  TWO_OF_WANDS: "Two of Wands",
  ACE_OF_WANDS: "Ace of Wands",
  KING_OF_CUPS: "King of Cups",
  QUEEN_OF_CUPS: "Queen of Cups",
  KNIGHT_OF_CUPS: "Knight of Cups",
  PAGE_OF_CUPS: "Page of Cups",
  TEN_OF_CUPS: "Ten of Cups",
  NINE_OF_CUPS: "Nine of Cups",
  EIGHT_OF_CUPS: "Eight of Cups",
  SEVEN_OF_CUPS: "Seven of Cups",
  SIX_OF_CUPS: "Six of Cups",
  FIVE_OF_CUPS: "Five of Cups",
  FOUR_OF_CUPS: "Four of Cups",
  THREE_OF_CUPS: "Three of Cups",
  TWO_OF_CUPS: "Two of Cups",
  ACE_OF_CUPS: "Ace of Cups",
  KING_OF_SWORDS: "King of Swords",
  QUEEN_OF_SWORDS: "Queen of Swords",
  KNIGHT_OF_SWORDS: "Knight of Swords",
  PAGE_OF_SWORDS: "Page of Swords",
  TEN_OF_SWORDS: "Ten of Swords",
  NINE_OF_SWORDS: "Nine of Swords",
  EIGHT_OF_SWORDS: "Eight of Swords",
  SEVEN_OF_SWORDS: "Seven of Swords",
  SIX_OF_SWORDS: "Six of Swords",
  FIVE_OF_SWORDS: "Five of Swords",
  FOUR_OF_SWORDS: "Four of Swords",
  THREE_OF_SWORDS: "Three of Swords",
  TWO_OF_SWORDS: "Two of Swords",
  ACE_OF_SWORDS: "Ace of Swords",
  KING_OF_PENTACLES: "King of Pentacles",
  QUEEN_OF_PENTACLES: "Queen of Pentacles",
  KNIGHT_OF_PENTACLES: "Knight of Pentacles",
  PAGE_OF_PENTACLES: "Page of Pentacles",
  TEN_OF_PENTACLES: "Ten of Pentacles",
  NINE_OF_PENTACLES: "Nine of Pentacles",
  EIGHT_OF_PENTACLES: "Eight of Pentacles",
  SEVEN_OF_PENTACLES: "Seven of Pentacles",
  SIX_OF_PENTACLES: "Six of Pentacles",
  FIVE_OF_PENTACLES: "Five of Pentacles",
  FOUR_OF_PENTACLES: "Four of Pentacles",
  THREE_OF_PENTACLES: "Three of Pentacles",
  TWO_OF_PENTACLES: "Two of Pentacles",
  ACE_OF_PENTACLES: "Ace of Pentacles",
} as const;

export const TAROT_DECKS = {
  PAPUS_KAABALISTIC: "Papus Kaabalistic",
  KIER_EGYPTIAN: "Kier Egyptian",
} as const;

export const TAROT_ARKANNUS_DATA: Record<
  keyof typeof TAROT_ARKANNUS,
  NodeData<TarotTypes.TAROT_ARK_ANNU>
> = {
  THE_MAGICIAN: {
    type: "major",
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "The Magician",
        meaning: "Abracadabra, the power to create reality through voice",
      },
      KIER_EGYPTIAN: {
        name: "The Magician",
      },
    },
  },
  THE_HIGH_PRIESTESS: {
    type: "major",
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "The High Priestess",
        meaning:
          "Intuition, the power to rewrite your book of life improving your life every instant",
      },
      KIER_EGYPTIAN: {
        name: "The Priestess",
      },
    },
  },
  THE_EMPRESS: {
    type: "major",
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "The Empress",
        meaning: "Adaptation, the power to geometrize through emotions",
      },
      KIER_EGYPTIAN: {
        name: "The Empress",
      },
    },
  },
  THE_EMPEROR: {
    type: "major",
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "The Emperor",
        meaning:
          "Authority, the power to mark your territory with the sacred fire",
      },
      KIER_EGYPTIAN: {
        name: "The Emperor",
      },
    },
  },
  THE_HIEROPHANT: {
    type: "major",
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "The Hierophant",
        meaning:
          "Magnetism, the power to ritualize life and circulate the quintessence",
      },
      KIER_EGYPTIAN: {
        name: "The Hierarch",
      },
    },
  },
  THE_LOVER: {
    type: "major",
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "The Lover",
        meaning:
          "Dichotomy, stay on the middle path by being neither a victim nor a villain",
      },
      KIER_EGYPTIAN: {
        name: "Indecision",
      },
    },
  },
  THE_CHARIOT: {
    type: "major",
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "The Chariot",
        meaning:
          "Merkaabah, take control and build your merkaabah (mind vehicle)",
      },
      KIER_EGYPTIAN: {
        name: "Triumph",
      },
    },
  },
  JUSTICE: {
    type: "major",
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Justice",
        meaning: "Justice, be just with yourself to be just with others",
      },
      KIER_EGYPTIAN: {
        name: "Justice",
      },
    },
  },
  THE_HERMIT: {
    type: "major",
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "The Hermit",
        meaning: "Introspection, seek within, retreat",
      },
      KIER_EGYPTIAN: {
        name: "The Hermit",
      },
    },
  },
  THE_WHEEL_OF_FORTUNE: {
    type: "major",
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "The Wheel of Fortune",
        meaning:
          "Loops, extroversion, break the great wheel and ascend, seek externally",
      },
      KIER_EGYPTIAN: {
        name: "Retribution",
      },
    },
  },
  STRENGTH: {
    type: "major",
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Strength",
        meaning: "The strength of your subconscious, unity brings strength",
      },
      KIER_EGYPTIAN: {
        name: "Persuasion",
      },
    },
  },
  THE_HANGED_MAN: {
    type: "major",
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "The Hanged Man",
        meaning: "Make valid sacrifices, adopt a new perspective",
      },
      KIER_EGYPTIAN: {
        name: "The Apostolate",
      },
    },
  },
  DEATH: {
    type: "major",
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Death",
        meaning: "Death, renovation, kill that which kills your soul",
      },
      KIER_EGYPTIAN: {
        name: "Immortality",
      },
    },
  },
  TEMPERANCE: {
    type: "major",
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Temperance",
        meaning: "Balance, harmonize differences",
      },
      KIER_EGYPTIAN: {
        name: "Temperance",
      },
    },
  },
  THE_DEVIL: {
    type: "major",
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "The Devil",
        meaning:
          "Indecision between vice and virtue, transmute weakness and passions into strengths",
      },
      KIER_EGYPTIAN: {
        name: "Passion",
      },
    },
  },
  THE_TOWER: {
    type: "major",
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "The House of God",
        meaning:
          "Separation, destruction, separate from what's harmful and connect with what's helpful, make room for the new",
      },
      KIER_EGYPTIAN: {
        name: "Fragility",
      },
    },
  },
  THE_STAR: {
    type: "major",
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "The Star",
        meaning:
          "Fecundation, ecology, ecstasy, hope, renew yourself to maintain help, act according to your spiritual purpose",
      },
      KIER_EGYPTIAN: {
        name: "Hope",
      },
    },
  },
  THE_MOON: {
    type: "major",
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "The Moon",
        meaning:
          "Hidden enemies, be vigilant, recognize where you're self sabotaging",
      },
      KIER_EGYPTIAN: {
        name: "Twilight",
      },
    },
  },
  THE_SUN: {
    type: "major",
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "The Sun",
        meaning:
          "Be conscious of your alchemical band, transmute money into knowledge and vice versa",
      },
      KIER_EGYPTIAN: {
        name: "Inspiration",
      },
    },
  },
  JUDGMENT: {
    type: "major",
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Judgement",
        meaning: "Make retrospectives and learn from mistakes and successes",
      },
      KIER_EGYPTIAN: {
        name: "Resurrection",
      },
    },
  },
  THE_FOOL: {
    type: "major",
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "The Fool",
        meaning: "Stop walking in circles, create connections of knowledge",
      },
      KIER_EGYPTIAN: {
        name: "Return",
      },
    },
  },
  THE_WORLD: {
    type: "major",
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "The World",
        meaning: "Win the world, start acting on the world of causes",
      },
      KIER_EGYPTIAN: {
        name: "Transmutation",
      },
    },
  },
  KING_OF_WANDS: {
    type: "court",
    suit: TAROT_SUITS.WANDS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "King of Wands",
        meaning: "Get's the best out of every one, Idealism, Magnanimity",
      },
      KIER_EGYPTIAN: {
        name: "The Laborer",
      },
    },
  },
  QUEEN_OF_WANDS: {
    type: "court",
    suit: TAROT_SUITS.WANDS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Queen of Wands",
        meaning:
          "Hold the line while the king goes to work, Preserve what was conquered",
      },
      KIER_EGYPTIAN: {
        name: "The Weaver",
      },
    },
  },
  KNIGHT_OF_WANDS: {
    type: "court",
    suit: TAROT_SUITS.WANDS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Knight of Wands",
        meaning: "Dreams that become reality",
      },
      KIER_EGYPTIAN: {
        name: "The Argonaut",
      },
    },
  },
  PAGE_OF_WANDS: {
    type: "court",
    suit: TAROT_SUITS.WANDS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Page of Wands",
        meaning: "Don't rush, the precipitations are the doors to failure",
      },
      KIER_EGYPTIAN: {
        name: "The Prodigy",
      },
    },
  },
  ACE_OF_WANDS: {
    type: "minor",
    suit: TAROT_SUITS.WANDS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Ace of Wands",
        meaning: "Ignite the flames of ideals, Trust in your inner divinity",
      },
      KIER_EGYPTIAN: {
        name: "The Unexpected",
      },
    },
  },
  TWO_OF_WANDS: {
    type: "minor",
    suit: TAROT_SUITS.WANDS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Two of Wands",
        meaning: "Formulate a strategy to use your own talents",
      },
      KIER_EGYPTIAN: {
        name: "Uncertainty",
      },
    },
  },
  THREE_OF_WANDS: {
    type: "minor",
    suit: TAROT_SUITS.WANDS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Three of Wands",
        meaning: "Keep going despite losing something apparently important",
      },
      KIER_EGYPTIAN: {
        name: "Domesticity",
      },
    },
  },
  FOUR_OF_WANDS: {
    type: "minor",
    suit: TAROT_SUITS.WANDS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Four of Wands",
        meaning: "Work in teams",
      },
      KIER_EGYPTIAN: {
        name: "Exchange",
      },
    },
  },
  FIVE_OF_WANDS: {
    type: "minor",
    suit: TAROT_SUITS.WANDS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Five of Wands",
        meaning: "Strengthen the root chakra, overcome internal fears",
      },
      KIER_EGYPTIAN: {
        name: "Impediment",
      },
    },
  },
  SIX_OF_WANDS: {
    type: "minor",
    suit: TAROT_SUITS.WANDS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Six of Wands",
        meaning: "External victory, internal lack of internal self realization",
      },
      KIER_EGYPTIAN: {
        name: "Magnificence",
      },
    },
  },
  SEVEN_OF_WANDS: {
    type: "minor",
    suit: TAROT_SUITS.WANDS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Seven of Wands",
        meaning: "Face competitors in an ethical and loyal way",
      },
      KIER_EGYPTIAN: {
        name: "Alliance",
      },
    },
  },
  EIGHT_OF_WANDS: {
    type: "minor",
    suit: TAROT_SUITS.WANDS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Eight of Wands",
        meaning: "Travel to the center of peace and intelligence",
      },
      KIER_EGYPTIAN: {
        name: "Innovation",
      },
    },
  },
  NINE_OF_WANDS: {
    type: "minor",
    suit: TAROT_SUITS.WANDS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Nine of Wands",
        meaning: "Obstacle that precedes total victory, gather hidden forces",
      },
      KIER_EGYPTIAN: {
        name: "Desolation",
      },
    },
  },
  TEN_OF_WANDS: {
    type: "minor",
    suit: TAROT_SUITS.WANDS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Ten of Wands",
        meaning: "Get out of apathy, create a new tree of life using the Lightning Path",
      },
      KIER_EGYPTIAN: {
        name: "Initiation",
      },
    },
  },
  KING_OF_CUPS: {
    type: "court",
    suit: TAROT_SUITS.CUPS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "King of Cups",
        meaning: "Stop hurting yourself (related to The Lover), heals everyone and forgets about yourself, balm for your own wound",
      },
      KIER_EGYPTIAN: {
        name: "Art and Science",
      },
    },
  },
  QUEEN_OF_CUPS: {
    type: "court",
    suit: TAROT_SUITS.CUPS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Queen of Cups",
        meaning: "Work with subtlety, positive challenges",
      },
      KIER_EGYPTIAN: {
        name: "Duplicity",
      },
    },
  },
  KNIGHT_OF_CUPS: {
    type: "court",
    suit: TAROT_SUITS.CUPS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Knight of Cups",
        meaning: "Alternative healing",
      },
      KIER_EGYPTIAN: {
        name: "Testimony",
      },
    },
  },
  PAGE_OF_CUPS: {
    type: "court",
    suit: TAROT_SUITS.CUPS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Page of Cups",
        meaning: "Increase of self-esteem, emotional courage",
      },
      KIER_EGYPTIAN: {
        name: "Premonition",
      },
    },
  },
  ACE_OF_CUPS: {
    type: "minor",
    suit: TAROT_SUITS.CUPS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Ace of Cups",
        meaning: "Renewal or new affection, alternative treatment for health",
      },
      KIER_EGYPTIAN: {
        name: "Dissension",
      },
    },
  },
  TWO_OF_CUPS: {
    type: "minor",
    suit: TAROT_SUITS.CUPS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Two of Cups",
        meaning: "Do not poison yourself or the other person",
      },
      KIER_EGYPTIAN: {
        name: "Preeminence",
      },
    },
  },
  THREE_OF_CUPS: {
    type: "minor",
    suit: TAROT_SUITS.CUPS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Three of Cups",
        meaning: "Harmony between instinct and emotion, Be discreet",
      },
      KIER_EGYPTIAN: {
        name: "Premonition",
      },
    },
  },
  FOUR_OF_CUPS: {
    type: "minor",
    suit: TAROT_SUITS.CUPS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Four of Cups",
        meaning: "Abundance in emotional life, do not listen to slander",
      },
      KIER_EGYPTIAN: {
        name: "Expressiveness",
      },
    },
  },
  FIVE_OF_CUPS: {
    type: "minor",
    suit: TAROT_SUITS.CUPS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Five of Cups",
        meaning: "Do not break your spiritual commitment (your purpose)",
      },
      KIER_EGYPTIAN: {
        name: "Regeneration",
      },
    },
  },
  SIX_OF_CUPS: {
    type: "minor",
    suit: TAROT_SUITS.CUPS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Six of Cups",
        meaning: "Do not have self-pity",
      },
      KIER_EGYPTIAN: {
        name: "Patrimony",
      },
    },
  },
  SEVEN_OF_CUPS: {
    type: "minor",
    suit: TAROT_SUITS.CUPS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Seven of Cups",
        meaning: "Gestations, related to The Star",
      },
      KIER_EGYPTIAN: {
        name: "Conjecture",
      },
    },
  },
  EIGHT_OF_CUPS: {
    type: "minor",
    suit: TAROT_SUITS.CUPS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Eight of Cups",
        meaning: "Reflect on your emotional life after 18 hours",
      },
      KIER_EGYPTIAN: {
        name: "Consummation",
      },
    },
  },
  NINE_OF_CUPS: {
    type: "minor",
    suit: TAROT_SUITS.CUPS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Nine of Cups",
        meaning: "Reconciliations and forgiveness",
      },
      KIER_EGYPTIAN: {
        name: "Versatility",
      },
    },
  },
  TEN_OF_CUPS: {
    type: "minor",
    suit: TAROT_SUITS.CUPS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Ten of Cups",
        meaning: "Marriage of the spirit with the soul, Alchemical Weddings",
      },
      KIER_EGYPTIAN: {
        name: "Attraction",
      },
    },
  },
  KING_OF_SWORDS: {
    type: "court",
    suit: TAROT_SUITS.SWORDS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "King of Swords",
        meaning: "Actions of victorious strategies",
      },
      KIER_EGYPTIAN: {
        name: "Advice",
      },
    },
  },
  QUEEN_OF_SWORDS: {
    type: "court",
    suit: TAROT_SUITS.SWORDS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Queen of Swords",
        meaning: "Supremacy of the feminine, related to Justice",
      },
      KIER_EGYPTIAN: {
        name: "Premeditation",
      },
    },
  },
  KNIGHT_OF_SWORDS: {
    type: "court",
    suit: TAROT_SUITS.SWORDS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Knight of Swords",
        meaning: "Joint victorious actions",
      },
      KIER_EGYPTIAN: {
        name: "Hostility",
      },
    },
  },
  PAGE_OF_SWORDS: {
    type: "court",
    suit: TAROT_SUITS.SWORDS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Page of Swords",
        meaning: "Follow your intuition",
      },
      KIER_EGYPTIAN: {
        name: "Examination",
      },
    },
  },
  ACE_OF_SWORDS: {
    type: "minor",
    suit: TAROT_SUITS.SWORDS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Ace of Swords",
        meaning: "Conflicts before victory",
      },
      KIER_EGYPTIAN: {
        name: "Contrition",
      },
    },
  },
  TWO_OF_SWORDS: {
    type: "minor",
    suit: TAROT_SUITS.SWORDS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Two of Swords",
        meaning: "Traumas and conflicts to overcome",
      },
      KIER_EGYPTIAN: {
        name: "Pilgrimage",
      },
    },
  },
  THREE_OF_SWORDS: {
    type: "minor",
    suit: TAROT_SUITS.SWORDS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Three of Swords",
        meaning: "Death of yang, Fire, tendencies to depression",
      },
      KIER_EGYPTIAN: {
        name: "Rivalry",
      },
    },
  },
  FOUR_OF_SWORDS: {
    type: "minor",
    suit: TAROT_SUITS.SWORDS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Four of Swords",
        meaning: "Reflection, related to The Hermit",
      },
      KIER_EGYPTIAN: {
        name: "Meditation",
      },
    },
  },
  FIVE_OF_SWORDS: {
    type: "minor",
    suit: TAROT_SUITS.SWORDS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Five of Swords",
        meaning: "Healthy self-challenge, Self-demands",
      },
      KIER_EGYPTIAN: {
        name: "Revelation",
      },
    },
  },
  SIX_OF_SWORDS: {
    type: "minor",
    suit: TAROT_SUITS.SWORDS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Six of Swords",
        meaning: "External daily strategies, Future perspectives",
      },
      KIER_EGYPTIAN: {
        name: "Evolution",
      },
    },
  },
  SEVEN_OF_SWORDS: {
    type: "minor",
    suit: TAROT_SUITS.SWORDS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Seven of Swords",
        meaning: "Internal nocturnal strategies, related to The Hermit",
      },
      KIER_EGYPTIAN: {
        name: "Solitude",
      },
    },
  },
  EIGHT_OF_SWORDS: {
    type: "minor",
    suit: TAROT_SUITS.SWORDS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Eight of Swords",
        meaning: "Appeal to superior forces, Internal and external conflicts",
      },
      KIER_EGYPTIAN: {
        name: "Proscription",
      },
    },
  },
  NINE_OF_SWORDS: {
    type: "minor",
    suit: TAROT_SUITS.SWORDS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Nine of Swords",
        meaning: "The problems being imagined will never happen",
      },
      KIER_EGYPTIAN: {
        name: "Communion",
      },
    },
  },
  TEN_OF_SWORDS: {
    type: "minor",
    suit: TAROT_SUITS.SWORDS,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Ten of Swords",
        meaning: "Death and rebirth, related to Death and The Tower",
      },
      KIER_EGYPTIAN: {
        name: "Vehemence",
      },
    },
  },
  KING_OF_PENTACLES: {
    type: "court",
    suit: TAROT_SUITS.PENTACLES,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "King of Pentacles",
        meaning: "Turns everything into gold",
      },
      KIER_EGYPTIAN: {
        name: "Apprenticeship",
      },
    },
  },
  QUEEN_OF_PENTACLES: {
    type: "court",
    suit: TAROT_SUITS.PENTACLES,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Queen of Pentacles",
        meaning: "Act with diplomacy",
      },
      KIER_EGYPTIAN: {
        name: "Perplexity",
      },
    },
  },
  KNIGHT_OF_PENTACLES: {
    type: "court",
    suit: TAROT_SUITS.PENTACLES,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Knight of Pentacles",
        meaning: "Invest into new things",
      },
      KIER_EGYPTIAN: {
        name: "Veneration",
      },
    },
  },
  PAGE_OF_PENTACLES: {
    type: "court",
    suit: TAROT_SUITS.PENTACLES,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Page of Pentacles",
        meaning: "Prudence in the material life",
      },
      KIER_EGYPTIAN: {
        name: "Speculation",
      },
    },
  },
  ACE_OF_PENTACLES: {
    type: "minor",
    suit: TAROT_SUITS.PENTACLES,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Ace of Pentacles",
        meaning: "Rebirth through a single material goal, Form clear material goals",
      },
      KIER_EGYPTIAN: {
        name: "The Unforeseen",
      },
    },
  },
  TWO_OF_PENTACLES: {
    type: "minor",
    suit: TAROT_SUITS.PENTACLES,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Two of Pentacles",
        meaning: "Light forming shadows, Duality asking for synthesis in the trinity, Don't put all the eggs in the same basket",
      },
      KIER_EGYPTIAN: {
        name: "Cooperation",
      },
    },
  },
  THREE_OF_PENTACLES: {
    type: "minor",
    suit: TAROT_SUITS.PENTACLES,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Three of Pentacles",
        meaning: "Light forming sound, Establish balance through the trinity becoming a great dispenser, Verbalize what should be done, Do not settle for the first results",
      },
      KIER_EGYPTIAN: {
        name: "Avarice",
      },
    },
  },
  FOUR_OF_PENTACLES: {
    type: "minor",
    suit: TAROT_SUITS.PENTACLES,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Four of Pentacles",
        meaning: "Avoid avarice / greed",
      },
      KIER_EGYPTIAN: {
        name: "Purification",
      },
    },
  },
  FIVE_OF_PENTACLES: {
    type: "minor",
    suit: TAROT_SUITS.PENTACLES,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Five of Pentacles",
        meaning: "Only order will bring progress, Do not kick the barn without having something concrete in front of you",
      },
      KIER_EGYPTIAN: {
        name: "Love and Desire",
      },
    },
  },
  SIX_OF_PENTACLES: {
    type: "minor",
    suit: TAROT_SUITS.PENTACLES,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Six of Pentacles",
        meaning: "Act with prudence",
      },
      KIER_EGYPTIAN: {
        name: "Offering",
      },
    },
  },
  SEVEN_OF_PENTACLES: {
    type: "minor",
    suit: TAROT_SUITS.PENTACLES,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Seven of Pentacles",
        meaning: "Don't boast about your proposal or project",
      },
      KIER_EGYPTIAN: {
        name: "Generosity",
      },
    },
  },
  EIGHT_OF_PENTACLES: {
    type: "minor",
    suit: TAROT_SUITS.PENTACLES,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Eight of Pentacles",
        meaning: "Keep doing what you always did",
      },
      KIER_EGYPTIAN: {
        name: "The Provider",
      },
    },
  },
  NINE_OF_PENTACLES: {
    type: "minor",
    suit: TAROT_SUITS.PENTACLES,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Nine of Pentacles",
        meaning: "Work with what you like and earn something with it",
      },
      KIER_EGYPTIAN: {
        name: "Confusion",
      },
    },
  },
  TEN_OF_PENTACLES: {
    type: "minor",
    suit: TAROT_SUITS.PENTACLES,
    descriptiveData: {
      PAPUS_KAABALISTIC: {
        name: "Ten of Pentacles",
        meaning: "Prosperity, Prosperous inheritance",
      },
      KIER_EGYPTIAN: {
        name: "Rebirth",
      },
    },
  },
};

export const MUSICAL_NOTES = {
  DO: "DO",
  DO_SHARP: "DO_SHARP",
  RE: "RE",
  RE_SHARP: "RE_SHARP",
  MI: "MI",
  FA: "FA",
  FA_SHARP: "FA_SHARP",
  SOL: "SOL",
  SOL_SHARP: "SOL_SHARP",
  LA: "LA",
  LA_SHARP: "LA_SHARP",
  SI: "SI",
} as const;

export const MUSICAL_NOTES_DATA: Record<keyof typeof MUSICAL_NOTES, MusicalNoteData> = {
  DO: {
    note: "C",
    noteDescription: "C (Do)",
    frequencies: [
      "16.35 Hz", "32.70 Hz", "65.41 Hz", "130.81 Hz", "261.63 Hz", "523.25 Hz", "1046.50 Hz", "2093.00 Hz", "4186.01 Hz"
    ],
  },
  DO_SHARP: {
    note: "C#/Db",
    noteDescription: "C♯/D♭ (Do♯/Re♭)",
    frequencies: [
      "17.32 Hz", "34.65 Hz", "69.30 Hz", "138.59 Hz", "277.18 Hz", "554.37 Hz", "1108.73 Hz", "2217.46 Hz", "4434.92 Hz"
    ],
  },
  RE: {
    note: "D",
    noteDescription: "D (Re)",
    frequencies: [
      "18.35 Hz", "36.71 Hz", "73.42 Hz", "146.83 Hz", "293.66 Hz", "587.33 Hz", "1174.66 Hz", "2349.32 Hz", "4698.63 Hz"
    ],
  },
  RE_SHARP: {
    note: "D#/Eb",
    noteDescription: "D♯/E♭ (Re♯/Mi♭)",
    frequencies: [
      "19.45 Hz", "38.89 Hz", "77.78 Hz", "155.56 Hz", "311.13 Hz", "622.25 Hz", "1244.51 Hz", "2489.02 Hz", "4978.03 Hz"
    ],
  },
  MI: {
    note: "E",
    noteDescription: "E (Mi)",
    frequencies: [
      "20.60 Hz", "41.20 Hz", "82.41 Hz", "164.81 Hz", "329.63 Hz", "659.25 Hz", "1318.51 Hz", "2637.02 Hz", "5274.04 Hz"
    ],
  },
  FA: {
    note: "F",
    noteDescription: "F (Fa)",
    frequencies: [
      "21.83 Hz", "43.65 Hz", "87.31 Hz", "174.61 Hz", "349.23 Hz", "698.46 Hz", "1396.91 Hz", "2793.83 Hz", "5587.65 Hz"
    ],
  },
  FA_SHARP: {
    note: "F#/Gb",
    noteDescription: "F♯/G♭ (Fa♯/Sol♭)",
    frequencies: [
      "23.12 Hz", "46.25 Hz", "92.50 Hz", "185.00 Hz", "369.99 Hz", "739.99 Hz", "1479.98 Hz", "2959.96 Hz", "5919.91 Hz"
    ],
  },
  SOL: {
    note: "G",
    noteDescription: "G (Sol)",
    frequencies: [
      "24.50 Hz", "49.00 Hz", "98.00 Hz", "196.00 Hz", "392.00 Hz", "783.99 Hz", "1567.98 Hz", "3135.96 Hz", "6271.93 Hz"
    ],
  },
  SOL_SHARP: {
    note: "G#/Ab",
    noteDescription: "G♯/A♭ (Sol♯/La♭)",
    frequencies: [
      "25.96 Hz", "51.91 Hz", "103.83 Hz", "207.65 Hz", "415.30 Hz", "830.61 Hz", "1661.22 Hz", "3322.44 Hz", "6644.88 Hz"
    ],
  },
  LA: {
    note: "A",
    noteDescription: "A (La)",
    frequencies: [
      "27.50 Hz", "55.00 Hz", "110.00 Hz", "220.00 Hz", "440.00 Hz", "880.00 Hz", "1760.00 Hz", "3520.00 Hz", "7040.00 Hz"
    ],
  },
  LA_SHARP: {
    note: "A#/Bb",
    noteDescription: "A♯/B♭ (La♯/Si♭)",
    frequencies: [
      "29.14 Hz", "58.27 Hz", "116.54 Hz", "233.08 Hz", "466.16 Hz", "932.33 Hz", "1864.66 Hz", "3729.31 Hz", "7458.62 Hz"
    ],
  },
  SI: {
    note: "B",
    noteDescription: "B (Si)",
    frequencies: [
      "30.87 Hz", "61.74 Hz", "123.47 Hz", "246.94 Hz", "493.88 Hz", "987.77 Hz", "1975.53 Hz", "3951.07 Hz", "7902.13 Hz"
    ],
  },
};

export const COLORS = {
  RED: "RED", 
  ORANGE: "ORANGE", 
  YELLOW: "YELLOW", 
  CHARTREUSE_GREEN: "CHARTREUSE_GREEN",
  GREEN: "GREEN",
  SPRING_GREEN: "SPRING_GREEN",
  CYAN: "CYAN",
  AZURE: "AZURE",
  BLUE: "BLUE",
  VIOLET: "VIOLET",
  MAGENTA: "MAGENTA",
  ROSE: "ROSE",
} as const;

export const COLORS_DATA: Record<keyof typeof COLORS, ColorData> = {
  RED: {
    colorDescription: "Red",
    colorNames: ["Red"],
    colorHexCodes: ["#FF0000"],
  },
  ORANGE: {
    colorDescription: "Orange",
    colorNames: ["Orange"],
    colorHexCodes: ["#FF8000"],
  },
  YELLOW: {
    colorDescription: "Yellow",
    colorNames: ["Yellow"],
    colorHexCodes: ["#FFFF00"],
  },
  CHARTREUSE_GREEN: {
    colorDescription: "Chartreuse Green",
    colorNames: ["Chartreuse Green"],
    colorHexCodes: ["#80FF00"],
  },
  GREEN: {
    colorDescription: "Green",
    colorNames: ["Green"],
    colorHexCodes: ["#00FF00"],
  },
  SPRING_GREEN: {
    colorDescription: "Spring Green",
    colorNames: ["Spring Green"],
    colorHexCodes: ["#00FF80"],
  },
  CYAN: {
    colorDescription: "Cyan",
    colorNames: ["Cyan"],
    colorHexCodes: ["#00FFFF"],
  },
  AZURE: {
    colorDescription: "Azure",
    colorNames: ["Azure"],
    colorHexCodes: ["#0080FF"],
  },
  BLUE: {
    colorDescription: "Blue",
    colorNames: ["Blue"],
    colorHexCodes: ["#0000FF"],
  },
  VIOLET: {
    colorDescription: "Violet",
    colorNames: ["Violet"],
    colorHexCodes: ["#8000FF"],
  },
  MAGENTA: {
    colorDescription: "Magenta",
    colorNames: ["Magenta"],
    colorHexCodes: ["#FF00FF"],
  },
  ROSE: {
    colorDescription: "Rose",
    colorNames: ["Rose"],
    colorHexCodes: ["#FF0080"],
  },
};