import {
  CorrespondenceEdge,
  CorrespondenceMap,
  CorrespondenceMatch,
  CorrespondenceSource,
  CorrespondenceStep,
  TreeNote,
  TreeNoteTarget,
  TreeOverlay,
  TreeWorkspaceDescriptor,
  cloneMetadata,
  cloneSource,
  makeCorrespondenceId,
  mergeMetadata,
  mergeSources,
} from "./correspondence-model";
import { createTree, TreeOptions } from "./factory";
import { TreeOfLife } from "./tree-of-life";
import { Node, NodeId, NodeType } from "./types";

export interface TreeCorrespondenceQueryOptions<T extends NodeType = NodeType> {
  type?: T | readonly T[];
  depth?: number;
  includeSelf?: boolean;
  limit?: number;
}

export interface TreeFindNodesOptions<T extends NodeType = NodeType> {
  type?: T | readonly T[];
  ids?: readonly NodeId<T>[];
  search?: string;
  predicate?: (node: Node<T>) => boolean;
}

export interface TreeVisualRequest {
  nodeId: NodeId<NodeType>;
  kind?: string;
  [key: string]: unknown;
}

export interface TreeVisualResult {
  kind: string;
  nodeId: NodeId<NodeType>;
  [key: string]: unknown;
}

export type TreeVisualResolver = (input: {
  request: TreeVisualRequest;
  workspace: TreeWorkspace;
}) => TreeVisualResult | undefined;

export interface CreateTreeWorkspaceOptions {
  base?: TreeWorkspace | TreeOfLife;
  overlays?: TreeOverlay[];
  descriptor?: TreeWorkspaceDescriptor;
  visualResolvers?: TreeVisualResolver[];
}

type TreeGraphData = {
  descriptor: TreeWorkspaceDescriptor;
  nodesById: Map<NodeId<NodeType>, Node<NodeType>>;
  nodeIdsByType: Map<NodeType, NodeId<NodeType>[]>;
  edgesById: Map<string, CorrespondenceEdge>;
  edgeIdsByNodeId: Map<NodeId<NodeType>, string[]>;
  notesById: Map<string, TreeNote>;
  noteIdsByNodeId: Map<NodeId<NodeType>, string[]>;
  noteIdsByCorrespondenceId: Map<string, string[]>;
};

function cloneNode<T extends NodeType>(node: Node<T>): Node<T> {
  return Object.freeze({
    id: node.id,
    type: node.type,
    name: node.name,
    data:
      node.data && typeof node.data === "object"
        ? ({ ...node.data } as Node<T>["data"])
        : node.data,
  });
}

function cloneEdge(edge: CorrespondenceEdge): CorrespondenceEdge {
  return Object.freeze({
    ...edge,
    metadata: cloneMetadata(edge.metadata),
    sources: edge.sources.map(cloneSource),
  });
}

function cloneNote(note: TreeNote): TreeNote {
  return Object.freeze({
    ...note,
    target: { ...note.target },
    metadata: note.metadata ? { ...note.metadata } : undefined,
  });
}

function normalizeTypes<T extends NodeType>(
  type?: T | readonly T[]
): Set<NodeType> | undefined {
  if (!type) {
    return undefined;
  }

  return new Set(Array.isArray(type) ? type : [type]);
}

function sortNodes<T extends NodeType>(nodes: Node<T>[]) {
  return [...nodes].sort((left, right) => {
    if (left.type !== right.type) {
      return left.type.localeCompare(right.type);
    }

    const leftLabel = String(left.name ?? left.id);
    const rightLabel = String(right.name ?? right.id);

    return leftLabel.localeCompare(rightLabel);
  });
}

function sortMatches<T extends NodeType>(matches: CorrespondenceMatch<T>[]) {
  return [...matches].sort((left, right) => {
    if (left.distance !== right.distance) {
      return left.distance - right.distance;
    }

    if (left.node.type !== right.node.type) {
      return left.node.type.localeCompare(right.node.type);
    }

    const leftLabel = String(left.node.name ?? left.node.id);
    const rightLabel = String(right.node.name ?? right.node.id);

    return leftLabel.localeCompare(rightLabel);
  });
}

function createGraphData(
  descriptor: TreeWorkspaceDescriptor,
  nodes: Iterable<Node<NodeType>>,
  edges: Iterable<CorrespondenceEdge>,
  notes: Iterable<TreeNote>
): TreeGraphData {
  const nodesById = new Map<NodeId<NodeType>, Node<NodeType>>();
  const nodeIdsByType = new Map<NodeType, NodeId<NodeType>[]>();
  const edgesById = new Map<string, CorrespondenceEdge>();
  const edgeIdsByNodeId = new Map<NodeId<NodeType>, string[]>();
  const notesById = new Map<string, TreeNote>();
  const noteIdsByNodeId = new Map<NodeId<NodeType>, string[]>();
  const noteIdsByCorrespondenceId = new Map<string, string[]>();

  for (const node of nodes) {
    const clonedNode = cloneNode(node);

    nodesById.set(clonedNode.id, clonedNode);

    const typedIds = nodeIdsByType.get(clonedNode.type) ?? [];
    typedIds.push(clonedNode.id as NodeId<NodeType>);
    nodeIdsByType.set(clonedNode.type, typedIds);
  }

  for (const edge of edges) {
    const clonedEdge = cloneEdge(edge);

    edgesById.set(clonedEdge.id, clonedEdge);

    const leftEdges = edgeIdsByNodeId.get(clonedEdge.left) ?? [];
    leftEdges.push(clonedEdge.id);
    edgeIdsByNodeId.set(clonedEdge.left, leftEdges);

    const rightEdges = edgeIdsByNodeId.get(clonedEdge.right) ?? [];
    rightEdges.push(clonedEdge.id);
    edgeIdsByNodeId.set(clonedEdge.right, rightEdges);
  }

  for (const note of notes) {
    const clonedNote = cloneNote(note);
    notesById.set(clonedNote.id, clonedNote);

    if (clonedNote.target.kind === "node") {
      const nodeNoteIds = noteIdsByNodeId.get(clonedNote.target.nodeId) ?? [];
      nodeNoteIds.push(clonedNote.id);
      noteIdsByNodeId.set(clonedNote.target.nodeId, nodeNoteIds);
      continue;
    }

    const edgeId = makeCorrespondenceId(
      clonedNote.target.left,
      clonedNote.target.right
    );
    const correspondenceNoteIds =
      noteIdsByCorrespondenceId.get(edgeId) ?? [];
    correspondenceNoteIds.push(clonedNote.id);
    noteIdsByCorrespondenceId.set(edgeId, correspondenceNoteIds);
  }

  for (const ids of nodeIdsByType.values()) {
    ids.sort((left, right) => String(left).localeCompare(String(right)));
  }

  for (const ids of edgeIdsByNodeId.values()) {
    ids.sort((left, right) => left.localeCompare(right));
  }

  for (const ids of noteIdsByNodeId.values()) {
    ids.sort((left, right) => left.localeCompare(right));
  }

  for (const ids of noteIdsByCorrespondenceId.values()) {
    ids.sort((left, right) => left.localeCompare(right));
  }

  return {
    descriptor: Object.freeze({ ...descriptor }),
    nodesById,
    nodeIdsByType,
    edgesById,
    edgeIdsByNodeId,
    notesById,
    noteIdsByNodeId,
    noteIdsByCorrespondenceId,
  };
}

function normalizeBase(base?: TreeWorkspace | TreeOfLife) {
  if (!base) {
    return {
      descriptor: {},
      nodes: [] as Node<NodeType>[],
      edges: [] as CorrespondenceEdge[],
      notes: [] as TreeNote[],
    };
  }

  if (base instanceof TreeWorkspace) {
    return {
      descriptor: base.descriptor,
      nodes: base.getNodes(),
      edges: base.getEdges(),
      notes: base.getNotes(),
    };
  }

  return {
    descriptor: {
      system: base.activeSystem ?? undefined,
      parts: base.loadedParts.filter((part) => part !== "base"),
    },
    nodes: base.getNodes(),
    edges: base.getEdges(),
    notes: [] as TreeNote[],
  };
}

function applyOverlays(
  base: ReturnType<typeof normalizeBase>,
  overlays: TreeOverlay[]
) {
  const nodesById = new Map<NodeId<NodeType>, Node<NodeType>>();
  const edgesById = new Map<string, CorrespondenceEdge>();
  const notes: TreeNote[] = [];

  for (const node of base.nodes) {
    nodesById.set(node.id as NodeId<NodeType>, cloneNode(node));
  }

  for (const edge of base.edges) {
    edgesById.set(edge.id, cloneEdge(edge));
  }

  for (const note of base.notes) {
    notes.push(cloneNote(note));
  }

  for (const overlay of overlays) {
    for (const node of overlay.nodes ?? []) {
      const existing = nodesById.get(node.id as NodeId<NodeType>);

      if (existing && existing.type !== node.type) {
        throw new Error(
          `Overlay ${overlay.id} tried to upsert ${node.id} with a different type`
        );
      }

      nodesById.set(
        node.id as NodeId<NodeType>,
        cloneNode(
          existing
            ? {
                ...existing,
                ...node,
                data: {
                  ...(existing.data ?? {}),
                  ...(node.data ?? {}),
                } as Node<NodeType>["data"],
              }
            : node
        )
      );
    }

    for (const correspondence of overlay.correspondences ?? []) {
      if (
        !nodesById.has(correspondence.left) ||
        !nodesById.has(correspondence.right)
      ) {
        throw new Error(
          `Overlay ${overlay.id} references unknown nodes in ${correspondence.left} <-> ${correspondence.right}`
        );
      }

      const edgeId = makeCorrespondenceId(
        correspondence.left,
        correspondence.right
      );

      if (correspondence.op === "remove") {
        edgesById.delete(edgeId);
        continue;
      }

      const existingEdge = edgesById.get(edgeId);
      const overlaySource: CorrespondenceSource = {
        kind: "overlay",
        overlayId: overlay.id,
        label: overlay.name,
      };

      if (!existingEdge) {
        if (correspondence.op !== "add") {
          throw new Error(
            `Overlay ${overlay.id} cannot annotate missing correspondence ${edgeId}`
          );
        }

        edgesById.set(
          edgeId,
          cloneEdge({
            id: edgeId,
            left: correspondence.left,
            right: correspondence.right,
            metadata: cloneMetadata(correspondence.metadata),
            sources: [overlaySource],
          })
        );
        continue;
      }

      edgesById.set(
        edgeId,
        cloneEdge({
          ...existingEdge,
          metadata: mergeMetadata(existingEdge.metadata, correspondence.metadata),
          sources: mergeSources(existingEdge.sources, overlaySource),
        })
      );
    }

    for (const note of overlay.notes ?? []) {
      notes.push(
        cloneNote({
          ...note,
          metadata: note.metadata ? { ...note.metadata } : undefined,
        })
      );
    }
  }

  const filteredNotes = notes.filter((note) => {
    if (note.target.kind === "node") {
      return nodesById.has(note.target.nodeId);
    }

    return edgesById.has(
      makeCorrespondenceId(note.target.left, note.target.right)
    );
  });

  return {
    nodes: [...nodesById.values()],
    edges: [...edgesById.values()],
    notes: filteredNotes,
  };
}

function reconstructPath(
  startId: NodeId<NodeType>,
  targetId: NodeId<NodeType>,
  previous: Map<NodeId<NodeType>, { from: NodeId<NodeType>; edgeId: string }>,
  edgesById: Map<string, CorrespondenceEdge>
) {
  const steps: CorrespondenceStep[] = [];
  let current = targetId;

  while (current !== startId) {
    const link = previous.get(current);

    if (!link) {
      break;
    }

    const edge = edgesById.get(link.edgeId);

    if (!edge) {
      break;
    }

    steps.push({
      from: link.from,
      to: current,
      edge,
    });
    current = link.from;
  }

  return steps.reverse();
}

function buildCanonicalDescriptor(opts: TreeOptions, cacheKey: string) {
  return {
    id: `canonical:${cacheKey}`,
    name: "Canonical Tree",
    system: opts.system,
    parts: [...(opts.parts ?? [])],
    cacheKey,
  } satisfies TreeWorkspaceDescriptor;
}

const canonicalTreeCache = new Map<string, TreeWorkspace>();

export class TreeWorkspace {
  public readonly descriptor: TreeWorkspaceDescriptor;

  constructor(
    private readonly graph: TreeGraphData,
    private readonly visualResolvers: readonly TreeVisualResolver[] = []
  ) {
    this.descriptor = graph.descriptor;
  }

  getNode<T extends NodeType>(id: NodeId<T>) {
    return this.graph.nodesById.get(id as NodeId<NodeType>) as
      | Node<T>
      | undefined;
  }

  hasNode(id: NodeId<NodeType>) {
    return this.graph.nodesById.has(id);
  }

  getNodes<T extends NodeType>(type?: T): Node<T>[] {
    if (!type) {
      return sortNodes(
        [...this.graph.nodesById.values()] as Node<T>[]
      );
    }

    const ids = this.graph.nodeIdsByType.get(type) ?? [];

    return ids
      .map((id) => this.graph.nodesById.get(id) as Node<T> | undefined)
      .filter((node): node is Node<T> => Boolean(node));
  }

  findNodes<T extends NodeType = NodeType>(
    options: TreeFindNodesOptions<T> = {}
  ): Node<T>[] {
    const typeFilter = normalizeTypes(options.type);
    const search = options.search?.trim().toLowerCase();

    const candidates = options.ids
      ? options.ids
          .map((id) => this.graph.nodesById.get(id as NodeId<NodeType>))
          .filter((node): node is Node<NodeType> => Boolean(node))
      : typeFilter
        ? [...typeFilter].flatMap((type) => this.getNodes(type))
        : this.getNodes();

    return sortNodes(
      candidates.filter((node): node is Node<T> => {
        if (typeFilter && !typeFilter.has(node.type)) {
          return false;
        }

        if (search) {
          const haystacks = [
            String(node.id).toLowerCase(),
            String(node.name ?? "").toLowerCase(),
          ];

          if (!haystacks.some((value) => value.includes(search))) {
            return false;
          }
        }

        return options.predicate ? options.predicate(node as Node<T>) : true;
      })
    );
  }

  getEdge(left: NodeId<NodeType>, right: NodeId<NodeType>) {
    return this.graph.edgesById.get(makeCorrespondenceId(left, right));
  }

  getEdges(nodeId?: NodeId<NodeType>) {
    if (!nodeId) {
      return [...this.graph.edgesById.values()];
    }

    return (this.graph.edgeIdsByNodeId.get(nodeId) ?? [])
      .map((edgeId) => this.graph.edgesById.get(edgeId))
      .filter((edge): edge is CorrespondenceEdge => Boolean(edge));
  }

  getNotes(target?: TreeNoteTarget) {
    if (!target) {
      return [...this.graph.notesById.values()];
    }

    if (target.kind === "node") {
      return (this.graph.noteIdsByNodeId.get(target.nodeId) ?? [])
        .map((noteId) => this.graph.notesById.get(noteId))
        .filter((note): note is TreeNote => Boolean(note));
    }

    const edgeId = makeCorrespondenceId(target.left, target.right);

    return (this.graph.noteIdsByCorrespondenceId.get(edgeId) ?? [])
      .map((noteId) => this.graph.notesById.get(noteId))
      .filter((note): note is TreeNote => Boolean(note));
  }

  getCorrespondences<T extends NodeType, U extends NodeType = NodeType>(
    nodeId: NodeId<T>,
    options: TreeCorrespondenceQueryOptions<U> = {}
  ): CorrespondenceMatch<U>[] {
    if (!this.graph.nodesById.has(nodeId as NodeId<NodeType>)) {
      return [];
    }

    const typeFilter = normalizeTypes(options.type);
    const includeSelf = options.includeSelf ?? false;
    const depth = Math.max(1, options.depth ?? 1);
    const limit = options.limit ?? Infinity;

    const previous = new Map<
      NodeId<NodeType>,
      { from: NodeId<NodeType>; edgeId: string }
    >();
    const visited = new Set<NodeId<NodeType>>([nodeId as NodeId<NodeType>]);
    const queue: Array<{ nodeId: NodeId<NodeType>; distance: number }> = [
      {
        nodeId: nodeId as NodeId<NodeType>,
        distance: 0,
      },
    ];
    const matches: CorrespondenceMatch<NodeType>[] = [];

    while (queue.length > 0 && matches.length < limit) {
      const current = queue.shift()!;

      if (current.distance >= depth) {
        continue;
      }

      for (const edgeId of this.graph.edgeIdsByNodeId.get(current.nodeId) ?? []) {
        const edge = this.graph.edgesById.get(edgeId);

        if (!edge) {
          continue;
        }

        const nextNodeId =
          edge.left === current.nodeId ? edge.right : edge.left;

        if (visited.has(nextNodeId)) {
          continue;
        }

        visited.add(nextNodeId);
        previous.set(nextNodeId, {
          from: current.nodeId,
          edgeId,
        });

        const distance = current.distance + 1;
        const nextNode = this.graph.nodesById.get(nextNodeId);

        if (!nextNode) {
          continue;
        }

        if ((!typeFilter || typeFilter.has(nextNode.type)) && distance > 0) {
          matches.push({
            node: nextNode,
            distance,
            path: reconstructPath(
              nodeId as NodeId<NodeType>,
              nextNodeId,
              previous,
              this.graph.edgesById
            ),
          });
        }

        queue.push({
          nodeId: nextNodeId,
          distance,
        });
      }
    }

    if (includeSelf) {
      const sourceNode = this.graph.nodesById.get(nodeId as NodeId<NodeType>);

      if (
        sourceNode &&
        (!typeFilter || typeFilter.has(sourceNode.type)) &&
        matches.length < limit
      ) {
        matches.unshift({
          node: sourceNode as Node<U>,
          distance: 0,
          path: [],
        });
      }
    }

    return sortMatches(matches as CorrespondenceMatch<U>[]).slice(0, limit);
  }

  getCorrespondenceMap<T extends NodeType>(
    nodeId: NodeId<T>,
    options: Omit<TreeCorrespondenceQueryOptions, "type"> = {}
  ): CorrespondenceMap {
    const grouped: Record<string, CorrespondenceMatch[]> = {};

    for (const match of this.getCorrespondences(nodeId, options)) {
      const typeKey = match.node.type;
      const typeMatches = grouped[typeKey] ?? [];
      typeMatches.push(match as CorrespondenceMatch);
      grouped[typeKey] = typeMatches;
    }

    return grouped as CorrespondenceMap;
  }

  resolveVisual(request: TreeVisualRequest) {
    for (const resolver of this.visualResolvers) {
      const resolved = resolver({
        request,
        workspace: this,
      });

      if (resolved) {
        return resolved;
      }
    }

    return undefined;
  }
}

export function createTreeWorkspace(
  options: CreateTreeWorkspaceOptions = {}
) {
  const base = normalizeBase(options.base);
  const overlays = options.overlays ?? [];
  const applied = applyOverlays(base, overlays);
  const descriptor = {
    ...base.descriptor,
    ...options.descriptor,
  };

  return new TreeWorkspace(
    createGraphData(descriptor, applied.nodes, applied.edges, applied.notes),
    options.visualResolvers ?? []
  );
}

export function getCanonicalTree(
  opts: TreeOptions = {
    system: "kaabalah",
    parts: [],
  }
) {
  const parts = [...(opts.parts ?? [])];
  const cacheKey = `${opts.system}:${parts.join(",")}`;
  const cachedTree = canonicalTreeCache.get(cacheKey);

  if (cachedTree) {
    return cachedTree;
  }

  const tree = createTree({
    system: opts.system,
    parts,
  });

  const canonicalTree = createTreeWorkspace({
    base: tree,
    descriptor: buildCanonicalDescriptor(opts, cacheKey),
  });

  canonicalTreeCache.set(cacheKey, canonicalTree);

  return canonicalTree;
}
