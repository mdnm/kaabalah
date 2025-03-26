/**
 * Kabbalah-related functions
 */

// Example function to calculate Hebrew gematria value
export function calculateGematria(hebrewText: string): number {
  const hebrewValues: Record<string, number> = {
    'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
    'י': 10, 'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50, 'ס': 60, 'ע': 70, 'פ': 80, 'צ': 90,
    'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400, 'ך': 20, 'ם': 40, 'ן': 50, 'ף': 80, 'ץ': 90
  };

  let total = 0;
  for (let i = 0; i < hebrewText.length; i++) {
    const char = hebrewText[i];
    if (hebrewValues[char]) {
      total += hebrewValues[char];
    }
  }
  
  return total;
} 