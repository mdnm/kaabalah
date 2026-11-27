import { civilDayOrdinal, completedYears, formatCivilDate, civilDateFromOrdinal, type CivilDate } from "../civil-date";
import {
  MayaCalculationError, MAYA_JOHNSON_METHOD, TZOLKIN_CYCLE_DAYS, dayAtOrdinal, dayAtPosition, getMayaCalendarDay, getTzolkinDay,
  getTzolkinTrecena, haabAtOrdinal, requireMayaDate, wrap, yearLordAtOrdinal,
  type MayaDateInput, type MayaSignId, type TzolkinDay,
} from "./calendar";

const STAGES = ["youth", "adult", "mature"] as const;
const COLUMNS = ["right", "center", "left"] as const;
const ROW_OFFSETS = [-8, 0, 8] as const;
const COLUMN_OFFSETS = [-6, 0, 6] as const;
const YEARS_PER_ROW = 26;

export type MayaStage = typeof STAGES[number];
export type MayaColumn = typeof COLUMNS[number];
export type MayaTreePosition = `${MayaStage}.${MayaColumn}`;

export interface MayaTreePoint {
  readonly position: MayaTreePosition;
  readonly offsetDays: number;
  readonly day: TzolkinDay;
}

type MayaTreeRow = Record<MayaColumn, MayaTreePoint>;
type MayaTree = Record<MayaStage, MayaTreeRow>;

function makeTree(core: TzolkinDay): MayaTree {
  function row(stage: MayaStage, rowOffset: number): MayaTreeRow {
    function point(column: MayaColumn, columnOffset: number): MayaTreePoint {
      const offsetDays = rowOffset + columnOffset;
      return {
        position: `${stage}.${column}`,
        offsetDays,
        day: dayAtPosition(core.position + offsetDays),
      };
    }

    return {
      right: point("right", COLUMN_OFFSETS[0]),
      center: point("center", COLUMN_OFFSETS[1]),
      left: point("left", COLUMN_OFFSETS[2]),
    };
  }

  return {
    youth: row("youth", ROW_OFFSETS[0]),
    adult: row("adult", ROW_OFFSETS[1]),
    mature: row("mature", ROW_OFFSETS[2]),
  };
}

export function calculateMayaNatal(birth: MayaDateInput) {
  const calendarDay = getMayaCalendarDay(birth);
  const tree = makeTree(calendarDay.day);
  const featheredSerpent = Object.values(tree).flatMap(row => Object.values(row))
    .sort((a, b) => a.offsetDays - b.offsetDays);
  return {
    ...calendarDay,
    tree,
    featheredSerpent,
  };
}

function makeCross(core: TzolkinDay) {
  const tree = makeTree(core);
  return {
    core,
    conception: tree.youth.center.day,
    rightHand: tree.adult.right.day,
    leftHand: tree.adult.left.day,
    destiny: tree.mature.center.day,
  };
}

type MayaCross = ReturnType<typeof makeCross>;
export type MayaCrossRole = keyof MayaCross;

export interface MayaRelationshipSignMatch {
  readonly sign: MayaSignId;
  readonly compositeRole: MayaCrossRole;
  readonly natalRole: MayaCrossRole;
}

function matchCrossSigns(composite: MayaCross, natal: MayaCross): MayaRelationshipSignMatch[] {
  const roles = Object.keys(composite) as MayaCrossRole[];
  const matches: MayaRelationshipSignMatch[] = [];
  for (const compositeRole of roles) {
    const { sign } = composite[compositeRole];
    const natalRole = roles.find(role => natal[role].sign === sign);
    if (natalRole) matches.push({ sign, compositeRole, natalRole });
  }
  return matches;
}

export function calculateMayaRelationship(first: MayaDateInput, second: MayaDateInput) {
  const a = getTzolkinDay(first);
  const b = getTzolkinDay(second);
  // Positions 1–20 in Johnson's sign numbering run from Chuen through Oc.
  const signIndex = (a.position - 1) % 20;
  const otherSignIndex = (b.position - 1) % 20;
  const compositeSignIndex = (signIndex + otherSignIndex + 1) % 20;
  const compositeTone = 1 + (a.tone + b.tone - 1) % 13;

  const firstInRow = dayAtPosition(compositeSignIndex + 1);
  // Advancing 20 days adds 7 to the tone mod 13. Its modular inverse is 2.
  const column = wrap(2 * (compositeTone - firstInRow.tone), 13);
  const core = dayAtPosition(firstInRow.position + 20 * column);

  const cross = makeCross(core);
  return {
    method: MAYA_JOHNSON_METHOD,
    first: a,
    second: b,
    sameDirection: a.direction === b.direction,
    sameYearLordFamily: signIndex % 5 === otherSignIndex % 5,
    cross,
    natalOverlap: {
      first: matchCrossSigns(cross, makeCross(a)),
      second: matchCrossSigns(cross, makeCross(b)),
    },
  };
}

function roadOfLife(birth: CivilDate, date: CivilDate, tree: MayaTree) {
  const age = completedYears(birth, date);
  const stageIndex = Math.floor(age / YEARS_PER_ROW);
  const stage = STAGES[stageIndex % STAGES.length];
  return {
    age,
    stage,
    cycle: Math.floor(stageIndex / STAGES.length) + 1,
    fromAge: stageIndex * YEARS_PER_ROW,
    toAgeExclusive: (stageIndex + 1) * YEARS_PER_ROW,
    row: tree[stage],
  };
}

export interface MayaTimingOptions {
  readonly from: MayaDateInput;
  /** Number of consecutive civil dates, including `from`. Defaults to 1. */
  readonly days?: number;
}

/** Civil-day timing with Johnson's personal lunar month and raw natal recurrences. */
export function calculateMayaTiming(birth: MayaDateInput, options: MayaTimingOptions) {
  const birthDate = requireMayaDate(birth);
  const from = requireMayaDate(options.from);
  const days = options.days ?? 1;
  if (!Number.isInteger(days) || days < 1 || days > TZOLKIN_CYCLE_DAYS) {
    throw new MayaCalculationError("INVALID_ARGUMENT", "Maya timing days must be an integer from 1 to 260");
  }
  const start = civilDayOrdinal(from);
  if (start < civilDayOrdinal(birthDate)) throw new MayaCalculationError("INVALID_ARGUMENT", "Maya timing starts before birth");
  requireMayaDate(civilDateFromOrdinal(start + days - 1));

  const natal = calculateMayaNatal(birthDate);
  const firstPoint = natal.featheredSerpent[0];
  const lastPoint = natal.featheredSerpent[natal.featheredSerpent.length - 1];
  const monthLength = lastPoint.offsetDays - firstPoint.offsetDays + 1;

  const dates = Array.from({ length: days }, (_, index) => {
    const ordinal = start + index;
    const date = civilDateFromOrdinal(ordinal);
    const day = dayAtOrdinal(ordinal);
    const monthDayIndex = wrap(day.position - firstPoint.day.position, TZOLKIN_CYCLE_DAYS);
    const serpentPoint = natal.featheredSerpent.find(point => point.day.position === day.position);
    return {
      date: formatCivilDate(date),
      day,
      haab: haabAtOrdinal(ordinal),
      trecena: getTzolkinTrecena(day),
      yearLord: yearLordAtOrdinal(ordinal),
      roadOfLife: roadOfLife(birthDate, date, natal.tree),
      personalLunarMonth: monthDayIndex < monthLength ? {
        dayNumber: monthDayIndex + 1,
        lengthDays: monthLength,
        point: serpentPoint?.position ?? null,
      } : null,
      matches: {
        natalTone: day.tone === natal.day.tone,
        natalTrecenaSign: day.sign === natal.trecena.sign,
        treeSigns: natal.featheredSerpent.filter(point => point.day.sign === day.sign)
          .map(point => point.position),
        treeDay: serpentPoint?.position ?? null,
      },
    };
  });
  return { method: MAYA_JOHNSON_METHOD, birth: natal.date, from: formatCivilDate(from), dates };
}
