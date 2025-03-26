/**
 * Example of using the astrology module with Swiss Ephemeris
 * 
 * Note: This example requires the Swiss Ephemeris WASM module to be compiled
 * and available. The provided data path should contain the Swiss Ephemeris
 * ephemeris files (*.se1).
 */

import { getBirthChart, getZodiacPosition, HouseSystem } from '../src/astrology';

async function main() {
  try {
    console.log('Calculating birth chart...');
    
    // Calculate a birth chart for a specific date, time and location
    const birthChart = await getBirthChart({
      date: new Date('1990-06-15T12:30:00'), // June 15, 1990, 12:30 PM
      latitude: 40.7128,                     // New York City latitude
      longitude: -74.0060,                   // New York City longitude
      timezone: -4,                          // Eastern Daylight Time (EDT)
      houseSystem: HouseSystem.PLACIDUS      // House system
    });
    
    // Display the ascendant
    const ascendantPosition = getZodiacPosition(birthChart.ascendant);
    console.log(`Ascendant: ${ascendantPosition.sign} ${ascendantPosition.degrees.toFixed(2)}°`);
    
    // Display the MC (Medium Coeli)
    const mcPosition = getZodiacPosition(birthChart.mc);
    console.log(`Midheaven (MC): ${mcPosition.sign} ${mcPosition.degrees.toFixed(2)}°`);
    
    // Display houses
    console.log('\nHouse Cusps:');
    birthChart.houses.forEach((house, index) => {
      const position = getZodiacPosition(house);
      console.log(`House ${index + 1}: ${position.sign} ${position.degrees.toFixed(2)}°`);
    });
    
    // Display planetary positions
    console.log('\nPlanetary Positions:');
    Object.entries(birthChart.planets).forEach(([planet, position]) => {
      const zodiacPos = getZodiacPosition(position.longitude);
      console.log(
        `${planet.charAt(0).toUpperCase() + planet.slice(1)}: ${zodiacPos.sign} ${zodiacPos.degrees.toFixed(2)}° ` +
        `(${position.longitude.toFixed(2)}°, speed: ${position.longitudeSpeed?.toFixed(4) || 'N/A'}°/day)`
      );
    });
  } catch (error) {
    console.error('Error in astrology example:', error);
  }
}

// Run the example
main();

/**
 * Note: If the Swiss Ephemeris WASM module is not available, the example will 
 * still run but with placeholder values (all zeros).
 * 
 * To use with real ephemeris files:
 * 1. Download ephemeris files from https://www.astro.com/ftp/swisseph/ephe/
 * 2. Place them in a directory accessible by your app
 * 3. Set the ephePath parameter in the SwissEph constructor
 */ 