import type { PartKey, SystemKey } from "./systems/registry";
import type { Node, NodeId, NodeType } from "./types";

export type CorrespondenceSource =
  | {
      kind: "manual";
    }
  | {
      kind: "system";
      system: SystemKey;
    }
  | {
      kind: "part";
      system: SystemKey;
      part: PartKey;
    }
  | {
      kind: "bridge";
      system: SystemKey;
      bridgeId: string;
      parts: PartKey[];
    }
  | {
      kind: "overlay";
      overlayId: string;
      label?: string;
    };

export interface CorrespondenceMetadata {
  kind?: string;
  label?: string;
  tags?: string[];
  attributes?: Record<string, unknown>;
}

export interface CorrespondenceEdge {
  id: string;
  left: NodeId<NodeType>;
  right: NodeId<NodeType>;
  metadata?: CorrespondenceMetadata;
  sources: readonly CorrespondenceSource[];
}

export type TreeNoteTarget =
  | {
      kind: "node";
      nodeId: NodeId<NodeType>;
    }
  | {
      kind: "correspondence";
      left: NodeId<NodeType>;
      right: NodeId<NodeType>;
    };

export interface TreeNote {
  id: string;
  text: string;
  kind?: string;
  target: TreeNoteTarget;
  metadata?: Record<string, unknown>;
}

export type TreeOverlayCorrespondence =
  | {
      op: "add";
      left: NodeId<NodeType>;
      right: NodeId<NodeType>;
      metadata?: CorrespondenceMetadata;
    }
  | {
      op: "remove";
      left: NodeId<NodeType>;
      right: NodeId<NodeType>;
    }
  | {
      op: "annotate";
      left: NodeId<NodeType>;
      right: NodeId<NodeType>;
      metadata?: CorrespondenceMetadata;
    };

export interface TreeOverlay {
  id: string;
  name?: string;
  version?: string;
  nodes?: Node<NodeType>[];
  correspondences?: TreeOverlayCorrespondence[];
  notes?: TreeNote[];
}

export interface TreeWorkspaceDescriptor {
  id?: string;
  name?: string;
  version?: string;
  system?: SystemKey;
  parts?: readonly string[];
  cacheKey?: string;
}

export interface CorrespondenceStep {
  from: NodeId<NodeType>;
  to: NodeId<NodeType>;
  edge: CorrespondenceEdge;
}

export interface CorrespondenceMatch<T extends NodeType = NodeType> {
  node: Node<T>;
  distance: number;
  path: readonly CorrespondenceStep[];
}

export type CorrespondenceMap = Partial<{
  [K in NodeType]: CorrespondenceMatch<K>[];
}>;

export function makeCorrespondenceId(
  left: NodeId<NodeType>,
  right: NodeId<NodeType>
) {
  return [left, right].sort().join("<->");
}

export function cloneMetadata(metadata?: CorrespondenceMetadata) {
  if (!metadata) {
    return undefined;
  }

  return {
    ...metadata,
    tags: metadata.tags ? [...metadata.tags] : undefined,
    attributes: metadata.attributes ? { ...metadata.attributes } : undefined,
  };
}

export function cloneSource(source: CorrespondenceSource): CorrespondenceSource {
  if (source.kind === "bridge") {
    return {
      ...source,
      parts: [...source.parts],
    };
  }

  return { ...source };
}

export function mergeMetadata(
  current?: CorrespondenceMetadata,
  next?: CorrespondenceMetadata
) {
  if (!current) {
    return cloneMetadata(next);
  }

  if (!next) {
    return cloneMetadata(current);
  }

  return {
    ...current,
    ...next,
    tags: [...new Set([...(current.tags ?? []), ...(next.tags ?? [])])],
    attributes: {
      ...(current.attributes ?? {}),
      ...(next.attributes ?? {}),
    },
  };
}

export function mergeSources(
  current: readonly CorrespondenceSource[],
  next: CorrespondenceSource
) {
  const seen = new Set<string>();
  const merged: CorrespondenceSource[] = [];

  for (const source of [...current, next]) {
    const key = JSON.stringify(source);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    merged.push(cloneSource(source));
  }

  return merged;
}
