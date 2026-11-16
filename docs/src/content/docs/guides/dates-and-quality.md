---
title: Dates, time and input quality
description: How Kaabalah reads calendar dates, wall-clock times, timezones and incomplete birth data, and how to say what you do not know.
sidebar:
  order: 4
---

Three different kinds of date input exist in the library. Using the right one removes every timezone workaround.

## Civil dates (date-only values)

A **civil date** is a calendar day with no time and no timezone: `{ year, month, day }` (`CivilDate`) or a `"YYYY-MM-DD"` string. The numerology schedule API (`getNumerologySnapshot`, `generateNumerologyTimeline`, `describePartialBirthDate`, ...) accepts only civil dates. You do not need to build a local-noon `Date`, and you never need to set `process.env.TZ`.

```typescript
import { getNumerologySnapshot } from 'kaabalah/numerology';

getNumerologySnapshot({ birth: '1985-03-14', asOf: '2010-08-20' }).completedAge; // 25
```

Impossible days are rejected before JavaScript can normalise them: `2026-02-30`, `2026-04-31` and `1900-02-29` throw `NumerologyScheduleError` (`code: "INVALID_DATE"`); the CLI exits with `INVALID_DATE`. Years run from 0001 to 9999 and are always read as written (years 1 to 99 are never remapped to 1901 to 1999). All arithmetic is integer arithmetic on day ordinals, so it is independent of DST. The helpers are exported from the package root `kaabalah`:

```typescript
import { civilDate, parseCivilDate, completedYears, addCivilDays, formatCivilDate } from 'kaabalah';

const leapDay = civilDate(2024, 2, 29);
parseCivilDate('2026-02-30');                                  // null
completedYears(leapDay, { year: 2025, month: 2, day: 28 });    // 0
completedYears(leapDay, { year: 2025, month: 3, day: 1 });     // 1 (a 29 February birthday completes on 1 March in common years)
formatCivilDate(addCivilDays(leapDay, 366));                   // "2025-03-01"
```

(Real output of this script.) Intervals are half-open `[start, endExclusive)` everywhere.

## Legacy `Date` APIs: the local-noon rule

The older numerology functions (`calculateKaabalisticLifePath`, `calculateCycles`, `calculatePersonalCycles`, `getDateEnergies`, ...) take a `Date` and read it with the **local** calendar getters. Construct date-only values at local noon so the calendar day is stable at every timezone offset:

```typescript
new Date(1990, 5, 15, 12);   // good: local noon, 15 June
new Date('1990-06-15');      // bad: UTC midnight, which is 14 June west of UTC
```

Years 1 to 99 need `setFullYear` because the numeric constructor maps them to the 1900s; `civilDateToLocalNoon(civilDate)` does it for you. The astrology functions that take a `Date` read it as a local wall-clock time unless you pass `timeZoneSettings` (see below); prefer `LocalDateTimeParts`.

## Wall-clock times and timezones (astrology)

`getBirthChart` takes either a `Date` or `LocalDateTimeParts` (`{ year, month, day, hour?, minute?, second? }`) plus `timeZoneSettings`:

| `timeZoneSettings` | Meaning |
|---|---|
| `{ timeZone: 'Europe/Paris' }` | IANA zone, DST rules applied for that date |
| `{ utcOffsetMinutes: 120 }` | Fixed offset, minutes east of UTC |
| `{ autoTimeZone: true }` (default) | Zone looked up from the coordinates |
| `{ treatAsUTC: true }` | The value is already a UTC instant |

Solved instants (exact transits, returns, Davison midpoints) are always UTC and are cast with `treatAsUTC`; do not pass a local zone for them.

To make the assumption explicit, use `getQualifiedChart`, whose `provenance` reports the basis (`iana-zone`, `utc-offset`, `auto-from-coordinates`, `utc-instant`, `local-mean-time`, `unknown-place`), the resolved offset and DST flag, the place role (`birthplace`, `residence`, `event`, `unknown`) and notes. `localMeanTime: true` reads the wall-clock time as local mean time of the longitude, for records from before standard time.

## Input quality

Say how good the birth time is. `getQualifiedChart({ quality, ... })` accepts `recorded`, `rectified`, `untimed` and `partial`; numeric output is never invented for what is unknown. An untimed case yields placeholder positions at local noon, no Moon degree, no angles, houses, lots or sect, and the sign range the Moon covers during the whole local day. See [Input quality and untimed charts](/modules/astrology/#18-input-quality-and-untimed-charts) for a complete, executed example.

For numerology, partial birth dates are explicit types (`{ kind: "month-day" }`, `{ kind: "year-month" }`, `{ kind: "year", approximate }`, `{ kind: "unknown" }`); computable values are returned and the rest carries a structured reason. `summarizeBirthDateCandidates` reports invariants and possible value sets over the valid days of a known month without ever choosing a date. A missing death date is not evidence that someone is alive: nothing is inferred.

## Choosing time keys for derived techniques

- Progressions and solar arcs take a UTC `target` and an explicit year-length convention.
- Annual profections and the numerology birthday frame turn over on the birthday; a 29 February birthday is on 1 March in common years.
- Firdaria use 365.25-day years.
- Dashas require an explicit `yearLengthDays`.
