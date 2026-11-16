# Astrology descriptions: current implementation progress

Approved scope: batches 1-3, natal placements before basic profiles before additional points. One kind at a time; no npm publication.

- Completed: ten planet-sign sets (120 entries); planet-house sets sun, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto (120 entries). Total 240 bilingual lookup rows.
- Shared getters: getPlanetSignDescription/Entry and getPlanetHouseDescription/Entry. Imported deeply frozen readonly JSON; English default and pt* Portuguese. Unknown/unsupported combinations return undefined, with no generic fallback; houses require numbers 1-12.
- Files: src/astrology/descriptions.json/.ts and descriptions*.test.ts, existing additive astrology barrel export, public astrology API docs. One docs/content/astrology-descriptions-<planet>-signs.md or -houses.md source audit per kind.
- Validation: complete planet-placement milestone passed npm run build, npm run typecheck and npm run test (870 passed, 0 failed or pending). Public CJS/ESM checks exercised all240 exact JSON entries, language selection, deep immutability and explicit gaps. All7 cited source hashes match the research snapshot; every inclusive range is eligible teaching. Per-kind description tests:283. Repeat complete checks at final handoff after subsequent kinds.
- Gaps/decisions: unimplemented sets absent explicitly; disputes, OCR and source qualifications remain in reviewNotes/audits. Mat chose astronomical north/south nodes without hemisphere inversion. Opposition and node dignity class conflicts need narrow review/Mat decision when relevant.
- Exact next factor: House themes (12). Pointers: A6:6-49; A8:814-888; B:21398-23106. Read narrow actual bodies only; no new inventory, no private NOTAS reuse or client readings.
- Work occurs directly on main with one factor per commit. Separate calculation-correctness work belongs in Claude Code's feat/calc-improvements worktree; preserve its scope and coordinate before landing. This content workflow does not change calculations, index semantics, CLI, numerology, package or tsup.
