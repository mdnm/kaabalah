# Changelog

## Unreleased

- Add four bilingual angle concepts with typed chart-angle keys and source audits.

- Add two bilingual polarity profiles with typed getters, precise source ranges and explicit classification gaps.

- Add three source-audited bilingual modality profiles with canonical typed keys
  and preserved ordinary/esoteric source-context distinctions.

- Add four source-audited bilingual classical element profiles with typed
  chart-classification keys and frozen provenance.

- Add twelve source-audited bilingual basic sign profiles with typed lookups
  and qualified expressions independent of evolutionary-level assignment.

- Add ten source-audited bilingual basic planet profiles with typed getters,
  immutable metadata and separate planetary-symbolism context notes.

- Add twelve source-audited bilingual Imum Coeli-sign descriptions, with typed
  angle lookups, source qualifications and immutable provenance.

- Add twelve source-audited bilingual Midheaven-sign descriptions using actual
  chart-angle keys, with precise provenance and retained source qualifications.

- Add twelve source-audited bilingual Ascendant-sign descriptions, typed chart-angle
  lookups and frozen provenance, with unsupported angle combinations left explicit.

## 6.17.0 - 2026-11-16

- Revise the descent wording in the reading reference: new one-line `step`
  texts, the same wording on the matching `rung` ranks, Binah spoken
  preferably aloud, and Geburah weighing pros against cons (stumbles,
  discipline, cost) with the return to Kether when the cons prevail.

- Add twelve source-audited bilingual house-theme profiles with typed lookups,
  frozen provenance and source-qualified editorial review notes.

- Add twelve source-audited bilingual natal Pluto-house descriptions,
  with typed one-based lookups and retained source qualifications/provenance.

- Add twelve source-audited bilingual natal Neptune-house descriptions,
  with typed one-based lookups and retained source qualifications/provenance.

- Add twelve source-audited bilingual natal Uranus-house descriptions,
  with typed one-based lookups and retained source qualifications/provenance.

- Add twelve source-audited bilingual natal Saturn-house descriptions,
  with typed one-based lookups and retained source qualifications/provenance.

- Add twelve source-audited bilingual natal Jupiter-house descriptions,
  with typed one-based lookups and retained source qualifications/provenance.

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

- Fix numerology cycles and Fibonacci to use the completed (birthday) age, give
  the repeating seven-year labels the real current block after age 49
  (`currentAgeBlockIndex`, `absoluteIndex`), make day ordinals DST-proof, anchor
  the personal-month phase of 29 February births on the nominal month, type
  `personalMonths` as exactly twelve entries, keep years 1-99 as written, make
  `calculateCycles` throw for an invalid `Date`, and report an unavailable soul number
  and third personal period (instead of `0`) for a blank name in
  `calculatePersonalCycles`. See the migration guide.

- Add the numerology schedule API on civil dates (`getNumerologySnapshot`,
  `generateNumerologyTimeline`, `getNumerologyMethodMetadata`): birthday-based
  personal years, twelve months and three periods, 52-day heptads (seventh to the
  next birthday), seven-year cycles, Fibonacci cycles, a distinct calendar frame
  with a personal day, pinnacles, challenges and life periods as named conventions,
  explicit short-month policies, nominal versus clipped intervals, optional
  death/horizon limits, and explicit unavailability for missing names.

- Add partial birth dates (`describePartialBirthDate`,
  `summarizeBirthDateCandidates`) that report invariants and possible sets without
  ever selecting a date, and civil-date and JSON/Markdown tabulation helpers
  exported from the package root.

- Fix sect to depend on the Sun's geometric altitude instead of its house, so it is
  identical in every house system (the Lot of Fortune follows), and add the sect-
  reversed Lot of Spirit, Moon phase with an approximate illumination label, and
  `getEssentialDignities` (Dorothean triplicity, Egyptian bounds, face lords,
  positive-dignity peregrine). `getSect(sunHouse)` is deprecated.

- Fix whole-sign composite houses to start at the composite ascendant sign, define
  the antipodal midpoint rule and composite angles, report conventions and notices,
  and add `getSynastryFromCharts` / `getCompositeFromCharts` / `getTransitChartFromChart`
  for already-computed charts.

- Fix exact transit events: `exactDate` is now a verified root and a true UTC
  instant, `exactOrb` is the angular residual, every aspect crossing is reported
  from signed-angle bracketing with station insertion and per-body scan steps, and
  near misses are separate optional closest approaches. Coverage is a finite-grid
  qualification, not a completeness proof.

- Add return finders (Saturn, Jupiter, nodal, lunar, Uranus opposition, any body),
  return-pass timelines, and solve the solar return to 0.001 s with residual and
  bracket metadata (`returnPrecisionSeconds`).

- Add typed point IDs, orb policies (including `PTOLEMAIC_PLUS_QUINCUNX`) resolved at
  aspect generation with motion, tight-contact sorting and axis-aware counts,
  input-quality charts (`getQualifiedChart`: recorded, rectified, untimed, partial)
  with time provenance, several house systems from one calculation, house overlays,
  Davison charts, secondary progressions and solar arcs with declared conventions,
  and bounded profection and firdaria timelines.

- Add Jyotish: the Dhruva (Ernst Wilhelm / Kala System 1) equatorial nakshatra
  method ported to TypeScript, a Lahiri sidereal comparison, chara karakas, and
  Vimshottari and Yogini dashas with explicit year lengths. Validation is recorded
  in `JYOTISH_METHODS`; exact Kala date parity is not claimed and Yogini is not
  matched to a Kala export.

- Add bulk collections (`computeCollection`, `iterateCollection`) with one chart per
  person, deterministic order, per-item errors, progress and cancellation, cache
  keys (`buildChartCacheKey`), `getCapabilities`, and ephemeris provenance
  (`getSwissEphInfo`, `calculatePlanetPositionDetailed`, `strictEphemeris`).

- Make Swiss Ephemeris initialisation throw a typed `SwissEphError` (and fail when
  the `.se1` files cannot be read instead of silently using Moshier), stop logging
  initialisation errors with `console.error`, make native ESM initialise, throw a typed
  `SWISSEPH_HOUSES_UNAVAILABLE` error for Placidus/Koch above the polar circle (opt-in
  `houseSystemFallback`), and report Jyotish ephemeris usage with `strictEphemeris`.

- Reject impossible calendar dates in the CLI (`2026-02-30` exits `INVALID_DATE`)
  and read years 0001-0099 as written.

- Add the guides "Dates, time and input quality", "Bulk and collection workflows"
  and "Migrating to the calculation-fix release", the Jyotish module page, and ADRs
  0005-0008.

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
