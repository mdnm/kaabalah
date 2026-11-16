# Brazilian Portuguese content inventory

Verified 2026-11-16 on main, commit 6169aab, package 6.15.0. Fetch confirmed HEAD equals origin/main. No worktree was created. Tarot meanings and deck descriptions now have a draft Portuguese API; see pt-BR-api.md and tarot-review.json.

Mat confirmed that Portuguese originals, where available, are under the class directory and approved unifying duplicated tarot meanings. The class directory `/Volumes/AKASH/aula kaabalah` is available, with tarot, iching, numerology, gematria, astrology, ifa, portuguese and numbered class directories. Availability does not establish which files are authoritative.

## Requested implementation order

1. Tarot meanings: `src/tarot/data.ts` has 78 `meaning` and 78 `papusMeaning` entries. `src/core/constants.ts` has 156 `meaning` assignments, including tarot deck descriptions. Preserve deck-specific names, meanings, reversed meanings and keywords wherever populated. Audit existing Portuguese before translating: the `papus_pt` deck identifier does not guarantee that its current meaning is Portuguese. Gamu reads `getTarotCardProfile(lookup).descriptionsByDeck` and `getTarotRepresentation(lookup, deckId).description`. Both APIs currently lack a language argument. Resolve duplication with Mat before changing sources; keep compatibility tests for all current English exports.
2. Tarot spreads: `src/tarot/spreads.ts` contains spread and slot labels/descriptions, helper-generated numeric labels, sphere names, and dynamic display labels. Static syntax contains 40 `label`, 13 `displayLabel` and 7 `description` assignments, including variable/computed values. These are syntax counts, not a count of unique translatable rows. Preserve identifiers, sphere spellings and numeric labels.
3. I Ching: `hexagrams.json` contains 64 English names, 64 judgments, 64 images, 384 lines, one useNine and one useSix. Names already have `names.pt.json` and `getHexagramName`. The remaining 514 classical texts need Portuguese. Preserve Chinese and English. Gamu consumes `getIChingReading(...).oracle` and `cast.hexagram.text`; localization must reach both. Existing `getHexagramDescription` is a different, plain-language description and cannot substitute for these texts.
4. Numerology: inventory of exported tables below. Counts describe current literal table contents, not final translation IDs.
5. Gematria: `INDIVIDUALITY_NUMBER_MEANINGS`, `PERSONALITY_NUMBER_MEANINGS`, `SYNTHESIS_NUMBER_MEANINGS` each contain 13 rows, 39 texts total.
6. Canonical tree: `src/core/systems/kaabalah.ts` contains 22 `meaning`, 28 `colorDescription` and 3 `noteDescription` assignments. Some note descriptions are computed. Sphere English names and shared descriptions also come from `core/constants.ts`; cover inherited data rather than only this loader's literals.
7. Semantic astrology markers: `src/semantic/kaabalistic.ts` has planet, zodiac, angle and node metadata and generated marker labels. Static syntax contains 40 `label`, 41 `shortLabel` and 3 `itemLabel` assignments. Preserve symbols, lookup keys and targets. Count translatable rows separately from glyphs and generated labels during implementation.

| Numerology table | Rows | String values in row contents |
| --- | ---: | ---: |
| CYCLE_MEANINGS | 7 | 28 |
| NUMEROLOGY_KEYWORDS | 13 | 39 |
| DAY_OF_BIRTH_MEANING | 31 | 31 |
| LIFEPATH_MEANING | 13 | 119 |
| CHALLENGE_MEANING | 9 | 9 |
| CHALLENGE_HEALTH_MEANING | 14 | 14 |
| PERSONAL_CYCLE_KEYWORDS | 13 | 43 |
| PERSONAL_YEAR_DESCRIPTIONS | 13 | 13 |

## Additional areas investigated before implementation

### Astrology

- `decans.ts`: constructs English tarot names for 36 decans from nine ranks and four suits. Also returns the existing sign and ruler identifiers. Add a localized display API without changing those identifiers or existing results.
- `dignity.ts`: calculation results are booleans and sign/planet identifiers. No interpretive prose. Domicile, exaltation, detriment, fall and peregrine need display labels wherever exposed; retain field names and identifiers.
- `firdaria.ts`: seven planets, two lunar node identifiers and diurnal/nocturnal sect values. No interpretive prose. Provide display labels while preserving period data and existing enum values.
- `profections.ts`: sign and ruler identifiers; no interpretation table. Contains an English error for a target year before the birth year.
- Other astrology surfaces include sign/planet/house/node names, aspect terminology, and runtime error/notice strings in `index.ts`, `aspects.ts`, `astrocartography.ts` and `swisseph.ts`. The CLI exposes further display labels for these calculations. Do not translate protocol identifiers in place.

### Ifa

`src/ifa/index.ts` only computes Odu numbers. No Odu names, verses, judgments or meaning catalog exists here. Its only prose literal is the invalid-date error. `src/cli/commands/ifa.ts` prints Odu, Left, Right, North, South, East, West and Center labels. No new interpretive content should be invented.

### Other tree systems and shared core data

- `hermetic-qabalah.ts`: 41 color description and 4 note description assignments. Reuses sphere, world and Hebrew-letter data from constants. Keep system IDs and source tradition names stable.
- `lurianic-kabbalah.ts`: no local meaning/color/note description assignments. Reuses `SPHERES_DATA`, `FOUR_WORLDS_DATA` and `HEBREW_LETTERS_DATA` from constants; absence of local literals does not mean absence of visible English.
- `core/constants.ts`: also contains 15 `englishName`, 22 `yvritMeaning`, 12 `noteDescription` and 12 `colorDescription` assignments. These include shared sphere/world/letter content beyond duplicated tarot descriptions. Add localized access beside these existing exports.

### CLI

There is currently no language flag in the CLI contract. Inventory includes these surfaces:

- `src/cli/contract.ts`: command, argument and flag descriptions and examples.
- `src/cli/commands/help.ts`: generated general help, usage text, headings and required/default annotations.
- `src/cli/commands/{tarot,iching,numerology,gematria,tree,astrology,ifa}.ts`: headings, labels, status messages, card/spread/deck descriptions, missing-result messages, validation failures and dynamic summaries.
- `src/cli/runtime/{args,config,input,stdin,validation,errors,execution}.ts` and `src/cli/app.ts`: parse/config/input errors, usage/help hints, fatal and interruption messages. `output.ts` serializes JSON and must retain machine keys. `debug.ts` emits diagnostics.
- I Ching human output delegates to `src/iching/index.ts`; include its display text in the CLI localization pass.
- Swiss Ephemeris notices/errors can reach stderr from library code; localize library-owned text where feasible and keep external exception details distinct.

Existing command modules have these console call-site counts, including blank lines and data-only output, not unique translation rows: astrology 112, gematria 15, help 14, iching 1, ifa 9, numerology 58, tarot 33, tree 45. Add a language selector while keeping English as the default, JSON keys, error codes, command names and flag names stable.

## Translation provenance and validation

Use the existing en/pt or en/pt-BR row pattern and `language?.startsWith("pt")` selection. Every added Portuguese row needs a stable identity and source classification: Portuguese original with source location, or agent translation pending Mat's review. Agent draft tarot translations are enumerated in tarot-review.json; they are not approved for release. Mat's approval is required before releasing agent translations. Do not publish npm.

Each implementation area needs its own commit, documentation, coverage checks against English row IDs, nonempty Portuguese checks and compatibility checks for default English. Validate locale selection for pt and pt-BR, plus English fallback. Final checks: `npm run typecheck` and `npm run test`. Add scoped Unreleased entries without changing the existing visual entry. Preserve all unrelated working changes, including the deleted `.DS_Store`.

Final handoff must contain the exact implemented Gamu calls, all agent-translated row IDs and approval status. API signatures remain undecided until implementation; no proposed call should be presented as available today.
