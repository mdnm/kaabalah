---
status: accepted
supersedes:
  - ADR-0003
  - astrology-wheel portions of ADR-0002
---

# Thin astrology wheel renderer

The astrology wheel should be a conventional static SVG renderer, not a public layout engine. `kaabalah-lib` owns the `BirthChart` math, glyph assets, fixed house cusps, true position ticks, aspect line drawing, and modest glyph spacing; app-specific interaction, arbitrary multi-chart composition, and rich custom-renderer geometry belong outside the astrology wheel API.

## Considered Options

- **Keep the render-model-first wheel** - consistent with Tree/Archeometer, but turns the astrology wheel into a brittle layout engine with Position Rails, Boundary Notches, and public geometry guarantees that are not needed.
- **Expose visual primitives only** - simpler, but would leave no supported default chart output for docs, CLI, exports, or previews.
- **Use a thin conventional SVG renderer** - keeps a useful built-in chart while limiting the library to stable visual responsibilities.

## Decision

The built-in astrology wheel renderer will be single-chart focused and glyph-first by default. It may spread crowded glyphs angularly using fixed true ticks and short connectors, borrowing from Astrolog's mature true-position conventions, Kerykeion's simple SVG layering, and Stellium's bounded displacement ideas. It will not use Boundary Notches or Position Rails as core concepts, and `getAstroWheelRenderModel()` is removed from the public astrology wheel API.

## Consequences

- ADR-0003 is superseded.
- ADR-0002 remains useful for Tree/Archeometer-style surfaces, but no longer requires the astrology wheel to expose full renderer-independent layout geometry.
- `pointGroups`/`aspectGroups` are removed from the public astrology wheel API; transit/synastry calculations stay in `kaabalah/astrology`.
- Default SVG output should be glyph-first. Degree/minute/retrograde labels may remain optional compact SVG features.
- Tests should stress conventional SVG invariants: no `NaN`, fixed cusps, true tick/aspect geometry, bounded glyph displacement, and readable dense clusters.
