# Changelog

## Unreleased

- Add twelve source-audited bilingual natal Mars-house descriptions,
  with typed one-based lookups and retained source qualifications/provenance.

- Add twelve source-audited bilingual natal Venus-house descriptions,
  with typed one-based lookups and retained source qualifications/provenance.

- Add twelve source-audited bilingual natal Mercury-house descriptions,
  with typed one-based lookups and retained source qualifications/provenance.

- Add twelve source-audited bilingual natal Moon-house descriptions,
  with typed one-based lookups and retained source qualifications/provenance.

- Add twelve source-audited bilingual natal Sun-house descriptions,
  with typed one-based lookups and retained source qualifications/provenance.

- Add twelve source-audited bilingual natal Pluto-sign descriptions,
  with typed lookup coverage, retained source qualifications and provenance.

- Add twelve source-audited bilingual natal Neptune-sign descriptions,
  with typed lookup coverage, retained source qualifications and provenance.

- Add twelve source-audited bilingual natal Uranus-sign descriptions,
  with typed lookup coverage, retained source qualifications and provenance.

- Add twelve source-audited bilingual natal Saturn-sign descriptions,
  with typed lookup coverage, retained source qualifications and provenance.

## 6.16.0 - 2026-11-16

- Resolve the public Swiss Ephemeris runtime and WASM asset exports to the
  current Node and browser builds.

- Add twelve source-audited bilingual natal Jupiter-sign descriptions,
  with typed lookup coverage, retained source qualifications and provenance.

- Add the eleven-step descent to the reading reference: `step` (one line) and
  `descent` (told in full) for every sphere, Daath as step 4, in English and
  Portuguese, with `DESCENT_ORDER`, `DESCENT_STEPS` and `getDescentStep`.
  `rung` keeps the ten pip ranks unchanged.

- Add twelve source-audited bilingual natal Mars-sign descriptions,
  with typed lookup coverage, retained source qualifications and provenance.

- Add twelve source-audited bilingual natal Venus-sign descriptions, retaining
  course qualifications and review notes without guaranteed relationship outcomes.

- Add twelve source-audited bilingual natal Mercury-sign descriptions with
  course-first disagreement notes and no fallback for unsupported planet sets.

- Add twelve bilingual natal Moon-sign descriptions with narrow source audits,
  aspect-condition qualifiers and paired keywords; retain unsupported sets as gaps.

- Add `--language pt-BR` to localize CLI help, display content, errors and
  I Ching records while preserving JSON keys and error codes.

- Add twelve source-audited bilingual natal Sun-sign descriptions, immutable
  provenance and typed getters, preserving calculation behavior and English defaults.

- Use Portuguese class wording for minor tarot meanings and Pajem in localized
  card names.

- Add typed Portuguese Ifa calculation labels through `getIfaText`;
  Odu calculations remain unchanged and no interpretation catalog is introduced.

- Add `getAstrologyLabel` for Portuguese decan, dignity, firdaria, profection
  and aspect display names without changing calculation identifiers.

- Add Portuguese semantic symbol, marker and map labels through optional language
  arguments, preserving glyphs, IDs, correspondence targets and counts.

- Add Portuguese tree descriptions through `getTreeDescription` and
  `getTreeNodeDescriptions`, covering all three systems and shared core metadata.

- Add the phase 1 astrology description source inventory, coverage gaps, source
  disagreements and proposed bilingual scope for author review, including a
  cross-module keyword search and a separate private-NOTAS location ledger.

- Add Portuguese gematria individuality, personality and synthesis meanings through
  `getGematriaData`.

- Add Portuguese access to all eight numerology text tables through
  `getNumerologyData`.

- Add Portuguese translations for all 514 classical I Ching texts through
  `getHexagramText` and `getIChingReadingContent`, retaining Chinese and English.

- Add Portuguese spread and slot labels, descriptions and notes through
  `getTarotSpread(id, language)` and `listTarotSpreads(language)`.

- Add Brazilian Portuguese tarot names and deck meanings through language arguments
  on `getTarotCardProfile` and `getTarotRepresentation`.
  Centralize duplicated English tarot meanings while preserving existing exports.

- Tree SVG: highlights are proportional. An activation's explicit `strength` is drawn
  as given (the 0.56 floor now applies only when strength is derived from count and
  total), sphere halos and path glows share one scale, and a lit path keeps its
  sphere-to-sphere colours unless the activation carries its own colour.

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
