import { createTree } from "../../core/factory";
import { SYSTEM as KAABALAH_SYSTEM } from "../../core/systems/kaabalah";
import { getFlagNumber, getFlagString, isJsonMode } from "../runtime/args";
import { exitWithError } from "../runtime/errors";
import { outputJson } from "../runtime/output";
import type { Flags } from "../runtime/types";

function getTree() {
  return createTree({ system: KAABALAH_SYSTEM, parts: ["westernAstrology", "tarot"] });
}

function serializeNode(node: { id: string; type: string; data?: unknown; name?: string }) {
  const result: Record<string, unknown> = { id: node.id, type: node.type };
  if (node.data && typeof node.data === "object" && Object.keys(node.data as object).length > 0) {
    result.data = node.data;
  }
  if (node.name) {
    result.name = node.name;
  }
  return result;
}

export function cmdTree(flags: Flags): void {
  const tree = getTree();
  const allNodes = tree.getNodes();

  if (isJsonMode(flags)) {
    const nodes = allNodes.map((node) => {
      const serialized = serializeNode(node);
      const relatedTypes = tree.relatedTypes(node.id);
      if (relatedTypes.length > 0) {
        serialized.relatedTypes = relatedTypes;
      }
      return serialized;
    });

    const edgeSet = new Set<string>();
    const edges: { from: string; to: string }[] = [];
    for (const node of allNodes) {
      const related = tree.related(node.id);
      for (const relation of related) {
        const key = node.id < relation.id ? `${node.id}|${relation.id}` : `${relation.id}|${node.id}`;
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push({ from: node.id, to: relation.id });
        }
      }
    }

    outputJson({ system: KAABALAH_SYSTEM, totalNodes: allNodes.length, totalEdges: edges.length, nodes, edges }, flags);
    return;
  }

  console.log(`\nTree of Life (${KAABALAH_SYSTEM})\n`);
  console.log(`  Total nodes: ${allNodes.length}`);

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
      const data = node.data as Record<string, unknown> | undefined;
      const name = (data?.name ?? data?.character ?? "") as string;
      console.log(`    ${node.id}${name ? ` — ${name}` : ""}`);
    }
    if (nodes.length > 15) {
      console.log(`    ... and ${nodes.length - 15} more`);
    }
  }
  console.log();
}

export function cmdTreeNode(idStr: string, flags: Flags): void {
  const tree = getTree();
  const node = tree.getNode(idStr as any);

  if (!node) {
    exitWithError("INVALID_ARGUMENT", `Node "${idStr}" not found. Use "kaabalah tree:types --json" to see valid node types, or "kaabalah tree --json --fields=nodes" to list all node IDs.`, flags);
  }

  const typeFilter = getFlagString(flags, "type");
  const depth = getFlagNumber(flags, "depth") ?? 1;
  const related = depth > 1
    ? tree.walk(node.id, depth, typeFilter as any || undefined)
    : typeFilter
      ? tree.related(node.id, typeFilter as any)
      : tree.related(node.id);

  if (isJsonMode(flags)) {
    outputJson({
      node: serializeNode(node),
      relatedTypes: tree.relatedTypes(node.id),
      related: related.map(serializeNode),
    }, flags);
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

  console.log(`\n  Related types: ${tree.relatedTypes(node.id).join(", ")}`);

  const byType = new Map<string, typeof related>();
  for (const relation of related) {
    if (!byType.has(relation.type)) {
      byType.set(relation.type, []);
    }
    byType.get(relation.type)!.push(relation);
  }

  for (const [type, nodes] of byType) {
    console.log(`\n  ${type}:`);
    for (const relation of nodes) {
      const relationData = relation.data as Record<string, unknown> | undefined;
      const label = (relationData?.name ?? relationData?.character ?? relationData?.englishName ?? relationData?.meaning ?? "") as string;
      console.log(`    ${relation.id}${label ? ` — ${label}` : ""}`);
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
    outputJson(counts, flags);
    return;
  }

  console.log(`\nNode types (${Object.keys(counts).length}):\n`);
  for (const [type, info] of Object.entries(counts)) {
    console.log(`  ${type}: ${info.count}`);
  }
  console.log();
}
