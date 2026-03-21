# Session Learnings Archive

Extracted from `AGENTS.md` to keep the main guide concise. Organized by domain.

---

## Astrology — Timezone & UTC

- **`toUtcDate()` did not respect `treatAsUTC` in `TimeZoneOptions`**: The `treatAsUTC` field was defined in `TimeZoneOptions` (`swisseph.ts:583`) and used by `calculateHouses` (`swisseph.ts:459`), but `localToUtcDate` (which `toUtcDate` delegates to) never checked it. This caused `getBirthChart` to apply timezone conversion to dates that were already UTC — producing ~0.2° Sun position errors in the Solar Return chart. Fixed by adding a `treatAsUTC` early-return at the top of `localToUtcDate` (`swisseph.ts:648`).
- **Binary search for Solar Return needs UTC-aware chart casting**: The binary search converges on a UTC millisecond timestamp, but `getBirthChart` converts dates from local to UTC via `toUtcDate`. To cast the SR chart at the exact converged moment, pass `{ treatAsUTC: true }` as `timeZoneSettings` so no double-conversion occurs.
- **`new Date(ms)` local parts ≠ UTC parts**: `buildLocalParts` in `swisseph.ts` extracts local time via `date.getFullYear()` etc. For a UTC timestamp, these local values differ from UTC values by the machine's timezone offset. This is why passing a UTC-derived Date through the normal timezone conversion pipeline shifts the result by hours.
- **Transit timezone must NOT inherit from natal settings**: `getTransitChart` and `getTransitRange` were falling back to `options.natal.timeZoneSettings` for the transit date. If the natal chart uses a fixed offset (e.g. `utcOffsetMinutes: -300` for EST), this is wrong during EDT when the real offset is -240. Fix: default to `{ autoTimeZone: true }` for transit timezone. The transit date is a different civil time at a potentially different location — it needs its own timezone resolution.
- **Firdaria/profections must use `chart.dateUtc`, not `natalInput.birthDate`**: The CLI's `buildBirthDate()` creates a Date using local timezone (`new Date(year, month, day, hour, minute)`). For time-lord techniques that anchor periods to the exact birth instant, use `chart.dateUtc` (the UTC-resolved Date from `getBirthChart`) instead.

## Astrology — Aspects & Transits

- **Aspect engine is pure (no WASM)**: `src/astrology/aspects.ts` has zero WASM dependency — it only needs `normalizeAngle()`. This means aspect tests (`aspects.test.ts`) run instantly without WASM init. Keep this separation: WASM for ephemeris, pure math for aspects/midpoints.
- **Angles (ASC, MC) must be included as aspect points**: Synastry and single-chart aspect computation include ASC and MC alongside planets via `getAspectPoints(chart)`. Without this, angle-to-planet aspects (e.g. ASC opposition Mars) are missed — these are astrologically significant.
- **Aspect orbs: decimal degrees vs DMS**: Orbs in the code are decimal degrees (e.g. `0.12°`). Astrology tools display them as degrees-minutes (e.g. `0°07'`). Convert: `0.12° × 60 = 7.2' ≈ 0°07'`. This caused initial confusion when comparing with reference tools.
- **Composite midpoint algorithm**: Must use shorter-arc midpoint, not naive average. Formula: `diff = b - a; if (diff > 180) diff -= 360; if (diff < -180) diff += 360; midpoint = normalizeAngle(a + diff / 2)`. Naive `(a+b)/2` breaks for wrap-around cases (e.g. 350° + 10° should give 0°, not 180°).
- **Natal planet speeds must be zeroed for transit applying/separating**: `getNatalAspectPoints()` was copying `longitudeSpeed` from natal planets into the aspect computation. For transits, natal positions are frozen targets. The natal Moon's ~13°/day speed was flipping `applying` to `separating` for Moon-to-planet aspects. Fix: zero out `longitudeSpeed` in `getNatalAspectPoints()` (`index.ts`).
- **Fast-planet perfections missed with daily step**: The Moon moves ~13°/day and can enter and exit a 6° orb between daily samples. A transit range scan with `stepDays=1` found 1 Moon-Sun perfection where `stepDays=0.1` found 4. Fix: auto-reduce the internal step to 0.25 days when fast planets (non-`SLOW_PLANETS`) are in the transit set.

## Astrology — Architecture

- **Solar Return algorithm**: Binary search on `signedAngularDelta(transitSun, natalSun)` with a ±2 day window around the natal birthday in the target year. The Sun never retrogrades, so the signed delta has a clean zero-crossing. Converges in ~13 iterations (< 60s precision). `getSolarReturnChart()` in `src/astrology/index.ts`.
- **SR location override via `--sr-*` flags**: Solar Return commands support relocating the chart via `--sr-lat`/`--sr-lon`/`--sr-location` (geocoding) plus `--sr-house-system`. Defaults fall through to natal values. Note: `--sr-timezone` was removed because the SR chart is always cast at a UTC instant found by binary search — passing a timezone would reinterpret the UTC date as local, shifting planetary positions.
- **`calculateSinglePlanetPosition()` for ternary search**: Added to `swisseph.ts` — computes one planet via `swissEph.calculatePlanetPosition()` instead of the full 15-body `calculatePlanetaryPositions()`. Used by `getTransitLongitudeAt()` during perfection binary/ternary search. Uses a `NAME_TO_PLANET` reverse map (lowercase name → Planet enum) built once at module load.
- **Transit range auto-step**: `getTransitRange()` checks if any transit planet in the filter is fast (not in `SLOW_PLANETS`). If so, the effective step is capped at `0.25` days regardless of the user's `stepDays`. This is transparent to the caller — the API contract is the same, but fast-planet perfections are reliably detected.
- **JS negative modulo breaks profections for pre-birth years**: `-1 % 12` is `-1` in JS (not `11`), so `(age % 12) + 1` can produce house `0` or negative, causing `houses[-1]` → undefined → TypeError. Fix: validate `age >= 0` and throw a clear error. This pattern applies to any JS code using `%` with potentially negative inputs for array indexing.

## Swiss Ephemeris / WASM

- **SwissEph WASM `?url` imports break in bundled CJS**: The `import wasmPathNode from "...wasm?url"` in `swisseph.ts` resolves to a path with `?url` suffix in the CJS bundle, causing ENOENT. Fix: always pass explicit `wasmPath` to `getSwissEph()` from CLI code.
- **SwissEph NODEFS mount warning is benign**: During WASM init, stderr shows `"Failed to mount ephemeris directory, falling back to host path"`. Calculations still work correctly — the fallback to the host path succeeds. This noise comes from `console.info`/`console.warn` inside `swisseph.ts`.

## CLI

- **CLI command registry as single source of truth**: The `COMMANDS` array in `src/cli.ts` defines all command schemas (args, flags, types, defaults, descriptions). Both `help --json` schema output and human-readable help text are generated from this registry, keeping them in sync.
- **`exitWithError()` pattern**: All error paths go through a single function that handles both JSON structured errors (stdout) and human-readable errors (stderr) based on the current `--json` flag state.
- **`parseSingleChartRequest()` reuse pattern**: New astrology CLI commands that take a single natal chart (transits, solar-return) share this helper for parsing date/time/lat/lon/location/house-system/timezone from both positional args and `--input-json`. Supports nested `natal` object in `--input-json` via the `natalPayload` extraction pattern (see `cmdAstrologyTransits` and `cmdAstrologySolarReturn`).
- **`initWasm()` helper in CLI**: Shared WASM init for synastry/composite commands. Resolves paths relative to `__dirname` like the original `cmdAstrology`.
- **Synastry/composite CLI require `--input-json`**: These commands take two chart objects, which can't be expressed as positional args. The `--input-json` flag is mandatory. Schema: `{"chartA":{"date","time","lat","lon","timezone?","houseSystem?"},"chartB":{...},"aspectSpecs?":[...]}`.
- **`--transit-time` was silently ignored without `--transit-date`**: The time parsing was inside an `if (transitDateStr)` branch; without a date, the fallback was `new Date()` (current instant). Fix: default `transitDateStr` to today so `--transit-time` always applies.
- **Range mode `--to` was effectively exclusive**: Both endpoints parsed as midnight (`T00:00:00`) with the loop condition `ms <= toMs`. Events on the `--to` day were missed. Fix: parse `--to` as `T23:59:59.999` and extend the scan by one extra step beyond `toMs` so binary search can detect perfections near the boundary (then filter output to `[from, to]`).

## Geocoding

- **Google Maps Geocoding API vs Places API**: The user's API key had Places API enabled but not Geocoding API. The Places API (New) text search endpoint (`places.googleapis.com/v1/places:searchText`) works as a drop-in replacement for geocoding in Node.js CLI context.
- **`@googlemaps/js-api-loader` is browser-only**: It relies on `window` and DOM. For Node.js CLI geocoding, use the REST endpoint directly with `fetch`.

## Known Constraints

- **Pre-existing numerology test failure**: `src/numerology/index.test.ts > Heptad cycles > should calculate the cycles correctly` fails because test expectations are hardcoded for a specific date range that has passed. Not related to CLI changes.
- **Pre-existing TS type issue in tree command**: `n.data?.name` triggers TS error because `HebrewLetterData` doesn't have a `name` property. Worked around with `Record<string, unknown>` cast + `"name" in n.data` check.
