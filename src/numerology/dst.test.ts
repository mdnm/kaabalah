import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

/**
 * Runs `dst.inner.test.ts` in child processes whose timezone is fixed by the
 * environment at process start (no runtime process.env.TZ mutation).
 */
describe.skipIf(process.env.KAABALAH_EXPECT_TZ !== undefined)("DST-sensitive numerology in fixed timezones", () => {
  it.each(["America/Sao_Paulo", "Pacific/Auckland", "UTC"])("passes under TZ=%s", (tz) => {
    const result = spawnSync(
      process.execPath,
      ["node_modules/vitest/vitest.mjs", "run", "src/numerology/dst.inner.test.ts", "--reporter=basic"],
      {
        env: { ...process.env, TZ: tz, KAABALAH_EXPECT_TZ: tz },
        encoding: "utf8",
        cwd: process.cwd(),
      }
    );
    expect(result.stdout + result.stderr).toContain("2 passed");
    expect(result.status).toBe(0);
  }, 60000);
});
