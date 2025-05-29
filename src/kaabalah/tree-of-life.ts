type NodeId = string;          // 'Kether', 'color:#ff0000', 'num:1', etc

export type NodeType = "sphere" | "path" | "world" | "number" | "planet" | "zodiacSign" | "element" | "color" | "majorArcana" | "minorArcana" | "daatRoyalship" | "musicalNote" | "hebrewLetter" | "latinLetter" | "sanskritLetter" | "archeometerLetter" | "chakra" | "subtleBody";

export type NodeData<NodeType> = NodeType extends "sphere" ? SphereData : NodeType extends "path" ? PathData : NodeType extends "world" ? WorldData : NodeType extends "hebrewLetter" ? HebrewLetterData : NodeType extends "color" ? ColorData : never;

interface Node<NodeType> {
  id: NodeId;
  type: NodeType;
  data?: NodeData<NodeType>;
}

interface HermeticQabalahSphereData {
  /**
   * In Atziluth
  */
  divineName: string;
  /**
   * In Briah
  */
  archangelicName: string;
  /**
   * In Yetzirah
  */
  angelicName: string;
  /**
   * In Assiah
  */
  mundaneName: string;
}

type SphereData = {
  hebrewName: string;
  englishName: string;
  number: number;
} & Partial<HermeticQabalahSphereData>;

interface PathData {
  // [counting only paths, counting paths and spheres]
  numbers: [number, number];
}

interface WorldData {
  element: "fire" | "air" | "water" | "earth";
  hebrewName: string;
  englishName: string;
}

interface HebrewLetterData {
  type: "mother" | "double" | "simple";
}

interface ColorData {
  colorDescription: string;
  colorNames: string[];
  colorHexCodes: string[];
}

/**
 * TreeOfLife represents a graph structure for mapping Kaabalah, Tarot, Astrology and other
 * esoteric correspondences. It can be used to create multiple independent instances
 * for different use cases or to isolate different sets of correspondences.
 */
export class TreeOfLife {
  private nodes = new Map<NodeId, Node<NodeType>>();
  private adjacent = new Map<NodeId, Set<NodeId>>();

  /**
   * Adds a node to the tree
   * @param node - the node to add
   * @returns the id of the added node
   */
  addNode<T extends NodeType>(node: Node<T>) { 
    this.nodes.set(node.id, node);

    return node.id;
  }

  /**
   * Links two nodes bi-directionally
   * @param firstNode - the id of the first node
   * @param secondNode - the id of the second node
   */
  link(firstNode: NodeId, secondNode: NodeId) {
    if (!this.nodes.has(firstNode) || !this.nodes.has(secondNode)) {
      throw new Error('unknown node id');
    }

    if (firstNode === secondNode) {
      return;
    }

    if (this.adjacent.has(firstNode) && this.adjacent.get(firstNode)?.has(secondNode)) {
      return;
    }

    const put = (leftNode: NodeId, rightNode: NodeId) => {
      const set = this.adjacent.get(leftNode) ?? new Set<NodeId>();
      set.add(rightNode);
      this.adjacent.set(leftNode, set);
    };

    put(firstNode, secondNode);
    put(secondNode, firstNode);
  }

  /**
   * Gets the current node and all its direct relations, or, when filtered by node type, only the direct relations of that type.
   * @param id - the id of the node to get the relations for
   * @param nodeType - the node type to filter the relations by
   * @returns the current node and all its direct relations
   */
  related(id: NodeId, nodeType?: NodeType): Node<NodeType>[] {
    if (!this.nodes.has(id)) {
      return [];
    }

    const node = this.nodes.get(id)!;

    const relations = this.adjacent.get(id);
    
    if (!relations) {
      return nodeType ? [] : [node];
    }

    const filteredRelations = [...relations].map(i => this.nodes.get(i)!).filter(n => !nodeType || n.type === nodeType);

    return nodeType ? filteredRelations : [node, ...filteredRelations];
  }

  /**
   * Gets all the types of nodes that are directly connected to the given node
   * @param id - the id of the node to get related types for
   * @returns array of node types that are directly connected
   */
  relatedTypes(id: NodeId): NodeType[] {
    if (!this.nodes.has(id)) {
      return [];
    }

    return [...new Set([...this.adjacent.get(id)!.values()].map(nodeId => this.nodes.get(nodeId)!.type))];
  }

  /**
   * BFS up to depth k, optional type filter for the result set
   * @param id - the id of the node to get the extended relations for
   * @param depth - the depth of the walk
   * @param type - the type of the nodes to filter the result set by
   * @returns the current node and all its extended relations
   */
  walk(id: NodeId, depth = 1, type?: NodeType): Node<NodeType>[] {
    const visitedNodes = new Set<NodeId>([id]);
    const foundNodes: Node<NodeType>[] = [];

    // [nodeId, depth]
    let queue: [NodeId, number][] = [[id, 0]];

    while (queue.length > 0) {
      const [current, currentDepth] = queue.shift()!;

      if (currentDepth >= depth) {
        continue;
      }

      const neighbors = this.adjacent.get(current) ?? new Set<NodeId>();
      for (const neighbor of neighbors) {
        if (visitedNodes.has(neighbor)) {
          continue;
        }

        visitedNodes.add(neighbor);
        foundNodes.push(this.nodes.get(neighbor)!);
        queue.push([neighbor, currentDepth + 1]);
      }
    }

    return type ? foundNodes.filter(n => n.type === type) : foundNodes;
  }

  /**
   * Removes a node and all its relations from the graph, cleaning up adjacency sets.
   * @param id - the id of the node to remove
   */
  removeNode(id: NodeId) {
    if (!this.nodes.has(id)) return;

    const neighbors = this.adjacent.get(id);
    if (neighbors) {
      for (const neighbor of neighbors) {
        const set = this.adjacent.get(neighbor);

        if (!set) {
          continue;
        }
        
        set.delete(id);
        if (set.size === 0) {
          this.adjacent.delete(neighbor);
        } else {
          this.adjacent.set(neighbor, set);
        }
      }
    }

    this.adjacent.delete(id);
    this.nodes.delete(id);
  }

  /**
   * A helper to create two-way correspondences between nodes.
   * @param source - the source node
   * @param target - the target node
   * @param targetType - the type of the target node
   * @returns the target node
   */
  correspond<T extends NodeType>(source: NodeId, target: NodeId, targetType: T, data?: NodeData<T>) {
    if (!this.nodes.has(target)) {
      const node = data ? { id: target, type: targetType, data } : { id: target, type: targetType };

      this.addNode<T>(node);
    }

    this.link(source, target);

    return target;
  }

  /**
   * Adds a sphere (sephirah) to the tree with its Hebrew and English names
   * @param id - the identifier for the sphere
   * @param data - the sphere's Hebrew and English names
   * @returns the sphere's id
   */
  addSphere(id: NodeId, data: NodeData<"sphere">) {
    if (this.nodes.has(id)) {
      return id;
    }

    this.addNode<"sphere">({ id, type: "sphere", data });

    const numberId = `num:${data.number}`;

    if (!this.nodes.has(numberId)) {
      this.addNode<"number">({ id: numberId, type: "number" });
    }

    this.link(id, numberId);

    return id;
  }

  /**
   * Adds a path between two spheres with its associated number
   * @param leftSphere - the id of the first sphere
   * @param rightSphere - the id of the second sphere
   * @param relatedNumber - the number associated with this path
   * @returns the path's id
   */
  addPath(leftSphere: NodeId, rightSphere: NodeId, relatedNumber: number) {
    const pathId = `path:${relatedNumber}`;

    if (this.nodes.has(pathId)) {
      return pathId;
    }

    // If we count the spheres too (10 of them), we'll have an index up to 32
    const numberOfSpheres = 10;
    const pathNumber = relatedNumber + numberOfSpheres;

    this.addNode<"path">({ id: pathId, type: "path", data: { numbers: [relatedNumber, pathNumber] }});

    this.link(leftSphere, pathId);
    this.link(rightSphere, pathId);

    const firstNumberId = `num:${relatedNumber}`;
    const secondNumberId = `num:${pathNumber}`;

    if (!this.nodes.has(firstNumberId)) {
      this.addNode<"number">({ id: firstNumberId, type: "number" });
    }

    if (!this.nodes.has(secondNumberId)) {
      this.addNode<"number">({ id: secondNumberId, type: "number" });
    }
    
    this.link(pathId, firstNumberId);
    this.link(pathId, secondNumberId);

    return pathId;
  }

  addWorld(id: NodeId, data: NodeData<"world">) {
    const worldId = `world:${id}`;

    if (this.nodes.has(worldId)) {
      return worldId;
    }

    this.addNode<"world">({ id: worldId, type: "world", data });

    return worldId;
  }

  addSphereColor(sphere: NodeId, color: string, data: NodeData<"color">, world?: string) {
    const colorId = `color:${color}`;

    this.correspond(sphere, colorId, "color", data);

    if (world) {
      this.link(`world:${world}`, colorId);
    }
    
    return colorId;
  }
}