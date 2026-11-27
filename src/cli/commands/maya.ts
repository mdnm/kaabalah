import {
  calculateMayaBirthCycles, calculateMayaNatal, calculateMayaRelationship, calculateMayaTiming,
  getMayaBirthCycleReading, getMayaCalendarBoard, getMayaCalendarDay, getMayaDaySignReference, getMayaHaabDate,
  getMayaHaabMonthReference,
  getMayaNatalReading, listMayaDaySignReferences, MAYA_JOHNSON_METHOD,
  getMayaPersonalLunarMonthGuidance, getMayaRelationshipReading,
  getMayaSunsetWelcome,
  getMayaStageDescription, getMayaToneDescription, getMayaTrecenaGuidance, getMayaYearLordReading,
  type MayaCrossRole,
  type MayaLunarPhase,
  type MayaHaabDate,
  type MayaPersonalLunarMonthGuidance,
  type MayaSolarQuarter,
  type MayaStage,
  type MayaTone,
  type TzolkinDay,
} from "../../maya";
import { formatCivilDate, type CivilDate } from "../../civil-date";
import { isJsonMode } from "../runtime/args";
import { exitWithError } from "../runtime/errors";
import type { ExecutionContext } from "../runtime/execution";
import { cliText, currentCliLanguage } from "../runtime/language";
import { booleanOption, numberOption, payloadValue, stringOption } from "../runtime/options";
import { outputJson } from "../runtime/output";
import { parseCivilDateInput, parseOffsetTimestamp } from "../runtime/validation";
import type { Flags, InputPayload } from "../runtime/types";
import { getAstrologyRuntimePaths, initWasm, resolveChartLocation, withSwissEph } from "./astrology";

function dateArgument(value: unknown, key: string, flags: Flags) {
  if (value === undefined) {
    exitWithError("MISSING_ARGUMENT", cliText("Maya requires the {0} date (YYYY-MM-DD).", [key]), flags);
  }
  if (typeof value !== "string") {
    exitWithError("INVALID_DATE", cliText("Maya date {0} must be a YYYY-MM-DD string.", [key]), flags);
  }
  return parseCivilDateInput(value, flags);
}

function label(day: TzolkinDay): string {
  return `${day.tone} ${day.yucatec} (${day.kiche})`;
}

function haabLabel(haab: MayaHaabDate): string {
  const count = haab.count === "classic-gmt" ? "Haab · Classic GMT · {0} {1}" : "Haab · Momostenango · {0} {1}";
  return cliText(count, [haab.day, haab.month]);
}

function printSource(): void {
  const { author, title, year } = MAYA_JOHNSON_METHOD.source;
  console.log(`${author} · ${title} (${year})`);
}

const relationshipRoleLabels: Record<MayaCrossRole, string> = {
  core: "Center",
  conception: "Conception",
  rightHand: "Right hand",
  leftHand: "Left hand",
  destiny: "Destiny",
};

const solarQuarterLabels: Record<MayaSolarQuarter, string> = {
  "midnight-to-dawn": "midnight to dawn",
  "dawn-to-noon": "dawn to noon",
  "noon-to-sunset": "noon to sunset",
  "sunset-to-midnight": "sunset to midnight",
};

const lunarPhaseLabels: Record<MayaLunarPhase, string> = {
  new: "new Moon",
  waxing: "waxing Moon",
  full: "full Moon",
  waning: "waning Moon",
};

async function birthCycles(birth: CivilDate, flags: Flags, payload: InputPayload, execution: ExecutionContext) {
  const input = stringOption(flags, payload, "instant", "instant");
  const latitude = numberOption(flags, payload, "lat", "latitude");
  const longitude = numberOption(flags, payload, "lon", "longitude");
  if (input === undefined && latitude === undefined && longitude === undefined) return undefined;
  if (input === undefined) {
    exitWithError("MISSING_ARGUMENT", cliText("Maya birth coordinates require --instant."), flags);
  }
  const instant = parseOffsetTimestamp(input);
  if (!instant) {
    exitWithError("INVALID_DATE", cliText("Maya birth instant must be an ISO timestamp with Z or a UTC offset."), flags);
  }
  if (input.slice(0, 10) !== formatCivilDate(birth)) {
    exitWithError("INVALID_DATE", cliText("Maya birth instant must have the same local date as the natal date."), flags);
  }
  if ((latitude === undefined) !== (longitude === undefined)) {
    exitWithError("MISSING_ARGUMENT", cliText("Maya solar quarters require both latitude and longitude."), flags);
  }
  if (latitude !== undefined && Math.abs(latitude) > 90) {
    exitWithError("INVALID_ARGUMENT", cliText("Latitude must be between -90 and 90, got {0}.", [latitude]), flags);
  }
  if (longitude !== undefined && Math.abs(longitude) > 180) {
    exitWithError("INVALID_ARGUMENT", cliText("Longitude must be between -180 and 180, got {0}.", [longitude]), flags);
  }
  await initWasm(getAstrologyRuntimePaths(flags), execution);
  return calculateMayaBirthCycles({
    instant,
    location: latitude !== undefined && longitude !== undefined ? { latitude, longitude } : undefined,
  });
}

export async function cmdMaya(
  command: "maya:day" | "maya:sign" | "maya:board" | "maya:natal" | "maya:relationship" | "maya:timing",
  args: string[],
  flags: Flags,
  payload: InputPayload,
  execution: ExecutionContext,
): Promise<void> {
  const dateCount = command === "maya:timing" || command === "maya:relationship" ? 2 : 1;
  if (args.length > dateCount) {
    exitWithError("INVALID_ARGUMENT", cliText("Too many Maya date arguments."), flags);
  }

  const language = currentCliLanguage()?.startsWith("pt") ? "pt" : "en";
  if (command === "maya:sign") {
    const sign = stringOption(flags, payload, "sign", "sign") ?? args[0];
    const references = listMayaDaySignReferences();
    const selected = sign === undefined ? undefined : references.find(row => row.sign === sign.toLowerCase());
    if (sign !== undefined && !selected) {
      exitWithError("INVALID_ARGUMENT", cliText("Unknown Maya day sign."), flags);
    }
    const localize = (row: ReturnType<typeof getMayaDaySignReference>) => ({
      ...row, themes: row.themes[language], animal: row.animal[language], body: row.body[language], plant: row.plant[language],
    });
    if (isJsonMode(flags)) {
      outputJson(selected ? { method: MAYA_JOHNSON_METHOD, ...localize(selected) }
        : { method: MAYA_JOHNSON_METHOD, signs: references.map(localize) }, flags);
    } else {
      for (const row of selected ? [selected] : references) {
        const { themes, animal, body, plant } = localize(row);
        console.log(`${row.yucatec} (${row.kiche}) · ${cliText(row.direction)} · ${cliText(row.color)} · ${cliText(row.element)}`);
        console.log(themes);
        console.log(cliText("Animal · {0} / Body · {1} / Plant · {2}", [animal, body, plant]));
        console.log(cliText("Codex glyph · Morley, figure {0}{1}", [row.glyph.source.figure, row.glyph.variant]));
        console.log(row.glyph.imageUrl);
      }
      printSource();
    }
    return;
  }

  if (command === "maya:day") {
    const date = dateArgument(payloadValue(payload, "date") ?? args[0], "date", flags);
    const result = getMayaCalendarDay(date);
    const count = stringOption(flags, payload, "haab-count", "haabCount");
    if (count !== undefined && count !== "momostenango" && count !== "classic-gmt") {
      exitWithError("INVALID_ARGUMENT", cliText("Unknown Maya Haab count. Use momostenango or classic-gmt."), flags);
    }
    const haab = count === "classic-gmt" ? getMayaHaabDate(date, count) : result.haab;
    const withGlyphs = booleanOption(flags, payload, "glyphs", "glyphs");
    const glyphs = withGlyphs ? {
      day: getMayaDaySignReference(result.day.sign).glyph,
      haab: getMayaHaabMonthReference(haab.month).glyph,
    } : undefined;
    const hasLocation = ["lat", "lon", "location"].some(key => flags[key] !== undefined || payloadValue(payload, key) != null);
    const coordinates = hasLocation ? await resolveChartLocation(flags, payload, execution) : undefined;
    const timeZone = stringOption(flags, payload, "timezone", "timezone");
    const sunsetWelcome = coordinates
      ? await withSwissEph(flags, execution, async () => getMayaSunsetWelcome(date, { ...coordinates, timeZone }))
      : await getMayaSunsetWelcome(date);
    if (isJsonMode(flags)) outputJson({ ...result, haab, sunsetWelcome, ...(glyphs && { glyphs }) }, flags);
    else {
      console.log(`${result.date} · ${label(result.day)} · ${cliText(result.day.direction)}`);
      console.log(haabLabel(haab));
      if (glyphs) {
        for (const glyph of [glyphs.day, glyphs.haab]) {
          console.log(cliText("Codex glyph · Morley, figure {0}{1}", [glyph.source.figure, glyph.variant]));
          console.log(glyph.imageUrl);
        }
      }
      console.log(cliText("Trecena · {0}", [label(result.trecena)]));
      console.log(cliText("Year Lord · {0}", [label(result.yearLord.day)]));
      console.log(cliText("Sunset welcome · {0}", [label(sunsetWelcome.incomingDay)]));
      if (sunsetWelcome.opensTrecena) console.log(cliText("The incoming day opens the next trecena."));
      if (sunsetWelcome.status === "calculated") {
        const localTime = sunsetWelcome.sunset.toLocaleTimeString("en-GB", { timeZone: sunsetWelcome.timeZone });
        console.log(cliText("Local sunset · {0} ({1})", [localTime, sunsetWelcome.timeZone]));
      } else if (sunsetWelcome.status === "unavailable") {
        console.log(cliText("No sunset on this local date."));
      }
      printSource();
    }
    return;
  }

  if (command === "maya:board") {
    const input = payloadValue(payload, "date") ?? args[0];
    const result = getMayaCalendarBoard(input === undefined ? undefined : dateArgument(input, "date", flags));
    if (isJsonMode(flags)) outputJson(result, flags);
    else {
      console.log(cliText("Tzolk’in Calendar Board · tone and position"));
      if (result.active) console.log(`${result.active.date} · ${label(result.active.day)}`);
      for (const row of result.rows) {
        const cells = row.map(day => {
          const cell = `${day.tone}/${day.position}`;
          return (day.position === result.active?.day.position ? `[${cell}]` : cell).padStart(8);
        });
        console.log(row[0].yucatec.padEnd(8) + cells.join(""));
      }
      printSource();
    }
    return;
  }

  if (command === "maya:relationship") {
    const first = dateArgument(payloadValue(payload, "first") ?? args[0], "first", flags);
    const second = dateArgument(payloadValue(payload, "second") ?? args[1], "second", flags);
    const result = calculateMayaRelationship(first, second);
    const reading = getMayaRelationshipReading(result);
    const positions = (Object.keys(reading.positions) as MayaCrossRole[]).map(role => [role, {
      role: reading.positions[role].role[language],
      sign: reading.positions[role].sign[language],
      tone: reading.positions[role].tone[language],
    }] as const);
    const descriptions = {
      positions: Object.fromEntries(positions),
      tone: reading.tone[language],
      affinities: {
        sameDirection: reading.affinities.sameDirection[language],
        sameYearLordFamily: reading.affinities.sameYearLordFamily[language],
      },
      natalOverlap: { first: reading.natalOverlap.first[language], second: reading.natalOverlap.second[language] },
      basis: reading.basis,
    };
    if (isJsonMode(flags)) {
      outputJson({ ...result, descriptions }, flags);
    } else {
      console.log(cliText("Maya relationship composite · synthesis"));
      for (const [role, position] of positions) {
        console.log([cliText(relationshipRoleLabels[role]), label(result.cross[role])].join(" · "));
        console.log(position.role);
        console.log(position.sign);
        console.log(position.tone);
      }
      console.log(cliText("Directional affinity · {0}", [descriptions.affinities.sameDirection]));
      console.log(cliText("Year Lord family affinity · {0}", [descriptions.affinities.sameYearLordFamily]));
      for (const participant of ["first", "second"] as const) {
        const heading = participant === "first" ? "First natal chart · {0}" : "Second natal chart · {0}";
        console.log(cliText(heading, [label(result[participant])]));
        for (const { compositeRole, natalRole } of result.natalOverlap[participant]) {
          console.log(cliText("{0} · composite {1} / natal {2}", [
            result.cross[compositeRole].yucatec,
            cliText(relationshipRoleLabels[compositeRole]),
            cliText(relationshipRoleLabels[natalRole]),
          ]));
        }
        console.log(descriptions.natalOverlap[participant]);
      }
      printSource();
    }
    return;
  }

  const birth = dateArgument(payloadValue(payload, "birth") ?? args[0], "birth", flags);
  if (command === "maya:timing") {
    const from = dateArgument(payloadValue(payload, "from") ?? args[1], "from", flags);
    const result = calculateMayaTiming(birth, { from, days: numberOption(flags, payload, "days", "days") });
    const stages = new Map<MayaStage, string>();
    const observances = new Map<string, { basis: MayaPersonalLunarMonthGuidance["basis"]; description: string }>();
    const trecena = new Map<MayaTone, string>();
    for (const row of result.dates) {
      const { stage } = row.roadOfLife;
      const { tone } = row.day;
      if (!stages.has(stage)) stages.set(stage, getMayaStageDescription(stage)[language]);
      if (!trecena.has(tone)) trecena.set(tone, getMayaTrecenaGuidance(tone)[language]);
      if (row.personalLunarMonth?.point) {
        const guidance = getMayaPersonalLunarMonthGuidance(row.day);
        observances.set(row.date, { basis: guidance.basis, description: guidance.description[language] });
      }
    }
    if (isJsonMode(flags)) {
      outputJson({
        ...result,
        descriptions: {
          stages: Object.fromEntries(stages),
          observances: Object.fromEntries(observances),
          trecena: Object.fromEntries(trecena),
        },
      }, flags);
    } else {
      let previousStage: MayaStage | undefined;
      let previousTrecena: number | undefined;
      for (const row of result.dates) {
        if (row.trecena.position !== previousTrecena) {
          console.log(cliText("Trecena · {0}", [label(row.trecena)]));
          previousTrecena = row.trecena.position;
        }
        const parts = [row.date, label(row.day), `${row.haab.day} ${row.haab.month}`, cliText(row.roadOfLife.stage)];
        if (row.personalLunarMonth) {
          parts.push(cliText("Personal lunar month · {0}/{1}", [row.personalLunarMonth.dayNumber, row.personalLunarMonth.lengthDays]));
        }
        console.log(parts.join(" · "));
        const { stage } = row.roadOfLife;
        if (stage !== previousStage) console.log(stages.get(stage));
        previousStage = stage;
        console.log(trecena.get(row.day.tone));
        const observance = observances.get(row.date);
        if (observance) {
          const message = observance.basis === "published-example"
            ? "Published observance · {0}"
            : "Day-sign practice · {0}";
          console.log(cliText(message, [observance.description]));
        }
      }
      printSource();
    }
    return;
  }

  const result = calculateMayaNatal(birth);
  const reading = getMayaNatalReading(result);
  const yearLordReading = getMayaYearLordReading(result.yearLord.day);
  const cycles = await birthCycles(birth, flags, payload, execution);
  const cycleReading = cycles && getMayaBirthCycleReading(cycles);
  const positions = result.featheredSerpent.map(point => {
    const { role, sign, tone } = reading.positions[point.position];
    return [point.position, { role: role[language], sign: sign[language], tone: tone[language] }] as const;
  });
  const descriptions = {
    sign: reading.positions["adult.center"].sign[language],
    tone: reading.positions["adult.center"].tone[language],
    yearLord: yearLordReading?.description[language] ?? null,
    yearLordNumber: yearLordReading?.numberModifier[language] ?? null,
    yearLordNumberBasis: yearLordReading?.modifierBasis ?? null,
    positions: Object.fromEntries(positions),
    connections: reading.connections.map(link => ({ ...link, description: link.description[language] })),
    basis: reading.basis,
    ...(cycleReading && { birthCycles: { solar: cycleReading.solar?.[language] ?? null, lunar: cycleReading.lunar[language] } }),
  };
  if (isJsonMode(flags)) outputJson({ ...result, ...(cycles && { birthCycles: cycles }), descriptions }, flags);
  else {
    console.log(cliText("Maya birth sign: {0}", [label(result.day)]));
    console.log(haabLabel(result.haab));
    console.log(cliText("Trecena · {0}", [label(result.trecena)]));
    for (const [stage, row] of Object.entries(result.tree)) {
      console.log([cliText(stage), label(row.right.day), label(row.center.day), label(row.left.day)].join(" · "));
    }
    const pointDays = new Map(result.featheredSerpent.map(point => [point.position, point.day]));
    console.log(cliText("Natal positions · synthesis"));
    for (const [position, description] of positions) {
      const [stage, column] = position.split(".");
      console.log([cliText(stage), cliText(column), label(pointDays.get(position)!)].join(" · "));
      console.log(description.role);
      console.log(description.sign);
      console.log(description.tone);
    }
    console.log(cliText("Feathered Serpent links · synthesis"));
    for (const { from, to, description } of descriptions.connections) {
      console.log(`${label(pointDays.get(from)!)} → ${label(pointDays.get(to)!)}`);
      console.log(description);
    }
    if (descriptions.yearLord) console.log(`${cliText("Year Lord · {0}", [label(result.yearLord.day)])} · ${descriptions.yearLord}`);
    if (descriptions.yearLordNumber) console.log(cliText("Year Lord number · synthesis · {0}", [descriptions.yearLordNumber]));
    if (cycles && cycleReading) {
      if (cycles.solar?.available && cycleReading.solar) {
        console.log(cliText("Solar quarter · {0}", [cliText(solarQuarterLabels[cycles.solar.quarter])]));
        console.log(cycleReading.solar[language]);
      } else if (cycles.solar?.available === false) {
        console.log(cliText("Solar quarter unavailable for this solar day."));
      }
      console.log(cliText("Lunar phase · {0}", [cliText(lunarPhaseLabels[cycles.lunar.phase])]));
      console.log(cycleReading.lunar[language]);
    }
    printSource();
  }
}
