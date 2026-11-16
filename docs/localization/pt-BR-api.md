# Portuguese API and review status

English remains the default. A language beginning with `pt`, including `pt-BR`, selects Portuguese. Other language values return English.

## Tarot meanings and deck descriptions

```ts
import { getTarotCardProfile, getTarotRepresentation } from 'kaabalah/tarot';

const lookup = { tarotCardNumber: 20 };
const profile = getTarotCardProfile(lookup, 'pt-BR');
profile?.tarotMeaning;
profile?.descriptionsByDeck.papus_pt?.meaning;
profile?.descriptionsByDeck.papus?.meaning;
profile?.descriptionsByDeck.egyptian?.name;

const representation = getTarotRepresentation(lookup, 'papus_pt', 'pt-BR');
representation?.description?.meaning;
```

Numbers are always canonical tree numbers. Existing name, filename, path and branded ID lookups continue to work. Lookup names are the existing English identities; Portuguese changes display names, not identifiers. Language selection does not mutate cached English profiles. Existing bilingual scene, figure and divinatory fields retain their shape.

The shared source is `src/core/tarot-content.json`. Both legacy card exports and core deck descriptions derive their English meanings from it. The pre-existing raw-card wording difference for Two of Swords is retained explicitly as `legacyMeaning`.

Portuguese names and meanings are drafts pending Mat's review. `tarot-review.json` enumerates each field, its origin and review status. O Julgamento adapts the Portuguese class phrase from module 1, class 20, line 448 into the requested second person. Other draft fields are conservatively marked as agent translations, not claimed as exact quotations from Mat's classes. Source research remains open for replacing those drafts with verified original wording.

No npm release is authorized or performed. The remaining content areas and final full-suite validation are still in progress.

## Tarot spreads

`getTarotSpread('conscious-reading', 'pt-BR')` and `listTarotSpreads('pt-BR')` localize spread/slot labels, descriptions and metadata notes. IDs, constraints and sphere spellings stay stable. `spreads-review.json` lists all draft translations; numeric labels and sphere names remain unchanged.

## I Ching classical text

```ts
import { getIChingReadingContent, getHexagramText, getHexagramName } from 'kaabalah/iching';
const reading = getIChingReadingContent({ hexagramNumber: 30, movingLines: [2, 4] }, 'pt-BR');
reading.oracle[0].text.content;
reading.cast.hexagram.text.judgment.content;
reading.cast.hexagram.text.image.content;
reading.cast.hexagram.text.lines[0].content;
getHexagramText(1, 'pt-BR')?.useNine?.content;
getHexagramName(reading.cast.hexagram.number, 'pt-BR');
```

The new getter also localizes transformed and nuclear hexagram texts. Each text retains `.chinese` and `.english`; `.content` selects the requested language. Existing `getIChingReading` and all existing exports are unchanged. `iching-review.json` lists all 514 draft translation rows. The consulted class reference and exchange directories did not yield a complete Portuguese classical-text catalog; no draft is claimed as a quotation from class material.

## Numerology

`getNumerologyData('pt-BR')` from `kaabalah/numerology` returns the eight existing text tables with Portuguese values, for example `.LIFEPATH_MEANING[7].description`, `.DAY_OF_BIRTH_MEANING[15].description` and `.PERSONAL_YEAR_DESCRIPTIONS[9]`. Tables are read-only and existing `NumerologyData` exports retain their values and mutability. All 296 text fields have review provenance. Class wording comes from module 3, classes 2, 15, 16, 18 and 19, with OCR corrections recorded as adaptations. The existing English row 22 goal refers to path 21; its Portuguese translation preserves that wording pending Mat's doctrinal review.

## Gematria

`getGematriaData('pt-BR')` from `kaabalah/gematria` returns `.INDIVIDUALITY_NUMBER_MEANINGS`, `.PERSONALITY_NUMBER_MEANINGS` and `.SYNTHESIS_NUMBER_MEANINGS`. All 39 texts are adapted from module 3, class 13, with source lines and pending review recorded in `gematria-review.json`. OCR repairs, particularly master numbers 11, 33 and 44, need Mat's review.

## Tree descriptions

`getTreeDescription(englishText, 'pt-BR')` and `getTreeNodeDescriptions(node, 'pt-BR')` from `kaabalah/core` cover meanings, colors, musical notes and shared sphere/world/letter descriptions across all three systems. The node getter returns optional `meaning`, `colorDescription`, `noteDescription`, `nameMeaning`, `letterMeaning`, `symbol` and `hieroglyph`. `nameMeaning` translates the meaning of a sphere/world name; the node's own name and branded ID remain unchanged. Unknown description lookups return undefined; custom node text is returned unchanged by the node getter. All 184 catalog rows have pending review provenance in `tree-review.json`.

## Semantic markers and map labels

The symbol `get*SymbolMetadata` and `list*SymbolMetadata` functions, `getKaabalisticCorrespondenceTargets`, `getAstrologyTreeMarkers`, `getNumerologyTreeMarkers`, `getGematriaTreeMarkers` and `buildKaabalisticMapData` now accept an optional final language argument. Pass `'pt-BR'`. `getKaabalisticLabel(text, language)` is also available for supported display labels. Glyphs, target IDs, counts and computation keys stay stable. `semantic-review.json` identifies translated labels and deliberately unchanged notation.

## Astrology calculation labels

`getAstrologyLabel(value, 'pt-BR')` from `kaabalah/astrology` localizes signs, planets, nodes, sect, dignities, aspects and decan tarot names. For example, use it on `getDecan(longitude).tarotCard`, a firdaria period's `.planet`, or a profection's `.sign` and `.ruler`. Raw calculation results and identifiers stay unchanged. Unsupported custom labels pass through. Review rows are in `astrology-review.json`; decan card names share the tarot source.

## Ifa

`getIfaText(key, 'pt-BR')` from `kaabalah/ifa` exposes Odu, column and direction labels and the invalid-date message. Keys: `odu`, `left`, `right`, `north`, `south`, `east`, `west`, `center`, `invalidDate`. Calculation results stay numeric and unchanged. No Odu interpretation text was added. `ifa-review.json` records draft labels.
