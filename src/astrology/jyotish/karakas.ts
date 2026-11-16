/**
 * Jaimini chara karakas (7- and 8-karaka schemes).
 *
 * Ranking value = degree within sign, descending: the highest degree is the
 * Atmakaraka. The frame of the degree (tropical or sidereal) is an explicit
 * input and echoed in the result. The reference dataset ranked TROPICAL
 * degrees with Rahu excluded (7 scheme); the traditional practice is sidereal.
 *
 * 8-karaka scheme: Rahu joins with ranking value `30 - degreeInSign` (it moves
 * retrograde). Mean or true node is the caller's choice and is echoed.
 *
 * Ties: bodies whose ranking values differ by no more than
 * `tieToleranceDegrees` are tied; they are ordered by the fixed canonical order
 * Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu and flagged
 * `tied: true`, with each group listed in `tieGroups`, so callers can apply their
 * own tradition (e.g. compare minutes/seconds, then nakshatra).
 */

export type KarakaBody = "sun" | "moon" | "mars" | "mercury" | "jupiter" | "venus" | "saturn" | "rahu";
export type KarakaScheme = 7 | 8;

export const KARAKA_NAMES_7 = [
  "Atmakaraka", "Amatyakaraka", "Bhratrukaraka", "Matrukaraka", "Putrakaraka", "Gnatikaraka", "Darakaraka",
] as const;
export const KARAKA_NAMES_8 = [
  "Atmakaraka", "Amatyakaraka", "Bhratrukaraka", "Matrukaraka", "Pitrukaraka", "Putrakaraka", "Gnatikaraka", "Darakaraka",
] as const;
export const KARAKA_ABBREVIATIONS_7 = ["AK", "AmK", "BK", "MK", "PK", "GK", "DK"] as const;
export const KARAKA_ABBREVIATIONS_8 = ["AK", "AmK", "BK", "MK", "PiK", "PK", "GK", "DK"] as const;

const CANONICAL_ORDER: readonly KarakaBody[] = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn", "rahu"];

export type KarakaDegreeFrame = "tropical" | "sidereal";

export interface KarakaInput {
  body: KarakaBody;
  /** Degrees within the sign in the chosen frame, [0, 30). */
  degreeInSign: number;
}

export interface KarakaEntry {
  /** 1-based rank. */
  rank: number;
  karaka: string;
  abbreviation: string;
  body: KarakaBody;
  degreeInSign: number;
  /** Value actually ranked: `degreeInSign`, or `30 - degreeInSign` for Rahu in the 8 scheme. */
  rankingValue: number;
  tied: boolean;
}

export interface KarakaOptions {
  scheme: KarakaScheme;
  /** Frame of the supplied degrees; echoed, not interpreted. */
  degreeFrame: KarakaDegreeFrame;
  /** Node used for Rahu in the 8 scheme; echoed, not interpreted. */
  node?: "mean" | "true";
  /** Default 1e-9 degrees. */
  tieToleranceDegrees?: number;
}

export interface KarakaResult {
  scheme: KarakaScheme;
  degreeFrame: KarakaDegreeFrame;
  rahuConvention?: { node: "mean" | "true"; rankingValue: "30 - degreeInSign" };
  tieToleranceDegrees: number;
  entries: KarakaEntry[];
  tieGroups: KarakaBody[][];
}

export function calculateCharaKarakas(inputs: readonly KarakaInput[], options: KarakaOptions): KarakaResult {
  const { scheme } = options;
  if (scheme !== 7 && scheme !== 8) throw new Error("karaka scheme must be 7 or 8");
  const tol = options.tieToleranceDegrees ?? 1e-9;
  const wanted = CANONICAL_ORDER.filter((b) => (scheme === 8 ? true : b !== "rahu"));
  const rows = wanted.map((body) => {
    const found = inputs.find((i) => i.body === body);
    if (!found || !Number.isFinite(found.degreeInSign)) throw new Error(`Missing degreeInSign for ${body}`);
    if (found.degreeInSign < 0 || found.degreeInSign >= 30) throw new Error(`degreeInSign out of range for ${body}`);
    const rankingValue = body === "rahu" ? 30 - found.degreeInSign : found.degreeInSign;
    return { body, degreeInSign: found.degreeInSign, rankingValue };
  });
  // Descending by value; canonical order breaks ties (Array.sort is stable).
  rows.sort((a, b) => (Math.abs(a.rankingValue - b.rankingValue) <= tol ? 0 : b.rankingValue - a.rankingValue));

  const names = scheme === 8 ? KARAKA_NAMES_8 : KARAKA_NAMES_7;
  const abbr = scheme === 8 ? KARAKA_ABBREVIATIONS_8 : KARAKA_ABBREVIATIONS_7;
  const tiedFlags = rows.map(
    (r, i) =>
      (i > 0 && Math.abs(rows[i - 1].rankingValue - r.rankingValue) <= tol) ||
      (i < rows.length - 1 && Math.abs(rows[i + 1].rankingValue - r.rankingValue) <= tol)
  );
  const tieGroups: KarakaBody[][] = [];
  rows.forEach((r, i) => {
    if (!tiedFlags[i]) return;
    if (i > 0 && tiedFlags[i - 1] && Math.abs(rows[i - 1].rankingValue - r.rankingValue) <= tol) {
      tieGroups[tieGroups.length - 1].push(r.body);
    } else {
      tieGroups.push([r.body]);
    }
  });
  return {
    scheme,
    degreeFrame: options.degreeFrame,
    ...(scheme === 8
      ? { rahuConvention: { node: options.node ?? "mean", rankingValue: "30 - degreeInSign" as const } }
      : {}),
    tieToleranceDegrees: tol,
    entries: rows.map((r, i) => ({
      rank: i + 1,
      karaka: names[i],
      abbreviation: abbr[i],
      body: r.body,
      degreeInSign: r.degreeInSign,
      rankingValue: r.rankingValue,
      tied: tiedFlags[i],
    })),
    tieGroups,
  };
}
