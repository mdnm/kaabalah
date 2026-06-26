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
    expect(svg).toContain(`flood-color="#fff"`);
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

  it("keeps default angle labels inside the viewBox padding", () => {
    const chart = sampleBirthChart();
    const svg = generateAstroWheelSvg(chart, { background: "#fff" });
    const angleTransforms = [...svg.matchAll(/class="astro-wheel-angle-glyph-label"[^>]+transform="translate\(([-\d.]+) ([-\d.]+)\)/g)];

    expect(svg).toContain(`flood-color="#fff"`);
    expect(angleTransforms).toHaveLength(4);
    for (const [, x, y] of angleTransforms) {
      expect(Number(x)).toBeGreaterThanOrEqual(28);
      expect(Number(x)).toBeLessThanOrEqual(572);
      expect(Number(y)).toBeGreaterThanOrEqual(28);
      expect(Number(y)).toBeLessThanOrEqual(572);
    }
  });

  it("spreads clustered planet glyphs in the planet band while keeping true anchors", () => {
    const chart = sampleBirthChart();
    const svg = generateAstroWheelSvg(chart);
    const mercuryLabel = pointLabel(svg, "mercury");
    const venusLabel = pointLabel(svg, "venus");

    expect(svg).toContain(`class="astro-wheel-point-leader"`);
    expect(svg).not.toContain(`class="astro-wheel-point-connector"`);
    expect(mercuryLabel).toContain(`data-longitude="42"`);
    expect(mercuryLabel).toContain(`data-house="2"`);
    expect(mercuryLabel).not.toContain(`data-display-longitude="42"`);
    expect(venusLabel).toContain(`data-longitude="45"`);
    expect(venusLabel).toContain(`data-house="2"`);
    expect(venusLabel).not.toContain(`data-display-longitude="45"`);
  });

  it("renders angle markers with only degree and minutes (no key text or sign glyph)", () => {
    const chart = sampleBirthChart();
    const svg = generateAstroWheelSvg(chart);

    const angleLabelStart = svg.indexOf(`class="astro-wheel-angle-glyph-label"`);
    const angleLabel = svg.slice(angleLabelStart, angleLabelStart + 800);

    expect(angleLabel).toContain(`class="astro-wheel-angle-degree"`);
    expect(angleLabel).toContain(`class="astro-wheel-angle-minutes"`);
    // No AC/DC/MC/IC key text and no sign glyph on the angle marker.
    expect(angleLabel).not.toContain(`class="astro-wheel-angle-label"`);
    expect(angleLabel).not.toContain(`class="astro-wheel-point-sign-glyph"`);
    // The outer-rim angle tick line is gone; axes are shown by the house-cusp spokes.
    expect(svg).not.toContain(`stroke="${"#0f172a"}" stroke-width="2"`);
  });

  it("defaults to glyph-first planet labels and keeps compact position details opt-in", () => {
    const chart = sampleBirthChart();
    chart.planets.mercury = {
      ...chart.planets.mercury,
      longitudeSpeed: -0.12,
    };

    const svg = generateAstroWheelSvg(chart);
    const compactSvg = generateAstroWheelSvg(chart, {
      layout: { rails: "compact" },
    });

    expect(svg).not.toContain(`class="astro-wheel-position-rail-label"`);
    expect(compactSvg).toContain(`class="astro-wheel-position-rail-label"`);
    expect(compactSvg).toContain(`data-position-rail="degree"`);
    expect(compactSvg).toContain(`data-position-rail="sign"`);
    expect(compactSvg).toContain(`data-position-rail="retrograde"`);
    expect(compactSvg).not.toContain(`data-position-rail="minutes"`);
  });

  it("can hide position rails without changing true point geometry", () => {
    const chart = sampleBirthChart();
    const compactSvg = generateAstroWheelSvg(chart, {
      layout: { rails: "compact" },
    });
    const glyphOnlySvg = generateAstroWheelSvg(chart, {
      layout: { rails: "glyph-only" },
    });

    expect(compactSvg).toContain(`data-position-rail="degree"`);
    expect(compactSvg).toContain(`data-position-rail="sign"`);
    expect(compactSvg).not.toContain(`data-position-rail="minutes"`);
    expect(glyphOnlySvg).not.toContain(`class="astro-wheel-position-rail-label"`);
  });

  it("keeps aspect endpoints tied to true anchors when glyphs are displaced", () => {
    const chart = sampleBirthChart();
    chart.aspects = [
      {
        planetA: "mercury",
        planetB: "venus",
        longitudeA: chart.planets.mercury.longitude,
        longitudeB: chart.planets.venus.longitude,
        aspect: "conjunction",
        aspectAngle: 0,
        delta: 3,
        orb: 3,
      },
    ];
    const svg = generateAstroWheelSvg(chart);
    const aspectLine = svg.match(/<line data-aspect-group="birth" data-aspect="conjunction"[^>]+>/)?.[0] ?? "";
    const mercuryLabel = pointLabel(svg, "mercury");

    expect(aspectLine).toContain(`data-planet-a="Mercury"`);
    expect(aspectLine).toContain(`data-planet-b="Venus"`);
    expect(mercuryLabel).not.toContain(`data-display-longitude="42"`);
    expect(svg.indexOf(aspectLine)).toBeLessThan(svg.indexOf(`id="astro-wheel-point-glyphs"`));
  });

  it("keeps house cusps fixed and does not render boundary notches for cusp-adjacent conflicts", () => {
    const chart = sampleBirthChart();
    chart.planets.mercury = planet(Planet.MERCURY, "Mercury", 39.5, 1);
    chart.planets.venus = planet(Planet.VENUS, "Venus", 40.5, 2);

    const svg = generateAstroWheelSvg(chart);

    expect(pointLabel(svg, "mercury")).toContain(`data-house="1"`);
    expect(pointLabel(svg, "venus")).toContain(`data-house="2"`);
    expect(svg).not.toContain(`class="astro-wheel-boundary-notch"`);
    expect(svg.match(/data-house-cusp="/g)).toHaveLength(12);
  });

  it("does not notch (or cross) an undisplaced planet that merely sits on a cusp", () => {
    const chart = sampleBirthChart();
    const svg = generateAstroWheelSvg(chart);
    const sunLabel = pointLabel(svg, "sun");

    expect(sunLabel).toContain(`data-longitude="10"`);
    expect(sunLabel).toContain(`data-display-longitude="10"`);
    expect(svg).not.toContain(`class="astro-wheel-boundary-notch"`);
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
    expect(noAspects).toContain(`id="astro-wheel-aspect-boundary"`);
    expect(noAspects).toContain(`id="astro-wheel-zodiac"`);
    expect(noAspects).toContain(`id="astro-wheel-planets"`);
  });

  it("supports configurable aspect orbs and colors", () => {
    const chart = sampleBirthChart();
    const svg = generateAstroWheelSvg(chart, {
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
    const conjunction = svg.match(/<line data-aspect-group="birth" data-aspect="conjunction"[^>]+data-planet-a="Mercury" data-planet-b="Venus"[^>]+>/)?.[0] ?? "";

    expect(svg).toContain(`data-aspect="opposition"`);
    expect(svg).toContain(`stroke="#654321"`);
    expect(conjunction).toContain(`data-aspect="conjunction"`);
    expect(conjunction).toContain(`x1="`);
    expect(conjunction).toContain(`y1="`);
  });

  it("allows callers to tune wheel ring proportions and point connector policy", () => {
    const chart = sampleBirthChart();
    const tunedSvg = generateAstroWheelSvg(chart, {
      layout: {
        rings: {
          planets: 32,
          aspects: 48,
        },
        pointConnectors: "never",
        maxPointDisplacementDegrees: 12,
      },
    });

    expect(tunedSvg).not.toContain(`class="astro-wheel-point-leader"`);
    expect(tunedSvg).toContain(`id="astro-wheel-aspect-boundary"`);
  });

  it("keeps identical-longitude stelliums ordered, bounded, and finite", () => {
    const chart = sampleBirthChart();
    for (const key of ["moon", "mercury", "venus", "mars", "jupiter"] as const) {
      chart.planets[key] = planet(chart.planets[key].id, chart.planets[key].name, 42, 2);
    }

    const svg = generateAstroWheelSvg(chart);
    const labels = ["moon", "mercury", "venus", "mars", "jupiter"].map((key) => pointLabel(svg, key));
    const positions = labels.map((label) => pointLabelPosition(label));

    expect(svg).toContain(`class="astro-wheel-point-leader"`);
    expect(svg).not.toContain("NaN");
    expect(svg).not.toContain("undefined");
    expect(labels.every((label) => label.includes(`data-house="2"`))).toBe(true);
    expect(new Set(positions.map((position) => `${position.x},${position.y}`)).size).toBe(positions.length);
    for (const position of positions) {
      expect(Math.hypot(position.x - 300, position.y - 300)).toBeLessThanOrEqual(282);
    }
  });

  it("keeps small viewBox SVG coordinates finite and within the viewBox", () => {
    const chart = sampleBirthChart();
    const svg = generateAstroWheelSvg(chart, {
      viewBox: { minX: 0, minY: 0, width: 220, height: 220 },
      width: 220,
      height: 220,
    });
    const pointPositions = [...svg.matchAll(/class="astro-wheel-point-label"[^>]+transform="translate\(([-\d.]+) ([-\d.]+)\)/g)]
      .map((match) => ({ x: Number(match[1]), y: Number(match[2]) }));
    const anglePositions = [...svg.matchAll(/class="astro-wheel-angle-glyph-label"[^>]+transform="translate\(([-\d.]+) ([-\d.]+)\)/g)]
      .map((match) => ({ x: Number(match[1]), y: Number(match[2]) }));

    expect(svg).toContain(`viewBox="0 0 220 220"`);
    expect(svg).not.toContain("NaN");
    expect(svg).not.toContain("undefined");
    expect(pointPositions.length).toBeGreaterThan(8);
    expect(anglePositions).toHaveLength(4);
    for (const position of [...pointPositions, ...anglePositions]) {
      expect(position.x).toBeGreaterThanOrEqual(0);
      expect(position.x).toBeLessThanOrEqual(220);
      expect(position.y).toBeGreaterThanOrEqual(0);
      expect(position.y).toBeLessThanOrEqual(220);
    }
  });

  it("renders aspect-heavy charts from true positions without leaking old layout layers", () => {
    const chart = sampleBirthChart();
    chart.aspects = Object.entries(chart.planets).flatMap(([planetA, a], index, entries) =>
      entries.slice(index + 1).map(([planetB, b]) => ({
        planetA,
        planetB,
        longitudeA: a.longitude,
        longitudeB: b.longitude,
        aspect: "conjunction" as const,
        aspectAngle: 0,
        delta: 0,
        orb: 1,
      }))
    );

    const svg = generateAstroWheelSvg(chart, {
      aspects: {
        edges: chart.aspects,
      },
    });

    expect(svg.match(/data-aspect-group="birth"/g)?.length).toBe(chart.aspects.length + 1);
    expect(svg).not.toContain(`data-aspect-group="transit"`);
    expect(svg).not.toContain(`data-point-group="transit"`);
    expect(svg).not.toContain("NaN");
    expect(svg).not.toContain("undefined");
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

function pointLabel(svg: string, pointKey: string): string {
  return svg.match(new RegExp(`<g class="astro-wheel-point-label"[^>]+data-point-key="${pointKey}"[^>]+>`))?.[0] ?? "";
}

function pointLabelPosition(label: string): { x: number; y: number } {
  const match = label.match(/transform="translate\(([-\d.]+) ([-\d.]+)\)/);
  return {
    x: Number(match?.[1]),
    y: Number(match?.[2]),
  };
}

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
