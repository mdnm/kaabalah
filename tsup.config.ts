import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/numerology/index.ts',
    'src/astrology/index.ts',
    'src/kaabalah/index.ts',
    'src/tarot/index.ts',
  ],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
}); 