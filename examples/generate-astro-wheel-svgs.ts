
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const Planet = { SUN: 0, MOON: 1, MERCURY: 2, VENUS: 3, MARS: 4, JUPITER: 5, SATURN: 6, CHIRON: 15, MEAN_NODE: 10 } as const;
const VirtualNodes = { PARS_FORTUNAE: "parsFortunae" } as const;
import {
  ANGLE_GLYPHS,
  ASPECT_GLYPHS,
  PLANET_GLYPHS,
  ZODIAC_GLYPHS,
  generateAstroGlyphSvg,
  generateAstroWheelSvg,
  type AspectSpec,
  type AstroWheelZodiacSign,
} from "../src/visual/index";

type WheelChart = Parameters<typeof generateAstroWheelSvg>[0];
type WheelPlanet = WheelChart["planets"][keyof WheelChart["planets"]];
type WheelNode = WheelChart["nodes"][keyof WheelChart["nodes"]];
type WheelZodiacPosition = WheelPlanet["zodiacPosition"];

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const docsPublic = path.resolve(scriptDir, "../docs/public");

fs.mkdirSync(docsPublic, { recursive: true });

const DEMO_ASPECT_SPECS: AspectSpec[] = [
  { name: "conjunction", angle: 0, orb: 8 },
  { name: "sextile", angle: 60, orb: 5 },
  { name: "square", angle: 90, orb: 6 },
  { name: "trine", angle: 120, orb: 7 },
  { name: "quincunx", angle: 150, orb: 3 },
  { name: "opposition", angle: 180, orb: 8 },
];

const DEMO_ASPECT_COLORS = {
  conjunction: "#6b7280",
  sextile: "#2563eb",
  square: "#dc2626",
  trine: "#16a34a",
  quincunx: "#7c3aed",
  opposition: "#dc2626",
};

const chart = sampleBirthChart();

const svgs: Record<string, string> = {
  "wheel-default.svg": generateAstroWheelSvg(chart, {
    background: "#fff",
    aspects: {
      aspectSpecs: DEMO_ASPECT_SPECS,
    },
    palette: {
      aspects: DEMO_ASPECT_COLORS,
    },
  }),

  "wheel-monochrome.svg": generateAstroWheelSvg(chart, {
    background: "#fff",
    palette: "monochrome",
    aspects: {
      aspectSpecs: DEMO_ASPECT_SPECS,
    },
  }),

  "wheel-no-aspects.svg": generateAstroWheelSvg(chart, {
    background: "#fff",
    aspects: false,
  }),
};

for (const [file, svg] of Object.entries(svgs)) {
  const target = path.join(docsPublic, file);
  fs.writeFileSync(target, svg, "utf-8");
  console.log(`✔ ${file} (${(svg.length / 1024).toFixed(1)} KB)`);
}

const allGlyphs = uniqueGlyphs([
  ...Object.values(PLANET_GLYPHS),
  ...Object.values(ZODIAC_GLYPHS),
  ...Object.values(ASPECT_GLYPHS),
  ...Object.values(ANGLE_GLYPHS),
]);

const glyphFiles: string[] = [];

for (const glyph of allGlyphs) {
  const svg = generateAstroGlyphSvg(glyph, {
    size: 48,
    color: "#1f2933",
  });

  const file = `glyph-${safeFilePart(glyph.category)}-${safeFilePart(glyph.key)}.svg`;
  fs.writeFileSync(path.join(docsPublic, file), svg, "utf-8");
  glyphFiles.push(file);
}

console.log(`✔ ${glyphFiles.length} glyph SVGs generated`);

// --- helpers ---

function sampleBirthChart(): WheelChart {
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
    } as WheelChart["planets"],

    nodes: {
      [VirtualNodes.PARS_FORTUNAE]: node(
        VirtualNodes.PARS_FORTUNAE,
        "Pars Fortunae",
        155,
        5
      ),
    } as WheelChart["nodes"],

    houses: {
      ascendant: houses[0],
      mc: houses[9],
      dc: houses[6],
      ic: houses[3],
      houses,
      ascmc: {
        vertex: zodiacPosition(signAt(75), 75, 3),
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
    ] as WheelChart["aspects"],

    sect: "diurnal",
  } as WheelChart;
}

function planet(
  id: (typeof Planet)[keyof typeof Planet],
  name: string,
  longitude: number,
  house: number
): WheelPlanet {
  return {
    id,
    name,
    longitude,
    latitude: 0,
    distance: 1,
    zodiacPosition: zodiacPosition(signAt(longitude), longitude, house),
  } as WheelPlanet;
}

function node(
  id: (typeof VirtualNodes)[keyof typeof VirtualNodes],
  name: string,
  longitude: number,
  house: number
): WheelNode {
  return {
    id,
    name,
    ...zodiacPosition(signAt(longitude), longitude, house),
  } as WheelNode;
}

function zodiacPosition(
  sign: AstroWheelZodiacSign,
  longitude: number,
  house: number
): WheelZodiacPosition {
  const normalizedLongitude = normalizeLongitude(longitude);
  const decimalDegrees = normalizedLongitude % 30;

  return {
    sign,
    decimalDegrees,
    traditionalFormat: `${Math.floor(decimalDegrees)}°00'`,
    decimal: `${decimalDegrees.toFixed(2)}°`,
    longitude: normalizedLongitude,
    house,
  } as WheelZodiacPosition;
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

  return signs[Math.floor(normalizeLongitude(longitude) / 30)];
}

function normalizeLongitude(value: number): number {
  return ((value % 360) + 360) % 360;
}

function safeFilePart(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function uniqueGlyphs<T extends { category: string; key: string }>(
  glyphs: readonly T[]
): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const glyph of glyphs) {
    const id = `${glyph.category}:${glyph.key}`;
    if (seen.has(id)) continue;

    seen.add(id);
    result.push(glyph);
  }

  return result.sort((a, b) =>
    `${a.category}:${a.key}`.localeCompare(`${b.category}:${b.key}`)
  );
}
