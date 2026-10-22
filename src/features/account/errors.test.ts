import { describe, expect, it } from "vitest";
import { toFriendlyAuthError } from "./errors";

describe("toFriendlyAuthError", () => {
  it("explains a wrong email or password", () => {
    expect(toFriendlyAuthError("invalid_credentials")).toBe(
      "Wrong email or password.",
    );
  });

  it("explains that the email is already registered", () => {
    expect(toFriendlyAuthError("user_already_exists")).toBe(
      "An account with this email already exists.",
    );
    expect(toFriendlyAuthError("email_exists")).toBe(
      "An account with this email already exists.",
    );
  });

  it("explains a weak password", () => {
    expect(toFriendlyAuthError("weak_password")).toBe(
      "That password is too weak. Try a longer one.",
    );
  });

  it("explains rate limits", () => {
    expect(toFriendlyAuthError("over_request_rate_limit")).toBe(
      "Too many attempts. Wait a minute and try again.",
    );
  });

  it("falls back to a generic message for anything else", () => {
    expect(toFriendlyAuthError("unexpected_failure")).toBe(
      "Something went wrong. Please try again.",
    );
    expect(toFriendlyAuthError(undefined)).toBe(
      "Something went wrong. Please try again.",
    );
  });
});
