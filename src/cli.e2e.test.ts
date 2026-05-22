import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

import { afterEach, beforeAll, describe, expect, it } from "vitest";

import packageJson from "../package.json";
import { MAX_STDIN_BYTES } from "./cli/runtime/stdin";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const CLI_PATH = resolve(ROOT, "dist/cli.js");
const NPM_COMMAND = process.platform === "win32" ? "npm.cmd" : "npm";
const VERSION = packageJson.version;
const REAL_WASM_PATH = resolve(ROOT, "wasm/build/swisseph.node.wasm");
const REAL_EPHE_PATH = resolve(ROOT, "ephe");

type ProcessResult = SpawnSyncReturns<string>;

interface RunOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  input?: string;
}

const tempDirs: string[] = [];

function makeTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "kaabalah-cli-"));
  tempDirs.push(dir);
  return dir;
}

function writeJson(path: string, value: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(value, null, 2));
}

function runProcess(command: string, args: string[], options: RunOptions = {}): ProcessResult {
  return spawnSync(command, args, {
    cwd: options.cwd ?? ROOT,
    encoding: "utf8",
    env: {
      ...process.env,
      FORCE_COLOR: "0",
      ...options.env,
    },
    input: options.input,
    maxBuffer: 16 * 1024 * 1024,
  });
}

function assertSuccess(result: ProcessResult, label: string): void {
  if (result.error) {
    throw result.error;
  }

  expect(result.status, [label, result.stdout, result.stderr].filter(Boolean).join("\n")).toBe(0);
}

function runCli(args: string[], input?: string): ProcessResult {
  const result = runProcess(process.execPath, [CLI_PATH, ...args], { input });
  if (result.error) {
    throw result.error;
  }
  return result;
}

function runCliWithOptions(args: string[], options: RunOptions): ProcessResult {
  const result = runProcess(process.execPath, [CLI_PATH, ...args], options);
  if (result.error) {
    throw result.error;
  }
  return result;
}

function parseJsonOutput(stdout: string): unknown {
  return JSON.parse(stdout);
}

beforeAll(() => {
  assertSuccess(runProcess(NPM_COMMAND, ["run", "build"]), "CLI build failed");
}, 120000);

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("CLI contract", () => {
  it("preserves the stable help schema for agents", () => {
    const result = runCli(["help", "--json", "--compact"]);
    assertSuccess(result, "help --json");

    const payload = JSON.parse(result.stdout) as {
      version: string;
      commands: Array<{ name: string; args: Array<{ name: string }>; flags: Array<{ name: string }> }>;
      globalFlags: Array<{ name: string }>;
    };

    expect(payload.version).toBe(VERSION);
    expect(payload.commands.map((command) => command.name)).toEqual([
      "gematria",
      "gematria:reverse",
      "numerology",
      "numerology:lifepath",
      "numerology:cycles",
      "numerology:challenges",
      "numerology:fibonacci",
      "tarot",
      "tarot:card",
      "tarot:spread",
      "ifa",
      "tree",
      "tree:node",
      "tree:find",
      "tree:types",
      "tree:layout",
      "tree:topology",
      "tree:svg",
      "tree:ascii",
      "astrology",
      "astrology:wheel",
      "astrology:synastry",
      "astrology:composite",
      "astrology:transits",
      "astrology:solar-return",
      "astrology:profections",
      "astrology:profections:monthly",
      "astrology:firdaria",
      "astrology:decans",
      "astrology:dodecatemoria",
      "astrology:astrocartography",
      "astrology:astrocartography:query",
      "help",
    ]);
    expect(payload.globalFlags.map((flag) => flag.name)).toEqual([
      "json",
      "no-json",
      "compact",
      "fields",
      "input-json",
      "debug",
      "trace",
    ]);
    expect(payload.commands.find((command) => command.name === "astrology")).toMatchObject({
      args: [{ name: "date" }, { name: "time" }],
      flags: [
        { name: "lat" },
        { name: "lon" },
        { name: "location" },
        { name: "house-system" },
        { name: "timezone" },
        { name: "max-orb" },
        { name: "aspect-types" },
        { name: "wasm-path" },
        { name: "ephe-path" },
      ],
    });
    expect(payload.commands.find((command) => command.name === "astrology:wheel")).toMatchObject({
      args: [{ name: "date" }, { name: "time" }],
      flags: expect.arrayContaining([
        expect.objectContaining({ name: "lat" }),
        expect.objectContaining({ name: "lon" }),
        expect.objectContaining({ name: "width" }),
        expect.objectContaining({ name: "height" }),
        expect.objectContaining({ name: "background" }),
        expect.objectContaining({ name: "palette" }),
        expect.objectContaining({ name: "no-aspects" }),
        expect.objectContaining({ name: "render-model" }),
        expect.objectContaining({ name: "output" }),
      ]),
    });
  });

  it("keeps numerology field projection stable", () => {
    const result = runCli([
      "numerology",
      "1900-01-08",
      "--json",
      "--compact",
      "--fields=kaabalistic.lifePath.reducedValue",
    ]);
    assertSuccess(result, "numerology --fields");

    expect(JSON.parse(result.stdout)).toEqual({
      kaabalistic: {
        lifePath: {
          reducedValue: 1,
        },
      },
    });
  });

  it("supports space-separated option values", () => {
    const result = runCli([
      "numerology",
      "1900-01-08",
      "--json",
      "--compact",
      "--fields",
      "kaabalistic.lifePath.reducedValue",
    ]);
    assertSuccess(result, "numerology --fields value");

    expect(JSON.parse(result.stdout)).toEqual({
      kaabalistic: {
        lifePath: {
          reducedValue: 1,
        },
      },
    });
  });

  it("keeps gematria JSON output stable for core sums", () => {
    const result = runCli(["gematria", "DAVID", "--json", "--compact"]);
    assertSuccess(result, "gematria --json");

    expect(JSON.parse(result.stdout)).toMatchObject({
      vowels: { originalSum: 11 },
      consonants: { originalSum: 14 },
      synthesis: { originalSum: 25 },
      includedLetters: expect.any(Array),
    });
  });

  it("exposes tree correspondences with descriptor and edge provenance", () => {
    const result = runCli([
      "tree",
      "--json",
      "--compact",
    ]);
    assertSuccess(result, "tree --json");

    const payload = JSON.parse(result.stdout) as {
      descriptor: { system: string; parts: string[] };
      edges: Array<{ from: string; to: string; sources?: Array<{ kind: string; system?: string }> }>;
    };
    const systemEdge = payload.edges.find(
      (edge) =>
        edge.from === "number:1" && edge.to === "sphere:Kether" ||
        edge.from === "sphere:Kether" && edge.to === "number:1"
    );

    expect(payload.descriptor).toMatchObject({
      system: "kaabalah",
      parts: ["westernAstrology", "tarot"],
    });
    expect(systemEdge?.sources).toContainEqual({
      kind: "system",
      system: "kaabalah",
    });
  });

  it("returns correspondence paths and grouped maps for tree nodes", () => {
    const result = runCli([
      "tree:node",
      "number:1",
      "--json",
      "--compact",
    ]);
    assertSuccess(result, "tree:node --json");

    const payload = JSON.parse(result.stdout) as {
      node: { id: string };
      directEdges: Array<{ from: string; to: string; sources?: Array<{ kind: string; part?: string }> }>;
      correspondenceMap: Record<string, Array<{ node: { id: string }; distance: number; path: Array<{ edge: { sources?: Array<{ kind: string; part?: string }> } }> }>>;
    };

    expect(payload.node.id).toBe("number:1");
    expect(payload.correspondenceMap.sphere?.[0]).toMatchObject({
      node: { id: "sphere:Kether" },
      distance: 1,
    });
    expect(
      payload.directEdges.some(
        (edge) =>
          (edge.from === "number:1" && edge.to === "tarotArkAnnu:The Magician") ||
          (edge.from === "tarotArkAnnu:The Magician" && edge.to === "number:1")
      )
    ).toBe(true);
  });

  it("keeps sign correspondence inspection on the existing tree CLI surface", () => {
    const result = runCli([
      "tree:node",
      "westernZodiacSign:Libra",
      "--depth=2",
      "--json",
      "--compact",
      "--fields=correspondenceMap.sphere,correspondenceMap.path,correspondenceMap.westernElement",
    ]);
    assertSuccess(result, "tree:node westernZodiacSign:Libra --json");

    const payload = JSON.parse(result.stdout) as {
      correspondenceMap: {
        sphere?: Array<{ node: { id: string }; distance: number }>;
        path?: Array<{ node: { id: string }; distance: number }>;
        westernElement?: Array<{ node: { id: string }; distance: number }>;
      };
    };

    expect(
      payload.correspondenceMap.sphere?.some(
        (entry) => entry.node.id === "sphere:Netzach" && entry.distance === 1
      )
    ).toBe(true);
    expect(
      payload.correspondenceMap.sphere?.some(
        (entry) => entry.node.id === "sphere:Tiphareth" && entry.distance === 1
      )
    ).toBe(true);
    expect(
      payload.correspondenceMap.path?.some(
        (entry) => entry.node.id === "path:12" && entry.distance === 1
      )
    ).toBe(true);
    expect(
      payload.correspondenceMap.path?.some(
        (entry) => entry.node.id === "path:1" && entry.distance === 2
      )
    ).toBe(true);
    expect(payload.correspondenceMap.westernElement?.[0]).toMatchObject({
      node: { id: "westernElement:Air" },
      distance: 1,
    });
  });

  it("supports tree:find for ergonomic node lookup", () => {
    const result = runCli([
      "tree:find",
      "magician",
      "--type=tarotArkAnnu",
      "--json",
      "--compact",
    ]);
    assertSuccess(result, "tree:find --json");

    const payload = JSON.parse(result.stdout) as {
      query: string | null;
      typeFilter?: string;
      totalMatches: number;
      matches: Array<{ id: string; type: string }>;
    };

    expect(payload).toMatchObject({
      query: "magician",
      typeFilter: "tarotArkAnnu",
    });
    expect(payload.totalMatches).toBeGreaterThan(0);
    expect(
      payload.matches.some(
        (match) =>
          match.id === "tarotArkAnnu:The Magician" &&
          match.type === "tarotArkAnnu"
      )
    ).toBe(true);
  });

  it("returns canonical tree layout data for downstream overlays", () => {
    const result = runCli([
      "tree:layout",
      "--json",
      "--compact",
    ]);
    assertSuccess(result, "tree:layout --json");

    const payload = JSON.parse(result.stdout) as {
      system: string;
      sphereOrder: string[];
      pathOrder: string[];
      percentages: {
        spheres: Record<string, { x: number; y: number }>;
        paths: Record<string, { fromId: string; toId: string }>;
      };
      viewBoxUnits: {
        spheres: Record<string, { x: number; y: number }>;
      };
    };

    expect(payload.system).toBe("kaabalah");
    expect(payload.sphereOrder).toHaveLength(11);
    expect(payload.pathOrder).toHaveLength(22);
    expect(payload.percentages.spheres["sphere:Kether"]).toEqual({ x: 49.94, y: 6.83 });
    expect(payload.viewBoxUnits.spheres["sphere:Chokhmah"]).toEqual({ x: 247.85, y: 99.18 });
    expect(payload.percentages.paths["path:1"]).toMatchObject({
      fromId: "sphere:Kether",
      toId: "sphere:Chokhmah",
    });
  });

  it("returns structural tree topology and named route data", () => {
    const result = runCli([
      "tree:topology",
      "--route=lightning",
      "--json",
      "--compact",
    ]);
    assertSuccess(result, "tree:topology --route=lightning");

    const payload = JSON.parse(result.stdout) as {
      system: string;
      sphereOrder: string[];
      pathOrder: string[];
      routes: Array<{
        key: string;
        sphereNames: string[];
        isFullyConnected: boolean;
        missingSegments: Array<{ fromName: string; toName: string }>;
        targetIds: string[];
      }>;
    };

    expect(payload.system).toBe("kaabalah");
    expect(payload.sphereOrder).toHaveLength(11);
    expect(payload.pathOrder).toHaveLength(22);
    expect(payload.routes).toHaveLength(1);
    expect(payload.routes[0]).toMatchObject({
      key: "lightning",
      sphereNames: [
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
      ],
      isFullyConnected: false,
      missingSegments: [{ fromName: "Binah", toName: "Chesed" }],
    });
    expect(payload.routes[0].targetIds).toEqual(
      expect.arrayContaining(["sphere:Kether", "path:1", "sphere:Malkuth"])
    );
  });

  it("returns activation-aware tree render model data from an activations file", () => {
    const cwd = makeTempDir();
    const activationsPath = join(cwd, "activations.json");
    writeJson(activationsPath, {
      activations: [
        {
          targetId: "sphere:Kether",
          targetType: "sphere",
          count: 3,
          total: 6,
          state: "selected",
        },
        {
          targetId: "path:1",
          targetType: "path",
          count: 2,
          total: 6,
          state: "hovered",
        },
      ],
    });

    const result = runCli([
      "tree:layout",
      "--render-model",
      `--activations=${activationsPath}`,
      "--json",
      "--compact",
    ]);
    assertSuccess(result, "tree:layout --render-model --activations");

    const payload = JSON.parse(result.stdout) as {
      layerOrder: string[];
      sphereById: Record<string, {
        activation: { state: string };
        geometry: { viewBoxUnits: { hitTarget: { kind: string; r: number } } };
      }>;
      pathById: Record<string, {
        activation: { state: string };
        geometry: { viewBoxUnits: { hitTarget: { kind: string; strokeWidth: number } } };
      }>;
    };

    expect(payload.layerOrder).toEqual(["background", "paths", "spheres", "hit-targets"]);
    expect(payload.sphereById["sphere:Kether"].activation.state).toBe("selected");
    expect(payload.sphereById["sphere:Kether"].geometry.viewBoxUnits.hitTarget).toMatchObject({
      kind: "circle",
      r: 38,
    });
    expect(payload.pathById["path:1"].activation.state).toBe("hovered");
    expect(payload.pathById["path:1"].geometry.viewBoxUnits.hitTarget).toMatchObject({
      kind: "line",
      strokeWidth: 34,
    });
  });

  it("generates tree SVG JSON and supports file output", () => {
    const directResult = runCli([
      "tree:svg",
      "--json",
      "--compact",
      "--background=transparent",
      "--palette=monochrome",
      "--fields=svg",
    ]);
    assertSuccess(directResult, "tree:svg --json");

    expect(JSON.parse(directResult.stdout)).toEqual({
      svg: expect.stringContaining(`<svg xmlns="http://www.w3.org/2000/svg"`),
    });
    expect(JSON.parse(directResult.stdout).svg).toContain(`stroke="#2f271e"`);
    expect(JSON.parse(directResult.stdout).svg).toContain(`fill="#e6ddd0"`);

    const cwd = makeTempDir();
    const outputPath = join(cwd, "tree.svg");
    const fileResult = runCli([
      "tree:svg",
      "--json",
      "--compact",
      `--output=${outputPath}`,
    ]);
    assertSuccess(fileResult, "tree:svg --output");

    const payload = JSON.parse(fileResult.stdout) as {
      outputPath: string;
      bytes: number;
    };

    expect(payload.outputPath).toBe(outputPath);
    expect(payload.bytes).toBeGreaterThan(1000);
    expect(readFileSync(outputPath, "utf8")).toContain(`<svg xmlns="http://www.w3.org/2000/svg"`);
  });

  it("generates activation-aware tree SVG from an activations file", () => {
    const cwd = makeTempDir();
    const activationsPath = join(cwd, "activations.json");
    writeJson(activationsPath, [
      {
        targetId: "sphere:Kether",
        targetType: "sphere",
        count: 2,
        total: 4,
        state: "selected",
        color: "#ffcc00",
      },
      {
        targetId: "path:2",
        targetType: "path",
        count: 0,
        total: 4,
        state: "inactive",
      },
    ]);

    const result = runCli([
      "tree:svg",
      "--json",
      "--compact",
      "--background=transparent",
      `--activations=${activationsPath}`,
      "--fields=svg,activationCount",
    ]);
    assertSuccess(result, "tree:svg --activations");

    const payload = JSON.parse(result.stdout) as { svg: string; activationCount: number };

    expect(payload.activationCount).toBe(2);
    expect(payload.svg).toContain(`fill="#ffcc00"`);
    expect(payload.svg).toContain(`<polygon points="`);
    expect(payload.svg).toContain(`stroke="#AAA"`);
  });

  it("supports rendering Daath behind the paths with a top hit area", () => {
    const result = runCli([
      "tree:svg",
      "--json",
      "--compact",
      "--background=transparent",
      "--daath-layer=back",
      "--fields=svg",
    ]);
    assertSuccess(result, "tree:svg --daath-layer=back");

    const payload = JSON.parse(result.stdout) as { svg: string };
    const daathSphereIndex = payload.svg.indexOf(`<g id="sphere-daath"`);
    const pathsIndex = payload.svg.indexOf(`<g id="paths">`);
    const hitAreaIndex = payload.svg.indexOf(`id="sphere-daath-hit-area"`);

    expect(payload.svg).toContain(`<g id="spheres-behind-paths">`);
    expect(daathSphereIndex).toBeGreaterThan(-1);
    expect(pathsIndex).toBeGreaterThan(daathSphereIndex);
    expect(hitAreaIndex).toBeGreaterThan(pathsIndex);
    expect(payload.svg).toContain(`data-node-id="sphere:Daath"`);
  });

  it("renders a lightweight tree ascii preview", () => {
    const result = runCli([
      "tree:ascii",
      "--json",
      "--compact",
      "--columns=41",
      "--rows=21",
    ]);
    assertSuccess(result, "tree:ascii --json");

    const payload = JSON.parse(result.stdout) as {
      columns: number;
      rows: number;
      ascii: string;
      lines: string[];
    };

    expect(payload.columns).toBe(41);
    expect(payload.rows).toBe(21);
    expect(payload.lines).toHaveLength(21);
    expect(payload.ascii).toContain("O");
  });

  it("generates astrology wheel SVG JSON and supports file output", () => {
    const directResult = runCli([
      "astrology:wheel",
      "1990-01-15",
      "14:30",
      "--lat",
      "40.7128",
      "--lon=-74.006",
      "--timezone",
      "America/New_York",
      "--wasm-path",
      REAL_WASM_PATH,
      "--ephe-path",
      REAL_EPHE_PATH,
      "--json",
      "--compact",
      "--background=transparent",
      "--palette=monochrome",
      "--no-aspects",
      "--fields=svg",
    ]);
    assertSuccess(directResult, "astrology:wheel --json");

    const directPayload = JSON.parse(directResult.stdout) as { svg: string };

    expect(directPayload.svg).toContain(`<svg xmlns="http://www.w3.org/2000/svg"`);
    expect(directPayload.svg).toContain(`id="astro-wheel-zodiac"`);
    expect(directPayload.svg).toContain(`id="astro-wheel-planets"`);
    expect(directPayload.svg).toContain(`data-point-name="Sun"`);
    expect(directPayload.svg).not.toContain(`<rect`);
    expect(directPayload.svg).not.toContain(`id="astro-wheel-aspects"`);
    expect(directPayload.svg).not.toContain("NaN");
    expect(directPayload.svg).not.toContain("undefined");

    const cwd = makeTempDir();
    const outputPath = join(cwd, "chart.svg");
    const fileResult = runCli([
      "astrology:wheel",
      "1990-01-15",
      "14:30",
      "--lat=40.7128",
      "--lon=-74.006",
      "--timezone=America/New_York",
      "--wasm-path",
      REAL_WASM_PATH,
      "--ephe-path",
      REAL_EPHE_PATH,
      `--output=${outputPath}`,
      "--json",
      "--compact",
    ]);
    assertSuccess(fileResult, "astrology:wheel --output");

    const filePayload = JSON.parse(fileResult.stdout) as {
      outputPath: string;
      bytes: number;
      input: { date: string; houseSystem: string };
      options: { background: string; palette: string };
    };

    expect(filePayload.outputPath).toBe(outputPath);
    expect(filePayload.bytes).toBeGreaterThan(1000);
    expect(filePayload.input).toMatchObject({
      date: "1990-01-15",
      houseSystem: "placidus",
    });
    expect(filePayload.options).toMatchObject({
      background: "transparent",
      palette: "default",
    });
    expect(readFileSync(outputPath, "utf8")).toContain(`id="astro-wheel-zodiac"`);
  });

  it("returns astrology wheel render-model geometry for custom consumers", () => {
    const result = runCli([
      "astrology:wheel",
      "1990-01-15",
      "14:30",
      "--lat=40.7128",
      "--lon=-74.006",
      "--timezone=America/New_York",
      "--wasm-path",
      REAL_WASM_PATH,
      "--ephe-path",
      REAL_EPHE_PATH,
      "--render-model",
      "--json",
      "--compact",
    ]);
    assertSuccess(result, "astrology:wheel --render-model");

    const payload = JSON.parse(result.stdout) as {
      viewBox: { width: number; height: number };
      pointLayers: Array<{ id: string }>;
      points: Array<{ name: string }>;
      aspectLines: unknown[];
    };

    expect(payload.viewBox).toMatchObject({ width: 600, height: 600 });
    expect(payload.pointLayers[0]).toMatchObject({ id: "birth" });
    expect(payload.points[0]?.name).toBeTruthy();
    expect(payload.aspectLines.length).toBeGreaterThan(0);
  });

  it("supports --input-json=- to read a JSON object from stdin", () => {
    const result = runCli(
      ["numerology", "--input-json=-", "--json", "--compact", "--fields=kaabalistic.lifePath.reducedValue"],
      '{"date":"1900-01-08"}'
    );
    assertSuccess(result, "numerology --input-json=-");

    expect(JSON.parse(result.stdout)).toEqual({
      kaabalistic: {
        lifePath: {
          reducedValue: 1,
        },
      },
    });
  });

  it("accepts piped text for gematria when no positional argument is provided", () => {
    const result = runCli(["gematria", "--json", "--compact"], "DAVID\n");
    assertSuccess(result, "gematria stdin");

    expect(JSON.parse(result.stdout)).toMatchObject({
      vowels: { originalSum: 11 },
      consonants: { originalSum: 14 },
      synthesis: { originalSum: 25 },
    });
  });

  it("fails fast when stdin exceeds the byte cap", () => {
    const result = runCli(["gematria", "--json", "--compact"], "A".repeat(MAX_STDIN_BYTES + 1));

    expect(result.status).toBe(1);
    expect(JSON.parse(result.stdout)).toEqual({
      error: true,
      code: "INVALID_ARGUMENT",
      message: `stdin payload exceeds maximum size of ${MAX_STDIN_BYTES} bytes. Run "kaabalah help gematria" for command usage.`,
      version: VERSION,
    });
  });

  it("reads project config defaults for output formatting", () => {
    const cwd = makeTempDir();
    writeJson(join(cwd, "kaabalah.config.json"), { compact: true });

    const result = runCliWithOptions(["help", "--json"], { cwd });
    assertSuccess(result, "help project config");

    expect(result.stdout.trim()).not.toContain("\n");
  });

  it("applies env defaults for astrology runtime options", () => {
    const result = runCliWithOptions(
      [
        "astrology",
        "1990-01-15",
        "14:30",
        "--lat",
        "40.7128",
        "--lon=-74.006",
        "--json",
        "--compact",
        "--fields=input.houseSystem,input.timezone",
      ],
      {
        env: {
          KAABALAH_HOUSE_SYSTEM: "whole-sign",
          KAABALAH_TIMEZONE: "UTC",
        },
      }
    );
    assertSuccess(result, "astrology env defaults");

    expect(parseJsonOutput(result.stdout)).toEqual({
      input: {
        houseSystem: "whole-sign",
        timezone: "UTC",
      },
    });
  });

  it("lets CLI astrology flags override env defaults and bad runtime paths", () => {
    const result = runCliWithOptions(
      [
        "astrology",
        "1990-01-15",
        "14:30",
        "--lat",
        "40.7128",
        "--lon=-74.006",
        "--house-system",
        "placidus",
        "--timezone",
        "America/New_York",
        "--wasm-path",
        REAL_WASM_PATH,
        "--ephe-path",
        REAL_EPHE_PATH,
        "--json",
        "--compact",
        "--fields=input.houseSystem,input.timezone",
      ],
      {
        env: {
          KAABALAH_HOUSE_SYSTEM: "whole-sign",
          KAABALAH_TIMEZONE: "UTC",
          KAABALAH_WASM_PATH: "/bad/wasm-path",
          KAABALAH_EPHE_PATH: "/bad/ephe-path",
        },
      }
    );
    assertSuccess(result, "astrology CLI overrides");

    expect(parseJsonOutput(result.stdout)).toEqual({
      input: {
        houseSystem: "placidus",
        timezone: "America/New_York",
      },
    });
  });

  it("keeps the tree JSON contract stable while allowing the graph to grow", () => {
    const result = runCli(["tree", "--json", "--compact"]);
    assertSuccess(result, "tree --json --compact");

    // Stable contract: top-level keys, compact JSON mode, and internal consistency.
    // Intentionally flexible: exact counts and full node payloads may grow as correspondences expand.
    const payload = JSON.parse(result.stdout) as {
      system: string;
      totalNodes: number;
      totalEdges: number;
      nodes: Array<{ id: string; type: string }>;
      edges: Array<{ from: string; to: string }>;
    };

    expect(result.stdout.trim()).not.toContain("\n");
    expect(payload.system).toBe("kaabalah");
    expect(payload.nodes).toHaveLength(payload.totalNodes);
    expect(payload.edges).toHaveLength(payload.totalEdges);
    expect(payload.nodes).toContainEqual(expect.objectContaining({ id: "sphere:Kether", type: "sphere" }));
  });

  it("returns structured JSON errors with the CLI version", () => {
    const result = runCli(["not-a-command", "--json", "--compact"]);

    expect(result.status).toBe(1);
    expect(result.stderr).toBe("");
    expect(JSON.parse(result.stdout)).toEqual({
      error: true,
      code: "UNKNOWN_COMMAND",
      message: 'Unknown command: "not-a-command". Run "kaabalah help" for usage.',
      version: VERSION,
    });
  });

  it("prints the package version from --version", () => {
    const result = runCli(["--version", "--no-json"]);
    assertSuccess(result, "--version");

    expect(result.stderr).toBe("");
    expect(result.stdout.trim()).toBe(`kaabalah v${VERSION}`);
  });

  it("supports the -V short alias for version", () => {
    const result = runCli(["-V", "--no-json"]);
    assertSuccess(result, "-V");

    expect(result.stdout.trim()).toBe(`kaabalah v${VERSION}`);
  });

  it("supports the -h short alias for command help", () => {
    const result = runCli(["-h", "astrology", "--json", "--compact"]);
    assertSuccess(result, "-h");

    expect(JSON.parse(result.stdout)).toMatchObject({
      version: VERSION,
      command: {
        name: "astrology",
      },
    });
  });

  it("rejects unknown options instead of ignoring them", () => {
    const result = runCli(["numerology", "1900-01-08", "--bogus", "--json", "--compact"]);

    expect(result.status).toBe(1);
    expect(JSON.parse(result.stdout)).toMatchObject({
      error: true,
      code: "INVALID_ARGUMENT",
    });
    expect(JSON.parse(result.stdout).message).toContain("Unknown option '--bogus'");
  });

  it("rejects options that do not belong to the selected command", () => {
    const result = runCli(["numerology", "1900-01-08", "--lat", "40", "--json", "--compact"]);

    expect(result.status).toBe(1);
    expect(JSON.parse(result.stdout)).toEqual({
      error: true,
      code: "INVALID_ARGUMENT",
      message: 'Unknown option "--lat" for command "numerology". Run "kaabalah help numerology" for command usage.',
      version: VERSION,
    });
  });

  it("supports -- to stop option parsing", () => {
    const result = runCli(["tarot:card", "--", "--json"]);

    expect(result.status).toBe(1);
    expect(JSON.parse(result.stdout)).toMatchObject({
      error: true,
      code: "CARD_NOT_FOUND",
    });
    expect(JSON.parse(result.stdout).message).toContain('No card found for "--json"');
  });

  it("includes the version in human-readable fatal errors", () => {
    const result = runCli(["not-a-command", "--no-json"]);

    expect(result.status).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr.trim()).toBe(
      `kaabalah v${VERSION}: Unknown command: "not-a-command". Run "kaabalah help" for usage.`
    );
  });

  it("includes the version in human-readable help output", () => {
    const result = runCli(["help", "--no-json"]);
    assertSuccess(result, "help --no-json");

    expect(result.stdout).toContain(`kaabalah v${VERSION}`);
  });

  it("supports DEBUG=kaabalah:* without polluting JSON stdout", () => {
    const result = runCliWithOptions(["help", "--json", "--compact"], {
      env: {
        ...process.env,
        DEBUG: "kaabalah:*",
      },
    });
    assertSuccess(result, "DEBUG=kaabalah:* help --json");

    expect(JSON.parse(result.stdout)).toMatchObject({
      version: VERSION,
    });
    expect(result.stderr).toContain("[kaabalah:parser]");
    expect(result.stderr).toContain("[kaabalah:config]");
  });

  it("keeps astrology JSON stdout parseable while sending ephemeris notices to stderr", () => {
    const result = runCli([
      "astrology",
      "1990-01-15",
      "14:30",
      "--lat=40.7128",
      "--lon=-74.006",
      "--wasm-path",
      REAL_WASM_PATH,
      "--ephe-path",
      REAL_EPHE_PATH,
      "--json",
      "--compact",
      "--fields=aspects",
    ]);
    assertSuccess(result, "astrology JSON purity");

    expect(JSON.parse(result.stdout)).toMatchObject({
      aspects: expect.any(Array),
    });
    expect(result.stderr).toContain("Setting ephemeris path to:");
  });

  it("filters synastry aspects by orb and aspect type in a single call", () => {
    const payload = JSON.stringify({
      chartA: {
        date: "1990-01-15",
        time: "14:30",
        lat: 40.7128,
        lon: -74.006,
        timezone: "America/New_York",
      },
      chartB: {
        date: "1992-06-20",
        time: "09:00",
        lat: 51.5074,
        lon: -0.1278,
        timezone: "Europe/London",
      },
    });
    const result = runCli([
      "astrology:synastry",
      "--input-json=-",
      "--json",
      "--compact",
      "--max-orb=3",
      "--aspect-types=conjunction",
      "--wasm-path",
      REAL_WASM_PATH,
      "--ephe-path",
      REAL_EPHE_PATH,
      "--fields=aspects",
    ], payload);
    assertSuccess(result, "synastry aspect filters");

    const json = JSON.parse(result.stdout) as { aspects: Array<{ aspect: string; orb: number }> };
    expect(json.aspects.length).toBeGreaterThan(0);
    for (const aspect of json.aspects) {
      expect(aspect.aspect).toBe("conjunction");
      expect(aspect.orb).toBeLessThanOrEqual(3);
    }
  });

  it("filters composite aspects by orb and aspect type in a single call", () => {
    const payload = JSON.stringify({
      chartA: {
        date: "1990-01-15",
        time: "14:30",
        lat: 40.7128,
        lon: -74.006,
        timezone: "America/New_York",
      },
      chartB: {
        date: "1992-06-20",
        time: "09:00",
        lat: 51.5074,
        lon: -0.1278,
        timezone: "Europe/London",
      },
    });
    const result = runCli([
      "astrology:composite",
      "--input-json=-",
      "--json",
      "--compact",
      "--max-orb=3",
      "--aspect-types=opposition",
      "--wasm-path",
      REAL_WASM_PATH,
      "--ephe-path",
      REAL_EPHE_PATH,
      "--fields=aspects",
    ], payload);
    assertSuccess(result, "composite aspect filters");

    const json = JSON.parse(result.stdout) as { aspects: Array<{ aspect: string; orb: number }> };
    expect(json.aspects.length).toBeGreaterThan(0);
    for (const aspect of json.aspects) {
      expect(aspect.aspect).toBe("opposition");
      expect(aspect.orb).toBeLessThanOrEqual(3);
    }
  });

  it("keeps the CLI shebang in the built entrypoint", () => {
    expect(readFileSync(CLI_PATH, "utf8").startsWith("#!/usr/bin/env node\n")).toBe(true);
  });
});
