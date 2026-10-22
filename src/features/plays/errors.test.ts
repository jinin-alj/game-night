import { describe, expect, it } from "vitest";
import { toFriendlyPlayError } from "./errors";

describe("toFriendlyPlayError", () => {
  it("explains a night that hasn't happened yet", () => {
    expect(toFriendlyPlayError("P0001", "night_in_future")).toBe(
      "You can log games on the night itself or after it.",
    );
  });

  it("explains a game that is already logged", () => {
    expect(toFriendlyPlayError("23505", "duplicate key value")).toBe(
      "That game is already logged for this night.",
    );
  });

  it("explains a game that isn't on the shelf", () => {
    expect(toFriendlyPlayError("P0001", "game_not_found")).toBe(
      "That game isn’t on the shelf any more. Refresh the page.",
    );
  });

  it("falls back to a generic message", () => {
    expect(toFriendlyPlayError("42501", "permission denied")).toBe(
      "Couldn’t log the game. Please try again.",
    );
  });
});
