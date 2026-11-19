import { cliText, currentCliLanguage } from "../runtime/language";
import { isJsonMode } from "../runtime/args";
import { exitWithError } from "../runtime/errors";
import type { ExecutionContext } from "../runtime/execution";
import { MAX_TEXT_LENGTH, sanitizeInput } from "../runtime/input";
import { stringOption } from "../runtime/options";
import { outputJson } from "../runtime/output";
import { parseDate } from "../runtime/validation";
import type { Flags, InputPayload } from "../runtime/types";
import { buildBirthChartOptions, parseSingleChartRequest, withSwissEph } from "./astrology";

type Semantic = typeof import("../../semantic");
type MapData = ReturnType<Semantic["buildKaabalisticMapData"]>;
type Marker = MapData["markers"][number];

function slimMarkers(markers: readonly Marker[] | undefined) {
  return (markers ?? []).map((marker) => ({ sourceName: marker.sourceName, mapping: marker.mapping, weight: marker.weight }));
}

/**
 * Weighted Tree of Life birth map. Numerology (birth date) always runs; gematria runs with --name;
 * astrology joins only when a birth time (and place) is given.
 */
export async function cmdTreeMap(args: string[], flags: Flags, payload: InputPayload, ctx: ExecutionContext): Promise<void> {
  const dateText = (payload?.date as string | undefined) ?? args[0];
  if (!dateText) {
    exitWithError("MISSING_ARGUMENT", cliText("Usage: kaabalah tree:map <YYYY-MM-DD> [HH:MM] [--lat=<N> --lon=<N>] [--name=\"Full Name\"]"), flags);
  }
  const rawName = stringOption(flags, payload, "name", "name");
  if (rawName !== undefined && rawName.length > MAX_TEXT_LENGTH) {
    exitWithError("INVALID_ARGUMENT", cliText("Text exceeds maximum length of {0} characters.", [MAX_TEXT_LENGTH]), flags);
  }
  const name = rawName === undefined ? "" : sanitizeInput(rawName).trim();
  const withAstrology = (payload?.time ?? args[1]) !== undefined;
  const birthDate = parseDate(dateText, flags);
  const natal = withAstrology ? await parseSingleChartRequest(args, flags, payload, ctx) : undefined;
  const language = currentCliLanguage();
  const semantic: Semantic = await import("../../semantic");

  const build = (chart: Parameters<Semantic["buildKaabalisticMapData"]>[0]["astrology"]) => {
    const map = semantic.buildKaabalisticMapData(
      { astrology: chart ?? null, numerology: birthDate, gematria: name.length > 0 ? name : null },
      language
    );
    const lit = new Set(map.rankedSpheres.map((row) => row.id));
    const result = {
      systems: { astrology: chart != null, numerology: true, gematria: name.length > 0 },
      note: chart != null
        ? null
        : cliText("No birth time: the map uses numerology and gematria only, astrology is left out."),
      rankedSpheres: map.rankedSpheres.map((row) => ({ ...row, markers: slimMarkers(map.sphereMarkers[row.id as keyof typeof map.sphereMarkers]) })),
      rankedPaths: map.rankedPaths.map((row) => ({ ...row, markers: slimMarkers(map.pathMarkers[row.id as keyof typeof map.pathMarkers]) })),
      unlitSpheres: map.spheres
        .filter((sphere) => !lit.has(sphere.id as never))
        .map((sphere) => ({ id: sphere.id, name: semantic.getKaabalisticLabel(String(sphere.name ?? sphere.id), language) })),
      weightsById: map.weightsById,
      rawWeightsById: map.rawWeightsById,
      input: {
        date: dateText,
        time: natal?.timeStr ?? null,
        lat: natal?.latitude ?? null,
        lon: natal?.longitude ?? null,
        name: name.length > 0 ? name : null,
      },
    };
    if (isJsonMode(flags)) {
      outputJson(result, flags);
      return;
    }
    console.log(cliText("\nTree of Life birth map: {0}\n", [dateText]));
    if (result.note) console.log(`  ${result.note}\n`);
    console.log(cliText("  Spheres:"));
    for (const row of result.rankedSpheres) console.log(cliText("    {0} {1}%  ({2} markers)", [row.name.padEnd(14), row.share.toFixed(1), row.markers.length]));
    console.log(cliText("\n  Paths:"));
    for (const row of result.rankedPaths) console.log(cliText("    {0} {1}%  ({2} markers)", [row.name.padEnd(24), row.share.toFixed(1), row.markers.length]));
    if (result.unlitSpheres.length > 0) console.log(cliText("\n  Spheres nothing lands on: {0}", [result.unlitSpheres.map((sphere) => sphere.name).join(", ")]));
    console.log();
  };

  if (!natal) {
    build(null);
    return;
  }
  await withSwissEph(flags, ctx, async (astro) => {
    const chart = await astro.getBirthChart(buildBirthChartOptions(natal, astro.HouseSystem));
    ctx.throwIfInterrupted();
    build(chart);
  });
}

/** House quests, Lightning Path and Serpent Path of a natal chart, in the requested language. */
export async function cmdTreePaths(args: string[], flags: Flags, payload: InputPayload, ctx: ExecutionContext): Promise<void> {
  const natal = await parseSingleChartRequest(args, flags, payload, ctx);
  const language = currentCliLanguage();
  const semantic: Semantic = await import("../../semantic");
  await withSwissEph(flags, ctx, async (astro) => {
    const chart = await astro.getBirthChart(buildBirthChartOptions(natal, astro.HouseSystem));
    ctx.throwIfInterrupted();
    const houseQuests = semantic.buildHouseQuests(chart, language);
    const lightningPath = semantic.buildLightningPath(chart, language);
    const serpentPath = semantic.buildSerpentPath(chart, language);
    if (isJsonMode(flags)) {
      outputJson(
        {
          language: language?.startsWith("pt") ? "pt-BR" : "en",
          houseQuests,
          lightningPath,
          serpentPath,
          houseSpheres: semantic.HOUSE_SPHERES,
          input: { date: natal.dateStr, time: natal.timeStr, lat: natal.latitude, lon: natal.longitude, houseSystem: natal.houseSystem },
        },
        flags
      );
      return;
    }
    console.log(cliText("\nTree of Life paths: {0} {1}\n", [natal.dateStr, natal.timeStr]));
    console.log(cliText("  House quests:"));
    for (const quest of houseQuests) console.log(`    ${quest.house}. ${quest.text}`);
    console.log(cliText("\n  Lightning Path:"));
    for (const step of lightningPath) console.log(`    ${step.step}. ${step.sphere} (${step.carrier} in ${step.sign}): ${step.text}`);
    console.log(cliText("\n  Serpent Path:"));
    for (const step of serpentPath) console.log(`    ${step.step}. ${step.sphere} (${step.carrier} in ${step.sign}): ${step.text}`);
    console.log();
  });
}
