/** Formats a player range like "1 player", "3 players" or "2–4 players". */
export function formatPlayers(minPlayers: number, maxPlayers: number): string {
  if (minPlayers === maxPlayers) {
    if (minPlayers === 1) {
      return "1 player";
    }
    return `${minPlayers} players`;
  }
  return `${minPlayers}–${maxPlayers} players`;
}
