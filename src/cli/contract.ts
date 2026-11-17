import packageJson from "../../package.json";

export const VERSION = packageJson.version;

export interface CommandArg {
  name: string;
  type: "string" | "number" | "date";
  required: boolean;
  description: string;
}

export interface CommandFlag {
  name: string;
  type: "boolean" | "string" | "number";
  default?: string | boolean | number;
  description: string;
}

export interface CommandSchema {
  name: string;
  description: string;
  args: CommandArg[];
  flags: CommandFlag[];
  examples: string[];
}

export const GLOBAL_FLAGS: CommandFlag[] = [
  { name: "language", type: "string", description: "Language for display text (en or pt-BR)" },
  { name: "json", type: "boolean", default: false, description: "Output as JSON (auto-enabled when stdout is not a TTY)" },
  { name: "no-json", type: "boolean", default: false, description: "Force human-readable output even when piped" },
  { name: "compact", type: "boolean", default: false, description: "Minified JSON output (no indentation)" },
  { name: "fields", type: "string", description: "Comma-separated dot-paths to filter JSON output (e.g. --fields=a.b,c.d)" },
  { name: "input-json", type: "string", description: "JSON string, or - to read a JSON object from stdin" },
  { name: "quiet", type: "boolean", default: false, description: "Suppress stderr diagnostics and notices" },
  { name: "silent", type: "boolean", default: false, description: "Alias for --quiet" },
  { name: "debug", type: "boolean", default: false, description: "Emit debug logs to stderr (same effect as DEBUG=kaabalah:*)" },
  { name: "trace", type: "boolean", default: false, description: "Print stack traces for unexpected fatal errors in human-readable mode" },
];


const LOCATION_DESCRIPTION = "Location string for geocoding (requires GOOGLE_MAPS_API_KEY or KAABALAH_GOOGLE_MAPS_API_KEY)";

const AS_OF_FLAG: CommandFlag = {
  name: "as-of",
  type: "string",
  description: "Evaluation date YYYY-MM-DD (default: today's host-local date; pass it for reproducible output)",
};

const SCHEDULE_FLAGS: CommandFlag[] = [
  { name: "birth-kind", type: "string", default: "full", description: "Shape of <birth>: full (YYYY-MM-DD), month-day (MM-DD), year-month (YYYY-MM), year (YYYY), year-approx (YYYY, approximate) or unknown" },
  AS_OF_FLAG,
  { name: "name-kind", type: "string", default: "first-token", description: "How firstName is read for the soul number: first-token, given-name or full-name" },
  { name: "life-path-method", type: "string", description: "Life path method: kaabalistic (default for personal period 2) or straight-across (default for life stages)" },
  { name: "masters", type: "string", default: "preserve", description: "Master-number policy: preserve or reduce" },
  { name: "short-month-policy", type: "string", default: "next-month-first", description: "Personal-month start when the birth day is missing from a month: next-month-first, clamp or overflow" },
  { name: "death", type: "string", description: "Death date YYYY-MM-DD (inclusive last day of coverage); a missing death date is not evidence of survival" },
  { name: "horizon", type: "string", description: "Exclusive end date YYYY-MM-DD of the coverage" },
];

const TABLE_FORMAT_FLAG: CommandFlag = {
  name: "format",
  type: "string",
  default: "json",
  description: "Output format: json (full result), table (JSON table of rows) or markdown (a Markdown table on stdout, not JSON)",
};

const STRICT_EPHEMERIS_FLAG: CommandFlag = {
  name: "strict-ephemeris",
  type: "boolean",
  default: false,
  description: "Fail instead of silently using the Moshier ephemeris outside the shipped Swiss Ephemeris files",
};

const RUNTIME_FLAGS: CommandFlag[] = [
  { name: "wasm-path", type: "string", description: "Override the Swiss Ephemeris WASM runtime path" },
  { name: "ephe-path", type: "string", description: "Override the ephemeris data directory path" },
  STRICT_EPHEMERIS_FLAG,
];

const NATAL_FLAGS: CommandFlag[] = [
  { name: "lat", type: "number", description: "Natal latitude (-90 to 90)" },
  { name: "lon", type: "number", description: "Natal longitude (-180 to 180)" },
  { name: "location", type: "string", description: LOCATION_DESCRIPTION },
  { name: "house-system", type: "string", default: "placidus", description: "House system for the natal chart" },
  { name: "timezone", type: "string", description: "Natal IANA timezone (auto-resolved if omitted)" },
];

const NATAL_ARGS: CommandArg[] = [
  { name: "date", type: "date", required: true, description: "Natal birth date in YYYY-MM-DD format" },
  { name: "time", type: "string", required: false, description: "Natal birth time in HH:MM format (default: 12:00)" },
];

const POLICY_FLAGS: CommandFlag[] = [
  { name: "orb-profile", type: "string", description: "Generation-time orb policy: ptolemaic-plus-quincunx (adds a policyAspects result; unlike --max-orb it can recover contacts the default orbs omit)" },
  { name: "points", type: "string", description: "Comma-separated typed point IDs (sun, moon, mean-node, asc, mc, lot-fortune, ...) for the points result and policy aspects" },
  { name: "group-axes", type: "boolean", default: false, description: "Add axis-equivalence groups (ASC/DSC, MC/IC, node/south node) to policyAspects" },
];

export const COMMANDS: CommandSchema[] = [
  {
    name: "iching:cast", description: "Cast six I Ching lines using three fair coins per line",
    args: [], flags: [], examples: ["kaabalah iching:cast --json --compact"],
  },
  {
    name: "iching:hexagram", description: "Describe a King Wen hexagram, Chinese texts and fixed correspondences",
    args: [{name:"number",type:"number",required:true,description:"King Wen number (1–64); with --input-json pass it as \"hexagramNumber\""}], flags: [],
    examples: ["kaabalah iching:hexagram 25 --json --compact", `kaabalah iching:hexagram --input-json='{"hexagramNumber":25}' --json --compact`],
  },
  {
    name: "iching:reading", description: "Derive a complete I Ching reading from six bottom-first classical line values",
    args: [], flags: [
      {name:"lines",type:"string",description:"Six bottom-to-top values: 6 old yin, 7 young yang, 8 young yin, 9 old yang (--input-json: \"lines\" array of six numbers)"},
      {name:"hexagram",type:"number",description:"King Wen number, instead of --lines (--input-json: \"hexagramNumber\")"},
      {name:"moving",type:"string",description:"Unique moving positions, comma-separated (1 bottom, 6 top) (--input-json: \"movingLines\" array)"},
    ], examples: ["kaabalah iching:reading --lines 879777 --json --compact", "kaabalah iching:reading --hexagram 30 --moving 2,4 --json --compact", `kaabalah iching:reading --input-json='{"hexagramNumber":25,"movingLines":[4]}' --json --compact`, `kaabalah iching:reading --input-json='{"lines":[8,7,9,7,7,7]}' --json --compact`],
  },
  {
    name: "gematria",
    description: "Calculate gematria for a word/phrase",
    args: [{ name: "text", type: "string", required: true, description: "Text to calculate gematria for" }],
    flags: [
      { name: "missing", type: "boolean", default: false, description: "Show missing gematria values" },
      { name: "percentages", type: "boolean", default: false, description: "Show letter percentages" },
      { name: "resolve-paths", type: "boolean", default: false, description: "Include Tree of Life sphere/path correspondences for each Hebrew letter" },
    ],
    examples: [
      'kaabalah gematria "Hello World"',
      'kaabalah gematria "abc" --resolve-paths --json --compact',
      "kaabalah gematria --json --compact < phrase.txt",
    ],
  },
  {
    name: "gematria:reverse",
    description: "Find letter combos matching a gematria value",
    args: [{ name: "target", type: "number", required: true, description: "Target synthesis number" }],
    flags: [
      { name: "max-results", type: "number", default: 20, description: "Maximum results to return (max 10000)" },
      { name: "min-length", type: "number", default: 2, description: "Minimum letters per combination" },
      { name: "max-length", type: "number", default: 6, description: "Maximum letters per combination" },
      { name: "include-digraphs", type: "boolean", default: false, description: "Include digraphs like PH, SH" },
    ],
    examples: ["kaabalah gematria:reverse 22", "kaabalah gematria:reverse 22 --max-results=50 --json"],
  },
  {
    name: "numerology",
    description: "Full numerological profile for a birth date",
    args: [{ name: "date", type: "date", required: true, description: "Birth date in YYYY-MM-DD format" }],
    flags: [AS_OF_FLAG],
    examples: [
      "kaabalah numerology 1990-01-15 --as-of=2026-03-01 --json --compact",
      "kaabalah numerology 1990-01-15",
      "kaabalah numerology 1990-01-15 --json --fields=kaabalistic.lifePath.reducedValue",
      "kaabalah numerology --input-json=- --json --compact < numerology.json",
    ],
  },
  {
    name: "numerology:lifepath",
    description: "Life path number (kaabalistic method)",
    args: [{ name: "date", type: "date", required: true, description: "Birth date in YYYY-MM-DD format" }],
    flags: [],
    examples: ["kaabalah numerology:lifepath 1990-01-15"],
  },
  {
    name: "numerology:cycles",
    description: "Legacy personal cycles: without firstName the heptad/age-cycle family, with firstName the personal year/month/period family (see numerology:heptads and numerology:personal-cycles for predictable output)",
    args: [
      { name: "date", type: "date", required: true, description: "Birth date in YYYY-MM-DD format" },
      { name: "firstName", type: "string", required: false, description: "First name for personal cycles" },
    ],
    flags: [AS_OF_FLAG],
    examples: ["kaabalah numerology:cycles 1990-01-15", "kaabalah numerology:cycles 1990-01-15 John --as-of=2026-03-01 --json --compact"],
  },
  {
    name: "numerology:challenges",
    description: "Challenges from birth date",
    args: [{ name: "date", type: "date", required: true, description: "Birth date in YYYY-MM-DD format" }],
    flags: [],
    examples: ["kaabalah numerology:challenges 1990-01-15"],
  },
  {
    name: "numerology:fibonacci",
    description: "Fibonacci cycle for current age",
    args: [{ name: "date", type: "date", required: true, description: "Birth date in YYYY-MM-DD format" }],
    flags: [AS_OF_FLAG],
    examples: ["kaabalah numerology:fibonacci 1990-01-15 --as-of=2026-03-01 --json --compact"],
  },
  {
    name: "numerology:snapshot",
    description: "Dated numerology snapshot (personal year/month/period, heptad, age cycle, Fibonacci, calendar frame, life stages) with method metadata",
    args: [
      { name: "birth", type: "string", required: false, description: "Birth value (YYYY-MM-DD, or the shape chosen by --birth-kind); with --input-json pass \"birth\" as a string or {kind,...} object" },
      { name: "firstName", type: "string", required: false, description: "First name for the soul number (personal period 3)" },
    ],
    flags: [...SCHEDULE_FLAGS],
    examples: [
      "kaabalah numerology:snapshot 1990-01-15 Ana --as-of=2026-03-01 --json --compact",
      "kaabalah numerology:snapshot 01-15 --birth-kind=month-day --as-of=2026-03-01 --json --compact",
      `kaabalah numerology:snapshot --input-json='{"birth":{"kind":"year-month","year":1990,"month":1},"asOf":"2026-03-01"}' --json --compact`,
    ],
  },
  {
    name: "numerology:timeline",
    description: "Bounded numerology intervals between --from and --to (exclusive) for chosen layers",
    args: [
      { name: "birth", type: "string", required: false, description: "Birth value (YYYY-MM-DD, or the shape chosen by --birth-kind)" },
      { name: "firstName", type: "string", required: false, description: "First name for the soul number (personal period 3)" },
    ],
    flags: [
      ...SCHEDULE_FLAGS,
      { name: "from", type: "string", description: "Inclusive window start YYYY-MM-DD (required)" },
      { name: "to", type: "string", description: "Exclusive window end YYYY-MM-DD (required)" },
      { name: "layers", type: "string", default: "personal-year", description: "Comma-separated layers: personal-year, personal-month, personal-period, heptad, age-cycle, fibonacci, calendar-year, calendar-month, calendar-day, pinnacle, challenge, life-period" },
      { name: "max-intervals", type: "number", default: 2000, description: "Interval budget (max 10000); exceeding it is an error, nothing is truncated" },
      TABLE_FORMAT_FLAG,
    ],
    examples: [
      "kaabalah numerology:timeline 1990-01-15 Ana --from=2026-01-01 --to=2027-01-01 --layers=personal-year,personal-month --json --compact",
      "kaabalah numerology:timeline 1990-01-15 --from=2026-01-01 --to=2026-07-01 --layers=heptad --format=markdown",
    ],
  },
  {
    name: "numerology:heptads",
    description: "Fixed 52-day heptads and seven-year age cycles around the evaluation date",
    args: [
      { name: "birth", type: "string", required: false, description: "Birth value (YYYY-MM-DD, or the shape chosen by --birth-kind)" },
    ],
    flags: [
      ...SCHEDULE_FLAGS,
      { name: "from", type: "string", description: "Inclusive window start (default: the as-of date)" },
      { name: "to", type: "string", description: "Exclusive window end (default: as-of + 365 days)" },
      TABLE_FORMAT_FLAG,
    ],
    examples: ["kaabalah numerology:heptads 1990-01-15 --as-of=2026-03-01 --json --compact"],
  },
  {
    name: "numerology:personal-cycles",
    description: "Birthday-based personal year, twelve personal months and three four-month periods (defaults to the birthday year containing the evaluation date)",
    args: [
      { name: "birth", type: "string", required: false, description: "Birth value (YYYY-MM-DD, or the shape chosen by --birth-kind)" },
      { name: "firstName", type: "string", required: false, description: "First name for the soul number (personal period 3)" },
    ],
    flags: [
      ...SCHEDULE_FLAGS,
      { name: "from", type: "string", description: "Inclusive window start (default: start of the birthday year)" },
      { name: "to", type: "string", description: "Exclusive window end (default: next birthday)" },
      TABLE_FORMAT_FLAG,
    ],
    examples: ["kaabalah numerology:personal-cycles 1990-01-15 Ana --as-of=2026-03-01 --json --compact"],
  },
  {
    name: "numerology:life-stages",
    description: "Pinnacles, challenges and three life periods under a named age-transition convention",
    args: [{ name: "birth", type: "date", required: false, description: "Full birth date in YYYY-MM-DD format" }],
    flags: [
      AS_OF_FLAG,
      { name: "life-path-method", type: "string", default: "straight-across", description: "Life path used for the age transition: kaabalistic or straight-across" },
      { name: "masters", type: "string", default: "preserve", description: "Master-number policy: preserve or reduce" },
      { name: "first-pinnacle-end-age", type: "number", description: "Override the 36-minus-life-path first pinnacle end age (integer 1-60)" },
      { name: "life-period-rule", type: "string", default: "pinnacle-aligned-27", description: "Life period boundaries: pinnacle-aligned-27 or fixed-28-56" },
    ],
    examples: ["kaabalah numerology:life-stages 1990-01-15 --as-of=2026-03-01 --json --compact"],
  },
  {
    name: "numerology:partial",
    description: "What a partial birth date can and cannot compute; optional candidate-date summaries (invariants and ranges, never an invented date)",
    args: [{ name: "birth", type: "string", required: false, description: "Birth value in the shape chosen by --birth-kind" }],
    flags: [
      ...SCHEDULE_FLAGS,
      { name: "candidates", type: "boolean", default: false, description: "Summarise every valid day of a year or year-month birth (needs year or year-month knowledge)" },
    ],
    examples: [
      "kaabalah numerology:partial 1990-01 --birth-kind=year-month --candidates --as-of=2026-03-01 --json --compact",
    ],
  },
  {
    name: "tarot",
    description: "Draw tarot cards (default: 3)",
    args: [{ name: "count", type: "number", required: false, description: "Number of cards to draw (1-78, default: 3)" }],
    flags: [
      { name: "inverted", type: "boolean", default: false, description: "Include inverted cards" },
      { name: "shuffle-count", type: "number", default: 7, description: "Number of times to shuffle the deck" },
      { name: "deck", type: "string", description: "Deck for image/description: papus_pt, papus, mythic, egyptian, rider-waite" },
      { name: "include-fields", type: "string", description: "Comma-separated legacy card fields to include with --deck (papus, egyptian)" },
    ],
    examples: ["kaabalah tarot 5 --inverted", "kaabalah tarot --json"],
  },
  {
    name: "tarot:card",
    description: "Look up a specific card by number or name",
    args: [{ name: "query", type: "string", required: true, description: "Card number (1-78) or name (e.g. 'The Chariot', 'Two of Cups')" }],
    flags: [
      { name: "deck", type: "string", description: "Deck for image/description: papus_pt, papus, mythic, egyptian, rider-waite" },
      { name: "decks", type: "boolean", description: "List available decks" },
      { name: "include-fields", type: "string", description: "Comma-separated legacy card fields to include with --deck (papus, egyptian)" },
    ],
    examples: [
      "kaabalah tarot:card 7",
      'kaabalah tarot:card "The Chariot" --json',
      "kaabalah tarot:card chariot --json",
      'kaabalah tarot:card "The Fool" --deck=rider-waite --json',
    ],
  },
  {
    name: "tarot:spread",
    description: "Look up multiple tarot cards by name or number, or draw a named spread with --spread-id",
    args: [{ name: "cards", type: "string", required: false, description: "Card names or numbers, space-separated (quote multi-word names)" }],
    flags: [
      { name: "list", type: "boolean", default: false, description: "List built-in spread IDs and requirements" },
      { name: "verbose", type: "boolean", default: false, description: "Include full spread slot definitions with --list" },
      { name: "describe", type: "boolean", default: false, description: "Describe a spread schema without drawing cards" },
      { name: "spread-id", type: "string", description: "Draw a built-in spread by ID (e.g. quick-insight, celtic-cross, event-reading)" },
      { name: "method", type: "string", description: "Spread draw method: random or conscious" },
      { name: "indices", type: "string", description: "Comma-separated 1-based pool indices for --method=conscious" },
      { name: "deck", type: "string", description: "Deck for image/description: papus_pt, papus, mythic, egyptian, rider-waite" },
      { name: "shuffle-count", type: "number", default: 7, description: "Number of times to shuffle the deck for conscious spreads" },
      { name: "include-fields", type: "string", description: "Comma-separated legacy card fields to include with --deck (papus, egyptian)" },
      { name: "inverted", type: "boolean", default: false, description: "Include inverted cards when drawing a named spread" },
      { name: "inquirer-gender", type: "string", description: 'Required by event-reading; must be "man" or "woman"' },
    ],
    examples: [
      'kaabalah tarot:spread "Two of Cups" "The Chariot" 7',
      "kaabalah tarot:spread --list",
      "kaabalah tarot:spread --spread-id=celtic-cross --json",
      "kaabalah tarot:spread --spread-id=event-reading --inquirer-gender=woman --json",
      "kaabalah tarot:spread --input-json=- --json --compact < cards.json",
    ],
  },
  {
    name: "ifa",
    description: "Calculate Odu from a date",
    args: [{ name: "date", type: "date", required: true, description: "Date in YYYY-MM-DD format" }],
    flags: [],
    examples: ["kaabalah ifa 1990-01-15"],
  },
  {
    name: "tree",
    description: "Show Tree of Life structure with nodes and first-class correspondence edges",
    args: [],
    flags: [],
    examples: ["kaabalah tree --json --compact", "kaabalah tree --json --fields=nodes"],
  },
  {
    name: "tree:node",
    description: "Look up a node and all its correspondences",
    args: [{ name: "id", type: "string", required: true, description: "Node ID (e.g. path:1, sphere:Kether, tarotArkAnnu:The Magician)" }],
    flags: [
      { name: "type", type: "string", description: "Filter related nodes by type (e.g. hebrewLetter, planet, tarotArkAnnu)" },
      { name: "depth", type: "number", default: 1, description: "Traversal depth (default: 1)" },
    ],
    examples: [
      "kaabalah tree:node path:1 --json",
      "kaabalah tree:node sphere:Kether --type=tarotArkAnnu --json",
      'kaabalah tree:node "tarotArkAnnu:The Magician" --json',
      "kaabalah tree:node path:1 --depth=2 --json",
    ],
  },
  {
    name: "tree:find",
    description: "Find tree nodes by ID, name, or type",
    args: [{ name: "query", type: "string", required: false, description: "Search string matched against node IDs and names" }],
    flags: [
      { name: "type", type: "string", description: "Filter matches by node type (e.g. sphere, tarotArkAnnu, planet)" },
      { name: "limit", type: "number", default: 20, description: "Maximum matches to return (default: 20)" },
    ],
    examples: [
      'kaabalah tree:find magician --json',
      'kaabalah tree:find --type=planet --json',
      'kaabalah tree:find kether --type=sphere --json --compact',
    ],
  },
  {
    name: "tree:types",
    description: "List all node types and their counts",
    args: [],
    flags: [],
    examples: ["kaabalah tree:types --json"],
  },
  {
    name: "tree:layout",
    description: "Return the canonical Tree of Life layout coordinates for overlays and rendering",
    args: [],
    flags: [
      { name: "system", type: "string", default: "kaabalah", description: "Tree system: kaabalah, hermetic-qabalah, lurianic-kabbalah" },
      { name: "units", type: "string", default: "both", description: "Coordinate space: percentages, viewBoxUnits, or both" },
      { name: "render-model", type: "boolean", default: false, description: "Return activation-aware render model geometry instead of the basic layout" },
      { name: "activations", type: "string", description: "Path to activation JSON array or object with an activations array" },
      { name: "palette", type: "string", default: "color", description: 'Render-model palette metadata: "color" or "monochrome"' },
      { name: "daath-layer", type: "string", default: "front", description: 'Render-model Daath layer: "front" or "back"' },
      { name: "viewbox-width", type: "number", description: "Override render-model viewBox width" },
      { name: "viewbox-height", type: "number", description: "Override render-model viewBox height" },
      { name: "viewbox-min-x", type: "number", default: 0, description: "Override render-model viewBox min-x" },
      { name: "viewbox-min-y", type: "number", default: 0, description: "Override render-model viewBox min-y" },
    ],
    examples: [
      "kaabalah tree:layout --json --compact",
      "kaabalah tree:layout --system=hermetic-qabalah --units=percentages --json",
      "kaabalah tree:layout --render-model --activations=activations.json --json --compact",
    ],
  },
  {
    name: "tree:topology",
    description: "Return the structural Tree of Life topology, paths, and named routes",
    args: [],
    flags: [
      { name: "system", type: "string", default: "kaabalah", description: "Tree system: kaabalah, hermetic-qabalah, lurianic-kabbalah" },
      { name: "route", type: "string", default: "all", description: "Route filter: all, lightning, or serpent" },
    ],
    examples: [
      "kaabalah tree:topology --json --compact",
      "kaabalah tree:topology --route=lightning --json --compact",
      "kaabalah tree:topology --system=lurianic-kabbalah --route=lightning --json --compact",
    ],
  },
  {
    name: "tree:svg",
    description: "Generate a structural Tree of Life SVG from the canonical library renderer",
    args: [],
    flags: [
      { name: "system", type: "string", default: "kaabalah", description: "Tree system to render: only kaabalah has an SVG renderer (other systems exit UNSUPPORTED_SYSTEM)" },
      { name: "width", type: "string", description: 'SVG width attribute (e.g. 1110mm, 800, 100%)' },
      { name: "height", type: "string", description: 'SVG height attribute (e.g. 2220mm, 600, 100%)' },
      { name: "background", type: "string", default: "white", description: 'Background fill color, or "transparent"' },
      { name: "palette", type: "string", default: "color", description: 'Palette: "color" or "monochrome"' },
      { name: "daath-layer", type: "string", default: "front", description: 'Render Daath in front of or behind the paths: "front" or "back"' },
      { name: "activations", type: "string", description: "Path to activation JSON array or object with an activations array" },
      { name: "output", type: "string", description: "Write the SVG to a file instead of stdout" },
      { name: "viewbox-width", type: "number", description: "Override SVG viewBox width" },
      { name: "viewbox-height", type: "number", description: "Override SVG viewBox height" },
      { name: "viewbox-min-x", type: "number", default: 0, description: "Override SVG viewBox min-x" },
      { name: "viewbox-min-y", type: "number", default: 0, description: "Override SVG viewBox min-y" },
    ],
    examples: [
      "kaabalah tree:svg --json --compact --fields=svg",
      "kaabalah tree:svg --background=transparent --palette=monochrome --output=tree.svg --json",
      "kaabalah tree:svg --background=transparent --daath-layer=back --json --compact",
      "kaabalah tree:svg --background=transparent --activations=activations.json --json --compact --fields=svg",
    ],
  },
  {
    name: "tree:ascii",
    description: "Render a lightweight ASCII Tree of Life preview from the canonical layout",
    args: [],
    flags: [
      { name: "system", type: "string", default: "kaabalah", description: "Tree system: kaabalah, hermetic-qabalah, lurianic-kabbalah" },
      { name: "columns", type: "number", default: 61, description: "ASCII canvas width in characters (minimum 21)" },
      { name: "rows", type: "number", default: 31, description: "ASCII canvas height in lines (minimum 11)" },
    ],
    examples: [
      "kaabalah tree:ascii --no-json",
      "kaabalah tree:ascii --columns=41 --rows=21 --json --compact",
    ],
  },
  {
    name: "astrology",
    description: "Calculate birth chart using Swiss Ephemeris",
    args: [
      { name: "date", type: "date", required: true, description: "Birth date in YYYY-MM-DD format" },
      { name: "time", type: "string", required: false, description: "Birth time in HH:MM format (default: 12:00)" },
    ],
    flags: [
      { name: "lat", type: "number", description: "Latitude (-90 to 90)" },
      { name: "lon", type: "number", description: "Longitude (-180 to 180)" },
      { name: "location", type: "string", description: LOCATION_DESCRIPTION },
      { name: "house-system", type: "string", default: "placidus", description: "House system: placidus, koch, porphyrius, regiomontanus, campanus, equal, whole-sign, meridian, morinus, krusinski, alcabitius" },
      { name: "timezone", type: "string", description: "IANA timezone string (e.g. America/New_York). Auto-resolved from coordinates if omitted" },
      { name: "max-orb", type: "number", description: "Post-filter: drop already-generated default aspects with an orb above this value (it cannot add contacts the default orbs omitted; use --orb-profile for that)" },
      { name: "aspect-types", type: "string", description: "Comma-separated aspect names, or 'major' for conjunction,sextile,square,trine,opposition (unknown names are INVALID_ARGUMENT)" },
      { name: "wasm-path", type: "string", description: "Override the Swiss Ephemeris WASM runtime path" },
      { name: "ephe-path", type: "string", description: "Override the ephemeris data directory path" },
      STRICT_EPHEMERIS_FLAG,
      ...POLICY_FLAGS,
      { name: "house-systems", type: "string", description: "Comma-separated house systems computed from one ephemeris pass (adds a houseSystems result)" },
      { name: "quality", type: "string", description: "Input quality: recorded, rectified (need a time), untimed (no time: placeholder noon positions, Moon sign range, no angles/houses/lots) or partial (YYYY, YYYY-MM or YYYY-MM-DD: no chart is invented)" },
      { name: "exclude-rectified-angles", type: "boolean", default: false, description: "With --quality=rectified, drop angles from the analysis point set" },
      { name: "local-mean-time", type: "boolean", default: false, description: "Read the wall-clock time as local mean time of the longitude (pre-standard-time records)" },
      { name: "place-role", type: "string", description: "Role of the place in the provenance: birthplace, residence, event or unknown" },
      TABLE_FORMAT_FLAG,
    ],
    examples: [
      "kaabalah astrology 1990-01-15 14:30 --lat=40.7128 --lon=-74.006",
      "kaabalah astrology 1990-01-15 14:30 --lat=40.7128 --lon=-74.006 --orb-profile=ptolemaic-plus-quincunx --points=sun,moon,asc --json --compact --fields=policyAspects.counts",
      "kaabalah astrology 1990-01-15 --quality=untimed --lat=40.7128 --lon=-74.006 --json --compact --fields=status,moonDayRange.signs",
      "kaabalah astrology 1990-01-15 14:30 --lat=40.7128 --lon=-74.006 --house-systems=placidus,whole-sign --json --compact --fields=houseSystems.systems",
      'kaabalah astrology 1990-01-15 14:30 --location="New York, USA"',
      "kaabalah astrology 1990-01-15 --lat=40.7128 --lon=-74.006 --json",
    ],
  },
  {
    name: "astrology:wheel",
    description: "Render a birth chart as an astrology wheel SVG",
    args: [
      { name: "date", type: "date", required: true, description: "Birth date in YYYY-MM-DD format" },
      { name: "time", type: "string", required: false, description: "Birth time in HH:MM format (default: 12:00)" },
    ],
    flags: [
      { name: "lat", type: "number", description: "Latitude (-90 to 90)" },
      { name: "lon", type: "number", description: "Longitude (-180 to 180)" },
      { name: "location", type: "string", description: LOCATION_DESCRIPTION },
      { name: "house-system", type: "string", default: "placidus", description: "House system: placidus, koch, porphyrius, regiomontanus, campanus, equal, whole-sign, meridian, morinus, krusinski, alcabitius" },
      { name: "timezone", type: "string", description: "IANA timezone string (e.g. America/New_York). Auto-resolved from coordinates if omitted" },
      { name: "max-orb", type: "number", description: "Maximum orb in degrees to include in rendered aspect lines" },
      { name: "aspect-types", type: "string", description: "Comma-separated aspect names, or 'major' for conjunction,sextile,square,trine,opposition" },
      { name: "width", type: "string", description: 'SVG width attribute (e.g. 600, 100%, 180mm)' },
      { name: "height", type: "string", description: 'SVG height attribute (e.g. 600, 100%, 180mm)' },
      { name: "background", type: "string", default: "transparent", description: 'Background fill color, or "transparent"' },
      { name: "palette", type: "string", default: "default", description: 'Palette: "default" or "monochrome"' },
      { name: "title", type: "string", description: "Accessible SVG title and aria-label" },
      { name: "padding", type: "number", description: "Override wheel padding in viewBox units" },
      { name: "exclude-bodies", type: "string", description: "Comma-separated planet/point names to omit from points and aspect lines" },
      { name: "no-zodiac", type: "boolean", default: false, description: "Hide zodiac segments, glyphs, and ticks" },
      { name: "no-houses", type: "boolean", default: false, description: "Hide house cusps, labels, and angle markers" },
      { name: "no-points", type: "boolean", default: false, description: "Hide birth planets, nodes, and vertex" },
      { name: "no-aspects", type: "boolean", default: false, description: "Hide aspect lines" },
      { name: "output", type: "string", description: "Write the SVG to a file instead of stdout" },
      { name: "viewbox-width", type: "number", description: "Override SVG viewBox width" },
      { name: "viewbox-height", type: "number", description: "Override SVG viewBox height" },
      { name: "viewbox-min-x", type: "number", default: 0, description: "Override SVG viewBox min-x" },
      { name: "viewbox-min-y", type: "number", default: 0, description: "Override SVG viewBox min-y" },
      { name: "wasm-path", type: "string", description: "Override the Swiss Ephemeris WASM runtime path" },
      { name: "ephe-path", type: "string", description: "Override the ephemeris data directory path" },
      STRICT_EPHEMERIS_FLAG,
    ],
    examples: [
      "kaabalah astrology:wheel 1990-01-15 14:30 --lat=40.7128 --lon=-74.006 --json --compact --fields=svg",
      "kaabalah astrology:wheel 1990-01-15 14:30 --lat=40.7128 --lon=-74.006 --background=transparent --output=chart.svg --json",
      "kaabalah astrology:wheel --input-json=- --json --compact --fields=svg < chart-wheel.json",
    ],
  },
  {
    name: "astrology:synastry",
    description: "Calculate synastry (cross-chart aspects) between two birth charts",
    args: [],
    flags: [
      { name: "house-system", type: "string", default: "placidus", description: "House system for both charts" },
      { name: "timezone", type: "string", description: "Default timezone for both charts when omitted in chartA/chartB" },
      { name: "max-orb", type: "number", description: "Maximum orb in degrees to include in the returned aspect arrays" },
      { name: "aspect-types", type: "string", description: "Comma-separated aspect names, or 'major' for conjunction,sextile,square,trine,opposition" },
      { name: "wasm-path", type: "string", description: "Override the Swiss Ephemeris WASM runtime path" },
      { name: "ephe-path", type: "string", description: "Override the ephemeris data directory path" },
      STRICT_EPHEMERIS_FLAG,
    ],
    examples: [
      "kaabalah astrology:synastry --input-json=- --json --compact < synastry.json",
    ],
  },
  {
    name: "astrology:composite",
    description: "Calculate midpoint composite chart from two birth charts",
    args: [],
    flags: [
      { name: "house-system", type: "string", default: "placidus", description: "House system for both charts" },
      { name: "timezone", type: "string", description: "Default timezone for both charts when omitted in chartA/chartB" },
      { name: "max-orb", type: "number", description: "Maximum orb in degrees to include in the returned aspect arrays" },
      { name: "aspect-types", type: "string", description: "Comma-separated aspect names, or 'major' for conjunction,sextile,square,trine,opposition" },
      { name: "wasm-path", type: "string", description: "Override the Swiss Ephemeris WASM runtime path" },
      { name: "ephe-path", type: "string", description: "Override the ephemeris data directory path" },
      STRICT_EPHEMERIS_FLAG,
    ],
    examples: [
      "kaabalah astrology:composite --input-json=- --json --compact < composite.json",
    ],
  },
  {
    name: "astrology:transits",
    description: "Calculate transit aspects to a natal chart",
    args: [
      { name: "date", type: "date", required: true, description: "Natal birth date in YYYY-MM-DD format" },
      { name: "time", type: "string", required: false, description: "Natal birth time in HH:MM format (default: 12:00)" },
    ],
    flags: [
      { name: "lat", type: "number", description: "Natal latitude (-90 to 90)" },
      { name: "lon", type: "number", description: "Natal longitude (-180 to 180)" },
      { name: "location", type: "string", description: "Natal location for geocoding (requires GOOGLE_MAPS_API_KEY or KAABALAH_GOOGLE_MAPS_API_KEY)" },
      { name: "house-system", type: "string", default: "placidus", description: "House system" },
      { name: "timezone", type: "string", description: "Natal IANA timezone (auto-resolved if omitted)" },
      { name: "transit-date", type: "string", description: "Transit date YYYY-MM-DD (default: today)" },
      { name: "transit-time", type: "string", description: "Transit time HH:MM (default: 12:00)" },
      { name: "transit-lat", type: "number", description: "Transit location latitude (default: natal lat)" },
      { name: "transit-lon", type: "number", description: "Transit location longitude (default: natal lon)" },
      { name: "transit-timezone", type: "string", description: "Transit IANA timezone (default: natal timezone)" },
      { name: "max-orb", type: "number", description: "Maximum orb in degrees to include" },
      { name: "aspects", type: "string", description: "Comma-separated aspect names, or 'major' for conjunction,sextile,square,trine,opposition" },
      { name: "aspect-types", type: "string", description: "Alias for --aspects" },
      { name: "transit-planets", type: "string", description: "Comma-separated transit planet names to include" },
      { name: "natal-planets", type: "string", description: "Comma-separated natal planet/point names to include" },
      { name: "from", type: "string", description: "Range start date YYYY-MM-DD (enables date range mode)" },
      { name: "to", type: "string", description: "Range end date YYYY-MM-DD (requires --from)" },
      { name: "step-days", type: "number", description: "Step size in days for range scan (default: 1)" },
      { name: "closest-approaches", type: "boolean", default: false, description: "Range mode: also report stationary near-misses that never reach exactness (never labelled exact)" },
      ...POLICY_FLAGS,
      { name: "wasm-path", type: "string", description: "Override the Swiss Ephemeris WASM runtime path" },
      { name: "ephe-path", type: "string", description: "Override the ephemeris data directory path" },
      STRICT_EPHEMERIS_FLAG,
    ],
    examples: [
      "kaabalah astrology:transits 1990-06-15 14:30 --lat=48.856 --lon=2.352 --transit-date=2026-03-17 --json --compact",
      "kaabalah astrology:transits 1990-01-15 14:30 --lat=40.71 --lon=-74 --from=2026-03-01 --to=2026-04-01 --json",
      "kaabalah astrology:transits 1990-01-15 --lat=40.71 --lon=-74 --aspects=major --transit-planets=saturn,pluto --json",
      "kaabalah astrology:transits 1990-06-15 14:30 --lat=48.856 --lon=2.352 --transit-date=2026-03-17 --orb-profile=ptolemaic-plus-quincunx --json --compact --fields=policyAspects.counts",
      "kaabalah astrology:transits 1990-06-15 14:30 --lat=48.856 --lon=2.352 --from=2026-03-01 --to=2026-04-01 --closest-approaches --json --compact --fields=closestApproaches",
    ],
  },
  {
    name: "astrology:solar-return",
    description: "Calculate Solar Return chart for a given year",
    args: [
      { name: "date", type: "date", required: true, description: "Natal birth date in YYYY-MM-DD format" },
      { name: "time", type: "string", required: false, description: "Natal birth time in HH:MM format (default: 12:00)" },
    ],
    flags: [
      { name: "lat", type: "number", description: "Natal latitude (-90 to 90)" },
      { name: "lon", type: "number", description: "Natal longitude (-180 to 180)" },
      { name: "location", type: "string", description: "Natal location for geocoding (requires GOOGLE_MAPS_API_KEY or KAABALAH_GOOGLE_MAPS_API_KEY)" },
      { name: "house-system", type: "string", default: "placidus", description: "House system for natal chart" },
      { name: "timezone", type: "string", description: "Natal IANA timezone (auto-resolved if omitted)" },
      { name: "year", type: "number", description: "Solar return year (default: current year)" },
      { name: "sr-lat", type: "number", description: "Solar return location latitude (default: natal lat)" },
      { name: "sr-lon", type: "number", description: "Solar return location longitude (default: natal lon)" },
      { name: "sr-location", type: "string", description: "Solar return location for geocoding (requires GOOGLE_MAPS_API_KEY or KAABALAH_GOOGLE_MAPS_API_KEY)" },
      { name: "sr-house-system", type: "string", description: "House system for solar return chart (default: natal house system)" },
      { name: "max-orb", type: "number", description: "Maximum orb in degrees to include in natal and solar return aspect arrays" },
      { name: "aspect-types", type: "string", description: "Comma-separated aspect names, or 'major' for conjunction,sextile,square,trine,opposition" },
      { name: "wasm-path", type: "string", description: "Override the Swiss Ephemeris WASM runtime path" },
      { name: "ephe-path", type: "string", description: "Override the ephemeris data directory path" },
      STRICT_EPHEMERIS_FLAG,
    ],
    examples: [
      "kaabalah astrology:solar-return 1990-06-15 14:30 --lat=48.856 --lon=2.352 --year=2025 --json --compact",
      "kaabalah astrology:solar-return 1990-01-15 14:30 --lat=40.71 --lon=-74 --year=2026 --sr-lat=34.05 --sr-lon=-118.24 --json",
    ],
  },
  {
    name: "astrology:profections",
    description: "Calculate annual profection for a given year",
    args: [
      { name: "date", type: "date", required: true, description: "Natal birth date in YYYY-MM-DD format" },
      { name: "time", type: "string", required: false, description: "Natal birth time in HH:MM format (default: 12:00)" },
    ],
    flags: [
      { name: "lat", type: "number", description: "Natal latitude (-90 to 90)" },
      { name: "lon", type: "number", description: "Natal longitude (-180 to 180)" },
      { name: "location", type: "string", description: "Natal location for geocoding (requires GOOGLE_MAPS_API_KEY or KAABALAH_GOOGLE_MAPS_API_KEY)" },
      { name: "timezone", type: "string", description: "Natal IANA timezone (auto-resolved if omitted)" },
      { name: "year", type: "number", description: "Target year (default: current year)" },
      { name: "wasm-path", type: "string", description: "Override the Swiss Ephemeris WASM runtime path" },
      { name: "ephe-path", type: "string", description: "Override the ephemeris data directory path" },
      STRICT_EPHEMERIS_FLAG,
    ],
    examples: [
      "kaabalah astrology:profections 1990-06-15 14:30 --lat=48.856 --lon=2.352 --year=2026 --json --compact",
    ],
  },
  {
    name: "astrology:profections:monthly",
    description: "Calculate monthly profections for a given year",
    args: [
      { name: "date", type: "date", required: true, description: "Natal birth date in YYYY-MM-DD format" },
      { name: "time", type: "string", required: false, description: "Natal birth time in HH:MM format (default: 12:00)" },
    ],
    flags: [
      { name: "lat", type: "number", description: "Natal latitude (-90 to 90)" },
      { name: "lon", type: "number", description: "Natal longitude (-180 to 180)" },
      { name: "location", type: "string", description: "Natal location for geocoding (requires GOOGLE_MAPS_API_KEY or KAABALAH_GOOGLE_MAPS_API_KEY)" },
      { name: "timezone", type: "string", description: "Natal IANA timezone (auto-resolved if omitted)" },
      { name: "year", type: "number", description: "Target year (default: current year)" },
      { name: "wasm-path", type: "string", description: "Override the Swiss Ephemeris WASM runtime path" },
      { name: "ephe-path", type: "string", description: "Override the ephemeris data directory path" },
      STRICT_EPHEMERIS_FLAG,
    ],
    examples: [
      "kaabalah astrology:profections:monthly 1990-06-15 14:30 --lat=48.856 --lon=2.352 --year=2026 --json --compact",
    ],
  },
  {
    name: "astrology:firdaria",
    description: "Calculate firdaria planetary periods",
    args: [
      { name: "date", type: "date", required: true, description: "Natal birth date in YYYY-MM-DD format" },
      { name: "time", type: "string", required: false, description: "Natal birth time in HH:MM format (default: 12:00)" },
    ],
    flags: [
      { name: "lat", type: "number", description: "Natal latitude (-90 to 90)" },
      { name: "lon", type: "number", description: "Natal longitude (-180 to 180)" },
      { name: "location", type: "string", description: "Natal location for geocoding (requires GOOGLE_MAPS_API_KEY or KAABALAH_GOOGLE_MAPS_API_KEY)" },
      { name: "timezone", type: "string", description: "Natal IANA timezone (auto-resolved if omitted)" },
      { name: "sect", type: "string", description: "Override sect: 'diurnal' or 'nocturnal' (default: auto-detect from chart)" },
      { name: "target-date", type: "string", description: "Target date YYYY-MM-DD (default: today)" },
      { name: "wasm-path", type: "string", description: "Override the Swiss Ephemeris WASM runtime path" },
      { name: "ephe-path", type: "string", description: "Override the ephemeris data directory path" },
      STRICT_EPHEMERIS_FLAG,
    ],
    examples: [
      "kaabalah astrology:firdaria 1990-06-15 14:30 --lat=48.856 --lon=2.352 --json --compact",
      "kaabalah astrology:firdaria 1990-06-15 14:30 --lat=48.856 --lon=2.352 --target-date=2030-01-01 --json",
    ],
  },
  {
    name: "astrology:decans",
    description: "Look up the decan (face) for a zodiacal longitude",
    args: [
      { name: "longitude", type: "number", required: true, description: "Ecliptic longitude in degrees (0-360)" },
    ],
    flags: [],
    examples: [
      "kaabalah astrology:decans 15 --json --compact",
      "kaabalah astrology:decans 270.5 --json",
    ],
  },
  {
    name: "astrology:describe",
    description: "Look up a bilingual astrology description by kind and keys",
    args: [
      { name: "kind", type: "string", required: true, description: "Description kind: planet, sign, house, element, modality, polarity, angle, aspect, point, sect, node, dignity, retrograde, vertex-contact, planet-sign, planet-house, angle-sign, cusp-sign, point-sign, point-house, node-sign, node-house, retrograde-sign, retrograde-house, sun-ascendant, aspect-pair, decan, degree, degree-at" },
      { name: "keys", type: "string", required: false, description: "Keys for the kind, in order (for example: mars Leo; 2 Taurus; trine sun moon; 18.5)" },
    ],
    flags: [],
    examples: [
      "kaabalah astrology:describe planet-sign mars Leo --json --compact --fields=text",
      "kaabalah astrology:describe aspect-pair trine sun moon --language pt-BR --json",
      "kaabalah astrology:describe sun-ascendant Taurus Aries --json --compact",
      "kaabalah astrology:describe degree-at 18.5 --json --compact --fields=text",
      "kaabalah astrology:describe decan --json --compact",
    ],
  },
  {
    name: "astrology:dodecatemoria",
    description: "Look up the dodecatemoria (12th part) for a zodiacal longitude",
    args: [
      { name: "longitude", type: "number", required: true, description: "Ecliptic longitude in degrees (0-360)" },
    ],
    flags: [],
    examples: [
      "kaabalah astrology:dodecatemoria 5 --json --compact",
      "kaabalah astrology:dodecatemoria 227.5 --json",
    ],
  },
  {
    name: "astrology:astrocartography",
    description: "Generate Astro*Carto*Graphy map (MC/IC/AC/DC lines for all planets)",
    args: [
      { name: "date", type: "date", required: true, description: "Natal birth date in YYYY-MM-DD format" },
      { name: "time", type: "string", required: false, description: "Natal birth time in HH:MM format (default: 12:00)" },
    ],
    flags: [
      { name: "lat", type: "number", description: "Natal latitude (-90 to 90)" },
      { name: "lon", type: "number", description: "Natal longitude (-180 to 180)" },
      { name: "location", type: "string", description: "Natal location for geocoding (requires GOOGLE_MAPS_API_KEY or KAABALAH_GOOGLE_MAPS_API_KEY)" },
      { name: "timezone", type: "string", description: "Natal IANA timezone (auto-resolved if omitted)" },
      { name: "latitude-step", type: "number", description: "Degrees between latitude samples for AC/DC lines (default: 1)" },
      { name: "latitude-range", type: "number", description: "Maximum latitude to sweep (default: 66.5)" },
      { name: "house-system", type: "string", description: "House system (default: placidus)" },
      { name: "wasm-path", type: "string", description: "Override the Swiss Ephemeris WASM runtime path" },
      { name: "ephe-path", type: "string", description: "Override the ephemeris data directory path" },
      STRICT_EPHEMERIS_FLAG,
    ],
    examples: [
      "kaabalah astrology:astrocartography 1990-06-15 14:30 --lat=48.856 --lon=2.352 --json --compact",
      "kaabalah astrology:astrocartography 1990-01-15 14:30 --lat=40.71 --lon=-74 --latitude-step=5 --json",
    ],
  },
  {
    name: "astrology:astrocartography:query",
    description: "Query a location for nearby astrocartography planetary lines and parans",
    args: [
      { name: "date", type: "date", required: true, description: "Natal birth date in YYYY-MM-DD format" },
      { name: "time", type: "string", required: false, description: "Natal birth time in HH:MM format (default: 12:00)" },
    ],
    flags: [
      { name: "lat", type: "number", description: "Natal latitude (-90 to 90)" },
      { name: "lon", type: "number", description: "Natal longitude (-180 to 180)" },
      { name: "location", type: "string", description: "Natal location for geocoding (requires GOOGLE_MAPS_API_KEY or KAABALAH_GOOGLE_MAPS_API_KEY)" },
      { name: "timezone", type: "string", description: "Natal IANA timezone (auto-resolved if omitted)" },
      { name: "query-lat", type: "number", description: "Query latitude (-90 to 90)" },
      { name: "query-lon", type: "number", description: "Query longitude (-180 to 180)" },
      { name: "orb", type: "number", description: "Maximum distance in degrees to consider a line active (default: 2)" },
      { name: "paran-orb", type: "number", description: "Paran crossing orb in degrees (default: 1)" },
      { name: "house-system", type: "string", description: "House system (default: placidus)" },
      { name: "wasm-path", type: "string", description: "Override the Swiss Ephemeris WASM runtime path" },
      { name: "ephe-path", type: "string", description: "Override the ephemeris data directory path" },
      STRICT_EPHEMERIS_FLAG,
    ],
    examples: [
      "kaabalah astrology:astrocartography:query 1990-06-15 14:30 --lat=48.856 --lon=2.352 --query-lat=51.5 --query-lon=-0.12 --orb=3 --json --compact",
      "kaabalah astrology:astrocartography:query --input-json='{\"natal\":{\"date\":\"1990-06-15\",\"time\":\"14:30\",\"lat\":48.856,\"lon\":2.352},\"queryLat\":51.5,\"queryLon\":-0.12,\"orb\":3}' --json --compact",
    ],
  },
  {
    name: "astrology:davison",
    description: "Davison chart: a real chart cast for the UTC time midpoint and geographic midpoint of two births",
    args: [],
    flags: [
      { name: "house-system", type: "string", default: "placidus", description: "House system for both charts and the Davison chart" },
      { name: "timezone", type: "string", description: "Default timezone for both charts when omitted in chartA/chartB" },
      { name: "midpoint-convention", type: "string", default: "arithmetic-shorter-arc", description: "Geographic midpoint: arithmetic-shorter-arc or great-circle" },
      ...RUNTIME_FLAGS,
    ],
    examples: ["kaabalah astrology:davison --input-json=- --json --compact < davison.json"],
  },
  {
    name: "astrology:overlays",
    description: "House overlays in both directions: A's points in B's houses and B's points in A's houses",
    args: [],
    flags: [
      { name: "house-system", type: "string", default: "placidus", description: "House system for both charts" },
      { name: "timezone", type: "string", description: "Default timezone for both charts when omitted in chartA/chartB" },
      { name: "points", type: "string", description: "Comma-separated sending points (sun, moon, ..., ascendant, mc, descendant, ic); unknown names are INVALID_ARGUMENT" },
      { name: "no-angles", type: "boolean", default: false, description: "Do not place the sending chart's ascendant/mc/descendant/ic" },
      ...RUNTIME_FLAGS,
    ],
    examples: ["kaabalah astrology:overlays --input-json=- --json --compact < overlays.json"],
  },
  {
    name: "astrology:progressions",
    description: "Secondary progressions (a day for a year) with a declared time key and progressed-angle conventions",
    args: NATAL_ARGS,
    flags: [
      ...NATAL_FLAGS,
      { name: "target-date", type: "string", description: "Target date YYYY-MM-DD at 12:00 UTC (default: today UTC; pass it for reproducible output)" },
      { name: "target-time", type: "string", description: "Target UTC time HH:MM (default 12:00)" },
      { name: "year-length", type: "string", default: "julian", description: "Time-key year: julian (365.25 d), tropical (365.2422 d), solar-return or a positive number of days" },
      { name: "angle-conventions", type: "string", description: "Comma-separated progressed-angle conventions: quotidian, solar-arc, naibod (default: all three)" },
      ...RUNTIME_FLAGS,
    ],
    examples: ["kaabalah astrology:progressions 1990-06-15 14:30 --lat=48.856 --lon=2.352 --target-date=2026-03-01 --json --compact --fields=ageYears,solarArcDegrees,method.timeKey"],
  },
  {
    name: "astrology:solar-arc",
    description: "Solar-arc directions: one arc added uniformly to an explicit set of natal points",
    args: NATAL_ARGS,
    flags: [
      ...NATAL_FLAGS,
      { name: "target-date", type: "string", description: "Target date YYYY-MM-DD at 12:00 UTC (default: today UTC; pass it for reproducible output)" },
      { name: "target-time", type: "string", description: "Target UTC time HH:MM (default 12:00)" },
      { name: "year-length", type: "string", default: "julian", description: "Time-key year: julian, tropical, solar-return or a positive number of days" },
      { name: "arc-kind", type: "string", default: "true", description: "Arc: true (progressed Sun minus natal Sun) or naibod (0.985647 degrees per year)" },
      { name: "targets", type: "string", description: "Comma-separated natal points to direct (planet keys plus ascendant, mc, descendant, ic; default: all); unknown keys are INVALID_ARGUMENT" },
      ...RUNTIME_FLAGS,
    ],
    examples: ["kaabalah astrology:solar-arc 1990-06-15 14:30 --lat=48.856 --lon=2.352 --target-date=2026-03-01 --targets=sun,moon,ascendant --json --compact --fields=arcDegrees,method.targetSet"],
  },
  {
    name: "astrology:returns",
    description: "Return and opposition passes (Saturn, Jupiter, Uranus opposition, nodal, optional solar) between two dates, UTC window",
    args: NATAL_ARGS,
    flags: [
      ...NATAL_FLAGS,
      { name: "from", type: "string", description: "Inclusive window start YYYY-MM-DD (00:00 UTC, required)" },
      { name: "to", type: "string", description: "Exclusive window end YYYY-MM-DD (00:00 UTC, required)" },
      { name: "kinds", type: "string", description: "Comma-separated kinds: saturn-return, jupiter-return, uranus-opposition, mean-nodal-return, true-nodal-return, solar-return (default: all but solar-return)" },
      { name: "step-days", type: "number", description: "Scan step in days (default per kind, max 2)" },
      ...RUNTIME_FLAGS,
    ],
    examples: ["kaabalah astrology:returns 1960-06-15 14:30 --lat=48.856 --lon=2.352 --from=1988-01-01 --to=1992-01-01 --kinds=saturn-return --json --compact --fields=entries"],
  },
  {
    name: "astrology:profections:timeline",
    description: "Annual profection years for an age range or date range (whole-sign from the natal ascendant sign)",
    args: NATAL_ARGS,
    flags: [
      ...NATAL_FLAGS,
      { name: "from-age", type: "number", description: "First age (use with --to-age)" },
      { name: "to-age", type: "number", description: "Last age, inclusive" },
      { name: "from", type: "string", description: "Range start YYYY-MM-DD (alternative to ages)" },
      { name: "to", type: "string", description: "Range end YYYY-MM-DD, inclusive of the year containing it" },
      ...RUNTIME_FLAGS,
    ],
    examples: ["kaabalah astrology:profections:timeline 1990-06-15 14:30 --lat=48.856 --lon=2.352 --from-age=30 --to-age=35 --json --compact --fields=entries"],
  },
  {
    name: "astrology:firdaria:timeline",
    description: "Firdaria major and sub periods intersecting a bounded window, with nominal and clipped ends",
    args: NATAL_ARGS,
    flags: [
      ...NATAL_FLAGS,
      { name: "from", type: "string", description: "Window start YYYY-MM-DD (default: birth)" },
      { name: "to", type: "string", description: "Exclusive window end YYYY-MM-DD (required)" },
      { name: "sect", type: "string", description: "Override sect: diurnal or nocturnal (default: from the chart)" },
      { name: "node-sub-period-start", type: "string", description: "Node sub-period start: jupiter-saturn or sun-mars" },
      { name: "no-sub-periods", type: "boolean", default: false, description: "Omit sub-periods" },
      ...RUNTIME_FLAGS,
    ],
    examples: ["kaabalah astrology:firdaria:timeline 1990-06-15 14:30 --lat=48.856 --lon=2.352 --to=2030-01-01 --no-sub-periods --json --compact --fields=entries"],
  },
  {
    name: "astrology:jyotish",
    description: "Jyotish chart: Dhruva and Lahiri nakshatras, chara karakas, Vimshottari and Yogini dashas",
    args: NATAL_ARGS,
    flags: [
      ...NATAL_FLAGS,
      { name: "frame", type: "string", default: "dhruva", description: "Nakshatra frame for karakas and dashas: dhruva or lahiri" },
      { name: "node", type: "string", default: "mean", description: "Rahu/Ketu node convention: mean or true" },
      { name: "year-length-days", type: "number", description: "Dasha year length in days (default 365.2422 for dhruva, 365.25 for lahiri)" },
      { name: "karaka-scheme", type: "string", default: "7", description: "Chara karaka scheme: 7 or 8" },
      { name: "untimed", type: "boolean", default: false, description: "Birth time unknown: no Moon, lagna, karakas or dashas" },
      { name: "as-of", type: "string", description: "Add the active maha/antar at this date (YYYY-MM-DD, 12:00 UTC)" },
      { name: "through", type: "string", description: "Exclusive end of dasha generation YYYY-MM-DD (default: one full cycle)" },
      ...RUNTIME_FLAGS,
    ],
    examples: [
      "kaabalah astrology:jyotish 1990-06-15 14:30 --lat=48.856 --lon=2.352 --frame=lahiri --node=true --as-of=2026-03-01 --json --compact --fields=activeDasha",
      "kaabalah astrology:jyotish 1990-06-15 14:30 --lat=48.856 --lon=2.352 --karaka-scheme=8 --json --compact --fields=karakas",
    ],
  },
  {
    name: "astrology:collection",
    description: "Bulk collection: people, events and pair selection from a manifest; one natal chart per person, per-item errors, deterministic order",
    args: [],
    flags: [
      { name: "manifest", type: "string", description: "Manifest JSON file, or - for stdin (alternatively pass the manifest object with --input-json)" },
      { name: "pair-mode", type: "string", description: "Pair selection overriding the manifest: all, pairs (needs manifest pairs) or timed-only" },
      { name: "concurrency", type: "number", default: 4, description: "Async tasks in flight (1-64); Swiss Ephemeris calls stay synchronous, so this bounds scheduling, not CPU parallelism" },
      { name: "include-charts", type: "boolean", default: false, description: "Embed full charts in person and event records" },
      { name: "ndjson", type: "boolean", default: false, description: "Streaming mode: one JSON record per line (people, events, pairs, then a summary); a different contract from the default single JSON document" },
      ...RUNTIME_FLAGS,
    ],
    examples: [
      "kaabalah astrology:collection --manifest=people.json --json --compact --fields=summary",
      "kaabalah astrology:collection --manifest=- --pair-mode=timed-only --quiet < people.json",
      "kaabalah astrology:collection --manifest=people.json --ndjson --quiet > records.ndjson",
    ],
  },
  {
    name: "capabilities",
    description: "Machine-readable capabilities: modules, house systems, points, aspects, frames, limits, error codes, CLI commands",
    args: [],
    flags: [
      { name: "probe", type: "boolean", default: false, description: "Initialise Swiss Ephemeris and report runtime ephemeris coverage (WASM_INIT_ERROR if the assets are missing)" },
      ...RUNTIME_FLAGS,
    ],
    examples: ["kaabalah capabilities --json --compact", "kaabalah capabilities --probe --json --compact --fields=astrology.ephemeris"],
  },
  {
    name: "help",
    description: "Show help message",
    args: [{ name: "command", type: "string", required: false, description: "Command to show help for" }],
    flags: [],
    examples: ["kaabalah help", "kaabalah help --json", "kaabalah help astrology --json"],
  },
];
