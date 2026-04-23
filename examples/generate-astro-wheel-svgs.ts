import * as fs from "node:fs";
import * as path from "node:path";

import {
  ASPECT_GLYPH_PRIMITIVES,
  PLANET_GLYPH_PRIMITIVES,
  ZODIAC_GLYPH_PRIMITIVES,
  generateAstroWheelSvg,
  generateGlyphSvg,
  type AstroWheelZodiacSign,
} from "../src/visual/index.js";

const docsPublic = path.resolve(
  import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname),
  "../docs/public"
);

const chart = sampleBirthChart();
const transitChart = shiftedChart(chart, 42);

const svgs: Record<string, string> = {
  "wheel-default.svg": generateAstroWheelSvg(chart, { background: "#fff" }),
  "wheel-monochrome.svg": generateAstroWheelSvg(chart, { background: "#fff", palette: "monochrome" }),
  "wheel-no-aspects.svg": generateAstroWheelSvg(chart, { background: "#fff", aspects: false }),
  "wheel-transit.svg": generateAstroWheelSvg(chart, {
    background: "#fff",
    pointLayers: [{
      id: "transit",
      label: "Transits",
      chart: transitChart,
      color: "#c2410c",
      tickColor: "#c2410c",
      radius: "outer",
      radiusOffset: 24,
      glyphScale: 0.85,
    }],
    aspectLayers: [{
      id: "transit",
      label: "Transit aspects",
      chart: transitChart,
      pointLayerId: "transit",
      color: "#c2410c",
      radiusScale: 1.08,
    }],
  }),
};

for (const [file, svg] of Object.entries(svgs)) {
  const target = path.join(docsPublic, file);
  fs.writeFileSync(target, svg, "utf-8");
  console.log(`✔ ${file}  (${(svg.length / 1024).toFixed(1)} KB)`);
}

const glyphFiles: string[] = [];
const allGlyphs = [
  ...Object.entries(PLANET_GLYPH_PRIMITIVES).map(([key, prims]) => ({ cat: "planet", key, prims })),
  ...Object.entries(ZODIAC_GLYPH_PRIMITIVES).map(([key, prims]) => ({ cat: "zodiac", key: key.toLowerCase(), prims })),
  ...Object.entries(ASPECT_GLYPH_PRIMITIVES).map(([key, prims]) => ({ cat: "aspect", key, prims })),
];

for (const { cat, key, prims } of allGlyphs) {
  const svg = generateGlyphSvg(prims, { size: 48, color: "#1f2933" });
  const file = `glyph-${cat}-${key.replace(/\s+/g, "-")}.svg`;
  fs.writeFileSync(path.join(docsPublic, file), svg, "utf-8");
  glyphFiles.push(file);
}
console.log(`✔ ${glyphFiles.length} glyph SVGs generated`);

// --- helpers (self-contained, no astrology WASM dependency) ---

function sampleBirthChart(): any {
  const houseLongitudes = [10, 40, 70, 100, 130, 160, 190, 220, 250, 280, 310, 340];
  const houses = houseLongitudes.map((lon, i) => zodiacPosition(signAt(lon), lon, i + 1));
  return {
    dateUtc: new Date("2024-03-25T16:00:00.000Z"),
    planets: {
      sun: planet("Sun", 10, 1),
      moon: planet("Moon", 190, 7),
      mercury: planet("Mercury", 42, 2),
      venus: planet("Venus", 45, 2),
      mars: planet("Mars", 100, 4),
      jupiter: planet("Jupiter", 250, 9),
      saturn: planet("Saturn", 280, 10),
      chiron: planet("Chiron", 315, 11),
      "mean node": planet("Mean Node", 340, 12),
    },
    nodes: {
      "pars fortunae": { id: "pars_fortunae", name: "Pars Fortunae", ...zodiacPosition("Virgo" as any, 155, 5) },
    },
    houses: {
      ascendant: houses[0],
      mc: houses[9],
      dc: houses[6],
      ic: houses[3],
      houses,
      ascmc: { vertex: zodiacPosition("Gemini" as any, 75, 3) },
    },
    aspects: [
      { planetA: "sun", planetB: "moon", longitudeA: 10, longitudeB: 190, aspect: "opposition", aspectAngle: 180, delta: 180, orb: 0 },
    ],
    sect: "diurnal",
  };
}

function shiftedChart(base: any, offset: number): any {
  return {
    ...base,
    planets: Object.fromEntries(
      Object.entries(base.planets).map(([k, v]: [string, any]) => [
        k,
        planet(v.name, (v.longitude + offset) % 360, v.zodiacPosition.house),
      ])
    ),
    nodes: Object.fromEntries(
      Object.entries(base.nodes).map(([k, v]: [string, any]) => [
        k,
        { ...v, longitude: (v.longitude + offset) % 360 },
      ])
    ),
    aspects: [],
  };
}

function planet(name: string, longitude: number, house: number): any {
  return {
    id: name.toLowerCase().replace(/\s+/g, "_"),
    name,
    longitude,
    latitude: 0,
    distance: 1,
    zodiacPosition: zodiacPosition(signAt(longitude), longitude, house),
  };
}

function zodiacPosition(sign: string, longitude: number, house: number) {
  const deg = longitude % 30;
  return { sign, decimalDegrees: deg, traditionalFormat: `${Math.floor(deg)}°00'`, decimal: `${deg.toFixed(2)}°`, longitude, house };
}

function signAt(longitude: number): AstroWheelZodiacSign {
  const signs: AstroWheelZodiacSign[] = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
  ];
  return signs[Math.floor((((longitude % 360) + 360) % 360) / 30)];
}
