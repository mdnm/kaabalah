import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { HouseSystem, SIGNS, closeSwissEph, getSwissEph, getTransitChart } from "../astrology"
import { KaabalahTypes, SPHERES, id } from "../core"
import {
  KAABALISTIC_CYCLE_WEIGHTS,
  KAABALISTIC_MARKER_WEIGHTS,
  buildCycleMapData,
  getCycleTreeMarkers,
  type CycleTimeLordsInput,
  type CycleTransitAspectInput,
  type KaabalisticCycleMapData,
} from "./index"

const sphere = (name: string) => id(KaabalahTypes.SPHERE, name)
const path = (number: number) => id(KaabalahTypes.PATH, number)

const edge = (planetA: string, aspect: string, planetB: string, orb = 0): CycleTransitAspectInput => ({
  planetA,
  planetB,
  aspect,
  orb,
})

function shareSum(data: KaabalisticCycleMapData, type: "sphere" | "path") {
  return Object.entries(data.weightsById)
    .filter(([targetId]) => targetId.startsWith(`${type}:`))
    .reduce((sum, [, entry]) => sum + (entry?.total ?? 0), 0)
}

describe("KAABALISTIC_CYCLE_WEIGHTS", () => {
  it("holds the proposed table", () => {
    expect(KAABALISTIC_CYCLE_WEIGHTS).toEqual({
      transit: {
        aspects: ["conjunction", "sextile", "square", "trine", "opposition"],
        maxOrb: 1,
        timeLordFactor: 2,
        skyBodies: ["Moon"],
        skyFactor: 0.5,
      },
      timeLords: { firdariaMajor: 2, firdariaSub: 1, profection: 2, mahaDasha: 2, antarDasha: 1 },
      numerology: { personalDay: 4, personalMonth: 3, personalYear: 2, intermediateStep: 1 },
      systemShares: { transits: 60, timeLords: 20, numerology: 20 },
    })
  })
})

describe("transit aspects", () => {
  const aspectOnly = (input: Parameters<typeof getCycleTreeMarkers>[0]) =>
    getCycleTreeMarkers(input).filter((marker) => marker.cycleSource === "transit-aspect")

  it("lights the sphere of the aspect and weighs an exact aspect over a wide one", () => {
    const [exact, half, wide] = aspectOnly({
      transitAspects: [
        edge("saturn", "square", "moon", 0),
        edge("saturn", "square", "moon", 0.5),
        edge("saturn", "square", "moon", 1),
      ],
    })

    expect(exact).toMatchObject({
      kind: "astrology",
      system: "transits",
      cycleSource: "transit-aspect",
      sourceType: "aspect",
      mapping: "aspect-sphere",
      targetId: sphere(SPHERES.GEBURAH),
      sourceName: "transit Saturn square natal Moon",
      label: "□",
      timeLord: false,
    })
    // Tightness 3 times (Saturn 2 + Moon 5) over 10, tightness 2 at half a degree and 1 at maxOrb.
    expect(exact.weight).toBe(2.1)
    expect(half.weight).toBe(1.4)
    expect(wide.weight).toBe(0.7)
    expect(exact.weight).toBeGreaterThan(wide.weight)
  })

  it("also lights the sphere of the natal planet, at the same weight", () => {
    const markers = getCycleTreeMarkers({ transitAspects: [edge("jupiter", "trine", "sun", 0.5)] })

    expect(markers).toHaveLength(3)
    const [aspect, natal] = markers
    expect(aspect).toMatchObject({ cycleSource: "transit-aspect", targetId: sphere(SPHERES.NETZACH), mapping: "aspect-sphere" })
    expect(natal).toMatchObject({
      kind: "astrology",
      system: "transits",
      cycleSource: "transit-natal-sphere",
      sourceType: "aspect",
      mapping: "carrier-sphere",
      targetId: sphere(SPHERES.TIPHARETH),
      targetType: "sphere",
      sourceName: "transit Jupiter trine natal Sun",
      planet: "Sun",
      timeLord: false,
    })
    // Tightness 2 times (Jupiter 2 + Sun 5) over 10, on both.
    expect(aspect.weight).toBe(1.4)
    expect(natal.weight).toBe(aspect.weight)

    const data = buildCycleMapData({ transitAspects: [edge("jupiter", "trine", "sun", 0.5)] })
    expect(data.rawWeightsById[sphere(SPHERES.TIPHARETH)]?.transits).toBe(1.4)
    expect(data.rawWeightsById[sphere(SPHERES.NETZACH)]?.transits).toBe(1.4)
    expect(data.rankedSpheres.map((row) => row.name)).toEqual(["Tiphareth", "Netzach"])
  })

  it("also lights the path of the natal planet, at the aspect's weight", () => {
    const input = { transitAspects: [edge("jupiter", "trine", "sun", 0.5)] }
    const markers = getCycleTreeMarkers(input)
    const natalPath = markers.filter((marker) => marker.cycleSource === "transit-natal-path")

    expect(natalPath).toHaveLength(1)
    expect(natalPath[0]).toMatchObject({
      kind: "astrology",
      system: "transits",
      sourceType: "aspect",
      mapping: "planet-sign-path",
      targetId: path(22),
      targetType: "path",
      sourceName: "transit Jupiter trine natal Sun",
      planet: "Sun",
      weight: aspectOnly(input)[0].weight,
      timeLord: false,
    })
    expect(natalPath[0].weight).toBe(1.4)

    const data = buildCycleMapData(input)
    expect(data.rawWeightsById[path(22)]).toEqual({ transits: 1.4, timeLords: 0, numerology: 0, total: 1.4 })
    expect(data.rankedPaths).toEqual([{ id: path(22), name: "Path 22", share: 100, count: 0 }])
    expect(data.countsById[path(22)]).toBeUndefined()

    const doubled = getCycleTreeMarkers({ ...input, timeLords: { profection: "Sun" } })
      .filter((marker) => marker.sourceType === "aspect")
    expect(doubled.map((marker) => marker.weight)).toEqual([2.8, 2.8, 2.8])
    expect(doubled.every((marker) => marker.timeLord)).toBe(true)
  })

  it("lights the path of each classical planet and none for the other natal points", () => {
    const natalPaths = (natal: string) =>
      getCycleTreeMarkers({ transitAspects: [edge("saturn", "square", natal)] })
        .filter((marker) => marker.targetType === "path")
        .map((marker) => marker.targetId)

    expect(natalPaths("sun")).toEqual([path(22)])
    expect(natalPaths("moon")).toEqual([path(2)])
    expect(natalPaths("mercury")).toEqual([path(17)])
    expect(natalPaths("venus")).toEqual([path(3)])
    expect(natalPaths("mars")).toEqual([path(11)])
    expect(natalPaths("jupiter")).toEqual([path(4)])
    expect(natalPaths("saturn")).toEqual([path(20)])
    for (const point of ["uranus", "neptune", "pluto", "ascendant", "mc", "mean node", "lilith mean", "chiron"]) {
      expect(natalPaths(point)).toEqual([])
    }
    expect(buildCycleMapData({ transitAspects: [edge("saturn", "square", "uranus")] }).rankedPaths).toEqual([])
  })

  it("keeps path shares at 100, apart from the spheres", () => {
    const data = buildCycleMapData({
      transitAspects: [edge("saturn", "square", "moon", 0), edge("jupiter", "trine", "sun", 0.5), edge("mars", "sextile", "uranus", 0.2)],
      transitPlacements: [{ name: "Moon", sign: "Pisces" }],
      numerology: { personalDay: 7 },
    })
    const paths = Object.entries(data.weightsById).filter(([targetId]) => targetId.startsWith("path:"))

    expect(shareSum(data, "path")).toBeCloseTo(100, 1)
    expect(shareSum(data, "sphere")).toBeCloseTo(100, 1)
    // Transits 75 and numerology 25 on the paths, no time lord lights one.
    expect(paths.reduce((sum, [, entry]) => sum + entry!.transits, 0)).toBeCloseTo(75, 1)
    expect(paths.reduce((sum, [, entry]) => sum + entry!.numerology, 0)).toBeCloseTo(25, 1)
    expect(data.weightsById[path(2)]!.transits).toBeGreaterThan(data.weightsById[path(22)]!.transits)
  })

  it("resolves each natal point to the sphere it carries, or to none", () => {
    const natalSphere = (natal: string) =>
      getCycleTreeMarkers({ transitAspects: [edge("saturn", "square", natal)] })
        .filter((marker) => marker.cycleSource === "transit-natal-sphere")
        .map((marker) => marker.targetId)

    expect(natalSphere("sun")).toEqual([sphere(SPHERES.TIPHARETH)])
    expect(natalSphere("moon")).toEqual([sphere(SPHERES.YESOD)])
    expect(natalSphere("mercury")).toEqual([sphere(SPHERES.HOD)])
    expect(natalSphere("venus")).toEqual([sphere(SPHERES.NETZACH)])
    expect(natalSphere("mars")).toEqual([sphere(SPHERES.GEBURAH)])
    expect(natalSphere("jupiter")).toEqual([sphere(SPHERES.CHESED)])
    expect(natalSphere("saturn")).toEqual([sphere(SPHERES.BINAH)])
    expect(natalSphere("uranus")).toEqual([sphere(SPHERES.CHOKHMAH)])
    expect(natalSphere("neptune")).toEqual([sphere(SPHERES.KETHER)])
    expect(natalSphere("pluto")).toEqual([sphere(SPHERES.DAATH)])
    expect(natalSphere("ascendant")).toEqual([sphere(SPHERES.MALKUTH)])
    for (const point of ["mc", "mean node", "lilith mean", "chiron", "pars fortunae"]) {
      expect(natalSphere(point)).toEqual([])
      expect(aspectOnly({ transitAspects: [edge("saturn", "square", point)] })).toHaveLength(1)
    }
  })

  it("counts only the five major aspects", () => {
    expect(KAABALISTIC_CYCLE_WEIGHTS.transit.aspects).toEqual(["conjunction", "sextile", "square", "trine", "opposition"])
    for (const minor of ["quincunx", "duodecile", "octile", "trioctile", "quintile"]) {
      expect(getCycleTreeMarkers({ transitAspects: [edge("mars", minor, "sun", 0.2)] })).toEqual([])
    }
    for (const major of KAABALISTIC_CYCLE_WEIGHTS.transit.aspects) {
      expect(aspectOnly({ transitAspects: [edge("mars", major, "sun", 0.2)] })).toHaveLength(1)
    }
  })

  it("gives no marker to an aspect wider than maxOrb, whatever the aspect's natal orb", () => {
    expect(KAABALISTIC_CYCLE_WEIGHTS.transit.maxOrb).toBe(1)
    expect(getCycleTreeMarkers({
      transitAspects: [
        edge("saturn", "square", "moon", 1.5),
        edge("sun", "conjunction", "sun", 1.01),
        edge("mars", "trine", "venus", Number.NaN),
      ],
    })).toEqual([])
    expect(aspectOnly({ transitAspects: [edge("sun", "conjunction", "sun", 1)] })).toHaveLength(1)
  })

  it("names angles by their label and skips True Node and Lilith True", () => {
    const markers = getCycleTreeMarkers({
      transitAspects: [
        edge("jupiter", "trine", "ascendant"),
        edge("true node", "trine", "sun"),
        edge("mars", "square", "lilith true"),
      ],
    })

    expect(markers.map(({ sourceName, targetId }) => ({ sourceName, targetId }))).toEqual([
      { sourceName: "transit Jupiter trine natal ASC", targetId: sphere(SPHERES.NETZACH) },
      { sourceName: "transit Jupiter trine natal ASC", targetId: sphere(SPHERES.MALKUTH) },
    ])
  })

  it("doubles both markers once when a body is a time lord, even in two systems or on both sides", () => {
    const transitAspects = [edge("saturn", "square", "moon")]
    const pair = (timeLords?: CycleTimeLordsInput) =>
      getCycleTreeMarkers({ transitAspects, timeLords }).filter((marker) => marker.sourceType === "aspect")
    const expectPair = (timeLords: CycleTimeLordsInput | undefined, weight: number, timeLord: boolean) => {
      const markers = pair(timeLords)
      expect(markers.map((marker) => marker.cycleSource)).toEqual(["transit-aspect", "transit-natal-sphere", "transit-natal-path"])
      expect(markers.map((marker) => marker.targetId)).toEqual([sphere(SPHERES.GEBURAH), sphere(SPHERES.YESOD), path(2)])
      for (const marker of markers) expect(marker).toMatchObject({ weight, timeLord })
    }

    expectPair(undefined, 2.1, false)
    expectPair({ firdariaMajor: "Venus" }, 2.1, false)
    expectPair({ firdariaMajor: "Saturn" }, 4.2, true)
    // Saturn rules the firdaria and the maha dasha: still one factor.
    expectPair({ firdariaMajor: "Saturn", mahaDasha: "saturn" }, 4.2, true)
    // Both bodies are lords: still one factor.
    expectPair({ firdariaSub: "Saturn", profection: "Moon", antarDasha: "moon" }, 4.2, true)
  })

  it("lets a node lord amplify aspects of the Mean Node", () => {
    for (const lord of ["rahu", "ketu", "NorthNode", "SouthNode"]) {
      const markers = getCycleTreeMarkers({
        transitAspects: [edge("mean node", "conjunction", "sun")],
        timeLords: { mahaDasha: lord },
      })
      // Tightness 3 times (node 1 + Sun 5) over 10, doubled, on Kether, on Tiphareth and on Path 22.
      expect(markers.map((marker) => marker.targetId)).toEqual([sphere(SPHERES.KETHER), sphere(SPHERES.TIPHARETH), path(22)])
      for (const marker of markers) expect(marker).toMatchObject({ weight: 3.6, timeLord: true })
    }
  })

  it("adds the markers of one sphere with no cap and counts an aspect once", () => {
    const squares = ["sun", "moon", "mercury", "venus", "mars"].map((natal) => edge("saturn", "square", natal))
    const data = buildCycleMapData({ transitAspects: squares })

    // Tightness 3 times (2+5, 2+5, 2+4, 2+4, 2+4) over 10, plus the 1.8 of natal Mars, whose sphere is Geburah too.
    expect(data.rawWeightsById[sphere(SPHERES.GEBURAH)]).toEqual({
      transits: 11.4,
      timeLords: 0,
      numerology: 0,
      total: 11.4,
    })
    expect(data.rawWeightsById[sphere(SPHERES.TIPHARETH)]?.transits).toBe(2.1)
    expect(data.sphereMarkers[sphere(SPHERES.GEBURAH)]).toHaveLength(6)
    // Five aspects, counted on the aspect's sphere only.
    expect(data.countsById[sphere(SPHERES.GEBURAH)]?.transits).toBe(5)
    expect(data.countsById[sphere(SPHERES.TIPHARETH)]).toBeUndefined()
    expect(Object.values(data.countsById).reduce((sum, entry) => sum + (entry?.total ?? 0), 0)).toBe(5)
    expect(data.rankedSpheres[0]).toEqual({ id: sphere(SPHERES.GEBURAH), name: "Geburah", share: 59.38, count: 5 })
    expect(data.rankedSpheres.find((row) => row.name === "Tiphareth")).toMatchObject({ count: 0 })
  })
})

describe("transit placements", () => {
  it("lights what a natal Moon lights at half its weight, with the decan when the degree is known", () => {
    const markers = getCycleTreeMarkers({
      transitPlacements: {
        moon: { name: "Moon", zodiacPosition: { sign: "Aries", decimalDegrees: 12 }, retrograde: false },
      },
    })
    const moonWeight = KAABALISTIC_MARKER_WEIGHTS.astrology.placement.Moon * KAABALISTIC_CYCLE_WEIGHTS.transit.skyFactor

    expect(markers.every((marker) => marker.sourceName === "transit Moon")).toBe(true)
    expect(markers.every((marker) => marker.system === "transits" && marker.cycleSource === "transit-placement")).toBe(true)
    expect(markers.every((marker) => marker.retrograde === false && marker.sign === "Aries")).toBe(true)
    expect(markers.find((marker) => marker.mapping === "carrier-sphere")).toMatchObject({
      targetId: sphere(SPHERES.YESOD),
      weight: moonWeight,
    })
    expect(markers.find((marker) => marker.mapping === "sign-sphere")).toMatchObject({
      targetId: sphere(SPHERES.GEBURAH),
      weight: moonWeight,
    })
    expect(markers.find((marker) => marker.mapping === "planet-sign-path")).toMatchObject({ weight: moonWeight })
    // Cardinal sign, second decan.
    expect(markers.find((marker) => marker.mapping === "decan-sphere")).toMatchObject({
      targetId: sphere(SPHERES.BINAH),
      weight: moonWeight * KAABALISTIC_MARKER_WEIGHTS.astrology.decanFactor,
    })
  })

  it("gives placement markers to the Moon only", () => {
    expect(KAABALISTIC_CYCLE_WEIGHTS.transit.skyBodies).toEqual(["Moon"])
    const position = (sign: string) => ({ zodiacPosition: { sign, decimalDegrees: 3 }, retrograde: false })
    const others = {
      sun: { name: "Sun", ...position("Scorpio") },
      mercury: { name: "Mercury", ...position("Scorpio") },
      saturn: { name: "Saturn", ...position("Aries") },
      pluto: { name: "Pluto", ...position("Aquarius") },
      "mean node": { name: "Mean Node", ...position("Aquarius") },
      "true node": { name: "True Node", ...position("Aquarius") },
      chiron: { name: "Chiron", ...position("Aries") },
    }

    expect(getCycleTreeMarkers({ transitPlacements: others })).toEqual([])

    const markers = getCycleTreeMarkers({
      transitPlacements: { ...others, moon: { name: "Moon", ...position("Pisces") } },
    })
    expect(markers.length).toBeGreaterThan(0)
    expect(new Set(markers.map((marker) => marker.sourceName))).toEqual(new Set(["transit Moon"]))
  })

  it("accepts a list with a flat sign", () => {
    const markers = getCycleTreeMarkers({ transitPlacements: [{ name: "moon", sign: "Cancer", retrograde: false }] })

    expect(markers.some((marker) => marker.targetId === sphere(SPHERES.YESOD) && marker.weight === 2.5)).toBe(true)
    expect(markers.some((marker) => marker.mapping === "decan-sphere")).toBe(false)
  })
})

describe("time lords", () => {
  it("lights the sphere of each lord with the weight of its role", () => {
    const markers = getCycleTreeMarkers({
      timeLords: {
        firdariaMajor: "Venus",
        firdariaSub: "Saturn",
        profection: "Mars",
        mahaDasha: "jupiter",
        antarDasha: "venus",
      },
    })

    expect(markers.map(({ sourceName, targetId, weight, cycleSource }) => ({ sourceName, targetId, weight, cycleSource }))).toEqual([
      { sourceName: "firdaria lord Venus", targetId: sphere(SPHERES.NETZACH), weight: 2, cycleSource: "firdaria-major" },
      { sourceName: "firdaria sub lord Saturn", targetId: sphere(SPHERES.BINAH), weight: 1, cycleSource: "firdaria-sub" },
      { sourceName: "profection lord Mars", targetId: sphere(SPHERES.GEBURAH), weight: 2, cycleSource: "profection" },
      { sourceName: "maha dasha lord Jupiter", targetId: sphere(SPHERES.CHESED), weight: 2, cycleSource: "maha-dasha" },
      { sourceName: "antar dasha lord Venus", targetId: sphere(SPHERES.NETZACH), weight: 1, cycleSource: "antar-dasha" },
    ])
    expect(markers.every((marker) => marker.system === "timeLords" && marker.mapping === "carrier-sphere")).toBe(true)

    const data = buildCycleMapData({ timeLords: { firdariaMajor: "Venus", antarDasha: "venus" } })
    expect(data.rawWeightsById[sphere(SPHERES.NETZACH)]?.timeLords).toBe(3)
    expect(data.rankedPaths).toEqual([])
  })

  it("resolves Rahu and Ketu through the sign of the natal node", () => {
    const markers = getCycleTreeMarkers({
      timeLords: { mahaDasha: "rahu", antarDasha: "ketu", northNodeSign: "Aries" },
    })
    const rahu = markers.filter((marker) => marker.cycleSource === "maha-dasha")
    const ketu = markers.filter((marker) => marker.cycleSource === "antar-dasha")

    // Aries lights Geburah; the South Node sits opposite, in Libra, which lights Netzach and Tiphareth.
    expect(rahu).toHaveLength(1)
    expect(rahu[0]).toMatchObject({
      sourceName: "maha dasha lord Rahu",
      sourceType: "node",
      mapping: "sign-sphere",
      targetId: sphere(SPHERES.GEBURAH),
      sign: "Aries",
      weight: 2,
      label: "☊",
    })
    expect(ketu.map((marker) => marker.targetId)).toEqual([sphere(SPHERES.NETZACH), sphere(SPHERES.TIPHARETH)])
    for (const marker of ketu) {
      expect(marker).toMatchObject({
        sourceName: "antar dasha lord Ketu",
        sourceType: "node",
        mapping: "sign-sphere",
        sign: "Libra",
        weight: 1,
        label: "☋",
      })
    }
  })

  it("resolves the firdaria nodes in every sign, and lights nothing without the node sign", () => {
    for (const sign of SIGNS) {
      const markers = getCycleTreeMarkers({
        timeLords: { firdariaMajor: "NorthNode", firdariaSub: "SouthNode", northNodeSign: sign },
      })
      expect(markers.filter((marker) => marker.cycleSource === "firdaria-major").length).toBeGreaterThan(0)
      expect(markers.filter((marker) => marker.cycleSource === "firdaria-sub").length).toBeGreaterThan(0)
      expect(markers.every((marker) => marker.targetType === "sphere")).toBe(true)
      expect(markers[0].sourceName).toBe("firdaria lord North Node")
    }

    expect(getCycleTreeMarkers({ timeLords: { firdariaMajor: "NorthNode", mahaDasha: "ketu" } })).toEqual([])
  })
})

describe("cycle numerology", () => {
  it("weighs personal day, month and year like the birth map weighs the birth date", () => {
    const data = buildCycleMapData({ numerology: { personalDay: 7, personalMonth: 3, personalYear: 1 } })

    expect(data.rawWeightsById[sphere(SPHERES.NETZACH)]?.numerology).toBe(4)
    expect(data.rawWeightsById[sphere(SPHERES.BINAH)]?.numerology).toBe(3)
    expect(data.rawWeightsById[sphere(SPHERES.KETHER)]?.numerology).toBe(2)
    expect(data.rawWeightsById[path(7)]?.numerology).toBe(4)
    expect(data.markers.map((marker) => marker.sourceName)).toEqual([
      "Personal Day", "Personal Day", "Personal Month", "Personal Month", "Personal Year", "Personal Year",
    ])
  })

  it("renormalizes to 100 when numerology is the only system", () => {
    const data = buildCycleMapData({ numerology: { personalDay: 7, personalMonth: 3, personalYear: 1 } })

    expect(data.rankedSpheres.map(({ name, share }) => ({ name, share }))).toEqual([
      { name: "Netzach", share: 44.44 },
      { name: "Binah", share: 33.33 },
      { name: "Kether", share: 22.22 },
    ])
    for (const entry of Object.values(data.weightsById)) {
      expect(entry).toMatchObject({ transits: 0, timeLords: 0, numerology: entry!.total })
    }
    expect(shareSum(data, "sphere")).toBeCloseTo(100, 1)
    expect(shareSum(data, "path")).toBeCloseTo(100, 1)
  })

  it("takes the ReducedNumber of a snapshot, intermediate steps at the step weight", () => {
    const data = buildCycleMapData({
      numerology: { personalDay: { value: 2, reductionSteps: [29, 11, 2] }, personalYear: { value: 9 }, personalMonth: null },
    })

    expect(data.rawWeightsById[sphere(SPHERES.CHOKHMAH)]?.numerology).toBe(4)
    expect(data.rawWeightsById[sphere(SPHERES.DAATH)]?.numerology).toBe(1)
    expect(data.rawWeightsById[sphere(SPHERES.YESOD)]?.numerology).toBe(2)
  })
})

describe("buildCycleMapData", () => {
  const full = {
    transitAspects: [
      edge("saturn", "square", "moon", 0.4),
      edge("jupiter", "trine", "sun", 0.8),
      edge("mars", "opposition", "venus", 1),
      edge("venus", "sextile", "mc", 0.1),
      edge("sun", "conjunction", "mercury", 4),
      edge("mars", "quincunx", "sun", 0.1),
    ],
    transitPlacements: [
      { name: "Sun", zodiacPosition: { sign: "Scorpio", decimalDegrees: 28 }, retrograde: false },
      { name: "Moon", zodiacPosition: { sign: "Pisces", decimalDegrees: 4 }, retrograde: false },
      { name: "Saturn", zodiacPosition: { sign: "Aries", decimalDegrees: 6 }, retrograde: true },
    ],
    timeLords: { firdariaMajor: "Venus", firdariaSub: "Saturn", profection: "Mars", mahaDasha: "rahu", northNodeSign: "Leo" },
    numerology: { personalDay: 7, personalMonth: 3, personalYear: 1 },
  }

  it("normalizes spheres and paths to 100 with the system shares", () => {
    const data = buildCycleMapData(full)
    const systemTotal = (system: "transits" | "timeLords" | "numerology", type: "sphere" | "path") =>
      Object.entries(data.weightsById)
        .filter(([targetId]) => targetId.startsWith(`${type}:`))
        .reduce((sum, [, entry]) => sum + (entry?.[system] ?? 0), 0)

    expect(Math.abs(shareSum(data, "sphere") - 100)).toBeLessThan(0.2)
    expect(Math.abs(shareSum(data, "path") - 100)).toBeLessThan(0.2)
    expect(systemTotal("transits", "sphere")).toBeCloseTo(60, 0)
    expect(systemTotal("timeLords", "sphere")).toBeCloseTo(20, 0)
    expect(systemTotal("numerology", "sphere")).toBeCloseTo(20, 0)
    // No time lord lights a path, so the Moon's placement and numerology share the paths 75 to 25.
    expect(systemTotal("timeLords", "path")).toBe(0)
    expect(systemTotal("transits", "path")).toBeCloseTo(75, 0)
    expect(systemTotal("numerology", "path")).toBeCloseTo(25, 0)
    expect(data.markers.filter((marker) => marker.cycleSource === "transit-aspect")).toHaveLength(4)
    // The MC has no sphere of its own.
    expect(data.markers.filter((marker) => marker.cycleSource === "transit-natal-sphere")).toHaveLength(3)
    expect(data.markers.filter((marker) => marker.cycleSource === "transit-natal-path").map((marker) => marker.targetId))
      .toEqual([path(2), path(22), path(3)])
  })

  it("mirrors the birth map fields and ranks heaviest first", () => {
    const data = buildCycleMapData(full)

    expect(data.spheres).toHaveLength(11)
    expect(data.paths).toHaveLength(22)
    expect(data.rankedSpheres.length).toBeGreaterThan(3)
    expect(data.rankedSpheres.map((row) => row.share)).toEqual(
      [...data.rankedSpheres.map((row) => row.share)].sort((a, b) => b - a)
    )
    for (const row of data.rankedSpheres) {
      expect(row.share).toBe(data.weightsById[row.id]?.total)
      expect(row.count).toBe(
        (data.sphereMarkers[row.id as keyof typeof data.sphereMarkers] ?? [])
          .filter((marker) => marker.cycleSource !== "transit-natal-sphere").length
      )
    }
    expect(Object.values(data.sphereMarkers).flat().length + Object.values(data.pathMarkers).flat().length)
      .toBe(data.markers.length)
    expect(data.itemConnections.transits.map((row) => row.itemLabel)).toContain("transit Moon in Pisces")
    expect(data.itemConnections.transits.map((row) => row.itemLabel)).toContain("transit Saturn square natal Moon")
    expect(data.itemConnections.timeLords.map((row) => row.itemLabel)).toContain("maha dasha lord Rahu")
    expect(data.itemConnections.numerology).toEqual([
      { itemLabel: "Personal Day", targets: [
        { id: sphere(SPHERES.NETZACH), type: "sphere", name: "Netzach", count: 1 },
        { id: path(7), type: "path", name: "Path 7", count: 1 },
      ] },
      { itemLabel: "Personal Month", targets: [
        { id: sphere(SPHERES.BINAH), type: "sphere", name: "Binah", count: 1 },
        { id: path(3), type: "path", name: "Path 3", count: 1 },
      ] },
      { itemLabel: "Personal Year", targets: [
        { id: sphere(SPHERES.KETHER), type: "sphere", name: "Kether", count: 1 },
        { id: path(1), type: "path", name: "Path 1", count: 1 },
      ] },
    ])
  })

  it("returns empty data for an empty input without throwing", () => {
    for (const input of [undefined, {}, { transitAspects: [], transitPlacements: {}, timeLords: {}, numerology: {} }, {
      transitAspects: null, transitPlacements: null, timeLords: null, numerology: null,
    }]) {
      const data = buildCycleMapData(input)
      expect(data.markers).toEqual([])
      expect(data.weightsById).toEqual({})
      expect(data.rawWeightsById).toEqual({})
      expect(data.countsById).toEqual({})
      expect(data.rankedSpheres).toEqual([])
      expect(data.rankedPaths).toEqual([])
      expect(data.itemConnections).toEqual({ transits: [], timeLords: [], numerology: [] })
      expect(data.spheres).toHaveLength(11)
    }
    expect(getCycleTreeMarkers()).toEqual([])
  })

  it("localizes source names in Portuguese and leaves targets and weights unchanged", () => {
    const en = buildCycleMapData(full)
    const pt = buildCycleMapData(full, "pt-BR")
    const names = pt.markers.map((marker) => marker.sourceName)

    expect(names).toContain("Saturno em trânsito quadratura Lua natal")
    expect(names).toContain("Lua em trânsito")
    expect(names).toContain("Vênus, regente da firdária")
    expect(names).toContain("Saturno, sub-regente da firdária")
    expect(names).toContain("Marte, regente da profecção anual")
    expect(names).toContain("Rahu, regente do maha dasha")
    expect(names).toContain("Dia pessoal")
    expect(pt.itemConnections.transits.map((row) => row.itemLabel)).toContain("Lua em trânsito em Peixes")
    expect(pt.itemConnections.numerology[0].targets[1].name).toBe("Caminho 7")
    expect(pt.markers.map(({ sourceName, ...marker }) => marker)).toEqual(en.markers.map(({ sourceName, ...marker }) => marker))
    expect(pt.weightsById).toEqual(en.weightsById)
    expect(pt.rankedPaths.every((row) => row.name.startsWith("Caminho "))).toBe(true)
    expect(names.join(" ")).not.toContain("—")
  })
})

describe("a real transit chart", () => {
  beforeAll(async () => {
    await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH })
  })
  afterAll(() => closeSwissEph())

  it("feeds its aspects and transit planets straight into the cycle map", async () => {
    const transit = await getTransitChart({
      natal: {
        date: new Date("1990-05-15T14:30:00Z"),
        latitude: -23.55,
        longitude: -46.63,
        houseSystem: HouseSystem.PLACIDUS,
        timeZoneSettings: { utcOffsetMinutes: 0 },
      },
      transitDate: new Date("2026-11-20T15:00:00Z"),
    })
    const data = buildCycleMapData({
      transitAspects: transit.aspects,
      transitPlacements: transit.transitPlanets,
      timeLords: { northNodeSign: transit.natalChart.planets["mean node"].zodiacPosition.sign, mahaDasha: "rahu" },
    })
    const excluded = (name: string) => name === "true node" || name === "lilith true"
    const { maxOrb, aspects: majors } = KAABALISTIC_CYCLE_WEIGHTS.transit
    const aspectMarkers = data.markers.filter((marker) => marker.cycleSource === "transit-aspect")
    const placementNames = new Set(
      data.markers.filter((marker) => marker.cycleSource === "transit-placement").map((marker) => marker.sourceName)
    )

    expect(transit.aspects.some((aspect) => aspect.orb > maxOrb)).toBe(true)
    expect(transit.aspects.some((aspect) => aspect.orb <= maxOrb && !majors.includes(aspect.aspect))).toBe(true)
    expect(aspectMarkers.length).toBeGreaterThan(3)
    expect(aspectMarkers).toHaveLength(
      transit.aspects.filter((aspect) =>
        majors.includes(aspect.aspect) && aspect.orb <= maxOrb && !excluded(aspect.planetA) && !excluded(aspect.planetB)
      ).length
    )
    const natalMarkers = data.markers.filter((marker) => marker.cycleSource === "transit-natal-sphere")
    expect(natalMarkers.length).toBeGreaterThan(0)
    for (const natal of natalMarkers) {
      const aspect = aspectMarkers.find((marker) => marker.sourceName === natal.sourceName)!
      expect(natal).toMatchObject({ weight: aspect.weight, timeLord: aspect.timeLord, targetType: "sphere" })
    }
    expect(aspectMarkers.every((marker) => marker.sourceName.startsWith("transit ") && marker.sourceName.includes(" natal "))).toBe(true)
    expect(aspectMarkers.every((marker) => marker.weight > 0)).toBe(true)
    expect(aspectMarkers.some((marker) => marker.timeLord)).toBe(true)
    expect(Object.keys(transit.transitPlanets).length).toBeGreaterThan(9)
    expect([...placementNames]).toEqual(["transit Moon"])
    expect(data.markers.some((marker) => marker.mapping === "decan-sphere")).toBe(true)
    expect(data.markers.some((marker) => marker.retrograde === false)).toBe(true)
    expect(data.markers.some((marker) => marker.cycleSource === "maha-dasha")).toBe(true)
    expect(Math.abs(shareSum(data, "sphere") - 100)).toBeLessThan(0.2)
    expect(Math.abs(shareSum(data, "path") - 100)).toBeLessThan(0.2)
    for (const entry of Object.values(data.rawWeightsById)) {
      expect(entry!.total).toBeGreaterThan(0)
    }
  })
})
