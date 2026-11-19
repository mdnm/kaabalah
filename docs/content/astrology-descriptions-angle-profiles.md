# Astrology descriptions: general angle concepts

## Scope and actual sources

Four general chart-angle concepts, using existing DescriptionAngle keys ascendant, mc, dc, ic. Actual primary A11:14-139 was read with original nl -ba one-based physical inclusive numbering; all adopted passages are within manifest teaching boundary 1557. No private notes/private readings or other factor research. The reviewed editorial draft is used unchanged. Prumo final review was read and reports no material issue.

## Adopted primary table

| Angle | Adopted source | Concepts |
| --- | --- | --- |
| ascendant | `class notes:76-79` | presented face, qualities shown, first contact and what is seen in others |
| mc | `class notes:124-127` | direction, vocations/aspirations/ambitions, social life, reputation, profession/status and public image |
| dc | `class notes:111-116` | other/self relation, qualities sought in others across business/conjugal/friendship relationships |
| ic | `class notes:134-137` | origins, roots, home/childhood and inner life |

## Inspected but unadopted primary claims

A11:14-75 discusses houses/aspects, angular correspondences, directions/elements/instruments and meridian/zenith descriptions. A11:80-110 adds house rulership, birth-time calculation and ascension timing/sign/hemisphere lists. A11:112-114 includes seventh-house/rulership context; only the relational meanings are adopted. A11:118-123 describes MC as zenith and associates it with numbered cusps; neither is a general profile claim or API identity. A11:128-129 parent/social future influence is not needed. A11:130-134 geometry/cusp/rulership context is not generalized into IC=cusp4. A11:138-139 final resting place and good/bad-character language is omitted.

Childhood is a neutral IC subject in the source, not an assertion about the reader’s specific childhood. No parent-sex convention, mortality/timing prediction, career success or relationship outcome is implied. MC is not identified with the zenith. These angles remain separate from numbered cusps, house themes and angle-sign placements.

## Supplemental audit: inspected only

Integration read Lume’s /tmp/kaabalah-angle-profiles-book-audit.md; it did not reopen the book. Lume records actual narrow inspections below, all within the approved navigation family; no book claim is in src.

| Angle | Supplemental windows inspected by Lume | Comparison / unused additions |
| --- | --- | --- |
| ascendant | `reference text:20911-20924`; `reference text:20977-20989` | broad first-impression agreement; appearance/style/individuality additions not adopted |
| dc | `reference text:21107-21125`; `reference text:21127-21131` | broad relationship agreement; projection/commitment and narrower romantic examples not adopted |
| mc | `reference text:21170-21189`; `reference text:21191-21196`; `reference text:21198-21204` | public aims/reputation agree; potential success and father/mentor convention not adopted |
| ic | `reference text:21226-21250`; `reference text:21252-21258`; `reference text:21345-21353`; `reference text:21360-21363` | roots/interior agreement; interleaved OCR and protection/security additions not adopted |

The source comparison reports no disagreement affecting adopted copy. The book’s MC father/mentor association is narrower and gendered compared with unspecified primary parent/social context; it is not selected. No missing OCR clauses or column sequence reconstructed by integration.

## Approved entry source notes

### ascendant

- Adopted the presented face, shown qualities, and first-impression meanings from lines 77-79. No sign, house-rulership, or biography claim was imported.

### mc

- Adopted the vocational, aspirational, social, reputational, professional, status, and public-image themes from lines 124-127.
- Inspected lines 55-57 and 118-123 but did not adopt the source's description of MC as zenith or its house-cusp association. MC is treated here as a chart angle independent of numbered house cusps.

### dc

- Adopted the other/self contrast and what one seeks in others across relationships, including business partnership, spouse, and friendship. No house-system rule or partner outcome is asserted.

### ic

- Adopted origins, family roots, home, childhood, and inner self from lines 134-137. Omitted the source's claim about a final resting place and its good/bad character framing; no house-cusp association is treated as universal.

## Implementation boundary

Only angles4, additive common AngleDescriptionEntry alias/readonly bank/getAngleDescription/Entry, generic and source tests, and this audit. Existing DescriptionAngle union is reused. Own-property guards, deep freeze, English default/pt prefix remain consistent; old 319 rows and existing getters are preserved. No calculation or unrelated export changes.

## Validation and next kind

377 description tests passed in a single fork worker with actual exit0. Build, typecheck, source hashes/teaching bounds, public CJS/ESM lookups and documentation ownership checks passed. All319 previous rows are unchanged; total323. Next: nine approved aspect-type profiles, A11:154-315 and A13:410-429,922-954,1066-1152,1292-1317,1546-1566. Verify actual AspectName keys and read relevant narrow bodies before drafting. Mat resolved opposition as tension; do not change calculations or expand to aspect-pair grids.
