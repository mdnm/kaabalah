# Kaabalah

A TypeScript library that models esoteric correspondence systems as queryable graphs and projects them into domain-specific calculations and visualizations. Two first-class consumers: the **gamu** web app and the **CLI** (used by humans and AI agents alike).

## Tradition

This library implements **Kaabalah** (double-a) as taught by the Melkitzedeki Order — the primordial Kaabalah, understood as the blueprint to this simulation. It is not Jewish Kabbalah or Hermetic Qabalah, though it encompasses both. The spelling, terminology (Ark Annu, Da'at Royalship), path-letter assignments, and tarot numbering differ from those better-known traditions. Do not assume equivalence.

## Language

### Module philosophy

**Domain Module**:
A self-contained calculation module (astrology, numerology, gematria, tarot, ifá) that is independently useful — consumers can use astrology calculations, gematria values, or tarot lookups without ever touching the correspondence graph. The **Semantic Layer** optionally projects their outputs onto the Tree.
_Avoid_: plugin, provider, adapter

### Graph model

**Correspondence Graph**:
A bi-directional graph of heterogeneous esoteric entities connected by relationships. The central data structure of the library.
_Avoid_: knowledge graph, ontology, network

**Node**:
A single esoteric entity in the graph — a sphere, path, planet, zodiac sign, Hebrew letter, tarot card, number, color, musical note, or chakra. Identified by a branded **NodeId** (`type:value`).
_Avoid_: vertex, entity, item

**Correspondence**:
A bi-directional edge between two **Nodes**, carrying metadata and provenance (**Sources**). Represents a traditional esoteric association.
_Avoid_: relationship, link, connection, mapping

**Source**:
Provenance record on a **Correspondence** indicating where it came from — a **System**, **Part**, **Bridge**, **Overlay**, or manual insertion.
_Avoid_: origin, provenance

### Configuration model

**System**:
A lens onto the correspondence graph representing a way of arranging, naming, and scoping the Tree of Life. **Kaabalah** (Melkitzedeki Order) is the complete, canonical system — the only one that matters. Hermetic-qabalah and lurianic-kabbalah exist in the code as separate systems but are vestigial; the real slicing need is by correspondence domain (music, colors, biology), not by tradition. Only one system is active at a time.
_Avoid_: tradition, school, variant

**Part**:
A loadable sub-module within a **System** that adds a category of **Nodes** and **Correspondences** to the graph — e.g., tarot, western astrology, Hebrew letters. Every system has a `base` part (spheres and paths); additional parts are optional. Parts are scoped to a specific system.
_Avoid_: module, plugin, extension

**Bridge**:
An auto-triggered connector that fires when two or more specific **Parts** are loaded together. Creates cross-part **Correspondences** that only make sense when both sides are present (e.g., linking tarot cards to zodiac signs).
_Avoid_: connector, cross-reference

### Graph lifecycle

**TreeOfLife**:
The mutable graph builder. **Systems** and **Parts** mutate it during loading to populate **Nodes** and **Correspondences**. Limited query capabilities.
_Avoid_: graph, builder

**TreeWorkspace**:
An immutable, indexed snapshot of a **TreeOfLife** with query methods and optional **Overlays** applied. Created because **TreeOfLife** is hard to search. The primary query surface for consumers. `getCanonicalTree()` caches the pipeline: configure TreeOfLife → freeze into TreeWorkspace. Note: canonical tree caches are currently process-global singletons — swapping trees in the same process is a future need that will require rethinking this.
_Avoid_: snapshot, view

**Overlay**:
A set of node upserts, correspondence additions/removals/annotations, and notes applied on top of a base graph when creating a **TreeWorkspace**. Used for user-specific or context-specific modifications without mutating the canonical tree.
_Avoid_: layer, patch, delta

### Tarot

**Ark Annu**:
A tarot card. Melkitzedeki term for what most traditions call an "Arcanum" (plural: Arcana).
_Avoid_: arcana, arcanum, card

**Da'at Royalship**:
Court cards (King, Queen, Knight, Page). In the Melkitzedeki system these correspond to Da'at (the hidden sphere) on the Tree, not to the ten sephiroth like pip cards do. Modeled as a distinct card type (`daat+royalship`) separate from `major` and `minor`.
_Avoid_: court cards, face cards

### Semantic layer

**Marker**:
A projection of a domain-specific result (a planetary position, a gematria value, a numerology reduction) onto a Tree of Life target (sphere or path). Markers are the bridge between raw computation and visual activation on the Tree. Each marker carries its source type (astrology, numerology, gematria), source name, target, and optional metadata (sign, element).
_Avoid_: highlight, activation, annotation

**Kaabalistic Map**:
The combined set of **Markers** across all domain modules for a given input (name, birth date, birth chart). Consumed by the app as switchable "layers" — one per domain, or all combined. Built by `buildKaabalisticMapData()`.
_Avoid_: overlay (distinct concept), projection

### Visual

**Archeometer**:
A circular esoteric instrument that maps letters, numbers, colors, musical notes, zodiac signs, and planets onto concentric rings. Has its own correspondence mappings that are distinct from (and may overlap with) the Tree of Life correspondences. The canonical version should be preserved while allowing runtime modifications — a concrete instance of the broader need for domain-scoped correspondence slicing.
_Avoid_: wheel, dial, chart

**Visual Render Model**:
A renderer-independent geometry contract for complex visual surfaces that need custom rendering or interaction. It remains appropriate for Tree/Archeometer-style surfaces, but the astrology wheel is intentionally a thin static renderer rather than a public layout-engine contract.
_Avoid_: mandatory layout engine, custom-renderer mandate

### Astrology

**Sect**:
Whether a chart is a day chart (diurnal) or night chart (nocturnal), determined by the Sun's position relative to the horizon. Cached on **BirthChart** as `sect` to avoid recalculating for downstream techniques (profections, firdaria, essential dignity) that depend on it.
_Avoid_: day/night, light/dark

**House Cusp**:
The exact zodiacal boundary where one astrological house begins. A planet's house membership is determined from its true longitude relative to house cusps, not from where its glyph or label is drawn.
_Avoid_: visual boundary, label position

**Astrology Wheel Renderer**:
A conventional static SVG projection of a **BirthChart**. It owns glyphs, fixed **House Cusps**, zodiac ticks, aspect lines, and modest visual spacing, but not app-specific interaction, arbitrary multi-chart composition, or a reusable chart layout engine.
_Avoid_: layout engine, custom renderer contract

**House Boundary Envelope**:
A retired term from an earlier astrology wheel layout-engine direction. Do not use it for current chart semantics; house visuals use exact **House Cusps** rather than flexible boundaries.
_Avoid_: cusp, house membership, current requirement

**Planet Band**:
A conventional ring in the static astrology wheel where planet glyphs are displayed. It may space clustered glyphs for readability while true ticks and **House Cusps** remain exact; it is not a public layout surface for app-specific label systems.
_Avoid_: callout layer, floating labels, layout engine

**Boundary Notch**:
A retired visual device from the earlier layout-engine direction. Current astrology wheel language should use fixed **House Cusps**, true ticks, glyph spreading, and optional short connectors instead of bending house boundaries.
_Avoid_: moved cusp, shifted house line, current requirement

**Position Rail**:
A retired term from the previous rich wheel-layout model for placing degree, sign, minutes, or retrograde text in sub-rings. Current astrology wheel defaults are glyph-first with optional compact position labels, not public rails.
_Avoid_: mandatory position text, layout API

## Flagged ambiguities

**Canonical + mutable overlay pattern**: Three features need the same mechanism — a frozen canonical base with user/context-specific lenses on top: (1) TreeWorkspace + Overlays, (2) Archeometer canonical mappings + runtime modifications, (3) domain-scoped correspondence slicing (music, colors, biology). Currently solved ad-hoc in the workspace layer only. These should converge into a single pattern.

## Example dialogue

> **Dev:** I want to show the user which cards are linked to their Sun sign.
>
> **Domain:** You'd query the **Correspondence Graph** for the **Node** of the zodiac sign, then walk to the connected **Ark Annu** nodes. The major ones come through **Paths** (each path has a Hebrew letter and a zodiac/planet correspondence), and the **Da'at Royalship** cards connect through signs directly. The minor **Ark Annu** connect through **Spheres**.
>
> **Dev:** And if I want to show all of this on the Tree diagram?
>
> **Domain:** Use the **Semantic Layer** — pass the birth chart to `getAstrologyTreeMarkers()` and you get back **Markers** that map each planet/angle to its Tree target. Then `buildKaabalisticMapData()` combines those into a **Kaabalistic Map** you can render as layers.
>
> **Dev:** Can I use the astrology calculations without the Tree at all?
>
> **Domain:** Yes — every **Domain Module** is independently useful. `calculateBirthChart()` gives you planetary positions, houses, aspects, and sect. The Tree projection is optional.
