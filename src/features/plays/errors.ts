/** Turns a database error from logging a play into a message safe to show. */
export function toFriendlyPlayError(
  errorCode: string,
  errorMessage: string,
): string {
  if (errorMessage === "night_in_future") {
    return "You can log games on the night itself or after it.";
  }
  if (errorMessage === "game_not_found") {
    return "That game isn’t on the shelf any more. Refresh the page.";
  }
  // 23505 means the unique rule refused a second play of the same game on this night.
  if (errorCode === "23505") {
    return "That game is already logged for this night.";
  }
  return "Couldn’t log the game. Please try again.";
}
