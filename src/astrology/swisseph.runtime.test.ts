import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { SwissEphModule } from "../../wasm/src/types";
import {
  closeSwissEph,
  getSwissEph,
  getSwissEphInfo,
  getSwissEphModuleDirectory,
  REQUIRED_EPHE_FILES,
  resolveNodeEphemerisPath,
  resolveSwissEphRuntimeAssets,
  resolveSwissEphRuntimeAssetsAsync,
  resolveSwissEphRuntimeAssetsWithOverrides,
  SwissEphError
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


describe("module-format-aware asset resolution (injected fakes)", () => {
  function resolveDots(base: string, rel: string): string {
    const out: string[] = [];
    for (const part of `${base}/${rel}`.split("/")) {
      if (part === "..") out.pop();
      else if (part && part !== ".") out.push(part);
    }
    return `/${out.join("/")}`;
  }

  it("derives the module directory from a native-ESM file URL", () => {
    expect(
      getSwissEphModuleDirectory({ moduleUrl: "file:///opt/app/node_modules/kaabalah/dist/chunk-ABC.mjs", cjsDirname: null })
    ).toBe("/opt/app/node_modules/kaabalah/dist");
  });

  it("decodes percent-encoded ESM URLs (spaces in install paths)", () => {
    expect(
      getSwissEphModuleDirectory({ moduleUrl: "file:///Users/me/My%20Projects/node_modules/kaabalah/dist/c.mjs", cjsDirname: null })
    ).toBe("/Users/me/My Projects/node_modules/kaabalah/dist");
  });

  it("handles Windows drive-letter file URLs", () => {
    expect(getSwissEphModuleDirectory({ moduleUrl: "file:///C:/app/node_modules/kaabalah/dist/c.mjs", cjsDirname: null })).toBe(
      "C:/app/node_modules/kaabalah/dist"
    );
  });

  it("falls back to __dirname when import.meta.url is empty or not a file URL (CJS bundle)", () => {
    expect(getSwissEphModuleDirectory({ moduleUrl: null, cjsDirname: "/pkg/dist" })).toBe("/pkg/dist");
    expect(getSwissEphModuleDirectory({ moduleUrl: "https://cdn.example/x.mjs", cjsDirname: "/pkg/dist" })).toBe("/pkg/dist");
  });

  it("returns undefined when neither format hint exists (browser bundle)", () => {
    expect(getSwissEphModuleDirectory({ moduleUrl: null, cjsDirname: null })).toBeUndefined();
  });

  it("prefers the dist-relative copy of the assets first", () => {
    const seen: string[] = [];
    const existing = new Set(["/pkg/dist/swisseph.node.wasm", "/pkg/ephe"]);
    const resolved = resolveSwissEphRuntimeAssetsWithOverrides({
      env: {},
      isBrowser: false,
      moduleDirectory: "/pkg/dist",
      nodePathResolve: resolveDots,
      existsSync: (path: string) => {
        seen.push(path);
        return existing.has(path);
      }
    });

    expect(resolved).toEqual({
      wasmPath: "/pkg/dist/swisseph.node.wasm",
      ephePath: "/pkg/ephe",
      wasmPathSource: "bundled",
      ephePathSource: "bundled"
    });
    expect(seen[0]).toBe("/pkg/dist/swisseph.node.wasm");
  });

  it("uses the package-root wasm/build layout when the dist copy is absent", () => {
    const existing = new Set(["/pkg/wasm/build/swisseph.node.wasm", "/pkg/ephe"]);
    const resolved = resolveSwissEphRuntimeAssetsWithOverrides({
      env: {},
      isBrowser: false,
      moduleDirectory: "/pkg/dist",
      nodePathResolve: resolveDots,
      existsSync: (path: string) => existing.has(path)
    });
    expect(resolved.wasmPath).toBe("/pkg/wasm/build/swisseph.node.wasm");
    expect(resolved.ephePath).toBe("/pkg/ephe");
  });

  it("supports entry files one directory deeper (dist/astrology/index.*)", () => {
    const existing = new Set(["/pkg/dist/swisseph.node.wasm", "/pkg/ephe"]);
    const resolved = resolveSwissEphRuntimeAssetsWithOverrides({
      env: {},
      isBrowser: false,
      moduleDirectory: "/pkg/dist/astrology",
      nodePathResolve: resolveDots,
      existsSync: (path: string) => existing.has(path)
    });
    expect(resolved.wasmPath).toBe("/pkg/dist/swisseph.node.wasm");
    expect(resolved.ephePath).toBe("/pkg/ephe");
  });

  it("keeps explicit and env overrides ahead of module-relative assets", () => {
    const resolved = resolveSwissEphRuntimeAssetsWithOverrides({
      env: { KAABALAH_EPHE_PATH: "/env/ephe" },
      wasmPath: "/explicit/swisseph.wasm",
      isBrowser: false,
      moduleDirectory: "/pkg/dist",
      existsSync: () => true
    });
    expect(resolved).toMatchObject({
      wasmPath: "/explicit/swisseph.wasm",
      wasmPathSource: "explicit",
      ephePath: "/env/ephe",
      ephePathSource: "env"
    });
  });

  it("reports an actionable typed error listing every bundled path it checked", () => {
    let error: unknown;
    try {
      resolveSwissEphRuntimeAssetsWithOverrides({
        env: {},
        isBrowser: false,
        moduleDirectory: "/nowhere/dist",
        nodePathResolve: resolveDots,
        existsSync: () => false
      });
    } catch (caught) {
      error = caught;
    }
    expect(error).toBeInstanceOf(SwissEphError);
    expect((error as SwissEphError).code).toBe("SWISSEPH_ASSET_NOT_FOUND");
    expect((error as SwissEphError).message).toContain("/nowhere/dist/swisseph.node.wasm");
  });

  it("async resolver works without relying on a sync require", async () => {
    const resolved = await resolveSwissEphRuntimeAssetsAsync({ env: {} });
    expect(existsSync(resolved.wasmPath)).toBe(true);
    expect(existsSync(resolved.ephePath)).toBe(true);
  });
});

describe("getSwissEph failure modes are typed and actionable", () => {
  const tempPaths: string[] = [];

  afterEach(() => {
    closeSwissEph();
    for (const path of tempPaths.splice(0)) {
      rmSync(path, { force: true, recursive: true });
    }
  });

  const silent = { onRuntimeNotice: () => undefined };

  it("rejects a non-existent explicit ephePath with SWISSEPH_ASSET_NOT_FOUND", async () => {
    await expect(getSwissEph({ ...silent, wasmPath: WASM_PATH, ephePath: "/definitely/not/here/ephe" })).rejects.toMatchObject({
      code: "SWISSEPH_ASSET_NOT_FOUND",
      message: expect.stringContaining("/definitely/not/here/ephe")
    });
    expect(getSwissEphInfo().initialized).toBe(false);
  });

  it("rejects a non-existent explicit wasmPath with SWISSEPH_ASSET_NOT_FOUND", async () => {
    await expect(getSwissEph({ ...silent, wasmPath: "/definitely/not/here.wasm", ephePath: EPHE_PATH })).rejects.toMatchObject({
      code: "SWISSEPH_ASSET_NOT_FOUND"
    });
  });

  it("rejects an existing but empty ephePath with SWISSEPH_EPHEMERIS_FILES_UNAVAILABLE naming the required files", async () => {
    const root = mkdtempSync(join(tmpdir(), "kaabalah-empty-ephe-"));
    tempPaths.push(root);

    let error: unknown;
    try {
      await getSwissEph({ ...silent, wasmPath: WASM_PATH, ephePath: root });
    } catch (caught) {
      error = caught;
    }
    expect(error).toBeInstanceOf(SwissEphError);
    expect((error as SwissEphError).code).toBe("SWISSEPH_EPHEMERIS_FILES_UNAVAILABLE");
    expect((error as SwissEphError).message).toMatch(/seas_18\.se1, semo_18\.se1, sepl_18\.se1/);
    expect((error as SwissEphError).message).toMatch(/explicit ephePath/);
  });

  it("rejects corrupt ephemeris files instead of silently falling back to Moshier", async () => {
    const root = mkdtempSync(join(tmpdir(), "kaabalah-corrupt-ephe-"));
    tempPaths.push(root);
    for (const file of REQUIRED_EPHE_FILES) {
      writeFileSync(join(root, file), new Uint8Array([1, 2, 3, 4]));
    }

    await expect(getSwissEph({ ...silent, wasmPath: WASM_PATH, ephePath: root })).rejects.toMatchObject({
      code: "SWISSEPH_EPHEMERIS_FILES_UNAVAILABLE"
    });
    expect(getSwissEphInfo().initialized).toBe(false);
  });

  it("can initialise successfully after a failed attempt", async () => {
    await expect(getSwissEph({ ...silent, wasmPath: WASM_PATH, ephePath: "/nope" })).rejects.toBeInstanceOf(SwissEphError);
    await getSwissEph({ ...silent, wasmPath: WASM_PATH, ephePath: EPHE_PATH });
    expect(getSwissEphInfo().initialized).toBe(true);
  });

  it("routes setup notices through the injected sink and never writes to the console", async () => {
    const notices: string[] = [];
    const spies = (["log", "info", "warn", "error"] as const).map((method) =>
      vi.spyOn(console, method).mockImplementation(() => undefined)
    );
    const stderr = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
    try {
      await getSwissEph({ wasmPath: WASM_PATH, ephePath: EPHE_PATH, onRuntimeNotice: (message) => notices.push(message) });
      expect(notices.some((message) => message.startsWith("Setting ephemeris path to:"))).toBe(true);
      for (const spy of spies) {
        expect(spy).not.toHaveBeenCalled();
      }
      expect(stderr).not.toHaveBeenCalled();
    } finally {
      stderr.mockRestore();
      for (const spy of spies) spy.mockRestore();
    }
  });
});
