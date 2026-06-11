import { afterEach, describe, expect, it, vi } from "vitest";

import { parseDate, parseUtcNoonDate, validateDateString } from "./validation";
import type { Flags } from "./types";

const flags: Flags = { json: true, compact: true };

afterEach(() => {
  vi.restoreAllMocks();
});

describe("date validation", () => {
  it("parses date-only CLI input at local noon", () => {
    const date = parseDate("1990-01-15", flags);

    expect(date.getFullYear()).toBe(1990);
    expect(date.getMonth()).toBe(0);
    expect(date.getDate()).toBe(15);
    expect(date.getHours()).toBe(12);
  });

  it("keeps UTC-noon parsing available for ISO-date consumers", () => {
    expect(parseUtcNoonDate("1990-01-15", flags).toISOString()).toBe("1990-01-15T12:00:00.000Z");
  });

  it("exits with an invalid-date error for malformed dates", () => {
    const stdout = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    const exit = vi.spyOn(process, "exit").mockImplementation((() => {
      throw new Error("process.exit");
    }) as typeof process.exit);

    expect(() => validateDateString("1990-1-15", flags)).toThrow("process.exit");

    expect(exit).toHaveBeenCalledWith(1);
    expect(stdout).toHaveBeenCalledWith(expect.stringContaining('"code":"INVALID_DATE"'));
  });
});
