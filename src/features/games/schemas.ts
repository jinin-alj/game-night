import { z } from "zod";
import {
  GAME_TITLE_MAX_LENGTH,
  MAX_PLAYERS,
  MAX_PLAYTIME_MINUTES,
  MIN_PLAYERS,
  MIN_PLAYTIME_MINUTES,
} from "./limits";

const playerCountError = "Use a whole number from 1 to 20.";
const playtimeError = "Use a whole number of minutes from 5 to 600.";

const playerCount = z.coerce
  .number({ error: playerCountError })
  .int({ error: playerCountError })
  .min(MIN_PLAYERS, { error: playerCountError })
  .max(MAX_PLAYERS, { error: playerCountError });

export const gameIdSchema = z.uuid();

export const gameSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, { error: "Give the game a title." })
      .max(GAME_TITLE_MAX_LENGTH, { error: "Use 100 characters or fewer." }),
    minPlayers: playerCount,
    maxPlayers: playerCount,
    playtimeMinutes: z.coerce
      .number({ error: playtimeError })
      .int({ error: playtimeError })
      .min(MIN_PLAYTIME_MINUTES, { error: playtimeError })
      .max(MAX_PLAYTIME_MINUTES, { error: playtimeError }),
    // An empty choice in the dropdown means nobody is set as the owner.
    copyOwnerId: z
      .union([z.literal(""), z.uuid()], {
        error: "Pick someone from your group.",
      })
      .transform((value) => (value === "" ? null : value)),
  })
  .refine((game) => game.maxPlayers >= game.minPlayers, {
    error: "Max players can't be less than min players.",
    path: ["maxPlayers"],
  });
