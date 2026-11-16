/** All line arrays and binary strings run from bottom (line 1) to top (line 6). */
export type LineValue = 6 | 7 | 8 | 9;
export type LinePosition = 1 | 2 | 3 | 4 | 5 | 6;
export type CastLines = readonly [
  LineValue,
  LineValue,
  LineValue,
  LineValue,
  LineValue,
  LineValue,
];
export type Phase = "wood" | "fire" | "earth" | "metal" | "water";
export type TrigramId =
  | "qian"
  | "kun"
  | "zhen"
  | "xun"
  | "kan"
  | "li"
  | "gen"
  | "dui";
export interface Trigram {
  readonly id: TrigramId;
  readonly hanzi: string;
  readonly pinyin: string;
  readonly wadeGiles: string;
  readonly symbol: string;
  readonly image: string;
  readonly binary: string;
  readonly lines: readonly [0 | 1, 0 | 1, 0 | 1];
  readonly family: string;
  readonly direction: string;
  readonly phase: Phase;
  readonly phaseHanzi: string;
}
export interface ClassicalText {
  readonly chinese: string;
  readonly english: string;
}
export interface HexagramText {
  readonly judgment: ClassicalText;
  readonly image: ClassicalText;
  readonly lines: readonly ClassicalText[];
  readonly useNine?: ClassicalText;
  readonly useSix?: ClassicalText;
}
export interface Hexagram {
  readonly number: number;
  readonly hanzi: string;
  readonly pinyin: string;
  readonly wadeGiles: string;
  readonly pinyinVariants?: readonly string[];
  readonly english: string;
  readonly portuguese: string;
  readonly symbol: string;
  readonly binary: string;
  readonly lower: Trigram;
  readonly upper: Trigram;
  readonly text: HexagramText;
}
export type CastInput =
  | string
  | CastLines
  | {
      readonly hexagramNumber: number;
      readonly movingLines?: readonly LinePosition[];
    };
export type Relative = "兄弟" | "父母" | "子孫" | "妻財" | "官鬼";
export type Generation =
  | "本宮"
  | "一世"
  | "二世"
  | "三世"
  | "四世"
  | "五世"
  | "游魂"
  | "歸魂";
export interface Palace {
  readonly trigram: Trigram;
  readonly hanzi: string;
  readonly phase: Phase;
  readonly phaseHanzi: string;
  readonly generation: Generation;
  readonly generationIndex: number;
  readonly shi: LinePosition;
  readonly ying: LinePosition;
}
export interface HanLine {
  readonly position: LinePosition;
  readonly stem: string;
  readonly branch: string;
  readonly najia: string;
  readonly phase: Phase;
  readonly phaseHanzi: string;
  readonly relative: Relative;
  readonly isShi: boolean;
  readonly isYing: boolean;
}
export type PhaseRelation =
  | "same"
  | "generates"
  | "generatedBy"
  | "controls"
  | "controlledBy";
export interface HanHexagram {
  readonly palace: Palace;
  readonly lines: readonly HanLine[];
  readonly shiYing: {
    readonly branch: "沖" | "合" | null;
    /** Direction is always 世 relative to 應. */
    readonly phase: PhaseRelation;
    readonly label: "比和" | "世生應" | "應生世" | "世剋應" | "應剋世";
  };
}
export interface LineTransform {
  readonly position: LinePosition;
  readonly before: HanLine;
  /** Destination line measured in the destination hexagram's palace. */
  readonly after: HanLine;
  /** Destination line measured in the original cast's palace. */
  readonly afterInCastPalace: HanLine;
  readonly returnRelation: "回頭生" | "回頭剋" | null;
  readonly advanceRetreat: "進神" | "退神" | null;
}
export interface TextSelection {
  readonly hexagramNumber: number;
  readonly hanzi: string;
  readonly kind: "judgment" | "line" | "useNine" | "useSix";
  readonly line: LinePosition | null;
  readonly primary: boolean;
  readonly text: ClassicalText;
}
