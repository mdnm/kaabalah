import { cliText } from "../runtime/language";
import {
  computeLifeStages,
  describePartialBirthDate,
  generateNumerologyTimeline,
  getNumerologyMethodMetadata,
  getNumerologySnapshot,
  summarizeBirthDateCandidates,
  TIMELINE_LAYERS,
  type BirthInput,
  type LifePathMethod,
  type MasterPolicy,
  type NameInputKind,
  type PartialBirthDate,
  type ScheduleOptions,
  type ShortMonthPolicy,
  type TimelineLayer,
} from "../../numerology";
import { addCivilDays, completedYears, formatCivilDate, parseCivilDate, type CivilDate } from "../../civil-date";
import { toMarkdownTable, numerologyIntervalsTable } from "../../tabulate";
import { isJsonMode } from "../runtime/args";
import { exitWithError, exitWithLibraryError } from "../runtime/errors";
import {
  civilOption,
  enumList,
  enumValue,
  listOption,
  numberOption,
  payloadValue,
  stringOption,
  todayCivil,
} from "../runtime/options";
import { outputJson } from "../runtime/output";
import { parseCivilDateInput } from "../runtime/validation";
import type { Flags, InputPayload } from "../runtime/types";

export const BIRTH_KINDS = ["full", "month-day", "year-month", "year", "year-approx", "unknown"] as const;
const PAYLOAD_BIRTH_KINDS: readonly string[] = ["full", "month-day", "year-month", "year", "unknown"];
export const NAME_KINDS: readonly NameInputKind[] = ["first-token", "given-name", "full-name"];
export const LIFE_PATH_METHODS: readonly LifePathMethod[] = ["kaabalistic", "straight-across"];
export const MASTER_POLICIES: readonly MasterPolicy[] = ["preserve", "reduce"];
export const SHORT_MONTH_POLICIES: readonly ShortMonthPolicy[] = ["next-month-first", "clamp", "overflow"];
export const OUTPUT_FORMATS = ["json", "table", "markdown"] as const;
type OutputFormat = (typeof OUTPUT_FORMATS)[number];

function fail(code: Parameters<typeof exitWithError>[0], message: string, flags: Flags): never {
  return exitWithError(code, message, flags);
}

function parseBirth(raw: string | undefined, flags: Flags, payload: InputPayload): BirthInput {
  const fromPayload = payloadValue(payload, "birth") ?? payloadValue(payload, "date");
  if (fromPayload !== undefined && fromPayload !== null && typeof fromPayload === "object" && !Array.isArray(fromPayload)) {
    const obj = fromPayload as Record<string, unknown>;
    if (typeof obj.kind !== "string" || !PAYLOAD_BIRTH_KINDS.includes(obj.kind)) {
      return fail("INVALID_ARGUMENT", cliText("\"birth.kind\" must be one of: {0}.", [PAYLOAD_BIRTH_KINDS.join(", ")]), flags);
    }
    return obj as unknown as PartialBirthDate;
  }
  if (fromPayload !== undefined && typeof fromPayload !== "string") {
    return fail("INVALID_ARGUMENT", cliText("\"birth\" must be a date string or an object with \"kind\" in --input-json."), flags);
  }
  const text = (fromPayload as string | undefined) ?? raw;
  const kindFlag = enumValue(stringOption(flags, payload, "birth-kind", "birthKind"), BIRTH_KINDS, "birth-kind", flags) ?? "full";

  if (kindFlag === "unknown") return { kind: "unknown" };
  if (!text) {
    return fail("MISSING_ARGUMENT", cliText("A birth value is required (YYYY-MM-DD, or the shape selected by --birth-kind)."), flags);
  }
  switch (kindFlag) {
    case "full":
      parseCivilDateInput(text, flags);
      return text;
    case "month-day": {
      const m = /^(\d{2})-(\d{2})$/.exec(text);
      if (!m) return fail("INVALID_DATE", cliText("Invalid month-day \"{0}\". Use MM-DD with --birth-kind=month-day.", [text]), flags);
      return { kind: "month-day", month: Number(m[1]), day: Number(m[2]) };
    }
    case "year-month": {
      const m = /^(\d{4})-(\d{2})$/.exec(text);
      if (!m) return fail("INVALID_DATE", cliText("Invalid year-month \"{0}\". Use YYYY-MM with --birth-kind=year-month.", [text]), flags);
      return { kind: "year-month", year: Number(m[1]), month: Number(m[2]) };
    }
    default: {
      const m = /^(\d{4})$/.exec(text);
      if (!m) return fail("INVALID_DATE", cliText("Invalid year \"{0}\". Use YYYY with --birth-kind={1}.", [text, kindFlag]), flags);
      return { kind: "year", year: Number(m[1]), approximate: kindFlag === "year-approx" };
    }
  }
}

interface ParsedSchedule {
  birth: BirthInput;
  options: ScheduleOptions;
  asOf: CivilDate;
  asOfSource: "flag" | "today";
}

function readOptions(flags: Flags, payload: InputPayload, firstNameArg: string | undefined): ScheduleOptions {
  const firstNameRaw = payloadValue(payload, "firstName") ?? firstNameArg;
  if (firstNameRaw !== undefined && typeof firstNameRaw !== "string") {
    fail("INVALID_ARGUMENT", cliText("\"firstName\" must be a string in --input-json."), flags);
  }
  const options: ScheduleOptions = {};
  if (typeof firstNameRaw === "string" && firstNameRaw.length > 0) options.firstName = firstNameRaw;
  const nameKind = enumValue(stringOption(flags, payload, "name-kind", "nameKind"), NAME_KINDS, "name-kind", flags);
  if (nameKind) options.nameKind = nameKind;
  const lifePathMethod = enumValue(stringOption(flags, payload, "life-path-method", "lifePathMethod"), LIFE_PATH_METHODS, "life-path-method", flags);
  if (lifePathMethod) options.lifePathMethod = lifePathMethod;
  const masters = enumValue(stringOption(flags, payload, "masters", "masters"), MASTER_POLICIES, "masters", flags);
  if (masters) options.masters = masters;
  const shortMonthPolicy = enumValue(stringOption(flags, payload, "short-month-policy", "shortMonthPolicy"), SHORT_MONTH_POLICIES, "short-month-policy", flags);
  if (shortMonthPolicy) options.shortMonthPolicy = shortMonthPolicy;
  const death = stringOption(flags, payload, "death", "death");
  const horizon = stringOption(flags, payload, "horizon", "horizon");
  if (death !== undefined) parseCivilDateInput(death, flags);
  if (horizon !== undefined) parseCivilDateInput(horizon, flags);
  if (death !== undefined || horizon !== undefined) {
    options.limits = {};
    if (death !== undefined) options.limits.death = death;
    if (horizon !== undefined) options.limits.horizonEndExclusive = horizon;
  }
  return options;
}

function parseSchedule(args: string[], flags: Flags, payload: InputPayload): ParsedSchedule {
  const birth = parseBirth(args[0], flags, payload);
  const options = readOptions(flags, payload, args[1]);
  const asOfText = stringOption(flags, payload, "as-of", "asOf");
  const asOfParsed = civilOption(asOfText, flags);
  return { birth, options, asOf: asOfParsed ?? todayCivil(), asOfSource: asOfParsed ? "flag" : "today" };
}

function parseFormat(flags: Flags, payload: InputPayload): OutputFormat {
  return enumValue(stringOption(flags, payload, "format", "format"), OUTPUT_FORMATS, "format", flags) ?? "json";
}

function writeMarkdown(text: string): void {
  process.stdout.write(`${text}\n`);
}

const EVALUATION_NOTE = "asOf is a civil calendar day (YYYY-MM-DD); it defaults to today's host-local date only when --as-of is omitted.";

function describeAsOf(parsed: ParsedSchedule) {
  return {
    asOf: formatCivilDate(parsed.asOf),
    source: parsed.asOfSource === "flag" ? "--as-of / asOf" : "today (host-local calendar date; pass --as-of for reproducible output)",
    note: EVALUATION_NOTE,
  };
}

function printSnapshot(snapshot: ReturnType<typeof getNumerologySnapshot>): void {
  console.log(cliText("\nNumerology snapshot as of {0} ({1})\n", [snapshot.asOf, snapshot.status]));
  if (snapshot.completedAge !== null) console.log(cliText("  Completed age: {0}", [snapshot.completedAge]));
  if (snapshot.birthdayYear) console.log(cliText("  Personal year: {0} ({1} to {2})", [snapshot.birthdayYear.personalYear.value, snapshot.birthdayYear.start, snapshot.birthdayYear.endExclusive ?? ""]));
  if (snapshot.personalMonth) console.log(cliText("  Personal month: phase {0}, value {1}", [snapshot.personalMonth.phase, snapshot.personalMonth.value.value]));
  if (snapshot.personalPeriod) console.log(cliText("  Personal period: phase {0}", [snapshot.personalPeriod.phase]));
  if (snapshot.heptad) console.log(cliText("  Heptad: phase {0}, day {1}", [snapshot.heptad.phase, snapshot.heptad.dayInHeptad]));
  if (snapshot.calendar) console.log(cliText("  Calendar frame: year {0}, month {1}, day {2}", [snapshot.calendar.personalYear.value, snapshot.calendar.personalMonth.value, snapshot.calendar.personalDay.value]));
  for (const item of snapshot.unavailable) console.log(cliText("  Unavailable: {0} ({1})", [item.field, item.reason]));
  console.log();
}

export function cmdNumerologySnapshot(args: string[], flags: Flags, payload: InputPayload): void {
  const parsed = parseSchedule(args, flags, payload);
  try {
    const snapshot = getNumerologySnapshot({ birth: parsed.birth, ...parsed.options, asOf: parsed.asOf });
    if (isJsonMode(flags)) {
      outputJson({ ...snapshot, evaluation: describeAsOf(parsed) }, flags);
      return;
    }
    printSnapshot(snapshot);
  } catch (err) {
    exitWithLibraryError(err, flags);
  }
}

function resolveWindow(
  flags: Flags,
  payload: InputPayload,
  defaults: { from: CivilDate; toExclusive: CivilDate }
): { from: CivilDate; toExclusive: CivilDate } {
  const from = civilOption(stringOption(flags, payload, "from", "from"), flags) ?? defaults.from;
  const toExclusive = civilOption(stringOption(flags, payload, "to", "to"), flags) ?? defaults.toExclusive;
  return { from, toExclusive };
}

function renderTimeline(
  timeline: ReturnType<typeof generateNumerologyTimeline>,
  extra: Record<string, unknown>,
  flags: Flags,
  format: OutputFormat
): void {
  if (format === "markdown") {
    writeMarkdown(toMarkdownTable(numerologyIntervalsTable(timeline.intervals as never)));
    return;
  }
  if (format === "table") {
    outputJson({ ...extra, from: timeline.from, toExclusive: timeline.toExclusive, table: numerologyIntervalsTable(timeline.intervals as never), meta: timeline.meta, unavailable: timeline.unavailable }, flags);
    return;
  }
  if (isJsonMode(flags)) {
    outputJson({ ...extra, ...timeline }, flags);
    return;
  }
  console.log(cliText("\nNumerology timeline {0} to {1} (exclusive)\n", [timeline.from, timeline.toExclusive]));
  console.log(toMarkdownTable(numerologyIntervalsTable(timeline.intervals as never)));
  console.log();
}

export function cmdNumerologyTimeline(args: string[], flags: Flags, payload: InputPayload): void {
  const parsed = parseSchedule(args, flags, payload);
  const from = stringOption(flags, payload, "from", "from");
  const to = stringOption(flags, payload, "to", "to");
  if (!from || !to) {
    fail("MISSING_ARGUMENT", cliText("Usage: kaabalah numerology:timeline <birth> [firstName] --from=<YYYY-MM-DD> --to=<YYYY-MM-DD> [--layers=personal-year,...]"), flags);
  }
  const window = resolveWindow(flags, payload, { from: parsed.asOf, toExclusive: parsed.asOf });
  const layers = enumList(listOption(flags, payload, "layers", "layers"), TIMELINE_LAYERS, "layers", flags) as TimelineLayer[] | undefined;
  const maxIntervals = numberOption(flags, payload, "max-intervals", "maxIntervals");
  const format = parseFormat(flags, payload);
  try {
    const timeline = generateNumerologyTimeline({
      birth: parsed.birth,
      ...parsed.options,
      from: window.from,
      toExclusive: window.toExclusive,
      layers,
      maxIntervals,
    });
    renderTimeline(timeline, {}, flags, format);
  } catch (err) {
    exitWithLibraryError(err, flags);
  }
}

function snapshotIfPossible(parsed: ParsedSchedule) {
  return getNumerologySnapshot({ birth: parsed.birth, ...parsed.options, asOf: parsed.asOf });
}

export function cmdNumerologyHeptads(args: string[], flags: Flags, payload: InputPayload): void {
  const parsed = parseSchedule(args, flags, payload);
  const format = parseFormat(flags, payload);
  const window = resolveWindow(flags, payload, { from: parsed.asOf, toExclusive: addCivilDays(parsed.asOf, 365) });
  try {
    const snapshot = snapshotIfPossible(parsed);
    const timeline = generateNumerologyTimeline({
      birth: parsed.birth,
      ...parsed.options,
      from: window.from,
      toExclusive: window.toExclusive,
      layers: ["heptad", "age-cycle"],
    });
    renderTimeline(
      timeline,
      {
        evaluation: describeAsOf(parsed),
        current: { heptad: snapshot.heptad, ageCycle: snapshot.ageCycle, status: snapshot.status },
      },
      flags,
      format
    );
  } catch (err) {
    exitWithLibraryError(err, flags);
  }
}

export function cmdNumerologyPersonalCycles(args: string[], flags: Flags, payload: InputPayload): void {
  const parsed = parseSchedule(args, flags, payload);
  const format = parseFormat(flags, payload);
  try {
    const snapshot = snapshotIfPossible(parsed);
    // Default window: the birthday year that contains the as-of date.
    const by = snapshot.birthdayYear;
    const defaults = by
      ? { from: parseCivilDate(by.nominalStart) ?? parsed.asOf, toExclusive: parseCivilDate(by.nominalEndExclusive ?? "") ?? addCivilDays(parsed.asOf, 365) }
      : { from: parsed.asOf, toExclusive: addCivilDays(parsed.asOf, 365) };
    const window = resolveWindow(flags, payload, defaults);
    const timeline = generateNumerologyTimeline({
      birth: parsed.birth,
      ...parsed.options,
      from: window.from,
      toExclusive: window.toExclusive,
      layers: ["personal-year", "personal-month", "personal-period"],
    });
    renderTimeline(
      timeline,
      {
        evaluation: describeAsOf(parsed),
        current: {
          status: snapshot.status,
          personalYear: snapshot.birthdayYear,
          personalMonth: snapshot.personalMonth,
          personalPeriod: snapshot.personalPeriod,
          fixedNumbers: snapshot.fixedNumbers,
        },
      },
      flags,
      format
    );
  } catch (err) {
    exitWithLibraryError(err, flags);
  }
}

export function cmdNumerologyLifeStages(args: string[], flags: Flags, payload: InputPayload): void {
  const parsed = parseSchedule(args, flags, payload);
  const given = parsed.birth;
  const birthText =
    typeof given === "string" ? given : "kind" in given && given.kind === "full" ? String(given.date) : null;
  if (birthText === null) {
    fail("INVALID_ARGUMENT", cliText("Life stages need a full birth date (YYYY-MM-DD)."), flags);
  }
  const birth = parseCivilDateInput(birthText, flags);
  const lifePathMethod = parsed.options.lifePathMethod ?? "straight-across";
  const firstEnd = numberOption(flags, payload, "first-pinnacle-end-age", "firstPinnacleEndAge");
  const periodRule = enumValue(stringOption(flags, payload, "life-period-rule", "lifePeriodRule"), ["pinnacle-aligned-27", "fixed-28-56"] as const, "life-period-rule", flags);
  try {
    const masters = parsed.options.masters ?? "preserve";
    const stages = computeLifeStages(birth, masters, { lifePathMethod, firstPinnacleEndAge: firstEnd, lifePeriodRule: periodRule });
    const age = completedYears(birth, parsed.asOf);
    const within = <T extends { startAge: number; endAgeExclusive: number | null }>(spans: T[]) =>
      age < 0 ? null : spans.find((s) => age >= s.startAge && (s.endAgeExclusive === null || age < s.endAgeExclusive)) ?? null;
    const result = {
      evaluation: describeAsOf(parsed),
      birth: formatCivilDate(birth),
      completedAge: age < 0 ? null : age,
      ...stages,
      active: { pinnacle: within(stages.pinnacles), challenge: within(stages.challenges), lifePeriod: within(stages.lifePeriods) },
      meta: getNumerologyMethodMetadata({ birth: birthText, ...parsed.options, lifeStages: { lifePathMethod, firstPinnacleEndAge: firstEnd, lifePeriodRule: periodRule } }),
    };
    if (isJsonMode(flags)) {
      outputJson(result, flags);
      return;
    }
    console.log(cliText("\nLife stages for {0} (as of {1}, age {2})\n", [result.birth, formatCivilDate(parsed.asOf), result.completedAge ?? "n/a"]));
    for (const p of stages.pinnacles) console.log(cliText("  Pinnacle {0}: ages {1}-{2} value {3}", [p.index, p.startAge, p.endAgeExclusive ?? "end", p.value.value]));
    for (const c of stages.challenges) console.log(cliText("  Challenge {0}: ages {1}-{2} value {3}", [c.index, c.startAge, c.endAgeExclusive ?? "end", c.value]));
    console.log();
  } catch (err) {
    exitWithLibraryError(err, flags);
  }
}

export function cmdNumerologyPartial(args: string[], flags: Flags, payload: InputPayload): void {
  const parsed = parseSchedule(args, flags, payload);
  try {
    const capability = describePartialBirthDate(parsed.birth as PartialBirthDate);
    const withCandidates = Boolean(flags.candidates) || payloadValue(payload, "candidates") === true;
    const candidates =
      withCandidates
        ? summarizeBirthDateCandidates({
            birth: parsed.birth as Extract<PartialBirthDate, { kind: "year-month" | "year" }>,
            ...parsed.options,
            asOf: parsed.asOf,
          })
        : undefined;
    const meta = getNumerologyMethodMetadata({ birth: parsed.birth, ...parsed.options });
    const result = { evaluation: describeAsOf(parsed), capability, ...(candidates ? { candidates } : {}), meta };
    if (isJsonMode(flags)) {
      outputJson(result, flags);
      return;
    }
    console.log(cliText("\nBirth date knowledge: {0}\n", [capability.kind]));
    console.log(cliText("  Computable: {0}", [capability.computable.join(", ")]));
    for (const item of capability.unavailable) console.log(cliText("  Unavailable: {0} ({1})", [item.field, item.reason]));
    console.log();
  } catch (err) {
    exitWithLibraryError(err, flags);
  }
}
