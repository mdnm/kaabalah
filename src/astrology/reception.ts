/**
 * Dispositors, mutual receptions, sect status, planetary joys, station status
 * and a one-call planetary condition summary.
 * Pure math, no WASM dependency: everything takes signs, longitudes and speeds
 * that the caller already has (for example from `getBirthChart`).
 */

import { SIGNS, type BirthChart, type Sect } from "./index";
import {
  DOMICILE_RULERS,
  EXALTATIONS,
  getEssentialDignities,
  type EssentialDignitiesDetail,
  type Sign,
  type TraditionalPlanet,
} from "./dignity";
import { normalizeAngle } from "./swisseph";

// ── Rulership schemes ──────────────────────────────────────────────────

/** Planets that can rule a sign in either scheme. */
export type RulerPlanet = TraditionalPlanet | "Uranus" | "Neptune" | "Pluto";

/** `"traditional"` (the seven visible planets) or `"modern"` (Pluto, Uranus and Neptune replace Mars, Saturn and Jupiter in Scorpio, Aquarius and Pisces). */
export type RulershipScheme = "traditional" | "modern";

export interface RulershipOptions {
  /** Rulership scheme; default `"traditional"`. */
  rulers?: RulershipScheme;
}

/** Traditional domicile rulers (the existing `DOMICILE_RULERS` table). */
export const TRADITIONAL_RULERS: Record<Sign, RulerPlanet> = DOMICILE_RULERS;

/** Modern rulers: as traditional, except Scorpio (Pluto), Aquarius (Uranus) and Pisces (Neptune). */
export const MODERN_RULERS: Record<Sign, RulerPlanet> = {
  ...DOMICILE_RULERS,
  Scorpio: "Pluto",
  Aquarius: "Uranus",
  Pisces: "Neptune",
};

/** Ruler table for a scheme. */
export function getRulerTable(scheme: RulershipScheme = "traditional"): Record<Sign, RulerPlanet> {
  return scheme === "modern" ? MODERN_RULERS : TRADITIONAL_RULERS;
}

/** Body name to sign. Keys are body names such as `"Sun"`, `"Mean Node"`, `"Chiron"`. */
export type Placements = Record<string, Sign>;

function isSign(value: unknown): value is Sign {
  return typeof value === "string" && (SIGNS as readonly string[]).includes(value);
}

function isBirthChart(value: Placements | BirthChart): value is BirthChart {
  const v = value as Partial<BirthChart>;
  return typeof v.planets === "object" && v.planets !== null && typeof v.houses === "object";
}

/** Placements from a chart (keyed by body name, e.g. `"Mean Node"`) or a hand-built map. */
export function toPlacements(input: Placements | BirthChart): Placements {
  if (!isBirthChart(input)) {
    for (const [body, sign] of Object.entries(input)) {
      if (!isSign(sign)) throw new Error(`Unknown sign "${String(sign)}" for ${body}`);
    }
    return input;
  }
  const out: Placements = {};
  for (const planet of Object.values(input.planets)) {
    const sign = planet.zodiacPosition.sign;
    if (!isSign(sign)) throw new Error(`Unknown sign "${sign}" for ${planet.name}`);
    out[planet.name] = sign;
  }
  return out;
}

/** Case-insensitive lookup from a ruler name to the key used in the placements. */
function indexBodies(placements: Placements): Map<string, string> {
  const map = new Map<string, string>();
  for (const body of Object.keys(placements)) map.set(body.toLowerCase(), body);
  return map;
}

// ── Dispositors ────────────────────────────────────────────────────────

export type DispositorEnd =
  /** The chain reaches a body in its own sign (a final dispositor). */
  | "own-sign"
  /** The chain closes a loop of two or more bodies. */
  | "loop"
  /** The chain reaches a ruler that is not in the placements. */
  | "unplaced";

export interface DispositorEntry {
  body: string;
  sign: Sign;
  /**
   * The ruler of the body's sign. It is the body itself when the body is in its
   * own sign, and it may be absent from the placements (see `end`).
   */
  dispositor: string;
  /**
   * Dispositors in order, starting with `dispositor`. Empty when the body is in
   * its own sign. A chain that closes a loop ends with the body that repeats an
   * earlier one (the body itself, or a body already in the chain).
   */
  chain: string[];
  end: DispositorEnd;
  /** The own-sign body that ends the chain, or null. */
  finalDispositor: string | null;
  /** The loop the chain falls into, rotated to start at its first body in placement order, or null. */
  loop: string[] | null;
}

export interface DispositorsResult {
  rulers: RulershipScheme;
  bodies: Record<string, DispositorEntry>;
  /** Bodies in their own sign (each ends its own chain), in placement order. */
  finalDispositors: string[];
  /** Cycles of two or more bodies, each listed once. */
  loops: string[][];
  /** The one body that ends every chain, when there is exactly one and no chain loops or is cut short; otherwise null. */
  singleFinalDispositor: string | null;
}

/**
 * Dispositor of every body: the ruler of the sign it occupies, followed until the
 * chain reaches a body in its own sign or closes a loop. Bodies that do not rule
 * anything in the chosen scheme (nodes, Chiron, outer planets under the
 * traditional scheme) still get a dispositor and a chain.
 */
export function getDispositors(
  input: Placements | BirthChart,
  options: RulershipOptions = {}
): DispositorsResult {
  const scheme = options.rulers ?? "traditional";
  const table = getRulerTable(scheme);
  const placements = toPlacements(input);
  const bodies = Object.keys(placements);
  const index = indexBodies(placements);
  const order = new Map(bodies.map((b, i) => [b, i]));

  /** Placed dispositor key for a body, or the raw ruler name when it is unplaced. */
  const next = (body: string): { name: string; placed: boolean } => {
    const ruler = table[placements[body]];
    const key = index.get(ruler.toLowerCase());
    return key === undefined ? { name: ruler, placed: false } : { name: key, placed: true };
  };

  const entries: Record<string, DispositorEntry> = {};
  const loops: string[][] = [];
  const loopKeys = new Set<string>();

  for (const body of bodies) {
    const first = next(body);
    const entry: DispositorEntry = {
      body,
      sign: placements[body],
      dispositor: first.name,
      chain: [],
      end: "own-sign",
      finalDispositor: null,
      loop: null,
    };
    if (first.placed && first.name === body) {
      entry.finalDispositor = body;
      entries[body] = entry;
      continue;
    }

    const path = [body];
    let current = first;
    for (;;) {
      entry.chain.push(current.name);
      if (!current.placed) {
        entry.end = "unplaced";
        break;
      }
      const at = path.indexOf(current.name);
      if (at !== -1) {
        // Closed a loop of path[at..]
        entry.end = "loop";
        const cycle = path.slice(at);
        const start = cycle.reduce((best, b, i) => (order.get(b)! < order.get(cycle[best])! ? i : best), 0);
        entry.loop = [...cycle.slice(start), ...cycle.slice(0, start)];
        const key = [...entry.loop].sort().join("|");
        if (!loopKeys.has(key)) {
          loopKeys.add(key);
          loops.push(entry.loop);
        }
        break;
      }
      path.push(current.name);
      const n = next(current.name);
      if (n.placed && n.name === current.name) {
        entry.end = "own-sign";
        entry.finalDispositor = current.name;
        break;
      }
      current = n;
    }
    entries[body] = entry;
  }

  const finalDispositors = bodies.filter((b) => entries[b].finalDispositor === b);
  const endings = new Set(bodies.map((b) => (entries[b].end === "own-sign" ? entries[b].finalDispositor : null)));
  const singleFinalDispositor = endings.size === 1 && !endings.has(null) ? [...endings][0] : null;

  return { rulers: scheme, bodies: entries, finalDispositors, loops, singleFinalDispositor };
}

// ── Mutual receptions ──────────────────────────────────────────────────

/** `"mixed"` is one reception by domicile and the other by exaltation. */
export type ReceptionKind = "domicile" | "exaltation" | "mixed";

export interface MutualReception {
  /** The two bodies, in placement order. */
  bodies: [string, string];
  by: ReceptionKind;
  /** Signs the two bodies occupy, in the same order as `bodies`. */
  signs: [Sign, Sign];
  /** How each body is received: the first body by the second's dignity, and the second by the first's. */
  receivedBy: [Exclude<ReceptionKind, "mixed">, Exclude<ReceptionKind, "mixed">];
}

export interface MutualReceptionOptions extends RulershipOptions {
  /** Restrict to these kinds; default all three. */
  by?: ReceptionKind | ReceptionKind[];
}

function exaltedIn(sign: Sign): TraditionalPlanet | undefined {
  return (Object.keys(EXALTATIONS) as TraditionalPlanet[]).find((p) => EXALTATIONS[p].sign === sign);
}

/**
 * Pairs of bodies that each stand in a sign the other has dignity in. Domicile
 * uses the chosen rulership scheme; exaltation always uses the traditional
 * exaltation table (the modern planets have none). A pair where one body is
 * received by domicile and the other by exaltation is reported as `"mixed"`.
 * Example: Venus in Virgo and Mercury in Libra are in mutual reception by domicile.
 */
export function getMutualReceptions(
  input: Placements | BirthChart,
  options: MutualReceptionOptions = {}
): MutualReception[] {
  const table = getRulerTable(options.rulers ?? "traditional");
  const placements = toPlacements(input);
  const wanted = options.by === undefined ? null : Array.isArray(options.by) ? options.by : [options.by];
  const bodies = Object.keys(placements);

  /** How `host` receives a body standing in `sign`, if at all. */
  const receivedBy = (host: string, sign: Sign): "domicile" | "exaltation" | null => {
    if (table[sign].toLowerCase() === host.toLowerCase()) return "domicile";
    if (exaltedIn(sign)?.toLowerCase() === host.toLowerCase()) return "exaltation";
    return null;
  };

  const out: MutualReception[] = [];
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i];
      const b = bodies[j];
      const aBy = receivedBy(b, placements[a]);
      const bBy = receivedBy(a, placements[b]);
      if (!aBy || !bBy) continue;
      const by: ReceptionKind = aBy === bBy ? aBy : "mixed";
      if (wanted && !wanted.includes(by)) continue;
      out.push({ bodies: [a, b], by, signs: [placements[a], placements[b]], receivedBy: [aBy, bBy] });
    }
  }
  return out;
}

// ── Sect status ────────────────────────────────────────────────────────

export interface SectStatusContext {
  /** The planet's own ecliptic longitude; needed only for Mercury. */
  longitude?: number;
  /** The Sun's ecliptic longitude; needed only for Mercury. */
  sunLongitude?: number;
}

/**
 * Whether a planet is in sect. Day chart: Sun, Jupiter and Saturn. Night chart:
 * Moon, Venus and Mars. Mercury is of the day sect when it rises before the Sun
 * (its longitude is behind the Sun's, by more than 0 and less than 180 degrees)
 * and of the night sect otherwise, so it needs `longitude` and `sunLongitude`
 * (without them it returns undefined). Outer planets, nodes and other points
 * return undefined.
 */
export function getPlanetSectStatus(
  planet: string,
  sect: Sect,
  context: SectStatusContext = {}
): boolean | undefined {
  const day = sect === "diurnal";
  switch (planet.toLowerCase()) {
    case "sun":
    case "jupiter":
    case "saturn":
      return day;
    case "moon":
    case "venus":
    case "mars":
      return !day;
    case "mercury": {
      if (context.longitude === undefined || context.sunLongitude === undefined) return undefined;
      const behindSun = normalizeAngle(context.sunLongitude - context.longitude);
      const ofDay = behindSun > 0 && behindSun < 180;
      return ofDay === day;
    }
    default:
      return undefined;
  }
}

// ── Joys ───────────────────────────────────────────────────────────────

/** House of each traditional planet's joy. */
export const PLANETARY_JOYS: Record<TraditionalPlanet, number> = {
  Mercury: 1,
  Moon: 3,
  Venus: 5,
  Mars: 6,
  Sun: 9,
  Jupiter: 11,
  Saturn: 12,
};

/** True when a traditional planet is in the house of its joy; false for any other body. */
export function isInJoy(planet: string, house: number): boolean {
  const key = Object.keys(PLANETARY_JOYS).find((p) => p.toLowerCase() === planet.toLowerCase());
  return key !== undefined && PLANETARY_JOYS[key as TraditionalPlanet] === house;
}

// ── Station status ─────────────────────────────────────────────────────

/** Mean geocentric daily motion in degrees per day. */
export const MEAN_DAILY_MOTION: Record<string, number> = {
  Sun: 0.9856,
  Moon: 13.176,
  Mercury: 1.383,
  Venus: 1.2,
  Mars: 0.524,
  Jupiter: 0.0831,
  Saturn: 0.0335,
  Uranus: 0.0119,
  Neptune: 0.006,
  Pluto: 0.004,
};

/** Speed ratio at or below which a planet counts as near a station. */
export const NEAR_STATION_RATIO = 0.15;
/** Speed ratio at or below which a planet counts as stationary. */
export const STATIONARY_RATIO = 0.03;

export interface StationStatus {
  /** Negative longitude speed. Always false for the Sun and Moon. */
  retrograde: boolean;
  /** `speedRatio` at or below 0.03. */
  stationary: boolean;
  /** `speedRatio` at or below 0.15 (includes stationary). */
  nearStation: boolean;
  /** Absolute longitude speed divided by the planet's mean daily motion. */
  speedRatio: number;
}

/**
 * Station status from the instantaneous longitude speed (degrees per day).
 * This is a speed-based approximation of "within about two days of a station",
 * not an ephemeris search: the station dates are not computed. Returns undefined
 * for bodies without a mean motion in `MEAN_DAILY_MOTION` (nodes, Chiron,
 * lots). The Sun and Moon never station, so they are never retrograde,
 * stationary or near a station.
 */
export function getStationStatus(planet: string, longitudeSpeed: number): StationStatus | undefined {
  const key = Object.keys(MEAN_DAILY_MOTION).find((p) => p.toLowerCase() === planet.toLowerCase());
  if (key === undefined || !Number.isFinite(longitudeSpeed)) return undefined;
  const speedRatio = Math.abs(longitudeSpeed) / MEAN_DAILY_MOTION[key];
  if (key === "Sun" || key === "Moon") {
    return { retrograde: false, stationary: false, nearStation: false, speedRatio };
  }
  return {
    retrograde: longitudeSpeed < 0,
    stationary: speedRatio <= STATIONARY_RATIO,
    nearStation: speedRatio <= NEAR_STATION_RATIO,
    speedRatio,
  };
}

// ── Planetary condition ────────────────────────────────────────────────

export interface BodyCondition {
  body: string;
  sign: Sign;
  house: number;
  longitude: number;
  dispositor: string;
  dispositorChain: string[];
  dispositorEnd: DispositorEnd;
  /** Degree- and sect-aware dignities; null for bodies other than the seven traditional planets. */
  dignities: EssentialDignitiesDetail | null;
  /** In sect for this chart; null for Uranus, Neptune, Pluto and points. */
  inSect: boolean | null;
  /** In the house of its joy; null for bodies other than the seven traditional planets. */
  inJoy: boolean | null;
  /** Null for bodies without a mean motion (nodes, Chiron). */
  station: StationStatus | null;
  /** The mutual receptions this body takes part in. */
  receptions: MutualReception[];
}

export interface PlanetaryCondition {
  rulers: RulershipScheme;
  sect: Sect;
  /** Keyed by body name as in `HydratedPlanet.name` (for example `"Sun"`, `"Mean Node"`). */
  bodies: Record<string, BodyCondition>;
  finalDispositors: string[];
  loops: string[][];
  singleFinalDispositor: string | null;
  mutualReceptions: MutualReception[];
}

const TRADITIONAL_NAMES = new Set<string>(Object.keys(PLANETARY_JOYS));

/**
 * Everything this module knows about each body of a computed chart, in one call.
 * Dignities use `getEssentialDignities` with the chart's sect and exist only for
 * the seven traditional planets.
 */
export function getPlanetaryCondition(chart: BirthChart, options: MutualReceptionOptions = {}): PlanetaryCondition {
  const scheme = options.rulers ?? "traditional";
  const placements = toPlacements(chart);
  const dispositors = getDispositors(placements, { rulers: scheme });
  const mutualReceptions = getMutualReceptions(placements, options);
  const sun = Object.values(chart.planets).find((p) => p.name === "Sun");

  const bodies: Record<string, BodyCondition> = {};
  for (const planet of Object.values(chart.planets)) {
    const name = planet.name;
    const traditional = TRADITIONAL_NAMES.has(name);
    const d = dispositors.bodies[name];
    const sectStatus = getPlanetSectStatus(name, chart.sect, {
      longitude: planet.longitude,
      sunLongitude: sun?.longitude,
    });
    bodies[name] = {
      body: name,
      sign: placements[name],
      house: planet.zodiacPosition.house,
      longitude: planet.longitude,
      dispositor: d.dispositor,
      dispositorChain: d.chain,
      dispositorEnd: d.end,
      dignities: traditional
        ? getEssentialDignities(name as TraditionalPlanet, planet.longitude, chart.sect)
        : null,
      inSect: sectStatus ?? null,
      inJoy: traditional ? isInJoy(name, planet.zodiacPosition.house) : null,
      station:
        planet.longitudeSpeed === undefined ? null : (getStationStatus(name, planet.longitudeSpeed) ?? null),
      receptions: mutualReceptions.filter((r) => r.bodies.includes(name)),
    };
  }

  return {
    rulers: scheme,
    sect: chart.sect,
    bodies,
    finalDispositors: dispositors.finalDispositors,
    loops: dispositors.loops,
    singleFinalDispositor: dispositors.singleFinalDispositor,
    mutualReceptions,
  };
}
