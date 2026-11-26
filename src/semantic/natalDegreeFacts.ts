import { getVarga, type BirthChart, type HydratedPlanet, type Sign } from "../astrology"
import { signedAngleDifference } from "../astrology/root-solver"

export const DEGREE_CLUSTER_RULES = { minMembers: 3, maxSpread: 2, aspectOrb: 2, perOtherMember: 1, maxBonus: 3 } as const

export interface KaabalisticDegreePosition {
  name: string;
  sign: Sign;
  degree: number;
}

export type KaabalisticDegreePattern =
  | { kind: "tSquare"; apex: string; opposition: readonly [string, string]; emptyArm: Pick<KaabalisticDegreePosition, "sign" | "degree"> }
  | { kind: "grandCross"; oppositions: readonly [readonly [string, string], readonly [string, string]] }

export interface KaabalisticDegreeCluster {
  members: readonly KaabalisticDegreePosition[];
  meanDegree: number;
  patterns: readonly KaabalisticDegreePattern[];
}

export interface KaabalisticCriticalDegree extends KaabalisticDegreePosition {
  kind: "body" | "angle";
  /** Integer part of the zero-based degree within the tropical sign. */
  criticalDegree: number;
}

type DegreeChart = { planets: readonly HydratedPlanet[]; houses: BirthChart["houses"] }
type Position = KaabalisticDegreePosition & { longitude: number; signIndex: number }

const PLANET_NAMES = new Set(["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"])
const EPS = 1e-10

function position(name: string, longitude: number): Position {
  const { sign, signIndex, degree } = getVarga(longitude, 1)
  return { name, sign, signIndex, degree, longitude }
}

function withinAspect(a: Position, b: Position, angle: number) {
  return Math.abs(Math.abs(signedAngleDifference(a.longitude - b.longitude)) - angle) <= DEGREE_CLUSTER_RULES.aspectOrb + EPS
}

function patternsIn(members: readonly Position[]): KaabalisticDegreePattern[] {
  const patterns = new Map<string, KaabalisticDegreePattern>()
  for (const [index, a] of members.entries()) {
    for (const b of members.slice(index + 1)) {
      if (!withinAspect(a, b, 180)) continue
      const opposition = [a.name, b.name] as const
      const apices = members.filter((candidate) => withinAspect(a, candidate, 90) && withinAspect(b, candidate, 90))
      for (const apex of apices) {
        const oppositeApices = apices.filter((candidate) => withinAspect(apex, candidate, 180))
        if (oppositeApices.length === 0) {
          const { sign, degree } = getVarga(apex.longitude + 180, 1)
          patterns.set(`t:${a.name}|${b.name}|${apex.name}`, { kind: "tSquare", apex: apex.name, opposition, emptyArm: { sign, degree } })
        }
        for (const opposite of oppositeApices) {
          const key = [a.name, b.name, apex.name, opposite.name].sort().join("|")
          patterns.set(key, { kind: "grandCross", oppositions: [opposition, [apex.name, opposite.name]] })
        }
      }
    }
  }
  return [...patterns.values()]
}

function clustersOf(positions: Position[]): KaabalisticDegreeCluster[] {
  const sorted = [...positions].sort((a, b) => a.degree - b.degree || a.name.localeCompare(b.name))
  return sorted.flatMap((first, index) => {
    const members = sorted.slice(index).filter((p) => p.degree - first.degree <= DEGREE_CLUSTER_RULES.maxSpread + EPS)
    const previous = sorted[index - 1]
    // Keep maximal windows. Adjacent groups can overlap without extending either group's spread.
    if (members.length < DEGREE_CLUSTER_RULES.minMembers ||
      (previous && members[members.length - 1].degree - previous.degree <= DEGREE_CLUSTER_RULES.maxSpread + EPS)) return []
    return [{
      members: members.map(({ name, sign, degree }) => ({ name, sign, degree })),
      meanDegree: members.reduce((sum, { degree }) => sum + degree, 0) / members.length,
      patterns: patternsIn(members),
    }]
  })
}

// 28-lunar-mansion critical-degree convention. A degree matches by its integer part
// within a tropical sign: e.g. the fixed entry 8 covers the interval [8, 9).
const CRITICAL_DEGREES_BY_MODALITY = [
  [0, 13, 26], // Aries, Cancer, Libra, Capricorn
  [8, 9, 21, 22], // Taurus, Leo, Scorpio, Aquarius
  [4, 17], // Gemini, Virgo, Sagittarius, Pisces
] as const

function criticalPositions(positions: Position[], kind: "body" | "angle"): KaabalisticCriticalDegree[] {
  return positions.flatMap(({ name, sign, degree, signIndex }) => {
    const criticalDegree = Math.floor(degree)
    const modality = signIndex % 3
    const degrees: readonly number[] = CRITICAL_DEGREES_BY_MODALITY[modality]
    return degrees.includes(criticalDegree) ? [{ kind, name, sign, degree, criticalDegree }] : []
  })
}

export function natalDegreeFacts(chart: DegreeChart) {
  const planets = new Map<string, Position>()
  for (const { name, longitude } of chart.planets) {
    const key = name.toLowerCase()
    if ((PLANET_NAMES.has(key) || key === "chiron") && Number.isFinite(longitude)) planets.set(key, position(name, longitude))
  }

  const { ascendant, mc, dc, ic, ascmc } = chart.houses
  const anglePositions = { ASC: ascendant, MC: mc, DC: dc, IC: ic, Vertex: ascmc?.vertex }
  const angles = Object.entries(anglePositions).flatMap(([name, row]) =>
    row && Number.isFinite(row.longitude) ? [position(name, row.longitude)] : [])
  return {
    degreeClusters: clustersOf([...planets.values()].filter((row) => PLANET_NAMES.has(row.name.toLowerCase()))),
    criticalDegrees: [...criticalPositions([...planets.values()], "body"), ...criticalPositions(angles, "angle")],
  }
}
