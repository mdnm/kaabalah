/**
 * Basic usage examples for the Kaabalah library
 */

// Full library import example
import * as Kaabalah from '../src';

// Selective import examples (commented out to avoid conflict with above)
// import { calculateLifePath } from '../src/numerology';
// import { getBirthChart } from '../src/astrology';
// import { calculateGematria } from '../src/kaabalah';
// import { getRandomSpread } from '../src/tarot';

// Numerology example
const birthDate = new Date('1990-06-15');
const lifePath = Kaabalah.calculateLifePath(birthDate);
console.log(`Life Path Number for 1990-06-15: ${lifePath}`);

// Kaabalah example
const hebrewWord = 'שלום';
const gematriaValue = Kaabalah.calculateGematria(hebrewWord);
console.log(`Gematria value of "${hebrewWord}": ${gematriaValue}`);

// Tarot example
const tarotSpread = Kaabalah.getRandomSpread(3);
console.log('Three-card Tarot Spread:');
tarotSpread.forEach((card, index) => {
  console.log(`Card ${index + 1}: ${card.name}${card.isReversed ? ' (Reversed)' : ''}`);
});

// Astrology example (placeholder until Swiss Ephemeris is implemented)
const birthChart = Kaabalah.getBirthChart({
  date: new Date('1990-06-15T12:30:00Z'),
  latitude: 40.7128,
  longitude: -74.0060,
  timezone: -5
});
console.log('Birth Chart (placeholder):', birthChart); 