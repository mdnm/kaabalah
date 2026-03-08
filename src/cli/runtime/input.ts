import { getFlagString } from "./args";
import { exitWithError } from "./errors";
import { readStdin } from "./stdin";
import type { Flags, InputPayload } from "./types";

export const MAX_TEXT_LENGTH = 1000;
export const MAX_RESULTS_CAP = 10000;

function parseInputJsonObject(raw: string, flags: Flags, source: "flag" | "stdin"): InputPayload {
  const inputLabel = source === "stdin" ? "--input-json=-" : "--input-json";

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      exitWithError("INVALID_JSON", `${inputLabel} must be a JSON object`, flags);
    }
    return parsed as Record<string, unknown>;
  } catch {
    if (source === "stdin") {
      exitWithError("INVALID_JSON", "Invalid JSON on stdin for --input-json=-.", flags);
    }

    exitWithError("INVALID_JSON", `Invalid JSON in --input-json: ${raw}`, flags);
  }
}

export async function parseInputJson(flags: Flags): Promise<InputPayload> {
  const raw = getFlagString(flags, "input-json");
  if (!raw) {
    return null;
  }

  if (raw === "-") {
    const stdin = await readStdin(flags, {
      emptyCode: "INVALID_JSON",
      emptyMessage: "--input-json=- requires a JSON object on stdin.",
    });
    return parseInputJsonObject(stdin, flags, "stdin");
  }

  return parseInputJsonObject(raw, flags, "flag");
}

export function sanitizeInput(str: string): string {
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
}

export function trimTrailingLineBreaks(str: string): string {
  return str.replace(/(?:\r\n|\r|\n)+$/, "");
}

export function capNumber(value: number, max: number): number {
  if (value > max) {
    return max;
  }
  if (value < 0) {
    return 0;
  }
  return value;
}
