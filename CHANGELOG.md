# Changelog

## Unreleased

- Add draft Portuguese spread and slot labels, descriptions and notes through
  `getTarotSpread(id, language)` and `listTarotSpreads(language)`.

- Add draft Brazilian Portuguese tarot names and deck meanings through language arguments
  on `getTarotCardProfile` and `getTarotRepresentation`, with per-field review provenance.
  Centralize duplicated English tarot meanings while preserving existing exports.

## 6.15.0 - 2026-11-16

- Reading weights: Daath now lights through Scorpio, since Pluto rules Scorpio and
  Pluto is Daath's planet. A major or a court that carries Scorpio (Temperance, the
  Queen of Cups) is one hit on Daath, and a birth placement in Scorpio answering that
  card is another. A court's address at Daath still counts for nothing.
- Add bilingual plain-language hexagram descriptions to `kaabalah/iching`
  (`getHexagramDescription`). The classical text is unchanged.
- Document `kaabalah/iching` alongside the other modules.

## 6.14.0 - 2026-11-16

- Add structured reading rules to `kaabalah/semantic`: card resolution,
  chart projection, Tree weights and connections across birth, horary and day charts.
- Extend conscious element connections to horary and day charts;
  day charts never contribute a rising or houses.
- Include all matching chart-cusp houses and explicitly selected-house priority,
  plus sign ruler/card/placement context marked for human review. Contextual
  priority stays separate from Tree counts.
- Add approved bilingual Mythic Tarot figures, scenes and divinatory content, and
  Papus and Egyptian major scenes alongside existing deck descriptions, with
  Ark Annu and sphere terminology normalized as requested.
- Add bilingual reading reference tables and Portuguese hexagram names.

The real-panel fixture retains Hod 7, Yesod 3, Malkuth 2, path 20 three times
and path 21 twice. Rendering and app sentence templates remain consumer-owned.
