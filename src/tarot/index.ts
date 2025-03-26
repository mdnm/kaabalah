/**
 * Tarot interpretation functions
 */

export enum TarotSuit {
  MAJOR = 'major',
  CUPS = 'cups',
  PENTACLES = 'pentacles',
  SWORDS = 'swords',
  WANDS = 'wands'
}

export interface TarotCard {
  name: string;
  suit: TarotSuit;
  number: number;
  isReversed: boolean;
}

/**
 * Generate a random tarot spread
 * @param numCards - Number of cards to draw
 * @param allowReversed - Whether to allow reversed cards
 * @returns Array of drawn tarot cards
 */
export function getRandomSpread(numCards: number, allowReversed = true): TarotCard[] {
  const deck = createDeck();
  shuffleDeck(deck);
  return drawCards(deck, numCards, allowReversed);
}

// Private helper functions

function createDeck(): TarotCard[] {
  const deck: TarotCard[] = [];
  
  // Major Arcana (0-21)
  const majorArcanaNames = [
    'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
    'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
    'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
    'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun',
    'Judgement', 'The World'
  ];
  
  majorArcanaNames.forEach((name, index) => {
    deck.push({
      name,
      suit: TarotSuit.MAJOR,
      number: index,
      isReversed: false
    });
  });
  
  // Minor Arcana (1-10 + Court cards for each suit)
  const suits = [TarotSuit.CUPS, TarotSuit.PENTACLES, TarotSuit.SWORDS, TarotSuit.WANDS];
  const courtCards = ['Page', 'Knight', 'Queen', 'King'];
  
  suits.forEach(suit => {
    // Number cards (1-10)
    for (let i = 1; i <= 10; i++) {
      deck.push({
        name: `${i} of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`,
        suit,
        number: i,
        isReversed: false
      });
    }
    
    // Court cards
    courtCards.forEach((court, index) => {
      deck.push({
        name: `${court} of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`,
        suit,
        number: 11 + index,
        isReversed: false
      });
    });
  });
  
  return deck;
}

function shuffleDeck(deck: TarotCard[]): void {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function drawCards(deck: TarotCard[], numCards: number, allowReversed: boolean): TarotCard[] {
  const drawnCards: TarotCard[] = [];
  
  for (let i = 0; i < numCards && i < deck.length; i++) {
    const card = { ...deck[i] };
    if (allowReversed) {
      card.isReversed = Math.random() > 0.5;
    }
    drawnCards.push(card);
  }
  
  return drawnCards;
} 