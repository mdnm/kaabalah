import { describe, expect, it } from "vitest";
import { getRetrogradePlanetDescriptionEntry, type DescriptionRetrogradePlanet } from "./descriptions";
const entry = (planet: DescriptionRetrogradePlanet) => getRetrogradePlanetDescriptionEntry(planet, -1)!;
const ranges: Record<DescriptionRetrogradePlanet, number[][]> = {
  "mercury": [
    [
      544,
      547
    ],
    [
      569,
      575
    ],
    [
      613,
      617
    ]
  ],
  "venus": [
    [
      1302,
      1315
    ],
    [
      1320,
      1326
    ],
    [
      1333,
      1337
    ]
  ],
  "mars": [
    [
      2039,
      2040
    ],
    [
      2069,
      2076
    ],
    [
      2077,
      2080
    ],
    [
      2081,
      2083
    ]
  ],
  "jupiter": [
    [
      2641,
      2647
    ],
    [
      2653,
      2655
    ],
    [
      2658,
      2659
    ],
    [
      2675,
      2677
    ],
    [
      2681,
      2683
    ]
  ],
  "saturn": [
    [
      3279,
      3288
    ],
    [
      3290,
      3293
    ],
    [
      3302,
      3304
    ],
    [
      3307,
      3309
    ],
    [
      3311,
      3314
    ]
  ],
  "uranus": [
    [
      3872,
      3888
    ],
    [
      3894,
      3901
    ]
  ],
  "neptune": [
    [
      4441,
      4449
    ],
    [
      4456,
      4463
    ],
    [
      4467,
      4471
    ]
  ],
  "pluto": [
    [
      4848,
      4851
    ],
    [
      4857,
      4866
    ],
    [
      4868,
      4876
    ]
  ]
};
const bounds: Record<DescriptionRetrogradePlanet, number[]> = { mercury: [533,617], venus: [1301,1351], mars: [2038,2085], jupiter: [2640,2693], saturn: [3278,3314], uranus: [3871,3916], neptune: [4440,4471], pluto: [4847,4886] };
describe("natal retrograde profile primary meanings and qualifications", () => {
  it("pins final adopted inclusive clauses inside personality/karma and teaching boundaries", () => {
    for (const planet of Object.keys(ranges) as DescriptionRetrogradePlanet[]) {
      expect(entry(planet).src).toEqual(ranges[planet].map(([from,to]) => ({ file: "modulo 4/aula 16 modulo 4/aula-16.md", from, to })));
      for (const source of entry(planet).src) {
        expect(Number.isSafeInteger(source.from)).toBe(true);
        expect(Number.isSafeInteger(source.to)).toBe(true);
        expect(source.from).toBeGreaterThanOrEqual(bounds[planet][0]);
        expect(source.to).toBeGreaterThanOrEqual(source.from);
        expect(source.to).toBeLessThanOrEqual(bounds[planet][1]);
        expect(source.to).toBeLessThanOrEqual(5271);
      }
      expect(entry(planet).reviewNotes.join(" ")).toMatch(/não distingue.*perfil natal duradouro.*A16 tem precedência/);
    }
  });
  it("keeps two lowercase chart-owner sentences without diagnoses, past-life facts or instructions", () => {
    for (const planet of Object.keys(ranges) as DescriptionRetrogradePlanet[]) {
      expect(entry(planet).pt).toMatch(/você|seu|sua/);
      expect(entry(planet).en).toMatch(/you|your/);
      for (const text of [entry(planet).pt, entry(planet).en]) {
        const sentences = text.match(/[^.!?]+[.!?]/gu)!;
        expect(sentences).toHaveLength(2);
        expect(sentences.join("")).toBe(text);
        for (const sentence of sentences) expect(sentence.trim()).toMatch(/^\p{Ll}/u);
        expect(text).not.toMatch(/—|\d|diagnos|sexual orientation|orientação sexual|past lives|vidas passadas|reincarn|cura garantida|healing|você deve|you should|pratique|practice|\britual\b|\bwill\b/iu);
      }
    }
  });
  it("retains profile-specific learning and tensions with final precision fixes", () => {
    expect(entry("mercury").en).toMatch(/may find it difficult.*may return to questions.*learning involves.*present/);
    expect(entry("venus").en).toMatch(/not always recognizing clearly.*insecurity may lead.*seek closeness and then push others away.*may recur/);
    expect(entry("mars").en).toMatch(/may have difficulty coordinating thoughts and actions.*may project imagined past roles.*anger, hostility, or mistrust/);
    expect(entry("jupiter").en).toMatch(/may develop your own standards.*learning involves introspection, withholding judgment.*patience/);
    expect(entry("jupiter").en).not.toMatch(/prophecy|wisdom|rancor/);
    expect(entry("saturn").en).toMatch(/tasks you feel were left unfinished.*maturity may come through personal effort.*learning themes/);
    expect(entry("uranus").en).toMatch(/hard to feel understood or accompanied.*may conflict.*learning theme/);
    expect(entry("uranus").en).not.toMatch(/lose friends|lose jobs|destroys relationships/);
    expect(entry("neptune").pt).toMatch(/pode viver uma espiritualidade intensa ou sentir grande afinidade com a música/);
    expect(entry("neptune").en).toMatch(/may also experience strong spirituality or feel a great affinity for music.*a learning theme is distinguishing.*without projecting past dreams onto the present/);
    expect(entry("pluto").en).toMatch(/other people's dishonesty with themselves.*loosening attachment to other people's patterns.*learning theme/);
    expect(entry("pluto").en).not.toMatch(/first half|destiny|Christ/);
  });
});
