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
| `tarot [count]` | Draw tarot cards (default: 3) |
| `tarot:card <number>` | Look up a specific card (1-78) |
| `ifa <date>` | Calculate Odu from a date |
| `tree` | Show Tree of Life structure with all nodes, data, and edges |
| `tree:node <id>` | Look up a node and all its correspondences |
| `tree:types` | List all node types and their counts |

## Examples

```bash
kaabalah gematria "Hello World"
kaabalah numerology 1990-01-15
kaabalah numerology:cycles 1990-01-15 John
kaabalah tarot 5 --inverted
kaabalah tarot:card 7
kaabalah gematria:reverse 22
kaabalah ifa 1990-01-15
kaabalah astrology 1990-01-15 14:30 --lat=40.7128 --lon=-74.006
kaabalah astrology 1990-01-15 14:30 --location="New York, USA"

# Tree of Life correspondences
kaabalah tree:node path:1 --json
kaabalah tree:node "tarotArkAnnu:The Magician" --depth=2 --json
kaabalah tree:node sphere:Kether --type=tarotArkAnnu --json
```

## Global Flags

| Flag | Description |
|------|-------------|
| `--json` | JSON output (auto-enabled when stdout is not a TTY) |
| `--no-json` | Force human-readable output even when piped |
| `--compact` | Minified JSON (no indentation) |
| `--fields=a.b,c.d` | Filter JSON output to specified dot-paths |
| `--input-json='{"key":"val"}'` | Pass all parameters as a JSON object |

## Detailed Command Reference

### gematria

Calculate Hebrew letter values for Latin text.

```bash
kaabalah gematria "Hello World"
kaabalah gematria "Hello World" --json --compact
```

### gematria:reverse

Find letter combinations that match a target gematria value.

```bash
kaabalah gematria:reverse 22
kaabalah gematria:reverse 22 --max-results=50 --min-length=2 --max-length=4 --json
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
kaabalah numerology:lifepath 1990-01-15
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
kaabalah numerology:challenges 1990-01-15
```

### numerology:fibonacci

Fibonacci cycle based on current age.

```bash
kaabalah numerology:fibonacci 1990-01-15
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
| `--timezone` | string | - | IANA timezone (e.g. `America/New_York`) |

**House systems:** placidus, koch, porphyrius, regiomontanus, campanus, equal, whole-sign, meridian, morinus, krusinski, alcabitius

### tarot

Draw random tarot cards.

```bash
kaabalah tarot 5 --inverted
kaabalah tarot --json
```

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--inverted` | boolean | false | Include inverted cards |
| `--shuffle-count` | number | 7 | Number of times to shuffle the deck |

### tarot:card

Look up a specific card by number.

```bash
kaabalah tarot:card 7
kaabalah tarot:card 22 --json
```

### ifa

Calculate Odu from a date.

```bash
kaabalah ifa 1990-01-15
```

### tree

Show the full Tree of Life graph structure — all nodes with their data and edges.

```bash
kaabalah tree
kaabalah tree --json --compact
```

In JSON mode, the output includes `nodes` (with data and related types) and `edges` (all connections between nodes).

### tree:node

Look up a specific node and all its correspondences. This is the key command for traversing the Tree of Life graph.

```bash
# Get a path and all its direct correspondences
kaabalah tree:node path:1 --json

# Get a tarot card's correspondences
kaabalah tree:node "tarotArkAnnu:The Magician" --json

# Walk 2 levels deep to see full correspondence chain
# (e.g. tarot card → path → hebrew letter, spheres, element, zodiac)
kaabalah tree:node "tarotArkAnnu:The Magician" --depth=2 --json

# Filter by type — get only tarot cards related to a sphere
kaabalah tree:node sphere:Kether --type=tarotArkAnnu --json

# Get the hebrew letter for a path
kaabalah tree:node path:1 --type=hebrewLetter --json
```

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--type` | string | - | Filter related nodes by type (e.g. hebrewLetter, planet, tarotArkAnnu) |
| `--depth` | number | 1 | Traversal depth for walking the graph |

### tree:types

List all node types available in the tree and their counts. Useful for discovering valid type names for `tree:node --type` filtering.

```bash
kaabalah tree:types
kaabalah tree:types --json
```

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
