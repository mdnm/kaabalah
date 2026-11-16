import { describe, expect, it } from "vitest";
import { HEXAGRAMS, getHexagramText, HEXAGRAM_TEXTS, getIChingReadingContent, getIChingReading } from "./index";
import type { LinePosition } from "./types";
import review from "../../docs/localization/iching-review.json";

describe("Portuguese classical I Ching texts", () => {
  it("covers every judgment, image, line and special text without changing originals", () => {
    const seen: string[] = [];
    for (const h of HEXAGRAMS) {
      const pt = getHexagramText(h.number, "pt-BR")!;
      const en = getHexagramText(h.number)!;
      const check = (key: string, original: { chinese: string; english: string }, localized: typeof pt.judgment) => {
        const id = `${h.number}.${key}`;
        seen.push(id);
        expect(HEXAGRAM_TEXTS[id]?.en).toBe(original.english);
        expect(localized.chinese).toBe(original.chinese);
        expect(localized.english).toBe(original.english);
        expect(localized.content).toBe(HEXAGRAM_TEXTS[id]?.pt);
        expect(localized.content.trim()).toBeTruthy();
        expect(localized.content).not.toContain("\u2014");
        expect(review.some(r => r.id === `iching.${id}`)).toBe(true);
      };
      check("judgment", h.text.judgment, pt.judgment);
      check("image", h.text.image, pt.image);
      h.text.lines.forEach((line, i) => check(`lines.${i + 1}`, line, pt.lines[i]));
      if (h.text.useNine) check("useNine", h.text.useNine, pt.useNine!);
      if (h.text.useSix) check("useSix", h.text.useSix, pt.useSix!);
      expect(en.judgment.content).toBe(h.text.judgment.english);
      expect(getHexagramText(h.number, "fr")).toEqual(en);
      expect(getHexagramText(h.number, "pt")).toEqual(pt);
      expect(Object.isFrozen(pt.lines)).toBe(true);
    }
    expect(seen.sort()).toEqual(Object.keys(HEXAGRAM_TEXTS).sort());
    expect(seen).toHaveLength(514);
    expect(getHexagramText(0, "pt-BR")).toBeUndefined();
  });

  it("localizes both Gamu text paths while preserving every oracle selection rule", () => {
    for (let mask = 0; mask < 64; mask++) {
      const movingLines = Array.from({ length: 6 }, (_, i) => i + 1)
        .filter(line => mask & (1 << (line - 1))) as LinePosition[];
      for (const hexagramNumber of [1, 2, 25, 30, 63, 64]) {
        const input = { hexagramNumber, movingLines };
        const original = getIChingReading(input);
        const localized = getIChingReadingContent(input, "pt-BR");
        expect(localized.lines).toEqual(original.lines);
        expect(localized.cast.hexagram.text).toEqual(getHexagramText(hexagramNumber, "pt-BR"));
        expect(localized.cast.nuclear.hexagram.text).toEqual(getHexagramText(localized.cast.nuclear.hexagram.number, "pt-BR"));
        if (localized.transformed) {
          expect(localized.transformed.hexagram.text).toEqual(getHexagramText(localized.transformed.hexagram.number, "pt-BR"));
        }
        localized.oracle.forEach((selection, i) => {
          const { content, ...text } = selection.text;
          expect({ ...selection, text }).toEqual(original.oracle[i]);
          const key = `${selection.hexagramNumber}.${selection.kind === "line" ? `lines.${selection.line}` : selection.kind}`;
          expect(content).toBe(HEXAGRAM_TEXTS[key].pt);
        });
      }
    }
  });
});
