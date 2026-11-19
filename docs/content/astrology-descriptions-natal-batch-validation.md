# Approved natal descriptions: batch 1 validation

Completed on 2026-11-16 after the calculation/release6.17.0 landing. The data contains288 authored bilingual rows:120 planet-sign,120 planet-house,12 house themes and36 angle-sign (Ascendant,MC,IC). Descendant and the144-cusp grid remain outside the approved supplemental scope; no fallback was introduced.

- `npm run build` and `npm run typecheck` passed.
- `npm run test -- --maxWorkers=1 --minWorkers=1 --reporter=json` passed1492 tests, zero failed/pending, actual exit0. It includes all eight IC semantic tests. The327 description tests also passed independently using a single fork worker.
- Public CJS and ESM lookups matched the source JSON for all288 rows. Locale selection, nested immutable metadata and explicit unsupported-key gaps passed. Angles use actual chart keys independently of house cusps.
- All288 entries have eligible inclusive source ranges. All eight cited source hashes match the original manifest. No private NOTAS or private reading supplies entry provenance.
- IC integration preserves all276 previous rows; earlier kind-specific audits record prior preservation checks and semantic qualifications. Public-doc edits are confined to the bilingual natal descriptions section.

Detailed descriptions, citations, disagreements, source bridges and editorial adjudications live in the per-kind `astrology-descriptions-*.md` audits. A default-worker MC test retry encountered a native Node24 abort after writing a report; the single-worker runs completed normally. No repository runtime/config workaround, calculation change, publication or push was performed by this content task.

Machine-readable local evidence: `/tmp/kaabalah-natal-batch1-full-tests.json`, `/tmp/kaabalah-natal-batch1-provenance.json`, `/tmp/kaabalah-ic-signs-tests.json`, build/typecheck logs and the public-package check scripts. These temporary paths are local evidence, not library assets.

Next kind: basic planet profiles10. Primary class notes:190-225; class notes:288-335; class notes:767-795,890-901,939-954; class notes:1568-1578. Supplemental B:16988-20290 is a navigation family, not a request to read it whole. Keep Earth and Vulcan cosmology outside core natal planet keys.
