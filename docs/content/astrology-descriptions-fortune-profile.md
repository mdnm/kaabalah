# Astrology descriptions: general Fortune point

## Scope and source

One general natal point description, keyed by canonical chart node `parsFortunae`. No sign or house profiles. Integration adopts `/tmp/kaabalah-fortune-profile-approved.json` unchanged after the root's planetary-relations clarification, with the primary audit and review supplied alongside it. No raw draft is used.

The primary audit records actual read-only inspection of `class notes` at physical inclusive lines 2459-2468 and 2516-2578. Integration relies on that audit and does not reopen the course. Teaching ends at 2999; private notes begin at 3000. Recorded SHA-256: `a43be88f1c891018406b975288199fb6b5a431c16da475ef6452124e06063890`. No NOTAS or private readings were consulted.

| Adopted range | Meaning |
| --- | --- |
| 2462-2463 | virtual point, mathematical relation of Sun, Moon and Ascendant |
| 2553-2558 | potential possessions, prestige and reputation; more through luck than effort |
| 2567-2569 | point placement and planetary relations |
| 2574-2578 | ruler placement and planetary relations |

## Qualifications and exclusions

Potential remains potential, not fixed biography or guaranteed fortune. The reading considers placement and planetary relations of both point and ruler; relations here are planetary, not interpersonal outcomes. The audit's earlier vitality suggestion is explicitly corrected later in that audit and is not adopted. No health claim, advice or practice is added.

class notes:2464-2468 distinguishes the natal point from the entire Ark Annu 10 Wheel of Fortune. The profile preserves that distinction. Formula/day-night and profection context at 2516-2549 is unadopted; timing interpretation from 2580 onward is outside scope. No formula, sect or timing behavior changes.

## API and preservation

The additive `points` bank contains only `parsFortunae`; `DescriptionPoint` is that literal alone. `PointDescriptionEntry` aliases the common readonly entry shape. `getPointDescriptionEntry` returns the frozen authored record; `getPointDescription` defaults to English and selects Portuguese only for case-sensitive `pt` prefixes. Unknown keys, aliases and inherited properties return `undefined`. No general-planet fallback is added.

All 332 previous rows and existing getters are preserved. The approved entry has the established five top-level properties (`pt`, `en`, `keywords`, `src`, `reviewNotes`), with paired language arrays inside `keywords`; this follows the existing schema. Both languages retain the exact approved two lowercase-start sentences.

Only the JSON bank, description module, two Fortune tests and this document are integration-owned. No index exports, calculations, CLI, package, build or commit changes are part of this integration. Root owns broader documentation and final checks. Validation results are recorded in `/tmp/kaabalah-fortune-profile-integration.md` and accompanying test artifacts.

## Validation and next kind

397 description tests (394 astrology and3 core/IChing) passed in one fork worker with actual exit0. Build, typecheck, source hash/teaching bounds, public CJS/ESM lookups and documentation ownership checks passed. All332 previous rows are unchanged; total333. The latest full suite at e0876c2 passed1552 tests before this concept addition. Next: Part of Fortune in signs12, class notes:2775-2823 and the repeated combined presentation2824-2998; distinguish sign-specific claims from house content before synthesis. Houses12 follow separately.
