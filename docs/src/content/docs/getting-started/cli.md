---
title: CLI Reference
description: Command-line interface for quick Kaabalah calculations
sidebar:
  order: 2
  label: CLI
---

Kaabalah includes a command-line interface for quick calculations without writing code. It exposes every library module as a command, with a stable JSON output and a machine-readable schema (`kaabalah help --json`).

## Installation

```bash
# Install globally
npm install -g kaabalah

# Or run directly with npx
npx kaabalah help
```

## Commands

| Command | Description |
|---------|-------------|
| `gematria <text>` | Calculate gematria for a word or phrase |
| `gematria:reverse <number>` | Find letter combinations matching a gematria value |
| `numerology <date>` | Full numerological profile for a birth date |
| `numerology:lifepath <date>` | Life path number (kaabalistic method) |
| `numerology:cycles <date> [firstName]` | Legacy personal cycles (output family depends on `firstName`); `--as-of` supported |
| `numerology:challenges <date>` | Challenges from birth date |
| `numerology:fibonacci <date>` | Fibonacci cycle for the age at `--as-of` (default today) |
| `numerology:snapshot [birth] [firstName]` | Dated snapshot: personal year/month/period, heptad, age cycle, Fibonacci, calendar frame, life stages, method metadata |
| `numerology:timeline [birth] [firstName]` | Bounded intervals between `--from` and `--to` for chosen `--layers` |
| `numerology:heptads [birth]` | Fixed 52-day heptads and seven-year age cycles |
| `numerology:personal-cycles [birth] [firstName]` | Birthday-based personal year, twelve months, three four-month periods |
| `numerology:life-stages [birth]` | Pinnacles, challenges and life periods under a named convention |
| `numerology:partial [birth]` | What a partial birth date can compute; optional candidate summaries |
| `astrology <date> [time]` | Calculate birth chart using Swiss Ephemeris |
| `astrology:wheel <date> [time]` | Render a birth chart as an astrology wheel SVG |
| `astrology:synastry` | Cross-chart aspects between two birth charts |
| `astrology:composite` | Midpoint composite chart from two birth charts |
| `astrology:transits <date> [time]` | Transit aspects to a natal chart |
| `astrology:solar-return <date> [time]` | Solar Return chart for a given year |
| `astrology:profections <date> [time]` | Annual profection (Hellenistic time lord) |
| `astrology:profections:monthly <date> [time]` | Monthly profections for a given year |
| `astrology:firdaria <date> [time]` | Firdaria planetary periods |
| `astrology:davison` | Davison chart (UTC time and place midpoint of two births) |
| `astrology:overlays` | House overlays in both directions for two charts |
| `astrology:progressions <date> [time]` | Secondary progressions with a declared time key and angle conventions |
| `astrology:solar-arc <date> [time]` | Solar-arc directions for an explicit target set |
| `astrology:returns <date> [time]` | Saturn/Jupiter/nodal/Uranus-opposition (and solar) return passes in a UTC window |
| `astrology:profections:timeline <date> [time]` | Annual profection years for an age or date range |
| `astrology:firdaria:timeline <date> [time]` | Firdaria periods in a bounded window, nominal and clipped ends |
| `astrology:jyotish <date> [time]` | Dhruva and Lahiri nakshatras, karakas, Vimshottari and Yogini dashas |
| `astrology:condition <date> [time]` | Planetary condition per body: dispositor chain, dignities, sect, joy, station, receptions; final dispositors and loops |
| `astrology:rulers` | Sign to ruler table, traditional or modern (no birth data) |
| `astrology:varga <date> [time]` | Divisional charts (D1 to D60) on tropical longitudes with the lagna; Karakamsha for D9 |
| `astrology:yogakarakas [date] [time]` | Yogakaraka planets for an ascendant sign (`--ascendant`) or a birth chart |
| `tree:map <date> [time]` | Weighted Tree of Life birth map: ranked spheres and paths with markers |
| `tree:paths <date> [time]` | House quests, Lightning Path and Serpent Path of a natal chart |
| `astrology:collection` | Bulk people/events/pairs from a manifest (single JSON document, or `--ndjson` stream) |
| `capabilities` | Machine-readable capabilities, limits, error codes and the CLI command list |
| `astrology:astrocartography <date> [time]` | Full Astro*Carto*Graphy map |
| `astrology:astrocartography:query <date> [time]` | Query a location for nearby planetary lines |
| `astrology:decans <longitude>` | Decan (face) lookup for a zodiacal longitude |
| `astrology:dodecatemoria <longitude>` | Dodecatemoria (12th part) lookup |
| `astrology:describe <kind> [keys...]` | Bilingual description lookup (placements, aspects, degrees, decans) |
| `tarot [count]` | Draw tarot cards (default: 3) |
| `tarot:card <query>` | Look up a specific card by number or name |
| `tarot:spread [cards...]` | Look up multiple cards by name or number, list/describe spreads, or draw a named spread with `--spread-id` |
| `iching:reading` | Derive a reading from six lines, or from a hexagram and its moving lines |
| `iching:hexagram <n>` | Look up one hexagram with its Han, nuclear, Kaabalah, and sovereign layers |
| `iching:cast` | Cast three coins per line and derive the reading |
| `ifa <date>` | Calculate Odu from a date |
| `tree` | Show Tree of Life structure with all nodes, data, and edges |
| `tree:node <id>` | Look up a node and all its correspondences |
| `tree:find [query]` | Find tree nodes by ID, name, or type |
| `tree:types` | List all node types and their counts |
| `tree:layout` | Return canonical Tree of Life layout coordinates |
| `tree:topology` | Return the structural topology, paths, and named routes (lightning, serpent) |
| `tree:svg` | Generate a Tree of Life SVG |
| `tree:ascii` | Render a lightweight ASCII Tree of Life preview |
| `help [command]` | Show help, or the JSON schema with `--json` |

### Which commands are deterministic

Every command is a pure calculation except these:

- `tarot` (random draw), `tarot:spread --spread-id ...` (random draw or random shuffle for `--method=conscious`) and `iching:cast` (random coins).
- `astrology --location`, `--sr-location` (network geocoding).
- Commands that default to "today" when you omit a date or year: `numerology`, `numerology:cycles`, `numerology:fibonacci` and the `numerology:snapshot` family (`--as-of`), `astrology:transits` (`--transit-date`), `astrology:progressions` and `astrology:solar-arc` (`--target-date`, today in UTC), `astrology:solar-return`, `astrology:profections` and `astrology:profections:monthly` (`--year`), and `astrology:firdaria` (`--target-date`). Pass the value explicitly for reproducible output.

## Examples

```bash
kaabalah gematria "Hello World"
kaabalah numerology 1990-01-15
kaabalah numerology:cycles 1990-01-15 John
kaabalah tarot 5 --inverted
kaabalah tarot:card 7
kaabalah tarot:spread "Two of Cups" "The Chariot" 7
kaabalah iching:reading --lines 879777 --json --compact
kaabalah iching:reading --hexagram 30 --moving 2,4 --language pt-BR --json --compact
kaabalah iching:hexagram 25 --json --compact
kaabalah iching:cast --json --compact
kaabalah gematria:reverse 22
kaabalah ifa 1990-01-15
kaabalah astrology 1990-01-15 14:30 --lat=40.7128 --lon=-74.006
kaabalah astrology 1990-01-15 14:30 --location="New York, USA"
kaabalah astrology:wheel 1990-01-15 14:30 --lat=40.7128 --lon=-74.006 --output=chart.svg --json

# Hellenistic techniques
kaabalah astrology:profections 1990-06-15 14:30 --lat=48.856 --lon=2.352 --year=2026 --json --compact
kaabalah astrology:firdaria 1990-06-15 14:30 --lat=48.856 --lon=2.352 --json --compact
kaabalah astrology:solar-return 1990-06-15 14:30 --lat=48.856 --lon=2.352 --year=2025 --json --compact

# Transits
kaabalah astrology:transits 1990-06-15 14:30 --lat=48.856 --lon=2.352 --transit-date=2026-03-17 --json --compact

# Locational astrology
kaabalah astrology:astrocartography:query 1990-06-15 14:30 --lat=48.856 --lon=2.352 --query-lat=51.5 --query-lon=-0.12 --json

# Tree of Life correspondences
kaabalah tree:node path:1 --json
kaabalah tree:node "tarotArkAnnu:The Magician" --depth=2 --json
kaabalah tree:node sphere:Kether --type=tarotArkAnnu --json
kaabalah tree:topology --route=lightning --json --compact
kaabalah tree:svg --output=tree.svg --background=transparent --json

# Brazilian Portuguese display text (JSON keys and error codes stay in English)
kaabalah tarot:card "The Chariot" --language pt-BR --json --compact
```

## Global Flags

| Flag | Description |
|------|-------------|
| `--json` | JSON output (auto-enabled when stdout is not a TTY) |
| `--no-json` | Force human-readable output even when piped |
| `--compact` | Minified JSON (no indentation) |
| `--fields=a.b,c.d` | Filter JSON output to specified dot-paths |
| `--input-json='{"key":"val"}'` | Pass all parameters as a JSON object (use `-` to read from stdin) |
| `--language=pt-BR` | Localize display text: help, human output, error messages, tarot/I Ching/numerology content. `en` is the default. JSON keys, identifiers, and error codes are never translated |
| `--quiet` / `--silent` | Suppress stderr diagnostics and notices (for example Swiss Ephemeris path setup). `--silent` is an alias |
| `--version`, `-V` | Print version |
| `--help`, `-h` | Print help |
| `--debug` | Emit debug logs to stderr (same as `DEBUG=kaabalah:*`) |
| `--trace` | Print stack traces for unexpected fatal errors (human-readable mode) |

With `--json`, stdout is exactly one JSON document. Runtime notices go to stderr, so do not merge stderr into stdout when parsing; use `--quiet` to silence them.

## Language

`--language pt-BR` (any `pt*` value) switches CLI help, human-readable output, error messages, and library display content to Brazilian Portuguese: tarot card names, meanings and spread labels, Tree of Life descriptions, and the 514 classical I Ching texts (which gain a Portuguese `content` field next to `chinese` and `english`). Numerology and gematria commands return numbers only; their Portuguese text tables are available from the library (`getNumerologyData`, `getGematriaData`). Everything that is an identifier stays unchanged: JSON keys, node IDs, enum values, and `code` in error responses.

```bash
kaabalah iching:hexagram 25 --language pt-BR --json --compact --fields=hexagram.text.judgment
kaabalah tarot:card 9 --language pt-BR --json --compact
```

## Configuration

Defaults for a few global settings can be stored in config files or environment variables. Precedence, highest first: command-line flags, environment variables, `./kaabalah.config.json`, then the user config (`$XDG_CONFIG_HOME/kaabalah/config.json`, `%APPDATA%\kaabalah\config.json` on Windows, otherwise `~/.config/kaabalah/config.json`).

| Config key | Environment variable | Meaning |
|------------|----------------------|---------|
| `json` | `KAABALAH_JSON` | Force JSON output (`true`/`false`) |
| `compact` | `KAABALAH_COMPACT` | Minified JSON |
| `houseSystem` | `KAABALAH_HOUSE_SYSTEM` | Default house system |
| `timezone` | `KAABALAH_TIMEZONE` | Default IANA timezone |
| `wasmPath` | `KAABALAH_WASM_PATH` | Swiss Ephemeris WASM runtime path |
| `ephePath` | `KAABALAH_EPHE_PATH` | Ephemeris data directory |
| `googleMapsApiKey` | `KAABALAH_GOOGLE_MAPS_API_KEY` (or `GOOGLE_MAPS_API_KEY`) | Key for `--location` geocoding |

Unknown config keys exit with `INVALID_ARGUMENT`; a malformed file exits with `INVALID_JSON`. A `.env` file in the working directory is also loaded.

## Dates

Dates are `YYYY-MM-DD` real Gregorian calendar days with years `0001`-`9999`. The CLI validates the calendar day before doing anything else, so impossible dates are rejected rather than rolled over: `2026-02-30`, `2026-04-31`, and `1900-02-29` exit with `INVALID_DATE` ("the date does not exist in the calendar"), while `2000-02-29` and `2024-02-29` are accepted. Years `0001`-`0099` keep their full year. This applies to every date input: positional dates, `--transit-date`, `--from`, `--to`, `--target-date`, and `date` fields inside `--input-json`. Dates are read as a calendar day at local noon, so the result does not shift with the timezone of the machine.

## Detailed Command Reference

### gematria

Calculate Hebrew letter values for Latin text.

```bash
kaabalah gematria "Hello World"
kaabalah gematria "Hello World" --json --compact
kaabalah gematria "Hello World" --resolve-paths --json --compact
# Input-json alternative:
kaabalah gematria --input-json='{"text":"Hello World"}' --json --compact
```

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--missing` | boolean | false | Show missing gematria values |
| `--percentages` | boolean | false | Show letter percentages |
| `--resolve-paths` | boolean | false | Include Tree of Life sphere/path correspondences for each Hebrew letter |

With `--resolve-paths`, each entry in `includedLetters` gains a `treeTargets` array of `{ targetId, targetType, targetName, mapping, distance }` objects — saving one `tree:node` round-trip per letter. Output grows several-fold; leave it off for compact pipelines.

### gematria:reverse

Find letter combinations that match a target gematria value.

```bash
kaabalah gematria:reverse 22
kaabalah gematria:reverse 22 --max-results=50 --min-length=2 --max-length=4 --json
# Input-json alternative:
kaabalah gematria:reverse --input-json='{"targetSynthesis":22,"maxResults":10}' --json --compact
```

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--max-results` | number | 20 | Maximum results to return (max 10000) |
| `--min-length` | number | 2 | Minimum letters per combination |
| `--max-length` | number | 6 | Maximum letters per combination |
| `--include-digraphs` | boolean | false | Include digraphs like PH, SH |

### numerology

Full numerological profile from a birth date.

```bash
kaabalah numerology 1990-01-15 --as-of=2026-03-01
kaabalah numerology 1990-01-15 --json --fields=kaabalistic.lifePath.reducedValue,challenges.mainChallenge
```

### numerology:lifepath

Life path number using the kaabalistic method.

```bash
kaabalah numerology:lifepath 1990-01-15 --json --compact
```

### numerology:cycles

Legacy personal cycles. The output family switches on whether `firstName` is present: without it you get the heptad/age-cycle family, with it the personal year, month and period family (with the soul number). The evaluation date is `--as-of` (default today) and is echoed as `asOf`. When the name has no vowels, `soulNumber` and `personalPeriods[2].value` are `{ "available": false, ... }` objects and the text output prints `unavailable`. For predictable output use `numerology:heptads` and `numerology:personal-cycles` below.

```bash
kaabalah numerology:cycles 1990-01-15 --as-of=2026-03-01
kaabalah numerology:cycles 1990-01-15 John --as-of=2026-03-01 --json --compact
```

With a name, `currentPersonalPeriod` and `currentPersonalMonth` are zero-based indexes into `personalPeriods` and `personalMonths` (the text output prints them one-based). The month value is `personalMonths[currentPersonalMonth].value.reducedValue`; it equals `personalMonth.value.value` of `numerology:snapshot` (whose `phase` is the one-based position).

### numerology:challenges

Calculate challenges from a birth date.

```bash
kaabalah numerology:challenges 1990-01-15 --json --compact
```

### numerology:fibonacci

Fibonacci cycle based on the completed age at `--as-of` (default today).

```bash
kaabalah numerology:fibonacci 1990-01-15 --as-of=2026-03-01 --json --compact
```

### astrology

Calculate a birth chart using Swiss Ephemeris (WASM).

```bash
# With explicit coordinates (no API key needed)
kaabalah astrology 1990-01-15 14:30 --lat=40.7128 --lon=-74.006

# With geocoding (requires GOOGLE_MAPS_API_KEY env var)
kaabalah astrology 1990-01-15 14:30 --location="New York, USA"

# Custom house system and timezone
kaabalah astrology 1990-01-15 14:30 --lat=40.7128 --lon=-74.006 --house-system=koch --timezone=America/New_York

# Time defaults to 12:00 if omitted
kaabalah astrology 1990-01-15 --lat=40.7128 --lon=-74.006
```

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--lat` | number | - | Latitude (-90 to 90) |
| `--lon` | number | - | Longitude (-180 to 180) |
| `--location` | string | - | Location for geocoding (requires `GOOGLE_MAPS_API_KEY` or `KAABALAH_GOOGLE_MAPS_API_KEY`) |
| `--house-system` | string | placidus | House system (see below) |
| `--timezone` | string | - | IANA timezone (e.g. `America/New_York`). Auto-resolved from coordinates if omitted |
| `--max-orb` | number | - | Maximum orb in degrees to include in the aspects array |
| `--aspect-types` | string | - | Comma-separated aspect names, or `major` |
| `--wasm-path` | string | - | Override the Swiss Ephemeris WASM runtime path |
| `--ephe-path` | string | - | Override the ephemeris data directory path |

All Swiss Ephemeris commands (everything under `astrology:` except `decans`, `dodecatemoria` and `describe`) accept `--wasm-path` and `--ephe-path`.

**House systems:** placidus, koch, porphyrius, regiomontanus, campanus, equal, whole-sign, meridian, morinus, krusinski, alcabitius

Birth charts include an `aspects` array (conjunction, duodecile, octile, sextile, square, trine, trioctile, quincunx, opposition) and a `sect` field (`"diurnal"` or `"nocturnal"`).

### astrology:wheel

Render a calculated birth chart with the canonical `kaabalah/visual` astrology wheel renderer.

```bash
# Return only the SVG string for agent consumers
kaabalah astrology:wheel 1990-01-15 14:30 --lat=40.7128 --lon=-74.006 --json --compact --fields=svg

# Write directly to a file
kaabalah astrology:wheel 1990-01-15 14:30 --lat=40.7128 --lon=-74.006 --background=transparent --output=chart.svg --json

# Input-json alternative, including visual options
kaabalah astrology:wheel --input-json='{"date":"1990-01-15","time":"14:30","lat":40.7128,"lon":-74.006,"wheelOptions":{"background":"transparent","aspects":false}}' --json --compact --fields=svg
```

The command uses the same chart calculation inputs as `astrology`, then renders the resulting `BirthChart`. In JSON mode, normal SVG output is `{ svg, bytes, input, options }`; with `--output`, the SVG is written to disk and JSON returns `{ outputPath, bytes, input, options }`.

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--lat` | number | - | Latitude (-90 to 90) |
| `--lon` | number | - | Longitude (-180 to 180) |
| `--location` | string | - | Location for geocoding (requires `GOOGLE_MAPS_API_KEY` or `KAABALAH_GOOGLE_MAPS_API_KEY`) |
| `--house-system` | string | placidus | House system |
| `--timezone` | string | - | IANA timezone; auto-resolved from coordinates if omitted |
| `--max-orb` | number | - | Maximum orb in degrees to include in rendered aspect lines |
| `--aspect-types` | string | - | Comma-separated aspect names, or `major` |
| `--width` | string | - | SVG width attribute |
| `--height` | string | - | SVG height attribute |
| `--background` | string | transparent | Background fill color, or `transparent` |
| `--palette` | string | default | `default` or `monochrome` |
| `--title` | string | - | Accessible SVG title and aria-label |
| `--padding` | number | - | Override wheel padding in viewBox units |
| `--exclude-bodies` | string | - | Comma-separated planet/point names to omit from points and aspect lines |
| `--no-zodiac` | boolean | false | Hide zodiac segments, glyphs, and ticks |
| `--no-houses` | boolean | false | Hide house cusps, labels, and angle markers |
| `--no-points` | boolean | false | Hide birth planets, nodes, and vertex |
| `--no-aspects` | boolean | false | Hide aspect lines |
| `--output` | string | - | Write SVG to a file instead of stdout |
| `--viewbox-width` | number | - | Override SVG viewBox width |
| `--viewbox-height` | number | - | Override SVG viewBox height |
| `--viewbox-min-x` | number | 0 | Override SVG viewBox min-x |
| `--viewbox-min-y` | number | 0 | Override SVG viewBox min-y |
| `--wasm-path` | string | - | Override the Swiss Ephemeris WASM runtime path |
| `--ephe-path` | string | - | Override the ephemeris data directory path |

For advanced static SVG options such as custom palettes, compact labels, ring proportions, or explicit `aspectSpecs`, pass a `wheelOptions` object through `--input-json`. CLI flags override matching top-level options.

### astrology:synastry

Calculate cross-chart aspects between two birth charts. Requires `--input-json` with `chartA` and `chartB` objects.

```bash
kaabalah astrology:synastry --input-json='{"chartA":{"date":"1990-01-15","time":"14:30","lat":40.71,"lon":-74},"chartB":{"date":"1992-06-20","time":"09:00","lat":51.5,"lon":-0.12}}' --json --compact
# Read from stdin:
kaabalah astrology:synastry --input-json=- --json --compact < synastry.json
```

Each chart object accepts: `date` (YYYY-MM-DD, required), `time` (HH:MM, default `12:00`), `lat`/`lon` (required), `timezone` (IANA, optional), `houseSystem` (optional). An optional top-level `aspectSpecs` array can override default aspect orbs.

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--house-system` | string | placidus | House system for both charts |
| `--timezone` | string | - | Default IANA timezone for both charts when omitted in `chartA`/`chartB` |
| `--max-orb` | number | - | Maximum orb in degrees |
| `--aspect-types` | string | - | Comma-separated aspect names, or `major` |

### astrology:composite

Calculate a midpoint composite chart from two birth charts. Same input format as `astrology:synastry`.

```bash
kaabalah astrology:composite --input-json='{"chartA":{"date":"1990-01-15","time":"14:30","lat":40.71,"lon":-74},"chartB":{"date":"1992-06-20","time":"09:00","lat":51.5,"lon":-0.12}}' --json --compact
# Read from stdin:
kaabalah astrology:composite --input-json=- --json --compact < composite.json
```

Returns `compositePlanets` (midpoint longitudes with zodiac positions), `compositeHouses` (midpoint house cusps), and `aspects` (aspects within the composite chart).

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--house-system` | string | placidus | House system for both charts |
| `--timezone` | string | - | Default IANA timezone for both charts when omitted in `chartA`/`chartB` |
| `--max-orb` | number | - | Maximum orb in degrees |
| `--aspect-types` | string | - | Comma-separated aspect names, or `major` |

### astrology:transits

Calculate transit aspects to a natal chart. Transit planets are placed in natal houses (not transit houses). Each aspect includes `applying`/`separating`, `retrograde`, and speed `category` (`"slow"`/`"fast"`).

```bash
# Single transit snapshot (transit date defaults to today if omitted)
kaabalah astrology:transits 1990-06-15 14:30 --lat=48.856 --lon=2.352 --transit-date=2026-03-17 --json --compact

# With filters: max orb, aspect types, planet filters
kaabalah astrology:transits 1990-06-15 14:30 --lat=48.856 --lon=2.352 --transit-date=2026-03-17 --max-orb=3 --aspects=major --transit-planets=saturn,pluto --json

# Date range mode — binary search finds exact aspect perfection dates
kaabalah astrology:transits 1990-06-15 14:30 --lat=48.856 --lon=2.352 --from=2026-03-01 --to=2026-04-01 --json --compact

# Custom transit location and timezone
kaabalah astrology:transits 1990-06-15 14:30 --lat=48.856 --lon=2.352 --transit-date=2026-03-17 --transit-lat=40.71 --transit-lon=-74 --transit-timezone=America/New_York --json

# Input-json alternative:
kaabalah astrology:transits --input-json='{"natal":{"date":"1990-06-15","time":"14:30","lat":48.856,"lon":2.352},"transitDate":"2026-03-17","maxOrb":3,"aspects":["conjunction","square"],"transitPlanets":["saturn","pluto"]}' --json --compact
```

Positional args are natal date/time. Transit date is specified via `--transit-date` (default: today) and `--transit-time` (default: 12:00). Transit location defaults to natal location.

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--lat` | number | - | Natal latitude |
| `--lon` | number | - | Natal longitude |
| `--location` | string | - | Natal location for geocoding |
| `--house-system` | string | placidus | House system |
| `--timezone` | string | - | Natal IANA timezone |
| `--transit-date` | string | today | Transit date (YYYY-MM-DD) |
| `--transit-time` | string | 12:00 | Transit time (HH:MM) |
| `--transit-lat` | number | natal lat | Transit location latitude |
| `--transit-lon` | number | natal lon | Transit location longitude |
| `--transit-timezone` | string | natal timezone | Transit IANA timezone |
| `--max-orb` | number | - | Maximum orb in degrees |
| `--aspects` | string | - | Comma-separated aspect names, or `major` |
| `--aspect-types` | string | - | Alias for `--aspects` |
| `--transit-planets` | string | - | Comma-separated transit planet names |
| `--natal-planets` | string | - | Comma-separated natal planet/point names |
| `--from` | string | - | Range start date — enables date range mode |
| `--to` | string | - | Range end date (requires `--from`) |
| `--step-days` | number | 1 | Step size in days for range scan |

**Range mode:** `--from`/`--to` returns exact aspect perfection dates found via binary search (minute precision).

### astrology:solar-return

Calculate a Solar Return chart — the exact moment the transiting Sun returns to its natal longitude in a given year. The SR chart is cast at that moment for the specified (or natal) location.

```bash
# Basic solar return for year 2025
kaabalah astrology:solar-return 1990-06-15 14:30 --lat=48.856 --lon=2.352 --year=2025 --json --compact

# Relocated solar return
kaabalah astrology:solar-return 1990-01-15 14:30 --lat=40.71 --lon=-74 --year=2026 --sr-lat=34.05 --sr-lon=-118.24 --json

# Year defaults to current year; time defaults to 12:00
kaabalah astrology:solar-return 1990-01-15 --lat=40.71 --lon=-74 --json --compact

# Input-json alternative:
kaabalah astrology:solar-return --input-json='{"natal":{"date":"1990-06-15","time":"14:30","lat":48.856,"lon":2.352},"year":2025,"srLat":40.71,"srLon":-74}' --json --compact
```

Returns `{ natalChart, solarReturnChart, exactReturnDate, natalSunLongitude, year }`.

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--lat` | number | - | Natal latitude |
| `--lon` | number | - | Natal longitude |
| `--location` | string | - | Natal location for geocoding (requires `GOOGLE_MAPS_API_KEY` or `KAABALAH_GOOGLE_MAPS_API_KEY`) |
| `--house-system` | string | placidus | House system for natal chart |
| `--timezone` | string | - | Natal IANA timezone |
| `--year` | number | current year | Solar return year |
| `--sr-lat` | number | natal lat | Solar return location latitude |
| `--sr-lon` | number | natal lon | Solar return location longitude |
| `--sr-location` | string | - | Solar return location for geocoding |
| `--sr-house-system` | string | natal house system | House system for SR chart |
| `--max-orb` | number | - | Maximum orb in degrees for aspect arrays |
| `--aspect-types` | string | - | Comma-separated aspect names, or `major` |

### astrology:profections

Calculate the annual profection for a given year. Forces whole-sign houses internally. Returns `age`, `house` (1-12), `sign`, `ruler` (domicile ruler = time lord), `targetYear`.

```bash
kaabalah astrology:profections 1990-06-15 14:30 --lat=48.856 --lon=2.352 --year=2026 --json --compact

# Year defaults to current year; time defaults to 12:00
kaabalah astrology:profections 1990-06-15 --lat=48.856 --lon=2.352 --json --compact

# Input-json alternative:
kaabalah astrology:profections --input-json='{"natal":{"date":"1990-06-15","time":"14:30","lat":48.856,"lon":2.352},"year":2026}' --json --compact
```

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--lat` | number | - | Natal latitude |
| `--lon` | number | - | Natal longitude |
| `--location` | string | - | Natal location for geocoding (requires `GOOGLE_MAPS_API_KEY` or `KAABALAH_GOOGLE_MAPS_API_KEY`) |
| `--timezone` | string | - | IANA timezone |
| `--year` | number | current year | Target year |

### astrology:profections:monthly

Calculate monthly profections (12 months from birthday to birthday) for a given year.

```bash
kaabalah astrology:profections:monthly 1990-06-15 14:30 --lat=48.856 --lon=2.352 --year=2026 --json --compact
```

Returns `annualProfection` (same as `astrology:profections`) plus `months[]` — 12 entries with `month` (1-12), `startDate`, `sign`, `ruler`.

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--lat` | number | - | Natal latitude |
| `--lon` | number | - | Natal longitude |
| `--location` | string | - | Natal location for geocoding (requires `GOOGLE_MAPS_API_KEY` or `KAABALAH_GOOGLE_MAPS_API_KEY`) |
| `--timezone` | string | - | IANA timezone |
| `--year` | number | current year | Target year |

### astrology:firdaria

Calculate firdaria planetary periods. Sect is auto-detected from the chart.

```bash
kaabalah astrology:firdaria 1990-06-15 14:30 --lat=48.856 --lon=2.352 --json --compact

# With target date and sect override
kaabalah astrology:firdaria 1990-06-15 14:30 --lat=48.856 --lon=2.352 --target-date=2030-01-01 --sect=nocturnal --json

# Input-json alternative:
kaabalah astrology:firdaria --input-json='{"natal":{"date":"1990-06-15","time":"14:30","lat":48.856,"lon":2.352},"targetDate":"2030-01-01"}' --json --compact
```

Returns `sect`, `currentMajor` (planet, years, start/end, subPeriods[]), `currentSub` (planet, start/end; `null` during node majors), `allPeriods[]`.

Day sequence: Sun (10y), Venus (8y), Mercury (13y), Moon (9y), Saturn (11y), Jupiter (12y), Mars (7y), North Node (3y), South Node (2y) = 75 years total.

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--lat` | number | - | Natal latitude |
| `--lon` | number | - | Natal longitude |
| `--location` | string | - | Natal location for geocoding (requires `GOOGLE_MAPS_API_KEY` or `KAABALAH_GOOGLE_MAPS_API_KEY`) |
| `--timezone` | string | - | IANA timezone |
| `--sect` | string | auto | Override sect: `diurnal` or `nocturnal` |
| `--target-date` | string | today | Target date (YYYY-MM-DD) |

### astrology:decans

Look up the decan (face) for a zodiacal longitude. Pure math, no WASM needed.

```bash
kaabalah astrology:decans 15 --json --compact
kaabalah astrology:decans 270.5 --json
```

Returns `sign`, `decanNumber` (1-3), `ruler` (Chaldean), `tarotCard` (Golden Dawn), `startDegree`, `endDegree`, `degreeWithinSign`.

### astrology:dodecatemoria

Look up the dodecatemoria (12th part) for a zodiacal longitude. Pure math, no WASM needed.

```bash
kaabalah astrology:dodecatemoria 5 --json --compact
kaabalah astrology:dodecatemoria 227.5 --json
```

Returns `originalSign`, `originalDegree`, `dodecatemoriaSign`, `dodecatemoriaIndex` (0-11).

### astrology:describe

Look up one bilingual description by kind and keys. Pure lookup, no WASM needed.

```bash
kaabalah astrology:describe planet-sign mars Leo --json --compact --fields=text
kaabalah astrology:describe aspect-pair trine sun moon --language pt-BR --json
kaabalah astrology:describe sun-ascendant Taurus Aries --json --compact
kaabalah astrology:describe degree-at 18.5 --json --compact --fields=text
kaabalah astrology:describe decan --json --compact
```

| Kind | Keys |
| --- | --- |
| `planet`, `retrograde`, `vertex-contact` | planet |
| `sign` | sign |
| `house` | house number |
| `element`, `modality`, `polarity`, `sect`, `dignity` | the value (`fire`, `fixed`, `positive`, `diurnal`, `exaltation`) |
| `angle` | `ascendant`, `mc`, `dc`, `ic` |
| `aspect` | aspect name |
| `point` | `fortune`, `chiron`, `lilith`, `vertex`, `antivertex` |
| `node` | `north` or `south` |
| `planet-sign`, `retrograde-sign` | planet, sign |
| `planet-house`, `retrograde-house` | planet, house |
| `angle-sign` | angle, sign |
| `cusp-sign` | house, sign |
| `point-sign` / `point-house` | point, sign / point, house |
| `node-sign` / `node-house` | role, sign / role, house |
| `sun-ascendant` | Sun sign, Ascendant sign |
| `aspect-pair` | aspect, planet, planet (either order) |
| `decan` | sign, decan number 1-3; no keys for the method concept |
| `degree` | sign, ordinal degree 1-30 |
| `degree-at` | ecliptic longitude 0-360 |

Signs are case-insensitive English names. Returns `kind`, `keys`, `found`, `language`, `text`, `keywords`, `pt`, `en`, `src` and `reviewNotes`. `text` and `keywords` follow `--language`. A combination with no authored text is not an error: it returns `found: false` and `text: null` with exit code 0. The `retrograde*` kinds return the retrograde text without checking a chart. `--input-json` takes `{"kind": "...", "keys": [...]}`.

### astrology:condition

The planetary condition of a natal chart (`getPlanetaryCondition`): for each body its sign, house, dispositor and dispositor chain, degree- and sect-aware dignities, sect, joy, station and mutual receptions, plus `finalDispositors`, `loops` and `mutualReceptions`.

```bash
kaabalah astrology:condition 1990-05-17 14:30 --lat=-23.5505 --lon=-46.6333 --json --compact --fields=finalDispositors,mutualReceptions
kaabalah astrology:condition 1990-05-17 14:30 --lat=-23.5505 --lon=-46.6333 --rulers=modern --json --compact --fields=bodies.Sun
```

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--rulers` | string | traditional | `traditional` or `modern` (Pluto, Uranus and Neptune rule Scorpio, Aquarius and Pisces) |

The natal flags are the same as `astrology` (`--lat`, `--lon`, `--location`, `--house-system`, `--timezone`).

### astrology:rulers

The sign to ruler table. No birth data and no WASM needed.

```bash
kaabalah astrology:rulers --json --compact
kaabalah astrology:rulers --rulers=modern --json --compact --fields=table
```

### astrology:varga

Jyotish divisional charts (`getVargaChart`) on tropical longitudes, with the lagna and the whole-sign house of each point counted from the varga lagna. `--division` takes any supported division (1, 2, 3, 4, 7, 9, 10, 12, 16, 20, 24, 27, 30, 40, 45, 60) or `all`. When D9 is included the output also carries `karakamsha` (`getKarakamsha`, with the Atmakaraka ranked exactly as in `astrology:jyotish`) and `karakamsha.houses`, the house of each point counted from the Karakamsha.

```bash
kaabalah astrology:varga 1990-05-17 14:30 --lat=-23.5505 --lon=-46.6333 --division=9 --json --compact --fields=vargas,karakamsha
kaabalah astrology:varga 1990-05-17 14:30 --lat=-23.5505 --lon=-46.6333 --division=all --json --compact --fields=vargas
```

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--division` | string | 9 | A supported division, or `all` |
| `--node` | string | mean | Rahu/Ketu node convention: `mean` or `true` |
| `--karaka-scheme` | string | 7 | Chara karaka scheme for the Karakamsha: `7` or `8` |

### astrology:yogakarakas

Planets that rule both a kendra and a trikona from an ascendant (`getYogakarakas`). Pass `--ascendant=<sign>` (no birth data needed) or a birth date, time and place, in which case the tropical ascendant sign is used.

```bash
kaabalah astrology:yogakarakas --ascendant=Taurus --json --compact
kaabalah astrology:yogakarakas 1990-05-17 14:30 --lat=-23.5505 --lon=-46.6333 --json --compact --fields=ascendant,yogakarakas
```

### astrology:astrocartography

Generate the full Astro*Carto*Graphy map — MC/IC lines (constant longitudes) and AC/DC curves (latitude-swept points) for all planets.

```bash
kaabalah astrology:astrocartography 1990-06-15 14:30 --lat=48.856 --lon=2.352 --json --compact

# Custom resolution
kaabalah astrology:astrocartography 1990-01-15 14:30 --lat=40.71 --lon=-74 --latitude-step=5 --json
```

Returns `meridianLines[]` (planet, angle, longitude) and `horizonLines[]` (planet, angle, points[]).

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--lat` | number | - | Natal latitude |
| `--lon` | number | - | Natal longitude |
| `--location` | string | - | Natal location for geocoding (requires `GOOGLE_MAPS_API_KEY` or `KAABALAH_GOOGLE_MAPS_API_KEY`) |
| `--timezone` | string | - | IANA timezone |
| `--latitude-step` | number | 1 | Degrees between latitude samples for AC/DC curves |
| `--latitude-range` | number | 66.5 | Maximum latitude to sweep |
| `--house-system` | string | placidus | House system |

### astrology:astrocartography:query

Query a specific location for nearby astrocartography planetary lines and paran crossings. This is the primary locational astrology command.

```bash
kaabalah astrology:astrocartography:query 1990-06-15 14:30 --lat=48.856 --lon=2.352 --query-lat=51.5 --query-lon=-0.12 --orb=3 --json --compact

# Input-json alternative:
kaabalah astrology:astrocartography:query --input-json='{"natal":{"date":"1990-06-15","time":"14:30","lat":48.856,"lon":2.352},"queryLat":51.5,"queryLon":-0.12,"orb":3}' --json --compact
```

Returns `lines[]` (all planet/angle lines sorted by distance from query location), `activeLines[]` (within orb), and `parans[]` (paran crossings at query latitude). Each line includes `planet`, `angle` (MC/IC/AC/DC), `distance` (degrees), `active` (boolean), `longitude` (geographic).

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--lat` | number | - | Natal latitude |
| `--lon` | number | - | Natal longitude |
| `--location` | string | - | Natal location for geocoding (requires `GOOGLE_MAPS_API_KEY` or `KAABALAH_GOOGLE_MAPS_API_KEY`) |
| `--query-lat` | number | - | Query latitude (required) |
| `--query-lon` | number | - | Query longitude (required) |
| `--orb` | number | 2 | Maximum distance in degrees for active lines |
| `--paran-orb` | number | 1 | Paran crossing orb in degrees |
| `--house-system` | string | placidus | House system |

### tarot

Draw random tarot cards (non-deterministic).

```bash
kaabalah tarot 5 --inverted
kaabalah tarot --json
kaabalah tarot 3 --deck=rider-waite --json --compact
```

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--inverted` | boolean | false | Include inverted cards |
| `--shuffle-count` | number | 7 | Number of times to shuffle the deck |
| `--deck` | string | - | Add `deckId`, `imageUrl` and description for a deck: `papus_pt`, `papus`, `mythic`, `egyptian`, `rider-waite` |
| `--include-fields` | string | - | With `--deck`, comma-separated legacy card fields to include (`papus`, `egyptian`) |

The count is 1-78 (default 3); anything else exits with `INVALID_ARGUMENT`. In `--json` mode the ritual shuffle delay is skipped, so the command returns immediately; human-facing output keeps the paced shuffle.

### tarot:card

Look up a specific card by number or name (deterministic).

```bash
kaabalah tarot:card 7
kaabalah tarot:card 22 --json
kaabalah tarot:card "The Chariot" --json
kaabalah tarot:card chariot --json
kaabalah tarot:card "The Chariot" --deck=rider-waite --json --compact
kaabalah tarot:card "The Chariot" --deck=papus --include-fields=papus --json --compact
kaabalah tarot:card --decks --json
```

Accepts a card number (1-78) or any part of a card name. Partial name matches return all matching cards. No match exits with `CARD_NOT_FOUND`.

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--deck` | string | — | Enrich output with deck-specific `deckId`, `imageUrl`, and description. Valid: `papus_pt`, `papus`, `mythic`, `egyptian`, `rider-waite` |
| `--decks` | boolean | false | List available decks (no card query needed) |
| `--include-fields` | string | - | With `--deck`, comma-separated legacy card fields to include (`papus`, `egyptian`) |

Cards missing from the chosen deck return `"imageUrl": null` rather than an error. An unknown deck id exits 1 with `INVALID_ARGUMENT`.

### tarot:spread

Look up multiple tarot cards by name or number in a single call, or list, describe, and draw the built-in spread layouts.

```bash
kaabalah tarot:spread "Two of Cups" "The Chariot" 7
kaabalah tarot:spread --list
kaabalah tarot:spread --list --verbose --json --compact
kaabalah tarot:spread --describe --spread-id=celtic-cross --json --compact
kaabalah tarot:spread --spread-id=celtic-cross --json
kaabalah tarot:spread --spread-id=event-reading --inquirer-gender=woman --json
kaabalah tarot:spread --spread-id=conscious-reading --method=conscious --indices=1,2,3 --json --compact
kaabalah tarot:spread --input-json=- --json --compact < cards.json
```

Cards that are not found are returned inline as error objects (the command does not exit with code 1 for individual card misses). Useful for resolving a whole spread at once.

Use `--spread-id` to draw a structured spread with slot metadata and resolved cards. Supported IDs are the same `TarotSpreadId` values exposed by the TypeScript API: `quick-insight`, `conscious-reading`, `time-reading`, `dialectic-reading`, `tree-of-life-reading`, `celtic-cross`, and `event-reading`.

Run `kaabalah tarot:spread --list` to discover the supported spread IDs from the CLI, and `--describe --spread-id=<id>` to see one spread's slots and card rules without drawing.

`--method` chooses how the cards are drawn. `random` (default) draws each slot from its eligible pool. `conscious` shuffles the deck and lets you pick from the eligible pool of each slot with `--indices` (1-based, comma-separated, exactly one per slot). An index beyond the pool exits with `INDEX_OUT_OF_POOL`; a wrong number of indices exits with `INVALID_ARGUMENT`.

`event-reading` requires an inquirer gender because its center card is deterministic. Pass `--inquirer-gender=man` or `--inquirer-gender=woman`, or provide it in JSON as `{"spreadId":"event-reading","context":{"inquirerGender":"woman"}}`.

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--spread-id` | string | - | Draw (or `--describe`) a built-in spread by ID |
| `--list` | boolean | false | List built-in spread IDs and requirements |
| `--verbose` | boolean | false | With `--list`, include the full slot definitions |
| `--describe` | boolean | false | Describe a spread schema without drawing cards |
| `--method` | string | random | `random` or `conscious` |
| `--indices` | string | - | Comma-separated 1-based pool indices for `--method=conscious` |
| `--shuffle-count` | number | 7 | Shuffles for conscious spreads |
| `--deck` | string | - | Add deck `imageUrl` and description to each card |
| `--include-fields` | string | - | With `--deck`, legacy card fields to include (`papus`, `egyptian`) |
| `--inverted` | boolean | false | Include inverted cards when drawing a named spread |
| `--inquirer-gender` | string | - | Required by `event-reading`; `man` or `woman` |

### I Ching commands

Three commands cover the `kaabalah/iching` module. None of them starts the ephemeris, and JSON stdout is always one document.

| Command | Deterministic | What it does |
|---------|---------------|--------------|
| `iching:reading` | yes | Derive a full reading from stored lines, or from a hexagram number and moving lines |
| `iching:hexagram <n>` | yes | Look up one King Wen hexagram and its fixed layers |
| `iching:cast` | no | Cast six lines with three fair coins each, then derive the same reading |

All three accept `--language pt-BR`. In JSON mode the classical text objects (`judgment`, `image`, each line) then carry a Portuguese `content` field next to `chinese` and `english`; in human mode the whole report is printed in Portuguese. Use `--no-json` for the human-readable report when piping; on a terminal it is the default.

### iching:reading

Derive a reading from six stored lines, bottom to top, or from a hexagram number and its moving lines.

```bash
kaabalah iching:reading --lines 879777 --json --compact
kaabalah iching:reading --hexagram 30 --moving 2,4 --json --compact
kaabalah iching:reading --input-json='{"hexagramNumber":25,"movingLines":[4]}' --json --compact
kaabalah iching:reading --input-json='{"lines":[8,7,9,7,7,7]}' --json --compact
kaabalah iching:reading --lines 767987 --json --compact --fields=lineCode,lineTransforms,oracle
kaabalah iching:reading --lines 879777 --language pt-BR --no-json
```

`lines` is a six-digit string or (through `--input-json`) a six-number array. Values are 6 (old yin), 7 (young yang), 8 (young yin), or 9 (old yang); 6 and 9 move. Line 1 is the bottom line. `--hexagram` takes the King Wen number and `--moving` the moving positions (1 bottom, 6 top, unique, comma-separated); `--moving` may be omitted for a reading with no moving lines. Do not pass `lines` together with `--hexagram` or `--moving`. Invalid input exits with `INVALID_ARGUMENT`; omitting both exits with `MISSING_ARGUMENT`.

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--lines` | string | - | Six line values, bottom to top, such as `879777` |
| `--hexagram` | number | - | King Wen number, used with `--moving`, instead of `--lines` |
| `--moving` | string | - | Moving line positions, such as `2,4` |

The JSON output is the library's `getIChingReading` result:

| Field | Meaning |
|-------|---------|
| `lines`, `lineCode`, `movingLines` | The six values, the same as a string, and the sorted moving positions |
| `cast` | The cast hexagram with its layers: `hexagram` (names, binary, classical text), `han` (納甲, 六親, 世/應), `nuclear`, `kaabalah` (gate, family spheres, ruling Ark Annu, pillars), `sovereign` |
| `transformed` | The same five layers for the transformed hexagram, or `null` when no line moves |
| `lineTransforms` | Before and after for each moving line, in the destination palace and the cast palace |
| `oracle` | The texts the Zhu Xi rule selects (judgment, line texts, or 用九 / 用六) |

### iching:hexagram

Look up one hexagram by King Wen number (1-64), including its Han layer, nuclear figure, Kaabalah layer, and sovereign month.

```bash
kaabalah iching:hexagram 25
kaabalah iching:hexagram 25 --json --compact --fields=hexagram.number,hexagram.hanzi
kaabalah iching:hexagram --input-json='{"hexagramNumber":25}' --json --compact --fields=hexagram.english
kaabalah iching:hexagram 25 --language pt-BR --json --compact --fields=hexagram.text.judgment
```

JSON output is `{ hexagram, han, nuclear, kaabalah, sovereign }`. A number outside 1-64 or a non-integer exits with `INVALID_ARGUMENT`; no number exits with `MISSING_ARGUMENT`.

### iching:cast

Cast three coins per line, six lines, and print the reading. This is the one I Ching command that is not deterministic. It takes no arguments or flags other than the global ones. The result has the same shape as `iching:reading`.

```bash
kaabalah iching:cast --json --compact
kaabalah iching:cast --json --compact --fields=lineCode,movingLines
kaabalah iching:cast --language pt-BR --no-json
```

Store the resulting `lines` (or `lineCode`) if you want to reproduce the reading later with `iching:reading`; nothing in the cast is seeded.

### ifa

Calculate Odu from a date. Returns `leftNumbers`, `rightNumbers` (the digit columns) and the `north`, `south`, `east`, `west` and `center` Odu numbers (1-16).

```bash
kaabalah ifa 1990-01-15
kaabalah ifa 1990-01-15 --json --compact
```

### tree

Show the full Tree of Life graph structure — all nodes with their data and edges.

```bash
kaabalah tree
kaabalah tree --json --compact
kaabalah tree --json --fields=nodes
```

In JSON mode, the output includes `nodes` (with data and related types) and `edges` (all connections between nodes).

### tree:node

Look up a specific node and all its correspondences. This is the key command for traversing the Tree of Life graph.

```bash
# Get a path and all its direct correspondences
kaabalah tree:node path:1 --json

# Get a tarot card's correspondences
kaabalah tree:node "tarotArkAnnu:The Magician" --json

# Walk 2 levels deep (tarot card -> path -> hebrew letter, spheres, element, zodiac)
kaabalah tree:node "tarotArkAnnu:The Magician" --depth=2 --json

# Filter by type — get only tarot cards related to a sphere
kaabalah tree:node sphere:Kether --type=tarotArkAnnu --json

# Get the hebrew letter for a path
kaabalah tree:node path:1 --type=hebrewLetter --json
```

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--type` | string | - | Filter related nodes by type (e.g. `hebrewLetter`, `planet`, `tarotArkAnnu`) |
| `--depth` | number | 1 | Traversal depth for walking the graph |

### tree:find

Find tree nodes by ID, name, or type. Useful for discovering valid node IDs.

```bash
kaabalah tree:find magician --json
kaabalah tree:find --type=planet --json
kaabalah tree:find kether --type=sphere --json --compact
```

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--type` | string | - | Filter matches by node type (e.g. `sphere`, `tarotArkAnnu`, `planet`) |
| `--limit` | number | 20 | Maximum matches to return |

### tree:types

List all node types available in the tree and their counts. Useful for discovering valid type names for `tree:node --type` filtering.

```bash
kaabalah tree:types
kaabalah tree:types --json
```

### tree:layout

Return the canonical Tree of Life layout coordinates. Useful for overlays and custom rendering.

```bash
kaabalah tree:layout --json --compact
kaabalah tree:layout --system=hermetic-qabalah --units=percentages --json
kaabalah tree:layout --render-model --activations=activations.json --json --compact
```

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--system` | string | kaabalah | Tree system: `kaabalah`, `hermetic-qabalah`, `lurianic-kabbalah` |
| `--units` | string | both | Coordinate space: `percentages`, `viewBoxUnits`, or `both` |
| `--render-model` | boolean | false | Return activation-aware render model geometry instead of the basic layout |
| `--activations` | string | - | Path to activation JSON array or object with an `activations` array |
| `--palette` | string | color | Render-model palette metadata: `color` or `monochrome` |
| `--daath-layer` | string | front | Render-model Daath layer: `front` or `back` |
| `--viewbox-width` | number | - | Override render-model viewBox width |
| `--viewbox-height` | number | - | Override render-model viewBox height |
| `--viewbox-min-x` | number | 0 | Override render-model viewBox min-x |
| `--viewbox-min-y` | number | 0 | Override render-model viewBox min-y |

### tree:topology

Return the structural Tree of Life topology: spheres, path endpoints, and named routes.

```bash
kaabalah tree:topology --json --compact
kaabalah tree:topology --route=lightning --json --compact
kaabalah tree:topology --system=lurianic-kabbalah --route=lightning --json --compact
```

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--system` | string | kaabalah | Tree system: `kaabalah`, `hermetic-qabalah`, `lurianic-kabbalah` |
| `--route` | string | all | Route filter: `all`, `lightning`, or `serpent` |

Routes expose both the canonical sphere order and the path targets available in the selected system. The `lightning` route descends:

```text
Kether -> Chokhmah -> Binah -> Chesed -> Geburah -> Tiphareth -> Netzach -> Hod -> Yesod -> Malkuth
```

`serpent` is the reverse route. If a system does not have a direct structural path between two consecutive route spheres, that hop appears in `missingSegments` and `isFullyConnected` is `false`.

### tree:svg

Generate a structural Tree of Life SVG from the canonical library renderer.

```bash
kaabalah tree:svg --json --compact --fields=svg
kaabalah tree:svg --background=transparent --palette=monochrome --output=tree.svg --json
kaabalah tree:svg --background=transparent --daath-layer=back --json --compact
kaabalah tree:svg --background=transparent --activations=activations.json --json --compact --fields=svg
```

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--system` | string | kaabalah | Tree system. Only `kaabalah` has an SVG renderer; `hermetic-qabalah` and `lurianic-kabbalah` exit with `UNSUPPORTED_SYSTEM` |
| `--width` | string | - | SVG width attribute (e.g. `1110mm`, `800`, `100%`) |
| `--height` | string | - | SVG height attribute |
| `--background` | string | white | Background fill color, or `transparent` |
| `--palette` | string | color | Palette: `color` or `monochrome` |
| `--daath-layer` | string | front | Render Daath in front of or behind the paths: `front` or `back` |
| `--activations` | string | - | Path to activation JSON array or object with an `activations` array |
| `--output` | string | - | Write SVG to a file instead of stdout |
| `--viewbox-width` | number | - | Override SVG viewBox width |
| `--viewbox-height` | number | - | Override SVG viewBox height |
| `--viewbox-min-x` | number | 0 | Override SVG viewBox min-x |
| `--viewbox-min-y` | number | 0 | Override SVG viewBox min-y |

`--activations` accepts either a JSON array or an object with an `activations` array:

```json
{
  "activations": [
    { "targetId": "sphere:Kether", "targetType": "sphere", "count": 3, "total": 12, "state": "selected" },
    { "targetId": "path:1", "targetType": "path", "count": 2, "total": 12, "strength": 0.6 }
  ]
}
```

### tree:ascii

Render a lightweight ASCII Tree of Life preview from the canonical layout.

```bash
kaabalah tree:ascii --no-json
kaabalah tree:ascii --columns=41 --rows=21 --json --compact
```

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--system` | string | kaabalah | Tree system: `kaabalah`, `hermetic-qabalah`, `lurianic-kabbalah` |
| `--columns` | number | 61 | ASCII canvas width in characters (minimum 21) |
| `--rows` | number | 31 | ASCII canvas height in lines (minimum 11) |

### tree:map

The weighted Tree of Life birth map from `buildKaabalisticMapData`. Numerology (from the birth date) always runs, gematria runs with `--name`, and astrology joins only when a birth time and place are given.

```bash
kaabalah tree:map 1990-05-17 14:30 --lat=-23.5505 --lon=-46.6333 --name="Maria Silva" --json --compact --fields=rankedSpheres
kaabalah tree:map 1990-05-17 --name="Maria Silva" --json --compact --fields=systems,note,unlitSpheres
```

Returns `systems` (which of astrology, numerology and gematria ran), `note` (set when astrology was left out because there is no birth time), `rankedSpheres` and `rankedPaths` (each row with `id`, `name`, `share`, `count` and its `markers`: `sourceName`, `mapping`, `weight`), `unlitSpheres` (spheres nothing lands on), `weightsById` and `rawWeightsById`. Flags: `--name`, `--lat`, `--lon`, `--location`, `--house-system`, `--timezone`.

### tree:paths

House quests, the Lightning Path (Kether to Malkuth), the Serpent Path (Malkuth to Kether) and `HOUSE_SPHERES` for a natal chart, in the language given by `--language`.

```bash
kaabalah tree:paths 1990-05-17 14:30 --lat=-23.5505 --lon=-46.6333 --json --compact --fields=lightningPath
kaabalah tree:paths 1990-05-17 14:30 --lat=-23.5505 --lon=-46.6333 --language pt-BR --json --compact --fields=houseQuests
```

Returns `houseQuests`, `lightningPath`, `serpentPath`, `houseSpheres` and `language`. Steps whose carrier is missing from the chart are omitted.

## Dated numerology

`--as-of YYYY-MM-DD` (or `"asOf"` in `--input-json`) sets the evaluation date of every time-sensitive numerology command. It replaces the implicit "now" only when given; without it the host-local calendar date is used and the output says so (`evaluation.source` / `asOf`). Dates are civil calendar days: no timezone is read and you never need the local-noon workaround.

```bash
kaabalah numerology:snapshot 1990-01-15 Ana --as-of=2026-03-01 --json --compact --fields=asOf,status,completedAge,birthdayYear.personalYear.value
# {"asOf":"2026-03-01","status":"ok","completedAge":36,"birthdayYear":{"personalYear":{"value":8}}}

# Partial birth dates are explicit; nothing is invented
kaabalah numerology:snapshot 01-15 --birth-kind=month-day --as-of=2026-03-01 --json --compact --fields=status
kaabalah numerology:partial 1990-01 --birth-kind=year-month --candidates --as-of=2026-03-01 --json --compact --fields=capability.kind,candidates.candidateCount
# {"capability":{"kind":"year-month"},"candidates":{"candidateCount":31}}

# Bounded intervals: --to is exclusive; intervals keep their real bounds
kaabalah numerology:timeline 1990-01-15 Ana --from=2026-01-01 --to=2027-01-01 --layers=personal-year,personal-month --json --compact
kaabalah numerology:timeline 1990-01-15 --from=2026-01-01 --to=2026-07-01 --layers=heptad --format=markdown
kaabalah numerology:heptads 1990-01-15 --as-of=2026-03-01 --json --compact --fields=current.heptad.phase
kaabalah numerology:personal-cycles 1990-01-15 Ana --as-of=2026-03-01 --json --compact
kaabalah numerology:life-stages 1990-01-15 --as-of=2026-03-01 --json --compact
```

| Flag | Applies to | Meaning |
|------|-----------|---------|
| `--as-of` | all of the above, plus `numerology`, `numerology:cycles`, `numerology:fibonacci` | Evaluation date |
| `--birth-kind` | snapshot family | `full` (default), `month-day` (`MM-DD`), `year-month` (`YYYY-MM`), `year` / `year-approx` (`YYYY`), `unknown`. With `--input-json` pass `"birth"` as a string or a `{ "kind": ... }` object |
| `--name-kind` | snapshot family | How `firstName` is read: `first-token`, `given-name`, `full-name` |
| `--life-path-method` | snapshot family, `life-stages` | `kaabalistic` or `straight-across` |
| `--masters` | snapshot family, `life-stages` | `preserve` (default) or `reduce` |
| `--short-month-policy` | snapshot family | `next-month-first`, `clamp`, `overflow` |
| `--death`, `--horizon` | snapshot family | Coverage limits; a missing death date is not evidence of survival |
| `--from`, `--to`, `--layers`, `--max-intervals` | `timeline` | Window (end exclusive) and layers (`personal-year`, `personal-month`, `personal-period`, `heptad`, `age-cycle`, `fibonacci`, `calendar-year`, `calendar-month`, `calendar-day`, `pinnacle`, `challenge`, `life-period`) |
| `--format` | `timeline`, `heptads`, `personal-cycles`, `astrology` | `json` (default), `table` (JSON rows) or `markdown` (a Markdown table on stdout, not JSON) |

Every result carries method metadata (`meta`): method version, life-path method, master policy, name rule, short-month policy and limits. Library errors map to the existing codes: malformed or impossible dates are `INVALID_DATE`; unknown options, inverted or oversized ranges and interval budgets are `INVALID_ARGUMENT`; a missing birth value is `MISSING_ARGUMENT`.

## Quality-aware charts and chart options

Existing keys of `kaabalah astrology` are unchanged. The chart already includes `sect`, `sectDetails`, `lots` and `moonPhase`, and `--fields` works on them. New options only add keys:

```bash
# Generation-time orb profile (adds policyAspects). Unlike --max-orb it can recover contacts the default orbs omit.
kaabalah astrology 1991-04-12 14:30 --lat=48.856 --lon=2.352 --orb-profile=ptolemaic-plus-quincunx --points=sun,moon,asc,mc --json --compact --fields=policyAspects.counts
# Several house systems from one ephemeris pass
kaabalah astrology 1991-04-12 14:30 --lat=48.856 --lon=2.352 --house-systems=placidus,whole-sign --json --compact --fields=houseSystems.systems.W.cusps
# Unknown birth time: noon positions are placeholders, Moon gets a sign range, no angles/houses/lots
kaabalah astrology 1991-04-12 --quality=untimed --lat=48.856 --lon=2.352 --json --compact --fields=status,moonDayRange.signs
# Date only partially known: no chart is invented
kaabalah astrology 1991-04 --quality=partial --json --compact --fields=status,unavailable
```

- `--max-orb` is a **post-filter** of the default aspects; `--orb-profile` (or an `"orbPolicy"` object in `--input-json`) is a **generation-time** policy: luminaries 8 degrees, planets 6, angles/nodes/points/lots 3, plus the quincunx. Unknown profile, aspect or point names exit `INVALID_ARGUMENT` instead of returning an empty list.
- `--points` takes typed IDs (`sun`, `moon`, `mean-node`, `true-node`, `asc`, `mc`, `vertex`, `lot-fortune`, ...). `--group-axes` adds axis-equivalence groups; raw and grouped counts are always reported.
- `astrology:transits --orb-profile=...` adds `policyAspects` with natal targets held fixed, so applying/separating motion is known even for natal angles. `--closest-approaches` (range mode only) adds stationary near-misses, never labelled exact.
- `--quality recorded|rectified` needs an explicit time; `--exclude-rectified-angles` drops angles from the analysis set; `--local-mean-time` and `--place-role` record the time provenance.
- `--strict-ephemeris` (all ephemeris commands) fails with `INVALID_DATE` instead of silently using Moshier outside the shipped Swiss files.
- `astrology:composite` prints `compositeAngles` (ASC, MC, DSC, IC).

## Derived charts, progressions and timelines

```bash
kaabalah astrology:davison --input-json=- --json --compact --fields=midpointDateUtc,location < pair.json
kaabalah astrology:overlays --input-json=- --points=sun,moon --json --compact --fields=aInB.placements < pair.json
kaabalah astrology:progressions 1991-04-12 14:30 --lat=48.856 --lon=2.352 --target-date=2026-03-01 --json --compact --fields=ageYears,solarArcDegrees
kaabalah astrology:solar-arc 1991-04-12 14:30 --lat=48.856 --lon=2.352 --target-date=2026-03-01 --targets=sun,ascendant --json --compact --fields=arcDegrees,method.targetSet
kaabalah astrology:returns 1960-06-15 14:30 --lat=48.856 --lon=2.352 --from=1988-01-01 --to=1992-01-01 --kinds=saturn-return --json --compact --fields=entries
kaabalah astrology:profections:timeline 1991-04-12 14:30 --lat=48.856 --lon=2.352 --from-age=30 --to-age=32 --json --compact --fields=entries
kaabalah astrology:firdaria:timeline 1991-04-12 14:30 --lat=48.856 --lon=2.352 --to=2005-01-01 --no-sub-periods --json --compact --fields=sect
```

`pair.json` is `{"chartA": {"date","time","lat","lon"}, "chartB": {...}}` as for `astrology:synastry`. Target and window dates for progressions, solar arc and returns are UTC (`--target-date` at 12:00 UTC unless `--target-time`; `--from`/`--to` at 00:00 UTC, end exclusive). Progressions declare their time key (`--year-length julian|tropical|solar-return|<days>`) and report quotidian, solar-arc and Naibod angle conventions separately. Davison and composite are different methods; both are available.

## Jyotish

```bash
kaabalah astrology:jyotish 1991-04-12 14:30 --lat=48.856 --lon=2.352 --frame=lahiri --node=true --karaka-scheme=8 --as-of=2026-03-01 --json --compact --fields=activeDasha.vimshottari.maha.lord,karakas.scheme
```

Both frames (`dhruva`, `lahiri`) are always computed; `--frame` selects the one used for karakas and dashas, so mixed-frame comparisons need one call. Options: `--node mean|true`, `--year-length-days`, `--karaka-scheme 7|8`, `--untimed` (no Moon, lagna, karakas or dashas), `--through` (exclusive end of dasha generation) and `--as-of` (adds `activeDasha` for Vimshottari and Yogini at 12:00 UTC of that day).

## Bulk collections

```bash
kaabalah astrology:collection --manifest=people.json --json --compact --fields=summary
kaabalah astrology:collection --manifest=- --pair-mode=timed-only --quiet < people.json
kaabalah astrology:collection --manifest=people.json --ndjson --quiet > records.ndjson
```

Manifest (also accepted through `--input-json`; `--manifest` takes a file path or `-` for stdin, up to 4 MiB):

```json
{
  "people": [
    {"id": "p1", "date": "1991-04-12", "time": "14:30", "lat": 48.856, "lon": 2.352},
    {"id": "p3", "date": "1985-02-20", "quality": "untimed", "lat": 51.5, "lon": -0.12}
  ],
  "events": [{"id": "e1", "date": "2020-03-20", "time": "12:00"}],
  "pairs": {"mode": "all"}
}
```

- Each person's chart is computed once. User IDs are preserved; people and events keep manifest order; pairs are ordered by manifest index. Per-item failures become `{ "ok": false, "error": ... }` records. Pair selection: `all`, `timed-only` (people with a supplied time) or `pairs` with `"pairs": [["p1","p3"]]`; `--pair-mode` overrides the manifest. Event times are UTC unless the event has a `timezone`.
- `--concurrency` (1-64, default 4) bounds async tasks in flight; Swiss Ephemeris calls are synchronous WebAssembly, so it does not add CPU parallelism. Progress goes to stderr (`collection pairs: 6/6`) and `--quiet` suppresses it. SIGINT/SIGTERM abort the run (exit 130 / 143).
- **Default output is one JSON document** (`people`, `events`, `pairs`, `summary`). **`--ndjson` is a different contract**: one compact JSON record per line (`person`, `event`, `pair`, then a `summary` record), written with stdout backpressure. It cannot be combined with `--fields`. An error during the stream is a final `{"error":true,...}` line.

## Capabilities

```bash
kaabalah capabilities --json --compact --fields=schemaVersion,cli.version,limits.collection
kaabalah capabilities --probe --json --compact --fields=astrology.ephemeris   # initialises Swiss Ephemeris
```

Returns the library `getCapabilities()` description (modules, house systems, points, aspects, frames, defaults, limits, library error codes) plus `cli.commands`, `cli.globalFlags` and `cli.errorCodes`. Without `--probe` ephemeris coverage is the static shipped range; with it the runtime is initialised (`WASM_INIT_ERROR` if the assets are missing).

## Schema Introspection

The CLI exposes its full schema as JSON, useful for programmatic consumption.

```bash
# Full schema of all commands
kaabalah help --json

# Schema for a specific command
kaabalah help astrology --json
kaabalah help iching:reading --json
```

## Error Handling

All errors in `--json` mode return a structured response:

```json
{"error": true, "code": "ERROR_CODE", "message": "Human-readable description"}
```

Exit code is always `1` on error.

**Error codes:** `INVALID_DATE`, `INVALID_ARGUMENT`, `MISSING_ARGUMENT`, `UNKNOWN_COMMAND`, `UNSUPPORTED_SYSTEM`, `CARD_NOT_FOUND`, `INDEX_OUT_OF_POOL`, `INTERNAL_ERROR`, `GEOCODE_ERROR`, `WASM_INIT_ERROR`, `INVALID_JSON`

Typed library errors are mapped onto these codes (no extra code exists): date problems, `SWISSEPH_DATE_OUT_OF_RANGE` and strict-ephemeris mismatches are `INVALID_DATE`; invalid options, ranges, manifests, orb policies and derived-chart limits are `INVALID_ARGUMENT`; missing time, location or birth value is `MISSING_ARGUMENT`; missing Swiss Ephemeris assets are `WASM_INIT_ERROR`. Messages end with a separate sentence pointing to `kaabalah help <command>`.

`UNSUPPORTED_SYSTEM` is returned when a tree system has no SVG renderer (`tree:svg`), and `INDEX_OUT_OF_POOL` when a `tarot:spread --method=conscious` index exceeds the eligible pool. The JSON error also carries the CLI `version`. With `--language pt-BR` the `message` is translated and `code` is not.

## Tips for Programmatic Use

1. **Always use `--json --compact`** to get structured, minimal output.
2. **Use `--fields`** to extract only what you need and reduce token usage.
3. **Use `--input-json`** (or `--input-json=-` to read from stdin) for complex parameters instead of shell escaping.
4. **Use `kaabalah help --json`** to discover available commands and their schemas.
5. **Prefer `--lat`/`--lon`** over `--location` to avoid the Google Maps API network dependency.
6. **Check error codes** programmatically via the `code` field in error responses.
7. **Do not redirect stderr into stdout** when parsing JSON: runtime notices go to stderr. Use `--quiet` to suppress them.
8. **Pin dates and years** (`--as-of`, `--year`, `--transit-date`, `--target-date`) when you need reproducible output.
9. **`astrology:collection --ndjson`** is the only command whose stdout is not a single JSON document.

## Input Limits

- Text input: max 1000 characters
- `--max-results`: capped at 10000
- Date range: year 0001-9999, real calendar days only (`2026-02-30` is rejected); numerology schedules accept birth years up to 9998
- Bulk manifests: up to 500 people, 1000 events, 125000 pairs; manifest size 4 MiB (other `--input-json=-` payloads: 64 KiB)
- Numerology timelines: at most about 100 years and 10000 intervals per call
- Latitude: -90 to 90
- Longitude: -180 to 180
