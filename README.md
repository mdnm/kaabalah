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
- **Semantic profiles**: Canonical house and tarot theme metadata for deterministic matching

## Installation

```bash
npm install kaabalah
```

Node.js 18.18+ is required for the bundled CLI and runtime helpers.

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
import { getHouseThemeProfile } from 'kaabalah/semantic';
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
const fourthHouse = getHouseThemeProfile(4);

// Get a tarot spread
const spread = getRandomSpread(3, true);
```

### Canonical Tarot Image Resolution

```typescript
import { id, KaabalahTypes } from "kaabalah/core";
import {
  getTarotArchetype,
  getTarotCardByNumber,
  getTarotCardNumber,
  getTarotCorrespondenceProfile,
  getTarotCardProfile,
  getTarotRepresentation,
  listTarotTrees,
  resolveTarotImageUrl
} from "kaabalah/tarot";

const archetype = getTarotArchetype({
  pathId: id(KaabalahTypes.PATH, 2)
});

const riderWaite = getTarotRepresentation({ pathSlug: "beth" }, "rider-waite");
const queenOfCups = getTarotRepresentation(
  { tarotCardName: "Queen of Cups" },
  "rider-waite"
);
const tenOfSwords = getTarotRepresentation(
  { tarotCardNumber: 55 },
  "mythic"
);
const aceOfPentacles = getTarotCardProfile({
  tarotCardName: "Ace of Pentacles"
});
const aceOfPentaclesNumber = getTarotCardNumber({
  tarotCardName: "Ace of Pentacles"
});
const kingOfSwords = getTarotCardByNumber(51);
const tarotTrees = listTarotTrees();
const papusImageUrl = resolveTarotImageUrl(
  { tarotCardFilename: "02_the_high_priestess" },
  "papus_pt"
);
const aceOfWandsUrl = resolveTarotImageUrl(
  { tarotCardFilename: "ace_wands" },
  "papus_pt"
);

// Persist the canonical archetype ID (for example `path:2`), not the image URL.
```

`getTarotArchetype()` remains major-only. The image helpers (`getTarotRepresentation()`, `getTarotRepresentations()`, and `resolveTarotImageUrl()`) support all 78 cards and own the canonical asset rules:

- majors: `major/<filename>.jpg`
- minors: `minor/<suit>/<filename>.jpg`
- courts: `daat+royalship/<suit>/<filename>.jpg`

Downstream apps should consume the returned `imageUrl` (or `assetPath`) from the library instead of reconstructing S3 paths locally.

Tarot numbering is tree-scoped. In the current library release the canonical default tree is `kaabalah`, and `getTarotCardProfile()` resolves its `tarotCardNumber` from the direct `tarotArkAnnu ↔ number` correspondence in that tree. Use `getTarotCardNumber()` / `getTarotCardByNumber()` for forward and reverse numbering lookups, and treat raw `ARKANNUS` entries as compatibility data rather than the source of truth.

For display-facing correspondences, use `getTarotCorrespondenceProfile()` instead of rebuilding card bundles in the app:

```typescript
const pageOfWands = getTarotCorrespondenceProfile({
  tarotCardName: "Page of Wands"
});
// {
//   kind: "court",
//   courtRank: "page",
//   correspondences: {
//     element: { id: "westernElement:Fire", label: "Fire" }
//   }
// }

const magician = getTarotCorrespondenceProfile({
  tarotCardName: "The Magician"
});
// includes typed astrology correspondences plus path metadata
// { pathId, pathNumber, pathSlug, hebrewLetter, fromSphere, toSphere, meaning }
```

Downstream apps no longer need to parse card-name prefixes like `Page of ...` to determine court rank, or rebuild the same major/court/minor correspondence collapsing logic from raw tree traversals.

Observable kaabalah-default renumbering:

- `Ten of Swords` is `55` and `Ace of Swords` is `64`
- `Ten of Pentacles` is `69` and `Ace of Pentacles` is `78`
- court/minor suit blocks run `King → Queen → Knight → Page → Ten → ... → Ace`

### Canonical Semantic Profiles

```typescript
import {
  getHouseThemeProfile,
  getTarotThemeProfile,
  listHouseThemeProfiles,
  tokenizeOccultThemeText
} from "kaabalah/semantic";

const dreamTokens = tokenizeOccultThemeText(
  "I dreamed about family, roots, and hidden rooms."
);

const fourthHouse = getHouseThemeProfile(4);
const tower = getTarotThemeProfile("The House of God");
const houseProfiles = listHouseThemeProfiles();
```

Semantic profiles are deterministic, library-owned metadata layered on top of canonical correspondences. Downstream apps should consume the profile `id`, `houseNumber` or `cardNumber`, `keywords`, `tokens`, and grouped `correspondences`, while keeping scoring, ranking, and UI presentation app-side.
For houses, `primaryLabel` is the semantic life-area label and `houseLabel` preserves the structural astrological label (`Ascendant`, `Imum Coeli`, `Descendant`, `Medium Coeli`, etc.).

### Canonical Tarot Spreads

```typescript
import {
  drawTarotSpread,
  getTarotSpread,
  listTarotSpreads,
  validateTarotSpreadSelection
} from "kaabalah/tarot";

const spreads = listTarotSpreads();
const treeOfLife = getTarotSpread("tree-of-life-reading");

const drawn = drawTarotSpread({
  spreadId: "event-reading",
  context: { inquirerGender: "man" },
  includeInverted: true
});

const validation = validateTarotSpreadSelection({
  spreadId: drawn.spread.spreadId,
  context: drawn.context,
  cards: drawn.cards.map((card) => ({
    slotKey: card.slotKey,
    cardNumber: card.cardNumber,
    isInverted: card.isInverted
  }))
});
```

Downstream apps should consume `spreadId`, `slotKey`, and the slot constraint metadata from the library instead of hardcoding spread semantics. Persist the reading state as canonical spread/card data such as `spreadId`, `slotKey`, `cardNumber`, `isInverted`, and app-side notes.

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
kaabalah astrology:synastry --input-json=- --json < synastry.json

# Composite (midpoint chart)
kaabalah astrology:composite --input-json=- --json < composite.json

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
| `--input-json=-` | Read a JSON object from stdin |
| `--debug` | Emit debug logs to stderr (same effect as `DEBUG=kaabalah:*`) |
| `--trace` | Print stack traces for unexpected fatal errors in human-readable mode |

### Schema Introspection

```bash
# Full schema of all commands
kaabalah help --json

# Schema for a specific command
kaabalah help astrology --json
```

### Debugging

```bash
# Emit parser/config/astrology debug logs to stderr
DEBUG=kaabalah:* kaabalah help --json

# Same as above, but from the CLI flag
kaabalah astrology 1990-01-15 14:30 --lat=40.7128 --lon=-74.006 --debug

# Add --trace while reproducing an unexpected fatal error locally
kaabalah <command> --trace --no-json
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

For Node apps that need stable runtime asset paths, use the exported helper instead of probing `node_modules/kaabalah` manually:

```typescript
import { getSwissEph, resolveSwissEphRuntimeAssets } from "kaabalah/astrology";

const assets = resolveSwissEphRuntimeAssets({
  wasmPathCandidates: ["./vendor/kaabalah/swisseph.node.wasm"],
  ephePathCandidates: ["./vendor/kaabalah/ephe"]
});

await getSwissEph(assets);
```

If no app-specific candidates are provided, the helper falls back to the package-bundled Node assets. In browser environments it stays filesystem-free and returns the bundled browser defaults.

## License

This project is licensed under the AGPL-3.0 license. See the LICENSE file for details.

## Acknowledgments

- [Swiss Ephemeris](https://www.astro.com/swisseph/) for providing the astronomical calculation library
- [Astro.com](https://www.astro.com/) for the Swiss Ephemeris data
