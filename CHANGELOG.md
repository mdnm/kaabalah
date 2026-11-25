# Changelog

## 7.2.0 - 2026-11-25

- Add `findEclipses` to `kaabalah/astrology`. Search a date range for worldwide
  solar and lunar eclipses and get each event's type, time of maximum, and
  tropical longitude and sign for use in charts such as solar returns.
- Rebuild the Swiss Ephemeris runtimes for Node and browsers. If you serve your
  own WASM URL, deploy the binary that ships with this version alongside the
  updated JavaScript package.

## 7.1.0 - 2026-11-25

- Add `getPanchanga` (`kaabalah/astrology`) and the `astrology:panchanga`
  command: the Hindu almanac day (sunrise to sunrise) at a place, in the Lahiri
  frame. Tithi, nakshatra, nitya yoga and karana come at sunrise, at the given
  time, and as every span of the day with exact start and end.
- The panchanga also gives:
  - the lunar month (amanta and purnimanta, adhika and kshaya months) and ritu
  - Shaka and Vikram years with the South Indian and Jovian samvatsaras
  - Rahu Kala, Yamaganda and Gulika
  - the 30 muhurtas with their Vedic names and deities, Abhijit, Brahma
    muhurta and Dur Muhurta
  - Varjyam, Amrit Kaal and Choghadiya
  - the Sarvartha Siddhi windows
- Each table follows the oldest text found (Muhurta Chintamani, Narada Samhita,
  Taittiriya Brahmana, Siddhanta Shiromani, Brihat Samhita, Prashna Marga), and
  `method` states each convention. Choghadiya has no classical source and is
  marked as such. Times match Prokerala's panchang to the printed minute.
- `getPlanetaryHours` accepts `sunriseDefinition`: the default stays the
  almanac sunrise (upper limb with refraction), and
  `disc-centre-without-refraction` gives the Hindu rising, which the panchanga
  uses by default.
- Add 941 bilingual solar-return-to-natal contact descriptions and accept the
  ten planets, mean node, Chiron, Ascendant and Midheaven on either side of the
  directed lookup. Add conditional solar-return references for dignity reversals, adverse angles, Ibn Ezra’s annual-to-natal
  planet-position rules, annual rulers and overlays, and Morin’s reception conditions.
  Planetary conjunction sources include the 1559 Latin witness of Abū Maʿshar
  and Brian Clark’s class notes on outer planets contacting the natal Sun.
  Class-grounded syntheses fill the remaining major-aspect combinations
  within the calendar's geometric bounds.
- Expand the within-return aspect bank to 214 major-aspect descriptions
  and the directed same-sign bank to 100 solar-return descriptions.
- Add 340 bilingual ordinary transit descriptions, expanding the directed
  bank to 840 major-aspect combinations. The mean North Node and Chiron
  are available on both sides, and the natal Ascendant and Midheaven
  are available as targets.

## 7.0.0 - 2026-11-21

- Add 1,331 bilingual timing descriptions across 19 JSON banks, with immutable
  entry and text getters in `kaabalah/astrology` and `kaabalah/numerology`.
  Coverage includes 500 directed transit-aspect profiles, sky retrogrades by
  planet and sign, Moon phases and signs, lunations, sign ingresses, seasonal
  festivals, planetary rulers, profections, progressions, solar returns,
  Firdaria, nakshatras and their 108 padas, Vimshottari lords, personal months,
  pinnacles and the Fibonacci year. English is the default; `pt` locales select
  Portuguese. Unsupported combinations return `undefined` without fallback.
- Complete natal retrograde sign coverage for Uranus, Neptune and Pluto. All
  eight planets from Mercury through Pluto now have twelve natal sign and
  twelve natal house descriptions; lookups require finite negative longitude speed.
- **Breaking:** Firdaria node majors are undivided: `subPeriods` is empty and
  `currentSub` is `null` during North and South Node periods. Consumers must
  handle nullable `currentSub`. `nodeSubPeriodStart` is deprecated and ignored.
- Correct the solar-return captivity aphorism's annual-house condition to
  annual VII corresponding to natal VIII, retaining the annual Ascendant in
  natal II and the other conditions.

## 6.25.0 - 2026-11-20

- `kaabalah/astrology`: `findLunations` returns the exact instants of the new
  moon, first quarter, full moon and last quarter in a window, with the Sun's
  and the Moon's longitude and the Moon's sign at each. `phases` limits the
  search. Eclipses are not computed.
- `findProgressedPerfections` returns the real-life instants at which a
  secondary-progressed body (the Sun to Mars by default) is exactly in a major
  aspect to a natal point, in a window of real dates. It uses the time key and
  the `yearLength` option of `getSecondaryProgressions`, so a returned
  `exactDate` passed to it as `target` gives the body at the exact aspect.
  Progressed angles are not searched.

## 6.24.0 - 2026-11-20

Cycles: what is active for a person on a day, and what changes ahead. Nothing
that existed changes its results.

- `kaabalah/semantic`: `buildCycleMapData` and `getCycleTreeMarkers` put a
  day's cycles on the Tree as sphere and path shares, from plain data (transit
  aspects and placements, time lords, personal numbers). The rules are in
  `KAABALISTIC_CYCLE_WEIGHTS`: only the five major aspects within 1 degree
  count; each lights the sphere of its aspect type, the sphere of the natal
  planet it touches and that planet's path when it has one (the Sun to
  Saturn); an aspect involving a current time lord (firdaria major or
  sub, profection, maha or antar dasha) weighs double; the Moon is the only sky
  placement; shares are transits 60, time lords 20, numerology 20, renormalized
  over the systems present. `getAspectTightness` and `getAspectWeight` take an
  optional orb range.
- `kaabalah/astrology`: `getPlanetaryHours` gives sunrise, sunset, the day
  ruler and the 24 planetary hours at a place, with the hour containing the
  instant asked. Polar day and night return a typed unavailable result. Pass a
  time zone: without one the weekday comes from the longitude.
- `findStations` and `findRetrogradePeriods` return the stations in longitude
  of Mercury through Pluto, and the retrograde periods overlapping a window
  with their true opening and closing stations.
- `findDeclinationStations` and `findEquatorCrossings` return the turning
  points of a body's declination (with an out of bounds flag) and its
  crossings of the celestial equator, for the Sun through Pluto.
- `findSeasonalPoints` and `getSeasonalPosition` give the eight points of the
  year: the equinoxes, the solstices and the midpoints at 15 degrees of the
  fixed signs. A season name is given only when a hemisphere is passed.
- `findIngressWindows` returns each sign ingress with the moment its effect
  begins, using the lead times of the Muhurta Chintamani
  (`INGRESS_LEAD_TIMES`: Sun 5 days, Mercury and Venus 7, Mars 8, Moon 3
  ghatis, Jupiter 2 months, Rahu 3 months, Saturn 6 months). Tropical signs.
- Jyotish: `isVargottama`, and a `vargottama` flag on the D9 placements of
  `getVargaChart` (same sign in the D1 and the D9, in the frame of the
  longitude passed).

## 6.23.0 - 2026-11-19

- Add Portuguese (pt-BR) keywords for the 22 Ark Annus, item for item with the
  English ones. `TAROT_ARKANNUS_DATA.<CARD>.keywordsPt` sits next to `keywords`
  (the English list and the existing shape are unchanged), and
  `getTarotCardProfile(lookup, language)` now returns `keywords` in that
  language (English by default, Portuguese for `pt`/`pt-BR`). `TarotCardProfile`
  gains an optional `keywords` field, present for the major Ark Annus only.

## 6.22.1 - 2026-11-19

- **Changes results for some dates.** The personal month is now the month
  investigated plus the double-digit personal year (the value before the final
  reduction), then reduced. It used to add the single-digit year. Example:
  personal year 14/5 in June is 6 + 14 = 20, reduced to 2 (it was 6 + 5 = 11).
  A year with no two-digit step (a sum such as 2004 going straight to 6) adds
  its final value, and a master year (11, 22, 33, 44) is added as written; the
  sum is reduced with the same master policy as before (`masters: "preserve"`
  keeps 11/22/33/44, `"reduce"` does not). This applies to
  `calculatePersonalMonths`, `calculatePersonalCycles`, the `personal-month`
  layer, the snapshot, the calendar frame (`calendar-month`, and `calendar-day`
  through it), `numerology:cycles`, `numerology:snapshot` and
  `numerology:timeline`. The method ids become `birthday-personal-month/v2` and
  `calendar-personal-year-month-day/v2`. For a person born on 1990-05-17, 2 of
  the 12 personal months of the 2026 birthday year change; across birth dates
  roughly one personal month in ten differs.
- Keep `src` and `reviewNotes` as empty compatibility arrays on description
  entries. The bundled description data contains only text and keywords.

## 6.22.0 - 2026-11-19

- Add CLI commands for the 6.21.0 library functions: `astrology:condition`
  (`getPlanetaryCondition`, `--rulers=traditional|modern`), `astrology:rulers`,
  `astrology:varga` (`--division=<n>|all`, with the Karakamsha and houses from
  it for D9), `astrology:yogakarakas` (`--ascendant=<sign>` or birth data),
  `tree:map` (the weighted Tree of Life birth map, `--name` for gematria; no
  birth time means numerology and gematria only) and `tree:paths` (house
  quests, Lightning Path, Serpent Path and `HOUSE_SPHERES`).
- Description entry fields `src` and `reviewNotes` are empty compatibility
  arrays. `astrology:describe` returns description text and keywords.
- Document that `numerology:cycles` reports `currentPersonalMonth` and
  `currentPersonalPeriod` as zero-based indexes (the personal month value agrees
  with `numerology:snapshot`).

## 6.21.0 - 2026-11-19

- The Tree of Life birth map is weighted. Every marker from
  `buildKaabalisticMapData` carries a `weight` (table exported as
  `KAABALISTIC_MARKER_WEIGHTS`): Sun, Moon and Ascendant 5, Mercury, Venus and
  Mars 4, Jupiter, Saturn and MC 2, other points 1; Kaabalistic Life Path 5,
  day 4, month 3, year 2; gematria synthesis 4, individuality and personality
  3, letters 1 each and at most 3 per path. The map gains `rawWeightsById`,
  `weightsById` (percentage points, with astrology 50, numerology 30 and
  gematria 20 as system shares, rebalanced when a system is absent),
  `rankedSpheres` and `rankedPaths`. `countsById` is unchanged in meaning but
  now includes the two new layers below.
- Two new astrology layers on the map. `decan-sphere`: a body also lights the
  sphere of its decan (cardinal Chokhmah, Binah, Chesed; fixed Geburah,
  Tiphareth, Chesed; mutable Hod, Yesod, Malkuth) at half its placement
  weight. `aspect-sphere`: each aspect lights one sphere (conjunction Kether
  through opposition Malkuth, none for Tiphareth), weighted by how tight it is
  and by the two bodies involved, and capped at 5 per sphere.
- Add `kaabalah/semantic` chart readings in English and Portuguese:
  `buildHouseQuests` ("Persistent quest for identity", one per house from the
  sign on its cusp), `buildLightningPath` and `buildSerpentPath` (the eleven
  sphere carriers read by sign, Kether to Malkuth and back), with their tables
  and `HOUSE_SPHERES`.
- Add `kaabalah/astrology` planetary condition: `getDispositors` (chains,
  final dispositors and loops, with `TRADITIONAL_RULERS` or `MODERN_RULERS`),
  `getMutualReceptions` (domicile, exaltation and mixed),
  `getPlanetSectStatus`, `PLANETARY_JOYS` and `isInJoy`, `getStationStatus`
  (a speed-based approximation), and `getPlanetaryCondition(chart)`, which
  returns all of it per body.
- Add Jyotish divisional charts and Jaimini helpers: `getVarga` and
  `getVargaChart` for the sixteen Parashari vargas (D1 to D60), and
  `getKarakamsha` / `getSvamsa`, `housesFromKarakamsha`, `getRasiDrishti`,
  `getRasiDrishtiOnSign`, `getYogakarakas` and `getParivartana`. All are pure
  arithmetic on longitudes in the frame the caller chooses.

## 6.20.1 - 2026-11-19

- Tarot card images come from the CloudFront distribution
  (`https://d1u8antvu60ox0.cloudfront.net/tarot`) instead of the S3 bucket.
  Same paths, cached at the edge.
- Fix the English spelling of sextile in the 22 planet-pair aspect
  descriptions, which read "in sextil".

## 6.20.0 - 2026-11-17

- Add the `astrology:describe <kind> [keys...]` CLI command, a lookup for
  every bilingual astrology description. A combination with no available text
  returns `found: false` with exit code 0.
- Add 599 bilingual astrology descriptions: Descendant by sign, signs on house
  cusps, retrograde planets by sign and by house, Vertex and Antivertex, and
  planet-pair aspects. New getters: `getHouseCuspSignDescription`,
  `getRetrogradePlanetSignDescription`, `getRetrogradePlanetHouseDescription`,
  `getVertexContactDescription` and `getAspectPairDescription`, each with an
  `Entry` form. `getAngleSignDescription('dc', sign)` now returns text.
- Add 550 more bilingual astrology descriptions: Sun sign with Ascendant (144),
  the 360 symbolic degrees, four dignity statuses, the decan concept and 36
  decan profiles, and the five remaining house 6 cusp signs. New getters:
  `getSunAscendantDescription`, `getSymbolicDegreeDescription` with
  `getSymbolicDegreeNumber`, `getDignityStatusDescription` and
  `getDecanDescription`. `getPointSignDescription('vertex', sign)` reads the
  Vertex house account of the sign's natural house, and
  `getPointHouseDescription` for Lilith reads the sign account of the house's
  natural sign.

## 6.19.0 - 2026-11-17

- Retell the eleven-step `descent` as the core movement, in English and
  Portuguese: the idea becomes light, then sound, is expressed, planned with
  good feelings, weighed, harmonized, kept in silence, organized, checked for
  foundation and manifested. Add `DESCENT_MOVEMENT`, `getDescentMovement` and
  localized `movement` names: the right column expands, the left contracts
  and the middle balances. The Yesod gloss becomes "the foundations".

## 6.18.0 - 2026-11-16

- Name the Jyotish equatorial method Dhruva consistently in metadata and documentation.

- Add twelve bilingual directed lunar-node house-axis accounts with explicit shared role/house lookups.

- Add bilingual North/South Node sign profiles with separate astronomical roles and qualified learning themes.

- Add bilingual astronomical north/south lunar-node concepts through explicit role getters.

- Add bilingual diurnal/nocturnal sect concepts with physical-horizon definitions and luminary associations in profection contexts.

- Add eight bilingual natal retrograde planet profiles with typed lookups gated by available finite negative longitude speed.

- Add twelve bilingual Lilith-sign profiles shared by mean/true interpretation lookups, preserving each mode’s supplied sign and explicit house gaps.

- Add a bilingual Lilith concept shared by the verified mean/true chart-key lookups, with whole-chart and latent-intensity qualifications.

- Add twelve shared bilingual Chiron sign-or-house profiles with explicit typed lookup aliases and one shared entry per account.

- Add a bilingual Chiron concept through the typed additional-factor lookup, with mythic framing and interpretive qualifications.

- Set the four bilingual element temperament labels to sanguine for fire, choleric for earth, phlegmatic for air and melancholic for water.

- Add twelve bilingual Fortune-house profiles with typed point/house lookups and field-of-experience themes.

- Use Portuguese and English minor-aspect display names while retaining canonical API keys.

- Add twelve bilingual Fortune-sign descriptions with typed point/sign getters.

- Add a bilingual Part of Fortune concept with a typed chart-point lookup.

- Add nine bilingual aspect-type profiles using existing typed aspect keys,
  with interpretive qualifications.

- Add four bilingual angle concepts with typed chart-angle keys.

- Add two bilingual polarity profiles with typed getters and explicit classification gaps.

- Add three bilingual modality profiles with canonical typed keys
  and ordinary/esoteric interpretation distinctions.

- Add four bilingual classical element profiles with typed
  chart-classification keys and immutable entries.

- Add twelve bilingual basic sign profiles with typed lookups
  and qualified expressions independent of evolutionary-level assignment.

- Add ten bilingual basic planet profiles with typed getters,
  immutable metadata and separate planetary-symbolism context notes.

- Add twelve bilingual Imum Coeli-sign descriptions, with typed
  angle lookups, interpretive qualifications and immutable entries.

- Add twelve bilingual Midheaven-sign descriptions using actual
  chart-angle keys, with interpretive qualifications.

- Add twelve bilingual Ascendant-sign descriptions, typed chart-angle
  lookups and immutable entries, with unsupported angle combinations left explicit.

## 6.17.0 - 2026-11-16

- Revise the descent wording in the reading reference: new one-line `step`
  texts, the same wording on the matching `rung` ranks, Binah spoken
  preferably aloud, and Geburah weighing pros against cons (stumbles,
  discipline, cost) with the return to Kether when the cons prevail.

- Add twelve bilingual house-theme profiles with typed lookups,
  immutable entries and interpretive qualifications.

- Add twelve bilingual natal Pluto-house descriptions,
  with typed one-based lookups and interpretive qualifications.

- Add twelve bilingual natal Neptune-house descriptions,
  with typed one-based lookups and interpretive qualifications.

- Add twelve bilingual natal Uranus-house descriptions,
  with typed one-based lookups and interpretive qualifications.

- Add twelve bilingual natal Saturn-house descriptions,
  with typed one-based lookups and interpretive qualifications.

- Add twelve bilingual natal Jupiter-house descriptions,
  with typed one-based lookups and interpretive qualifications.

- Add twelve bilingual natal Mars-house descriptions,
  with typed one-based lookups and interpretive qualifications.

- Add twelve bilingual natal Venus-house descriptions,
  with typed one-based lookups and interpretive qualifications.

- Add twelve bilingual natal Mercury-house descriptions,
  with typed one-based lookups and interpretive qualifications.

- Add twelve bilingual natal Moon-house descriptions,
  with typed one-based lookups and interpretive qualifications.

- Add twelve bilingual natal Sun-house descriptions,
  with typed one-based lookups and interpretive qualifications.

- Add twelve bilingual natal Pluto-sign descriptions,
  with typed lookup coverage, interpretive qualifications.

- Add twelve bilingual natal Neptune-sign descriptions,
  with typed lookup coverage, interpretive qualifications.

- Add twelve bilingual natal Uranus-sign descriptions,
  with typed lookup coverage, interpretive qualifications.

- Add twelve bilingual natal Saturn-sign descriptions,
  with typed lookup coverage, interpretive qualifications.

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

- Add Jyotish: the Dhruva (Ernst Wilhelm / Kala) equatorial nakshatra
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

- Add twelve bilingual natal Jupiter-sign descriptions,
  with typed lookup coverage, interpretive qualifications.

- Add the eleven-step descent to the reading reference: `step` (one line) and
  `descent` (told in full) for every sphere, Daath as step 4, in English and
  Portuguese, with `DESCENT_ORDER`, `DESCENT_STEPS` and `getDescentStep`.
  `rung` keeps the ten pip ranks unchanged.

- Add twelve bilingual natal Mars-sign descriptions,
  with typed lookup coverage, interpretive qualifications.

- Add twelve bilingual natal Venus-sign descriptions, retaining
  interpretive qualifications without guaranteed relationship outcomes.

- Add twelve bilingual natal Mercury-sign descriptions with
  interpretive qualifications and no fallback for unsupported planet sets.

- Add twelve bilingual natal Moon-sign descriptions with
  aspect-condition qualifiers and paired keywords; retain unsupported sets as gaps.

- Add `--language pt-BR` to localize CLI help, display content, errors and
  I Ching records while preserving JSON keys and error codes.

- Add twelve bilingual natal Sun-sign descriptions, immutable
  entries and typed getters, preserving calculation behavior and English defaults.

- Use Portuguese wording for minor tarot meanings and Pajem in localized
  card names.

- Add typed Portuguese Ifa calculation labels through `getIfaText`;
  Odu calculations remain unchanged and no interpretation catalog is introduced.

- Add `getAstrologyLabel` for Portuguese decan, dignity, firdaria, profection
  and aspect display names without changing calculation identifiers.

- Add Portuguese semantic symbol, marker and map labels through optional language
  arguments, preserving glyphs, IDs, correspondence targets and counts.

- Add Portuguese tree descriptions through `getTreeDescription` and
  `getTreeNodeDescriptions`, covering all three systems and shared core metadata.

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
