import { getEnglishTarotDeckDescriptions } from "./tarot-content";
import { KaabalahTypes, LetterTypes, NodeData, NodeId, TarotTypes } from "./types";


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

export type TarotArkAnnuData = {
  type: "major" | "minor" | "court";
  suit?: (typeof TAROT_SUITS)[keyof typeof TAROT_SUITS];
  aliases?: readonly string[];
  keywords?: readonly string[];
  /** Portuguese (pt-BR) keywords, item for item with `keywords` (major Ark Annus only). */
  keywordsPt?: readonly string[];
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

export const MODALITIES = {
  CARDINAL: "Cardinal",
  FIXED: "Fixed",
  MUTABLE: "Mutable",
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

export const WESTERN_HOUSES = {
  ASCENDANT: "ascendant",
  SECOND_HOUSE: "second house",
  THIRD_HOUSE: "third house",
  IMUM_COELI: "imum coeli",
  FIFTH_HOUSE: "fifth house",
  SIXTH_HOUSE: "sixth house",
  DESCENDANT: "descendant",
  EIGHTH_HOUSE: "eighth house",
  NINTH_HOUSE: "ninth house",
  MEDIUM_COELI: "medium coeli",
  ELEVENTH_HOUSE: "eleventh house",
  TWELFTH_HOUSE: "twelfth house",
} as const;

export const WESTERN_ASPECTS = {
  CONJUNCTION: "conjunction",
  DUODECILE: "duodecile",
  OCTILE: "octile",
  SEXTILE: "sextile",
  SQUARE: "square",
  TRINE: "trine",
  TRIOCTILE: "trioctile",
  QUINCUNX: "quincunx",
  OPPOSITION: "opposition",
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
  PAPUS_DIVINATORY: "Papus Divinatory",
  KIER_EGYPTIAN: "Kier Egyptian",
} as const;

const TAROT_MAJOR_ARKANNUS_ALIASES = {
  THE_MAGICIAN: ["O Mago"],
  THE_HIGH_PRIESTESS: ["A Sacerdotisa", "Papisa"],
  THE_EMPRESS: ["A Imperatriz"],
  THE_EMPEROR: ["O Imperador"],
  THE_HIEROPHANT: ["O Hierofante", "Papa"],
  THE_LOVER: ["Os Enamorados", "The Lovers"],
  THE_CHARIOT: ["O Carro", "Merkaabah"],
  JUSTICE: ["A Justiça"],
  THE_HERMIT: ["O Eremita"],
  THE_WHEEL_OF_FORTUNE: ["A Roda da Fortuna"],
  STRENGTH: ["A Força"],
  THE_HANGED_MAN: ["O Enforcado", "Sacro Ofício"],
  DEATH: ["A Morte"],
  TEMPERANCE: ["A Temperança"],
  THE_DEVIL: ["O Diabo"],
  THE_TOWER: ["A Torre", "The House of God"],
  THE_STAR: ["A Estrela"],
  THE_MOON: ["A Lua"],
  THE_SUN: ["O Sol"],
  JUDGMENT: ["O Julgamento", "Judgement"],
  THE_FOOL: ["O Louco"],
  THE_WORLD: ["O Mundo"],
} as const;

const TAROT_MAJOR_ARKANNUS_KEYWORDS = {
  THE_MAGICIAN: [
    "co-creation",
    "molecular waves",
    "first act of will",
    "Hermes",
    "knowledge",
    "will",
  ],
  THE_HIGH_PRIESTESS: [
    "veiled feminine principle",
    "intuition",
    "Isis",
    "mysteries",
    "feminine principle",
    "memory rewriting",
    "history rewriting",
  ],
  THE_EMPRESS: [
    "manifestation",
    "fecundity",
    "adaptation",
    "generative power",
    "fertility",
    "nurturing",
    "creative manifestation",
  ],
  THE_EMPEROR: [
    "dominion of will",
    "four elements",
    "authority",
    "territory marking",
    "divine authority",
    "sovereignty",
    "sacred fire",
  ],
  THE_HIEROPHANT: [
    "ritualization",
    "fifth essences",
    "spiritual communion",
    "ritual science",
    "magnetism",
    "bridge between worlds",
    "Agnus Dei",
  ],
  THE_LOVER: [
    "sexual alchemy",
    "ascension of energy",
    "union of opposites",
    "choice",
    "balance of Eva and Lilith",
    "sacred sexuality",
    "decision",
  ],
  THE_CHARIOT: [
    "mastery of duality",
    "chariot of consciousness",
    "solar energy",
    "willpower",
    "transmutation",
    "interdimensional vehicles",
    "Merkabah",
  ],
  JUSTICE: [
    "cosmic law",
    "mercy and severity",
    "impartial divine judgment",
    "divine balance",
    "karma enforcement",
    "Uriel",
  ],
  THE_HERMIT: [
    "solitary quest",
    "self-knowledge",
    "inner illumination",
    "inner light",
    "wisdom",
    "disciplined introspection",
    "Lamp of Hermes",
  ],
  THE_WHEEL_OF_FORTUNE: [
    "cycle of reincarnation",
    "evolution",
    "108 existences",
    "metempsychosis",
    "destiny",
    "karma",
    "turning wheel of souls",
  ],
  STRENGTH: [
    "subtle persuasion",
    "mastery of instinct",
    "spiritual force",
    "control of raw power",
    "kindness",
    "lion taming",
  ],
  THE_HANGED_MAN: [
    "sacrifice",
    "transmutation",
    "voluntary suspension",
    "surrender",
    "apostolate",
    "sacred duty",
    "death of ego",
    "Christ on cross",
  ],
  DEATH: [
    "transformation",
    "immortality",
    "dissolution of the personality",
    "resurrection",
    "sickle of Anubis",
    "cycle change",
  ],
  TEMPERANCE: [
    "alchemical transmutation",
    "elixir of long life",
    "balance",
    "harmony",
    "blending of opposites",
    "alchemist's work",
    "divine balance",
  ],
  THE_DEVIL: [
    "involution",
    "materiality",
    "shadow self",
    "transmutation",
    "testing",
    "shadow work",
    "sexual force",
    "Pan",
  ],
  THE_TOWER: [
    "destruction of false foundations",
    "karmic correction",
    "cosmic justice",
    "collapse of illusions",
    "divine lightning",
    "Babel confusion",
  ],
  THE_STAR: [
    "hope",
    "inner light",
    "guiding the path",
    "innocence recovered",
    "faith",
    "renewal",
    "Venusian initiation",
    "cosmic seeding",
    "divine hope",
  ],
  THE_MOON: [
    "illusion",
    "confusion",
    "subconscious waters",
    "deception",
    "dreams",
    "psychic dangers",
    "Hecate",
  ],
  THE_SUN: [
    "philosophical gold",
    "enlightenment",
    "victory",
    "child-like innocence reborn",
    "divine truth",
    "triumph",
    "golden philosophical stone",
    "soulmate",
    "Apollo",
  ],
  JUDGMENT: [
    "resurrection",
    "retrospectives",
    "karmic accounting",
    "second birth of consciousness",
    "rebirth",
    "awakening",
    "trumpet call",
    "transformation of ages",
  ],
  THE_FOOL: [
    "chaos",
    "bridges of knowledge",
    "fall before ascension",
    "divinity",
    "wandering",
    "innocence before knowledge",
    "dark night of soul",
  ],
  THE_WORLD: [
    "completion",
    "mastery of all four elements",
    "Hermaphroditic unity",
    "perfection",
    "wholeness",
    "Ouroboros",
    "Isis unveiled",
    "Great Work",
  ],
} as const;

/**
 * Portuguese (pt-BR) keywords of the 22 Ark Annus. Each list matches the English
 * one in `TAROT_MAJOR_ARKANNUS_KEYWORDS` item for item, in the same order.
 */
const TAROT_MAJOR_ARKANNUS_KEYWORDS_PT = {
  THE_MAGICIAN: [
    "cocriação",
    "ondas moleculares",
    "primeiro ato de vontade",
    "Hermes",
    "conhecimento",
    "vontade",
  ],
  THE_HIGH_PRIESTESS: [
    "princípio feminino velado",
    "intuição",
    "Ísis",
    "mistérios",
    "princípio feminino",
    "reescrever a memória",
    "reescrever a história",
  ],
  THE_EMPRESS: [
    "manifestação",
    "fecundidade",
    "adaptação",
    "poder gerador",
    "fertilidade",
    "nutrir",
    "manifestação criativa",
  ],
  THE_EMPEROR: [
    "domínio da vontade",
    "quatro elementos",
    "autoridade",
    "marcar território",
    "autoridade divina",
    "soberania",
    "fogo sagrado",
  ],
  THE_HIEROPHANT: [
    "ritualização",
    "quintessência",
    "comunhão espiritual",
    "ciência ritual",
    "magnetismo",
    "ponte entre os mundos",
    "Agnus Dei",
  ],
  THE_LOVER: [
    "alquimia sexual",
    "ascensão da energia",
    "união dos opostos",
    "escolha",
    "equilíbrio entre Eva e Lilith",
    "sexualidade sagrada",
    "decisão",
  ],
  THE_CHARIOT: [
    "domínio da dualidade",
    "carro da consciência",
    "energia solar",
    "força de vontade",
    "transmutação",
    "veículos interdimensionais",
    "Merkaabah",
  ],
  JUSTICE: [
    "lei cósmica",
    "misericórdia e severidade",
    "juízo divino imparcial",
    "equilíbrio divino",
    "cumprimento do karma",
    "Uriel",
  ],
  THE_HERMIT: [
    "busca solitária",
    "autoconhecimento",
    "iluminação interior",
    "luz interior",
    "sabedoria",
    "introspecção disciplinada",
    "Lamparina de Hermes",
  ],
  THE_WHEEL_OF_FORTUNE: [
    "ciclo de reencarnação",
    "evolução",
    "108 existências",
    "metempsicose",
    "destino",
    "karma",
    "roda giratória das almas",
  ],
  STRENGTH: [
    "persuasão sutil",
    "domínio do instinto",
    "força espiritual",
    "controle do poder bruto",
    "bondade",
    "domar o leão",
  ],
  THE_HANGED_MAN: [
    "sacrifício",
    "transmutação",
    "suspensão voluntária",
    "entrega",
    "apostolado",
    "sacro ofício",
    "morte do ego",
    "Cristo na cruz",
  ],
  DEATH: [
    "transformação",
    "imortalidade",
    "dissolução da personalidade",
    "ressurreição",
    "foice de Anúbis",
    "mudança de ciclo",
  ],
  TEMPERANCE: [
    "transmutação alquímica",
    "elixir de longa vida",
    "equilíbrio",
    "harmonia",
    "mistura dos opostos",
    "trabalho do alquimista",
    "equilíbrio divino",
  ],
  THE_DEVIL: [
    "involução",
    "materialidade",
    "sombra pessoal",
    "transmutação",
    "provação",
    "trabalho com a sombra",
    "força sexual",
    "Pan",
  ],
  THE_TOWER: [
    "destruição das falsas bases",
    "correção kármica",
    "justiça cósmica",
    "colapso das ilusões",
    "raio divino",
    "confusão de Babel",
  ],
  THE_STAR: [
    "esperança",
    "luz interior",
    "guiar o caminho",
    "inocência recuperada",
    "fé",
    "renovação",
    "iniciação venusiana",
    "semeadura cósmica",
    "esperança divina",
  ],
  THE_MOON: [
    "ilusão",
    "confusão",
    "águas do subconsciente",
    "engano",
    "sonhos",
    "perigos psíquicos",
    "Hécate",
  ],
  THE_SUN: [
    "ouro filosófico",
    "iluminação",
    "vitória",
    "inocência infantil renascida",
    "verdade divina",
    "triunfo",
    "pedra filosofal dourada",
    "alma gêmea",
    "Apolo",
  ],
  JUDGMENT: [
    "ressurreição",
    "retrospectivas",
    "balanço kármico",
    "segundo nascimento da consciência",
    "renascimento",
    "despertar",
    "toque da trombeta",
    "transformação das eras",
  ],
  THE_FOOL: [
    "caos",
    "pontes de conhecimento",
    "queda antes da ascensão",
    "divindade",
    "errância",
    "inocência antes do conhecimento",
    "noite escura da alma",
  ],
  THE_WORLD: [
    "completude",
    "domínio dos quatro elementos",
    "unidade hermafrodita",
    "perfeição",
    "totalidade",
    "Ouroboros",
    "Ísis desvelada",
    "Grande Obra",
  ],
} as const satisfies Record<
  keyof typeof TAROT_MAJOR_ARKANNUS_KEYWORDS,
  readonly string[]
>;

export const TAROT_ARKANNUS_DATA: Record<
  keyof typeof TAROT_ARKANNUS,
  NodeData<TarotTypes.TAROT_ARK_ANNU>
> = {
  THE_MAGICIAN: {
    type: "major",
    aliases: TAROT_MAJOR_ARKANNUS_ALIASES.THE_MAGICIAN,
    keywords: TAROT_MAJOR_ARKANNUS_KEYWORDS.THE_MAGICIAN,
    keywordsPt: TAROT_MAJOR_ARKANNUS_KEYWORDS_PT.THE_MAGICIAN,
    descriptiveData: getEnglishTarotDeckDescriptions("01_the_magician"),
  },
  THE_HIGH_PRIESTESS: {
    type: "major",
    aliases: TAROT_MAJOR_ARKANNUS_ALIASES.THE_HIGH_PRIESTESS,
    keywords: TAROT_MAJOR_ARKANNUS_KEYWORDS.THE_HIGH_PRIESTESS,
    keywordsPt: TAROT_MAJOR_ARKANNUS_KEYWORDS_PT.THE_HIGH_PRIESTESS,
    descriptiveData: getEnglishTarotDeckDescriptions("02_the_high_priestess"),
  },
  THE_EMPRESS: {
    type: "major",
    aliases: TAROT_MAJOR_ARKANNUS_ALIASES.THE_EMPRESS,
    keywords: TAROT_MAJOR_ARKANNUS_KEYWORDS.THE_EMPRESS,
    keywordsPt: TAROT_MAJOR_ARKANNUS_KEYWORDS_PT.THE_EMPRESS,
    descriptiveData: getEnglishTarotDeckDescriptions("03_the_empress"),
  },
  THE_EMPEROR: {
    type: "major",
    aliases: TAROT_MAJOR_ARKANNUS_ALIASES.THE_EMPEROR,
    keywords: TAROT_MAJOR_ARKANNUS_KEYWORDS.THE_EMPEROR,
    keywordsPt: TAROT_MAJOR_ARKANNUS_KEYWORDS_PT.THE_EMPEROR,
    descriptiveData: getEnglishTarotDeckDescriptions("04_the_emperor"),
  },
  THE_HIEROPHANT: {
    type: "major",
    aliases: TAROT_MAJOR_ARKANNUS_ALIASES.THE_HIEROPHANT,
    keywords: TAROT_MAJOR_ARKANNUS_KEYWORDS.THE_HIEROPHANT,
    keywordsPt: TAROT_MAJOR_ARKANNUS_KEYWORDS_PT.THE_HIEROPHANT,
    descriptiveData: getEnglishTarotDeckDescriptions("05_the_hierophant"),
  },
  THE_LOVER: {
    type: "major",
    aliases: TAROT_MAJOR_ARKANNUS_ALIASES.THE_LOVER,
    keywords: TAROT_MAJOR_ARKANNUS_KEYWORDS.THE_LOVER,
    keywordsPt: TAROT_MAJOR_ARKANNUS_KEYWORDS_PT.THE_LOVER,
    descriptiveData: getEnglishTarotDeckDescriptions("06_the_lover"),
  },
  THE_CHARIOT: {
    type: "major",
    aliases: TAROT_MAJOR_ARKANNUS_ALIASES.THE_CHARIOT,
    keywords: TAROT_MAJOR_ARKANNUS_KEYWORDS.THE_CHARIOT,
    keywordsPt: TAROT_MAJOR_ARKANNUS_KEYWORDS_PT.THE_CHARIOT,
    descriptiveData: getEnglishTarotDeckDescriptions("07_the_chariot"),
  },
  JUSTICE: {
    type: "major",
    aliases: TAROT_MAJOR_ARKANNUS_ALIASES.JUSTICE,
    keywords: TAROT_MAJOR_ARKANNUS_KEYWORDS.JUSTICE,
    keywordsPt: TAROT_MAJOR_ARKANNUS_KEYWORDS_PT.JUSTICE,
    descriptiveData: getEnglishTarotDeckDescriptions("08_justice"),
  },
  THE_HERMIT: {
    type: "major",
    aliases: TAROT_MAJOR_ARKANNUS_ALIASES.THE_HERMIT,
    keywords: TAROT_MAJOR_ARKANNUS_KEYWORDS.THE_HERMIT,
    keywordsPt: TAROT_MAJOR_ARKANNUS_KEYWORDS_PT.THE_HERMIT,
    descriptiveData: getEnglishTarotDeckDescriptions("09_the_hermit"),
  },
  THE_WHEEL_OF_FORTUNE: {
    type: "major",
    aliases: TAROT_MAJOR_ARKANNUS_ALIASES.THE_WHEEL_OF_FORTUNE,
    keywords: TAROT_MAJOR_ARKANNUS_KEYWORDS.THE_WHEEL_OF_FORTUNE,
    keywordsPt: TAROT_MAJOR_ARKANNUS_KEYWORDS_PT.THE_WHEEL_OF_FORTUNE,
    descriptiveData: getEnglishTarotDeckDescriptions("10_the_wheel_of_fortune"),
  },
  STRENGTH: {
    type: "major",
    aliases: TAROT_MAJOR_ARKANNUS_ALIASES.STRENGTH,
    keywords: TAROT_MAJOR_ARKANNUS_KEYWORDS.STRENGTH,
    keywordsPt: TAROT_MAJOR_ARKANNUS_KEYWORDS_PT.STRENGTH,
    descriptiveData: getEnglishTarotDeckDescriptions("11_strength"),
  },
  THE_HANGED_MAN: {
    type: "major",
    aliases: TAROT_MAJOR_ARKANNUS_ALIASES.THE_HANGED_MAN,
    keywords: TAROT_MAJOR_ARKANNUS_KEYWORDS.THE_HANGED_MAN,
    keywordsPt: TAROT_MAJOR_ARKANNUS_KEYWORDS_PT.THE_HANGED_MAN,
    descriptiveData: getEnglishTarotDeckDescriptions("12_the_hanged_man"),
  },
  DEATH: {
    type: "major",
    aliases: TAROT_MAJOR_ARKANNUS_ALIASES.DEATH,
    keywords: TAROT_MAJOR_ARKANNUS_KEYWORDS.DEATH,
    keywordsPt: TAROT_MAJOR_ARKANNUS_KEYWORDS_PT.DEATH,
    descriptiveData: getEnglishTarotDeckDescriptions("13_death"),
  },
  TEMPERANCE: {
    type: "major",
    aliases: TAROT_MAJOR_ARKANNUS_ALIASES.TEMPERANCE,
    keywords: TAROT_MAJOR_ARKANNUS_KEYWORDS.TEMPERANCE,
    keywordsPt: TAROT_MAJOR_ARKANNUS_KEYWORDS_PT.TEMPERANCE,
    descriptiveData: getEnglishTarotDeckDescriptions("14_temperance"),
  },
  THE_DEVIL: {
    type: "major",
    aliases: TAROT_MAJOR_ARKANNUS_ALIASES.THE_DEVIL,
    keywords: TAROT_MAJOR_ARKANNUS_KEYWORDS.THE_DEVIL,
    keywordsPt: TAROT_MAJOR_ARKANNUS_KEYWORDS_PT.THE_DEVIL,
    descriptiveData: getEnglishTarotDeckDescriptions("15_the_devil"),
  },
  THE_TOWER: {
    type: "major",
    aliases: TAROT_MAJOR_ARKANNUS_ALIASES.THE_TOWER,
    keywords: TAROT_MAJOR_ARKANNUS_KEYWORDS.THE_TOWER,
    keywordsPt: TAROT_MAJOR_ARKANNUS_KEYWORDS_PT.THE_TOWER,
    descriptiveData: getEnglishTarotDeckDescriptions("16_the_house_of_god"),
  },
  THE_STAR: {
    type: "major",
    aliases: TAROT_MAJOR_ARKANNUS_ALIASES.THE_STAR,
    keywords: TAROT_MAJOR_ARKANNUS_KEYWORDS.THE_STAR,
    keywordsPt: TAROT_MAJOR_ARKANNUS_KEYWORDS_PT.THE_STAR,
    descriptiveData: getEnglishTarotDeckDescriptions("17_the_star"),
  },
  THE_MOON: {
    type: "major",
    aliases: TAROT_MAJOR_ARKANNUS_ALIASES.THE_MOON,
    keywords: TAROT_MAJOR_ARKANNUS_KEYWORDS.THE_MOON,
    keywordsPt: TAROT_MAJOR_ARKANNUS_KEYWORDS_PT.THE_MOON,
    descriptiveData: getEnglishTarotDeckDescriptions("18_the_moon"),
  },
  THE_SUN: {
    type: "major",
    aliases: TAROT_MAJOR_ARKANNUS_ALIASES.THE_SUN,
    keywords: TAROT_MAJOR_ARKANNUS_KEYWORDS.THE_SUN,
    keywordsPt: TAROT_MAJOR_ARKANNUS_KEYWORDS_PT.THE_SUN,
    descriptiveData: getEnglishTarotDeckDescriptions("19_the_sun"),
  },
  JUDGMENT: {
    type: "major",
    aliases: TAROT_MAJOR_ARKANNUS_ALIASES.JUDGMENT,
    keywords: TAROT_MAJOR_ARKANNUS_KEYWORDS.JUDGMENT,
    keywordsPt: TAROT_MAJOR_ARKANNUS_KEYWORDS_PT.JUDGMENT,
    descriptiveData: getEnglishTarotDeckDescriptions("20_judgement"),
  },
  THE_FOOL: {
    type: "major",
    aliases: TAROT_MAJOR_ARKANNUS_ALIASES.THE_FOOL,
    keywords: TAROT_MAJOR_ARKANNUS_KEYWORDS.THE_FOOL,
    keywordsPt: TAROT_MAJOR_ARKANNUS_KEYWORDS_PT.THE_FOOL,
    descriptiveData: getEnglishTarotDeckDescriptions("21_the_fool"),
  },
  THE_WORLD: {
    type: "major",
    aliases: TAROT_MAJOR_ARKANNUS_ALIASES.THE_WORLD,
    keywords: TAROT_MAJOR_ARKANNUS_KEYWORDS.THE_WORLD,
    keywordsPt: TAROT_MAJOR_ARKANNUS_KEYWORDS_PT.THE_WORLD,
    descriptiveData: getEnglishTarotDeckDescriptions("22_the_world"),
  },
  KING_OF_WANDS: {
    type: "court",
    suit: TAROT_SUITS.WANDS,
    descriptiveData: getEnglishTarotDeckDescriptions("king_wands"),
  },
  QUEEN_OF_WANDS: {
    type: "court",
    suit: TAROT_SUITS.WANDS,
    descriptiveData: getEnglishTarotDeckDescriptions("queen_wands"),
  },
  KNIGHT_OF_WANDS: {
    type: "court",
    suit: TAROT_SUITS.WANDS,
    descriptiveData: getEnglishTarotDeckDescriptions("knight_wands"),
  },
  PAGE_OF_WANDS: {
    type: "court",
    suit: TAROT_SUITS.WANDS,
    descriptiveData: getEnglishTarotDeckDescriptions("page_wands"),
  },
  ACE_OF_WANDS: {
    type: "minor",
    suit: TAROT_SUITS.WANDS,
    descriptiveData: getEnglishTarotDeckDescriptions("ace_wands"),
  },
  TWO_OF_WANDS: {
    type: "minor",
    suit: TAROT_SUITS.WANDS,
    descriptiveData: getEnglishTarotDeckDescriptions("2_wands"),
  },
  THREE_OF_WANDS: {
    type: "minor",
    suit: TAROT_SUITS.WANDS,
    descriptiveData: getEnglishTarotDeckDescriptions("3_wands"),
  },
  FOUR_OF_WANDS: {
    type: "minor",
    suit: TAROT_SUITS.WANDS,
    descriptiveData: getEnglishTarotDeckDescriptions("4_wands"),
  },
  FIVE_OF_WANDS: {
    type: "minor",
    suit: TAROT_SUITS.WANDS,
    descriptiveData: getEnglishTarotDeckDescriptions("5_wands"),
  },
  SIX_OF_WANDS: {
    type: "minor",
    suit: TAROT_SUITS.WANDS,
    descriptiveData: getEnglishTarotDeckDescriptions("6_wands"),
  },
  SEVEN_OF_WANDS: {
    type: "minor",
    suit: TAROT_SUITS.WANDS,
    descriptiveData: getEnglishTarotDeckDescriptions("7_wands"),
  },
  EIGHT_OF_WANDS: {
    type: "minor",
    suit: TAROT_SUITS.WANDS,
    descriptiveData: getEnglishTarotDeckDescriptions("8_wands"),
  },
  NINE_OF_WANDS: {
    type: "minor",
    suit: TAROT_SUITS.WANDS,
    descriptiveData: getEnglishTarotDeckDescriptions("9_wands"),
  },
  TEN_OF_WANDS: {
    type: "minor",
    suit: TAROT_SUITS.WANDS,
    descriptiveData: getEnglishTarotDeckDescriptions("10_wands"),
  },
  KING_OF_CUPS: {
    type: "court",
    suit: TAROT_SUITS.CUPS,
    descriptiveData: getEnglishTarotDeckDescriptions("king_cups"),
  },
  QUEEN_OF_CUPS: {
    type: "court",
    suit: TAROT_SUITS.CUPS,
    descriptiveData: getEnglishTarotDeckDescriptions("queen_cups"),
  },
  KNIGHT_OF_CUPS: {
    type: "court",
    suit: TAROT_SUITS.CUPS,
    descriptiveData: getEnglishTarotDeckDescriptions("knight_cups"),
  },
  PAGE_OF_CUPS: {
    type: "court",
    suit: TAROT_SUITS.CUPS,
    descriptiveData: getEnglishTarotDeckDescriptions("page_cups"),
  },
  ACE_OF_CUPS: {
    type: "minor",
    suit: TAROT_SUITS.CUPS,
    descriptiveData: getEnglishTarotDeckDescriptions("ace_cups"),
  },
  TWO_OF_CUPS: {
    type: "minor",
    suit: TAROT_SUITS.CUPS,
    descriptiveData: getEnglishTarotDeckDescriptions("2_cups"),
  },
  THREE_OF_CUPS: {
    type: "minor",
    suit: TAROT_SUITS.CUPS,
    descriptiveData: getEnglishTarotDeckDescriptions("3_cups"),
  },
  FOUR_OF_CUPS: {
    type: "minor",
    suit: TAROT_SUITS.CUPS,
    descriptiveData: getEnglishTarotDeckDescriptions("4_cups"),
  },
  FIVE_OF_CUPS: {
    type: "minor",
    suit: TAROT_SUITS.CUPS,
    descriptiveData: getEnglishTarotDeckDescriptions("5_cups"),
  },
  SIX_OF_CUPS: {
    type: "minor",
    suit: TAROT_SUITS.CUPS,
    descriptiveData: getEnglishTarotDeckDescriptions("6_cups"),
  },
  SEVEN_OF_CUPS: {
    type: "minor",
    suit: TAROT_SUITS.CUPS,
    descriptiveData: getEnglishTarotDeckDescriptions("7_cups"),
  },
  EIGHT_OF_CUPS: {
    type: "minor",
    suit: TAROT_SUITS.CUPS,
    descriptiveData: getEnglishTarotDeckDescriptions("8_cups"),
  },
  NINE_OF_CUPS: {
    type: "minor",
    suit: TAROT_SUITS.CUPS,
    descriptiveData: getEnglishTarotDeckDescriptions("9_cups"),
  },
  TEN_OF_CUPS: {
    type: "minor",
    suit: TAROT_SUITS.CUPS,
    descriptiveData: getEnglishTarotDeckDescriptions("10_cups"),
  },
  KING_OF_SWORDS: {
    type: "court",
    suit: TAROT_SUITS.SWORDS,
    descriptiveData: getEnglishTarotDeckDescriptions("king_swords"),
  },
  QUEEN_OF_SWORDS: {
    type: "court",
    suit: TAROT_SUITS.SWORDS,
    descriptiveData: getEnglishTarotDeckDescriptions("queen_swords"),
  },
  KNIGHT_OF_SWORDS: {
    type: "court",
    suit: TAROT_SUITS.SWORDS,
    descriptiveData: getEnglishTarotDeckDescriptions("knight_swords"),
  },
  PAGE_OF_SWORDS: {
    type: "court",
    suit: TAROT_SUITS.SWORDS,
    descriptiveData: getEnglishTarotDeckDescriptions("page_swords"),
  },
  ACE_OF_SWORDS: {
    type: "minor",
    suit: TAROT_SUITS.SWORDS,
    descriptiveData: getEnglishTarotDeckDescriptions("ace_swords"),
  },
  TWO_OF_SWORDS: {
    type: "minor",
    suit: TAROT_SUITS.SWORDS,
    descriptiveData: getEnglishTarotDeckDescriptions("2_swords"),
  },
  THREE_OF_SWORDS: {
    type: "minor",
    suit: TAROT_SUITS.SWORDS,
    descriptiveData: getEnglishTarotDeckDescriptions("3_swords"),
  },
  FOUR_OF_SWORDS: {
    type: "minor",
    suit: TAROT_SUITS.SWORDS,
    descriptiveData: getEnglishTarotDeckDescriptions("4_swords"),
  },
  FIVE_OF_SWORDS: {
    type: "minor",
    suit: TAROT_SUITS.SWORDS,
    descriptiveData: getEnglishTarotDeckDescriptions("5_swords"),
  },
  SIX_OF_SWORDS: {
    type: "minor",
    suit: TAROT_SUITS.SWORDS,
    descriptiveData: getEnglishTarotDeckDescriptions("6_swords"),
  },
  SEVEN_OF_SWORDS: {
    type: "minor",
    suit: TAROT_SUITS.SWORDS,
    descriptiveData: getEnglishTarotDeckDescriptions("7_swords"),
  },
  EIGHT_OF_SWORDS: {
    type: "minor",
    suit: TAROT_SUITS.SWORDS,
    descriptiveData: getEnglishTarotDeckDescriptions("8_swords"),
  },
  NINE_OF_SWORDS: {
    type: "minor",
    suit: TAROT_SUITS.SWORDS,
    descriptiveData: getEnglishTarotDeckDescriptions("9_swords"),
  },
  TEN_OF_SWORDS: {
    type: "minor",
    suit: TAROT_SUITS.SWORDS,
    descriptiveData: getEnglishTarotDeckDescriptions("10_swords"),
  },
  KING_OF_PENTACLES: {
    type: "court",
    suit: TAROT_SUITS.PENTACLES,
    descriptiveData: getEnglishTarotDeckDescriptions("king_pentacles"),
  },
  QUEEN_OF_PENTACLES: {
    type: "court",
    suit: TAROT_SUITS.PENTACLES,
    descriptiveData: getEnglishTarotDeckDescriptions("queen_pentacles"),
  },
  KNIGHT_OF_PENTACLES: {
    type: "court",
    suit: TAROT_SUITS.PENTACLES,
    descriptiveData: getEnglishTarotDeckDescriptions("knight_pentacles"),
  },
  PAGE_OF_PENTACLES: {
    type: "court",
    suit: TAROT_SUITS.PENTACLES,
    descriptiveData: getEnglishTarotDeckDescriptions("page_pentacles"),
  },
  ACE_OF_PENTACLES: {
    type: "minor",
    suit: TAROT_SUITS.PENTACLES,
    descriptiveData: getEnglishTarotDeckDescriptions("ace_pentacles"),
  },
  TWO_OF_PENTACLES: {
    type: "minor",
    suit: TAROT_SUITS.PENTACLES,
    descriptiveData: getEnglishTarotDeckDescriptions("2_pentacles"),
  },
  THREE_OF_PENTACLES: {
    type: "minor",
    suit: TAROT_SUITS.PENTACLES,
    descriptiveData: getEnglishTarotDeckDescriptions("3_pentacles"),
  },
  FOUR_OF_PENTACLES: {
    type: "minor",
    suit: TAROT_SUITS.PENTACLES,
    descriptiveData: getEnglishTarotDeckDescriptions("4_pentacles"),
  },
  FIVE_OF_PENTACLES: {
    type: "minor",
    suit: TAROT_SUITS.PENTACLES,
    descriptiveData: getEnglishTarotDeckDescriptions("5_pentacles"),
  },
  SIX_OF_PENTACLES: {
    type: "minor",
    suit: TAROT_SUITS.PENTACLES,
    descriptiveData: getEnglishTarotDeckDescriptions("6_pentacles"),
  },
  SEVEN_OF_PENTACLES: {
    type: "minor",
    suit: TAROT_SUITS.PENTACLES,
    descriptiveData: getEnglishTarotDeckDescriptions("7_pentacles"),
  },
  EIGHT_OF_PENTACLES: {
    type: "minor",
    suit: TAROT_SUITS.PENTACLES,
    descriptiveData: getEnglishTarotDeckDescriptions("8_pentacles"),
  },
  NINE_OF_PENTACLES: {
    type: "minor",
    suit: TAROT_SUITS.PENTACLES,
    descriptiveData: getEnglishTarotDeckDescriptions("9_pentacles"),
  },
  TEN_OF_PENTACLES: {
    type: "minor",
    suit: TAROT_SUITS.PENTACLES,
    descriptiveData: getEnglishTarotDeckDescriptions("10_pentacles"),
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
