/** Turns an error word raised by a group database function into a message safe to show. */
export function toFriendlyGroupError(errorMessage: string | undefined): string {
  switch (errorMessage) {
    case "not_signed_in":
      return "Please log in again.";
    case "invalid_name":
      return "Use a group name of 1 to 60 characters.";
    case "invalid_code":
      return "That invite code doesn’t work. Check it or ask for a new link.";
    case "not_member":
      return "You’re not in that group any more. Refresh the page.";
    case "not_owner":
      return "Only the group’s owner can do that.";
    case "last_group":
      return "You can’t leave your only group. Create or join another group first.";
    case "owner_must_hand_over":
      return "Hand over ownership to another member first.";
    case "cannot_remove_self":
      return "You can’t remove yourself. Use Leave this group instead.";
    case "not_a_member_target":
      return "That person isn’t in this group any more. Refresh the page.";
    default:
      return "Something went wrong. Please try again.";
  }
}
