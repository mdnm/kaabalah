# CLI Improvement Plan

## Objective

Improve `src/cli.ts` so the CLI follows the strongest parts of Liran Tal's Node.js CLI best practices without breaking the current agent-friendly contract.

Primary goals:
- keep command names and JSON output stable
- remove most custom argument parsing logic
- improve cross-platform behavior and scriptability
- make the CLI easier to maintain and test

Constraint:
- prefer built-in Node APIs and a small runtime dependency footprint because `kaabalah` is library-first and the CLI is a secondary entry point

## Current Strengths To Preserve

The current CLI already does several things well and these should remain first-class requirements:
- Command registry plus `help --json` introspection in `src/cli.ts`
- Structured JSON output with `--json`, `--compact`, and `--fields`
- Trackable error codes and non-zero exits on failure
- Auto-enable JSON when stdout is not a TTY
- Correct use of `__dirname` for WASM and ephemeris paths
- Dynamic import of the astrology module to avoid unnecessary startup cost

## Gaps Against The Best-Practices Guide

1. Versioning drift
- `src/cli.ts:19` hardcodes `VERSION = "4.9.1"` while `package.json:3` is `5.2.0`.
- This conflicts with the guide's versioning advice and will produce incorrect `--version` output.

2. Custom parser is too limited
- `parseArgs()` in `src/cli.ts:234` only supports `--flag=value` and bare `--flag` booleans.
- It does not support `--flag value`, short aliases like `-h` or `-V`, grouped short flags, strict unknown-flag handling, or `--` end-of-options behavior.
- The guide explicitly recommends POSIX-style argument behavior and points to `commander` and `yargs` for this.

3. No stdin path for data-oriented use
- The guide recommends accepting input over stdin for data-processing CLIs.
- Current commands rely on positional args or `--input-json`, which forces shell quoting.

4. Cross-platform quoting is fragile
- Several examples use single-quoted JSON payloads, which are not friendly to Windows `cmd.exe` usage.
- The guide specifically warns about shell differences and single-quote behavior.

5. Configuration precedence is mostly absent
- The guide recommends CLI args > env vars > project config > user config.
- Today the CLI only has a small amount of env-based behavior (`GOOGLE_MAPS_API_KEY`, TTY-driven JSON mode).

6. No debug mode
- The guide recommends a debug mode for diagnosis.
- Today unexpected failures fall through to the global catch handler, but there is no `--debug` or namespaced debug logging.

7. Monolithic implementation
- `src/cli.ts` currently mixes registry, parsing, validation, output formatting, network calls, command execution, and top-level dispatch in one file.
- This makes it harder to test and evolve safely.

8. No CLI-level end-to-end tests
- There are module tests, but no dedicated tests for the actual CLI process contract.
- A framework migration without contract tests would be unnecessarily risky.

9. Ephemeris mount failure is not fully detected
- In `src/astrology/swisseph.ts`, the Node runtime tries to mount the package `ephe/` directory into `/ephefs` and then trusts that mount path immediately.
- Your reported failure mode shows the mount can appear to succeed while the required `.se1` files are still inaccessible in the virtual filesystem.
- The current fallback only handles thrown mount errors, not silent mount failures.

## Parser And Config Recommendation

Recommended path: built-in-first
- `node:util.parseArgs()` for option parsing
- existing command registry and dispatcher, split into modules
- small internal config loader with explicit XDG-aware JSON paths
- small internal debug logger keyed off `--debug` and `DEBUG=kaabalah:*`

Why this path:
- closes the actual parser gaps in `src/cli.ts` without adding a large runtime dependency tree
- keeps install footprint lower for a package that is primarily consumed as a library
- still supports the behaviors we actually need:
  - `--flag=value`
  - `--flag value`
  - short aliases
  - `--` end-of-options
  - strict unknown-option rejection

When to escalate to `yargs`:
- only if `util.parseArgs()` becomes materially insufficient after modularization
- examples:
  - command-definition duplication becomes hard to control
  - help generation becomes too custom to maintain
  - alias/coercion behavior becomes significantly more complex than the built-in API can support cleanly

Why not `cosmiconfig` by default:
- this CLI only needs a small number of config keys
- broad config-file discovery is not necessary
- a focused JSON loader is easier to reason about and keeps the runtime surface smaller

Not recommended right now:
- `oclif`
- `yargs` as the first move
- `cosmiconfig` as the first move
- they add weight before we have evidence that built-in Node APIs are insufficient

## Recommended Architecture

Refactor `src/cli.ts` into a thin bootstrap and move responsibilities into focused modules:

- `src/cli.ts`
  - bootstrap only
  - initialize framework, register commands, run, handle fatal errors

- `src/cli/contract.ts`
  - typed command metadata
  - remains the source of truth for `help --json`
  - preserves the current agent-facing schema model

- `src/cli/runtime/errors.ts`
  - error catalog
  - `CliError` type
  - JSON/human error rendering

- `src/cli/runtime/output.ts`
  - `--json`, `--compact`, `--fields`
  - field projection helpers

- `src/cli/runtime/config.ts`
  - env and config resolution
  - precedence merging
  - explicit XDG-aware JSON config loading only

- `src/cli/runtime/stdin.ts`
  - stdin reading helpers
  - support for `--input-json=-` and piped payloads

- `src/cli/runtime/validation.ts`
  - shared date, time, lat/lon, house-system parsing

- `src/cli/runtime/debug.ts`
  - lightweight debug logger
  - `--debug` and `DEBUG=kaabalah:*` support without an extra dependency

- `src/astrology/swisseph.ts`
  - mount verification and fallback strategy
  - better ephemeris-path diagnostics

- `src/cli/commands/*.ts`
  - one module per command group
  - examples: `gematria.ts`, `numerology.ts`, `tarot.ts`, `tree.ts`, `astrology.ts`, `help.ts`

## Phase Plan

### Phase 0: Freeze The Contract Before Refactoring

Changes:
- Add CLI end-to-end tests around the current behavior before swapping parsers.
- Snapshot or assert the JSON contract for:
  - `help --json`
  - `numerology --json --fields=...`
  - `gematria --json`
  - `tree --json --compact`
  - structured errors in JSON mode
  - `--version`
- Mark which output shapes are intentionally stable and which can improve.

Outcome:
- We can refactor with confidence and avoid accidental contract drift.

### Phase 1: Fix The Immediate Correctness Issues

Changes:
- Source the CLI version from `package.json` instead of a hardcoded constant.
- Include the CLI version in JSON error output and human-readable fatal errors.
- Audit the existing error messages so they are consistently actionable and say what the user should do next.

Outcome:
- The CLI reports the right version and behaves more like a standard UNIX-style tool.

### Phase 2: Split Command Logic Into Modules

Changes:
- Move shared validators out of command functions.
- Consolidate duplicated astrology parsing paths so single-chart and two-chart commands use the same validation helpers.
- Keep the top-level bootstrap under roughly 100 lines.
- Preserve current behavior while moving code; do not mix parser migration into this step.

Outcome:
- `src/cli.ts` becomes maintainable before parser changes land.

### Phase 3: Upgrade Parsing With Built-In Node APIs

Changes:
- Replace the current custom `parseArgs()` implementation with `node:util.parseArgs()`.
- Support both forms:
  - `--lat=40.7128`
  - `--lat 40.7128`
- Support short aliases where they make sense.
- Add `-h` for help and `-V` for version.
- Support `--` to stop option parsing.
- Add strict unknown-option rejection so typos do not fail silently.
- Keep current command names intact, including colon-based names like `tarot:card` and `astrology:synastry`.
- Keep the existing command registry and help-schema contract as the primary source of truth.

Guardrails:
- Do not let the parser implementation become the only source of truth for help and schema output.
- Keep a typed internal contract so `help --json` continues to work for agents.
- Re-evaluate `yargs` only if the built-in parser proves insufficient after this refactor.

Outcome:
- Most of the hand-rolled parsing logic disappears without adding large new dependencies.

### Phase 4: Improve Interoperability And Cross-Platform Usage

Changes:
- Add stdin support for data-oriented input.
- Support `--input-json=-` to read a JSON object from stdin.
- For commands like `gematria`, allow piped text when no positional argument is given.
- Apply the same validation and size limits to stdin-driven inputs as to positional arguments and `--input-json`.
- Add an explicit byte cap for stdin payloads so accidental large pipes fail fast.
- Treat stdin as data input only; validate schema and content before dispatching to command handlers.
- Update examples to avoid single-quote-only patterns.
- Prefer examples that work across shells or provide explicit platform notes.

Possible supported flows:
- `echo '{"chartA": {...}, "chartB": {...}}' | kaabalah astrology:synastry --input-json=- --json --compact`
- `echo "Hello World" | kaabalah gematria --json --compact`

Outcome:
- The CLI becomes easier to script and more robust across macOS, Linux, CI, and Windows shells.

### Phase 5: Add Configuration Precedence

Changes:
- Introduce config resolution with precedence:
  1. CLI args
  2. environment variables
  3. project config
  4. user config
- Use a small explicit JSON config loader instead of broad config discovery.
- Prefer XDG-aware paths for user config on Unix-like systems.
- Limit config keys to settings that benefit from persistence, for example:
  - `json`
  - `compact`
  - `houseSystem`
  - `timezone`
  - `wasmPath`
  - `ephePath`
  - `googleMapsApiKey`
- Use a `KAABALAH_` env prefix for new env-configurable flags.
- Add explicit CLI overrides for astrology runtime paths:
  - `--ephe-path`
  - `--wasm-path`

Notes:
- Keep the CLI mostly stateless.
- Do not add interactive persisted state unless there is a real product need.

Outcome:
- Repeated invocations become simpler without making the CLI surprising.

### Phase 6: Harden Swiss Ephemeris Runtime Resolution

Changes:
- After mounting the ephemeris directory in `src/astrology/swisseph.ts`, verify that the expected files are actually visible from the virtual path before calling `setEphemerisPath()`.
- Concretely, inspect the virtual path with Emscripten FS APIs such as `FS.readdir()` and/or `FS.analyzePath()` instead of assuming that a successful `mount()` means the files are readable.
- Treat the following as distinct fallback levels:
  1. mounted virtual path works
  2. direct host path works
  3. copy the required `.se1` files into a writable runtime directory or MEMFS and point Swiss Ephemeris there
- Improve the error message when ephemeris files are not found so it explains that the mount may have failed silently.
- Add targeted tests for this failure mode by mocking a successful mount with inaccessible files.

Required files to verify:
- `seas_18.se1`
- `semo_18.se1`
- `sepl_18.se1`

Future-proof option to evaluate later:
- embed the small ephemeris data set as packaged assets or buffers and materialize them at runtime only when mount-based resolution fails
- this is the most robust approach, but it increases the distributed artifact size

Outcome:
- astrology commands stop depending on a mount that may claim success while leaving `/ephefs` unusable

### Phase 7: Add Signal Handling, Debuggability, And Better Failure Reporting

Changes:
- Add `SIGINT` and `SIGTERM` handling for long-running or async commands.
- Abort geocoding requests via `AbortController` when the process is interrupted.
- Close Swiss Ephemeris cleanly if initialization already happened and the process is interrupted.
- Add `--debug` and support `DEBUG=kaabalah:*`.
- Add namespaced debug logs around:
  - parser resolution
  - config precedence resolution
  - geocoding requests
  - WASM initialization
  - astrology command execution boundaries
- Include the CLI version in human help and JSON error output.
- Consider adding a `--trace` mode for stack traces in local debugging.

Outcome:
- Users can file more actionable bug reports and reproduce problems faster.

### Phase 8: Packaging, Docs, And Release Hygiene

Adjacent package changes:
- Add an `engines.node` field in `package.json` to declare supported Node versions.
- Keep using the `bin` object and `files` field.
- Decide whether to keep the current `postbuild` shebang insertion or replace it with a cleaner bundler-level solution.
- Consider whether publishing a shrinkwrapped CLI is desirable; if not, keep dependency count low instead of over-freezing transitive dependencies.
- Add or verify `repository` and `bugs` metadata in `package.json` so users have a clear issue-reporting path without needing a dedicated CLI command.

Outcome:
- The package stays easy to install and predictable to run.

## Commands Most Affected

Highest-impact commands for the refactor:
- `astrology`
- `astrology:synastry`
- `astrology:composite`
- `gematria`
- `tarot:spread`
- `help`

Why:
- they rely most on complex argument parsing, JSON payloads, and user-facing error/help behavior
- they are the commands most exposed to the ephemeris mount issue

## Compatibility Rules

These should stay stable unless we explicitly approve a breaking change:
- command names
- existing JSON error codes
- `--json`, `--compact`, `--fields`, `--input-json`
- auto-JSON behavior for non-TTY stdout
- existing astrology command capability and input schema
- `help --json` as a machine-readable schema endpoint
- default packaged ephemeris files continue to work with zero manual setup in normal environments

These can improve without being considered breaking:
- human-readable help formatting
- support for additional aliases such as `-h` and `-V`
- support for `--flag value` in addition to `--flag=value`
- stdin support
- `--ephe-path` and `--wasm-path` overrides
- clearer error messages with version/debug hints

## Explicit Non-Goals

These are intentionally out of scope for the first pass unless new requirements appear:
- interactive prompts for missing arguments
- spinners or rich terminal UI around WASM init or geocoding
- terminal colorization work
- a dedicated `--report-bug` command
- Docker packaging for the CLI
- broad config-file discovery across many formats
- deprecation plumbing beyond preserving backward compatibility during this refactor

## Suggested Implementation Order

1. Add CLI contract tests.
2. Fix version sourcing.
3. Split command logic into modules without changing behavior.
4. Replace the custom parser with `node:util.parseArgs()`.
5. Add stdin support and input hardening.
6. Add config precedence with a minimal JSON config loader.
7. Harden ephemeris runtime resolution.
8. Add signal handling and debug support.
9. Update docs and packaging metadata.

## Approval Decision Needed

Recommended approval choice:
- Proceed with a built-in-first refactor: `node:util.parseArgs()`, modularized command code, a minimal JSON config loader, and explicit ephemeris hardening while preserving the current command contract and `help --json` schema.

Fallback approval choice:
- Keep the current parser and only do the modular refactor plus targeted parser fixes.

I recommend the built-in-first path because it closes the current gaps without paying an unnecessary runtime dependency cost for a library-first package.
