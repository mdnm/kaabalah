import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { cliText, cliErrorText, withCliLanguage, currentCliLanguage, CLI_TEXTS } from "./language";
import { cliValue, localizeCliJson } from "./content";
import { COMMANDS, GLOBAL_FLAGS } from "../contract";
import { ICHING_RECORD_LABELS, formatRecordContent, formatRecord } from "../../iching";

describe("CLI Portuguese text", () => {
  it("covers every schema description and message call with nonempty Portuguese and matching placeholders", () => {
    const descriptions = [
      ...GLOBAL_FLAGS.map(flag => flag.description),
      ...COMMANDS.flatMap(command => [command.description, ...command.args.map(arg => arg.description), ...command.flags.map(flag => flag.description)]),
    ];
    for (const description of descriptions) expect(CLI_TEXTS[description], description).toBeDefined();
    const sourceDir = resolve(process.cwd(), "src/cli");
    const files = [resolve(sourceDir, "app.ts"), ...["commands", "runtime"].flatMap(dir => readdirSync(resolve(sourceDir, dir))
      .filter(name => name.endsWith(".ts") && !name.endsWith(".test.ts"))
      .map(name => resolve(sourceDir, dir, name)))];
    for (const file of files) {
      const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
      function visit(node: ts.Node) {
        if (ts.isCallExpression(node) && node.expression.getText(source) === "cliText") {
          const key = node.arguments[0];
          if (key && ts.isStringLiteral(key)) expect(CLI_TEXTS[key.text], `${file}: ${key.text}`).toBeDefined();
        }
        ts.forEachChild(node, visit);
      }
      visit(source);
    }
    for (const [key, row] of Object.entries(CLI_TEXTS)) {
      expect(row.en).toBe(key);
      expect(row.pt.trim()).toBeTruthy();
      expect(row.pt).not.toContain("\u2014");
      expect((row.pt.match(/\{\d+\}/g) ?? []).sort()).toEqual((row.en.match(/\{\d+\}/g) ?? []).sort());
    }
    for (const row of Object.values(ICHING_RECORD_LABELS)) expect(row.pt.trim()).toBeTruthy();
  });

  it("preserves interpolation and isolates concurrent language contexts", async () => {
    const input = 'a {0} $HOME `echo example`';
    expect(cliText('No results found for "{0}".', [input], "pt-BR")).toBe(`Nenhum resultado para "${input}".`);
    expect(cliErrorText('Target year (1989) is before birth year (1990).', "pt-BR"))
      .toBe("O ano desejado, 1989, é anterior ao ano de nascimento, 1990.");
    expect(cliErrorText('Setting ephemeris path to: /ephe (mounted from /my files)', "pt-BR"))
      .toBe("Definindo o caminho das efemérides: /ephe (montado de /my files)");
    const result = await Promise.all(["en", "pt-BR", "fr"].map(language => withCliLanguage(language, async () => {
      await Promise.resolve();
      return cliText("USAGE");
    })));
    expect(result).toEqual(["USAGE", "USO", "USAGE"]);
    expect(currentCliLanguage()).toBeUndefined();
    expect(cliValue("Sun           ", "pt-BR")).toBe("Sol           ");
    expect(localizeCliJson({ text: "Sun", id: "Sun", english: "Sun", meaning: "Make retrospectives and learn from mistakes and successes" }, "pt-BR"))
      .toEqual({ text: "Sun", id: "Sun", english: "Sun", meaning: "Faça retrospectivas, aprenda com seus erros e acertos" });
  });

  it("keeps English I Ching records identical and includes Portuguese oracle text", () => {
    const input = { hexagramNumber: 1, movingLines: [1, 2, 3, 4, 5, 6] as const };
    expect(formatRecordContent(input)).toBe(formatRecord(input));
    const pt = formatRecordContent(input, "pt-BR", { question: "Sun remains my question" });
    expect(pt).toContain("LEITURA DO I CHING");
    expect(pt).toContain("Pergunta: Sun remains my question");
    expect(pt).toContain("Veja um grupo de dragões sem cabeça. Boa fortuna.");
    expect(pt).toContain("見群龍无首，吉。");
    expect(pt).not.toContain("\u2014");
  });
});
