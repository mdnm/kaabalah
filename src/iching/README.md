# I Ching (`kaabalah/iching`)

A reading is derived from exactly six classical line values, bottom to top. Store those six values; everything else is reproducible. The module returns structural facts, classical text and fixed correspondences, without date seeding, guaqi day assignments or network access. `getIChingReading` does not interpret. `getHexagramDescription` is a separate plain-language account of the judgment and the image.

```ts
import {
  getIChingReading, linesFromHexagram, castThreeCoins, formatRecord,
  getHexagram, getHexagramByBinary, getHexagramByTrigrams,
} from 'kaabalah/iching';

const reading = getIChingReading('879777');
const september = getIChingReading(30, [2, 4]);
// Equivalent object form:
getIChingReading({ hexagramNumber: 30, movingLines: [2, 4] });
linesFromHexagram(30, [2, 4]); // [7, 6, 7, 9, 8, 7]
const lines = castThreeCoins(() => 0.25); // injectable RNG: six old yin lines
formatRecord(lines, { date: '15-11-2026', question: '(daily reading)' });
```

Line 1 is bottom; line 6 is top. Values: 6 old yin (moving), 7 young yang, 8 young yin, 9 old yang (moving). Binary is also bottom-first, with yang = 1. Coin casting uses three independent coin draws per line (tails 2, heads 3), exactly 18 RNG calls. The caller's RNG must return finite values in `[0, 1)`. Coin odds for 6/7/8/9 are 1/8, 3/8, 3/8, 1/8. No question/date seed is built in.

`HEXAGRAMS` is in King Wen order; `HEXAGRAMS_BY_NUMBER` and `getHexagram(number)` use the number as identity. Names always include Chinese, pinyin, the site's Wade-Giles display form and English. `getHexagramDescription(number, language)` returns plain words for that hexagram's judgment and image. It is not part of `getIChingReading`, and it is not a substitute for `hexagram.text`. `pinyinVariants` records alternate readings for 小畜, 噬嗑, 大畜 and 解. Romanizations are never lookup keys: 履 and 旅 both display Lü; the site's Ch'ien and Chien spellings are also easily conflated.

`TRIGRAMS` and `getTrigram(idOrBinary)` provide Chinese names, images, bottom-first bits, family, Later Heaven directions, and the five phases. `getHexagramByTrigrams(lower, upper)` deliberately takes the lower trigram first, matching the line convention. Gate output explicitly uses upper then lower, matching the source gate table.

`getIChingReading()` returns:

- `lines`, `lineCode`, and sorted `movingLines`.
- `cast` and `transformed` states. `transformed` is `null` for static casts. Each state includes `hexagram`, `han`, `nuclear`, `kaabalah`, and `sovereign`.
- `nuclear.hexagram`, its `palace`, `han` and `kaabalah` data, and `selfNucleating`. Nuclear lower = lines 2/3/4; upper = 3/4/5. Only 乾 and 坤 nucleate into themselves.
- `han.palace`: palace trigram/phase, generation (本宮 through 歸魂), 世/應 positions. `han.lines` lists six 納甲 stem/branch, phase and 六親 records. `han.shiYing` gives 沖/合 or null and the directed phase relation (世 relative to 應), with a Chinese label.
- `lineTransforms`: before/after branches, phases, relatives, 回頭生/回頭剋 and 進神/退神. **`after.relative` uses the destination palace**. **`afterInCastPalace.relative` uses the cast palace**. The `isShi`/`isYing` flags in each record refer to the hexagram that contains that line. Both frames are returned explicitly; the frame is never inferred.
- `oracle`: selected texts with source hexagram number/Chinese name, kind, line position (or null), primary flag, and Chinese/English text. 大象 remains separate from 卦辭. With six moving lines, 乾 uses 用九 and 坤 uses 用六; other casts use the transformed judgment.

Standalone helpers expose each calculation: `parseCastLines`, `getCastHexagram`, `getMovingLines`, `getTransformedHexagram`, `getNuclearHexagram`, `getPalace`, `getHanHexagram`, `getSixRelative`, `getPhaseRelation`, `getBranchRelation`, `getLineTransforms`, and `selectZhuXiTexts`. Invalid inputs throw `RangeError`. Duplicate moving positions are rejected. Shared hexagram data is frozen.

The Kaabalah data has separate `gate`, `family`, `rulingArcanum`, and `pillars` fields. `getTrigramGate` resolves the fixed letter mapping through canonical `kaabalah` tree nodes to find the path, endpoints, arcanum and number. `getFamilySphere` independently resolves the family sphere. `getTrigramPillars` maps top/middle/bottom bits to left/middle/right. `LINE_POSITIONS` provides the six positional domains. `listHexagramGates()` enumerates all 64 gates. Five phases are kept independent from tree spheres and western elements.

`SOVEREIGN_HEXAGRAMS` and `getSovereignHexagram(number)` expose 十二辟卦 lunar months and branches. The `approximateSolarWindow` field provides fixed approximate month/day ranges rather than calculated solar-term boundaries. No guaqi day placements are provided.

```sh
kaabalah iching:cast --json --compact
kaabalah iching:hexagram 25 --json --compact
kaabalah iching:reading --lines 879777 --json --compact
kaabalah iching:reading --hexagram 30 --moving 2,4 --json --compact
kaabalah iching:reading --input-json='{"hexagramNumber":25,"movingLines":[4]}' --json --compact
kaabalah iching:reading --lines 767987 --json --compact --fields=lineCode,lineTransforms,oracle
```

The CLI also accepts `lines` as a six-number JSON array. It rejects ambiguous combinations of `lines` and hexagram/moving inputs. JSON stdout contains exactly one document; these commands never initialize the ephemeris runtime. Human mode uses the deterministic `formatRecord()` helper.

## Sources and validation

The tests cover palace and gate reference fixtures, every subset of moving lines,
and nuclear hexagrams for all 64 figures. Transformation cases verify both the
destination-palace and original-cast relative frames.

Chinese text is the ancient public-domain Zhou Yi and 大象, extracted from [Kanripo KR1a0001](https://github.com/kanripo/KR1a0001/tree/8284adbf9e3435d713180e24f05bf75f8b7d1d96), pinned at that revision. Judgment, Great Image, and line passages are extracted independently; 彖傳, 小象 and 文言 commentary are not imported. The original punctuation and textual variants are retained, including 无, #26 利己 and #49 巳日. This specifies a reproducible edition; it does not claim that received editions have no variants. For example, [Wikisource 革](https://zh.wikisource.org/zh/周易/革) prints 已日. English renderings were written for this module directly from the Chinese, without importing Wilhelm/Baynes or the site's English prose. These are literal renderings, not forecasts or interpretation.

Verify all 514 Chinese passages against the pinned source:

```sh
python3 scripts/verify-iching-chinese.py
# Or use previously downloaded KR1a0001_NNN.txt chapters, named NNN.txt:
python3 scripts/verify-iching-chinese.py --cache /path/to/chapters
```

The site's Wade-Giles forms were checked against the 64 numbered [I Ching Online](https://www.ichingonline.net/) reading headings on 15-11-2026; descriptive parenthetical labels were excluded. Common pinyin display forms and the 解 reading were cross-checked with [UAYA's own hexagram index](https://uaya.org/zh/iching/hexagrams/); 小畜's xù reading is given by the [Ministry of Education dictionary](https://dict.revised.moe.edu.tw/dictView.jsp?ID=106936&la=0&powerMode=0), and 噬嗑's hé reading by [Wiktionary](https://zh.wiktionary.org/zh-hant/噬嗑). Alternate readings are preserved explicitly rather than used as identities.

### Portuguese classical text

`getHexagramText(number, language?)` returns judgment, image, six lines and any useNine/useSix, with a selected `.content` field beside unchanged `.chinese` and `.english`. `getIChingReadingContent(input, language?)` applies the same selection to oracle, cast, transformed and nuclear texts. English is the default; `pt` and `pt-BR` select Portuguese. Unknown hexagram numbers return undefined from `getHexagramText`. Portuguese classical texts are drafts pending author review; see `docs/localization/iching-review.json`.
