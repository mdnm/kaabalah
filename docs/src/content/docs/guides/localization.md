---
title: Portuguese (pt-BR) Text
description: How to get Brazilian Portuguese display text from the library and the CLI
sidebar:
  order: 3
---

English is the default. An optional `language` argument that begins with `pt`, including `pt-BR`, selects Portuguese. Any other value selects English. Calculations never change: IDs, keys, enum values, numbers, glyphs and lookup identities are the same in both languages, and the cached English data is never mutated.

## Where it applies

| Module | Function | What is localized |
| --- | --- | --- |
| Tarot | `getTarotCardProfile(lookup, language?)`, `getTarotRepresentation(lookup, deckId, language?)` | Card display names and deck descriptions |
| Tarot | `getTarotSpread(id, language?)`, `listTarotSpreads(language?)` | Spread and slot labels, descriptions, notes |
| I Ching | `getIChingReadingContent(input, language?)`, `getHexagramText`, `getOracleTextContent`, `getHexagramName`, `formatRecordContent` | The 514 classical texts (as `content`), hexagram names, the printed record |
| Numerology | `getNumerologyData(language?)` | The eight meaning tables |
| Gematria | `getGematriaData(language?)` | Individuality, personality and synthesis meanings |
| Core | `getTreeDescription(text, language?)`, `getTreeNodeDescriptions(node, language?)` | Sphere, world, letter, color and music descriptions |
| Core | `getSphereProfile(sphere, language?)`, `listSphereProfiles(language?)`, `getPathProfile(path, language?)`, `listPathProfiles(language?)`, `getSpherePathProfiles(sphere, language?)`, `getTreeSection(id, language?)`, `listTreeSections({ kind, language })`, `getSphereSections(sphere, language?)` | Sphere and path profiles (meaning, balance, excess and lack, misuse, mantras, correspondences) and the worlds, pillars and triads |
| Semantic | symbol metadata getters, `getKaabalisticCorrespondenceTargets`, `get*TreeMarkers`, `buildKaabalisticMapData`, `getKaabalisticLabel`, `getReadingReference` | Display labels and the reading reference, including the eleven-step descent |
| Astrology | `getAstrologyLabel(label, language?)` | Signs, planets, nodes, sect, dignities, aspects, decan tarot names |
| Ifa | `getIfaText(key, language?)` | Calculation labels |

## Examples

```typescript
import { getTarotCardProfile, getTarotRepresentation } from 'kaabalah/tarot';

const lookup = { tarotCardNumber: 20 };
const profile = getTarotCardProfile(lookup, 'pt-BR');
const meaning = profile?.descriptionsByDeck.papus_pt?.meaning ?? profile?.tarotMeaning;

getTarotRepresentation(lookup, 'papus_pt', 'pt-BR')?.description?.meaning;
```

```typescript
import { getIChingReadingContent, getHexagramText, getHexagramName, formatRecordContent } from 'kaabalah/iching';

const reading = getIChingReadingContent({ hexagramNumber: 30, movingLines: [2, 4] }, 'pt-BR');

reading.oracle.map((selection) => selection.text.content);
reading.cast.hexagram.text.judgment.content;
getHexagramText(1, 'pt-BR')?.useNine?.content;
getHexagramName(reading.cast.hexagram.number, 'pt-BR');
formatRecordContent('879777', 'pt-BR');
```

`.content` holds the selected display text; each classical text keeps its original `.chinese` and `.english`. `getIChingReading` and `formatRecord` are unchanged.

```typescript
import { getNumerologyData } from 'kaabalah/numerology';
import { getGematriaData } from 'kaabalah/gematria';
import { getTreeDescription } from 'kaabalah/core';
import { getAstrologyLabel, getDecan } from 'kaabalah/astrology';
import { getIfaText } from 'kaabalah/ifa';

getNumerologyData('pt-BR').LIFEPATH_MEANING[7].description;
getGematriaData('pt-BR').SYNTHESIS_NUMBER_MEANINGS[7];
getTreeDescription('Crown', 'pt-BR'); // 'Coroa'

const decan = getDecan(15);
getAstrologyLabel(decan.sign, 'pt-BR');      // 'Áries'
getAstrologyLabel(decan.tarotCard, 'pt-BR'); // 'Três de Paus'

getIfaText('north', 'pt-BR'); // 'Norte'
```

Unknown or custom text passes through unchanged: `getTreeDescription` returns `undefined` for text it does not know, `getKaabalisticLabel` and `getAstrologyLabel` return their input.

## CLI

```bash
kaabalah tarot:card 20 --language pt-BR --json --compact --fields=meaning,tarotCard
kaabalah iching:reading --hexagram 1 --moving 1,2,3,4,5,6 --language pt-BR --json --compact --fields=oracle
kaabalah ifa 1990-01-15 --language pt-BR --no-json
kaabalah help astrology --language pt-BR --json --compact
```

`--language pt-BR` selects Portuguese help, display content and error messages. JSON field names, error codes, IDs, command and flag names, and user input stay unchanged, and `--fields` selects values after the display content is localized. In I Ching JSON the Portuguese `.content` appears beside `.chinese` and `.english`. See the [CLI reference](/getting-started/cli/#language).
