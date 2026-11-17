# Astrology descriptions: lunar node concepts

Two canonical role records, `lunarNodes.north` and `.south`, adopted exactly from `/tmp/kaabalah-node-concepts-approved.json`. Bodies retain brief ascending/descending geometry and symbolic growth/natural talents and a baggage of patterns and beliefs, with possible limits to perspective. No guaranteed benefit/harm, fixed biography or spiritual level is assigned.

`DescriptionLunarNode` is exactly `north | south`; `LunarNodeDescriptionEntry` reuses the common readonly shape. `getLunarNodeDescriptionEntry(role)` returns the frozen authored entry through an own-property guard; `getLunarNodeDescription(role, language?)` defaults to English and uses Portuguese only for case-sensitive pt prefixes. Unknown modes, aliases and prototype names have no fallback. DescriptionPoint and all previous getters remain unchanged.

Both stored `chart.planets["mean node"]` and `["true node"]` are NORTH-node calculation modes. Neither is South. BirthChart has no dedicated stored South-node field; `chart.nodes` contains Fortune. The existing points adapter already exposes derived `south-node-mean` / `south-node-true` outputs. These descriptions neither call that adapter nor derive positions: South is an explicit conceptual role, distinct from storage and calculation mode.

Root verified A15:4-53 and A21:867-874 plus narrow book20421-20455/20543-20569/20571-20589. Integration uses Root's final approved synthesis, without reopening source/private material. Manifest bounds: A15 teaching798/NOTAS799, A21 teaching882/NOTAS883. Ignore the audit's erroneous A15 physical-count line; counts are not eligibility boundaries. Book material is limited to plain nodal growth/natural-talents themes, excluding interleaved Tree/magic/ritual claims. No whole-course/book or private-client read.

## Adopted inclusive citations

### north

- `modulo 4/aula 15 modulo 4/aula-15.md:20-21`
- `modulo 4/aula 15 modulo 4/aula-15.md:24-26`
- `modulo 4/aula 15 modulo 4/aula-15.md:45-53`
- `books/astrologia-hermetica/astrologia-hermetica.md:20421-20426`
- `books/astrologia-hermetica/astrologia-hermetica.md:20441-20450`

- Mat's settled convention is astronomical north/south with no hemisphere inversion. Aula 15's contrary southern-hemisphere inversion claim (33-45) is not applied to node identity; its dignity scheme (45-53) is retained as a separate symbolic correspondence. Benefic language is attributed to the teaching and does not guarantee benefit. Aula 21 places Dragon/house in a question about development goals, not a personality generalization.
- O corpo combina a definição astronômica da A15 com a linguagem simbólica de desenvolvimento/recursos do livro, preservando os contextos distintos. A21:867-874 é um roteiro de leitura Dragão/casa e não fornece uma definição norte/sul; não foi usada como citação do corpo. Não afirma biografia de vidas passadas, destino fixo nem resultados garantidos.
- Dignidades da A15, conforme decisão de Mat: norte domicílio Gêmeos, exaltação Aquário, exílio Sagitário, queda Leão; sul inverso (Sagitário, Leão, Gêmeos, Aquário). O contexto diferente da A12 permanece distinto; estas correspondências não alteram cálculos nem criam uma grade de personalidade.

### south

- `modulo 4/aula 15 modulo 4/aula-15.md:20-21`
- `modulo 4/aula 15 modulo 4/aula-15.md:24-26`
- `modulo 4/aula 15 modulo 4/aula-15.md:45-53`
- `books/astrologia-hermetica/astrologia-hermetica.md:20549-20554`
- `books/astrologia-hermetica/astrologia-hermetica.md:20559-20569`

- Mat's settled convention is astronomical north/south with no hemisphere inversion. Aula 15's contrary southern-hemisphere inversion claim (33-45) is not applied to node identity; the stated inverse dignity scheme (45-53) is retained as a separate symbolic correspondence. Malefic language is attributed to the teaching and does not guarantee harm. Aula 21 places Dragon/house in a question about development goals, not a personality generalization.
- O corpo combina a definição astronômica da A15 com a linguagem simbólica de desenvolvimento/recursos do livro, preservando os contextos distintos. A21:867-874 é um roteiro de leitura Dragão/casa e não fornece uma definição norte/sul; não foi usada como citação do corpo. Não afirma biografia de vidas passadas, destino fixo nem resultados garantidos.
- Dignidades da A15, conforme decisão de Mat: norte domicílio Gêmeos, exaltação Aquário, exílio Sagitário, queda Leão; sul inverso (Sagitário, Leão, Gêmeos, Aquário). O contexto diferente da A12 permanece distinto; estas correspondências não alteram cálculos nem criam uma grade de personalidade.

Mat's astronomical north/south convention has no hemisphere inversion; the contrary A15 teaching remains disclosed in notes. A15 benefic/malefic language, dignities and the distinct A12 context remain metadata, not technical lists or promises in bodies. A21 Dragon/house is developmental-goal reading context, not a north/south definition, body citation or personality rule. No dignity grid, sign/house lookup, generic Point aliases or position changes are added.

Only JSON/TS and this document are owned. Existing393 records/getter bodies are preserved; two additions give395. No new tests or per-kind tests/build/typecheck/check runs, per Mat. Root owns final checks, other docs and commit. Integration report: `/tmp/kaabalah-node-concepts-integration.md`.

Final South refinement uses the latest approved natural-talents/baggage-of-patterns wording and corresponding keywords, avoiding ambiguity between familiar and family resources.
