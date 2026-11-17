# Astrology descriptions: completed implementation handoff

Approved batches1-3 complete:431 canonical bilingual entries. See astrology-descriptions-final-validation.md for the count table and final validation.

- Coverage: natal288; basics44; Fortune25; Chiron13; Lilith13; retrograde8; sect2; nodes38 (concept2/sign24/houseaxis12). Shared Chiron/Lilith/node-axis aliases do not inflate authored counts.
- Files: src/astrology/descriptions.json/.ts; per-kind docs/content/astrology-descriptions-*.md; public docs only within Bilingual natal descriptions; own Unreleased bullets. Older kind tests remain; none added for nodes after Mat asked to accelerate.
- Typed getters: planet/sign/house/angle/profile/aspect/point families; getRetrogradePlanetDescription/Entry(planet,longitudeSpeed,language?); getSectDescription/Entry(sect,language?); getLunarNodeDescription/Entry(role,language?); getLunarNodeSignDescription/Entry(role,sign,language?); getLunarNodeHouseDescription/Entry(role,house,language?). Entry forms omit language. Imported JSON recursively frozen/readonly, English default and exact pt-prefix Portuguese, explicit unsupported gaps.
- Nodes: role north/south is separate from chart storage. Mean node/true node both North; existing points adapter derives South. No hemisphere inversion. Independent24 sign records;12 directed house accounts queried through24 source aliases, North1=South7 but reverse North7 distinct. No new positions or generic fallback. Retrograde only finite numeric speed<0; missing/nonfinite/nonnegative explicit gap.
- Decisions: A8 element temperament labels; Capricorn feminine/negative A2/A11, alternateA18 context retained; opposition=tension, harmonypositive/negativepoles; node dignitiesA15:45-53 withA12context distinct; Fortune9 both realizationfield and learningtheme. Broadfamily themes, no parentsex assignment. No required decision pending.
- Visual sources: read-only books/Astrologia Hermetica.pdf SHA47a85a1b330344cdfc59d684eb573e6ca1035b988263a667b2336e30e0b1a1f5. PDFphysical506/508 signs,507/509 houses; images resolve OCR interleaving. Retain MDinclusive src plus PDFpage notes. Check original image before declaring OCRgap. No privateNOTAS/client evidence; no repeat inventory needed.
- Final validation: build/typecheck/existing fullsuite pass with actualexit0, detailed count/artifacts in final-validation. Mat’s latest workflow stops adding description/provenance tests and per-kind suite reruns. Subsequent authorized release: npm6.18.0 is published as latest with all431 entries; tagv6.18.0 points to29f6a9e58bf4dc07ed211c9ea32cba8dad530957. Verified packed CJS/ESM/CLI/WASM/ephemeris installation and registry checksum. Jyotish uses the Dhruva method name. Main/tag and public documentation are updated; future publication still requires Mat’s instruction.
- Ownership: directmain, kind-separable commits. Preserve Claude’s calculations/release6.17.0; no index/calculation/CLI/numerology/package/tsup edits. Unrelated .DS_Store deletion left untouched. Current final kind is the directed node-house accounts; commit message feat(astrology): add directed lunar node house descriptions.
- Exact next factor: NONE in the approved batches. Do not expand into Descendant signs,144cusps,specialist factors,timing,synastry,symbolic degrees,Chinese astrology or other inventory sets without explicit approval. Source-specific gaps and disagreements remain in their audits; they are not fallback descriptions.

## Batch 4 (2026-11-17, uncommitted at time of writing)

599 further entries, catalog total 1030. Open gaps, source disagreements and thin-evidence entries: astrology-descriptions-batch4-open-issues.md.

- Sets: angleSigns.dc 12; houseCuspSigns 139 of 144; retrogradePlanetSigns 79 of 96; retrogradePlanetHouses 96; points.vertex/antivertex 2, pointHouses.vertex 6 (houses 4-9), vertexPlanetContacts 9; aspectPairs 256 of 270.
- Getters: getHouseCuspSignDescription(house, sign); getRetrogradePlanetSignDescription(planet, sign, longitudeSpeed); getRetrogradePlanetHouseDescription(planet, house, longitudeSpeed); getVertexContactDescription(planet); getAspectPairDescription(aspect, planetA, planetB), order-independent. Each has an Entry form. Vertex and Antivertex are DescriptionPoint keys (points, pointHouses.vertex).
- Method: one source-audit agent per set, no per-kind audit docs or tests. Structure, key sets and source line ranges were machine-checked; a second read then checked the 596 agent-authored entries against their cited lines and its 68 corrections were applied (report in the open-issues file).
- Not started: Sun x Ascendant 144 (A7:16-576), dignity/decan/degree concepts, timing, synastry, Chinese astrology, Priapus, Lilith houses/aspects, Vertex ruler-house scenarios (A18:1032-1064).
- Aspect pairs were then re-checked against the printed page images (PDF physical pages 515-782, one pair per page): 179 kept, 77 rewritten. Rendered pages, not the OCR, are the reference for this set.

## Batch 5 (2026-11-17)

550 further entries, catalog total 1580. Notes and open points: astrology-descriptions-batch4-open-issues.md, section "Batch 5".

- Sets: sunAscendantSigns 144 (A7:16-576, outer key Sun, inner Ascendant); symbolicDegrees 360 (A11:341-1556); dignityStatuses 4 (A12/A15 name them, effect wording from the book); decanConcept 1 (classes) and decans 36 (book, read from printed pages 70-114); houseCuspSigns.6 completed to 12.
- Getters: getSunAscendantDescription(sunSign, ascendantSign); getSymbolicDegreeNumber(longitude) and getSymbolicDegreeDescription(sign, degree); getDignityStatusDescription(status); getDecanDescription(sign?, decan?). Aliases: Vertex by sign through the natural house (Cancer-Sagittarius only); Lilith by house through the natural sign.
- Mat's rulings applied: classes take priority over the book and the keyword sheet (16 entries rewritten: 5 Descendant signs, 11 cusps); house 6 may speak of health; the retrograde, Vertex-house and aspect-pair gaps are accepted as they are.
- Class-versus-class points on the Vertex (A18, A13:1489): Mat accepted all of them as they stand; no entry changes. Lilith by house through the natural sign is confirmed by Mat. Lilith aspects have no source and were not authored.
- CLI: `astrology:describe` looks up every description family by kind and keys (src/cli/commands/astrology-describe.ts).
- Not started: timing, synastry, Chinese astrology, Priapus, sign transitions, five-degree angel sectors, Vertex ruler-house scenarios.

