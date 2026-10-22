import { describe, expect, it } from "vitest";
import { getLastPlayedDates } from "./last-played";

const nights = [
  { id: "night-1", nightDate: "2026-10-02" },
  { id: "night-2", nightDate: "2026-10-16" },
  { id: "night-3", nightDate: "2026-10-09" },
];

describe("getLastPlayedDates", () => {
  it("keeps the latest night date for each game", () => {
    const dates = getLastPlayedDates(
      [
        { gameId: "catan", nightId: "night-1" },
        { gameId: "catan", nightId: "night-2" },
        { gameId: "catan", nightId: "night-3" },
        { gameId: "dune", nightId: "night-3" },
      ],
      nights,
    );

    expect(dates).toEqual({ catan: "2026-10-16", dune: "2026-10-09" });
  });

  it("skips plays of games that were deleted", () => {
    expect(
      getLastPlayedDates([{ gameId: null, nightId: "night-1" }], nights),
    ).toEqual({});
  });

  it("skips plays whose night isn't in the list", () => {
    expect(
      getLastPlayedDates([{ gameId: "catan", nightId: "night-9" }], nights),
    ).toEqual({});
  });

  it("returns nothing when there are no plays", () => {
    expect(getLastPlayedDates([], nights)).toEqual({});
  });
});
