import reference from "./readingReference.json";

export interface ReadingReference {
  /** A short phrase for each of the eleven spheres. */
  readonly gloss: Readonly<Record<string, string>>;
  /** A pip's step by its rank, 1 to 10 (the ten numbered spheres, Daath has no pip). */
  readonly rung: Readonly<Record<string, string>>;
  /** Each sphere's step of the eleven-step descent, in one line. */
  readonly step: Readonly<Record<string, string>>;
  /** Each sphere's step of the descent, told in full. */
  readonly descent: Readonly<Record<string, string>>;
}

/** The descent from the idea to matter, Daath included: Kether is step 1, Malkuth step 11. */
export const DESCENT_ORDER = [
  "Kether",
  "Chokhmah",
  "Binah",
  "Daath",
  "Chesed",
  "Geburah",
  "Tiphareth",
  "Netzach",
  "Hod",
  "Yesod",
  "Malkuth",
] as const;

export const DESCENT_STEPS = DESCENT_ORDER.length;

/** A sphere's place in the eleven-step descent (1 to 11), or null for a name that is not a sphere. */
export function getDescentStep(sphere: string): number | null {
  const name = sphere.includes(":") ? sphere.split(":")[1] : sphere;
  const index = (DESCENT_ORDER as readonly string[]).indexOf(name);
  return index === -1 ? null : index + 1;
}

for (const vocabulary of Object.values(reference)) {
  Object.freeze(vocabulary.gloss);
  Object.freeze(vocabulary.rung);
  Object.freeze(vocabulary.step);
  Object.freeze(vocabulary.descent);
  Object.freeze(vocabulary);
}
Object.freeze(reference);

/** Plain sphere phrases and the eleven steps of the descent, in English or Portuguese. */
export function getReadingReference(language?: string): ReadingReference {
  return reference[language?.startsWith("pt") ? "pt-BR" : "en"];
}
