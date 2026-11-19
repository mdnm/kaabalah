import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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

function assertStrictJsonStdout(result: ProcessResult, label: string): unknown {
  expect(result.stdout, `${label}: stdout should end with one newline`).toMatch(/\n$/);
  expect(result.stdout.trim(), `${label}: stdout should not contain extra blank padding`).toBe(result.stdout.slice(0, -1));
  return JSON.parse(result.stdout);
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
      "iching:cast",
      "iching:hexagram",
      "iching:reading",
      "gematria",
      "gematria:reverse",
      "numerology",
      "numerology:lifepath",
      "numerology:cycles",
      "numerology:challenges",
      "numerology:fibonacci",
      "numerology:snapshot",
      "numerology:timeline",
      "numerology:heptads",
      "numerology:personal-cycles",
      "numerology:life-stages",
      "numerology:partial",
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
      "tree:map",
      "tree:paths",
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
      "astrology:describe",
      "astrology:dodecatemoria",
      "astrology:astrocartography",
      "astrology:astrocartography:query",
      "astrology:davison",
      "astrology:overlays",
      "astrology:progressions",
      "astrology:solar-arc",
      "astrology:returns",
      "astrology:profections:timeline",
      "astrology:firdaria:timeline",
      "astrology:jyotish",
      "astrology:condition",
      "astrology:rulers",
      "astrology:varga",
      "astrology:yogakarakas",
      "astrology:collection",
      "capabilities",
      "help",
    ]);
    expect(payload.globalFlags.map((flag) => flag.name)).toEqual([
      "language",
      "json",
      "no-json",
      "compact",
      "fields",
      "input-json",
      "quiet",
      "silent",
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
        { name: "strict-ephemeris" },
        { name: "orb-profile" },
        { name: "points" },
        { name: "group-axes" },
        { name: "house-systems" },
        { name: "quality" },
        { name: "exclude-rectified-angles" },
        { name: "local-mean-time" },
        { name: "place-role" },
        { name: "format" },
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
        expect.objectContaining({ name: "output" }),
      ]),
    });
    expect(payload.commands.find((command) => command.name === "astrology:wheel")?.flags)
      .not.toContainEqual(expect.objectContaining({ name: "render-model" }));
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

  it("draws named tarot spreads from the CLI", () => {
    const result = runCli(["tarot:spread", "--spread-id=time-reading", "--json", "--compact"]);
    assertSuccess(result, "tarot:spread --spread-id");

    const payload = JSON.parse(result.stdout) as {
      spread: { spreadId: string; label: string };
      cards: Array<{ slotKey: string; cardNumber: number; card: { tarotCard: string; type: string } }>;
    };

    expect(payload.spread).toMatchObject({
      spreadId: "time-reading",
      label: "Time Reading",
    });
    expect(payload.cards).toHaveLength(3);
    expect(payload.cards.map((card) => card.slotKey)).toEqual(["past", "present", "future"]);
    expect(payload.cards.every((card) => card.card.type === "major")).toBe(true);
  });

  it("enriches tarot card lookups with deck image URLs", () => {
    const result = runCli([
      "tarot:card",
      "the fool",
      "--deck=rider-waite",
      "--json",
      "--compact",
    ]);
    assertSuccess(result, "tarot:card --deck");

    const payload = JSON.parse(result.stdout) as {
      tarotCard: string;
      deckId: string;
      imageUrl: string;
    };

    expect(payload.tarotCard).toBe("The Fool");
    expect(payload.deckId).toBe("rider-waite");
    expect(typeof payload.imageUrl).toBe("string");
  });

  it("keeps deck-specific tarot card JSON free of unrelated legacy fields by default", () => {
    const result = runCli([
      "tarot:card",
      "24",
      "--deck=mythic",
      "--json",
      "--compact",
    ]);
    assertSuccess(result, "tarot:card --deck=mythic");

    const payload = JSON.parse(result.stdout) as {
      deck: string;
      deckId: string;
      egyptianCardName?: string;
      papusMeaning?: string;
      imageUrl: string;
    };

    expect(payload.deck).toBe("mythic");
    expect(payload.deckId).toBe("mythic");
    expect(payload.egyptianCardName).toBeUndefined();
    expect(payload.papusMeaning).toBeUndefined();
    expect(payload.imageUrl).toContain("/mythic/");
  });

  it("allows opt-in legacy tarot fields with deck-specific card JSON", () => {
    const result = runCli([
      "tarot:card",
      "24",
      "--deck=mythic",
      "--include-fields=papus,egyptian",
      "--json",
      "--compact",
    ]);
    assertSuccess(result, "tarot:card --include-fields");

    const payload = JSON.parse(result.stdout) as {
      egyptianCardName?: string;
      papusMeaning?: string;
    };

    expect(payload.egyptianCardName).toBeTruthy();
    expect(payload.papusMeaning).toBeTruthy();
  });

  it("lists tarot decks from the tarot card command", () => {
    const result = runCli(["tarot:card", "--decks", "--json", "--compact"]);
    assertSuccess(result, "tarot:card --decks");

    const payload = JSON.parse(result.stdout) as Array<{ id: string; label: string }>;

    expect(payload).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "rider-waite" }),
      ])
    );
  });

  it("rejects unknown tarot decks", () => {
    const result = runCli([
      "tarot:card",
      "the fool",
      "--deck=bogus",
      "--json",
      "--compact",
    ]);

    expect(result.status).toBe(1);
    expect(JSON.parse(result.stdout)).toMatchObject({
      error: true,
      code: "INVALID_ARGUMENT",
    });
  });

  it("lists tarot spread ids from the CLI", () => {
    const result = runCli(["tarot:spread", "--list", "--json", "--compact"]);
    assertSuccess(result, "tarot:spread --list");

    const payload = JSON.parse(result.stdout) as Array<{
      spreadId: string;
      label: string;
      slots: number;
      contextRequirements: string[];
    }>;

    expect(payload.map((spread) => spread.spreadId)).toEqual([
      "quick-insight",
      "conscious-reading",
      "time-reading",
      "dialectic-reading",
      "tree-of-life-reading",
      "celtic-cross",
      "event-reading",
    ]);
    expect(payload.find((spread) => spread.spreadId === "event-reading")).toMatchObject({
      label: "Event Reading",
      contextRequirements: ["inquirerGender"],
    });
  });

  it("describes tarot spread slots without drawing cards", () => {
    const result = runCli([
      "tarot:spread",
      "--describe",
      "conscious-reading",
      "--json",
      "--compact",
    ]);
    assertSuccess(result, "tarot:spread --describe");

    const payload = JSON.parse(result.stdout) as {
      spreadId: string;
      slots: Array<{
        slotKey: string;
        order: number;
        minCards: number;
        maxCards: number;
        validationRules?: { allowedTypes?: string[] };
      }>;
      cards?: unknown[];
    };

    expect(payload.spreadId).toBe("conscious-reading");
    expect(payload.cards).toBeUndefined();
    expect(payload.slots.map((slot) => slot.slotKey)).toEqual([
      "conscious",
      "unconscious",
      "subconscious",
    ]);
    expect(payload.slots.map((slot) => slot.validationRules?.allowedTypes)).toEqual([
      ["major"],
      ["daat+royalship"],
      ["minor"],
    ]);
  });

  it("lists verbose tarot spread slot schemas", () => {
    const result = runCli(["tarot:spread", "--list", "--verbose", "--json", "--compact"]);
    assertSuccess(result, "tarot:spread --list --verbose");

    const payload = JSON.parse(result.stdout) as Array<{
      spreadId: string;
      slots: Array<{ slotKey: string; validationRules?: { allowedTypes?: string[] } }>;
    }>;
    const consciousReading = payload.find((spread) => spread.spreadId === "conscious-reading");

    expect(consciousReading?.slots[0]).toMatchObject({
      slotKey: "conscious",
      validationRules: { allowedTypes: ["major"] },
    });
  });

  it("draws conscious tarot spreads from indexed shuffled pools", () => {
    const result = runCli([
      "tarot:spread",
      "--spread-id=conscious-reading",
      "--method=conscious",
      "--indices=1,9,28",
      "--deck=mythic",
      "--json",
      "--compact",
    ]);
    assertSuccess(result, "tarot:spread --method=conscious");

    const payload = JSON.parse(result.stdout) as {
      method: string;
      deckId: string;
      cards: Array<{
        slotKey: string;
        index: number;
        poolSize: number;
        pos: string;
        card: { type: string; deck: string; deckId: string; egyptianCardName?: string; papusMeaning?: string };
      }>;
    };

    expect(payload.method).toBe("conscious");
    expect(payload.deckId).toBe("mythic");
    expect(payload.cards.map((card) => card.slotKey)).toEqual([
      "conscious",
      "unconscious",
      "subconscious",
    ]);
    expect(payload.cards.map((card) => card.index)).toEqual([1, 9, 28]);
    expect(payload.cards.map((card) => card.poolSize)).toEqual([22, 16, 40]);
    expect(payload.cards.map((card) => card.pos)).toEqual(["1 of 22", "9 of 16", "28 of 40"]);
    expect(payload.cards.map((card) => card.card.type)).toEqual(["major", "daat+royalship", "minor"]);
    expect(payload.cards.every((card) => card.card.deck === "mythic" && card.card.deckId === "mythic")).toBe(true);
    expect(payload.cards.every((card) => card.card.egyptianCardName === undefined && card.card.papusMeaning === undefined)).toBe(true);
  });

  it("reports conscious tarot indices that exceed the matching pool", () => {
    const result = runCli([
      "tarot:spread",
      "--spread-id=conscious-reading",
      "--method=conscious",
      "--indices=23,1,1",
      "--json",
      "--compact",
    ]);

    expect(result.status).toBe(1);
    expect(JSON.parse(result.stdout)).toMatchObject({
      error: true,
      code: "INDEX_OUT_OF_POOL",
    });
  });

  it("prints tarot spread ids for human-readable discovery", () => {
    const result = runCli(["tarot:spread", "--list", "--no-json"]);
    assertSuccess(result, "tarot:spread --list --no-json");

    expect(result.stdout).toContain("Tarot spreads");
    expect(result.stdout).toContain("quick-insight");
    expect(result.stdout).toContain("celtic-cross");
    expect(result.stdout).toContain("event-reading");
    expect(result.stdout).toContain("requires: inquirerGender");
  });

  it("passes tarot spread context from CLI flags", () => {
    const result = runCli([
      "tarot:spread",
      "--spread-id=event-reading",
      "--inquirer-gender=woman",
      "--json",
      "--compact",
    ]);
    assertSuccess(result, "tarot:spread event-reading");

    const payload = JSON.parse(result.stdout) as {
      spread: { spreadId: string };
      context: { inquirerGender: string };
      cards: Array<{ slotKey: string; cardNumber: number }>;
    };

    expect(payload.spread.spreadId).toBe("event-reading");
    expect(payload.context).toEqual({ inquirerGender: "woman" });
    expect(payload.cards).toHaveLength(20);
    expect(
      payload.cards.filter(
        (card) =>
          (card.slotKey === "inquirer" || card.slotKey.startsWith("inner-")) &&
          card.cardNumber === 2
      )
    ).toHaveLength(1);
  });

  it("reports missing tarot spread context with MISSING_ARGUMENT", () => {
    const result = runCli([
      "tarot:spread",
      "--spread-id=event-reading",
      "--json",
      "--compact",
    ]);

    expect(result.status).toBe(1);
    expect(JSON.parse(result.stdout)).toMatchObject({
      error: true,
      code: "MISSING_ARGUMENT",
    });
    expect(JSON.parse(result.stdout).message).toContain("--inquirer-gender");
  });

  it("passes tarot spread selection through --input-json", () => {
    const result = runCli([
      "tarot:spread",
      "--input-json=-",
      "--json",
      "--compact",
      "--fields=spread.spreadId,cards",
    ], JSON.stringify({ spreadId: "quick-insight" }));
    assertSuccess(result, "tarot:spread --input-json");

    const payload = JSON.parse(result.stdout) as {
      spread: { spreadId: string };
      cards: unknown[];
    };

    expect(payload.spread.spreadId).toBe("quick-insight");
    expect(payload.cards).toHaveLength(1);
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

    const payload = JSON.parse(result.stdout) as {
      includedLetters: Array<{ treeTargets?: unknown[] }>;
    };
    expect(payload).toMatchObject({
      vowels: { originalSum: 11 },
      consonants: { originalSum: 14 },
      synthesis: { originalSum: 25 },
      includedLetters: expect.any(Array),
    });
    expect(payload.includedLetters.some((letter) => "treeTargets" in letter)).toBe(false);
  });

  it("resolves gematria letters to Tree of Life targets when requested", () => {
    const result = runCli(["gematria", "abc", "--resolve-paths", "--json", "--compact"]);
    assertSuccess(result, "gematria --resolve-paths");

    const payload = JSON.parse(result.stdout) as {
      includedLetters: Array<{
        treeTargets?: Array<{
          targetId?: string;
          targetType?: string;
          targetName?: string;
        }>;
      }>;
    };
    const resolvedLetters = payload.includedLetters.filter(
      (letter) => Array.isArray(letter.treeTargets) && letter.treeTargets.length > 0
    );

    expect(payload.includedLetters.length).toBeGreaterThan(0);
    expect(payload.includedLetters.every((letter) => Array.isArray(letter.treeTargets))).toBe(true);
    expect(resolvedLetters.length).toBeGreaterThan(0);
    expect(resolvedLetters[0].treeTargets?.[0]).toMatchObject({
      targetId: expect.any(String),
      targetType: expect.stringMatching(/^(sphere|path)$/),
      targetName: expect.any(String),
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

  it.each(["hermetic-qabalah", "lurianic-kabbalah"] as const)(
    "returns a structured error for tree SVG system %s",
    (system) => {
      const result = runCli([
        "tree:svg",
        `--system=${system}`,
        "--json",
        "--compact",
      ]);

      expect(result.status).toBe(1);
      expect(JSON.parse(result.stdout)).toEqual({
        error: true,
        code: "UNSUPPORTED_SYSTEM",
        message:
          `tree:svg is only supported for the Melkitzedeki system ('kaabalah'); received '${system}'. Run "kaabalah help tree:svg" for command usage.`,
        version: VERSION,
      });
      expect(result.stderr).not.toContain("LOADERS");
      expect(result.stderr).not.toContain("TypeError");
    }
  );

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
    // Kether's mother-of-pearl renderer emits iridescent arc paths.
    expect(payload.svg).toContain(`path d="M 142.83 38.32 L`);
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

  it("emits exactly one parseable JSON document on stdout for every command", () => {
    const synastryPayload = JSON.stringify({
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
    const astrologyRuntimeArgs = [
      "--wasm-path",
      REAL_WASM_PATH,
      "--ephe-path",
      REAL_EPHE_PATH,
    ];
    const cases: Array<{ label: string; args: string[]; input?: string; expectStderr?: boolean }> = [
      { label: "help", args: ["help", "--json", "--compact"] },
      { label: "gematria", args: ["gematria", "DAVID", "--json", "--compact"] },
      { label: "gematria:reverse", args: ["gematria:reverse", "22", "--max-results=1", "--json", "--compact"] },
      { label: "numerology", args: ["numerology", "1990-01-15", "--json", "--compact"] },
      { label: "numerology:lifepath", args: ["numerology:lifepath", "1990-01-15", "--json", "--compact"] },
      { label: "numerology:cycles", args: ["numerology:cycles", "1990-01-15", "John", "--json", "--compact"] },
      { label: "numerology:challenges", args: ["numerology:challenges", "1990-01-15", "--json", "--compact"] },
      { label: "numerology:fibonacci", args: ["numerology:fibonacci", "1990-01-15", "--json", "--compact"] },
      { label: "tarot", args: ["tarot", "1", "--json", "--compact"] },
      { label: "tarot:card", args: ["tarot:card", "chariot", "--json", "--compact"] },
      { label: "tarot:spread", args: ["tarot:spread", "--list", "--json", "--compact"] },
      { label: "ifa", args: ["ifa", "1990-01-15", "--json", "--compact"] },
      { label: "tree", args: ["tree", "--json", "--compact"] },
      { label: "tree:node", args: ["tree:node", "sphere:Kether", "--json", "--compact"] },
      { label: "tree:find", args: ["tree:find", "magician", "--json", "--compact"] },
      { label: "tree:types", args: ["tree:types", "--json", "--compact"] },
      { label: "tree:layout", args: ["tree:layout", "--json", "--compact"] },
      { label: "tree:topology", args: ["tree:topology", "--json", "--compact"] },
      { label: "tree:svg", args: ["tree:svg", "--json", "--compact", "--fields=svg"] },
      { label: "tree:ascii", args: ["tree:ascii", "--json", "--compact", "--fields=ascii"] },
      {
        label: "astrology",
        args: [
          "astrology",
          "1990-01-15",
          "14:30",
          "--lat=40.7128",
          "--lon=-74.006",
          ...astrologyRuntimeArgs,
          "--json",
          "--compact",
          "--fields=aspects",
        ],
        expectStderr: true,
      },
      {
        label: "astrology:wheel",
        args: [
          "astrology:wheel",
          "1990-01-15",
          "14:30",
          "--lat=40.7128",
          "--lon=-74.006",
          ...astrologyRuntimeArgs,
          "--json",
          "--compact",
          "--fields=svg",
        ],
        expectStderr: true,
      },
      {
        label: "astrology:synastry",
        args: [
          "astrology:synastry",
          "--input-json=-",
          ...astrologyRuntimeArgs,
          "--json",
          "--compact",
          "--fields=aspects",
        ],
        input: synastryPayload,
        expectStderr: true,
      },
      {
        label: "astrology:composite",
        args: [
          "astrology:composite",
          "--input-json=-",
          ...astrologyRuntimeArgs,
          "--json",
          "--compact",
          "--fields=aspects",
        ],
        input: synastryPayload,
        expectStderr: true,
      },
      {
        label: "astrology:transits",
        args: [
          "astrology:transits",
          "1990-01-15",
          "14:30",
          "--lat=40.7128",
          "--lon=-74.006",
          "--transit-date=2026-03-17",
          ...astrologyRuntimeArgs,
          "--json",
          "--compact",
          "--fields=aspects",
        ],
        expectStderr: true,
      },
      {
        label: "astrology:solar-return",
        args: [
          "astrology:solar-return",
          "1990-01-15",
          "14:30",
          "--lat=40.7128",
          "--lon=-74.006",
          "--year=2026",
          ...astrologyRuntimeArgs,
          "--json",
          "--compact",
          "--fields=returnDate",
        ],
        expectStderr: true,
      },
      {
        label: "astrology:profections",
        args: [
          "astrology:profections",
          "1990-01-15",
          "14:30",
          "--lat=40.7128",
          "--lon=-74.006",
          "--year=2026",
          ...astrologyRuntimeArgs,
          "--json",
          "--compact",
          "--fields=house,sign,ruler",
        ],
        expectStderr: true,
      },
      {
        label: "astrology:profections:monthly",
        args: [
          "astrology:profections:monthly",
          "1990-01-15",
          "14:30",
          "--lat=40.7128",
          "--lon=-74.006",
          "--year=2026",
          ...astrologyRuntimeArgs,
          "--json",
          "--compact",
          "--fields=months",
        ],
        expectStderr: true,
      },
      {
        label: "astrology:firdaria",
        args: [
          "astrology:firdaria",
          "1990-01-15",
          "14:30",
          "--lat=40.7128",
          "--lon=-74.006",
          ...astrologyRuntimeArgs,
          "--json",
          "--compact",
          "--fields=currentMajor,currentSub",
        ],
        expectStderr: true,
      },
      { label: "astrology:decans", args: ["astrology:decans", "15", "--json", "--compact"] },
      { label: "astrology:describe", args: ["astrology:describe", "aspect-pair", "trine", "moon", "sun", "--json", "--compact"] },
      { label: "astrology:dodecatemoria", args: ["astrology:dodecatemoria", "5", "--json", "--compact"] },
      {
        label: "astrology:astrocartography",
        args: [
          "astrology:astrocartography",
          "1990-01-15",
          "14:30",
          "--lat=40.7128",
          "--lon=-74.006",
          "--latitude-step=30",
          ...astrologyRuntimeArgs,
          "--json",
          "--compact",
          "--fields=meridianLines",
        ],
        expectStderr: true,
      },
      {
        label: "astrology:astrocartography:query",
        args: [
          "astrology:astrocartography:query",
          "1990-01-15",
          "14:30",
          "--lat=40.7128",
          "--lon=-74.006",
          "--query-lat=51.5",
          "--query-lon=-0.12",
          ...astrologyRuntimeArgs,
          "--json",
          "--compact",
          "--fields=lines",
        ],
        expectStderr: true,
      },
    ];

    for (const testCase of cases) {
      const result = runCli(testCase.args, testCase.input);
      assertSuccess(result, `${testCase.label} --json`);
      assertStrictJsonStdout(result, testCase.label);
      if (!testCase.expectStderr) {
        expect(result.stderr, `${testCase.label}: stderr`).toBe("");
      }
    }
  });

  it("emits parseable JSON errors on stdout for representative command failures", () => {
    const cases: Array<{ label: string; args: string[] }> = [
      { label: "unknown command", args: ["not-a-command", "--json", "--compact"] },
      { label: "gematria missing stdin", args: ["gematria", "--json", "--compact"] },
      { label: "numerology invalid date", args: ["numerology", "bogus", "--json", "--compact"] },
      { label: "tarot missing card", args: ["tarot:card", "--json", "--compact"] },
      { label: "ifa invalid date", args: ["ifa", "bogus", "--json", "--compact"] },
      { label: "tree unknown node", args: ["tree:node", "sphere:Nope", "--json", "--compact"] },
      {
        label: "astrology missing wasm",
        args: [
          "astrology",
          "1990-01-15",
          "14:30",
          "--lat=40.7128",
          "--lon=-74.006",
          "--wasm-path=/missing/swisseph.wasm",
          "--ephe-path",
          REAL_EPHE_PATH,
          "--json",
          "--compact",
        ],
      },
    ];

    for (const testCase of cases) {
      const result = runCli(testCase.args);
      expect(result.status, `${testCase.label}: exit status`).toBe(1);
      const payload = assertStrictJsonStdout(result, testCase.label) as { error?: boolean; code?: string };
      expect(payload.error, `${testCase.label}: error flag`).toBe(true);
      expect(typeof payload.code, `${testCase.label}: error code`).toBe("string");
    }
  });

  it("suppresses stderr diagnostics with --quiet and --silent", () => {
    for (const quietFlag of ["--quiet", "--silent"]) {
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
        quietFlag,
      ]);
      assertSuccess(result, `astrology ${quietFlag}`);
      assertStrictJsonStdout(result, `astrology ${quietFlag}`);
      expect(result.stderr).toBe("");
    }
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

  it("rejects impossible civil dates in every date-taking command with INVALID_DATE", () => {
    const natal = ["14:30", "--lat=48.856", "--lon=2.352"];
    const cases: string[][] = [
      ["numerology", "2001-02-30"],
      ["numerology:lifepath", "2026-04-31"],
      ["numerology:cycles", "2026-02-29"],
      ["numerology:challenges", "1900-02-29"],
      ["numerology:fibonacci", "2026-02-31"],
      ["ifa", "2026-02-29"],
      ["astrology", "1990-02-30", ...natal],
      ["astrology:transits", "1990-06-15", ...natal, "--transit-date=2026-02-31"],
      ["astrology:transits", "1990-06-15", ...natal, "--from=2026-02-30", "--to=2026-03-10"],
      ["astrology:transits", "1990-06-15", ...natal, "--from=2026-03-01", "--to=2026-04-31"],
      ["astrology:firdaria", "1990-06-15", ...natal, "--target-date=2030-02-30"],
    ];
    for (const args of cases) {
      const result = runCli([...args, "--json", "--compact"]);
      expect(result.status, args.join(" ")).toBe(1);
      expect(assertStrictJsonStdout(result, args.join(" "))).toMatchObject({ error: true, code: "INVALID_DATE" });
    }
    const pt = runCli(["numerology", "2026-02-30", "--language", "pt-BR", "--json", "--compact"]);
    expect(JSON.parse(pt.stdout)).toMatchObject({ code: "INVALID_DATE", message: expect.stringContaining("não existe no calendário") });
  });

  it("accepts leap days only in leap years and the full 0001-9999 year range", () => {
    for (const date of ["2000-02-29", "2024-02-29", "0001-01-01", "0099-12-31", "9999-12-31"]) {
      assertSuccess(runCli(["numerology", date, "--json", "--compact"]), `numerology ${date}`);
    }
    const year50 = runCli(["numerology", "0050-06-15", "--json", "--compact"]);
    assertSuccess(year50, "numerology 0050-06-15");
    const parts = (JSON.parse(year50.stdout) as { kaabalistic: { parts: Record<string, string> } }).kaabalistic.parts;
    expect(parts).toMatchObject({ day: "15", month: "06", year1: "00", year2: "50" });
    expect(runCli(["numerology", "1900-02-29", "--json", "--compact"]).status).toBe(1);
  });
});


describe("I Ching CLI", () => {
  it("derives identical readings from lines, number/positions and input JSON with clean stdout", () => {
    const variants = [
      ["--lines", "767987"],
      ["--hexagram", "30", "--moving", "2,4"],
      ["--input-json", JSON.stringify({hexagramNumber:30,movingLines:[2,4]})],
      ["--input-json", JSON.stringify({lines:[7,6,7,9,8,7]})],
    ];
    const results = variants.map(args => {
      const result = runCli(["iching:reading",...args,"--json","--compact"]);
      assertSuccess(result,"iching:reading");
      expect(result.stderr).toBe("");
      return assertStrictJsonStdout(result,"iching:reading");
    });
    for(const result of results) expect(result).toEqual(results[0]);
    expect(results[0]).toMatchObject({lineCode:"767987",cast:{hexagram:{number:30}},transformed:{hexagram:{number:26}}});
  });

  it("casts valid six-line readings, describes hexagrams and supports field filtering", () => {
    const cast = runCli(["iching:cast","--json","--compact","--fields=lineCode,lines"]);
    assertSuccess(cast,"iching:cast");
    expect(cast.stderr).toBe("");
    expect(assertStrictJsonStdout(cast,"iching:cast")).toMatchObject({lineCode:expect.stringMatching(/^[6789]{6}$/),lines:expect.any(Array)});
    const hex = runCli(["iching:hexagram","10","--json","--compact","--fields=hexagram.number,hexagram.hanzi"]);
    assertSuccess(hex,"iching:hexagram");
    expect(assertStrictJsonStdout(hex,"iching:hexagram")).toEqual({hexagram:{number:10,hanzi:"履"}});
    const help = runCli(["help","iching:reading","--json","--compact"]);
    assertSuccess(help,"help iching:reading");
    expect(help.stdout).toContain('"moving"');
  });

  it("rejects invalid/ambiguous inputs with the standard JSON error contract", () => {
    const cases = [
      ["iching:reading","--lines","77777"],
      ["iching:reading","--lines","777777","--hexagram","1"],
      ["iching:reading","--hexagram","25","--moving","1,1"],
      ["iching:reading","--hexagram","25","--moving","0"],
      ["iching:reading","--hexagram","25","--moving","1.5"],
      ["iching:reading","--input-json",'{"hexagramNumber":25,"movingLines":["4"]}'],
      ["iching:hexagram","65"],
      ["iching:hexagram","1.5"],
    ];
    for(const args of cases) {
      const result = runCli([...args,"--json","--compact"]);
      expect(result.status).toBe(1);
      expect(assertStrictJsonStdout(result,"invalid I Ching input")).toMatchObject({error:true,code:"INVALID_ARGUMENT"});
    }
    const missing = runCli(["iching:reading","--json","--compact"]);
    expect(missing.status).toBe(1);
    expect(JSON.parse(missing.stdout)).toMatchObject({error:true,code:"MISSING_ARGUMENT"});
  });
});


describe("Portuguese CLI", () => {
  it("localizes help and human Ifa output while keeping machine keys", () => {
    const help = runCli(["help", "ifa", "--language", "pt-BR", "--json", "--compact", "--quiet"]);
    assertSuccess(help, "Portuguese help");
    const payload = JSON.parse(help.stdout);
    expect(payload.command.name).toBe("ifa");
    expect(payload.command.description).toBe("Calcule o Odu de uma data");
    const human = runCli(["ifa", "1990-01-15", "--language", "pt-BR", "--no-json", "--quiet"]);
    assertSuccess(human, "Portuguese Ifa");
    expect(human.stdout).toContain("Esquerda:");
    expect(human.stdout).toContain("Norte:");
  });
  it("localizes tarot content before filtering and preserves English defaults", () => {
    const args = ["tarot:card", "20", "--json", "--compact", "--fields=meaning,tarotCard", "--quiet"];
    const en = runCli(args), pt = runCli([...args, "--language=pt-BR"]);
    assertSuccess(en, "English tarot"); assertSuccess(pt, "Portuguese tarot");
    expect(JSON.parse(en.stdout).meaning).toBe("Make retrospectives and learn from mistakes and successes");
    expect(JSON.parse(pt.stdout)).toEqual({ meaning: "Faça retrospectivas, aprenda com seus erros e acertos", tarotCard: "O Julgamento" });
  });
  it("localizes classical I Ching output and errors without changing codes", () => {
    const reading = runCli(["iching:reading", "--hexagram=1", "--moving=1,2,3,4,5,6", "--language=pt-BR", "--json", "--compact", "--fields=oracle", "--quiet"]);
    assertSuccess(reading, "Portuguese I Ching");
    expect(JSON.parse(reading.stdout).oracle[0].text.content).toBe("Veja um grupo de dragões sem cabeça. Boa fortuna.");
    const invalid = runCli(["iching:hexagram", "65", "--language=pt-BR", "--json", "--compact", "--quiet"]);
    expect(invalid.status).toBe(1);
    const error = JSON.parse(invalid.stdout);
    expect(error.code).toBe("INVALID_ARGUMENT");
    expect(error.message).toContain("O número do hexagrama deve ser um inteiro de 1 a 64");
  });
});

// ---------------------------------------------------------------------------
// Dated numerology, chart-quality, timeline, Jyotish, bulk and capability commands.
// All inputs are synthetic and every dated command passes an explicit date.
// ---------------------------------------------------------------------------

function cli(args: string[], input?: string): any {
  const result = runCli([...args, "--json", "--compact", "--quiet"], input);
  assertSuccess(result, args.join(" "));
  return assertStrictJsonStdout(result, args.join(" "));
}

function cliError(args: string[], code: string, input?: string): { error: true; code: string; message: string } {
  const result = runCli([...args, "--json", "--compact", "--quiet"], input);
  expect(result.status, `${args.join(" ")}\n${result.stdout}`).toBe(1);
  const payload = assertStrictJsonStdout(result, args.join(" ")) as { error: true; code: string; message: string };
  expect(payload).toMatchObject({ error: true, code });
  return payload;
}

const NATAL = ["1991-04-12", "14:30", "--lat=48.856", "--lon=2.352"];
const MS_PER_DAY = 86_400_000;

describe("numerology as-of and schedule commands", () => {
  it("evaluates legacy commands at --as-of and states the evaluation date", () => {
    const profile = cli(["numerology", "1990-01-15", "--as-of=2026-03-01"]);
    expect(profile.asOf).toBe("2026-03-01");
    expect(profile.fibonacci.currentAge).toBe(36);
    // The day before the birthday the completed age is still 35, on the birthday it is 36.
    expect(cli(["numerology:fibonacci", "1990-01-15", "--as-of=2026-01-14"]).currentAge).toBe(35);
    expect(cli(["numerology:fibonacci", "1990-01-15", "--as-of=2026-01-15"]).currentAge).toBe(36);
    expect(cli(["numerology:cycles", "1990-01-15", "--as-of=2026-03-01"]).asOf).toBe("2026-03-01");
    const withName = cli(["numerology:cycles", "1990-01-15", "Ana", "--as-of=2026-03-01"]);
    expect(withName.asOf).toBe("2026-03-01");
    expect(withName.personalPeriods).toHaveLength(3);
    // Without --as-of the default stays "today" and is still stated.
    expect(cli(["numerology:cycles", "1990-01-15"]).asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(cli(["numerology", "1990-01-15", "--input-json", '{"asOf":"2026-03-01"}']).asOf).toBe("2026-03-01");
    cliError(["numerology", "1990-01-15", "--as-of=2026-02-30"], "INVALID_DATE");
  });

  it("cycles and snapshot agree on the personal month: cycles currentPersonalMonth is a zero-based index", () => {
    // Born 1990-05-17, evaluated 2026-11-19: the personal year (birthday to birthday) began 2026-05-17,
    // 2026 + 5 + 17 = 2048 -> 14 -> 5. The personal month began 2026-11-17 (phase 7, calendar month 11):
    // 11 + 5 = 16 -> 7.
    const cycles = cli(["numerology:cycles", "1990-05-17", "Ana", "--as-of=2026-11-19"]);
    const snapshot = cli(["numerology:snapshot", "1990-05-17", "Ana", "--as-of=2026-11-19"]);
    expect(cycles.currentPersonalMonth).toBe(6);
    expect(cycles.personalMonths[cycles.currentPersonalMonth]).toMatchObject({ month: 11, value: { reducedValue: 7 } });
    expect(snapshot.personalMonth).toMatchObject({ phase: 7, calendarMonth: 11, value: { value: 7 } });
    expect(snapshot.personalMonth.phase).toBe(cycles.currentPersonalMonth + 1);
  });

  it("legacy cycles report an unavailable soul number for names without vowels, in JSON and text", () => {
    const json = cli(["numerology:cycles", "1990-01-15", "Ng", "--as-of=2026-03-01"]);
    expect(json.soulNumber).toMatchObject({ available: false });
    expect(json.personalPeriods[2].value).toMatchObject({ available: false });
    const en = runCli(["numerology:cycles", "1990-01-15", "Ng", "--as-of=2026-03-01", "--no-json", "--quiet"]);
    assertSuccess(en, "cycles Ng");
    expect(en.stdout).toContain("Soul Number: unavailable");
    expect(en.stdout).not.toContain("undefined");
    const pt = runCli(["numerology:cycles", "1990-01-15", "Ng", "--as-of=2026-03-01", "--no-json", "--quiet", "--language=pt-BR"]);
    expect(pt.stdout).toContain("indisponível");
    expect(pt.stdout).not.toContain("undefined");
    // Tilde letters differ from plain ones: soul number 8 for "João" versus 4 for "Joao".
    const joao = cli(["numerology:cycles", "1990-01-15", "João", "--as-of=2026-03-01"]);
    const plain = cli(["numerology:cycles", "1990-01-15", "Joao", "--as-of=2026-03-01"]);
    expect(joao.soulNumber.reducedValue).toBe(8);
    expect(plain.soulNumber.reducedValue).toBe(4);
  });

  it("snapshot reports the birthday-year frame, method metadata and the soul number only with a name", () => {
    const snapshot = cli(["numerology:snapshot", "1990-01-15", "Ana", "--as-of=2026-03-01"]);
    expect(snapshot).toMatchObject({ asOf: "2026-03-01", status: "ok", completedAge: 36, evaluation: { asOf: "2026-03-01" } });
    expect(snapshot.meta.methodVersion).toEqual(expect.any(String));
    expect(snapshot.birthdayYear).toMatchObject({ start: "2026-01-15", endExclusive: "2027-01-15" });
    // Days since the last birthday, 1-based: 16 days left in January + 28 in February + 1.
    expect(snapshot.dayInBirthdayYear).toBe(46);
    expect(snapshot.fixedNumbers.firstNameSoulNumber.available).toBe(true);
    const unnamed = cli(["numerology:snapshot", "1990-01-15", "--as-of=2026-03-01"]);
    expect(unnamed.fixedNumbers.firstNameSoulNumber).toMatchObject({ available: false, reason: "first-name-missing" });
    const before = cli(["numerology:snapshot", "1990-01-15", "--as-of=1980-01-01"]);
    expect(before.status).toBe("before-birth");
    const afterDeath = cli(["numerology:snapshot", "1990-01-15", "--as-of=2026-03-01", "--death=2020-05-05"]);
    expect(afterDeath.status).toBe("after-death");
  });

  it("applies method options and accepts the payload form", () => {
    const kaab = cli(["numerology:snapshot", "1990-01-15", "--as-of=2026-03-01", "--life-path-method=kaabalistic", "--masters=reduce", "--name-kind=full-name"]);
    expect(kaab.meta).toMatchObject({ lifePathMethod: "kaabalistic", masterPolicy: "reduce", nameInput: { kind: "full-name" } });
    const payload = cli(["numerology:snapshot", "--input-json", JSON.stringify({ birth: { kind: "month-day", month: 1, day: 15 }, asOf: "2026-03-01" })]);
    expect(payload.status).toBe("partial");
    expect(payload.completedAge).toBeNull();
  });

  it("returns structured reasons for partial birth dates instead of inventing a date", () => {
    const monthDay = cli(["numerology:snapshot", "01-15", "--birth-kind=month-day", "--as-of=2026-03-01"]);
    expect(monthDay.status).toBe("partial");
    expect(monthDay.unavailable.map((item: { field: string; reason: string }) => item.reason)).toContain("birth-year-unknown");
    expect(monthDay.birthdayYear.personalYear).toBeDefined();
    const unknown = cli(["numerology:snapshot", "--birth-kind=unknown", "--as-of=2026-03-01"]);
    expect(unknown.status).toBe("partial");
    const partial = cli(["numerology:partial", "1990-01", "--birth-kind=year-month", "--candidates", "--as-of=2026-03-01"]);
    expect(partial.capability.kind).toBe("year-month");
    expect(partial.candidates.candidateCount).toBe(31);
    expect(partial.candidates.selectedDate).toBeNull();
    const yearOnly = cli(["numerology:partial", "1990", "--birth-kind=year", "--candidates", "--as-of=2026-03-01"]);
    expect(yearOnly.candidates.candidateCount).toBe(365);
  });

  it("generates contiguous personal-month intervals that tile the birthday year", () => {
    const result = cli(["numerology:personal-cycles", "1990-01-15", "Ana", "--as-of=2026-03-01"]);
    const months = result.intervals.filter((i: { layer: string }) => i.layer === "personal-month");
    const periods = result.intervals.filter((i: { layer: string }) => i.layer === "personal-period");
    expect(months).toHaveLength(12);
    expect(periods).toHaveLength(3);
    for (let i = 1; i < months.length; i++) expect(months[i].start).toBe(months[i - 1].endExclusive);
    const total = months.reduce((sum: number, m: { lengthDays: number }) => sum + m.lengthDays, 0);
    expect(total).toBe(365);
    // Phase number (1-12) stays separate from the reduced value (1-9, 11, 22, 33).
    expect(months.map((m: { phase: number }) => m.phase)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(result.evaluation.asOf).toBe("2026-03-01");
    expect(result.current.personalYear.birthdayYear).toBe(2026);
  });

  it("timeline honours layers, clipping, short-month policy and output formats", () => {
    const args = ["numerology:timeline", "1990-01-31", "--from=2026-01-01", "--to=2027-01-01", "--layers=personal-month"];
    const next = cli(args);
    const clamp = cli([...args, "--short-month-policy=clamp"]);
    const febNext = next.intervals.find((i: { calendarMonth: number; birthdayYear: number }) => i.calendarMonth === 2 && i.birthdayYear === 2026);
    const febClamp = clamp.intervals.find((i: { calendarMonth: number; birthdayYear: number }) => i.calendarMonth === 2 && i.birthdayYear === 2026);
    expect(febClamp.start).toBe("2026-02-28");
    expect(febNext.start).not.toBe(febClamp.start);
    const clipped = cli(["numerology:timeline", "1990-01-15", "--from=2026-01-01", "--to=2027-01-01", "--layers=personal-year", "--horizon=2026-06-01"]);
    expect(clipped.intervals.find((i: { birthdayYear: number }) => i.birthdayYear === 2026)).toMatchObject({ endExclusive: "2026-06-01", endClipped: true, nominalEndExclusive: "2027-01-15" });
    const table = cli([...args, "--format=table"]);
    expect(table.table.columns.map((c: { key: string }) => c.key)).toContain("layer");
    const markdown = runCli([...args, "--format=markdown", "--quiet"]);
    assertSuccess(markdown, "timeline markdown");
    expect(markdown.stdout.startsWith("| Layer | Start")).toBe(true);
    const human = runCli(["numerology:timeline", "1990-01-15", "--from=2026-01-01", "--to=2026-03-01", "--layers=heptad", "--no-json", "--quiet"]);
    assertSuccess(human, "timeline human");
    expect(human.stdout).toContain("| heptad |");
  });

  it("heptads are fixed 52-day blocks with the day number inside the current block", () => {
    const result = cli(["numerology:heptads", "1990-01-15", "--as-of=2026-03-01"]);
    expect(result.current.heptad).toMatchObject({ phase: 1, dayInHeptad: 46 });
    const heptads = result.intervals.filter((i: { layer: string }) => i.layer === "heptad");
    expect(heptads.length).toBeGreaterThanOrEqual(7);
    for (const h of heptads.slice(0, 6)) expect(h.nominalLengthDays).toBe(52);
    expect(result.intervals.some((i: { layer: string }) => i.layer === "age-cycle")).toBe(true);
  });

  it("life stages follow the named age-transition convention", () => {
    const result = cli(["numerology:life-stages", "1990-01-15", "--as-of=2026-03-01"]);
    expect(result.pinnacles).toHaveLength(4);
    expect(result.firstPinnacleEndAge).toBe(36 - result.lifePathForTransition);
    expect(result.completedAge).toBe(36);
    expect(result.active.pinnacle.startAge).toBeLessThanOrEqual(36);
    const fixed = cli(["numerology:life-stages", "1990-01-15", "--as-of=2026-03-01", "--first-pinnacle-end-age=30"]);
    expect(fixed.firstPinnacleEndAge).toBe(30);
    expect(fixed.transitionRule).toBe("fixed-first-end-age");
  });

  it("rejects bad numerology input with the existing error codes", () => {
    cliError(["numerology:snapshot", "1990-02-30"], "INVALID_DATE");
    cliError(["numerology:snapshot", "1990-01-15", "--masters=sometimes"], "INVALID_ARGUMENT");
    cliError(["numerology:snapshot", "1990-01-15", "--birth-kind=century"], "INVALID_ARGUMENT");
    cliError(["numerology:snapshot", "1990", "--birth-kind=month-day"], "INVALID_DATE");
    cliError(["numerology:snapshot"], "MISSING_ARGUMENT");
    cliError(["numerology:snapshot", "--input-json", JSON.stringify({ birth: { kind: "century" } })], "INVALID_ARGUMENT");
    cliError(["numerology:timeline", "1990-01-15", "--from=2026-01-01"], "MISSING_ARGUMENT");
    cliError(["numerology:timeline", "1990-01-15", "--from=2026-01-01", "--to=2027-01-01", "--layers=weekly"], "INVALID_ARGUMENT");
    cliError(["numerology:timeline", "1990-01-15", "--from=2027-01-01", "--to=2026-01-01"], "INVALID_ARGUMENT");
    cliError(["numerology:timeline", "1990-01-15", "--from=1900-01-01", "--to=2100-01-01"], "INVALID_ARGUMENT");
    cliError(["numerology:timeline", "1990-01-15", "--from=2026-01-01", "--to=2026-12-31", "--layers=calendar-day", "--max-intervals=10"], "INVALID_ARGUMENT");
    cliError(["numerology:life-stages", "01-15", "--birth-kind=month-day"], "INVALID_ARGUMENT");
    cliError(["numerology:snapshot", "1990-01-15", "--bogus-flag"], "INVALID_ARGUMENT");
  });
});

describe("astrology chart completeness and quality", () => {
  it("prints sect, lots and Moon phase and keeps --fields usable on them", () => {
    const chart = cli(["astrology", ...NATAL, "--fields=sect,sectDetails.sect,lots.spirit,lots.fortune,moonPhase.phase,moonPhase.elongation"]);
    expect(chart.sectDetails.sect).toBe(chart.sect);
    expect(chart.lots.fortune).toBeGreaterThanOrEqual(0);
    expect(chart.lots.spirit).toBeLessThan(360);
    expect(chart.moonPhase.phase).toEqual(expect.any(String));
  });

  it("orb profile generates contacts with per-class limits, unlike the --max-orb post-filter", () => {
    const profile = cli(["astrology", ...NATAL, "--orb-profile=ptolemaic-plus-quincunx", "--fields=policyAspects,aspects"]);
    const policy = profile.policyAspects;
    expect(policy.profile).toBe("ptolemaic-plus-quincunx");
    expect(policy.counts.raw).toBe(policy.edges.length);
    expect(policy.counts.grouped).toBeLessThanOrEqual(policy.counts.raw);
    expect(policy.edges.length).toBeGreaterThan(5);
    const sorted = [...policy.edges].sort((a: { orb: number }, b: { orb: number }) => a.orb - b.orb);
    expect(policy.edges.map((e: { orb: number }) => e.orb)).toEqual(sorted.map((e: { orb: number }) => e.orb));
    const rank = (kind: string) => (["angle", "node", "point", "lot"].includes(kind) ? 3 : kind === "luminary" ? 8 : 6);
    for (const edge of policy.edges) {
      const expected = Math.min(...[edge.aKind, edge.bKind].filter((k: string) => ["angle", "node", "point", "lot"].includes(k)).map(rank), ...(["angle", "node", "point", "lot"].some((k) => [edge.aKind, edge.bKind].includes(k)) ? [] : [[edge.aKind, edge.bKind].includes("luminary") ? 8 : 6]));
      expect(edge.orbLimit).toBe(expected);
      expect(edge.orb).toBeLessThanOrEqual(edge.orbLimit);
    }
    // --max-orb only narrows; it cannot add contacts and also narrows the policy edges.
    const narrowed = cli(["astrology", ...NATAL, "--orb-profile=ptolemaic-plus-quincunx", "--max-orb=1", "--fields=policyAspects.counts,policyAspects.maxOrbPostFilter"]);
    expect(narrowed.policyAspects.maxOrbPostFilter).toBe(1);
    expect(narrowed.policyAspects.counts.raw).toBeLessThan(policy.counts.raw);
    const grouped = cli(["astrology", ...NATAL, "--orb-profile=ptolemaic-plus-quincunx", "--group-axes", "--fields=policyAspects.axisGroups"]);
    expect(Array.isArray(grouped.policyAspects.axisGroups)).toBe(true);
    expect(profile.policyAspects.axisGroups).toBeUndefined();
  });

  it("selects points and aspects, and rejects unknown names instead of returning nothing", () => {
    const points = cli(["astrology", ...NATAL, "--points=sun,moon,asc", "--fields=points"]);
    expect(points.points.map((p: { id: string }) => p.id).sort()).toEqual(["asc", "moon", "sun"]);
    const filtered = cli(["astrology", ...NATAL, "--orb-profile=ptolemaic-plus-quincunx", "--aspect-types=quincunx", "--fields=policyAspects.edges"]);
    expect(filtered.policyAspects.edges.every((e: { aspect: string }) => e.aspect === "quincunx")).toBe(true);
    cliError(["astrology", ...NATAL, "--orb-profile=ptolemaic"], "INVALID_ARGUMENT");
    cliError(["astrology", ...NATAL, "--aspect-types=trinee"], "INVALID_ARGUMENT");
    cliError(["astrology", ...NATAL, "--points=sun,vulcan"], "INVALID_ARGUMENT");
    cliError(["astrology", ...NATAL, "--orb-profile=ptolemaic-plus-quincunx", "--aspect-types=duodecile"], "INVALID_ARGUMENT");
    cliError(["astrology", ...NATAL, "--input-json", JSON.stringify({ orbPolicy: { id: "x", aspects: [] } })], "INVALID_ARGUMENT");
  });

  it("computes several house systems from one ephemeris pass", () => {
    const result = cli(["astrology", ...NATAL, "--house-systems=placidus,whole-sign", "--fields=houseSystems"]);
    const { P, W } = result.houseSystems.systems;
    expect(W.cusps).toHaveLength(12);
    for (let i = 0; i < 12; i++) {
      expect(W.cusps[i] % 30).toBeCloseTo(0, 9);
      expect(((W.cusps[(i + 1) % 12] - W.cusps[i] + 360) % 360)).toBeCloseTo(30, 9);
    }
    expect(P.cusps).toHaveLength(12);
    expect(P.cusps).not.toEqual(W.cusps);
    expect(P.ascendant).toBeCloseTo(W.ascendant, 9);
    expect(result.houseSystems.points).toBeUndefined();
    cliError(["astrology", ...NATAL, "--house-systems=placidus,bogus"], "INVALID_ARGUMENT");
  });

  it("untimed charts need no time, label placeholders and give a Moon sign range", () => {
    const chart = cli(["astrology", "1991-04-12", "--quality=untimed", "--lat=48.856", "--lon=2.352"]);
    expect(chart).toMatchObject({ quality: "untimed", status: "limited", chart: null });
    expect(chart.points.length).toBeGreaterThan(5);
    expect(chart.points.every((p: { flags: { placeholder: boolean } }) => p.flags.placeholder)).toBe(true);
    const ids = chart.analysisPoints.map((p: { id: string }) => p.id);
    for (const hidden of ["moon", "asc", "mc", "lot-fortune"]) expect(ids).not.toContain(hidden);
    expect(chart.unavailable.map((u: { item: string }) => u.item)).toEqual(expect.arrayContaining(["moon-degree", "angles", "houses", "lots"]));
    expect(chart.moonDayRange.signs.length).toBeGreaterThanOrEqual(1);
    expect(chart.moonDayRange.signs.length).toBeLessThanOrEqual(2);
    expect(chart.moonDayRange.degreesExcluded).toBe(true);
    const noPlace = cli(["astrology", "1991-04-12", "--quality=untimed"]);
    expect(noPlace.provenance.placeKnown).toBe(false);
    const withPolicy = cli(["astrology", "1991-04-12", "--quality=untimed", "--orb-profile=ptolemaic-plus-quincunx", "--fields=policyAspects.edges"]);
    for (const e of withPolicy.policyAspects.edges) expect([e.a, e.b]).not.toContain("moon");
  });

  it("partial and rectified qualities are explicit about what is withheld", () => {
    const partial = cli(["astrology", "1991-04", "--quality=partial"]);
    expect(partial).toMatchObject({ status: "unavailable", points: [] });
    expect(partial.unavailable[0].reason).toBe("date-incomplete");
    const rectified = cli(["astrology", ...NATAL, "--quality=rectified", "--exclude-rectified-angles", "--fields=qualified"]);
    expect(rectified.qualified.quality).toBe("rectified");
    expect(rectified.qualified.unavailable[0].item).toBe("rectified-angles");
    expect(rectified.qualified.analysisPoints.map((p: { id: string }) => p.id)).not.toContain("asc");
    cliError(["astrology", "1991-04-12", "12:00", "--quality=untimed", "--lat=1", "--lon=1"], "INVALID_ARGUMENT");
    cliError(["astrology", "1991-04-12", "--quality=recorded", "--lat=1", "--lon=1"], "MISSING_ARGUMENT");
    cliError(["astrology", "1991-04-12", "--quality=approximate"], "INVALID_ARGUMENT");
    cliError(["astrology", "1991-4", "--quality=partial"], "INVALID_DATE");
    cliError(["astrology", "1991-04-12", "--quality=untimed", "--house-systems=placidus"], "INVALID_ARGUMENT");
  });

  it("--strict-ephemeris is accepted and fails outside the shipped Swiss files", () => {
    const strict = cli(["astrology", ...NATAL, "--strict-ephemeris", "--fields=input.date"]);
    expect(strict.input.date).toBe("1991-04-12");
    const outside = cliError(["astrology", "1500-06-15", "12:00", "--lat=48.856", "--lon=2.352", "--strict-ephemeris"], "INVALID_DATE");
    expect(outside.message).toContain("strictEphemeris");
  });

  it("emits table and markdown formats for chart points", () => {
    const table = cli(["astrology", ...NATAL, "--format=table"]);
    expect(table.pointsTable.columns[0].key).toBe("point");
    const markdown = runCli(["astrology", ...NATAL, "--format=markdown", "--quiet"]);
    assertSuccess(markdown, "astrology markdown");
    expect(markdown.stdout).toContain("| Point | Longitude");
    cliError(["astrology", ...NATAL, "--format=csv"], "INVALID_ARGUMENT");
  });
});

describe("transits, composite, Davison and overlays", () => {
  const pair = JSON.stringify({
    chartA: { date: "1991-04-12", time: "14:30", lat: 48.856, lon: 2.352 },
    chartB: { date: "1993-11-03", time: "08:10", lat: 40.71, lon: -74.0 },
  });

  it("reports closest approaches only on request and only in range mode", () => {
    const range = [...NATAL, "--from=2026-03-01", "--to=2026-04-01", "--transit-planets=saturn,pluto"];
    expect(cli(["astrology:transits", ...range, "--fields=closestApproaches,perfections"]).closestApproaches).toBeUndefined();
    const withClosest = cli(["astrology:transits", ...range, "--closest-approaches", "--fields=closestApproaches"]);
    expect(Array.isArray(withClosest.closestApproaches)).toBe(true);
    for (const c of withClosest.closestApproaches) expect(c.kind ?? "closest-approach").not.toBe("exact");
    cliError(["astrology:transits", ...NATAL, "--transit-date=2026-03-17", "--closest-approaches"], "INVALID_ARGUMENT");
  });

  it("runs transit-to-natal contacts under an orb profile with fixed natal targets", () => {
    const result = cli(["astrology:transits", ...NATAL, "--transit-date=2026-03-17", "--orb-profile=ptolemaic-plus-quincunx", "--group-axes", "--fields=policyAspects"]);
    const policy = result.policyAspects;
    expect(policy.counts.raw).toBe(policy.edges.length);
    expect(policy.natalTargets).toContain("fixed");
    // With natal speeds ignored, motion is known for contacts to natal angles too.
    const toAngle = policy.edges.filter((e: { b: string }) => ["asc", "mc"].includes(e.b));
    for (const e of toAngle) expect(["applying", "separating", "exact"]).toContain(e.motion);
    expect(Array.isArray(policy.axisGroups)).toBe(true);
    cliError(["astrology:transits", ...NATAL, "--transit-date=2026-03-17", "--orb-profile=none"], "INVALID_ARGUMENT");
  });

  it("composite output includes opposite composite angles", () => {
    const result = cli(["astrology:composite", "--input-json=-", "--fields=compositeAngles"], pair);
    const angles = result.compositeAngles;
    expect(Object.keys(angles).sort()).toEqual(["ascendant", "descendant", "ic", "mc"]);
    expect((((angles.ic.longitude - angles.mc.longitude) % 360) + 360) % 360).toBeCloseTo(180, 6);
    expect((((angles.descendant.longitude - angles.ascendant.longitude) % 360) + 360) % 360).toBeCloseTo(180, 6);
  });

  it("Davison is a real chart at the UTC time midpoint and the arithmetic place midpoint", () => {
    const a = cli(["astrology", "1991-04-12", "14:30", "--lat=48.856", "--lon=2.352", "--fields=dateUtc"]);
    const b = cli(["astrology", "1993-11-03", "08:10", "--lat=40.71", "--lon=-74", "--fields=dateUtc"]);
    const davison = cli(["astrology:davison", "--input-json=-", "--fields=midpointDateUtc,location,method,chart.planets.sun.longitude"], pair);
    const expectedMs = (Date.parse(a.dateUtc) + Date.parse(b.dateUtc)) / 2;
    expect(Math.abs(Date.parse(davison.midpointDateUtc) - expectedMs)).toBeLessThanOrEqual(1);
    expect(davison.location.latitude).toBeCloseTo((48.856 + 40.71) / 2, 9);
    expect(davison.method.name).toBe("davison");
    expect(davison.method.distinctFromComposite).toContain("different methods");
    const great = cli(["astrology:davison", "--input-json=-", "--midpoint-convention=great-circle", "--fields=method.geographicMidpoint"], pair);
    expect(great.method.geographicMidpoint).toBe("great-circle");
    cliError(["astrology:davison", "--input-json=-", "--midpoint-convention=rhumb"], "INVALID_ARGUMENT", pair);
    cliError(["astrology:davison"], "MISSING_ARGUMENT");
  });

  it("overlays place each chart's points in the other's houses", () => {
    const result = cli(["astrology:overlays", "--input-json=-", "--points=sun,moon", "--no-angles", "--fields=aInB,bInA"], pair);
    for (const direction of [result.aInB, result.bInA]) {
      expect(direction.available).toBe(true);
      expect(direction.placements.map((p: { point: string }) => p.point)).toEqual(["sun", "moon"]);
      for (const p of direction.placements) expect(p.house).toBeGreaterThanOrEqual(1), expect(p.house).toBeLessThanOrEqual(12);
    }
    const withAngles = cli(["astrology:overlays", "--input-json=-", "--points=sun,ascendant", "--fields=aInB.placements"], pair);
    expect(withAngles.aInB.placements.map((p: { point: string }) => p.point)).toContain("ascendant");
    cliError(["astrology:overlays", "--input-json=-", "--points=sun,vulcan"], "INVALID_ARGUMENT", pair);
  });
});

describe("progressions, solar arc, returns and timelines", () => {
  const target = "--target-date=2026-03-01";

  it("secondary progressions declare the time key and agree with the solar arc", () => {
    const natal = cli(["astrology", ...NATAL, "--fields=dateUtc"]);
    const prog = cli(["astrology:progressions", ...NATAL, target, "--fields=ageYears,solarArcDegrees,method.timeKey,angles"]);
    const expectedAge = (Date.UTC(2026, 2, 1, 12) - Date.parse(natal.dateUtc)) / (365.25 * MS_PER_DAY);
    expect(prog.ageYears).toBeCloseTo(expectedAge, 9);
    expect(prog.method.timeKey.yearLength.days).toBe(365.25);
    expect(Object.keys(prog.angles).sort()).toEqual(["naibod", "quotidian", "solar-arc"]);
    const tropical = cli(["astrology:progressions", ...NATAL, target, "--year-length=tropical", "--angle-conventions=quotidian", "--fields=ageYears,angles"]);
    expect(tropical.ageYears).toBeCloseTo((Date.UTC(2026, 2, 1, 12) - Date.parse(natal.dateUtc)) / (365.2422 * MS_PER_DAY), 9);
    expect(Object.keys(tropical.angles)).toEqual(["quotidian"]);
    const arc = cli(["astrology:solar-arc", ...NATAL, target, "--fields=arcDegrees,directed"]);
    expect(arc.arcDegrees).toBeCloseTo(prog.solarArcDegrees, 9);
    const subset = cli(["astrology:solar-arc", ...NATAL, target, "--targets=sun,ascendant", "--fields=directed,method.targetSet"]);
    expect(Object.keys(subset.directed).sort()).toEqual(["ascendant", "sun"]);
    expect(subset.method.targetSet).toEqual(["sun", "ascendant"]);
    const sunOnly = cli(["astrology", ...NATAL, "--fields=planets.sun.longitude"]);
    expect((((subset.directed.sun.longitude - sunOnly.planets.sun.longitude - prog.solarArcDegrees) % 360) + 540) % 360).toBeCloseTo(180, 6);
    cliError(["astrology:progressions", ...NATAL, "--target-date=1980-01-01"], "INVALID_ARGUMENT");
    cliError(["astrology:progressions", ...NATAL, target, "--year-length=weekly"], "INVALID_ARGUMENT");
    cliError(["astrology:progressions", ...NATAL, target, "--angle-conventions=magic"], "INVALID_ARGUMENT");
    cliError(["astrology:solar-arc", ...NATAL, target, "--targets=vulcan"], "INVALID_ARGUMENT");
    cliError(["astrology:solar-arc", ...NATAL, target, "--arc-kind=other"], "INVALID_ARGUMENT");
  });

  it("finds the Saturn return near age 29.5 inside a UTC window", () => {
    const result = cli(["astrology:returns", "1960-06-15", "14:30", "--lat=48.856", "--lon=2.352", "--from=1988-01-01", "--to=1992-01-01", "--kinds=saturn-return", "--fields=entries,input"]);
    expect(result.entries).toHaveLength(1);
    const instant = Date.parse(result.entries[0].instant);
    const ageYears = (instant - Date.UTC(1960, 5, 15, 12, 30)) / (365.25 * MS_PER_DAY);
    expect(ageYears).toBeGreaterThan(29);
    expect(ageYears).toBeLessThan(30.5);
    expect(result.entries[0].residualDegrees).toBeLessThan(1e-6);
    expect(result.input.window).toContain("UTC");
    const empty = cli(["astrology:returns", "1960-06-15", "14:30", "--lat=48.856", "--lon=2.352", "--from=1961-01-01", "--to=1962-01-01", "--kinds=saturn-return", "--fields=entries"]);
    expect(empty.entries).toEqual([]);
    cliError(["astrology:returns", ...NATAL, "--from=2000-01-01"], "MISSING_ARGUMENT");
    cliError(["astrology:returns", ...NATAL, "--from=2000-01-01", "--to=2300-01-01"], "INVALID_ARGUMENT");
    cliError(["astrology:returns", ...NATAL, "--from=2000-01-01", "--to=2001-01-01", "--kinds=comet-return"], "INVALID_ARGUMENT");
    cliError(["astrology:returns", ...NATAL, "--from=2001-01-01", "--to=2000-01-01"], "INVALID_ARGUMENT");
  });

  it("profection timeline advances one house and sign per birthday", () => {
    const result = cli(["astrology:profections:timeline", ...NATAL, "--from-age=10", "--to-age=23", "--fields=entries"]);
    expect(result.entries).toHaveLength(14);
    result.entries.forEach((entry: { age: number; house: number; start: { year: number; month: number; day: number } }, i: number) => {
      expect(entry.house).toBe((entry.age % 12) + 1);
      expect(entry.start).toEqual({ year: 1991 + entry.age, month: 4, day: 12 });
      if (i > 0) expect(entry.age).toBe(result.entries[i - 1].age + 1);
    });
    expect(result.entries[0].sign).toBe(result.entries[12].sign);
    const dates = cli(["astrology:profections:timeline", ...NATAL, "--from=2026-01-01", "--to=2026-12-31", "--fields=entries"]);
    expect(dates.entries.map((e: { age: number }) => e.age)).toEqual([34, 35]);
    cliError(["astrology:profections:timeline", ...NATAL], "MISSING_ARGUMENT");
    cliError(["astrology:profections:timeline", ...NATAL, "--from-age=3"], "MISSING_ARGUMENT");
    cliError(["astrology:profections:timeline", ...NATAL, "--from-age=0", "--to-age=500"], "INVALID_ARGUMENT");
  });

  it("firdaria timeline keeps nominal ends when the window clips a period", () => {
    const result = cli(["astrology:firdaria:timeline", ...NATAL, "--to=1996-01-01", "--fields=entries,sect"]);
    expect(["diurnal", "nocturnal"]).toContain(result.sect);
    const first = result.entries[0];
    expect(first.clippedEnd).toBe(true);
    expect(first.endExclusive).toBe("1996-01-01T00:00:00.000Z");
    expect(Date.parse(first.nominalEnd)).toBeGreaterThan(Date.parse(first.endExclusive));
    expect(first.subPeriods.length).toBeGreaterThan(0);
    const noSub = cli(["astrology:firdaria:timeline", ...NATAL, "--to=1996-01-01", "--no-sub-periods", "--sect=nocturnal", "--fields=entries,sect"]);
    expect(noSub.sect).toBe("nocturnal");
    expect(noSub.entries[0].subPeriods).toEqual([]);
    expect(noSub.entries[0].planet).toBe("Moon");
    cliError(["astrology:firdaria:timeline", ...NATAL], "MISSING_ARGUMENT");
    cliError(["astrology:firdaria:timeline", ...NATAL, "--to=1980-01-01"], "INVALID_ARGUMENT");
    cliError(["astrology:firdaria:timeline", ...NATAL, "--to=2500-01-01"], "INVALID_ARGUMENT");
    cliError(["astrology:firdaria:timeline", ...NATAL, "--to=2000-01-01", "--sect=twilight"], "INVALID_ARGUMENT");
  });
});

describe("jyotish", () => {
  it("computes both frames, selected-frame dashas, karakas and the active dasha at --as-of", () => {
    const chart = cli(["astrology:jyotish", ...NATAL, "--as-of=2026-03-01"]);
    expect(chart.nakshatraFrame).toBe("dhruva");
    expect(chart.node).toBe("mean");
    expect(chart.dhruva.points.moon).toBeDefined();
    expect(chart.lahiri.points.moon).toBeDefined();
    expect(chart.yearLengthDays).toBe(365.2422);
    expect(chart.karakas.entries).toHaveLength(7);
    const asOfJd = Date.UTC(2026, 2, 1, 12) / MS_PER_DAY + 2440587.5;
    const maha = chart.activeDasha.vimshottari.maha;
    expect(maha.startJd).toBeLessThanOrEqual(asOfJd);
    expect(maha.endJd).toBeGreaterThan(asOfJd);
    expect(chart.activeDasha.asOf).toBe("2026-03-01");
  });

  it("applies frame, node, year length, karaka scheme and dasha horizon options", () => {
    const lahiri = cli(["astrology:jyotish", ...NATAL, "--frame=lahiri", "--node=true", "--karaka-scheme=8", "--year-length-days=365.25", "--through=2030-01-01"]);
    expect(lahiri).toMatchObject({ nakshatraFrame: "lahiri", node: "true", yearLengthDays: 365.25 });
    expect(lahiri.karakas.entries).toHaveLength(8);
    const lastMaha = lahiri.vimshottari.mahas[lahiri.vimshottari.mahas.length - 1];
    expect(lastMaha.startJd).toBeLessThan(Date.UTC(2030, 0, 1) / MS_PER_DAY + 2440587.5);
    expect(lahiri.vimshottari.throughJd).toBeCloseTo(Date.UTC(2030, 0, 1) / MS_PER_DAY + 2440587.5, 6);
    const mixed = cli(["astrology:jyotish", ...NATAL, "--frame=dhruva", "--fields=dhruva.points.moon.nakshatraIndex,lahiri.points.moon.nakshatraIndex"]);
    expect(mixed.dhruva.points.moon.nakshatraIndex).toEqual(expect.any(Number));
    expect(mixed.lahiri.points.moon.nakshatraIndex).toEqual(expect.any(Number));
  });

  it("untimed Jyotish has no Moon-based outputs and invalid options are rejected", () => {
    const untimed = cli(["astrology:jyotish", ...NATAL, "--untimed"]);
    expect(untimed.karakas).toBeUndefined();
    expect(untimed.vimshottari).toBeUndefined();
    cliError(["astrology:jyotish", ...NATAL, "--frame=sidereal"], "INVALID_ARGUMENT");
    cliError(["astrology:jyotish", ...NATAL, "--node=south"], "INVALID_ARGUMENT");
    cliError(["astrology:jyotish", ...NATAL, "--karaka-scheme=9"], "INVALID_ARGUMENT");
    cliError(["astrology:jyotish", ...NATAL, "--year-length-days=-3"], "INVALID_ARGUMENT");
    cliError(["astrology:jyotish", ...NATAL, "--as-of=2026-02-30"], "INVALID_DATE");
  });
});

describe("chart facts commands", () => {
  const BR = ["1990-05-17", "14:30", "--lat=-23.5505", "--lon=-46.6333"];

  it("astrology:condition returns the per-body condition and the chain summary", () => {
    const traditional = cli(["astrology:condition", ...BR]);
    expect(traditional).toMatchObject({ rulers: "traditional", sect: "diurnal", input: { rulers: "traditional" } });
    expect(traditional.bodies.Sun).toMatchObject({ sign: "Taurus", house: 8, dispositor: "Venus" });
    expect(traditional.bodies.Sun.dispositorChain.length).toBeGreaterThan(0);
    expect(traditional.bodies.Venus.dignities.detriment).toBe(true);
    expect(traditional.finalDispositors).toEqual(expect.any(Array));
    expect(traditional.loops).toEqual(expect.any(Array));
    expect(traditional.mutualReceptions).toEqual(expect.any(Array));
    const modern = cli(["astrology:condition", ...BR, "--rulers=modern", "--fields=rulers,bodies.Mars.dispositor"]);
    expect(modern).toEqual({ rulers: "modern", bodies: { Mars: { dispositor: "Neptune" } } });
    expect(traditional.bodies.Mars.dispositor).toBe("Jupiter");
    cliError(["astrology:condition", ...BR, "--rulers=ancient"], "INVALID_ARGUMENT");
    cliError(["astrology:condition", "1990-05-17", "14:30"], "MISSING_ARGUMENT");
  });

  it("astrology:rulers needs no birth data and honors the scheme", () => {
    const traditional = cli(["astrology:rulers"]);
    expect(traditional).toMatchObject({ rulers: "traditional", table: { Scorpio: "Mars", Aquarius: "Saturn", Pisces: "Jupiter" } });
    expect(Object.keys(traditional.table)).toHaveLength(12);
    expect(cli(["astrology:rulers", "--rulers=modern", "--fields=table.Scorpio,table.Aquarius,table.Pisces"])).toEqual({
      table: { Scorpio: "Pluto", Aquarius: "Uranus", Pisces: "Neptune" },
    });
    cliError(["astrology:rulers", "--rulers=vedic"], "INVALID_ARGUMENT");
  });

  it("astrology:varga places the chart in D9 with the Karakamsha, and accepts any division or all", () => {
    const d9 = cli(["astrology:varga", ...BR]);
    expect(d9.frame).toBe("tropical");
    expect(d9.vargas).toHaveLength(1);
    expect(d9.vargas[0]).toMatchObject({ division: 9, name: "Navamsa", lagnaKey: "lagna" });
    expect(Object.keys(d9.vargas[0].placements)).toEqual(expect.arrayContaining(["sun", "moon", "rahu", "ketu", "lagna"]));
    expect(d9.vargas[0].placements.sun).toMatchObject({ sign: "Leo", house: 11 });
    // The Atmakaraka is the one astrology:jyotish ranks first with the same defaults.
    const jyotish = cli(["astrology:jyotish", ...BR, "--fields=karakas.entries"]);
    expect(d9.karakamsha.atmakaraka).toBe(jyotish.karakas.entries[0].body);
    expect(d9.karakamsha).toMatchObject({ atmakaraka: "sun", sign: "Leo" });
    expect(d9.karakamsha.houses.sun).toBe(1);
    const d10 = cli(["astrology:varga", ...BR, "--division=10"]);
    expect(d10.vargas[0].division).toBe(10);
    expect(d10.karakamsha).toBeUndefined();
    const all = cli(["astrology:varga", ...BR, "--division=all"]);
    expect(all.vargas.map((v: { division: number }) => v.division)).toEqual([1, 2, 3, 4, 7, 9, 10, 12, 16, 20, 24, 27, 30, 40, 45, 60]);
    expect(all.karakamsha.sign).toBe("Leo");
    cliError(["astrology:varga", ...BR, "--division=5"], "INVALID_ARGUMENT");
    cliError(["astrology:varga", ...BR, "--karaka-scheme=9"], "INVALID_ARGUMENT");
  });

  it("astrology:yogakarakas works from an ascendant sign or from birth data", () => {
    expect(cli(["astrology:yogakarakas", "--ascendant=taurus"])).toEqual({
      ascendant: "Taurus",
      source: "--ascendant",
      yogakarakas: [{ planet: "saturn", houses: [9, 10] }],
    });
    expect(cli(["astrology:yogakarakas", "--ascendant=Gemini"]).yogakarakas).toEqual([]);
    const fromChart = cli(["astrology:yogakarakas", ...BR]);
    expect(fromChart.ascendant).toBe("Libra");
    expect(fromChart.yogakarakas).toEqual([{ planet: "saturn", houses: [4, 5] }]);
    cliError(["astrology:yogakarakas", "--ascendant=Ophiuchus"], "INVALID_ARGUMENT");
    cliError(["astrology:yogakarakas"], "MISSING_ARGUMENT");
  });

  it("tree:map ranks spheres and paths with their markers, and says when astrology is left out", () => {
    const full = cli(["tree:map", ...BR, "--name=Maria Silva"]);
    expect(full.systems).toEqual({ astrology: true, numerology: true, gematria: true });
    expect(full.note).toBeNull();
    expect(full.rankedSpheres[0]).toMatchObject({ id: expect.stringMatching(/^sphere:/), share: expect.any(Number) });
    expect(full.rankedSpheres[0].markers[0]).toEqual({ sourceName: expect.any(String), mapping: expect.any(String), weight: expect.any(Number) });
    expect(full.rankedPaths[0].id).toMatch(/^path:/);
    expect(full.rankedSpheres.reduce((sum: number, row: { share: number }) => sum + row.share, 0)).toBeCloseTo(100, 0);
    expect(Object.keys(full.weightsById).length).toBeGreaterThan(0);
    expect(Object.keys(full.rawWeightsById).length).toBeGreaterThan(0);
    expect(full.input).toMatchObject({ date: "1990-05-17", time: "14:30", name: "Maria Silva" });

    const dateOnly = cli(["tree:map", "1990-05-17", "--name=Maria Silva"]);
    expect(dateOnly.systems).toEqual({ astrology: false, numerology: true, gematria: true });
    expect(dateOnly.note).toContain("numerology and gematria only");
    expect(dateOnly.unlitSpheres.length).toBeGreaterThan(0);
    const litIds = dateOnly.rankedSpheres.map((row: { id: string }) => row.id);
    for (const sphere of dateOnly.unlitSpheres) expect(litIds).not.toContain(sphere.id);
    const numerologyOnly = cli(["tree:map", "1990-05-17"]);
    expect(numerologyOnly.systems.gematria).toBe(false);

    const pt = cli(["tree:map", "1990-05-17", "--language=pt-BR"]);
    expect(pt.note).toContain("numerologia e gematria");
    cliError(["tree:map"], "MISSING_ARGUMENT");
    cliError(["tree:map", "1990-05-17", "14:30"], "MISSING_ARGUMENT");
    cliError(["tree:map", "1990-02-30"], "INVALID_DATE");
  });

  it("tree:paths returns house quests, both paths and the house spheres in the requested language", () => {
    const en = cli(["tree:paths", ...BR]);
    expect(en.houseQuests).toHaveLength(12);
    expect(en.houseQuests[0]).toMatchObject({ house: 1, sign: "Libra" });
    expect(en.lightningPath[0]).toMatchObject({ step: 1, sphere: "Kether" });
    expect(en.serpentPath[0]).toMatchObject({ step: 1, sphere: "Malkuth" });
    expect(en.houseSpheres["7"]).toEqual(["Tiphareth", "Netzach"]);
    expect(en.language).toBe("en");
    const pt = cli(["tree:paths", ...BR, "--language=pt-BR", "--fields=language,houseQuests"]);
    expect(pt.language).toBe("pt-BR");
    expect(pt.houseQuests[0].text).toBe(`Busca ${pt.houseQuests[0].adjective} por ${pt.houseQuests[0].theme}`);
    expect(pt.houseQuests[0].text).not.toBe(en.houseQuests[0].text);
    cliError(["tree:paths", "1990-05-17", "14:30"], "MISSING_ARGUMENT");
  });

  it("lists the new commands in help and capabilities, with Portuguese descriptions", () => {
    const names = ["astrology:condition", "astrology:rulers", "astrology:varga", "astrology:yogakarakas", "tree:map", "tree:paths"];
    const help = cli(["help"]) as { commands: Array<{ name: string; examples: string[] }> };
    const caps = cli(["capabilities"]);
    for (const name of names) {
      expect(help.commands.map((c) => c.name), name).toContain(name);
      expect(caps.cli.commands, name).toContain(name);
      expect(help.commands.find((c) => c.name === name)!.examples.length, name).toBeGreaterThan(0);
      const pt = runCli(["help", name, "--language", "pt-BR", "--json", "--compact", "--quiet"]);
      assertSuccess(pt, `help ${name} pt-BR`);
      const english = (cli(["help", name]) as { command: { description: string } }).command.description;
      expect((JSON.parse(pt.stdout) as { command: { description: string } }).command.description, name).not.toBe(english);
    }
  });
});

describe("published bundle keeps editorial provenance private", () => {
  it("ships no provenance paths or review notes in dist, and describe output carries none", () => {
    const forbidden = /readings\/skills|dazy-natal|modulo \d+\/aula|astrologia-hermetica|Mat selected/;
    const walk = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
        entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]
      );
    const offenders = walk(resolve(ROOT, "dist"))
      .filter((file) => /\.(js|mjs|cjs|map|ts|mts|cts|json)$/.test(file))
      .filter((file) => forbidden.test(readFileSync(file, "utf8")));
    expect(offenders).toEqual([]);

    const entry = cli(["astrology:describe", "planet-sign", "mars", "Leo"]);
    expect(entry.found).toBe(true);
    expect(entry).not.toHaveProperty("src");
    expect(entry).not.toHaveProperty("reviewNotes");
  });
});

describe("bulk collections and capabilities", () => {
  const manifest = {
    people: [
      { id: "p1", date: "1991-04-12", time: "14:30", lat: 48.856, lon: 2.352 },
      { id: "p2", date: "1993-11-03", time: "08:10", lat: 40.71, lon: -74.0 },
      { id: "p3", date: "1985-02-20", quality: "untimed", lat: 51.5, lon: -0.12 },
      { id: "p4", date: "1978-09-09", time: "23:05", lat: -33.87, lon: 151.21 },
    ],
    events: [{ id: "e1", date: "2020-03-20", time: "12:00" }],
  };
  const manifestText = JSON.stringify(manifest);

  it("default output is one JSON document with every pair, in deterministic order", () => {
    const result = cli(["astrology:collection", "--manifest=-"], manifestText);
    expect(result.people.map((p: { id: string }) => p.id)).toEqual(["p1", "p2", "p3", "p4"]);
    expect(result.events.map((e: { id: string }) => e.id)).toEqual(["e1"]);
    expect(result.pairs).toHaveLength(6);
    expect(result.pairs.map((p: { idA: string; idB: string }) => `${p.idA}~${p.idB}`)).toEqual(["p1~p2", "p1~p3", "p1~p4", "p2~p3", "p2~p4", "p3~p4"]);
    expect(result.summary.pairs).toMatchObject({ total: 6, ok: 6, partial: 3 });
    const untimedPair = result.pairs.find((p: { idA: string; idB: string }) => p.idB === "p3" && p.idA === "p1");
    expect(untimedPair.partial).toBe(true);
    expect(untimedPair.excludedPoints.b).toContain("moon");
    // The untimed side (p3 is idB here) never contributes its Moon.
    expect(untimedPair.aspects.every((a: { planetB: string }) => a.planetB !== "moon")).toBe(true);
    // Lightweight by default: no embedded charts unless asked.
    expect(result.people[0].chart).toBeUndefined();
    const withCharts = cli(["astrology:collection", "--manifest=-", "--include-charts", "--fields=people.0.chart.sect"], manifestText);
    expect(withCharts.people[0].chart.sect).toEqual(expect.any(String));
  });

  it("accepts the manifest as a file or --input-json and selects pairs", () => {
    const dir = makeTempDir();
    const file = join(dir, "people.json");
    writeJson(file, manifest);
    expect(cli(["astrology:collection", `--manifest=${file}`, "--fields=summary.selection"]).summary.selection).toEqual({ mode: "all", pairCount: 6 });
    expect(cli(["astrology:collection", "--input-json", manifestText, "--pair-mode=timed-only", "--fields=summary"]).summary.selection).toEqual({ mode: "timed-only", pairCount: 3 });
    const specified = cli(["astrology:collection", "--input-json", JSON.stringify({ ...manifest, pairs: { mode: "pairs", pairs: [["p4", "p1"]] } }), "--fields=pairs"]);
    expect(specified.pairs).toHaveLength(1);
    expect(specified.pairs[0]).toMatchObject({ idA: "p1", idB: "p4" });
    expect(cli(["astrology:collection", "--manifest=-", "--concurrency=1", "--fields=summary.options"], manifestText).summary.options.concurrency).toBe(1);
  });

  it("--ndjson streams one JSON record per line and ends with the summary", () => {
    const result = runCli(["astrology:collection", "--manifest=-", "--ndjson", "--quiet"], manifestText);
    assertSuccess(result, "collection ndjson");
    const lines = result.stdout.trimEnd().split("\n");
    expect(lines).toHaveLength(4 + 1 + 6 + 1);
    const records = lines.map((line) => JSON.parse(line));
    expect(records.map((r) => r.type)).toEqual(["person", "person", "person", "person", "event", "pair", "pair", "pair", "pair", "pair", "pair", "summary"]);
    expect(result.stdout).not.toContain("\n\n");
    // A different contract from the default: the stream is not one document.
    expect(() => JSON.parse(result.stdout)).toThrow();
    cliError(["astrology:collection", "--manifest=-", "--ndjson", "--fields=summary"], "INVALID_ARGUMENT", manifestText);
  });

  it("writes progress to stderr and --quiet suppresses it while stdout stays one document", () => {
    const loud = runCli(["astrology:collection", "--manifest=-", "--json", "--compact"], manifestText);
    assertSuccess(loud, "collection progress");
    expect(loud.stderr).toContain("collection pairs: 6/6");
    assertStrictJsonStdout(loud, "collection progress stdout");
    const quiet = runCli(["astrology:collection", "--manifest=-", "--json", "--compact", "--quiet"], manifestText);
    assertSuccess(quiet, "collection quiet");
    expect(quiet.stderr).toBe("");
  });

  it("rejects bad manifests and options with existing error codes", () => {
    cliError(["astrology:collection"], "MISSING_ARGUMENT");
    cliError(["astrology:collection", "--manifest=-"], "INVALID_JSON", "[1,2]");
    cliError(["astrology:collection", "--manifest=-"], "INVALID_JSON", "{not json");
    cliError(["astrology:collection", "--manifest=/nonexistent/people.json"], "INVALID_ARGUMENT");
    cliError(["astrology:collection", "--manifest=-"], "INVALID_ARGUMENT", JSON.stringify({ people: "nobody" }));
    cliError(["astrology:collection", "--manifest=-"], "INVALID_ARGUMENT", JSON.stringify({ people: [manifest.people[0], manifest.people[0]] }));
    cliError(["astrology:collection", "--manifest=-"], "MISSING_ARGUMENT", JSON.stringify({ people: [{ id: "x", date: "1991-04-12", lat: 1, lon: 1 }] }));
    cliError(["astrology:collection", "--manifest=-"], "INVALID_DATE", JSON.stringify({ people: [{ id: "x", date: "1991-02-30", time: "10:00", lat: 1, lon: 1 }] }));
    cliError(["astrology:collection", "--manifest=-", "--concurrency=0"], "INVALID_ARGUMENT", manifestText);
    cliError(["astrology:collection", "--manifest=-", "--concurrency=100"], "INVALID_ARGUMENT", manifestText);
    cliError(["astrology:collection", "--manifest=-", "--pair-mode=pairs"], "INVALID_ARGUMENT", manifestText);
    cliError(["astrology:collection", "--manifest=-", "--pair-mode=everyone"], "INVALID_ARGUMENT", manifestText);
    cliError(["astrology:collection", "--manifest=-"], "INVALID_ARGUMENT", JSON.stringify({ ...manifest, pairs: { mode: "pairs", pairs: [["p1", "ghost"]] } }));
    cliError(["astrology:collection", "--manifest=-", "--input-json", manifestText], "INVALID_ARGUMENT", manifestText);
  });

  it("exits with the signal code when interrupted during a bulk run", () => {
    const people = Array.from({ length: 60 }, (_, i) => ({ id: `n${i}`, date: "1991-04-12", time: "14:30", lat: 48.856 + i / 100, lon: 2.352 }));
    const manifestPath = join(makeTempDir(), "big.json");
    writeJson(manifestPath, { people });
    const child = spawnSync("sh", ["-c", `node "${CLI_PATH}" astrology:collection --manifest="${manifestPath}" --json --compact --quiet & pid=$!; sleep 1.2; kill -TERM $pid; wait $pid; echo "status=$?"`], { encoding: "utf8", cwd: ROOT, maxBuffer: 64 * 1024 * 1024 });
    // Either it was interrupted (143) or the machine was fast enough to finish first; it must never hang or print a partial document.
    expect(child.stdout).toMatch(/status=(0|143)\n$/);
    if (child.stdout.includes("status=143")) expect(child.stdout.replace(/status=143\n$/, "")).toBe("");
  });

  it("capabilities describe the build and are listed by help --json", () => {
    const caps = cli(["capabilities"]);
    expect(caps).toMatchObject({ kind: "kaabalah-capabilities", schemaVersion: 1 });
    expect(caps.cli.version).toBe(VERSION);
    expect(caps.limits.collection.maxPeople).toBe(500);
    expect(caps.astrology.ephemeris).toMatchObject({ initialized: false, coverageSource: "static" });
    const help = cli(["help"]);
    expect(caps.cli.commands).toEqual(help.commands.map((c: { name: string }) => c.name));
    expect(caps.cli.errorCodes).toContain("INVALID_ARGUMENT");
    const probed = cli(["capabilities", "--probe", "--fields=astrology.ephemeris"]);
    expect(probed.astrology.ephemeris).toMatchObject({ initialized: true, coverageSource: "runtime" });
    cliError(["capabilities", "--probe", "--wasm-path=/nonexistent/swisseph.wasm"], "WASM_INIT_ERROR");
  });
});

describe("help contract for the new commands and fixed defects", () => {
  const help = () => cli(["help"]) as { commands: Array<{ name: string; flags: Array<{ name: string; description: string }>; args: Array<{ name: string; description: string }>; examples: string[] }> };
  const find = (name: string) => help().commands.find((c) => c.name === name)!;

  it("lists --as-of on every time-sensitive numerology command and the schedule flags", () => {
    for (const name of ["numerology", "numerology:cycles", "numerology:fibonacci", "numerology:snapshot", "numerology:timeline", "numerology:heptads", "numerology:personal-cycles", "numerology:life-stages", "numerology:partial"]) {
      expect(find(name).flags.map((f) => f.name), name).toContain("as-of");
    }
    expect(find("numerology:timeline").flags.map((f) => f.name)).toEqual(expect.arrayContaining(["from", "to", "layers", "death", "horizon", "short-month-policy", "life-path-method", "masters", "name-kind", "birth-kind", "format"]));
    expect(find("numerology:snapshot").examples.join(" ")).toContain("--as-of=");
  });

  it("lists the new astrology flags and commands with examples", () => {
    expect(find("astrology").flags.map((f) => f.name)).toEqual(expect.arrayContaining(["orb-profile", "points", "house-systems", "quality", "strict-ephemeris"]));
    expect(find("astrology:transits").flags.map((f) => f.name)).toEqual(expect.arrayContaining(["closest-approaches", "orb-profile"]));
    expect(find("astrology:jyotish").flags.map((f) => f.name)).toEqual(expect.arrayContaining(["frame", "node", "year-length-days", "karaka-scheme", "as-of", "through"]));
    expect(find("astrology:collection").flags.map((f) => f.name)).toEqual(expect.arrayContaining(["manifest", "concurrency", "ndjson", "pair-mode"]));
    expect(find("astrology").flags.find((f) => f.name === "orb-profile")!.description).toContain("--max-orb");
    expect(find("astrology").flags.find((f) => f.name === "max-orb")!.description).toContain("Post-filter");
    expect(find("astrology:collection").flags.find((f) => f.name === "ndjson")!.description).toContain("different contract");
    for (const name of ["astrology:davison", "astrology:overlays", "astrology:progressions", "astrology:solar-arc", "astrology:returns", "astrology:profections:timeline", "astrology:firdaria:timeline", "capabilities"]) {
      expect(find(name).examples.length, name).toBeGreaterThan(0);
    }
  });

  it("documents the --input-json forms of the I Ching commands and every geocoding key", () => {
    expect(find("iching:hexagram").examples.join(" ")).toContain("hexagramNumber");
    expect(find("iching:reading").flags.find((f) => f.name === "lines")!.description).toContain("lines");
    const geocoded = help().commands.flatMap((c) => c.flags.filter((f) => f.name === "location" || f.name === "sr-location"));
    expect(geocoded.length).toBeGreaterThan(5);
    for (const flag of geocoded) expect(flag.description).toContain("KAABALAH_GOOGLE_MAPS_API_KEY");
  });

  it("tree:svg help matches validation: only kaabalah renders", () => {
    const system = find("tree:svg").flags.find((f) => f.name === "system")!;
    expect(system.description).toContain("only kaabalah");
    cliError(["tree:svg", "--system=hermetic-qabalah"], "UNSUPPORTED_SYSTEM");
  });

  it("separates the actionable hint from the message with punctuation", () => {
    const error = cliError(["iching:hexagram", "65"], "INVALID_ARGUMENT");
    expect(error.message).toMatch(/[.!?] Run "kaabalah help iching:hexagram" for command usage\.$/);
    expect(error.message).not.toMatch(/\d Run "kaabalah help/);
  });

  it("keeps strict unknown-flag handling for the new commands", () => {
    cliError(["numerology:snapshot", "1990-01-15", "--orb-profile=x"], "INVALID_ARGUMENT");
    cliError(["astrology:jyotish", ...NATAL, "--ndjson"], "INVALID_ARGUMENT");
    cliError(["capabilities", "--as-of=2026-01-01"], "INVALID_ARGUMENT");
  });
});
