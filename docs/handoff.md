# Handoff — CLI Agent DX Improvements + Astrology Command

**Date:** 2026-03-07
**Branch:** main (uncommitted changes)

## Goal

Add astrology birth chart command to the CLI and improve Agent DX score from ~2.5 to ~14.5 ("Agent-ready" tier) by adding structured errors, schema introspection, field filtering, input hardening, and agent knowledge packaging.

## What Was Done

All 7 phases from the implementation plan are complete:

- **Phase 1 — Astrology command:** `kaabalah astrology <date> [time] --lat/--lon` or `--location="City"` (geocoding via Google Places API New). Supports `--house-system`, `--timezone`. WASM/ephe paths resolved relative to `__dirname/../` for both local dev and published package.
- **Phase 2 — Structured errors:** `exitWithError(code, message, flags)` replaces all `console.error + process.exit`. Error codes: `INVALID_DATE`, `INVALID_ARGUMENT`, `MISSING_ARGUMENT`, `UNKNOWN_COMMAND`, `CARD_NOT_FOUND`, `INTERNAL_ERROR`, `GEOCODE_ERROR`, `WASM_INIT_ERROR`, `INVALID_JSON`. JSON errors: `{"error":true,"code":"...","message":"..."}`.
- **Phase 2 — TTY auto-detection:** Piped output auto-enables `--json`. `--no-json` overrides.
- **Phase 3 — Extended arg parsing:** `--key=value` flags. `--input-json='{"key":"val"}'` as alternative to positional args. Exposed `--max-results`, `--min-length`, `--max-length`, `--include-digraphs` for `gematria:reverse`; `--shuffle-count` for `tarot`.
- **Phase 4 — Schema registry:** `COMMANDS` array with full arg/flag metadata. `kaabalah help --json` returns full schema. `kaabalah help <cmd> --json` returns per-command schema. `--version` flag.
- **Phase 5 — Output control:** `--fields=a.b,c.d` dot-path filtering. `--compact` minified JSON. Unified `outputJson()` function.
- **Phase 6 — Input hardening:** `sanitizeInput()` strips control chars. Date range validation (0001-9999). `--max-results` capped at 10000. Text input capped at 1000 chars. Lat/lon range validation.
- **Phase 7 — Agent knowledge:** Created `AGENTS.md` with full CLI agent integration guide. Updated `CLAUDE.md` with CLI section.
- **dotenv:** Added `dotenv` dependency for `.env` loading (user preference over manual parser).

## Key Decisions

- **Places API (New) over Geocoding API:** User's Google API key had Places enabled but not Geocoding. Switched to `https://places.googleapis.com/v1/places:searchText` REST endpoint which works in Node.js without browser dependencies.
- **`@googlemaps/js-api-loader` rejected:** Browser-only library, doesn't work in Node CLI. REST endpoint is the correct approach.
- **Explicit WASM/ephe paths:** `getSwissEph()` default path resolution breaks in the bundled CLI because `?url` imports don't resolve properly in CJS. We pass explicit `path.resolve(__dirname, "../wasm/build/swisseph.node.wasm")` and `"../ephe"` which works for both local dev and npm-installed packages.
- **Dynamic `import("./astrology")`:** Astrology module is lazy-loaded only when the `astrology` command is used, avoiding WASM overhead for other commands.
- **`dotenv` over custom parser:** User explicitly requested using the `dotenv` package.
- **Help text generated from registry:** `COMMANDS` array is the single source of truth for both `--json` schema output and human-readable help.

## Known Issues / Open Items

- **Pre-existing test failure:** `src/numerology/index.test.ts > Heptad cycles > should calculate the cycles correctly` fails because test expectations are date-dependent. Not related to CLI changes.
- **Deprecated fields:** `vowelsSum`, `consonantsSum`, `synthesisSum` in reverse gematria results are deprecated but still used in human-readable output. No action needed.

## Next Steps

5. **Fix the pre-existing numerology test** that's date-dependent
6. **Consider adding `--quiet`/`--silent` flag** to suppress all stderr output (useful for agents)

## Files Changed

| File | Change |
|------|--------|
| `src/cli.ts` | **Created** — full rewrite with all 7 phases (was previously untracked) |
| `AGENTS.md` | **Created** — agent integration guide |
| `CLAUDE.md` | **Modified** — added CLI agent usage section |
| `package.json` | **Modified** — added `dotenv` dependency |
| `package-lock.json` | **Modified** — lockfile update for dotenv |
| `tsup.config.ts` | **Modified** — pre-existing changes (not from this session) |

See also: `AGENTS.md` for the full CLI agent integration reference.
