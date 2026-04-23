---
title: Concepts and Terminology
description: A quick glossary and mental model to use Kaabalah without prior esoterism knowledge.
sidebar:
  order: 6
---

This library computes _structured data_.

You decide how to interpret it in your app.

### Mental model

- **Module**: a domain of calculations (numerology, astrology, etc.).
- **Input**: usually a `Date`, a text, or birth data.
- **Result**: an object with values _and_ intermediate steps.

If you're new to esoterism, treat results like any other scoring system.

Show the numbers.

Then show a short explanation next to each.

### Numerology

- **Life path**: a number derived from birth date.
- **Reduction**: repeatedly summing digits until a small number.
- **Master numbers**: special values (`11`, `22`, `33`, `44`) preserved by some methods.
- **Synthesis**: the full sum before (or alongside) reduction.
- **Personal year / month**: cyclical numbers that shift over time.
- **Soul number**: derived from the vowels of a first name via gematria.

When you build UI:

- Show both `originalSum` (or `finalSynthesis`) and `reducedValue`.
- Show the reduction steps if you want transparency.

### Gematria

- **Gematria**: mapping letters to numeric values.
- **Vowels vs consonants**: computed separately in this library.
- **Final forms (sofit)**: some letters change value when at word end.
- **Reverse gematria**: search for letter strings that match a target value.

Practical tip:

- Normalize input (`trim`, `toUpperCase`) before calculations.

### Astrology

- **Birth chart**: planetary longitudes + house cusps for a moment and place.
- **Houses**: a way to split the sky into 12 sectors.
- **House system**: the algorithm used (Placidus, Whole Sign, Koch, etc.).
- **Sect**: whether the birth was diurnal (daytime) or nocturnal (nighttime).
- **Aspects**: angular relationships between planets (conjunction, square, trine, etc.).
- **Transit**: a current or future planet crossing a natal position.
- **Profection**: an annual timing technique that advances the Ascendant one house per year.
- **Firdaria**: a traditional planetary period system dividing life into major and sub-periods.
- **Solar return**: the chart cast for the exact moment the Sun returns to its natal longitude.
- **Astro\*Carto\*Graphy**: locational astrology — lines on a world map showing where natal planets were on the angles.
- **Time zone**: the most common source of errors.

Practical tip:

- Always store the original local time + IANA time zone.
- Use `LocalDateTimeParts` (`{ year, month, day, hour, minute }`) instead of a `Date` object to avoid browser-local-time ambiguity.

### Tarot

- **Deck**: the full list of 78 cards (`ARKANNUS`).
- **Major Arcana**: the 22 archetypal "big" cards (0–21).
- **Minor Arcana**: the 56 suit-based cards (Wands, Cups, Swords, Pentacles).
- **Spread**: the set of drawn cards and their positions.
- **Archetype**: the correspondence between a Major Arcana card and a Kabbalistic path, Hebrew letter, and astrological body.
- **Correspondence profile**: the full set of linked nodes (planets, signs, elements, spheres) for a card.

Practical tip:

- Treat tarot draws as random sampling.
- Store the drawn card IDs in your database — don't reshuffle on re-render.

### Ifa

- **Odu**: symbolic numbers used in Ifa divination.
- This module derives Odu values (north, south, east, west, center) from a date.

Practical tip:

- Treat this like a deterministic "daily signature" for a given date.

### Core (Tree of Life)

- **Tree of Life**: a graph of nodes (spheres, paths, correspondences).
- **Sphere (sephirah)**: one of the 10 main nodes.
- **Path**: a connection between spheres (22 paths).
- **Correspondence**: any linked concept (planet, element, tarot card, Hebrew letter, etc.).
- **NodeId**: a branded string (`"sphere:Kether"`, `"tarotArkAnnu:The Magician"`) used for type-safe lookups.
- **System**: the flavor of the tree (`kaabalah`, `hermetic-qabalah`, `lurianic-kabbalah`).
- **Parts**: optional modules that add more nodes (`westernAstrology`, `tarot`).

Practical tip:

- Use `createTree({ system, parts })` — not `new TreeOfLife()` directly.
- Use `id(type, value)` to construct a `NodeId` and `parseId(nodeId)` to extract the value.

### Semantic

- **Theme profile**: a pre-built object with keywords, aliases, and esoteric correspondences — for a tarot card or an astrological house.
- **Token surface**: the normalized word list used for full-text matching.

Practical tip:

- Index the `tokens` array in your search engine.
- Use `getTarotThemeProfile` to find a card by name, number, filename, or path slug.

### Visual

- **Tree SVG**: a rendered SVG of the Tree of Life with spheres, paths, 3D shading, and special sphere materials (iridescent, crystal, yin-yang, quartered).
- Choose a `palette` (`"color"` or `"monochrome"`) or pass a custom `TreeSvgCustomPalette`.
- **Highlights**: override specific sphere/path colors. `specialSphereMode: 'plain'` flattens only highlighted special spheres to standard circles — unhighlighted special spheres keep their full material. This lets you selectively mute inactive targets while preserving active ones.
- **Render model**: `getTreeRenderModel` returns the canonical viewBox, sphere/path geometry in SVG units, circular hit targets, tooltip anchor points (with vertical placement hints), and canonical color/material metadata. Use this to build interactive overlays that stay aligned with the base SVG.
- Use `getTreeLayout` if you want raw coordinate data for a fully custom renderer.
