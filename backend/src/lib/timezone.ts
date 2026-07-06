import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { startOfDay, addDays, format } from 'date-fns';

const TIMEZONE = 'America/Denver';

export function getStartOfDayMT(date?: string | Date): Date {
  let localDate: Date;
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    // Parse date-only string as a local wall-clock date in MT, not UTC
    const parts = date.split('-').map(Number);
    localDate = new Date(parts[0]!, parts[1]! - 1, parts[2]);
  } else {
    localDate = date ? new Date(date) : new Date();
  }
  const zonedDate = utcToZonedTime(localDate, TIMEZONE);
  return zonedTimeToUtc(startOfDay(zonedDate), TIMEZONE);
}

export function getEndOfDayMT(date?: string | Date): Date {
  return addDays(getStartOfDayMT(date), 1);
}

export function getTodayRangeMT(): { start: Date; end: Date } {
  return {
    start: getStartOfDayMT(),
    end: getEndOfDayMT(),
  };
}

export function formatMT(
  date: Date,
  formatStr: string = 'MMM d, yyyy h:mm aa'
): string {
  return format(utcToZonedTime(date, TIMEZONE), formatStr);
}

export function isTodayMT(date: Date): boolean {
  const { start, end } = getTodayRangeMT();
  return date >= start && date < end;
}

export { TIMEZONE };
