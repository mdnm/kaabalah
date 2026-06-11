import { describe, expect, it } from "vitest";

import {
  getCanonicalTree,
  id,
  KaabalahTypes,
  LetterTypes,
  NumerologyTypes,
  TarotTypes,
  WesternAstrologyTypes
} from "../core";
import {
  ARKANNUS,
  getTarotArchetype,
  getTarotCardByNumber,
  getTarotCardNumber,
  getTarotCorrespondenceProfile,
  getTarotCardProfile,
  getTarotRepresentation,
  getTarotRepresentations,
  listTarotDecks,
  listTarotTrees,
  resolveTarotImageUrl,
  shuffleTarotDeck
} from "./index";

function seededRng(seed = 42) {
  let state = seed;

  return () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32;
    return state / 2 ** 32;
  };
}

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

  it("keeps shuffle output as a complete deck under a controlled test rng", async () => {
    const shuffled = await shuffleTarotDeck(ARKANNUS, false, 1, 0, seededRng());
    const originalNames = ARKANNUS.map((card) => card.tarotCard).sort();
    const shuffledNames = shuffled.map((card) => card.tarotCard).sort();

    expect(shuffled).toHaveLength(78);
    expect(shuffledNames).toEqual(originalNames);
    expect(new Set(shuffledNames).size).toBe(78);
  });

  it("supports repeatable shuffle tests without making default divination deterministic", async () => {
    const first = await shuffleTarotDeck(ARKANNUS, false, 1, 0, seededRng());
    const second = await shuffleTarotDeck(ARKANNUS, false, 1, 0, seededRng());

    expect(first.map((card) => card.tarotCard)).toEqual(
      second.map((card) => card.tarotCard)
    );
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

  it("returns a normalized major correspondence profile with astrology and path metadata", () => {
    const magician = getTarotCorrespondenceProfile({
      tarotCardName: "The Magician"
    });

    expect(magician?.kind).toBe("major");

    if (!magician || magician.kind !== "major") {
      throw new Error("Expected The Magician to resolve as a major profile.");
    }

    expect(magician.correspondences.astrology).toContainEqual({
      type: WesternAstrologyTypes.WESTERN_ELEMENT,
      id: id(WesternAstrologyTypes.WESTERN_ELEMENT, "Air"),
      label: "Air"
    });
    expect(magician.correspondences.path).toEqual({
      pathId: id(KaabalahTypes.PATH, 1),
      pathNumber: 1,
      pathSlug: "aleph",
      meaning: "Crown's wisdom",
      hebrewLetter: {
        id: id(LetterTypes.HEBREW_LETTER, "Aleph"),
        label: "Aleph"
      },
      fromSphere: {
        id: id(KaabalahTypes.SPHERE, "Kether"),
        label: "Kether"
      },
      toSphere: {
        id: id(KaabalahTypes.SPHERE, "Chokhmah"),
        label: "Chokhmah"
      }
    });
  });

  it("returns pages with explicit court rank and only their suit element", () => {
    expect(
      getTarotCardProfile({ tarotCardName: "Page of Wands" })?.courtRank
    ).toBe("page");

    const page = getTarotCorrespondenceProfile({
      tarotCardName: "Page of Wands"
    });

    expect(page?.kind).toBe("court");

    if (!page || page.kind !== "court" || page.courtRank !== "page") {
      throw new Error("Expected Page of Wands to resolve as a page profile.");
    }

    expect(page.correspondences).toEqual({
      element: {
        id: id(WesternAstrologyTypes.WESTERN_ELEMENT, "Fire"),
        label: "Fire"
      }
    });
  });

  it("returns non-page court cards with explicit rank, sign, and planet correspondences", () => {
    expect(
      getTarotCardProfile({ tarotCardName: "King of Wands" })?.courtRank
    ).toBe("king");

    const king = getTarotCorrespondenceProfile({
      tarotCardName: "King of Wands"
    });

    expect(king?.kind).toBe("court");

    if (!king || king.kind !== "court" || king.courtRank === "page") {
      throw new Error("Expected King of Wands to resolve as a non-page court profile.");
    }

    expect(king.courtRank).toBe("king");
    expect(king.correspondences).toEqual({
      sign: {
        id: id(WesternAstrologyTypes.WESTERN_ZODIAC_SIGN, "Aries"),
        label: "Aries"
      },
      planets: [
        {
          id: id(WesternAstrologyTypes.PLANET, "Mars"),
          label: "Mars"
        }
      ]
    });
  });

  it("returns minor cards with their sphere and sphere planets", () => {
    const ace = getTarotCorrespondenceProfile({
      tarotCardName: "Ace of Pentacles"
    });

    expect(ace?.kind).toBe("minor");

    if (!ace || ace.kind !== "minor") {
      throw new Error("Expected Ace of Pentacles to resolve as a minor profile.");
    }

    expect(ace.correspondences).toEqual({
      sphere: {
        id: id(KaabalahTypes.SPHERE, "Kether"),
        label: "Kether"
      },
      planets: [
        {
          id: id(WesternAstrologyTypes.PLANET, "Neptune"),
          label: "Neptune"
        }
      ]
    });
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
