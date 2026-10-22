import { describe, expect, it } from "vitest";
import { type PlannerGame, type PlannerInput, planNight } from "./planner";

const today = "2026-10-22";

function makeGame(
  id: string,
  minPlayers: number,
  maxPlayers: number,
  playtimeMinutes: number,
): PlannerGame {
  return { id, title: id, minPlayers, maxPlayers, playtimeMinutes };
}

function makeInput(changes: Partial<PlannerInput>): PlannerInput {
  return {
    games: [],
    attendeeIds: ["sam"],
    guestCount: 0,
    availableMinutes: 180,
    ratings: [],
    lastPlayedDates: {},
    today,
    ...changes,
  };
}

function pickedIds(input: PlannerInput): string[] {
  const ids: string[] = [];
  for (const pick of planNight(input).picks) {
    ids.push(pick.gameId);
  }
  return ids;
}

describe("planNight", () => {
  it("only keeps games that suit the number of players", () => {
    const lineup = planNight(
      makeInput({
        games: [
          makeGame("Alpha", 2, 4, 30),
          makeGame("Beta", 3, 5, 30),
          makeGame("Duo", 1, 2, 30),
          makeGame("Party", 5, 10, 30),
        ],
        attendeeIds: ["sam", "ana"],
        guestCount: 1,
      }),
    );

    expect(lineup.playerCount).toBe(3);
    expect(lineup.fittingGameCount).toBe(2);
    expect(lineup.picks.map((pick) => pick.gameId).sort()).toEqual([
      "Alpha",
      "Beta",
    ]);
  });

  it("scores a never-played, unrated game 10 + 5 and says it was never played", () => {
    const lineup = planNight(
      makeInput({ games: [makeGame("Alpha", 1, 4, 60)] }),
    );

    expect(lineup.picks[0].score).toBe(15);
    expect(lineup.picks[0].reasons).toEqual(["never played"]);
  });

  it("averages each attending member's own rating, using 10 for an unrated new game", () => {
    const lineup = planNight(
      makeInput({
        games: [makeGame("Alpha", 1, 4, 60)],
        attendeeIds: ["sam", "ana"],
        ratings: [{ userId: "sam", gameId: "Alpha", score: 8 }],
      }),
    );

    expect(lineup.picks[0].score).toBe(9 + 5);
    expect(lineup.picks[0].reasons).toEqual(["avg rating 9", "never played"]);
  });

  it("uses 5 for a member who hasn't rated a game that was played", () => {
    const lineup = planNight(
      makeInput({
        games: [makeGame("Alpha", 1, 4, 60)],
        lastPlayedDates: { Alpha: "2026-10-08" },
      }),
    );

    expect(lineup.picks[0].score).toBe(5 + 2);
    expect(lineup.picks[0].reasons).toEqual(["not played in 2 weeks"]);
  });

  it("ignores ratings from members who aren't coming", () => {
    const lineup = planNight(
      makeInput({
        games: [makeGame("Alpha", 1, 4, 60)],
        ratings: [{ userId: "ana", gameId: "Alpha", score: 2 }],
      }),
    );

    expect(lineup.picks[0].score).toBe(15);
  });

  it("shows ratings with one decimal", () => {
    const lineup = planNight(
      makeInput({
        games: [makeGame("Alpha", 1, 4, 60)],
        attendeeIds: ["sam", "ana"],
        ratings: [
          { userId: "sam", gameId: "Alpha", score: 8 },
          { userId: "ana", gameId: "Alpha", score: 9 },
        ],
        lastPlayedDates: { Alpha: "2026-10-20" },
      }),
    );

    expect(lineup.picks[0].reasons).toEqual([
      "avg rating 8.5",
      "played this week",
    ]);
  });

  it("caps the recency part at 5 weeks", () => {
    const lineup = planNight(
      makeInput({
        games: [makeGame("Alpha", 1, 4, 60)],
        lastPlayedDates: { Alpha: "2026-01-01" },
      }),
    );

    expect(lineup.picks[0].score).toBe(5 + 5);
    expect(lineup.picks[0].reasons).toEqual(["not played in 42 weeks"]);
  });

  it("counts guests as players but not as raters", () => {
    const lineup = planNight(
      makeInput({
        games: [makeGame("Trio", 3, 3, 60)],
        attendeeIds: ["sam"],
        guestCount: 2,
        ratings: [{ userId: "sam", gameId: "Trio", score: 6 }],
      }),
    );

    expect(lineup.playerCount).toBe(3);
    expect(lineup.picks[0].score).toBe(6 + 5);
  });

  it("orders by score, then shorter playtime, then title", () => {
    const ids = pickedIds(
      makeInput({
        games: [
          makeGame("Zebra", 1, 4, 30),
          makeGame("Apple", 1, 4, 30),
          makeGame("Long", 1, 4, 60),
          makeGame("Played", 1, 4, 10),
        ],
        lastPlayedDates: { Played: "2026-10-20" },
        availableMinutes: 600,
      }),
    );

    expect(ids).toEqual(["Apple", "Zebra", "Long", "Played"]);
  });

  it("skips a game that no longer fits and still takes a shorter one after it", () => {
    const lineup = planNight(
      makeInput({
        games: [
          makeGame("First", 1, 4, 90),
          makeGame("TooLong", 1, 4, 120),
          makeGame("Short", 1, 4, 10),
        ],
        lastPlayedDates: { TooLong: "2026-10-01", Short: "2026-10-20" },
        availableMinutes: 100,
      }),
    );

    expect(lineup.picks.map((pick) => pick.gameId)).toEqual(["First", "Short"]);
    expect(lineup.minutesUsed).toBe(100);
    expect(lineup.minutesLeft).toBe(0);
  });

  it("never plans more minutes than the night has", () => {
    const lineup = planNight(
      makeInput({
        games: [
          makeGame("A", 1, 4, 70),
          makeGame("B", 1, 4, 70),
          makeGame("C", 1, 4, 70),
        ],
        availableMinutes: 150,
      }),
    );

    expect(lineup.minutesUsed).toBeLessThanOrEqual(150);
    expect(lineup.picks).toHaveLength(2);
    expect(lineup.minutesLeft).toBe(10);
  });

  it("returns an empty lineup when no member is attending", () => {
    const lineup = planNight(
      makeInput({
        games: [makeGame("Alpha", 1, 4, 60)],
        attendeeIds: [],
        guestCount: 2,
      }),
    );

    expect(lineup.picks).toEqual([]);
    expect(lineup.minutesUsed).toBe(0);
    expect(lineup.minutesLeft).toBe(180);
  });
});
