# Swiss Ephemeris via WASM for astrological calculations

The astrology module uses Swiss Ephemeris compiled to WebAssembly rather than native Node bindings, a pure-JS astronomy library, or a remote API. This gives us portability across Node/browser/edge without a native compilation step, while using the same calculation engine professional astrologers trust for deterministic, tradition-accurate results.

## Considered Options

- **Native swisseph bindings** — faster, but requires platform-specific compilation and breaks browser/edge deployment.
- **Pure-JS astronomy libraries** (e.g. astronomy.js) — no WASM overhead, but lack the precision and traditional-astrology features (house systems, fixed stars, nodes) that Swiss Ephemeris provides out of the box.
- **Remote ephemeris API** — eliminates the WASM/ephe file shipping cost, but introduces network dependency, latency, and a single point of failure for what should be pure, deterministic calculations.

## Consequences

- The library ships `swisseph.wasm` and ephemeris data files (`ephe/`), adding to bundle size.
- Tests require `WASM_PATH` and `EPHE_PATH` environment variables pointing to these files.
- Node asset resolution is format-aware: `getSwissEph()` finds the bundled `.wasm` and `ephe/` files next to the running module (`import.meta.url` in native ESM, `__dirname` in the CJS bundle); explicit `wasmPath`/`ephePath` options and the `KAABALAH_WASM_PATH`/`KAABALAH_EPHE_PATH` environment variables override that. The default `?url` import resolution breaks in bundled CJS output, which is why the CLI still passes explicit paths (its flags, falling back to `__dirname`-relative bundled paths). Initialisation fails with a typed `SwissEphError` when the `.se1` files cannot be read instead of silently degrading to Moshier. `getSwissEphInfo()` and `calculatePlanetPositionDetailed()` report which ephemeris actually produced a value, and `strictEphemeris` turns a substitution into an error.
- Astrology is lazy-loaded in the CLI to avoid WASM initialization overhead for non-astrology commands.
