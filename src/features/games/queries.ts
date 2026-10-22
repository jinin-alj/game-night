import type { SupabaseClient } from "@supabase/supabase-js";
import type { Game } from "./types";

/** Returns a group's games sorted by title, or null if they can't be read. */
export async function listGames(
  supabase: SupabaseClient,
  groupId: string,
): Promise<Game[] | null> {
  const { data, error } = await supabase
    .from("games")
    .select(
      "id, title, min_players, max_players, playtime_minutes, copy_owner_id",
    )
    .eq("group_id", groupId)
    .order("title")
    .order("created_at");

  if (error) {
    console.error("Could not load the games:", error.code);
    return null;
  }

  const games: Game[] = [];
  for (const row of data) {
    games.push({
      id: row.id,
      title: row.title,
      minPlayers: row.min_players,
      maxPlayers: row.max_players,
      playtimeMinutes: row.playtime_minutes,
      copyOwnerId: row.copy_owner_id,
    });
  }
  return games;
}
