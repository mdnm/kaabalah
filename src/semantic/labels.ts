import raw from "./labels.json";
import { freezeTextData } from "../localization";

export const KAABALISTIC_LABELS: Readonly<Record<string, Readonly<{ en: string; pt: string }>>> = freezeTextData(raw);

/** Localized display labels. IDs, glyphs and computation keys remain unchanged. */
export function getKaabalisticLabel(english: string, language?: string): string {
  if (!language?.startsWith("pt")) return english;
  const row = KAABALISTIC_LABELS[english];
  if (row) return row.pt;
  const path = /^Path (\d+)$/.exec(english);
  if (path) return `${KAABALISTIC_LABELS.Path.pt} ${path[1]}`;
  const life = /^(Life Path \((?:Kaabalistic|Straight)\)) (\d+)$/.exec(english);
  if (life) return `${KAABALISTIC_LABELS[life[1]].pt} ${life[2]}`;
  const sign = /^(.*) in (.*)$/.exec(english);
  if (sign) return KAABALISTIC_LABELS["{source} in {sign}"].pt
    .replace("{source}", getKaabalisticLabel(sign[1], language)).replace("{sign}", getKaabalisticLabel(sign[2], language));
  const house = /^(.*) • House (\d+)$/.exec(english);
  if (house) return KAABALISTIC_LABELS["{source} • House {house}"].pt
    .replace("{source}", getKaabalisticLabel(house[1], language)).replace("{house}", house[2]);
  const aspect = /^Aspects \u2014 (.*)$/.exec(english);
  if (aspect) return `${KAABALISTIC_LABELS.Aspects.pt}: ${getKaabalisticLabel(aspect[1], language)}`;
  return english;
}
