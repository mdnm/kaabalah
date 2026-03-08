import { exitWithError, type ErrorCode } from "./errors";
import type { Flags } from "./types";

export const MAX_STDIN_BYTES = 64 * 1024;

interface ReadStdinOptions {
  emptyCode: ErrorCode;
  emptyMessage: string;
}

export function hasStdinSource(): boolean {
  return process.stdin.isTTY !== true;
}

export async function readStdin(flags: Flags, options: ReadStdinOptions): Promise<string> {
  if (!hasStdinSource()) {
    exitWithError(options.emptyCode, options.emptyMessage, flags);
  }

  return await new Promise((resolve, reject) => {
    const chunks: string[] = [];
    let totalBytes = 0;

    const cleanup = () => {
      process.stdin.off("data", onData);
      process.stdin.off("end", onEnd);
      process.stdin.off("error", onError);
    };

    const onData = (chunk: string) => {
      totalBytes += Buffer.byteLength(chunk, "utf8");

      // Fail before dispatching if stdin is much larger than the CLI contract expects.
      if (totalBytes > MAX_STDIN_BYTES) {
        cleanup();
        exitWithError(
          "INVALID_ARGUMENT",
          `stdin payload exceeds maximum size of ${MAX_STDIN_BYTES} bytes.`,
          flags
        );
      }

      chunks.push(chunk);
    };

    const onEnd = () => {
      cleanup();

      const value = chunks.join("");
      if (value.length === 0) {
        exitWithError(options.emptyCode, options.emptyMessage, flags);
      }

      resolve(value);
    };

    const onError = (err: Error) => {
      cleanup();
      reject(err);
    };

    process.stdin.setEncoding("utf8");
    process.stdin.on("data", onData);
    process.stdin.on("end", onEnd);
    process.stdin.on("error", onError);
    process.stdin.resume();
  });
}
