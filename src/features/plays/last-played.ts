export type PlayRecord = {
  gameId: string | null;
  nightId: string;
};

export type NightDate = {
  id: string;
  nightDate: string;
};

/** Returns, for each game still on the shelf, the latest night date it was played on. */
export function getLastPlayedDates(
  plays: PlayRecord[],
  nights: NightDate[],
): Record<string, string> {
  const nightDates: Record<string, string> = {};
  for (const night of nights) {
    nightDates[night.id] = night.nightDate;
  }

  const lastPlayedDates: Record<string, string> = {};
  for (const play of plays) {
    const nightDate = nightDates[play.nightId];
    // A play keeps its history when its game is deleted, but it no longer affects recency.
    if (play.gameId === null || nightDate === undefined) {
      continue;
    }
    const knownDate = lastPlayedDates[play.gameId];
    // YYYY-MM-DD strings compare in the same order as the dates they stand for.
    if (knownDate === undefined || nightDate > knownDate) {
      lastPlayedDates[play.gameId] = nightDate;
    }
  }
  return lastPlayedDates;
}
