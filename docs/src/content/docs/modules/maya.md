---
title: Maya astrology
description: Calculate Tzolk’in days, Kenneth Johnson’s Calendar Board, natal Tree of Life, Feathered Serpent, timing, and relationship composites with kaabalah/maya.
---

`kaabalah/maya` follows the methods Kenneth Johnson presents in *Mayan Calendar Astrology: Mapping Your Inner Cosmos* (2011). These include the Calendar Board, directions, the five-point cross, the nine-point Feathered Serpent, the Road of Life, the personal lunar month, the Momostenango Year Lord, and the relationship composite. Calendar, natal, timing, and relationship reports credit the book in `method.source`.

Johnson credits the teachings he presents to Guatemalan daykeepers: Rigoberto Itzep Chanchavac of Momostenango for the chart and the Year Lord, Roberto Poz of Zunil for the Path of the Feathered Serpent, and Carlos Barrios and Cirilo Alejandro Oxlaj Pérez for the five-sign chart. He also notes that the origin of the five-sign chart is disputed.

## What is calendar and what is interpretation

- **Calendar arithmetic.** The Tzolk’in day of a civil date uses the GMT correlation constant 584283, which Johnson adopts and which places 2012-12-21 on 4 Ahau. The timing API also reports raw calendar matches based on equality of the day signs or of both sign and number.
- **Johnson’s technique.** Where the chart points sit, what the rows and hands mean, how the Road of Life divides a life, which dates form the personal lunar month, and how two charts combine into a composite follow the method Johnson presents.

The calendar calculations take a local civil date as `YYYY-MM-DD` or a `CivilDate`. Johnson counts the day from midnight and notes that astrologers disagree on whether that is local midnight or Central American midnight, so convert a birth instant to the civil date you want before passing it in. The optional Sun and Moon calculation takes a birth instant separately. Every date is an explicit argument.

```ts
import {
  getMayaCalendarDay,
  getMayaCalendarBoard,
  calculateMayaNatal,
  getMayaNatalReading,
  calculateMayaTiming,
  calculateMayaRelationship,
  getMayaSignDescription,
  getMayaToneDescription,
  getMayaRoleDescription,
  getMayaStageDescription,
} from "kaabalah/maya";

const day = getMayaCalendarDay("1961-08-18");        // 10 Manik
const board = getMayaCalendarBoard("1961-08-18");    // 20 × 13, that day highlighted
const natal = calculateMayaNatal("1961-08-18");
const natalReading = getMayaNatalReading(natal);    // nine positions and eight links
const timing = calculateMayaTiming("1952-04-21", { from: "2010-08-21", days: 29 });
const relationship = calculateMayaRelationship("1926-06-01", "1914-11-25");

const sign = getMayaSignDescription(natal.day.sign);  // { en, pt }
const tone = getMayaToneDescription(natal.day.tone);
```

## Day signs, numbers and directions

A Tzolk’in day is a number from 1 to 13 (the tone) and one of 20 day signs. Each day carries the Yucatec name, the K’iche’ name as Johnson prints it, and a direction.

The direction follows Johnson’s contemporary K’iche’ scheme. Counting from Chuen, the signs cycle East, West, North, South, so Chuen, Men, Cauac and Manik are East, and Imix is North. Johnson points out that other sources use different directional schemes; this module uses his only.

| Direction | Signs |
|-----------|-------|
| East | Chuen, Men, Cauac, Akbal, Manik |
| West | Eb, Cib, Ahau, Kan, Lamat |
| North | Ben, Caban, Imix, Chicchan, Muluc |
| South | Ix, Etznab, Ik, Cimi, Oc |

`getMayaCalendarDay(date)` returns the day of one civil date: its sign, tone, names, direction and position on the Calendar Board.

`getMayaSunsetWelcome(date, location?)` gives the incoming day sign and indicates whether it opens the next trecena. Supply latitude, longitude and optionally an IANA time zone to calculate sunset on the given local civil date. The time zone defaults to a lookup from the coordinates. This uses standard almanac sunset. If the Sun does not set that day, the incoming sign is still available. Initialising Swiss Ephemeris is needed only when calculating the sunset instant. Johnson’s calendar day is counted from civil midnight.

`getMayaDaySignReference(sign)` returns Johnson’s themes, direction, color, element, animal, body and plant associations. The body and plant entries are traditional symbolic correspondences. `listMayaDaySignReferences()` returns the full table in Calendar Board order. Each sign includes a PNG reference to one historical codex glyph variant and its figure label from Sylvanus G. Morley’s 1915 survey. [Day-sign glyph plate](https://commons.wikimedia.org/wiki/File:Maya_Hieroglyphs_Fig_17.jpg)

## Haab

`getMayaHaabDate(date, count?)` returns the named month, its zero-based day, the zero-based day of the year and the length of the month. The 365-day count has eighteen months of 20 days followed by the five days of Uayeb. Day 0 is the seating of each month.

- `momostenango` is the default and follows Johnson’s 0 Pop on 2010-02-22. `getMayaCalendarDay`, natal charts and timing rows use this count. The Haab day of the year agrees with `yearLord.daysSinceStart`.
- `classic-gmt` uses the Classic Long Count anchor of 8 Cumku with GMT 584283. On 2012-12-21 it gives 3 Kankin, while the Momostenango anchor gives 3 Pax. Choosing the Classic date in `maya:day` leaves the Year Lord on the Momostenango count. [Smithsonian Calendar Round example](https://maya.nmai.si.edu/2012-resetting-count/meaning-of-2012)

`getMayaHaabMonthReference(month)` and `listMayaHaabMonthReferences()` add PNG glyph references for the 19 months. [Haab month glyph plate](https://commons.wikimedia.org/wiki/File:Maya_Hieroglyphs_Fig_20.jpg)

## Calendar Board

`getMayaCalendarBoard(date?)` returns Johnson’s Calendar Board: 20 rows, one per day sign, and 13 columns of time. The board starts at 8 Chuen, as Johnson draws it, and runs down each column before moving to the next, so the 260 days read in order. The cycle itself has no natural first day; 8 Chuen is Johnson’s choice of origin. Pass a civil date to mark that day on the board. Without a date, the board has no highlight.

## Natal chart

`calculateMayaNatal(birth)` gives the birth day and Johnson’s chart built around it.

**Five-point cross.** The birth day sits at the centre. Conception is above it, destiny below, and the right and left hands at its sides. Each point is the birth day moved by a fixed number of days, applied to the sign and the tone together:

| | Right hand | Centre | Left hand |
|---|---:|---:|---:|
| Conception | | −8 | |
| Birth | −6 | 0 | +6 |
| Destiny | | +8 | |

Johnson writes these counts as seven and nine days, counting the first day, which is six and eight days apart. Conception speaks of family inheritance and the past; its offset does not estimate a conception date. In his diagrams the right hand, the rational and outward side, is drawn on the viewer’s left, and the left hand, the intuitive and inward side, on the viewer’s right.

**Tree of Life and Feathered Serpent.** The full chart has three rows of three points, youth, adult and mature, with the corner points at −14, −2, +2 and +14 days. `tree` holds the nine points by row and column. `featheredSerpent` holds the same nine points ordered by date, from −14 to +14, which is the path Johnson draws zigzagging across the three columns.

Johnson’s chart for 1926-06-01 shows the whole tree:

| | Right hand | Centre | Left hand |
|---|---|---|---|
| Youth | 4 Chuen | 10 Caban | 3 Akbal |
| Adult | 12 Cauac | 5 Chicchan | 11 Chuen |
| Mature | 7 Manik | 13 Ben | 6 Cauac |

**Year Lord.** `yearLord` is the Tzolk’in day that opens the current year in the 365-day Momostenango count, with no leap day, and the number of days since it began. The year-opening signs rotate through Ik, Manik, Eb and Caban. The count is anchored on 2010-02-22 = 11 Manik. Johnson groups the 20 signs into five Year Lord families, every fifth sign from Chuen.

`trecena` is the day that opens the 13-day sequence the birth day belongs to.

**Natal reading.** `getMayaNatalReading(natal)` supplies a bilingual role, sign and tone for each of the nine positions. The four corner guardians describe practical or intuitive support for the Conception and Destiny Signs. Its eight `connections` follow the Feathered Serpent in Calendar Board order. Each link names `from` and `to` and gives a prompt for reading the two sign-and-number combinations together. The position and link readings are labeled `synthesis`. In Johnson’s example, the first link from 4 Chuen to 10 Caban connects Chuen’s performing arts and the practical right pillar with Caban’s intellectual concerns. Further along the path, 11 Chuen on the intuitive side feeds 13 Ben at destiny, and 6 Cauac supports 13 Ben from the mature left.

## Sun and Moon at birth

Johnson reads the Sun’s four daily intervals for reason and worldly action, and the Moon’s four phases for emotion and intuition. `calculateMayaBirthCycles` calculates them from a JavaScript `Date` after Swiss Ephemeris initialization. `getMayaBirthCycleReading` returns their English and Brazilian Portuguese descriptions.

```ts
import { getSwissEph } from "kaabalah/astrology";
import { calculateMayaBirthCycles, getMayaBirthCycleReading } from "kaabalah/maya";

await getSwissEph();
const cycles = await calculateMayaBirthCycles({
  instant: new Date("2024-04-08T13:17:00-05:00"),
  location: { latitude: 32.78, longitude: -96.80 },
});
const reading = getMayaBirthCycleReading(cycles);
```

- **Solar quarter.** The calculation uses local lower and upper solar meridian transits for midnight and noon, with refracted upper-limb sunrise and sunset at sea level. Intervals include their opening station and end at the next station. With no coordinates, `solar` is `null`. When a complete sequence of stations is unavailable, as in polar day or night, `solar.available` is `false` and the Moon calculation still applies.
- **Lunar phase.** Geocentric apparent Moon–Sun ecliptic elongation defines new and full Moon windows of ±22.5° around 0° and 180°. The rest of the waxing and waning arcs use their respective descriptions. These windows reuse the library’s phase convention. Johnson describes the phases qualitatively, and the result’s `method` records the numerical boundaries used here.

## Timing

`calculateMayaTiming(birth, { from, days })` reads 1 to 260 consecutive civil dates starting at `from`. Each date reports:

- **Road of Life.** Johnson assigns the first 26 years of life to the youth row, the next 26 to the adult row, ages 52 to 78 to the mature row, and returns to the top at 78. The module counts completed years in half-open ranges (0–26, 26–52, 52–78) and repeats every 78 years. A February 29 birthday advances on March 1 in a common year.
- **Personal lunar month.** Johnson’s 29-day window starts on a day with the same sign and number as the first Feathered Serpent point and repeats every 260 days. Its nine observance days are the nine serpent points in order. The calculation uses Tzolk’in dates throughout.
- **Trecena.** Each date includes the tone-1 day that opens its current thirteen-day cycle. Pass the current date’s `day.tone` to `getMayaTrecenaGuidance` for its place in the ceremonial cycle.
- **Raw matches.** Whether the day’s sign matches any tree point, whether sign and number match one exactly, whether the tone equals the birth tone, and whether the sign matches the one that opens the birth trecena. These are calendar facts for a caller to filter, not readings.

Johnson’s own example: for a person born 1952-04-21 (10 Imix), the month that starts 2010-08-21 (9 Manik) marks August 27 (2 Ben), August 29 (4 Men), September 2 (8 Cauac), September 4 (10 Imix), September 6 (12 Akbal), September 10 (3 Manik), September 12 (5 Muluc) and September 18 (11 Men).

## Relationship composite

`calculateMayaRelationship(first, second)` reports two observations Johnson keeps separate, whether the two birth days share a direction and whether they share a Year Lord family, and then builds his composite.

The composite adds the two birth signs, numbered 1 to 20 from Chuen as Johnson numbers them, and wraps over 20. It adds the two tones and wraps over 13. That day is the composite’s centre, and the ordinary five-point offsets give its conception, destiny and hands. Swapping the two inputs preserves the composite and both compatibility indicators. The composite describes five symbolic positions.

`natalOverlap.first` and `natalOverlap.second` list the composite signs that also appear in each person’s five-point natal cross. Each match gives the sign, its `compositeRole` and its `natalRole`. The same sign can appear in a different role and carry a different tone. Swapping the inputs swaps the two natal comparisons.

| Johnson’s example | Centre | Conception | Right hand | Left hand | Destiny |
|-------------------|--------|------------|------------|-----------|---------|
| 1926-06-01 and 1914-11-25 | 3 Ix | 8 Cimi | 10 Lamat | 9 Ahau | 11 Ik |
| 1926-06-01 and 1915-11-17 | 9 Chuen | 1 Akbal | 3 Chicchan | 2 Caban | 4 Cauac |

Johnson reads the first chart’s 3 Ix centre as a fragile foundation despite the potential in the two hands. In that context, 11 Ik at destiny intensifies his concern about anger. In the second chart he reads the 9 Chuen centre as favorable and observes that Chuen, Chicchan, Caban and Cauac recur in the first person’s natal cross. He reads those recurrences as a potential for the relationship to bring out qualities that are already present in her chart.

## Descriptions

`getMayaSignDescription(sign)`, `getMayaToneDescription(tone)`, `getMayaRoleDescription(role)` and `getMayaStageDescription(stage)` return short `{ en, pt }` texts for a sign, a tone, a cross position and a Road of Life row.

`getMayaYearLordDescription(sign)` describes people born under Ik, Manik, Eb or Caban as Year Lord. Other signs return `null`. `maya:natal` uses the profile of the birth Year Lord.

`getMayaYearLordReading(yearLord.day)` returns that profile and a bilingual `numberModifier`. Johnson applies the number to the Year Lord as he applies it to a birth sign. For example, he describes 6 Eb as giving stable, practical expression to Eb, and 13 Caban as giving greater scope to intuition and the mystical side of Caban’s intellectual nature. The 13 general modifiers are labeled `synthesis`.

`getMayaPersonalLunarMonthGuidance(day)` takes the sign and tone of an already calculated observance and returns `{ basis, description: { en, pt } }`. `published-example` refers to an exact sign-and-tone pair in Johnson’s worked personal lunar month. `day-sign-practice` uses his general ceremonial guidance for the sign. Both are original summaries. Use the timing result’s `personalLunarMonth.point` to identify the nine observances.

`getMayaTrecenaGuidance(tone)` returns `{ en, pt }` for the ceremonial rhythm of the current cycle. Days 1–5 build in strength, days 6–9 are balanced, and days 10–13 become more intense. Examples of particular rites name the sign and number they require. The sunset welcome on day 13 is a ceremonial observance. Calendar dates in the API still use civil midnight.

`getMayaRelationshipReading(result)` takes the result of `calculateMayaRelationship` and returns `{ en, pt }` texts for each composite position’s role, sign and tone, both affinity indicators, and each person’s natal comparison. The position and tone texts synthesize Johnson’s chart components for a relationship. The natal comparison text extends the approach in his worked example. Use the result’s `basis` fields to identify this synthesis.

## Notes on the source

- Johnson prints 2029-02-28 as the start of the next Calendar Round. Counting 52 years of 365 days from 1977-03-02 (4 Ik) gives 2029-02-17 (4 Ik), which is what the module returns.
- His Appendix B sample prints June 12 where the sequence requires June 26, 1995 (12 Eb).

## CLI

```sh
kaabalah maya:day 1961-08-18 --json --compact
kaabalah maya:day 2012-12-21 --haab-count classic-gmt --glyphs --json --compact
kaabalah maya:sign chuen --json --compact
kaabalah maya:board 1961-08-18 --json --compact
kaabalah maya:natal 1961-08-18 --json --compact
kaabalah maya:natal 2024-04-08 --instant 2024-04-08T13:17:00-05:00 --lat 32.78 --lon=-96.80 --json --compact
kaabalah maya:timing 1952-04-21 2010-08-21 --days 29 --json --compact
kaabalah maya:relationship 1926-06-01 1914-11-25 --json --compact
```

See the [CLI reference](/getting-started/cli/#maya-commands) for the arguments of each command.

`maya:natal` returns the position and link readings under `descriptions.positions` and `descriptions.connections`. When `--instant` is supplied, it adds `birthCycles` and `descriptions.birthCycles`. The timestamp must include an offset and its local date must match the birth argument.

`maya:timing` prints the trecena opener at the start of the requested range and whenever it changes. Its JSON output includes localized guidance at `descriptions.trecena`, keyed by the `dates[].day.tone` values present in the range.

`maya:relationship` prints the reading and the shared signs for each person. JSON places the calculated matches in `natalOverlap` and the localized reading in `descriptions`.
