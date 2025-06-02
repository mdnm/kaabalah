# Kaabalah

A comprehensive TypeScript library for numerology, astrology, kaabalah, and tarot calculations and interpretations.

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
