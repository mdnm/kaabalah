import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import { generateArcheometerSvg } from "../src/visual/index";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const docsPublic = path.resolve(scriptDir, "../docs/public");

fs.mkdirSync(docsPublic, { recursive: true });

const svgs: Record<string, string> = {
  "archeometer.svg": generateArcheometerSvg({
    width: 900,
    height: 900,
    background: "transparent",
    title: "The Cosmological Archeometer",
  }),
};

for (const [file, svg] of Object.entries(svgs)) {
  const target = path.join(docsPublic, file);
  fs.writeFileSync(target, svg, "utf-8");
  console.log(`✔ ${file} (${(svg.length / 1024).toFixed(1)} KB)`);
}
