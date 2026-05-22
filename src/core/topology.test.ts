import { describe, expect, it } from "vitest";

import { SPHERES } from "./constants";
import { getTreeTopology } from "./topology";
import { id, KaabalahTypes } from "./types";

describe("TreeTopology", () => {
  it("exposes the structural Tree of Life skeleton separately from correspondences", () => {
    const topology = getTreeTopology();

    expect(topology.system).toBe("kaabalah");
    expect(topology.getSpheres()).toHaveLength(11);
    expect(topology.getPrimarySpheres()).toHaveLength(10);
    expect(topology.getPaths()).toHaveLength(22);
    expect(topology.getSphere("Kether")).toMatchObject({
      id: id(KaabalahTypes.SPHERE, SPHERES.KETHER),
      number: 1,
      role: "sephirah",
    });
    expect(topology.getSphere("Daath")).toMatchObject({
      id: id(KaabalahTypes.SPHERE, SPHERES.DAATH),
      number: 11,
      role: "hidden",
    });
  });

  it("resolves structural paths without callers knowing path ids", () => {
    const topology = getTreeTopology();
    const ketherChokhmah = topology.getPathBetween("Kether", "Chokhmah");

    expect(ketherChokhmah).toMatchObject({
      id: id(KaabalahTypes.PATH, 1),
      number: 1,
      from: { name: "Kether" },
      to: { name: "Chokhmah" },
    });
    expect(topology.getPathBetween("Chokhmah", "Kether")).toBe(
      ketherChokhmah
    );
    expect(topology.getPath({ between: ["Yesod", "Malkuth"] })).toMatchObject({
      id: id(KaabalahTypes.PATH, 22),
      number: 22,
    });
  });

  it("returns adjacent spheres through topology paths", () => {
    const topology = getTreeTopology();

    expect(topology.getAdjacentSpheres("Kether")).toMatchObject([
      { sphere: { name: "Chokhmah" }, path: { number: 1 } },
      { sphere: { name: "Binah" }, path: { number: 2 } },
      { sphere: { name: "Tiphareth" }, path: { number: 3 } },
    ]);
  });

  it("exposes lightning and serpent routes as named topology traversals", () => {
    const topology = getTreeTopology();
    const lightning = topology.getRoute("lightning");
    const serpent = topology.getRoute("serpent");

    expect(lightning?.spheres.map((sphere) => sphere.name)).toEqual([
      "Kether",
      "Chokhmah",
      "Binah",
      "Chesed",
      "Geburah",
      "Tiphareth",
      "Netzach",
      "Hod",
      "Yesod",
      "Malkuth",
    ]);
    expect(lightning?.segments.map((segment) => segment.path?.number)).toEqual([
      1, 4, undefined, 9, 12, 14, 17, 20, 22,
    ]);
    expect(lightning?.isFullyConnected).toBe(false);
    expect(lightning?.missingSegments).toMatchObject([
      { from: { name: "Binah" }, to: { name: "Chesed" } },
    ]);
    expect(lightning?.targetIds).toEqual([
      id(KaabalahTypes.SPHERE, SPHERES.KETHER),
      id(KaabalahTypes.PATH, 1),
      id(KaabalahTypes.SPHERE, SPHERES.CHOKHMAH),
      id(KaabalahTypes.PATH, 4),
      id(KaabalahTypes.SPHERE, SPHERES.BINAH),
      id(KaabalahTypes.SPHERE, SPHERES.CHESED),
      id(KaabalahTypes.PATH, 9),
      id(KaabalahTypes.SPHERE, SPHERES.GEBURAH),
      id(KaabalahTypes.PATH, 12),
      id(KaabalahTypes.SPHERE, SPHERES.TIPHARETH),
      id(KaabalahTypes.PATH, 14),
      id(KaabalahTypes.SPHERE, SPHERES.NETZACH),
      id(KaabalahTypes.PATH, 17),
      id(KaabalahTypes.SPHERE, SPHERES.HOD),
      id(KaabalahTypes.PATH, 20),
      id(KaabalahTypes.SPHERE, SPHERES.YESOD),
      id(KaabalahTypes.PATH, 22),
      id(KaabalahTypes.SPHERE, SPHERES.MALKUTH),
    ]);
    expect(serpent?.spheres.map((sphere) => sphere.name)).toEqual(
      [...(lightning?.spheres ?? [])]
        .reverse()
        .map((sphere) => sphere.name)
    );
    expect(topology.nextInRoute("lightning", "Binah")?.name).toBe("Chesed");
    expect(topology.previousInRoute("serpent", "Binah")?.name).toBe("Chesed");
  });

  it("keeps route order system-specific when the topology changes", () => {
    const topology = getTreeTopology({ system: "lurianic-kabbalah" });
    const lightning = topology.getRoute("lightning");

    expect(topology.getSphere("Daath")).toBeUndefined();
    expect(topology.getSpheres()).toHaveLength(10);
    expect(lightning?.spheres.map((sphere) => sphere.name)).toEqual([
      "Kether",
      "Chokhmah",
      "Binah",
      "Chesed",
      "Geburah",
      "Tiphareth",
      "Netzach",
      "Hod",
      "Yesod",
      "Malkuth",
    ]);
    expect(lightning?.segments.map((segment) => segment.path?.number)).toEqual([
      1, 4, 8, 11, 14, 16, 19, 21, 22,
    ]);
    expect(lightning?.isFullyConnected).toBe(true);
    expect(topology.nextInRoute("lightning", "Binah")?.name).toBe("Chesed");
  });
});
