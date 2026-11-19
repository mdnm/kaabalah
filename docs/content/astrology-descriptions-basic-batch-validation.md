# Astrology descriptions: completed basic batch validation

Validated on 2026-11-16 after the nine general aspect profiles, based on main a6a611f plus this factor-kind change. No package publication or calculation changes.

## Authored coverage

| Kind | Rows | Getters |
| --- | ---: | --- |
| Basic planets | 10 | getPlanetDescription/Entry |
| Basic signs | 12 | getSignDescription/Entry |
| Classical elements | 4 | getElementDescription/Entry |
| Modalities | 3 | getModalityDescription/Entry |
| Polarities | 2 | getPolarityDescription/Entry |
| General angles | 4 | getAngleDescription/Entry |
| General aspect types | 9 | getAspectDescription/Entry |
| Total basic batch | 44 | imported JSON, deeply frozen readonly data |

Together with288 previously completed natal rows, this supplies332 bilingual entries. Generic profiles do not fill unsupported placement combinations.

## Checks and evidence

- `npm run test -- --maxWorkers=1 --minWorkers=1 --reporter=json --outputFile=/tmp/kaabalah-basic-batch-full-tests.json`: 1552 passed,0failed,0pending; actual exit0.
- Description-only tests in a single fork worker:387 passed,0failed,0pending; actual exit0.
- `npm run build` and `npm run typecheck`: actual exit0.
- CJS and ESM public package checks: all332 exact JSON rows, language selection, metadata and explicit unknown/unsupported gaps passed. Deep immutability checked by colocated kind tests and placement package checks.
- Provenance audit: every cited inclusive range across332 entries is inside its manifest teaching boundary. All13 cited source SHA256 hashes match the inventory manifest. No private NOTAS or private readings are entry sources.
- The aspect-kind addition preserves323 earlier rows in values and bytes. Every basic kind has its own source audit and source/API tests.
- Public documentation changes stay within the bilingual-description section. Existing calculations, CLI, package version, exports and unrelated work are preserved.

Runtime evidence is under `/tmp/kaabalah-basic-batch-*`, `/tmp/kaabalah-aspect-profiles.*` and the colocated tests. Single-worker execution avoids a previously observed Node24/native-worker shutdown failure; this run completed with exit0.

## Decisions and remaining gaps

Mat resolved opposition as tension, astronomical nodes without hemisphere inversion, and node dignities according to A15:45-53 while preserving the different A12 context. These decisions do not alter calculations.

Two questions remain pending in Maestri: element humor/temperament label mappings and Capricorn polarity membership. The generic element/polarity definitions do not choose those disputed associations. Parent-sex assignments remain unadopted. Descendant-sign12 and the144 cusp grid still require supplemental scope approval. Aspect-pair grids, timing, synastry and larger specialist sets remain outside this description scope.

Next approved batch starts with the Part of Fortune general concept, then its signs and houses as separate kinds. Primary navigation: A10:2459-2468,2516-2588 for concept/context; placement navigation2703-2998. Each new kind requires its own narrow source reading, implementation, audit and validation before moving on.
