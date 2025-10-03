/**
 * Timezone utilities for handling MDT (Mountain Daylight Time) / MST (Mountain Standard Time)
 *
 * The application uses UTC in the database but all date calculations and user-facing
 * dates should be in Mountain Time (America/Denver).
 */

const TIMEZONE = 'America/Denver'; // Mountain Time (handles both MDT and MST automatically)

/**
 * Get the start of day in Mountain Time for a given date
 * @param date - Date string or Date object (defaults to today)
 * @returns Date object representing start of day in Mountain Time (converted to UTC)
 */
export function getStartOfDayMT(date?: string | Date): Date {
  const targetDate = date ? new Date(date) : new Date();

  // Format the date in Mountain Time and parse it back
  const mtDateString = targetDate.toLocaleString('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  // Parse MM/DD/YYYY format
  const [month, day, year] = mtDateString.split('/');

  // Create a date string that represents midnight in Mountain Time
  // We need to manually calculate what UTC time corresponds to midnight MT
  const midnightMT = new Date(`${year}-${month}-${day}T00:00:00`);

  // Get the timezone offset for Mountain Time on this date (handles DST)
  const mtOffset = getMTOffset(midnightMT);

  // Calculate UTC time that corresponds to midnight MT
  const utcMidnight = new Date(midnightMT.getTime() - mtOffset);

  return utcMidnight;
}

/**
 * Get the end of day in Mountain Time for a given date (start of next day)
 * @param date - Date string or Date object (defaults to today)
 * @returns Date object representing end of day in Mountain Time (converted to UTC)
 */
export function getEndOfDayMT(date?: string | Date): Date {
  const startOfDay = getStartOfDayMT(date);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);
  return endOfDay;
}

/**
 * Get the Mountain Time offset in milliseconds for a given date
 * This handles both MDT (-6 hours) and MST (-7 hours) automatically
 */
function getMTOffset(date: Date): number {
  // Create a date formatter for Mountain Time
  const mtDate = new Date(date.toLocaleString('en-US', { timeZone: TIMEZONE }));
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));

  // Calculate offset in milliseconds
  return utcDate.getTime() - mtDate.getTime();
}

/**
 * Get today's date range in Mountain Time
 * @returns Object with start and end Date objects (in UTC) for today in Mountain Time
 */
export function getTodayRangeMT(): { start: Date; end: Date } {
  return {
    start: getStartOfDayMT(),
    end: getEndOfDayMT(),
  };
}

/**
 * Format a Date object for display in Mountain Time
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string in Mountain Time
 */
export function formatMT(
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
): string {
  return date.toLocaleString('en-US', {
    ...options,
    timeZone: TIMEZONE,
  });
}

/**
 * Check if a date is today in Mountain Time
 * @param date - Date to check
 * @returns true if the date is today in Mountain Time
 */
export function isTodayMT(date: Date): boolean {
  const { start, end } = getTodayRangeMT();
  return date >= start && date < end;
}

export { TIMEZONE };
