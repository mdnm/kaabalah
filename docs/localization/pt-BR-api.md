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
