/**
 * Bulk / collection computation: structured manifests of people, events and pair selections.
 *
 * Guarantees
 * - Each person's natal chart is computed exactly ONCE (or never, for a precomputed chart),
 *   no matter how many of the N(N-1)/2 pairs it takes part in.
 * - User IDs are preserved verbatim; the library never invents or rewrites them. Manifests
 *   are name-free by design (an ID is the only identifier).
 * - Output order is deterministic: people and events in manifest order, pairs ordered by
 *   manifest index (i < j), whatever order tasks actually finish in.
 * - One person's failure becomes `{ ok: false, error }` for that person; pairs that involve
 *   a failed person are reported as unavailable with the reason, never dropped silently.
 * - Hard caps and typed `CollectionError`s reject duplicate IDs, unknown pair IDs,
 *   self-pairs and oversized manifests before any chart is computed.
 *
 * Concurrency, honestly: Swiss Ephemeris runs as SYNCHRONOUS WebAssembly calls on the JS
 * thread. `concurrency` bounds how many async tasks are in flight and how far results may
 * run ahead of the consumer (backpressure); it does not make the ephemeris parallel. The
 * scheduler yields to the event loop on a small time budget so progress callbacks, timers
 * and abort signals stay responsive. The default pair computation is pure tropical
 * longitude geometry and this module owns no mutable engine state, so sidereal/Jyotish
 * frames cannot leak between items (callers that inject a Jyotish-aware `computeChart`
 * must keep Swiss state changes inside synchronous `withSwissEphState`-style scopes).
 *
 * Library-only: it accepts a standard `AbortSignal` and does not import CLI code.
 */

import { type AspectEdge, type AspectSpec, computeSynastryAspects } from "./aspects";
import type { BirthChart, BirthChartOptions } from "./index";
import type { LocalDateTimeParts, TimeZoneOptions } from "./swisseph";

export const COLLECTION_METHOD_VERSION = "kaabalah-collection/1";

// ---------------------------------------------------------------------------
// Limits and errors
// ---------------------------------------------------------------------------

export interface CollectionLimits {
  maxPeople: number;
  maxEvents: number;
  maxPairs: number;
  maxConcurrency: number;
}

/** Hard caps; `options.limits` may only lower them. 500 people allow every pair (124,750). */
export const COLLECTION_HARD_LIMITS: Readonly<CollectionLimits> = Object.freeze({
  maxPeople: 500,
  maxEvents: 1000,
  maxPairs: 125_000,
  maxConcurrency: 64,
});

export const DEFAULT_COLLECTION_CONCURRENCY = 4;

export type CollectionErrorCode =
  | "INVALID_MANIFEST"
  | "DUPLICATE_ID"
  | "UNKNOWN_PAIR_ID"
  | "SELF_PAIR"
  | "MANIFEST_TOO_LARGE"
  | "INVALID_OPTION"
  | "ABORTED";

/** Typed error for manifest/option problems and cancellation. `code` is stable API. */
export class CollectionError extends Error {
  readonly code: CollectionErrorCode;
  readonly details: Record<string, unknown>;

  constructor(code: CollectionErrorCode, message: string, details: Record<string, unknown> = {}) {
    super(message);
    this.name = "CollectionError";
    this.code = code;
    this.details = details;
  }
}

/** AbortError-style error (`name === "AbortError"`, `code === "ABORTED"`) raised on cancellation. */
export class CollectionAbortError extends CollectionError {
  constructor(reason?: unknown) {
    super("ABORTED", "Collection computation was aborted.", { reason: describeReason(reason) });
    this.name = "AbortError";
  }
}

function describeReason(reason: unknown): string | null {
  if (reason === undefined || reason === null) return null;
  if (reason instanceof Error) return reason.message;
  return String(reason);
}

// ---------------------------------------------------------------------------
// Manifest types
// ---------------------------------------------------------------------------

/** How trustworthy/complete the birth time is. Untimed and partial people omit Moon and angles from pair aspects. */
export type CollectionInputQuality = "recorded" | "rectified" | "untimed" | "partial";

export interface CollectionPersonInput {
  /** Caller-owned identifier, preserved verbatim. Must be unique among people. */
  id: string;
  /** Chart input; the chart is computed once. Exactly one of `chart` / `precomputed`. */
  chart?: BirthChartOptions;
  /** An already computed chart (no computation happens). */
  precomputed?: BirthChart;
  /** Default "recorded". Untimed/partial: Moon and angles excluded from pair aspects and flagged. */
  quality?: CollectionInputQuality;
}

export interface CollectionEventInput {
  id: string;
  date: Date | LocalDateTimeParts;
  /** Default 0. */
  latitude?: number;
  /** Default 0. */
  longitude?: number;
  /** Default `{ treatAsUTC: true }`. */
  timeZoneSettings?: TimeZoneOptions;
}

export type PairSelection =
  | { mode: "all" }
  | { mode: "pairs"; pairs: ReadonlyArray<readonly [string, string]> }
  /** All pairs among people whose quality is "recorded" or "rectified" (a supplied time). */
  | { mode: "timed-only" };

export interface CollectionManifest {
  people: readonly CollectionPersonInput[];
  events?: readonly CollectionEventInput[];
  /** Default `{ mode: "all" }`. */
  pairs?: PairSelection;
}

/** A person's chart prepared for pair computation. */
export interface PreparedPerson {
  id: string;
  /** Manifest index. */
  index: number;
  quality: CollectionInputQuality;
  /** True when Moon degree and angles are trustworthy (recorded / rectified). */
  timed: boolean;
  chart: BirthChart;
}

export interface PairComputation {
  aspects: AspectEdge[];
  /** True when points were withheld or the result is otherwise incomplete. */
  partial?: boolean;
  excludedPoints?: { a: string[]; b: string[] };
  /** Method metadata supplied by an injected computation; copied to the pair record. */
  metadata?: Record<string, unknown>;
}

export interface PairComputeContext {
  aspectSpecs?: AspectSpec[];
  signal?: AbortSignal;
}

export type ChartComputer = (
  input: BirthChartOptions,
  context: { id: string; kind: "person" | "event" }
) => Promise<BirthChart>;

export type PairComputer = (
  a: PreparedPerson,
  b: PreparedPerson,
  context: PairComputeContext
) => PairComputation | Promise<PairComputation>;

export interface CollectionProgress {
  phase: "people" | "events" | "pairs";
  /** Items finished in this phase, counted in deterministic emission order (1..total). */
  completed: number;
  total: number;
  /** Person/event id, or `${idA}~${idB}` for pairs (see `ids`). */
  id: string;
  ids?: [string, string];
}

export interface CollectionOptions {
  /** Async tasks in flight and ahead-of-consumer window. Default 4, max 64. */
  concurrency?: number;
  signal?: AbortSignal;
  onProgress?: (progress: CollectionProgress) => void;
  /** Embed full charts in person/event records. Default false (lightweight records). */
  includeCharts?: boolean;
  aspectSpecs?: AspectSpec[];
  /** Replace the chart function (default `getBirthChart`). */
  computeChart?: ChartComputer;
  /** Replace the pair function (default tropical synastry aspects over eligible points). */
  computePair?: PairComputer;
  /** Lower the hard caps. */
  limits?: Partial<CollectionLimits>;
  /** Event-loop yield budget in milliseconds (default 8). `0` yields after every item. */
  yieldBudgetMs?: number;
}

// ---------------------------------------------------------------------------
// Records
// ---------------------------------------------------------------------------

export interface ItemError {
  code: string;
  message: string;
}

export interface PersonRecordOk {
  type: "person";
  id: string;
  index: number;
  ok: true;
  quality: CollectionInputQuality;
  timed: boolean;
  /** Eligible point longitudes (degrees). Untimed/partial: Moon excluded. */
  points: Record<string, number>;
  /** Ascendant / MC longitudes; absent when untimed or partial. */
  angles?: { ascendant: number; mc: number };
  /** Points withheld because the time is not trustworthy. */
  excludedPoints: string[];
  chart?: BirthChart;
}
export interface PersonRecordFailed {
  type: "person";
  id: string;
  index: number;
  ok: false;
  quality: CollectionInputQuality;
  error: ItemError;
}
export type PersonRecord = PersonRecordOk | PersonRecordFailed;

export interface EventRecordOk {
  type: "event";
  id: string;
  index: number;
  ok: true;
  points: Record<string, number>;
  chart?: BirthChart;
}
export interface EventRecordFailed {
  type: "event";
  id: string;
  index: number;
  ok: false;
  error: ItemError;
}
export type EventRecord = EventRecordOk | EventRecordFailed;

export interface PairRecordOk {
  type: "pair";
  idA: string;
  idB: string;
  indexA: number;
  indexB: number;
  ok: true;
  partial: boolean;
  excludedPoints: { a: string[]; b: string[] };
  aspectCount: number;
  aspects: AspectEdge[];
  metadata?: Record<string, unknown>;
}
export interface PairRecordUnavailable {
  type: "pair";
  idA: string;
  idB: string;
  indexA: number;
  indexB: number;
  ok: false;
  error: ItemError;
  /** Ids of the people whose charts are unavailable. */
  unavailablePeople: string[];
}
export type PairRecord = PairRecordOk | PairRecordUnavailable;

export interface CollectionSummary {
  type: "summary";
  method: {
    id: string;
    pairComputation: "default-tropical-synastry" | "custom";
    chartComputation: "getBirthChart" | "custom";
    aspectSpecs: "default" | "custom";
    ordering: string;
    executionModel: string;
  };
  selection: { mode: PairSelection["mode"]; pairCount: number };
  people: { total: number; ok: number; failed: number };
  events: { total: number; ok: number; failed: number };
  pairs: { total: number; ok: number; unavailable: number; partial: number; aspects: number };
  /** People left out of pair selection by the selection mode itself (for example untimed in "timed-only"). */
  skippedPeople: { id: string; reason: string }[];
  options: { concurrency: number; includeCharts: boolean };
}

export type CollectionRecord = PersonRecord | EventRecord | PairRecord | CollectionSummary;

export interface CollectionResult {
  method: typeof COLLECTION_METHOD_VERSION;
  people: PersonRecord[];
  events: EventRecord[];
  pairs: PairRecord[];
  summary: CollectionSummary;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const QUALITIES: readonly CollectionInputQuality[] = ["recorded", "rectified", "untimed", "partial"];

interface Plan {
  people: CollectionPersonInput[];
  events: CollectionEventInput[];
  pairs: Array<[number, number]>;
  mode: PairSelection["mode"];
  skippedPeople: { id: string; reason: string }[];
  concurrency: number;
  limits: CollectionLimits;
}

function resolveLimits(partial: Partial<CollectionLimits> | undefined): CollectionLimits {
  const limits = { ...COLLECTION_HARD_LIMITS };
  if (!partial) return limits;
  for (const key of Object.keys(COLLECTION_HARD_LIMITS) as (keyof CollectionLimits)[]) {
    const value = partial[key];
    if (value === undefined) continue;
    if (!Number.isInteger(value) || value < 1 || value > COLLECTION_HARD_LIMITS[key]) {
      throw new CollectionError(
        "INVALID_OPTION",
        `limits.${key} must be an integer between 1 and the hard cap ${COLLECTION_HARD_LIMITS[key]}.`,
        { option: `limits.${key}`, value }
      );
    }
    limits[key] = value;
  }
  return limits;
}

function checkId(id: unknown, where: string): string {
  if (typeof id !== "string" || id.length === 0) {
    throw new CollectionError("INVALID_MANIFEST", `${where} must have a non-empty string id.`, { where });
  }
  return id;
}

function isTimedQuality(quality: CollectionInputQuality): boolean {
  return quality === "recorded" || quality === "rectified";
}

function planCollection(manifest: CollectionManifest, options: CollectionOptions): Plan {
  if (manifest === null || typeof manifest !== "object" || !Array.isArray(manifest.people)) {
    throw new CollectionError("INVALID_MANIFEST", "Manifest must be an object with a `people` array.");
  }
  const limits = resolveLimits(options.limits);
  const concurrency = options.concurrency ?? DEFAULT_COLLECTION_CONCURRENCY;
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > limits.maxConcurrency) {
    throw new CollectionError(
      "INVALID_OPTION",
      `concurrency must be an integer between 1 and ${limits.maxConcurrency}.`,
      { option: "concurrency", value: concurrency }
    );
  }
  const people = [...manifest.people];
  const events = [...(manifest.events ?? [])];
  if (people.length > limits.maxPeople) {
    throw new CollectionError(
      "MANIFEST_TOO_LARGE",
      `Manifest has ${people.length} people; the limit is ${limits.maxPeople}.`,
      { what: "people", count: people.length, limit: limits.maxPeople }
    );
  }
  if (events.length > limits.maxEvents) {
    throw new CollectionError(
      "MANIFEST_TOO_LARGE",
      `Manifest has ${events.length} events; the limit is ${limits.maxEvents}.`,
      { what: "events", count: events.length, limit: limits.maxEvents }
    );
  }

  const indexById = new Map<string, number>();
  people.forEach((person, index) => {
    const id = checkId(person?.id, `people[${index}]`);
    if (indexById.has(id)) {
      throw new CollectionError("DUPLICATE_ID", `Duplicate person id "${id}".`, { id });
    }
    indexById.set(id, index);
    const hasChart = person.chart !== undefined;
    const hasPre = person.precomputed !== undefined;
    if (hasChart === hasPre) {
      throw new CollectionError(
        "INVALID_MANIFEST",
        `Person "${id}" must provide exactly one of \`chart\` or \`precomputed\`.`,
        { id }
      );
    }
    if (person.quality !== undefined && !QUALITIES.includes(person.quality)) {
      throw new CollectionError("INVALID_MANIFEST", `Person "${id}" has unknown quality "${String(person.quality)}".`, {
        id,
        quality: person.quality,
      });
    }
  });
  const eventIds = new Set<string>();
  events.forEach((event, index) => {
    const id = checkId(event?.id, `events[${index}]`);
    if (eventIds.has(id)) {
      throw new CollectionError("DUPLICATE_ID", `Duplicate event id "${id}".`, { id });
    }
    eventIds.add(id);
    if (event.date === undefined) {
      throw new CollectionError("INVALID_MANIFEST", `Event "${id}" needs a date.`, { id });
    }
  });

  const selection: PairSelection = manifest.pairs ?? { mode: "all" };
  const n = people.length;
  const qualityOf = (i: number) => people[i].quality ?? "recorded";
  const pairs: Array<[number, number]> = [];
  const skippedPeople: { id: string; reason: string }[] = [];
  const guardCount = (count: number) => {
    if (count > limits.maxPairs) {
      throw new CollectionError(
        "MANIFEST_TOO_LARGE",
        `Pair selection has ${count} pairs; the limit is ${limits.maxPairs}.`,
        { what: "pairs", count, limit: limits.maxPairs }
      );
    }
  };

  switch (selection.mode) {
    case "all": {
      guardCount((n * (n - 1)) / 2);
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pairs.push([i, j]);
      break;
    }
    case "timed-only": {
      const eligible: number[] = [];
      for (let i = 0; i < n; i++) {
        if (isTimedQuality(qualityOf(i))) eligible.push(i);
        else skippedPeople.push({ id: people[i].id, reason: `quality "${qualityOf(i)}" has no supplied birth time` });
      }
      guardCount((eligible.length * (eligible.length - 1)) / 2);
      for (let a = 0; a < eligible.length; a++) {
        for (let b = a + 1; b < eligible.length; b++) pairs.push([eligible[a], eligible[b]]);
      }
      break;
    }
    case "pairs": {
      if (!Array.isArray(selection.pairs)) {
        throw new CollectionError("INVALID_MANIFEST", "pairs.pairs must be an array of [idA, idB].");
      }
      guardCount(selection.pairs.length);
      const seen = new Set<number>();
      for (const pair of selection.pairs) {
        if (!Array.isArray(pair) || pair.length !== 2) {
          throw new CollectionError("INVALID_MANIFEST", "Each pair must be [idA, idB].");
        }
        const [idA, idB] = pair as [string, string];
        const ia = indexById.get(idA);
        const ib = indexById.get(idB);
        if (ia === undefined || ib === undefined) {
          throw new CollectionError(
            "UNKNOWN_PAIR_ID",
            `Pair references unknown person id "${ia === undefined ? idA : idB}".`,
            { id: ia === undefined ? idA : idB }
          );
        }
        if (ia === ib) {
          throw new CollectionError("SELF_PAIR", `Pair [${idA}, ${idB}] pairs a person with themselves.`, { id: idA });
        }
        const lo = Math.min(ia, ib);
        const hi = Math.max(ia, ib);
        const code = lo * Math.max(n, 1) + hi;
        if (seen.has(code)) continue; // the same unordered pair listed twice is computed once
        seen.add(code);
        pairs.push([lo, hi]);
      }
      pairs.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
      break;
    }
    default:
      throw new CollectionError(
        "INVALID_MANIFEST",
        `Unknown pair selection mode "${String((selection as { mode: unknown }).mode)}".`
      );
  }

  return { people, events, pairs, mode: selection.mode, skippedPeople, concurrency, limits };
}

// ---------------------------------------------------------------------------
// Scheduling helpers
// ---------------------------------------------------------------------------

function raceAbort<T>(promise: Promise<T>, signal: AbortSignal | undefined): Promise<T> {
  if (!signal) return promise;
  return new Promise<T>((resolve, reject) => {
    if (signal.aborted) {
      reject(new CollectionAbortError(signal.reason));
      return;
    }
    const onAbort = () => reject(new CollectionAbortError(signal.reason));
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      }
    );
  });
}

function throwIfAborted(signal: AbortSignal | undefined): void {
  if (signal?.aborted) throw new CollectionAbortError(signal.reason);
}

function createYielder(budgetMs: number): () => Promise<void> {
  let last = Date.now();
  return async () => {
    const now = Date.now();
    if (budgetMs > 0 && now - last < budgetMs) return;
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    last = Date.now();
  };
}

/**
 * Run `fn` over `items` with at most `concurrency` tasks started ahead of the consumer, and
 * yield results strictly in item order. A task is only started when the consumer has pulled
 * within `concurrency` of it, which is the backpressure. `fn` must not reject for item-level
 * failures (it returns failure records); only aborts propagate.
 */
async function* orderedBounded<T, R>(
  items: readonly T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
  signal: AbortSignal | undefined,
  yieldToLoop: () => Promise<void>
): AsyncGenerator<R, void, void> {
  const pending = new Map<number, Promise<R>>();
  let next = 0;
  let emitted = 0;
  while (emitted < items.length) {
    throwIfAborted(signal);
    while (next < items.length && next - emitted < concurrency) {
      const index = next++;
      const task = (async () => {
        throwIfAborted(signal);
        return fn(items[index], index);
      })();
      task.catch(() => undefined); // never an unhandled rejection if we stop early
      pending.set(index, task);
    }
    const result = await raceAbort(pending.get(emitted) as Promise<R>, signal);
    pending.delete(emitted);
    emitted += 1;
    yield result;
    await yieldToLoop();
  }
}

function toItemError(error: unknown, fallbackCode: string): ItemError {
  const code = (error as { code?: unknown } | null)?.code;
  return {
    code: typeof code === "string" ? code : fallbackCode,
    message: error instanceof Error ? error.message : String(error),
  };
}

let defaultChartPromise: Promise<ChartComputer> | null = null;
function defaultChartComputer(): Promise<ChartComputer> {
  // Dynamic import: avoids a load-time cycle with "./index" (which re-exports this module).
  defaultChartPromise ??= import("./index").then((mod) => (input: BirthChartOptions) => mod.getBirthChart(input));
  return defaultChartPromise;
}

// ---------------------------------------------------------------------------
// Default pair computation
// ---------------------------------------------------------------------------

/**
 * Pair-eligible points of a person: all chart planets plus ascendant and MC. Untimed and
 * partial people lose the Moon (noon placeholder) and both angles; withheld keys are listed.
 */
export function getEligiblePairPoints(person: PreparedPerson): {
  points: Record<string, { longitude: number }>;
  excluded: string[];
} {
  const points: Record<string, { longitude: number }> = {};
  const excluded: string[] = [];
  for (const [key, planet] of Object.entries(person.chart.planets ?? {})) {
    if (!person.timed && key === "moon") excluded.push(key);
    else points[key] = { longitude: planet.longitude };
  }
  const asc = person.chart.houses?.ascendant?.longitude;
  const mc = person.chart.houses?.mc?.longitude;
  if (person.timed && asc !== undefined && mc !== undefined) {
    points.ascendant = { longitude: asc };
    points.mc = { longitude: mc };
  } else {
    excluded.push("ascendant", "mc");
  }
  return { points, excluded };
}

/** Default pair function: inter-chart aspects over the eligible points (tropical longitudes, no shared state). */
export const defaultPairComputer: PairComputer = (a, b, context) => {
  const ea = getEligiblePairPoints(a);
  const eb = getEligiblePairPoints(b);
  const aspects = computeSynastryAspects(ea.points, eb.points, context.aspectSpecs);
  const partial = !a.timed || !b.timed;
  return { aspects, partial, excludedPoints: { a: ea.excluded, b: eb.excluded } };
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

function pointLongitudes(chart: BirthChart): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [key, planet] of Object.entries(chart.planets ?? {})) out[key] = planet.longitude;
  return out;
}

/**
 * Stream a collection as deterministic records: all people, then all events, then all
 * pairs, then one summary. Validation errors throw synchronously from this call; abort
 * rejects the iterator with `CollectionAbortError`. Pull-based: nothing runs ahead of the
 * consumer by more than `concurrency` items (backpressure), so it suits NDJSON streaming.
 */
export function iterateCollection(
  manifest: CollectionManifest,
  options: CollectionOptions = {}
): AsyncGenerator<CollectionRecord, void, void> {
  const plan = planCollection(manifest, options);
  return runCollection(plan, options);
}

async function* runCollection(
  plan: Plan,
  options: CollectionOptions
): AsyncGenerator<CollectionRecord, void, void> {
  const { signal } = options;
  const includeCharts = options.includeCharts === true;
  const yieldToLoop = createYielder(options.yieldBudgetMs ?? 8);
  const computeChart = options.computeChart ?? (await defaultChartComputer());
  const computePair = options.computePair ?? defaultPairComputer;
  const progress = (p: CollectionProgress) => options.onProgress?.(p);

  const prepared: Array<PreparedPerson | null> = new Array(plan.people.length).fill(null);
  const failedPeople = new Map<number, ItemError>();
  const summary = {
    people: { total: plan.people.length, ok: 0, failed: 0 },
    events: { total: plan.events.length, ok: 0, failed: 0 },
    pairs: { total: plan.pairs.length, ok: 0, unavailable: 0, partial: 0, aspects: 0 },
  };

  throwIfAborted(signal);

  // People ------------------------------------------------------------------
  let completed = 0;
  for await (const record of orderedBounded(
    plan.people,
    plan.concurrency,
    async (person, index): Promise<PersonRecord> => {
      const quality = person.quality ?? "recorded";
      const timed = isTimedQuality(quality);
      try {
        const chart = person.precomputed ?? (await computeChart(person.chart as BirthChartOptions, { id: person.id, kind: "person" }));
        if (!chart || typeof chart !== "object" || !chart.planets) {
          throw new CollectionError("INVALID_MANIFEST", `Chart for "${person.id}" has no planets.`);
        }
        const preparedPerson: PreparedPerson = { id: person.id, index, quality, timed, chart };
        prepared[index] = preparedPerson;
        const eligible = getEligiblePairPoints(preparedPerson);
        const points: Record<string, number> = {};
        for (const [key, p] of Object.entries(eligible.points)) {
          if (key !== "ascendant" && key !== "mc") points[key] = p.longitude;
        }
        const rec: PersonRecordOk = {
          type: "person",
          id: person.id,
          index,
          ok: true,
          quality,
          timed,
          points,
          excludedPoints: eligible.excluded,
        };
        if (timed && eligible.points.ascendant && eligible.points.mc) {
          rec.angles = { ascendant: eligible.points.ascendant.longitude, mc: eligible.points.mc.longitude };
        }
        if (includeCharts) rec.chart = chart;
        return rec;
      } catch (error) {
        if (signal?.aborted) throw new CollectionAbortError(signal.reason);
        const itemError = toItemError(error, "CHART_FAILED");
        failedPeople.set(index, itemError);
        return { type: "person", id: person.id, index, ok: false, quality, error: itemError };
      }
    },
    signal,
    yieldToLoop
  )) {
    completed += 1;
    if (record.ok) summary.people.ok += 1;
    else summary.people.failed += 1;
    progress({ phase: "people", completed, total: plan.people.length, id: record.id });
    yield record;
  }

  // Events ------------------------------------------------------------------
  completed = 0;
  for await (const record of orderedBounded(
    plan.events,
    plan.concurrency,
    async (event, index): Promise<EventRecord> => {
      try {
        const input: BirthChartOptions = {
          date: event.date,
          latitude: event.latitude ?? 0,
          longitude: event.longitude ?? 0,
          timeZoneSettings: event.timeZoneSettings ?? { treatAsUTC: true },
        };
        const chart = await computeChart(input, { id: event.id, kind: "event" });
        const rec: EventRecordOk = { type: "event", id: event.id, index, ok: true, points: pointLongitudes(chart) };
        if (includeCharts) rec.chart = chart;
        return rec;
      } catch (error) {
        if (signal?.aborted) throw new CollectionAbortError(signal.reason);
        return { type: "event", id: event.id, index, ok: false, error: toItemError(error, "CHART_FAILED") };
      }
    },
    signal,
    yieldToLoop
  )) {
    completed += 1;
    if (record.ok) summary.events.ok += 1;
    else summary.events.failed += 1;
    progress({ phase: "events", completed, total: plan.events.length, id: record.id });
    yield record;
  }

  // Pairs -------------------------------------------------------------------
  completed = 0;
  for await (const record of orderedBounded(
    plan.pairs,
    plan.concurrency,
    async ([ia, ib]): Promise<PairRecord> => {
      const idA = plan.people[ia].id;
      const idB = plan.people[ib].id;
      const a = prepared[ia];
      const b = prepared[ib];
      if (!a || !b) {
        const unavailablePeople = [a ? null : idA, b ? null : idB].filter((x): x is string => x !== null);
        const reasons = unavailablePeople.map((id) => {
          const idx = id === idA ? ia : ib;
          return `${id}: ${failedPeople.get(idx)?.message ?? "chart unavailable"}`;
        });
        return {
          type: "pair",
          idA,
          idB,
          indexA: ia,
          indexB: ib,
          ok: false,
          error: { code: "PERSON_UNAVAILABLE", message: `Pair unavailable (${reasons.join("; ")}).` },
          unavailablePeople,
        };
      }
      try {
        const result = await computePair(a, b, { aspectSpecs: options.aspectSpecs, signal });
        const rec: PairRecordOk = {
          type: "pair",
          idA,
          idB,
          indexA: ia,
          indexB: ib,
          ok: true,
          partial: result.partial ?? false,
          excludedPoints: result.excludedPoints ?? { a: [], b: [] },
          aspectCount: result.aspects.length,
          aspects: result.aspects,
        };
        if (result.metadata) rec.metadata = result.metadata;
        return rec;
      } catch (error) {
        if (signal?.aborted) throw new CollectionAbortError(signal.reason);
        return {
          type: "pair",
          idA,
          idB,
          indexA: ia,
          indexB: ib,
          ok: false,
          error: toItemError(error, "PAIR_FAILED"),
          unavailablePeople: [],
        };
      }
    },
    signal,
    yieldToLoop
  )) {
    completed += 1;
    if (record.ok) {
      summary.pairs.ok += 1;
      summary.pairs.aspects += record.aspectCount;
      if (record.partial) summary.pairs.partial += 1;
    } else {
      summary.pairs.unavailable += 1;
    }
    progress({
      phase: "pairs",
      completed,
      total: plan.pairs.length,
      id: `${record.idA}~${record.idB}`,
      ids: [record.idA, record.idB],
    });
    yield record;
  }

  throwIfAborted(signal);
  yield {
    type: "summary",
    method: {
      id: COLLECTION_METHOD_VERSION,
      pairComputation: options.computePair ? "custom" : "default-tropical-synastry",
      chartComputation: options.computeChart ? "custom" : "getBirthChart",
      aspectSpecs: options.aspectSpecs ? "custom" : "default",
      ordering: "people and events in manifest order; pairs by manifest index (i<j)",
      executionModel:
        "async scheduling over synchronous WASM calls; concurrency bounds in-flight tasks, not ephemeris parallelism",
    },
    selection: { mode: plan.mode, pairCount: plan.pairs.length },
    ...summary,
    skippedPeople: plan.skippedPeople,
    options: { concurrency: plan.concurrency, includeCharts },
  };
}

/** Aggregate variant (the default): runs `iterateCollection` to completion and groups the records. */
export async function computeCollection(
  manifest: CollectionManifest,
  options: CollectionOptions = {}
): Promise<CollectionResult> {
  const people: PersonRecord[] = [];
  const events: EventRecord[] = [];
  const pairs: PairRecord[] = [];
  let summary: CollectionSummary | null = null;
  for await (const record of iterateCollection(manifest, options)) {
    if (record.type === "person") people.push(record);
    else if (record.type === "event") events.push(record);
    else if (record.type === "pair") pairs.push(record);
    else summary = record;
  }
  return { method: COLLECTION_METHOD_VERSION, people, events, pairs, summary: summary as CollectionSummary };
}
