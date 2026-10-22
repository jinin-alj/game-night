"use server";

import { revalidatePath } from "next/cache";
import { getSessionContext } from "@/features/groups/session";
import { getFirstFieldErrors, getFormText } from "@/lib/forms";
import type {
  DeleteGameState,
  GameFormState,
  GameFormValues,
} from "./form-state";
import { newGameValues } from "./form-state";
import { gameIdSchema, gameSchema } from "./schemas";

const noGroupError = "You need a group before you can change the shelf.";
const notFoundError =
  "Couldn't find that game. Refresh the page and try again.";

/** Adds a game to the active group's shelf. */
export async function createGame(
  previousState: GameFormState,
  formData: FormData,
): Promise<GameFormState> {
  const { supabase, activeGroup } = await getSessionContext();
  const values = readGameValues(formData);
  if (!activeGroup) {
    return { values, fieldErrors: {}, formError: noGroupError, saved: false };
  }

  const parsed = gameSchema.safeParse(values);
  if (!parsed.success) {
    return {
      values,
      fieldErrors: getFirstFieldErrors(parsed.error),
      saved: false,
    };
  }

  const { error } = await supabase.from("games").insert({
    group_id: activeGroup.id,
    title: parsed.data.title,
    min_players: parsed.data.minPlayers,
    max_players: parsed.data.maxPlayers,
    playtime_minutes: parsed.data.playtimeMinutes,
    copy_owner_id: parsed.data.copyOwnerId,
  });
  if (error) {
    console.error("Adding a game failed:", error.code);
    return {
      values,
      fieldErrors: {},
      formError: toFriendlyGameError(error.code),
      saved: false,
    };
  }

  revalidatePath("/app/games");
  return { values: newGameValues, fieldErrors: {}, saved: true };
}

/** Saves changes to a game on the active group's shelf. */
export async function updateGame(
  previousState: GameFormState,
  formData: FormData,
): Promise<GameFormState> {
  const { supabase, activeGroup } = await getSessionContext();
  const values = readGameValues(formData);
  if (!activeGroup) {
    return { values, fieldErrors: {}, formError: noGroupError, saved: false };
  }

  const gameId = gameIdSchema.safeParse(getFormText(formData, "gameId"));
  if (!gameId.success) {
    return { values, fieldErrors: {}, formError: notFoundError, saved: false };
  }

  const parsed = gameSchema.safeParse(values);
  if (!parsed.success) {
    return {
      values,
      fieldErrors: getFirstFieldErrors(parsed.error),
      saved: false,
    };
  }

  const { data, error } = await supabase
    .from("games")
    .update({
      title: parsed.data.title,
      min_players: parsed.data.minPlayers,
      max_players: parsed.data.maxPlayers,
      playtime_minutes: parsed.data.playtimeMinutes,
      copy_owner_id: parsed.data.copyOwnerId,
    })
    .eq("id", gameId.data)
    .eq("group_id", activeGroup.id)
    .select("id");
  if (error) {
    console.error("Updating a game failed:", error.code);
    return {
      values,
      fieldErrors: {},
      formError: toFriendlyGameError(error.code),
      saved: false,
    };
  }
  if (data.length === 0) {
    return { values, fieldErrors: {}, formError: notFoundError, saved: false };
  }

  revalidatePath("/app/games");
  return { values, fieldErrors: {}, saved: true };
}

/** Removes a game from the active group's shelf. */
export async function deleteGame(
  previousState: DeleteGameState,
  formData: FormData,
): Promise<DeleteGameState> {
  const { supabase, activeGroup } = await getSessionContext();
  if (!activeGroup) {
    return { formError: noGroupError };
  }

  const gameId = gameIdSchema.safeParse(getFormText(formData, "gameId"));
  if (!gameId.success) {
    return { formError: notFoundError };
  }

  const { data, error } = await supabase
    .from("games")
    .delete()
    .eq("id", gameId.data)
    .eq("group_id", activeGroup.id)
    .select("id");
  if (error) {
    console.error("Deleting a game failed:", error.code);
    return { formError: "Couldn't delete the game. Please try again." };
  }
  if (data.length === 0) {
    return { formError: notFoundError };
  }

  revalidatePath("/app/games");
  return {};
}

function readGameValues(formData: FormData): GameFormValues {
  return {
    title: getFormText(formData, "title"),
    minPlayers: getFormText(formData, "minPlayers"),
    maxPlayers: getFormText(formData, "maxPlayers"),
    playtimeMinutes: getFormText(formData, "playtimeMinutes"),
    copyOwnerId: getFormText(formData, "copyOwnerId"),
  };
}

function toFriendlyGameError(errorCode: string): string {
  // P0001 is the error raised by the check that a copy's owner is in the group.
  if (errorCode === "P0001") {
    return "Pick someone from your group as the copy's owner.";
  }
  return "Couldn't save the game. Please try again.";
}
