import { describe, it, expect } from "vitest";
import gates from "./fixtures/gates.json";
import palaces from "./fixtures/palaces.json";
import {
  HEXAGRAMS,
  TRIGRAMS,
  getHexagram,
  getHexagramByBinary,
  getHexagramByTrigrams,
  getNuclearHexagram,
  getPalace,
  getHanHexagram,
  getLineTransforms,
  linesFromHexagram,
  getCastHexagram,
  getTransformedHexagram,
  getMovingLines,
  parseCastLines,
  selectZhuXiTexts,
  castThreeCoins,
  getIChingReading,
  getHexagramKaabalah,
  getTrigramGate,
  getBranchRelation,
  getPhaseRelation,
  getSixRelative,
  SOVEREIGN_HEXAGRAMS,
  getSovereignHexagram,
  formatRecord,
} from "./index";
import type { CastInput, LinePosition, Phase } from "./types";

const allPositions: LinePosition[] = [1, 2, 3, 4, 5, 6];
function seeded(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
describe("I Ching fixed correspondences and binary conventions", () => {
  it("round-trips all 64 King Wen numbers, binaries, trigrams and gate fixtures", () => {
    expect(HEXAGRAMS).toHaveLength(64);
    expect(new Set(HEXAGRAMS.map((h) => h.binary)).size).toBe(64);
    for (const fixture of gates) {
      const h = getHexagram(fixture.number);
      expect(h.binary).toBe(fixture.binary);
      expect(getHexagramByBinary(fixture.binary).number).toBe(fixture.number);
      expect(getHexagramByTrigrams(h.lower.id, h.upper.id).number).toBe(
        fixture.number,
      );
      const gate = getHexagramKaabalah(h.number).gate;
      expect([gate.upper.letter.name, gate.lower.letter.name]).toEqual(
        fixture.letters,
      );
    }
  });
  it("derives the full palace/generation/世/應 table from the reference fixture", () => {
    for (const row of palaces) {
      const p = getPalace(row.number);
      expect([p.trigram.hanzi, p.phase, p.generation, p.shi, p.ying]).toEqual([
        row.palace,
        row.phase,
        row.generation,
        row.shi,
        row.ying,
      ]);
    }
  });
  it("computes nuclear and every possible moving-line subset for all 64 hexagrams", () => {
    for (const h of HEXAGRAMS) {
      const b = h.binary;
      expect(getNuclearHexagram(h.number).hexagram.binary).toBe(
        b[1] + b[2] + b[3] + b[2] + b[3] + b[4],
      );
      expect(getNuclearHexagram(h.number).selfNucleating).toBe(
        h.number === 1 || h.number === 2,
      );
      for (let mask = 0; mask < 64; mask++) {
        const moving = allPositions.filter((p) => mask & (1 << (p - 1)));
        const lines = linesFromHexagram(h.number, moving);
        expect(getCastHexagram(lines).number).toBe(h.number);
        expect(getMovingLines(lines)).toEqual(moving);
        const t = getTransformedHexagram(lines);
        if (!mask) expect(t).toBeNull();
        else {
          expect(t!.binary).toBe(
            [...b]
              .map((v, i) =>
                moving.includes((i + 1) as LinePosition)
                  ? String(1 - Number(v))
                  : v,
              )
              .join(""),
          );
          expect(
            getTransformedHexagram(linesFromHexagram(t!.number, moving))!
              .number,
          ).toBe(h.number);
        }
      }
    }
    for (const [n, expected] of [
      [1, 1],
      [2, 2],
      [27, 2],
      [28, 1],
      [63, 64],
      [64, 63],
    ])
      expect(getNuclearHexagram(n).hexagram.number).toBe(expected);
  });
  it("keeps Chinese identity beside colliding romanizations", () => {
    expect([getHexagram(10).hanzi, getHexagram(56).hanzi]).toEqual([
      "履",
      "旅",
    ]);
    expect(getHexagram(10).pinyin).toBe(getHexagram(56).pinyin);
    expect(getHexagram(10).wadeGiles).toBe(getHexagram(56).wadeGiles);
    expect(new Set([1, 39, 53].map((n) => getHexagram(n).hanzi)).size).toBe(3);
  });
});
describe("Han layer: transformations with explicit relative frames", () => {
  it("transforms #25 line 4 into #42", () => {
    const r = getIChingReading({ hexagramNumber: 25, movingLines: [4] });
    expect(r.transformed!.hexagram.number).toBe(42);
    expect(r.cast.nuclear.hexagram.number).toBe(53);
    expect(r.cast.han.palace).toMatchObject({
      generation: "四世",
      shi: 4,
      ying: 1,
      phase: "wood",
    });
    expect(r.lineTransforms[0]).toMatchObject({
      before: { najia: "壬午", relative: "子孫" },
      after: { najia: "辛未", relative: "妻財" },
      returnRelation: null,
    });
  });
  it("transforms #30 lines 2,4 into #26, including destination-frame 六親", () => {
    const r = getIChingReading({ hexagramNumber: 30, movingLines: [2, 4] });
    expect(r.lineCode).toBe("767987");
    expect(r.transformed!.hexagram.number).toBe(26);
    expect([
      r.cast.nuclear.hexagram.number,
      r.transformed!.nuclear.hexagram.number,
    ]).toEqual([28, 54]);
    expect(r.cast.han.shiYing).toMatchObject({ branch: "沖", label: "應剋世" });
    expect(r.transformed!.han.shiYing).toMatchObject({
      branch: null,
      label: "應生世",
    });
    expect(r.lineTransforms[0]).toMatchObject({
      before: { najia: "己丑", phase: "earth", relative: "子孫" },
      after: { najia: "甲寅", relative: "官鬼" },
      afterInCastPalace: { relative: "父母" },
      returnRelation: "回頭剋",
    });
    expect(r.lineTransforms[1]).toMatchObject({
      before: { najia: "己酉", relative: "妻財" },
      after: { najia: "丙戌", relative: "兄弟" },
      afterInCastPalace: { relative: "子孫" },
      returnRelation: "回頭生",
    });
  });
  it("transforms #6 lines 4,6 into #29 with both relative frames", () => {
    const r = getIChingReading({ hexagramNumber: 6, movingLines: [4, 6] });
    expect(r.transformed!.hexagram.number).toBe(29);
    expect([
      r.cast.nuclear.hexagram.number,
      r.transformed!.nuclear.hexagram.number,
    ]).toEqual([37, 27]);
    expect(r.cast.han.shiYing).toMatchObject({ branch: null, label: "應生世" });
    expect(r.transformed!.han.shiYing.branch).toBe("沖");
    expect(r.lineTransforms[0]).toMatchObject({
      before: { najia: "壬午", relative: "兄弟" },
      after: { najia: "戊申", relative: "父母" },
      afterInCastPalace: { relative: "妻財" },
      returnRelation: null,
    });
    expect(r.lineTransforms[1]).toMatchObject({
      before: { najia: "壬戌", relative: "子孫" },
      after: { najia: "戊子", relative: "兄弟" },
      afterInCastPalace: { relative: "官鬼" },
      returnRelation: null,
    });
  });
  it("transforms #2 lines 3,4,6 into #56", () => {
    const r = getIChingReading({ hexagramNumber: 2, movingLines: [3, 4, 6] });
    expect(r.transformed!.hexagram.number).toBe(56);
    expect([
      r.cast.han.shiYing.branch,
      r.transformed!.han.shiYing.branch,
    ]).toEqual(["沖", "合"]);
    expect(r.cast.nuclear.selfNucleating).toBe(true);
  });
  it("assigns inner and outer 納甲 and 六親 to all lines, and handles all phase pairs", () => {
    const phases: Phase[] = ["wood", "fire", "earth", "metal", "water"];
    for (const h of HEXAGRAMS)
      expect(getHanHexagram(h.number).lines).toHaveLength(6);
    for (const phase of phases) {
      expect(new Set(phases.map((p) => getPhaseRelation(phase, p))).size).toBe(
        5,
      );
      expect(new Set(phases.map((p) => getSixRelative(p, phase))).size).toBe(5);
    }
    expect(getBranchRelation("子", "午")).toBe("沖");
    expect(getBranchRelation("午", "子")).toBe("沖");
    expect(getBranchRelation("酉", "辰")).toBe("合");
    expect(getBranchRelation("子", "子")).toBeNull();
    // Exhaust the casts to ensure every specified advance and retreat can be reported.
    const flags = new Set<string>();
    for (const h of HEXAGRAMS)
      for (const p of allPositions)
        for (const t of getLineTransforms({
          hexagramNumber: h.number,
          movingLines: [p],
        }))
          if (t.advanceRetreat) flags.add(t.advanceRetreat);
    expect([...flags].sort()).toEqual(["退神", "進神"].sort());
  });
});
describe("Zhu Xi selection and classical text", () => {
  it("selects the correct source, positions, and primary text for 0–6 changes", () => {
    const expected = [
      [["judgment", 25, null, true]],
      [["line", 25, 1, true]],
      [
        ["line", 25, 1, false],
        ["line", 25, 2, true],
      ],
      [
        ["judgment", 25, null, true],
        [
          "judgment",
          getTransformedHexagram(linesFromHexagram(25, [1, 2, 3]))!.number,
          null,
          false,
        ],
      ],
      [
        [
          "line",
          getTransformedHexagram(linesFromHexagram(25, [1, 2, 3, 4]))!.number,
          5,
          true,
        ],
        [
          "line",
          getTransformedHexagram(linesFromHexagram(25, [1, 2, 3, 4]))!.number,
          6,
          false,
        ],
      ],
      [
        [
          "line",
          getTransformedHexagram(linesFromHexagram(25, [1, 2, 3, 4, 5]))!
            .number,
          6,
          true,
        ],
      ],
      [
        [
          "judgment",
          getTransformedHexagram(linesFromHexagram(25, allPositions))!.number,
          null,
          true,
        ],
      ],
    ];
    for (let n = 0; n <= 6; n++)
      expect(
        selectZhuXiTexts({
          hexagramNumber: 25,
          movingLines: allPositions.slice(0, n),
        }).map((s) => [s.kind, s.hexagramNumber, s.line, s.primary]),
      ).toEqual(expected[n]);
    expect(
      selectZhuXiTexts({ hexagramNumber: 1, movingLines: allPositions })[0],
    ).toMatchObject({ kind: "useNine", text: { chinese: "見群龍无首，吉。" } });
    expect(
      selectZhuXiTexts({ hexagramNumber: 2, movingLines: allPositions })[0],
    ).toMatchObject({ kind: "useSix", text: { chinese: "利永貞。" } });
  });
  it("ships 64 judgments, 64 distinct 大象, 384 lines, and 用九/用六 with original English", () => {
    for (const h of HEXAGRAMS) {
      expect(h.text.lines).toHaveLength(6);
      for (const text of [h.text.judgment, h.text.image, ...h.text.lines]) {
        expect(text.chinese).toMatch(/[\u3400-\u9fff]/);
        expect(text.english).toMatch(/[a-z]/i);
        expect(text.chinese).not.toMatch(/<pb:|¶|《彖》|《象》|《文言》/);
      }
      expect(h.text.judgment.chinese).not.toEqual(h.text.image.chinese);
    }
    expect(getHexagram(1).text.image.chinese).toBe("天行健，君子以自強不息。");
    expect(getHexagram(52).text.judgment.chinese).toMatch(/^艮其背/);
    expect(getHexagram(61).text.lines[2].english).toContain(
      "opposing counterpart",
    );
  });
});
describe("Kaabalah and sovereign layers remain separate", () => {
  it("resolves every gate letter, path and arcanum from the canonical tree", () => {
    const expected = [
      [2, "Kether", "Binah"],
      [3, "Kether", "Tiphareth"],
      [11, "Chesed", "Netzach"],
      [4, "Chokhmah", "Binah"],
      [13, "Geburah", "Hod"],
      [21, "Hod", "Malkuth"],
      [20, "Hod", "Yesod"],
      [17, "Netzach", "Hod"],
    ];
    TRIGRAMS.forEach((t, i) => {
      const g = getTrigramGate(t.id);
      expect([g.path.number, g.path.from.name, g.path.to.name]).toEqual(
        expected[i],
      );
      expect(g.arcanum.number).toBe(g.path.number);
    });
    const kun = getHexagramKaabalah(2);
    expect(kun.gate.upper.letter.name).toBe("Gimel");
    expect(kun.gate.upper.arcanum.name).toBe("The Empress");
    expect(kun.family.upper.sphere.name).toBe("Binah");
    expect(kun.pillars).toEqual({
      upper: { left: false, middle: false, right: false },
      lower: { left: false, middle: false, right: false },
    });
    for (const h of HEXAGRAMS) {
      const p = getHexagramKaabalah(h.number).pillars;
      expect(
        [
          p.lower.right,
          p.lower.middle,
          p.lower.left,
          p.upper.right,
          p.upper.middle,
          p.upper.left,
        ]
          .map(Number)
          .join(""),
      ).toBe(h.binary);
    }
  });
  it("provides only the 12 sovereign month correspondences, with approximate solar windows labeled", () => {
    expect(SOVEREIGN_HEXAGRAMS.map((s) => s.hexagramNumber)).toEqual([
      24, 19, 11, 34, 43, 1, 44, 33, 12, 20, 23, 2,
    ]);
    expect(new Set(SOVEREIGN_HEXAGRAMS.map((s) => s.lunarMonth)).size).toBe(12);
    expect(getSovereignHexagram(24)).toMatchObject({
      lunarMonth: 11,
      branch: "子",
      approximateSolarWindow: {
        start: { month: 12, day: 7 },
        end: { month: 1, day: 5 },
      },
    });
    expect(getSovereignHexagram(30)).toBeNull();
  });
});
describe("casting, input boundaries and records", () => {
  it("replays an injected RNG and produces three-coin odds 1:3:3:1", () => {
    expect(castThreeCoins(() => 0)).toEqual([6, 6, 6, 6, 6, 6]);
    expect(castThreeCoins(() => 0.5)).toEqual([9, 9, 9, 9, 9, 9]);
    expect(castThreeCoins(seeded(123))).toEqual(castThreeCoins(seeded(123)));
    const counts = [0, 0, 0, 0],
      rng = seeded(777);
    for (let i = 0; i < 20000; i++)
      for (const line of castThreeCoins(rng)) counts[line - 6]++;
    [1 / 8, 3 / 8, 3 / 8, 1 / 8].forEach((p, i) =>
      expect(Math.abs(counts[i] / 120000 - p)).toBeLessThan(0.005),
    );
    for (let mask = 0; mask < 8; mask++) {
      let calls = 0;
      const lines = castThreeCoins(() =>
        (mask >> calls++ % 3) & 1 ? 0.75 : 0.25,
      );
      expect(calls).toBe(18);
      expect(lines[0]).toBe(
        6 + [...mask.toString(2)].filter((b) => b === "1").length,
      );
    }
  });
  it("rejects malformed inputs and never silently repairs positions or RNG output", () => {
    for (const input of [
      "",
      "77777",
      "7777777",
      "012345",
      " 879777",
      [7, 7, 7, 7, 7, NaN],
      null,
      new Array(6),
      { hexagramNumber: 1, movingLines: new Array(1) },
      {},
      { hexagramNumber: 0 },
      { hexagramNumber: 1, movingLines: [1, 1] },
      { hexagramNumber: 1, movingLines: [0] },
      { hexagramNumber: 1, movingLines: ["2"] },
    ])
      expect(() => parseCastLines(input as CastInput)).toThrow();
    for (const n of [0, 65, NaN, 1.5]) expect(() => getHexagram(n)).toThrow();
    for (const b of ["", "123456", "11111", "1111111"])
      expect(() => getHexagramByBinary(b)).toThrow();
    for (const v of [-1, 1, NaN, Infinity])
      expect(() => castThreeCoins(() => v)).toThrow();
  });
  it("derives the example, keeps static transformed null and emits a deterministic fact record", () => {
    expect(getIChingReading(30, [2, 4])).toEqual(
      getIChingReading({ hexagramNumber: 30, movingLines: [2, 4] }),
    );
    expect(getIChingReading("879777").lineCode).toBe("879777");
    const staticReading = getIChingReading("777777");
    expect(staticReading.transformed).toBeNull();
    expect(staticReading.lineTransforms).toEqual([]);
    expect(
      formatRecord(
        { hexagramNumber: 30, movingLines: [2, 4] },
        { date: "13-09-2026" },
      ),
    ).toContain("ICHING READING 13-09-2026");
    expect(formatRecord("777777")).toContain("self-nucleating");
    expect(formatRecord({hexagramNumber:30,movingLines:[2,4]})).toContain("己丑 丑土 子孫 → 甲寅 寅木 官鬼");
    expect(Object.isFrozen(HEXAGRAMS[0].text.lines)).toBe(true);
  });
});
