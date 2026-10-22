"use server";

import { revalidatePath } from "next/cache";
import { idSchema } from "@/features/groups/schemas";
import { getSessionContext } from "@/features/groups/session";
import { type ActionState, getFormText } from "@/lib/forms";
import { toFriendlyRatingError } from "./errors";
import { scoreSchema } from "./schemas";

/** Saves the user's 1–10 rating for a game, replacing any earlier one. */
export async function rateGame(
  previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await getSessionContext();
  const gameId = idSchema.safeParse(getFormText(formData, "gameId"));
  if (!gameId.success) {
    return { error: "Something went wrong. Refresh the page and try again." };
  }
  const score = scoreSchema.safeParse(getFormText(formData, "score"));
  if (!score.success) {
    return { error: score.error.issues[0].message };
  }

  const { error } = await supabase.rpc("rate_game", {
    target_game_id: gameId.data,
    new_score: score.data,
  });
  if (error) {
    console.error("Rating a game failed:", error.message);
    return { error: toFriendlyRatingError(error.message) };
  }

  // The prompt, the shelf and every lineup show ratings, so refresh all of /app.
  revalidatePath("/app", "layout");
  return { success: "Saved." };
}
