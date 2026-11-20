/**
 * Sign ingresses with their classical lead windows.
 *
 * A Jyotish rule on the planets' change of signs says a planet starts giving the
 * effect of the next sign some time before it enters it (`INGRESS_LEAD_TIMES`).
 * `findIngressWindows` returns every exact sign ingress whose lead window overlaps
 * the requested range, including an ingress that falls after `end` when its window
 * has already begun inside the range.
 *
 * Signs are tropical, as everywhere else in the library's sign-change code (the
 * library's Jyotish keeps tropical rasis independent of the nakshatra frame).
 * Ingresses are the exact crossings of the twelve sign boundaries, found with the
 * shared longitude crossing solver (./returns, ./root-solver).
 *
 * Synchronous; requires an initialised Swiss Ephemeris (`await getSwissEph(...)`).
 * Instants are UTC; the time coordinate is the UT Julian Day. The search is the
 * solver's finite-grid search (see `ROOT_SEARCH_COVERAGE_NOTE`).
 */

import { TimelineError } from "./firdaria";
import { SIGNS } from "./index";
import {
  createBodyLongitudeFunctions,
  findBodyLongitudeCrossingsWith,
  ROOT_SOLVER_METHOD,
  type RootSolverMethodMetadata,
} from "./returns";
import { dateToJd, jdToDate } from "./root-solver";
import { Planet, PLANET_AND_NODE_NAMES } from "./swisseph";

/** One ghati is a sixtieth of a day: 24 minutes. */
export const GHATI_MINUTES = 24;
/** Length given to a month of the source when a lead time is turned into days. */
export const INGRESS_MONTH_DAYS = 30;

export type IngressLeadUnit = "days" | "ghatis" | "months";
export type IngressLeadBody = "sun" | "moon" | "mars" | "mercury" | "jupiter" | "venus" | "saturn" | "rahu";

export interface IngressLeadTime {
  /** The figure as the source gives it. */
  amount: number;
  unit: IngressLeadUnit;
  /** The same span in days: a ghati is 24 minutes, a month is 30 days. */
  days: number;
}

const lead = (amount: number, unit: IngressLeadUnit): IngressLeadTime =>
  Object.freeze({
    amount,
    unit,
    days: unit === "days" ? amount : unit === "months" ? amount * INGRESS_MONTH_DAYS : (amount * GHATI_MINUTES) / 1440,
  });

/**
 * How long before a sign ingress a planet starts giving the effect of the next sign.
 *
 * Source: Muhurta Chintamani (Rama Daivajna), on the planets' change of signs:
 * Sun 5 days, Mars 8 days, Mercury 7 days, Venus 7 days, Moon 3 ghatis (72 minutes),
 * Rahu 3 months, Saturn 6 months, Jupiter 2 months. The source gives no figure for
 * Uranus, Neptune, Pluto or any other body. Ketu is not listed on its own: it sits
 * opposite Rahu and changes sign at the same instant, so it shares Rahu's figure.
 */
export const INGRESS_LEAD_TIMES: Readonly<Record<IngressLeadBody, IngressLeadTime>> = Object.freeze({
  sun: lead(5, "days"),
  moon: lead(3, "ghatis"),
  mars: lead(8, "days"),
  mercury: lead(7, "days"),
  jupiter: lead(2, "months"),
  venus: lead(7, "days"),
  saturn: lead(6, "months"),
  rahu: lead(3, "months"),
});

/** Stable id of the point that changes sign (the library's point ids). */
export type IngressPointId =
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
  | "mean-node"
  | "true-node"
  | "south-node-mean"
  | "south-node-true"
  | "mean-lilith"
  | "true-lilith"
  | "chiron";

interface BodyDefinition {
  id: IngressPointId;
  leadBody: IngressLeadBody | null;
  /** The opposite point, emitted alongside a lunar node. */
  south?: { id: IngressPointId; name: string };
}

const BODY_DEFINITIONS: Readonly<Partial<Record<Planet, BodyDefinition>>> = {
  [Planet.SUN]: { id: "sun", leadBody: "sun" },
  [Planet.MOON]: { id: "moon", leadBody: "moon" },
  [Planet.MERCURY]: { id: "mercury", leadBody: "mercury" },
  [Planet.VENUS]: { id: "venus", leadBody: "venus" },
  [Planet.MARS]: { id: "mars", leadBody: "mars" },
  [Planet.JUPITER]: { id: "jupiter", leadBody: "jupiter" },
  [Planet.SATURN]: { id: "saturn", leadBody: "saturn" },
  [Planet.URANUS]: { id: "uranus", leadBody: null },
  [Planet.NEPTUNE]: { id: "neptune", leadBody: null },
  [Planet.PLUTO]: { id: "pluto", leadBody: null },
  [Planet.MEAN_NODE]: { id: "mean-node", leadBody: "rahu", south: { id: "south-node-mean", name: "South Node Mean" } },
  [Planet.TRUE_NODE]: { id: "true-node", leadBody: "rahu", south: { id: "south-node-true", name: "South Node True" } },
  [Planet.LILITH_MEAN]: { id: "mean-lilith", leadBody: null },
  [Planet.LILITH_TRUE]: { id: "true-lilith", leadBody: null },
  [Planet.CHIRON]: { id: "chiron", leadBody: null },
};

/**
 * Bodies searched when none are named: the Sun through Pluto and the mean lunar node
 * (Rahu; the mean node is the library's default node), with Ketu mirrored from it.
 */
export const DEFAULT_INGRESS_BODIES = [
  Planet.SUN,
  Planet.MOON,
  Planet.MERCURY,
  Planet.VENUS,
  Planet.MARS,
  Planet.JUPITER,
  Planet.SATURN,
  Planet.URANUS,
  Planet.NEPTUNE,
  Planet.PLUTO,
  Planet.MEAN_NODE,
] as const;

/** Longest range accepted by `findIngressWindows` (years). */
export const MAX_INGRESS_WINDOW_YEARS = 150;

export interface IngressWindow {
  /** Point that changes sign. A south node entry mirrors its north node. */
  id: IngressPointId;
  /** Ephemeris body the crossing was computed for (the north node for a south node entry). */
  body: Planet;
  bodyName: string;
  fromSign: (typeof SIGNS)[number];
  toSign: (typeof SIGNS)[number];
  /**
   * Motion of the body at the crossing. "direct" enters the next sign in zodiacal order,
   * "retrograde" re-enters the previous one. The mean node is always retrograde.
   */
  direction: "direct" | "retrograde";
  /** Exact ingress as UT Julian Day. */
  jd: number;
  /** Exact ingress (UTC, millisecond rounded). */
  instant: Date;
  /** Tropical longitude of the sign boundary crossed by `id`, degrees (0, 30, ... 330). */
  boundaryLongitude: number;
  /** Solver residual at the emitted instant, degrees. */
  residualDegrees: number;
  /** Lead time of the source for this body, or null when the source gives none. */
  leadTime: IngressLeadTime | null;
  /** `instant` minus the lead time, as UT Julian Day; null without a lead time. */
  windowStartJd: number | null;
  /** `instant` minus the lead time (UTC); null without a lead time. */
  windowStart: Date | null;
  /** The lead window had already begun at the range `start` (the ingress itself is at or after `start`). */
  windowOpenAtStart: boolean;
  /** The exact ingress falls inside [start, end]. False: only its lead window reaches into the range. */
  ingressInRange: boolean;
}

export interface IngressWindowsMethodMetadata {
  source: "Muhurta Chintamani (Rama Daivajna), on the planets' change of signs";
  zodiac: "tropical";
  quantity: "geocentric apparent tropical ecliptic longitude of date";
  months: "30 days per month";
  ghati: "24 minutes (a sixtieth of a day)";
  nodes: "Rahu is the lunar north node (mean node unless the true node is requested); Ketu is its opposite point, with the same instant and lead time and the opposite signs";
  retrograde: "every crossing of a sign boundary is returned with its direction; the lead time is subtracted from a retrograde crossing in the same way as from a direct one";
  withoutLeadTime: "bodies the source does not list are returned with the exact ingress and a null window start";
  selection: "an ingress is returned when it is at or after `start` and its window start (the ingress itself without a lead time) is at or before `end`";
  order: "by exact ingress instant";
  solver: RootSolverMethodMetadata;
}

export const INGRESS_WINDOWS_METHOD: IngressWindowsMethodMetadata = {
  source: "Muhurta Chintamani (Rama Daivajna), on the planets' change of signs",
  zodiac: "tropical",
  quantity: "geocentric apparent tropical ecliptic longitude of date",
  months: "30 days per month",
  ghati: "24 minutes (a sixtieth of a day)",
  nodes: "Rahu is the lunar north node (mean node unless the true node is requested); Ketu is its opposite point, with the same instant and lead time and the opposite signs",
  retrograde: "every crossing of a sign boundary is returned with its direction; the lead time is subtracted from a retrograde crossing in the same way as from a direct one",
  withoutLeadTime: "bodies the source does not list are returned with the exact ingress and a null window start",
  selection: "an ingress is returned when it is at or after `start` and its window start (the ingress itself without a lead time) is at or before `end`",
  order: "by exact ingress instant",
  solver: ROOT_SOLVER_METHOD,
};

export interface FindIngressWindowsOptions {
  /** Bodies to search. Default `DEFAULT_INGRESS_BODIES`. */
  bodies?: readonly Planet[];
  /** Range (inclusive). Dates are absolute UTC instants; `end` may equal `start`. */
  start: Date;
  end: Date;
  /** Emit the south node (Ketu) alongside each lunar node. Default true. */
  southNode?: boolean;
  /** Final bracket width in seconds (default 0.001). */
  timeToleranceSeconds?: number;
}

export interface IngressWindowsBodySummary {
  body: Planet;
  bodyName: string;
  leadTime: IngressLeadTime | null;
  /** End of the search for this body: `end` plus its lead time. */
  searchedUntil: Date;
}

export interface IngressWindowsResult {
  start: Date;
  end: Date;
  /** Ingresses whose lead window overlaps the range, ordered by exact ingress instant. */
  windows: IngressWindow[];
  /** One entry per requested body, in request order. */
  bodies: IngressWindowsBodySummary[];
  method: IngressWindowsMethodMetadata;
}

const MS_PER_DAY = 86_400_000;
/** The Moon covers a sign in about 2.3 days; half-day steps, as the lunar return search uses. */
const MOON_STEP_DAYS = 0.5;

/** Lead time of the source for an ephemeris body, or null when the source gives none. */
export function getIngressLeadTime(body: Planet): IngressLeadTime | null {
  const leadBody = BODY_DEFINITIONS[body]?.leadBody;
  return leadBody ? INGRESS_LEAD_TIMES[leadBody] : null;
}

/**
 * Sign ingresses of the requested bodies whose lead window overlaps [start, end], with the
 * instant each window begins. Each body is searched up to `end` plus its own lead time, so a
 * slow planet's ingress after `end` is returned when its window is already open in the range.
 */
export function findIngressWindows(options: FindIngressWindowsOptions): IngressWindowsResult {
  const { start, end } = options;
  if (!(start instanceof Date) || !(end instanceof Date) || !Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
    throw new TimelineError("UNBOUNDED_INPUT", "finite `start` and `end` dates are required");
  }
  if (end.getTime() < start.getTime()) throw new TimelineError("INVALID_RANGE", "`end` must not be before `start`");
  const years = (end.getTime() - start.getTime()) / (365.25 * MS_PER_DAY);
  if (years > MAX_INGRESS_WINDOW_YEARS) {
    throw new TimelineError("RANGE_TOO_LARGE", `range of ${years.toFixed(1)} years exceeds ${MAX_INGRESS_WINDOW_YEARS}`);
  }
  const bodies = [...new Set(options.bodies ?? DEFAULT_INGRESS_BODIES)];
  if (bodies.length === 0) throw new TimelineError("INVALID_INPUT", "`bodies` must name at least one body");
  for (const body of bodies) {
    if (!BODY_DEFINITIONS[body]) {
      throw new TimelineError("INVALID_INPUT", `body "${PLANET_AND_NODE_NAMES[body] ?? String(body)}" is not supported`);
    }
  }
  const southNode = options.southNode !== false;
  const startJd = dateToJd(start);
  const endJd = dateToJd(end);

  const windows: IngressWindow[] = [];
  const summaries: IngressWindowsBodySummary[] = [];

  for (const body of bodies) {
    const definition = BODY_DEFINITIONS[body] as BodyDefinition;
    const name = PLANET_AND_NODE_NAMES[body];
    const leadTime = getIngressLeadTime(body);
    const leadDays = leadTime?.days ?? 0;
    const searchedUntil = jdToDate(endJd + leadDays);
    summaries.push({ body, bodyName: name, leadTime, searchedUntil });

    const fns = createBodyLongitudeFunctions(body);
    for (let boundary = 0; boundary < 12; boundary++) {
      const result = findBodyLongitudeCrossingsWith(fns, {
        body,
        targetLongitude: boundary * 30,
        from: start,
        to: searchedUntil,
        stepDays: body === Planet.MOON ? MOON_STEP_DAYS : 1,
        timeToleranceSeconds: options.timeToleranceSeconds,
      });
      for (const crossing of result.crossings) {
        // A station exactly on a boundary touches it without changing sign.
        if (crossing.tangent || crossing.speedDegreesPerDay === 0) continue;
        const direct = crossing.speedDegreesPerDay > 0;
        const below = (boundary + 11) % 12;
        const from = direct ? below : boundary;
        const to = direct ? boundary : below;
        const windowStartJd = leadTime ? crossing.jd - leadTime.days : null;
        // Selection: the ingress is at or after `start` (guaranteed by the search) and its window begins by `end`.
        if ((windowStartJd ?? crossing.jd) > endJd) continue;
        const shared = {
          body,
          direction: direct ? ("direct" as const) : ("retrograde" as const),
          jd: crossing.jd,
          instant: crossing.instant,
          residualDegrees: crossing.residualDegrees,
          leadTime,
          windowStartJd,
          windowStart: windowStartJd === null ? null : jdToDate(windowStartJd),
          windowOpenAtStart: windowStartJd !== null && windowStartJd <= startJd,
          ingressInRange: crossing.jd <= endJd,
        };
        windows.push({
          id: definition.id,
          bodyName: name,
          fromSign: SIGNS[from],
          toSign: SIGNS[to],
          boundaryLongitude: boundary * 30,
          ...shared,
        });
        if (definition.south && southNode) {
          windows.push({
            id: definition.south.id,
            bodyName: definition.south.name,
            fromSign: SIGNS[(from + 6) % 12],
            toSign: SIGNS[(to + 6) % 12],
            boundaryLongitude: ((boundary + 6) % 12) * 30,
            ...shared,
          });
        }
      }
    }
  }

  const requestOrder = new Map(bodies.map((body, index) => [body, index]));
  windows.sort(
    (a, b) =>
      a.jd - b.jd ||
      (requestOrder.get(a.body) as number) - (requestOrder.get(b.body) as number) ||
      Number(a.id.startsWith("south")) - Number(b.id.startsWith("south"))
  );

  return { start, end, windows, bodies: summaries, method: INGRESS_WINDOWS_METHOD };
}
