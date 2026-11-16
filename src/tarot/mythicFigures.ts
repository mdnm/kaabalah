/** The identity fields used to select a Mythic figure; independent of any reading UI. */
export interface MythicFigureCard {
  kind: 'major' | 'court' | 'minor';
  number: number;
  suit?: string;
  courtRank?: string;
  rank?: number;
}

/**
 * Who is on each card of the Mythic Tarot: the deck tells Greek myths, one figure per
 * major and per court, one story per suit across its pips. The Magician has no
 * recorded figure.
 */
type Name = { en: string; pt: string };

const MAJORS: Record<number, Name> = {
  2: { en: 'Persephone', pt: 'Perséfone' },
  3: { en: 'Demeter', pt: 'Deméter' },
  4: { en: 'Zeus', pt: 'Zeus' },
  5: { en: 'Chiron', pt: 'Quíron' },
  6: { en: 'Paris', pt: 'Páris' },
  7: { en: 'Ares', pt: 'Ares' },
  8: { en: 'Athena', pt: 'Atena' },
  9: { en: 'Cronus', pt: 'Cronos' },
  10: { en: 'the Moirai', pt: 'as Moiras' },
  11: { en: 'Heracles', pt: 'Héracles' },
  12: { en: 'Prometheus', pt: 'Prometeu' },
  13: { en: 'Hades', pt: 'Hades' },
  14: { en: 'Iris', pt: 'Íris' },
  15: { en: 'Pan', pt: 'Pã' },
  16: { en: 'Poseidon', pt: 'Poseidon' },
  17: { en: 'Pandora', pt: 'Pandora' },
  18: { en: 'Hecate', pt: 'Hécate' },
  19: { en: 'Apollo', pt: 'Apolo' },
  20: { en: 'Hermes, guide of souls', pt: 'Hermes, o condutor de almas' },
  21: { en: 'Dionysus', pt: 'Dioniso' },
  22: { en: 'Hermaphroditus', pt: 'Hermafrodito' },
};

/** Per suit: the ace's god, the story the pips 2 to 10 tell, and the four courts. */
const SUITS: Record<string, { ace: Name; pips: Name; page: Name; knight: Name; queen: Name; king: Name }> = {
  wands: {
    ace: { en: 'Zeus', pt: 'Zeus' },
    pips: { en: 'Jason', pt: 'Jasão' },
    page: { en: 'Phrixus', pt: 'Frixo' },
    knight: { en: 'Bellerophon', pt: 'Belerofonte' },
    queen: { en: 'Penelope', pt: 'Penélope' },
    king: { en: 'Theseus', pt: 'Teseu' },
  },
  cups: {
    ace: { en: 'Aphrodite', pt: 'Afrodite' },
    pips: { en: 'Eros and Psyche', pt: 'Eros e Psiquê' },
    page: { en: 'Narcissus', pt: 'Narciso' },
    knight: { en: 'Perseus', pt: 'Perseu' },
    queen: { en: 'Helen', pt: 'Helena' },
    king: { en: 'Orpheus', pt: 'Orfeu' },
  },
  swords: {
    ace: { en: 'Athena', pt: 'Atena' },
    pips: { en: 'Orestes', pt: 'Orestes' },
    page: { en: 'Zephyrus', pt: 'Zéfiro' },
    knight: { en: 'Castor and Pollux', pt: 'Castor e Pólux' },
    queen: { en: 'Atalanta', pt: 'Atalanta' },
    king: { en: 'Odysseus', pt: 'Ulisses' },
  },
  pentacles: {
    ace: { en: 'Poseidon', pt: 'Poseidon' },
    pips: { en: 'Daedalus', pt: 'Dédalo' },
    page: { en: 'Triptolemus', pt: 'Triptólemo' },
    knight: { en: 'Aristaeus', pt: 'Aristeu' },
    queen: { en: 'Omphale', pt: 'Ônfale' },
    king: { en: 'Midas', pt: 'Midas' },
  },
};

/** The Mythic deck's figure for a card, in the given language; null when it has none on record. */
export function mythicFigure(card: MythicFigureCard, language: string | undefined): string | null {
  const pick = (name: Name | undefined) => (name ? (language?.startsWith('pt') ? name.pt : name.en) : null);
  if (card.kind === 'major') return pick(MAJORS[card.number]);
  const suit = card.suit ? SUITS[card.suit] : undefined;
  if (!suit) return null;
  if (card.kind === 'court') return pick(suit[card.courtRank as 'page' | 'knight' | 'queen' | 'king']);
  return pick(card.rank === 1 ? suit.ace : suit.pips);
}
