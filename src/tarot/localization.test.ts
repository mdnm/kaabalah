import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { TAROT_ARKANNUS_DATA } from "../core/constants";
import { RAW_ARKANNUS } from "./data";
import { TAROT_CONTENT } from "../core/tarot-content";
import { getTarotCardProfile, getTarotRepresentation } from "./index";
import review from "../../docs/localization/tarot-review.json";

describe("Portuguese tarot content", () => {
  it("preserves every existing raw meaning and core deck description", () => {
    const decks = Object.fromEntries(Object.values(TAROT_ARKANNUS_DATA).map((node, index) => [
      RAW_ARKANNUS[index].tarotCardFilename, node.descriptiveData,
    ]));
    const baseline = {
      cards: RAW_ARKANNUS.map(({ tarotCardFilename: filename, meaning, papusMeaning }) => ({ filename, meaning, papusMeaning })),
      decks,
    };
    expect(createHash("sha256").update(JSON.stringify(baseline)).digest("hex"))
      .toBe("397f2ce7d1a4efd6250c0f0fe52c5d313e05eb74e8f1cda5ce57c3baca636b03");
  });

  it("covers every English field with nonempty Portuguese and a review record", () => {
    expect(Object.keys(TAROT_CONTENT)).toHaveLength(78);
    for (const [filename, row] of Object.entries(TAROT_CONTENT)) {
      const en = Object.entries(row.en);
      expect(Object.keys(row.pt)).toEqual(Object.keys(row.en));
      for (const [deck, fields] of en) {
        const pt = row.pt[deck as keyof typeof row.pt];
        expect(Object.keys(pt)).toEqual(Object.keys(fields));
        for (const field of Object.keys(fields)) {
          const value = pt[field as keyof typeof pt];
          expect(value?.trim(), `${filename}.${deck}.${field}`).toBeTruthy();
          expect(value).not.toContain("\u2014");
          expect(review.find(r => r.id === `tarot.${filename}.${deck}.${field}`)).toBeDefined();
        }
      }
    }
  });

  it("localizes all lookup forms and representations without poisoning the English cache", () => {
    for (const card of RAW_ARKANNUS) {
      const lookup = { tarotCardFilename: card.tarotCardFilename };
      const en = getTarotCardProfile(lookup)!;
      const pt = getTarotCardProfile(lookup, "pt-BR")!;
      expect(pt.tarotMeaning).toBe(TAROT_CONTENT[card.tarotCardFilename].pt.PAPUS_KAABALISTIC.meaning);
      expect(getTarotCardProfile(lookup, "pt")).toEqual(pt);
      expect(getTarotCardProfile({ tarotCardNumber: en.tarotCardNumber }, "pt-BR")).toEqual(pt);
      expect(getTarotCardProfile({ tarotCardName: en.tarotCardName }, "pt-BR")).toEqual(pt);
      expect(getTarotCardProfile({ tarotArkAnnuId: en.tarotArkAnnuId }, "pt-BR")).toEqual(pt);
      for (const deck of ["papus_pt", "papus", "egyptian"] as const) {
        expect(getTarotRepresentation(lookup, deck, "pt-BR")?.description).toEqual(pt.descriptionsByDeck[deck]);
      }
      expect(getTarotCardProfile(lookup)).toBe(en);
      expect(getTarotCardProfile(lookup, "fr")).toBe(en);
      expect(pt.tarotArkAnnuId).toBe(en.tarotArkAnnuId);
    }
    expect(getTarotCardProfile({ tarotCardNumber: 0 }, "pt-BR")).toBeUndefined();
  });
});
