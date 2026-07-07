import type { Flags } from "./types";

type StderrWrite = typeof process.stderr.write;

let originalStderrWrite: StderrWrite | null = null;

export function isQuietMode(flags: Flags): boolean {
  return flags.quiet === true || flags.silent === true;
}

export function configureQuietRuntime(flags: Flags = {}): void {
  if (isQuietMode(flags)) {
    if (!originalStderrWrite) {
      originalStderrWrite = process.stderr.write.bind(process.stderr) as StderrWrite;
      process.stderr.write = (() => true) as StderrWrite;
    }
    return;
  }

  if (originalStderrWrite) {
    process.stderr.write = originalStderrWrite;
    originalStderrWrite = null;
  }
}
