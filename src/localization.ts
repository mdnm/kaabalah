/** JSON content is shared process-wide; callers receive read-only text tables. */
export type ReadonlyTextData<T> = T extends readonly (infer Item)[]
  ? readonly ReadonlyTextData<Item>[]
  : T extends object ? { readonly [Key in keyof T]: ReadonlyTextData<T[Key]> } : T;

export function freezeTextData<T>(value: T): ReadonlyTextData<T> {
  if (value !== null && typeof value === "object") {
    for (const child of Object.values(value)) freezeTextData(child);
    Object.freeze(value);
  }
  return value as ReadonlyTextData<T>;
}

/** Resolve every `{ en, pt }` pair in bilingual text data to one language, as a fresh copy. */
export function pickTextLanguage(value: unknown, language: "en" | "pt"): unknown {
  if (Array.isArray(value)) return value.map(item => pickTextLanguage(item, language));
  if (!value || typeof value !== "object") return value;
  const keys = Object.keys(value);
  if (keys.length === 2 && "en" in value && "pt" in value) {
    return pickTextLanguage((value as { en: unknown; pt: unknown })[language], language);
  }
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, pickTextLanguage(item, language)]));
}
