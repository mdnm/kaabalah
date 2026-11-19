/**
 * Jaimini helpers: Karakamsha, rasi drishti (sign aspects), yogakarakas and parivartana.
 * Pure arithmetic on signs and longitudes; the caller picks the frame.
 */

import type { KarakaBody, KarakaResult } from "./karakas";
import { TROPICAL_SIGNS, type SignName } from "./nakshatra";
import { getVarga, type VargaPlacement } from "./vargas";

export type SignInput = number | SignName;
const mod12 = (n: number) => ((n % 12) + 12) % 12;

function toSignIndex(sign: SignInput | { signIndex: number }): number {
  if (typeof sign === "object") return mod12(sign.signIndex);
  if (typeof sign === "number") {
    if (!Number.isInteger(sign) || sign < 0 || sign > 11) throw new Error(`Invalid sign index ${sign}`);
    return sign;
  }
  const i = TROPICAL_SIGNS.indexOf(sign);
  if (i < 0) throw new Error(`Unknown sign ${sign}`);
  return i;
}

export type SignRef = { signIndex: number; sign: SignName };
const ref = (i: number): SignRef => ({ signIndex: i, sign: TROPICAL_SIGNS[i] });

// ---------------------------------------------------------------------------
// Karakamsha
// ---------------------------------------------------------------------------

export interface Karakamsha {
  /** The Atmakaraka (rank 1 of the supplied chara karakas). */
  atmakaraka: KarakaBody;
  /** Navamsa placement of the Atmakaraka. */
  navamsa: VargaPlacement;
  signIndex: number;
  sign: SignName;
}

/**
 * Karakamsha (= Svamsa): the Navamsa sign of the Atmakaraka. `longitudes` maps body ids
 * (at least the Atmakaraka) to ecliptic longitudes in the same frame the karakas were ranked in.
 */
export function getKarakamsha(karakas: KarakaResult, longitudes: Partial<Record<string, number>>): Karakamsha {
  const ak = karakas.entries.find((e) => e.rank === 1);
  if (!ak) throw new Error("Karaka result has no Atmakaraka");
  const lon = longitudes[ak.body];
  if (lon === undefined) throw new Error(`Missing longitude for the Atmakaraka (${ak.body})`);
  const navamsa = getVarga(lon, 9);
  return { atmakaraka: ak.body, navamsa, signIndex: navamsa.signIndex, sign: navamsa.sign };
}

/** Svamsa is the same sign as the Karakamsha. */
export const getSvamsa = getKarakamsha;

/**
 * House of each body counted forward by whole signs from the Karakamsha sign, using D9
 * placements. `karakamsha` is a sign index, a sign name or a {@link Karakamsha}.
 */
export function housesFromKarakamsha(
  karakamsha: SignInput | { signIndex: number },
  longitudes: Partial<Record<string, number>>
): Record<string, number> {
  const from = toSignIndex(karakamsha);
  const out: Record<string, number> = {};
  for (const [body, lon] of Object.entries(longitudes)) {
    if (lon === undefined) continue;
    out[body] = mod12(getVarga(lon, 9).signIndex - from) + 1;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Rasi drishti
// ---------------------------------------------------------------------------

/**
 * Jaimini sign aspects. Movable (0,3,6,9) aspect the fixed signs except the one adjacent
 * (next in order); fixed (1,4,7,10) aspect the movable signs except the adjacent one
 * (previous in order); dual (2,5,8,11) aspect the other three duals.
 */
export function getRasiDrishti(sign: SignInput): SignRef[] {
  const s = toSignIndex(sign);
  const m = s % 3;
  let targets: number[];
  if (m === 0) targets = [1, 4, 7, 10].filter((t) => t !== mod12(s + 1));
  else if (m === 1) targets = [0, 3, 6, 9].filter((t) => t !== mod12(s - 1));
  else targets = [2, 5, 8, 11].filter((t) => t !== s);
  return targets.map(ref);
}

/** Bodies (keys of `placements`) whose sign aspects `sign`. Placements are sign indices, names or `{ signIndex }`. */
export function getRasiDrishtiOnSign(
  sign: SignInput,
  placements: Record<string, SignInput | { signIndex: number }>
): string[] {
  const target = toSignIndex(sign);
  return Object.keys(placements).filter((body) =>
    getRasiDrishti(toSignIndex(placements[body])).some((t) => t.signIndex === target)
  );
}

// ---------------------------------------------------------------------------
// Rulers, yogakarakas, parivartana
// ---------------------------------------------------------------------------

export type ClassicalPlanet = "sun" | "moon" | "mars" | "mercury" | "jupiter" | "venus" | "saturn";

/** Traditional rulers, Aries to Pisces. */
const TRADITIONAL_RULERS: readonly ClassicalPlanet[] = [
  "mars", "venus", "mercury", "moon", "sun", "mercury", "venus", "mars", "jupiter", "saturn", "saturn", "jupiter",
];

export interface Yogakaraka {
  planet: ClassicalPlanet;
  /** Whole-sign houses it rules from the given ascendant. */
  houses: number[];
}

/**
 * Planets ruling both a kendra (4, 7, 10) and a trikona (5, 9) by whole-sign houses and
 * traditional rulers. The 1st house is left out on purpose: a lagna lord that also rules a
 * kendra (Mercury for Gemini and Virgo, Jupiter for Sagittarius and Pisces) is not a
 * yogakaraka. This gives the classical six: Saturn for Taurus and Libra rising, Mars for
 * Cancer and Leo, Venus for Capricorn and Aquarius.
 */
export function getYogakarakas(ascendantSign: SignInput): Yogakaraka[] {
  const asc = toSignIndex(ascendantSign);
  const ruled = new Map<ClassicalPlanet, number[]>();
  for (let h = 1; h <= 12; h++) {
    const p = TRADITIONAL_RULERS[mod12(asc + h - 1)];
    ruled.set(p, [...(ruled.get(p) ?? []), h]);
  }
  const kendra = [4, 7, 10];
  const trikona = [5, 9];
  const out: Yogakaraka[] = [];
  for (const [planet, houses] of ruled) {
    const ok = houses.some((k) => kendra.includes(k)) && houses.some((t) => trikona.includes(t));
    if (ok) out.push({ planet, houses });
  }
  return out;
}

export interface Parivartana {
  a: ClassicalPlanet;
  b: ClassicalPlanet;
  /** Sign occupied by `a` (ruled by `b`) and by `b` (ruled by `a`). */
  signA: SignRef;
  signB: SignRef;
  /** Whole-sign houses of those two signs; only when an ascendant sign is given. */
  houses?: { a: number; b: number };
}

/**
 * Pairs of the seven classical planets exchanging signs by traditional rulership. `placements`
 * maps body ids to signs; nodes and other keys are ignored.
 */
export function getParivartana(
  placements: Partial<Record<string, SignInput | { signIndex: number }>>,
  ascendantSign?: SignInput
): Parivartana[] {
  const asc = ascendantSign === undefined ? undefined : toSignIndex(ascendantSign);
  const planets = [...new Set(TRADITIONAL_RULERS)].filter((p) => placements[p] !== undefined);
  const at = (p: ClassicalPlanet) => toSignIndex(placements[p] as SignInput);
  const out: Parivartana[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const a = planets[i];
      const b = planets[j];
      if (TRADITIONAL_RULERS[at(a)] === b && TRADITIONAL_RULERS[at(b)] === a) {
        out.push({
          a,
          b,
          signA: ref(at(a)),
          signB: ref(at(b)),
          ...(asc === undefined ? {} : { houses: { a: mod12(at(a) - asc) + 1, b: mod12(at(b) - asc) + 1 } }),
        });
      }
    }
  }
  return out;
}
