import { getHexagram } from "./calculations";

/** 十二辟卦. Lunar month numbers and month branches are fixed correspondences.
 * Gregorian windows are fixed approximate solar-month ranges;
 * they are not computed solar terms or guaqi day placements.
 */
const rows = [
  [24, 11, "子", [12, 7], [1, 5]],
  [19, 12, "丑", [1, 6], [2, 3]],
  [11, 1, "寅", [2, 4], [3, 5]],
  [34, 2, "卯", [3, 6], [4, 4]],
  [43, 3, "辰", [4, 5], [5, 5]],
  [1, 4, "巳", [5, 6], [6, 5]],
  [44, 5, "午", [6, 6], [7, 6]],
  [33, 6, "未", [7, 7], [8, 7]],
  [12, 7, "申", [8, 8], [9, 7]],
  [20, 8, "酉", [9, 8], [10, 7]],
  [23, 9, "戌", [10, 8], [11, 6]],
  [2, 10, "亥", [11, 7], [12, 6]],
] as const;
export const SOVEREIGN_HEXAGRAMS = Object.freeze(
  rows.map(([hexagramNumber, lunarMonth, branch, start, end]) =>
    Object.freeze({
      hexagramNumber,
      lunarMonth,
      branch,
      approximateSolarWindow: Object.freeze({
        start: Object.freeze({ month: start[0], day: start[1] }),
        end: Object.freeze({ month: end[0], day: end[1] }),
      }),
    }),
  ),
);
export function getSovereignHexagram(number: number) {
  getHexagram(number);
  return SOVEREIGN_HEXAGRAMS.find((s) => s.hexagramNumber === number) ?? null;
}
