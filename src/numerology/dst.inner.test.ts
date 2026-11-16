/**
 * Timezone-sensitive checks. Runs in the host timezone during a normal test
 * run (the assertions hold in every timezone) and is re-run by `dst.test.ts`
 * in a child process with TZ=America/Sao_Paulo, where 2018-11-05 00:30 is
 * after the 2018-11-04 DST start. TZ is never mutated at runtime.
 */
import { describe, expect, it } from "vitest";
import { calculateCycles } from "./index";

const local = (y: number, m: number, d: number, h: number, min: number) => new Date(y, m - 1, d, h, min);

describe("civil day ordinals across DST", () => {
  it("2018-11-05 gives heptad day 32 at 00:30, 01:30 and 12:00 local", () => {
    const birth = local(2001, 10, 5, 12, 0);
    for (const [h, m] of [[0, 30], [1, 30], [12, 0], [23, 59]]) {
      const res = calculateCycles(birth, local(2018, 11, 5, h, m));
      expect(res.daysInMonthlyCycle, `${h}:${m}`).toBe(32);
      expect(res.totalDays).toBe(32);
    }
  });

  it("runs in the requested timezone when launched by the outer test", () => {
    if (process.env.KAABALAH_EXPECT_TZ) {
      expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe(process.env.KAABALAH_EXPECT_TZ);
      if (process.env.KAABALAH_EXPECT_TZ === "America/Sao_Paulo") {
        // Brazil's 2018 DST started 2018-11-04 00:00 (clocks forward 1h), so noon-to-noon over it is 47h.
        const before = local(2018, 11, 3, 12, 0).getTime();
        const after = local(2018, 11, 5, 12, 0).getTime();
        expect((after - before) / 3600000).toBe(47);
      }
    }
  });
});
