import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import { id, KaabalahTypes } from "../core";
import {
  ARCHEOMETER_DEFAULT_VIEWBOX,
  DEFAULT_ARCHETYPE_UTTERANCE,
  DEFAULT_ARCHEOMETER_SECTOR_CORRESPONDENCES,
  DEFAULT_ARCHEOMETER_TRIANGLE_LABELS,
  DEFAULT_ARCHEOMETER_UTTERANCE,
  generateArcheometerSvg,
  generateTreeSvg,
  getArcheometerRenderModel,
  getTreeLayout,
  getTreeRenderModel,
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

  it("can mute Daath with a single flat highlight fill", () => {
    const svg = generateTreeSvg({
      background: "transparent",
      highlights: {
        specialSphereMode: "plain",
        spheres: {
          [id(KaabalahTypes.SPHERE, "Daath")]: "#aaa",
        },
      },
    });

    const daathSection = extractSphereSection(svg, "daath");

    expect(daathSection).toContain(`fill="#aaa"`);
    expect(daathSection).not.toContain(`transform="rotate(180 142.83 159.44)"`);
    expect(daathSection).not.toContain(`fill="black"`);
  });

  it("can mute Chokhmah with a single flat highlight fill", () => {
    const svg = generateTreeSvg({
      background: "transparent",
      highlights: {
        specialSphereMode: "plain",
        spheres: {
          [id(KaabalahTypes.SPHERE, "Chokhmah")]: "#aaa",
        },
      },
    });

    const chokhmahSection = extractSphereSection(svg, "chokhmah");

    expect(chokhmahSection).toContain(`fill="#aaa"`);
    expect(chokhmahSection).not.toContain(`fill-opacity="0.62"`);
    expect(chokhmahSection).not.toContain(`path d="M 247.85 99.18 L`);
  });

  it("supports downstream muting of non-selected nodes without svg post-processing", () => {
    const selectedPathId = id(KaabalahTypes.PATH, "1");
    const selectedSphereIds = [
      id(KaabalahTypes.SPHERE, "Kether"),
      id(KaabalahTypes.SPHERE, "Chokhmah"),
    ];
    const mutedColor = "#aaa";

    const svg = generateTreeSvg({
      background: "#fff",
      highlights: {
        specialSphereMode: "plain",
        paths: Object.fromEntries(
          TREE_PATH_IDS
            .filter((pathId) => pathId !== selectedPathId)
            .map((pathId) => [pathId, mutedColor])
        ),
        spheres: Object.fromEntries(
          TREE_SPHERE_IDS
            .filter((sphereId) => !selectedSphereIds.includes(sphereId))
            .map((sphereId) => [sphereId, mutedColor])
        ),
      },
    });

    const mainPathStrokes = extractMainPathStrokes(svg);
    const ketherSection = extractSphereSection(svg, "kether");
    const chokhmahSection = extractSphereSection(svg, "chokhmah");
    const daathSection = extractSphereSection(svg, "daath");

    expect(svg).toContain(`<rect x="0" y="0" width="286" height="561" fill="#fff"/>`);
    expect(mainPathStrokes[0]).not.toBe(mutedColor);
    expect(mainPathStrokes.slice(1)).toEqual(Array.from({ length: 21 }, () => mutedColor));
    expect(ketherSection).toContain(`<polygon points="`);
    expect(chokhmahSection).toContain(`path d="M 247.85 99.18 L`);
    expect(daathSection).toContain(`fill="#aaa"`);
    expect(daathSection).not.toContain(`transform="rotate(180 142.83 159.44)"`);
  });

  it("exposes activation-aware render geometry with stable anchors and hit targets", () => {
    const model = getTreeRenderModel({
      activations: [
        {
          targetId: id(KaabalahTypes.SPHERE, "Kether"),
          targetType: "sphere",
          count: 3,
          total: 11,
          state: "selected",
        },
        {
          targetId: id(KaabalahTypes.PATH, "1"),
          targetType: "path",
          count: 2,
          total: 22,
          state: "hovered",
        },
      ],
    });

    expect(model.viewBox).toEqual(TREE_SVG_DEFAULT_VIEWBOX);
    expect(model.layerOrder).toEqual(["background", "paths", "spheres", "hit-targets"]);
    expect(model.spheres).toHaveLength(11);
    expect(model.paths).toHaveLength(22);

    const kether = model.sphereById[id(KaabalahTypes.SPHERE, "Kether")];
    const pathOne = model.pathById[id(KaabalahTypes.PATH, "1")];

    expect(kether.geometry.percentages.center).toEqual({ x: 49.94, y: 6.83 });
    expect(kether.geometry.percentages.anchor).toEqual({
      x: 49.94,
      y: 6.83,
      vertical: "below",
    });
    expect(kether.geometry.viewBoxUnits.hitTarget).toEqual({
      kind: "circle",
      cx: 142.83,
      cy: 38.32,
      r: 38,
    });
    expect(kether.geometry.radius.viewBoxUnits).toBe(30);
    expect(kether.material.kind).toBe("special");
    expect(kether.activation?.state).toBe("selected");

    expect(pathOne.geometry.percentages.anchor.vertical).toBe("below");
    expect(pathOne.geometry.viewBoxUnits.hitTarget).toEqual({
      kind: "line",
      x1: 142.83,
      y1: 38.32,
      x2: 247.85,
      y2: 99.18,
      strokeWidth: 34,
    });
    expect(pathOne.geometry.widths.hitTarget).toBe(34);
    expect(pathOne.activation?.state).toBe("hovered");

    for (const sphere of model.spheres) {
      expect(sphere.geometry.viewBoxUnits.anchor.vertical).toMatch(/above|below/);
      expect(sphere.geometry.viewBoxUnits.hitTarget.kind).toBe("circle");
      expect(sphere.geometry.viewBoxUnits.hitTarget.cx).toBe(sphere.geometry.viewBoxUnits.center.x);
      expect(sphere.geometry.viewBoxUnits.hitTarget.cy).toBe(sphere.geometry.viewBoxUnits.center.y);
      expect(sphere.geometry.viewBoxUnits.hitTarget.r)
        .toBeGreaterThan(sphere.geometry.radius.viewBoxUnits);
    }

    for (const path of model.paths) {
      expect(path.geometry.viewBoxUnits.anchor.vertical).toMatch(/above|below/);
      expect(path.geometry.viewBoxUnits.hitTarget.kind).toBe("line");
      expect(path.geometry.viewBoxUnits.hitTarget.strokeWidth)
        .toBeGreaterThan(path.geometry.widths.edge);
    }
  });

  it("keeps sphere interaction geometry circular in custom viewBox units", () => {
    const model = getTreeRenderModel({
      viewBox: {
        minX: -10,
        minY: 20,
        width: TREE_SVG_DEFAULT_VIEWBOX.width * 2,
        height: TREE_SVG_DEFAULT_VIEWBOX.height * 2,
      },
    });
    const kether = model.sphereById[id(KaabalahTypes.SPHERE, "Kether")];

    expect(kether.geometry.viewBoxUnits.hitTarget.kind).toBe("circle");
    expect(kether.geometry.radius.viewBoxUnits).toBe(60);
    expect(kether.geometry.viewBoxUnits.hitTarget.r).toBe(76);
    expect(kether.geometry.viewBoxUnits.hitTarget.cx).toBe(kether.geometry.viewBoxUnits.center.x);
    expect(kether.geometry.viewBoxUnits.hitTarget.cy).toBe(kether.geometry.viewBoxUnits.center.y);
  });

  it("mutes inactive targets without muting active ones and preserves special sphere markup under activation", () => {
    const svg = generateTreeSvg({
      background: "transparent",
      activations: [
        ...TREE_SPHERE_IDS.map((sphereId, index) => ({
          targetId: sphereId,
          targetType: "sphere" as const,
          count: sphereId === id(KaabalahTypes.SPHERE, "Kether") ? 2 : 0,
          total: TREE_SPHERE_IDS.length,
          state: sphereId === id(KaabalahTypes.SPHERE, "Kether") ? "selected" as const : "inactive" as const,
          ...(sphereId === id(KaabalahTypes.SPHERE, "Kether") ? { color: "#ffcc00" } : {}),
        })),
        ...TREE_PATH_IDS.map((pathId, index) => ({
          targetId: pathId,
          targetType: "path" as const,
          count: pathId === id(KaabalahTypes.PATH, "1") ? 5 : 0,
          total: TREE_PATH_IDS.length,
          state: pathId === id(KaabalahTypes.PATH, "1") ? "selected" as const : "inactive" as const,
        })),
      ],
    });

    const ketherSection = extractSphereSection(svg, "kether");
    const chokhmahSection = extractSphereSection(svg, "chokhmah");
    const daathSection = extractSphereSection(svg, "daath");
    const binahSection = extractSphereSection(svg, "binah");
    const malkuthSection = extractSphereSection(svg, "malkuth");
    const mainPathStrokes = extractMainPathStrokes(svg);
    const pathsIndex = svg.indexOf(`<g id="paths">`);
    const spheresIndex = svg.indexOf(`<g id="spheres">`);

    expect(pathsIndex).toBeGreaterThan(-1);
    expect(spheresIndex).toBeGreaterThan(pathsIndex);
    expect(ketherSection).toContain(`<polygon points="`);
    expect(ketherSection).toContain(`fill="#ffcc00"`);
    expect(ketherSection).not.toContain(`fill="#AAA"`);
    expect(chokhmahSection).toContain(`path d="M 247.85 99.18 L`);
    expect(chokhmahSection).toContain(`fill-opacity="0.62"`);
    expect(daathSection).toContain(`transform="rotate(180 142.83 159.44)"`);
    expect(malkuthSection).toContain(`path d="M 142.83 522.85 L`);
    expect(binahSection).toContain(`fill="#AAA"`);
    expect(mainPathStrokes[0]).not.toBe(`#AAA`);
    expect(mainPathStrokes.slice(1)).toEqual(Array.from({ length: 21 }, () => `#AAA`));
  });

  it("preserves special sphere material when active without a custom fill override", () => {
    const defaultSvg = generateTreeSvg({ background: "transparent" });
    const svg = generateTreeSvg({
      background: "transparent",
      activations: [
        {
          targetId: id(KaabalahTypes.SPHERE, "Malkuth"),
          targetType: "sphere",
          count: 4,
          total: 8,
          state: "active",
        },
      ],
    });

    expect(extractSphereSection(svg, "malkuth"))
      .toBe(extractSphereSection(defaultSvg, "malkuth"));
    expect(svg).toContain(`stroke-opacity="0.4"`);
  });
});

describe("archeometer svg visual module", () => {
  it("exports a render model with normalized rings and archeometer defaults", () => {
    const model = getArcheometerRenderModel();

    expect(model.viewBox).toEqual(ARCHEOMETER_DEFAULT_VIEWBOX);
    expect(model.center).toEqual({ x: 456, y: 456 });
    expect(model.outerRadius).toBe(434);
    expect(model.rings.degreeOuter).toEqual({
      id: "degreeOuter",
      r1: 435.48,
      r2: 456,
    });
    expect(model.rings.degreeInner).toEqual({
      id: "degreeInner",
      r1: 414.47,
      r2: 435.48,
    });
    expect(model.rings.solarCenter).toEqual({
      id: "solarCenter",
      r1: 0,
      r2: 42.966,
    });
    expect(model.rings.whiteRays).toEqual({
      id: "whiteRays",
      r1: 42.966,
      r2: 52.08,
    });
    expect(model.rings.chromicRays).toEqual({
      id: "chromicRays",
      r1: 52.08,
      r2: 145.39,
    });
    expect(model.rings.zodiacUtterance.r2).toBe(model.rings.degreeInner.r1);
    expect(model.rings.planetaryUtterance.r2).toBe(model.rings.zodiacUtterance.r1);
    expect(roundForTest(model.rings.cosmologicalMusic.r2 - model.rings.cosmologicalMusic.r1)).toBe(18.23);
    expect(roundForTest(model.rings.astralZodiac.r2 - model.rings.astralZodiac.r1)).toBe(23);
    expect(roundForTest(model.rings.astralPlanetary.r2 - model.rings.astralPlanetary.r1)).toBe(28.21);
    expect(model.utterance).toBe(DEFAULT_ARCHEOMETER_UTTERANCE);
    expect(DEFAULT_ARCHETYPE_UTTERANCE).toBe(DEFAULT_ARCHEOMETER_UTTERANCE);
    expect(model.triangleLabels).toBe(DEFAULT_ARCHEOMETER_TRIANGLE_LABELS);
    expect(model.triangles[0]).toMatchObject({
      vertices: [0, 120, 240],
      vertexFills: ["#f2cf45", "#5470a5", "#dd3e38"],
    });
    expect(model.triangles[1]).toMatchObject({
      vertices: [180, 300, 60],
      vertexFills: ["#cc58a1", "#f28a32", "#78bd79"],
    });
    expect(model.utterance[0]).toMatchObject({
      degree: 0,
      letter: "P, Ph",
      number: 80,
    });
    expect(model.utterance.map(({ degree, letter, number }) => ({ degree, letter, number }))).toEqual([
      { degree: 0, letter: "P, Ph", number: 80 },
      { degree: 30, letter: "W, OU", number: 70 },
      { degree: 60, letter: "M", number: 40 },
      { degree: 90, letter: "L", number: 30 },
      { degree: 120, letter: "I, Y, J", number: 10 },
      { degree: 150, letter: "T", number: 9 },
      { degree: 180, letter: "E, H", number: 8 },
      { degree: 210, letter: "Z", number: 7 },
      { degree: 240, letter: "V, OU", number: 6 },
      { degree: 270, letter: "H, E", number: 5 },
      { degree: 300, letter: "R", number: 200 },
      { degree: 330, letter: "K", number: 100 },
    ]);
    expect(model.triangleLabels.map(({ degree, label, number }) => ({ degree, label, number }))).toEqual([
      { degree: 0, label: "S, Sh", number: 300 },
      { degree: 30, label: "D", number: 4 },
      { degree: 60, label: "C", number: 20 },
      { degree: 90, label: "" },
      { degree: 120, label: "Ts", number: 90 },
      { degree: 150, label: "N", number: 50 },
      { degree: 180, label: "B", number: 2 },
      { degree: 210, label: "Ts", number: 90 },
      { degree: 240, label: "G", number: 3 },
      { degree: 270, label: "C", number: 20 },
      { degree: 300, label: "D", number: 4 },
      { degree: 330, label: "S, Sh", number: 300 },
    ]);
    expect(model.triangleLabels[0]).toMatchObject({
      degree: 0,
      label: "S, Sh",
      number: 300,
    });
    expect(model.zodiacSigns[0]).toMatchObject({
      degree: 0,
      name: "Capricorn",
      glyph: "♑",
    });
    expect(model.planetaryPoints[0]).toMatchObject({
      degree: 0,
      name: "Saturn",
      glyph: "♄",
    });
    expect(model.musicalNotes[0]).toMatchObject({
      degree: 0,
      note: "Si",
    });
    expect(DEFAULT_ARCHEOMETER_SECTOR_CORRESPONDENCES[0]).toMatchObject({
      degree: 0,
      utterance: {
        letter: "P, Ph",
        number: 80,
      },
      triangleLabel: {
        label: "S, Sh",
        number: 300,
      },
      musicalNote: {
        note: "Si",
      },
      zodiacSign: {
        name: "Capricorn",
        glyph: "♑",
      },
      planetaryPoint: {
        name: "Saturn",
        glyph: "♄",
      },
    });
    expect(model.zodiacSigns[1]).toMatchObject({
      degree: 30,
      name: "Sagittarius",
      glyph: "♐",
    });
    expect(model.planetaryPoints[1]).toMatchObject({
      degree: 30,
      name: "Jupiter",
      glyph: "♃",
    });
    expect(model.zodiacSigns[2]).toMatchObject({
      degree: 60,
      name: "Scorpio",
      glyph: "♏",
    });
    expect(model.planetaryPoints[2]).toMatchObject({
      degree: 60,
      name: "Mars",
      glyph: "♂",
    });
    expect(model.zodiacSigns[11]).toMatchObject({
      degree: 330,
      name: "Aquarius",
      glyph: "♒",
    });
    expect(model.triangleLabels[9]).toMatchObject({
      degree: 270,
      label: "C",
    });
    expect(model.utterance[9]).toMatchObject({
      degree: 270,
      letter: "H, E",
      number: 5,
    });
  });

  it("renders a transparent archeometer svg with named layers", () => {
    const svg = generateArcheometerSvg({
      background: "transparent",
      title: "The Cosmological Archeometer",
    });

    expect(svg.startsWith(`<svg xmlns="http://www.w3.org/2000/svg"`)).toBe(true);
    expect(svg).toContain(`viewBox="0 0 912 912"`);
    expect(svg).toContain(`<title>The Cosmological Archeometer</title>`);
    expect(svg).toContain(`<g id="archeometer-degree-crown"`);
    expect(svg).toContain(`>345</text>`);
    expect(svg).toContain(`>15</text>`);
    expect(svg).toContain(`<g id="archeometer-zodiacal-utterance"`);
    expect(svg).toContain(`<g id="archeometer-planetary-utterance"`);
    expect(svg).toContain(`<clipPath id="archeometer-planetary-clip">`);
    expect(svg).toContain(`A 347.2 347.2`);
    expect(svg).toContain(`class="archeometer-trigone"`);
    expect(svg.match(/class="archeometer-trigone" data-triangle=/g)).toHaveLength(4);
    expect(svg.match(/class="archeometer-trigone-vertex-fill"/g)).toHaveLength(12);
    expect(svg).toContain(`d="M 456 108.8`);
    expect(svg).toContain(`data-triangle="wordJesus" data-degree="0"`);
    expect(svg).toContain(`fill="#f2cf45"`);
    expect(svg).toContain(`data-triangle="wordJesus" data-degree="120"`);
    expect(svg).toContain(`fill="#5470a5"`);
    expect(svg).toContain(`data-triangle="wordJesus" data-degree="240"`);
    expect(svg).toContain(`fill="#dd3e38"`);
    expect(svg).toContain(`data-triangle="mary" data-degree="300"`);
    expect(svg).toContain(`fill="#f28a32" fill-opacity="0.54"`);
    expect(svg).toContain(`data-triangle="mary" data-degree="60"`);
    expect(svg).toContain(`fill="#78bd79" fill-opacity="0.54"`);
    expect(svg).toContain(`data-triangle="ether" data-degree="30"`);
    expect(svg).toContain(`fill="#b7bd58" fill-opacity="0.54"`);
    expect(svg).toContain(`data-degree="0" data-letter="P, Ph"`);
    expect(svg).toContain(`>P<`);
    expect(svg).toContain(`>Ph<`);
    expect(svg).toContain(`>80</text>`);
    expect(svg).toContain(`data-degree="30" data-letter="W, OU"`);
    expect(svg).not.toContain(`>W, OU<`);
    expect(svg).toContain(`>70</text>`);
    expect(svg).toContain(`data-degree="120" data-letter="I, Y, J"`);
    expect(svg).toContain(`>10</text>`);
    expect(svg).toContain(`data-degree="240" data-letter="V, OU"`);
    expect(svg).toContain(`>6</text>`);
    expect(svg.match(/<g class="archeometer-utterance-point"[^>]*>\n<circle/g)).toBeNull();
    expect(svg).not.toContain(`class="archeometer-zodiac-utterance-mark"`);
    expect(svg).not.toContain(`>PPh</text>`);
    expect(svg).toContain(`>S, Sh<`);
    expect(svg).toContain(`>300<`);
    expect(svg).toContain(`>Si<`);
    expect(svg).toContain(`id="archeometer-music-backing"`);
    expect(svg.match(/class="archeometer-music-staff-line"/g)).toHaveLength(60);
    expect(svg).toContain(`class="archeometer-music-staff-line" data-degree="0"`);
    expect(svg).toContain(`data-degree="270" data-letter="H, E"`);
    expect(svg).not.toContain(`data-degree="270" data-letter=""`);
    expect(svg).not.toContain(`filter="url(#archeometer-text-halo)"`);
    expect(svg).not.toContain(`id="archeometer-text-halo"`);
    expect(svg).not.toContain(`fill="#ffffff" font-weight="700"`);
    expect(svg).toContain(`id="archeometer-chromic-triangle-core"`);
    expect(svg).not.toContain(`id="archeometer-chromic-vertex-colors"`);
    expect(svg).not.toContain(`class="archeometer-chromic-vertex-fill"`);
    expect(svg.match(/class="archeometer-chromic-foundation"/g)).toHaveLength(3);
    expect(svg.match(/class="archeometer-chromic-trigone-facet"/g)).toHaveLength(9);
    expect(svg).toContain(`class="archeometer-chromic-trigone-facet" data-triangle="mary" data-degree="300"`);
    expect(svg).toContain(`fill="#f28a32" stroke="#151515" stroke-opacity="0.72"`);
    expect(svg).toContain(`class="archeometer-chromic-trigone-facet" data-triangle="mary" data-degree="60"`);
    expect(svg).toContain(`fill="#78bd79" stroke="#151515" stroke-opacity="0.72"`);
    expect(svg).toContain(`class="archeometer-chromic-trigone-facet" data-triangle="mary" data-degree="180"`);
    expect(svg).toContain(`fill="#cc58a1" stroke="#151515" stroke-opacity="0.72"`);
    expect(svg).toContain(`class="archeometer-chromic-trigone-facet" data-triangle="divineFire" data-degree="330"`);
    expect(svg).toContain(`fill="#f0b33f" stroke="#151515" stroke-opacity="0.72"`);
    expect(svg).toContain(`class="archeometer-chromic-trigone-facet" data-triangle="ether" data-degree="30"`);
    expect(svg).toContain(`fill="#b7bd58" stroke="#151515" stroke-opacity="0.72"`);
    expect(svg).not.toContain(`class="archeometer-chromic-trigone-outline"`);
    expect(svg.match(/class="archeometer-chromic-primary-facet"/g)).toHaveLength(3);
    expect(svg).toContain(`class="archeometer-chromic-foundation" data-triangle="mary"`);
    expect(svg).toContain(`class="archeometer-chromic-foundation" data-triangle="ether"`);
    expect(svg).toContain(`class="archeometer-chromic-foundation" data-triangle="divineFire"`);
    expect(svg).toContain(`class="archeometer-chromic-primary-outline" data-triangle="wordJesus"`);
    expect(svg).toContain(`C 518.956 419.651 539.95 455.437 518.956 492.065`);
    expect(svg).toContain(`fill="#f2cf45"`);
    expect(svg).toContain(`fill="#5470a5"`);
    expect(svg).toContain(`fill="#dd3e38"`);
    expect(svg.match(/class="archeometer-zodiac-sign"/g)).toHaveLength(12);
    expect(svg).toContain(`class="archeometer-zodiac-sign" data-sign="Capricorn" data-degree="0"`);
    expect(svg.match(/class="archeometer-astral-planetary-sector"/g)).toHaveLength(12);
    expect(svg).toContain(`class="archeometer-planet" data-planet="Moon" data-degree="180"`);
    expect(svg).toContain(`font-size="21.2" text-anchor="middle" dominant-baseline="middle" fill="#151515">☾</text>`);
    expect(svg).toContain(`class="archeometer-astral-planetary-sector" data-degree="0"`);
    expect(svg).toContain(`fill="#f2cf45" fill-opacity="0.36"`);
    expect(svg).toContain(`class="archeometer-astral-planetary-sector" data-degree="300"`);
    expect(svg).toContain(`fill="#f28a32" fill-opacity="0.36"`);
    expect(svg.match(/class="archeometer-astral-planetary-divider"/g)).toHaveLength(12);
    expect(svg).toContain(`class="archeometer-astral-planetary-divider" data-degree="15"`);
    expect(svg).not.toContain(`class="archeometer-astral-planetary-divider" data-degree="0"`);
    expect(svg).toContain(`<g id="archeometer-solar-center"`);
    expect(svg).not.toContain(`<rect x="0" y="0" width="912" height="912"`);
    expect(svg).not.toContain(`Y-PhO`);
    expect(svg.endsWith(`</svg>`)).toBe(true);
  });

  it("allows caller supplied utterance data without changing the default table", () => {
    const svg = generateArcheometerSvg({
      utterance: DEFAULT_ARCHEOMETER_UTTERANCE.map((point) =>
        point.id === "y"
          ? { ...point, letter: "Ya", number: 11, color: "#123456" }
          : point
      ),
    });

    expect(svg).toContain(`data-letter="Ya"`);
    expect(svg).toContain(`fill="#123456"`);
    expect(DEFAULT_ARCHEOMETER_UTTERANCE.find((point) => point.id === "y")).toMatchObject({
      letter: "V, OU",
      number: 6,
      color: "#d85c43",
    });
  });
});

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function roundForTest(value: number) {
  return Math.round(value * 100) / 100;
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

function extractSphereSection(svg: string, slug: string) {
  const sphereOrder = [
    "kether",
    "chokhmah",
    "binah",
    "daath",
    "chesed",
    "geburah",
    "tiphareth",
    "netzach",
    "hod",
    "yesod",
    "malkuth",
  ];
  const startMarker = `<g id="sphere-${slug}"`;
  const startIndex = svg.indexOf(startMarker);

  if (startIndex === -1) {
    throw new Error(`Sphere section not found for ${slug}`);
  }

  const currentIndex = sphereOrder.indexOf(slug);
  const nextSlug = sphereOrder[currentIndex + 1];
  const endIndex = nextSlug
    ? svg.indexOf(`<g id="sphere-${nextSlug}"`, startIndex + startMarker.length)
    : svg.indexOf(`</g>\n</svg>`, startIndex + startMarker.length);

  if (endIndex === -1) {
    throw new Error(`Sphere section end not found for ${slug}`);
  }

  return svg.slice(startIndex, endIndex);
}
