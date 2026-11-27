import correspondences from "./day-sign-correspondences.json";
import glyphs from "./day-sign-glyphs.json";
import monthGlyphs from "./haab-month-glyphs.json";
import { KAABALAH_IMAGE_BASE_URL } from "../asset-urls";
import { getMayaSignMetadata, haabMonthLength, MayaCalculationError, type MayaDirection, type MayaHaabMonth, type MayaSignId } from "./calendar";

const DIRECTION_CORRESPONDENCES = {
  east: { color: "red", element: "fire" },
  west: { color: "black", element: "earth" },
  north: { color: "white", element: "air" },
  south: { color: "yellow", element: "water" },
} as const satisfies Record<MayaDirection, { color: string; element: string }>;

function glyphSource(figure: 17 | 20) {
  return Object.freeze({
    author: "Sylvanus G. Morley",
    title: "An Introduction to the Study of the Maya Hieroglyphs",
    year: 1915,
    figure,
    style: "codex",
    url: `https://commons.wikimedia.org/wiki/File:Maya_Hieroglyphs_Fig_${figure}.jpg`,
  } as const);
}

const DAY_GLYPH_SOURCE = glyphSource(17);
const MONTH_GLYPH_SOURCE = glyphSource(20);
export const MAYA_GLYPH_BASE_URL = `${KAABALAH_IMAGE_BASE_URL}/maya/glyphs`;

/** Johnson’s correspondence tables and one historical codex glyph variant per day sign. */
export function getMayaDaySignReference(sign: MayaSignId) {
  const metadata = getMayaSignMetadata(sign);
  const { themes, animal, body, plant } = correspondences[sign];
  return {
    ...metadata,
    ...DIRECTION_CORRESPONDENCES[metadata.direction],
    themes: { ...themes },
    animal: { ...animal },
    body: { ...body },
    plant: { ...plant },
    glyph: { variant: glyphs[sign], imageUrl: `${MAYA_GLYPH_BASE_URL}/day/${sign}.png`, source: DAY_GLYPH_SOURCE },
  };
}

export function listMayaDaySignReferences() {
  return (Object.keys(correspondences) as MayaSignId[]).map(getMayaDaySignReference);
}

export function getMayaHaabMonthReference(month: MayaHaabMonth) {
  if (!Object.prototype.hasOwnProperty.call(monthGlyphs, month)) {
    throw new MayaCalculationError("INVALID_ARGUMENT", "Unknown Maya Haab month.");
  }
  return {
    month,
    daysInMonth: haabMonthLength(month),
    glyph: {
      variant: monthGlyphs[month],
      imageUrl: `${MAYA_GLYPH_BASE_URL}/haab/${month.toLowerCase()}.png`,
      source: MONTH_GLYPH_SOURCE,
    },
  };
}

export function listMayaHaabMonthReferences() {
  return (Object.keys(monthGlyphs) as MayaHaabMonth[]).map(getMayaHaabMonthReference);
}
