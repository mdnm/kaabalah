# Handoff — Astro Wheel Rendering Improvements

**Date:** 2026-05-04
**Branch:** `main`

## Goal

Improve the astrology wheel SVG renderer (`src/visual/astro-wheel.ts`) — the owner is unhappy with spatial layout, missing features, and the clunkiness of the multi-layer API. This session was an interview/discovery phase only; no code changes were made.

## What Was Done

- Interviewed the project owner to identify pain points
- Researched three reference implementations for proven techniques:
  - **Astrolog** (`~/projects/astrology/Astrolog`) — C-based, iterative relaxation collision algorithm, dash-density for orb encoding
  - **Kerykeion** (`~/projects/astrology/kerykeion`) — Python SVG, single-pass greedy collision spread, `stroke-dasharray` trick for degree ticks
  - **Stellium** (`~/projects/astrology/stellium`) — Python `svgwrite`, force-based iterative collision with 20° max displacement cap, configurable degree label formats

## Interview Findings

**Important caveat:** The owner was testing the interview process itself, so answers should be treated as directional signals, not hard requirements. Validate with the owner before committing to any specific approach.

### Spatial / Layout Issues

1. **Ring proportions are off overall.** Current hardcoded fractions in `buildRings()` (line ~2160): `houses: 8fr, zodiac: 14fr, planets: 22fr, aspects: 56fr`. Owner wants:
   - Bigger aspect circle (more inner space for aspect lines to breathe)
   - More room for the planet ring
   - Better defaults AND configurable ring widths (expose as options)

2. **Collision resolution needs rethinking.** Current approach uses `solveCircularLabelAngles()` + leader lines to displaced glyphs. Owner prefers:
   - **Angular spread** on the same ring (no leader lines)
   - **Readability first** — spread as much as needed; tick marks on the zodiac ring show true longitude
   - Reference: Astrolog's iterative relaxation (`FillSymbolRing` in `xcharts2.cpp`) and Stellium's force-based approach with 20° max cap are both good models

### Missing Features

3. **Degree ticks on zodiac band** — ruler-style: small ticks every 5°, bolder ticks every 10°. NOTE: the current code already renders 1° ticks (line ~778-813) but the owner may not have seen this or wants different styling. The existing tick code draws every 1° with sign-boundary/10°/5°/1° hierarchy — verify whether this is a "change the style" or "I didn't know it existed" situation.

4. **Retrograde indicators** — Rx symbol or visual marker on retrograde planets. The `retrograde` field already exists on `AstroWheelPoint` (line ~220) but nothing renders it visually in the SVG output.

5. **Degree labels on planet glyphs** — configurable format (degree+sign glyph, degree+minute, full DMS). `zodiacPosition` is already on each point but not rendered.

### SVG Output Quality

6. **Aspect lines too cluttered** — need orb-based opacity (tighter orb = more opaque, wider orb = more transparent). The current `buildAspectLayer` already computes opacity but the owner feels the defaults need tuning. Aspect filtering is consumer-controlled via `aspectSpecs`/`edges` — that's fine, just needs better defaults.

7. **Glyph rendering mode** — should be configurable per element category: vector paths (from `astro-glyph-assets`) vs Unicode `<text>`. Currently uses vector paths via the glyph registry.

8. **House cusp line style** — should be configurable: full lines through center, short marks only, or angles-full/cusps-short. Currently cusps run from house ring inner to outer boundary only.

### API Surface

9. **Multi-layer system too clunky** — `pointLayers`/`aspectLayers` is over-engineered for single-chart use. Needs a simpler API for the common case while still supporting multi-chart overlays.

## Key Reference Implementation Patterns

| Technique | Astrolog | Kerykeion | Stellium |
|---|---|---|---|
| **Collision** | Iterative relaxation, `nDivision*2` passes, nudge by `orb*0.51 + gap*0.49` | Single-pass greedy from largest gap, `min_sep` 8°/10° | Force-based, 50 iterations, 2°/iter, 20° max displacement |
| **Degree ticks** | Per-degree loop: 1° short, 5° medium, 10° colored | `stroke-dasharray` on 3 circles (360/72/36 segments) | Inward from zodiac: 10°/20° long, 5°/15°/25° medium, 1° optional |
| **Retrograde** | Gray dashed connector line + Rx character near degree label | Color switch to `#c43a5e` + "RX" text below minutes | Color switch only (`retro_color`) |
| **Degree labels** | Two rows at `rz±0.03`: degrees° and minutes' | Vertical stack: glyph→deg→sign→min→RX | Three-row info stack: deg→sign→min, 4 format modes |
| **Cusp lines** | Angles: full solid through center; others: short tick + faint dashed line | Angles: `stroke-width=0.6`; others: `0.07` | Configurable solid/dashed per layer |
| **Multi-chart** | N/A (single chart focused) | Flat dual-ring, shared cusps, aspect core shrinks | `MultiWheel` with N charts, ring radii by `chart{N}_*` namespace |

## Known Issues / Open Items

- Owner's answers are **directional, not final** — he was testing the interview skill itself
- Degree ticks already exist in the code (line 778-813) — clarify if owner wants style changes or didn't realize they exist
- The `solveCircularLabelAngles` function (used for collision resolution) should be studied before ripping it out — it may already do angular spread; the leader lines might be a secondary constraint-based fallback
- No visual mockup or target rendering exists — the owner is designing toward "my own ideal"

## Next Steps

1. **Re-confirm findings with the owner** — show this handoff, ask which items are highest priority and which answers were "testing the process" vs real preferences
2. **Start with ring proportions** — it's the simplest change (just `buildRings` fr values) and immediately visible
3. **Implement angular spread collision** — replace or adapt `solveCircularLabelAngles`, remove leader lines, study Astrolog's relaxation and Stellium's force-based approaches
4. **Add missing features** — retrograde indicator, degree labels, then degree tick refinement (in that order, since ticks already partially exist)
5. **Aspect opacity tuning** — adjust the orb-to-opacity curve
6. **API simplification** — simplify the layer system for single-chart use last (it's the riskiest refactor)

## Files Changed

No code changes this session. Key files for the next agent:

- `src/visual/astro-wheel.ts` — the main renderer (~2200 lines), everything lives here
- `src/visual/astro-glyph-assets.ts` — vector path definitions for glyphs
- `src/visual/astro-glyph-registry.ts` — glyph lookup (`ZODIAC_GLYPHS`, `PLANET_GLYPHS`, `ANGLE_GLYPHS`)
- `src/visual/astro-glyph-types.ts` — type definitions for glyphs
- `~/projects/astrology/Astrolog/` — reference: `xcharts0.cpp`, `xcharts1.cpp`, `xcharts2.cpp`
- `~/projects/astrology/kerykeion/kerykeion/charts/draw_modern.py` — reference
- `~/projects/astrology/stellium/` — reference: `core.py`, planet/zodiac/cusp layers
- `AGENTS.md` — project-wide context, build commands, gotchas
