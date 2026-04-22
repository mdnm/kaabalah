import { describe, expect, it } from "vitest"

import {
  Planet,
  SIGNS,
  VirtualNodes,
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
  buildKaabalisticMapData,
  getAstrologyTreeMarkers,
  getKaabalisticCorrespondenceTargets,
  getNumerologyTreeMarkers,
  getPlanetSymbolMetadata,
} from "./index"

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
