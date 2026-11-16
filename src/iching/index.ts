import labels from "./record.texts.json";
import { TAROT_CONTENT } from "../core/tarot-content";
import { freezeTextData } from "../localization";
import { getHexagramText, getOracleTextContent } from "./texts";
export * from "./types";
export * from "./data";
export * from "./descriptions";
export * from "./texts";
export { TRIGRAMS, PALACE_TABLE, PHASE_HANZI } from "./tables";
export * from "./calculations";
export * from "./kaabalah";
export * from "./sovereign";

import {
  parseCastLines,
  getCastHexagram,
  getMovingLines,
  getTransformedHexagram,
  getNuclearHexagram,
  getHanHexagram,
  getLineTransforms,
  selectZhuXiTexts,
} from "./calculations";
import { getHexagramKaabalah } from "./kaabalah";
import { getSovereignHexagram } from "./sovereign";
import type { CastInput, Hexagram, LinePosition } from "./types";

function describe(hexagram: Hexagram) {
  const nuclear = getNuclearHexagram(hexagram.number);
  return {
    hexagram,
    han: getHanHexagram(hexagram.number),
    nuclear: {
      ...nuclear,
      han: getHanHexagram(nuclear.hexagram.number),
      kaabalah: getHexagramKaabalah(nuclear.hexagram.number),
    },
    kaabalah: getHexagramKaabalah(hexagram.number),
    sovereign: getSovereignHexagram(hexagram.number),
  };
}
/** Derive the complete record from the six stored lines; no date, network, or interpretation. */
export function getIChingReading(input: CastInput): IChingReading;
export function getIChingReading(
  hexagramNumber: number,
  movingLines?: readonly LinePosition[],
): IChingReading;
export function getIChingReading(
  input: CastInput | number,
  movingLines?: readonly LinePosition[],
): IChingReading {
  if (typeof input !== "number" && movingLines !== undefined)
    throw new RangeError("movingLines requires a hexagram number");
  return deriveReading(
    typeof input === "number" ? { hexagramNumber: input, movingLines } : input,
  );
}
function deriveReading(input: CastInput) {
  const lines = parseCastLines(input),
    cast = getCastHexagram(lines),
    transformed = getTransformedHexagram(lines);
  return {
    lines,
    lineCode: lines.join(""),
    movingLines: getMovingLines(lines),
    cast: describe(cast),
    transformed: transformed ? describe(transformed) : null,
    lineTransforms: getLineTransforms(lines),
    oracle: selectZhuXiTexts(lines),
  };
}
export type IChingReading = ReturnType<typeof deriveReading>;

/**
 * Reading with selected text in `.content`, including oracle, cast, transformed and nuclear texts.
 * English is the default; pt and pt-BR select Portuguese. Original Chinese and English remain.
 */
export function getIChingReadingContent(input: CastInput, language?: string) {
  const reading = getIChingReading(input);
  const hexagram = (h: Hexagram) => ({ ...h, text: getHexagramText(h.number, language)! });
  const state = (value: IChingReading["cast"]) => ({
    ...value,
    hexagram: hexagram(value.hexagram),
    nuclear: { ...value.nuclear, hexagram: hexagram(value.nuclear.hexagram) },
  });
  return {
    ...reading,
    cast: state(reading.cast),
    transformed: reading.transformed ? state(reading.transformed) : null,
    oracle: reading.oracle.map(selection => ({
      ...selection,
      text: getOracleTextContent(selection, language),
    })),
  };
}
export type IChingReadingContent = ReturnType<typeof getIChingReadingContent>;

/** Dates and question are caller-supplied labels; this helper never supplies a clock or interpretation. */
export function formatRecord(
  input: CastInput,
  labels: { date?: string; question?: string } = {},
): string {
  const reading = getIChingReading(input);
  const name = (h: Hexagram) =>
    `${h.number} — ${h.hanzi} ${h.pinyin} / ${h.english}`;
  const parts = [
    `ICHING READING${labels.date ? " " + labels.date : ""}`,
    `Question: ${labels.question ?? "(not supplied)"}`,
    `Lines (bottom to top): ${reading.lineCode}`,
    `Cast hexagram: ${name(reading.cast.hexagram)}`,
    `Changing lines: ${reading.movingLines.join(", ") || "none"}`,
    `Transformed hexagram: ${reading.transformed ? name(reading.transformed.hexagram) : "none"}`,
  ];
  for (const [label, state] of [
    ["cast", reading.cast],
    ["transformed", reading.transformed],
  ] as const) {
    if (!state) continue;
    const palace = state.han.palace,
      nuclear = state.nuclear;
    parts.push(
      `Nuclear (${label}): ${name(nuclear.hexagram)} — ${nuclear.palace.hanzi} ${nuclear.palace.generation}${nuclear.selfNucleating ? " (self-nucleating)" : ""}`,
    );
    parts.push(
      `Palace (${label}): ${palace.hanzi} ${palace.trigram.pinyin} (${palace.phase}), ${palace.generation} — 世爻 line ${palace.shi}, 應爻 line ${palace.ying}`,
    );
    const shi = state.han.lines[palace.shi - 1],
      ying = state.han.lines[palace.ying - 1];
    parts.push(
      `世/應 (${label}): ${shi.branch}${shi.phaseHanzi} ${shi.relative} / ${ying.branch}${ying.phaseHanzi} ${ying.relative} — ${state.han.shiYing.branch ?? "no 沖/合"} / ${state.han.shiYing.label}`,
    );
    const { gate, rulingArcanum, family, pillars } = state.kaabalah;
    const gateName = (g: typeof gate.upper) =>
      `${g.letter.name} ${g.letter.character} (path ${g.path.number} ${g.path.from.name}→${g.path.to.name}; ${g.arcanum.number} ${g.arcanum.name})`;
    parts.push(
      `Gate (${label}, upper + lower): ${gateName(gate.upper)} + ${gateName(gate.lower)}`,
    );
    parts.push(
      `Ruling arcanum (${label}): ${rulingArcanum.trigram.hanzi} → ${rulingArcanum.letter.name} → ${rulingArcanum.arcanum.number} ${rulingArcanum.arcanum.name}`,
    );
    parts.push(
      `Family spheres (${label}): upper ${family.upper.sphere.name} / lower ${family.lower.sphere.name}`,
    );
    const lit = (p: typeof pillars.upper) =>
      [p.left, p.middle, p.right].map((v) => (v ? "on" : "off")).join("/");
    parts.push(
      `Pillars (${label}, L/M/R): upper ${lit(pillars.upper)} / lower ${lit(pillars.lower)}`,
    );
  }
  for (const t of reading.lineTransforms)
    parts.push(
      `Line ${t.position} transform: ${t.before.najia} ${t.before.branch}${t.before.phaseHanzi} ${t.before.relative} → ${t.after.najia} ${t.after.branch}${t.after.phaseHanzi} ${t.after.relative} [cast palace: ${t.afterInCastPalace.relative}]${t.returnRelation ? " " + t.returnRelation : ""}${t.advanceRetreat ? " " + t.advanceRetreat : ""}`,
    );
  parts.push(
    `Binary (bottom first): ${reading.cast.hexagram.binary}${reading.transformed ? " → " + reading.transformed.hexagram.binary : ""}`,
  );
  for (const selected of reading.oracle)
    parts.push(
      `Oracle${selected.primary ? " (primary)" : ""}: ${selected.hexagramNumber} ${selected.hanzi} ${selected.kind}${selected.line ? " " + selected.line : ""} — ${selected.text.chinese}\n${selected.text.english}`,
    );
  return parts.join("\n");
}



export const ICHING_RECORD_LABELS = freezeTextData(labels);
const cardNames = new Map(Object.values(TAROT_CONTENT).flatMap(row => Object.values(row.en).map(deck => [deck.name, row.pt.PAPUS_KAABALISTIC.name] as const)));
cardNames.set("Judgment", TAROT_CONTENT["20_judgement"].pt.PAPUS_KAABALISTIC.name);

/** Human-readable record in Portuguese for pt/pt-BR; the existing English formatter stays unchanged. */
export function formatRecordContent(input: CastInput, language?: string, supplied: { date?: string; question?: string } = {}): string {
  if (!language?.startsWith("pt")) return formatRecord(input, supplied);
  const text = (key: keyof typeof labels) => labels[key].pt;
  const reading = getIChingReadingContent(input, language);
  const name = (h: Hexagram) => `${h.number}: ${h.hanzi} ${h.pinyin} / ${h.portuguese}`;
  const parts = [
    `${text("record")}${supplied.date ? " " + supplied.date : ""}`,
    `${text("question")}: ${supplied.question ?? text("notSupplied")}`,
    `${text("lines")}: ${reading.lineCode}`,
    `${text("cast")}: ${name(reading.cast.hexagram)}`,
    `${text("moving")}: ${reading.movingLines.join(", ") || text("none")}`,
    `${text("transformed")}: ${reading.transformed ? name(reading.transformed.hexagram) : text("none")}`,
  ];
  for (const [key, state] of [["castState", reading.cast], ["transformedState", reading.transformed]] as const) {
    if (!state) continue;
    const label = text(key), palace = state.han.palace, nuclear = state.nuclear;
    parts.push(`${text("nuclear")} (${label}): ${name(nuclear.hexagram)}: ${nuclear.palace.hanzi} ${nuclear.palace.generation}${nuclear.selfNucleating ? ` (${text("selfNucleating")})` : ""}`);
    parts.push(`${text("palace")} (${label}): ${palace.hanzi} ${palace.trigram.pinyin} (${text(palace.phase)}), ${palace.generation}: 世爻 ${text("line")} ${palace.shi}, 應爻 ${text("line")} ${palace.ying}`);
    const shi = state.han.lines[palace.shi - 1], ying = state.han.lines[palace.ying - 1];
    parts.push(`世/應 (${label}): ${shi.branch}${shi.phaseHanzi} ${shi.relative} / ${ying.branch}${ying.phaseHanzi} ${ying.relative}: ${state.han.shiYing.branch ?? text("noBranch")} / ${state.han.shiYing.label}`);
    const { gate, rulingArcanum, family, pillars } = state.kaabalah;
    const card = (english: string) => cardNames.get(english) ?? english;
    const gateName = (g: typeof gate.upper) => `${g.letter.name} ${g.letter.character} (${text("path")} ${g.path.number} ${g.path.from.name}→${g.path.to.name}; ${g.arcanum.number} ${card(g.arcanum.name)})`;
    parts.push(`${text("gate")} (${label}, ${text("upperLower")}): ${gateName(gate.upper)} + ${gateName(gate.lower)}`);
    parts.push(`${text("ruling")} (${label}): ${rulingArcanum.trigram.hanzi} → ${rulingArcanum.letter.name} → ${rulingArcanum.arcanum.number} ${card(rulingArcanum.arcanum.name)}`);
    parts.push(`${text("family")} (${label}): ${text("upper")} ${family.upper.sphere.name} / ${text("lower")} ${family.lower.sphere.name}`);
    const lit = (p: typeof pillars.upper) => [p.left, p.middle, p.right].map(v => text(v ? "on" : "off")).join("/");
    parts.push(`${text("pillars")} (${label}, ${text("leftMiddleRight")}): ${text("upper")} ${lit(pillars.upper)} / ${text("lower")} ${lit(pillars.lower)}`);
  }
  for (const t of reading.lineTransforms) parts.push(`${text("line")} ${t.position}, ${text("transform")}: ${t.before.najia} ${t.before.branch}${t.before.phaseHanzi} ${t.before.relative} → ${t.after.najia} ${t.after.branch}${t.after.phaseHanzi} ${t.after.relative} [${text("castPalace")}: ${t.afterInCastPalace.relative}]${t.returnRelation ? " " + t.returnRelation : ""}${t.advanceRetreat ? " " + t.advanceRetreat : ""}`);
  parts.push(`${text("binary")}: ${reading.cast.hexagram.binary}${reading.transformed ? " → " + reading.transformed.hexagram.binary : ""}`);
  for (const selected of reading.oracle) parts.push(`${text("oracle")}${selected.primary ? ` (${text("primary")})` : ""}: ${selected.hexagramNumber} ${selected.hanzi} ${text(selected.kind)}${selected.line ? " " + selected.line : ""}: ${selected.text.chinese}\n${selected.text.content}`);
  return parts.join("\n");
}
