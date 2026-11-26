---
title: Features
description: Overview of Kaabalah library features
sidebar:
  order: 5
---

## Features

### Core — Tree of Life

A typed graph structure that maps correspondences across esoteric systems: Kabbalistic spheres and paths, western astrology, tarot cards, Hebrew letters, and more.

- One system: `kaabalah`, the Tree as taught by the Melkitzedeki Order
- Opt-in parts: `westernAstrology`, `tarot`
- Branded `NodeId<T>` types for type-safe graph traversal
- Factory pattern: `createTree({ system, parts })`
- Portuguese descriptions: `getTreeDescription`, `getTreeNodeDescriptions`
- Sphere profiles, path profiles and Tree sections in plain words: `getSphereProfile`, `getPathProfile`, `getTreeSection`

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
- English and Portuguese meaning tables: `getNumerologyData`
- **Dated schedules** from civil dates (`"YYYY-MM-DD"`, no timezone handling): `getNumerologySnapshot` (as-of) and `generateNumerologyTimeline` (bounded ranges) over personal years, months and periods, 52-day heptads, seven-year cycles, Fibonacci cycles, calendar-frame year/month/day, pinnacles, challenges and life periods, with method identities, short-month policies and clipped versus nominal intervals
- **Partial birth dates** (month/day, year/month, year, unknown) with structured unavailability and candidate summaries that never select a date

### Astrology

Birth chart computation via Swiss Ephemeris compiled to WebAssembly.

- **Birth charts**: planets, houses (11 systems including Placidus, Whole Sign, Koch, etc.), aspects, sect from the physical horizon (identical in every house system), Lots of Fortune and Spirit, Moon phase (approximate illumination label)
- **Synastry**: cross-chart aspects between two birth charts
- **Composite and Davison charts**: midpoint planets, angles and houses with documented antipodal and whole-sign conventions, and real charts cast for the midpoint time and place
- **Transits**: single snapshot or date-range mode with verified exact events (signed-angle roots, stations, residuals) and separate closest approaches
- **Returns**: solar returns solved to 0.001 s, Saturn/Jupiter/nodal/lunar returns and Uranus opposition with all passes, return-pass timelines
- **Progressions**: secondary progressions and solar arcs with declared time keys and angle conventions
- **Profections**: annual and monthly (whole-sign)
- **Firdaria**: major and sub-periods with sect detection, bounded timelines
- **Jyotish**: Dhruva (equatorial) and Lahiri nakshatras, chara karakas, Vimshottari and Yogini dashas
- **Astro\*Carto\*Graphy**: full map (MC/IC/AC/DC lines) and location query with paran crossings
- **Aspects engine**: `computeAspects`, `computeSynastryAspects`, configurable orbs
- **Essential dignity**: domicile, exaltation, detriment, fall, peregrine, plus degree- and sect-aware Dorothean triplicity, Egyptian bounds and face lords
- **Orb policies**: per-body-class orbs resolved at generation time, motion, axis-aware counts
- **Input quality**: recorded, rectified, untimed and partial charts with explicit provenance
- **Collections**: all-pairs and selected-pairs manifests computed from one chart per person, with streaming, progress and cancellation
- **Cache keys, capabilities, ephemeris provenance and strict mode**
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
- English and Portuguese meaning tables: `getGematriaData`

### Tarot

Full 78-card deck with rich metadata.

- 22 Major Arcana + 56 Minor Arcana (`ARKANNUS` array)
- Card shuffle and draw: `shuffleTarotDeck`
- Card lookup by number, name, or filename: `getTarotCardByNumber`, `getTarotCardProfile`
- Per-card archetypes (path correspondence, Hebrew letter): `getTarotArchetype`
- Correspondence profiles (planets, signs, elements, spheres, paths): `getTarotCorrespondenceProfile`
- Multi-deck image support (`papus`, `papus_pt`, `mythic`, `egyptian`, `rider-waite`): `resolveTarotImageUrl`
- Spread engine: `listTarotSpreads`, `getTarotSpread`, `validateTarotSpreadSelection`, `drawTarotSpread`, and `drawConsciousTarotSpread` (you choose the position in each slot's pool)
- Brazilian Portuguese card names, deck meanings, and spread labels through a `language` argument
- Deck and tree metadata: `listTarotDecks`, `listTarotTrees`

### I Ching

64 hexagrams from six stored lines.

- Reading from lines, or from a hexagram number plus moving lines: `getIChingReading`
- Classical Chinese and literal English for the judgment, the image, and the lines
- Plain-language descriptions in English and Portuguese: `getHexagramDescription`
- Portuguese renderings of all 514 classical texts: `getHexagramText`, `getIChingReadingContent`, `formatRecordContent`
- Nuclear figure, palace, 納甲, 六親, 世/應, and line transforms in both palaces
- Kaabalah gate, family sphere, ruling Ark Annu, and pillars
- Sovereign months (十二辟卦), without guaqi day assignments
- Coin casting with an injectable RNG: `castThreeCoins`
- Three CLI commands (`iching:reading`, `iching:hexagram`, `iching:cast`), all with `--language pt-BR`

### Ifa

Ifa divination from a date.

- Calculates Odu numbers (north, south, east, west, center) from a date
- Deterministic — same date always returns the same values
- Portuguese calculation labels: `getIfaText`

### Semantic

Occult theme profiles for NLP, search, and content tagging.

- `listTarotThemeProfiles` / `getTarotThemeProfile`: rich keyword, alias, and correspondence data for all 78 cards — useful for full-text search indexing
- `listHouseThemeProfiles` / `getHouseThemeProfile`: theme data for all 12 astrological houses
- `tokenizeOccultThemeText`: tokenizer that normalizes and strips stopwords from occult text
- Reading connections: `resolveCard`, `buildReadingWeights`, `buildThreads` combine tarot, I Ching and astrology into Tree weights and connections
- Reading reference: `getReadingReference` and the eleven-step descent (`DESCENT_ORDER`, `getDescentStep`), in English and Portuguese
- Kaabalistic overlays: `getKaabalisticCorrespondenceTargets`, `buildKaabalisticMapData` and the astrology, numerology and gematria marker builders, plus planet, sign, angle and node symbol metadata

### Visual

SVG generation and interactive render model for the Tree of Life.

- `generateTreeSvg`: fully rendered Tree of Life SVG with spheres, paths, and 3D material (iridescent, crystal, yin-yang, quartered treatments for special spheres)
- Configurable palette (`color`, `monochrome`, or custom), viewbox, Daath layer, highlights, and activations
- `getTreeRenderModel`: returns the canonical viewBox, sphere/path geometry in SVG units, hit target circles/lines, tooltip anchor points, canonical colors, and material metadata — everything needed for interactive overlays
- `getTreeLayout`: returns the coordinate layout for custom rendering
- `generateAstroWheelSvg`: birth-chart wheel SVG; `generateAstroGlyphSvg` / `getAstroGlyph` / `listAstroGlyphs`: planet, sign, aspect, and angle glyphs
- `generateArcheometerSvg` / `getArcheometerRenderModel`: Archeometer diagram and render model
- `getRouteActivations`: activations for the lightning and serpent routes
- Highlights with `specialSphereMode: 'plain'` selectively flatten only highlighted special spheres to plain circles — unhighlighted special spheres keep their full material

### Portuguese (pt-BR)

Display text is available in Brazilian Portuguese through an optional `language` argument (`'pt-BR'`) on tarot, I Ching, numerology, gematria, Tree of Life, astrology label, Ifa, and semantic functions, and through `--language pt-BR` in the CLI. Identifiers, keys, and calculations never change. See [Portuguese text](/guides/localization/).

### CLI

A full command-line interface exposing all modules.

- All commands support `--json`, `--compact`, `--fields`, `--input-json`, `--quiet`, and `--language pt-BR`
- TTY auto-detection: JSON mode enabled automatically when piped
- Calculations are deterministic; the exceptions are random draws (`tarot`, `tarot:spread --spread-id`, `iching:cast`), geocoding, and commands that default to today's date or year
- Strict date validation: impossible dates such as `2026-02-30` exit with `INVALID_DATE`
- Machine-readable schema with `kaabalah help --json`, config files, and environment variables
- See the [CLI reference](/getting-started/cli/) for the full command list
