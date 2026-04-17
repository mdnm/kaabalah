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

    const papusKaabalistic = getTarotRepresentation(
      { pathId: id(KaabalahTypes.PATH, 1) },
      "papus_pt"
    );

    expect(papusKaabalistic).toMatchObject({
      label: "The Magician - Papus Kaabalistic",
      altText: "The Magician - Papus Kaabalistic",
      cardLabel: "The Magician",
      card: {
        kind: "major",
        tarotCardNumber: 1,
        tarotCardFilename: "01_the_magician"
      },
      imageUrl:
        "https://kaabalah-app.s3.us-east-1.amazonaws.com/tarot/papus_pt/major/01_the_magician.jpg"
    });
    expect(papusKaabalistic?.archetype?.pathSlug).toBe("aleph");

    expect(
      resolveTarotImageUrl(
        { tarotCardFilename: "02_the_high_priestess" },
        "rider-waite"
      )
    ).toBe(
      "https://kaabalah-app.s3.us-east-1.amazonaws.com/tarot/rider-waite/major/02_the_high_priestess.jpg"
    );
  });

  it("resolves court and minor cards to the non-major image paths", () => {
    const court = getTarotRepresentation(
      { tarotArkAnnuId: id(TarotTypes.TAROT_ARK_ANNU, "Page of Cups") },
      "rider-waite"
    );
    const minor = getTarotRepresentation(
      { tarotCardName: "Ace of Wands" },
      "papus_pt"
    );

    expect(court).toMatchObject({
      label: "Page of Cups - Rider Waite",
      altText: "Page of Cups - Rider Waite",
      cardLabel: "Page of Cups",
      card: {
        kind: "court",
        tarotCardNumber: 40,
        tarotCardFilename: "page_cups"
      },
      imageUrl:
        "https://kaabalah-app.s3.us-east-1.amazonaws.com/tarot/rider-waite/minor/page_cups.jpg"
    });
    expect(court?.archetype).toBeUndefined();

    expect(minor).toMatchObject({
      label: "Ace of Wands - Papus Kaabalistic",
      altText: "Ace of Wands - Papus Kaabalistic",
      cardLabel: "Ace of Wands",
      card: {
        kind: "minor",
        tarotCardNumber: 27,
        tarotCardFilename: "ace_wands"
      },
      imageUrl:
        "https://kaabalah-app.s3.us-east-1.amazonaws.com/tarot/papus_pt/minor/ace_wands.jpg"
    });
  });

  it("keeps archetype lookup major-only while image lookup supports all tarot cards", () => {
    expect(getTarotArchetype({ tarotCardNumber: 40 })).toBeUndefined();
    expect(getTarotRepresentations({ tarotCardNumber: 40 })).toHaveLength(5);
    expect(
      resolveTarotImageUrl({ tarotCardNumber: 40 }, "egyptian")
    ).toBe(
      "https://kaabalah-app.s3.us-east-1.amazonaws.com/tarot/egyptian/minor/page_cups.jpg"
    );
  });
});
