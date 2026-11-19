import { describe, expect, it } from "vitest"

import {
  Planet,
  SIGNS,
  VirtualNodes,
  type AspectEdge,
  type AspectName,
  type BirthChart,
  type HydratedNode,
  type HydratedPlanet,
  type ZodiacPosition,
} from "../astrology"
import {
  KaabalahTypes,
  SPHERES,
  id,
} from "../core"
import {
  KAABALISTIC_MARKER_WEIGHTS,
  buildKaabalisticMapData,
  getAstrologyTreeMarkers,
  getGematriaTreeMarkers,
  getKaabalisticCorrespondenceTargets,
  getNumerologyTreeMarkers,
  getPlanetSymbolMetadata,
  type KaabalisticMarkerDescriptor,
} from "./index"

function sphere(name: string) {
  return id(KaabalahTypes.SPHERE, name)
}

function makeEdge(planetA: string, planetB: string, aspect: AspectName, orb: number): AspectEdge {
  const angles: Record<AspectName, number> = {
    conjunction: 0,
    duodecile: 30,
    octile: 45,
    sextile: 60,
    square: 90,
    trine: 120,
    trioctile: 135,
    quincunx: 150,
    opposition: 180,
  }

  return {
    planetA,
    planetB,
    longitudeA: 0,
    longitudeB: angles[aspect] + orb,
    aspect,
    aspectAngle: angles[aspect],
    delta: angles[aspect] + orb,
    orb,
  }
}

function singlePlanetChart(
  name: string,
  planetId: Planet,
  sign: string,
  degreeInSign: number,
  aspects: AspectEdge[] = []
) {
  const signIndex = SIGNS.indexOf(sign as (typeof SIGNS)[number])
  return {
    planets: [makePlanet(planetId, name, sign, signIndex * 30 + degreeInSign, 1)],
    houses: makeHouses(),
    aspects,
  }
}

function weightsOf(markers: readonly KaabalisticMarkerDescriptor[]) {
  return [...new Set(markers.map((marker) => marker.weight))].sort((a, b) => a - b)
}

function makeZodiacPosition(
  sign: string,
  longitude: number,
  house: number
): ZodiacPosition {
  const decimalDegrees = longitude % 30

  return {
    sign,
    decimalDegrees,
    traditionalFormat: `${Math.floor(decimalDegrees)}°00'`,
    decimal: `${decimalDegrees.toFixed(2)}°`,
    longitude,
    house,
  }
}

function makePlanet(
  idValue: Planet,
  name: string,
  sign: string,
  longitude: number,
  house: number
): HydratedPlanet {
  return {
    id: idValue,
    name,
    longitude,
    latitude: 0,
    distance: 1,
    zodiacPosition: makeZodiacPosition(sign, longitude, house),
  }
}

function makeNode(
  idValue: VirtualNodes,
  name: string,
  sign: string,
  longitude: number,
  house: number
): HydratedNode {
  return {
    ...makeZodiacPosition(sign, longitude, house),
    id: idValue,
    name,
  }
}

function makeHouses(): BirthChart["houses"] {
  return {
    ascendant: makeZodiacPosition("Aries", 10, 1),
    mc: makeZodiacPosition("Capricorn", 280, 10),
    dc: makeZodiacPosition("Libra", 190, 7),
    ic: makeZodiacPosition("Cancer", 100, 4),
    houses: SIGNS.map((sign, index) => makeZodiacPosition(sign, index * 30 + 10, index + 1)),
    ascmc: {
      vertex: makeZodiacPosition("Gemini", 70, 3),
    },
  }
}

describe("kaabalistic semantic helpers", () => {
  it("returns canonical sign targets and symbol metadata without app-local traversal", () => {
    const result = getKaabalisticCorrespondenceTargets({
      kind: "sign",
      sign: "Libra",
    })

    expect(getPlanetSymbolMetadata("Sun")).toMatchObject({
      label: "Sun",
      glyph: "☉",
    })
    expect(result?.source).toMatchObject({
      kind: "sign",
      label: "Libra",
      glyph: "♎",
    })
    expect(result?.targets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          targetId: id(KaabalahTypes.SPHERE, SPHERES.NETZACH),
          targetType: "sphere",
          mapping: "sign-sphere",
          sign: "Libra",
        }),
        expect.objectContaining({
          targetId: id(KaabalahTypes.SPHERE, SPHERES.TIPHARETH),
          targetType: "sphere",
          mapping: "sign-sphere",
          sign: "Libra",
        }),
        expect.objectContaining({
          targetId: id(KaabalahTypes.PATH, 12),
          targetType: "path",
          mapping: "sign-path",
          sign: "Libra",
        }),
        expect.objectContaining({
          targetId: id(KaabalahTypes.PATH, 1),
          targetType: "path",
          mapping: "element-path",
          sign: "Libra",
          element: "Air",
        }),
      ])
    )
  })

  it("projects current signs onto carrier spheres for planets and the ascendant", () => {
    const sun = getKaabalisticCorrespondenceTargets({
      kind: "planet",
      planet: "Sun",
      sign: "Aries",
    })
    const moon = getKaabalisticCorrespondenceTargets({
      kind: "planet",
      planet: "Moon",
      sign: "Taurus",
    })
    const mercury = getKaabalisticCorrespondenceTargets({
      kind: "planet",
      planet: "Mercury",
      sign: "Pisces",
    })
    const ascendant = getKaabalisticCorrespondenceTargets({
      kind: "angle",
      angle: "ASC",
      sign: "Cancer",
    })

    expect(sun?.targets).toContainEqual(
      expect.objectContaining({
        targetId: id(KaabalahTypes.SPHERE, SPHERES.TIPHARETH),
        targetType: "sphere",
        mapping: "carrier-sphere",
        sign: "Aries",
        planet: "Sun",
      })
    )
    expect(moon?.targets).toContainEqual(
      expect.objectContaining({
        targetId: id(KaabalahTypes.SPHERE, SPHERES.YESOD),
        targetType: "sphere",
        mapping: "carrier-sphere",
        sign: "Taurus",
        planet: "Moon",
      })
    )
    expect(mercury?.targets).toContainEqual(
      expect.objectContaining({
        targetId: id(KaabalahTypes.SPHERE, SPHERES.HOD),
        targetType: "sphere",
        mapping: "carrier-sphere",
        sign: "Pisces",
        planet: "Mercury",
      })
    )
    expect(ascendant?.targets).toContainEqual(
      expect.objectContaining({
        targetId: id(KaabalahTypes.SPHERE, SPHERES.MALKUTH),
        targetType: "sphere",
        mapping: "carrier-sphere",
        sign: "Cancer",
      })
    )
  })

  it("builds astrology markers and combined map data with sphere and path descriptors", () => {
    const chart = {
      planets: [
        makePlanet(Planet.SUN, "Sun", "Libra", 190, 7),
        makePlanet(Planet.MOON, "Moon", "Aries", 10, 1),
        makePlanet(Planet.SATURN, "Saturn", "Capricorn", 285, 10),
      ],
      nodes: [
        makeNode(
          VirtualNodes.PARS_FORTUNAE,
          "Wheel of Fortune",
          "Scorpio",
          220,
          8
        ),
      ],
      houses: makeHouses(),
    } satisfies Pick<BirthChart, "houses"> & {
      planets: HydratedPlanet[];
      nodes: HydratedNode[];
    }

    const markers = getAstrologyTreeMarkers(chart)
    const mapData = buildKaabalisticMapData({ astrology: chart })

    expect(markers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "astrology",
          targetId: id(KaabalahTypes.SPHERE, SPHERES.NETZACH),
          targetType: "sphere",
          sourceType: "planet",
          sourceName: "Sun",
          mapping: "sign-sphere",
          label: "☉",
          sign: "Libra",
        }),
        expect.objectContaining({
          kind: "astrology",
          targetId: id(KaabalahTypes.PATH, 12),
          targetType: "path",
          sourceType: "planet",
          sourceName: "Sun",
          mapping: "sign-path",
          label: "☉",
          sign: "Libra",
        }),
        expect.objectContaining({
          kind: "astrology",
          targetId: id(KaabalahTypes.PATH, 22),
          targetType: "path",
          sourceType: "planet",
          sourceName: "Sun",
          mapping: "planet-sign-path",
          label: "♎",
          sign: "Libra",
          planet: "Sun",
        }),
        expect.objectContaining({
          kind: "astrology",
          targetId: id(KaabalahTypes.SPHERE, SPHERES.GEBURAH),
          targetType: "sphere",
          sourceType: "angle",
          sourceName: "ASC",
          mapping: "sign-sphere",
          label: "ASC",
          sign: "Aries",
        }),
        expect.objectContaining({
          kind: "astrology",
          targetId: id(KaabalahTypes.SPHERE, SPHERES.TIPHARETH),
          targetType: "sphere",
          sourceType: "planet",
          sourceName: "Sun",
          mapping: "carrier-sphere",
          label: "♎",
          sign: "Libra",
          planet: "Sun",
        }),
        expect.objectContaining({
          kind: "astrology",
          targetId: id(KaabalahTypes.SPHERE, SPHERES.YESOD),
          targetType: "sphere",
          sourceType: "planet",
          sourceName: "Moon",
          mapping: "carrier-sphere",
          label: "♈",
          sign: "Aries",
          planet: "Moon",
        }),
        expect.objectContaining({
          kind: "astrology",
          targetId: id(KaabalahTypes.SPHERE, SPHERES.MALKUTH),
          targetType: "sphere",
          sourceType: "angle",
          sourceName: "ASC",
          mapping: "carrier-sphere",
          label: "♈",
          sign: "Aries",
        }),
      ])
    )
    expect(mapData.sphereMarkers[id(KaabalahTypes.SPHERE, SPHERES.NETZACH)]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceName: "Sun",
          mapping: "sign-sphere",
        }),
      ])
    )
    expect(
      mapData.itemConnections.astrology.some(
        (connection) => connection.itemLabel === "Sun in Libra"
      )
    ).toBe(true)
  })

  it("builds numerology markers from canonical number correspondences", () => {
    const birthDate = new Date(Date.UTC(1900, 0, 8, 12, 0, 0))
    const markers = getNumerologyTreeMarkers(birthDate)

    expect(markers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "numerology",
          targetId: id(KaabalahTypes.SPHERE, SPHERES.KETHER),
          targetType: "sphere",
          sourceType: "number",
          mapping: "number-sphere",
          label: "1",
        }),
        expect.objectContaining({
          kind: "numerology",
          targetId: id(KaabalahTypes.PATH, 1),
          targetType: "path",
          sourceType: "number",
          mapping: "number-path",
          label: "1",
        }),
      ])
    )
  })
})

describe("kaabalistic marker weights", () => {
  it("weighs astrology placements by source and gives every marker a weight", () => {
    const chart = {
      planets: [
        makePlanet(Planet.SUN, "Sun", "Libra", 190, 7),
        makePlanet(Planet.MERCURY, "Mercury", "Libra", 185, 7),
        makePlanet(Planet.SATURN, "Saturn", "Capricorn", 285, 10),
        makePlanet(Planet.PLUTO, "Pluto", "Scorpio", 225, 8),
      ],
      nodes: [makeNode(VirtualNodes.PARS_FORTUNAE, "Wheel of Fortune", "Scorpio", 220, 8)],
      houses: makeHouses(),
    }
    const placements = getAstrologyTreeMarkers(chart).filter((marker) => marker.mapping !== "decan-sphere")
    const bySource = (name: string) => weightsOf(placements.filter((marker) => marker.sourceName === name))

    expect(bySource("Sun")).toEqual([5])
    expect(bySource("Mercury")).toEqual([4])
    expect(bySource("Saturn")).toEqual([2])
    expect(bySource("Pluto")).toEqual([1])
    expect(bySource("Wheel of Fortune")).toEqual([1])
    expect(bySource("ASC")).toEqual([5])
    expect(bySource("MC")).toEqual([2])
    expect(bySource("Vertex")).toEqual([1])
    expect(KAABALISTIC_MARKER_WEIGHTS.astrology.placement.Moon).toBe(5)
    expect(KAABALISTIC_MARKER_WEIGHTS.astrology.placement.Venus).toBe(4)
    expect(KAABALISTIC_MARKER_WEIGHTS.astrology.placement.Mars).toBe(4)
    expect(KAABALISTIC_MARKER_WEIGHTS.astrology.placement.Jupiter).toBe(2)
  })

  it("weighs numerology final values over intermediate steps", () => {
    const markers = getNumerologyTreeMarkers(new Date(1990, 4, 17, 12))
    const weightFor = (prefix: string, label: string) =>
      weightsOf(markers.filter((m) => m.sourceName.startsWith(prefix) && m.label === label))

    expect(weightFor("Life Path (Kaabalistic)", "5")).toEqual([5])
    expect(weightFor("Day Energy", "8")).toEqual([4])
    expect(weightFor("Day Energy", "17")).toEqual([1])
    expect(weightFor("Month Energy", "5")).toEqual([3])
    expect(weightFor("Year Energy", "1")).toEqual([2])
    expect(weightFor("Year Energy", "19")).toEqual([1])
    expect(weightFor("Year Energy", "10")).toEqual([1])
  })

  it("gives the Straight life path markers weight 0 at every step and keeps them", () => {
    const markers = getNumerologyTreeMarkers(new Date(1990, 4, 17, 12))
    const straight = markers.filter((m) => m.sourceName.startsWith("Life Path (Straight)"))

    expect(straight.length).toBeGreaterThan(1)
    expect(weightsOf(straight)).toEqual([0])
    expect("straightLifePath" in KAABALISTIC_MARKER_WEIGHTS.numerology).toBe(false)

    const map = buildKaabalisticMapData({ numerology: new Date(1990, 4, 17, 12) })
    const expectedRaw = new Map<string, number>()
    for (const m of markers) expectedRaw.set(m.targetId, (expectedRaw.get(m.targetId) ?? 0) + m.weight)
    for (const [targetId, raw] of expectedRaw) {
      expect(map.rawWeightsById[targetId as keyof typeof map.rawWeightsById]!.numerology).toBeCloseTo(raw, 5)
    }
  })

  it("weighs gematria synthesis 4, vowels 3, consonants 3, and letters 1 capped at 3 per path", () => {
    const markers = getGematriaTreeMarkers("amor amor")
    const weightFor = (name: string, label: string) =>
      weightsOf(markers.filter((m) => m.sourceName === name && m.label === label))

    expect(weightFor("Synthesis", "8")).toEqual([4])
    expect(weightFor("Synthesis", "26")).toEqual([1])
    expect(weightFor("Vowels", "5")).toEqual([3])
    expect(weightFor("Vowels", "14")).toEqual([1])
    expect(weightFor("Consonants", "3")).toEqual([3])
    expect(weightFor("Consonants", "12")).toEqual([1])
    expect(weightsOf(markers.filter((m) => m.sourceType === "letter"))).toEqual([1])

    const repeated = "mama mama mama"
    const repeatedMarkers = getGematriaTreeMarkers(repeated)
    const map = buildKaabalisticMapData({ gematria: repeated })
    const letterSums = new Map<string, number>()
    for (const marker of repeatedMarkers.filter((m) => m.sourceType === "letter")) {
      letterSums.set(marker.targetId, (letterSums.get(marker.targetId) ?? 0) + marker.weight)
    }

    expect(Math.max(...letterSums.values())).toBeGreaterThan(3)
    for (const [targetId, rawSum] of letterSums) {
      const numberSum = repeatedMarkers
        .filter((m) => m.sourceType === "number" && m.targetId === targetId)
        .reduce((sum, m) => sum + m.weight, 0)
      const weights = map.rawWeightsById[targetId as keyof typeof map.rawWeightsById]!

      expect(weights.gematria).toBe(Math.min(3, rawSum) + numberSum)
      expect(map.countsById[targetId as keyof typeof map.countsById]!.gematria).toBe(
        repeatedMarkers.filter((m) => m.targetId === targetId).length
      )
    }
  })

  it("exposes rawWeightsById and weightsById with the same shape as countsById", () => {
    const map = buildKaabalisticMapData({
      astrology: singlePlanetChart("Sun", Planet.SUN, "Aries", 5, []),
      numerology: new Date(1990, 4, 17, 12),
      gematria: "amor",
    })

    expect(Object.keys(map.weightsById).length).toBeGreaterThan(0)
    expect(Object.keys(map.rawWeightsById).sort()).toEqual(Object.keys(map.weightsById).sort())
    for (const entry of [...Object.values(map.weightsById), ...Object.values(map.rawWeightsById)]) {
      expect(entry!.total).toBeCloseTo(entry!.astro + entry!.numerology + entry!.gematria, 1)
    }
    const geburah = map.rawWeightsById[sphere(SPHERES.GEBURAH)]!
    const expected = (map.sphereMarkers[sphere(SPHERES.GEBURAH)] ?? []).reduce((sum, m) => sum + m.weight, 0)
    expect(geburah.total).toBeCloseTo(expected, 5)
  })
})

describe("kaabalistic share normalization", () => {
  const targetsOf = (map: ReturnType<typeof buildKaabalisticMapData>, type: "sphere" | "path") =>
    Object.keys(map.weightsById).filter((key) => key.startsWith(`${type}:`)) as Array<keyof typeof map.weightsById>

  const sum = (map: ReturnType<typeof buildKaabalisticMapData>, type: "sphere" | "path", key: "astro" | "numerology" | "gematria" | "total") =>
    targetsOf(map, type).reduce((acc, targetId) => acc + map.weightsById[targetId]![key], 0)

  it("scales each system to its share with all three systems", () => {
    const map = buildKaabalisticMapData({
      astrology: {
        planets: [
          makePlanet(Planet.SUN, "Sun", "Libra", 190, 7),
          makePlanet(Planet.MOON, "Moon", "Pisces", 345, 12),
          makePlanet(Planet.MARS, "Mars", "Leo", 130, 5),
        ],
        houses: makeHouses(),
        aspects: [makeEdge("Sun", "Moon", "square", 0)],
      },
      numerology: new Date(1990, 4, 17, 12),
      gematria: "amor",
    })

    expect(KAABALISTIC_MARKER_WEIGHTS.systemShares).toEqual({ astrology: 50, numerology: 30, gematria: 20 })
    for (const type of ["sphere", "path"] as const) {
      const ids = targetsOf(map, type)
      const gematriaOrNumerology = ids.some((t) => map.weightsById[t]!.numerology > 0 || map.weightsById[t]!.gematria > 0)

      expect(gematriaOrNumerology).toBe(true)
      expect(sum(map, type, "total")).toBeCloseTo(100, 0)
    }
    // Spheres carry all three systems: 50 / 30 / 20 within rounding.
    expect(sum(map, "sphere", "astro")).toBeCloseTo(50, 0)
    expect(sum(map, "sphere", "numerology")).toBeCloseTo(30, 0)
    expect(sum(map, "sphere", "gematria")).toBeCloseTo(20, 0)
    // Values keep two decimals at most.
    for (const entry of Object.values(map.weightsById)) {
      expect(Math.round(entry!.total * 100) / 100).toBe(entry!.total)
    }
    // Proportions inside one system survive normalization.
    const raw = map.rawWeightsById
    const rawAstroTotal = targetsOf(map, "sphere").reduce((acc, t) => acc + raw[t]!.astro, 0)
    for (const t of targetsOf(map, "sphere")) {
      expect(map.weightsById[t]!.astro).toBeCloseTo((raw[t]!.astro / rawAstroTotal) * 50, 1)
    }
    // Ranked rows read the normalized total.
    for (const row of map.rankedSpheres) {
      expect(row.share).toBe(map.weightsById[row.id]!.total)
    }
  })

  it("renormalizes over the systems present when one is absent", () => {
    const astrology = {
      planets: [makePlanet(Planet.SUN, "Sun", "Libra", 190, 7)],
      houses: makeHouses(),
    }
    const two = buildKaabalisticMapData({ astrology, numerology: new Date(1990, 4, 17, 12) })

    expect(sum(two, "sphere", "astro")).toBeCloseTo(62.5, 0)
    expect(sum(two, "sphere", "numerology")).toBeCloseTo(37.5, 0)
    expect(sum(two, "sphere", "gematria")).toBe(0)
    expect(sum(two, "sphere", "total")).toBeCloseTo(100, 0)

    const one = buildKaabalisticMapData({ astrology })
    expect(sum(one, "sphere", "astro")).toBeCloseTo(100, 0)
    expect(sum(one, "sphere", "total")).toBeCloseTo(100, 0)
  })

  it("normalizes spheres and paths separately, so a system absent from paths does not shrink path totals", () => {
    const map = buildKaabalisticMapData({
      astrology: { planets: [makePlanet(Planet.SUN, "Sun", "Libra", 190, 7)], houses: makeHouses() },
      gematria: "amor",
    })

    for (const type of ["sphere", "path"] as const) {
      expect(sum(map, type, "total")).toBeCloseTo(100, 0)
    }
  })
})

describe("kaabalistic decan layer", () => {
  const table: Array<[string, readonly [string, string, string]]> = [
    ["Aries", [SPHERES.CHOKHMAH, SPHERES.BINAH, SPHERES.CHESED]],
    ["Cancer", [SPHERES.CHOKHMAH, SPHERES.BINAH, SPHERES.CHESED]],
    ["Libra", [SPHERES.CHOKHMAH, SPHERES.BINAH, SPHERES.CHESED]],
    ["Capricorn", [SPHERES.CHOKHMAH, SPHERES.BINAH, SPHERES.CHESED]],
    ["Taurus", [SPHERES.GEBURAH, SPHERES.TIPHARETH, SPHERES.CHESED]],
    ["Leo", [SPHERES.GEBURAH, SPHERES.TIPHARETH, SPHERES.CHESED]],
    ["Scorpio", [SPHERES.GEBURAH, SPHERES.TIPHARETH, SPHERES.CHESED]],
    ["Aquarius", [SPHERES.GEBURAH, SPHERES.TIPHARETH, SPHERES.CHESED]],
    ["Gemini", [SPHERES.HOD, SPHERES.YESOD, SPHERES.MALKUTH]],
    ["Virgo", [SPHERES.HOD, SPHERES.YESOD, SPHERES.MALKUTH]],
    ["Sagittarius", [SPHERES.HOD, SPHERES.YESOD, SPHERES.MALKUTH]],
    ["Pisces", [SPHERES.HOD, SPHERES.YESOD, SPHERES.MALKUTH]],
  ]

  const decanOf = (sign: string, degree: number) =>
    getAstrologyTreeMarkers(singlePlanetChart("Pluto", Planet.PLUTO, sign, degree)).filter(
      (marker) => marker.sourceName === "Pluto" && marker.mapping === "decan-sphere"
    )

  it.each(table)("maps %s decans to spheres", (sign, spheres) => {
    for (const [index, degree] of [5, 15, 25].entries()) {
      const markers = decanOf(sign, degree)

      expect(markers).toHaveLength(1)
      expect(markers[0]).toMatchObject({
        kind: "astrology",
        targetId: sphere(spheres[index]),
        targetType: "sphere",
        sourceType: "planet",
        sign,
        weight: 0.5,
      })
    }
  })

  it("switches decan at exactly 10 and 20 degrees", () => {
    expect(decanOf("Aries", 0)[0].targetId).toBe(sphere(SPHERES.CHOKHMAH))
    expect(decanOf("Aries", 9.99)[0].targetId).toBe(sphere(SPHERES.CHOKHMAH))
    expect(decanOf("Aries", 10)[0].targetId).toBe(sphere(SPHERES.BINAH))
    expect(decanOf("Aries", 19.99)[0].targetId).toBe(sphere(SPHERES.BINAH))
    expect(decanOf("Aries", 20)[0].targetId).toBe(sphere(SPHERES.CHESED))
    expect(decanOf("Aries", 29.99)[0].targetId).toBe(sphere(SPHERES.CHESED))
  })

  it("weighs decans at half the placement weight and covers nodes and angles", () => {
    const chart = {
      planets: [makePlanet(Planet.SUN, "Sun", "Libra", 190, 7)],
      nodes: [makeNode(VirtualNodes.PARS_FORTUNAE, "Wheel of Fortune", "Scorpio", 220, 8)],
      houses: makeHouses(),
    }
    const decans = getAstrologyTreeMarkers(chart).filter((marker) => marker.mapping === "decan-sphere")
    const weightOf = (name: string) => decans.find((marker) => marker.sourceName === name)?.weight

    expect(weightOf("Sun")).toBe(2.5)
    expect(weightOf("ASC")).toBe(2.5)
    expect(weightOf("MC")).toBe(1)
    expect(weightOf("Vertex")).toBe(0.5)
    expect(weightOf("Wheel of Fortune")).toBe(0.5)
    expect(decans.find((m) => m.sourceName === "ASC")).toMatchObject({ sourceType: "angle" })
    expect(decans.find((m) => m.sourceName === "Wheel of Fortune")).toMatchObject({ sourceType: "node" })
  })

  it("folds decan markers into the source item connection", () => {
    const map = buildKaabalisticMapData({ astrology: singlePlanetChart("Sun", Planet.SUN, "Libra", 15) })
    const sun = map.itemConnections.astrology.find((c) => c.itemLabel === "Sun in Libra")

    expect(sun?.targets.map((t) => t.id)).toContain(sphere(SPHERES.BINAH))
    expect(map.sphereMarkers[sphere(SPHERES.BINAH)]).toContainEqual(
      expect.objectContaining({ sourceName: "Sun", mapping: "decan-sphere" })
    )
  })
})

describe("kaabalistic aspect layer", () => {
  const table: Array<[AspectName, string]> = [
    ["conjunction", SPHERES.KETHER],
    ["duodecile", SPHERES.CHOKHMAH],
    ["octile", SPHERES.BINAH],
    ["sextile", SPHERES.CHESED],
    ["square", SPHERES.GEBURAH],
    ["trine", SPHERES.NETZACH],
    ["trioctile", SPHERES.HOD],
    ["quincunx", SPHERES.YESOD],
    ["opposition", SPHERES.MALKUTH],
  ]

  const aspectMarkers = (aspects: AspectEdge[]) =>
    getAstrologyTreeMarkers(singlePlanetChart("Sun", Planet.SUN, "Aries", 5, aspects)).filter(
      (marker) => marker.sourceType === "aspect"
    )

  it.each(table)("lights the sphere for a %s", (aspect, sphereName) => {
    const markers = aspectMarkers([makeEdge("Sun", "Moon", aspect, 0)])

    expect(markers).toHaveLength(1)
    expect(markers[0]).toMatchObject({
      kind: "astrology",
      targetId: sphere(sphereName),
      targetType: "sphere",
      sourceType: "aspect",
      sourceName: `Sun ${aspect} Moon`,
      mapping: "aspect-sphere",
      weight: 3,
    })
  })

  it("never lights Tiphareth from an aspect", () => {
    const markers = aspectMarkers(table.map(([aspect]) => makeEdge("Sun", "Moon", aspect, 0)))

    expect(markers.some((m) => m.targetId === sphere(SPHERES.TIPHARETH))).toBe(false)
  })

  it("scales the weight by who is involved: tightness times the pair's placement weights over 10", () => {
    const pair = (a: string, b: string, orb = 0) => aspectMarkers([makeEdge(a, b, "square", orb)])[0].weight

    expect(pair("Sun", "Moon")).toBe(3)
    expect(pair("Uranus", "Neptune")).toBe(0.6)
    expect(pair("Sun", "Mars")).toBe(2.7)
    expect(pair("Jupiter", "Saturn")).toBe(1.2)
    expect(pair("Sun", "Pluto")).toBe(1.8)
    expect(pair("Sun", "Moon", 3)).toBe(2)
    expect(pair("Uranus", "Neptune", 3)).toBe(0.4)
    // Edge names as a chart gives them: lowercase keys and angle aliases hit the same table.
    expect(pair("sun", "moon")).toBe(3)
    expect(pair("ascendant", "mc")).toBe(2.1)
    expect(pair("asc", "Sun")).toBe(3)
  })

  it("grows the weight as the aspect tightens, clamped to 1..3 tightness", () => {
    const weight = (aspect: AspectName, orb: number) => aspectMarkers([makeEdge("Sun", "Moon", aspect, orb)])[0].weight

    expect(weight("square", 0)).toBe(3)
    expect(weight("square", 3)).toBe(2)
    expect(weight("square", 4)).toBe(1.67)
    expect(weight("square", 6)).toBe(1)
    expect(weight("square", 7)).toBe(1)
    expect(weight("conjunction", 2)).toBe(2.5)
    expect(weight("duodecile", 0.5)).toBe(2.5)
    expect(weight("trine", 1)).toBe(2.71)
  })

  it("emits nothing when aspects are absent and does not double count aspect spheres", () => {
    const withoutAspects = {
      planets: [makePlanet(Planet.SUN, "Sun", "Aries", 5, 1)],
      houses: makeHouses(),
    }

    expect(getAstrologyTreeMarkers(withoutAspects).some((m) => m.sourceType === "aspect")).toBe(false)

    const emptyAspects = buildKaabalisticMapData({ astrology: { ...withoutAspects, aspects: [] } })
    const withSquare = buildKaabalisticMapData({
      astrology: { ...withoutAspects, aspects: [makeEdge("Sun", "Moon", "square", 1)] },
    })
    const geburah = sphere(SPHERES.GEBURAH)

    expect(withSquare.countsById[geburah]!.astro - (emptyAspects.countsById[geburah]?.astro ?? 0)).toBe(1)
    expect(withSquare.rawWeightsById[geburah]!.astro - (emptyAspects.rawWeightsById[geburah]?.astro ?? 0)).toBeCloseTo(2.67, 5)
    expect(withSquare.itemConnections.astrology.some((c) => c.itemLabel === "Sun square Moon")).toBe(false)
  })

  it("caps the aspect weight on one sphere at 5 in the raw sum, leaving marker weights alone", () => {
    const base = {
      planets: [makePlanet(Planet.SUN, "Sun", "Aries", 5, 1)],
      houses: makeHouses(),
    }
    const edges = [
      makeEdge("Sun", "Moon", "square", 0),
      makeEdge("Sun", "ASC", "square", 0),
      makeEdge("Moon", "ASC", "square", 0),
    ]
    const geburah = sphere(SPHERES.GEBURAH)
    const without = buildKaabalisticMapData({ astrology: base })
    const withEdges = buildKaabalisticMapData({ astrology: { ...base, aspects: edges } })
    const markerSum = (withEdges.sphereMarkers[geburah] ?? [])
      .filter((m) => m.sourceType === "aspect")
      .reduce((acc, m) => acc + m.weight, 0)

    expect(KAABALISTIC_MARKER_WEIGHTS.aspect.sphereCap).toBe(5)
    expect(markerSum).toBe(9)
    expect(withEdges.rawWeightsById[geburah]!.astro - without.rawWeightsById[geburah]!.astro).toBeCloseTo(5, 5)

    const under = buildKaabalisticMapData({ astrology: { ...base, aspects: [edges[0]] } })
    expect(under.rawWeightsById[geburah]!.astro - without.rawWeightsById[geburah]!.astro).toBeCloseTo(3, 5)
    // Other layers on the same sphere are not capped.
    expect(without.rawWeightsById[geburah]!.astro).toBeGreaterThan(5)
  })

  it("localizes aspect source names in Portuguese", () => {
    const map = buildKaabalisticMapData(
      { astrology: singlePlanetChart("Sun", Planet.SUN, "Aries", 5, [makeEdge("Sun", "Moon", "square", 0)]) },
      "pt"
    )

    expect(map.markers.some((m) => m.sourceType === "aspect" && m.sourceName === "Sol quadratura Lua")).toBe(true)
  })
})

describe("kaabalistic ranking", () => {
  it("ranks heaviest first with ties in Tree order and only touched targets", () => {
    const map = buildKaabalisticMapData({
      astrology: singlePlanetChart("Sun", Planet.SUN, "Aries", 5, [makeEdge("Sun", "Moon", "square", 0)]),
      numerology: new Date(1990, 4, 17, 12),
      gematria: "amor",
    })
    const treeOrder = (list: readonly { id: string }[]) => list.map((node) => node.id)
    const check = (ranked: typeof map.rankedSpheres, tree: readonly { id: string }[]) => {
      const order = treeOrder(tree)

      expect(ranked.length).toBeGreaterThan(0)
      for (let i = 1; i < ranked.length; i++) {
        const [a, b] = [ranked[i - 1], ranked[i]]

        expect(a.share).toBeGreaterThanOrEqual(b.share)
        if (a.share === b.share) {
          expect(order.indexOf(a.id)).toBeLessThan(order.indexOf(b.id))
        }
      }
      for (const row of ranked) {
        expect(row.share).toBe(map.weightsById[row.id]!.total)
        expect(row.count).toBe(map.countsById[row.id]?.total ?? 0)
        expect(row.share).toBeGreaterThan(0)
      }
    }

    check(map.rankedSpheres, map.spheres)
    check(map.rankedPaths, map.paths)
    expect(map.rankedSpheres[0]).toMatchObject({ id: expect.stringContaining("sphere:"), name: expect.any(String) })
  })

  it("orders a small known case", () => {
    const map = buildKaabalisticMapData({
      astrology: {
        planets: [makePlanet(Planet.SUN, "Sun", "Aries", 5, 1)],
        houses: makeHouses(),
        aspects: [makeEdge("Sun", "Moon", "trine", 0)],
      },
    })

    // Raw: Geburah: Sun and ASC Aries sign-sphere (5 + 5). Netzach: the trine (3). Chokhmah: Sun decan (2.5).
    // Raw total is 34.5 and astrology is the only system, so each raw value becomes raw / 34.5 * 100.
    expect(map.rankedSpheres.map((row) => [row.name, map.rawWeightsById[row.id]!.total])).toEqual([
      ["Geburah", 10],
      ["Malkuth", 7],
      ["Binah", 5.5],
      ["Tiphareth", 5],
      ["Netzach", 3],
      ["Chokhmah", 2.5],
      ["Hod", 1],
      ["Yesod", 0.5],
    ])
    expect(map.rankedSpheres.map((row) => row.share)).toEqual(
      [10, 7, 5.5, 5, 3, 2.5, 1, 0.5].map((raw) => Math.round((raw / 34.5) * 10000) / 100)
    )
  })

  it("localizes ranked names in Portuguese without changing ids", () => {
    const en = buildKaabalisticMapData({ numerology: new Date(1990, 4, 17, 12) })
    const pt = buildKaabalisticMapData({ numerology: new Date(1990, 4, 17, 12) }, "pt")

    expect(pt.rankedPaths.map((row) => row.id)).toEqual(en.rankedPaths.map((row) => row.id))
    expect(pt.rankedPaths[0].name).toMatch(/^Caminho \d+$/)
  })
})
