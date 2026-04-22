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
import { ARKANNUS, shuffleTarotDeck } from 'kaabalah/tarot';

const shuffled = await shuffleTarotDeck(ARKANNUS, true);
const spread = shuffled.slice(0, 3);

console.log(spread.map((c) => c.tarotCard));
```

### Astrology (birth chart)

```typescript
import { getBirthChart, HouseSystem } from 'kaabalah/astrology';

const chart = await getBirthChart({
  // Local time
  date: new Date(1990, 5, 15, 12, 30, 0),
  latitude: 40.7128,
  longitude: -74.0060,
  houseSystem: HouseSystem.PLACIDUS,
  timeZoneSettings: { timeZone: 'America/New_York' },
});

console.log(chart.planets.sun.longitude);
console.log(chart.houses.ascendant.longitude);
```
