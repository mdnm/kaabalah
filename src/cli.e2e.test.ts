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
  try {
    return JSON.parse(stdout);
  } catch {
    const fallbackStart = Math.max(stdout.lastIndexOf("\n{"), stdout.lastIndexOf("\n["));
    return JSON.parse(fallbackStart === -1 ? stdout : stdout.slice(fallbackStart + 1));
  }
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
      "astrology",
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
        { name: "wasm-path" },
        { name: "ephe-path" },
      ],
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

  it("keeps the CLI shebang in the built entrypoint", () => {
    expect(readFileSync(CLI_PATH, "utf8").startsWith("#!/usr/bin/env node\n")).toBe(true);
  });
});
