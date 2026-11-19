import { describe, expect, it } from "vitest";
import {
  HOUSE_THEMES, SIGN_ADJECTIVES, SIGN_KEYWORDS, SPHERE_CARRIERS,
  buildHouseQuests, buildLightningPath, buildSerpentPath, type ChartPathsInput,
} from "./index";
import { Planet, SIGNS, type HydratedPlanet, type ZodiacPosition } from "../astrology";

function pos(sign: string, house: number): ZodiacPosition {
  return { sign, house, longitude: 0, decimalDegrees: 0, traditionalFormat: "0°00'", decimal: "0.00°" };
}
function planet(id: Planet, name: string, sign: string): HydratedPlanet {
  return { id, name, longitude: 0, latitude: 0, distance: 1, zodiacPosition: pos(sign, 1) } as HydratedPlanet;
}

const signs: Record<string, string> = {
  Neptune: "Pisces", Uranus: "Aquarius", Saturn: "Capricorn", Pluto: "Scorpio", Jupiter: "Sagittarius",
  Mars: "Aries", Sun: "Leo", Venus: "Taurus", Mercury: "Gemini", Moon: "Cancer",
};
const ids: Record<string, Planet> = {
  Neptune: Planet.NEPTUNE, Uranus: Planet.URANUS, Saturn: Planet.SATURN, Pluto: Planet.PLUTO, Jupiter: Planet.JUPITER,
  Mars: Planet.MARS, Sun: Planet.SUN, Venus: Planet.VENUS, Mercury: Planet.MERCURY, Moon: Planet.MOON,
};

function makeChart(omit: string[] = []): ChartPathsInput {
  return {
    planets: Object.entries(signs).filter(([n]) => !omit.includes(n)).map(([n, s]) => planet(ids[n], n, s)),
    houses: {
      ascendant: pos("Virgo", 1), mc: pos("Gemini", 10), dc: pos("Pisces", 7), ic: pos("Sagittarius", 4),
      houses: SIGNS.map((s, i) => pos(s, i + 1)),
    },
  };
}

describe("chartPaths tables", () => {
  it("has every sign and house in both languages", () => {
    for (const sign of SIGNS) {
      for (const table of [SIGN_ADJECTIVES, SIGN_KEYWORDS]) {
        expect(table[sign].en).toBeTruthy();
        expect(table[sign].pt).toBeTruthy();
      }
    }
    for (let h = 1; h <= 12; h++) {
      expect(HOUSE_THEMES[h].en).toBeTruthy();
      expect(HOUSE_THEMES[h].pt).toBeTruthy();
    }
    expect(Object.keys(SPHERE_CARRIERS)).toHaveLength(11);
  });
});

describe("buildHouseQuests", () => {
  it("builds 12 quests in English", () => {
    const quests = buildHouseQuests(makeChart(), "en");
    expect(quests).toHaveLength(12);
    expect(quests[0]).toEqual({ house: 1, sign: "Aries", adjective: "independent", theme: "identity", text: "Independent quest for identity" });
    expect(quests[1].text).toBe("Persistent quest for resources");
    expect(quests[3].text).toBe("Emotional quest for roots and family");
    expect(quests[11].text).toBe("Sacred quest for spirituality");
  });
  it("builds 12 quests in Portuguese", () => {
    const quests = buildHouseQuests(makeChart(), "pt-BR");
    expect(quests).toHaveLength(12);
    expect(quests[0].text).toBe("Busca independente por identidade");
    expect(quests[4].text).toBe("Busca romântica por criatividade");
    expect(quests[10].text).toBe("Busca autêntica por comunidade");
  });
  it("defaults to English", () => {
    expect(buildHouseQuests(makeChart())[1].text).toBe("Persistent quest for resources");
  });
});

describe("buildLightningPath", () => {
  it("reads Kether to Malkuth in English", () => {
    const path = buildLightningPath(makeChart(), "en");
    expect(path.map(s => s.sphere)).toEqual([
      "Kether", "Chokhmah", "Binah", "Daath", "Chesed", "Geburah", "Tiphareth", "Netzach", "Hod", "Yesod", "Malkuth",
    ]);
    expect(path.map(s => s.step)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(path[0]).toMatchObject({ carrier: "Neptune", sign: "Pisces", keywords: "mysteries, inspiration and sacrifice", text: "Will that comes from mysteries, inspiration and sacrifice" });
    expect(path[6].text).toBe("Beauty and balance from pride and the spotlight");
    expect(path[10]).toMatchObject({ carrier: "Ascendant", sign: "Virgo", text: "You materialize organization, attention to detail and method" });
  });
  it("reads in Portuguese", () => {
    const path = buildLightningPath(makeChart(), "pt");
    expect(path[0].text).toBe("Vontade que vem de mistérios, inspiração e sacrifício");
    expect(path[7].text).toBe("Controle emocional e atividade do hemisfério direito por meio de estabilidade, firmeza e conforto");
    expect(path[9].text).toBe("Tudo isso aterrado em família, lar e recordações");
  });
  it("omits steps whose carrier is missing", () => {
    const path = buildLightningPath(makeChart(["Pluto", "Moon"]), "en");
    expect(path).toHaveLength(9);
    expect(path.map(s => s.sphere)).not.toContain("Daath");
    expect(path.map(s => s.step)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it("accepts a planets record and a chart without houses data", () => {
    const planets = Object.fromEntries(Object.entries(signs).map(([n, s]) => [n, planet(ids[n], n, s)]));
    const path = buildLightningPath({ planets, houses: { houses: [] } } as unknown as ChartPathsInput, "en");
    expect(path).toHaveLength(10);
  });
});

describe("buildSerpentPath", () => {
  it("reads Malkuth to Kether in English", () => {
    const path = buildSerpentPath(makeChart(), "en");
    expect(path.map(s => s.sphere)).toEqual([
      "Malkuth", "Yesod", "Hod", "Netzach", "Tiphareth", "Geburah", "Chesed", "Daath", "Binah", "Chokhmah", "Kether",
    ]);
    expect(path[0].text).toBe("Starting from organization, attention to detail and method");
    expect(path[4].text).toBe("Mastery from pride and the spotlight");
    expect(path[10].text).toBe("Immortalizing yourself through mysteries, inspiration and sacrifice");
  });
  it("reads in Portuguese", () => {
    const path = buildSerpentPath(makeChart(), "pt");
    expect(path[1].text).toBe("Fundamentos construídos a partir de família, lar e recordações");
    expect(path[9].text).toBe("Foco em inovação e causas humanitárias");
    expect(path[10].text).toBe("Imortalizar-se por meio de mistérios, inspiração e sacrifício");
  });
  it("omits missing carriers", () => {
    const path = buildSerpentPath(makeChart(["Neptune"]), "pt");
    expect(path).toHaveLength(10);
    expect(path[path.length - 1].sphere).toBe("Chokhmah");
  });
});
