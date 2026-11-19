# Astrology descriptions: general Chiron concept

## Scope and source identity

One additional natal factor concept at `points.chiron`. Final `/tmp/kaabalah-chiron-profile-approved.json` is adopted unchanged after the no-blocker review. Chiron is a celestial body, not a virtual point; the common point-concept bank accommodates both this body and Fortune without adding an ordinary-planet-bank row.

Root reports actual narrow primary inspection class notes:122-218 and supplemental B:5756-5774 plus5784. Integration read the supplied audit and review, relying on their inspections rather than reopening sources. The audit additionally records5784-5793 as adjacent context. No whole-course/book read, NOTAS or private readings were used; later placement accounts345-746 were not opened for this concept.

Primary: `class notes`, manifest857 physical lines, teachingEnd798, NOTASstart799; SHA-256 `6086a561dfeb805fea9103d6cd78aec2dcc6fd4fe864581e39af2d39fc1fd1fa`. Supplemental: `reference text`,123692 lines; SHA-256 `4bb23fbbba09fd9dc3db3392add9afbcd4da3703fb94a7bec1574f5527fdbab2`.

## Adopted primary clauses

| Physical inclusive range | Adopted concept |
| --- | --- |
| Class notes:132-136 | symbolic wounded healer; recognizing own vulnerability may support understanding others' pain |
| Class notes:145-147 | inevitable imperfection of the human condition |
| Class notes:152 | acceptance, forgiveness, compassion as themes |

The myth is symbolic context, not a native biography. The general entry asserts no particular wound, illness, mother rejection or Hercules event for the chart owner. Acceptance/forgiveness/compassion are linked themes without a prescribed sequence, practice, clinical claim or healing promise. “Wounded healer” / “curador ferido” is an allowed archetypal expression, not a treatment outcome.

class notes:140-144 age-near-50/death/liberation statements,157-218 physical/cycle/bridge/aspect/transit material and later placements are not generalized into this concept. Class notes:207-216 Pluto-system qualification is recorded contextually without producing a planet-pair interpretation. Sun harmony/disharmony at192-200 remains outside scope. No invented number or evolution-level assignment appears.

## Supplemental context and limits

B:5756-5774 criticizes broad software displays and groups Chiron among extras, describing spatial noise; B:5784 names major transits nearby. This limited methodology context supplies no adopted personality wording, no alternate Chiron natal profile and no evidence for universal rejection of Chiron. Primary course authority is preserved. The old inventory window5750-5766 omitted the immediate continuation and is not treated as the complete passage.

class notes:122 heading aliases Kíriom/Quíriom remain source context; display Quíron is attested at192. Canonical chart key `chiron` is populated from Planet.CHIRON in the planetary position map, with the birth-chart planet map lowercasing the name. It is the sole new accepted point identifier.

## Approved review notes

- Adopted the source's symbolic wounded-healer image: recognizing one's own vulnerability may support understanding others' pain. The inevitable human-imperfection qualification, acceptance, forgiveness and compassion are preserved without a prescribed sequence or promised healing.
- The Hercules/Kíriom myth is context for the metaphor, not a fixed biography or event assigned to a chart owner. No wound, illness, diagnosis, cure, relationship outcome, or healing guarantee is asserted; age/cycle and later placement-specific material are outside this concept profile.
- The supplemental book at reference text:5756-5774 groups Chiron among software extras and calls the displayed collection spatial noise, with major transits named nearby at5784. This is limited methodological context, not a contrary Chiron natal profile; it provides no adopted personality wording and does not override the primary course.
- Class notes:207-216 recommends considering Chiron with Pluto in a spiritual system. This is retained as contextual qualification without generating an unapproved planet-pair interpretation. Sun harmony/disharmony at192-200 and transits/cycles are not generalized into this concept.

## Implementation and preservation

`DescriptionPoint` expands only to `"parsFortunae" | "chiron"`. Existing `getPointDescription/Entry` and the common readonly entry shape handle the new concept. The getter comment now describes additional natal factors rather than all-virtual points. English default, case-sensitive pt-prefix selection, own-key guards, unknown-key gaps and recursive freeze remain unchanged. Chiron sign and house profiles remain explicit gaps; no new getters or placements are added.

The Fortune test replaces only the former whole-union/whole-bank exclusivity assumptions with membership and literal narrowness checks. Fortune entry identity, readonly metadata and unknown-key contracts are retained. All357 prior rows and old-input getter behavior remain unchanged; total358.

Only six agreed files are integration-owned: JSON/TS, new Chiron API/source tests, this audit and the necessary Fortune API-test pins. No index/calculations/CLI/package, other docs, build or commit edits. Root owns helpers/checks/other docs/commit. Validation is recorded in `/tmp/kaabalah-chiron-profile-integration.md` and `.tests.json`/`.tests.exit`.

## Final validation and next kind

418 astrology description tests, build, typecheck and public CJS/ESM checks passed with actual exit0. All357 prior rows remain unchanged,total358. Source hash/teaching bounds and public-doc ownership passed. Latest full suite at f7cdc05 passed1575 before the basic revisions and this concept. Next:12 combined sign-or-house source accounts, class notes:345-746 and gentler Aries/1 example280-289. Locate exact headings and keep source-sharing explicit: not24 independent profiles or144 combinations.
