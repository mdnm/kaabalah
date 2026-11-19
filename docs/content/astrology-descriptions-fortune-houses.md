# Astrology descriptions: Fortune in houses

## Scope and source

Twelve Fortune-house profiles only, under `pointHouses.parsFortunae` and numbered houses 1-12. Final `/tmp/kaabalah-fortune-houses-approved.json` is adopted exactly. Integration read audit shards `/tmp/kaabalah-fortune-houses-a.md`, `-b.md` and the final review; the earlier House 9 hold and preliminary draft wording are superseded by Mat's decision and the final approval.

Root reports actual read-only inspection of A10:2703-2773 plus the cited HOUSE table clauses. Integration relies on that supplied audit rather than reopening the course. Source: `class notes`; SHA-256 `a43be88f1c891018406b975288199fb6b5a431c16da475ef6452124e06063890`. Manifest teaching end is 2999, NOTAS start 3000. No NOTAS/private readings were consulted.

Table context 2822-2823 and headings 2824-2830 distinguish HOUSE as experience field from SIGN as manner. Only house-field clauses are adopted. Interleaved sign labels are not house claims, and sign manner is not transferred into these profiles.

## Adopted source ranges

| House | Physical inclusive A10 ranges |
| --- | --- |
| 1 | 2735-2737, 2834-2836 |
| 2 | 2739-2741, 2845-2846, 2848-2849 |
| 3 | 2743-2744, 2856-2856, 2858-2858 |
| 4 | 2746-2747, 2866-2868, 2870-2871 |
| 5 | 2749-2750, 2882-2886 |
| 6 | 2752-2753, 2896-2900 |
| 7 | 2755-2757, 2911-2913, 2915-2917 |
| 8 | 2759-2760, 2927-2931 |
| 9 | 2762-2763, 2941-2943, 2945-2946 |
| 10 | 2765-2766, 2955-2955, 2958-2959, 2963-2964, 2966-2966 |
| 11 | 2768-2769, 2971-2975 |
| 12 | 2771-2773, 2986-2988, 2990-2992 |

## Source qualifications and decisions

Much of the first passage is instructional. Learning themes remain learning themes; instructions are not converted into natural abilities or fixed traits. No imperatives, practices, rituals, guaranteed fortune/health/relationship outcomes, ages or invented numbers are added.

House 1 retains attention/image concerns as learning themes. House 2 uses personal values, talents and security from the HOUSE field without Taurus modes. House 3 preserves security through thought rather than material things and a dream/reality learning theme, excluding judging advice and Gemini manner.

House 4 retains possible haste/frustration and solid principles; solidity is not transferred to objectives. The Cancer label at 2869 is excluded. House 5 omits the ambiguous reflexive giving clause rather than interpreting it as giving oneself to others; children remain conditional, and desires are not guaranteed to come true. House 6 names health only as a domain; distance from a goal remains a possible tension, not guaranteed failure or a substituted feeling of distance. Virgo manner is excluded.

House 7 retains companionship versus avoiding loneliness, personal wishes and susceptibility to influence, without an imported acceptance motive or relationship outcome. House 8 uses introspection/mysteries and qualified humility/flexibility/non-possessiveness; death is not predictive and Scorpio manner is excluded.

Mat explicitly authorized BOTH distinct House 9 functions on 2026-11-16: the table field of fulfillment is wider-world understanding through travel, philosophy and religion; the earlier prose supplies everyday-life/work learning themes, necessary action without expecting rewards, and enjoyment of accomplishments. These are kept in separate sentences, with no invented balancing rule. Expectation of rewards does not impose unpaid work or any pay rule. The earlier hold is resolved; the review's remuneration paraphrase is not adopted. Sagittarius SIGN manner at 2948-2951 remains excluded.

House 10 includes acceptance, sustained effort, contribution and meaningful professional direction. OCR-corrupt prose is omitted; table fragments are split to exclude Capricorn manner at 2956-2957, 2960, 2962, 2965 and 2967. House 11 omits unlimited energy and does not make social restrictions a cause of restlessness; house friends/projects/shared solutions remain separate from Aquarius manner. House 12 uses final English “solitude,” inner life, dreams/images, connections/goals and dependents. The OCR-damaged ending is not reconstructed beyond the clear dependents reference; Pisces intuition/faith manner is excluded.

## API and preservation

Additive readonly `pointHouses` uses `DescriptionPoint` / `DescriptionHouseNumber`; `PointHouseDescriptionEntry` aliases the common readonly shape. `getPointHouseDescriptionEntry(point, house)` and `getPointHouseDescription` accept only integer runtime houses 1-12, without coercion, clamping or fallback. Own-property guards apply at both bank levels. English is default; case-sensitive `pt` prefixes select Portuguese. All nested copy/provenance is frozen.

Each row retains exactly five fields (`pt`, `en`, `keywords`, `src`, `reviewNotes`), paired keyword arrays and two lowercase-start sentences per language. All 345 prior rows and getters remain unchanged; total357. No future element labels or Capricorn decisions are applied.

Only the five agreed files are integration-owned. No index, calculations, CLI, package, existing export behavior, build, full suite or commit changes. Root owns other docs/helpers/final checks. Results are recorded in `/tmp/kaabalah-fortune-houses-integration.md` and test artifacts.

## Validation and next kind

410 astrology description tests and the full npm suite (1575 passed,0failed,0pending) passed with actual exit0. Build, typecheck, source hash/teaching bounds, public CJS/ESM lookups and documentation ownership checks passed. All345 prior rows remain unchanged; total357, including the complete25 Fortune concept/sign/house rows. Mat's house9 decision is applied as two distinct source functions. Next: four element profiles, applying the selected A8 labels after actual narrow reading796-813, then Capricorn polarity metadata, then the Chiron concept.
