# Critique of plan.md

## Summary

The plan correctly identifies the biggest pain points (hardcoded version, limited parser, monolithic file, no tests) and proposes a reasonable migration path. However, it has significant gaps against the guide it claims to follow, makes a dependency-heavy framework recommendation without acknowledging the tradeoff, and misses several best practices entirely.

---

## Major Gaps

### 1. `util.parseArgs()` is never considered

Node.js ships `util.parseArgs()` since v16.17 / v18.3. It handles `--flag value`, `--flag=value`, short aliases, `--` end-of-options, and strict unknown-flag rejection — all the gaps the plan identifies in the current parser.

This matters because:
- The project currently has **2 runtime dependencies** (`dotenv`, `tz-lookup`). Adding `yargs` pulls in ~20 transitive packages.
- `kaabalah` is primarily a **library** consumed programmatically. The CLI is a secondary entry point. Bloating the published package for CLI ergonomics hurts library consumers (even with `files` filtering, the install footprint grows).
- The guide's section **2.1 (Small dependency footprint)** explicitly warns against this, especially for `npx`-invoked CLIs.
- `util.parseArgs()` is zero dependencies, built into the runtime the project already targets.

The plan should at minimum evaluate `util.parseArgs()` as the primary option and justify `yargs` only if `util.parseArgs()` falls short on a specific need (like subcommand routing — which the current `switch` already handles fine).

### 2. `cosmiconfig` is overkill for ~5 config keys

The plan proposes `cosmiconfig` for: `json`, `compact`, `houseSystem`, `timezone`, `wasmPath`, `ephePath`, `googleMapsApiKey`. That's 7 values, most of which are already covered by CLI flags or env vars.

A simpler approach: read a single `~/.kaabalahrc.json` (or XDG-compliant path) with a 10-line function. `cosmiconfig` adds another dependency tree for searching `.kaabalahrc`, `.kaabalahrc.json`, `.kaabalahrc.yaml`, `kaabalah.config.js`, `package.json#kaabalah`, etc. — discovery patterns this project doesn't need.

### 3. No mention of colors or `NO_COLOR` (Guide 1.4, 4.2)

The current CLI outputs plain text. The plan never mentions:
- Adding color to human-readable output
- Respecting the `NO_COLOR` env var (de facto standard)
- Respecting `TERM=dumb`
- Graceful degradation in CI environments

Even if you decide not to add colors now, the plan should acknowledge this gap and explicitly decide to skip it.

### 4. No POSIX signal handling (Guide 1.8)

The CLI does async work (WASM init, geocoding network calls). If a user hits Ctrl+C during `kaabalah astrology ... --location="..."`, the process should clean up gracefully (close SwissEph, abort fetch). Currently there's no `SIGINT`/`SIGTERM` handler. The plan doesn't mention this.

### 5. No actionable error messages (Guide 6.2)

The plan discusses trackable error codes (which already exist) but never mentions making errors *actionable*. Current examples:

```
MISSING_ARGUMENT: "Usage: kaabalah astrology <YYYY-MM-DD> [HH:MM] --lat=<N> --lon=<N>"
```

This is decent but not always the case. For example:

```
GEOCODE_ERROR: "GOOGLE_MAPS_API_KEY environment variable is required for --location."
```

Could be: `"...Set it with: export GOOGLE_MAPS_API_KEY=your_key, or use --lat/--lon instead."` — which it partially does. But the plan doesn't audit all error messages for actionability or propose a pattern for it.

### 6. No bug report mechanism (Guide 6.5)

No mention of `--report-bug` or a URL to file issues. Simple to add, high value for open-source maintenance.

### 7. Version not included in error output (Guide 9.4)

The plan fixes version sourcing (Phase 1) but doesn't mention including version in error messages or help output — which the guide specifically recommends for debugging.

### 8. No security consideration for stdin (Guide 10.1)

Phase 3 adds stdin support. The plan doesn't discuss:
- Input size limits on stdin (currently `MAX_TEXT_LENGTH = 1000` exists for positional args but would stdin enforce it?)
- Whether stdin JSON should go through the same `sanitizeInput()` path
- Argument injection risks from piped input

### 9. Locale sensitivity in tests (Guide 5.1)

Phase 0 adds contract tests but doesn't mention locale concerns. The current CLI doesn't do locale-dependent formatting, so this is low risk — but the plan should explicitly note that output is locale-independent and tests can safely assert on exact strings.

---

## Structural / Ordering Issues

### Phase 7 (modular split) should come before Phase 2 (parser migration)

The plan proposes: migrate to yargs in the monolithic 1600-line file (Phase 2), then split into modules (Phase 7). This means:
1. Rewriting the dispatch logic against the monolith
2. Then moving everything into separate files

It's less work to split first, then migrate each command module to the new parser independently. The modular split is also lower-risk (pure refactor, no behavior change) and can be validated by the Phase 0 contract tests before the parser swap.

Suggested reorder: Phase 0 → Phase 1 → Phase 7 → Phase 2 → Phase 3-6.

### Phase 5 (ephemeris hardening) is important but under-specified

The plan lists three fallback levels and mentions verifying file visibility, but doesn't describe the actual verification mechanism. A concrete approach: after mount, call the WASM's internal file-test function or simply check `FS.readdir("/ephefs")` for the expected `.se1` files. This should be specified so implementation doesn't stall on design questions.

---

## Minor Gaps (acknowledge or explicitly skip)

| Guide Section | Topic | Status in Plan |
|---|---|---|
| 1.2 | Empathic CLIs (interactive prompts on missing args) | Not mentioned |
| 1.3 | XDG Base Directory Spec for config storage | Not mentioned (cosmiconfig handles this, but only if adopted) |
| 1.5 | Rich interactions (spinners for WASM init, geocoding) | Not mentioned |
| 1.6 | Hyperlinks in terminal output | Not mentioned |
| 2.2 | npm shrinkwrap for CLI distribution | Not mentioned |
| 2.3 | Config cleanup on uninstall | Not mentioned |
| 4.1 | Docker image | Not mentioned |
| 4.4 | Shebang autodetect | Already handled by `postbuild` but not acknowledged |
| 9.5 | Deprecation warnings before breaking changes | Compatibility rules exist but no runtime deprecation mechanism |
| 9.7 | Changelog | Not mentioned |

Most of these are reasonable to skip for a library-first project, but the plan should say so explicitly rather than silently omitting them.

---

## What the Plan Gets Right

To be fair, the plan does several things well:
- Phase 0 (contract tests first) is exactly the right starting point
- The compatibility rules section is thorough and practical
- Identifying the version drift is correct and urgent
- The ephemeris hardening (Phase 5) addresses a real production issue
- The plan correctly preserves the `help --json` schema as a first-class requirement

---

## Recommendation

1. **Replace `yargs` recommendation with `util.parseArgs()`** + the existing `switch` dispatcher. If `util.parseArgs()` proves insufficient for a specific need, upgrade to `yargs` at that point.
2. **Drop `cosmiconfig`**. Use a simple JSON config reader with XDG path resolution (~20 lines of code).
3. **Move Phase 7 (modular split) before Phase 2 (parser migration)**.
4. **Add a Phase for colors + `NO_COLOR`** or explicitly decide to skip it.
5. **Add SIGINT handling** to the astrology and geocoding commands.
6. **Add version to error output** as part of Phase 1.
7. **Add input validation for stdin** as part of Phase 3.
8. **Acknowledge the minor gaps** with explicit "not planned" decisions so they don't look like oversights.
