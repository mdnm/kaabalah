import { describe, expect, it } from "vitest";
import {
  getKarakamsha,
  getParivartana,
  getRasiDrishti,
  getRasiDrishtiOnSign,
  getSvamsa,
  getYogakarakas,
  housesFromKarakamsha,
} from "./jaimini";
import { calculateCharaKarakas, type KarakaBody } from "./karakas";

const names = (sign: number | string) => getRasiDrishti(sign as never).map((s) => s.sign);

describe("Karakamsha", () => {
  // Hand-built chart: Mercury has the highest degree in sign (29.61 Libra).
  const longitudes = {
    sun: 100,
    moon: 140,
    mars: 20,
    mercury: 209.61,
    jupiter: 250,
    venus: 300,
    saturn: 194, // Libra 14: air signs start from Libra, ninth navamsa part 5 -> Aquarius
  };
  const degreeInSign = (lon: number) => lon % 30;
  const karakas = calculateCharaKarakas(
    (Object.keys(longitudes) as Array<keyof typeof longitudes>).map((body) => ({
      body: body as KarakaBody,
      degreeInSign: degreeInSign(longitudes[body]),
    })),
    { scheme: 7, degreeFrame: "tropical" }
  );

  it("takes the Navamsa sign of the Atmakaraka", () => {
    expect(karakas.entries[0].body).toBe("mercury");
    const k = getKarakamsha(karakas, longitudes);
    expect(k.atmakaraka).toBe("mercury");
    expect(k.sign).toBe("Gemini");
    expect(k.signIndex).toBe(2);
    expect(getSvamsa).toBe(getKarakamsha);
  });

  it("counts houses from the Karakamsha using D9", () => {
    const houses = housesFromKarakamsha(getKarakamsha(karakas, longitudes), longitudes);
    expect(houses.mercury).toBe(1);
    expect(houses.saturn).toBe(9); // D9 Aquarius is the ninth from Gemini
    expect(housesFromKarakamsha("Gemini", { saturn: 194 }).saturn).toBe(9);
    expect(housesFromKarakamsha(2, { saturn: 194 }).saturn).toBe(9);
  });

  it("throws when the Atmakaraka has no longitude", () => {
    expect(() => getKarakamsha(karakas, { sun: 10 })).toThrow();
  });
});

describe("getRasiDrishti", () => {
  it("movable signs aspect fixed signs except the adjacent one", () => {
    expect(names("Aries")).toEqual(["Leo", "Scorpio", "Aquarius"]);
    expect(names("Capricorn")).toEqual(["Taurus", "Leo", "Scorpio"]); // Aquarius is the adjacent fixed sign
  });
  it("fixed signs aspect movable signs except the adjacent one", () => {
    expect(names("Taurus")).toEqual(["Cancer", "Libra", "Capricorn"]);
    expect(names("Aquarius")).toEqual(["Aries", "Cancer", "Libra"]);
  });
  it("dual signs aspect the other three duals", () => {
    expect(names("Gemini")).toEqual(["Virgo", "Sagittarius", "Pisces"]);
    expect(names(11)).toEqual(["Gemini", "Virgo", "Sagittarius"]);
  });
  it("is symmetric", () => {
    for (let a = 0; a < 12; a++) {
      for (const t of getRasiDrishti(a)) {
        expect(getRasiDrishti(t.signIndex).map((x) => x.signIndex)).toContain(a);
      }
    }
  });
  it("lists the bodies aspecting a sign", () => {
    const placements = { sun: "Aries", moon: "Taurus", mars: "Cancer", saturn: 8 } as const;
    expect(getRasiDrishtiOnSign("Leo", placements)).toEqual(["sun"]);
    expect(getRasiDrishtiOnSign("Pisces", placements)).toEqual(["saturn"]);
    expect(getRasiDrishtiOnSign("Capricorn", placements)).toEqual(["moon"]);
  });
});

describe("getYogakarakas", () => {
  const planets = (sign: string) => getYogakarakas(sign as never).map((y) => y.planet);
  it("matches the known results", () => {
    expect(getYogakarakas("Taurus")).toEqual([{ planet: "saturn", houses: [9, 10] }]);
    expect(getYogakarakas("Libra")).toEqual([{ planet: "saturn", houses: [4, 5] }]);
    expect(planets("Cancer")).toEqual(["mars"]);
    expect(planets("Leo")).toEqual(["mars"]);
    expect(planets("Capricorn")).toEqual(["venus"]);
    expect(planets("Aquarius")).toEqual(["venus"]);
  });
  it("does not count a lagna lord ruling only the 1st, nor Mars for Aries", () => {
    expect(planets("Aries")).toEqual([]);
    expect(planets("Scorpio")).toEqual([]);
  });
  it("does not count a lagna lord that also rules a kendra", () => {
    expect(planets("Gemini")).toEqual([]);
    expect(planets("Virgo")).toEqual([]);
    expect(planets("Sagittarius")).toEqual([]);
    expect(planets("Pisces")).toEqual([]);
  });
});

describe("getParivartana", () => {
  it("finds a mutual exchange with the houses from the ascendant", () => {
    // Sun in Aries (ruled by Mars), Mars in Leo (ruled by Sun); Taurus rising.
    const r = getParivartana({ sun: "Aries", mars: "Leo", moon: "Gemini" }, "Taurus");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ a: "mars", b: "sun", houses: { a: 4, b: 12 } });
    expect(r[0].signA.sign).toBe("Leo");
    expect(r[0].signB.sign).toBe("Aries");
  });
  it("omits houses without an ascendant and ignores one-way and node placements", () => {
    const r = getParivartana({ sun: "Aries", mars: "Leo" });
    expect(r[0].houses).toBeUndefined();
    expect(getParivartana({ sun: "Aries", mars: "Cancer", rahu: "Leo" })).toEqual([]);
  });
  it("finds several exchanges and Mercury/Venus pairs", () => {
    const r = getParivartana({ moon: "Gemini", mercury: "Cancer", venus: "Gemini", saturn: "Taurus" });
    expect(r.map((p) => [p.a, p.b])).toEqual([["mercury", "moon"]]);
    const r2 = getParivartana({ venus: "Virgo", mercury: "Libra" });
    expect(r2).toHaveLength(1);
  });
});
