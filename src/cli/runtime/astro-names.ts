/**
 * Static name lists used to validate CLI input before the (lazy-loaded) astrology module is
 * imported. `astro-names.test.ts` pins every list to the library export so they cannot drift.
 */

export const ASPECT_NAMES = [
  "conjunction",
  "duodecile",
  "octile",
  "sextile",
  "square",
  "trine",
  "trioctile",
  "quincunx",
  "opposition",
] as const;

export const MAJOR_ASPECT_NAMES = ["conjunction", "sextile", "square", "trine", "opposition"] as const;

export const POINT_ID_NAMES = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
  "mean-node",
  "true-node",
  "south-node-mean",
  "south-node-true",
  "mean-lilith",
  "true-lilith",
  "chiron",
  "asc",
  "mc",
  "dsc",
  "ic",
  "vertex",
  "lot-fortune",
  "lot-spirit",
] as const;

export const ORB_PROFILE_NAMES = ["ptolemaic-plus-quincunx"] as const;

export const INPUT_QUALITY_NAMES = ["recorded", "rectified", "untimed", "partial"] as const;
export const RETURN_PASS_KIND_NAMES = [
  "saturn-return",
  "jupiter-return",
  "uranus-opposition",
  "mean-nodal-return",
  "true-nodal-return",
  "solar-return",
] as const;
export const ANGLE_CONVENTION_NAMES = ["quotidian", "solar-arc", "naibod"] as const;
export const NAKSHATRA_FRAME_NAMES = ["dhruva", "lahiri"] as const;
export const NODE_CONVENTION_NAMES = ["mean", "true"] as const;
export const MIDPOINT_CONVENTION_NAMES = ["arithmetic-shorter-arc", "great-circle"] as const;
export const PAIR_MODE_NAMES = ["all", "pairs", "timed-only"] as const;
export const RULERSHIP_NAMES = ["traditional", "modern"] as const;
export const VARGA_DIVISIONS = [1, 2, 3, 4, 7, 9, 10, 12, 16, 20, 24, 27, 30, 40, 45, 60] as const;
export const ZODIAC_SIGN_NAMES = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;
