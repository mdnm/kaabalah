# Render-model-first visual surfaces

Visual modules expose renderer-independent geometry before they generate SVG. The SVG output is a projection of the render model, not the source of layout truth. This applies to astrology wheels, Archeometer diagrams, and Tree of Life diagrams.

The Tree of Life renderer already mostly follows this direction through `getTreeRenderModel()`: it exposes stable sphere/path identities, geometry, anchors, hit targets, layer ordering, and activation state. The Archeometer renderer only partially follows it: `getArcheometerRenderModel()` exposes rings, palette, layer flags, and source data, but many per-element coordinates and interaction targets are still computed inside the SVG renderer. The astrology wheel has a render model, but planet label layout, connector behavior, and visibility controls are still too coupled to the generated SVG.

## Considered Options

- **Keep SVG as the primary integration surface** - simple for static image generation, but forces React, Canvas, and app-specific interaction layers to parse SVG or duplicate geometry.
- **Expose render models only where already convenient** - preserves current code shape, but makes each visual module feel different and leaves Archeometer and the wheel harder to customize.
- **Require every visual renderer to expose a Visual Render Model** - creates a consistent contract across visual modules. SVG generation becomes one consumer among others.

## Decision

Every exported visual SVG generator should have a matching render-model function that exposes the layout information required by custom renderers and interactive apps:

- stable layer identities and layer order
- stable element identities and data keys
- geometry in viewBox units
- anchors for labels, overlays, and tooltips
- hit targets for pointer interaction
- visibility state that can be controlled without parsing generated SVG
- source-domain data needed to map a visual element back to the calculation or correspondence it represents

Shared visual primitives may be introduced where they reduce duplication, but module-specific geometry should remain explicit when the domains differ. The goal is a common contract shape, not a forced inheritance hierarchy.

## Consequences

- Downstream apps can render Tree, Archeometer, and astrology wheel surfaces with React, Canvas, or custom SVG without rebuilding geometry locally.
- Generated SVG remains supported, but its structure is no longer the public layout API.
- Archeometer needs an upgrade from ring/data model to per-element geometry model.
- Astrology wheel point layout, position rails, boundary notches, connectors, and hit targets must be exposed in the render model before SVG generation.
- Tree should be kept compatible with the invariant; it may need only small naming or shared-type alignment.
