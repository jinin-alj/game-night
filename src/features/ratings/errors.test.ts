import { describe, expect, it } from "vitest";
import { toFriendlyRatingError } from "./errors";

describe("toFriendlyRatingError", () => {
  it("explains each refusal from the database", () => {
    expect(toFriendlyRatingError("invalid_score")).toBe(
      "Pick a rating from 1 to 10.",
    );
    expect(toFriendlyRatingError("game_not_found")).toBe(
      "That game isn’t on the shelf any more. Refresh the page.",
    );
    expect(toFriendlyRatingError("not_member")).toBe(
      "You’re not in that game’s group any more. Refresh the page.",
    );
  });

  it("never shows raw database text", () => {
    expect(toFriendlyRatingError("permission denied for table ratings")).toBe(
      "Couldn’t save your rating. Please try again.",
    );
  });
});
