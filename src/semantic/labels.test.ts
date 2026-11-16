import { describe, expect, it } from "vitest";
import {
  KAABALISTIC_LABELS, getKaabalisticLabel,
  listPlanetSymbolMetadata, listZodiacSignSymbolMetadata, listAngleSymbolMetadata, listNodeSymbolMetadata,
  getPlanetSymbolMetadata, getZodiacSignSymbolMetadata, getAngleSymbolMetadata, getNodeSymbolMetadata,
  getKaabalisticCorrespondenceTargets, getAstrologyTreeMarkers, buildKaabalisticMapData,
} from "./index";
import { Planet, SIGNS, type BirthChart, type ZodiacPosition } from "../astrology";

function position(sign: string, house: number): ZodiacPosition {
  return { sign, house, longitude: (house - 1) * 30, decimalDegrees: 0, traditionalFormat: "0°00'", decimal: "0.00°" };
}

describe("Portuguese semantic labels", () => {
  it("covers every symbol label and short label with stable identities and glyphs", () => {
    for (const [list, get] of [
      [listPlanetSymbolMetadata, getPlanetSymbolMetadata],
      [listZodiacSignSymbolMetadata, getZodiacSignSymbolMetadata],
      [listAngleSymbolMetadata, getAngleSymbolMetadata],
      [listNodeSymbolMetadata, getNodeSymbolMetadata],
    ] as const) {
      for (const en of list()) {
        expect(KAABALISTIC_LABELS[en.label]).toBeDefined();
        expect(KAABALISTIC_LABELS[en.shortLabel]).toBeDefined();
        const pt = get(en.key, "pt-BR")!;
        expect(pt).toEqual({ ...en, label: KAABALISTIC_LABELS[en.label].pt, shortLabel: KAABALISTIC_LABELS[en.shortLabel].pt });
        expect(get(en.key)).toBe(en);
      }
      expect(list("pt")).toEqual(list("pt-BR"));
      expect(list("fr")).toBe(list());
    }
    for (const row of Object.values(KAABALISTIC_LABELS)) {
      expect(row.pt.trim()).toBeTruthy();
      expect(row.pt).not.toContain("\u2014");
    }
  });

  it("localizes marker names, correspondence labels and map rows without changing counts or targets", () => {
    const houses: BirthChart["houses"] = {
      ascendant: position("Aries", 1), mc: position("Capricorn", 10), dc: position("Libra", 7), ic: position("Cancer", 4),
      houses: SIGNS.map((sign, i) => position(sign, i + 1)),
    };
    const astrology = { houses, planets: [{ id: Planet.SUN, name: "Sun", latitude: 0, longitude: 0, distance: 1, zodiacPosition: position("Aries", 1) }] };
    const en = getAstrologyTreeMarkers(astrology), pt = getAstrologyTreeMarkers(astrology, "pt-BR");
    expect(pt.some(marker => marker.sourceName === "Sol")).toBe(true);
    expect(pt.map(({ sourceName, ...marker }) => marker)).toEqual(en.map(({ sourceName, ...marker }) => marker));
    const lookup = { kind: "planet", planet: "Sun", sign: "Aries" } as const;
    const original = getKaabalisticCorrespondenceTargets(lookup)!;
    const localized = getKaabalisticCorrespondenceTargets(lookup, "pt-BR")!;
    expect(localized.source.label).toBe("Sol");
    expect(localized.targets.map(row => row.targetId)).toEqual(original.targets.map(row => row.targetId));
    const input = { astrology, numerology: new Date(1993, 0, 15, 12), gematria: "Mat" };
    const mapEn = buildKaabalisticMapData(input), mapPt = buildKaabalisticMapData(input, "pt-BR");
    expect(mapPt.countsById).toEqual(mapEn.countsById);
    expect(mapPt.itemConnections.astrology.some(row => row.itemLabel === "Sol em Áries")).toBe(true);
    expect(mapPt.itemConnections.astrology.some(row => row.itemLabel === "Sol • Casa 1")).toBe(true);
    expect(getKaabalisticLabel("Aspects \u2014 Trine", "pt-BR")).toBe("Aspectos: Trígono");
    expect(mapPt.markers.filter(marker => marker.kind === "gematria").some(marker => marker.sourceName === "Vogais")).toBe(true);
  });
});
