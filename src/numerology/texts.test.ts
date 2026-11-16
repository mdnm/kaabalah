import { describe, expect, it } from "vitest";
import { getNumerologyData, NumerologyData } from "./index";

describe("Portuguese numerology content", () => {
  it("covers every English table key and array item, with no empty translations", () => {
    const en = getNumerologyData();
    const pt = getNumerologyData("pt-BR");
    const ids: string[] = [];
    function walk(a: unknown, b: unknown, path: string) {
      if (typeof a === "string") {
        expect(typeof b, path).toBe("string");
        expect((b as string).trim(), path).toBeTruthy();
        expect(b).not.toContain("\u2014");
        ids.push(`numerology.${path}`);
      } else if (Array.isArray(a)) {
        expect(Array.isArray(b), path).toBe(true);
        expect((b as unknown[]).length, path).toBe(a.length);
        a.forEach((item, i) => walk(item, (b as unknown[])[i], `${path}.${i}`));
      } else {
        const original = a as Record<string, unknown>, translated = b as Record<string, unknown>;
        expect(Object.keys(translated).sort(), path).toEqual(Object.keys(original).sort());
        for (const key of Object.keys(original)) walk(original[key], translated[key], path ? `${path}.${key}` : key);
      }
    }
    walk(en, pt, "");
    expect(ids).toHaveLength(296);
    for (const key of Object.keys(en) as (keyof typeof en)[]) expect(en[key]).toEqual(NumerologyData[key]);
    expect(getNumerologyData("fr")).toBe(en);
    expect(getNumerologyData("pt")).toBe(pt);
    expect(Object.isFrozen(pt.LIFEPATH_MEANING[1].positiveTraits)).toBe(true);
    expect(Object.isFrozen(NumerologyData.LIFEPATH_MEANING)).toBe(false);
  });
});
