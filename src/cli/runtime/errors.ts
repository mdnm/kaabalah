import { cliText, cliErrorText, cliLanguageFromArgv, withCliLanguage } from "./language";
import { cliValue } from "./content";
import { COMMANDS, VERSION } from "../contract";
import { getFallbackFlags, isJsonMode } from "./args";
import { configureDebugRuntime, debugLog, isTraceEnabled } from "./debug";
import { isCliSignalError } from "./execution";
import { configureQuietRuntime } from "./quiet";
import type { Flags } from "./types";

export type ErrorCode =
  | "INVALID_DATE"
  | "INVALID_ARGUMENT"
  | "MISSING_ARGUMENT"
  | "UNKNOWN_COMMAND"
  | "CARD_NOT_FOUND"
  | "INDEX_OUT_OF_POOL"
  | "INTERNAL_ERROR"
  | "GEOCODE_ERROR"
  | "WASM_INIT_ERROR"
  | "INVALID_JSON";

function inferCommandName(argv: string[]): string | null {
  return argv.slice(2).find((token) => COMMANDS.some((candidate) => candidate.name === token)) ?? null;
}

function getHelpHint(code: ErrorCode): string {
  if (code === "UNKNOWN_COMMAND") {
    return cliText('Run "kaabalah help" for usage.');
  }

  const command = inferCommandName(process.argv);
  if (command && command !== "help") {
    return cliText('Run "kaabalah help {0}" for command usage.', [command]);
  }

  return cliText('Run "kaabalah help" for usage.');
}

export function makeActionableMessage(code: ErrorCode, message: string): string {
  message = cliErrorText(String(cliValue(message)));
  if (message.startsWith("Usage:") || message.startsWith("Uso:") || message.includes('Run "kaabalah help')) {
    return message;
  }

  // Keep the hint a separate sentence even when the message has no final punctuation.
  const separator = /[.!?:;]$/.test(message.trimEnd()) ? " " : ". ";
  return `${message.trimEnd()}${separator}${getHelpHint(code)}`;
}

/**
 * Maps typed library errors onto the existing CLI error codes (no code is added for
 * them). Matching is by `name`/`code` so this module never imports the library (the
 * astrology module stays lazy-loaded). Returns null for errors it does not recognise.
 */
export function classifyLibraryError(err: unknown): { code: ErrorCode; message: string } | null {
  if (!(err instanceof Error)) return null;
  const libraryCode = (err as { code?: unknown }).code;
  if (typeof libraryCode !== "string") return null;
  const message = err.message;
  const name = err.name.startsWith("SwissEph") ? "SwissEphError" : err.name;
  switch (name) {
    case "NumerologyScheduleError":
      if (libraryCode === "INVALID_DATE") return { code: "INVALID_DATE", message };
      if (libraryCode === "MISSING_BIRTH_DATE") return { code: "MISSING_ARGUMENT", message };
      return { code: "INVALID_ARGUMENT", message };
    case "MayaCalculationError":
      return { code: libraryCode === "INVALID_DATE" ? "INVALID_DATE" : "INVALID_ARGUMENT", message };
    case "AspectConfigError":
      return { code: "INVALID_ARGUMENT", message };
    case "InputQualityError":
      if (libraryCode === "INVALID_DATE" || libraryCode === "INCOMPLETE_DATE") return { code: "INVALID_DATE", message };
      if (libraryCode === "MISSING_TIME" || libraryCode === "MISSING_LOCATION") return { code: "MISSING_ARGUMENT", message };
      return { code: "INVALID_ARGUMENT", message };
    case "TimelineError":
    case "TattwaError":
      return { code: "INVALID_ARGUMENT", message };
    case "DerivedChartError":
      if (libraryCode === "SOLAR_RETURN_NOT_FOUND") return { code: "INTERNAL_ERROR", message };
      return { code: "INVALID_ARGUMENT", message };
    case "CollectionError":
      return { code: "INVALID_ARGUMENT", message };
    case "CacheKeyError":
      return { code: "INVALID_ARGUMENT", message };
    case "SwissEphError":
      if (
        libraryCode === "SWISSEPH_NOT_INITIALIZED" ||
        libraryCode === "SWISSEPH_ASSET_NOT_FOUND" ||
        libraryCode === "SWISSEPH_NODE_BUILTINS_UNAVAILABLE" ||
        libraryCode === "SWISSEPH_EPHEMERIS_FILES_UNAVAILABLE"
      ) {
        return { code: "WASM_INIT_ERROR", message };
      }
      if (libraryCode === "SWISSEPH_DATE_OUT_OF_RANGE" || libraryCode === "SWISSEPH_EPHEMERIS_MISMATCH" || libraryCode === "SWISSEPH_EPHEMERIS_FILE_UNAVAILABLE") {
        return { code: "INVALID_DATE", message };
      }
      return { code: "INTERNAL_ERROR", message };
    default:
      return null;
  }
}

/** Exit with the mapped CLI error when `err` is a recognised typed library error; otherwise rethrow it. */
export function exitWithLibraryError(err: unknown, flags: Flags): never {
  const mapped = classifyLibraryError(err);
  if (!mapped) throw err;
  return exitWithError(mapped.code, mapped.message, flags);
}

export function writeJsonError(code: ErrorCode, message: string): void {
  process.stdout.write(
    JSON.stringify({
      error: true,
      code,
      message,
      version: VERSION,
    }) + "\n"
  );
}

export function writeHumanError(message: string): void {
  process.stderr.write(`kaabalah v${VERSION}: ${message}\n`);
}

export function exitWithError(code: ErrorCode, message: string, flags: Flags): never {
  const actionableMessage = makeActionableMessage(code, message);

  if (isJsonMode(flags)) {
    writeJsonError(code, actionableMessage);
  } else {
    writeHumanError(actionableMessage);
  }
  process.exit(1);
}

export function handleFatalError(err: unknown, argv: string[]): never {
  return withCliLanguage(cliLanguageFromArgv(argv), () => handleFatalErrorInLanguage(err, argv));
}
function handleFatalErrorInLanguage(err: unknown, argv: string[]): never {
  const flags = getFallbackFlags(argv);
  configureQuietRuntime(flags);
  configureDebugRuntime(flags);

  if (isCliSignalError(err)) {
    debugLog("signals", cliText("Exiting after {0}.", [err.signalName]));
    process.exit(err.exitCode);
  }

  // Typed library errors keep their meaning (e.g. INVALID_ARGUMENT) even when a command did not catch them.
  const classified = classifyLibraryError(err);
  const code: ErrorCode = classified?.code ?? "INTERNAL_ERROR";
  const message = makeActionableMessage(
    code,
    err instanceof Error ? err.message : String(err)
  );

  debugLog("fatal", cliText("Unhandled CLI error."), err);

  if (isJsonMode(flags)) {
    writeJsonError(code, message);
  } else {
    writeHumanError(message);
    if (isTraceEnabled() && err instanceof Error && err.stack) {
      process.stderr.write(`${err.stack}\n`);
    }
  }

  process.exit(1);
}
