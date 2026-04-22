import * as fs from "node:fs";
import * as path from "node:path";
import { generateTreeSvg } from "../src/visual/index.js";

const treeSvg = generateTreeSvg({
  background: "transparent",
  palette: "color",
  system: "kaabalah",
});

const treeInner = treeSvg
  .replace(/^<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "")
  .trim();

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 286 561" role="img" aria-labelledby="title desc">
  <title id="title">Kaabalah Tree of Life</title>
  <desc id="desc">A luminous color Tree of Life rendered from the Kaabalah SVG module.</desc>
  <defs>
    <radialGradient id="readme-halo" cx="50%" cy="38%" r="46%">
      <stop offset="0%" stop-color="#f8dda2" stop-opacity="0.32"/>
      <stop offset="42%" stop-color="#7ccfff" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#7ccfff" stop-opacity="0"/>
    </radialGradient>
    <filter id="readme-blur" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
  </defs>
  <rect width="286" height="561" fill="#0d1117"/>
  <ellipse cx="143" cy="255" rx="94" ry="180" fill="url(#readme-halo)" filter="url(#readme-blur)"/>
  <ellipse cx="94" cy="108" rx="42" ry="42" fill="#76d4ff" fill-opacity="0.14" filter="url(#readme-blur)"/>
  <ellipse cx="205" cy="438" rx="58" ry="76" fill="#f1a2ff" fill-opacity="0.1" filter="url(#readme-blur)"/>
  <g fill="#fff6d8" fill-opacity="0.72">
    <circle cx="47" cy="57" r="1.1"/>
    <circle cx="74" cy="36" r="1.4"/>
    <circle cx="109" cy="64" r="0.9"/>
    <circle cx="230" cy="51" r="1.2"/>
    <circle cx="257" cy="95" r="0.85"/>
    <circle cx="30" cy="169" r="0.85"/>
    <circle cx="245" cy="183" r="1"/>
    <circle cx="58" cy="299" r="0.8"/>
    <circle cx="252" cy="323" r="1.15"/>
    <circle cx="43" cy="474" r="1"/>
    <circle cx="221" cy="503" r="0.95"/>
  </g>
  ${treeInner}
</svg>`;

const scriptDir = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
const outPath = path.resolve(scriptDir, "tree-of-life-readme.svg");
fs.writeFileSync(outPath, svg, "utf-8");
console.log(`✔ Generated ${outPath}  (${(svg.length / 1024).toFixed(1)} KB)`);
