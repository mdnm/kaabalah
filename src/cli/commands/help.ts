import { cliValue } from "../runtime/content";
import { cliText } from "../runtime/language";
import { COMMANDS as EN_COMMANDS, GLOBAL_FLAGS as EN_GLOBAL_FLAGS, VERSION } from "../contract";
import { isJsonMode } from "../runtime/args";
import { exitWithError } from "../runtime/errors";
import { outputJson } from "../runtime/output";
import type { Flags } from "../runtime/types";

function localizedSchema() {
  return {
    COMMANDS: EN_COMMANDS.map(command => ({ ...command, description: cliText(command.description),
      args: command.args.map(arg => ({ ...arg, description: cliText(arg.description) })),
      flags: command.flags.map(flag => ({ ...flag, description: cliText(flag.description) })),
    })),
    GLOBAL_FLAGS: EN_GLOBAL_FLAGS.map(flag => ({ ...flag, description: cliText(flag.description) })),
  };
}

function generateHelp(): string {
  const { COMMANDS, GLOBAL_FLAGS } = localizedSchema();
  const lines: string[] = [];
  lines.push("");
  lines.push(`kaabalah v${VERSION} - ${cliText("CLI for esoteric calculations")}`);
  lines.push("");
  lines.push(cliText("USAGE"));
  lines.push(cliText("  kaabalah <command> [options]"));
  lines.push("");
  lines.push(cliText("COMMANDS"));

  for (const cmd of COMMANDS) {
    const argsStr = cmd.args.map((arg) => (arg.required ? `<${arg.name}>` : `[${arg.name}]`)).join(" ");
    lines.push(`  ${cliValue(cmd.name)} ${argsStr}`.padEnd(42) + cmd.description);
  }

  lines.push("");
  lines.push(cliText("GLOBAL OPTIONS"));
  lines.push(cliText("  -h, --help").padEnd(30) + cliText("Show help message"));
  lines.push(cliText("  -V, --version").padEnd(30) + cliText("Print version"));
  for (const flag of GLOBAL_FLAGS) {
    const defaultValue = flag.default !== undefined ? cliText(" (default: {0})", [flag.default]) : "";
    lines.push(`  --${cliValue(flag.name)}`.padEnd(30) + flag.description + defaultValue);
  }
  lines.push(cliText("  Note: use --input-json=- with a pipe or < file.json to avoid shell-specific JSON quoting."));
  lines.push(cliText("  Config: ./kaabalah.config.json or $XDG_CONFIG_HOME/kaabalah/config.json"));
  lines.push(cliText("  Debug: use --debug or DEBUG=kaabalah:*; use --trace for stack traces on unexpected fatal errors."));

  lines.push("");
  lines.push(cliText("EXAMPLES"));
  lines.push(cliText("  kaabalah gematria --json --compact < phrase.txt"));
  lines.push(cliText("  kaabalah numerology 1990-01-15"));
  lines.push(cliText("  kaabalah numerology --input-json=- --json --compact < numerology.json"));
  lines.push(cliText("  kaabalah numerology:cycles 1990-01-15 John"));
  lines.push(cliText("  kaabalah numerology:snapshot 1990-01-15 Ana --as-of=2026-03-01 --json --compact"));
  lines.push(cliText("  kaabalah numerology:timeline 1990-01-15 --from=2026-01-01 --to=2027-01-01 --layers=personal-month --json --compact"));
  lines.push(cliText("  kaabalah tarot 5 --inverted"));
  lines.push(cliText("  kaabalah tarot:card 7"));
  lines.push(cliText("  kaabalah gematria:reverse 22"));
  lines.push(cliText("  kaabalah ifa 1990-01-15"));
  lines.push(cliText("  kaabalah astrology 1990-01-15 14:30 --lat=40.7128 --lon=-74.006"));
  lines.push(cliText("  kaabalah astrology 1990-01-15 14:30 --lat=40.7128 --lon=-74.006 --orb-profile=ptolemaic-plus-quincunx --json --compact"));
  lines.push(cliText("  kaabalah astrology:synastry --input-json=- --json --compact < synastry.json"));
  lines.push(cliText("  kaabalah astrology:collection --manifest=people.json --json --compact --fields=summary"));
  lines.push(cliText("  kaabalah capabilities --json --compact"));
  lines.push(cliText("  kaabalah help --json"));
  lines.push("");

  return lines.join("\n");
}

export function cmdHelp(args: string[], flags: Flags): void {
  const { COMMANDS, GLOBAL_FLAGS } = localizedSchema();
  const subcommand = args[0];

  if (isJsonMode(flags)) {
    if (subcommand) {
      const command = COMMANDS.find((candidate) => candidate.name === subcommand);
      if (!command) {
        exitWithError("UNKNOWN_COMMAND", cliText("Unknown command: \"{0}\".", [subcommand]), flags);
      }
      outputJson({ version: VERSION, command, globalFlags: GLOBAL_FLAGS }, flags);
      return;
    }

    outputJson({ version: VERSION, commands: COMMANDS, globalFlags: GLOBAL_FLAGS }, flags);
    return;
  }

  if (!subcommand) {
    console.log(generateHelp());
    return;
  }

  const command = COMMANDS.find((candidate) => candidate.name === subcommand);
  if (!command) {
    exitWithError("UNKNOWN_COMMAND", cliText("Unknown command: \"{0}\".", [subcommand]), flags);
  }

  console.log(cliText("\nkaabalah v{0}\n", [VERSION]));
  console.log(`${cliValue(command.name)} - ${cliValue(command.description)}\n`);
  console.log(cliText("USAGE"));
  const argsStr = command.args.map((arg) => (arg.required ? `<${arg.name}>` : `[${arg.name}]`)).join(" ");
  console.log(cliText("  kaabalah {0} {1}\n", [cliValue(command.name), argsStr]));

  if (command.args.length > 0) {
    console.log(cliText("ARGUMENTS"));
    for (const arg of command.args) {
      const required = arg.required ? cliText("(required)") : cliText("(optional)");
      console.log(`  ${cliValue(arg.name.padEnd(20))} ${arg.type.padEnd(10)} ${required}  ${cliValue(arg.description)}`);
    }
    console.log();
  }

  if (command.flags.length > 0) {
    console.log(cliText("FLAGS"));
    for (const flag of command.flags) {
      const defaultValue = flag.default !== undefined ? cliText(" (default: {0})", [flag.default]) : "";
      console.log(`  --${cliValue(flag.name.padEnd(24))} ${cliValue(flag.description)}${defaultValue}`);
    }
    console.log();
  }

  if (command.examples.length > 0) {
    console.log(cliText("EXAMPLES"));
    for (const example of command.examples) {
      console.log(`  ${example}`);
    }
    console.log();
  }
}
