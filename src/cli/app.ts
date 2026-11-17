import { withCliLanguage, cliLanguageFromArgv } from "./runtime/language";
import { cliText } from "./runtime/language";
import { VERSION } from "./contract";
import { cmdAstrologyChart } from "./commands/astrology-chart";
import {
  cmdAstrologyCollection,
  cmdAstrologyDavison,
  cmdAstrologyFirdariaTimeline,
  cmdAstrologyJyotish,
  cmdAstrologyOverlays,
  cmdAstrologyProfectionsTimeline,
  cmdAstrologyProgressions,
  cmdAstrologyReturns,
  cmdAstrologySolarArc,
  cmdCapabilities,
} from "./commands/astrology-extra";
import {
  cmdNumerologyHeptads,
  cmdNumerologyLifeStages,
  cmdNumerologyPartial,
  cmdNumerologyPersonalCycles,
  cmdNumerologySnapshot,
  cmdNumerologyTimeline,
} from "./commands/numerology-schedule";
import { MAX_MANIFEST_BYTES } from "./runtime/stdin";
import { cmdAstrologyAstrocartography, cmdAstrologyAstrocartographyQuery, cmdAstrologyComposite, cmdAstrologyDecans, cmdAstrologyDodecatemoria, cmdAstrologyFirdaria, cmdAstrologyProfections, cmdAstrologyProfectionsMonthly, cmdAstrologySolarReturn, cmdAstrologySynastry, cmdAstrologyTransits, cmdAstrologyWheel } from "./commands/astrology";
import { cmdAstrologyDescribe } from "./commands/astrology-describe";
import { cmdGematria, cmdReverseGematria } from "./commands/gematria";
import { cmdHelp } from "./commands/help";
import { cmdIChing } from "./commands/iching";
import { cmdIfa } from "./commands/ifa";
import { cmdChallenges, cmdCycles, cmdFibonacci, cmdLifePath, cmdNumerology } from "./commands/numerology";
import { cmdTarot, cmdTarotCard, cmdTarotSpread } from "./commands/tarot";
import {
  cmdTree,
  cmdTreeAscii,
  cmdTreeFind,
  cmdTreeLayout,
  cmdTreeNode,
  cmdTreeSvg,
  cmdTreeTopology,
  cmdTreeTypes,
} from "./commands/tree";
import { getFlagBool, isCliParseError, isJsonMode, parseArgs } from "./runtime/args";
import { isCliConfigError, resolveRuntimeConfig } from "./runtime/config";
import { configureDebugRuntime } from "./runtime/debug";
import { exitWithError } from "./runtime/errors";
import { createExecutionContext } from "./runtime/execution";
import { parseInputJson, trimTrailingLineBreaks } from "./runtime/input";
import { outputJson } from "./runtime/output";
import { configureQuietRuntime } from "./runtime/quiet";
import { hasStdinSource, readStdin } from "./runtime/stdin";
import type { Flags, InputPayload } from "./runtime/types";

function outputVersion(flags: ReturnType<typeof parseArgs>["flags"]): void {
  if (isJsonMode(flags)) {
    outputJson({ version: VERSION }, flags);
  } else {
    console.log(`kaabalah v${VERSION}`);
  }
}

async function resolveGematriaText(
  args: string[],
  flags: Flags,
  inputPayload: InputPayload
): Promise<string | null> {
  if (typeof inputPayload?.text === "string" && inputPayload.text.length > 0) {
    return inputPayload.text;
  }

  if (inputPayload?.text != null && typeof inputPayload.text !== "string") {
    exitWithError("INVALID_ARGUMENT", cliText("\"text\" must be a string in --input-json."), flags);
  }

  const argText = args.length > 0 ? args.join(" ") : "";
  if (argText.length > 0) {
    return argText;
  }

  if (!hasStdinSource()) {
    return null;
  }

  const stdinText = trimTrailingLineBreaks(
    await readStdin(flags, {
      emptyCode: "MISSING_ARGUMENT",
      emptyMessage: cliText("Usage: kaabalah gematria <text>"),
    })
  );

  return stdinText.length > 0 ? stdinText : null;
}

export function runCli(argv: string[]): Promise<void> {
  return withCliLanguage(cliLanguageFromArgv(argv), () => runCliInLanguage(argv));
}

async function runCliInLanguage(argv: string[]): Promise<void> {
  let parsedArgs: ReturnType<typeof parseArgs>;
  try {
    parsedArgs = parseArgs(argv);
  } catch (err) {
    if (isCliParseError(err)) {
      try {
        const resolved = resolveRuntimeConfig(err.flags);
        configureQuietRuntime(resolved.flags);
        exitWithError("INVALID_ARGUMENT", err.message, resolved.flags);
      } catch (configErr) {
        if (isCliConfigError(configErr)) {
          configureQuietRuntime(err.flags);
          exitWithError(configErr.code, configErr.message, err.flags);
        }
        throw configErr;
      }
    }
    throw err;
  }

  const { args } = parsedArgs;
  let flags = parsedArgs.flags;
  try {
    flags = resolveRuntimeConfig(flags).flags;
    configureQuietRuntime(flags);
  } catch (err) {
    if (isCliConfigError(err)) {
      configureQuietRuntime(flags);
      exitWithError(err.code, err.message, flags);
    }
    throw err;
  }

  configureDebugRuntime(flags);

  if (getFlagBool(flags, "version")) {
    outputVersion(flags);
    return;
  }

  if (args.length === 0) {
    cmdHelp([], flags);
    return;
  }

  const command = args[0];
  if (getFlagBool(flags, "help") && command !== "help") {
    cmdHelp([command], flags);
    return;
  }

  const execution = createExecutionContext();

  try {
    const inputPayload = await parseInputJson(flags, {
      maxStdinBytes: command === "astrology:collection" ? MAX_MANIFEST_BYTES : undefined,
    });

    switch (command) {
      case "help":
        cmdHelp(args.slice(1), flags);
        return;
      case "gematria": {
        const text = await resolveGematriaText(args.slice(1), flags, inputPayload);
        if (!text) {
          exitWithError("MISSING_ARGUMENT", cliText("Usage: kaabalah gematria <text>"), flags);
        }
        await cmdGematria(text, flags);
        return;
      }
      case "gematria:reverse":
        if (!args[1] && inputPayload?.targetSynthesis == null) {
          exitWithError("MISSING_ARGUMENT", cliText("Usage: kaabalah gematria:reverse <target-number>"), flags);
        }
        cmdReverseGematria(args[1] ?? String(inputPayload?.targetSynthesis ?? ""), flags, inputPayload);
        return;
      case "numerology":
        if (!args[1] && !inputPayload?.date) {
          exitWithError("MISSING_ARGUMENT", cliText("Usage: kaabalah numerology <YYYY-MM-DD>"), flags);
        }
        cmdNumerology((inputPayload?.date as string) ?? args[1], flags, inputPayload);
        return;
      case "numerology:lifepath":
        if (!args[1] && !inputPayload?.date) {
          exitWithError("MISSING_ARGUMENT", cliText("Usage: kaabalah numerology:lifepath <YYYY-MM-DD>"), flags);
        }
        cmdLifePath((inputPayload?.date as string) ?? args[1], flags);
        return;
      case "numerology:cycles":
        if (!args[1] && !inputPayload?.date) {
          exitWithError("MISSING_ARGUMENT", cliText("Usage: kaabalah numerology:cycles <YYYY-MM-DD> [firstName]"), flags);
        }
        cmdCycles((inputPayload?.date as string) ?? args[1], (inputPayload?.firstName as string) ?? args[2], flags, inputPayload);
        return;
      case "numerology:challenges":
        if (!args[1] && !inputPayload?.date) {
          exitWithError("MISSING_ARGUMENT", cliText("Usage: kaabalah numerology:challenges <YYYY-MM-DD>"), flags);
        }
        cmdChallenges((inputPayload?.date as string) ?? args[1], flags);
        return;
      case "numerology:fibonacci":
        if (!args[1] && !inputPayload?.date) {
          exitWithError("MISSING_ARGUMENT", cliText("Usage: kaabalah numerology:fibonacci <YYYY-MM-DD>"), flags);
        }
        cmdFibonacci((inputPayload?.date as string) ?? args[1], flags, inputPayload);
        return;
      case "numerology:snapshot":
        cmdNumerologySnapshot(args.slice(1), flags, inputPayload);
        return;
      case "numerology:timeline":
        cmdNumerologyTimeline(args.slice(1), flags, inputPayload);
        return;
      case "numerology:heptads":
        cmdNumerologyHeptads(args.slice(1), flags, inputPayload);
        return;
      case "numerology:personal-cycles":
        cmdNumerologyPersonalCycles(args.slice(1), flags, inputPayload);
        return;
      case "numerology:life-stages":
        cmdNumerologyLifeStages(args.slice(1), flags, inputPayload);
        return;
      case "numerology:partial":
        cmdNumerologyPartial(args.slice(1), flags, inputPayload);
        return;
      case "tarot":
        await cmdTarot((inputPayload?.count as string) ?? args[1], flags);
        return;
      case "tarot:card": {
        const shouldListDecks = flags.decks === true;
        if (!args[1] && inputPayload?.query == null && !shouldListDecks) {
          exitWithError("MISSING_ARGUMENT", cliText("Usage: kaabalah tarot:card <query>"), flags);
        }
        cmdTarotCard((inputPayload?.query != null ? String(inputPayload.query) : undefined) ?? args.slice(1).join(" "), flags);
        return;
      }
      case "tarot:spread": {
        const spreadId = inputPayload?.spreadId != null ? String(inputPayload.spreadId) : undefined;
        const hasSpreadIdFlag = typeof flags["spread-id"] === "string" && flags["spread-id"].length > 0;
        const shouldListSpreads = flags.list === true;
        const cardQueries = Array.isArray(inputPayload?.cards) ? inputPayload.cards.map(String) : args.slice(1);
        if (cardQueries.length === 0 && !hasSpreadIdFlag && !spreadId && !shouldListSpreads) {
          exitWithError("MISSING_ARGUMENT", cliText("Usage: kaabalah tarot:spread <card1> [card2] ..."), flags);
        }
        await cmdTarotSpread(cardQueries, flags, {
          spreadId,
          context: inputPayload?.context,
        });
        return;
      }
      case "iching:cast":
      case "iching:hexagram":
      case "iching:reading":
        cmdIChing(command, args.slice(1), flags, inputPayload);
        return;
      case "ifa":
        if (!args[1] && !inputPayload?.date) {
          exitWithError("MISSING_ARGUMENT", cliText("Usage: kaabalah ifa <YYYY-MM-DD>"), flags);
        }
        cmdIfa((inputPayload?.date as string) ?? args[1], flags);
        return;
      case "tree":
        cmdTree(flags);
        return;
      case "tree:node":
        if (!args[1] && !inputPayload?.id) {
          exitWithError("MISSING_ARGUMENT", cliText("Usage: kaabalah tree:node <id> (e.g. tree:node path:1, tree:node \"tarotArkAnnu:The Magician\")"), flags);
        }
        cmdTreeNode((inputPayload?.id as string) ?? args.slice(1).join(" "), flags);
        return;
      case "tree:find":
        cmdTreeFind(
          (inputPayload?.query as string | undefined) ??
            (args.slice(1).join(" ") || undefined),
          flags
        );
        return;
      case "tree:types":
        cmdTreeTypes(flags);
        return;
      case "tree:layout":
        cmdTreeLayout(flags);
        return;
      case "tree:topology":
        cmdTreeTopology(flags);
        return;
      case "tree:svg":
        cmdTreeSvg(flags);
        return;
      case "tree:ascii":
        cmdTreeAscii(flags);
        return;
      case "astrology":
        await cmdAstrologyChart(args.slice(1), flags, inputPayload, execution);
        return;
      case "astrology:wheel":
        await cmdAstrologyWheel(args.slice(1), flags, inputPayload, execution);
        return;
      case "astrology:synastry":
        await cmdAstrologySynastry(flags, inputPayload, execution);
        return;
      case "astrology:composite":
        await cmdAstrologyComposite(flags, inputPayload, execution);
        return;
      case "astrology:transits":
        await cmdAstrologyTransits(args.slice(1), flags, inputPayload, execution);
        return;
      case "astrology:solar-return":
        await cmdAstrologySolarReturn(args.slice(1), flags, inputPayload, execution);
        return;
      case "astrology:profections":
        await cmdAstrologyProfections(args.slice(1), flags, inputPayload, execution);
        return;
      case "astrology:profections:monthly":
        await cmdAstrologyProfectionsMonthly(args.slice(1), flags, inputPayload, execution);
        return;
      case "astrology:firdaria":
        await cmdAstrologyFirdaria(args.slice(1), flags, inputPayload, execution);
        return;
      case "astrology:astrocartography":
        await cmdAstrologyAstrocartography(args.slice(1), flags, inputPayload, execution);
        return;
      case "astrology:astrocartography:query":
        await cmdAstrologyAstrocartographyQuery(args.slice(1), flags, inputPayload, execution);
        return;
      case "astrology:decans":
        cmdAstrologyDecans(args.slice(1), flags, inputPayload);
        return;
      case "astrology:describe":
        cmdAstrologyDescribe(args.slice(1), flags, inputPayload);
        return;
      case "astrology:dodecatemoria":
        cmdAstrologyDodecatemoria(args.slice(1), flags, inputPayload);
        return;
      case "astrology:davison":
        await cmdAstrologyDavison(flags, inputPayload, execution);
        return;
      case "astrology:overlays":
        await cmdAstrologyOverlays(flags, inputPayload, execution);
        return;
      case "astrology:progressions":
        await cmdAstrologyProgressions(args.slice(1), flags, inputPayload, execution);
        return;
      case "astrology:solar-arc":
        await cmdAstrologySolarArc(args.slice(1), flags, inputPayload, execution);
        return;
      case "astrology:returns":
        await cmdAstrologyReturns(args.slice(1), flags, inputPayload, execution);
        return;
      case "astrology:profections:timeline":
        await cmdAstrologyProfectionsTimeline(args.slice(1), flags, inputPayload, execution);
        return;
      case "astrology:firdaria:timeline":
        await cmdAstrologyFirdariaTimeline(args.slice(1), flags, inputPayload, execution);
        return;
      case "astrology:jyotish":
        await cmdAstrologyJyotish(args.slice(1), flags, inputPayload, execution);
        return;
      case "astrology:collection":
        await cmdAstrologyCollection(flags, inputPayload, execution);
        return;
      case "capabilities":
        await cmdCapabilities(flags, execution);
        return;
      default:
        exitWithError("UNKNOWN_COMMAND", cliText("Unknown command: \"{0}\". Run \"kaabalah help\" for usage.", [command]), flags);
    }
  } finally {
    execution.dispose();
  }
}
