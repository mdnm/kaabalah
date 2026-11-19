# Astrology descriptions: Fortune in signs

## Scope and provenance

Twelve Fortune-sign profiles only, nested under canonical point key `parsFortunae` and Title Case `Sign` keys. The final root-approved `/tmp/kaabalah-fortune-signs-approved.json` is adopted unchanged, including the corrected Capricorn review note. Raw A/B drafts are not used as copy authority.

Integration read the supplied A/B source-audit shards and final review. Root reports actual primary inspection of A10:2775-2823 and all cited table sign-manner clauses. Integration did not reopen the course, NOTAS or private readings. Source: `class notes`; manifest teaching end 2999, NOTAS start 3000; SHA-256 `a43be88f1c891018406b975288199fb6b5a431c16da475ef6452124e06063890`.

The table context at 2822-2823 and headings at 2824-2830 distinguish HOUSE as field of experience from SIGN as manner. Only point-sign prose and unambiguous sign-manner clauses are adopted; no house-field claims are transferred or generic planetary/sign keywords mechanically blended.

## Adopted ranges

| Sign | Physical inclusive A10 ranges |
| --- | --- |
| Aries | 2777-2778, 2838-2841 |
| Taurus | 2780-2781, 2847-2847, 2851-2854 |
| Gemini | 2783-2784, 2857-2857, 2860-2864 |
| Cancer | 2786-2787 |
| Leo | 2789-2791, 2888-2892 |
| Virgo | 2793-2795, 2902-2907 |
| Libra | 2797-2799, 2919-2923 |
| Scorpio | 2801-2804, 2933-2937 |
| Sagittarius | 2806-2809, 2948-2951 |
| Capricorn | 2811-2814, 2962-2962, 2965-2965, 2967-2967 |
| Aquarius | 2816-2818, 2977-2982 |
| Pisces | 2820-2821, 2994-2998 |

## Qualifications, disagreements and exclusions

The source's imperatives and absolute claims are not copied as advice, guaranteed traits or outcomes. Potential and need remain qualified. No guaranteed fortune, health or relationship outcome, fixed biography or evolution-level assignment is introduced.

Aries excludes guaranteed overcoming and sufficient energy. Taurus retains renewal/growth beside solidity, excluding house-field 2848-2849 and guaranteed beneficial transformation. Gemini excludes judging advice and house fields. Cancer uses the prose alone; the table's empathy/intuitive manner is unused, as is its private-home field. Leo omits directives to adapt others or give advice.

Virgo retains consciously occupied engagement with the topic, analysis and refinement; it does not infer steadiness or employment from the sixth-house field. House health/day-to-day lines 2897-2900 are excluded. Libra preserves the possible cost of social acceptance and the need for own decisions without inventing a causal benefit; house relationship content 2911-2917 is excluded. Scorpio excludes house introspection/death at 2927-2931. Sagittarius retains informal, straightforward expression; travel, philosophy and religion at 2941-2946 remain house fields.

Capricorn OCR interleaves columns at 2955-2959, 2963-2964 and 2966. Only exact unambiguous table sign lines 2962, 2965 and 2967 are cited. The audit shard and review retain historical mentions of 2960; the final approved artifact corrects this, and its review note excludes 2960. No career field or fixed story of youthful restriction is adopted.

Aquarius excludes automatic resolution of problems and house friends/projects/cooperation at 2971-2975. Pisces uses intuition, faith and inner vision, with possible joy associated with higher consciousness; it assigns no evolutionary level. House dreams/images/reserve/isolation at 2986-2992 and the absolute imagined-reality claim are excluded from copy and keywords.

## API and preservation

Additive readonly `pointSigns`, common `PointSignDescriptionEntry` alias, and `getPointSignDescriptionEntry(point: DescriptionPoint, sign: Sign)` / `getPointSignDescription` follow the existing JSON import/deep-freeze design. English is default; only case-sensitive `pt` prefixes select Portuguese. Unknown aliases, inherited keys and unsupported combinations return `undefined`, without general point or sign fallback.

Each approved entry retains exactly five fields: `pt`, `en`, `keywords`, `src`, `reviewNotes`. Both languages contain two lowercase-start sentences; keyword arrays are paired. The previous 333 records and existing getters are preserved. Total is 345 rows.

Only the agreed five files are integration-owned. No index, calculation, CLI, package, build or commit changes. Validation is recorded in `/tmp/kaabalah-fortune-signs-integration.md` and its test artifacts; Root owns broader documentation and final checks.

## Validation and next kind

401 astrology description tests passed in one fork worker with actual exit0. Build, typecheck, source hash/teaching bounds, public CJS/ESM lookups and documentation ownership checks passed. All333 earlier rows are unchanged; total345. Latest full suite at e0876c2 passed1552 tests before Fortune additions. Next is a brief display-terminology correction for three minor aspect profiles (source Portuguese names, unchanged API keys), followed by Fortune in houses12. Fortune-house sources: A10:2733-2773 and the HOUSE field columns at2824-2998. Keep sign manner claims separate; no timing/profection expansion.
