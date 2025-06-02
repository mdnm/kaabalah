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
  ],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
}); 