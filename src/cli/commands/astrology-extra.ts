import { readFileSync, statSync } from "node:fs";

import { cliText } from "../runtime/language";
import { isJsonMode } from "../runtime/args";
import { exitWithError } from "../runtime/errors";
import type { ExecutionContext } from "../runtime/execution";
import {
  ANGLE_CONVENTION_NAMES,
  MIDPOINT_CONVENTION_NAMES,
  NAKSHATRA_FRAME_NAMES,
  NODE_CONVENTION_NAMES,
  PAIR_MODE_NAMES,
  RETURN_PASS_KIND_NAMES,
} from "../runtime/astro-names";
import {
  booleanOption,
  civilOption,
  civilToUtcDate,
  enumList,
  enumValue,
  listOption,
  numberOption,
  parseClock,
  payloadValue,
  stringOption,
} from "../runtime/options";
import { outputJson } from "../runtime/output";
import { MAX_MANIFEST_BYTES, readStdin } from "../runtime/stdin";
import { COMMANDS, GLOBAL_FLAGS, VERSION } from "../contract";
import { parseCivilDateInput, parseHouseSystem, parseTimeValue } from "../runtime/validation";
import { parseCivilDate, type CivilDate } from "../../civil-date";
import type { Flags, InputPayload } from "../runtime/types";
import {
  buildBirthChartOptions,
  parseSingleChartRequest,
  parseTwoChartCommand,
  withSwissEph,
  type AstrologyModule,
} from "./astrology";

type NatalInput = Awaited<ReturnType<typeof parseSingleChartRequest>>;

/** Natal chart from positionals, flags or a nested `natal` object (same convention as the other timeline commands). */
async function readNatal(args: string[], flags: Flags, payload: InputPayload, ctx: ExecutionContext): Promise<NatalInput> {
  const nested = payload?.natal as Record<string, unknown> | undefined;
  return parseSingleChartRequest(nested ? [] : args, flags, nested ? { ...nested } : payload, ctx);
}

function natalEcho(natal: NatalInput) {
  return { date: natal.dateStr, time: natal.timeStr, lat: natal.latitude, lon: natal.longitude, houseSystem: natal.houseSystem };
}

/** Target instant: `--target-date` at 12:00 UTC (or `--target-time` UTC); default today (UTC calendar day). */
function readTarget(flags: Flags, payload: InputPayload): { target: Date; source: string } {
  const dateText = stringOption(flags, payload, "target-date", "targetDate");
  const timeText = stringOption(flags, payload, "target-time", "targetTime");
  const clock = timeText ? parseClock(timeText, "target-time", flags) : { hour: 12, minute: 0 };
  if (dateText) {
    return { target: civilToUtcDate(parseCivilDateInput(dateText, flags), clock.hour, clock.minute), source: "--target-date (UTC)" };
  }
  const now = new Date();
  const today = { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1, day: now.getUTCDate() };
  return { target: civilToUtcDate(today, clock.hour, clock.minute), source: "today UTC (pass --target-date for reproducible output)" };
}

function readYearLength(flags: Flags, payload: InputPayload): number | "julian" | "tropical" | "solar-return" | undefined {
  const raw = payloadValue(payload, "yearLength");
  const text = typeof raw === "number" ? String(raw) : stringOption(flags, payload, "year-length", "yearLength");
  if (text === undefined) return undefined;
  if (text === "julian" || text === "tropical" || text === "solar-return") return text;
  const n = Number(text);
  if (!Number.isFinite(n) || n <= 0) {
    exitWithError("INVALID_ARGUMENT", cliText("--year-length must be julian, tropical, solar-return or a positive number of days, got \"{0}\".", [text]), flags);
  }
  return n;
}

function requireDates(flags: Flags, payload: InputPayload, usage: string): { from: CivilDate; to: CivilDate } {
  const fromText = stringOption(flags, payload, "from", "from");
  const toText = stringOption(flags, payload, "to", "to");
  if (!fromText || !toText) exitWithError("MISSING_ARGUMENT", usage, flags);
  return { from: parseCivilDateInput(fromText, flags), to: parseCivilDateInput(toText, flags) };
}

// ---------------------------------------------------------------------------
// Two-chart commands
// ---------------------------------------------------------------------------

export async function cmdAstrologyDavison(flags: Flags, payload: InputPayload, ctx: ExecutionContext): Promise<void> {
  const convention = enumValue(stringOption(flags, payload, "midpoint-convention", "midpointConvention"), MIDPOINT_CONVENTION_NAMES, "midpoint-convention", flags);
  const { chartAInput, chartBInput, astroModule, releaseSwissEphCleanup } = await parseTwoChartCommand(flags, payload, "astrology:davison", ctx);
  try {
    const { HouseSystem } = astroModule;
    const result = await astroModule.getDavisonChartFromOptions(
      buildBirthChartOptions(chartAInput, HouseSystem),
      buildBirthChartOptions(chartBInput, HouseSystem),
      { geographicMidpoint: convention }
    );
    ctx.throwIfInterrupted();
    if (isJsonMode(flags)) {
      outputJson({ ...result, input: { chartA: natalEcho(chartAInput), chartB: natalEcho(chartBInput) } }, flags);
      return;
    }
    console.log(cliText("\nDavison Chart\n"));
    console.log(cliText("  Midpoint (UTC): {0}", [result.midpointDateUtc.toISOString()]));
    console.log(cliText("  Midpoint place: {0}, {1}", [result.location.latitude.toFixed(4), result.location.longitude.toFixed(4)]));
    console.log(cliText("  Ascendant: {0} {1}", [result.chart.houses.ascendant.sign, result.chart.houses.ascendant.traditionalFormat]));
    console.log();
  } catch (err) {
    ctx.throwIfInterrupted();
    throw err;
  } finally {
    releaseSwissEphCleanup();
    astroModule.closeSwissEph();
  }
}

export async function cmdAstrologyOverlays(flags: Flags, payload: InputPayload, ctx: ExecutionContext): Promise<void> {
  const points = listOption(flags, payload, "points", "points");
  const includeAngles = !booleanOption(flags, payload, "no-angles", "noAngles");
  const { chartAInput, chartBInput, astroModule, releaseSwissEphCleanup } = await parseTwoChartCommand(flags, payload, "astrology:overlays", ctx);
  try {
    const { HouseSystem } = astroModule;
    const chartA = await astroModule.getBirthChart(buildBirthChartOptions(chartAInput, HouseSystem));
    const chartB = await astroModule.getBirthChart(buildBirthChartOptions(chartBInput, HouseSystem));
    ctx.throwIfInterrupted();
    if (points) {
      const known = new Set([...Object.keys(chartA.planets), "ascendant", "mc", "descendant", "ic"]);
      for (const name of points) {
        if (!known.has(name)) {
          exitWithError("INVALID_ARGUMENT", cliText("Unknown overlay point \"{0}\". Valid: {1}.", [name, [...known].join(", ")]), flags);
        }
      }
    }
    const overlays = astroModule.getHouseOverlays(chartA, chartB, { points, includeAngles });
    if (isJsonMode(flags)) {
      outputJson({ ...overlays, input: { chartA: natalEcho(chartAInput), chartB: natalEcho(chartBInput) } }, flags);
      return;
    }
    console.log(cliText("\nHouse Overlays\n"));
    for (const direction of [overlays.aInB, overlays.bInA]) {
      console.log(cliText("  {0} in {1}:", [direction.from, direction.into]));
      if (!direction.available) console.log(cliText("    unavailable: {0}", [direction.reason ?? ""]));
      for (const p of direction.placements) console.log(cliText("    {0} House {1}", [p.point.padEnd(14), p.house]));
    }
    console.log();
  } catch (err) {
    ctx.throwIfInterrupted();
    throw err;
  } finally {
    releaseSwissEphCleanup();
    astroModule.closeSwissEph();
  }
}

// ---------------------------------------------------------------------------
// Progressions, solar arc, returns, timelines
// ---------------------------------------------------------------------------

export async function cmdAstrologyProgressions(args: string[], flags: Flags, payload: InputPayload, ctx: ExecutionContext): Promise<void> {
  const natal = await readNatal(args, flags, payload, ctx);
  const { target, source } = readTarget(flags, payload);
  const yearLength = readYearLength(flags, payload);
  const conventions = enumList(listOption(flags, payload, "angle-conventions", "angleConventions"), ANGLE_CONVENTION_NAMES, "angle-conventions", flags);
  await withSwissEph(flags, ctx, async (astro) => {
    const natalChart = await astro.getBirthChart(buildBirthChartOptions(natal, astro.HouseSystem));
    const result = astro.getSecondaryProgressions({
      natalChart,
      natalLatitude: natal.latitude,
      natalLongitude: natal.longitude,
      target,
      yearLength,
      angleConventions: conventions,
    });
    const echo = { natal: natalEcho(natal), target: target.toISOString(), targetSource: source };
    if (isJsonMode(flags)) {
      outputJson({ ...result, input: echo }, flags);
      return;
    }
    console.log(cliText("\nSecondary Progressions at {0}\n", [target.toISOString()]));
    console.log(cliText("  Age: {0} years; progressed JD {1}", [result.ageYears.toFixed(3), result.progressedJd.toFixed(5)]));
    console.log(cliText("  Solar arc: {0} degrees", [result.solarArcDegrees.toFixed(4)]));
    console.log();
  });
}

export async function cmdAstrologySolarArc(args: string[], flags: Flags, payload: InputPayload, ctx: ExecutionContext): Promise<void> {
  const natal = await readNatal(args, flags, payload, ctx);
  const { target, source } = readTarget(flags, payload);
  const yearLength = readYearLength(flags, payload);
  const arcKind = enumValue(stringOption(flags, payload, "arc-kind", "arcKind"), ["true", "naibod"] as const, "arc-kind", flags);
  const targets = listOption(flags, payload, "targets", "targets");
  await withSwissEph(flags, ctx, async (astro) => {
    const natalChart = await astro.getBirthChart(buildBirthChartOptions(natal, astro.HouseSystem));
    if (targets) {
      const known = new Set([...Object.keys(natalChart.planets), "ascendant", "mc", "descendant", "ic"]);
      for (const name of targets) {
        if (!known.has(name)) {
          exitWithError("INVALID_ARGUMENT", cliText("Unknown solar-arc target \"{0}\". Valid: {1}.", [name, [...known].join(", ")]), flags);
        }
      }
    }
    const result = astro.getSolarArcDirections({
      natalChart,
      natalLatitude: natal.latitude,
      natalLongitude: natal.longitude,
      target,
      yearLength,
      arcKind,
      targets,
    });
    const echo = { natal: natalEcho(natal), target: target.toISOString(), targetSource: source };
    if (isJsonMode(flags)) {
      outputJson({ ...result, input: echo }, flags);
      return;
    }
    console.log(cliText("\nSolar Arc Directions at {0} (arc {1} degrees)\n", [target.toISOString(), result.arcDegrees.toFixed(4)]));
    for (const [name, point] of Object.entries(result.directed)) {
      console.log(cliText("    {0} {1} {2}", [name.padEnd(14), point.zodiacPosition.sign.padEnd(12), point.zodiacPosition.traditionalFormat]));
    }
    console.log();
  });
}

export async function cmdAstrologyReturns(args: string[], flags: Flags, payload: InputPayload, ctx: ExecutionContext): Promise<void> {
  const natal = await readNatal(args, flags, payload, ctx);
  const { from, to } = requireDates(flags, payload, cliText("Usage: kaabalah astrology:returns <date> [time] --lat=<N> --lon=<N> --from=<YYYY-MM-DD> --to=<YYYY-MM-DD>"));
  const kinds = enumList(listOption(flags, payload, "kinds", "kinds"), RETURN_PASS_KIND_NAMES, "kinds", flags);
  const stepDays = numberOption(flags, payload, "step-days", "stepDays");
  await withSwissEph(flags, ctx, async (astro) => {
    const natalChart = await astro.getBirthChart(buildBirthChartOptions(natal, astro.HouseSystem));
    const result = astro.getReturnPassTimeline({
      natalChart,
      from: civilToUtcDate(from),
      to: civilToUtcDate(to),
      kinds: kinds as never,
      stepDays,
    });
    ctx.throwIfInterrupted();
    if (isJsonMode(flags)) {
      outputJson({ ...result, input: { natal: natalEcho(natal), from: parseIso(from), toExclusive: parseIso(to), window: "UTC midnight to UTC midnight (end exclusive)" } }, flags);
      return;
    }
    console.log(cliText("\nReturn passes {0} to {1} (UTC, end exclusive)\n", [parseIso(from), parseIso(to)]));
    for (const e of result.entries) {
      console.log(cliText("    {0}  {1} {2} pass {3}/{4}", [e.instant.toISOString(), e.kind.padEnd(18), e.direction, e.passIndex, e.passCount]));
    }
    console.log();
  });
}

function parseIso(date: CivilDate): string {
  return `${String(date.year).padStart(4, "0")}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

export async function cmdAstrologyProfectionsTimeline(args: string[], flags: Flags, payload: InputPayload, ctx: ExecutionContext): Promise<void> {
  const natal = await readNatal(args, flags, payload, ctx);
  const fromAge = numberOption(flags, payload, "from-age", "fromAge");
  const toAge = numberOption(flags, payload, "to-age", "toAge");
  const hasAges = fromAge !== undefined || toAge !== undefined;
  const hasDates = stringOption(flags, payload, "from", "from") !== undefined || stringOption(flags, payload, "to", "to") !== undefined;
  if (hasAges === hasDates) {
    exitWithError("MISSING_ARGUMENT", cliText("Provide either --from-age and --to-age, or --from and --to dates."), flags);
  }
  if (hasAges && (fromAge === undefined || toAge === undefined)) {
    exitWithError("MISSING_ARGUMENT", cliText("Both --from-age and --to-age are required."), flags);
  }
  const range = hasAges
    ? { fromAge: fromAge as number, toAge: toAge as number }
    : requireDates(flags, payload, cliText("Both --from and --to are required."));
  const birth = parseCivilDate(natal.dateStr) as CivilDate;
  await withSwissEph(flags, ctx, async (astro) => {
    const natalChart = await astro.getBirthChart(buildBirthChartOptions(natal, astro.HouseSystem));
    const result = astro.getAnnualProfectionTimeline(natalChart, birth, range);
    if (isJsonMode(flags)) {
      outputJson({ ...result, input: { natal: natalEcho(natal) } }, flags);
      return;
    }
    console.log(cliText("\nAnnual profections\n"));
    for (const e of result.entries) {
      console.log(cliText("    age {0}  house {1}  {2}  ruler {3}  {4} to {5}", [String(e.age).padStart(3), String(e.house).padStart(2), e.sign.padEnd(12), e.ruler.padEnd(8), parseIso(e.start), parseIso(e.endExclusive)]));
    }
    console.log();
  });
}

export async function cmdAstrologyFirdariaTimeline(args: string[], flags: Flags, payload: InputPayload, ctx: ExecutionContext): Promise<void> {
  const natal = await readNatal(args, flags, payload, ctx);
  const toText = stringOption(flags, payload, "to", "to");
  if (!toText) exitWithError("MISSING_ARGUMENT", cliText("Usage: kaabalah astrology:firdaria:timeline <date> [time] --lat=<N> --lon=<N> --to=<YYYY-MM-DD> [--from=<YYYY-MM-DD>]"), flags);
  const to = civilToUtcDate(parseCivilDateInput(toText, flags));
  const fromCivil = civilOption(stringOption(flags, payload, "from", "from"), flags);
  const sect = enumValue(stringOption(flags, payload, "sect", "sect"), ["diurnal", "nocturnal"] as const, "sect", flags);
  const nodeStart = enumValue(stringOption(flags, payload, "node-sub-period-start", "nodeSubPeriodStart"), ["jupiter-saturn", "sun-mars"] as const, "node-sub-period-start", flags);
  const includeSubPeriods = !booleanOption(flags, payload, "no-sub-periods", "noSubPeriods");
  await withSwissEph(flags, ctx, async (astro) => {
    const chart = await astro.getBirthChart(buildBirthChartOptions(natal, astro.HouseSystem));
    const isDiurnal = sect ? sect === "diurnal" : chart.sect === "diurnal";
    const result = astro.getFirdariaTimeline(chart.dateUtc, isDiurnal, {
      from: fromCivil ? civilToUtcDate(fromCivil) : undefined,
      to,
      includeSubPeriods,
      nodeSubPeriodStart: nodeStart,
    });
    if (isJsonMode(flags)) {
      outputJson({ ...result, input: { natal: natalEcho(natal), sect: result.sect, window: "UTC midnight, end exclusive" } }, flags);
      return;
    }
    console.log(cliText("\nFirdaria timeline ({0})\n", [result.sect]));
    for (const e of result.entries) {
      console.log(cliText("    {0} {1} to {2}", [e.planet.padEnd(10), e.start.toISOString().slice(0, 10), e.endExclusive.toISOString().slice(0, 10)]));
    }
    console.log();
  });
}

// ---------------------------------------------------------------------------
// Jyotish
// ---------------------------------------------------------------------------

export async function cmdAstrologyJyotish(args: string[], flags: Flags, payload: InputPayload, ctx: ExecutionContext): Promise<void> {
  const natal = await readNatal(args, flags, payload, ctx);
  const frame = enumValue(stringOption(flags, payload, "frame", "frame"), NAKSHATRA_FRAME_NAMES, "frame", flags);
  const node = enumValue(stringOption(flags, payload, "node", "node"), NODE_CONVENTION_NAMES, "node", flags);
  const yearLengthDays = numberOption(flags, payload, "year-length-days", "yearLengthDays");
  if (yearLengthDays !== undefined && yearLengthDays <= 0) {
    exitWithError("INVALID_ARGUMENT", cliText("--year-length-days must be a positive number, got \"{0}\".", [yearLengthDays]), flags);
  }
  const schemeRaw = stringOption(flags, payload, "karaka-scheme", "karakaScheme") ?? (typeof payloadValue(payload, "karakaScheme") === "number" ? String(payloadValue(payload, "karakaScheme")) : undefined);
  const scheme = enumValue(schemeRaw, ["7", "8"] as const, "karaka-scheme", flags);
  const untimed = booleanOption(flags, payload, "untimed", "untimed");
  const asOfCivil = civilOption(stringOption(flags, payload, "as-of", "asOf"), flags);
  const throughCivil = civilOption(stringOption(flags, payload, "through", "through"), flags);
  await withSwissEph(flags, ctx, async (astro) => {
    const { toUtcDate } = await import("../../astrology/swisseph");
    const date = await toUtcDate(natal.birthDate, natal.latitude, natal.longitude, natal.timeZoneSettings as never);
    const chart = astro.getJyotishChart({
      date,
      latitude: natal.latitude,
      longitude: natal.longitude,
      nakshatraFrame: frame,
      node,
      yearLengthDays,
      karakaScheme: scheme ? (Number(scheme) as 7 | 8) : undefined,
      timed: !untimed,
      through: throughCivil ? civilToUtcDate(throughCivil) : undefined,
    });
    ctx.throwIfInterrupted();
    let activeDasha: Record<string, unknown> | undefined;
    if (asOfCivil) {
      const asOf = civilToUtcDate(asOfCivil, 12);
      activeDasha = {
        asOf: parseIso(asOfCivil),
        instant: "12:00 UTC of the as-of day",
        vimshottari: chart.vimshottari ? (astro.findActiveDasha(chart.vimshottari, asOf) ?? null) : null,
        yogini: chart.yogini ? (astro.findActiveDasha(chart.yogini, asOf) ?? null) : null,
      };
    }
    if (isJsonMode(flags)) {
      outputJson({ ...chart, ...(activeDasha ? { activeDasha } : {}), input: { natal: natalEcho(natal), birthUtc: date.toISOString(), untimed } }, flags);
      return;
    }
    console.log(cliText("\nJyotish chart (frame {0}, node {1})\n", [chart.nakshatraFrame, chart.node]));
    const moon = chart.nakshatraFrame === "dhruva" ? chart.dhruva.points.moon : chart.lahiri.points.moon;
    if (moon) console.log(cliText("  Moon nakshatra index: {0}", [moon.nakshatraIndex]));
    if (chart.vimshottari) console.log(cliText("  Vimshottari periods: {0}", [chart.vimshottari.mahas.length]));
    console.log();
  });
}

// ---------------------------------------------------------------------------
// Bulk collections
// ---------------------------------------------------------------------------

type Json = Record<string, unknown>;

function parseWallClock(item: Json, label: string, flags: Flags, requireTime: boolean) {
  const dateText = item.date;
  if (typeof dateText !== "string") exitWithError("MISSING_ARGUMENT", cliText("{0}: \"date\" is required (YYYY-MM-DD).", [label]), flags);
  const civil = parseCivilDateInput(dateText, flags);
  if (requireTime && item.time == null) {
    exitWithError("MISSING_ARGUMENT", cliText("{0}: \"time\" is required for a recorded or rectified birth time (use quality \"untimed\" otherwise).", [label]), flags);
  }
  const { hour, minute } = parseTimeValue(typeof item.time === "string" ? item.time : "12:00", flags, {
    invalidFormat: (value) => cliText("{0}: Invalid time format \"{1}\". Use HH:MM.", [label, value]),
    invalidValue: (value) => cliText("{0}: Invalid time \"{1}\". Hours 0-23, minutes 0-59.", [label, value]),
  });
  return { year: civil.year, month: civil.month, day: civil.day, hour, minute };
}

function coordinate(value: unknown, label: string, min: number, max: number, flags: Flags): number {
  const n = Number(value);
  if (value == null || !Number.isFinite(n) || n < min || n > max) {
    exitWithError("INVALID_ARGUMENT", cliText("{0} must be a number between {1} and {2}.", [label, min, max]), flags);
  }
  return n;
}

function buildManifest(raw: Json, flags: Flags, astro: AstrologyModule, pairModeFlag: string | undefined) {
  if (!Array.isArray(raw.people)) {
    exitWithError("INVALID_ARGUMENT", cliText("The manifest must be an object with a \"people\" array."), flags);
  }
  const defaultHouse = typeof raw.houseSystem === "string" ? raw.houseSystem : "placidus";
  const people = (raw.people as unknown[]).map((entry, index) => {
    const item = (entry ?? {}) as Json;
    const label = `people[${index}]`;
    if (typeof item.id !== "string" || item.id.length === 0) {
      exitWithError("INVALID_ARGUMENT", cliText("{0}: \"id\" must be a non-empty string.", [label]), flags);
    }
    const quality = enumValue(typeof item.quality === "string" ? item.quality : undefined, ["recorded", "rectified", "untimed", "partial"] as const, `${label}.quality`, flags);
    const timed = quality === undefined || quality === "recorded" || quality === "rectified";
    const date = parseWallClock(item, label, flags, timed);
    const houseSystem = parseHouseSystem(typeof item.houseSystem === "string" ? item.houseSystem : defaultHouse, flags, (value, valid) =>
      cliText("{0}: Unknown house system \"{1}\". Valid: {2}", [label, value, valid.join(", ")])
    ).houseSystemCode;
    return {
      id: item.id,
      quality,
      chart: {
        date,
        latitude: coordinate(item.lat, `${label}.lat`, -90, 90, flags),
        longitude: coordinate(item.lon, `${label}.lon`, -180, 180, flags),
        houseSystem: houseSystem as never,
        timeZoneSettings: typeof item.timezone === "string" ? { timeZone: item.timezone } : { autoTimeZone: true as const },
      },
    };
  });
  const events = Array.isArray(raw.events)
    ? (raw.events as unknown[]).map((entry, index) => {
        const item = (entry ?? {}) as Json;
        const label = `events[${index}]`;
        if (typeof item.id !== "string" || item.id.length === 0) {
          exitWithError("INVALID_ARGUMENT", cliText("{0}: \"id\" must be a non-empty string.", [label]), flags);
        }
        return {
          id: item.id,
          date: parseWallClock(item, label, flags, false),
          latitude: item.lat == null ? undefined : coordinate(item.lat, `${label}.lat`, -90, 90, flags),
          longitude: item.lon == null ? undefined : coordinate(item.lon, `${label}.lon`, -180, 180, flags),
          timeZoneSettings: typeof item.timezone === "string" ? { timeZone: item.timezone } : undefined,
        };
      })
    : undefined;

  let pairs: { mode: "all" } | { mode: "timed-only" } | { mode: "pairs"; pairs: [string, string][] } | undefined;
  const pairsRaw = raw.pairs as Json | undefined;
  const mode = enumValue(pairModeFlag ?? (typeof pairsRaw?.mode === "string" ? pairsRaw.mode : undefined), PAIR_MODE_NAMES, "pair-mode", flags);
  if (mode === "pairs") {
    if (!Array.isArray(pairsRaw?.pairs)) {
      exitWithError("INVALID_ARGUMENT", cliText("pair mode \"pairs\" needs \"pairs\": [[idA, idB], ...] in the manifest."), flags);
    }
    pairs = { mode: "pairs", pairs: pairsRaw!.pairs as [string, string][] };
  } else if (mode) {
    pairs = { mode };
  }
  void astro;
  return { people, events, pairs };
}

function readManifestFile(path: string, flags: Flags): string {
  try {
    if (statSync(path).size > MAX_MANIFEST_BYTES) {
      exitWithError("INVALID_ARGUMENT", cliText("Manifest file exceeds maximum size of {0} bytes.", [MAX_MANIFEST_BYTES]), flags);
    }
    return readFileSync(path, "utf8");
  } catch (err) {
    if ((err as { code?: string }).code === "ENOENT") {
      exitWithError("INVALID_ARGUMENT", cliText("Manifest file not found: {0}", [path]), flags);
    }
    throw err;
  }
}

async function loadManifest(flags: Flags, payload: InputPayload): Promise<Json> {
  const manifestFlag = stringOption(flags, null, "manifest", "manifest");
  if (manifestFlag === undefined) {
    if (payload) return payload;
    return exitWithError("MISSING_ARGUMENT", cliText("Usage: kaabalah astrology:collection --manifest=<file|-> (or --input-json with the manifest object)"), flags);
  }
  if (payload) {
    exitWithError("INVALID_ARGUMENT", cliText("Use either --manifest or --input-json, not both."), flags);
  }
  const text =
    manifestFlag === "-"
      ? await readStdin(flags, { emptyCode: "INVALID_JSON", emptyMessage: cliText("--manifest=- requires a JSON object on stdin."), maxBytes: MAX_MANIFEST_BYTES })
      : readManifestFile(manifestFlag, flags);
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error("not an object");
    return parsed as Json;
  } catch {
    return exitWithError("INVALID_JSON", cliText("The manifest is not a valid JSON object."), flags);
  }
}

export async function cmdAstrologyCollection(flags: Flags, payload: InputPayload, ctx: ExecutionContext): Promise<void> {
  const ndjson = booleanOption(flags, null, "ndjson", "ndjson");
  if (ndjson && typeof flags.fields === "string") {
    exitWithError("INVALID_ARGUMENT", cliText("--fields cannot be combined with --ndjson (records are streamed unmodified)."), flags);
  }
  const concurrency = numberOption(flags, null, "concurrency", "concurrency");
  const pairMode = stringOption(flags, null, "pair-mode", "pairMode");
  const includeCharts = booleanOption(flags, null, "include-charts", "includeCharts");
  const raw = await loadManifest(flags, payload);

  await withSwissEph(flags, ctx, async (astro) => {
    const manifest = buildManifest(raw, flags, astro, pairMode);
    let lastReported = -1;
    const options = {
      concurrency,
      includeCharts,
      signal: ctx.signal,
      aspectSpecs: raw.aspectSpecs as never,
      onProgress: (p: { phase: string; completed: number; total: number }) => {
        const step = Math.max(1, Math.ceil(p.total / 20));
        const key = p.phase === "pairs" ? p.completed : -p.completed;
        if (p.completed === p.total || p.completed % step === 0) {
          if (key !== lastReported) {
            lastReported = key;
            process.stderr.write(`collection ${p.phase}: ${p.completed}/${p.total}\n`);
          }
        }
      },
    };
    if (ndjson) {
      for await (const record of astro.iterateCollection(manifest as never, options)) {
        const ok = process.stdout.write(`${JSON.stringify(record)}\n`);
        if (!ok) await new Promise<void>((resolve) => process.stdout.once("drain", () => resolve()));
      }
      return;
    }
    const result = await astro.computeCollection(manifest as never, options);
    outputJson(result, flags);
  });
}

// ---------------------------------------------------------------------------
// Capabilities
// ---------------------------------------------------------------------------

export async function cmdCapabilities(flags: Flags, ctx: ExecutionContext): Promise<void> {
  const build = async (astro: AstrologyModule) => ({
    ...astro.getCapabilities(),
    cli: {
      version: VERSION,
      commands: COMMANDS.map((command) => command.name),
      globalFlags: GLOBAL_FLAGS.map((flag) => flag.name),
      errorCodes: [
        "INVALID_DATE",
        "INVALID_ARGUMENT",
        "MISSING_ARGUMENT",
        "UNKNOWN_COMMAND",
        "UNSUPPORTED_SYSTEM",
        "CARD_NOT_FOUND",
        "INDEX_OUT_OF_POOL",
        "INTERNAL_ERROR",
        "GEOCODE_ERROR",
        "WASM_INIT_ERROR",
        "INVALID_JSON",
      ],
      ndjson: "astrology:collection --ndjson streams one JSON record per line; every other command prints one JSON document",
    },
  });
  const result = flags.probe === true ? await withSwissEph(flags, ctx, build) : await build(await import("../../astrology"));
  if (isJsonMode(flags)) {
    outputJson(result, flags);
    return;
  }
  console.log(cliText("\nkaabalah v{0} capabilities (schema {1})\n", [VERSION, result.schemaVersion]));
  console.log(cliText("  Modules: {0}", [result.modules.join(", ")]));
  console.log(cliText("  Commands: {0}", [result.cli.commands.length]));
  console.log(cliText("  Ephemeris initialized: {0} (coverage {1})", [result.astrology.ephemeris.initialized, result.astrology.ephemeris.coverageSource]));
  console.log(cliText("  Use --json for the full machine-readable description."));
  console.log();
}
