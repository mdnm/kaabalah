import { cliText } from "../runtime/language";
import {
  castThreeCoins,
  formatRecordContent,
  getIChingReadingContent,
  getHexagram,
  getHexagramText,
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
  throw new RangeError(cliText("Expected an integer"));
}
export function cmdIChing(
  command: string,
  args: string[],
  flags: Flags,
  payload: InputPayload,
): void {
  const json = isJsonMode(flags);
  const language = typeof flags.language === "string" ? flags.language : undefined;
  const reading = (input: CastInput) => language?.startsWith("pt") ? getIChingReadingContent(input, language) : getIChingReading(input);
  let result: unknown;
  let human: string;
  try {
    if (command === "iching:cast") {
      if (args.length)
        throw new RangeError(cliText("iching:cast takes no positional arguments"));
      const lines = castThreeCoins();
      result = reading(lines);
      human = json ? "" : formatRecordContent(lines, language);
    } else if (command === "iching:hexagram") {
      if (args.length > 1) throw new RangeError(cliText("Expected one hexagram number"));
      const value = payload?.hexagramNumber ?? payload?.number ?? args[0];
      if (value == null)
        exitWithError(
          "MISSING_ARGUMENT",
          cliText("Usage: kaabalah iching:hexagram <n>"),
          flags,
        );
      const n = integer(value);
      result = {
        hexagram: language?.startsWith("pt") ? { ...getHexagram(n), text: getHexagramText(n, language)! } : getHexagram(n),
        han: getHanHexagram(n),
        nuclear: getNuclearHexagram(n),
        kaabalah: getHexagramKaabalah(n),
        sovereign: getSovereignHexagram(n),
      };
      human = json ? "" : formatRecordContent({ hexagramNumber: n }, language);
    } else {
      if (args.length)
        throw new RangeError(cliText("Use --lines or --hexagram with --moving"));
      const lines = payload?.lines ?? flags.lines;
      const number = payload?.hexagramNumber ?? flags.hexagram;
      const moving = payload?.movingLines ?? flags.moving;
      if (lines != null && (number != null || moving != null))
        throw new RangeError(
          cliText("Use either lines or hexagramNumber with movingLines, not both"),
        );
      if (lines == null && number == null)
        exitWithError(
          "MISSING_ARGUMENT",
          cliText("Usage: kaabalah iching:reading --lines 879777 (or --hexagram 25 --moving 4)"),
          flags,
        );
      let input: CastInput;
      if (lines != null) {
        if (typeof lines !== "string" && !Array.isArray(lines))
          throw new RangeError(cliText("lines must be a string or a six-number array"));
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
              cliText("Moving lines must be an array of positions or a comma-separated list, e.g. --moving 2,4"),
            );
        }
        input = { hexagramNumber: integer(number), movingLines };
      }
      result = reading(input);
      human = json ? "" : formatRecordContent(input, language);
    }
  } catch (err) {
    if (!(err instanceof RangeError)) throw err;
    exitWithError("INVALID_ARGUMENT", err.message, flags);
  }
  if (isJsonMode(flags)) outputJson(result, flags);
  else console.log(human);
}
