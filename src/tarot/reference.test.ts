import { describe, expect, it } from "vitest";
import {
  ARKANNUS,
  getTarotArchetype,
  getTarotCardProfile,
  getTarotReadingReference,
  getTarotRepresentation,
  mythicFigure,
  MYTHIC_MINOR_CONTENT,
  TAROT_MAJOR_SCENES,
} from "./index";

describe("tarot reference content", () => {
  it("uses library terminology throughout the newly moved public texts", () => {
    const text = JSON.stringify([TAROT_MAJOR_SCENES, MYTHIC_MINOR_CONTENT]);
    expect(text).not.toMatch(/\b(?:arcan[ou]s?|arcanum|arcana|sephirah|sephiroth|sephirot|sefirah|sefirot|kabbalah|qabalah|cabala|chokmah)\b/i);
    expect(TAROT_MAJOR_SCENES.cards[21].pt.mythic).toContain("Ark Annus Maiores");
    expect(MYTHIC_MINOR_CONTENT.cards[60].pt.scene).toContain("desta esfera e deste Ark Annu");
    expect(MYTHIC_MINOR_CONTENT.cards[64].pt.divinatory).toContain("Os Ark Annus servem");
  });

  it("prevents callers from changing authoritative scenes, meanings or localized names", () => {
    const originalMajor = TAROT_MAJOR_SCENES.cards[7].en.mythic;
    const originalMinor = MYTHIC_MINOR_CONTENT.cards[57].pt.divinatory;
    const names = getTarotReadingReference("en");
    expect(Reflect.set(TAROT_MAJOR_SCENES.cards[7].en, "mythic", "changed")).toBe(false);
    expect(Reflect.set(TAROT_MAJOR_SCENES.cards, "7", {})).toBe(false);
    expect(Reflect.set(MYTHIC_MINOR_CONTENT.cards[57].pt, "divinatory", "changed")).toBe(false);
    expect(Reflect.set(names.major, "7", "changed")).toBe(false);
    expect(Reflect.set(names, "major", { 7: "changed" })).toBe(false);
    expect(TAROT_MAJOR_SCENES.cards[7].en.mythic).toBe(originalMajor);
    expect(MYTHIC_MINOR_CONTENT.cards[57].pt.divinatory).toBe(originalMinor);
    expect(getTarotReadingReference("en").major[7]).toBe("The Chariot");
    expect(getTarotCardProfile({ tarotCardNumber: 7 })?.descriptionsByDeck.mythic?.scene?.en).toBe(originalMajor);
  });

  it("covers all 22 majors in three pictured decks and both languages", () => {
    expect(Object.keys(TAROT_MAJOR_SCENES.cards)).toHaveLength(22);
    for (let number = 1; number <= 22; number++) {
      const content = TAROT_MAJOR_SCENES.cards[number];
      const card = getTarotCardProfile({ tarotCardNumber: number })!;
      for (const deck of ["papus", "papus_pt", "egyptian", "mythic"] as const) {
        const key = deck === "papus_pt" ? "papus" : deck;
        expect(card.descriptionsByDeck[deck]?.scene).toEqual({ en: content.en[key], pt: content.pt[key] });
        expect(content.en[key].trim().length).toBeGreaterThan(0);
        expect(content.pt[key].trim().length).toBeGreaterThan(0);
        expect(getTarotArchetype({ tarotCardNumber: number })?.descriptionsByDeck[deck]?.scene)
          .toEqual(card.descriptionsByDeck[deck]?.scene);
      }
      expect(card.descriptionsByDeck["rider-waite"]?.scene).toBeUndefined();
    }
  });

  it("attaches each of 56 minor and court scenes and divinatory texts to its canonical card", () => {
    expect(Object.keys(MYTHIC_MINOR_CONTENT.cards)).toHaveLength(56);
    for (const [key, content] of Object.entries(MYTHIC_MINOR_CONTENT.cards)) {
      const card = getTarotCardProfile({ tarotCardNumber: Number(key) })!;
      expect(card.tarotCardName).toBe(content.name);
      const description = card.descriptionsByDeck.mythic!;
      expect(description.scene).toEqual({ en: content.en.scene, pt: content.pt.scene });
      expect(description.divinatory).toEqual({ en: content.en.divinatory, pt: content.pt.divinatory });
      for (const language of ["en", "pt"] as const) {
        expect(description.scene?.[language].trim().length).toBeGreaterThan(0);
        expect(description.divinatory?.[language].trim().length).toBeGreaterThan(0);
      }
      expect(getTarotRepresentation({ tarotCardNumber: Number(key) }, "mythic")?.description)
        .toEqual(description);
      expect(card.descriptionsByDeck.papus?.scene).toBeUndefined();
      expect(card.descriptionsByDeck.egyptian?.scene).toBeUndefined();
    }
  });

  it("keeps existing meanings and keywords separate from deck reference texts", () => {
    const magician = getTarotCardProfile({ tarotCardNumber: 1 })!;
    expect(magician.descriptionsByDeck.papus_pt?.meaning).toContain("Abracadabra");
    expect(magician.descriptionsByDeck.papus?.meaning).toBe("Male inquirer.");
    expect(magician.descriptionsByDeck.mythic?.meaning).toBeUndefined();
    expect(magician.descriptionsByDeck.mythic?.keywords).toBeUndefined();
  });

  it("has a figure for every card except the intentionally unnamed Magician", () => {
    for (const card of ARKANNUS) {
      const description = getTarotCardProfile({ tarotCardNumber: card.number })?.descriptionsByDeck.mythic;
      if (card.number === 1) expect(description?.figure).toBeUndefined();
      else {
        expect(description?.figure?.en).toBeTruthy();
        expect(description?.figure?.pt).toBeTruthy();
      }
    }
    expect(mythicFigure({ kind: "major", number: 1 }, "pt-BR")).toBeNull();
    expect(mythicFigure({ kind: "major", number: 20 }, "pt-BR")).toBe("Hermes, o condutor de almas");
    expect(mythicFigure({ kind: "court", number: 66, suit: "pentacles", courtRank: "queen" }, "en")).toBe("Omphale");
    expect(mythicFigure({ kind: "minor", number: 78, suit: "pentacles", rank: 1 }, "pt")).toBe("Poseidon");
    expect(mythicFigure({ kind: "minor", number: 57, suit: "swords", rank: 8 }, "en")).toBe("Orestes");
  });

  it("keeps complete English and Portuguese reading names, including display aliases", () => {
    for (const language of ["en", "pt-BR"]) {
      const reference = getTarotReadingReference(language);
      expect(Object.keys(reference.major)).toHaveLength(22);
      expect(Object.keys(reference.rank)).toHaveLength(14);
      expect(Object.keys(reference.suit)).toHaveLength(4);
    }
    expect(getTarotReadingReference("pt-PT")).toEqual(getTarotReadingReference("pt-BR"));
    expect(getTarotReadingReference().major[16]).toBe("The Tower");
    expect(getTarotReadingReference("pt").major[16]).toBe("A Torre");
    expect(getTarotReadingReference("pt").rank.queen).toBe("Rainha");
    expect(getTarotReadingReference("pt").suit.pentacles).toBe("Ouros");
  });
});
