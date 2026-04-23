
export type OduNumbers = {
  leftNumbers: number[],
  rightNumbers: number[],
  north: number,
  south: number,
  east: number,
  west: number,
  center: number
}

function isMidnight(date: Date, mode: "local" | "utc"): boolean {
  if (mode === "utc") {
    return (
      date.getUTCHours() === 0 &&
      date.getUTCMinutes() === 0 &&
      date.getUTCSeconds() === 0 &&
      date.getUTCMilliseconds() === 0
    );
  }

  return (
    date.getHours() === 0 &&
    date.getMinutes() === 0 &&
    date.getSeconds() === 0 &&
    date.getMilliseconds() === 0
  );
}

function extractDateParts(date: Date): { day: string; month: string; year: string } {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error("Date must be a valid Date object");
  }

  const useLocalDate = isMidnight(date, "local") && !isMidnight(date, "utc");

  if (useLocalDate) {
    return {
      day: date.getDate().toString().padStart(2, "0"),
      month: (date.getMonth() + 1).toString().padStart(2, "0"),
      year: date.getFullYear().toString().padStart(4, "0"),
    };
  }

  const formattedDate = date.toISOString().split("T")[0];
  const [year, month, day] = formattedDate.split("-");

  return { day, month, year };
}

function reduceNumber(num: number): number {
  if (num <= 16) {
    return num;
  }

  return reduceNumber(
    num
      .toString()
      .split("")
      .reduce((sum, digit) => sum + Number.parseInt(digit, 10), 0)
  );
}

/**
 * Calculate the Odu numbers based on a date
 * @param date - Date object
 * @returns Odu numbers
 */
export function calculateOdu(date: Date): OduNumbers {
  const { day, month, year } = extractDateParts(date);

  // Split into left and right columns
  const leftNumbers = [
    Number.parseInt(day[0], 10),    // First digit of day
    Number.parseInt(month[0], 10),  // First digit of month
    Number.parseInt(year[0], 10),   // First digit of year
    Number.parseInt(year[2], 10)    // Third digit of year
  ];

  const rightNumbers = [
    Number.parseInt(day[1], 10),    // Second digit of day
    Number.parseInt(month[1], 10),  // Second digit of month
    Number.parseInt(year[1], 10),   // Second digit of year
    Number.parseInt(year[3], 10)    // Fourth digit of year
  ];

  // Calculate initial sums
  const rawLeftSum = leftNumbers.reduce((a, b) => a + b, 0);
  const rawRightSum = rightNumbers.reduce((a, b) => a + b, 0);

  // Calculate and reduce each direction
  const north = reduceNumber(rawLeftSum);
  const south = reduceNumber(rawRightSum);
  const east = reduceNumber(north + south);
  const west = reduceNumber(north + south + east);
  const center = reduceNumber(north + south + east + west);

  return {
    leftNumbers,
    rightNumbers,
    north,
    south,
    east,
    west,
    center
  };
}
