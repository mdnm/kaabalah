# Astrology descriptions, batch 4: open issues for Mat

Authored 2026-11-17 by parallel source-audit agents, one per set. Nothing below blocks the build; these are the gaps, source disagreements and thin-evidence entries to clear up by hand. Line numbers are physical lines in the course files (root `/Volumes/AKASH/aula kaabalah/`).

| Set | JSON key | Authored | Candidate | Not authored |
| --- | --- | ---: | ---: | --- |
| Descendant by sign | `angleSigns.dc` | 12 | 12 | none |
| Sign on house cusp | `houseCuspSigns` | 144 | 144 | none (the five house 6 cells were added in batch 5) |
| Retrograde planet by sign | `retrogradePlanetSigns` | 79 | 96 | Uranus 3, Neptune 7, Pluto 7 (absent from class 16) |
| Retrograde planet by house | `retrogradePlanetHouses` | 96 | 96 | none |
| Vertex / Antivertex | `points.vertex`, `points.antivertex`, `pointHouses.vertex`, `vertexPlanetContacts` | 2 + 6 + 9 | | houses 1-3 and 10-12, Neptune contact, signs (absent from class 18) |
| Planet-pair aspects | `aspectPairs` | 256 | 270 | 14 pairs absent from the book family. Square mars/neptune, jupiter/uranus and saturn/uranus were identified by Mat from the printed pages on 2026-11-17 and authored from them |

Total: 599 new entries.

Cross-cutting points:

- 95 of the 139 cusp entries cite only the supplementary keyword sheet (one short sentence each); the course prose mostly says "sign in house N", not "on the cusp".
- Aspect pairs were re-checked on 2026-11-17 against the printed page images, not the OCR: PDF physical pages 515-782, one pair per page, pair taken from the printed heading. All 256 headings matched the keys; 179 entries were kept and 77 rewritten (list at the end of this file). This supersedes the OCR-based findings for aspect pairs in the per-set logs and in the second-read report below. The book has no general text per pair, so every entry is still a synthesis of the theme common to its twelve sign paragraphs. Weakest syntheses flagged by the readers: the six Venus trines; square moon/venus, jupiter/uranus, mars/pluto; quincunx mercury/jupiter (the printed page reads like the Mars page with Jupiter's name), venus/jupiter, venus/saturn, mars/jupiter.
- Each aspect chapter opens with a general page about the aspect itself (for example PDF pages 562, 606, 650, 696, 740); those were not used.
- Retrograde phase vocabulary (Fase I/II/III) was left out of the placement entries.
- The Descendant entries were read from the PDF image (physical page 503) because the OCR is unusable there.
- A second read on 2026-11-17 checked the 596 agent-authored entries against their cited lines: 68 findings (5 wrong or unsupported, 38 overreach or mismatch, 25 cosmetic), all applied to the entries and recorded in their reviewNotes. Its report is near the end of this file, including the sections too garbled to verify. The three squares authored from the printed pages were not part of it.

The per-set logs follow verbatim.

---

## Descendant in sign (angleSigns.dc)
Counts: authored 12 / expected 12
### Gaps (keys omitted, with reason and lines inspected)
None. Aries, Taurus and Gemini: B 66690-66780 holds no usable OCR for them (the extracted section starts at Libra; the Aries/Taurus/Gemini paragraphs are missing). I rendered PDF physical page 503 (the "Descendente" table, one printed paragraph per sign, left column holds Aries to Virgo, right column Libra to Pisces) and read those three from the image. Pages 502 (Ascendant Aquarius/Pisces) and 507-508 (nodes) were checked and are not the Descendant.
### Inconsistencies and source disagreements (lines; what conflicts; what you chose)
- A8 1313-1314 says Leo on the Descendant means almost the same as Sun in house 7 (looking for a strong figure, projecting the solar principle); B's Leo paragraph is about dramatic, creative partners seeking admiration. Chose B for the text; A8 only cited as context.
- Taurus: A9 823-825 stresses fidelity and jealousy; B stresses reliable, practical, sensual partners. Used B plus possessiveness and the "security/financial gain/physical closeness" framing; dropped fidelity/jealousy as deterministic.
- Libra: A9 adds idealizing partners/endless search; B has none of this. Kept only the tact and no-exclusion-driven-compliance point.
### Weak support (entries authored on thin/keyword-only/damaged-OCR evidence; key + reason)
- No entry is keyword-only: each rests on a full B paragraph.
- Aries, Taurus, Gemini: B lines unusable; text taken from the PDF image (page 503), with Aries's "um certo grau de conflito" phrase dropped as illegible in the scan.
- Cancer, Leo, Virgo, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces, Libra: B OCR is interleaved and garbled; each paragraph was reconstructed from the PDF image page 503 rather than the OCR text.
- A11 111-116 (Descendant as "Tu", what we seek in others) was read but not quoted, to avoid gluing a general concept onto sign profiles.

---

## Sign on the house cusp, houses 1-6
Counts: authored 67 / expected 72

### Gaps (keys omitted, with reason and lines inspected)
- House 6 x Cancer, Scorpio, Sagittarius, Aquarius, Pisces: H (lines 100-226 rows for house 6) offers only health/body keywords for these (stomach, reproductive organs, liver/hips, nervous system/circulation, feet/lymphatic). Excluded by the health rule, nothing left to write. A6/A8/A9 have no cusp-6 prose for these signs.

### Inconsistencies and source disagreements (lines; what conflicts; what you chose)
- Scope of A6:51-255: the whole range is house 1 only ("CASA 01 NOS SIGNOS", one paragraph per sign, written as "O ASCENDENTE <signo>"). There is no prose for houses 2-6 in A6. A8:1090-1099 is a generic note (the subjects of a house follow the sign on its cusp, from the ruler's placement); no sign content. Used for no entry.
- House 1: A6 describes the Ascendant; entries are phrased as "cusp of house 1" per the task. The two coincide only in some house systems, so this is an assumption to confirm.
- A9 (Mercury and Venus house chapters, file lines 302-993) is mostly "sign in house N" without cusp wording. Used only where it says cusp, Fundo-do-Céu (taken as house 4 cusp), or "cúspide ou contido na casa": Gemini/Virgo 4 (394-404), Taurus/Libra 4 (732-743), Libra 3 (712-715), Gemini/Virgo 5 (431-433), Gemini 6 (460-461). Pure in-house passages (e.g. Gemini/Virgo in house 3 at 373-378, Taurus in house 3 at 710-712, Gemini/Virgo/Taurus/Libra in house 2 or 6) were not used; those cells rest on H only.
- Virgo 5 and Gemini 5: A9 wording is "cúspide ou contido na casa 5" / "Virgem nesta posição", so the cusp/occupation split is not clear. Same for Libra 3, Taurus 4, Libra 4.
- H vs course: no real contradiction found. Minor: Virgo 5 H says "perfeccionismo criativo, estética refinada"; course lists practical crafts (carpentry, refined cooking, sewing, pottery). Course followed; H only supplied the second sentence's "método/perfeição". Gemini 4 H "mudanças de residência" vs course "dois lares / raízes superficiais": course followed, H keyword not used.
- Dropped H keywords that conflict with exclusion rules: health terms (all of house 6 body parts, "saúde robusta"), "lealdade romântica" (Taurus 5), "sorte financeira" (Sagittarius 2, prediction), "maternagem"/"karma materno" (gendered parent assignment).

### Weak support (entries authored on thin/keyword-only/damaged-OCR evidence; key + reason)
- Keyword-only (H sheet, single sentence): houses 2: all 12 signs; house 3: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces; house 4: Aries, Cancer, Leo, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces; house 5: Aries, Taurus, Cancer, Leo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces; house 6: Aries, Taurus, Leo, Virgo, Libra, Capricorn (47 keys).
- Of these, most carry only 2 keywords (H rows give 2-3 phrases and the brief asks for 3 to 5); house 6 entries have 2 keywords with a second word taken literally from the H phrase. Not padded with unsupported terms.
- Thin course support with an H-based second sentence: Gemini 5, Virgo 5, Gemini 6 (single clause in A9), Libra 3, Taurus 4, Libra 4, Gemini 4, Virgo 4 (course is Mercury/Venus-in-house prose reused for the cusp).
- Houses 1 (12 keys) are well supported by A6; health, childhood-trauma and manipulation statements left out; "Aquarius" and "Capricorn" kept to personality traits only. A6 is OCR with some noise ("trio" for frio, etc.), meaning clear from context.

---

## Sign on the cusp, houses 7-12
Counts: authored 72 / expected 72 (24 from course prose A9, 48 keyword-only from H)

### Gaps (keys omitted, with reason and lines inspected)
- None omitted. A6:51-255 only covers the Ascendant (house 1) and A8:1090-1099 is only the general rule (house subjects follow the sign on the cusp, mainly), so neither has per-sign prose for houses 7-12. A9:302-993 (Mercury and Venus in houses 1-12) was read in full; it only names the signs Gemini, Virgo (Mercury) and Taurus, Libra (Venus).

### Inconsistencies and source disagreements (lines; what conflicts; what you chose)
- A9 mostly says "X na casa N" (sign in the house), not explicitly "on the cusp". Explicit cusp wording: Gemini 10 (557), 11 (585), 12 (644); Virgo 12 (647); Taurus 8 (846), 11 (936), 10 ("meio do céu", 904), 12 (986); Libra 10 ("meio do céu", 909). All other course cells use in-house wording. Chose to use them, guided by A8:1095-1099 (house topics follow the signs where it sits, mainly the cusp). Owner may want to downgrade those.
- A9:820 (Libra cusp of house 7) is a famous-person example; excluded.
- H vs course: H does not contradict the course on any cell, but H often gives a different emphasis (e.g. H Taurus 12 "conforto no isolamento, medos de perda material" vs A9 "materialista ou teimoso demais / falta de praticidade"). Course preferred.
- H lines 24, 13: H calls house 7 "Descendente" and 10 "Meio do Céu"; entries use "cúspide da casa N" per instructions.
- Excluded H keywords as health, sexuality, death or gendered-parent claims: "morte como conceito intelectual" (Gemini 8), "filosofia matriarcal" (Cancer 9), "karma materno" (Cancer 12), "relações abertas" (Aquarius 7), "autodestruição potencial" (Scorpio 12), "sexo" items. Aquarius 7 uses only "parcerias livres". Cancer 11 keeps "amizades maternais" (a friendship style, not a parent assignment).

### Weak support (entries authored on thin/keyword-only/damaged-OCR evidence; key + reason)
- Keyword-only (H), one short sentence each: houses 7-12 for Aries, Cancer, Leo, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces (8 signs x 6 houses = 48 keys). Keywords split from H phrases and, where H gave only 2 items, a third was a one-word generalization of those items (e.g. "ação", "misticismo", "durabilidade").
- Thin course support (one sentence, in-house wording): Gemini 7, 8, 9; Virgo 10. Gemini 8 generalizes a sexual-desire remark (A9:515-516) to "temas ocultos e íntimos", with the sexual content excluded.
- Virgo 9 (A9:536-537) and Libra 7, 12 (A9:826, 992-993) have light OCR garble; sense restored from context.
- Taurus 9, Libra 8, 9, 11, 12, Virgo 7, 8, 9, 11, Gemini 7, 8, 9: in-house wording only (see Inconsistencies).

---

## Retrograde Mercury and Venus, natal sign and house (source A16)
Counts: authored 48 / expected 48
(Mercury signs 618-918, houses 919-1270; Venus signs 1352-1691, houses 1692-2009; all read in full.)

### Gaps (keys omitted, with reason and lines inspected)
None. Every sign and house has a section in the source.

### Inconsistencies and source disagreements (lines; what conflicts; what you chose)
- Phase vocabulary (Fase I/II/III, "tríplice Processo Retrógrado") runs through nearly every section. The general library profiles do not define it, so it was omitted from all entries; comfort/discomfort-by-phase statements were not used.
- Line 1352-1378 vs 1379 and others: some sections open with the phase comfort sentence, others do not; no content conflict, only structure.
- Mercury in Libra 762 ("one of the hardest positions") and Mercury in Aquarius 873 ("one of the best") are rankings; not carried into the entries as they are evaluative, not descriptive.
- Mercury house 8 (1110) and Mercury Scorpio (802-803), house 11 (1212): the source's sexual statements share physical lines with adopted text; the sexual wording was excluded, ranges cited include those lines.
- Venus Libra 1512-1514 (sexual orientation statement) shares lines 1512 and 1514 with adopted text; statement excluded.
- Mercury Pisces 899 "past life despair" and several "Carma" passages are stated as fact in the class; excluded or softened to symbolic tendency (Venus house 8 and house 12 keep a symbolic "old love" tendency).
- Chart-wide claims about "the horoscope" (Mercury house 1, 939-941; house 4, 1013-1015; Venus house 7, 1853-1854) were left out.
- OCR/typo glitches: "aluai" (1743), "Kharmicamente" (1227, 1929, 1951), "cm" (928). No effect on content.

### Weak support (entries authored on thin/keyword-only/damaged-OCR evidence; key + reason)
- None thin. Mercury Libra, Mercury Pisces and Venus house 3 are shorter and partly cut around karma lines, so the entries rest on fewer lines; mercury house 9 (1127-1169) is long and discursive, entry condenses it.
- Mercury Sagittarius and Mercury house 9 rely partly on lines with stray empty page-break lines (823, 1150); no text lost.

---

## Retrograde Mars and Jupiter in signs and houses (A16)
Counts: authored 48 / expected 48
Lines used: Mars signs 2086-2354, Mars houses 2355-2616, Jupiter signs 2694-2960, Jupiter houses 2961-3260 (each entry cites its own section). Range boundaries verified by heading grep; Jupiter house 12 ends at 3260 (Saturn heading follows).

### Gaps (keys omitted, with reason and lines inspected)
None. All 48 keys have an entry.

### Inconsistencies and source disagreements (lines; what conflicts; what you chose)
- Phase terminology (Fase I/II/III of the "Processo Retrógrado") runs through nearly every section. I did not use phase labels, since they belong to the general profile; only the sign/house-specific tendencies were kept. Mars Gemini/Sagittarius/Aquarius and Jupiter house 10 are partly phase-based; only the non-phase content was used.
- Heading typos in source (2321 "RETRÓGRADOEM", 2511 "RETRÓGRADONA", 2961 "RETRÓGRADONA"); read as the correct sign/house.
- Jupiter house 2 (2982-3007) and Jupiter house 5 (3061-3086) contain chart-conditional statements (cusp sign, squares/fixed signs/angular Saturn); excluded as not specific to the placement itself.
- Jupiter house 1 (2961-2981) mixes "Áries" nature into a house description; only the house-1 behaviours were kept.
- Mars house 11 (2599) closes by saying the sign matters more than the phases; not used.
- Mars house 3 (2403-2406) first sentences are internally odd ("marcou os outros negativamente"); only the clear communication-rudeness reading was used.
- Gendered, sexual, marriage, health, past-life and karma statements (many in every Mars house and sign) were systematically excluded or softened to symbolic tendency (e.g. Mars 12: "experiências dolorosas do passado").

### Weak support (entries authored on thin/keyword-only/damaged-OCR evidence; key + reason)
- Mars house 9 and Mars house 12: much of the source is past-life/astral/gendered material; the entry rests on a smaller residue (freedom/spiritual search; hidden anger/looking backward).
- Mars house 4: large parts excluded (womb, parent images, gender); remaining entry is energy dependence and age-gap relating.
- Jupiter house 9: source is mostly about commitment and nomadism; entry kept to communication difficulty, wandering and teaching.

---

## Retrograde Saturn and Uranus in sign and house (A16)
Counts: authored 45 / expected 45 (Saturn 12 signs + 12 houses; Uranus 9 signs + 12 houses; 3 Uranus signs absent from the class)

Source: modulo 4/aula 16 modulo 4/aula-16.md. Saturn signs 3315-3575, Saturn houses 3576-3844, Uranus signs 3917-4147, Uranus houses 4148-4420 (verified against section headings; Uranus house 12 ends just before the Netuno heading).

### Gaps (keys omitted, with reason and lines inspected)
- uranus / Capricorn, Aquarius, Pisces: absent. Lines 3917-4147 have headings only for Aries through Sagittarius (3917, 3941, 3968, 3999, 4022, 4051, 4073, 4095, 4119); the Sagittarius section runs straight into "URANO RETRÓGRADO NA PRIMEIRA CASA" at 4148. A grep of the whole file for "URANO RETR.*(CAPRIC|AQU|PEIX)" returned nothing. Not filled from general knowledge.

### Inconsistencies and source disagreements (lines; what conflicts; what you chose)
- Saturn Libra (3450-3472): "experiences others' karma more than they do" and "changes others' karmic direction" are stated as fact; kept only the softened responsibility/imbalance and mediation material.
- Uranus Leo (4022-4050): opens with very high energy but ends with chronic dissatisfaction; entry keeps both as tendencies.
- Uranus house 2 (4169-4190): Phase depends on positive/negative sign of the cusp; it is a cross-reference to another factor, not turned into a claim.
- Uranus house 10 (4343-4371): "especially good for advertising and mass communication" excluded as a career outcome claim.
- Saturn house 7 (3712-3733) and Uranus house 7 (4269-4293) mix marriage outcomes ("wife is holding him back", "more than one marriage"); excluded, only self-reliance and relationship-lesson material kept.
- All entries drop "Fase I/II/III do Processo Retrógrado" statements, since the general retrograde profile covers the phases.
- Excluded throughout as health, sexual, or fact-stated past-life content: Saturn house 4 (phobias, Oedipal conflict as fact), Saturn house 8 (sexual restrictions, abuse, frigidity), Uranus house 12 (past-life sexual abnormality/homosexuality, past-life astrology), Uranus Cancer (child outside marriage, abortion), Saturn Scorpio ("edge of destroying himself"), Uranus Gemini (hypnosis caution, sexuality), Uranus Taurus/Scorpio/house 8 (sexual interest and celibacy).

### Weak support (entries authored on thin/keyword-only/damaged-OCR evidence; key + reason)
- Uranus house 4 (4214-4232): the "time concept differs from chronological reality" line was omitted for lack of a clear hedgeable meaning; entry rests on the remaining lines.
- Saturn Pisces (3554-3575) and Saturn Libra (3450-3472): mostly karmic/spiritual claims with few concrete tendencies, so entries are thinner on behavior.
- OCR is clean overall (minor typos such as "segure", "c," for "e", "era" for "em" at 3414); no damaged passage affects a claim.

---

## Retrograde Neptune and Pluto: signs and houses (A16)
Counts: authored 34 / expected 48 (Neptune signs 5/12, Pluto signs 5/12, Neptune houses 12/12, Pluto houses 12/12)

Source: modulo 4/aula 16 modulo 4/aula-16.md. Neptune signs 4472-4585, houses 4586-4822; Pluto signs 4887-5011, houses 5012-5270 (5271 blank, `## NOTAS` at 5272). Each entry's src is its full section; reviewNotes cite what was adopted/excluded.

### Gaps (keys omitted, with reason and lines inspected)
- Neptune signs: Aries, Taurus, Gemini, Cancer, Capricorn, Aquarius, Pisces absent. Headings in 4440-4585 run only Leo, Virgo, Libra, Scorpio, Sagittarius (confirmed with grep of all "NETUNO RETRÓGRADO EM" headings).
- Pluto signs: Aries, Taurus, Gemini, Sagittarius, Capricorn, Aquarius, Pisces absent. Headings in 4867-5011 run only Cancer, Leo, Virgo, Libra, Scorpio (confirmed with grep).

### Inconsistencies and source disagreements (lines; what conflicts; what you chose)
- Neptune houses 4586-4822: the "Fase I/II/III do Processo Retrógrado" is cited in most sections but the phases are not defined in the ranges read; phase statements were left out of all entries (they would not be interpretable without the general profile).
- Neptune in Leo (4482-4486) and Pluto in Cancer/Leo/Libra/Scorpio, Neptune in Scorpio/Virgo: the sections mix a generational/historical account (Hollywood, WWII, psychoanalysis, gurus, Piscean Age) with the personal reading; only the personal reading was used.
- Neptune house 6 (4691-4707) says Neptune is in its "queda" in house 6 and also in sign Virgo (4490); not used, as dignity claims are not part of the entry style.
- Neptune house 12 (4804-4822) calls it its natural house; dignity statements not used.
- Source calls several placements marriage-difficult (Neptune 4, Pluto 1, Pluto 7); softened to a tendency or dropped per brief.

### Weak support (entries authored on thin/keyword-only/damaged-OCR evidence; key + reason)
- Pluto sign Scorpio: personal-level material is only a few sentences (about 4995-5003); the rest is world-historical. Entry kept short in substance.
- Neptune sign Scorpio: personal material is only about 4541-4548; remainder is generational and Piscean Age statements.
- Pluto sign Libra: the source opening is partly abstract (consciousness/window of the race); entry sticks to observer and responsibility ideas.
- OCR is clean overall; minor typos only ("fazêlo", "rnaneira", spaced "E l e", "ingênuo") and none affect meaning.

---

## Vertex / Antivertex (A18, lines 849-1064)
Counts: authored 17 / expected 17 (2 points, 6 Vertex houses, 9 planet contacts)
### Gaps (keys omitted, with reason and lines inspected)
- Vertex houses 1-3, 10-12: source covers only 4-9 (920-995).
- Antivertex house entries: none authored. Antivertex counterpart (5->11, 6->12, 7->1, 8->2) is folded into the Vertex house 5-8 texts; no text for 4 and 9.
- vertexPlanetContacts neptune: absent from source (1023-1031). Non-planet points: no contacts given.
- Vertex/Antivertex sign entries: none in source.
### Inconsistencies and source disagreements (lines; what conflicts; what you chose)
- 1032-1064: 12 scenarios for the house of the Vertex's RULER (a different factor), plus a note on Kabbalistic astrocartography (1061-1064). Left out of house text; they exist if wanted as a separate factor.
- 1026 Venus and 1025 Mercury are near-identical (irmãs/irmãos, filhas, amante, amigas): probable copy error; both authored with neutralized gender.
- 922-923 vs 983: Vertex "usually in 5-8, rarely 4 and 9". Not used in entries; 4 and 9 note rarity only in reviewNotes.
- 992-995 (house 9) reads as house-3 themes (siblings, neighbors); kept as written.
- Planet contacts: gendered family roles (pai, marido, mãe, esposa, filhas, irmãs) removed per brief; some entries therefore thinner than source.
- 997-1020 (reencontro, impediments, "sempre ocorrerá algo do destino para separá-los", divorce outcome, homosexual relationships) not used: deterministic relationship outcomes.
### Weak support (entries authored on thin/keyword-only/damaged-OCR evidence; key + reason)
- vertexPlanetContacts.uranus (two words in source), venus/mercury (duplicated source line), jupiter (keyword list only).
- pointHouses.vertex.4 and .9: short, machine-translated-looking text (Portugal Portuguese register), no Antivertex.
- Houses 5-8 source reads as machine-translated from English; meaning reconstructed conservatively.

---

## Conjunction family, part A (sun, moon, mercury first-planet pairs)
Counts: authored 24 / expected 24

### Gaps (keys omitted, with reason and lines inspected)
None omitted. Structural gap: no pair in B 67962-71850 has an untitled general opening. Every entry is built from the theme common to the per-sign paragraphs (stated in each reviewNotes).

### Inconsistencies and source disagreements (lines; what conflicts; what you chose)
- B 69511-69512 (moon/mercury): "Capricórnio:" label sits above text that says "em Câncer"; interleaving artifact. Not used beyond the common theme.
- B 70046-70060, 70129 (moon/saturn): Scorpio appears twice and several labels are displaced; no content conflict, only common theme used.
- B 68984-69210 (sun/neptune): paragraphs fused/garbled, labels mixed; used only legible clauses.
- B 70667-70870 (mercury/venus): heading legible, body words stacked line by line; pair identity confirmed from the body text ("Mercúrio e Vênus em conjunção", 70692, 70706, 70736).
- Sign-specific colour in each pair (e.g. Aries impulsive, Capricorn ambitious) was deliberately excluded from the general text.

### Weak support (entries authored on thin/keyword-only/damaged-OCR evidence; key + reason)
- sun/neptune: severely corrupted OCR; few legible clauses.
- mercury/venus: heavily scrambled two-column OCR; relies on the repeated "conexões intelectuais" formula.
- moon/saturn, sun/saturn, mercury/saturn: scrambled OCR; the "equilibrar impulsividade e paciência" clause in moon/saturn is only partly legible.
- All 24: the book's per-sign text is formulaic, so common-theme content is generic (function of the second planet); no general interpretation by the author exists.

---

## Natal aspect pairs: conjunction, second half (venus/mars ... neptune/pluto)
Counts: authored 21 / expected 21
### Gaps (keys omitted, with reason and lines inspected)
- None omitted. B:71850-75000 inspected in full. No pair has a general (untitled) opening; every entry is built from the common thread across sign paragraphs, as stated in each reviewNotes.
- Venus/Mars Sagitário and Capricórnio paragraphs are truncated by OCR (71880, 71901-71931); not needed.
### Inconsistencies and source disagreements (lines; what conflicts; what you chose)
- Saturn/Uranus, Saturn/Neptune, Saturn/Pluto, Uranus/Pluto, Neptune/Pluto: the book frames these conjunctions as tension or transformation rather than the harmony/expansion framing of the other pairs. Kept the book's framing.
- Uranus/Pluto Aquário and Peixes (74769-74781, 74801-74807) duplicate Uranus/Neptune text; Neptune/Pluto Escorpião (74969-74974) duplicates Uranus/Pluto Escorpião (74731-74741) and Neptune/Pluto Aquário (74989-74993) duplicates Uranus/Neptune Aquário (74679-74687). Not used as evidence.
- Venus/Uranus, Venus/Saturn, Venus/Neptune say "busca estabilidade" even where the sign adjective is adventurous or intense (e.g. Sagitário, Escorpião); kept the stable-core wording only where it is common.
- Mars/Jupiter: "energia amplificada" is stated only in Áries (72720-72723); used as the pair's general statement.
### Weak support (entries authored on thin/keyword-only/damaged-OCR evidence; key + reason)
- venus/jupiter: heading and columns badly damaged (71958-72141); identity confirmed by body text "Vênus e Júpiter".
- mars/uranus: heading damaged (72954-72958) and each line split mid-word; confirmed by body text "Marte em conjunção com Urano".
- jupiter/uranus, jupiter/neptune, mars/neptune: OCR fragmentation of most paragraphs; theme repeats in every sign so support is adequate but wording is general.
- uranus/pluto, neptune/pluto: partly duplicated source text (see above); generic.
- All 21 entries rest on formulaic sign templates; the library statements are therefore low-specificity.

---

## Natal planet-pair aspects: sextile family
Counts: authored 43 / expected 43

### Gaps (keys omitted, with reason and lines inspected)
- sun/mercury and sun/venus sextile: not in the book family (not_located_in_book_family); correctly not authored.
- No located pair was omitted.

### Inconsistencies and source disagreements (lines; what conflicts; what you chose)
- No pair has a general opening. Every section is a sign-by-sign template ("Planet A in sign X; planet B may be in sign Y or Z; harmony of traits; outcome clause"). Entries use only the outcome clauses common across signs.
- Anchors that fall mid-body (ranges were set by body content, not by the TSV anchor): moon/saturn (anchor 94752; body about 94600-94770), moon/uranus (94798; body from 94770), moon/neptune (95105; body from about 94950), sun/neptune (93618; body from about 93590), jupiter/saturn (99470; damaged heading at 99453; body from about 99375), jupiter/uranus (99662; body from about 99540).
- Boundary between mars/pluto and jupiter/saturn (99375-99452) is unclear; that tail repeats wording of other sections. Mars/saturn 98689-98690 sits before its anchor and may belong to the previous section.
- Damaged headings confirmed by body: moon/pluto (95313-95333), mercury/saturn (96339-96367), jupiter/uranus (99662-99673, Uranus content 99562-99620).
- Style shift: sections up to venus/pluto talk about the factor in each sign ("promovendo comunicação/relações"); from mars/jupiter on the text says what planet B "traz/adiciona" and the outcome is "ações"/"crescimento". The same outcome sentences recur across late sections (e.g. 98710, 99456, 100917, 101317 "ações diplomáticas ... carregadas de poder"), so late-pair distinctiveness is low.
- The anchor lines at the end of the family (101544 onward) belong to a different general passage; not used.

### Weak support (entries authored on thin/keyword-only/damaged-OCR evidence; key + reason)
- All entries rest on templated, heavily OCR-damaged two-column text. Weakest: sun/mars, sun/neptune, mercury/mars, mercury/uranus, venus/uranus, mars/saturn, jupiter/uranus, jupiter/neptune, saturn/uranus, saturn/pluto, uranus/neptune, uranus/pluto, neptune/pluto (few intact outcome clauses; wording shared with neighbouring sections).
- sun/moon identity/needs framing ("identidade", "necessidades emocionais") is the library's reading of the pair; the cited lines only state sign-trait harmony and comfort, expression, practicality.

---

## Natal planet-pair aspects: square family
Counts: authored 39 / expected 39 (plus 3 unresolved identities, none authored)

### Gaps (keys omitted, with reason and lines inspected)
- sun/mercury, sun/venus, mercury/venus: not in the book family (never authored, as instructed).
- mars/neptune: candidate block B:107577-107851 inspected (anchor 107577 is headed "MARTE EM QUADRATURA COM URANO"; its body before the heading, 107470-107573, is Mars/Uranus). The block after it names only Netuno ("Netuno em Câncer", "Netuno em Virgem", etc.) and "ação"/"idealização"; the words Marte and quadratura never appear in 107598-107878. Both planets are not named, so omitted. The body theme (ação vs idealização) is suggestive but identity is not assigned from that.
- jupiter/uranus: block B:108473-108790 inspected. Only Urano is named (108479, 108518, 108590...); Júpiter and quadratura never appear. Omitted.
- saturn/uranus: block B:109273-109581 inspected. Only Urano is named (109281-109575); no Saturno or quadratura. Line 109589 starts a Netuno block. Omitted.

### Inconsistencies and source disagreements (lines; what conflicts; what you chose)
- Heading placement: in many pairs the heading falls in the middle of or after the pair's body (two-column interleave), e.g. moon/mercury body precedes 103356; saturn/pluto and neptune/pluto bodies precede headings 110151 and 110796. Pairs were identified by the planet names in the sign paragraphs, and src ranges cover those body lines rather than only the 21-line anchor.
- Tone shift: Sun/Moon through Venus/Mars (about 101805-106016) frame each sign as a beneficial blend ("beneficia-se", "complementa"). From Venus/Jupiter (106162) onward the paragraphs say "o desafio de equilibrar...". I wrote contrast in the first group and challenge in the second, and avoided "benefício".
- No pair has a general opening. All entries are from the constant theme across sign paragraphs; the pair-specific planet functions (e.g. Saturno = estrutura/disciplina, Plutão = transformação) are only what the sign paragraphs recurrently say.
- Anchor 107577 (mars/uranus) is followed by Neptune body text, so the mars/uranus entry cites 107470-107573 (before the anchor).

### Weak support (entries authored on thin/keyword-only/damaged-OCR evidence; key + reason)
- moon/saturn: severe interleave/OCR damage; only fragments 104095-104135.
- mercury/neptune: mostly garbled; few legible fragments (105564-105570, 105648-105652).
- jupiter/saturn: split title and garbled body; fragments only (108122-108346).
- jupiter/neptune: damaged heading and garbled body (108988-109059).
- saturn/neptune: only the Áries paragraph is cleanly legible (109675-109693).
- neptune/pluto: body mostly garbled; heading followed by OCR noise.
- mars/pluto, venus/mars: damaged headings recovered from body (107879-107890; 105993-105997); bodies adequate.
- Sections were sampled via the sign-paragraph openers and legible runs, not every line of the ~9400-line family; entries cite the spans actually used.

---

## Natal aspect pairs: TRINE (book B)
Counts: authored 42 / expected 42 (sun/mercury, sun/venus, mercury/venus not authored by design: not present in the book family)

### Gaps (keys omitted, with reason and lines inspected)
- sun/mercury, sun/venus, mercury/venus: not in the trine family (maximum elongation); not authored. The book states this near B:83943-83952.
- No located pair omitted. Pair identity for Mars/Saturn (80893-80896), Mars/Neptune (81277-81280), Jupiter/Uranus (81835-81836) confirmed from surviving heading fragments plus body text; Jupiter/Neptune (82103-82117) has no heading and was confirmed from body sentences only (82107-82110, 82171-82173).

### Inconsistencies and source disagreements (lines; what conflicts; what you chose)
- Structure: the whole family has no general opening. Each pair is 12 sign paragraphs ("X em Signo, trígono com Y em Signo do mesmo elemento"), built on a single template. Entries use only the constant theme; sign colouring was dropped and logged per entry.
- Section bodies sit around the anchor: headings fall mid-page (e.g. Moon/Mercury heading 76619, body 76360-76637). Body spans were assigned by sentence continuity and by the next pair's first paragraph.
- Moon/Mars, Moon/Jupiter, Moon/Saturn Pisces paragraphs (76938-76944, 77120-77136, 77380-77393) and Moon/Uranus Pisces (77536-77542) copy the text of a different planet ("amor emocionalmente profundo", "Saturno"); not used.
- Mercury/Pluto Taurus (79357) names Plutão em Sagitário; Mars/Pluto Aries (81575) names Plutão em Áries or Sagitário (should be Leão); the sign lists in some Mars/Pluto and Neptune/Pluto paragraphs differ from the heading. Ignored; theme only.
- Venus/Neptune Taurus (80313-80326) frames sensuality and pleasure; excluded under the sexuality rule.
- Some Mercury, Venus, Mars and Jupiter paragraphs add sign domains (finance, technology, art, education, healing). Excluded as sign-specific colouring.

### Weak support (entries authored on thin/keyword-only/damaged-OCR evidence; key + reason)
- All 42 are built from a repeated template rather than a general opening; the pair meaning is a generic planet-function colouring (reported in reviewNotes of each entry).
- sun/pluto: Pluto paragraphs reuse Neptune/Uranus wording; only transformation/power/resilience is constant.
- moon/mercury, moon/pluto, mars/uranus, venus/neptune, saturn/neptune: severe two-column garbling; each rests on a few readable sign paragraphs.
- sun/mars, sun/saturn, sun/uranus, sun/neptune, moon/saturn, mercury/mars, mercury/saturn, mercury/neptune, venus/saturn, jupiter/uranus, jupiter/pluto: partially garbled, enough readable paragraphs to infer the theme.
- jupiter/neptune: no heading survives; identity from body text only.

---

## Quincunx planet-pair aspect entries (book B)
Counts: authored 42 / expected 42 (sun/mercury, sun/venus, mercury/venus not authored: not in the book family)

### Gaps (keys omitted, with reason and lines inspected)
- sun/mercury, sun/venus, mercury/venus: do not exist in this family (TSV `not_located_in_book_family`); not authored.
- No general opening exists for any quincunx pair in B (B:111197-122020): every section is only per-sign paragraphs ("Sol em X busca...; com Y em Z, ... pode desafiar..."). All 42 entries were built from the constant theme across the sign paragraphs, as the brief allows. Sign-specific colourings were excluded.

### Inconsistencies and source disagreements (lines; what conflicts; what you chose)
- TSV anchor mercury/pluto 116790 ('MERCÚRIO EM QUINCUNCIO', no planet) sits on a page whose body is Venus/Mars (116806-117058). The Mercury+Plutão body is at about 116250-116720 (identified by text); used that. Venus/Mars body lies before its anchor 117038 (116806-117033).
- Anchors for sun/jupiter (111682), mercury/mars etc.: section bodies often start before the anchor line or interleave with the neighbouring pair; pairs were assigned by the planet names in the body text.
- venus/jupiter: anchor 117475 is damaged ('EMQUINCU'); pair confirmed by body text 117275-117317.
- venus/pluto: damaged heading; confirmed by body 118276-118322 (matches the known recovery).
- jupiter/pluto: anchor 120659 damaged ('JÚPITER EM QUINCUNCIO CO'); Jupiter+Plutão body at 120402-120720.
- Source frames the aspect as Sign-pair friction ("pode desafiar... exigindo um equilíbrio") rather than defining the quincunx; entries therefore state tension/adjustment only, no mention of 150 degrees or orb.

### Weak support (entries authored on thin/keyword-only/damaged-OCR evidence; key + reason)
- sun/mars, sun/uranus, sun/neptune: heading and large parts heavily OCR-damaged and interleaved.
- mercury/mars, mercury/pluto: first half fragmentary; few legible lines.
- mars/jupiter, mars/pluto: only a few legible passages (118690-118701 Escorpião block; 119694-119821).
- venus/jupiter: much damaged; legible only 117275-117317, 117420-117455.
- jupiter/pluto, jupiter/uranus, uranus/neptune, uranus/pluto, saturn/uranus (early part): damaged and interleaved columns.
- neptune/pluto: columns merged and nearly unreadable at 121743-122011; very thin.

---

## aspects-opposition
Counts: authored 42 / expected 42 (sun/mercury, sun/venus, mercury/venus not in this family; not authored)
### Gaps (keys omitted, with reason and lines inspected)
- None omitted among the 42 located pairs. Pairs absent from the book family: sun/mercury, sun/venus, mercury/venus (inventory status not_located_in_book_family).
### Inconsistencies and source disagreements (lines; what conflicts; what you chose)
- Every pair section has NO general opening: only sign-axis paragraphs (Aries/Libra, Taurus/Scorpio, Gemini/Sagittarius, Cancer/Capricorn, Leo/Aquarius, Virgo/Pisces). Entries use the constant theme (the opposite-sign planet brings a balancing quality to the first planet) and are phrased as tension between two poles per house decision.
- Uranus/Pluto Libra and Virgo paragraphs (B:91976-92030) sit inside the Uranus/Neptune range before the Uranus/Pluto heading (92034) due to interleaving; assigned to Uranus/Pluto by content ("Plutão em Áries/Peixes, Urano em ...").
- Mars/Uranus anchor (89489) lies mid-text; heading recovered at 89487-89494 as instructed. Mercury/Mars heading likewise (86690-86695).
- Uranus/Neptune and Neptune/Pluto sections contain only the Aquarius/Leo and Pisces/Virgo axes (plus Libra/Aries fragments), unlike other pairs; the sections end with sextile introductory text (~92374).
- Sun/Uranus lacks an Aries paragraph.
### Weak support (entries authored on thin/keyword-only/damaged-OCR evidence; key + reason)
- sun/mars: Damaged OCR in much of the section (84157-84200)
- sun/jupiter: Several paragraphs damaged (84397-84418)
- sun/saturn: Rest of section heavily damaged OCR (84582-84636); entry rests on two clean paragraphs
- sun/uranus: Aries axis missing/damaged; Capricorn and Aquarius paragraphs not used
- sun/pluto: Interleaved columns at section start
- moon/mercury: Heavily interleaved/damaged OCR (85266-85329)
- moon/mars: Section heavily damaged (85751-85845); thin evidence
- moon/saturn: Partly damaged OCR (86074-86105)
- moon/neptune: Interleaved columns (86365-86433)
- moon/pluto: Section opening (86535-86544) partly damaged
- mercury/mars: Heading and most paragraphs damaged; thin evidence
- mercury/saturn: Interleaved columns
- mercury/uranus: Interleaved columns
- mercury/neptune: Heavily damaged OCR, thin evidence
- venus/mars: First lines interleaved (87827-87834)
- venus/saturn: Only Aries and Taurus clean; rest damaged (88218-88241)
- venus/uranus: Interleaved columns
- venus/neptune: Damaged OCR; thin evidence
- venus/pluto: Heading and body heavily damaged OCR; thin evidence
- mars/jupiter: Only Aries and Taurus clean; rest damaged
- mars/saturn: Damaged OCR; thin evidence
- mars/uranus: Heading damaged; rest of section damaged
- mars/neptune: Interleaved columns
- mars/pluto: Only Aries and Taurus clean; rest damaged
- jupiter/uranus: Heavily damaged OCR; thin evidence
- jupiter/neptune: Interleaved columns
- saturn/uranus: Interleaved columns
- saturn/neptune: Section start and Aries/Taurus damaged; thin evidence
- saturn/pluto: Interleaved columns
- uranus/neptune: Generational pair; only two axes clean
- uranus/pluto: Libra paragraph at 92011-92030 lies before the anchor, assigned by content
- neptune/pluto: Generational pair; opening damaged

---

## Second read: Second-reader review of new astrology descriptions

### dc-signs (angleSigns.dc) — 12 entries checked

Verified against the rendered PDF page 503 plus the cited aula-9 / houses.md lines. No A/B/C findings.

### vertex (points.vertex/antivertex, pointHouses.vertex, vertexPlanetContacts) — 17 entries checked

No A/B/C findings. (pointHouses.vertex.9 faithfully follows aula-18 991-995, whose wording itself reads like 3rd-house themes; left as is.)

### cusps-1-6 (houseCuspSigns 1-6) — 67 entries checked

No A/B/C findings. All house-1 entries match their aula-6 ascendant paragraphs; houses 2-6 stay inside the right houses.md cell (health items such as inflammation, throat, nerves, heart, kidneys, bones correctly left out); aula-9 extras (3.Libra, 4.Taurus/Gemini/Virgo/Libra, 5.Gemini/Virgo, 6.Gemini) are on the right sign and house. (Padded keyword lists, e.g. 6.Aries "energia no trabalho | energia", are noted once in the closing section rather than per entry.)

### cusps-7-12 (houseCuspSigns 7-12) — 72 entries checked

No A/B/C findings. houses.md cells match sign and house; aula-9 extras (7.Taurus/Gemini/Virgo/Libra, 8.Taurus/Gemini/Virgo/Libra, 9.Taurus/Gemini/Virgo/Libra, 10.Taurus/Gemini/Virgo/Libra, 11.Taurus/Gemini/Virgo/Libra, 12.Taurus/Gemini/Virgo/Libra) are read from the right sign sentence despite the run-on transcript. Gendered/health/sexual items in the sources (mother figures, "filosofia matriarcal", "karma materno", "autodestruição", marriage gains, sex as manipulation) were correctly left out. 8.Gemini softens the source's "curious about sexual desire" to "hidden and intimate matters of this house"; acceptable.

### retro-mercury (retrogradePlanetSigns/Houses.mercury) — 24 entries checked

All 24 match aula-16 on the right sign/house; past-life framing correctly removed.

- retrogradePlanetHouses.mercury.3 — C — closing clause unhedged ("ainda assim é um dos pensadores mais analíticos").

### retro-venus (retrogradePlanetSigns/Houses.venus) — 24 entries checked

All 24 on the right sign/house of aula-16; past-life, "sexo oposto" and marriage/divorce wording correctly softened or dropped.

- retrogradePlanetSigns.venus.Sagittarius — C — EN adds "the personal intimacy Venus promises", not in PT.
- retrogradePlanetSigns.venus.Capricorn — C — EN "responsibilities of old age in youth / freedom of adolescence in old age" fuller than PT.

### retro-mars (retrogradePlanetSigns/Houses.mars) — 24 entries checked

No A/B/C findings. All on the right aula-16 heading; sexual, gendered (women/men, Electra, male child), marriage and past-life material correctly dropped.

### retro-jupiter (retrogradePlanetSigns/Houses.jupiter) — 24 entries checked

No A/B/C findings. All on the right aula-16 heading; marriage, sexual, mediumship and past-life material correctly dropped.

### retro-saturn (retrogradePlanetSigns/Houses.saturn) — 24 entries checked

All on the right aula-16 heading; Oedipal, sexual-abuse, marriage-to-older-person and past-life material correctly dropped.

- retrogradePlanetHouses.saturn.6 — C — "do que no comando" added beyond source; EN adds "others cannot handle" absent from PT.

### retro-uranus (retrogradePlanetSigns/Houses.uranus) — 21 entries checked

No A/B/C findings. All on the right aula-16 heading; marriage, sexual, abortion, homosexuality and past-life material correctly dropped.

### retro-neptune (retrogradePlanetSigns/Houses.neptune) — 17 entries checked

All on the right aula-16 heading; healing professions, mediumship, sexual and marriage material correctly dropped.

- retrogradePlanetSigns.neptune.Scorpio — C — support for the last clause sits at lines 4549-4550, outside the cited 4541-4548; extend the range.

### retro-pluto (retrogradePlanetSigns/Houses.pluto) — 17 entries checked

All on the right aula-16 heading; illness, drugs, sexual nature, child/parent material correctly dropped.

- retrogradePlanetSigns.pluto.Cancer — C — two claims are supported only at lines 4908-4917, beyond the cited 4887-4898; extend the range.

### aspects-conjunction — 45 entries checked

- aspectPairs.conjunction.moon/saturn — B — closing 'balance impulsiveness and patience' is Aries-only (70193>70167>70140>70029) presented as general.
- aspectPairs.conjunction.moon/mars — B — 'stability and strong bonds in relationships' holds only for Taurus/Capricorn/Cancer; 'initiative' not in source.
- aspectPairs.conjunction.mercury/mars — B — 'determination and speed' (Aries) and 'connections that stimulate and challenge' (Gemini) generalised from single signs.
- aspectPairs.conjunction.mars/jupiter — B — 'energy amplified' is Aries-only (72721).
- aspectPairs.conjunction.jupiter/saturn — B — 'optimism with careful planning for lasting goals' is the Taurus paragraph verbatim.
- aspectPairs.conjunction.moon/venus — C — 'intimacy' only in Cancer paragraph.
- aspectPairs.conjunction.moon/mercury — C — 'thought and feeling blend' is an inference, not in source.
- aspectPairs.conjunction.uranus/neptune — C — 'each area of life' though paragraphs are per sign.
- aspectPairs.conjunction.uranus/pluto — C — 'each area of life' though paragraphs are per sign.

Patterns: no wrong cells; all cited ranges sit inside the correct conjunction section (heading lines verified, including garbled Venus/Jupiter ~71958, Mars/Uranus 72956, Jupiter/Uranus 73562). Main recurring issue is one sign's (usually Aries' or Taurus') wording lifted into the general sentence. Sun/Neptune cites a heavily garbled block (69163-69184) but the claims are supported by legible Taurus/Aries/Pisces lines in the same section.

### aspects-opposition — 42 entries checked

- aspectPairs.opposition.sun/mars — A — both sentences come only from the Aries paragraph; the Libra paragraph says the reverse (be more direct and confident).
- aspectPairs.opposition.mercury/mars — A — "less confrontational, more cooperative" is Aries-only, and Libra (86664-86683) says the opposite; cited lines are mostly unreadable OCR.
- aspectPairs.opposition.venus/jupiter — B — every claim is from the Aries paragraph; the cited Taurus/Sagittarius material is unused.
- aspectPairs.opposition.mars/pluto — B — "more strategic and considered" is Aries-only; the Libra fragment points toward more proactivity.
- aspectPairs.opposition.jupiter/uranus — B — the lesson ("more cooperative, temper impulsiveness") is Aries-only; Libra balances harmony with decisive expression.
- aspectPairs.opposition.saturn/pluto — B — second sentence is all Aries; the recurring theme (Taurus, Cancer, Pisces) is integrating deep change into structures and rebuilding obsolete ones.
- aspectPairs.opposition.moon/mars — C — PT "direção" does not match EN "directness" or the source "mais direta"; the legible paragraphs before the OCR heading (85632-85745) are not cited.
- aspectPairs.opposition.sun/pluto — C — stray comma and repeated "mudanças" in PT second sentence.

Pattern: the book's Aries paragraph ("X in Libra brings balance/diplomacy, temper impulsiveness") is the most legible one in each cell, and several entries generalise it even though the Libra paragraph runs the opposite way (be more direct). Several sections (moon/mars, saturn/neptune, uranus/neptune, uranus/pluto) begin before their OCR heading; the cited lines there were checked and belong to the right pair.

### aspects-square — 39 entries checked

- aspectPairs.square.moon/uranus — B — the second sentence fuses two sign paragraphs into a causal claim the source does not make (the new perspectives come from sensitivity and intuition, not from unconventional emotion).
- aspectPairs.square.moon/neptune — B — the second sentence comes only from the Aries paragraph but is presented as general.
- aspectPairs.square.mercury/neptune — B — "comunicação mais compreensiva tende a se beneficiar de aplicação prática" is a stitched claim; the cited range starts mid-paragraph (should start at 105557).
- aspectPairs.square.venus/mars — B — both specifics are single-sign (Aries, Scorpio); the shared theme is Mars bringing a new dynamic to relationships.
- aspectPairs.square.mars/uranus — B — the "authenticity calls for strategic action" link joins Taurus and Aries/Capricorn details into a causal claim the source does not make.
- aspectPairs.square.saturn/neptune — B — the entry rests on the Aries paragraph alone and merges the Cancer and Capricorn halves into one general claim; the shared theme is idealization balanced by realism.
- aspectPairs.square.saturn/pluto — B — Capricorn and Aquarius details are presented as the general integrating theme, and "inovação" stands where most paragraphs have deep, intense transformation.
- aspectPairs.square.uranus/neptune — B — the second sentence comes only from the Aries paragraph but is presented as general.
- aspectPairs.square.uranus/pluto — B — the second sentence comes only from the Aries paragraph but is presented as general.

Pattern: no wrong cells were found. Section headings often fall in the middle of their sections (the OCR puts a page's text before and after its heading), but every cited range belongs to the right pair and aspect. The recurring issue is the second sentence: it lifts the Aries paragraph, or stitches two sign paragraphs into a causal claim, and presents it as the common theme. The "contraste" framing is a mild overlay, since the book mostly calls these squares "equilíbrio" or "desafio".

### aspects-trine — 42 entries checked

- aspectPairs.trine.sun/uranus — B — 'expressão autêntica'/'autenticidade' comes only from Sagitário but is presented as general; shared points are innovation, novelty and freedom.
- aspectPairs.trine.moon/jupiter — B — 'generosa' (Escorpião only) and 'busca emocional por significado' (Sagitário/Leão) are presented as general; the shared point is an optimistic, confident approach.
- aspectPairs.trine.moon/saturn — B — 'paciente' (Touro only) and 'comprometida' (Câncer only) are presented as general; the shared point is a responsible, structured handling of emotions.
- aspectPairs.trine.venus/neptune — B — 'romantismo' comes only from Áries; the recurring points are sensitivity, passion and partnerships that inspire or bring emotional connection.
- aspectPairs.trine.venus/pluto — B — 'crescimento pessoal' comes only from Capricórnio; the recurring points are passion, intensity and deep, lasting connections.
- aspectPairs.trine.mars/jupiter — B — 'iniciativa' is not in the source, 'persistência' comes only from Touro and 'otimismo' only from Sagitário.
- aspectPairs.trine.jupiter/neptune — B — 'otimismo e expansão' comes only from Sagitário and 'metas inspiradas' is not in the source.
- aspectPairs.trine.uranus/pluto — B — 'exploração profunda de si e do mundo' is not in the cited paragraphs.
- aspectPairs.trine.sun/moon — C — 'eu consciente e emoções' is quoted from the Áries paragraph only (acceptable framing).
- aspectPairs.trine.saturn/neptune — C — the citation 82864-82872 holds only OCR fragments.

Pattern: no wrong cells found. Every cited range sits inside the right pair's trine section, including where the book's sign headers misname the partner (Uranus/Neptune, Uranus/Pluto) and where section banners fall after their paragraphs. The recurring weakness is a second-sentence trait lifted from a single sign paragraph and presented as general.

### aspects-sextile — 43 entries checked

- aspectPairs.sextile.jupiter/pluto — A — 'expansão nas relações e na compreensão' comes from 100309-100311, the Libra paragraph of Saturn/Uranus (it names Urano).
- aspectPairs.sextile.saturn/uranus — A — 'ações práticas e metódicas enriquecidas por insights' is the Virgo paragraph of Saturn/Neptune (100685-100700).
- aspectPairs.sextile.uranus/pluto — A — the second sentence comes from the Virgo/Libra paragraphs just before the Neptune/Pluto header (101352-101384), the same lines the Neptune/Pluto entry uses.
- aspectPairs.sextile.moon/pluto — B — the source aligns emotions with 'ideais elevados', not 'renovação'; the range misses the section start (95110-95312).
- aspectPairs.sextile.mars/saturn — B — the Mars/Saturn paragraphs are at 98403-98711; the cited 98712-98800 is Mars/Uranus Virgo/Libra text.
- aspectPairs.sextile.mars/pluto — B — keyword 'propósito' comes only from a Jupiter/Saturn line (99415); the Libra support (99146-99167) falls before the range.
- aspectPairs.sextile.saturn/neptune — B — 'valores profundos' drops the source's 'valores profundamente familiares'.
- aspectPairs.sextile.sun/moon — C — 'identidade / necessidades emocionais' is a general-astrology gloss; the book only speaks of harmony between the signs.
- aspectPairs.sextile.sun/jupiter — C — 'relações justas' (Libra, 92994-93006) is before the cited range.
- aspectPairs.sextile.moon/saturn — C — the range starts with the Pisces Moon/Jupiter tail (94600-94611).
- aspectPairs.sextile.mercury/pluto — C — 'analítico' (Virgo, 96898-96918) is before the cited range.
- aspectPairs.sextile.mars/jupiter — C — the range runs on through the Mars/Saturn paragraphs (98403-98707).
- aspectPairs.sextile.jupiter/neptune — C — the Virgo support (99823-99839) is before the cited range.
- aspectPairs.sextile.neptune/pluto — C — the Virgo/Libra support (101329-101384) is before the cited range.

Pattern: each section's Virgo/Libra paragraphs are printed just before its header (next to the degree diagram), so a range that starts at the header misses them, and a range that ends just before the next header takes in the next pair's Virgo/Libra. All three A findings come from this. From Mars on, the book reuses near-identical template sentences across pairs, so a matching phrase must be checked against the planet named in its paragraph.

Not fully checked: sun/mars, mercury/mars and mercury/uranus have badly garbled OCR. Their key phrases were found inside the correct section, but which sign each one belongs to could not always be untangled (e.g. sun/mars 'criativas e ações decididas', 92843).

### aspects-quincunx — 42 entries checked
- aspectPairs.quincunx.sun/jupiter — B — "ou se dispersar" is unsupported, and "flexibility so as not to restrict freedom" inverts the source (growth limits freedom and tests flexibility).
- aspectPairs.quincunx.sun/uranus — B — "sem perder a si mesmo" is an imported gloss; the source asks for flexibility and adaptation to new ideas and ways of life.
- aspectPairs.quincunx.moon/saturn — B — "levar questões emocionais com mais seriedade" misreads the source (seriousness about control/power and responsibility, not emotional matters).
- aspectPairs.quincunx.moon/pluto — B — "enfrente ... em vez de resistir" is imported advice; the section's common demand is flexibility, adaptations and deep revisions.
- aspectPairs.quincunx.mercury/mars — B — the second sentence comes from the Gemini paragraph only and changes "disciplina" to "foco".
- aspectPairs.quincunx.mercury/jupiter — B — "entusiasmo" and "excessiva" are not in the source.
- aspectPairs.quincunx.mercury/pluto — B — "mais foco e menos superficialidade" is from the Gemini paragraph only but is presented as general.
- aspectPairs.quincunx.mars/jupiter — B — "equilíbrio entre ação e visão ampla" has no support in the section.
- aspectPairs.quincunx.sun/mars — C — "ter a impulsão de agir" is awkward; use "impulso".
- aspectPairs.quincunx.sun/pluto — C — "em vez de continuar do mesmo jeito" is an unsupported gloss.
- aspectPairs.quincunx.moon/mars — C — "rígido demais" is not in the source.
- aspectPairs.quincunx.saturn/pluto — C — "do que sustenta você" is a loose gloss of the reassessment of relationships and foundations.

Pattern: every cell is right. Section headings often sit after the opening paragraphs in the OCR, but each cited paragraph names the correct second planet. The errors are in the second sentences, where advice is imported or one sign paragraph's resolution is generalized. The Mercury/Mars and Mercury/Jupiter Gemini paragraphs share near-identical template text in the book.

### Closing notes

Systematic patterns (non-aspect sets):
- The non-aspect sets are clean on support and cell placement: no wrong-sign/wrong-house/wrong-planet errors were found in dc-signs, vertex, cusps or any retro packet. Run-on aula-9 sentences that switch sign mid-line (e.g. "Gêmeos na casa 7 ... Virgem é mais cautelosa") were split correctly.
- Sensitive source material (illness, sexual and gendered statements, marriage/divorce, past-life biography, abortion, homosexuality, drugs) was consistently left out or softened, matching the house rules.
- Retro entries (aula-16) run long: typically two sentences but 40-70 words each, often three or four clauses. They stay hedged, but they are longer than "about two short sentences". Not flagged per entry.
- Several cited ranges stop mid-paragraph, before the line that supports the last clause (retro neptune.Scorpio, pluto.Cancer). Worth a mechanical check across the file: extend each range to the end of the supporting sentence.
- House-cusp keyword lists are often padded with a third keyword that just repeats the first (e.g. "energia no trabalho | energia", "parcerias livres | liberdade | parcerias"). The padding is supported but adds nothing. Not flagged per entry.

Could not verify / caveats:
- dc-signs were checked against the rendered PDF page 503 (legible), not the OCR.
- pointHouses.vertex.9 follows aula-18 faithfully, but that course text itself reads like 3rd-house material (siblings, neighbours). It is a source quirk, not an authoring error.

Systematic patterns (aspectPairs, from the six aspect sub-readers):
- Wrong cells are rare. The only three found are all sextile entries (jupiter/pluto, saturn/uranus, uranus/pluto). They come from a layout quirk: in the OCR, each sextile section's Virgo/Libra paragraphs are printed before its heading, so a range that ends at the next heading picks up the following pair's text.
- The dominant fault, in every aspect: the second ("lesson") sentence turns one sign paragraph, usually Aries or Taurus, into the general theme. In oppositions this sometimes inverts the book, because the Libra paragraph says the opposite of the Aries one (sun/mars and mercury/mars are graded A for this).
- A few entries add advice or adjectives that are not in the book (e.g. "iniciativa", "metas inspiradas", "enfrentá-las em vez de resistir").
- Several cited ranges point at OCR fragments or at a neighbouring section even when the claim itself is supported. The corrections fix these ranges.

Not fully checked: sextile sun/mars, mercury/mars and mercury/uranus. The OCR is too garbled to tell which sign each phrase belongs to, though the key phrases do sit inside the right pair's section. Some other heavily garbled sections (square moon/saturn, jupiter/saturn, jupiter/neptune, mars/uranus; trine mars/jupiter, venus/neptune, saturn/neptune, mars/uranus; quincunx mercury/mars, mars/jupiter) were judged on their readable fragments only.

---

## Aspect pairs rewritten from the printed pages (2026-11-17)

- `conjunction` `moon/uranus` (page 529): the 'security versus novelty' balance appears only in Taurus and Cancer, not as a common theme; the recurring frame is emotional freedom and facing emotional challenges with originality.
- `conjunction` `mars/neptune` (page 548): 'manifest dreams' and 'subtle expression of desires' come from only a few signs; the recurring frame is Mars energy channelled into spiritual inspiration, compassion and altruistic aims.
- `sextile` `sun/moon` (page 651): Comfort, personal expression and practicality each come from one or two signs only; the common theme is harmonizing the Sun sign with the Moon sign.
- `sextile` `sun/mars` (page 652): Communication and expression are named in only a few signs; the page recurs on combining the Sun sign with the Mars sign for balanced, decided action.
- `sextile` `sun/jupiter` (page 653): Prosperity, emotional well-being and just relationships come from isolated signs; the recurring theme is growth and expansion.
- `sextile` `sun/saturn` (page 654): 'Vital energy' and 'precision' are not recurring on the page; the common theme is joining the Sun sign with Saturn's responsibility, structure and discipline.
- `sextile` `sun/uranus` (page 655): 'Subtle yet significant changes' appears in one sign only; the common theme is innovation, originality and new ideas.
- `sextile` `sun/neptune` (page 656): 'Personal and collective projects' and 'deeper relationships' are single-sign points; the common theme is an intuitive, inspired approach and emotional connection.
- `sextile` `sun/pluto` (page 657): Courage for new challenges and self-knowledge come from single signs; the page recurs on transformation.
- `sextile` `moon/venus` (page 659): Stimulating relations, comfort and security, loyalty and freedom are each from one or two signs; the common theme is affectionate relationships and affective expression.
- `sextile` `moon/mars` (page 660): Speed, assertiveness, and guidance by intuition are single-sign points; the common theme is actions in harmony with emotions and emotional needs.
- `sextile` `moon/neptune` (page 664): 'Elegant expression aligned with elevated ideals' are single-sign points; the common theme is empathy, intuition and emotional expression enriched by inspiration.
- `sextile` `moon/pluto` (page 665): Communication changes, lasting security and elevated ideals are single-sign points; the recurring theme is deep emotional transformation.
- `sextile` `mercury/mars` (page 667): Speed and 'varied information' are single-sign points; the recurring frame is communication and action together, careful and effective.
- `sextile` `mercury/jupiter` (page 668): Pragmatic thinking and emotional security are single-sign points; the recurring theme is communication and ideas expanded toward knowledge and progress.
- `sextile` `venus/mars` (page 673): 'Direct and innovative' affection is from Aries only; the recurring theme is relationships combining passion and sensuality with stability, care and emotional depth.
- `sextile` `mars/pluto` (page 683): Diplomatic or communicative actions and compassion are single-sign points; the recurring theme is action carried by transformation and regeneration.
- `sextile` `jupiter/neptune` (page 686): 'Bold actions' and 'detailed practical growth' are single-sign points; the recurring theme is growth and expansion fed by inspiration, idealism and intuition.
- `sextile` `jupiter/pluto` (page 687): Family and emotional growth are single-sign points; the recurring theme is expansion and growth deepened by transformation.
- `sextile` `saturn/neptune` (page 689): 'Nobility' and 'family values' are single-sign points; the recurring theme is giving structure to inspiration, intuition and spiritual sensitivity.
- `sextile` `saturn/pluto` (page 690): Diplomatic or communicative actions and renewal drive are copied from other pages' single signs; the recurring theme is discipline and focus joined with deep transformation.
- `sextile` `uranus/neptune` (page 691): 'Bold, original actions' and 'panoramic view' are Aries only; the recurring theme is innovation joined with inspiration, intuition and spiritual or emotional sensitivity.
- `sextile` `uranus/pluto` (page 692): Well-planned ambitious action and justice are single-sign points; the recurring theme is innovation joined with deep transformation and structural reform.
- `sextile` `neptune/pluto` (page 693): 'Inspired and intelligent communication' is Gemini only; the recurring theme is spiritual and intuitive sensitivity joined with deep transformation.
- `square` `moon/mars` (page 706): paixão, disciplina and persistência come from Áries/Capricórnio only; pages state an emotion-versus-action balance
- `square` `moon/jupiter` (page 707): the structured approach tempering impulsive actions is Áries only; pages state an emotion-versus-expansion balance
- `square` `moon/saturn` (page 708): counterpoint to impulsivity and emotional maturing are Áries only; pages state an emotion-versus-structure balance
- `square` `moon/uranus` (page 709): impulsive reactions and unconventional exploration are single-sign details; pages state an emotion-versus-innovation balance bringing new perspectives
- `square` `moon/pluto` (page 711): resilience and overcoming obstacles are Áries/Capricórnio only; pages state emotion balanced with transformation, depth and renewal
- `square` `mercury/mars` (page 712): the contrast framing and structured, focused assertiveness are Áries/Capricórnio only; pages combine communication with action
- `square` `venus/jupiter` (page 719): a passionate nature is Áries/Leão/Escorpião only; pages state a challenge of balancing love with expansion
- `square` `venus/saturn` (page 720): tempering spontaneity is Áries only; pages combine love with responsibility, commitment and depth
- `square` `venus/uranus` (page 721): emotional security versus independence is Áries/Câncer only; pages combine love with innovation and less conventional relating
- `square` `venus/neptune` (page 722): passion versus lasting commitment is Áries only; pages state love balanced with idealization and fantasy versus reality
- `square` `venus/pluto` (page 723): independence versus commitment is Áries/Aquário only; pages state love balanced with transformation, intensity and depth
- `square` `mars/jupiter` (page 724): impulsivity softened by planning is Áries/Sagitário only; pages state a challenge of balancing action with expansion
- `square` `mars/saturn` (page 725): persistence channelling energy is Áries/Capricórnio only; pages balance action with structure, caution and responsibility
- `square` `jupiter/pluto` (page 732): bold, independent expansion and structure/ambition are Áries/Capricórnio only; pages balance expansion with transformation
- `square` `saturn/uranus` (page 733): breaking traditional patterns is Áries/Capricórnio only; pages balance structure and responsibility with innovation
- `trine` `sun/mars` (page 564): 'motivation' and 'focus on results' come from one or two signs only; recurring words are energy, passion, self-confidence, determination, courage
- `trine` `sun/saturn` (page 566): 'long-term goals' appears in one sign only (Leão); the page repeats discipline, determination, stability, methodical and strategic approach, concrete achievements
- `trine` `sun/uranus` (page 567): 'freedom' comes from Áries and Leão only; the page repeats originality, innovation, progressive thinking and goals
- `trine` `moon/uranus` (page 575): 'freedom' and 'adaptable/future' come from one sign each; the page repeats original, innovative, progressive emotional approach and openness to change
- `trine` `mercury/mars` (page 578): 'direct' and 'confident' come from Áries/Leão only; recurring on the page are communication with action energy, strategic and goal-oriented
- `trine` `mercury/jupiter` (page 579): 'openness to learning' is from Áries only and 'optimism' from a few signs; recurring are expansive communication, broad view and ideas
- `trine` `venus/mars` (page 584): 'harmony' is not a recurring theme and 'confident' is from Áries/Leão only; the page repeats passion, commitment, loyalty and a stable or intense approach to love
- `trine` `venus/jupiter` (page 585): 'warm, expansive, sociable' and 'optimism' are from a few signs only and are contradicted by the practical, committed and emotionally deep signs; the recurring words are enthusiasm, generosity, commitment and a balanced approach to love
- `trine` `venus/uranus` (page 587): 'independence' and 'freedom' come from Áries/Sagitário only; the recurring theme is original, innovative partnerships and a progressive approach to love
- `trine` `venus/pluto` (page 589): 'lasting connections' is from Touro only; the page repeats intense, deep connections and partnerships that bring transformation, growth and emotional healing
- `trine` `mars/jupiter` (page 590): 'broad vision' (Leão) and 'expand horizons' (Áries) are single-sign claims; the page repeats energy and enthusiasm in actions, efficient pursuit of objectives and involvement in meaningful undertakings
- `trine` `mars/neptune` (page 593): 'dreams and ideals' come from one or two signs only; the page repeats imagination, inspiration, sensitivity and creative or artistic action
- `trine` `mars/pluto` (page 594): 'overcome obstacles' and 'courage' come from Áries only; the page repeats intense energy, determination, depth and the capacity to transform
- `trine` `jupiter/saturn` (page 595): 'prudence' is from Touro only; the page repeats discipline, determination, sense of duty, stability and significant achievements
- `trine` `jupiter/pluto` (page 598): 'inner strength' (Áries), 'persistence' (Touro) and 'impact' (Escorpião) are single-sign claims; the page repeats ambition, determination and the power of transformation toward significant change
- `trine` `saturn/uranus` (page 599): 'sense of justice' appears in two signs only; the page repeats practical, efficient innovation and solid structures that carry constructive change
- `trine` `uranus/pluto` (page 603): 'constant evolution' is from Touro only and 'intensity' is not a recurring word; the page repeats personal and social transformation and significant change
- `quincunx` `sun/moon` (page 741): current claim of 'change and stability' and 'emotional security' comes from only a few signs; the page's recurring frame is the Sun sign's seeking being challenged by the Moon sign's needs and qualities, calling for balance or integration
- `quincunx` `sun/mars` (page 742): 'indecisão ou preocupações' appears in only a few signs; the page's recurring frame is Mars's drive and approach challenging (or sometimes intensifying) what the Sun sign seeks, calling for balance and adaptation
- `quincunx` `moon/mercury` (page 748): 'introspecção' appears for one sign only; the page's recurring frame is Mercury's way of thinking and communicating (critical, evasive, scattered, emotional, impersonal) challenging the Moon sign's needs
- `quincunx` `mercury/jupiter` (page 757): 'ideias desordenadas, intensidade ou drama' and 'detalhe e visão ampla' each come from one or two signs; the page's recurring frame is Mercury's way of communicating (direct, practical, deep, intellectual, intuitive) meeting Jupiter's impulse, idealism or desire for security, with both challenge and enrichment
- `quincunx` `jupiter/saturn` (page 773): 'ambição e humildade' and 'exploração e cuidado' come from a few signs only; the page's recurring frame is Saturn's limits, demands and structure restricting Jupiter's expansion
- `quincunx` `jupiter/uranus` (page 774): 'equilibrando planejamento e espontaneidade' comes from Virgo and Aries only; the page's recurring frame is sudden changes, disruption and innovation challenging how Jupiter's growth is pursued, sometimes amplifying it and sometimes destabilizing it
- `quincunx` `jupiter/neptune` (page 775): 'pode trazer profundidade' and 'promessas maiores do que a realidade' come from one or two signs; the page's recurring frame is illusion, confusion and idealization clouding or challenging how the Jupiter sign seeks growth, calling for a balance between real and ideal
- `opposition` `sun/moon` (page 607): current text is built on the Aries and Capricorn/Cancer paragraphs only (impulse, emotional security); the page's common theme is the Moon's opposite-sign quality balancing the Sun's sign
- `opposition` `sun/jupiter` (page 609): current text is drawn from the Aries paragraph (impulse, justice, diplomacy); the page's common theme is Jupiter's opposite-sign quality expanding the Sun's actions
- `opposition` `sun/saturn` (page 610): current text mixes Aries-only themes (autonomy, justice, partnership) and misses the recurring framing of Saturn's opposite sign bringing structure and depth to the Sun's actions
- `opposition` `venus/mars` (page 628): current text rests on the Aries paragraph (independence vs partnership); the page's common theme is Mars's opposite-sign quality shaping how Venus loves
- `opposition` `mars/jupiter` (page 634): current text rests on the Aries paragraph (impulse, diplomacy); the page's common theme is Jupiter's opposite-sign quality expanding Mars's actions
- `opposition` `mars/saturn` (page 635): current text rests on the Aries paragraph (impulsiveness vs responsibility); the page's common theme is Saturn's opposite-sign quality bringing structure, depth and direction to Mars's actions
- `opposition` `mercury/saturn` (page 624): current text rests on the Aries paragraph (reflect before speaking); the page's common theme is Saturn's opposite-sign quality bringing structure, objectivity and depth to Mercury's communication
- `opposition` `mars/neptune` (page 637): current text rests on the Aries paragraph (direct action vs harmony and diplomacy); the page's common theme is Neptune's opposite-sign quality reshaping Mars's actions
- `opposition` `jupiter/saturn` (page 639): current text (expansion vs limit, optimism, responsibility) is not on the page; the page shows Saturn's opposite-sign quality bringing depth, structure and clarity to Jupiter's aspirations
- `opposition` `jupiter/uranus` (page 640): second sentence (independent action vs harmony and cooperation) comes from the Aries paragraph only; the page's common theme is Uranus's opposite-sign quality bringing innovation to Jupiter's expansion
- `opposition` `jupiter/neptune` (page 641): second sentence (optimism with consideration for others) comes from the Aries paragraph only; the page's recurring theme is spiritual, mystical and visionary expansion
- `opposition` `saturn/uranus` (page 643): closing clause (individual action and harmony) comes from the Aries/Libra paragraphs only; the page's common theme is Uranus's opposite-sign quality making Saturn's structures more innovative and less rigid
- `opposition` `saturn/neptune` (page 644): current text rests on Cancer/Capricorn wording (welcoming); the page's recurring theme is spiritual depth and sensitivity softening Saturn's structures
- `opposition` `uranus/pluto` (page 647): current text (fairness, equity, power dynamics) comes from the Aries and Libra paragraphs only; the page's recurring theme is innovative, transformative change in areas such as resources, education, family and service

---

# Batch 5 (2026-11-17)

Mat ruled: classes take priority over the book and the keyword sheet; class-versus-class conflicts go to him; house 6 may speak of health; the retrograde, Vertex-house and aspect-pair gaps are accepted. Vertex by sign and Lilith by house are lookup aliases through the natural house/sign, not authored text (the Lilith alias is an extension of the Vertex ruling and was not stated by Mat for Lilith). Lilith aspects have no source and were not authored. A second page-image read covered 25 aspect entries: 14 kept, 11 rewritten; the Mercury/Jupiter quincunx page is mostly the Mercury/Mars page with the planet name swapped, so that entry rests on the few Jupiter-specific phrases.

### Class versus class (owner to decide)
- A18 849-851 and 856-858 (Vertex axis "nem sempre trata de relacionamentos", also jobs, projects, revelations) vs A18 997-1020 (Vertex encounters are relationships, "sempre" meet impediments, "sempre ocorrerá algo do destino para separá-los", the relationship does not work after a divorce). Not resolved; points.vertex follows the first, the second was left out as deterministic.
- A18 908-911 (a Vertex contact "pode dar em nada" unless one is ready; may resonate for years) vs A18 997-1020 (always impeded, always separated).
- A13 1489 calls the Vertex "Ponto do Amor" vs A18 849-858 "ascendente espiritual", not always about relationships.
- A18 849-850 and 892-893 (Vertex = "ascendente espiritual", yet it "aparece no lado oposto do Ascendente", where the Descendant/Antivertex sits) vs the Antivertex defined as the "descendente espiritual".
- A18 921-923 ("Vertex normalmente fica nas casas 5, 6, 7 e 8") vs 983-995 (rarely 4 and 9, and the house 9 text reads as house 3 themes: siblings, neighbours). Different readings of the same factor inside one class.
- A18 1025 and 1026 (Mercúrio and Vênus contacts) are near-identical text (irmãos/irmãs, filhas, amante, amigas): probable class transcription error, not a disagreement of doctrine.
- A9 341-344 Gemini house 2 ("sagazes e cautelosos com dinheiro") vs H "finanças flutuantes" is a class-vs-H case, resolved for the class, not class-vs-class.
- No class-vs-class conflicts found in the cusp passages (A9 302-993, A6 house 1) or in the four retrograde logs (all A16). Re-reads covered A9 341-344, 373-378, 431-433, 460-463, 487-490, 689-694, 710-715, 732-743, 770-775, 798-801, 823-829 and A18 849-1064.

---

## Class priority pass (priority.json)
Counts: 5 dc rewritten + 11 cusp rewritten + 5 new house-6 cells = 21 entries.

### Rewritten for class priority
- angleSigns.dc.Leo: now based on A8 1285-1314 (Leo on the Descendant ~ Sun in house 7: self found through the other, seeking a strong figure/prestige/a hero to serve, projecting the solar principle); book's dramatic partners only added.
- angleSigns.dc.Taurus: A9 823-825 basis (constancy, devotion, possessiveness and jealousy as tendency, marriage as security/financial gain/physical closeness); book partners added.
- angleSigns.dc.Gemini: A9 487-488 basis (more than one important relationship or one transformed to almost new); book partners added.
- angleSigns.dc.Virgo: A9 488-490 basis (cautious, discerning in choosing partners; "salvar os outros" with extreme loyalty); book partners added.
- angleSigns.dc.Libra: A9 825-829 basis, now including the idealized partner / endless search for the perfect partner; book added.
- houseCuspSigns.2.Gemini (A9 341-344), 2.Taurus (689-694), 2.Libra (691-694): were H-only; now class basis.
- houseCuspSigns.3.Gemini (A9 373-375), 3.Virgo (376-378), 3.Taurus (710-712): were H-only; now class basis.
- houseCuspSigns.5.Taurus (A9 770-772), 5.Libra (773-775): were H-only; now class basis.
- houseCuspSigns.6.Virgo (A9 461-463), 6.Taurus (798-799), 6.Libra (799-801): were H-only; now class basis, H kept only where it does not conflict.
- Not rewritten, no class content on the Descendant: Aries, Cancer, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces (A8 1313 and the A9 ranges only name Leo, Taurus, Gemini, Virgo, Libra).
- New (task 3): houseCuspSigns.6.Cancer, Scorpio, Sagittarius, Aquarius, Pisces, from H lines 90, 154, 170, 202, 218 only (no class prose for them); tendencies about care of body/routine, organs left out except nervous system/circulation (Aquarius) and feet/lymphatic system (Pisces) as areas of attention.

Class claims kept out because of the writing exclusions:
- Leo: "figura de pai" (gendered parent), Diana example, counsellor/arbitration vocations (A8 1306-1313).
- Taurus: "fidelidade" (fidelity); jealousy kept only as the class's hedged "tendência" (same as houseCuspSigns.7.Taurus). Owner may strike it from both.
- Libra: Proust example (A9 820), "Áries na casa 1" cross-reference.
- 2.Gemini: "bom funcionamento do corpo como maior bem" (health); 6.Libra: "saúde abalada" (801); 6.Virgo: soap-brand anecdote.
- A11 111-116 (Descendant as "Tu", what we seek in others) is generic, has no per-sign content; not added (would glue a concept to sign profiles).

### Class versus class (owner to decide)
- A18 849-851 and 856-858 (Vertex axis "nem sempre trata de relacionamentos", also jobs, projects, revelations) vs A18 997-1020 (Vertex encounters are relationships, "sempre" meet impediments, "sempre ocorrerá algo do destino para separá-los", the relationship does not work after a divorce). Not resolved; points.vertex follows the first, the second was left out as deterministic.
- A18 908-911 (a Vertex contact "pode dar em nada" unless one is ready; may resonate for years) vs A18 997-1020 (always impeded, always separated).
- A13 1489 calls the Vertex "Ponto do Amor" vs A18 849-858 "ascendente espiritual", not always about relationships.
- A18 849-850 and 892-893 (Vertex = "ascendente espiritual", yet it "aparece no lado oposto do Ascendente", where the Descendant/Antivertex sits) vs the Antivertex defined as the "descendente espiritual".
- A18 921-923 ("Vertex normalmente fica nas casas 5, 6, 7 e 8") vs 983-995 (rarely 4 and 9, and the house 9 text reads as house 3 themes: siblings, neighbours). Different readings of the same factor inside one class.
- A18 1025 and 1026 (Mercúrio and Vênus contacts) are near-identical text (irmãos/irmãs, filhas, amante, amigas): probable class transcription error, not a disagreement of doctrine.
- A9 341-344 Gemini house 2 ("sagazes e cautelosos com dinheiro") vs H "finanças flutuantes" is a class-vs-H case, resolved for the class, not class-vs-class.
- No class-vs-class conflicts found in the cusp passages (A9 302-993, A6 house 1) or in the four retrograde logs (all A16). Re-reads covered A9 341-344, 373-378, 431-433, 460-463, 487-490, 689-694, 710-715, 732-743, 770-775, 798-801, 823-829 and A18 849-1064.

### Left as is
- Retrograde logs (all A16, class only): phase vocabulary (Fase I/II/III) omitted by design, not for a book or H source; no change.
- Retrograde logs: chart-conditional, sexual, marriage, health, past-life and gendered content excluded by the writing rules; no change.
- Retrograde: uranus Capricorn/Aquarius/Pisces, neptune and pluto missing signs: absent from the class; no change.
- Vertex: houses 1-3 and 10-12, Neptune contact, sign entries absent from A18; no change.
- Vertex: A18 997-1020 (reencontro, impediments, divorce, homosexual relationships) and gendered family roles excluded by the writing rules; no change.
- Vertex: A18 1032-1064 (house of the Vertex's ruler, astrocartography) is another factor, left out; no change.
- houseCuspSigns 1: A6 is the basis already; "cusp vs Ascendant" assumption stays as logged.
- houseCuspSigns 4.Gemini, 4.Virgo, 4.Taurus, 4.Libra, 3.Libra, 5.Gemini, 5.Virgo, 6.Gemini and all of 7-12 for Gemini/Virgo/Taurus/Libra: already class-based; H only supplementary. Virgo 5 and Gemini 4 H keywords that differ from class were already set aside.
- houseCuspSigns 2.Virgo: A9 has no Virgo sentence for house 2, so it stays H-only.
- houseCuspSigns 7-12 other signs (Aries, Cancer, Leo, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces) and 2-6 for those signs: no class prose, H-only stays.
- houseCuspSigns 8.Gemini (sexual-desire remark generalized) and 12.* ("karma materno" etc.): excluded content stays excluded.

---

## Sun sign x Ascendant (A7, lines 16-576)
Counts: authored 144 / expected 144

Lines used: `modulo 4/aula 7 modulo 4/aula-7.md` 16-576 (all of it read). Per-entry ranges are in each `src`. The range for the Sagittarius-Sun/Sagittarius-Ascendant row starts on a line it shares with the end of the Scorpio row (line 423); the Scorpio-Sun row there is 420-423.

### Reading of the structure (what confirms it)
- Twelve blocks, one per Ascendant, each with twelve rows beginning with a Sun sign in capitals. Headings are in mixed case for Taurus-Libra ("Ascendente EM TOURO"), and the Gemini heading is repeated at line 144 (page break); the second occurrence was treated as the same block.
- Confirmed from the text itself: block = Ascendant, row = Sun.
  - Taurus block, row GEMEOS: "o Geminiano ... o Ascendente Touro o torna mais fiel e apegado à família" (Gemini person, Taurus Ascendant).
  - Taurus block, row PEIXES: "O Ascendente em Touro dá estabilidade e realismo ao nativo de Peixes".
  - Libra block, row ESCORPIÃO: Scorpio traits "filtrados pela extroversão e diplomacia de Libra" (Libra as the outer filter).
  - Most other rows say "desta combinação" without direction, so only the cases above are decisive.
- No source statement contradicts the reading. The direction is unambiguous only in those rows; the rest follow the same layout.

### Gaps (keys omitted, with reason and lines inspected)
None. All 144 rows are present and readable (lines 16-576).

### Inconsistencies and source disagreements (lines; what conflicts; what you chose)
- Mirror-pair duplication: many (Sun A, Asc B) rows are word-for-word the same text as (Sun B, Asc A), so direction is lost in them (for example Aries block row LIBRA = Libra block row ARIES; Taurus/Leo; Gemini/Libra; Cancer/Leo; Leo/Virgo; Libra/Virgo; Scorpio/Virgo; Sagittarius/Aquarius; Capricorn/Aquarius; and others). I authored both keys from the same text, rewording only where the text names which sign is Sun or Asc (Taurus/Pisces, Libra/Scorpio). Treat these pairs as undifferentiated source text.
- Same-sign rows (Sun = Asc) are written as intensification, as the source does ("características acentuadas").
- Asc Taurus/Sun Leo and Asc Leo/Sun Taurus share most phrases; kept both.
- Gemini block line 144 repeated heading; no row lost (rows ARIES-VIRGEM before it, LIBRA-PEIXES after it).
- Several rows carry OCR slips ("Carcomi-o" for Capricórnio in Pisces/Capricorn, "urna" for "uma", "Dos personagens"); read by context.
- Source rows mix the labels "Câncer/Cancer" and "Gêmeos/Geminiano" freely; keys normalized.

### Weak support (entries authored on thin/keyword-only/damaged-OCR evidence; key + reason)
- Virgo-Sun/Sagittarius-Asc and Sagittarius-Sun/Virgo-Asc ("caráter honesto... criativo e prático"): one short sentence of source.
- Sagittarius-Sun/Sagittarius-Asc: only two short sentences, three keywords.
- Pisces-Sun/Capricorn-Asc and Capricorn-Sun/Pisces-Asc: OCR damage in the Capricorn word; reading is by context.

### Dropped in general terms (content policy)
- Deterministic fidelity/infidelity outcomes and "sudden passions" as fact, changing partners, sexual adventures, "sexual deviations", sexual-quality remarks (Taurus/Scorpio, Gemini/Taurus), "wishes to marry and have children", "marriage will remedy anxiety", marriage for economic advantage. Where a row had an affective theme that could be kept as a tendency in how you relate (tension between commitment and adventure, restless emotional life, stable-relationship difficulty), it is kept hedged; otherwise it was dropped.
- Health/psychopathology wording ("estados neuróticos", "inibição nervosa", "depressões", "atrações mórbidas", "maníaco") and the gendered label "feminina" for Libra/Cancer; fecundity remarks.
- Comparative verdict "mais favorável para a carreira do que para a vida afetiva" (Leo/Sagittarius).

---

## Symbolic degrees A: Aries, Taurus, Gemini, Cancer (A11 lines 341-758)
Counts: authored 120 / expected 120
Source lines used: reading rule 324-340 (degree key = source's ordinal number; 18°00' = 18th, 18°01'-18°59' = 19th); degrees Aries 341-455, Taurus 460-562, Gemini 567-660, Cancer 664-758.

### Gaps
None. All four signs have degrees 01-30 present, each exactly once, in order. No skipped or duplicated numbers.

### Inconsistencies and source disagreements
- Gemini 15/16: second ("Ou") images look swapped or displaced (15 gives "homem com sete cabeças", 16 gives "ponte construída ao lado da correnteza", while the bridge is in the 15 first image and the two-headed man in the 16 first image). Kept as printed.
- Gemini 28: second image "dois touros de tamanhos diferentes" does not match the sower; kept as printed.
- Cancer 06/07: second images look swapped (06 "homem mergulhando uma cabra em uma caldeira" matches the 07 first image; 07 "homem puxando uma cabra com seu cinto" matches the 06 horse-noose scene). Kept as printed. Cancer 04/05 and 23 (second image "uma queda d'água") also show loose matches.
- Aries 08: OCR broke the second image into one word per line; read as one sentence.
- Source typos/OCR kept faithful in meaning: "forca" (força), "arvore", "caca" (caça); Cancer 25 and others unaffected.
- Intro (324-340) states monomers "tendem a determinar as tendências astrológicas" but gives no per-degree meanings; only Taurus 06 states a meaning (three heads = vast intelligence), added hedged.

### Weak support
- Entries state images only (no interpretation), by design. Keywords are concrete motifs from the image. Long first images were condensed (secondary details dropped); those entries carry a "Condensed" reviewNote.
- Some images carry source-stated impressions ("força tranquila", "ar distraído") kept inside the image text, not as meanings.

---

## Symbolic degrees B (Leo, Virgo, Libra, Scorpio)
Counts: authored 120 / expected 120
Source: A11 `modulo 4/aula 11 modulo 4/aula-11.md`, lines 763-1158 (Leão 763-852, Virgem 856-954, Libra 958-1056, Escorpião 1061-1158); intro/reading rule at 324-333 read (degree N = ordinal degree; 18°01'-18°59' is the 19th).
### Gaps
None. All 120 degrees present; the source gives only images, no interpretive text for any degree, so no hedged meaning sentence was added anywhere.
### Inconsistencies and source disagreements
- Numbering: no skipped or duplicated degree numbers in 763-1158 (01-30 in each sign).
- Leão 25 and 26: the "Ou" images are shifted (25 Ou = man swimming in choppy waves, which is the main image of 26; 26 Ou = man chopping wood, unrelated to its main image). Kept as written.
- Many "Ou" images do not relate to the main image (e.g. Leão 15 lion lying; Virgem 16 two dogs; Virgem 25 sling; Libra 5 black bird; Libra 8; Escorpião 15, 25, 28, 30). Kept as written, flagged in reviewNotes where clearly unrelated.
- Repeated "Ou" images across degrees: Leão 30 and Virgem 19 (man sitting sideways on a horse); Leão 29 and Virgem/other "man and woman holding hands"; Virgem 25 and 26 (sling); Libra 15 and 16 (two winged hearts); Escorpião 25 and 28 (wolf with a duck). Kept as written.
- Virgem 23: "velas defraudadas" is probably a slip for "enfunadas"; rendered as billowing sails.
- Libra 8 and 9 mention sickbed scenes; kept as literal images only (no health claim).
- Escorpião 5: the "Ou" line has no final full stop (source typography).
- Page-break blank lines inside Leão 9/10, Virgem 3/4, Libra 8/9, Libra 21/22 gaps, Virgem 30 (line 952 blank mid-sentence) and Libra 30 / Escorpião 9 (1090): src ranges span through them.
### Weak support
- Main-image descriptions are condensed (minor modifiers and secondary details dropped, e.g. clothing, extra background items); the second "Ou" image is given in full. Only entries where the omission or oddity seemed material carry a reviewNote.
- Libra 14 source has OCR join "meiasmáscaras" (read as meias-máscaras); Libra 22 "belprazer" (read as bel-prazer).

---

## Symbolic degrees C (Sagittarius, Capricorn, Aquarius, Pisces) from A11
Counts: authored 120 / expected 120
Source: modulo 4/aula 11 modulo 4/aula-11.md, lines 1162-1556 (Sagittarius 1162-1254, Capricorn 1258-1346, Aquarius 1350-1450, Pisces 1454-1556). Intro and reading rule read at 324-340 (18°00' = 18th degree, 18°01'-18°59' = 19th).

### Gaps (keys omitted, with reason and lines inspected)
None. All 120 degrees present in 1162-1556. Lines from 1558 on are personal class notes and were not used.

### Inconsistencies and source disagreements (lines; what conflicts; what you chose)
- Numbering: sequential 01-30 in every sign, no skips or duplicates.
- No interpretation or tendency text exists for any of these degrees (images only), so every entry is image-only with no "isso pode indicar" sentence.
- Sagittarius 26 (1236-1240): the source footnote "GRACAS = jogo com um círculo e duas varinhas" is folded into the image as "as graças (jogo com um círculo e duas varinhas)"; footnote line included in src.
- Sagittarius 12 (1195): second image reads "Ou um homem montado em um bode" (no dash); treated as the usual "ou".
- Pisces 30 (1554-1556): "acoite" read as "açoite", rendered "chicote". Aq 28, Sag 25 "taca"/"tacas" read as "taça"/"taças".
- OCR/translation oddities normalized: "acesso" (Sag 9, 1186) read "aceso"; "trás" (Aq 20, 1413) read "traz"; "terceiro-estado" rendered "terceiro estado".
- Capricorn 17 (1303-1305): "personagem importante (talvez Luís XIV em Versalhes)" kept as in source.
- Pisces 16 (1507): "um tigre" kept masculine as in source.

### Weak support (entries authored on thin/keyword-only/damaged-OCR evidence; key + reason)
- Aquarius 16 (1396): "velas defraudadas" interpreted as "velas içadas" (sails spread); the source word is odd, this is an inference.
- Entries whose first image was condensed carry a reviewNotes line: Sagittarius 3 and 26, Aquarius 2, 19 and 25, Pisces 4. All other entries are near-complete renderings; very minor setting details (adjectives, "etc.") may be trimmed.

---

## Essential-dignity status concepts (domicile, exaltation, detriment, fall)
Counts: authored 4 / expected 4 (peregrine omitted)

### Gaps
- peregrine: no class defines it. grep of A12 and A15 for peregrin hits only unrelated words (A12:275, 876 "peregrinos/Peregrino" as pilgrim; A15:622 "peregrinar" as travel). Book grep: only "peregrinação" (B:19877), unrelated. Omitted.
- No class says what any status does to a planet's expression. Classes give only structural definitions. The behavioral hedges ("more naturally", "favored", "less at ease", "challenged") come from the book, which is sign-specific OCR: B:17372-17377 (domicile, Moon), 17113-17117 (exile, Sun), 17084-17097 (fall, Sun). Exaltation has no usable book wording (B:17068-17075, 17434-17436 garbled), so "qualities favored" is inferred only from A12 calling exaltation a "Dignidade" and detriment/fall "Debilidades" (A12:1267-1270). Owner may prefer to strip the behavioral clauses.
- Domicile: classes never define the word; A12 says "regem os signos" (1267-1268) and A15 uses "domicílio"/"trono" in examples (45-51).

### Class tables (data)
A12 (1239-1272), heliocentric/"natural order" table, columns Natural planet / Exaltation / Fall (table was reconstructed from the PDF by the owner, see the HTML comment at 1253-1264):
Aries: nat Sun, exalt Sun, fall Saturn | Taurus: Mercury, Moon, Uranus | Gemini: Venus, South Node, North Node | Cancer: Earth, Jupiter, Mars | Leo: Mars, Neptune, Pluto | Virgo: Moon/Asteroids, Mercury, Venus | Libra: Jupiter, Saturn, Sun | Scorpio: Saturn, Uranus, Moon | Sagittarius: Uranus, North Node, South Node | Capricorn: Pluto, Mars, Jupiter | Aquarius: Planet X, Pluto, Neptune | Pisces: Neptune, Venus, Mercury.
A12 explicitly says the "Planeta Natural" column is NOT rulership or dignity (1265-1269). A12 gives no domicile or detriment table; only the rule: ruler is always in detriment in the opposite sign (180°), and exaltation sits 180° from fall (1270-1272).
A15 (45-51): no table. Stated: Sun exalted in Aries, domicile Leo; Moon exalted in Taurus, "trono" Cancer. North/Ascending Node: domicile Gemini, exaltation Aquarius, exile Sagittarius, fall Leo; South Node the inverse. A15 gives no detriment or fall for any planet.

### Inconsistencies and source disagreements
Versus the standard library table:
- A12 exaltation by planet (read from the sign column): Sun Aries (matches), Moon Taurus (matches), Mercury Virgo (matches), Venus Pisces (matches), Mars Capricorn (matches), Jupiter Cancer (matches), Saturn Libra (matches). So A12 and the standard table agree on all seven classical exaltations. A12 additionally lists Uranus (Scorpio), Neptune (Leo), Pluto (Aquarius), nodes (see below); these are outside the standard table.
- A12 falls (read from the table): Sun Libra, Moon Scorpio, Mercury Pisces, Venus Virgo, Mars Cancer, Jupiter Capricorn, Saturn Aries. Each is 180° from its exaltation, consistent with A12's rule. (Standard table lists no falls; implied opposites match.)
- A12 detriment: stated only as opposite of ruler's sign; no per-planet data, so no comparison possible.
- A15 Sun (exalt Aries, domicile Leo) and Moon (exalt Taurus, throne Cancer) match the standard table. Nothing else in A15 for the classical planets.
Between A12 and A15:
- No disagreement on Sun or Moon (A12 has the same exaltations, no domicile table).
- Nodes: A12 table has North Node exalted Sagittarius, fall Gemini; South Node exalted Gemini, fall Sagittarius. A15 has Ascending Node domicile Gemini, exaltation Aquarius, exile Sagittarius, fall Leo. Per the owner these address different things and the node dignities follow A15:45-53; recorded as a note only, not a new conflict. Also not part of the concept entries.
- A15 itself: "exílio" is used for detriment, "trono" for domicile; A12 uses "Detrimento". Terminology only.
Book versus classes (not used for tables): book shows e.g. Mercury exalted Aquarius, Sun fall Libra but exile Aquarius, Jupiter exile Gemini/Virgo (B:17050-18800 region), differing from the standard table; irrelevant here since no table is authored.

### Weak support
- All four entries: structural part is class-sourced, behavioral hedge is book-only or inferred (see Gaps). Exaltation is the weakest (hedge inferred from "dignidade").
- B line numbers for the book citations were computed from grep offsets within the 16988-20164 range, OCR garbled; ranges are approximate to a few lines.

---

## Decans (method concept + 36 decan profiles)
Counts: authored 37 / expected 37 (1 concept + 36 decans)

### Decan system used by the book (from the printed pages, PDF page = printed page number)
All 36 decans printed with explicit degree spans (0-9°59′, 10-19°59′, 20-29°59′) and a planetary ruler. Rulers per sign (I / II / III):
- Aries: Mars / Sun / Venus (p70)
- Taurus: Mercury / Moon / Saturn (p74)
- Gemini: Jupiter / Mars / Sun (p78)
- Cancer: Venus / Mercury / Moon (p82)
- Leo: Saturn / Jupiter / Mars (p86)
- Virgo: Sun / Venus / Mercury (p90)
- Libra: Moon / Saturn / Jupiter (p94)
- Scorpio: Mars / Sun / Venus (p98)
- Sagittarius: Mercury / Moon / Saturn (p102)
- Capricorn: Jupiter / Mars / Sun (p106)
- Aquarius: Venus / Mercury / Moon (p110)
- Pisces: Saturn / Jupiter / Mars (p114)

This is the Chaldean-order sequence (Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon repeating) starting with Aries I = Mars and running continuously around the zodiac, so it should match the library's computed decan rulers. I compared the sequence by reasoning, not against library code; owner should confirm against the library.
No Egyptian god/name is attached to any decan in the sign chapters. The book separately prints two Shem angels per decan next to the angel talismans (e.g. Aries I = Vehuiah and Jeliel, p71; Capricorn I = Mebahiah and Poyel, p107; Aquarius I = Umabel and Iah-Hel, p111); these were not used (invocation material).

### Gaps (keys omitted, with reason and lines inspected)
None. All 36 decans printed and legible.

### Inconsistencies and source disagreements
- Classes (A3 104-114) describe the Egyptian decan with 36 "counselor gods" (18 above, 18 below the Earth), not planetary rulers; the book uses planetary rulers and no gods. Not contradictory but different systems; the concept entry follows the classes and only mentions the 10-degree/10-day structure and the 36 count.
- A5 570-577 mentions the sidereal decan (72 years per degree, 720 years per decan) and calls the 36 decans "crosses"; the book has none of this. Concept entry includes the "36 crosses" phrase only.
- OCR damage suspected for Pisces and a displaced Capricorn heading: on the printed pages neither is a problem. Capricorn decans are all on p106 with correct headings (the displaced heading is only the OCR lines 13875 etc.; p107 is the Capricorn angel list, and the ghosted "Aquarius" heading behind it is a page watermark). Pisces decans are all on p114 (p112 is the sign intro, p113 a full-page illustration). Pisces p114 is slightly skewed and clipped at the right margin but every sentence is readable. The `src` ranges for Pisces (14608-15000) and Capricorn (13719-13887) are wide because the OCR interleaves and displaces text; they were not verified line by line.
- Book vs class on the A3 180-182 colour method: not applicable (needs a colour table not available).

### Weak support
- Concept entry: A3 114-122 and A5 570-574 are short, partly keyword-level statements; hedged phrasing used.
- Every decan entry paraphrases one printed paragraph of generic modern style (the book also prints a word cloud per sign, deliberately ignored for keywords). Keywords come from the paragraph text.
- Excluded from entries: health/healing statements (Virgo I "saúde e bem-estar", Scorpio III "regeneração e cura") and anything about the angels.
