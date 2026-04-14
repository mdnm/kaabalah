import { describe, expect, it } from "vitest"

import {
  id,
  KaabalahTypes,
  MELKITZEDEKI_PATHS,
  PLANETS,
  SPHERES,
  TAROT_ARKANNUS,
  TarotTypes,
  WESTERN_ELEMENTS,
  WESTERN_HOUSES,
  WESTERN_ZODIAC_SIGNS,
  WesternAstrologyTypes,
} from "../core"
import { ARKANNUS } from "../tarot"
import {
  getHouseThemeProfile,
  getTarotThemeProfile,
  listHouseThemeProfiles,
  listTarotThemeProfiles,
  tokenizeOccultThemeText,
} from "./index"

describe("semantic theme profiles", () => {
  it("exposes canonical house theme profiles with semantic tokens and correspondences", () => {
    const profile = getHouseThemeProfile(
      id(WesternAstrologyTypes.HOUSE, WESTERN_HOUSES.IMUM_COELI)
    )

    expect(profile).toMatchObject({
      kind: "house",
      id: id(WesternAstrologyTypes.HOUSE, WESTERN_HOUSES.IMUM_COELI),
      houseNumber: 4,
      houseLabel: "Imum Coeli",
      primaryLabel: "Family",
    })
    expect(profile?.aliases).toEqual(
      expect.arrayContaining(["Fourth House", "House 4", "IC", "Familia (não só de sangue)"])
    )
    expect(profile?.keywords).toEqual(
      expect.arrayContaining(["home", "family", "familia", "roots", "inner foundation"])
    )
    expect(profile?.tokens).toEqual(
      expect.arrayContaining(["home", "family", "familia", "moon", "cancer", "water", "yesod"])
    )
    expect(profile?.correspondences.planets).toContainEqual({
      id: id(WesternAstrologyTypes.PLANET, PLANETS.MOON),
      label: "Moon",
      distance: 2,
    })
    expect(profile?.correspondences.signs).toContainEqual({
      id: id(WesternAstrologyTypes.WESTERN_ZODIAC_SIGN, WESTERN_ZODIAC_SIGNS.CANCER),
      label: "Cancer",
      distance: 1,
    })
    expect(profile?.correspondences.elements).toContainEqual({
      id: id(WesternAstrologyTypes.WESTERN_ELEMENT, WESTERN_ELEMENTS.WATER),
      label: "Water",
      distance: 2,
    })
    expect(profile?.correspondences.spheres).toContainEqual({
      id: id(KaabalahTypes.SPHERE, SPHERES.YESOD),
      label: "Yesod",
      distance: 2,
    })
    expect(profile?.correspondences.paths).toContainEqual({
      id: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.BINAH_GEBURAH),
      label: "Path 8",
      distance: 2,
    })
  })

  it("exposes canonical tarot theme profiles with alias lookups and correspondences", () => {
    const profile = getTarotThemeProfile("The House of God")

    expect(profile).toMatchObject({
      kind: "tarot",
      id: id(TarotTypes.TAROT_ARK_ANNU, TAROT_ARKANNUS.THE_TOWER),
      cardNumber: 16,
      cardType: "major",
      tarotCardFilename: "16_the_house_of_god",
      primaryLabel: "The Tower",
      majorArchetype: {
        pathId: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.TIPHARETH_HOD),
        pathNumber: 16,
      },
    })
    expect(profile?.aliases).toEqual(
      expect.arrayContaining(["The House Of God", "The House of God", "A Torre"])
    )
    expect(profile?.keywords).toEqual(
      expect.arrayContaining(["separation", "destruction", "ruin", "deception", "lightning"])
    )
    expect(profile?.tokens).toEqual(
      expect.arrayContaining(["tower", "house", "god", "saturn", "capricorn", "earth", "binah"])
    )
    expect(profile?.correspondences.planets).toContainEqual({
      id: id(WesternAstrologyTypes.PLANET, PLANETS.SATURN),
      label: "Saturn",
      distance: 3,
    })
    expect(profile?.correspondences.signs).toContainEqual({
      id: id(WesternAstrologyTypes.WESTERN_ZODIAC_SIGN, WESTERN_ZODIAC_SIGNS.CAPRICORN),
      label: "Capricorn",
      distance: 2,
    })
    expect(profile?.correspondences.elements).toContainEqual({
      id: id(WesternAstrologyTypes.WESTERN_ELEMENT, WESTERN_ELEMENTS.EARTH),
      label: "Earth",
      distance: 3,
    })
    expect(profile?.correspondences.spheres).toContainEqual({
      id: id(KaabalahTypes.SPHERE, SPHERES.BINAH),
      label: "Binah",
      distance: 3,
    })
    expect(profile?.correspondences.paths).toContainEqual({
      id: id(KaabalahTypes.PATH, MELKITZEDEKI_PATHS.TIPHARETH_HOD),
      label: "Path 16",
      distance: 1,
    })
  })

  it("lists complete house and tarot profile registries", () => {
    expect(listHouseThemeProfiles()).toHaveLength(12)
    expect(listTarotThemeProfiles()).toHaveLength(ARKANNUS.length)
  })

  it("supports PT major aliases and pip-stage vocabulary for tarot profiles", () => {
    const magician = getTarotThemeProfile("O Mago")
    const judgment = getTarotThemeProfile("O Julgamento")
    const aceOfWands = getTarotThemeProfile("Ace of Wands")

    expect(magician?.id).toBe(id(TarotTypes.TAROT_ARK_ANNU, TAROT_ARKANNUS.THE_MAGICIAN))
    expect(judgment?.id).toBe(id(TarotTypes.TAROT_ARK_ANNU, TAROT_ARKANNUS.JUDGMENT))
    expect(aceOfWands?.aliases).toEqual(
      expect.arrayContaining(["Ace of Paus"])
    )
    expect(aceOfWands?.keywords).toEqual(
      expect.arrayContaining(["pure", "potential", "spark", "will", "inspiration"])
    )
  })

  it("keeps the house semantic labels aligned with the quick-keyword set", () => {
    const expectations = [
      [1, "Images", ["imagens"]],
      [2, "Money", ["dinheiro"]],
      [3, "Communication", ["comunicacao"]],
      [4, "Family", ["familia"]],
      [5, "Hobbies", ["hobbies", "lazer"]],
      [6, "Health", ["saude"]],
      [7, "Associations", ["associacoes"]],
      [8, "Sex and Initiations", ["sexo", "iniciacoes"]],
      [9, "Travel and Knowledge", ["viagens", "religiao", "filosofia", "conhecimento"]],
      [10, "Career and Work", ["carreira", "trabalho"]],
      [11, "Friends", ["amigos"]],
      [12, "Past Lives", ["vidas", "passadas"]],
    ] as const

    for (const [houseNumber, primaryLabel, requiredTokens] of expectations) {
      const profile = getHouseThemeProfile(houseNumber)

      expect(profile?.primaryLabel).toBe(primaryLabel)
      expect(profile?.tokens).toEqual(expect.arrayContaining([...requiredTokens]))
    }
  })

  it("normalizes occult theme text deterministically", () => {
    expect(
      tokenizeOccultThemeText("Família, sonhos e retreat no subconscious")
    ).toEqual(["familia", "sonhos", "retreat", "subconscious"])
  })
})
