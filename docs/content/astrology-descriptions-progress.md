# Astrology descriptions: current implementation progress

Approved scope: batches 1-3 in natal placements, basic profiles, additional points order. One factor kind at a time. No npm publication.

- Completed planet-sign sets: sun, moon, mercury, venus, mars, jupiter, twelve signs each (72 bilingual entries).
- Shared API: getPlanetSignDescription/getPlanetSignDescriptionEntry, imported deeply frozen JSON, English default, pt* Portuguese; unsupported combinations return undefined.
- Files: src/astrology/descriptions.json/.ts/.test.ts, additive astrology index export and public astrology API docs. One source audit per kind at docs/content/astrology-descriptions-<planet>-signs.md.
- Current validation: 88 description tests and npm run typecheck pass; source hashes/ranges verified and previous sets unchanged. Final build/typecheck/full test suite required at the complete handoff.
- Source decisions, OCR limits and omissions remain in each audit and entry reviewNotes. Mat chose astronomical north/south nodes without hemisphere inversion. Nodal dignity and opposition class conflicts require their own narrow audit and decision when reached.
- Exact next factor: Saturn in signs. Source pointers: A12:112-136; B:49071-51810 (book Aries body absent). Read only actual narrow passages; inventory is navigation, NOTAS private context only, no private client readings.

Commits are separate per completed kind; see git log. This file and the connected Maestri note carry current handoff state. Earlier individual audits retain their historical next-factor pointers.
