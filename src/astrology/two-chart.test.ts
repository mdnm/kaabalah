import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  getBirthChart,
  getCompositeChart,
  getCompositeFromCharts,
  getSynastryChart,
  getSynastryFromCharts,
  getTransitChart,
  getTransitChartFromChart,
  HouseSystem,
  type BirthChart,
  type BirthChartOptions,
} from "./index";
import { closeSwissEph, getSwissEph } from "./swisseph";

const utc = { treatAsUTC: true } as const;
const optA: BirthChartOptions = {
  date: new Date(Date.UTC(1985, 2, 14, 6, 15)),
  latitude: 48.85,
  longitude: 2.35,
  houseSystem: HouseSystem.PLACIDUS,
  timeZoneSettings: utc,
};
const optB: BirthChartOptions = {
  date: new Date(Date.UTC(1991, 10, 3, 21, 40)),
  latitude: -33.87,
  longitude: 151.2,
  houseSystem: HouseSystem.WHOLE_SIGN,
  timeZoneSettings: utc,
};

describe("two-chart functions accept already-computed charts", () => {
  let chartA: BirthChart;
  let chartB: BirthChart;
  beforeAll(async () => {
    await getSwissEph({ ephePath: EPHE_PATH, wasmPath: WASM_PATH });
    [chartA, chartB] = await Promise.all([getBirthChart(optA), getBirthChart(optB)]);
  });
  afterAll(() => closeSwissEph());

  it("getBirthChart records the house system (default Placidus)", async () => {
    expect(chartA.houseSystem).toBe(HouseSystem.PLACIDUS);
    expect(chartB.houseSystem).toBe(HouseSystem.WHOLE_SIGN);
    const dflt = await getBirthChart({ ...optA, houseSystem: undefined });
    expect(dflt.houseSystem).toBe(HouseSystem.PLACIDUS);
  });

  it("synastry: option-based and fromCharts results are deep-equal", async () => {
    const viaOptions = await getSynastryChart({ chartA: optA, chartB: optB });
    const viaCharts = getSynastryFromCharts(chartA, chartB);
    expect(viaCharts).toEqual(viaOptions);
    expect(Object.keys(viaOptions).sort()).toEqual(["aspects", "chartA", "chartB"]); // shape unchanged
    expect(viaCharts.chartA).toBe(chartA); // no recomputation or copy
    expect(viaCharts.aspects.length).toBeGreaterThan(0);
  });

  it("composite: option-based and fromCharts results are deep-equal, house systems come from the charts", async () => {
    const viaOptions = await getCompositeChart({ chartA: optA, chartB: optB });
    const viaCharts = getCompositeFromCharts(chartA, chartB);
    expect(viaCharts).toEqual(viaOptions);
    expect(viaCharts.houseSystems).toEqual({
      a: { system: HouseSystem.PLACIDUS, source: "chart" },
      b: { system: HouseSystem.WHOLE_SIGN, source: "chart" },
    });
    expect(viaCharts.notices.some((n) => n.type === "mixed_house_systems")).toBe(true);
  });

  it("composite of two whole-sign charts uses whole-sign houses taken from the charts", async () => {
    const wsA = await getBirthChart({ ...optA, houseSystem: HouseSystem.WHOLE_SIGN });
    const c = getCompositeFromCharts(wsA, chartB);
    expect(c.compositeMethod.houses).toBe("whole-sign");
    const asc = c.compositeAngles.ascendant.longitude;
    expect(c.compositeHouses[0].longitude).toBe(Math.floor(asc / 30) * 30);
  });

  it("hand-built charts without a recorded system use the explicit option, else an assumed default", () => {
    const { houseSystem: _a, ...bareA } = chartA;
    const { houseSystem: _b, ...bareB } = chartB;
    const assumed = getCompositeFromCharts(bareA as BirthChart, bareB as BirthChart);
    expect(assumed.houseSystems.a).toEqual({ system: HouseSystem.PLACIDUS, source: "assumed-default" });
    expect(assumed.compositeMethod.houses).toBe("midpoint-of-corresponding-cusps");
    const optioned = getCompositeFromCharts(bareA as BirthChart, bareB as BirthChart, {
      houseSystemA: HouseSystem.PLACIDUS,
      houseSystemB: HouseSystem.WHOLE_SIGN,
    });
    const ref = getCompositeFromCharts(chartA, chartB);
    const strip = ({ chartA: _p, chartB: _q, houseSystems: _h, ...r }: typeof ref) => r;
    expect(strip(optioned)).toEqual(strip(ref));
    expect(optioned.houseSystems.b.source).toBe("option");
    const bothWhole = getCompositeFromCharts(bareA as BirthChart, bareB as BirthChart, {
      houseSystemA: HouseSystem.WHOLE_SIGN,
      houseSystemB: HouseSystem.WHOLE_SIGN,
    });
    expect(bothWhole.compositeMethod.houses).toBe("whole-sign");
  });

  it("omitCharts returns metadata only, with identical computed content", async () => {
    const full = getSynastryFromCharts(chartA, chartB);
    const light = getSynastryFromCharts(chartA, chartB, { omitCharts: true, ids: { a: "p1", b: "p2" } });
    expect("chartA" in light).toBe(false);
    expect(light.aspects).toEqual(full.aspects);
    expect(light.charts.a).toEqual({ id: "p1", dateUtc: chartA.dateUtc, houseSystem: HouseSystem.PLACIDUS });
    expect(light.charts.b.id).toBe("p2");

    const cFull = getCompositeFromCharts(chartA, chartB);
    const cLight = getCompositeFromCharts(chartA, chartB, { omitCharts: true });
    expect("chartA" in cLight).toBe(false);
    const { chartA: _x, chartB: _y, ...rest } = cFull;
    const { charts, ...lightRest } = cLight;
    expect(lightRest).toEqual(rest);
    expect(charts.a.id).toBeUndefined();
    // option-based variants honour omitCharts too
    const viaOpts = await getSynastryChart({ chartA: optA, chartB: optB, omitCharts: true });
    expect("chartA" in viaOpts).toBe(false);
    expect(viaOpts.aspects).toEqual(full.aspects);
  });

  it("transits: getTransitChart and getTransitChartFromChart are deep-equal; derived charts work as the natal chart", async () => {
    const transitDate = new Date(Date.UTC(2024, 5, 1, 12));
    const viaOptions = await getTransitChart({ natal: optA, transitDate, transitTimeZoneSettings: utc });
    const viaChart = await getTransitChartFromChart(chartA, {
      transitDate,
      transitTimeZoneSettings: utc,
      transitLatitude: optA.latitude,
      transitLongitude: optA.longitude,
      houseSystem: optA.houseSystem,
    });
    expect(viaChart).toEqual(viaOptions);
    expect(viaChart.natalChart).toBe(chartA);
    // A composite-free derived chart (here chart B stands in for any BirthChart: Davison, progressed ...)
    const overB = await getTransitChartFromChart(chartB, {
      transitDate,
      transitTimeZoneSettings: utc,
      transitLatitude: 0,
      transitLongitude: 0,
    });
    expect(overB.natalChart).toBe(chartB);
    expect(overB.transitPlanets.sun.natalHouse).toBeGreaterThanOrEqual(1);
  });
});
