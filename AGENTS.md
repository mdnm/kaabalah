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

TypeScript library for esoteric calculations. Exports **9 tree-shakable modules**: `kaabalah/core`, `kaabalah/numerology`, `kaabalah/astrology`, `kaabalah/gematria`, `kaabalah/tarot`, `kaabalah/iching`, `kaabalah/ifa`, `kaabalah/semantic`, `kaabalah/visual`. The package also exports the Swiss Ephemeris runtime assets as `kaabalah/swisseph-runtime` and `kaabalah/swisseph-wasm`.

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

### Civil Dates (new numerology API)

`src/civil-date.ts` holds the timezone-free `CivilDate` helpers (`parseCivilDate`, `civilDayOrdinal`, `completedYears`, `anniversaryInYear`, ...). The numerology schedule facade (`src/numerology/schedule.ts`, `partial-date.ts`, `life-stages.ts`) takes `"YYYY-MM-DD"`/`CivilDate` only, with half-open intervals. Use these instead of `new Date(...)` arithmetic. They are exported from the package root, not from a module sub-path. `src/numerology/core.ts` holds the primitives shared with `index.ts` (keeps the facade free of import cycles).

### Astrology: sect, exact events, derived charts

- Sect comes from the Sun's geometric altitude (`src/astrology/sect.ts`), never from the Sun's house; `getSect(sunHouse)` is deprecated.
- Exact transit/return events use the shared signed-angle root solver (`root-solver.ts`, `returns.ts`, `transit-events.ts`): `exactDate` is a verified UTC root, `exactOrb` the residual; near misses are separate `closestApproaches`. The scan is finite-grid, not a completeness proof.
- Derived charts (composite, Davison, progressions, solar arcs, overlays) are separate methods with their conventions echoed in `method`/`notices`; do not conflate composite with Davison.
- Swiss sidereal mode and topocentric state are process-wide: change them only inside synchronous `withSwissEphState` / `withSiderealMode` scopes.
- Jyotish (`src/astrology/jyotish/`): Dhruva (equatorial, GC-anchored) is not Lahiri and not Swiss mode 36; keep tropical rasis/houses independent of the nakshatra frame; `JYOTISH_METHODS` is the validation statement (do not fit constants).
- Tests that need the ephemeris use `await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH })`. To run a script outside Vitest use `npx vite-node` (the source imports `?url` assets that plain `tsx` cannot resolve).

### Dates: Local Noon Convention

The legacy numerology functions (`calculateCycles`, `calculatePersonalCycles`, life paths, ...) read `Date` arguments with **local** calendar getters. (The schedule API takes civil dates and has no such rule.) Construct date-only values at **local noon** — `new Date(y, m, d, 12)`, never `Date.UTC` or bare `"YYYY-MM-DD"` strings (those shift a calendar day at timezone extremes).

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

The CLI exposes all library modules as commands. Calculations are deterministic. The exceptions are random draws (`tarot`, `tarot:spread --spread-id`, `iching:cast`), `--location` / `--sr-location` geocoding (network), and commands that default to the current date or year (`numerology`, `numerology:cycles`, `numerology:fibonacci` and the `numerology:snapshot|timeline|heptads|personal-cycles|life-stages|partial` family without `--as-of`; `astrology:transits` without `--transit-date`; `astrology:progressions` / `astrology:solar-arc` without `--target-date`; `astrology:solar-return` / `astrology:profections*` without `--year`; `astrology:firdaria` without `--target-date`). Pass those values explicitly for reproducible output. `--as-of` is a civil `YYYY-MM-DD` evaluation date that replaces the implicit clock only when given, and the evaluated day is echoed in the output.

The only command whose stdout is not one JSON document is `astrology:collection --ndjson` (one record per line, with a final `summary` record); `--format=markdown` on the tabular commands prints a Markdown table instead of JSON. Use `kaabalah capabilities --json` for limits, supported points/aspects/frames and the command list.

### Agent Consumption Patterns

1. **Always use `--json --compact`** for structured, minimal output
2. **Use `--fields`** to extract only what you need and reduce token usage
3. **Use `--input-json`** for complex parameters instead of shell escaping
4. **Use `kaabalah help --json`** to discover all commands and their schemas
5. **Use `kaabalah help <command> --json`** for per-command schema
6. **Prefer `--lat`/`--lon`** over `--location` to avoid network dependency
7. **Check error codes** via the `code` field in error JSON responses
8. **Use `--language pt-BR`** only for display text; JSON keys, IDs and error `code` values never change.
9. **Do not redirect stderr into stdout when parsing JSON**: runtime notices such as Swiss Ephemeris path setup go to stderr, while `--json` stdout is exactly one JSON document. Use `--quiet` or `--silent` to suppress stderr diagnostics entirely.

### CLI Internals

- **WASM/ephe paths**: CLI resolves paths relative to `__dirname/../wasm/build/` and `__dirname/../ephe/`. These are passed explicitly to `getSwissEph({ wasmPath, ephePath })` because the default `?url` import resolution breaks in the bundled CJS output.
- **Overrides**: `--wasm-path` / `--ephe-path` (or `KAABALAH_WASM_PATH` / `KAABALAH_EPHE_PATH`) override the bundled assets. Config precedence is flags > environment > `./kaabalah.config.json` > user config (`$XDG_CONFIG_HOME/kaabalah/config.json` or `~/.config/kaabalah/config.json`); supported keys are `json`, `compact`, `houseSystem`, `timezone`, `wasmPath`, `ephePath`, `googleMapsApiKey` (`src/cli/runtime/config.ts`).
- **Localization**: `--language pt-BR` is applied through `cliText()` (`src/cli/texts.json`); every new user-facing CLI message needs an `en`/`pt` entry there.
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

Typed library errors reuse these codes (no extra code): invalid or out-of-range dates and strict-ephemeris mismatches are `INVALID_DATE`; unknown options/aspects/points/profiles, bad ranges, manifests and orb policies are `INVALID_ARGUMENT`; missing time, location or birth value is `MISSING_ARGUMENT`; missing Swiss Ephemeris assets are `WASM_INIT_ERROR`. `src/cli/runtime/errors.ts` (`classifyLibraryError`) holds the mapping and also applies to errors a command did not catch. Messages end with a separate hint sentence (`Run "kaabalah help <command>" ...`).

**Error codes:** `INVALID_DATE`, `INVALID_ARGUMENT`, `MISSING_ARGUMENT`, `UNKNOWN_COMMAND`, `UNSUPPORTED_SYSTEM` (`tree:svg` for a system without a renderer), `CARD_NOT_FOUND`, `INDEX_OUT_OF_POOL` (`tarot:spread --method=conscious`), `INTERNAL_ERROR`, `GEOCODE_ERROR`, `WASM_INIT_ERROR`, `INVALID_JSON`

### Input Limits

- Text input: max 1000 characters
- `--max-results`: capped at 10000
- Date range: year 0001-9999, real Gregorian calendar days only. `src/cli/runtime/validation.ts` validates the day with `parseCivilDate` before any `Date` is built, so `2026-02-30` and `1900-02-29` exit `INVALID_DATE`; years 0001-0099 are built with `civilDateToLocalNoon` because numeric `Date` constructors remap them to 1900-1999
- Numerology schedules: birth years up to 9998; timelines at most about 100 years and 10000 intervals
- Bulk manifests (`astrology:collection`): up to 500 people, 1000 events, 125000 pairs, `--concurrency` 1-64, manifest up to 4 MiB (`--manifest` file or `-`; other `--input-json=-` payloads 64 KiB)
- Latitude: -90 to 90
- Longitude: -180 to 180
