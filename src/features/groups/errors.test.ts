import { describe, expect, it } from "vitest";
import { toFriendlyGroupError } from "./errors";

describe("toFriendlyGroupError", () => {
  it("explains each rule the database can refuse", () => {
    expect(toFriendlyGroupError("last_group")).toBe(
      "You can’t leave your only group. Create or join another group first.",
    );
    expect(toFriendlyGroupError("owner_must_hand_over")).toBe(
      "Hand over ownership to another member first.",
    );
    expect(toFriendlyGroupError("invalid_code")).toBe(
      "That invite code doesn’t work. Check it or ask for a new link.",
    );
    expect(toFriendlyGroupError("not_owner")).toBe(
      "Only the group’s owner can do that.",
    );
    expect(toFriendlyGroupError("cannot_remove_self")).toBe(
      "You can’t remove yourself. Use Leave this group instead.",
    );
  });

  it("never shows raw database text", () => {
    expect(
      toFriendlyGroupError('duplicate key value violates "groups_pkey"'),
    ).toBe("Something went wrong. Please try again.");
    expect(toFriendlyGroupError(undefined)).toBe(
      "Something went wrong. Please try again.",
    );
  });
});
