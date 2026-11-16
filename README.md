# Kaabalah

A comprehensive TypeScript library for numerology, astrology, kaabalah, gematria, tarot, I Ching, and Ifa divination.

<p align="center">
  <img src="./examples/tree-of-life-readme.svg" alt="Color Tree of Life rendered from kaabalah/visual" width="420" />
</p>

## Documentation

Full API reference, guides, and examples: **[docs.kaabalah.com](https://docs.kaabalah.com/)**

## Installation

```bash
npm install kaabalah
```

Node.js 18.18+ required.

## Modules

All modules are tree-shakable and can be imported independently:

| Module | Import | Description |
|--------|--------|-------------|
| Core | `kaabalah/core` | Tree of Life graph with cross-system correspondences |
| Numerology | `kaabalah/numerology` | Life path, cycles, challenges, personal year |
| Astrology | `kaabalah/astrology` | Birth charts, synastry, composite, transits, solar returns, profections, firdaria, astrocartography, dignity, decans, dodecatemoria |
| Gematria | `kaabalah/gematria` | Hebrew letter numerology |
| Tarot | `kaabalah/tarot` | 78-card deck with profiles, archetypes, correspondences, multi-deck images, spread engine |
| I Ching | `kaabalah/iching` | 64 hexagrams, classical Chinese and original English, Han technical derivations, tree-backed Kaabalah, coin casting |
| Ifa | `kaabalah/ifa` | Odu divination |
| Semantic | `kaabalah/semantic` | Theme profiles, kaabalistic overlay correspondences, symbol metadata |
| Visual | `kaabalah/visual` | Tree of Life and astrology wheel SVG generation plus layout/render-model data |

## Quick Example

```typescript
import { createTree, id, KaabalahTypes } from 'kaabalah/core';
import { getBirthChart } from 'kaabalah/astrology';
import { calculateKaabalisticLifePath } from 'kaabalah/numerology';
import { getTarotCorrespondenceProfile } from 'kaabalah/tarot';
import { generateAstroWheelSvg, generateTreeSvg } from 'kaabalah/visual';

const tree = createTree({ system: 'kaabalah', parts: ['westernAstrology', 'tarot'] });
const correspondences = tree.getCorrespondences(id(KaabalahTypes.SPHERE, 'Tiphareth'), { depth: 2 });

const chart = await getBirthChart({
  date: { year: 1990, month: 6, day: 15, hour: 14, minute: 30 },
  latitude: 48.856, longitude: 2.352,
});

const lifePath = calculateKaabalisticLifePath(new Date('1990-06-15'));
const magician = getTarotCorrespondenceProfile({ tarotCardName: 'The Magician' });
const svg = generateTreeSvg({ background: 'transparent', palette: 'monochrome' });
const wheelSvg = generateAstroWheelSvg(chart, { background: 'transparent' });
```

## I Ching

```ts
import { getIChingReading, castThreeCoins } from 'kaabalah/iching';

const reading = getIChingReading('879777'); // six classical lines, bottom to top
const replay = getIChingReading(30, [2, 4]); // same as lines 767987
const cast = castThreeCoins(); // inject an RNG for reproducible tests
```

Store the six cast lines; derive the cast, moving lines, transformed and nuclear figures, palace, 納甲, 六親, 世/應 relations, line transforms, Zhu Xi texts, sovereign months, and separate Kaabalah gate/family/pillar layers. Static casts have a null transformed state. With six moving lines, 乾 uses 用九 and 坤 uses 用六. Transform `after` relatives use the destination palace; `afterInCastPalace` provides the original palace frame. See the [I Ching API and source notes](src/iching/README.md).

## Language

English is the default. Pass `'pt-BR'` to localized text getters:

```ts
import { getTarotCardProfile } from 'kaabalah/tarot';
import { getIChingReadingContent } from 'kaabalah/iching';

getTarotCardProfile({ tarotCardNumber: 20 }, 'pt-BR')?.tarotMeaning;
getIChingReadingContent('879777', 'pt-BR').oracle[0].text.content;
```

See [Portuguese text APIs](docs/localization/pt-BR-api.md) for card/deck descriptions, spreads, numerology, gematria, tree descriptions, astrology labels and CLI language selection.

## CLI

```bash
npx kaabalah help                    # list all commands
npx kaabalah help --json             # full schema introspection
npx kaabalah help --language pt-BR    # Portuguese help
npx kaabalah iching:reading --lines 879777 --json --compact
npx kaabalah iching:hexagram 25 --json --compact
npx kaabalah iching:cast --json --compact
npx kaabalah numerology 1990-01-15 --json --compact
npx kaabalah astrology 1990-01-15 14:30 --lat=40.71 --lon=-74 --json
npx kaabalah astrology:wheel 1990-01-15 14:30 --lat=40.71 --lon=-74 --json --compact --fields=svg
npx kaabalah tree:node "tarotArkAnnu:The Magician" --depth=2 --json
```

Run `kaabalah help --json` to discover commands and schemas. See the [CLI Reference](https://docs.kaabalah.com/getting-started/cli/) for the full list.

## Support

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/matmoura19)

## License

AGPL-3.0 — see [LICENSE](LICENSE).

## Acknowledgments

- [Swiss Ephemeris](https://www.astro.com/swisseph/) for astronomical calculations
- [Astro.com](https://www.astro.com/) for ephemeris data
