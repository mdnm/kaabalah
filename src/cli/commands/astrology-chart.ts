import { cliText } from "../runtime/language";
import { cliValue } from "../runtime/content";
import { toMarkdownTable, chartPointsTable, aspectEdgesTable, type TableData } from "../../tabulate";

import { isJsonMode } from "../runtime/args";
import { exitWithError } from "../runtime/errors";
import type { ExecutionContext } from "../runtime/execution";
import { INPUT_QUALITY_NAMES } from "../runtime/astro-names";
import { booleanOption, enumValue, listOption, stringOption } from "../runtime/options";
import { outputJson } from "../runtime/output";
import { parseHouseSystem, parseTimeValue, validateDateString } from "../runtime/validation";
import type { Flags, InputPayload } from "../runtime/types";
import {
  parseAnalysisOptions,
  hasPolicy,
  resolveOrbPolicy,
  shapePolicyResult,
  type AnalysisOptions,
} from "./astrology-analysis";
import {
  filterChartAspects,
  formatSingleChartInputEcho,
  parseAspectTypeFilter,
  parseMaxOrb,
  parseSingleChartRequest,
  withSwissEph,
  type AstrologyModule,
} from "./astrology";

const OUTPUT_FORMATS = ["json", "table", "markdown"] as const;
type OutputFormat = (typeof OUTPUT_FORMATS)[number];

function parseFormat(flags: Flags, payload: InputPayload): OutputFormat {
  return enumValue(stringOption(flags, payload, "format", "format"), OUTPUT_FORMATS, "format", flags) ?? "json";
}

function chartTables(chart: Parameters<typeof chartPointsTable>[0], aspects: Parameters<typeof aspectEdgesTable>[0]): { points: TableData; aspects: TableData } {
  return { points: chartPointsTable(chart), aspects: aspectEdgesTable(aspects) };
}

interface QualifiedRequest {
  quality: (typeof INPUT_QUALITY_NAMES)[number];
  dateText: string;
  latitude?: number;
  longitude?: number;
  timeZoneSettings: { timeZone: string } | { autoTimeZone: true };
}

function parsePartialDate(text: string, flags: Flags): { year?: number; month?: number; day?: number } {
  const match = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(text);
  if (!match) {
    exitWithError("INVALID_DATE", cliText("Invalid partial date: \"{0}\". Use YYYY, YYYY-MM or YYYY-MM-DD with --quality=partial.", [text]), flags);
  }
  const year = Number(match[1]);
  if (year < 1) exitWithError("INVALID_DATE", cliText("Year must be between 0001 and 9999, got {0}.", [year]), flags);
  const parts: { year?: number; month?: number; day?: number } = { year };
  if (match[2]) {
    const month = Number(match[2]);
    if (month < 1 || month > 12) exitWithError("INVALID_DATE", cliText("Invalid partial date: \"{0}\". The date does not exist in the calendar.", [text]), flags);
    parts.month = month;
  }
  if (match[3]) {
    validateDateString(text, flags);
    parts.day = Number(match[3]);
  }
  return parts;
}

async function cmdQualifiedWithoutTime(
  args: string[],
  flags: Flags,
  payload: InputPayload,
  executionContext: ExecutionContext,
  quality: "untimed" | "partial",
  analysis: AnalysisOptions
): Promise<void> {
  const dateText = (payload?.date as string | undefined) ?? args[0];
  if (!dateText) {
    exitWithError("MISSING_ARGUMENT", cliText("Usage: kaabalah astrology <YYYY-MM-DD> --quality={0} [--lat=<N> --lon=<N>]", [quality]), flags);
  }
  if ((payload?.time ?? args[1]) !== undefined) {
    exitWithError("INVALID_ARGUMENT", cliText("--quality={0} does not take a birth time; remove the time or use --quality=recorded.", [quality]), flags);
  }
  if (flags["house-systems"] !== undefined) {
    exitWithError("INVALID_ARGUMENT", cliText("--house-systems needs a birth time (--quality=recorded or rectified)."), flags);
  }
  const parts = quality === "partial" ? parsePartialDate(dateText, flags) : (() => {
    validateDateString(dateText, flags);
    const [year, month, day] = dateText.split("-").map(Number);
    return { year, month, day };
  })();

  const latRaw = payload?.lat ?? (flags.lat as string | undefined);
  const lonRaw = payload?.lon ?? (flags.lon as string | undefined);
  const latitude = latRaw !== undefined ? Number(latRaw) : undefined;
  const longitude = lonRaw !== undefined ? Number(lonRaw) : undefined;
  if ((latitude === undefined) !== (longitude === undefined)) {
    exitWithError("MISSING_ARGUMENT", cliText("Provide both --lat and --lon, or neither."), flags);
  }
  if (latitude !== undefined && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) {
    exitWithError("INVALID_ARGUMENT", cliText("Latitude must be between -90 and 90, got {0}.", [latitude]), flags);
  }
  if (longitude !== undefined && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)) {
    exitWithError("INVALID_ARGUMENT", cliText("Longitude must be between -180 and 180, got {0}.", [longitude]), flags);
  }
  const timezone = stringOption(flags, payload, "timezone", "timezone");
  const timeZoneSettings = timezone ? { timeZone: timezone } : { autoTimeZone: true as const };
  const placeRole = enumValue(stringOption(flags, payload, "place-role", "placeRole"), ["birthplace", "residence", "event", "unknown"] as const, "place-role", flags);
  const aspectFilter = parseAspectTypeFilter(flags, payload);
  const maxOrb = parseMaxOrb(flags, payload);

  await withSwissEph(flags, executionContext, async (astro) => {
    const qualified = await astro.getQualifiedChart({
      quality,
      date: parts,
      latitude,
      longitude,
      timeZoneSettings,
      localMeanTime: booleanOption(flags, payload, "local-mean-time", "localMeanTime") || undefined,
      placeRole,
      analysis: analysis.points ? { include: analysis.points as never } : undefined,
    });
    executionContext.throwIfInterrupted();
    const result: Record<string, unknown> = {
      ...qualified,
      input: { date: dateText, quality, latitude: latitude ?? null, longitude: longitude ?? null, timezone: timezone ?? (latitude === undefined ? "none (no place)" : "auto") },
    };
    if (hasPolicy(analysis)) {
      const policy = resolveOrbPolicy(astro, analysis, aspectFilter, flags);
      const policyResult = astro.computeAspectsWithPolicy(qualified.analysisPoints, policy, { maxOrb });
      result.policyAspects = shapePolicyResult(policyResult, analysis, maxOrb);
    }
    if (isJsonMode(flags)) {
      outputJson(result, flags);
      return;
    }
    console.log(cliText("\nChart ({0}): {1}\n", [quality, dateText]));
    console.log(cliText("  Status: {0}", [qualified.status]));
    if (qualified.moonDayRange) console.log(cliText("  Moon signs during the local day: {0}", [qualified.moonDayRange.signs.join(" -> ")]));
    for (const item of qualified.unavailable) console.log(cliText("  Unavailable: {0} ({1})", [item.item, item.reason]));
    console.log(cliText("  Points computed (placeholder noon positions for untimed): {0}", [qualified.points.length]));
    console.log();
  });
}

export async function cmdAstrologyChart(
  args: string[],
  flags: Flags,
  inputPayload: InputPayload,
  executionContext: ExecutionContext
): Promise<void> {
  const quality = enumValue(stringOption(flags, inputPayload, "quality", "quality"), INPUT_QUALITY_NAMES, "quality", flags);
  const analysis = parseAnalysisOptions(flags, inputPayload);
  const format = parseFormat(flags, inputPayload);
  if (quality === "untimed" || quality === "partial") {
    await cmdQualifiedWithoutTime(args, flags, inputPayload, executionContext, quality, analysis);
    return;
  }

  if (quality && (inputPayload?.time ?? args[1]) === undefined) {
    exitWithError("MISSING_ARGUMENT", cliText("--quality={0} requires an explicit birth time (HH:MM).", [quality]), flags);
  }
  const houseSystemNames = listOption(flags, inputPayload, "house-systems", "houseSystems");
  const houseSystemCodes = houseSystemNames?.map((name) =>
    parseHouseSystem(name, flags, (value, valid) => cliText("Unknown house system: \"{0}\". Valid: {1}", [value, valid.join(", ")])).houseSystemCode
  );

  const input = await parseSingleChartRequest(args, flags, inputPayload, executionContext);
  const maxOrb = parseMaxOrb(flags, inputPayload);
  const aspectFilter = parseAspectTypeFilter(flags, inputPayload);

  await withSwissEph(flags, executionContext, async (astroModule) => {
    const { getBirthChart, HouseSystem } = astroModule;

    let chart: Awaited<ReturnType<typeof getBirthChart>>;
    let qualifiedExtra: Record<string, unknown> | undefined;
    if (quality === "recorded" || quality === "rectified") {
      const qualified = await astroModule.getQualifiedChart({
        quality,
        date: {
          year: input.birthDate.getFullYear(),
          month: input.birthDate.getMonth() + 1,
          day: input.birthDate.getDate(),
          hour: input.birthDate.getHours(),
          minute: input.birthDate.getMinutes(),
        },
        latitude: input.latitude,
        longitude: input.longitude,
        houseSystem: input.houseSystemCode as unknown as (typeof HouseSystem)[keyof typeof HouseSystem],
        timeZoneSettings: input.timeZoneSettings as never,
        localMeanTime: booleanOption(flags, inputPayload, "local-mean-time", "localMeanTime") || undefined,
        placeRole: enumValue(stringOption(flags, inputPayload, "place-role", "placeRole"), ["birthplace", "residence", "event", "unknown"] as const, "place-role", flags),
        analysis: {
          include: analysis.points as never,
          excludeRectifiedAngles: booleanOption(flags, inputPayload, "exclude-rectified-angles", "excludeRectifiedAngles") || undefined,
        },
      });
      chart = qualified.chart as typeof chart;
      qualifiedExtra = {
        quality: qualified.quality,
        status: qualified.status,
        unavailable: qualified.unavailable,
        provenance: qualified.provenance,
        analysisPoints: qualified.analysisPoints,
      };
    } else {
      chart = await getBirthChart({
        date: input.birthDate,
        latitude: input.latitude,
        longitude: input.longitude,
        houseSystem: input.houseSystemCode as unknown as (typeof HouseSystem)[keyof typeof HouseSystem],
        timeZoneSettings: input.timeZoneSettings as never,
      });
    }

    const filteredChart = filterChartAspects(chart, { maxOrb, aspectFilter });
    executionContext.throwIfInterrupted();

    const extras: Record<string, unknown> = {};
    if (qualifiedExtra) extras.qualified = qualifiedExtra;
    if (analysis.points) {
      extras.points = astroModule.getChartPoints(chart, { include: analysis.points as never });
    }
    if (hasPolicy(analysis)) {
      const policy = resolveOrbPolicy(astroModule, analysis, aspectFilter, flags);
      const policyResult = astroModule.computeAspectsWithPolicy(astroModule.getChartPoints(chart), policy, {
        include: analysis.points as never,
        maxOrb,
      });
      extras.policyAspects = shapePolicyResult(policyResult, analysis, maxOrb);
    }
    if (houseSystemCodes) {
      const multi = await astroModule.getHousesForSystems(
        { date: chart.dateUtc, latitude: input.latitude, longitude: input.longitude, timeZoneSettings: { treatAsUTC: true } },
        houseSystemCodes as never
      );
      const { points: _points, ...rest } = multi;
      extras.houseSystems = rest;
    }

    if (format === "table" || format === "markdown") {
      const tables = chartTables(filteredChart as never, filteredChart.aspects as never);
      if (format === "markdown") {
        process.stdout.write(`${toMarkdownTable(tables.points)}\n\n${toMarkdownTable(tables.aspects)}\n`);
        return;
      }
      outputJson({ pointsTable: tables.points, aspectsTable: tables.aspects, input: formatSingleChartInputEcho(input) }, flags);
      return;
    }

    if (isJsonMode(flags)) {
      const result: Record<string, unknown> = { ...filteredChart, ...extras };
      if (input.resolvedLocation) {
        result.resolvedLocation = input.resolvedLocation;
      }
      result.input = {
        date: input.dateStr,
        time: input.timeStr,
        latitude: input.latitude,
        longitude: input.longitude,
        houseSystem: input.houseSystem,
        timezone: "timeZone" in input.timeZoneSettings ? input.timeZoneSettings.timeZone : "auto",
      };
      outputJson(result, flags);
      return;
    }

    console.log(cliText("\nBirth Chart: {0} {1}\n", [input.dateStr, input.timeStr]));
    if (input.resolvedLocation) {
      console.log(cliText("  Location: {0}", [input.resolvedLocation]));
    }
    console.log(cliText("  Coordinates: {0}, {1}", [input.latitude.toFixed(4), input.longitude.toFixed(4)]));
    console.log(cliText("  House System: {0}", [input.houseSystem]));
    console.log(cliText("  UTC Date: {0}", [filteredChart.dateUtc.toISOString()]));
    console.log(cliText("\n  Planets:"));
    for (const [name, planet] of Object.entries(filteredChart.planets)) {
      const zodiacPosition = planet.zodiacPosition;
      console.log(cliText("    {0} {1} {2} House {3}", [name.padEnd(14), cliValue(zodiacPosition.sign.padEnd(12)), cliValue(zodiacPosition.traditionalFormat.padEnd(8)), zodiacPosition.house]));
    }
    console.log(cliText("\n  Houses:"));
    console.log(cliText("    Ascendant:  {0} {1}", [cliValue(filteredChart.houses.ascendant.sign), cliValue(filteredChart.houses.ascendant.traditionalFormat)]));
    console.log(cliText("    Midheaven:  {0} {1}", [cliValue(filteredChart.houses.mc.sign), cliValue(filteredChart.houses.mc.traditionalFormat)]));
    console.log(cliText("    Descendant: {0} {1}", [cliValue(filteredChart.houses.dc.sign), cliValue(filteredChart.houses.dc.traditionalFormat)]));
    console.log(cliText("    IC:         {0} {1}", [cliValue(filteredChart.houses.ic.sign), cliValue(filteredChart.houses.ic.traditionalFormat)]));
    console.log(cliText("\n  House Cusps:"));
    for (let i = 0; i < filteredChart.houses.houses.length; i++) {
      const house = filteredChart.houses.houses[i];
      console.log(cliText("    House {0}:  {1} {2}", [String(i + 1).padStart(2), cliValue(house.sign.padEnd(12)), cliValue(house.traditionalFormat)]));
    }
    if (filteredChart.nodes && Object.keys(filteredChart.nodes).length > 0) {
      console.log(cliText("\n  Nodes:"));
      for (const [, node] of Object.entries(filteredChart.nodes)) {
        console.log(cliText("    {0} {1} {2} House {3}", [cliValue(node.name.padEnd(18)), cliValue(node.sign.padEnd(12)), cliValue(node.traditionalFormat.padEnd(8)), node.house]));
      }
    }
    console.log();
  });
}
