/**
 * Integration with the Swiss Ephemeris WebAssembly module
 */
import wasmPathWeb from "../../wasm/build/swisseph.web.wasm?url";
import type { SwissEphModule, SwissEphModuleFactory } from "../../wasm/src/types";

// Note: In the production code, you'll need to include the compiled WASM files
// and update the import path. This is a placeholder that would work once the
// compilation is complete.

// Import from the actual WASM wrapper
import {
  type AzaltResult,
  type CalculatePositionOptions,
  CalcFlag,
  Houses,
  HouseSystem,
  normalizeAngle,
  parsFortunae,
  Planet,
  PLANET_AND_NODE_NAMES,
  PlanetPosition,
  type PlanetPositionDetailed,
  RiseTransitFlag,
  SwissEph,
  SwissEphError,
  SwissEphEphemerisMismatchError,
  type SwissEphErrorCode,
  type SwissEphemerisKind,
  VirtualNodes,
  ephemerisFromFlags,
} from "../../wasm/src/swisseph";

// We'll use this singleton pattern to manage the Swiss Ephemeris instance.
//
// MUTABLE GLOBAL SWISS STATE (shared by every caller of this process-wide instance):
//   - sidereal mode   (swe_set_sid_mode)  default Fagan/Bradley = 0
//   - topocentric     (swe_set_topo)      only used when CalcFlag.TOPOCTR is passed
//   - ephemeris path  (swe_set_ephe_path) set once during getSwissEph()
// The tropical public helpers in this file never touch the first two. Any helper that
// needs them must use withSwissEphState() (or Jyotish's withSiderealMode), which set,
// run a SYNCHRONOUS callback and restore the defaults before returning, so concurrent
// async callers can never observe each other's mode (JS is single threaded and the
// callback cannot yield).
let swissEph: SwissEph | null = null;
let swissEphInitPromise: Promise<void> | null = null;
let swissEphRuntimeInfo: SwissEphRuntimeRecord | null = null;
let swissEphStateDepth = 0;

const DEFAULT_FLAGS = CalcFlag.SWISS_EPH | CalcFlag.SPEED;
export const REQUIRED_EPHE_FILES = ["seas_18.se1", "semo_18.se1", "sepl_18.se1"] as const;

const NODE_EPHE_MOUNT_POINT = "/ephefs";
const NODE_EPHE_MEMFS_PATH = "/ephemem";

function emitRuntimeNotice(message: string): void {
  if (typeof process !== "undefined" && process.stderr && typeof process.stderr.write === "function") {
    process.stderr.write(`${message}\n`);
    return;
  }

  console.info(message);
}

type EmscriptenFs = NonNullable<SwissEphModule["FS"]>;

type NodeEphemerisStrategy = "nodefs-mount" | "host-path" | "memfs-copy";

interface VirtualEphemerisCheck {
  rootExists: boolean | null;
  visibleEntries: string[];
  missingFiles: string[];
}

interface ResolvedNodeEphemerisPath {
  path: string;
  strategy: NodeEphemerisStrategy;
}

interface NodeFsLike {
  readFileSync(path: string): Uint8Array;
}

interface PathModuleLike {
  join(...paths: string[]): string;
}

interface NodeBuiltins {
  fs: NodeFsLike & { existsSync(path: string): boolean };
  path: PathModuleLike & { resolve(...paths: string[]): string };
  url: { pathToFileURL(path: string): { href: string } };
}

// Dynamic import through a variable specifier: bundlers (webpack/vite/esbuild) cannot
// follow it, so browser bundles never try to resolve node built-ins, while native Node
// ESM and CJS both execute it natively.
function importNodeBuiltin(specifier: string): Promise<any> {
  return import(/* @vite-ignore */ /* webpackIgnore: true */ specifier);
}

let nodeBuiltins: NodeBuiltins | null = null;

/**
 * Load fs/path/url in a format-safe way. Native ESM has no `require`, so Node built-ins
 * are obtained with dynamic import (works in both ESM and CJS output).
 */
export async function loadSwissEphNodeBuiltins(): Promise<void> {
  if (nodeBuiltins) {
    return;
  }
  const [fs, path, url] = await Promise.all([
    importNodeBuiltin("node:fs"),
    importNodeBuiltin("node:path"),
    importNodeBuiltin("node:url"),
  ]);
  nodeBuiltins = { fs: fs.default ?? fs, path: path.default ?? path, url: url.default ?? url };
}

function getNodeBuiltinsSync(): NodeBuiltins {
  if (nodeBuiltins) {
    return nodeBuiltins;
  }

  const getBuiltin =
    typeof process !== "undefined"
      ? (process as unknown as { getBuiltinModule?: (id: string) => any }).getBuiltinModule
      : undefined;
  if (typeof getBuiltin === "function") {
    const get = getBuiltin.bind(process);
    nodeBuiltins = { fs: get("node:fs"), path: get("node:path"), url: get("node:url") };
    return nodeBuiltins;
  }

  if (typeof require === "function") {
    try {
      // Real `require` in CJS/Vitest; in native ESM esbuild's shim throws and we fall through.
      nodeBuiltins = {
        fs: require("fs") as NodeBuiltins["fs"],
        path: require("path") as NodeBuiltins["path"],
        url: require("url") as NodeBuiltins["url"],
      };
      return nodeBuiltins;
    } catch {
      // fall through to the typed error below
    }
  }

  throw new SwissEphError(
    "SWISSEPH_NODE_BUILTINS_UNAVAILABLE",
    "Node built-ins are not loaded yet. In native ESM on Node < 20.16, call `await getSwissEph()` (or `await loadSwissEphNodeBuiltins()`) before using the synchronous Swiss Ephemeris path helpers."
  );
}

/**
 * Directory of the module that is executing, for both module formats:
 * `import.meta.url` in native ESM (and Vite/Vitest), `__dirname` in the CJS bundle
 * (tsup leaves `import.meta` empty there). Returns undefined when neither is available
 * (for example a browser bundle), in which case only explicit/bundled browser paths are used.
 */
export function getSwissEphModuleDirectory(
  options: { moduleUrl?: string | null; cjsDirname?: string | null } = {}
): string | undefined {
  const moduleUrl = options.moduleUrl !== undefined ? options.moduleUrl : readImportMetaUrl();
  if (moduleUrl && moduleUrl.startsWith("file:")) {
    try {
      let pathname = decodeURIComponent(new URL(".", moduleUrl).pathname);
      if (/^\/[A-Za-z]:/.test(pathname)) {
        pathname = pathname.slice(1);
      }
      return pathname.length > 1 ? pathname.replace(/[\\/]+$/, "") : pathname;
    } catch {
      // fall through to the CJS directory
    }
  }

  const cjsDirname =
    options.cjsDirname !== undefined
      ? options.cjsDirname
      : typeof __dirname !== "undefined"
        ? __dirname
        : null;
  return cjsDirname ?? undefined;
}

function readImportMetaUrl(): string | null {
  try {
    return typeof import.meta !== "undefined" && typeof import.meta.url === "string"
      ? import.meta.url
      : null;
  } catch {
    return null;
  }
}

interface ResolveNodeEphemerisPathOptions {
  nodeFs?: NodeFsLike;
  pathModule?: PathModuleLike;
  mountPoint?: string;
  memfsPath?: string;
  requiredFiles?: readonly string[];
}

type RuntimeAssetSource = "explicit" | "env" | "candidate" | "bundled";

export interface SwissEphRuntimeAssetPaths {
  wasmPath: string;
  ephePath: string;
  wasmPathSource: RuntimeAssetSource;
  ephePathSource: RuntimeAssetSource;
}

export interface ResolveSwissEphRuntimeAssetsOptions {
  wasmPath?: string;
  ephePath?: string;
  wasmPathCandidates?: string[];
  ephePathCandidates?: string[];
  env?: Record<string, string | undefined>;
}

interface ResolveSwissEphRuntimeAssetsInternalOptions
  extends ResolveSwissEphRuntimeAssetsOptions {
  isBrowser?: boolean;
  existsSync?: (path: string) => boolean;
  nodePathResolve?: (...paths: string[]) => string;
  /** Override for the executing module's directory (tests inject fakes here). */
  moduleDirectory?: string;
  bundledNodeWasmPath?: string;
  bundledNodeEphePath?: string;
  bundledBrowserWasmPath?: string;
  bundledBrowserEphePath?: string;
}

const SWISS_EPH_RUNTIME_WASM_ENV_KEYS = [
  "KAABALAH_SWISSEPH_WASM_PATH",
  "KAABALAH_WASM_PATH"
] as const;

const SWISS_EPH_RUNTIME_EPHE_ENV_KEYS = [
  "KAABALAH_SWISSEPH_EPHE_PATH",
  "KAABALAH_EPHE_PATH"
] as const;

function getRuntimeEnv(
  env: ResolveSwissEphRuntimeAssetsOptions["env"]
): Record<string, string | undefined> {
  if (env) {
    return env;
  }

  if (typeof process !== "undefined" && process.env) {
    return process.env;
  }

  return {};
}

function firstDefinedEnvValue(
  env: Record<string, string | undefined>,
  keys: readonly string[]
): string | undefined {
  for (const key of keys) {
    const value = env[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  return undefined;
}

function getBundledNodeSwissEphAssets(
  options: ResolveSwissEphRuntimeAssetsInternalOptions
): { wasmPaths: string[]; ephePaths: string[] } {
  if (options.bundledNodeWasmPath && options.bundledNodeEphePath) {
    return {
      wasmPaths: [options.bundledNodeWasmPath],
      ephePaths: [options.bundledNodeEphePath]
    };
  }

  const resolvePath =
    options.nodePathResolve ?? ((...paths: string[]) => getNodeBuiltinsSync().path.resolve(...paths));
  const moduleDirectory = options.moduleDirectory ?? getSwissEphModuleDirectory();

  if (!moduleDirectory) {
    return {
      wasmPaths: [options.bundledNodeWasmPath].filter((value): value is string => typeof value === "string"),
      ephePaths: [options.bundledNodeEphePath].filter((value): value is string => typeof value === "string"),
    };
  }

  // Layouts covered (module directory -> assets):
  //   dist/<chunk>.{js,mjs}        -> dist/swisseph.node.wasm, ../wasm/build, ../ephe
  //   dist/<entry>/index.{js,mjs}  -> ../swisseph.node.wasm, ../../wasm/build, ../../ephe
  //   src/astrology/swisseph.ts    -> ../../wasm/build, ../../ephe
  return {
    wasmPaths: [
      options.bundledNodeWasmPath,
      resolvePath(moduleDirectory, "swisseph.node.wasm"),
      resolvePath(moduleDirectory, "../wasm/build/swisseph.node.wasm"),
      resolvePath(moduleDirectory, "../swisseph.node.wasm"),
      resolvePath(moduleDirectory, "../../wasm/build/swisseph.node.wasm")
    ].filter((value): value is string => typeof value === "string"),
    ephePaths: [
      options.bundledNodeEphePath,
      resolvePath(moduleDirectory, "../ephe"),
      resolvePath(moduleDirectory, "../../ephe")
    ].filter((value): value is string => typeof value === "string")
  };
}

function getBundledBrowserSwissEphAssets(
  options: ResolveSwissEphRuntimeAssetsInternalOptions
): { wasmPath: string; ephePath: string } {
  return {
    wasmPath: options.bundledBrowserWasmPath ?? wasmPathWeb,
    ephePath: options.bundledBrowserEphePath ?? "../ephe"
  };
}

function formatCandidatePaths(paths: string[]): string {
  return paths.length > 0 ? paths.join(", ") : "(none)";
}

function resolveBundledRuntimeAssetPath(
  label: "wasmPath" | "ephePath",
  bundledPaths: string[],
  existsSync: (path: string) => boolean
): { path: string; source: RuntimeAssetSource } {
  for (const bundledPath of bundledPaths) {
    if (existsSync(bundledPath)) {
      return {
        path: bundledPath,
        source: "bundled"
      };
    }
  }

  throw new SwissEphError(
    "SWISSEPH_ASSET_NOT_FOUND",
    `Unable to resolve Swiss Ephemeris ${label}. Bundled paths checked: ${formatCandidatePaths(
      bundledPaths
    )}.`,
    { label, checked: bundledPaths }
  );
}

function resolveRuntimeAssetPath(
  label: "wasmPath" | "ephePath",
  explicitPath: string | undefined,
  envPath: string | undefined,
  candidatePaths: string[],
  bundledPaths: string[],
  existsSync: (path: string) => boolean
): { path: string; source: RuntimeAssetSource } {
  if (explicitPath) {
    if (!existsSync(explicitPath)) {
      throw new SwissEphError(
        "SWISSEPH_ASSET_NOT_FOUND",
        `Swiss Ephemeris ${label} override does not exist: "${explicitPath}".`,
        { label, source: "explicit", path: explicitPath }
      );
    }

    return {
      path: explicitPath,
      source: "explicit"
    };
  }

  if (envPath) {
    if (!existsSync(envPath)) {
      throw new SwissEphError(
        "SWISSEPH_ASSET_NOT_FOUND",
        `Swiss Ephemeris ${label} from environment does not exist: "${envPath}".`,
        { label, source: "env", path: envPath }
      );
    }

    return {
      path: envPath,
      source: "env"
    };
  }

  for (const candidatePath of candidatePaths) {
    if (existsSync(candidatePath)) {
      return {
        path: candidatePath,
        source: "candidate"
      };
    }
  }

  try {
    return resolveBundledRuntimeAssetPath(label, bundledPaths, existsSync);
  } catch (error) {
    throw new SwissEphError(
      "SWISSEPH_ASSET_NOT_FOUND",
      `Unable to resolve Swiss Ephemeris ${label}. Checked candidate paths: ${formatCandidatePaths(
        candidatePaths
      )}. ${toError(error).message}`,
      { label, candidates: candidatePaths, bundled: bundledPaths }
    );
  }
}

function resolveSwissEphRuntimeAssetsInternal(
  options: ResolveSwissEphRuntimeAssetsInternalOptions = {}
): SwissEphRuntimeAssetPaths {
  const isBrowser =
    options.isBrowser ?? typeof window !== "undefined";

  if (isBrowser) {
    const bundledAssets = getBundledBrowserSwissEphAssets(options);
    return {
      wasmPath: options.wasmPath ?? bundledAssets.wasmPath,
      ephePath: options.ephePath ?? bundledAssets.ephePath,
      wasmPathSource: options.wasmPath ? "explicit" : "bundled",
      ephePathSource: options.ephePath ? "explicit" : "bundled"
    };
  }

  const env = getRuntimeEnv(options.env);
  const existsSync =
    options.existsSync ?? ((path: string) => getNodeBuiltinsSync().fs.existsSync(path));
  const bundledAssets = getBundledNodeSwissEphAssets(options);
  const envWasmPath = firstDefinedEnvValue(env, SWISS_EPH_RUNTIME_WASM_ENV_KEYS);
  const envEphePath = firstDefinedEnvValue(env, SWISS_EPH_RUNTIME_EPHE_ENV_KEYS);
  const resolvedWasm = resolveRuntimeAssetPath(
    "wasmPath",
    options.wasmPath,
    envWasmPath,
    options.wasmPathCandidates ?? [],
    bundledAssets.wasmPaths,
    existsSync
  );
  const resolvedEphe = resolveRuntimeAssetPath(
    "ephePath",
    options.ephePath,
    envEphePath,
    options.ephePathCandidates ?? [],
    bundledAssets.ephePaths,
    existsSync
  );

  return {
    wasmPath: resolvedWasm.path,
    ephePath: resolvedEphe.path,
    wasmPathSource: resolvedWasm.source,
    ephePathSource: resolvedEphe.source
  };
}

export function resolveSwissEphRuntimeAssets(
  options: ResolveSwissEphRuntimeAssetsOptions = {}
): SwissEphRuntimeAssetPaths {
  return resolveSwissEphRuntimeAssetsInternal(options);
}

/**
 * Async variant that first loads Node built-ins, so it also works synchronously-unsafe
 * environments (native ESM on Node < 20.16).
 */
export async function resolveSwissEphRuntimeAssetsAsync(
  options: ResolveSwissEphRuntimeAssetsOptions = {}
): Promise<SwissEphRuntimeAssetPaths> {
  if (typeof window === "undefined") {
    await loadSwissEphNodeBuiltins();
  }
  return resolveSwissEphRuntimeAssetsInternal(options);
}

/** @internal test seam: resolver with injected module directory / fs / path / browser flag. */
export function resolveSwissEphRuntimeAssetsWithOverrides(
  options: ResolveSwissEphRuntimeAssetsOptions & {
    moduleDirectory?: string;
    existsSync?: (path: string) => boolean;
    nodePathResolve?: (...paths: string[]) => string;
    isBrowser?: boolean;
  }
): SwissEphRuntimeAssetPaths {
  return resolveSwissEphRuntimeAssetsInternal(options);
}

function normalizeVirtualPath(path: string): string {
  if (path === "/") {
    return path;
  }

  return path.replace(/\/+$/, "") || "/";
}

function joinVirtualPath(rootPath: string, leaf: string): string {
  const normalizedRoot = normalizeVirtualPath(rootPath);
  return normalizedRoot === "/" ? `/${leaf}` : `${normalizedRoot}/${leaf}`;
}

function ensureVirtualDir(fs: EmscriptenFs, path: string): void {
  try {
    fs.mkdir(path);
  } catch {
    // Ignore existing directories and readonly mount roots.
  }
}

function safeAnalyzePath(fs: EmscriptenFs, path: string): boolean | null {
  if (!fs.analyzePath) {
    return null;
  }

  try {
    return fs.analyzePath(path).exists === true;
  } catch {
    return false;
  }
}

function safeReaddir(fs: EmscriptenFs, path: string): string[] {
  if (!fs.readdir) {
    return [];
  }

  try {
    return fs.readdir(path).filter((entry) => entry !== "." && entry !== "..");
  } catch {
    return [];
  }
}

export function inspectVirtualEphemerisPath(
  fs: EmscriptenFs | undefined,
  rootPath: string,
  requiredFiles: readonly string[] = REQUIRED_EPHE_FILES
): VirtualEphemerisCheck {
  if (!fs) {
    return {
      rootExists: null,
      visibleEntries: [],
      missingFiles: [...requiredFiles],
    };
  }

  const rootExists = safeAnalyzePath(fs, rootPath);
  const visibleEntries = safeReaddir(fs, rootPath);
  const missingFiles = requiredFiles.filter((file) => {
    const filePath = joinVirtualPath(rootPath, file);
    return !visibleEntries.includes(file) && safeAnalyzePath(fs, filePath) !== true;
  });

  return {
    rootExists,
    visibleEntries,
    missingFiles,
  };
}

function formatVirtualPathCheck(label: string, path: string, check: VirtualEphemerisCheck | null): string {
  if (!check) {
    return `${label} "${path}" could not be inspected.`;
  }

  const exists = check.rootExists == null ? "unknown" : check.rootExists ? "yes" : "no";
  const visibleEntries = check.visibleEntries.length > 0 ? check.visibleEntries.join(", ") : "(none)";
  const missingFiles = check.missingFiles.length > 0 ? check.missingFiles.join(", ") : "(none)";

  return `${label} "${path}" exists: ${exists}; visible entries: ${visibleEntries}; missing required files: ${missingFiles}.`;
}

function normalizeHostFileData(data: Uint8Array): Uint8Array {
  return data instanceof Uint8Array ? data : new Uint8Array(data);
}

function loadHostEphemerisFiles(
  ephePath: string,
  requiredFiles: readonly string[],
  nodeFs: NodeFsLike,
  pathModule: PathModuleLike
): Map<string, Uint8Array> {
  const files = new Map<string, Uint8Array>();

  for (const file of requiredFiles) {
    files.set(file, normalizeHostFileData(nodeFs.readFileSync(pathModule.join(ephePath, file))));
  }

  return files;
}

function writeEphemerisFilesToMemfs(
  fs: EmscriptenFs,
  targetPath: string,
  files: Map<string, Uint8Array>
): void {
  ensureVirtualDir(fs, targetPath);

  for (const [fileName, fileData] of files.entries()) {
    fs.writeFile(joinVirtualPath(targetPath, fileName), fileData);
  }
}

function toError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err));
}

function buildEphemerisResolutionError(
  finalEphePath: string,
  requiredFiles: readonly string[],
  details: {
    mountAttempted: boolean;
    mountPoint: string;
    mountCheck: VirtualEphemerisCheck | null;
    mountError: Error | null;
    hostCheck: VirtualEphemerisCheck | null;
    memfsPath: string;
    memfsCheck: VirtualEphemerisCheck | null;
    hostReadError: Error | null;
  }
): string {
  const parts = [
    `Unable to resolve Swiss Ephemeris data files. Expected ${requiredFiles.join(", ")} under "${finalEphePath}".`,
  ];

  if (details.mountAttempted) {
    parts.push(
      `${formatVirtualPathCheck("Mounted ephemeris path", details.mountPoint, details.mountCheck)} The NODEFS mount may have failed silently.`
    );
  }

  if (details.mountError) {
    parts.push(`Mounting the ephemeris directory failed: ${details.mountError.message}.`);
  }

  parts.push(formatVirtualPathCheck("Direct host ephemeris path", finalEphePath, details.hostCheck));

  if (details.memfsCheck) {
    parts.push(formatVirtualPathCheck("MEMFS ephemeris copy", details.memfsPath, details.memfsCheck));
  }

  if (details.hostReadError) {
    parts.push(`Reading host ephemeris files failed: ${details.hostReadError.message}.`);
  }

  parts.push(
    `Pass an explicit ephePath that contains ${requiredFiles.join(", ")} or ensure the packaged ephemeris directory is readable.`
  );

  return parts.join(" ");
}

export function resolveNodeEphemerisPath(
  module: SwissEphModule,
  finalEphePath: string,
  options: ResolveNodeEphemerisPathOptions = {}
): ResolvedNodeEphemerisPath {
  const fs = module.FS;
  const requiredFiles = options.requiredFiles ?? REQUIRED_EPHE_FILES;
  const mountPoint = options.mountPoint ?? NODE_EPHE_MOUNT_POINT;
  const memfsPath = options.memfsPath ?? NODE_EPHE_MEMFS_PATH;
  const nodeFs = options.nodeFs ?? getNodeBuiltinsSync().fs;
  const pathModule = options.pathModule ?? getNodeBuiltinsSync().path;

  let mountAttempted = false;
  let mountCheck: VirtualEphemerisCheck | null = null;
  let mountError: Error | null = null;
  let hostCheck: VirtualEphemerisCheck | null = null;
  let memfsCheck: VirtualEphemerisCheck | null = null;
  let hostReadError: Error | null = null;

  if (fs?.mount && fs.filesystems?.NODEFS) {
    mountAttempted = true;
    ensureVirtualDir(fs, mountPoint);

    try {
      fs.mount(fs.filesystems.NODEFS, { root: finalEphePath }, mountPoint);
      mountCheck = inspectVirtualEphemerisPath(fs, mountPoint, requiredFiles);

      if (mountCheck.missingFiles.length === 0) {
        return { path: mountPoint, strategy: "nodefs-mount" };
      }
    } catch (mountErr) {
      mountError = toError(mountErr);
    }
  }

  hostCheck = inspectVirtualEphemerisPath(fs, finalEphePath, requiredFiles);
  if (fs && hostCheck.missingFiles.length === 0) {
    return { path: finalEphePath, strategy: "host-path" };
  }

  let hostFiles: Map<string, Uint8Array> | null = null;
  try {
    hostFiles = loadHostEphemerisFiles(finalEphePath, requiredFiles, nodeFs, pathModule);
  } catch (err) {
    hostReadError = toError(err);
  }

  if (hostFiles && fs?.writeFile) {
    writeEphemerisFilesToMemfs(fs, memfsPath, hostFiles);
    memfsCheck = inspectVirtualEphemerisPath(fs, memfsPath, requiredFiles);

    if (memfsCheck.missingFiles.length === 0) {
      return { path: memfsPath, strategy: "memfs-copy" };
    }
  }

  if (hostFiles) {
    return { path: finalEphePath, strategy: "host-path" };
  }

  throw new SwissEphError(
    "SWISSEPH_EPHEMERIS_FILES_UNAVAILABLE",
    buildEphemerisResolutionError(finalEphePath, requiredFiles, {
      mountAttempted,
      mountPoint,
      mountCheck,
      mountError,
      hostCheck,
      memfsPath,
      memfsCheck,
      hostReadError,
    }),
    { ephePath: finalEphePath, requiredFiles: [...requiredFiles] }
  );
}

export type SwissEphMountMode = "nodefs-mount" | "host-path" | "memfs-copy" | "browser-memfs";

interface SwissEphRuntimeRecord {
  runtime: "node" | "browser";
  moduleDirectory: string | null;
  wasmPath: string;
  wasmPathSource: RuntimeAssetSource;
  ephePath: string;
  ephePathSource: RuntimeAssetSource;
  mountMode: SwissEphMountMode;
  /** Path handed to swe_set_ephe_path inside the module's virtual file system. */
  swissEphePath: string;
  nodeGlue: "bundled" | "external-file" | "browser";
  fs: SwissEphModule["FS"];
  probe: { ephemeris: SwissEphemerisKind | null; returnedFlags: number; warning: string | null };
}

export interface SwissEphInfo {
  initialized: boolean;
  strictEphemeris: boolean;
  runtime: "node" | "browser" | null;
  moduleDirectory: string | null;
  wasmPath: string | null;
  wasmPathSource: RuntimeAssetSource | null;
  /** Host (or URL) location the ephemeris files were loaded from. */
  ephePath: string | null;
  ephePathSource: RuntimeAssetSource | null;
  /** How the files were made visible to Swiss Ephemeris. */
  mountMode: SwissEphMountMode | null;
  /** Path Swiss Ephemeris searches (inside the wasm virtual file system). */
  swissEphePath: string | null;
  /** How the Emscripten glue was loaded (native ESM loads the shipped CJS file by URL). */
  nodeGlue: "bundled" | "external-file" | "browser" | null;
  /** Swiss Ephemeris version string; null because the shipped wasm build does not export swe_version. */
  swissEphemerisVersion: string | null;
  /** Required ephemeris files and whether each is visible to Swiss Ephemeris. */
  ephemerisFiles: { required: string[]; found: string[]; missing: string[] };
  /** Documented coverage of the shipped files (Swiss file naming: *_18.se1 = 1800-2399 CE). */
  shippedCoverage: { fromYear: number; toYearExclusive: number; note: string };
  /** Result of the init-time probe calculation (Sun at J2000, Swiss files requested). */
  probe: SwissEphRuntimeRecord["probe"] | null;
}

function emptySwissEphInfo(): SwissEphInfo {
  return {
    initialized: false,
    strictEphemeris: false,
    runtime: null,
    moduleDirectory: null,
    wasmPath: null,
    wasmPathSource: null,
    ephePath: null,
    ephePathSource: null,
    mountMode: null,
    swissEphePath: null,
    nodeGlue: null,
    swissEphemerisVersion: null,
    ephemerisFiles: { required: [...REQUIRED_EPHE_FILES], found: [], missing: [...REQUIRED_EPHE_FILES] },
    shippedCoverage: {
      fromYear: 1800,
      toYearExclusive: 2400,
      note: "Outside this range Swiss Ephemeris falls back to Moshier unless strictEphemeris is enabled.",
    },
    probe: null,
  };
}

/**
 * Report what the engine actually resolved: asset paths and where they came from, how the
 * ephemeris files are mounted, which files are visible, the Swiss version (if exposed),
 * and the init-time probe. Safe to call before initialization (reports initialized: false).
 */
export function getSwissEphInfo(): SwissEphInfo {
  const info = emptySwissEphInfo();
  if (!swissEph || !swissEphRuntimeInfo) {
    return info;
  }

  const record = swissEphRuntimeInfo;
  const check = inspectVirtualEphemerisPath(
    record.fs,
    record.swissEphePath,
    REQUIRED_EPHE_FILES
  );
  const missing = check.missingFiles;

  return {
    ...info,
    initialized: true,
    strictEphemeris: swissEph.strictEphemeris,
    runtime: record.runtime,
    moduleDirectory: record.moduleDirectory,
    wasmPath: record.wasmPath,
    wasmPathSource: record.wasmPathSource,
    ephePath: record.ephePath,
    ephePathSource: record.ephePathSource,
    mountMode: record.mountMode,
    swissEphePath: record.swissEphePath,
    nodeGlue: record.nodeGlue,
    swissEphemerisVersion: swissEph.getVersion(),
    ephemerisFiles: {
      required: [...REQUIRED_EPHE_FILES],
      found: REQUIRED_EPHE_FILES.filter((file) => !missing.includes(file)),
      missing,
    },
    probe: record.probe,
  };
}

/** Enable/disable process-wide strict mode (throw instead of returning substituted Moshier output). */
export function setSwissEphStrictEphemeris(enabled: boolean): void {
  checkInitialization();
  swissEph!.strictEphemeris = enabled;
}

export interface GetSwissEphOptions {
  ephePath?: string;
  wasmPath?: string;
  onRuntimeNotice?: (message: string) => void;
  /**
   * When true, any calculation for which Swiss Ephemeris silently substitutes another
   * ephemeris (e.g. Moshier outside the installed .se1 range) throws a
   * SwissEphEphemerisMismatchError. Applies to the shared instance, also when it is
   * already initialized.
   */
  strictEphemeris?: boolean;
}

/**
 * Locate and load the Emscripten glue for Node. CJS (and Vitest) use the bundled import;
 * the native-ESM build stubs the bundled copy out at build time (it is CommonJS code that
 * needs `require`/`__dirname`) and instead imports the shipped CJS file by URL, which Node
 * evaluates natively.
 */
async function loadNodeModuleFactory(
  moduleDirectory: string | undefined
): Promise<{ factory: SwissEphModuleFactory; glue: "bundled" | "external-file" }> {
  const bundled = (await import("../../wasm/build/swisseph.node.js")).default as unknown as
    | SwissEphModuleFactory
    | undefined;
  if (typeof bundled === "function") {
    return { factory: bundled, glue: "bundled" };
  }

  await loadSwissEphNodeBuiltins();
  const { fs, path, url } = nodeBuiltins!;
  const candidates = moduleDirectory
    ? [
        path.resolve(moduleDirectory, "swisseph.node.js"),
        path.resolve(moduleDirectory, "../swisseph.node.js"),
        path.resolve(moduleDirectory, "../wasm/build/swisseph.node.js"),
        path.resolve(moduleDirectory, "../../wasm/build/swisseph.node.js"),
      ]
    : [];
  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    throw new SwissEphError(
      "SWISSEPH_ASSET_NOT_FOUND",
      `Unable to locate the Swiss Ephemeris runtime (swisseph.node.js). Checked: ${formatCandidatePaths(candidates)}.`,
      { label: "runtime", checked: candidates }
    );
  }
  const mod = await importNodeBuiltin(url.pathToFileURL(found).href);
  const factory = (mod.default ?? mod) as SwissEphModuleFactory;
  return { factory, glue: "external-file" };
}

async function initializeSwissEph(options: GetSwissEphOptions): Promise<void> {
  const notice = options.onRuntimeNotice ?? emitRuntimeNotice;
  const isBrowser = typeof window !== "undefined";
  if (!isBrowser) {
    await loadSwissEphNodeBuiltins();
  }

  const runtimeAssets = resolveSwissEphRuntimeAssets({
    wasmPath: options.wasmPath,
    ephePath: options.ephePath
  });
  const finalWasmPath = runtimeAssets.wasmPath;
  const moduleDirectory = isBrowser ? undefined : getSwissEphModuleDirectory();

  let moduleFactory: SwissEphModuleFactory;
  let nodeGlue: SwissEphRuntimeRecord["nodeGlue"] = "browser";
  if (isBrowser) {
    moduleFactory = (await import("../../wasm/build/swisseph.web.js")).default as unknown as SwissEphModuleFactory;
  } else {
    const loaded = await loadNodeModuleFactory(moduleDirectory);
    moduleFactory = loaded.factory;
    nodeGlue = loaded.glue;
  }

  const module = await moduleFactory({
    locateFile: () => finalWasmPath,
  });

  const instance = new SwissEph(module);
  const finalEphePath = runtimeAssets.ephePath;
  let mountMode: SwissEphMountMode;
  let swissEphePath: string;

  if (isBrowser) {
    // In the browser, fetch and write ephemeris files into MEMFS
    const epheFsPath = "/ephe";
    try {
      module.FS?.mkdir?.(epheFsPath);
    } catch {
      // ignore if exists
    }
    await Promise.all(
      REQUIRED_EPHE_FILES.map(async (name) => {
        const url = `${finalEphePath}/${name}`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new SwissEphError(
            "SWISSEPH_EPHEMERIS_FILES_UNAVAILABLE",
            `Failed to fetch ephemeris file: ${url} (HTTP ${res.status}). Serve ${REQUIRED_EPHE_FILES.join(", ")} at "${finalEphePath}" or pass an explicit ephePath.`,
            { url, status: res.status, ephePath: finalEphePath }
          );
        }
        const buf = await res.arrayBuffer();
        module.FS?.writeFile?.(`${epheFsPath}/${name}`, new Uint8Array(buf));
      })
    );
    const browserCheck = inspectVirtualEphemerisPath(module.FS, epheFsPath, REQUIRED_EPHE_FILES);
    if (browserCheck.missingFiles.length > 0) {
      throw new SwissEphError(
        "SWISSEPH_EPHEMERIS_FILES_UNAVAILABLE",
        `Failed to materialize browser ephemeris files at "${epheFsPath}". Missing: ${browserCheck.missingFiles.join(", ")}.`,
        { ephePath: epheFsPath, missing: browserCheck.missingFiles }
      );
    }
    notice(`Setting ephemeris path to: ${epheFsPath}`);
    instance.setEphemerisPath(epheFsPath);
    mountMode = "browser-memfs";
    swissEphePath = epheFsPath;
  } else {
    const resolution = resolveNodeEphemerisPath(module, finalEphePath);
    if (resolution.strategy === "nodefs-mount") {
      notice(`Setting ephemeris path to: ${resolution.path} (mounted from ${finalEphePath})`);
    } else if (resolution.strategy === "memfs-copy") {
      notice(`Setting ephemeris path to: ${resolution.path} (copied from ${finalEphePath})`);
    } else {
      notice(`Setting ephemeris path to: ${resolution.path}`);
    }
    instance.setEphemerisPath(resolution.path);
    mountMode = resolution.strategy === "nodefs-mount" ? "nodefs-mount" : resolution.strategy === "memfs-copy" ? "memfs-copy" : "host-path";
    swissEphePath = resolution.path;
  }

  // Probe: prove Swiss Ephemeris really reads the .se1 files (a bad ephePath otherwise
  // degrades silently to Moshier). J2000 sits inside every shipped file.
  const probeJulianDay = 2451545.0;
  const probe = (() => {
    try {
      return instance.calculatePlanetPositionDetailed(probeJulianDay, Planet.SUN, CalcFlag.SWISS_EPH, {
        strictEphemeris: false,
      });
    } catch (error) {
      throw new SwissEphError(
        "SWISSEPH_EPHEMERIS_FILES_UNAVAILABLE",
        `Swiss Ephemeris could not read the ephemeris files at "${swissEphePath}" (from "${finalEphePath}"): ${toError(error).message}`,
        { ephePath: finalEphePath, swissEphePath }
      );
    }
  })();
  if (probe.substituted) {
    throw new SwissEphError(
      "SWISSEPH_EPHEMERIS_FILES_UNAVAILABLE",
      `Swiss Ephemeris could not use the Swiss ephemeris files at "${swissEphePath}" (from "${finalEphePath}") and fell back to "${probe.ephemeris}". Pass an explicit ephePath that contains ${REQUIRED_EPHE_FILES.join(", ")}.${probe.warning ? ` Swiss Ephemeris said: ${probe.warning.trim()}` : ""}`,
      { ephePath: finalEphePath, swissEphePath, warning: probe.warning }
    );
  }

  instance.strictEphemeris = options.strictEphemeris === true;
  swissEphRuntimeInfo = {
    runtime: isBrowser ? "browser" : "node",
    moduleDirectory: moduleDirectory ?? null,
    wasmPath: finalWasmPath,
    wasmPathSource: runtimeAssets.wasmPathSource,
    ephePath: finalEphePath,
    ephePathSource: runtimeAssets.ephePathSource,
    mountMode,
    swissEphePath,
    nodeGlue,
    fs: module.FS,
    probe: { ephemeris: probe.ephemeris, returnedFlags: probe.returnedFlags, warning: probe.warning },
  };
  swissEph = instance;
}

/**
 * Initializes the shared Swiss Ephemeris instance (idempotent; concurrent first calls share
 * one initialization).
 * In a browser environment, assets are loaded relative to the script.
 * In Node.js, assets are resolved next to the running module (`import.meta.url` in native
 * ESM, `__dirname` in CJS), so default initialization works from a packed install.
 * @param options - Optional overrides for asset paths.
 * @param options.ephePath - Path to the directory containing ephemeris data files.
 * @param options.wasmPath - Path to the `swisseph.wasm` file.
 * @param options.onRuntimeNotice - Optional sink for path setup notices; defaults to stderr.
 * @param options.strictEphemeris - Throw when Swiss Ephemeris substitutes Moshier output.
 * @throws SwissEphError with a stable `code` (asset not found, ephemeris files unavailable, ...).
 */
export async function getSwissEph(options: GetSwissEphOptions = {}): Promise<void> {
  if (swissEph) {
    if (options.strictEphemeris !== undefined) {
      swissEph.strictEphemeris = options.strictEphemeris;
    }
    return;
  }

  if (!swissEphInitPromise) {
    swissEphInitPromise = initializeSwissEph(options).finally(() => {
      swissEphInitPromise = null;
    });
  }
  // Errors propagate to every concurrent caller as typed errors; nothing is logged here.
  await swissEphInitPromise;
}

/**
 * Calculate planetary positions for a given date
 */
/**
 * Calculate the position of a single planet by its enum ID.
 * Much cheaper than calculatePlanetaryPositions when only one body is needed.
 */
export function calculateSinglePlanetPosition(
  date: Date,
  planet: Planet
): PlanetPosition {
  checkInitialization();
  const julday = swissEph!.getJulianDay(date);
  return swissEph!.calculatePlanetPosition(julday, planet, DEFAULT_FLAGS);
}

export interface CalculatePlanetPositionDetailedOptions extends CalculatePositionOptions {
  /** Swiss flags; defaults to SWISS_EPH | SPEED (the same as every other helper here). */
  flags?: number;
}

/**
 * Like calculateSinglePlanetPosition, but also reports provenance: the requested and
 * returned Swiss flags and a derived `ephemeris` label ("swiss" | "moshier" | "jpl").
 * `substituted` is true when Swiss Ephemeris returned a different ephemeris than requested
 * (for example Moshier outside the installed .se1 range); with `strictEphemeris` that
 * throws SwissEphEphemerisMismatchError instead.
 */
export function calculatePlanetPositionDetailed(
  date: Date,
  planet: Planet,
  options: CalculatePlanetPositionDetailedOptions = {}
): PlanetPositionDetailed {
  checkInitialization();
  const julday = swissEph!.getJulianDay(date);
  return swissEph!.calculatePlanetPositionDetailed(julday, planet, options.flags ?? DEFAULT_FLAGS, {
    strictEphemeris: options.strictEphemeris,
  });
}

/**
 * Run `fn` with Swiss global state (sidereal mode and/or topocentric observer) set, then
 * restore the Swiss defaults (sidereal Fagan/Bradley = 0, topocentric 0/0/0) before
 * returning, even if `fn` throws. The callback must be SYNCHRONOUS: because the state is
 * process-wide, awaiting inside would let a concurrent caller observe it. A promise result
 * and re-entrant use are rejected with SWISSEPH_STATE_MISUSE. Callers still opt in per call by
 * adding CalcFlag.SIDEREAL / CalcFlag.TOPOCTR to the flags they pass.
 */
export function withSwissEphState<T>(
  state: {
    sidereal?: { mode: number; t0?: number; ayanT0?: number };
    topocentric?: { longitude: number; latitude: number; altitudeMeters?: number };
  },
  fn: () => T
): T {
  checkInitialization();
  if (swissEphStateDepth > 0) {
    throw new SwissEphError("SWISSEPH_STATE_MISUSE", "withSwissEphState cannot be nested.");
  }
  swissEphStateDepth++;
  try {
    if (state.sidereal) {
      swissEph!.setSiderealMode(state.sidereal.mode, state.sidereal.t0 ?? 0, state.sidereal.ayanT0 ?? 0);
    }
    if (state.topocentric) {
      swissEph!.setTopocentric(
        state.topocentric.longitude,
        state.topocentric.latitude,
        state.topocentric.altitudeMeters ?? 0
      );
    }
    const result = fn();
    if (result !== null && typeof result === "object" && typeof (result as { then?: unknown }).then === "function") {
      throw new SwissEphError("SWISSEPH_STATE_MISUSE", "withSwissEphState callback must be synchronous.");
    }
    return result;
  } finally {
    if (state.sidereal) {
      swissEph!.setSiderealMode(0, 0, 0);
    }
    if (state.topocentric) {
      swissEph!.setTopocentric(0, 0, 0);
    }
    swissEphStateDepth--;
  }
}

/**
 * Calculate equatorial coordinates (Right Ascension / Declination) for a planet.
 * Uses the existing EQUATORIAL flag — RA is returned in the longitude field,
 * Dec in the latitude field by Swiss Ephemeris convention.
 */
export interface EquatorialPosition {
  rightAscension: number;
  declination: number;
  distance: number;
}

export function calculateEquatorialPosition(
  date: Date,
  planet: Planet
): EquatorialPosition {
  checkInitialization();
  const julday = swissEph!.getJulianDay(date);
  const pos = swissEph!.calculatePlanetPosition(
    julday,
    planet,
    CalcFlag.SWISS_EPH | CalcFlag.EQUATORIAL
  );
  return {
    rightAscension: pos.longitude,
    declination: pos.latitude,
    distance: pos.distance,
  };
}

/**
 * Get the Julian day for a Date (UTC).
 */
export function getJulianDay(date: Date): number {
  checkInitialization();
  return swissEph!.getJulianDay(date);
}

/**
 * Millisecond-exact UT Julian Day for a Date (pure arithmetic; needs no initialised ephemeris).
 * Unlike {@link getJulianDay} (whole seconds, kept unchanged for compatibility) this keeps the
 * sub-second part, so it is the right coordinate for `calculateBodyAtJulianDay` /
 * `calculateHousesAtJulianDay`. Equal to `getJulianDay` for whole-second instants (to float rounding).
 */
export function getJulianDayExact(date: Date): number {
  return date.getTime() / 86_400_000 + 2440587.5;
}

/**
 * Find the next rise, set, or meridian transit of a planet at a location.
 * Returns the Julian day of the event.
 */
export function calculateRiseTransit(
  date: Date,
  planet: Planet,
  latitude: number,
  longitude: number,
  event: RiseTransitFlag
): number {
  checkInitialization();
  const julday = swissEph!.getJulianDay(date);
  return swissEph!.riseTransit(julday, planet, event, longitude, latitude);
}

/**
 * Convert ecliptic coordinates to horizon coordinates (azimuth/altitude).
 */
export function calculateAzalt(
  date: Date,
  latitude: number,
  longitude: number,
  eclLon: number,
  eclLat: number,
  dist: number
): AzaltResult {
  checkInitialization();
  const julday = swissEph!.getJulianDay(date);
  return swissEph!.azalt(julday, longitude, latitude, 0, eclLon, eclLat, dist);
}

export async function calculatePlanetaryPositions(
  date: Date
): Promise<Record<Planet, PlanetPosition>> {
  try {
    checkInitialization();

    const julday = swissEph!.getJulianDay(date);
    const flags = DEFAULT_FLAGS;
    const planets: Record<string, Planet> = {
      sun: Planet.SUN,
      moon: Planet.MOON,
      mercury: Planet.MERCURY,
      venus: Planet.VENUS,
      mars: Planet.MARS,
      jupiter: Planet.JUPITER,
      saturn: Planet.SATURN,
      uranus: Planet.URANUS,
      neptune: Planet.NEPTUNE,
      pluto: Planet.PLUTO,
      meanNode: Planet.MEAN_NODE,
      trueNode: Planet.TRUE_NODE,
      chiron: Planet.CHIRON,
      lilithMean: Planet.LILITH_MEAN,
      lilithTrue: Planet.LILITH_TRUE,
    };

    const positions: Record<Planet, PlanetPosition> = {} as Record<
      Planet,
      PlanetPosition
    >;
    for (const id of Object.values(planets)) {
      try {
        positions[id] = swissEph!.calculatePlanetPosition(julday, id, flags);
      } catch (error) {
        if (error instanceof SwissEphError) {
          // Keep the typed error (code/details) instead of flattening it into a string.
          throw error;
        }
        throw new Error(
          `Failed to calculate position for ${PLANET_AND_NODE_NAMES[id]}: ${error}`
        );
      }
    }

    return positions;
  } catch (error) {
    throw error;
  }
}

/**
 * Calculate houses for a given date and location
 */
export async function calculateHouses(
  date: Date | LocalDateTimeParts,
  latitude: number,
  longitude: number,
  houseSystem: HouseSystem,
  options: TimeZoneOptions = {}
): Promise<Houses> {
  try {
    checkInitialization();

    // Interpret the provided date as local civil time by default.
    // For backward compatibility, allow callers to treat the date as UT.
    const dateForUt =
      options.treatAsUTC === true
        ? (date instanceof Date ? date : createUtcDateFromParts(buildLocalParts(date)))
        : await localToUtcDate(date, latitude, longitude, options);

    const julday = swissEph!.getJulianDay(dateForUt);
    return swissEph!.calculateHouses(
      julday,
      latitude,
      longitude,
      houseSystem
    );
  } catch (error) {
    // Errors are rethrown unchanged; library code does not log.
    throw error;
  }
}
/**
 * Calculate an asteroid by MPC number
 */
export async function calculateAsteroidPosition(
  date: Date,
  mpcNumber: number
): Promise<PlanetPosition> {
  try {
    checkInitialization();

    const julday = swissEph!.getJulianDay(date);
    return swissEph!.calculateAsteroidPosition(
      julday,
      mpcNumber,
      DEFAULT_FLAGS
    );
  } catch (error) {
    throw error;
  }
}

/**
 * Fortune part utility (requires Asc, Sun, Moon and diurnal/nocturnal)
 * diurnal: Asc + Moon - Sun ; nocturnal: Asc + Sun - Moon
 */
export function calcParsFortunae(
  asc: number,
  sunLon: number,
  moonLon: number,
  isDiurnal: boolean
): number {
  return parsFortunae(asc, sunLon, moonLon, isDiurnal);
}

/**
 * Clean up Swiss Ephemeris resources
 */
export function closeSwissEph(): void {
  if (swissEph) {
    try {
      swissEph.close();
      swissEph = null;
      swissEphRuntimeInfo = null;
    } catch (error) {
      throw error;
    }
  }
}

function checkInitialization(): void {
  if (!swissEph) {
    throw new SwissEphError(
      "SWISSEPH_NOT_INITIALIZED",
      "Swiss Ephemeris not initialized. Call getSwissEph() first."
    );
  }
}

// Re-export types and enums for convenience
export {
  ephemerisFromFlags,
  SwissEphError,
  SwissEphEphemerisMismatchError,
  type PlanetPositionDetailed,
  type SwissEphErrorCode,
  type SwissEphemerisKind,
  type AzaltResult,
  CalcFlag,
  HouseSystem,
  normalizeAngle,
  Planet,
  PLANET_AND_NODE_NAMES,
  PlanetPosition,
  RiseTransitFlag,
  VirtualNodes
};

/**
 * Local civil time handling (DST-aware)
 * Convert a local date-time (given via IANA time zone, explicit UTC offset, or auto from lat/lon)
 * into a UTC Date for Swiss Ephemeris (which expects UT).
 */
export interface LocalDateTimeParts {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour?: number; // 0-23
  minute?: number; // 0-59
  second?: number; // 0-59
}

export type TimeZoneOptions = {
  /**
   * IANA time zone
   * If provided, DST is handled automatically via Intl API.
   */
  timeZone?: string;
  /**
   * Explicit UTC offset in minutes for the local civil time.
   * Positive for east of Greenwich, negative for west (e.g., -180 for UTC-3).
   * If provided, overrides timeZone.
   */
  utcOffsetMinutes?: number;
  /**
   * Optional resolver to derive an IANA time zone from coordinates and date.
   * Use an external library (e.g., tz-lookup) and pass it here.
   */
  resolveTimeZone?: (latitude: number, longitude: number, local: LocalDateTimeParts) => string | undefined;
  /**
   * When true (default), try to auto-resolve the IANA time zone from lat/lon using tz-lookup
   * if no explicit offset/timeZone is provided.
   */
  autoTimeZone?: boolean;
  /**
   * When true, the date is treated as UTC instead of local civil time.
   */
  treatAsUTC?: boolean;
};

function buildLocalParts(date: Date | LocalDateTimeParts): LocalDateTimeParts {
  if (date instanceof Date) {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
    };
  }
  return date;
}

function createUtcDateFromParts(parts: LocalDateTimeParts): Date {
  const { year, month, day, hour = 0, minute = 0, second = 0 } = parts;
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
}

/**
 * Compute the time zone offset (in ms) for a given instant and IANA time zone.
 * Based on the approach used by date-fns-tz.
 */
function getTimeZoneOffsetMs(instant: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = dtf.formatToParts(instant);
  const map: Record<string, string> = {};
  for (const p of parts) {
    map[p.type] = p.value;
  }
  const asUTC = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second)
  );
  return asUTC - instant.getTime();
}

/**
 * Convert a local civil date-time to a UTC Date using either an explicit offset,
 * an IANA time zone (DST-aware), a custom resolver, or auto lat/lon resolution.
 * If no time zone information can be derived, throws.
 */
async function localToUtcDate(
  local: Date | LocalDateTimeParts,
  latitude?: number,
  longitude?: number,
  opts: TimeZoneOptions = {}
): Promise<Date> {
  // Treat the date as already UTC — no conversion needed
  if (opts.treatAsUTC === true) {
    return local instanceof Date ? local : createUtcDateFromParts(buildLocalParts(local));
  }

  const parts = buildLocalParts(local);
  const auto = opts.autoTimeZone !== false;

  // 1) Explicit offset takes precedence
  if (typeof opts.utcOffsetMinutes === "number" && Number.isFinite(opts.utcOffsetMinutes)) {
    const utcMs = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour ?? 0,
      parts.minute ?? 0,
      parts.second ?? 0
    );
    return new Date(utcMs - opts.utcOffsetMinutes * 60_000);
  }

  // 2) IANA time zone provided
  if (opts.timeZone) {
    const naiveUtc = createUtcDateFromParts(parts);
    const offsetMs = getTimeZoneOffsetMs(naiveUtc, opts.timeZone);
    return new Date(naiveUtc.getTime() - offsetMs);
  }

  // 3) Custom resolver
  if (
    opts.resolveTimeZone &&
    typeof latitude === "number" &&
    typeof longitude === "number"
  ) {
    const tz = opts.resolveTimeZone(latitude, longitude, parts);
    if (tz) {
      const naiveUtc = createUtcDateFromParts(parts);
      const offsetMs = getTimeZoneOffsetMs(naiveUtc, tz);
      return new Date(naiveUtc.getTime() - offsetMs);
    }
  }

  // 4) Auto resolve with tz-lookup if allowed and coords available
  if (
    auto &&
    typeof latitude === "number" &&
    typeof longitude === "number"
  ) {

    const mod = await import("tz-lookup");
    const lookup = mod.default ?? mod;
    const tz = lookup(latitude, longitude);
    if (tz) {
      const naiveUtc = createUtcDateFromParts(parts);
      const offsetMs = getTimeZoneOffsetMs(naiveUtc, tz);
      return new Date(naiveUtc.getTime() - offsetMs);
    }
  }

  throw new Error(
    "Time zone information is required. Provide 'utcOffsetMinutes', 'timeZone', 'resolveTimeZone', or enable autoTimeZone with latitude/longitude."
  );
}

/**
 * Public helper to convert a local civil date-time to a UTC Date using the same
 * logic as house calculations.
 */
export async function toUtcDate(
  local: Date | LocalDateTimeParts,
  latitude?: number,
  longitude?: number,
  options: TimeZoneOptions = {}
): Promise<Date> {
  return localToUtcDate(local, latitude, longitude, options);
}

/**
 * Low-level Julian-day primitives used by the Jyotish module.
 *
 * These are thin, synchronous wrappers over the initialised Swiss Ephemeris
 * instance. They never change the library defaults used by the tropical APIs.
 */

/** Swiss Ephemeris pseudo-body index SE_ECL_NUT (true obliquity is returned in the first slot). */
export const SWISS_ECL_NUT = -1;

/** Swiss Ephemeris sidereal mode id for Lahiri (SE_SIDM_LAHIRI). */
export const SWISS_SIDM_LAHIRI = 1;

/**
 * Calculate one body at an explicit UT Julian day with explicit Swiss flags
 * (a bitwise OR of {@link CalcFlag}). `body` may be a {@link Planet} or
 * {@link SWISS_ECL_NUT}.
 */
export function calculateBodyAtJulianDay(
  julianDayUt: number,
  body: number,
  flags: number
): PlanetPosition {
  checkInitialization();
  return swissEph!.calculatePlanetPosition(julianDayUt, body, flags);
}

/**
 * Like {@link calculateBodyAtJulianDay} but reports provenance (the ephemeris Swiss actually used,
 * `substituted`, warning text) and honours a per-call `strictEphemeris`
 * (throws SwissEphEphemerisMismatchError on a silent substitution such as Moshier).
 */
export function calculateBodyAtJulianDayDetailed(
  julianDayUt: number,
  body: number,
  flags: number,
  options: CalculatePositionOptions = {}
): PlanetPositionDetailed {
  checkInitialization();
  return swissEph!.calculatePlanetPositionDetailed(julianDayUt, body, flags, {
    strictEphemeris: options.strictEphemeris,
  });
}

/**
 * Calculate house cusps and angles at an explicit UT Julian day, with no
 * time-zone handling. Tropical (the Swiss default); sidereal conversion is the
 * caller's responsibility.
 */
export function calculateHousesAtJulianDay(
  julianDayUt: number,
  latitude: number,
  longitude: number,
  houseSystem: HouseSystem
): Houses {
  checkInitialization();
  return swissEph!.calculateHouses(julianDayUt, latitude, longitude, houseSystem);
}

/**
 * Run `fn` with the given Swiss sidereal mode selected, then restore the
 * default sidereal mode (Fagan/Bradley = 0, the Swiss Ephemeris initial state;
 * this library does not otherwise use sidereal mode). The callback must be
 * synchronous: the mode is mutable global Swiss state, so awaiting inside it
 * could let a concurrent call observe it. A promise result is rejected.
 */
export function withSiderealMode<T>(mode: number, fn: () => T): T {
  checkInitialization();
  swissEph!.setSiderealMode(mode, 0, 0);
  try {
    const result = fn();
    if (result !== null && typeof result === "object" && typeof (result as { then?: unknown }).then === "function") {
      throw new Error("withSiderealMode callback must be synchronous");
    }
    return result;
  } finally {
    swissEph!.setSiderealMode(0, 0, 0);
  }
}
