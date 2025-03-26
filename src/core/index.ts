/**
 * Core utilities and shared code for the Kaabalah library
 */

export const VERSION = '0.1.0';

// Example utility function
export function isValidDate(date: Date): boolean {
  return !isNaN(date.getTime());
} 