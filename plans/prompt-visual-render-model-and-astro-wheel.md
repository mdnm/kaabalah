Implement the accepted visual render-model contract and replace the astrology wheel inline planet-label layout with the new Planet Band / Position Rail model.

Read first:
- AGENTS.md
- CONTEXT.md, especially Visual Render Model, House Cusp, House Boundary Envelope, Planet Band, Boundary Notch, and Position Rail
- docs/adr/0002-render-model-first-visuals.md
- docs/adr/0003-astrology-wheel-planet-band-layout.md
- docs/internal/handoff.md, but treat the new ADRs as superseding the older inline-label and compatibility notes

Primary files:
- src/visual/astro-wheel.ts
- src/visual/astro-wheel.test.ts
- src/visual/archeometer.ts
- src/visual/tree.ts
- src/visual/index.ts
- docs/src/content/docs/modules/visual.mdx

Non-negotiable decisions:
- SVG is not the layout API. SVG generators project render models.
- Tree of Life should keep exposing stable geometry, anchors, hit targets, and activation state.
- Archeometer must expose per-element geometry, anchors, and hit targets instead of computing all item positions inside SVG helpers.
- Astrology wheel planet house membership comes from true longitude against exact house cusps.
- Planet glyph display position may move, but exact true anchors, ticks, and aspect endpoints do not move.
- Aspect lines connect true anchors, not displaced glyphs.
- Inline planet labels are replaced entirely; do not keep a legacy inline-label mode.
- Planet glyphs stay in a stable Planet Band and preserve zodiacal order.
- Position details live in independent rails for degree, sign, minutes, and retrograde.
- Rail visibility is programmable. The app owns hover/tap/reveal state; the library exposes model hooks and visibility controls.
- Boundary Notches are local to the Planet Band and are triggered only by glyph/cusp conflicts, not by text labels.

Implementation checklist:

1. Baseline and drift check
   - Run `git status --short`.
   - Read the current `AstroWheelRenderModel`, `buildPointLayer`, `solveCircularLabelAngles`, aspect-line construction, Tree render model, and Archeometer render model before editing.
   - Preserve unrelated user changes. Do not rewrite generated docs assets unless the docs build requires it.

2. Establish the visual render-model contract
   - Introduce small shared visual primitives only if they reduce duplication: layer identity, viewBox geometry, anchors, hit targets, visibility state.
   - Keep module-specific types explicit where the domains differ.
   - Make sure each visual model exposes enough data for React, Canvas, or custom SVG renderers without parsing generated SVG.

3. Upgrade Archeometer render model
   - Keep existing ring/data/palette output.
   - Add computed per-element geometry for utterance points, triangles, triangle labels, musical notes, zodiac signs, planetary points, degree ticks/labels, rays, and center where applicable.
   - Include stable element ids/data keys, layer ids, anchors, and hit targets.
   - Refactor SVG helpers to consume computed model geometry instead of recomputing equivalent coordinates internally.
   - Add focused tests proving custom renderers can locate important Archeometer elements from the model.

4. Keep Tree aligned
   - Verify `getTreeRenderModel()` already exposes layer order, stable ids, geometry, anchors, hit targets, and activation state.
   - Only adjust Tree types/docs if needed to align with the shared contract. Avoid churn in Tree rendering behavior.
   - Keep existing Tree tests green.

5. Redesign astrology wheel point model
   - Split each planet point into true geometry and display geometry:
     - true longitude
     - true radial anchor/tick position
     - displayed glyph angle/position
     - optional connector geometry
     - true house id and house-cusp relationship
   - Add rail geometry for degree, sign, minutes, and retrograde.
   - Add model-level rail visibility controls and presets suitable for rich static SVG and compact app surfaces.
   - Expose point hit targets and stable keys for app hover/tap state.

6. Replace inline labels with Position Rails
   - Remove the old inline degree/sign/minute label placement as the default and only point-label system.
   - Render degree/sign/minute/retrograde details from rail geometry.
   - Ensure hidden rails do not alter glyph placement or house membership.
   - Keep glyph-only output clean and readable.

7. Implement house-aware glyph spacing
   - Preserve zodiacal order inside dense clusters.
   - Cap glyph displacement by house context.
   - Keep true ticks/anchors exact.
   - Add connector geometry when display glyph position differs materially from true anchor.
   - If a glyph visually crosses or crowds a cusp, create a local Boundary Notch only in the Planet Band.
   - Do not notch for text bounds alone.

8. Keep aspect geometry truthful
   - Refactor aspect line construction to connect true planet anchors.
   - Add tests that aspect endpoints do not change when glyphs are displaced or rails are hidden.

9. Update SVG generation
   - Make `generateAstroWheelSvg()` project the render model.
   - Use model layers, point glyphs, rails, notches, connectors, hit targets, and visibility flags.
   - Do not duplicate layout math inside SVG rendering helpers.

10. Tests
   - Add dense-cluster tests with planets near each other.
   - Add cusp-adjacent tests proving house membership stays true and only Planet Band notches.
   - Add rail visibility tests for full, compact, glyph-only, and selected/revealed point details.
   - Add true-anchor versus display-position tests.
   - Add aspect endpoint tests.
   - Add Archeometer render-model geometry tests.
   - Run `npx vitest run src/visual`.

11. Docs
   - Update `docs/src/content/docs/modules/visual.mdx` to document:
     - Visual Render Model principle
     - Tree render model
     - Archeometer render model geometry
     - Astro Wheel true anchors versus displayed glyphs
     - Position Rails and rail visibility
     - compact/static usage examples
   - Keep docs concise and API-focused.

12. Verification
   - Run `npm run typecheck`.
   - Run `npx vitest run src/visual`.
   - Run `npm run build`.
   - Run `git diff --check`.

Done criteria:
- All visual SVG renderers have matching render-model functions that expose geometry needed by custom renderers.
- Archeometer item geometry is available from `getArcheometerRenderModel()`.
- Astrology wheel no longer uses inline planet labels.
- Planet rails can be hidden/shown programmatically without changing true geometry.
- Dense clusters preserve order and stay visually tied to the true house.
- Boundary Notches are local to the Planet Band only.
- Aspect lines connect true anchors.
- Tests and docs cover the new contract.

STOP and report if:
- Existing public chart data lacks stable keys needed to map displayed points back to source planets.
- A house-aware spacing rule would require changing actual house membership calculation.
- Archeometer geometry refactor becomes a full visual redesign instead of exposing the existing geometry.
- A shared visual abstraction starts forcing awkward domain-specific casts or weakening the Tree model.