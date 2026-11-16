import { cliText } from "../runtime/language";
import { calculateOdu } from "../../ifa";
import { isJsonMode } from "../runtime/args";
import { outputJson } from "../runtime/output";
import { parseUtcNoonDate } from "../runtime/validation";
import type { Flags } from "../runtime/types";

export function cmdIfa(dateStr: string, flags: Flags): void {
  const result = calculateOdu(parseUtcNoonDate(dateStr, flags));

  if (isJsonMode(flags)) {
    outputJson(result, flags);
    return;
  }

  console.log(cliText("\nOdu: {0}\n", [dateStr]));
  console.log(cliText("  Left:   [{0}]", [result.leftNumbers.join(", ")]));
  console.log(cliText("  Right:  [{0}]", [result.rightNumbers.join(", ")]));
  console.log(cliText("  North:  {0}", [result.north]));
  console.log(cliText("  South:  {0}", [result.south]));
  console.log(cliText("  East:   {0}", [result.east]));
  console.log(cliText("  West:   {0}", [result.west]));
  console.log(cliText("  Center: {0}", [result.center]));
  console.log();
}
