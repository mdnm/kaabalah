# Swiss Ephemeris via WASM for astrological calculations

The astrology module uses Swiss Ephemeris compiled to WebAssembly rather than native Node bindings, a pure-JS astronomy library, or a remote API. This gives us portability across Node/browser/edge without a native compilation step, while using the same calculation engine professional astrologers trust for deterministic, tradition-accurate results.

## Considered Options

- **Native swisseph bindings** — faster, but requires platform-specific compilation and breaks browser/edge deployment.
- **Pure-JS astronomy libraries** (e.g. astronomy.js) — no WASM overhead, but lack the precision and traditional-astrology features (house systems, fixed stars, nodes) that Swiss Ephemeris provides out of the box.
- **Remote ephemeris API** — eliminates the WASM/ephe file shipping cost, but introduces network dependency, latency, and a single point of failure for what should be pure, deterministic calculations.

## Consequences

- The library ships `swisseph.wasm` and ephemeris data files (`ephe/`), adding to bundle size.
- Tests require `WASM_PATH` and `EPHE_PATH` environment variables pointing to these files.
- The CLI resolves WASM/ephe paths relative to `__dirname` because the default `?url` import resolution breaks in bundled CJS output.
- Astrology is lazy-loaded in the CLI to avoid WASM initialization overhead for non-astrology commands.
