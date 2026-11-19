# Planet placements: complete validation milestone

Date: 2026-11-16. Content through `8435ecf` on main.

All ten ordinary natal planet-sign sets and all ten planet-house sets are complete: 120 + 120 = 240 bilingual entries. Each kind has its own source audit and commit. The data remains imported JSON with deeply frozen readonly entries and metadata; typed getters select English by default and Portuguese for the exact `pt` prefix. Unsupported keys/numbers return undefined, with no profile fallback.

## Validation

- `npm run build`: passed for CJS, ESM and declarations.
- `npm run typecheck`: passed.
- `npm run test -- --reporter=json --outputFile=/tmp/kaabalah-placements-full-tests.json`: 870 passed, 0 failed, 0 pending.
- Targeted description suite through Pluto houses: 283 passed.
- Public package imports for CJS and ESM checked all 240 entries against the source JSON, both languages and locale behavior, complete canonical sign/house keys, deep nested immutability, invalid house numbers and unknown/prototype keys.
- Revalidated every provenance range and the physical SHA256 of all seven cited course/book files against `astrology-inventory-sources.json`. Every range is one-based inclusive, within eligible teaching before private NOTAS where applicable; all hashes match. No content inventory was repeated.

Temporary evidence is in `/tmp/kaabalah-placements-full-tests.json`, `/tmp/kaabalah-placements-full-typecheck.log`, `/tmp/kaabalah-placements-full-test.log`, `/tmp/kaabalah-placements-provenance-validation.json`, and `/tmp/kaabalah-planet-placements-package-check.mjs`. The package check was executed as module code on stdin from the project root so self-referencing package imports resolve through the actual export map. Build evidence for the final content is `/tmp/kaabalah-pluto-houses-build.log`.

## Boundaries and next factor

No calculation, existing API removal, CLI, numerology, package/build configuration, release or publication work was performed. The pre-existing `.DS_Store` deletion remains untouched. Claude Code's calculation-correctness work stays in its separate `feat/calc-improvements` worktree.

Next: twelve house themes, using class notes:6-49, class notes:814-888 and supplemental B:21398-23106. Then supported Ascendant/MC/IC sign sets (36), followed by the remaining approved batches. Descendant/cusp keyword grids and specialist/timing/relationship corpora are not implicitly approved. Mat chose astronomical north/south nodes without hemisphere inversion; opposition and node-dignity class conflicts remain pending until their relevant source audit and specific decision.
