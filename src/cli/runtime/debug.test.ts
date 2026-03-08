import { afterEach, describe, expect, it, vi } from "vitest";

import { configureDebugRuntime, debugLog, resetDebugRuntime } from "./debug";

afterEach(() => {
  resetDebugRuntime();
  vi.restoreAllMocks();
});

describe("debug runtime", () => {
  it("emits namespaced logs when --debug is enabled", () => {
    const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);

    configureDebugRuntime({ debug: true });
    debugLog("parser", "Parsed CLI arguments.");

    expect(stderrSpy).toHaveBeenCalledWith("[kaabalah:parser] Parsed CLI arguments.\n");
  });

  it("supports namespace selection via DEBUG=kaabalah:*", () => {
    const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);

    configureDebugRuntime({}, { ...process.env, DEBUG: "kaabalah:*" });
    debugLog("config", "Resolved runtime config.");

    expect(stderrSpy).toHaveBeenCalledWith("[kaabalah:config] Resolved runtime config.\n");
  });

  it("does not emit logs for unrelated DEBUG namespaces", () => {
    const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);

    configureDebugRuntime({}, { ...process.env, DEBUG: "other:*" });
    debugLog("config", "Resolved runtime config.");

    expect(stderrSpy).not.toHaveBeenCalled();
  });
});

