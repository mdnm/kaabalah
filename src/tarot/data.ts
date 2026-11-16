import { TAROT_CONTENT } from "../core/tarot-content";
import type { SystemKey } from "../core";

export type Deck = "papus_pt" | "papus" | "mythic" | "egyptian" | "rider-waite"
export type TarotDeckId = Deck;
export type TarotTreeId = SystemKey;

export const DEFAULT_TAROT_TREE_ID: TarotTreeId = "kaabalah";

export const TAROT_TREE_IDS = [
  "kaabalah",
  "hermetic-qabalah",
  "lurianic-kabbalah"
] as const satisfies readonly TarotTreeId[];

export type MajorArcana =
  | "01_the_magician"
  | "02_the_high_priestess"
  | "03_the_empress"
  | "04_the_emperor"
  | "05_the_hierophant"
  | "06_the_lover"
  | "07_the_chariot"
  | "08_justice"
  | "09_the_hermit"
  | "10_the_wheel_of_fortune"
  | "11_strength"
  | "12_the_hanged_man"
  | "13_death"
  | "14_temperance"
  | "15_the_devil"
  | "16_the_house_of_god"
  | "17_the_star"
  | "18_the_moon"
  | "19_the_sun"
  | "20_judgement"
  | "21_the_fool"
  | "22_the_world"

export type TarotCard = {
  number: number
  tarotCard: string
  tarotCardFilename: string
  egyptianCardName?: string
  meaning: string
  papusMeaning?: string
  type: "major" | "minor" | "daat+royalship"
  deck: Deck
  suit?: string
  isInverted?: boolean
}

export const majorArcana: MajorArcana[] = [
  "01_the_magician",
  "02_the_high_priestess",
  "03_the_empress",
  "04_the_emperor",
  "05_the_hierophant",
  "06_the_lover",
  "07_the_chariot",
  "08_justice",
  "09_the_hermit",
  "10_the_wheel_of_fortune",
  "11_strength",
  "12_the_hanged_man",
  "13_death",
  "14_temperance",
  "15_the_devil",
  "16_the_house_of_god",
  "17_the_star",
  "18_the_moon",
  "19_the_sun",
  "20_judgement",
  "21_the_fool",
  "22_the_world"
]

// Base card catalog. The exported ARKANNUS list is normalized below so its
// numbers always reflect the canonical kaabalah tree correspondences.
export const RAW_ARKANNUS: TarotCard[] = [
  // Major Arcana (1-22)
  {
    number: 1,
    tarotCard: "The Magician",
    tarotCardFilename: "01_the_magician",
    meaning: (TAROT_CONTENT["01_the_magician"].legacyMeaning ?? TAROT_CONTENT["01_the_magician"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["01_the_magician"].en.PAPUS_DIVINATORY.meaning,
    type: "major",
    deck: "mythic"
  },
  {
    number: 2,
    tarotCard: "The High Priestess",
    tarotCardFilename: "02_the_high_priestess",
    meaning:
      (TAROT_CONTENT["02_the_high_priestess"].legacyMeaning ?? TAROT_CONTENT["02_the_high_priestess"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["02_the_high_priestess"].en.PAPUS_DIVINATORY.meaning,
    type: "major",
    deck: "mythic"
  },
  {
    number: 3,
    tarotCard: "The Empress",
    tarotCardFilename: "03_the_empress",
    meaning: (TAROT_CONTENT["03_the_empress"].legacyMeaning ?? TAROT_CONTENT["03_the_empress"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["03_the_empress"].en.PAPUS_DIVINATORY.meaning,
    type: "major",
    deck: "mythic"
  },
  {
    number: 4,
    tarotCard: "The Emperor",
    tarotCardFilename: "04_the_emperor",
    meaning: (TAROT_CONTENT["04_the_emperor"].legacyMeaning ?? TAROT_CONTENT["04_the_emperor"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["04_the_emperor"].en.PAPUS_DIVINATORY.meaning,
    type: "major",
    deck: "mythic"
  },
  {
    number: 5,
    tarotCard: "The Hierophant",
    tarotCardFilename: "05_the_hierophant",
    meaning:
      (TAROT_CONTENT["05_the_hierophant"].legacyMeaning ?? TAROT_CONTENT["05_the_hierophant"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["05_the_hierophant"].en.PAPUS_DIVINATORY.meaning,
    type: "major",
    deck: "mythic"
  },
  {
    number: 6,
    tarotCard: "The Lover",
    tarotCardFilename: "06_the_lover",
    meaning:
      (TAROT_CONTENT["06_the_lover"].legacyMeaning ?? TAROT_CONTENT["06_the_lover"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["06_the_lover"].en.PAPUS_DIVINATORY.meaning,
    type: "major",
    deck: "mythic"
  },
  {
    number: 7,
    tarotCard: "The Chariot",
    tarotCardFilename: "07_the_chariot",
    meaning: (TAROT_CONTENT["07_the_chariot"].legacyMeaning ?? TAROT_CONTENT["07_the_chariot"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["07_the_chariot"].en.PAPUS_DIVINATORY.meaning,
    type: "major",
    deck: "mythic"
  },
  {
    number: 8,
    tarotCard: "Justice",
    tarotCardFilename: "08_justice",
    meaning: (TAROT_CONTENT["08_justice"].legacyMeaning ?? TAROT_CONTENT["08_justice"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["08_justice"].en.PAPUS_DIVINATORY.meaning,
    type: "major",
    deck: "mythic"
  },
  {
    number: 9,
    tarotCard: "The Hermit",
    tarotCardFilename: "09_the_hermit",
    meaning: (TAROT_CONTENT["09_the_hermit"].legacyMeaning ?? TAROT_CONTENT["09_the_hermit"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["09_the_hermit"].en.PAPUS_DIVINATORY.meaning,
    type: "major",
    deck: "mythic"
  },
  {
    number: 10,
    tarotCard: "The Wheel of Fortune",
    tarotCardFilename: "10_the_wheel_of_fortune",
    meaning:
      (TAROT_CONTENT["10_the_wheel_of_fortune"].legacyMeaning ?? TAROT_CONTENT["10_the_wheel_of_fortune"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["10_the_wheel_of_fortune"].en.PAPUS_DIVINATORY.meaning,
    type: "major",
    deck: "mythic"
  },
  {
    number: 11,
    tarotCard: "Strength",
    tarotCardFilename: "11_strength",
    meaning: (TAROT_CONTENT["11_strength"].legacyMeaning ?? TAROT_CONTENT["11_strength"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["11_strength"].en.PAPUS_DIVINATORY.meaning,
    type: "major",
    deck: "mythic"
  },
  {
    number: 12,
    tarotCard: "The Hanged Man",
    tarotCardFilename: "12_the_hanged_man",
    meaning: (TAROT_CONTENT["12_the_hanged_man"].legacyMeaning ?? TAROT_CONTENT["12_the_hanged_man"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["12_the_hanged_man"].en.PAPUS_DIVINATORY.meaning,
    type: "major",
    deck: "mythic"
  },
  {
    number: 13,
    tarotCard: "Death",
    tarotCardFilename: "13_death",
    meaning: (TAROT_CONTENT["13_death"].legacyMeaning ?? TAROT_CONTENT["13_death"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["13_death"].en.PAPUS_DIVINATORY.meaning,
    type: "major",
    deck: "mythic"
  },
  {
    number: 14,
    tarotCard: "Temperance",
    tarotCardFilename: "14_temperance",
    meaning: (TAROT_CONTENT["14_temperance"].legacyMeaning ?? TAROT_CONTENT["14_temperance"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["14_temperance"].en.PAPUS_DIVINATORY.meaning,
    type: "major",
    deck: "mythic"
  },
  {
    number: 15,
    tarotCard: "The Devil",
    tarotCardFilename: "15_the_devil",
    meaning:
      (TAROT_CONTENT["15_the_devil"].legacyMeaning ?? TAROT_CONTENT["15_the_devil"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["15_the_devil"].en.PAPUS_DIVINATORY.meaning,
    type: "major",
    deck: "mythic"
  },
  {
    number: 16,
    tarotCard: "The Tower",
    tarotCardFilename: "16_the_house_of_god",
    meaning:
      (TAROT_CONTENT["16_the_house_of_god"].legacyMeaning ?? TAROT_CONTENT["16_the_house_of_god"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["16_the_house_of_god"].en.PAPUS_DIVINATORY.meaning,
    type: "major",
    deck: "mythic"
  },
  {
    number: 17,
    tarotCard: "The Star",
    tarotCardFilename: "17_the_star",
    meaning:
      (TAROT_CONTENT["17_the_star"].legacyMeaning ?? TAROT_CONTENT["17_the_star"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["17_the_star"].en.PAPUS_DIVINATORY.meaning,
    type: "major",
    deck: "mythic"
  },
  {
    number: 18,
    tarotCard: "The Moon",
    tarotCardFilename: "18_the_moon",
    meaning:
      (TAROT_CONTENT["18_the_moon"].legacyMeaning ?? TAROT_CONTENT["18_the_moon"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["18_the_moon"].en.PAPUS_DIVINATORY.meaning,
    type: "major",
    deck: "mythic"
  },
  {
    number: 19,
    tarotCard: "The Sun",
    tarotCardFilename: "19_the_sun",
    meaning:
      (TAROT_CONTENT["19_the_sun"].legacyMeaning ?? TAROT_CONTENT["19_the_sun"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["19_the_sun"].en.PAPUS_DIVINATORY.meaning,
    type: "major",
    deck: "mythic"
  },
  {
    number: 20,
    tarotCard: "Judgment",
    tarotCardFilename: "20_judgement",
    meaning: (TAROT_CONTENT["20_judgement"].legacyMeaning ?? TAROT_CONTENT["20_judgement"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["20_judgement"].en.PAPUS_DIVINATORY.meaning,
    type: "major",
    deck: "mythic"
  },
  {
    number: 21,
    tarotCard: "The Fool",
    tarotCardFilename: "21_the_fool",
    meaning: (TAROT_CONTENT["21_the_fool"].legacyMeaning ?? TAROT_CONTENT["21_the_fool"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["21_the_fool"].en.PAPUS_DIVINATORY.meaning,
    type: "major",
    deck: "mythic"
  },
  {
    number: 22,
    tarotCard: "The World",
    tarotCardFilename: "22_the_world",
    meaning: (TAROT_CONTENT["22_the_world"].legacyMeaning ?? TAROT_CONTENT["22_the_world"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["22_the_world"].en.PAPUS_DIVINATORY.meaning,
    type: "major",
    deck: "mythic"
  },

  // Da'at Royalship - Wands (23-26)
  {
    number: 23,
    tarotCard: "King of Wands",
    tarotCardFilename: "king_wands",
    egyptianCardName: "The Laborer",
    meaning: (TAROT_CONTENT["king_wands"].legacyMeaning ?? TAROT_CONTENT["king_wands"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning:
      TAROT_CONTENT["king_wands"].en.PAPUS_DIVINATORY.meaning,
    type: "daat+royalship",
    deck: "egyptian",
    suit: "wands"
  },
  {
    number: 24,
    tarotCard: "Queen of Wands",
    tarotCardFilename: "queen_wands",
    egyptianCardName: "The Weaver",
    meaning:
      (TAROT_CONTENT["queen_wands"].legacyMeaning ?? TAROT_CONTENT["queen_wands"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning:
      TAROT_CONTENT["queen_wands"].en.PAPUS_DIVINATORY.meaning,
    type: "daat+royalship",
    deck: "egyptian",
    suit: "wands"
  },
  {
    number: 25,
    tarotCard: "Knight of Wands",
    tarotCardFilename: "knight_wands",
    egyptianCardName: "The Argonaut",
    meaning: (TAROT_CONTENT["knight_wands"].legacyMeaning ?? TAROT_CONTENT["knight_wands"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["knight_wands"].en.PAPUS_DIVINATORY.meaning,
    type: "daat+royalship",
    deck: "egyptian",
    suit: "wands"
  },
  {
    number: 26,
    tarotCard: "Page of Wands",
    tarotCardFilename: "page_wands",
    egyptianCardName: "The Prodigy",
    meaning: (TAROT_CONTENT["page_wands"].legacyMeaning ?? TAROT_CONTENT["page_wands"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning:
      TAROT_CONTENT["page_wands"].en.PAPUS_DIVINATORY.meaning,
    type: "daat+royalship",
    deck: "egyptian",
    suit: "wands"
  },

  // Minor Arcana - Wands (27-36)
  {
    number: 27,
    tarotCard: "Ace of Wands",
    tarotCardFilename: "ace_wands",
    egyptianCardName: "Initiation",
    meaning: (TAROT_CONTENT["ace_wands"].legacyMeaning ?? TAROT_CONTENT["ace_wands"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["ace_wands"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "wands"
  },
  {
    number: 28,
    tarotCard: "Two of Wands",
    tarotCardFilename: "2_wands",
    egyptianCardName: "Desolation",
    meaning: (TAROT_CONTENT["2_wands"].legacyMeaning ?? TAROT_CONTENT["2_wands"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning:
      TAROT_CONTENT["2_wands"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "wands"
  },
  {
    number: 29,
    tarotCard: "Three of Wands",
    tarotCardFilename: "3_wands",
    egyptianCardName: "Innovation",
    meaning: (TAROT_CONTENT["3_wands"].legacyMeaning ?? TAROT_CONTENT["3_wands"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning:
      TAROT_CONTENT["3_wands"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "wands"
  },
  {
    number: 30,
    tarotCard: "Four of Wands",
    tarotCardFilename: "4_wands",
    egyptianCardName: "Alliance",
    meaning: (TAROT_CONTENT["4_wands"].legacyMeaning ?? TAROT_CONTENT["4_wands"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning:
      TAROT_CONTENT["4_wands"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "wands"
  },
  {
    number: 31,
    tarotCard: "Five of Wands",
    tarotCardFilename: "5_wands",
    egyptianCardName: "Magnificence",
    meaning: (TAROT_CONTENT["5_wands"].legacyMeaning ?? TAROT_CONTENT["5_wands"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["5_wands"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "wands"
  },
  {
    number: 32,
    tarotCard: "Six of Wands",
    tarotCardFilename: "6_wands",
    egyptianCardName: "Impediment",
    meaning: (TAROT_CONTENT["6_wands"].legacyMeaning ?? TAROT_CONTENT["6_wands"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning:
      TAROT_CONTENT["6_wands"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "wands"
  },
  {
    number: 33,
    tarotCard: "Seven of Wands",
    tarotCardFilename: "7_wands",
    egyptianCardName: "Exchange",
    meaning: (TAROT_CONTENT["7_wands"].legacyMeaning ?? TAROT_CONTENT["7_wands"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["7_wands"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "wands"
  },
  {
    number: 34,
    tarotCard: "Eight of Wands",
    tarotCardFilename: "8_wands",
    egyptianCardName: "Domesticity",
    meaning: (TAROT_CONTENT["8_wands"].legacyMeaning ?? TAROT_CONTENT["8_wands"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning:
      TAROT_CONTENT["8_wands"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "wands"
  },
  {
    number: 35,
    tarotCard: "Nine of Wands",
    tarotCardFilename: "9_wands",
    egyptianCardName: "Uncertainty",
    meaning: (TAROT_CONTENT["9_wands"].legacyMeaning ?? TAROT_CONTENT["9_wands"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["9_wands"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "wands"
  },
  {
    number: 36,
    tarotCard: "Ten of Wands",
    tarotCardFilename: "10_wands",
    egyptianCardName: "The Unexpected",
    meaning:
      (TAROT_CONTENT["10_wands"].legacyMeaning ?? TAROT_CONTENT["10_wands"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["10_wands"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "wands"
  },

  // Da'at Royalship - Cups (37-40)
  {
    number: 37,
    tarotCard: "King of Cups",
    tarotCardFilename: "king_cups",
    egyptianCardName: "Art and Science",
    meaning:
      (TAROT_CONTENT["king_cups"].legacyMeaning ?? TAROT_CONTENT["king_cups"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning:
      TAROT_CONTENT["king_cups"].en.PAPUS_DIVINATORY.meaning,
    type: "daat+royalship",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 38,
    tarotCard: "Queen of Cups",
    tarotCardFilename: "queen_cups",
    egyptianCardName: "Duplicity",
    meaning: (TAROT_CONTENT["queen_cups"].legacyMeaning ?? TAROT_CONTENT["queen_cups"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning:
      TAROT_CONTENT["queen_cups"].en.PAPUS_DIVINATORY.meaning,
    type: "daat+royalship",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 39,
    tarotCard: "Knight of Cups",
    tarotCardFilename: "knight_cups",
    egyptianCardName: "Testimony",
    meaning: (TAROT_CONTENT["knight_cups"].legacyMeaning ?? TAROT_CONTENT["knight_cups"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning:
      TAROT_CONTENT["knight_cups"].en.PAPUS_DIVINATORY.meaning,
    type: "daat+royalship",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 40,
    tarotCard: "Page of Cups",
    tarotCardFilename: "page_cups",
    egyptianCardName: "Premonition",
    meaning: (TAROT_CONTENT["page_cups"].legacyMeaning ?? TAROT_CONTENT["page_cups"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["page_cups"].en.PAPUS_DIVINATORY.meaning,
    type: "daat+royalship",
    deck: "egyptian",
    suit: "cups"
  },

  // Minor Arcana - Cups (41-50)
  {
    number: 41,
    tarotCard: "Ace of Cups",
    tarotCardFilename: "ace_cups",
    egyptianCardName: "Attraction",
    meaning: (TAROT_CONTENT["ace_cups"].legacyMeaning ?? TAROT_CONTENT["ace_cups"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["ace_cups"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 42,
    tarotCard: "Two of Cups",
    tarotCardFilename: "2_cups",
    egyptianCardName: "Versatility",
    meaning: (TAROT_CONTENT["2_cups"].legacyMeaning ?? TAROT_CONTENT["2_cups"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning:
      TAROT_CONTENT["2_cups"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 43,
    tarotCard: "Three of Cups",
    tarotCardFilename: "3_cups",
    egyptianCardName: "Consummation",
    meaning: (TAROT_CONTENT["3_cups"].legacyMeaning ?? TAROT_CONTENT["3_cups"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning:
      TAROT_CONTENT["3_cups"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 44,
    tarotCard: "Four of Cups",
    tarotCardFilename: "4_cups",
    egyptianCardName: "Conjecture",
    meaning: (TAROT_CONTENT["4_cups"].legacyMeaning ?? TAROT_CONTENT["4_cups"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning:
      TAROT_CONTENT["4_cups"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 45,
    tarotCard: "Five of Cups",
    tarotCardFilename: "5_cups",
    egyptianCardName: "Patrimony",
    meaning: (TAROT_CONTENT["5_cups"].legacyMeaning ?? TAROT_CONTENT["5_cups"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning:
      TAROT_CONTENT["5_cups"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 46,
    tarotCard: "Six of Cups",
    tarotCardFilename: "6_cups",
    egyptianCardName: "Regeneration",
    meaning: (TAROT_CONTENT["6_cups"].legacyMeaning ?? TAROT_CONTENT["6_cups"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning:
      TAROT_CONTENT["6_cups"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 47,
    tarotCard: "Seven of Cups",
    tarotCardFilename: "7_cups",
    egyptianCardName: "Expressiveness",
    meaning: (TAROT_CONTENT["7_cups"].legacyMeaning ?? TAROT_CONTENT["7_cups"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["7_cups"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 48,
    tarotCard: "Eight of Cups",
    tarotCardFilename: "8_cups",
    egyptianCardName: "Delusion",
    meaning: (TAROT_CONTENT["8_cups"].legacyMeaning ?? TAROT_CONTENT["8_cups"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning:
      TAROT_CONTENT["8_cups"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 49,
    tarotCard: "Nine of Cups",
    tarotCardFilename: "9_cups",
    egyptianCardName: "Preeminence",
    meaning: (TAROT_CONTENT["9_cups"].legacyMeaning ?? TAROT_CONTENT["9_cups"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["9_cups"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 50,
    tarotCard: "Ten of Cups",
    tarotCardFilename: "10_cups",
    egyptianCardName: "Dissension",
    meaning: (TAROT_CONTENT["10_cups"].legacyMeaning ?? TAROT_CONTENT["10_cups"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning:
      TAROT_CONTENT["10_cups"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "cups"
  },

  // Da'at Royalship - Swords (51-54)
  {
    number: 51,
    tarotCard: "King of Swords",
    tarotCardFilename: "king_swords",
    egyptianCardName: "Advice",
    meaning: (TAROT_CONTENT["king_swords"].legacyMeaning ?? TAROT_CONTENT["king_swords"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning:
      TAROT_CONTENT["king_swords"].en.PAPUS_DIVINATORY.meaning,
    type: "daat+royalship",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 52,
    tarotCard: "Queen of Swords",
    tarotCardFilename: "queen_swords",
    egyptianCardName: "Premeditation",
    meaning: (TAROT_CONTENT["queen_swords"].legacyMeaning ?? TAROT_CONTENT["queen_swords"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning:
      TAROT_CONTENT["queen_swords"].en.PAPUS_DIVINATORY.meaning,
    type: "daat+royalship",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 53,
    tarotCard: "Knight of Swords",
    tarotCardFilename: "knight_swords",
    egyptianCardName: "Hostility",
    meaning: (TAROT_CONTENT["knight_swords"].legacyMeaning ?? TAROT_CONTENT["knight_swords"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning:
      TAROT_CONTENT["knight_swords"].en.PAPUS_DIVINATORY.meaning,
    type: "daat+royalship",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 54,
    tarotCard: "Page of Swords",
    tarotCardFilename: "page_swords",
    egyptianCardName: "Examination",
    meaning: (TAROT_CONTENT["page_swords"].legacyMeaning ?? TAROT_CONTENT["page_swords"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["page_swords"].en.PAPUS_DIVINATORY.meaning,
    type: "daat+royalship",
    deck: "egyptian",
    suit: "swords"
  },

  // Minor Arcana - Swords (55-64)
  {
    number: 55,
    tarotCard: "Ace of Swords",
    tarotCardFilename: "ace_swords",
    egyptianCardName: "Vehemence",
    meaning: (TAROT_CONTENT["ace_swords"].legacyMeaning ?? TAROT_CONTENT["ace_swords"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["ace_swords"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 56,
    tarotCard: "Two of Swords",
    tarotCardFilename: "2_swords",
    egyptianCardName: "Communion",
    meaning: (TAROT_CONTENT["2_swords"].legacyMeaning ?? TAROT_CONTENT["2_swords"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning:
      TAROT_CONTENT["2_swords"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 57,
    tarotCard: "Three of Swords",
    tarotCardFilename: "3_swords",
    egyptianCardName: "Proscription",
    meaning: (TAROT_CONTENT["3_swords"].legacyMeaning ?? TAROT_CONTENT["3_swords"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["3_swords"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 58,
    tarotCard: "Four of Swords",
    tarotCardFilename: "4_swords",
    egyptianCardName: "Solitude",
    meaning: (TAROT_CONTENT["4_swords"].legacyMeaning ?? TAROT_CONTENT["4_swords"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["4_swords"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 59,
    tarotCard: "Five of Swords",
    tarotCardFilename: "5_swords",
    egyptianCardName: "Evolution",
    meaning: (TAROT_CONTENT["5_swords"].legacyMeaning ?? TAROT_CONTENT["5_swords"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning:
      TAROT_CONTENT["5_swords"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 60,
    tarotCard: "Six of Swords",
    tarotCardFilename: "6_swords",
    egyptianCardName: "Revelation",
    meaning: (TAROT_CONTENT["6_swords"].legacyMeaning ?? TAROT_CONTENT["6_swords"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning:
      TAROT_CONTENT["6_swords"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 61,
    tarotCard: "Seven of Swords",
    tarotCardFilename: "7_swords",
    egyptianCardName: "Meditation",
    meaning: (TAROT_CONTENT["7_swords"].legacyMeaning ?? TAROT_CONTENT["7_swords"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["7_swords"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 62,
    tarotCard: "Eight of Swords",
    tarotCardFilename: "8_swords",
    egyptianCardName: "Rivalry",
    meaning: (TAROT_CONTENT["8_swords"].legacyMeaning ?? TAROT_CONTENT["8_swords"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning:
      TAROT_CONTENT["8_swords"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 63,
    tarotCard: "Nine of Swords",
    tarotCardFilename: "9_swords",
    egyptianCardName: "Pilgrimage",
    meaning: (TAROT_CONTENT["9_swords"].legacyMeaning ?? TAROT_CONTENT["9_swords"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["9_swords"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 64,
    tarotCard: "Ten of Swords",
    tarotCardFilename: "10_swords",
    egyptianCardName: "Contrition",
    meaning: (TAROT_CONTENT["10_swords"].legacyMeaning ?? TAROT_CONTENT["10_swords"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["10_swords"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "swords"
  },

  // Da'at Royalship - Pentacles (65-68)
  {
    number: 65,
    tarotCard: "King of Pentacles",
    tarotCardFilename: "king_pentacles",
    egyptianCardName: "Apprenticeship",
    meaning: (TAROT_CONTENT["king_pentacles"].legacyMeaning ?? TAROT_CONTENT["king_pentacles"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["king_pentacles"].en.PAPUS_DIVINATORY.meaning,
    type: "daat+royalship",
    deck: "egyptian",
    suit: "pentacles"
  },
  {
    number: 66,
    tarotCard: "Queen of Pentacles",
    tarotCardFilename: "queen_pentacles",
    egyptianCardName: "Perplexity",
    meaning: (TAROT_CONTENT["queen_pentacles"].legacyMeaning ?? TAROT_CONTENT["queen_pentacles"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["queen_pentacles"].en.PAPUS_DIVINATORY.meaning,
    type: "daat+royalship",
    deck: "egyptian",
    suit: "pentacles"
  },
  {
    number: 67,
    tarotCard: "Knight of Pentacles",
    tarotCardFilename: "knight_pentacles",
    egyptianCardName: "Veneration",
    meaning: (TAROT_CONTENT["knight_pentacles"].legacyMeaning ?? TAROT_CONTENT["knight_pentacles"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["knight_pentacles"].en.PAPUS_DIVINATORY.meaning,
    type: "daat+royalship",
    deck: "egyptian",
    suit: "pentacles"
  },
  {
    number: 68,
    tarotCard: "Page of Pentacles",
    tarotCardFilename: "page_pentacles",
    egyptianCardName: "Speculation",
    meaning: (TAROT_CONTENT["page_pentacles"].legacyMeaning ?? TAROT_CONTENT["page_pentacles"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["page_pentacles"].en.PAPUS_DIVINATORY.meaning,
    type: "daat+royalship",
    deck: "egyptian",
    suit: "pentacles"
  },

  // Minor Arcana - Pentacles (69-78)
  {
    number: 69,
    tarotCard: "Ace of Pentacles",
    tarotCardFilename: "ace_pentacles",
    egyptianCardName: "Rebirth",
    meaning:
      (TAROT_CONTENT["ace_pentacles"].legacyMeaning ?? TAROT_CONTENT["ace_pentacles"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["ace_pentacles"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "pentacles"
  },
  {
    number: 70,
    tarotCard: "Two of Pentacles",
    tarotCardFilename: "2_pentacles",
    egyptianCardName: "Confusion",
    meaning:
      (TAROT_CONTENT["2_pentacles"].legacyMeaning ?? TAROT_CONTENT["2_pentacles"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning:
      TAROT_CONTENT["2_pentacles"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "pentacles"
  },
  {
    number: 71,
    tarotCard: "Three of Pentacles",
    tarotCardFilename: "3_pentacles",
    egyptianCardName: "The Provider",
    meaning:
      (TAROT_CONTENT["3_pentacles"].legacyMeaning ?? TAROT_CONTENT["3_pentacles"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning:
      TAROT_CONTENT["3_pentacles"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "pentacles"
  },
  {
    number: 72,
    tarotCard: "Four of Pentacles",
    tarotCardFilename: "4_pentacles",
    egyptianCardName: "Generosity",
    meaning: (TAROT_CONTENT["4_pentacles"].legacyMeaning ?? TAROT_CONTENT["4_pentacles"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["4_pentacles"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "pentacles"
  },
  {
    number: 73,
    tarotCard: "Five of Pentacles",
    tarotCardFilename: "5_pentacles",
    egyptianCardName: "Offering",
    meaning:
      (TAROT_CONTENT["5_pentacles"].legacyMeaning ?? TAROT_CONTENT["5_pentacles"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning:
      TAROT_CONTENT["5_pentacles"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "pentacles"
  },
  {
    number: 74,
    tarotCard: "Six of Pentacles",
    tarotCardFilename: "6_pentacles",
    egyptianCardName: "Love and Desire",
    meaning: (TAROT_CONTENT["6_pentacles"].legacyMeaning ?? TAROT_CONTENT["6_pentacles"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["6_pentacles"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "pentacles"
  },
  {
    number: 75,
    tarotCard: "Seven of Pentacles",
    tarotCardFilename: "7_pentacles",
    egyptianCardName: "Purification",
    meaning: (TAROT_CONTENT["7_pentacles"].legacyMeaning ?? TAROT_CONTENT["7_pentacles"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["7_pentacles"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "pentacles"
  },
  {
    number: 76,
    tarotCard: "Eight of Pentacles",
    tarotCardFilename: "8_pentacles",
    egyptianCardName: "Avarice",
    meaning: (TAROT_CONTENT["8_pentacles"].legacyMeaning ?? TAROT_CONTENT["8_pentacles"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning:
      TAROT_CONTENT["8_pentacles"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "pentacles"
  },
  {
    number: 77,
    tarotCard: "Nine of Pentacles",
    tarotCardFilename: "9_pentacles",
    egyptianCardName: "Cooperation",
    meaning: (TAROT_CONTENT["9_pentacles"].legacyMeaning ?? TAROT_CONTENT["9_pentacles"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning: TAROT_CONTENT["9_pentacles"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "pentacles"
  },
  {
    number: 78,
    tarotCard: "Ten of Pentacles",
    tarotCardFilename: "10_pentacles",
    egyptianCardName: "The Unforeseen",
    meaning: (TAROT_CONTENT["10_pentacles"].legacyMeaning ?? TAROT_CONTENT["10_pentacles"].en.PAPUS_KAABALISTIC.meaning),
    papusMeaning:
      TAROT_CONTENT["10_pentacles"].en.PAPUS_DIVINATORY.meaning,
    type: "minor",
    deck: "egyptian",
    suit: "pentacles"
  }
]

export type TarotDescriptiveDeckKey =
  | "PAPUS_KAABALISTIC"
  | "PAPUS_DIVINATORY"
  | "KIER_EGYPTIAN";

export interface TarotDeckMetadata {
  id: TarotDeckId;
  label: string;
}

export interface TarotDeckDescription {
  name?: string;
  meaning?: string;
  reversedMeaning?: string;
  keywords?: string[];
  /** Localized deck reference content, separate from the existing meaning. */
  scene?: TarotLocalizedText;
  divinatory?: TarotLocalizedText;
  figure?: TarotLocalizedText;
}

export interface TarotLocalizedText {
  readonly en: string;
  readonly pt: string;
}

export type TarotDeckConfig = TarotDeckMetadata & {
  descriptiveDataKey?: TarotDescriptiveDeckKey;
};

export const TAROT_DECK_METADATA: readonly TarotDeckConfig[] = [
  {
    id: "papus_pt",
    label: "Papus Kaabalistic",
    descriptiveDataKey: "PAPUS_KAABALISTIC"
  },
  {
    id: "papus",
    label: "Papus Divinatory",
    descriptiveDataKey: "PAPUS_DIVINATORY"
  },
  {
    id: "mythic",
    label: "Mythic"
  },
  {
    id: "egyptian",
    label: "Egyptian",
    descriptiveDataKey: "KIER_EGYPTIAN"
  },
  {
    id: "rider-waite",
    label: "Rider Waite"
  }
] as const;
