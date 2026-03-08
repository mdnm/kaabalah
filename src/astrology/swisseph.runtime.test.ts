import { describe, expect, it, vi } from "vitest";

import type { SwissEphModule } from "../../wasm/src/types";
import { REQUIRED_EPHE_FILES, resolveNodeEphemerisPath } from "./swisseph";

function normalizePath(path: string): string {
  if (path === "/") {
    return path;
  }

  return path.replace(/\/+$/, "") || "/";
}

function joinPosix(...parts: string[]): string {
  return normalizePath(parts.join("/").replace(/\/+/g, "/"));
}

function createFsMock() {
  const directories = new Map<string, string[]>();
  const existing = new Set<string>();

  const ensureDir = (path: string): void => {
    const normalized = normalizePath(path);
    existing.add(normalized);
    if (!directories.has(normalized)) {
      directories.set(normalized, [".", ".."]);
    }
  };

  const addVisibleFile = (path: string): void => {
    const normalized = normalizePath(path);
    const lastSlash = normalized.lastIndexOf("/");
    const parent = lastSlash <= 0 ? "/" : normalized.slice(0, lastSlash);
    const name = normalized.slice(lastSlash + 1);

    ensureDir(parent);
    existing.add(normalized);

    const entries = directories.get(parent)!;
    if (!entries.includes(name)) {
      entries.push(name);
    }
  };

  const addVisibleDir = (path: string, entries: string[] = []): void => {
    ensureDir(path);
    for (const entry of entries) {
      addVisibleFile(`${normalizePath(path)}/${entry}`);
    }
  };

  const fs = {
    mkdir: vi.fn((path: string) => ensureDir(path)),
    mount: vi.fn(() => undefined),
    readdir: vi.fn((path: string) => {
      const normalized = normalizePath(path);
      const entries = directories.get(normalized);
      if (!entries) {
        throw new Error(`ENOENT: ${path}`);
      }
      return [...entries];
    }),
    analyzePath: vi.fn((path: string) => ({
      exists: existing.has(normalizePath(path)),
    })),
    writeFile: vi.fn((path: string) => {
      addVisibleFile(path);
    }),
    filesystems: {
      NODEFS: {},
    },
  };

  return { fs, addVisibleDir };
}

describe("resolveNodeEphemerisPath", () => {
  const ephePath = "/host/ephe";
  const pathModule = { join: joinPosix };

  it("prefers the mounted NODEFS path when the required files are visible", () => {
    const { fs, addVisibleDir } = createFsMock();
    fs.mount.mockImplementation((_filesystem, opts: { root: string }, mountPoint: string) => {
      addVisibleDir(mountPoint, [...REQUIRED_EPHE_FILES]);
      addVisibleDir(opts.root, [...REQUIRED_EPHE_FILES]);
    });

    const result = resolveNodeEphemerisPath({ FS: fs } as SwissEphModule, ephePath, {
      pathModule,
    });

    expect(result).toEqual({ path: "/ephefs", strategy: "nodefs-mount" });
  });

  it("falls back to the direct host path when a successful mount leaves files inaccessible", () => {
    const { fs, addVisibleDir } = createFsMock();
    addVisibleDir(ephePath, [...REQUIRED_EPHE_FILES]);

    const result = resolveNodeEphemerisPath({ FS: fs } as SwissEphModule, ephePath, {
      pathModule,
    });

    expect(result).toEqual({ path: ephePath, strategy: "host-path" });
    expect(fs.mount).toHaveBeenCalledWith(fs.filesystems.NODEFS, { root: ephePath }, "/ephefs");
  });

  it("copies the ephemeris files into MEMFS when neither mount nor direct host path is visible to Emscripten FS", () => {
    const { fs } = createFsMock();
    const nodeFs = {
      readFileSync: vi.fn(() => new Uint8Array([1, 2, 3])),
    };

    const result = resolveNodeEphemerisPath({ FS: fs } as SwissEphModule, ephePath, {
      nodeFs,
      pathModule,
    });

    expect(result).toEqual({ path: "/ephemem", strategy: "memfs-copy" });
    expect(fs.writeFile).toHaveBeenCalledTimes(REQUIRED_EPHE_FILES.length);
  });

  it("throws an actionable error when all runtime resolution strategies fail", () => {
    const { fs } = createFsMock();
    const nodeFs = {
      readFileSync: vi.fn(() => {
        throw new Error("ENOENT: missing ephemeris file");
      }),
    };

    expect(() =>
      resolveNodeEphemerisPath({ FS: fs } as SwissEphModule, ephePath, {
        nodeFs,
        pathModule,
      })
    ).toThrow(/mount may have failed silently/i);

    expect(() =>
      resolveNodeEphemerisPath({ FS: fs } as SwissEphModule, ephePath, {
        nodeFs,
        pathModule,
      })
    ).toThrow(/seas_18\.se1, semo_18\.se1, sepl_18\.se1/);
  });
});
