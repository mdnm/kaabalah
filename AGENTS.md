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

`kaabalah` is the only tree system; the Hermetic and Lurianic systems were removed in 8.0.0, so do not add system branches. Never instantiate `TreeOfLife` directly. Use `createTree({ system, parts })` or `getCanonicalTree({ system, parts })` (cached; prefer it for read-only use).

### Core: sphere profiles, path profiles and tree sections

`src/core/sphere-profiles.json` (`getSphereProfile`), `src/core/path-profiles.json` (`getPathProfile`) and `src/core/tree-sections.json` (`getTreeSection`, `getSphereSections`) hold what the spheres, the 22 paths, and the worlds, pillars and triads mean, with `{ en, pt }` in every text field.

- A path's `from`, `to`, letter, card and correspondence are read from the graph, never stored.
- The content is authored by Mat. Do not fill a gap from other traditions: Daath has a short profile. `expression` (balance, excess, lack) exists for every sphere; for Kether, Chokhmah, Daath and Malkuth it is drafted from their planet (Neptune, Uranus, Pluto, Earth) and their own virtues, vices and attributes. There is no `heaven` or `elementalRelation` field: the planet comes from the graph.
- Nothing from the tree of death goes into the library: no shadow spheres, no tunnels, no names and no correspondences of them. The gestures of the ark annu stay out too.
- Comments and docs never mention where the content was taught (classes, lessons, handouts). The editorial sources are in the gitignored `provenance/` folder.

### Civil Dates (new numerology API)

`src/civil-date.ts` holds the timezone-free `CivilDate` helpers (`parseCivilDate`, `civilDayOrdinal`, `completedYears`, `anniversaryInYear`, ...). The numerology schedule facade (`src/numerology/schedule.ts`, `partial-date.ts`, `life-stages.ts`) takes `"YYYY-MM-DD"`/`CivilDate` only, with half-open intervals. Use these instead of `new Date(...)` arithmetic. They are exported from the package root, not from a module sub-path. `src/numerology/core.ts` holds the primitives shared with `index.ts` (keeps the facade free of import cycles).

### Astrology: sect, exact events, derived charts

- Sect comes from the Sun's geometric altitude (`src/astrology/sect.ts`), never from the Sun's house; `getSect(sunHouse)` is deprecated.
- Exact transit/return events use the shared signed-angle root solver (`root-solver.ts`, `returns.ts`, `transit-events.ts`): `exactDate` is a verified UTC root, `exactOrb` the residual; near misses are separate `closestApproaches`. The scan is finite-grid, not a completeness proof.
- Derived charts (composite, Davison, progressions, solar arcs, overlays) are separate methods with their conventions echoed in `method`/`notices`; do not conflate composite with Davison.
- Swiss sidereal mode and topocentric state are process-wide: change them only inside synchronous `withSwissEphState` / `withSiderealMode` scopes.
- Jyotish (`src/astrology/jyotish/`): Dhruva (equatorial, GC-anchored) is not Lahiri and not Swiss mode 36; keep tropical rasis/houses independent of the nakshatra frame; `JYOTISH_METHODS` is the validation statement (do not fit constants).
- Panchanga (`jyotish/panchanga.ts`): Lahiri only; masa, year, Rahu Kala, muhurtas, Varjyam, Amrit Kaal and Choghadiya state their conventions and sources in `method`; the day is the vara (sunrise to sunrise), and its sunrise defaults to the Hindu rising (disc centre, no refraction), not the almanac sunrise of `getPlanetaryHours`. The Sarvartha Siddhi table follows Muhurta Chintamani 1.28-29 (oldest source; modern panchang sites disagree with each other), so don't "fix" it from a website.
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

- Weights: every marker has a raw `weight` from `KAABALISTIC_MARKER_WEIGHTS` (placements 5/4/2/1, final numerology and gematria values over reduction steps; the Straight life path weighs 0). `rawWeightsById` holds the capped sums (letters capped per path, aspects capped per sphere).
- Shares: `weightsById` is share-normalized per target type (spheres and paths separately) so astrology, numerology and gematria total 50/30/20 percentage points, renormalized over the systems present. `rankedSpheres` and `rankedPaths` rank by that total as `share`.
- Decan layer: each placement, node and angle also lights a sphere by modality and decan (`decan-sphere`, half the placement weight). Aspect layer: each aspect lights one sphere (`aspect-sphere`, tightness times the pair's placement weights over 10) and is not double counted in `countsById`.
- Cycle map (`src/semantic/cycles.ts`): `buildCycleMapData(input)` and `getCycleTreeMarkers(input)` turn a day's cycles into the same marker and share shapes, from computed data only (`TransitChart.aspects` and `.transitPlanets`, time lord names, `getNumerologySnapshot().calendar`). Buckets are `transits`/`timeLords`/`numerology` (60/20/20) instead of astrology/numerology/gematria.
- Cycle weights live in `KAABALISTIC_CYCLE_WEIGHTS` only: a transit aspect counts when its type is in `transit.aspects` (the five major ones) and its orb is `maxOrb` (1 degree) or less, with tightness rescaled over 0 to `maxOrb` and no per-sphere cap. It gives up to three markers of the same weight: `transit-aspect` on the aspect's sphere, `transit-natal-sphere` on the natal planet's sphere (Malkuth for the ASC, none for MC, nodes, Lilith, Chiron) and `transit-natal-path` on the natal planet's path (the seven classical planets only); all are doubled once when either body is a time lord (`timeLordFactor`), and `countsById` counts the aspect once, on the aspect's sphere. Only `skyBodies` (the Moon) give placement markers, at `skyFactor` of a natal placement. A node lord needs `timeLords.northNodeSign` to light anything. Placement weights, the tightness scale and `pairDivisor` stay in `KAABALISTIC_MARKER_WEIGHTS`.
- `kaabalisticInternals` is the helper bundle `cycles.ts` shares with `kaabalistic.ts`; it is exported for that file only and is not public API.

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

**Error codes:** `INVALID_DATE`, `INVALID_ARGUMENT`, `MISSING_ARGUMENT`, `UNKNOWN_COMMAND`, `CARD_NOT_FOUND`, `INDEX_OUT_OF_POOL` (`tarot:spread --method=conscious`), `INTERNAL_ERROR`, `GEOCODE_ERROR`, `WASM_INIT_ERROR`, `INVALID_JSON`

### Input Limits

- Text input: max 1000 characters
- `--max-results`: capped at 10000
- Date range: year 0001-9999, real Gregorian calendar days only. `src/cli/runtime/validation.ts` validates the day with `parseCivilDate` before any `Date` is built, so `2026-02-30` and `1900-02-29` exit `INVALID_DATE`; years 0001-0099 are built with `civilDateToLocalNoon` because numeric `Date` constructors remap them to 1900-1999
- Numerology schedules: birth years up to 9998; timelines at most about 100 years and 10000 intervals
- Bulk manifests (`astrology:collection`): up to 500 people, 1000 events, 125000 pairs, `--concurrency` 1-64, manifest up to 4 MiB (`--manifest` file or `-`; other `--input-json=-` payloads 64 KiB)
- Latitude: -90 to 90
- Longitude: -180 to 180
