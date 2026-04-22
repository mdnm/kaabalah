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
- **Master numbers**: special values (often `11`, `22`, `33`) preserved by some methods.
- **Synthesis**: the full sum before (or alongside) reduction.

When you build UI:

- Show both `originalSum` and `reducedValue`.
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
- **House system**: the algorithm used (Placidius, Whole Sign, etc.).
- **Time zone**: the most common source of errors.

Practical tip:

- Always store the original local time + IANA time zone.
- Convert consistently before calling `getBirthChart`.

### Tarot

- **Deck**: the full list of cards.
- **Major arcana**: archetypal "big" cards.
- **Minor arcana**: suit-based cards.
- **Spread**: the set of drawn cards (and sometimes positions).

Practical tip:

- Treat tarot draws as random sampling.
- Persist the RNG seed if you want reproducible readings.

### Ifa

- **Odu**: symbolic numbers used in Ifa divination.
- This module derives Odu values from a date.

Practical tip:

- Treat this like a deterministic "daily signature" for a given date.

### Core (Tree of Life)

- **Tree of Life**: a graph of nodes (spheres, paths, correspondences).
- **Sphere (sephirah)**: one of the 10 main nodes.
- **Path**: a connection between spheres.
- **Correspondence**: any linked concept (planet, element, tarot card, etc.).

Practical tip:

- Use `TreeOfLife` when you want cross-module linking.
