# CLI Power User Findings

Captured from repeated real-world CLI sessions and reviewed against the current codebase on 2026-04-09.

## Confirmed And Fixed

- **JSON stdout contamination was real**: the Swiss Ephemeris runtime emitted `Setting ephemeris path to:` through `console.info`, which polluted stdout and broke `JSON.parse` for `--json` consumers. Fixed by routing the runtime notice to stderr while keeping stdout strictly JSON.
- **`--max-orb` was inconsistent across commands**: transits already supported it, but `astrology`, `astrology:synastry`, `astrology:composite`, and `astrology:solar-return` did not. Fixed by adding `--max-orb` filtering to all of them.
- **Aspect-type filtering was inconsistent across commands**: transits supported `--aspects`, but the rest of the aspect-heavy commands did not. Fixed by adding `--aspect-types` to `astrology`, `astrology:synastry`, `astrology:composite`, and `astrology:solar-return`, and by accepting it as an alias for transit filtering as well.
- **The e2e suite was masking the JSON bug**: the tests used a fallback parser that scanned stdout for the last JSON-looking line. Fixed by making the tests require strict `JSON.parse(stdout)` and adding coverage for the ephemeris notice path and the new synastry/composite filters.

## Valid Requests That Still Make Sense

- **Profiles**: this is the highest-value remaining ergonomics improvement. It would remove repeated natal and transit location typing and fits the existing config-oriented CLI design.
- **Batch synastry/composite processing**: the complaint is valid. Requiring shell loops and temp files for many pairs is bad ergonomics.
- **Kaabalah-native transit annotation via `--tree`**: this is a strong differentiator and a better fit for the project than generic astrology tooling.
- **Tarot deck/image CLI exposure**: the library already has deck-specific representations and image URLs, so exposing them through the CLI would be low-risk and useful.
- **`gematria --resolve-paths`**: valid. The gematria result already knows the Hebrew letters; adding path and ark-annu correspondence resolution would save follow-up `tree:node` calls.

## Valid But Needs Reframing

- **`--fields` is not fundamentally broken for nested objects**: field projection works for real dot-paths such as `aspects`, `solarReturnChart.aspects`, or `solarReturnChart.houses.ascendant`. The actual problem is discoverability and the lack of aliases like `angles`.
- **`tarot:mythic` and `tarot:image` should probably not be separate top-level commands**: a cleaner surface is `tarot:card <query> --deck=mythic` plus an image-only mode or flag, because the deck/image model already exists in the tarot module.
- **“Astrocartography across cities by comparing house cusps” is misnamed**: that workflow is closer to relocated chart comparison than classic astrocartography. It should not be added under `astrology:astrocartography` unless the output is actually angle-line or paran-based.

## Requests I Would Push Back On

- **`correlate --transits=... --spread=...` as a dedicated command**: the idea is interesting, but the proposed interface is too bespoke and interpretive for the current CLI. It should come after more general primitives exist.
- **`--rank-by=benefic` or `--rank-by=assertive` for transit windows**: possible, but it hardcodes subjective scoring heuristics into the CLI. This belongs behind an explicit interpretation layer, not the first pass of transit ranking.

## Recommended Build Order

1. **Profiles**
   Add named natal profiles and named locations backed by config files.
2. **Batch synastry/composite**
   Prefer a JSON payload shape like `pairs: [...]` over a shell-heavy loop model.
3. **`--tree` transit annotations**
   Add sephirotic and correspondence tagging directly to aspect output.
4. **Tarot deck/image CLI exposure**
   Surface existing library capabilities through `tarot:card --deck=...` and image output.
5. **Field aliases / slimmer output modes**
   Add friendly aliases like `angles` and optionally a piping-oriented tabular format.

## Implementation Notes

- The fixes shipped from this review were:
  - clean JSON stdout for astrology commands
  - `--max-orb` on `astrology`, `astrology:synastry`, `astrology:composite`, `astrology:solar-return`
  - `--aspect-types` on those commands and as a transit alias
  - stricter e2e coverage so stdout contamination now fails tests
- If profiles are implemented, they should likely reuse the existing config precedence model instead of inventing a second persistence system.
- If batch synastry is implemented, prefer `--input-json=-` with a documented schema over a dense shell-escaped flag argument.
