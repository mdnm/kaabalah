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

export interface KaabalisticMarkerDescriptor {
  kind: KaabalisticMarkerKind;
  targetId: KaabalisticTargetId;
  targetType: KaabalisticTargetType;
  sourceType: KaabalisticMarkerSourceType;
  sourceName: string;
  mapping: KaabalisticMarkerMapping;
  label: string;
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

const canonicalTree = getCanonicalTree({
  system: "kaabalah",
  parts: ["westernAstrology"],
})

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

const orderedSpheres = Object.freeze(
  orderedSphereIds
    .map((sphereId) => canonicalTree.getNode(sphereId))
    .filter((node): node is Node<KaabalahTypes.SPHERE> => Boolean(node))
)

const orderedPaths = Object.freeze(
  orderedPathIds
    .map((pathId) => canonicalTree.getNode(pathId))
    .filter((node): node is Node<KaabalahTypes.PATH> => Boolean(node))
)

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

const planetCarrierSphereIdsByKey = createPlanetCarrierSphereIdsByKey(canonicalTree)
const classicalPlanetPathIdsByKey = createClassicalPlanetPathIdsByKey(canonicalTree)
const angleCarrierSphereIdsByKey = createAngleCarrierSphereIdsByKey()

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

export function listPlanetSymbolMetadata() {
  return symbolRegistry.planets
}

export function listZodiacSignSymbolMetadata() {
  return symbolRegistry.signs
}

export function listAngleSymbolMetadata() {
  return symbolRegistry.angles
}

export function listNodeSymbolMetadata() {
  return symbolRegistry.nodes
}

export function getPlanetSymbolMetadata(lookup: string) {
  return lookupPlanetSymbolMetadata(lookup)
}

export function getZodiacSignSymbolMetadata(lookup: KaabalisticSignLookup) {
  return lookupSignSymbolMetadata(lookup)
}

export function getAngleSymbolMetadata(lookup: string) {
  const rawLookup = lookup.startsWith(`${WesternAstrologyTypes.HOUSE}:`)
    ? parseId(lookup as NodeId<WesternAstrologyTypes.HOUSE>)
    : lookup
  const metadata = symbolRegistry.byKey.get(normalizeLookupKey(rawLookup))
  return metadata?.kind === "angle" ? metadata : undefined
}

export function getNodeSymbolMetadata(lookup: string) {
  const metadata = symbolRegistry.byKey.get(normalizeLookupKey(lookup))
  return metadata?.kind === "node" ? metadata : undefined
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
  return canonicalTree.getCorrespondences(id(NumerologyTypes.NUMBER, houseNumber), {
    type: WesternAstrologyTypes.HOUSE,
    depth: 1,
    limit: 1,
  })[0]?.node
}

function buildSignTargets(sign: (typeof SIGNS)[number]) {
  const signId = id(WesternAstrologyTypes.WESTERN_ZODIAC_SIGN, sign)
  const result: KaabalisticCorrespondenceTarget[] = []

  for (const match of canonicalTree.getCorrespondences(signId, {
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

    for (const elementPath of canonicalTree.getCorrespondences(match.node.id, {
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

    for (const elementSphere of canonicalTree.getCorrespondences(match.node.id, {
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
    ? planetCarrierSphereIdsByKey.get(sourceKey)
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

  const letterNode = canonicalTree.getNode(lookup.hebrewLetterId)
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

export function getKaabalisticCorrespondenceTargets(
  lookup: KaabalisticCorrespondenceLookup
): KaabalisticCorrespondenceResult | undefined {
  if (lookup.kind === "number") {
    const source = createCorrespondenceSource(lookup)
    const numberId = id(NumerologyTypes.NUMBER, lookup.number)
    const targets = [
      ...canonicalTree.getCorrespondences(numberId, { type: KaabalahTypes.SPHERE, depth: 1 }).map((match) => ({
        targetId: match.node.id as NodeId<KaabalahTypes.SPHERE>,
        targetType: "sphere" as const,
        targetName: getTargetName(match.node.id as NodeId<KaabalahTypes.SPHERE>),
        mapping: "number-sphere" as const,
        distance: match.distance,
      })),
      ...canonicalTree.getCorrespondences(numberId, { type: KaabalahTypes.PATH, depth: 1 }).map((match) => ({
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
    const targets = canonicalTree.getCorrespondences(lookup.hebrewLetterId, {
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
    const planetPathTargets = (classicalPlanetPathIdsByKey.get(planetKey) ?? []).map((pathId) => ({
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
    label:
      target.mapping === "planet-sign-path" || target.mapping === "carrier-sphere"
        ? signGlyph
        : sourceGlyph,
    ...(target.sign ? { sign: target.sign } : {}),
    ...(target.element ? { element: target.element } : {}),
    ...(target.planet ? { planet: target.planet } : {}),
  }))
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

export function getAstrologyTreeMarkers(input: BirthChart | AstrologyTreeChartInput) {
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

    markers.push(
      ...toAstrologyMarkers(correspondences, {
        sourceType,
        sourceName: correspondences.source.label,
      })
    )
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

    markers.push(
      ...toAstrologyMarkers(correspondences, {
        sourceType: "node",
        sourceName: correspondences.source.label,
      })
    )
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

    markers.push(
      ...toAstrologyMarkers(correspondences, {
        sourceType: "angle",
        sourceName: correspondences.source.label,
      })
    )
  }

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

function buildNumberMarkers(sourceName: string, numbers: readonly number[], kind: KaabalisticMarkerKind) {
  const markers: KaabalisticMarkerDescriptor[] = []

  for (const number of numbers) {
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
      })
    }
  }

  return markers
}

export function getNumerologyTreeMarkers(input: Date | NumerologyTreeInput) {
  const { kaabalisticLifePath, straightAcrossReductionLifePath } = resolveNumerologyInput(input)
  const markers: KaabalisticMarkerDescriptor[] = []

  const sources: Array<{ sourceName: string; numbers: readonly number[] }> = [
    {
      sourceName: "Day Energy",
      numbers: straightAcrossReductionLifePath.dayEnergy.reductionSteps,
    },
    {
      sourceName: "Month Energy",
      numbers: straightAcrossReductionLifePath.monthEnergy.reductionSteps,
    },
    {
      sourceName: "Year Energy",
      numbers: straightAcrossReductionLifePath.yearEnergy.reductionSteps,
    },
    {
      sourceName: `Life Path (Kaabalistic) ${kaabalisticLifePath.lifePath.reducedValue}`,
      numbers: kaabalisticLifePath.lifePath.reductionSteps,
    },
    {
      sourceName: `Life Path (Straight) ${straightAcrossReductionLifePath.lifePath.reducedValue}`,
      numbers: straightAcrossReductionLifePath.lifePath.reductionSteps,
    },
  ]

  for (const source of sources) {
    markers.push(...buildNumberMarkers(source.sourceName, source.numbers, "numerology"))
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

export function getGematriaTreeMarkers(input: string | GematriaTreeInput) {
  const result = resolveGematriaInput(input)
  if (!result) {
    return []
  }

  const markers: KaabalisticMarkerDescriptor[] = []

  const numericSources: Array<{ sourceName: string; numbers: readonly number[] }> = [
    { sourceName: "Vowels", numbers: result.vowels.reductionSteps },
    { sourceName: "Consonants", numbers: result.consonants.reductionSteps },
    { sourceName: "Synthesis", numbers: result.synthesis.reductionSteps },
  ]

  for (const source of numericSources) {
    markers.push(...buildNumberMarkers(source.sourceName, source.numbers, "gematria"))
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
    incrementCounts(countsById, marker.targetId, "astro")
  }

  const groupedBySource = groupByKey(
    markers,
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
    const sphere = canonicalTree.getCorrespondences(aspectId, {
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

    const sign = canonicalTree.getCorrespondences(house.id, {
      type: WesternAstrologyTypes.WESTERN_ZODIAC_SIGN,
      depth: 1,
      limit: 1,
    })[0]?.node
    if (!sign) {
      continue
    }

    const spheres = canonicalTree.getCorrespondences(sign.id, {
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

export function buildKaabalisticMapData(input: BuildKaabalisticMapDataInput): KaabalisticMapData {
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

  const sphereMarkers = groupMarkersByTarget(allMarkers, "sphere") as Partial<
    Record<NodeId<KaabalahTypes.SPHERE>, readonly KaabalisticMarkerDescriptor[]>
  >
  const pathMarkers = groupMarkersByTarget(allMarkers, "path") as Partial<
    Record<NodeId<KaabalahTypes.PATH>, readonly KaabalisticMarkerDescriptor[]>
  >

  return {
    spheres: orderedSpheres,
    paths: orderedPaths,
    markers: allMarkers,
    sphereMarkers,
    pathMarkers,
    countsById,
    itemConnections,
  }
}
