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
  { name: "json", type: "boolean", default: false, description: "Output as JSON (auto-enabled when stdout is not a TTY)" },
  { name: "no-json", type: "boolean", default: false, description: "Force human-readable output even when piped" },
  { name: "compact", type: "boolean", default: false, description: "Minified JSON output (no indentation)" },
  { name: "fields", type: "string", description: "Comma-separated dot-paths to filter JSON output (e.g. --fields=a.b,c.d)" },
  { name: "input-json", type: "string", description: "JSON string, or - to read a JSON object from stdin" },
  { name: "debug", type: "boolean", default: false, description: "Emit debug logs to stderr (same effect as DEBUG=kaabalah:*)" },
  { name: "trace", type: "boolean", default: false, description: "Print stack traces for unexpected fatal errors in human-readable mode" },
];

export const COMMANDS: CommandSchema[] = [
  {
    name: "gematria",
    description: "Calculate gematria for a word/phrase",
    args: [{ name: "text", type: "string", required: true, description: "Text to calculate gematria for" }],
    flags: [
      { name: "missing", type: "boolean", default: false, description: "Show missing gematria values" },
      { name: "percentages", type: "boolean", default: false, description: "Show letter percentages" },
    ],
    examples: ['kaabalah gematria "Hello World"', "kaabalah gematria --json --compact < phrase.txt"],
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
    flags: [],
    examples: [
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
    description: "Personal cycles (year, month, periods)",
    args: [
      { name: "date", type: "date", required: true, description: "Birth date in YYYY-MM-DD format" },
      { name: "firstName", type: "string", required: false, description: "First name for personal cycles" },
    ],
    flags: [],
    examples: ["kaabalah numerology:cycles 1990-01-15", "kaabalah numerology:cycles 1990-01-15 John"],
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
    flags: [],
    examples: ["kaabalah numerology:fibonacci 1990-01-15"],
  },
  {
    name: "tarot",
    description: "Draw tarot cards (default: 3)",
    args: [{ name: "count", type: "number", required: false, description: "Number of cards to draw (1-78, default: 3)" }],
    flags: [
      { name: "inverted", type: "boolean", default: false, description: "Include inverted cards" },
      { name: "shuffle-count", type: "number", default: 7, description: "Number of times to shuffle the deck" },
    ],
    examples: ["kaabalah tarot 5 --inverted", "kaabalah tarot --json"],
  },
  {
    name: "tarot:card",
    description: "Look up a specific card by number or name",
    args: [{ name: "query", type: "string", required: true, description: "Card number (1-78) or name (e.g. 'The Chariot', 'Two of Cups')" }],
    flags: [],
    examples: ["kaabalah tarot:card 7", 'kaabalah tarot:card "The Chariot" --json', "kaabalah tarot:card chariot --json"],
  },
  {
    name: "tarot:spread",
    description: "Look up multiple tarot cards by name or number, or draw a named spread with --spread-id",
    args: [{ name: "cards", type: "string", required: false, description: "Card names or numbers, space-separated (quote multi-word names)" }],
    flags: [
      { name: "list", type: "boolean", default: false, description: "List built-in spread IDs and requirements" },
      { name: "spread-id", type: "string", description: "Draw a built-in spread by ID (e.g. quick-insight, celtic-cross, event-reading)" },
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
      { name: "system", type: "string", default: "kaabalah", description: "Tree system: kaabalah, hermetic-qabalah, lurianic-kabbalah" },
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
      { name: "location", type: "string", description: "Location string for geocoding (requires GOOGLE_MAPS_API_KEY or KAABALAH_GOOGLE_MAPS_API_KEY)" },
      { name: "house-system", type: "string", default: "placidus", description: "House system: placidus, koch, porphyrius, regiomontanus, campanus, equal, whole-sign, meridian, morinus, krusinski, alcabitius" },
      { name: "timezone", type: "string", description: "IANA timezone string (e.g. America/New_York). Auto-resolved from coordinates if omitted" },
      { name: "max-orb", type: "number", description: "Maximum orb in degrees to include in the returned aspects array" },
      { name: "aspect-types", type: "string", description: "Comma-separated aspect names, or 'major' for conjunction,sextile,square,trine,opposition" },
      { name: "wasm-path", type: "string", description: "Override the Swiss Ephemeris WASM runtime path" },
      { name: "ephe-path", type: "string", description: "Override the ephemeris data directory path" },
    ],
    examples: [
      "kaabalah astrology 1990-01-15 14:30 --lat=40.7128 --lon=-74.006",
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
      { name: "location", type: "string", description: "Location string for geocoding (requires GOOGLE_MAPS_API_KEY or KAABALAH_GOOGLE_MAPS_API_KEY)" },
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
      { name: "render-model", type: "boolean", default: false, description: "Return wheel geometry JSON instead of SVG" },
      { name: "output", type: "string", description: "Write the SVG to a file instead of stdout" },
      { name: "viewbox-width", type: "number", description: "Override SVG viewBox width" },
      { name: "viewbox-height", type: "number", description: "Override SVG viewBox height" },
      { name: "viewbox-min-x", type: "number", default: 0, description: "Override SVG viewBox min-x" },
      { name: "viewbox-min-y", type: "number", default: 0, description: "Override SVG viewBox min-y" },
      { name: "wasm-path", type: "string", description: "Override the Swiss Ephemeris WASM runtime path" },
      { name: "ephe-path", type: "string", description: "Override the ephemeris data directory path" },
    ],
    examples: [
      "kaabalah astrology:wheel 1990-01-15 14:30 --lat=40.7128 --lon=-74.006 --json --compact --fields=svg",
      "kaabalah astrology:wheel 1990-01-15 14:30 --lat=40.7128 --lon=-74.006 --background=transparent --output=chart.svg --json",
      "kaabalah astrology:wheel --input-json=- --json --compact --fields=svg < chart-wheel.json",
      "kaabalah astrology:wheel 1990-01-15 14:30 --lat=40.7128 --lon=-74.006 --render-model --json --compact",
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
      { name: "location", type: "string", description: "Natal location for geocoding (requires GOOGLE_MAPS_API_KEY)" },
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
      { name: "wasm-path", type: "string", description: "Override the Swiss Ephemeris WASM runtime path" },
      { name: "ephe-path", type: "string", description: "Override the ephemeris data directory path" },
    ],
    examples: [
      "kaabalah astrology:transits 1990-06-15 14:30 --lat=48.856 --lon=2.352 --transit-date=2026-03-17 --json --compact",
      "kaabalah astrology:transits 1990-01-15 14:30 --lat=40.71 --lon=-74 --from=2026-03-01 --to=2026-04-01 --json",
      "kaabalah astrology:transits 1990-01-15 --lat=40.71 --lon=-74 --aspects=major --transit-planets=saturn,pluto --json",
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
      { name: "location", type: "string", description: "Natal location for geocoding (requires GOOGLE_MAPS_API_KEY)" },
      { name: "house-system", type: "string", default: "placidus", description: "House system for natal chart" },
      { name: "timezone", type: "string", description: "Natal IANA timezone (auto-resolved if omitted)" },
      { name: "year", type: "number", description: "Solar return year (default: current year)" },
      { name: "sr-lat", type: "number", description: "Solar return location latitude (default: natal lat)" },
      { name: "sr-lon", type: "number", description: "Solar return location longitude (default: natal lon)" },
      { name: "sr-location", type: "string", description: "Solar return location for geocoding" },
      { name: "sr-house-system", type: "string", description: "House system for solar return chart (default: natal house system)" },
      { name: "max-orb", type: "number", description: "Maximum orb in degrees to include in natal and solar return aspect arrays" },
      { name: "aspect-types", type: "string", description: "Comma-separated aspect names, or 'major' for conjunction,sextile,square,trine,opposition" },
      { name: "wasm-path", type: "string", description: "Override the Swiss Ephemeris WASM runtime path" },
      { name: "ephe-path", type: "string", description: "Override the ephemeris data directory path" },
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
      { name: "location", type: "string", description: "Natal location for geocoding (requires GOOGLE_MAPS_API_KEY)" },
      { name: "timezone", type: "string", description: "Natal IANA timezone (auto-resolved if omitted)" },
      { name: "year", type: "number", description: "Target year (default: current year)" },
      { name: "wasm-path", type: "string", description: "Override the Swiss Ephemeris WASM runtime path" },
      { name: "ephe-path", type: "string", description: "Override the ephemeris data directory path" },
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
      { name: "location", type: "string", description: "Natal location for geocoding (requires GOOGLE_MAPS_API_KEY)" },
      { name: "timezone", type: "string", description: "Natal IANA timezone (auto-resolved if omitted)" },
      { name: "year", type: "number", description: "Target year (default: current year)" },
      { name: "wasm-path", type: "string", description: "Override the Swiss Ephemeris WASM runtime path" },
      { name: "ephe-path", type: "string", description: "Override the ephemeris data directory path" },
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
      { name: "location", type: "string", description: "Natal location for geocoding (requires GOOGLE_MAPS_API_KEY)" },
      { name: "timezone", type: "string", description: "Natal IANA timezone (auto-resolved if omitted)" },
      { name: "sect", type: "string", description: "Override sect: 'diurnal' or 'nocturnal' (default: auto-detect from chart)" },
      { name: "target-date", type: "string", description: "Target date YYYY-MM-DD (default: today)" },
      { name: "wasm-path", type: "string", description: "Override the Swiss Ephemeris WASM runtime path" },
      { name: "ephe-path", type: "string", description: "Override the ephemeris data directory path" },
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
      { name: "location", type: "string", description: "Natal location for geocoding (requires GOOGLE_MAPS_API_KEY)" },
      { name: "timezone", type: "string", description: "Natal IANA timezone (auto-resolved if omitted)" },
      { name: "latitude-step", type: "number", description: "Degrees between latitude samples for AC/DC lines (default: 1)" },
      { name: "latitude-range", type: "number", description: "Maximum latitude to sweep (default: 66.5)" },
      { name: "house-system", type: "string", description: "House system (default: placidus)" },
      { name: "wasm-path", type: "string", description: "Override the Swiss Ephemeris WASM runtime path" },
      { name: "ephe-path", type: "string", description: "Override the ephemeris data directory path" },
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
      { name: "location", type: "string", description: "Natal location for geocoding (requires GOOGLE_MAPS_API_KEY)" },
      { name: "timezone", type: "string", description: "Natal IANA timezone (auto-resolved if omitted)" },
      { name: "query-lat", type: "number", description: "Query latitude (-90 to 90)" },
      { name: "query-lon", type: "number", description: "Query longitude (-180 to 180)" },
      { name: "orb", type: "number", description: "Maximum distance in degrees to consider a line active (default: 2)" },
      { name: "paran-orb", type: "number", description: "Paran crossing orb in degrees (default: 1)" },
      { name: "house-system", type: "string", description: "House system (default: placidus)" },
      { name: "wasm-path", type: "string", description: "Override the Swiss Ephemeris WASM runtime path" },
      { name: "ephe-path", type: "string", description: "Override the ephemeris data directory path" },
    ],
    examples: [
      "kaabalah astrology:astrocartography:query 1990-06-15 14:30 --lat=48.856 --lon=2.352 --query-lat=51.5 --query-lon=-0.12 --orb=3 --json --compact",
      "kaabalah astrology:astrocartography:query --input-json='{\"natal\":{\"date\":\"1990-06-15\",\"time\":\"14:30\",\"lat\":48.856,\"lon\":2.352},\"queryLat\":51.5,\"queryLon\":-0.12,\"orb\":3}' --json --compact",
    ],
  },
  {
    name: "help",
    description: "Show help message",
    args: [{ name: "command", type: "string", required: false, description: "Command to show help for" }],
    flags: [],
    examples: ["kaabalah help", "kaabalah help --json", "kaabalah help astrology --json"],
  },
];
