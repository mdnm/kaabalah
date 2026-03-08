import { COMMANDS, GLOBAL_FLAGS, VERSION } from "../contract";
import { isJsonMode } from "../runtime/args";
import { exitWithError } from "../runtime/errors";
import { outputJson } from "../runtime/output";
import type { Flags } from "../runtime/types";

function generateHelp(): string {
  const lines: string[] = [];
  lines.push("");
  lines.push(`kaabalah v${VERSION} - CLI for esoteric calculations`);
  lines.push("");
  lines.push("USAGE");
  lines.push("  kaabalah <command> [options]");
  lines.push("");
  lines.push("COMMANDS");

  for (const cmd of COMMANDS) {
    const argsStr = cmd.args.map((arg) => (arg.required ? `<${arg.name}>` : `[${arg.name}]`)).join(" ");
    lines.push(`  ${cmd.name} ${argsStr}`.padEnd(42) + cmd.description);
  }

  lines.push("");
  lines.push("GLOBAL OPTIONS");
  lines.push("  -h, --help".padEnd(30) + "Show help message");
  lines.push("  -V, --version".padEnd(30) + "Print version");
  for (const flag of GLOBAL_FLAGS) {
    const defaultValue = flag.default !== undefined ? ` (default: ${flag.default})` : "";
    lines.push(`  --${flag.name}`.padEnd(30) + flag.description + defaultValue);
  }
  lines.push("  Note: use --input-json=- with a pipe or < file.json to avoid shell-specific JSON quoting.");
  lines.push("  Config: ./kaabalah.config.json or $XDG_CONFIG_HOME/kaabalah/config.json");
  lines.push("  Debug: use --debug or DEBUG=kaabalah:*; use --trace for stack traces on unexpected fatal errors.");

  lines.push("");
  lines.push("EXAMPLES");
  lines.push("  kaabalah gematria --json --compact < phrase.txt");
  lines.push("  kaabalah numerology 1990-01-15");
  lines.push("  kaabalah numerology --input-json=- --json --compact < numerology.json");
  lines.push("  kaabalah numerology:cycles 1990-01-15 John");
  lines.push("  kaabalah tarot 5 --inverted");
  lines.push("  kaabalah tarot:card 7");
  lines.push("  kaabalah gematria:reverse 22");
  lines.push("  kaabalah ifa 1990-01-15");
  lines.push("  kaabalah astrology 1990-01-15 14:30 --lat=40.7128 --lon=-74.006");
  lines.push("  kaabalah astrology:synastry --input-json=- --json --compact < synastry.json");
  lines.push("  kaabalah help --json");
  lines.push("");

  return lines.join("\n");
}

export function cmdHelp(args: string[], flags: Flags): void {
  const subcommand = args[0];

  if (isJsonMode(flags)) {
    if (subcommand) {
      const command = COMMANDS.find((candidate) => candidate.name === subcommand);
      if (!command) {
        exitWithError("UNKNOWN_COMMAND", `Unknown command: "${subcommand}".`, flags);
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
    exitWithError("UNKNOWN_COMMAND", `Unknown command: "${subcommand}".`, flags);
  }

  console.log(`\nkaabalah v${VERSION}\n`);
  console.log(`${command.name} - ${command.description}\n`);
  console.log("USAGE");
  const argsStr = command.args.map((arg) => (arg.required ? `<${arg.name}>` : `[${arg.name}]`)).join(" ");
  console.log(`  kaabalah ${command.name} ${argsStr}\n`);

  if (command.args.length > 0) {
    console.log("ARGUMENTS");
    for (const arg of command.args) {
      const required = arg.required ? "(required)" : "(optional)";
      console.log(`  ${arg.name.padEnd(20)} ${arg.type.padEnd(10)} ${required}  ${arg.description}`);
    }
    console.log();
  }

  if (command.flags.length > 0) {
    console.log("FLAGS");
    for (const flag of command.flags) {
      const defaultValue = flag.default !== undefined ? ` (default: ${flag.default})` : "";
      console.log(`  --${flag.name.padEnd(24)} ${flag.description}${defaultValue}`);
    }
    console.log();
  }

  if (command.examples.length > 0) {
    console.log("EXAMPLES");
    for (const example of command.examples) {
      console.log(`  ${example}`);
    }
    console.log();
  }
}
