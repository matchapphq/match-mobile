import { parseISO, isToday, isTomorrow, isWeekend, format, startOfDay, addDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * DateTime Utilities for Match
 * 
 * Flow: UTC ISO (API-Sports) -> Local Date Object -> Formatted Local Labels
 */

/**
 * Parses a UTC string into a local Date object.
 * Handles ISO strings and DB string formats like "2026-04-04 16:00:00+00" or "2026-04-04 16:00:00"
 */
export const parseUtcToLocal = (dateString: string): Date => {
  // If the date string contains a space but no 'T' or timezone indicator, 
  // ensure we parse it as UTC by appending 'Z' or replacing space with 'T' and appending 'Z'
  let normalizedString = dateString;
  
  if (normalizedString.includes(' ') && !normalizedString.includes('+') && !normalizedString.endsWith('Z')) {
      // E.g. "2026-04-04 16:00:00" -> "2026-04-04T16:00:00Z"
      normalizedString = normalizedString.replace(' ', 'T') + 'Z';
  } else if (normalizedString.includes(' ') && normalizedString.includes('+')) {
      // E.g. "2026-04-04 16:00:00+00" -> "2026-04-04T16:00:00+00:00"
      normalizedString = normalizedString.replace(' ', 'T');
      if (normalizedString.endsWith('+00')) {
          normalizedString += ':00';
      }
  }

  return parseISO(normalizedString);
};

/**
 * Returns true if the UTC timestamp falls on the same local calendar day as the comparison date.
 */
export const isOnLocalDay = (dateIso: string, localTargetDate: Date): boolean => {
  const matchDate = parseUtcToLocal(dateIso);
  return isSameDay(matchDate, localTargetDate);
};

/**
 * Formats a match date/time into localized strings (French default).
 */
export const formatMatchDateTimeLocal = (
  dateIso: string,
  options?: { referenceDate?: Date }
): { 
  dateLabel: string; 
  timeLabel: string; 
  dayPartLabel?: string;
  relativeTimeLabel: string;
} => {
  const localDate = parseUtcToLocal(dateIso);
  const refDate = options?.referenceDate || new Date();
  
  // Time label: "21:00"
  const timeLabel = format(localDate, 'HH:mm');

  // Date label: "dim. 22 mars"
  const dateLabel = format(localDate, 'EEE d MMM', { locale: fr }).replace('.', '');

  // Day part label: "Aujourd'hui", "Demain", etc.
  let dayPartLabel: string | undefined;
  
  if (isToday(localDate)) {
    dayPartLabel = "Aujourd'hui";
  } else if (isTomorrow(localDate)) {
    dayPartLabel = "Demain";
  } else {
    // Check if it's "This weekend" (Saturday or Sunday)
    const day = localDate.getDay();
    const isSatOrSun = day === 0 || day === 6;
    const isWithinWeek = localDate.getTime() <= addDays(startOfDay(refDate), 7).getTime();
    if (isSatOrSun && isWithinWeek) {
      dayPartLabel = "Ce week-end";
    }
  }

  // Relative Time Label for cards: e.g. "21:00" or "Demain • 01:00"
  let relativeTimeLabel = timeLabel;
  const refStart = startOfDay(refDate);
  const matchStart = startOfDay(localDate);
  
  if (matchStart.getTime() > refStart.getTime()) {
    if (isTomorrow(localDate)) {
      relativeTimeLabel = `Demain • ${timeLabel}`;
    } else {
      relativeTimeLabel = `${format(localDate, 'EEE', { locale: fr })} • ${timeLabel}`;
    }
  } else if (matchStart.getTime() < refStart.getTime()) {
    relativeTimeLabel = `Hier • ${timeLabel}`;
  }

  return { dateLabel, timeLabel, dayPartLabel, relativeTimeLabel };
};

/**
 * Generates local date ranges for "Ce week-end"
 */
export const getThisWeekendRange = (): { start: Date; end: Date } => {
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday, 6 is Saturday
  
  let saturday = addDays(now, (6 - day + 7) % 7);
  let sunday = addDays(saturday, 1);
  
  return {
    start: startOfDay(saturday),
    end: startOfDay(sunday),
  };
};
