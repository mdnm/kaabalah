# Kaabalah

A comprehensive TypeScript library for numerology, astrology, kabbalah, and tarot calculations and interpretations.

## Features

- **Numerology**: Calculate life path numbers and other numerological values
- **Astrology**: Generate birth charts and planetary positions using Swiss Ephemeris
- **Kabbalah**: Hebrew gematria calculations and mystical interpretations
- **Tarot**: Card meanings, spreads, and interpretations

## Installation

```bash
npm install kaabalah
```

## Usage Examples

### Full Library

```typescript
import * as Kaabalah from 'kaabalah';

// Calculate life path number
const lifePath = Kaabalah.calculateLifePath(new Date('1990-01-15'));
console.log(`Life Path Number: ${lifePath}`);

// Get a random tarot spread
const spread = Kaabalah.getRandomSpread(3);
console.log('Tarot Spread:', spread);
```

### Direct Module Imports (Tree-Shakable)

```typescript
// Only import what you need
import { calculateLifePath } from 'kaabalah/numerology';
import { getBirthChart } from 'kaabalah/astrology';
import { calculateGematria } from 'kaabalah/kabbalah';
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
const gematriaValue = calculateGematria('שלום');

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

MIT 