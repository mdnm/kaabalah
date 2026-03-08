import { describe, expect, it } from "vitest";

import { CliSignalError, createExecutionContext } from "./execution";

describe("createExecutionContext", () => {
  it("aborts active work and runs registered cleanups on interrupt", () => {
    const context = createExecutionContext();

    try {
      const calls: string[] = [];
      context.registerCleanup(() => {
        calls.push("cleanup");
      });

      context.requestInterrupt("SIGINT");

      expect(context.signal.aborted).toBe(true);
      expect(context.interruptedSignal).toBeInstanceOf(CliSignalError);
      expect(context.interruptedSignal?.signalName).toBe("SIGINT");
      expect(context.interruptedSignal?.exitCode).toBe(130);
      expect(calls).toEqual(["cleanup"]);
      expect(() => context.throwIfInterrupted()).toThrowError(CliSignalError);
    } finally {
      context.dispose();
    }
  });

  it("runs late cleanups immediately after interruption", () => {
    const context = createExecutionContext();

    try {
      const calls: string[] = [];
      context.requestInterrupt("SIGTERM");
      context.registerCleanup(() => {
        calls.push("late-cleanup");
      });

      expect(context.interruptedSignal?.signalName).toBe("SIGTERM");
      expect(context.interruptedSignal?.exitCode).toBe(143);
      expect(calls).toEqual(["late-cleanup"]);
    } finally {
      context.dispose();
    }
  });
});

