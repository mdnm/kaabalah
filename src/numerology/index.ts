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