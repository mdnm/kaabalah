import { getFlagBool, getFlagString } from "./args";
import type { Flags } from "./types";

function pickFields(obj: unknown, paths: string[]): unknown {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

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

    if (current === undefined) {
      continue;
    }

    let target: Record<string, unknown> = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in target) || typeof target[parts[i]] !== "object") {
        target[parts[i]] = {};
      }
      target = target[parts[i]] as Record<string, unknown>;
    }
    target[parts[parts.length - 1]] = current;
  }

  return result;
}

export function outputJson(data: unknown, flags: Flags): void {
  let output = data;

  const fieldsStr = getFlagString(flags, "fields");
  if (fieldsStr) {
    const paths = fieldsStr.split(",").map((value) => value.trim()).filter(Boolean);
    if (paths.length > 0) {
      output = pickFields(output, paths);
    }
  }

  const indent = getFlagBool(flags, "compact") ? undefined : 2;
  console.log(JSON.stringify(output, null, indent));
}
