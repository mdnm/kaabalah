# Astrology description inventory: API and draft-bank audit

Phase 1 only, 2026-11-16. No new getter is implemented or promised by this document.

## Verified chart keys

Inspected current TypeScript source and ran the existing built astrology module with a synthetic chart at 2000-01-01 12:00 UTC, latitude 0, longitude 0, using explicit local WASM and ephemeris paths. Runtime keys agreed with current source. No geocoding or network was used.

| Factor | Existing API | Implication for future content keys |
|---|---|---|
| Ten planets | `chart.planets.sun` through `.pluto` | Lowercase English planet keys |
| Lunar nodes | `chart.planets["mean node"]`, `["true node"]` | Both are north-node calculations; do not mislabel one as south. No dedicated stored South field; current getChartPoints adapter exposes derived south-node-mean/south-node-true opposite points |
| Lilith | `chart.planets["lilith mean"]`, `["lilith true"]` | Two calculation modes; same textual factor unless sources explicitly distinguish |
| Chiron | `chart.planets.chiron` | `chiron`, not `quiron` |
| Position | `planet.zodiacPosition.sign`, `.house` | Signs are title case `Aries` to `Pisces`; houses 1 to 12 |
| Cusps | `chart.houses.houses[house - 1].sign` | Zero-based array, semantic house key 1 to 12 |
| Four angles | `chart.houses.ascendant`, `.dc`, `.mc`, `.ic` | Preserve these angle names; MC need not be treated as cusp 10 for every house system |
| Vertex | `chart.houses.ascmc?.vertex` | Optional position, not a planet or a member of `nodes` |
| Fortune | `chart.nodes.parsFortunae` | Existing string ID `parsFortunae`; display name is `Wheel of Fortune` |
| Natal retrograde | Optional `planet.longitudeSpeed` | No natal boolean exists. If speed is available, negative speed identifies retrograde motion; missing speed is unknown |
| Transit retrograde | `TransitPlanet.retrograde`, `TransitAspectEdge.retrograde`, `AspectPerfection.retrograde` | Boolean already available in transit output |
| Aspect types | `conjunction`, `duodecile`, `octile`, `sextile`, `square`, `trine`, `trioctile`, `quincunx`, `opposition` | Nine supported names. duodecile = 30°, octile = 45°, trioctile = 135°. Do not introduce uncomputed quintile etc as if existing enum members |
| Aspect endpoints | `planetA`, `planetB` strings | Natal aspects include all 15 planet/point entries plus `ascendant` and `mc`. Fortune, Vertex, DC and IC are not currently passed to natal aspect computation |
| Sect | `diurnal`, `nocturnal` | Available on BirthChart |
| Essential dignity | `getEssentialDignity(TraditionalPlanet, Sign)` | TraditionalPlanet is title case `Sun` to `Saturn`; returns domicile, exaltation, detriment, fall, peregrine and domicileRuler. This key vocabulary differs from chart planet keys |
| Decan | `getDecan(longitude)` | sign, decanNumber 1/2/3, Chaldean ruler and Golden Dawn tarot correspondence. Do not equate automatically with Egyptian decan or sign-level teaching |
| Twelfth parts | `getDodecatemoria(longitude)` | originalSign, dodecatemoriaSign, index 0-11; computed but source support still needs assessment |
| Profections | `getAnnualProfection`, `getMonthlyProfections` | House/sign/ruler outputs; whole-sign assumption documented in source |
| Firdaria | `getFirdaria` | Nine title-case lords including `NorthNode`/`SouthNode`, major and subperiods; two node-subperiod conventions supported |
| Synastry | `getSynastryChart` | Two natal charts and ordered cross-chart aspect endpoints |
| Composite | `getCompositeChart` | Midpoint planets/houses and aspects; distinct from synastry |
| Transits | `getTransitChart`, `getTransitRange` | Transit houses/natal houses, aspects, applying flag and perfection time |
| Solar return | `getSolarReturnChart` | Natal and annual BirthChart plus exact return date; annual interpretations need separate context |
| Astrocartography | `computeAstrocartographyMap`, `queryAstrocartographyLocation` | Angles `MC`, `IC`, `AC`, `DC`, different casing from chart fields; proximity/parans rather than generic natal placements |
| Other ASCMC fields | `armc`, `equasc`, `coasc1`, `coasc2`, `polasc` | Present geometrical points; no interpretive text should be invented |
| Missing dedicated chart points | Priapus, Antivertex, south node, Vulcan, Ceres, Pallas, Juno, Vesta, fixed stars | Some can be separately derived/calculated, but not first-class returned BirthChart factors |

Source anchors: `src/astrology/index.ts:82-125,266-336,348-361,431-436,449-519,539-568,949-963`; `src/astrology/aspects.ts:3-40`; `src/astrology/swisseph.ts:731-761`; `wasm/src/swisseph.ts:20-59,114-136`; and exported `decans.ts`, `dodecatemoria.ts`, `dignity.ts`, `profections.ts`, `firdaria.ts`, `astrocartography.ts`.

## Existing bilingual pattern

`src/iching/descriptions.ts` imports JSON, recursively freezes it, exports a readonly constant, returns `undefined` for unknown entries, and selects Portuguese with `language?.startsWith("pt")`; English is default. Future astrology entries should retain both language fields and a list of structured source records, plus review notes for disagreements. Exact getter names and schema wait for Mat's phase 1 scope decision.

## Earlier Gamu bank

Verified branch: `feat/onboarding-jtbd` in `~/projects/gamu`, path `docs/content/onboarding-fact-bank.json`. Read all entries and the handoff section 7.2 (`docs/handoffs/2026-11-09-onboarding-rebuild.md:138-170`). It contains 108 bilingual leaf entries: 103 placement rows and 5 defaults. The two Sun grids are different app-area rewrites of the same 12 placements, not 24 distinct library factors. Unique placement keys: Sun 12, Moon 12, Mercury 12, Venus 12, house-2 cusp 12, house-7 cusp 12, MC 12, planets-in-house-2 7 = 91.

Reuse status: unaudited draft only. Citations provide useful search anchors, not pre-approved library content. Every source range was checked for existence and whether it falls before NOTAS; content synthesis must still be audited per entry after scope approval.

- Planet/sign, planet/house and house definitions cite the primary classes. All cited class ranges are before NOTAS.
- Cusp and MC rows cite the supplied `reading reference notes` reference, which gives keyword cells, not class citations. Keep these as supplemental evidence and seek primary course/book corroboration.
- Four defaults cite `reading reference notes` keyword rows. The house-2 default cites class notes:9-11 directly.
- The handoff recommends class notes:615-646, but that entire range is private NOTAS. It cannot enter the new description set. The bank's actual leaf citations do not use that range.
- Money-area Sun rows deliberately add a work/money context. Those are consumer-specific transformations. A general library Sun description must synthesize the factor itself, without treating every work example as a universal chart claim.
- The bank uses lowercase zodiac keys, while chart output uses title case. Normalize only through an explicit typed content API contract; do not require Gamu to guess key spelling.
- There is no provenance list or disagreement review metadata in this bank. A string `src` cannot serve unchanged as the proposed auditable library schema.

## Editorial decision from Mat

Selected format: short paragraphs, preserving the source as faithfully as possible. Sentence/word targets are flexible; neither filler nor omitted qualifications should result from a fixed limit. Keywords may be added only where supported. Portuguese first, then equivalent English. Lowercase sentence starts, proper names preserved, `você`, direct Brazilian speech with `pra`/`tá` when natural, restrained imagery and no profanity/emojis in reusable library text. Retain both the resource and the tension where sources support them. No automatic inference of a person's evolutionary level.

Mat selected paragraph format. Scope/order remains pending; no descriptions have been drafted for this task.
