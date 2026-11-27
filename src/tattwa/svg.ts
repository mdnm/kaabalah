import { TattwaError, type TattwaId } from "./schedule";
import svgArt from "./svg-art.json";

interface NestedArt {
  readonly inner: string;
  readonly viewBox?: string;
  readonly outer?: string;
}

// The geometry and foreground colors come from the Kaabalah Practice renderer.
const ART: Record<TattwaId, {
  readonly viewBox: string;
  readonly outer: string;
  readonly nested: Partial<Record<TattwaId, NestedArt>>;
}> = svgArt;

const COLORS: Record<TattwaId, string> = {
  prithvi: "hsl(60,100%,50%)",
  apas: "hsl(0,0%,76%)",
  tejas: "hsl(0,100%,50%)",
  vayu: "hsl(225,100%,59%)",
  akash: "hsl(0,0%,0%)",
};

export interface TattwaSvgOptions {
  readonly inner?: TattwaId;
  /** Maximum intrinsic width or height in pixels. Defaults to 256. */
  readonly size?: number;
}

/** Standalone SVG for a single tattwa or one complementary tattwa inside another. */
export function generateTattwaSvg(tattwa: TattwaId, { inner, size = 256 }: TattwaSvgOptions = {}): string {
  if (!Object.prototype.hasOwnProperty.call(ART, tattwa)
    || (inner !== undefined && !Object.prototype.hasOwnProperty.call(ART, inner))) {
    throw new TattwaError("Unknown tattwa. Use akash, vayu, tejas, prithvi or apas.");
  }
  if (!Number.isInteger(size) || size < 1 || size > 4096) {
    throw new TattwaError("Tattwa SVG size must be an integer from 1 to 4096.");
  }
  const base = ART[tattwa];
  const nested = inner !== undefined && inner !== tattwa ? base.nested[inner] : undefined;
  const viewBox = nested?.viewBox ?? base.viewBox;
  const [, , width, height] = viewBox.split(" ").map(Number);
  const scale = size / Math.max(width, height);
  const title = nested ? `${inner} in ${tattwa}` : tattwa;
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${Math.max(1, Math.round(width * scale))}" height="${Math.max(1, Math.round(height * scale))}" role="img">`,
    `<title>${title}</title>`,
    `<g fill="${COLORS[tattwa]}">${nested?.outer ?? base.outer}</g>`,
  ];
  if (nested && inner) svg.push(`<g fill="${COLORS[inner]}">${nested.inner}</g>`);
  svg.push("</svg>");
  return svg.join("");
}
