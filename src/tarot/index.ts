/**
 * Tarot interpretation functions
 */

import {
  getCanonicalTree,
  id,
  KaabalahTypes,
  LetterTypes,
  parseId,
  TarotTypes,
  type NodeId,
  type Node,
  WesternAstrologyTypes
} from "../core";

export type Deck = "papus_pt" | "papus" | "mythic" | "egyptian" | "rider-waite"
export type TarotDeckId = Deck;

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

export const ARKANNUS: TarotCard[] = [
  // Major Arcana (1-22)
  {
    number: 1,
    tarotCard: "The Magician",
    tarotCardFilename: "01_the_magician",
    meaning: "Abracadabra, the power to create reality through voice",
    papusMeaning: "Male inquirer.",
    type: "major",
    deck: "mythic"
  },
  {
    number: 2,
    tarotCard: "The High Priestess",
    tarotCardFilename: "02_the_high_priestess",
    meaning:
      "Intuition, the power to rewrite your book of life improving your life every instant",
    papusMeaning: "Female inquirer.",
    type: "major",
    deck: "mythic"
  },
  {
    number: 3,
    tarotCard: "The Empress",
    tarotCardFilename: "03_the_empress",
    meaning: "Adaptation, the power to geometrize through emotions",
    papusMeaning: "Action. Initiative.",
    type: "major",
    deck: "mythic"
  },
  {
    number: 4,
    tarotCard: "The Emperor",
    tarotCardFilename: "04_the_emperor",
    meaning: "Authority, the power to mark your territory with the sacred fire",
    papusMeaning: "Will.",
    type: "major",
    deck: "mythic"
  },
  {
    number: 5,
    tarotCard: "The Hierophant",
    tarotCardFilename: "05_the_hierophant",
    meaning:
      "Magnetism, the power to ritualize life and circulate the quintessence",
    papusMeaning: "Inspiration.",
    type: "major",
    deck: "mythic"
  },
  {
    number: 6,
    tarotCard: "The Lover",
    tarotCardFilename: "06_the_lover",
    meaning:
      "Dichotomy, stay on the middle path by being neither a victim nor a villain",
    papusMeaning: "Love.",
    type: "major",
    deck: "mythic"
  },
  {
    number: 7,
    tarotCard: "The Chariot",
    tarotCardFilename: "07_the_chariot",
    meaning: "Merkaabah, take control and build your merkaabah (mind vehicle)",
    papusMeaning: "Triumph. Providential protection.",
    type: "major",
    deck: "mythic"
  },
  {
    number: 8,
    tarotCard: "Justice",
    tarotCardFilename: "08_justice",
    meaning: "Justice, be just with yourself to be just with others",
    papusMeaning: "Justice.",
    type: "major",
    deck: "mythic"
  },
  {
    number: 9,
    tarotCard: "The Hermit",
    tarotCardFilename: "09_the_hermit",
    meaning: "Introspection, seek within, retreat",
    papusMeaning: "Prudence.",
    type: "major",
    deck: "mythic"
  },
  {
    number: 10,
    tarotCard: "The Wheel of Fortune",
    tarotCardFilename: "10_the_wheel_of_fortune",
    meaning:
      "Loops, extroversion, break the great wheel and ascend, seek externally",
    papusMeaning: "Fortune. Destiny.",
    type: "major",
    deck: "mythic"
  },
  {
    number: 11,
    tarotCard: "Strength",
    tarotCardFilename: "11_strength",
    meaning: "The strength of your subconscious, unity brings strength",
    papusMeaning: "Strength. Fortitude.",
    type: "major",
    deck: "mythic"
  },
  {
    number: 12,
    tarotCard: "The Hanged Man",
    tarotCardFilename: "12_the_hanged_man",
    meaning: "Make valid sacrifices, adopt a new perspective",
    papusMeaning: "Trials. Sacrifice.",
    type: "major",
    deck: "mythic"
  },
  {
    number: 13,
    tarotCard: "Death",
    tarotCardFilename: "13_death",
    meaning: "Death, renovation, kill that which kills your soul",
    papusMeaning: "Death.",
    type: "major",
    deck: "mythic"
  },
  {
    number: 14,
    tarotCard: "Temperance",
    tarotCardFilename: "14_temperance",
    meaning: "Balance, harmonize differences",
    papusMeaning: "Temperance. Economy.",
    type: "major",
    deck: "mythic"
  },
  {
    number: 15,
    tarotCard: "The Devil",
    tarotCardFilename: "15_the_devil",
    meaning:
      "Indecision between vice and virtue, transmute weakness and passions into strengths",
    papusMeaning: "Immense force. Illness.",
    type: "major",
    deck: "mythic"
  },
  {
    number: 16,
    tarotCard: "The Tower",
    tarotCardFilename: "16_the_house_of_god",
    meaning:
      "Separation, destruction, separate from what's harmful and connect with what's helpful, make room for the new",
    papusMeaning: "Ruin. Deception.",
    type: "major",
    deck: "mythic"
  },
  {
    number: 17,
    tarotCard: "The Star",
    tarotCardFilename: "17_the_star",
    meaning:
      "Fecundation, ecology, ecstasy, hope, renew yourself to maintain health, act according to your spiritual purpose",
    papusMeaning: "Hope.",
    type: "major",
    deck: "mythic"
  },
  {
    number: 18,
    tarotCard: "The Moon",
    tarotCardFilename: "18_the_moon",
    meaning:
      "Hidden enemies, be vigilant, recognize where you're self sabotaging",
    papusMeaning: "Hidden enemies. Danger.",
    type: "major",
    deck: "mythic"
  },
  {
    number: 19,
    tarotCard: "The Sun",
    tarotCardFilename: "19_the_sun",
    meaning:
      "Be conscious of your alchemical band, transmute money into knowledge and vice versa",
    papusMeaning: "Material happiness. Lucky marriage.",
    type: "major",
    deck: "mythic"
  },
  {
    number: 20,
    tarotCard: "Judgment",
    tarotCardFilename: "20_judgement",
    meaning: "Make retrospectives and learn from mistakes and successes",
    papusMeaning: "Change of position.",
    type: "major",
    deck: "mythic"
  },
  {
    number: 21,
    tarotCard: "The Fool",
    tarotCardFilename: "21_the_fool",
    meaning: "Stop walking in circles, create connections of knowledge",
    papusMeaning: "Inconsiderate actions. Madness.",
    type: "major",
    deck: "mythic"
  },
  {
    number: 22,
    tarotCard: "The World",
    tarotCardFilename: "22_the_world",
    meaning: "Win the world, start acting on the world of causes",
    papusMeaning: "Assured success.",
    type: "major",
    deck: "mythic"
  },

  // Da'at Royalship - Wands (23-26)
  {
    number: 23,
    tarotCard: "King of Wands",
    tarotCardFilename: "king_wands",
    egyptianCardName: "The Laborer",
    meaning: "Get's the best out of every one, Idealism, Magnanimity",
    papusMeaning:
      "A dark man, a friend. He generally represents a married man, the father of a family.",
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
      "Hold the line while the king goes to work, Preserve what was conquered",
    papusMeaning:
      "A dark woman, a friend. Represents a serious woman, a very good counsellor, often the mother of a family.",
    type: "daat+royalship",
    deck: "egyptian",
    suit: "wands"
  },
  {
    number: 25,
    tarotCard: "Knight of Wands",
    tarotCardFilename: "knight_wands",
    egyptianCardName: "The Argonaut",
    meaning: "Dreams that become reality",
    papusMeaning: "A dark young man, a friend.",
    type: "daat+royalship",
    deck: "egyptian",
    suit: "wands"
  },
  {
    number: 26,
    tarotCard: "Page of Wands",
    tarotCardFilename: "page_wands",
    egyptianCardName: "The Prodigy",
    meaning: "Don't rush, the precipitations are the doors to failure",
    papusMeaning:
      "A dark child, a friend. Also represents a message from a near relation.",
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
    meaning: "Ignite the flames of ideals, Trust in your inner divinity",
    papusMeaning: "Commencement of an enterprise.",
    type: "minor",
    deck: "egyptian",
    suit: "wands"
  },
  {
    number: 28,
    tarotCard: "Two of Wands",
    tarotCardFilename: "2_wands",
    egyptianCardName: "Desolation",
    meaning: "Formulate a strategy to use your own talents",
    papusMeaning:
      "Opposition to the commencement of the enterprise. The enterprise is commenced when an unexpected obstacle suddenly prevents its execution.",
    type: "minor",
    deck: "egyptian",
    suit: "wands"
  },
  {
    number: 29,
    tarotCard: "Three of Wands",
    tarotCardFilename: "3_wands",
    egyptianCardName: "Innovation",
    meaning: "Keep going despite losing something apparently important",
    papusMeaning:
      "Realization of the commencement of the enterprise. The basis of the work is now definitely established, and the undertaking can be fearlessly continued.",
    type: "minor",
    deck: "egyptian",
    suit: "wands"
  },
  {
    number: 30,
    tarotCard: "Four of Wands",
    tarotCardFilename: "4_wands",
    egyptianCardName: "Alliance",
    meaning: "Work in teams",
    papusMeaning:
      "Obstacles to the enterprise.",
    type: "minor",
    deck: "egyptian",
    suit: "wands"
  },
  {
    number: 31,
    tarotCard: "Five of Wands",
    tarotCardFilename: "5_wands",
    egyptianCardName: "Magnificence",
    meaning: "Strengthen the root chakra, overcome internal fears",
    papusMeaning: "Opposition to the obstacles. Victory after surmounting them.",
    type: "minor",
    deck: "egyptian",
    suit: "wands"
  },
  {
    number: 32,
    tarotCard: "Six of Wands",
    tarotCardFilename: "6_wands",
    egyptianCardName: "Impediment",
    meaning: "External victory, internal lack of internal self realization",
    papusMeaning:
      "Realization of the opposition. At last the obstacles succeed. Failure of the enterprise in the midst of its execution.",
    type: "minor",
    deck: "egyptian",
    suit: "wands"
  },
  {
    number: 33,
    tarotCard: "Seven of Wands",
    tarotCardFilename: "7_wands",
    egyptianCardName: "Exchange",
    meaning: "Face competitors in an ethical and loyal way",
    papusMeaning: "Certain success to the enterprise.",
    type: "minor",
    deck: "egyptian",
    suit: "wands"
  },
  {
    number: 34,
    tarotCard: "Eight of Wands",
    tarotCardFilename: "8_wands",
    egyptianCardName: "Domesticity",
    meaning: "Travel to the center of peace and intelligence",
    papusMeaning:
      "Opposition to its success. The enterprise will only partially succeed.",
    type: "minor",
    deck: "egyptian",
    suit: "wands"
  },
  {
    number: 35,
    tarotCard: "Nine of Wands",
    tarotCardFilename: "9_wands",
    egyptianCardName: "Uncertainty",
    meaning: "Obstacle that precedes total victory, gather hidden forces",
    papusMeaning: "Realization of success. Success is continued.",
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
      "Get out of apathy, create a new tree of life using the Lightning Path",
    papusMeaning: "Uncertainty in the management of the enterprise.",
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
      "Stop hurting yourself (related to The Lover), heals everyone and forgets about yourself, balm for your own wound",
    papusMeaning:
      "A fair man, a friend. This card also represents a barrister, judge, or ecclesiastic. It symbolizes a bachelor.",
    type: "daat+royalship",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 38,
    tarotCard: "Queen of Cups",
    tarotCardFilename: "queen_cups",
    egyptianCardName: "Duplicity",
    meaning: "Work with subtlety, positive challenges",
    papusMeaning:
      "A fair woman, a friend. The woman loved. The mistress.",
    type: "daat+royalship",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 39,
    tarotCard: "Knight of Cups",
    tarotCardFilename: "knight_cups",
    egyptianCardName: "Testimony",
    meaning: "Alternative healing",
    papusMeaning:
      "A young fair man, a friend. The young man loved. The lover.",
    type: "daat+royalship",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 40,
    tarotCard: "Page of Cups",
    tarotCardFilename: "page_cups",
    egyptianCardName: "Premonition",
    meaning: "Increase of self-esteem, emotional courage",
    papusMeaning: "A fair child. A messenger. Birth.",
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
    meaning: "Renewal or new affection, alternative treatment for health",
    papusMeaning: "Commencement of a love affair.",
    type: "minor",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 42,
    tarotCard: "Two of Cups",
    tarotCardFilename: "2_cups",
    egyptianCardName: "Versatility",
    meaning: "Do not poison yourself or the other person",
    papusMeaning:
      "Opposition to this commencement. Unimportant obstacles raised by one of the lovers.",
    type: "minor",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 43,
    tarotCard: "Three of Cups",
    tarotCardFilename: "3_cups",
    egyptianCardName: "Consummation",
    meaning: "Harmony between instinct and emotion, Be discreet",
    papusMeaning:
      "Realization of this commencement. The love is mutual.",
    type: "minor",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 44,
    tarotCard: "Four of Cups",
    tarotCardFilename: "4_cups",
    egyptianCardName: "Conjecture",
    meaning: "Abundance in emotional life, do not listen to slander",
    papusMeaning:
      "Serious obstacles to the love. They arise from other persons, not from the lovers.",
    type: "minor",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 45,
    tarotCard: "Five of Cups",
    tarotCardFilename: "5_cups",
    egyptianCardName: "Patrimony",
    meaning: "Do not break your spiritual commitment (your purpose)",
    papusMeaning:
      "Opposition to the obstacles. Victory over the obstacles after a struggle.",
    type: "minor",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 46,
    tarotCard: "Six of Cups",
    tarotCardFilename: "6_cups",
    egyptianCardName: "Regeneration",
    meaning: "Do not have self-pity",
    papusMeaning:
      "The obstacles triumph. Love destroyed in the midst of happiness. Widowhood.",
    type: "minor",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 47,
    tarotCard: "Seven of Cups",
    tarotCardFilename: "7_cups",
    egyptianCardName: "Expressiveness",
    meaning: "Gestations, related to The Star",
    papusMeaning: "Success assured to the lovers.",
    type: "minor",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 48,
    tarotCard: "Eight of Cups",
    tarotCardFilename: "8_cups",
    egyptianCardName: "Delusion",
    meaning: "Reflect on your emotional life after 18 hours",
    papusMeaning:
      "Partial failure of love. Love only partially succeeds.",
    type: "minor",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 49,
    tarotCard: "Nine of Cups",
    tarotCardFilename: "9_cups",
    egyptianCardName: "Preeminence",
    meaning: "Reconciliations and forgiveness",
    papusMeaning: "Motherhood.",
    type: "minor",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 50,
    tarotCard: "Ten of Cups",
    tarotCardFilename: "10_cups",
    egyptianCardName: "Dissension",
    meaning: "Marriage of the spirit with the soul, Alchemical Weddings",
    papusMeaning:
      "Uncertainty in the management of the love affair.",
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
    meaning: "Actions of victorious strategies",
    papusMeaning:
      "A dark, bad man. He is a soldier, a powerful enemy, who must be distrusted.",
    type: "daat+royalship",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 52,
    tarotCard: "Queen of Swords",
    tarotCardFilename: "queen_swords",
    egyptianCardName: "Premeditation",
    meaning: "Supremacy of the feminine, related to Justice",
    papusMeaning:
      "A dark wicked woman. The card also indicates her actions, gossip and calumnies.",
    type: "daat+royalship",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 53,
    tarotCard: "Knight of Swords",
    tarotCardFilename: "knight_swords",
    egyptianCardName: "Hostility",
    meaning: "Joint victorious actions",
    papusMeaning:
      "A young, dark man, an enemy. He is also a spy.",
    type: "daat+royalship",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 54,
    tarotCard: "Page of Swords",
    tarotCardFilename: "page_swords",
    egyptianCardName: "Examination",
    meaning: "Follow your intuition",
    papusMeaning: "A child, an enemy. Bad news. Delay.",
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
    meaning: "Conflicts before victory",
    papusMeaning: "Commencement of enmity.",
    type: "minor",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 56,
    tarotCard: "Two of Swords",
    tarotCardFilename: "2_swords",
    egyptianCardName: "Communion",
    meaning: "Traumas and conflicts to be overcome",
    papusMeaning:
      "Opposition to this commencement. The enmity does not last.",
    type: "minor",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 57,
    tarotCard: "Three of Swords",
    tarotCardFilename: "3_swords",
    egyptianCardName: "Proscription",
    meaning: "Death of yang, Fire, tendencies to depression",
    papusMeaning: "Realization of the enmity. Hatred.",
    type: "minor",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 58,
    tarotCard: "Four of Swords",
    tarotCardFilename: "4_swords",
    egyptianCardName: "Solitude",
    meaning: "Reflection, related to The Hermit",
    papusMeaning: "Opposition to the hatred. Success against the enemy.",
    type: "minor",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 59,
    tarotCard: "Five of Swords",
    tarotCardFilename: "5_swords",
    egyptianCardName: "Evolution",
    meaning: "Healthy self-challenge, Self-demands",
    papusMeaning:
      "Opposition to this opposition. The enemy triumphs at the moment one fancies the victory is secured.",
    type: "minor",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 60,
    tarotCard: "Six of Swords",
    tarotCardFilename: "6_swords",
    egyptianCardName: "Revelation",
    meaning: "External daily strategies, Future perspectives",
    papusMeaning:
      "Equilibrium of the opposition. The enemy is rendered powerless at last.",
    type: "minor",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 61,
    tarotCard: "Seven of Swords",
    tarotCardFilename: "7_swords",
    egyptianCardName: "Meditation",
    meaning: "Internal nocturnal strategies, related to The Hermit",
    papusMeaning: "Success assured to the enemy.",
    type: "minor",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 62,
    tarotCard: "Eight of Swords",
    tarotCardFilename: "8_swords",
    egyptianCardName: "Rivalry",
    meaning: "Appeal to superior forces, Internal and external conflicts",
    papusMeaning:
      "Partial opposition to this success. The enemy only partially triumphs.",
    type: "minor",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 63,
    tarotCard: "Nine of Swords",
    tarotCardFilename: "9_swords",
    egyptianCardName: "Pilgrimage",
    meaning: "The problems being imagined will never happen",
    papusMeaning: "Certain duration of the hatred.",
    type: "minor",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 64,
    tarotCard: "Ten of Swords",
    tarotCardFilename: "10_swords",
    egyptianCardName: "Contrition",
    meaning: "Death and rebirth, related to Death and The Tower",
    papusMeaning: "Uncertainty in the enmity.",
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
    meaning: "Turns everything into gold",
    papusMeaning: "A fair man, inimical or indifferent.",
    type: "daat+royalship",
    deck: "egyptian",
    suit: "pentacles"
  },
  {
    number: 66,
    tarotCard: "Queen of Pentacles",
    tarotCardFilename: "queen_pentacles",
    egyptianCardName: "Perplexity",
    meaning: "Act with diplomacy",
    papusMeaning: "A fair woman, indifferent, or inimical.",
    type: "daat+royalship",
    deck: "egyptian",
    suit: "pentacles"
  },
  {
    number: 67,
    tarotCard: "Knight of Pentacles",
    tarotCardFilename: "knight_pentacles",
    egyptianCardName: "Veneration",
    meaning: "Invest into new things",
    papusMeaning: "A young, fair man. A stranger. An arrival.",
    type: "daat+royalship",
    deck: "egyptian",
    suit: "pentacles"
  },
  {
    number: 68,
    tarotCard: "Page of Pentacles",
    tarotCardFilename: "page_pentacles",
    egyptianCardName: "Speculation",
    meaning: "Prudence in the material life",
    papusMeaning: "A fair child. A messenger. A letter.",
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
      "Rebirth through a single material goal, Form clear material goals",
    papusMeaning: "Commencement of fortune. Inheritance. Gifts. Economy.",
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
      "Light forming shadows, Duality asking for synthesis in the trinity, Don't put all the eggs in the same basket",
    papusMeaning:
      "Opposition to this commencement. Difficulty in well establishing the first landmarks of good fortune.",
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
      "Light forming sound, Establish balance through the trinity becoming a great dispenser, Verbalize what should be done, Do not settle for the first results",
    papusMeaning:
      "Realization of this commencement of fortune. A small sum.",
    type: "minor",
    deck: "egyptian",
    suit: "pentacles"
  },
  {
    number: 72,
    tarotCard: "Four of Pentacles",
    tarotCardFilename: "4_pentacles",
    egyptianCardName: "Generosity",
    meaning: "Avoid avarice / greed",
    papusMeaning: "Opposition of fortune. Loss of money.",
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
      "Only order will bring progress, Do not kick the barn without having something concrete in front of you",
    papusMeaning:
      "Opposition to this opposition. A success coming which will balance the low.",
    type: "minor",
    deck: "egyptian",
    suit: "pentacles"
  },
  {
    number: 74,
    tarotCard: "Six of Pentacles",
    tarotCardFilename: "6_pentacles",
    egyptianCardName: "Love and Desire",
    meaning: "Act with prudence",
    papusMeaning: "Realization of the opposition. Ruin.",
    type: "minor",
    deck: "egyptian",
    suit: "pentacles"
  },
  {
    number: 75,
    tarotCard: "Seven of Pentacles",
    tarotCardFilename: "7_pentacles",
    egyptianCardName: "Purification",
    meaning: "Don't boast about your proposal or project",
    papusMeaning: "Success assured. A large fortune.",
    type: "minor",
    deck: "egyptian",
    suit: "pentacles"
  },
  {
    number: 76,
    tarotCard: "Eight of Pentacles",
    tarotCardFilename: "8_pentacles",
    egyptianCardName: "Avarice",
    meaning: "Keep doing what you always did",
    papusMeaning:
      "Partial success. Great loss of money at the moment apparently of definitely securing the fortune.",
    type: "minor",
    deck: "egyptian",
    suit: "pentacles"
  },
  {
    number: 77,
    tarotCard: "Nine of Pentacles",
    tarotCardFilename: "9_pentacles",
    egyptianCardName: "Cooperation",
    meaning: "Work with what you like and earn something with it",
    papusMeaning: "Equilibrium of equilibrium. A durable fortune.",
    type: "minor",
    deck: "egyptian",
    suit: "pentacles"
  },
  {
    number: 78,
    tarotCard: "Ten of Pentacles",
    tarotCardFilename: "10_pentacles",
    egyptianCardName: "The Unforeseen",
    meaning: "Prosperity, Prosperous inheritance",
    papusMeaning:
      "Uncertainty in the fortune. Great success and great reverses.",
    type: "minor",
    deck: "egyptian",
    suit: "pentacles"
  }
]


const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray
}

/**
 * Shuffles a deck of tarot cards and optionally includes inverted cards
 * @param cards - Array of tarot cards to shuffle
 * @param includeInvertedCards - Whether to include inverted cards in the shuffle
 * @param shuffleCount - Number of times to shuffle the deck (default: 6)
 * @param shuffleDelay - Delay between shuffles in milliseconds (default: 300)
 * @returns Promise that resolves to the shuffled deck
 */
export async function shuffleTarotDeck(
  cards: TarotCard[],
  includeInvertedCards: boolean = false,
  shuffleCount: number = 6,
  shuffleDelay: number = 300
): Promise<TarotCard[]> {
  let shuffledCards = shuffleArray([...cards]);

  if (includeInvertedCards) {
    const halfIndex = Math.floor(shuffledCards.length / 2);
    shuffledCards = [
      ...shuffledCards
        .slice(0, halfIndex)
        .map(card => ({ ...card, isInverted: true })),
      ...shuffledCards.slice(halfIndex)
    ];
  }

  for (let i = 0; i < shuffleCount; i++) {
    shuffledCards = shuffleArray(shuffledCards);
    await sleep(shuffleDelay);
  }

  return shuffledCards;
}

type TarotDescriptiveDeckKey =
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
}

export type TarotAstrologyCorrespondenceType =
  | WesternAstrologyTypes.PLANET
  | WesternAstrologyTypes.WESTERN_ZODIAC_SIGN
  | WesternAstrologyTypes.WESTERN_ELEMENT;

export interface TarotAstrologyCorrespondence {
  type: TarotAstrologyCorrespondenceType;
  id: NodeId<TarotAstrologyCorrespondenceType>;
  label: string;
}

export interface TarotArchetype {
  canonicalId: NodeId<KaabalahTypes.PATH>;
  kind: "major";
  pathId: NodeId<KaabalahTypes.PATH>;
  pathNumber: number;
  pathSlug: string;
  hebrewLetterId: NodeId<LetterTypes.HEBREW_LETTER>;
  hebrewLetter: string;
  pathMeaning?: string;
  tarotArkAnnuId: NodeId<TarotTypes.TAROT_ARK_ANNU>;
  tarotCardNumber: number;
  tarotCardName: string;
  tarotCardFilename: MajorArcana;
  tarotMeaning?: string;
  astrology: TarotAstrologyCorrespondence[];
  availableDeckIds: TarotDeckId[];
  descriptionsByDeck: Partial<Record<TarotDeckId, TarotDeckDescription>>;
}

export type TarotArchetypeLookup =
  | { pathSlug: string }
  | { pathId: NodeId<KaabalahTypes.PATH> }
  | { tarotCardFilename: MajorArcana | string }
  | { tarotCardNumber: number };

export type TarotCardKind = "major" | "court" | "minor";

export type TarotAssetPathType = "major" | "minor" | "daat+royalship";

export interface TarotCardProfile {
  tarotArkAnnuId: NodeId<TarotTypes.TAROT_ARK_ANNU>;
  tarotCardNumber: number;
  tarotCardName: string;
  tarotCardFilename: string;
  tarotMeaning?: string;
  kind: TarotCardKind;
  assetPathType: TarotAssetPathType;
  suit?: string;
  availableDeckIds: TarotDeckId[];
  descriptionsByDeck: Partial<Record<TarotDeckId, TarotDeckDescription>>;
}

export type TarotImageLookup =
  | TarotArchetypeLookup
  | { tarotArkAnnuId: NodeId<TarotTypes.TAROT_ARK_ANNU> }
  | { tarotCardName: string };

export interface TarotRepresentation {
  card: TarotCardProfile;
  archetype?: TarotArchetype;
  deck: TarotDeckMetadata;
  assetPath: string;
  imageUrl: string;
  label: string;
  altText: string;
  cardLabel: string;
  description?: TarotDeckDescription;
}

export const TAROT_IMAGE_BASE_URL =
  "https://kaabalah-app.s3.us-east-1.amazonaws.com/tarot";

type TarotDeckConfig = TarotDeckMetadata & {
  descriptiveDataKey?: TarotDescriptiveDeckKey;
};

const TAROT_DECK_METADATA: readonly TarotDeckConfig[] = [
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

type TarotMajorCard = TarotCard & {
  type: "major";
  tarotCardFilename: MajorArcana;
};

type TarotArchetypeCache = {
  archetypes: TarotArchetype[];
  byPathId: Map<string, TarotArchetype>;
  byPathSlug: Map<string, TarotArchetype>;
  byTarotCardFilename: Map<string, TarotArchetype>;
  byTarotCardNumber: Map<number, TarotArchetype>;
};

type TarotCardProfileCache = {
  profiles: TarotCardProfile[];
  byTarotArkAnnuId: Map<string, TarotCardProfile>;
  byTarotCardName: Map<string, TarotCardProfile>;
  byTarotCardFilename: Map<string, TarotCardProfile>;
  byTarotCardNumber: Map<number, TarotCardProfile>;
};

const MAJOR_ARCANA_CARDS = ARKANNUS.filter(
  (card): card is TarotMajorCard =>
    card.type === "major" &&
    majorArcana.includes(card.tarotCardFilename as MajorArcana)
);

let tarotArchetypeCache: TarotArchetypeCache | undefined;
let tarotCardProfileCache: TarotCardProfileCache | undefined;

function normalizePathSlug(pathSlug: string): string {
  return pathSlug
    .trim()
    .replace(/^\/?path\//i, "")
    .toLowerCase();
}

function normalizeTarotLookupKey(value: string): string {
  return value.trim().toLowerCase();
}

function toTarotCardKind(card: TarotCard): TarotCardKind {
  if (card.type === "major") {
    return "major";
  }

  return card.type === "minor" ? "minor" : "court";
}

function toTarotAssetPathType(card: TarotCard): TarotAssetPathType {
  return card.type;
}

function buildTarotAssetPath(card: TarotCardProfile): string {
  if (card.assetPathType === "major") {
    return `major/${card.tarotCardFilename}`;
  }

  if (!card.suit) {
    throw new Error(
      `Missing suit metadata required to resolve tarot image path for ${card.tarotCardName}.`
    );
  }

  return `${card.assetPathType}/${card.suit}/${card.tarotCardFilename}`;
}

function toAstrologyCorrespondence<T extends TarotAstrologyCorrespondenceType>(
  node: Node<T>
): TarotAstrologyCorrespondence {
  return {
    type: node.type,
    id: node.id,
    label: parseId(node.id)
  };
}

function buildDescriptionsByDeck(
  tarotArkAnnu: Node<TarotTypes.TAROT_ARK_ANNU>
): Partial<Record<TarotDeckId, TarotDeckDescription>> {
  const descriptions: Partial<Record<TarotDeckId, TarotDeckDescription>> = {};

  for (const deck of TAROT_DECK_METADATA) {
    if (!deck.descriptiveDataKey) {
      continue;
    }

    const description =
      tarotArkAnnu.data?.descriptiveData?.[deck.descriptiveDataKey];

    if (!description) {
      continue;
    }

    descriptions[deck.id] = { ...description };
  }

  return descriptions;
}

function getTarotArchetypeCache(): TarotArchetypeCache {
  if (tarotArchetypeCache) {
    return tarotArchetypeCache;
  }

  const tree = getCanonicalTree({
    system: "kaabalah",
    parts: ["westernAstrology", "tarot"]
  });

  const archetypes = MAJOR_ARCANA_CARDS.map((card) => {
    const pathId = id(KaabalahTypes.PATH, card.number);
    const path = tree.getNode(pathId);
    const hebrewLetter = tree.getCorrespondences(pathId, {
      type: LetterTypes.HEBREW_LETTER,
      limit: 1
    })[0]?.node;
    const tarotArkAnnu = tree.getCorrespondences(pathId, {
      type: TarotTypes.TAROT_ARK_ANNU,
      limit: 1
    })[0]?.node;

    if (!path || !hebrewLetter || !tarotArkAnnu) {
      throw new Error(
        `Missing canonical tarot archetype metadata for ${pathId}.`
      );
    }

    const astrology = tree.getCorrespondences(pathId, {
      type: [
        WesternAstrologyTypes.WESTERN_ELEMENT,
        WesternAstrologyTypes.PLANET,
        WesternAstrologyTypes.WESTERN_ZODIAC_SIGN
      ]
    }).map(({ node }) =>
      toAstrologyCorrespondence(
        node as Node<TarotAstrologyCorrespondenceType>
      )
    );

    const descriptionsByDeck = buildDescriptionsByDeck(tarotArkAnnu);

    return {
      canonicalId: pathId,
      kind: "major" as const,
      pathId,
      pathNumber: card.number,
      pathSlug: parseId(hebrewLetter.id).toLowerCase(),
      hebrewLetterId: hebrewLetter.id,
      hebrewLetter: parseId(hebrewLetter.id),
      pathMeaning: path.data?.meaning,
      tarotArkAnnuId: tarotArkAnnu.id,
      tarotCardNumber: card.number,
      tarotCardName: parseId(tarotArkAnnu.id),
      tarotCardFilename: card.tarotCardFilename,
      tarotMeaning:
        descriptionsByDeck.papus_pt?.meaning ??
        card.meaning,
      astrology,
      availableDeckIds: TAROT_DECK_METADATA.map((deck) => deck.id),
      descriptionsByDeck
    };
  });

  tarotArchetypeCache = {
    archetypes,
    byPathId: new Map(archetypes.map((archetype) => [archetype.pathId, archetype])),
    byPathSlug: new Map(
      archetypes.map((archetype) => [archetype.pathSlug, archetype])
    ),
    byTarotCardFilename: new Map(
      archetypes.map((archetype) => [archetype.tarotCardFilename, archetype])
    ),
    byTarotCardNumber: new Map(
      archetypes.map((archetype) => [archetype.tarotCardNumber, archetype])
    )
  };

  return tarotArchetypeCache;
}

function getTarotCardProfileCache(): TarotCardProfileCache {
  if (tarotCardProfileCache) {
    return tarotCardProfileCache;
  }

  const tree = getCanonicalTree({
    system: "kaabalah",
    parts: ["westernAstrology", "tarot"]
  });
  const availableDeckIds = TAROT_DECK_METADATA.map((deck) => deck.id);

  const profiles = ARKANNUS.map((card) => {
    const tarotArkAnnuId = id(TarotTypes.TAROT_ARK_ANNU, card.tarotCard);
    const tarotArkAnnu = tree.getNode(tarotArkAnnuId);

    if (!tarotArkAnnu) {
      throw new Error(`Missing canonical tarot metadata for ${tarotArkAnnuId}.`);
    }

    const descriptionsByDeck = buildDescriptionsByDeck(tarotArkAnnu);

    return {
      tarotArkAnnuId,
      tarotCardNumber: card.number,
      tarotCardName: card.tarotCard,
      tarotCardFilename: card.tarotCardFilename,
      tarotMeaning:
        descriptionsByDeck.papus_pt?.meaning ??
        card.meaning,
      kind: toTarotCardKind(card),
      assetPathType: toTarotAssetPathType(card),
      suit: card.suit,
      availableDeckIds,
      descriptionsByDeck
    };
  });

  tarotCardProfileCache = {
    profiles,
    byTarotArkAnnuId: new Map(
      profiles.map((profile) => [String(profile.tarotArkAnnuId), profile])
    ),
    byTarotCardName: new Map(
      profiles.map((profile) => [
        normalizeTarotLookupKey(profile.tarotCardName),
        profile
      ])
    ),
    byTarotCardFilename: new Map(
      profiles.map((profile) => [
        normalizeTarotLookupKey(profile.tarotCardFilename),
        profile
      ])
    ),
    byTarotCardNumber: new Map(
      profiles.map((profile) => [profile.tarotCardNumber, profile])
    )
  };

  return tarotCardProfileCache;
}

function buildTarotRepresentation(
  card: TarotCardProfile,
  deck: TarotDeckConfig
): TarotRepresentation {
  const description = card.descriptionsByDeck[deck.id];
  const assetPath = buildTarotAssetPath(card);
  const imageUrl = `${TAROT_IMAGE_BASE_URL}/${deck.id}/${assetPath}.jpg`;

  return {
    card,
    archetype: card.kind === "major"
      ? getTarotArchetype({ tarotCardNumber: card.tarotCardNumber })
      : undefined,
    deck: { id: deck.id, label: deck.label },
    assetPath,
    imageUrl,
    label: `${card.tarotCardName} - ${deck.label}`,
    altText: `${card.tarotCardName} - ${deck.label}`,
    cardLabel: description?.name ?? card.tarotCardName,
    description
  };
}

function getTarotCardProfile(
  lookup: TarotImageLookup
): TarotCardProfile | undefined {
  const cache = getTarotCardProfileCache();

  if ("pathSlug" in lookup || "pathId" in lookup) {
    const archetype = getTarotArchetype(lookup);
    return archetype
      ? cache.byTarotCardNumber.get(archetype.tarotCardNumber)
      : undefined;
  }

  if ("tarotArkAnnuId" in lookup) {
    return cache.byTarotArkAnnuId.get(String(lookup.tarotArkAnnuId));
  }

  if ("tarotCardName" in lookup) {
    return cache.byTarotCardName.get(
      normalizeTarotLookupKey(lookup.tarotCardName)
    );
  }

  if ("tarotCardFilename" in lookup) {
    return cache.byTarotCardFilename.get(
      normalizeTarotLookupKey(lookup.tarotCardFilename)
    );
  }

  return cache.byTarotCardNumber.get(lookup.tarotCardNumber);
}

export function listTarotDecks(): TarotDeckMetadata[] {
  return TAROT_DECK_METADATA.map(({ id, label }) => ({ id, label }));
}

export function getTarotArchetype(
  lookup: TarotArchetypeLookup
): TarotArchetype | undefined {
  const cache = getTarotArchetypeCache();

  if ("pathSlug" in lookup) {
    return cache.byPathSlug.get(normalizePathSlug(lookup.pathSlug));
  }

  if ("pathId" in lookup) {
    return cache.byPathId.get(String(lookup.pathId));
  }

  if ("tarotCardFilename" in lookup) {
    return cache.byTarotCardFilename.get(
      lookup.tarotCardFilename.toLowerCase()
    );
  }

  return cache.byTarotCardNumber.get(lookup.tarotCardNumber);
}

export function getTarotRepresentations(
  lookup: TarotImageLookup
): TarotRepresentation[] {
  const card = getTarotCardProfile(lookup);

  if (!card) {
    return [];
  }

  return TAROT_DECK_METADATA.map((deck) =>
    buildTarotRepresentation(card, deck)
  );
}

export function getTarotRepresentation(
  lookup: TarotImageLookup,
  deckId: TarotDeckId
): TarotRepresentation | undefined {
  const card = getTarotCardProfile(lookup);
  const deck = TAROT_DECK_METADATA.find((candidate) => candidate.id === deckId);

  if (!card || !deck) {
    return undefined;
  }

  return buildTarotRepresentation(card, deck);
}

export function resolveTarotImageUrl(
  lookup: TarotImageLookup,
  deckId: TarotDeckId
): string | undefined {
  return getTarotRepresentation(lookup, deckId)?.imageUrl;
}

export type TarotSpreadId =
  | "quick-insight"
  | "conscious-reading"
  | "time-reading"
  | "dialectic-reading"
  | "tree-of-life-reading"
  | "celtic-cross"
  | "event-reading";

export type TarotSpreadContextKey = "inquirerGender";
export type TarotInquirerGender = "man" | "woman";
export type TarotSpreadCardType = TarotCard["type"];
export type TarotSpreadMinorRank =
  | "ace"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10";

export interface TarotSpreadCardConstraint {
  allowedTypes?: TarotSpreadCardType[];
  requiredRank?: TarotSpreadMinorRank;
  allowedCardFilenames?: string[];
  excludedCardFilenames?: string[];
}

export interface TarotSpreadSlotMetadata {
  displayLabel?: string;
  groupKey?: string;
  note?: string;
  orientation?: "upright" | "sideways";
  temporalPhase?: "past" | "present" | "future";
}

export interface TarotSpreadSlotDefinition {
  slotKey: string;
  label: string;
  order: number;
  minCards: number;
  maxCards: number;
  validationRules?: TarotSpreadCardConstraint;
  manualSelectionRules?: TarotSpreadCardConstraint;
  drawRules?: TarotSpreadCardConstraint;
  metadata?: TarotSpreadSlotMetadata;
}

export interface TarotSpreadInquirerRule {
  slotKey: string;
  sourceSlotKeys: string[];
  cardNumbersByGender: Record<TarotInquirerGender, number>;
}

export interface TarotSpreadDefinition {
  spreadId: TarotSpreadId;
  label: string;
  description?: string;
  contextRequirements?: TarotSpreadContextKey[];
  slots: TarotSpreadSlotDefinition[];
  specialRules?: {
    inquirerCard?: TarotSpreadInquirerRule;
  };
}

export interface TarotSpreadSelectionContext {
  inquirerGender?: TarotInquirerGender;
}

export interface TarotSpreadSelectionCard {
  slotKey: string;
  cardNumber: number;
  isInverted?: boolean;
}

export interface TarotSpreadResolvedSelectionCard
  extends TarotSpreadSelectionCard {
  card: TarotCard;
  slot: TarotSpreadSlotDefinition;
}

export type TarotSpreadValidationErrorCode =
  | "UNKNOWN_SPREAD"
  | "UNKNOWN_SLOT"
  | "CARD_NOT_FOUND"
  | "DUPLICATE_CARD"
  | "MISSING_REQUIRED_CARDS"
  | "TOO_MANY_CARDS"
  | "INVALID_CARD_TYPE"
  | "INVALID_CARD_RANK"
  | "DISALLOWED_CARD"
  | "MISSING_CONTEXT"
  | "INVALID_INQUIRER_CARD";

export interface TarotSpreadValidationIssue {
  code: TarotSpreadValidationErrorCode;
  message: string;
  slotKey?: string;
  cardNumber?: number;
}

export interface TarotSpreadValidationResult {
  ok: boolean;
  isComplete: boolean;
  spread?: TarotSpreadDefinition;
  resolvedCards: TarotSpreadResolvedSelectionCard[];
  errors: TarotSpreadValidationIssue[];
}

export interface TarotSpreadValidationInput {
  spreadId: TarotSpreadId;
  cards: TarotSpreadSelectionCard[];
  context?: TarotSpreadSelectionContext;
  allowPartial?: boolean;
}

export interface DrawTarotSpreadOptions {
  spreadId: TarotSpreadId;
  deckId?: TarotDeckId;
  includeInverted?: boolean;
  rng?: () => number;
  context?: TarotSpreadSelectionContext;
}

export interface TarotSpreadDrawResult {
  spread: TarotSpreadDefinition;
  deckId: TarotDeckId;
  context?: TarotSpreadSelectionContext;
  cards: TarotSpreadResolvedSelectionCard[];
}

const TAROT_SPREAD_MINOR_RANKS: readonly TarotSpreadMinorRank[] = [
  "ace",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10"
];

const EVENT_INNER_SLOT_KEYS = [
  "inner-1",
  "inner-2",
  "inner-3",
  "inner-4",
  "inner-5",
  "inner-6",
  "inner-7"
] as const;

const TAROT_CARD_BY_NUMBER = new Map(
  ARKANNUS.map((card) => [card.number, card] as const)
);

function createEventOuterSlot(
  index: number,
  temporalPhase: TarotSpreadSlotMetadata["temporalPhase"]
): TarotSpreadSlotDefinition {
  return {
    slotKey: `outer-${index}`,
    label: String(index),
    order: index,
    minCards: 1,
    maxCards: 1,
    validationRules: {
      allowedTypes: ["minor", "daat+royalship"]
    },
    manualSelectionRules: {
      allowedTypes: ["minor", "daat+royalship"]
    },
    drawRules: {
      allowedTypes: ["minor", "daat+royalship"]
    },
    metadata: {
      displayLabel: String(index),
      groupKey: "outer",
      temporalPhase
    }
  };
}

function createEventInnerSlot(
  index: number,
  label: string,
  note: string
): TarotSpreadSlotDefinition {
  return {
    slotKey: `inner-${index}`,
    label,
    order: 100 + index,
    minCards: 1,
    maxCards: 1,
    validationRules: {
      allowedTypes: ["major"]
    },
    manualSelectionRules: {
      allowedTypes: ["major"],
      excludedCardFilenames: [
        "01_the_magician",
        "02_the_high_priestess"
      ]
    },
    drawRules: {
      allowedTypes: ["major"]
    },
    metadata: {
      displayLabel: `${index}.`,
      groupKey: "inner",
      note
    }
  };
}

const TAROT_SPREADS: readonly TarotSpreadDefinition[] = [
  {
    spreadId: "quick-insight",
    label: "Quick Insight",
    description: "A single-card reading for immediate insight.",
    slots: [
      {
        slotKey: "quick-insight",
        label: "Quick Insight",
        order: 1,
        minCards: 1,
        maxCards: 1
      }
    ]
  },
  {
    spreadId: "conscious-reading",
    label: "Conscious Reading",
    description:
      "Three-card spread for conscious, unconscious, and subconscious layers.",
    slots: [
      {
        slotKey: "conscious",
        label: "Conscious",
        order: 1,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["major"]
        },
        manualSelectionRules: {
          allowedTypes: ["major"]
        },
        drawRules: {
          allowedTypes: ["major"]
        }
      },
      {
        slotKey: "unconscious",
        label: "Unconscious",
        order: 2,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["daat+royalship"]
        },
        manualSelectionRules: {
          allowedTypes: ["daat+royalship"]
        },
        drawRules: {
          allowedTypes: ["daat+royalship"]
        }
      },
      {
        slotKey: "subconscious",
        label: "Subconscious",
        order: 3,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["minor"]
        },
        manualSelectionRules: {
          allowedTypes: ["minor"]
        },
        drawRules: {
          allowedTypes: ["minor"]
        }
      }
    ]
  },
  {
    spreadId: "time-reading",
    label: "Time Reading",
    description: "Three major arcana cards for past, present, and future.",
    slots: [
      {
        slotKey: "past",
        label: "Past",
        order: 1,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["major"]
        },
        manualSelectionRules: {
          allowedTypes: ["major"]
        },
        drawRules: {
          allowedTypes: ["major"]
        }
      },
      {
        slotKey: "present",
        label: "Present",
        order: 2,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["major"]
        },
        manualSelectionRules: {
          allowedTypes: ["major"]
        },
        drawRules: {
          allowedTypes: ["major"]
        }
      },
      {
        slotKey: "future",
        label: "Future",
        order: 3,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["major"]
        },
        manualSelectionRules: {
          allowedTypes: ["major"]
        },
        drawRules: {
          allowedTypes: ["major"]
        }
      }
    ]
  },
  {
    spreadId: "dialectic-reading",
    label: "Dialectic Reading",
    description: "Three major arcana cards for thesis, antithesis, and synthesis.",
    slots: [
      {
        slotKey: "thesis",
        label: "Thesis",
        order: 1,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["major"]
        },
        manualSelectionRules: {
          allowedTypes: ["major"]
        },
        drawRules: {
          allowedTypes: ["major"]
        }
      },
      {
        slotKey: "antithesis",
        label: "Antithesis",
        order: 2,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["major"]
        },
        manualSelectionRules: {
          allowedTypes: ["major"]
        },
        drawRules: {
          allowedTypes: ["major"]
        }
      },
      {
        slotKey: "synthesis",
        label: "Synthesis",
        order: 3,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["major"]
        },
        manualSelectionRules: {
          allowedTypes: ["major"]
        },
        drawRules: {
          allowedTypes: ["major"]
        }
      }
    ]
  },
  {
    spreadId: "tree-of-life-reading",
    label: "Tree of Life Reading",
    description:
      "Ten numbered minor arcana slots mapped to the spheres plus four Daath court cards.",
    slots: [
      {
        slotKey: "kether",
        label: "Kether",
        order: 1,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["minor"],
          requiredRank: "ace"
        },
        manualSelectionRules: {
          allowedTypes: ["minor"],
          requiredRank: "ace"
        },
        drawRules: {
          allowedTypes: ["minor"],
          requiredRank: "ace"
        }
      },
      {
        slotKey: "chokhmah",
        label: "Chokhmah",
        order: 2,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["minor"],
          requiredRank: "2"
        },
        manualSelectionRules: {
          allowedTypes: ["minor"],
          requiredRank: "2"
        },
        drawRules: {
          allowedTypes: ["minor"],
          requiredRank: "2"
        }
      },
      {
        slotKey: "binah",
        label: "Binah",
        order: 3,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["minor"],
          requiredRank: "3"
        },
        manualSelectionRules: {
          allowedTypes: ["minor"],
          requiredRank: "3"
        },
        drawRules: {
          allowedTypes: ["minor"],
          requiredRank: "3"
        }
      },
      {
        slotKey: "chesed",
        label: "Chesed",
        order: 4,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["minor"],
          requiredRank: "4"
        },
        manualSelectionRules: {
          allowedTypes: ["minor"],
          requiredRank: "4"
        },
        drawRules: {
          allowedTypes: ["minor"],
          requiredRank: "4"
        }
      },
      {
        slotKey: "geburah",
        label: "Geburah",
        order: 5,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["minor"],
          requiredRank: "5"
        },
        manualSelectionRules: {
          allowedTypes: ["minor"],
          requiredRank: "5"
        },
        drawRules: {
          allowedTypes: ["minor"],
          requiredRank: "5"
        }
      },
      {
        slotKey: "tiphareth",
        label: "Tiphareth",
        order: 6,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["minor"],
          requiredRank: "6"
        },
        manualSelectionRules: {
          allowedTypes: ["minor"],
          requiredRank: "6"
        },
        drawRules: {
          allowedTypes: ["minor"],
          requiredRank: "6"
        }
      },
      {
        slotKey: "netzach",
        label: "Netzach",
        order: 7,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["minor"],
          requiredRank: "7"
        },
        manualSelectionRules: {
          allowedTypes: ["minor"],
          requiredRank: "7"
        },
        drawRules: {
          allowedTypes: ["minor"],
          requiredRank: "7"
        }
      },
      {
        slotKey: "hod",
        label: "Hod",
        order: 8,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["minor"],
          requiredRank: "8"
        },
        manualSelectionRules: {
          allowedTypes: ["minor"],
          requiredRank: "8"
        },
        drawRules: {
          allowedTypes: ["minor"],
          requiredRank: "8"
        }
      },
      {
        slotKey: "yesod",
        label: "Yesod",
        order: 9,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["minor"],
          requiredRank: "9"
        },
        manualSelectionRules: {
          allowedTypes: ["minor"],
          requiredRank: "9"
        },
        drawRules: {
          allowedTypes: ["minor"],
          requiredRank: "9"
        }
      },
      {
        slotKey: "malkuth",
        label: "Malkuth",
        order: 10,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["minor"],
          requiredRank: "10"
        },
        manualSelectionRules: {
          allowedTypes: ["minor"],
          requiredRank: "10"
        },
        drawRules: {
          allowedTypes: ["minor"],
          requiredRank: "10"
        }
      },
      {
        slotKey: "daath",
        label: "Daath",
        order: 11,
        minCards: 4,
        maxCards: 4,
        validationRules: {
          allowedTypes: ["daat+royalship"]
        },
        manualSelectionRules: {
          allowedTypes: ["daat+royalship"]
        },
        drawRules: {
          allowedTypes: ["daat+royalship"]
        }
      }
    ]
  },
  {
    spreadId: "celtic-cross",
    label: "Celtic Cross",
    description: "Classic ten-card Celtic Cross spread.",
    slots: [
      {
        slotKey: "present",
        label: "The Present",
        order: 1,
        minCards: 1,
        maxCards: 1,
        metadata: {
          displayLabel: "1."
        }
      },
      {
        slotKey: "challenge",
        label: "The Challenge",
        order: 2,
        minCards: 1,
        maxCards: 1,
        metadata: {
          displayLabel: "2.",
          orientation: "sideways"
        }
      },
      {
        slotKey: "above",
        label: "Above",
        order: 3,
        minCards: 1,
        maxCards: 1,
        metadata: {
          displayLabel: "3."
        }
      },
      {
        slotKey: "below",
        label: "Below",
        order: 4,
        minCards: 1,
        maxCards: 1,
        metadata: {
          displayLabel: "4."
        }
      },
      {
        slotKey: "behind",
        label: "Behind",
        order: 5,
        minCards: 1,
        maxCards: 1,
        metadata: {
          displayLabel: "5."
        }
      },
      {
        slotKey: "before",
        label: "Before",
        order: 6,
        minCards: 1,
        maxCards: 1,
        metadata: {
          displayLabel: "6."
        }
      },
      {
        slotKey: "self",
        label: "Self",
        order: 7,
        minCards: 1,
        maxCards: 1,
        metadata: {
          displayLabel: "7."
        }
      },
      {
        slotKey: "environment",
        label: "Environment",
        order: 8,
        minCards: 1,
        maxCards: 1,
        metadata: {
          displayLabel: "8."
        }
      },
      {
        slotKey: "hopes-fears",
        label: "Hopes/Fears",
        order: 9,
        minCards: 1,
        maxCards: 1,
        metadata: {
          displayLabel: "9."
        }
      },
      {
        slotKey: "outcome",
        label: "Outcome",
        order: 10,
        minCards: 1,
        maxCards: 1,
        metadata: {
          displayLabel: "10."
        }
      }
    ]
  },
  {
    spreadId: "event-reading",
    label: "Event Reading",
    description:
      "Papus-style event spread with outer minor/court cards, seven major cards, and an inquirer card.",
    contextRequirements: ["inquirerGender"],
    slots: [
      createEventOuterSlot(1, "past"),
      createEventOuterSlot(2, "past"),
      createEventOuterSlot(3, "past"),
      createEventOuterSlot(4, "past"),
      createEventOuterSlot(5, "present"),
      createEventOuterSlot(6, "present"),
      createEventOuterSlot(7, "present"),
      createEventOuterSlot(8, "present"),
      createEventOuterSlot(9, "future"),
      createEventOuterSlot(10, "future"),
      createEventOuterSlot(11, "future"),
      createEventOuterSlot(12, "future"),
      createEventInnerSlot(
        1,
        "Commencement",
        "Character of the beginning phase."
      ),
      createEventInnerSlot(2, "Apogee", "Peak or zenith of the event."),
      createEventInnerSlot(
        3,
        "Decline/Obstacle",
        "Challenges, obstacles, or decline."
      ),
      createEventInnerSlot(4, "Fall", "Conclusion or end phase."),
      createEventInnerSlot(
        5,
        "The Past",
        "Special character or influence in the past."
      ),
      createEventInnerSlot(
        6,
        "The Present",
        "Special character or influence in the present."
      ),
      createEventInnerSlot(
        7,
        "The Future",
        "Special character or influence to come."
      ),
      {
        slotKey: "inquirer",
        label: "Inquirer",
        order: 200,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["major"]
        },
        manualSelectionRules: {
          allowedTypes: ["major"],
          allowedCardFilenames: [
            "01_the_magician",
            "02_the_high_priestess"
          ]
        },
        drawRules: {
          allowedTypes: ["major"]
        },
        metadata: {
          displayLabel: "Inquirer",
          groupKey: "center",
          note: "The querent's energy in this reading."
        }
      }
    ],
    specialRules: {
      inquirerCard: {
        slotKey: "inquirer",
        sourceSlotKeys: [...EVENT_INNER_SLOT_KEYS],
        cardNumbersByGender: {
          man: 1,
          woman: 2
        }
      }
    }
  }
] as const;

const TAROT_SPREAD_BY_ID = new Map(
  TAROT_SPREADS.map((spread) => [spread.spreadId, spread] as const)
);

function cloneCardConstraint(
  constraint?: TarotSpreadCardConstraint
): TarotSpreadCardConstraint | undefined {
  if (!constraint) {
    return undefined;
  }

  return {
    allowedTypes: constraint.allowedTypes
      ? [...constraint.allowedTypes]
      : undefined,
    requiredRank: constraint.requiredRank,
    allowedCardFilenames: constraint.allowedCardFilenames
      ? [...constraint.allowedCardFilenames]
      : undefined,
    excludedCardFilenames: constraint.excludedCardFilenames
      ? [...constraint.excludedCardFilenames]
      : undefined
  };
}

function cloneSlotDefinition(
  slot: TarotSpreadSlotDefinition
): TarotSpreadSlotDefinition {
  return {
    ...slot,
    validationRules: cloneCardConstraint(slot.validationRules),
    manualSelectionRules: cloneCardConstraint(slot.manualSelectionRules),
    drawRules: cloneCardConstraint(slot.drawRules),
    metadata: slot.metadata ? { ...slot.metadata } : undefined
  };
}

function cloneSpreadDefinition(
  spread: TarotSpreadDefinition
): TarotSpreadDefinition {
  return {
    ...spread,
    contextRequirements: spread.contextRequirements
      ? [...spread.contextRequirements]
      : undefined,
    slots: spread.slots.map(cloneSlotDefinition),
    specialRules: spread.specialRules?.inquirerCard
      ? {
          inquirerCard: {
            slotKey: spread.specialRules.inquirerCard.slotKey,
            sourceSlotKeys: [...spread.specialRules.inquirerCard.sourceSlotKeys],
            cardNumbersByGender: {
              ...spread.specialRules.inquirerCard.cardNumbersByGender
            }
          }
        }
      : undefined
  };
}

function getTarotCardByNumber(cardNumber: number): TarotCard | undefined {
  return TAROT_CARD_BY_NUMBER.get(cardNumber);
}

function getTarotSpreadRuleForValidation(
  slot: TarotSpreadSlotDefinition
): TarotSpreadCardConstraint | undefined {
  return slot.validationRules ?? slot.drawRules ?? slot.manualSelectionRules;
}

function getTarotSpreadRuleForDraw(
  slot: TarotSpreadSlotDefinition
): TarotSpreadCardConstraint | undefined {
  return slot.drawRules ?? slot.validationRules ?? slot.manualSelectionRules;
}

function getTarotMinorRank(
  card: TarotCard
): TarotSpreadMinorRank | undefined {
  if (card.type !== "minor") {
    return undefined;
  }

  const rank = card.tarotCardFilename.split("_")[0] as TarotSpreadMinorRank;
  return TAROT_SPREAD_MINOR_RANKS.includes(rank) ? rank : undefined;
}

function matchesTarotSpreadConstraint(
  card: TarotCard,
  constraint?: TarotSpreadCardConstraint
): boolean {
  if (!constraint) {
    return true;
  }

  if (
    constraint.allowedTypes &&
    !constraint.allowedTypes.includes(card.type)
  ) {
    return false;
  }

  if (
    constraint.allowedCardFilenames &&
    !constraint.allowedCardFilenames.includes(card.tarotCardFilename)
  ) {
    return false;
  }

  if (
    constraint.excludedCardFilenames &&
    constraint.excludedCardFilenames.includes(card.tarotCardFilename)
  ) {
    return false;
  }

  if (constraint.requiredRank) {
    return getTarotMinorRank(card) === constraint.requiredRank;
  }

  return true;
}

function randomIndex(length: number, rng: () => number): number {
  if (length <= 0) {
    throw new Error("Cannot draw from an empty pool.");
  }

  const raw = rng();
  if (!Number.isFinite(raw)) {
    throw new Error("Tarot spread RNG must return a finite number.");
  }

  const normalized = Math.min(Math.max(raw, 0), 1 - Number.EPSILON);
  return Math.floor(normalized * length);
}

function withSpreadCardOrientation(
  card: TarotCard,
  includeInverted: boolean,
  rng: () => number
): TarotCard {
  return {
    ...card,
    isInverted: includeInverted ? rng() < 0.5 : false
  };
}

function resolveTarotSpreadSelectionCard(
  card: TarotSpreadSelectionCard,
  slot: TarotSpreadSlotDefinition,
  tarotCard: TarotCard
): TarotSpreadResolvedSelectionCard {
  return {
    ...card,
    slot,
    card: {
      ...tarotCard,
      isInverted: card.isInverted ?? false
    }
  };
}

function sortResolvedTarotSpreadCards(
  resolvedCards: TarotSpreadResolvedSelectionCard[]
): TarotSpreadResolvedSelectionCard[] {
  return [...resolvedCards].sort((left, right) => {
    if (left.slot.order !== right.slot.order) {
      return left.slot.order - right.slot.order;
    }

    return left.card.number - right.card.number;
  });
}

function validateEventInquirerCard(
  spread: TarotSpreadDefinition,
  resolvedCards: TarotSpreadResolvedSelectionCard[],
  context: TarotSpreadSelectionContext | undefined,
  errors: TarotSpreadValidationIssue[]
): void {
  const inquirerRule = spread.specialRules?.inquirerCard;

  if (!inquirerRule) {
    return;
  }

  if (!context?.inquirerGender) {
    return;
  }

  const inquirerCardNumber =
    inquirerRule.cardNumbersByGender[context.inquirerGender];
  const sourceCards = resolvedCards.filter((card) =>
    inquirerRule.sourceSlotKeys.includes(card.slotKey)
  );
  const inquirerCards = resolvedCards.filter(
    (card) => card.slotKey === inquirerRule.slotKey
  );

  if (inquirerCards.length !== 1) {
    return;
  }

  const sourceContainsGenderCard = sourceCards.some(
    (card) => card.card.number === inquirerCardNumber
  );
  const totalGenderCardCount = [...sourceCards, ...inquirerCards].filter(
    (card) => card.card.number === inquirerCardNumber
  ).length;

  if (totalGenderCardCount !== 1) {
    errors.push({
      code: "INVALID_INQUIRER_CARD",
      slotKey: inquirerRule.slotKey,
      cardNumber: inquirerCardNumber,
      message:
        "Event Reading must contain the gendered inquirer card exactly once across the major arcana band and inquirer slot."
    });
    return;
  }

  if (
    !sourceContainsGenderCard &&
    inquirerCards[0].card.number !== inquirerCardNumber
  ) {
    errors.push({
      code: "INVALID_INQUIRER_CARD",
      slotKey: inquirerRule.slotKey,
      cardNumber: inquirerCards[0].card.number,
      message:
        "When the inquirer card was not drawn in the seven major slots, it must occupy the Inquirer slot."
    });
  }
}

function pickTarotCardFromPool(
  pool: TarotCard[],
  constraint: TarotSpreadCardConstraint | undefined,
  rng: () => number
): TarotCard {
  const candidateIndexes = pool.reduce<number[]>((indexes, card, index) => {
    if (matchesTarotSpreadConstraint(card, constraint)) {
      indexes.push(index);
    }

    return indexes;
  }, []);

  if (candidateIndexes.length === 0) {
    throw new Error("Unable to draw a tarot card that satisfies the spread rule.");
  }

  const pickedIndex = candidateIndexes[randomIndex(candidateIndexes.length, rng)];
  const [pickedCard] = pool.splice(pickedIndex, 1);

  return pickedCard;
}

function buildResolvedDrawnCard(
  slot: TarotSpreadSlotDefinition,
  card: TarotCard,
  includeInverted: boolean,
  rng: () => number
): TarotSpreadResolvedSelectionCard {
  const drawnCard = withSpreadCardOrientation(card, includeInverted, rng);

  return {
    slotKey: slot.slotKey,
    cardNumber: drawnCard.number,
    isInverted: drawnCard.isInverted ?? false,
    slot,
    card: drawnCard
  };
}

function drawDefaultTarotSpread(
  spread: TarotSpreadDefinition,
  includeInverted: boolean,
  rng: () => number
): TarotSpreadResolvedSelectionCard[] {
  const deckPool = [...ARKANNUS];
  const drawnCards: TarotSpreadResolvedSelectionCard[] = [];

  for (const slot of spread.slots.slice().sort((left, right) => left.order - right.order)) {
    const drawRule = getTarotSpreadRuleForDraw(slot);

    for (let index = 0; index < slot.maxCards; index += 1) {
      const card = pickTarotCardFromPool(deckPool, drawRule, rng);
      drawnCards.push(
        buildResolvedDrawnCard(slot, card, includeInverted, rng)
      );
    }
  }

  return drawnCards;
}

function drawEventReadingSpread(
  spread: TarotSpreadDefinition,
  includeInverted: boolean,
  rng: () => number,
  context: TarotSpreadSelectionContext | undefined
): TarotSpreadResolvedSelectionCard[] {
  const inquirerRule = spread.specialRules?.inquirerCard;

  if (!inquirerRule || !context?.inquirerGender) {
    throw new Error(
      "Event Reading draw requires `context.inquirerGender`."
    );
  }

  const slotsByKey = new Map(
    spread.slots.map((slot) => [slot.slotKey, slot] as const)
  );
  const outerPool = ARKANNUS.filter(
    (card) => card.type === "minor" || card.type === "daat+royalship"
  );
  const majorPool = ARKANNUS.filter((card) => card.type === "major");
  const drawnCards: TarotSpreadResolvedSelectionCard[] = [];

  for (const slot of spread.slots
    .filter((candidate) => candidate.metadata?.groupKey === "outer")
    .sort((left, right) => left.order - right.order)) {
    const card = pickTarotCardFromPool(outerPool, getTarotSpreadRuleForDraw(slot), rng);
    drawnCards.push(buildResolvedDrawnCard(slot, card, includeInverted, rng));
  }

  for (const slotKey of inquirerRule.sourceSlotKeys) {
    const slot = slotsByKey.get(slotKey);

    if (!slot) {
      throw new Error(`Missing Event Reading slot definition for ${slotKey}.`);
    }

    const card = pickTarotCardFromPool(majorPool, getTarotSpreadRuleForDraw(slot), rng);
    drawnCards.push(buildResolvedDrawnCard(slot, card, includeInverted, rng));
  }

  const genderedInquirerCardNumber =
    inquirerRule.cardNumbersByGender[context.inquirerGender];
  const sourceContainsGenderedCard = drawnCards.some(
    (card) =>
      inquirerRule.sourceSlotKeys.includes(card.slotKey) &&
      card.card.number === genderedInquirerCardNumber
  );
  const inquirerSlot = slotsByKey.get(inquirerRule.slotKey);

  if (!inquirerSlot) {
    throw new Error(
      `Missing Event Reading slot definition for ${inquirerRule.slotKey}.`
    );
  }

  if (!sourceContainsGenderedCard) {
    const genderedCardIndex = majorPool.findIndex(
      (card) => card.number === genderedInquirerCardNumber
    );

    if (genderedCardIndex < 0) {
      throw new Error(
        "Unable to assign the Event Reading inquirer card from the remaining major arcana."
      );
    }

    const [genderedCard] = majorPool.splice(genderedCardIndex, 1);
    drawnCards.push(
      buildResolvedDrawnCard(inquirerSlot, genderedCard, includeInverted, rng)
    );
  } else {
    const replacement = pickTarotCardFromPool(
      majorPool,
      getTarotSpreadRuleForDraw(inquirerSlot),
      rng
    );
    drawnCards.push(
      buildResolvedDrawnCard(inquirerSlot, replacement, includeInverted, rng)
    );
  }

  return drawnCards;
}

export function listTarotSpreads(): TarotSpreadDefinition[] {
  return TAROT_SPREADS.map(cloneSpreadDefinition);
}

export function getTarotSpread(
  spreadId: TarotSpreadId
): TarotSpreadDefinition | undefined {
  const spread = TAROT_SPREAD_BY_ID.get(spreadId);
  return spread ? cloneSpreadDefinition(spread) : undefined;
}

export function validateTarotSpreadSelection(
  input: TarotSpreadValidationInput
): TarotSpreadValidationResult {
  const spread = TAROT_SPREAD_BY_ID.get(input.spreadId);
  const errors: TarotSpreadValidationIssue[] = [];

  if (!spread) {
    return {
      ok: false,
      isComplete: false,
      errors: [
        {
          code: "UNKNOWN_SPREAD",
          message: `Unknown tarot spread: ${input.spreadId}.`
        }
      ],
      resolvedCards: []
    };
  }

  const slotsByKey = new Map(
    spread.slots.map((slot) => [slot.slotKey, slot] as const)
  );
  const seenCardNumbers = new Set<number>();
  const resolvedCards: TarotSpreadResolvedSelectionCard[] = [];

  for (const selectedCard of input.cards) {
    const slot = slotsByKey.get(selectedCard.slotKey);

    if (!slot) {
      errors.push({
        code: "UNKNOWN_SLOT",
        slotKey: selectedCard.slotKey,
        message: `Unknown slot for ${spread.label}: ${selectedCard.slotKey}.`
      });
      continue;
    }

    const tarotCard = getTarotCardByNumber(selectedCard.cardNumber);

    if (!tarotCard) {
      errors.push({
        code: "CARD_NOT_FOUND",
        slotKey: selectedCard.slotKey,
        cardNumber: selectedCard.cardNumber,
        message: `Unknown tarot card number: ${selectedCard.cardNumber}.`
      });
      continue;
    }

    if (seenCardNumbers.has(tarotCard.number)) {
      errors.push({
        code: "DUPLICATE_CARD",
        slotKey: selectedCard.slotKey,
        cardNumber: tarotCard.number,
        message: `Tarot card ${tarotCard.number} is duplicated across the spread.`
      });
      continue;
    }

    seenCardNumbers.add(tarotCard.number);
    resolvedCards.push(
      resolveTarotSpreadSelectionCard(selectedCard, slot, tarotCard)
    );
  }

  let isComplete = true;

  for (const slot of spread.slots) {
    const slotCards = resolvedCards.filter(
      (selectedCard) => selectedCard.slotKey === slot.slotKey
    );

    if (slotCards.length < slot.minCards) {
      isComplete = false;
      if (!input.allowPartial) {
        errors.push({
          code: "MISSING_REQUIRED_CARDS",
          slotKey: slot.slotKey,
          message: `${spread.label} requires ${slot.minCards} card(s) for ${slot.label}.`
        });
      }
    }

    if (slotCards.length > slot.maxCards) {
      isComplete = false;
      errors.push({
        code: "TOO_MANY_CARDS",
        slotKey: slot.slotKey,
        message: `${spread.label} allows at most ${slot.maxCards} card(s) for ${slot.label}.`
      });
    }

    const validationRule = getTarotSpreadRuleForValidation(slot);

    for (const slotCard of slotCards) {
      if (validationRule?.allowedTypes && !validationRule.allowedTypes.includes(slotCard.card.type)) {
        errors.push({
          code: "INVALID_CARD_TYPE",
          slotKey: slot.slotKey,
          cardNumber: slotCard.card.number,
          message: `${slot.label} does not accept ${slotCard.card.type} cards.`
        });
      }

      if (
        validationRule?.requiredRank &&
        getTarotMinorRank(slotCard.card) !== validationRule.requiredRank
      ) {
        errors.push({
          code: "INVALID_CARD_RANK",
          slotKey: slot.slotKey,
          cardNumber: slotCard.card.number,
          message: `${slot.label} requires a ${validationRule.requiredRank} minor arcana card.`
        });
      }

      if (
        validationRule?.allowedCardFilenames &&
        !validationRule.allowedCardFilenames.includes(slotCard.card.tarotCardFilename)
      ) {
        errors.push({
          code: "DISALLOWED_CARD",
          slotKey: slot.slotKey,
          cardNumber: slotCard.card.number,
          message: `${slotCard.card.tarotCard} is not allowed in ${slot.label}.`
        });
      }

      if (
        validationRule?.excludedCardFilenames &&
        validationRule.excludedCardFilenames.includes(slotCard.card.tarotCardFilename)
      ) {
        errors.push({
          code: "DISALLOWED_CARD",
          slotKey: slot.slotKey,
          cardNumber: slotCard.card.number,
          message: `${slotCard.card.tarotCard} is excluded from ${slot.label}.`
        });
      }
    }
  }

  if (
    spread.contextRequirements?.includes("inquirerGender") &&
    !input.context?.inquirerGender
  ) {
    isComplete = false;
    errors.push({
      code: "MISSING_CONTEXT",
      message: `${spread.label} requires \`context.inquirerGender\`.`
    });
  }

  validateEventInquirerCard(spread, resolvedCards, input.context, errors);

  const sortedResolvedCards = sortResolvedTarotSpreadCards(resolvedCards);

  return {
    ok: errors.length === 0,
    isComplete,
    spread: cloneSpreadDefinition(spread),
    resolvedCards: sortedResolvedCards,
    errors
  };
}

export function drawTarotSpread(
  options: DrawTarotSpreadOptions
): TarotSpreadDrawResult {
  const spread = TAROT_SPREAD_BY_ID.get(options.spreadId);

  if (!spread) {
    throw new Error(`Unknown tarot spread: ${options.spreadId}.`);
  }

  const rng = options.rng ?? Math.random;
  const includeInverted = options.includeInverted ?? false;
  const drawnCards =
    spread.spreadId === "event-reading"
      ? drawEventReadingSpread(spread, includeInverted, rng, options.context)
      : drawDefaultTarotSpread(spread, includeInverted, rng);
  const validation = validateTarotSpreadSelection({
    spreadId: spread.spreadId,
    cards: drawnCards.map((card) => ({
      slotKey: card.slotKey,
      cardNumber: card.cardNumber,
      isInverted: card.isInverted
    })),
    context: options.context
  });

  if (!validation.ok) {
    throw new Error(
      `Generated an invalid tarot spread selection for ${spread.label}: ${validation.errors
        .map((error) => error.message)
        .join(" ")}`
    );
  }

  return {
    spread: cloneSpreadDefinition(spread),
    deckId: options.deckId ?? "rider-waite",
    context: options.context,
    cards: sortResolvedTarotSpreadCards(drawnCards)
  };
}
