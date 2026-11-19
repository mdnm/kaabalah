# Sun in signs: bilingual source audit

Completed primary audit: 2026-11-16. Factor: natal Sun in the twelve signs, not generic sign profiles, transits, Sun/Ascendant combinations or evolutionary levels. Course root is the private notes root; paths and inclusive line ranges below refer to the original Portuguese Markdown.

## Content and API

`src/astrology/descriptions.json` contains twelve entries in `planetSigns.sun`, with Portuguese first, equivalent English, paired source-supported keywords, structured `src` records and `reviewNotes`. `descriptions.ts` imports and recursively freezes the JSON. `getPlanetSignDescription(planet, sign, language?)` returns English by default or Portuguese for `pt*`; `getPlanetSignDescriptionEntry(planet, sign)` returns the immutable bilingual entry and provenance. Both are additive exports through `kaabalah/astrology`. Missing or inherited keys return `undefined`, without a profile fallback.

Chart source was checked in `index.ts` and `swisseph.ts`: the ten ordinary planets have lowercase keys, signs are title case, and hydrated `ZodiacPosition.sign` is currently typed as `string`. Callers that need the `Sign` contract must validate that string rather than cast an arbitrary value. No calculations or existing exports were changed.

## Primary passages actually read

File: `class notes`. The complete eligible factor block 272-535 was read. The entry citations retain only passages used in the synthesis.

| Sign | Inclusive lines | Emphasis retained |
|---|---|---|
| Aries | 286-298 | Enthusiasm and initiative; leadership alongside impulsiveness and imposing a viewpoint |
| Taurus | 310-317 | Reflection, patience and persistence; stubbornness and inertia |
| Gemini | 328-342 | Discernment, invention, curiosity and communication; boredom, superficiality and avoiding responsibilities |
| Cancer | 356-370 | Sensitivity, imagination, reserve and listening; domestic comfort, attachment to family and past |
| Leo | 377-379, 385-391 | Outward expression, warmth, generosity and leadership; vanity and susceptibility to flattery |
| Virgo | 402-403, 407-415 | Increased self-assertion and egocentrism; analytical detail can obscure the whole |
| Libra | 405-406, 420-425 | More control of impulses without losing enthusiasm; diplomacy and indecision |
| Scorpio | 437-446 | Easier expression and organization of intense energy; resistance to authority, suspicion and jealousy |
| Sagittarius | 458-465 | Warm expression, independence, frankness and justice; rebelliousness, wastefulness and difficulty with criticism |
| Capricorn | 476-486 | Ambition and added warmth in contact with others; discipline, prudence, reserve and pessimism |
| Aquarius | 496-502 | Innovation, freedom and humanitarian concern; the Sun in detriment increases self-concern |
| Pisces | 514-521 | The Sun supports reflection before the first impulse, discipline and balance; sensitivity, passivity and mystical responses |

The explicit qualification at 531-535 applies to the complete family: these general tendencies do not describe every person and require the other chart factors. Documentation retains that condition; entries use non-guaranteed tendencies. Lines 272-285 also explicitly reject automatic success. No outcome promises were carried into the descriptions.

## Editorial and extraction decisions

Virgo and Libra are interleaved in the course OCR. Virgo is 402-403 plus 407 onward; Libra is 405-406 plus 420 onward. The Virgo entry retains this decision in `reviewNotes` so a future editor does not merge the adjacent Libra paragraph.

Sex-specific lists were not treated as universal statements about everyone with a Sun placement. Descriptions use the shared factor passages above, rather than converting those separate lists into gender-independent predictions. Health, addiction and relationship outcomes, practices and rituals remain excluded. No NOTAS, private readings, English indexes or earlier Gamu copy supplied entry text.

Portuguese uses direct você, lowercase sentence starts and complete accents. The English preserves the same resources and tensions. Two sentences remain a flexible editorial target; keyword pairs are supported by the cited passages, not generated from generic planet/sign combinations.

## Supplemental book audit

Grok 4.7 build-fast independently inspected all twelve narrow psychological openings, comparing them with the course. These are audit pointers, not additional entry text or automatic authority. Angel, ritual and degree-sector blocks were not read or synthesized.

Sun-in-sign audit only. Course handout `class notes` 272-535. Book psychological openings in `reference text` (angel and ritual blocks left unread). All 12 signs were inspected.

| Sign | Book lines | Agreement | Material conflict |
|---|---|---|---|
| Aries | 23107-23188 | Energy, enthusiasm, initiative, leadership, impulsivity | None |
| Taurus | 23349-23389 | Persistence, determination, resistance to change, material comfort | None. Course also lists laziness, inertia, fear (316-317); the book states steady work and reliability |
| Gemini | 23613-23678 | Curiosity, speech, quick mind, boredom, scattered energy | None. Duality, easy love and forgetfulness, and avoidance of responsibility are course-only |
| Cancer | 23798-23876 | Emotional depth, family, home, care, protective attachment | None. Opposite-sex and moral-value claim (351-355) is absent from the passage read |
| Leo | 24052-24170 | Rulership (`Leão é regido pelo Sol`, 24088), expression, leadership, pride, warmth | Course (377-384): authoritarian, obstinate, no modesty, macho rejection of inner femininity. Book: generosity and an open heart; pride only as excess (24135-24145) |
| Virgo | 24320-24396 | Analysis, detail, organization, caution | Course (402-403): Sun exalts the ego and egocentrism. Book: service (24375-24381) and modesty/humility (24389-24396) |
| Libra | 24534-24669 | Diplomacy, harmony, both sides, indecision (24649-24655) | Course (425): sudden mood changes. Book: equilibrium and peace (24558-24571, 24669) |
| Scorpio | 24911-24993 | Intensity, will, persistence, reserve, secrecy | Course (437-440): easier self-expression, stronger anti-authority, aggressiveness. Book: counselor, reserve, emotions shown only as needed (24970-24993) |
| Sagittarius | 25144-25242 | Optimism, freedom, enthusiasm, frankness | Course (458-460): expression and centralization. Book: expand horizons, adventure, philosophy (25150-25164) |
| Capricorn | 25380-25537 | Ambition, discipline, responsibility, realism, hard work | Course (476-478): Sun adds human warmth that eases contact. Book caution: too rigid or authoritarian (25394-25404) |
| Aquarius | 25785-25890 | Freedom, reform, the unusual, humanitarian aims | Course (496-502): exile brings self-concern; sensitive nature. Book: contribution to society; risk is emotional distance (25791-25797) |
| Pisces | 25995-26114 | Imagination, sensitivity, compassion, art, mysticism | Course (514-516): Sun makes one reflect before the first impulse and disciplines. Book: feeling and intuition decide (26087-26104); risk is illusion and escapism (26017-26019) |

Course OCR interleaves Virgo and Libra: Virgo solar sentence 402-403, Libra solar sentence 405-406, Virgo portrait 407-415, Libra portrait 420-435.

No sign is wholly unverified. Gaps inside passages already used: Gemini 23656 is garbled (boredom is clear at 23674-23678); Scorpio 24915-24940 is broken, and no authority sentence was found; Capricorn 25543 is cut off, and `À ESSÊNCIA DO PROTETOR` at 25561 was not read as psychology; Virgo and Aquarius lack a clean title line (the concept text above was read). Angel sectors after each sign were not checked.


The table labels emphasis differences as review issues; most are compatible tensions rather than logical contradictions. The course has priority. In particular, its explicit Virgo ego emphasis, Aquarius self-concern and Pisces reflection were retained instead of silently replaced by the book's more familiar framing. These decisions also remain in entry `reviewNotes`. The book corroborates shared themes; the entry `src` lists only the primary passages that carry the written claims. No book-only traits were added to fill space.

## Validation and continuation

Targeted tests cover all twelve canonical Sun keys, locale selection, bilingual keywords, complete immutable metadata, prototype-key rejection, integer inclusive source bounds before private NOTAS, and specific course nuances for Virgo, Aquarius and Pisces. Ordinary tests require no mounted course folder.

Next factor after Sun completion: Moon in signs, primary `class notes:4-108`, supplemental `reference text:27771-31599`. Read actual narrow passages before drafting. Remaining ordinary planet-sign sets, planet-house sets and approved natal factors follow the connected research note's batches 1-3. Unsupported sets remain gaps until separately audited and implemented.

Mat decided on 2026-11-16: no hemisphere inversion for nodes; retain astronomical north/south meanings. Node dignity disagreements remain a separate decision. No npm publication is authorized.

Validation: `npm run build`, `npm run typecheck`, and `npm run test -- --reporter=dot` passed (595 passed, 1 pre-existing skipped). Built CJS and ESM getters were exercised directly. Every entry citation was checked against the actual mounted file and NOTAS boundary. A3 SHA256 matches the research manifest: `3570d3bdf5981d166aab61559990daef4cc02ca53b41daa700e5a24aa0f5584b`.
