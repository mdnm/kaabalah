import { describe, expect, it } from "vitest";
import {
  aspectEdgesTable,
  chartPointsTable,
  escapeMarkdownCell,
  numerologyIntervalsTable,
  toMarkdownTable,
  toTable,
  type TableColumn,
} from "./tabulate";

interface Row {
  name: string;
  value?: number | null;
  flag?: boolean;
}
const columns: TableColumn<Row>[] = [
  { key: "name", header: "Name" },
  { key: "value", header: "Value", type: "number", precision: 2 },
  { key: "flag", header: "Flag", type: "boolean" },
];

describe("toTable", () => {
  it("keeps column order, rounds to explicit precision and returns cell arrays", () => {
    const t = toTable<Row>([{ name: "a", value: 1.005 + 1e-9, flag: true }, { name: "b", value: 10 }], columns);
    expect(t.columns.map((c) => c.key)).toEqual(["name", "value", "flag"]);
    expect(t.columns[1]).toEqual({ key: "value", header: "Value", type: "number", precision: 2 });
    expect(t.rows).toEqual([["a", 1.01, true], ["b", 10, null]]);
    expect(t.unavailable).toBeUndefined();
  });

  it("renders null, undefined, non-finite and unavailable objects as explicit null cells with reasons", () => {
    const rows = [
      { name: "x", value: null },
      { name: "y", value: Number.NaN },
      { name: "z", value: { available: false, reason: "before-birth" } as unknown as number },
    ];
    const t = toTable(rows, columns);
    expect(t.rows.map((r) => r[1])).toEqual([null, null, null]);
    expect(t.unavailable).toEqual([
      { row: 1, column: "value", reason: "non-finite" },
      { row: 2, column: "value", reason: "before-birth" },
    ]);
  });

  it("normalises negative zero and supports custom getters and integers", () => {
    const t = toTable([{ n: -0.00001 }], [
      { key: "a", type: "number", precision: 2, get: (r: { n: number }) => r.n },
      { key: "b", type: "integer", get: (r: { n: number }) => r.n + 2.6 },
    ]);
    expect(Object.is(t.rows[0][0], 0)).toBe(true);
    expect(t.rows[0][1]).toBe(3);
  });
});

describe("toMarkdownTable", () => {
  it("renders header, alignment and fixed-precision numbers", () => {
    const md = toMarkdownTable<Row>([{ name: "a", value: 1.5, flag: false }], columns);
    expect(md.split("\n")).toEqual(["| Name | Value | Flag |", "| --- | ---: | --- |", "| a | 1.50 | false |"]);
  });

  it("escapes pipes, backslashes and newlines", () => {
    expect(escapeMarkdownCell("a|b\\c\nd\r\ne")).toBe("a\\|b\\\\c<br>d<br>e");
    const md = toMarkdownTable([{ name: "x|y\nz" }], [{ key: "name", header: "N|1" }]);
    expect(md).toContain("| N\\|1 |");
    expect(md).toContain("| x\\|y<br>z |");
    expect(md.split("\n")).toHaveLength(3);
  });

  it("renders null and unavailable explicitly, with reasons unless disabled", () => {
    const rows: Row[] = [{ name: "a", value: null }, { name: "b", value: { available: false, reason: "after-death" } as never }];
    const md = toMarkdownTable(rows, columns);
    expect(md).toContain("| a | n/a | n/a |");
    expect(md).toContain("| b | n/a (after-death) | n/a |");
    expect(toMarkdownTable(toTable(rows, columns), { nullText: "-", showReasons: false })).toContain("| b | - | - |");
  });

  it("accepts a prebuilt table and gives identical output", () => {
    const rows: Row[] = [{ name: "a", value: 2 }];
    expect(toMarkdownTable(toTable(rows, columns))).toBe(toMarkdownTable(rows, columns));
  });
});

describe("presets", () => {
  it("tabulates aspect edges tightest orb first by default, stable for ties", () => {
    const edges = [
      { planetA: "sun", planetB: "moon", aspect: "trine", aspectAngle: 120, delta: 121, orb: 1, longitudeA: 10, longitudeB: 131 },
      { planetA: "sun", planetB: "mars", aspect: "square", aspectAngle: 90, delta: 90.5, orb: 0.5, longitudeA: 10, longitudeB: 100.5 },
      { planetA: "mars", planetB: "venus", aspect: "sextile", aspectAngle: 60, delta: 61, orb: 1, longitudeA: 1, longitudeB: 62 },
    ];
    const t = aspectEdgesTable(edges);
    expect(t.rows.map((r) => r[1])).toEqual(["mars", "moon", "venus"]);
    expect(aspectEdgesTable(edges, { sort: "none" }).rows.map((r) => r[1])).toEqual(["moon", "mars", "venus"]);
    expect(t.rows[0].length).toBe(t.columns.length);
  });

  it("tabulates chart points with angles and missing data as explicit nulls", () => {
    const t = chartPointsTable({
      planets: {
        sun: { longitude: 354.123456, longitudeSpeed: 0.99, zodiacPosition: { sign: "pisces", decimalDegrees: 24.1235, house: 10 } },
        moon: { longitude: 12 },
      },
      houses: { ascendant: { longitude: 100.5, sign: "cancer", decimalDegrees: 10.5, house: 1 } },
    });
    expect(t.rows.map((r) => r[0])).toEqual(["sun", "moon", "ascendant"]);
    expect(t.rows[0]).toEqual(["sun", 354.1235, "pisces", 24.1235, 10, 0.99]);
    expect(t.rows[1]).toEqual(["moon", 12, null, null, null, null]);
    expect(toMarkdownTable(t)).toContain("n/a");
  });

  it("tabulates numerology intervals, unwrapping reduced numbers and keeping unavailable explicit", () => {
    const t = numerologyIntervalsTable([
      { layer: "personal-year", start: "2020-03-14", endExclusive: "2021-03-14", lengthDays: 365, clipped: false, personalYear: { value: 5, reductionSteps: [14], isMaster: false } },
      { layer: "pinnacle", start: "1990-03-14", endExclusive: null, lengthDays: null, clipped: true, value: { value: 11, reductionSteps: [], isMaster: true } },
      { layer: "personal-period", start: "2020-01-01", endExclusive: "2020-05-01", lengthDays: 121, value: { available: false, reason: "first-name-missing" } },
    ]);
    expect(t.rows.map((r) => r[5])).toEqual([5, 11, null]);
    expect(t.rows[1][2]).toBeNull();
    expect(t.unavailable).toEqual([{ row: 2, column: "value", reason: "first-name-missing" }]);
    expect(toMarkdownTable(t)).toContain("n/a (first-name-missing)");
  });
});
