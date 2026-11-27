import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { closeSwissEph, getSwissEph } from "../astrology/swisseph";
import { getMayaSunsetWelcome } from "./sunset-welcome";

describe("Maya sunset welcome", () => {
  it("identifies the next trecena across the Calendar Board rollover without a location", async () => {
    expect(await getMayaSunsetWelcome("2012-12-17")).toMatchObject({
      incomingDay: { sign: "caban", tone: 1 }, opensTrecena: true, status: "no-location", sunset: null,
    });
    expect(await getMayaSunsetWelcome("2012-12-18")).toMatchObject({ opensTrecena: false, incomingDay: { tone: 2 } });
  });

  describe("with a location", () => {
    beforeAll(() => getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH }));
    afterAll(() => closeSwissEph());

    it("uses the requested local sunset when its UTC date is the next day", async () => {
      const result = await getMayaSunsetWelcome("2024-04-08", { latitude: 32.78, longitude: -96.8 });
      expect(result).toMatchObject({ timeZone: "America/Chicago", status: "calculated" });
      expect(result.sunset?.toISOString().slice(0, 16)).toBe("2024-04-09T00:52");
    });

    it("keeps the incoming sign on a polar day without a sunset", async () => {
      expect(await getMayaSunsetWelcome("2024-06-21", { latitude: 90, longitude: 0, timeZone: "UTC" })).toMatchObject({
        status: "unavailable", sunset: null, incomingDay: { sign: "imix", tone: 6 },
      });
    });
  });
});
