import { getFlagNumber, getFlagString, isJsonMode } from "../runtime/args";
import { getGoogleMapsApiKey } from "../runtime/config";
import { debugLog } from "../runtime/debug";
import { exitWithError } from "../runtime/errors";
import { isAbortError, type ExecutionContext } from "../runtime/execution";
import { outputJson } from "../runtime/output";
import {
  buildBirthDate,
  parseChartInput,
  parseCoordinates,
  parseDate,
  parseHouseSystem,
  parseTimeValue,
  type ParsedChartInput,
} from "../runtime/validation";
import type { Flags, InputPayload } from "../runtime/types";

function rethrowInterruptedOrError(err: unknown, executionContext: ExecutionContext): never {
  executionContext.throwIfInterrupted();
  throw err;
}

function describeTimeZoneSettings(timeZoneSettings: ParsedChartInput["timeZoneSettings"]): string {
  return "timeZone" in timeZoneSettings ? timeZoneSettings.timeZone : "auto";
}

async function geocodeLocation(
  location: string,
  flags: Flags,
  executionContext: ExecutionContext
): Promise<{ latitude: number; longitude: number; formattedAddress: string }> {
  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    exitWithError(
      "GEOCODE_ERROR",
      "GOOGLE_MAPS_API_KEY or KAABALAH_GOOGLE_MAPS_API_KEY is required for --location. Set it or use --lat/--lon directly.",
      flags
    );
  }

  const url = "https://places.googleapis.com/v1/places:searchText";
  debugLog("geocode", "Starting geocoding request.", { location });

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location",
      },
      body: JSON.stringify({ textQuery: location, maxResultCount: 1 }),
      signal: executionContext.signal,
    });
  } catch (err) {
    if (isAbortError(err)) {
      executionContext.throwIfInterrupted();
    }
    exitWithError("GEOCODE_ERROR", `Geocoding request failed: ${err instanceof Error ? err.message : String(err)}`, flags);
  }

  const data = await response.json().catch((err: unknown) => {
    if (isAbortError(err)) {
      executionContext.throwIfInterrupted();
    }

    exitWithError("GEOCODE_ERROR", `Failed to parse geocoding response: ${err instanceof Error ? err.message : String(err)}`, flags);
  }) as {
    places?: Array<{
      displayName?: { text: string };
      formattedAddress?: string;
      location?: { latitude: number; longitude: number };
    }>;
    error?: { message: string; status: string };
  };

  debugLog("geocode", "Geocoding response received.", {
    location,
    status: response.status,
    ok: response.ok,
    candidates: data.places?.length ?? 0,
    hasError: data.error != null,
  });

  if (data.error) {
    exitWithError("GEOCODE_ERROR", `Geocoding failed for "${location}": ${data.error.message}`, flags);
  }

  if (!data.places || data.places.length === 0 || !data.places[0].location) {
    exitWithError("GEOCODE_ERROR", `No results found for "${location}".`, flags);
  }

  const place = data.places[0];
  const result = {
    latitude: place.location!.latitude,
    longitude: place.location!.longitude,
    formattedAddress: place.formattedAddress ?? place.displayName?.text ?? location,
  };

  debugLog("geocode", "Geocoding resolved coordinates.", result);
  return result;
}

function getAstrologyRuntimePaths(flags: Flags): { wasmPath: string; ephePath: string } {
  const path = require("path");

  return {
    wasmPath: getFlagString(flags, "wasm-path") ?? path.resolve(__dirname, "../wasm/build/swisseph.node.wasm"),
    ephePath: getFlagString(flags, "ephe-path") ?? path.resolve(__dirname, "../ephe"),
  };
}

async function initWasm(
  paths: { wasmPath: string; ephePath: string },
  executionContext: ExecutionContext
): Promise<void> {
  executionContext.throwIfInterrupted();
  debugLog("wasm", "Initializing Swiss Ephemeris.", paths);
  const { getSwissEph } = await import("../../astrology");
  await getSwissEph(paths);
  executionContext.throwIfInterrupted();
  debugLog("wasm", "Swiss Ephemeris initialized.", paths);
}

function buildBirthChartOptions(
  input: ParsedChartInput,
  HouseSystem: typeof import("../../astrology").HouseSystem
) {
  return {
    date: input.birthDate,
    latitude: input.latitude,
    longitude: input.longitude,
    houseSystem: input.houseSystemCode as unknown as typeof HouseSystem[keyof typeof HouseSystem],
    timeZoneSettings: input.timeZoneSettings as any,
  };
}

function formatInputEcho(chartAInput: ParsedChartInput, chartBInput: ParsedChartInput) {
  return {
    chartA: {
      date: chartAInput.dateStr,
      time: chartAInput.timeStr,
      lat: chartAInput.latitude,
      lon: chartAInput.longitude,
      houseSystem: chartAInput.houseSystem,
    },
    chartB: {
      date: chartBInput.dateStr,
      time: chartBInput.timeStr,
      lat: chartBInput.latitude,
      lon: chartBInput.longitude,
      houseSystem: chartBInput.houseSystem,
    },
  };
}

async function parseTwoChartCommand(
  flags: Flags,
  inputPayload: InputPayload,
  commandName: string,
  executionContext: ExecutionContext
) {
  if (!inputPayload?.chartA || !inputPayload?.chartB) {
    exitWithError("MISSING_ARGUMENT", `Usage: kaabalah ${commandName} --input-json=- < payload.json`, flags);
  }

  const defaults = {
    houseSystem: getFlagString(flags, "house-system"),
    timezone: getFlagString(flags, "timezone"),
  };
  const chartAInput = parseChartInput(inputPayload.chartA as Record<string, unknown>, "chartA", flags, defaults);
  const chartBInput = parseChartInput(inputPayload.chartB as Record<string, unknown>, "chartB", flags, defaults);
  const astroModule = await import("../../astrology");
  const releaseSwissEphCleanup = executionContext.registerCleanup(() => {
    astroModule.closeSwissEph();
  });
  const runtimePaths = getAstrologyRuntimePaths(flags);

  debugLog("astrology", `Parsed ${commandName} inputs.`, {
    chartA: {
      date: chartAInput.dateStr,
      time: chartAInput.timeStr,
      latitude: chartAInput.latitude,
      longitude: chartAInput.longitude,
      houseSystem: chartAInput.houseSystem,
      timezone: describeTimeZoneSettings(chartAInput.timeZoneSettings),
    },
    chartB: {
      date: chartBInput.dateStr,
      time: chartBInput.timeStr,
      latitude: chartBInput.latitude,
      longitude: chartBInput.longitude,
      houseSystem: chartBInput.houseSystem,
      timezone: describeTimeZoneSettings(chartBInput.timeZoneSettings),
    },
    runtimePaths,
  });

  try {
    await initWasm(runtimePaths, executionContext);
  } catch (err) {
    releaseSwissEphCleanup();
    astroModule.closeSwissEph();
    executionContext.throwIfInterrupted();
    exitWithError("WASM_INIT_ERROR", `Failed to initialize Swiss Ephemeris: ${err instanceof Error ? err.message : String(err)}`, flags);
  }

  return {
    chartAInput,
    chartBInput,
    astroModule,
    aspectSpecs: inputPayload.aspectSpecs as any,
    releaseSwissEphCleanup,
  };
}

async function parseSingleChartRequest(
  args: string[],
  flags: Flags,
  inputPayload: InputPayload,
  executionContext: ExecutionContext
): Promise<ParsedChartInput & { resolvedLocation?: string }> {
  const dateStr = (inputPayload?.date as string) ?? args[0];
  if (!dateStr) {
    exitWithError("MISSING_ARGUMENT", "Usage: kaabalah astrology <YYYY-MM-DD> [HH:MM] --lat=<N> --lon=<N>", flags);
  }
  parseDate(dateStr, flags);

  const { timeStr, hour, minute } = parseTimeValue((inputPayload?.time as string) ?? args[1] ?? "12:00", flags, {
    invalidFormat: (value) => `Invalid time format: "${value}". Use HH:MM format.`,
    invalidValue: (value) => `Invalid time: "${value}". Hours 0-23, minutes 0-59.`,
  });

  const locationStr = (inputPayload?.location as string) ?? getFlagString(flags, "location");
  const latFlag = inputPayload?.lat != null ? Number(inputPayload.lat) : getFlagNumber(flags, "lat");
  const lonFlag = inputPayload?.lon != null ? Number(inputPayload.lon) : getFlagNumber(flags, "lon");

  let resolvedLocation: string | undefined;
  let latitude: number | undefined = latFlag;
  let longitude: number | undefined = lonFlag;

  if (latitude == null || longitude == null) {
    if (!locationStr) {
      exitWithError(
        "MISSING_ARGUMENT",
        "Location is required. Use --lat=<N> --lon=<N> or --location=\"City, Country\" (requires GOOGLE_MAPS_API_KEY or KAABALAH_GOOGLE_MAPS_API_KEY).",
        flags
      );
    }

    const geocoded = await geocodeLocation(locationStr, flags, executionContext);
    latitude = geocoded.latitude;
    longitude = geocoded.longitude;
    resolvedLocation = geocoded.formattedAddress;
  }

  const coordinates = parseCoordinates(latitude, longitude, flags, {
    missing: "Location is required. Use --lat=<N> --lon=<N> or --location=\"City, Country\" (requires GOOGLE_MAPS_API_KEY or KAABALAH_GOOGLE_MAPS_API_KEY).",
    invalidLatitude: (value) => `Latitude must be between -90 and 90, got ${value}.`,
    invalidLongitude: (value) => `Longitude must be between -180 and 180, got ${value}.`,
  });

  const { houseSystem, houseSystemCode } = parseHouseSystem(
    (inputPayload?.houseSystem as string) ?? getFlagString(flags, "house-system") ?? "placidus",
    flags,
    (value, valid) => `Unknown house system: "${value}". Valid: ${valid.join(", ")}`
  );

  const timezoneStr = (inputPayload?.timezone as string) ?? getFlagString(flags, "timezone");
  const timeZoneSettings = timezoneStr ? { timeZone: timezoneStr } : { autoTimeZone: true };

  const parsedInput = {
    birthDate: buildBirthDate(dateStr, hour, minute),
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    houseSystem,
    houseSystemCode,
    timeZoneSettings,
    dateStr,
    timeStr,
    resolvedLocation,
  };

  debugLog("astrology", "Parsed astrology input.", {
    date: parsedInput.dateStr,
    time: parsedInput.timeStr,
    latitude: parsedInput.latitude,
    longitude: parsedInput.longitude,
    houseSystem: parsedInput.houseSystem,
    timezone: describeTimeZoneSettings(parsedInput.timeZoneSettings),
    resolvedLocation: parsedInput.resolvedLocation,
  });

  return parsedInput;
}

export async function cmdAstrologySynastry(
  flags: Flags,
  inputPayload: InputPayload,
  executionContext: ExecutionContext
): Promise<void> {
  const {
    chartAInput,
    chartBInput,
    astroModule,
    aspectSpecs,
    releaseSwissEphCleanup,
  } = await parseTwoChartCommand(flags, inputPayload, "astrology:synastry", executionContext);
  const { getSynastryChart, closeSwissEph, HouseSystem } = astroModule;

  try {
    debugLog("astrology", "Running astrology:synastry.", {
      chartA: { date: chartAInput.dateStr, time: chartAInput.timeStr },
      chartB: { date: chartBInput.dateStr, time: chartBInput.timeStr },
    });

    const result = await getSynastryChart({
      chartA: buildBirthChartOptions(chartAInput, HouseSystem),
      chartB: buildBirthChartOptions(chartBInput, HouseSystem),
      aspectSpecs,
    });
    executionContext.throwIfInterrupted();
    debugLog("astrology", "Completed astrology:synastry.", {
      aspects: result.aspects.length,
    });

    if (isJsonMode(flags)) {
      outputJson({ ...result, input: formatInputEcho(chartAInput, chartBInput) }, flags);
      return;
    }

    console.log(`\nSynastry Chart\n`);
    console.log(`  Chart A: ${chartAInput.dateStr} ${chartAInput.timeStr} (${chartAInput.latitude}, ${chartAInput.longitude})`);
    console.log(`  Chart B: ${chartBInput.dateStr} ${chartBInput.timeStr} (${chartBInput.latitude}, ${chartBInput.longitude})`);
    console.log(`\n  Cross-chart Aspects (${result.aspects.length}):\n`);
    for (const aspect of result.aspects) {
      console.log(`    ${aspect.planetA.padEnd(14)} ${aspect.aspect.padEnd(12)} ${aspect.planetB.padEnd(14)} orb ${aspect.orb.toFixed(2)}°`);
    }
    console.log();
  } catch (err) {
    rethrowInterruptedOrError(err, executionContext);
  } finally {
    releaseSwissEphCleanup();
    closeSwissEph();
  }
}

export async function cmdAstrologyComposite(
  flags: Flags,
  inputPayload: InputPayload,
  executionContext: ExecutionContext
): Promise<void> {
  const {
    chartAInput,
    chartBInput,
    astroModule,
    aspectSpecs,
    releaseSwissEphCleanup,
  } = await parseTwoChartCommand(flags, inputPayload, "astrology:composite", executionContext);
  const { getCompositeChart, closeSwissEph, HouseSystem } = astroModule;

  try {
    debugLog("astrology", "Running astrology:composite.", {
      chartA: { date: chartAInput.dateStr, time: chartAInput.timeStr },
      chartB: { date: chartBInput.dateStr, time: chartBInput.timeStr },
    });

    const result = await getCompositeChart({
      chartA: buildBirthChartOptions(chartAInput, HouseSystem),
      chartB: buildBirthChartOptions(chartBInput, HouseSystem),
      aspectSpecs,
    });
    executionContext.throwIfInterrupted();
    debugLog("astrology", "Completed astrology:composite.", {
      aspects: result.aspects.length,
      compositePlanets: Object.keys(result.compositePlanets).length,
    });

    if (isJsonMode(flags)) {
      outputJson({ ...result, input: formatInputEcho(chartAInput, chartBInput) }, flags);
      return;
    }

    console.log(`\nComposite Chart (Midpoint Method)\n`);
    console.log(`  Chart A: ${chartAInput.dateStr} ${chartAInput.timeStr} (${chartAInput.latitude}, ${chartAInput.longitude})`);
    console.log(`  Chart B: ${chartBInput.dateStr} ${chartBInput.timeStr} (${chartBInput.latitude}, ${chartBInput.longitude})`);
    console.log(`\n  Composite Planets:`);
    for (const [name, planet] of Object.entries(result.compositePlanets)) {
      const zodiacPosition = planet.zodiacPosition;
      console.log(`    ${name.padEnd(14)} ${zodiacPosition.sign.padEnd(12)} ${zodiacPosition.traditionalFormat.padEnd(8)} House ${zodiacPosition.house}`);
    }
    console.log(`\n  Composite House Cusps:`);
    for (let i = 0; i < result.compositeHouses.length; i++) {
      const house = result.compositeHouses[i];
      console.log(`    House ${String(i + 1).padStart(2)}:  ${house.sign.padEnd(12)} ${house.traditionalFormat}`);
    }
    console.log(`\n  Composite Aspects (${result.aspects.length}):\n`);
    for (const aspect of result.aspects) {
      console.log(`    ${aspect.planetA.padEnd(14)} ${aspect.aspect.padEnd(12)} ${aspect.planetB.padEnd(14)} orb ${aspect.orb.toFixed(2)}°`);
    }
    console.log();
  } catch (err) {
    rethrowInterruptedOrError(err, executionContext);
  } finally {
    releaseSwissEphCleanup();
    closeSwissEph();
  }
}

export async function cmdAstrology(
  args: string[],
  flags: Flags,
  inputPayload: InputPayload,
  executionContext: ExecutionContext
): Promise<void> {
  const input = await parseSingleChartRequest(args, flags, inputPayload, executionContext);
  const astroModule = await import("../../astrology");
  const { getSwissEph, closeSwissEph, getBirthChart, HouseSystem } = astroModule;
  const releaseSwissEphCleanup = executionContext.registerCleanup(() => {
    astroModule.closeSwissEph();
  });
  const runtimePaths = getAstrologyRuntimePaths(flags);

  try {
    await initWasm(runtimePaths, executionContext);
  } catch (err) {
    releaseSwissEphCleanup();
    closeSwissEph();
    executionContext.throwIfInterrupted();
    exitWithError("WASM_INIT_ERROR", `Failed to initialize Swiss Ephemeris: ${err instanceof Error ? err.message : String(err)}`, flags);
  }

  try {
    debugLog("astrology", "Running astrology.", {
      date: input.dateStr,
      time: input.timeStr,
      latitude: input.latitude,
      longitude: input.longitude,
      houseSystem: input.houseSystem,
      timezone: describeTimeZoneSettings(input.timeZoneSettings),
    });

    const chart = await getBirthChart({
      date: input.birthDate,
      latitude: input.latitude,
      longitude: input.longitude,
      houseSystem: input.houseSystemCode as unknown as typeof HouseSystem[keyof typeof HouseSystem],
      timeZoneSettings: input.timeZoneSettings as any,
    });
    executionContext.throwIfInterrupted();
    debugLog("astrology", "Completed astrology.", {
      planets: Object.keys(chart.planets).length,
      nodes: Object.keys(chart.nodes ?? {}).length,
      aspects: chart.aspects.length,
    });

    if (isJsonMode(flags)) {
      const result: Record<string, unknown> = { ...chart };
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

    console.log(`\nBirth Chart: ${input.dateStr} ${input.timeStr}\n`);
    if (input.resolvedLocation) {
      console.log(`  Location: ${input.resolvedLocation}`);
    }
    console.log(`  Coordinates: ${input.latitude.toFixed(4)}, ${input.longitude.toFixed(4)}`);
    console.log(`  House System: ${input.houseSystem}`);
    console.log(`  UTC Date: ${chart.dateUtc.toISOString()}`);
    console.log(`\n  Planets:`);
    for (const [name, planet] of Object.entries(chart.planets)) {
      const zodiacPosition = planet.zodiacPosition;
      console.log(`    ${name.padEnd(14)} ${zodiacPosition.sign.padEnd(12)} ${zodiacPosition.traditionalFormat.padEnd(8)} House ${zodiacPosition.house}`);
    }
    console.log(`\n  Houses:`);
    console.log(`    Ascendant:  ${chart.houses.ascendant.sign} ${chart.houses.ascendant.traditionalFormat}`);
    console.log(`    Midheaven:  ${chart.houses.mc.sign} ${chart.houses.mc.traditionalFormat}`);
    console.log(`    Descendant: ${chart.houses.dc.sign} ${chart.houses.dc.traditionalFormat}`);
    console.log(`    IC:         ${chart.houses.ic.sign} ${chart.houses.ic.traditionalFormat}`);
    console.log(`\n  House Cusps:`);
    for (let i = 0; i < chart.houses.houses.length; i++) {
      const house = chart.houses.houses[i];
      console.log(`    House ${String(i + 1).padStart(2)}:  ${house.sign.padEnd(12)} ${house.traditionalFormat}`);
    }
    if (chart.nodes && Object.keys(chart.nodes).length > 0) {
      console.log(`\n  Nodes:`);
      for (const [, node] of Object.entries(chart.nodes)) {
        console.log(`    ${node.name.padEnd(18)} ${node.sign.padEnd(12)} ${node.traditionalFormat.padEnd(8)} House ${node.house}`);
      }
    }
    console.log();
  } catch (err) {
    rethrowInterruptedOrError(err, executionContext);
  } finally {
    releaseSwissEphCleanup();
    closeSwissEph();
  }
}
