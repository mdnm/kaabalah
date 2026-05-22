import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import {
  getCanonicalTree,
  getTreeTopology,
  type CorrespondenceEdge,
  type CorrespondenceMatch,
  type CorrespondenceSource,
  type Node,
  type NodeId,
  type NodeType,
  type TreeTopologyPath,
  type TreeTopologyRoute,
  type TreeTopologyRouteKey,
  type TreeTopologyRouteSegment,
  type TreeTopologySphere,
} from "../../core";
import { SYSTEM as KAABALAH_SYSTEM } from "../../core/systems/kaabalah";
import { SYSTEMS, type SystemKey } from "../../core/systems/registry";
import {
  generateTreeSvg,
  getTreeLayout,
  getTreeRenderModel,
  TREE_PATH_IDS,
  TREE_SPHERE_IDS,
  type TreePathId,
  type TreeLayout,
  type TreeRenderModel,
  type TreeSphereId,
  type TreeTargetActivationInput,
  type TreeSvgOptions,
} from "../../visual";
import {
  getFlagBool,
  getFlagNumber,
  getFlagString,
  isJsonMode
} from "../runtime/args";
import { exitWithError } from "../runtime/errors";
import { outputJson } from "../runtime/output";
import type { Flags } from "../runtime/types";

function getTree() {
  return getCanonicalTree({
    system: KAABALAH_SYSTEM,
    parts: ["westernAstrology", "tarot"],
  });
}

function serializeNode(node: {
  id: string;
  type: string;
  data?: unknown;
  name?: string;
}) {
  const result: Record<string, unknown> = { id: node.id, type: node.type };

  if (
    node.data &&
    typeof node.data === "object" &&
    Object.keys(node.data as object).length > 0
  ) {
    result.data = node.data;
  }

  if (node.name) {
    result.name = node.name;
  }

  return result;
}

function serializeSource(source: CorrespondenceSource) {
  return source.kind === "bridge"
    ? { ...source, parts: [...source.parts] }
    : { ...source };
}

function serializeEdge(edge: CorrespondenceEdge) {
  const serialized: Record<string, unknown> = {
    id: edge.id,
    from: edge.left,
    to: edge.right,
  };

  if (edge.metadata) {
    serialized.metadata = edge.metadata;
  }

  if (edge.sources.length > 0) {
    serialized.sources = edge.sources.map(serializeSource);
  }

  return serialized;
}

function serializeMatch(match: CorrespondenceMatch<NodeType>) {
  return {
    node: serializeNode(match.node),
    distance: match.distance,
    path: match.path.map((step) => ({
      from: step.from,
      to: step.to,
      edge: serializeEdge(step.edge),
    })),
  };
}

function getRelatedTypes(
  tree: ReturnType<typeof getTree>,
  nodeId: NodeId<NodeType>
) {
  return [...new Set(
    tree
      .getEdges(nodeId)
      .map((edge) => {
        const relatedNodeId = edge.left === nodeId ? edge.right : edge.left;
        return tree.getNode(relatedNodeId)?.type;
      })
      .filter((type): type is NodeType => Boolean(type))
  )].sort((left, right) => left.localeCompare(right));
}

function groupSerializedMatches(matches: CorrespondenceMatch<NodeType>[]) {
  const grouped: Record<string, ReturnType<typeof serializeMatch>[]> = {};

  for (const match of matches) {
    const bucket = grouped[match.node.type] ?? [];
    bucket.push(serializeMatch(match));
    grouped[match.node.type] = bucket;
  }

  return grouped;
}

function humanLabel(node: Node<NodeType>) {
  const data = node.data as Record<string, unknown> | undefined;

  return (data?.name ??
    data?.character ??
    data?.englishName ??
    data?.meaning ??
    node.name ??
    "") as string;
}

function describeSources(edge: CorrespondenceEdge) {
  const parts = new Set<string>();

  for (const source of edge.sources) {
    if (source.kind === "system") {
      parts.add(`system:${source.system}`);
      continue;
    }

    if (source.kind === "part") {
      parts.add(`part:${source.part}`);
      continue;
    }

    if (source.kind === "bridge") {
      parts.add(`bridge:${source.bridgeId}`);
      continue;
    }

    if (source.kind === "overlay") {
      parts.add(`overlay:${source.overlayId}`);
      continue;
    }

    parts.add(source.kind);
  }

  return [...parts].join(", ");
}

function resolveSystem(flags: Flags): SystemKey {
  const value = getFlagString(flags, "system");
  if (!value) {
    return KAABALAH_SYSTEM;
  }

  if (
    SYSTEMS.some((candidate) => candidate.SYSTEM === value)
  ) {
    return value as SystemKey;
  }

  exitWithError(
    "INVALID_ARGUMENT",
    `Unknown tree system "${value}". Expected one of: ${SYSTEMS.map((candidate) => candidate.SYSTEM).join(", ")}.`,
    flags
  );
}

function resolveLayoutUnits(
  flags: Flags
): "percentages" | "viewBoxUnits" | "both" {
  const units = getFlagString(flags, "units");
  if (!units || units === "both") {
    return "both";
  }

  if (units === "percentages" || units === "viewBoxUnits") {
    return units;
  }

  exitWithError(
    "INVALID_ARGUMENT",
    `Unknown layout units "${units}". Expected one of: percentages, viewBoxUnits, both.`,
    flags
  );
}

function serializeLayout(
  layout: TreeLayout,
  units: "percentages" | "viewBoxUnits" | "both"
) {
  const base: Record<string, unknown> = {
    system: layout.system,
    viewBox: layout.viewBox,
    sphereOrder: layout.sphereOrder,
    pathOrder: layout.pathOrder,
  };

  if (units === "both" || units === "percentages") {
    base.percentages = layout.percentages;
  }

  if (units === "both" || units === "viewBoxUnits") {
    base.viewBoxUnits = layout.viewBoxUnits;
  }

  return base;
}

function serializeRenderModel(model: TreeRenderModel) {
  return {
    system: model.system,
    viewBox: model.viewBox,
    scale: model.scale,
    layerOrder: model.layerOrder,
    layers: model.layers,
    layout: model.layout,
    spheres: model.spheres,
    paths: model.paths,
    sphereById: model.sphereById,
    pathById: model.pathById,
  };
}

function serializeTopologySphere(sphere: TreeTopologySphere) {
  const result: Record<string, unknown> = {
    id: sphere.id,
    name: sphere.name,
    number: sphere.number,
    role: sphere.role,
  };

  if (sphere.data && Object.keys(sphere.data).length > 0) {
    result.data = sphere.data;
  }

  return result;
}

function serializeTopologyPath(path: TreeTopologyPath) {
  const result: Record<string, unknown> = {
    id: path.id,
    number: path.number,
    fromId: path.from.id,
    fromName: path.from.name,
    toId: path.to.id,
    toName: path.to.name,
  };

  if (path.data && Object.keys(path.data).length > 0) {
    result.data = path.data;
  }

  return result;
}

function serializeTopologySegment(segment: TreeTopologyRouteSegment) {
  return {
    index: segment.index,
    fromId: segment.from.id,
    fromName: segment.from.name,
    toId: segment.to.id,
    toName: segment.to.name,
    isConnected: segment.isConnected,
    ...(segment.path
      ? {
          pathId: segment.path.id,
          pathNumber: segment.path.number,
        }
      : {}),
  };
}

function serializeTopologyRoute(route: TreeTopologyRoute) {
  return {
    key: route.key,
    name: route.name,
    direction: route.direction,
    isFullyConnected: route.isFullyConnected,
    sphereOrder: route.spheres.map((sphere) => sphere.id),
    sphereNames: route.spheres.map((sphere) => sphere.name),
    segments: route.segments.map(serializeTopologySegment),
    missingSegments: route.missingSegments.map(serializeTopologySegment),
    targets: route.targets,
    targetIds: route.targetIds,
  };
}

function resolveTopologyRouteKey(flags: Flags): TreeTopologyRouteKey | undefined {
  const route = getFlagString(flags, "route");

  if (!route || route === "all") {
    return undefined;
  }

  if (route === "lightning" || route === "serpent") {
    return route;
  }

  exitWithError(
    "INVALID_ARGUMENT",
    `Unknown topology route "${route}". Expected one of: lightning, serpent, all.`,
    flags
  );
}

function buildViewBox(flags: Flags) {
  const width = getFlagNumber(flags, "viewbox-width");
  const height = getFlagNumber(flags, "viewbox-height");
  const minX = getFlagNumber(flags, "viewbox-min-x");
  const minY = getFlagNumber(flags, "viewbox-min-y");

  if (width == null && height == null && minX == null && minY == null) {
    return undefined;
  }

  if (width == null || height == null) {
    exitWithError(
      "INVALID_ARGUMENT",
      'Both "--viewbox-width" and "--viewbox-height" are required when overriding the SVG viewBox.',
      flags
    );
  }

  return {
    minX: minX ?? 0,
    minY: minY ?? 0,
    width,
    height,
  };
}

const TREE_SPHERE_ID_SET = new Set<string>(TREE_SPHERE_IDS);
const TREE_PATH_ID_SET = new Set<string>(TREE_PATH_IDS);
const TREE_TARGET_STATES = new Set(["active", "hovered", "selected", "inactive"]);

function readJsonFile(pathFlag: string, flags: Flags) {
  const filePath = resolve(pathFlag);

  let raw: string;
  try {
    raw = readFileSync(filePath, "utf8");
  } catch (err) {
    exitWithError(
      "INVALID_ARGUMENT",
      `Could not read activations file "${filePath}": ${err instanceof Error ? err.message : String(err)}.`,
      flags
    );
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    exitWithError(
      "INVALID_JSON",
      `Invalid JSON in activations file "${filePath}".`,
      flags
    );
  }
}

function validateActivationEntry(
  entry: unknown,
  index: number,
  flags: Flags
): TreeTargetActivationInput {
  const label = `activations[${index}]`;
  if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
    exitWithError("INVALID_JSON", `${label} must be a JSON object.`, flags);
  }

  const raw = entry as Record<string, unknown>;
  const targetId = raw.targetId;
  const targetType = raw.targetType;
  const count = raw.count;
  const total = raw.total;
  const strength = raw.strength;
  const state = raw.state;
  const color = raw.color;

  if (typeof targetId !== "string" || !targetId) {
    exitWithError("INVALID_JSON", `${label}.targetId must be a non-empty string.`, flags);
  }

  if (targetType !== "sphere" && targetType !== "path") {
    exitWithError("INVALID_JSON", `${label}.targetType must be "sphere" or "path".`, flags);
  }

  if (targetType === "sphere" && !TREE_SPHERE_ID_SET.has(targetId)) {
    exitWithError("INVALID_ARGUMENT", `${label}.targetId "${targetId}" is not a known sphere target.`, flags);
  }

  if (targetType === "path" && !TREE_PATH_ID_SET.has(targetId)) {
    exitWithError("INVALID_ARGUMENT", `${label}.targetId "${targetId}" is not a known path target.`, flags);
  }

  if (!Number.isFinite(count) || typeof count !== "number" || count < 0) {
    exitWithError("INVALID_JSON", `${label}.count must be a non-negative number.`, flags);
  }

  if (!Number.isFinite(total) || typeof total !== "number" || total < 0) {
    exitWithError("INVALID_JSON", `${label}.total must be a non-negative number.`, flags);
  }

  if (
    strength !== undefined
    && (
      typeof strength !== "number"
      || !Number.isFinite(strength)
      || strength < 0
      || strength > 1
    )
  ) {
    exitWithError("INVALID_JSON", `${label}.strength must be a number between 0 and 1.`, flags);
  }

  if (state !== undefined && (typeof state !== "string" || !TREE_TARGET_STATES.has(state))) {
    exitWithError("INVALID_JSON", `${label}.state must be active, hovered, selected, or inactive.`, flags);
  }

  if (color !== undefined && typeof color !== "string") {
    exitWithError("INVALID_JSON", `${label}.color must be a string when provided.`, flags);
  }

  return {
    targetId: targetId as TreeSphereId | TreePathId,
    targetType,
    count,
    total,
    ...(strength !== undefined ? { strength } : {}),
    ...(state !== undefined ? { state: state as TreeTargetActivationInput["state"] } : {}),
    ...(color !== undefined ? { color } : {}),
  };
}

function readActivations(flags: Flags): TreeTargetActivationInput[] | undefined {
  const activationsPath = getFlagString(flags, "activations");
  if (!activationsPath) {
    return undefined;
  }

  const parsed = readJsonFile(activationsPath, flags);
  const payload =
    Array.isArray(parsed)
      ? parsed
      : typeof parsed === "object" && parsed !== null && Array.isArray((parsed as Record<string, unknown>).activations)
        ? (parsed as { activations: unknown[] }).activations
        : null;

  if (!payload) {
    exitWithError(
      "INVALID_JSON",
      'Activations file must be a JSON array or an object with an "activations" array.',
      flags
    );
  }

  return payload.map((entry, index) => validateActivationEntry(entry, index, flags));
}

function buildSvgOptions(flags: Flags): TreeSvgOptions {
  const palette = getFlagString(flags, "palette");
  if (palette && palette !== "color" && palette !== "monochrome") {
    exitWithError(
      "INVALID_ARGUMENT",
      `Unknown SVG palette "${palette}". Expected "color" or "monochrome".`,
      flags
    );
  }

  const daathLayer = getFlagString(flags, "daath-layer");
  if (daathLayer && daathLayer !== "front" && daathLayer !== "back") {
    exitWithError(
      "INVALID_ARGUMENT",
      `Unknown Daath layer "${daathLayer}". Expected "front" or "back".`,
      flags
    );
  }

  return {
    system: resolveSystem(flags),
    width: getFlagString(flags, "width"),
    height: getFlagString(flags, "height"),
    background: getFlagString(flags, "background") ?? undefined,
    palette: (palette as "color" | "monochrome" | undefined) ?? undefined,
    viewBox: buildViewBox(flags),
    daathLayer: (daathLayer as "front" | "back" | undefined) ?? undefined,
    activations: readActivations(flags),
  };
}

function buildRenderModelOptions(flags: Flags): TreeSvgOptions {
  const palette = getFlagString(flags, "palette");
  if (palette && palette !== "color" && palette !== "monochrome") {
    exitWithError(
      "INVALID_ARGUMENT",
      `Unknown SVG palette "${palette}". Expected "color" or "monochrome".`,
      flags
    );
  }

  const daathLayer = getFlagString(flags, "daath-layer");
  if (daathLayer && daathLayer !== "front" && daathLayer !== "back") {
    exitWithError(
      "INVALID_ARGUMENT",
      `Unknown Daath layer "${daathLayer}". Expected "front" or "back".`,
      flags
    );
  }

  return {
    system: resolveSystem(flags),
    palette: (palette as "color" | "monochrome" | undefined) ?? undefined,
    viewBox: buildViewBox(flags),
    daathLayer: (daathLayer as "front" | "back" | undefined) ?? undefined,
    activations: readActivations(flags),
  };
}

function renderAsciiTree(layout: TreeLayout, columns: number, rows: number): string[] {
  const grid = Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => " ")
  );
  const points = layout.percentages.spheres;

  const toGridX = (percentage: number) =>
    Math.max(0, Math.min(columns - 1, Math.round((percentage / 100) * (columns - 1))));
  const toGridY = (percentage: number) =>
    Math.max(0, Math.min(rows - 1, Math.round((percentage / 100) * (rows - 1))));

  const plot = (x: number, y: number, char: string) => {
    if (x < 0 || x >= columns || y < 0 || y >= rows) {
      return;
    }

    if (char === "O") {
      grid[y][x] = char;
      return;
    }

    const current = grid[y][x];
    if (current === " " || current === char) {
      grid[y][x] = char;
      return;
    }

    if (current === "O") {
      return;
    }

    grid[y][x] = "+";
  };

  const drawLine = (x0: number, y0: number, x1: number, y1: number) => {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const lineChar =
      dx === 0 ? "|" : dy === 0 ? "-" : Math.sign(dx) === Math.sign(dy) ? "\\" : "/";

    let currentX = x0;
    let currentY = y0;
    const stepX = Math.sign(dx);
    const stepY = Math.sign(dy);
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx > absDy) {
      let error = absDx / 2;
      while (currentX !== x1) {
        plot(currentX, currentY, lineChar);
        error -= absDy;
        if (error < 0) {
          currentY += stepY;
          error += absDx;
        }
        currentX += stepX;
      }
    } else {
      let error = absDy / 2;
      while (currentY !== y1) {
        plot(currentX, currentY, lineChar);
        error -= absDx;
        if (error < 0) {
          currentX += stepX;
          error += absDy;
        }
        currentY += stepY;
      }
    }

    plot(x1, y1, lineChar);
  };

  for (const pathId of layout.pathOrder) {
    const path = layout.percentages.paths[pathId];
    drawLine(
      toGridX(path.from.x),
      toGridY(path.from.y),
      toGridX(path.to.x),
      toGridY(path.to.y)
    );
  }

  for (const sphereId of layout.sphereOrder) {
    const point = points[sphereId];
    plot(toGridX(point.x), toGridY(point.y), "O");
  }

  return grid.map((row) => row.join("").replace(/\s+$/, ""));
}

export function cmdTree(flags: Flags): void {
  const tree = getTree();
  const allNodes = tree.getNodes();

  if (isJsonMode(flags)) {
    const nodes = allNodes.map((node) => {
      const serialized = serializeNode(node);
      const relatedTypes = getRelatedTypes(tree, node.id as NodeId<NodeType>);

      if (relatedTypes.length > 0) {
        serialized.relatedTypes = relatedTypes;
      }

      return serialized;
    });
    const edges = tree.getEdges().map(serializeEdge);

    outputJson(
      {
        descriptor: tree.descriptor,
        system: KAABALAH_SYSTEM,
        totalNodes: allNodes.length,
        totalEdges: edges.length,
        nodes,
        edges,
      },
      flags
    );
    return;
  }

  console.log(`\nTree of Life (${KAABALAH_SYSTEM})\n`);
  console.log(`  Total nodes: ${allNodes.length}`);
  console.log(`  Total correspondences: ${tree.getEdges().length}`);

  const byType = new Map<string, typeof allNodes>();
  for (const node of allNodes) {
    if (!byType.has(node.type)) {
      byType.set(node.type, []);
    }
    byType.get(node.type)!.push(node);
  }

  for (const [type, nodes] of byType) {
    console.log(`\n  ${type} (${nodes.length}):`);
    for (const node of nodes.slice(0, 15)) {
      const label = humanLabel(node);
      console.log(`    ${node.id}${label ? ` — ${label}` : ""}`);
    }
    if (nodes.length > 15) {
      console.log(`    ... and ${nodes.length - 15} more`);
    }
  }
  console.log();
}

export function cmdTreeNode(idStr: string, flags: Flags): void {
  const tree = getTree();
  const node = tree.getNode(idStr as NodeId<NodeType>);

  if (!node) {
    exitWithError(
      "INVALID_ARGUMENT",
      `Node "${idStr}" not found. Use "kaabalah tree:types --json" to see valid node types, or "kaabalah tree --json --fields=nodes" to list all node IDs.`,
      flags
    );
  }

  const typeFilter = getFlagString(flags, "type");
  const depth = getFlagNumber(flags, "depth") ?? 1;
  const correspondences = tree.getCorrespondences(node.id as NodeId<NodeType>, {
    depth,
    type: (typeFilter as NodeType | undefined) ?? undefined,
  }) as CorrespondenceMatch<NodeType>[];
  const related = correspondences.map(({ node: relatedNode }) => relatedNode);
  const directEdges = tree.getEdges(node.id as NodeId<NodeType>);
  const relatedTypes = getRelatedTypes(tree, node.id as NodeId<NodeType>);

  if (isJsonMode(flags)) {
    outputJson(
      {
        descriptor: tree.descriptor,
        node: serializeNode(node),
        relatedTypes,
        depth,
        ...(typeFilter ? { typeFilter } : {}),
        related: related.map(serializeNode),
        directEdges: directEdges.map(serializeEdge),
        correspondences: correspondences.map(serializeMatch),
        correspondenceMap: groupSerializedMatches(correspondences),
      },
      flags
    );
    return;
  }

  console.log(`\n  ${node.id}`);
  const data = node.data as Record<string, unknown> | undefined;
  if (data) {
    for (const [key, value] of Object.entries(data)) {
      if (value != null && typeof value !== "object") {
        console.log(`    ${key}: ${value}`);
      }
    }
  }

  console.log(`\n  Related types: ${relatedTypes.join(", ")}`);

  const byType = new Map<string, typeof correspondences>();
  for (const relation of correspondences) {
    if (!byType.has(relation.node.type)) {
      byType.set(relation.node.type, []);
    }
    byType.get(relation.node.type)!.push(relation);
  }

  for (const [type, matches] of byType) {
    console.log(`\n  ${type}:`);
    for (const match of matches) {
      const label = humanLabel(match.node);
      const sources =
        match.path.length > 0
          ? describeSources(match.path[match.path.length - 1].edge)
          : "";
      const details = [
        label ? `— ${label}` : "",
        match.distance > 1 ? `(depth ${match.distance})` : "",
        sources ? `[${sources}]` : "",
      ]
        .filter(Boolean)
        .join(" ");

      console.log(`    ${match.node.id}${details ? ` ${details}` : ""}`);
    }
  }
  console.log();
}

export function cmdTreeTypes(flags: Flags): void {
  const tree = getTree();
  const allNodes = tree.getNodes();

  const counts: Record<string, { count: number; ids: string[] }> = {};
  for (const node of allNodes) {
    if (!counts[node.type]) {
      counts[node.type] = { count: 0, ids: [] };
    }
    counts[node.type].count++;
    counts[node.type].ids.push(node.id);
  }

  if (isJsonMode(flags)) {
    outputJson(
      {
        descriptor: tree.descriptor,
        types: counts,
      },
      flags
    );
    return;
  }

  console.log(`\nNode types (${Object.keys(counts).length}):\n`);
  for (const [type, info] of Object.entries(counts)) {
    console.log(`  ${type}: ${info.count}`);
  }
  console.log();
}

export function cmdTreeFind(query: string | undefined, flags: Flags): void {
  const tree = getTree();
  const typeFilter = getFlagString(flags, "type");
  const limit = getFlagNumber(flags, "limit") ?? 20;
  const search = query?.trim() || undefined;

  if (!search && !typeFilter) {
    exitWithError(
      "MISSING_ARGUMENT",
      'Usage: kaabalah tree:find <query> [--type=<nodeType>] or kaabalah tree:find --type=<nodeType>',
      flags
    );
  }

  const matches = tree.findNodes({
    search,
    type: (typeFilter as NodeType | undefined) ?? undefined,
  });
  const limitedMatches = matches.slice(0, Math.max(1, limit));

  if (isJsonMode(flags)) {
    outputJson(
      {
        descriptor: tree.descriptor,
        query: search ?? null,
        ...(typeFilter ? { typeFilter } : {}),
        totalMatches: matches.length,
        returnedMatches: limitedMatches.length,
        matches: limitedMatches.map(serializeNode),
      },
      flags
    );
    return;
  }

  console.log(`\nTree search\n`);
  if (search) {
    console.log(`  Query: ${search}`);
  }
  if (typeFilter) {
    console.log(`  Type: ${typeFilter}`);
  }
  console.log(`  Matches: ${matches.length}\n`);

  for (const match of limitedMatches) {
    const label = humanLabel(match);
    console.log(`  ${match.id}${label ? ` — ${label}` : ""}`);
  }

  if (matches.length > limitedMatches.length) {
    console.log(`\n  ... and ${matches.length - limitedMatches.length} more`);
  }
  console.log();
}

export function cmdTreeLayout(flags: Flags): void {
  if (getFlagBool(flags, "render-model")) {
    const modelOptions = buildRenderModelOptions(flags);
    const model = getTreeRenderModel(modelOptions);
    const payload = serializeRenderModel(model);

    if (isJsonMode(flags)) {
      outputJson(payload, flags);
      return;
    }

    console.log(`\nTree render model (${model.system})\n`);
    console.log(
      `  ViewBox: ${model.viewBox.minX} ${model.viewBox.minY} ${model.viewBox.width} ${model.viewBox.height}`
    );
    console.log(`  Layers: ${model.layerOrder.join(" -> ")}`);
    console.log(`  Spheres: ${model.spheres.length}`);
    console.log(`  Paths: ${model.paths.length}`);
    console.log(
      `  Activations: ${
        model.spheres.filter((sphere) => sphere.activation).length
        + model.paths.filter((path) => path.activation).length
      }\n`
    );
    return;
  }

  const system = resolveSystem(flags);
  const units = resolveLayoutUnits(flags);
  const layout = getTreeLayout(system);
  const payload = serializeLayout(layout, units);

  if (isJsonMode(flags)) {
    outputJson(payload, flags);
    return;
  }

  console.log(`\nTree layout (${system})\n`);
  console.log(`  Spheres: ${layout.sphereOrder.length}`);
  console.log(`  Paths: ${layout.pathOrder.length}`);
  console.log(`  Units: ${units}`);
  console.log(
    `  ViewBox: ${layout.viewBox.minX} ${layout.viewBox.minY} ${layout.viewBox.width} ${layout.viewBox.height}\n`
  );

  const activeSpace =
    units === "viewBoxUnits" ? layout.viewBoxUnits.spheres : layout.percentages.spheres;
  for (const sphereId of layout.sphereOrder) {
    const point = activeSpace[sphereId];
    console.log(`  ${sphereId}: (${point.x}, ${point.y})`);
  }
  console.log();
}

export function cmdTreeTopology(flags: Flags): void {
  const system = resolveSystem(flags);
  const routeKey = resolveTopologyRouteKey(flags);
  const topology = getTreeTopology({ system });
  const spheres = topology.getSpheres();
  const paths = topology.getPaths();
  const routes = routeKey
    ? [topology.getRoute(routeKey)].filter(
        (route): route is TreeTopologyRoute => Boolean(route)
      )
    : topology.getRoutes();

  if (isJsonMode(flags)) {
    outputJson(
      {
        system,
        sphereOrder: spheres.map((sphere) => sphere.id),
        pathOrder: paths.map((path) => path.id),
        spheres: spheres.map(serializeTopologySphere),
        paths: paths.map(serializeTopologyPath),
        routes: routes.map(serializeTopologyRoute),
      },
      flags
    );
    return;
  }

  console.log(`\nTree topology (${system})\n`);
  console.log(`  Spheres: ${spheres.length}`);
  console.log(`  Paths: ${paths.length}`);

  for (const route of routes) {
    const serialized = serializeTopologyRoute(route);
    console.log(
      `\n  ${route.name} (${route.direction}, ${route.isFullyConnected ? "fully connected" : "has missing path segments"}):`
    );
    console.log(`    ${serialized.sphereNames.join(" -> ")}`);

    if (route.missingSegments.length > 0) {
      console.log("    Missing direct paths:");
      for (const segment of route.missingSegments) {
        console.log(`      ${segment.from.name} -> ${segment.to.name}`);
      }
    }
  }

  console.log();
}

export function cmdTreeSvg(flags: Flags): void {
  const svgOptions = buildSvgOptions(flags);
  const svg = generateTreeSvg(svgOptions);
  const outputPathFlag = getFlagString(flags, "output");
  const system = svgOptions.system ?? KAABALAH_SYSTEM;

  if (outputPathFlag) {
    const outputPath = resolve(outputPathFlag);
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, svg, "utf8");

    if (isJsonMode(flags)) {
      outputJson(
        {
          system,
          outputPath,
          bytes: Buffer.byteLength(svg, "utf8"),
          options: {
            width: svgOptions.width ?? null,
            height: svgOptions.height ?? null,
            background: svgOptions.background ?? null,
            palette: svgOptions.palette ?? "color",
            viewBox: svgOptions.viewBox ?? null,
            daathLayer: svgOptions.daathLayer ?? "front",
            activationCount: svgOptions.activations?.length ?? 0,
          },
        },
        flags
      );
      return;
    }

    console.log(`Wrote ${outputPath} (${Buffer.byteLength(svg, "utf8")} bytes)`);
    return;
  }

  if (isJsonMode(flags)) {
    outputJson(
      {
        system,
        svg,
        activationCount: svgOptions.activations?.length ?? 0,
      },
      flags
    );
    return;
  }

  process.stdout.write(svg.endsWith("\n") ? svg : `${svg}\n`);
}

export function cmdTreeAscii(flags: Flags): void {
  const system = resolveSystem(flags);
  const columns = getFlagNumber(flags, "columns") ?? 61;
  const rows = getFlagNumber(flags, "rows") ?? 31;

  if (columns < 21 || rows < 11) {
    exitWithError(
      "INVALID_ARGUMENT",
      'ASCII grid too small. Use at least "--columns=21 --rows=11".',
      flags
    );
  }

  const layout = getTreeLayout(system);
  const lines = renderAsciiTree(layout, columns, rows);
  const ascii = lines.join("\n");

  if (isJsonMode(flags)) {
    outputJson(
      {
        system,
        columns,
        rows,
        ascii,
        lines,
      },
      flags
    );
    return;
  }

  process.stdout.write(`${ascii}\n`);
}
