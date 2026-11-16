import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { BirthChart, BirthChartOptions } from "./index";
import { getBirthChart } from "./index";
import {
  COLLECTION_HARD_LIMITS,
  CollectionAbortError,
  CollectionError,
  type CollectionManifest,
  type CollectionProgress,
  type CollectionRecord,
  type ChartComputer,
  type PairComputer,
  computeCollection,
  defaultPairComputer,
  getEligiblePairPoints,
  iterateCollection,
} from "./collection";
import { closeSwissEph, getSwissEph } from "./swisseph";

/** Synthetic chart whose longitudes derive from a seed (no ephemeris). */
function fakeChart(seed: number): BirthChart {
  const lon = (k: number) => (seed * 37 + k * 53) % 360;
  const pos = (longitude: number) => ({ longitude, sign: "x", decimalDegrees: 0, traditionalFormat: "", decimal: "", house: 1 });
  const planets: Record<string, unknown> = {};
  ["sun", "moon", "mercury", "venus", "mars"].forEach((name, k) => {
    planets[name] = { longitude: lon(k), zodiacPosition: pos(lon(k)) };
  });
  return {
    planets,
    nodes: {},
    houses: { ascendant: pos(lon(10)), mc: pos(lon(11)), dc: pos(0), ic: pos(0), houses: [] },
    aspects: [],
  } as unknown as BirthChart;
}

const input = (lat: number): BirthChartOptions => ({
  date: { year: 1990 + (Math.abs(lat) % 10), month: 3, day: 14, hour: 9 },
  latitude: lat,
  longitude: 10,
  timeZoneSettings: { utcOffsetMinutes: 0 },
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function countingChartFn(delays?: (lat: number) => number) {
  const calls: number[] = [];
  const fn: ChartComputer = async (opts) => {
    calls.push(opts.latitude);
    if (delays) await sleep(delays(opts.latitude));
    if (opts.latitude < 0) throw Object.assign(new Error("bad place"), { code: "BAD_PLACE" });
    return fakeChart(opts.latitude);
  };
  return { fn, calls };
}

const people = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ id: `p${i + 1}`, chart: input(i + 1) }));

describe("computeCollection", () => {
  it("computes each person once for all N(N-1)/2 pairs", async () => {
    const { fn, calls } = countingChartFn();
    const result = await computeCollection({ people: people(6) }, { computeChart: fn });
    expect(calls.length).toBe(6);
    expect(new Set(calls).size).toBe(6);
    expect(result.pairs.length).toBe(15);
    expect(result.summary.pairs.total).toBe(15);
    expect(result.people.map((p) => p.id)).toEqual(["p1", "p2", "p3", "p4", "p5", "p6"]);
  });

  it("does not compute precomputed charts at all", async () => {
    const { fn, calls } = countingChartFn();
    const result = await computeCollection(
      { people: [{ id: "a", precomputed: fakeChart(1) }, { id: "b", chart: input(2) }] },
      { computeChart: fn }
    );
    expect(calls).toEqual([2]);
    expect(result.pairs[0].ok).toBe(true);
  });

  it("orders pairs by manifest index and is independent of completion order", async () => {
    const manifest: CollectionManifest = { people: people(5) };
    const fast = await computeCollection(manifest, { computeChart: countingChartFn().fn, concurrency: 1 });
    // Earlier people are slower, so completion order is reversed.
    const shuffled = await computeCollection(manifest, {
      computeChart: countingChartFn((lat) => (6 - lat) * 4).fn,
      concurrency: 5,
      computePair: async (a, b, ctx) => {
        await sleep(((a.index * 7 + b.index * 3) % 5) * 2);
        return defaultPairComputer(a, b, ctx);
      },
    });
    expect(shuffled.pairs.map((p) => [p.idA, p.idB])).toEqual(fast.pairs.map((p) => [p.idA, p.idB]));
    expect(JSON.stringify([shuffled.people, shuffled.pairs])).toBe(JSON.stringify([fast.people, fast.pairs]));
    const order = fast.pairs.map((p) => `${p.indexA}-${p.indexB}`);
    expect(order[0]).toBe("0-1");
    expect(order[order.length - 1]).toBe("3-4");
  });

  it("reports a failed person and keeps the batch going", async () => {
    const { fn } = countingChartFn();
    const manifest: CollectionManifest = {
      people: [
        { id: "p1", chart: input(1) },
        { id: "bad", chart: input(-5) },
        { id: "p3", chart: input(3) },
      ],
    };
    const result = await computeCollection(manifest, { computeChart: fn });
    const bad = result.people[1];
    expect(bad).toMatchObject({ id: "bad", ok: false, error: { code: "BAD_PLACE", message: "bad place" } });
    expect(result.people[0].ok && result.people[2].ok).toBe(true);
    expect(result.pairs).toHaveLength(3);
    const withBad = result.pairs.filter((p) => p.idA === "bad" || p.idB === "bad");
    expect(withBad).toHaveLength(2);
    for (const p of withBad) {
      expect(p.ok).toBe(false);
      if (!p.ok) {
        expect(p.error.code).toBe("PERSON_UNAVAILABLE");
        expect(p.unavailablePeople).toEqual(["bad"]);
        expect(p.error.message).toContain("bad place");
      }
    }
    expect(result.pairs.find((p) => p.idA === "p1" && p.idB === "p3")?.ok).toBe(true);
    expect(result.summary.people).toEqual({ total: 3, ok: 2, failed: 1 });
    expect(result.summary.pairs).toMatchObject({ total: 3, ok: 1, unavailable: 2 });
  });

  it("selects specified pairs, normalised and de-duplicated in manifest order", async () => {
    const result = await computeCollection(
      { people: people(4), pairs: { mode: "pairs", pairs: [["p4", "p1"], ["p2", "p3"], ["p1", "p4"]] } },
      { computeChart: countingChartFn().fn }
    );
    expect(result.pairs.map((p) => [p.idA, p.idB])).toEqual([["p1", "p4"], ["p2", "p3"]]);
  });

  it("timed-only skips untimed/partial people and lists them", async () => {
    const result = await computeCollection(
      {
        people: [
          { id: "t1", chart: input(1) },
          { id: "u1", chart: input(2), quality: "untimed" },
          { id: "t2", chart: input(3), quality: "rectified" },
          { id: "x1", chart: input(4), quality: "partial" },
        ],
        pairs: { mode: "timed-only" },
      },
      { computeChart: countingChartFn().fn }
    );
    expect(result.pairs.map((p) => [p.idA, p.idB])).toEqual([["t1", "t2"]]);
    expect(result.summary.skippedPeople.map((s) => s.id)).toEqual(["u1", "x1"]);
    expect(result.people).toHaveLength(4);
  });

  it("withholds Moon and angles for untimed people in 'all' mode and flags the pair partial", async () => {
    const result = await computeCollection(
      { people: [{ id: "t", chart: input(1) }, { id: "u", chart: input(2), quality: "untimed" }] },
      { computeChart: countingChartFn().fn }
    );
    const u = result.people[1];
    expect(u.ok && u.excludedPoints).toEqual(["moon", "ascendant", "mc"]);
    expect(u.ok && u.points.moon).toBeUndefined();
    expect(u.ok && u.angles).toBeUndefined();
    const t = result.people[0];
    expect(t.ok && t.angles).toBeDefined();
    const pair = result.pairs[0];
    expect(pair.ok && pair.partial).toBe(true);
    if (pair.ok) {
      for (const e of pair.aspects) {
        expect(e.planetB).not.toBe("moon");
        expect(e.planetB).not.toBe("ascendant");
        expect(e.planetB).not.toBe("mc");
      }
    }
  });

  it("returns lightweight records by default and charts on request", async () => {
    const { fn } = countingChartFn();
    const light = await computeCollection({ people: people(2) }, { computeChart: fn });
    expect(JSON.stringify(light)).not.toContain('"chart"');
    expect(JSON.stringify(light.pairs[0])).not.toContain("planets");
    const full = await computeCollection({ people: people(2) }, { computeChart: fn, includeCharts: true });
    const p = full.people[0];
    expect(p.ok && p.chart?.planets).toBeDefined();
  });

  it("computes events once, in order, with default location", async () => {
    const seen: BirthChartOptions[] = [];
    const result = await computeCollection(
      {
        people: people(2),
        events: [
          { id: "e1", date: { year: 2020, month: 1, day: 1, hour: 12 } },
          { id: "e2", date: { year: 2021, month: 6, day: 1 }, latitude: 40, longitude: -3 },
        ],
      },
      {
        computeChart: async (o) => {
          seen.push(o);
          return fakeChart(o.latitude + 1);
        },
      }
    );
    expect(result.events.map((e) => e.id)).toEqual(["e1", "e2"]);
    expect(seen.filter((o) => o.timeZoneSettings?.treatAsUTC).length).toBe(2);
    expect(seen.length).toBe(4);
  });

  it("uses an injected pair function and copies its metadata", async () => {
    const pairFn: PairComputer = (a, b) => ({ aspects: [], metadata: { by: "custom", a: a.id, b: b.id } });
    const result = await computeCollection({ people: people(3) }, { computeChart: countingChartFn().fn, computePair: pairFn });
    const first = result.pairs[0];
    expect(first.ok && first.metadata).toEqual({ by: "custom", a: "p1", b: "p2" });
    expect(result.summary.method.pairComputation).toBe("custom");
  });

  it("turns a throwing pair function into a failed pair, not a failed batch", async () => {
    const result = await computeCollection(
      { people: people(3) },
      {
        computeChart: countingChartFn().fn,
        computePair: (a, b) => {
          if (a.id === "p1" && b.id === "p2") throw new Error("pair boom");
          return { aspects: [] };
        },
      }
    );
    expect(result.pairs[0]).toMatchObject({ ok: false, error: { code: "PAIR_FAILED", message: "pair boom" } });
    expect(result.pairs[1].ok).toBe(true);
  });
});

describe("manifest validation", () => {
  const run = (manifest: CollectionManifest, opts = {}) => computeCollection(manifest, { computeChart: countingChartFn().fn, ...opts });

  it("rejects duplicate ids", async () => {
    await expect(run({ people: [{ id: "a", chart: input(1) }, { id: "a", chart: input(2) }] })).rejects.toMatchObject({
      name: "CollectionError",
      code: "DUPLICATE_ID",
    });
    await expect(
      run({ people: people(1), events: [{ id: "e", date: { year: 2020, month: 1, day: 1 } }, { id: "e", date: { year: 2020, month: 1, day: 2 } }] })
    ).rejects.toMatchObject({ code: "DUPLICATE_ID" });
  });

  it("rejects unknown ids and self-pairs", async () => {
    await expect(run({ people: people(2), pairs: { mode: "pairs", pairs: [["p1", "zzz"]] } })).rejects.toMatchObject({ code: "UNKNOWN_PAIR_ID" });
    await expect(run({ people: people(2), pairs: { mode: "pairs", pairs: [["p1", "p1"]] } })).rejects.toMatchObject({ code: "SELF_PAIR" });
  });

  it("rejects oversized manifests before computing anything", async () => {
    const { fn, calls } = countingChartFn();
    const big = Array.from({ length: COLLECTION_HARD_LIMITS.maxPeople + 1 }, (_, i) => ({ id: `q${i}`, chart: input(1) }));
    await expect(computeCollection({ people: big }, { computeChart: fn })).rejects.toMatchObject({ code: "MANIFEST_TOO_LARGE" });
    await expect(
      computeCollection({ people: people(10) }, { computeChart: fn, limits: { maxPairs: 44 } })
    ).rejects.toMatchObject({ code: "MANIFEST_TOO_LARGE", details: { what: "pairs", count: 45, limit: 44 } });
    expect(calls).toHaveLength(0);
  });

  it("rejects missing/ambiguous chart sources, bad quality and bad options", async () => {
    await expect(run({ people: [{ id: "a" }] })).rejects.toMatchObject({ code: "INVALID_MANIFEST" });
    await expect(run({ people: [{ id: "a", chart: input(1), precomputed: fakeChart(1) }] })).rejects.toMatchObject({ code: "INVALID_MANIFEST" });
    await expect(run({ people: [{ id: "a", chart: input(1), quality: "weird" as never }] })).rejects.toMatchObject({ code: "INVALID_MANIFEST" });
    await expect(run({ people: [{ id: "", chart: input(1) }] })).rejects.toMatchObject({ code: "INVALID_MANIFEST" });
    await expect(run({ people: people(1) }, { concurrency: 0 })).rejects.toMatchObject({ code: "INVALID_OPTION" });
    await expect(run({ people: people(1) }, { limits: { maxPeople: COLLECTION_HARD_LIMITS.maxPeople + 1 } })).rejects.toMatchObject({ code: "INVALID_OPTION" });
  });

  it("iterateCollection throws validation errors synchronously", () => {
    expect(() => iterateCollection({ people: [{ id: "a" }] })).toThrow(CollectionError);
  });
});

describe("concurrency, progress and cancellation", () => {
  it("never exceeds the concurrency bound", async () => {
    let active = 0;
    let max = 0;
    const fn: ChartComputer = async (o) => {
      active++;
      max = Math.max(max, active);
      await sleep(3);
      active--;
      return fakeChart(o.latitude);
    };
    await computeCollection({ people: people(12) }, { computeChart: fn, concurrency: 3 });
    expect(max).toBeLessThanOrEqual(3);
    expect(max).toBeGreaterThan(1);
  });

  it("emits progress per phase with monotonic completed counts in deterministic id order", async () => {
    const events: CollectionProgress[] = [];
    await computeCollection(
      { people: people(3), events: [{ id: "e1", date: { year: 2020, month: 1, day: 1 } }] },
      { computeChart: countingChartFn((lat) => (4 - lat) * 3).fn, concurrency: 3, onProgress: (p) => events.push({ ...p }) }
    );
    expect(events.map((e) => e.phase)).toEqual(["people", "people", "people", "events", "pairs", "pairs", "pairs"]);
    expect(events.filter((e) => e.phase === "people").map((e) => [e.completed, e.total, e.id])).toEqual([
      [1, 3, "p1"],
      [2, 3, "p2"],
      [3, 3, "p3"],
    ]);
    expect(events.filter((e) => e.phase === "pairs").map((e) => [e.completed, e.id, e.ids])).toEqual([
      [1, "p1~p2", ["p1", "p2"]],
      [2, "p1~p3", ["p1", "p3"]],
      [3, "p2~p3", ["p2", "p3"]],
    ]);
  });

  it("aborts mid-batch with an AbortError-style error and stops scheduling", async () => {
    const controller = new AbortController();
    const { fn, calls } = countingChartFn();
    await expect(
      computeCollection(
        { people: people(20) },
        {
          computeChart: fn,
          concurrency: 2,
          signal: controller.signal,
          onProgress: (p) => {
            if (p.phase === "people" && p.completed === 3) controller.abort();
          },
        }
      )
    ).rejects.toSatisfy((e: unknown) => e instanceof CollectionAbortError && e.name === "AbortError" && e.code === "ABORTED");
    expect(calls.length).toBeLessThanOrEqual(3 + 2);
    expect(calls.length).toBeLessThan(20);
  });

  it("rejects immediately when the signal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    const { fn, calls } = countingChartFn();
    await expect(computeCollection({ people: people(3) }, { computeChart: fn, signal: controller.signal })).rejects.toMatchObject({ code: "ABORTED" });
    expect(calls).toHaveLength(0);
  });

  it("aborts while a slow computation is pending", async () => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 10);
    const started = Date.now();
    await expect(
      computeCollection(
        { people: people(2) },
        { computeChart: async (o) => (await sleep(2000), fakeChart(o.latitude)), signal: controller.signal }
      )
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(Date.now() - started).toBeLessThan(1000);
  });
});

describe("iterateCollection", () => {
  it("is equivalent to the aggregate result and ends with one summary", async () => {
    const manifest: CollectionManifest = {
      people: [...people(4), { id: "bad", chart: input(-2) }],
      events: [{ id: "e1", date: { year: 2020, month: 5, day: 5 } }],
    };
    const opts = () => ({ computeChart: countingChartFn((l) => Math.abs(l) % 3).fn, concurrency: 3 });
    const aggregate = await computeCollection(manifest, opts());
    const records: CollectionRecord[] = [];
    for await (const r of iterateCollection(manifest, opts())) records.push(r);

    expect(records.filter((r) => r.type === "summary")).toHaveLength(1);
    expect(records[records.length - 1].type).toBe("summary");
    const types = records.map((r) => r.type);
    expect(types).toEqual([...types].sort((a, b) => ["person", "event", "pair", "summary"].indexOf(a) - ["person", "event", "pair", "summary"].indexOf(b)));
    expect({
      people: records.filter((r) => r.type === "person"),
      events: records.filter((r) => r.type === "event"),
      pairs: records.filter((r) => r.type === "pair"),
      summary: records[records.length - 1],
    }).toEqual({ people: aggregate.people, events: aggregate.events, pairs: aggregate.pairs, summary: aggregate.summary });
    // NDJSON-ready: every record is plain JSON
    for (const r of records) expect(JSON.parse(JSON.stringify(r))).toEqual(r);
  });

  it("applies backpressure: a stalled consumer does not let work run ahead", async () => {
    const { fn, calls } = countingChartFn();
    const it = iterateCollection({ people: people(30) }, { computeChart: fn, concurrency: 2 });
    await it.next(); // first person
    await sleep(30);
    expect(calls.length).toBeLessThanOrEqual(2);
    await it.return?.();
  });
});

describe("eligible points", () => {
  it("keeps all points for timed people", () => {
    const person = { id: "x", index: 0, quality: "recorded" as const, timed: true, chart: fakeChart(3) };
    const { points, excluded } = getEligiblePairPoints(person);
    expect(Object.keys(points)).toEqual(["sun", "moon", "mercury", "venus", "mars", "ascendant", "mc"]);
    expect(excluded).toEqual([]);
  });
});

describe("with the real ephemeris", () => {
  beforeAll(async () => {
    await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
  });
  afterAll(() => closeSwissEph());

  it("uses getBirthChart once per person and matches a direct synastry-style calculation", async () => {
    const a: BirthChartOptions = { date: { year: 1985, month: 7, day: 2, hour: 14, minute: 30 }, latitude: 52.5, longitude: 13.4, timeZoneSettings: { utcOffsetMinutes: 120 } };
    const b: BirthChartOptions = { date: { year: 1992, month: 11, day: 21, hour: 3 }, latitude: -23.5, longitude: -46.6, timeZoneSettings: { utcOffsetMinutes: -180 } };
    let calls = 0;
    const result = await computeCollection(
      { people: [{ id: "p1", chart: a }, { id: "p2", chart: b }, { id: "p3", chart: a, quality: "untimed" }] },
      { computeChart: async (o) => (calls++, getBirthChart(o)) }
    );
    expect(calls).toBe(3);
    const [ca, cb] = await Promise.all([getBirthChart(a), getBirthChart(b)]);
    const direct = defaultPairComputer(
      { id: "p1", index: 0, quality: "recorded", timed: true, chart: ca },
      { id: "p2", index: 1, quality: "recorded", timed: true, chart: cb },
      {}
    );
    const pair = result.pairs[0];
    expect(pair.ok && pair.aspects).toEqual((await direct).aspects);
    // default chart function path
    const viaDefault = await computeCollection({ people: [{ id: "p1", chart: a }, { id: "p2", chart: b }] });
    expect(viaDefault.pairs[0].ok && viaDefault.pairs[0].aspects).toEqual(pair.ok ? pair.aspects : null);
  });
});
