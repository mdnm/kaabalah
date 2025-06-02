import { PartKey } from "./systems/registry";

import { Node, NodeData, NodeId, NodeType, WESTERN_ELEMENTS } from "./constants";
import { ModuleManager } from "./systems/module-manager";
import { SystemKey } from "./systems/registry";

/**
 * TreeOfLife represents a graph structure for mapping Kaabalah, Tarot, Astrology and other
 * esoteric correspondences. It can be used to create multiple independent instances
 * for different use cases or to isolate different sets of correspondences.
 */
export class TreeOfLife {
  private nodes = new Map<string, Node<NodeType>>();
  private adjacent = new Map<string, Set<string>>();
  private modules = new ModuleManager(this);

  public activeSystem: SystemKey | null = this.modules.getActiveSystem();

  /**
   * Loads the tree of life system to be used
   * @param systemKey - the key of the system to load
   */
  loadSystem(systemKey: SystemKey) { this.modules.loadSystem(systemKey) }

  /**
   * Loads a part of a system into the tree of life
   * @param partKey - the key of the part to load
   */
  loadPart  (partKey: PartKey)     { this.modules.loadPart(partKey) }

  /**
   * Unloads the tree of life system and all its parts
   */
  unloadSystem()                   { this.modules.unloadSystem() }

  listAvailableParts() {
    return this.modules.listAvailableParts();
  }

  listLoadedParts() {
    return this.modules.listLoadedParts();
  }

  listAvailableBridges() {
    return this.modules.listAvailableBridges();
  }

  listBridgedParts() {
    return this.modules.listBridgedParts();
  }

  /**
   * Adds a node to the tree
   * @param node - the node to add
   * @returns the id of the added node
   */
  addNode<T extends NodeType>(node: Node<T>) { 
    this.nodes.set(node.id, node);

    return node.id;
  }

  getNode(id: NodeId) {
    return this.nodes.get(id);
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
   * @param sphere - the identifier for the sphere
   * @param data - the sphere's Hebrew and English names
   * @returns the sphere's id
   */
  addSphere(sphere: string, data: NodeData<"sphere">, relatedNumber: number) {
    if (this.nodes.has(sphere)) {
      return sphere;
    }

    this.addNode<"sphere">({ id: sphere, type: "sphere", data });

    const numberId: NodeId = `num:${relatedNumber}`;

    if (!this.nodes.has(numberId)) {
      this.addNode<"number">({ id: numberId, type: "number" });
    }

    this.link(sphere, numberId);

    return sphere;
  }

  /**
   * Adds a path between two spheres with its associated number
   * @param leftSphere - the id of the first sphere
   * @param rightSphere - the id of the second sphere
   * @param relatedNumber - the number associated with this path
   * @returns the path's id
   */
  addPath(leftSphere: NodeId, rightSphere: NodeId, relatedNumber: number, data?: Partial<NodeData<"path">>) {
    const pathId: NodeId = `path:${relatedNumber}`;

    if (this.nodes.has(pathId)) {
      return pathId;
    }

    // If we count the spheres too (10 of them), we'll have an index up to 32
    const numberOfSpheres = 10;
    const pathNumber = relatedNumber + numberOfSpheres;

    this.addNode<"path">({ id: pathId, type: "path", data });

    this.link(leftSphere, pathId);
    this.link(rightSphere, pathId);

    const firstNumberId: NodeId = `num:${relatedNumber}`;
    const secondNumberId: NodeId = `num:${pathNumber}`;

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

  addLetters(path: NodeId, letters: { letter: string, type: NodeType, data?: NodeData<NodeType> }[]) {
    for (const letter of letters) {
      const letterId: NodeId = `letter:${letter.letter}`;

      this.correspond(path, letterId, letter.type, letter.data);

      if (letter.type === "hebrewLetter") {
        const data = letter.data as NodeData<"hebrewLetter">;
        const gematriaValues = [data.gematriaValue, data.gematriaValueWhenEnding].filter(Boolean) as number[];

        for (const gematriaValue of gematriaValues) {
          if (!this.nodes.has(`num:${gematriaValue}`)) {
            this.addNode<"number">({ id: `num:${gematriaValue}`, type: "number" });
          }

          this.link(letterId, `num:${gematriaValue}`);
        }
      }
    }
  }

  addWorld(world: string, data: NodeData<"world">) {
    if (this.nodes.has(world)) {
      return world;
    }

    this.addNode<"world">({ id: world, type: "world", data });

    return world;
  }

  addSphereColor(sphere: NodeId, color: string, data: NodeData<"color">, world?: string) {
    const colorId: NodeId = `color:${color}`;

    this.correspond(sphere, colorId, "color", data);

    if (world) {
      this.link(world, colorId);
    }
    
    return colorId;
  }

  addPathColor(path: NodeId, color: string, data: NodeData<"color">) {
    const colorId: NodeId = `color:${color}`;

    this.correspond(path, colorId, "color", data);

    return colorId;
  }

  addMusicalNote(sphere: NodeId, note: string, data: NodeData<"musicalNote">) {
    const noteId: NodeId = `note:${note}`;

    this.correspond(sphere, noteId, "musicalNote", data);

    return noteId;
  }

  addWesternAstrologyPlanet(sphereOrPath: NodeId, planet: string, data?: NodeData<"planet">) {
    const planetId: NodeId = `planet:${planet}`;

    this.correspond(sphereOrPath, planetId, "planet", data);

    return planetId;
  }

  addWesternAstrologySign(path: NodeId, sign: string, data: NodeData<"westernZodiacSign">, relatedNumber: number) {
    const signId: NodeId = `westernZodiacSign:${sign}`;

    this.correspond(path, signId, "westernZodiacSign", data);

    const numberId: NodeId = `num:${relatedNumber}`;
    if (!this.nodes.has(numberId)) {
      this.addNode<"number">({ id: numberId, type: "number" });
    }
    this.link(signId, numberId);

    if (data.element) {
      const elementId: NodeId = `westernElement:${data.element}`;
      if (!this.nodes.has(elementId)) {
        this.addNode<"westernElement">({ id: elementId, type: "westernElement" });
      }
      this.link(signId, elementId);
    }

    return signId;
  }

  addWesternElement(path: NodeId, element: string, data?: NodeData<"westernElement">) {
    const elementId: NodeId = `westernElement:${element}`;

    if (this.nodes.has(elementId)) {
      return elementId;
    }

    this.correspond(path, elementId, "westernElement", data);

    return elementId;
  }
  
  addTarotArkAnnu(sphereOrPath: NodeId, tarotArkAnnu: string, data: NodeData<"tarotArkAnnu">, relatedNumber: number, suit?: string) {
    if (this.nodes.has(tarotArkAnnu)) {
      return tarotArkAnnu;
    }

    this.correspond(sphereOrPath, tarotArkAnnu, "tarotArkAnnu", data);

    const numberId: NodeId = `num:${relatedNumber}`;
    if (!this.nodes.has(numberId)) {
      this.addNode<"number">({ id: numberId, type: "number" });
    }
    this.link(tarotArkAnnu, numberId);

    if (suit) {
      this.link(tarotArkAnnu, `suit:${suit}`);
    }

    return tarotArkAnnu;
  }

  addTarotSuit(suit: string, relatedElement: Exclude<typeof WESTERN_ELEMENTS[keyof typeof WESTERN_ELEMENTS], "Ether">) {
    const suitId: NodeId = `suit:${suit}`;

    if (this.nodes.has(suitId)) {
      return suitId;
    }

    this.addNode<"tarotSuit">({ id: suitId, type: "tarotSuit" });

    const elementId: NodeId = `westernElement:${relatedElement}`;
    if (!this.nodes.has(elementId)) {
      this.addNode<"westernElement">({ id: elementId, type: "westernElement" });
    }

    this.link(suitId, `westernElement:${relatedElement}`);

    return suitId;
  }
}