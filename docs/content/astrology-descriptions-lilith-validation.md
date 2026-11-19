# Astrology descriptions: completed Lilith validation

Validated 2026-11-16 against main3537d58 plus the sign kind. Lilith supplies13 canonical bilingual entries: one concept and12 signs, shared by the exact chart keys `lilith mean` and `lilith true`. Total383 canonical library entries; the24 sign-mode queries do not create24 independent teachings.

`getPointDescription/Entry` shares the concept. `getPointSignDescription/Entry` aliases only the mode key and preserves the caller’s supplied sign, so different calculated positions can select different sign texts. Same-sign modes return the same frozen entry. No bare Lilith default, Priapus derivation or Lilith-house description is introduced. Chiron’s shared sign/house accounts and Fortune’s independent sign/house paths remain unchanged.

A18:131-160 supplies the general context; the adopted concept cites135-136,152-155,159-160. The12 Lilith-only sign sections run163-193,225-255,290-311,327-344,367-410,442-472,495-541,563-583,606-637,666-720,754-773,801-822, with narrower adopted citations in each record. Subsequent Priapus sections are separate. The109-129 summary concerns sexuality and is not generic concept evidence. Intensity depends on chart and degree; latent characteristics need not reach extremes. Capricorn’s contextual polarity disagreement remains in review notes alongside Mat’s general feminine/negative convention. No private notes/private readings, physical-vacuum claim, diagnosis, fixed biography, promised outcome or practice supplies entries.

## Validation

- Full npm test suite: 1608 passed,0failed,0pending,actual exit0. Command: `npm run test -- --maxWorkers=1 --minWorkers=1 --reporter=json --outputFile=/tmp/kaabalah-lilith-batch-full-tests.json`.
- All astrology-description tests:443 passed,actual exit0,single fork. Evidence `/tmp/kaabalah-lilith-signs.tests.json` and `.tests.exit`.
- Build and typecheck actual exit0. Public CJS/ESM checks cover all383 exact canonical entries, language/default rules, metadata, recursive immutability, gaps and alias identity.
- All371 previous rows unchanged. Aggregate provenance383 entries/14 cited source hashes match; every inclusive range stays within teaching bounds. Evidence `/tmp/kaabalah-lilith-batch-provenance.json`.
- Public documentation changes stay within the bilingual description section. No calculation/index/CLI/package-version/publication/push changes; unrelated `.DS_Store` deletion untouched.

Exact next kind: eight natal retrograde planet profiles. Continue from astrology-descriptions-progress.md without repeating phase1 research or expanding into sign/house/timing grids.
