import { describe, expect, it } from "vitest";

import { id, KaabalahTypes, TarotTypes } from "../core";
import {
  getTarotArchetype,
  getTarotRepresentation,
  getTarotRepresentations,
  listTarotDecks,
  resolveTarotImageUrl
} from "./index";

describe("tarot archetype resolver", () => {
  it("lists the supported canonical tarot decks", () => {
    expect(listTarotDecks()).toEqual([
      { id: "papus_pt", label: "Papus Kaabalistic" },
      { id: "papus", label: "Papus Divinatory" },
      { id: "mythic", label: "Mythic" },
      { id: "egyptian", label: "Egyptian" },
      { id: "rider-waite", label: "Rider Waite" }
    ]);
  });

  it("resolves Beth to the canonical path-backed archetype metadata", () => {
    const archetype = getTarotArchetype({ pathSlug: "/path/BETH" });

    expect(archetype).toMatchObject({
      canonicalId: id(KaabalahTypes.PATH, 2),
      pathId: id(KaabalahTypes.PATH, 2),
      pathNumber: 2,
      pathSlug: "beth",
      hebrewLetter: "Beth",
      tarotCardNumber: 2,
      tarotCardName: "The High Priestess",
      tarotCardFilename: "02_the_high_priestess"
    });
    expect(archetype?.descriptionsByDeck.papus_pt?.meaning).toContain(
      "Intuition"
    );
    expect(archetype?.availableDeckIds).toEqual([
      "papus_pt",
      "papus",
      "mythic",
      "egyptian",
      "rider-waite"
    ]);
  });

  it("resolves Aleph across multiple deck variants and image URLs", () => {
    const representations = getTarotRepresentations({ tarotCardNumber: 1 });

    expect(representations).toHaveLength(5);
    expect(representations.map((representation) => representation.deck.id)).toEqual([
      "papus_pt",
      "papus",
      "mythic",
      "egyptian",
      "rider-waite"
    ]);

    const mythicMajor = getTarotRepresentation(
      { tarotCardNumber: 1 },
      "mythic"
    );

    expect(mythicMajor).toMatchObject({
      label: "The Magician - Mythic",
      altText: "The Magician - Mythic",
      cardLabel: "The Magician",
      card: {
        kind: "major",
        assetPathType: "major",
        tarotCardNumber: 1,
        tarotCardFilename: "01_the_magician"
      },
      assetPath: "major/01_the_magician",
      imageUrl:
        "https://kaabalah-app.s3.us-east-1.amazonaws.com/tarot/mythic/major/01_the_magician.jpg"
    });
    expect(mythicMajor?.archetype?.pathSlug).toBe("aleph");

    expect(
      resolveTarotImageUrl(
        { tarotCardFilename: "02_the_high_priestess" },
        "rider-waite"
      )
    ).toBe(
      "https://kaabalah-app.s3.us-east-1.amazonaws.com/tarot/rider-waite/major/02_the_high_priestess.jpg"
    );
  });

  it("resolves minor cards to the published suit-scoped asset path", () => {
    const minor = getTarotRepresentation(
      { tarotCardNumber: 64 },
      "mythic"
    );

    expect(minor).toMatchObject({
      label: "Ten of Swords - Mythic",
      altText: "Ten of Swords - Mythic",
      cardLabel: "Ten of Swords",
      card: {
        kind: "minor",
        assetPathType: "minor",
        tarotCardNumber: 64,
        tarotCardFilename: "10_swords",
        suit: "swords"
      },
      assetPath: "minor/swords/10_swords",
      imageUrl:
        "https://kaabalah-app.s3.us-east-1.amazonaws.com/tarot/mythic/minor/swords/10_swords.jpg"
    });
    expect(resolveTarotImageUrl({ tarotCardNumber: 64 }, "mythic")).toBe(
      "https://kaabalah-app.s3.us-east-1.amazonaws.com/tarot/mythic/minor/swords/10_swords.jpg"
    );
  });

  it("resolves court cards to the published daat+royalship suit-scoped asset path", () => {
    const court = getTarotRepresentation(
      { tarotCardNumber: 23 },
      "mythic"
    );

    expect(court).toMatchObject({
      label: "King of Wands - Mythic",
      altText: "King of Wands - Mythic",
      cardLabel: "King of Wands",
      card: {
        kind: "court",
        assetPathType: "daat+royalship",
        tarotCardNumber: 23,
        tarotCardFilename: "king_wands",
        suit: "wands"
      },
      assetPath: "daat+royalship/wands/king_wands",
      imageUrl:
        "https://kaabalah-app.s3.us-east-1.amazonaws.com/tarot/mythic/daat+royalship/wands/king_wands.jpg"
    });
    expect(court?.archetype).toBeUndefined();
    expect(
      resolveTarotImageUrl({ tarotArkAnnuId: id(TarotTypes.TAROT_ARK_ANNU, "King of Wands") }, "mythic")
    ).toBe(
      "https://kaabalah-app.s3.us-east-1.amazonaws.com/tarot/mythic/daat+royalship/wands/king_wands.jpg"
    );
  });

  it("keeps archetype lookup major-only while image lookup supports all tarot cards", () => {
    expect(getTarotArchetype({ tarotCardNumber: 23 })).toBeUndefined();
    expect(getTarotRepresentations({ tarotCardNumber: 23 })).toHaveLength(5);
    expect(
      resolveTarotImageUrl({ tarotCardName: "Page of Cups" }, "egyptian")
    ).toBe(
      "https://kaabalah-app.s3.us-east-1.amazonaws.com/tarot/egyptian/daat+royalship/cups/page_cups.jpg"
    );
  });
});
