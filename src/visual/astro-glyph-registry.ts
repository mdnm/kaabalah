import {
  SOURCE_ASPECT_GLYPH_PRIMITIVES,
  SOURCE_PLANET_GLYPH_PRIMITIVES,
  SOURCE_ZODIAC_GLYPH_PRIMITIVES,
} from "./astro-glyph-assets";
import type {
  AstroGlyphCategory,
  AstroGlyphDefinition,
  AstroGlyphPrimitive,
  AstroWheelAngleGlyphKey,
  AstroWheelAspectGlyphKey,
  AstroWheelPlanetGlyphKey,
  AstroWheelZodiacSign,
} from "./astro-glyph-types";

export const ZODIAC_GLYPH_PRIMITIVES = SOURCE_ZODIAC_GLYPH_PRIMITIVES;

export const PLANET_GLYPH_PRIMITIVES = SOURCE_PLANET_GLYPH_PRIMITIVES;

export const ASPECT_GLYPH_PRIMITIVES = SOURCE_ASPECT_GLYPH_PRIMITIVES;

export const ANGLE_GLYPH_PRIMITIVES = {
  asc: SOURCE_PLANET_GLYPH_PRIMITIVES.ascendant,
  mc: SOURCE_PLANET_GLYPH_PRIMITIVES.midheaven,
  dsc: SOURCE_PLANET_GLYPH_PRIMITIVES.descendant,
  ic: SOURCE_PLANET_GLYPH_PRIMITIVES.nadir,
  vertex: SOURCE_PLANET_GLYPH_PRIMITIVES.vertex,
} satisfies Record<AstroWheelAngleGlyphKey, readonly AstroGlyphPrimitive[]>;

const PLANET_ALIASES: Partial<Record<AstroWheelPlanetGlyphKey, readonly string[]>> = {
  "north node": ["mean node", "true node", "ascending node", "north lunar node", "☊"],
  "south node": ["descending node", "south lunar node", "☋"],
  lilith: ["black moon lilith", "mean lilith", "true lilith", "lilith mean", "lilith true", "⚸"],
  "pars fortunae": ["part of fortune", "lot of fortune", "wheel of fortune", "fortune", "⊗"],
  ascendant: ["asc", "ac"],
  midheaven: ["mc", "medium coeli"],
  descendant: ["dsc", "dc"],
  nadir: ["ic", "imum coeli"],
  vertex: ["vx", "vtx"],
  retrograde: ["rx"],
};

const ASPECT_ALIASES: Partial<Record<AstroWheelAspectGlyphKey, readonly string[]>> = {
  semisquare: ["semi-square", "octile"],
  sesquisquare: ["sesqui-square", "sesquiquadrate", "trioctile"],
  semisextile: ["semi-sextile", "duodecile"],
  inconjunct: ["quincunx"],
};

export const ZODIAC_GLYPHS: Record<AstroWheelZodiacSign, AstroGlyphDefinition> =
  mapGlyphRecord<AstroWheelZodiacSign>(
    ZODIAC_GLYPH_PRIMITIVES,
    (key, primitives) => ({
      key: normalizeGlyphKey(key),
      label: key,
      category: "zodiac",
      primitives,
    })
  );

export const PLANET_GLYPHS: Record<AstroWheelPlanetGlyphKey, AstroGlyphDefinition> =
  mapGlyphRecord<AstroWheelPlanetGlyphKey>(
    PLANET_GLYPH_PRIMITIVES,
    (key, primitives) => ({
      key,
      label: titleCaseGlyphKey(key),
      category: "planet",
      primitives,
      aliases: PLANET_ALIASES[key],
    })
  );

export const ASPECT_GLYPHS: Record<AstroWheelAspectGlyphKey, AstroGlyphDefinition> =
  mapGlyphRecord<AstroWheelAspectGlyphKey>(
    ASPECT_GLYPH_PRIMITIVES,
    (key, primitives) => ({
      key,
      label: titleCaseGlyphKey(key),
      category: "aspect",
      primitives,
      aliases: ASPECT_ALIASES[key],
    })
  );

function mapGlyphRecord<K extends string>(
  source: Record<K, readonly AstroGlyphPrimitive[]>,
  mapper: (key: K, primitives: readonly AstroGlyphPrimitive[]) => AstroGlyphDefinition
): Record<K, AstroGlyphDefinition> {
  const result = {} as Record<K, AstroGlyphDefinition>;

  for (const key of typedKeys(source)) {
    result[key] = mapper(key, source[key]);
  }

  return result;
}

function typedKeys<K extends string, V>(object: Record<K, V>): K[] {
  return Object.keys(object) as K[];
}

export const ANGLE_GLYPHS: Record<AstroWheelAngleGlyphKey, AstroGlyphDefinition> = {
  asc: {
    key: "asc",
    label: "ASC",
    category: "angle",
    primitives: ANGLE_GLYPH_PRIMITIVES.asc,
    aliases: ["ac"],
  },
  mc: {
    key: "mc",
    label: "MC",
    category: "angle",
    primitives: ANGLE_GLYPH_PRIMITIVES.mc,
  },
  dsc: {
    key: "dsc",
    label: "DSC",
    category: "angle",
    primitives: ANGLE_GLYPH_PRIMITIVES.dsc,
    aliases: ["dc"],
  },
  ic: {
    key: "ic",
    label: "IC",
    category: "angle",
    primitives: ANGLE_GLYPH_PRIMITIVES.ic,
  },
  vertex: {
    key: "vertex",
    label: "Vertex",
    category: "angle",
    primitives: ANGLE_GLYPH_PRIMITIVES.vertex,
    aliases: ["vx", "vtx"],
  },
};

export const ASTRO_GLYPHS: Record<string, AstroGlyphDefinition> = buildAstroGlyphRegistry();

export function getAstroGlyph(key: string): AstroGlyphDefinition | undefined {
  return ASTRO_GLYPHS[normalizeGlyphKey(key)];
}

export function listAstroGlyphs(category?: AstroGlyphCategory): AstroGlyphDefinition[] {
  const seen = new Set<string>();
  return Object.values(ASTRO_GLYPHS).filter((glyph) => {
    const id = `${glyph.category}:${glyph.key}`;
    if (seen.has(id)) return false;
    seen.add(id);
    return category ? glyph.category === category : true;
  });
}

function buildAstroGlyphRegistry(): Record<string, AstroGlyphDefinition> {
  const registry: Record<string, AstroGlyphDefinition> = {};
  for (const glyph of [
    ...Object.values(ZODIAC_GLYPHS),
    ...Object.values(PLANET_GLYPHS),
    ...Object.values(ASPECT_GLYPHS),
    ...Object.values(ANGLE_GLYPHS),
  ]) {
    registry[normalizeGlyphKey(glyph.key)] = glyph;
    registry[normalizeGlyphKey(glyph.label)] = glyph;
    for (const alias of glyph.aliases ?? []) {
      registry[normalizeGlyphKey(alias)] = glyph;
    }
  }
  return registry;
}

function normalizeGlyphKey(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function titleCaseGlyphKey(value: string) {
  return normalizeGlyphKey(value)
    .split(" ")
    .map((part) => part.charAt(0).toLocaleUpperCase() + part.slice(1))
    .join(" ");
}
