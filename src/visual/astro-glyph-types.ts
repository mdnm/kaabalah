export type AstroWheelZodiacSign =
  | "Aries"
  | "Taurus"
  | "Gemini"
  | "Cancer"
  | "Leo"
  | "Virgo"
  | "Libra"
  | "Scorpio"
  | "Sagittarius"
  | "Capricorn"
  | "Aquarius"
  | "Pisces";

export type AstroGlyphPrimitive =
  | { kind: "path"; d: string }
  | { kind: "circle"; cx: number; cy: number; r: number }
  | { kind: "line"; x1: number; y1: number; x2: number; y2: number }
  | { kind: "polyline"; points: string }
  | { kind: "text"; text: string; x?: number; y?: number; fontSize?: number; fontWeight?: string | number }
  | { kind: "raw"; markup: string };

export type AstroWheelPlanetGlyphKey =
  | "sun"
  | "moon"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto"
  | "earth"
  | "chiron"
  | "lilith"
  | "north node"
  | "south node"
  | "pars fortunae"
  | "ascendant"
  | "midheaven"
  | "descendant"
  | "nadir"
  | "vertex"
  | "retrograde";

export type AstroWheelAspectGlyphKey =
  | "conjunction"
  | "opposition"
  | "square"
  | "trine"
  | "sextile"
  | "semisquare"
  | "sesquisquare"
  | "inconjunct"
  | "semisextile";

export type AstroWheelAngleGlyphKey = "asc" | "mc" | "dsc" | "ic" | "vertex";

export type AstroGlyphCategory = "zodiac" | "planet" | "aspect" | "angle";

export interface AstroGlyphDefinition {
  key: string;
  label: string;
  category: AstroGlyphCategory;
  primitives: readonly AstroGlyphPrimitive[];
  aliases?: readonly string[];
}