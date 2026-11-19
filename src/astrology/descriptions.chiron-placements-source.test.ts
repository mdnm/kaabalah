import { describe, expect, it } from "vitest";
import { getPointSignDescriptionEntry } from "./descriptions";
import type { Sign } from "./dignity";

const entry = (sign: Sign) => getPointSignDescriptionEntry("chiron", sign)!;
const ranges: Record<Sign, number[][]> = {
  "Aries": [
    [
      280,
      281
    ],
    [
      345,
      345
    ],
    [
      353,
      355
    ],
    [
      358,
      363
    ]
  ],
  "Taurus": [
    [
      372,
      375
    ],
    [
      382,
      383
    ],
    [
      388,
      388
    ]
  ],
  "Gemini": [
    [
      404,
      404
    ],
    [
      409,
      412
    ],
    [
      417,
      418
    ]
  ],
  "Cancer": [
    [
      431,
      435
    ],
    [
      455,
      456
    ]
  ],
  "Leo": [
    [
      457,
      457
    ],
    [
      459,
      461
    ],
    [
      467,
      473
    ],
    [
      485,
      486
    ]
  ],
  "Virgo": [
    [
      487,
      487
    ],
    [
      492,
      492
    ],
    [
      496,
      497
    ]
  ],
  "Libra": [
    [
      526,
      531
    ],
    [
      550,
      551
    ],
    [
      561,
      568
    ]
  ],
  "Scorpio": [
    [
      569,
      571
    ],
    [
      575,
      575
    ],
    [
      578,
      578
    ],
    [
      582,
      588
    ],
    [
      610,
      612
    ]
  ],
  "Sagittarius": [
    [
      613,
      613
    ],
    [
      615,
      616
    ],
    [
      618,
      623
    ],
    [
      635,
      637
    ],
    [
      643,
      645
    ]
  ],
  "Capricorn": [
    [
      646,
      647
    ],
    [
      650,
      652
    ],
    [
      654,
      658
    ],
    [
      676,
      679
    ]
  ],
  "Aquarius": [
    [
      680,
      683
    ],
    [
      702,
      704
    ]
  ],
  "Pisces": [
    [
      713,
      713
    ],
    [
      714,
      716
    ],
    [
      721,
      721
    ],
    [
      727,
      729
    ],
    [
      740,
      742
    ],
    [
      746,
      746
    ],
    [
      288,
      289
    ]
  ]
};

describe("Chiron combined placement primary clauses", () => {
  it("uses only adopted narrow clauses within teaching and explicit shared headings", () => {
    for (const [index, sign] of (Object.keys(ranges) as Sign[]).entries()) {
      const row = entry(sign);
      expect(row.pt).toMatch(new RegExp(`Casa ${index + 1}\\b`));
      expect(row.en).toContain(sign);
      expect(row.pt).toMatch(/ou/);
      expect(row.en).toMatch(/or/);
    }
  });

  it("keeps two lowercase direct-address sentences without fixed events or clinical promises", () => {
    for (const sign of Object.keys(ranges) as Sign[]) {
      const row = entry(sign);
      expect(row.pt).toMatch(/você|seu|sua/);
      expect(row.en).toMatch(/you|your/);
      for (const text of [row.pt, row.en]) {
        const sentences = text.match(/[^.!?]+[.!?]/gu)!;
        expect(sentences).toHaveLength(2);
        expect(sentences.join("")).toBe(text);
        for (const sentence of sentences) expect(sentence.trim()).toMatch(/^\p{Ll}/u);
        expect(text).not.toMatch(/—|diagnos|illness|doença|\bcure\b|\bcura\b|healing|trauma|abuso|abuse|childhood|infância|prenatal|mãe|mother|parents|suic|você deve|you should|pratique|practice|\britual\b|evolution|evolu[cç]|\bwill\b/iu);
      }
    }
  });

  it("preserves specific tensions and qualifications rather than substituting generic profiles", () => {
    expect(entry("Aries").pt).toMatch(/pode perceber tensão.*independência.*aceitação.*amável e sociável.*aprendizado/);
    expect(entry("Taurus").en).toMatch(/pain around loss and guilt about gaining/);
    expect(entry("Gemini").en).toMatch(/uncertain about your own ideas.*freedom of expression.*may coexist with difficulty expressing your emotional side/);
    expect(entry("Cancer").en).toMatch(/connection with humanity.*possibility of failure.*community, roots/);
    expect(entry("Leo").en).toMatch(/tension between the pleasure of creating and the need for recognition.*possibility of encouraging/);
    expect(entry("Virgo").en).toMatch(/may coexist with concern that others could take advantage/);
    expect(entry("Libra").en).toMatch(/cooperation, sharing.*may be learning themes/);
    expect(entry("Scorpio").en).toMatch(/tensions involving sexuality, spiritual values and intense feelings/);
    expect(entry("Scorpio").en).not.toMatch(/trust|conflict with each other/);
    expect(entry("Sagittarius").en).toMatch(/differing convictions may bring challenges.*learning to live with differences/);
    expect(entry("Capricorn").en).toMatch(/self-pressure may.*different forms of professional contribution still have value/);
    expect(entry("Aquarius").en).toMatch(/may feel sensitivity.*rejection.*imperfections in collective life/);
    expect(entry("Pisces").en).toMatch(/dreams and imagination may serve a protective function.*practical life remains important/);
  });
});
