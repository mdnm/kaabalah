import { readFile } from "node:fs/promises";

import { defineConfig } from "tsup";
import type { Plugin } from "esbuild";

/**
 * The Emscripten Node glue (wasm/build/swisseph.node.js) is CommonJS code that needs
 * `require`, `__dirname` and `__filename`; bundled into a native ESM chunk it throws
 * ("__dirname is not defined" / "Dynamic require of fs is not supported"), and any shim
 * would add static `fs`/`path` imports that break browser bundlers of the ESM build.
 * So in the ESM output the glue is replaced by an empty stub, and src/astrology/swisseph.ts
 * imports the shipped CommonJS file (dist/swisseph.node.js via publicDir) by file URL at
 * runtime instead. The CJS output keeps the bundled glue.
 */
const stubNodeGlueInEsm: Plugin = {
  name: "kaabalah-stub-node-glue-in-esm",
  setup(build) {
    if (build.initialOptions.format !== "esm") {
      return;
    }
    build.onResolve({ filter: /wasm\/build\/swisseph\.node\.js$/ }, (args) => ({
      path: args.path,
      namespace: "kaabalah-node-glue-stub",
    }));
    build.onLoad({ filter: /.*/, namespace: "kaabalah-node-glue-stub" }, () => ({
      contents: "export default undefined;",
      loader: "js",
    }));
  },
};

/**
 * The authored description rows keep editorial provenance (`src`: file and line ranges into the
 * maintainer's private course and reading folders; `reviewNotes`: review comments). That data stays
 * in src/astrology/descriptions.json for the maintainer but must never ship, so the bundled copy is
 * stripped here. Published entries expose `src: []` and `reviewNotes: []` (see descriptions.ts).
 */
const PRIVATE_PROVENANCE_KEYS = new Set(["src", "reviewNotes"]);

function stripProvenance(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripProvenance);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !PRIVATE_PROVENANCE_KEYS.has(key))
        .map(([key, child]) => [key, stripProvenance(child)]),
    );
  }
  return value;
}

const stripDescriptionProvenance: Plugin = {
  name: "kaabalah-strip-description-provenance",
  setup(build) {
    build.onLoad({ filter: /src[\\/]astrology[\\/]descriptions\.json$/ }, async (args) => {
      const stripped = JSON.stringify(stripProvenance(JSON.parse(await readFile(args.path, "utf8"))));
      if (/readings[\\/]skills|modulo \d+[\\/ ]aula/.test(stripped)) {
        throw new Error("descriptions.json still carries private provenance paths after stripping");
      }
      return { contents: stripped, loader: "json" };
    });
  },
};

// `import.meta.url` is used by src/astrology/swisseph.ts for native ESM. In the CJS output
// esbuild leaves import.meta empty, and the code falls back to __dirname on purpose.
const logOverride = { "empty-import-meta": "silent" } as const;

const libraryEntries = [
  "src/index.ts",
  "src/core/index.ts",
  "src/numerology/index.ts",
  "src/astrology/index.ts",
  "src/gematria/index.ts",
  "src/ifa/index.ts",
  "src/iching/index.ts",
  "src/semantic/index.ts",
  "src/tarot/index.ts",
  "src/visual/index.ts",
];

export default defineConfig([
  {
    entry: libraryEntries,
    format: ["cjs", "esm"],
    dts: { entry: libraryEntries },
    outDir: "dist",
    splitting: true,
    treeshake: true,
    loader: { ".wasm": "file" },
    publicDir: "wasm/build",
    sourcemap: true,
    clean: true,
    esbuildPlugins: [stubNodeGlueInEsm, stripDescriptionProvenance],
    esbuildOptions(options) {
      options.logOverride = { ...options.logOverride, ...logOverride };
    },
  },
  {
    entry: {
      cli: "src/cli.ts",
    },
    format: ["cjs"],
    outDir: "dist",
    loader: { ".wasm": "file" },
    sourcemap: true,
    clean: false,
    esbuildPlugins: [stripDescriptionProvenance],
    esbuildOptions(options) {
      options.logOverride = { ...options.logOverride, ...logOverride };
    },
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
]);
