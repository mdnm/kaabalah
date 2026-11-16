import { describe, expect, it } from "vitest";
import { IFA_TEXTS, getIfaText, calculateOdu } from "./index";

describe("Portuguese Ifa labels", () => {
  it("covers every existing direction label and invalid date message", () => {
    expect(Object.keys(IFA_TEXTS)).toHaveLength(9);
    for (const key of Object.keys(IFA_TEXTS) as (keyof typeof IFA_TEXTS)[]) {
      expect(getIfaText(key, "pt-BR").trim()).toBeTruthy();
      expect(getIfaText(key, "pt-BR")).toBe(IFA_TEXTS[key].pt);
      expect(getIfaText(key, "pt")).toBe(IFA_TEXTS[key].pt);
      expect(getIfaText(key)).toBe(IFA_TEXTS[key].en);
      expect(getIfaText(key, "fr")).toBe(IFA_TEXTS[key].en);
    }
    expect(() => calculateOdu(new Date(NaN))).toThrow(IFA_TEXTS.invalidDate.en);
  });
});
