import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: ['src/module.d.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.d.ts']
    }
  },
  define: {
    WASM_PATH: JSON.stringify(resolve(__dirname, 'wasm/build/swisseph.wasm')),
    EPHE_PATH: JSON.stringify(resolve(__dirname, 'ephe'))
  }
}); 