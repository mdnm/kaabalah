import { defineConfig } from "tsup";

const libraryEntries = [
  "src/index.ts",
  "src/core/index.ts",
  "src/numerology/index.ts",
  "src/astrology/index.ts",
  "src/gematria/index.ts",
  "src/ifa/index.ts",
  "src/semantic/index.ts",
  "src/tarot/index.ts",
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
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
]);
