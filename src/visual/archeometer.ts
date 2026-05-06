/**
 * Archeometer SVG renderer.
 */

export interface ArcheometerSvgViewBox {
  minX?: number;
  minY?: number;
  width: number;
  height: number;
}

export interface ArcheometerPoint {
  x: number;
  y: number;
}

export interface ArcheometerLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export type ArcheometerRingId =
  | "degreeOuter"
  | "degreeInner"
  | "zodiacUtterance"
  | "planetaryUtterance"
  | "cosmologicalMusic"
  | "astralZodiac"
  | "astralPlanetary"
  | "chromicRays"
  | "whiteRays"
  | "solarCenter";

export interface ArcheometerRing {
  id: ArcheometerRingId;
  r1: number;
  r2: number;
}

export type ArcheometerTriangleId = "wordJesus" | "mary" | "ether" | "divineFire";

export interface ArcheometerTriangleSpec {
  id: ArcheometerTriangleId | (string & {});
  title: string;
  phrase: string;
  apex: "north" | "south" | "east" | "west" | string;
  vertices: readonly [number, number, number];
  fill: string;
  vertexFills?: readonly [string, string, string];
  stroke: string;
}

export interface ArcheometerUtterancePoint {
  id: string;
  degree: number;
  letter: string;
  number: number | string;
  color: string;
  triangleId: ArcheometerTriangleSpec["id"];
  gloss?: string;
}

export interface ArcheometerMusicalNote {
  degree: number;
  note: string;
  color?: string;
}

export interface ArcheometerTriangleLabel {
  degree: number;
  label: string;
  number?: number | string;
}

export interface ArcheometerZodiacSign {
  degree: number;
  name: string;
  glyph: string;
  color?: string;
}

export interface ArcheometerPlanetaryPoint {
  degree: number;
  name: string;
  glyph: string;
  color?: string;
  phase?: "diurnal" | "nocturnal" | string;
}

export interface ArcheometerSectorCorrespondence {
  degree: number;
  utterance: ArcheometerUtterancePoint;
  triangleLabel: ArcheometerTriangleLabel;
  musicalNote: ArcheometerMusicalNote;
  zodiacSign: ArcheometerZodiacSign;
  planetaryPoint: ArcheometerPlanetaryPoint;
}

export interface ArcheometerLayerOptions {
  degreeCrown?: boolean;
  zodiacUtterance?: boolean;
  planetaryUtterance?: boolean;
  cosmologicalMusic?: boolean;
  astralZodiac?: boolean;
  astralPlanetary?: boolean;
  chromicRays?: boolean;
  whiteRays?: boolean;
  solarCenter?: boolean;
}

export interface ArcheometerPaletteOverrides {
  paper?: string;
  ink?: string;
  subtleInk?: string;
  ringStroke?: string;
  degreeTick?: string;
  degreeLabel?: string;
  whiteRay?: string;
  ringFills?: Partial<Record<ArcheometerRingId, string>>;
}

export type ArcheometerPalette = "color" | ArcheometerPaletteOverrides;

export interface ResolvedArcheometerPalette {
  paper: string;
  ink: string;
  subtleInk: string;
  ringStroke: string;
  degreeTick: string;
  degreeLabel: string;
  whiteRay: string;
  ringFills: Record<ArcheometerRingId, string>;
}

export interface ArcheometerSvgOptions {
  width?: number | string;
  height?: number | string;
  viewBox?: ArcheometerSvgViewBox;
  background?: string | "transparent";
  title?: string;
  palette?: ArcheometerPalette;
  padding?: number;
  /** 0° is north; positive degrees rotate clockwise. */
  rotationDegrees?: number;
  degreeLabelEvery?: number;
  layers?: ArcheometerLayerOptions;
  utterance?: readonly ArcheometerUtterancePoint[];
  triangles?: readonly ArcheometerTriangleSpec[];
  triangleLabels?: readonly ArcheometerTriangleLabel[];
  musicalNotes?: readonly ArcheometerMusicalNote[];
  zodiacSigns?: readonly ArcheometerZodiacSign[];
  planetaryPoints?: readonly ArcheometerPlanetaryPoint[];
}

export interface ArcheometerRenderModel {
  viewBox: Required<ArcheometerSvgViewBox>;
  center: ArcheometerPoint;
  outerRadius: number;
  scale: number;
  rings: Record<ArcheometerRingId, ArcheometerRing>;
  palette: ResolvedArcheometerPalette;
  rotationDegrees: number;
  layers: Required<ArcheometerLayerOptions>;
  degreeLabelEvery: number;
  utterance: readonly ArcheometerUtterancePoint[];
  triangles: readonly ArcheometerTriangleSpec[];
  triangleLabels: readonly ArcheometerTriangleLabel[];
  musicalNotes: readonly ArcheometerMusicalNote[];
  zodiacSigns: readonly ArcheometerZodiacSign[];
  planetaryPoints: readonly ArcheometerPlanetaryPoint[];
}

const TAU = Math.PI * 2;

export const ARCHEOMETER_DEFAULT_VIEWBOX: Required<ArcheometerSvgViewBox> = {
  minX: 0,
  minY: 0,
  width: 900,
  height: 900,
};

const DEFAULT_LAYERS: Required<ArcheometerLayerOptions> = {
  degreeCrown: true,
  zodiacUtterance: true,
  planetaryUtterance: true,
  cosmologicalMusic: true,
  astralZodiac: true,
  astralPlanetary: true,
  chromicRays: true,
  whiteRays: true,
  solarCenter: true,
};

const COLOR_RING_FILLS: Record<ArcheometerRingId, string> = {
  degreeOuter: "#fff8ef",
  degreeInner: "#fff2e1",
  zodiacUtterance: "#eba0be",
  planetaryUtterance: "#c9e7f5",
  cosmologicalMusic: "#fffaf0",
  astralZodiac: "#efc0bc",
  astralPlanetary: "#d2e8df",
  chromicRays: "#fff3d4",
  whiteRays: "#eef1ec",
  solarCenter: "#f7d65b",
};

const COLOR_PALETTE: ResolvedArcheometerPalette = {
  paper: "#fffaf1",
  ink: "#151515",
  subtleInk: "#605a54",
  ringStroke: "#171717",
  degreeTick: "#171717",
  degreeLabel: "#171717",
  whiteRay: "#25395a",
  ringFills: COLOR_RING_FILLS,
};

export const DEFAULT_ARCHEOMETER_SECTOR_CORRESPONDENCES: readonly ArcheometerSectorCorrespondence[] = [
  {
    degree: 0,
    utterance: { id: "ph", degree: 0, letter: "P, Ph", number: 80, color: "#f2d54c", triangleId: "wordJesus", gloss: "Utterance / light" },
    triangleLabel: { degree: 0, label: "S, Sh", number: 300 },
    musicalNote: { degree: 0, note: "Si" },
    zodiacSign: { degree: 0, name: "Capricorn", glyph: "♑" },
    planetaryPoint: { degree: 0, name: "Saturn", glyph: "♄", phase: "diurnal" },
  },
  {
    degree: 30,
    utterance: { id: "za", degree: 30, letter: "W, O, U", number: 7, color: "#b7d56a", triangleId: "ether", gloss: "Ether" },
    triangleLabel: { degree: 30, label: "D", number: 4 },
    musicalNote: { degree: 30, note: "Do" },
    zodiacSign: { degree: 30, name: "Sagittarius", glyph: "♐" },
    planetaryPoint: { degree: 30, name: "Jupiter", glyph: "♃", phase: "diurnal" },
  },
  {
    degree: 60,
    utterance: { id: "ma", degree: 60, letter: "M", number: 40, color: "#79bf6a", triangleId: "mary", gloss: "Mary" },
    triangleLabel: { degree: 60, label: "C", number: 20 },
    musicalNote: { degree: 60, note: "Ré" },
    zodiacSign: { degree: 60, name: "Scorpio", glyph: "♏" },
    planetaryPoint: { degree: 60, name: "Mars", glyph: "♂", phase: "diurnal" },
  },
  {
    degree: 90,
    utterance: { id: "u", degree: 90, letter: "L", number: 70, color: "#69ad74", triangleId: "divineFire", gloss: "Fire" },
    triangleLabel: { degree: 90, label: "" },
    musicalNote: { degree: 90, note: "Mi" },
    zodiacSign: { degree: 90, name: "Libra", glyph: "♎" },
    planetaryPoint: { degree: 90, name: "Venus", glyph: "♀", phase: "diurnal" },
  },
  {
    degree: 120,
    utterance: { id: "o", degree: 120, letter: "Y", number: 6, color: "#efb83e", triangleId: "wordJesus", gloss: "Voice / sound" },
    triangleLabel: { degree: 120, label: "Ts", number: 90 },
    musicalNote: { degree: 120, note: "Fa" },
    zodiacSign: { degree: 120, name: "Virgo", glyph: "♍" },
    planetaryPoint: { degree: 120, name: "Mercury", glyph: "☿", phase: "diurnal" },
  },
  {
    degree: 150,
    utterance: { id: "la", degree: 150, letter: "T", number: 30, color: "#ec8d3f", triangleId: "ether", gloss: "Ether" },
    triangleLabel: { degree: 150, label: "N", number: 50 },
    musicalNote: { degree: 150, note: "Sol" },
    zodiacSign: { degree: 150, name: "Leo", glyph: "♌" },
    planetaryPoint: { degree: 150, name: "Sun", glyph: "☉", phase: "diurnal" },
  },
  {
    degree: 180,
    utterance: { id: "ri", degree: 180, letter: "E, H", number: 200, color: "#df4d43", triangleId: "mary", gloss: "Descending R" },
    triangleLabel: { degree: 180, label: "B", number: 2 },
    musicalNote: { degree: 180, note: "La" },
    zodiacSign: { degree: 180, name: "Cancer", glyph: "♋" },
    planetaryPoint: { degree: 180, name: "Moon", glyph: "☾", phase: "nocturnal" },
  },
  {
    degree: 210,
    utterance: { id: "t", degree: 210, letter: "Z", number: 400, color: "#8b54ad", triangleId: "divineFire", gloss: "Divine fire" },
    triangleLabel: { degree: 210, label: "Ts", number: 90 },
    musicalNote: { degree: 210, note: "Si" },
    zodiacSign: { degree: 210, name: "Gemini", glyph: "♊" },
    planetaryPoint: { degree: 210, name: "Mercury", glyph: "☿", phase: "nocturnal" },
  },
  {
    degree: 240,
    utterance: { id: "y", degree: 240, letter: "V, O, U", number: 10, color: "#d85c43", triangleId: "wordJesus", gloss: "Word / JeShU" },
    triangleLabel: { degree: 240, label: "G", number: 3 },
    musicalNote: { degree: 240, note: "Do" },
    zodiacSign: { degree: 240, name: "Taurus", glyph: "♉" },
    planetaryPoint: { degree: 240, name: "Venus", glyph: "♀", phase: "nocturnal" },
  },
  {
    degree: 270,
    utterance: { id: "ka", degree: 270, letter: "H, E", number: 20, color: "#3c82c2", triangleId: "ether", gloss: "Etheric power" },
    triangleLabel: { degree: 270, label: "C", number: 20 },
    musicalNote: { degree: 270, note: "Ré" },
    zodiacSign: { degree: 270, name: "Aries", glyph: "♈" },
    planetaryPoint: { degree: 270, name: "Mars", glyph: "♂", phase: "nocturnal" },
  },
  {
    degree: 300,
    utterance: { id: "h", degree: 300, letter: "R", number: 5, color: "#d4579c", triangleId: "mary", gloss: "Living waters" },
    triangleLabel: { degree: 300, label: "D", number: 4 },
    musicalNote: { degree: 300, note: "Mi" },
    zodiacSign: { degree: 300, name: "Pisces", glyph: "♓" },
    planetaryPoint: { degree: 300, name: "Jupiter", glyph: "♃", phase: "nocturnal" },
  },
  {
    degree: 330,
    utterance: { id: "hou", degree: 330, letter: "K", number: 6, color: "#7963b8", triangleId: "divineFire", gloss: "Divine fire" },
    triangleLabel: { degree: 330, label: "S, Sh", number: 300 },
    musicalNote: { degree: 330, note: "Fa" },
    zodiacSign: { degree: 330, name: "Aquarius", glyph: "♒" },
    planetaryPoint: { degree: 330, name: "Saturn", glyph: "♄", phase: "nocturnal" },
  },
] as const;

export const DEFAULT_ARCHEOMETER_UTTERANCE: readonly ArcheometerUtterancePoint[] = DEFAULT_ARCHEOMETER_SECTOR_CORRESPONDENCES.map((sector) => sector.utterance);

export const DEFAULT_ARCHEOMETER_TRIANGLE_LABELS: readonly ArcheometerTriangleLabel[] = DEFAULT_ARCHEOMETER_SECTOR_CORRESPONDENCES.map((sector) => sector.triangleLabel);

export const DEFAULT_ARCHEOMETER_TRIANGLES: readonly ArcheometerTriangleSpec[] = [
  { id: "wordJesus", title: "Triangle of the Word / JeShU", phrase: "Y-PhO", apex: "north", vertices: [0, 120, 240], fill: "#f2cf45", vertexFills: ["#f2cf45", "#5470a5", "#dd3e38"], stroke: "#8a6a00" },
  { id: "mary", title: "Triangle of Mary / Living Waters", phrase: "Ma-Ri-H", apex: "south", vertices: [180, 300, 60], fill: "#e25b61", vertexFills: ["#cc58a1", "#f28a32", "#78bd79"], stroke: "#8c2028" },
  { id: "ether", title: "Triangle of the Ether", phrase: "La-Ka-Za", apex: "west", vertices: [270, 30, 150], fill: "#78bd79", vertexFills: ["#e96836", "#b7bd58", "#8f69a3"], stroke: "#2d7737" },
  { id: "divineFire", title: "Triangle of Divine Fire", phrase: "Hou-U-T", apex: "east", vertices: [90, 210, 330], fill: "#cc58a1", vertexFills: ["#63a890", "#d45375", "#f0b33f"], stroke: "#7d2a65" },
] as const;

export const DEFAULT_ARCHEOMETER_MUSICAL_NOTES: readonly ArcheometerMusicalNote[] = DEFAULT_ARCHEOMETER_SECTOR_CORRESPONDENCES.map((sector) => sector.musicalNote);

export const DEFAULT_ARCHEOMETER_ZODIAC: readonly ArcheometerZodiacSign[] = DEFAULT_ARCHEOMETER_SECTOR_CORRESPONDENCES.map((sector) => sector.zodiacSign);

export const DEFAULT_ARCHEOMETER_PLANETS: readonly ArcheometerPlanetaryPoint[] = DEFAULT_ARCHEOMETER_SECTOR_CORRESPONDENCES.map((sector) => sector.planetaryPoint);

export function getArcheometerRenderModel(options: ArcheometerSvgOptions = {}): ArcheometerRenderModel {
  const viewBox = normalizeViewBox(options.viewBox);
  const scale = Math.min(viewBox.width / ARCHEOMETER_DEFAULT_VIEWBOX.width, viewBox.height / ARCHEOMETER_DEFAULT_VIEWBOX.height);
  const padding = options.padding ?? 16 * scale;
  const center = {
    x: round(viewBox.minX + viewBox.width / 2),
    y: round(viewBox.minY + viewBox.height / 2),
  };
  const outerRadius = round(Math.max(0, Math.min(viewBox.width, viewBox.height) / 2 - padding));

  return {
    viewBox,
    center,
    outerRadius,
    scale,
    rings: buildRings(outerRadius),
    palette: resolvePalette(options.palette),
    rotationDegrees: options.rotationDegrees ?? 0,
    layers: { ...DEFAULT_LAYERS, ...(options.layers ?? {}) },
    degreeLabelEvery: options.degreeLabelEvery ?? 15,
    utterance: options.utterance ?? DEFAULT_ARCHEOMETER_UTTERANCE,
    triangles: options.triangles ?? DEFAULT_ARCHEOMETER_TRIANGLES,
    triangleLabels: options.triangleLabels ?? DEFAULT_ARCHEOMETER_TRIANGLE_LABELS,
    musicalNotes: options.musicalNotes ?? DEFAULT_ARCHEOMETER_MUSICAL_NOTES,
    zodiacSigns: options.zodiacSigns ?? DEFAULT_ARCHEOMETER_ZODIAC,
    planetaryPoints: options.planetaryPoints ?? DEFAULT_ARCHEOMETER_PLANETS,
  };
}

export const DEFAULT_ARCHETYPE_UTTERANCE = DEFAULT_ARCHEOMETER_UTTERANCE;
export const DEFAULT_ARCHETYPE_TRIANGLES = DEFAULT_ARCHEOMETER_TRIANGLES;
export const DEFAULT_ARCHETYPE_MUSICAL_NOTES = DEFAULT_ARCHEOMETER_MUSICAL_NOTES;
export const DEFAULT_ARCHETYPE_ZODIAC = DEFAULT_ARCHEOMETER_ZODIAC;
export const DEFAULT_ARCHETYPE_PLANETS = DEFAULT_ARCHEOMETER_PLANETS;

export function generateArcheometerSvg(options: ArcheometerSvgOptions = {}): string {
  const model = getArcheometerRenderModel(options);
  const { viewBox, center, outerRadius, palette } = model;
  const background = options.background ?? "transparent";
  const lines: string[] = [];
  const push = (line: string) => lines.push(line);
  const title = options.title ?? "The Cosmological Archeometer";

  const attrs = [
    `xmlns="http://www.w3.org/2000/svg"`,
    options.width !== undefined ? `width="${escapeAttr(String(options.width))}"` : "",
    options.height !== undefined ? `height="${escapeAttr(String(options.height))}"` : "",
    `viewBox="${fmt(viewBox.minX)} ${fmt(viewBox.minY)} ${fmt(viewBox.width)} ${fmt(viewBox.height)}"`,
    `preserveAspectRatio="xMidYMid meet"`,
    `role="img"`,
    `aria-label="${escapeAttr(title)}"`,
  ].filter(Boolean);

  push(`<svg ${attrs.join(" ")}>`);
  push(`<title>${escapeText(title)}</title>`);

  if (background !== "transparent") {
    push(`<rect x="${fmt(viewBox.minX)}" y="${fmt(viewBox.minY)}" width="${fmt(viewBox.width)}" height="${fmt(viewBox.height)}" fill="${escapeAttr(background)}"/>`);
  }

  push(`<circle cx="${fmt(center.x)}" cy="${fmt(center.y)}" r="${fmt(outerRadius)}" fill="${escapeAttr(palette.paper)}"/>`);
  renderDefs(push, model);
  renderRingGrounds(push, model);

  if (model.layers.chromicRays) renderChromicRays(push, model);
  if (model.layers.planetaryUtterance) renderPlanetaryUtterance(push, model);
  if (model.layers.zodiacUtterance) renderZodiacUtterance(push, model);
  if (model.layers.cosmologicalMusic) renderCosmologicalMusic(push, model);
  if (model.layers.astralZodiac) renderAstralZodiac(push, model);
  if (model.layers.astralPlanetary) renderAstralPlanetary(push, model);
  if (model.layers.whiteRays) renderWhiteRays(push, model);
  if (model.layers.degreeCrown) renderDegreeCrown(push, model);
  renderFrame(push, model);
  if (model.layers.solarCenter) renderSolarCenter(push, model);

  push(`</svg>`);
  return lines.join("\n");
}

function renderDefs(push: (line: string) => void, model: ArcheometerRenderModel) {
  const { rings, center } = model;
  const planetaryClipOuter = planetaryTriangleClipOuterRadius(rings);
  push(`<defs>`);
  push(`<clipPath id="archeometer-planetary-clip"><path d="${annulusPath(center, rings.cosmologicalMusic.r1, planetaryClipOuter)}" fill-rule="evenodd" clip-rule="evenodd"/></clipPath>`);
  push(`<clipPath id="archeometer-chromic-clip"><path d="${annulusPath(center, rings.chromicRays.r1, rings.chromicRays.r2)}" fill-rule="evenodd" clip-rule="evenodd"/></clipPath>`);
  push(`</defs>`);
}

function renderRingGrounds(push: (line: string) => void, model: ArcheometerRenderModel) {
  const { rings, center, palette } = model;
  const order: ArcheometerRingId[] = [
    "degreeOuter",
    "degreeInner",
    "zodiacUtterance",
    "planetaryUtterance",
    "cosmologicalMusic",
    "astralZodiac",
    "astralPlanetary",
    "chromicRays",
    "whiteRays",
  ];

  push(`<g id="archeometer-ring-grounds">`);
  for (const id of order) {
    const ring = rings[id];
    push(`<path id="archeometer-ring-${id}" d="${annulusPath(center, ring.r1, ring.r2)}" fill="${escapeAttr(palette.ringFills[id])}" fill-rule="evenodd" stroke="none"/>`);
  }
  push(`</g>`);
}

function renderDegreeCrown(push: (line: string) => void, model: ArcheometerRenderModel) {
  const { center, rings, palette, scale } = model;
  const outer = rings.degreeOuter;
  const inner = rings.degreeInner;

  push(`<g id="archeometer-degree-crown" aria-label="dual 360 degree differential numerical protractor">`);
  for (let degree = 0; degree < 360; degree += 30) {
    const angle = angleOf(model, degree);
    const pOuter = polarToXY(center, (outer.r1 + outer.r2) / 2, angle);
    const pInner = polarToXY(center, (inner.r1 + inner.r2) / 2, angle);
    const rot = tangentRotation(angle);
    const outerText = String(normalizeDegrees(345 + degree) || 360);
    const innerText = String(normalizeDegrees(15 - degree) || 360);
    push(textSvg(outerText, pOuter, 8.4 * scale, palette.degreeLabel, rot, "middle"));
    push(textSvg(innerText, pInner, 7.6 * scale, palette.degreeLabel, rot, "middle"));
  }
  push(`</g>`);
}

function renderZodiacUtterance(push: (line: string) => void, model: ArcheometerRenderModel) {
  const { center, rings, palette, scale } = model;
  const ring = rings.zodiacUtterance;
  const sorted = sortedByDegree(model.utterance);

  push(`<g id="archeometer-zodiacal-utterance" aria-label="zodiacal crown of the utterance">`);
  for (let i = 0; i < 12; i++) {
    const degree = i * 30;
    const point = sorted[i % sorted.length];
    const sector = annularSectorPath(center, ring.r1, ring.r2, angleOf(model, degree - 15), angleOf(model, degree + 15), 30);
    push(`<path d="${sector}" fill="${escapeAttr(point.color)}" fill-opacity="0.40" stroke="${escapeAttr(palette.ringStroke)}" stroke-opacity="0.40" stroke-width="${fmt(0.7 * scale)}"/>`);
  }

  for (const point of sorted) {
    const a = angleOf(model, point.degree);
    const p = polarToXY(center, ring.r1 + (ring.r2 - ring.r1) * 0.58, a);
    const shieldR = (ring.r2 - ring.r1) * 0.22;
    const letterParts = point.letter.split(",").map((part) => part.trim()).filter(Boolean);
    const isStacked = letterParts.length > 1;
    const letterFontSize = (isStacked ? (letterParts.length > 2 ? 8.3 : 10.6) : 14) * scale;
    const letterLineHeight = letterFontSize * 0.88;
    const firstLineY = p.y - ((letterParts.length - 1) * letterLineHeight) / 2 - (isStacked ? 0 : shieldR * 0.12);
    push(`<g class="archeometer-utterance-point" data-degree="${fmt(normalizeDegrees(point.degree))}" data-letter="${escapeAttr(point.letter)}">`);
    push(`<circle cx="${fmt(p.x)}" cy="${fmt(p.y)}" r="${fmt(shieldR)}" fill="${escapeAttr(point.color)}" stroke="${escapeAttr(palette.ink)}" stroke-width="${fmt(1.1 * scale)}"/>`);
    for (const [index, part] of letterParts.entries()) {
      push(textSvg(part, { x: p.x, y: firstLineY + index * letterLineHeight }, letterFontSize, palette.ink, 0, "middle", 700));
    }
    if (!isStacked) {
      push(textSvg(String(point.number), { x: p.x, y: p.y + shieldR * 0.52 }, 7.3 * scale, palette.ink, 0, "middle"));
    }
    push(`</g>`);
  }
  push(`</g>`);
}

function renderPlanetaryUtterance(push: (line: string) => void, model: ArcheometerRenderModel) {
  const { center, rings, palette, scale } = model;
  const ring = rings.planetaryUtterance;
  const clipOuter = planetaryTriangleClipOuterRadius(rings);
  const vertexRadius = clipOuter * Math.sqrt(3);

  push(`<g id="archeometer-planetary-utterance" aria-label="four trigones of the planetary utterance">`);
  push(`<g clip-path="url(#archeometer-planetary-clip)">`);
  for (const triangle of model.triangles) {
    const vertices = triangle.vertices.map((degree) => polarToXY(center, vertexRadius, angleOf(model, degree)));
    if (triangle.vertexFills) {
      const centroid = polygonCentroid(vertices);
      const midpoints = vertices.map((vertex, index) => midpoint(vertex, vertices[(index + 1) % vertices.length]));
      for (const [index, vertex] of vertices.entries()) {
        const previousMidpoint = midpoints[(index + vertices.length - 1) % vertices.length];
        const nextMidpoint = midpoints[index];
        push(`<path class="archeometer-trigone-vertex-fill" data-triangle="${escapeAttr(triangle.id)}" data-degree="${fmt(normalizeDegrees(triangle.vertices[index]))}" d="${polygonPath([vertex, nextMidpoint, centroid, previousMidpoint])}" fill="${escapeAttr(triangle.vertexFills[index])}" fill-opacity="0.58" stroke="none"/>`);
      }
      push(`<path class="archeometer-trigone" data-triangle="${escapeAttr(triangle.id)}" d="${polygonPath(vertices)}" fill="none" stroke="${escapeAttr(palette.ink)}" stroke-opacity="0.78" stroke-width="${fmt(1.35 * scale)}"/>`);
    } else {
      push(`<path class="archeometer-trigone" data-triangle="${escapeAttr(triangle.id)}" d="${polygonPath(vertices)}" fill="${escapeAttr(triangle.fill)}" fill-opacity="0.60" stroke="${escapeAttr(palette.ink)}" stroke-opacity="0.78" stroke-width="${fmt(1.35 * scale)}"/>`);
    }
  }
  push(`</g>`);

  for (const label of sortedByDegree(model.triangleLabels)) {
    if (!label.label) continue;
    const a = angleOf(model, label.degree);
    const labelPoint = polarToXY(center, ring.r1 + (clipOuter - ring.r1) * 0.56, a);
    push(textSvg(label.label, labelPoint, 12 * scale, palette.ink, 0, "middle", 700));
    if (label.number !== undefined) {
      const numberPoint = polarToXY(center, ring.r1 + (clipOuter - ring.r1) * 0.80, a);
      push(textSvg(String(label.number), numberPoint, 7.5 * scale, palette.ink, 0, "middle", 600));
    }
  }

  push(`</g>`);
}

function renderCosmologicalMusic(push: (line: string) => void, model: ArcheometerRenderModel) {
  const { center, rings, palette, scale } = model;
  const ring = rings.cosmologicalMusic;
  const notes = sortedByDegree(model.musicalNotes);

  push(`<g id="archeometer-cosmological-music" aria-label="cosmological musical crown">`);
  push(`<path id="archeometer-music-backing" d="${annulusPath(center, ring.r1, ring.r2)}" fill="${escapeAttr(palette.paper)}" stroke="${escapeAttr(palette.ringStroke)}" stroke-opacity="0.58" stroke-width="${fmt(0.8 * scale)}" fill-rule="evenodd"/>`);
  for (const note of notes) {
    const point = nearestUtterance(note.degree, model.utterance);
    const start = angleOf(model, note.degree - 15);
    const end = angleOf(model, note.degree + 15);
    const sector = annularSectorPath(center, ring.r1, ring.r2, start, end, 30);
    push(`<path d="${sector}" fill="${escapeAttr(note.color ?? point?.color ?? palette.ringFills.cosmologicalMusic)}" fill-opacity="0.24" stroke="${escapeAttr(palette.ringStroke)}" stroke-opacity="0.3" stroke-width="${fmt(0.55 * scale)}"/>`);
  }

  for (const note of notes) {
    const start = angleOf(model, note.degree - 5.5);
    const end = angleOf(model, note.degree + 5.5);
    for (let i = 1; i <= 5; i++) {
      const r = ring.r1 + ((ring.r2 - ring.r1) * i) / 6;
      push(`<path class="archeometer-music-staff-line" data-degree="${fmt(normalizeDegrees(note.degree))}" d="${arcSegmentPath(center, r, start, end)}" fill="none" stroke="${escapeAttr(palette.ink)}" stroke-opacity="0.58" stroke-width="${fmt(0.48 * scale)}" stroke-linecap="round"/>`);
    }
  }

  for (const note of notes) {
    if (!note.note) continue;
    const p = polarToXY(center, (ring.r1 + ring.r2) / 2, angleOf(model, note.degree));
    push(textSvg(note.note, p, 8.8 * scale, palette.ink, tangentRotation(angleOf(model, note.degree)), "middle", 700));
  }
  push(`</g>`);
}

function renderAstralZodiac(push: (line: string) => void, model: ArcheometerRenderModel) {
  const { center, rings, palette, scale } = model;
  const ring = rings.astralZodiac;

  push(`<g id="archeometer-astral-zodiac" aria-label="astral zodiacal crown">`);
  for (const sign of sortedByDegree(model.zodiacSigns)) {
    const sector = annularSectorPath(center, ring.r1, ring.r2, angleOf(model, sign.degree - 15), angleOf(model, sign.degree + 15), 30);
    const pointColor = triangleVertexFillForDegree(model, sign.degree) ?? sign.color ?? nearestUtterance(sign.degree, model.utterance)?.color ?? palette.ringFills.astralZodiac;
    push(`<path d="${sector}" fill="${escapeAttr(pointColor)}" fill-opacity="0.40" stroke="${escapeAttr(palette.ringStroke)}" stroke-opacity="0.32" stroke-width="${fmt(0.6 * scale)}"/>`);
  }

  for (const sign of sortedByDegree(model.zodiacSigns)) {
    const pointColor = triangleVertexFillForDegree(model, sign.degree) ?? sign.color ?? nearestUtterance(sign.degree, model.utterance)?.color ?? palette.ringFills.astralZodiac;
    const p = polarToXY(center, (ring.r1 + ring.r2) / 2, angleOf(model, sign.degree));
    push(`<g class="archeometer-zodiac-sign" data-sign="${escapeAttr(sign.name)}" data-degree="${fmt(normalizeDegrees(sign.degree))}">`);
    push(`<circle cx="${fmt(p.x)}" cy="${fmt(p.y)}" r="${fmt((ring.r2 - ring.r1) * 0.43)}" fill="${escapeAttr(pointColor)}" fill-opacity="0.48" stroke="${escapeAttr(palette.ink)}" stroke-width="${fmt(0.75 * scale)}"/>`);
    push(textSvg(sign.glyph, p, 18 * scale, palette.ink, 0, "middle"));
    push(`</g>`);
  }
  push(`</g>`);
}

function renderAstralPlanetary(push: (line: string) => void, model: ArcheometerRenderModel) {
  const { center, rings, palette, scale } = model;
  const ring = rings.astralPlanetary;

  push(`<g id="archeometer-astral-planetary" aria-label="astral planetary crown">`);
  for (const planet of sortedByDegree(model.planetaryPoints)) {
    const pointColor = triangleVertexFillForDegree(model, planet.degree) ?? planet.color ?? nearestUtterance(planet.degree, model.utterance)?.color ?? palette.ringFills.astralPlanetary;
    const sector = annularSectorPath(center, ring.r1, ring.r2, angleOf(model, planet.degree - 15), angleOf(model, planet.degree + 15), 30);
    push(`<path class="archeometer-astral-planetary-sector" data-degree="${fmt(normalizeDegrees(planet.degree))}" d="${sector}" fill="${escapeAttr(pointColor)}" fill-opacity="0.36" stroke="none"/>`);
  }

  for (let degree = 15; degree < 360; degree += 30) {
    const line = lineFromPolar(center, ring.r1, ring.r2, angleOf(model, degree));
    push(lineSvg(line, palette.ringStroke, 0.6 * scale, 0.42, "archeometer-astral-planetary-divider", ` data-degree="${fmt(degree)}"`));
  }

  for (const planet of sortedByDegree(model.planetaryPoints)) {
    const p = polarToXY(center, (ring.r1 + ring.r2) / 2, angleOf(model, planet.degree));
    const color = triangleVertexFillForDegree(model, planet.degree) ?? planet.color ?? nearestUtterance(planet.degree, model.utterance)?.color ?? palette.ink;
    const glyphSize = (planet.name === "Moon" ? 16.4 : 19) * scale;
    push(`<g class="archeometer-planet" data-planet="${escapeAttr(planet.name)}" data-degree="${fmt(normalizeDegrees(planet.degree))}">`);
    push(`<circle cx="${fmt(p.x)}" cy="${fmt(p.y)}" r="${fmt((ring.r2 - ring.r1) * 0.36)}" fill="${escapeAttr(color)}" fill-opacity="0.44" stroke="${escapeAttr(palette.ink)}" stroke-width="${fmt(0.8 * scale)}"/>`);
    push(textSvg(planet.glyph, p, glyphSize, palette.ink, 0, "middle"));
    push(`</g>`);
  }
  push(`</g>`);
}

function renderChromicRays(push: (line: string) => void, model: ArcheometerRenderModel) {
  push(`<g id="archeometer-chromic-rays" aria-label="dodecagonal crown of chromic circum-solar rays">`);
  push(`<g clip-path="url(#archeometer-chromic-clip)">`);
  renderChromicTriangleCore(push, model);
  push(`</g>`);
  push(`</g>`);
}

function renderChromicTriangleCore(push: (line: string) => void, model: ArcheometerRenderModel) {
  const { center, rings, palette, scale } = model;
  const trianglesById = new Map(model.triangles.map((triangle) => [triangle.id, triangle]));
  const wordJesus = trianglesById.get("wordJesus");
  const mary = trianglesById.get("mary");
  const ether = trianglesById.get("ether");
  const divineFire = trianglesById.get("divineFire");
  const chromic = (x: number, y: number) => scaleArcheometerReferencePoint(center, rings.chromicRays.r2, x, y);
  const path = (...commands: string[]) => commands.join(" ");
  const move = (x: number, y: number) => {
    const p = chromic(x, y);
    return `M ${fmt(p.x)} ${fmt(p.y)}`;
  };
  const line = (x: number, y: number) => {
    const p = chromic(x, y);
    return `L ${fmt(p.x)} ${fmt(p.y)}`;
  };
  const cubic = (x1: number, y1: number, x2: number, y2: number, x: number, y: number) => {
    const c1 = chromic(x1, y1);
    const c2 = chromic(x2, y2);
    const p = chromic(x, y);
    return `C ${fmt(c1.x)} ${fmt(c1.y)} ${fmt(c2.x)} ${fmt(c2.y)} ${fmt(p.x)} ${fmt(p.y)}`;
  };
  const strokeWidth = fmt(1.4 * scale);
  const primaryStroke = wordJesus?.stroke ?? palette.ink;

  push(`<g id="archeometer-chromic-triangle-core" aria-label="inner chromic primary triangle core">`);
  push(`<path class="archeometer-chromic-foundation" data-triangle="ether" d="${path(move(1.3999, 137.047), line(204.875, 19.5703), line(204.875, 254.523), "Z")}" fill="${escapeAttr(ether?.fill ?? "#78BD79")}" stroke="${escapeAttr(ether?.stroke ?? "#2D7737")}" stroke-width="${strokeWidth}"/>`);
  push(`<path class="archeometer-chromic-foundation" data-triangle="divineFire" d="${path(move(272.7, 137.047), line(69.2251, 254.523), line(69.2251, 19.5703), "Z")}" fill="${escapeAttr(divineFire?.fill ?? "#CC58A1")}" stroke="${escapeAttr(divineFire?.stroke ?? "#7D2A65")}" stroke-width="${strokeWidth}"/>`);
  push(`<path class="archeometer-chromic-foundation" data-triangle="mary" d="${path(move(137.05, 272.702), line(19.5737, 69.2266), line(254.527, 69.2266), "Z")}" fill="${escapeAttr(mary?.fill ?? "#E25B61")}" stroke="${escapeAttr(mary?.stroke ?? "#8C2028")}" stroke-width="${strokeWidth}"/>`);
  push(`<path class="archeometer-chromic-primary-facet" data-triangle="wordJesus" data-degree="120" d="${path(move(137.05, 204.874), line(254.527, 204.874), line(195.789, 103.136), cubic(195.789, 103.136, 215.377, 136.525, 195.789, 170.699), cubic(176.2, 204.874, 137.05, 204.874, 137.05, 204.874), "Z")}" fill="${escapeAttr(wordJesus?.vertexFills?.[1] ?? "#5470A5")}"/>`);
  push(`<path class="archeometer-chromic-primary-facet" data-triangle="wordJesus" data-degree="240" d="${path(move(19.5737, 204.874), line(137.05, 204.874), cubic(137.05, 204.874, 94.7002, 203.927, 78.312, 170.699), cubic(61.9238, 137.472, 78.312, 103.136, 78.312, 103.136), line(19.5737, 204.874), "Z")}" fill="${escapeAttr(wordJesus?.vertexFills?.[2] ?? "#DD3E38")}"/>`);
  push(`<path class="archeometer-chromic-primary-facet" data-triangle="wordJesus" data-degree="0" fill-rule="evenodd" clip-rule="evenodd" d="${path(move(195.789, 103.136), line(137.05, 1.39844), line(78.312, 103.136), cubic(78.312, 103.136, 100.9, 71.1992, 137.05, 71.1992), cubic(173.2, 71.1992, 195.789, 103.136, 195.789, 103.136), "Z")}" fill="${escapeAttr(wordJesus?.vertexFills?.[0] ?? "#F2CF45")}"/>`);
  push(`<path class="archeometer-chromic-primary-outline" data-triangle="wordJesus" d="${path(
    move(137.05, 204.874),
    line(254.527, 204.874),
    line(195.789, 103.136),
    move(137.05, 204.874),
    line(19.5737, 204.874),
    line(78.312, 103.136),
    move(137.05, 204.874),
    cubic(137.05, 204.874, 94.7002, 203.927, 78.312, 170.699),
    cubic(61.9238, 137.472, 78.312, 103.136, 78.312, 103.136),
    move(137.05, 204.874),
    cubic(137.05, 204.874, 176.2, 204.874, 195.789, 170.699),
    cubic(215.377, 136.525, 195.789, 103.136, 195.789, 103.136),
    move(195.789, 103.136),
    line(137.05, 1.39844),
    line(78.312, 103.136),
    move(195.789, 103.136),
    cubic(195.789, 103.136, 173.2, 71.1992, 137.05, 71.1992),
    cubic(100.9, 71.1992, 78.312, 103.136, 78.312, 103.136)
  )}" fill="none" stroke="${escapeAttr(primaryStroke)}" stroke-width="${strokeWidth}"/>`);
  push(`</g>`);
}

function renderWhiteRays(push: (line: string) => void, model: ArcheometerRenderModel) {
  const { center, rings, palette, scale } = model;
  const ring = rings.whiteRays;
  const staffCount = 5;

  push(`<g id="archeometer-white-rays" aria-label="crown of white rays and musical staff">`);
  for (let i = 1; i <= staffCount; i++) {
    const r = ring.r1 + ((ring.r2 - ring.r1) * i) / (staffCount + 1);
    push(`<circle cx="${fmt(center.x)}" cy="${fmt(center.y)}" r="${fmt(r)}" fill="none" stroke="${escapeAttr(palette.whiteRay)}" stroke-opacity="0.68" stroke-width="${fmt(0.85 * scale)}"/>`);
  }
  for (let degree = 0; degree < 180; degree += 30) {
    push(lineSvg(lineFromPolar(center, ring.r1, ring.r2, angleOf(model, degree)), palette.whiteRay, 1.55 * scale, 0.92));
    push(lineSvg(lineFromPolar(center, ring.r1, ring.r2, angleOf(model, degree + 180)), palette.whiteRay, 1.55 * scale, 0.92));
  }
  push(`</g>`);
}

function renderSolarCenter(push: (line: string) => void, model: ArcheometerRenderModel) {
  const { center, rings, palette, scale } = model;
  const r = rings.solarCenter.r2;
  const innerR = r * 0.68;
  const arcStart = polarToXY(center, innerR * 0.72, deg2rad(200));
  const arcEnd = polarToXY(center, innerR * 0.72, deg2rad(340));

  push(`<g id="archeometer-solar-center" aria-label="solar center Mi">`);
  push(`<circle cx="${fmt(center.x)}" cy="${fmt(center.y)}" r="${fmt(r)}" fill="${escapeAttr(palette.ringFills.solarCenter)}" stroke="${escapeAttr(palette.ink)}" stroke-width="${fmt(1.2 * scale)}"/>`);
  push(`<circle cx="${fmt(center.x)}" cy="${fmt(center.y)}" r="${fmt(innerR)}" fill="none" stroke="${escapeAttr(palette.ink)}" stroke-width="${fmt(0.9 * scale)}"/>`);
  push(`<line x1="${fmt(center.x - innerR)}" y1="${fmt(center.y)}" x2="${fmt(center.x + innerR)}" y2="${fmt(center.y)}" stroke="${escapeAttr(palette.ink)}" stroke-width="${fmt(1.1 * scale)}"/>`);
  push(`<path d="M ${fmt(arcStart.x)} ${fmt(arcStart.y)} A ${fmt(innerR * 0.72)} ${fmt(innerR * 0.72)} 0 0 1 ${fmt(arcEnd.x)} ${fmt(arcEnd.y)}" fill="none" stroke="${escapeAttr(palette.ink)}" stroke-width="${fmt(1.1 * scale)}"/>`);
  push(textSvg("Mi", { x: center.x, y: center.y - r * 0.06 }, 16 * scale, palette.ink, 0, "middle", 700));
  push(textSvg("☉", { x: center.x, y: center.y + r * 0.54 }, 13 * scale, palette.ink, 0, "middle"));
  push(`</g>`);
}

function renderFrame(push: (line: string) => void, model: ArcheometerRenderModel) {
  const { center, rings, palette, scale } = model;
  const radii = [
    rings.degreeOuter.r2,
    rings.degreeOuter.r1,
    rings.degreeInner.r1,
    rings.zodiacUtterance.r1,
    rings.planetaryUtterance.r1,
    rings.cosmologicalMusic.r1,
    rings.astralZodiac.r1,
    rings.astralPlanetary.r1,
    rings.chromicRays.r1,
    rings.whiteRays.r1,
    rings.solarCenter.r2,
  ];

  push(`<g id="archeometer-frame" aria-hidden="true">`);
  for (const radius of radii) {
    push(`<circle cx="${fmt(center.x)}" cy="${fmt(center.y)}" r="${fmt(radius)}" fill="none" stroke="${escapeAttr(palette.ringStroke)}" stroke-opacity="0.82" stroke-width="${fmt(0.85 * scale)}"/>`);
  }
  push(`<circle cx="${fmt(center.x)}" cy="${fmt(center.y)}" r="${fmt(rings.degreeOuter.r2)}" fill="none" stroke="${escapeAttr(palette.ringStroke)}" stroke-width="${fmt(2.2 * scale)}"/>`);
  push(`</g>`);
}

function buildRings(outerRadius: number): Record<ArcheometerRingId, ArcheometerRing> {
  const ring = (id: ArcheometerRingId, r1: number, r2: number): ArcheometerRing => ({
    id,
    r1: round(outerRadius * r1),
    r2: round(outerRadius * r2),
  });

  return {
    degreeOuter: ring("degreeOuter", 0.955, 1.0),
    degreeInner: ring("degreeInner", 0.905, 0.955),
    zodiacUtterance: ring("zodiacUtterance", 0.800, 0.885),
    planetaryUtterance: ring("planetaryUtterance", 0.555, 0.800),
    cosmologicalMusic: ring("cosmologicalMusic", 0.513, 0.555),
    astralZodiac: ring("astralZodiac", 0.460, 0.513),
    astralPlanetary: ring("astralPlanetary", 0.395, 0.460),
    chromicRays: ring("chromicRays", 0.198, 0.395),
    whiteRays: ring("whiteRays", 0.120, 0.198),
    solarCenter: ring("solarCenter", 0.000, 0.120),
  };
}

function planetaryTriangleClipOuterRadius(rings: Record<ArcheometerRingId, ArcheometerRing>) {
  return rings.planetaryUtterance.r2;
}

function resolvePalette(palette?: ArcheometerPalette): ResolvedArcheometerPalette {
  const base = COLOR_PALETTE;
  const overrides = typeof palette === "object" ? palette : {};
  return {
    paper: overrides.paper ?? base.paper,
    ink: overrides.ink ?? base.ink,
    subtleInk: overrides.subtleInk ?? base.subtleInk,
    ringStroke: overrides.ringStroke ?? base.ringStroke,
    degreeTick: overrides.degreeTick ?? base.degreeTick,
    degreeLabel: overrides.degreeLabel ?? base.degreeLabel,
    whiteRay: overrides.whiteRay ?? base.whiteRay,
    ringFills: { ...base.ringFills, ...(overrides.ringFills ?? {}) },
  };
}

function normalizeViewBox(viewBox?: ArcheometerSvgViewBox): Required<ArcheometerSvgViewBox> {
  return {
    minX: viewBox?.minX ?? ARCHEOMETER_DEFAULT_VIEWBOX.minX,
    minY: viewBox?.minY ?? ARCHEOMETER_DEFAULT_VIEWBOX.minY,
    width: viewBox?.width ?? ARCHEOMETER_DEFAULT_VIEWBOX.width,
    height: viewBox?.height ?? ARCHEOMETER_DEFAULT_VIEWBOX.height,
  };
}

function angleOf(model: Pick<ArcheometerRenderModel, "rotationDegrees">, degree: number) {
  return deg2rad(degree + model.rotationDegrees - 90);
}

function polarToXY(center: ArcheometerPoint, radius: number, angleRad: number): ArcheometerPoint {
  return {
    x: round(center.x + Math.cos(angleRad) * radius),
    y: round(center.y + Math.sin(angleRad) * radius),
  };
}

function scaleArcheometerReferencePoint(center: ArcheometerPoint, radius: number, x: number, y: number): ArcheometerPoint {
  const referenceCenter = 137.05;
  const referenceRadius = 135.652;
  const scale = radius / referenceRadius;
  return {
    x: round(center.x + (x - referenceCenter) * scale),
    y: round(center.y + (y - referenceCenter) * scale),
  };
}

function lineFromPolar(center: ArcheometerPoint, r1: number, r2: number, angleRad: number): ArcheometerLine {
  const p1 = polarToXY(center, r1, angleRad);
  const p2 = polarToXY(center, r2, angleRad);
  return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
}

function lineSvg(line: ArcheometerLine, color: string, strokeWidth: number, opacity = 1, className?: string, attributes = "") {
  const classAttr = className ? ` class="${escapeAttr(className)}"` : "";
  return `<line${classAttr}${attributes} x1="${fmt(line.x1)}" y1="${fmt(line.y1)}" x2="${fmt(line.x2)}" y2="${fmt(line.y2)}" stroke="${escapeAttr(color)}" stroke-opacity="${fmt(opacity)}" stroke-width="${fmt(strokeWidth)}" stroke-linecap="round"/>`;
}

function textSvg(
  value: string,
  p: ArcheometerPoint,
  fontSize: number,
  color: string,
  rotation = 0,
  anchor: "start" | "middle" | "end" = "middle",
  weight?: number,
  className?: string,
  attributes = ""
) {
  const transform = rotation ? ` transform="rotate(${fmt(rotation)} ${fmt(p.x)} ${fmt(p.y)})"` : "";
  const weightAttr = weight ? ` font-weight="${weight}"` : "";
  const classAttr = className ? ` class="${escapeAttr(className)}"` : "";
  return `<text${classAttr}${attributes} x="${fmt(p.x)}" y="${fmt(p.y)}"${transform} font-family="${textFontFamily()}" font-size="${fmt(fontSize)}" text-anchor="${anchor}" dominant-baseline="middle" fill="${escapeAttr(color)}"${weightAttr}>${escapeText(value)}</text>`;
}

function annulusPath(center: ArcheometerPoint, r1: number, r2: number) {
  return [
    `M ${fmt(center.x)} ${fmt(center.y - r2)}`,
    `A ${fmt(r2)} ${fmt(r2)} 0 1 1 ${fmt(center.x)} ${fmt(center.y + r2)}`,
    `A ${fmt(r2)} ${fmt(r2)} 0 1 1 ${fmt(center.x)} ${fmt(center.y - r2)}`,
    `M ${fmt(center.x)} ${fmt(center.y - r1)}`,
    `A ${fmt(r1)} ${fmt(r1)} 0 1 0 ${fmt(center.x)} ${fmt(center.y + r1)}`,
    `A ${fmt(r1)} ${fmt(r1)} 0 1 0 ${fmt(center.x)} ${fmt(center.y - r1)}`,
    `Z`,
  ].join(" ");
}

function annularSectorPath(center: ArcheometerPoint, r1: number, r2: number, startAngle: number, endAngle: number, spanDegrees: number) {
  const outerStart = polarToXY(center, r2, startAngle);
  const outerEnd = polarToXY(center, r2, endAngle);
  const innerEnd = polarToXY(center, r1, endAngle);
  const innerStart = polarToXY(center, r1, startAngle);
  const largeArc = Math.abs(spanDegrees) > 180 ? 1 : 0;
  const sweep = spanDegrees >= 0 ? 1 : 0;
  const inverseSweep = sweep ? 0 : 1;

  return [
    `M ${fmt(outerStart.x)} ${fmt(outerStart.y)}`,
    `A ${fmt(r2)} ${fmt(r2)} 0 ${largeArc} ${sweep} ${fmt(outerEnd.x)} ${fmt(outerEnd.y)}`,
    `L ${fmt(innerEnd.x)} ${fmt(innerEnd.y)}`,
    `A ${fmt(r1)} ${fmt(r1)} 0 ${largeArc} ${inverseSweep} ${fmt(innerStart.x)} ${fmt(innerStart.y)}`,
    `Z`,
  ].join(" ");
}

function arcSegmentPath(center: ArcheometerPoint, radius: number, startAngle: number, endAngle: number) {
  const start = polarToXY(center, radius, startAngle);
  const end = polarToXY(center, radius, endAngle);
  return `M ${fmt(start.x)} ${fmt(start.y)} A ${fmt(radius)} ${fmt(radius)} 0 0 1 ${fmt(end.x)} ${fmt(end.y)}`;
}

function polygonPath(points: readonly ArcheometerPoint[]) {
  if (points.length === 0) return "";
  const [first, ...rest] = points;
  return [`M ${fmt(first.x)} ${fmt(first.y)}`, ...rest.map((p) => `L ${fmt(p.x)} ${fmt(p.y)}`), "Z"].join(" ");
}

function midpoint(a: ArcheometerPoint, b: ArcheometerPoint): ArcheometerPoint {
  return { x: round((a.x + b.x) / 2), y: round((a.y + b.y) / 2) };
}

function polygonCentroid(points: readonly ArcheometerPoint[]): ArcheometerPoint {
  const total = points.reduce(
    (sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }),
    { x: 0, y: 0 }
  );
  return { x: round(total.x / points.length), y: round(total.y / points.length) };
}

function sortedByDegree<T extends { degree: number }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => normalizeDegrees(a.degree) - normalizeDegrees(b.degree));
}

function nearestUtterance(degree: number, utterance: readonly ArcheometerUtterancePoint[]) {
  let best: ArcheometerUtterancePoint | undefined;
  let bestDelta = Number.POSITIVE_INFINITY;
  for (const point of utterance) {
    const delta = Math.abs(shortestAngularDistance(degree, point.degree));
    if (delta < bestDelta) {
      best = point;
      bestDelta = delta;
    }
  }
  return best;
}

function triangleVertexFillForDegree(model: ArcheometerRenderModel, degree: number) {
  for (const triangle of model.triangles) {
    if (!triangle.vertexFills) continue;
    for (const [index, vertexDegree] of triangle.vertices.entries()) {
      if (Math.abs(shortestAngularDistance(degree, vertexDegree)) < 0.001) {
        return triangle.vertexFills[index];
      }
    }
  }
  return undefined;
}

function tangentRotation(angleRad: number) {
  let degrees = rad2deg(angleRad) + 90;
  degrees = ((degrees % 360) + 360) % 360;
  if (degrees > 90 && degrees < 270) degrees += 180;
  return ((degrees % 360) + 360) % 360;
}

function shortestAngularDistance(a: number, b: number) {
  return ((normalizeDegrees(a) - normalizeDegrees(b) + 540) % 360) - 180;
}

function normalizeDegrees(value: number) {
  return ((value % 360) + 360) % 360;
}

function deg2rad(degrees: number) {
  return degrees * (TAU / 360);
}

function rad2deg(radians: number) {
  return radians * (360 / TAU);
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

function fmt(value: number) {
  if (!Number.isFinite(value)) return "0";
  return Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

function escapeAttr(value: string) {
  return escapeText(value).replace(/"/g, "&quot;");
}

function escapeText(value: string) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function textFontFamily() {
  return "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans Symbols 2', 'Noto Sans Symbols', 'Segoe UI Symbol', 'Apple Symbols', sans-serif";
}
