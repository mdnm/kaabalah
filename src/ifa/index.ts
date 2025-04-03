
/**
 * Calculate the Odu numbers based on a date
 * @param date - Date object
 * @returns Odu numbers
 */
export function calculateOdu(date: Date): {
  leftNumbers: number[],
  rightNumbers: number[],
  north: number,  // O2 (reduced left sum)
  south: number,  // reduced right sum
  east: number,   // reduced sum of north and south
  west: number,   // reduced sum of north, south, and east
  center: number  // reduced sum of all directions
} {
  // Format the date into DD/MM/YYYY
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();

  // Split into left and right columns
  const leftNumbers = [
    parseInt(day[0]),    // First digit of day
    parseInt(month[0]),  // First digit of month
    parseInt(year[0]),   // First digit of year
    parseInt(year[2])    // Third digit of year
  ];

  const rightNumbers = [
    parseInt(day[1]),    // Second digit of day
    parseInt(month[1]),  // Second digit of month
    parseInt(year[1]),   // Second digit of year
    parseInt(year[3])    // Fourth digit of year
  ];

  // Reduce numbers if they're greater than 16
  function reduceNumber(num: number): number {
    if (num <= 16) return num;
    return reduceNumber(num.toString().split('').reduce((a, b) => a + parseInt(b), 0));
  }

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