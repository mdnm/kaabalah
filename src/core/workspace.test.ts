import { describe, expect, it } from "vitest";

import {
  BaseNode,
  getCanonicalTree,
  createTreeWorkspace,
  id,
  KaabalahTypes,
  MiscTypes,
  NumerologyTypes,
  TarotTypes,
} from "./index";

describe("TreeWorkspace", () => {
  it("reuses cached canonical trees for the same system snapshot", () => {
    const firstTree = getCanonicalTree({
      system: "kaabalah",
      parts: ["tarot"],
    });
    const secondTree = getCanonicalTree({
      system: "kaabalah",
      parts: ["tarot"],
    });

    expect(firstTree).toBe(secondTree);
    expect(firstTree.descriptor).toMatchObject({
      system: "kaabalah",
      parts: ["tarot"],
      cacheKey: "kaabalah:tarot",
    });
  });

  it("returns typed correspondence matches and grouped maps without raw related() calls", () => {
    const tree = getCanonicalTree({
      system: "kaabalah",
      parts: ["tarot"],
    });
    const numberOne = id(NumerologyTypes.NUMBER, 1);

    const sphereMatches = tree.getCorrespondences(numberOne, {
      type: KaabalahTypes.SPHERE,
    });
    const correspondenceMap = tree.getCorrespondenceMap(numberOne);

    expect(sphereMatches[0]?.node.data?.englishName).toBe("Crown");
    expect(correspondenceMap.sphere?.[0]?.node.id).toBe(
      id(KaabalahTypes.SPHERE, "Kether")
    );
    expect(
      correspondenceMap.tarotArkAnnu?.some(
        ({ node }) => node.id === id(TarotTypes.TAROT_ARK_ANNU, "The Magician")
      )
    ).toBe(true);
  });

  it("records base correspondence provenance from system and part loaders", () => {
    const tree = getCanonicalTree({
      system: "kaabalah",
      parts: ["tarot"],
    });

    const systemEdge = tree.getEdge(
      id(NumerologyTypes.NUMBER, 1),
      id(KaabalahTypes.SPHERE, "Kether")
    );
    const tarotEdge = tree.getEdge(
      id(KaabalahTypes.PATH, 1),
      id(TarotTypes.TAROT_ARK_ANNU, "The Magician")
    );

    expect(systemEdge?.sources).toContainEqual({
      kind: "system",
      system: "kaabalah",
    });
    expect(tarotEdge?.sources).toContainEqual({
      kind: "part",
      system: "kaabalah",
      part: "tarot",
    });
  });

  it("supports overlay correspondences, annotations, removals, and notes", () => {
    const base = getCanonicalTree({
      system: "kaabalah",
      parts: ["tarot"],
    });
    const numberOne = id(NumerologyTypes.NUMBER, 1);
    const kether = id(KaabalahTypes.SPHERE, "Kether");
    const pathOne = id(KaabalahTypes.PATH, 1);
    const aspirant = id(MiscTypes.UNCATEGORIZED, "aspirant");

    const workspace = createTreeWorkspace({
      base,
      descriptor: {
        id: "user-tree",
        name: "User Tree",
        version: "v1",
      },
      overlays: [
        {
          id: "user-overlay",
          name: "Mateus overlay",
          nodes: [
            new BaseNode({
              id: "aspirant",
              type: MiscTypes.UNCATEGORIZED,
              name: "Aspirant",
            }),
          ],
          correspondences: [
            {
              op: "annotate",
              left: numberOne,
              right: kether,
              metadata: {
                label: "root correspondence",
                tags: ["user"],
              },
            },
            {
              op: "add",
              left: numberOne,
              right: aspirant,
              metadata: {
                kind: "note-link",
              },
            },
            {
              op: "remove",
              left: numberOne,
              right: pathOne,
            },
          ],
          notes: [
            {
              id: "note:number-1",
              text: "Core identity number",
              target: {
                kind: "node",
                nodeId: numberOne,
              },
            },
            {
              id: "note:number-1-kether",
              text: "User-confirmed crown correspondence",
              target: {
                kind: "correspondence",
                left: numberOne,
                right: kether,
              },
            },
          ],
        },
      ],
    });

    expect(workspace.descriptor).toMatchObject({
      id: "user-tree",
      name: "User Tree",
      version: "v1",
      system: "kaabalah",
      parts: ["tarot"],
    });
    expect(workspace.getEdge(numberOne, kether)?.metadata).toMatchObject({
      label: "root correspondence",
      tags: ["user"],
    });
    expect(workspace.getEdge(numberOne, kether)?.sources).toContainEqual({
      kind: "overlay",
      overlayId: "user-overlay",
      label: "Mateus overlay",
    });
    expect(workspace.getEdge(numberOne, pathOne)).toBeUndefined();
    expect(
      workspace.getCorrespondences(numberOne, {
        type: MiscTypes.UNCATEGORIZED,
      })[0]?.node.name
    ).toBe("Aspirant");
    expect(
      workspace.getNotes({
        kind: "node",
        nodeId: numberOne,
      })
    ).toHaveLength(1);
    expect(
      workspace.getNotes({
        kind: "correspondence",
        left: numberOne,
        right: kether,
      })
    ).toHaveLength(1);
  });

  it("deep-clones metadata when adding overlay correspondences", () => {
    const left = id(MiscTypes.UNCATEGORIZED, "left");
    const right = id(MiscTypes.UNCATEGORIZED, "right");
    const tags = ["overlay"];
    const attributes = { weight: 1 };

    const workspace = createTreeWorkspace({
      overlays: [
        {
          id: "metadata-overlay",
          nodes: [
            new BaseNode({
              id: "left",
              type: MiscTypes.UNCATEGORIZED,
            }),
            new BaseNode({
              id: "right",
              type: MiscTypes.UNCATEGORIZED,
            }),
          ],
          correspondences: [
            {
              op: "add",
              left,
              right,
              metadata: {
                tags,
                attributes,
              },
            },
          ],
        },
      ],
    });

    const metadata = workspace.getEdge(left, right)?.metadata;

    expect(metadata?.tags).toEqual(tags);
    expect(metadata?.tags).not.toBe(tags);
    expect(metadata?.attributes).toEqual(attributes);
    expect(metadata?.attributes).not.toBe(attributes);
  });

  it("supports pluggable visual resolution without hardcoding product visuals into core", () => {
    const base = getCanonicalTree({
      system: "kaabalah",
      parts: ["tarot"],
    });
    const pathOne = id(KaabalahTypes.PATH, 1);
    const workspace = createTreeWorkspace({
      base,
      visualResolvers: [
        ({ request, workspace }) => {
          if (request.kind !== "badge") {
            return undefined;
          }

          const node = workspace.getNode(request.nodeId);

          if (!node) {
            return undefined;
          }

          return {
            kind: "badge",
            nodeId: request.nodeId,
            label: node.name,
          };
        },
      ],
    });

    expect(
      workspace.resolveVisual({
        nodeId: pathOne,
        kind: "badge",
      })
    ).toEqual({
      kind: "badge",
      nodeId: pathOne,
      label: "1",
    });
  });
});
