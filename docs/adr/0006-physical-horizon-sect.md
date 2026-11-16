# Sect from the physical horizon

A chart is **diurnal** when the Sun is above the horizon at the birth place and **nocturnal** otherwise. `getBirthChart` computes this from the Sun's altitude (`src/astrology/sect.ts`), not from the Sun's house.

## Context

`getSect(sunHouse)` returned `diurnal` for houses 7 to 12. That is only true when the house cusps coincide with the horizon (Placidus-like systems). In whole-sign or equal houses the Sun near sunrise or sunset can sit in the wrong house, so the same sky was diurnal in one house system and nocturnal in another. Because sect selects the Fortune and Spirit formulas, the firdaria sequence and triplicity rulers, the error propagated.

## Decision

- Sect is computed with Swiss `swe_azalt`: diurnal when the Sun's **geometric** (unrefracted, centre-of-disc) altitude is strictly greater than 0 degrees. `basis: "apparent"` and a custom `horizonAltitude` threshold are options.
- **Exact-horizon convention**: an altitude exactly equal to the threshold is nocturnal. The convention is echoed in `chart.sectDetails.method.exactHorizon`.
- Sect is therefore identical in every house system. Both altitudes are returned so callers can apply a different convention.
- Fortune and Spirit are sect-reversed counterparts (Fortune + Spirit = 2 x ASC); they use this sect.
- `getSect(sunHouse)` stays exported and is deprecated.

## Consequences

- Charts in non-Placidus systems near the horizon can change sect and lots versus earlier releases (documented with values in the migration guide).
- The Moon phase and lots are always computed in `getBirthChart` and house-system independent.
