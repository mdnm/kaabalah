# Natal Mercury in signs: source audit

Completed 2026-11-16. Twelve entries, composed from the actual course passages and compared with narrow supplemental book openings. Course-relative paths and inclusive line ranges follow the original Portuguese Markdown under the private notes root. Three four-sign shards were independently drafted by Eco and Prumo (GPT-6-Luna low) and Nexo (GPT-6.1-Sol low), then integrated and checked against the primary course by Codex #2 and Lume (Grok build-fast low). No other factor context was expanded during this kind.

The shared typed `getPlanetSignDescription` and `getPlanetSignDescriptionEntry` now cover Sun, Moon and Mercury, twelve signs each. JSON data and all nested metadata stay deeply frozen; English is default, `pt*` selects Portuguese, and unsupported sets remain undefined without fallback. No calculations or prior exports changed.

## Passage audits

# Mercury in signs - shard A audit

Scope: Aries, Taurus, Gemini, Cancer only. Read one schema example in `src/astrology/descriptions.json`; did not edit repository files.

| Sign | Inspected source and exact claim lines | Synthesis / editorial decision |
|---|---|---|
| Aries | Course: `class notes`, lines 7-8: open/attentive, active/fast mind; intellectual competence; new ideas and defined goals; reliable and sincere people. Supplemental book: `reference text`, opening under “MERCÚRIO EM ÁRIES” at line 32796: direct/assertive expression, fast thought/speech, frankness and sometimes impulsivity. | Used only the primary course: mind qualities, ideas/goals, reliability/sincerity. The book was inspected but its directness/impulsivity material is unused and has no citation in the entry.
| Taurus | Course: `class notes`, line 9: “mente lente” supported more by experience than intelligence. Supplemental book: narrow window near supplied heading hint 32996; opening extraction is visibly garbled. | Both sentences and the two keywords now reflect only the course claim: slow thinking and experience weighing more than intelligence. Book was inspected but is unused because its extracted text cannot be reliably range-mapped; method, calm speech, and resistance-to-change claims were removed.
| Gemini | Course: `class notes`, lines 10-11: quick reasoning, brilliant ideas, keen humor, sharp imagination, speaking ability, tendency to lie. Supplemental book: opening near supplied heading hint 33298, on quick/versatile communication, curiosity, adaptation. | Kept the course's full mix, including the unsoftened lying tendency; did not import generic positive book traits. EN mirrors “tendência” with “tendency.”
| Cancer | Course: `class notes`, lines 12-13: excellent memory, especially for emotion-linked facts; naivety; little observational sense. Supplemental book: `reference text`, lines 33557 onward: emotional influence/intuitive thought and memory for personal/emotional details. | Kept only the course claims without adding relationship, domestic, or health outcomes. EN uses “limited powers of observation” for natural grammar while preserving the course's degree of certainty.

No practices, diagnoses, promised outcomes, invented numbers, or em dashes included. Course citations use inclusive line ranges carrying the claims; sign naming follows the existing schema (`Gemini`).


# Mercúrio nos signos: auditoria de passagens (grupo B)

Escopo: apenas Leão, Virgem, Libra e Escorpião. Prioridade do curso. As linhas citadas abaixo são inclusivas e contêm diretamente as afirmações sintetizadas; as janelas do livro serviram apenas para inspeção suplementar e não são citadas pelo JSON.

| Signo | Fontes efetivamente inspecionadas | Citação estreita no JSON e decisão |
| --- | --- | --- |
| Leão | Curso `class notes`, 14-15. Livro `reference text`, 33835-33855 (abertura psicológica e criatividade; interrompida antes do material angelical). | Curso 14-15: segurança nas próprias ideias, alegria, otimismo e generosidade; risco de grosseria, preconceitos e vaidade exacerbada. O livro corrobora confiança/criatividade, mas não amplia o resumo com liderança, persuasão ou reconhecimento. |
| Virgem | Curso `class notes`, 16-17. Livro `reference text`, 34063-34106 (abertura e início dos conceitos-chave; não avançar ao bloco seguinte). | Curso 16-17: capacidade de trabalho intelectual, versatilidade e seletividade, com possível criticismo e pedantismo. O livro apoia análise, método e precisão; não se importou conteúdo adicional para não alargar a síntese além do curso. |
| Libra | Curso `class notes`, 18-19. Livro `reference text`, 34348-34429 (abertura psicológica/conceitos-chave; fragmentação OCR; encerrado antes de material ritual/angelical). | Curso 18-19: lentidão, capacidade de pensar equilibradamente, pouca inclinação à especulação e falta de tato. O livro enfatiza diplomacia, equilíbrio e mediação, em tensão com o curso. Mantive curso como autoridade; não corrigi a tensão nem acrescentei o polo mais favorável do livro. |
| Escorpião | Curso `class notes`, 20-21. Livro `reference text`, 34672-34704 (abertura psicológica até a fala direta/cortante; encerrado antes do material angelical). | Curso 20-21: inteligência e intuição muito desenvolvidas, concentração, risco de desconfiança e crueldade mental. O livro corrobora intensidade, investigação e fala às vezes cortante; não sustenta necessidade de acrescentar afirmações sobre intenções ou segredos. |

Todos os textos têm duas frases curtas, começam em minúscula em português e inglês, mantêm as qualificações do curso e não incluem previsões de saúde/relacionamento ou práticas. As notas registram a divergência de Libra e os limites editoriais relevantes.


# Mercury in signs: Sagittarius, Capricorn, Aquarius, Pisces

Actual Portuguese passages inspected before synthesis. Root: the private notes root. Paths below are course-relative; bounds are one-based and inclusive. Read one existing Sun entry for schema only. No inventory, NOTAS, private readings, web, English index or Gamu draft used. Only the narrow book windows below were inspected, not the whole Mercury family. Course takes priority. The book is comparison evidence, not an automatic source of extra favorable traits. JSON cites only passages carrying adopted claims.

| Sign | Actual primary inspection and JSON citation | Actual supplemental inspection | Audit and editorial decision |
| --- | --- | --- | --- |
| Sagittarius | `class notes:22-23` | `reference text:34813-34863`, heading, psychological opening and adjacent psychological concepts | Course gives underdeveloped critical judgment, superficiality, vulnerable intellect and lack of own ideas, with no balancing strength. Book opening 34820-34825 instead emphasizes optimism, honesty, expressive freedom and philosophical/cultural exploration. Preserve the course account without importing these favorable claims; record divergent emphasis in reviewNotes. Both sentences and all keyword pairs derive from course 22-23. |
| Capricorn | `class notes:24-25` | `reference text:35032-35082`, heading, interleaved psychological opening and adjacent psychological concepts | Course pairs rational, serious, cold, calculating intelligence and good memory with mental intransigence and rejection of fantasy/imagination. Keep both sides, including cold/calculating, rather than replacing them with warm pragmatism. Book opening 35037-35055 corroborates seriousness/calculation but emphasizes organized, responsible communication and authority/tradition; none of those additions is needed. Cite course 24-25 only. |
| Aquarius | `class notes:26-27` | `reference text:35291-35341`, heading, psychological opening and adjacent psychological concepts | Keep curiosity/research, future orientation, original ideas and the explicit tendency toward dishonesty. Book opening 35302-35312 corroborates original/futuristic thinking but adds friendly/open communication, social change and technology; it does not carry the course dishonesty tension. Do not substitute harmless eccentricity for that tension. Cite course 26-27 only; note the different emphasis. |
| Pisces | `class notes:28-29` | `reference text:35527-35589`, interleaved heading/opening and adjacent psychological concepts | Keep strong imagination, mental confusion, the possibility of brilliant ideas and the tendency toward lying. The course's madness/genius polarity is recast without diagnostic labeling as oscillation between confusion and brilliant ideas; it is not an invented evolutionary rank. Book opening is interleaved: 35527 and 35539-35550 include intuition/empathy, while 35565-35568 supports imaginative thinking. Do not invent a missing continuous opening or add empathic talents to cancel the course tension. Cite course 28-29 only; explain the non-diagnostic paraphrase and different book emphasis in reviewNotes. |

All four entries use direct você, lowercase sentence starts, two sentences in each language, aligned keyword pairs, exact primary source ranges and mandatory reviewNotes. No em dash, practices, diagnosis, promises, invented numbers or evolution levels. Repository files remain untouched; only the assigned JSON and this audit are outputs.


## Integrated source and bilingual review

The initial shard A added book-only impulsivity/direct speech in Aries and methodical/calm/resistant-to-change thinking in Taurus without a precise supporting book citation. Those additions and their keywords were removed. Taurus retains two short source-supported clauses, slow thought and experience weighing more than intelligence, without filler or a fabricated counterweight. Cancer's English uses grammatical “limited powers of observation.” Virgo addresses the person, not an ability becoming pedantic; Libra's English preserves little inclination toward speculation and the course's lack of tact. Sagittarius's English keyword means ideas of your own, not novel/original ideas.

Lume independently compared all twelve entries with course 6-29. Its material findings were integrated: Leo and Aquarius state their tensions independently rather than suggesting a causal mechanism; Libra retains lack of tact; Pisces retains confused thought as the baseline, with possible brilliant ideas and the lying tendency. Clinical diagnostic labels were not turned into predictions. The source's course/book differences for Libra, Sagittarius, Aquarius and Pisces remain in entry reviewNotes. No generic optimistic balance was substituted for the course's negative-only Sagittarius account.

The book comparisons are inspection records, not additional entry citations where no book-only claim survives. JSON `src` contains the exact narrow primary passages used. No private NOTAS, private readings, English indexes or prior Gamu copy supplies content. These are general placement tendencies interpreted with the rest of the natal chart, not guaranteed personality or outcome claims.

## Validation and next factor

Generic authored-set checks cover all twelve canonical keys, locale behavior, frozen metadata, paired bilingual keywords and bounded inclusive provenance for each completed planet set. Mercury regressions preserve the distinctive course tensions rather than testing generic astrological assumptions. Tests require no mounted course folder.

Next factor after this kind is validated: Venus in signs. Primary `class notes:31-56`; supplemental `reference text:36582-39259`. Only narrow actual psychological passages should be read. Sun/Moon content remains unchanged.

Validation: 40 targeted description tests, `npm run typecheck`, and staged whitespace checks passed. Sun/Moon rows were compared byte-for-value against their previous committed JSON and remain unchanged.
