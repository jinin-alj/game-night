import type { NightSummary } from "./types";

/** Splits nights sorted by date into upcoming (soonest first) and past (latest first). */
export function splitNights(nights: NightSummary[], today: string) {
  const upcoming: NightSummary[] = [];
  const past: NightSummary[] = [];

  for (const night of nights) {
    // YYYY-MM-DD strings compare in the same order as the dates they stand for.
    if (night.nightDate >= today) {
      upcoming.push(night);
    } else {
      past.unshift(night);
    }
  }

  return { upcoming, past };
}
