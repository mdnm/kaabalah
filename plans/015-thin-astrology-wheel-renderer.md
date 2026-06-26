# Plan 015: Thin astrology wheel renderer

## Goal

Replace the astrology wheel's layout-engine direction with a thin, conventional static SVG renderer. The renderer should keep the best visual conventions from Astrolog, Kerykeion, and Stellium without making `kaabalah-lib` responsible for arbitrary custom chart layout.

## User Agreements

- `kaabalah-lib` astrology visuals should be a **Thin Renderer**, not a full layout engine.
- `getAstroWheelRenderModel()` should be removed for astrology wheel use.
- The built-in SVG should remain a conventional static chart for docs, CLI, exports, and app previews.
- Crowded planets should use true ticks plus bounded angular glyph spreading, with short connectors only when useful.
- Default output should be glyph-first; degree/minute/retrograde labels should be optional compact details.
- House cusps stay fixed. Do not bend house boundaries with Boundary Notches.
- The built-in renderer should be single-chart focused. Transit/synastry calculations stay in `kaabalah/astrology`, not arbitrary visual layer composition.
- This can be a breaking cleanup.

## Read First

- `AGENTS.md`
- `CONTEXT.md`, especially `Astrology Wheel Renderer`, `House Cusp`, `Planet Band`, `Boundary Notch`, `Position Rail`, and `Visual Render Model`
- `docs/adr/0004-thin-astrology-wheel-renderer.md`
- `docs/adr/0002-render-model-first-visuals.md` and `docs/adr/0003-astrology-wheel-planet-band-layout.md` as superseded context for astrology wheel work
- `docs/internal/handoff.md` for the earlier reference-library findings
- `src/visual/astro-wheel.ts`
- `src/visual/astro-wheel.test.ts`
- `docs/src/content/docs/modules/visual.mdx`

## Reference Patterns To Keep

- **Astrolog**: true-position ticks remain authoritative; display glyphs may move; connectors make displacement explicit; dense charts should still read as astrology charts.
- **Kerykeion**: simple SVG layering and low ceremony for common chart rendering; avoid exposing complex layout internals as the user-facing API.
- **Stellium**: bounded angular spreading is useful, but only as an implementation detail for a static chart, not as a public layout engine.

## Implementation Plan

1. Baseline current behavior.
   - Run `git status --short`.
   - Run `npx vitest run src/visual/astro-wheel.test.ts`.
   - Generate representative SVGs for normal, clustered, cusp-adjacent, and aspect-heavy charts before changing behavior.

2. Reset the public contract.
   - Update docs so `generateAstroWheelSvg()` is the supported astrology visual API.
   - Remove `getAstroWheelRenderModel()`, `AstroWheelRenderModel`, `AstroWheelPointLayerInput`, `AstroWheelAspectLayerInput`, and Boundary Notch public API from astrology wheel use.
   - Keep Tree and Archeometer render-model language scoped to those surfaces.

3. Simplify the renderer API.
   - Keep options for size, viewBox, background, palette, zodiac, houses, points, aspects, excluded bodies, and simple layout tuning.
   - Remove or replace arbitrary `pointGroups` / `aspectGroups` composition.
   - Keep the built-in wheel single-chart focused.

4. Replace layout-engine concepts with conventional chart behavior.
   - Remove Boundary Notch generation and rendering.
   - Remove Position Rail as a public model concept.
   - Keep fixed house cusps and true zodiac ticks.
   - Preserve aspect endpoints at true positions.

5. Implement glyph-first crowding behavior.
   - Place glyphs on a conventional planet ring.
   - Spread crowded glyphs angularly while preserving zodiacal order.
   - Cap displacement with a simple, documented default.
   - Draw short connectors only when displacement is large enough to matter.
   - Keep degree/minute/retrograde labels optional and compact.

6. Stress test the thin renderer.
   - Add generated chart fixtures for dense stelliums, identical longitudes, cusp-adjacent planets, high aspect counts, and small viewBoxes.
   - Assert no `NaN`/`undefined`, fixed cusps, bounded displacement, stable ordering, aspect endpoints on true positions, and SVG output inside the viewBox.
   - Prefer invariant tests and SVG snapshots over public geometry-model tests.

7. Update docs and migration notes.
   - Explain that `kaabalah/astrology` owns calculations and `kaabalah/visual` owns a conventional static SVG projection.
   - Document glyph-first defaults and optional compact labels.
   - Document the removed render-model and multi-layer astrology APIs as a breaking cleanup.

8. Verify.
   - Run `npm run typecheck`.
   - Run `npx vitest run src/visual`.
   - Run `npm run build`.
   - Run `git diff --check`.

## Stop Conditions

- Stop if a consumer depends on `getAstroWheelRenderModel()` for production interaction and no migration path exists.
- Stop if removing multi-layer visual APIs would block a known app workflow that cannot use calculated chart data directly.
- Stop if a proposed simplification changes chart math, house membership, or aspect calculation.
- Stop if the renderer starts accumulating custom app interaction state; that belongs outside `kaabalah-lib`.
