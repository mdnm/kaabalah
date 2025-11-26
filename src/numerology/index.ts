/**
 * Numerology calculations
 */

import { calculateGematria } from "../gematria";

export type ReducedValueWithSteps = {
  reducedValue: number;
  reductionSteps: number[];
};

function parseDate(date: Date): { day: string; month: string; year: string } {
  if (!date) {
    throw new Error("Date is required");
  }

  if (!(date instanceof Date)) {
    throw new Error("Date must be a Date object");
  }

  const formattedDate = date.toISOString().split("T")[0];

  if (formattedDate.length !== 10) {
    throw new Error("Date must be in the format YYYY-MM-DD or DD-MM-YYYY");
  }

  const parts = formattedDate.split(/[-/]/).map((p) => p.trim());

  const isYYYYMMDD = parts[0].length === 4;

  if (isYYYYMMDD) {
    return { day: parts[2], month: parts[1], year: parts[0] };
  } else {
    return { day: parts[0], month: parts[1], year: parts[2] };
  }
}

function mapDatePartsToBlocksOfTwo({
  day,
  month,
  year,
}: {
  day: string;
  month: string;
  year: string;
}): { day: string; month: string; year1: string; year2: string } {
  return {
    day: day.padStart(2, "0"),
    month: month.padStart(2, "0"),
    year1: year.slice(0, 2),
    year2: year.slice(2),
  };
}

function digitSum(n: number): number {
  let s = 0;

  for (const ch of String(Math.abs(n))) {
    s += ch.charCodeAt(0) - 48;
  }

  return s;
}

export const MASTER_NUMBERS = [11, 22, 33, 44];

export function isMasterNumber(n: number): boolean {
  return MASTER_NUMBERS.includes(n);
}

export function reduceToSingle(
  n: number,
  options: { preserveMasters?: boolean } = { preserveMasters: false }
): number {
  // standard digital root with 0 allowed; never preserve masters here
  if (n === 0) {
    return 0;
  }

  let reduced = n;
  while (reduced > 9) {
    if (options?.preserveMasters && isMasterNumber(reduced)) {
      break;
    }

    reduced = digitSum(reduced);
  }

  // optional tweak for exact "00" cases will be applied by caller, not here
  return reduced;
}

export function reduceToSingleWithSteps(
  n: number,
  options: { preserveMasters?: boolean } = { preserveMasters: false }
): ReducedValueWithSteps {
  const steps = [n];

  if (n === 0) {
    return {
      reducedValue: 0,
      reductionSteps: steps,
    };
  }

  let reduced = n;

  while (reduced > 9) {
    if (options?.preserveMasters && isMasterNumber(reduced)) {
      break;
    }

    reduced = digitSum(reduced);
    steps.push(reduced);
  }

  return {
    reducedValue: reduced,
    reductionSteps: steps,
  };
}

function reduceBlock(block: string): number {
  const n = [...block].reduce(
    (acc, curr) => acc + (curr.charCodeAt(0) - 48),
    0
  );

  if (n === 0) {
    return 0;
  }

  return reduceToSingle(n);
}

export type KaabalisticLifePathResult = {
  parts: {
    day: string;
    month: string;
    year1: string;
    year2: string;
  };
  reducedParts: {
    reducedDay: number;
    reducedMonth: number;
    reducedYear1: number;
    reducedYear2: number;
  };
  syntheses: {
    dayMonthSynthesis: number;
    yearSynthesis: number;
    reducedDayMonthSynthesis: number;
    reducedYearSynthesis: number;
    finalSynthesis: number;
  };
  lifePath: number;
  /**
   * Last three syntheses
   */
  personalMythologyNumbers: number[];
};

/**
 * Calculate the Kaabalistic life path number based on a birth date.
 * Note: This method produces more master numbers and never produces life path 2s (or any life path that ends with 0 like 10, 20, 30, etc.)
 */
export function calculateKaabalisticLifePath(
  birthDate: Date
): KaabalisticLifePathResult {
  const { day, month, year1, year2 } = mapDatePartsToBlocksOfTwo(
    parseDate(birthDate)
  );

  const reducedDay = reduceBlock(day);
  const reducedMonth = reduceBlock(month);
  const reducedYear1 = reduceBlock(year1);
  const reducedYear2 = reduceBlock(year2);

  const dayMonthSynthesis = parseInt(`${reducedDay}${reducedMonth}`, 10);
  const yearSynthesis = parseInt(`${reducedYear1}${reducedYear2}`, 10);

  const reducedDayMonthSynthesis = reduceToSingle(dayMonthSynthesis);
  const reducedYearSynthesis = reduceToSingle(yearSynthesis);

  const finalSynthesis = parseInt(
    `${reducedDayMonthSynthesis}${reducedYearSynthesis}`,
    10
  );

  const lifePath = reduceToSingle(finalSynthesis, { preserveMasters: true });
  const isMasterLifePath = isMasterNumber(lifePath);

  const personalMythologyNumbers = [
    parseInt(`${dayMonthSynthesis}${yearSynthesis}`, 10),
    finalSynthesis,
  ];

  if (finalSynthesis !== lifePath) {
    personalMythologyNumbers.push(lifePath);
  }

  const reducedLifePath = reduceToSingle(lifePath);
  if (isMasterLifePath) {
    personalMythologyNumbers.push(reducedLifePath);
  }

  return {
    parts: { day, month, year1, year2 },
    reducedParts: { reducedDay, reducedMonth, reducedYear1, reducedYear2 },
    syntheses: {
      dayMonthSynthesis,
      yearSynthesis,
      reducedDayMonthSynthesis,
      reducedYearSynthesis,
      finalSynthesis,
    },
    lifePath,
    personalMythologyNumbers,
  };
}

export type StraightAcrossReductionLifePathResult = {
  lifePath: number;
  reductionSteps: number[];
};

/**
 * Calculate the traditional straight across reduction life path number based on a birth date.
 */
export function calculateStraightAcrossReductionLifePath(
  birthDate: Date
): StraightAcrossReductionLifePathResult {
  const { day, month, year } = parseDate(birthDate);

  const result = reduceToSingleWithSteps(
    parseInt(`${day}${month}${year}`, 10),
    { preserveMasters: true }
  );

  return {
    lifePath: result.reducedValue,
    reductionSteps: result.reductionSteps,
  };
}

export type DateEnergies = {
  dayEnergy: ReducedValueWithSteps;
  monthEnergy: ReducedValueWithSteps;
  yearEnergy: ReducedValueWithSteps;
};

export function getDateEnergies(birthDate: Date): DateEnergies {
  const { day, month, year1, year2 } = mapDatePartsToBlocksOfTwo(
    parseDate(birthDate)
  );

  const dayEnergy = reduceToSingleWithSteps(parseInt(day, 10), {
    preserveMasters: true,
  });
  const monthEnergy = reduceToSingleWithSteps(parseInt(month, 10), {
    preserveMasters: true,
  });
  const yearEnergy = reduceToSingleWithSteps(parseInt(year1 + year2, 10), {
    preserveMasters: true,
  });

  return {
    dayEnergy,
    monthEnergy,
    yearEnergy,
  };
}

export type Challenges = {
  day: number;
  month: number;
  year: number;
  mainChallenge: number;
  subChallenge1: number;
  subChallenge2: number;
};

export function calculateChallenges(birthDate: Date): Challenges {
  const { day, month, year } = parseDate(birthDate);

  const reducedDay = reduceToSingle(parseInt(day, 10));
  const reducedMonth = reduceToSingle(parseInt(month, 10));
  const reducedYear = reduceToSingle(parseInt(year, 10));

  const subChallenge1 = Math.abs(reducedMonth - reducedDay);
  const subChallenge2 = Math.abs(reducedDay - reducedYear);
  const mainChallenge = Math.abs(subChallenge1 - subChallenge2);

  return {
    day: reducedDay,
    month: reducedMonth,
    year: reducedYear,
    mainChallenge,
    subChallenge1,
    subChallenge2,
  };
}

export const CYCLE_MEANINGS = [
  {
    title: "Learning",
    shortDescription:
      "A period for assertive action and learning through direct experience.",
    personalDescription:
      "This period emphasizes assertive action and learning through direct experience. Utilize personal influence to seek favors, loans, or recognition from influential individuals such as government officials or community leaders. Ideal for enhancing personal reputation and prestige, keeping in mind that all actions carry consequences.",
    businessDescription:
      "Ideal for promotional activities aimed at building goodwill, public recognition, and securing endorsements from prominent individuals. Prioritize the company's image and reputation over immediate profits.",
    astrologySign: "Aries (Actions Have Consequences)",
  },
  {
    title: "Hard Work",
    shortDescription:
      "A time for diligent effort and adaptability to temporary changes.",
    personalDescription:
      "A period where diligent effort and adaptability are crucial. Suitable for temporary changes such as moving homes, short trips, or career shifts. Avoid long-term commitments or significant investments unless carefully formalized.",
    businessDescription:
      "Ideal for short-term experiments, temporary staffing adjustments, and forming beneficial business connections. Steer clear of verbal agreements or long-term commitments unless formally documented. Flexibility leads to progress.",
    astrologySign: "Taurus (Stop Being Stubborn)",
  },
  {
    title: "Friendship",
    shortDescription:
      "A dynamic phase for ambitious projects and strengthening relationships.",
    personalDescription:
      "A dynamic and energetic phase ideal for initiating ambitious projects requiring persistence and physical strength. Effective communication strengthens relationships, but impulsiveness should be avoided to prevent conflicts.",
    businessDescription:
      "Ideal for expansion, energetic ventures, and assertive promotional activities. Excellent for debt collection but avoid legal conflicts. Maintain vigilance against accidents and disputes while leveraging strong communication.",
    astrologySign: "Gemini (Communication is Power)",
  },
  {
    title: "Opportunities",
    shortDescription:
      "An intellectually fertile time for creativity and quick decision-making.",
    personalDescription:
      "An intellectually fertile phase ideal for creative projects, innovation, and quick decision-making. Beware of deception, especially concerning documents or agreements. Foster mental growth and create valuable connections, but remain cautious.",
    businessDescription:
      "Perfect for launching impactful marketing campaigns and securing new agreements. Excellent for promotional activities and intellectual creativity, but carefully scrutinize documents to avoid fraud.",
    astrologySign: "Cancer (Nurture Mental Growth)",
  },
  {
    title: "Tears/Decision",
    shortDescription:
      "The most prosperous phase for financial resolution and spiritual advancement.",
    personalDescription:
      "The most prosperous phase of the year, suitable for resolving financial issues, starting long journeys, and advancing spiritually. Interact with influential figures, manage debts, and engage in expansive social activities. Keep ego and selfishness balanced for optimal outcomes.",
    businessDescription:
      "A prime time for investments, financial growth, global promotion, debt collection, and favorable legal outcomes. Emphasize fairness and generosity to enhance business success.",
    astrologySign: "Leo (Balance Ego and Generosity)",
  },
  {
    title: "Triple Blessing",
    shortDescription:
      "Perfect for pleasures, social activities, and creative pursuits.",
    personalDescription:
      "Ideal for enjoying pleasures, social activities, artistic endeavors, and short travels. Favorable for romantic interactions, relaxation, and creative pursuits. Organize personal life to balance enjoyment and refinement effectively.",
    businessDescription:
      "Excellent time for promoting luxury products, arts, entertainment, and speculative investments. Ideal for forming friendly business alliances and strategic partnerships.",
    astrologySign: "Virgo (Organize Your Pleasures)",
  },
  {
    title: "Rest",
    shortDescription:
      "A period of rest, introspection, and preparation for renewal.",
    personalDescription:
      "A critical period of rest, introspection, and cautious preparation for renewal. Avoid initiating new ventures and instead focus on completing pending matters, managing legal affairs carefully, and protecting existing resources. Balance and patience are essential.",
    businessDescription:
      "Period to conserve resources, avoid major expansions, and carefully manage internal restructuring. Postpone significant new ventures until the next cycle. Act diplomatically and cautiously to ensure stability.",
    astrologySign: "Libra (Seek Balance and Reconstruction)",
  },
];

export interface Cycle {
  number: number;
  description: {
    title: string;
    shortDescription: string;
    personalDescription: string;
    businessDescription: string;
    astrologySign: string;
  };
  isActive?: boolean;
  cycleStart?: Date;
}

export interface CycleInfo {
  yearlyCycles: Cycle[];
  ageCycles: Cycle[];
  monthlyCycles: Cycle[];
  currentYearlyCycle: number | null;
  currentAgeCycle: number | null;
  currentMonthlyCycle: number | null;
  daysInMonthlyCycle: number;
  totalDays: number;
}

// Add days to a date
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Find the most recent anniversary of the start date
function getMostRecentStartDate(startDate: Date, today: Date): Date {
  const startMonth = startDate.getMonth();
  const startDay = startDate.getDate();
  let recentStart = new Date(today.getFullYear(), startMonth, startDay);
  if (recentStart > today) {
    recentStart = new Date(today.getFullYear() - 1, startMonth, startDay);
  }
  return recentStart;
}

// Calculate cycles (annual and monthly)
export function calculateCycles(startDate: Date, today: Date): CycleInfo {
  const mostRecentStart = getMostRecentStartDate(startDate, today);
  const cycleLength = 52; // Fixed cycle length for monthly cycles

  // Skip annual cycle calculation if start date is in the future
  const isFutureDate = startDate > today;
  let currentYearlyCycle = null;
  let currentAgeCycle = null;
  const ageCycles: Cycle[] = [];
  const yearlyCycles: Cycle[] = [];
  if (!isFutureDate) {
    const birthYear = startDate.getFullYear();
    const currentYear = today.getFullYear();
    const ageInYears = currentYear - birthYear;
    currentAgeCycle = (Math.floor(ageInYears / 7) % 7) + 1;
    for (let i = 0; i < 7; i++) {
      // cycle start for year is which year it started
      const cycleStart = new Date(
        birthYear + i * 7,
        startDate.getMonth(),
        startDate.getDate()
      );

      const cycle = i + 1;
      const isCurrentCycle = cycle === currentAgeCycle;

      if (isCurrentCycle) {
        // Calculate yearly cycles within the current age cycle
        // The yearly cycle is based on the person's exact age in years
        // For example, if someone is 6 years old, they're in the 1st age cycle (0-7 years) and the 6th yearly cycle
        const yearsSinceBirth = ageInYears;
        const yearWithinAgeCycle = yearsSinceBirth % 7; // 0-6 representing which year within the current age cycle
        currentYearlyCycle = yearWithinAgeCycle + 1; // Convert to 1-7 range

        for (let j = 0; j < 7; j++) {
          // Calculate the start date for each yearly cycle within the current age cycle
          const ageCycleStartYear = birthYear + Math.floor(ageInYears / 7) * 7; // Start year of current age cycle
          const yearlyCycleStart = new Date(
            ageCycleStartYear + j,
            startDate.getMonth(),
            startDate.getDate()
          );
          const yearlyCycle = j + 1;

          const isCurrentYearlyCycle = yearlyCycle === currentYearlyCycle;

          yearlyCycles.push({
            number: yearlyCycle,
            description: CYCLE_MEANINGS[j],
            isActive: isCurrentYearlyCycle,
            cycleStart: yearlyCycleStart,
          });
        }
      }

      ageCycles.push({
        number: cycle,
        description: CYCLE_MEANINGS[i],
        isActive: isCurrentCycle,
        cycleStart,
      });
    }
  }

  // Monthly cycles (relative to start date)
  const monthlyCycles: Cycle[] = [];
  for (let i = 0; i < 7; i++) {
    const cycleStart = addDays(mostRecentStart, i * cycleLength);

    monthlyCycles.push({
      number: i + 1,
      description: CYCLE_MEANINGS[i],
      isActive: false,
      cycleStart: cycleStart,
    });
  }

  // Find current monthly cycle
  let currentMonthlyCycle = null;
  let daysInMonthlyCycle = 0;
  for (let i = 0; i < 7; i++) {
    const cycleStart = addDays(mostRecentStart, i * cycleLength);
    const nextCycleStart =
      i < 6
        ? addDays(mostRecentStart, (i + 1) * cycleLength)
        : addDays(mostRecentStart, 366);
    if (today >= cycleStart && today < nextCycleStart) {
      currentMonthlyCycle = i + 1;
      daysInMonthlyCycle =
        Math.floor(
          (today.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;
      monthlyCycles[i].isActive = true;
      break;
    }
  }

  const totalDays =
    Math.floor(
      (today.getTime() - mostRecentStart.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

  return {
    yearlyCycles,
    ageCycles,
    monthlyCycles,
    currentYearlyCycle,
    currentAgeCycle,
    currentMonthlyCycle,
    daysInMonthlyCycle,
    totalDays,
  };
}

function calculateAge(birthDate: Date, today: Date = new Date()): number {
  return today.getFullYear() - birthDate.getFullYear();
}

export type FibonacciCycle = {
  currentAge: number;
  cycle1: ReducedValueWithSteps;
  cycle2: ReducedValueWithSteps;
  cycle3: ReducedValueWithSteps;
  cycle4: ReducedValueWithSteps;
  cycle5: ReducedValueWithSteps;
  cycle6: ReducedValueWithSteps;
  cycle7: ReducedValueWithSteps;
};

export function calculateFibonacciCycle(
  birthDate: Date,
  today: Date
): FibonacciCycle {
  const currentAge = calculateAge(birthDate, today);

  const cycle1 = reduceToSingleWithSteps(currentAge);
  const cycle2 = reduceToSingleWithSteps(cycle1.reducedValue + 2);
  const cycle3 = reduceToSingleWithSteps(
    cycle1.reducedValue + cycle2.reductionSteps[0]
  );
  const cycle4 = reduceToSingleWithSteps(
    cycle2.reductionSteps[0] + cycle3.reductionSteps[0]
  );
  const cycle5 = reduceToSingleWithSteps(
    cycle3.reductionSteps[0] + cycle4.reductionSteps[0]
  );
  const cycle6 = reduceToSingleWithSteps(
    cycle4.reductionSteps[0] + cycle5.reductionSteps[0]
  );
  const cycle7 = reduceToSingleWithSteps(
    cycle5.reductionSteps[0] + cycle6.reductionSteps[0]
  );

  return {
    currentAge,
    cycle1,
    cycle2,
    cycle3,
    cycle4,
    cycle5,
    cycle6,
    cycle7,
  };
}

export type PersonalPeriod = {
  startMonth: number;
  endMonth: number;
  value: ReducedValueWithSteps;
};

export type PersonalMonth = {
  month: number;
  value: ReducedValueWithSteps;
};

export type PersonalCycles = {
  personalYear: ReducedValueWithSteps;
  personalPeriods: [PersonalPeriod, PersonalPeriod, PersonalPeriod];
  personalMonths: [
    PersonalMonth,
    PersonalMonth,
    PersonalMonth,
    PersonalMonth,
    PersonalMonth,
    PersonalMonth,
    PersonalMonth,
    PersonalMonth,
    PersonalMonth,
    PersonalMonth,
    PersonalMonth,
    PersonalMonth,
    PersonalMonth
  ];
  currentPersonalPeriod: number;
  currentPersonalMonth: number;
  currentAge: number;
  lifePath: number;
  soulNumber?: ReducedValueWithSteps;
  yearUsedOnCalculations: number;
};

function calculateSoulNumber(firstName: string): ReducedValueWithSteps {
  const vowels = calculateGematria(firstName).vowels;

  return {
    reducedValue: vowels.finalValue,
    reductionSteps: vowels.reductionSteps,
  }
}

/**
 * This function wraps the month number to a 1-12 range.
 */
function wrapMonth(month: number): number {
  const wrappedMonth = (((month - 1) % 12) + 12) % 12;

  return wrappedMonth + 1;
}

/**
 * Returns the year of the most recent birthday relative to today.
 */
function getLastBirthdayYear(birthDate: Date, today: Date): number {
  const thisYearsBirthday = new Date(
    today.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate()
  );

  return today >= thisYearsBirthday
    ? today.getFullYear()
    : today.getFullYear() - 1;
}

export function calculatePersonalYear(
  birthDate: Date,
  today: Date = new Date()
): ReducedValueWithSteps {
  const { day, month } = parseDate(birthDate);
  const yearToUse = getLastBirthdayYear(birthDate, today);

  return reduceToSingleWithSteps(
    parseInt(day, 10) + parseInt(month, 10) + yearToUse,
    { preserveMasters: true }
  );
}

export function calculatePersonalPeriods(
  birthDate: Date,
  yearToUse: number,
  lifePath: number,
  soulNumber: number,
  currentAge: number
): [PersonalPeriod, PersonalPeriod, PersonalPeriod] {
  const { month } = parseDate(birthDate);
  const birthMonth = parseInt(month, 10);

  const periods: [PersonalPeriod, PersonalPeriod, PersonalPeriod] = [
    {
      startMonth: wrapMonth(birthMonth + 0),
      endMonth: wrapMonth(birthMonth + 3),
      value: reduceToSingleWithSteps(yearToUse + currentAge, {
        preserveMasters: true,
      }),
    },
    {
      startMonth: wrapMonth(birthMonth + 4),
      endMonth: wrapMonth(birthMonth + 7),
      value: reduceToSingleWithSteps(yearToUse + lifePath, {
        preserveMasters: true,
      }),
    },
    {
      startMonth: wrapMonth(birthMonth + 8),
      endMonth: wrapMonth(birthMonth + 11),
      value: reduceToSingleWithSteps(yearToUse + soulNumber, {
        preserveMasters: true,
      }),
    },
  ];

  return periods;
}

function diffInPersonalMonths(birthDate: Date, today: Date): number {
  const lastYear = getLastBirthdayYear(birthDate, today);
  const base = new Date(lastYear, birthDate.getMonth(), birthDate.getDate());

  let k =
    (today.getFullYear() - base.getFullYear()) * 12 +
    (today.getMonth() - base.getMonth());

  // Only advance to the next personal month on the birth *day* each month
  if (today.getDate() < birthDate.getDate()) {
    k -= 1;
  }

  if (k < 0) k = 0;
  if (k > 12) k = 12; 

  return k;
}

export function calculatePersonalMonths(
  birthDate: Date,
  personalYear: ReducedValueWithSteps,
  today: Date
): {
  personalMonths: PersonalCycles["personalMonths"];
  currentPersonalMonthIndex: number;
} {
  const { month } = parseDate(birthDate);
  const firstPersonalMonth = parseInt(month, 10);

  const personalMonths: PersonalMonth[] = [];
  for (let i = 0; i < 12; i++) {
    const m = wrapMonth(firstPersonalMonth + i);
    const value = reduceToSingleWithSteps(personalYear.reducedValue + m, {
      preserveMasters: true,
    });
    personalMonths.push({ month: m, value });
  }

  const currentPersonalMonthIndex = diffInPersonalMonths(birthDate, today);

  return {
    personalMonths: personalMonths as PersonalCycles["personalMonths"],
    currentPersonalMonthIndex,
  };
}

export function calculatePersonalCycles(
  birthDate: Date,
  today: Date = new Date(),
  firstName: string
): PersonalCycles {
  const yearToUse = getLastBirthdayYear(birthDate, today);

  const personalYear = calculatePersonalYear(birthDate, today);

  const currentAge = calculateAge(
    birthDate,
    new Date(yearToUse, today.getMonth(), today.getDate())
  );
  const { lifePath } = calculateKaabalisticLifePath(birthDate);
  const soulNumber = calculateSoulNumber(firstName);

  const personalPeriods =
    calculatePersonalPeriods(birthDate, yearToUse, lifePath, soulNumber.reducedValue, currentAge);

  const {
    personalMonths,
    currentPersonalMonthIndex: currentPersonalMonth,
  } = calculatePersonalMonths(birthDate, personalYear, today);
  
  // Derive the period from the month index (0–12). Clamp 12 to last period.
  const currentPersonalPeriod = Math.floor(Math.min(currentPersonalMonth, 11) / 4);

  return {
    currentAge,
    lifePath,
    soulNumber,
    personalYear,
    personalPeriods,
    personalMonths,
    currentPersonalPeriod,
    currentPersonalMonth,
    yearUsedOnCalculations: yearToUse,
  };
}
