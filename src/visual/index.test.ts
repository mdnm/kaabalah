import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import { id, KaabalahTypes } from "../core";
import {
  generateTreeSvg,
  getTreeLayout,
  TREE_PATH_IDS,
  TREE_SPHERE_IDS,
  TREE_SVG_DEFAULT_VIEWBOX,
} from "./index";

describe("tree svg visual module", () => {
  it("exports the canonical grid as percentages and default viewBox units", () => {
    const layout = getTreeLayout();

    expect(layout.viewBox).toEqual(TREE_SVG_DEFAULT_VIEWBOX);
    expect(layout.sphereOrder).toEqual(TREE_SPHERE_IDS);
    expect(layout.pathOrder).toEqual(TREE_PATH_IDS);
    expect(Object.keys(layout.percentages.spheres)).toHaveLength(11);
    expect(Object.keys(layout.percentages.paths)).toHaveLength(22);

    expect(layout.percentages.spheres[id(KaabalahTypes.SPHERE, "Kether")]).toEqual({
      x: 49.94,
      y: 6.83,
    });
    expect(layout.percentages.spheres[id(KaabalahTypes.SPHERE, "Malkuth")]).toEqual({
      x: 49.94,
      y: 93.2,
    });

    expect(layout.viewBoxUnits.spheres[id(KaabalahTypes.SPHERE, "Kether")]).toEqual({
      x: 142.83,
      y: 38.32,
    });
    expect(layout.viewBoxUnits.spheres[id(KaabalahTypes.SPHERE, "Chokhmah")]).toEqual({
      x: 247.85,
      y: 99.18,
    });

    expect(layout.percentages.paths[id(KaabalahTypes.PATH, "1")]).toEqual({
      fromId: id(KaabalahTypes.SPHERE, "Kether"),
      toId: id(KaabalahTypes.SPHERE, "Chokhmah"),
      from: { x: 49.94, y: 6.83 },
      to: { x: 86.66, y: 17.68 },
    });
    expect(layout.percentages.paths[id(KaabalahTypes.PATH, "22")]).toEqual({
      fromId: id(KaabalahTypes.SPHERE, "Yesod"),
      toId: id(KaabalahTypes.SPHERE, "Malkuth"),
      from: { x: 49.94, y: 71.68 },
      to: { x: 49.94, y: 93.2 },
    });
  });

  it("renders a transparent monochrome svg without a background rect", () => {
    const svg = generateTreeSvg({
      background: "transparent",
      palette: "monochrome",
    });

    expect(svg.startsWith(`<svg xmlns="http://www.w3.org/2000/svg"`)).toBe(true);
    expect(svg).toContain(`viewBox="0 0 286 561"`);
    expect(svg).toContain(`<g id="paths">`);
    expect(svg).toContain(`<g id="spheres">`);
    expect(svg).toContain(`stroke="#2f271e"`);
    expect(svg).toContain(`stroke="#e0d7ca"`);
    expect(svg).toContain(`fill="#e6ddd0"`);
    expect(svg).not.toContain(`<rect x="0" y="0" width="286" height="561"`);
    expect(svg).not.toContain(`transform="rotate(180`);
    expect(svg).not.toContain(`<polygon points="`);
    expect(svg.endsWith(`</svg>`)).toBe(true);
  });

  it("can render Daath behind the paths while keeping a topmost hit target", () => {
    const svg = generateTreeSvg({
      background: "transparent",
      daathLayer: "back",
    });

    const daathSphereIndex = svg.indexOf(`<g id="sphere-daath"`);
    const pathsIndex = svg.indexOf(`<g id="paths">`);
    const spheresIndex = svg.indexOf(`<g id="spheres">`);
    const daathHitAreaIndex = svg.indexOf(`id="sphere-daath-hit-area"`);

    expect(svg).toContain(`<g id="spheres-behind-paths">`);
    expect(daathSphereIndex).toBeGreaterThan(-1);
    expect(pathsIndex).toBeGreaterThan(daathSphereIndex);
    expect(spheresIndex).toBeGreaterThan(pathsIndex);
    expect(daathHitAreaIndex).toBeGreaterThan(spheresIndex);
    expect(svg).toContain(`data-node-id="sphere:Daath"`);
    expect(svg).toContain(`pointer-events="all"`);
  });

  it("allows custom palette overrides without changing the canonical layout", () => {
    const svg = generateTreeSvg({
      background: "transparent",
      palette: {
        defaultSphereFill: "#d9d4c7",
        defaultPathColor: "#a68b5b",
        pathEdgeColor: "#2a2418",
        sphereStrokeColor: "#2a2418",
        sphereStrokeWidth: 2,
        specialSphereMode: "plain",
        pathColors: {
          [id(KaabalahTypes.PATH, "1")]: "#123456",
        },
        sphereFills: {
          [id(KaabalahTypes.SPHERE, "Tiphareth")]: "#654321",
        },
      },
    });

    expect(svg).toContain(`stroke="#2a2418"`);
    expect(svg).toContain(`stroke="#123456"`);
    expect(svg).toContain(`fill="#654321"`);
    expect(svg).toContain(`fill="#d9d4c7"`);
  });

  it("keeps the default svg output unchanged when no highlights are passed", () => {
    const svg = generateTreeSvg();

    expect(hash(svg)).toBe("49bc877129ab77142deb42122ec3a1588d9dc817577eeb7d35da0348a33038d1");
  });

  it("recolors only the highlighted path without changing unrelated paths", () => {
    const defaultSvg = generateTreeSvg({
      background: "transparent",
    });
    const svg = generateTreeSvg({
      background: "transparent",
      highlights: {
        paths: {
          [id(KaabalahTypes.PATH, "1")]: "#ff0055",
        },
      },
    });

    const defaultMainPathStrokes = extractMainPathStrokes(defaultSvg);
    const highlightedMainPathStrokes = extractMainPathStrokes(svg);
    const defaultEdgePathStrokes = extractEdgePathStrokes(defaultSvg);
    const highlightedEdgePathStrokes = extractEdgePathStrokes(svg);

    expect(defaultMainPathStrokes).toHaveLength(22);
    expect(highlightedMainPathStrokes).toHaveLength(22);
    expect(defaultEdgePathStrokes).toHaveLength(22);
    expect(highlightedEdgePathStrokes).toHaveLength(22);
    expect(highlightedMainPathStrokes[0]).toBe("#ff0055");
    expect(defaultMainPathStrokes[0]).not.toBe("#ff0055");
    expect(highlightedEdgePathStrokes[0]).toBe("#ff0055");
    expect(highlightedMainPathStrokes.slice(1)).toEqual(defaultMainPathStrokes.slice(1));
    expect(highlightedEdgePathStrokes.slice(1)).toEqual(defaultEdgePathStrokes.slice(1));
  });

  it("keeps a highlighted special sphere on its special renderer", () => {
    const svg = generateTreeSvg({
      background: "transparent",
      highlights: {
        spheres: {
          [id(KaabalahTypes.SPHERE, "Kether")]: "#ffcc00",
        },
      },
    });

    expect(svg).toContain(`<g id="sphere-kether"`);
    expect(svg).toContain(`<polygon points="`);
    expect(svg).toContain(`fill="#ffcc00"`);
  });
});

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function extractMainPathStrokes(svg: string) {
  return Array.from(
    svg.matchAll(/<line [^>]*stroke="([^"]+)"[^>]*stroke-width="22"[^>]*\/>/g),
    (match) => match[1]
  );
}

function extractEdgePathStrokes(svg: string) {
  return Array.from(
    svg.matchAll(/<line [^>]*stroke="([^"]+)"[^>]*stroke-width="26"[^>]*\/>/g),
    (match) => match[1]
  );
}
