---
title: API Reference
description: Detailed API documentation for all Kaabalah modules
sidebar:
  order: 1
---

## Modules

| Module | Description |
| ------ | ----------- |
| [Numerology](/modules/numerology/) | Calculate life path numbers, cycles, challenges, and other numerological values |
| [Gematria](/modules/gematria/) | Calculate Hebrew gematria values for names and words, with reverse gematria lookup |
| [Astrology](/modules/astrology/) | Generate birth charts and planetary positions using Swiss Ephemeris |
| [Tarot](/modules/tarot/) | 78 tarot cards with meanings, spreads, and interpretations |
| [Ifa](/modules/ifa/) | Calculate Odu numbers based on dates for Ifa divination |
| [Core](/modules/core/) | Tree of Life system for building correspondences across different esoteric systems |

## TypeDoc

For complete TypeScript API documentation, generate TypeDoc:

```bash
cd kaabalah-lib
npx typedoc --out docs/api src/index.ts
```
