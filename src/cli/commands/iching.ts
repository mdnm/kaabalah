import {
  castThreeCoins,
  formatRecord,
  getHexagram,
  getHexagramKaabalah,
  getHanHexagram,
  getNuclearHexagram,
  getIChingReading,
  getSovereignHexagram,
} from "../../iching";
import type { CastInput, LinePosition } from "../../iching";
import { isJsonMode } from "../runtime/args";
import { exitWithError } from "../runtime/errors";
import { outputJson } from "../runtime/output";
import type { Flags, InputPayload } from "../runtime/types";

function integer(value: unknown): number {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value === "string" && /^\d+$/.test(value)) return Number(value);
  throw new RangeError("Expected an integer");
}
export function cmdIChing(
  command: string,
  args: string[],
  flags: Flags,
  payload: InputPayload,
): void {
  const json = isJsonMode(flags);
  let result: unknown;
  let human: string;
  try {
    if (command === "iching:cast") {
      if (args.length)
        throw new RangeError("iching:cast takes no positional arguments");
      const lines = castThreeCoins();
      result = getIChingReading(lines);
      human = json ? "" : formatRecord(lines);
    } else if (command === "iching:hexagram") {
      if (args.length > 1) throw new RangeError("Expected one hexagram number");
      const value = payload?.hexagramNumber ?? payload?.number ?? args[0];
      if (value == null)
        exitWithError(
          "MISSING_ARGUMENT",
          "Usage: kaabalah iching:hexagram <n>",
          flags,
        );
      const n = integer(value);
      result = {
        hexagram: getHexagram(n),
        han: getHanHexagram(n),
        nuclear: getNuclearHexagram(n),
        kaabalah: getHexagramKaabalah(n),
        sovereign: getSovereignHexagram(n),
      };
      human = json ? "" : formatRecord({ hexagramNumber: n });
    } else {
      if (args.length)
        throw new RangeError("Use --lines or --hexagram with --moving");
      const lines = payload?.lines ?? flags.lines;
      const number = payload?.hexagramNumber ?? flags.hexagram;
      const moving = payload?.movingLines ?? flags.moving;
      if (lines != null && (number != null || moving != null))
        throw new RangeError(
          "Use either lines or hexagramNumber with movingLines, not both",
        );
      if (lines == null && number == null)
        exitWithError(
          "MISSING_ARGUMENT",
          "Usage: kaabalah iching:reading --lines 879777 (or --hexagram 25 --moving 4)",
          flags,
        );
      let input: CastInput;
      if (lines != null) {
        if (typeof lines !== "string" && !Array.isArray(lines))
          throw new RangeError("lines must be a string or a six-number array");
        // The library owns strict runtime validation of line values.
        input = lines as CastInput;
      } else {
        let movingLines: LinePosition[] = [];
        if (moving != null) {
          if (typeof moving === "string" && /^[1-6](,[1-6])*$/.test(moving))
            movingLines = moving.split(",").map(Number) as LinePosition[];
          else if (
            Array.isArray(moving) &&
            moving.every((v) => typeof v === "number")
          )
            movingLines = moving as LinePosition[];
          else
            throw new RangeError(
              "Moving lines must be an array of positions or a comma-separated list, e.g. --moving 2,4",
            );
        }
        input = { hexagramNumber: integer(number), movingLines };
      }
      result = getIChingReading(input);
      human = json ? "" : formatRecord(input);
    }
  } catch (err) {
    if (!(err instanceof RangeError)) throw err;
    exitWithError("INVALID_ARGUMENT", err.message, flags);
  }
  if (isJsonMode(flags)) outputJson(result, flags);
  else console.log(human);
}
