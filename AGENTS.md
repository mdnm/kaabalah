# AGENTS.md — Kaabalah Project Guide

## Build & Development Commands

```bash
npm run build          # Build with tsup (outputs CJS + ESM)
npm run dev            # Build in watch mode
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

Kaabalah is a TypeScript library for esoteric calculations (numerology, astrology, kabbalah, gematria, tarot, Ifa). It exports **7 tree-shakable modules** that can be imported independently:

```
kaabalah/core       - Tree of Life graph structure with correspondences
kaabalah/numerology - Life path, cycles, challenges, personal year calculations
kaabalah/astrology  - Birth charts via Swiss Ephemeris WASM
kaabalah/gematria   - Hebrew text numerology
kaabalah/tarot      - 78-card deck with meanings and shuffling
kaabalah/ifa        - Ifa divination (Odu calculations)
```

### Core Module (`src/core/`)

The foundation of the library. `TreeOfLife` is a graph structure that maps correspondences across esoteric systems (Kabbalah spheres/paths, zodiac signs, planets, tarot cards, Hebrew letters, etc.).

Key patterns:
- **Branded NodeIds**: `NodeId<T>` uses branded types for type-safe node references. Use `id(type, value)` to create and `parseId(nodeId)` to extract values.
- **Factory pattern**: `createTree({ system, parts })` creates configured instances
- **Systems**: "kaabalah" | "hermetic-qabalah" | "lurianic-kabbalah"
- **Parts**: Optional modules like "westernAstrology", "tarot" loaded via registry

### Astrology Module (`src/astrology/`)

Uses Swiss Ephemeris compiled to WebAssembly. Requires environment variables for tests:
- `WASM_PATH` - Path to swisseph.wasm
- `EPHE_PATH` - Path to ephemeris data files

The WASM files are in `wasm/build/` and ephemeris data in `ephe/`.

### Numerology Module (`src/numerology/`)

All reduction functions support master number preservation (11, 22, 33, 44). The `reduceToSingleWithSteps()` function tracks reduction steps for transparency.

### Type System

Node types are organized by category:
- `KaabalahTypes`: Sphere, Path, World
- `WesternAstrologyTypes`: Planets, Zodiac, Elements, Houses, Aspects
- `TarotTypes`: MajorArkanum, MinorArkanum, Suits
- `NumerologyTypes`: Numbers (includes master numbers)
- `LetterTypes`: Hebrew, Latin, Sanskrit, Vattan

## Testing

Tests are colocated with source files (`*.test.ts`). Framework is Vitest with V8 coverage.

---

## CLI (`src/cli.ts`)

The CLI exposes all library modules as commands. All commands (except `tarot` shuffle randomness and `astrology --location` geocoding) are **pure, deterministic calculations** with no side effects.

### Quick Start

```bash
# Always use --json --compact for agent consumption
kaabalah numerology 1990-01-15 --json --compact

# Use --fields to minimize output
kaabalah numerology 1990-01-15 --json --compact --fields=kaabalistic.lifePath.reducedValue

# Full schema introspection
kaabalah help --json

# Per-command schema
kaabalah help astrology --json
```

### Global Flags

| Flag | Description |
|------|-------------|
| `--json` | JSON output (auto-enabled when stdout is not a TTY) |
| `--no-json` | Force human-readable output even when piped |
| `--compact` | Minified JSON (no indentation) |
| `--fields=a.b,c.d` | Filter JSON output to specified dot-paths |
| `--input-json='{"key":"val"}'` | Pass all parameters as a JSON object |
| `--version` | Print version |

### Commands

#### gematria

Calculate Hebrew letter values for Latin text.

```bash
kaabalah gematria "Mat Moura" --json --compact
# Input-json alternative:
kaabalah gematria --input-json='{"text":"Mat Moura"}' --json --compact
```

#### gematria:reverse

Find letter combinations that match a target gematria value.

```bash
kaabalah gematria:reverse 22 --max-results=10 --min-length=2 --max-length=4 --json --compact
# Input-json alternative:
kaabalah gematria:reverse --input-json='{"targetSynthesis":22,"maxResults":10}' --json --compact
```

#### numerology

Full numerological profile from a birth date.

```bash
kaabalah numerology 1990-01-15 --json --compact
kaabalah numerology 1990-01-15 --json --fields=kaabalistic.lifePath.reducedValue,challenges.mainChallenge
```

#### numerology:lifepath / numerology:challenges / numerology:fibonacci / numerology:cycles

Sub-commands for specific numerology calculations.

```bash
kaabalah numerology:lifepath 1990-01-15 --json --compact
kaabalah numerology:challenges 1990-01-15 --json --compact
kaabalah numerology:fibonacci 1990-01-15 --json --compact
kaabalah numerology:cycles 1990-01-15 Mateus --json --compact
```

#### astrology

Calculate a birth chart using Swiss Ephemeris (WASM).

```bash
# With explicit coordinates (no API key needed)
kaabalah astrology 1990-01-15 14:30 --lat=-23.5505 --lon=-46.6333 --json --compact

# With geocoding (requires GOOGLE_MAPS_API_KEY env var in .env)
kaabalah astrology 1990-01-15 14:30 --location="Sao Paulo, Brazil" --json --compact

# Custom house system and timezone
kaabalah astrology 1990-01-15 14:30 --lat=40.7128 --lon=-74.006 --house-system=koch --timezone=America/New_York --json --compact

# Time defaults to 12:00 if omitted
kaabalah astrology 1990-01-15 --lat=40.7128 --lon=-74.006 --json --compact
```

**House systems:** placidus (default), koch, porphyrius, regiomontanus, campanus, equal, whole-sign, meridian, morinus, krusinski, alcabitius

**Note:** The `--location` flag makes a network call to Google Places API (New). All other parameters are local-only.

#### tarot

Draw random tarot cards.

```bash
kaabalah tarot 5 --inverted --json --compact
kaabalah tarot:card 22 --json --compact
```

**Note:** `tarot` draw is non-deterministic (shuffled deck). `tarot:card` is deterministic lookup.

#### ifa

Calculate Odu from a date.

```bash
kaabalah ifa 1990-01-15 --json --compact
```

#### tree

Show Tree of Life structure.

```bash
kaabalah tree --json --compact
```

### Error Contract

All errors in `--json` mode return:

```json
{"error":true,"code":"ERROR_CODE","message":"Human-readable description"}
```

Exit code is always `1` on error.

**Error codes:** `INVALID_DATE`, `INVALID_ARGUMENT`, `MISSING_ARGUMENT`, `UNKNOWN_COMMAND`, `CARD_NOT_FOUND`, `INTERNAL_ERROR`, `GEOCODE_ERROR`, `WASM_INIT_ERROR`, `INVALID_JSON`

### Recommended Agent Patterns

1. **Always use `--json --compact`** to get structured, minimal output
2. **Use `--fields`** to extract only what you need and reduce token usage
3. **Use `--input-json`** for complex parameters instead of shell escaping
4. **Use `kaabalah help --json`** to discover available commands and their schemas
5. **Prefer `--lat`/`--lon`** over `--location` to avoid network dependency
6. **Check error codes** programmatically via the `code` field in error responses

### Input Limits

- Text input: max 1000 characters
- `--max-results`: capped at 10000
- Date range: year 0001-9999
- Latitude: -90 to 90
- Longitude: -180 to 180

### CLI Internals

- **WASM/ephe paths**: CLI resolves paths relative to `__dirname/../wasm/build/` and `__dirname/../ephe/`. These are passed explicitly to `getSwissEph({ wasmPath, ephePath })` because the default `?url` import resolution breaks in the bundled CJS output.
- **Astrology lazy-loaded**: `import("./astrology")` is dynamic so WASM overhead only applies when the `astrology` command runs.
- **dotenv**: `.env` is loaded via `import "dotenv/config"` at the top of `src/cli.ts`. `GOOGLE_MAPS_API_KEY` is required for `--location` geocoding (uses Google Places API New text search endpoint).
- **Geocoding**: Uses `https://places.googleapis.com/v1/places:searchText` REST endpoint (not `@googlemaps/js-api-loader` which is browser-only).
- **TTY detection**: If `!process.stdout.isTTY`, JSON mode is auto-enabled. `--no-json` overrides this.

---

## Session Learnings — 2026-03-07

### Gotchas
- **SwissEph WASM `?url` imports break in bundled CJS**: The `import wasmPathNode from "...wasm?url"` in `swisseph.ts` resolves to a path with `?url` suffix in the CJS bundle, causing ENOENT. Fix: always pass explicit `wasmPath` to `getSwissEph()` from CLI code.
- **SwissEph NODEFS mount warning is benign**: During WASM init, stderr shows `"Failed to mount ephemeris directory, falling back to host path"`. Calculations still work correctly — the fallback to the host path succeeds. This noise comes from `console.info`/`console.warn` inside `swisseph.ts`.
- **Google Maps Geocoding API vs Places API**: The user's API key had Places API enabled but not Geocoding API. The Places API (New) text search endpoint (`places.googleapis.com/v1/places:searchText`) works as a drop-in replacement for geocoding in Node.js CLI context.
- **`@googlemaps/js-api-loader` is browser-only**: It relies on `window` and DOM. For Node.js CLI geocoding, use the REST endpoint directly with `fetch`.

### Architecture
- **CLI command registry as single source of truth**: The `COMMANDS` array in `src/cli.ts` defines all command schemas (args, flags, types, defaults, descriptions). Both `help --json` schema output and human-readable help text are generated from this registry, keeping them in sync.
- **`exitWithError()` pattern**: All error paths go through a single function that handles both JSON structured errors (stdout) and human-readable errors (stderr) based on the current `--json` flag state.

### Constraints
- **Pre-existing numerology test failure**: `src/numerology/index.test.ts > Heptad cycles > should calculate the cycles correctly` fails because test expectations are hardcoded for a specific date range that has passed. Not related to CLI changes.
- **Pre-existing TS type issue in tree command**: `n.data?.name` triggers TS error because `HebrewLetterData` doesn't have a `name` property. Worked around with `Record<string, unknown>` cast + `"name" in n.data` check.
