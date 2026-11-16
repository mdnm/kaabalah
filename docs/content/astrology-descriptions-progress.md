# Astrology descriptions: current implementation progress

Approved scope: batches 1-3, natal placements before basic profiles before additional points. One kind at a time; no npm publication.

- Completed: ten planet-sign sets (120 entries); planet-house sets sun, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto (120 entries). Total 252 bilingual lookup rows, including 12 numbered house themes.
- Shared getters: getPlanetSignDescription/Entry, getPlanetHouseDescription/Entry and getHouseDescription/Entry. Imported deeply frozen readonly JSON; English default and pt* Portuguese. Unknown/unsupported combinations return undefined, with no generic fallback; houses require numbers 1-12.
- Files: src/astrology/descriptions.json/.ts and descriptions*.test.ts, existing additive astrology barrel export, public astrology API docs. One docs/content/astrology-descriptions-<planet>-signs.md or -houses.md source audit per kind.
- Validation:294 description tests, typecheck, build and public CJS/ESM checks for12 house themes and all240 prior placements pass. House-source hashes/ranges verified. Historic complete planet-placement milestone passed build/typecheck/full870 tests before this kind; repeat full checks at final handoff.
- Gaps/decisions: parental-gender assignments remain unadopted; Mat clarified broad family themes. unimplemented sets absent explicitly; disputes, OCR and source qualifications remain in reviewNotes/audits. Mat chose astronomical north/south nodes without hemisphere inversion. Opposition and node dignity class conflicts need narrow review/Mat decision when relevant.
- Exact next factor: Ascendant in signs (12). Pointers:A6:51-255; B:65359-66689. Preserve angle identity independent of house number, verify current chart keys before code. No new inventory, private NOTAS reuse or client readings.
- Work occurs directly on main with one factor per commit. Separate calculation-correctness work belongs in Claude Code's feat/calc-improvements worktree; preserve its scope and coordinate before landing. This content workflow does not change calculations, index semantics, CLI, numerology, package or tsup.
