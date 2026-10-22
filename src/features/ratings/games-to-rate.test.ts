import { describe, expect, it } from "vitest";
import { findGamesToRate } from "./games-to-rate";

describe("findGamesToRate", () => {
  it("lists each played game once, in title order", () => {
    const games = findGamesToRate(
      [
        { gameId: "dune", gameTitle: "Dune" },
        { gameId: "catan", gameTitle: "Catan" },
        { gameId: "dune", gameTitle: "Dune" },
      ],
      [],
    );

    expect(games).toEqual([
      { gameId: "catan", gameTitle: "Catan" },
      { gameId: "dune", gameTitle: "Dune" },
    ]);
  });

  it("skips games the user already rated", () => {
    const games = findGamesToRate(
      [
        { gameId: "dune", gameTitle: "Dune" },
        { gameId: "catan", gameTitle: "Catan" },
      ],
      ["dune"],
    );

    expect(games).toEqual([{ gameId: "catan", gameTitle: "Catan" }]);
  });

  it("skips plays whose game was deleted", () => {
    expect(
      findGamesToRate([{ gameId: null, gameTitle: "Old game" }], []),
    ).toEqual([]);
  });

  it("returns nothing when nothing was played", () => {
    expect(findGamesToRate([], ["dune"])).toEqual([]);
  });
});
