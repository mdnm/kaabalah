import { describe, expect, it } from "vitest";

import {
  Planet,
  VirtualNodes,
  type BirthChart,
  type HydratedNode,
  type HydratedPlanet,
  type ZodiacPosition,
} from "../astrology";
import {
  ASPECT_GLYPH_PRIMITIVES,
  ASPECT_GLYPHS,
  ANGLE_GLYPHS,
  ASTRO_WHEEL_DEFAULT_VIEWBOX,
  PLANET_GLYPHS,
  PLANET_GLYPH_PRIMITIVES,
  ZODIAC_GLYPHS,
  generateAstroGlyphSvg,
  generateAstroWheelSvg,
  generateGlyphSvg,
  getAstroWheelRenderModel,
  getAstroGlyph,
  listAstroGlyphs,
  type AstroWheelZodiacSign,
} from "./index";

describe("astro wheel visual module", () => {
  it("renders a standalone SVG radial astrology wheel", () => {
    const chart = sampleBirthChart();
    const svg = generateAstroWheelSvg(chart);

    expect(svg.startsWith(`<svg xmlns="http://www.w3.org/2000/svg"`)).toBe(true);
    expect(svg).toContain(
      `viewBox="${ASTRO_WHEEL_DEFAULT_VIEWBOX.minX} ${ASTRO_WHEEL_DEFAULT_VIEWBOX.minY} ${ASTRO_WHEEL_DEFAULT_VIEWBOX.width} ${ASTRO_WHEEL_DEFAULT_VIEWBOX.height}"`
    );
    expect(svg).toContain(`<g id="astro-wheel-zodiac" aria-label="zodiac">`);
    expect(svg).toContain(`<g id="astro-wheel-planets" aria-label="planets">`);
    expect(svg).toContain(`<g id="astro-wheel-houses" aria-label="houses">`);
    expect(svg).toContain(`<g id="astro-wheel-aspects" aria-label="aspects">`);
    expect(svg).toContain(`♈`);
    expect(svg).toContain(`♓`);
    expect(svg.match(/data-zodiac-sign="/g)).toHaveLength(12);
    expect(svg).not.toContain("NaN");
    expect(svg).not.toContain("undefined");
    expect(svg.endsWith(`</svg>`)).toBe(true);
  });

  it("places every chart planet in the output", () => {
    const chart = sampleBirthChart();
    const svg = generateAstroWheelSvg(chart);

    for (const planet of Object.values(chart.planets)) {
      expect(svg).toContain(`data-point-name="${planet.name}"`);
    }

    expect(svg).toContain(`data-point-name="Pars Fortunae"`);
    expect(svg).toContain(`data-point-name="Vertex"`);
    expect(svg).toContain(`data-point-glyph="Sun"`);
    expect(svg).toContain(`data-point-glyph="Moon"`);
    expect(svg).toContain(`data-point-glyph="Mercury"`);
  });

  it("draws all house cusp lines and allows hiding house labels", () => {
    const chart = sampleBirthChart();
    const defaultSvg = generateAstroWheelSvg(chart);
    const labelsHiddenSvg = generateAstroWheelSvg(chart, {
      houses: { labels: false },
    });

    expect(defaultSvg.match(/data-house-cusp="/g)).toHaveLength(12);
    expect(defaultSvg.match(/data-house-label="/g)).toHaveLength(12);
    expect(defaultSvg).toContain(`data-angle-marker="ASC"`);
    expect(defaultSvg).toContain(`data-angle-marker="MC"`);

    expect(labelsHiddenSvg.match(/data-house-cusp="/g)).toHaveLength(12);
    expect(labelsHiddenSvg).not.toContain(`data-house-label="`);
  });

  it("supports transparent backgrounds, explicit dimensions, hidden aspects, and custom palette colors", () => {
    const chart = sampleBirthChart();
    const svg = generateAstroWheelSvg(chart, {
      width: 300,
      height: 300,
      background: "transparent",
      aspects: false,
      palette: {
        signColors: {
          Aries: "#123456",
        },
      },
    });

    expect(svg).toContain(`width="300"`);
    expect(svg).toContain(`height="300"`);
    expect(svg).not.toContain(`<rect`);
    expect(svg).not.toContain(`id="astro-wheel-aspects"`);
    expect(svg).toContain(`data-zodiac-sign="Aries"`);
    expect(svg).toContain(`fill="#123456"`);
  });

  it("filters excluded bodies from points and aspect lines without mutating chart data", () => {
    const chart = sampleBirthChart();
    chart.planets["true node"] = planet(Planet.TRUE_NODE, "True Node", 12, 1);
    chart.aspects = [
      ...chart.aspects,
      {
        planetA: "sun",
        planetB: "true node",
        longitudeA: chart.planets.sun.longitude,
        longitudeB: chart.planets["true node"].longitude,
        aspect: "conjunction",
        aspectAngle: 0,
        delta: 2,
        orb: 2,
      },
    ];

    const svg = generateAstroWheelSvg(chart, {
      excludeBodies: ["True Node"],
    });

    expect(svg).not.toContain(`data-point-name="True Node"`);
    expect(svg).not.toContain(`data-point-glyph="True Node"`);
    expect(svg).not.toContain(`data-planet-b="True Node"`);
    expect(chart.planets["true node"].name).toBe("True Node");
  });

  it("renders point and angle glyphs in a final overlay after ticks and house lines", () => {
    const chart = sampleBirthChart();
    const svg = generateAstroWheelSvg(chart);

    const aspectIndex = svg.indexOf(`id="astro-wheel-aspects"`);
    const zodiacIndex = svg.indexOf(`id="astro-wheel-zodiac"`);
    const houseIndex = svg.indexOf(`id="astro-wheel-houses"`);
    const planetLineIndex = svg.indexOf(`id="astro-wheel-planets"`);
    const glyphLayerIndex = svg.indexOf(`id="astro-wheel-glyph-layer"`);

    expect(glyphLayerIndex).toBeGreaterThan(aspectIndex);
    expect(glyphLayerIndex).toBeGreaterThan(zodiacIndex);
    expect(glyphLayerIndex).toBeGreaterThan(houseIndex);
    expect(glyphLayerIndex).toBeGreaterThan(planetLineIndex);
    expect(svg.indexOf(`data-zodiac-tick="`)).toBeLessThan(glyphLayerIndex);
    expect(svg.indexOf(`data-house-cusp="`)).toBeLessThan(glyphLayerIndex);
    expect(svg).toContain(`id="astro-wheel-angle-glyphs"`);
  });

  it("renders glyphs with a final SVG outline filter instead of circular halos", () => {
    const chart = sampleBirthChart();
    const svg = generateAstroWheelSvg(chart, { background: "#fff" });

    expect(svg).toContain(`id="astro-wheel-glyph-outline"`);
    expect(svg).toContain(`filter="url(#astro-wheel-glyph-outline)"`);
    expect(svg).toContain(`flood-color="#fff"`);
    expect(svg).not.toContain(`class="astro-wheel-glyph-halo"`);
  });

  it("spreads clustered planet labels radially and draws leader lines from true longitude", () => {
    const chart = sampleBirthChart();
    const svg = generateAstroWheelSvg(chart);
    const model = getAstroWheelRenderModel(chart);
    const mercury = model.pointByKey.mercury;
    const venus = model.pointByKey.venus;

    expect(svg).toContain(`class="astro-wheel-point-leader"`);
    expect(mercury.leaderLine).toBeDefined();
    expect(venus.leaderLine).toBeDefined();
    expect(mercury.displayLongitude).toBe(mercury.longitude);
    expect(venus.displayLongitude).toBe(venus.longitude);
    expect(mercury.glyphPosition).not.toEqual(venus.glyphPosition);
  });

  it("renders angle labels with inline degree, sign glyph, and minutes", () => {
    const chart = sampleBirthChart();
    const svg = generateAstroWheelSvg(chart);

    const angleLabelStart = svg.indexOf(`class="astro-wheel-angle-glyph-label"`);
    const angleLabel = svg.slice(angleLabelStart, angleLabelStart + 4000);

    expect(angleLabel).toContain(`class="astro-wheel-angle-label"`);
    expect(angleLabel).toContain(`class="astro-wheel-angle-degree"`);
    expect(angleLabel).toContain(`class="astro-wheel-angle-minutes"`);
    expect(angleLabel).toContain(`class="astro-wheel-point-sign-glyph"`);
  });

  it("renders inline degree, sign glyph, minutes, and retrograde indicator in point labels", () => {
    const chart = sampleBirthChart();
    chart.planets.mercury = {
      ...chart.planets.mercury,
      longitudeSpeed: -0.12,
    };

    const svg = generateAstroWheelSvg(chart);
    const mercuryLabelStart = svg.indexOf(`data-point-name="Mercury"`, svg.indexOf(`class="astro-wheel-point-label"`));
    const mercuryLabel = svg.slice(mercuryLabelStart, mercuryLabelStart + 6000);

    expect(mercuryLabel).toContain(`class="astro-wheel-point-degree"`);
    expect(mercuryLabel).toContain(`>12°</text>`);
    expect(mercuryLabel).toContain(`data-zodiac-glyph="Taurus"`);
    expect(mercuryLabel).toContain(`class="astro-wheel-point-minutes"`);
    expect(mercuryLabel).toContain(`>00'</text>`);
    expect(mercuryLabel).toContain(`class="astro-wheel-point-retrograde"`);
    expect(mercuryLabel).toContain(`>R</text>`);
  });

  it("can hide zodiac, houses, planets, and aspects independently", () => {
    const chart = sampleBirthChart();

    const noZodiac = generateAstroWheelSvg(chart, { zodiac: false });
    const noHouses = generateAstroWheelSvg(chart, { houses: false });
    const noPlanets = generateAstroWheelSvg(chart, { points: false });
    const noAspects = generateAstroWheelSvg(chart, { aspects: false });

    expect(noZodiac).not.toContain(`id="astro-wheel-zodiac"`);
    expect(noZodiac).toContain(`id="astro-wheel-houses"`);
    expect(noZodiac).toContain(`id="astro-wheel-planets"`);
    expect(noZodiac).toContain(`id="astro-wheel-aspects"`);

    expect(noHouses).not.toContain(`id="astro-wheel-houses"`);
    expect(noHouses).toContain(`id="astro-wheel-zodiac"`);
    expect(noHouses).toContain(`id="astro-wheel-planets"`);

    expect(noPlanets).not.toContain(`id="astro-wheel-planets"`);
    expect(noPlanets).toContain(`id="astro-wheel-zodiac"`);
    expect(noPlanets).toContain(`id="astro-wheel-houses"`);

    expect(noAspects).not.toContain(`id="astro-wheel-aspects"`);
    expect(noAspects).toContain(`id="astro-wheel-zodiac"`);
    expect(noAspects).toContain(`id="astro-wheel-planets"`);
  });

  it("composes additional point and aspect layers for transit or synastry style overlays", () => {
    const chart = sampleBirthChart();
    const transitChart = shiftedChart(chart, 18);
    const svg = generateAstroWheelSvg(chart, {
      pointLayers: [
        {
          id: "transit",
          label: "Transit",
          chart: transitChart,
          color: "#f97316",
          radius: "outer",
          radiusOffset: 24,
          glyphScale: 0.85,
        },
      ],
      aspectLayers: [
        {
          id: "transit",
          label: "Transit aspects",
          chart: transitChart,
          pointLayerId: "transit",
          color: "#f97316",
          aspectSpecs: [{ name: "opposition", angle: 180, orb: 8 }],
          radiusScale: 1.08,
        },
        {
          id: "birth-transit",
          label: "Birth to transit",
          edges: [
            {
              planetA: "sun",
              planetB: "moon",
              longitudeA: chart.planets.sun.longitude,
              longitudeB: transitChart.planets.moon.longitude,
              aspect: "opposition",
              aspectAngle: 180,
              delta: 180,
              orb: 1,
            },
          ],
          pointLayerIdA: "birth",
          pointLayerIdB: "transit",
          color: "#7c3aed",
        },
      ],
    });
    const model = getAstroWheelRenderModel(chart, {
      pointLayers: [
        {
          id: "transit",
          chart: transitChart,
          color: "#f97316",
          radius: "outer",
          radiusOffset: 24,
        },
      ],
    });

    expect(svg).toContain(`data-point-layer="birth"`);
    expect(svg).toContain(`data-point-layer="transit"`);
    expect(svg).toContain(`data-aspect-layer="transit"`);
    expect(svg).toContain(`data-aspect-layer="birth-transit"`);
    expect(svg).toContain(`#f97316`);
    expect(svg).toContain(`#7c3aed`);
    expect(model.pointByKey.sun.name).toBe("Sun");
    expect(model.pointByKey["transit:sun"].name).toBe("Sun");
    expect(model.pointByKey["transit:sun"].glyphPosition).not.toEqual(model.pointByKey.sun.glyphPosition);
  });

  it("exposes render geometry for custom overlays and configurable aspect orbs", () => {
    const chart = sampleBirthChart();
    const model = getAstroWheelRenderModel(chart, {
      palette: {
        aspects: {
          opposition: "#654321",
        },
      },
      aspects: {
        aspectSpecs: [
          { name: "conjunction", angle: 0, orb: 5 },
          { name: "opposition", angle: 180, orb: 8 },
        ],
      },
    });

    expect(model.center).toEqual({ x: 300, y: 300 });
    expect(model.rings.houses.r2).toBeGreaterThan(model.rings.houses.r1);
    expect(model.rings.zodiac.r2).toBeGreaterThan(model.rings.zodiac.r1);
    expect(model.zodiacSegments).toHaveLength(12);
    expect(model.houseCusps).toHaveLength(12);
    expect(model.points.length).toBe(Object.keys(chart.planets).length + Object.keys(chart.nodes).length + 1);
    expect(model.pointByKey.sun.glyph).toBe("☉");

    const opposition = model.aspectLines.find((line) => line.aspect === "opposition");
    const conjunction = model.aspectLines.find((line) =>
      [line.planetAKey, line.planetBKey].includes("mercury") &&
      [line.planetAKey, line.planetBKey].includes("venus")
    );

    expect(opposition?.color).toBe("#654321");
    expect(conjunction?.aspect).toBe("conjunction");
    expect(conjunction?.orb).toBe(3);
    expect(Number.isFinite(conjunction?.line.x1)).toBe(true);
  });

  it("exports planet glyph primitives for all standard planets and points", () => {
    const expected: (keyof typeof PLANET_GLYPH_PRIMITIVES)[] = [
      "sun", "moon", "mercury", "venus", "mars",
      "jupiter", "saturn", "uranus", "neptune", "pluto",
      "chiron", "south node",
    ];

    for (const key of expected) {
      const primitives = PLANET_GLYPH_PRIMITIVES[key];
      expect(primitives.length).toBeGreaterThan(0);
      for (const p of primitives) {
        expect(["path", "circle", "line", "polyline", "text", "raw"]).toContain(p.kind);
      }
    }
  });

  it("exports aspect glyph primitives for all standard aspects", () => {
    const expected: (keyof typeof ASPECT_GLYPH_PRIMITIVES)[] = [
      "conjunction", "opposition", "square", "trine", "sextile",
      "semisquare", "sesquisquare", "inconjunct", "semisextile",
    ];

    for (const key of expected) {
      const primitives = ASPECT_GLYPH_PRIMITIVES[key];
      expect(primitives.length).toBeGreaterThan(0);
    }
  });

  it("generates a standalone glyph SVG from any primitive set", () => {
    const svg = generateGlyphSvg(PLANET_GLYPH_PRIMITIVES.sun, {
      size: 64,
      color: "#333",
    });

    expect(svg).toContain(`<svg xmlns="http://www.w3.org/2000/svg"`);
    expect(svg).toContain(`width="64"`);
    expect(svg).toContain(`height="64"`);
    expect(svg).toContain(`stroke="#333"`);
    expect(svg).toContain(`currentColor`);
    expect(svg).not.toContain("NaN");
    expect(svg).not.toContain("undefined");
    expect(svg.endsWith("</svg>")).toBe(true);
  });

  it("exports reusable astrology glyph definitions and aliases", () => {
    expect(ZODIAC_GLYPHS.Aries.primitives.length).toBeGreaterThan(0);
    expect(PLANET_GLYPHS.sun.primitives).toBe(PLANET_GLYPH_PRIMITIVES.sun);
    expect(ASPECT_GLYPHS.semisextile.primitives.length).toBeGreaterThan(0);
    expect(ANGLE_GLYPHS.asc.primitives.length).toBeGreaterThan(0);
    expect(generateAstroGlyphSvg("asc")).toContain("AC");
    expect(getAstroGlyph("wheel-of-fortune")).toBe(PLANET_GLYPHS["pars fortunae"]);
    expect(getAstroGlyph("quincunx")).toBe(ASPECT_GLYPHS.inconjunct);
    expect(listAstroGlyphs("aspect").some((glyph) => glyph.key === "inconjunct")).toBe(true);
  });

  it("generates standalone SVGs from exported glyph definitions", () => {
    const svg = generateAstroGlyphSvg("asc", { size: 40, color: "#b1468d" });

    expect(svg).toContain(`data-astro-glyph="asc"`);
    expect(svg).toContain(`data-astro-glyph-category="angle"`);
    expect(svg).toContain(`AC`);
    expect(svg).toContain(`#b1468d`);
    expect(svg).not.toContain("undefined");
  });

  it("renders every planet and aspect glyph to valid SVG without NaN or undefined", () => {
    for (const [key, prims] of Object.entries(PLANET_GLYPH_PRIMITIVES)) {
      const svg = generateGlyphSvg(prims);
      expect(svg, `planet glyph "${key}"`).not.toContain("NaN");
      expect(svg, `planet glyph "${key}"`).not.toContain("undefined");
      expect(svg, `planet glyph "${key}"`).toContain("<svg");
    }

    for (const [key, prims] of Object.entries(ASPECT_GLYPH_PRIMITIVES)) {
      const svg = generateGlyphSvg(prims);
      expect(svg, `aspect glyph "${key}"`).not.toContain("NaN");
      expect(svg, `aspect glyph "${key}"`).not.toContain("undefined");
      expect(svg, `aspect glyph "${key}"`).toContain("<svg");
    }
  });
});

function sampleBirthChart(): BirthChart {
  const houseLongitudes = [10, 40, 70, 100, 130, 160, 190, 220, 250, 280, 310, 340];
  const houses = houseLongitudes.map((longitude, index) =>
    zodiacPosition(signAt(longitude), longitude, index + 1)
  );

  return {
    dateUtc: new Date("2024-03-25T16:00:00.000Z"),
    planets: {
      sun: planet(Planet.SUN, "Sun", 10, 1),
      moon: planet(Planet.MOON, "Moon", 190, 7),
      mercury: planet(Planet.MERCURY, "Mercury", 42, 2),
      venus: planet(Planet.VENUS, "Venus", 45, 2),
      mars: planet(Planet.MARS, "Mars", 100, 4),
      jupiter: planet(Planet.JUPITER, "Jupiter", 250, 9),
      saturn: planet(Planet.SATURN, "Saturn", 280, 10),
      chiron: planet(Planet.CHIRON, "Chiron", 315, 11),
      "mean node": planet(Planet.MEAN_NODE, "Mean Node", 340, 12),
    },
    nodes: {
      [VirtualNodes.PARS_FORTUNAE]: node(VirtualNodes.PARS_FORTUNAE, "Pars Fortunae", 155, 5),
    },
    houses: {
      ascendant: houses[0],
      mc: houses[9],
      dc: houses[6],
      ic: houses[3],
      houses,
      ascmc: {
        vertex: zodiacPosition("Gemini", 75, 3),
      },
    },
    aspects: [
      {
        planetA: "sun",
        planetB: "moon",
        longitudeA: 10,
        longitudeB: 190,
        aspect: "opposition",
        aspectAngle: 180,
        delta: 180,
        orb: 0,
      },
    ],
    sect: "diurnal",
  };
}

function shiftedChart(chart: BirthChart, longitudeOffset: number): BirthChart {
  return {
    ...chart,
    planets: Object.fromEntries(
      Object.entries(chart.planets).map(([key, value]) => [
        key,
        planet(
          value.id,
          value.name,
          (value.longitude + longitudeOffset) % 360,
          value.zodiacPosition.house
        ),
      ])
    ),
    nodes: Object.fromEntries(
      Object.entries(chart.nodes).map(([key, value]) => [
        key,
        node(
          value.id,
          value.name,
          (value.longitude + longitudeOffset) % 360,
          value.house
        ),
      ])
    ),
    aspects: [],
  };
}

function planet(
  id: Planet,
  name: string,
  longitude: number,
  house: number
): HydratedPlanet {
  return {
    id,
    name,
    longitude,
    latitude: 0,
    distance: 1,
    zodiacPosition: zodiacPosition(signAt(longitude), longitude, house),
  };
}

function node(
  id: VirtualNodes,
  name: string,
  longitude: number,
  house: number
): HydratedNode {
  return {
    id,
    name,
    ...zodiacPosition(signAt(longitude), longitude, house),
  };
}

function zodiacPosition(
  sign: AstroWheelZodiacSign,
  longitude: number,
  house: number
): ZodiacPosition {
  const decimalDegrees = longitude % 30;
  return {
    sign,
    decimalDegrees,
    traditionalFormat: `${Math.floor(decimalDegrees)}°00'`,
    decimal: `${decimalDegrees.toFixed(2)}°`,
    longitude,
    house,
  };
}

function signAt(longitude: number): AstroWheelZodiacSign {
  const signs: AstroWheelZodiacSign[] = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
  ];
  return signs[Math.floor((((longitude % 360) + 360) % 360) / 30)];
}
