# A civil-date layer for date-only calculations

Numerology and several time-keyed techniques (profections, firdaria boundaries) work on calendar days, not instants. They share timezone-free helpers in `src/civil-date.ts`.

## Context

The legacy numerology API took a JavaScript `Date` and read it with local getters, so callers had to construct local-noon values or mutate `process.env.TZ`. Elapsed-millisecond arithmetic gave one civil day two day numbers across a DST change, and `new Date(y, m, d)` reinterpreted years 1 to 99 as 1900 to 1999. The CLI accepted impossible dates such as `2026-02-30` because `Date` normalises them.

## Decision

- `CivilDate` (`{ year, month, day }`, years 1 to 9999) and a strict `YYYY-MM-DD` parser reject impossible dates before any `Date` exists.
- All arithmetic is integer arithmetic on day ordinals (`civilDayOrdinal`, `addCivilDays`, `diffCivilDays`), independent of timezone, DST and time of day.
- `completedYears` and `anniversaryInYear` implement birthday logic; a 29 February birthday falls on 1 March in common years.
- Legacy `Date` APIs are kept as adapters (`civilDateFromLocalDate`, `civilDateToLocalNoon`); the local-noon rule remains documented for them.
- The new numerology schedule API (`getNumerologySnapshot`, `generateNumerologyTimeline`) accepts only civil dates and returns half-open `[start, endExclusive)` intervals with nominal versus clipped bounds.
- The helpers are exported from the package root; they are not a sub-path module.

## Consequences

- New numerology code needs no timezone workaround, and the CLI validates dates through the same parser.
- Two date models coexist (civil dates and legacy `Date`); the migration guide lists every legacy behaviour change.
