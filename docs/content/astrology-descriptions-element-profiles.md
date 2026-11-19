# Astrology descriptions: generic element profiles

## Current decision and scope

Mat resolved the dedicated “Astrologia- elementos e temperamentos” question on 2026-11-16: use class notes labels fire sanguíneo/sanguine, earth colérico/choleric, air fleumático/phlegmatic, water melancólico/melancholic. This replaces the earlier pending status. The final unwrapped `/tmp/kaabalah-element-labels-approved.json` is adopted exactly, not the preliminary wrapper draft.

Only the four existing canonical element records are revised. No rows, keys, getters, classifiers, Ascendant-element sets or five-phase mappings are added. Existing first sentences and keyword sequences are retained, with one paired class notes label appended to each keyword array. Second sentences retain independent symbolic qualities/metaphors and add the selected label.

## Source inspection and integrity

Root reports actual narrow reads class notes:796-813, class notes:132-157 and class notes:64-79. Integration read the supplied label audit and review, relying on those inspections; it did not reopen the course or private material. No NOTAS/private readings or optional book were used.

| Source | Teaching end | SHA-256 |
| --- | --- | --- |
| `class notes` | 161 | `6fe09a5840ab95c60ab7f2583167f7c7bc3ca6388405d752d6593f20c5f414bb` |
| `class notes` | 782 | `3570d3bdf5981d166aab61559990daef4cc02ca53b41daa700e5a24aa0f5584b` |
| `class notes` | 1521 | `0624fc0034969c135280cae339e33826a7b9fb91aa8bdd874836094d5c31bf97` |

class notes manifest records 1577 physical lines, teaching through 1521 and NOTAS from 1522. All citations use one-based inclusive physical lines inside teaching bounds. Class notes:81-102 Ascendant-specific material remains unadopted.

## Adopted source table

| Element | Adopted citations |
| --- | --- |
| fire | `class notes:134-137`; `class notes:70-72`; `class notes:811-811`; `class notes:813-813` |
| earth | `class notes:140-143`; `class notes:70-73`; `class notes:803-804` |
| air | `class notes:148-149`; `class notes:74-74`; `class notes:808-809` |
| water | `class notes:154-155`; `class notes:75-75`; `class notes:805-807` |

Fire's start metaphor cites 811 alone; the new label cites 813 precisely, excluding 812. Air expands its class notes citation to 808-809 for the label; earth uses 804 and water 807 within their retained ranges. Citations sharing a line with bodily claims do not adopt those claims.

## Historical disagreement, now resolved

| Element | Historical class notes mapping | Selected class notes label |
| --- | --- | --- |
| fire | bilious class notes:137; irritable class notes:65 | sanguine class notes:813 |
| earth | nervous class notes:144 and class notes:66 | choleric class notes:804 |
| air | sanguine class notes:150 and class notes:67 | phlegmatic class notes:809 |
| water | phlegmatic class notes:156; lymphatic class notes:68 | melancholic class notes:807 |

The alternate mappings remain explicit in every row's review notes with Mat's dated resolution. They are historical source disagreements, not a pending choice or blended convention. The display-label decision does not transfer temperament-dependent class notes traits: fire spirituality/enthusiasm/honors at138; earth tenacity/laboriousness/country tastes at144-145; air friendship/concord/equity at151; water inconstancy/dissimulation/pleasure-seeking at157 remain excluded.

## Independent claims and exclusions

class notes independently supplies fire initiative/ambition and lively/demonstrative/combative reactions; earth slow/lasting reactions, prudence/method/order and concrete/material orientation; air intelligence/mental faculties, quick reactions and flexibility/adaptation; water impressionability, slow reactions and imagination. Fire's adopted reaction clause shares class notes:137 with an unadopted bilious mapping; this does not make the dependent traits independent.

class notes symbolic hot/dry, cold/dry, hot/moist and cold/moist qualities remain unchanged. Class notes metaphors remain independent: fire as start, earth concretization/stability, air intellectual/rational/communication roles (including the retained communication keyword), water fluid energy/emotional control. The label addition does not assert bodily temperature, blood, bile, lymph, mucus, humor effects, diagnoses or promised health outcomes. Symbolic emotional control is not a physiological promise.

## Entry source notes

### fire

- Independent class notes initiative/ambition and lively/demonstrative/combative clauses, class notes symbolic hot/dry qualities and class notes start metaphor remain adopted. Class notes:813 supplies only the sanguine temperament label; the temperature/blood/humor clauses at811-813 are not adopted.
- Historical disagreement: class notes:137 calls fire bilious and class notes:65 irritable, while class notes:813 calls it sanguine. Mat selected class notes labels on2026-11-16; the other mappings remain recorded rather than silently blended.
- Class notes:138 explicitly attributes spirituality, enthusiasm and desire for honors to its temperament context; these traits are not transferred to class notes' selected label. Class notes:137 shares the adopted reaction clause with an unadopted bilious mapping. No physical vitality or health outcome is claimed.

### earth

- Independent class notes slow/lasting reactions, prudence/method/order and concrete/material orientation, class notes symbolic cold/dry qualities and class notes concretization/stability remain adopted. Class notes:804 supplies the choleric temperament label; the bile-humor clause is not adopted.
- Historical disagreement: class notes:144 and class notes:66 call earth nervous, while class notes:804 calls it choleric. Mat selected class notes labels on2026-11-16; the other mapping remains recorded.
- Class notes:144-145 attributes tenacity, laboriousness and country tastes to its temperament context. Those traits are not transferred to class notes' selected label. No somatic or health claim is made.

### air

- Independent class notes intelligence/mental faculties, quick reactions, flexibility/adaptation, class notes symbolic hot/moist qualities and class notes intellectual/rational/communicative roles remain adopted. Class notes:809 supplies the phlegmatic temperament label; the phlegm/mucus-humor clause is not adopted.
- Historical disagreement: class notes:150 and class notes:67 call air sanguine, while class notes:809 calls it phlegmatic. Mat selected class notes labels on2026-11-16; the other mapping remains recorded.
- Class notes:151 attributes friendship, concord and equity to its temperament context. Those traits are not transferred to class notes' selected label. No physiological or health outcome is claimed.

### water

- Independent class notes impressionability, slow reactions and imagination, class notes symbolic cold/moist qualities and class notes fluid-energy/emotional-control metaphor remain adopted. Class notes:807 supplies the melancholic temperament label; the lymph-humor clause is not adopted.
- Historical disagreement: class notes:156 calls water phlegmatic and class notes:68 lymphatic, while class notes:807 calls it melancholic. Mat selected class notes labels on2026-11-16; the other mappings remain recorded.
- Class notes:157 attributes inconstancy, dissimulation and pleasure-seeking to its temperament context. Those traits are not transferred to class notes' selected label. Emotional-control wording remains symbolic, without a physiological promise or guaranteed outcome.

## Integration and validation

Only descriptions.json, descriptions.element-profiles.test.ts, descriptions.element-profiles-source.test.ts and this audit are integration-owned. All353 other rows remain value-identical; total357. The TypeScript module/getters, typed keys, readonly/deep-freeze and language behavior remain unchanged. No calculations, existing exports, index, CLI, package, future Capricorn metadata, build or commit changes.

Current validation is recorded in `/tmp/kaabalah-element-labels-integration.md`, `.tests.json` and `.tests.exit`; Root owns broader docs/build/checks/commit. Earlier validation of314 rows/354 tests described the original element integration and is historical, not validation of this revision. The former pending decision and next-kind handoff are superseded by the current scope above.

## Final label-revision checks and handoff

410 astrology description tests, build, typecheck and public CJS/ESM checks passed with actual exit0. Source hashes/bounds and public-doc ownership checks passed;353 other rows remain unchanged, total357. The latest full suite at f7cdc05 passed1575 before this four-row label revision. Next: update the generic polarity review metadata for Mat's Capricorn feminine/negative choice per class notes, retaining the class notes context, then Chiron concept1. No element classifier or new getter is introduced.
