/** Turns an error word raised by rate_game into a message safe to show. */
export function toFriendlyRatingError(errorMessage: string): string {
  if (errorMessage === "invalid_score") {
    return "Pick a rating from 1 to 10.";
  }
  if (errorMessage === "game_not_found") {
    return "That game isn’t on the shelf any more. Refresh the page.";
  }
  if (errorMessage === "not_member") {
    return "You’re not in that game’s group any more. Refresh the page.";
  }
  return "Couldn’t save your rating. Please try again.";
}
