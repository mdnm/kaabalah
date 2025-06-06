/**
 * Tarot interpretation functions
 */

export type Deck = "papus_pt" | "papus" | "mythic" | "egyptian" | "rider-waite"

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
  type: "major" | "minor" | "daat+royalship"
  deck: string
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
    type: "major",
    deck: "mythic"
  },
  {
    number: 2,
    tarotCard: "The High Priestess",
    tarotCardFilename: "02_the_high_priestess",
    meaning:
      "Intuition, the power to rewrite your book of life improving your life every instant",
    type: "major",
    deck: "mythic"
  },
  {
    number: 3,
    tarotCard: "The Empress",
    tarotCardFilename: "03_the_empress",
    meaning: "Adaptation, the power to geometrize through emotions",
    type: "major",
    deck: "mythic"
  },
  {
    number: 4,
    tarotCard: "The Emperor",
    tarotCardFilename: "04_the_emperor",
    meaning: "Authority, the power to mark your territory with the sacred fire",
    type: "major",
    deck: "mythic"
  },
  {
    number: 5,
    tarotCard: "The Hierophant",
    tarotCardFilename: "05_the_hierophant",
    meaning:
      "Magnetism, the power to ritualize life and circulate the quintessence",
    type: "major",
    deck: "mythic"
  },
  {
    number: 6,
    tarotCard: "The Lover",
    tarotCardFilename: "06_the_lover",
    meaning:
      "Dichotomy, stay on the middle path by being neither a victim nor a villain",
    type: "major",
    deck: "mythic"
  },
  {
    number: 7,
    tarotCard: "The Chariot",
    tarotCardFilename: "07_the_chariot",
    meaning: "Merkaabah, take control and build your merkaabah (mind vehicle)",
    type: "major",
    deck: "mythic"
  },
  {
    number: 8,
    tarotCard: "Justice",
    tarotCardFilename: "08_justice",
    meaning: "Justice, be just with yourself to be just with others",
    type: "major",
    deck: "mythic"
  },
  {
    number: 9,
    tarotCard: "The Hermit",
    tarotCardFilename: "09_the_hermit",
    meaning: "Introspection, seek within, retreat",
    type: "major",
    deck: "mythic"
  },
  {
    number: 10,
    tarotCard: "The Wheel of Fortune",
    tarotCardFilename: "10_the_wheel_of_fortune",
    meaning:
      "Loops, extroversion, break the great wheel and ascend, seek externally",
    type: "major",
    deck: "mythic"
  },
  {
    number: 11,
    tarotCard: "Strength",
    tarotCardFilename: "11_strength",
    meaning: "The strength of your subconscious, unity brings strength",
    type: "major",
    deck: "mythic"
  },
  {
    number: 12,
    tarotCard: "The Hanged Man",
    tarotCardFilename: "12_the_hanged_man",
    meaning: "Make valid sacrifices, adopt a new perspective",
    type: "major",
    deck: "mythic"
  },
  {
    number: 13,
    tarotCard: "Death",
    tarotCardFilename: "13_death",
    meaning: "Death, renovation, kill that which kills your soul",
    type: "major",
    deck: "mythic"
  },
  {
    number: 14,
    tarotCard: "Temperance",
    tarotCardFilename: "14_temperance",
    meaning: "Balance, harmonize differences",
    type: "major",
    deck: "mythic"
  },
  {
    number: 15,
    tarotCard: "The Devil",
    tarotCardFilename: "15_the_devil",
    meaning:
      "Indecision between vice and virtue, transmute weakness and passions into strengths",
    type: "major",
    deck: "mythic"
  },
  {
    number: 16,
    tarotCard: "The Tower",
    tarotCardFilename: "16_the_house_of_god",
    meaning:
      "Separation, destruction, separate from what's harmful and connect with what's helpful, make room for the new",
    type: "major",
    deck: "mythic"
  },
  {
    number: 17,
    tarotCard: "The Star",
    tarotCardFilename: "17_the_star",
    meaning:
      "Fecundation, ecology, ecstasy, hope, renew yourself to maintain help, act according to your spiritual purpose",
    type: "major",
    deck: "mythic"
  },
  {
    number: 18,
    tarotCard: "The Moon",
    tarotCardFilename: "18_the_moon",
    meaning:
      "Hidden enemies, be vigilant, recognize where you're self sabotaging",
    type: "major",
    deck: "mythic"
  },
  {
    number: 19,
    tarotCard: "The Sun",
    tarotCardFilename: "19_the_sun",
    meaning:
      "Be conscious of your alchemical band, transmute money into knowledge and vice versa",
    type: "major",
    deck: "mythic"
  },
  {
    number: 20,
    tarotCard: "Judgment",
    tarotCardFilename: "20_judgement",
    meaning: "Make retrospectives and learn from mistakes and successes",
    type: "major",
    deck: "mythic"
  },
  {
    number: 21,
    tarotCard: "The Fool",
    tarotCardFilename: "21_the_fool",
    meaning: "Stop walking in circles, create connections of knowledge",
    type: "major",
    deck: "mythic"
  },
  {
    number: 22,
    tarotCard: "The World",
    tarotCardFilename: "22_the_world",
    meaning: "Win the world, start acting on the world of causes",
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
    type: "daat+royalship",
    deck: "egyptian",
    suit: "wands"
  },

  // Minor Arcana - Wands (27-36)
  {
    number: 27,
    tarotCard: "Ace of Wands",
    tarotCardFilename: "ace_wands",
    egyptianCardName: "The Unexpected",
    meaning: "Ignite the flames of ideals, Trust in your inner divinity",
    type: "minor",
    deck: "egyptian",
    suit: "wands"
  },
  {
    number: 28,
    tarotCard: "Two of Wands",
    tarotCardFilename: "2_wands",
    egyptianCardName: "Uncertainty",
    meaning: "Formulate a strategy to use your own talents",
    type: "minor",
    deck: "egyptian",
    suit: "wands"
  },
  {
    number: 29,
    tarotCard: "Three of Wands",
    tarotCardFilename: "3_wands",
    egyptianCardName: "Domesticity",
    meaning: "Keep going despite losing something apparently important",
    type: "minor",
    deck: "egyptian",
    suit: "wands"
  },
  {
    number: 30,
    tarotCard: "Four of Wands",
    tarotCardFilename: "4_wands",
    egyptianCardName: "Exchange",
    meaning: "Work in teams",
    type: "minor",
    deck: "egyptian",
    suit: "wands"
  },
  {
    number: 31,
    tarotCard: "Five of Wands",
    tarotCardFilename: "5_wands",
    egyptianCardName: "Impediment",
    meaning: "Strengthen the root chakra, overcome internal fears",
    type: "minor",
    deck: "egyptian",
    suit: "wands"
  },
  {
    number: 32,
    tarotCard: "Six of Wands",
    tarotCardFilename: "6_wands",
    egyptianCardName: "Magnificence",
    meaning: "External victory, internal lack of internal self realization",
    type: "minor",
    deck: "egyptian",
    suit: "wands"
  },
  {
    number: 33,
    tarotCard: "Seven of Wands",
    tarotCardFilename: "7_wands",
    egyptianCardName: "Alliance",
    meaning: "Face competitors in an ethical and loyal way",
    type: "minor",
    deck: "egyptian",
    suit: "wands"
  },
  {
    number: 34,
    tarotCard: "Eight of Wands",
    tarotCardFilename: "8_wands",
    egyptianCardName: "Innovation",
    meaning: "Travel to the center of peace and intelligence",
    type: "minor",
    deck: "egyptian",
    suit: "wands"
  },
  {
    number: 35,
    tarotCard: "Nine of Wands",
    tarotCardFilename: "9_wands",
    egyptianCardName: "Desolation",
    meaning: "Obstacle that precedes total victory, gather hidden forces",
    type: "minor",
    deck: "egyptian",
    suit: "wands"
  },
  {
    number: 36,
    tarotCard: "Ten of Wands",
    tarotCardFilename: "10_wands",
    egyptianCardName: "Initiation",
    meaning:
      "Get out of apathy, create a new tree of life using the Lightning Path",
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
    type: "daat+royalship",
    deck: "egyptian",
    suit: "cups"
  },

  // Minor Arcana - Cups (41-50)
  {
    number: 41,
    tarotCard: "Ace of Cups",
    tarotCardFilename: "ace_cups",
    egyptianCardName: "Dissension",
    meaning: "Renewal or new affection, alternative treatment for health",
    type: "minor",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 42,
    tarotCard: "Two of Cups",
    tarotCardFilename: "2_cups",
    egyptianCardName: "Preeminence",
    meaning: "Do not poison yourself or the other person",
    type: "minor",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 43,
    tarotCard: "Three of Cups",
    tarotCardFilename: "3_cups",
    egyptianCardName: "Delusion",
    meaning: "Harmony between instinct and emotion, Be discreet",
    type: "minor",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 44,
    tarotCard: "Four of Cups",
    tarotCardFilename: "4_cups",
    egyptianCardName: "Expressiveness",
    meaning: "Abundance in emotional life, do not listen to slander",
    type: "minor",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 45,
    tarotCard: "Five of Cups",
    tarotCardFilename: "5_cups",
    egyptianCardName: "Regeneration",
    meaning: "Do not break your spiritual commitment (your purpose)",
    type: "minor",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 46,
    tarotCard: "Six of Cups",
    tarotCardFilename: "6_cups",
    egyptianCardName: "Patrimony",
    meaning: "Do not have self-pity",
    type: "minor",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 47,
    tarotCard: "Seven of Cups",
    tarotCardFilename: "7_cups",
    egyptianCardName: "Conjecture",
    meaning: "Gestations, related to The Star",
    type: "minor",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 48,
    tarotCard: "Eight of Cups",
    tarotCardFilename: "8_cups",
    egyptianCardName: "Consummation",
    meaning: "Reflect on your emotional life after 18 hours",
    type: "minor",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 49,
    tarotCard: "Nine of Cups",
    tarotCardFilename: "9_cups",
    egyptianCardName: "Versatility",
    meaning: "Reconciliations and forgiveness",
    type: "minor",
    deck: "egyptian",
    suit: "cups"
  },
  {
    number: 50,
    tarotCard: "Ten of Cups",
    tarotCardFilename: "10_cups",
    egyptianCardName: "Attraction",
    meaning: "Marriage of the spirit with the soul, Alchemical Weddings",
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
    type: "daat+royalship",
    deck: "egyptian",
    suit: "swords"
  },

  // Minor Arcana - Swords (55-64)
  {
    number: 55,
    tarotCard: "Ace of Swords",
    tarotCardFilename: "ace_swords",
    egyptianCardName: "Contrition",
    meaning: "Conflicts before victory",
    type: "minor",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 56,
    tarotCard: "Two of Swords",
    tarotCardFilename: "2_swords",
    egyptianCardName: "Pilgrimage",
    meaning: "Traumas and conflicts to be overcome",
    type: "minor",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 57,
    tarotCard: "Three of Swords",
    tarotCardFilename: "3_swords",
    egyptianCardName: "Rivalry",
    meaning: "Death of yang, Fire, tendencies to depression",
    type: "minor",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 58,
    tarotCard: "Four of Swords",
    tarotCardFilename: "4_swords",
    egyptianCardName: "Meditation",
    meaning: "Reflection, related to The Hermit",
    type: "minor",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 59,
    tarotCard: "Five of Swords",
    tarotCardFilename: "5_swords",
    egyptianCardName: "Revelation",
    meaning: "Healthy self-challenge, Self-demands",
    type: "minor",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 60,
    tarotCard: "Six of Swords",
    tarotCardFilename: "6_swords",
    egyptianCardName: "Evolution",
    meaning: "External daily strategies, Future perspectives",
    type: "minor",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 61,
    tarotCard: "Seven of Swords",
    tarotCardFilename: "7_swords",
    egyptianCardName: "Solitude",
    meaning: "Internal nocturnal strategies, related to The Hermit",
    type: "minor",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 62,
    tarotCard: "Eight of Swords",
    tarotCardFilename: "8_swords",
    egyptianCardName: "Proscription",
    meaning: "Appeal to superior forces, Internal and external conflicts",
    type: "minor",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 63,
    tarotCard: "Nine of Swords",
    tarotCardFilename: "9_swords",
    egyptianCardName: "Communion",
    meaning: "The problems being imagined will never happen",
    type: "minor",
    deck: "egyptian",
    suit: "swords"
  },
  {
    number: 64,
    tarotCard: "Ten of Swords",
    tarotCardFilename: "10_swords",
    egyptianCardName: "Vehemence",
    meaning: "Death and rebirth, related to Death and The Tower",
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
    type: "daat+royalship",
    deck: "egyptian",
    suit: "pentacles"
  },

  // Minor Arcana - Pentacles (69-78)
  {
    number: 69,
    tarotCard: "Ace of Pentacles",
    tarotCardFilename: "ace_pentacles",
    egyptianCardName: "The Unforeseen",
    meaning:
      "Rebirth through a single material goal, Form clear material goals",
    type: "minor",
    deck: "egyptian",
    suit: "pentacles"
  },
  {
    number: 70,
    tarotCard: "Two of Pentacles",
    tarotCardFilename: "2_pentacles",
    egyptianCardName: "Cooperation",
    meaning:
      "Light forming shadows, Duality asking for synthesis in the trinity, Don't put all the eggs in the same basket",
    type: "minor",
    deck: "egyptian",
    suit: "pentacles"
  },
  {
    number: 71,
    tarotCard: "Three of Pentacles",
    tarotCardFilename: "3_pentacles",
    egyptianCardName: "Avarice",
    meaning:
      "Light forming sound, Establish balance through the trinity becoming a great dispenser, Verbalize what should be done, Do not settle for the first results",
    type: "minor",
    deck: "egyptian",
    suit: "pentacles"
  },
  {
    number: 72,
    tarotCard: "Four of Pentacles",
    tarotCardFilename: "4_pentacles",
    egyptianCardName: "Purification",
    meaning: "Avoid avarice / greed",
    type: "minor",
    deck: "egyptian",
    suit: "pentacles"
  },
  {
    number: 73,
    tarotCard: "Five of Pentacles",
    tarotCardFilename: "5_pentacles",
    egyptianCardName: "Love and Desire",
    meaning:
      "Only order will bring progress, Do not kick the barn without having something concrete in front of you",
    type: "minor",
    deck: "egyptian",
    suit: "pentacles"
  },
  {
    number: 74,
    tarotCard: "Six of Pentacles",
    tarotCardFilename: "6_pentacles",
    egyptianCardName: "Offering",
    meaning: "Act with prudence",
    type: "minor",
    deck: "egyptian",
    suit: "pentacles"
  },
  {
    number: 75,
    tarotCard: "Seven of Pentacles",
    tarotCardFilename: "7_pentacles",
    egyptianCardName: "Generosity",
    meaning: "Don't boast about your proposal or project",
    type: "minor",
    deck: "egyptian",
    suit: "pentacles"
  },
  {
    number: 76,
    tarotCard: "Eight of Pentacles",
    tarotCardFilename: "8_pentacles",
    egyptianCardName: "The Provider",
    meaning: "Keep doing what you always did",
    type: "minor",
    deck: "egyptian",
    suit: "pentacles"
  },
  {
    number: 77,
    tarotCard: "Nine of Pentacles",
    tarotCardFilename: "9_pentacles",
    egyptianCardName: "Confusion",
    meaning: "Work with what you like and earn something with it",
    type: "minor",
    deck: "egyptian",
    suit: "pentacles"
  },
  {
    number: 78,
    tarotCard: "Ten of Pentacles",
    tarotCardFilename: "10_pentacles",
    egyptianCardName: "Rebirth",
    meaning: "Prosperity, Prosperous inheritance",
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
