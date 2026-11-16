import { describe, expect, it } from "vitest";
import { calculateGematria } from "../gematria";
import {
  NumerologyScheduleError,
  calculateChallenges,
  calculateFibonacciCycle,
  calculatePersonalCycles,
  calculatePersonalMonths,
  calculatePersonalYear,
  generateNumerologyTimeline,
  getNumerologyMethodMetadata,
  getNumerologySnapshot,
  type HeptadInterval,
  type PersonalMonthInterval,
  type PersonalPeriodInterval,
  type PersonalYearInterval,
  type ScheduleInterval,
  type ShortMonthPolicy,
} from "./index";

// ---- independent helpers (UTC epoch days; no library code) -----------------
const epochDay = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  const t = new Date(Date.UTC(2000, 0, 1));
  t.setUTCFullYear(y, m - 1, d);
  return Math.round(t.getTime() / 86400000);
};
const addIso = (iso: string, days: number) => {
  const t = new Date(0);
  t.setUTCDate(1);
  t.setTime((epochDay(iso) + days) * 86400000);
  return `${String(t.getUTCFullYear()).padStart(4, "0")}-${String(t.getUTCMonth() + 1).padStart(2, "0")}-${String(t.getUTCDate()).padStart(2, "0")}`;
};
const localNoon = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  const r = new Date(2000, 0, 1, 12);
  r.setFullYear(y, m - 1, d);
  return r;
};
const digitRoot = (n: number) => (n === 0 ? 0 : 1 + ((n - 1) % 9));
/** Independent master-preserving reduction (11/22/33/44 stop the reduction at any step). */
const reduceKeep = (n: number): number => {
  let v = n;
  while (v > 9 && ![11, 22, 33, 44].includes(v)) v = String(v).split("").reduce((a, c) => a + Number(c), 0);
  return v;
};
const timeline = (birth: string, from: string, to: string, layers: any[], extra: object = {}) =>
  generateNumerologyTimeline({ birth, from, toExclusive: to, layers, ...extra });

describe("getNumerologySnapshot: birthday frame", () => {
  const snap = getNumerologySnapshot({ birth: "2001-10-20", asOf: "2026-08-30", firstName: "Ana" });

  it("uses completed age, last birthday year and exclusive ends", () => {
    expect(snap.status).toBe("ok");
    expect(snap.completedAge).toBe(24);
    expect(snap.lastBirthdayYear).toBe(2025);
    expect(snap.birthdayYear?.start).toBe("2025-10-20");
    expect(snap.birthdayYear?.endExclusive).toBe("2026-10-20");
    expect(snap.birthdayYear?.clipped).toBe(false);
    expect(snap.birthdayYear?.personalYear.value).toBe(3); // 20 + 10 + 2025 = 2055 -> 12 -> 3
    expect(snap.birthdayYear?.personalYear.reductionSteps).toEqual([2055, 12, 3]);
  });

  it("separates phase from value for personal months and periods", () => {
    const pm = snap.personalMonth!;
    expect(pm.phase).toBe(11);
    expect(pm.calendarMonth).toBe(8); // Oct, Nov, ... Aug is the 11th month
    expect(pm.start).toBe("2026-08-20");
    expect(pm.endExclusive).toBe("2026-09-20");
    expect(pm.value.value).toBe(11); // 3 + 8 = 11, master preserved
    expect(pm.value.isMaster).toBe(true);
    const pp = snap.personalPeriod!;
    expect(pp.phase).toBe(3);
    expect(pp.monthPhases).toEqual([9, 12]);
    expect(pp.start).toBe("2026-06-20");
    expect(pp.endExclusive).toBe("2026-10-20");
  });

  it("gives heptad 7 (offset 312+) with a day counter from civil ordinals", () => {
    const offset = epochDay("2026-08-30") - epochDay("2025-10-20");
    expect(Math.min(Math.floor(offset / 52), 6) + 1).toBe(7);
    expect(snap.heptad?.phase).toBe(7);
    expect(snap.heptad?.dayInHeptad).toBe(offset - 312 + 1);
    expect(snap.heptad?.isRemainder).toBe(true);
    expect(snap.heptad?.endExclusive).toBe("2026-10-20");
    expect(snap.dayInBirthdayYear).toBe(offset + 1);
  });

  it("exposes repeating label, absolute index and year position", () => {
    expect(snap.ageCycle).toMatchObject({ label: 4, absoluteIndex: 3, yearPosition: 4, start: "2022-10-20", endExclusive: "2029-10-20" });
    expect(snap.birthdayYear?.ageCycle).toEqual({ label: 4, absoluteIndex: 3, yearPosition: 4 });
    expect(snap.fibonacci?.completedAge).toBe(24);
  });

  it("age 77 after 49 points at the real block (birth 1949-06-18)", () => {
    const s = getNumerologySnapshot({ birth: "1949-06-18", asOf: "2026-08-30" });
    expect(s.ageCycle).toMatchObject({ label: 5, absoluteIndex: 11, yearPosition: 1, start: "2026-06-18", endExclusive: "2033-06-18" });
  });

  it("age 48/49 and 97/98 wrap on the birthday", () => {
    const at = (asOf: string) => getNumerologySnapshot({ birth: "1920-03-05", asOf }).ageCycle!;
    expect(at("1968-03-04")).toMatchObject({ label: 7, absoluteIndex: 6 });
    expect(at("1969-03-05")).toMatchObject({ label: 1, absoluteIndex: 7 });
    expect(at("2018-03-04")).toMatchObject({ label: 7, absoluteIndex: 13 });
    expect(at("2018-03-05")).toMatchObject({ label: 1, absoluteIndex: 14 });
  });

  it("DST-independent repro: heptad day 32 on 2018-11-05", () => {
    const s = getNumerologySnapshot({ birth: "2001-10-05", asOf: "2018-11-05" });
    expect(s.heptad?.dayInHeptad).toBe(32);
    expect(s.heptad?.phase).toBe(1);
  });

  it("matches the legacy Date calculators on a day-by-day sweep", () => {
    for (const birth of ["2000-09-28", "1999-11-29", "1996-02-29", "1990-01-31", "1990-01-30", "1990-01-29", "2001-12-31"]) {
      for (let off = 0; off < 800; off += 3) {
        const asOf = addIso("2010-01-01", off * 4);
        if (asOf < birth) continue;
        const s = getNumerologySnapshot({ birth, asOf, firstName: "Ana" });
        const legacy = calculatePersonalCycles(localNoon(birth), localNoon(asOf), "Ana");
        expect(s.completedAge, `${birth} @ ${asOf}`).toBe(legacy.currentAge);
        expect(s.lastBirthdayYear).toBe(legacy.yearUsedOnCalculations);
        expect(s.birthdayYear!.personalYear.value).toBe(legacy.personalYear.reducedValue);
        expect(s.personalMonth!.phase - 1).toBe(legacy.currentPersonalMonth);
        expect(s.personalPeriod!.phase - 1).toBe(legacy.currentPersonalPeriod);
        expect(s.personalMonth!.value.value).toBe(legacy.personalMonths[legacy.currentPersonalMonth].value.reducedValue);
        expect(s.personalMonth!.calendarMonth).toBe(legacy.personalMonths[legacy.currentPersonalMonth].month);
        const pv = s.personalPeriod!.value;
        expect(pv.available && pv.value).toBe(legacy.personalPeriods[legacy.currentPersonalPeriod].value.reducedValue);
        expect(s.fibonacci!.cycles.map((c) => c.value)).toEqual(
          (() => {
            const f = calculateFibonacciCycle(localNoon(birth), localNoon(asOf));
            return [f.cycle1, f.cycle2, f.cycle3, f.cycle4, f.cycle5, f.cycle6, f.cycle7].map((c) => c.reducedValue);
          })()
        );
        expect(s.birthdayYear!.personalYear.value).toBe(calculatePersonalYear(localNoon(birth), localNoon(asOf)).reducedValue);
        const idx = calculatePersonalMonths(localNoon(birth), calculatePersonalYear(localNoon(birth), localNoon(asOf)), localNoon(asOf)).currentPersonalMonthIndex;
        expect(s.personalMonth!.phase - 1).toBe(idx);
      }
    }
  });

  it("is before-birth, after-death and after-horizon outside coverage", () => {
    expect(getNumerologySnapshot({ birth: "2001-10-20", asOf: "2001-10-01" }).status).toBe("before-birth");
    const d = getNumerologySnapshot({ birth: "1950-03-03", asOf: "2020-05-06", limits: { death: "2020-05-05" } });
    expect(d.status).toBe("after-death");
    expect(d.birthdayYear).toBeNull();
    expect(getNumerologySnapshot({ birth: "1950-03-03", asOf: "2020-05-05", limits: { death: "2020-05-05" } }).status).toBe("ok");
    expect(getNumerologySnapshot({ birth: "1950-03-03", asOf: "2020-05-05", limits: { horizonEndExclusive: "2020-05-05" } }).status).toBe("after-horizon");
  });
});

describe("personal periods and names", () => {
  const periods = (firstName: string | null | undefined, extra: object = {}) =>
    timeline("2001-10-20", "2025-10-20", "2026-10-20", ["personal-period"], { firstName, ...extra })
      .intervals as PersonalPeriodInterval[];

  it("computes periods 1 and 2 and marks 3 unavailable when the name is missing, blank or null", () => {
    for (const name of [undefined, null, "", "   "]) {
      const [p1, p2, p3] = periods(name);
      expect(p1.value.available).toBe(true);
      expect(p2.value.available).toBe(true);
      expect(p3.value).toMatchObject({ available: false, reason: "first-name-missing" });
      expect(JSON.stringify(p3.value)).not.toContain('"value"');
    }
  });

  it("period formulas: birthday year + completed age / kaabalistic life path / vowel soul number", () => {
    const [p1, p2, p3] = periods("Ana");
    expect(p1.value).toMatchObject({ available: true, addend: 24, value: reduceKeep(2025 + 24) }); // 2049 -> 15 -> 6
    expect(p2.value.available && p2.value.addendSource).toBe("life-path");
    const soul = calculateGematria("Ana").vowels.finalValue;
    expect(p3.value).toMatchObject({ available: true, addend: soul, addendSource: "first-name-soul-number" });
    expect(p3.value.available && p3.value.value).toBe(reduceKeep(2025 + soul));
  });

  it("name without vowels is unavailable, never soul 0", () => {
    const snap = getNumerologySnapshot({ birth: "2001-10-20", asOf: "2026-08-30", firstName: "Ng" });
    const vowels = calculateGematria("Ng").vowels;
    if (vowels.originalSum === 0) {
      expect(snap.fixedNumbers.firstNameSoulNumber).toMatchObject({ available: false, reason: "first-name-has-no-vowels" });
    }
    const blank = getNumerologySnapshot({ birth: "2001-10-20", asOf: "2026-08-30" });
    expect(blank.fixedNumbers.firstNameSoulNumber).toMatchObject({ available: false });
  });

  it("name kinds: first token vs the whole supplied string", () => {
    const token = getNumerologySnapshot({ birth: "2001-10-20", asOf: "2026-08-30", firstName: "Ana Beth" });
    const full = getNumerologySnapshot({ birth: "2001-10-20", asOf: "2026-08-30", firstName: "Ana Beth", nameKind: "full-name" });
    const t = token.fixedNumbers.firstNameSoulNumber;
    const f = full.fixedNumbers.firstNameSoulNumber;
    expect(t.available && t.value).toBe(calculateGematria("Ana").vowels.finalValue);
    expect(f.available && f.value).toBe(calculateGematria("Ana Beth").vowels.finalValue);
    expect(token.meta.nameInput.kind).toBe("first-token");
    expect(full.meta.nameInput.kind).toBe("full-name");
  });

  it("preserves Ã/Ç gematria mapping (João vs Joao: Ã = 5, A = 1)", () => {
    const soul = (firstName: string) =>
      getNumerologySnapshot({ birth: "2001-10-20", asOf: "2026-08-30", firstName }).fixedNumbers.firstNameSoulNumber;
    const a = soul("João");
    const plain = soul("Joao");
    expect(a.available && a.value).toBe(calculateGematria("João").vowels.finalValue);
    expect(a.available && a.value).toBe(8); // O + Ã + O with Ã = 5
    expect(plain.available && plain.value).toBe(4); // A = 1, four less than Ã
  });

  it("master policy: preserve keeps 11, reduce gives single digits; Fibonacci never preserves", () => {
    const keep = getNumerologySnapshot({ birth: "2000-01-02", asOf: "2024-06-01" });
    const drop = getNumerologySnapshot({ birth: "2000-01-02", asOf: "2024-06-01", masters: "reduce" });
    expect(keep.birthdayYear?.personalYear).toMatchObject({ value: 11, isMaster: true }); // 2 + 1 + 2024 = 2027 -> 11
    expect(drop.birthdayYear?.personalYear).toMatchObject({ value: 2, isMaster: false });
    expect(keep.meta.masterPolicy).toBe("preserve");
    expect(drop.meta.masterPolicy).toBe("reduce");
    for (const c of keep.fibonacci!.cycles) expect(c.value).toBeLessThan(10);
  });

  it("life path method is selectable and recorded", () => {
    const k = getNumerologySnapshot({ birth: "1990-11-18", asOf: "2026-08-30" });
    const s = getNumerologySnapshot({ birth: "1990-11-18", asOf: "2026-08-30", lifePathMethod: "straight-across" });
    expect(k.fixedNumbers.lifePath).toMatchObject({ available: true, method: "kaabalistic" });
    expect(s.fixedNumbers.lifePath).toMatchObject({ available: true, method: "straight-across", value: 3 }); // 18111990 -> 30 -> 3
    expect(s.meta.lifePathMethod).toBe("straight-across");
  });
});

describe("short-month policies for personal-month boundaries", () => {
  const starts = (birth: string, policy: ShortMonthPolicy) => {
    const y = Number(birth.slice(0, 4));
    return (timeline(birth, birth, `${y + 1}-${birth.slice(5)}`, ["personal-month"], { shortMonthPolicy: policy }).intervals as PersonalMonthInterval[]).map(
      (m) => m.start
    );
  };

  it("day 31 in a common year", () => {
    expect(starts("2025-01-31", "next-month-first")).toEqual([
      "2025-01-31", "2025-03-01", "2025-03-31", "2025-05-01", "2025-05-31", "2025-07-01",
      "2025-07-31", "2025-08-31", "2025-10-01", "2025-10-31", "2025-12-01", "2025-12-31",
    ]);
    expect(starts("2025-01-31", "clamp")).toEqual([
      "2025-01-31", "2025-02-28", "2025-03-31", "2025-04-30", "2025-05-31", "2025-06-30",
      "2025-07-31", "2025-08-31", "2025-09-30", "2025-10-31", "2025-11-30", "2025-12-31",
    ]);
    expect(starts("2025-01-31", "overflow")).toEqual([
      "2025-01-31", "2025-03-03", "2025-03-31", "2025-05-01", "2025-05-31", "2025-07-01",
      "2025-07-31", "2025-08-31", "2025-10-01", "2025-10-31", "2025-12-01", "2025-12-31",
    ]);
  });

  it.each([
    // birth, policy, expected start of phase 2 (February label)
    ["2025-01-30", "next-month-first", "2025-03-01"],
    ["2025-01-30", "clamp", "2025-02-28"],
    ["2025-01-30", "overflow", "2025-03-02"],
    ["2025-01-29", "next-month-first", "2025-03-01"],
    ["2025-01-29", "clamp", "2025-02-28"],
    ["2025-01-29", "overflow", "2025-03-01"],
    ["2024-01-31", "next-month-first", "2024-03-01"],
    ["2024-01-31", "clamp", "2024-02-29"],
    ["2024-01-31", "overflow", "2024-03-02"],
    ["2024-01-30", "next-month-first", "2024-03-01"],
    ["2024-01-30", "clamp", "2024-02-29"],
    ["2024-01-30", "overflow", "2024-03-01"],
    ["2024-01-29", "next-month-first", "2024-02-29"],
    ["2024-01-29", "clamp", "2024-02-29"],
    ["2024-01-29", "overflow", "2024-02-29"],
  ] as const)("birth %s, %s -> February phase starts %s", (birth, policy, expected) => {
    const y = Number(birth.slice(0, 4));
    const months = timeline(birth, birth, `${y + 1}-${birth.slice(5)}`, ["personal-month"], { shortMonthPolicy: policy }).intervals as PersonalMonthInterval[];
    expect(months[1].start).toBe(expected);
    expect(months[1].calendarMonth).toBe(2); // nominal label preserved
    expect(months[1].value.value).toBeGreaterThan(0);
    expect(months[1].shortMonthPolicy).toBe(policy);
  });

  it("flags adjusted starts and keeps nominal text", () => {
    const months = timeline("2025-01-31", "2025-01-31", "2026-01-31", ["personal-month"]).intervals as PersonalMonthInterval[];
    expect(months[1]).toMatchObject({ startAdjusted: true, nominalStartText: "2025-02-31", start: "2025-03-01" });
    expect(months[2]).toMatchObject({ startAdjusted: false });
  });

  it("default policy is the legacy one", () => {
    expect(getNumerologySnapshot({ birth: "2025-01-31", asOf: "2025-03-01" }).meta.shortMonthPolicy).toBe("next-month-first");
    expect(getNumerologySnapshot({ birth: "2025-01-31", asOf: "2025-03-01" }).personalMonth?.phase).toBe(2);
  });

  it.each(["next-month-first", "clamp", "overflow"] as const)("policy %s: intervals stay contiguous and twelve per year for days 29-31", (policy) => {
    for (const birth of ["2023-01-29", "2023-01-30", "2023-01-31", "2024-01-31", "2024-02-29", "2023-08-31", "2023-03-31"]) {
      const y = Number(birth.slice(0, 4));
      const months = timeline(birth, birth, `${y + 3}-12-31`, ["personal-month"], { shortMonthPolicy: policy }).intervals as PersonalMonthInterval[];
      for (let i = 1; i < months.length; i++) expect(months[i].start, `${birth} ${i}`).toBe(months[i - 1].endExclusive);
      for (const m of months) expect(m.lengthDays).toBeGreaterThan(0);
      const perYear = new Map<number, number>();
      for (const m of months) perYear.set(m.birthdayYear, (perYear.get(m.birthdayYear) ?? 0) + 1);
      const complete = [...perYear.entries()].slice(0, -1); // the last year is cut by the window
      expect(complete.length).toBeGreaterThanOrEqual(2);
      for (const [, n] of complete) expect(n).toBe(12);
    }
  });
});

describe("timeline invariants", () => {
  const births = ["2001-10-20", "1996-02-29", "1990-01-31", "2000-12-31", "1950-03-30"];

  it("year intervals are contiguous half-open and heptad lengths sum to the birthday year", () => {
    for (const birth of births) {
      const tl = timeline(birth, "2005-01-01", "2012-01-01", ["personal-year", "heptad", "personal-period", "personal-month", "fibonacci"], { firstName: "Ana" });
      const byLayer = (l: string) => tl.intervals.filter((i) => i.layer === l) as any[];
      for (const layer of ["personal-year", "personal-month", "personal-period", "heptad", "fibonacci"]) {
        const list = byLayer(layer).filter((i) => (layer === "fibonacci" ? true : true));
        for (let i = 1; i < list.length; i++) {
          expect(list[i].start, `${birth} ${layer}`).toBe(list[i - 1].endExclusive);
        }
        for (const iv of list) expect(iv.start < iv.endExclusive!).toBe(true);
      }
      for (const year of (byLayer("personal-year") as PersonalYearInterval[]).filter((y) => y.start >= "2005-01-01" && y.endExclusive! <= "2012-01-01")) {
        const hs = (byLayer("heptad") as HeptadInterval[]).filter((h) => h.birthdayYear === year.birthdayYear);
        expect(hs).toHaveLength(7);
        expect(hs.reduce((a, h) => a + h.lengthDays!, 0)).toBe(epochDay(year.endExclusive!) - epochDay(year.start));
        for (const h of hs.slice(0, 6)) expect(h.lengthDays).toBe(52);
        expect([53, 54, 52]).toContain(hs[6].lengthDays); // 52 only for Feb-29 births (year of 364 days)
        const months = (byLayer("personal-month") as PersonalMonthInterval[]).filter((m) => m.birthdayYear === year.birthdayYear);
        expect(months).toHaveLength(12);
        expect(months[0].start).toBe(year.start);
        expect(months[11].endExclusive).toBe(year.endExclusive);
        const periods = (byLayer("personal-period") as PersonalPeriodInterval[]).filter((m) => m.birthdayYear === year.birthdayYear);
        expect(periods).toHaveLength(3);
        expect(periods[0].start).toBe(months[0].start);
        expect(periods[1].start).toBe(months[4].start);
        expect(periods[2].start).toBe(months[8].start);
        expect(periods[2].endExclusive).toBe(year.endExclusive);
      }
    }
  });

  it("heptad 7 spans 53/54 days for ordinary birthdays and ends on the real next birthday", () => {
    const hs = timeline("2001-10-20", "2018-10-20", "2024-10-20", ["heptad"]).intervals as HeptadInterval[];
    const sevenths = hs.filter((h) => h.isRemainder);
    for (const h of sevenths) {
      expect(h.endExclusive!.slice(5)).toBe("10-20");
      expect([53, 54]).toContain(h.lengthDays);
    }
    // 2019-10-20 -> 2020-10-20 spans Feb 29 2020: 366 days -> 54
    const y2019 = sevenths.find((h) => h.birthdayYear === 2019)!;
    expect(y2019.lengthDays).toBe(366 - 312);
    const y2018 = sevenths.find((h) => h.birthdayYear === 2018)!;
    expect(y2018.lengthDays).toBe(365 - 312);
  });

  it("a snapshot on any day lies in exactly one interval of each layer and agrees with it", () => {
    for (const birth of births) {
      const from = "2009-01-01";
      const tl = timeline(birth, from, "2012-01-01", ["personal-year", "personal-month", "personal-period", "heptad"], { firstName: "Ana" });
      for (let off = 0; off < 1095; off += 7) {
        const asOf = addIso(from, off);
        const s = getNumerologySnapshot({ birth, asOf, firstName: "Ana" });
        for (const [layer, got] of [
          ["personal-year", s.birthdayYear],
          ["personal-month", s.personalMonth],
          ["personal-period", s.personalPeriod],
          ["heptad", s.heptad],
        ] as const) {
          const hits = tl.intervals.filter((i) => i.layer === layer && i.start <= asOf && asOf < i.endExclusive!);
          expect(hits, `${birth} ${asOf} ${layer}`).toHaveLength(1);
          expect(hits[0].start).toBe(got!.start);
          expect(hits[0].endExclusive).toBe(got!.endExclusive);
        }
      }
    }
  });

  it("window selection keeps real (unclipped) bounds", () => {
    const tl = timeline("2001-10-20", "2026-01-01", "2026-02-01", ["personal-year"]);
    expect(tl.intervals).toHaveLength(1);
    expect(tl.intervals[0]).toMatchObject({ start: "2025-10-20", endExclusive: "2026-10-20", clipped: false });
  });

  it("is sorted by start then layer order", () => {
    const tl = timeline("2001-10-20", "2025-10-20", "2026-10-20", ["heptad", "personal-year", "personal-month"]);
    for (let i = 1; i < tl.intervals.length; i++) expect(tl.intervals[i - 1].start <= tl.intervals[i].start).toBe(true);
    expect(tl.intervals[0].layer).toBe("personal-year");
  });
});

describe("limits: clipped versus nominal ends", () => {
  it("death date clips the last interval and drops later ones", () => {
    const tl = timeline("1950-03-03", "2019-01-01", "2023-01-01", ["personal-year", "personal-month"], { limits: { death: "2020-05-05" } });
    const years = tl.intervals.filter((i) => i.layer === "personal-year") as PersonalYearInterval[];
    expect(years.map((y) => y.birthdayYear)).toEqual([2018, 2019, 2020]);
    expect(years[1]).toMatchObject({ clipped: false, endExclusive: "2020-03-03" });
    expect(years[2]).toMatchObject({
      start: "2020-03-03",
      endExclusive: "2020-05-06",
      nominalEndExclusive: "2021-03-03",
      endClipped: true,
      clipped: true,
      lengthDays: 64,
      nominalLengthDays: 365,
    });
    const months2020 = (tl.intervals.filter((i) => i.layer === "personal-month") as PersonalMonthInterval[]).filter((m) => m.birthdayYear === 2020);
    expect(months2020.map((m) => m.phase)).toEqual([1, 2, 3]);
    expect(months2020[1]).toMatchObject({ start: "2020-04-03", endExclusive: "2020-05-03", clipped: false });
    expect(months2020[2]).toMatchObject({ start: "2020-05-03", endExclusive: "2020-05-06", nominalEndExclusive: "2020-06-03", clipped: true });
  });

  it("horizon clips and a missing death date is not survival evidence", () => {
    const tl = timeline("1990-06-15", "2028-01-01", "2032-01-01", ["personal-year"], { limits: { horizonEndExclusive: "2030-01-01" } });
    const last = tl.intervals.at(-1) as PersonalYearInterval;
    expect(last).toMatchObject({ birthdayYear: 2029, endExclusive: "2030-01-01", nominalEndExclusive: "2030-06-15", clipped: true });
    expect(tl.meta.limits.death).toBeNull();
    expect(tl.meta.limits.deathNote).toMatch(/NOT evidence of survival/);
    expect(tl.meta.limits.horizonEndExclusive).toBe("2030-01-01");
  });

  it("birth clips calendar-frame starts", () => {
    const tl = timeline("1990-06-15", "1990-01-01", "1991-01-01", ["calendar-year"]);
    expect(tl.intervals[0]).toMatchObject({ start: "1990-06-15", nominalStart: "1990-01-01", startClipped: true, clipped: true });
  });

  it("rejects a death date before birth", () => {
    expect(() => getNumerologySnapshot({ birth: "1990-06-15", asOf: "2000-01-01", limits: { death: "1980-01-01" } })).toThrow(NumerologyScheduleError);
  });
});

describe("calendar frame (distinct method)", () => {
  it("personal year/month/day by calendar frame, with method id and formula", () => {
    const s = getNumerologySnapshot({ birth: "1990-03-15", asOf: "2026-08-19" });
    expect(s.calendar?.personalYear.value).toBe(1); // 15+3+2026 = 2044 -> 10 -> 1
    expect(s.calendar?.personalMonth.value).toBe(9); // 1 + 8
    expect(s.calendar?.personalDay.value).toBe(1); // 9 + 19 = 28 -> 10 -> 1
    expect(s.meta.methods["calendar-day"].id).toBe("calendar-personal-year-month-day/v1");
    expect(s.meta.methods["calendar-day"].formula).toMatch(/calendarPD = reduce\(calendarPM\.value \+ calendarDay\)/);
    // birthday frame differs: the birthday year in force on 2026-08-19 is 2026 as well here, but the month value is a distinct formula
    expect(s.meta.methods["personal-month"].id).not.toBe(s.meta.methods["calendar-month"].id);
  });

  it("calendar frame differs from the birthday frame before the birthday", () => {
    const s = getNumerologySnapshot({ birth: "1990-10-15", asOf: "2026-03-01" });
    expect(s.birthdayYear?.personalYear.reductionSteps[0]).toBe(15 + 10 + 2025);
    expect(s.calendar?.personalYear.reductionSteps[0]).toBe(15 + 10 + 2026);
  });

  it("day timeline: one-day half-open intervals, bounded", () => {
    const tl = timeline("1990-03-15", "2026-02-27", "2026-03-02", ["calendar-day"]);
    expect(tl.intervals.map((i) => [i.start, i.endExclusive])).toEqual([
      ["2026-02-27", "2026-02-28"], ["2026-02-28", "2026-03-01"], ["2026-03-01", "2026-03-02"],
    ]);
  });
});

describe("pinnacles, challenges and life periods (named conventions)", () => {
  const snap = getNumerologySnapshot({ birth: "1990-11-18", asOf: "2026-08-30" });
  const tl = timeline("1990-11-18", "1990-11-18", "2080-01-01", ["pinnacle", "challenge", "life-period"]);
  const of = (layer: string) => tl.intervals.filter((i) => i.layer === layer) as any[];

  it("first pinnacle ends at 36 minus the single-digit life path (straight-across by default)", () => {
    expect(snap.lifeStages?.transition).toEqual({ rule: "36-minus-life-path", lifePathForTransition: 3, firstPinnacleEndAge: 33 });
    expect(of("pinnacle").map((p) => [p.start, p.endExclusive])).toEqual([
      ["1990-11-18", "2023-11-18"], ["2023-11-18", "2032-11-18"], ["2032-11-18", "2041-11-18"], ["2041-11-18", null],
    ]);
    expect(of("pinnacle").map((p) => p.value.value)).toEqual([11, 1, 3, 3]);
    expect(snap.lifeStages?.pinnacle?.index).toBe(2);
  });

  it("challenges: four values, third is the library's main challenge", () => {
    const legacy = calculateChallenges(localNoon("1990-11-18"));
    expect(of("challenge").map((c) => c.value)).toEqual([legacy.subChallenge1, legacy.subChallenge2, legacy.mainChallenge, 1]);
    expect(of("challenge")[2].isMain).toBe(true);
    expect(snap.lifeStages?.mainChallenge).toBe(legacy.mainChallenge);
  });

  it("three life periods, distinct from the four-month personal periods", () => {
    expect(of("life-period").map((p) => [p.start, p.endExclusive, p.basis, p.value.value])).toEqual([
      ["1990-11-18", "2023-11-18", "month", 11], ["2023-11-18", "2050-11-18", "day", 9], ["2050-11-18", null, "year", 1],
    ]);
    const fixed = timeline("1990-11-18", "1990-11-18", "2080-01-01", ["life-period"], { lifeStages: { lifePeriodRule: "fixed-28-56" } });
    expect(fixed.intervals.map((p) => p.start)).toEqual(["1990-11-18", "2018-11-18", "2046-11-18"]);
  });

  it("options: custom first end age, kaabalistic transition life path, open end clipped by horizon", () => {
    const custom = timeline("1990-11-18", "1990-11-18", "2080-01-01", ["pinnacle"], {
      lifeStages: { firstPinnacleEndAge: 30 }, limits: { horizonEndExclusive: "2060-01-01" },
    });
    expect(custom.intervals.map((p) => p.start)).toEqual(["1990-11-18", "2020-11-18", "2029-11-18", "2038-11-18"]);
    expect(custom.intervals.at(-1)).toMatchObject({ endExclusive: "2060-01-01", nominalEndExclusive: null, clipped: true });
    const k = getNumerologySnapshot({ birth: "1990-11-18", asOf: "2026-08-30", lifeStages: { lifePathMethod: "kaabalistic" } });
    expect(k.lifeStages?.transition.rule).toBe("36-minus-life-path");
    expect(() => getNumerologySnapshot({ birth: "1990-11-18", asOf: "2026-08-30", lifeStages: { firstPinnacleEndAge: 0 } })).toThrow(NumerologyScheduleError);
  });

  it("master numbers: a master life path transitions with its single-digit root; reduce policy removes pinnacle masters", () => {
    const reduce = getNumerologySnapshot({ birth: "1990-11-18", asOf: "2026-08-30", masters: "reduce" });
    const first = timeline("1990-11-18", "1990-11-18", "2000-01-01", ["pinnacle"], { masters: "reduce" }).intervals[0] as any;
    expect(first.value.value).toBe(2);
    expect(reduce.lifeStages?.transition.firstPinnacleEndAge).toBe(33);
  });

  it("requires a full birth date", () => {
    const t = generateNumerologyTimeline({ birth: { kind: "month-day", month: 3, day: 5 }, from: "2020-01-01", toExclusive: "2021-01-01", layers: ["pinnacle", "age-cycle"] });
    expect(t.intervals).toEqual([]);
    expect(t.unavailable.map((u) => u.field).sort()).toEqual(["age-cycle", "pinnacle"]);
  });
});

describe("age-cycle layer", () => {
  it("lists real absolute blocks past age 49", () => {
    const t = timeline("1949-06-18", "2026-08-30", "2040-01-01", ["age-cycle"]);
    expect((t.intervals as any[]).map((i) => [i.label, i.absoluteIndex, i.start, i.endExclusive])).toEqual([
      [5, 11, "2026-06-18", "2033-06-18"], [6, 12, "2033-06-18", "2040-06-18"],
    ]);
  });
});

describe("years 0001-0099", () => {
  it("do not become 19xx", () => {
    const s = getNumerologySnapshot({ birth: "0050-06-15", asOf: "0120-07-01", firstName: "Ana" });
    expect(s.completedAge).toBe(70);
    expect(s.lastBirthdayYear).toBe(120);
    expect(s.birthdayYear?.start).toBe("0120-06-15");
    expect(s.birthdayYear?.personalYear.reductionSteps[0]).toBe(15 + 6 + 120);
    const early = getNumerologySnapshot({ birth: "0001-01-01", asOf: "0099-12-31" });
    expect(early.completedAge).toBe(98);
    expect(early.ageCycle).toMatchObject({ label: 1, absoluteIndex: 14, start: "0099-01-01" });
    const tl = timeline("0050-06-15", "0050-01-01", "0053-01-01", ["personal-year"]);
    expect(tl.intervals.map((i) => i.start)).toEqual(["0050-06-15", "0051-06-15", "0052-06-15"]);
  });
});

describe("leap-day births", () => {
  it("29 February celebrates on 1 March in common years and the periods stay contiguous", () => {
    const tl = timeline("2000-02-29", "2001-01-01", "2005-06-01", ["personal-year"]) as { intervals: PersonalYearInterval[] };
    expect(tl.intervals.map((i) => [i.start, i.endExclusive])).toEqual([
      ["2000-02-29", "2001-03-01"], ["2001-03-01", "2002-03-01"], ["2002-03-01", "2003-03-01"], ["2003-03-01", "2004-02-29"],
      ["2004-02-29", "2005-03-01"], ["2005-03-01", "2006-03-01"],
    ]);
    expect(getNumerologySnapshot({ birth: "2000-02-29", asOf: "2001-02-28" }).completedAge).toBe(0);
    expect(getNumerologySnapshot({ birth: "2000-02-29", asOf: "2001-03-01" }).completedAge).toBe(1);
  });
});

describe("partial dates in snapshots", () => {
  it("month/day: personal year, months and heptads yes; age-dependent periods unavailable", () => {
    const s = getNumerologySnapshot({ birth: { kind: "month-day", month: 10, day: 20 }, asOf: "2026-08-30", firstName: "Ana" });
    expect(s.status).toBe("partial");
    expect(s.birthdayYear?.start).toBe("2025-10-20");
    expect(s.birthdayYear?.personalYear.value).toBe(3);
    expect(s.completedAge).toBeNull();
    expect(s.personalMonth?.phase).toBe(11);
    expect(s.heptad?.phase).toBe(7);
    expect(s.personalPeriod?.phase).toBe(3);
    expect(s.personalPeriod?.value.available).toBe(true); // name known
    expect(s.fibonacci).toBeNull();
    expect(s.ageCycle).toBeNull();
    expect(s.lifeStages).toBeNull();
    expect(s.fixedNumbers.lifePath.available).toBe(false);
    expect(s.calendar).not.toBeNull();
    const early = getNumerologySnapshot({ birth: { kind: "month-day", month: 10, day: 20 }, asOf: "2026-02-25" });
    expect(early.personalPeriod?.phase).toBe(2);
    expect(early.personalPeriod?.value).toMatchObject({ available: false, reason: "birth-year-unknown" });
  });

  it("year/month and year give age ranges and structured reasons, nothing invented", () => {
    const ym = getNumerologySnapshot({ birth: { kind: "year-month", year: 2001, month: 1 }, asOf: "2026-11-15" });
    expect(ym.status).toBe("partial");
    expect(ym.completedAgeRange).toEqual({ min: 25, max: 25 });
    expect(ym.birthdayYear).toBeNull();
    expect(ym.unavailable.length).toBeGreaterThan(0);
    expect(ym.unavailable.every((u) => u.reason === "birth-day-or-month-unknown")).toBe(true);
    const same = getNumerologySnapshot({ birth: { kind: "year-month", year: 2001, month: 11 }, asOf: "2026-11-15" });
    expect(same.completedAgeRange).toEqual({ min: 24, max: 25 });
    const y = getNumerologySnapshot({ birth: { kind: "year", year: 2001 }, asOf: "2026-11-15" });
    expect(y.completedAgeRange).toEqual({ min: 24, max: 25 });
    const approx = getNumerologySnapshot({ birth: { kind: "year", year: 2001, approximate: true }, asOf: "2026-11-15" });
    expect(approx.completedAgeRange).toBeNull();
    expect(approx.unavailable[0].reason).toBe("birth-year-approximate");
    const unknown = getNumerologySnapshot({ birth: { kind: "unknown" }, asOf: "2026-11-15", firstName: "Ana" });
    expect(unknown.unavailable[0].reason).toBe("birth-date-unknown");
    expect(unknown.fixedNumbers.firstNameSoulNumber.available).toBe(true);
  });
});

describe("errors and caps", () => {
  const code = (fn: () => unknown) => {
    try {
      fn();
    } catch (e) {
      expect(e).toBeInstanceOf(RangeError);
      expect(e).toBeInstanceOf(NumerologyScheduleError);
      return (e as NumerologyScheduleError).code;
    }
    return "no-error";
  };

  it("rejects impossible and malformed dates", () => {
    for (const bad of ["2001-02-30", "2026-04-31", "2025-02-29", "2001-13-01", "2001-1-1", "20010101", "", "0000-01-01", "9999-12-31"]) {
      expect(code(() => getNumerologySnapshot({ birth: bad, asOf: "2026-01-01" })), bad).toBe("INVALID_DATE");
    }
    expect(code(() => getNumerologySnapshot({ birth: "2001-01-01", asOf: "2026-02-30" }))).toBe("INVALID_DATE");
    expect(code(() => getNumerologySnapshot({ birth: { kind: "month-day", month: 2, day: 30 }, asOf: "2026-01-01" }))).toBe("INVALID_DATE");
    expect(code(() => getNumerologySnapshot({ birth: { year: 2001, month: 2, day: 29 }, asOf: "2026-01-01" }))).toBe("INVALID_DATE");
    expect(code(() => getNumerologySnapshot({ birth: undefined as never, asOf: "2026-01-01" }))).toBe("INVALID_ARGUMENT");
    // 29 February is a valid month/day
    expect(code(() => getNumerologySnapshot({ birth: { kind: "month-day", month: 2, day: 29 }, asOf: "2026-01-01" }))).toBe("no-error");
  });

  it("validates ranges, layers, caps", () => {
    expect(code(() => timeline("2001-10-20", "2026-01-01", "2026-01-01", ["personal-year"]))).toBe("INVALID_RANGE");
    expect(code(() => timeline("2001-10-20", "2026-01-02", "2026-01-01", ["personal-year"]))).toBe("INVALID_RANGE");
    expect(code(() => timeline("2001-10-20", "1900-01-01", "2100-01-01", ["personal-year"]))).toBe("RANGE_TOO_LARGE");
    expect(code(() => timeline("2001-10-20", "2026-01-01", "2027-01-01", ["calendar-day"], { maxIntervals: 100 }))).toBe("TOO_MANY_INTERVALS");
    expect(code(() => timeline("2001-10-20", "2026-01-01", "2027-01-01", ["nope"]))).toBe("INVALID_ARGUMENT");
    expect(code(() => timeline("2001-10-20", "2026-01-01", "2027-01-01", []))).toBe("INVALID_ARGUMENT");
    expect(code(() => timeline("2001-10-20", "2026-01-01", "2027-01-01", ["personal-year"], { maxIntervals: 10001 }))).toBe("INVALID_ARGUMENT");
    expect(code(() => timeline("2001-10-20", "2026-01-01", "2027-01-01", ["personal-year"], { shortMonthPolicy: "x" }))).toBe("INVALID_ARGUMENT");
    expect(code(() => timeline("2001-10-20", "2026-01-01", "2027-01-01", ["personal-year"], { masters: "x" }))).toBe("INVALID_ARGUMENT");
  });

  it("accepts CivilDate objects as well as strings", () => {
    const a = getNumerologySnapshot({ birth: { year: 2001, month: 10, day: 20 }, asOf: { year: 2026, month: 8, day: 30 } });
    const b = getNumerologySnapshot({ birth: "2001-10-20", asOf: "2026-08-30" });
    expect(a).toEqual(b);
  });
});

describe("method metadata", () => {
  it("names every method identity", () => {
    const m = getNumerologyMethodMetadata({ firstName: "Ana", nameKind: "given-name", shortMonthPolicy: "clamp", masters: "reduce", lifePathMethod: "straight-across" });
    expect(m).toMatchObject({
      methodVersion: expect.stringMatching(/^kaabalah-numerology-schedule\//),
      lifePathMethod: "straight-across",
      masterPolicy: "reduce",
      shortMonthPolicy: "clamp",
      nameInput: { kind: "given-name", provided: true },
    });
    expect(Object.keys(m.methods)).toEqual(expect.arrayContaining(["personal-year", "personal-month", "personal-period", "heptad", "age-cycle", "fibonacci", "calendar-day", "pinnacle", "challenge", "life-period"]));
    expect(JSON.stringify(m)).not.toContain("Ana");
  });
});
