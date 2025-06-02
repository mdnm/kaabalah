export type NodeId = string;

export type NodeType = "sphere" | "path" | "world" | "number" | "planet" | "westernZodiacSign" | "westernElement" | "color" | "tarotArkAnnu" | "tarotSuit" | "musicalNote" | "hebrewLetter" | "latinLetter" | "sanskritLetter" | "archeometerLetter" | "chakra" | "subtleBody" | "uncategorized";

export type NodeData<NodeType> = NodeType extends "sphere" ? SphereData : NodeType extends "path" ? PathData : NodeType extends "world" ? WorldData : NodeType extends "hebrewLetter" ? HebrewLetterData : NodeType extends "color" ? ColorData : NodeType extends "musicalNote" ? MusicalNoteData : NodeType extends "westernZodiacSign" ? WesternZodiacSignData : NodeType extends "tarotArkAnnu" ? TarotArkAnnuData : never;

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
  // TODO: add magical images
  magicalImage?: string;
} & Partial<HermeticQabalahSphereData>;

export type PathData = {
  meaning?: string;
}

export type WorldData = {
  element: "fire" | "air" | "water" | "earth";
  hebrewName: string;
  englishName: string;
}

export type HebrewLetterData = {
  type: "mother" | "double" | "simple";
  transliteration: string;
  gematriaValue: number;
  gematriaValueWhenEnding?: number;
  symbol: string;
  hieroglyph: string;
  yvritMeaning: string;
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

export type WesternZodiacSignData = {
  element: Exclude<typeof WESTERN_ELEMENTS[keyof typeof WESTERN_ELEMENTS], "Ether">;
  type: "cardinal" | "fixed" | "mutable";
  rulingPlanets: Array<Exclude<typeof PLANETS[keyof typeof PLANETS], "Earth">>;
}

export type TarotArkAnnuData = {
  type: "major" | "minor" | "court";
  suit?: typeof TAROT_SUITS[keyof typeof TAROT_SUITS];
  descriptiveData: {
    deck: string;
    name?: string;
    meaning?: string;
    reversedMeaning?: string;
    keywords?: string[];
  }[]
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
  KETHER: { hebrewName: "כתר", englishName: "Crown" },
  CHOKMAH: { hebrewName: "חכמה", englishName: "Wisdom" },
  BINAH: { hebrewName: "בינה", englishName: "Understanding" },
  CHESED: { hebrewName: "חסד", englishName: "Mercy" },
  GEBURAH: { hebrewName: "גבורה", englishName: "Severity" },
  TIPHERETH: { hebrewName: "תפארת", englishName: "Beauty" },
  NETZACH: { hebrewName: "נצח", englishName: "Victory" },
  HOD: { hebrewName: "הוד", englishName: "Splendor" },
  YESOD: { hebrewName: "יסוד", englishName: "Foundation" },
  MALKUTH: { hebrewName: "מלכות", englishName: "Kingdom" },
  DAATH: { hebrewName: "דעת", englishName: "Knowledge" },
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

export const WESTERN_ZODIAC_SIGNS_DATA: Record<keyof typeof WESTERN_ZODIAC_SIGNS, NodeData<"westernZodiacSign">> = {
  ARIES: { element: WESTERN_ELEMENTS.FIRE, type: "cardinal", rulingPlanets: [PLANETS.MARS] },
  TAURUS: { element: WESTERN_ELEMENTS.EARTH, type: "fixed", rulingPlanets: [PLANETS.VENUS] },
  GEMINI: { element: WESTERN_ELEMENTS.AIR, type: "mutable", rulingPlanets: [PLANETS.MERCURY] },
  CANCER: { element: WESTERN_ELEMENTS.WATER, type: "cardinal", rulingPlanets: [PLANETS.MOON] },
  LEO: { element: WESTERN_ELEMENTS.FIRE, type: "fixed", rulingPlanets: [PLANETS.SUN] },
  VIRGO: { element: WESTERN_ELEMENTS.EARTH, type: "mutable", rulingPlanets: [PLANETS.MERCURY] },
  LIBRA: { element: WESTERN_ELEMENTS.AIR, type: "cardinal", rulingPlanets: [PLANETS.VENUS] },
  SCORPIO: { element: WESTERN_ELEMENTS.WATER, type: "fixed", rulingPlanets: [PLANETS.MARS, PLANETS.PLUTO] },
  SAGITTARIUS: { element: WESTERN_ELEMENTS.FIRE, type: "mutable", rulingPlanets: [PLANETS.JUPITER] },
  CAPRICORN: { element: WESTERN_ELEMENTS.EARTH, type: "cardinal", rulingPlanets: [PLANETS.SATURN] },
  AQUARIUS: { element: WESTERN_ELEMENTS.AIR, type: "fixed", rulingPlanets: [PLANETS.SATURN, PLANETS.URANUS] },
  PISCES: { element: WESTERN_ELEMENTS.WATER, type: "mutable", rulingPlanets: [PLANETS.JUPITER, PLANETS.NEPTUNE] },
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
  PH: "Ph",
  TS: "Ts",
  TZ: "Tz",
  TH: "Th",
  CH: "Ch",
  SH: "Sh",
  KH: "Kh",
  Ç: "Ç",
  Ã: "Ã"
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

export const HEBREW_LETTERS_DATA: Record<keyof typeof HEBREW_LETTERS, NodeData<"hebrewLetter">> = {
  ALEPH: { gematriaValue: 1, type: "mother", symbol: "Man", hieroglyph: "Unity, central point, abstract principle", yvritMeaning: "Universal man and the human gender", transliteration: "Aleph" },
  BETH: { gematriaValue: 2, type: "double", symbol: "Mouth", hieroglyph: "Woman's duality", yvritMeaning: "Man's mouth, habitation, interior", transliteration: "Beth" },
  GIMEL: { gematriaValue: 3, type: "double", symbol: "Grasping hand", hieroglyph: "Expansion and growth", yvritMeaning: "Man's throat, channel", transliteration: "Gimel" },
  DALET: { gematriaValue: 4, type: "double", symbol: "Breast", hieroglyph: "Universal quaternary, source of physical existence", yvritMeaning: "Abundance and nourishment", transliteration: "Daleth" },
  HE: { gematriaValue: 5, type: "simple", symbol: "Breath", hieroglyph: "Universal life, men's breath, the breath, everything that animates and vivifies", yvritMeaning: "Window", transliteration: "He" },
  VAV: { gematriaValue: 6, type: "simple", symbol: "Eye, ear", hieroglyph: "A point connection that separates being and non-being", yvritMeaning: "Construction nail", transliteration: "Vav" },
  ZAYIN: { gematriaValue: 7, type: "simple", symbol: "Arrow", hieroglyph: "Goal, objective to achieve", yvritMeaning: "Dart, sword", transliteration: "Zayin" },
  HET: { gematriaValue: 8, type: "simple", symbol: "Field", hieroglyph: "Elemental existence", yvritMeaning: "Fence", transliteration: "Het" },
  TET: { gematriaValue: 9, type: "simple", symbol: "A house covering", hieroglyph: "Men's shelter, roof, shield, protection, resistance", yvritMeaning: "Serpent", transliteration: "Tet" },
  YOD: { gematriaValue: 10, type: "simple", symbol: "Index finger", hieroglyph: "Potential manifestation, eternal worship", yvritMeaning: "Hand, index finger", transliteration: "Yod" },
  KAF: { gematriaValue: 20, type: "double", gematriaValueWhenEnding: 500, symbol: "Closing hand", hieroglyph: "Reflective and fleeting life", yvritMeaning: "Palm closing in the act of grasping something", transliteration: "Kaf" },
  LAMED: { gematriaValue: 30, type: "simple", symbol: "Extending arm", hieroglyph: "Extension, elevation", yvritMeaning: "Sting rod, human arm representing extension, elevation", transliteration: "Lamed" },
  MEM: { gematriaValue: 40, type: "mother", gematriaValueWhenEnding: 600, symbol: "Woman", hieroglyph: "External passive action, all formative and plastic principle when starting a word, collectiveness when ending one", yvritMeaning: "Waters, woman, mother, man's companion", transliteration: "Mem" },
  NUN: { gematriaValue: 50, type: "simple", gematriaValueWhenEnding: 700, symbol: "Fruit", hieroglyph: "Novelty, youth, grace, beauty", yvritMeaning: "Fish", transliteration: "Nun" },
  SAMEKH: { gematriaValue: 60, type: "simple", symbol: "Serpent", hieroglyph: "Cyclical circular movement", yvritMeaning: "Support, brace, crutch", transliteration: "Samekh" },
  AIN: { gematriaValue: 70, type: "simple", symbol: "Binding", hieroglyph: "Material side of things, emptiness, nothingness, all evil", yvritMeaning: "Eye", transliteration: "Ain" },
  PE: { gematriaValue: 80, type: "double", gematriaValueWhenEnding: 800, symbol: "Mouth, tongue", hieroglyph: "Power of the verb, spoken word", yvritMeaning: "Mouth releasing", transliteration: "Pe" },
  TSADI: { gematriaValue: 90, type: "simple", gematriaValueWhenEnding: 900, symbol: "Roof", hieroglyph: "Fixed thought upon a purpose", yvritMeaning: "Fishhook", transliteration: "Tsadi" },
  QOF: { gematriaValue: 100, type: "simple", symbol: "Axe", hieroglyph: "Repressive pressure", yvritMeaning: "Back of the head", transliteration: "Qof" },
  RESH: { gematriaValue: 200, type: "double", symbol: "Head", hieroglyph: "Feeling, wanting, thinking, movement, reflection, origin, repetition", yvritMeaning: "Illuminated head", transliteration: "Resh" },
  SHIN: { gematriaValue: 300, type: "mother", symbol: "Crown", hieroglyph: "Relative duration, existence", yvritMeaning: "Part of the bow from which the arrow is released", transliteration: "Shin" },
  TAV: { gematriaValue: 400, type: "double", symbol: "Thorax", hieroglyph: "Universal soul, reciprocity, protection, perfection, abundance", yvritMeaning: "Ankh Cross", transliteration: "Tav" },
}

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
  ACE_OF_WANDS: "Ace of Wands",
  TWO_OF_WANDS: "Two of Wands",
  THREE_OF_WANDS: "Three of Wands",
  FOUR_OF_WANDS: "Four of Wands",
  FIVE_OF_WANDS: "Five of Wands",
  SIX_OF_WANDS: "Six of Wands",
  SEVEN_OF_WANDS: "Seven of Wands",
  EIGHT_OF_WANDS: "Eight of Wands",
  NINE_OF_WANDS: "Nine of Wands",
  TEN_OF_WANDS: "Ten of Wands",
  KING_OF_CUPS: "King of Cups",
  QUEEN_OF_CUPS: "Queen of Cups",
  KNIGHT_OF_CUPS: "Knight of Cups",
  PAGE_OF_CUPS: "Page of Cups",
  ACE_OF_CUPS: "Ace of Cups",
  TWO_OF_CUPS: "Two of Cups",
  THREE_OF_CUPS: "Three of Cups",
  FOUR_OF_CUPS: "Four of Cups",
  FIVE_OF_CUPS: "Five of Cups",
  SIX_OF_CUPS: "Six of Cups",
  SEVEN_OF_CUPS: "Seven of Cups",
  EIGHT_OF_CUPS: "Eight of Cups",
  NINE_OF_CUPS: "Nine of Cups",
  TEN_OF_CUPS: "Ten of Cups",
  KING_OF_SWORDS: "King of Swords",
  QUEEN_OF_SWORDS: "Queen of Swords",
  KNIGHT_OF_SWORDS: "Knight of Swords",
  PAGE_OF_SWORDS: "Page of Swords",
  ACE_OF_SWORDS: "Ace of Swords",
  TWO_OF_SWORDS: "Two of Swords",
  THREE_OF_SWORDS: "Three of Swords",
  FOUR_OF_SWORDS: "Four of Swords",
  FIVE_OF_SWORDS: "Five of Swords",
  SIX_OF_SWORDS: "Six of Swords",
  SEVEN_OF_SWORDS: "Seven of Swords",
  EIGHT_OF_SWORDS: "Eight of Swords",
  NINE_OF_SWORDS: "Nine of Swords",
  TEN_OF_SWORDS: "Ten of Swords",
  KING_OF_PENTACLES: "King of Pentacles",
  QUEEN_OF_PENTACLES: "Queen of Pentacles",
  KNIGHT_OF_PENTACLES: "Knight of Pentacles",
  PAGE_OF_PENTACLES: "Page of Pentacles",
  ACE_OF_PENTACLES: "Ace of Pentacles",
  TWO_OF_PENTACLES: "Two of Pentacles",
  THREE_OF_PENTACLES: "Three of Pentacles",
  FOUR_OF_PENTACLES: "Four of Pentacles",
  FIVE_OF_PENTACLES: "Five of Pentacles",
  SIX_OF_PENTACLES: "Six of Pentacles",
  SEVEN_OF_PENTACLES: "Seven of Pentacles",
  EIGHT_OF_PENTACLES: "Eight of Pentacles",
  NINE_OF_PENTACLES: "Nine of Pentacles",
  TEN_OF_PENTACLES: "Ten of Pentacles",
} as const;

export const TAROT_ARKANNUS_DATA: Record<keyof typeof TAROT_ARKANNUS, NodeData<"tarotArkAnnu">> = {
  THE_MAGICIAN: { type: "major", descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Abracadabra, the power to create reality through voice" }] },
  THE_HIGH_PRIESTESS: { type: "major", descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Intuition, the power to rewrite your book of life improving your life every instant" }] },
  THE_EMPRESS: { type: "major", descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Adaptation, the power to geometrize through emotions" }] },
  THE_EMPEROR: { type: "major", descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Authority, the power to mark your territory with the sacred fire" }] },
  THE_HIEROPHANT: { type: "major", descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Magnetism, the power to ritualize life and circulate the quintessence" }] },
  THE_LOVER: { type: "major", descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Dichotomy, stay on the middle path by being neither a victim nor a villain" }] },
  THE_CHARIOT: { type: "major", descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Merkaabah, take control and build your merkaabah (mind vehicle)" }] },
  JUSTICE: { type: "major", descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Justice, be just with yourself to be just with others" }] },
  THE_HERMIT: { type: "major", descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Introspection, seek within, retreat" }] },
  THE_WHEEL_OF_FORTUNE: { type: "major", descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Loops, extroversion, break the great wheel and ascend, seek externally" }] },
  STRENGTH: { type: "major", descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "The strength of your subconscious, unity brings strength" }] },
  THE_HANGED_MAN: { type: "major", descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Make valid sacrifices, adopt a new perspective" }] },
  DEATH: { type: "major", descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Merkaabah, take control and build your merkaabah (mind vehicle)" }] },
  TEMPERANCE: { type: "major", descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Balance, harmonize differences" }] },
  THE_DEVIL: { type: "major", descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Indecision between vice and virtue, transmute weakness and passions into strengths" }] },
  THE_TOWER: { type: "major", descriptiveData: [{ name: "The House of God", deck: "Papus Kaabalistic", meaning: "Separation, destruction, separate from what's harmful and connect with what's helpful, make room for the new" }] },
  THE_STAR: { type: "major", descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Fecundation, ecology, ecstasy, hope, renew yourself to maintain help, act according to your spiritual purpose" }] },
  THE_MOON: { type: "major", descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Hidden enemies, be vigilant, recognize where you're self sabotaging" }] },
  THE_SUN: { type: "major", descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Be conscious of your alchemical band, transmute money into knowledge and vice versa" }] },
  JUDGMENT: { type: "major", descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Make retrospectives and learn from mistakes and successes" }] },
  THE_FOOL: { type: "major", descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Stop walking in circles, create connections of knowledge" }] },
  THE_WORLD: { type: "major", descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Win the world, start acting on the world of causes" }] },
  KING_OF_WANDS: { type: "court", suit: TAROT_SUITS.WANDS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Get's the best out of every one, Idealism, Magnanimity" }, { deck: "Kier Egyptian", name: "The Laborer" }] },
  QUEEN_OF_WANDS: { type: "court", suit: TAROT_SUITS.WANDS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Hold the line while the king goes to work, Preserve what was conquered" }, { deck: "Kier Egyptian", name: "The Weaver" }] },
  KNIGHT_OF_WANDS: { type: "court", suit: TAROT_SUITS.WANDS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Dreams that become reality" }, { deck: "Kier Egyptian", name: "The Argonaut" }] },
  PAGE_OF_WANDS: { type: "court", suit: TAROT_SUITS.WANDS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Don't rush, the precipitations are the doors to failure" }, { deck: "Kier Egyptian", name: "The Prodigy" }] },
  ACE_OF_WANDS: { type: "minor", suit: TAROT_SUITS.WANDS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Ignite the flames of ideals, Trust in your inner divinity" }, { deck: "Kier Egyptian", name: "The Unexpected" }] },
  TWO_OF_WANDS: { type: "minor", suit: TAROT_SUITS.WANDS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Formulate a strategy to use your own talents" }, { deck: "Kier Egyptian", name: "Uncertainty" }] },
  THREE_OF_WANDS: { type: "minor", suit: TAROT_SUITS.WANDS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Keep going despite losing something apparently important" }, { deck: "Kier Egyptian", name: "Domesticity" }] },
  FOUR_OF_WANDS: { type: "minor", suit: TAROT_SUITS.WANDS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Work in teams" }, { deck: "Kier Egyptian", name: "Exchange" }] },
  FIVE_OF_WANDS: { type: "minor", suit: TAROT_SUITS.WANDS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Strengthen the root chakra, overcome internal fears" }, { deck: "Kier Egyptian", name: "Impediment" }] },
  SIX_OF_WANDS: { type: "minor", suit: TAROT_SUITS.WANDS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "External victory, internal lack of internal self realization" }, { deck: "Kier Egyptian", name: "Magnificence" }] },
  SEVEN_OF_WANDS: { type: "minor", suit: TAROT_SUITS.WANDS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Face competitors in an ethical and loyal way" }, { deck: "Kier Egyptian", name: "Alliance" }] },
  EIGHT_OF_WANDS: { type: "minor", suit: TAROT_SUITS.WANDS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Travel to the center of peace and intelligence" }, { deck: "Kier Egyptian", name: "Innovation" }] },
  NINE_OF_WANDS: { type: "minor", suit: TAROT_SUITS.WANDS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Obstacle that precedes total victory, gather hidden forces" }, { deck: "Kier Egyptian", name: "Desolation" }] },
  TEN_OF_WANDS: { type: "minor", suit: TAROT_SUITS.WANDS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Get out of apathy, create a new tree of life using the Lightning Path" }, { deck: "Kier Egyptian", name: "Initiation" }] },
  KING_OF_CUPS: { type: "court", suit: TAROT_SUITS.CUPS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Stop hurting yourself (related to The Lover), heals everyone and forgets about yourself, balm for your own wound" }, { deck: "Kier Egyptian", name: "Art and Science" }] },
  QUEEN_OF_CUPS: { type: "court", suit: TAROT_SUITS.CUPS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Work with subtlety, positive challenges" }, { deck: "Kier Egyptian", name: "Duplicity" }] },
  KNIGHT_OF_CUPS: { type: "court", suit: TAROT_SUITS.CUPS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Alternative healing" }, { deck: "Kier Egyptian", name: "Testimony" }] },
  PAGE_OF_CUPS: { type: "court", suit: TAROT_SUITS.CUPS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Increase of self-esteem, emotional courage" }, { deck: "Kier Egyptian", name: "Premonition" }] },
  ACE_OF_CUPS: { type: "minor", suit: TAROT_SUITS.CUPS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Renewal or new affection, alternative treatment for health" }, { deck: "Kier Egyptian", name: "Dissension" }] },
  TWO_OF_CUPS: { type: "minor", suit: TAROT_SUITS.CUPS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Do not poison yourself or the other person" }, { deck: "Kier Egyptian", name: "Preeminence" }] },
  THREE_OF_CUPS: { type: "minor", suit: TAROT_SUITS.CUPS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Harmony between instinct and emotion, Be discreet" }, { deck: "Kier Egyptian", name: "Premonition" }] },
  FOUR_OF_CUPS: { type: "minor", suit: TAROT_SUITS.CUPS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Abundance in emotional life, do not listen to slander" }, { deck: "Kier Egyptian", name: "Expressiveness" }] },
  FIVE_OF_CUPS: { type: "minor", suit: TAROT_SUITS.CUPS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Do not break your spiritual commitment (your purpose)" }, { deck: "Kier Egyptian", name: "Regeneration" }] },
  SIX_OF_CUPS: { type: "minor", suit: TAROT_SUITS.CUPS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Do not have self-pity" }, { deck: "Kier Egyptian", name: "Patrimony" }] },
  SEVEN_OF_CUPS: { type: "minor", suit: TAROT_SUITS.CUPS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Gestations, related to The Star" }, { deck: "Kier Egyptian", name: "Conjecture" }] },
  EIGHT_OF_CUPS: { type: "minor", suit: TAROT_SUITS.CUPS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Reflect on your emotional life after 18 hours" }, { deck: "Kier Egyptian", name: "Consummation" }] },
  NINE_OF_CUPS: { type: "minor", suit: TAROT_SUITS.CUPS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Reconciliations and forgiveness" }, { deck: "Kier Egyptian", name: "Versatility" }] },
  TEN_OF_CUPS: { type: "minor", suit: TAROT_SUITS.CUPS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Marriage of the spirit with the soul, Alchemical Weddings" }, { deck: "Kier Egyptian", name: "Attraction" }] },
  KING_OF_SWORDS: { type: "court", suit: TAROT_SUITS.SWORDS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Actions of victorious strategies" }, { deck: "Kier Egyptian", name: "Advice" }] },
  QUEEN_OF_SWORDS: { type: "court", suit: TAROT_SUITS.SWORDS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Supremacy of the feminine, related to Justice" }, { deck: "Kier Egyptian", name: "Premeditation" }] },
  KNIGHT_OF_SWORDS: { type: "court", suit: TAROT_SUITS.SWORDS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Joint victorious actions" }, { deck: "Kier Egyptian", name: "Hostility" }] },
  PAGE_OF_SWORDS: { type: "court", suit: TAROT_SUITS.SWORDS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Follow your intuition" }, { deck: "Kier Egyptian", name: "Examination" }] },
  ACE_OF_SWORDS: { type: "minor", suit: TAROT_SUITS.SWORDS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Conflicts before victory" }, { deck: "Kier Egyptian", name: "Contrition" }] },
  TWO_OF_SWORDS: { type: "minor", suit: TAROT_SUITS.SWORDS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Traumas and conflicts to overcome" }, { deck: "Kier Egyptian", name: "Pilgrimage" }] },
  THREE_OF_SWORDS: { type: "minor", suit: TAROT_SUITS.SWORDS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Death of yang, Fire, tendencies to depression" }, { deck: "Kier Egyptian", name: "Rivalry" }] },
  FOUR_OF_SWORDS: { type: "minor", suit: TAROT_SUITS.SWORDS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Reflection, related to The Hermit" }, { deck: "Kier Egyptian", name: "Meditation" }] },
  FIVE_OF_SWORDS: { type: "minor", suit: TAROT_SUITS.SWORDS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Healthy self-challenge, Self-demands" }, { deck: "Kier Egyptian", name: "Revelation" }] },
  SIX_OF_SWORDS: { type: "minor", suit: TAROT_SUITS.SWORDS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "External daily strategies, Future perspectives" }, { deck: "Kier Egyptian", name: "Evolution" }] },
  SEVEN_OF_SWORDS: { type: "minor", suit: TAROT_SUITS.SWORDS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Internal nocturnal strategies, related to The Hermit" }, { deck: "Kier Egyptian", name: "Solitude" }] },
  EIGHT_OF_SWORDS: { type: "minor", suit: TAROT_SUITS.SWORDS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Appeal to superior forces, Internal and external conflicts" }, { deck: "Kier Egyptian", name: "Proscription" }] },
  NINE_OF_SWORDS: { type: "minor", suit: TAROT_SUITS.SWORDS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "The problems being imagined will never happen" }, { deck: "Kier Egyptian", name: "Communion" }] },
  TEN_OF_SWORDS: { type: "minor", suit: TAROT_SUITS.SWORDS, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Death and rebirth, related to Death and The Tower" }, { deck: "Kier Egyptian", name: "Vehemence" }] },
  KING_OF_PENTACLES: { type: "court", suit: TAROT_SUITS.PENTACLES, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Turns everything into gold" }, { deck: "Kier Egyptian", name: "Apprenticeship" }] },
  QUEEN_OF_PENTACLES: { type: "court", suit: TAROT_SUITS.PENTACLES, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Act with diplomacy" }, { deck: "Kier Egyptian", name: "Perplexity" }] },
  KNIGHT_OF_PENTACLES: { type: "court", suit: TAROT_SUITS.PENTACLES, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Invest into new things" }, { deck: "Kier Egyptian", name: "Veneration" }] },
  PAGE_OF_PENTACLES: { type: "court", suit: TAROT_SUITS.PENTACLES, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Prudence in the material life" }, { deck: "Kier Egyptian", name: "Speculation" }] },
  ACE_OF_PENTACLES: { type: "minor", suit: TAROT_SUITS.PENTACLES, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Rebirth through a single material goal, Form clear material goals" }, { deck: "Kier Egyptian", name: "The Unforeseen" }] },
  TWO_OF_PENTACLES: { type: "minor", suit: TAROT_SUITS.PENTACLES, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Light forming shadows, Duality asking for synthesis in the trinity, Don't put all the eggs in the same basket" }, { deck: "Kier Egyptian", name: "Cooperation" }] },
  THREE_OF_PENTACLES: { type: "minor", suit: TAROT_SUITS.PENTACLES, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Light forming sound, Establish balance through the trinity becoming a great dispenser, Verbalize what should be done, Do not settle for the first results" }, { deck: "Kier Egyptian", name: "Avarice" }] },
  FOUR_OF_PENTACLES: { type: "minor", suit: TAROT_SUITS.PENTACLES, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Avoid avarice / greed" }, { deck: "Kier Egyptian", name: "Purification" }] },
  FIVE_OF_PENTACLES: { type: "minor", suit: TAROT_SUITS.PENTACLES, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Only order will bring progress, Do not kick the barn without having something concrete in front of you" }, { deck: "Kier Egyptian", name: "Love and Desire" }] },
  SIX_OF_PENTACLES: { type: "minor", suit: TAROT_SUITS.PENTACLES, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Act with prudence" }, { deck: "Kier Egyptian", name: "Offering" }] },
  SEVEN_OF_PENTACLES: { type: "minor", suit: TAROT_SUITS.PENTACLES, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Don't boast about your proposal or project" }, { deck: "Kier Egyptian", name: "Generosity" }] },
  EIGHT_OF_PENTACLES: { type: "minor", suit: TAROT_SUITS.PENTACLES, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Keep doing what you always did" }, { deck: "Kier Egyptian", name: "The Provider" }] },
  NINE_OF_PENTACLES: { type: "minor", suit: TAROT_SUITS.PENTACLES, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Work with what you like and earn something with it" }, { deck: "Kier Egyptian", name: "Confusion" }] },
  TEN_OF_PENTACLES: { type: "minor", suit: TAROT_SUITS.PENTACLES, descriptiveData: [{ deck: "Papus Kaabalistic", meaning: "Prosperity, Prosperous inheritance" }, { deck: "Kier Egyptian", name: "Rebirth" }] },
}

