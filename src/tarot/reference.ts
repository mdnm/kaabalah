import majorScenes from "./majorScenes.json";
import mythicMinors from "./mythicMinors.json";
import readingReference from "./readingReference.json";
import type { TarotDeckDescription, TarotDeckId } from "./data";

export interface MajorSceneContent {
  readonly name: string;
  readonly en: Readonly<{ papus: string; egyptian: string; mythic: string }>;
  readonly pt: Readonly<{ papus: string; egyptian: string; mythic: string }>;
}

export interface MythicMinorContent {
  readonly name: string;
  readonly en: Readonly<{ scene: string; divinatory: string }>;
  readonly pt: Readonly<{ scene: string; divinatory: string }>;
}

/** These JSON-only trees are process-wide references, never caller-owned state. */
function freezeReference<T>(value: T): T {
  if (value !== null && typeof value === "object") {
    for (const child of Object.values(value)) freezeReference(child);
    Object.freeze(value);
  }
  return value;
}

/** Bilingual major-card scenes for Papus, Egyptian and Mythic decks. */
export const TAROT_MAJOR_SCENES: {
  readonly source: string;
  readonly cards: Readonly<Record<string, MajorSceneContent>>;
} = freezeReference(majorScenes);

/** Bilingual scenes and divinatory descriptions for Mythic minor and court cards. */
export const MYTHIC_MINOR_CONTENT: {
  readonly source: string;
  readonly cards: Readonly<Record<string, MythicMinorContent>>;
} = freezeReference(mythicMinors);

export interface TarotReadingReference {
  readonly major: Readonly<Record<string, string>>;
  readonly rank: Readonly<Record<string, string>>;
  readonly suit: Readonly<Record<string, string>>;
}

const READING_REFERENCE = freezeReference(readingReference);

/** Localized card names; Portuguese includes pt-BR. */
export function getTarotReadingReference(language?: string): TarotReadingReference {
  return READING_REFERENCE[language?.startsWith("pt") ? "pt-BR" : "en"];
}

/** Reference content for a canonical Kaabalah card number and deck. */
export function getTarotDeckReferenceContent(
  cardNumber: number,
  deckId: TarotDeckId,
): Pick<TarotDeckDescription, "scene" | "divinatory"> | undefined {
  const major = TAROT_MAJOR_SCENES.cards[String(cardNumber)];
  if (major && (deckId === "papus" || deckId === "papus_pt" || deckId === "egyptian" || deckId === "mythic")) {
    const deck = deckId === "papus_pt" ? "papus" : deckId;
    return { scene: { en: major.en[deck], pt: major.pt[deck] } };
  }
  const minor = MYTHIC_MINOR_CONTENT.cards[String(cardNumber)];
  if (minor && deckId === "mythic") {
    return {
      scene: { en: minor.en.scene, pt: minor.pt.scene },
      divinatory: { en: minor.en.divinatory, pt: minor.pt.divinatory },
    };
  }
  return undefined;
}
