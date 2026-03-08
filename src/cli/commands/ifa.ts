import { calculateOdu } from "../../ifa";
import { isJsonMode } from "../runtime/args";
import { outputJson } from "../runtime/output";
import { parseDate } from "../runtime/validation";
import type { Flags } from "../runtime/types";

export function cmdIfa(dateStr: string, flags: Flags): void {
  const result = calculateOdu(parseDate(dateStr, flags));

  if (isJsonMode(flags)) {
    outputJson(result, flags);
    return;
  }

  console.log(`\nOdu: ${dateStr}\n`);
  console.log(`  Left:   [${result.leftNumbers.join(", ")}]`);
  console.log(`  Right:  [${result.rightNumbers.join(", ")}]`);
  console.log(`  North:  ${result.north}`);
  console.log(`  South:  ${result.south}`);
  console.log(`  East:   ${result.east}`);
  console.log(`  West:   ${result.west}`);
  console.log(`  Center: ${result.center}`);
  console.log();
}
