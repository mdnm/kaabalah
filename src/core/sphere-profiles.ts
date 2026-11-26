import raw from "./sphere-profiles.json";
import { SPHERES } from "./constants";
import { freezeTextData, pickTextLanguage } from "../localization";

export type SphereName = (typeof SPHERES)[keyof typeof SPHERES];

/** One of the four worlds: the one the choir of the sphere belongs to. */
export type SphereWorld = "Atziluth" | "Briah" | "Yetzirah" | "Assiah";

/** The three ways the theme of a sphere shows up in a person. A reading does not say which one applies. */
export interface SphereExpression {
  balanced: string;
  excess: string;
  lack: string;
}

export interface SphereTarotCard {
  /** English card name, as in `kaabalah/tarot`. */
  card: string;
  meaning: string;
}

/**
 * What a sphere means, in one language. `essence`, `keywords`, `work` and `expression` are
 * written for people who do not practice; the rest are the traditional correspondences.
 * Daath has a shorter profile, so most of the correspondences are optional.
 */
export interface SphereProfile {
  sphere: SphereName;
  number: number;
  language: "en" | "pt";
  essence: string;
  keywords: string[];
  nameMeaning: string;
  titles: string[];
  magicalImage: string;
  /** The sphere's instrument on the magician's table. */
  instrument: string;
  /** What is worked in this sphere when one walks the Tree. */
  work: string;
  symbols?: string[];
  geometricForm?: string;
  world?: SphereWorld;
  divineName?: { name: string; meaning: string };
  archangel?: { name: string; role: string };
  choir?: { name: string; meaning: string; christianName: string };
  yetziraticText?: string;
  spiritualExperience?: string;
  attributes?: string[];
  virtues?: string[];
  vices?: string[];
  /** Correspondence in the microcosm: the part of the body. */
  body: string;
  /** Correspondence in the macrocosm: the places of the sphere. */
  places: string;
  /** The practical matters of life the sphere relates to. */
  lifeAreas?: string[];
  animals: string[];
  plants: string[];
  stones: string[];
  metals: string[];
  /** The kind of drug related to the sphere. */
  drugs: string;
  tarot?: SphereTarotCard[];
  /** The colour of the sphere in each of the four worlds. */
  colors?: { atziluth: string; briah: string; yetzirah: string; assiah: string };
  candles?: string;
  incense?: string[];
  /** How the theme of the sphere shows in balance, in excess and in lack. */
  expression: SphereExpression | null;
}

/** The bilingual sphere profiles, by sphere name. Text fields hold `{ en, pt }`. */
export const SPHERE_PROFILES = freezeTextData(raw);

/** The spheres in the Tree's own order, Daath after Binah. */
export const SPHERE_PROFILE_ORDER: readonly SphereName[] = Object.freeze(Object.values(SPHERES));

export function resolveSphereName(sphere: string): SphereName | undefined {
  const name = sphere.includes(":") ? sphere.slice(sphere.indexOf(":") + 1) : sphere;
  const wanted = name.trim().toLowerCase();
  return SPHERE_PROFILE_ORDER.find(candidate => candidate.toLowerCase() === wanted);
}

/**
 * The profile of a sphere: what it means in plain words, how its theme shows in balance, in
 * excess and in lack, what is worked in it, and its traditional correspondences.
 *
 * Takes a sphere name ("Geburah", any case) or a sphere node ID ("sphere:Geburah"). `pt` and
 * `pt-BR` select Portuguese; any other language, or none, selects English. An unknown sphere
 * returns undefined.
 */
export function getSphereProfile(sphere: string, language?: string): SphereProfile | undefined {
  const name = resolveSphereName(sphere);
  if (!name) return undefined;
  const lang = language?.startsWith("pt") ? "pt" : "en";
  return { sphere: name, language: lang, ...(pickTextLanguage(SPHERE_PROFILES[name], lang) as object) } as SphereProfile;
}

/** Every sphere profile, in the Tree's own order. */
export function listSphereProfiles(language?: string): SphereProfile[] {
  return SPHERE_PROFILE_ORDER.map(name => getSphereProfile(name, language)!);
}
