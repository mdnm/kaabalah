import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/core/index.ts',
    'src/numerology/index.ts',
    'src/astrology/index.ts',
    'src/gematria/index.ts',
    'src/ifa/index.ts',
    'src/tarot/index.ts',
    'src/cli.ts',
  ],
  format: ['cjs', 'esm'],
  dts: { entry: [
    'src/index.ts',
    'src/core/index.ts',
    'src/numerology/index.ts',
    'src/astrology/index.ts',
    'src/gematria/index.ts',
    'src/ifa/index.ts',
    'src/tarot/index.ts',
  ]},
  outDir: 'dist',
  splitting: true,
  treeshake: true,
  loader: { ".wasm": "file" },
  publicDir: 'wasm/build',
  sourcemap: true,
  clean: true,
}); 