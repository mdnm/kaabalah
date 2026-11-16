import raw from "./labels.json";
import { TAROT_CONTENT } from "../core/tarot-content";
import { freezeTextData } from "../localization";

/** Names used by astrology calculations, including dignity, sect and lunar nodes. */
export const ASTROLOGY_LABELS: Readonly<Record<string, Readonly<{ en: string; pt: string }>>> = freezeTextData(raw);
const tarotNames = new Map(Object.values(TAROT_CONTENT).map(row => [row.en.PAPUS_KAABALISTIC.name, row.pt.PAPUS_KAABALISTIC.name]));

/**
 * Display a sign, planet, node, dignity, sect, aspect or decan card name in the requested language.
 * English is the default. Calculation identifiers remain unchanged. Unknown names pass through.
 */
export function getAstrologyLabel(label: string, language?: string): string {
  if (!language?.startsWith("pt")) return label;
  return ASTROLOGY_LABELS[label]?.pt ?? tarotNames.get(label) ?? label;
}
