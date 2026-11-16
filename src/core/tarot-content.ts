import raw from "./tarot-content.json";

interface DeckText {
  name: string;
  meaning?: string;
}
interface ContentRow {
  en: { PAPUS_KAABALISTIC: DeckText & { meaning: string }; PAPUS_DIVINATORY: DeckText & { meaning: string }; KIER_EGYPTIAN: DeckText };
  pt: ContentRow["en"];
  /** Preserve an existing difference in the legacy raw card export. */
  legacyMeaning?: string;
}

// Shared by the core graph and the standalone tarot catalog. No tree initialization.
function freeze<T>(value: T): T {
  if (value && typeof value === "object") {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

export const TAROT_CONTENT: Readonly<Record<string, ContentRow>> = freeze(raw);

/** Legacy graph exports retain independent, mutable description objects. */
export function getEnglishTarotDeckDescriptions(filename: string): ContentRow["en"] {
  const { en } = TAROT_CONTENT[filename];
  return {
    PAPUS_KAABALISTIC: { ...en.PAPUS_KAABALISTIC },
    PAPUS_DIVINATORY: { ...en.PAPUS_DIVINATORY },
    KIER_EGYPTIAN: { ...en.KIER_EGYPTIAN },
  };
}
