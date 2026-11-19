# Astrology descriptions: generic element profiles

## Current decision and scope

Mat resolved the dedicated “Astrologia- elementos e temperamentos” question on 2026-11-16: use A8 labels fire sanguíneo/sanguine, earth colérico/choleric, air fleumático/phlegmatic, water melancólico/melancholic. This replaces the earlier pending status. The final unwrapped `/tmp/kaabalah-element-labels-approved.json` is adopted exactly, not the preliminary wrapper draft.

Only the four existing canonical element records are revised. No rows, keys, getters, classifiers, Ascendant-element sets or five-phase mappings are added. Existing first sentences and keyword sequences are retained, with one paired A8 label appended to each keyword array. Second sentences retain independent symbolic qualities/metaphors and add the selected label.

## Source inspection and integrity

Root reports actual narrow reads A8:796-813, A2:132-157 and A3:64-79. Integration read the supplied label audit and review, relying on those inspections; it did not reopen the course or private material. No NOTAS/private readings or optional book were used.

| Source | Teaching end | SHA-256 |
| --- | --- | --- |
| `class notes` | 161 | `6fe09a5840ab95c60ab7f2583167f7c7bc3ca6388405d752d6593f20c5f414bb` |
| `class notes` | 782 | `3570d3bdf5981d166aab61559990daef4cc02ca53b41daa700e5a24aa0f5584b` |
| `class notes` | 1521 | `0624fc0034969c135280cae339e33826a7b9fb91aa8bdd874836094d5c31bf97` |

A8 manifest records 1577 physical lines, teaching through 1521 and NOTAS from 1522. All citations use one-based inclusive physical lines inside teaching bounds. A3:81-102 Ascendant-specific material remains unadopted.

## Adopted source table

| Element | Adopted citations |
| --- | --- |
| fire | `class notes:134-137`; `class notes:70-72`; `class notes:811-811`; `class notes:813-813` |
| earth | `class notes:140-143`; `class notes:70-73`; `class notes:803-804` |
| air | `class notes:148-149`; `class notes:74-74`; `class notes:808-809` |
| water | `class notes:154-155`; `class notes:75-75`; `class notes:805-807` |

Fire's start metaphor cites 811 alone; the new label cites 813 precisely, excluding 812. Air expands its A8 citation to 808-809 for the label; earth uses 804 and water 807 within their retained ranges. Citations sharing a line with bodily claims do not adopt those claims.

## Historical disagreement, now resolved

| Element | Historical A2 / A3 mapping | Selected A8 label |
| --- | --- | --- |
| fire | bilious A2:137; irritable A3:65 | sanguine A8:813 |
| earth | nervous A2:144 and A3:66 | choleric A8:804 |
| air | sanguine A2:150 and A3:67 | phlegmatic A8:809 |
| water | phlegmatic A2:156; lymphatic A3:68 | melancholic A8:807 |

The alternate mappings remain explicit in every row's review notes with Mat's dated resolution. They are historical source disagreements, not a pending choice or blended convention. The display-label decision does not transfer temperament-dependent A2 traits: fire spirituality/enthusiasm/honors at138; earth tenacity/laboriousness/country tastes at144-145; air friendship/concord/equity at151; water inconstancy/dissimulation/pleasure-seeking at157 remain excluded.

## Independent claims and exclusions

A2 independently supplies fire initiative/ambition and lively/demonstrative/combative reactions; earth slow/lasting reactions, prudence/method/order and concrete/material orientation; air intelligence/mental faculties, quick reactions and flexibility/adaptation; water impressionability, slow reactions and imagination. Fire's adopted reaction clause shares A2:137 with an unadopted bilious mapping; this does not make the dependent traits independent.

A3 symbolic hot/dry, cold/dry, hot/moist and cold/moist qualities remain unchanged. A8 metaphors remain independent: fire as start, earth concretization/stability, air intellectual/rational/communication roles (including the retained communication keyword), water fluid energy/emotional control. The label addition does not assert bodily temperature, blood, bile, lymph, mucus, humor effects, diagnoses or promised health outcomes. Symbolic emotional control is not a physiological promise.

## Entry source notes

### fire

- Independent A2 initiative/ambition and lively/demonstrative/combative clauses, A3 symbolic hot/dry qualities and A8 start metaphor remain adopted. A8:813 supplies only the sanguine temperament label; the temperature/blood/humor clauses at811-813 are not adopted.
- Historical disagreement: A2:137 calls fire bilious and A3:65 irritable, while A8:813 calls it sanguine. Mat selected A8 labels on2026-11-16; the other mappings remain recorded rather than silently blended.
- A2:138 explicitly attributes spirituality, enthusiasm and desire for honors to its temperament context; these traits are not transferred to A8's selected label. A2:137 shares the adopted reaction clause with an unadopted bilious mapping. No physical vitality or health outcome is claimed.

### earth

- Independent A2 slow/lasting reactions, prudence/method/order and concrete/material orientation, A3 symbolic cold/dry qualities and A8 concretization/stability remain adopted. A8:804 supplies the choleric temperament label; the bile-humor clause is not adopted.
- Historical disagreement: A2:144 and A3:66 call earth nervous, while A8:804 calls it choleric. Mat selected A8 labels on2026-11-16; the other mapping remains recorded.
- A2:144-145 attributes tenacity, laboriousness and country tastes to its temperament context. Those traits are not transferred to A8's selected label. No somatic or health claim is made.

### air

- Independent A2 intelligence/mental faculties, quick reactions, flexibility/adaptation, A3 symbolic hot/moist qualities and A8 intellectual/rational/communicative roles remain adopted. A8:809 supplies the phlegmatic temperament label; the phlegm/mucus-humor clause is not adopted.
- Historical disagreement: A2:150 and A3:67 call air sanguine, while A8:809 calls it phlegmatic. Mat selected A8 labels on2026-11-16; the other mapping remains recorded.
- A2:151 attributes friendship, concord and equity to its temperament context. Those traits are not transferred to A8's selected label. No physiological or health outcome is claimed.

### water

- Independent A2 impressionability, slow reactions and imagination, A3 symbolic cold/moist qualities and A8 fluid-energy/emotional-control metaphor remain adopted. A8:807 supplies the melancholic temperament label; the lymph-humor clause is not adopted.
- Historical disagreement: A2:156 calls water phlegmatic and A3:68 lymphatic, while A8:807 calls it melancholic. Mat selected A8 labels on2026-11-16; the other mappings remain recorded.
- A2:157 attributes inconstancy, dissimulation and pleasure-seeking to its temperament context. Those traits are not transferred to A8's selected label. Emotional-control wording remains symbolic, without a physiological promise or guaranteed outcome.

## Integration and validation

Only descriptions.json, descriptions.element-profiles.test.ts, descriptions.element-profiles-source.test.ts and this audit are integration-owned. All353 other rows remain value-identical; total357. The TypeScript module/getters, typed keys, readonly/deep-freeze and language behavior remain unchanged. No calculations, existing exports, index, CLI, package, future Capricorn metadata, build or commit changes.

Current validation is recorded in `/tmp/kaabalah-element-labels-integration.md`, `.tests.json` and `.tests.exit`; Root owns broader docs/build/checks/commit. Earlier validation of314 rows/354 tests described the original element integration and is historical, not validation of this revision. The former pending decision and next-kind handoff are superseded by the current scope above.

## Final label-revision checks and handoff

410 astrology description tests, build, typecheck and public CJS/ESM checks passed with actual exit0. Source hashes/bounds and public-doc ownership checks passed;353 other rows remain unchanged, total357. The latest full suite at f7cdc05 passed1575 before this four-row label revision. Next: update the generic polarity review metadata for Mat's Capricorn feminine/negative choice perA2/A11, retaining the A18 context, then Chiron concept1. No element classifier or new getter is introduced.
