---
title: Quickstart
description: Quick usage examples for all Kaabalah modules
sidebar:
  order: 4
---

## Usage Examples

If you're new to the domain, read:

- [Concepts and terminology](/getting-started/concepts/)
- [Practical recipes](/getting-started/recipes/)

### Core (Tree of Life)

```typescript
import { createTree } from 'kaabalah/core';

const tree = createTree({
  system: 'kaabalah',
  parts: ['westernAstrology', 'tarot'],
});

// Traverse correspondences from a sphere
const kether = tree.getNode('sphere:Kether');
console.log(kether?.name);
```

### Numerology (life path)

```typescript
import { calculateKaabalisticLifePath } from 'kaabalah/numerology';

const lifePath = calculateKaabalisticLifePath(new Date('1990-06-15'));

console.log(lifePath.lifePath.reducedValue);
console.log(lifePath.syntheses.finalSynthesis);
```

### Gematria (text → number)

```typescript
import { calculateGematria } from 'kaabalah/gematria';

const gematria = calculateGematria('DAVID');

console.log(gematria.synthesis.originalSum);
console.log(gematria.vowels.originalSum);
console.log(gematria.consonants.originalSum);
```

### Tarot (shuffle + draw)

```typescript
import { ARKANNUS, shuffleTarotDeck, getTarotCardProfile } from 'kaabalah/tarot';

const shuffled = await shuffleTarotDeck(ARKANNUS, /* inverted */ true);
const spread = shuffled.slice(0, 3);

console.log(spread.map((c) => c.tarotCard));

// Rich card metadata (meanings, keywords, deck descriptions)
const profile = getTarotCardProfile(ARKANNUS[0]);
console.log(profile.descriptions);
```

### Astrology (birth chart)

```typescript
import { getBirthChart, HouseSystem } from 'kaabalah/astrology';

const chart = await getBirthChart({
  date: { year: 1990, month: 6, day: 15, hour: 12, minute: 30 },
  latitude: 40.7128,
  longitude: -74.0060,
  houseSystem: HouseSystem.PLACIDUS,
  timeZoneSettings: { timeZone: 'America/New_York' },
});

console.log(chart.planets.sun.zodiacPosition.sign);
console.log(chart.houses.ascendant.sign);
console.log(chart.sect); // "diurnal" | "nocturnal"
```

### Ifa

```typescript
import { calculateOdu } from 'kaabalah/ifa';

const odu = calculateOdu(new Date('1990-01-15'));

console.log(odu.north, odu.south, odu.east, odu.west, odu.center);
```

### Semantic (occult theme search)

```typescript
import { getTarotThemeProfile, tokenizeOccultThemeText } from 'kaabalah/semantic';

// Lookup by card number, name, filename, or path slug
const profile = getTarotThemeProfile(1); // The Magician
console.log(profile?.keywords);
console.log(profile?.correspondences.planets);

// Tokenize free text for search indexing
const tokens = tokenizeOccultThemeText('transformation and hidden power');
console.log(tokens);
```

### Visual (Tree of Life SVG)

```typescript
import { generateTreeSvg, getTreeRenderModel } from 'kaabalah/visual';

// Basic colored tree
const svg = generateTreeSvg({
  palette: 'color',
  system: 'kaabalah',
});

// Render model for interactive overlays: hit targets, tooltip anchors,
// canonical colors, and geometry — all in SVG viewBox units
const model = getTreeRenderModel();
const kether = model.sphereById['sphere:Kether'];
console.log(kether.geometry.viewBoxUnits.hitTarget);  // { kind: 'circle', cx, cy, r }
console.log(kether.geometry.viewBoxUnits.anchor);      // { x, y, vertical: 'below' }
console.log(kether.canonicalColor);                    // '#cccccc'
console.log(kether.material.kind);                     // 'special'
```
