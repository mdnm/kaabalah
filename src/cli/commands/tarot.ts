import { ARKANNUS, shuffleTarotDeck, type TarotCard } from "../../tarot";
import { getFlagBool, getFlagNumber, isJsonMode } from "../runtime/args";
import { exitWithError } from "../runtime/errors";
import { outputJson } from "../runtime/output";
import type { Flags } from "../runtime/types";

function findCardsByQuery(query: string): { cards: TarotCard[]; exact: boolean } {
  const num = Number.parseInt(query, 10);
  if (!Number.isNaN(num)) {
    const card = ARKANNUS.find((candidate) => candidate.number === num);
    return card ? { cards: [card], exact: true } : { cards: [], exact: false };
  }

  const normalizedQuery = query.toLowerCase();
  const exactMatch = ARKANNUS.find((candidate) => candidate.tarotCard.toLowerCase() === normalizedQuery);
  if (exactMatch) {
    return { cards: [exactMatch], exact: true };
  }

  return {
    cards: ARKANNUS.filter((candidate) => candidate.tarotCard.toLowerCase().includes(normalizedQuery)),
    exact: false,
  };
}

function printCard(card: TarotCard): void {
  console.log(`\n  #${String(card.number).padStart(2, "0")} ${card.tarotCard}`);
  console.log(`  Type: ${card.type} | Suit: ${card.suit ?? "major"} | Deck: ${card.deck}`);
  console.log(`  Meaning: ${card.meaning}`);
  if (card.egyptianCardName) {
    console.log(`  Egyptian: ${card.egyptianCardName}`);
  }
  if (card.papusMeaning) {
    console.log(`  Papus: ${card.papusMeaning}`);
  }
  console.log();
}

export async function cmdTarot(countStr: string | undefined, flags: Flags): Promise<void> {
  const count = countStr ? Number.parseInt(countStr, 10) : 3;
  if (Number.isNaN(count) || count < 1 || count > 78) {
    exitWithError("INVALID_ARGUMENT", "Card count must be between 1 and 78.", flags);
  }

  const shuffleCount = getFlagNumber(flags, "shuffle-count") ?? 7;
  const deck = await shuffleTarotDeck(ARKANNUS, getFlagBool(flags, "inverted"), shuffleCount);
  const drawn = deck.slice(0, count);

  if (isJsonMode(flags)) {
    outputJson(drawn, flags);
    return;
  }

  console.log(`\nTarot Draw: ${count} card${count > 1 ? "s" : ""}\n`);
  for (const card of drawn) {
    const inverted = card.isInverted ? " (INVERTED)" : "";
    console.log(`  #${String(card.number).padStart(2, "0")} ${card.tarotCard}${inverted}`);
    console.log(`       ${card.meaning}`);
    if (card.egyptianCardName) {
      console.log(`       Egyptian: ${card.egyptianCardName}`);
    }
    if (card.papusMeaning) {
      console.log(`       Papus: ${card.papusMeaning}`);
    }
    console.log();
  }
}

export function cmdTarotCard(query: string, flags: Flags): void {
  const { cards } = findCardsByQuery(query);

  if (cards.length === 0) {
    exitWithError("CARD_NOT_FOUND", `No card found for "${query}". Use a number (1-78) or card name.`, flags);
  }

  if (isJsonMode(flags)) {
    outputJson(cards.length === 1 ? cards[0] : cards, flags);
    return;
  }

  for (const card of cards) {
    printCard(card);
  }
}

export function cmdTarotSpread(cardQueries: string[], flags: Flags): void {
  const results: (TarotCard | { query: string; error: true; code: string; message: string })[] = [];

  for (const query of cardQueries) {
    const { cards } = findCardsByQuery(query);
    if (cards.length === 0) {
      results.push({ query, error: true, code: "CARD_NOT_FOUND", message: `No card found for "${query}".` });
    } else if (cards.length === 1) {
      results.push(cards[0]);
    } else {
      results.push(...cards);
    }
  }

  if (isJsonMode(flags)) {
    outputJson(results, flags);
    return;
  }

  for (const item of results) {
    if ("error" in item && item.error) {
      console.log(`\n  \u2717 "${item.query}": ${item.message}`);
    } else {
      printCard(item as TarotCard);
    }
  }
}
