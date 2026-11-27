import { writeFileSync } from "node:fs";
import { generateTattwaSvg, getTattwaSchedule, TATTWA_ORDER } from "../../tattwa";
import { isJsonMode } from "../runtime/args";
import { exitWithError } from "../runtime/errors";
import type { ExecutionContext } from "../runtime/execution";
import { cliText } from "../runtime/language";
import { enumValue, numberOption, payloadValue, stringOption } from "../runtime/options";
import { outputJson } from "../runtime/output";
import type { Flags, InputPayload } from "../runtime/types";
import { parseOffsetTimestamp } from "../runtime/validation";
import { resolveChartLocation, withSwissEph } from "./astrology";

export async function cmdTattwa(
  command: "tattwa:schedule" | "tattwa:svg",
  args: string[],
  flags: Flags,
  payload: InputPayload,
  execution: ExecutionContext,
): Promise<void> {
  if (args.length > 1) exitWithError("INVALID_ARGUMENT", cliText("Too many tattwa arguments."), flags);

  if (command === "tattwa:svg") {
    const requested = payloadValue(payload, "tattwa") ?? args[0];
    if (requested === undefined) exitWithError("MISSING_ARGUMENT", cliText("A tattwa ID is required."), flags);
    if (typeof requested !== "string") exitWithError("INVALID_ARGUMENT", cliText("Tattwa ID must be a string."), flags);
    const tattwa = enumValue(requested, TATTWA_ORDER, "tattwa", flags)!;
    const inner = enumValue(stringOption(flags, payload, "inner", "inner"), TATTWA_ORDER, "inner", flags);
    const size = numberOption(flags, payload, "size", "size");
    const svg = generateTattwaSvg(tattwa, { inner, size });
    const output = stringOption(flags, payload, "output", "output");
    if (output) writeFileSync(output, svg, "utf8");
    if (isJsonMode(flags)) outputJson({ tattwa, inner: inner ?? null, ...(output ? { output } : { svg }) }, flags);
    else console.log(output ? cliText("SVG written to {0}", [output]) : svg);
    return;
  }

  const input = payloadValue(payload, "instant") ?? args[0];
  if (input === undefined) exitWithError("MISSING_ARGUMENT", cliText("A tattwa schedule requires an instant."), flags);
  const date = parseOffsetTimestamp(input);
  if (!date) {
    exitWithError("INVALID_DATE", cliText("Tattwa instant must be an ISO timestamp with Z or a UTC offset."), flags);
  }
  const { latitude, longitude, resolvedLocation } = await resolveChartLocation(flags, payload, execution);
  const { resolveSolarTimeZone } = await import("../../astrology/solar-events");
  const timeZone = await resolveSolarTimeZone(latitude, longitude, stringOption(flags, payload, "timezone", "timezone"));
  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat("sv-SE", { timeZone, dateStyle: "short", timeStyle: "medium" });
  } catch {
    exitWithError("INVALID_ARGUMENT", cliText('Unknown IANA time zone "{0}".', [timeZone]), flags);
  }
  const result = await withSwissEph(flags, execution, async () => getTattwaSchedule({ date, latitude, longitude }));
  if (isJsonMode(flags)) outputJson({ ...result, timeZone, ...(resolvedLocation && { resolvedLocation }) }, flags);
  else if (!result.available) console.log(cliText("No tattwa schedule for this location and instant because consecutive sunrises are unavailable."));
  else {
    console.log(cliText("Tatwameter schedule · {0}", [timeZone]));
    for (const period of result.periods) {
      console.log(`${formatter.format(period.start)} → ${formatter.format(period.end)} · ${period.tattwa}`);
    }
  }
}
