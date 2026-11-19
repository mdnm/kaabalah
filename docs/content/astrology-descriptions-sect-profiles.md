# Astrology descriptions: diurnal and nocturnal sect

## Scope and actual source audit

Two basic concepts only in `sects.diurnal` / `sects.nocturnal`, adopted exactly from final `/tmp/kaabalah-sect-profiles-approved.json`. Integration read the PASS review and the restored audit ONLY after confirming its heading “Independent source audit: diurnal and nocturnal sect”. The incidentally overwritten audit/review files were not altered by integration.

The independent audit reports actual narrow physical inclusive reads class notes:2518-2547 and class notes:383-405, also verified by Root. Integration relies on those inspections and did not reopen sources. No whole course, private NOTAS/private readings or wider research.

| Source | SHA-256 | Adopted clauses |
| --- | --- | --- |
| `class notes` | `a43be88f1c891018406b975288199fb6b5a431c16da475ef6452124e06063890` | 2525-2526 |
| `class notes` | `6cbf3c629e855bbfeb659e29b2681a8d8be940e31ef11cb38a83e7d0fbe46238` | 383-384 |

class notes teachingEnd2999/NOTAS3000 is established in prior source manifests. Class notes' restored audit records519 physical lines and the bounded383-405 read, but does not give a manifest teachingEnd; integration does not invent one. All adopted class notes lines are the independently audited teaching clauses, not private material.

## Horizon and source-context limits

class notes defines diurnal as Sun above the physical horizon and nocturnal as Sun below it. Its house7-12/1-6 illustration at2527-2529 belongs to the Part of Fortune explanation, not a universal house-based sect test. Formula/graphic material2530-2547 is not adopted.

class notes:383-384 identifies Sun as diurnal sect light and Moon as nocturnal sect light within profection rules. Each second sentence explicitly retains that context. Valens example393-405 is not generalized. No timing command, natal personality, planet-by-sect grid or essential/accidental dignity inference is added.

The source does not specify equality at the horizon. Existing code determines sect from geometric altitude by default, strictly greater than threshold(default0) for diurnal, so exact horizon is nocturnal. That is implementation context recorded in reviewNotes, not a rule retroactively attributed to source or a new convention. No calculation behavior changes.

## Pure API and preservation

The existing exact `Sect = "diurnal" | "nocturnal"` is imported TYPE-ONLY from ./index; it is not redeclared/re-exported or loaded at runtime. Common SectDescriptionEntry aliases the readonly shared record. `getSectDescriptionEntry(sect)` is an own-key guarded bank lookup; `getSectDescription(sect,language?)` defaults to English and selects Portuguese only for case-sensitive pt prefixes. No chart/altitude/house inference, runtime index/WASM/calculation call, normalization or fallback.

Existing recursive freeze covers both records and metadata. All391 prior record values/getter bodies are preserved; total393. New tests block runtime index/swisseph imports, check exact type/signatures/identity/locales/unknown/prototype/boolean/altitude gaps/freeze, and preserve horizon/context/equality distinctions. Two lowercase-start PT/EN chart-owner sentences, paired keywords, exact five fields.

## Ownership and validation

Only the agreed five files: descriptions.json/.ts, descriptions.sect-profiles.test.ts, descriptions.sect-profiles-source.test.ts and this audit. No old-test changes, calc/index/CLI/package/tsup/release or other-doc edits, build/fullsuite/commit or socket recovery. Root owns helpers/other docs/checks/build/commit. Results: `/tmp/kaabalah-sect-profiles-integration.md`, `.tests.json`, `.tests.exit`.

Root manifest verification: class notes teachingEnd468/privateNOTAS469; adopted383-384 is inside teaching. Aggregate393 entries/16 source hashes and inclusive teaching bounds pass. Final build and typecheck actualexit0; all460 astrology-description tests actualexit0. Public CJS/ESM exact entries, languages, freezing, unsupported gaps and existing aliases passed; all391 earlier rows unchanged.
