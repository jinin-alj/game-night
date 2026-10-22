"use server";

import { revalidatePath } from "next/cache";
import { idSchema } from "@/features/groups/schemas";
import { getSessionContext } from "@/features/groups/session";
import { getNight } from "@/features/nights/queries";
import { type ActionState, getFormText } from "@/lib/forms";
import { toFriendlyPlayError } from "./errors";

const refreshError = "Something went wrong. Refresh the page and try again.";

/** Logs that a game was played on a night; the database adds the title and checks the date. */
export async function logPlay(
  previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await getSessionContext();
  const nightId = idSchema.safeParse(getFormText(formData, "nightId"));
  const gameId = idSchema.safeParse(getFormText(formData, "gameId"));
  if (!nightId.success) {
    return { error: refreshError };
  }
  if (!gameId.success) {
    return { error: "Pick a game first." };
  }

  const night = await getNight(supabase, nightId.data);
  if (!night) {
    return { error: refreshError };
  }

  const { error } = await supabase.from("plays").insert({
    group_id: night.groupId,
    night_id: night.id,
    game_id: gameId.data,
    // Replaced by the database with the game's real title.
    game_title: "pending",
  });
  if (error) {
    console.error("Logging a play failed:", error.code, error.message);
    return { error: toFriendlyPlayError(error.code, error.message) };
  }

  revalidatePlays(night.id);
  return {};
}

/** Removes a play logged by mistake. */
export async function undoPlay(
  previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await getSessionContext();
  const nightId = idSchema.safeParse(getFormText(formData, "nightId"));
  const playId = idSchema.safeParse(getFormText(formData, "playId"));
  if (!nightId.success || !playId.success) {
    return { error: refreshError };
  }

  const { data, error } = await supabase
    .from("plays")
    .delete()
    .eq("id", playId.data)
    .eq("night_id", nightId.data)
    .select("id");
  if (error) {
    console.error("Undoing a play failed:", error.code);
    return { error: "Couldn’t undo. Please try again." };
  }
  if (data.length === 0) {
    return { error: refreshError };
  }

  revalidatePlays(nightId.data);
  return {};
}

function revalidatePlays(nightId: string) {
  revalidatePath(`/app/nights/${nightId}`);
  revalidatePath("/app/games");
}
