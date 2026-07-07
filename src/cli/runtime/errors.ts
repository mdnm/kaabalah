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
  | "UNSUPPORTED_SYSTEM"
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
    return 'Run "kaabalah help" for usage.';
  }

  const command = inferCommandName(process.argv);
  if (command && command !== "help") {
    return `Run "kaabalah help ${command}" for command usage.`;
  }

  return 'Run "kaabalah help" for usage.';
}

export function makeActionableMessage(code: ErrorCode, message: string): string {
  if (message.startsWith("Usage:") || message.includes('Run "kaabalah help')) {
    return message;
  }

  return `${message} ${getHelpHint(code)}`;
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
  const flags = getFallbackFlags(argv);
  configureQuietRuntime(flags);
  configureDebugRuntime(flags);

  if (isCliSignalError(err)) {
    debugLog("signals", `Exiting after ${err.signalName}.`);
    process.exit(err.exitCode);
  }

  const message = makeActionableMessage(
    "INTERNAL_ERROR",
    err instanceof Error ? err.message : String(err)
  );

  debugLog("fatal", "Unhandled CLI error.", err);

  if (isJsonMode(flags)) {
    writeJsonError("INTERNAL_ERROR", message);
  } else {
    writeHumanError(message);
    if (isTraceEnabled() && err instanceof Error && err.stack) {
      process.stderr.write(`${err.stack}\n`);
    }
  }

  process.exit(1);
}
