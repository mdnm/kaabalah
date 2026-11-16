---
title: Migrating to the calculation-fix release
description: Every legacy behaviour change in the numerology, astrology, runtime and CLI fixes, with before and after values and how to opt out or adapt.
sidebar:
  order: 6
---

This release fixes calculation defects and adds new APIs. **No public function or type was removed**, and the old signatures still work. Some legacy results change because they were wrong. Every item below was reproduced against the previous code (commit `a13bec7`) and the new code; the "before" and "after" values are real outputs. The inputs are synthetic.

Version number and release date are decided at publish time; the [changelog](https://github.com/mdnm/kaabalah/blob/main/CHANGELOG.md) lists the same changes under "Unreleased".

## Numerology (legacy `Date` APIs)

| Change | Before | After |
|---|---|---|
| **Completed-age cycles and Fibonacci.** `calculateCycles` and `calculateFibonacciCycle` used calendar-year subtraction, so the cycle advanced on 1 January instead of on the birthday. | Born 1990-06-15, evaluated 2024-03-01: `currentYearlyCycle` 7, Fibonacci `currentAge` 34 | `currentYearlyCycle` 6, `currentAge` 33 (completed age) |
| **After age 49** the repeating labels pointed at the block in the first 49 years. | Born 1940-06-16, evaluated 2018-06-20: active age cycle started `1968-06-16` | starts `2017-06-16`. The label stays 1-7 and the absolute block index is new: `currentAgeBlockIndex` (11) and `ageCycles[i].absoluteIndex` |
| **DST-proof day ordinals.** Day counters divided elapsed milliseconds, so one civil day could have two numbers across a DST change. | `TZ=America/Sao_Paulo`, born 1990-09-15: on 2018-11-05, 00:30 gave `daysInMonthlyCycle` 51 and 01:30 gave 52 | both give 52 |
| **Seventh heptad end.** The seventh 52-day segment is defined to run to the actual next birthday (53 or 54 days). | the active heptad was bounded by a fixed 366 days | In the legacy output no sample differed (the active heptad switches on the birthday either way). The actual span is explicit in the new API: `heptad` intervals have `isRemainder` and a real `nominalEndExclusive` |
| **29 February births, personal-month phase.** The phase anchored on the rolled-forward 1 March instead of the nominal month. | Born 2000-02-29, evaluated 2023-02-28: `currentPersonalMonth` 10 | 11 |
| **`PersonalCycles.personalMonths` type.** | declared a 13-element tuple; runtime always returned 12 | typed as `PersonalMonths`, exactly twelve entries (no runtime change) |
| **Years 1 to 99.** Numeric `Date` constructors reinterpret these as 1900 to 1999 internally. | born year 50: `ageCycles[1].cycleStart` was in year 1957 | year 57 |
| **Invalid `Date` in `calculateCycles`.** | returned a result with `NaN` counters | throws `Date must be a valid Date object`. (`calculatePersonalCycles` already threw for an invalid `Date`; that is unchanged) |

**Blank names.** For a missing, blank or vowel-less name, `calculatePersonalCycles` used to return `soulNumber` `{ reducedValue: 0 }` and a plausible-looking third period (2020 + 0 reduced). It now returns an explicit unavailable value (`{ available: false, reason: "first-name-missing", detail }`) for both `soulNumber` and `personalPeriods[2].value`; periods 1 and 2 are unchanged. Code that read `.reducedValue` of those fields must check `available` first (the type is `ReducedValueWithSteps | UnavailableValue`). See [Missing names](/modules/numerology/#missing-names).

New code should use the [dated-schedule API](/modules/numerology/#dated-schedules-snapshots-and-timelines), which takes civil dates and needs no local-noon workaround.

## Astrology

| Change | Before | After |
|---|---|---|
| **Sect is read from the physical horizon.** `getBirthChart` inferred sect from the Sun's house. | Whole-sign chart at 2000-01-01T07:00Z, lat 20, lon 0: `nocturnal`, Lot of Fortune 344.593489 | `diurnal`, Fortune 225.912416, identical to the Placidus result (which is unchanged: it was `diurnal`, 225.912416) |
| **Sect convention.** | house-based | diurnal when the Sun's geometric altitude is strictly greater than 0; exactly 0 is nocturnal. `chart.sectDetails` reports both altitudes |
| **Whole-sign composite houses.** | cusps were midpoints of the two charts' whole-sign cusps: 15, 45, 75 degrees for two charts on 2000-01-01 at 12Z and 14Z, lat 20 | house 1 starts at 0 degrees of the composite ASC's sign: 30, 60, 90 degrees |
| **Antipodal midpoint rule.** Midpoints of points within 0.001 degree of exact opposition depended on which side of 180 the separation fell. | `shorterArcMidpoint(10, 190.0004)` gave 280.0002, but `(10, 189.9996)` gave 99.9998 | `compositeMidpoint` gives 100.0002 and 99.9998: the arithmetic mean of the normalised longitudes, symmetric, with an `antipodal` notice. `shorterArcMidpoint`/`computeMidpoints` themselves are unchanged |
| **Exact transit events.** `exactDate` could be a closest approach whose residual only had to be inside the display orb. | Synthetic Saturn-to-natal-Sun conjunction (orb 1, 2026-07-20 to 2026-08-02): `exactDate` 2026-07-27T00:00:29Z, `exactOrb` 0.761792 | no exact event; the 0.7618-degree near miss is only returned with `includeClosestApproaches` |
| **`exactDate` / `exactOrb` meaning.** | `exactOrb` was the orb at the minimum found by that search | `exactDate` is a verified root and a true UTC instant; `exactOrb` is the angular residual (about 1e-10), not the display orb |
| **Every crossing is reported.** | a ternary search minimised the orb of the single closest aspect per scan step, to about one minute; other aspect angles and close double passes could be missed | every aspect crossing, including retrograde double and triple passes and velocity-zero tangents; scan steps are per body (fast bodies at most 0.25 day, all at most 2 days) |
| **Solar return precision.** | bracket stopped below 60 seconds: 2025-04-05T01:16:59.531Z in the synthetic example | solved to 0.001 s: 2025-04-05T01:16:39.533Z (20 s earlier); `returnPrecisionSeconds` is configurable, residual and bracket are returned |
| **Swiss Ephemeris initialisation.** | errors were logged with `console.error`; a wrong `ephePath` degraded silently to Moshier output; native ESM failed with `__dirname is not defined` | `getSwissEph` throws a typed `SwissEphError` with a `code` (for example `SWISSEPH_EPHEMERIS_FILES_UNAVAILABLE`, `SWISSEPH_ASSET_NOT_FOUND`), fails when the `.se1` files cannot be read, and native ESM initialises |

**Polar latitudes.** Placidus and Koch are undefined beyond the polar circle. `getBirthChart` now throws a typed `SwissEphError` (`SWISSEPH_HOUSES_UNAVAILABLE`) with an actionable message; pass the opt-in `houseSystemFallback: "whole-sign" | "equal" | "porphyry"` to substitute a system explicitly. A substitution is recorded in `chart.houseSystem` and `chart.houseSystemSubstitution`, never silent.

Output you may have stored from any of these (sect, Fortune, whole-sign composite cusps, solar-return instant, "perfection" lists) should be recomputed. A Placidus chart's `sect` and Fortune only change when the house-based approximation was wrong for that chart.

Related additions you do not have to adopt: `getSect(sunHouse)` is deprecated (use `chart.sect` or `computeSect`); `chart` objects gain `houseSystem`, `sectDetails`, `lots` and `moonPhase`; `getSwissEphInfo()` and `calculatePlanetPositionDetailed()` report which ephemeris actually produced a value, and `strictEphemeris` turns a silent Moshier substitution into a `SwissEphEphemerisMismatchError`.

`getAnnualProfection` (legacy) still reads the house sign and is only right for whole-sign charts. `getAnnualProfectionTimeline` counts from the ascendant sign and is right for every recorded house system.

## Runtime and packaging

- `await getSwissEph()` resolves the bundled assets next to the running module in both CJS and native ESM (`import.meta.url` or `__dirname`). Explicit `wasmPath` / `ephePath` still win.
- Failure to initialise is an exception, not a console message. Catch `SwissEphError` and check `error.code`.
- Library code does not write to `console.error` during initialisation. Setup notices go to stderr (or your `onRuntimeNotice`).

## CLI

- Impossible dates are rejected before any `Date` is built: `2026-02-30`, `2026-04-31` and `1900-02-29` exit `INVALID_DATE`; years 0001 to 0099 are no longer remapped to 1900 to 1999. See the [CLI reference](/getting-started/cli/).
