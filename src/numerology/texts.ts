import * as data from "./data";
import pt from "./texts.pt.json";
import { freezeTextData } from "../localization";

const en = {
  CYCLE_MEANINGS: data.CYCLE_MEANINGS,
  NUMEROLOGY_KEYWORDS: data.NUMEROLOGY_KEYWORDS,
  DAY_OF_BIRTH_MEANING: data.DAY_OF_BIRTH_MEANING,
  LIFEPATH_MEANING: data.LIFEPATH_MEANING,
  CHALLENGE_MEANING: data.CHALLENGE_MEANING,
  CHALLENGE_HEALTH_MEANING: data.CHALLENGE_HEALTH_MEANING,
  PERSONAL_CYCLE_KEYWORDS: data.PERSONAL_CYCLE_KEYWORDS,
  PERSONAL_YEAR_DESCRIPTIONS: data.PERSONAL_YEAR_DESCRIPTIONS,
};

export type NumerologyTextData = typeof en;
const portuguese: NumerologyTextData = pt;

/** English and Portuguese numerology meaning tables. */
export const NUMEROLOGY_TEXT_DATA = freezeTextData({
  en: JSON.parse(JSON.stringify(en)) as NumerologyTextData,
  pt: portuguese,
});

/** All numerology meaning tables. English is the default; pt and pt-BR select Portuguese. */
export function getNumerologyData(language?: string) {
  return language?.startsWith("pt") ? NUMEROLOGY_TEXT_DATA.pt : NUMEROLOGY_TEXT_DATA.en;
}
