import {
  createTree,
  id,
  KaabalahTypes,
  MiscTypes,
  parseId,
  TREE_TOPOLOGY_PATH_IDS,
  TREE_TOPOLOGY_SPHERE_IDS,
  TREE_TOPOLOGY_SPHERE_NAMES,
  type NodeId,
  type SystemKey,
  type TreeTopologyRoute,
  type TreeTopologySphereName,
} from "../core";

export interface TreeSvgViewBox {
  minX?: number;
  minY?: number;
  width: number;
  height: number;
}

export interface TreeLayoutCoordinate {
  x: number;
  y: number;
}

export type TreeTargetState = "active" | "hovered" | "selected" | "inactive";

export type TreeSphereName = TreeTopologySphereName;

export type TreeSphereId = NodeId<KaabalahTypes.SPHERE>;
export type TreePathId = NodeId<KaabalahTypes.PATH>;

export interface TreeLayoutPath {
  fromId: TreeSphereId;
  toId: TreeSphereId;
  from: TreeLayoutCoordinate;
  to: TreeLayoutCoordinate;
}

export interface TreeLayoutMap {
  spheres: Record<TreeSphereId, TreeLayoutCoordinate>;
  paths: Record<TreePathId, TreeLayoutPath>;
}

export interface TreeLayout {
  system: SystemKey;
  viewBox: Required<TreeSvgViewBox>;
  sphereOrder: TreeSphereId[];
  pathOrder: TreePathId[];
  percentages: TreeLayoutMap;
  viewBoxUnits: TreeLayoutMap;
}

export interface TreeSvgCustomPalette {
  defaultSphereFill?: string;
  defaultPathColor?: string;
  sphereFills?: Partial<Record<TreeSphereId, string | string[]>>;
  pathColors?: Partial<Record<TreePathId, string>>;
  pathEdgeColor?: string;
  sphereStrokeColor?: string;
  sphereStrokeWidth?: number;
  pathHighlightColor?: string;
  pathHighlightOpacity?: number;
  specialSphereMode?: "preserve" | "plain";
}

export type TreeSvgPalette = "color" | "monochrome" | TreeSvgCustomPalette;
export type TreeSvgDaathLayer = "front" | "back";

export interface TreeSvgHighlights {
  paths?: Partial<Record<TreePathId, string>>;
  spheres?: Partial<Record<TreeSphereId, string | string[]>>;
  specialSphereMode?: "preserve" | "plain";
}

export interface TreeTargetActivationInput {
  targetId: TreeSphereId | TreePathId;
  targetType: "sphere" | "path";
  count: number;
  total: number;
  strength?: number;
  state?: TreeTargetState;
  color?: string;
}

export interface TreeRenderAnchor {
  x: number;
  y: number;
  vertical: "above" | "below";
}

export interface TreeRenderCircleHitTarget {
  kind: "circle";
  cx: number;
  cy: number;
  r: number;
}

export interface TreeRenderLineHitTarget {
  kind: "line";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  strokeWidth: number;
}

export type TreeRenderHitTarget = TreeRenderCircleHitTarget | TreeRenderLineHitTarget;

export interface TreeRenderActivationState {
  state: TreeTargetState;
  count: number;
  total: number;
  strength: number;
  canonicalColor: string;
  displayColor: string;
  colorOverride?: string;
  mutedColor: string;
  visible: boolean;
  emphasis: number;
}

export interface TreeRenderSphereGeometry {
  percentages: {
    center: TreeLayoutCoordinate;
    anchor: TreeRenderAnchor;
  };
  viewBoxUnits: {
    center: TreeLayoutCoordinate;
    anchor: TreeRenderAnchor;
    hitTarget: TreeRenderCircleHitTarget;
  };
  radius: {
    viewBoxUnits: number;
  };
}

export interface TreeRenderPathGeometry {
  percentages: {
    from: TreeLayoutCoordinate;
    to: TreeLayoutCoordinate;
    anchor: TreeRenderAnchor;
  };
  viewBoxUnits: {
    from: TreeLayoutCoordinate;
    to: TreeLayoutCoordinate;
    anchor: TreeRenderAnchor;
    hitTarget: TreeRenderLineHitTarget;
  };
  widths: {
    edge: number;
    main: number;
    highlight: number;
    hitTarget: number;
  };
}

export interface TreeRenderSphere {
  id: TreeSphereId;
  name: TreeSphereName;
  slug: string;
  canonicalColor: string;
  displayFill: string | string[];
  geometry: TreeRenderSphereGeometry;
  material: {
    kind: "standard" | "special";
    specialSphereName?: Extract<TreeSphereName, "Kether" | "Chokhmah" | "Daath" | "Malkuth">;
    preserveOnActivation: boolean;
  };
  activation: TreeRenderActivationState | null;
}

export interface TreeRenderPath {
  id: TreePathId;
  geometry: TreeRenderPathGeometry;
  canonicalColor: string;
  displayColor: string;
  activation: TreeRenderActivationState | null;
}

export interface TreeRenderLayer {
  name: "background" | "paths" | "spheres-behind-paths" | "spheres" | "hit-targets";
  order: number;
  description: string;
}

export interface TreeRenderModel {
  system: SystemKey;
  viewBox: Required<TreeSvgViewBox>;
  scale: number;
  layout: TreeLayout;
  layerOrder: readonly TreeRenderLayer["name"][];
  layers: readonly TreeRenderLayer[];
  spheres: readonly TreeRenderSphere[];
  paths: readonly TreeRenderPath[];
  sphereById: Record<TreeSphereId, TreeRenderSphere>;
  pathById: Record<TreePathId, TreeRenderPath>;
}

export interface TreeSvgOptions {
  width?: number | string;
  height?: number | string;
  viewBox?: TreeSvgViewBox;
  background?: string | "transparent";
  palette?: TreeSvgPalette;
  system?: SystemKey;
  daathLayer?: TreeSvgDaathLayer;
  highlights?: TreeSvgHighlights;
  activations?: readonly TreeTargetActivationInput[];
}

export interface RouteActivationOptions {
  state?: TreeTargetState;
  color?: string;
  strength?: number;
}

export const TREE_SVG_DEFAULT_VIEWBOX: Required<TreeSvgViewBox> = {
  minX: 0,
  minY: 0,
  width: 286,
  height: 561,
};

export const TREE_SPHERE_NAMES = [
  ...TREE_TOPOLOGY_SPHERE_NAMES,
] as const satisfies readonly TreeSphereName[];

const CANONICAL_X_PERCENTAGES = { left: 13.25, mid: 49.94, right: 86.66 } as const;
const CANONICAL_ROW_Y_PERCENTAGES = [
  6.83,
  17.68,
  28.42,
  39.26,
  50.06,
  60.85,
  71.68,
  93.2,
] as const;

const DEFAULT_SPHERE_RADIUS = 30;
const DEFAULT_PATH_EDGE_WIDTH = 26;
const DEFAULT_PATH_MAIN_WIDTH = 22;
const DEFAULT_PATH_HIGHLIGHT_WIDTH = 8;
const DEFAULT_SPHERE_HIT_RADIUS = DEFAULT_SPHERE_RADIUS + 8;
const DEFAULT_PATH_HIT_STROKE_WIDTH = DEFAULT_PATH_EDGE_WIDTH + 8;
const MUTED_TARGET_COLOR = "#AAA";

// The solid-colour spheres now share their colour with the paths leaving them,
// so they get a small inner rim in a darker shade of their own fill to stay
// visually distinct. Special spheres (Kether/Chokhmah/Daath/Malkuth) and Binah
// keep their own treatment.
const INNER_BORDER_SPHERE_NAMES = new Set<TreeSphereName>(["Tiphareth"]);

const NAZAR_NACRE = "__nacre__";
const NAZAR_IRIS = "#33a6dd";
const NAZAR_PUPIL = "#0b0b12";

const sphereId = (name: TreeSphereName) =>
  id(KaabalahTypes.SPHERE, name) as TreeSphereId;

const pathId = (value: string) => id(KaabalahTypes.PATH, value) as TreePathId;

// Paths drawn with a hard split gradient: each half takes the colour of its
// adjacent sphere, so the path visibly bridges the two. Start with one path
// while we tune the look, then extend.
const SPLIT_GRADIENT_PATH_IDS = new Set<TreePathId>(
  Array.from({ length: 22 }, (_, index) => pathId(String(index + 1)))
);
// Width (in % of the path length) of the soft blend band across the midpoint
// where the two adjacent-sphere colours grade into each other.
const SPLIT_GRADIENT_BLEND = 34;

// The special spheres render with multi-tone materials (nacre, iridescence,
// sliced disc) so their single "canonical" colour doesn't match what's drawn.
// For split gradients we grade toward a representative colour chosen to blend
// with each sphere's rendered border instead. (Daath has no paths.)
const SPECIAL_SPHERE_PATH_COLORS: Partial<Record<TreeSphereName, string>> = {
  Kether: "#cfe0f2",
  Chokhmah: "#e6d6ef",
  Malkuth: "#8a6a52",
};

// Chokhmah renders as an iridescent disc whose colour at angle θ maps to
// t = (θ + 90) / 360 through IRIDESCENT_STOPS. Paths touching it sample that
// same wheel: the contact point matches the disc exactly, then the ribbon
// sweeps onward through the spectrum — so the path feels like the same
// iridescent material flowing outward.
const CHOKHMAH_SWEEP_SPAN = 0.42; // fraction of the colour wheel a ribbon spans
const CHOKHMAH_SWEEP_SAMPLES = 12;

function iridescentColorAt(t: number) {
  const frac = ((t % 1) + 1) % 1;
  return interpolateColorStops(IRIDESCENT_STOPS, frac);
}

// Wheel position of the disc colour seen looking from `center` toward `toward`.
function iridescentContactT(
  center: TreeLayoutCoordinate,
  toward: TreeLayoutCoordinate
) {
  const degrees = (Math.atan2(toward.y - center.y, toward.x - center.x) * 180) / Math.PI;
  return (((degrees + 90) / 360) % 1 + 1) % 1;
}

// Endpoints of a path shortened by `radius` at each end, i.e. the points where
// the line emerges from under each sphere.
function edgeAnchoredVector(
  from: TreeLayoutCoordinate,
  to: TreeLayoutCoordinate,
  radius: number
) {
  const length = Math.hypot(to.x - from.x, to.y - from.y) || 1;
  const ux = (to.x - from.x) / length;
  const uy = (to.y - from.y) / length;
  return {
    x1: round(from.x + ux * radius),
    y1: round(from.y + uy * radius),
    x2: round(to.x - ux * radius),
    y2: round(to.y - uy * radius),
  };
}

export const TREE_SPHERE_IDS = [...TREE_TOPOLOGY_SPHERE_IDS] as TreeSphereId[];
export const TREE_PATH_IDS = [...TREE_TOPOLOGY_PATH_IDS] as TreePathId[];

const CANONICAL_SPHERE_PERCENTAGES = {
  [sphereId("Kether")]: { x: CANONICAL_X_PERCENTAGES.mid, y: CANONICAL_ROW_Y_PERCENTAGES[0] },
  [sphereId("Chokhmah")]: { x: CANONICAL_X_PERCENTAGES.right, y: CANONICAL_ROW_Y_PERCENTAGES[1] },
  [sphereId("Binah")]: { x: CANONICAL_X_PERCENTAGES.left, y: CANONICAL_ROW_Y_PERCENTAGES[1] },
  [sphereId("Daath")]: { x: CANONICAL_X_PERCENTAGES.mid, y: CANONICAL_ROW_Y_PERCENTAGES[2] },
  [sphereId("Chesed")]: { x: CANONICAL_X_PERCENTAGES.right, y: CANONICAL_ROW_Y_PERCENTAGES[3] },
  [sphereId("Geburah")]: { x: CANONICAL_X_PERCENTAGES.left, y: CANONICAL_ROW_Y_PERCENTAGES[3] },
  [sphereId("Tiphareth")]: { x: CANONICAL_X_PERCENTAGES.mid, y: CANONICAL_ROW_Y_PERCENTAGES[4] },
  [sphereId("Netzach")]: { x: CANONICAL_X_PERCENTAGES.right, y: CANONICAL_ROW_Y_PERCENTAGES[5] },
  [sphereId("Hod")]: { x: CANONICAL_X_PERCENTAGES.left, y: CANONICAL_ROW_Y_PERCENTAGES[5] },
  [sphereId("Yesod")]: { x: CANONICAL_X_PERCENTAGES.mid, y: CANONICAL_ROW_Y_PERCENTAGES[6] },
  [sphereId("Malkuth")]: { x: CANONICAL_X_PERCENTAGES.mid, y: CANONICAL_ROW_Y_PERCENTAGES[7] },
} as Record<TreeSphereId, TreeLayoutCoordinate>;

interface ResolvedPalette {
  mode: "color" | "monochrome" | "custom";
  defaultSphereFill: string;
  defaultPathColor: string;
  sphereFills: Partial<Record<TreeSphereId, string | string[]>>;
  pathColors: Partial<Record<TreePathId, string>>;
  pathEdgeColor: string;
  pathEdgeUseFilter: boolean;
  sphereStrokeColor?: string;
  sphereStrokeWidth?: number;
  pathHighlightColor: string;
  pathHighlightOpacity: number;
  specialSphereMode: "preserve" | "plain";
}

interface ResolvedHighlights {
  pathColors: Partial<Record<TreePathId, string>>;
  sphereFills: Partial<Record<TreeSphereId, string | string[]>>;
  specialSphereMode: "preserve" | "plain";
}

export function getTreeLayout(system: SystemKey = "kaabalah"): TreeLayout {
  const tree = createTree({ system });
  const percentages = buildLayoutMap(tree, CANONICAL_SPHERE_PERCENTAGES);
  const viewBoxUnits = buildLayoutMap(
    tree,
    scaleCoordinates(CANONICAL_SPHERE_PERCENTAGES, TREE_SVG_DEFAULT_VIEWBOX)
  );

  return {
    system,
    viewBox: { ...TREE_SVG_DEFAULT_VIEWBOX },
    sphereOrder: [...TREE_SPHERE_IDS],
    pathOrder: [...TREE_PATH_IDS],
    percentages,
    viewBoxUnits,
  };
}

export function getRouteActivations(
  route: TreeTopologyRoute,
  options: RouteActivationOptions = {}
): TreeTargetActivationInput[] {
  const { state = "active", color, strength } = options;

  return route.targets.map((target) => ({
    targetId: target.targetId,
    targetType: target.targetType,
    count: 1,
    total: 1,
    state,
    ...(color !== undefined ? { color } : {}),
    ...(strength !== undefined ? { strength } : {}),
  }));
}

export function getTreeRenderModel(options: TreeSvgOptions = {}): TreeRenderModel {
  const system = options.system ?? "kaabalah";
  const tree = createTree({ system, parts: ["colors"] });
  const viewBox = normalizeViewBox(options.viewBox);
  const palette = resolvePalette(options.palette);
  const highlights = resolveHighlights(options.highlights);
  const activationMap = resolveActivationMap(options.activations);
  const layout = getTreeLayout(system);
  const spherePositions = scaleCoordinates(CANONICAL_SPHERE_PERCENTAGES, viewBox);
  const viewBoxLayout = buildLayoutMap(tree, spherePositions);
  const scale = Math.min(
    viewBox.width / TREE_SVG_DEFAULT_VIEWBOX.width,
    viewBox.height / TREE_SVG_DEFAULT_VIEWBOX.height
  );
  const radius = round(DEFAULT_SPHERE_RADIUS * scale);
  const pathEdgeWidth = round(DEFAULT_PATH_EDGE_WIDTH * scale);
  const pathMainWidth = round(DEFAULT_PATH_MAIN_WIDTH * scale);
  const pathHighlightWidth = round(DEFAULT_PATH_HIGHLIGHT_WIDTH * scale);
  const sphereHitRadius = round(DEFAULT_SPHERE_HIT_RADIUS * scale);
  const pathHitStrokeWidth = round(DEFAULT_PATH_HIT_STROKE_WIDTH * scale);
  const layers: TreeRenderLayer[] = [
    { name: "background" as const, order: 0, description: "Background rectangle when requested." },
    ...(options.daathLayer === "back"
      ? [{ name: "spheres-behind-paths" as const, order: 1, description: "Daath behind the paths." }]
      : []),
    { name: "paths" as const, order: options.daathLayer === "back" ? 2 : 1, description: "Canonical paths and activation emphasis." },
    { name: "spheres" as const, order: options.daathLayer === "back" ? 3 : 2, description: "Canonical sphere material and activation halos." },
    { name: "hit-targets" as const, order: options.daathLayer === "back" ? 4 : 3, description: "Invisible anchors for interaction." },
  ];
  const layerOrder = layers.map((layer) => layer.name);
  const spheres = TREE_SPHERE_NAMES.map((sphereName) => {
    const sphereIdValue = sphereId(sphereName);
    const canonicalColor = resolveSphereCanonicalColor({
      palette,
      sphereId: sphereIdValue,
      tree,
    });
    const point = spherePositions[sphereIdValue];
    const activation = resolveTargetActivation({
      activation: activationMap.get(sphereIdValue),
      canonicalColor,
    });
    const activeFill = resolveSphereDisplayFill({
      palette,
      highlights,
      sphereId: sphereIdValue,
      canonicalColor,
      activation,
    });
    return {
      id: sphereIdValue,
      name: sphereName,
      slug: sphereName.toLowerCase(),
      canonicalColor,
      geometry: {
        percentages: {
          center: { ...layout.percentages.spheres[sphereIdValue] },
          anchor: getPercentageAnchor(layout.percentages.spheres[sphereIdValue]),
        },
        viewBoxUnits: {
          center: { ...point },
          anchor: getViewBoxAnchor(point, viewBox),
          hitTarget: {
            kind: "circle" as const,
            cx: point.x,
            cy: point.y,
            r: sphereHitRadius,
          },
        },
        radius: {
          viewBoxUnits: radius,
        },
      },
      material: getSphereMaterial({
        sphereName,
        preserveSpecialMaterial: shouldPreserveSpecialRenderer({
          palette,
          highlights,
          hasPaintOverride:
            activation !== null || highlights.sphereFills[sphereIdValue] !== undefined,
          activation,
        }),
      }),
      activation,
      displayFill: activeFill,
    };
  });

  const paths = TREE_PATH_IDS.map((pathIdValue) => {
    const canonicalColor = resolvePathCanonicalColor({
      palette,
      tree,
      pathId: pathIdValue,
    });
    const path = viewBoxLayout.paths[pathIdValue];
    const activation = resolveTargetActivation({
      activation: activationMap.get(pathIdValue),
      canonicalColor,
    });
    const displayColor = activation
      ? resolvePathDisplayColor({
          canonicalColor,
          activation,
        })
      : resolvePathBaseColor({
          canonicalColor,
          highlights,
          pathId: pathIdValue,
        });
    return {
      id: pathIdValue,
      canonicalColor,
      geometry: {
        percentages: {
          from: { ...layout.percentages.paths[pathIdValue].from },
          to: { ...layout.percentages.paths[pathIdValue].to },
          anchor: getPercentagePathAnchor(layout.percentages.paths[pathIdValue]),
        },
        viewBoxUnits: {
          from: { ...path.from },
          to: { ...path.to },
          anchor: getViewBoxPathAnchor(path, viewBox),
          hitTarget: {
            kind: "line" as const,
            x1: path.from.x,
            y1: path.from.y,
            x2: path.to.x,
            y2: path.to.y,
            strokeWidth: pathHitStrokeWidth,
          },
        },
        widths: {
          edge: pathEdgeWidth,
          main: pathMainWidth,
          highlight: pathHighlightWidth,
          hitTarget: pathHitStrokeWidth,
        },
      },
      activation,
      displayColor,
    };
  });

  return {
    system,
    viewBox,
    scale,
    layout,
    layerOrder,
    layers,
    spheres,
    paths,
    sphereById: Object.fromEntries(spheres.map((entry) => [entry.id, entry])) as Record<TreeSphereId, TreeRenderSphere>,
    pathById: Object.fromEntries(paths.map((entry) => [entry.id, entry])) as Record<TreePathId, TreeRenderPath>,
  };
}

export function generateTreeSvg(options: TreeSvgOptions = {}): string {
  const system = options.system ?? "kaabalah";
  const daathLayer = options.daathLayer ?? "front";
  const tree = createTree({ system, parts: ["colors"] });
  const viewBox = normalizeViewBox(options.viewBox);
  const palette = resolvePalette(options.palette);
  const highlights = resolveHighlights(options.highlights);
  const activationMap = resolveActivationMap(options.activations);
  const spherePositions = scaleCoordinates(CANONICAL_SPHERE_PERCENTAGES, viewBox);
  const layout = buildLayoutMap(tree, spherePositions);
  const scale = Math.min(
    viewBox.width / TREE_SVG_DEFAULT_VIEWBOX.width,
    viewBox.height / TREE_SVG_DEFAULT_VIEWBOX.height
  );

  const radius = round(DEFAULT_SPHERE_RADIUS * scale);
  const pathEdgeWidth = round(DEFAULT_PATH_EDGE_WIDTH * scale);
  const pathMainWidth = round(DEFAULT_PATH_MAIN_WIDTH * scale);
  const pathHighlightWidth = round(DEFAULT_PATH_HIGHLIGHT_WIDTH * scale);
  const sphereStrokeWidth = palette.sphereStrokeWidth
    ? round(palette.sphereStrokeWidth * scale)
    : undefined;

  const lines: string[] = [];
  const push = (line: string) => lines.push(line);
  const svgAttributes = [
    `xmlns="http://www.w3.org/2000/svg"`,
    options.width !== undefined ? `width="${escapeAttr(String(options.width))}"` : "",
    options.height !== undefined ? `height="${escapeAttr(String(options.height))}"` : "",
    `viewBox="${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}"`,
    `preserveAspectRatio="xMidYMid meet"`,
  ].filter(Boolean);

  push(`<svg ${svgAttributes.join(" ")}>`);
  push(`<defs>`);
  push(`<filter id="pathDarken">
  <feComponentTransfer>
    <feFuncR type="linear" slope="0.65"/>
    <feFuncG type="linear" slope="0.65"/>
    <feFuncB type="linear" slope="0.65"/>
  </feComponentTransfer>
</filter>`);

  for (const sphereName of TREE_SPHERE_NAMES) {
    const currentSphereId = sphereId(sphereName);
    const slug = sphereName.toLowerCase();
    const point = spherePositions[currentSphereId];
    if (!point) {
      continue;
    }

    push(`<radialGradient id="spec-${slug}" cx="30%" cy="25%" r="55%" fx="30%" fy="25%">
  <stop offset="0%" stop-color="white" stop-opacity="0.95"/>
  <stop offset="25%" stop-color="white" stop-opacity="0.45"/>
  <stop offset="50%" stop-color="white" stop-opacity="0.08"/>
  <stop offset="100%" stop-color="white" stop-opacity="0"/>
</radialGradient>`);

    push(`<radialGradient id="shad-${slug}" cx="78%" cy="80%" r="55%" fx="78%" fy="80%">
  <stop offset="0%" stop-color="black" stop-opacity="0.32"/>
  <stop offset="40%" stop-color="black" stop-opacity="0.12"/>
  <stop offset="100%" stop-color="black" stop-opacity="0"/>
</radialGradient>`);

    push(
      `<clipPath id="clip-${slug}"><circle cx="${point.x}" cy="${point.y}" r="${radius}"/></clipPath>`
    );
  }

  if (palette.mode === "color") {
    for (const splitPathId of SPLIT_GRADIENT_PATH_IDS) {
      const splitPath = layout.paths[splitPathId];
      // Skip paths the caller is explicitly recolouring (highlight/activation):
      // those keep their solid override instead of the split gradient.
      if (
        !splitPath ||
        highlights.pathColors[splitPathId] !== undefined ||
        activationMap.get(splitPathId) !== undefined
      ) {
        continue;
      }
      const fromColor = resolveSplitEndpointColor({
        palette,
        sphereId: splitPath.fromId,
        tree,
      });
      const toColor = resolveSplitEndpointColor({
        palette,
        sphereId: splitPath.toId,
        tree,
      });
      const blendStart = round(50 - SPLIT_GRADIENT_BLEND / 2);
      const blendEnd = round(50 + SPLIT_GRADIENT_BLEND / 2);
      const fromName = parseId(splitPath.fromId) as TreeSphereName;
      const toName = parseId(splitPath.toId) as TreeSphereName;
      // Wheel position where the ribbon meets the iridescent disc, looking from
      // Chokhmah's centre toward the other sphere.
      const contactT =
        toName === "Chokhmah"
          ? iridescentContactT(splitPath.to, splitPath.from)
          : fromName === "Chokhmah"
            ? iridescentContactT(splitPath.from, splitPath.to)
            : null;
      const stops = buildSplitGradientStops({
        fromName,
        toName,
        fromColor,
        toColor,
        blendStart,
        blendEnd,
        contactT,
      });
      // The path line runs centre-to-centre but each end is hidden under its
      // sphere. Anchor the gradient to the visible sphere-edge contact points so
      // offset 0%/100% land where the ribbon actually emerges (matters most for
      // the Chokhmah contact colour).
      const edge = edgeAnchoredVector(splitPath.from, splitPath.to, radius);
      push(
        `<linearGradient id="path-grad-${parseId(splitPathId)}" gradientUnits="userSpaceOnUse" x1="${edge.x1}" y1="${edge.y1}" x2="${edge.x2}" y2="${edge.y2}">
${stops}
</linearGradient>`
      );
    }
  }

  push(`</defs>`);

  const background = options.background ?? "white";
  if (background !== "transparent") {
    push(
      `<rect x="${viewBox.minX}" y="${viewBox.minY}" width="${viewBox.width}" height="${viewBox.height}" fill="${escapeAttr(background)}"/>`
    );
  }

  if (daathLayer === "back") {
    push(`<g id="spheres-behind-paths">`);
    renderSphere(push, {
      highlights,
      activation: resolveTargetActivation({
        activation: activationMap.get(sphereId("Daath")),
        canonicalColor: resolveSphereCanonicalColor({
          palette,
          sphereId: sphereId("Daath"),
          tree,
        }),
      }),
      tree,
      palette,
      radius,
      sphereStrokeWidth,
      spherePositions,
      sphereName: "Daath",
    });
    push(`</g>`);
  }

  push(`<g id="paths">`);
  for (const currentPathId of TREE_PATH_IDS) {
    const path = layout.paths[currentPathId];
    const canonicalColor = resolvePathCanonicalColor({
      palette,
      tree,
      pathId: currentPathId,
    });
    const baseColor = resolvePathBaseColor({
      canonicalColor,
      highlights,
      pathId: currentPathId,
    });
    const activation = resolveTargetActivation({
      activation: activationMap.get(currentPathId),
      canonicalColor,
    });
    const useSplitGradient =
      palette.mode === "color" &&
      !activation &&
      highlights.pathColors[currentPathId] === undefined &&
      SPLIT_GRADIENT_PATH_IDS.has(currentPathId);
    // Solid colour used both when no gradient applies and as the fallback layer
    // for renderers that don't support gradients.
    const solidColor = activation
      ? resolvePathDisplayColor({ canonicalColor, activation })
      : baseColor;
    const solidEdgeColor = resolvePathEdgeColor({ palette, pathColor: solidColor });
    const gradientRef = useSplitGradient
      ? `url(#path-grad-${parseId(currentPathId)})`
      : null;
    const color = gradientRef ?? solidColor;
    const edgeColor = gradientRef ?? solidEdgeColor;
    const edgeFilter = palette.pathEdgeUseFilter ? ` filter="url(#pathDarken)"` : "";

    if (gradientRef) {
      // Solid fallback drawn underneath; the gradient lines fully cover it when
      // gradients are supported.
      push(
        `<line x1="${path.from.x}" y1="${path.from.y}" x2="${path.to.x}" y2="${path.to.y}" stroke="${escapeAttr(solidEdgeColor)}" stroke-width="${pathEdgeWidth}" stroke-linecap="round"${edgeFilter}/>`
      );
    }

    push(
      `<line x1="${path.from.x}" y1="${path.from.y}" x2="${path.to.x}" y2="${path.to.y}" stroke="${escapeAttr(edgeColor)}" stroke-width="${pathEdgeWidth}" stroke-linecap="round"${edgeFilter}/>`
    );
    if (activation?.visible && activation.emphasis > 0) {
      push(
        `<line x1="${path.from.x}" y1="${path.from.y}" x2="${path.to.x}" y2="${path.to.y}" stroke="${escapeAttr(color)}" stroke-opacity="${round(0.18 + activation.emphasis * 0.28)}" stroke-width="${round(pathEdgeWidth + activation.emphasis * 10)}" stroke-linecap="round"/>`
      );
    }
    if (gradientRef) {
      push(
        `<line x1="${path.from.x}" y1="${path.from.y}" x2="${path.to.x}" y2="${path.to.y}" stroke="${escapeAttr(solidColor)}" stroke-width="${pathMainWidth}" stroke-linecap="round"/>`
      );
    }
    push(
      `<line x1="${path.from.x}" y1="${path.from.y}" x2="${path.to.x}" y2="${path.to.y}" stroke="${escapeAttr(color)}" stroke-width="${pathMainWidth}" stroke-linecap="round"/>`
    );
    push(
      `<line x1="${path.from.x}" y1="${path.from.y}" x2="${path.to.x}" y2="${path.to.y}" stroke="${escapeAttr(palette.pathHighlightColor)}" stroke-opacity="${palette.pathHighlightOpacity}" stroke-width="${pathHighlightWidth}" stroke-linecap="round"/>`
    );
  }
  push(`</g>`);

  const frontSphereNames =
    daathLayer === "back"
      ? TREE_SPHERE_NAMES.filter((name): name is Exclude<TreeSphereName, "Daath"> => name !== "Daath")
      : TREE_SPHERE_NAMES;

  push(`<g id="spheres">`);
  for (const sphereName of frontSphereNames) {
    const currentSphereId = sphereId(sphereName);
    const canonicalColor = resolveSphereCanonicalColor({
      palette,
      sphereId: currentSphereId,
      tree,
    });
    renderSphere(push, {
      highlights,
      activation: resolveTargetActivation({
        activation: activationMap.get(currentSphereId),
        canonicalColor,
      }),
      tree,
      palette,
      radius,
      sphereStrokeWidth,
      spherePositions,
      sphereName,
    });
  }
  push(`</g>`);
  if (daathLayer === "back") {
    const daathPoint = spherePositions[sphereId("Daath")];
    push(
      `<circle id="sphere-daath-hit-area" data-node-id="sphere:Daath" cx="${daathPoint.x}" cy="${daathPoint.y}" r="${radius}" fill="transparent" pointer-events="all"/>`
    );
  }
  push(`</svg>`);

  return lines.join("\n");
}

function renderSphere(
  push: (line: string) => void,
  params: {
    highlights: ResolvedHighlights;
    activation: TreeRenderActivationState | null;
    tree: ReturnType<typeof createTree>;
    palette: ResolvedPalette;
    radius: number;
    sphereStrokeWidth?: number;
    spherePositions: Record<TreeSphereId, TreeLayoutCoordinate>;
    sphereName: TreeSphereName;
  }
) {
  const currentSphereId = sphereId(params.sphereName);
  const point = params.spherePositions[currentSphereId];
  const slug = params.sphereName.toLowerCase();
  const colorData =
    params.tree.relatedFirst(currentSphereId, MiscTypes.COLOR)?.data?.colorHexCodes ?? [];
  const sphereFill = resolveSphereFill({
    palette: params.palette,
    sphereId: currentSphereId,
    defaultColors: colorData,
  });
  const activationFill = params.activation
    && (params.activation.state === "inactive" || params.activation.colorOverride)
      ? params.activation.displayColor
      : undefined;
  const highlightFill = activationFill ?? params.highlights.sphereFills[currentSphereId];
  const activeFill = params.activation ? params.activation.displayColor : highlightFill ?? sphereFill;
  const preserveSpecialRenderer =
    shouldPreserveSpecialRenderer({
      palette: params.palette,
      highlights: params.highlights,
      hasPaintOverride: highlightFill !== undefined,
      activation: params.activation,
    });

  if (params.activation?.visible && params.activation.emphasis > 0) {
    const haloStrokeWidth = round(3.2 + params.activation.emphasis * 4.8);
    const haloRadius = round(params.radius + haloStrokeWidth / 2 + 0.7);
    const haloColor = params.activation.displayColor;
    push(
      `<circle cx="${point.x}" cy="${point.y}" r="${haloRadius}" fill="none" stroke="${escapeAttr(haloColor)}" stroke-opacity="${round(0.24 + params.activation.emphasis * 0.28)}" stroke-width="${haloStrokeWidth}"/>`
    );
  }
  push(`<g id="sphere-${slug}" clip-path="url(#clip-${slug})">`);
  if (preserveSpecialRenderer) {
    if (params.sphereName === "Kether") {
      renderKether(
        push,
        point,
        params.radius,
        highlightFill ? toPrimaryFill(highlightFill, "#e0e0e0") : undefined
      );
    } else if (params.sphereName === "Chokhmah") {
      renderIridescent(push, point, params.radius);
      if (highlightFill) {
        renderSphereTintOverlay(push, point, params.radius, highlightFill, 0.62);
      }
    } else if (params.sphereName === "Daath") {
      renderYinYang(push, point, params.radius, highlightFill);
    } else if (params.sphereName === "Malkuth" && colorData.length >= 4) {
      const slicedColors = resolveMalkuthColors({
        highlightFill,
        paletteFill: sphereFill,
        defaultColors: colorData.slice(0, 4),
      });
      renderSlicedSphere(push, point, params.radius, slicedColors, -135);
    } else {
      push(
        `<circle cx="${point.x}" cy="${point.y}" r="${params.radius}" fill="${escapeAttr(toPrimaryFill(activeFill, params.palette.defaultSphereFill))}"/>`
      );
    }
  } else {
    push(
      `<circle cx="${point.x}" cy="${point.y}" r="${params.radius}" fill="${escapeAttr(toPrimaryFill(activeFill, params.palette.defaultSphereFill))}"/>`
    );
  }

  push(
    `<circle cx="${point.x}" cy="${point.y}" r="${params.radius}" fill="url(#spec-${slug})"/>`
  );
  if (
    !preserveSpecialRenderer ||
    (params.sphereName !== "Kether" && params.sphereName !== "Chokhmah")
  ) {
    push(
      `<circle cx="${point.x}" cy="${point.y}" r="${params.radius}" fill="url(#shad-${slug})"/>`
    );
  }
  push(`</g>`);
  if (params.palette.sphereStrokeColor && params.sphereStrokeWidth) {
    push(
      `<circle cx="${point.x}" cy="${point.y}" r="${params.radius}" fill="none" stroke="${escapeAttr(params.palette.sphereStrokeColor)}" stroke-width="${params.sphereStrokeWidth}"/>`
    );
  } else if (INNER_BORDER_SPHERE_NAMES.has(params.sphereName)) {
    // Inner rim: a darker shade of the sphere's own colour, inset so it sits
    // just inside the edge and separates the sphere from its same-coloured paths.
    const borderWidth = round(params.radius * 0.05);
    const borderColor = interpolateColor(
      toPrimaryFill(activeFill, params.palette.defaultSphereFill),
      "#000000",
      0.2
    );
    push(
      `<circle cx="${point.x}" cy="${point.y}" r="${round(params.radius - borderWidth / 2)}" fill="none" stroke="${escapeAttr(borderColor)}" stroke-width="${borderWidth}"/>`
    );
  }
}

function buildLayoutMap(
  tree: ReturnType<typeof createTree>,
  spherePositions: Record<TreeSphereId, TreeLayoutCoordinate>
): TreeLayoutMap {
  const paths = {} as Record<TreePathId, TreeLayoutPath>;

  for (const currentPathId of TREE_PATH_IDS) {
    const path = tree.getNode(currentPathId);
    const fromId = path?.data?.from as TreeSphereId | undefined;
    const toId = path?.data?.to as TreeSphereId | undefined;

    if (!fromId || !toId) {
      throw new Error(`Tree path ${currentPathId} is missing endpoints.`);
    }

    const from = spherePositions[fromId];
    const to = spherePositions[toId];

    if (!from || !to) {
      throw new Error(
        `Tree path ${currentPathId} references unknown layout spheres: ${fromId}, ${toId}.`
      );
    }

    paths[currentPathId] = {
      fromId,
      toId,
      from: { ...from },
      to: { ...to },
    };
  }

  return {
    spheres: cloneCoordinateMap(spherePositions),
    paths,
  };
}

function cloneCoordinateMap(
  coordinates: Record<TreeSphereId, TreeLayoutCoordinate>
): Record<TreeSphereId, TreeLayoutCoordinate> {
  const clone = {} as Record<TreeSphereId, TreeLayoutCoordinate>;
  for (const currentSphereId of TREE_SPHERE_IDS) {
    const point = coordinates[currentSphereId];
    clone[currentSphereId] = { ...point };
  }
  return clone;
}

function scaleCoordinates(
  coordinates: Record<TreeSphereId, TreeLayoutCoordinate>,
  viewBox: Required<TreeSvgViewBox>
): Record<TreeSphereId, TreeLayoutCoordinate> {
  const scaled = {} as Record<TreeSphereId, TreeLayoutCoordinate>;

  for (const currentSphereId of TREE_SPHERE_IDS) {
    const point = coordinates[currentSphereId];
    scaled[currentSphereId] = {
      x: round(viewBox.minX + (point.x / 100) * viewBox.width),
      y: round(viewBox.minY + (point.y / 100) * viewBox.height),
    };
  }

  return scaled;
}

function normalizeViewBox(
  viewBox: TreeSvgViewBox | undefined
): Required<TreeSvgViewBox> {
  return {
    minX: viewBox?.minX ?? TREE_SVG_DEFAULT_VIEWBOX.minX,
    minY: viewBox?.minY ?? TREE_SVG_DEFAULT_VIEWBOX.minY,
    width: viewBox?.width ?? TREE_SVG_DEFAULT_VIEWBOX.width,
    height: viewBox?.height ?? TREE_SVG_DEFAULT_VIEWBOX.height,
  };
}

function resolveActivationMap(
  activations: readonly TreeTargetActivationInput[] | undefined
) {
  const map = new Map<TreeSphereId | TreePathId, TreeTargetActivationInput>();

  for (const activation of activations ?? []) {
    map.set(activation.targetId, activation);
  }

  return map;
}

function resolveTargetActivation(params: {
  activation: TreeTargetActivationInput | undefined;
  canonicalColor: string;
}): TreeRenderActivationState | null {
  if (!params.activation) {
    return null;
  }

  const state = params.activation.state ?? (params.activation.count > 0 ? "active" : "inactive");
  const strength = clamp01(
    params.activation.strength ?? (params.activation.total > 0 ? params.activation.count / params.activation.total : 0)
  );
  const displayColor =
    state === "inactive"
      ? params.activation.color ?? MUTED_TARGET_COLOR
      : params.activation.color ?? params.canonicalColor;

  return {
    state,
    count: params.activation.count,
    total: params.activation.total,
    strength,
    canonicalColor: params.canonicalColor,
    displayColor,
    colorOverride: params.activation.color,
    mutedColor: MUTED_TARGET_COLOR,
    visible: state !== "inactive",
    emphasis: state === "selected"
      ? clamp01(Math.max(strength, 0.9))
      : state === "hovered"
        ? clamp01(Math.max(strength, 0.72))
        : state === "active"
          ? clamp01(Math.max(strength, 0.56))
          : 0,
  };
}

function resolveSplitEndpointColor(params: {
  palette: ResolvedPalette;
  sphereId: TreeSphereId;
  tree: ReturnType<typeof createTree>;
}) {
  const name = parseId(params.sphereId) as TreeSphereName;
  return (
    SPECIAL_SPHERE_PATH_COLORS[name] ??
    resolveSphereCanonicalColor(params)
  );
}

function buildSplitGradientStops(params: {
  fromName: TreeSphereName;
  toName: TreeSphereName;
  fromColor: string;
  toColor: string;
  blendStart: number;
  blendEnd: number;
  contactT: number | null;
}): string {
  const { fromName, toName, fromColor, toColor, blendStart, blendEnd, contactT } =
    params;
  const stop = (offset: number, color: string) =>
    `  <stop offset="${round(offset)}%" stop-color="${escapeAttr(color)}"/>`;
  // Iridescent sweep emitted across [start, end] in increasing offset order.
  // `t0` is the wheel position where the ribbon meets the disc; `along` is the
  // distance from that contact end, so the sweep walks the wheel outward.
  const sweep = (start: number, end: number, t0: number, sphereAtEnd: boolean) =>
    Array.from({ length: CHOKHMAH_SWEEP_SAMPLES }, (_, index) => {
      const f = index / (CHOKHMAH_SWEEP_SAMPLES - 1);
      const offset = start + f * (end - start);
      const along = sphereAtEnd ? 1 - f : f;
      return stop(offset, iridescentColorAt(t0 + along * CHOKHMAH_SWEEP_SPAN));
    });

  // Chokhmah at the `to` end (offset 100): solid fromColor, blend into the
  // iridescent sweep that meets the disc at its contact colour.
  if (toName === "Chokhmah" && contactT !== null) {
    return [
      stop(0, fromColor),
      stop(blendStart, fromColor),
      ...sweep(blendEnd, 100, contactT, true),
    ].join("\n");
  }

  // Chokhmah at the `from` end (offset 0): iridescent sweep, blend into toColor.
  if (fromName === "Chokhmah" && contactT !== null) {
    return [
      ...sweep(0, blendStart, contactT, false),
      stop(blendEnd, toColor),
      stop(100, toColor),
    ].join("\n");
  }

  // Standard two-colour split with a soft midpoint blend.
  return [
    stop(0, fromColor),
    stop(blendStart, fromColor),
    stop(blendEnd, toColor),
    stop(100, toColor),
  ].join("\n");
}

function resolveSphereCanonicalColor(params: {
  palette: ResolvedPalette;
  sphereId: TreeSphereId;
  tree: ReturnType<typeof createTree>;
}) {
  const override = params.palette.sphereFills[params.sphereId];
  if (override) {
    return toPrimaryFill(override, params.palette.defaultSphereFill);
  }

  if (params.palette.mode === "monochrome" || params.palette.mode === "custom") {
    return params.palette.defaultSphereFill;
  }

  const treeColor =
    params.tree.relatedFirst(params.sphereId, MiscTypes.COLOR)?.data?.colorHexCodes?.[0];

  return treeColor ?? params.palette.defaultSphereFill;
}

function resolvePathCanonicalColor(params: {
  palette: ResolvedPalette;
  tree: ReturnType<typeof createTree>;
  pathId: TreePathId;
}) {
  const override = params.palette.pathColors[params.pathId];
  if (override) {
    return override;
  }

  if (params.palette.mode === "monochrome" || params.palette.mode === "custom") {
    return params.palette.defaultPathColor;
  }

  const treeColor =
    params.tree.relatedFirst(params.pathId, MiscTypes.COLOR)?.data?.colorHexCodes?.[0];

  return treeColor ?? params.palette.defaultPathColor;
}

function resolvePathBaseColor(params: {
  canonicalColor: string;
  highlights: ResolvedHighlights;
  pathId: TreePathId;
}) {
  const highlightOverride = params.highlights.pathColors[params.pathId];
  if (highlightOverride) {
    return highlightOverride;
  }

  return params.canonicalColor;
}

function resolveSphereDisplayFill(params: {
  palette: ResolvedPalette;
  highlights: ResolvedHighlights;
  sphereId: TreeSphereId;
  canonicalColor: string | string[];
  activation: TreeRenderActivationState | null;
}) {
  const highlightOverride = params.highlights.sphereFills[params.sphereId];
  const fallbackFill = Array.isArray(params.canonicalColor)
    ? params.canonicalColor[0] ?? params.palette.defaultSphereFill
    : params.canonicalColor;

  if (params.activation) {
    if (params.activation.state !== "inactive" && !params.activation.colorOverride) {
      return params.canonicalColor ?? fallbackFill;
    }

    return params.activation.displayColor;
  }

  if (highlightOverride) {
    return highlightOverride;
  }

  return params.canonicalColor ?? fallbackFill;
}

function resolvePathDisplayColor(params: {
  canonicalColor: string;
  activation: TreeRenderActivationState | null;
}) {
  if (!params.activation) {
    return params.canonicalColor;
  }

  return params.activation.displayColor;
}

function getPercentageAnchor(point: TreeLayoutCoordinate): TreeRenderAnchor {
  return {
    x: point.x,
    y: point.y,
    vertical: point.y < 18 ? "below" : "above",
  };
}

function getViewBoxAnchor(
  point: TreeLayoutCoordinate,
  viewBox: Required<TreeSvgViewBox>
): TreeRenderAnchor {
  return {
    x: point.x,
    y: point.y,
    vertical: point.y - viewBox.minY < viewBox.height * 0.18 ? "below" : "above",
  };
}

function getPercentagePathAnchor(path: TreeLayoutPath): TreeRenderAnchor {
  const y = round((path.from.y + path.to.y) / 2);
  return {
    x: round((path.from.x + path.to.x) / 2),
    y,
    vertical: y < 18 ? "below" : "above",
  };
}

function getViewBoxPathAnchor(
  path: TreeLayoutPath,
  viewBox: Required<TreeSvgViewBox>
): TreeRenderAnchor {
  const y = round((path.from.y + path.to.y) / 2);
  return {
    x: round((path.from.x + path.to.x) / 2),
    y,
    vertical: y - viewBox.minY < viewBox.height * 0.18 ? "below" : "above",
  };
}

function shouldPreserveSpecialRenderer(params: {
  palette: ResolvedPalette;
  highlights: ResolvedHighlights;
  hasPaintOverride: boolean;
  activation: TreeRenderActivationState | null;
}) {
  return (
    params.palette.specialSphereMode === "preserve"
    && (
      params.activation !== null
      || !params.hasPaintOverride
      || params.highlights.specialSphereMode === "preserve"
    )
  );
}

function getSphereMaterial(params: {
  sphereName: TreeSphereName;
  preserveSpecialMaterial: boolean;
}) {
  if (!params.preserveSpecialMaterial) {
    return {
      kind: "standard" as const,
      preserveOnActivation: false,
    };
  }

  if (params.sphereName === "Kether") {
    return {
      kind: "special" as const,
      specialSphereName: "Kether" as const,
      preserveOnActivation: true,
    };
  }

  if (params.sphereName === "Chokhmah") {
    return {
      kind: "special" as const,
      specialSphereName: "Chokhmah" as const,
      preserveOnActivation: true,
    };
  }

  if (params.sphereName === "Daath") {
    return {
      kind: "special" as const,
      specialSphereName: "Daath" as const,
      preserveOnActivation: true,
    };
  }

  if (params.sphereName === "Malkuth") {
    return {
      kind: "special" as const,
      specialSphereName: "Malkuth" as const,
      preserveOnActivation: true,
    };
  }

  return {
    kind: "standard" as const,
    preserveOnActivation: false,
  };
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function resolvePalette(palette: TreeSvgPalette | undefined): ResolvedPalette {
  if (palette === undefined || palette === "color") {
    return {
      mode: "color",
      defaultSphereFill: "#888888",
      defaultPathColor: "#888888",
      sphereFills: {},
      pathColors: {},
      pathEdgeColor: "#888888",
      pathEdgeUseFilter: true,
      pathHighlightColor: "white",
      pathHighlightOpacity: 0.25,
      specialSphereMode: "preserve",
    };
  }

  if (palette === "monochrome") {
    return {
      mode: "monochrome",
      defaultSphereFill: "#e6ddd0",
      defaultPathColor: "#e0d7ca",
      sphereFills: {},
      pathColors: {},
      pathEdgeColor: "#2f271e",
      pathEdgeUseFilter: false,
      sphereStrokeColor: "#2f271e",
      sphereStrokeWidth: 2.4,
      pathHighlightColor: "white",
      pathHighlightOpacity: 0.2,
      specialSphereMode: "plain",
    };
  }

  return {
    mode: "custom",
    defaultSphereFill: palette.defaultSphereFill ?? "#111111",
    defaultPathColor: palette.defaultPathColor ?? "#111111",
    sphereFills: palette.sphereFills ?? {},
    pathColors: palette.pathColors ?? {},
    pathEdgeColor: palette.pathEdgeColor ?? (palette.defaultPathColor ?? "#111111"),
    pathEdgeUseFilter: false,
    sphereStrokeColor: palette.sphereStrokeColor,
    sphereStrokeWidth: palette.sphereStrokeWidth,
    pathHighlightColor: palette.pathHighlightColor ?? "white",
    pathHighlightOpacity: palette.pathHighlightOpacity ?? 0.18,
    specialSphereMode: palette.specialSphereMode ?? "plain",
  };
}

function resolveHighlights(
  highlights: TreeSvgHighlights | undefined
): ResolvedHighlights {
  return {
    pathColors: highlights?.paths ?? {},
    sphereFills: highlights?.spheres ?? {},
    specialSphereMode: highlights?.specialSphereMode ?? "preserve",
  };
}

function resolvePathColor(params: {
  highlights: ResolvedHighlights;
  palette: ResolvedPalette;
  tree: ReturnType<typeof createTree>;
  pathId: TreePathId;
}) {
  const highlightOverride = params.highlights.pathColors[params.pathId];
  if (highlightOverride) {
    return highlightOverride;
  }

  const override = params.palette.pathColors[params.pathId];
  if (override) {
    return override;
  }

  if (params.palette.mode === "monochrome" || params.palette.mode === "custom") {
    return params.palette.defaultPathColor;
  }

  const treeColor =
    params.tree.relatedFirst(params.pathId, MiscTypes.COLOR)?.data?.colorHexCodes?.[0];

  return treeColor ?? params.palette.defaultPathColor;
}

function resolvePathEdgeColor(params: {
  palette: ResolvedPalette;
  pathColor: string;
}) {
  if (params.palette.mode === "color") {
    return params.pathColor;
  }

  return params.palette.pathEdgeColor;
}

function resolveSphereFill(params: {
  palette: ResolvedPalette;
  sphereId: TreeSphereId;
  defaultColors: string[];
}) {
  const override = params.palette.sphereFills[params.sphereId];
  if (override) {
    return override;
  }

  if (params.palette.mode === "monochrome" || params.palette.mode === "custom") {
    return params.palette.defaultSphereFill;
  }

  if (params.defaultColors.length > 0) {
    return params.defaultColors;
  }

  return params.palette.defaultSphereFill;
}

function toPrimaryFill(fill: string | string[], fallback: string) {
  if (Array.isArray(fill)) {
    return fill[0] ?? fallback;
  }

  return fill;
}

function resolveMalkuthColors(params: {
  highlightFill?: string | string[];
  paletteFill: string | string[];
  defaultColors: string[];
}) {
  if (params.highlightFill) {
    return expandColors(
      params.highlightFill,
      params.defaultColors.length,
      params.defaultColors
    );
  }

  if (Array.isArray(params.paletteFill)) {
    return expandColors(
      params.paletteFill,
      params.defaultColors.length,
      params.defaultColors
    );
  }

  return params.defaultColors;
}

function expandColors(
  fill: string | string[],
  count: number,
  fallbackColors: string[]
) {
  if (Array.isArray(fill)) {
    if (fill.length === 0) {
      return fallbackColors.slice(0, count);
    }

    return Array.from({ length: count }, (_, index) => {
      return fill[index] ?? fill[fill.length - 1];
    });
  }

  return Array.from({ length: count }, () => fill);
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  degrees: number
) {
  const radians = (Math.PI / 180) * degrees;
  return {
    x: round(cx + radius * Math.cos(radians)),
    y: round(cy + radius * Math.sin(radians)),
  };
}

function arcPath(
  cx: number,
  cy: number,
  radius: number,
  startDegrees: number,
  endDegrees: number
) {
  const start = polarToCartesian(cx, cy, radius, startDegrees);
  const end = polarToCartesian(cx, cy, radius, endDegrees);
  const largeArc = endDegrees - startDegrees <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

function renderKether(
  push: (line: string) => void,
  point: TreeLayoutCoordinate,
  radius: number,
  baseFill = NAZAR_NACRE
) {
  const { x, y } = point;
  // Mother-of-pearl (madrepérola) nazar: nacreous disc, light-blue iris, black pupil.
  renderIridescent(push, point, radius, NACRE_STOPS);
  if (baseFill !== NAZAR_NACRE) {
    // Activation / highlight recolour tints the pearly disc.
    renderSphereTintOverlay(push, point, radius, baseFill, 0.5);
  }
  push(
    `<circle cx="${x}" cy="${y}" r="${round(radius * 0.42)}" fill="${escapeAttr(NAZAR_IRIS)}"/>`
  );
  push(
    `<circle cx="${x}" cy="${y}" r="${round(radius * 0.2)}" fill="${escapeAttr(NAZAR_PUPIL)}"/>`
  );
}

function renderSlicedSphere(
  push: (line: string) => void,
  point: TreeLayoutCoordinate,
  radius: number,
  colors: string[],
  startAngle: number
) {
  const segmentCount = colors.length;
  const step = 360 / segmentCount;
  let currentAngle = startAngle;

  for (let index = 0; index < segmentCount; index++) {
    const path = arcPath(point.x, point.y, radius * 0.96, currentAngle, currentAngle + step);
    push(`<path d="${path}" fill="${escapeAttr(colors[index])}" stroke="none"/>`);
    currentAngle += step;
  }
}

const IRIDESCENT_STOPS: [number, string][] = [
  [0.0, "#F0E8EE"],
  [0.1, "#ffa3e6"],
  [0.22, "#a7e0ff"],
  [0.34, "#baff9a"],
  [0.46, "#ffe28a"],
  [0.58, "#c6a4ff"],
  [0.7, "#9ad6ff"],
  [0.82, "#ffa3e6"],
  [1.0, "#F0E8EE"],
];

// Soft blue/white/lilac/mint sheen for the mother-of-pearl (madrepérola) look.
const NACRE_STOPS: [number, string][] = [
  [0.0, "#eaf6f6"],
  [0.12, "#a8d6ec"],
  [0.25, "#c3b6ec"],
  [0.4, "#a6ecec"],
  [0.55, "#dfe6fb"],
  [0.7, "#a6cdf0"],
  [0.82, "#cbb4ec"],
  [1.0, "#eaf6f6"],
];

function renderIridescent(
  push: (line: string) => void,
  point: TreeLayoutCoordinate,
  radius: number,
  stops: [number, string][] = IRIDESCENT_STOPS
) {
  const slices = 72;
  const sphereRadius = round(radius * 0.96);

  for (let index = 0; index < slices; index++) {
    const t = index / slices;
    const color = interpolateColorStops(stops, t);
    const startDegrees = t * 360 - 90;
    const endDegrees = startDegrees + 360 / slices + 0.5;
    const path = arcPath(point.x, point.y, sphereRadius, startDegrees, endDegrees);
    push(`<path d="${path}" fill="${color}" stroke="none"/>`);
  }
}

function interpolateColorStops(stops: [number, string][], t: number): string {
  let lower = stops[0];
  let upper = stops[stops.length - 1];

  for (let index = 0; index < stops.length - 1; index++) {
    if (t >= stops[index][0] && t <= stops[index + 1][0]) {
      lower = stops[index];
      upper = stops[index + 1];
      break;
    }
  }

  const range = upper[0] - lower[0] || 1;
  return interpolateColor(lower[1], upper[1], (t - lower[0]) / range);
}

function interpolateColor(start: string, end: string, factor: number) {
  const parse = (hex: string) => {
    const match = hex.match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    return match
      ? [
          Number.parseInt(match[1], 16),
          Number.parseInt(match[2], 16),
          Number.parseInt(match[3], 16),
        ]
      : [0, 0, 0];
  };

  const [r1, g1, b1] = parse(start);
  const [r2, g2, b2] = parse(end);
  const mix = (left: number, right: number) =>
    Math.round(left + (right - left) * factor);

  return `#${mix(r1, r2).toString(16).padStart(2, "0")}${mix(g1, g2)
    .toString(16)
    .padStart(2, "0")}${mix(b1, b2).toString(16).padStart(2, "0")}`;
}

function renderYinYang(
  push: (line: string) => void,
  point: TreeLayoutCoordinate,
  radius: number,
  fill?: string | string[]
) {
  const scale = radius / 50;
  const circleRadius = round(48 * scale);
  const halfRadius = round(24 * scale);
  const dotRadius = round(6 * scale);
  const [lightFill, darkFill] = resolveDualToneFill(fill);

  push(`<g transform="rotate(180 ${point.x} ${point.y})">`);
  push(
    `<circle cx="${point.x}" cy="${point.y}" r="${circleRadius}" fill="${escapeAttr(lightFill)}"/>`
  );
  push(
    `<path d="M${point.x},${round(point.y - circleRadius)} A${circleRadius},${circleRadius} 0 1,1 ${point.x},${round(point.y + circleRadius)} A${halfRadius},${halfRadius} 0 1,0 ${point.x},${point.y} A${halfRadius},${halfRadius} 0 1,1 ${point.x},${round(point.y - circleRadius)}" fill="${escapeAttr(darkFill)}"/>`
  );
  push(
    `<circle cx="${point.x}" cy="${round(point.y - halfRadius)}" r="${dotRadius}" fill="${escapeAttr(lightFill)}"/>`
  );
  push(
    `<circle cx="${point.x}" cy="${round(point.y + halfRadius)}" r="${dotRadius}" fill="${escapeAttr(darkFill)}"/>`
  );
  push(`</g>`);
}

function renderSphereTintOverlay(
  push: (line: string) => void,
  point: TreeLayoutCoordinate,
  radius: number,
  fill: string | string[],
  opacity: number
) {
  push(
    `<circle cx="${point.x}" cy="${point.y}" r="${radius}" fill="${escapeAttr(toPrimaryFill(fill, "#ffffff"))}" fill-opacity="${opacity}"/>`
  );
}

function resolveDualToneFill(fill: string | string[] | undefined) {
  if (Array.isArray(fill)) {
    return [fill[0] ?? "white", fill[1] ?? "black"] as const;
  }

  if (fill) {
    return [fill, "black"] as const;
  }

  return ["white", "black"] as const;
}

function escapeAttr(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
