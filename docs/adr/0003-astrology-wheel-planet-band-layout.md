# Astrology wheel planet-band layout

The astrology wheel must preserve astronomical and house truth while making dense planet clusters readable. A planet's house membership is determined from true longitude against exact house cusps. A planet glyph may be displaced for readability, but that displacement must not make the planet appear to belong to a different house.

Reference renderers point in the same direction: keep true positions available, spread crowded glyphs in zodiacal order, and draw an explicit indicator when display position differs from true position. Astrolog uses a true point plus a line to the displayed glyph. Kerykeion separates true angle indicators from display positions. Stellium computes adjusted display positions while preserving true ticks and connector lines.

## Considered Options

- **Keep inline labels beside displaced glyphs** - compact in code, but text boxes force larger displacements and make crowded houses visually confusing.
- **Move whole house boundaries to fit labels** - visually groups planets, but makes cusps appear wrong and undermines house interpretation.
- **Use arbitrary radial callouts** - can solve overlap, but makes the wheel less legible as a natal chart and weakens the connection between planets and houses.
- **Use a stable Planet Band with independent Position Rails** - separates glyph placement from degree/sign/minute/retrograde text, keeps display positions orderly, and allows compact views to hide detail rails.

## Decision

Replace the current inline planet label layout with a Planet Band and Position Rails.

- Exact House Cusps remain fixed and authoritative.
- Planet house membership is never inferred from glyph or label position.
- Planet glyphs may be angularly spaced inside the Planet Band, preserving true zodiacal order.
- Glyph displacement is capped by house context. If a glyph must visually cross or crowd a neighboring cusp, only the local Planet Band boundary may bend.
- The bend is a Boundary Notch: a small, local relief in the Planet Band only. It does not move the full cusp line or house boundary through the chart.
- Boundary Notches are triggered by glyph/cusp conflicts, not by position text.
- Position details are rendered in independent rails, such as degree, sign, minutes, and retrograde.
- Rail visibility is programmatically controllable by the library API. Apps own hover, tap, and reveal state; the library exposes the geometry and visibility hooks.
- True-position ticks or anchors remain exact even when glyphs are displaced.
- Displaced glyphs get short connectors from the true anchor when needed.
- Aspect lines connect true planet anchors, never displaced glyph positions.
- No legacy inline-label mode is required.

## Consequences

- Static SVG defaults can remain information-rich by showing the rails.
- App screens can use compact presets, such as glyph-only or glyph-plus-selected-rails, without changing the layout algorithm.
- Generated SVG and custom renderers share the same model: true anchors, displayed glyph positions, connectors, rails, notches, and hit targets.
- Existing tests around point displacement and aspect geometry need to be rewritten around true-anchor versus display-position separation.
- The public visual API may change because there is only one known consumer and backwards compatibility is not required for the old inline-label layout.
