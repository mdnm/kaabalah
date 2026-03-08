import { debugLog } from "./debug";

export type InterruptSignal = "SIGINT" | "SIGTERM";

type Cleanup = () => void;

export class CliSignalError extends Error {
  readonly signalName: InterruptSignal;
  readonly exitCode: number;

  constructor(signalName: InterruptSignal) {
    super(`Interrupted by ${signalName}.`);
    this.name = "CliSignalError";
    this.signalName = signalName;
    this.exitCode = signalName === "SIGINT" ? 130 : 143;
  }
}

export interface ExecutionContext {
  signal: AbortSignal;
  interruptedSignal: CliSignalError | null;
  registerCleanup(cleanup: Cleanup): () => void;
  requestInterrupt(signalName: InterruptSignal): void;
  throwIfInterrupted(): void;
  dispose(): void;
}

function runCleanup(cleanup: Cleanup): void {
  try {
    cleanup();
  } catch (err) {
    debugLog("signals", "Cleanup failed.", err);
  }
}

export function createExecutionContext(): ExecutionContext {
  const controller = new AbortController();
  const cleanups = new Set<Cleanup>();
  let interruptedSignal: CliSignalError | null = null;
  let disposed = false;
  let forceExitTimer: NodeJS.Timeout | null = null;

  const drainCleanups = () => {
    for (const cleanup of [...cleanups]) {
      cleanups.delete(cleanup);
      runCleanup(cleanup);
    }
  };

  const requestInterrupt = (signalName: InterruptSignal) => {
    if (interruptedSignal) {
      return;
    }

    interruptedSignal = new CliSignalError(signalName);
    debugLog("signals", `Received ${signalName}; aborting active work.`);
    controller.abort(interruptedSignal);
    drainCleanups();

    forceExitTimer = setTimeout(() => {
      process.exit(interruptedSignal!.exitCode);
    }, 1000);
    forceExitTimer.unref?.();
  };

  const handleSigInt = () => requestInterrupt("SIGINT");
  const handleSigTerm = () => requestInterrupt("SIGTERM");

  process.once("SIGINT", handleSigInt);
  process.once("SIGTERM", handleSigTerm);

  return {
    signal: controller.signal,
    get interruptedSignal() {
      return interruptedSignal;
    },
    registerCleanup(cleanup: Cleanup) {
      if (interruptedSignal) {
        runCleanup(cleanup);
        return () => undefined;
      }

      cleanups.add(cleanup);
      return () => {
        cleanups.delete(cleanup);
      };
    },
    requestInterrupt,
    throwIfInterrupted() {
      if (interruptedSignal) {
        throw interruptedSignal;
      }
    },
    dispose() {
      if (disposed) {
        return;
      }

      disposed = true;
      process.off("SIGINT", handleSigInt);
      process.off("SIGTERM", handleSigTerm);

      if (forceExitTimer) {
        clearTimeout(forceExitTimer);
        forceExitTimer = null;
      }

      cleanups.clear();
    },
  };
}

export function isAbortError(err: unknown): boolean {
  return err instanceof Error && (
    err.name === "AbortError" ||
    (typeof (err as { code?: unknown }).code === "string" && (err as { code: string }).code === "ABORT_ERR")
  );
}

export function isCliSignalError(err: unknown): err is CliSignalError {
  return err instanceof CliSignalError;
}
