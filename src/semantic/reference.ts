import reference from "./readingReference.json";

export interface ReadingReference {
  readonly gloss: Readonly<Record<string, string>>;
  readonly rung: Readonly<Record<string, string>>;
}

for (const vocabulary of Object.values(reference)) {
  Object.freeze(vocabulary.gloss);
  Object.freeze(vocabulary.rung);
  Object.freeze(vocabulary);
}
Object.freeze(reference);

/** Plain sphere phrases and ten steps of the descent, in English or Portuguese. */
export function getReadingReference(language?: string): ReadingReference {
  return reference[language?.startsWith("pt") ? "pt-BR" : "en"];
}
