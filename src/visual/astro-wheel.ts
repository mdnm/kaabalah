import type {
  AspectEdge,
  AspectName,
  AspectSpec,
  BirthChart,
  HydratedNode,
  HydratedPlanet,
  ZodiacPosition,
} from "../astrology";

export interface AstroWheelViewBox {
  minX?: number;
  minY?: number;
  width: number;
  height: number;
}

export type AstroWheelElement = "fire" | "earth" | "air" | "water";

export type AstroWheelZodiacSign =
  | "Aries"
  | "Taurus"
  | "Gemini"
  | "Cancer"
  | "Leo"
  | "Virgo"
  | "Libra"
  | "Scorpio"
  | "Sagittarius"
  | "Capricorn"
  | "Aquarius"
  | "Pisces";

export interface AstroWheelPaletteOverrides {
  ringStroke?: string;
  label?: string;
  subtle?: string;
  zodiacStroke?: string;
  zodiacGlyph?: string;
  houseLine?: string;
  houseLabel?: string;
  angleLine?: string;
  angleLabel?: string;
  planetGlyph?: string;
  planetTick?: string;
  aspectGuide?: string;
  signColors?: Partial<Record<AstroWheelZodiacSign, string>>;
  elementColors?: Partial<Record<AstroWheelElement, string>>;
  aspects?: Partial<Record<AspectName | (string & {}), string>>;
}

export type AstroWheelPalette = "default" | "monochrome" | AstroWheelPaletteOverrides;

export interface AstroWheelAspectOptions {
  enabled?: boolean;
  /**
   * Explicit aspect edges to render. When omitted, the renderer uses
   * `chart.aspects`; if `aspectSpecs` is supplied it recomputes planet aspects.
   */
  edges?: readonly AspectEdge[];
  /** Recompute aspects from chart planets with caller-controlled orbs. */
  aspectSpecs?: readonly AspectSpec[];
}

export interface AstroWheelZodiacOptions {
  segments?: boolean;
  glyphs?: boolean;
  ticks?: boolean;
}

export interface AstroWheelHouseOptions {
  labels?: boolean;
  cuspLines?: boolean;
  angles?: boolean;
}

export interface AstroWheelPointOptions {
  enabled?: boolean;
  nodes?: boolean;
  vertex?: boolean;
}

export interface AstroWheelPointSource {
  key?: string;
  name: string;
  longitude: number;
  kind?: AstroWheelPointKind;
  glyph?: string;
  zodiacPosition?: ZodiacPosition;
}

export interface AstroWheelPointLayerInput {
  id: string;
  label?: string;
  chart?: BirthChart;
  points?: readonly AstroWheelPointSource[];
  color?: string;
  tickColor?: string;
  radius?: number | "inner" | "base" | "outer";
  radiusOffset?: number;
  glyphScale?: number;
  nodes?: boolean;
  vertex?: boolean;
}

export interface AstroWheelAspectLayerInput {
  id: string;
  label?: string;
  chart?: BirthChart;
  edges?: readonly AspectEdge[];
  aspectSpecs?: readonly AspectSpec[];
  pointLayerId?: string;
  color?: string;
  colors?: Partial<Record<AspectName | (string & {}), string>>;
  radius?: number;
  radiusScale?: number;
  strokeWidth?: number;
  opacityScale?: number;
  pointLayerIdA?: string;
  pointLayerIdB?: string;
}

export interface AstroWheelSvgOptions {
  width?: number | string;
  height?: number | string;
  viewBox?: AstroWheelViewBox;
  background?: string | "transparent";
  palette?: AstroWheelPalette;
  zodiac?: boolean | AstroWheelZodiacOptions;
  aspects?: boolean | AstroWheelAspectOptions;
  houses?: boolean | AstroWheelHouseOptions;
  points?: boolean | AstroWheelPointOptions;
  pointLayers?: readonly AstroWheelPointLayerInput[];
  aspectLayers?: readonly AstroWheelAspectLayerInput[];
  padding?: number;
  title?: string;
}

export interface AstroWheelCoordinate {
  x: number;
  y: number;
}

export interface AstroWheelLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface AstroWheelRing {
  id: "aspects" | "planets" | "zodiac" | "houses";
  r1: number;
  r2: number;
}

export interface AstroWheelZodiacSegment {
  sign: AstroWheelZodiacSign;
  glyph: string;
  element: AstroWheelElement;
  longitudeStart: number;
  longitudeEnd: number;
  angleStart: number;
  angleEnd: number;
  path: string;
  fill: string;
  labelPosition: AstroWheelCoordinate;
  labelFontSize: number;
}

export type AstroGlyphPrimitive =
  | { kind: "path"; d: string }
  | { kind: "circle"; cx: number; cy: number; r: number }
  | { kind: "line"; x1: number; y1: number; x2: number; y2: number }
  | { kind: "polyline"; points: string };

type ZodiacGlyphPrimitive = AstroGlyphPrimitive;

export interface AstroWheelHouseCusp {
  house: number;
  longitude: number;
  sign: string;
  line: AstroWheelLine;
  labelPosition: AstroWheelCoordinate;
  labelFontSize: number;
}

export interface AstroWheelAngleMarker {
  key: "ASC" | "MC" | "DSC" | "IC";
  longitude: number;
  line: AstroWheelLine;
  labelPosition: AstroWheelCoordinate;
  labelFontSize: number;
}

export type AstroWheelPointKind = "planet" | "node" | "vertex";

export interface AstroWheelPoint {
  layerId: string;
  key: string;
  name: string;
  kind: AstroWheelPointKind;
  glyph: string;
  longitude: number;
  displayLongitude: number;
  zodiacPosition?: ZodiacPosition;
  tickLine: AstroWheelLine;
  glyphPosition: AstroWheelCoordinate;
  glyphFontSize: number;
  color: string;
  tickColor: string;
}

export interface AstroWheelAspectLine {
  layerId: string;
  planetA: string;
  planetB: string;
  planetAKey: string;
  planetBKey: string;
  aspect: AspectName | (string & {});
  aspectAngle: number;
  delta: number;
  orb: number;
  color: string;
  opacity: number;
  line: AstroWheelLine;
  strokeWidth: number;
}

export interface AstroWheelPointLayer {
  id: string;
  label?: string;
  color: string;
  tickColor: string;
  radius: number;
  points: readonly AstroWheelPoint[];
}

export interface AstroWheelAspectLayer {
  id: string;
  label?: string;
  aspectLines: readonly AstroWheelAspectLine[];
}

export interface AstroWheelRenderModel {
  viewBox: Required<AstroWheelViewBox>;
  center: AstroWheelCoordinate;
  outerRadius: number;
  scale: number;
  ascendantLongitude: number;
  rings: Record<AstroWheelRing["id"], AstroWheelRing>;
  zodiacSegments: readonly AstroWheelZodiacSegment[];
  houseCusps: readonly AstroWheelHouseCusp[];
  angleMarkers: readonly AstroWheelAngleMarker[];
  points: readonly AstroWheelPoint[];
  pointByKey: Record<string, AstroWheelPoint>;
  aspectLines: readonly AstroWheelAspectLine[];
  pointLayers: readonly AstroWheelPointLayer[];
  aspectLayers: readonly AstroWheelAspectLayer[];
  palette: ResolvedAstroWheelPalette;
}

interface ResolvedZodiacOptions {
  segments: boolean;
  glyphs: boolean;
  ticks: boolean;
}

interface ResolvedHouseOptions {
  labels: boolean;
  cuspLines: boolean;
  angles: boolean;
}

interface ResolvedAspectOptions {
  enabled: boolean;
  edges?: readonly AspectEdge[];
  aspectSpecs?: readonly AspectSpec[];
}

export interface ResolvedAstroWheelPalette {
  ringStroke: string;
  label: string;
  subtle: string;
  zodiacStroke: string;
  zodiacGlyph: string;
  houseLine: string;
  houseLabel: string;
  angleLine: string;
  angleLabel: string;
  planetGlyph: string;
  planetTick: string;
  aspectGuide: string;
  signColors: Partial<Record<AstroWheelZodiacSign, string>>;
  elementColors: Record<AstroWheelElement, string>;
  aspects: Record<string, string>;
}

const TAU = Math.PI * 2;

export const ASTRO_WHEEL_DEFAULT_VIEWBOX: Required<AstroWheelViewBox> = {
  minX: 0,
  minY: 0,
  width: 600,
  height: 600,
};

export const ASTRO_WHEEL_DEFAULT_ASPECT_SPECS = [
  { name: "conjunction", angle: 0, orb: 8 },
  { name: "duodecile", angle: 30, orb: 2 },
  { name: "octile", angle: 45, orb: 3 },
  { name: "sextile", angle: 60, orb: 5 },
  { name: "square", angle: 90, orb: 6 },
  { name: "trine", angle: 120, orb: 7 },
  { name: "trioctile", angle: 135, orb: 3 },
  { name: "quincunx", angle: 150, orb: 3 },
  { name: "opposition", angle: 180, orb: 8 },
] as const satisfies readonly AspectSpec[];

export const ASTRO_WHEEL_ZODIAC_SIGNS = [
  { sign: "Aries", glyph: "♈", element: "fire" },
  { sign: "Taurus", glyph: "♉", element: "earth" },
  { sign: "Gemini", glyph: "♊", element: "air" },
  { sign: "Cancer", glyph: "♋", element: "water" },
  { sign: "Leo", glyph: "♌", element: "fire" },
  { sign: "Virgo", glyph: "♍", element: "earth" },
  { sign: "Libra", glyph: "♎", element: "air" },
  { sign: "Scorpio", glyph: "♏", element: "water" },
  { sign: "Sagittarius", glyph: "♐", element: "fire" },
  { sign: "Capricorn", glyph: "♑", element: "earth" },
  { sign: "Aquarius", glyph: "♒", element: "air" },
  { sign: "Pisces", glyph: "♓", element: "water" },
] as const satisfies readonly {
  sign: AstroWheelZodiacSign;
  glyph: string;
  element: AstroWheelElement;
}[];

export const ASTRO_WHEEL_POINT_GLYPHS: Record<string, string> = {
  sun: "☉",
  moon: "☽",
  mercury: "☿",
  venus: "♀",
  mars: "♂",
  jupiter: "♃",
  saturn: "♄",
  uranus: "♅",
  neptune: "♆",
  pluto: "♇",
  earth: "⊕",
  "mean node": "☊",
  "true node": "☊",
  "lilith mean": "⚸",
  "lilith true": "⚸",
  chiron: "⚷",
  "wheel of fortune": "⊗",
  "pars fortunae": "⊗",
  vertex: "Vtx",
};

export const ZODIAC_GLYPH_PRIMITIVES: Record<AstroWheelZodiacSign, readonly AstroGlyphPrimitive[]> = {
  Aries: [
    { kind: "path", d: "M 0 0.8 V -0.1" },
    { kind: "path", d: "M 0 -0.1 C -0.12 -0.58 -0.62 -0.92 -0.86 -0.42 C -1.02 -0.08 -0.58 0.2 0 0.02" },
    { kind: "path", d: "M 0 -0.1 C 0.12 -0.58 0.62 -0.92 0.86 -0.42 C 1.02 -0.08 0.58 0.2 0 0.02" },
  ],
  Taurus: [
    { kind: "circle", cx: 0, cy: 0.28, r: 0.42 },
    { kind: "path", d: "M -0.78 -0.34 C -0.58 -0.88 -0.2 -0.72 0 -0.24 C 0.2 -0.72 0.58 -0.88 0.78 -0.34" },
  ],
  Gemini: [
    { kind: "line", x1: -0.68, y1: -0.72, x2: 0.68, y2: -0.72 },
    { kind: "line", x1: -0.68, y1: 0.72, x2: 0.68, y2: 0.72 },
    { kind: "line", x1: -0.34, y1: -0.72, x2: -0.34, y2: 0.72 },
    { kind: "line", x1: 0.34, y1: -0.72, x2: 0.34, y2: 0.72 },
  ],
  Cancer: [
    { kind: "circle", cx: -0.34, cy: 0.22, r: 0.24 },
    { kind: "circle", cx: 0.34, cy: -0.22, r: 0.24 },
    { kind: "path", d: "M -0.86 -0.14 C -0.34 -0.58 0.54 -0.56 0.88 -0.08" },
    { kind: "path", d: "M 0.86 0.14 C 0.34 0.58 -0.54 0.56 -0.88 0.08" },
  ],
  Leo: [
    { kind: "circle", cx: -0.36, cy: -0.18, r: 0.27 },
    { kind: "path", d: "M -0.1 -0.06 C 0.22 -0.72 0.88 -0.42 0.62 0.14 C 0.42 0.56 0.74 0.86 0.96 0.52" },
    { kind: "path", d: "M -0.26 0.08 C -0.44 0.42 -0.72 0.62 -0.96 0.62" },
  ],
  Virgo: [
    { kind: "path", d: "M -0.82 0.7 V -0.38 C -0.62 -0.72 -0.42 -0.52 -0.42 -0.08 V 0.7" },
    { kind: "path", d: "M -0.42 -0.08 C -0.22 -0.72 0.02 -0.52 0.02 -0.08 V 0.7" },
    { kind: "path", d: "M 0.02 -0.08 C 0.22 -0.72 0.48 -0.5 0.48 -0.1 V 0.56" },
    { kind: "path", d: "M 0.48 0.28 C 0.7 0.86 1 0.58 0.74 0.16" },
  ],
  Libra: [
    { kind: "path", d: "M -0.54 0 C -0.48 -0.58 0.48 -0.58 0.54 0" },
    { kind: "line", x1: -0.9, y1: 0.24, x2: 0.9, y2: 0.24 },
    { kind: "line", x1: -0.9, y1: 0.62, x2: 0.9, y2: 0.62 },
  ],
  Scorpio: [
    { kind: "path", d: "M -0.82 0.64 V -0.36 C -0.62 -0.72 -0.42 -0.5 -0.42 -0.08 V 0.64" },
    { kind: "path", d: "M -0.42 -0.08 C -0.2 -0.72 0.02 -0.5 0.02 -0.08 V 0.64" },
    { kind: "path", d: "M 0.02 -0.08 C 0.22 -0.72 0.48 -0.5 0.48 -0.08 V 0.5 L 0.86 0.84" },
    { kind: "path", d: "M 0.86 0.84 H 0.52" },
    { kind: "path", d: "M 0.86 0.84 V 0.5" },
  ],
  Sagittarius: [
    { kind: "line", x1: -0.7, y1: 0.72, x2: 0.68, y2: -0.66 },
    { kind: "line", x1: 0.68, y1: -0.66, x2: 0.1, y2: -0.58 },
    { kind: "line", x1: 0.68, y1: -0.66, x2: 0.58, y2: -0.08 },
    { kind: "line", x1: -0.34, y1: -0.08, x2: 0.24, y2: 0.5 },
  ],
  Capricorn: [
    { kind: "path", d: "M -0.86 -0.42 C -0.62 -0.78 -0.34 -0.54 -0.34 0.46" },
    { kind: "path", d: "M -0.34 -0.08 C -0.1 -0.58 0.18 -0.42 0.18 0.2" },
    { kind: "path", d: "M 0.18 0.2 C 0.34 -0.24 0.86 -0.2 0.86 0.24 C 0.86 0.82 0.18 0.86 0.18 0.2" },
  ],
  Aquarius: [
    { kind: "polyline", points: "-0.88,-0.32 -0.56,-0.56 -0.24,-0.32 0.08,-0.56 0.4,-0.32 0.72,-0.56" },
    { kind: "polyline", points: "-0.72,0.18 -0.4,-0.06 -0.08,0.18 0.24,-0.06 0.56,0.18 0.88,-0.06" },
  ],
  Pisces: [
    { kind: "path", d: "M -0.5 -0.76 C -0.86 -0.32 -0.86 0.32 -0.5 0.76" },
    { kind: "path", d: "M 0.5 -0.76 C 0.86 -0.32 0.86 0.32 0.5 0.76" },
    { kind: "line", x1: -0.78, y1: 0, x2: 0.78, y2: 0 },
  ],
};

export type AstroWheelPlanetGlyphKey =
  | "sun"
  | "moon"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto"
  | "chiron"
  | "north node"
  | "south node"
  | "pars fortunae";

export const PLANET_GLYPH_PRIMITIVES: Record<AstroWheelPlanetGlyphKey, readonly AstroGlyphPrimitive[]> = {
  sun: [
    { kind: "circle", cx: 0, cy: 0, r: 0.62 },
    { kind: "circle", cx: 0, cy: 0, r: 0.04 },
  ],
  moon: [
    { kind: "path", d: "M 0.1 -0.66 C -0.54 -0.5 -0.54 0.5 0.1 0.66 C -0.28 0.4 -0.28 -0.4 0.1 -0.66" },
  ],
  mercury: [
    { kind: "circle", cx: 0, cy: 0, r: 0.36 },
    { kind: "line", x1: 0, y1: 0.36, x2: 0, y2: 0.82 },
    { kind: "line", x1: -0.26, y1: 0.64, x2: 0.26, y2: 0.64 },
    { kind: "path", d: "M -0.32 -0.14 C -0.32 -0.56 0.32 -0.56 0.32 -0.14" },
  ],
  venus: [
    { kind: "circle", cx: 0, cy: -0.2, r: 0.38 },
    { kind: "line", x1: 0, y1: 0.18, x2: 0, y2: 0.78 },
    { kind: "line", x1: -0.26, y1: 0.52, x2: 0.26, y2: 0.52 },
  ],
  mars: [
    { kind: "circle", cx: -0.12, cy: 0.12, r: 0.4 },
    { kind: "line", x1: 0.16, y1: -0.16, x2: 0.66, y2: -0.66 },
    { kind: "line", x1: 0.66, y1: -0.66, x2: 0.3, y2: -0.66 },
    { kind: "line", x1: 0.66, y1: -0.66, x2: 0.66, y2: -0.3 },
  ],
  jupiter: [
    { kind: "path", d: "M -0.54 -0.48 C -0.26 -0.48 0.04 -0.28 -0.06 -0.04 C -0.16 0.2 -0.44 0.28 -0.54 0.14" },
    { kind: "line", x1: -0.54, y1: 0.14, x2: 0.64, y2: 0.14 },
    { kind: "line", x1: 0.3, y1: -0.52, x2: 0.3, y2: 0.68 },
  ],
  saturn: [
    { kind: "line", x1: -0.32, y1: -0.68, x2: 0.32, y2: -0.68 },
    { kind: "line", x1: 0, y1: -0.68, x2: 0, y2: 0.22 },
    { kind: "path", d: "M 0 0.22 C 0.48 0.22 0.48 0.72 0 0.72 C -0.2 0.72 -0.32 0.56 -0.24 0.4" },
  ],
  uranus: [
    { kind: "circle", cx: 0, cy: 0.52, r: 0.16 },
    { kind: "line", x1: 0, y1: 0.36, x2: 0, y2: -0.38 },
    { kind: "path", d: "M -0.48 -0.62 C -0.48 -0.2 -0.48 0.02 -0.48 0.02" },
    { kind: "path", d: "M 0.48 -0.62 C 0.48 -0.2 0.48 0.02 0.48 0.02" },
    { kind: "line", x1: -0.48, y1: -0.38, x2: 0.48, y2: -0.38 },
  ],
  neptune: [
    { kind: "line", x1: 0, y1: -0.68, x2: 0, y2: 0.68 },
    { kind: "line", x1: -0.36, y1: 0.44, x2: 0.36, y2: 0.44 },
    { kind: "path", d: "M -0.5 0.04 C -0.5 -0.56 0 -0.78 0 -0.68" },
    { kind: "path", d: "M 0.5 0.04 C 0.5 -0.56 0 -0.78 0 -0.68" },
  ],
  pluto: [
    { kind: "circle", cx: 0, cy: -0.16, r: 0.26 },
    { kind: "path", d: "M -0.42 -0.16 C -0.42 -0.56 0.42 -0.56 0.42 -0.16" },
    { kind: "line", x1: 0, y1: 0.1, x2: 0, y2: 0.72 },
    { kind: "line", x1: -0.26, y1: 0.44, x2: 0.26, y2: 0.44 },
  ],
  chiron: [
    { kind: "circle", cx: 0, cy: 0.44, r: 0.28 },
    { kind: "line", x1: 0, y1: 0.16, x2: 0, y2: -0.52 },
    { kind: "line", x1: 0, y1: -0.24, x2: 0.42, y2: -0.66 },
    { kind: "line", x1: 0.42, y1: -0.66, x2: 0.14, y2: -0.5 },
    { kind: "line", x1: 0.42, y1: -0.66, x2: 0.3, y2: -0.36 },
  ],
  "north node": [
    { kind: "path", d: "M -0.52 0.14 C -0.52 -0.38 0 -0.58 0 -0.22" },
    { kind: "path", d: "M 0.52 0.14 C 0.52 -0.38 0 -0.58 0 -0.22" },
    { kind: "path", d: "M -0.52 0.14 C -0.52 0.54 0 0.68 0 0.36" },
    { kind: "path", d: "M 0.52 0.14 C 0.52 0.54 0 0.68 0 0.36" },
  ],
  "south node": [
    { kind: "path", d: "M -0.52 -0.14 C -0.52 0.38 0 0.58 0 0.22" },
    { kind: "path", d: "M 0.52 -0.14 C 0.52 0.38 0 0.58 0 0.22" },
    { kind: "path", d: "M -0.52 -0.14 C -0.52 -0.54 0 -0.68 0 -0.36" },
    { kind: "path", d: "M 0.52 -0.14 C 0.52 -0.54 0 -0.68 0 -0.36" },
  ],
  "pars fortunae": [
    { kind: "circle", cx: 0, cy: 0, r: 0.56 },
    { kind: "line", x1: -0.56, y1: 0, x2: 0.56, y2: 0 },
    { kind: "line", x1: 0, y1: -0.56, x2: 0, y2: 0.56 },
  ],
};

export type AstroWheelAspectGlyphKey =
  | "conjunction"
  | "opposition"
  | "square"
  | "trine"
  | "sextile"
  | "semisquare"
  | "sesquisquare"
  | "inconjunct"
  | "semisextile"
  | "quintile"
  | "biquintile";

export const ASPECT_GLYPH_PRIMITIVES: Record<AstroWheelAspectGlyphKey, readonly AstroGlyphPrimitive[]> = {
  conjunction: [
    { kind: "circle", cx: 0, cy: -0.22, r: 0.36 },
    { kind: "line", x1: 0, y1: 0.14, x2: 0, y2: 0.78 },
  ],
  opposition: [
    { kind: "circle", cx: 0, cy: -0.38, r: 0.26 },
    { kind: "line", x1: 0, y1: -0.12, x2: 0, y2: 0.52 },
    { kind: "circle", cx: 0, cy: 0.52, r: 0.26 },
  ],
  square: [
    { kind: "path", d: "M -0.48 -0.48 L 0.48 -0.48 L 0.48 0.48 L -0.48 0.48 Z" },
  ],
  trine: [
    { kind: "path", d: "M 0 -0.62 L 0.58 0.46 L -0.58 0.46 Z" },
  ],
  sextile: [
    { kind: "path", d: "M 0 -0.66 L 0.58 -0.32 L 0.58 0.32 L 0 0.66 L -0.58 0.32 L -0.58 -0.32 Z" },
  ],
  semisquare: [
    { kind: "path", d: "M 0 -0.56 L 0.56 0 L 0 0.56 L -0.56 0 Z" },
    { kind: "line", x1: 0, y1: 0.56, x2: 0, y2: 0.82 },
  ],
  sesquisquare: [
    { kind: "path", d: "M -0.44 -0.46 L 0.44 -0.46 L 0.44 0.32 L -0.44 0.32 Z" },
    { kind: "line", x1: 0, y1: 0.32, x2: 0, y2: 0.78 },
  ],
  inconjunct: [
    { kind: "path", d: "M -0.4 -0.38 C -0.4 -0.76 0.4 -0.76 0.4 -0.38 L 0.4 0.08 L -0.4 0.08 Z" },
    { kind: "line", x1: 0, y1: 0.08, x2: 0, y2: 0.78 },
  ],
  semisextile: [
    { kind: "path", d: "M 0 -0.62 L 0.58 0.46 L -0.58 0.46 Z" },
    { kind: "line", x1: 0, y1: 0.46, x2: 0, y2: 0.82 },
  ],
  quintile: [
    { kind: "path", d: "M 0 0.72 L -0.22 0.06 L 0.36 -0.42" },
    { kind: "path", d: "M 0 0.72 L 0.22 0.06 L -0.36 -0.42" },
    { kind: "path", d: "M -0.36 -0.42 L 0.36 -0.42" },
  ],
  biquintile: [
    { kind: "path", d: "M 0 -0.72 L 0.22 -0.06 L 0.72 0.22 L 0.44 0.62 L -0.44 0.62 L -0.72 0.22 L -0.22 -0.06 Z" },
  ],
};

const DEFAULT_PALETTE: ResolvedAstroWheelPalette = {
  ringStroke: "#2f2a24",
  label: "#1f2933",
  subtle: "#aaa29a",
  zodiacStroke: "#2f2a24",
  zodiacGlyph: "#1f2933",
  houseLine: "#9a9189",
  houseLabel: "#1f2933",
  angleLine: "#111827",
  angleLabel: "#111827",
  planetGlyph: "#111827",
  planetTick: "#111827",
  aspectGuide: "#d7d0c6",
  elementColors: {
    fire: "#d65a31",
    earth: "#b8a64d",
    air: "#5aa469",
    water: "#3b77c4",
  },
  signColors: {},
  aspects: {
    conjunction: "#777777",
    duodecile: "#9a8f7a",
    octile: "#c47d31",
    sextile: "#2f80c0",
    square: "#d64b4b",
    trine: "#2f9e55",
    trioctile: "#c47d31",
    quincunx: "#8b5cf6",
    opposition: "#d64b4b",
  },
};

const MONOCHROME_PALETTE: ResolvedAstroWheelPalette = {
  ringStroke: "#222222",
  label: "#222222",
  subtle: "#9a9a9a",
  zodiacStroke: "#222222",
  zodiacGlyph: "#222222",
  houseLine: "#777777",
  houseLabel: "#222222",
  angleLine: "#111111",
  angleLabel: "#111111",
  planetGlyph: "#111111",
  planetTick: "#111111",
  aspectGuide: "#c9c9c9",
  elementColors: {
    fire: "#ececec",
    earth: "#d8d8d8",
    air: "#f5f5f5",
    water: "#e3e3e3",
  },
  signColors: {},
  aspects: {
    conjunction: "#666666",
    duodecile: "#999999",
    octile: "#777777",
    sextile: "#777777",
    square: "#555555",
    trine: "#777777",
    trioctile: "#777777",
    quincunx: "#888888",
    opposition: "#555555",
  },
};

export interface GlyphSvgOptions {
  size?: number;
  color?: string;
  strokeWidth?: number;
  fill?: "none" | string;
  background?: string | "transparent";
}

export function generateGlyphSvg(
  primitives: readonly AstroGlyphPrimitive[],
  options: GlyphSvgOptions = {}
): string {
  const size = options.size ?? 48;
  const color = options.color ?? "#111827";
  const sw = options.strokeWidth ?? 0.14;
  const fillVal = options.fill ?? "none";
  const bg = options.background ?? "transparent";
  const scale = size / 2;
  const cx = size / 2;
  const cy = size / 2;
  const lines: string[] = [];
  const push = (s: string) => lines.push(s);

  push(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`);
  if (bg !== "transparent") {
    push(`<rect width="${size}" height="${size}" fill="${escapeAttr(bg)}"/>`);
  }
  push(`<g transform="translate(${cx} ${cy}) scale(${fmt(scale)})" fill="${escapeAttr(fillVal)}" stroke="${escapeAttr(color)}" stroke-width="${fmt(sw)}" stroke-linecap="round" stroke-linejoin="round">`);
  for (const p of primitives) {
    if (p.kind === "path") {
      push(`<path d="${escapeAttr(p.d)}"/>`);
    } else if (p.kind === "circle") {
      push(`<circle cx="${fmt(p.cx)}" cy="${fmt(p.cy)}" r="${fmt(p.r)}"/>`);
    } else if (p.kind === "line") {
      push(`<line x1="${fmt(p.x1)}" y1="${fmt(p.y1)}" x2="${fmt(p.x2)}" y2="${fmt(p.y2)}"/>`);
    } else {
      push(`<polyline points="${escapeAttr(p.points)}"/>`);
    }
  }
  push(`</g>`);
  push(`</svg>`);
  return lines.join("\n");
}

export function getAstroWheelRenderModel(
  chart: BirthChart,
  options: AstroWheelSvgOptions = {}
): AstroWheelRenderModel {
  const viewBox = normalizeViewBox(options.viewBox);
  const palette = resolvePalette(options.palette);
  const scale = Math.min(
    viewBox.width / ASTRO_WHEEL_DEFAULT_VIEWBOX.width,
    viewBox.height / ASTRO_WHEEL_DEFAULT_VIEWBOX.height
  );
  const padding = options.padding ?? round(18 * scale);
  const center = {
    x: round(viewBox.minX + viewBox.width / 2),
    y: round(viewBox.minY + viewBox.height / 2),
  };
  const outerRadius = round(Math.max(0, Math.min(viewBox.width, viewBox.height) / 2 - padding));
  const angleOf = (longitude: number) =>
    deg2rad(clamp360(180 + chart.houses.ascendant.longitude - longitude));
  const rings = buildRings(outerRadius);
  const resolvedPoints = resolvePointOptions(options.points);
  const resolvedHouses = resolveHouseOptions(options.houses);
  const resolvedAspects = resolveAspectOptions(options.aspects);
  const zodiacSegments = buildZodiacSegments({ center, angleOf, rings, scale, palette });
  const houseCusps = resolvedHouses.cuspLines || resolvedHouses.labels
    ? buildHouseCusps({
        houses: chart.houses.houses,
        center,
        angleOf,
        rings,
        scale,
      })
    : [];
  const angleMarkers = resolvedHouses.angles
    ? buildAngleMarkers({
        chart,
        center,
        angleOf,
        rings,
        scale,
      })
    : [];
  const basePointLayer = buildPointLayer({
    layer: {
      id: "birth",
      label: "Birth",
      chart,
      color: palette.planetGlyph,
      tickColor: palette.planetTick,
      radius: "base",
      nodes: resolvedPoints.nodes,
      vertex: resolvedPoints.vertex,
    },
    center,
    angleOf,
    rings,
    scale,
    palette,
  });
  const extraPointLayers = (options.pointLayers ?? []).map((layer) =>
    buildPointLayer({
      layer,
      center,
      angleOf,
      rings,
      scale,
      palette,
    })
  );
  const pointLayers = [
    ...(resolvedPoints.enabled ? [basePointLayer] : []),
    ...extraPointLayers,
  ];
  const points = pointLayers.flatMap((layer) => [...layer.points]);
  const pointByKey = Object.fromEntries(points.map((point) => [point.key, point]));
  const baseAspectLayer = resolvedAspects.enabled
    ? buildAspectLayer({
        layer: {
          id: "birth",
          label: "Birth aspects",
          chart,
          edges: resolvedAspects.edges,
          aspectSpecs: resolvedAspects.aspectSpecs,
        },
        chart,
        pointByKey,
        center,
        angleOf,
        rings,
        palette,
      })
    : null;
  const extraAspectLayers = (options.aspectLayers ?? []).map((layer) =>
    buildAspectLayer({
      layer,
      chart: layer.chart ?? chart,
      pointByKey,
      center,
      angleOf,
      rings,
      palette,
    })
  );
  const aspectLayers = [
    ...(baseAspectLayer ? [baseAspectLayer] : []),
    ...extraAspectLayers,
  ];
  const aspectLines = aspectLayers.flatMap((layer) => [...layer.aspectLines]);

  return {
    viewBox,
    center,
    outerRadius,
    scale,
    ascendantLongitude: normalizeAngle(chart.houses.ascendant.longitude),
    rings,
    zodiacSegments,
    houseCusps,
    angleMarkers,
    points,
    pointByKey,
    aspectLines,
    pointLayers,
    aspectLayers,
    palette,
  };
}

export function generateAstroWheelSvg(
  chart: BirthChart,
  options: AstroWheelSvgOptions = {}
): string {
  const model = getAstroWheelRenderModel(chart, options);
  const viewBox = model.viewBox;
  const zodiacOptions = resolveZodiacOptions(options.zodiac);
  const houseOptions = resolveHouseOptions(options.houses);
  const background = options.background ?? "transparent";
  const lines: string[] = [];
  const push = (line: string) => lines.push(line);
  const svgAttributes = [
    `xmlns="http://www.w3.org/2000/svg"`,
    options.width !== undefined ? `width="${escapeAttr(String(options.width))}"` : "",
    options.height !== undefined ? `height="${escapeAttr(String(options.height))}"` : "",
    `viewBox="${fmt(viewBox.minX)} ${fmt(viewBox.minY)} ${fmt(viewBox.width)} ${fmt(viewBox.height)}"`,
    `preserveAspectRatio="xMidYMid meet"`,
    `role="img"`,
    `aria-label="${escapeAttr(options.title ?? "Astrological birth chart wheel")}"`,
  ].filter(Boolean);

  push(`<svg ${svgAttributes.join(" ")}>`);
  push(`<title>${escapeText(options.title ?? "Astrological birth chart wheel")}</title>`);

  if (background !== "transparent") {
    push(
      `<rect x="${fmt(viewBox.minX)}" y="${fmt(viewBox.minY)}" width="${fmt(viewBox.width)}" height="${fmt(viewBox.height)}" fill="${escapeAttr(background)}"/>`
    );
  }

  renderAspects(push, model);
  renderZodiac(push, model, zodiacOptions);
  renderHouses(push, model, houseOptions);
  renderPlanets(push, model);
  push(`</svg>`);

  return lines.join("\n");
}

function renderAspects(
  push: (line: string) => void,
  model: AstroWheelRenderModel
) {
  if (model.aspectLayers.length === 0) {
    return;
  }

  const guideRadius = model.rings.aspects.r2 * 0.96;
  push(`<g id="astro-wheel-aspects" aria-label="aspects">`);
  for (const layer of model.aspectLayers) {
    push(`<g class="astro-wheel-aspect-layer" data-aspect-layer="${escapeAttr(layer.id)}"${layer.label ? ` aria-label="${escapeAttr(layer.label)}"` : ""}>`);
    for (const aspect of layer.aspectLines) {
      push(
        `<line data-aspect-layer="${escapeAttr(aspect.layerId)}" data-aspect="${escapeAttr(aspect.aspect)}" data-planet-a="${escapeAttr(aspect.planetA)}" data-planet-b="${escapeAttr(aspect.planetB)}" x1="${fmt(aspect.line.x1)}" y1="${fmt(aspect.line.y1)}" x2="${fmt(aspect.line.x2)}" y2="${fmt(aspect.line.y2)}" stroke="${escapeAttr(aspect.color)}" stroke-opacity="${fmt(aspect.opacity)}" stroke-width="${fmt(aspect.strokeWidth)}"/>`
      );
    }
    push(`</g>`);
  }
  push(
    `<circle cx="${fmt(model.center.x)}" cy="${fmt(model.center.y)}" r="${fmt(guideRadius)}" fill="none" stroke="${escapeAttr(model.palette.aspectGuide)}" stroke-width="${fmt(model.scale)}"/>`
  );
  push(`</g>`);
}

function renderZodiac(
  push: (line: string) => void,
  model: AstroWheelRenderModel,
  options: ResolvedZodiacOptions
) {
  if (!options.segments && !options.glyphs && !options.ticks) {
    return;
  }

  const tickEvery = 1;
  const { center, rings, palette, scale } = model;
  const thickness = rings.zodiac.r2 - rings.zodiac.r1;
  const angleOf = (longitude: number) =>
    deg2rad(clamp360(180 + model.ascendantLongitude - longitude));

  push(`<g id="astro-wheel-zodiac" aria-label="zodiac">`);
  if (options.segments) {
    for (const segment of model.zodiacSegments) {
      push(
        `<path data-zodiac-sign="${escapeAttr(segment.sign)}" data-zodiac-element="${escapeAttr(segment.element)}" d="${segment.path}" fill="${escapeAttr(segment.fill)}" fill-opacity="0.82" stroke="${escapeAttr(palette.zodiacStroke)}" stroke-width="${fmt(model.scale)}"/>`
      );
    }
  }

  if (options.glyphs) {
    for (const segment of model.zodiacSegments) {
      renderZodiacGlyph(push, segment, palette);
    }
  }

  if (options.ticks) {
    for (let index = 0; index < 360 / tickEvery; index++) {
      const longitude = index * tickEvery;
      const angle = angleOf(longitude);
      const isMajor = index % 6 === 0;
      const inner = polarToXY(
        center.x,
        center.y,
        rings.zodiac.r2 - (isMajor ? thickness * 0.3 : thickness * 0.15),
        angle
      );
      const outer = polarToXY(center.x, center.y, rings.zodiac.r2, angle);
      push(
        `<line data-zodiac-tick="${longitude}" x1="${fmt(inner.x)}" y1="${fmt(inner.y)}" x2="${fmt(outer.x)}" y2="${fmt(outer.y)}" stroke="${escapeAttr(palette.zodiacStroke)}" stroke-width="${fmt(isMajor ? 1.2 * scale : scale)}"/>`
      );
    }
  }

  push(`</g>`);
}

function renderZodiacGlyph(
  push: (line: string) => void,
  segment: AstroWheelZodiacSegment,
  palette: ResolvedAstroWheelPalette
) {
  const primitives = ZODIAC_GLYPH_PRIMITIVES[segment.sign];
  const scale = segment.labelFontSize * 0.56;
  const strokeWidth = clamp(0.12 / Math.max(scale / 10, 0.6), 0.1, 0.18);

  push(
    `<g data-zodiac-glyph="${escapeAttr(segment.sign)}" data-zodiac-symbol="${escapeAttr(segment.glyph)}" transform="translate(${fmt(segment.labelPosition.x)} ${fmt(segment.labelPosition.y)}) scale(${fmt(scale)})" fill="none" stroke="${escapeAttr(palette.zodiacGlyph)}" stroke-width="${fmt(strokeWidth)}" stroke-linecap="round" stroke-linejoin="round">`
  );
  push(`<title>${escapeText(`${segment.sign} ${segment.glyph}`)}</title>`);
  for (const primitive of primitives) {
    if (primitive.kind === "path") {
      push(`<path d="${escapeAttr(primitive.d)}"/>`);
    } else if (primitive.kind === "circle") {
      push(`<circle cx="${fmt(primitive.cx)}" cy="${fmt(primitive.cy)}" r="${fmt(primitive.r)}"/>`);
    } else if (primitive.kind === "line") {
      push(`<line x1="${fmt(primitive.x1)}" y1="${fmt(primitive.y1)}" x2="${fmt(primitive.x2)}" y2="${fmt(primitive.y2)}"/>`);
    } else {
      push(`<polyline points="${escapeAttr(primitive.points)}"/>`);
    }
  }
  push(`</g>`);
}

function renderHouses(
  push: (line: string) => void,
  model: AstroWheelRenderModel,
  options: ResolvedHouseOptions
) {
  if (!options.cuspLines && !options.labels && !options.angles) {
    return;
  }

  push(`<g id="astro-wheel-houses" aria-label="houses">`);
  if (options.cuspLines) {
    for (const cusp of model.houseCusps) {
      push(
        `<line data-house-cusp="${cusp.house}" x1="${fmt(cusp.line.x1)}" y1="${fmt(cusp.line.y1)}" x2="${fmt(cusp.line.x2)}" y2="${fmt(cusp.line.y2)}" stroke="${escapeAttr(model.palette.houseLine)}" stroke-width="${fmt(1.25 * model.scale)}"/>`
      );
    }
  }

  if (options.labels) {
    for (const cusp of model.houseCusps) {
      push(
        `<text data-house-label="${cusp.house}" x="${fmt(cusp.labelPosition.x)}" y="${fmt(cusp.labelPosition.y)}" font-family="${textFontFamily()}" font-size="${fmt(cusp.labelFontSize)}" text-anchor="middle" dominant-baseline="middle" fill="${escapeAttr(model.palette.houseLabel)}">${cusp.house}</text>`
      );
    }
  }

  if (options.angles) {
    for (const marker of model.angleMarkers) {
      push(`<g data-angle-marker="${marker.key}">`);
      push(
        `<line x1="${fmt(marker.line.x1)}" y1="${fmt(marker.line.y1)}" x2="${fmt(marker.line.x2)}" y2="${fmt(marker.line.y2)}" stroke="${escapeAttr(model.palette.angleLine)}" stroke-width="${fmt(2 * model.scale)}"/>`
      );
      push(
        `<text x="${fmt(marker.labelPosition.x)}" y="${fmt(marker.labelPosition.y)}" font-family="${textFontFamily()}" font-size="${fmt(marker.labelFontSize)}" text-anchor="middle" dominant-baseline="middle" fill="${escapeAttr(model.palette.angleLabel)}">${marker.key}</text>`
      );
      push(`</g>`);
    }
  }
  push(`</g>`);
}

function renderPlanets(
  push: (line: string) => void,
  model: AstroWheelRenderModel
) {
  if (model.pointLayers.length === 0) {
    return;
  }

  push(`<g id="astro-wheel-planets" aria-label="planets">`);

  for (const layer of model.pointLayers) {
    push(`<g class="astro-wheel-point-layer" data-point-layer="${escapeAttr(layer.id)}"${layer.label ? ` aria-label="${escapeAttr(layer.label)}"` : ""}>`);
    for (const point of layer.points) {
      push(
        `<g class="astro-wheel-point" data-point-layer="${escapeAttr(point.layerId)}" data-point-key="${escapeAttr(point.key)}" data-point-name="${escapeAttr(point.name)}" data-point-kind="${point.kind}" data-longitude="${fmt(point.longitude)}">`
      );
      push(`<title>${escapeText(point.name)} ${fmt(point.longitude)}°</title>`);
      push(
        `<line x1="${fmt(point.tickLine.x1)}" y1="${fmt(point.tickLine.y1)}" x2="${fmt(point.tickLine.x2)}" y2="${fmt(point.tickLine.y2)}" stroke="${escapeAttr(point.tickColor)}" stroke-opacity="0.85" stroke-width="${fmt(model.scale)}"/>`
      );
      renderPointGlyph(push, point);
      push(`</g>`);
    }
    push(`</g>`);
  }

  push(`</g>`);
}

function renderPointGlyph(
  push: (line: string) => void,
  point: AstroWheelPoint
) {
  const primitives = resolvePointGlyphPrimitives(point.name);

  if (primitives) {
    const glyphScale = point.glyphFontSize * 0.56;
    const strokeWidth = clamp(0.12 / Math.max(glyphScale / 10, 0.6), 0.1, 0.18);
    push(
      `<g data-point-glyph="${escapeAttr(point.name)}" transform="translate(${fmt(point.glyphPosition.x)} ${fmt(point.glyphPosition.y)}) scale(${fmt(glyphScale)})" fill="none" stroke="${escapeAttr(point.color)}" stroke-width="${fmt(strokeWidth)}" stroke-linecap="round" stroke-linejoin="round">`
    );
    for (const p of primitives) {
      if (p.kind === "path") {
        push(`<path d="${escapeAttr(p.d)}"/>`);
      } else if (p.kind === "circle") {
        push(`<circle cx="${fmt(p.cx)}" cy="${fmt(p.cy)}" r="${fmt(p.r)}"/>`);
      } else if (p.kind === "line") {
        push(`<line x1="${fmt(p.x1)}" y1="${fmt(p.y1)}" x2="${fmt(p.x2)}" y2="${fmt(p.y2)}"/>`);
      } else {
        push(`<polyline points="${escapeAttr(p.points)}"/>`);
      }
    }
    push(`</g>`);
  } else {
    push(
      `<text x="${fmt(point.glyphPosition.x)}" y="${fmt(point.glyphPosition.y)}" font-family="${symbolFontFamily()}" font-size="${fmt(point.glyphFontSize)}" text-anchor="middle" dominant-baseline="middle" fill="${escapeAttr(point.color)}">${escapeText(point.glyph)}</text>`
    );
  }
}

const POINT_GLYPH_ALIASES: Record<string, AstroWheelPlanetGlyphKey> = {
  "mean node": "north node",
  "true node": "north node",
  "wheel of fortune": "pars fortunae",
};

function resolvePointGlyphPrimitives(name: string): readonly AstroGlyphPrimitive[] | null {
  const key = name.trim().toLocaleLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  const resolved = POINT_GLYPH_ALIASES[key] ?? key;
  return (PLANET_GLYPH_PRIMITIVES as Record<string, readonly AstroGlyphPrimitive[] | undefined>)[resolved] ?? null;
}

function buildZodiacSegments(params: {
  center: AstroWheelCoordinate;
  angleOf: (longitude: number) => number;
  rings: Record<AstroWheelRing["id"], AstroWheelRing>;
  scale: number;
  palette: ResolvedAstroWheelPalette;
}): AstroWheelZodiacSegment[] {
  const { center, angleOf, rings, scale, palette } = params;
  const boundaries = unwrapAngles(
    Array.from({ length: ASTRO_WHEEL_ZODIAC_SIGNS.length + 1 }, (_, index) =>
      angleOf(index * 30)
    ),
    "dec"
  );
  const thickness = rings.zodiac.r2 - rings.zodiac.r1;
  const labelFontSize = clamp(thickness * 0.45, 9 * scale, 22 * scale);

  return ASTRO_WHEEL_ZODIAC_SIGNS.map((entry, index) => {
    const angleStart = boundaries[index];
    const angleEnd = boundaries[index + 1];
    const labelPosition = polarToXY(
      center.x,
      center.y,
      (rings.zodiac.r1 + rings.zodiac.r2) / 2,
      angleOf(index * 30 + 15)
    );
    return {
      sign: entry.sign,
      glyph: entry.glyph,
      element: entry.element,
      longitudeStart: index * 30,
      longitudeEnd: index === 11 ? 360 : (index + 1) * 30,
      angleStart,
      angleEnd,
      path: arcPath(center.x, center.y, rings.zodiac.r1, rings.zodiac.r2, angleStart, angleEnd),
      fill: palette.signColors[entry.sign] ?? palette.elementColors[entry.element],
      labelPosition,
      labelFontSize,
    };
  });
}

function buildHouseCusps(params: {
  houses: readonly ZodiacPosition[];
  center: AstroWheelCoordinate;
  angleOf: (longitude: number) => number;
  rings: Record<AstroWheelRing["id"], AstroWheelRing>;
  scale: number;
}): AstroWheelHouseCusp[] {
  const { houses, center, angleOf, rings, scale } = params;
  const ring = rings.houses;
  const mid = (ring.r1 + ring.r2) / 2;
  const labelFontSize = clamp((ring.r2 - ring.r1) * 0.35, 9 * scale, 20 * scale);

  return houses.map((house, index) => {
    const angle = angleOf(house.longitude);
    const line = {
      ...lineFromPolar(center, ring.r1 + 2 * scale, ring.r2 - 2 * scale, angle),
    };
    const next = houses[(index + 1) % houses.length];
    const span = clamp360(next.longitude - house.longitude);
    const labelLongitude = clamp360(house.longitude + span / 2);
    return {
      house: index + 1,
      longitude: normalizeAngle(house.longitude),
      sign: house.sign,
      line,
      labelPosition: polarToXY(center.x, center.y, mid, angleOf(labelLongitude)),
      labelFontSize,
    };
  });
}

function buildAngleMarkers(params: {
  chart: BirthChart;
  center: AstroWheelCoordinate;
  angleOf: (longitude: number) => number;
  rings: Record<AstroWheelRing["id"], AstroWheelRing>;
  scale: number;
}): AstroWheelAngleMarker[] {
  const { chart, center, angleOf, rings, scale } = params;
  const ring = rings.houses;
  const labelFontSize = clamp((ring.r2 - ring.r1) * 0.3, 8 * scale, 18 * scale);
  const markers = [
    { key: "ASC" as const, position: chart.houses.ascendant },
    { key: "MC" as const, position: chart.houses.mc },
    { key: "DSC" as const, position: chart.houses.dc },
    { key: "IC" as const, position: chart.houses.ic },
  ];

  return markers.map((marker) => {
    const angle = angleOf(marker.position.longitude);
    return {
      key: marker.key,
      longitude: normalizeAngle(marker.position.longitude),
      line: lineFromPolar(center, ring.r1 + 4 * scale, ring.r2 - 4 * scale, angle),
      labelPosition: polarWithNudge(center.x, center.y, (ring.r1 + ring.r2) / 2, angle, 0, 10 * scale),
      labelFontSize,
    };
  });
}

function buildPointLayer(params: {
  layer: AstroWheelPointLayerInput;
  center: AstroWheelCoordinate;
  angleOf: (longitude: number) => number;
  rings: Record<AstroWheelRing["id"], AstroWheelRing>;
  scale: number;
  palette: ResolvedAstroWheelPalette;
}): AstroWheelPointLayer {
  const { layer, center, angleOf, rings, scale, palette } = params;
  const ring = rings.planets;
  const radius = resolvePointLayerRadius(layer, ring);
  const thickness = ring.r2 - ring.r1;
  const glyphFontSize = clamp(thickness * 0.6, 12 * scale, 26 * scale) * (layer.glyphScale ?? 1);
  const tickLength = Math.min(10 * scale, thickness * 0.25);
  const minSepDeg = Math.max(
    2,
    Math.min(8, ((glyphFontSize * 0.9) / Math.max(radius, 1)) * (180 / Math.PI))
  );
  const neighborShiftDeg = minSepDeg * 0.65;
  const seeds = getPointSeeds(layer);
  const clusters = clusterPointSeeds(seeds, minSepDeg);
  const color = layer.color ?? palette.planetGlyph;
  const tickColor = layer.tickColor ?? color;

  const points = clusters.flatMap((cluster) =>
    cluster.map((seed, index) => {
      const offset = (index - (cluster.length - 1) / 2) * neighborShiftDeg;
      const displayLongitude = normalizeAngle(seed.longitude + offset);
      const tickAngle = angleOf(seed.longitude);
      const glyphAngle = angleOf(displayLongitude);
      return {
        layerId: layer.id,
        key: seed.key,
        name: seed.name,
        kind: seed.kind,
        glyph: seed.glyph,
        longitude: normalizeAngle(seed.longitude),
        displayLongitude,
        zodiacPosition: seed.zodiacPosition,
        tickLine: lineFromPolar(center, ring.r2 - tickLength, ring.r2, tickAngle),
        glyphPosition: polarToXY(center.x, center.y, radius, glyphAngle),
        glyphFontSize: seed.kind === "vertex" ? glyphFontSize * 0.62 : glyphFontSize,
        color,
        tickColor,
      };
    })
  );

  return {
    id: layer.id,
    label: layer.label,
    color,
    tickColor,
    radius,
    points,
  };
}

function buildAspectLayer(params: {
  layer: AstroWheelAspectLayerInput;
  chart: BirthChart;
  pointByKey: Record<string, AstroWheelPoint>;
  center: AstroWheelCoordinate;
  angleOf: (longitude: number) => number;
  rings: Record<AstroWheelRing["id"], AstroWheelRing>;
  palette: ResolvedAstroWheelPalette;
}): AstroWheelAspectLayer {
  const { layer, chart, pointByKey, center, angleOf, rings, palette } = params;
  const sourceEdges = getSourceAspectEdges(chart, {
    enabled: true,
    edges: layer.edges,
    aspectSpecs: layer.aspectSpecs,
  });
  const aspectRadius = layer.radius ?? rings.aspects.r2 * (layer.radiusScale ?? 0.96);
  const layerPointPrefix = pointKeyPrefix(layer.pointLayerId);
  const layerPointPrefixA = layer.pointLayerIdA ? pointKeyPrefix(layer.pointLayerIdA) : layerPointPrefix;
  const layerPointPrefixB = layer.pointLayerIdB ? pointKeyPrefix(layer.pointLayerIdB) : layerPointPrefix;

  const aspectLines = sourceEdges.flatMap((edge) => {
    const planetAKey = layerPointPrefixA + normalizePointKey(edge.planetA);
    const planetBKey = layerPointPrefixB + normalizePointKey(edge.planetB);
    const planetA = pointByKey[planetAKey];
    const planetB = pointByKey[planetBKey];

    if (!planetA || !planetB) {
      return [];
    }

    const spec = findAspectSpec(edge.aspect, layer.aspectSpecs);
    const maxOrb = spec?.orb ?? 8;
    const opacity = clamp((1 - edge.orb / Math.max(maxOrb, 0.001)) * (layer.opacityScale ?? 1), 0.25, 0.92);
    const a = polarToXY(center.x, center.y, aspectRadius, angleOf(planetA.longitude));
    const b = polarToXY(center.x, center.y, aspectRadius, angleOf(planetB.longitude));

    return [{
      layerId: layer.id,
      planetA: planetA.name,
      planetB: planetB.name,
      planetAKey,
      planetBKey,
      aspect: edge.aspect,
      aspectAngle: edge.aspectAngle,
      delta: edge.delta,
      orb: edge.orb,
      color: layer.color ?? layer.colors?.[edge.aspect] ?? palette.aspects[edge.aspect] ?? palette.label,
      opacity,
      line: {
        x1: a.x,
        y1: a.y,
        x2: b.x,
        y2: b.y,
      },
      strokeWidth: layer.strokeWidth ?? 1.25,
    }];
  });

  return {
    id: layer.id,
    label: layer.label,
    aspectLines,
  };
}

function getPointSeeds(
  layer: AstroWheelPointLayerInput
): PointSeed[] {
  const seeds: PointSeed[] = [];
  const chart = layer.chart;

  if (chart) {
    seeds.push(
      ...Object.entries(chart.planets).map(([key, planet]) =>
        planetSeed(key, planet, layer.id)
      )
    );
  }

  if (layer.points) {
    seeds.push(
      ...layer.points.map((point) => pointSeed(point, layer.id))
    );
  }

  if (chart && layer.nodes !== false) {
    for (const [key, node] of Object.entries(chart.nodes)) {
      seeds.push(nodeSeed(key, node, layer.id));
    }
  }

  if (chart && layer.vertex !== false && chart.houses.ascmc?.vertex) {
    seeds.push({
      key: layerPointKey(layer.id, "vertex"),
      name: "Vertex",
      kind: "vertex",
      glyph: ASTRO_WHEEL_POINT_GLYPHS.vertex,
      longitude: chart.houses.ascmc.vertex.longitude,
      zodiacPosition: chart.houses.ascmc.vertex,
    });
  }

  return seeds.sort((a, b) => normalizeAngle(a.longitude) - normalizeAngle(b.longitude));
}

interface PointSeed {
  key: string;
  name: string;
  kind: AstroWheelPointKind;
  glyph: string;
  longitude: number;
  zodiacPosition?: ZodiacPosition;
}

function planetSeed(key: string, planet: HydratedPlanet, layerId: string): PointSeed {
  return {
    key: layerPointKey(layerId, key || planet.name),
    name: planet.name,
    kind: "planet",
    glyph: pointGlyph(planet.name),
    longitude: planet.longitude,
    zodiacPosition: planet.zodiacPosition,
  };
}

function nodeSeed(key: string, node: HydratedNode, layerId: string): PointSeed {
  return {
    key: layerPointKey(layerId, node.name || key),
    name: node.name,
    kind: "node",
    glyph: pointGlyph(node.name),
    longitude: node.longitude,
    zodiacPosition: node,
  };
}

function pointSeed(point: AstroWheelPointSource, layerId: string): PointSeed {
  return {
    key: layerPointKey(layerId, point.key ?? point.name),
    name: point.name,
    kind: point.kind ?? "planet",
    glyph: point.glyph ?? pointGlyph(point.name),
    longitude: point.longitude,
    zodiacPosition: point.zodiacPosition,
  };
}

function clusterPointSeeds(seeds: readonly PointSeed[], minSepDeg: number): PointSeed[][] {
  if (seeds.length === 0) {
    return [];
  }

  const clusters: PointSeed[][] = [];
  let current: PointSeed[] = [];
  for (const seed of seeds) {
    if (current.length === 0) {
      current.push(seed);
      continue;
    }

    const previous = current[current.length - 1];
    const delta = clamp360(seed.longitude - previous.longitude);
    if (delta <= minSepDeg) {
      current.push(seed);
    } else {
      clusters.push(current);
      current = [seed];
    }
  }
  clusters.push(current);

  if (clusters.length > 1) {
    const first = clusters[0];
    const last = clusters[clusters.length - 1];
    const wrapDelta = clamp360(first[0].longitude - last[last.length - 1].longitude);
    if (wrapDelta <= minSepDeg) {
      clusters[0] = [...last, ...first];
      clusters.pop();
    }
  }

  return clusters;
}

function getSourceAspectEdges(
  chart: BirthChart,
  options: ResolvedAspectOptions
): readonly AspectEdge[] {
  if (options.edges) {
    return options.edges;
  }

  if (options.aspectSpecs) {
    return computeAspectEdges(chart.planets, options.aspectSpecs);
  }

  return chart.aspects?.length
    ? chart.aspects
    : computeAspectEdges(chart.planets, ASTRO_WHEEL_DEFAULT_ASPECT_SPECS);
}

function computeAspectEdges(
  planets: Record<string, { longitude: number }>,
  specs: readonly AspectSpec[]
): AspectEdge[] {
  const keys = Object.keys(planets);
  const edges: AspectEdge[] = [];

  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const planetA = planets[keys[i]];
      const planetB = planets[keys[j]];
      const match = getAspectMatch(planetA.longitude, planetB.longitude, specs);
      if (!match) {
        continue;
      }

      edges.push({
        planetA: keys[i],
        planetB: keys[j],
        longitudeA: normalizeAngle(planetA.longitude),
        longitudeB: normalizeAngle(planetB.longitude),
        aspect: match.spec.name,
        aspectAngle: match.spec.angle,
        delta: match.delta,
        orb: match.orb,
      });
    }
  }

  return edges;
}

function getAspectMatch(
  lonA: number,
  lonB: number,
  specs: readonly AspectSpec[]
): { spec: AspectSpec; orb: number; delta: number } | null {
  const delta = Math.min(
    normalizeAngle(lonB - lonA),
    normalizeAngle(lonA - lonB)
  );

  for (const spec of specs) {
    const orb = Math.abs(delta - spec.angle);
    if (orb <= spec.orb) {
      return { spec, orb, delta };
    }
  }

  return null;
}

function findAspectSpec(
  aspect: string,
  specs: readonly AspectSpec[] = ASTRO_WHEEL_DEFAULT_ASPECT_SPECS
) {
  return specs.find((spec) => spec.name === aspect);
}

function buildRings(outerRadius: number): Record<AstroWheelRing["id"], AstroWheelRing> {
  const ringMap = buildRingMap(outerRadius, [
    { id: "houses", fr: 10 },
    { id: "zodiac", fr: 12 },
    { id: "planets", fr: 20 },
    { id: "aspects", fr: 58 },
  ]);

  return {
    aspects: ringMap.aspects,
    planets: ringMap.planets,
    zodiac: ringMap.zodiac,
    houses: ringMap.houses,
  };
}

function buildRingMap(
  radius: number,
  defs: readonly { id: AstroWheelRing["id"]; fr: number }[]
): Record<AstroWheelRing["id"], AstroWheelRing> {
  const frTotal = defs.reduce((sum, def) => sum + def.fr, 0);
  let cursor = radius;
  const result = {} as Record<AstroWheelRing["id"], AstroWheelRing>;

  for (const def of defs) {
    const thickness = (radius * def.fr) / frTotal;
    const r2 = cursor;
    const r1 = cursor - thickness;
    result[def.id] = {
      id: def.id,
      r1: round(r1),
      r2: round(r2),
    };
    cursor = r1;
  }

  return result;
}

function resolvePalette(palette: AstroWheelPalette = "default"): ResolvedAstroWheelPalette {
  const base = palette === "monochrome" ? MONOCHROME_PALETTE : DEFAULT_PALETTE;
  if (palette === "default" || palette === "monochrome") {
    return clonePalette(base);
  }

  return {
    ...base,
    ...palette,
    signColors: {
      ...base.signColors,
      ...(palette.signColors ?? {}),
    },
    elementColors: {
      ...base.elementColors,
      ...(palette.elementColors ?? {}),
    },
    aspects: {
      ...base.aspects,
      ...(palette.aspects ?? {}),
    },
  };
}

function clonePalette(palette: ResolvedAstroWheelPalette): ResolvedAstroWheelPalette {
  return {
    ...palette,
    signColors: { ...palette.signColors },
    elementColors: { ...palette.elementColors },
    aspects: { ...palette.aspects },
  };
}

function resolveZodiacOptions(options: boolean | AstroWheelZodiacOptions | undefined): ResolvedZodiacOptions {
  if (options === false) {
    return { segments: false, glyphs: false, ticks: false };
  }

  if (options === true || options === undefined) {
    return { segments: true, glyphs: true, ticks: true };
  }

  return {
    segments: options.segments ?? true,
    glyphs: options.glyphs ?? true,
    ticks: options.ticks ?? true,
  };
}

function resolveHouseOptions(options: boolean | AstroWheelHouseOptions | undefined): ResolvedHouseOptions {
  if (options === false) {
    return { labels: false, cuspLines: false, angles: false };
  }

  if (options === true || options === undefined) {
    return { labels: true, cuspLines: true, angles: true };
  }

  return {
    labels: options.labels ?? true,
    cuspLines: options.cuspLines ?? true,
    angles: options.angles ?? true,
  };
}

function resolvePointOptions(options: boolean | AstroWheelPointOptions | undefined): Required<AstroWheelPointOptions> {
  if (options === false) {
    return { enabled: false, nodes: false, vertex: false };
  }

  if (options === true || options === undefined) {
    return { enabled: true, nodes: true, vertex: true };
  }

  return {
    enabled: options.enabled ?? true,
    nodes: options.nodes ?? true,
    vertex: options.vertex ?? true,
  };
}

function resolveAspectOptions(options: boolean | AstroWheelAspectOptions | undefined): ResolvedAspectOptions {
  if (options === false) {
    return { enabled: false };
  }

  if (options === true || options === undefined) {
    return { enabled: true };
  }

  return {
    enabled: options.enabled ?? true,
    edges: options.edges,
    aspectSpecs: options.aspectSpecs,
  };
}

function resolvePointLayerRadius(layer: AstroWheelPointLayerInput, ring: AstroWheelRing) {
  const base = (ring.r1 + ring.r2) / 2;
  const radius = layer.radius === "inner"
    ? ring.r1
    : layer.radius === "outer"
      ? ring.r2
      : typeof layer.radius === "number"
        ? layer.radius
        : base;

  return radius + (layer.radiusOffset ?? 0);
}

function normalizeViewBox(viewBox: AstroWheelViewBox | undefined): Required<AstroWheelViewBox> {
  return {
    minX: viewBox?.minX ?? ASTRO_WHEEL_DEFAULT_VIEWBOX.minX,
    minY: viewBox?.minY ?? ASTRO_WHEEL_DEFAULT_VIEWBOX.minY,
    width: viewBox?.width ?? ASTRO_WHEEL_DEFAULT_VIEWBOX.width,
    height: viewBox?.height ?? ASTRO_WHEEL_DEFAULT_VIEWBOX.height,
  };
}

function pointGlyph(name: string) {
  return ASTRO_WHEEL_POINT_GLYPHS[normalizePointKey(name)] ?? name.charAt(0).toUpperCase();
}

function normalizePointKey(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function layerPointKey(layerId: string, value: string) {
  const key = normalizePointKey(value);
  return layerId === "birth" ? key : `${layerId}:${key}`;
}

function pointKeyPrefix(layerId: string | undefined) {
  return !layerId || layerId === "birth" ? "" : `${layerId}:`;
}

function normalizeAngle(value: number) {
  return clamp360(value);
}

function clamp360(value: number) {
  return ((value % 360) + 360) % 360;
}

function deg2rad(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function polarToXY(cx: number, cy: number, radius: number, angleRad: number): AstroWheelCoordinate {
  return {
    x: round(cx + radius * Math.cos(angleRad)),
    y: round(cy + radius * Math.sin(angleRad)),
  };
}

function polarWithNudge(
  cx: number,
  cy: number,
  radius: number,
  angleRad: number,
  radialOffset = 0,
  tangentOffset = 0
): AstroWheelCoordinate {
  const x = cx + (radius + radialOffset) * Math.cos(angleRad);
  const y = cy + (radius + radialOffset) * Math.sin(angleRad);
  const tangentX = -Math.sin(angleRad);
  const tangentY = Math.cos(angleRad);

  return {
    x: round(x + tangentX * tangentOffset),
    y: round(y + tangentY * tangentOffset),
  };
}

function lineFromPolar(
  center: AstroWheelCoordinate,
  r1: number,
  r2: number,
  angleRad: number
): AstroWheelLine {
  const p1 = polarToXY(center.x, center.y, r1, angleRad);
  const p2 = polarToXY(center.x, center.y, r2, angleRad);
  return {
    x1: p1.x,
    y1: p1.y,
    x2: p2.x,
    y2: p2.y,
  };
}

function arcPath(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  angleStart: number,
  angleEnd: number
) {
  const p0 = polarToXY(cx, cy, outerRadius, angleStart);
  const p1 = polarToXY(cx, cy, outerRadius, angleEnd);
  const p2 = polarToXY(cx, cy, innerRadius, angleEnd);
  const p3 = polarToXY(cx, cy, innerRadius, angleStart);
  const large = Math.abs(angleEnd - angleStart) % TAU > Math.PI ? 1 : 0;
  const sweep = angleEnd > angleStart ? 1 : 0;

  return [
    `M ${fmt(p0.x)},${fmt(p0.y)}`,
    `A ${fmt(outerRadius)},${fmt(outerRadius)} 0 ${large} ${sweep} ${fmt(p1.x)},${fmt(p1.y)}`,
    `L ${fmt(p2.x)},${fmt(p2.y)}`,
    `A ${fmt(innerRadius)},${fmt(innerRadius)} 0 ${large} ${sweep ? 0 : 1} ${fmt(p3.x)},${fmt(p3.y)}`,
    "Z",
  ].join(" ");
}

function unwrapAngles(angles: readonly number[], direction: "inc" | "dec" = "inc") {
  const unwrapped: number[] = [];
  if (angles.length === 0) {
    return unwrapped;
  }

  unwrapped[0] = angles[0];
  for (let index = 1; index < angles.length; index++) {
    let angle = angles[index];
    if (direction === "inc") {
      while (angle <= unwrapped[index - 1]) {
        angle += TAU;
      }
    } else {
      while (angle >= unwrapped[index - 1]) {
        angle -= TAU;
      }
    }
    unwrapped.push(angle);
  }

  return unwrapped;
}

function round(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function fmt(value: number) {
  const rounded = round(value);
  if (Object.is(rounded, -0)) {
    return "0";
  }
  return String(rounded);
}

function escapeAttr(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function symbolFontFamily() {
  return escapeAttr("'Apple Symbols', 'Arial Unicode MS', 'Noto Sans Symbols 2', 'Noto Sans Symbols', 'Segoe UI Symbol', serif, sans-serif");
}

function textFontFamily() {
  return escapeAttr("Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif");
}
