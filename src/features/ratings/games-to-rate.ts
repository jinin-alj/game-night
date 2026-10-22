export type PlayedGame = {
  gameId: string | null;
  gameTitle: string;
};

export type GameToRate = {
  gameId: string;
  gameTitle: string;
};

/** Returns each played game the user hasn't rated yet, once, in title order. */
export function findGamesToRate(
  plays: PlayedGame[],
  ratedGameIds: string[],
): GameToRate[] {
  const gamesToRate: GameToRate[] = [];
  const seenGameIds: string[] = [];

  for (const play of plays) {
    // Deleted games keep their plays, but there is nothing left to rate.
    if (play.gameId === null) {
      continue;
    }
    if (
      ratedGameIds.includes(play.gameId) ||
      seenGameIds.includes(play.gameId)
    ) {
      continue;
    }
    seenGameIds.push(play.gameId);
    gamesToRate.push({ gameId: play.gameId, gameTitle: play.gameTitle });
  }

  gamesToRate.sort((first, second) =>
    first.gameTitle.localeCompare(second.gameTitle),
  );
  return gamesToRate;
}
