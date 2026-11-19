# Astrology descriptions: completed Fortune validation

Validated2026-11-16 on main374509a plus Fortune-house12. The Fortune family contains25 bilingual rows: general concept1,signs12,houses12. Together with the earlier332 rows,total357.

## API and source separation

- `getPointDescription/Entry('parsFortunae')`: general virtual-point concept.
- `getPointSignDescription/Entry('parsFortunae', sign)`: manner of expression, title-case signs.
- `getPointHouseDescription/Entry('parsFortunae', house)`: field of experience, integer1-12 only.

Keys match the actual chart node `chart.nodes.parsFortunae`; the lots position is a separate counterpart. All getters use imported deeply frozen readonly JSON, English default, case-sensitive pt-prefix selection and explicit undefined gaps, with no generic fallbacks. Existing calculations, exports and unrelated files remain unchanged.

A10:2459-2468 and2516-2578 support the concept, distinct from the entire ark annu10 Wheel of Fortune. Placement prose and the table at2733-2998 separate HOUSE field from SIGN manner, including OCR-interleaved fragments. The three per-kind audits record actual passages, qualifications, excluded absolute claims and precise inclusive lines. Private NOTAS and private readings are not entry sources.

Mat resolved house9: retain both the table field of realization and the earlier learning theme, distinctly, without inventing a balancing rule. No formula, lunar-phase/cusp convention, profection or timing interpretation is introduced.

## Validation

- Full `npm run test -- --maxWorkers=1 --minWorkers=1 --reporter=json --outputFile=/tmp/kaabalah-fortune-batch-full-tests.json`: 1575 passed,0failed,0pending,actual exit0.
- Astrology description-only tests in one fork:410 passed,actual exit0.
- `npm run build` and `npm run typecheck`: actual exit0.
- Public CJS/ESM checks cover all357 exact rows, language selection, immutable placement metadata and explicit gaps; recursive freeze is also checked by kind tests.
- Aggregate provenance: all357 source ranges are inside eligible teaching bounds; all13 cited source hashes match the manifest. Evidence `/tmp/kaabalah-fortune-batch-provenance.json`.
- House-kind addition preserves345 prior rows in values/byte prefix and reconstructs all old TypeScript declarations/getters unchanged.
- Public docs stay inside the bilingual-description section. Pre-existing `.DS_Store` deletion is untouched. No publication or push.

Next: apply Mat's A8 temperament labels to four existing element profiles, then resolve Capricorn classification metadata perA2/A11, each independently audited and committed. Chiron general concept follows, before its12 combined sign/house source accounts. Current decisions and exact pointers are in astrology-descriptions-progress.md.
