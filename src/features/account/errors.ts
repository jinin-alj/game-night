/** Turns a Supabase auth error code into a message that is safe to show the user. */
export function toFriendlyAuthError(errorCode: string | undefined): string {
  if (errorCode === "invalid_credentials") {
    return "Wrong email or password.";
  }
  if (errorCode === "user_already_exists" || errorCode === "email_exists") {
    return "An account with this email already exists.";
  }
  if (errorCode === "weak_password") {
    return "That password is too weak. Try a longer one.";
  }
  if (errorCode === "over_request_rate_limit") {
    return "Too many attempts. Wait a minute and try again.";
  }
  return "Something went wrong. Please try again.";
}
