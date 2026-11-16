/**
 * Dependency-free JSON / Markdown tabulation helpers.
 *
 * `toTable(rows, columns)` turns row objects into `{ columns, rows }` (cells are arrays in
 * column order, so ordering is stable and never depends on object key order).
 * `toMarkdownTable` renders the same data. Numbers carry an explicit precision; `null`,
 * `undefined`, non-finite numbers and "unavailable" objects (`{ available: false, reason }`)
 * become explicit null cells (rendered `n/a`), never blank or "NaN". Output is numeric data
 * only; no interpretation text is attached.
 */

export type Cell = string | number | boolean | null;

export type ColumnType = "string" | "number" | "integer" | "boolean";

export interface TableColumn<Row = Record<string, unknown>> {
  /** Stable machine key. */
  key: string;
  /** Display header; defaults to `key`. */
  header?: string;
  /** Default "string". Numbers need a type of "number" or "integer" to be rounded. */
  type?: ColumnType;
  /** Decimal places for type "number" (default 4). Ignored for "integer". */
  precision?: number;
  /** Read the value from a row; default `row[key]`. */
  get?: (row: Row) => unknown;
}

export interface TableColumnMeta {
  key: string;
  header: string;
  type: ColumnType;
  precision?: number;
}

export interface TableData {
  columns: TableColumnMeta[];
  rows: Cell[][];
  /** Present only when some cells were unavailable, with the reason when the source gave one. */
  unavailable?: { row: number; column: string; reason: string | null }[];
}

export interface MarkdownTableOptions {
  /** Text for null / unavailable cells. Default "n/a". */
  nullText?: string;
  /** Append ` (reason)` to unavailable cells that carry one. Default true. */
  showReasons?: boolean;
}

const DEFAULT_PRECISION = 4;

function isUnavailable(value: unknown): value is { available: false; reason?: unknown } {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { available?: unknown }).available === false
  );
}

function roundTo(value: number, precision: number): number {
  const rounded = Number(value.toFixed(precision));
  return Object.is(rounded, -0) ? 0 : rounded;
}

interface NormalizedCell {
  cell: Cell;
  reason: string | null | undefined; // undefined = available (or plain null with no reason)
  unavailable: boolean;
}

function normalizeCell(value: unknown, column: TableColumnMeta): NormalizedCell {
  if (isUnavailable(value)) {
    const reason = (value as { reason?: unknown }).reason;
    return { cell: null, unavailable: true, reason: typeof reason === "string" ? reason : null };
  }
  if (value === null || value === undefined) {
    return { cell: null, unavailable: false, reason: undefined };
  }
  switch (column.type) {
    case "number":
    case "integer": {
      const n = typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;
      if (!Number.isFinite(n)) {
        return { cell: null, unavailable: true, reason: "non-finite" };
      }
      const cell = column.type === "integer" ? Math.round(n) : roundTo(n, column.precision ?? DEFAULT_PRECISION);
      return { cell: Object.is(cell, -0) ? 0 : cell, unavailable: false, reason: undefined };
    }
    case "boolean":
      return { cell: Boolean(value), unavailable: false, reason: undefined };
    default:
      return { cell: typeof value === "string" ? value : String(value), unavailable: false, reason: undefined };
  }
}

/** Build a table from rows and column definitions (column order is the output order). */
export function toTable<Row>(rows: readonly Row[], columns: readonly TableColumn<Row>[]): TableData {
  const meta: TableColumnMeta[] = columns.map((column) => {
    const type = column.type ?? "string";
    const m: TableColumnMeta = { key: column.key, header: column.header ?? column.key, type };
    if (type === "number") m.precision = column.precision ?? DEFAULT_PRECISION;
    return m;
  });
  const unavailable: NonNullable<TableData["unavailable"]> = [];
  const out: Cell[][] = rows.map((row, rowIndex) =>
    columns.map((column, columnIndex) => {
      const raw = column.get ? column.get(row) : (row as Record<string, unknown>)?.[column.key];
      const normalized = normalizeCell(raw, meta[columnIndex]);
      if (normalized.unavailable) {
        unavailable.push({ row: rowIndex, column: column.key, reason: normalized.reason ?? null });
      }
      return normalized.cell;
    })
  );
  const table: TableData = { columns: meta, rows: out };
  if (unavailable.length > 0) table.unavailable = unavailable;
  return table;
}

/** Escape a string for use inside a Markdown table cell. */
export function escapeMarkdownCell(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/\r\n|\r|\n/g, "<br>");
}

function formatCell(cell: Cell, column: TableColumnMeta): string {
  if (cell === null) return "";
  if (typeof cell === "number") {
    return column.type === "number" ? cell.toFixed(column.precision ?? DEFAULT_PRECISION) : String(cell);
  }
  return escapeMarkdownCell(String(cell));
}

/** Render a table as GitHub-flavoured Markdown. Numeric columns are right-aligned. */
export function toMarkdownTable(table: TableData, options?: MarkdownTableOptions): string;
export function toMarkdownTable<Row>(
  rows: readonly Row[],
  columns: readonly TableColumn<Row>[],
  options?: MarkdownTableOptions
): string;
export function toMarkdownTable<Row>(
  first: TableData | readonly Row[],
  second?: readonly TableColumn<Row>[] | MarkdownTableOptions,
  third?: MarkdownTableOptions
): string {
  let table: TableData;
  let options: MarkdownTableOptions | undefined;
  if (Array.isArray(second)) {
    table = toTable(first as readonly Row[], second as readonly TableColumn<Row>[]);
    options = third;
  } else {
    table = first as TableData;
    options = second as MarkdownTableOptions | undefined;
  }
  const nullText = options?.nullText ?? "n/a";
  const showReasons = options?.showReasons ?? true;
  const reasonAt = new Map<string, string | null>();
  for (const u of table.unavailable ?? []) reasonAt.set(`${u.row}:${u.column}`, u.reason);

  const header = `| ${table.columns.map((c) => escapeMarkdownCell(c.header)).join(" | ")} |`;
  const align = `| ${table.columns
    .map((c) => (c.type === "number" || c.type === "integer" ? "---:" : "---"))
    .join(" | ")} |`;
  const body = table.rows.map((row, rowIndex) => {
    const cells = row.map((cell, columnIndex) => {
      const column = table.columns[columnIndex];
      if (cell === null) {
        const reason = showReasons ? reasonAt.get(`${rowIndex}:${column.key}`) : null;
        return reason ? `${escapeMarkdownCell(nullText)} (${escapeMarkdownCell(reason)})` : escapeMarkdownCell(nullText);
      }
      return formatCell(cell, column);
    });
    return `| ${cells.join(" | ")} |`;
  });
  return [header, align, ...body].join("\n");
}

// ---------------------------------------------------------------------------
// Presets (structural types only; no imports from other modules)
// ---------------------------------------------------------------------------

export interface AspectEdgeRow {
  planetA: string;
  planetB: string;
  aspect: string;
  aspectAngle: number;
  delta?: number;
  orb: number;
  longitudeA?: number;
  longitudeB?: number;
}

export const ASPECT_EDGE_COLUMNS: readonly TableColumn<AspectEdgeRow>[] = [
  { key: "planetA", header: "A" },
  { key: "planetB", header: "B" },
  { key: "aspect", header: "Aspect" },
  { key: "aspectAngle", header: "Angle", type: "number", precision: 1 },
  { key: "orb", header: "Orb", type: "number", precision: 3 },
  { key: "longitudeA", header: "Lon A", type: "number", precision: 3 },
  { key: "longitudeB", header: "Lon B", type: "number", precision: 3 },
];

/** Aspect edges as a table, tightest orb first by default (stable for ties). */
export function aspectEdgesTable(
  edges: readonly AspectEdgeRow[],
  options: { sort?: "orb" | "none" } = {}
): TableData {
  const sorted = (options.sort ?? "orb") === "orb" ? stableSort(edges, (a, b) => a.orb - b.orb) : edges;
  return toTable(sorted, ASPECT_EDGE_COLUMNS);
}

function stableSort<T>(items: readonly T[], compare: (a: T, b: T) => number): T[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((x, y) => compare(x.item, y.item) || x.index - y.index)
    .map((x) => x.item);
}

export interface ChartPointsSource {
  planets: Record<
    string,
    {
      longitude: number;
      longitudeSpeed?: number;
      zodiacPosition?: { sign?: string; decimalDegrees?: number; house?: number };
    }
  >;
  houses?: {
    ascendant?: { longitude: number; sign?: string; decimalDegrees?: number; house?: number };
    mc?: { longitude: number; sign?: string; decimalDegrees?: number; house?: number };
  };
}

export interface ChartPointRow {
  point: string;
  longitude: number | null;
  sign: string | null;
  degreeInSign: number | null;
  house: number | null;
  speed: number | null;
}

export const CHART_POINT_COLUMNS: readonly TableColumn<ChartPointRow>[] = [
  { key: "point", header: "Point" },
  { key: "longitude", header: "Longitude", type: "number", precision: 4 },
  { key: "sign", header: "Sign" },
  { key: "degreeInSign", header: "Deg in sign", type: "number", precision: 4 },
  { key: "house", header: "House", type: "integer" },
  { key: "speed", header: "Speed (deg/day)", type: "number", precision: 4 },
];

/** Chart points (planets in chart order, then ascendant and MC when present) as a table. */
export function chartPointsTable(chart: ChartPointsSource): TableData {
  const rows: ChartPointRow[] = Object.entries(chart.planets).map(([point, p]) => ({
    point,
    longitude: p.longitude,
    sign: p.zodiacPosition?.sign ?? null,
    degreeInSign: p.zodiacPosition?.decimalDegrees ?? null,
    house: p.zodiacPosition?.house ?? null,
    speed: p.longitudeSpeed ?? null,
  }));
  for (const [key, angle] of [
    ["ascendant", chart.houses?.ascendant],
    ["mc", chart.houses?.mc],
  ] as const) {
    if (angle) {
      rows.push({
        point: key,
        longitude: angle.longitude,
        sign: angle.sign ?? null,
        degreeInSign: angle.decimalDegrees ?? null,
        house: angle.house ?? null,
        speed: null,
      });
    }
  }
  return toTable(rows, CHART_POINT_COLUMNS);
}

export interface NumerologyIntervalRow {
  layer: string;
  start: string;
  endExclusive: string | null;
  lengthDays: number | null;
  clipped?: boolean;
  /** Layer-specific reduced value (`value`, `personalYear` ...) is read when present. */
  value?: unknown;
  personalYear?: unknown;
  personalMonth?: unknown;
  personalDay?: unknown;
  label?: unknown;
}

function reducedValue(v: unknown): unknown {
  if (v === null || v === undefined) return null;
  if (typeof v === "object") {
    if (isUnavailable(v)) return v;
    return (v as { value?: unknown }).value ?? null;
  }
  return v;
}

export interface NumerologyIntervalTableRow {
  layer: string;
  start: string;
  endExclusive: string | null;
  lengthDays: number | null;
  clipped: boolean | null;
  value: unknown;
}

export const NUMEROLOGY_INTERVAL_COLUMNS: readonly TableColumn<NumerologyIntervalTableRow>[] = [
  { key: "layer", header: "Layer" },
  { key: "start", header: "Start" },
  { key: "endExclusive", header: "End (exclusive)" },
  { key: "lengthDays", header: "Days", type: "integer" },
  { key: "clipped", header: "Clipped", type: "boolean" },
  { key: "value", header: "Value", type: "integer" },
];

/**
 * Numerology timeline intervals as a table. The value column holds the layer's headline
 * number (`personalDay` > `personalMonth` > `value` > `personalYear` > `label`), unwrapped
 * from `{ value }` objects; unavailable values stay explicit.
 */
export function numerologyIntervalsTable(intervals: readonly NumerologyIntervalRow[]): TableData {
  const rows: NumerologyIntervalTableRow[] = intervals.map((i) => ({
    layer: i.layer,
    start: i.start,
    endExclusive: i.endExclusive,
    lengthDays: i.lengthDays,
    clipped: i.clipped ?? null,
    value: reducedValue(i.personalDay ?? i.personalMonth ?? i.value ?? i.personalYear ?? i.label),
  }));
  return toTable(rows, NUMEROLOGY_INTERVAL_COLUMNS);
}
