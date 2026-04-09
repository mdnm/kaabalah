import {
  getCanonicalTree,
  type CorrespondenceEdge,
  type CorrespondenceMatch,
  type CorrespondenceSource,
  type Node,
  type NodeId,
  type NodeType,
} from "../../core";
import { SYSTEM as KAABALAH_SYSTEM } from "../../core/systems/kaabalah";
import { getFlagNumber, getFlagString, isJsonMode } from "../runtime/args";
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
