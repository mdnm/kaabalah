import * as data from "./data";
import pt from "./texts.pt.json";
import { freezeTextData } from "../localization";

const en = {
  INDIVIDUALITY_NUMBER_MEANINGS: data.INDIVIDUALITY_NUMBER_MEANINGS,
  PERSONALITY_NUMBER_MEANINGS: data.PERSONALITY_NUMBER_MEANINGS,
  SYNTHESIS_NUMBER_MEANINGS: data.SYNTHESIS_NUMBER_MEANINGS,
};
export type GematriaTextData = typeof en;
const portuguese: GematriaTextData = pt;

/** English and Portuguese individuality, personality and synthesis meanings. */
export const GEMATRIA_TEXT_DATA = freezeTextData({
  en: JSON.parse(JSON.stringify(en)) as GematriaTextData,
  pt: portuguese,
});

/** All three gematria meaning tables. English is the default; pt and pt-BR select Portuguese. */
export function getGematriaData(language?: string) {
  return language?.startsWith("pt") ? GEMATRIA_TEXT_DATA.pt : GEMATRIA_TEXT_DATA.en;
}
