import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { SwissEphModule } from "../../wasm/src/types";
import {
  REQUIRED_EPHE_FILES,
  resolveNodeEphemerisPath,
  resolveSwissEphRuntimeAssets
} from "./swisseph";

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
    mount: vi.fn<[filesystem: unknown, opts: { root: string }, mountPoint: string], void>(() => undefined),
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
    fs.mount.mockImplementation((_filesystem: unknown, opts: { root: string }, mountPoint: string) => {
      addVisibleDir(mountPoint, [...REQUIRED_EPHE_FILES]);
      addVisibleDir(opts.root, [...REQUIRED_EPHE_FILES]);
    });

    const result = resolveNodeEphemerisPath({ FS: fs } as unknown as SwissEphModule, ephePath, {
      pathModule,
    });

    expect(result).toEqual({ path: "/ephefs", strategy: "nodefs-mount" });
  });

  it("falls back to the direct host path when a successful mount leaves files inaccessible", () => {
    const { fs, addVisibleDir } = createFsMock();
    addVisibleDir(ephePath, [...REQUIRED_EPHE_FILES]);

    const result = resolveNodeEphemerisPath({ FS: fs } as unknown as SwissEphModule, ephePath, {
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

    const result = resolveNodeEphemerisPath({ FS: fs } as unknown as SwissEphModule, ephePath, {
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
      resolveNodeEphemerisPath({ FS: fs } as unknown as SwissEphModule, ephePath, {
        nodeFs,
        pathModule,
      })
    ).toThrow(/mount may have failed silently/i);

    expect(() =>
      resolveNodeEphemerisPath({ FS: fs } as unknown as SwissEphModule, ephePath, {
        nodeFs,
        pathModule,
      })
    ).toThrow(/seas_18\.se1, semo_18\.se1, sepl_18\.se1/);
  });
});

describe("resolveSwissEphRuntimeAssets", () => {
  const tempPaths: string[] = [];

  afterEach(() => {
    for (const path of tempPaths.splice(0)) {
      rmSync(path, { force: true, recursive: true });
    }
  });

  function createTempSwissEphAssets(prefix: string) {
    const root = mkdtempSync(join(tmpdir(), prefix));
    const wasmPath = join(root, "swisseph.node.wasm");
    const ephePath = join(root, "ephe");

    mkdirSync(ephePath, { recursive: true });
    writeFileSync(wasmPath, new Uint8Array([1, 2, 3]));
    for (const file of REQUIRED_EPHE_FILES) {
      writeFileSync(join(ephePath, file), new Uint8Array([1, 2, 3]));
    }

    tempPaths.push(root);

    return { root, wasmPath, ephePath };
  }

  it("prefers explicit candidate paths before bundled package assets", () => {
    const assets = createTempSwissEphAssets("kaabalah-swisseph-candidate-");

    const resolved = resolveSwissEphRuntimeAssets({
      env: {},
      wasmPathCandidates: [assets.wasmPath],
      ephePathCandidates: [assets.ephePath]
    });

    expect(resolved).toEqual({
      wasmPath: assets.wasmPath,
      ephePath: assets.ephePath,
      wasmPathSource: "candidate",
      ephePathSource: "candidate"
    });
  });

  it("prefers environment overrides before candidate paths", () => {
    const envAssets = createTempSwissEphAssets("kaabalah-swisseph-env-");
    const candidateAssets = createTempSwissEphAssets("kaabalah-swisseph-candidate-");

    const resolved = resolveSwissEphRuntimeAssets({
      env: {
        KAABALAH_SWISSEPH_WASM_PATH: envAssets.wasmPath,
        KAABALAH_SWISSEPH_EPHE_PATH: envAssets.ephePath
      },
      wasmPathCandidates: [candidateAssets.wasmPath],
      ephePathCandidates: [candidateAssets.ephePath]
    });

    expect(resolved).toEqual({
      wasmPath: envAssets.wasmPath,
      ephePath: envAssets.ephePath,
      wasmPathSource: "env",
      ephePathSource: "env"
    });
  });

  it("falls back to the bundled package assets when no app overrides are provided", () => {
    const resolved = resolveSwissEphRuntimeAssets({
      env: {}
    });

    expect(resolved.wasmPathSource).toBe("bundled");
    expect(resolved.ephePathSource).toBe("bundled");
    expect(existsSync(resolved.wasmPath)).toBe(true);
    expect(existsSync(resolved.ephePath)).toBe(true);
  });

  it("keeps browser resolution filesystem-free and returns bundled browser defaults", () => {
    const browserGlobal = globalThis as { window?: Window & typeof globalThis };
    const originalWindow = browserGlobal.window;
    browserGlobal.window = {} as Window & typeof globalThis;

    try {
      const resolved = resolveSwissEphRuntimeAssets({
        env: {}
      });

      expect(resolved.wasmPathSource).toBe("bundled");
      expect(resolved.ephePathSource).toBe("bundled");
      expect(resolved.ephePath).toBe("../ephe");
      expect(resolved.wasmPath).toMatch(/swisseph\.web/i);
    } finally {
      if (originalWindow === undefined) {
        delete browserGlobal.window;
      } else {
        browserGlobal.window = originalWindow;
      }
    }
  });
});
