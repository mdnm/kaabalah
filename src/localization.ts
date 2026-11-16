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
