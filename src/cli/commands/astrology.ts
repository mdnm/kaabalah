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

const MAJOR_ASPECTS = ["conjunction", "sextile", "square", "trine", "opposition"];

export async function cmdAstrologyTransits(
  args: string[],
  flags: Flags,
  inputPayload: InputPayload,
  executionContext: ExecutionContext
): Promise<void> {
  // Support --input-json with nested natal object
  const natalPayload = inputPayload?.natal as Record<string, unknown> | undefined;
  const effectiveArgs = natalPayload ? [] : args;
  const effectiveInputPayload = natalPayload
    ? { ...natalPayload }
    : inputPayload;

  const natalInput = await parseSingleChartRequest(effectiveArgs, flags, effectiveInputPayload, executionContext);
  const astroModule = await import("../../astrology");
  const { getTransitChart, getTransitRange, closeSwissEph, HouseSystem } = astroModule;
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
    // Parse transit-specific options
    const transitDateStr = (inputPayload?.transitDate as string) ?? getFlagString(flags, "transit-date");
    const transitTimeStr = (inputPayload?.transitTime as string) ?? getFlagString(flags, "transit-time") ?? "12:00";
    const transitLatFlag = inputPayload?.transitLat != null ? Number(inputPayload.transitLat) : getFlagNumber(flags, "transit-lat");
    const transitLonFlag = inputPayload?.transitLon != null ? Number(inputPayload.transitLon) : getFlagNumber(flags, "transit-lon");
    const transitTzStr = (inputPayload?.transitTimezone as string) ?? getFlagString(flags, "transit-timezone");

    const maxOrbFlag = inputPayload?.maxOrb != null ? Number(inputPayload.maxOrb) : getFlagNumber(flags, "max-orb");
    const aspectsStr = (inputPayload?.aspects as string | string[]) ?? getFlagString(flags, "aspects");
    const transitPlanetsStr = (inputPayload?.transitPlanets as string | string[]) ?? getFlagString(flags, "transit-planets");
    const natalPlanetsStr = (inputPayload?.natalPlanets as string | string[]) ?? getFlagString(flags, "natal-planets");

    const fromStr = (inputPayload?.from as string) ?? getFlagString(flags, "from");
    const toStr = (inputPayload?.to as string) ?? getFlagString(flags, "to");
    const stepDaysFlag = inputPayload?.stepDays != null ? Number(inputPayload.stepDays) : getFlagNumber(flags, "step-days");
    if (stepDaysFlag != null && (isNaN(stepDaysFlag) || stepDaysFlag <= 0)) {
      exitWithError("INVALID_ARGUMENT", `--step-days must be a positive number, got "${stepDaysFlag}".`, flags);
    }

    // Parse aspect filter
    let aspectFilter: string[] | undefined;
    if (aspectsStr) {
      const raw = Array.isArray(aspectsStr) ? aspectsStr : aspectsStr.split(",").map((s) => s.trim());
      aspectFilter = raw.flatMap((a) => (a === "major" ? MAJOR_ASPECTS : [a]));
    }

    // Parse planet filters
    const transitPlanets = transitPlanetsStr
      ? (Array.isArray(transitPlanetsStr) ? transitPlanetsStr : transitPlanetsStr.split(",").map((s) => s.trim().toLowerCase()))
      : undefined;
    const natalPlanets = natalPlanetsStr
      ? (Array.isArray(natalPlanetsStr) ? natalPlanetsStr : natalPlanetsStr.split(",").map((s) => s.trim().toLowerCase()))
      : undefined;

    // Build natal chart options
    const natalOpts = buildBirthChartOptions(natalInput, HouseSystem);

    // Transit timezone settings
    const transitTz = transitTzStr ? { timeZone: transitTzStr } : undefined;

    const isRangeMode = fromStr != null;

    if (isRangeMode) {
      if (!toStr) {
        exitWithError("MISSING_ARGUMENT", "--to is required when --from is specified.", flags);
      }
      parseDate(fromStr, flags);
      parseDate(toStr, flags);

      const fromDate = new Date(fromStr + "T00:00:00");
      const toDate = new Date(toStr + "T23:59:59.999");

      debugLog("astrology", "Running astrology:transits (range mode).", {
        natal: { date: natalInput.dateStr, time: natalInput.timeStr },
        from: fromStr,
        to: toStr,
        stepDays: stepDaysFlag ?? 1,
      });

      const result = await getTransitRange({
        natal: natalOpts,
        from: fromDate,
        to: toDate,
        stepDays: stepDaysFlag ?? undefined,
        transitLatitude: transitLatFlag ?? undefined,
        transitLongitude: transitLonFlag ?? undefined,
        transitTimeZoneSettings: transitTz,
        aspectSpecs: inputPayload?.aspectSpecs as any,
        maxOrb: maxOrbFlag ?? undefined,
        transitPlanets,
        natalPlanets,
        aspectFilter: aspectFilter as any,
      });
      executionContext.throwIfInterrupted();

      debugLog("astrology", "Completed astrology:transits (range).", {
        perfections: result.perfections.length,
      });

      if (isJsonMode(flags)) {
        outputJson({
          ...result,
          input: {
            natal: { date: natalInput.dateStr, time: natalInput.timeStr, lat: natalInput.latitude, lon: natalInput.longitude },
            from: fromStr,
            to: toStr,
            stepDays: stepDaysFlag ?? 1,
          },
        }, flags);
        return;
      }

      // Human-readable range output
      console.log(`\nTransit Range: ${fromStr} to ${toStr}`);
      console.log(`  Natal: ${natalInput.dateStr} ${natalInput.timeStr} (${natalInput.latitude}, ${natalInput.longitude})\n`);
      if (result.perfections.length === 0) {
        console.log("  No aspect perfections found in range.\n");
      } else {
        console.log(`  Aspect Perfections (${result.perfections.length}):\n`);
        for (const p of result.perfections) {
          const date = p.exactDate.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, " UTC");
          const rx = p.retrograde ? " R" : "";
          console.log(
            `    ${date}  ${p.transitPlanet.padEnd(14)}${rx.padEnd(3)} ${p.aspect.padEnd(12)} ${p.natalPlanet.padEnd(14)} orb ${p.exactOrb.toFixed(3)}°  [${p.category}]`
          );
        }
        console.log();
      }
    } else {
      // Single transit date mode
      let transitDate: Date;
      const effectiveTransitDateStr = transitDateStr ?? new Date().toISOString().split("T")[0];
      parseDate(effectiveTransitDateStr, flags);
      const { hour: tHour, minute: tMin } = parseTimeValue(transitTimeStr, flags, {
        invalidFormat: (v) => `Invalid transit time format: "${v}". Use HH:MM.`,
        invalidValue: (v) => `Invalid transit time: "${v}". Hours 0-23, minutes 0-59.`,
      });
      transitDate = buildBirthDate(effectiveTransitDateStr, tHour, tMin);

      debugLog("astrology", "Running astrology:transits.", {
        natal: { date: natalInput.dateStr, time: natalInput.timeStr },
        transitDate: transitDate.toISOString(),
      });

      const result = await getTransitChart({
        natal: natalOpts,
        transitDate,
        transitLatitude: transitLatFlag ?? undefined,
        transitLongitude: transitLonFlag ?? undefined,
        transitTimeZoneSettings: transitTz,
        aspectSpecs: inputPayload?.aspectSpecs as any,
        maxOrb: maxOrbFlag ?? undefined,
        transitPlanets,
        natalPlanets,
        aspectFilter: aspectFilter as any,
      });
      executionContext.throwIfInterrupted();

      debugLog("astrology", "Completed astrology:transits.", {
        transitPlanets: Object.keys(result.transitPlanets).length,
        aspects: result.aspects.length,
      });

      if (isJsonMode(flags)) {
        outputJson({
          ...result,
          input: {
            natal: { date: natalInput.dateStr, time: natalInput.timeStr, lat: natalInput.latitude, lon: natalInput.longitude },
            transitDate: transitDate.toISOString(),
          },
        }, flags);
        return;
      }

      // Human-readable single transit output
      const tdStr = transitDateStr ?? transitDate.toISOString().split("T")[0];
      console.log(`\nTransit Chart for ${tdStr} ${transitTimeStr}`);
      console.log(`  Natal: ${natalInput.dateStr} ${natalInput.timeStr} (${natalInput.latitude}, ${natalInput.longitude})\n`);

      console.log("  Transit Planets (in natal houses):");
      for (const [name, planet] of Object.entries(result.transitPlanets)) {
        const zp = planet.zodiacPosition;
        const rx = planet.retrograde ? "  R" : "   ";
        console.log(
          `    ${name.padEnd(14)}${rx} ${zp.sign.padEnd(12)} ${zp.traditionalFormat.padEnd(8)} Natal House ${planet.natalHouse}`
        );
      }

      console.log(`\n  Transit-to-Natal Aspects (${result.aspects.length}):\n`);
      for (const a of result.aspects) {
        const dir = a.applying ? "applying  " : "separating";
        const rx = a.retrograde ? " R" : "  ";
        console.log(
          `    ${a.planetA.padEnd(14)}${rx} ${a.aspect.padEnd(12)} ${a.planetB.padEnd(14)} orb ${a.orb.toFixed(2)}°  ${dir}  [${a.category}]`
        );
      }
      console.log();
    }
  } catch (err) {
    rethrowInterruptedOrError(err, executionContext);
  } finally {
    releaseSwissEphCleanup();
    closeSwissEph();
  }
}

export async function cmdAstrologySolarReturn(
  args: string[],
  flags: Flags,
  inputPayload: InputPayload,
  executionContext: ExecutionContext
): Promise<void> {
  // Support --input-json with nested natal object
  const natalPayload = inputPayload?.natal as Record<string, unknown> | undefined;
  const effectiveArgs = natalPayload ? [] : args;
  const effectiveInputPayload = natalPayload
    ? { ...natalPayload }
    : inputPayload;

  const natalInput = await parseSingleChartRequest(effectiveArgs, flags, effectiveInputPayload, executionContext);
  const astroModule = await import("../../astrology");
  const { getSolarReturnChart, closeSwissEph, HouseSystem } = astroModule;
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
    const yearFlag = inputPayload?.year != null ? Number(inputPayload.year) : getFlagNumber(flags, "year");
    const year = yearFlag ?? new Date().getFullYear();

    // SR location override
    const srLatFlag = inputPayload?.srLat != null ? Number(inputPayload.srLat) : getFlagNumber(flags, "sr-lat");
    const srLonFlag = inputPayload?.srLon != null ? Number(inputPayload.srLon) : getFlagNumber(flags, "sr-lon");
    const srLocationStr = (inputPayload?.srLocation as string) ?? getFlagString(flags, "sr-location");
    const srHouseSystemStr = (inputPayload?.srHouseSystem as string) ?? getFlagString(flags, "sr-house-system");

    let srLat = srLatFlag;
    let srLon = srLonFlag;

    if (srLat == null || srLon == null) {
      if (srLocationStr) {
        const geocoded = await geocodeLocation(srLocationStr, flags, executionContext);
        srLat = geocoded.latitude;
        srLon = geocoded.longitude;
      }
    }

    const srHouseSystem = srHouseSystemStr
      ? parseHouseSystem(srHouseSystemStr, flags, (value, valid) => `Unknown SR house system: "${value}". Valid: ${valid.join(", ")}`).houseSystemCode
      : undefined;

    debugLog("astrology", "Running astrology:solar-return.", {
      natal: { date: natalInput.dateStr, time: natalInput.timeStr },
      year,
      srLat,
      srLon,
    });

    const result = await getSolarReturnChart({
      natal: buildBirthChartOptions(natalInput, HouseSystem),
      year,
      solarReturnLatitude: srLat ?? undefined,
      solarReturnLongitude: srLon ?? undefined,
      solarReturnHouseSystem: srHouseSystem as any,
    });
    executionContext.throwIfInterrupted();

    debugLog("astrology", "Completed astrology:solar-return.", {
      exactReturnDate: result.exactReturnDate.toISOString(),
      natalSunLongitude: result.natalSunLongitude,
    });

    if (isJsonMode(flags)) {
      outputJson({
        ...result,
        input: {
          natal: { date: natalInput.dateStr, time: natalInput.timeStr, lat: natalInput.latitude, lon: natalInput.longitude },
          year,
          srLat: srLat ?? natalInput.latitude,
          srLon: srLon ?? natalInput.longitude,
        },
      }, flags);
      return;
    }

    // Human-readable output
    const srChart = result.solarReturnChart;
    const natalSun = result.natalChart.planets.sun.zodiacPosition;
    const returnDateStr = result.exactReturnDate.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, " UTC");

    console.log(`\nSolar Return ${year}\n`);
    console.log(`  Natal: ${natalInput.dateStr} ${natalInput.timeStr} (${natalInput.latitude}, ${natalInput.longitude})`);
    console.log(`  Natal Sun: ${natalSun.sign} ${natalSun.traditionalFormat} (${result.natalSunLongitude.toFixed(4)}°)`);
    console.log(`  Exact Return: ${returnDateStr}`);
    console.log(`  SR Sun: ${srChart.planets.sun.zodiacPosition.sign} ${srChart.planets.sun.zodiacPosition.traditionalFormat} (${srChart.planets.sun.longitude.toFixed(4)}°)`);

    console.log(`\n  Solar Return Planets:`);
    for (const [name, planet] of Object.entries(srChart.planets)) {
      const zp = planet.zodiacPosition;
      console.log(`    ${name.padEnd(14)} ${zp.sign.padEnd(12)} ${zp.traditionalFormat.padEnd(8)} House ${zp.house}`);
    }

    console.log(`\n  Solar Return Houses:`);
    console.log(`    Ascendant:  ${srChart.houses.ascendant.sign} ${srChart.houses.ascendant.traditionalFormat}`);
    console.log(`    Midheaven:  ${srChart.houses.mc.sign} ${srChart.houses.mc.traditionalFormat}`);
    console.log(`    Descendant: ${srChart.houses.dc.sign} ${srChart.houses.dc.traditionalFormat}`);
    console.log(`    IC:         ${srChart.houses.ic.sign} ${srChart.houses.ic.traditionalFormat}`);
    console.log(`\n  House Cusps:`);
    for (let i = 0; i < srChart.houses.houses.length; i++) {
      const house = srChart.houses.houses[i];
      console.log(`    House ${String(i + 1).padStart(2)}:  ${house.sign.padEnd(12)} ${house.traditionalFormat}`);
    }

    console.log(`\n  Solar Return Aspects (${srChart.aspects.length}):\n`);
    for (const aspect of srChart.aspects) {
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

export async function cmdAstrologyProfections(
  args: string[],
  flags: Flags,
  inputPayload: InputPayload,
  executionContext: ExecutionContext
): Promise<void> {
  const natalPayload = inputPayload?.natal as Record<string, unknown> | undefined;
  const effectiveArgs = natalPayload ? [] : args;
  const effectiveInputPayload = natalPayload ? { ...natalPayload } : inputPayload;

  const natalInput = await parseSingleChartRequest(effectiveArgs, flags, effectiveInputPayload, executionContext);
  const astroModule = await import("../../astrology");
  const { getBirthChart, getAnnualProfection, closeSwissEph, HouseSystem } = astroModule;
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
    const yearFlag = inputPayload?.year != null ? Number(inputPayload.year) : getFlagNumber(flags, "year");
    const year = yearFlag ?? new Date().getFullYear();

    // Force whole-sign houses for profections
    const chart = await getBirthChart({
      date: natalInput.birthDate,
      latitude: natalInput.latitude,
      longitude: natalInput.longitude,
      houseSystem: HouseSystem.WHOLE_SIGN,
      timeZoneSettings: natalInput.timeZoneSettings as any,
    });
    executionContext.throwIfInterrupted();

    const result = getAnnualProfection(chart, chart.dateUtc, year);

    if (isJsonMode(flags)) {
      outputJson({
        ...result,
        input: {
          date: natalInput.dateStr,
          time: natalInput.timeStr,
          lat: natalInput.latitude,
          lon: natalInput.longitude,
          year,
        },
      }, flags);
      return;
    }

    console.log(`\nAnnual Profection (${year})\n`);
    console.log(`  Natal: ${natalInput.dateStr} ${natalInput.timeStr} (${natalInput.latitude}, ${natalInput.longitude})`);
    console.log(`  Age: ${result.age}`);
    console.log(`  Profected House: ${result.house}`);
    console.log(`  Sign: ${result.sign}`);
    console.log(`  Time Lord: ${result.ruler}`);
    console.log();
  } catch (err) {
    rethrowInterruptedOrError(err, executionContext);
  } finally {
    releaseSwissEphCleanup();
    closeSwissEph();
  }
}

export async function cmdAstrologyProfectionsMonthly(
  args: string[],
  flags: Flags,
  inputPayload: InputPayload,
  executionContext: ExecutionContext
): Promise<void> {
  const natalPayload = inputPayload?.natal as Record<string, unknown> | undefined;
  const effectiveArgs = natalPayload ? [] : args;
  const effectiveInputPayload = natalPayload ? { ...natalPayload } : inputPayload;

  const natalInput = await parseSingleChartRequest(effectiveArgs, flags, effectiveInputPayload, executionContext);
  const astroModule = await import("../../astrology");
  const { getBirthChart, getMonthlyProfections, closeSwissEph, HouseSystem } = astroModule;
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
    const yearFlag = inputPayload?.year != null ? Number(inputPayload.year) : getFlagNumber(flags, "year");
    const year = yearFlag ?? new Date().getFullYear();

    const chart = await getBirthChart({
      date: natalInput.birthDate,
      latitude: natalInput.latitude,
      longitude: natalInput.longitude,
      houseSystem: HouseSystem.WHOLE_SIGN,
      timeZoneSettings: natalInput.timeZoneSettings as any,
    });
    executionContext.throwIfInterrupted();

    const result = getMonthlyProfections(chart, chart.dateUtc, year);

    if (isJsonMode(flags)) {
      outputJson({
        ...result,
        input: {
          date: natalInput.dateStr,
          time: natalInput.timeStr,
          lat: natalInput.latitude,
          lon: natalInput.longitude,
          year,
        },
      }, flags);
      return;
    }

    const ap = result.annualProfection;
    console.log(`\nMonthly Profections (${year})\n`);
    console.log(`  Natal: ${natalInput.dateStr} ${natalInput.timeStr} (${natalInput.latitude}, ${natalInput.longitude})`);
    console.log(`  Annual: House ${ap.house}, ${ap.sign} (${ap.ruler}), Age ${ap.age}\n`);
    for (const m of result.months) {
      const dateStr = m.startDate.toISOString().split("T")[0];
      console.log(`    Month ${String(m.month).padStart(2)}:  ${dateStr}  ${m.sign.padEnd(12)} ${m.ruler}`);
    }
    console.log();
  } catch (err) {
    rethrowInterruptedOrError(err, executionContext);
  } finally {
    releaseSwissEphCleanup();
    closeSwissEph();
  }
}

export async function cmdAstrologyFirdaria(
  args: string[],
  flags: Flags,
  inputPayload: InputPayload,
  executionContext: ExecutionContext
): Promise<void> {
  const natalPayload = inputPayload?.natal as Record<string, unknown> | undefined;
  const effectiveArgs = natalPayload ? [] : args;
  const effectiveInputPayload = natalPayload ? { ...natalPayload } : inputPayload;

  const natalInput = await parseSingleChartRequest(effectiveArgs, flags, effectiveInputPayload, executionContext);
  const astroModule = await import("../../astrology");
  const { getBirthChart, getFirdaria, closeSwissEph, HouseSystem } = astroModule;
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
    const chart = await getBirthChart(buildBirthChartOptions(natalInput, HouseSystem));
    executionContext.throwIfInterrupted();

    // Sect: auto-detect from chart or override
    const sectOverride = (inputPayload?.sect as string) ?? getFlagString(flags, "sect");
    let isDiurnal: boolean;
    if (sectOverride === "diurnal") {
      isDiurnal = true;
    } else if (sectOverride === "nocturnal") {
      isDiurnal = false;
    } else if (sectOverride) {
      exitWithError("INVALID_ARGUMENT", `Invalid sect value: "${sectOverride}". Use "diurnal" or "nocturnal".`, flags);
    } else {
      isDiurnal = chart.sect === "diurnal";
    }

    // Target date
    const targetDateStr = (inputPayload?.targetDate as string) ?? getFlagString(flags, "target-date");
    let targetDate: Date | undefined;
    if (targetDateStr) {
      parseDate(targetDateStr, flags);
      targetDate = new Date(targetDateStr + "T12:00:00");
    }

    const result = getFirdaria(chart.dateUtc, isDiurnal, targetDate);

    if (isJsonMode(flags)) {
      outputJson({
        ...result,
        input: {
          date: natalInput.dateStr,
          time: natalInput.timeStr,
          lat: natalInput.latitude,
          lon: natalInput.longitude,
          sect: isDiurnal ? "diurnal" : "nocturnal",
          targetDate: targetDateStr ?? "today",
        },
      }, flags);
      return;
    }

    console.log(`\nFirdaria (${isDiurnal ? "Diurnal" : "Nocturnal"})\n`);
    console.log(`  Natal: ${natalInput.dateStr} ${natalInput.timeStr} (${natalInput.latitude}, ${natalInput.longitude})`);
    console.log(`  Current Major: ${result.currentMajor.planet} (${result.currentMajor.years}y)`);
    console.log(`  Current Sub: ${result.currentSub.planet}`);
    console.log(`\n  All Periods:\n`);
    for (const p of result.allPeriods) {
      const start = p.startDate.toISOString().split("T")[0];
      const end = p.endDate.toISOString().split("T")[0];
      const marker = p === result.currentMajor ? " <--" : "";
      console.log(`    ${p.planet.padEnd(12)} ${start} to ${end} (${p.years}y)${marker}`);
    }
    console.log();
  } catch (err) {
    rethrowInterruptedOrError(err, executionContext);
  } finally {
    releaseSwissEphCleanup();
    closeSwissEph();
  }
}

export function cmdAstrologyDecans(
  args: string[],
  flags: Flags,
  inputPayload: InputPayload
): void {
  const lonStr = (inputPayload?.longitude as string) ?? args[0];
  if (lonStr == null) {
    exitWithError("MISSING_ARGUMENT", "Usage: kaabalah astrology:decans <longitude>", flags);
  }
  const longitude = Number(lonStr);
  if (isNaN(longitude)) {
    exitWithError("INVALID_ARGUMENT", `Invalid longitude: "${lonStr}". Must be a number.`, flags);
  }

  // Lazy-import to keep the module tree-shakable at the CLI level
  const { getDecan } = require("../../astrology");
  const result = getDecan(longitude);

  if (isJsonMode(flags)) {
    outputJson(result, flags);
    return;
  }

  console.log(`\nDecan for ${longitude}°\n`);
  console.log(`  Sign: ${result.sign}`);
  console.log(`  Decan: ${result.decanNumber}`);
  console.log(`  Ruler: ${result.ruler}`);
  console.log(`  Tarot: ${result.tarotCard}`);
  console.log(`  Range: ${result.startDegree}° – ${result.endDegree}°`);
  console.log();
}

export function cmdAstrologyDodecatemoria(
  args: string[],
  flags: Flags,
  inputPayload: InputPayload
): void {
  const lonStr = (inputPayload?.longitude as string) ?? args[0];
  if (lonStr == null) {
    exitWithError("MISSING_ARGUMENT", "Usage: kaabalah astrology:dodecatemoria <longitude>", flags);
  }
  const longitude = Number(lonStr);
  if (isNaN(longitude)) {
    exitWithError("INVALID_ARGUMENT", `Invalid longitude: "${lonStr}". Must be a number.`, flags);
  }

  const { getDodecatemoria } = require("../../astrology");
  const result = getDodecatemoria(longitude);

  if (isJsonMode(flags)) {
    outputJson(result, flags);
    return;
  }

  console.log(`\nDodecatemoria for ${longitude}°\n`);
  console.log(`  Original Sign: ${result.originalSign} (${result.originalDegree.toFixed(2)}°)`);
  console.log(`  12th Part: ${result.dodecatemoriaSign} (index ${result.dodecatemoriaIndex})`);
  console.log();
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
