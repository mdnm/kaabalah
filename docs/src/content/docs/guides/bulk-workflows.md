---
title: Bulk and collection workflows
description: Compute many people, events and pairs from one manifest without recomputing charts, with deterministic output, cancellation and streaming.
sidebar:
  order: 5
---

When you compare N people there are N(N-1)/2 pairs. The library computes each person's natal chart **once** and reuses it for every pair.

## All pairs from a manifest

```typescript
import { computeCollection } from 'kaabalah/astrology';
import { toMarkdownTable, toTable } from 'kaabalah';

const utc = { treatAsUTC: true };
const result = await computeCollection({
  people: [
    { id: 'a', chart: { date: { year: 1985, month: 3, day: 14, hour: 9, minute: 30 }, latitude: 40, longitude: -3, timeZoneSettings: utc } },
    { id: 'b', chart: { date: { year: 1992, month: 11, day: 2, hour: 22, minute: 5 }, latitude: 48, longitude: 2, timeZoneSettings: utc } },
    { id: 'c', chart: { date: { year: 1978, month: 7, day: 30, hour: 4, minute: 45 }, latitude: -23, longitude: -46, timeZoneSettings: utc } },
    { id: 'd', chart: { date: { year: 2001, month: 1, day: 20, hour: 12 }, latitude: 0, longitude: 0, timeZoneSettings: utc }, quality: 'untimed' },
  ],
  pairs: { mode: 'all' }, // 4 people -> 6 pairs, 4 chart computations
});

const rows = result.pairs.map((p) => ({ a: p.idA, b: p.idB, ok: p.ok, aspects: p.ok ? p.aspectCount : null, partial: p.ok ? p.partial : null }));
console.log(toMarkdownTable(toTable(rows, [{ key: 'a' }, { key: 'b' }, { key: 'ok', type: 'boolean' }, { key: 'aspects', type: 'integer' }, { key: 'partial', type: 'boolean' }])));
```

Real output:

```text
| a | b | ok | aspects | partial |
| --- | --- | --- | ---: | --- |
| a | b | true | 125 | false |
| a | c | true | 117 | false |
| a | d | true | 89 | true |
| b | c | true | 122 | false |
| b | d | true | 109 | true |
| c | d | true | 107 | true |
```

`result.summary.pairs` was `{ total: 6, ok: 6, unavailable: 0, partial: 3, aspects: 669 }`. The pairs with `d` are `partial`: an untimed person's Moon and angles are withheld (listed in `excludedPoints`).

## What the manifest guarantees

- **IDs are yours.** They are preserved verbatim, must be unique, and are the only identifier (manifests carry no names).
- **Deterministic order**: people and events in manifest order, pairs ordered by manifest index (`i < j`), whatever order the work finished in.
- **Pair selection**: `{ mode: 'all' }`, `{ mode: 'pairs', pairs: [['a', 'c'], ['b', 'c']] }` or `{ mode: 'timed-only' }` (every pair among `recorded` and `rectified` people).
- **Per-item availability**: a person whose input is invalid becomes `{ ok: false, error }`; every pair involving them is `{ ok: false, error: { code: 'PERSON_UNAVAILABLE' }, unavailablePeople }`. Nothing is dropped silently.
- **Up-front validation**: duplicate IDs, unknown pair IDs, self-pairs and oversized manifests throw `CollectionError` (`DUPLICATE_ID`, `UNKNOWN_PAIR_ID`, `SELF_PAIR`, `MANIFEST_TOO_LARGE`, `INVALID_MANIFEST`, `INVALID_OPTION`) before any chart is computed.
- **Limits**: 500 people, 1,000 events, 125,000 pairs, 64 concurrent tasks (`COLLECTION_HARD_LIMITS`); `options.limits` can only lower them.

## Streaming, progress and cancellation

`iterateCollection(manifest, options)` is a pull-based async generator that yields every person, then every event, then every pair, then one summary record. Serialise each record to one line for NDJSON:

```typescript
import { iterateCollection } from 'kaabalah/astrology';

for await (const record of iterateCollection({ people, pairs: { mode: 'pairs', pairs: [['a', 'c'], ['b', 'c']] } })) {
  process.stdout.write(JSON.stringify(record) + '\n');
}
```

For that run the record types, in order, were `person, person, person, pair, pair, summary`. Cancel with a standard `AbortSignal` (`{ signal }`); the iterator then rejects with `CollectionAbortError` (`name: "AbortError"`, `code: "ABORTED"`). `onProgress({ phase, completed, total, id })` reports progress in deterministic emission order. `concurrency` (default 4) bounds the tasks in flight and how far results run ahead of the consumer. Swiss Ephemeris is synchronous WebAssembly, so concurrency does not make the ephemeris itself parallel.

## Already-computed charts

If you hold charts already, use `precomputed` in the manifest, or call the pure functions directly. They do no ephemeris work:

```typescript
import { getBirthChart, getSynastryFromCharts } from 'kaabalah/astrology';

const charts = await Promise.all(people.map((p) => getBirthChart(p.chart))); // N calls
const summary = getSynastryFromCharts(charts[0], charts[1], { omitCharts: true, ids: { a: 'a', b: 'b' } });
```

`getCompositeFromCharts`, `getHouseOverlays`, `getTransitChartFromChart` and `derivedChartAspectPoints` work the same way. `omitCharts: true` returns lightweight references (`dateUtc`, `houseSystem`, your ID) instead of duplicating whole charts on every edge.

## Caching

`buildChartCacheKey` includes every input that can change a result (full date and timezone semantics, coordinates, quality, house systems, point selection, orb policy, frame, node convention, year length, GC constants, ephemeris identity, package version); a person's ID is never a key. `createBoundedMemo({ maxEntries })` is a small LRU for those keys. See [Cache keys](/modules/astrology/#24-cache-keys).

## Mixed frames in one process

Sidereal mode is process-wide state inside Swiss Ephemeris. The library only changes it inside synchronous scopes (`withSwissEphState`, Jyotish's `withSiderealMode`) and restores the defaults before returning, so tropical, Lahiri and Dhruva calculations running concurrently cannot contaminate each other. The default collection pair computation is pure tropical geometry. If you inject a Jyotish-aware `computeChart`, keep any Swiss state change inside a synchronous scope.

## Not included

Person-by-event transit contacts are not computed: events are calculated and listed, but only pairs of people receive aspects. There is no CLI-level bulk command described here; see the [CLI reference](/getting-started/cli/) for what the CLI offers.
