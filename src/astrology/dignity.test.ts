import { describe, expect, it } from "vitest";
import {
  DOMICILE_RULERS,
  EXALTATIONS,
  getDomicileRuler,
  getExaltation,
  getOppositeSign,
  getDetriment,
  getFall,
  getEssentialDignity,
  type Sign,
} from "./dignity";

describe("Essential Dignity Table", () => {
  describe("getDomicileRuler", () => {
    const expected: [Sign, string][] = [
      ["Aries", "Mars"],
      ["Taurus", "Venus"],
      ["Gemini", "Mercury"],
      ["Cancer", "Moon"],
      ["Leo", "Sun"],
      ["Virgo", "Mercury"],
      ["Libra", "Venus"],
      ["Scorpio", "Mars"],
      ["Sagittarius", "Jupiter"],
      ["Capricorn", "Saturn"],
      ["Aquarius", "Saturn"],
      ["Pisces", "Jupiter"],
    ];

    it.each(expected)("%s is ruled by %s", (sign, ruler) => {
      expect(getDomicileRuler(sign)).toBe(ruler);
    });
  });

  describe("getExaltation", () => {
    it.each([
      ["Sun", "Aries", 19],
      ["Moon", "Taurus", 3],
      ["Mercury", "Virgo", 15],
      ["Venus", "Pisces", 27],
      ["Mars", "Capricorn", 28],
      ["Jupiter", "Cancer", 15],
      ["Saturn", "Libra", 21],
    ] as const)("%s is exalted in %s at %d degrees", (planet, sign, degree) => {
      const result = getExaltation(planet);
      expect(result.sign).toBe(sign);
      expect(result.degree).toBe(degree);
    });
  });

  describe("getOppositeSign", () => {
    const pairs: [Sign, Sign][] = [
      ["Aries", "Libra"],
      ["Taurus", "Scorpio"],
      ["Gemini", "Sagittarius"],
      ["Cancer", "Capricorn"],
      ["Leo", "Aquarius"],
      ["Virgo", "Pisces"],
      ["Libra", "Aries"],
      ["Scorpio", "Taurus"],
      ["Sagittarius", "Gemini"],
      ["Capricorn", "Cancer"],
      ["Aquarius", "Leo"],
      ["Pisces", "Virgo"],
    ];

    it.each(pairs)("opposite of %s is %s", (sign, opposite) => {
      expect(getOppositeSign(sign)).toBe(opposite);
    });
  });

  describe("getDetriment", () => {
    it("Sun is in detriment in Aquarius", () => {
      expect(getDetriment("Sun")).toEqual(["Aquarius"]);
    });

    it("Mars is in detriment in Libra and Taurus", () => {
      expect(getDetriment("Mars").sort()).toEqual(["Libra", "Taurus"].sort());
    });

    it("Venus is in detriment in Aries and Scorpio", () => {
      expect(getDetriment("Venus").sort()).toEqual(["Aries", "Scorpio"].sort());
    });
  });

  describe("getFall", () => {
    it("Sun falls in Libra", () => {
      expect(getFall("Sun")).toBe("Libra");
    });

    it("Moon falls in Scorpio", () => {
      expect(getFall("Moon")).toBe("Scorpio");
    });

    it("Saturn falls in Aries", () => {
      expect(getFall("Saturn")).toBe("Aries");
    });
  });

  describe("getEssentialDignity", () => {
    it("Sun in Leo = domicile", () => {
      const result = getEssentialDignity("Sun", "Leo");
      expect(result.domicile).toBe(true);
      expect(result.exaltation).toBe(false);
      expect(result.detriment).toBe(false);
      expect(result.fall).toBe(false);
      expect(result.peregrine).toBe(false);
      expect(result.domicileRuler).toBe("Sun");
    });

    it("Sun in Aries = exaltation", () => {
      const result = getEssentialDignity("Sun", "Aries");
      expect(result.exaltation).toBe(true);
      expect(result.domicile).toBe(false);
      expect(result.peregrine).toBe(false);
    });

    it("Sun in Aquarius = detriment", () => {
      const result = getEssentialDignity("Sun", "Aquarius");
      expect(result.detriment).toBe(true);
      expect(result.domicile).toBe(false);
      expect(result.peregrine).toBe(false);
    });

    it("Sun in Libra = fall", () => {
      const result = getEssentialDignity("Sun", "Libra");
      expect(result.fall).toBe(true);
      expect(result.domicile).toBe(false);
      expect(result.peregrine).toBe(false);
    });

    it("Sun in Taurus = peregrine", () => {
      const result = getEssentialDignity("Sun", "Taurus");
      expect(result.peregrine).toBe(true);
      expect(result.domicile).toBe(false);
      expect(result.exaltation).toBe(false);
      expect(result.detriment).toBe(false);
      expect(result.fall).toBe(false);
      expect(result.domicileRuler).toBe("Venus");
    });

    it("Mercury in Virgo = domicile + exaltation", () => {
      const result = getEssentialDignity("Mercury", "Virgo");
      expect(result.domicile).toBe(true);
      expect(result.exaltation).toBe(true);
      expect(result.peregrine).toBe(false);
    });
  });
});

import {
  DIGNITY_TRADITION,
  DOROTHEAN_TRIPLICITY_RULERS,
  EGYPTIAN_BOUNDS,
  getDorotheanTriplicity,
  getEgyptianBound,
  getEssentialDignities,
  getFaceRuler,
  SIGN_ELEMENTS,
  type TraditionalPlanet as TPlanet,
} from "./dignity";
import { SIGNS as ALL_SIGNS } from "./index";

describe("Dorothean triplicity rulers", () => {
  it("matches the published Dorothean table", () => {
    expect(DOROTHEAN_TRIPLICITY_RULERS.fire).toEqual({ day: "Sun", night: "Jupiter", participating: "Saturn" });
    expect(DOROTHEAN_TRIPLICITY_RULERS.earth).toEqual({ day: "Venus", night: "Moon", participating: "Mars" });
    expect(DOROTHEAN_TRIPLICITY_RULERS.air).toEqual({ day: "Saturn", night: "Mercury", participating: "Jupiter" });
    expect(DOROTHEAN_TRIPLICITY_RULERS.water).toEqual({ day: "Venus", night: "Mars", participating: "Moon" });
  });
  it("assigns elements cyclically fire, earth, air, water", () => {
    const cycle = ["fire", "earth", "air", "water"];
    ALL_SIGNS.forEach((s, i) => expect(SIGN_ELEMENTS[s]).toBe(cycle[i % 4]));
    expect(getDorotheanTriplicity("Libra").element).toBe("air");
  });
});

describe("Egyptian bounds", () => {
  it("each sign's bounds are contiguous, half-open and sum to 30 degrees", () => {
    for (const sign of ALL_SIGNS) {
      const segs = EGYPTIAN_BOUNDS[sign];
      expect(segs).toHaveLength(5);
      expect(segs[0].start).toBe(0);
      expect(segs[4].end).toBe(30);
      let sum = 0;
      segs.forEach((s, i) => {
        expect(s.end).toBeGreaterThan(s.start);
        if (i > 0) expect(s.start).toBe(segs[i - 1].end);
        sum += s.end - s.start;
        expect(["Mercury", "Venus", "Mars", "Jupiter", "Saturn"]).toContain(s.ruler);
      });
      expect(sum).toBe(30);
    }
  });
  it("planet totals match the published Egyptian totals (Saturn 57, Mars 66, Mercury 76, Jupiter 79, Venus 82)", () => {
    const totals: Record<string, number> = {};
    for (const sign of ALL_SIGNS)
      for (const s of EGYPTIAN_BOUNDS[sign]) totals[s.ruler] = (totals[s.ruler] ?? 0) + s.end - s.start;
    expect(totals).toEqual({ Saturn: 57, Mars: 66, Mercury: 76, Jupiter: 79, Venus: 82 });
  });
  it("uses [start, end) endpoints", () => {
    expect(getEgyptianBound(0).ruler).toBe("Jupiter"); // 0 Aries
    expect(getEgyptianBound(5.9999).ruler).toBe("Jupiter");
    expect(getEgyptianBound(6).ruler).toBe("Venus");
    expect(getEgyptianBound(29.9999).ruler).toBe("Saturn");
    expect(getEgyptianBound(30).ruler).toBe("Venus"); // 0 Taurus (Aries 30 excluded)
    expect(getEgyptianBound(30).sign).toBe("Taurus");
    expect(getEgyptianBound(37.999).ruler).toBe("Venus"); // Taurus 7.999 < 8
    expect(getEgyptianBound(38).ruler).toBe("Mercury"); // Taurus 8
    expect(getEgyptianBound(359.9999).ruler).toBe("Saturn");
    expect(getEgyptianBound(360).ruler).toBe("Jupiter"); // wraps to 0 Aries
    expect(getEgyptianBound(-0.0001).sign).toBe("Pisces");
  });
  it("spot checks of classical cells", () => {
    expect(getEgyptianBound(15 + 0).ruler).toBe("Mercury"); // Aries 15
    expect(getEgyptianBound(90 + 7).ruler).toBe("Venus"); // Cancer 7
    expect(getEgyptianBound(150 + 27).ruler).toBe("Mars"); // Virgo 27
    expect(getEgyptianBound(180 + 3).ruler).toBe("Saturn"); // Libra 3
    expect(getEgyptianBound(330 + 15.5).ruler).toBe("Jupiter"); // Pisces 15.5
  });
});

describe("faces (Chaldean decans)", () => {
  it("follow the Chaldean order from Mars at 0 Aries", () => {
    const order: TPlanet[] = ["Mars", "Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter"];
    for (let i = 0; i < 36; i++) {
      expect(getFaceRuler(i * 10 + 5)).toBe(order[i % 7]);
    }
    expect(getFaceRuler(10)).toBe("Sun");
    expect(getFaceRuler(9.9999)).toBe("Mars");
  });
});

describe("getEssentialDignities", () => {
  it("reports every dignity with sect-dependent triplicity", () => {
    // Sun at Aries 10.5: domicile Mars, exalted Sun (Aries), fire day ruler Sun, bound Venus (6-12), face Sun (10-20)
    const day = getEssentialDignities("Sun", 10.5, "diurnal");
    expect(day.domicile).toBe(false);
    expect(day.exaltation).toBe(true);
    expect(day.triplicity).toBe(true);
    expect(day.triplicityRole).toBe("day");
    expect(day.bound).toBe(false);
    expect(day.face).toBe(true);
    expect(day.peregrine).toBe(false);
    expect(day.positiveDignities).toEqual(["exaltation", "triplicity", "face"]);
    expect(day.rulers.bound).toBe("Venus");
    expect(day.rulers.triplicity.sectRuler).toBe("Sun");

    const night = getEssentialDignities("Sun", 10.5, "nocturnal");
    expect(night.triplicity).toBe(false);
    expect(night.triplicityRole).toBe("day"); // still the day ruler of fire
    expect(night.rulers.triplicity.sectRuler).toBe("Jupiter");

    const jup = getEssentialDignities("Jupiter", 10.5, "nocturnal");
    expect(jup.triplicity).toBe(true);
    expect(getEssentialDignities("Jupiter", 10.5, "diurnal").triplicity).toBe(false);
    const sat = getEssentialDignities("Saturn", 10.5, "diurnal");
    expect(sat.participatingTriplicity).toBe(true);
    expect(sat.triplicity).toBe(false);
    expect(sat.peregrine).toBe(false);
  });
  it("peregrine requires no positive dignity; detriment and fall do not count as dignity", () => {
    // Saturn at Aries 28: fall? Saturn falls in Aries (opposite Libra). Fire participating ruler is Saturn -> not peregrine
    const s = getEssentialDignities("Saturn", 28, "diurnal");
    expect(s.fall).toBe(true);
    expect(s.bound).toBe(true); // Aries 25-30 Saturn
    expect(s.peregrine).toBe(false);
    // Moon at Aries 28: Aries is fire; Moon rules none of fire triplicity; bound Saturn; face (20-30) Venus; not dignified -> peregrine
    const m = getEssentialDignities("Moon", 28, "diurnal");
    expect(m.positiveDignities).toEqual([]);
    expect(m.peregrine).toBe(true);
    expect(m.detriment).toBe(false);
    // legacy getEssentialDignity calls Moon in Aries peregrine too but also calls Mercury at Aries 15 peregrine although it holds the bound
    expect(getEssentialDignity("Mercury", "Aries").peregrine).toBe(true);
    const merc = getEssentialDignities("Mercury", 15, "diurnal");
    expect(merc.bound).toBe(true);
    expect(merc.peregrine).toBe(false);
    // Mars at Libra 5 (detriment): bound Saturn (0-6), face Moon? Libra decan1 index 18 -> 18%7=4 Moon; air: Saturn/Mercury/Jupiter -> Mars has nothing
    const mars = getEssentialDignities("Mars", 185, "nocturnal");
    expect(mars.detriment).toBe(true);
    expect(mars.peregrine).toBe(true);
  });
  it("is consistent with the legacy booleans and carries tradition metadata", () => {
    for (const planet of ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"] as TPlanet[]) {
      for (let i = 0; i < 12; i++) {
        const d = getEssentialDignities(planet, i * 30 + 12, null);
        const legacy = getEssentialDignity(planet, ALL_SIGNS[i]);
        expect(d.domicile).toBe(legacy.domicile);
        expect(d.exaltation).toBe(legacy.exaltation);
        expect(d.detriment).toBe(legacy.detriment);
        expect(d.fall).toBe(legacy.fall);
        expect(d.triplicity).toBe(false); // no sect supplied
        expect(d.rulers.domicile).toBe(legacy.domicileRuler);
        if (legacy.domicile || legacy.exaltation) expect(d.peregrine).toBe(false);
      }
    }
    const d = getEssentialDignities("Venus", 100, "diurnal");
    expect(d.tradition).toBe(DIGNITY_TRADITION);
    expect(DIGNITY_TRADITION.triplicity).toMatch(/Dorothean/);
    expect(DIGNITY_TRADITION.bounds).toMatch(/Egyptian/);
    expect(DIGNITY_TRADITION.intervalConvention).toMatch(/\[start, end\)/);
  });
});
