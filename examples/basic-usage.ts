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
const name = 'Kaabalah';
const gematriaValue = Kaabalah.calculateGematria(name);
console.log(`Gematria value of "${name}": ${gematriaValue}`);

// Tarot example TODO

// IFA example TODO

// Numerology heptad example TODO

// Astrology example (placeholder until Swiss Ephemeris is implemented)
const birthChart = Kaabalah.getBirthChart({
  date: new Date('1990-06-15T12:30:00Z'),
  latitude: 40.7128,
  longitude: -74.0060,
  timezone: -5
});
console.log('Birth Chart (placeholder):', birthChart); 