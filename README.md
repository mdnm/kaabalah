# Kaabalah

A comprehensive TypeScript library for numerology, astrology, kaabalah, and tarot calculations and interpretations.

## Docs

Complete documentation here [https://docs.kaabalah.com/](https://docs.kaabalah.com/)

## Features

- **Tree of Life**: A modular and performant tree of life system to help you build correspondences across different systems
- **Numerology**: Calculate life path numbers and other numerological values
- **Astrology**: Generate birth charts and planetary positions using Swiss Ephemeris
- **Gematria**: Gematria (text numerology) calculations
- **Tarot**: Card meanings, spreads, and interpretations

## Installation

```bash
npm install kaabalah
```

## Support us on Ko-Fi

If you find this package useful, you can support it on Ko-Fi too (or just star the repo):

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/matmoura19)

## Usage Examples

### Core Library

```typescript
import { createTree } from 'kaabalah/core';

const tree = createTree({
  system: 'kaabalah',
  parts: ['westernAstrology', 'tarot'],
});

const gematriaResult = calculateGematria('kaabalah', tree);

console.log(gematriaResult);
```

### Direct Module Imports (Tree-Shakable)

```typescript
// Only import what you need
import { calculateLifePath } from 'kaabalah/numerology';
import { getBirthChart } from 'kaabalah/astrology';
import { calculateGematria } from 'kaabalah/kaabalah';
import { getRandomSpread } from 'kaabalah/tarot';

// Calculate life path number
const lifePath = calculateLifePath(new Date('1990-01-15'));

// Generate a birth chart (with Swiss Ephemeris)
const birthChart = getBirthChart({
  date: new Date('1990-01-15T12:30:00Z'),
  latitude: 40.7128,
  longitude: -74.0060,
  timezone: -5
});

// Calculate Hebrew gematria
const gematriaValue = calculateGematria('kaabalah');

// Get a tarot spread
const spread = getRandomSpread(3, true);
```

## CLI

Kaabalah includes a command-line interface for quick calculations without writing code.

```bash
# Install globally
npm install -g kaabalah

# Or run directly with npx
npx kaabalah help
```

### Commands

| Command | Description |
|---------|-------------|
| `gematria <text>` | Calculate gematria for a word or phrase |
| `gematria:reverse <number>` | Find letter combinations matching a gematria value |
| `numerology <date>` | Full numerological profile for a birth date |
| `numerology:lifepath <date>` | Life path number (kaabalistic method) |
| `numerology:cycles <date> [name]` | Personal cycles (year, month, periods) |
| `numerology:challenges <date>` | Challenges from birth date |
| `numerology:fibonacci <date>` | Fibonacci cycle for current age |
| `astrology <date> [time]` | Calculate birth chart with aspects using Swiss Ephemeris |
| `astrology:synastry` | Cross-chart aspects between two birth charts (via `--input-json`) |
| `astrology:composite` | Midpoint composite chart from two birth charts (via `--input-json`) |
| `tarot [count]` | Draw tarot cards (default: 3) |
| `tarot:card <number>` | Look up a specific card (1-78) |
| `ifa <date>` | Calculate Odu from a date |
| `tree` | Show Tree of Life structure with all nodes, data, and edges |
| `tree:node <id>` | Look up a node and all its correspondences |
| `tree:types` | List all node types and their counts |

### Examples

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

# Synastry (cross-chart aspects)
kaabalah astrology:synastry --input-json='{"chartA":{"date":"2001-10-02","time":"19:45","lat":-22.74,"lon":-47.33,"timezone":"America/Sao_Paulo"},"chartB":{"date":"1999-02-01","time":"14:30","lat":-23.96,"lon":-46.33,"timezone":"America/Sao_Paulo"}}' --json

# Composite (midpoint chart)
kaabalah astrology:composite --input-json='{"chartA":{"date":"2001-10-02","time":"19:45","lat":-22.74,"lon":-47.33},"chartB":{"date":"1999-02-01","time":"14:30","lat":-23.96,"lon":-46.33}}' --json

# Tree of Life correspondences
kaabalah tree:node path:1 --json
kaabalah tree:node "tarotArkAnnu:The Magician" --depth=2 --json
kaabalah tree:node sphere:Kether --type=tarotArkAnnu --json
```

### Global Flags

| Flag | Description |
|------|-------------|
| `--json` | JSON output (auto-enabled when stdout is not a TTY) |
| `--no-json` | Force human-readable output even when piped |
| `--compact` | Minified JSON (no indentation) |
| `--fields=a.b,c.d` | Filter JSON output to specified dot-paths |
| `--input-json='{"key":"val"}'` | Pass all parameters as a JSON object |

### Schema Introspection

```bash
# Full schema of all commands
kaabalah help --json

# Schema for a specific command
kaabalah help astrology --json
```

## Development

This project uses TypeScript and WebAssembly for the Swiss Ephemeris calculations.

### Building the Project

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

## Swiss Ephemeris Integration

The astrological calculations use the Swiss Ephemeris library, compiled to WebAssembly for use in both Node.js and browser environments.

## License

This project is licensed under the AGPL-3.0 license. See the LICENSE file for details.

## Acknowledgments

- [Swiss Ephemeris](https://www.astro.com/swisseph/) for providing the astronomical calculation library
- [Astro.com](https://www.astro.com/) for the Swiss Ephemeris data
