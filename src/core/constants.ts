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
  character: string;
  characterWhenEnding?: string;
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

export const SPHERE_DATA: Record<keyof typeof SPHERES, NodeData<"sphere">> = {
  KETHER: { hebrewName: "כתר", englishName: "Crown" },
  CHOKHMAH: { hebrewName: "חכמה", englishName: "Wisdom" },
  BINAH: { hebrewName: "בינה", englishName: "Understanding" },
  CHESED: { hebrewName: "חסד", englishName: "Mercy" },
  GEBURAH: { hebrewName: "גבורה", englishName: "Severity" },
  TIPHARETH: { hebrewName: "תפארת", englishName: "Beauty" },
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
  Ã: "Ã"
} as const;

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

export const HEBREW_LETTERS_DATA: Record<keyof typeof HEBREW_LETTERS, NodeData<"hebrewLetter">> = {
  ALEPH: { gematriaValue: 1, type: "mother", symbol: "Man", hieroglyph: "Unity, central point, abstract principle", yvritMeaning: "Universal man and the human gender", transliteration: "Aleph", character: "א" },
  BETH: { gematriaValue: 2, type: "double", symbol: "Mouth", hieroglyph: "Woman's duality", yvritMeaning: "Man's mouth, habitation, interior", transliteration: "Beth", character: "ב" },
  GIMEL: { gematriaValue: 3, type: "double", symbol: "Grasping hand", hieroglyph: "Expansion and growth", yvritMeaning: "Man's throat, channel", transliteration: "Gimel", character: "ג" },
  DALET: { gematriaValue: 4, type: "double", symbol: "Breast", hieroglyph: "Universal quaternary, source of physical existence", yvritMeaning: "Abundance and nourishment", transliteration: "Dalet", character: "ד" },
  HE: { gematriaValue: 5, type: "simple", symbol: "Breath", hieroglyph: "Universal life, men's breath, the breath, everything that animates and vivifies", yvritMeaning: "Window", transliteration: "He", character: "ה" },
  VAV: { gematriaValue: 6, type: "simple", symbol: "Eye, ear", hieroglyph: "A point connection that separates being and non-being", yvritMeaning: "Construction nail", transliteration: "Vav", character: "ו" },
  ZAYIN: { gematriaValue: 7, type: "simple", symbol: "Arrow", hieroglyph: "Goal, objective to achieve", yvritMeaning: "Dart, sword", transliteration: "Zayin", character: "ז" },
  HET: { gematriaValue: 8, type: "simple", symbol: "Field", hieroglyph: "Elemental existence", yvritMeaning: "Fence", transliteration: "Het", character: "ח" },
  TET: { gematriaValue: 9, type: "simple", symbol: "A house covering", hieroglyph: "Men's shelter, roof, shield, protection, resistance", yvritMeaning: "Serpent", transliteration: "Tet", character: "ט" },
  YOD: { gematriaValue: 10, type: "simple", symbol: "Index finger", hieroglyph: "Potential manifestation, eternal worship", yvritMeaning: "Hand, index finger", transliteration: "Yod", character: "י" },
  KAPH: { gematriaValue: 20, type: "double", gematriaValueWhenEnding: 500, symbol: "Closing hand", hieroglyph: "Reflective and fleeting life", yvritMeaning: "Palm closing in the act of grasping something", transliteration: "Kaph", character: "כ", characterWhenEnding: "ך" },
  LAMED: { gematriaValue: 30, type: "simple", symbol: "Extending arm", hieroglyph: "Extension, elevation", yvritMeaning: "Sting rod, human arm representing extension, elevation", transliteration: "Lamed", character: "ל" },
  MEM: { gematriaValue: 40, type: "mother", gematriaValueWhenEnding: 600, symbol: "Woman", hieroglyph: "External passive action, all formative and plastic principle when starting a word, collectiveness when ending one", yvritMeaning: "Waters, woman, mother, man's companion", transliteration: "Mem", character: "מ", characterWhenEnding: "ם" },
  NUN: { gematriaValue: 50, type: "simple", gematriaValueWhenEnding: 700, symbol: "Fruit", hieroglyph: "Novelty, youth, grace, beauty", yvritMeaning: "Fish", transliteration: "Nun", character: "נ", characterWhenEnding: "ן" },
  SAMEKH: { gematriaValue: 60, type: "simple", symbol: "Serpent", hieroglyph: "Cyclical circular movement", yvritMeaning: "Support, brace, crutch", transliteration: "Samekh", character: "ס" },
  AYIN: { gematriaValue: 70, type: "simple", symbol: "Binding", hieroglyph: "Material side of things, emptiness, nothingness, all evil", yvritMeaning: "Eye", transliteration: "Ayin", character: "ע" },
  PE: { gematriaValue: 80, type: "double", gematriaValueWhenEnding: 800, symbol: "Mouth, tongue", hieroglyph: "Power of the verb, spoken word", yvritMeaning: "Mouth releasing", transliteration: "Pe", character: "פ", characterWhenEnding: "ף" },
  TSADI: { gematriaValue: 90, type: "simple", gematriaValueWhenEnding: 900, symbol: "Roof", hieroglyph: "Fixed thought upon a purpose", yvritMeaning: "Fishhook", transliteration: "Tsadi", character: "צ", characterWhenEnding: "ץ" },
  QOPH: { gematriaValue: 100, type: "simple", symbol: "Axe", hieroglyph: "Repressive pressure", yvritMeaning: "Back of the head", transliteration: "Qoph", character: "ק" },
  RESH: { gematriaValue: 200, type: "double", symbol: "Head", hieroglyph: "Feeling, wanting, thinking, movement, reflection, origin, repetition", yvritMeaning: "Illuminated head", transliteration: "Resh", character: "ר" },
  SHIN: { gematriaValue: 300, type: "mother", symbol: "Crown", hieroglyph: "Relative duration, existence", yvritMeaning: "Part of the bow from which the arrow is released", transliteration: "Shin", character: "ש" },
  TAV: { gematriaValue: 400, type: "double", symbol: "Thorax", hieroglyph: "Universal soul, reciprocity, protection, perfection, abundance", yvritMeaning: "Ankh Cross", transliteration: "Tav", character: "ת" },
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

export const TAROT_DECKS = {
  PAPUS_KAABALISTIC: "Papus Kaabalistic",
  KIER_EGYPTIAN: "Kier Egyptian",
} as const;

export const TAROT_ARKANNUS_DATA: Record<keyof typeof TAROT_ARKANNUS, NodeData<"tarotArkAnnu">> = {
  THE_MAGICIAN: { type: "major", descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Abracadabra, the power to create reality through voice" }] },
  THE_HIGH_PRIESTESS: { type: "major", descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Intuition, the power to rewrite your book of life improving your life every instant" }] },
  THE_EMPRESS: { type: "major", descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Adaptation, the power to geometrize through emotions" }] },
  THE_EMPEROR: { type: "major", descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Authority, the power to mark your territory with the sacred fire" }] },
  THE_HIEROPHANT: { type: "major", descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Magnetism, the power to ritualize life and circulate the quintessence" }] },
  THE_LOVER: { type: "major", descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Dichotomy, stay on the middle path by being neither a victim nor a villain" }] },
  THE_CHARIOT: { type: "major", descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Merkaabah, take control and build your merkaabah (mind vehicle)" }] },
  JUSTICE: { type: "major", descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Justice, be just with yourself to be just with others" }] },
  THE_HERMIT: { type: "major", descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Introspection, seek within, retreat" }] },
  THE_WHEEL_OF_FORTUNE: { type: "major", descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Loops, extroversion, break the great wheel and ascend, seek externally" }] },
  STRENGTH: { type: "major", descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "The strength of your subconscious, unity brings strength" }] },
  THE_HANGED_MAN: { type: "major", descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Make valid sacrifices, adopt a new perspective" }] },
  DEATH: { type: "major", descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Death, renovation, kill that which kills your soul" }] },
  TEMPERANCE: { type: "major", descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Balance, harmonize differences" }] },
  THE_DEVIL: { type: "major", descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Indecision between vice and virtue, transmute weakness and passions into strengths" }] },
  THE_TOWER: { type: "major", descriptiveData: [{ name: "The House of God", deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Separation, destruction, separate from what's harmful and connect with what's helpful, make room for the new" }] },
  THE_STAR: { type: "major", descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Fecundation, ecology, ecstasy, hope, renew yourself to maintain help, act according to your spiritual purpose" }] },
  THE_MOON: { type: "major", descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Hidden enemies, be vigilant, recognize where you're self sabotaging" }] },
  THE_SUN: { type: "major", descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Be conscious of your alchemical band, transmute money into knowledge and vice versa" }] },
  JUDGMENT: { type: "major", descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Make retrospectives and learn from mistakes and successes" }] },
  THE_FOOL: { type: "major", descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Stop walking in circles, create connections of knowledge" }] },
  THE_WORLD: { type: "major", descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Win the world, start acting on the world of causes" }] },
  KING_OF_WANDS: { type: "court", suit: TAROT_SUITS.WANDS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Get's the best out of every one, Idealism, Magnanimity" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "The Laborer" }] },
  QUEEN_OF_WANDS: { type: "court", suit: TAROT_SUITS.WANDS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Hold the line while the king goes to work, Preserve what was conquered" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "The Weaver" }] },
  KNIGHT_OF_WANDS: { type: "court", suit: TAROT_SUITS.WANDS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Dreams that become reality" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "The Argonaut" }] },
  PAGE_OF_WANDS: { type: "court", suit: TAROT_SUITS.WANDS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Don't rush, the precipitations are the doors to failure" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "The Prodigy" }] },
  ACE_OF_WANDS: { type: "minor", suit: TAROT_SUITS.WANDS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Ignite the flames of ideals, Trust in your inner divinity" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "The Unexpected" }] },
  TWO_OF_WANDS: { type: "minor", suit: TAROT_SUITS.WANDS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Formulate a strategy to use your own talents" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Uncertainty" }] },
  THREE_OF_WANDS: { type: "minor", suit: TAROT_SUITS.WANDS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Keep going despite losing something apparently important" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Domesticity" }] },
  FOUR_OF_WANDS: { type: "minor", suit: TAROT_SUITS.WANDS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Work in teams" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Exchange" }] },
  FIVE_OF_WANDS: { type: "minor", suit: TAROT_SUITS.WANDS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Strengthen the root chakra, overcome internal fears" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Impediment" }] },
  SIX_OF_WANDS: { type: "minor", suit: TAROT_SUITS.WANDS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "External victory, internal lack of internal self realization" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Magnificence" }] },
  SEVEN_OF_WANDS: { type: "minor", suit: TAROT_SUITS.WANDS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Face competitors in an ethical and loyal way" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Alliance" }] },
  EIGHT_OF_WANDS: { type: "minor", suit: TAROT_SUITS.WANDS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Travel to the center of peace and intelligence" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Innovation" }] },
  NINE_OF_WANDS: { type: "minor", suit: TAROT_SUITS.WANDS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Obstacle that precedes total victory, gather hidden forces" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Desolation" }] },
  TEN_OF_WANDS: { type: "minor", suit: TAROT_SUITS.WANDS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Get out of apathy, create a new tree of life using the Lightning Path" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Initiation" }] },
  KING_OF_CUPS: { type: "court", suit: TAROT_SUITS.CUPS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Stop hurting yourself (related to The Lover), heals everyone and forgets about yourself, balm for your own wound" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Art and Science" }] },
  QUEEN_OF_CUPS: { type: "court", suit: TAROT_SUITS.CUPS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Work with subtlety, positive challenges" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Duplicity" }] },
  KNIGHT_OF_CUPS: { type: "court", suit: TAROT_SUITS.CUPS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Alternative healing" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Testimony" }] },
  PAGE_OF_CUPS: { type: "court", suit: TAROT_SUITS.CUPS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Increase of self-esteem, emotional courage" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Premonition" }] },
  ACE_OF_CUPS: { type: "minor", suit: TAROT_SUITS.CUPS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Renewal or new affection, alternative treatment for health" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Dissension" }] },
  TWO_OF_CUPS: { type: "minor", suit: TAROT_SUITS.CUPS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Do not poison yourself or the other person" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Preeminence" }] },
  THREE_OF_CUPS: { type: "minor", suit: TAROT_SUITS.CUPS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Harmony between instinct and emotion, Be discreet" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Premonition" }] },
  FOUR_OF_CUPS: { type: "minor", suit: TAROT_SUITS.CUPS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Abundance in emotional life, do not listen to slander" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Expressiveness" }] },
  FIVE_OF_CUPS: { type: "minor", suit: TAROT_SUITS.CUPS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Do not break your spiritual commitment (your purpose)" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Regeneration" }] },
  SIX_OF_CUPS: { type: "minor", suit: TAROT_SUITS.CUPS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Do not have self-pity" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Patrimony" }] },
  SEVEN_OF_CUPS: { type: "minor", suit: TAROT_SUITS.CUPS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Gestations, related to The Star" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Conjecture" }] },
  EIGHT_OF_CUPS: { type: "minor", suit: TAROT_SUITS.CUPS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Reflect on your emotional life after 18 hours" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Consummation" }] },
  NINE_OF_CUPS: { type: "minor", suit: TAROT_SUITS.CUPS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Reconciliations and forgiveness" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Versatility" }] },
  TEN_OF_CUPS: { type: "minor", suit: TAROT_SUITS.CUPS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Marriage of the spirit with the soul, Alchemical Weddings" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Attraction" }] },
  KING_OF_SWORDS: { type: "court", suit: TAROT_SUITS.SWORDS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Actions of victorious strategies" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Advice" }] },
  QUEEN_OF_SWORDS: { type: "court", suit: TAROT_SUITS.SWORDS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Supremacy of the feminine, related to Justice" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Premeditation" }] },
  KNIGHT_OF_SWORDS: { type: "court", suit: TAROT_SUITS.SWORDS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Joint victorious actions" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Hostility" }] },
  PAGE_OF_SWORDS: { type: "court", suit: TAROT_SUITS.SWORDS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Follow your intuition" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Examination" }] },
  ACE_OF_SWORDS: { type: "minor", suit: TAROT_SUITS.SWORDS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Conflicts before victory" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Contrition" }] },
  TWO_OF_SWORDS: { type: "minor", suit: TAROT_SUITS.SWORDS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Traumas and conflicts to overcome" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Pilgrimage" }] },
  THREE_OF_SWORDS: { type: "minor", suit: TAROT_SUITS.SWORDS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Death of yang, Fire, tendencies to depression" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Rivalry" }] },
  FOUR_OF_SWORDS: { type: "minor", suit: TAROT_SUITS.SWORDS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Reflection, related to The Hermit" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Meditation" }] },
  FIVE_OF_SWORDS: { type: "minor", suit: TAROT_SUITS.SWORDS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Healthy self-challenge, Self-demands" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Revelation" }] },
  SIX_OF_SWORDS: { type: "minor", suit: TAROT_SUITS.SWORDS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "External daily strategies, Future perspectives" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Evolution" }] },
  SEVEN_OF_SWORDS: { type: "minor", suit: TAROT_SUITS.SWORDS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Internal nocturnal strategies, related to The Hermit" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Solitude" }] },
  EIGHT_OF_SWORDS: { type: "minor", suit: TAROT_SUITS.SWORDS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Appeal to superior forces, Internal and external conflicts" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Proscription" }] },
  NINE_OF_SWORDS: { type: "minor", suit: TAROT_SUITS.SWORDS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "The problems being imagined will never happen" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Communion" }] },
  TEN_OF_SWORDS: { type: "minor", suit: TAROT_SUITS.SWORDS, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Death and rebirth, related to Death and The Tower" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Vehemence" }] },
  KING_OF_PENTACLES: { type: "court", suit: TAROT_SUITS.PENTACLES, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Turns everything into gold" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Apprenticeship" }] },
  QUEEN_OF_PENTACLES: { type: "court", suit: TAROT_SUITS.PENTACLES, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Act with diplomacy" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Perplexity" }] },
  KNIGHT_OF_PENTACLES: { type: "court", suit: TAROT_SUITS.PENTACLES, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Invest into new things" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Veneration" }] },
  PAGE_OF_PENTACLES: { type: "court", suit: TAROT_SUITS.PENTACLES, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Prudence in the material life" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Speculation" }] },
  ACE_OF_PENTACLES: { type: "minor", suit: TAROT_SUITS.PENTACLES, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Rebirth through a single material goal, Form clear material goals" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "The Unforeseen" }] },
  TWO_OF_PENTACLES: { type: "minor", suit: TAROT_SUITS.PENTACLES, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Light forming shadows, Duality asking for synthesis in the trinity, Don't put all the eggs in the same basket" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Cooperation" }] },
  THREE_OF_PENTACLES: { type: "minor", suit: TAROT_SUITS.PENTACLES, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Light forming sound, Establish balance through the trinity becoming a great dispenser, Verbalize what should be done, Do not settle for the first results" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Avarice" }] },
  FOUR_OF_PENTACLES: { type: "minor", suit: TAROT_SUITS.PENTACLES, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Avoid avarice / greed" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Purification" }] },
  FIVE_OF_PENTACLES: { type: "minor", suit: TAROT_SUITS.PENTACLES, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Only order will bring progress, Do not kick the barn without having something concrete in front of you" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Love and Desire" }] },
  SIX_OF_PENTACLES: { type: "minor", suit: TAROT_SUITS.PENTACLES, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Act with prudence" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Offering" }] },
  SEVEN_OF_PENTACLES: { type: "minor", suit: TAROT_SUITS.PENTACLES, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Don't boast about your proposal or project" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Generosity" }] },
  EIGHT_OF_PENTACLES: { type: "minor", suit: TAROT_SUITS.PENTACLES, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Keep doing what you always did" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "The Provider" }] },
  NINE_OF_PENTACLES: { type: "minor", suit: TAROT_SUITS.PENTACLES, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Work with what you like and earn something with it" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Confusion" }] },
  TEN_OF_PENTACLES: { type: "minor", suit: TAROT_SUITS.PENTACLES, descriptiveData: [{ deck: TAROT_DECKS.PAPUS_KAABALISTIC, meaning: "Prosperity, Prosperous inheritance" }, { deck: TAROT_DECKS.KIER_EGYPTIAN, name: "Rebirth" }] },
}

