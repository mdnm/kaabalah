import {
  ARKANNUS,
  drawTarotSpread,
  getTarotCardProfile,
  getTarotRepresentation,
  getTarotSpread,
  listTarotDecks,
  listTarotSpreads,
  shuffleTarotDeck,
  type TarotDeckDescription,
  type TarotDeckId,
  type TarotCard,
  type TarotInquirerGender,
  type TarotSpreadId,
  type TarotSpreadSelectionContext,
} from "../../tarot";
import { getFlagBool, getFlagNumber, getFlagString, isJsonMode } from "../runtime/args";
import { exitWithError } from "../runtime/errors";
import { outputJson } from "../runtime/output";
import type { Flags } from "../runtime/types";

const TAROT_INQUIRER_GENDERS = new Set<TarotInquirerGender>(["man", "woman"]);

type TarotCardDeckDetails = {
  deckId: TarotDeckId;
  imageUrl: string | null;
  description?: TarotDeckDescription;
};

type TarotCardWithDeckDetails = TarotCard & TarotCardDeckDetails;

export interface TarotSpreadCliOptions {
  spreadId?: string;
  context?: unknown;
}

function summarizeTarotSpreads() {
  return listTarotSpreads().map((spread) => ({
    spreadId: spread.spreadId,
    label: spread.label,
    description: spread.description,
    slots: spread.slots.length,
    contextRequirements: spread.contextRequirements ?? [],
  }));
}

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

function printDeckDescription(description: TarotDeckDescription): void {
  if (description.name) {
    console.log(`  Deck name: ${description.name}`);
  }
  if (description.meaning) {
    console.log(`  Deck meaning: ${description.meaning}`);
  }
  if (description.reversedMeaning) {
    console.log(`  Deck reversed: ${description.reversedMeaning}`);
  }
  if (description.keywords?.length) {
    console.log(`  Deck keywords: ${description.keywords.join(", ")}`);
  }
}

function printCard(card: TarotCard, deckDetails?: TarotCardDeckDetails): void {
  console.log(`\n  #${String(card.number).padStart(2, "0")} ${card.tarotCard}`);
  console.log(`  Type: ${card.type} | Suit: ${card.suit ?? "major"} | Deck: ${card.deck}`);
  console.log(`  Meaning: ${card.meaning}`);
  if (card.egyptianCardName) {
    console.log(`  Egyptian: ${card.egyptianCardName}`);
  }
  if (card.papusMeaning) {
    console.log(`  Papus: ${card.papusMeaning}`);
  }
  if (deckDetails) {
    console.log(`  Image: ${deckDetails.imageUrl ?? "unavailable"}`);
    if (deckDetails.description) {
      printDeckDescription(deckDetails.description);
    }
  }
  console.log();
}

function getRequestedDeckId(flags: Flags): TarotDeckId | undefined {
  const deckId = getFlagString(flags, "deck");

  if (!deckId) {
    return undefined;
  }

  const decks = listTarotDecks();
  const validDeckIds = decks.map((deck) => deck.id);

  if (!validDeckIds.includes(deckId as TarotDeckId)) {
    exitWithError(
      "INVALID_ARGUMENT",
      `Unknown deck "${deckId}". Valid: ${validDeckIds.join(", ")}.`,
      flags
    );
  }

  return deckId as TarotDeckId;
}

function enrichCardWithDeck(
  card: TarotCard,
  deckId: TarotDeckId,
  flags: Flags
): TarotCardWithDeckDetails {
  const profile = getTarotCardProfile({ tarotCardName: card.tarotCard });

  if (!profile) {
    exitWithError(
      "INTERNAL_ERROR",
      `No tarot profile found for "${card.tarotCard}".`,
      flags
    );
  }

  const representation = profile.availableDeckIds.includes(deckId)
    ? getTarotRepresentation({ tarotCardName: card.tarotCard }, deckId)
    : undefined;

  return {
    ...card,
    deckId,
    imageUrl: representation?.imageUrl ?? null,
    description: profile.descriptionsByDeck[deckId],
  };
}

export async function cmdTarot(countStr: string | undefined, flags: Flags): Promise<void> {
  const count = countStr ? Number.parseInt(countStr, 10) : 3;
  if (Number.isNaN(count) || count < 1 || count > 78) {
    exitWithError("INVALID_ARGUMENT", "Card count must be between 1 and 78.", flags);
  }

  const shuffleCount = getFlagNumber(flags, "shuffle-count") ?? 7;
  const shuffleDelay = isJsonMode(flags) ? 0 : 300;
  const deck = await shuffleTarotDeck(
    ARKANNUS,
    getFlagBool(flags, "inverted"),
    shuffleCount,
    shuffleDelay
  );
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
  if (getFlagBool(flags, "decks")) {
    outputJson(listTarotDecks(), flags);
    return;
  }

  const { cards } = findCardsByQuery(query);

  if (cards.length === 0) {
    exitWithError("CARD_NOT_FOUND", `No card found for "${query}". Use a number (1-78) or card name.`, flags);
  }

  const deckId = getRequestedDeckId(flags);
  const outputCards = deckId
    ? cards.map((card) => enrichCardWithDeck(card, deckId, flags))
    : cards;

  if (isJsonMode(flags)) {
    outputJson(outputCards.length === 1 ? outputCards[0] : outputCards, flags);
    return;
  }

  if (deckId) {
    for (const card of outputCards as TarotCardWithDeckDetails[]) {
      printCard(card, card);
    }
    return;
  }

  for (const card of outputCards) {
    printCard(card);
  }
}

function parseTarotSpreadContext(flags: Flags, context: unknown): TarotSpreadSelectionContext | undefined {
  const flagGender = getFlagString(flags, "inquirer-gender");
  const inputGender =
    context && typeof context === "object" && "inquirerGender" in context
      ? (context as { inquirerGender?: unknown }).inquirerGender
      : undefined;
  const gender = flagGender ?? (typeof inputGender === "string" ? inputGender : undefined);

  if (!gender) {
    return undefined;
  }

  if (!TAROT_INQUIRER_GENDERS.has(gender as TarotInquirerGender)) {
    exitWithError("INVALID_ARGUMENT", 'Tarot spread context.inquirerGender must be "man" or "woman".', flags);
  }

  return { inquirerGender: gender as TarotInquirerGender };
}

function printSpreadDraw(result: ReturnType<typeof drawTarotSpread>): void {
  console.log(`\n${result.spread.label}`);
  console.log(`Spread: ${result.spread.spreadId}`);
  if (result.context?.inquirerGender) {
    console.log(`Inquirer: ${result.context.inquirerGender}`);
  }
  console.log();

  for (const card of result.cards) {
    const inverted = card.isInverted ? " (INVERTED)" : "";
    console.log(
      `  ${card.slot.order}. ${card.slot.label}: #${String(card.card.number).padStart(2, "0")} ${card.card.tarotCard}${inverted}`
    );
    console.log(`     ${card.card.meaning}`);
  }

  console.log();
}

function cmdTarotNamedSpread(spreadId: string, flags: Flags, options: TarotSpreadCliOptions): void {
  const spread = getTarotSpread(spreadId as TarotSpreadId);

  if (!spread) {
    exitWithError("INVALID_ARGUMENT", `Unknown tarot spread: ${spreadId}.`, flags);
  }

  const context = parseTarotSpreadContext(flags, options.context);
  const requirements = spread.contextRequirements ?? [];

  if (requirements.includes("inquirerGender") && !context?.inquirerGender) {
    exitWithError(
      "MISSING_ARGUMENT",
      `Spread "${spread.spreadId}" requires --inquirer-gender (man|woman).`,
      flags
    );
  }

  try {
    const result = drawTarotSpread({
      spreadId: spread.spreadId,
      includeInverted: getFlagBool(flags, "inverted"),
      context,
    });

    if (isJsonMode(flags)) {
      outputJson(result, flags);
      return;
    }

    printSpreadDraw(result);
  } catch (err) {
    exitWithError("INVALID_ARGUMENT", err instanceof Error ? err.message : String(err), flags);
  }
}

export function cmdTarotSpread(cardQueries: string[], flags: Flags, options: TarotSpreadCliOptions = {}): void {
  if (getFlagBool(flags, "list")) {
    const spreads = summarizeTarotSpreads();

    if (isJsonMode(flags)) {
      outputJson(spreads, flags);
      return;
    }

    console.log("\nTarot spreads\n");
    for (const spread of spreads) {
      const requirements =
        spread.contextRequirements.length > 0
          ? ` | requires: ${spread.contextRequirements.join(", ")}`
          : "";
      console.log(`  ${spread.spreadId.padEnd(22)} ${spread.label} (${spread.slots} slots)${requirements}`);
      if (spread.description) {
        console.log(`    ${spread.description}`);
      }
    }
    console.log();
    return;
  }

  const spreadId = getFlagString(flags, "spread-id") ?? options.spreadId;

  if (spreadId) {
    cmdTarotNamedSpread(spreadId, flags, options);
    return;
  }

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
