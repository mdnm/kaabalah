import { AsyncLocalStorage } from "node:async_hooks";
import raw from "../texts.json";
import { freezeTextData } from "../../localization";

const languages = new AsyncLocalStorage<string>();
export const CLI_TEXTS: Readonly<Record<string, Readonly<{ en: string; pt: string }>>> = freezeTextData(raw);

export function currentCliLanguage(): string | undefined {
  return languages.getStore();
}

export function withCliLanguage<T>(language: string | undefined, run: () => T): T {
  return languages.run(language ?? "en", run);
}

/** Select a CLI message without changing interpolation values, flags, paths or error codes. */
export function cliText(english: string, values: readonly unknown[] = [], language = currentCliLanguage()): string {
  const pattern = language?.startsWith("pt") ? CLI_TEXTS[english]?.pt ?? english : english;
  if (values.length === 0) return pattern;
  return pattern.replace(/\{(\d+)\}/g, (_, index: string) => String(values[Number(index)]));
}

const renderedPatterns = Object.values(CLI_TEXTS)
  .filter(row => /\{\d+\}/.test(row.en))
  .sort((a, b) => b.en.length - a.en.length)
  .map(row => {
    const indices: number[] = [];
    const parts = row.en.split(/(\{\d+\})/g).map(part => {
      if (/^\{\d+\}$/.test(part)) {
        indices.push(Number(part.slice(1, -1)));
        return "([\\s\\S]*?)";
      }
      return part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    });
    return { row, indices, pattern: new RegExp(`^${parts.join("")}$`) };
  });

/** Translate library-owned messages already interpolated by a lower layer. Captures stay literal. */
export function cliErrorText(message: string, language = currentCliLanguage()): string {
  if (!language?.startsWith("pt")) return message;
  if (CLI_TEXTS[message]) return CLI_TEXTS[message].pt;
  for (const { row, indices, pattern } of renderedPatterns) {
    const match = pattern.exec(message);
    if (!match) continue;
    const values: string[] = [];
    indices.forEach((index, capture) => { values[index] = match[capture + 1]; });
    return cliText(row.en, values, language);
  }
  return message;
}

/** Read the explicit locale before parsing so parse errors can also use it. */
export function cliLanguageFromArgv(argv: readonly string[]): string | undefined {
  let language: string | undefined;
  for (let i = 2; i < argv.length && argv[i] !== "--"; i++) {
    if (argv[i].startsWith("--language=")) language = argv[i].slice("--language=".length);
    else if (argv[i] === "--language") language = argv[++i];
  }
  return language;
}
