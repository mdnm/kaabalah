---
title: CLI Reference
description: Command-line interface for quick Kaabalah calculations
sidebar:
  order: 2
  label: CLI
---

Kaabalah includes a command-line interface for quick calculations without writing code.

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
| `numerology:cycles <date> [name]` | Personal cycles (year, month, periods) |
| `numerology:challenges <date>` | Challenges from birth date |
| `numerology:fibonacci <date>` | Fibonacci cycle for current age |
| `astrology <date> [time]` | Calculate birth chart using Swiss Ephemeris |
| `astrology:wheel <date> [time]` | Render a birth chart as an astrology wheel SVG |
| `astrology:synastry` | Cross-chart aspects between two birth charts |
| `astrology:composite` | Midpoint composite chart from two birth charts |
| `astrology:transits <date> [time]` | Transit aspects to a natal chart |
| `astrology:solar-return <date> [time]` | Solar Return chart for a given year |
| `astrology:profections <date> [time]` | Annual profection (Hellenistic time lord) |
| `astrology:profections:monthly <date> [time]` | Monthly profections for a given year |
| `astrology:firdaria <date> [time]` | Firdaria planetary periods |
| `astrology:astrocartography <date> [time]` | Full Astro*Carto*Graphy map |
| `astrology:astrocartography:query <date> [time]` | Query a location for nearby planetary lines |
| `astrology:decans <longitude>` | Decan (face) lookup for a zodiacal longitude |
| `astrology:dodecatemoria <longitude>` | Dodecatemoria (12th part) lookup |
| `tarot [count]` | Draw tarot cards (default: 3) |
| `tarot:card <query>` | Look up a specific card by number or name |
| `tarot:spread <cards...>` | Look up multiple cards by name or number, or draw a named spread with `--spread-id` |
| `ifa <date>` | Calculate Odu from a date |
| `tree` | Show Tree of Life structure with all nodes, data, and edges |
| `tree:node <id>` | Look up a node and all its correspondences |
| `tree:find [query]` | Find tree nodes by ID, name, or type |
| `tree:types` | List all node types and their counts |
| `tree:layout` | Return canonical Tree of Life layout coordinates |
| `tree:svg` | Generate a Tree of Life SVG |
| `tree:ascii` | Render a lightweight ASCII Tree of Life preview |

## Examples

```bash
kaabalah gematria "Hello World"
kaabalah numerology 1990-01-15
kaabalah numerology:cycles 1990-01-15 John
kaabalah tarot 5 --inverted
kaabalah tarot:card 7
kaabalah tarot:spread "Two of Cups" "The Chariot" 7
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
kaabalah tree:svg --output=tree.svg --background=transparent --json
```

## Global Flags

| Flag | Description |
|------|-------------|
| `--json` | JSON output (auto-enabled when stdout is not a TTY) |
| `--no-json` | Force human-readable output even when piped |
| `--compact` | Minified JSON (no indentation) |
| `--fields=a.b,c.d` | Filter JSON output to specified dot-paths |
| `--input-json='{"key":"val"}'` | Pass all parameters as a JSON object (use `-` to read from stdin) |
| `--version` | Print version |
| `--debug` | Emit debug logs to stderr |
| `--trace` | Print stack traces for unexpected fatal errors (human-readable mode) |

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
kaabalah numerology 1990-01-15
kaabalah numerology 1990-01-15 --json --fields=kaabalistic.lifePath.reducedValue,challenges.mainChallenge
```

### numerology:lifepath

Life path number using the kaabalistic method.

```bash
kaabalah numerology:lifepath 1990-01-15 --json --compact
```

### numerology:cycles

Personal cycles (year, month, periods). Optionally pass a first name for soul number calculation.

```bash
kaabalah numerology:cycles 1990-01-15
kaabalah numerology:cycles 1990-01-15 John
```

### numerology:challenges

Calculate challenges from a birth date.

```bash
kaabalah numerology:challenges 1990-01-15 --json --compact
```

### numerology:fibonacci

Fibonacci cycle based on current age.

```bash
kaabalah numerology:fibonacci 1990-01-15 --json --compact
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
| `--location` | string | - | Location for geocoding (requires `GOOGLE_MAPS_API_KEY`) |
| `--house-system` | string | placidus | House system (see below) |
| `--timezone` | string | - | IANA timezone (e.g. `America/New_York`). Auto-resolved from coordinates if omitted |
| `--max-orb` | number | - | Maximum orb in degrees to include in the aspects array |
| `--aspect-types` | string | - | Comma-separated aspect names, or `major` |

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
| `--location` | string | - | Location for geocoding (requires `GOOGLE_MAPS_API_KEY`) |
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
| `--house-system` | string | placidus | House system |
| `--timezone` | string | - | Natal IANA timezone |
| `--transit-date` | string | today | Transit date (YYYY-MM-DD) |
| `--transit-time` | string | 12:00 | Transit time (HH:MM) |
| `--transit-lat` | number | natal lat | Transit location latitude |
| `--transit-lon` | number | natal lon | Transit location longitude |
| `--transit-timezone` | string | natal timezone | Transit IANA timezone |
| `--max-orb` | number | - | Maximum orb in degrees |
| `--aspects` | string | - | Comma-separated aspect names, or `major` |
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

Returns `sect`, `currentMajor` (planet, years, start/end, subPeriods[]), `currentSub` (planet, start/end), `allPeriods[]`.

Day sequence: Sun (10y), Venus (8y), Mercury (13y), Moon (9y), Saturn (11y), Jupiter (12y), Mars (7y), North Node (3y), South Node (2y) = 75 years total.

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--lat` | number | - | Natal latitude |
| `--lon` | number | - | Natal longitude |
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
| `--timezone` | string | - | IANA timezone |
| `--latitude-step` | number | 1 | Degrees between latitude samples for AC/DC curves |
| `--latitude-range` | number | 66.5 | Maximum latitude to sweep |

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
| `--query-lat` | number | - | Query latitude (required) |
| `--query-lon` | number | - | Query longitude (required) |
| `--orb` | number | 2 | Maximum distance in degrees for active lines |
| `--paran-orb` | number | 1 | Paran crossing orb in degrees |

### tarot

Draw random tarot cards (non-deterministic).

```bash
kaabalah tarot 5 --inverted
kaabalah tarot --json
```

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--inverted` | boolean | false | Include inverted cards |
| `--shuffle-count` | number | 7 | Number of times to shuffle the deck |

In `--json` mode the ritual shuffle delay is skipped, so the command returns immediately; human-facing output keeps the paced shuffle.

### tarot:card

Look up a specific card by number or name (deterministic).

```bash
kaabalah tarot:card 7
kaabalah tarot:card 22 --json
kaabalah tarot:card "The Chariot" --json
kaabalah tarot:card chariot --json
kaabalah tarot:card "The Chariot" --deck=rider-waite --json --compact
kaabalah tarot:card --decks --json
```

Accepts a card number (1-78) or any part of a card name. Partial name matches return all matching cards.

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--deck` | string | — | Enrich output with deck-specific `deckId`, `imageUrl`, and description. Valid: `papus_pt`, `papus`, `mythic`, `egyptian`, `rider-waite` |
| `--decks` | boolean | false | List available decks (no card query needed) |

Cards missing from the chosen deck return `"imageUrl": null` rather than an error. An unknown deck id exits 1 with `INVALID_ARGUMENT`.

### tarot:spread

Look up multiple tarot cards by name or number in a single call, or draw one of the built-in spread layouts.

```bash
kaabalah tarot:spread "Two of Cups" "The Chariot" 7
kaabalah tarot:spread --list
kaabalah tarot:spread --spread-id=celtic-cross --json
kaabalah tarot:spread --spread-id=event-reading --inquirer-gender=woman --json
kaabalah tarot:spread --input-json=- --json --compact < cards.json
```

Cards that are not found are returned inline as error objects (the command does not exit with code 1 for individual card misses). Useful for resolving a whole spread at once.

Use `--spread-id` to draw a structured spread with slot metadata and resolved cards. Supported IDs are the same `TarotSpreadId` values exposed by the TypeScript API: `quick-insight`, `conscious-reading`, `time-reading`, `dialectic-reading`, `tree-of-life-reading`, `celtic-cross`, and `event-reading`.

Run `kaabalah tarot:spread --list` to discover the supported spread IDs from the CLI.

`event-reading` requires an inquirer gender because its center card is deterministic. Pass `--inquirer-gender=man` or `--inquirer-gender=woman`, or provide it in JSON as `{"spreadId":"event-reading","context":{"inquirerGender":"woman"}}`.

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--spread-id` | string | - | Draw a built-in spread by ID |
| `--list` | boolean | false | List built-in spread IDs and requirements |
| `--inverted` | boolean | false | Include inverted cards when drawing a named spread |
| `--inquirer-gender` | string | - | Required by `event-reading`; `man` or `woman` |

### ifa

Calculate Odu from a date.

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
| `--system` | string | kaabalah | Tree system: `kaabalah`, `hermetic-qabalah`, `lurianic-kabbalah` |
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

## Schema Introspection

The CLI exposes its full schema as JSON, useful for programmatic consumption.

```bash
# Full schema of all commands
kaabalah help --json

# Schema for a specific command
kaabalah help astrology --json
```

## Error Handling

All errors in `--json` mode return a structured response:

```json
{"error": true, "code": "ERROR_CODE", "message": "Human-readable description"}
```

Exit code is always `1` on error.

**Error codes:** `INVALID_DATE`, `INVALID_ARGUMENT`, `MISSING_ARGUMENT`, `UNKNOWN_COMMAND`, `CARD_NOT_FOUND`, `INTERNAL_ERROR`, `GEOCODE_ERROR`, `WASM_INIT_ERROR`, `INVALID_JSON`

## Tips for Programmatic Use

1. **Always use `--json --compact`** to get structured, minimal output.
2. **Use `--fields`** to extract only what you need and reduce token usage.
3. **Use `--input-json`** (or `--input-json=-` to read from stdin) for complex parameters instead of shell escaping.
4. **Use `kaabalah help --json`** to discover available commands and their schemas.
5. **Prefer `--lat`/`--lon`** over `--location` to avoid the Google Maps API network dependency.
6. **Check error codes** programmatically via the `code` field in error responses.

## Input Limits

- Text input: max 1000 characters
- `--max-results`: capped at 10000
- Date range: year 0001-9999
- Latitude: -90 to 90
- Longitude: -180 to 180
