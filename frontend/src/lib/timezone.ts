/**
 * Timezone utilities for handling MDT (Mountain Daylight Time) / MST (Mountain Standard Time)
 * on the frontend.
 *
 * All dates from the API are in UTC ISO format. We convert them to Mountain Time for display.
 */

const TIMEZONE = 'America/Denver'; // Mountain Time (handles both MDT and MST automatically)

/**
 * Format a date string (ISO UTC) to Mountain Time
 * @param dateString - ISO date string from API
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string in Mountain Time
 */
export function formatMT(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    ...options,
    timeZone: TIMEZONE,
  });
}

/**
 * Format a date to just the time in Mountain Time
 * @param dateString - ISO date string from API
 * @returns Time string in Mountain Time (e.g., "2:30 PM")
 */
export function formatTimeMT(dateString: string): string {
  return formatMT(dateString, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format a date to just the date in Mountain Time
 * @param dateString - ISO date string from API
 * @returns Date string in Mountain Time (e.g., "Jan 15, 2025")
 */
export function formatDateMT(dateString: string): string {
  return formatMT(dateString, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date to a full date and time in Mountain Time
 * @param dateString - ISO date string from API
 * @returns Full date and time string in Mountain Time (e.g., "Jan 15, 2025, 2:30 PM")
 */
export function formatDateTimeMT(dateString: string): string {
  return formatMT(dateString, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Get a relative time string (e.g., "2 hours ago") for Mountain Time
 * @param dateString - ISO date string from API
 * @returns Relative time string
 */
export function formatRelativeMT(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  return formatDateMT(dateString);
}

/**
 * Check if a date is today in Mountain Time
 * @param dateString - ISO date string from API
 * @returns true if the date is today in Mountain Time
 */
export function isTodayMT(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();

  const dateMT = date.toLocaleDateString('en-US', { timeZone: TIMEZONE });
  const nowMT = now.toLocaleDateString('en-US', { timeZone: TIMEZONE });

  return dateMT === nowMT;
}

/**
 * Get the current date in Mountain Time as YYYY-MM-DD
 * @returns Date string in YYYY-MM-DD format
 */
export function getTodayMT(): string {
  const now = new Date();
  const mtDate = now.toLocaleDateString('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  // Convert from MM/DD/YYYY to YYYY-MM-DD
  const [month, day, year] = mtDate.split('/');
  return `${year}-${month}-${day}`;
}

export { TIMEZONE };
