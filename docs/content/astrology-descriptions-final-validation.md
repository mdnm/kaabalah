# Bilingual astrology descriptions: completed approved scope

Validated2026-11-16 against main77d4f3c plus the final directed-house kind. The approved batches1-3 are complete:431 canonical bilingual entries, with source-declared shared aliases counted once.

| Kind | Canonical entries |
|---|---:|
| Planet signs |120|
| Planet houses |120|
| Numbered houses |12|
| Ascendant/MC/IC signs |36|
| Basic planets/signs/elements/modalities/polarities/angles/aspect types |44|
| Fortune concept/signs/houses |25|
| Chiron concept/shared sign-or-house accounts |13|
| Lilith concept/signs shared mean/true |13|
| Natal retrograde planet profiles |8|
| Sect concepts |2|
| Lunar-node concepts/signs/directed house axes |38|
| Total |431|

## Final checks

- npm run build: actualexit0.
- npm run typecheck: actualexit0.
- Existing npm run test suite: 1625passed,0failed,0pending,actualexit0. Single worker avoids the previously observed Node24 worker-exit issue. Artifacts /tmp/kaabalah-astrology-final-tests.json and final-build/typecheck/tests logs, with actual exit files.
- No node-description tests were added or per-kind suites repeated after Mat’s acceleration instruction. Source reading, editorial review, minimal typed APIs and docs continued; final checks above are the existing repository checks.

## Source and API boundaries

Every authored record keeps pt/en, paired source keywords, precise inclusive course-relative Markdown fragments and reviewNotes. Imported JSON remains recursively frozen/readonly; getters default to English and use Portuguese only for case-sensitive pt-prefix languages. Unsupported keys/combinations remain absent with no general-profile fallback.

Nodes use explicit astronomical north/south roles without hemisphere inversion. Both stored mean/true nodes are North calculation modes; the preexisting points adapter can expose derived South points. New descriptions do not derive positions. Node-sign entries are independent north/south profiles. The12 primary-directed house accounts support24 explicit role/house queries: North1 andSouth7 share one object, while North7 is the reverse direction. The private alias map is source metadata, not a new chart calculation. Houses require integer1-12. Retrograde profiles require an available finite negative longitudeSpeed; no natal boolean/coercion.

Mat’s A8 temperament labels, Capricorn feminine/negative convention, opposition=tension, A15 nodal dignity context and distinct Fortune9 realization/learning themes are applied, with disagreements retained. Parent-sex assignments remain unadopted. No pending required editorial decision remains for the implemented scope.

Original PDF reference text PDF was visually checked: PDF physical pages506/508 for node signs and507/509 for houses (latter printed509/511). SHA25647a85a1b330344cdfc59d684eb573e6ca1035b988263a667b2336e30e0b1a1f5. Images resolve the OCR column order; corresponding Markdown physical fragments stay in src, and PDFpage references stay in notes/audits. Verify original page images before accepting future OCR gaps. Course/PDF remained read-only; no privateNOTAS/private reading was used as entry evidence.

No calculations,index,CLI,numerology,package,tsup,release-version or publication/push changes. Claude’s release6.17.0 work is preserved; own changelog bullets are under Unreleased. The unrelated .DS_Store deletion remains untouched.

No further factor is automatically authorized: Descendant-sign/cusp grids, specialist sets, timing,synastry,symbolic degrees and Chinese astrology remain outside this work. Detailed audit per kind lives in docs/content/astrology-descriptions-*.md; compact handoff is astrology-descriptions-progress.md and the connected research note.
