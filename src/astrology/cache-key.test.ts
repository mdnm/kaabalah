import { describe, expect, it } from "vitest";
import {
  CacheKeyError,
  CHART_CACHE_KEY_REQUIRED_COMPONENTS,
  PACKAGE_VERSION,
  type ChartCacheKeyComponents,
  buildChartCacheKey,
  canonicalJson,
  createBoundedMemo,
  normalizeChartDate,
  normalizeKeyNumber,
  normalizeUtcInstant,
  resolveUtcOffsetMinutes,
} from "./cache-key";

const base = (): ChartCacheKeyComponents => ({
  date: normalizeChartDate({ year: 1990, month: 3, day: 14, hour: 9, minute: 5 }),
  timeSemantics: "civil-iana",
  timeZone: "Europe/Berlin",
  resolvedUtcOffsetMinutes: 60,
  latitude: 52.52,
  longitude: 13.405,
  quality: "recorded",
  houseSystems: ["P"],
  points: ["sun", "moon"],
  orbPolicy: { luminaries: 8, planets: 6 },
  frame: "tropical",
  nodeConvention: "mean",
  yearLengthDays: null,
  gcConstants: null,
  ephemeris: { kind: "swiss", swissEphemerisVersion: null, dataSet: "sepl_18.se1" },
});

describe("canonicalJson", () => {
  it("is key-order and whitespace insensitive", () => {
    expect(canonicalJson({ b: 1, a: { d: [1, { z: 1, y: 2 }], c: "x" } })).toBe(
      canonicalJson(JSON.parse('{ "a" : { "c":"x", "d":[1,{"y":2,"z":1}] },\n "b":1 }'))
    );
  });
  it("normalises numbers and rejects non-finite values", () => {
    expect(canonicalJson({ n: -0 })).toBe('{"n":0}');
    expect(normalizeKeyNumber(0.1 + 0.2)).toBe(0.3);
    expect(canonicalJson({ n: 1.0 })).toBe(canonicalJson({ n: 1 }));
    expect(() => canonicalJson({ n: NaN })).toThrow(CacheKeyError);
    expect(() => canonicalJson({ n: Infinity })).toThrow(CacheKeyError);
  });
  it("keeps array order and rejects undefined", () => {
    expect(canonicalJson([2, 1])).not.toBe(canonicalJson([1, 2]));
    expect(() => canonicalJson({ a: undefined })).toThrow(expect.objectContaining({ code: "MISSING_COMPONENT" }));
  });
});

describe("buildChartCacheKey", () => {
  it("is stable and independent of component key order", () => {
    const a = base();
    const reordered = Object.fromEntries(Object.entries(a).reverse()) as unknown as ChartCacheKeyComponents;
    expect(buildChartCacheKey(reordered)).toBe(buildChartCacheKey(a));
    expect(buildChartCacheKey(a)).toContain(`"packageVersion":"${PACKAGE_VERSION}"`);
  });

  it("treats house systems and points as sets", () => {
    const a = { ...base(), houseSystems: ["W", "P", "P"], points: ["moon", "sun"] };
    const b = { ...base(), houseSystems: ["P", "W"], points: ["sun", "moon", "sun"] };
    expect(buildChartCacheKey(a)).toBe(buildChartCacheKey(b));
  });

  it("same person id but different time gives a different key; the id is not an input", () => {
    const t1 = base();
    const t2 = { ...base(), date: normalizeChartDate({ year: 1990, month: 3, day: 14, hour: 9, minute: 6 }) };
    expect(buildChartCacheKey(t1)).not.toBe(buildChartCacheKey(t2));
    expect(buildChartCacheKey({ ...t1, extra: { id: "p1" } })).not.toBe(buildChartCacheKey({ ...t2, extra: { id: "p1" } }));
  });

  const variations: Array<[string, Partial<ChartCacheKeyComponents>]> = [
    ["timezone", { timeZone: "America/Sao_Paulo" }],
    ["resolved offset", { resolvedUtcOffsetMinutes: 120 }],
    ["time semantics", { timeSemantics: "local-mean-time" }],
    ["latitude", { latitude: 52.53 }],
    ["longitude", { longitude: 13.41 }],
    ["quality", { quality: "rectified" }],
    ["house system", { houseSystems: ["W"] }],
    ["points", { points: ["sun"] }],
    ["orb policy", { orbPolicy: { luminaries: 8, planets: 5 } }],
    ["frame", { frame: "lahiri" }],
    ["node convention", { nodeConvention: "true" }],
    ["year length", { yearLengthDays: 365.2422 }],
    ["gc constants", { gcConstants: { ra: 266.40499 } }],
    ["ephemeris kind", { ephemeris: { kind: "moshier", swissEphemerisVersion: null, dataSet: "sepl_18.se1" } }],
    ["ephemeris data set", { ephemeris: { kind: "swiss", swissEphemerisVersion: null, dataSet: null } }],
    ["package version", { packageVersion: "0.0.0-other" }],
    ["extra config", { extra: { strict: true } }],
    ["date precision (utc instant)", { date: normalizeUtcInstant("1990-03-14T08:05:00Z") }],
  ];
  it.each(variations)("changes when %s changes", (_name, change) => {
    expect(buildChartCacheKey({ ...base(), ...change })).not.toBe(buildChartCacheKey(base()));
  });

  it("throws a typed error naming a missing required component", () => {
    for (const name of CHART_CACHE_KEY_REQUIRED_COMPONENTS) {
      const broken = { ...base() } as unknown as Record<string, unknown>;
      delete broken[name];
      expect(() => buildChartCacheKey(broken as unknown as ChartCacheKeyComponents)).toThrow(
        expect.objectContaining({ name: "CacheKeyError", code: "MISSING_COMPONENT", component: name })
      );
    }
  });

  it("allows an explicit null where a component does not apply, and rejects incomplete ephemeris identity", () => {
    expect(() => buildChartCacheKey({ ...base(), gcConstants: null, yearLengthDays: null })).not.toThrow();
    expect(() =>
      buildChartCacheKey({ ...base(), ephemeris: { kind: "swiss" } as never })
    ).toThrow(expect.objectContaining({ code: "MISSING_COMPONENT" }));
  });
});

describe("date helpers", () => {
  it("normalises Date by local getters and defaults missing time parts to zero", () => {
    expect(normalizeChartDate(new Date(2001, 1, 3, 4, 5, 6))).toEqual({ kind: "local", year: 2001, month: 2, day: 3, hour: 4, minute: 5, second: 6 });
    expect(normalizeChartDate({ year: 2001, month: 2, day: 3 })).toEqual({ kind: "local", year: 2001, month: 2, day: 3, hour: 0, minute: 0, second: 0 });
  });
  it("derives the resolved offset from local parts and the UTC instant", () => {
    expect(resolveUtcOffsetMinutes({ year: 2000, month: 1, day: 1, hour: 12 }, new Date(Date.UTC(2000, 0, 1, 9)))).toBe(180);
    expect(resolveUtcOffsetMinutes({ year: 2000, month: 1, day: 1, hour: 6 }, new Date(Date.UTC(2000, 0, 1, 9)))).toBe(-180);
  });
});

describe("createBoundedMemo", () => {
  it("evicts least recently used entries beyond the cap", () => {
    const memo = createBoundedMemo<number>({ maxEntries: 2 });
    memo.set("a", 1);
    memo.set("b", 2);
    memo.get("a"); // a is now most recent
    memo.set("c", 3);
    expect(memo.has("b")).toBe(false);
    expect(memo.get("a")).toBe(1);
    expect(memo.size).toBe(2);
    expect(memo.stats().evictions).toBe(1);
  });

  it("memoises by key, never across configurations", () => {
    const memo = createBoundedMemo<string>({ maxEntries: 8 });
    let computed = 0;
    const get = (c: ChartCacheKeyComponents) => memo.getOrCompute(buildChartCacheKey(c), () => (computed++, `r${computed}`));
    expect(get(base())).toBe("r1");
    expect(get(base())).toBe("r1");
    expect(get({ ...base(), frame: "lahiri" })).toBe("r2");
    expect(get({ ...base(), houseSystems: ["W"] })).toBe("r3");
    expect(computed).toBe(3);
    expect(memo.stats()).toMatchObject({ hits: 1, misses: 3 });
  });

  it("shares in-flight promises and does not cache failures", async () => {
    const memo = createBoundedMemo<number>({ maxEntries: 4 });
    let n = 0;
    const slow = () => new Promise<number>((r) => setTimeout(() => r(++n), 5));
    const [x, y] = await Promise.all([memo.getOrCompute("k", slow), memo.getOrCompute("k", slow)]);
    expect([x, y, n]).toEqual([1, 1, 1]);
    await expect(memo.getOrCompute("bad", () => Promise.reject(new Error("no")))).rejects.toThrow("no");
    await Promise.resolve();
    expect(memo.has("bad")).toBe(false);
  });

  it("validates maxEntries", () => {
    expect(() => createBoundedMemo({ maxEntries: 0 })).toThrow(expect.objectContaining({ code: "INVALID_CACHE_OPTION" }));
  });
});
