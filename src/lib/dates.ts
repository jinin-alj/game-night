const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const FRIDAY = 5;

/** Returns today's date in Madrid as YYYY-MM-DD. */
export function getTodayInMadrid(now: Date = new Date()): string {
  // The en-CA locale writes dates as YYYY-MM-DD.
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(now);
}

/** Returns the given date if it is a Friday, otherwise the Friday after it (YYYY-MM-DD). */
export function getNextFriday(today: string): string {
  const date = new Date(`${today}T00:00:00Z`);
  const daysUntilFriday = (FRIDAY - date.getUTCDay() + 7) % 7;
  date.setUTCDate(date.getUTCDate() + daysUntilFriday);
  return date.toISOString().slice(0, 10);
}

/** Checks that a YYYY-MM-DD string is a date that exists on the calendar. */
export function isRealDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  // Days like 2026-02-30 roll over into the next month, so the text no longer matches.
  return date.toISOString().slice(0, 10) === value;
}

/** Formats a YYYY-MM-DD date like "Fri, 30 Oct 2026". */
export function formatNightDate(date: string): string {
  // Formatting in UTC keeps the day from shifting in other time zones.
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return formatter.format(new Date(`${date}T00:00:00Z`));
}

/** Formats a number of minutes like "30 min", "3 h" or "2 h 30 min". */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const leftoverMinutes = minutes % 60;

  if (hours === 0) {
    return `${leftoverMinutes} min`;
  }
  if (leftoverMinutes === 0) {
    return `${hours} h`;
  }
  return `${hours} h ${leftoverMinutes} min`;
}
