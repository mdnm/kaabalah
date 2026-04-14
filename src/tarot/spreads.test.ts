import { describe, expect, it } from "vitest";

import {
  ARKANNUS,
  drawTarotSpread,
  getTarotSpread,
  listTarotSpreads,
  validateTarotSpreadSelection
} from "./index";

function cardNumber(tarotCardFilename: string): number {
  const card = ARKANNUS.find(
    (candidate) => candidate.tarotCardFilename === tarotCardFilename
  );

  if (!card) {
    throw new Error(`Missing tarot card fixture: ${tarotCardFilename}`);
  }

  return card.number;
}

function selection(slotKey: string, tarotCardFilename: string) {
  return {
    slotKey,
    cardNumber: cardNumber(tarotCardFilename)
  };
}

describe("canonical tarot spreads", () => {
  it("lists the canonical spread registry with event-specific metadata", () => {
    expect(listTarotSpreads().map((spread) => spread.spreadId)).toEqual([
      "quick-insight",
      "conscious-reading",
      "time-reading",
      "dialectic-reading",
      "tree-of-life-reading",
      "celtic-cross",
      "event-reading"
    ]);

    const eventReading = getTarotSpread("event-reading");
    const inquirerSlot = eventReading?.slots.find(
      (slot) => slot.slotKey === "inquirer"
    );
    const firstInnerSlot = eventReading?.slots.find(
      (slot) => slot.slotKey === "inner-1"
    );

    expect(eventReading?.specialRules?.inquirerCard?.cardNumbersByGender).toEqual({
      man: 1,
      woman: 2
    });
    expect(inquirerSlot?.manualSelectionRules?.allowedCardFilenames).toEqual([
      "01_the_magician",
      "02_the_high_priestess"
    ]);
    expect(firstInnerSlot?.manualSelectionRules?.excludedCardFilenames).toEqual([
      "01_the_magician",
      "02_the_high_priestess"
    ]);
  });

  it("draws and validates Quick Insight deterministically", () => {
    const drawn = drawTarotSpread({
      spreadId: "quick-insight",
      rng: () => 0
    });

    expect(drawn.cards).toHaveLength(1);
    expect(drawn.cards[0]).toMatchObject({
      slotKey: "quick-insight",
      cardNumber: 1
    });

    const validation = validateTarotSpreadSelection({
      spreadId: "quick-insight",
      cards: drawn.cards.map((card) => ({
        slotKey: card.slotKey,
        cardNumber: card.cardNumber,
        isInverted: card.isInverted
      }))
    });

    expect(validation.ok).toBe(true);
    expect(validation.isComplete).toBe(true);
  });

  it("validates Tree of Life as a constrained spread with numbered minors and four Daath court cards", () => {
    const validSelection = [
      selection("kether", "ace_wands"),
      selection("chokhmah", "2_cups"),
      selection("binah", "3_swords"),
      selection("chesed", "4_pentacles"),
      selection("geburah", "5_wands"),
      selection("tiphareth", "6_cups"),
      selection("netzach", "7_swords"),
      selection("hod", "8_pentacles"),
      selection("yesod", "9_wands"),
      selection("malkuth", "10_cups"),
      selection("daath", "page_wands"),
      selection("daath", "queen_cups"),
      selection("daath", "knight_swords"),
      selection("daath", "king_pentacles")
    ];

    const valid = validateTarotSpreadSelection({
      spreadId: "tree-of-life-reading",
      cards: validSelection
    });

    expect(valid.ok).toBe(true);
    expect(valid.isComplete).toBe(true);

    const invalid = validateTarotSpreadSelection({
      spreadId: "tree-of-life-reading",
      cards: [
        ...validSelection.filter((card) => card.slotKey !== "kether"),
        selection("kether", "2_wands")
      ]
    });

    expect(invalid.ok).toBe(false);
    expect(invalid.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "INVALID_CARD_RANK",
          slotKey: "kether"
        })
      ])
    );
  });

  it("validates Event Reading inquirer replacement against the canonical gender rule", () => {
    const validSelection = [
      selection("outer-1", "ace_wands"),
      selection("outer-2", "2_wands"),
      selection("outer-3", "3_wands"),
      selection("outer-4", "4_wands"),
      selection("outer-5", "5_wands"),
      selection("outer-6", "6_wands"),
      selection("outer-7", "7_wands"),
      selection("outer-8", "8_wands"),
      selection("outer-9", "9_wands"),
      selection("outer-10", "10_wands"),
      selection("outer-11", "page_cups"),
      selection("outer-12", "king_swords"),
      selection("inner-1", "03_the_empress"),
      selection("inner-2", "01_the_magician"),
      selection("inner-3", "05_the_hierophant"),
      selection("inner-4", "06_the_lover"),
      selection("inner-5", "07_the_chariot"),
      selection("inner-6", "08_justice"),
      selection("inner-7", "09_the_hermit"),
      selection("inquirer", "02_the_high_priestess")
    ];

    const valid = validateTarotSpreadSelection({
      spreadId: "event-reading",
      context: {
        inquirerGender: "man"
      },
      cards: validSelection
    });

    expect(valid.ok).toBe(true);
    expect(valid.isComplete).toBe(true);

    const invalid = validateTarotSpreadSelection({
      spreadId: "event-reading",
      context: {
        inquirerGender: "man"
      },
      cards: [
        ...validSelection.filter((card) => card.slotKey !== "inner-2"),
        selection("inner-2", "04_the_emperor")
      ]
    });

    expect(invalid.ok).toBe(false);
    expect(invalid.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "INVALID_INQUIRER_CARD",
          slotKey: "inquirer"
        })
      ])
    );
  });
});
