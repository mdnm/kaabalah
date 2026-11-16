#!/usr/bin/env node
/**
 * Packed-install smoke test.
 *
 *   npm run build && node scripts/smoke-packed.mjs        (or: npm run test:package)
 *
 * 1. `npm pack` the package (from a staged copy when ./ephe is a symlink, because npm
 *    never follows symlinks and would silently omit the ephemeris files).
 * 2. Verify the tarball really contains the wasm runtime and the three .se1 files.
 * 3. Install the tarball into two fresh standalone projects (CommonJS and
 *    `"type": "module"`), run default initialisation (no asset paths) plus one real
 *    getBirthChart, and run the installed `kaabalah` CLI.
 * 4. Assert the Sun longitude is near the known J2000 value and identical between CJS and ESM.
 *
 * Temp projects live under $SMOKE_TMPDIR (default: the OS temp dir). Nothing is published.
 */
import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const baseTmp = process.env.SMOKE_TMPDIR ?? tmpdir();
mkdirSync(baseTmp, { recursive: true });
const workDir = mkdtempSync(join(baseTmp, "kaabalah-smoke-"));
const keep = process.argv.includes("--keep") || process.env.SMOKE_KEEP === "1";

// Sun at 2000-01-01 12:00 UT (J2000), tropical apparent longitude (Swiss Ephemeris): 280.3689 deg.
const EXPECTED_SUN_LONGITUDE = 280.3689;
const TOLERANCE_DEG = 0.01;

const REQUIRED_TARBALL_FILES = [
  "package/wasm/build/swisseph.node.js",
  "package/wasm/build/swisseph.node.wasm",
  "package/dist/swisseph.node.js",
  "package/dist/swisseph.node.wasm",
  "package/dist/cli.js",
  "package/ephe/seas_18.se1",
  "package/ephe/semo_18.se1",
  "package/ephe/sepl_18.se1",
];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", ...options });
  if (result.status !== 0 && !options.allowFailure) {
    throw new Error(
      `Command failed (${result.status}): ${command} ${args.join(" ")}\n${result.stdout ?? ""}\n${result.stderr ?? ""}`
    );
  }
  return result;
}

function step(message) {
  process.stdout.write(`\n== ${message}\n`);
}

function fail(message) {
  throw new Error(message);
}

const checks = [];
function check(name, ok, detail = "") {
  checks.push({ name, ok });
  process.stdout.write(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` -- ${detail}` : ""}\n`);
  if (!ok) {
    fail(`Check failed: ${name}`);
  }
}

function packTarball() {
  step("npm pack");
  const packDir = join(workDir, "pack");
  mkdirSync(packDir);

  let packFrom = repoRoot;
  const epheStat = existsSync(join(repoRoot, "ephe")) ? lstatSync(join(repoRoot, "ephe")) : null;
  if (!epheStat) {
    fail("./ephe is missing: the published tarball would not contain the ephemeris files.");
  }
  if (epheStat.isSymbolicLink()) {
    // npm pack skips symlinked directories; stage a dereferenced copy of exactly what `files` lists.
    packFrom = join(workDir, "stage");
    mkdirSync(packFrom);
    for (const entry of ["package.json", "README.md", "LICENSE", "dist", "wasm/build", "ephe"]) {
      const source = join(repoRoot, entry);
      if (existsSync(source)) {
        cpSync(source, join(packFrom, entry), { recursive: true, dereference: true });
      }
    }
    process.stdout.write("note: ./ephe is a symlink here; packing from a staged, dereferenced copy.\n");
  }

  const result = run("npm", ["pack", "--pack-destination", packDir, "--json", "--ignore-scripts"], {
    cwd: packFrom,
  });
  const info = JSON.parse(result.stdout);
  const tarball = join(packDir, info[0].filename);
  const listing = run("tar", ["-tzf", tarball]).stdout.split("\n").filter(Boolean);
  const interesting = listing.filter((file) => /ephe\/|wasm|swisseph|cli\.js$/.test(file));
  process.stdout.write(`tarball: ${tarball}\nship list (ephe/wasm/runtime):\n  ${interesting.join("\n  ")}\n`);
  for (const required of REQUIRED_TARBALL_FILES) {
    check(`tarball contains ${required}`, listing.includes(required));
  }
  return tarball;
}

function createProject(name, type, tarball) {
  const dir = join(workDir, name);
  mkdirSync(dir);
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({ name, private: true, version: "0.0.0", ...(type === "module" ? { type } : {}) }, null, 2)
  );
  run("npm", ["install", tarball, "--no-audit", "--no-fund", "--ignore-scripts", "--loglevel=error"], { cwd: dir });
  return dir;
}

const SMOKE_BODY = `
  const notices = [];
  await astrology.getSwissEph({ onRuntimeNotice: (message) => notices.push(message) });
  const chart = await astrology.getBirthChart({
    date: { year: 2000, month: 1, day: 1, hour: 12, minute: 0 },
    latitude: 0,
    longitude: 0,
    timeZoneSettings: { utcOffsetMinutes: 0 },
  });
  const info = typeof astrology.getSwissEphInfo === "function" ? astrology.getSwissEphInfo() : null;
  process.stdout.write("SMOKE_JSON=" + JSON.stringify({
    sun: chart.planets.sun.longitude,
    notices,
    info: info && {
      mountMode: info.mountMode,
      nodeGlue: info.nodeGlue,
      wasmPathSource: info.wasmPathSource,
      ephePathSource: info.ephePathSource,
      probe: info.probe,
    },
  }) + "\\n");
  astrology.closeSwissEph();
`;

function runSmoke(projectDir, format) {
  const file = format === "cjs" ? "smoke.cjs" : "smoke.mjs";
  const source =
    format === "cjs"
      ? `const astrology = require("kaabalah/astrology");\n(async () => {${SMOKE_BODY}})().catch((e) => { console.error(e); process.exit(1); });\n`
      : `import * as astrology from "kaabalah/astrology";\n${SMOKE_BODY.replace(/^/, "")}\n`;
  writeFileSync(join(projectDir, file), source);
  const result = run("node", [file], { cwd: projectDir });
  const line = result.stdout.split("\n").find((entry) => entry.startsWith("SMOKE_JSON="));
  if (!line) {
    fail(`${format}: smoke script produced no result.\nstdout: ${result.stdout}\nstderr: ${result.stderr}`);
  }
  return JSON.parse(line.slice("SMOKE_JSON=".length));
}

function runCli(projectDir, label) {
  const bin = join(projectDir, "node_modules", ".bin", "kaabalah");
  const result = run(
    bin,
    ["astrology", "2000-01-01", "12:00", "--lat", "0", "--lon", "0", "--timezone", "UTC", "--json", "--compact", "--quiet", "--fields", "planets.sun.longitude"],
    { cwd: projectDir }
  );
  const parsed = JSON.parse(result.stdout);
  const sun = parsed?.planets?.sun?.longitude;
  check(`${label}: installed CLI returns the Sun longitude`, typeof sun === "number", `sun=${sun}`);
  check(`${label}: CLI Sun within ${TOLERANCE_DEG} deg of ${EXPECTED_SUN_LONGITUDE}`, Math.abs(sun - EXPECTED_SUN_LONGITUDE) < TOLERANCE_DEG);
  return sun;
}

try {
  if (!existsSync(join(repoRoot, "dist", "astrology", "index.mjs"))) {
    fail("dist/ is missing. Run `npm run build` first (npm run test:package does).");
  }

  const tarball = packTarball();

  const results = {};
  for (const [name, format] of [
    ["cjs-project", "cjs"],
    ["esm-project", "esm"],
  ]) {
    step(`standalone ${format.toUpperCase()} project`);
    const dir = createProject(name, format === "esm" ? "module" : undefined, tarball);
    const result = runSmoke(dir, format);
    results[format] = result;
    process.stdout.write(`${format}: ${JSON.stringify(result)}\n`);
    check(
      `${format}: default getSwissEph() + getBirthChart Sun within ${TOLERANCE_DEG} deg of ${EXPECTED_SUN_LONGITUDE}`,
      Math.abs(result.sun - EXPECTED_SUN_LONGITUDE) < TOLERANCE_DEG,
      `sun=${result.sun}`
    );
    if (result.info) {
      check(`${format}: probe confirms Swiss ephemeris files (not Moshier)`, result.info.probe?.ephemeris === "swiss");
    }
    const cliSun = runCli(dir, format);
    results[format].cliSun = cliSun;
  }

  step("CJS vs ESM equality");
  check("Sun longitude identical in CJS and ESM", results.cjs.sun === results.esm.sun, `${results.cjs.sun} vs ${results.esm.sun}`);
  check("CLI Sun identical in CJS and ESM projects", results.cjs.cliSun === results.esm.cliSun);

  process.stdout.write(`\nAll ${checks.length} checks passed.\n`);
} catch (error) {
  process.stderr.write(`\nSMOKE FAILED: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
} finally {
  if (keep) {
    process.stdout.write(`kept ${workDir}\n`);
  } else {
    rmSync(workDir, { recursive: true, force: true });
  }
}
