---
title: API Reference
description: Detailed API documentation for all Kaabalah modules
sidebar:
  order: 1
---

## Modules

| Module | Description |
| ------ | ----------- |
| [Numerology](/modules/numerology/) | Life path numbers, dated schedules (as-of snapshots, timelines), personal cycles, heptads, pinnacles, partial birth dates |
| [Gematria](/modules/gematria/) | Calculate Hebrew gematria values for names and words, with reverse gematria lookup |
| [Astrology](/modules/astrology/) | Birth charts, sect and lots, exact transit and return events, composite and Davison charts, progressions, orb policies, input quality, collections |
| [Jyotish](/modules/jyotish/) | Dhruva and Lahiri nakshatras, chara karakas, Vimshottari and Yogini dashas, panchanga (part of `kaabalah/astrology`) |
| [Tarot](/modules/tarot/) | 78 tarot cards with meanings, spreads, and interpretations |
| [I Ching](/modules/iching/) | 64 hexagrams, classical text, plain-language descriptions, Han derivations, and coin casting |
| [Ifa](/modules/ifa/) | Calculate Odu numbers based on dates for Ifa divination |
| [Core](/modules/core/) | Tree of Life system for building correspondences across different esoteric systems |
| [Visual](/modules/visual/) | Tree of Life SVG generation, interactive render model with hit targets and tooltip anchors |
| [Semantic](/modules/semantic/) | Occult theme profiles for search, content tagging, and Kaabalistic map data |

## Package entry points

Every module is a separate, tree-shakable entry point. The package root re-exports all of them.

| Import | Contents |
| ------ | -------- |
| `kaabalah` | Everything below, re-exported |
| `kaabalah/core`, `kaabalah/numerology`, `kaabalah/astrology`, `kaabalah/gematria`, `kaabalah/tarot`, `kaabalah/iching`, `kaabalah/ifa`, `kaabalah/semantic`, `kaabalah/visual` | The nine library modules |
| `kaabalah/swisseph-runtime` | The Swiss Ephemeris runtime script (`swisseph.node.js` for Node.js, `swisseph.web.js` otherwise) |
| `kaabalah/swisseph-wasm` | The Swiss Ephemeris WebAssembly binary (`swisseph.node.wasm` / `swisseph.web.wasm`) |
| `kaabalah` (binary) | The [command-line interface](/getting-started/cli/) |

See the [WebAssembly guide](/guides/webassembly/) for the runtime exports and asset resolution.

## Conventions

- **Dates.** The numerology schedule API takes civil dates (`"YYYY-MM-DD"` or `{ year, month, day }`) and needs no timezone handling. The legacy numerology functions read `Date` arguments with local calendar getters, so build date-only values at local noon: `new Date(1990, 5, 15, 12)`. See [Dates, time and input quality](/guides/dates-and-quality/). Ifa reads the UTC calendar day instead. See [Numerology date handling](/modules/numerology/#date-handling) and [Ifa date handling](/modules/ifa/#date-handling).
- **Language.** Display-text functions take an optional `language`; `'pt'` and `'pt-BR'` select Portuguese and anything else selects English. Identifiers never change. See [Portuguese text](/guides/localization/).
- **Factories.** Never instantiate `TreeOfLife` directly; use `createTree` or `getCanonicalTree`. Node IDs are branded: create them with `id(type, value)` and read them with `parseId`.

## Export index

Runtime exports by module. Types are documented on each module page and in the generated TypeDoc.

### Core

Functions: `createTree`, `getCanonicalTree`, `createTreeWorkspace`, `getTreeTopology`, `getTreeDescription`, `getTreeNodeDescriptions`, `getSphereProfile`, `listSphereProfiles`, `getPathProfile`, `listPathProfiles`, `getSpherePathProfiles`, `getTreeSection`, `listTreeSections`, `getSphereSections`, `id`, `parseId`, `makeCorrespondenceId`, `cloneMetadata`, `cloneSource`, `mergeMetadata`, `mergeSources`. Classes: `TreeOfLife`, `TreeWorkspace`, `TreeTopology`, `BaseNode`. Data and constants: `SPHERES`, `SPHERES_DATA`, `HEBREW_LETTERS`, `HEBREW_LETTERS_DATA`, `LATIN_LETTERS`, `LATIN_LETTERS_DATA`, `TAROT_ARKANNUS`, `TAROT_ARKANNUS_DATA`, `TAROT_DECKS`, `TAROT_SUITS`, `PLANETS`, `MODALITIES`, `WESTERN_ZODIAC_SIGNS`, `WESTERN_HOUSES`, `WESTERN_ASPECTS`, `WESTERN_ELEMENTS`, `MELKITZEDEKI_PATHS`, `FOUR_WORLDS`, `FOUR_WORLDS_DATA`, `COLORS`, `COLORS_DATA`, `MUSICAL_NOTES`, `MUSICAL_NOTES_DATA`, `SYSTEMS`, `TREE_DESCRIPTIONS`, `SPHERE_PROFILES`, `SPHERE_PROFILE_ORDER`, `PATH_PROFILES`, `TREE_SECTIONS`, `TREE_SECTION_IDS`, `TREE_TOPOLOGY_LIGHTNING_SPHERE_NAMES`, `TREE_TOPOLOGY_SPHERE_NAMES`, `TREE_TOPOLOGY_SPHERE_IDS`, `TREE_TOPOLOGY_PATH_IDS`, and the node-type enums `KaabalahTypes`, `WesternAstrologyTypes`, `TarotTypes`, `LetterTypes`, `NumerologyTypes`, `MiscTypes`, `TantraTypes`. See [Core](/modules/core/).

### Numerology

`calculateKaabalisticLifePath`, `calculateStraightAcrossReductionLifePath`, `calculateCycles`, `calculateChallenges`, `calculateFibonacciCycle`, `calculatePersonalCycles`, `calculatePersonalYear`, `calculatePersonalPeriods`, `calculatePersonalMonths`, `getDateEnergies`, `isMasterNumber`, `reduceToSingle`, `reduceToSingleWithSteps`, `getNumerologyData`, `MASTER_NUMBERS`, `NUMEROLOGY_TEXT_DATA`, `NumerologyData`, `fibonacciFromAge`. Dated schedules: `getNumerologySnapshot`, `generateNumerologyTimeline`, `getNumerologyMethodMetadata`, `TIMELINE_LAYERS`, `SCHEDULE_METHOD_VERSION`, `NumerologyScheduleError`, `normalizeBirth`, `resolveCivilDate`, `unavailable`, `fmt`, and the limits `DEFAULT_MAX_TIMELINE_INTERVALS`, `MAX_TIMELINE_INTERVALS_HARD_CAP`, `MAX_TIMELINE_RANGE_DAYS`, `MAX_CANDIDATE_DATES`, `MAX_SCHEDULE_YEAR`. Partial dates: `describePartialBirthDate`, `summarizeBirthDateCandidates`. Life stages: `computeLifeStages`, `LIFE_STAGE_METHOD_ID`. See [Numerology](/modules/numerology/).

### Astrology

Charts: `getBirthChart`, `getSynastryChart`, `getSynastryFromCharts`, `getCompositeChart`, `getCompositeFromCharts`, `getTransitChart`, `getTransitChartFromChart`, `getTransitRange`, `getSolarReturnChart`, `getHousesForSystems`, `getHouseOverlays`, `derivedChartAspectPoints`, `getDavisonChart`, `getDavisonChartFromOptions`, `geographicMidpoint`, `getChartAtJulianDay`, `getSecondaryProgressions`, `findProgressedPerfections`, `DEFAULT_PROGRESSED_PERFECTION_BODIES`, `DEFAULT_PROGRESSED_PERFECTION_NATAL_POINTS`, `DEFAULT_PROGRESSED_PERFECTION_ASPECTS`, `MAX_PROGRESSED_SCAN_STEP_DAYS`, `getSolarArcDirections`, `anglesFromArmc`, `getSect` (deprecated), `getZodiacPosition`, `findHouseOf`, `normalizeAngle`, `formatDegreeMinutes`, `getDecan`, `getDodecatemoria`, `getOppositeSign`, `wholeSignHouseOf`.

Sect, lots, moon phase, composite geometry: `computeSect`, `getSectFromAltitude`, `computeLots`, `calcLotOfFortune`, `calcLotOfSpirit`, `computeMoonPhase`, `MOON_PHASE_NAMES`, `compositeMidpoint`, `computeCompositeAngles`, `computeCompositeCusps`, `cuspsStrictlyIncreasing`, `ANTIPODAL_POLICY_TEXT`, `DEFAULT_ANTIPODAL_EPSILON`.

Planetary hours: `getPlanetaryHours`, `CHALDEAN_ORDER`, `WEEKDAY_RULERS`.

Exact events and returns: `findAngularRoots`, `signedAngleDifference`, `dateToJd`, `jdToDate`, `ROOT_SEARCH_COVERAGE_NOTE`, `findBodyLongitudeCrossings`, `findBodyLongitudeCrossingsWith`, `createBodyLongitudeFunctions`, `sampleBodyAtJd`, `findPlanetaryReturns`, `findSolarReturns`, `findLunarReturns`, `findJupiterReturns`, `findSaturnReturns`, `findNodalReturns`, `findUranusOppositions`, `findTransitPerfections`, `ROOT_SOLVER_METHOD`, `MAX_BODY_SCAN_STEP_DAYS`, `getReturnPassTimeline`, `DEFAULT_RETURN_PASS_KINDS`, `MAX_RETURN_TIMELINE_YEARS`, `MAX_RETURN_TIMELINE_PASSES`, `findStations`, `findRetrogradePeriods`, `STATION_BODIES`, `STATION_SOLVER_METHOD`, `MAX_STATION_WINDOW_YEARS`, `DEFAULT_STATION_OUTSIDE_SEARCH_DAYS`, `MAX_STATION_OUTSIDE_SEARCH_DAYS`, `findDeclinationStations`, `findEquatorCrossings`, `DECLINATION_BODIES`, `MOON_DECLINATION_STEP_DAYS`, `DECLINATION_STATION_METHOD`, `EQUATOR_CROSSING_METHOD`.

Points of the year, lunations and sign ingress windows: `findSeasonalPoints`, `getSeasonalPosition`, `SEASONAL_POINTS`, `SEASONAL_POINTS_METHOD`, `MAX_SEASONAL_WINDOW_YEARS`, `findLunations`, `LUNATION_PHASES`, `LUNATIONS_METHOD`, `LUNATION_SCAN_STEP_DAYS`, `MAX_LUNATION_WINDOW_YEARS`, `findIngressWindows`, `getIngressLeadTime`, `INGRESS_LEAD_TIMES`, `DEFAULT_INGRESS_BODIES`, `INGRESS_WINDOWS_METHOD`, `INGRESS_MONTH_DAYS`, `GHATI_MINUTES`, `MAX_INGRESS_WINDOW_YEARS`.

Worldwide eclipses by UT maximum: `findEclipses`, `ECLIPSES_METHOD`, `MAX_ECLIPSE_WINDOW_YEARS`.

Solar return aphorisms that apply to a year: `matchSolarReturnAphorisms`, `SOLAR_RETURN_APHORISM_METHOD`, `SOLAR_RETURN_APHORISM_TRIGGERS`, `GENERAL_SOLAR_RETURN_APHORISMS`, `SolarReturnAphorismFacts`, `ageAtSolarReturn`.

Profections and firdaria: `getAnnualProfection`, `getMonthlyProfections`, `getProfectionForAge`, `getAnnualProfectionTimeline`, `MAX_PROFECTION_TIMELINE_YEARS`, `getFirdaria`, `getFirdariaPeriods`, `getFirdariaTimeline`, `FIRDARIA_CYCLE_YEARS`, `MAX_FIRDARIA_CYCLES`, `MAX_FIRDARIA_WINDOW_YEARS`, `TimelineError`.

Progressions: `JULIAN_YEAR_DAYS`, `TROPICAL_YEAR_DAYS`, `NAIBOD_RATE_DEGREES_PER_YEAR`, `MAX_PROGRESSION_AGE_YEARS`, `PROGRESSED_ANGLE_CONVENTIONS`, `DerivedChartError`.

Aspects and orb policies: `computeAspects`, `computeSynastryAspects`, `computeTransitAspects`, `computeMidpoints`, `shorterArcMidpoint`, `getAspectMatch`, `validateAspectSpecs`, `ASPECT_CANONICAL_ANGLES`, `KNOWN_ASPECT_NAMES`, `AspectConfigError`, `defineOrbPolicy`, `validateOrbPolicy`, `describeOrbPolicy`, `resolveOrbLimit`, `DEFAULT_CLASS_PRECEDENCE`, `PTOLEMAIC_PLUS_QUINCUNX`, `ORB_POLICY_PROFILES`, `getAspectMotion`, `DEFAULT_EXACT_TOLERANCE_DEGREES`, `computeAspectsWithPolicy`, `computeAspectsBetweenSetsWithPolicy`, `computeTransitAspectsWithPolicy`, `sortTightContacts`, `groupAspectsByAxis`, `countAspects`.

Points and quality: `POINT_IDS`, `POINT_CLASSES`, `POINT_DEFINITIONS`, `getPointDefinition`, `isPointId`, `getChartPoints`, `chartPointsFromPlanetPositions`, `toLegacyPointRecord`, `pointIdFromLegacyKey`, `legacyKeyFromPointId`, `getQualifiedChart`, `resolveTimeProvenance`, `selectAnalysisPoints`, `getMoonSignRange`, `getSignChangesBetween`, `InputQualityError`, `ZODIAC_SIGN_KEYS`.

Dignities: `getEssentialDignity`, `getEssentialDignities`, `getDomicileRuler`, `getExaltation`, `getDetriment`, `getFall`, `getDorotheanTriplicity`, `getEgyptianBound`, `getFaceRuler`, `DIGNITY_TRADITION`, `DOROTHEAN_TRIPLICITY_RULERS`, `EGYPTIAN_BOUNDS`, `SIGN_ELEMENTS`.

Jyotish (see [Jyotish](/modules/jyotish/)): `getJyotishChart`, `JYOTISH_METHODS`, `calculateDhruvaChart`, `DHRUVA_CONSTANTS`, `getDhruvaOrigin`, `dhruvaPlacementFromRightAscension`, `dhruvaPointFromBody`, `dhruvaKetuFromRahu`, `dhruvaLagnaFromAscendant`, `calculateLahiriChart`, `calculateLahiriAyanamsa`, `calculateSiderealPositions`, `calculateCharaKarakas`, `KARAKA_NAMES_7`, `KARAKA_NAMES_8`, `KARAKA_ABBREVIATIONS_7`, `KARAKA_ABBREVIATIONS_8`, `generateDashaSchedule`, `generateVimshottariDasha`, `generateYoginiDasha`, `findActiveDasha`, `DASHA_YEAR_LENGTH_REFERENCES`, `YOGINI_LORDS`, `YOGINI_YEARS`, `VIMSHOTTARI_LORDS`, `VIMSHOTTARI_YEARS`, `getPanchanga`, `tithiFromElongation`, `karanaFromElongation`, `nityaYogaFromSum`, `isSarvarthaSiddhi`, `SARVARTHA_SIDDHI_NAKSHATRAS`, `SARVARTHA_SIDDHI_SOURCE`, `TITHI_NAMES`, `NITYA_YOGA_NAMES`, `MOVABLE_KARANA_NAMES`, `FIXED_KARANA_NAMES`, `VARA_NAMES`, `MASA_NAMES`, `VEDIC_RITU_NAMES`, `SAMVATSARA_NAMES`, `samvatsaraOfShakaYear`, `jovianSamvatsaraBrihatSamhita`, `jovianSamvatsaraSuryaSiddhanta`, `RAHU_KALA_PARTS`, `dayPartOfPlanet`, `ABHIJIT_DAY_MUHURTA`, `BRAHMA_NIGHT_MUHURTA`, `VEDIC_MUHURTA_NAMES`, `MUHURTA_DEITIES`, `DUR_MUHURTAS`, `VARJYAM_START_GHATI`, `AMRIT_KAAL_START_GHATI`, `GHATI_WINDOW_LENGTH`, `CHOGHADIYA_NAMES`, `choghadiyaPlanet`, `getVarga`, `getVargaChart`, `isVargottama`, `isSupportedVarga`, `SUPPORTED_VARGAS`, `VARGA_NAMES`, `dateToJulianDay`, `julianDayToDate`, `JYOTISH_BODY_IDS`, `NAKSHATRA_IDS`, `NAKSHATRA_WIDTH_DEGREES`, `PADA_WIDTH_DEGREES`, `TROPICAL_SIGNS`, `nakshatraFromPosition`, `signPlacement`, and the frame mathematics `icrsToFk5OfDate`, `icrsToFk5J2000Matrix`, `precessionMatrixJ2000ToDate`, `ecliptic0ToRightAscension`, `ecliptic0ToDeclination`, `normalizeDegrees`, `signedAngleBetween`, `taiMinusUtcSeconds`, `utcJdToTtJd`, `TT_MINUS_TAI_SECONDS`, `JD_J2000`, `JULIAN_CENTURY_DAYS`.

Collections and cache keys: `computeCollection`, `iterateCollection`, `defaultPairComputer`, `getEligiblePairPoints`, `COLLECTION_HARD_LIMITS`, `COLLECTION_METHOD_VERSION`, `DEFAULT_COLLECTION_CONCURRENCY`, `CollectionError`, `CollectionAbortError`, `buildChartCacheKey`, `canonicalJson`, `normalizeKeyNumber`, `normalizeChartDate`, `normalizeUtcInstant`, `resolveUtcOffsetMinutes`, `ephemerisIdentityFromInfo`, `createBoundedMemo`, `CACHE_KEY_VERSION`, `CHART_CACHE_KEY_REQUIRED_COMPONENTS`, `PACKAGE_VERSION`, `CacheKeyError`.

Capabilities and runtime: `getCapabilities`, `assertEphemerisReady`, `CAPABILITIES_SCHEMA_VERSION`, `KAABALAH_MODULES`, `INPUT_QUALITY_KINDS`, `getSwissEph`, `closeSwissEph`, `getSwissEphInfo`, `setSwissEphStrictEphemeris`, `calculatePlanetPositionDetailed`, `withSwissEphState`, `ephemerisFromFlags`, `SwissEphError`, `SwissEphEphemerisMismatchError`, `EphemerisTracker`, `mergeEphemerisUsage`, `planHouseSystemFallback`, `resolveSwissEphRuntimeAssets`, `resolveSwissEphRuntimeAssetsAsync`.

Astrocartography: `computeAstrocartographyMap`, `queryAstrocartographyLocation`, `findParansAtLatitude`, `computeEquatorialPositions`, `computeGMST`, `computeMCLongitude`, `computeICLongitude`, `computeHorizonLongitude`, `geographicAngularDifference`.

Display labels: `getAstrologyLabel`, `ASTROLOGY_LABELS`.

Bilingual descriptions: `ASTROLOGY_DESCRIPTIONS` and the following getter families.
Each `get…Description` function has a corresponding `get…DescriptionEntry` function
that returns the readonly bilingual entry, keywords, sources and review notes.

- Natal placements: `getPlanetSignDescription`, `getPlanetHouseDescription`, `getHouseDescription`, `getAngleSignDescription`.
- Basic factors: `getPlanetDescription`, `getSignDescription`, `getElementDescription`, `getModalityDescription`, `getPolarityDescription`, `getAngleDescription`, `getAspectDescription`.
- Additional factors: `getPointDescription`, `getPointSignDescription`, `getPointHouseDescription`, `getRetrogradePlanetDescription`, `getSectDescription`.
- Added in 6.20.0: `getHouseCuspSignDescription`, `getRetrogradePlanetSignDescription`, `getRetrogradePlanetHouseDescription`, `getVertexContactDescription`, `getAspectPairDescription`, `getSunAscendantDescription`, `getSymbolicDegreeDescription` (with `getSymbolicDegreeNumber`), `getDignityStatusDescription`, `getDecanDescription`.
- Lunar-node roles: `getLunarNodeDescription`, `getLunarNodeSignDescription`, `getLunarNodeHouseDescription`.

See [Bilingual natal descriptions](/modules/astrology/#bilingual-natal-descriptions)
for signatures, language selection, source metadata, supported keys, shared aliases
and version availability. Unsupported combinations return `undefined`.

Constants and enums: `Planet`, `HouseSystem`, `CalcFlag`, `RiseTransitFlag`, `VirtualNodes`, `SIGNS`, `DEFAULT_ASPECT_SPECS`, `DOMICILE_RULERS`, `EXALTATIONS`, `SLOW_PLANETS`, `PLANET_AND_NODE_NAMES`, `ASTROCARTOGRAPHY_DEFAULT_PLANETS`.

See [Astrology](/modules/astrology/) and [Jyotish](/modules/jyotish/).

### Gematria

`calculateGematria`, `reverseGematria`, `getGematriaData`, `GEMATRIA_TEXT_DATA`, `GematriaData`. See [Gematria](/modules/gematria/).

### Tarot

`ARKANNUS`, `majorArcana`, `shuffleTarotDeck`, `getTarotCardProfile`, `getTarotCardByNumber`, `getTarotCardNumber`, `getTarotArchetype`, `getTarotCorrespondenceProfile`, `getTarotRepresentations`, `getTarotRepresentation`, `resolveTarotImageUrl`, `listTarotDecks`, `listTarotTrees`, `listTarotSpreads`, `getTarotSpread`, `drawTarotSpread`, `drawConsciousTarotSpread`, `validateTarotSpreadSelection`, `TarotSpreadIndexOutOfPoolError`, `getTarotDeckReferenceContent`, `getTarotReadingReference`, `mythicFigure`, `TAROT_MAJOR_SCENES`, `MYTHIC_MINOR_CONTENT`, `TAROT_IMAGE_BASE_URL`, `TAROT_TREE_IDS`, `DEFAULT_TAROT_TREE_ID`. See [Tarot](/modules/tarot/).

### I Ching

Readings: `getIChingReading`, `getIChingReadingContent`, `linesFromHexagram`, `parseCastLines`, `getMovingLines`, `getCastHexagram`, `getTransformedHexagram`, `getLineTransforms`, `selectZhuXiTexts`, `getOracleTextContent`. Hexagrams: `getHexagram`, `getHexagramByBinary`, `getHexagramByTrigrams`, `getHexagramName`, `getHexagramText`, `getHexagramDescription`, `getTrigram`. Layers: `getNuclearHexagram`, `getPalace`, `getHanHexagram`, `getHexagramKaabalah`, `getSovereignHexagram`, `getTrigramGate`, `getFamilySphere`, `getTrigramPillars`, `listHexagramGates`, `getSixRelative`, `getBranchRelation`, `getPhaseRelation`. Casting and records: `castThreeCoins`, `formatRecord`, `formatRecordContent`. Data: `HEXAGRAMS`, `HEXAGRAMS_BY_NUMBER`, `HEXAGRAM_DESCRIPTIONS`, `HEXAGRAM_NAMES_PT`, `HEXAGRAM_TEXTS`, `ICHING_RECORD_LABELS`, `LINE_POSITIONS`, `PALACE_TABLE`, `PHASE_HANZI`, `SOVEREIGN_HEXAGRAMS`, `TRIGRAMS`. See [I Ching](/modules/iching/).

### Ifa

`calculateOdu`, `getIfaText`, `IFA_TEXTS`. See [Ifa](/modules/ifa/).

### Semantic

Theme profiles: `getTarotThemeProfile`, `listTarotThemeProfiles`, `getHouseThemeProfile`, `listHouseThemeProfiles`, `tokenizeOccultThemeText`, `OCCULT_THEME_STOPWORDS`. Reading: `resolveCard`, `projectChart`, `buildReadingWeights`, `rankedSpheres`, `collapseHits`, `buildThreads`, `getReadingReference`, `getDescentStep`, `getDescentMovement`, `DESCENT_ORDER`, `DESCENT_STEPS`, `DESCENT_MOVEMENT`, `TREE_ORDER`, `PLANET_KEYS`. Kaabalistic overlays: `getKaabalisticCorrespondenceTargets`, `getAstrologyTreeMarkers`, `getNumerologyTreeMarkers`, `getGematriaTreeMarkers`, `buildKaabalisticMapData`, `getPlanetSymbolMetadata`, `getZodiacSignSymbolMetadata`, `getAngleSymbolMetadata`, `getNodeSymbolMetadata` and their `list*SymbolMetadata` counterparts, `getKaabalisticLabel`, `KAABALISTIC_LABELS`. Cycle map: `buildCycleMapData`, `getCycleTreeMarkers`, `KAABALISTIC_CYCLE_WEIGHTS`. See [Semantic](/modules/semantic/).

### Visual

`generateTreeSvg`, `getTreeRenderModel`, `getTreeLayout`, `getRouteActivations`, `generateAstroWheelSvg`, `generateAstroGlyphSvg`, `getAstroGlyph`, `listAstroGlyphs`, `generateGlyphSvg`, `generateArcheometerSvg`, `getArcheometerRenderModel`, plus glyph and default-viewBox constants such as `TREE_SVG_DEFAULT_VIEWBOX`, `ASTRO_WHEEL_DEFAULT_VIEWBOX` and `ARCHEOMETER_DEFAULT_VIEWBOX`. See [Visual](/modules/visual/).

### Package root only: civil dates and tabulation

These are exported from `kaabalah` (not from a module sub-path):

- Civil dates: `civilDate`, `parseCivilDate`, `formatCivilDate`, `isValidCivilDate`, `isLeapYear`, `daysInMonth`, `civilDayOrdinal`, `civilDateFromOrdinal`, `addCivilDays`, `diffCivilDays`, `compareCivilDates`, `completedYears`, `anniversaryInYear`, `civilDateFromLocalDate`, `civilDateToLocalNoon`, `MIN_CIVIL_YEAR`, `MAX_CIVIL_YEAR`. See [Dates, time and input quality](/guides/dates-and-quality/).
- Tabulation (JSON and Markdown): `toTable`, `toMarkdownTable`, `escapeMarkdownCell`, `aspectEdgesTable`, `chartPointsTable`, `numerologyIntervalsTable`, `ASPECT_EDGE_COLUMNS`, `CHART_POINT_COLUMNS`, `NUMEROLOGY_INTERVAL_COLUMNS`.

## Command line

Every module is also available as a command; see the [CLI reference](/getting-started/cli/) and `kaabalah help --json` for the machine-readable schema.

## TypeDoc

For complete TypeScript API documentation, generate TypeDoc:

```bash
cd kaabalah-lib
npx typedoc --out docs/api src/index.ts
```
