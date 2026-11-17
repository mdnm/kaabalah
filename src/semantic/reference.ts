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
  /** Display names of the three movements of the Tree (see `DESCENT_MOVEMENT`). */
  readonly movement: Readonly<Record<DescentMovement, string>>;
}

/** The Tree as a game of three movements, one per column. */
export type DescentMovement = "expansion" | "contraction" | "balance";

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

/**
 * Each sphere's movement by its column: the right column expands, the left
 * column contracts and the middle column balances the two.
 */
export const DESCENT_MOVEMENT: Readonly<Record<(typeof DESCENT_ORDER)[number], DescentMovement>> = Object.freeze({
  Kether: "balance",
  Chokhmah: "expansion",
  Binah: "contraction",
  Daath: "balance",
  Chesed: "expansion",
  Geburah: "contraction",
  Tiphareth: "balance",
  Netzach: "expansion",
  Hod: "contraction",
  Yesod: "balance",
  Malkuth: "balance",
});

/** A sphere's movement (expansion, contraction or balance), or null for a name that is not a sphere. */
export function getDescentMovement(sphere: string): DescentMovement | null {
  const name = sphere.includes(":") ? sphere.split(":")[1] : sphere;
  return (DESCENT_MOVEMENT as Readonly<Record<string, DescentMovement>>)[name] ?? null;
}

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
  Object.freeze(vocabulary.movement);
  Object.freeze(vocabulary);
}
Object.freeze(reference);

/** Plain sphere phrases and the eleven steps of the descent, in English or Portuguese. */
export function getReadingReference(language?: string): ReadingReference {
  return reference[language?.startsWith("pt") ? "pt-BR" : "en"];
}
