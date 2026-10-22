import { describe, expect, it } from "vitest";
import { formatPlayers } from "./format";

describe("formatPlayers", () => {
  it("uses the singular for exactly one player", () => {
    expect(formatPlayers(1, 1)).toBe("1 player");
  });

  it("shows one number when min and max are the same", () => {
    expect(formatPlayers(3, 3)).toBe("3 players");
  });

  it("shows a range otherwise", () => {
    expect(formatPlayers(2, 4)).toBe("2–4 players");
    expect(formatPlayers(1, 7)).toBe("1–7 players");
  });
});
