/**
 * Panchanga: the five limbs of the Hindu almanac day (vara, tithi, nakshatra, yoga,
 * karana) at a place, plus the Sarvartha Siddhi special yoga. Calculation data and
 * method metadata only; no interpretation text.
 *
 * Definitions (Lahiri sidereal frame, geocentric apparent longitudes of date):
 *  - Vara: the weekday from one sunrise to the next, read as in `getPlanetaryHours`
 *    (weekday of the sunrise in the given zone). The sunrise is by default the Hindu
 *    rising (centre of the disc, no refraction), as Indian almanacs print it.
 *  - Tithi: `floor((Moon - Sun) / 12)` + 1, 1..30. Tithis 1..15 are the bright half
 *    (shukla paksha, ending at the full moon), 16..30 the dark half (krishna paksha,
 *    ending at the new moon). The ayanamsa cancels in the difference.
 *  - Nakshatra: the Moon's Lahiri sidereal longitude in 27 sectors of 13°20'.
 *  - Yoga (nitya yoga): `(Sun + Moon)` Lahiri sidereal longitudes in 27 sectors of 13°20'.
 *  - Karana: half a tithi, `floor((Moon - Sun) / 6)`, 0..59: Kimstughna, then the seven
 *    movable karanas eight times (Bava ... Vishti), then Shakuni, Chatushpada, Naga.
 *
 * Also: the lunar month (amanta and purnimanta, with adhika months), ritu, Shaka and Vikram years
 * with the samvatsara, Rahu Kala / Yamaganda / Gulika, and the 30 muhurtas with Abhijit and
 * Brahma muhurta. Each convention is stated in `method`.
 *
 * The limb in force at sunrise names the day (the almanac convention); every limb that
 * runs during the vara is also listed with its exact start and end. Boundaries are
 * solved with the shared signed-angle root solver (`findAngularRoots`).
 *
 * Synchronous; requires an initialised Swiss Ephemeris (`await getSwissEph(...)`). The
 * Lahiri sidereal mode is selected only inside one synchronous `withSiderealMode` scope.
 */

import { TimelineError } from "../firdaria";
import {
  getPlanetaryHours,
  type PlanetaryHoursOptions,
  type PlanetaryWeekdayBasis,
  type SunriseDefinition,
} from "../planetary-hours";
import { ROOT_SOLVER_METHOD, type RootSolverMethodMetadata } from "../returns";
import { dateToJd, findAngularRoots, jdToDate } from "../root-solver";
import { CalcFlag, Planet, SWISS_SIDM_LAHIRI, withSiderealMode } from "../swisseph";
import { EphemerisTracker, ephemerisFlags, type EphemerisCheckOptions, type EphemerisUsage, type JyotishEphemeris } from "./bodies";
import { normalizeDegrees } from "./frames";
import { NAKSHATRA_IDS, NAKSHATRA_WIDTH_DEGREES, type NakshatraId } from "./nakshatra";

// ---------------------------------------------------------------------------
// Names
// ---------------------------------------------------------------------------

export const TITHI_WIDTH_DEGREES = 12;
export const KARANA_WIDTH_DEGREES = 6;
export const NITYA_YOGA_WIDTH_DEGREES = NAKSHATRA_WIDTH_DEGREES;

/** Names of the 15 tithis of a paksha; the 15th is Purnima (shukla) or Amavasya (krishna). */
export const TITHI_NAMES = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami",
  "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi",
] as const;
export type TithiName = (typeof TITHI_NAMES)[number] | "Purnima" | "Amavasya";

export type Paksha = "shukla" | "krishna";

/** The 27 nitya yogas in order, from 0° of (Sun + Moon). */
export const NITYA_YOGA_NAMES = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula",
  "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan",
  "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti",
] as const;
export type NityaYogaName = (typeof NITYA_YOGA_NAMES)[number];

/** The seven movable (chara) karanas, repeated eight times from the second half of Shukla Pratipada. */
export const MOVABLE_KARANA_NAMES = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti"] as const;
/** The four fixed (sthira) karanas: index 0, then 57, 58, 59. */
export const FIXED_KARANA_NAMES = ["Kimstughna", "Shakuni", "Chatushpada", "Naga"] as const;
export type KaranaName = (typeof MOVABLE_KARANA_NAMES)[number] | (typeof FIXED_KARANA_NAMES)[number];

/** Vara names indexed like `Date#getUTCDay()` (0 = Sunday), with the planet ruling the day. */
export const VARA_NAMES = [
  "Ravivara", "Somavara", "Mangalavara", "Budhavara", "Guruvara", "Shukravara", "Shanivara",
] as const;
export type VaraName = (typeof VARA_NAMES)[number];

// ---------------------------------------------------------------------------
// Pure classification
// ---------------------------------------------------------------------------

export interface TithiPlacement {
  /** 0-based, 0..29. */
  index: number;
  /** 1..30 (1..15 shukla, 16..30 krishna). */
  number: number;
  paksha: Paksha;
  /** 1..15 within the paksha. */
  pakshaNumber: number;
  name: TithiName;
  /** Fraction of the tithi elapsed, [0, 1). */
  elapsedFraction: number;
}

/** Tithi of an elongation (Moon minus Sun, degrees, any real value). */
export function tithiFromElongation(elongation: number): TithiPlacement {
  const e = normalizeDegrees(elongation);
  const q = e / TITHI_WIDTH_DEGREES;
  const index = Math.min(29, Math.floor(q));
  const paksha: Paksha = index < 15 ? "shukla" : "krishna";
  const pakshaNumber = (index % 15) + 1;
  const name: TithiName =
    pakshaNumber === 15 ? (paksha === "shukla" ? "Purnima" : "Amavasya") : TITHI_NAMES[pakshaNumber - 1];
  return { index, number: index + 1, paksha, pakshaNumber, name, elapsedFraction: q - index };
}

export interface KaranaPlacement {
  /** 0-based half-tithi, 0..59. */
  index: number;
  /** 1..60. */
  number: number;
  name: KaranaName;
  kind: "fixed" | "movable";
  elapsedFraction: number;
}

export function karanaName(index: number): KaranaName {
  if (index === 0) return "Kimstughna";
  if (index >= 57) return FIXED_KARANA_NAMES[index - 56];
  return MOVABLE_KARANA_NAMES[(index - 1) % 7];
}

/** Karana of an elongation (Moon minus Sun, degrees, any real value). */
export function karanaFromElongation(elongation: number): KaranaPlacement {
  const e = normalizeDegrees(elongation);
  const q = e / KARANA_WIDTH_DEGREES;
  const index = Math.min(59, Math.floor(q));
  return {
    index,
    number: index + 1,
    name: karanaName(index),
    kind: index === 0 || index >= 57 ? "fixed" : "movable",
    elapsedFraction: q - index,
  };
}

export interface NityaYogaPlacement {
  /** 0-based, 0..26. */
  index: number;
  /** 1..27. */
  number: number;
  name: NityaYogaName;
  elapsedFraction: number;
}

/** Nitya yoga of the sum of the Sun's and Moon's sidereal longitudes (degrees, any real value). */
export function nityaYogaFromSum(siderealSunPlusMoon: number): NityaYogaPlacement {
  const s = normalizeDegrees(siderealSunPlusMoon);
  const q = s / NITYA_YOGA_WIDTH_DEGREES;
  const index = Math.min(26, Math.floor(q));
  return { index, number: index + 1, name: NITYA_YOGA_NAMES[index], elapsedFraction: q - index };
}

// ---------------------------------------------------------------------------
// Sarvartha Siddhi
// ---------------------------------------------------------------------------

/**
 * Sarvartha Siddhi yoga: weekday (0 = Sunday) -> the Moon's nakshatras that form it.
 *
 * Source: Muhurta Chintamani of Daivajna Rama (1600 CE), Shubhashubha prakarana,
 * verses 1.28-29, which the text itself attributes to earlier authorities ("kathitani
 * purvaih"). The verse names the nakshatras by their deities; the decoding is given in
 * {@link SARVARTHA_SIDDHI_SOURCE}. "Uttara" on Sunday covers all three Uttaras.
 */
export const SARVARTHA_SIDDHI_NAKSHATRAS: Readonly<Record<number, readonly NakshatraId[]>> = Object.freeze({
  0: Object.freeze(["Hasta", "Mula", "Uttara_Phalguni", "Uttara_Ashadha", "Uttara_Bhadrapada", "Pushya", "Ashwini"] as NakshatraId[]),
  1: Object.freeze(["Shravana", "Rohini", "Mrigashira", "Pushya", "Anuradha"] as NakshatraId[]),
  2: Object.freeze(["Ashwini", "Uttara_Bhadrapada", "Krittika", "Ashlesha"] as NakshatraId[]),
  3: Object.freeze(["Rohini", "Anuradha", "Hasta", "Krittika", "Mrigashira"] as NakshatraId[]),
  4: Object.freeze(["Revati", "Anuradha", "Ashwini", "Punarvasu", "Pushya"] as NakshatraId[]),
  5: Object.freeze(["Revati", "Anuradha", "Ashwini", "Punarvasu", "Shravana"] as NakshatraId[]),
  6: Object.freeze(["Shravana", "Rohini", "Swati"] as NakshatraId[]),
});

export const SARVARTHA_SIDDHI_SOURCE = Object.freeze({
  text: "Muhurta Chintamani (Daivajna Rama, 1600 CE), Shubhashubha prakarana 1.28-29",
  verse:
    "surye 'rka-mula-uttara-pushya-dasram; candre shruti-brahma-shashi-ijya-maitram; " +
    "bhaume 'shvi-ahirbudhnya-krishanu-sarpam; jne brahma-maitra-arka-krishanu-candram; " +
    "jive 'ntya-maitra-ashvi-aditi-ijya-dhishnyam; shukre 'ntya-maitra-ashvi-aditi-shravo-bham; " +
    "shanau shruti-brahma-samira-bhani sarvartha-siddhyai kathitani purvaih",
  decoding:
    "arka=Hasta, dasra/ashvi=Ashwini, uttara=the three Uttaras, ijya=Pushya, shruti/shravas=Shravana, " +
    "brahma=Rohini, shashi/candra=Mrigashira, maitra=Anuradha, ahirbudhnya=Uttara Bhadrapada, " +
    "krishanu=Krittika, sarpa=Ashlesha, antya=Revati, aditi=Punarvasu, samira=Swati",
  window:
    "The verse gives the weekday-nakshatra pairs only. Windows here are the overlap of the vara " +
    "(sunrise to next sunrise) with the span of a listed nakshatra, the usual almanac reading. " +
    "No later exclusions (Rahu Kala, Vishti karana, tithi or eclipse rules) are applied.",
});

export function isSarvarthaSiddhi(weekday: number, nakshatra: NakshatraId): boolean {
  return SARVARTHA_SIDDHI_NAKSHATRAS[weekday]?.includes(nakshatra) ?? false;
}

// ---------------------------------------------------------------------------
// Masa, ritu and the year
// ---------------------------------------------------------------------------

/** Lunar months in order; an amanta month is named by the sidereal sign the Sun holds at its new moon, plus one. */
export const MASA_NAMES = [
  "Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada",
  "Ashvina", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna",
] as const;
export type MasaName = (typeof MASA_NAMES)[number];

/** The six seasons of the lunar year, two months each from Chaitra. */
export const VEDIC_RITU_NAMES = ["Vasanta", "Grishma", "Varsha", "Sharad", "Hemanta", "Shishira"] as const;
export type VedicRituName = (typeof VEDIC_RITU_NAMES)[number];

/**
 * The 60-year cycle, from Prabhava, spelled as Prokerala's daily panchang prints them (read from its
 * pages for 1980-2026, which cover all 60).
 */
export const SAMVATSARA_NAMES = [
  "Prabhava", "Vibhava", "Shukla", "Pramoda", "Prajapati", "Angira", "Shrimukha", "Bhava", "Yuva", "Dhatru",
  "Isvara", "Bahu Dhanya", "Pramathi", "Vikrama", "Vrisha", "Chitra Bhanu", "Subhanu", "Tarana", "Parthiva", "Vyaya",
  "Sarvajit", "Sarvadhari", "Virodhi", "Vikruti", "Khara", "Nandana", "Vijaya", "Jaya", "Manmatha", "Durmukha",
  "Hemalamba", "Vilamba", "Vikari", "Sarvari", "Plava", "Shubhakrit", "Shobhana", "Krodhi", "Visvavasu", "Parabhava",
  "Plavanga", "Kilaka", "Saumya", "Sadharana", "Virodhakrit", "Paridhavi", "Pramadi", "Ananda", "Rakshasa", "Anala",
  "Pingala", "Kalayukta", "Siddharthi", "Raudra", "Durmati", "Dundhubhi", "Rudhirodgari", "Raktaksa", "Krodhana", "Kshaya",
] as const;
export type SamvatsaraName = (typeof SAMVATSARA_NAMES)[number];

export interface Samvatsara {
  /** 0-based from Prabhava. */
  index: number;
  /** 1..60. */
  number: number;
  name: SamvatsaraName;
}

const samvatsaraAt = (index: number): Samvatsara => {
  const i = ((index % 60) + 60) % 60;
  return { index: i, number: i + 1, name: SAMVATSARA_NAMES[i] };
};

/** South Indian samvatsara of a Shaka year (Chaitradi count, no years skipped): 1946 is Krodhi, 1948 Parabhava. */
export function samvatsaraOfShakaYear(shakaYear: number): Samvatsara {
  return samvatsaraAt(shakaYear + 11);
}

/**
 * Jovian (Barhaspatya, North Indian) samvatsara current at the true Mesha sankranti of a Shaka year,
 * by the oldest rule: Brihat Samhita 8.20-21 (Varahamihira). Multiply the Shaka years by 11 and by 4,
 * add 8589, divide by 3750; the quotient added to the Shaka years, mod 60, is the count of years
 * elapsed since Prabhava (8.27). `shakaYear` is the usual Shaka number (Gregorian year - 78), which
 * counts expired years. Gives Raudra for Shaka 1948 (2026-27).
 */
export function jovianSamvatsaraBrihatSamhita(shakaYear: number): Samvatsara {
  return samvatsaraAt(shakaYear + Math.floor((44 * shakaYear + 8589) / 3750));
}

/**
 * Jovian samvatsara current at the true Mesha sankranti of a Shaka year by the Surya Siddhanta
 * (1.55: Jupiter's mean signs since the Kali epoch, counted from Vijaya) with the bija correction,
 * in the integer form of Sewell and Dikshit, The Indian Calendar (1896), Art. 59c, meant for years
 * after 1500 CE: K = Shaka + 3179 expired Kali years; samvatsara = (floor((117 K - 60) / 10000) + K + 27)
 * mod 60, counted from Prabhava = 1. This is the rule current North Indian almanacs follow (Siddharthi
 * for Shaka 1948, 2026-27).
 */
export function jovianSamvatsaraSuryaSiddhanta(shakaYear: number): Samvatsara {
  const kali = shakaYear + 3179;
  return samvatsaraAt(Math.floor((117 * kali - 60) / 10000) + kali + 27 - 1);
}

// ---------------------------------------------------------------------------
// Day periods
// ---------------------------------------------------------------------------

/**
 * Eighth of the daytime (1..8) holding Rahu Kala, by weekday (0 = Sunday). This is the table of
 * South Indian almanacs; no classical text for it was found, unlike Gulika and Yamaganda.
 */
export const RAHU_KALA_PARTS: readonly number[] = Object.freeze([8, 2, 7, 5, 6, 4, 3]);

/**
 * Eighth of the daytime ruled by `planetWeekday` (0 = Sun ... 6 = Saturn) on `weekday`: the eight
 * parts go to the weekday lords in weekday order from the lord of the day, the eighth to none
 * (Brihat Parashara Hora Shastra, upagrahas). Gulika is Saturn's part, Yamaganda Jupiter's.
 */
export function dayPartOfPlanet(weekday: number, planetWeekday: number): number {
  return ((planetWeekday - weekday + 7) % 7) + 1;
}

/** Day muhurta (1..15) of Abhijit: the eighth, around local noon. */
export const ABHIJIT_DAY_MUHURTA = 8;
/** Night muhurta (1..15) of Brahma muhurta: the fourteenth, the last but one before sunrise. */
export const BRAHMA_NIGHT_MUHURTA = 14;

/**
 * Vedic names of the 15 day and 15 night muhurtas, which differ between the bright and the dark
 * fortnight: Taittiriya Brahmana 3.10.1.1-3 ("esha hy eva te 'hno muhurtah, esha ratreh", 3.10.9.7).
 * Transliterated without accents.
 */
export const VEDIC_MUHURTA_NAMES: Readonly<Record<Paksha, { day: readonly string[]; night: readonly string[] }>> = Object.freeze({
  shukla: {
    day: [
      "Citra", "Ketu", "Prabhan", "Abhan", "Sambhan", "Jyotishman", "Tejasvan", "Atapan",
      "Tapan", "Abhitapan", "Rocana", "Rocamana", "Shobhana", "Shobhamana", "Kalyana",
    ],
    night: [
      "Savita", "Prasavita", "Dipta", "Dipayan", "Dipyamana", "Jvalan", "Jvalita", "Tapan",
      "Vitapan", "Santapan", "Rocana", "Rocamana", "Shumbhu", "Shumbhamana", "Vama",
    ],
  },
  krishna: {
    day: [
      "Data", "Pradata", "Ananda", "Moda", "Pramoda", "Aveshayan", "Niveshayan", "Samveshana",
      "Samshanta", "Shanta", "Abhavan", "Prabhavan", "Sambhavan", "Sambhuta", "Bhuta",
    ],
    night: [
      "Abhishasta", "Anumanta", "Ananda", "Moda", "Pramoda", "Asadayan", "Nishadayan", "Samsadana",
      "Samsanna", "Sanna", "Abhu", "Vibhu", "Prabhu", "Shambhu", "Bhuva",
    ],
  },
});

/**
 * Presiding deities of the muhurtas, the scheme that the Dur Muhurta rule names them by:
 * Narada Samhita 9.1-3 (also Muhurta Martanda and Muhurta Chintamani 6.52-53, with synonyms).
 * Day 8 (Vidhatr) is Abhijit.
 */
export const MUHURTA_DEITIES = Object.freeze({
  day: [
    "Rudra", "Ahi", "Mitra", "Pitr", "Vasu", "Udaka", "Vishvedeva", "Vidhatr",
    "Brahma", "Indra", "Indragni", "Asura", "Varuna", "Aryaman", "Bhaga",
  ],
  night: [
    "Isha", "Ajapada", "Ahirbudhnya", "Pushan", "Ashvins", "Yama", "Agni", "Dhatr",
    "Chandra", "Aditi", "Ijya", "Vishnu", "Arka", "Tvashtr", "Vayu",
  ],
} as const);

/**
 * Dur Muhurtas, the muhurtas to avoid for auspicious work, by weekday (0 = Sunday): Narada Samhita
 * 9.4-5, also Muhurta Chintamani 6.54. Tuesday's Agni is read as night muhurta 7 (Agni presides
 * only there; day 11 is Indragni); the verse itself does not say day or night.
 */
export const DUR_MUHURTAS: Readonly<Record<number, readonly { isDay: boolean; number: number }[]>> = Object.freeze({
  0: [{ isDay: true, number: 14 }],
  1: [{ isDay: true, number: 9 }, { isDay: true, number: 12 }],
  2: [{ isDay: true, number: 4 }, { isDay: false, number: 7 }],
  3: [{ isDay: true, number: 8 }],
  4: [{ isDay: true, number: 6 }, { isDay: true, number: 12 }],
  5: [{ isDay: true, number: 9 }, { isDay: true, number: 4 }],
  6: [{ isDay: true, number: 1 }, { isDay: true, number: 2 }],
});

/** Length of a Varjyam or Amrit Kaal window: 4 ghatis of the nakshatra's 60. */
export const GHATI_WINDOW_LENGTH = 4;

/**
 * Varjyam (visha ghati): ghati of the nakshatra (out of 60, scaled to its real length) at which
 * the 4-ghati window begins, in nakshatra order from Ashwini. Narada Samhita (vivaha) 55-60;
 * the same table is in Vasishtha Samhita, Muhurta Martanda and Muhurta Chintamani 6.49-51.
 */
export const VARJYAM_START_GHATI: readonly number[] = Object.freeze([
  50, 24, 30, 40, 14, 21, 30, 20, 32,
  30, 20, 18, 21, 20, 14, 14, 10, 14,
  56, 24, 20, 10, 10, 18, 16, 24, 30,
]);

/**
 * Amrit Kaal (amrita ghati): start ghati of the 4-ghati window, in nakshatra order from Ashwini.
 * From the verse quoted ("matantare") in the Sanskrit commentary on Prashna Marga 21 (Kerala, 1649),
 * which counts from Krittika and adds 30 to each number. The same commentary first gives a
 * simpler rule (the 4 ghatis after Varjyam), which is not used here.
 */
export const AMRIT_KAAL_START_GHATI: readonly number[] = Object.freeze([
  42, 48, 54, 52, 38, 35, 54, 44, 56,
  54, 44, 42, 45, 44, 38, 38, 34, 38,
  44, 48, 44, 34, 34, 42, 40, 48, 54,
]);

/** Choghadiya names by the planet of the slot, indexed by weekday (0 = Sun ... 6 = Saturn). */
export const CHOGHADIYA_NAMES = ["Udveg", "Amrit", "Rog", "Labh", "Shubh", "Char", "Kaal"] as const;
export type ChoghadiyaName = (typeof CHOGHADIYA_NAMES)[number];

/**
 * Planet (as a weekday, 0 = Sun) of choghadiya slot `slot` (1..8). By day the first slot belongs to
 * the lord of the weekday and each next one to the lord five weekdays on (the hora order); by night
 * the first belongs to the lord four weekdays on and each next one four more. No classical text was
 * found for this rule: it is a later North Indian / Gujarati almanac convention.
 */
export function choghadiyaPlanet(weekday: number, slot: number, isDay: boolean): number {
  const step = isDay ? 5 : 4;
  const first = isDay ? weekday : (weekday + 4) % 7;
  return (first + (slot - 1) * step) % 7;
}

// ---------------------------------------------------------------------------
// Day calculation
// ---------------------------------------------------------------------------

export interface PanchangaOptions extends EphemerisCheckOptions {
  /** The instant asked about; the panchanga day is the vara (sunrise to sunrise) containing it. */
  date: Date;
  latitude: number;
  longitude: number;
  /** How to read the weekday of the sunrise; see `PlanetaryHoursOptions.timeZoneSettings`. */
  timeZoneSettings?: PlanetaryHoursOptions["timeZoneSettings"];
  ephemeris?: JyotishEphemeris;
  /** Default `"disc-centre-without-refraction"` (Hindu rising); see `PlanetaryHoursOptions`. */
  sunriseDefinition?: SunriseDefinition;
}

/** One limb's interval. `start` may be before the sunrise and `end` after the next sunrise. */
export interface LimbSpan<T> {
  value: T;
  start: Date;
  end: Date;
}

export interface LimbDay<T> {
  /** The limb in force at sunrise: the one that names the day. */
  atSunrise: T;
  /** The limb in force at `date`. */
  atDate: T;
  /** Every limb that runs during the vara, in order, with exact boundaries. */
  spans: LimbSpan<T>[];
}

export interface NakshatraValue {
  index: number;
  number: number;
  id: NakshatraId;
  name: string;
}

export interface Vara {
  /** 0 = Sunday. */
  weekday: number;
  name: VaraName;
  lord: "Sun" | "Moon" | "Mars" | "Mercury" | "Jupiter" | "Venus" | "Saturn";
  sunrise: Date;
  nextSunrise: Date;
}

export interface SarvarthaSiddhiWindow {
  start: Date;
  end: Date;
  nakshatra: NakshatraValue;
}

export interface SarvarthaSiddhiDay {
  /** True when the Moon's nakshatra at sunrise forms the yoga with the vara. */
  atSunrise: boolean;
  /** True when `date` falls inside a window. */
  atDate: boolean;
  /** Parts of the vara in which the yoga holds, clipped to sunrise and next sunrise. */
  windows: SarvarthaSiddhiWindow[];
}

export interface PanchangaMethod {
  frame: "Lahiri (Chitrapaksha) sidereal, Swiss mode 1, true (nutated) ayanamsa";
  longitudes: "geocentric apparent ecliptic longitudes of date";
  dayBoundary: "sunrise to next sunrise";
  sunriseDefinition: SunriseDefinition;
  weekdayBasis: PlanetaryWeekdayBasis;
  timeZone: string | null;
  utcOffsetMinutes: number;
  tithi: "floor((Moon - Sun) / 12 deg) + 1";
  nakshatra: "floor(Moon sidereal / 13deg20') + 1";
  yoga: "floor((Sun + Moon) sidereal / 13deg20') + 1";
  karana: "floor((Moon - Sun) / 6 deg); 0 Kimstughna, 1..56 movable cycle from Bava, 57 Shakuni, 58 Chatushpada, 59 Naga";
  sarvarthaSiddhi: typeof SARVARTHA_SIDDHI_SOURCE;
  masa: string;
  year: string;
  dayPeriods: string;
  muhurtas: string;
  varjyam: string;
  amritKaal: string;
  choghadiya: string;
  solver: RootSolverMethodMetadata;
}

export interface Masa {
  /** The month from new moon to new moon that holds the sunrise. */
  amanta: {
    index: number;
    name: MasaName;
    /** No sankranti (Sun's sidereal sign change) between its new moons: an intercalary month. */
    adhika: boolean;
    /**
     * Two sankrantis between its new moons (Siddhanta Shiromani, Madhyamadhikara, adhimasa 6): a
     * kshaya month, which carries two names. It is named by its first sankranti and the name of the
     * second is dropped from the year (`absorbs`), the rule of Sewell and Dikshit Art. 46.
     */
    kshaya: boolean;
    /** The month name a kshaya month absorbs; null otherwise. */
    absorbs: MasaName | null;
    /** Sankrantis between its new moons: 0 (adhika), 1, or 2 (kshaya). */
    sankrantis: number;
    /** The new moons that open and close it. */
    start: Date;
    end: Date;
  };
  /** From full moon to full moon: the krishna paksha takes the next month's name, except in an adhika month. */
  purnimanta: { index: number; name: MasaName; adhika: boolean };
  /** Season of the lunar year (from the amanta month). */
  ritu: { index: number; name: VedicRituName };
}

export interface PanchangaYear {
  /** Shaka year of the Chaitradi luni-solar count: it starts with amanta Chaitra. */
  shaka: number;
  /** Vikram year in the same Chaitradi count (Shaka + 135). */
  vikram: number;
  /** South Indian samvatsara of the 60-year cycle for that Shaka year (no years skipped). */
  samvatsara: Samvatsara;
  /**
   * North Indian (Jovian) samvatsara current at the Mesha sankranti of that Shaka year, which names
   * the whole Vikram year: the Surya Siddhanta rule with bija that current almanacs follow
   * (`jovianSamvatsaraSuryaSiddhanta`). The older Brihat Samhita rule is `jovianSamvatsaraBrihatSamhita`.
   */
  jovianSamvatsara: Samvatsara;
}

export interface DayPeriod {
  /** Which eighth of the daytime, 1..8. */
  part: number;
  start: Date;
  end: Date;
}

export interface DayPeriods {
  rahuKala: DayPeriod;
  yamaganda: DayPeriod;
  gulika: DayPeriod;
}

export interface Muhurta {
  /** 1..15 within the day or within the night. */
  number: number;
  isDay: boolean;
  /** Taittiriya Brahmana name, for the paksha of the tithi at this vara's sunrise. */
  vedicName: string;
  /** Presiding deity (Narada Samhita 9.1-3). */
  deity: string;
  start: Date;
  end: Date;
}

export interface Muhurtas {
  /** Fifteen equal parts of sunrise to sunset. */
  day: Muhurta[];
  /** Fifteen equal parts of sunset to next sunrise. */
  night: Muhurta[];
  /** The 8th day muhurta. No weekday exclusion is applied. */
  abhijit: Muhurta;
  /** The 14th muhurta of the night that ends at this vara's sunrise (null if that night has no sunset). */
  brahma: Muhurta | null;
  /** This vara's Dur Muhurtas (Narada Samhita 9.4-5), in time order. */
  durMuhurtas: Muhurta[];
}

/** A Varjyam or Amrit Kaal window inside one nakshatra. */
export interface GhatiWindow {
  start: Date;
  end: Date;
  nakshatra: NakshatraValue;
  /** Ghati of the nakshatra (out of 60) at which the window begins. */
  startGhati: number;
}

export interface ChoghadiyaSlot {
  /** 1..8 within the day or within the night. */
  number: number;
  isDay: boolean;
  name: ChoghadiyaName;
  /** Weekday planet of the slot (0 = Sun ... 6 = Saturn). */
  planet: number;
  start: Date;
  end: Date;
}

export interface Panchanga {
  available: true;
  date: Date;
  latitude: number;
  longitude: number;
  vara: Vara;
  tithi: LimbDay<TithiPlacement>;
  nakshatra: LimbDay<NakshatraValue>;
  yoga: LimbDay<NityaYogaPlacement>;
  karana: LimbDay<KaranaPlacement>;
  /** Moon minus Sun at sunrise and at `date`, degrees in [0, 360). Above 180 the Moon is waning. */
  elongation: { atSunrise: number; atDate: number };
  /** Lahiri ayanamsa at sunrise, degrees. */
  ayanamsa: number;
  specialYogas: { sarvarthaSiddhi: SarvarthaSiddhiDay };
  masa: Masa;
  year: PanchangaYear;
  sunset: Date;
  dayPeriods: DayPeriods;
  muhurtas: Muhurtas;
  /** Varjyam windows that overlap the vara (not clipped). */
  varjyam: GhatiWindow[];
  /** Amrit Kaal windows that overlap the vara (not clipped). */
  amritKaal: GhatiWindow[];
  /** Eight day slots (sunrise to sunset) and eight night slots (sunset to next sunrise). */
  choghadiya: { day: ChoghadiyaSlot[]; night: ChoghadiyaSlot[] };
  ephemerisUsage: EphemerisUsage;
  method: PanchangaMethod;
}

export interface PanchangaUnavailable {
  available: false;
  reason: "polar-day" | "polar-night";
  message: string;
  date: Date;
  latitude: number;
  longitude: number;
}

export type PanchangaResult = Panchanga | PanchangaUnavailable;

/** Grid step for the boundary searches (days). Every quantity here grows 11 to 16 degrees a day. */
const SCAN_STEP_DAYS = 0.25;
/** No limb lasts longer than about 1.2 days; this window always holds its start or end. */
const SEARCH_REACH_DAYS = 1.6;

const nakshatraValue = (index: number): NakshatraValue => {
  const id = NAKSHATRA_IDS[index];
  return { index, number: index + 1, id, name: id.replace(/_/g, " ") };
};

interface Quantity<T> {
  value: (jd: number) => number;
  speed: (jd: number) => number;
  width: number;
  classify: (degrees: number) => T & { index: number };
}

function spansOver<T>(q: Quantity<T>, fromJd: number, toJd: number): LimbSpan<T & { index: number }>[] {
  const boundary = (degrees: number, startJd: number, endJd: number, last: boolean): number => {
    const { roots } = findAngularRoots({
      longitude: q.value,
      speed: q.speed,
      target: degrees,
      start: startJd,
      end: endJd,
      stepDays: SCAN_STEP_DAYS,
    });
    const direct = roots.filter((r) => r.direction !== "retrograde");
    const root = last ? direct[direct.length - 1] : direct[0];
    if (!root) throw new Error(`panchanga: no boundary at ${degrees} deg between JD ${startJd} and ${endJd}`);
    return root.jd;
  };

  // A span's value is the limb as it begins: any elapsed fraction is 0.
  const valueAt = (jd: number): T & { index: number } => {
    const v = q.classify(q.value(jd));
    return "elapsedFraction" in v ? { ...v, elapsedFraction: 0 } : v;
  };

  const spans: LimbSpan<T & { index: number }>[] = [];
  let value = valueAt(fromJd);
  let startJd = boundary(value.index * q.width, fromJd - SEARCH_REACH_DAYS, fromJd, true);
  for (;;) {
    // Search strictly after the start so a boundary exactly at `startJd` is not found again.
    const endJd = boundary((value.index + 1) * q.width, startJd + 1e-6, startJd + SEARCH_REACH_DAYS, false);
    spans.push({ value, start: jdToDate(startJd), end: jdToDate(endJd) });
    if (endJd >= toJd) break;
    startJd = endJd;
    // Classify just inside the new span; the root is exact to a millisecond.
    value = valueAt(endJd + 1e-6);
  }
  return spans;
}

function limbDay<T>(spans: LimbSpan<T>[], atDateMs: number): LimbDay<T> {
  const found = spans.find((s) => atDateMs >= s.start.getTime() && atDateMs < s.end.getTime());
  return { atSunrise: spans[0].value, atDate: (found ?? spans[spans.length - 1]).value, spans };
}

/**
 * The panchanga of the vara (sunrise to next sunrise) containing `date` at a place.
 *
 * ```ts
 * const p = getPanchanga({ date: new Date(), latitude: 28.61, longitude: 77.21, timeZoneSettings: { timeZone: "Asia/Kolkata" } });
 * if (p.available) p.tithi.atSunrise.name; // e.g. "Dwitiya"
 * ```
 */
export function getPanchanga(options: PanchangaOptions): PanchangaResult {
  const { date, latitude, longitude } = options;
  const hours = getPlanetaryHours({
    date,
    latitude,
    longitude,
    timeZoneSettings: options.timeZoneSettings,
    sunriseDefinition: options.sunriseDefinition ?? "disc-centre-without-refraction",
  });
  if (!hours.available) {
    return {
      available: false,
      reason: hours.reason,
      message:
        hours.reason === "polar-day"
          ? "The Sun does not set at this place around this date, so there is no sunrise-to-sunrise day."
          : "The Sun does not rise at this place around this date, so there is no sunrise-to-sunrise day.",
      date,
      latitude,
      longitude,
    };
  }

  const ephemeris = options.ephemeris ?? "swiss";
  if (ephemeris !== "swiss" && ephemeris !== "moshier") {
    throw new TimelineError("INVALID_INPUT", `ephemeris must be "swiss" or "moshier".`);
  }
  const tracker = new EphemerisTracker(ephemeris, options.strictEphemeris);
  const tropicalFlags = ephemerisFlags(ephemeris);
  const siderealFlags = tropicalFlags | CalcFlag.SIDEREAL;

  const sunriseJd = dateToJd(hours.sunrise);
  const nextSunriseJd = dateToJd(hours.nextSunrise);
  const dateJd = dateToJd(date);

  // The night before this vara (for Brahma muhurta): the sunset of the previous planetary day.
  const previousDay = getPlanetaryHours({
    date: new Date(hours.sunrise.getTime() - 60_000),
    latitude,
    longitude,
    timeZoneSettings: options.timeZoneSettings,
    sunriseDefinition: hours.method.sunriseDefinition,
  });
  const previousSunset = previousDay.available ? previousDay.sunset : null;

  const dayPeriods = dayPeriodsOf(hours.weekday, hours.sunrise, hours.sunset);


  return withSiderealMode(SWISS_SIDM_LAHIRI, () => {
    const cache = new Map<number, { sun: number; moon: number; sunSpeed: number; moonSpeed: number }>();
    const sample = (jd: number) => {
      let s = cache.get(jd);
      if (!s) {
        const sun = tracker.calc(jd, Planet.SUN, siderealFlags);
        const moon = tracker.calc(jd, Planet.MOON, siderealFlags);
        s = { sun: sun.longitude, moon: moon.longitude, sunSpeed: sun.longitudeSpeed ?? 0, moonSpeed: moon.longitudeSpeed ?? 0 };
        cache.set(jd, s);
      }
      return s;
    };
    const elongation = (jd: number) => normalizeDegrees(sample(jd).moon - sample(jd).sun);
    const elongationSpeed = (jd: number) => sample(jd).moonSpeed - sample(jd).sunSpeed;

    const tithiQ: Quantity<TithiPlacement> = {
      value: elongation,
      speed: elongationSpeed,
      width: TITHI_WIDTH_DEGREES,
      classify: tithiFromElongation,
    };
    const karanaQ: Quantity<KaranaPlacement> = {
      value: elongation,
      speed: elongationSpeed,
      width: KARANA_WIDTH_DEGREES,
      classify: karanaFromElongation,
    };
    const nakshatraQ: Quantity<NakshatraValue> = {
      value: (jd) => normalizeDegrees(sample(jd).moon),
      speed: (jd) => sample(jd).moonSpeed,
      width: NAKSHATRA_WIDTH_DEGREES,
      classify: (deg) => nakshatraValue(Math.min(26, Math.floor(normalizeDegrees(deg) / NAKSHATRA_WIDTH_DEGREES))),
    };
    const yogaQ: Quantity<NityaYogaPlacement> = {
      value: (jd) => normalizeDegrees(sample(jd).sun + sample(jd).moon),
      speed: (jd) => sample(jd).sunSpeed + sample(jd).moonSpeed,
      width: NITYA_YOGA_WIDTH_DEGREES,
      classify: nityaYogaFromSum,
    };

    const dateMs = date.getTime();
    const tithi = limbDay(spansOver(tithiQ, sunriseJd, nextSunriseJd), dateMs);
    const karana = limbDay(spansOver(karanaQ, sunriseJd, nextSunriseJd), dateMs);
    const nakshatra = limbDay(spansOver(nakshatraQ, sunriseJd, nextSunriseJd), dateMs);
    const yoga = limbDay(spansOver(yogaQ, sunriseJd, nextSunriseJd), dateMs);

    // Span values are taken at the span start; at sunrise and at `date` report the real fractions.
    tithi.atSunrise = tithiFromElongation(elongation(sunriseJd));
    tithi.atDate = tithiFromElongation(elongation(dateJd));
    karana.atSunrise = karanaFromElongation(elongation(sunriseJd));
    karana.atDate = karanaFromElongation(elongation(dateJd));
    yoga.atSunrise = nityaYogaFromSum(yogaQ.value(sunriseJd));
    yoga.atDate = nityaYogaFromSum(yogaQ.value(dateJd));

    // Masa: the amanta month holding the sunrise, between the new moons around it.
    const newMoon = (startJd: number, endJd: number, last: boolean): number => {
      const { roots } = findAngularRoots({
        longitude: elongation,
        speed: elongationSpeed,
        target: 0,
        start: startJd,
        end: endJd,
        stepDays: 0.5,
      });
      const root = last ? roots[roots.length - 1] : roots[0];
      if (!root) throw new Error(`panchanga: no new moon between JD ${startJd} and ${endJd}`);
      return root.jd;
    };
    const monthStartJd = newMoon(sunriseJd - 31, sunriseJd, true);
    const monthEndJd = newMoon(sunriseJd + 1e-6, sunriseJd + 31, false);
    const sunSign = (jd: number) => Math.min(11, Math.floor(normalizeDegrees(sample(jd).sun) / 30));
    const startSign = sunSign(monthStartJd);
    const amantaIndex = (startSign + 1) % 12;
    // The true Sun moves 28 to 31 degrees in a lunation, so it crosses 0, 1 or 2 sign boundaries.
    const sankrantis = (sunSign(monthEndJd) - startSign + 12) % 12;
    const adhika = sankrantis === 0;
    const kshaya = sankrantis === 2;
    // An adhika month is the same lunation in both counts; otherwise the krishna half takes the next name.
    const purnimantaIndex = tithi.atSunrise.paksha === "krishna" && !adhika ? (amantaIndex + 1) % 12 : amantaIndex;
    const masa: Masa = {
      amanta: {
        index: amantaIndex,
        name: MASA_NAMES[amantaIndex],
        adhika,
        kshaya,
        absorbs: kshaya ? MASA_NAMES[(amantaIndex + 1) % 12] : null,
        sankrantis,
        start: jdToDate(monthStartJd),
        end: jdToDate(monthEndJd),
      },
      purnimanta: { index: purnimantaIndex, name: MASA_NAMES[purnimantaIndex], adhika },
      ritu: { index: Math.floor(amantaIndex / 2), name: VEDIC_RITU_NAMES[Math.floor(amantaIndex / 2)] },
    };

    // Year: Chaitra opens the Shaka year. Its start lies about `amantaIndex` lunations back, always in
    // February to May of one Gregorian year, so an intercalary month in between cannot change the year.
    const chaitraStart = new Date(jdToDate(monthStartJd).getTime() - amantaIndex * SYNODIC_MONTH_MS);
    const shaka = chaitraStart.getUTCFullYear() - 78;
    const year: PanchangaYear = {
      shaka,
      vikram: shaka + 135,
      samvatsara: samvatsaraOfShakaYear(shaka),
      jovianSamvatsara: jovianSamvatsaraSuryaSiddhanta(shaka),
    };

    const sunTropical = tracker.calc(sunriseJd, Planet.SUN, tropicalFlags).longitude;
    const ayanamsa = normalizeDegrees(sunTropical - sample(sunriseJd).sun);

    const weekday = hours.weekday;
    const sunriseMs = hours.sunrise.getTime();
    const nextSunriseMs = hours.nextSunrise.getTime();
    const windows: SarvarthaSiddhiWindow[] = nakshatra.spans
      .filter((s) => isSarvarthaSiddhi(weekday, s.value.id))
      .map((s) => ({
        start: new Date(Math.max(s.start.getTime(), sunriseMs)),
        end: new Date(Math.min(s.end.getTime(), nextSunriseMs)),
        nakshatra: s.value,
      }))
      .filter((w) => w.end.getTime() > w.start.getTime());

    const muhurtas = muhurtasOf(
      weekday,
      tithi.atSunrise.paksha,
      hours.sunrise,
      hours.sunset,
      hours.nextSunrise,
      previousSunset
    );
    const varjyam = ghatiWindows(nakshatra.spans, VARJYAM_START_GHATI, hours.sunrise, hours.nextSunrise);
    const amritKaal = ghatiWindows(nakshatra.spans, AMRIT_KAAL_START_GHATI, hours.sunrise, hours.nextSunrise);
    const choghadiya = choghadiyaOf(weekday, hours.sunrise, hours.sunset, hours.nextSunrise);

    return {
      available: true as const,
      date,
      latitude,
      longitude,
      vara: {
        weekday,
        name: VARA_NAMES[weekday],
        lord: hours.dayRuler,
        sunrise: hours.sunrise,
        nextSunrise: hours.nextSunrise,
      },
      tithi,
      nakshatra,
      yoga,
      karana,
      elongation: { atSunrise: elongation(sunriseJd), atDate: elongation(dateJd) },
      ayanamsa,
      specialYogas: {
        sarvarthaSiddhi: {
          atSunrise: isSarvarthaSiddhi(weekday, nakshatra.atSunrise.id),
          atDate: windows.some((w) => dateMs >= w.start.getTime() && dateMs < w.end.getTime()),
          windows,
        },
      },
      masa,
      year,
      sunset: hours.sunset,
      dayPeriods,
      muhurtas,
      varjyam,
      amritKaal,
      choghadiya,
      ephemerisUsage: tracker.usage(),
      method: {
        frame: "Lahiri (Chitrapaksha) sidereal, Swiss mode 1, true (nutated) ayanamsa",
        longitudes: "geocentric apparent ecliptic longitudes of date",
        dayBoundary: "sunrise to next sunrise",
        sunriseDefinition: hours.method.sunriseDefinition,
        weekdayBasis: hours.method.weekdayBasis,
        timeZone: hours.method.timeZone,
        utcOffsetMinutes: hours.method.utcOffsetMinutes,
        tithi: "floor((Moon - Sun) / 12 deg) + 1",
        nakshatra: "floor(Moon sidereal / 13deg20') + 1",
        yoga: "floor((Sun + Moon) sidereal / 13deg20') + 1",
        karana:
          "floor((Moon - Sun) / 6 deg); 0 Kimstughna, 1..56 movable cycle from Bava, 57 Shakuni, 58 Chatushpada, 59 Naga",
        sarvarthaSiddhi: SARVARTHA_SIDDHI_SOURCE,
        masa:
          "amanta month between the new moons around the sunrise, named by the Sun's Lahiri sign at its opening new moon " +
          "plus one (Mina -> Chaitra); adhika when the Sun changes no sign before the closing new moon; purnimanta " +
          "gives the krishna paksha the next month's name, except in an adhika month; kshaya when the Sun changes two signs (Siddhanta Shiromani), named by the first sankranti with the second name absorbed (Sewell and Dikshit Art. 46)",
        year:
          "Chaitradi luni-solar count: Shaka year from the Gregorian year in which amanta Chaitra began, minus 78; " +
          "Vikram = Shaka + 135; samvatsara index (Shaka + 11) mod 60. Jovian (North Indian) samvatsara current at the Mesha sankranti of the Shaka year by the Surya Siddhanta with bija (Sewell and Dikshit Art. 59c, the rule current almanacs follow; meant for years after 1500 CE). Names spelled as Prokerala prints them",
        dayPeriods:
          "sunrise to sunset in 8 equal parts; Gulika and Yamaganda are the parts of Saturn and Jupiter when the parts " +
          "go to the weekday lords from the lord of the day (BPHS upagrahas); Rahu Kala follows the South Indian " +
          "almanac table (Sun 8, Mon 2, Tue 7, Wed 5, Thu 6, Fri 4, Sat 3)",
        muhurtas:
          "15 equal day muhurtas (sunrise to sunset) and 15 equal night muhurtas (sunset to next sunrise); Abhijit is " +
          "day muhurta 8 and Brahma muhurta night muhurta 14 of the night before this vara, both proportional; " +
          "no weekday exclusions; Vedic names from Taittiriya Brahmana 3.10.1 for the paksha of the tithi at sunrise, " +
          "deities from Narada Samhita 9.1-3; Dur Muhurtas from Narada Samhita 9.4-5 (Tuesday's Agni read as night 7)",
        varjyam:
          "4 ghatis of the nakshatra (scaled to its real length) from the start ghati of Narada Samhita (vivaha) 55-60 " +
          "= Muhurta Chintamani 6.49-51; windows that overlap the vara, not clipped",
        amritKaal:
          "4 ghatis of the nakshatra from the start ghati of the verse quoted in the commentary on Prashna Marga 21; " +
          "windows that overlap the vara, not clipped",
        choghadiya:
          "sunrise to sunset and sunset to next sunrise in 8 equal parts each; day slots from the weekday lord stepping " +
          "5 weekdays, night slots from the lord 4 weekdays on stepping 4; a later North Indian / Gujarati convention " +
          "with no classical text found",
        solver: ROOT_SOLVER_METHOD,
      },
    };
  });
}

const SYNODIC_MONTH_MS = 29.530589 * 86_400_000;

function dayPeriodsOf(weekday: number, sunrise: Date, sunset: Date): DayPeriods {
  const startMs = sunrise.getTime();
  const partMs = (sunset.getTime() - startMs) / 8;
  const period = (part: number): DayPeriod => ({
    part,
    start: new Date(Math.round(startMs + (part - 1) * partMs)),
    end: part === 8 ? sunset : new Date(Math.round(startMs + part * partMs)),
  });
  return {
    rahuKala: period(RAHU_KALA_PARTS[weekday]),
    yamaganda: period(dayPartOfPlanet(weekday, 4)),
    gulika: period(dayPartOfPlanet(weekday, 6)),
  };
}

/** `count` equal parts of [from, to]; the last ends exactly at `to`. */
function equalParts(from: Date, to: Date, count: number): { start: Date; end: Date }[] {
  const startMs = from.getTime();
  const partMs = (to.getTime() - startMs) / count;
  return Array.from({ length: count }, (_, i) => ({
    start: new Date(Math.round(startMs + i * partMs)),
    end: i === count - 1 ? to : new Date(Math.round(startMs + (i + 1) * partMs)),
  }));
}

function fifteenParts(from: Date, to: Date, isDay: boolean, paksha: Paksha): Muhurta[] {
  const half = isDay ? "day" : "night";
  return equalParts(from, to, 15).map((part, i) => ({
    number: i + 1,
    isDay,
    vedicName: VEDIC_MUHURTA_NAMES[paksha][half][i],
    deity: MUHURTA_DEITIES[half][i],
    ...part,
  }));
}

function muhurtasOf(
  weekday: number,
  paksha: Paksha,
  sunrise: Date,
  sunset: Date,
  nextSunrise: Date,
  previousSunset: Date | null
): Muhurtas {
  const day = fifteenParts(sunrise, sunset, true, paksha);
  const night = fifteenParts(sunset, nextSunrise, false, paksha);
  const previousNight = previousSunset ? fifteenParts(previousSunset, sunrise, false, paksha) : null;
  const durMuhurtas = DUR_MUHURTAS[weekday]
    .map(({ isDay, number }) => (isDay ? day : night)[number - 1])
    .sort((a, b) => a.start.getTime() - b.start.getTime());
  return {
    day,
    night,
    abhijit: day[ABHIJIT_DAY_MUHURTA - 1],
    brahma: previousNight ? previousNight[BRAHMA_NIGHT_MUHURTA - 1] : null,
    durMuhurtas,
  };
}

/** The 4-ghati window of each nakshatra span that overlaps [sunrise, nextSunrise). */
function ghatiWindows(
  spans: LimbSpan<NakshatraValue>[],
  startGhati: readonly number[],
  sunrise: Date,
  nextSunrise: Date
): GhatiWindow[] {
  return spans
    .map((span) => {
      const startMs = span.start.getTime();
      const lengthMs = span.end.getTime() - startMs;
      const ghati = startGhati[span.value.index];
      return {
        start: new Date(Math.round(startMs + (ghati / 60) * lengthMs)),
        end: new Date(Math.round(startMs + ((ghati + GHATI_WINDOW_LENGTH) / 60) * lengthMs)),
        nakshatra: span.value,
        startGhati: ghati,
      };
    })
    .filter((w) => w.end.getTime() > sunrise.getTime() && w.start.getTime() < nextSunrise.getTime());
}

function choghadiyaOf(weekday: number, sunrise: Date, sunset: Date, nextSunrise: Date) {
  const slots = (from: Date, to: Date, isDay: boolean): ChoghadiyaSlot[] =>
    equalParts(from, to, 8).map((part, i) => {
      const planet = choghadiyaPlanet(weekday, i + 1, isDay);
      return { number: i + 1, isDay, name: CHOGHADIYA_NAMES[planet], planet, ...part };
    });
  return { day: slots(sunrise, sunset, true), night: slots(sunset, nextSunrise, false) };
}

