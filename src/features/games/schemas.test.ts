import { describe, expect, it } from "vitest";
import { gameIdSchema, gameSchema } from "./schemas";

const validGame = {
  title: "Catan",
  minPlayers: "3",
  maxPlayers: "4",
  playtimeMinutes: "60",
  copyOwnerId: "",
};

describe("gameSchema", () => {
  it("accepts a valid game, trims the title and turns numbers into numbers", () => {
    const result = gameSchema.safeParse({ ...validGame, title: "  Catan  " });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      title: "Catan",
      minPlayers: 3,
      maxPlayers: 4,
      playtimeMinutes: 60,
      copyOwnerId: null,
    });
  });

  it("keeps a copy owner id when one is chosen", () => {
    const ownerId = "7d4b0c1e-2f3a-4b5c-8d6e-9f0a1b2c3d4e";
    const result = gameSchema.safeParse({ ...validGame, copyOwnerId: ownerId });

    expect(result.data?.copyOwnerId).toBe(ownerId);
  });

  it("rejects a blank or too long title", () => {
    const blank = gameSchema.safeParse({ ...validGame, title: "   " });
    const tooLong = gameSchema.safeParse({
      ...validGame,
      title: "a".repeat(101),
    });

    expect(blank.error?.issues[0].message).toBe("Give the game a title.");
    expect(tooLong.success).toBe(false);
  });

  it("rejects player counts outside 1 to 20 or with decimals", () => {
    for (const count of ["0", "21", "2.5", "abc"]) {
      const result = gameSchema.safeParse({ ...validGame, minPlayers: count });
      expect(result.success).toBe(false);
    }
  });

  it("puts the error on max players when it is below min players", () => {
    const result = gameSchema.safeParse({
      ...validGame,
      minPlayers: "5",
      maxPlayers: "3",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["maxPlayers"]);
    expect(result.error?.issues[0].message).toBe(
      "Max players can't be less than min players.",
    );
  });

  it("allows min and max players to be equal", () => {
    const result = gameSchema.safeParse({
      ...validGame,
      minPlayers: "4",
      maxPlayers: "4",
    });
    expect(result.success).toBe(true);
  });

  it("rejects playtimes outside 5 to 600 minutes", () => {
    for (const minutes of ["4", "601", ""]) {
      const result = gameSchema.safeParse({
        ...validGame,
        playtimeMinutes: minutes,
      });
      expect(result.success).toBe(false);
    }
  });

  it("rejects a copy owner that isn't an id", () => {
    const result = gameSchema.safeParse({
      ...validGame,
      copyOwnerId: "someone",
    });
    expect(result.success).toBe(false);
  });
});

describe("gameIdSchema", () => {
  it("accepts an id and rejects anything else", () => {
    expect(
      gameIdSchema.safeParse("7d4b0c1e-2f3a-4b5c-8d6e-9f0a1b2c3d4e").success,
    ).toBe(true);
    expect(gameIdSchema.safeParse("").success).toBe(false);
    expect(gameIdSchema.safeParse("1; drop table games").success).toBe(false);
  });
});
