import type { Flags } from "./types";

const DEBUG_NAMESPACE_PREFIX = "kaabalah";
const DEBUG_ALL = "*";

interface DebugState {
  enabledAll: boolean;
  namespaces: Set<string>;
  trace: boolean;
}

function createEmptyState(): DebugState {
  return {
    enabledAll: false,
    namespaces: new Set<string>(),
    trace: false,
  };
}

let activeState: DebugState = createEmptyState();

function normalizePattern(pattern: string): string | null {
  const trimmed = pattern.trim();
  if (trimmed.length === 0) {
    return null;
  }

  if (
    trimmed === "*" ||
    trimmed === DEBUG_NAMESPACE_PREFIX ||
    trimmed === `${DEBUG_NAMESPACE_PREFIX}:*`
  ) {
    return DEBUG_ALL;
  }

  if (trimmed.startsWith(`${DEBUG_NAMESPACE_PREFIX}:`)) {
    return trimmed.slice(DEBUG_NAMESPACE_PREFIX.length + 1);
  }

  return null;
}

function serializeDebugDetails(details: unknown): string {
  if (details == null) {
    return "";
  }

  const normalized = details instanceof Error
    ? {
        name: details.name,
        message: details.message,
        stack: details.stack,
      }
    : details;

  try {
    return ` ${JSON.stringify(normalized)}`;
  } catch {
    return ` ${String(normalized)}`;
  }
}

export function configureDebugRuntime(
  flags: Flags = {},
  env: NodeJS.ProcessEnv = process.env
): void {
  const patterns = String(env.DEBUG ?? "")
    .split(/[,\s]+/)
    .map(normalizePattern)
    .filter((value): value is string => value != null);

  activeState = {
    enabledAll: flags.debug === true || patterns.includes(DEBUG_ALL),
    namespaces: new Set(patterns.filter((value) => value !== DEBUG_ALL)),
    trace: flags.trace === true,
  };
}

export function resetDebugRuntime(): void {
  activeState = createEmptyState();
}

export function isTraceEnabled(): boolean {
  return activeState.trace;
}

export function isDebugEnabled(namespace: string): boolean {
  return activeState.enabledAll || activeState.namespaces.has(namespace);
}

export function debugLog(namespace: string, message: string, details?: unknown): void {
  if (!isDebugEnabled(namespace)) {
    return;
  }

  process.stderr.write(
    `[${DEBUG_NAMESPACE_PREFIX}:${namespace}] ${message}${serializeDebugDetails(details)}\n`
  );
}

