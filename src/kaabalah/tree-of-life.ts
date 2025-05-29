type NodeId = string;          // 'keter', 'color:#ff0000'

type NodeType = "sphere" | "path" | "number" | "planet" | "zodiacSign" | "element" | "color" | "majorArcana" | "minorArcana" | "daatRoyalship" | "musicalNote" | "hebrewLetter" | "latinLetter" | "sanskritLetter" | "archeometerLetter" | "chakra" | "subtleBody";

interface Node {
  id: NodeId;
  type: NodeType;
  data?: Record<string, any>;
}

interface SphereData {
  hebrewName: string;
  englishName: string;
}

export class TreeOfLife {
  private nodes = new Map<NodeId, Node>();
  private adjacent = new Map<NodeId, Set<NodeId>>();

  private addNode(node: Node) { 
    this.nodes.set(node.id, node);

    return node.id;
  }

  private link(firstNode: NodeId, secondNode: NodeId) {
    if (!this.nodes.has(firstNode) || !this.nodes.has(secondNode)) {
      throw new Error('unknown node id');
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
  related(id: NodeId, nodeType?: NodeType): Node[] {
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
  walk(id: NodeId, depth = 1, type?: NodeType): Node[] {
    const visitedNodes = new Set<NodeId>([id]);
    const foundNodes: Node[] = [];

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
  correspond(source: NodeId, target: NodeId, targetType: NodeType) {
    if (!this.nodes.has(target)) {
      this.addNode({ id: target, type: targetType });
    }

    this.link(source, target);

    return target;
  }

  addSphere(id: NodeId, data: SphereData) {
    this.addNode({ id, type: "sphere", data });

    return id;
  }

  addPath(leftSphere: NodeId, rightSphere: NodeId, relatedNumber: number) {
    const pathId = this.addNode({ id: `path${relatedNumber}`, type: "path", data: { number: relatedNumber }});

    this.link(leftSphere, pathId);
    this.link(rightSphere, pathId);

    const numberId = this.addNode({ id: `num:${relatedNumber}`, type: "number" });

    this.link(pathId, numberId);

    return pathId;
  }
}

const CONSTANTS = {
  KETHER: "Kether",
  CHOKMAH: "Chokmah",
  BINAH: "Binah",
  DAATH: "Daath",
  CHESED: "Chesed",
  GEBURAH: "Geburah",
  TIPHERETH: "Tiphereth",
  NETZACH: "Netzach",
  HOD: "Hod",
  YESOD: "Yesod",
  MALKUTH: "Malkuth",
}