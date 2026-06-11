import { SPHERES } from "./constants";
import { createTree } from "./factory";
import { SystemKey } from "./systems/registry";
import {
  id,
  KaabalahTypes,
  Node,
  NodeData,
  NodeId,
  NodeType,
  parseId,
} from "./types";
import { TreeOfLife } from "./tree-of-life";

export type TreeTopologySphereName =
  (typeof TREE_TOPOLOGY_SPHERE_NAMES)[number];
export type TreeTopologySphereId = NodeId<KaabalahTypes.SPHERE>;
export type TreeTopologyPathId = NodeId<KaabalahTypes.PATH>;
export type TreeTopologySphereRole = "sephirah" | "hidden";
export type TreeTopologyRouteKey = "lightning" | "serpent";
export type TreeTopologyRouteDirection = "descending" | "ascending";

export const TREE_TOPOLOGY_SPHERE_NAMES = [
  SPHERES.KETHER,
  SPHERES.CHOKHMAH,
  SPHERES.BINAH,
  SPHERES.DAATH,
  SPHERES.CHESED,
  SPHERES.GEBURAH,
  SPHERES.TIPHARETH,
  SPHERES.NETZACH,
  SPHERES.HOD,
  SPHERES.YESOD,
  SPHERES.MALKUTH,
] as const;

export const TREE_TOPOLOGY_SPHERE_IDS = TREE_TOPOLOGY_SPHERE_NAMES.map(
  (name) => id(KaabalahTypes.SPHERE, name)
) as readonly TreeTopologySphereId[];

export const TREE_TOPOLOGY_PATH_IDS = Array.from(
  { length: 22 },
  (_, index) => id(KaabalahTypes.PATH, index + 1)
) as readonly TreeTopologyPathId[];

const TREE_TOPOLOGY_SPHERE_NUMBERS = {
  [SPHERES.KETHER]: 1,
  [SPHERES.CHOKHMAH]: 2,
  [SPHERES.BINAH]: 3,
  [SPHERES.DAATH]: 11,
  [SPHERES.CHESED]: 4,
  [SPHERES.GEBURAH]: 5,
  [SPHERES.TIPHARETH]: 6,
  [SPHERES.NETZACH]: 7,
  [SPHERES.HOD]: 8,
  [SPHERES.YESOD]: 9,
  [SPHERES.MALKUTH]: 10,
} as const satisfies Record<TreeTopologySphereName, number>;

export const TREE_TOPOLOGY_LIGHTNING_SPHERE_NAMES = [
  SPHERES.KETHER,
  SPHERES.CHOKHMAH,
  SPHERES.BINAH,
  SPHERES.CHESED,
  SPHERES.GEBURAH,
  SPHERES.TIPHARETH,
  SPHERES.NETZACH,
  SPHERES.HOD,
  SPHERES.YESOD,
  SPHERES.MALKUTH,
] as const satisfies readonly TreeTopologySphereName[];

export interface TreeTopologySphere {
  id: TreeTopologySphereId;
  name: TreeTopologySphereName;
  number: number;
  role: TreeTopologySphereRole;
  data?: NodeData<KaabalahTypes.SPHERE>;
}

export interface TreeTopologyPath {
  id: TreeTopologyPathId;
  number: number;
  from: TreeTopologySphere;
  to: TreeTopologySphere;
  data: NodeData<KaabalahTypes.PATH>;
}

export interface TreeTopologyAdjacentSphere {
  sphere: TreeTopologySphere;
  path: TreeTopologyPath;
  direction: "forward" | "reverse";
}

export interface TreeTopologyRouteSegment {
  index: number;
  from: TreeTopologySphere;
  to: TreeTopologySphere;
  path?: TreeTopologyPath;
  isConnected: boolean;
}

export interface TreeTopologyRouteTarget {
  targetId: TreeTopologySphereId | TreeTopologyPathId;
  targetType: "sphere" | "path";
}

export interface TreeTopologyRoute {
  key: TreeTopologyRouteKey;
  name: string;
  direction: TreeTopologyRouteDirection;
  spheres: readonly TreeTopologySphere[];
  segments: readonly TreeTopologyRouteSegment[];
  isFullyConnected: boolean;
  missingSegments: readonly TreeTopologyRouteSegment[];
  targets: readonly TreeTopologyRouteTarget[];
  targetIds: readonly (TreeTopologySphereId | TreeTopologyPathId)[];
}

export type TreeTopologySphereLookup =
  | TreeTopologySphereName
  | TreeTopologySphereId
  | {
      id?: TreeTopologySphereId;
      name?: TreeTopologySphereName | string;
      number?: number;
    };

export type TreeTopologyPathLookup =
  | number
  | TreeTopologyPathId
  | {
      id?: TreeTopologyPathId;
      number?: number;
      between?: readonly [TreeTopologySphereLookup, TreeTopologySphereLookup];
    };

export interface TreeTopologyOptions {
  system?: SystemKey;
  tree?: TreeOfLife;
}

export interface GetTreeTopologySpheresOptions {
  includeDaath?: boolean;
}

const topologyCache = new Map<string, TreeTopology>();

function isNodeType<T extends NodeType>(
  node: Node<NodeType>,
  type: T
): node is Node<T> {
  return node.type === type;
}

function cloneSphereData(data?: NodeData<KaabalahTypes.SPHERE>) {
  return data ? { ...data } : undefined;
}

function clonePathData(data: NodeData<KaabalahTypes.PATH>) {
  return { ...data };
}

function parsePathNumber(pathId: TreeTopologyPathId) {
  const parsed = Number.parseInt(parseId(pathId), 10);

  if (!Number.isInteger(parsed)) {
    throw new Error(`Invalid tree path id: ${pathId}`);
  }

  return parsed;
}

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

function pairKey(left: TreeTopologySphereId, right: TreeTopologySphereId) {
  return [String(left), String(right)].sort().join("|");
}

function routeNames() {
  return [...TREE_TOPOLOGY_LIGHTNING_SPHERE_NAMES];
}

function routeDescriptor(key: TreeTopologyRouteKey) {
  return key === "lightning"
    ? {
        name: "Lightning Path",
        direction: "descending" as const,
      }
    : {
        name: "Serpent Path",
        direction: "ascending" as const,
      };
}

function routeTargetList(segments: readonly TreeTopologyRouteSegment[]) {
  if (segments.length === 0) {
    return [] as TreeTopologyRouteTarget[];
  }

  const targets: TreeTopologyRouteTarget[] = [
    { targetId: segments[0].from.id, targetType: "sphere" },
  ];

  for (const segment of segments) {
    if (segment.path) {
      targets.push({ targetId: segment.path.id, targetType: "path" });
    }

    targets.push({ targetId: segment.to.id, targetType: "sphere" });
  }

  return targets;
}

export class TreeTopology {
  public readonly system: SystemKey;

  private readonly spheres: readonly TreeTopologySphere[];
  private readonly paths: readonly TreeTopologyPath[];
  private readonly spheresById = new Map<
    TreeTopologySphereId,
    TreeTopologySphere
  >();
  private readonly spheresByName = new Map<string, TreeTopologySphere>();
  private readonly spheresByNumber = new Map<number, TreeTopologySphere>();
  private readonly pathsById = new Map<TreeTopologyPathId, TreeTopologyPath>();
  private readonly pathsByNumber = new Map<number, TreeTopologyPath>();
  private readonly pathsBySpherePair = new Map<string, TreeTopologyPath>();
  private readonly pathsBySphereId = new Map<TreeTopologySphereId, TreeTopologyPath[]>();
  private readonly routesByKey = new Map<
    TreeTopologyRouteKey,
    TreeTopologyRoute
  >();

  constructor({
    system,
    spheres,
    paths,
  }: {
    system: SystemKey;
    spheres: readonly TreeTopologySphere[];
    paths: readonly TreeTopologyPath[];
  }) {
    this.system = system;
    this.spheres = spheres.map((sphere) =>
      Object.freeze({
        ...sphere,
        data: cloneSphereData(sphere.data),
      })
    );

    for (const sphere of this.spheres) {
      this.spheresById.set(sphere.id, sphere);
      this.spheresByName.set(normalizeName(sphere.name), sphere);
      this.spheresByNumber.set(sphere.number, sphere);
    }

    this.paths = paths.map((path) => {
      const from = this.spheresById.get(path.from.id);
      const to = this.spheresById.get(path.to.id);

      if (!from || !to) {
        throw new Error(
          `Tree topology path ${path.id} references unknown spheres.`
        );
      }

      return Object.freeze({
        ...path,
        from,
        to,
        data: clonePathData(path.data),
      });
    });

    for (const path of this.paths) {
      this.pathsById.set(path.id, path);
      this.pathsByNumber.set(path.number, path);
      this.pathsBySpherePair.set(pairKey(path.from.id, path.to.id), path);

      for (const sphereId of [path.from.id, path.to.id]) {
        const spherePaths = this.pathsBySphereId.get(sphereId) ?? [];
        spherePaths.push(path);
        this.pathsBySphereId.set(sphereId, spherePaths);
      }
    }

    for (const key of ["lightning", "serpent"] as const) {
      this.routesByKey.set(key, this.buildRoute(key));
    }
  }

  getSpheres(options: GetTreeTopologySpheresOptions = {}) {
    const includeDaath = options.includeDaath ?? true;

    return includeDaath
      ? [...this.spheres]
      : this.spheres.filter((sphere) => sphere.name !== SPHERES.DAATH);
  }

  getPrimarySpheres() {
    return this.getSpheres({ includeDaath: false });
  }

  getSphere(lookup: TreeTopologySphereLookup) {
    if (typeof lookup === "string") {
      if (lookup.startsWith(`${KaabalahTypes.SPHERE}:`)) {
        return this.spheresById.get(lookup as TreeTopologySphereId);
      }

      return this.spheresByName.get(normalizeName(lookup));
    }

    if (lookup.id) {
      return this.spheresById.get(lookup.id);
    }

    if (lookup.number) {
      return this.spheresByNumber.get(lookup.number);
    }

    if (lookup.name) {
      return this.spheresByName.get(normalizeName(lookup.name));
    }

    return undefined;
  }

  getPaths() {
    return [...this.paths];
  }

  getPath(lookup: TreeTopologyPathLookup) {
    if (typeof lookup === "number") {
      return this.pathsByNumber.get(lookup);
    }

    if (typeof lookup === "string") {
      return this.pathsById.get(lookup as TreeTopologyPathId);
    }

    if (lookup.id) {
      return this.pathsById.get(lookup.id);
    }

    if (lookup.number) {
      return this.pathsByNumber.get(lookup.number);
    }

    if (lookup.between) {
      return this.getPathBetween(lookup.between[0], lookup.between[1]);
    }

    return undefined;
  }

  getPathBetween(
    first: TreeTopologySphereLookup,
    second: TreeTopologySphereLookup
  ) {
    const firstSphere = this.getSphere(first);
    const secondSphere = this.getSphere(second);

    if (!firstSphere || !secondSphere) {
      return undefined;
    }

    return this.pathsBySpherePair.get(pairKey(firstSphere.id, secondSphere.id));
  }

  getAdjacentSpheres(
    sphereLookup: TreeTopologySphereLookup
  ): TreeTopologyAdjacentSphere[] {
    const sphere = this.getSphere(sphereLookup);

    if (!sphere) {
      return [];
    }

    return (this.pathsBySphereId.get(sphere.id) ?? [])
      .map((path) => {
        const isForward = path.from.id === sphere.id;

        return {
          sphere: isForward ? path.to : path.from,
          path,
          direction: isForward ? "forward" : "reverse",
        };
      });
  }

  getRoutes() {
    return [...this.routesByKey.values()];
  }

  getRoute(key: TreeTopologyRouteKey) {
    return this.routesByKey.get(key);
  }

  nextInRoute(
    routeKey: TreeTopologyRouteKey,
    sphereLookup: TreeTopologySphereLookup
  ) {
    const route = this.getRoute(routeKey);
    const sphere = this.getSphere(sphereLookup);

    if (!route || !sphere) {
      return undefined;
    }

    const index = route.spheres.findIndex(
      (routeSphere) => routeSphere.id === sphere.id
    );

    return index >= 0 ? route.spheres[index + 1] : undefined;
  }

  previousInRoute(
    routeKey: TreeTopologyRouteKey,
    sphereLookup: TreeTopologySphereLookup
  ) {
    const route = this.getRoute(routeKey);
    const sphere = this.getSphere(sphereLookup);

    if (!route || !sphere) {
      return undefined;
    }

    const index = route.spheres.findIndex(
      (routeSphere) => routeSphere.id === sphere.id
    );

    return index > 0 ? route.spheres[index - 1] : undefined;
  }

  private buildRoute(key: TreeTopologyRouteKey): TreeTopologyRoute {
    const descriptor = routeDescriptor(key);
    const names = routeNames();
    const orderedNames = key === "serpent" ? names.reverse() : names;
    const spheres = orderedNames.map((name) => {
      const sphere = this.getSphere(name);

      if (!sphere) {
        throw new Error(
          `Tree topology route "${key}" references missing sphere "${name}" in ${this.system}.`
        );
      }

      return sphere;
    });
    const segments: TreeTopologyRouteSegment[] = [];

    for (let index = 0; index < spheres.length - 1; index++) {
      const from = spheres[index];
      const to = spheres[index + 1];
      const path = this.getPathBetween(from.name, to.name);

      segments.push({
        index,
        from,
        to,
        path,
        isConnected: Boolean(path),
      });
    }

    const targets = routeTargetList(segments);
    const missingSegments = segments.filter((segment) => !segment.isConnected);

    return Object.freeze({
      key,
      name: descriptor.name,
      direction: descriptor.direction,
      spheres: Object.freeze([...spheres]),
      segments: Object.freeze(segments),
      isFullyConnected: missingSegments.length === 0,
      missingSegments: Object.freeze(missingSegments),
      targets: Object.freeze(targets),
      targetIds: Object.freeze(targets.map((target) => target.targetId)),
    });
  }
}

export function getTreeTopology(options: TreeTopologyOptions = {}) {
  const system = options.system ?? options.tree?.activeSystem ?? "kaabalah";
  if (!options.tree) {
    const cached = topologyCache.get(system);
    if (cached) return cached;
  }

  const tree = options.tree ?? createTree({ system });
  const spheres: TreeTopologySphere[] = [];

  for (const sphereId of TREE_TOPOLOGY_SPHERE_IDS) {
    const sphereNode = tree.getNode(sphereId);

    if (!sphereNode) {
      continue;
    }

    const name = parseId(sphereId) as TreeTopologySphereName;

    spheres.push({
      id: sphereId,
      name,
      number: TREE_TOPOLOGY_SPHERE_NUMBERS[name],
      role: name === SPHERES.DAATH ? "hidden" : "sephirah",
      data: cloneSphereData(sphereNode.data),
    });
  }

  const spheresById = new Map(spheres.map((sphere) => [sphere.id, sphere]));
  const paths = tree
    .getNodes()
    .filter((node): node is Node<KaabalahTypes.PATH> =>
      isNodeType(node, KaabalahTypes.PATH)
    )
    .map((pathNode) => {
      if (!pathNode.data?.from || !pathNode.data?.to) {
        throw new Error(`Tree topology path ${pathNode.id} is missing endpoints.`);
      }

      const from = spheresById.get(pathNode.data.from);
      const to = spheresById.get(pathNode.data.to);

      if (!from || !to) {
        throw new Error(
          `Tree topology path ${pathNode.id} references unknown spheres.`
        );
      }

      return {
        id: pathNode.id,
        number: parsePathNumber(pathNode.id),
        from,
        to,
        data: clonePathData(pathNode.data),
      } satisfies TreeTopologyPath;
    })
    .sort((left, right) => left.number - right.number);

  const topology = new TreeTopology({
    system,
    spheres,
    paths,
  });

  if (!options.tree) {
    topologyCache.set(system, topology);
  }

  return topology;
}
