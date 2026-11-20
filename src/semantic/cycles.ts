import { SIGNS } from "../astrology"
import { KaabalahTypes, id, type Node, type NodeId } from "../core"
import {
  getKaabalisticCorrespondenceTargets,
  kaabalisticInternals,
  type KaabalisticItemConnection,
  type KaabalisticMarkerDescriptor,
  type KaabalisticRankedTarget,
  type KaabalisticTargetId,
} from "./kaabalistic"
import { getKaabalisticLabel } from "./labels"

const {
  ASPECT_SPHERES,
  ASPECT_LABELS,
  round2,
  normalizeLookupKey,
  aspectPointName,
  isExcludedAstrologyPoint,
  getAstrologySourceType,
  getAstrologySourceGlyph,
  getAspectWeight,
  getPlanetCarrierSphereIds,
  getPointCarrierSphereIds,
  getPlanetPathIds,
  buildNumberMarkers,
  toSummaryTargets,
  toAstrologyMarkers,
  buildDecanMarker,
  normalizeSignName,
  normalizeBucketShares,
  rankTargets,
  groupMarkersByTarget,
  orderedSpheres,
  orderedPaths,
} = kaabalisticInternals

/**
 * Author-defined weights of the cycle map ("what is active for me today"), exposed so
 * callers can show the table. Placement weights, the tightness scale (`aspect.min` to
 * `aspect.max`), `aspect.pairDivisor` and `astrology.decanFactor` are the ones of
 * `KAABALISTIC_MARKER_WEIGHTS`; this constant holds only what is specific to cycles.
 *
 * Transit aspects: an aspect between a transiting body and a natal body counts only
 * when its type is in `aspects` (the five major ones) and its orb is at or under
 * `maxOrb` degrees; any other aspect gives no marker. It lights two spheres. The first
 * is the sphere of the aspect itself (square lights Geburah, trine Netzach, as in the
 * birth map). The second is the sphere of the natal body it touches: Tiphareth for the
 * Sun, Yesod for the Moon, and so on for the ten planets, and Malkuth for the ASC. A
 * natal point with no sphere of its own (MC, the nodes, Lilith, Chiron, the Wheel of
 * Fortune) lights only the aspect's sphere. The aspect also lights the path of the
 * natal planet it touches, for the seven planets that have one: Path 22 for the Sun, 2
 * for the Moon, 17 for Mercury, 3 for Venus, 11 for Mars, 4 for Jupiter, 20 for Saturn.
 * Uranus, Neptune, Pluto and every other natal point light no path.
 *
 * All the markers of an aspect carry the same weight. Its tightness runs from `aspect.max`
 * at exact to `aspect.min` at `maxOrb`. The weight is that tightness times the
 * placement weights of the two bodies added together, divided by `pairDivisor`, rounded
 * to 2 decimals. When the transiting or the natal body is one of the person's current
 * time lords, the weight is multiplied by `timeLordFactor`, once, however many systems
 * name that planet and even when both bodies are lords. So transit Saturn square natal
 * Moon puts 2.1 on Geburah, 2.1 on Yesod and 2.1 on Path 2 at exact orb, 1.4 at half a
 * degree and 0.7 at one degree, and twice that while Saturn or the Moon rules the
 * firdaria. Markers on one sphere or path add up with no cap. In `countsById` an aspect
 * counts once, on the sphere of the aspect.
 *
 * Transit placements: only the bodies in `skyBodies` (the Moon) light the tree by where
 * they are in the sky. Such a body lights what its sign and planet light for a natal
 * placement, at the natal placement weight times `skyFactor`, and its decan sphere at
 * that weight times `decanFactor`. Every other transiting body counts only through its
 * aspects.
 *
 * Time lords: each lord lights the sphere of its planet as background, with the weight
 * of its role in `timeLords`. A node as lord (North Node, South Node, Rahu, Ketu) has no
 * sphere of its own: it lights the sphere or spheres of the sign of the natal node,
 * and nothing when that sign is not given.
 *
 * Numerology: the weight applies to the personal day, month and year numbers; every
 * intermediate reduction step weighs `intermediateStep`.
 *
 * Marker `weight` is the raw value. In `weightsById` the raw sums are turned into
 * shares exactly as in the birth map: within spheres, and separately within paths, each
 * system's values are scaled so the system's total equals its entry in `systemShares`
 * (percentage points). Systems with no raw weight in that target type are left out and
 * the remaining shares are rescaled to sum to 100. `rawWeightsById` keeps the sums
 * before this step.
 */
export const KAABALISTIC_CYCLE_WEIGHTS = {
  transit: {
    aspects: ["conjunction", "sextile", "square", "trine", "opposition"] as readonly string[],
    maxOrb: 1,
    timeLordFactor: 2,
    skyBodies: ["Moon"] as readonly string[],
    skyFactor: 0.5,
  },
  timeLords: {
    firdariaMajor: 2,
    firdariaSub: 1,
    profection: 2,
    mahaDasha: 2,
    antarDasha: 1,
  },
  numerology: {
    personalDay: 4,
    personalMonth: 3,
    personalYear: 2,
    intermediateStep: 1,
  },
  systemShares: { transits: 60, timeLords: 20, numerology: 20 },
} as const

export type KaabalisticCycleSystem = "transits" | "timeLords" | "numerology"

export type KaabalisticCycleSource =
  | "transit-aspect"
  | "transit-natal-sphere"
  | "transit-natal-path"
  | "transit-placement"
  | "firdaria-major"
  | "firdaria-sub"
  | "profection"
  | "maha-dasha"
  | "antar-dasha"
  | "personal-day"
  | "personal-month"
  | "personal-year"

/** A transit to natal aspect. `planetA` is the transiting body, `planetB` the natal one, as in `TransitAspectEdge`. */
export interface CycleTransitAspectInput {
  planetA: string;
  planetB: string;
  aspect: string;
  orb: number;
}

/** A transiting body. A `TransitPlanet` fits as is; `{ name, sign }` is enough. */
export interface CycleTransitPlacementInput {
  name: string;
  sign?: string;
  zodiacPosition?: { sign: string; decimalDegrees?: number; longitude?: number };
  retrograde?: boolean;
}

/**
 * The planets ruling the person's time now, with the names their functions return:
 * `getFirdaria().currentMajor.planet` and `.currentSub.planet`, `getAnnualProfection().ruler`,
 * `findActiveDasha().maha.lord` and `.antar?.lord`.
 */
export interface CycleTimeLordsInput {
  firdariaMajor?: string | null;
  firdariaSub?: string | null;
  profection?: string | null;
  mahaDasha?: string | null;
  antarDasha?: string | null;
  /** Sign of the natal North Node. A node lord lights that sign's sphere; the South Node and Ketu take the opposite sign. */
  northNodeSign?: string | null;
}

/** A plain number, or the `ReducedNumber` of `getNumerologySnapshot().calendar`. */
export type CycleNumberInput = number | { value: number; reductionSteps?: readonly number[] }

export interface CycleNumerologyInput {
  personalDay?: CycleNumberInput | null;
  personalMonth?: CycleNumberInput | null;
  personalYear?: CycleNumberInput | null;
}

export interface BuildCycleMapDataInput {
  /** `TransitChart.aspects` fits as is; aspect types outside `transit.aspects` and orbs over `transit.maxOrb` are ignored. */
  transitAspects?: readonly CycleTransitAspectInput[] | null;
  /** `TransitChart.transitPlanets` fits as is; only the bodies in `transit.skyBodies` give markers. */
  transitPlacements?: readonly CycleTransitPlacementInput[] | Record<string, CycleTransitPlacementInput> | null;
  timeLords?: CycleTimeLordsInput | null;
  /** `getNumerologySnapshot().calendar` fits as is. */
  numerology?: CycleNumerologyInput | null;
}

export interface KaabalisticCycleMarkerDescriptor extends KaabalisticMarkerDescriptor {
  /** The system whose share this marker counts toward. */
  system: KaabalisticCycleSystem;
  cycleSource: KaabalisticCycleSource;
  /** Every marker of a transit aspect: true when `timeLordFactor` was applied. */
  timeLord?: boolean;
  /** Transit placements only. */
  retrograde?: boolean;
}

export interface KaabalisticCycleCountsEntry {
  transits: number;
  timeLords: number;
  numerology: number;
  total: number;
}

type CycleEntriesById = Partial<Record<KaabalisticTargetId, KaabalisticCycleCountsEntry>>

/** Same field names as `KaabalisticMapData`, with the cycle systems in place of astrology, numerology and gematria. */
export interface KaabalisticCycleMapData {
  spheres: readonly Node<KaabalahTypes.SPHERE>[];
  paths: readonly Node<KaabalahTypes.PATH>[];
  markers: readonly KaabalisticCycleMarkerDescriptor[];
  sphereMarkers: Partial<Record<NodeId<KaabalahTypes.SPHERE>, readonly KaabalisticCycleMarkerDescriptor[]>>;
  pathMarkers: Partial<Record<NodeId<KaabalahTypes.PATH>, readonly KaabalisticCycleMarkerDescriptor[]>>;
  countsById: CycleEntriesById;
  /** Share-normalized weights in percentage points: spheres sum to 100 and paths sum to 100 (see KAABALISTIC_CYCLE_WEIGHTS). */
  weightsById: CycleEntriesById;
  /** Same shape, before normalization: sums of marker weights. */
  rawWeightsById: CycleEntriesById;
  /** Touched spheres, heaviest first, ties in the Tree's own order. */
  rankedSpheres: readonly KaabalisticRankedTarget[];
  /** Touched paths, heaviest first, ties in path order. */
  rankedPaths: readonly KaabalisticRankedTarget[];
  itemConnections: Record<KaabalisticCycleSystem, readonly KaabalisticItemConnection[]>;
}

const NODE_LORDS: Readonly<Record<string, { label: string; glyph: string; south: boolean }>> = {
  northnode: { label: "North Node", glyph: "☊", south: false },
  "north node": { label: "North Node", glyph: "☊", south: false },
  rahu: { label: "Rahu", glyph: "☊", south: false },
  southnode: { label: "South Node", glyph: "☋", south: true },
  "south node": { label: "South Node", glyph: "☋", south: true },
  ketu: { label: "Ketu", glyph: "☋", south: true },
}

/** One key for the whole nodal axis, so a node lord matches the node bodies of a transit chart. */
const NODE_KEY = "node"
const NODE_BODY_KEYS = new Set(["mean node", "true node"])

const TIME_LORD_ROLES = [
  { field: "firdariaMajor", cycleSource: "firdaria-major", template: "firdaria lord {planet}" },
  { field: "firdariaSub", cycleSource: "firdaria-sub", template: "firdaria sub lord {planet}" },
  { field: "profection", cycleSource: "profection", template: "profection lord {planet}" },
  { field: "mahaDasha", cycleSource: "maha-dasha", template: "maha dasha lord {planet}" },
  { field: "antarDasha", cycleSource: "antar-dasha", template: "antar dasha lord {planet}" },
] as const

const NUMEROLOGY_ROLES = [
  { field: "personalDay", cycleSource: "personal-day", sourceName: "Personal Day" },
  { field: "personalMonth", cycleSource: "personal-month", sourceName: "Personal Month" },
  { field: "personalYear", cycleSource: "personal-year", sourceName: "Personal Year" },
] as const

function bodyKey(name: string) {
  const key = normalizeLookupKey(aspectPointName(name))
  return NODE_BODY_KEYS.has(key) || NODE_LORDS[key] ? NODE_KEY : key
}

function timeLordKeys(timeLords: CycleTimeLordsInput | null | undefined) {
  const keys = new Set<string>()
  for (const role of TIME_LORD_ROLES) {
    const lord = timeLords?.[role.field]
    if (lord) keys.add(bodyKey(lord))
  }
  return keys
}

function oppositeSign(sign: string) {
  const index = SIGNS.indexOf(sign as (typeof SIGNS)[number])
  return index < 0 ? undefined : SIGNS[(index + 6) % 12]
}

function buildTransitAspectMarkers(input: BuildCycleMapDataInput, language?: string) {
  const { timeLordFactor, maxOrb, aspects } = KAABALISTIC_CYCLE_WEIGHTS.transit
  const lords = timeLordKeys(input.timeLords)
  const markers: KaabalisticCycleMarkerDescriptor[] = []

  for (const edge of input.transitAspects ?? []) {
    const sphere = ASPECT_SPHERES[edge.aspect]
    if (
      !sphere ||
      !aspects.includes(edge.aspect) ||
      !(edge.orb <= maxOrb) ||
      isExcludedAstrologyPoint(edge.planetA) ||
      isExcludedAstrologyPoint(edge.planetB)
    ) {
      continue
    }

    const timeLord = lords.has(bodyKey(edge.planetA)) || lords.has(bodyKey(edge.planetB))
    const transit = getKaabalisticLabel("transit {body}", language)
      .replace("{body}", getKaabalisticLabel(aspectPointName(edge.planetA), language))
    const natal = getKaabalisticLabel("natal {body}", language)
      .replace("{body}", getKaabalisticLabel(aspectPointName(edge.planetB), language))
    const aspect = language?.startsWith("pt")
      ? getKaabalisticLabel(edge.aspect.charAt(0).toUpperCase() + edge.aspect.slice(1), language).toLowerCase()
      : edge.aspect

    const base = {
      kind: "astrology" as const,
      system: "transits" as const,
      targetType: "sphere" as const,
      sourceType: "aspect" as const,
      sourceName: `${transit} ${aspect} ${natal}`,
      weight: round2(getAspectWeight(edge, maxOrb) * (timeLord ? timeLordFactor : 1)),
      label: ASPECT_LABELS[edge.aspect] ?? edge.aspect,
      timeLord,
    }

    markers.push({
      ...base,
      cycleSource: "transit-aspect",
      targetId: id(KaabalahTypes.SPHERE, sphere),
      mapping: "aspect-sphere",
    })
    for (const targetId of getPointCarrierSphereIds(edge.planetB)) {
      markers.push({
        ...base,
        cycleSource: "transit-natal-sphere",
        targetId,
        mapping: "carrier-sphere",
        planet: aspectPointName(edge.planetB),
      })
    }
    for (const targetId of getPlanetPathIds(edge.planetB)) {
      markers.push({
        ...base,
        cycleSource: "transit-natal-path",
        targetId,
        targetType: "path",
        mapping: "planet-sign-path",
        planet: aspectPointName(edge.planetB),
      })
    }
  }

  return markers
}

function buildTransitPlacementMarkers(input: BuildCycleMapDataInput, language?: string) {
  const { skyFactor, skyBodies } = KAABALISTIC_CYCLE_WEIGHTS.transit
  const skyKeys = new Set(skyBodies.map((body) => bodyKey(body)))
  const placements = Array.isArray(input.transitPlacements)
    ? (input.transitPlacements as readonly CycleTransitPlacementInput[])
    : Object.values(input.transitPlacements ?? {})
  const markers: KaabalisticCycleMarkerDescriptor[] = []

  for (const placement of placements) {
    const sign = placement.zodiacPosition?.sign ?? placement.sign
    if (!sign || !skyKeys.has(bodyKey(placement.name))) {
      continue
    }

    const sourceType = getAstrologySourceType(placement.name)
    const correspondences = getKaabalisticCorrespondenceTargets(
      sourceType === "node"
        ? { kind: "node", node: placement.name, sign }
        : { kind: "planet", planet: placement.name, sign }
    )
    if (!correspondences) {
      continue
    }

    const source = { sourceType, sourceName: correspondences.source.label }
    const decan = buildDecanMarker(source, placement.zodiacPosition)
    const sourceName = getKaabalisticLabel("transit {body}", language)
      .replace("{body}", getKaabalisticLabel(source.sourceName, language))

    for (const marker of [...toAstrologyMarkers(correspondences, source), ...(decan ? [decan] : [])]) {
      markers.push({
        ...marker,
        system: "transits",
        cycleSource: "transit-placement",
        sourceName,
        weight: round2(marker.weight * skyFactor),
        sign: marker.sign ?? normalizeSignName(sign),
        ...(placement.retrograde === undefined ? {} : { retrograde: placement.retrograde }),
      })
    }
  }

  return markers
}

function buildTimeLordMarkers(input: BuildCycleMapDataInput, language?: string) {
  const timeLords = input.timeLords
  const markers: KaabalisticCycleMarkerDescriptor[] = []
  const northNodeSign = timeLords?.northNodeSign ? normalizeSignName(timeLords.northNodeSign) : undefined

  for (const role of TIME_LORD_ROLES) {
    const lord = timeLords?.[role.field]
    if (!lord) {
      continue
    }

    const weight = KAABALISTIC_CYCLE_WEIGHTS.timeLords[role.field]
    const node = NODE_LORDS[normalizeLookupKey(lord)]
    const label = node?.label ?? aspectPointName(lord)
    const sourceName = getKaabalisticLabel(role.template, language)
      .replace("{planet}", getKaabalisticLabel(label, language))
    const base = {
      kind: "astrology" as const,
      system: "timeLords" as const,
      cycleSource: role.cycleSource,
      targetType: "sphere" as const,
      sourceName,
      weight,
    }

    if (node) {
      const sign = northNodeSign && node.south ? oppositeSign(northNodeSign) : northNodeSign
      const targets = sign
        ? getKaabalisticCorrespondenceTargets({ kind: "node", node: "Mean Node", sign })?.targets ?? []
        : []
      for (const target of targets) {
        if (target.targetType !== "sphere") continue
        markers.push({
          ...base,
          targetId: target.targetId,
          sourceType: "node",
          mapping: target.mapping,
          label: node.glyph,
          sign,
          ...(target.element ? { element: target.element } : {}),
        })
      }
      continue
    }

    for (const targetId of getPlanetCarrierSphereIds(label)) {
      markers.push({
        ...base,
        targetId,
        sourceType: "planet",
        mapping: "carrier-sphere",
        label: getAstrologySourceGlyph("planet", label),
        planet: label,
      })
    }
  }

  return markers
}

function buildCycleNumerologyMarkers(input: BuildCycleMapDataInput, language?: string) {
  const weights = KAABALISTIC_CYCLE_WEIGHTS.numerology
  const markers: KaabalisticCycleMarkerDescriptor[] = []

  for (const role of NUMEROLOGY_ROLES) {
    const value = input.numerology?.[role.field]
    if (value === null || value === undefined) {
      continue
    }

    const numbers = typeof value === "number"
      ? [value]
      : value.reductionSteps?.length ? value.reductionSteps : [value.value]
    const built = buildNumberMarkers(
      getKaabalisticLabel(role.sourceName, language),
      numbers.filter((number) => Number.isFinite(number)),
      "numerology",
      weights[role.field],
      weights.intermediateStep
    )
    markers.push(...built.map((marker) => ({
      ...marker,
      system: "numerology" as const,
      cycleSource: role.cycleSource,
    })))
  }

  return markers
}

function emptyEntry(): KaabalisticCycleCountsEntry {
  return { transits: 0, timeLords: 0, numerology: 0, total: 0 }
}

/** Raw sums of marker weights per target. */
function computeCycleRawWeightsById(markers: readonly KaabalisticCycleMarkerDescriptor[]) {
  const rawWeightsById: CycleEntriesById = {}

  for (const marker of markers) {
    const current = rawWeightsById[marker.targetId] ?? emptyEntry()
    current[marker.system] = round2(current[marker.system] + marker.weight)
    current.total = round2(current.total + marker.weight)
    rawWeightsById[marker.targetId] = current
  }

  return rawWeightsById
}

function buildItemConnections(
  markers: readonly KaabalisticCycleMarkerDescriptor[],
  system: KaabalisticCycleSystem,
  language?: string
) {
  const bySource = new Map<string, Partial<Record<KaabalisticTargetId, number>>>()

  for (const marker of markers) {
    if (marker.system !== system) continue
    const itemLabel = marker.cycleSource === "transit-placement" && marker.sign
      ? getKaabalisticLabel("{source} in {sign}", language)
        .replace("{source}", marker.sourceName)
        .replace("{sign}", getKaabalisticLabel(marker.sign, language))
      : marker.sourceName
    const counts = bySource.get(itemLabel) ?? {}
    counts[marker.targetId] = (counts[marker.targetId] ?? 0) + 1
    bySource.set(itemLabel, counts)
  }

  return [...bySource].map<KaabalisticItemConnection>(([itemLabel, counts]) => ({
    itemLabel,
    targets: toSummaryTargets(counts).map((target) => ({
      ...target,
      name: getKaabalisticLabel(target.name, language),
    })),
  }))
}

/**
 * Tree markers of a person's current cycles: transit aspects, transiting bodies, time
 * lords and personal numerology numbers. Takes computed data only, no ephemeris call.
 * `language` ("pt", "pt-BR") changes `sourceName`; ids, glyphs and weights stay unchanged.
 */
export function getCycleTreeMarkers(
  input: BuildCycleMapDataInput = {},
  language?: string
): KaabalisticCycleMarkerDescriptor[] {
  return [
    ...buildTransitAspectMarkers(input, language),
    ...buildTransitPlacementMarkers(input, language),
    ...buildTimeLordMarkers(input, language),
    ...buildCycleNumerologyMarkers(input, language),
  ]
}

/** The cycle map: markers, share-normalized weights and ranked targets (see KAABALISTIC_CYCLE_WEIGHTS). */
export function buildCycleMapData(
  input: BuildCycleMapDataInput = {},
  language?: string
): KaabalisticCycleMapData {
  const markers = getCycleTreeMarkers(input ?? {}, language)
  const countsById: CycleEntriesById = {}

  for (const marker of markers) {
    // One aspect counts once, on the sphere of the aspect.
    if (marker.cycleSource === "transit-natal-sphere" || marker.cycleSource === "transit-natal-path") continue
    const current = countsById[marker.targetId] ?? emptyEntry()
    current[marker.system] += 1
    current.total += 1
    countsById[marker.targetId] = current
  }

  const rawWeightsById = computeCycleRawWeightsById(markers)
  const weightsById: CycleEntriesById = normalizeBucketShares<KaabalisticCycleSystem>(
    rawWeightsById,
    markers,
    KAABALISTIC_CYCLE_WEIGHTS.systemShares
  )
  const localizeRanked = (rows: KaabalisticRankedTarget[]) =>
    rows.map((row) => ({ ...row, name: getKaabalisticLabel(row.name, language) }))

  return {
    spheres: orderedSpheres(),
    paths: orderedPaths(),
    markers,
    sphereMarkers: groupMarkersByTarget(markers, "sphere"),
    pathMarkers: groupMarkersByTarget(markers, "path"),
    countsById,
    weightsById,
    rawWeightsById,
    rankedSpheres: localizeRanked(rankTargets(orderedSpheres(), weightsById, countsById)),
    rankedPaths: localizeRanked(rankTargets(orderedPaths(), weightsById, countsById)),
    itemConnections: {
      transits: buildItemConnections(markers, "transits", language),
      timeLords: buildItemConnections(markers, "timeLords", language),
      numerology: buildItemConnections(markers, "numerology", language),
    },
  }
}
