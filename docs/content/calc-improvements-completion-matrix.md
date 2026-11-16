# Calculation improvements: completion matrix

Status of every REQUIRED item of the calculation-improvement specification (Phases 1 to 5), based on what exists in the worktree `kaabalah-lib-calc` (branch `feat/calc-improvements`, uncommitted). Status values: **done** (implemented and tested), **partial** (implemented with a named gap), **not done**. A test count is not evidence that a convention matches an external source; the "Convention limits" column says what is and is not externally verified. Optional roadmap items are listed separately at the end and are **not implemented**.

Last full run (`npx vitest run --silent`): **84 test files passed, 1,289 tests passed, 1 skipped (1,290)**. An earlier run in the same pass showed two failures in files being edited concurrently by the CLI work (`src/cli.e2e.test.ts` build step and one CLI language-coverage test); both passed in the later run. `npm run typecheck`, `npm run build`, `npm run test:package` (18/18 checks) and the headless-Chrome browser smoke test were then run on the final tree and passed.

Independent validator (aggregate, reported by the validation pass; not re-run here):

- Numerology: 3,992 snapshot pairs and 1,498 timelines compared with an independent Python model, 0 mismatches.
- Root solver: 160 queries compared with pyswisseph, maximum difference 0.0004 s. pyswisseph and kaabalah use the same Swiss files, so this is a binding and solver cross-check, not independent ephemeris-model validation.
- `getTransitRange`: 2,811 of 2,811 perfections matched.
- Sect: 4,944 instants. Composite: 374 pairs.
- Dhruva: 1,350 placements, 0 label mismatches; Galactic Center right ascension against Astropy at most 1.8e-6 arcsec on 413 Julian days.
- Egyptian bounds and Dorothean triplicities matched the reference script only; no external source could be fetched.

## Phase 1: required correctness fixes

| Item | Status | Implementation | Tests | Convention limits |
|---|---|---|---|---|
| 1.1 Reject impossible civil dates (CLI), years 0001-0099 not remapped | done | `src/civil-date.ts`, `src/cli/runtime/validation.ts` | `src/civil-date.test.ts`, `src/cli/runtime/validation.test.ts`, `src/cli.e2e.test.ts`, `src/numerology/legacy-fixes.test.ts` | Years 1 to 9999; schedule API accepts up to 9998 |
| 1.2 `calculateCycles` / `calculateFibonacciCycle` use completed age | done | `src/numerology/index.ts` | `src/numerology/legacy-fixes.test.ts`, `src/numerology/index.test.ts` | |
| 1.3 `calculatePersonalCycles` not double-decremented | done | `src/numerology/index.ts` (age derived at last birthday) | `src/numerology/legacy-fixes.test.ts` | |
| 1.4 Post-49 repeating labels point at the real block; absolute index kept | done | `src/numerology/index.ts` (`currentAgeBlockIndex`, `absoluteIndex`) | `src/numerology/legacy-fixes.test.ts` (ages 77, 97/98) | |
| 1.5 DST-proof day ordinals | done | `src/civil-date.ts`, `src/numerology/index.ts` | `src/numerology/dst.test.ts`, `src/numerology/dst.inner.test.ts` | |
| 1.6 Heptad 7 runs to the next birthday (53/54 days), nominal versus clipped | done (schedule API); legacy output unchanged | `src/numerology/schedule.ts` | `src/numerology/schedule.test.ts` | In the legacy `calculateCycles` result no sampled day differed |
| 1.7 Short-month personal-month boundaries (days 29/30/31, leap and common years), alternates exposed | done | `src/numerology/index.ts`, `src/numerology/schedule.ts` (`shortMonthPolicy`) | `src/numerology/legacy-fixes.test.ts`, `src/numerology/schedule.test.ts` | `clamp` and `overflow` are explicit alternatives **not validated against reference data**; only `next-month-first` is the legacy convention |
| 1.8 `personalMonths` typed as twelve entries | done | `src/numerology/data.ts` (`PersonalMonths`) | `src/numerology/legacy-fixes.test.ts` | |
| 1.9 Missing names give explicit unavailability for personal period 3 | done (facade and legacy) | `src/numerology/schedule.ts`, `src/numerology/index.ts` | `src/numerology/schedule.test.ts`, `src/numerology/index.test.ts` | |
| 1.10 Invalid `Date` throws in `calculateCycles` | done | `src/numerology/index.ts` | `src/numerology/legacy-fixes.test.ts` | `calculatePersonalCycles` already threw before |
| 2.1 Exact events are roots, not minimised orbs; near misses separate | done | `src/astrology/root-solver.ts`, `src/astrology/transit-events.ts`, `src/astrology/index.ts` | `src/astrology/root-solver.test.ts`, `src/astrology/transit-events.test.ts`, `src/astrology/index.test.ts` | |
| 2.2 Station-aware, wrap-aware, deduplicated, verified roots; double-crossing and tangency regressions | done | `src/astrology/root-solver.ts` | `src/astrology/root-solver.test.ts`, `src/astrology/returns.test.ts` | Finite-grid coverage only: not a symbolic completeness proof; hidden station pairs inside one step are not excluded |
| 2.3 Shared root primitive for solar/Jupiter/Saturn/nodal returns, Uranus opposition, transit timing; solar return to 0.001 s with residual and bracket | done | `src/astrology/returns.ts`, `src/astrology/index.ts` (`getSolarReturnChart`) | `src/astrology/returns.test.ts`, `src/astrology/solar-return.test.ts` | Solved instants are UTC |
| 3.1 Sect from the physical horizon, identical across house systems, documented exact-horizon convention | done | `src/astrology/sect.ts`, `src/astrology/index.ts` | `src/astrology/sect.test.ts` | Exactly on the horizon counts as nocturnal (a convention); geometric altitude by default |
| 3.2 Whole-sign composite cusps from the composite ASC sign; Placidus composite cusp convention and ordering; antipodal policy; aspects recomputed from the final point set | done | `src/astrology/composite.ts`, `src/astrology/index.ts` | `src/astrology/composite.test.ts`, `src/astrology/two-chart.test.ts` | Midpoint-of-corresponding-cusps with corrections is a documented convention, not a universal one |
| 4.1 Native ESM `getSwissEph()` initialises; CJS unchanged; explicit paths and browser behaviour preserved | done (Node ESM and CJS); partial (browser) | `src/astrology/swisseph.ts`, `tsup.config.ts` | `src/astrology/swisseph.runtime.test.ts`, `src/astrology/swisseph.test.ts` | The browser default (non-explicit) wasm path is **not exercised** by an automated test |
| 4.2 Packed install in standalone CJS and ESM; real browser bundle | done | `scripts/smoke-packed.mjs`, `scripts/smoke-browser.mjs`, `package.json` scripts `test:package`, `test:browser` | the scripts themselves | Run on the final tree: `test:package` 18/18 checks (tarball contents, standalone CJS and ESM default init + chart, installed CLI, CJS = ESM); `smoke-browser.mjs` passed in headless Chrome with explicit `wasmPath`/`ephePath`. Only Chrome was tried; the browser default (non-explicit) wasm path is not exercised |
| 4.3 Surface the ephemeris used; explicit unavailable files and fallback | done | `src/astrology/swisseph.ts` (`getSwissEphInfo`, `calculatePlanetPositionDetailed`, `strictEphemeris`, `SwissEphError`) | `src/astrology/swisseph.test.ts`, `src/astrology/swisseph.runtime.test.ts` | `swe_version` is **not exported by the shipped WASM**, so `swissEphemerisVersion` is `null`. Remaining `console.error` calls exist outside initialisation (see "Open items") |

## Phase 2: numerology API

| Item | Status | Implementation | Tests | Convention limits |
|---|---|---|---|---|
| As-of snapshots and bounded timelines | done | `src/numerology/schedule.ts`, `src/numerology/schedule-types.ts` | `src/numerology/schedule.test.ts` | Range cap 36,525 days; interval cap 10,000 |
| Personal years, twelve months, three periods, with start/end-exclusive and phase separate from value | done | `src/numerology/schedule.ts` | `src/numerology/schedule.test.ts` | |
| Calendar-frame year/month/day, personal day | done | `src/numerology/schedule.ts` | `src/numerology/schedule.test.ts` | The personal-day formula is a **chosen convention** (no prior calculator existed) |
| Fixed 52-day heptads, year position, seven-year cycles, Fibonacci on completed age | done | `src/numerology/schedule.ts` | `src/numerology/schedule.test.ts`, `src/numerology/calendar-end.test.ts` | |
| Pinnacles, four challenges, three life periods as named conventions | done | `src/numerology/life-stages.ts` | `src/numerology/schedule.test.ts` | Age-transition and master-number rules (`36 - life path`; 27-year or 28/56 periods) are **not externally verified** |
| Partial dates: explicit types, structured reasons, candidate enumeration that never selects a date | done | `src/numerology/partial-date.ts` | `src/numerology/partial-date.test.ts` | |
| Birth/death/horizon limits, nominal versus clipped | done | `src/numerology/schedule.ts` | `src/numerology/schedule.test.ts` | Missing death date is not survival evidence |
| Distinct method identities (life path method, master policy, name input, gematria, frame, short-month policy) | done | `src/numerology/schedule.ts` (`getNumerologyMethodMetadata`) | `src/numerology/schedule.test.ts` | |
| CLI: explicit evaluation date, ranges, discoverable commands, schemas, E2E | done | `src/cli/commands/numerology-schedule.ts`, `src/cli/commands/numerology.ts`, `src/cli/contract.ts` | `src/cli.e2e.test.ts` | `--as-of` on the legacy commands; new `numerology:snapshot`, `:timeline`, `:heptads`, `:personal-cycles`, `:life-stages`, `:partial`. `--format table|markdown` exists only on the numerology family and `astrology` |

## Phase 3: Jyotish

| Item | Status | Implementation | Tests | Convention limits |
|---|---|---|---|---|
| Dhruva RA nakshatra method (GC anchor, FK5 of date, zeroRA, equal sectors, latitude retained, lagna, nodes) | done | `src/astrology/jyotish/dhruva.ts`, `frames.ts`, `nakshatra.ts`, `bodies.ts` | `src/astrology/jyotish/jyotish.test.ts`, `src/astrology/jyotish/reference.test.ts` | Mixed mean (anchor) / apparent (bodies) reproduced as supplied |
| Lahiri sidereal comparison, whole-sign chart, nakshatras and padas | done | `src/astrology/jyotish/lahiri.ts` | `src/astrology/jyotish/jyotish.test.ts` | |
| Chara karakas, 7/8 scheme, explicit degree frame and Rahu convention | done | `src/astrology/jyotish/karakas.ts` | `src/astrology/jyotish/jyotish.test.ts` | |
| Vimshottari and Yogini maha/antar, birth balance, active lookup, explicit `yearLengthDays`, half-open intervals | done | `src/astrology/jyotish/dasha.ts` | `src/astrology/jyotish/jyotish.test.ts` | **Yogini is unvalidated**: implemented under `(nakshatraNumber + 3) mod 8` and not matched to a Kala Yogini export |
| Validation statement kept distinct for placements and dates | done | `src/astrology/jyotish/index.ts` (`JYOTISH_METHODS`) | `src/astrology/jyotish/reference.test.ts` (synthetic fixtures) | Two private user-transcribed fixtures: placement labels 18/18; first-major start residuals -2.368444 and -11.501848 days under the supplied Moshier settings; no constant fitted; no exact Kala date parity; source PDFs not inspected. Production Swiss-file residuals are recorded separately and are **not in the shipped metadata** |
| Ephemeris provenance / strict mode for Jyotish | done | `src/astrology/jyotish/bodies.ts`, `index.ts` (`ephemerisUsage`, `strictEphemeris`) | `src/astrology/jyotish/ephemeris-provenance.test.ts` | |

## Phase 4: chart completeness and quality-aware workflows

| Item | Status | Implementation | Tests | Convention limits |
|---|---|---|---|---|
| Sect-reversed Lot of Spirit; Moon phase with exact-versus-approximate label | done | `src/astrology/lots.ts`, `src/astrology/moon-phase.ts` | `src/astrology/lots.test.ts`, `src/astrology/moon-phase.test.ts` | Illumination is always labelled `approximate`; no `exact` value is produced |
| Essential dignities: Dorothean triplicity, Egyptian bounds, face lords, positive-dignity peregrine, traditions and endpoints stated | done | `src/astrology/dignity.ts` | `src/astrology/dignity.test.ts` | Bound and triplicity tables matched the reference script only; **no external source verified** |
| Several house systems from one ephemeris calculation | done | `src/astrology/house-systems.ts` | `src/astrology/house-systems.test.ts` | |
| Stable typed point IDs (planets, nodes, Lilith variants, angles, Vertex, lots); legacy dictionaries adapted | done | `src/astrology/points.ts` | `src/astrology/points.test.ts` | |
| Both-direction house overlays; Davison with documented conventions; derived-chart comparisons and transits | done | `src/astrology/overlays.ts`, `src/astrology/davison.ts`, `src/astrology/index.ts` (`getTransitChartFromChart`) | `src/astrology/overlays.test.ts`, `src/astrology/davison.test.ts`, `src/astrology/two-chart.test.ts` | Davison place default is the arithmetic/shorter-arc convention |
| Ptolemaic + quincunx profile with per-class orbs routed into generation; configurable | done | `src/astrology/orb-policy.ts` | `src/astrology/orb-policy.test.ts` | |
| Point selection, sorted tight contacts, applying/separating, unavailable motion, fixed natal targets, raw counts and axis grouping | done | `src/astrology/orb-policy.ts` | `src/astrology/orb-policy.test.ts` | |
| Typed recorded / rectified / untimed / partial input; placeholders; whole-day Moon sign range | done | `src/astrology/quality.ts` | `src/astrology/quality.test.ts` | |
| Location and timezone provenance (IANA/DST, UTC, local mean time, birthplace/residence, unknown) | done | `src/astrology/quality.ts` (`resolveTimeProvenance`) | `src/astrology/quality.test.ts` | |
| Bounded annual profection and firdaria timelines | done | `src/astrology/profections.ts`, `src/astrology/firdaria.ts` | `src/astrology/profections.test.ts`, `src/astrology/firdaria.test.ts` | Legacy `getAnnualProfection` reads the house sign and is only right for whole-sign charts (the timeline counts from the ascendant sign) |
| Return passes, secondary progressions, solar arcs with declared time keys, angle conventions, target sets | done | `src/astrology/timelines.ts`, `src/astrology/progressions.ts` | `src/astrology/timelines.test.ts`, `src/astrology/progressions.test.ts` | Quotidian, solar-arc and Naibod progressed angles are all returned; quotidian is the reference convention only |
| Polar-latitude house failure typed, opt-in fallback | done | `src/astrology/index.ts`, `src/astrology/swisseph.ts` | `src/astrology/polar-houses.test.ts` | Added by the independent validation pass |
| `getTransitRange` accepts `LocalDateTimeParts` for `from`/`to` | done | `src/astrology/index.ts` | `src/astrology/transit-range-parts.test.ts` | |

## Phase 5: quality of life, bulk use and maintainability

| Item | Status | Implementation | Tests | Convention limits |
|---|---|---|---|---|
| Accept already-computed charts for synastry, composites, overlays, transits; one natal calculation per person; lightweight results | done | `src/astrology/index.ts` (`...FromCharts`, `omitCharts`), `src/astrology/overlays.ts` | `src/astrology/two-chart.test.ts`, `src/astrology/overlays.test.ts` | |
| Structured bulk manifests (all pairs, specified pairs, timed-only), IDs preserved, per-item errors, deterministic order | done | `src/astrology/collection.ts` | `src/astrology/collection.test.ts` | **No person-by-event transit contacts**: events are listed but only people pairs get aspects |
| Bounded concurrency, cancellation, progress; NDJSON streaming mode | partial | `src/astrology/collection.ts` (`iterateCollection`, `AbortSignal`, `onProgress`), `src/cli/commands/astrology-extra.ts` (`astrology:collection --ndjson`) | `src/astrology/collection.test.ts`, `src/cli.e2e.test.ts` | Library cancellation is tested. The CLI signal test does not prove cancellation happened (it also passes if the run finishes first), and stdout contents after a signal in `--ndjson` mode were not checked. Swiss Ephemeris is synchronous, so concurrency bounds in-flight tasks, not ephemeris parallelism. No person-by-event transit contacts |
| Cache keys with complete inputs; isolated mutable Swiss sidereal state | done | `src/astrology/cache-key.ts`, `src/astrology/swisseph.ts` (`withSwissEphState`), `src/astrology/jyotish/lahiri.ts` | `src/astrology/cache-key.test.ts`, `src/astrology/swisseph.test.ts` | Method/version metadata on results; no cross-process cache |
| Capability discovery; actionable missing-data/runtime errors; typed errors, no unsolicited logging | done | `src/astrology/capabilities.ts`, `src/astrology/swisseph.ts`, CLI `capabilities` command | `src/astrology/capabilities.test.ts`, `src/cli.e2e.test.ts` | Library code no longer calls `console.error`; errors are rethrown. The only console use left is `console.info` as the fallback runtime-notice sink when `process.stderr` is unavailable |
| Numeric-only output usable without interpretation text; JSON/Markdown tabulation helpers | done | `src/tabulate.ts` | `src/tabulate.test.ts` | Tabulation helpers are exported from the package root only |
| Six documented examples (natal, as-of numerology, period range, untimed, mixed-frame Jyotish, bulk all-pairs) | done | `docs/src/content/docs/modules/astrology.mdx`, `numerology.mdx`, `jyotish.mdx`, `getting-started/recipes.mdx`, `guides/bulk-workflows.md` | executed against the worktree source (see "Examples") | Date-only numerology examples use `"YYYY-MM-DD"`; run under `TZ=Asia/Tokyo` to show timezone independence |

## Testing and completion

| Item | Status | Evidence | Convention limits |
|---|---|---|---|
| Every claimed bug reproduced by a test that becomes green; old wrong tests retired | done | regression tests listed in the rows above; legacy-behaviour comparisons in the migration guide were produced by running the previous commit and the new code side by side | |
| Independent synthetic fixtures and invariants | done | tests listed above; Jyotish synthetic fixtures under `src/astrology/jyotish/fixtures` | Private fixtures are never committed |
| Tolerances, precision and external residuals checked separately | done | root residual, bracket width and display orb are separate fields; Jyotish placements and dates are validated separately | pyswisseph with the same Swiss files is a binding cross-check only |
| `npm run typecheck`, `npm run test`, `npm run build`, packed and browser checks | done | typecheck clean; `npx vitest run --silent` 84 files, 1,289 passed, 1 skipped; `npm run build` succeeded; `test:package` 18/18; `smoke-browser.mjs` passed (headless Chrome) | Run on the final tree by the orchestrator |
| Public exports, types, help/JSON contracts, docs and migration notes consistent | partial | export index derived mechanically and diffed against `docs/src/content/docs/reference/api.md` (zero runtime exports missing for core, numerology, astrology, gematria, tarot, iching, ifa, tabulate and civil-date; pre-existing `semantic` `list*SymbolMetadata` and `visual` glyph/default constants are covered only by summary wording) | CLI contracts documented by the CLI work |
| Docs site build | not done | `docs/node_modules` is absent | MDX syntax and frontmatter were checked by script only (unescaped braces and angle brackets in prose, balanced code fences); the Starlight build was **not** run |
| Completion matrix | done | this document | |

## Examples

The six required examples and every quoted output were executed with `vite-node` against the worktree source (the source imports `?url` assets, so plain `tsx` cannot load it), with `await getSwissEph()` for the default asset resolution. Synthetic inputs only. Where a docs example passes explicit paths in the scripts, the docs show the plain form.

## Open items and unresolved numerical questions

- **Moshier true node**: a 0.04 arcsecond discrepancy against pyswisseph for the true node under Moshier, cause unknown.
- `swe_version` is not exported by the shipped WASM: `swissEphemerisVersion` is `null`.
- The browser default (non-explicit) wasm path is not exercised by an automated test.
- Pinnacle, challenge and life-period conventions (36 minus life path, 27-year and 28/56 periods, master handling) are not externally verified.
- `clamp` and `overflow` short-month policies are not validated against reference data.
- The Yogini schedule is unvalidated (not matched to a Kala Yogini export).
- Dhruva dates: the first-major start residuals (-2.368444 and -11.501848 days under the supplied Moshier settings) are unexplained and not fitted; with the Swiss ephemeris files they are -2.379069 and -11.429322 days.
- Collections have no person-by-event transit contacts.
- Legacy `getAnnualProfection` reads the house sign and is only right for whole-sign charts.
- Egyptian bounds and Dorothean triplicities were checked against the reference script only.
- `getJulianDay` in `wasm/src/swisseph.ts` still ignores milliseconds (the JD-based helpers keep full precision).
- The docs site (Starlight) build was not run: `docs/node_modules` is absent.

## Optional roadmap: NOT implemented

None of the following has been delivered. They are listed so they are not mistaken for finished work.

- Configurable fixed-star catalogs.
- Additional Jyotish techniques and divisional charts under explicit conventions.
- Richer return and event calendars.
- Seeded descriptive frequency and synastry-control helpers (statistical controls reporting sample, point set, null model, repetitions and multiple-search limits).
- Input and output schemas, and a reusable family/collection report command.
- Optional heavy analysis dependencies kept out of the core/browser bundle (nothing was added; no such feature exists).
