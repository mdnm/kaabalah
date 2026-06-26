import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const docsPublic = resolve(repoRoot, "docs/public");

describe("astro wheel SVG generator", () => {
  it("generates the supported docs wheel SVGs without a transit wheel", () => {
    execFileSync("npm", ["run", "generate:wheel"], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: "pipe",
    });

    for (const file of ["wheel-default.svg", "wheel-monochrome.svg", "wheel-no-aspects.svg"]) {
      const svg = readFileSync(resolve(docsPublic, file), "utf8");

      expect(svg).toContain(`<svg xmlns="http://www.w3.org/2000/svg"`);
      expect(svg).toContain(`id="astro-wheel-zodiac"`);
      expect(svg).toContain(`id="astro-wheel-planets"`);
      expect(svg).toContain(`id="astro-wheel-glyph-layer"`);
      expect(svg).not.toContain("NaN");
      expect(svg).not.toContain("undefined");
      expect(svg).not.toContain(`data-point-group="transit"`);
      expect(svg).not.toContain(`class="astro-wheel-boundary-notch"`);
    }

    expect(readFileSync(resolve(docsPublic, "wheel-default.svg"), "utf8"))
      .not.toContain(`class="astro-wheel-position-rail-label"`);
    expect(readFileSync(resolve(docsPublic, "wheel-no-aspects.svg"), "utf8"))
      .not.toContain(`id="astro-wheel-aspects"`);
    expect(existsSync(resolve(docsPublic, "wheel-transit.svg"))).toBe(false);
  });
});
