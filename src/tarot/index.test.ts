import { describe, expect, it } from "vitest";

import { getCanonicalTree, id, KaabalahTypes, NumerologyTypes, TarotTypes } from "../core";
import {
  getTarotArchetype,
  getTarotCardByNumber,
  getTarotCardNumber,
  getTarotCardProfile,
  getTarotRepresentation,
  getTarotRepresentations,
  listTarotDecks,
  listTarotTrees,
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

  it("lists tarot trees and keeps card-number correspondences direct in the kaabalah tree", () => {
    expect(listTarotTrees()).toEqual([
      "kaabalah",
      "hermetic-qabalah",
      "lurianic-kabbalah"
    ]);

    const tree = getCanonicalTree({
      system: "kaabalah",
      parts: ["tarot"]
    });

    expect(
      tree.getCorrespondences(
        id(TarotTypes.TAROT_ARK_ANNU, "Ace of Pentacles"),
        {
          type: NumerologyTypes.NUMBER,
          depth: 1
        }
      )[0]?.node.id
    ).toBe(id(NumerologyTypes.NUMBER, 78));
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
      { tarotCardNumber: 55 },
      "mythic"
    );

    expect(minor).toMatchObject({
      label: "Ten of Swords - Mythic",
      altText: "Ten of Swords - Mythic",
      cardLabel: "Ten of Swords",
      card: {
        kind: "minor",
        assetPathType: "minor",
        tarotCardNumber: 55,
        tarotCardFilename: "10_swords",
        suit: "swords"
      },
      assetPath: "minor/swords/10_swords",
      imageUrl:
        "https://kaabalah-app.s3.us-east-1.amazonaws.com/tarot/mythic/minor/swords/10_swords.jpg"
    });
    expect(resolveTarotImageUrl({ tarotCardNumber: 55 }, "mythic")).toBe(
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

  it("surfaces kaabalah-default numbering through profile and explicit helpers", () => {
    expect(
      getTarotCardProfile({ tarotCardName: "Ace of Pentacles" })
    ).toMatchObject({
      tarotCardName: "Ace of Pentacles",
      tarotCardNumber: 78,
      tarotCardFilename: "ace_pentacles"
    });

    expect(getTarotCardNumber({ tarotCardName: "The Magician" })).toBe(1);
    expect(getTarotCardNumber({ tarotCardName: "King of Swords" })).toBe(51);
    expect(getTarotCardNumber({ tarotCardName: "Ten of Pentacles" })).toBe(69);
    expect(getTarotCardNumber({ tarotCardName: "Ace of Pentacles" })).toBe(78);
  });

  it("round-trips major, court, and minor cards through tree-scoped number lookups", () => {
    const roundTripCases = [
      { name: "The Magician", number: 1 },
      { name: "King of Swords", number: 51 },
      { name: "Ace of Pentacles", number: 78 }
    ] as const;

    for (const testCase of roundTripCases) {
      expect(getTarotCardNumber({ tarotCardName: testCase.name })).toBe(
        testCase.number
      );
      expect(getTarotCardByNumber(testCase.number)?.tarotCardName).toBe(
        testCase.name
      );
    }
  });

  it("returns undefined for trees without tarot numbering mappings yet", () => {
    expect(
      getTarotCardNumber(
        { tarotCardName: "Ace of Pentacles" },
        "hermetic-qabalah"
      )
    ).toBeUndefined();
    expect(getTarotCardByNumber(78, "lurianic-kabbalah")).toBeUndefined();
  });
});
