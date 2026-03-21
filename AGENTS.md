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

**Aspect Engine** (`src/astrology/aspects.ts`): Pure functions (no WASM) for computing aspects between planet longitudes.
- `getAspectMatch(lonA, lonB, specs?)` — check if two longitudes form an aspect
- `computeAspects(planets, specs?)` — all intra-chart aspects (unique pairs)
- `computeSynastryAspects(planetsA, planetsB, specs?)` — cross-chart aspects (every A vs every B)
- `computeMidpoints(planetsA, planetsB)` — shorter-arc midpoint for each common planet
- `DEFAULT_ASPECT_SPECS` — default aspect definitions with standard orbs

**Synastry & Composite** (`src/astrology/index.ts`):
- `getSynastryChart(options)` — computes two birth charts + cross-chart aspects
- `getCompositeChart(options)` — computes two birth charts + midpoint composite (planets, houses, aspects)

**Essential Dignity** (`src/astrology/dignity.ts`): Traditional Hellenistic rulership data. Pure functions.
- `getDomicileRuler(sign)` — domicile ruler for a zodiac sign
- `getExaltation(planet)` — exaltation sign and degree for a traditional planet
- `getOppositeSign(sign)` — sign 180° opposite
- `getDetriment(planet)` — signs where the planet is in detriment
- `getFall(planet)` — sign where the planet is in fall
- `getEssentialDignity(planet, sign)` — full dignity assessment (domicile, exaltation, detriment, fall, peregrine)
- `DOMICILE_RULERS`, `EXALTATIONS` — lookup tables

**Decans** (`src/astrology/decans.ts`): Decan (face) lookup with Chaldean rulers and Golden Dawn tarot correspondence.
- `getDecan(longitude)` — returns sign, decan number (1-3), Chaldean ruler, tarot card, degree range

**Dodecatemoria** (`src/astrology/dodecatemoria.ts`): 12th-part calculation.
- `getDodecatemoria(longitude)` — returns original sign/degree, dodecatemoria sign, index (0-11)

**Profections** (`src/astrology/profections.ts`): Annual & monthly profections. Requires a whole-sign BirthChart.
- `getAnnualProfection(natalChart, birthDate, targetYear?)` — age, house, sign, ruler for the year
- `getMonthlyProfections(natalChart, birthDate, targetYear?)` — annual profection + 12 monthly entries

**Firdaria** (`src/astrology/firdaria.ts`): Traditional planetary period system. Pure math.
- `getFirdaria(birthDate, isDiurnal, targetDate?, options?)` — all major/sub periods, current major + sub
- Day sequence: Sun(10), Venus(8), Mercury(13), Moon(9), Saturn(11), Jupiter(12), Mars(7), NN(3), SN(2) = 75y
- Night sequence: Moon(9), Saturn(11), Jupiter(12), Mars(7), NN(3), SN(2), Sun(10), Venus(8), Mercury(13)
- Sub-periods follow Chaldean descent from major ruler; node sub-period start is configurable

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
kaabalah gematria "Hello World" --json --compact
# Input-json alternative:
kaabalah gematria --input-json='{"text":"Hello World"}' --json --compact
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
kaabalah numerology:cycles 1990-01-15 John --json --compact
```

#### astrology

Calculate a birth chart using Swiss Ephemeris (WASM).

```bash
# With explicit coordinates (no API key needed)
kaabalah astrology 1990-01-15 14:30 --lat=40.7128 --lon=-74.006 --json --compact

# With geocoding (requires GOOGLE_MAPS_API_KEY env var in .env)
kaabalah astrology 1990-01-15 14:30 --location="New York, USA" --json --compact

# Custom house system and timezone
kaabalah astrology 1990-01-15 14:30 --lat=40.7128 --lon=-74.006 --house-system=koch --timezone=America/New_York --json --compact

# Time defaults to 12:00 if omitted
kaabalah astrology 1990-01-15 --lat=40.7128 --lon=-74.006 --json --compact
```

**House systems:** placidus (default), koch, porphyrius, regiomontanus, campanus, equal, whole-sign, meridian, morinus, krusinski, alcabitius

**Note:** The `--location` flag makes a network call to Google Places API (New). All other parameters are local-only.

**Note:** Birth charts include an `aspects` array with all intra-chart aspects (conjunction, duodecile, octile, sextile, square, trine, trioctile, quincunx, opposition) and a `sect` field (`"diurnal"` or `"nocturnal"`).

#### astrology:synastry

Calculate cross-chart aspects between two birth charts. Requires `--input-json` with `chartA` and `chartB` objects.

```bash
kaabalah astrology:synastry --input-json='{"chartA":{"date":"1990-01-15","time":"14:30","lat":40.71,"lon":-74},"chartB":{"date":"1992-06-20","time":"09:00","lat":51.5,"lon":-0.12}}' --json --compact
```

Each chart object accepts: `date` (YYYY-MM-DD, required), `time` (HH:MM, default "12:00"), `lat`/`lon` (required), `timezone` (IANA, optional), `houseSystem` (optional). An optional top-level `aspectSpecs` array can override default aspect orbs.

#### astrology:composite

Calculate a midpoint composite chart from two birth charts. Same input format as `astrology:synastry`.

```bash
kaabalah astrology:composite --input-json='{"chartA":{"date":"1990-01-15","time":"14:30","lat":40.71,"lon":-74},"chartB":{"date":"1992-06-20","time":"09:00","lat":51.5,"lon":-0.12}}' --json --compact
```

Returns `compositePlanets` (midpoint longitudes with zodiac positions), `compositeHouses` (midpoint house cusps), and `aspects` (aspects within the composite chart).

#### astrology:transits

Calculate transit aspects to a natal chart. Transit planets are placed in **natal houses** (not transit houses). Each aspect includes `applying`/`separating`, `retrograde`, and speed `category` ("slow"/"fast").

```bash
# Single transit snapshot (transit date defaults to today if omitted)
kaabalah astrology:transits 2001-10-02 19:45 --lat=-22.738 --lon=-47.334 --transit-date=2026-03-17 --json --compact

# With filters: max orb, aspect types, planet filters
kaabalah astrology:transits 2001-10-02 19:45 --lat=-22.738 --lon=-47.334 --transit-date=2026-03-17 --max-orb=3 --aspects=major --transit-planets=saturn,pluto --json

# Date range mode with binary search for exact aspect perfection dates
kaabalah astrology:transits 2001-10-02 19:45 --lat=-22.738 --lon=-47.334 --from=2026-03-01 --to=2026-04-01 --json --compact

# Custom transit location and timezone
kaabalah astrology:transits 2001-10-02 19:45 --lat=-22.738 --lon=-47.334 --transit-date=2026-03-17 --transit-lat=40.71 --transit-lon=-74 --transit-timezone=America/New_York --json
```

Positional args are natal date/time. Transit date is specified via `--transit-date` (default: today) and `--transit-time` (default: 12:00). Transit location defaults to natal location.

**Filters:** `--max-orb=N` (degrees), `--aspects=conjunction,square,opposition` or `--aspects=major`, `--transit-planets=saturn,pluto`, `--natal-planets=sun,moon,ascendant,mc`.

**Range mode:** `--from=YYYY-MM-DD --to=YYYY-MM-DD` returns exact aspect perfection dates found via binary search (minute precision). Optional `--step-days=N` (default: 1).

**`--input-json` alternative:**
```bash
kaabalah astrology:transits --input-json='{"natal":{"date":"2001-10-02","time":"19:45","lat":-22.738,"lon":-47.334},"transitDate":"2026-03-17","maxOrb":3,"aspects":["conjunction","square"],"transitPlanets":["saturn","pluto"]}' --json --compact
```

**Library API:** `getTransitChart(options)` and `getTransitRange(options)` are exported from `kaabalah/astrology`.

#### astrology:solar-return

Calculate a Solar Return chart — the exact moment the transiting Sun returns to its natal longitude in a given year. The SR chart is cast at that moment for the specified (or natal) location.

```bash
# Basic solar return for year 2025
kaabalah astrology:solar-return 2001-10-02 19:45 --lat=-22.738 --lon=-47.334 --year=2025 --json --compact

# With SR location override (relocated solar return)
kaabalah astrology:solar-return 1990-01-15 14:30 --lat=40.71 --lon=-74 --year=2026 --sr-lat=34.05 --sr-lon=-118.24 --json

# Default year is current year; time defaults to 12:00
kaabalah astrology:solar-return 1990-01-15 --lat=40.71 --lon=-74 --json --compact
```

Positional args are natal date/time. `--year` defaults to current year. SR location defaults to natal location; override with `--sr-lat`/`--sr-lon` or `--sr-location` (geocoding). `--sr-house-system` customizes the SR chart house system.

**`--input-json` alternative:**
```bash
kaabalah astrology:solar-return --input-json='{"natal":{"date":"2001-10-02","time":"19:45","lat":-22.738,"lon":-47.334},"year":2025,"srLat":40.71,"srLon":-74}' --json --compact
```

**Library API:** `getSolarReturnChart(options)` is exported from `kaabalah/astrology`. Returns `{ natalChart, solarReturnChart, exactReturnDate, natalSunLongitude, year }`.

#### astrology:profections

Calculate the annual profection for a given year. Forces whole-sign houses internally.

```bash
kaabalah astrology:profections 2001-10-02 19:45 --lat=-22.738 --lon=-47.334 --year=2026 --json --compact

# Default year is current year; time defaults to 12:00
kaabalah astrology:profections 2001-10-02 --lat=-22.738 --lon=-47.334 --json --compact
```

Returns `age`, `house` (1-12), `sign`, `ruler` (domicile ruler = time lord), `targetYear`.

**`--input-json` alternative:**
```bash
kaabalah astrology:profections --input-json='{"natal":{"date":"2001-10-02","time":"19:45","lat":-22.738,"lon":-47.334},"year":2026}' --json --compact
```

**Library API:** `getAnnualProfection(natalChart, birthDate, targetYear?)` — requires a whole-sign BirthChart.

#### astrology:profections:monthly

Calculate monthly profections (12 months from birthday to birthday) for a given year.

```bash
kaabalah astrology:profections:monthly 2001-10-02 19:45 --lat=-22.738 --lon=-47.334 --year=2026 --json --compact
```

Returns `annualProfection` (same as above) plus `months[]` — 12 entries with `month` (1-12), `startDate`, `sign`, `ruler`.

**Library API:** `getMonthlyProfections(natalChart, birthDate, targetYear?)`.

#### astrology:firdaria

Calculate firdaria planetary periods. Sect is auto-detected from the chart; override with `--sect=diurnal` or `--sect=nocturnal`.

```bash
kaabalah astrology:firdaria 2001-10-02 19:45 --lat=-22.738 --lon=-47.334 --json --compact

# With target date and sect override
kaabalah astrology:firdaria 2001-10-02 19:45 --lat=-22.738 --lon=-47.334 --target-date=2030-01-01 --sect=nocturnal --json
```

Returns `sect`, `currentMajor` (planet, years, start/end, subPeriods[]), `currentSub` (planet, start/end), `allPeriods[]`.

**`--input-json` alternative:**
```bash
kaabalah astrology:firdaria --input-json='{"natal":{"date":"2001-10-02","time":"19:45","lat":-22.738,"lon":-47.334},"targetDate":"2030-01-01"}' --json --compact
```

**Library API:** `getFirdaria(birthDate, isDiurnal, targetDate?, options?)`. Options: `{ nodeSubPeriodStart?: "jupiter-saturn" | "sun-mars" }`.

#### astrology:decans

Look up the decan (face) for a zodiacal longitude. Pure math, no WASM needed.

```bash
kaabalah astrology:decans 15 --json --compact
kaabalah astrology:decans 270.5 --json
```

Returns `sign`, `decanNumber` (1-3), `ruler` (Chaldean), `tarotCard` (Golden Dawn), `startDegree`, `endDegree`, `degreeWithinSign`.

**Library API:** `getDecan(longitude)`.

#### astrology:dodecatemoria

Look up the dodecatemoria (12th part) for a zodiacal longitude. Pure math, no WASM needed.

```bash
kaabalah astrology:dodecatemoria 5 --json --compact
kaabalah astrology:dodecatemoria 227.5 --json
```

Returns `originalSign`, `originalDegree`, `dodecatemoriaSign`, `dodecatemoriaIndex` (0-11).

**Library API:** `getDodecatemoria(longitude)`.

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

Show the full Tree of Life graph — all nodes with data and edges.

```bash
kaabalah tree --json --compact
```

#### tree:node

Look up a node and traverse its correspondences. This is the primary way to explore relationships between systems (tarot ↔ paths ↔ hebrew letters ↔ elements ↔ spheres ↔ planets ↔ zodiac).

```bash
# Direct correspondences of a path
kaabalah tree:node path:1 --json --compact

# Tarot card correspondences (depth=2 to reach hebrew letters, elements, etc.)
kaabalah tree:node "tarotArkAnnu:The Magician" --depth=2 --json --compact

# Filter by type
kaabalah tree:node sphere:Kether --type=tarotArkAnnu --json --compact
```

#### tree:types

List all node types and their IDs. Useful to discover valid node IDs for `tree:node`.

```bash
kaabalah tree:types --json --compact
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

## Session Learnings

All session learnings (gotchas, architecture decisions, constraints) are archived by domain in [`docs/session-learnings.md`](docs/session-learnings.md).
