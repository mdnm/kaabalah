import { describe, expect, it } from "vitest";
import { cliText, cliErrorText, withCliLanguage, currentCliLanguage } from "./language";
import { cliValue, localizeCliJson } from "./content";
import { formatRecordContent, formatRecord } from "../../iching";

describe("CLI Portuguese text", () => {
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
