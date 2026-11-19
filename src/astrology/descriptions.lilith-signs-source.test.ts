import { describe, expect, it } from "vitest";
import { getPointSignDescriptionEntry } from "./descriptions";
import type { Sign } from "./dignity";
const entry = (sign: Sign) => getPointSignDescriptionEntry("lilith mean", sign)!;
const ranges: Record<Sign, number[][]> = {
  "Aries": [
    [
      152,
      155
    ],
    [
      159,
      160
    ],
    [
      163,
      180
    ],
    [
      183,
      184
    ]
  ],
  "Taurus": [
    [
      152,
      155
    ],
    [
      159,
      160
    ],
    [
      227,
      229
    ],
    [
      233,
      238
    ],
    [
      243,
      248
    ]
  ],
  "Gemini": [
    [
      152,
      155
    ],
    [
      159,
      160
    ],
    [
      291,
      300
    ],
    [
      302,
      305
    ]
  ],
  "Cancer": [
    [
      152,
      155
    ],
    [
      159,
      160
    ],
    [
      328,
      333
    ],
    [
      335,
      336
    ]
  ],
  "Leo": [
    [
      152,
      155
    ],
    [
      159,
      160
    ],
    [
      368,
      380
    ],
    [
      381,
      387
    ],
    [
      389,
      393
    ],
    [
      398,
      399
    ]
  ],
  "Virgo": [
    [
      152,
      155
    ],
    [
      159,
      160
    ],
    [
      446,
      448
    ],
    [
      449,
      450
    ],
    [
      452,
      458
    ],
    [
      462,
      462
    ]
  ],
  "Libra": [
    [
      152,
      155
    ],
    [
      159,
      160
    ],
    [
      496,
      499
    ],
    [
      503,
      508
    ],
    [
      510,
      511
    ],
    [
      515,
      516
    ],
    [
      526,
      526
    ]
  ],
  "Scorpio": [
    [
      152,
      155
    ],
    [
      159,
      160
    ],
    [
      564,
      571
    ],
    [
      576,
      579
    ]
  ],
  "Sagittarius": [
    [
      152,
      155
    ],
    [
      159,
      160
    ],
    [
      608,
      610
    ],
    [
      613,
      616
    ],
    [
      632,
      633
    ]
  ],
  "Capricorn": [
    [
      152,
      155
    ],
    [
      159,
      160
    ],
    [
      671,
      680
    ],
    [
      696,
      698
    ]
  ],
  "Aquarius": [
    [
      152,
      155
    ],
    [
      159,
      160
    ],
    [
      755,
      761
    ]
  ],
  "Pisces": [
    [
      152,
      155
    ],
    [
      159,
      160
    ],
    [
      802,
      803
    ],
    [
      809,
      812
    ]
  ]
};
describe("Lilith sign source qualifications", () => {
  it("keeps two lowercase chart-owner sentences without clinical or deterministic assignments", () => {
    for (const sign of Object.keys(ranges) as Sign[]) {
      expect(entry(sign).pt).toMatch(/você|seu|sua/);
      expect(entry(sign).en).toMatch(/you|your/);
      for (const text of [entry(sign).pt, entry(sign).en]) {
        const sentences = text.match(/[^.!?]+[.!?]/gu)!;
        expect(sentences).toHaveLength(2);
        expect(sentences.join("")).toBe(text);
        for (const sentence of sentences) expect(sentence.trim()).toMatch(/^\p{Ll}/u);
        expect(text).not.toMatch(/—|diagnos|illness|doença|\bcure\b|cura garantida|healing|vácuo|vacuum|criminal|illegal|ilegal|evil|priap|príap|você deve|you should|pratique|practice|\britual\b|\bwill\b/iu);
      }
    }
  });
  it("preserves each adopted tension and the final Root precision fixes", () => {
    expect(entry("Aries").en).toMatch(/desires that shift.*under tension.*indecision/);
    expect(entry("Taurus").pt).toMatch(/necessidade de ter e possuir; em tensão/);
    expect(entry("Taurus").pt).not.toMatch(/posse emocional|possuir emocional/);
    expect(entry("Gemini").en).toMatch(/you may also find it hard to concentrate and communicate harmoniously/);
    expect(entry("Cancer").pt).toMatch(/passado e o lar podem ocupar um lugar emocional particular.*dependendo dos aspectos/);
    expect(entry("Cancer").pt).not.toMatch(/mobilizar bastante/);
    expect(entry("Leo").en).toMatch(/may fear not being recognized.*at other times.*may also vary in intensity/);
    expect(entry("Virgo").en).toMatch(/in some activities or phases of life.*in others.*may.*surprising insights.*emotional interference may/);
    expect(entry("Libra").en).toMatch(/though you may find it hard to create harmony.*may.*loved and valued.*hard to ask for help/);
    expect(entry("Scorpio").en).toMatch(/can coexist with fear.*if poorly managed/);
    expect(entry("Sagittarius").en).toMatch(/sometimes struggle.*while finding it hard to persist/);
    expect(entry("Capricorn").en).toMatch(/may develop.*while high self-criticism.*can strain/);
    expect(entry("Capricorn").pt).not.toMatch(/masculino|feminino|pais/);
    expect(entry("Aquarius").en).toMatch(/may be something you both desire and fear/);
    expect(entry("Pisces").en).toMatch(/may react.*cyclically.*may also show compassion.*possible exhaustion/);
  });
});
