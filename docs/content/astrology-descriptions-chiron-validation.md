# Astrology descriptions: completed Chiron validation

Validated2026-11-16 against main09ff826 plus the shared-placement kind. Chiron supplies13 unique bilingual entries: concept1 plus12 source-declared sign-or-house accounts. The library total is370, not382; placement queries provide24 aliases to12 canonical records, not24 independent teachings or144 combinations.

## Shared source and API

`getPointDescription/Entry('chiron')` returns the separate general concept. `getPointSignDescription/Entry('chiron', sign)` and `getPointHouseDescription/Entry('chiron', house)` reuse `chironPlacements`. Each declared sign/house pair returns the same frozen object by reference. A private frozen literal map records only the12 verified source headings; it does not equate signs/houses elsewhere. Fortune keeps its distinct sign manner and house field.

All descriptions remain imported JSON with deeply frozen readonly entries, English default and case-sensitive pt-prefix selection. Unknown/prototype names and invalid houses, including numeric strings/fractions/nonfinite values, return undefined. No general-profile fallback or chart calculation is introduced.

Primary A15:122-218 supplies the concept;345-746 supplies the12 explicitly combined accounts, with selected gentler clauses280-281 and288-289. All citations are precise inclusive physical lines before teachingEnd798/NOTAS799. The supplemental book5756-5774 is a bounded software-output critique with nearby transit context, not a contrary natal profile. No private notes or client readings are sources. Clinical claims, fixed childhood/family events, guaranteed healing/outcomes, ages and practices are not imported into reusable profiles; the per-kind audits retain the chosen themes and qualifications.

## Validation

- Full `npm run test -- --maxWorkers=1 --minWorkers=1 --reporter=json --outputFile=/tmp/kaabalah-chiron-batch-full-tests.json`: 1591 passed,0failed,0pending,actual exit0.
- All astrology description tests in one fork:426 passed,actual exit0.
- Build and typecheck: actual exit0.
- CJS/ESM public checks: all370 exact entries, languages, metadata, gaps and shared Chiron alias identity passed. Recursive immutability/mutation rejection also checked by colocated kind tests.
- Aggregate provenance:370 entries,14 cited source hashes match,all ranges eligible. Evidence `/tmp/kaabalah-chiron-batch-provenance.json`.
- All358 earlier rows unchanged; existing Fortune getter paths retained. Chiron concept test's prior placement gaps were updated only for the newly approved shared coverage.
- Public docs remain within the bilingual section. No index,calculation,CLI,package-version,publication or push changes. Unrelated `.DS_Store` deletion remains untouched.

Next at this milestone: Lilith general concept1, then its12 signs as a separate kind. Subsequent source audit corrected the general pointer to A18:131-160;109-129 is the sexual sign-summary, not the general concept. Mean/true are calculation modes with shared interpretation; do not generate separate interpretation grids or unsupported house/aspect profiles. Current exact state is in astrology-descriptions-progress.md.
