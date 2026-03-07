import "dotenv/config";

import { createTree } from "./core/factory";
import { SYSTEM as KAABALAH_SYSTEM } from "./core/systems/kaabalah";
import { calculateGematria, reverseGematria } from "./gematria";
import { calculateOdu } from "./ifa";
import {
  calculateChallenges,
  calculateCycles,
  calculateFibonacciCycle,
  calculateKaabalisticLifePath,
  calculatePersonalCycles,
  calculatePersonalYear,
  calculateStraightAcrossReductionLifePath,
  getDateEnergies,
} from "./numerology";
import { ARKANNUS, shuffleTarotDeck } from "./tarot";

const VERSION = "4.9.1";

// ── Types ─────────────────────────────────────────────────────────────

type Flags = Record<string, string | boolean>;

interface CommandArg {
  name: string;
  type: "string" | "number" | "date";
  required: boolean;
  description: string;
}

interface CommandFlag {
  name: string;
  type: "boolean" | "string" | "number";
  default?: string | boolean | number;
  description: string;
}

interface CommandSchema {
  name: string;
  description: string;
  args: CommandArg[];
  flags: CommandFlag[];
  examples: string[];
}

// ── Command Registry ──────────────────────────────────────────────────

const GLOBAL_FLAGS: CommandFlag[] = [
  { name: "json", type: "boolean", default: false, description: "Output as JSON (auto-enabled when stdout is not a TTY)" },
  { name: "no-json", type: "boolean", default: false, description: "Force human-readable output even when piped" },
  { name: "compact", type: "boolean", default: false, description: "Minified JSON output (no indentation)" },
  { name: "fields", type: "string", description: "Comma-separated dot-paths to filter JSON output (e.g. --fields=a.b,c.d)" },
  { name: "input-json", type: "string", description: "JSON string with command parameters (alternative to positional args)" },
];

const COMMANDS: CommandSchema[] = [
  {
    name: "gematria",
    description: "Calculate gematria for a word/phrase",
    args: [{ name: "text", type: "string", required: true, description: "Text to calculate gematria for" }],
    flags: [
      { name: "missing", type: "boolean", default: false, description: "Show missing gematria values" },
      { name: "percentages", type: "boolean", default: false, description: "Show letter percentages" },
    ],
    examples: ['kaabalah gematria "Hello World"', 'kaabalah gematria "Hello World" --json'],
  },
  {
    name: "gematria:reverse",
    description: "Find letter combos matching a gematria value",
    args: [{ name: "target", type: "number", required: true, description: "Target synthesis number" }],
    flags: [
      { name: "max-results", type: "number", default: 20, description: "Maximum results to return (max 10000)" },
      { name: "min-length", type: "number", default: 2, description: "Minimum letters per combination" },
      { name: "max-length", type: "number", default: 6, description: "Maximum letters per combination" },
      { name: "include-digraphs", type: "boolean", default: false, description: "Include digraphs like PH, SH" },
    ],
    examples: ["kaabalah gematria:reverse 22", "kaabalah gematria:reverse 22 --max-results=50 --json"],
  },
  {
    name: "numerology",
    description: "Full numerological profile for a birth date",
    args: [{ name: "date", type: "date", required: true, description: "Birth date in YYYY-MM-DD format" }],
    flags: [],
    examples: ["kaabalah numerology 1990-01-15", "kaabalah numerology 1990-01-15 --json --fields=kaabalistic.lifePath.reducedValue"],
  },
  {
    name: "numerology:lifepath",
    description: "Life path number (kaabalistic method)",
    args: [{ name: "date", type: "date", required: true, description: "Birth date in YYYY-MM-DD format" }],
    flags: [],
    examples: ["kaabalah numerology:lifepath 1990-01-15"],
  },
  {
    name: "numerology:cycles",
    description: "Personal cycles (year, month, periods)",
    args: [
      { name: "date", type: "date", required: true, description: "Birth date in YYYY-MM-DD format" },
      { name: "firstName", type: "string", required: false, description: "First name for personal cycles" },
    ],
    flags: [],
    examples: ["kaabalah numerology:cycles 1990-01-15", "kaabalah numerology:cycles 1990-01-15 John"],
  },
  {
    name: "numerology:challenges",
    description: "Challenges from birth date",
    args: [{ name: "date", type: "date", required: true, description: "Birth date in YYYY-MM-DD format" }],
    flags: [],
    examples: ["kaabalah numerology:challenges 1990-01-15"],
  },
  {
    name: "numerology:fibonacci",
    description: "Fibonacci cycle for current age",
    args: [{ name: "date", type: "date", required: true, description: "Birth date in YYYY-MM-DD format" }],
    flags: [],
    examples: ["kaabalah numerology:fibonacci 1990-01-15"],
  },
  {
    name: "tarot",
    description: "Draw tarot cards (default: 3)",
    args: [{ name: "count", type: "number", required: false, description: "Number of cards to draw (1-78, default: 3)" }],
    flags: [
      { name: "inverted", type: "boolean", default: false, description: "Include inverted cards" },
      { name: "shuffle-count", type: "number", default: 7, description: "Number of times to shuffle the deck" },
    ],
    examples: ["kaabalah tarot 5 --inverted", "kaabalah tarot --json"],
  },
  {
    name: "tarot:card",
    description: "Look up a specific card (1-78)",
    args: [{ name: "number", type: "number", required: true, description: "Card number (1-78)" }],
    flags: [],
    examples: ["kaabalah tarot:card 7", "kaabalah tarot:card 22 --json"],
  },
  {
    name: "ifa",
    description: "Calculate Odu from a date",
    args: [{ name: "date", type: "date", required: true, description: "Date in YYYY-MM-DD format" }],
    flags: [],
    examples: ["kaabalah ifa 1990-01-15"],
  },
  {
    name: "tree",
    description: "Show Tree of Life structure with all nodes, data, and edges",
    args: [],
    flags: [],
    examples: ["kaabalah tree --json --compact", "kaabalah tree --json --fields=nodes"],
  },
  {
    name: "tree:node",
    description: "Look up a node and all its correspondences",
    args: [{ name: "id", type: "string", required: true, description: "Node ID (e.g. path:1, sphere:Kether, tarotArkAnnu:The Magician)" }],
    flags: [
      { name: "type", type: "string", description: "Filter related nodes by type (e.g. hebrewLetter, planet, tarotArkAnnu)" },
      { name: "depth", type: "number", default: 1, description: "Traversal depth (default: 1)" },
    ],
    examples: [
      "kaabalah tree:node path:1 --json",
      "kaabalah tree:node sphere:Kether --type=tarotArkAnnu --json",
      'kaabalah tree:node "tarotArkAnnu:The Magician" --json',
      "kaabalah tree:node path:1 --depth=2 --json",
    ],
  },
  {
    name: "tree:types",
    description: "List all node types and their counts",
    args: [],
    flags: [],
    examples: ["kaabalah tree:types --json"],
  },
  {
    name: "astrology",
    description: "Calculate birth chart using Swiss Ephemeris",
    args: [
      { name: "date", type: "date", required: true, description: "Birth date in YYYY-MM-DD format" },
      { name: "time", type: "string", required: false, description: "Birth time in HH:MM format (default: 12:00)" },
    ],
    flags: [
      { name: "lat", type: "number", description: "Latitude (-90 to 90)" },
      { name: "lon", type: "number", description: "Longitude (-180 to 180)" },
      { name: "location", type: "string", description: "Location string for geocoding (requires GOOGLE_MAPS_API_KEY env var)" },
      { name: "house-system", type: "string", default: "placidus", description: "House system: placidus, koch, porphyrius, regiomontanus, campanus, equal, whole-sign, meridian, morinus, krusinski, alcabitius" },
      { name: "timezone", type: "string", description: "IANA timezone string (e.g. America/New_York). Auto-resolved from coordinates if omitted" },
    ],
    examples: [
      "kaabalah astrology 1990-01-15 14:30 --lat=40.7128 --lon=-74.006",
      'kaabalah astrology 1990-01-15 14:30 --location="New York, USA"',
      "kaabalah astrology 1990-01-15 --lat=40.7128 --lon=-74.006 --json",
    ],
  },
  {
    name: "help",
    description: "Show help message",
    args: [{ name: "command", type: "string", required: false, description: "Command to show help for" }],
    flags: [],
    examples: ["kaabalah help", "kaabalah help --json", "kaabalah help astrology --json"],
  },
];

// ── Arg Parsing ───────────────────────────────────────────────────────

function parseArgs(argv: string[]) {
  const args: string[] = [];
  const flags: Flags = {};

  for (const arg of argv.slice(2)) {
    if (arg.startsWith("--")) {
      const eqIdx = arg.indexOf("=");
      if (eqIdx !== -1) {
        flags[arg.slice(2, eqIdx)] = arg.slice(eqIdx + 1);
      } else {
        flags[arg.slice(2)] = true;
      }
    } else {
      args.push(arg);
    }
  }

  // TTY auto-detection: if stdout is not a TTY, default to JSON
  if (!process.stdout.isTTY && flags["no-json"] !== true) {
    flags.json = true;
  }

  return { args, flags };
}

function getFlagString(flags: Flags, name: string): string | undefined {
  const v = flags[name];
  return typeof v === "string" ? v : undefined;
}

function getFlagNumber(flags: Flags, name: string): number | undefined {
  const v = flags[name];
  if (typeof v === "string") {
    const n = Number(v);
    return isNaN(n) ? undefined : n;
  }
  return undefined;
}

function getFlagBool(flags: Flags, name: string): boolean {
  return flags[name] === true;
}

function isJsonMode(flags: Flags): boolean {
  return flags.json === true || typeof flags.json === "string";
}

// ── Input JSON Support ────────────────────────────────────────────────

function parseInputJson(flags: Flags): Record<string, unknown> | null {
  const raw = getFlagString(flags, "input-json");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      exitWithError("INVALID_JSON", "--input-json must be a JSON object", flags);
    }
    return parsed as Record<string, unknown>;
  } catch {
    exitWithError("INVALID_JSON", `Invalid JSON in --input-json: ${raw}`, flags);
  }
}

// ── Input Hardening ───────────────────────────────────────────────────

function sanitizeInput(str: string): string {
  // Strip control characters except tab (0x09), newline (0x0A), carriage return (0x0D)
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
}

function validateDateRange(dateStr: string, flags: Flags): void {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    exitWithError("INVALID_DATE", `Invalid date: "${dateStr}". Use YYYY-MM-DD format.`, flags);
  }
  const year = parseInt(match![1], 10);
  if (year < 1 || year > 9999) {
    exitWithError("INVALID_DATE", `Year must be between 0001 and 9999, got ${year}.`, flags);
  }
}

function capNumber(value: number, max: number): number {
  if (value > max) return max;
  if (value < 0) return 0;
  return value;
}

const MAX_TEXT_LENGTH = 1000;
const MAX_RESULTS_CAP = 10000;

// ── Structured Errors ─────────────────────────────────────────────────

type ErrorCode =
  | "INVALID_DATE"
  | "INVALID_ARGUMENT"
  | "MISSING_ARGUMENT"
  | "UNKNOWN_COMMAND"
  | "CARD_NOT_FOUND"
  | "INTERNAL_ERROR"
  | "GEOCODE_ERROR"
  | "WASM_INIT_ERROR"
  | "INVALID_JSON";

function exitWithError(code: ErrorCode, message: string, flags: Flags): never {
  if (isJsonMode(flags)) {
    const out = JSON.stringify({ error: true, code, message });
    process.stdout.write(out + "\n");
  } else {
    process.stderr.write(message + "\n");
  }
  process.exit(1);
}

// ── Output Helpers ────────────────────────────────────────────────────

function pickFields(obj: unknown, paths: string[]): unknown {
  if (typeof obj !== "object" || obj === null) return obj;
  const result: Record<string, unknown> = {};
  for (const path of paths) {
    const parts = path.split(".");
    let current: unknown = obj;
    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== "object") {
        current = undefined;
        break;
      }
      current = (current as Record<string, unknown>)[part];
    }
    if (current !== undefined) {
      // Reconstruct nested path in result
      let target: Record<string, unknown> = result;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!(parts[i] in target) || typeof target[parts[i]] !== "object") {
          target[parts[i]] = {};
        }
        target = target[parts[i]] as Record<string, unknown>;
      }
      target[parts[parts.length - 1]] = current;
    }
  }
  return result;
}

function outputJson(data: unknown, flags: Flags): void {
  let output = data;

  const fieldsStr = getFlagString(flags, "fields");
  if (fieldsStr) {
    const paths = fieldsStr.split(",").map((s) => s.trim()).filter(Boolean);
    if (paths.length > 0) {
      output = pickFields(output, paths);
    }
  }

  const indent = getFlagBool(flags, "compact") ? undefined : 2;
  console.log(JSON.stringify(output, null, indent));
}

// ── Date Parsing ──────────────────────────────────────────────────────

function parseDate(str: string, flags: Flags): Date {
  validateDateRange(str, flags);
  const d = new Date(str + "T12:00:00Z");
  if (isNaN(d.getTime())) {
    exitWithError("INVALID_DATE", `Invalid date: "${str}". Use YYYY-MM-DD format.`, flags);
  }
  return d;
}

// ── Help Generation ───────────────────────────────────────────────────

function generateHelp(): string {
  const lines: string[] = [];
  lines.push("");
  lines.push("kaabalah - CLI for esoteric calculations");
  lines.push("");
  lines.push("USAGE");
  lines.push("  kaabalah <command> [options]");
  lines.push("");
  lines.push("COMMANDS");

  for (const cmd of COMMANDS) {
    const argsStr = cmd.args.map((a) => (a.required ? `<${a.name}>` : `[${a.name}]`)).join(" ");
    const line = `  ${cmd.name} ${argsStr}`.padEnd(42) + cmd.description;
    lines.push(line);
  }

  lines.push("");
  lines.push("GLOBAL OPTIONS");
  for (const f of GLOBAL_FLAGS) {
    const def = f.default !== undefined ? ` (default: ${f.default})` : "";
    const line = `  --${f.name}`.padEnd(30) + f.description + def;
    lines.push(line);
  }

  lines.push("");
  lines.push("EXAMPLES");
  lines.push('  kaabalah gematria "Hello World"');
  lines.push("  kaabalah numerology 1990-01-15");
  lines.push("  kaabalah numerology:cycles 1990-01-15 John");
  lines.push("  kaabalah tarot 5 --inverted");
  lines.push("  kaabalah tarot:card 7");
  lines.push("  kaabalah gematria:reverse 22");
  lines.push("  kaabalah ifa 1990-01-15");
  lines.push("  kaabalah astrology 1990-01-15 14:30 --lat=40.7128 --lon=-74.006");
  lines.push('  kaabalah astrology 1990-01-15 14:30 --location="New York, USA"');
  lines.push("  kaabalah help --json");
  lines.push("");

  return lines.join("\n");
}

function cmdHelp(args: string[], flags: Flags) {
  const subcommand = args[0];

  if (isJsonMode(flags)) {
    if (subcommand) {
      const cmd = COMMANDS.find((c) => c.name === subcommand);
      if (!cmd) {
        exitWithError("UNKNOWN_COMMAND", `Unknown command: "${subcommand}".`, flags);
      }
      outputJson({ version: VERSION, command: cmd, globalFlags: GLOBAL_FLAGS }, flags);
    } else {
      outputJson({ version: VERSION, commands: COMMANDS, globalFlags: GLOBAL_FLAGS }, flags);
    }
    return;
  }

  if (subcommand) {
    const cmd = COMMANDS.find((c) => c.name === subcommand);
    if (!cmd) {
      exitWithError("UNKNOWN_COMMAND", `Unknown command: "${subcommand}".`, flags);
    }
    console.log(`\n${cmd!.name} - ${cmd!.description}\n`);
    console.log("USAGE");
    const argsStr = cmd!.args.map((a) => (a.required ? `<${a.name}>` : `[${a.name}]`)).join(" ");
    console.log(`  kaabalah ${cmd!.name} ${argsStr}\n`);
    if (cmd!.args.length > 0) {
      console.log("ARGUMENTS");
      for (const a of cmd!.args) {
        const req = a.required ? "(required)" : "(optional)";
        console.log(`  ${a.name.padEnd(20)} ${a.type.padEnd(10)} ${req}  ${a.description}`);
      }
      console.log();
    }
    if (cmd!.flags.length > 0) {
      console.log("FLAGS");
      for (const f of cmd!.flags) {
        const def = f.default !== undefined ? ` (default: ${f.default})` : "";
        console.log(`  --${f.name.padEnd(24)} ${f.description}${def}`);
      }
      console.log();
    }
    if (cmd!.examples.length > 0) {
      console.log("EXAMPLES");
      for (const e of cmd!.examples) {
        console.log(`  ${e}`);
      }
      console.log();
    }
  } else {
    console.log(generateHelp());
  }
}

// ── Geocoding (Google Places API New — Text Search) ───────────────────

async function geocodeLocation(
  location: string,
  flags: Flags
): Promise<{ latitude: number; longitude: number; formattedAddress: string }> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    exitWithError(
      "GEOCODE_ERROR",
      "GOOGLE_MAPS_API_KEY environment variable is required for --location. Set it or use --lat/--lon directly.",
      flags
    );
  }

  // Use Places API (New) Text Search which is commonly enabled alongside Maps JS API
  const url = "https://places.googleapis.com/v1/places:searchText";
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey!,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location",
      },
      body: JSON.stringify({ textQuery: location, maxResultCount: 1 }),
    });
  } catch (err) {
    exitWithError("GEOCODE_ERROR", `Geocoding request failed: ${err instanceof Error ? err.message : String(err)}`, flags);
  }

  const data = (await response!.json()) as {
    places?: Array<{
      displayName?: { text: string };
      formattedAddress?: string;
      location?: { latitude: number; longitude: number };
    }>;
    error?: { message: string; status: string };
  };

  if (data.error) {
    exitWithError(
      "GEOCODE_ERROR",
      `Geocoding failed for "${location}": ${data.error.message}`,
      flags
    );
  }

  if (!data.places || data.places.length === 0 || !data.places[0].location) {
    exitWithError(
      "GEOCODE_ERROR",
      `No results found for "${location}".`,
      flags
    );
  }

  const place = data.places![0];
  return {
    latitude: place.location!.latitude,
    longitude: place.location!.longitude,
    formattedAddress: place.formattedAddress ?? place.displayName?.text ?? location,
  };
}

// ── House System Mapping ──────────────────────────────────────────────

const HOUSE_SYSTEM_MAP: Record<string, string> = {
  placidus: "P",
  koch: "K",
  porphyrius: "O",
  regiomontanus: "R",
  campanus: "C",
  equal: "E",
  "whole-sign": "W",
  meridian: "X",
  morinus: "M",
  krusinski: "U",
  alcabitius: "B",
};

// ── Commands ──────────────────────────────────────────────────────────

function cmdGematria(text: string, flags: Flags) {
  if (text.length > MAX_TEXT_LENGTH) {
    exitWithError("INVALID_ARGUMENT", `Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters.`, flags);
  }
  const sanitized = sanitizeInput(text);

  const result = calculateGematria(sanitized, {
    missing: getFlagBool(flags, "missing"),
    percentages: getFlagBool(flags, "percentages"),
  });

  if (isJsonMode(flags)) {
    outputJson(result, flags);
    return;
  }

  console.log(`\nGematria: "${sanitized}"\n`);
  console.log(`  Vowels:     ${result.vowels.originalSum} -> [${result.vowels.reductionSteps.join(", ")}] = ${result.vowels.finalValue}`);
  console.log(`  Consonants: ${result.consonants.originalSum} -> [${result.consonants.reductionSteps.join(", ")}] = ${result.consonants.finalValue}`);
  console.log(`  Synthesis:  ${result.synthesis.originalSum} -> [${result.synthesis.reductionSteps.join(", ")}] = ${result.synthesis.finalValue}`);

  if (result.includedLetters.length > 0) {
    console.log(`\n  Letters:`);
    for (const l of result.includedLetters) {
      const vowelTag = l.isVowel ? " (vowel)" : "";
      console.log(`    ${l.hebrewCharacter}  value=${l.value}${vowelTag}`);
    }
  }

  if (result.missingGematriaValues && result.missingGematriaValues.length > 0) {
    console.log(`\n  Missing values: ${result.missingGematriaValues.map((m) => m.value).join(", ")}`);
  }

  if (result.letterPercentages) {
    console.log(`\n  Vowel %:     ${result.letterPercentages.percentageOfVowels.toFixed(1)}%`);
    console.log(`  Consonant %: ${result.letterPercentages.percentageOfConsonants.toFixed(1)}%`);
  }
  console.log();
}

function cmdReverseGematria(target: string, flags: Flags, inputPayload: Record<string, unknown> | null) {
  const targetNum = inputPayload?.targetSynthesis != null
    ? Number(inputPayload.targetSynthesis)
    : parseInt(target, 10);

  if (isNaN(targetNum)) {
    exitWithError("INVALID_ARGUMENT", `Invalid target number: "${target}"`, flags);
  }

  let maxResults = inputPayload?.maxResults != null
    ? Number(inputPayload.maxResults)
    : (getFlagNumber(flags, "max-results") ?? 20);
  maxResults = capNumber(maxResults, MAX_RESULTS_CAP);

  let minLength = inputPayload?.minLength != null
    ? Number(inputPayload.minLength)
    : (getFlagNumber(flags, "min-length") ?? 2);

  let maxLength = inputPayload?.maxLength != null
    ? Number(inputPayload.maxLength)
    : (getFlagNumber(flags, "max-length") ?? 6);

  const includeDigraphs = inputPayload?.includeDigraphs != null
    ? Boolean(inputPayload.includeDigraphs)
    : getFlagBool(flags, "include-digraphs");

  const result = reverseGematria({
    targetSynthesis: targetNum,
    maxResults,
    minLength,
    maxLength,
    includeDigraphs,
  });

  if (isJsonMode(flags)) {
    outputJson(result, flags);
    return;
  }

  console.log(`\nReverse Gematria: target synthesis = ${targetNum}\n`);
  console.log(`  Found: ${result.totalFound} combinations${result.hasMore ? ` (showing first ${maxResults})` : ""}\n`);

  for (const r of result.results) {
    console.log(`  ${r.letters.padEnd(12)} vowels=${r.vowelsSum} consonants=${r.consonantsSum} synthesis=${r.synthesisSum}`);
  }
  console.log();
}

function cmdNumerology(dateStr: string, flags: Flags) {
  const date = parseDate(dateStr, flags);

  const kaabalistic = calculateKaabalisticLifePath(date);
  const straight = calculateStraightAcrossReductionLifePath(date);
  const challenges = calculateChallenges(date);
  const energies = getDateEnergies(date);
  const personalYear = calculatePersonalYear(date);
  const fibonacci = calculateFibonacciCycle(date, new Date());

  if (isJsonMode(flags)) {
    outputJson({ kaabalistic, straight, challenges, energies, personalYear, fibonacci }, flags);
    return;
  }

  console.log(`\nNumerology Profile: ${dateStr}\n`);

  console.log(`  Kaabalistic Life Path: ${kaabalistic.lifePath.reducedValue}`);
  console.log(`    Steps: [${kaabalistic.lifePath.reductionSteps.join(", ")}]`);
  console.log(`    Personal Mythology: [${kaabalistic.personalMythologyNumbers.join(", ")}]`);

  console.log(`\n  Straight Across Life Path: ${straight.lifePath.reducedValue}`);
  console.log(`    Day energy:   ${straight.dayEnergy.reducedValue}`);
  console.log(`    Month energy: ${straight.monthEnergy.reducedValue}`);
  console.log(`    Year energy:  ${straight.yearEnergy.reducedValue}`);

  console.log(`\n  Challenges:`);
  console.log(`    Main:  ${challenges.mainChallenge}`);
  console.log(`    Sub 1: ${challenges.subChallenge1}`);
  console.log(`    Sub 2: ${challenges.subChallenge2}`);

  console.log(`\n  Date Energies:`);
  console.log(`    Day:   ${energies.dayEnergy.reducedValue}`);
  console.log(`    Month: ${energies.monthEnergy.reducedValue}`);
  console.log(`    Year:  ${energies.yearEnergy.reducedValue}`);

  console.log(`\n  Personal Year: ${personalYear.reducedValue}`);

  console.log(`\n  Fibonacci Cycle (age ${fibonacci.currentAge}):`);
  for (let i = 1; i <= 7; i++) {
    const cycle = fibonacci[`cycle${i}` as keyof typeof fibonacci] as { reducedValue: number };
    console.log(`    Cycle ${i}: ${cycle.reducedValue}`);
  }
  console.log();
}

function cmdLifePath(dateStr: string, flags: Flags) {
  const date = parseDate(dateStr, flags);
  const result = calculateKaabalisticLifePath(date);

  if (isJsonMode(flags)) {
    outputJson(result, flags);
    return;
  }

  console.log(`\nKaabalistic Life Path: ${dateStr}\n`);
  console.log(`  Life Path: ${result.lifePath.reducedValue}`);
  console.log(`  Steps: [${result.lifePath.reductionSteps.join(", ")}]`);
  console.log(`  Personal Mythology: [${result.personalMythologyNumbers.join(", ")}]`);
  console.log(`  Parts: day=${result.reducedParts.reducedDay} month=${result.reducedParts.reducedMonth} year1=${result.reducedParts.reducedYear1} year2=${result.reducedParts.reducedYear2}`);
  console.log();
}

function cmdCycles(dateStr: string, firstName: string | undefined, flags: Flags) {
  const date = parseDate(dateStr, flags);
  const today = new Date();

  if (firstName) {
    const result = calculatePersonalCycles(date, today, firstName);

    if (isJsonMode(flags)) {
      outputJson(result, flags);
      return;
    }

    console.log(`\nPersonal Cycles: ${dateStr} (${firstName})\n`);
    console.log(`  Age: ${result.currentAge}`);
    console.log(`  Life Path: ${result.lifePath.reducedValue}`);
    console.log(`  Soul Number: ${result.soulNumber?.reducedValue}`);
    console.log(`  Personal Year: ${result.personalYear.reducedValue}`);
    console.log(`  Current Period: ${result.currentPersonalPeriod + 1}/3`);
    console.log(`  Current Month: ${result.currentPersonalMonth + 1}/12`);

    console.log(`\n  Periods:`);
    for (let i = 0; i < result.personalPeriods.length; i++) {
      const p = result.personalPeriods[i];
      const active = i === result.currentPersonalPeriod ? " <--" : "";
      console.log(`    Period ${i + 1} (months ${p.startMonth}-${p.endMonth}): ${p.value.reducedValue}${active}`);
    }

    console.log(`\n  Monthly energies:`);
    for (let i = 0; i < result.personalMonths.length; i++) {
      const m = result.personalMonths[i];
      const active = i === result.currentPersonalMonth ? " <--" : "";
      console.log(`    Month ${m.month}: ${m.value.reducedValue}${active}`);
    }
  } else {
    const result = calculateCycles(date, today);

    if (isJsonMode(flags)) {
      outputJson(result, flags);
      return;
    }

    console.log(`\nHeptad Cycles: ${dateStr}\n`);
    console.log(`  Total days since last birthday: ${result.totalDays}`);

    if (result.currentAgeCycle) {
      console.log(`\n  Age Cycles (current: ${result.currentAgeCycle}):`);
      for (const c of result.ageCycles) {
        const active = c.isActive ? " <--" : "";
        console.log(`    Cycle ${c.number}: ${c.description}${active}`);
      }
    }

    if (result.currentYearlyCycle) {
      console.log(`\n  Yearly Cycles (current: ${result.currentYearlyCycle}):`);
      for (const c of result.yearlyCycles) {
        const active = c.isActive ? " <--" : "";
        console.log(`    Cycle ${c.number}: ${c.description}${active}`);
      }
    }

    console.log(`\n  Monthly Cycles (current: ${result.currentMonthlyCycle}, day ${result.daysInMonthlyCycle}):`);
    for (const c of result.monthlyCycles) {
      const active = c.isActive ? " <--" : "";
      console.log(`    Cycle ${c.number}: ${c.description}${active}`);
    }
  }
  console.log();
}

function cmdChallenges(dateStr: string, flags: Flags) {
  const date = parseDate(dateStr, flags);
  const result = calculateChallenges(date);

  if (isJsonMode(flags)) {
    outputJson(result, flags);
    return;
  }

  console.log(`\nChallenges: ${dateStr}\n`);
  console.log(`  Day:    ${result.day}`);
  console.log(`  Month:  ${result.month}`);
  console.log(`  Year:   ${result.year}`);
  console.log(`  Main:   ${result.mainChallenge}`);
  console.log(`  Sub 1:  ${result.subChallenge1}`);
  console.log(`  Sub 2:  ${result.subChallenge2}`);
  console.log();
}

function cmdFibonacci(dateStr: string, flags: Flags) {
  const date = parseDate(dateStr, flags);
  const result = calculateFibonacciCycle(date, new Date());

  if (isJsonMode(flags)) {
    outputJson(result, flags);
    return;
  }

  console.log(`\nFibonacci Cycle: ${dateStr} (age ${result.currentAge})\n`);
  for (let i = 1; i <= 7; i++) {
    const cycle = result[`cycle${i}` as keyof typeof result] as { reducedValue: number; reductionSteps: number[] };
    console.log(`  Cycle ${i}: ${cycle.reducedValue}  [${cycle.reductionSteps.join(", ")}]`);
  }
  console.log();
}

async function cmdTarot(countStr: string | undefined, flags: Flags) {
  const count = countStr ? parseInt(countStr, 10) : 3;
  if (isNaN(count) || count < 1 || count > 78) {
    exitWithError("INVALID_ARGUMENT", "Card count must be between 1 and 78.", flags);
  }

  const shuffleCount = getFlagNumber(flags, "shuffle-count") ?? 7;
  const deck = await shuffleTarotDeck(ARKANNUS, getFlagBool(flags, "inverted"), shuffleCount);
  const drawn = deck.slice(0, count);

  if (isJsonMode(flags)) {
    outputJson(drawn, flags);
    return;
  }

  console.log(`\nTarot Draw: ${count} card${count > 1 ? "s" : ""}\n`);
  for (const card of drawn) {
    const inverted = card.isInverted ? " (INVERTED)" : "";
    console.log(`  #${String(card.number).padStart(2, "0")} ${card.tarotCard}${inverted}`);
    console.log(`       ${card.meaning}`);
    if (card.egyptianCardName) {
      console.log(`       Egyptian: ${card.egyptianCardName}`);
    }
    if (card.papusMeaning) {
      console.log(`       Papus: ${card.papusMeaning}`);
    }
    console.log();
  }
}

function cmdTarotCard(numberStr: string, flags: Flags) {
  const num = parseInt(numberStr, 10);
  const card = ARKANNUS.find((c) => c.number === num);

  if (!card) {
    exitWithError("CARD_NOT_FOUND", `Card #${num} not found. Valid range: 1-78.`, flags);
  }

  if (isJsonMode(flags)) {
    outputJson(card, flags);
    return;
  }

  console.log(`\n  #${String(card!.number).padStart(2, "0")} ${card!.tarotCard}`);
  console.log(`  Type: ${card!.type} | Suit: ${card!.suit ?? "major"} | Deck: ${card!.deck}`);
  console.log(`  Meaning: ${card!.meaning}`);
  if (card!.egyptianCardName) console.log(`  Egyptian: ${card!.egyptianCardName}`);
  if (card!.papusMeaning) console.log(`  Papus: ${card!.papusMeaning}`);
  console.log();
}

function cmdIfa(dateStr: string, flags: Flags) {
  const date = parseDate(dateStr, flags);
  const result = calculateOdu(date);

  if (isJsonMode(flags)) {
    outputJson(result, flags);
    return;
  }

  console.log(`\nOdu: ${dateStr}\n`);
  console.log(`  Left:   [${result.leftNumbers.join(", ")}]`);
  console.log(`  Right:  [${result.rightNumbers.join(", ")}]`);
  console.log(`  North:  ${result.north}`);
  console.log(`  South:  ${result.south}`);
  console.log(`  East:   ${result.east}`);
  console.log(`  West:   ${result.west}`);
  console.log(`  Center: ${result.center}`);
  console.log();
}

function getTree() {
  return createTree({ system: KAABALAH_SYSTEM, parts: ["westernAstrology", "tarot"] });
}

function serializeNode(n: { id: string; type: string; data?: unknown; name?: string }) {
  const result: Record<string, unknown> = { id: n.id, type: n.type };
  if (n.data && typeof n.data === "object" && Object.keys(n.data as object).length > 0) {
    result.data = n.data;
  }
  if (n.name) result.name = n.name;
  return result;
}

function cmdTree(flags: Flags) {
  const tree = getTree();
  const allNodes = tree.getNodes();

  if (isJsonMode(flags)) {
    const nodes = allNodes.map((n) => {
      const node = serializeNode(n);
      const relatedTypes = tree.relatedTypes(n.id);
      if (relatedTypes.length > 0) {
        node.relatedTypes = relatedTypes;
      }
      return node;
    });

    // Build edges (deduplicated: only include a→b where a.id < b.id)
    const edgeSet = new Set<string>();
    const edges: { from: string; to: string }[] = [];
    for (const n of allNodes) {
      const related = tree.related(n.id);
      for (const r of related) {
        const key = n.id < r.id ? `${n.id}|${r.id}` : `${r.id}|${n.id}`;
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push({ from: n.id, to: r.id });
        }
      }
    }

    outputJson({ system: KAABALAH_SYSTEM, totalNodes: allNodes.length, totalEdges: edges.length, nodes, edges }, flags);
    return;
  }

  console.log(`\nTree of Life (${KAABALAH_SYSTEM})\n`);
  console.log(`  Total nodes: ${allNodes.length}`);

  const byType = new Map<string, typeof allNodes>();
  for (const node of allNodes) {
    const t = node.type;
    if (!byType.has(t)) byType.set(t, []);
    byType.get(t)!.push(node);
  }

  for (const [type, nodes] of byType) {
    console.log(`\n  ${type} (${nodes.length}):`);
    for (const n of nodes.slice(0, 15)) {
      const d = n.data as Record<string, unknown> | undefined;
      const name = (d?.name ?? d?.character ?? "") as string;
      console.log(`    ${n.id}${name ? ` — ${name}` : ""}`);
    }
    if (nodes.length > 15) {
      console.log(`    ... and ${nodes.length - 15} more`);
    }
  }
  console.log();
}

function cmdTreeNode(idStr: string, flags: Flags) {
  const tree = getTree();
  const node = tree.getNode(idStr as any);

  if (!node) {
    exitWithError("INVALID_ARGUMENT", `Node "${idStr}" not found. Use "kaabalah tree:types --json" to see valid node types, or "kaabalah tree --json --fields=nodes" to list all node IDs.`, flags);
  }

  const typeFilter = getFlagString(flags, "type");
  const depth = getFlagNumber(flags, "depth") ?? 1;

  const related = depth > 1
    ? tree.walk(node!.id, depth, typeFilter as any || undefined)
    : typeFilter
      ? tree.related(node!.id, typeFilter as any)
      : tree.related(node!.id);

  if (isJsonMode(flags)) {
    outputJson({
      node: serializeNode(node!),
      relatedTypes: tree.relatedTypes(node!.id),
      related: related.map(serializeNode),
    }, flags);
    return;
  }

  console.log(`\n  ${node!.id}`);
  const d = node!.data as Record<string, unknown> | undefined;
  if (d) {
    for (const [k, v] of Object.entries(d)) {
      if (v != null && typeof v !== "object") console.log(`    ${k}: ${v}`);
    }
  }

  const relatedTypes = tree.relatedTypes(node!.id);
  console.log(`\n  Related types: ${relatedTypes.join(", ")}`);

  // Group related by type
  const byType = new Map<string, typeof related>();
  for (const r of related) {
    if (!byType.has(r.type)) byType.set(r.type, []);
    byType.get(r.type)!.push(r);
  }

  for (const [type, nodes] of byType) {
    console.log(`\n  ${type}:`);
    for (const n of nodes) {
      const rd = n.data as Record<string, unknown> | undefined;
      const label = (rd?.name ?? rd?.character ?? rd?.englishName ?? rd?.meaning ?? "") as string;
      console.log(`    ${n.id}${label ? ` — ${label}` : ""}`);
    }
  }
  console.log();
}

function cmdTreeTypes(flags: Flags) {
  const tree = getTree();
  const allNodes = tree.getNodes();

  const counts: Record<string, { count: number; ids: string[] }> = {};
  for (const n of allNodes) {
    if (!counts[n.type]) counts[n.type] = { count: 0, ids: [] };
    counts[n.type].count++;
    counts[n.type].ids.push(n.id);
  }

  if (isJsonMode(flags)) {
    outputJson(counts, flags);
    return;
  }

  console.log(`\nNode types (${Object.keys(counts).length}):\n`);
  for (const [type, info] of Object.entries(counts)) {
    console.log(`  ${type}: ${info.count}`);
  }
  console.log();
}

async function cmdAstrology(args: string[], flags: Flags, inputPayload: Record<string, unknown> | null) {
  // Parse date
  const dateStr = (inputPayload?.date as string) ?? args[0];
  if (!dateStr) {
    exitWithError("MISSING_ARGUMENT", "Usage: kaabalah astrology <YYYY-MM-DD> [HH:MM] --lat=<N> --lon=<N>", flags);
  }
  parseDate(dateStr, flags); // validate

  // Parse time
  const timeStr = (inputPayload?.time as string) ?? args[1] ?? "12:00";
  const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!timeMatch) {
    exitWithError("INVALID_ARGUMENT", `Invalid time format: "${timeStr}". Use HH:MM format.`, flags);
  }
  const hour = parseInt(timeMatch![1], 10);
  const minute = parseInt(timeMatch![2], 10);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    exitWithError("INVALID_ARGUMENT", `Invalid time: "${timeStr}". Hours 0-23, minutes 0-59.`, flags);
  }

  // Parse coordinates
  let latitude: number;
  let longitude: number;
  let resolvedLocation: string | undefined;

  const locationStr = (inputPayload?.location as string) ?? getFlagString(flags, "location");
  const latFlag = inputPayload?.lat != null ? Number(inputPayload.lat) : getFlagNumber(flags, "lat");
  const lonFlag = inputPayload?.lon != null ? Number(inputPayload.lon) : getFlagNumber(flags, "lon");

  if (latFlag != null && lonFlag != null) {
    latitude = latFlag;
    longitude = lonFlag;
  } else if (locationStr) {
    const geo = await geocodeLocation(locationStr, flags);
    latitude = geo.latitude;
    longitude = geo.longitude;
    resolvedLocation = geo.formattedAddress;
  } else {
    exitWithError(
      "MISSING_ARGUMENT",
      "Location is required. Use --lat=<N> --lon=<N> or --location=\"City, Country\" (requires GOOGLE_MAPS_API_KEY).",
      flags
    );
  }

  // Validate lat/lon
  if (latitude! < -90 || latitude! > 90) {
    exitWithError("INVALID_ARGUMENT", `Latitude must be between -90 and 90, got ${latitude!}.`, flags);
  }
  if (longitude! < -180 || longitude! > 180) {
    exitWithError("INVALID_ARGUMENT", `Longitude must be between -180 and 180, got ${longitude!}.`, flags);
  }

  // House system
  const houseSystemStr = (inputPayload?.houseSystem as string) ?? getFlagString(flags, "house-system") ?? "placidus";
  const houseSystemCode = HOUSE_SYSTEM_MAP[houseSystemStr.toLowerCase()];
  if (!houseSystemCode) {
    exitWithError(
      "INVALID_ARGUMENT",
      `Unknown house system: "${houseSystemStr}". Valid: ${Object.keys(HOUSE_SYSTEM_MAP).join(", ")}`,
      flags
    );
  }

  // Timezone
  const timezoneStr = (inputPayload?.timezone as string) ?? getFlagString(flags, "timezone");

  // Build the date with time
  const dateParts = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/)!;
  const birthDate = new Date(
    parseInt(dateParts[1], 10),
    parseInt(dateParts[2], 10) - 1,
    parseInt(dateParts[3], 10),
    hour,
    minute,
    0
  );

  // Initialize Swiss Ephemeris
  const path = require("path");
  const { getSwissEph, closeSwissEph, getBirthChart, HouseSystem } = await import("./astrology");

  // Resolve WASM/ephe paths relative to the CLI binary location
  const wasmPath = path.resolve(__dirname, "../wasm/build/swisseph.node.wasm");
  const ephePath = path.resolve(__dirname, "../ephe");

  try {
    await getSwissEph({ wasmPath, ephePath });
  } catch (err) {
    exitWithError("WASM_INIT_ERROR", `Failed to initialize Swiss Ephemeris: ${err instanceof Error ? err.message : String(err)}`, flags);
  }

  try {
    const timeZoneSettings: Record<string, unknown> = {};
    if (timezoneStr) {
      timeZoneSettings.timeZone = timezoneStr;
    } else {
      timeZoneSettings.autoTimeZone = true;
    }

    const chart = await getBirthChart({
      date: birthDate,
      latitude: latitude!,
      longitude: longitude!,
      houseSystem: houseSystemCode as unknown as typeof HouseSystem[keyof typeof HouseSystem],
      timeZoneSettings: timeZoneSettings as any,
    });

    if (isJsonMode(flags)) {
      const result: Record<string, unknown> = { ...chart };
      if (resolvedLocation) {
        result.resolvedLocation = resolvedLocation;
      }
      result.input = {
        date: dateStr,
        time: timeStr,
        latitude: latitude!,
        longitude: longitude!,
        houseSystem: houseSystemStr,
        timezone: timezoneStr ?? "auto",
      };
      outputJson(result, flags);
    } else {
      console.log(`\nBirth Chart: ${dateStr} ${timeStr}\n`);
      if (resolvedLocation) {
        console.log(`  Location: ${resolvedLocation}`);
      }
      console.log(`  Coordinates: ${latitude!.toFixed(4)}, ${longitude!.toFixed(4)}`);
      console.log(`  House System: ${houseSystemStr}`);
      console.log(`  UTC Date: ${chart.dateUtc.toISOString()}`);

      console.log(`\n  Planets:`);
      for (const [name, planet] of Object.entries(chart.planets)) {
        const zp = planet.zodiacPosition;
        console.log(`    ${name.padEnd(14)} ${zp.sign.padEnd(12)} ${zp.traditionalFormat.padEnd(8)} House ${zp.house}`);
      }

      console.log(`\n  Houses:`);
      console.log(`    Ascendant:  ${chart.houses.ascendant.sign} ${chart.houses.ascendant.traditionalFormat}`);
      console.log(`    Midheaven:  ${chart.houses.mc.sign} ${chart.houses.mc.traditionalFormat}`);
      console.log(`    Descendant: ${chart.houses.dc.sign} ${chart.houses.dc.traditionalFormat}`);
      console.log(`    IC:         ${chart.houses.ic.sign} ${chart.houses.ic.traditionalFormat}`);

      console.log(`\n  House Cusps:`);
      for (let i = 0; i < chart.houses.houses.length; i++) {
        const h = chart.houses.houses[i];
        console.log(`    House ${String(i + 1).padStart(2)}:  ${h.sign.padEnd(12)} ${h.traditionalFormat}`);
      }

      if (chart.nodes && Object.keys(chart.nodes).length > 0) {
        console.log(`\n  Nodes:`);
        for (const [, node] of Object.entries(chart.nodes)) {
          console.log(`    ${node.name.padEnd(18)} ${node.sign.padEnd(12)} ${node.traditionalFormat.padEnd(8)} House ${node.house}`);
        }
      }

      console.log();
    }
  } finally {
    closeSwissEph();
  }
}

// ── Main ──────────────────────────────────────────────────────────────

async function main() {
  const { args, flags } = parseArgs(process.argv);

  // --version
  if (getFlagBool(flags, "version")) {
    if (isJsonMode(flags)) {
      outputJson({ version: VERSION }, flags);
    } else {
      console.log(`kaabalah v${VERSION}`);
    }
    process.exit(0);
  }

  if (args.length === 0) {
    cmdHelp([], flags);
    process.exit(0);
  }

  const command = args[0];

  // --help on any command
  if (getFlagBool(flags, "help") && command !== "help") {
    cmdHelp([command], flags);
    process.exit(0);
  }

  const inputPayload = parseInputJson(flags);

  switch (command) {
    case "help":
      cmdHelp(args.slice(1), flags);
      break;

    case "gematria":
      if (!args[1] && !inputPayload?.text) {
        exitWithError("MISSING_ARGUMENT", "Usage: kaabalah gematria <text>", flags);
      }
      cmdGematria((inputPayload?.text as string) ?? args.slice(1).join(" "), flags);
      break;

    case "gematria:reverse":
      if (!args[1] && inputPayload?.targetSynthesis == null) {
        exitWithError("MISSING_ARGUMENT", "Usage: kaabalah gematria:reverse <target-number>", flags);
      }
      cmdReverseGematria(args[1] ?? String(inputPayload?.targetSynthesis ?? ""), flags, inputPayload);
      break;

    case "numerology":
      if (!args[1] && !inputPayload?.date) {
        exitWithError("MISSING_ARGUMENT", "Usage: kaabalah numerology <YYYY-MM-DD>", flags);
      }
      cmdNumerology((inputPayload?.date as string) ?? args[1], flags);
      break;

    case "numerology:lifepath":
      if (!args[1] && !inputPayload?.date) {
        exitWithError("MISSING_ARGUMENT", "Usage: kaabalah numerology:lifepath <YYYY-MM-DD>", flags);
      }
      cmdLifePath((inputPayload?.date as string) ?? args[1], flags);
      break;

    case "numerology:cycles":
      if (!args[1] && !inputPayload?.date) {
        exitWithError("MISSING_ARGUMENT", "Usage: kaabalah numerology:cycles <YYYY-MM-DD> [firstName]", flags);
      }
      cmdCycles(
        (inputPayload?.date as string) ?? args[1],
        (inputPayload?.firstName as string) ?? args[2],
        flags
      );
      break;

    case "numerology:challenges":
      if (!args[1] && !inputPayload?.date) {
        exitWithError("MISSING_ARGUMENT", "Usage: kaabalah numerology:challenges <YYYY-MM-DD>", flags);
      }
      cmdChallenges((inputPayload?.date as string) ?? args[1], flags);
      break;

    case "numerology:fibonacci":
      if (!args[1] && !inputPayload?.date) {
        exitWithError("MISSING_ARGUMENT", "Usage: kaabalah numerology:fibonacci <YYYY-MM-DD>", flags);
      }
      cmdFibonacci((inputPayload?.date as string) ?? args[1], flags);
      break;

    case "tarot":
      await cmdTarot((inputPayload?.count as string) ?? args[1], flags);
      break;

    case "tarot:card":
      if (!args[1] && inputPayload?.number == null) {
        exitWithError("MISSING_ARGUMENT", "Usage: kaabalah tarot:card <number>", flags);
      }
      cmdTarotCard((inputPayload?.number != null ? String(inputPayload.number) : undefined) ?? args[1], flags);
      break;

    case "ifa":
      if (!args[1] && !inputPayload?.date) {
        exitWithError("MISSING_ARGUMENT", "Usage: kaabalah ifa <YYYY-MM-DD>", flags);
      }
      cmdIfa((inputPayload?.date as string) ?? args[1], flags);
      break;

    case "tree":
      cmdTree(flags);
      break;

    case "tree:node":
      if (!args[1] && !inputPayload?.id) {
        exitWithError("MISSING_ARGUMENT", 'Usage: kaabalah tree:node <id> (e.g. tree:node path:1, tree:node "tarotArkAnnu:The Magician")', flags);
      }
      cmdTreeNode((inputPayload?.id as string) ?? args.slice(1).join(" "), flags);
      break;

    case "tree:types":
      cmdTreeTypes(flags);
      break;

    case "astrology":
      await cmdAstrology(args.slice(1), flags, inputPayload);
      break;

    case "--version":
      if (isJsonMode(flags)) {
        outputJson({ version: VERSION }, flags);
      } else {
        console.log(`kaabalah v${VERSION}`);
      }
      break;

    default:
      exitWithError("UNKNOWN_COMMAND", `Unknown command: "${command}". Run "kaabalah help" for usage.`, flags);
  }
}

main().catch((err) => {
  // Check if --json was in the original argv
  const hasJson = process.argv.some((a) => a === "--json") || !process.stdout.isTTY;
  if (hasJson) {
    const out = JSON.stringify({
      error: true,
      code: "INTERNAL_ERROR",
      message: err instanceof Error ? err.message : String(err),
    });
    process.stdout.write(out + "\n");
  } else {
    console.error(err instanceof Error ? err.message : err);
  }
  process.exit(1);
});
