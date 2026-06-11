import { describe, expect, it } from "vitest";

import { getTreeTopology, id, KaabalahTypes } from "../core";
import {
  generateTreeSvg,
  getRouteActivations,
  getTreeLayout,
  getTreeRenderModel,
  TREE_PATH_IDS,
  TREE_SPHERE_IDS,
  TREE_SVG_DEFAULT_VIEWBOX,
  type TreePathId,
  type TreeSphereId,
  type TreeSphereName,
} from "./tree";

const sphereId = (name: TreeSphereName) =>
  id(KaabalahTypes.SPHERE, name) as TreeSphereId;
const pathId = (value: string) =>
  id(KaabalahTypes.PATH, value) as TreePathId;

const countMatches = (text: string, pattern: RegExp) =>
  text.match(pattern)?.length ?? 0;

describe("tree renderer layout", () => {
  it("returns the canonical default layout with stable ordering and counts", () => {
    const layout = getTreeLayout();

    expect(layout.system).toBe("kaabalah");
    expect(layout.viewBox).toEqual(TREE_SVG_DEFAULT_VIEWBOX);
    expect(layout.sphereOrder).toEqual(TREE_SPHERE_IDS);
    expect(layout.pathOrder).toEqual(TREE_PATH_IDS);
    expect(Object.keys(layout.percentages.spheres)).toHaveLength(11);
    expect(Object.keys(layout.percentages.paths)).toHaveLength(22);
  });

  it("characterizes the default coordinates for central-pillar spheres", () => {
    const layout = getTreeLayout();

    expect(layout.percentages.spheres[sphereId("Kether")]).toEqual({
      x: 49.94,
      y: 6.83,
    });
    expect(layout.percentages.spheres[sphereId("Tiphareth")]).toEqual({
      x: 49.94,
      y: 50.06,
    });
    expect(layout.percentages.spheres[sphereId("Malkuth")]).toEqual({
      x: 49.94,
      y: 93.2,
    });
    expect(layout.viewBoxUnits.spheres[sphereId("Malkuth")]).toEqual({
      x: 142.83,
      y: 522.85,
    });
  });

  it("keeps all layout coordinates finite", () => {
    const layout = getTreeLayout();
    const points = [
      ...Object.values(layout.percentages.spheres),
      ...Object.values(layout.viewBoxUnits.spheres),
      ...Object.values(layout.percentages.paths).flatMap((path) => [path.from, path.to]),
      ...Object.values(layout.viewBoxUnits.paths).flatMap((path) => [path.from, path.to]),
    ];

    for (const point of points) {
      expect(Number.isFinite(point.x)).toBe(true);
      expect(Number.isFinite(point.y)).toBe(true);
    }
  });

  it("preserves requested tree system without changing canonical visual geometry", () => {
    const defaultLayout = getTreeLayout();
    const hermeticLayout = getTreeLayout("hermetic-qabalah");

    expect(hermeticLayout.system).toBe("hermetic-qabalah");
    expect(hermeticLayout.sphereOrder).toEqual(defaultLayout.sphereOrder);
    expect(hermeticLayout.pathOrder).toEqual(defaultLayout.pathOrder);
    expect(hermeticLayout.percentages.spheres[sphereId("Kether")]).toEqual(
      defaultLayout.percentages.spheres[sphereId("Kether")]
    );
  });
});

describe("tree renderer model", () => {
  it("returns stable geometry, lookup maps, and layer order for defaults", () => {
    const model = getTreeRenderModel();

    expect(model.system).toBe("kaabalah");
    expect(model.scale).toBe(1);
    expect(model.layerOrder).toEqual(["background", "paths", "spheres", "hit-targets"]);
    expect(model.spheres).toHaveLength(11);
    expect(model.paths).toHaveLength(22);
    expect(model.sphereById[sphereId("Tiphareth")].geometry.viewBoxUnits.center).toEqual({
      x: 142.83,
      y: 280.84,
    });
    expect(model.pathById[pathId("1")].geometry.viewBoxUnits.anchor).toEqual({
      x: 195.34,
      y: 68.75,
      vertical: "below",
    });
  });

  it("marks only explicitly activated targets with normalized activation metadata", () => {
    const targetSphere = sphereId("Tiphareth");
    const targetPath = pathId("1");
    const model = getTreeRenderModel({
      activations: [
        { targetId: targetSphere, targetType: "sphere", count: 3, total: 6 },
        {
          targetId: targetPath,
          targetType: "path",
          count: 1,
          total: 4,
          state: "selected",
          color: "#ff00aa",
        },
      ],
    });

    expect(model.spheres.filter((sphere) => sphere.activation !== null)).toHaveLength(1);
    expect(model.paths.filter((path) => path.activation !== null)).toHaveLength(1);
    expect(model.sphereById[targetSphere].activation).toMatchObject({
      state: "active",
      count: 3,
      total: 6,
      strength: 0.5,
      visible: true,
      emphasis: 0.56,
    });
    expect(model.pathById[targetPath].activation).toMatchObject({
      state: "selected",
      count: 1,
      total: 4,
      strength: 0.25,
      displayColor: "#ff00aa",
      colorOverride: "#ff00aa",
      emphasis: 0.9,
    });
  });

  it("scales render geometry when callers provide a larger viewBox", () => {
    const model = getTreeRenderModel({
      viewBox: { minX: 10, minY: 20, width: 572, height: 1122 },
      daathLayer: "back",
    });

    expect(model.scale).toBe(2);
    expect(model.layerOrder).toEqual([
      "background",
      "spheres-behind-paths",
      "paths",
      "spheres",
      "hit-targets",
    ]);
    expect(model.sphereById[sphereId("Kether")].geometry.radius.viewBoxUnits).toBe(60);
    expect(model.sphereById[sphereId("Kether")].geometry.viewBoxUnits.center).toEqual({
      x: 295.66,
      y: 96.63,
    });
  });

  it("applies custom palette and highlight options to the render model", () => {
    const kether = sphereId("Kether");
    const firstPath = pathId("1");
    const model = getTreeRenderModel({
      palette: {
        defaultSphereFill: "#111111",
        defaultPathColor: "#222222",
        sphereFills: { [kether]: "#abcdef" },
        pathColors: { [firstPath]: "#123456" },
        specialSphereMode: "plain",
      },
      highlights: {
        paths: { [firstPath]: "#654321" },
      },
    });

    expect(model.sphereById[kether]).toMatchObject({
      canonicalColor: "#abcdef",
      displayFill: "#abcdef",
      material: {
        kind: "standard",
        preserveOnActivation: false,
      },
    });
    expect(model.pathById[firstPath]).toMatchObject({
      canonicalColor: "#123456",
      displayColor: "#654321",
    });
  });
});

describe("route activations", () => {
  it("converts the Lightning Path route into full-strength activations", () => {
    const topology = getTreeTopology();
    const route = topology.getRoute("lightning");
    if (!route) {
      throw new Error("Expected Lightning Path route to exist.");
    }

    const activations = getRouteActivations(route);
    const sphereActivations = activations.filter(
      (activation) => activation.targetType === "sphere"
    );
    const pathActivations = activations.filter(
      (activation) => activation.targetType === "path"
    );

    expect(sphereActivations).toHaveLength(10);
    expect(pathActivations.length).toBeGreaterThanOrEqual(1);
    expect(activations).toHaveLength(route.targets.length);
    expect(activations.every((activation) => activation.state === "active")).toBe(true);
    expect(activations.every((activation) => activation.count === 1)).toBe(true);
    expect(activations.every((activation) => activation.total === 1)).toBe(true);
  });

  it("applies shared route activation options to every target", () => {
    const topology = getTreeTopology();
    const route = topology.getRoute("lightning");
    if (!route) {
      throw new Error("Expected Lightning Path route to exist.");
    }

    const activations = getRouteActivations(route, {
      color: "#ffffff",
      state: "selected",
      strength: 0.5,
    });

    expect(activations).toHaveLength(route.targets.length);
    expect(
      activations.every(
        (activation) =>
          activation.color === "#ffffff"
          && activation.state === "selected"
          && activation.strength === 0.5
      )
    ).toBe(true);
  });

  it("feeds route activations into the render model without rebuilding target arrays", () => {
    const topology = getTreeTopology();
    const route = topology.getRoute("lightning");
    if (!route) {
      throw new Error("Expected Lightning Path route to exist.");
    }

    const activations = getRouteActivations(route);
    const model = getTreeRenderModel({ activations });
    const routeSphereIds = route.spheres.map((sphere) => sphere.id);

    expect(
      routeSphereIds.every(
        (targetId) => model.sphereById[targetId].activation?.state === "active"
      )
    ).toBe(true);
  });

  it("supports the Serpent route in the reverse sphere order", () => {
    const topology = getTreeTopology();
    const lightning = topology.getRoute("lightning");
    const serpent = topology.getRoute("serpent");
    if (!lightning || !serpent) {
      throw new Error("Expected Lightning Path and Serpent Path routes to exist.");
    }

    const lightningSphereIds = lightning.spheres.map((sphere) => sphere.id);
    const serpentSphereIds = serpent.spheres.map((sphere) => sphere.id);

    expect(getRouteActivations(serpent)).toHaveLength(serpent.targets.length);
    expect(serpentSphereIds).toEqual([...lightningSphereIds].reverse());
    expect(serpentSphereIds[0]).toBe(lightningSphereIds[lightningSphereIds.length - 1]);
  });
});

describe("tree renderer svg", () => {
  it("generates deterministic default SVG with all spheres and canonical path strokes", () => {
    const first = generateTreeSvg({ background: "transparent" });
    const second = generateTreeSvg({ background: "transparent" });

    expect(first).toBe(second);
    expect(first.startsWith(`<svg xmlns="http://www.w3.org/2000/svg"`)).toBe(true);
    expect(first).toContain(`viewBox="0 0 286 561"`);
    expect(countMatches(first, /<g id="sphere-/g)).toBe(11);
    expect(countMatches(first, /stroke-width="22" stroke-linecap="round"/g)).toBe(22);
    expect(first).not.toContain(`<rect x="0" y="0" width="286" height="561"`);
    expect(first.endsWith(`</svg>`)).toBe(true);
  });

  it("renders monochrome SVG with plain special spheres and caller dimensions", () => {
    const colorSvg = generateTreeSvg({ background: "transparent" });
    const monochromeSvg = generateTreeSvg({
      width: 572,
      height: 1122,
      background: "transparent",
      palette: "monochrome",
    });

    expect(monochromeSvg).not.toBe(colorSvg);
    expect(monochromeSvg).toContain(`width="572" height="1122"`);
    expect(monochromeSvg).toContain(`stroke="#2f271e"`);
    expect(monochromeSvg).toContain(`stroke="#e0d7ca"`);
    expect(monochromeSvg).toContain(`fill="#e6ddd0"`);
    expect(monochromeSvg).not.toContain(`<polygon points="`);
    expect(monochromeSvg).not.toContain(`transform="rotate(180`);
  });
});
