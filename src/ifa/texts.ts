import raw from "./texts.json";
import { freezeTextData } from "../localization";

/** Calculation labels only. The library contains no Odu interpretation catalog. */
export const IFA_TEXTS = freezeTextData(raw);
export type IfaTextKey = keyof typeof IFA_TEXTS;

/** Portuguese for pt and pt-BR; English is the default. Draft labels need author review. */
export function getIfaText(key: IfaTextKey, language?: string): string {
  return language?.startsWith("pt") ? IFA_TEXTS[key].pt : IFA_TEXTS[key].en;
}
