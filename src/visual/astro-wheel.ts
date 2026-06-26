import type {
  AspectEdge,
  AspectName,
  AspectSpec,
  BirthChart,
  HydratedNode,
  HydratedPlanet,
  ZodiacPosition,
} from "../astrology";
import { GLYPH_FILL } from "./astro-glyph-assets";
import {
  ANGLE_GLYPHS,
  PLANET_GLYPHS,
  ZODIAC_GLYPHS,
  getAstroGlyph,
} from "./astro-glyph-registry";
import type {
  AstroGlyphDefinition,
  AstroGlyphPrimitive,
  AstroWheelPlanetGlyphKey,
  AstroWheelZodiacSign,
} from "./astro-glyph-types";

export type { AspectSpec };

export interface AstroWheelViewBox {
  minX?: number;
  minY?: number;
  width: number;
  height: number;
}

export type AstroWheelElement = "fire" | "earth" | "air" | "water";

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
  glyphHalo?: string;
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

export type AstroWheelPointConnectorMode = "auto" | "always" | "never";

export interface AstroWheelLayoutOptions {
  rings?: Partial<Record<AstroWheelRing["id"], number>>;
  pointConnectors?: AstroWheelPointConnectorMode;
  maxPointDisplacementDegrees?: number;
  rails?: AstroWheelRailVisibilityPreset | AstroWheelRailVisibility;
}

export interface AstroWheelPointOptions {
  enabled?: boolean;
  nodes?: boolean;
  vertex?: boolean;
  collisionThresholdDegrees?: number;
}

export interface AstroWheelPointSource {
  key?: string;
  name: string;
  longitude: number;
  kind?: AstroWheelPointKind;
  glyph?: string;
  retrograde?: boolean;
  zodiacPosition?: ZodiacPosition;
}

interface AstroWheelPointGroupInput {
  id: string;
  label?: string;
  chart?: BirthChart;
  points?: readonly AstroWheelPointSource[];
  color?: string;
  tickColor?: string;
  radius?: number | "inner" | "base" | "outer" | "external";
  radiusOffset?: number;
  glyphScale?: number;
  rails?: AstroWheelRailVisibilityPreset | AstroWheelRailVisibility;
  collisionThresholdDegrees?: number;
  nodes?: boolean;
  vertex?: boolean;
}

interface AstroWheelAspectGroupInput {
  id: string;
  label?: string;
  chart?: BirthChart;
  edges?: readonly AspectEdge[];
  aspectSpecs?: readonly AspectSpec[];
  color?: string;
  colors?: Partial<Record<AspectName | (string & {}), string>>;
  radius?: number;
  radiusScale?: number;
  strokeWidth?: number;
  opacityScale?: number;
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
  excludeBodies?: readonly string[];
  padding?: number;
  title?: string;
  layout?: AstroWheelLayoutOptions;
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

export interface AstroWheelCircleHitTarget {
  kind: "circle";
  cx: number;
  cy: number;
  r: number;
}

export interface AstroWheelArcConnector {
  startAngle: number;
  endAngle: number;
  radius: number;
  path: string;
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

export interface AstroWheelHouseCusp {
  house: number;
  longitude: number;
  sign: string;
  line: AstroWheelLine;
  labelPosition: AstroWheelCoordinate;
  labelFontSize: number;
}

export type AstroWheelPositionRailId = "degree" | "sign" | "minutes" | "retrograde";
export type AstroWheelRailVisibilityPreset = "full" | "compact" | "glyph-only";
export type AstroWheelRailVisibility = Partial<Record<AstroWheelPositionRailId, boolean>>;

interface AstroWheelPositionRail {
  id: AstroWheelPositionRailId;
  label: string;
  radius: number;
  visible: boolean;
}

export interface AstroWheelPointRailLabel {
  railId: AstroWheelPositionRailId;
  text: string;
  sign?: AstroWheelZodiacSign;
  position: AstroWheelCoordinate;
  angle: number;
  fontSize: number;
  glyphScale?: number;
  visible: boolean;
}

export interface AstroWheelAngleMarker {
  key: "ASC" | "MC" | "DSC" | "IC";
  longitude: number;
  zodiacPosition: ZodiacPosition;
  line: AstroWheelLine;
  labelPosition: AstroWheelCoordinate;
  labelFontSize: number;
  labelRotation: number;
}

export type AstroWheelPointKind = "planet" | "node" | "vertex";

export interface AstroWheelPoint {
  groupId: string;
  key: string;
  name: string;
  kind: AstroWheelPointKind;
  glyph: string;
  glyphKey?: string;
  longitude: number;
  displayLongitude: number;
  trueAnchor: AstroWheelCoordinate;
  trueAngle: number;
  displayAngle: number;
  house?: number;
  nearestCuspHouse?: number;
  nearestCuspDistanceDegrees?: number;
  zodiacPosition?: ZodiacPosition;
  tickLine: AstroWheelLine;
  leaderArc?: AstroWheelArcConnector;
  leaderLine?: AstroWheelLine;
  glyphPosition: AstroWheelCoordinate;
  labelAngle: number;
  glyphFontSize: number;
  glyphScale: number;
  railLabels: readonly AstroWheelPointRailLabel[];
  hitTarget: AstroWheelCircleHitTarget;
  connector?: AstroWheelLine;
  retrograde?: boolean;
  color: string;
  tickColor: string;
}

export interface AstroWheelAspectLine {
  groupId: string;
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

interface AstroWheelPointGroup {
  id: string;
  label?: string;
  color: string;
  tickColor: string;
  radius: number;
  rails: readonly AstroWheelPositionRail[];
  points: readonly AstroWheelPoint[];
}

interface AstroWheelAspectGroup {
  id: string;
  label?: string;
  aspectLines: readonly AstroWheelAspectLine[];
}

interface AstroWheelSvgModel {
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
  pointGroups: readonly AstroWheelPointGroup[];
  aspectGroups: readonly AstroWheelAspectGroup[];
  positionRails: readonly AstroWheelPositionRail[];
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
  glyphHalo: string;
  aspectGuide: string;
  signColors: Partial<Record<AstroWheelZodiacSign, string>>;
  elementColors: Record<AstroWheelElement, string>;
  aspects: Record<string, string>;
}

interface ResolvedPointOptions {
  enabled: boolean;
  nodes: boolean;
  vertex: boolean;
  collisionThresholdDegrees?: number;
}

const TAU = Math.PI * 2;
const GLYPH_OUTLINE_FILTER_ID = "astro-wheel-glyph-outline";
const DEFAULT_ASTRO_WHEEL_RING_FRACTIONS: Record<AstroWheelRing["id"], number> = {
  houses: 7,
  zodiac: 13,
  planets: 27,
  aspects: 53,
};
const DEFAULT_POINT_DISPLACEMENT_DEGREES = 20;

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
  chiron: "⚷",
  "mean node": "☊",
  "true node": "☊",
  "north node": "☊",
  "south node": "☋",
  lilith: "⚸",
  "lilith mean": "⚸",
  "lilith true": "⚸",
  "black moon lilith": "⚸",
  "wheel of fortune": "⊗",
  "part of fortune": "⊗",
  "pars fortunae": "⊗",
  "lot of fortune": "⊗",
  ascendant: "AC",
  midheaven: "MC",
  descendant: "DC",
  nadir: "IC",
  vertex: "Vx",
  retrograde: "Rx",
};

const DEFAULT_PALETTE: ResolvedAstroWheelPalette = {
  ringStroke: "#1f2933",
  label: "#111827",
  subtle: "#9a9189",
  zodiacStroke: "#1f2933",
  zodiacGlyph: "#111827",
  houseLine: "#8f877f",
  houseLabel: "#111827",
  angleLine: "#0f172a",
  angleLabel: "#0f172a",
  planetGlyph: "#111827",
  planetTick: "#111827",
  glyphHalo: "#0a1628",
  aspectGuide: "#d7d0c6",
  elementColors: {
    fire: "#e27657",
    earth: "#c9bd72",
    air: "#78b985",
    water: "#6594d0",
  },
  signColors: {},
  aspects: {
    conjunction: "#6b7280",
    duodecile: "#9a8f7a",
    octile: "#f97316",
    sextile: "#2563eb",
    square: "#dc2626",
    trine: "#16a34a",
    trioctile: "#f97316",
    quincunx: "#7c3aed",
    opposition: "#dc2626",
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
  glyphHalo: "#0a1628",
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
  const glyphFill = bg === "transparent" ? "#fff" : bg;
  push(`<g transform="translate(${cx} ${cy}) scale(${fmt(scale)})" color="${escapeAttr(color)}" fill="${escapeAttr(fillVal)}" stroke="${escapeAttr(color)}" stroke-width="${fmt(sw)}" stroke-linecap="round" stroke-linejoin="round">`);
  renderGlyphPrimitives(push, primitives, { color, fill: fillVal, glyphFill });
  push(`</g>`);
  push(`</svg>`);
  return lines.join("\n");
}

export function generateAstroGlyphSvg(
  keyOrGlyph: string | AstroGlyphDefinition,
  options: GlyphSvgOptions = {}
): string {
  const glyph = typeof keyOrGlyph === "string" ? getAstroGlyph(keyOrGlyph) : keyOrGlyph;
  if (!glyph) {
    throw new Error(`Unknown astrology glyph: ${String(keyOrGlyph)}`);
  }
  const svg = generateGlyphSvg(glyph.primitives, options);
  return svg.replace("<svg ", `<svg data-astro-glyph="${escapeAttr(glyph.key)}" data-astro-glyph-category="${glyph.category}" `);
}

function buildAstroWheelSvgModel(
  chart: BirthChart,
  options: AstroWheelSvgOptions = {}
): AstroWheelSvgModel {
  const viewBox = normalizeViewBox(options.viewBox);
  const palette = resolvePalette(options.palette, options.background ?? "transparent");
  const excludedBodies = resolveExcludedBodies(options.excludeBodies);
  const scale = Math.min(
    viewBox.width / ASTRO_WHEEL_DEFAULT_VIEWBOX.width,
    viewBox.height / ASTRO_WHEEL_DEFAULT_VIEWBOX.height
  );
  const padding = options.padding ?? round(18 * scale + getExternalPointPadding(options, scale));
  const center = {
    x: round(viewBox.minX + viewBox.width / 2),
    y: round(viewBox.minY + viewBox.height / 2),
  };
  const outerRadius = round(Math.max(0, Math.min(viewBox.width, viewBox.height) / 2 - padding));
  const angleOf = (longitude: number) =>
    deg2rad(clamp360(180 + chart.houses.ascendant.longitude - longitude));
  const rings = buildRings(outerRadius, options.layout?.rings);
  const pointConnectorMode = options.layout?.pointConnectors ?? "auto";
  const maxPointDisplacementDegrees = options.layout?.maxPointDisplacementDegrees
    ?? DEFAULT_POINT_DISPLACEMENT_DEGREES;
  const railVisibility = resolveRailVisibility(options.layout?.rails);
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
  const basePointGroup = buildPointGroup({
    layer: {
      id: "birth",
      label: "Birth",
      chart,
      color: palette.planetGlyph,
      tickColor: palette.planetTick,
      radius: "base",
      nodes: resolvedPoints.nodes,
      vertex: resolvedPoints.vertex,
      collisionThresholdDegrees: resolvedPoints.collisionThresholdDegrees,
    },
    center,
    angleOf,
    rings,
    scale,
    palette,
    excludedBodies,
    pointConnectorMode,
    maxDisplacementDegrees: maxPointDisplacementDegrees,
    railVisibility,
  });
  const pointGroups = [
    ...(resolvedPoints.enabled ? [basePointGroup] : []),
  ];
  const points = pointGroups.flatMap((layer) => [...layer.points]);
  const pointByKey = Object.fromEntries(points.map((point) => [point.key, point]));
  const baseAspectGroup = resolvedAspects.enabled
    ? buildAspectGroup({
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
        excludedBodies,
      })
    : null;
  const aspectGroups = [
    ...(baseAspectGroup ? [baseAspectGroup] : []),
  ];
  const aspectLines = aspectGroups.flatMap((layer) => [...layer.aspectLines]);
  const positionRails = basePointGroup.rails;

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
    pointGroups,
    aspectGroups,
    positionRails,
    palette,
  };
}

export function generateAstroWheelSvg(
  chart: BirthChart,
  options: AstroWheelSvgOptions = {}
): string {
  const model = buildAstroWheelSvgModel(chart, options);
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

  renderSvgDefs(push, model);

  if (background !== "transparent") {
    push(
      `<rect x="${fmt(viewBox.minX)}" y="${fmt(viewBox.minY)}" width="${fmt(viewBox.width)}" height="${fmt(viewBox.height)}" fill="${escapeAttr(background)}"/>`
    );
  }

  renderAspectBoundary(push, model);
  renderAspects(push, model);
  renderZodiac(push, model, zodiacOptions);
  renderHouses(push, model, houseOptions);
  renderPlanets(push, model);
  renderGlyphOverlay(push, model);
  push(`</svg>`);

  return lines.join("\n");
}

function renderSvgDefs(
  push: (line: string) => void,
  model: AstroWheelSvgModel
) {
  push(`<defs>`);
  push(
    `<filter id="${GLYPH_OUTLINE_FILTER_ID}" x="-45%" y="-45%" width="190%" height="190%">`
  );
  push(
    `<feMorphology in="SourceAlpha" operator="dilate" radius="${fmt(1.75 * model.scale)}" result="dilated"/>`
  );
  push(
    `<feFlood flood-color="${escapeAttr(model.palette.glyphHalo)}" result="haloColor"/>`
  );
  push(
    `<feComposite in="haloColor" in2="dilated" operator="in" result="outline"/>`
  );
  push(`<feMerge>`);
  push(`<feMergeNode in="outline"/>`);
  push(`<feMergeNode in="SourceGraphic"/>`);
  push(`</feMerge>`);
  push(`</filter>`);
  push(`</defs>`);
}

function renderAspects(
  push: (line: string) => void,
  model: AstroWheelSvgModel
) {
  if (model.aspectGroups.length === 0) {
    return;
  }

  push(`<g id="astro-wheel-aspects" aria-label="aspects">`);

  for (const layer of model.aspectGroups) {
    push(`<g class="astro-wheel-aspect-group" data-aspect-group="${escapeAttr(layer.id)}"${layer.label ? ` aria-label="${escapeAttr(layer.label)}"` : ""}>`);

    for (const aspect of layer.aspectLines) {
      push(
        `<line data-aspect-group="${escapeAttr(aspect.groupId)}" data-aspect="${escapeAttr(aspect.aspect)}" data-planet-a="${escapeAttr(aspect.planetA)}" data-planet-b="${escapeAttr(aspect.planetB)}" x1="${fmt(aspect.line.x1)}" y1="${fmt(aspect.line.y1)}" x2="${fmt(aspect.line.x2)}" y2="${fmt(aspect.line.y2)}" stroke="${escapeAttr(aspect.color)}" stroke-opacity="${fmt(aspect.opacity)}" stroke-width="${fmt(aspect.strokeWidth * model.scale)}" stroke-linecap="round"/>`
      );
    }

    push(`</g>`);
  }

  push(
    `<circle cx="${fmt(model.center.x)}" cy="${fmt(model.center.y)}" r="${fmt(4 * model.scale)}" fill="${escapeAttr(model.palette.aspectGuide)}" fill-opacity="0.75" stroke="none"/>`
  );

  push(`</g>`);
}

function renderAspectBoundary(
  push: (line: string) => void,
  model: AstroWheelSvgModel
) {
  push(
    `<circle id="astro-wheel-aspect-boundary" cx="${fmt(model.center.x)}" cy="${fmt(model.center.y)}" r="${fmt(model.rings.aspects.r2)}" fill="none" stroke="${escapeAttr(model.palette.aspectGuide)}" stroke-opacity="0.9" stroke-width="${fmt(1.25 * model.scale)}"/>`
  );
}

function renderZodiac(
  push: (line: string) => void,
  model: AstroWheelSvgModel,
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
      const signDegree = longitude % 30;
      const angle = angleOf(longitude);

      const isSignBoundary = signDegree === 0;
      const isTen = signDegree % 10 === 0;
      const isFive = signDegree % 5 === 0;

      const length = isSignBoundary
        ? thickness * 0.58
        : isTen
          ? thickness * 0.42
          : isFive
            ? thickness * 0.29
            : thickness * 0.18;

      const strokeWidth = isSignBoundary
        ? 2.2 * scale
        : isTen
          ? 1.55 * scale
          : isFive
            ? 1.1 * scale
            : 0.75 * scale;

      const opacity = isSignBoundary ? 0.95 : isFive ? 0.82 : 0.62;

      const inner = polarToXY(center.x, center.y, rings.zodiac.r2 - length, angle);
      const outer = polarToXY(center.x, center.y, rings.zodiac.r2, angle);

      push(
        `<line data-zodiac-tick="${longitude}" x1="${fmt(inner.x)}" y1="${fmt(inner.y)}" x2="${fmt(outer.x)}" y2="${fmt(outer.y)}" stroke="${escapeAttr(palette.zodiacStroke)}" stroke-opacity="${fmt(opacity)}" stroke-width="${fmt(strokeWidth)}"/>`
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
  const glyph = ZODIAC_GLYPHS[segment.sign];
  const glyphScale = segment.labelFontSize * 0.72;
  const strokeWidth = clamp(0.11 / Math.max(glyphScale / 10, 0.6), 0.08, 0.16);

  push(
    `<g class="astro-wheel-glyph" data-astro-glyph="${escapeAttr(glyph.key)}" data-astro-glyph-category="${glyph.category}" data-zodiac-glyph="${escapeAttr(segment.sign)}" data-zodiac-symbol="${escapeAttr(segment.glyph)}" transform="translate(${fmt(segment.labelPosition.x)} ${fmt(segment.labelPosition.y)}) scale(${fmt(glyphScale)})" color="${escapeAttr(palette.zodiacGlyph)}" fill="none" stroke="${escapeAttr(palette.zodiacGlyph)}" stroke-width="${fmt(strokeWidth)}" stroke-linecap="round" stroke-linejoin="round">`
  );
  push(`<title>${escapeText(`${segment.sign} ${segment.glyph}`)}</title>`);
  renderGlyphPrimitives(push, glyph.primitives, { color: palette.zodiacGlyph });
  push(`</g>`);
}

function renderHouses(
  push: (line: string) => void,
  model: AstroWheelSvgModel,
  options: ResolvedHouseOptions
) {
  if (!options.cuspLines && !options.labels && !options.angles) {
    return;
  }

  push(`<g id="astro-wheel-houses" aria-label="houses">`);
  if (options.cuspLines) {
    for (const cusp of model.houseCusps) {
      const isAngleHouse = cusp.house === 1 || cusp.house === 4 || cusp.house === 7 || cusp.house === 10;

      push(
        `<line data-house-cusp="${cusp.house}" x1="${fmt(cusp.line.x1)}" y1="${fmt(cusp.line.y1)}" x2="${fmt(cusp.line.x2)}" y2="${fmt(cusp.line.y2)}" stroke="${escapeAttr(model.palette.houseLine)}" stroke-opacity="${fmt(isAngleHouse ? 0.72 : 0.42)}" stroke-width="${fmt(isAngleHouse ? 1.8 * model.scale : 0.95 * model.scale)}"/>`
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

  // Angle axes are drawn by the thicker house-cusp spokes (houses 1/4/7/10); the angle
  // markers only contribute their degree/minutes label (rendered in the glyph overlay), with
  // no extra outer-rim tick.
  push(`</g>`);
}

function renderPlanets(
  push: (line: string) => void,
  model: AstroWheelSvgModel
) {
  if (model.pointGroups.length === 0) {
    return;
  }

  push(`<g id="astro-wheel-planets" aria-label="planets">`);

  for (const layer of model.pointGroups) {
    renderPointGroupGuide(push, layer, model);
  }

  for (const layer of model.pointGroups) {
    push(`<g class="astro-wheel-point-group" data-point-group="${escapeAttr(layer.id)}"${layer.label ? ` aria-label="${escapeAttr(layer.label)}"` : ""}>`);

    for (const point of layer.points) {
      push(
        `<g class="astro-wheel-point" data-point-group="${escapeAttr(point.groupId)}" data-point-key="${escapeAttr(point.key)}" data-point-name="${escapeAttr(point.name)}" data-point-kind="${point.kind}" data-longitude="${fmt(point.longitude)}">`
      );

      push(`<title>${escapeText(point.name)} ${fmt(point.longitude)}°</title>`);

      push(
        `<line x1="${fmt(point.tickLine.x1)}" y1="${fmt(point.tickLine.y1)}" x2="${fmt(point.tickLine.x2)}" y2="${fmt(point.tickLine.y2)}" stroke="${escapeAttr(point.tickColor)}" stroke-opacity="0.82" stroke-width="${fmt(model.scale)}" stroke-linecap="round"/>`
      );

      if (point.leaderArc) {
        push(
          `<path class="astro-wheel-point-leader" d="${escapeAttr(point.leaderArc.path)}" fill="none" stroke="${escapeAttr(point.tickColor)}" stroke-opacity="0.52" stroke-width="${fmt(0.9 * model.scale)}" stroke-linecap="round" stroke-linejoin="round"/>`
        );
      } else if (point.leaderLine) {
        push(
          `<line class="astro-wheel-point-leader" x1="${fmt(point.leaderLine.x1)}" y1="${fmt(point.leaderLine.y1)}" x2="${fmt(point.leaderLine.x2)}" y2="${fmt(point.leaderLine.y2)}" stroke="${escapeAttr(point.tickColor)}" stroke-opacity="0.52" stroke-width="${fmt(0.9 * model.scale)}" stroke-linecap="round"/>`
        );
      }

      push(`</g>`);
    }

    push(`</g>`);
  }

  push(`</g>`);
}

function renderPointGroupGuide(
  push: (line: string) => void,
  layer: AstroWheelPointGroup,
  model: AstroWheelSvgModel
) {
  const isExternal = layer.radius > model.rings.houses.r2 + model.scale;
  if (!isExternal) {
    return;
  }

  push(
    `<circle class="astro-wheel-external-point-ring" data-point-group="${escapeAttr(layer.id)}" cx="${fmt(model.center.x)}" cy="${fmt(model.center.y)}" r="${fmt(layer.radius)}" fill="none" stroke="${escapeAttr(layer.tickColor)}" stroke-opacity="0.32" stroke-width="${fmt(1.15 * model.scale)}"/>`
  );
}

function renderGlyphOverlay(
  push: (line: string) => void,
  model: AstroWheelSvgModel
) {
  if (model.angleMarkers.length === 0 && model.pointGroups.length === 0) {
    return;
  }

  push(`<g id="astro-wheel-glyph-layer" aria-label="chart glyphs">`);

  if (model.angleMarkers.length > 0) {
    push(`<g id="astro-wheel-angle-glyphs" aria-label="angle glyphs">`);
    for (const marker of model.angleMarkers) {
      renderAngleGlyph(push, marker, model);
    }
    push(`</g>`);
  }

  if (model.pointGroups.length > 0) {
    push(`<g id="astro-wheel-point-glyphs" aria-label="planet glyphs">`);
    for (const layer of model.pointGroups) {
      push(`<g class="astro-wheel-point-glyph-layer" data-point-group="${escapeAttr(layer.id)}"${layer.label ? ` aria-label="${escapeAttr(layer.label)} glyphs"` : ""}>`);
      for (const point of layer.points) {
        renderPointLabelGroup(push, point, model);
      }
      push(`</g>`);
    }
    push(`</g>`);
  }

  push(`</g>`);
}

function renderAngleGlyph(
  push: (line: string) => void,
  marker: AstroWheelAngleMarker,
  model: AstroWheelSvgModel
) {
  const label = angleDisplayLabel(marker.key);
  const position = formatInlinePosition(marker.zodiacPosition);

  // Angle axes (AC/DC/MC/IC) are already identified by their thicker house-cusp spokes, so
  // the marker only needs its degree and minutes — no key text, no sign glyph.
  const positionFontSize = clamp(marker.labelFontSize * 0.62, 6 * model.scale, 10 * model.scale);
  const gap = clamp(3 * model.scale, 2, 5);

  const degreeWidth = estimateTextWidth(position.degreesText, positionFontSize);
  const minutesWidth = estimateTextWidth(position.minutesText, positionFontSize);
  const totalWidth = degreeWidth + gap + minutesWidth;
  const startX = -totalWidth / 2;

  const degreeX = startX;
  const minutesX = degreeX + degreeWidth + gap;

  push(
    `<g class="astro-wheel-angle-glyph-label" data-angle-marker="${marker.key}" data-longitude="${fmt(marker.longitude)}" transform="translate(${fmt(marker.labelPosition.x)} ${fmt(marker.labelPosition.y)}) rotate(${fmt(marker.labelRotation)})" filter="url(#${GLYPH_OUTLINE_FILTER_ID})">`
  );

  push(`<title>${escapeText(`${label} ${position.degreesText} ${position.sign} ${position.minutesText}`)}</title>`);

  push(
    `<text class="astro-wheel-angle-degree" x="${fmt(degreeX)}" y="0" font-family="${textFontFamily()}" font-size="${fmt(positionFontSize)}" text-anchor="start" dominant-baseline="middle" fill="${escapeAttr(model.palette.angleLabel)}">${escapeText(position.degreesText)}</text>`
  );

  push(
    `<text class="astro-wheel-angle-minutes" x="${fmt(minutesX)}" y="0" font-family="${textFontFamily()}" font-size="${fmt(positionFontSize)}" text-anchor="start" dominant-baseline="middle" fill="${escapeAttr(model.palette.angleLabel)}">${escapeText(position.minutesText)}</text>`
  );

  push(`</g>`);
}

function angleDisplayLabel(key: AstroWheelAngleMarker["key"]) {
  if (key === "ASC") return "AC";
  if (key === "DSC") return "DC";
  return key;
}

function renderPointLabelGroup(
  push: (line: string) => void,
  point: AstroWheelPoint,
  model: AstroWheelSvgModel
) {
  push(
    `<g class="astro-wheel-point-label" data-point-group="${escapeAttr(point.groupId)}" data-point-key="${escapeAttr(point.key)}" data-point-name="${escapeAttr(point.name)}" data-point-kind="${point.kind}" data-longitude="${fmt(point.longitude)}" data-display-longitude="${fmt(point.displayLongitude)}" data-house="${point.house ?? ""}" transform="translate(${fmt(point.glyphPosition.x)} ${fmt(point.glyphPosition.y)})" filter="url(#${GLYPH_OUTLINE_FILTER_ID})">`
  );

  push(`<title>${escapeText(pointLabelTitle(point))}</title>`);

  renderPointGlyph(push, point, 0, 0, point.glyphScale, model.palette.glyphHalo);
  push(`</g>`);

  for (const label of point.railLabels) {
    if (!label.visible) continue;
    push(
      `<g class="astro-wheel-position-rail-label" data-point-group="${escapeAttr(point.groupId)}" data-point-key="${escapeAttr(point.key)}" data-point-name="${escapeAttr(point.name)}" data-position-rail="${label.railId}" transform="translate(${fmt(label.position.x)} ${fmt(label.position.y)})" filter="url(#${GLYPH_OUTLINE_FILTER_ID})">`
    );
    if (label.railId === "sign" && label.sign) {
      renderInlineSignGlyph(push, label.sign, 0, 0, label.glyphScale ?? label.fontSize, point.color);
    } else if (label.railId === "retrograde") {
      renderRetrogradeMarker(push, 0, 0, label.fontSize, point.color);
    } else {
      push(
        `<text class="astro-wheel-point-${label.railId}" x="0" y="0" font-family="${textFontFamily()}" font-size="${fmt(label.fontSize)}" text-anchor="middle" dominant-baseline="middle" fill="${escapeAttr(point.color)}" fill-opacity="0.9">${escapeText(label.text)}</text>`
      );
    }
    push(`</g>`);
  }
}

function renderPointGlyph(
  push: (line: string) => void,
  point: AstroWheelPoint,
  x: number,
  y: number,
  glyphScale: number,
  glyphFill: string
) {
  const glyph = point.glyphKey ? getAstroGlyph(point.glyphKey) : resolvePointGlyph(point.name);

  if (glyph) {
    const strokeWidth = clamp(0.12 / Math.max(glyphScale / 10, 0.6), 0.1, 0.18);
    push(
      `<g class="astro-wheel-glyph" data-astro-glyph="${escapeAttr(glyph.key)}" data-astro-glyph-category="${glyph.category}" data-point-glyph="${escapeAttr(point.name)}" transform="translate(${fmt(x)} ${fmt(y)}) scale(${fmt(glyphScale)})" color="${escapeAttr(point.color)}" fill="none" stroke="${escapeAttr(point.color)}" stroke-width="${fmt(strokeWidth)}" stroke-linecap="round" stroke-linejoin="round">`
    );
    renderGlyphPrimitives(push, glyph.primitives, { color: point.color, glyphFill });
    push(`</g>`);
  } else {
    push(
      `<text class="astro-wheel-glyph" data-point-glyph="${escapeAttr(point.name)}" x="${fmt(x)}" y="${fmt(y)}" font-family="${symbolFontFamily()}" font-size="${fmt(point.glyphFontSize)}" text-anchor="middle" dominant-baseline="middle" fill="${escapeAttr(point.color)}">${escapeText(point.glyph)}</text>`
    );
  }
}

function renderRetrogradeMarker(
  push: (line: string) => void,
  x: number,
  y: number,
  fontSize: number,
  color: string
) {
  const glyph = resolvePointGlyph("retrograde");

  if (glyph) {
    const glyphScale = fontSize * 0.62;
    const strokeWidth = clamp(0.12 / Math.max(glyphScale / 10, 0.6), 0.1, 0.18);

    push(
      `<g class="astro-wheel-point-retrograde" data-astro-glyph="${escapeAttr(glyph.key)}" data-astro-glyph-category="${glyph.category}" transform="translate(${fmt(x)} ${fmt(y)}) scale(${fmt(glyphScale)})" color="${escapeAttr(color)}" fill="none" stroke="${escapeAttr(color)}" stroke-width="${fmt(strokeWidth)}" stroke-linecap="round" stroke-linejoin="round">`
    );
    renderGlyphPrimitives(push, glyph.primitives, { color });
    push(`</g>`);
    return;
  }

  push(
    `<text class="astro-wheel-point-retrograde" x="${fmt(x)}" y="${fmt(y)}" font-family="${textFontFamily()}" font-size="${fmt(fontSize)}" text-anchor="middle" dominant-baseline="middle" fill="${escapeAttr(color)}" font-weight="700">R</text>`
  );
}

function renderInlineSignGlyph(
  push: (line: string) => void,
  sign: string,
  x: number,
  y: number,
  glyphScale: number,
  color: string
) {
  const glyph = ZODIAC_GLYPHS[sign as AstroWheelZodiacSign];

  if (glyph) {
    const strokeWidth = clamp(0.11 / Math.max(glyphScale / 10, 0.6), 0.08, 0.16);
    push(
      `<g class="astro-wheel-point-sign-glyph" data-astro-glyph="${escapeAttr(glyph.key)}" data-astro-glyph-category="${glyph.category}" data-zodiac-glyph="${escapeAttr(sign)}" transform="translate(${fmt(x)} ${fmt(y)}) scale(${fmt(glyphScale)})" color="${escapeAttr(color)}" fill="none" stroke="${escapeAttr(color)}" stroke-width="${fmt(strokeWidth)}" stroke-linecap="round" stroke-linejoin="round">`
    );
    renderGlyphPrimitives(push, glyph.primitives, { color });
    push(`</g>`);
    return;
  }

  push(
    `<text class="astro-wheel-point-sign-glyph" x="${fmt(x)}" y="${fmt(y)}" font-family="${symbolFontFamily()}" font-size="${fmt(glyphScale)}" text-anchor="middle" dominant-baseline="middle" fill="${escapeAttr(color)}">${escapeText(sign.charAt(0).toUpperCase())}</text>`
  );
}

interface PointInlinePosition {
  sign: string;
  degreesText: string;
  minutesText: string;
}

function formatInlinePosition(position: ZodiacPosition): PointInlinePosition {
  let degrees = Math.floor(position.decimalDegrees);
  let minutes = Math.round((position.decimalDegrees - degrees) * 60);

  if (minutes === 60) {
    degrees += 1;
    minutes = 0;
  }

  return {
    sign: position.sign,
    degreesText: `${degrees}°`,
    minutesText: `${String(minutes).padStart(2, "0")}'`,
  };
}

function pointLabelTitle(point: AstroWheelPoint) {
  const position = point.zodiacPosition ? formatInlinePosition(point.zodiacPosition) : null;
  if (!position) {
    return `${point.name} ${fmt(point.longitude)}°`;
  }

  const retrograde = point.retrograde ? " Rx" : "";
  return `${point.name} ${position.degreesText} ${position.sign} ${position.minutesText}${retrograde}`;
}

function estimateTextWidth(value: string, fontSize: number) {
  return value.length * fontSize * 0.56;
}

const POINT_GLYPH_ALIASES: Record<string, AstroWheelPlanetGlyphKey> = {
  "mean node": "north node",
  "true node": "north node",
  "ascending node": "north node",
  "north lunar node": "north node",
  "descending node": "south node",
  "south lunar node": "south node",
  "wheel of fortune": "pars fortunae",
  "part of fortune": "pars fortunae",
  "lot of fortune": "pars fortunae",
  "fortune": "pars fortunae",
  "black moon lilith": "lilith",
  "mean lilith": "lilith",
  "true lilith": "lilith",
  "lilith mean": "lilith",
  "lilith true": "lilith",
  "asc": "ascendant",
  "ac": "ascendant",
  "mc": "midheaven",
  "medium coeli": "midheaven",
  "dsc": "descendant",
  "dc": "descendant",
  "ic": "nadir",
  "imum coeli": "nadir",
  "vx": "vertex",
  "vtx": "vertex",
  "rx": "retrograde",
};

function resolvePointGlyph(name: string): AstroGlyphDefinition | null {
  const key = name.trim().toLocaleLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  const resolved = POINT_GLYPH_ALIASES[key] ?? key;
  return PLANET_GLYPHS[resolved as AstroWheelPlanetGlyphKey] ?? ANGLE_GLYPHS[resolved as keyof typeof ANGLE_GLYPHS] ?? null;
}

function getExternalPointPadding(options: AstroWheelSvgOptions, scale: number) {
  void options;
  void scale;
  return 0;
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
  const labelFontSize = clamp(thickness * 0.58, 12 * scale, 28 * scale);

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
  const spokeInnerRadius = rings.aspects.r2;
  const spokeOuterRadius = ring.r2 + 4 * scale;
  // Keep house numbers on the wheel's outer band (just outside the zodiac colours) rather
  // than floating in the margin, where external transit/synastry rings and their labels
  // collide with them.
  const labelRadius = (ring.r1 + ring.r2) / 2;
  const labelFontSize = clamp((ring.r2 - ring.r1) * 0.48, 10 * scale, 19 * scale);

  return houses.map((house, index) => {
    const angle = angleOf(house.longitude);
    const next = houses[(index + 1) % houses.length];
    const span = clamp360(next.longitude - house.longitude);
    const labelLongitude = clamp360(house.longitude + span / 2);

    return {
      house: index + 1,
      longitude: normalizeAngle(house.longitude),
      sign: house.sign,
      line: lineFromPolar(center, spokeInnerRadius, spokeOuterRadius, angle),
      labelPosition: polarToXY(center.x, center.y, labelRadius, angleOf(labelLongitude)),
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
  const labelFontSize = clamp((ring.r2 - ring.r1) * 0.32, 8 * scale, 18 * scale);
  // Sit the degree/minutes inside the colored sign band (between the inner and outer zodiac
  // circles), slightly below the sign-glyph row so the two don't clash.
  const labelRadius = rings.zodiac.r1 + (rings.zodiac.r2 - rings.zodiac.r1) * 0.32;

  const markers = [
    { key: "ASC" as const, position: chart.houses.ascendant },
    { key: "MC" as const, position: chart.houses.mc },
    { key: "DSC" as const, position: chart.houses.dc },
    { key: "IC" as const, position: chart.houses.ic },
  ];

  return markers.map((marker) => {
    const angle = angleOf(marker.position.longitude);
    const angleDeg = clamp360(angle * (180 / Math.PI));
    let labelRotation = angleDeg;
    if (labelRotation > 90 && labelRotation < 270) {
      labelRotation -= 180;
    }

    return {
      key: marker.key,
      longitude: normalizeAngle(marker.position.longitude),
      zodiacPosition: marker.position,
      line: lineFromPolar(center, ring.r1 + 4 * scale, ring.r2 - 4 * scale, angle),
      labelPosition: polarWithNudge(
        center.x,
        center.y,
        labelRadius,
        angle,
        0,
        0
      ),
      labelFontSize,
      labelRotation,
    };
  });
}

function buildPointGroup(params: {
  layer: AstroWheelPointGroupInput;
  center: AstroWheelCoordinate;
  angleOf: (longitude: number) => number;
  rings: Record<AstroWheelRing["id"], AstroWheelRing>;
  scale: number;
  palette: ResolvedAstroWheelPalette;
  excludedBodies: ReadonlySet<string>;
  pointConnectorMode: AstroWheelPointConnectorMode;
  maxDisplacementDegrees: number;
  railVisibility: Required<AstroWheelRailVisibility>;
}): AstroWheelPointGroup {
  const {
    layer,
    center,
    angleOf,
    rings,
    scale,
    palette,
    excludedBodies,
    pointConnectorMode,
    maxDisplacementDegrees,
    railVisibility,
  } = params;
  const ring = rings.planets;
  const requestedRadius = resolvePointGroupRadius(layer, rings);
  const requestedExternalLayer = requestedRadius > rings.houses.r2 + scale;

  const thickness = ring.r2 - ring.r1;
  const glyphFontSize = clamp(thickness * 0.68, 14 * scale, 30 * scale) * (layer.glyphScale ?? 1);

  const autoPlanetRail = layer.radius === undefined || layer.radius === "base";
  const radius = !requestedExternalLayer && autoPlanetRail
    ? clamp(
        ring.r2 - glyphFontSize * 0.58 - Math.max(3 * scale, 2),
        ring.r1 + glyphFontSize * 0.65,
        ring.r2 - glyphFontSize * 0.48
      )
    : requestedRadius;

  const isExternalLayer = radius > rings.houses.r2 + scale;
  const tickLength = Math.min(14 * scale, thickness * 0.34);
  const layerRailVisibility = resolveLayerRailVisibility({
    layer,
    fallback: railVisibility,
    external: isExternalLayer,
  });
  const rails = buildPositionRails({
    ring,
    scale,
    visibility: layerRailVisibility,
    layerRadius: radius,
    external: isExternalLayer,
    glyphFontSize,
  });

  const collisionPadding = Math.max(2 * scale, 1.5);
  const zodiacKeepOutGap = Math.max(5 * scale, 4);
  const labelMaxRadius = isExternalLayer
    ? Number.POSITIVE_INFINITY
    : rings.zodiac.r1 - zodiacKeepOutGap;
  const seeds = getPointSeeds(layer, excludedBodies);
  const color = layer.color ?? palette.planetGlyph;
  const tickColor = layer.tickColor ?? color;
  const pointIntents = seeds.map((seed) => {
    const tickAngle = angleOf(seed.longitude);
    const trueAnchor = polarToXY(center.x, center.y, rings.aspects.r2, tickAngle);
    const pointGlyphFontSize = seed.kind === "vertex"
      ? glyphFontSize * 0.82
      : glyphFontSize;

    const rawGlyphRadius = radius;
    const glyphRadius = isExternalLayer
      ? rawGlyphRadius
      : clamp(
          rawGlyphRadius,
          rings.aspects.r2 + pointGlyphFontSize * 0.65,
          labelMaxRadius - pointGlyphFontSize * 0.5
        );

    const connectorRadius = glyphRadius;
    const glyphClearance = pointGlyphFontSize * 0.34;
    const tickLine = isExternalLayer
      ? lineFromPolar(
          center,
          Math.max(rings.aspects.r1, rings.aspects.r2 - tickLength * 0.5),
          rings.aspects.r2 + tickLength * 0.5,
          tickAngle
        )
      : lineFromPolar(
          center,
          Math.min(ring.r2, connectorRadius + tickLength),
          Math.min(ring.r2, connectorRadius + glyphClearance),
          tickAngle
        );

    const idealPosition = polarToXY(center.x, center.y, glyphRadius, tickAngle);
    const point = makeAstroWheelPoint({
      layer,
      seed,
      tickLine,
      trueAngle: tickAngle,
      displayAngle: tickAngle,
      trueAnchor,
      labelAngle: tickAngle,
      glyphPosition: idealPosition,
      glyphFontSize: pointGlyphFontSize,
      rails,
      houses: layer.chart?.houses.houses,
      center,
      color,
      tickColor,
    });
    // Minimum tangential gap between adjacent glyph centres. A glyph is only ~0.45×fontSize
    // wide, so this keeps clusters tight while still preventing glyphs from overlapping.
    const labelTangentDemandPx = pointGlyphFontSize * 0.72;
    const configuredTangentDemandPx = layer.collisionThresholdDegrees
      ? deg2rad(clamp(layer.collisionThresholdDegrees, 0, 30)) * glyphRadius
      : 0;
    const tangentDemandPx = Math.max(labelTangentDemandPx, configuredTangentDemandPx);

    return {
      seed,
      tickAngle,
      tickLine,
      trueAnchor,
      connectorRadius,
      glyphRadius,
      pointGlyphFontSize,
      tangentDemandPx,
    };
  });

  const solvedLabels = solveCircularLabelAngles(
    pointIntents.map((intent) => ({
      item: intent,
      idealAngle: intent.tickAngle,
      radius: intent.glyphRadius,
      tangentDemandPx: intent.tangentDemandPx,
    })),
    {
      paddingPx: collisionPadding,
      maxDisplacementRad: deg2rad(clamp(maxDisplacementDegrees, 0, 180)),
    }
  );
  const visualAngleByKey = Object.fromEntries(
    solvedLabels.map(({ item, visualAngle }) => [item.seed.key, visualAngle])
  );

  const points = pointIntents.map((intent) => {
    const visualAngle = visualAngleByKey[intent.seed.key] ?? intent.tickAngle;
    let glyphPosition = polarToXY(center.x, center.y, intent.glyphRadius, visualAngle);
    let point = makeAstroWheelPoint({
      layer,
      seed: intent.seed,
      tickLine: intent.tickLine,
      trueAngle: intent.tickAngle,
      displayAngle: visualAngle,
      trueAnchor: intent.trueAnchor,
      labelAngle: visualAngle,
      glyphPosition,
      glyphFontSize: intent.pointGlyphFontSize,
      rails,
      houses: layer.chart?.houses.houses,
      center,
      color,
      tickColor,
    });

    const leaderArc = buildPointConnector({
      center,
      tickAngle: intent.tickAngle,
      labelAngle: visualAngle,
      connectorRadius: intent.connectorRadius,
      glyphPosition,
      mode: pointConnectorMode,
    });
    const connector = buildPointLineConnector({
      trueAnchor: point.trueAnchor,
      glyphPosition,
      mode: pointConnectorMode,
      tickAngle: intent.tickAngle,
      displayAngle: visualAngle,
    });

    return {
      ...point,
      leaderArc,
      connector,
    };
  });
  return {
    id: layer.id,
    label: layer.label,
    color,
    tickColor,
    radius,
    rails,
    points,
  };
}

function makeAstroWheelPoint(params: {
  layer: AstroWheelPointGroupInput;
  seed: PointSeed;
  tickLine: AstroWheelLine;
  trueAngle: number;
  displayAngle: number;
  trueAnchor: AstroWheelCoordinate;
  labelAngle: number;
  glyphPosition: AstroWheelCoordinate;
  glyphFontSize: number;
  rails: readonly AstroWheelPositionRail[];
  houses?: readonly ZodiacPosition[];
  center: AstroWheelCoordinate;
  color: string;
  tickColor: string;
}): AstroWheelPoint {
  const {
    layer,
    seed,
    tickLine,
    trueAngle,
    displayAngle,
    trueAnchor,
    labelAngle,
    glyphPosition,
    glyphFontSize,
    rails,
    houses,
    center,
    color,
    tickColor,
  } = params;
  const houseContext = houses ? getHouseContext(seed.longitude, houses) : {};
  const railLabels = buildPointRailLabels({
    seed,
    rails,
    center,
    displayAngle,
    color,
    glyphFontSize,
  });
  const glyphScale = glyphFontSize * 0.66;
  return {
    groupId: layer.id,
    key: seed.key,
    name: seed.name,
    kind: seed.kind,
    glyph: seed.glyph,
    glyphKey: seed.glyphKey,
    longitude: normalizeAngle(seed.longitude),
    displayLongitude: normalizeAngle(seed.longitude + rad2deg(signedAngleDelta(displayAngle, trueAngle))),
    trueAnchor,
    trueAngle,
    displayAngle,
    house: houseContext.house,
    nearestCuspHouse: houseContext.nearestCuspHouse,
    nearestCuspDistanceDegrees: houseContext.nearestCuspDistanceDegrees,
    zodiacPosition: seed.zodiacPosition,
    tickLine,
    labelAngle,
    leaderArc: undefined,
    leaderLine: undefined,
    glyphPosition,
    glyphFontSize,
    glyphScale,
    railLabels,
    hitTarget: {
      kind: "circle",
      cx: glyphPosition.x,
      cy: glyphPosition.y,
      r: round(glyphScale * 0.72),
    },
    retrograde: seed.retrograde,
    color,
    tickColor,
  };
}

function resolveRailVisibility(
  input: AstroWheelRailVisibilityPreset | AstroWheelRailVisibility | undefined
): Required<AstroWheelRailVisibility> {
  if (!input || input === "glyph-only") {
    return { degree: false, sign: false, minutes: false, retrograde: false };
  }
  if (input === "compact") {
    return { degree: true, sign: true, minutes: false, retrograde: true };
  }
  if (input === "full") {
    return { degree: true, sign: true, minutes: true, retrograde: true };
  }
  return {
    degree: input.degree ?? true,
    sign: input.sign ?? true,
    minutes: input.minutes ?? true,
    retrograde: input.retrograde ?? true,
  };
}

function resolveLayerRailVisibility(params: {
  layer: AstroWheelPointGroupInput;
  fallback: Required<AstroWheelRailVisibility>;
  external: boolean;
}): Required<AstroWheelRailVisibility> {
  if (params.layer.rails) {
    return resolveRailVisibility(params.layer.rails);
  }
  if (params.external) {
    // External rings (transits/synastry) are already dense. Keep only the degree rail by
    // default — sign and minutes crowd neighbouring points. Callers can opt back in via
    // the per-layer `rails` option.
    return {
      degree: params.fallback.degree,
      sign: false,
      minutes: false,
      retrograde: false,
    };
  }
  return params.fallback;
}

function buildPositionRails(params: {
  ring: AstroWheelRing;
  scale: number;
  visibility: Required<AstroWheelRailVisibility>;
  layerRadius: number;
  external: boolean;
  glyphFontSize: number;
}): AstroWheelPositionRail[] {
  const { ring, scale, visibility, layerRadius, external, glyphFontSize } = params;

  // Rails read outward/inward from the glyph in the conventional position order:
  // degree (nearest the glyph) → sign → minutes → retrograde.
  if (external) {
    const gap = Math.max(2.4 * scale, 2);
    const step = Math.max(glyphFontSize * 0.22, 4.2 * scale);
    const firstRailRadius = layerRadius + glyphFontSize * 0.42 + gap;
    return [
      { id: "degree", label: "Degree", radius: round(firstRailRadius), visible: visibility.degree },
      { id: "minutes", label: "Minutes", radius: round(firstRailRadius + step * 2), visible: visibility.minutes },
      { id: "sign", label: "Sign", radius: round(firstRailRadius + step), visible: visibility.sign },
      { id: "retrograde", label: "Retrograde", radius: round(firstRailRadius + step * 3), visible: visibility.retrograde },
    ];
  }

  const thickness = ring.r2 - ring.r1;
  const inset = Math.max(2 * scale, 1.5);
  return [
    { id: "degree", label: "Degree", radius: round(ring.r1 + thickness * 0.52 + inset), visible: visibility.degree },
    { id: "minutes", label: "Minutes", radius: round(ring.r1 + thickness * 0.24 + inset), visible: visibility.minutes },
    { id: "sign", label: "Sign", radius: round(ring.r1 + thickness * 0.38 + inset), visible: visibility.sign },
    { id: "retrograde", label: "Retrograde", radius: round(ring.r1 + thickness * 0.10 + inset), visible: visibility.retrograde },
  ];
}

function buildPointRailLabels(params: {
  seed: PointSeed;
  rails: readonly AstroWheelPositionRail[];
  center: AstroWheelCoordinate;
  displayAngle: number;
  color: string;
  glyphFontSize: number;
}): AstroWheelPointRailLabel[] {
  const position = params.seed.zodiacPosition ? formatInlinePosition(params.seed.zodiacPosition) : null;
  const fontSize = clamp(params.glyphFontSize * 0.25, 5, 8);
  return params.rails.flatMap((rail) => {
    let text = "";
    let sign: AstroWheelZodiacSign | undefined;
    let glyphScale: number | undefined;
    if (rail.id === "degree") text = position?.degreesText ?? "";
    if (rail.id === "sign") {
      sign = position?.sign as AstroWheelZodiacSign | undefined;
      text = sign ? ASTRO_WHEEL_ZODIAC_SIGNS.find((entry) => entry.sign === sign)?.glyph ?? sign : "";
      glyphScale = fontSize * 0.78;
    }
    if (rail.id === "minutes") text = position?.minutesText ?? "";
    if (rail.id === "retrograde") text = params.seed.retrograde ? "R" : "";
    if (!text) return [];
    return [{
      railId: rail.id,
      text,
      sign,
      position: polarToXY(params.center.x, params.center.y, rail.radius, params.displayAngle),
      angle: params.displayAngle,
      fontSize,
      glyphScale,
      visible: rail.visible,
    }];
  });
}

function getHouseContext(longitude: number, houses: readonly ZodiacPosition[]) {
  if (houses.length === 0) {
    return {};
  }
  const lon = normalizeAngle(longitude);
  let house = houses.length;
  let nearestCuspHouse = 1;
  let nearestCuspDistanceDegrees = Number.POSITIVE_INFINITY;

  for (let index = 0; index < houses.length; index++) {
    const cusp = normalizeAngle(houses[index].longitude);
    const next = normalizeAngle(houses[(index + 1) % houses.length].longitude);
    const span = clamp360(next - cusp);
    const offset = clamp360(lon - cusp);
    const distance = Math.abs(shortestLongitudeDistance(lon, cusp));
    if (offset < span || Math.abs(offset - span) < 0.0001) {
      house = index + 1;
    }
    if (distance < nearestCuspDistanceDegrees) {
      nearestCuspDistanceDegrees = distance;
      nearestCuspHouse = index + 1;
    }
  }

  return {
    house,
    nearestCuspHouse,
    nearestCuspDistanceDegrees: round(nearestCuspDistanceDegrees),
  };
}

function buildPointLineConnector(params: {
  trueAnchor: AstroWheelCoordinate;
  glyphPosition: AstroWheelCoordinate;
  mode: AstroWheelPointConnectorMode;
  tickAngle: number;
  displayAngle: number;
}): AstroWheelLine | undefined {
  if (params.mode === "never") return undefined;
  if (params.mode === "auto" && circularAngleDistance(params.tickAngle, params.displayAngle) < deg2rad(0.35)) {
    return undefined;
  }
  return {
    x1: params.trueAnchor.x,
    y1: params.trueAnchor.y,
    x2: params.glyphPosition.x,
    y2: params.glyphPosition.y,
  };
}

function buildAspectGroup(params: {
  layer: AstroWheelAspectGroupInput;
  chart: BirthChart;
  pointByKey: Record<string, AstroWheelPoint>;
  center: AstroWheelCoordinate;
  angleOf: (longitude: number) => number;
  rings: Record<AstroWheelRing["id"], AstroWheelRing>;
  palette: ResolvedAstroWheelPalette;
  excludedBodies: ReadonlySet<string>;
}): AstroWheelAspectGroup {
  const { layer, chart, pointByKey, center, angleOf, rings, palette, excludedBodies } = params;
  const sourceEdges = layer.edges
    ? layer.edges
    : getSourceAspectEdges(chart, {
        enabled: true,
        edges: layer.edges,
        aspectSpecs: layer.aspectSpecs,
      });
  const aspectRadius = layer.radius ?? rings.aspects.r2 * (layer.radiusScale ?? 0.96);

  const aspectLines = sourceEdges.flatMap((edge) => {
    if (isExcludedBody(edge.planetA, excludedBodies) || isExcludedBody(edge.planetB, excludedBodies)) {
      return [];
    }

    const planetAKey = normalizePointKey(edge.planetA);
    const planetBKey = normalizePointKey(edge.planetB);
    const planetA = pointByKey[planetAKey];
    const planetB = pointByKey[planetBKey];

    if (!planetA || !planetB) {
      return [];
    }

    const spec = findAspectSpec(edge.aspect, layer.aspectSpecs);
    const maxOrb = spec?.orb ?? 8;
    const opacity = clamp((1 - edge.orb / Math.max(maxOrb, 0.001)) * (layer.opacityScale ?? 1), 0.25, 0.92);
    const a = layer.radius || layer.radiusScale
      ? polarToXY(center.x, center.y, aspectRadius, angleOf(planetA.longitude))
      : planetA.trueAnchor;
    const b = layer.radius || layer.radiusScale
      ? polarToXY(center.x, center.y, aspectRadius, angleOf(planetB.longitude))
      : planetB.trueAnchor;

    return [{
      groupId: layer.id,
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
  layer: AstroWheelPointGroupInput,
  excludedBodies: ReadonlySet<string>
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
      glyphKey: "vertex",
      longitude: chart.houses.ascmc.vertex.longitude,
      zodiacPosition: chart.houses.ascmc.vertex,
    });
  }

  return seeds
    .filter((seed) => !isExcludedBody(seed.name, excludedBodies))
    .sort((a, b) => normalizeAngle(a.longitude) - normalizeAngle(b.longitude));
}

interface PointSeed {
  key: string;
  name: string;
  kind: AstroWheelPointKind;
  glyph: string;
  glyphKey?: string;
  longitude: number;
  retrograde?: boolean;
  zodiacPosition?: ZodiacPosition;
}

interface CircularLabelItem<T> {
  item: T;
  idealAngle: number;
  radius: number;
  tangentDemandPx: number;
}

interface SolvedCircularLabelItem<T> extends CircularLabelItem<T> {
  visualAngle: number;
}

function planetSeed(key: string, planet: HydratedPlanet, groupId: string): PointSeed {
  return {
    key: layerPointKey(groupId, key || planet.name),
    name: planet.name,
    kind: "planet",
    glyph: pointGlyph(planet.name),
    glyphKey: pointGlyphKey(planet.name),
    longitude: planet.longitude,
    retrograde: (planet.longitudeSpeed ?? 0) < 0,
    zodiacPosition: planet.zodiacPosition,
  };
}

function nodeSeed(key: string, node: HydratedNode, groupId: string): PointSeed {
  return {
    key: layerPointKey(groupId, node.name || key),
    name: node.name,
    kind: "node",
    glyph: pointGlyph(node.name),
    glyphKey: pointGlyphKey(node.name),
    longitude: node.longitude,
    zodiacPosition: node,
  };
}

function pointSeed(point: AstroWheelPointSource, groupId: string): PointSeed {
  return {
    key: layerPointKey(groupId, point.key ?? point.name),
    name: point.name,
    kind: point.kind ?? "planet",
    glyph: point.glyph ?? pointGlyph(point.name),
    glyphKey: point.glyph ? undefined : pointGlyphKey(point.name),
    longitude: point.longitude,
    retrograde: point.retrograde,
    zodiacPosition: point.zodiacPosition,
  };
}

function solveCircularLabelAngles<T>(
  items: readonly CircularLabelItem<T>[],
  options: { paddingPx: number; maxDisplacementRad: number }
): SolvedCircularLabelItem<T>[] {
  const { paddingPx, maxDisplacementRad } = options;
  if (items.length === 0) {
    return [];
  }

  const normalized = seedExactAngleClusters(items, { paddingPx, maxDisplacementRad })
    .map((item) => ({
      ...item,
      idealAngle: clampRad(item.idealAngle),
    }))
    .sort((a, b) => a.idealAngle - b.idealAngle);

  if (normalized.length === 1) {
    return [{ ...normalized[0], visualAngle: normalized[0].idealAngle }];
  }

  let largestGap = -Infinity;
  let seamIndex = 0;

  for (let i = 0; i < normalized.length; i++) {
    const current = normalized[i];
    const next = normalized[(i + 1) % normalized.length];
    const nextAngle = i === normalized.length - 1 ? next.idealAngle + TAU : next.idealAngle;
    const gap = nextAngle - current.idealAngle;

    if (gap > largestGap) {
      largestGap = gap;
      seamIndex = (i + 1) % normalized.length;
    }
  }

  const linear = [
    ...normalized.slice(seamIndex),
    ...normalized.slice(0, seamIndex),
  ].map((item, index) => {
    const wrapped = seamIndex > 0 && index >= normalized.length - seamIndex;
    return {
      ...item,
      idealAngle: item.idealAngle + (wrapped ? TAU : 0),
    };
  });

  for (let i = 1; i < linear.length; i++) {
    while (linear[i].idealAngle <= linear[i - 1].idealAngle) {
      linear[i] = {
        ...linear[i],
        idealAngle: linear[i].idealAngle + TAU,
      };
    }
  }

  const solved = linear.map((item) => ({
    ...item,
    visualAngle: item.visualAngleSeed ?? item.idealAngle,
  })).sort((a, b) => a.visualAngle - b.visualAngle);

  for (let iteration = 0; iteration < 50; iteration++) {
    const forces = new Array(solved.length).fill(0) as number[];
    let maxForce = 0;

    for (let i = 0; i < solved.length; i++) {
      const j = (i + 1) % solved.length;
      const current = solved[i];
      const next = solved[j];
      const nextAngle = j === 0 ? next.visualAngle + TAU : next.visualAngle;
      const gap = nextAngle - current.visualAngle;
      const minGap =
        labelAngularHalfDemand(current, paddingPx) +
        labelAngularHalfDemand(next, paddingPx);

      if (gap >= minGap) {
        continue;
      }

      const push = (minGap - gap) / 2;
      forces[i] -= push;
      forces[j] += push;
      maxForce = Math.max(maxForce, push);
    }

    if (maxForce < 0.0001) {
      break;
    }

    for (let i = 0; i < solved.length; i++) {
      const movement = clamp(forces[i], -deg2rad(2), deg2rad(2));
      const moved = solved[i].visualAngle + movement;
      solved[i].visualAngle = clampAngleAroundIdeal(
        moved,
        solved[i].idealAngle,
        maxDisplacementRad
      );
    }

    solved.sort((a, b) => a.visualAngle - b.visualAngle);
    for (let i = 1; i < solved.length; i++) {
      while (solved[i].visualAngle <= solved[i - 1].visualAngle) {
        solved[i].visualAngle += TAU;
      }
    }
  }

  return solved.map((item) => ({
    ...item,
    visualAngle: clampRad(item.visualAngle),
  }));
}

function seedExactAngleClusters<T>(
  items: readonly CircularLabelItem<T>[],
  options: { paddingPx: number; maxDisplacementRad: number }
): Array<CircularLabelItem<T> & { visualAngleSeed?: number }> {
  const seeded = items.map((item) => ({
    ...item,
    idealAngle: clampRad(item.idealAngle),
  }));
  const groups = new Map<string, Array<CircularLabelItem<T> & { visualAngleSeed?: number }>>();

  for (const item of seeded) {
    const key = item.idealAngle.toFixed(6);
    const group = groups.get(key);
    if (group) {
      group.push(item);
    } else {
      groups.set(key, [item]);
    }
  }

  for (const group of groups.values()) {
    if (group.length < 2) {
      continue;
    }

    const center = group[0].idealAngle;
    const largestDemand = Math.max(
      ...group.map((item) => labelAngularHalfDemand(item, options.paddingPx) * 2)
    );
    const maxStep = group.length > 1
      ? (options.maxDisplacementRad * 2) / (group.length - 1)
      : largestDemand;
    const step = Math.min(largestDemand, maxStep);
    const midpoint = (group.length - 1) / 2;

    group.forEach((item, index) => {
      item.visualAngleSeed = center + (index - midpoint) * step;
    });
  }

  return seeded;
}

function clampAngleAroundIdeal(value: number, ideal: number, maxDistance: number) {
  if (!Number.isFinite(maxDistance) || maxDistance >= Math.PI) {
    return value;
  }

  const delta = signedAngleDelta(ideal, value);
  return ideal + clamp(delta, -maxDistance, maxDistance);
}

function signedAngleDelta(from: number, to: number) {
  let delta = clampRad(to) - clampRad(from);
  if (delta > Math.PI) {
    delta -= TAU;
  } else if (delta < -Math.PI) {
    delta += TAU;
  }
  return delta;
}

function labelAngularHalfDemand<T>(
  item: Pick<CircularLabelItem<T>, "radius" | "tangentDemandPx">,
  paddingPx: number
) {
  return (item.tangentDemandPx / 2 + paddingPx) / Math.max(item.radius, 1);
}

function clampRad(value: number) {
  return ((value % TAU) + TAU) % TAU;
}

function circularAngleDistance(a: number, b: number) {
  const delta = Math.abs(clampRad(a) - clampRad(b));
  return Math.min(delta, TAU - delta);
}

function rad2deg(radians: number) {
  return radians * (360 / TAU);
}

function buildPointConnector(params: {
  center: AstroWheelCoordinate;
  tickAngle: number;
  labelAngle: number;
  connectorRadius: number;
  glyphPosition: AstroWheelCoordinate;
  mode: AstroWheelPointConnectorMode;
}): AstroWheelArcConnector | undefined {
  const { center, tickAngle, labelAngle, connectorRadius, glyphPosition, mode } = params;
  const displacement = circularAngleDistance(tickAngle, labelAngle);

  if (mode === "never" || (mode === "auto" && displacement < deg2rad(0.35))) {
    return undefined;
  }

  const path = arcConnectorPath({
    center,
    startAngle: tickAngle,
    endAngle: labelAngle,
    radius: connectorRadius,
    end: glyphPosition,
  });

  return {
    startAngle: tickAngle,
    endAngle: labelAngle,
    radius: connectorRadius,
    path,
  };
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

function shortestLongitudeDistance(a: number, b: number) {
  return ((normalizeAngle(a) - normalizeAngle(b) + 540) % 360) - 180;
}

function findAspectSpec(
  aspect: string,
  specs: readonly AspectSpec[] = ASTRO_WHEEL_DEFAULT_ASPECT_SPECS
) {
  return specs.find((spec) => spec.name === aspect);
}

function buildRings(
  outerRadius: number,
  ringFractions: AstroWheelLayoutOptions["rings"] = {}
): Record<AstroWheelRing["id"], AstroWheelRing> {
  const fractions = {
    ...DEFAULT_ASTRO_WHEEL_RING_FRACTIONS,
    ...ringFractions,
  };
  const ringMap = buildRingMap(outerRadius, [
    { id: "houses", fr: fractions.houses },
    { id: "zodiac", fr: fractions.zodiac },
    { id: "planets", fr: fractions.planets },
    { id: "aspects", fr: fractions.aspects },
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
  const normalizedDefs = defs.map((def) => ({
    ...def,
    fr: Number.isFinite(def.fr) && def.fr > 0 ? def.fr : DEFAULT_ASTRO_WHEEL_RING_FRACTIONS[def.id],
  }));
  const frTotal = normalizedDefs.reduce((sum, def) => sum + def.fr, 0);
  let cursor = radius;
  const result = {} as Record<AstroWheelRing["id"], AstroWheelRing>;

  for (const def of normalizedDefs) {
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

function resolvePalette(
  palette: AstroWheelPalette = "default",
  background: string | "transparent" = "transparent"
): ResolvedAstroWheelPalette {
  const base = palette === "monochrome" ? MONOCHROME_PALETTE : DEFAULT_PALETTE;
  if (palette === "default" || palette === "monochrome") {
    return {
      ...clonePalette(base),
      glyphHalo: defaultGlyphHalo(background),
    };
  }

  return {
    ...base,
    ...palette,
    glyphHalo: palette.glyphHalo ?? defaultGlyphHalo(background),
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

function defaultGlyphHalo(background: string | "transparent") {
  return background === "transparent" ? "#fff" : background;
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

function resolvePointOptions(options: boolean | AstroWheelPointOptions | undefined): ResolvedPointOptions {
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
    collisionThresholdDegrees: options.collisionThresholdDegrees,
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

function resolvePointGroupRadius(
  layer: AstroWheelPointGroupInput,
  rings: Record<AstroWheelRing["id"], AstroWheelRing>
) {
  const ring = rings.planets;

  if (layer.radius === "external") {
    return rings.houses.r2 + (layer.radiusOffset ?? 18);
  }

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

function pointGlyphKey(name: string) {
  const key = normalizePointKey(name);
  return POINT_GLYPH_ALIASES[key] ?? key;
}

function resolveExcludedBodies(excludeBodies: readonly string[] | undefined) {
  return new Set((excludeBodies ?? []).map((body) => normalizePointKey(body)));
}

function isExcludedBody(name: string, excludedBodies: ReadonlySet<string>) {
  return excludedBodies.has(normalizePointKey(name));
}

function normalizePointKey(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function layerPointKey(groupId: string, value: string) {
  const key = normalizePointKey(value);
  return groupId === "birth" ? key : `${groupId}:${key}`;
}

function renderGlyphPrimitives(
  push: (line: string) => void,
  primitives: readonly AstroGlyphPrimitive[],
  options: { color: string; fill?: string; glyphFill?: string }
) {
  for (const p of primitives) {
    if (p.kind === "path") {
      push(`<path d="${escapeAttr(p.d)}"/>`);
    } else if (p.kind === "circle") {
      push(`<circle cx="${fmt(p.cx)}" cy="${fmt(p.cy)}" r="${fmt(p.r)}"/>`);
    } else if (p.kind === "line") {
      push(`<line x1="${fmt(p.x1)}" y1="${fmt(p.y1)}" x2="${fmt(p.x2)}" y2="${fmt(p.y2)}"/>`);
    } else if (p.kind === "polyline") {
      push(`<polyline points="${escapeAttr(p.points)}"/>`);
    } else if (p.kind === "text") {
      push(
        `<text x="${fmt(p.x ?? 0)}" y="${fmt(p.y ?? 0)}" font-family="${textFontFamily()}" font-size="${fmt(p.fontSize ?? 0.72)}" font-weight="${escapeAttr(String(p.fontWeight ?? 500))}" text-anchor="middle" dominant-baseline="middle" fill="${escapeAttr(options.color)}" stroke="none">${escapeText(p.text)}</text>`
      );
    } else {
      let markup = p.markup;
      if (options.glyphFill) {
        markup = markup.split(GLYPH_FILL).join(options.glyphFill);
      }
      push(markup);
    }
  }
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

function arcConnectorPath(params: {
  center: AstroWheelCoordinate;
  startAngle: number;
  endAngle: number;
  radius: number;
  end: AstroWheelCoordinate;
}) {
  const { center, startAngle, endAngle, radius, end } = params;
  const start = polarToXY(center.x, center.y, radius, startAngle);
  const arcEnd = polarToXY(center.x, center.y, radius, endAngle);
  const delta = signedAngleDelta(startAngle, endAngle);
  const large = Math.abs(delta) > Math.PI ? 1 : 0;
  const sweep = delta >= 0 ? 1 : 0;
  const commands = [
    `M ${fmt(start.x)},${fmt(start.y)}`,
    `A ${fmt(radius)},${fmt(radius)} 0 ${large} ${sweep} ${fmt(arcEnd.x)},${fmt(arcEnd.y)}`,
  ];

  if (Math.hypot(arcEnd.x - end.x, arcEnd.y - end.y) > 0.5) {
    commands.push(`L ${fmt(end.x)},${fmt(end.y)}`);
  }

  return commands.join(" ");
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
