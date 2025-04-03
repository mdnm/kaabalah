/**
 * Numerology calculations
 */

/**
 * Calculate the life path number based on a birth date
 * @param birthDate - Birth date as a Date object
 * @returns Life path number (1-9, 11, 22, or 33)
 */
export function calculateLifePath(birthDate: Date): number {
  const dateString = birthDate.toISOString().split('T')[0]; // YYYY-MM-DD
  const dateWithoutDashes = dateString.replace(/-/g, '');
  
  // Initial sum of all digits
  let sum = dateWithoutDashes.split('').reduce((total, digit) => {
    return total + parseInt(digit, 10);
  }, 0);
  
  // Reduce to a single digit or master number
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').reduce((total, digit) => {
      return total + parseInt(digit, 10);
    }, 0);
  }
  
  return sum;
}


export const CYCLE_MEANINGS = [
  {
    "title": "Learning",
    "shortDescription": "A period for assertive action and learning through direct experience.",
    "personalDescription": "This period emphasizes assertive action and learning through direct experience. Utilize personal influence to seek favors, loans, or recognition from influential individuals such as government officials or community leaders. Ideal for enhancing personal reputation and prestige, keeping in mind that all actions carry consequences.",
    "businessDescription": "Ideal for promotional activities aimed at building goodwill, public recognition, and securing endorsements from prominent individuals. Prioritize the company's image and reputation over immediate profits.",
    "astrologySign": "Aries (Actions Have Consequences)"
  },
  {
    "title": "Hard Work",
    "shortDescription": "A time for diligent effort and adaptability to temporary changes.",
    "personalDescription": "A period where diligent effort and adaptability are crucial. Suitable for temporary changes such as moving homes, short trips, or career shifts. Avoid long-term commitments or significant investments unless carefully formalized.",
    "businessDescription": "Ideal for short-term experiments, temporary staffing adjustments, and forming beneficial business connections. Steer clear of verbal agreements or long-term commitments unless formally documented. Flexibility leads to progress.",
    "astrologySign": "Taurus (Stop Being Stubborn)"
  },
  {
    "title": "Friendship",
    "shortDescription": "A dynamic phase for ambitious projects and strengthening relationships.",
    "personalDescription": "A dynamic and energetic phase ideal for initiating ambitious projects requiring persistence and physical strength. Effective communication strengthens relationships, but impulsiveness should be avoided to prevent conflicts.",
    "businessDescription": "Ideal for expansion, energetic ventures, and assertive promotional activities. Excellent for debt collection but avoid legal conflicts. Maintain vigilance against accidents and disputes while leveraging strong communication.",
    "astrologySign": "Gemini (Communication is Power)"
  },
  {
    "title": "Opportunities",
    "shortDescription": "An intellectually fertile time for creativity and quick decision-making.",
    "personalDescription": "An intellectually fertile phase ideal for creative projects, innovation, and quick decision-making. Beware of deception, especially concerning documents or agreements. Foster mental growth and create valuable connections, but remain cautious.",
    "businessDescription": "Perfect for launching impactful marketing campaigns and securing new agreements. Excellent for promotional activities and intellectual creativity, but carefully scrutinize documents to avoid fraud.",
    "astrologySign": "Cancer (Nurture Mental Growth)"
  },
  {
    "title": "Tears/Decision",
    "shortDescription": "The most prosperous phase for financial resolution and spiritual advancement.",
    "personalDescription": "The most prosperous phase of the year, suitable for resolving financial issues, starting long journeys, and advancing spiritually. Interact with influential figures, manage debts, and engage in expansive social activities. Keep ego and selfishness balanced for optimal outcomes.",
    "businessDescription": "A prime time for investments, financial growth, global promotion, debt collection, and favorable legal outcomes. Emphasize fairness and generosity to enhance business success.",
    "astrologySign": "Leo (Balance Ego and Generosity)"
  },
  {
    "title": "Triple Blessing",
    "shortDescription": "Perfect for pleasures, social activities, and creative pursuits.",
    "personalDescription": "Ideal for enjoying pleasures, social activities, artistic endeavors, and short travels. Favorable for romantic interactions, relaxation, and creative pursuits. Organize personal life to balance enjoyment and refinement effectively.",
    "businessDescription": "Excellent time for promoting luxury products, arts, entertainment, and speculative investments. Ideal for forming friendly business alliances and strategic partnerships.",
    "astrologySign": "Virgo (Organize Your Pleasures)"
  },
  {
    "title": "Rest",
    "shortDescription": "A period of rest, introspection, and preparation for renewal.",
    "personalDescription": "A critical period of rest, introspection, and cautious preparation for renewal. Avoid initiating new ventures and instead focus on completing pending matters, managing legal affairs carefully, and protecting existing resources. Balance and patience are essential.",
    "businessDescription": "Period to conserve resources, avoid major expansions, and carefully manage internal restructuring. Postpone significant new ventures until the next cycle. Act diplomatically and cautiously to ensure stability.",
    "astrologySign": "Libra (Seek Balance and Reconstruction)"
  }
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
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Find the most recent anniversary of the start date
const getMostRecentStartDate = (startDate: Date, today: Date) => {
  const startMonth = startDate.getMonth();
  const startDay = startDate.getDate();
  let recentStart = new Date(today.getFullYear(), startMonth, startDay);
  if (recentStart > today) {
    recentStart = new Date(today.getFullYear() - 1, startMonth, startDay);
  }
  return recentStart;
};

// Calculate cycles (annual and monthly)
export const calculateCycles = (startDate: Date, today: Date): CycleInfo => {
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
      const cycleStart = new Date(birthYear + (i * 7), startDate.getMonth(), startDate.getDate());

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
          const ageCycleStartYear = birthYear + (Math.floor(ageInYears / 7) * 7); // Start year of current age cycle
          const yearlyCycleStart = new Date(ageCycleStartYear + j, startDate.getMonth(), startDate.getDate());
          const yearlyCycle = j + 1;
          
          const isCurrentYearlyCycle = yearlyCycle === currentYearlyCycle;
          
          yearlyCycles.push({
            number: yearlyCycle,
            description: CYCLE_MEANINGS[j],
            isActive: isCurrentYearlyCycle,
            cycleStart: yearlyCycleStart
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
      cycleStart: cycleStart
    });
  }

  // Find current monthly cycle
  let currentMonthlyCycle = null;
  let daysInMonthlyCycle = 0;
  for (let i = 0; i < 7; i++) {
    const cycleStart = addDays(mostRecentStart, i * cycleLength);
    const nextCycleStart = i < 6 ? addDays(mostRecentStart, (i + 1) * cycleLength) : addDays(mostRecentStart, 366);
    if (today >= cycleStart && today < nextCycleStart) {
      currentMonthlyCycle = i + 1;
      daysInMonthlyCycle = Math.floor((today.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      monthlyCycles[i].isActive = true;
      break;
    }
  }

  const totalDays = Math.floor((today.getTime() - mostRecentStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return {
    yearlyCycles,
    ageCycles,
    monthlyCycles,
    currentYearlyCycle,
    currentAgeCycle,
    currentMonthlyCycle,
    daysInMonthlyCycle,
    totalDays
  };
};