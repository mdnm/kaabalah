---
title: Features
description: Overview of Kaabalah library features
sidebar:
  order: 5
---

## Features

### Core — Tree of Life

A typed graph structure that maps correspondences across esoteric systems: Kabbalistic spheres and paths, western astrology, tarot cards, Hebrew letters, and more.

- Three built-in systems: `kaabalah`, `hermetic-qabalah`, `lurianic-kabbalah`
- Opt-in parts: `westernAstrology`, `tarot`
- Branded `NodeId<T>` types for type-safe graph traversal
- Factory pattern: `createTree({ system, parts })`

### Numerology

Full numerological profile from a birth date.

- Kaabalistic life path (block-based reduction — produces more master numbers)
- Straight-across reduction life path
- Challenges: main challenge, sub-challenge 1 and 2
- Personal year, personal months, and personal periods
- Fibonacci cycle
- Heptad age cycles and monthly cycles
- Soul number (from name vowels via gematria)
- Master number preservation (`11`, `22`, `33`, `44`)

### Astrology

Birth chart computation via Swiss Ephemeris compiled to WebAssembly.

- **Birth charts**: planets, houses (11 systems including Placidus, Whole Sign, Koch, etc.), aspects, sect (diurnal/nocturnal), Pars Fortunae
- **Synastry**: cross-chart aspects between two birth charts
- **Composite charts**: midpoint planets and houses with aspects
- **Transits**: single snapshot or date-range mode with binary-search perfection dates
- **Solar returns**: exact moment the Sun returns to its natal longitude
- **Profections**: annual and monthly (whole-sign)
- **Firdaria**: major and sub-periods with sect detection
- **Astro\*Carto\*Graphy**: full map (MC/IC/AC/DC lines) and location query with paran crossings
- **Aspects engine**: `computeAspects`, `computeSynastryAspects`, configurable orbs
- **Essential dignity**: domicile, exaltation, detriment, fall, peregrine
- **Decans**: Chaldean ruler + Golden Dawn tarot correspondence per decan
- **Dodecatemoria**: 12th-part sign placement

### Gematria

Hebrew numerology for Latin text.

- Letter-by-letter mapping through the Tree of Life
- Separate vowel, consonant, and synthesis totals
- Final-form (sofit) value support for word-ending letters
- Digraph handling (`Sh`, `Ph`, `Th`, etc.)
- Missing gematria values detection
- Reverse gematria: find letter combinations matching a target value (backtracking, anagram, and subsequence modes)

### Tarot

Full 78-card deck with rich metadata.

- 22 Major Arcana + 56 Minor Arcana (`ARKANNUS` array)
- Card shuffle and draw: `shuffleTarotDeck`
- Card lookup by number, name, or filename: `getTarotCardByNumber`, `getTarotCardProfile`
- Per-card archetypes (path correspondence, Hebrew letter): `getTarotArchetype`
- Correspondence profiles (planets, signs, elements, spheres, paths): `getTarotCorrespondenceProfile`
- Multi-deck image support (`papus`, `papus_pt`, `mythic`, `egyptian`, `rider-waite`): `resolveTarotImageUrl`
- Spread engine: `listTarotSpreads`, `getTarotSpread`, `validateTarotSpreadSelection`, `drawTarotSpread`
- Deck and tree metadata: `listTarotDecks`, `listTarotTrees`

### Ifa

Ifa divination from a date.

- Calculates Odu numbers (north, south, east, west, center) from a date
- Deterministic — same date always returns the same values

### Semantic

Occult theme profiles for NLP, search, and content tagging.

- `listTarotThemeProfiles` / `getTarotThemeProfile`: rich keyword, alias, and correspondence data for all 78 cards — useful for full-text search indexing
- `listHouseThemeProfiles` / `getHouseThemeProfile`: theme data for all 12 astrological houses
- `tokenizeOccultThemeText`: tokenizer that normalizes and strips stopwords from occult text

### Visual

SVG generation and interactive render model for the Tree of Life.

- `generateTreeSvg`: fully rendered Tree of Life SVG with spheres, paths, and 3D material (iridescent, crystal, yin-yang, quartered treatments for special spheres)
- Configurable palette (`color`, `monochrome`, or custom), viewbox, Daath layer, highlights, and activations
- `getTreeRenderModel`: returns the canonical viewBox, sphere/path geometry in SVG units, hit target circles/lines, tooltip anchor points, canonical colors, and material metadata — everything needed for interactive overlays
- `getTreeLayout`: returns the coordinate layout for custom rendering
- Highlights with `specialSphereMode: 'plain'` selectively flatten only highlighted special spheres to plain circles — unhighlighted special spheres keep their full material

### CLI

A full command-line interface exposing all modules.

- All commands support `--json`, `--compact`, `--fields`, `--input-json`
- TTY auto-detection: JSON mode enabled automatically when piped
- Pure deterministic output for all commands except tarot shuffle and geocoding
- See the [CLI reference](/reference/cli/) for the full command list
