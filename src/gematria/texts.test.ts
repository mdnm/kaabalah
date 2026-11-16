import { describe, expect, it } from "vitest";
import { getGematriaData, GematriaData } from "./index";

describe("Portuguese gematria meanings", () => {
  it("covers all three tables, preserving English", () => {
    const en = getGematriaData(), pt = getGematriaData("pt-BR");
    const ids: string[] = [];
    for (const table of Object.keys(en) as (keyof typeof en)[]) {
      expect(en[table]).toEqual(GematriaData[table]);
      expect(Object.keys(pt[table])).toEqual(Object.keys(en[table]));
      for (const key of Object.keys(en[table])) {
        const text = (pt[table] as Record<string, string>)[key];
        expect(text.trim(), `${table}.${key}`).toBeTruthy();
        expect(text).not.toMatch(/[\u2014%~*]/);
        ids.push(`gematria.${table}.${key}`);
      }
    }
    expect(ids).toHaveLength(39);
    expect(getGematriaData("pt")).toBe(pt);
    expect(getGematriaData("es")).toBe(en);
    expect(Object.isFrozen(pt.PERSONALITY_NUMBER_MEANINGS)).toBe(true);
  });
});
