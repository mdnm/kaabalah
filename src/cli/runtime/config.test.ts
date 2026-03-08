import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { resolveRuntimeConfig } from "./config";

function makeTempDir(): string {
  return mkdtempSync(join(tmpdir(), "kaabalah-config-"));
}

function writeJson(path: string, value: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(value, null, 2));
}

const originalIsTTY = process.stdout.isTTY;
const tempDirs: string[] = [];

afterEach(() => {
  Object.defineProperty(process.stdout, "isTTY", {
    configurable: true,
    value: originalIsTTY,
  });

  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("resolveRuntimeConfig", () => {
  it("applies user < project < env precedence for config-backed flags", () => {
    const tempDir = makeTempDir();
    tempDirs.push(tempDir);

    const xdgConfigHome = join(tempDir, "xdg");
    writeJson(join(xdgConfigHome, "kaabalah", "config.json"), {
      json: false,
      compact: false,
      houseSystem: "koch",
    });
    writeJson(join(tempDir, "kaabalah.config.json"), {
      json: true,
      compact: true,
      houseSystem: "whole-sign",
    });

    Object.defineProperty(process.stdout, "isTTY", {
      configurable: true,
      value: true,
    });

    const resolved = resolveRuntimeConfig(
      {},
      {
        cwd: tempDir,
        env: {
          ...process.env,
          HOME: tempDir,
          XDG_CONFIG_HOME: xdgConfigHome,
          KAABALAH_COMPACT: "false",
        },
      }
    );

    expect(resolved.flags.json).toBe(true);
    expect(resolved.flags.compact).toBe(false);
    expect(resolved.flags["house-system"]).toBe("whole-sign");
  });

  it("lets CLI flags override env and config defaults", () => {
    const tempDir = makeTempDir();
    tempDirs.push(tempDir);

    const xdgConfigHome = join(tempDir, "xdg");
    writeJson(join(xdgConfigHome, "kaabalah", "config.json"), {
      json: true,
      compact: false,
    });
    writeJson(join(tempDir, "kaabalah.config.json"), {
      compact: false,
    });

    Object.defineProperty(process.stdout, "isTTY", {
      configurable: true,
      value: true,
    });

    const resolved = resolveRuntimeConfig(
      {
        "no-json": true,
        compact: true,
      },
      {
        cwd: tempDir,
        env: {
          ...process.env,
          HOME: tempDir,
          XDG_CONFIG_HOME: xdgConfigHome,
          KAABALAH_JSON: "true",
          KAABALAH_COMPACT: "false",
        },
      }
    );

    expect(resolved.flags["no-json"]).toBe(true);
    expect(resolved.flags.json).toBeUndefined();
    expect(resolved.flags.compact).toBe(true);
  });
});
