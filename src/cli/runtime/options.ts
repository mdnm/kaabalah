import { cliText } from "./language";
import { getFlagBool, getFlagNumber, getFlagString } from "./args";
import { exitWithError } from "./errors";
import { parseCivilDateInput } from "./validation";
import { civilDateFromLocalDate, formatCivilDate, type CivilDate } from "../../civil-date";
import type { Flags, InputPayload } from "./types";

/** Shared readers for flags that can also arrive through `--input-json` (payload wins over flags, like the existing commands). */

export function payloadValue(payload: InputPayload, key: string): unknown {
  return payload && Object.prototype.hasOwnProperty.call(payload, key) ? payload[key] : undefined;
}

export function stringOption(flags: Flags, payload: InputPayload, flagName: string, payloadKey: string): string | undefined {
  const fromPayload = payloadValue(payload, payloadKey);
  if (typeof fromPayload === "string" && fromPayload.length > 0) return fromPayload;
  if (fromPayload != null && typeof fromPayload !== "string") {
    exitWithError("INVALID_ARGUMENT", cliText("\"{0}\" must be a string in --input-json.", [payloadKey]), flags);
  }
  return getFlagString(flags, flagName);
}

export function numberOption(flags: Flags, payload: InputPayload, flagName: string, payloadKey: string): number | undefined {
  const fromPayload = payloadValue(payload, payloadKey);
  if (fromPayload != null) {
    const n = typeof fromPayload === "number" ? fromPayload : typeof fromPayload === "string" && fromPayload.trim() !== "" ? Number(fromPayload) : NaN;
    if (!Number.isFinite(n)) {
      exitWithError("INVALID_ARGUMENT", cliText("\"{0}\" must be a finite number in --input-json.", [payloadKey]), flags);
    }
    return n;
  }
  const raw = getFlagString(flags, flagName);
  if (raw === undefined) return undefined;
  const n = getFlagNumber(flags, flagName);
  if (n === undefined || !Number.isFinite(n) || raw.trim() === "") {
    exitWithError("INVALID_ARGUMENT", cliText("--{0} must be a number, got \"{1}\".", [flagName, raw]), flags);
  }
  return n;
}

export function booleanOption(flags: Flags, payload: InputPayload, flagName: string, payloadKey: string): boolean {
  const fromPayload = payloadValue(payload, payloadKey);
  if (typeof fromPayload === "boolean") return fromPayload;
  if (fromPayload != null) {
    exitWithError("INVALID_ARGUMENT", cliText("\"{0}\" must be true or false in --input-json.", [payloadKey]), flags);
  }
  return getFlagBool(flags, flagName);
}

/** Comma-separated flag or JSON array/string payload value, trimmed, lower-cased, empty items dropped. */
export function listOption(flags: Flags, payload: InputPayload, flagName: string, payloadKey: string): string[] | undefined {
  const fromPayload = payloadValue(payload, payloadKey);
  let items: unknown[] | undefined;
  if (Array.isArray(fromPayload)) items = fromPayload;
  else if (typeof fromPayload === "string") items = fromPayload.split(",");
  else if (fromPayload != null) {
    exitWithError("INVALID_ARGUMENT", cliText("\"{0}\" must be an array or comma-separated string in --input-json.", [payloadKey]), flags);
  } else {
    const raw = getFlagString(flags, flagName);
    if (raw !== undefined) items = raw.split(",");
  }
  if (!items) return undefined;
  const list = items.map((item) => String(item).trim().toLowerCase()).filter(Boolean);
  if (list.length === 0) {
    exitWithError("INVALID_ARGUMENT", cliText("--{0} must list at least one value.", [flagName]), flags);
  }
  return list;
}

/** Accept only the listed values; unknown values are INVALID_ARGUMENT (never silently ignored). */
export function enumValue<T extends string>(value: string | undefined, allowed: readonly T[], flagName: string, flags: Flags): T | undefined {
  if (value === undefined) return undefined;
  if (!(allowed as readonly string[]).includes(value)) {
    exitWithError(
      "INVALID_ARGUMENT",
      cliText("Unknown value \"{0}\" for --{1}. Valid: {2}.", [value, flagName, allowed.join(", ")]),
      flags
    );
  }
  return value as T;
}

export function enumList<T extends string>(values: string[] | undefined, allowed: readonly T[], flagName: string, flags: Flags): T[] | undefined {
  if (!values) return undefined;
  for (const value of values) enumValue(value, allowed, flagName, flags);
  return values as T[];
}

/** Today's host-local calendar day (the only place the CLI reads the clock for date-only numerology). */
export function todayCivil(): CivilDate {
  return civilDateFromLocalDate(new Date());
}

/** Strict YYYY-MM-DD flag value (real calendar day, year 0001-9999) or INVALID_DATE. */
export function civilOption(value: string | undefined, flags: Flags): CivilDate | undefined {
  return value === undefined ? undefined : parseCivilDateInput(value, flags);
}

export { formatCivilDate };

/** UTC instant for a civil date at the given UTC hour/minute (safe for years 0001-0099). */
export function civilToUtcDate(date: CivilDate, hour = 0, minute = 0): Date {
  const result = new Date(Date.UTC(2000, 0, 1, hour, minute, 0, 0));
  result.setUTCFullYear(date.year, date.month - 1, date.day);
  return result;
}

/** `HH:MM` to hour/minute, or INVALID_ARGUMENT. */
export function parseClock(value: string, flagName: string, flags: Flags): { hour: number; minute: number } {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  const hour = match ? Number(match[1]) : NaN;
  const minute = match ? Number(match[2]) : NaN;
  if (!match || hour > 23 || minute > 59) {
    exitWithError("INVALID_ARGUMENT", cliText("--{0} must be HH:MM (hours 0-23, minutes 0-59), got \"{1}\".", [flagName, value]), flags);
  }
  return { hour, minute };
}
