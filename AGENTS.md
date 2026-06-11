# AGENTS.md — Kaabalah Project Guide

## Build & Development Commands

```bash
npm run build          # Build with tsup (outputs CJS + ESM)
npm run dev            # Build in watch mode
npm run typecheck      # tsc --noEmit (must stay green)
npm run test           # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report
npm run test:ui        # Run tests with visual UI
```

To run a single test file:
```bash
npx vitest run src/path/to/file.test.ts
```

## Architecture Overview

TypeScript library for esoteric calculations. Exports **9 tree-shakable modules**: `kaabalah/core`, `kaabalah/numerology`, `kaabalah/astrology`, `kaabalah/gematria`, `kaabalah/tarot`, `kaabalah/ifa`, `kaabalah/semantic`, `kaabalah/visual`.

Tests are colocated with source files (`*.test.ts`). Framework is Vitest with V8 coverage.

Full API documentation lives at [docs.kaabalah.com](https://docs.kaabalah.com/) (source in `docs/`).

## Non-Obvious Gotchas

### Astrology WASM Setup

The astrology module uses Swiss Ephemeris compiled to WebAssembly. Tests require environment variables:
- `WASM_PATH` — Path to swisseph.wasm (files in `wasm/build/`)
- `EPHE_PATH` — Path to ephemeris data (files in `ephe/`)

### Core: Branded NodeIds

`NodeId<T>` uses branded types. Use `id(type, value)` to create and `parseId(nodeId)` to extract values. Don't construct node ID strings manually.

### Core: Factory Pattern

Never instantiate `TreeOfLife` directly. Use `createTree({ system, parts })` or `getCanonicalTree({ system, parts })` (cached; prefer it for read-only use).

### Dates: Local Noon Convention

Numerology functions read `Date` arguments with **local** calendar getters. Construct date-only values at **local noon** — `new Date(y, m, d, 12)`, never `Date.UTC` or bare `"YYYY-MM-DD"` strings (those shift a calendar day at timezone extremes).

### Tarot Numbering

Tarot numbering is tree-scoped, not sequential. The canonical default tree is `kaabalah`. Court/minor suit blocks run `King → Queen → Knight → Page → Ten → ... → Ace`. Use `getTarotCardNumber()` / `getTarotCardByNumber()` rather than hardcoding numbers.

### Tarot Module Import Order

`src/tarot/` layers as `data → arkannus → {index, spreads}`. Never import from `./index` inside the other tarot files — it re-exports them (circular). Importing `arkannus`/`index` builds a canonical tree workspace as an import-time side effect (`ARKANNUS`).

### Semantic: Kaabalistic Overlay Module

`src/semantic/kaabalistic.ts` exports correspondences and marker functions for Tree of Life overlays:
- `getKaabalisticCorrespondenceTargets(lookup)` — returns sphere/path targets for signs, planets, angles, nodes, numbers, or Hebrew letters
- `getAstrologyTreeMarkers(chart)`, `getNumerologyTreeMarkers(date)`, `getGematriaTreeMarkers(text)` — render-ready marker descriptors
- `buildKaabalisticMapData(input)` — combines all markers for mixed map views
- Symbol metadata: `getPlanetSymbolMetadata()`, `getZodiacSignSymbolMetadata()`, `getAngleSymbolMetadata()`, `getNodeSymbolMetadata()` and their `list*` variants

These are re-exported from `kaabalah/semantic`.

## CLI

The CLI exposes all library modules as commands. All commands (except `tarot` shuffle and `astrology --location` geocoding) are **pure, deterministic calculations**.

### Agent Consumption Patterns

1. **Always use `--json --compact`** for structured, minimal output
2. **Use `--fields`** to extract only what you need and reduce token usage
3. **Use `--input-json`** for complex parameters instead of shell escaping
4. **Use `kaabalah help --json`** to discover all commands and their schemas
5. **Use `kaabalah help <command> --json`** for per-command schema
6. **Prefer `--lat`/`--lon`** over `--location` to avoid network dependency
7. **Check error codes** via the `code` field in error JSON responses

### CLI Internals

- **WASM/ephe paths**: CLI resolves paths relative to `__dirname/../wasm/build/` and `__dirname/../ephe/`. These are passed explicitly to `getSwissEph({ wasmPath, ephePath })` because the default `?url` import resolution breaks in the bundled CJS output.
- **Astrology lazy-loaded**: `import("./astrology")` is dynamic so WASM overhead only applies when the `astrology` command runs.
- **dotenv**: `.env` is loaded via `import "dotenv/config"` at the top of `src/cli.ts`. `GOOGLE_MAPS_API_KEY` is required for `--location` geocoding (uses Google Places API New text search endpoint).
- **Geocoding**: Uses `https://places.googleapis.com/v1/places:searchText` REST endpoint (not `@googlemaps/js-api-loader` which is browser-only).
- **TTY detection**: If `!process.stdout.isTTY`, JSON mode is auto-enabled. `--no-json` overrides this.

### Error Contract

All errors in `--json` mode return:

```json
{"error":true,"code":"ERROR_CODE","message":"Human-readable description"}
```

Exit code is always `1` on error.

**Error codes:** `INVALID_DATE`, `INVALID_ARGUMENT`, `MISSING_ARGUMENT`, `UNKNOWN_COMMAND`, `CARD_NOT_FOUND`, `INTERNAL_ERROR`, `GEOCODE_ERROR`, `WASM_INIT_ERROR`, `INVALID_JSON`

### Input Limits

- Text input: max 1000 characters
- `--max-results`: capped at 10000
- Date range: year 0001-9999
- Latitude: -90 to 90
- Longitude: -180 to 180