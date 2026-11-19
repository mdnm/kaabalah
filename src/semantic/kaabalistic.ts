import { getKaabalisticLabel } from "./labels";
import {
  DEFAULT_ASPECT_SPECS,
  PLANET_AND_NODE_NAMES,
  SIGNS,
  VirtualNodes,
  computeAspects,
  type BirthChart,
  type HydratedNode,
  type HydratedPlanet,
  type ZodiacPosition,
} from "../astrology"
import {
  KaabalahTypes,
  LetterTypes,
  NumerologyTypes,
  PLANETS,
  SPHERES,
  WESTERN_ASPECTS,
  WESTERN_HOUSES,
  WESTERN_ZODIAC_SIGNS,
  WesternAstrologyTypes,
  getCanonicalTree,
  id,
  parseId,
  type Node,
  type NodeId,
} from "../core"
import { calculateGematria } from "../gematria"
import {
  calculateKaabalisticLifePath,
  calculateStraightAcrossReductionLifePath,
} from "../numerology"

type CanonicalTree = ReturnType<typeof getCanonicalTree>

export type KaabalisticTargetId =
  | NodeId<KaabalahTypes.SPHERE>
  | NodeId<KaabalahTypes.PATH>

export type KaabalisticTargetType = "sphere" | "path"

export type KaabalisticMarkerKind = "astrology" | "numerology" | "gematria"

export type KaabalisticMarkerSourceType =
  | "planet"
  | "angle"
  | "node"
  | "number"
  | "letter"
  | "aspect"

export type KaabalisticMarkerMapping =
  | "sign-sphere"
  | "sign-path"
  | "element-sphere"
  | "element-path"
  | "carrier-sphere"
  | "planet-sign-path"
  | "number-sphere"
  | "number-path"
  | "letter-path"
  | "decan-sphere"
  | "aspect-sphere"

/**
 * Author-defined marker weights, exposed so callers can show the table.
 *
 * Astrology: every placement marker of a source carries that source's placement weight
 * (Sun, Moon and ASC 5; Mercury, Venus and Mars 4; Jupiter, Saturn and MC 2; anything
 * else `otherPoint`). A decan marker weighs `decanFactor` times its source's weight.
 * An aspect marker weighs its tightness (`min` to `max`, from how close the orb is to
 * exact) times the placement weights of the two bodies added together, divided by
 * `pairDivisor`, rounded to 2 decimals. So Sun square Moon at exact orb weighs 3 and
 * Uranus conjunction Neptune at exact orb weighs 0.6. On one sphere, all aspect markers
 * together add at most `sphereCap`.
 *
 * Numerology and gematria: the weight applies to the final reduced value; every
 * intermediate reduction step weighs `intermediateStep`. Only the Kaabalistic Life Path
 * carries weight; the Straight life path markers stay but weigh 0 at every step.
 * Gematria letters add up per path but never more than `letterPathCap`.
 *
 * Marker `weight` is the raw value. In `weightsById`, the raw sums above are turned into
 * shares: within spheres, and separately within paths, each system's values are scaled
 * so the system's total equals its entry in `systemShares` (percentage points). Systems
 * with no raw weight in that target type are left out and the remaining shares are
 * rescaled to sum to 100, so astrology plus numerology alone become 62.5 and 37.5.
 * `rawWeightsById` keeps the sums before this step.
 */
export const KAABALISTIC_MARKER_WEIGHTS = {
  astrology: {
    placement: {
      Sun: 5,
      Moon: 5,
      ASC: 5,
      Mercury: 4,
      Venus: 4,
      Mars: 4,
      Jupiter: 2,
      Saturn: 2,
      MC: 2,
    } as Readonly<Record<string, number>>,
    otherPoint: 1,
    decanFactor: 0.5,
  },
  aspect: { min: 1, max: 3, pairDivisor: 10, sphereCap: 5 },
  numerology: {
    kaabalisticLifePath: 5,
    dayEnergy: 4,
    monthEnergy: 3,
    yearEnergy: 2,
    intermediateStep: 1,
  },
  gematria: {
    letter: 1,
    letterPathCap: 3,
    synthesis: 4,
    individuality: 3,
    personality: 3,
    intermediateStep: 1,
  },
  systemShares: { astrology: 50, numerology: 30, gematria: 20 },
} as const

export interface KaabalisticMarkerDescriptor {
  kind: KaabalisticMarkerKind;
  targetId: KaabalisticTargetId;
  targetType: KaabalisticTargetType;
  sourceType: KaabalisticMarkerSourceType;
  sourceName: string;
  mapping: KaabalisticMarkerMapping;
  label: string;
  /** Contribution of this marker to the ranking (see KAABALISTIC_MARKER_WEIGHTS). */
  weight: number;
  sign?: string;
  element?: string;
  planet?: string;
}

export interface KaabalisticCountsEntry {
  astro: number;
  numerology: number;
  gematria: number;
  total: number;
}

export interface KaabalisticSummaryTarget {
  id: KaabalisticTargetId;
  type: KaabalisticTargetType;
  name: string;
  count: number;
}

export interface KaabalisticRankedTarget {
  id: KaabalisticTargetId;
  name: string;
  /** Normalized total of weightsById, in percentage points of its target type. */
  share: number;
  count: number;
}

export interface KaabalisticItemConnection {
  itemLabel: string;
  targets: readonly KaabalisticSummaryTarget[];
}

export interface KaabalisticMapData {
  spheres: readonly Node<KaabalahTypes.SPHERE>[];
  paths: readonly Node<KaabalahTypes.PATH>[];
  markers: readonly KaabalisticMarkerDescriptor[];
  sphereMarkers: Partial<Record<NodeId<KaabalahTypes.SPHERE>, readonly KaabalisticMarkerDescriptor[]>>;
  pathMarkers: Partial<Record<NodeId<KaabalahTypes.PATH>, readonly KaabalisticMarkerDescriptor[]>>;
  countsById: Partial<Record<KaabalisticTargetId, KaabalisticCountsEntry>>;
  /** Share-normalized weights in percentage points: spheres sum to 100 and paths sum to 100 (see KAABALISTIC_MARKER_WEIGHTS). */
  weightsById: Partial<Record<KaabalisticTargetId, KaabalisticCountsEntry>>;
  /** Same shape, before normalization: capped sums of marker weights. */
  rawWeightsById: Partial<Record<KaabalisticTargetId, KaabalisticCountsEntry>>;
  /** Touched spheres, heaviest first, ties in the Tree's own order. */
  rankedSpheres: readonly KaabalisticRankedTarget[];
  /** Touched paths, heaviest first, ties in path order. */
  rankedPaths: readonly KaabalisticRankedTarget[];
  itemConnections: {
    astrology: readonly KaabalisticItemConnection[];
    numerology: readonly KaabalisticItemConnection[];
    gematria: readonly KaabalisticItemConnection[];
  };
}

export interface KaabalisticSymbolMetadata {
  kind: "planet" | "sign" | "angle" | "node";
  key: string;
  label: string;
  shortLabel: string;
  glyph: string;
  id?:
    | NodeId<WesternAstrologyTypes.PLANET>
    | NodeId<WesternAstrologyTypes.WESTERN_ZODIAC_SIGN>
    | NodeId<WesternAstrologyTypes.HOUSE>;
}

export type KaabalisticSignLookup =
  | (typeof SIGNS)[number]
  | NodeId<WesternAstrologyTypes.WESTERN_ZODIAC_SIGN>
  | string

export interface KaabalisticSignCorrespondenceLookup {
  kind: "sign";
  sign: KaabalisticSignLookup;
}

export interface KaabalisticPlanetCorrespondenceLookup {
  kind: "planet";
  planet: string;
  sign: KaabalisticSignLookup;
}

export interface KaabalisticAngleCorrespondenceLookup {
  kind: "angle";
  angle: string;
  sign: KaabalisticSignLookup;
}

export interface KaabalisticNodeCorrespondenceLookup {
  kind: "node";
  node: string;
  sign: KaabalisticSignLookup;
}

export interface KaabalisticNumberCorrespondenceLookup {
  kind: "number";
  number: number;
  sourceName?: string;
}

export interface KaabalisticHebrewLetterCorrespondenceLookup {
  kind: "hebrewLetter";
  hebrewLetterId: NodeId<LetterTypes.HEBREW_LETTER>;
  sourceName?: string;
}

export type KaabalisticCorrespondenceLookup =
  | KaabalisticSignCorrespondenceLookup
  | KaabalisticPlanetCorrespondenceLookup
  | KaabalisticAngleCorrespondenceLookup
  | KaabalisticNodeCorrespondenceLookup
  | KaabalisticNumberCorrespondenceLookup
  | KaabalisticHebrewLetterCorrespondenceLookup

export interface KaabalisticCorrespondenceTarget {
  targetId: KaabalisticTargetId;
  targetType: KaabalisticTargetType;
  targetName: string;
  mapping: KaabalisticMarkerMapping;
  distance: number;
  sign?: string;
  element?: string;
  planet?: string;
}

export interface KaabalisticCorrespondenceSource {
  kind: KaabalisticCorrespondenceLookup["kind"];
  key: string;
  label: string;
  shortLabel: string;
  glyph: string;
  sign?: string;
  element?: string;
  planet?: string;
  number?: number;
  hebrewLetterId?: NodeId<LetterTypes.HEBREW_LETTER>;
}

export interface KaabalisticCorrespondenceResult {
  source: KaabalisticCorrespondenceSource;
  targets: readonly KaabalisticCorrespondenceTarget[];
}

export interface AstrologyTreeChartInput {
  planets: readonly HydratedPlanet[] | Record<string, HydratedPlanet>;
  houses: BirthChart["houses"];
  nodes?: readonly HydratedNode[] | Record<string, HydratedNode>;
  aspects?: BirthChart["aspects"];
}

export interface NumerologyTreeInput {
  birthDate: Date;
  kaabalisticLifePath?: ReturnType<typeof calculateKaabalisticLifePath>;
  straightAcrossReductionLifePath?: ReturnType<typeof calculateStraightAcrossReductionLifePath>;
}

export interface GematriaTreeInput {
  phrase?: string;
  result?: ReturnType<typeof calculateGematria>;
}

export interface BuildKaabalisticMapDataInput {
  astrology?: BirthChart | AstrologyTreeChartInput | null;
  numerology?: Date | NumerologyTreeInput | null;
  gematria?: string | GematriaTreeInput | null;
}

type SummaryBucket = "astro" | "numerology" | "gematria"

type AstrologyTreeMarkerSource = {
  sourceType: Extract<KaabalisticMarkerSourceType, "planet" | "angle" | "node">;
  sourceName: string;
}

type SymbolSeed = KaabalisticSymbolMetadata & {
  aliases?: readonly string[];
}

let canonicalTreeInstance: CanonicalTree | undefined

function canonicalTree() {
  canonicalTreeInstance ??= getCanonicalTree({
    system: "kaabalah",
    parts: ["westernAstrology"],
  })

  return canonicalTreeInstance
}

const orderedSphereIds = [
  SPHERES.KETHER,
  SPHERES.CHOKHMAH,
  SPHERES.BINAH,
  SPHERES.DAATH,
  SPHERES.CHESED,
  SPHERES.GEBURAH,
  SPHERES.TIPHARETH,
  SPHERES.NETZACH,
  SPHERES.HOD,
  SPHERES.YESOD,
  SPHERES.MALKUTH,
].map((sphere) => id(KaabalahTypes.SPHERE, sphere))

const orderedPathIds = Array.from({ length: 22 }, (_, index) =>
  id(KaabalahTypes.PATH, index + 1)
)

let orderedSpheresInstance: readonly Node<KaabalahTypes.SPHERE>[] | undefined
let orderedPathsInstance: readonly Node<KaabalahTypes.PATH>[] | undefined

function orderedSpheres() {
  orderedSpheresInstance ??= Object.freeze(
    orderedSphereIds
      .map((sphereId) => canonicalTree().getNode(sphereId))
      .filter((node): node is Node<KaabalahTypes.SPHERE> => Boolean(node))
  )

  return orderedSpheresInstance
}

function orderedPaths() {
  orderedPathsInstance ??= Object.freeze(
    orderedPathIds
      .map((pathId) => canonicalTree().getNode(pathId))
      .filter((node): node is Node<KaabalahTypes.PATH> => Boolean(node))
  )

  return orderedPathsInstance
}

const SIGN_SYMBOLS = [
  { kind: "sign", key: "aries", label: "Aries", shortLabel: "Aries", glyph: "♈", id: id(WesternAstrologyTypes.WESTERN_ZODIAC_SIGN, WESTERN_ZODIAC_SIGNS.ARIES) },
  { kind: "sign", key: "taurus", label: "Taurus", shortLabel: "Taurus", glyph: "♉", id: id(WesternAstrologyTypes.WESTERN_ZODIAC_SIGN, WESTERN_ZODIAC_SIGNS.TAURUS) },
  { kind: "sign", key: "gemini", label: "Gemini", shortLabel: "Gemini", glyph: "♊", id: id(WesternAstrologyTypes.WESTERN_ZODIAC_SIGN, WESTERN_ZODIAC_SIGNS.GEMINI) },
  { kind: "sign", key: "cancer", label: "Cancer", shortLabel: "Cancer", glyph: "♋", id: id(WesternAstrologyTypes.WESTERN_ZODIAC_SIGN, WESTERN_ZODIAC_SIGNS.CANCER) },
  { kind: "sign", key: "leo", label: "Leo", shortLabel: "Leo", glyph: "♌", id: id(WesternAstrologyTypes.WESTERN_ZODIAC_SIGN, WESTERN_ZODIAC_SIGNS.LEO) },
  { kind: "sign", key: "virgo", label: "Virgo", shortLabel: "Virgo", glyph: "♍", id: id(WesternAstrologyTypes.WESTERN_ZODIAC_SIGN, WESTERN_ZODIAC_SIGNS.VIRGO) },
  { kind: "sign", key: "libra", label: "Libra", shortLabel: "Libra", glyph: "♎", id: id(WesternAstrologyTypes.WESTERN_ZODIAC_SIGN, WESTERN_ZODIAC_SIGNS.LIBRA) },
  { kind: "sign", key: "scorpio", label: "Scorpio", shortLabel: "Scorpio", glyph: "♏", id: id(WesternAstrologyTypes.WESTERN_ZODIAC_SIGN, WESTERN_ZODIAC_SIGNS.SCORPIO) },
  { kind: "sign", key: "sagittarius", label: "Sagittarius", shortLabel: "Sagittarius", glyph: "♐", id: id(WesternAstrologyTypes.WESTERN_ZODIAC_SIGN, WESTERN_ZODIAC_SIGNS.SAGITTARIUS) },
  { kind: "sign", key: "capricorn", label: "Capricorn", shortLabel: "Capricorn", glyph: "♑", id: id(WesternAstrologyTypes.WESTERN_ZODIAC_SIGN, WESTERN_ZODIAC_SIGNS.CAPRICORN) },
  { kind: "sign", key: "aquarius", label: "Aquarius", shortLabel: "Aquarius", glyph: "♒", id: id(WesternAstrologyTypes.WESTERN_ZODIAC_SIGN, WESTERN_ZODIAC_SIGNS.AQUARIUS) },
  { kind: "sign", key: "pisces", label: "Pisces", shortLabel: "Pisces", glyph: "♓", id: id(WesternAstrologyTypes.WESTERN_ZODIAC_SIGN, WESTERN_ZODIAC_SIGNS.PISCES) },
] as const satisfies readonly SymbolSeed[]

const PLANET_SYMBOLS = [
  { kind: "planet", key: "sun", label: PLANETS.SUN, shortLabel: PLANETS.SUN, glyph: "☉", id: id(WesternAstrologyTypes.PLANET, PLANETS.SUN) },
  { kind: "planet", key: "moon", label: PLANETS.MOON, shortLabel: PLANETS.MOON, glyph: "☽", id: id(WesternAstrologyTypes.PLANET, PLANETS.MOON) },
  { kind: "planet", key: "mercury", label: PLANETS.MERCURY, shortLabel: PLANETS.MERCURY, glyph: "☿", id: id(WesternAstrologyTypes.PLANET, PLANETS.MERCURY) },
  { kind: "planet", key: "venus", label: PLANETS.VENUS, shortLabel: PLANETS.VENUS, glyph: "♀", id: id(WesternAstrologyTypes.PLANET, PLANETS.VENUS) },
  { kind: "planet", key: "mars", label: PLANETS.MARS, shortLabel: PLANETS.MARS, glyph: "♂", id: id(WesternAstrologyTypes.PLANET, PLANETS.MARS) },
  { kind: "planet", key: "jupiter", label: PLANETS.JUPITER, shortLabel: PLANETS.JUPITER, glyph: "♃", id: id(WesternAstrologyTypes.PLANET, PLANETS.JUPITER) },
  { kind: "planet", key: "saturn", label: PLANETS.SATURN, shortLabel: PLANETS.SATURN, glyph: "♄", id: id(WesternAstrologyTypes.PLANET, PLANETS.SATURN) },
  { kind: "planet", key: "uranus", label: PLANETS.URANUS, shortLabel: PLANETS.URANUS, glyph: "♅", id: id(WesternAstrologyTypes.PLANET, PLANETS.URANUS) },
  { kind: "planet", key: "neptune", label: PLANETS.NEPTUNE, shortLabel: PLANETS.NEPTUNE, glyph: "♆", id: id(WesternAstrologyTypes.PLANET, PLANETS.NEPTUNE) },
  { kind: "planet", key: "pluto", label: PLANETS.PLUTO, shortLabel: PLANETS.PLUTO, glyph: "♇", id: id(WesternAstrologyTypes.PLANET, PLANETS.PLUTO) },
  { kind: "planet", key: "earth", label: PLANETS.EARTH, shortLabel: PLANETS.EARTH, glyph: "⊕", id: id(WesternAstrologyTypes.PLANET, PLANETS.EARTH) },
  { kind: "planet", key: "chiron", label: "Chiron", shortLabel: "Chiron", glyph: "⚷", aliases: [PLANET_AND_NODE_NAMES[15]] },
] as const satisfies readonly SymbolSeed[]

const ANGLE_SYMBOLS = [
  { kind: "angle", key: "asc", label: "ASC", shortLabel: "ASC", glyph: "ASC", id: id(WesternAstrologyTypes.HOUSE, WESTERN_HOUSES.ASCENDANT), aliases: ["ascendant"] },
  { kind: "angle", key: "mc", label: "MC", shortLabel: "MC", glyph: "MC", id: id(WesternAstrologyTypes.HOUSE, WESTERN_HOUSES.MEDIUM_COELI), aliases: ["medium coeli"] },
  { kind: "angle", key: "dc", label: "DC", shortLabel: "DC", glyph: "DC", id: id(WesternAstrologyTypes.HOUSE, WESTERN_HOUSES.DESCENDANT), aliases: ["descendant"] },
  { kind: "angle", key: "ic", label: "IC", shortLabel: "IC", glyph: "IC", id: id(WesternAstrologyTypes.HOUSE, WESTERN_HOUSES.IMUM_COELI), aliases: ["imum coeli"] },
  { kind: "angle", key: "vertex", label: "Vertex", shortLabel: "Vertex", glyph: "Vtx" },
] as const satisfies readonly SymbolSeed[]

const NODE_SYMBOLS = [
  { kind: "node", key: "wheel of fortune", label: "Wheel of Fortune", shortLabel: "Wheel of Fortune", glyph: "𛲜", aliases: [PLANET_AND_NODE_NAMES[VirtualNodes.PARS_FORTUNAE], "pars fortunae", "parsfortunae"] },
  { kind: "node", key: "mean node", label: "Mean Node", shortLabel: "Mean Node", glyph: "☊", aliases: [PLANET_AND_NODE_NAMES[10]] },
  { kind: "node", key: "true node", label: "True Node", shortLabel: "True Node", glyph: "☊", aliases: [PLANET_AND_NODE_NAMES[11]] },
  { kind: "node", key: "lilith mean", label: "Lilith Mean", shortLabel: "Lilith Mean", glyph: "⚸", aliases: [PLANET_AND_NODE_NAMES[12]] },
  { kind: "node", key: "lilith true", label: "Lilith True", shortLabel: "Lilith True", glyph: "⚸", aliases: [PLANET_AND_NODE_NAMES[13]] },
] as const satisfies readonly SymbolSeed[]

const symbolRegistry = createSymbolRegistry([
  ...SIGN_SYMBOLS,
  ...PLANET_SYMBOLS,
  ...ANGLE_SYMBOLS,
  ...NODE_SYMBOLS,
])

const classicalPlanetKeys = new Set([
  normalizeLookupKey(PLANETS.SUN),
  normalizeLookupKey(PLANETS.MOON),
  normalizeLookupKey(PLANETS.MERCURY),
  normalizeLookupKey(PLANETS.VENUS),
  normalizeLookupKey(PLANETS.MARS),
  normalizeLookupKey(PLANETS.JUPITER),
  normalizeLookupKey(PLANETS.SATURN),
])

const defaultExcludedAstrologyPoints = new Set([
  normalizeLookupKey("True Node"),
  normalizeLookupKey("Lilith True"),
])

const angleCarrierSphereIdsByKey = createAngleCarrierSphereIdsByKey()

let planetCarrierSphereIdsByKeyInstance:
  | ReturnType<typeof createPlanetCarrierSphereIdsByKey>
  | undefined
let classicalPlanetPathIdsByKeyInstance:
  | ReturnType<typeof createClassicalPlanetPathIdsByKey>
  | undefined

function planetCarrierSphereIdsByKey() {
  planetCarrierSphereIdsByKeyInstance ??= createPlanetCarrierSphereIdsByKey(canonicalTree())

  return planetCarrierSphereIdsByKeyInstance
}

function classicalPlanetPathIdsByKey() {
  classicalPlanetPathIdsByKeyInstance ??= createClassicalPlanetPathIdsByKey(canonicalTree())

  return classicalPlanetPathIdsByKeyInstance
}

function normalizeLookupKey(value: string) {
  return value.trim().toLowerCase()
}

function createSymbolRegistry(entries: readonly SymbolSeed[]) {
  const byKey = new Map<string, KaabalisticSymbolMetadata>()

  for (const entry of entries) {
    const frozen = Object.freeze({
      kind: entry.kind,
      key: entry.key,
      label: entry.label,
      shortLabel: entry.shortLabel,
      glyph: entry.glyph,
      ...(entry.id ? { id: entry.id } : {}),
    }) satisfies KaabalisticSymbolMetadata

    byKey.set(normalizeLookupKey(entry.key), frozen)
    byKey.set(normalizeLookupKey(entry.label), frozen)
    byKey.set(normalizeLookupKey(entry.shortLabel), frozen)

    for (const alias of entry.aliases ?? []) {
      byKey.set(normalizeLookupKey(alias), frozen)
    }

    if (entry.id) {
      byKey.set(normalizeLookupKey(entry.id), frozen)
      byKey.set(normalizeLookupKey(parseId(entry.id)), frozen)
    }
  }

  return Object.freeze({
    byKey,
    planets: Object.freeze(entries.filter((entry) => entry.kind === "planet").map((entry) => byKey.get(normalizeLookupKey(entry.key))!)),
    signs: Object.freeze(entries.filter((entry) => entry.kind === "sign").map((entry) => byKey.get(normalizeLookupKey(entry.key))!)),
    angles: Object.freeze(entries.filter((entry) => entry.kind === "angle").map((entry) => byKey.get(normalizeLookupKey(entry.key))!)),
    nodes: Object.freeze(entries.filter((entry) => entry.kind === "node").map((entry) => byKey.get(normalizeLookupKey(entry.key))!)),
  })
}

function createClassicalPlanetPathIdsByKey(tree: CanonicalTree) {
  const registry = new Map<string, readonly NodeId<KaabalahTypes.PATH>[]>()
  const mutable = new Map<string, NodeId<KaabalahTypes.PATH>[]>()

  for (const pathId of orderedPathIds) {
    const planet = tree.getCorrespondences(pathId, {
      type: WesternAstrologyTypes.PLANET,
      depth: 1,
      limit: 1,
    })[0]?.node

    if (!planet) {
      continue
    }

    const key = normalizeLookupKey(planet.name ?? parseId(planet.id))
    if (!classicalPlanetKeys.has(key)) {
      continue
    }

    const bucket = mutable.get(key) ?? []
    bucket.push(pathId)
    mutable.set(key, bucket)
  }

  for (const [key, value] of mutable.entries()) {
    registry.set(key, Object.freeze([...value]))
  }

  return registry
}

function createPlanetCarrierSphereIdsByKey(tree: CanonicalTree) {
  const registry = new Map<string, readonly NodeId<KaabalahTypes.SPHERE>[]>()

  for (const symbol of PLANET_SYMBOLS) {
    if (!("id" in symbol) || !symbol.id) {
      continue
    }

    const sphereIds = tree.getCorrespondences(symbol.id, {
      type: KaabalahTypes.SPHERE,
      depth: 1,
    }).map((match) => match.node.id as NodeId<KaabalahTypes.SPHERE>)

    if (!sphereIds.length) {
      continue
    }

    registry.set(
      normalizeLookupKey(symbol.label),
      Object.freeze([...new Set(sphereIds)])
    )
  }

  return registry
}

function createAngleCarrierSphereIdsByKey() {
  return new Map<string, readonly NodeId<KaabalahTypes.SPHERE>[]>([
    [
      normalizeLookupKey("ASC"),
      Object.freeze([id(KaabalahTypes.SPHERE, SPHERES.MALKUTH)]),
    ],
  ])
}

function getTargetType(targetId: KaabalisticTargetId): KaabalisticTargetType {
  return String(targetId).startsWith(`${KaabalahTypes.SPHERE}:`) ? "sphere" : "path"
}

function getTargetName(targetId: KaabalisticTargetId) {
  return getTargetType(targetId) === "sphere"
    ? parseId(targetId as NodeId<KaabalahTypes.SPHERE>)
    : `Path ${parseId(targetId as NodeId<KaabalahTypes.PATH>)}`
}

function getTargetCountMap(
  targets: readonly KaabalisticCorrespondenceTarget[]
) {
  const reduceMap: Partial<Record<KaabalisticTargetId, number>> = {}

  for (const target of targets) {
    reduceMap[target.targetId] = (reduceMap[target.targetId] ?? 0) + 1
  }

  return reduceMap
}

function toSummaryTargets(
  reduceMap: Partial<Record<KaabalisticTargetId, number>>
): KaabalisticSummaryTarget[] {
  return Object.entries(reduceMap).map(([targetId, count]) => ({
    id: targetId as KaabalisticTargetId,
    type: getTargetType(targetId as KaabalisticTargetId),
    name: getTargetName(targetId as KaabalisticTargetId),
    count: count ?? 0,
  }))
}

function groupByKey<T, K extends string>(items: readonly T[], getKey: (item: T) => K) {
  const grouped = {} as Record<K, T[]>

  for (const item of items) {
    const key = getKey(item)
    const bucket = grouped[key] ?? []
    bucket.push(item)
    grouped[key] = bucket
  }

  return grouped
}

function normalizeSignName(sign: KaabalisticSignLookup) {
  const rawSign =
    typeof sign === "string" && sign.startsWith(`${WesternAstrologyTypes.WESTERN_ZODIAC_SIGN}:`)
      ? parseId(sign as NodeId<WesternAstrologyTypes.WESTERN_ZODIAC_SIGN>)
      : typeof sign === "string"
        ? sign
        : parseId(sign)
  const key = normalizeLookupKey(rawSign)
  const metadata = symbolRegistry.byKey.get(key)

  if (!metadata || metadata.kind !== "sign") {
    return undefined
  }

  return metadata.label as (typeof SIGNS)[number]
}

function normalizePlanetName(planet: string) {
  const rawPlanet = planet.startsWith(`${WesternAstrologyTypes.PLANET}:`)
    ? parseId(planet as NodeId<WesternAstrologyTypes.PLANET>)
    : planet
  const key = normalizeLookupKey(rawPlanet)
  const metadata = symbolRegistry.byKey.get(key)

  if (metadata?.kind === "planet") {
    return metadata.label
  }

  return PLANET_AND_NODE_NAMES[rawPlanet as unknown as keyof typeof PLANET_AND_NODE_NAMES] ?? rawPlanet
}

function lookupPlanetSymbolMetadata(planet: string) {
  const rawPlanet = planet.startsWith(`${WesternAstrologyTypes.PLANET}:`)
    ? parseId(planet as NodeId<WesternAstrologyTypes.PLANET>)
    : planet
  const metadata = symbolRegistry.byKey.get(normalizeLookupKey(rawPlanet))
  return metadata?.kind === "planet" ? metadata : undefined
}

function lookupSignSymbolMetadata(sign: KaabalisticSignLookup) {
  const rawSign =
    typeof sign === "string" && sign.startsWith(`${WesternAstrologyTypes.WESTERN_ZODIAC_SIGN}:`)
      ? parseId(sign as NodeId<WesternAstrologyTypes.WESTERN_ZODIAC_SIGN>)
      : typeof sign === "string"
        ? sign
        : parseId(sign)
  const metadata = symbolRegistry.byKey.get(normalizeLookupKey(rawSign))
  return metadata?.kind === "sign" ? metadata : undefined
}

function normalizeAngleName(angle: string) {
  const rawAngle = angle.startsWith(`${WesternAstrologyTypes.HOUSE}:`)
    ? parseId(angle as NodeId<WesternAstrologyTypes.HOUSE>)
    : angle
  const metadata = symbolRegistry.byKey.get(normalizeLookupKey(rawAngle))

  return metadata?.kind === "angle" ? metadata.label : rawAngle
}

export function listPlanetSymbolMetadata(language?: string) {
  return language?.startsWith("pt") ? symbolRegistry.planets.map(row => localizeSymbol(row, language)!) : symbolRegistry.planets
}

export function listZodiacSignSymbolMetadata(language?: string) {
  return language?.startsWith("pt") ? symbolRegistry.signs.map(row => localizeSymbol(row, language)!) : symbolRegistry.signs
}

export function listAngleSymbolMetadata(language?: string) {
  return language?.startsWith("pt") ? symbolRegistry.angles.map(row => localizeSymbol(row, language)!) : symbolRegistry.angles
}

export function listNodeSymbolMetadata(language?: string) {
  return language?.startsWith("pt") ? symbolRegistry.nodes.map(row => localizeSymbol(row, language)!) : symbolRegistry.nodes
}

export function getPlanetSymbolMetadata(lookup: string, language?: string) {
  return localizeSymbol(lookupPlanetSymbolMetadata(lookup), language)
}

export function getZodiacSignSymbolMetadata(lookup: KaabalisticSignLookup, language?: string) {
  return localizeSymbol(lookupSignSymbolMetadata(lookup), language)
}

export function getAngleSymbolMetadata(lookup: string, language?: string) {
  const rawLookup = lookup.startsWith(`${WesternAstrologyTypes.HOUSE}:`)
    ? parseId(lookup as NodeId<WesternAstrologyTypes.HOUSE>)
    : lookup
  const metadata = symbolRegistry.byKey.get(normalizeLookupKey(rawLookup))
  return localizeSymbol(metadata?.kind === "angle" ? metadata : undefined, language)
}

export function getNodeSymbolMetadata(lookup: string, language?: string) {
  const metadata = symbolRegistry.byKey.get(normalizeLookupKey(lookup))
  return localizeSymbol(metadata?.kind === "node" ? metadata : undefined, language)
}

function normalizeChartInput(input: BirthChart | AstrologyTreeChartInput) {
  const planets = Array.isArray(input.planets)
    ? [...input.planets]
    : Object.values(input.planets)
  const nodes = input.nodes
    ? (Array.isArray(input.nodes) ? [...input.nodes] : Object.values(input.nodes))
    : []

  return {
    planets,
    nodes,
    houses: input.houses,
    aspects: input.aspects,
  }
}

function getAstrologySourceType(name: string): Extract<KaabalisticMarkerSourceType, "planet" | "node"> {
  return getNodeSymbolMetadata(name) ? "node" : "planet"
}

function getAstrologySourceGlyph(sourceType: Extract<KaabalisticMarkerSourceType, "planet" | "angle" | "node">, sourceName: string) {
  if (sourceType === "angle") {
    return getAngleSymbolMetadata(sourceName)?.glyph ?? sourceName
  }

  if (sourceType === "node") {
    return getNodeSymbolMetadata(sourceName)?.glyph ?? sourceName.slice(0, 1).toUpperCase()
  }

  return lookupPlanetSymbolMetadata(sourceName)?.glyph ?? sourceName.slice(0, 1).toUpperCase()
}

function getHouseNodeByNumber(houseNumber: number) {
  return canonicalTree().getCorrespondences(id(NumerologyTypes.NUMBER, houseNumber), {
    type: WesternAstrologyTypes.HOUSE,
    depth: 1,
    limit: 1,
  })[0]?.node
}

function buildSignTargets(sign: (typeof SIGNS)[number]) {
  const signId = id(WesternAstrologyTypes.WESTERN_ZODIAC_SIGN, sign)
  const result: KaabalisticCorrespondenceTarget[] = []

  for (const match of canonicalTree().getCorrespondences(signId, {
    type: [KaabalahTypes.SPHERE, KaabalahTypes.PATH, WesternAstrologyTypes.WESTERN_ELEMENT],
    depth: 1,
  })) {
    if (match.node.type === KaabalahTypes.SPHERE) {
      result.push({
        targetId: match.node.id as NodeId<KaabalahTypes.SPHERE>,
        targetType: "sphere",
        targetName: getTargetName(match.node.id as NodeId<KaabalahTypes.SPHERE>),
        mapping: "sign-sphere",
        distance: match.distance,
        sign,
      })
      continue
    }

    if (match.node.type === KaabalahTypes.PATH) {
      result.push({
        targetId: match.node.id as NodeId<KaabalahTypes.PATH>,
        targetType: "path",
        targetName: getTargetName(match.node.id as NodeId<KaabalahTypes.PATH>),
        mapping: "sign-path",
        distance: match.distance,
        sign,
      })
      continue
    }

    const element = parseId(match.node.id)

    for (const elementPath of canonicalTree().getCorrespondences(match.node.id, {
      type: KaabalahTypes.PATH,
      depth: 1,
    })) {
      result.push({
        targetId: elementPath.node.id as NodeId<KaabalahTypes.PATH>,
        targetType: "path",
        targetName: getTargetName(elementPath.node.id as NodeId<KaabalahTypes.PATH>),
        mapping: "element-path",
        distance: elementPath.distance + match.distance,
        sign,
        element,
      })
    }

    for (const elementSphere of canonicalTree().getCorrespondences(match.node.id, {
      type: KaabalahTypes.SPHERE,
      depth: 1,
    })) {
      result.push({
        targetId: elementSphere.node.id as NodeId<KaabalahTypes.SPHERE>,
        targetType: "sphere",
        targetName: getTargetName(elementSphere.node.id as NodeId<KaabalahTypes.SPHERE>),
        mapping: "element-sphere",
        distance: elementSphere.distance + match.distance,
        sign,
        element,
      })
    }
  }

  return dedupeTargets(result)
}

function buildCarrierSphereTargets(
  lookup: KaabalisticPlanetCorrespondenceLookup | KaabalisticAngleCorrespondenceLookup,
  sign: (typeof SIGNS)[number]
) {
  const isPlanetLookup = lookup.kind === "planet"
  const sourceLabel = isPlanetLookup
    ? normalizePlanetName(lookup.planet)
    : normalizeAngleName(lookup.angle)
  const sourceKey = normalizeLookupKey(sourceLabel)
  const sphereIds = isPlanetLookup
    ? planetCarrierSphereIdsByKey().get(sourceKey)
    : angleCarrierSphereIdsByKey.get(sourceKey)

  if (!sphereIds?.length) {
    return []
  }

  return sphereIds.map<KaabalisticCorrespondenceTarget>((targetId) => ({
    targetId,
    targetType: "sphere",
    targetName: getTargetName(targetId),
    mapping: "carrier-sphere",
    distance: 1,
    sign,
    ...(isPlanetLookup ? { planet: sourceLabel } : {}),
  }))
}

function dedupeTargets(targets: readonly KaabalisticCorrespondenceTarget[]) {
  const seen = new Set<string>()

  return targets.filter((target) => {
    const key = [
      target.targetId,
      target.mapping,
      target.sign ?? "",
      target.element ?? "",
      target.planet ?? "",
    ].join("|")

    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

function createCorrespondenceSource(
  lookup: KaabalisticCorrespondenceLookup,
  sign?: (typeof SIGNS)[number],
  element?: string
): KaabalisticCorrespondenceSource {
  if (lookup.kind === "sign") {
    const symbol = lookupSignSymbolMetadata(sign ?? lookup.sign)!
    return {
      kind: "sign",
      key: symbol.key,
      label: symbol.label,
      shortLabel: symbol.shortLabel,
      glyph: symbol.glyph,
      ...(sign ? { sign } : {}),
      ...(element ? { element } : {}),
    }
  }

  if (lookup.kind === "planet") {
    const symbol = lookupPlanetSymbolMetadata(lookup.planet)
    const label = normalizePlanetName(lookup.planet)
    return {
      kind: "planet",
      key: normalizeLookupKey(label),
      label,
      shortLabel: symbol?.shortLabel ?? label,
      glyph: symbol?.glyph ?? label.slice(0, 1).toUpperCase(),
      ...(sign ? { sign } : {}),
      ...(element ? { element } : {}),
      planet: label,
    }
  }

  if (lookup.kind === "angle") {
    const symbol = getAngleSymbolMetadata(lookup.angle)
    const label = symbol?.label ?? lookup.angle
    return {
      kind: "angle",
      key: normalizeLookupKey(label),
      label,
      shortLabel: symbol?.shortLabel ?? label,
      glyph: symbol?.glyph ?? label,
      ...(sign ? { sign } : {}),
      ...(element ? { element } : {}),
    }
  }

  if (lookup.kind === "node") {
    const symbol = getNodeSymbolMetadata(lookup.node)
    const label = symbol?.label ?? lookup.node
    return {
      kind: "node",
      key: normalizeLookupKey(label),
      label,
      shortLabel: symbol?.shortLabel ?? label,
      glyph: symbol?.glyph ?? label.slice(0, 1).toUpperCase(),
      ...(sign ? { sign } : {}),
      ...(element ? { element } : {}),
    }
  }

  if (lookup.kind === "number") {
    const label = String(lookup.number)
    return {
      kind: "number",
      key: label,
      label,
      shortLabel: label,
      glyph: label,
      number: lookup.number,
    }
  }

  const letterNode = canonicalTree().getNode(lookup.hebrewLetterId)
  const letterLabel = letterNode?.name ?? parseId(lookup.hebrewLetterId)
  const glyph = letterNode?.data?.character ?? letterLabel

  return {
    kind: "hebrewLetter",
    key: normalizeLookupKey(lookup.hebrewLetterId),
    label: letterLabel,
    shortLabel: letterLabel,
    glyph,
    hebrewLetterId: lookup.hebrewLetterId,
  }
}

function englishGetKaabalisticCorrespondenceTargets(
  lookup: KaabalisticCorrespondenceLookup
): KaabalisticCorrespondenceResult | undefined {
  if (lookup.kind === "number") {
    const source = createCorrespondenceSource(lookup)
    const numberId = id(NumerologyTypes.NUMBER, lookup.number)
    const targets = [
      ...canonicalTree().getCorrespondences(numberId, { type: KaabalahTypes.SPHERE, depth: 1 }).map((match) => ({
        targetId: match.node.id as NodeId<KaabalahTypes.SPHERE>,
        targetType: "sphere" as const,
        targetName: getTargetName(match.node.id as NodeId<KaabalahTypes.SPHERE>),
        mapping: "number-sphere" as const,
        distance: match.distance,
      })),
      ...canonicalTree().getCorrespondences(numberId, { type: KaabalahTypes.PATH, depth: 1 }).map((match) => ({
        targetId: match.node.id as NodeId<KaabalahTypes.PATH>,
        targetType: "path" as const,
        targetName: getTargetName(match.node.id as NodeId<KaabalahTypes.PATH>),
        mapping: "number-path" as const,
        distance: match.distance,
      })),
    ]

    return {
      source,
      targets,
    }
  }

  if (lookup.kind === "hebrewLetter") {
    const source = createCorrespondenceSource(lookup)
    const targets = canonicalTree().getCorrespondences(lookup.hebrewLetterId, {
      type: KaabalahTypes.PATH,
      depth: 1,
    }).map((match) => ({
      targetId: match.node.id as NodeId<KaabalahTypes.PATH>,
      targetType: "path" as const,
      targetName: getTargetName(match.node.id as NodeId<KaabalahTypes.PATH>),
      mapping: "letter-path" as const,
      distance: match.distance,
    }))

    return {
      source,
      targets,
    }
  }

  const sign = normalizeSignName(lookup.sign)
  if (!sign) {
    return undefined
  }

  const signTargets = buildSignTargets(sign)
  const element = signTargets.find((target) => target.element)?.element

  if (lookup.kind === "sign") {
    return {
      source: createCorrespondenceSource(lookup, sign, element),
      targets: signTargets,
    }
  }

  if (lookup.kind === "planet") {
    const planet = normalizePlanetName(lookup.planet)
    const planetKey = normalizeLookupKey(planet)
    const planetPathTargets = (classicalPlanetPathIdsByKey().get(planetKey) ?? []).map((pathId) => ({
      targetId: pathId,
      targetType: "path" as const,
      targetName: getTargetName(pathId),
      mapping: "planet-sign-path" as const,
      distance: 1,
      sign,
      planet,
    }))
    const carrierSphereTargets = buildCarrierSphereTargets(lookup, sign)

    return {
      source: createCorrespondenceSource(lookup, sign, element),
      targets: dedupeTargets([...signTargets, ...planetPathTargets, ...carrierSphereTargets]),
    }
  }

  if (lookup.kind === "angle") {
    const carrierSphereTargets = buildCarrierSphereTargets(lookup, sign)

    return {
      source: createCorrespondenceSource(lookup, sign, element),
      targets: dedupeTargets([...signTargets, ...carrierSphereTargets]),
    }
  }

  return {
    source: createCorrespondenceSource(lookup, sign, element),
    targets: signTargets,
  }
}

function toAstrologyMarkers(
  result: KaabalisticCorrespondenceResult,
  source: AstrologyTreeMarkerSource
) {
  const weight = getPlacementWeight(source.sourceName)
  const sourceGlyph = getAstrologySourceGlyph(source.sourceType, source.sourceName)
  const signGlyph = result.source.sign
    ? lookupSignSymbolMetadata(result.source.sign)?.glyph ?? sourceGlyph
    : sourceGlyph

  return result.targets.map<KaabalisticMarkerDescriptor>((target) => ({
    kind: "astrology",
    targetId: target.targetId,
    targetType: target.targetType,
    sourceType: source.sourceType,
    sourceName: source.sourceName,
    mapping: target.mapping,
    weight,
    label:
      target.mapping === "planet-sign-path" || target.mapping === "carrier-sphere"
        ? signGlyph
        : sourceGlyph,
    ...(target.sign ? { sign: target.sign } : {}),
    ...(target.element ? { element: target.element } : {}),
    ...(target.planet ? { planet: target.planet } : {}),
  }))
}

const CARDINAL_SIGNS: readonly string[] = ["Aries", "Cancer", "Libra", "Capricorn"]
const FIXED_SIGNS: readonly string[] = ["Taurus", "Leo", "Scorpio", "Aquarius"]

/** Sphere of each decan (0-10, 10-20, 20-30 degrees) per modality. Fixed repeats Chesed on purpose. */
const DECAN_SPHERES: Record<"cardinal" | "fixed" | "mutable", readonly [string, string, string]> = {
  cardinal: [SPHERES.CHOKHMAH, SPHERES.BINAH, SPHERES.CHESED],
  fixed: [SPHERES.GEBURAH, SPHERES.TIPHARETH, SPHERES.CHESED],
  mutable: [SPHERES.HOD, SPHERES.YESOD, SPHERES.MALKUTH],
}

/** Sphere lit by each aspect. Tiphareth has no aspect. */
const ASPECT_SPHERES: Record<string, string> = {
  conjunction: SPHERES.KETHER,
  duodecile: SPHERES.CHOKHMAH,
  octile: SPHERES.BINAH,
  sextile: SPHERES.CHESED,
  square: SPHERES.GEBURAH,
  trine: SPHERES.NETZACH,
  trioctile: SPHERES.HOD,
  quincunx: SPHERES.YESOD,
  opposition: SPHERES.MALKUTH,
}

const ASPECT_LABELS: Record<string, string> = {
  conjunction: "☌",
  duodecile: "30°",
  octile: "45°",
  sextile: "⚹",
  square: "□",
  trine: "△",
  trioctile: "135°",
  quincunx: "⚻",
  opposition: "☍",
}

function round2(value: number) {
  return Math.round(value * 100) / 100
}

function getPlacementWeight(sourceName: string) {
  const { placement, otherPoint } = KAABALISTIC_MARKER_WEIGHTS.astrology
  return placement[sourceName] ?? otherPoint
}

function getDecanSphereId(sign: string, degreeInSign: number) {
  const normalized = normalizeSignName(sign)
  if (!normalized || !Number.isFinite(degreeInSign)) {
    return undefined
  }

  const modality = CARDINAL_SIGNS.includes(normalized)
    ? "cardinal"
    : FIXED_SIGNS.includes(normalized)
      ? "fixed"
      : "mutable"
  const decan = Math.min(2, Math.max(0, Math.floor(degreeInSign / 10)))

  return id(KaabalahTypes.SPHERE, DECAN_SPHERES[modality][decan])
}

function buildDecanMarker(
  source: AstrologyTreeMarkerSource,
  position: { sign?: string; decimalDegrees?: number; longitude?: number } | undefined
): KaabalisticMarkerDescriptor | undefined {
  if (!position?.sign) {
    return undefined
  }

  const degree = position.decimalDegrees ?? (position.longitude !== undefined ? position.longitude % 30 : NaN)
  const targetId = getDecanSphereId(position.sign, degree)
  if (!targetId) {
    return undefined
  }

  return {
    kind: "astrology",
    targetId,
    targetType: "sphere",
    sourceType: source.sourceType,
    sourceName: source.sourceName,
    mapping: "decan-sphere",
    weight: getPlacementWeight(source.sourceName) * KAABALISTIC_MARKER_WEIGHTS.astrology.decanFactor,
    label: getAstrologySourceGlyph(source.sourceType, source.sourceName),
    sign: normalizeSignName(position.sign),
  }
}

function getAspectTightness(aspect: string, orb: number) {
  const { min, max } = KAABALISTIC_MARKER_WEIGHTS.aspect
  const specOrb = DEFAULT_ASPECT_SPECS.find((spec) => spec.name === aspect)?.orb
  if (!specOrb || !Number.isFinite(orb)) {
    return min
  }

  return Math.min(max, Math.max(min, round2(1 + 2 * (1 - orb / specOrb))))
}

function getAspectWeight(edge: { aspect: string; orb: number; planetA: string; planetB: string }) {
  const { pairDivisor } = KAABALISTIC_MARKER_WEIGHTS.aspect
  // Edge names come lowercase ("sun") or as aliases ("ascendant"); the registry label ("Sun", "ASC") hits the table.
  const pair = getPlacementWeight(aspectPointName(edge.planetA)) + getPlacementWeight(aspectPointName(edge.planetB))

  return round2((getAspectTightness(edge.aspect, edge.orb) * pair) / pairDivisor)
}

function aspectPointName(name: string) {
  return symbolRegistry.byKey.get(normalizeLookupKey(name))?.label ?? name
}

function buildAspectMarkers(aspects: AstrologyTreeChartInput["aspects"]) {
  const markers: KaabalisticMarkerDescriptor[] = []

  for (const edge of aspects ?? []) {
    const sphere = ASPECT_SPHERES[edge.aspect]
    if (
      !sphere ||
      defaultExcludedAstrologyPoints.has(normalizeLookupKey(edge.planetA)) ||
      defaultExcludedAstrologyPoints.has(normalizeLookupKey(edge.planetB))
    ) {
      continue
    }

    markers.push({
      kind: "astrology",
      targetId: id(KaabalahTypes.SPHERE, sphere),
      targetType: "sphere",
      sourceType: "aspect",
      sourceName: `${aspectPointName(edge.planetA)} ${edge.aspect} ${aspectPointName(edge.planetB)}`,
      mapping: "aspect-sphere",
      weight: getAspectWeight(edge),
      label: ASPECT_LABELS[edge.aspect] ?? edge.aspect,
    })
  }

  return markers
}

function dedupeMarkers(markers: readonly KaabalisticMarkerDescriptor[]) {
  const seen = new Set<string>()

  return markers.filter((marker) => {
    const key = [
      marker.kind,
      marker.targetId,
      marker.sourceType,
      marker.sourceName,
      marker.mapping,
      marker.label,
      marker.sign ?? "",
      marker.element ?? "",
      marker.planet ?? "",
    ].join("|")

    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

function englishGetAstrologyTreeMarkers(input: BirthChart | AstrologyTreeChartInput) {
  const chart = normalizeChartInput(input)
  const markers: KaabalisticMarkerDescriptor[] = []

  for (const planet of chart.planets) {
    const normalizedName = normalizeLookupKey(planet.name)
    if (defaultExcludedAstrologyPoints.has(normalizedName)) {
      continue
    }

    const sourceType = getAstrologySourceType(planet.name)
    const correspondences = getKaabalisticCorrespondenceTargets({
      kind: sourceType,
      [sourceType]: planet.name,
      sign: planet.zodiacPosition.sign,
    } as KaabalisticPlanetCorrespondenceLookup | KaabalisticNodeCorrespondenceLookup)

    if (!correspondences) {
      continue
    }

    const source = { sourceType, sourceName: correspondences.source.label }
    markers.push(...toAstrologyMarkers(correspondences, source))
    const decan = buildDecanMarker(source, planet.zodiacPosition)
    if (decan) markers.push(decan)
  }

  for (const node of chart.nodes) {
    const correspondences = getKaabalisticCorrespondenceTargets({
      kind: "node",
      node: node.name,
      sign: node.sign,
    })

    if (!correspondences) {
      continue
    }

    const source = { sourceType: "node" as const, sourceName: correspondences.source.label }
    markers.push(...toAstrologyMarkers(correspondences, source))
    const decan = buildDecanMarker(source, node)
    if (decan) markers.push(decan)
  }

  const angleTargets: Array<{ angle: string; position?: ZodiacPosition }> = [
    { angle: "ASC", position: chart.houses.ascendant },
    { angle: "MC", position: chart.houses.mc },
    { angle: "Vertex", position: chart.houses.ascmc?.vertex },
  ]

  for (const angle of angleTargets) {
    if (!angle.position?.sign) {
      continue
    }

    const correspondences = getKaabalisticCorrespondenceTargets({
      kind: "angle",
      angle: angle.angle,
      sign: angle.position.sign,
    })

    if (!correspondences) {
      continue
    }

    const source = { sourceType: "angle" as const, sourceName: correspondences.source.label }
    markers.push(...toAstrologyMarkers(correspondences, source))
    const decan = buildDecanMarker(source, angle.position)
    if (decan) markers.push(decan)
  }

  markers.push(...buildAspectMarkers(chart.aspects))

  return dedupeMarkers(markers)
}

function resolveNumerologyInput(input: Date | NumerologyTreeInput) {
  const birthDate = input instanceof Date ? input : input.birthDate
  const kaabalisticLifePath =
    input instanceof Date
      ? calculateKaabalisticLifePath(birthDate)
      : input.kaabalisticLifePath ?? calculateKaabalisticLifePath(birthDate)
  const straightAcrossReductionLifePath =
    input instanceof Date
      ? calculateStraightAcrossReductionLifePath(birthDate)
      : input.straightAcrossReductionLifePath ??
        calculateStraightAcrossReductionLifePath(birthDate)

  return {
    birthDate,
    kaabalisticLifePath,
    straightAcrossReductionLifePath,
  }
}

function buildNumberMarkers(
  sourceName: string,
  numbers: readonly number[],
  kind: KaabalisticMarkerKind,
  finalWeight: number,
  intermediateWeight: number
) {
  const markers: KaabalisticMarkerDescriptor[] = []

  for (const [index, number] of numbers.entries()) {
    const weight = index === numbers.length - 1 ? finalWeight : intermediateWeight
    const correspondences = getKaabalisticCorrespondenceTargets({
      kind: "number",
      number,
      sourceName,
    })

    if (!correspondences) {
      continue
    }

    for (const target of correspondences.targets) {
      markers.push({
        kind,
        targetId: target.targetId,
        targetType: target.targetType,
        sourceType: "number",
        sourceName,
        mapping: target.mapping,
        label: String(number),
        weight,
      })
    }
  }

  return markers
}

function englishGetNumerologyTreeMarkers(input: Date | NumerologyTreeInput) {
  const { kaabalisticLifePath, straightAcrossReductionLifePath } = resolveNumerologyInput(input)
  const markers: KaabalisticMarkerDescriptor[] = []

  const w = KAABALISTIC_MARKER_WEIGHTS.numerology
  const sources: Array<{ sourceName: string; numbers: readonly number[]; weight: number }> = [
    {
      sourceName: "Day Energy",
      numbers: straightAcrossReductionLifePath.dayEnergy.reductionSteps,
      weight: w.dayEnergy,
    },
    {
      sourceName: "Month Energy",
      numbers: straightAcrossReductionLifePath.monthEnergy.reductionSteps,
      weight: w.monthEnergy,
    },
    {
      sourceName: "Year Energy",
      numbers: straightAcrossReductionLifePath.yearEnergy.reductionSteps,
      weight: w.yearEnergy,
    },
    {
      sourceName: `Life Path (Kaabalistic) ${kaabalisticLifePath.lifePath.reducedValue}`,
      numbers: kaabalisticLifePath.lifePath.reductionSteps,
      weight: w.kaabalisticLifePath,
    },
    {
      sourceName: `Life Path (Straight) ${straightAcrossReductionLifePath.lifePath.reducedValue}`,
      numbers: straightAcrossReductionLifePath.lifePath.reductionSteps,
      weight: 0,
    },
  ]

  for (const source of sources) {
    // The Straight life path markers stay but weigh 0 at every step.
    const intermediate = source.weight === 0 ? 0 : w.intermediateStep
    markers.push(
      ...buildNumberMarkers(source.sourceName, source.numbers, "numerology", source.weight, intermediate)
    )
  }

  return markers
}

function resolveGematriaInput(input: string | GematriaTreeInput) {
  if (typeof input === "string") {
    return calculateGematria(input)
  }

  if (input.result) {
    return input.result
  }

  if (input.phrase) {
    return calculateGematria(input.phrase)
  }

  return undefined
}

function englishGetGematriaTreeMarkers(input: string | GematriaTreeInput) {
  const result = resolveGematriaInput(input)
  if (!result) {
    return []
  }

  const markers: KaabalisticMarkerDescriptor[] = []

  const w = KAABALISTIC_MARKER_WEIGHTS.gematria
  const numericSources: Array<{ sourceName: string; numbers: readonly number[]; weight: number }> = [
    { sourceName: "Vowels", numbers: result.vowels.reductionSteps, weight: w.individuality },
    { sourceName: "Consonants", numbers: result.consonants.reductionSteps, weight: w.personality },
    { sourceName: "Synthesis", numbers: result.synthesis.reductionSteps, weight: w.synthesis },
  ]

  for (const source of numericSources) {
    markers.push(
      ...buildNumberMarkers(source.sourceName, source.numbers, "gematria", source.weight, w.intermediateStep)
    )
  }

  for (const letter of result.includedLetters) {
    const correspondences = getKaabalisticCorrespondenceTargets({
      kind: "hebrewLetter",
      hebrewLetterId: letter.hebrewLetterId,
      sourceName: "Included Letters",
    })

    if (!correspondences) {
      continue
    }

    for (const target of correspondences.targets) {
      markers.push({
        kind: "gematria",
        targetId: target.targetId,
        targetType: target.targetType,
        sourceType: "letter",
        sourceName: "Included Letters",
        mapping: target.mapping,
        label: letter.hebrewCharacter,
        weight: w.letter,
      })
    }
  }

  return markers
}

function incrementCounts(
  countsById: Partial<Record<KaabalisticTargetId, KaabalisticCountsEntry>>,
  targetId: KaabalisticTargetId,
  bucket: SummaryBucket
) {
  const current = countsById[targetId] ?? {
    astro: 0,
    numerology: 0,
    gematria: 0,
    total: 0,
  }

  current[bucket] += 1
  current.total += 1
  countsById[targetId] = current
}

type WeightsById = Partial<Record<KaabalisticTargetId, KaabalisticCountsEntry>>

/** Raw capped sums per target: gematria letters capped per path, aspect markers capped per sphere. */
function computeRawWeightsById(markers: readonly KaabalisticMarkerDescriptor[]) {
  const rawWeightsById: WeightsById = {}
  const letterWeights = new Map<KaabalisticTargetId, number>()
  const aspectWeights = new Map<KaabalisticTargetId, number>()
  const buckets: Record<KaabalisticMarkerKind, SummaryBucket> = {
    astrology: "astro",
    numerology: "numerology",
    gematria: "gematria",
  }

  const add = (targetId: KaabalisticTargetId, bucket: SummaryBucket, weight: number) => {
    const current = rawWeightsById[targetId] ?? { astro: 0, numerology: 0, gematria: 0, total: 0 }
    current[bucket] = round2(current[bucket] + weight)
    current.total = round2(current.total + weight)
    rawWeightsById[targetId] = current
  }

  for (const marker of markers) {
    if (marker.kind === "gematria" && marker.sourceType === "letter") {
      letterWeights.set(marker.targetId, (letterWeights.get(marker.targetId) ?? 0) + marker.weight)
      continue
    }
    if (marker.sourceType === "aspect") {
      aspectWeights.set(marker.targetId, (aspectWeights.get(marker.targetId) ?? 0) + marker.weight)
      continue
    }

    add(marker.targetId, buckets[marker.kind], marker.weight)
  }

  for (const [targetId, weight] of letterWeights) {
    add(targetId, "gematria", Math.min(weight, KAABALISTIC_MARKER_WEIGHTS.gematria.letterPathCap))
  }
  for (const [targetId, weight] of aspectWeights) {
    add(targetId, "astro", Math.min(weight, KAABALISTIC_MARKER_WEIGHTS.aspect.sphereCap))
  }

  return rawWeightsById
}

/** Scales each system within one target type so its total equals its share, shares renormalized over present systems. */
function normalizeWeights(
  rawWeightsById: WeightsById,
  markers: readonly KaabalisticMarkerDescriptor[]
) {
  const weightsById: WeightsById = {}
  const shares = KAABALISTIC_MARKER_WEIGHTS.systemShares
  const shareByBucket: Record<SummaryBucket, number> = {
    astro: shares.astrology,
    numerology: shares.numerology,
    gematria: shares.gematria,
  }
  const bucketList: SummaryBucket[] = ["astro", "numerology", "gematria"]

  for (const targetType of ["sphere", "path"] as const) {
    const ids = [...new Set(markers.filter((m) => m.targetType === targetType).map((m) => m.targetId))]
    const totals: Record<SummaryBucket, number> = { astro: 0, numerology: 0, gematria: 0 }
    for (const targetId of ids) {
      for (const bucket of bucketList) {
        totals[bucket] += rawWeightsById[targetId]?.[bucket] ?? 0
      }
    }

    const present = bucketList.filter((bucket) => totals[bucket] > 0)
    const shareSum = present.reduce((sum, bucket) => sum + shareByBucket[bucket], 0)

    for (const targetId of ids) {
      const entry = { astro: 0, numerology: 0, gematria: 0, total: 0 }
      for (const bucket of present) {
        const raw = rawWeightsById[targetId]?.[bucket] ?? 0
        entry[bucket] = round2((raw / totals[bucket]) * ((shareByBucket[bucket] / shareSum) * 100))
      }
      entry.total = round2(entry.astro + entry.numerology + entry.gematria)
      weightsById[targetId] = entry
    }
  }

  return weightsById
}

function rankTargets(
  nodes: readonly Node<KaabalahTypes.SPHERE | KaabalahTypes.PATH>[],
  weightsById: Partial<Record<KaabalisticTargetId, KaabalisticCountsEntry>>,
  countsById: Partial<Record<KaabalisticTargetId, KaabalisticCountsEntry>>
): KaabalisticRankedTarget[] {
  return nodes
    .map((node) => {
      const targetId = node.id as KaabalisticTargetId
      return {
        id: targetId,
        name: getTargetName(targetId),
        share: weightsById[targetId]?.total ?? 0,
        count: countsById[targetId]?.total ?? 0,
      }
    })
    .filter((row) => row.share > 0)
    .sort((a, b) => b.share - a.share)
}

function groupMarkersByTarget(
  markers: readonly KaabalisticMarkerDescriptor[],
  targetType: KaabalisticTargetType
) {
  const grouped = {} as Partial<Record<KaabalisticTargetId, KaabalisticMarkerDescriptor[]>>

  for (const marker of markers) {
    if (marker.targetType !== targetType) {
      continue
    }

    const bucket = grouped[marker.targetId] ?? []
    bucket.push(marker)
    grouped[marker.targetId] = bucket
  }

  return grouped
}

function buildAstrologySummary(
  input: BirthChart | AstrologyTreeChartInput,
  markers: readonly KaabalisticMarkerDescriptor[],
  countsById: Partial<Record<KaabalisticTargetId, KaabalisticCountsEntry>>
) {
  const chart = normalizeChartInput(input)
  const itemConnections: KaabalisticItemConnection[] = []

  for (const marker of markers) {
    // Aspect markers are already counted by the aspect loop below.
    if (marker.sourceType === "aspect") {
      continue
    }
    incrementCounts(countsById, marker.targetId, "astro")
  }

  const groupedBySource = groupByKey(
    markers.filter((marker) => marker.sourceType !== "aspect"),
    (marker) => `${marker.sourceType}|${marker.sourceName}|${marker.sign ?? ""}`
  )

  for (const sourceMarkers of Object.values(groupedBySource)) {
    if (!sourceMarkers.length) {
      continue
    }

    const firstMarker = sourceMarkers[0]
    const itemLabel = firstMarker.sign
      ? `${firstMarker.sourceName} in ${firstMarker.sign}`
      : firstMarker.sourceName
    itemConnections.push({
      itemLabel,
      targets: toSummaryTargets(getTargetCountMap(sourceMarkers.map((marker) => ({
        targetId: marker.targetId,
        targetType: marker.targetType,
        targetName: getTargetName(marker.targetId),
        mapping: marker.mapping,
        distance: 1,
      })))),
    })
  }

  const planetsByName = Object.fromEntries(
    chart.planets
      .filter((planet) => !defaultExcludedAstrologyPoints.has(normalizeLookupKey(planet.name)))
      .map((planet) => [normalizeLookupKey(planet.name), { longitude: planet.longitude }])
  )

  const aspects = chart.aspects ?? computeAspects(planetsByName, DEFAULT_ASPECT_SPECS)
  const aspectsByType: Record<string, Partial<Record<KaabalisticTargetId, number>>> = {}

  for (const aspect of aspects) {
    const aspectId = id(
      WesternAstrologyTypes.ASPECT,
      WESTERN_ASPECTS[aspect.aspect.toUpperCase() as keyof typeof WESTERN_ASPECTS] ?? aspect.aspect
    )
    const sphere = canonicalTree().getCorrespondences(aspectId, {
      type: KaabalahTypes.SPHERE,
      depth: 1,
      limit: 1,
    })[0]?.node

    if (!sphere) {
      continue
    }

    incrementCounts(countsById, sphere.id as NodeId<KaabalahTypes.SPHERE>, "astro")
    const bucket = aspectsByType[aspect.aspect] ?? {}
    bucket[sphere.id as NodeId<KaabalahTypes.SPHERE>] =
      (bucket[sphere.id as NodeId<KaabalahTypes.SPHERE>] ?? 0) + 1
    aspectsByType[aspect.aspect] = bucket
  }

  for (const [aspectName, reduceMap] of Object.entries(aspectsByType)) {
    itemConnections.push({
      itemLabel: `Aspects — ${capitalizeWords(aspectName)}`,
      targets: toSummaryTargets(reduceMap),
    })
  }

  for (const planet of chart.planets) {
    if (defaultExcludedAstrologyPoints.has(normalizeLookupKey(planet.name))) {
      continue
    }

    const house = getHouseNodeByNumber(planet.zodiacPosition.house)
    if (!house) {
      continue
    }

    const sign = canonicalTree().getCorrespondences(house.id, {
      type: WesternAstrologyTypes.WESTERN_ZODIAC_SIGN,
      depth: 1,
      limit: 1,
    })[0]?.node
    if (!sign) {
      continue
    }

    const spheres = canonicalTree().getCorrespondences(sign.id, {
      type: KaabalahTypes.SPHERE,
      depth: 1,
    })
    if (!spheres.length) {
      continue
    }

    const reduceMap: Partial<Record<KaabalisticTargetId, number>> = {}
    for (const sphere of spheres) {
      const sphereId = sphere.node.id as NodeId<KaabalahTypes.SPHERE>
      incrementCounts(countsById, sphereId, "astro")
      reduceMap[sphereId] = (reduceMap[sphereId] ?? 0) + 1
    }

    itemConnections.push({
      itemLabel: `${planet.name} • House ${planet.zodiacPosition.house}`,
      targets: toSummaryTargets(reduceMap),
    })
  }

  return itemConnections
}

function buildSourceSummary(
  markers: readonly KaabalisticMarkerDescriptor[],
  bucket: SummaryBucket,
  countsById: Partial<Record<KaabalisticTargetId, KaabalisticCountsEntry>>
) {
  const groupedBySource = groupByKey(
    markers,
    (marker) => `${marker.sourceType}|${marker.sourceName}`
  )

  const connections: KaabalisticItemConnection[] = []

  for (const sourceMarkers of Object.values(groupedBySource)) {
    if (!sourceMarkers.length) {
      continue
    }

    for (const marker of sourceMarkers) {
      incrementCounts(countsById, marker.targetId, bucket)
    }

    connections.push({
      itemLabel: sourceMarkers[0].sourceName,
      targets: toSummaryTargets(getTargetCountMap(sourceMarkers.map((marker) => ({
        targetId: marker.targetId,
        targetType: marker.targetType,
        targetName: getTargetName(marker.targetId),
        mapping: marker.mapping,
        distance: 1,
      })))),
    })
  }

  return connections
}

function capitalizeWords(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function englishBuildKaabalisticMapData(input: BuildKaabalisticMapDataInput): KaabalisticMapData {
  const countsById: Partial<Record<KaabalisticTargetId, KaabalisticCountsEntry>> = {}
  const allMarkers: KaabalisticMarkerDescriptor[] = []

  const astrologyMarkers = input.astrology ? getAstrologyTreeMarkers(input.astrology) : []
  const numerologyMarkers = input.numerology ? getNumerologyTreeMarkers(input.numerology) : []
  const gematriaMarkers = input.gematria ? getGematriaTreeMarkers(input.gematria) : []

  allMarkers.push(...astrologyMarkers, ...numerologyMarkers, ...gematriaMarkers)

  const itemConnections = {
    astrology: input.astrology
      ? buildAstrologySummary(input.astrology, astrologyMarkers, countsById)
      : [],
    numerology: numerologyMarkers.length
      ? buildSourceSummary(numerologyMarkers, "numerology", countsById)
      : [],
    gematria: gematriaMarkers.length
      ? buildSourceSummary(gematriaMarkers, "gematria", countsById)
      : [],
  }

  const rawWeightsById = computeRawWeightsById(allMarkers)
  const weightsById = normalizeWeights(rawWeightsById, allMarkers)
  const sphereMarkers = groupMarkersByTarget(allMarkers, "sphere") as Partial<
    Record<NodeId<KaabalahTypes.SPHERE>, readonly KaabalisticMarkerDescriptor[]>
  >
  const pathMarkers = groupMarkersByTarget(allMarkers, "path") as Partial<
    Record<NodeId<KaabalahTypes.PATH>, readonly KaabalisticMarkerDescriptor[]>
  >

  return {
    spheres: orderedSpheres(),
    paths: orderedPaths(),
    markers: allMarkers,
    sphereMarkers,
    pathMarkers,
    countsById,
    weightsById,
    rawWeightsById,
    rankedSpheres: rankTargets(orderedSpheres(), weightsById, countsById),
    rankedPaths: rankTargets(orderedPaths(), weightsById, countsById),
    itemConnections,
  }
}

function localizeSymbol(row: KaabalisticSymbolMetadata | undefined, language?: string) {
  if (!row || !language?.startsWith("pt")) return row;
  return Object.freeze({ ...row, label: getKaabalisticLabel(row.label, language), shortLabel: getKaabalisticLabel(row.shortLabel, language) });
}

/** Correspondence labels in the requested language; lookup identities stay unchanged. */
export function getKaabalisticCorrespondenceTargets(lookup: KaabalisticCorrespondenceLookup, language?: string): KaabalisticCorrespondenceResult | undefined {
  const result = englishGetKaabalisticCorrespondenceTargets(lookup);
  if (!result || !language?.startsWith("pt")) return result;
  return {
    ...result,
    source: { ...result.source, label: getKaabalisticLabel(result.source.label, language), shortLabel: getKaabalisticLabel(result.source.shortLabel, language) },
    targets: result.targets.map(target => ({ ...target, targetName: getKaabalisticLabel(target.targetName, language) })),
  };
}

function localizeAspectSourceName(sourceName: string, language: string) {
  const match = /^(.+) (conjunction|duodecile|octile|sextile|square|trine|trioctile|quincunx|opposition) (.+)$/.exec(sourceName);
  if (!match) return sourceName;
  const aspect = getKaabalisticLabel(capitalizeWords(match[2]), language).toLowerCase();
  return `${getKaabalisticLabel(match[1], language)} ${aspect} ${getKaabalisticLabel(match[3], language)}`;
}

function localizeMarkers(markers: KaabalisticMarkerDescriptor[], language?: string) {
  if (!language?.startsWith("pt")) return markers;
  return markers.map(marker => ({
    ...marker,
    sourceName: marker.sourceType === "aspect" ? localizeAspectSourceName(marker.sourceName, language) : getKaabalisticLabel(marker.sourceName, language),
    label: getKaabalisticLabel(marker.label, language),
  }));
}

/** Marker display labels in Portuguese for pt and pt-BR. Glyphs and target IDs stay unchanged. */
export function getAstrologyTreeMarkers(input: BirthChart | AstrologyTreeChartInput, language?: string) {
  return localizeMarkers(englishGetAstrologyTreeMarkers(input), language);
}
export function getNumerologyTreeMarkers(input: Date | NumerologyTreeInput, language?: string) {
  return localizeMarkers(englishGetNumerologyTreeMarkers(input), language);
}
export function getGematriaTreeMarkers(input: string | GematriaTreeInput, language?: string) {
  return localizeMarkers(englishGetGematriaTreeMarkers(input), language);
}

/** Complete map with localized display labels; English remains the default. */
export function buildKaabalisticMapData(input: BuildKaabalisticMapDataInput, language?: string): KaabalisticMapData {
  const result = englishBuildKaabalisticMapData(input);
  if (!language?.startsWith("pt")) return result;
  const markers = localizeMarkers([...result.markers], language);
  const connections = (rows: readonly KaabalisticItemConnection[]) => rows.map(row => ({
    ...row, itemLabel: getKaabalisticLabel(row.itemLabel, language),
    targets: row.targets.map(target => ({ ...target, name: getKaabalisticLabel(target.name, language) })),
  }));
  return {
    ...result, markers,
    rankedSpheres: result.rankedSpheres.map(row => ({ ...row, name: getKaabalisticLabel(row.name, language) })),
    rankedPaths: result.rankedPaths.map(row => ({ ...row, name: getKaabalisticLabel(row.name, language) })),
    sphereMarkers: groupMarkersByTarget(markers, "sphere"),
    pathMarkers: groupMarkersByTarget(markers, "path"),
    itemConnections: {
      astrology: connections(result.itemConnections.astrology),
      numerology: connections(result.itemConnections.numerology),
      gematria: connections(result.itemConnections.gematria),
    },
  };
}
