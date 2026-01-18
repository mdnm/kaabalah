# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run build          # Build with tsup (outputs CJS + ESM)
npm run dev            # Build in watch mode
npm run test           # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report
npm run test:ui        # Run tests with visual UI
```

To run a single test file:
```bash
npx vitest run src/path/to/file.test.ts
```

## Architecture Overview

Kaabalah is a TypeScript library for esoteric calculations (numerology, astrology, kabbalah, gematria, tarot, Ifá). It exports **7 tree-shakable modules** that can be imported independently:

```
kaabalah/core       - Tree of Life graph structure with correspondences
kaabalah/numerology - Life path, cycles, challenges, personal year calculations
kaabalah/astrology  - Birth charts via Swiss Ephemeris WASM
kaabalah/gematria   - Hebrew text numerology
kaabalah/tarot      - 78-card deck with meanings and shuffling
kaabalah/ifa        - Ifá divination (Odu calculations)
```

### Core Module (`src/core/`)

The foundation of the library. `TreeOfLife` is a graph structure that maps correspondences across esoteric systems (Kabbalah spheres/paths, zodiac signs, planets, tarot cards, Hebrew letters, etc.).

Key patterns:
- **Branded NodeIds**: `NodeId<T>` uses branded types for type-safe node references. Use `id(type, value)` to create and `parseId(nodeId)` to extract values.
- **Factory pattern**: `createTree({ system, parts })` creates configured instances
- **Systems**: "kaabalah" | "hermetic-qabalah" | "lurianic-kabbalah"
- **Parts**: Optional modules like "westernAstrology", "tarot" loaded via registry

### Astrology Module (`src/astrology/`)

Uses Swiss Ephemeris compiled to WebAssembly. Requires environment variables for tests:
- `WASM_PATH` - Path to swisseph.wasm
- `EPHE_PATH` - Path to ephemeris data files

The WASM files are in `wasm/build/` and ephemeris data in `ephe/`.

### Numerology Module (`src/numerology/`)

All reduction functions support master number preservation (11, 22, 33, 44). The `reduceToSingleWithSteps()` function tracks reduction steps for transparency.

### Type System

Node types are organized by category:
- `KaabalahTypes`: Sphere, Path, World
- `WesternAstrologyTypes`: Planets, Zodiac, Elements, Houses, Aspects
- `TarotTypes`: MajorArkanum, MinorArkanum, Suits
- `NumerologyTypes`: Numbers (includes master numbers)
- `LetterTypes`: Hebrew, Latin, Sanskrit, Vattan

## Testing

Tests are colocated with source files (`*.test.ts`). Framework is Vitest with V8 coverage.
