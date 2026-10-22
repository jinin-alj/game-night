import {
  DEFAULT_MAX_PLAYERS,
  DEFAULT_MIN_PLAYERS,
  DEFAULT_PLAYTIME_MINUTES,
} from "./limits";
import type { Game } from "./types";

export type GameFormValues = {
  title: string;
  minPlayers: string;
  maxPlayers: string;
  playtimeMinutes: string;
  copyOwnerId: string;
};

export type GameFormState = {
  values: GameFormValues;
  fieldErrors: Partial<Record<keyof GameFormValues, string>>;
  formError?: string;
  saved: boolean;
};

export type DeleteGameState = {
  formError?: string;
};

export const newGameValues: GameFormValues = {
  title: "",
  minPlayers: String(DEFAULT_MIN_PLAYERS),
  maxPlayers: String(DEFAULT_MAX_PLAYERS),
  playtimeMinutes: String(DEFAULT_PLAYTIME_MINUTES),
  copyOwnerId: "",
};

/** Turns a saved game into the text values its edit form starts with. */
export function toGameFormValues(game: Game): GameFormValues {
  return {
    title: game.title,
    minPlayers: String(game.minPlayers),
    maxPlayers: String(game.maxPlayers),
    playtimeMinutes: String(game.playtimeMinutes),
    copyOwnerId: game.copyOwnerId ?? "",
  };
}
