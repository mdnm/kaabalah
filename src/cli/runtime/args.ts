import { parseArgs as parseNodeArgs } from "node:util";

import { COMMANDS, GLOBAL_FLAGS } from "../contract";
import { configureDebugRuntime, debugLog } from "./debug";
import { configureQuietRuntime } from "./quiet";
import type { Flags } from "./types";

class CliParseError extends Error {
  flags: Flags;

  constructor(message: string, flags: Flags) {
    super(message);
    this.name = "CliParseError";
    this.flags = flags;
  }
}

function buildOptionDefinitions() {
  const options: Record<string, { type: "boolean" | "string"; short?: string }> = {
    help: { type: "boolean", short: "h" },
    version: { type: "boolean", short: "V" },
  };

  const allFlags = [
    ...GLOBAL_FLAGS,
    ...COMMANDS.flatMap((command) => command.flags),
  ];

  for (const flag of allFlags) {
    if (!options[flag.name]) {
      options[flag.name] = {
        type: flag.type === "boolean" ? "boolean" : "string",
      };
    }
  }

  return options;
}

const PARSER_OPTIONS = buildOptionDefinitions();
const GLOBAL_OPTION_NAMES = new Set([
  "help",
  "version",
  ...GLOBAL_FLAGS.map((flag) => flag.name),
]);
const COMMAND_OPTION_NAMES = new Map(
  COMMANDS.map((command) => [
    command.name,
    new Set(command.flags.map((flag) => flag.name)),
  ])
);

function applyJsonDefaults(flags: Flags): Flags {
  if (!process.stdout.isTTY && flags["no-json"] !== true && flags.json !== true) {
    flags.json = true;
  }

  return flags;
}

function describeFlagsForDebug(flags: Flags): Record<string, unknown> {
  const described: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(flags)) {
    described[key] = key === "input-json" ? "[provided]" : value;
  }

  return described;
}

function describeArgvForDebug(argv: string[]): string[] {
  const described: string[] = [];
  let maskNextInputJson = false;

  for (const arg of argv.slice(2)) {
    if (maskNextInputJson) {
      described.push("[provided]");
      maskNextInputJson = false;
      continue;
    }

    if (arg === "--input-json") {
      described.push(arg);
      maskNextInputJson = true;
      continue;
    }

    if (arg.startsWith("--input-json=")) {
      described.push("--input-json=[provided]");
      continue;
    }

    described.push(arg);
  }

  return described;
}

export function getFallbackFlags(argv: string[]): Flags {
  const flags: Flags = {};
  const rawArgs = argv.slice(2);

  for (const arg of rawArgs) {
    if (arg === "--") {
      break;
    }

    if (arg === "--json" || arg.startsWith("--json=")) {
      flags.json = true;
      continue;
    }

    if (arg === "--no-json") {
      flags["no-json"] = true;
      continue;
    }

    if (arg === "--help") {
      flags.help = true;
      continue;
    }

    if (arg === "--version") {
      flags.version = true;
      continue;
    }

    if (arg === "--debug") {
      flags.debug = true;
      continue;
    }

    if (arg === "--quiet") {
      flags.quiet = true;
      continue;
    }

    if (arg === "--silent") {
      flags.silent = true;
      continue;
    }

    if (arg === "--trace") {
      flags.trace = true;
      continue;
    }

    if (arg.startsWith("-") && !arg.startsWith("--")) {
      for (const shortFlag of arg.slice(1)) {
        if (shortFlag === "h") {
          flags.help = true;
        }
        if (shortFlag === "V") {
          flags.version = true;
        }
      }
    }
  }

  return applyJsonDefaults(flags);
}

function validateCommandOptions(command: string | undefined, optionNames: string[]): string | null {
  if (!command || !COMMAND_OPTION_NAMES.has(command)) {
    return null;
  }

  const allowed = new Set([
    ...GLOBAL_OPTION_NAMES,
    ...COMMAND_OPTION_NAMES.get(command)!,
  ]);

  for (const optionName of optionNames) {
    if (!allowed.has(optionName)) {
      return optionName;
    }
  }

  return null;
}

export function parseArgs(argv: string[]) {
  try {
    const parsed = parseNodeArgs({
      args: argv.slice(2),
      options: PARSER_OPTIONS,
      allowPositionals: true,
      strict: true,
      tokens: true,
    });

    const flags = applyJsonDefaults({ ...(parsed.values as Flags) });
    const args = parsed.positionals;
    const usedOptions = parsed.tokens
      .filter((token): token is typeof token & { kind: "option"; name: string } => token.kind === "option")
      .map((token) => token.name);

    configureQuietRuntime(flags);
    configureDebugRuntime(flags);
    debugLog("parser", "Parsed CLI arguments.", {
      argv: describeArgvForDebug(argv),
      positionals: args,
      flags: describeFlagsForDebug(flags),
    });

    const invalidCommandOption = validateCommandOptions(args[0], usedOptions);

    if (invalidCommandOption) {
      throw new CliParseError(
        `Unknown option "--${invalidCommandOption}" for command "${args[0]}". Run "kaabalah help ${args[0]}" for command usage.`,
        flags
      );
    }

    return { args, flags };
  } catch (err) {
    if (err instanceof CliParseError) {
      throw err;
    }

    const fallbackFlags = getFallbackFlags(argv);
    configureQuietRuntime(fallbackFlags);
    configureDebugRuntime(fallbackFlags);
    debugLog("parser", "Argument parsing failed.", {
      argv: describeArgvForDebug(argv),
      error: err instanceof Error ? err.message : String(err),
    });

    throw new CliParseError(
      err instanceof Error ? err.message : String(err),
      fallbackFlags
    );
  }
}

export function isCliParseError(err: unknown): err is CliParseError {
  return err instanceof CliParseError;
}

export function getFlagString(flags: Flags, name: string): string | undefined {
  const value = flags[name];
  return typeof value === "string" ? value : undefined;
}

export function getFlagNumber(flags: Flags, name: string): number | undefined {
  const value = flags[name];
  if (typeof value !== "string") {
    return undefined;
  }

  const number = Number(value);
  return Number.isNaN(number) ? undefined : number;
}

export function getFlagBool(flags: Flags, name: string): boolean {
  return flags[name] === true;
}

export function isJsonMode(flags: Flags): boolean {
  return flags["no-json"] !== true && (flags.json === true || typeof flags.json === "string");
}
