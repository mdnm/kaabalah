import raw from "./tree-sections.json";
import { freezeTextData, pickTextLanguage } from "../localization";
import { resolveSphereName, type SphereName, type SphereWorld } from "./sphere-profiles";

export type TreeSectionKind = "world" | "pillar" | "triad";
export type TreePillarKey = "right" | "left" | "middle";
export type TreeTriadKey = "supernal" | "second" | "third";
export type TreeSectionId = `world:${SphereWorld}` | `pillar:${TreePillarKey}` | `triad:${TreeTriadKey}`;

/**
 * A part of the Tree that groups spheres: one of the four worlds, one of the three columns or
 * one of the three triangles. `correspondences` holds what the kind has: letter, element, suit,
 * hierarchy, verb, mind and level for a world; polarity, movement and name for a pillar; orientation
 * and functions for a triad.
 */
export interface TreeSection {
  id: TreeSectionId;
  kind: TreeSectionKind;
  language: "en" | "pt";
  name: string;
  title: string;
  /** The spheres of the section, top to bottom. */
  spheres: SphereName[];
  essence: string;
  keywords: string[];
  description: string;
  correspondences: Record<string, string>;
}

/** The sections a sphere belongs to. Daath has no world and no triad; Malkuth has no triad. */
export interface SphereSections {
  world: TreeSection | null;
  pillar: TreeSection;
  triad: TreeSection | null;
}

/** The bilingual Tree sections, by section ID. Text fields hold `{ en, pt }`. */
export const TREE_SECTIONS = freezeTextData(raw);

/** Section IDs: the worlds from Atziluth down, the pillars, then the triads from the top. */
export const TREE_SECTION_IDS = Object.freeze(Object.keys(raw)) as readonly TreeSectionId[];

function resolveSectionId(section: string): TreeSectionId | undefined {
  const wanted = section.trim().toLowerCase();
  return TREE_SECTION_IDS.find(candidate => {
    const id = candidate.toLowerCase();
    return id === wanted || id.slice(id.indexOf(":") + 1) === wanted;
  });
}

/**
 * A section of the Tree, by ID ("world:Briah", "pillar:left", "triad:supernal") or by the part
 * after the colon ("Briah", "left", "supernal"), in any case. `pt` and `pt-BR` select
 * Portuguese; any other language, or none, selects English. An unknown section returns undefined.
 */
export function getTreeSection(section: string, language?: string): TreeSection | undefined {
  const id = resolveSectionId(section);
  if (!id) return undefined;
  const lang = language?.startsWith("pt") ? "pt" : "en";
  return { id, language: lang, ...(pickTextLanguage(TREE_SECTIONS[id], lang) as object) } as TreeSection;
}

/** Every section, or every section of one kind, in the order of `TREE_SECTION_IDS`. */
export function listTreeSections(options: { kind?: TreeSectionKind; language?: string } = {}): TreeSection[] {
  return TREE_SECTION_IDS
    .map(id => getTreeSection(id, options.language)!)
    .filter(section => !options.kind || section.kind === options.kind);
}

/**
 * The world, pillar and triad a sphere belongs to. Takes a sphere name or a sphere node ID.
 * An unknown sphere returns undefined.
 */
export function getSphereSections(sphere: string, language?: string): SphereSections | undefined {
  const name = resolveSphereName(sphere);
  if (!name) return undefined;
  const find = (kind: TreeSectionKind) =>
    listTreeSections({ kind, language }).find(section => section.spheres.includes(name)) ?? null;
  return { world: find("world"), pillar: find("pillar")!, triad: find("triad") };
}
