import { PartKey } from "./systems/registry";

import {
  CorrespondenceEdge,
  CorrespondenceMetadata,
  CorrespondenceSource,
  makeCorrespondenceId,
} from "./correspondence-model";
import { ModuleManager } from "./systems/module-manager";
import { SystemKey } from "./systems/registry";
import {
  BaseNode,
  KaabalahTypes,
  LetterTypes,
  Node,
  NodeData,
  NodeId,
  NodeType,
  NumerologyTypes,
  TarotTypes,
  WesternAstrologyTypes,
} from "./types";

function mergeCorrespondenceMetadata(
  current?: CorrespondenceMetadata,
  next?: CorrespondenceMetadata
) {
  if (!current) {
    return next ? { ...next } : undefined;
  }

  if (!next) {
    return { ...current };
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

function mergeCorrespondenceSources(
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
    merged.push({
      ...source,
      ...(source.kind === "bridge" ? { parts: [...source.parts] } : {}),
    } as CorrespondenceSource);
  }

  return merged;
}

/**
 * TreeOfLife represents a graph structure for mapping Kaabalah, Tarot, Astrology and other
 * esoteric correspondences. It can be used to create multiple independent instances
 * for different use cases or to isolate different sets of correspondences.
 */
export class TreeOfLife {
  private nodes = new Map<NodeId<NodeType>, Node<NodeType>>();
  private adjacent = new Map<NodeId<NodeType>, Set<NodeId<NodeType>>>();
  private edges = new Map<string, CorrespondenceEdge>();
  private mutationSources: CorrespondenceSource[] = [{ kind: "manual" }];

  private modules = new ModuleManager(this);

  private getCurrentMutationSource() {
    return this.mutationSources[this.mutationSources.length - 1] ?? {
      kind: "manual",
    };
  }

  runWithMutationSource<T>(source: CorrespondenceSource, fn: () => T) {
    this.mutationSources.push(source);

    try {
      return fn();
    } finally {
      this.mutationSources.pop();
    }
  }

  /**
   * Loads the tree of life system to be used
   * @param systemKey - the key of the system to load
   */
  loadSystem(systemKey: SystemKey) {
    this.modules.loadSystem(systemKey);
  }

  /**
   * Loads a part of a system into the tree of life
   * @param partKey - the key of the part to load
   */
  loadPart(partKey: PartKey) {
    this.modules.loadPart(partKey);
  }

  /**
   * Unloads the tree of life system and all its parts
   */
  unloadSystem() {
    this.modules.unloadSystem();
  }

  public get activeSystem(): SystemKey | null {
    return this.modules.getActiveSystem();
  }

  public get availableParts() {
    return this.modules.listAvailableParts();
  }

  public get loadedParts() {
    return this.modules.listLoadedParts();
  }

  public get availableBridges() {
    return this.modules.listAvailableBridges();
  }

  public get bridgedParts() {
    return this.modules.listBridgedParts();
  }

  /**
   * Upserts a node to the tree
   * @param node - the node to upsert
   * @returns the id of the added node
   */
  upsertNode<T extends NodeType>(node: Node<T>) {
    if (this.nodes.has(node.id)) {
      const existingNode = this.nodes.get(node.id)!;

      if (existingNode.type !== node.type) {
        throw new Error(
          "node with existing id but different type already exists"
        );
      }

      const updatedData = { ...existingNode.data, ...node.data } as NodeData<T>;

      this.nodes.set(node.id, { ...existingNode, data: updatedData });

      return node.id;
    }

    this.nodes.set(node.id, node);

    return node.id;
  }

  getNode<T extends NodeType>(id: NodeId<T>): Node<T> | undefined {
    return this.nodes.get(id) as Node<T> | undefined;
  }

  getNodes() {
    return [...this.nodes.values()];
  }

  getEdge(left: NodeId<NodeType>, right: NodeId<NodeType>) {
    return this.edges.get(makeCorrespondenceId(left, right));
  }

  getEdges(nodeId?: NodeId<NodeType>) {
    if (!nodeId) {
      return [...this.edges.values()];
    }

    return [...(this.adjacent.get(nodeId) ?? [])]
      .map((relatedNodeId) => this.getEdge(nodeId, relatedNodeId))
      .filter((edge): edge is CorrespondenceEdge => Boolean(edge));
  }

  /**
   * Links two nodes bi-directionally
   * @param firstNode - the id of the first node
   * @param secondNode - the id of the second node
   */
  link(
    firstNode: NodeId<NodeType>,
    secondNode: NodeId<NodeType>,
    options: {
      metadata?: CorrespondenceMetadata;
      source?: CorrespondenceSource;
    } = {}
  ) {
    if (!this.nodes.has(firstNode) || !this.nodes.has(secondNode)) {
      throw new Error("unknown node id");
    }

    if (firstNode === secondNode) {
      return;
    }

    const edgeId = makeCorrespondenceId(firstNode, secondNode);
    const source = options.source ?? this.getCurrentMutationSource();
    const existingEdge = this.edges.get(edgeId);

    const put = (leftNode: NodeId<NodeType>, rightNode: NodeId<NodeType>) => {
      const set = this.adjacent.get(leftNode) ?? new Set<NodeId<NodeType>>();
      set.add(rightNode);
      this.adjacent.set(leftNode, set);
    };

    if (existingEdge) {
      this.edges.set(edgeId, {
        ...existingEdge,
        metadata: mergeCorrespondenceMetadata(
          existingEdge.metadata,
          options.metadata
        ),
        sources: mergeCorrespondenceSources(existingEdge.sources, source),
      });
      put(firstNode, secondNode);
      put(secondNode, firstNode);

      return;
    }

    put(firstNode, secondNode);
    put(secondNode, firstNode);

    this.edges.set(edgeId, {
      id: edgeId,
      left: firstNode,
      right: secondNode,
      metadata: mergeCorrespondenceMetadata(undefined, options.metadata),
      sources: mergeCorrespondenceSources([], source),
    });
  }

  /**
   * Gets the current node and all its direct relations, or, when filtered by node type, only the direct relations of that type.
   * @param id - the id of the node to get the relations for
   * @param nodeType - the node type to filter the relations by
   * @returns the current node and all its direct relations
   */
  related<T extends NodeType, U extends NodeType>(
    id: NodeId<T>,
    nodeType?: U
  ): Node<U>[] {
    if (!this.nodes.has(id)) {
      return [];
    }

    const relations = this.adjacent.get(id);

    if (!relations) {
      return [];
    }

    const relatedNodes = [...relations].map(
      (i) => this.nodes.get(i)! as Node<U>
    );

    return nodeType
      ? relatedNodes.filter((n) => n.type === nodeType)
      : relatedNodes;
  }

  /**
   * Sugar for `related(id, type)[0]`
   * @param id - the id of the node to get the related node for
   * @param type - the type of the node to get the related node for
   * @returns the related node
   */
  relatedFirst<T extends NodeType, U extends NodeType>(
    id: NodeId<T>,
    type: U
  ): Node<U> | undefined {
    const related = this.related(id, type);

    return related?.[0];
  }

  /**
   * Gets all the types of nodes that are directly connected to the given node
   * @param id - the id of the node to get related types for
   * @returns array of node types that are directly connected
   */
  relatedTypes<T extends NodeType>(id: NodeId<T>): T[] {
    if (!this.nodes.has(id)) {
      return [];
    }

    return [
      ...new Set(
        [...(this.adjacent.get(id) ?? new Set<NodeId<NodeType>>()).values()].map(
          (nodeId) => this.nodes.get(nodeId)!.type as T
        )
      ),
    ];
  }

  /**
   * BFS up to depth k, optional type filter for the result set
   * @param id - the id of the node to get the extended relations for
   * @param depth - the depth of the walk
   * @param type - the type of the nodes to filter the result set by
   * @returns the current node and all its extended relations
   */
  walk<T extends NodeType, U extends NodeType>(
    id: NodeId<T>,
    depth = 1,
    type?: U
  ): Node<U>[] {
    const visitedNodes = new Set<NodeId<NodeType>>([id]);
    const foundNodes: Node<NodeType>[] = [];

    // [nodeId, depth]
    let queue: [NodeId<NodeType>, number][] = [[id, 0]];

    while (queue.length > 0) {
      const [current, currentDepth] = queue.shift()!;

      if (currentDepth >= depth) {
        continue;
      }

      const neighbors = this.adjacent.get(current) ?? new Set<NodeId<T>>();
      for (const neighbor of neighbors) {
        if (visitedNodes.has(neighbor)) {
          continue;
        }

        visitedNodes.add(neighbor);
        queue.push([neighbor, currentDepth + 1]);
        foundNodes.push(this.nodes.get(neighbor)!);
      }
    }

    return type
      ? (foundNodes.filter((n) => n.type === type) as Node<U>[])
      : (foundNodes as Node<U>[]);
  }

  /**
   * Removes a node and all its relations from the graph, cleaning up adjacency sets.
   * @param id - the id of the node to remove
   */
  removeNode(id: NodeId<NodeType>) {
    if (!this.nodes.has(id)) return;

    const neighbors = this.adjacent.get(id);
    if (neighbors) {
      for (const neighbor of neighbors) {
        this.edges.delete(makeCorrespondenceId(id, neighbor));

        const set = this.adjacent.get(neighbor);

        if (!set) {
          continue;
        }

        set.delete(id);
        if (set.size === 0) {
          this.adjacent.delete(neighbor);
        }
      }
    }

    this.adjacent.delete(id);
    this.nodes.delete(id);
  }

  addNumber({ number, nodeId }: { number: number; nodeId?: NodeId<NodeType> }) {
    const numberId = this.upsertNode(
      new BaseNode({
        id: number,
        type: NumerologyTypes.NUMBER,
      })
    );

    if (nodeId) {
      this.link(nodeId, numberId);
    }

    return numberId;
  }

  /**
   * Adds a sphere (sephirah) to the tree with its Hebrew and English names
   * @param sphere - the identifier for the sphere
   * @param data - the sphere's Hebrew and English names
   * @returns the sphere's id
   */
  addSphere({
    sphere,
    data,
    relatedNumber,
  }: {
    sphere: string;
    data: NodeData<KaabalahTypes.SPHERE>;
    relatedNumber: number;
  }) {
    const sphereId = this.upsertNode(
      new BaseNode({
        id: sphere,
        type: KaabalahTypes.SPHERE,
        data,
      })
    );

    this.addNumber({ number: relatedNumber, nodeId: sphereId });

    return sphereId;
  }

  /**
   * Adds a path between two spheres with its associated number
   * @param leftSphere - the id of the first sphere
   * @param rightSphere - the id of the second sphere
   * @param relatedNumber - the number associated with this path
   * @returns the path's id
   */
  addPath({
    leftSphere,
    rightSphere,
    relatedNumber,
    data,
  }: {
    leftSphere: NodeId<KaabalahTypes.SPHERE>;
    rightSphere: NodeId<KaabalahTypes.SPHERE>;
    relatedNumber: number;
    data?: Omit<NodeData<KaabalahTypes.PATH>, "from" | "to">;
  }) {
    const pathId = this.upsertNode(
      new BaseNode({
        id: relatedNumber,
        type: KaabalahTypes.PATH,
        data: {
          ...(data ?? {}),
          from: leftSphere,
          to: rightSphere,
        },
      })
    );

    // If we count the spheres too (10 of them), we'll have an index up to 32
    const numberOfSpheres = 10;
    const pathNumber = relatedNumber + numberOfSpheres;

    this.link(leftSphere, pathId);
    this.link(rightSphere, pathId);

    this.addNumber({ number: relatedNumber, nodeId: pathId });
    this.addNumber({ number: pathNumber, nodeId: pathId });

    return pathId;
  }

  addLetters({
    path,
    letters,
  }: {
    path: NodeId<KaabalahTypes.PATH>;
    letters: { letter: string; type: NodeType; data?: NodeData<NodeType> }[];
  }) {
    for (const letter of letters) {
      const letterId = this.upsertNode(
        new BaseNode({
          id: letter.letter,
          type: letter.type,
          data: letter.data,
        })
      );

      this.link(path, letterId);

      if (letter.type === LetterTypes.HEBREW_LETTER) {
        const data = letter.data as NodeData<LetterTypes.HEBREW_LETTER>;

        if (!data) {
          continue;
        }

        this.addNumber({ number: data.gematriaValue, nodeId: letterId });

        if (data.gematriaValueWhenEnding) {
          this.addNumber({
            number: data.gematriaValueWhenEnding,
            nodeId: letterId,
          });
        }
      }
    }
  }

  addWesternAstrologySign({
    spheres,
    path,
    house,
    planets,
    element,
    modality,
    sign,
    relatedNumber,
  }: {
    spheres: NodeId<KaabalahTypes.SPHERE>[];
    path: NodeId<KaabalahTypes.PATH>;
    house: NodeId<WesternAstrologyTypes.HOUSE>;
    planets: NodeId<WesternAstrologyTypes.PLANET>[];
    element: NodeId<WesternAstrologyTypes.WESTERN_ELEMENT>;
    modality: NodeId<WesternAstrologyTypes.MODALITIES>;
    sign: string;
    relatedNumber: number;
  }) {
    const signId = this.upsertNode(
      new BaseNode({
        id: sign,
        type: WesternAstrologyTypes.WESTERN_ZODIAC_SIGN,
      })
    );

    for (const sphere of spheres) {
      this.link(sphere, signId);
    }

    this.link(path, signId);

    this.link(house, signId);

    for (const planet of planets) {
      this.link(planet, signId);
    }

    this.addNumber({ number: relatedNumber, nodeId: signId });

    this.link(element, signId);
    this.link(modality, signId);

    return signId;
  }

  addTarotArkAnnu({
    node,
    tarotArkAnnu,
    data,
    relatedNumber,
    suit,
  }: {
    node: NodeId<NodeType>;
    tarotArkAnnu: string;
    data: NodeData<TarotTypes.TAROT_ARK_ANNU>;
    relatedNumber: number;
    suit?: string;
  }) {
    const tarotArkAnnuId = this.upsertNode(
      new BaseNode({
        id: tarotArkAnnu,
        type: TarotTypes.TAROT_ARK_ANNU,
        data,
      })
    );

    this.link(node, tarotArkAnnuId);

    this.addNumber({ number: relatedNumber, nodeId: tarotArkAnnuId });

    if (suit) {
      const suitValue = suit.includes(":") ? suit.split(":").pop()! : suit;
      const suitId = this.upsertNode(
        new BaseNode({
          id: suitValue,
          type: TarotTypes.TAROT_SUIT,
        })
      );

      this.link(tarotArkAnnuId, suitId);
    }

    return tarotArkAnnuId;
  }
}
