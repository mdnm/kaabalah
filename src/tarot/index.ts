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
  papusMeaning?: string
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
      "Fecundation, ecology, ecstasy, hope, renew yourself to maintain help, act according to your spiritual purpose",
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
    egyptianCardName: "The Unexpected",
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
    egyptianCardName: "Uncertainty",
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
    egyptianCardName: "Domesticity",
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
    egyptianCardName: "Exchange",
    meaning: "Work in teams",
    papusMeaning:
      "Obstacles to the enterprise. Nothing can be accomplished without obstacles. We therefore now find them appearing, and must prepare ourselves to overcome them.",
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
    papusMeaning: "Opposition to the obstacles. Victory after surmounting them.",
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
    egyptianCardName: "Alliance",
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
    egyptianCardName: "Innovation",
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
    egyptianCardName: "Desolation",
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
    egyptianCardName: "Initiation",
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
    egyptianCardName: "Dissension",
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
    egyptianCardName: "Preeminence",
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
    egyptianCardName: "Delusion",
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
    egyptianCardName: "Expressiveness",
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
    egyptianCardName: "Regeneration",
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
    egyptianCardName: "Patrimony",
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
    egyptianCardName: "Conjecture",
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
    egyptianCardName: "Consummation",
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
    egyptianCardName: "Versatility",
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
    egyptianCardName: "Attraction",
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
    egyptianCardName: "Contrition",
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
    egyptianCardName: "Pilgrimage",
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
    egyptianCardName: "Rivalry",
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
    egyptianCardName: "Meditation",
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
    egyptianCardName: "Revelation",
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
    egyptianCardName: "Evolution",
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
    egyptianCardName: "Solitude",
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
    egyptianCardName: "Proscription",
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
    egyptianCardName: "Communion",
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
    egyptianCardName: "Vehemence",
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
    egyptianCardName: "The Unforeseen",
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
    egyptianCardName: "Cooperation",
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
    egyptianCardName: "Avarice",
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
    egyptianCardName: "Purification",
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
    egyptianCardName: "Love and Desire",
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
    egyptianCardName: "Offering",
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
    egyptianCardName: "Generosity",
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
    egyptianCardName: "The Provider",
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
    egyptianCardName: "Confusion",
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
    egyptianCardName: "Rebirth",
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
