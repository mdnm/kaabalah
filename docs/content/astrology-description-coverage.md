# Astrology descriptions: phase 1 coverage and scope decision

Inventory date: 2026-11-16. Status: awaiting Mat's approval. No descriptions or getters have been written. No commit or publication has been made.

All 23 module 4 classes were read through EOF. There are 36,205 logical lines, including final unterminated lines, of which 34,469 precede the private NOTAS sections. The book's sections were located and their bodies/boundaries inspected; this is not a claim to have read all 123,692 book lines. Both supplied reference sheets and the earlier Gamu bank were read. The English astrology indexes were used only as navigation. No private client readings were opened. AKASH was read only.

## How to audit the table

All course references are relative to `/Volumes/AKASH/aula kaabalah/`:

- `A0` through `A22` expand to `modulo 4/aula N modulo 4/aula-N.md`.
- `B` expands to `books/astrologia-hermetica/astrologia-hermetica.md`.
- `H` expands to `readings/skills/dazy-natal-reading/references/houses.md`.
- `P` expands to `readings/skills/dazy-natal-reading/references/planets.md`.

Ranges are one-based and inclusive in the current Markdown, not PDF page numbers. [Source manifest](astrology-inventory-sources.json) retains file hashes and NOTAS boundaries to detect future line drift. Broad ranges locate factor families; final descriptions must cite the narrower passages actually synthesized. Source transcriptions contain OCR mistakes and column interleaving. A heading alone does not establish a recoverable entry.

Status meanings: **covered** = eligible direct material supports the stated set; **partial** = incomplete, combined, very thin, context-specific or unresolved authority; **mentioned** = named without enough description; **not found** = no eligible account located in the scoped material; **excluded** = present but outside this task's constraints. These labels describe evidence, not Mat's approval. Counts are candidate bilingual lookup rows, not word counts, and are not additive where rows share evidence or aliases.

## Natal placements

| Factor kind | Status | Primary classes | Book / supplied references | Richness and entries implied |
|---|---|---|---|---|
| Sun in signs | covered | A3:272-535 | B:23107-26583 | Rich, 12. Course Virgo/Libra paragraphs interleave |
| Moon in signs | covered | A18:4-108 | B:27771-31599 | Rich, 12 |
| Mercury in signs | covered | A12:6-29 | B:32796-35717 | Terse course, rich book, 12 |
| Venus in signs | covered | A12:31-56 | B:36582-39259 | Terse course, rich book, 12 |
| Mars in signs | covered | A12:58-83 | B:40333-43257 | Terse course, rich book, 12; Virgo heading OCR error |
| Jupiter in signs | covered | A12:85-110 | B:44451-47795 | Terse course, rich book, 12 |
| Saturn in signs | covered | A12:112-136 | B:49071-51810 | 12 class entries; only 11 book bodies located, Aries gap |
| Uranus in signs | covered | A12:138-163 | B:52915-55772 | 12; distinguish generational themes from certain personal events |
| Neptune in signs | covered | A12:165-187 | B:57048-60114 | 12; substantially generational course text |
| Pluto in signs | covered | A12:189-222 | B:61283-64351 | 12; substantially generational course text |
| Sun in houses | covered | A8:1101-1516 | B:26584-27770 | Rich, 12 |
| Moon in houses | covered | A9:2-301 | B:31600-32795 | Rich, 12 |
| Mercury in houses | covered | A9:302-651 | B:35718-36581 | Rich, 12 |
| Venus in houses | covered | A9:652-993 | B:39260-40332 | Rich, 12 |
| Mars in houses | covered | A9:994-1391 | B:43258-44450 | Rich, 12 |
| Jupiter in houses | covered | A9:1392-1830 | B:47796-49070 | Rich, 12; house 6 course heading mislabeled Venus |
| Saturn in houses | covered | A10:2-519 | B:51811-52914 | Rich, 12 |
| Uranus in houses | covered | A10:520-998 | B:55773-57047 | Rich, 12 |
| Neptune in houses | covered | A10:999-1684 | B:60115-61282 | Rich, 12 |
| Pluto in houses | covered | A10:1685-2457 | B:64352-65358 | Rich, 12; Scorpio IC course heading error |
| Houses themselves | covered | A6:6-49; A8:814-888 | B:21398-23106; H:3-18 | 12 direct themes, compact and extended presentations |
| Sign on each house cusp | partial | A6:51-255; A8:1090-1099; explicit cusp passages interleaved A9:302-993 | H:30-226; book has angle subsets only | All 144 keyword cells in H; primary course corroboration uneven. Do not manufacture 144 entries by blending generic sign/house prose |
| Four angle meanings | covered | A11:14-139 | B:20893-21397; H:20-28 | 4 concepts |
| Ascendant by sign | covered | A6:51-255; A7:4-15 | B:65359-66689 | Rich, 12; use A6 for standalone Ascendants |
| Descendant by sign | partial | A11:14-139 general; A8:1313-1314; A9:487-490,823-829 explicit subset | B:66690-66780; H cusp-7 cells | 12 supplemental keyword cells, at most 9 partly recoverable book accounts. Aries/Taurus/Gemini book gaps. Full course prose not located |
| Midheaven by sign | covered | A8:1384-1422; A9:208-232,540-561,884-915,1287-1313,1731-1761; A10:363-409,857-898,1527-1570,2245-2302 | B:66781-66898; H cusp-10 cells | 12 direct profiles, rich course; retain MC as angle independent of cusp-10 convention |
| Imum Coeli by sign | covered | A8:1181-1217; A9:67-94,379-404,716-743,1090-1129,1493-1533; A10:107-166,627-658,1146-1218,1839-1889 | B:66899-67018; H cusp-4 cells | 12 direct profiles, rich course |
| Sun sign × Ascendant | covered | A7:16-576 | No independent book grid certified | 144 ordered combinations, distinct from 12 standalone Ascendants |

## Foundations, aspects and computed subdivisions

| Factor kind | Status | Sources | Richness and entries implied |
|---|---|---|---|
| Planet profiles | covered | A1:190-225; A4:288-335; A8:767-795,890-901,939-954; A13:1568-1578; B:16988-20290; P:3-24 | 10 planet concepts; Earth and Vulcan cosmology are separate |
| Sign profiles | covered | A0:8-90; A4:8-286; A5:608-931; B:9128-15619; P:26-43 | Rich, 12 |
| Elements | covered | A2:65-73,132-157; A3:64-102; A8:796-813; B:7229-8565 | 4 general entries; 4 Ascendant-element variants optional |
| Modalities | covered | A1:143-188; A2:79-91,113-131; A8:913-930; B:8566-9127 | 3, ordinary and esoteric frameworks must remain distinguishable |
| Polarity | covered | A2:3-61,95-110; A11:191-198; B:6405-7228 | 2 activity/receptivity profiles; avoid universal gender claims |
| Three levels per sign | covered | A4:15-286, exact twelve subranges in classes-0-7 report | 36 level accounts, or subfields within 12 signs. Not calculated for a person by chart API |
| Conjunction type | covered | A11:154-315; A13:410-429; B:67812-67961 | 1, rich |
| Sextile type | covered | A11:154-315; A13:922-954; B:92378-92543 | 1, substantial |
| Square type | covered | A11:154-315; A13:1066-1152; B:101497-101804 | 1, rich |
| Trine type | covered | A11:154-315; A13:1292-1317; B:75002-75170 | 1, substantial |
| Opposition type | partial | A11:287-290; A13:405-406,1566; B:83756-83990 | 1, rich but class disagreement requires review |
| Duodecile / semisextile type | covered | A13:561-634,1550 | 1 library-supported type; source summary mislabels degrees, use section body |
| Octile / semisquare type | covered | A13:764-822 | 1, substantial |
| Trioctile / sesquisquare type | covered | A13:1376-1412 | 1, substantial; fraction error flagged |
| Quincunx type | covered | A13:1413-1474,1563; B:110850-111196 | 1, rich, source outcome claims must be excluded |
| Other minor aspect types | partial | A13:550-921,955-1065,1153-1291,1413-1474 | 11 additional named types outside current AspectName; some very sparse. No API expansion approved |
| Natal aspect by planet pair | partial | Course examples A13:610-624,750-762,798-822,944-950,1038-1044,1111-1129,1205-1226,1364-1374; book B:67962-75001,75171-83755,83991-92377,92544-101496,101805-110849,111197-122011 | Book has six extensive, often sign-conditioned pair families: 253 located keys,3 unresolved square identities,14 absent combinations. Counts by type45/42/42/43/39/42 (conjunction/trine/opposition/sextile/square/quincunx). Narrow synthesis still needs body audit; exact keys in book TSV |
| Decans | partial | A3:104-114,180-182; A5:570-577; B twelve ranges in book report | 1 method concept and intended 36 book profiles; Pisces recovery incomplete. Library Chaldean/Golden Dawn fields cannot automatically inherit Egyptian decan or sign-level meanings |
| Essential dignity statuses | partial | A12:1239-1272; A15:38-53; B:16988-20164; P:45-59 | 4 main status concepts, possibly peregrine if sourced; planet/sign grid count depends on chosen authority. Mercury and node conflicts |
| Sect | covered | A10:2518-2547; A17:383-405 | 2 basic concepts, no complete planet-by-sect interpretation grid |
| Dodecatemoria | not found | All scoped class handouts and searched book OCR | 0 supported descriptions despite existing computation |
| Symbolic degrees / monomers | covered | A11:324-1556 | 360 degrees, each with two images. Separate sizable corpus, not decans |
| Intermediate sign transitions | covered | B:15620-16987 | 12 transition profiles; these are zodiac boundaries, not house cusps |
| Opposite sign axes | partial | A3:250-266; A7:1021-1033 | 6 optional axis entries, ruler conventions need review |
| Sign lack cycle | covered | A3:731-776 | 12 ordered relationships, separate layer |
| Sign archetypes and major correspondences | partial | A5:608-931 | 12 profiles; reconcile mappings with canonical Kaabalah before exposing links |
| Seven rays / esoteric structures | partial | A5:74-91,284-307,485-606; A6:363-388; A8:5-1086 | 7 ray names, 21 sign correspondences and broader framework. No chart-derived ray or level key |
| Colors, metals, planetary days | partial | A3:116-178; A7:641-684; book planet/sign sections | Several explicit correspondence sets; scope separate from placement prose |
| Degree/angel subdivisions | partial | B:23107-64351, e.g.23237-23286,64014-64338 | Extensive five-degree sectors; count withheld pending scope and OCR audit; exclude invocations/practices |
| House systems and orientation | covered | A8:814-831; A10:2473-2488; A11:117-123; A12:1449-1627 | Several method concepts; source is not a full profile set for all 11 computed house-system enum values |
| Other ASCMC geometrical points | not found | No eligible factor-specific profiles for armc/equasc/coasc1/coasc2/polasc located | 0, even though the chart returns positions |

## Retrogrades and additional points

| Factor kind | Status | Sources | Richness and entries implied |
|---|---|---|---|
| Retrograde motion concept | covered | A16:3-495; B:122012-122074 | 1 general entry; three phases as subfields. Book rejects enduring natal interpretation, course precedence |
| Retrograde planets, Mercury through Pluto | covered | A16:498-617,1271-1351,2010-2085,2617-2693,3261-3314,3845-3916,4421-4471,4823-4886 | 8 rich natal profiles; book B:122075-122166 is time-dependent and cannot silently fill natal traits |
| Retrograde planet in sign | partial | A16:618-918,1352-1691,2086-2354,2694-2960,3315-3575,3917-4147,4472-4585,4887-5011; B:122175-123538 | 79 course placements. 17 natal gaps: Uranus Capricorn/Aquarius/Pisces; Neptune Aries/Taurus/Gemini/Cancer/Capricorn/Aquarius/Pisces; Pluto Aries/Taurus/Gemini/Sagittarius/Capricorn/Aquarius/Pisces. Book intended 96 uses a different temporal context |
| Retrograde planet in house | covered | A16:919-1270,1692-2009,2355-2616,2961-3260,3576-3844,4148-4420,4586-4822,5012-5271 | 96 rich entries, eight planets × twelve houses |
| Chiron concept | covered | A15:122-218 | 1 rich profile; book dismisses it B:5750-5766 |
| Chiron in sign and house | partial | A15:345-746; gentler Aries/1 example280-289 | 12 combined house-or-sign accounts. Can support 24 lookups only with disclosure that they share 12 source profiles; no independent24-cell teaching |
| Chiron aspects and transits | partial | A15:163-169,192-200,218-274,291-338 | Sun harmony/disharmony and selected transit roles, no full matrix; health/event exclusions may leave gaps |
| Lilith concept and signs | covered | A18:109-129,131-848 | 1 concept +12 rich signs; no independent mean/true interpretation sets |
| Lilith houses/aspects | not found | Full scoped classes and searched book | 0 dedicated complete placements located; do not infer from sign parallels |
| Priapus signs | covered | A18:131-848, definition caveat141-144 | 12 profiles, no current chart field. Source says it is not always exactly opposite Lilith |
| North/South node concepts | partial | A15:4-53; A21:867-874; B:20306-20892 | 2 concepts; hemisphere naming convention unresolved |
| Nodal house axes | partial | A15:54-121 | 12 directed axes, or24 point-house lookup aliases sharing evidence. Must settle hemisphere convention |
| Nodes by sign | covered | Course dignity subset A15:45-53; B north67023-67160, south67402-67629 | 24 book placement profiles; course corroboration partial and dignity disagreements retained |
| Nodes by house, book accounts | partial | B:67161-67401,67630-67795 | Intended24; cross-synthesize with12 course axes after convention decision and OCR inspection |
| Node aspects | mentioned | A15:17-32 | General intensification, no aspect-by-pair matrix |
| Vertex/Antivertex concepts | covered | A18:849-923 | 2 accounts, no sign grid |
| Vertex/Antivertex signs | not found | Scoped classes and searched book | 0 |
| Vertex in houses | partial | A18:924-995 | 6 houses (4-9), not all12; 4 opposite Antivertex-house accounts also explicitly discussed |
| Planet contact with Vertex | partial | A18:898-919,1021-1031 | 9 planet roles (Neptune absent) +1 axis-contact concept; no complete aspect-type matrix |
| Encounter setting by house of Vertex-house ruler | covered | A18:1032-1064 | 12 settings, distinct from Vertex's own house |
| Part of Fortune concept/signs/houses | covered | A10:2459-2468,2516-2588,2703-2998 | 1 concept +12 signs +12 houses, with repeated presentations to synthesize |
| Other lots, Hyleg/Apheta/Anareta | partial | A14:16-47 | 2 lot formulas,3 roles; little placement prose, health/death predictions excluded; no matching direct chart fields |
| Other asteroids/occult planets | mentioned | A5:417-434,485-599; B:5750-5766 | Vulcan, Ceres and other bodies named, no eligible complete placement grids located |
| Fixed stars | mentioned | A11:148-152; A8:978-996; A7:699-704 | Rule, Sirius concept and four royal-star names, no computed natal grid |
| Eclipses/lunar phases | mentioned | A12:443-450; A1:59-74; B:17466-17520 | Cycles/analogies, no complete phase or eclipse description set located |

## Timing, relationship and specialist contexts

| Factor kind | Status | Sources | Richness and entries implied |
|---|---|---|---|
| Transits, general | partial | A17:3-12,174-237; A19:3493-4370 | Method and examples. No complete transit planet × natal planet × aspect or natal-house grid. Never relabel natal text as transit text |
| Sun transiting annual houses | covered | A19:3874-3903 | 12 short annual-house descriptions, a particular timing context |
| Secondary progression method | covered | A17:3-12,44-70,160-173 | 1 overview |
| Progressed Sun/Moon/Ascendant/MC roles | covered | A17:76-106 | 4 roles |
| Progressed placements/aspects | partial | A17:107-145,164-173 | 2 generic house-movement accounts,2 direction modes and isolated examples. Full sign/house/aspect grids absent; progression computation not currently exported |
| Primary directions/solar arc/Naibod/tertiary | mentioned | A17:13-28 | At most4 definitions, not placement sets |
| Annual profections | covered | A10:2469-2514,2580-2701; A17:262-303,378-467 | 1 method +3 Valens rule explanations. No source-specific12-house or7-ruler interpretation grid |
| Monthly/daily profections | partial | A17:322-376 | 1 monthly method; daily detail insufficient |
| Firdaria | mentioned | A17:256-257 | Diagram label only,0 substantive interpretations. English index expansions are not independent primary evidence |
| Solar return method | covered | A17:174-185,209-212; A19:4-75,231-250,308-375,2918-2960 | 1 rich overview; A19 includes a book excerpt and competing appended authors |
| Annual Ascendant in natal house | covered | A19:376-690 | 12 rich entries, included in144 overlay total |
| Annual MC in natal house | covered | A19:692-914 | 12 entries, included in144 overlay total |
| Other annual-house/natal-house overlays | covered | A19:915-1717 | 120 additional entries,144 total including preceding two rows |
| Annual Ascendant in sign | covered | A19:1719-1901 | 12; no independent144 annual cusp-sign grid |
| Planet in annual house | covered | A19:1903-2917 | 120, ten planets ×12 houses |
| Annual aspect pairs | partial | A19:2961-3491 | 37 dedicated conjunctions +3 explicit oppositions, not a full matrix |
| Annual retrogrades | partial | A19:2250-2256,2403-2406,2571-2582,3477-3491,5994-6003 | 1 general account + selected cases, internal disagreement |
| Monthly/decan charts | partial | A19:3757-3822 | 1 monthly method +1 decan-chart mention, not36 decan meanings |
| Méry lunar timing signs/houses | covered | A19:4371-4590 | 12 signs +12 houses with conditions, distinct timing method |
| Méry lunar timing aspects by house | covered | A19:4592-5293 | 96 Moon/target/house rows, each with two conditions (192 clauses). Targets Sun through Neptune excluding Moon; Pluto absent |
| Annual planet/natal-planet aphorisms | partial | A19:5373-6027 | Large conditional rule list, exact key count withheld; same-sign statements are not automatically exact conjunctions |
| Seven annual planetary periods | partial | A19:6029-6095 | 1 method, not Firdaria; no current direct calculation |
| Return rulers in annual houses | partial | A19:6267-6313 | 4 examples, not144 |
| Rectification/personal calendar/33-year cycle | partial | A19:6342-6534 | Up to3 method accounts, no per-year33-entry set |
| Sidereal and lunar returns | partial | A19:6645-6843 | 2 method overviews, distinct authorities; no current direct APIs |
| Synastry method/personal-planet roles | covered | A20:4-36,75-98 | 1 overview +5 personal-planet roles |
| Synastry aspect pairs | partial | A20:44-73,106-113 | 8 condition/pair clauses for Sun-Sun, Moon-Moon, Sun-Moon;2 isolated other pairs. No complete grid |
| Sign compatibility | partial | A20:206-289 | 12 directional sign-perspective accounts, not a certified78-pair set; outcomes excluded |
| Element compatibility | partial | A3:778-781; A20:31-43 | 4 directional rules. Count/schema pending; no compatibility score invented |
| Synastry planet-house overlays | mentioned | A20:120-204 | Houses explained,0 dedicated planet-house overlay grid located |
| Composite/Davison interpretation | not found | Scoped classes and searched book | 0 dedicated entries. Library computes composite, not Davison |
| Astromedicine | partial | A14:4-177,226-358; A13:58-86; A21:751-792 | Rich symbolic anatomy and constitution. Potential12 sign-body correspondences and1 zone-model overview; body-map conflict. No diagnosis, prescription or predicted outcome |
| Karmic astrology | partial | A13:101-148,261-293,1476-1608; A15; A16:20-495; A18:849-1064 | Rich framework and point-specific accounts already counted above; no independent complete extra matrix |
| Astrocartography/parans | mentioned | A18:1061-1064 | Brief Vertex-location reference,0 planet-angle/paran interpretation grid despite computation |
| Chinese zodiac animals | covered | A21:3-91,204-749 | 12 rich profiles, separate domain; retain Han characters. Not computed by current astrology API |
| Han five phases/sexagenary cycle | partial | A21:93-147 | 5 correspondences,2 polarity definitions,1 cycle overview; no60-profile set. Keep separate from Western elements and Kaabalah layers |
| Ages, cosmology, chart-reading framework | partial | A0:389-440; A1:227-747; A7:578-1560; A13:1476-1608; A21:796-874 | Rich contextual teaching, bounded concept scope needed; not an unlimited placement generator |
| Practices, rituals, remedies, mortality predictions | excluded | A14:275-1598; A19:4061-4364,6097-6340; A21:876-881; A22:4-29 | Present in sources,0 practice or outcome-prediction descriptions under this task |

## Source disagreements and gaps to retain

This is a review register, not a final list of disputed entries. No entry exists yet. Each affected entry should eventually retain the relevant issue in its review notes.

1. **Retrogrades:** A16 teaches natal traits; B:122012-122074 explicitly declines to distinguish natal retrogrades. Course wins. Book sign prose cannot fill the17 missing natal retrograde placements without an approved temporal distinction.
2. **Node hemisphere convention:** A15:28-46 reverses the Dragon in the southern hemisphere. The astronomical mean/true node fields do not implement that teaching's renaming. Mat must decide the interpretation convention before node lookup text is keyed.
3. **Node dignities:** A12:1239-1264 differs from A15:45-53. Course precedence does not settle a class-versus-class disagreement.
4. **Mercury dignity:** B:17742-17776 gives Aquarius exaltation/Leo fall; A12:1239-1272 and current `getEssentialDignity` use Virgo/Pisces. Course takes priority; calculation remains unchanged.
5. **Opposition:** A11:287-290 calls it harmonious; A13:405-406,1566 describes tension. Synthesis/review needed, not automatic majority vote.
6. **Medical body map:** A14:74-89 and156-163 reverse Cancer/Leo stomach/heart. Do not choose silently.
7. **Minor-angle arithmetic:** A13:525,556-570,635-643,1377-1385,1418,1549-1550 and A15:269 contain inconsistent names/degrees/fractions. Preserve review notes and existing correct API keys.
8. **Decan authorities:** Egyptian decans, A19:6908-6922 Tree bands, A4 sign levels, and `getDecan` Chaldean/Golden Dawn outputs are different layers. A3:821-823 is private NOTAS and cannot support decan levels.
9. **Return authorities:** A19:231-250 favors actual return location; A19:6722-6738 questions this in appended sidereal-return material. Annual-retrograde assessments also differ at3477-3491 versus5994-6003. Keep technique contexts explicit.
10. **OCR and heading errors:** Saturn/Aries book body absent; Descendant book missing/damaged sections; A9:1574 Jupiter6 mislabeled Venus; A10:1839 Pluto4 heading mislabeled MC; A12:69 Virgo becomes `VIAGEM`. Narrow final source ranges need manual verification.
11. **Thin/combined evidence:** Chiron signs and houses share12 source accounts. H provides144 cusp keywords with uneven primary corroboration. Lilith mean/true are calculation modes without separate interpretation grids. No invented duplication as independent teaching.
12. **Additional inconsistencies:** A18:667-670 Capricorn polarity; A21:142-147 versus723 dog compatibility. Chinese material must stay a separate corpus if approved.
13. **Secondary-source dependence:** A19 is substantially an included Volguine text with appended authorities. Repetition within a class and book lineage is not independent agreement. English indexes, the supplied reference sheets and the onboarding bank likewise are not new primary testimony.

Absent or incomplete factor grids are recorded directly above. Unknown means unknown. Final implementation should return `undefined` for unsupported keys, retain gap metadata separately, and never substitute a general profile as if it were a sourced specific placement.

## Proposed order and scope for Mat

| Order | Proposed batch | Scope recommendation |
|---|---|---|
| 1 | Core natal placements | 120 planet-sign +120 planet-house +12 house themes. Include supported Ascendant/MC/IC signs (36); put12 Descendant signs behind explicit approval of supplemental keyword/book coverage. Up to300 lookup rows including all angles |
| 2 | Basic factor language | 10 planet profiles,12 signs,4 elements,3 modalities,2 polarities,4 angle concepts,9 supported aspect types. Resolve opposition review first.44 rows |
| 3 | Additional natal context | Fortune25; Chiron concept and combined profiles; Lilith13;8 retrograde planet profiles and2 sect concepts. Nodes after convention decision. The144 cusp grid requires approval of keyword-level support |
| 4 | Richer optional natal factors | 96 retrograde houses and79 retrograde signs;6 Vertex houses and supported contacts; confirmed book aspect-pair keys. Keep explicit gaps and separate natal/transit contexts |
| 5 | Timing and relationship | Approved solar-return subsets, progression/profection method text, narrow synastry pairs. Do not ship missing transit/Firdaria/composite grids from general knowledge |
| 6 | Separate explicit decisions | 144 Sun/Ascendant combinations,360 symbolic degrees,36 decans after authority review, medical symbolism, Chinese material and wider esoteric correspondences |

Counts overlap across aliases and contextual variants. They are a workload guide, not an approved total. The first two batches would supply up to344 chart-compatible lookup rows, before cusp aliases and additional points, with the stated Descendant/source decisions. Mat can reduce or reorder any batch.

Format selected by Mat: paragraphs, with maximum fidelity to the teaching. Portuguese original, direct `você`, lowercase sentence starts with proper names preserved, short Brazilian phrasing, followed by equivalent English. Length follows the supported material; never add filler or remove a qualification to satisfy a word target. Keywords remain optional and must be source-supported. No practices, invented outcomes, automatic evolutionary-level assignment, profanity or emojis in reusable factor text. No descriptions have been drafted.

Pending decisions: approve/reorder the batches; decide whether supplemental keyword-only cusp/Descendant coverage is enough; settle node hemisphere/class conflicts for any approved node batch; choose whether medical symbolism and larger optional corpora enter at all. These are the phase1 user-requested decisions, not tool permission requirements. This was the phase1 hold. Mat subsequently approved batches1-3; current implementation progress in astrology-descriptions-progress.md governs continuation. Opposition and node dignity/hemisphere choices are resolved as recorded below. Supplemental cusp/Descendant and larger specialist scopes remain unapproved.

## Audit artifacts and validation

- [Classes0-7](astrology-inventory-classes-0-7.md), [classes8-15](astrology-inventory-classes-8-15.md), [classes16-22](astrology-inventory-classes-16-22.md): full-read ledgers, detailed boundaries and counts.
- [Book inventory](astrology-inventory-book.md), [book heading candidates](astrology-inventory-book-headings.tsv), [book aspect-pair audit](astrology-inventory-book-aspect-pairs.tsv): OCR limitations and exact located keys.
- [API and earlier-bank audit](astrology-inventory-api.md): chart-compatible names, runtime verification,108 existing bilingual draft entries and proposed editorial contract.
- [Hashed source manifest](astrology-inventory-sources.json): exact source snapshot, teaching/NOTAS boundaries.

Validation is documentary: all23 class manifests have valid teaching/NOTAS boundaries; explicit master-table citation tokens were checked against source bounds and NOTAS; the book TSV has270 unique pair/type audit rows (253 located,3 unresolved,14 absent); all108 prior-bank citations exist outside NOTAS; synthetic runtime chart keys agree with source. New artifacts contain no em dashes. No library source or tests changed for this inventory, so build/typecheck/test runs are reserved for implementation. Existing unrelated edits are left intact. Our only edit to a pre-existing tracked file is an added Unreleased changelog bullet for this inventory; concurrent unrelated edits remain untouched. No commit and no npm publication.

## Follow-up research requested by Mat

Paragraph format selected, with source fidelity above fixed length. [Cross-module NOTAS addendum](astrology-inventory-notes.md) records the follow-up search of115 class Markdown files across modules1-5, including plain `NOTAS:` boundaries,526 matching private-note line locations and eligible handout passages outside module4. The [metadata-only search ledger](astrology-inventory-notes-search.json) retains hashes and locations without copying private notes. Existing source gaps remain pending rather than being filled from personal examples. Phase2 scope/order still requires Mat's decision.

## Mat decisions, 2026-11-16

- Opposition: describe tension (A13:405-406,1566). Mat clarified that the harmony mentioned in A11:287-290 refers to positive/negative poles. This resolves the earlier pending review for descriptions.
- Node dignities: follow A15:45-53. Mat clarified that A12 and A15 address different things; preserve their contexts rather than treating the two passages as interchangeable rules. Keep astronomical north/south labels without hemisphere inversion, as already decided. This does not authorize calculation changes.

## Element profile audit: Mat decision, 2026-11-16

Mat selected A8:796-813 temperament labels: fire sanguine, earth choleric, air phlegmatic and water melancholic. A2:134-157/A3:64-79 use different mappings; retain that source disagreement. Generic independent qualities and symbolic hot/cold/dry/moist attributes remain supported separately. The A8 label choice does not transfer A2/A3 temperament-dependent traits, introduce bodily-humor claims or add Ascendant-element profiles. The response is recorded in the connected note Astrologia- elementos e temperamentos.

## Polarity profile audit: Mat decision, 2026-11-16

Mat selected Capricorn feminine/negative according to A2:104-105 and A11:191-194. A18:666-670 calls Capricorn masculine in its Lilith/Priapus discussion; that source context is retained, without changing the course or calculations. The response is recorded in Astrologia- polaridade de Capricórnio. Two generic activity/receptivity profiles remain definitions, not a sign classifier. Traditional day/night terminology here does not determine computed chart sect.
