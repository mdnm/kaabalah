# Portuguese text

English is the default. An optional language beginning with `pt`, including `pt-BR`, selects Portuguese. Other language values select English.

## Tarot

```ts
import { getTarotCardProfile, getTarotRepresentation } from 'kaabalah/tarot';

const lookup = { tarotCardNumber: 20 };
const profile = getTarotCardProfile(lookup, 'pt-BR');
const meaning = profile?.descriptionsByDeck.papus_pt?.meaning
  ?? profile?.tarotMeaning;

const representation = getTarotRepresentation(lookup, 'papus_pt', 'pt-BR');
representation?.description?.meaning;
```

The language argument selects card display names and deck descriptions. Lookup names, filenames, branded IDs, canonical tree numbers and asset paths keep their existing identities. Bilingual scene, figure and divinatory reference fields retain their shape. Language selection does not mutate cached English profiles.

## Tarot spreads

```ts
import { getTarotSpread, listTarotSpreads } from 'kaabalah/tarot';

getTarotSpread('conscious-reading', 'pt-BR');
listTarotSpreads('pt-BR');
```

These getters select spread and slot labels, descriptions and metadata notes. Spread IDs, slot keys, validation rules, numbers and sphere names stay unchanged.

## I Ching

```ts
import {
  getIChingReadingContent, getHexagramText, getHexagramName,
  formatRecordContent,
} from 'kaabalah/iching';

const reading = getIChingReadingContent(
  { hexagramNumber: 30, movingLines: [2, 4] },
  'pt-BR',
);

reading.oracle.map(selection => selection.text.content);
reading.cast.hexagram.text.judgment.content;
reading.cast.hexagram.text.image.content;
reading.cast.hexagram.text.lines[0].content;
getHexagramText(1, 'pt-BR')?.useNine?.content;
getHexagramText(2, 'pt-BR')?.useSix?.content;
getHexagramName(reading.cast.hexagram.number, 'pt-BR');
formatRecordContent('879777', 'pt-BR');
```

`.content` contains the selected display text. Each classical text also retains its original `.chinese` and `.english` values. The reading getter applies the selection to the oracle, cast, transformed and nuclear hexagrams. It accepts the same `CastInput` values as `getIChingReading`: a six-line string, six line values, or an object with `hexagramNumber` and optional `movingLines`.

`getHexagramText` returns undefined for an unknown number. `getIChingReading` and `formatRecord` keep their existing results. `formatRecordContent(input, language?, labels?)` accepts optional caller-supplied date and question labels.

## Numerology

```ts
import { getNumerologyData } from 'kaabalah/numerology';

const texts = getNumerologyData('pt-BR');
texts.LIFEPATH_MEANING[7].description;
texts.DAY_OF_BIRTH_MEANING[15].description;
texts.PERSONAL_YEAR_DESCRIPTIONS[9];
```

The getter returns read-only versions of `CYCLE_MEANINGS`, `NUMEROLOGY_KEYWORDS`, `DAY_OF_BIRTH_MEANING`, `LIFEPATH_MEANING`, `CHALLENGE_MEANING`, `CHALLENGE_HEALTH_MEANING`, `PERSONAL_CYCLE_KEYWORDS` and `PERSONAL_YEAR_DESCRIPTIONS`. Existing `NumerologyData` exports are unchanged.

## Gematria

```ts
import { getGematriaData } from 'kaabalah/gematria';

const texts = getGematriaData('pt-BR');
texts.INDIVIDUALITY_NUMBER_MEANINGS[7];
texts.PERSONALITY_NUMBER_MEANINGS[7];
texts.SYNTHESIS_NUMBER_MEANINGS[7];
```

The returned tables are read-only. Existing `GematriaData` exports are unchanged.

## Tree descriptions

```ts
import { getTreeDescription, getTreeNodeDescriptions } from 'kaabalah/core';

getTreeDescription('Crown', 'pt-BR'); // Coroa
getTreeNodeDescriptions(node, 'pt-BR');
```

The node getter returns the available `meaning`, `colorDescription`, `noteDescription`, `nameMeaning`, `letterMeaning`, `symbol` and `hieroglyph` fields. `nameMeaning` is the translated meaning of a sphere or world name. Node names such as Chokhmah and Tiphareth, branded IDs and the original node data remain unchanged.

Descriptions cover all three tree systems and shared sphere, world, letter and music metadata. `getTreeDescription` returns undefined for unknown text. The node getter preserves custom text without a catalog entry.

## Semantic labels and markers

The following functions accept an optional final language argument:

- `getPlanetSymbolMetadata`, `getZodiacSignSymbolMetadata`, `getAngleSymbolMetadata`, `getNodeSymbolMetadata` and their `list*` counterparts.
- `getKaabalisticCorrespondenceTargets`.
- `getAstrologyTreeMarkers`, `getNumerologyTreeMarkers`, `getGematriaTreeMarkers`.
- `buildKaabalisticMapData`.

Pass `'pt-BR'` to select Portuguese display labels. Glyphs, lookup keys, target IDs, computation identifiers and counts stay unchanged. `getKaabalisticLabel(text, language?)` also selects supported standalone or generated display labels.

## Astrology labels

```ts
import { getAstrologyLabel, getDecan } from 'kaabalah/astrology';

const decan = getDecan(15);
getAstrologyLabel(decan.sign, 'pt-BR');
getAstrologyLabel(decan.ruler, 'pt-BR');
getAstrologyLabel(decan.tarotCard, 'pt-BR');
```

The label getter covers signs, planets, lunar nodes, sect, dignities, aspects and decan tarot names. Use it on firdaria `.planet` values and profection `.sign` and `.ruler` values. Calculation results keep their existing identifiers. Unknown custom labels pass through unchanged.

## Ifa

```ts
import { getIfaText } from 'kaabalah/ifa';

getIfaText('north', 'pt-BR'); // Norte
```

Keys are `odu`, `left`, `right`, `north`, `south`, `east`, `west`, `center` and `invalidDate`. Odu calculation results remain numeric.

## CLI

```sh
kaabalah tarot:card 20 --language pt-BR --json --compact --fields=meaning,tarotCard
kaabalah iching:reading --hexagram 1 --moving 1,2,3,4,5,6 --language pt-BR --json --compact --fields=oracle
kaabalah ifa 1990-01-15 --language pt-BR --no-json
kaabalah help astrology --language pt-BR --json --compact
```

`--language pt-BR` selects Portuguese help, display content and CLI messages. JSON field names, error codes, IDs, command names, flag names, explicit English source fields and user inputs stay unchanged. `--fields` selects values after display-content localization.

I Ching JSON adds `.content` beside `.chinese` and `.english` when Portuguese is selected. Technical details supplied by external runtimes remain literal.
