import { describe, expect, it } from "vitest";
import { getTarotSpread, listTarotSpreads } from "./spreads";
import rows from "./spreads.text.json";
import review from "../../docs/localization/spreads-review.json";

describe("Portuguese spread text", () => {
  it("covers every rendered English label, note and description", () => {
    const seen: string[] = [];
    const lookup: Record<string, { en: string; pt: string }> = rows;
    for (const en of listTarotSpreads()) {
      const pt = getTarotSpread(en.spreadId, "pt-BR")!;
      const check = (key: string, original?: string, translated?: string) => {
        if (!original) return;
        const id = `${en.spreadId}.${key}`;
        seen.push(id);
        expect(lookup[id]?.en, id).toBe(original);
        expect(lookup[id]?.pt.trim(), id).toBeTruthy();
        expect(translated, id).toBe(lookup[id].pt);
        expect(translated).not.toContain("\u2014");
        if (original !== translated) expect(review.some(r => r.id === `tarot.spreads.${id}`)).toBe(true);
      };
      check("label", en.label, pt.label);
      check("description", en.description, pt.description);
      en.slots.forEach((slot, i) => {
        check(`${slot.slotKey}.label`, slot.label, pt.slots[i].label);
        check(`${slot.slotKey}.displayLabel`, slot.metadata?.displayLabel, pt.slots[i].metadata?.displayLabel);
        check(`${slot.slotKey}.note`, slot.metadata?.note, pt.slots[i].metadata?.note);
        expect(pt.slots[i].slotKey).toBe(slot.slotKey);
        expect(pt.slots[i].validationRules).toEqual(slot.validationRules);
      });
    }
    expect(seen.sort()).toEqual(Object.keys(rows).sort());
  });
  it("keeps clones independent and falls back to English", () => {
    expect(listTarotSpreads("pt")).toEqual(listTarotSpreads("pt-BR"));
    expect(listTarotSpreads("fr")).toEqual(listTarotSpreads());
    const pt = getTarotSpread("conscious-reading", "pt-BR")!;
    pt.slots[0].label = "changed";
    expect(getTarotSpread("conscious-reading", "pt-BR")?.slots[0].label).toBe("Consciente");
    expect(getTarotSpread("conscious-reading")?.slots[0].label).toBe("Conscious");
  });
});
