// Moves the editorial provenance (`src`, `reviewNotes`) out of src/astrology/descriptions.json into
// the gitignored sidecar provenance/descriptions.provenance.json.
//
// The sidecar mirrors the JSON's own nesting: provenance[table][key]...[key] = { src, reviewNotes }.
// Re-running after the keys are gone is a no-op (it never overwrites an existing sidecar with less).
//
//   node scripts/extract-provenance.mjs
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";

const JSON_PATH = "src/astrology/descriptions.json";
const SIDECAR_PATH = "provenance/descriptions.provenance.json";
const KEYS = ["src", "reviewNotes"];

const text = readFileSync(JSON_PATH, "utf8");
const data = JSON.parse(text);

// The file is plain JSON.stringify(_, null, 2) plus a trailing newline; removing keys must keep that.
if (JSON.stringify(data, null, 2) + "\n" !== text) {
  throw new Error("descriptions.json is not in the expected 2-space format with a trailing newline");
}

const sidecar = {};
let entries = 0;

function strip(node, path) {
  if (Array.isArray(node)) {
    node.forEach((child, i) => {
      if (child && typeof child === "object" && !Array.isArray(child) && KEYS.some((k) => k in child)) {
        throw new Error(`provenance key inside an array at ${path.join(".")}[${i}]`);
      }
      strip(child, [...path, String(i)]);
    });
    return;
  }
  if (!node || typeof node !== "object") return;
  if (KEYS.some((k) => k in node)) {
    let target = sidecar;
    for (const key of path) target = target[key] ??= {};
    for (const k of KEYS) if (k in node) target[k] = node[k];
    entries += 1;
    for (const k of KEYS) delete node[k];
  }
  for (const [key, child] of Object.entries(node)) strip(child, [...path, key]);
}

const before = structuredClone(data);
strip(data, []);

if (entries === 0) {
  console.log("No provenance keys left in descriptions.json; nothing to do.");
  process.exit(0);
}

// Deep equality of everything else: the original with the two keys removed everywhere must equal the result.
function withoutKeys(node) {
  if (Array.isArray(node)) return node.map(withoutKeys);
  if (node && typeof node === "object") {
    return Object.fromEntries(
      Object.entries(node)
        .filter(([key]) => !KEYS.includes(key))
        .map(([key, child]) => [key, withoutKeys(child)]),
    );
  }
  return node;
}
if (!isDeepStrictEqual(withoutKeys(before), data)) throw new Error("content other than the provenance keys changed");

// The sidecar must hold exactly what was removed.
let restored = 0;
(function check(node, side) {
  if (!node || typeof node !== "object" || Array.isArray(node)) return;
  if (side && KEYS.some((k) => k in side) && node !== undefined) restored += 1;
  for (const [key, child] of Object.entries(node)) check(child, side?.[key]);
})(data, sidecar);
if (restored !== entries) throw new Error(`sidecar covers ${restored} of ${entries} entries`);

if (existsSync(SIDECAR_PATH)) throw new Error(`${SIDECAR_PATH} already exists; refusing to overwrite`);
mkdirSync("provenance", { recursive: true });
writeFileSync(SIDECAR_PATH, JSON.stringify(sidecar, null, 2) + "\n");
writeFileSync(JSON_PATH, JSON.stringify(data, null, 2) + "\n");
console.log(`Moved provenance of ${entries} entries to ${SIDECAR_PATH}; removed ${KEYS.join(" and ")} from ${JSON_PATH}.`);
