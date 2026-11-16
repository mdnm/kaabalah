import { HEXAGRAMS } from "./data";
import {
  TRIGRAMS,
  PHASE_HANZI,
  PALACE_TABLE,
  GENERATIONS,
  SHI_POSITIONS,
  NAJIA,
  BRANCH_PHASES,
  GENERATES,
  CONTROLS,
  CLASHES,
  HARMONIES,
  ADVANCES,
} from "./tables";
import type {
  CastInput,
  CastLines,
  LinePosition,
  LineValue,
  Hexagram,
  TrigramId,
  Palace,
  Phase,
  PhaseRelation,
  Relative,
  HanLine,
  HanHexagram,
  LineTransform,
  TextSelection,
} from "./types";

export function getTrigram(idOrBinary: TrigramId | string) {
  const result = TRIGRAMS.find(
    (t) => t.id === idOrBinary || t.binary === idOrBinary,
  );
  if (!result)
    throw new RangeError(
      "Trigram must be a canonical id or three bottom-first binary digits",
    );
  return result;
}
export function getHexagram(number: number): Hexagram {
  if (!Number.isInteger(number) || number < 1 || number > 64)
    throw new RangeError("Hexagram number must be an integer from 1 to 64");
  return HEXAGRAMS[number - 1];
}
export function getHexagramByBinary(binary: string): Hexagram {
  if (typeof binary !== "string" || !/^[01]{6}$/.test(binary))
    throw new RangeError(
      "Binary must contain six bottom-first digits (0 or 1)",
    );
  return HEXAGRAMS.find((h) => h.binary === binary)!;
}
export function getHexagramByTrigrams(
  lower: TrigramId,
  upper: TrigramId,
): Hexagram {
  return getHexagramByBinary(
    getTrigram(lower).binary + getTrigram(upper).binary,
  );
}
function positions(moving: readonly LinePosition[]): readonly LinePosition[] {
  if (
    !Array.isArray(moving) ||
    Array.from(moving).some((p) => !Number.isInteger(p) || p < 1 || p > 6) ||
    new Set(moving).size !== moving.length
  ) {
    throw new RangeError(
      "Moving lines must be unique integer positions from 1 to 6",
    );
  }
  return [...moving].sort((a, b) => a - b);
}
export function linesFromHexagram(
  number: number,
  movingLines: readonly LinePosition[] = [],
): CastLines {
  const moving = positions(movingLines);
  return Object.freeze(
    [...getHexagram(number).binary].map(
      (bit, i): LineValue =>
        bit === "1"
          ? moving.includes((i + 1) as LinePosition)
            ? 9
            : 7
          : moving.includes((i + 1) as LinePosition)
            ? 6
            : 8,
    ),
  ) as CastLines;
}
export function parseCastLines(input: CastInput): CastLines {
  if (
    input &&
    typeof input === "object" &&
    !Array.isArray(input) &&
    "hexagramNumber" in input
  ) {
    return linesFromHexagram(input.hexagramNumber, input.movingLines);
  }
  if (typeof input === "string" && !/^[6789]{6}$/.test(input))
    throw new RangeError(
      "Cast must contain six values (6, 7, 8, 9), bottom to top",
    );
  const values = typeof input === "string" ? [...input].map(Number) : input;
  if (
    !Array.isArray(values) ||
    values.length !== 6 ||
    Array.from(values).some((v) => ![6, 7, 8, 9].includes(v))
  )
    throw new RangeError(
      "Cast must contain six values (6, 7, 8, 9), bottom to top",
    );
  return Object.freeze([...values]) as CastLines;
}
export function getMovingLines(input: CastInput): readonly LinePosition[] {
  return parseCastLines(input).flatMap((v, i) =>
    v === 6 || v === 9 ? [(i + 1) as LinePosition] : [],
  );
}
export function getCastHexagram(input: CastInput): Hexagram {
  return getHexagramByBinary(
    parseCastLines(input)
      .map((v) => v % 2)
      .join(""),
  );
}
export function getTransformedHexagram(input: CastInput): Hexagram | null {
  const lines = parseCastLines(input);
  if (!lines.some((v) => v === 6 || v === 9)) return null;
  return getHexagramByBinary(
    lines.map((v) => (v === 6 ? 1 : v === 9 ? 0 : v % 2)).join(""),
  );
}
export function getNuclearHexagram(number: number) {
  const hexagram = getHexagram(number);
  const nuclear = getHexagramByBinary(
    hexagram.binary.slice(1, 4) + hexagram.binary.slice(2, 5),
  );
  return {
    hexagram: nuclear,
    selfNucleating: nuclear.number === number,
    palace: getPalace(nuclear.number),
  };
}
export function getPalace(number: number): Palace {
  getHexagram(number);
  for (const trigram of TRIGRAMS) {
    const index = PALACE_TABLE[trigram.id].indexOf(number);
    if (index < 0) continue;
    const shi = SHI_POSITIONS[index];
    return {
      trigram,
      hanzi: trigram.hanzi + "宮",
      phase: trigram.phase,
      phaseHanzi: PHASE_HANZI[trigram.phase],
      generation: GENERATIONS[index],
      generationIndex: index,
      shi,
      ying: (shi > 3 ? shi - 3 : shi + 3) as LinePosition,
    };
  }
  throw new Error("Incomplete palace table");
}
/** Relation of the first phase to the second; phases remain independent of western elements. */
export function getPhaseRelation(first: Phase, second: Phase): PhaseRelation {
  if (
    !Object.hasOwnProperty.call(GENERATES, first) ||
    !Object.hasOwnProperty.call(GENERATES, second)
  )
    throw new RangeError("Unknown five phase");
  if (first === second) return "same";
  if (GENERATES[first] === second) return "generates";
  if (GENERATES[second] === first) return "generatedBy";
  return CONTROLS[first] === second ? "controls" : "controlledBy";
}
export function getSixRelative(linePhase: Phase, palacePhase: Phase): Relative {
  const relatives: Record<PhaseRelation, Relative> = {
    same: "兄弟",
    generates: "父母",
    generatedBy: "子孫",
    controls: "官鬼",
    controlledBy: "妻財",
  };
  return relatives[getPhaseRelation(linePhase, palacePhase)];
}
export function getBranchRelation(
  first: string,
  second: string,
): "沖" | "合" | null {
  if (
    !Object.prototype.hasOwnProperty.call(BRANCH_PHASES, first) ||
    !Object.prototype.hasOwnProperty.call(BRANCH_PHASES, second)
  )
    throw new RangeError("Unknown earthly branch");
  const pair = first + second,
    reverse = second + first;
  if (CLASHES.some((p) => p === pair || p === reverse)) return "沖";
  if (HARMONIES.some((p) => p === pair || p === reverse)) return "合";
  return null;
}
export function getHanHexagram(number: number): HanHexagram {
  const hexagram = getHexagram(number),
    palace = getPalace(number);
  const najia = [
    ...NAJIA[hexagram.lower.id][0].split(" "),
    ...NAJIA[hexagram.upper.id][1].split(" "),
  ];
  const lines: HanLine[] = najia.map((value, i) => {
    const phase = BRANCH_PHASES[value[1]],
      position = (i + 1) as LinePosition;
    return {
      position,
      stem: value[0],
      branch: value[1],
      najia: value,
      phase,
      phaseHanzi: PHASE_HANZI[phase],
      relative: getSixRelative(phase, palace.phase),
      isShi: position === palace.shi,
      isYing: position === palace.ying,
    };
  });
  const shi = lines[palace.shi - 1],
    ying = lines[palace.ying - 1];
  const phase = getPhaseRelation(shi.phase, ying.phase);
  const labels = {
    same: "比和",
    generates: "世生應",
    generatedBy: "應生世",
    controls: "世剋應",
    controlledBy: "應剋世",
  } as const;
  return {
    palace,
    lines,
    shiYing: {
      branch: getBranchRelation(shi.branch, ying.branch),
      phase,
      label: labels[phase],
    },
  };
}
export function getLineTransforms(input: CastInput): readonly LineTransform[] {
  const cast = getHanHexagram(getCastHexagram(input).number),
    transformed = getTransformedHexagram(input);
  if (!transformed) return [];
  const destination = getHanHexagram(transformed.number);
  return getMovingLines(input).map((position) => {
    const before = cast.lines[position - 1],
      after = destination.lines[position - 1];
    const afterInCastPalace = {
      ...after,
      relative: getSixRelative(after.phase, cast.palace.phase),
    };
    const relation = getPhaseRelation(after.phase, before.phase);
    return {
      position,
      before,
      after,
      afterInCastPalace,
      returnRelation:
        relation === "generates"
          ? "回頭生"
          : relation === "controls"
            ? "回頭剋"
            : null,
      advanceRetreat: ADVANCES.some((p) => p === before.branch + after.branch)
        ? "進神"
        : ADVANCES.some((p) => p === after.branch + before.branch)
          ? "退神"
          : null,
    };
  });
}
export function selectZhuXiTexts(input: CastInput): readonly TextSelection[] {
  const cast = getCastHexagram(input),
    transformed = getTransformedHexagram(input),
    moving = getMovingLines(input),
    n = moving.length;
  const judgment = (h: Hexagram, primary: boolean): TextSelection => ({
    hexagramNumber: h.number,
    hanzi: h.hanzi,
    kind: "judgment",
    line: null,
    primary,
    text: h.text.judgment,
  });
  const line = (
    h: Hexagram,
    position: LinePosition,
    primary: boolean,
  ): TextSelection => ({
    hexagramNumber: h.number,
    hanzi: h.hanzi,
    kind: "line",
    line: position,
    primary,
    text: h.text.lines[position - 1],
  });
  if (!transformed) return [judgment(cast, true)];
  if (n <= 2) return moving.map((p) => line(cast, p, p === moving[n - 1]));
  if (n === 3) return [judgment(cast, true), judgment(transformed, false)];
  if (n <= 5)
    return ([1, 2, 3, 4, 5, 6] as const)
      .filter((p) => !moving.includes(p))
      .map((p, i) => line(transformed, p, i === 0));
  if (cast.number === 1 || cast.number === 2) {
    const kind = cast.number === 1 ? "useNine" : "useSix";
    return [
      {
        hexagramNumber: cast.number,
        hanzi: cast.hanzi,
        kind,
        line: null,
        primary: true,
        text: cast.text[kind]!,
      },
    ];
  }
  return [judgment(transformed, true)];
}
/** Three independent fair coins per line: tails=2, heads=3. Exactly 18 RNG calls. */
export function castThreeCoins(rng: () => number = Math.random): CastLines {
  const coin = () => {
    const value = rng();
    if (!Number.isFinite(value) || value < 0 || value >= 1)
      throw new RangeError("rng must return a finite number in [0, 1)");
    return value < 0.5 ? 2 : 3;
  };
  return Object.freeze(
    Array.from({ length: 6 }, () => coin() + coin() + coin()),
  ) as CastLines;
}
