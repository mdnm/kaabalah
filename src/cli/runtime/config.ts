import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { debugLog } from "./debug";
import type { ErrorCode } from "./errors";
import type { Flags } from "./types";

const PROJECT_CONFIG_FILENAME = "kaabalah.config.json";

const SUPPORTED_CONFIG_KEYS = [
  "json",
  "compact",
  "houseSystem",
  "timezone",
  "wasmPath",
  "ephePath",
  "googleMapsApiKey",
] as const;

type SupportedConfigKey = (typeof SUPPORTED_CONFIG_KEYS)[number];

interface ConfigValues {
  json?: boolean;
  compact?: boolean;
  houseSystem?: string;
  timezone?: string;
  wasmPath?: string;
  ephePath?: string;
  googleMapsApiKey?: string;
}

export interface ResolvedRuntimeConfig {
  flags: Flags;
  googleMapsApiKey?: string;
}

export class CliConfigError extends Error {
  code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = "CliConfigError";
    this.code = code;
  }
}

let activeConfig: ResolvedRuntimeConfig = { flags: {} };

function ensureBoolean(value: unknown, label: string, source: string): boolean {
  if (typeof value !== "boolean") {
    throw new CliConfigError("INVALID_ARGUMENT", `${source}: "${label}" must be a boolean.`);
  }

  return value;
}

function ensureString(value: unknown, label: string, source: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new CliConfigError("INVALID_ARGUMENT", `${source}: "${label}" must be a non-empty string.`);
  }

  return value;
}

function normalizeConfigObject(config: Record<string, unknown>, source: string): ConfigValues {
  const normalized: ConfigValues = {};

  for (const [rawKey, value] of Object.entries(config)) {
    const key = rawKey === "house-system"
      ? "houseSystem"
      : rawKey === "wasm-path"
        ? "wasmPath"
        : rawKey === "ephe-path"
          ? "ephePath"
          : rawKey;

    if (!SUPPORTED_CONFIG_KEYS.includes(key as SupportedConfigKey)) {
      throw new CliConfigError(
        "INVALID_ARGUMENT",
        `${source}: unknown config key "${rawKey}". Supported keys: ${SUPPORTED_CONFIG_KEYS.join(", ")}.`
      );
    }

    switch (key as SupportedConfigKey) {
      case "json":
        normalized.json = ensureBoolean(value, rawKey, source);
        break;
      case "compact":
        normalized.compact = ensureBoolean(value, rawKey, source);
        break;
      case "houseSystem":
        normalized.houseSystem = ensureString(value, rawKey, source);
        break;
      case "timezone":
        normalized.timezone = ensureString(value, rawKey, source);
        break;
      case "wasmPath":
        normalized.wasmPath = ensureString(value, rawKey, source);
        break;
      case "ephePath":
        normalized.ephePath = ensureString(value, rawKey, source);
        break;
      case "googleMapsApiKey":
        normalized.googleMapsApiKey = ensureString(value, rawKey, source);
        break;
    }
  }

  return normalized;
}

function readConfigFile(path: string, label: string): ConfigValues {
  if (!existsSync(path)) {
    return {};
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    throw new CliConfigError(
      "INVALID_JSON",
      `${label} config at "${path}" contains invalid JSON: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new CliConfigError("INVALID_JSON", `${label} config at "${path}" must be a JSON object.`);
  }

  return normalizeConfigObject(parsed as Record<string, unknown>, `${label} config at "${path}"`);
}

function parseBooleanEnv(name: string, value: string | undefined): boolean | undefined {
  if (value == null || value.length === 0) {
    return undefined;
  }

  const normalized = value.toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  throw new CliConfigError(
    "INVALID_ARGUMENT",
    `Environment variable ${name} must be a boolean (true/false, 1/0, yes/no, on/off).`
  );
}

function readEnvConfig(env: NodeJS.ProcessEnv): ConfigValues {
  const config: ConfigValues = {};

  const json = parseBooleanEnv("KAABALAH_JSON", env.KAABALAH_JSON);
  const compact = parseBooleanEnv("KAABALAH_COMPACT", env.KAABALAH_COMPACT);

  if (json != null) {
    config.json = json;
  }
  if (compact != null) {
    config.compact = compact;
  }
  if (env.KAABALAH_HOUSE_SYSTEM) {
    config.houseSystem = env.KAABALAH_HOUSE_SYSTEM;
  }
  if (env.KAABALAH_TIMEZONE) {
    config.timezone = env.KAABALAH_TIMEZONE;
  }
  if (env.KAABALAH_WASM_PATH) {
    config.wasmPath = env.KAABALAH_WASM_PATH;
  }
  if (env.KAABALAH_EPHE_PATH) {
    config.ephePath = env.KAABALAH_EPHE_PATH;
  }
  if (env.KAABALAH_GOOGLE_MAPS_API_KEY) {
    config.googleMapsApiKey = env.KAABALAH_GOOGLE_MAPS_API_KEY;
  } else if (env.GOOGLE_MAPS_API_KEY) {
    config.googleMapsApiKey = env.GOOGLE_MAPS_API_KEY;
  }

  return config;
}

function mapConfigToFlags(config: ConfigValues): Flags {
  const flags: Flags = {};

  if (config.json != null) {
    flags.json = config.json;
  }
  if (config.compact != null) {
    flags.compact = config.compact;
  }
  if (config.houseSystem) {
    flags["house-system"] = config.houseSystem;
  }
  if (config.timezone) {
    flags.timezone = config.timezone;
  }
  if (config.wasmPath) {
    flags["wasm-path"] = config.wasmPath;
  }
  if (config.ephePath) {
    flags["ephe-path"] = config.ephePath;
  }

  return flags;
}

function describeConfig(config: ConfigValues): Record<string, unknown> {
  return {
    json: config.json,
    compact: config.compact,
    houseSystem: config.houseSystem,
    timezone: config.timezone,
    wasmPath: config.wasmPath,
    ephePath: config.ephePath,
    hasGoogleMapsApiKey: config.googleMapsApiKey != null,
  };
}

function describeFlags(flags: Flags): Record<string, unknown> {
  const described: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(flags)) {
    described[key] = key === "input-json" ? "[provided]" : value;
  }

  return described;
}

function getUserConfigPath(env: NodeJS.ProcessEnv): string | null {
  if (env.XDG_CONFIG_HOME) {
    return join(env.XDG_CONFIG_HOME, "kaabalah", "config.json");
  }

  if (process.platform === "win32" && env.APPDATA) {
    return join(env.APPDATA, "kaabalah", "config.json");
  }

  if (env.HOME) {
    return join(env.HOME, ".config", "kaabalah", "config.json");
  }

  return null;
}

function applyJsonDefaults(flags: Flags): Flags {
  if (!process.stdout.isTTY && flags["no-json"] !== true && flags.json !== true) {
    flags.json = true;
  }

  return flags;
}

export function resolveRuntimeConfig(
  cliFlags: Flags,
  options: { cwd?: string; env?: NodeJS.ProcessEnv } = {}
): ResolvedRuntimeConfig {
  const cwd = options.cwd ?? process.cwd();
  const env = options.env ?? process.env;

  const userConfigPath = getUserConfigPath(env);
  const userConfig = userConfigPath ? readConfigFile(userConfigPath, "User") : {};
  const projectConfigPath = join(cwd, PROJECT_CONFIG_FILENAME);
  const projectConfig = readConfigFile(projectConfigPath, "Project");
  const envConfig = readEnvConfig(env);
  const mergedConfig = {
    ...userConfig,
    ...projectConfig,
    ...envConfig,
  };

  const flags = applyJsonDefaults({
    ...mapConfigToFlags(mergedConfig),
    ...cliFlags,
  });

  if (flags["no-json"] === true) {
    delete flags.json;
  }

  debugLog("config", "Resolved runtime config precedence.", {
    userConfigPath,
    projectConfigPath,
    sources: {
      user: describeConfig(userConfig),
      project: describeConfig(projectConfig),
      env: describeConfig(envConfig),
      cli: describeFlags(cliFlags),
    },
    resolvedFlags: describeFlags(flags),
    hasGoogleMapsApiKey: mergedConfig.googleMapsApiKey != null,
  });

  activeConfig = {
    flags,
    googleMapsApiKey: mergedConfig.googleMapsApiKey,
  };

  return activeConfig;
}

export function getGoogleMapsApiKey(): string | undefined {
  return activeConfig.googleMapsApiKey;
}

export function isCliConfigError(err: unknown): err is CliConfigError {
  return err instanceof CliConfigError;
}
