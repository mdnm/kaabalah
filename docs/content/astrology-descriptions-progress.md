# Astrology descriptions: current implementation progress

Approved scope: batches 1-3, natal placements before basic profiles before additional points. One kind at a time; no npm publication.

- Completed: ten planet-sign sets (120 entries); planet-house sets sun, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune (108 entries). Total 228 bilingual lookup rows.
- Shared getters: getPlanetSignDescription/Entry and getPlanetHouseDescription/Entry. Imported deeply frozen readonly JSON; English default and pt* Portuguese. Unknown/unsupported combinations return undefined, with no generic fallback; houses require numbers 1-12.
- Files: src/astrology/descriptions.json/.ts and descriptions*.test.ts, existing additive astrology barrel export, public astrology API docs. One docs/content/astrology-descriptions-<planet>-signs.md or -houses.md source audit per kind.
- Validation: 268 description tests, npm run typecheck, build and public CJS/ESM Neptune-house getters pass; source hashes/bounds and unchanged prior data verified. Planet-sign milestone also passed build/typecheck/full suite (728 tests) and public CJS/ESM exports across120rows. Repeat complete checks at final handoff.
- Gaps/decisions: unimplemented sets absent explicitly; disputes, OCR and source qualifications remain in reviewNotes/audits. Mat chose astronomical north/south nodes without hemisphere inversion. Opposition and node dignity class conflicts need narrow review/Mat decision when relevant.
- Exact next factor: Pluto in houses. Pointers: A10:1685-2457; B:64352-65358; house4 heading mistakenly refers to MC. Read narrow actual bodies only; no new inventory, no private NOTAS reuse or client readings.
- Work occurs directly on main with one factor per commit. Separate calculation-correctness work belongs in Claude Code's feat/calc-improvements worktree; preserve its scope and coordinate before landing. This content workflow does not change calculations, index semantics, CLI, numerology, package or tsup.
