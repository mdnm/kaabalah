#!/usr/bin/env node
/**
 * Real-browser smoke test for the built ESM package.
 *
 *   npm run build && node scripts/smoke-browser.mjs      (or: npm run test:browser)
 *
 * Bundles `dist/astrology/index.mjs` the way a web app would (esbuild, platform=browser),
 * serves the bundle plus `swisseph.web.wasm` and `ephe/*.se1` from a tiny static server with
 * correct MIME types, loads the page in headless Chrome/Chromium and asserts that a Sun
 * longitude computed by getBirthChart (default Swiss ephemeris files, not Moshier) appears.
 *
 * Browser binary: $CHROME_BIN, or the usual macOS/Linux locations. If none is found the script
 * prints "SKIPPED" and exits with code 3 -- it never reports a pass without running a browser.
 * esbuild is not a declared dependency; it comes with tsup/vitest (devDependencies).
 *
 * Browser consumers must pass explicit asset URLs (wasmPath/ephePath): there is no
 * module-relative default in a bundled web app.
 */
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const EXPECTED_SUN_LONGITUDE = 280.3689; // Sun at 2000-01-01 12:00 UT
const TOLERANCE_DEG = 0.01;

const CHROME_CANDIDATES = [
  process.env.CHROME_BIN,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);

const chrome = CHROME_CANDIDATES.find((candidate) => existsSync(candidate));
if (!chrome) {
  process.stdout.write("SKIPPED: no Chrome/Chromium binary found (set CHROME_BIN). The browser path was NOT exercised.\n");
  process.exit(3);
}
for (const required of ["dist/astrology/index.mjs", "wasm/build/swisseph.web.wasm", "ephe/seas_18.se1"]) {
  if (!existsSync(join(repoRoot, required))) {
    process.stderr.write(`Missing ${required}. Run \`npm run build\` first and make sure ./ephe exists.\n`);
    process.exit(1);
  }
}

const baseTmp = process.env.SMOKE_TMPDIR ?? tmpdir();
mkdirSync(baseTmp, { recursive: true });
const workDir = mkdtempSync(join(baseTmp, "kaabalah-browser-"));
const siteDir = join(workDir, "site");
mkdirSync(siteDir);

const esbuild = require("esbuild");
const entry = join(workDir, "entry.mjs");
writeFileSync(
  entry,
  `import { getSwissEph, getBirthChart, closeSwissEph } from ${JSON.stringify(join(repoRoot, "dist/astrology/index.mjs"))};
const out = document.getElementById("out");
try {
  await getSwissEph({ wasmPath: "/swisseph.web.wasm", ephePath: "/ephe", onRuntimeNotice: () => {} });
  const chart = await getBirthChart({
    date: { year: 2000, month: 1, day: 1, hour: 12, minute: 0 },
    latitude: 0,
    longitude: 0,
    timeZoneSettings: { utcOffsetMinutes: 0 },
  });
  out.textContent = "SUN=" + chart.planets.sun.longitude;
  closeSwissEph();
} catch (error) {
  out.textContent = "ERROR=" + (error && error.message ? error.message : String(error));
}
`
);
const build = await esbuild.build({
  entryPoints: [entry],
  outfile: join(siteDir, "bundle.js"),
  bundle: true,
  platform: "browser",
  format: "esm",
  target: "es2022",
  logLevel: "silent",
  logOverride: {},
  absWorkingDir: repoRoot,
});
writeFileSync(
  join(siteDir, "index.html"),
  `<!doctype html><meta charset="utf-8"><title>kaabalah browser smoke</title><pre id="out">PENDING</pre><script type="module" src="/bundle.js"></script>`
);

const MIME = { ".html": "text/html", ".js": "text/javascript", ".wasm": "application/wasm", ".se1": "application/octet-stream" };
const files = {
  "/": join(siteDir, "index.html"),
  "/bundle.js": join(siteDir, "bundle.js"),
  "/swisseph.web.wasm": join(repoRoot, "wasm/build/swisseph.web.wasm"),
};
for (const name of ["seas_18.se1", "semo_18.se1", "sepl_18.se1"]) {
  files[`/ephe/${name}`] = join(repoRoot, "ephe", name);
}
const requested = [];
const server = createServer((request, response) => {
  const path = new URL(request.url, "http://localhost").pathname;
  requested.push(path);
  const file = files[path];
  if (!file) {
    response.writeHead(404).end("not found");
    return;
  }
  const extension = file.slice(file.lastIndexOf("."));
  response.writeHead(200, { "content-type": MIME[extension] ?? "application/octet-stream" });
  response.end(readFileSync(file));
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const { port } = server.address();

let exitCode = 0;
try {
  const profile = join(workDir, "profile");
  // Async spawn: the static server lives in this process and must keep serving while Chrome runs.
  const result = await new Promise((done) => {
    const child = spawn(
      chrome,
      [
        "--headless=new",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        `--user-data-dir=${profile}`,
        "--virtual-time-budget=30000",
        "--dump-dom",
        `http://127.0.0.1:${port}/`,
      ],
      { stdio: ["ignore", "pipe", "pipe"] }
    );
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    const timer = setTimeout(() => child.kill("SIGKILL"), 90_000);
    child.on("close", () => {
      clearTimeout(timer);
      done({ stdout, stderr });
    });
  });
  const dom = result.stdout ?? "";
  const match = /SUN=([-0-9.eE]+)/.exec(dom);
  process.stdout.write(`browser: ${chrome}\nserved: ${[...new Set(requested)].join(", ")}\n`);
  if (!match) {
    const error = /ERROR=([^<]*)/.exec(dom);
    process.stderr.write(`BROWSER SMOKE FAILED: ${error ? error[1] : "no result in DOM"}\n${dom.slice(0, 600)}\n${(result.stderr ?? "").slice(-800)}\n`);
    exitCode = 1;
  } else {
    const sun = Number(match[1]);
    const served = new Set(requested);
    const ok =
      Math.abs(sun - EXPECTED_SUN_LONGITUDE) < TOLERANCE_DEG &&
      served.has("/swisseph.web.wasm") &&
      ["seas_18.se1", "semo_18.se1", "sepl_18.se1"].every((name) => served.has(`/ephe/${name}`));
    process.stdout.write(`${ok ? "PASS" : "FAIL"}  headless Chrome: Sun longitude ${sun} (expected ${EXPECTED_SUN_LONGITUDE} +/- ${TOLERANCE_DEG}); wasm and all three .se1 files were fetched by the page\n`);
    exitCode = ok ? 0 : 1;
  }
} finally {
  server.close();
  rmSync(workDir, { recursive: true, force: true });
}
void build;
process.exit(exitCode);
