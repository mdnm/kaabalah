---
title: Tattwa
description: Calculate sunrise-anchored Tatwameter periods and render single and nested tattwa SVGs with kaabalah/tattwa.
---

`kaabalah/tattwa` implements the Tatwameter described by Arnold Krumm-Heller in *O Tatwametro*. The five tattwas follow each other in fixed 24-minute periods, starting with Akash at local sunrise:

| Order | ID | Tattwa | Symbol | SVG colour |
|------:|----|--------|--------|------------|
| 1 | `akash` | Akash | Egg (ellipse) | Black |
| 2 | `vayu` | Vayu | Circle | Blue |
| 3 | `tejas` | Tejas | Triangle | Red |
| 4 | `prithvi` | Prithvi | Square | Yellow |
| 5 | `apas` | Apas | Crescent | Silver grey |

One full cycle takes 120 minutes. The cycle repeats without a break through the day and the night until the next sunrise, which starts a new Akash period. `TATTWA_ORDER` exports the five IDs in this order.

## Schedule at a location

`getTattwaSchedule({ date, latitude, longitude })` finds the solar day that contains `date` at the given coordinates and returns every period in it. It uses Swiss Ephemeris, so initialise the ephemeris first.

```ts
import { getSwissEph } from "kaabalah/astrology";
import { getTattwaSchedule } from "kaabalah/tattwa";

await getSwissEph();

const schedule = await getTattwaSchedule({
  date: new Date("2024-02-24T07:00:00+01:00"),
  latitude: 41.39,
  longitude: 2.17,
});

if (schedule.available) {
  console.log(schedule.sunrise.toISOString());      // 2024-02-23T06:35:39.718Z
  console.log(schedule.nextSunrise.toISOString());  // 2024-02-24T06:34:11.169Z
  console.log(schedule.periods.length);             // 60
  console.log(schedule.current);
  // { tattwa: "prithvi", start: 2024-02-24T05:47:39.718Z, end: 2024-02-24T06:11:39.718Z }
}
```

In this example, 07:00 in Barcelona (06:00 UTC) is still before that morning's sunrise at 06:34 UTC. The schedule therefore belongs to the solar day that began at the previous sunrise, and the current period is Prithvi.

### Sunrise and day boundary

- **Sunrise** is the moment the Sun's upper limb crosses the horizon, with standard atmospheric refraction, at the given latitude and longitude. This is the almanac sunrise. The method block records it as `sunriseDefinition: "upper-limb-with-refraction"`. There is no input for elevation above sea level or for local horizon obstructions.
- **The solar day** runs from one sunrise to the next. An instant before dawn belongs to the previous sunrise's day.
- **Intervals** include their start and exclude their end. The instant of a sunrise belongs to the new day's first Akash period.
- **The last period** ends at the next sunrise. The length of a solar day is rarely a multiple of 24 minutes, so the last period is usually shorter. In the example above it lasts about 22.5 minutes.

### Time zones

The library works with `Date` instants and needs no time zone. A sunrise depends only on the instant and the coordinates. All returned times are `Date` objects, which serialise as UTC ISO strings. Format them in the observer's time zone for display, for example with `Intl.DateTimeFormat` and an IANA zone such as `Europe/Madrid`.

When you build the input `Date` from a string, include `Z` or a UTC offset. A string without one is read in the time zone of the machine running the code.

### Result fields

When consecutive sunrises are found, the result has `available: true` and these fields:

| Field | Type | Meaning |
|-------|------|---------|
| `available` | `true` | A schedule was calculated |
| `method` | object | The convention used (see below) |
| `date` | `Date` | The instant you asked about |
| `sunrise` | `Date` | The sunrise that starts the solar day containing `date` |
| `nextSunrise` | `Date` | The sunrise that ends it |
| `periods` | array | Every period from `sunrise` to `nextSunrise`, in order. Each is `{ tattwa, start, end }` |
| `current` | object | The period that contains `date` |
| `latitude`, `longitude` | number | The coordinates you passed |

`method` is `TATTWA_METHOD`:

```json
{
  "name": "Tatwameter",
  "source": { "title": "O Tatwametro", "author": "Arnold Krumm-Heller" },
  "anchor": "local-sunrise",
  "periodMinutes": 24,
  "cycleMinutes": 120,
  "interval": "start-inclusive-end-exclusive",
  "sunriseDefinition": "upper-limb-with-refraction"
}
```

### Polar days and nights

Near the poles, the Sun can stay above or below the horizon for more than a day. When there are no two consecutive sunrises around `date`, or they are more than 36 hours apart, the function returns `available: false` instead of throwing:

```ts
const polar = await getTattwaSchedule({
  date: new Date("2024-06-21T12:00:00Z"),
  latitude: 78.22,
  longitude: 15.65,
});
// { available: false, method, date, latitude: 78.22, longitude: 15.65, reason: "no-consecutive-sunrises" }
```

Check `available` before reading `periods`. An invalid date, a latitude outside -90 to 90 or a longitude outside -180 to 180 throws `TattwaError` (code `INVALID_ARGUMENT`).

## Schedule from your own sunrises

`calculateTattwaSchedule(sunrise, nextSunrise, date?)` builds the same sequence from sunrise instants you supply, for example from another almanac. It needs no ephemeris and is synchronous. `date` defaults to `sunrise`.

```ts
import { calculateTattwaSchedule } from "kaabalah/tattwa";

const schedule = calculateTattwaSchedule(
  new Date("2024-02-24T06:00:00Z"),
  new Date("2024-02-25T06:00:00Z"),
  new Date("2024-02-24T06:30:00Z"),
);

schedule.periods.length;   // 60
schedule.current.tattwa;   // "vayu" (06:24 to 06:48 UTC)
```

The result has the same fields as above, without `latitude` and `longitude`. It throws `TattwaError` unless `sunrise <= date < nextSunrise` and the two sunrises are at most 36 hours apart.

## SVG symbols

`generateTattwaSvg(tattwa, { inner?, size? })` returns one standalone SVG string. The background is transparent, and the SVG has `role="img"` and a `<title>` naming the tattwa.

```ts
import { generateTattwaSvg } from "kaabalah/tattwa";

const square = generateTattwaSvg("prithvi");
const nested = generateTattwaSvg("vayu", { inner: "tejas" });
const small = generateTattwaSvg("apas", { size: 64 });
```

| Option | Default | Meaning |
|--------|---------|---------|
| `inner` | none | A second tattwa drawn inside the main one, in its own colour |
| `size` | `256` | Length of the longest side in pixels, an integer from 1 to 4096 |

### Nested symbols

Each of the five tattwas can hold any of the other four, which gives 20 combinations. The outer symbol takes the colour of the main tattwa and the inner symbol the colour of `inner`. The title reads "inner in outer", for example `tejas in vayu`. Passing the same ID for both returns the single symbol.

Some combinations use their own proportions, so the symbol's width and height can differ from the single version. `size` always applies to the longest side, and the other side keeps the proportion:

| Main tattwa | Single shape (width × height) | Nested shape |
|-------------|-------------------------------|--------------|
| `akash` | 64 × 100 | 65 × 100 |
| `vayu` | square | square |
| `tejas` | square | 82 × 100 |
| `prithvi` | square | square |
| `apas` | 100 × 41 | 100 × 40 |

At the default size, a single `apas` is 256 × 105 pixels and a single `akash` is 164 × 256. An unknown tattwa ID or a `size` outside 1–4096 throws `TattwaError`.

## CLI

```sh
kaabalah tattwa:schedule 2024-02-24T07:00:00+01:00 --lat=41.39 --lon=2.17 --json --compact --fields=current
kaabalah tattwa:schedule 2024-02-24T07:00:00+01:00 --lat=41.39 --lon=2.17 --timezone=Europe/Madrid --no-json
kaabalah tattwa:svg vayu --inner=tejas --no-json
kaabalah tattwa:svg prithvi --inner=apas --output=tattwa.svg --json --compact
```

### tattwa:schedule

| Argument or flag | Meaning |
|------------------|---------|
| `<instant>` | ISO timestamp with `Z` or a UTC offset, such as `2024-02-24T07:00:00+01:00`. A timestamp without one exits with `INVALID_DATE` |
| `--lat`, `--lon` | Observer coordinates |
| `--location` | Place name to geocode instead of coordinates (needs network access and `GOOGLE_MAPS_API_KEY`) |
| `--timezone` | IANA time zone for the text output. Defaults to the zone of the coordinates |
| `--wasm-path`, `--ephe-path` | Override the bundled Swiss Ephemeris files |

The JSON output adds a `timeZone` field and, when using `--location`, a `resolvedLocation` field. JSON instants are always UTC. The text output formats each period in the selected time zone.

```text
Tatwameter schedule · Europe/Madrid
2024-02-23 07:35:39 → 2024-02-23 07:59:39 · akash
2024-02-23 07:59:39 → 2024-02-23 08:23:39 · vayu
...
```

An unknown time zone exits with `INVALID_ARGUMENT`. The command is deterministic: the instant is always required and nothing defaults to the current time.

### tattwa:svg

| Argument or flag | Meaning |
|------------------|---------|
| `<tattwa>` | `akash`, `vayu`, `tejas`, `prithvi` or `apas` |
| `--inner` | Tattwa to draw inside the main symbol |
| `--size` | Longest side in pixels, 1–4096, default 256 |
| `--output` | File to write the SVG to |

With `--no-json` and no `--output`, the command prints the raw SVG, so you can redirect it to a file. In JSON mode it returns `{ tattwa, inner, svg }`, or `{ tattwa, inner, output }` when `--output` is given. `inner` is `null` when no inner tattwa was requested.

With `--input-json`, pass `instant` and the location keys for `tattwa:schedule`, or `tattwa`, `inner`, `size` and `output` for `tattwa:svg`.
